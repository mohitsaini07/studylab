import { z } from "zod";
const serverSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  GEMINI_API_KEY: z.string().min(1),
  GEMINI_MODEL: z.string().default("gemini-2.5-flash-lite"),
});
export function getServerEnv() {
  const parsed = serverSchema.safeParse(process.env);
  if (!parsed.success)
    throw new Error(
      "StudyLab is not configured. Copy .env.example to .env.local and add your Supabase and Gemini credentials.",
    );
  return parsed.data;
}
export function hasSupabaseEnv() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
}
