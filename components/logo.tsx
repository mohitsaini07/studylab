import Link from "next/link";
export function Logo() {
  return (
    <Link
      href="/"
      className="flex items-center gap-2.5 font-semibold tracking-tight text-ink"
    >
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand text-sm font-bold text-white">
        S
      </span>
      <span>StudyLab</span>
    </Link>
  );
}
