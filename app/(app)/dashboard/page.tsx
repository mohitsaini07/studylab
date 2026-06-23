import Link from "next/link";
import { BookOpen, Clock3, FileUp, Flame, Play, Target } from "lucide-react";
import { Button, Card, PageHeader, Progress } from "@/components/ui";
import { createClient } from "@/lib/supabase/server";
import { StudySetRow } from "@/components/study-set-row";
import type { StudySet } from "@/lib/types";
import { getFirstName } from "@/lib/profile";
export const dynamic = "force-dynamic";
export default async function Dashboard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const [{ data: sets }, { data: attempts }, { data: reviews }] =
    await Promise.all([
      supabase
        .from("study_sets")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase
        .from("quiz_attempts")
        .select("score,total_questions,created_at")
        .order("created_at", { ascending: false }),
      supabase.from("flashcard_reviews").select("reviewed_count,created_at"),
    ]);
  const studySets = (sets ?? []) as StudySet[];
  const quiz = attempts ?? [];
  const accuracy = quiz.length
    ? Math.round(
        (quiz.reduce((n, a) => n + a.score / a.total_questions, 0) /
          quiz.length) *
          100,
      )
    : 0;
  const reviewed = (reviews ?? []).reduce((n, r) => n + r.reviewed_count, 0);
  const firstName = getFirstName(null, user?.user_metadata, "Learner");
  const ready = studySets.find((s) => s.status === "ready");
  return (
    <>
      <PageHeader
        eyebrow={new Intl.DateTimeFormat("en", {
          weekday: "long",
          month: "long",
          day: "numeric",
        }).format(new Date())}
        title={`Good to see you, ${firstName}`}
        description={
          studySets.length
            ? "You’re building a strong study library. Keep the momentum going with a focused review today."
            : "Upload your first PDF to create summaries, quizzes, and flashcards."
        }
        actions={
          <Button asChild>
            <Link href="/upload">
              <FileUp size={16} />
              Upload PDF
            </Link>
          </Button>
        }
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <Metric
          icon={Flame}
          value={String(studySets.length)}
          label="Study sets created"
          meta="Your library"
        />
        <Metric
          icon={Clock3}
          value={String(reviewed)}
          label="Flashcards reviewed"
          meta="All time"
        />
        <Metric
          icon={Target}
          value={`${accuracy}%`}
          label="Average quiz score"
          meta={`${quiz.length} attempt${quiz.length === 1 ? "" : "s"}`}
        />
      </div>
      <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_340px]">
        <section>
          <div className="mb-4 flex items-center justify-between">
            <div className="min-w-0">
              <h2 className="text-lg font-semibold">Recent study sets</h2>
              <p className="mt-1 text-sm text-muted">
                Pick up where you left off
              </p>
            </div>
          </div>
          {studySets.length ? (
            <div className="space-y-3">
              {studySets.map((set) => (
                <StudySetRow key={set.id} studySet={set} />
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <div className="mx-auto grid h-11 w-11 place-items-center rounded-xl bg-brand-soft text-brand">
                <BookOpen size={20} />
              </div>
              <h3 className="mt-4 font-semibold">
                Your study library is empty
              </h3>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted">
                Upload a text-based PDF and StudyLab will build your first
                complete study set.
              </p>
              <Button asChild className="mt-5">
                <Link href="/upload">Upload your first PDF</Link>
              </Button>
            </Card>
          )}
        </section>
        <aside>
          <Card className="overflow-hidden">
            <div className="border-b border-border p-5">
              <p className="text-sm font-semibold">Today’s focus</p>
              <p className="mt-1 text-xs text-muted">
                Recommended from your library
              </p>
            </div>
            <div className="p-5">
              {ready ? (
                <>
                  <span className="text-xs font-medium text-brand">
                    READY TO REVIEW
                  </span>
                  <h3 className="mt-2 break-words text-lg font-semibold">
                    {ready.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-muted">
                    Review the generated flashcards, then test recall with a
                    focused quiz.
                  </p>
                  <div className="mt-5 flex items-center gap-2 text-xs text-muted">
                    <BookOpen size={14} />
                    {ready.page_count} source pages
                  </div>
                  <Button asChild className="mt-5 w-full">
                    <Link href={`/flashcards?set=${ready.id}`}>
                      <Play size={15} />
                      Start review
                    </Link>
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-sm leading-6 text-muted">
                    Once a study set is ready, your next recommended review will
                    appear here.
                  </p>
                  <Button asChild className="mt-5 w-full">
                    <Link href="/upload">Create study set</Link>
                  </Button>
                </>
              )}
            </div>
          </Card>
          <Card className="mt-4 p-5">
            <h3 className="text-sm font-semibold">Learning activity</h3>
            <p className="mt-2 text-xs leading-5 text-muted">
              {quiz.length
                ? `${quiz.length} quizzes completed with ${accuracy}% average accuracy.`
                : "Complete a quiz to begin tracking accuracy."}
            </p>
            <Progress value={accuracy} className="mt-4" />
          </Card>
        </aside>
      </div>
    </>
  );
}
function Metric({
  icon: Icon,
  value,
  label,
  meta,
}: {
  icon: typeof Flame;
  value: string;
  label: string;
  meta: string;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between gap-3">
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-soft text-brand">
          <Icon size={18} />
        </span>
        <span className="min-w-0 truncate text-xs text-muted">{meta}</span>
      </div>
      <p className="mt-5 break-words text-2xl font-semibold">{value}</p>
      <p className="mt-1 break-words text-sm text-muted">{label}</p>
    </Card>
  );
}
