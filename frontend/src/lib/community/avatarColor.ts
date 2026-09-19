const AVATAR_PALETTE = ["#8e6ff7", "#4b8bf5", "#ec6cb9", "#f6b93b", "#34c77b", "#f97316"];

export function avatarColor(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return AVATAR_PALETTE[h % AVATAR_PALETTE.length];
}
