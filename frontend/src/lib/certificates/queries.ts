import { createClient } from "@/lib/supabase/server";
import { getDashboardData, type ModuleProgress } from "@/lib/dashboard/queries";

export interface ModuleCertificate extends ModuleProgress {
  earned: boolean;
  /** When the last lesson/challenge that completed the module happened. */
  issuedAt: string | null;
  percent: number;
  credentialId: string;
}

// A short, stable, human-readable id per user+module -- not a security
// token, just something a certificate can print and a person can quote.
function credentialId(userId: string, moduleCode: string): string {
  let hash = 0;
  for (const ch of `${userId}:${moduleCode}`) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return `QYLO-${moduleCode.replace("QT-", "")}-${hash.toString(36).toUpperCase().padStart(7, "0").slice(0, 7)}`;
}

/** A module certificate is earned once every lesson is read and every
    challenge in it is solved. */
export async function getModuleCertificates(userId: string): Promise<ModuleCertificate[]> {
  const supabase = await createClient();
  const [{ modules }, { data: progress }, { data: submissions }, { data: challenges }] = await Promise.all([
    getDashboardData(userId),
    supabase.from("progress").select("module_code, last_accessed").eq("user_id", userId).eq("status", "completed"),
    supabase.from("submissions").select("challenge_id, score, timestamp").eq("user_id", userId).gte("score", 70),
    supabase.from("challenges").select("id, module_code"),
  ]);

  const moduleByChallenge = new Map((challenges ?? []).map((c) => [c.id, c.module_code as string]));
  const latestByModule = new Map<string, string>();
  const bump = (code: string | undefined, iso: string) => {
    if (!code) return;
    const current = latestByModule.get(code);
    if (!current || iso > current) latestByModule.set(code, iso);
  };
  for (const p of progress ?? []) bump(p.module_code, p.last_accessed);
  for (const s of submissions ?? []) bump(moduleByChallenge.get(s.challenge_id), s.timestamp);

  return modules.map((m) => {
    const total = m.totalLessons + m.totalChallenges;
    const done = Math.min(m.lessonsRead, m.totalLessons) + m.challengesPassed;
    const earned = total > 0 && done >= total;
    return {
      ...m,
      earned,
      issuedAt: earned ? latestByModule.get(m.module_code) ?? null : null,
      percent: total > 0 ? Math.round((done / total) * 100) : 0,
      credentialId: credentialId(userId, m.module_code),
    };
  });
}
