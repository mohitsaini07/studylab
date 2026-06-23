import { NextResponse } from "next/server";
import { z } from "zod";
import { extractTextFromImage, generateStudyMaterial } from "@/lib/ai";
import { extractPdfText } from "@/lib/pdf";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_PDF_SIZE = 25 * 1024 * 1024;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"] as const;
type SourceType = "pdf" | "image";
type SupportedContentType = "application/pdf" | (typeof IMAGE_TYPES)[number];

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
  fileSize: z.number().int().positive(),
  contentType: z.string().min(1),
  difficulty: difficultySchema,
  options: generationOptionsSchema,
});

type GenerationInput = {
  buffer: ArrayBuffer;
  storagePath: string;
  fileName: string;
  contentType: string;
  sourceType: SourceType;
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

function getImageContentType(fileName: string) {
  const lowerName = fileName.toLowerCase();

  if (lowerName.endsWith(".png")) return "image/png";
  if (lowerName.endsWith(".webp")) return "image/webp";
  if (/\.(jpe?g)$/i.test(lowerName)) return "image/jpeg";
  return null;
}

function getSupportedContentType(
  fileName: string,
  contentType?: string,
): SupportedContentType {
  const lowerName = fileName.toLowerCase();

  if (
    contentType === "application/pdf" ||
    lowerName.endsWith(".pdf")
  ) {
    return "application/pdf";
  }

  if (
    contentType &&
    (IMAGE_TYPES as readonly string[]).includes(contentType)
  ) {
    return contentType as SupportedContentType;
  }

  const imageContentType = getImageContentType(fileName);
  if (imageContentType) {
    return imageContentType as SupportedContentType;
  }

  throw new Error("Only PDF, PNG, JPG, and WebP files are supported.");
}

function getSourceType(fileName: string, contentType?: string): SourceType {
  return getSupportedContentType(fileName, contentType) === "application/pdf"
    ? "pdf"
    : "image";
}

function validateFileSize(size: number, sourceType: SourceType) {
  const max = sourceType === "pdf" ? MAX_PDF_SIZE : MAX_IMAGE_SIZE;
  const label = sourceType === "pdf" ? "PDF" : "Image";

  if (size === 0 || size > max) {
    throw new Error(
      `${label} must be between 1 byte and ${sourceType === "pdf" ? "25 MB" : "5 MB"}.`,
    );
  }
}

async function cleanupSourceFile(
  supabase: ReturnType<typeof createAdminClient>,
  studySetId: string,
  storagePath: string,
) {
  const { error: removeError } = await supabase.storage
    .from("study-pdfs")
    .remove([storagePath]);

  if (removeError) {
    console.warn("Source file cleanup failed", {
      studySetId,
      storagePath,
      error: removeError.message,
    });
    return false;
  }

  const { error: updateError } = await supabase
    .from("study_sets")
    .update({ file_url: "" })
    .eq("id", studySetId);

  if (updateError) {
    console.warn("Source file cleanup marker update failed", {
      studySetId,
      error: updateError.message,
    });
  }

  return true;
}

async function readRequestInput(
  request: Request,
  userId: string,
  supabase: ReturnType<typeof createAdminClient>,
): Promise<GenerationInput> {
  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    const parsed = directUploadSchema.parse(await request.json());
    const normalizedContentType = getSupportedContentType(
      parsed.fileName,
      parsed.contentType,
    );
    const sourceType = getSourceType(parsed.fileName, normalizedContentType);
    validateFileSize(parsed.fileSize, sourceType);

    if (!parsed.storagePath.startsWith(`${userId}/`)) {
      throw new Error("Uploaded file does not belong to this account.");
    }

    const { data, error } = await supabase.storage
      .from("study-pdfs")
      .download(parsed.storagePath);

    if (error || !data) {
      throw new Error(`Could not read uploaded file: ${error?.message}`);
    }

    const buffer = await data.arrayBuffer();
    validateFileSize(buffer.byteLength, sourceType);

    return {
      buffer,
      storagePath: parsed.storagePath,
      fileName: parsed.fileName,
      contentType: normalizedContentType,
      sourceType,
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
    throw new Error("Choose a PDF or image to upload.");
  }

  const normalizedContentType = getSupportedContentType(file.name, file.type);
  const sourceType = getSourceType(file.name, normalizedContentType);
  validateFileSize(file.size, sourceType);

  const buffer = await file.arrayBuffer();
  const storagePath = `${userId}/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`;
  const { error: uploadError } = await supabase.storage
    .from("study-pdfs")
    .upload(storagePath, buffer, {
      contentType: normalizedContentType,
      upsert: false,
    });

  if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

  return {
    buffer,
    storagePath,
    fileName: file.name,
    contentType: normalizedContentType,
    sourceType,
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
        title: input.fileName.replace(/\.(pdf|png|jpe?g|webp)$/i, ""),
        file_name: input.fileName,
        file_url: input.storagePath,
        status: "processing",
      })
      .select("id")
      .single();

    if (createError) throw new Error(createError.message);
    studySetId = created.id;
    const createdStudySetId = created.id;

    stage = input.sourceType === "pdf" ? "PDF extraction" : "image OCR";
    const { text, pageCount } =
      input.sourceType === "pdf"
        ? await extractPdfText(input.buffer)
        : {
            text: await extractTextFromImage(input.buffer, input.contentType),
            pageCount: 1,
          };

    stage = "source cleanup";
    const cleanedUp = await cleanupSourceFile(
      supabase,
      createdStudySetId,
      input.storagePath,
    );
    if (cleanedUp) storagePath = undefined;

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
        file_url: cleanedUp ? "" : input.storagePath,
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
