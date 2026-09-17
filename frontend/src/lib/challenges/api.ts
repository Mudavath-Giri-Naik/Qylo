import type { CircuitJson } from "@/lib/circuit/types";

export interface SubmitResult {
  passed: boolean;
  score: number;
  ai_feedback: string | null;
}

export async function submitChallenge(
  challengeId: string,
  params: { userId: string; selectedIndex?: number; circuit?: CircuitJson }
): Promise<SubmitResult> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
  const res = await fetch(`${apiUrl}/challenges/${challengeId}/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_id: params.userId,
      selected_index: params.selectedIndex,
      circuit: params.circuit,
    }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const detail = body?.detail;
    throw new Error(typeof detail === "string" ? detail : `Submission failed (${res.status})`);
  }

  return res.json();
}
