import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data, setError } = await (async () => {
    const result = await supabase
      .from("study_sets")
      .select("file_url")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();
    return { data: result.data, setError: result.error };
  })();
  if (setError || !data)
    return NextResponse.json(
      { error: "Study set not found." },
      { status: 404 },
    );
  const { error } = await supabase
    .from("study_sets")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  if (data.file_url) {
    await supabase.storage.from("study-pdfs").remove([data.file_url]);
  }
  return NextResponse.json({ ok: true });
}
