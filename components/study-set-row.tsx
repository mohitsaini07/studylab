"use client";
import Link from "next/link";
import { FileText, Loader2, MoreHorizontal, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Card, Progress } from "@/components/ui";
import type { StudySet } from "@/lib/types";
export function StudySetRow({ studySet: s }: { studySet: StudySet }) {
  const router = useRouter();
  const [menu, setMenu] = useState(false);
  const [deleting, setDeleting] = useState(false);
  async function remove() {
    if (!confirm(`Delete “${s.title}” and its quiz history?`)) return;
    setDeleting(true);
    const response = await fetch(`/api/study-sets/${s.id}`, {
      method: "DELETE",
    });
    const body = await response.json();
    if (!response.ok) {
      toast.error(body.error || "Could not delete study set");
      setDeleting(false);
      return;
    }
    toast.success("Study set deleted");
    router.refresh();
  }
  return (
    <Card className="group relative p-4 transition-colors hover:border-[#d5d5d0]">
      <div className="flex items-center gap-4">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand">
          <FileText size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <Link
                href={`/study-set/${s.id}`}
                className="break-words font-semibold group-hover:text-brand"
              >
                {s.title}
              </Link>
              <p className="mt-1 text-xs text-muted">
                {s.page_count || "—"} pages ·{" "}
                {new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(
                  Math.round(
                    (new Date(s.created_at).getTime() - Date.now()) / 86400000,
                  ),
                  "day",
                )}
              </p>
            </div>
            <button
              aria-label={`Actions for ${s.title}`}
              onClick={() => setMenu(!menu)}
              className="shrink-0 text-muted"
            >
              <MoreHorizontal size={18} />
            </button>
            {menu && (
              <div className="absolute right-4 top-11 z-10 rounded-lg border border-border bg-white p-1 shadow-soft">
                <button
                  onClick={remove}
                  disabled={deleting}
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-xs text-red-600 hover:bg-red-50"
                >
                  {deleting ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Trash2 size={14} />
                  )}
                  Delete study set
                </button>
              </div>
            )}
          </div>
          <div className="mt-3 flex items-center gap-3">
            <Progress
              value={
                s.status === "ready" ? 100 : s.status === "failed" ? 0 : 45
              }
              className="h-1.5 flex-1"
            />
            <span
              className={`text-xs ${s.status === "failed" ? "text-red-600" : "text-muted"}`}
            >
              {s.status}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
