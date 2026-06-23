import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { Badge, Button, Card } from "@/components/ui";
import { PublicFooter, PublicHeader } from "@/components/public-shell";
const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "A focused way to try StudyLab with your own material.",
    features: [
      "5 study sets",
      "PDFs up to 25 MB",
      "Summaries and important topics",
      "Quizzes and flashcards",
      "Basic study analytics",
    ],
    cta: "Start free",
    href: "/login",
    featured: false,
  },
  {
    name: "Pro",
    price: "$9",
    period: "per month",
    description: "For students who use StudyLab throughout every course.",
    features: [
      "Unlimited study sets",
      "Everything in Free",
      "Longer source documents",
      "Extended learning history",
      "Priority generation",
    ],
    cta: "Coming soon",
    href: "/pricing#faq",
    featured: true,
  },
  {
    name: "Campus",
    price: "Custom",
    period: "for institutions",
    description: "Managed access for classrooms, cohorts, and learning teams.",
    features: [
      "Shared administration",
      "Centralized billing",
      "Usage controls",
      "Priority support",
      "Institution onboarding",
    ],
    cta: "Contact us",
    href: "mailto:hello@studylab.app",
    featured: false,
  },
];
export default function Pricing() {
  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />
      <main>
        <section className="border-b border-border bg-canvas">
          <div className="mx-auto max-w-4xl px-5 py-20 text-center sm:py-24">
            <Badge className="border-brand/20 bg-brand-soft text-brand-dark">
              Simple pricing
            </Badge>
            <h1 className="mt-6 text-balance text-4xl font-semibold tracking-[-.035em] sm:text-5xl">
              Start free. Upgrade when StudyLab becomes part of your routine.
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-muted">
              No complicated credit system or surprise charges. Your free
              workspace includes the complete study workflow.
            </p>
          </div>
        </section>
        <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-20">
          <div className="grid gap-5 lg:grid-cols-3">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                className={`relative flex flex-col p-6 sm:p-8 ${plan.featured ? "border-brand" : ""}`}
              >
                {plan.featured && (
                  <Badge className="absolute right-6 top-6 border-brand/20 bg-brand-soft text-brand-dark">
                    Most popular
                  </Badge>
                )}
                <p className="font-semibold">{plan.name}</p>
                <div className="mt-6 flex items-end gap-2">
                  <span className="text-4xl font-semibold tracking-tight">
                    {plan.price}
                  </span>
                  <span className="pb-1 text-sm text-muted">{plan.period}</span>
                </div>
                <p className="mt-4 min-h-12 text-sm leading-6 text-muted">
                  {plan.description}
                </p>
                <div className="my-7 h-px bg-border" />
                <ul className="flex-1 space-y-3">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-2.5 text-sm"
                    >
                      <Check size={15} className="text-brand" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  asChild
                  variant={plan.featured ? "default" : "outline"}
                  className="mt-8 w-full"
                >
                  <Link href={plan.href}>
                    {plan.cta}
                    {plan.cta !== "Coming soon" && <ArrowRight size={15} />}
                  </Link>
                </Button>
              </Card>
            ))}
          </div>
          <p className="mt-6 text-center text-xs text-muted">
            Paid plans are shown for product planning and are not billed yet.
          </p>
        </section>
        <section id="faq" className="border-t border-border bg-canvas">
          <div className="mx-auto max-w-3xl px-5 py-20">
            <div className="text-center">
              <p className="text-sm font-semibold text-brand">Questions</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight">
                Pricing FAQ
              </h2>
            </div>
            <div className="mt-10 divide-y divide-border rounded-xl border border-border bg-white px-5 sm:px-7">
              {[
                [
                  "Can I use every learning tool on Free?",
                  "Yes. Free includes summaries, topics, questions, quizzes, flashcards, and basic analytics.",
                ],
                [
                  "Will I be charged automatically?",
                  "No. StudyLab does not currently collect payment details, and Pro is marked as coming soon.",
                ],
                [
                  "Are my PDFs private?",
                  "Yes. Source PDFs are stored privately and protected with user-scoped authorization.",
                ],
                [
                  "Can I delete a study set?",
                  "Yes. Deleting a set removes its generated material, history, and stored source PDF.",
                ],
              ].map(([question, answer]) => (
                <details key={question} className="py-5">
                  <summary className="cursor-pointer list-none pr-5 text-sm font-semibold">
                    {question}
                  </summary>
                  <p className="mt-3 pb-1 text-sm leading-6 text-muted">
                    {answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>
        <section className="mx-auto max-w-4xl px-5 py-20 text-center">
          <h2 className="text-3xl font-semibold tracking-tight">
            Build your first study set for free.
          </h2>
          <p className="mt-3 text-muted">
            Upload a PDF and choose exactly what you want StudyLab to generate.
          </p>
          <Button asChild size="lg" className="mt-7">
            <Link href="/login">
              Create free account <ArrowRight size={17} />
            </Link>
          </Button>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
