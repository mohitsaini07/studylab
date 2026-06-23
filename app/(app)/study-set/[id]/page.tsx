import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { StudySetView } from "@/components/study-set-view";
import type { Flashcard, Question, StudySet } from "@/lib/types";
export const dynamic = "force-dynamic";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const [{ data: set }, { data: questions }, { data: cards }] =
    await Promise.all([
      supabase.from("study_sets").select("*").eq("id", id).single(),
      supabase
        .from("questions")
        .select("*")
        .eq("study_set_id", id)
        .order("created_at"),
      supabase
        .from("flashcards")
        .select("*")
        .eq("study_set_id", id)
        .order("created_at"),
    ]);
  if (!set) notFound();
  let downloadUrl: string | undefined;
  if (set.file_url) {
    const { data } = await supabase.storage
      .from("study-pdfs")
      .createSignedUrl(set.file_url, 300);
    downloadUrl = data?.signedUrl;
  }
  return (
    <StudySetView
      studySet={set as StudySet}
      questions={(questions ?? []) as Question[]}
      flashcards={(cards ?? []) as Flashcard[]}
      downloadUrl={downloadUrl}
    />
  );
}
