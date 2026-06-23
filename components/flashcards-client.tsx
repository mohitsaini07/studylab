"use client";
import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  RotateCcw,
  Shuffle,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Badge, Button, Card, Progress } from "@/components/ui";
import type { Flashcard } from "@/lib/types";
export function FlashcardsClient({
  studySet,
  cards,
}: {
  studySet: { id: string; title: string };
  cards: Flashcard[];
}) {
  const [i, setI] = useState(0);
  const [flip, setFlip] = useState(false);
  const [known, setKnown] = useState(0);
  const [reviewed, setReviewed] = useState(0);
  const card = cards[i];
  async function move(got: boolean) {
    const nextReviewed = reviewed + 1;
    const nextKnown = known + (got ? 1 : 0);
    setReviewed(nextReviewed);
    setKnown(nextKnown);
    setFlip(false);
    const complete = nextReviewed >= cards.length;
    if (complete) {
      const response = await fetch("/api/flashcard-reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studySetId: studySet.id,
          reviewedCount: nextReviewed,
          knownCount: nextKnown,
          completed: true,
        }),
      });
      if (response.ok) toast.success("Review completed and saved");
      else toast.error("Review completed, but progress could not be saved");
      setReviewed(0);
      setKnown(0);
      setI(0);
    } else setI((x) => x + 1);
  }
  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <Button asChild variant="ghost">
          <Link href={`/study-set/${studySet.id}`}>
            <ArrowLeft size={16} />
            Back to study set
          </Link>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setI(Math.floor(Math.random() * cards.length));
            setFlip(false);
          }}
        >
          <Shuffle size={14} />
          Shuffle
        </Button>
      </div>
      <div className="mb-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-wider text-brand">
          {studySet.title}
        </p>
        <h1 className="mt-2 text-2xl font-semibold">Flashcard review</h1>
        <p className="mt-2 text-sm text-muted">
          Think of the answer, then reveal the card.
        </p>
      </div>
      <div className="mb-4 flex items-center justify-between text-xs text-muted">
        <span>
          {i + 1} of {cards.length}
        </span>
        <span>{known} known</span>
      </div>
      <Progress value={((i + 1) / cards.length) * 100} className="mb-6" />
      <button onClick={() => setFlip(!flip)} className="block w-full text-left">
        <Card className="flex min-h-[330px] flex-col items-center justify-center p-8 text-center shadow-soft transition-colors hover:border-brand/30 sm:min-h-[390px] sm:p-12">
          <Badge className="mb-8">{card.topic || "Review"}</Badge>
          <p className="text-xs font-semibold uppercase tracking-[.14em] text-muted">
            {flip ? "Answer" : "Question"}
          </p>
          <h2 className="mt-5 max-w-xl text-balance text-2xl font-semibold leading-9 sm:text-3xl">
            {flip ? card.back : card.front}
          </h2>
          <p className="mt-10 flex items-center gap-2 text-xs text-muted">
            <RotateCcw size={14} />
            {flip ? "Click to see question" : "Click to reveal answer"}
          </p>
        </Card>
      </button>
      {flip ? (
        <div className="mt-6 grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            size="lg"
            onClick={() => move(false)}
            className="border-red-200 text-red-600 hover:bg-red-50"
          >
            <X size={17} />
            Still learning
          </Button>
          <Button
            size="lg"
            onClick={() => move(true)}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            <Check size={17} />I knew this
          </Button>
        </div>
      ) : (
        <div className="mt-6 flex justify-between">
          <Button
            variant="ghost"
            disabled={i === 0}
            onClick={() => {
              setI(i - 1);
              setFlip(false);
            }}
          >
            <ArrowLeft size={16} />
            Previous
          </Button>
          <Button variant="outline" onClick={() => move(false)}>
            Skip
            <ArrowRight size={16} />
          </Button>
        </div>
      )}
    </div>
  );
}
