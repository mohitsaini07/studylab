import Link from "next/link";
import { BookOpen } from "lucide-react";
import { Button, Card } from "@/components/ui";
import { createClient } from "@/lib/supabase/server";
import { QuizClient } from "@/components/quiz-client";
import type { Question } from "@/lib/types";
export const dynamic = "force-dynamic";
export default async function QuizPage({
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
  const [{ data: studySet }, { data: questions }] = await Promise.all([
    supabase.from("study_sets").select("id,title").eq("id", setId).single(),
    supabase
      .from("questions")
      .select("*")
      .eq("study_set_id", setId)
      .eq("type", "mcq")
      .order("created_at"),
  ]);
  if (!studySet || !questions?.length) return <Empty />;
  return <QuizClient studySet={studySet} questions={questions as Question[]} />;
}
function Empty() {
  return (
    <Card className="mx-auto max-w-xl p-8 text-center">
      <BookOpen className="mx-auto text-brand" />
      <h1 className="mt-4 text-xl font-semibold">No quiz is ready yet</h1>
      <p className="mt-2 text-sm text-muted">
        Create a study set from a PDF to generate your first quiz.
      </p>
      <Button asChild className="mt-5">
        <Link href="/upload">Upload PDF</Link>
      </Button>
    </Card>
  );
}
