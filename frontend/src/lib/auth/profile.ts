import type { User } from "@supabase/supabase-js";

type MinimalUser = Pick<User, "user_metadata"> | null | undefined;

// Google (and most OAuth providers wired through Supabase) put the profile's
// display name and photo in user_metadata under these keys -- "name"/"picture"
// are the raw Google claim names, "full_name"/"avatar_url" are what Supabase's
// own examples normalize them to, so both are checked.
export function oauthFullName(user: MinimalUser): string | null {
  const meta = user?.user_metadata as Record<string, unknown> | undefined;
  const name = (meta?.full_name ?? meta?.name) as string | undefined;
  return typeof name === "string" && name.trim() ? name.trim() : null;
}

export function oauthAvatarUrl(user: MinimalUser): string | null {
  const meta = user?.user_metadata as Record<string, unknown> | undefined;
  const url = (meta?.avatar_url ?? meta?.picture) as string | undefined;
  return typeof url === "string" && url.trim() ? url.trim() : null;
}

export function firstName(fullName: string | null): string | null {
  if (!fullName) return null;
  return fullName.trim().split(/\s+/)[0] ?? null;
}
