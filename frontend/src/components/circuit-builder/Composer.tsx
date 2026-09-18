"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { runCircuit, type RunResult } from "@/lib/circuit/api";
import {
  placeSingleQubitGate,
  placeTwoQubitGate,
  removeGate,
  setQubitCount,
  updateGateAngle,
} from "@/lib/circuit/placement";
import { generateOpenQasm } from "@/lib/circuit/openqasm";
import { blochVectorFromStatevector, probabilitiesFromStatevector, simulateStatevector } from "@/lib/circuit/simulate";
import { ANGLE_PRESETS, emptyCircuit, gateDef, type CircuitJson, type GateType } from "@/lib/circuit/types";
import { makeTranslator, type UiLang } from "@/lib/i18n/composer";
import GatePalette, { type PendingControl } from "@/components/circuit-builder/GatePalette";
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
const DEFAULT_QUBITS = 4;

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
function ToolsIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
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
  const [uiLang, setUiLang] = useState<UiLang>("en");
  const t = useMemo(() => makeTranslator(uiLang), [uiLang]);

  const [circuitName, setCircuitName] = useState("Untitled circuit");
  const [editingName, setEditingName] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [inspect, setInspect] = useState(false);
  const [backendName, setBackendName] = useState("qiskit_aer");

  const [historyState, setHistoryState] = useState<HistoryState>({
    past: [],
    present: emptyCircuit(DEFAULT_QUBITS),
    future: [],
  });
  const circuit = historyState.present;

  const [pendingControl, setPendingControl] = useState<PendingControl | null>(null);
  const [selectedGateIndex, setSelectedGateIndex] = useState<number | null>(null);

  const [running, setRunning] = useState(false);
  const [runError, setRunError] = useState<string | null>(null);
  const [runResult, setRunResult] = useState<RunResult | null>(null);

  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [savedCircuitId, setSavedCircuitId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Draggable widths for the bottom row (Probabilities | Q-sphere | Code),
  // as percentages of that row's width. Code starts narrower than an even
  // split; dragging the dividers between any two adjacent panels redistributes
  // just that pair, in percent so it stays correct across screen sizes.
  const [colWidths, setColWidths] = useState<[number, number, number]>([42, 28, 30]);
  const bottomRowRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ divider: 0 | 1; startX: number; startWidths: [number, number, number] } | null>(null);

  useEffect(() => {
    function handleMove(e: PointerEvent) {
      const drag = dragRef.current;
      const container = bottomRowRef.current;
      if (!drag || !container || container.offsetWidth <= 0) return;
      const deltaPercent = ((e.clientX - drag.startX) / container.offsetWidth) * 100;
      const MIN = 15;
      const [a, b, c] = drag.startWidths;
      const next: [number, number, number] = [a, b, c];
      if (drag.divider === 0) {
        const pairTotal = a + b;
        const newA = Math.max(MIN, Math.min(pairTotal - MIN, a + deltaPercent));
        next[0] = newA;
        next[1] = pairTotal - newA;
      } else {
        const pairTotal = b + c;
        const newB = Math.max(MIN, Math.min(pairTotal - MIN, b + deltaPercent));
        next[1] = newB;
        next[2] = pairTotal - newB;
      }
      setColWidths(next);
    }
    function handleUp() {
      dragRef.current = null;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    }
    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    };
  }, []);

  function startColumnDrag(divider: 0 | 1, e: React.PointerEvent) {
    e.preventDefault();
    dragRef.current = { divider, startX: e.clientX, startWidths: colWidths };
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }

  // Instant client-side preview: recomputed synchronously on every circuit
  // edit (pure math, no network), so probabilities/Q-sphere never lag behind
  // a drag. The authoritative "Set up and run" hits the real backend and
  // takes over the display until the next edit invalidates it.
  const livePreview = useMemo(() => {
    const statevector = simulateStatevector(circuit);
    return {
      statevector,
      probabilities: probabilitiesFromStatevector(statevector, circuit.num_qubits),
      blochVector: circuit.num_qubits === 1 ? blochVectorFromStatevector(statevector) : null,
    };
  }, [circuit]);

  const displayCounts = runResult?.counts ?? livePreview.probabilities;
  const displayStatevector = runResult?.statevector ?? livePreview.statevector;
  const displayBlochVector = runResult ? runResult.bloch_vector : livePreview.blochVector;

  function resetInteractionState() {
    setPendingControl(null);
    setSelectedGateIndex(null);
  }

  function commit(updater: (c: CircuitJson) => CircuitJson) {
    setHistoryState((h) => {
      const next = updater(h.present);
      if (next === h.present) return h;
      return { past: [...h.past, h.present], present: next, future: [] };
    });
    setRunResult(null);
    setRunError(null);
  }

  function undo() {
    setHistoryState((h) => {
      if (h.past.length === 0) return h;
      const previous = h.past[h.past.length - 1];
      return { past: h.past.slice(0, -1), present: previous, future: [h.present, ...h.future] };
    });
    setRunResult(null);
    resetInteractionState();
  }

  function redo() {
    setHistoryState((h) => {
      if (h.future.length === 0) return h;
      const next = h.future[0];
      return { past: [...h.past, h.present], present: next, future: h.future.slice(1) };
    });
    setRunResult(null);
    resetInteractionState();
  }

  function handleQubitCountChange(n: number) {
    commit((c) => setQubitCount(c, n));
    resetInteractionState();
  }

  function handleRemoveQubit() {
    commit((c) => setQubitCount(c, Math.max(1, c.num_qubits - 1)));
    resetInteractionState();
  }

  function handleDropGate(qubit: number, type: GateType) {
    if (gateDef(type).numQubits === 2) {
      setPendingControl({ type, qubit });
      return;
    }
    const def = gateDef(type);
    commit((c) => placeSingleQubitGate(c, type, qubit, def.hasAngle ? DEFAULT_ANGLE : undefined));
  }

  function handleWireClick(qubit: number) {
    if (!pendingControl) return;
    if (qubit === pendingControl.qubit) {
      setPendingControl(null);
      return;
    }
    commit((c) => placeTwoQubitGate(c, pendingControl.type, pendingControl.qubit, qubit));
    setPendingControl(null);
  }

  function handleSelectGate(index: number) {
    setSelectedGateIndex((prev) => (prev === index ? null : index));
  }

  function handleApplyCircuit(next: CircuitJson) {
    commit(() => next);
    resetInteractionState();
  }

  function handleNewCircuit() {
    commit(() => emptyCircuit(DEFAULT_QUBITS));
    resetInteractionState();
    setCircuitName(t("untitledCircuit"));
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
      setSaveMessage(t("mustBeLoggedIn"));
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
      setSaveMessage(error?.message ?? t("saveFailed"));
      return null;
    }
    setSaveMessage(t("saved"));
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
      setSaveMessage(t("shareLinkCopied"));
    } catch {
      setSaveMessage(url);
    }
  }

  const selectedGate = selectedGateIndex !== null ? circuit.gates[selectedGateIndex] : null;

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-[var(--background)]">
      {/* Top app bar */}
      <header className="z-30 shrink-0 border-b border-[var(--border)] bg-[var(--composer-bar)]">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-3 py-1.5">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label={t("openMenu")}
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
              title={t("renameCircuit")}
              className="shrink-0 truncate rounded px-1.5 py-0.5 text-sm text-[var(--foreground)] hover:bg-[var(--surface-hover)]"
            >
              {circuitName}
            </button>
          )}

          <nav className="hidden items-center gap-0.5 md:flex">
            <MenuButton label={t("fileMenu")} isOpen={activeMenu === "file"} onToggle={() => setActiveMenu((m) => (m === "file" ? null : "file"))} onClose={() => setActiveMenu(null)}>
              <MenuItem onClick={handleNewCircuit}>{t("newCircuit")}</MenuItem>
              <MenuItem onClick={() => { void handleSave(); setActiveMenu(null); }}>{t("saveToMyCircuits")}</MenuItem>
              <MenuItem onClick={handleDownloadQasm}>{t("downloadOpenQasm")}</MenuItem>
            </MenuButton>
            <MenuButton label={t("editMenu")} isOpen={activeMenu === "edit"} onToggle={() => setActiveMenu((m) => (m === "edit" ? null : "edit"))} onClose={() => setActiveMenu(null)}>
              <MenuItem onClick={undo} disabled={historyState.past.length === 0}>{t("undo")}</MenuItem>
              <MenuItem onClick={redo} disabled={historyState.future.length === 0}>{t("redo")}</MenuItem>
              <MenuItem onClick={handleClearGates} disabled={circuit.gates.length === 0}>{t("clearCircuit")}</MenuItem>
            </MenuButton>
            <MenuButton label={t("viewMenu")} isOpen={activeMenu === "view"} onToggle={() => setActiveMenu((m) => (m === "view" ? null : "view"))} onClose={() => setActiveMenu(null)}>
              <div className="flex items-center justify-between px-3 py-1.5 text-xs text-[var(--foreground)]">
                {t("theme")}
                <ThemeToggle />
              </div>
              <label className="flex items-center justify-between px-3 py-1.5 text-xs text-[var(--foreground)]">
                {t("inspectMode")}
                <input type="checkbox" checked={inspect} onChange={(e) => setInspect(e.target.checked)} className="accent-[var(--accent)]" />
              </label>
            </MenuButton>
            <MenuButton label={t("helpMenu")} isOpen={activeMenu === "help"} onToggle={() => setActiveMenu((m) => (m === "help" ? null : "help"))} onClose={() => setActiveMenu(null)}>
              <MenuItem
                onClick={() => {
                  setToolsOpen(true);
                  setActiveMenu(null);
                }}
              >
                {t("askAiTutor")}
              </MenuItem>
            </MenuButton>
          </nav>

          <div className="ml-auto flex items-center gap-2">
            {saveMessage && (
              <span className="hidden max-w-[12rem] truncate text-xs text-[var(--foreground-subtle)] lg:inline">{saveMessage}</span>
            )}
            <button
              type="button"
              onClick={() => setToolsOpen(true)}
              title={t("toolsTitle")}
              className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] px-2.5 py-1.5 text-xs font-semibold text-[var(--foreground)] transition-colors hover:bg-[var(--surface-hover)]"
            >
              <ToolsIcon />
              <span className="hidden sm:inline">{t("tools")}</span>
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] px-2.5 py-1.5 text-xs font-semibold text-[var(--foreground)] transition-colors hover:bg-[var(--surface-hover)] disabled:opacity-60"
            >
              <SaveIcon />
              <span className="hidden sm:inline">{saving ? t("saving") : t("saveFile")}</span>
            </button>
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
            <button
              type="button"
              onClick={() => performRun(circuit, backendName, { setRunning, setRunError, setRunResult })}
              disabled={running}
              title={t("setupAndRun")}
              className="flex items-center gap-1.5 rounded-lg bg-[var(--accent)] px-3.5 py-1.5 text-xs font-semibold text-[var(--accent-foreground)] transition-opacity disabled:opacity-60"
            >
              <PlayIcon />
              {running ? t("running") : t("setupAndRun")}
            </button>
          </div>
        </div>
      </header>

      {/* Top: operations | canvas (wide) */}
      <div className="grid min-h-0 flex-[6] grid-cols-1 lg:grid-cols-[300px_1fr]">
        <div className="flex min-h-0 flex-col overflow-hidden border-b border-[var(--border)] p-2.5 lg:border-b-0 lg:border-r">
          <GatePalette pendingControl={pendingControl} compact t={t} />
        </div>

        <div className="flex min-h-0 flex-col gap-2 overflow-hidden p-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={undo} disabled={historyState.past.length === 0} title={t("undo")} className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--foreground-muted)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)] disabled:pointer-events-none disabled:opacity-30">
              <UndoIcon />
            </button>
            <button type="button" onClick={redo} disabled={historyState.future.length === 0} title={t("redo")} className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--foreground-muted)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)] disabled:pointer-events-none disabled:opacity-30">
              <RedoIcon />
            </button>
            <span
              title={t("onlyLeftAlignment")}
              className="flex items-center gap-1 rounded-md border border-[var(--border)] px-2 py-1 text-xs text-[var(--foreground-muted)]"
            >
              {t("leftAlignment")} <ChevronIcon />
            </span>
            <label className="flex items-center gap-1.5 rounded-md border border-[var(--border)] px-2 py-1 text-xs text-[var(--foreground-muted)]">
              <input type="checkbox" checked={inspect} onChange={(e) => setInspect(e.target.checked)} className="accent-[var(--accent)]" />
              {t("inspect")}
            </label>
            <label className="ml-auto flex items-center gap-1.5 rounded-md border border-[var(--border)] px-2 py-1 text-xs font-medium text-[var(--foreground-muted)]">
              {t("qubits")}
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

          <div className="min-h-0 flex-1 overflow-hidden">
            <CircuitCanvas
              circuit={circuit}
              pendingControl={pendingControl}
              selectedGateIndex={selectedGateIndex}
              onDropGate={handleDropGate}
              onWireClick={handleWireClick}
              onSelectGate={handleSelectGate}
              onRemoveQubit={handleRemoveQubit}
              inspect={inspect}
              t={t}
            />
          </div>

          {selectedGate && (
            <div className="flex shrink-0 flex-wrap items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs">
              <span className="font-medium text-[var(--foreground)]">
                {selectedGate.type} {t(selectedGate.qubits.length > 1 ? "onQubits" : "onQubit", { qubits: selectedGate.qubits.join(", ") })}
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
                {t("removeGateBtn")}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom: probabilities | Q-sphere | code editor -- widths are
          draggable via the two dividers, code starts narrower than an even
          split. The grid-template-columns only applies at lg+ (arbitrary
          property reading the CSS vars set below); below that it's grid-cols-1
          and stacks full-width, so dragging has no effect on small screens. */}
      <div
        ref={bottomRowRef}
        className="grid min-h-0 flex-[5] grid-cols-1 border-t border-[var(--border)] lg:[grid-template-columns:var(--col-a)_6px_var(--col-b)_6px_var(--col-c)]"
        style={
          {
            "--col-a": `${colWidths[0]}%`,
            "--col-b": `${colWidths[1]}%`,
            "--col-c": `${colWidths[2]}%`,
          } as React.CSSProperties
        }
      >
        <div className="flex min-h-0 flex-col overflow-hidden border-b border-[var(--border)] p-3 lg:border-b-0">
          <div className="flex shrink-0 items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--foreground-subtle)]">{t("probabilities")}</p>
            <span className="text-[10px] text-[var(--foreground-subtle)]">
              {runResult ? `Qiskit Aer · ${t("shotsCount", { n: Object.values(runResult.counts).reduce((a, b) => a + b, 0) })}` : t("instantPreview")}
            </span>
          </div>
          <div className="mt-2 min-h-0 flex-1 overflow-hidden">
            {runError && <p className="text-sm text-red-600 dark:text-red-400">{runError}</p>}
            <Histogram counts={displayCounts} mode={runResult ? "shots" : "probability"} t={t} />
          </div>
        </div>

        <div
          onPointerDown={(e) => startColumnDrag(0, e)}
          className="hidden items-center justify-center lg:flex"
          style={{ cursor: "col-resize" }}
        >
          <div className="h-full w-px bg-[var(--border)] transition-colors hover:bg-[var(--accent)]" />
        </div>

        <div className="flex min-h-0 flex-col items-center overflow-hidden border-b border-[var(--border)] p-3 lg:border-b-0">
          <div className="flex w-full shrink-0 items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--foreground-subtle)]">
              {displayBlochVector ? t("blochSphere") : t("qsphere")}
            </p>
          </div>
          <span className="w-full text-left text-[10px] text-[var(--foreground-subtle)]">
            {runResult ? t("backendResult") : t("instantPreview")}
          </span>
          <div className="mt-1 flex min-h-0 flex-1 items-center justify-center overflow-hidden">
            {displayBlochVector ? (
              <BlochSphere vector={displayBlochVector} />
            ) : (
              <QSphere statevector={displayStatevector} numQubits={circuit.num_qubits} compact t={t} />
            )}
          </div>
        </div>

        <div
          onPointerDown={(e) => startColumnDrag(1, e)}
          className="hidden items-center justify-center lg:flex"
          style={{ cursor: "col-resize" }}
        >
          <div className="h-full w-px bg-[var(--border)] transition-colors hover:bg-[var(--accent)]" />
        </div>

        <div className="flex min-h-0 flex-col overflow-hidden">
          <CodeView circuit={circuit} onApplyCircuit={handleApplyCircuit} compact t={t} />
        </div>
      </div>

      <ComposerFooter lang={uiLang} onLangChange={setUiLang} t={t} />

      <NavMenuPanel open={menuOpen} onClose={() => setMenuOpen(false)} loggedIn={loggedIn} links={links} />

      {/* Tools panel: AI tutor + saved circuits, kept out of the main
          composer view so that view fits on one screen without scrolling. */}
      {toolsOpen && (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px]" onClick={() => setToolsOpen(false)} />
          <div className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-md)]">
            <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
              <span className="text-sm font-semibold text-[var(--foreground)]">{t("qyloTools")}</span>
              <button
                type="button"
                onClick={() => setToolsOpen(false)}
                aria-label="Close"
                className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--foreground-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)]"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>
            <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
              <div className="h-[380px] shrink-0">
                <AgentChat
                  title={t("explainMyCircuit")}
                  getCircuit={() => circuit}
                  quickActionLabel={t("explainMyCircuit")}
                  placeholder={t("askAboutCircuit")}
                />
              </div>
              <button
                type="button"
                onClick={handleCopyShareLink}
                className="shrink-0 rounded-lg border border-[var(--border)] px-3 py-2 text-xs font-semibold text-[var(--foreground)] transition-colors hover:bg-[var(--surface-hover)]"
              >
                {t("copyShareLink")}
              </button>
              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-sm)]">
                <h3 className="text-sm font-semibold text-[var(--foreground)]">{t("myCircuits")}</h3>
                <div className="mt-3">
                  <MyCircuits
                    refreshKey={refreshKey}
                    t={t}
                    onLoad={(loaded) => {
                      commit(() => loaded);
                      setRunResult(null);
                      setRunError(null);
                      resetInteractionState();
                      setToolsOpen(false);
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
