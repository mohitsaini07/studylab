import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  CheckCircle2,
  FileUp,
  Layers3,
  Sparkles,
} from "lucide-react";
import { Badge, Button, Card } from "@/components/ui";
import { PublicFooter, PublicHeader } from "@/components/public-shell";
const steps = [
  [
    "01",
    FileUp,
    "Upload your study PDF",
    "Choose a text-based PDF up to 25 MB. Your document is stored privately and remains accessible only to your account.",
  ],
  [
    "02",
    Sparkles,
    "Select what you need",
    "Choose a summary, important topics, practice questions, flashcards—or any combination. StudyLab generates only the material you select.",
  ],
  [
    "03",
    BookOpen,
    "Study actively",
    "Read a structured summary, work through questions, take focused quizzes, and review with active-recall flashcards.",
  ],
  [
    "04",
    BarChart3,
    "Improve with evidence",
    "Quiz attempts and flashcard reviews become practical insights, showing your accuracy and the topics that need another pass.",
  ],
] as const;
export default function HowItWorks() {
  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />
      <main>
        <section className="border-b border-border bg-canvas">
          <div className="mx-auto max-w-4xl px-5 py-20 text-center sm:py-24">
            <Badge className="border-brand/20 bg-brand-soft text-brand-dark">
              From PDF to practice
            </Badge>
            <h1 className="mt-6 text-balance text-4xl font-semibold tracking-[-.035em] sm:text-5xl">
              A complete study workflow in four calm steps.
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-muted">
              StudyLab handles the organizing so you can spend your time
              understanding, recalling, and improving.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/upload">
                  Upload a PDF <ArrowRight size={17} />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/pricing">View pricing</Link>
              </Button>
            </div>
          </div>
        </section>
        <section className="mx-auto max-w-6xl px-5 py-20 lg:px-8">
          <div className="space-y-5">
            {steps.map(([number, Icon, title, copy], index) => (
              <Card
                key={number}
                className="grid gap-6 p-6 sm:grid-cols-[72px_1fr_auto] sm:items-center sm:p-8"
              >
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-brand-soft text-brand">
                  <Icon size={21} />
                </span>
                <div>
                  <p className="text-xs font-semibold tracking-[.14em] text-brand">
                    STEP {number}
                  </p>
                  <h2 className="mt-2 text-xl font-semibold">{title}</h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
                    {copy}
                  </p>
                </div>
                <span className="hidden text-3xl font-semibold text-[#e5e5e1] sm:block">
                  {index + 1}
                </span>
              </Card>
            ))}
          </div>
        </section>
        <section className="border-y border-border bg-canvas">
          <div className="mx-auto grid max-w-6xl gap-10 px-5 py-20 lg:grid-cols-[.9fr_1.1fr] lg:items-center lg:px-8">
            <div>
              <p className="text-sm font-semibold text-brand">
                Designed around active recall
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight">
                Your PDF becomes something you can actually practice.
              </h2>
              <p className="mt-4 text-sm leading-7 text-muted">
                Each study set stays available in your workspace, so you can
                return later, retake quizzes, and continue reviewing without
                uploading again.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                [
                  Layers3,
                  "Flexible generation",
                  "Generate only the tools you need.",
                ],
                [
                  CheckCircle2,
                  "Saved progress",
                  "Keep quiz and flashcard history.",
                ],
                [
                  BarChart3,
                  "Useful analytics",
                  "Find weak topics from performance.",
                ],
                [
                  BookOpen,
                  "One study library",
                  "Return to previous study sets.",
                ],
              ].map(([Icon, title, copy]) => {
                const I = Icon as typeof Layers3;
                return (
                  <Card key={String(title)} className="p-5">
                    <I size={18} className="text-brand" />
                    <h3 className="mt-4 text-sm font-semibold">
                      {String(title)}
                    </h3>
                    <p className="mt-2 text-xs leading-5 text-muted">
                      {String(copy)}
                    </p>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>
        <section className="mx-auto max-w-4xl px-5 py-20 text-center">
          <h2 className="text-3xl font-semibold tracking-tight">
            Ready to turn reading into recall?
          </h2>
          <p className="mt-3 text-muted">
            Create your first study set in a few minutes.
          </p>
          <Button asChild size="lg" className="mt-7">
            <Link href="/upload">
              Start with a PDF <ArrowRight size={17} />
            </Link>
          </Button>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
