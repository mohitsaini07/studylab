"use client";
import { useEffect, useRef, useState } from "react";
import * as Switch from "@radix-ui/react-switch";
import {
  Bell,
  BookOpen,
  CreditCard,
  KeyRound,
  Loader2,
  LogOut,
  Palette,
  ShieldCheck,
  Target,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import { signOut } from "@/app/auth/actions";
import { Button, Card, PageHeader } from "@/components/ui";
import { getInitials } from "@/lib/profile";
export type Preferences = {
  daily_reminder: boolean;
  weekly_report: boolean;
  study_set_ready: boolean;
  product_updates: boolean;
  compact_sidebar: boolean;
  reduce_motion: boolean;
  keep_pdfs: boolean;
  learning_analytics: boolean;
};
type SettingsTab =
  | "Profile"
  | "Notifications"
  | "Appearance"
  | "Plan & billing"
  | "Privacy";
const Toggle = ({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
}) => (
  <Switch.Root
    checked={checked}
    onCheckedChange={onChange}
    className="relative h-5 w-9 rounded-full bg-[#d8d8d4] data-[state=checked]:bg-brand"
  >
    <Switch.Thumb className="block h-4 w-4 translate-x-0.5 rounded-full bg-white shadow-sm transition-transform data-[state=checked]:translate-x-[18px]" />
  </Switch.Root>
);
export function SettingsClient({
  fullName,
  avatarUrl,
  email,
  joinedAt,
  stats,
  preferences: initial,
}: {
  fullName: string;
  avatarUrl?: string;
  email: string;
  joinedAt?: string;
  stats: {
    studySets: number;
    quizAttempts: number;
    averageScore: number;
    flashcardsReviewed: number;
  };
  preferences: Preferences;
}) {
  const [tab, setTab] = useState<SettingsTab>("Profile");
  const [tabLoading, setTabLoading] = useState(false);
  const [prefs, setPrefs] = useState(initial);
  const [saving, setSaving] = useState(false);
  const loadingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const joined = joinedAt
    ? new Intl.DateTimeFormat("en", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }).format(new Date(joinedAt))
    : "Recently";
  const items = [
    [UserRound, "Profile"],
    [Bell, "Notifications"],
    [Palette, "Appearance"],
    [CreditCard, "Plan & billing"],
    [KeyRound, "Privacy"],
  ] as const;
  useEffect(() => {
    return () => {
      if (loadingTimer.current) clearTimeout(loadingTimer.current);
    };
  }, []);
  function selectTab(nextTab: SettingsTab) {
    if (nextTab === tab) return;
    if (loadingTimer.current) clearTimeout(loadingTimer.current);
    setTab(nextTab);
    setTabLoading(true);
    loadingTimer.current = setTimeout(() => setTabLoading(false), 220);
  }
  async function savePrefs() {
    setSaving(true);
    const response = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(prefs),
    });
    const body = await response.json();
    setSaving(false);
    response.ok
      ? toast.success("Preferences saved")
      : toast.error(body.error || "Could not save preferences");
  }
  function update(key: keyof Preferences, value: boolean) {
    setPrefs((p) => ({ ...p, [key]: value }));
  }
  return (
    <>
      <PageHeader
        title="Settings"
        description="Manage your profile, learning preferences, notifications, and account."
      />
      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <nav className="space-y-1">
          {items.map(([Icon, x]) => (
            <button
              key={x}
              onClick={() => selectTab(x)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm ${tab === x ? "bg-brand-soft font-medium text-brand-dark" : "text-muted hover:bg-white hover:text-ink"}`}
            >
              <Icon size={16} />
              {x}
            </button>
          ))}
        </nav>
        <Card className="p-5 sm:p-7">
          {tabLoading ? (
            <SettingsTabSkeleton tab={tab} />
          ) : (
            <>
              {tab === "Profile" && (
            <>
              <h2 className="font-semibold">Account overview</h2>
              <p className="mt-1 text-sm text-muted">
                Review your identity, workspace activity, and account access.
              </p>
              <div className="mt-6 flex items-center gap-4">
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarUrl}
                    alt={`${fullName} profile picture`}
                    className="h-14 w-14 rounded-full border border-border object-cover"
                  />
                ) : (
                  <span className="grid h-14 w-14 place-items-center rounded-full bg-brand-soft font-semibold text-brand-dark">
                    {getInitials(fullName)}
                  </span>
                )}
                <div>
                  <p className="font-medium">{fullName}</p>
                  <p className="mt-1 text-sm text-muted">
                    {email || "Signed in to your private workspace"}
                  </p>
                </div>
              </div>
              <div className="mt-7 grid gap-4 md:grid-cols-3">
                <ProfileMetric
                  icon={BookOpen}
                  label="Study sets"
                  value={String(stats.studySets)}
                />
                <ProfileMetric
                  icon={Target}
                  label="Quiz accuracy"
                  value={`${stats.averageScore}%`}
                />
                <ProfileMetric
                  icon={ShieldCheck}
                  label="Member since"
                  value={joined}
                />
              </div>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-border p-5">
                  <p className="font-medium">Learning activity</p>
                  <p className="mt-2 text-sm leading-6 text-muted">
                    You have completed {stats.quizAttempts} quiz attempt
                    {stats.quizAttempts === 1 ? "" : "s"} and reviewed{" "}
                    {stats.flashcardsReviewed} flashcard
                    {stats.flashcardsReviewed === 1 ? "" : "s"}.
                  </p>
                </div>
                <div className="rounded-xl border border-border p-5">
                  <p className="font-medium">Account access</p>
                  <p className="mt-2 text-sm leading-6 text-muted">
                    Your display name and profile photo are managed by your
                    sign-in provider when you use Google.
                  </p>
                </div>
              </div>
              <form action={signOut} className="mt-7">
                <Button variant="outline" type="submit">
                  <LogOut size={16} />
                  Log out
                </Button>
              </form>
            </>
              )}
              {tab === "Notifications" && (
            <SettingsList
              title="Notifications"
              copy="Choose when StudyLab should get your attention."
              rows={[
                [
                  "Daily study reminder",
                  "A gentle prompt at your preferred time",
                  "daily_reminder",
                ],
                [
                  "Weekly progress report",
                  "A summary of your activity every Sunday",
                  "weekly_report",
                ],
                [
                  "Study set ready",
                  "Notify me when PDF processing is complete",
                  "study_set_ready",
                ],
                [
                  "Product updates",
                  "Occasional news about new features",
                  "product_updates",
                ],
              ]}
              prefs={prefs}
              update={update}
              save={savePrefs}
              saving={saving}
            />
              )}{" "}
              {tab === "Appearance" && (
            <SettingsList
              title="Appearance"
              copy="Keep your workspace comfortable and focused."
              rows={[
                [
                  "Compact sidebar",
                  "Show a denser navigation layout",
                  "compact_sidebar",
                ],
                [
                  "Reduce motion",
                  "Minimize non-essential interface motion",
                  "reduce_motion",
                ],
              ]}
              prefs={prefs}
              update={update}
              save={savePrefs}
              saving={saving}
            />
              )}{" "}
              {tab === "Plan & billing" && (
            <>
              <h2 className="font-semibold">Plan & billing</h2>
              <p className="mt-1 text-sm text-muted">
                Manage your workspace plan, usage limits, and billing details.
              </p>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-brand/20 bg-brand-soft p-5">
                  <p className="text-xs font-semibold uppercase tracking-[.12em] text-brand">
                    Current plan
                  </p>
                  <p className="mt-2 text-lg font-semibold">Starter</p>
                  <p className="mt-1 text-xs leading-5 text-muted">
                    Perfect for individual learners building focused study
                    sets.
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-white p-5">
                  <p className="text-xs font-semibold uppercase tracking-[.12em] text-muted">
                    Monthly usage
                  </p>
                  <p className="mt-2 text-lg font-semibold">5 study sets</p>
                  <p className="mt-1 text-xs leading-5 text-muted">
                    Upgrade when you need larger uploads, more study sets, and
                    advanced reporting.
                  </p>
                </div>
              </div>
              <div className="mt-5 rounded-xl border border-border p-5">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <div>
                    <p className="font-medium">Upgrade to Pro</p>
                    <p className="mt-1 text-sm text-muted">
                      Unlimited study sets, priority generation, and deeper
                      progress insights.
                    </p>
                  </div>
                  <Button variant="outline" disabled>
                    Coming soon
                  </Button>
                </div>
              </div>
            </>
              )}
              {tab === "Privacy" && (
            <SettingsList
              title="Privacy & data"
              copy="Control how your uploaded content is handled."
              rows={[
                [
                  "Keep uploaded PDFs",
                  "Store source files with each study set",
                  "keep_pdfs",
                ],
                [
                  "Learning analytics",
                  "Use activity data for personalized recommendations",
                  "learning_analytics",
                ],
              ]}
              prefs={prefs}
              update={update}
              save={savePrefs}
              saving={saving}
            />
              )}
            </>
          )}
        </Card>
      </div>
    </>
  );
}

function SettingsTabSkeleton({ tab }: { tab: SettingsTab }) {
  if (tab === "Profile") {
    return (
      <div className="animate-pulse">
        <SkeletonLine className="h-5 w-36" />
        <SkeletonLine className="mt-3 h-4 w-80 max-w-full" />
        <div className="mt-6 flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-[#ecece8]" />
          <div className="flex-1">
            <SkeletonLine className="h-4 w-40" />
            <SkeletonLine className="mt-3 h-3 w-56" />
          </div>
        </div>
        <div className="mt-7 grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div key={item} className="rounded-xl border border-border p-4">
              <div className="h-9 w-9 rounded-lg bg-[#ecece8]" />
              <SkeletonLine className="mt-5 h-3 w-20" />
              <SkeletonLine className="mt-3 h-5 w-24" />
            </div>
          ))}
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {[1, 2].map((item) => (
            <div key={item} className="rounded-xl border border-border p-5">
              <SkeletonLine className="h-4 w-32" />
              <SkeletonLine className="mt-4 h-3 w-full" />
              <SkeletonLine className="mt-3 h-3 w-4/5" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (tab === "Plan & billing") {
    return (
      <div className="animate-pulse">
        <SkeletonLine className="h-5 w-32" />
        <SkeletonLine className="mt-3 h-4 w-96 max-w-full" />
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {[1, 2].map((item) => (
            <div key={item} className="rounded-xl border border-border p-5">
              <SkeletonLine className="h-3 w-24" />
              <SkeletonLine className="mt-5 h-6 w-32" />
              <SkeletonLine className="mt-4 h-3 w-full" />
              <SkeletonLine className="mt-3 h-3 w-4/5" />
            </div>
          ))}
        </div>
        <div className="mt-5 rounded-xl border border-border p-5">
          <SkeletonLine className="h-4 w-32" />
          <SkeletonLine className="mt-4 h-3 w-3/4" />
        </div>
      </div>
    );
  }

  return (
    <div className="animate-pulse">
      <SkeletonLine className="h-5 w-32" />
      <SkeletonLine className="mt-3 h-4 w-80 max-w-full" />
      <div className="mt-6 divide-y divide-border">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="flex items-center justify-between gap-5 py-5"
          >
            <div className="flex-1">
              <SkeletonLine className="h-4 w-44" />
              <SkeletonLine className="mt-3 h-3 w-72 max-w-full" />
            </div>
            <div className="h-5 w-9 rounded-full bg-[#ecece8]" />
          </div>
        ))}
      </div>
      <SkeletonLine className="mt-6 h-10 w-36" />
    </div>
  );
}

function SkeletonLine({ className }: { className: string }) {
  return <div className={`rounded bg-[#ecece8] ${className}`} />;
}

function ProfileMetric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof BookOpen;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-border p-4">
      <div className="mb-3 grid h-9 w-9 place-items-center rounded-lg bg-brand-soft text-brand">
        <Icon size={17} />
      </div>
      <p className="text-xs font-medium text-muted">{label}</p>
      <p className="mt-1 text-lg font-semibold">{value}</p>
    </div>
  );
}
function SettingsList({
  title,
  copy,
  rows,
  prefs,
  update,
  save,
  saving,
}: {
  title: string;
  copy: string;
  rows: [string, string, keyof Preferences][];
  prefs: Preferences;
  update: (key: keyof Preferences, value: boolean) => void;
  save: () => void;
  saving: boolean;
}) {
  return (
    <>
      <h2 className="font-semibold">{title}</h2>
      <p className="mt-1 text-sm text-muted">{copy}</p>
      <div className="mt-6 divide-y divide-border">
        {rows.map(([label, description, key]) => (
          <div
            key={key}
            className="flex items-center justify-between gap-5 py-5"
          >
            <div>
              <p className="text-sm font-medium">{label}</p>
              <p className="mt-1 text-xs text-muted">{description}</p>
            </div>
            <Toggle
              checked={prefs[key]}
              onChange={(value) => update(key, value)}
            />
          </div>
        ))}
      </div>
      <Button className="mt-5" disabled={saving} onClick={save}>
        {saving && <Loader2 className="animate-spin" />}Save preferences
      </Button>
    </>
  );
}
