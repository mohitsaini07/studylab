"use client";
import Link from "next/link";
import { useRef, useState } from "react";
import {
  ArrowLeft,
  Check,
  FileText,
  Loader2,
  ShieldCheck,
  UploadCloud,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button, Card, PageHeader, Progress } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";

type State = "idle" | "selected" | "processing" | "done";
type Result = {
  id: string;
  summary: boolean;
  topics: number;
  questions: number;
  flashcards: number;
};
type OptionKey = "summary" | "topics" | "questions" | "flashcards";
const MAX_PDF_SIZE = 25 * 1024 * 1024;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const imageTypes = ["image/png", "image/jpeg", "image/webp"];
const optionLabels: [OptionKey, string][] = [
  ["summary", "AI summary"],
  ["topics", "Important topics"],
  ["questions", "Practice questions"],
  ["flashcards", "Flashcards"],
];

function getUploadContentType(file: File, fileKind: "pdf" | "image") {
  if (file.type) return file.type;
  if (fileKind === "pdf") return "application/pdf";

  const name = file.name.toLowerCase();
  if (name.endsWith(".png")) return "image/png";
  if (name.endsWith(".webp")) return "image/webp";
  return "image/jpeg";
}

export default function Upload() {
  const [state, setState] = useState<State>("idle");
  const input = useRef<HTMLInputElement>(null);
  const [difficulty, setDifficulty] = useState("Balanced");
  const [options, setOptions] = useState<Record<OptionKey, boolean>>({
    summary: true,
    topics: true,
    questions: true,
    flashcards: true,
  });
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<Result | null>(null);
  const hasSelection = Object.values(options).some(Boolean);
  const fileKind =
    file &&
    (file.type.startsWith("image/") || /\.(png|jpe?g|webp)$/i.test(file.name))
      ? "image"
      : "pdf";
  const uploadContentType = file
    ? getUploadContentType(file, fileKind)
    : "application/pdf";
  const nextSteps =
    fileKind === "image"
      ? [
          "We read image text with OCR",
          "StudyLab creates your selected material",
          "You review, practice, and improve",
        ]
      : [
          "We extract and organize key ideas",
          "StudyLab creates your selected material",
          "You review, practice, and improve",
        ];
  function pick(candidate?: File) {
    const selected = candidate ?? input.current?.files?.[0];
    if (!selected) return;

    const isPdf =
      selected.type === "application/pdf" ||
      selected.name.toLowerCase().endsWith(".pdf");
    const isImage =
      imageTypes.includes(selected.type) ||
      /\.(png|jpe?g|webp)$/i.test(selected.name);

    if (!isPdf && !isImage) {
      toast.error("Please choose a PDF, PNG, JPG, or WebP file");
      return;
    }
    if (isPdf && selected.size > MAX_PDF_SIZE) {
      toast.error("PDF must be smaller than 25 MB");
      return;
    }
    if (isImage && selected.size > MAX_IMAGE_SIZE) {
      toast.error("Image must be smaller than 5 MB");
      return;
    }
    setFile(selected);
    setState("selected");
    toast.success(`${isImage ? "Image" : "PDF"} added successfully`);
  }
  function reset() {
    setFile(null);
    setState("idle");
    setResult(null);
    setProgress(0);
    if (input.current) input.current.value = "";
  }
  async function generate() {
    if (!file || !hasSelection) {
      toast.error("Choose at least one item to generate");
      return;
    }
    setState("processing");
    setProgress(0);

    try {
      const supabase = createClient();
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setState("selected");
        toast.error("Please sign in again before uploading.");
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
      const storagePath = `${user.id}/${crypto.randomUUID()}-${safeName}`;

      setProgress(18);
      const { error: uploadError } = await supabase.storage
        .from("study-pdfs")
        .upload(storagePath, file, {
          contentType: uploadContentType,
          upsert: false,
        });

      if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

      setProgress(42);
      const response = await fetch("/api/study-sets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(session?.access_token
            ? { Authorization: `Bearer ${session.access_token}` }
            : {}),
        },
        body: JSON.stringify({
          storagePath,
          fileName: file.name,
          fileSize: file.size,
          contentType: uploadContentType,
          difficulty,
          options,
        }),
      });

      const body: { error?: string } & Partial<Result> = await response
        .json()
        .catch(() => ({}));

      if (response.ok && body.id) {
        setProgress(100);
        setResult(body as Result);
        setState("done");
        toast.success("Study set generated");
      } else {
        setState("selected");
        toast.error(body.error || "Could not generate the study set");
      }
    } catch (error) {
      setState("selected");
      toast.error(
        error instanceof Error
          ? error.message
          : "Network error. Please try again.",
      );
    }
  }
  const resultItems = result
    ? [
        [result.summary ? 1 : 0, "Summary"],
        [result.topics, "Topics"],
        [result.questions, "Questions"],
        [result.flashcards, "Flashcards"],
      ].filter((x) => Number(x[0]) > 0)
    : [];
  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href="/dashboard"
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted hover:text-ink"
      >
        <ArrowLeft size={15} />
        Back to dashboard
      </Link>
      <PageHeader
        eyebrow="New study set"
        title="Upload your study material"
        description="Add a text-based PDF or a clear study image and StudyLab will turn it into notes, questions, quizzes, and flashcards."
      />
      {state === "done" && result ? (
        <Card className="p-8 text-center sm:p-12">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-50 text-emerald-600">
            <Check size={25} />
          </div>
          <h2 className="mt-5 text-xl font-semibold">
            Your study set is ready
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">
            We created your selected learning material from {file?.name}.
          </p>
          <div
            className="mx-auto mt-7 grid max-w-lg gap-3"
            style={{
              gridTemplateColumns: `repeat(${Math.min(resultItems.length, 4)},minmax(0,1fr))`,
            }}
          >
            {resultItems.map((x) => (
              <div
                key={String(x[1])}
                className="rounded-lg border border-border p-3"
              >
                <b className="text-lg">{x[0]}</b>
                <p className="text-xs text-muted">{x[1]}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 flex justify-center gap-3">
            <Button variant="outline" onClick={reset}>
              Upload another
            </Button>
            <Button asChild>
              <Link href={`/study-set/${result.id}`}>Open study set</Link>
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
          <div className="space-y-5">
            <Card className="p-5">
              <div
                onClick={() => state !== "processing" && input.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  pick(e.dataTransfer.files[0]);
                }}
                className="cursor-pointer rounded-xl border border-dashed border-[#c9c9c3] bg-canvas px-5 py-10 text-center transition-colors hover:border-brand hover:bg-brand-soft/30"
              >
                <input
                  ref={input}
                  type="file"
                  accept="application/pdf,image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={() => pick()}
                />
                {state === "processing" ? (
                  <>
                    <Loader2
                      className="mx-auto animate-spin text-brand"
                      size={28}
                    />
                    <p className="mt-4 font-medium">Building your study set…</p>
                    <p className="mt-2 text-sm text-muted">
                      {fileKind === "image"
                        ? "Uploading, reading image text, and generating selected material"
                        : "Uploading, reading concepts, and generating selected material"}
                    </p>
                    <Progress
                      value={progress}
                      className="mx-auto mt-5 max-w-xs"
                    />
                    <p className="mt-2 text-xs text-muted">
                      {progress < 35
                        ? `${progress}% uploaded`
                        : "AI generation can take up to a minute"}
                    </p>
                  </>
                ) : (
                  <>
                    <span className="mx-auto grid h-12 w-12 place-items-center rounded-xl border border-border bg-white text-brand">
                      <UploadCloud size={22} />
                    </span>
                    <p className="mt-4 font-medium">
                      Drop your PDF or image here, or{" "}
                      <span className="text-brand">browse</span>
                    </p>
                    <p className="mt-2 text-xs text-muted">
                      PDF up to 25 MB · Images up to 5 MB · Clear text works best
                    </p>
                    <div className="mx-auto mt-4 inline-flex max-w-md items-center justify-center rounded-full border border-border bg-white px-3 py-1.5 text-xs text-muted">
                      For best results, upload text-based PDFs when possible or
                      clear, small images when needed.
                    </div>
                  </>
                )}
              </div>
              {state === "selected" && file && (
                <div className="mt-4 flex items-center gap-3 rounded-lg border border-border p-3">
                  <span className="grid h-10 w-10 place-items-center rounded-lg bg-red-50 text-red-600">
                    <FileText size={18} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-muted">
                      {(file.size / 1024 / 1024).toFixed(1)} MB
                    </p>
                  </div>
                  <button onClick={reset} className="text-muted hover:text-ink">
                    <X size={17} />
                  </button>
                </div>
              )}
            </Card>
            <Card className="p-5">
              <h2 className="font-semibold">Study preferences</h2>
              <div className="mt-5">
                <label className="text-sm font-medium">Difficulty</label>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {["Foundational", "Balanced", "Advanced"].map((x) => (
                    <button
                      key={x}
                      onClick={() => setDifficulty(x)}
                      className={`rounded-lg border px-2 py-2.5 text-xs font-medium ${difficulty === x ? "border-brand bg-brand-soft text-brand-dark" : "border-border text-muted hover:bg-canvas"}`}
                    >
                      {x}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mt-5">
                <label className="text-sm font-medium">Generate</label>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {optionLabels.map(([key, label]) => (
                    <label
                      key={key}
                      className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-3 text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={options[key]}
                        onChange={(e) =>
                          setOptions((current) => ({
                            ...current,
                            [key]: e.target.checked,
                          }))
                        }
                        className="h-4 w-4 accent-[#5b5bd6]"
                      />
                      {label}
                    </label>
                  ))}
                </div>
                {!hasSelection && (
                  <p className="mt-2 text-xs text-red-600">
                    Choose at least one item to generate.
                  </p>
                )}
              </div>
            </Card>
            <Button
              className="w-full"
              size="lg"
              disabled={state !== "selected" || !hasSelection}
              onClick={generate}
            >
              {state === "processing" ? (
                <Loader2 className="animate-spin" />
              ) : (
                "Generate study set"
              )}
            </Button>
          </div>
          <aside>
            <Card className="p-5">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <ShieldCheck size={17} className="text-brand" />
                Your content is private
              </div>
              <p className="mt-3 text-xs leading-5 text-muted">
                Files are stored in your private folder and can only be accessed by your account.
                Images use OCR and may consume more AI quota than text-based PDFs.
              </p>
            </Card>
            <div className="mt-5">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">
                What happens next
              </p>
              {nextSteps.map((x, i) => (
                <div key={x} className="flex gap-3 py-3">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-soft text-[11px] font-semibold text-brand">
                    {i + 1}
                  </span>
                  <p className="text-sm leading-6 text-muted">{x}</p>
                </div>
              ))}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
