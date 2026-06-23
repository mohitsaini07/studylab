import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import { getServerEnv } from "@/lib/env";
import type { GeneratedStudySet, GenerationOptions } from "@/lib/types";

const topic = z.union([
  z
    .string()
    .min(2)
    .transform((title) => ({
      title,
      description: `Key concepts and applications of ${title}.`,
    })),
  z.object({ title: z.string().min(2), description: z.string().min(2) }),
]);
const questionType = z.preprocess(
  (value) =>
    value === "multiple_choice" || value === "multiple-choice"
      ? "mcq"
      : value === "short_answer" || value === "short-answer"
        ? "short"
        : value === "long_answer" || value === "long-answer"
          ? "long"
          : value,
  z.enum(["mcq", "short", "long"]),
);
const question = z.object({
  type: questionType,
  question: z.string().min(5),
  answer: z.string().min(1),
  options: z.array(z.string()).max(4).optional(),
  topic: z.string().min(2).default("General"),
  explanation: z
    .string()
    .min(2)
    .default("Review the source material for this concept."),
});
const card = z.object({
  front: z.string().min(3),
  back: z.string().min(3),
  topic: z.string().min(2).default("General"),
});
export const generatedStudySetSchema = z
  .object({
    title: z.string().min(2).max(180).default("Generated Study Set"),
    summary: z.string().default(""),
    topics: z.array(topic).default([]),
    questions: z.array(question).default([]),
    flashcards: z.array(card).default([]),
  })
  .superRefine((value, ctx) => {
    value.questions.forEach((q, index) => {
      if (q.type === "mcq" && (!q.options || q.options.length !== 4)) {
        ctx.addIssue({
          code: "custom",
          path: ["questions", index, "options"],
          message: "MCQs require exactly four options",
        });
      }
      if (q.type === "mcq" && q.options && !q.options.includes(q.answer)) {
        ctx.addIssue({
          code: "custom",
          path: ["questions", index, "answer"],
          message: "MCQ answer must match an option",
        });
      }
    });
  });

export async function generateStudyMaterial(
  text: string,
  difficulty: string,
  options: GenerationOptions,
): Promise<GeneratedStudySet> {
  const env = getServerEnv();
  const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
  const source = text.slice(0, 120_000);
  const requested = [
    options.summary ? "a detailed chapter summary" : "",
    options.topics
      ? '8-12 important topics as objects shaped {"title": string, "description": string}'
      : "",
    options.questions
      ? '12 MCQs, 6 short-answer questions, and 4 long-answer questions shaped {"type": "mcq" | "short" | "long", "question": string, "answer": string, "options": string[] for MCQs, "topic": string, "explanation": string}'
      : "",
    options.flashcards
      ? '20 flashcards shaped {"front": string, "back": string, "topic": string}'
      : "",
  ]
    .filter(Boolean)
    .join(", ");
  const prompt = `You are StudyLab, an expert instructional designer. Create accurate study material using ONLY the supplied PDF text. Difficulty: ${difficulty}. Return one JSON object with a concise "title" and only the requested learning sections: ${requested}. Use the top-level keys "summary", "topics", "questions", and "flashcards" for requested sections; omit unrequested sections. Every MCQ must contain exactly four unique options and its answer must exactly match one option. Do not mention the prompt or PDF extraction.\n\nPDF TEXT:\n${source}`;
  try {
    const response = await ai.models.generateContent({
      model: env.GEMINI_MODEL,
      contents: prompt,
      config: { temperature: 0.25, responseMimeType: "application/json" },
    });
    if (!response.text) throw new Error("Gemini returned an empty response.");
    const raw = JSON.parse(response.text) as Record<string, unknown>;
    if (!options.summary) raw.summary = "";
    if (!options.topics) raw.topics = [];
    if (!options.questions) raw.questions = [];
    if (!options.flashcards) raw.flashcards = [];
    const parsed = generatedStudySetSchema.parse(raw);
    if (options.summary && parsed.summary.length < 50)
      throw new Error("Gemini did not return the requested summary.");
    if (options.topics && !parsed.topics.length)
      throw new Error("Gemini did not return the requested topics.");
    if (options.questions && !parsed.questions.length)
      throw new Error("Gemini did not return the requested questions.");
    if (options.flashcards && !parsed.flashcards.length)
      throw new Error("Gemini did not return the requested flashcards.");
    return parsed;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (
      message.includes("API_KEY_INVALID") ||
      message.includes("API key not valid")
    )
      throw new Error(
        "The Gemini API key is invalid. Create a key in Google AI Studio and update GEMINI_API_KEY in .env.local.",
      );
    if (message.includes("404") || message.includes("NOT_FOUND"))
      throw new Error(
        `Gemini model “${env.GEMINI_MODEL}” is unavailable. Set GEMINI_MODEL=gemini-2.5-flash-lite.`,
      );
    if (error instanceof z.ZodError) {
      const issue = error.issues[0];
      throw new Error(
        `Gemini returned incomplete study material at ${issue?.path.join(".") || "response"}: ${issue?.message || "validation failed"}`,
      );
    }
    throw new Error(`Gemini generation failed: ${message.slice(0, 300)}`);
  }
}
