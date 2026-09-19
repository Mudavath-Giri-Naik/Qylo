import { createClient } from "@/lib/supabase/server";
import type { Challenge } from "@/lib/challenges/types";

export async function getChallenges(): Promise<Challenge[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("challenges")
    .select("id, module_code, difficulty, prompt, starter_data, grading_rule, created_at")
    .order("module_code", { ascending: true })
    .order("created_at", { ascending: true });

  if (error || !data) return [];
  return data as unknown as Challenge[];
}

export function groupByModule(challenges: Challenge[]): Map<string, Challenge[]> {
  const map = new Map<string, Challenge[]>();
  for (const c of challenges) {
    const list = map.get(c.module_code) ?? [];
    list.push(c);
    map.set(c.module_code, list);
  }
  return map;
}

export async function getPassedChallengeIds(userId: string): Promise<Set<string>> {
  const supabase = await createClient();
  const { data } = await supabase.from("submissions").select("challenge_id, score").eq("user_id", userId);

  const passed = new Set<string>();
  for (const s of data ?? []) {
    if ((s.score ?? 0) >= 70) passed.add(s.challenge_id);
  }
  return passed;
}
