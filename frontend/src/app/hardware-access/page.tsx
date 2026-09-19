import { createClient } from "@/lib/supabase/server";
import type { CircuitJson } from "@/lib/circuit/types";
import HardwareBoard, { type RecentCircuit } from "@/components/hardware/HardwareBoard";

export default async function HardwareAccessPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let recentCircuits: RecentCircuit[] = [];
  if (user) {
    const { data } = await supabase
      .from("circuits")
      .select("id, circuit_json, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(8);

    recentCircuits = (data ?? []).map((row) => ({
      id: row.id as string,
      numQubits: (row.circuit_json as unknown as CircuitJson)?.num_qubits ?? 0,
      createdAt: row.created_at as string,
    }));
  }

  return <HardwareBoard recentCircuits={recentCircuits} loggedIn={!!user} />;
}
