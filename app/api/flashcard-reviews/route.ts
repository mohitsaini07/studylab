import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
const schema = z
  .object({
    studySetId: z.string().uuid(),
    reviewedCount: z.number().int().nonnegative(),
    knownCount: z.number().int().nonnegative(),
    completed: z.boolean(),
  })
  .refine((x) => x.knownCount <= x.reviewedCount);
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success)
    return NextResponse.json({ error: "Invalid review." }, { status: 400 });
  const { error } = await supabase
    .from("flashcard_reviews")
    .insert({
      user_id: user.id,
      study_set_id: parsed.data.studySetId,
      reviewed_count: parsed.data.reviewedCount,
      known_count: parsed.data.knownCount,
      completed: parsed.data.completed,
    });
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
