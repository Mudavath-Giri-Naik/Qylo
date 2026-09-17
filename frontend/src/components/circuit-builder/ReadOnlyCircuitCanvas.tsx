"use client";

import CircuitCanvas from "@/components/circuit-builder/CircuitCanvas";
import type { CircuitJson } from "@/lib/circuit/types";

export default function ReadOnlyCircuitCanvas({ circuit }: { circuit: CircuitJson }) {
  return (
    <CircuitCanvas
      circuit={circuit}
      pendingCnotControl={null}
      selectedGateIndex={null}
      onDropGate={() => {}}
      onWireClick={() => {}}
      onSelectGate={() => {}}
    />
  );
}
