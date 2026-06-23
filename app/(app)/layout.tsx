import { AppShell } from "@/components/app-shell";
import { ConfigurationRequired } from "@/components/configuration-required";
import { getAvatarUrl, getFullName } from "@/lib/profile";
import { hasSupabaseEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!hasSupabaseEnv()) return <ConfigurationRequired />;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ count }, { data: latest }] = user
    ? await Promise.all([
        supabase
          .from("study_sets")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id),
        supabase
          .from("study_sets")
          .select("id")
          .eq("user_id", user.id)
          .eq("status", "ready")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
      ])
    : [{ count: 0 }, { data: null }];

  const name = getFullName(null, user?.user_metadata);
  const avatarUrl = getAvatarUrl(null, user?.user_metadata);

  return (
    <AppShell
      name={name}
      avatarUrl={avatarUrl}
      studySetCount={count ?? 0}
      latestStudySetId={latest?.id}
    >
      {children}
    </AppShell>
  );
}
