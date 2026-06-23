import { Settings2 } from "lucide-react";
import { Card } from "@/components/ui";
import { Logo } from "@/components/logo";
export function ConfigurationRequired() {
  return (
    <main className="grid min-h-screen place-items-center bg-canvas p-6">
      <Card className="max-w-lg p-8 text-center">
        <div className="flex justify-center">
          <Logo />
        </div>
        <div className="mx-auto mt-8 grid h-12 w-12 place-items-center rounded-xl bg-brand-soft text-brand">
          <Settings2 size={22} />
        </div>
        <h1 className="mt-5 text-xl font-semibold">Connect your backend</h1>
        <p className="mt-2 text-sm leading-6 text-muted">
          Copy <code>.env.example</code> to <code>.env.local</code>, add your
          Supabase and Gemini credentials, then restart the development server.
        </p>
      </Card>
    </main>
  );
}
