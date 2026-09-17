import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { CircuitJson } from "@/lib/circuit/types";
import type { RunResult } from "@/lib/circuit/api";
import ReadOnlyCircuitCanvas from "@/components/circuit-builder/ReadOnlyCircuitCanvas";
import Histogram from "@/components/circuit-builder/Histogram";
import BlochSphere from "@/components/circuit-builder/BlochSphere";
import QSphere from "@/components/circuit-builder/QSphere";

async function getSharedCircuit(id: string): Promise<CircuitJson | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("circuits").select("circuit_json").eq("id", id).single();
  return (data?.circuit_json as unknown as CircuitJson) ?? null;
}

async function runShared(circuit: CircuitJson): Promise<RunResult | null> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
    const res = await fetch(`${apiUrl}/circuits/run`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ circuit, backend_name: "qiskit_aer" }),
      cache: "no-store",
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function SharedCircuitPage({
  params,
}: PageProps<"/circuit/[id]/view">) {
  const { id } = await params;
  const circuit = await getSharedCircuit(id);
  if (!circuit) notFound();

  const runResult = await runShared(circuit);

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <Link href="/" className="text-sm text-[var(--foreground-muted)] hover:text-[var(--foreground)]">
        ← Qylo
      </Link>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--foreground)]">
        Shared circuit
      </h1>
      <p className="mt-1 text-sm text-[var(--foreground-muted)]">
        A read-only view of a saved circuit and its most recent run. No login required.
      </p>

      <div className="mt-6">
        <ReadOnlyCircuitCanvas circuit={circuit} />
      </div>

      <section className="mt-6 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)]">
        <h2 className="text-sm font-semibold text-[var(--foreground)]">Results</h2>
        {!runResult && (
          <p className="mt-2 text-sm text-[var(--foreground-muted)]">
            Couldn&apos;t reach the simulator to re-run this circuit right now.
          </p>
        )}
        {runResult && (
          <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--foreground-subtle)]">
                Measurement probabilities
              </h3>
              <Histogram counts={runResult.counts} />
            </div>
            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--foreground-subtle)]">
                {runResult.bloch_vector ? "Bloch sphere" : "Q-sphere"}
              </h3>
              {runResult.bloch_vector ? (
                <BlochSphere vector={runResult.bloch_vector} />
              ) : (
                <QSphere statevector={runResult.statevector} numQubits={circuit.num_qubits} />
              )}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
