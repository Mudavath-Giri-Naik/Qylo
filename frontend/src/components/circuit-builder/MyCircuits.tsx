"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { CircuitJson } from "@/lib/circuit/types";

interface SavedCircuit {
  id: string;
  circuit_json: CircuitJson;
  created_at: string;
}

export default function MyCircuits({
  refreshKey,
  onLoad,
}: {
  refreshKey: number;
  onLoad: (circuit: CircuitJson) => void;
}) {
  const [circuits, setCircuits] = useState<SavedCircuit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const supabase = createClient();
      const { data } = await supabase
        .from("circuits")
        .select("id, circuit_json, created_at")
        .order("created_at", { ascending: false })
        .limit(20);
      if (!cancelled) {
        setCircuits((data as unknown as SavedCircuit[]) ?? []);
        setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  if (loading) {
    return <p className="text-xs text-[var(--foreground-subtle)]">Loading...</p>;
  }

  if (circuits.length === 0) {
    return <p className="text-xs text-[var(--foreground-subtle)]">No saved circuits yet.</p>;
  }

  return (
    <ul className="flex flex-col gap-1.5">
      {circuits.map((c) => (
        <li key={c.id}>
          <button
            type="button"
            onClick={() => onLoad(c.circuit_json)}
            className="w-full rounded-lg border border-[var(--border)] px-3 py-2 text-left text-xs transition-colors hover:border-[var(--accent)] hover:bg-[var(--surface-hover)]"
          >
            <span className="font-medium text-[var(--foreground)]">
              {c.circuit_json.num_qubits} qubit{c.circuit_json.num_qubits === 1 ? "" : "s"} ·{" "}
              {c.circuit_json.gates.length} gate{c.circuit_json.gates.length === 1 ? "" : "s"}
            </span>
            <br />
            <span className="text-[var(--foreground-subtle)]">
              {new Date(c.created_at).toLocaleString()}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
