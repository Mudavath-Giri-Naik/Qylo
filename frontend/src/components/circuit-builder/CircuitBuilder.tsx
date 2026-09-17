"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { runCircuit, type RunResult } from "@/lib/circuit/api";
import {
  maxStep,
  placeSingleQubitGate,
  placeTwoQubitGate,
  removeGate,
  setQubitCount,
  updateGateAngle,
} from "@/lib/circuit/placement";
import { ANGLE_PRESETS, emptyCircuit, gateDef, type CircuitJson, type GateType } from "@/lib/circuit/types";
import GatePalette from "@/components/circuit-builder/GatePalette";
import CircuitCanvas from "@/components/circuit-builder/CircuitCanvas";
import CodeView from "@/components/circuit-builder/CodeView";
import Histogram from "@/components/circuit-builder/Histogram";
import BlochSphere from "@/components/circuit-builder/BlochSphere";
import AmplitudeList from "@/components/circuit-builder/AmplitudeList";
import MyCircuits from "@/components/circuit-builder/MyCircuits";

const DEFAULT_ANGLE = Math.PI / 2;

export default function CircuitBuilder() {
  const [circuit, setCircuit] = useState<CircuitJson>(emptyCircuit(2));
  const [mode, setMode] = useState<"canvas" | "code">("canvas");
  const [pendingCnotControl, setPendingCnotControl] = useState<number | null>(null);
  const [selectedGateIndex, setSelectedGateIndex] = useState<number | null>(null);

  const [running, setRunning] = useState(false);
  const [runError, setRunError] = useState<string | null>(null);
  const [runResult, setRunResult] = useState<RunResult | null>(null);

  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  function resetInteractionState() {
    setPendingCnotControl(null);
    setSelectedGateIndex(null);
  }

  function handleQubitCountChange(n: number) {
    setCircuit((c) => setQubitCount(c, n));
    resetInteractionState();
  }

  function handleDropGate(qubit: number, type: GateType) {
    if (type === "CNOT") {
      setPendingCnotControl(qubit);
      return;
    }
    const def = gateDef(type);
    setCircuit((c) => placeSingleQubitGate(c, type, qubit, def.hasAngle ? DEFAULT_ANGLE : undefined));
  }

  function handleWireClick(qubit: number) {
    if (pendingCnotControl === null) return;
    if (qubit === pendingCnotControl) {
      setPendingCnotControl(null);
      return;
    }
    setCircuit((c) => placeTwoQubitGate(c, "CNOT", pendingCnotControl, qubit));
    setPendingCnotControl(null);
  }

  function handleSelectGate(index: number) {
    setSelectedGateIndex((prev) => (prev === index ? null : index));
  }

  function handleApplyCircuit(next: CircuitJson) {
    setCircuit(next);
    resetInteractionState();
  }

  async function handleRun() {
    setRunning(true);
    setRunError(null);
    try {
      const result = await runCircuit(circuit);
      setRunResult(result);
    } catch (err) {
      setRunError(err instanceof Error ? err.message : "Run failed.");
      setRunResult(null);
    } finally {
      setRunning(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    setSaveMessage(null);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setSaveMessage("You must be logged in to save.");
      setSaving(false);
      return;
    }
    const { error } = await supabase
      .from("circuits")
      .insert({ user_id: user.id, circuit_json: circuit as unknown as Record<string, unknown> });
    setSaving(false);
    if (error) {
      setSaveMessage(error.message);
    } else {
      setSaveMessage("Saved.");
      setRefreshKey((k) => k + 1);
    }
  }

  const selectedGate = selectedGateIndex !== null ? circuit.gates[selectedGateIndex] : null;

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Circuit Builder</h1>
          <p className="mt-1 text-sm text-foreground/60">
            Drag gates onto qubit wires, or switch to code. Runs on a real Qiskit Aer
            simulator.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm">
            Qubits
            <input
              type="number"
              min={1}
              max={5}
              value={circuit.num_qubits}
              onChange={(e) => handleQubitCountChange(Math.min(5, Math.max(1, Number(e.target.value) || 1)))}
              className="w-14 rounded-md border border-black/10 bg-transparent px-2 py-1 text-sm dark:border-white/15"
            />
          </label>

          <div className="flex overflow-hidden rounded-md border border-black/10 text-sm dark:border-white/15">
            <button
              type="button"
              onClick={() => setMode("canvas")}
              className={`px-3 py-1.5 ${mode === "canvas" ? "bg-foreground text-background" : ""}`}
            >
              Canvas
            </button>
            <button
              type="button"
              onClick={() => setMode("code")}
              className={`px-3 py-1.5 ${mode === "code" ? "bg-foreground text-background" : ""}`}
            >
              Code
            </button>
          </div>

          <button
            type="button"
            onClick={handleRun}
            disabled={running}
            className="rounded-md bg-foreground px-4 py-1.5 text-sm font-medium text-background disabled:opacity-60"
          >
            {running ? "Running..." : "Run"}
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded-md border border-black/10 px-4 py-1.5 text-sm font-medium disabled:opacity-60 dark:border-white/15"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
      {saveMessage && <p className="mt-2 text-xs text-foreground/60">{saveMessage}</p>}

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_260px]">
        <div className="flex flex-col gap-4">
          {mode === "canvas" ? (
            <>
              <GatePalette pendingCnotControl={pendingCnotControl} />
              <CircuitCanvas
                circuit={circuit}
                pendingCnotControl={pendingCnotControl}
                selectedGateIndex={selectedGateIndex}
                onDropGate={handleDropGate}
                onWireClick={handleWireClick}
                onSelectGate={handleSelectGate}
              />

              {selectedGate && (
                <div className="flex flex-wrap items-center gap-3 rounded-md border border-black/10 px-4 py-3 text-sm dark:border-white/15">
                  <span className="font-medium">
                    {selectedGate.type} on qubit{selectedGate.qubits.length > 1 ? "s" : ""}{" "}
                    {selectedGate.qubits.join(", ")}
                  </span>
                  {selectedGate.angle !== undefined && (
                    <select
                      value={selectedGate.angle}
                      onChange={(e) =>
                        setCircuit((c) =>
                          updateGateAngle(c, selectedGateIndex!, Number(e.target.value))
                        )
                      }
                      className="rounded-md border border-black/10 bg-transparent px-2 py-1 text-sm dark:border-white/15"
                    >
                      {ANGLE_PRESETS.map((p) => (
                        <option key={p.label} value={p.value}>
                          {p.label}
                        </option>
                      ))}
                    </select>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setCircuit((c) => removeGate(c, selectedGateIndex!));
                      setSelectedGateIndex(null);
                    }}
                    className="ml-auto rounded-md border border-red-500/30 px-3 py-1 text-xs font-medium text-red-600 dark:text-red-400"
                  >
                    Remove gate
                  </button>
                </div>
              )}

              {circuit.gates.length === 0 && maxStep(circuit.gates) === -1 && (
                <p className="text-xs text-foreground/40">
                  Empty circuit — drag a gate from the palette onto a wire above.
                </p>
              )}
            </>
          ) : (
            <CodeView circuit={circuit} onApplyCircuit={handleApplyCircuit} />
          )}

          <section className="rounded-lg border border-black/10 p-5 dark:border-white/10">
            <h2 className="text-sm font-semibold">Results</h2>
            {runError && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">{runError}</p>
            )}
            {!runError && !runResult && (
              <p className="mt-2 text-sm text-foreground/50">
                Hit Run to simulate this circuit on Qiskit Aer.
              </p>
            )}
            {runResult && (
              <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-foreground/50">
                    Measurement probabilities
                  </h3>
                  <Histogram counts={runResult.counts} />
                </div>
                <div>
                  <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-foreground/50">
                    {runResult.bloch_vector ? "Bloch sphere" : "Statevector"}
                  </h3>
                  {runResult.bloch_vector ? (
                    <BlochSphere vector={runResult.bloch_vector} />
                  ) : (
                    <AmplitudeList
                      statevector={runResult.statevector}
                      numQubits={circuit.num_qubits}
                    />
                  )}
                </div>
              </div>
            )}
          </section>
        </div>

        <aside>
          <h2 className="text-sm font-semibold">My Circuits</h2>
          <div className="mt-3">
            <MyCircuits
              refreshKey={refreshKey}
              onLoad={(loaded) => {
                setCircuit(loaded);
                setRunResult(null);
                setRunError(null);
                resetInteractionState();
                setMode("canvas");
              }}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
