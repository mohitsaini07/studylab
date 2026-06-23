"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Menu, X } from "lucide-react";
import { useState } from "react";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";

const links = [
  { href: "/#features", label: "Features", match: "/" },
  { href: "/how-it-works", label: "How it works", match: "/how-it-works" },
  { href: "/pricing", label: "Pricing", match: "/pricing" },
] as const;

export function PublicHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:px-8">
        <div className="rounded-xl px-1 py-1 transition-colors hover:bg-canvas">
          <Logo />
        </div>

        <nav className="hidden rounded-full border border-border bg-canvas/70 p-1 text-sm text-muted md:flex">
          {links.map((link) => {
            const active =
              link.match === "/" ? pathname === "/" : pathname === link.match;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-full px-4 py-2 font-medium transition-all duration-200 hover:bg-white hover:text-ink",
                  active && "bg-white text-brand-dark shadow-sm shadow-black/[0.04]",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 sm:flex">
          <Button asChild size="sm" className="rounded-xl shadow-sm shadow-brand/15">
            <Link href="/login">
              Start learning <ArrowRight size={14} />
            </Link>
          </Button>
        </div>

        <button
          className="grid h-9 w-9 place-items-center rounded-xl border border-border bg-white text-ink transition-colors hover:border-brand/30 hover:text-brand sm:hidden"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
        >
          <Menu size={18} />
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 top-0 z-50 bg-black/25 backdrop-blur-[2px] sm:hidden">
          <button
            className="absolute inset-0"
            onClick={() => setOpen(false)}
            aria-label="Close menu overlay"
          />
          <div className="public-drawer-enter relative ml-auto flex min-h-screen w-[min(22rem,85vw)] flex-col border-l border-border bg-white p-5 shadow-xl">
            <div className="flex items-center justify-between">
              <Logo />
              <button
                className="grid h-9 w-9 place-items-center rounded-lg text-muted hover:bg-canvas hover:text-ink"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
              >
                <X size={19} />
              </button>
            </div>
            <nav className="mt-8 space-y-2">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="flex h-11 items-center rounded-xl px-3 text-sm font-medium text-muted hover:bg-canvas hover:text-ink"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="mt-auto grid gap-3">
              <Button asChild variant="outline" className="w-full">
                <Link href="/login" onClick={() => setOpen(false)}>
                  Log in
                </Link>
              </Button>
              <Button asChild className="w-full">
                <Link href="/login" onClick={() => setOpen(false)}>
                  Start learning <ArrowRight size={14} />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer className="border-t border-border bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between lg:px-8">
        <Logo />
        <div className="flex gap-6">
          <Link href="/how-it-works" className="hover:text-ink">
            How it works
          </Link>
          <Link href="/pricing" className="hover:text-ink">
            Pricing
          </Link>
        </div>
        <div className="flex flex-col gap-1 sm:text-right">
          <p>
            © 2026 StudyLab. Built by{" "}
            <span className="font-semibold text-ink">Mohit Saini</span>.
          </p>
          <a
            href="mailto:mohitsaini.codes@gmail.com"
            className="hover:text-brand transition-colors"
          >
            mohitsaini.codes@gmail.com
          </a>
        </div>
      </div>
    </footer>
  );
}
