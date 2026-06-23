import { createClient } from "@/lib/supabase/server";
import { SettingsClient, type Preferences } from "@/components/settings-client";
import { getAvatarUrl, getFullName } from "@/lib/profile";
export const dynamic = "force-dynamic";
const defaults: Preferences = {
  daily_reminder: true,
  weekly_report: true,
  study_set_ready: true,
  product_updates: false,
  compact_sidebar: false,
  reduce_motion: false,
  keep_pdfs: true,
  learning_analytics: true,
};
export default async function Settings() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const [
    { data },
    { count: studySets },
    { data: attempts },
    { data: reviews },
  ] = user
    ? await Promise.all([
        supabase
          .from("user_settings")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle(),
        supabase
          .from("study_sets")
          .select("id", { count: "exact", head: true }),
        supabase.from("quiz_attempts").select("score,total_questions"),
        supabase.from("flashcard_reviews").select("reviewed_count"),
      ])
    : [
        { data: null },
        { count: 0 },
        { data: [] },
        { data: [] },
      ];
  const fullName = getFullName(null, user?.user_metadata);
  const averageScore = attempts?.length
    ? Math.round(
        (attempts.reduce(
          (total, attempt) => total + attempt.score / attempt.total_questions,
          0,
        ) /
          attempts.length) *
          100,
      )
    : 0;
  const flashcardsReviewed =
    reviews?.reduce((total, review) => total + review.reviewed_count, 0) ?? 0;
  return (
    <SettingsClient
      fullName={fullName}
      avatarUrl={getAvatarUrl(null, user?.user_metadata)}
      email={user?.email ?? ""}
      joinedAt={user?.created_at}
      stats={{
        studySets: studySets ?? 0,
        quizAttempts: attempts?.length ?? 0,
        averageScore,
        flashcardsReviewed,
      }}
      preferences={{ ...defaults, ...data }}
    />
  );
}
