import type { CircuitJson } from "@/lib/circuit/types";

export interface RunResult {
  counts: Record<string, number>;
  statevector: [number, number][];
  bloch_vector: [number, number, number] | null;
}

export async function runCircuit(
  circuit: CircuitJson,
  backendName = "qiskit_aer"
): Promise<RunResult> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
  const res = await fetch(`${apiUrl}/circuits/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ circuit, backend_name: backendName }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const detail = body?.detail;
    throw new Error(
      typeof detail === "string" ? detail : `Run failed (${res.status})`
    );
  }

  return res.json();
}
