import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
const schema = z.object({
  daily_reminder: z.boolean(),
  weekly_report: z.boolean(),
  study_set_ready: z.boolean(),
  product_updates: z.boolean(),
  compact_sidebar: z.boolean(),
  reduce_motion: z.boolean(),
  keep_pdfs: z.boolean(),
  learning_analytics: z.boolean(),
});
export async function PUT(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success)
    return NextResponse.json(
      { error: "Invalid preferences." },
      { status: 400 },
    );
  const { error } = await supabase
    .from("user_settings")
    .upsert({
      user_id: user.id,
      ...parsed.data,
      updated_at: new Date().toISOString(),
    });
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
