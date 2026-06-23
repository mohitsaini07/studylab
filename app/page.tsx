import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  BrainCircuit,
  Check,
  FileText,
  Layers3,
  Sparkles,
} from "lucide-react";
import { Badge, Button, Card } from "@/components/ui";
import { PublicFooter, PublicHeader } from "@/components/public-shell";
export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />
      <main>
        <section className="border-y border-border bg-canvas">
          <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 py-20 lg:grid-cols-[1.05fr_.95fr] lg:px-8 lg:py-28">
            <div>
              <Badge className="landing-fade-up mb-6 border-brand/20 bg-brand-soft text-brand-dark">
                <Sparkles size={12} className="mr-1.5" />
                Your notes, now intelligent
              </Badge>
              <h1 className="landing-fade-up animation-delay-100 max-w-3xl text-balance text-4xl font-semibold leading-[1.08] tracking-[-.04em] text-ink sm:text-5xl lg:text-[64px]">
                Turn any PDF into your smartest study session.
              </h1>
              <p className="landing-fade-up animation-delay-200 mt-6 max-w-xl text-lg leading-8 text-muted">
                StudyLab creates clear summaries, focused quizzes, and
                active-recall flashcards from your course material—in seconds.
              </p>
              <div className="landing-fade-up animation-delay-300 mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg">
                  <Link href="/upload">
                    Upload your first PDF <ArrowRight size={17} />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/dashboard">View demo workspace</Link>
                </Button>
              </div>
              <div className="landing-fade-up animation-delay-400 mt-7 flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted">
                {[
                  "No credit card",
                  "5 free study sets",
                  "Your files stay private",
                ].map((x) => (
                  <span key={x} className="flex items-center gap-1.5">
                    <Check size={14} className="text-brand" />
                    {x}
                  </span>
                ))}
              </div>
            </div>
            <div className="landing-scale-in animation-delay-200 relative">
              <div className="rounded-2xl border border-border bg-white p-3 shadow-soft">
                <div className="flex items-center gap-2 border-b border-border px-2 pb-3">
                  <i className="h-2.5 w-2.5 rounded-full bg-[#dfddd8]" />
                  <i className="h-2.5 w-2.5 rounded-full bg-[#dfddd8]" />
                  <i className="h-2.5 w-2.5 rounded-full bg-[#dfddd8]" />
                  <span className="ml-2 text-[11px] text-muted">
                    Cell Biology — StudyLab
                  </span>
                </div>
                <div className="grid gap-3 p-3 sm:grid-cols-[140px_1fr]">
                  <div className="hidden space-y-2 border-r border-border pr-3 sm:block">
                    {[
                      "Overview",
                      "Summary",
                      "Topics",
                      "Questions",
                      "Flashcards",
                    ].map((x, i) => (
                      <div
                        key={x}
                        className={`rounded-md px-2 py-2 text-[11px] ${i === 0 ? "bg-brand-soft font-medium text-brand-dark" : "text-muted"}`}
                      >
                        {x}
                      </div>
                    ))}
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-brand">
                        AI summary
                      </p>
                      <h3 className="mt-1 text-base font-semibold">
                        Cell Biology & Genetics
                      </h3>
                    </div>
                    <div className="space-y-2">
                      <div className="h-2 w-full rounded bg-[#efefec]" />
                      <div className="h-2 w-[92%] rounded bg-[#efefec]" />
                      <div className="h-2 w-[75%] rounded bg-[#efefec]" />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        ["12", "Topics"],
                        ["36", "Questions"],
                        ["24", "Cards"],
                      ].map((x) => (
                        <div
                          key={x[1]}
                          className="rounded-lg border border-border p-3"
                        >
                          <b className="text-lg">{x[0]}</b>
                          <p className="text-[9px] text-muted">{x[1]}</p>
                        </div>
                      ))}
                    </div>
                    <div className="landing-float rounded-lg border border-border p-3">
                      <p className="text-xs font-medium">Your next focus</p>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="h-1.5 flex-1 rounded bg-[#e9e9e5]">
                          <div className="h-full w-[62%] rounded bg-brand" />
                        </div>
                        <span className="text-[10px] text-muted">62%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section
          id="features"
          className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28"
        >
          <div className="max-w-2xl">
            <p className="landing-fade-up text-sm font-semibold text-brand">
              Everything you need to learn well
            </p>
            <h2 className="landing-fade-up animation-delay-100 mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Less organizing. More understanding.
            </h2>
            <p className="landing-fade-up animation-delay-200 mt-4 leading-7 text-muted">
              A focused learning toolkit that turns passive reading into active
              recall and measurable progress.
            </p>
          </div>
          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              [
                FileText,
                "Precise summaries",
                "Get structured chapter notes with key concepts and examples.",
              ],
              [
                BrainCircuit,
                "Adaptive quizzes",
                "Practice questions that adjust around your weaker topics.",
              ],
              [
                Layers3,
                "Smart flashcards",
                "Review with active recall and confidence-based sorting.",
              ],
              [
                BookOpen,
                "Study insights",
                "See topic mastery, consistency, and exactly what to study next.",
              ],
            ].map(([Icon, title, copy]) => {
              const I = Icon as typeof FileText;
              return (
                <Card
                  key={String(title)}
                  className="landing-scale-in p-6 transition-all duration-200 hover:-translate-y-1 hover:border-brand/30"
                >
                  <div className="mb-5 grid h-10 w-10 place-items-center rounded-lg bg-brand-soft text-brand">
                    <I size={19} />
                  </div>
                  <h3 className="font-semibold">{String(title)}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted">
                    {String(copy)}
                  </p>
                </Card>
              );
            })}
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
