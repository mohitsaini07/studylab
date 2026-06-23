"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BookOpen,
  ChevronDown,
  FileUp,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Upload,
  X,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { signOut } from "@/app/auth/actions";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui";
import { getInitials } from "@/lib/profile";
import { cn } from "@/lib/utils";

export function AppShell({
  children,
  name,
  avatarUrl,
  studySetCount,
  latestStudySetId,
}: {
  children: React.ReactNode;
  name: string;
  avatarUrl?: string;
  studySetCount: number;
  latestStudySetId?: string;
}) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const initials = getInitials(name);
  const currentSection = path.includes("study-set")
    ? "Study set"
    : path.includes("quiz")
      ? "Quiz"
      : path.includes("flashcards")
        ? "Flashcards"
        : path.includes("upload")
          ? "Upload PDF"
          : path.includes("report")
            ? "Progress"
            : path.includes("settings")
              ? "Settings"
              : "Overview";
  const nav = [
    {
      href: "/dashboard",
      label: "Overview",
      icon: LayoutDashboard,
      match: (current: string) => current === "/dashboard",
    },
    {
      href: "/upload",
      label: "Upload PDF",
      icon: FileUp,
      match: (current: string) => current === "/upload",
    },
    {
      href: latestStudySetId ? `/study-set/${latestStudySetId}` : "/dashboard",
      label: "Study sets",
      icon: BookOpen,
      match: (current: string) =>
        current.includes("study-set") ||
        current.includes("quiz") ||
        current.includes("flashcards"),
    },
    {
      href: "/report",
      label: "Progress",
      icon: BarChart3,
      match: (current: string) => current === "/report",
    },
  ];

  const sidebar = (
    <>
      <div className="flex h-16 items-center justify-between px-4">
        <div className="rounded-xl px-1 py-1 transition-colors hover:bg-white">
          <Logo />
        </div>
        <button
          className="grid h-9 w-9 place-items-center rounded-lg text-muted transition-colors hover:bg-white hover:text-ink lg:hidden"
          onClick={() => setOpen(false)}
          aria-label="Close menu"
        >
          <X size={20} />
        </button>
      </div>

      <div className="px-3 py-4">
        <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[.14em] text-[#9a9993]">
          Workspace
        </p>
        <nav className="space-y-1.5">
          {nav.map(({ href, label, icon: Icon, match }) => {
            const active = match(path);
            return (
              <Link
                key={label}
                href={href}
                onClick={() => setOpen(false)}
                className={cn(
                  "group relative flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium text-muted transition-all duration-200 hover:bg-white hover:text-ink hover:shadow-sm hover:shadow-black/[0.03]",
                  active && "bg-white text-brand-dark shadow-sm shadow-black/[0.04]",
                )}
              >
                {active && (
                  <span className="absolute left-0 top-2 h-7 w-1 rounded-r-full bg-brand" />
                )}
                <span
                  className={cn(
                    "grid h-8 w-8 place-items-center rounded-lg transition-colors",
                    active
                      ? "bg-brand-soft text-brand"
                      : "text-muted group-hover:bg-canvas group-hover:text-ink",
                  )}
                >
                  <Icon size={17} />
                </span>
                {label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-3">
        <div className="mb-3 overflow-hidden rounded-2xl border border-border bg-white p-4 shadow-sm shadow-black/[0.03]">
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-brand-soft text-brand">
              <Zap size={14} />
            </span>
            Starter plan
          </div>
          <div className="mb-2 h-1.5 overflow-hidden rounded-full bg-[#e2e2df]">
            <div
              className="h-full rounded-full bg-brand transition-all duration-500"
              style={{ width: `${Math.min(100, (studySetCount / 5) * 100)}%` }}
            />
          </div>
          <p className="text-[11px] text-muted">
            {studySetCount} of 5 study sets used
          </p>
          <Link
            href="/settings"
            onClick={() => setOpen(false)}
            className="mt-3 inline-flex text-xs font-semibold text-brand hover:text-brand-dark"
          >
            Manage account →
          </Link>
        </div>

        <Link
          href="/settings"
          onClick={() => setOpen(false)}
          className={cn(
            "group flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium text-muted transition-all duration-200 hover:bg-white hover:text-ink hover:shadow-sm hover:shadow-black/[0.03]",
            path === "/settings" &&
              "bg-white text-brand-dark shadow-sm shadow-black/[0.04]",
          )}
        >
          <span
            className={cn(
              "grid h-8 w-8 place-items-center rounded-lg transition-colors",
              path === "/settings"
                ? "bg-brand-soft text-brand"
                : "text-muted group-hover:bg-canvas group-hover:text-ink",
            )}
          >
            <Settings size={17} />
          </span>
          Settings
        </Link>
      </div>
    </>
  );

  return (
    <div className="app-shell-enter min-h-screen bg-canvas">
      <aside className="sidebar-enter fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-border bg-[#fbfbfa] lg:flex">
        {sidebar}
      </aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            className="absolute inset-0 bg-black/25 backdrop-blur-[2px]"
            onClick={() => setOpen(false)}
            aria-label="Close overlay"
          />
          <aside className="mobile-drawer-enter relative flex h-full w-72 flex-col border-r border-border bg-[#fbfbfa] shadow-xl">
            {sidebar}
          </aside>
        </div>
      )}

      <div className="min-w-0 lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-white/90 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              className="grid h-9 w-9 place-items-center rounded-xl border border-border bg-white transition-colors hover:border-brand/30 hover:text-brand lg:hidden"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={18} />
            </button>
            <div className="hidden items-center gap-2 text-sm text-muted sm:flex">
              <span className="inline-flex items-center gap-2">
                <GraduationCap size={15} />
                My workspace
              </span>
              <span className="text-[#c2c1bc]">/</span>
              <span className="font-medium text-ink">{currentSection}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              asChild
              size="sm"
              className="hidden rounded-xl shadow-sm shadow-brand/15 sm:inline-flex"
            >
              <Link href="/upload">
                <Upload size={14} />
                New study set
              </Link>
            </Button>

            <div className="relative">
              <button
                type="button"
                title={`${name} account menu`}
                aria-haspopup="menu"
                aria-expanded={profileOpen}
                onClick={() => setProfileOpen((value) => !value)}
                className={cn(
                  "flex items-center gap-2 rounded-xl border border-transparent bg-canvas/60 p-1.5 transition-all duration-200 hover:border-border hover:bg-white hover:shadow-sm",
                  profileOpen && "border-border bg-white shadow-sm",
                )}
              >
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarUrl}
                    alt={`${name} profile picture`}
                    className="h-7 w-7 rounded-full border border-border object-cover"
                  />
                ) : (
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-[#e9e7ff] text-xs font-semibold text-brand-dark">
                    {initials}
                  </span>
                )}
                <ChevronDown
                  size={14}
                  className={cn(
                    "text-muted transition-transform",
                    profileOpen && "rotate-180",
                  )}
                />
              </button>

              {profileOpen && (
                <div
                  role="menu"
                  className="absolute right-0 top-12 z-50 w-60 rounded-2xl border border-border bg-white p-2 shadow-xl shadow-black/[0.07]"
                >
                  <div className="border-b border-border px-3 py-2.5">
                    <p className="truncate text-sm font-medium text-ink">
                      {name}
                    </p>
                    <p className="mt-0.5 text-xs text-muted">
                      Personal workspace
                    </p>
                  </div>
                  <Link
                    href="/settings"
                    onClick={() => setProfileOpen(false)}
                    className="mt-2 flex h-9 items-center gap-2 rounded-lg px-3 text-sm text-muted transition-colors hover:bg-canvas hover:text-ink"
                    role="menuitem"
                  >
                    <Settings size={15} />
                    Account settings
                  </Link>
                  <form action={signOut}>
                    <button
                      type="submit"
                      className="flex h-9 w-full items-center gap-2 rounded-lg px-3 text-left text-sm text-red-600 transition-colors hover:bg-red-50"
                      role="menuitem"
                    >
                      <LogOut size={15} />
                      Log out
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[1280px] overflow-x-hidden p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
