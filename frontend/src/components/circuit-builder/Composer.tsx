"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
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
import { generateOpenQasm } from "@/lib/circuit/openqasm";
import { ANGLE_PRESETS, emptyCircuit, gateDef, type CircuitJson, type GateType } from "@/lib/circuit/types";
import GatePalette from "@/components/circuit-builder/GatePalette";
import CircuitCanvas from "@/components/circuit-builder/CircuitCanvas";
import CodeView from "@/components/circuit-builder/CodeView";
import Histogram from "@/components/circuit-builder/Histogram";
import BlochSphere from "@/components/circuit-builder/BlochSphere";
import QSphere from "@/components/circuit-builder/QSphere";
import MyCircuits from "@/components/circuit-builder/MyCircuits";
import ComposerFooter from "@/components/circuit-builder/ComposerFooter";
import AgentChat from "@/components/agent/AgentChat";
import NavMenuPanel from "@/components/NavMenuPanel";
import ThemeToggle from "@/components/ThemeToggle";

const DEFAULT_ANGLE = Math.PI / 2;
const AUTO_RUN_DELAY = 600;

const BACKENDS = [
  { value: "qiskit_aer", label: "Qiskit Aer (Simulator)" },
  { value: "pennylane", label: "PennyLane" },
  { value: "cirq", label: "Cirq" },
  { value: "qbraid", label: "qBraid" },
];

interface HistoryState {
  past: CircuitJson[];
  present: CircuitJson;
  future: CircuitJson[];
}

async function performRun(
  circuit: CircuitJson,
  backendName: string,
  setters: {
    setRunning: (b: boolean) => void;
    setRunError: (e: string | null) => void;
    setRunResult: (r: RunResult | null) => void;
  }
) {
  setters.setRunning(true);
  setters.setRunError(null);
  try {
    const result = await runCircuit(circuit, backendName);
    setters.setRunResult(result);
  } catch (err) {
    setters.setRunError(err instanceof Error ? err.message : "Run failed.");
    setters.setRunResult(null);
  } finally {
    setters.setRunning(false);
  }
}

function HamburgerIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}
function ChevronIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}
function UndoIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 14L4 9l5-5" /><path d="M4 9h10.5a5.5 5.5 0 010 11H11" />
    </svg>
  );
}
function RedoIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 14l5-5-5-5" /><path d="M20 9H9.5a5.5 5.5 0 000 11H13" />
    </svg>
  );
}
function PlayIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}
function SaveIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v12" /><path d="M7 10l5 5 5-5" /><path d="M5 21h14" />
    </svg>
  );
}
function LinkIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 007.07 0l2.83-2.83a5 5 0 00-7.07-7.07L11.5 4.5" />
      <path d="M14 11a5 5 0 00-7.07 0L4.1 13.83a5 5 0 007.07 7.07L12.5 19.5" />
    </svg>
  );
}

