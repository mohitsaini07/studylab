import { NextResponse } from "next/server";
import { z } from "zod";
import { generateStudyMaterial } from "@/lib/ai";
import { extractPdfText } from "@/lib/pdf";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_SIZE = 25 * 1024 * 1024;

const difficultySchema = z
  .enum(["Foundational", "Balanced", "Advanced"])
  .catch("Balanced");

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

const directUploadSchema = z.object({
  storagePath: z.string().min(1),
  fileName: z.string().min(1),
  fileSize: z.number().int().positive().max(MAX_SIZE),
  contentType: z.string().optional(),
  difficulty: difficultySchema,
  options: generationOptionsSchema,
});

type GenerationInput = {
  buffer: ArrayBuffer;
  storagePath: string;
  fileName: string;
  difficulty: z.infer<typeof difficultySchema>;
  options: z.infer<typeof generationOptionsSchema>;
};

async function getVerifiedUser(supabase: ReturnType<typeof createAdminClient>) {
  const bearer = (await import("next/headers"))
    .headers()
    .then((headers) =>
      headers.get("authorization")?.replace(/^Bearer\s+/i, ""),
    );
  const token = await bearer;
  const authResult = token
    ? await supabase.auth.getUser(token)
    : await (await createClient()).auth.getUser();

  return authResult.data.user;
}

function validatePdfFileName(fileName: string, contentType?: string) {
  if (
    contentType !== "application/pdf" &&
    !fileName.toLowerCase().endsWith(".pdf")
  ) {
    throw new Error("Only PDF files are supported.");
  }
}

async function readRequestInput(
  request: Request,
  userId: string,
  supabase: ReturnType<typeof createAdminClient>,
): Promise<GenerationInput> {
  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    const parsed = directUploadSchema.parse(await request.json());
    validatePdfFileName(parsed.fileName, parsed.contentType);

    if (!parsed.storagePath.startsWith(`${userId}/`)) {
      throw new Error("Uploaded file does not belong to this account.");
    }

    const { data, error } = await supabase.storage
      .from("study-pdfs")
      .download(parsed.storagePath);

    if (error || !data) {
      throw new Error(`Could not read uploaded PDF: ${error?.message}`);
    }

    const buffer = await data.arrayBuffer();
    if (buffer.byteLength === 0 || buffer.byteLength > MAX_SIZE) {
      throw new Error("PDF must be between 1 byte and 25 MB.");
    }

    return {
      buffer,
      storagePath: parsed.storagePath,
      fileName: parsed.fileName,
      difficulty: parsed.difficulty,
      options: parsed.options,
    };
  }

  const form = await request.formData();
  const file = form.get("file");
  const difficulty = difficultySchema.parse(form.get("difficulty"));
  const options = generationOptionsSchema.parse(
    JSON.parse(
      String(
        form.get("options") ||
          '{"summary":true,"topics":true,"questions":true,"flashcards":true}',
      ),
    ),
  );

  if (!(file instanceof File)) {
    throw new Error("Choose a PDF to upload.");
  }

  validatePdfFileName(file.name, file.type);

  if (file.size === 0 || file.size > MAX_SIZE) {
    throw new Error("PDF must be between 1 byte and 25 MB.");
  }

  const buffer = await file.arrayBuffer();
  const storagePath = `${userId}/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`;
  const { error: uploadError } = await supabase.storage
    .from("study-pdfs")
    .upload(storagePath, buffer, {
      contentType: "application/pdf",
      upsert: false,
    });

  if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

  return {
    buffer,
    storagePath,
    fileName: file.name,
    difficulty,
    options,
  };
}

export async function POST(request: Request) {
  const supabase = createAdminClient();
  const user = await getVerifiedUser(supabase);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
    const input = await readRequestInput(request, user.id, supabase);
    storagePath = input.storagePath;

    stage = "database insert";
    const { data: created, error: createError } = await supabase
      .from("study_sets")
      .insert({
        user_id: user.id,
        title: input.fileName.replace(/\.pdf$/i, ""),
        file_name: input.fileName,
        file_url: input.storagePath,
        status: "processing",
      })
      .select("id")
      .single();

    if (createError) throw new Error(createError.message);
    studySetId = created.id;

    stage = "PDF extraction";
    const { text, pageCount } = await extractPdfText(input.buffer);

    stage = "Gemini generation";
    const generated = await generateStudyMaterial(
      text,
      input.difficulty,
      input.options,
    );

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
      ? await supabase.from("questions").insert(
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
      ? await supabase.from("flashcards").insert(
          generated.flashcards.map((card) => ({
            study_set_id: studySetId,
            ...card,
          })),
        )
      : { error: null };

    if (questionResult.error || cardResult.error) {
      throw new Error(
        questionResult.error?.message || cardResult.error?.message,
      );
    }

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

    if (studySetId) {
      await supabase
        .from("study_sets")
        .update({ status: "failed", error_message: message })
        .eq("id", studySetId);
    } else if (storagePath) {
      await supabase.storage.from("study-pdfs").remove([storagePath]);
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
