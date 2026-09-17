"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { runCircuit, type RunResult } from "@/lib/circuit/api";
import { submitChallenge } from "@/lib/challenges/api";
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
import QSphere from "@/components/circuit-builder/QSphere";
import MyCircuits from "@/components/circuit-builder/MyCircuits";
import AgentChat from "@/components/agent/AgentChat";

const DEFAULT_ANGLE = Math.PI / 2;

function PlayIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}
function SaveIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
      <path d="M17 21v-8H7v8M7 3v5h8" />
    </svg>
  );
}
function LinkIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 007.07 0l2.83-2.83a5 5 0 00-7.07-7.07L11.5 4.5" />
      <path d="M14 11a5 5 0 00-7.07 0L4.1 13.83a5 5 0 007.07 7.07L12.5 19.5" />
    </svg>
  );
}

export interface CircuitChallengeContext {
  id: string;
  onResult?: (passed: boolean) => void;
}

export default function CircuitBuilder({
  initialCircuit,
  challenge,
}: {
  initialCircuit?: CircuitJson;
  challenge?: CircuitChallengeContext;
} = {}) {
  const [circuit, setCircuit] = useState<CircuitJson>(initialCircuit ?? emptyCircuit(2));
  const [mode, setMode] = useState<"canvas" | "code">("canvas");
  const [pendingCnotControl, setPendingCnotControl] = useState<number | null>(null);
  const [selectedGateIndex, setSelectedGateIndex] = useState<number | null>(null);

  const [running, setRunning] = useState(false);
  const [runError, setRunError] = useState<string | null>(null);
  const [runResult, setRunResult] = useState<RunResult | null>(null);

  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [savedCircuitId, setSavedCircuitId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const [submittingChallenge, setSubmittingChallenge] = useState(false);
  const [challengeResult, setChallengeResult] = useState<{
    passed: boolean;
    ai_feedback: string | null;
  } | null>(null);

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

  async function handleSave(): Promise<string | null> {
    setSaving(true);
    setSaveMessage(null);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setSaveMessage("You must be logged in to save.");
      setSaving(false);
      return null;
    }
    const { data, error } = await supabase
      .from("circuits")
      .insert({ user_id: user.id, circuit_json: circuit as unknown as Record<string, unknown> })
      .select("id")
      .single();
    setSaving(false);
    if (error || !data) {
      setSaveMessage(error?.message ?? "Save failed.");
      return null;
    }
    setSaveMessage("Saved.");
    setSavedCircuitId(data.id);
    setRefreshKey((k) => k + 1);
    return data.id;
  }

  async function handleCopyShareLink() {
    const id = savedCircuitId ?? (await handleSave());
    if (!id) return;
    const url = `${window.location.origin}/circuit/${id}/view`;
    try {
      await navigator.clipboard.writeText(url);
      setSaveMessage("Share link copied to clipboard.");
    } catch {
      setSaveMessage(url);
    }
  }

  async function handleSubmitChallenge() {
    if (!challenge) return;
    setSubmittingChallenge(true);
    setChallengeResult(null);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("You must be logged in.");

      const res = await submitChallenge(challenge.id, { userId: user.id, circuit });
      setChallengeResult({ passed: res.passed, ai_feedback: res.ai_feedback });
      challenge.onResult?.(res.passed);
    } catch (err) {
      setChallengeResult({
        passed: false,
        ai_feedback: err instanceof Error ? err.message : "Submission failed.",
      });
    } finally {
      setSubmittingChallenge(false);
    }
  }

  const selectedGate = selectedGateIndex !== null ? circuit.gates[selectedGateIndex] : null;

  return (
    <div className={challenge ? "" : "mx-auto max-w-6xl px-6 py-8"}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 shadow-[var(--shadow-sm)]">
        {!challenge && (
          <div className="mr-auto">
            <h1 className="text-base font-semibold tracking-tight text-[var(--foreground)]">
              Circuit Builder
            </h1>
            <p className="text-xs text-[var(--foreground-muted)]">
              Real Qiskit Aer simulation, 1-5 qubits.
            </p>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] px-2.5 py-1.5 text-xs font-medium text-[var(--foreground-muted)]">
            Qubits
            <input
              type="number"
              min={1}
              max={5}
              value={circuit.num_qubits}
              onChange={(e) => handleQubitCountChange(Math.min(5, Math.max(1, Number(e.target.value) || 1)))}
              className="w-10 bg-transparent text-center text-sm font-semibold text-[var(--foreground)] outline-none"
            />
          </label>

          <div className="flex overflow-hidden rounded-lg border border-[var(--border)] text-xs font-medium">
            <button
              type="button"
              onClick={() => setMode("canvas")}
              className={`px-3 py-1.5 transition-colors ${mode === "canvas" ? "bg-[var(--accent)] text-[var(--accent-foreground)]" : "text-[var(--foreground-muted)] hover:bg-[var(--surface-hover)]"}`}
            >
              Canvas
            </button>
            <button
              type="button"
              onClick={() => setMode("code")}
              className={`px-3 py-1.5 transition-colors ${mode === "code" ? "bg-[var(--accent)] text-[var(--accent-foreground)]" : "text-[var(--foreground-muted)] hover:bg-[var(--surface-hover)]"}`}
            >
              Code
            </button>
          </div>

          <button
            type="button"
            onClick={handleRun}
            disabled={running}
            className="flex items-center gap-1.5 rounded-lg bg-[var(--accent)] px-3.5 py-1.5 text-xs font-semibold text-[var(--accent-foreground)] transition-opacity disabled:opacity-60"
          >
            <PlayIcon />
            {running ? "Running..." : "Run"}
          </button>
          {challenge && (
            <button
              type="button"
              onClick={handleSubmitChallenge}
              disabled={submittingChallenge}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white transition-opacity hover:bg-emerald-700 disabled:opacity-60"
            >
              <CheckIcon />
              {submittingChallenge ? "Grading..." : "Submit"}
            </button>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] px-3.5 py-1.5 text-xs font-semibold text-[var(--foreground)] transition-colors hover:bg-[var(--surface-hover)] disabled:opacity-60"
          >
            <SaveIcon />
            {saving ? "Saving..." : "Save"}
          </button>
          <button
            type="button"
            onClick={handleCopyShareLink}
            className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] px-3.5 py-1.5 text-xs font-semibold text-[var(--foreground)] transition-colors hover:bg-[var(--surface-hover)]"
          >
            <LinkIcon />
            Share
          </button>
        </div>
      </div>
      {saveMessage && (
        <p className="mt-2 break-all text-xs text-[var(--foreground-muted)]">{saveMessage}</p>
      )}

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_280px]">
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
                <div className="flex flex-wrap items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm shadow-[var(--shadow-sm)]">
                  <span className="font-medium text-[var(--foreground)]">
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
                      className="rounded-lg border border-[var(--border)] bg-transparent px-2 py-1 text-sm text-[var(--foreground)]"
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
                    className="ml-auto rounded-lg border border-red-500/30 px-3 py-1 text-xs font-medium text-red-600 dark:text-red-400"
                  >
                    Remove gate
                  </button>
                </div>
              )}

              {circuit.gates.length === 0 && maxStep(circuit.gates) === -1 && (
                <p className="text-xs text-[var(--foreground-subtle)]">
                  Empty circuit — drag a gate from the palette onto a wire above.
                </p>
              )}
            </>
          ) : (
            <CodeView circuit={circuit} onApplyCircuit={handleApplyCircuit} />
          )}

          {challengeResult && (
            <section
              className={`rounded-xl border p-5 shadow-[var(--shadow-sm)] ${
                challengeResult.passed
                  ? "border-emerald-600/30 bg-emerald-600/5"
                  : "border-red-500/30 bg-red-500/5"
              }`}
            >
              <h2
                className={`text-sm font-semibold ${
                  challengeResult.passed
                    ? "text-emerald-700 dark:text-emerald-400"
                    : "text-red-700 dark:text-red-400"
                }`}
              >
                {challengeResult.passed ? "✓ Passed" : "✗ Not quite yet"}
              </h2>
              {challengeResult.ai_feedback && (
                <p className="mt-2 whitespace-pre-wrap text-sm text-[var(--foreground)]/80">
                  {challengeResult.ai_feedback}
                </p>
              )}
            </section>
          )}

          <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)]">
            <h2 className="text-sm font-semibold text-[var(--foreground)]">Results</h2>
            {runError && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">{runError}</p>
            )}
            {!runError && !runResult && (
              <p className="mt-2 text-sm text-[var(--foreground-muted)]">
                Hit Run to simulate this circuit on Qiskit Aer.
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
        </div>

        <aside className="flex flex-col gap-4">
          <div className="h-[420px]">
            <AgentChat
              title="Explain my circuit"
              getCircuit={() => circuit}
              quickActionLabel="Explain my circuit"
              placeholder="Ask about this circuit..."
            />
          </div>

          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-sm)]">
            <h2 className="text-sm font-semibold text-[var(--foreground)]">My Circuits</h2>
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
          </div>
        </aside>
      </div>
    </div>
  );
}
