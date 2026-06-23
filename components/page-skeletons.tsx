import { Card } from "@/components/ui";

function Line({ className }: { className: string }) {
  return <div className={`rounded bg-[#ecece8] ${className}`} />;
}

function HeaderSkeleton({ action = false }: { action?: boolean }) {
  return (
    <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div className="w-full">
        <Line className="h-3 w-24" />
        <Line className="mt-4 h-8 w-72 max-w-full" />
        <Line className="mt-3 h-4 w-[34rem] max-w-full" />
      </div>
      {action && <Line className="h-10 w-32 shrink-0" />}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="animate-pulse">
      <HeaderSkeleton action />
      <div className="grid gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <Card key={item} className="p-5">
            <div className="flex items-center justify-between">
              <div className="h-9 w-9 rounded-lg bg-[#ecece8]" />
              <Line className="h-3 w-16" />
            </div>
            <Line className="mt-5 h-7 w-16" />
            <Line className="mt-3 h-4 w-32" />
          </Card>
        ))}
      </div>
      <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_340px]">
        <section>
          <Line className="h-6 w-44" />
          <Line className="mt-3 h-4 w-52" />
          <div className="mt-5 space-y-3">
            {[1, 2, 3, 4].map((item) => (
              <Card key={item} className="p-4">
                <div className="flex items-center gap-4">
                  <div className="h-11 w-11 rounded-xl bg-[#ecece8]" />
                  <div className="flex-1">
                    <Line className="h-4 w-2/5" />
                    <Line className="mt-3 h-3 w-3/5" />
                  </div>
                  <Line className="h-8 w-20" />
                </div>
              </Card>
            ))}
          </div>
        </section>
        <aside>
          <Card className="p-5">
            <Line className="h-4 w-28" />
            <Line className="mt-4 h-6 w-48" />
            <Line className="mt-4 h-3 w-full" />
            <Line className="mt-3 h-3 w-4/5" />
            <Line className="mt-6 h-10 w-full" />
          </Card>
          <Card className="mt-4 p-5">
            <Line className="h-4 w-32" />
            <Line className="mt-4 h-3 w-full" />
            <Line className="mt-4 h-2 w-full" />
          </Card>
        </aside>
      </div>
    </div>
  );
}

export function UploadSkeleton() {
  return (
    <div className="mx-auto max-w-4xl animate-pulse">
      <Line className="mb-6 h-4 w-36" />
      <HeaderSkeleton />
      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <div className="space-y-5">
          <Card className="p-5">
            <div className="rounded-xl border border-dashed border-[#d7d6d0] bg-canvas px-5 py-10 text-center">
              <div className="mx-auto h-12 w-12 rounded-xl bg-[#ecece8]" />
              <Line className="mx-auto mt-5 h-5 w-56" />
              <Line className="mx-auto mt-3 h-3 w-64" />
            </div>
          </Card>
          <Card className="p-5">
            <Line className="h-5 w-40" />
            <Line className="mt-6 h-4 w-24" />
            <div className="mt-3 grid grid-cols-3 gap-2">
              {[1, 2, 3].map((item) => (
                <Line key={item} className="h-10 w-full" />
              ))}
            </div>
            <Line className="mt-6 h-4 w-24" />
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {[1, 2, 3, 4].map((item) => (
                <Line key={item} className="h-12 w-full" />
              ))}
            </div>
          </Card>
        </div>
        <aside className="space-y-4">
          {[1, 2].map((item) => (
            <Card key={item} className="p-5">
              <Line className="h-5 w-32" />
              <Line className="mt-4 h-3 w-full" />
              <Line className="mt-3 h-3 w-4/5" />
            </Card>
          ))}
        </aside>
      </div>
    </div>
  );
}

export function StudySetSkeleton() {
  return (
    <div className="animate-pulse">
      <HeaderSkeleton action />
      <div className="mb-6 flex gap-4 border-b border-border">
        {[1, 2, 3, 4].map((item) => (
          <Line key={item} className="mb-3 h-5 w-20" />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Card className="p-6">
            <Line className="h-7 w-28" />
            <Line className="mt-5 h-6 w-64 max-w-full" />
            <div className="mt-6 space-y-3">
              {[1, 2, 3, 4, 5].map((item) => (
                <Line key={item} className="h-3 w-full" />
              ))}
              <Line className="h-3 w-4/5" />
            </div>
          </Card>
          <Card className="divide-y divide-border">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="flex items-center gap-4 p-5">
                <div className="h-8 w-8 rounded-lg bg-[#ecece8]" />
                <div className="flex-1">
                  <Line className="h-4 w-2/5" />
                  <Line className="mt-3 h-3 w-4/5" />
                </div>
              </div>
            ))}
          </Card>
        </div>
        <aside className="space-y-3">
          {[1, 2, 3, 4].map((item) => (
            <Card key={item} className="p-5">
              <Line className="h-4 w-32" />
              <Line className="mt-4 h-3 w-full" />
              <Line className="mt-4 h-2 w-full" />
            </Card>
          ))}
        </aside>
      </div>
    </div>
  );
}

export function ReportSkeleton() {
  return (
    <div className="animate-pulse">
      <HeaderSkeleton action />
      <div className="mb-6 flex gap-2">
        <Line className="h-7 w-24 rounded-full" />
        <Line className="h-7 w-52 rounded-full" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <Card key={item} className="p-5">
            <div className="flex justify-between">
              <div className="h-9 w-9 rounded-lg bg-[#ecece8]" />
              <Line className="h-4 w-4" />
            </div>
            <Line className="mt-5 h-7 w-16" />
            <Line className="mt-3 h-4 w-32" />
          </Card>
        ))}
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_360px]">
        <Card className="p-6">
          <Line className="h-5 w-44" />
          <Line className="mt-3 h-3 w-64" />
          <div className="mt-8 flex h-52 items-end justify-between gap-3 border-b border-border px-2">
            {[45, 70, 35, 85, 55, 65, 40].map((height, index) => (
              <div
                key={index}
                className="w-full max-w-10 rounded-t-md bg-[#ecece8]"
                style={{ height: `${height}%` }}
              />
            ))}
          </div>
        </Card>
        <Card className="p-6">
          <Line className="h-5 w-36" />
          <Line className="mt-3 h-3 w-52" />
          <div className="mx-auto my-7 h-32 w-32 rounded-full bg-[#ecece8]" />
          <Line className="mx-auto h-3 w-56" />
        </Card>
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {[1, 2].map((item) => (
          <Card key={item} className="p-6">
            <Line className="h-5 w-40" />
            <Line className="mt-3 h-3 w-56" />
            <div className="mt-6 space-y-5">
              {[1, 2, 3].map((row) => (
                <div key={row}>
                  <div className="mb-2 flex justify-between">
                    <Line className="h-4 w-36" />
                    <Line className="h-4 w-16" />
                  </div>
                  <Line className="h-2 w-full" />
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
