"use client";
import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Flag,
  X,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Button, Card, Progress } from "@/components/ui";
import type { Question } from "@/lib/types";
export function QuizClient({
  studySet,
  questions,
}: {
  studySet: { id: string; title: string };
  questions: Question[];
}) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [answers, setAnswers] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);
  const q = questions[index];
  async function next() {
    if (selected === null) return;
    const nextAnswers = [...answers, selected];
    if (index === questions.length - 1) {
      setAnswers(nextAnswers);
      setDone(true);
      setSaving(true);
      const score = nextAnswers.filter(
        (a, i) => a === questions[i].answer,
      ).length;
      const weakTopics = [
        ...new Set(
          questions
            .filter((question, i) => nextAnswers[i] !== question.answer)
            .map((question) => question.topic)
            .filter(Boolean),
        ),
      ];
      const response = await fetch("/api/quiz-attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studySetId: studySet.id,
          score,
          totalQuestions: questions.length,
          weakTopics,
        }),
      });
      setSaving(false);
      if (!response.ok)
        toast.error("Score shown, but quiz history could not be saved.");
    } else {
      setAnswers(nextAnswers);
      setIndex(index + 1);
      setSelected(null);
    }
  }
  if (done) {
    const score = answers.filter((a, i) => a === questions[i].answer).length;
    return (
      <div className="mx-auto max-w-2xl py-6">
        <Card className="p-7 text-center sm:p-10">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-brand-soft text-brand">
            <CheckCircle2 size={30} />
          </div>
          <p className="mt-6 text-sm font-medium text-brand">QUIZ COMPLETE</p>
          <h1 className="mt-2 text-3xl font-semibold">
            You scored {score} out of {questions.length}
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted">
            {saving
              ? "Saving your result…"
              : "Your result is saved to your study report."}
          </p>
          <div className="mx-auto mt-7 grid max-w-md grid-cols-2 gap-3">
            <div className="rounded-lg border border-border p-3">
              <b className="text-lg">
                {Math.round((score / questions.length) * 100)}%
              </b>
              <p className="text-xs text-muted">Accuracy</p>
            </div>
            <div className="rounded-lg border border-border p-3">
              <b className="text-lg">{questions.length - score}</b>
              <p className="text-xs text-muted">To review</p>
            </div>
          </div>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button
              variant="outline"
              onClick={() => {
                setDone(false);
                setIndex(0);
                setAnswers([]);
                setSelected(null);
              }}
            >
              Try again
            </Button>
            <Button asChild>
              <Link href="/report">View study report</Link>
            </Button>
          </div>
        </Card>
        <div className="mt-5 space-y-3">
          {questions.map((item, i) => (
            <Card key={item.id} className="p-4">
              <div className="flex gap-3">
                {answers[i] === item.answer ? (
                  <CheckCircle2
                    size={18}
                    className="mt-0.5 shrink-0 text-emerald-600"
                  />
                ) : (
                  <XCircle size={18} className="mt-0.5 shrink-0 text-red-500" />
                )}
                <div>
                  <p className="text-sm font-medium">{item.question}</p>
                  <p className="mt-2 text-xs leading-5 text-muted">
                    {item.explanation || `Correct answer: ${item.answer}`}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }
  const options = q.options ?? [];
  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <Button asChild variant="ghost">
          <Link href={`/study-set/${studySet.id}`}>
            <ArrowLeft size={16} />
            Exit quiz
          </Link>
        </Button>
        <button className="flex items-center gap-1.5 text-xs text-muted">
          <Flag size={14} />
          Flag
        </button>
      </div>
      <div className="mb-8">
        <div className="mb-3 flex items-center justify-between text-xs">
          <span className="font-medium">
            Question {index + 1} of {questions.length}
          </span>
          <span className="text-muted">{studySet.title}</span>
        </div>
        <Progress value={((index + 1) / questions.length) * 100} />
      </div>
      <Card className="p-6 sm:p-9">
        <p className="text-xs font-semibold uppercase tracking-wider text-brand">
          Multiple choice
        </p>
        <h1 className="mt-4 text-balance text-xl font-semibold leading-8 sm:text-2xl">
          {q.question}
        </h1>
        <div className="mt-7 space-y-3">
          {options.map((option, i) => {
            const submitted = selected !== null;
            const correct = option === q.answer;
            const chosen = option === selected;
            return (
              <button
                key={option}
                disabled={submitted}
                onClick={() => setSelected(option)}
                className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left text-sm transition-colors ${submitted && correct ? "border-emerald-400 bg-emerald-50" : submitted && chosen && !correct ? "border-red-300 bg-red-50" : "border-border hover:border-brand/50 hover:bg-brand-soft/20"}`}
              >
                <span
                  className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg border text-xs font-semibold ${submitted && correct ? "border-emerald-500 bg-emerald-500 text-white" : submitted && chosen && !correct ? "border-red-400 bg-red-400 text-white" : "border-border bg-white"}`}
                >
                  {submitted && correct ? (
                    <Check size={14} />
                  ) : submitted && chosen && !correct ? (
                    <X size={14} />
                  ) : (
                    String.fromCharCode(65 + i)
                  )}
                </span>
                {option}
              </button>
            );
          })}
        </div>
        {selected !== null && (
          <div
            className={`mt-5 rounded-xl border p-4 ${selected === q.answer ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"}`}
          >
            <p className="text-sm font-semibold">
              {selected === q.answer ? "Correct" : "Not quite"}
            </p>
            <p className="mt-1 text-sm leading-6 text-muted">
              {q.explanation || `The correct answer is ${q.answer}.`}
            </p>
          </div>
        )}
      </Card>
      <div className="mt-5 flex justify-end">
        <Button disabled={selected === null} onClick={next}>
          {index === questions.length - 1 ? "Finish quiz" : "Next question"}
          <ArrowRight size={16} />
        </Button>
      </div>
    </div>
  );
}
