import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
const bodySchema = z
  .object({
    studySetId: z.string().uuid(),
    score: z.number().int().nonnegative(),
    totalQuestions: z.number().int().positive(),
    weakTopics: z.array(z.string()).max(30),
  })
  .refine((x) => x.score <= x.totalQuestions);
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success)
    return NextResponse.json(
      { error: "Invalid quiz result." },
      { status: 400 },
    );
  const { error } = await supabase
    .from("quiz_attempts")
    .insert({
      user_id: user.id,
      study_set_id: parsed.data.studySetId,
      score: parsed.data.score,
      total_questions: parsed.data.totalQuestions,
      weak_topics: parsed.data.weakTopics,
    });
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
