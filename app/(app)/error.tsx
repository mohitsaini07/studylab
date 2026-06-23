"use client";
import { AlertCircle } from "lucide-react";
import { Button, Card } from "@/components/ui";
export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="grid min-h-[60vh] place-items-center">
      <Card className="max-w-md p-8 text-center">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-red-50 text-red-600">
          <AlertCircle size={22} />
        </div>
        <h1 className="mt-5 text-xl font-semibold">Something didn’t load</h1>
        <p className="mt-2 text-sm leading-6 text-muted">
          Your work is safe. Try loading this section again.
        </p>
        <Button className="mt-6" onClick={reset}>
          Try again
        </Button>
      </Card>
    </div>
  );
}
