import type { CircuitJson } from "@/lib/circuit/types";

export interface ChatTurn {
  role: "user" | "model";
  content: string;
}

export interface AskAgentParams {
  userId: string;
  question?: string;
  circuit?: CircuitJson | null;
  moduleCode?: string | null;
  history?: ChatTurn[];
}

export interface AskAgentResult {
  answer: string;
  intent: string;
}

export async function askAgent(params: AskAgentParams): Promise<AskAgentResult> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
  const res = await fetch(`${apiUrl}/api/agent/ask`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_id: params.userId,
      question: params.question,
      circuit: params.circuit ?? undefined,
      module_code: params.moduleCode ?? undefined,
      history: params.history ?? [],
    }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const detail = body?.detail;
    throw new Error(typeof detail === "string" ? detail : `Agent request failed (${res.status})`);
  }

  return res.json();
}
