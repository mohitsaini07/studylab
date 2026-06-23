export type UserProfile = {
  first_name?: string | null;
  last_name?: string | null;
  avatar_url?: string | null;
};

type Metadata = Record<string, unknown> | null | undefined;

function stringValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export function profileFromMetadata(metadata: Metadata): UserProfile {
  const fullName =
    stringValue(metadata?.full_name) || stringValue(metadata?.name);
  const [first = "", ...rest] = fullName.split(/\s+/).filter(Boolean);
  return {
    first_name: stringValue(metadata?.first_name) || first,
    last_name: stringValue(metadata?.last_name) || rest.join(" "),
    avatar_url:
      stringValue(metadata?.avatar_url) ||
      stringValue(metadata?.picture) ||
      stringValue(metadata?.photo_url),
  };
}

export function getFullName(
  profile?: UserProfile | null,
  metadata?: Metadata,
  fallback = "Learner",
) {
  const meta = profileFromMetadata(metadata);
  const first = (profile?.first_name || meta.first_name || "").trim();
  const last = (profile?.last_name || meta.last_name || "").trim();
  return [first, last].filter(Boolean).join(" ") || fallback;
}

export function getFirstName(
  profile?: UserProfile | null,
  metadata?: Metadata,
  fallback = "Learner",
) {
  const fullName = getFullName(profile, metadata, fallback);
  return fullName.split(/\s+/)[0] || fallback;
}

export function getAvatarUrl(profile?: UserProfile | null, metadata?: Metadata) {
  const meta = profileFromMetadata(metadata);
  return (profile?.avatar_url || meta.avatar_url || "").trim();
}

export function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "S";
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}
