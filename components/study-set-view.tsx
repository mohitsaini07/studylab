"use client";
import Link from "next/link";
import { useState } from "react";
import {
  AlertCircle,
  BookOpen,
  ChevronDown,
  Download,
  FileQuestion,
  Layers3,
  Play,
  Sparkles,
} from "lucide-react";
import { Badge, Button, Card, PageHeader, Progress } from "@/components/ui";
import type { Flashcard, Question, StudySet } from "@/lib/types";
const sections = ["Overview", "Summary", "Topics", "Questions"];
export function StudySetView({
  studySet: s,
  questions,
  flashcards,
  downloadUrl,
}: {
  studySet: StudySet;
  questions: Question[];
  flashcards: Flashcard[];
  downloadUrl?: string;
}) {
  const [tab, setTab] = useState("Overview");
  const topics = Array.isArray(s.topics) ? s.topics : [];
  if (s.status !== "ready")
    return (
      <>
        <PageHeader
          eyebrow="Study set"
          title={s.title}
          description={s.file_name}
        />
        <Card className="p-8 text-center">
          <AlertCircle
            className={`mx-auto ${s.status === "failed" ? "text-red-500" : "text-brand"}`}
            size={28}
          />
          <h2 className="mt-4 font-semibold">
            {s.status === "failed"
              ? "Generation could not be completed"
              : "Your study set is still processing"}
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">
            {s.error_message ||
              "Refresh in a moment to see your generated material."}
          </p>
          <Button asChild className="mt-5">
            <Link href="/upload">Upload another PDF</Link>
          </Button>
        </Card>
      </>
    );
  return (
    <>
      <PageHeader
        eyebrow={`${s.page_count} pages`}
        title={s.title}
        description={`Generated from ${s.file_name} · ${new Date(s.created_at).toLocaleDateString()}`}
        actions={
          <Button asChild>
            <Link href={`/quiz?set=${s.id}`}>
              <Play size={16} />
              Start quiz
            </Link>
          </Button>
        }
      />
      <div className="mb-6 flex gap-1 overflow-x-auto border-b border-border">
        {sections.map((x) => (
          <button
            key={x}
            onClick={() => setTab(x)}
            className={`shrink-0 border-b-2 px-4 py-3 text-sm font-medium ${tab === x ? "border-brand text-brand" : "border-transparent text-muted hover:text-ink"}`}
          >
            {x}
          </button>
        ))}
      </div>
      {tab === "Overview" && (
        <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <Badge className="border-brand/20 bg-brand-soft text-brand-dark">
                    <Sparkles size={12} className="mr-1.5" />
                    AI summary
                  </Badge>
                  <h2 className="mt-4 text-lg font-semibold">
                    What this material covers
                  </h2>
                </div>
                {downloadUrl && (
                  <Button asChild variant="ghost" size="sm">
                    <a href={downloadUrl}>
                      <Download size={15} />
                      Source PDF
                    </a>
                  </Button>
                )}
              </div>
              <p className="mt-4 whitespace-pre-line text-sm leading-7 text-[#51514d]">
                {s.summary.slice(0, 700)}
                {s.summary.length > 700 ? "…" : ""}
              </p>
              <button
                onClick={() => setTab("Summary")}
                className="mt-4 text-sm font-medium text-brand"
              >
                Read full summary →
              </button>
            </Card>
            <div>
              <div className="mb-4">
                <h2 className="text-lg font-semibold">Important topics</h2>
                <p className="mt-1 text-sm text-muted">
                  Generated from your source material
                </p>
              </div>
              <Card className="divide-y divide-border">
                {topics.slice(0, 6).map((t, i) => (
                  <div
                    key={t.title}
                    className="flex items-center gap-4 p-4 sm:p-5"
                  >
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-canvas text-xs font-semibold text-muted">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <p className="text-sm font-medium">{t.title}</p>
                      <p className="mt-1 text-xs leading-5 text-muted">
                        {t.description}
                      </p>
                    </div>
                  </div>
                ))}
              </Card>
            </div>
          </div>
          <aside className="space-y-3">
            <Card className="p-5">
              <h3 className="font-semibold">Study set ready</h3>
              <p className="mt-2 text-xs leading-5 text-muted">
                Your complete learning material is available across summary,
                questions, and flashcards.
              </p>
              <Progress value={100} className="mt-4" />
            </Card>
            {[
              [
                Layers3,
                "Flashcards",
                `${flashcards.length} cards`,
                `/flashcards?set=${s.id}`,
              ],
              [
                FileQuestion,
                "Practice quiz",
                `${questions.filter((q) => q.type === "mcq").length} MCQs`,
                `/quiz?set=${s.id}`,
              ],
              [BookOpen, "Study report", "View insights", "/report"],
            ].map(([Icon, title, meta, href]) => {
              const I = Icon as typeof Layers3;
              return (
                <Link href={String(href)} key={String(title)}>
                  <Card className="mb-3 flex items-center gap-3 p-4 transition-colors hover:border-brand/40">
                    <span className="grid h-10 w-10 place-items-center rounded-lg bg-brand-soft text-brand">
                      <I size={18} />
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{String(title)}</p>
                      <p className="mt-1 text-xs text-muted">{String(meta)}</p>
                    </div>
                    <ChevronDown size={15} className="-rotate-90 text-muted" />
                  </Card>
                </Link>
              );
            })}
          </aside>
        </div>
      )}
      {tab === "Summary" && (
        <Card className="mx-auto max-w-full p-6 sm:p-9">
          <h2 className="text-xl font-semibold">
            {s.title} — Complete Summary
          </h2>
          <p className="mt-6 whitespace-pre-line text-sm leading-7 text-muted">
            {s.summary}
          </p>
        </Card>
      )}
      {tab === "Topics" && (
        <div className="grid gap-4 md:grid-cols-2">
          {topics.map((t, i) => (
            <Card key={t.title} className="p-5">
              <Badge>Topic {i + 1}</Badge>
              <h3 className="mt-4 font-semibold">{t.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">
                {t.description}
              </p>
            </Card>
          ))}
        </div>
      )}
      {tab === "Questions" && (
        <div className="grid gap-4 md:grid-cols-3">
          {(["mcq", "short", "long"] as const).map((type, i) => {
            const labels = {
              mcq: "Multiple choice",
              short: "Short answer",
              long: "Long answer",
            };
            const count = questions.filter((q) => q.type === type).length;
            return (
              <Card key={type} className="p-6">
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-brand-soft text-brand">
                  <FileQuestion size={18} />
                </span>
                <h3 className="mt-5 font-semibold">{labels[type]}</h3>
                <p className="mt-1 text-xs text-muted">{count} questions</p>
                <p className="mt-4 text-sm leading-6 text-muted">
                  Practice with answers and explanations generated from your
                  PDF.
                </p>
                {type === "mcq" ? (
                  <Button asChild className="mt-5 w-full">
                    <Link href={`/quiz?set=${s.id}`}>Start practice</Link>
                  </Button>
                ) : (
                  <div className="mt-5 space-y-3">
                    {questions
                      .filter((q) => q.type === type)
                      .slice(0, 2)
                      .map((q) => (
                        <details
                          key={q.id}
                          className="rounded-lg border border-border p-3 text-xs"
                        >
                          <summary className="cursor-pointer font-medium">
                            {q.question}
                          </summary>
                          <p className="mt-2 leading-5 text-muted">
                            {q.answer}
                          </p>
                        </details>
                      ))}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}
