export default function Loading() {
  return (
    <div className="animate-pulse">
      <div className="h-3 w-24 rounded bg-[#e5e5e1]" />
      <div className="mt-4 h-8 w-72 rounded bg-[#e5e5e1]" />
      <div className="mt-3 h-4 w-96 max-w-full rounded bg-[#e5e5e1]" />
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((x) => (
          <div
            key={x}
            className="h-36 rounded-xl border border-border bg-white p-5"
          >
            <div className="h-9 w-9 rounded-lg bg-[#ecece8]" />
            <div className="mt-5 h-5 w-24 rounded bg-[#ecece8]" />
            <div className="mt-2 h-3 w-32 rounded bg-[#ecece8]" />
          </div>
        ))}
      </div>
    </div>
  );
}
