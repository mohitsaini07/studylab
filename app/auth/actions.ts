"use server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
const credentials = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters."),
});
const signupCredentials = credentials.extend({
  firstName: z.string().trim().min(1, "Enter your first name.").max(80),
  lastName: z.string().trim().min(1, "Enter your last name.").max(80),
});
export type AuthState = { error?: string; success?: string };
export async function signIn(
  _: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = credentials.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { error: error.message };
  redirect("/dashboard");
}
export async function signUp(
  _: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = signupCredentials.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const supabase = await createClient();
  const origin = (await headers()).get("origin") || "http://localhost:3000";
  const fullName = `${parsed.data.firstName} ${parsed.data.lastName}`.trim();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      data: {
        first_name: parsed.data.firstName,
        last_name: parsed.data.lastName,
        full_name: fullName,
        name: fullName,
      },
    },
  });
  if (error) return { error: error.message };
  if (data.session) redirect("/dashboard");
  return { success: "Check your email to confirm your account, then sign in." };
}
export async function signInWithGoogle() {
  const supabase = await createClient();
  const origin = (await headers()).get("origin") || "http://localhost:3000";
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback?next=/dashboard`,
      queryParams: {
        access_type: "offline",
        prompt: "select_account",
      },
    },
  });
  if (error || !data.url) redirect("/login?error=google_oauth_failed");
  redirect(data.url);
}
export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
