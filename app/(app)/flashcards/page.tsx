import Link from "next/link";
import { Layers3 } from "lucide-react";
import { Button, Card } from "@/components/ui";
import { createClient } from "@/lib/supabase/server";
import { FlashcardsClient } from "@/components/flashcards-client";
import type { Flashcard } from "@/lib/types";
export const dynamic = "force-dynamic";
export default async function FlashcardsPage({
  searchParams,
}: {
  searchParams: Promise<{ set?: string }>;
}) {
  const { set } = await searchParams;
  const supabase = await createClient();
  let setId = set;
  if (!setId) {
    const { data } = await supabase
      .from("study_sets")
      .select("id")
      .eq("status", "ready")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    setId = data?.id;
  }
  if (!setId) return <Empty />;
  const [{ data: studySet }, { data: cards }] = await Promise.all([
    supabase.from("study_sets").select("id,title").eq("id", setId).single(),
    supabase
      .from("flashcards")
      .select("*")
      .eq("study_set_id", setId)
      .order("created_at"),
  ]);
  if (!studySet || !cards?.length) return <Empty />;
  return <FlashcardsClient studySet={studySet} cards={cards as Flashcard[]} />;
}
function Empty() {
  return (
    <Card className="mx-auto max-w-xl p-8 text-center">
      <Layers3 className="mx-auto text-brand" />
      <h1 className="mt-4 text-xl font-semibold">
        No flashcards are ready yet
      </h1>
      <p className="mt-2 text-sm text-muted">
        Create a study set to generate active-recall flashcards.
      </p>
      <Button asChild className="mt-5">
        <Link href="/upload">Upload PDF</Link>
      </Button>
    </Card>
  );
}
