import Link from "next/link";
import {
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Download,
  Target,
  TrendingUp,
} from "lucide-react";
import { Badge, Button, Card, PageHeader, Progress } from "@/components/ui";
import { createClient } from "@/lib/supabase/server";
export const dynamic = "force-dynamic";
export default async function Report() {
  const supabase = await createClient();
  const start = new Date();
  start.setDate(start.getDate() - 6);
  start.setHours(0, 0, 0, 0);
  const [
    { count: pdfs },
    { count: questionCount },
    { data: attempts },
    { data: reviews },
  ] = await Promise.all([
    supabase.from("study_sets").select("id", { count: "exact", head: true }),
    supabase
      .from("questions")
      .select("id,study_sets!inner(user_id)", { count: "exact", head: true }),
    supabase
      .from("quiz_attempts")
      .select("score,total_questions,weak_topics,created_at")
      .order("created_at", { ascending: false }),
    supabase.from("flashcard_reviews").select("reviewed_count,created_at"),
  ]);
  const quiz = attempts ?? [];
  const flash = reviews ?? [];
  const accuracy = quiz.length
    ? Math.round(
        (quiz.reduce((n, a) => n + a.score / a.total_questions, 0) /
          quiz.length) *
          100,
      )
    : 0;
  const reviewed = flash.reduce((n, r) => n + r.reviewed_count, 0);
  const weakCounts = new Map<string, number>();
  quiz.forEach((a) =>
    (a.weak_topics as string[]).forEach((t) =>
      weakCounts.set(t, (weakCounts.get(t) || 0) + 1),
    ),
  );
  const weak = [...weakCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);
  const dayValues = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    const key = d.toDateString();
    return (
      quiz.filter((x) => new Date(x.created_at).toDateString() === key).length +
      flash.filter((x) => new Date(x.created_at).toDateString() === key).length
    );
  });
  const max = Math.max(1, ...dayValues);
  return (
    <>
      <PageHeader
        eyebrow="Learning analytics"
        title="Study report"
        description="A clear view of your activity, performance, and the topics that need your attention."
        actions={
          <Button variant="outline" disabled>
            <Download size={16} />
            Export report
          </Button>
        }
      />
      <div className="mb-6 flex flex-wrap gap-2">
        <Badge className="border-brand/20 bg-brand-soft text-brand-dark">
          Last 7 days
        </Badge>
        <Badge>
          <CalendarDays size={12} className="mr-1.5" />
          {start.toLocaleDateString()} – {new Date().toLocaleDateString()}
        </Badge>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric icon={Clock3} label="PDFs uploaded" value={String(pdfs ?? 0)} />
        <Metric icon={Target} label="Quiz accuracy" value={`${accuracy}%`} />
        <Metric
          icon={CheckCircle2}
          label="Cards reviewed"
          value={String(reviewed)}
        />
        <Metric
          icon={TrendingUp}
          label="Questions generated"
          value={String(questionCount ?? 0)}
        />
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_360px]">
        <Card className="p-6">
          <h2 className="font-semibold">Recent study activity</h2>
          <p className="mt-1 text-xs text-muted">
            Completed quizzes and flashcard sessions
          </p>
          <div className="mt-8 flex h-52 items-end justify-between gap-3 border-b border-border px-2">
            {dayValues.map((value, i) => (
              <div
                key={i}
                className="flex h-full flex-1 flex-col items-center justify-end gap-2"
              >
                <span className="text-[10px] text-muted">{value}</span>
                <div
                  className="w-full max-w-10 rounded-t-md bg-brand/80"
                  style={{ height: `${Math.max(4, (value / max) * 80)}%` }}
                />
                <span className="pb-3 text-[10px] text-muted">
                  {new Date(start.getTime() + i * 86400000).toLocaleDateString(
                    "en",
                    { weekday: "short" },
                  )}
                </span>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-6">
          <h2 className="font-semibold">Overall accuracy</h2>
          <p className="mt-1 text-xs text-muted">
            Across {quiz.length} quiz attempt{quiz.length === 1 ? "" : "s"}
          </p>
          <div className="my-7 text-center">
            <div
              className="relative mx-auto grid h-32 w-32 place-items-center rounded-full"
              style={{
                background: `conic-gradient(#5b5bd6 ${accuracy}%,#ececea 0)`,
              }}
            >
              <div className="grid h-24 w-24 place-items-center rounded-full bg-white">
                <p className="text-2xl font-semibold">{accuracy}%</p>
              </div>
            </div>
          </div>
          <p className="text-center text-xs leading-5 text-muted">
            {quiz.length
              ? "Each completed quiz updates this score."
              : "Complete a quiz to begin tracking accuracy."}
          </p>
        </Card>
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="font-semibold">Topics to revisit</h2>
          <p className="mt-1 text-xs text-muted">
            Based on missed quiz answers
          </p>
          <div className="mt-5 space-y-5">
            {weak.length ? (
              weak.map(([topic, count]) => (
                <div key={topic}>
                  <div className="mb-2 flex justify-between text-sm">
                    <span>{topic}</span>
                    <span className="text-muted">
                      {count} miss{count === 1 ? "" : "es"}
                    </span>
                  </div>
                  <Progress value={Math.max(10, 100 - count * 15)} />
                </div>
              ))
            ) : (
              <p className="text-sm leading-6 text-muted">
                Weak topics will appear after your first quiz attempt.
              </p>
            )}
          </div>
        </Card>
        <Card className="p-6">
          <Badge className="border-amber-200 bg-amber-50 text-amber-700">
            Recommended focus
          </Badge>
          <h2 className="mt-5 text-xl font-semibold">
            {weak[0]?.[0] || "Build your first study set"}
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted">
            {weak[0]
              ? "This topic appears most often in missed answers. Review its flashcards, then retake the quiz."
              : "Upload a PDF to generate personalized questions, flashcards, and performance insights."}
          </p>
          <Button asChild className="mt-5">
            <Link href={weak[0] ? "/flashcards" : "/upload"}>
              {weak[0] ? "Start focused review" : "Upload PDF"}
            </Link>
          </Button>
        </Card>
      </div>
    </>
  );
}
function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Clock3;
  label: string;
  value: string;
}) {
  return (
    <Card className="p-5">
      <div className="flex justify-between">
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-soft text-brand">
          <Icon size={17} />
        </span>
        <ArrowUpRight size={14} className="text-muted" />
      </div>
      <p className="mt-5 text-2xl font-semibold">{value}</p>
      <p className="mt-1 text-sm text-muted">{label}</p>
    </Card>
  );
}