function MenuButton({
  label,
  isOpen,
  onToggle,
  onClose,
  children,
}: {
  label: string;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
          isOpen ? "bg-[var(--surface-hover)] text-[var(--foreground)]" : "text-[var(--foreground-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)]"
        }`}
      >
        {label}
      </button>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-20" onClick={onClose} />
          <div className="absolute left-0 top-full z-30 mt-1 w-56 rounded-lg border border-[var(--border)] bg-[var(--surface)] py-1 shadow-[var(--shadow-md)]">
            {children}
          </div>
        </>
      )}
    </div>
  );
}

function MenuItem({
  children,
  onClick,
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="block w-full px-3 py-1.5 text-left text-xs text-[var(--foreground)] transition-colors hover:bg-[var(--surface-hover)] disabled:pointer-events-none disabled:opacity-40"
    >
      {children}
    </button>
  );
}

export default function Composer({
  loggedIn,
  links,
}: {
  loggedIn: boolean;
  links: { href: string; label: string }[];
}) {
  const [circuitName, setCircuitName] = useState("Untitled circuit");
  const [editingName, setEditingName] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [inspect, setInspect] = useState(false);
  const [backendName, setBackendName] = useState("qiskit_aer");

  const [historyState, setHistoryState] = useState<HistoryState>({
    past: [],
    present: emptyCircuit(2),
    future: [],
  });
  const circuit = historyState.present;

  const [pendingCnotControl, setPendingCnotControl] = useState<number | null>(null);
  const [selectedGateIndex, setSelectedGateIndex] = useState<number | null>(null);

  const [running, setRunning] = useState(false);
  const [runError, setRunError] = useState<string | null>(null);
  const [runResult, setRunResult] = useState<RunResult | null>(null);

  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [savedCircuitId, setSavedCircuitId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  function resetInteractionState() {
    setPendingCnotControl(null);
    setSelectedGateIndex(null);
  }

  function commit(updater: (c: CircuitJson) => CircuitJson) {
    setHistoryState((h) => {
      const next = updater(h.present);
      if (next === h.present) return h;
      return { past: [...h.past, h.present], present: next, future: [] };
    });
  }

  function undo() {
    setHistoryState((h) => {
      if (h.past.length === 0) return h;
      const previous = h.past[h.past.length - 1];
      return { past: h.past.slice(0, -1), present: previous, future: [h.present, ...h.future] };
    });
    resetInteractionState();
  }

  function redo() {
    setHistoryState((h) => {
      if (h.future.length === 0) return h;
      const next = h.future[0];
      return { past: [...h.past, h.present], present: next, future: h.future.slice(1) };
    });
    resetInteractionState();
  }

  // Debounced auto-run: any circuit or backend change re-simulates shortly
  // after the last edit, so the code/probabilities/Q-sphere stay live without
  // firing a request on every intermediate drag frame.
  useEffect(() => {
    const timer = setTimeout(() => {
      performRun(circuit, backendName, { setRunning, setRunError, setRunResult });
    }, AUTO_RUN_DELAY);
    return () => clearTimeout(timer);
  }, [circuit, backendName]);

  function handleQubitCountChange(n: number) {
    commit((c) => setQubitCount(c, n));
    resetInteractionState();
  }

  function handleRemoveQubit() {
    commit((c) => setQubitCount(c, Math.max(1, c.num_qubits - 1)));
    resetInteractionState();
  }

  function handleDropGate(qubit: number, type: GateType) {
    if (type === "CNOT") {
      setPendingCnotControl(qubit);
      return;
    }
    const def = gateDef(type);
    commit((c) => placeSingleQubitGate(c, type, qubit, def.hasAngle ? DEFAULT_ANGLE : undefined));
  }

  function handleWireClick(qubit: number) {
    if (pendingCnotControl === null) return;
    if (qubit === pendingCnotControl) {
      setPendingCnotControl(null);
      return;
    }
    commit((c) => placeTwoQubitGate(c, "CNOT", pendingCnotControl, qubit));
    setPendingCnotControl(null);
  }

  function handleSelectGate(index: number) {
    setSelectedGateIndex((prev) => (prev === index ? null : index));
  }

  function handleApplyCircuit(next: CircuitJson) {
    commit(() => next);
    resetInteractionState();
  }

  function handleNewCircuit() {
    commit(() => emptyCircuit(2));
    resetInteractionState();
    setCircuitName("Untitled circuit");
    setActiveMenu(null);
  }

  function handleClearGates() {
    commit((c) => ({ ...c, gates: [] }));
    resetInteractionState();
    setActiveMenu(null);
  }

  function handleDownloadQasm() {
    const text = generateOpenQasm(circuit);
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${circuitName.trim().replace(/\s+/g, "-").toLowerCase() || "circuit"}.qasm`;
    a.click();
    URL.revokeObjectURL(url);
    setActiveMenu(null);
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

  const selectedGate = selectedGateIndex !== null ? circuit.gates[selectedGateIndex] : null;

  return (
    <div className="flex min-h-screen w-full flex-col bg-[var(--background)]">
      {/* Top app bar */}
      <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--composer-bar)]">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 px-3 py-2">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[var(--foreground-muted)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)]"
          >
            <HamburgerIcon />
          </button>
          <Link href="/" className="shrink-0 text-sm font-semibold tracking-tight text-[var(--foreground)]">
            Qylo
          </Link>
          <span className="hidden shrink-0 text-[var(--border-strong)] sm:inline">|</span>

          {editingName ? (
            <input
              autoFocus
              value={circuitName}
              onChange={(e) => setCircuitName(e.target.value)}
              onBlur={() => setEditingName(false)}
              onKeyDown={(e) => e.key === "Enter" && setEditingName(false)}
              className="w-40 shrink-0 rounded border border-[var(--accent)] bg-transparent px-1.5 py-0.5 text-sm text-[var(--foreground)] outline-none"
            />
          ) : (
            <button
              type="button"
              onClick={() => setEditingName(true)}
              title="Rename circuit"
              className="shrink-0 truncate rounded px-1.5 py-0.5 text-sm text-[var(--foreground)] hover:bg-[var(--surface-hover)]"
            >
              {circuitName}
            </button>
          )}

          <nav className="hidden items-center gap-0.5 md:flex">
            <MenuButton label="File" isOpen={activeMenu === "file"} onToggle={() => setActiveMenu((m) => (m === "file" ? null : "file"))} onClose={() => setActiveMenu(null)}>
              <MenuItem onClick={handleNewCircuit}>New circuit</MenuItem>
              <MenuItem onClick={() => { void handleSave(); setActiveMenu(null); }}>Save to My Circuits</MenuItem>
              <MenuItem onClick={handleDownloadQasm}>Download OpenQASM (.qasm)</MenuItem>
            </MenuButton>
            <MenuButton label="Edit" isOpen={activeMenu === "edit"} onToggle={() => setActiveMenu((m) => (m === "edit" ? null : "edit"))} onClose={() => setActiveMenu(null)}>
              <MenuItem onClick={undo} disabled={historyState.past.length === 0}>Undo</MenuItem>
              <MenuItem onClick={redo} disabled={historyState.future.length === 0}>Redo</MenuItem>
              <MenuItem onClick={handleClearGates} disabled={circuit.gates.length === 0}>Clear circuit</MenuItem>
            </MenuButton>
            <MenuButton label="View" isOpen={activeMenu === "view"} onToggle={() => setActiveMenu((m) => (m === "view" ? null : "view"))} onClose={() => setActiveMenu(null)}>
              <div className="flex items-center justify-between px-3 py-1.5 text-xs text-[var(--foreground)]">
                Theme
                <ThemeToggle />
              </div>
              <label className="flex items-center justify-between px-3 py-1.5 text-xs text-[var(--foreground)]">
                Inspect mode
                <input type="checkbox" checked={inspect} onChange={(e) => setInspect(e.target.checked)} className="accent-[var(--accent)]" />
              </label>
            </MenuButton>
            <MenuButton label="Help" isOpen={activeMenu === "help"} onToggle={() => setActiveMenu((m) => (m === "help" ? null : "help"))} onClose={() => setActiveMenu(null)}>
              <MenuItem
                onClick={() => {
                  document.getElementById("qylo-agent-chat")?.scrollIntoView({ behavior: "smooth" });
                  setActiveMenu(null);
                }}
              >
                Ask the AI tutor
              </MenuItem>
            </MenuButton>
          </nav>

          <div className="ml-auto flex items-center gap-2">
            {saveMessage && (
              <span className="hidden max-w-[14rem] truncate text-xs text-[var(--foreground-subtle)] lg:inline">{saveMessage}</span>
            )}
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-semibold text-[var(--foreground)] transition-colors hover:bg-[var(--surface-hover)] disabled:opacity-60"
            >
              <SaveIcon />
              {saving ? "Saving..." : "Save file"}
            </button>
            <label className="flex items-center gap-1 text-xs font-medium text-[var(--foreground-muted)]">
              <select
                value={backendName}
                onChange={(e) => setBackendName(e.target.value)}
                title="Simulation backend"
                className="cursor-pointer rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 py-1.5 text-xs text-[var(--foreground)] outline-none"
              >
                {BACKENDS.map((b) => (
                  <option key={b.value} value={b.value}>
                    {b.label}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              onClick={() => performRun(circuit, backendName, { setRunning, setRunError, setRunResult })}
              disabled={running}
              className="flex items-center gap-1.5 rounded-lg bg-[var(--accent)] px-3.5 py-1.5 text-xs font-semibold text-[var(--accent-foreground)] transition-opacity disabled:opacity-60"
            >
              <PlayIcon />
              {running ? "Running..." : "Set up and run"}
            </button>
          </div>
        </div>
      </header>

      {/* Composer body: operations | canvas | OpenQASM */}
      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr_380px]">
        <div className="flex flex-col border-b border-[var(--border)] p-3 lg:border-b-0 lg:border-r">
          <GatePalette pendingCnotControl={pendingCnotControl} compact />
        </div>

        <div className="flex flex-col gap-2 border-b border-[var(--border)] p-3 lg:border-b-0 lg:border-r">
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={undo} disabled={historyState.past.length === 0} title="Undo" className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--foreground-muted)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)] disabled:pointer-events-none disabled:opacity-30">
              <UndoIcon />
            </button>
            <button type="button" onClick={redo} disabled={historyState.future.length === 0} title="Redo" className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--foreground-muted)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)] disabled:pointer-events-none disabled:opacity-30">
              <RedoIcon />
            </button>
            <span
              title="Only left alignment is supported right now"
              className="flex items-center gap-1 rounded-md border border-[var(--border)] px-2 py-1 text-xs text-[var(--foreground-muted)]"
            >
              Left alignment <ChevronIcon />
            </span>
            <label className="flex items-center gap-1.5 rounded-md border border-[var(--border)] px-2 py-1 text-xs text-[var(--foreground-muted)]">
              <input type="checkbox" checked={inspect} onChange={(e) => setInspect(e.target.checked)} className="accent-[var(--accent)]" />
              Inspect
            </label>
            <label className="ml-auto flex items-center gap-1.5 rounded-md border border-[var(--border)] px-2 py-1 text-xs font-medium text-[var(--foreground-muted)]">
              Qubits
              <input
                type="number"
                min={1}
                max={5}
                value={circuit.num_qubits}
                onChange={(e) => handleQubitCountChange(Math.min(5, Math.max(1, Number(e.target.value) || 1)))}
                className="w-8 bg-transparent text-center text-xs font-semibold text-[var(--foreground)] outline-none"
              />
            </label>
          </div>

          <CircuitCanvas
            circuit={circuit}
            pendingCnotControl={pendingCnotControl}
            selectedGateIndex={selectedGateIndex}
            onDropGate={handleDropGate}
            onWireClick={handleWireClick}
            onSelectGate={handleSelectGate}
            onRemoveQubit={handleRemoveQubit}
            inspect={inspect}
          />

          {selectedGate && (
            <div className="flex flex-wrap items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs">
              <span className="font-medium text-[var(--foreground)]">
                {selectedGate.type} on qubit{selectedGate.qubits.length > 1 ? "s" : ""} {selectedGate.qubits.join(", ")}
              </span>
              {selectedGate.angle !== undefined && (
                <select
                  value={selectedGate.angle}
                  onChange={(e) => commit((c) => updateGateAngle(c, selectedGateIndex!, Number(e.target.value)))}
                  className="rounded-lg border border-[var(--border)] bg-transparent px-2 py-1 text-xs text-[var(--foreground)]"
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
                  commit((c) => removeGate(c, selectedGateIndex!));
                  setSelectedGateIndex(null);
                }}
                className="ml-auto rounded-lg border border-red-500/30 px-2.5 py-1 text-xs font-medium text-red-600 dark:text-red-400"
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
        </div>

        <div className="flex flex-col">
          <CodeView circuit={circuit} onApplyCircuit={handleApplyCircuit} compact />
        </div>
      </div>

      {/* Results: probabilities | Q-sphere */}
      <div className="grid grid-cols-1 border-t border-[var(--border)] sm:grid-cols-2">
        <div className="border-b border-[var(--border)] p-4 sm:border-b-0 sm:border-r">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--foreground-subtle)]">Probabilities</p>
          <div className="mt-3">
            {runError && <p className="text-sm text-red-600 dark:text-red-400">{runError}</p>}
            {!runError && !runResult && <p className="text-sm text-[var(--foreground-muted)]">Simulating...</p>}
            {runResult && <Histogram counts={runResult.counts} />}
          </div>
        </div>
        <div className="p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--foreground-subtle)]">
            {runResult?.bloch_vector ? "Bloch sphere" : "Q-sphere"}
          </p>
          <div className="mt-3">
            {runResult?.bloch_vector ? (
              <BlochSphere vector={runResult.bloch_vector} />
            ) : runResult ? (
              <QSphere statevector={runResult.statevector} numQubits={circuit.num_qubits} />
            ) : (
              !runError && <p className="text-sm text-[var(--foreground-muted)]">Simulating...</p>
            )}
          </div>
        </div>
      </div>

      {/* Qylo extras: AI tutor + saved circuits, secondary to the composer above */}
      <div className="border-t border-[var(--border)] bg-[var(--background)] px-4 py-6">
        <h2 className="text-sm font-semibold text-[var(--foreground)]">Qylo tools</h2>
        <div className="mt-3 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
          <div id="qylo-agent-chat" className="h-[420px]">
            <AgentChat
              title="Explain my circuit"
              getCircuit={() => circuit}
              quickActionLabel="Explain my circuit"
              placeholder="Ask about this circuit..."
            />
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCopyShareLink}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-[var(--border)] px-3 py-2 text-xs font-semibold text-[var(--foreground)] transition-colors hover:bg-[var(--surface-hover)]"
              >
                <LinkIcon />
                Share
              </button>
            </div>
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-sm)]">
              <h3 className="text-sm font-semibold text-[var(--foreground)]">My Circuits</h3>
              <div className="mt-3">
                <MyCircuits
                  refreshKey={refreshKey}
                  onLoad={(loaded) => {
                    commit(() => loaded);
                    setRunResult(null);
                    setRunError(null);
                    resetInteractionState();
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <ComposerFooter />

      <NavMenuPanel open={menuOpen} onClose={() => setMenuOpen(false)} loggedIn={loggedIn} links={links} />
    </div>
  );
}
