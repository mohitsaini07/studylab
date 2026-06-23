import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { extractPdfText } from "@/lib/pdf";
import { generateStudyMaterial } from "@/lib/ai";
export const runtime = "nodejs";
export const maxDuration = 60;
const MAX_SIZE = 25 * 1024 * 1024;
const generationOptionsSchema = z
  .object({
    summary: z.boolean(),
    topics: z.boolean(),
    questions: z.boolean(),
    flashcards: z.boolean(),
  })
  .refine(
    (value) => Object.values(value).some(Boolean),
    "Choose at least one item to generate.",
  );
export async function POST(request: Request) {
  const supabase = createAdminClient();
  const bearer = request.headers
    .get("authorization")
    ?.replace(/^Bearer\s+/i, "");
  const authResult = bearer
    ? await supabase.auth.getUser(bearer)
    : await (await createClient()).auth.getUser();
  const user = authResult.data.user;
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { error: schemaError } = await supabase
    .from("study_sets")
    .select("id")
    .limit(1);
  if (schemaError) {
    const missing =
      schemaError.code === "PGRST205" ||
      schemaError.message.includes("schema cache");
    return NextResponse.json(
      {
        error: missing
          ? "StudyLab database is not initialized. Run supabase/schema.sql in the Supabase SQL Editor, then retry."
          : `Database check failed: ${schemaError.message}`,
      },
      { status: 503 },
    );
  }
  let studySetId: string | undefined;
  let storagePath: string | undefined;
  let stage = "validation";
  try {
    const form = await request.formData();
    const file = form.get("file");
    const difficulty = z
      .enum(["Foundational", "Balanced", "Advanced"])
      .catch("Balanced")
      .parse(form.get("difficulty"));
    const options = generationOptionsSchema.parse(
      JSON.parse(
        String(
          form.get("options") ||
            '{"summary":true,"topics":true,"questions":true,"flashcards":true}',
        ),
      ),
    );
    if (!(file instanceof File))
      return NextResponse.json(
        { error: "Choose a PDF to upload." },
        { status: 400 },
      );
    if (
      file.type !== "application/pdf" &&
      !file.name.toLowerCase().endsWith(".pdf")
    )
      return NextResponse.json(
        { error: "Only PDF files are supported." },
        { status: 400 },
      );
    if (file.size === 0 || file.size > MAX_SIZE)
      return NextResponse.json(
        { error: "PDF must be between 1 byte and 25 MB." },
        { status: 400 },
      );
    const buffer = await file.arrayBuffer();
    storagePath = `${user.id}/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`;
    stage = "upload";
    const { error: uploadError } = await supabase.storage
      .from("study-pdfs")
      .upload(storagePath, buffer, {
        contentType: "application/pdf",
        upsert: false,
      });
    if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);
    stage = "database insert";
    const { data: created, error: createError } = await supabase
      .from("study_sets")
      .insert({
        user_id: user.id,
        title: file.name.replace(/\.pdf$/i, ""),
        file_name: file.name,
        file_url: storagePath,
        status: "processing",
      })
      .select("id")
      .single();
    if (createError) throw new Error(createError.message);
    studySetId = created.id;
    stage = "PDF extraction";
    const { text, pageCount } = await extractPdfText(buffer);
    stage = "Gemini generation";
    const generated = await generateStudyMaterial(text, difficulty, options);
    stage = "database save";
    const { error: updateError } = await supabase
      .from("study_sets")
      .update({
        title: generated.title,
        summary: generated.summary,
        topics: generated.topics,
        page_count: pageCount,
        status: "ready",
        error_message: null,
      })
      .eq("id", studySetId);
    if (updateError) throw new Error(updateError.message);
    const questionResult = generated.questions.length
      ? await supabase
          .from("questions")
          .insert(
            generated.questions.map((q) => ({
              study_set_id: studySetId,
              type: q.type,
              question: q.question,
              answer: q.answer,
              options: q.options ?? null,
              topic: q.topic,
              explanation: q.explanation,
            })),
          )
      : { error: null };
    const cardResult = generated.flashcards.length
      ? await supabase
          .from("flashcards")
          .insert(
            generated.flashcards.map((c) => ({
              study_set_id: studySetId,
              ...c,
            })),
          )
      : { error: null };
    if (questionResult.error || cardResult.error)
      throw new Error(
        questionResult.error?.message || cardResult.error?.message,
      );
    return NextResponse.json({
      id: studySetId,
      summary: Boolean(generated.summary),
      topics: generated.topics.length,
      questions: generated.questions.length,
      flashcards: generated.flashcards.length,
    });
  } catch (error) {
    const detail =
      error instanceof Error ? error.message : "Study set generation failed.";
    const message = `${stage} failed: ${detail}`;
    console.error("Study set generation error", {
      stage,
      userId: user.id,
      error: detail,
    });
    if (studySetId)
      await supabase
        .from("study_sets")
        .update({ status: "failed", error_message: message })
        .eq("id", studySetId);
    else if (storagePath)
      await supabase.storage.from("study-pdfs").remove([storagePath]);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
