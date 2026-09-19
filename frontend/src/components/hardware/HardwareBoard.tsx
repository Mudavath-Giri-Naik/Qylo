"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { BookOpen, Briefcase, Play } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface RecentCircuit {
  id: string;
  numQubits: number;
  createdAt: string;
}

interface Backend {
  id: string;
  name: string;
  desc: string;
  qubits: number;
  avgQueue: string;
  device: string;
  basisGates: string;
  errorRate1q: number;
  errorRate2q: number;
  volume: number;
  colorBg: string;
  colorFg: string;
  letter: string;
}

const BACKENDS: Backend[] = [
  {
    id: "ibm",
    name: "IBM Quantum",
    desc: "Real quantum systems by IBM",
    qubits: 127,
    avgQueue: "~3 min",
    device: "ibm_brisbane",
    basisGates: "CX, U1, U2, U3",
    errorRate1q: 0.0003,
    errorRate2q: 0.006,
    volume: 512,
    colorBg: "color-mix(in srgb, #1a56db 12%, transparent)",
    colorFg: "#1a56db",
    letter: "IBM",
  },
  {
    id: "google",
    name: "Google Quantum AI",
    desc: "Real quantum systems by Google",
    qubits: 72,
    avgQueue: "~5 min",
    device: "sycamore",
    basisGates: "√iSWAP, PhasedXZ",
    errorRate1q: 0.0004,
    errorRate2q: 0.007,
    volume: 256,
    colorBg: "color-mix(in srgb, #ea4335 12%, transparent)",
    colorFg: "#ea4335",
    letter: "G",
  },
  {
    id: "ionq",
    name: "IonQ",
    desc: "Trapped-ion quantum computers",
    qubits: 32,
    avgQueue: "~2 min",
    device: "ionq_aria1",
    basisGates: "GPI, GPI2, MS",
    errorRate1q: 0.0002,
    errorRate2q: 0.004,
    volume: 4096,
    colorBg: "color-mix(in srgb, #7c3aed 12%, transparent)",
    colorFg: "#7c3aed",
    letter: "Q",
  },
];

const QUEUE = [
  { position: 1, eta: "1 - 2 min" },
  { position: 2, eta: "2 - 3 min" },
  { position: 3, eta: "3 - 5 min" },
  { position: 4, eta: "4 - 6 min" },
  { position: 5, eta: "5 - 8 min" },
];

const SAMPLE_EXPERIMENTS = [
  { title: "Bell State", desc: "Create entanglement on real hardware" },
  { title: "Quantum Teleportation", desc: "Send a qubit state" },
  { title: "Grover's Algorithm", desc: "Search a marked item" },
  { title: "Quantum Fourier Transform", desc: "Explore frequency domain" },
  { title: "Variational Quantum Eigensolver", desc: "Estimate ground state energy" },
];

const QUICK_RUN_CODE = `from qiskit import QuantumCircuit

qc = QuantumCircuit(2)
qc.h(0)
qc.cx(0, 1)
qc.measure_all()`;

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diffMs / (60 * 60 * 1000));
  if (hours < 1) return "just now";
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

export default function HardwareBoard({ recentCircuits, loggedIn }: { recentCircuits: RecentCircuit[]; loggedIn: boolean }) {
  const [selectedId, setSelectedId] = useState<string>("ibm");
  const selected = useMemo(() => BACKENDS.find((b) => b.id === selectedId) ?? BACKENDS[0], [selectedId]);
  const [quickRunBackend, setQuickRunBackend] = useState<string>("ibm");

  return (
    <main className="mx-auto max-w-7xl px-6 py-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">Hardware Access</h1>
          <p className="mt-0.5 text-sm text-[var(--foreground-muted)]">
            Run your circuits on our quantum simulator today — real hardware integrations are on the way.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" className="rounded-lg">
            <Link href="/circuit-builder">
              <BookOpen className="h-4 w-4" /> Usage Guide
            </Link>
          </Button>
          <Button asChild className="rounded-lg">
            <a href="#recent-runs">
              <Briefcase className="h-4 w-4" /> My Jobs
            </a>
          </Button>
        </div>
      </div>

      {/* Backend cards */}
      <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-3">
        {BACKENDS.map((backend) => (
          <Card key={backend.id} className={`gap-0 p-4 ${selectedId === backend.id ? "ring-2 ring-[var(--accent)]" : ""}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold"
                  style={{ background: backend.colorBg, color: backend.colorFg }}
                >
                  {backend.letter}
                </div>
                <div>
                  <p className="text-sm font-bold text-[var(--foreground)]">{backend.name}</p>
                  <p className="text-[11px] text-[var(--foreground-muted)]">{backend.desc}</p>
                </div>
              </div>
              <span className="flex shrink-0 items-center gap-1 text-[11px] font-semibold text-[var(--marketing-green)]">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--marketing-green)]" /> Online
              </span>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="rounded-lg border border-[var(--border)] px-2.5 py-2">
                <p className="text-sm font-bold text-[var(--foreground)]">{backend.qubits} qubits</p>
                <p className="text-[10px] text-[var(--foreground-muted)]">{backend.device}</p>
              </div>
              <div className="rounded-lg border border-[var(--border)] px-2.5 py-2">
                <p className="text-sm font-bold text-[var(--foreground)]">{backend.avgQueue}</p>
                <p className="text-[10px] text-[var(--foreground-muted)]">avg queue time</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedId(backend.id)}
              className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg bg-[var(--accent)]/10 py-2 text-xs font-semibold text-[var(--accent)] transition-colors hover:bg-[var(--accent)]/15"
            >
              Select {backend.name} →
            </button>
          </Card>
        ))}
      </div>

      {/* Details / Queue / Quick Run */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1.2fr)]">
        <Card className="gap-0 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[var(--foreground)]">Backend Details</h3>
            <Link href="/circuit-builder" className="text-[11px] font-semibold text-[var(--accent)] hover:underline">
              View Full Details →
            </Link>
          </div>
          <p className="mt-0.5 text-[11px] text-[var(--foreground-muted)]">Information about the selected quantum hardware.</p>

          <div className="mt-3 flex items-center justify-between">
            <p className="text-sm font-bold text-[var(--foreground)]">
              {selected.name} — {selected.device}
            </p>
            <span className="flex items-center gap-1 text-[11px] font-semibold text-[var(--marketing-green)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--marketing-green)]" /> Online
            </span>
          </div>
          <div className="mt-1 flex flex-wrap gap-1.5">
            <span className="rounded-full border border-[var(--border)] px-2 py-0.5 text-[10px] font-medium text-[var(--foreground-muted)]">Superconducting</span>
            <span className="rounded-full border border-[var(--border)] px-2 py-0.5 text-[10px] font-medium text-[var(--foreground-muted)]">{selected.qubits} qubits</span>
            <span className="rounded-full border border-[var(--border)] px-2 py-0.5 text-[10px] font-medium text-[var(--foreground-muted)]">Quantum Volume: {selected.volume}</span>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2.5 text-xs sm:grid-cols-3">
            <div>
              <p className="text-[10px] text-[var(--foreground-subtle)]">Qubit Count</p>
              <p className="font-semibold text-[var(--foreground)]">{selected.qubits}</p>
            </div>
            <div>
              <p className="text-[10px] text-[var(--foreground-subtle)]">Basis Gates</p>
              <p className="font-semibold text-[var(--foreground)]">{selected.basisGates}</p>
            </div>
            <div>
              <p className="text-[10px] text-[var(--foreground-subtle)]">Avg. Queue Time</p>
              <p className="font-semibold text-[var(--foreground)]">{selected.avgQueue}</p>
            </div>
            <div>
              <p className="text-[10px] text-[var(--foreground-subtle)]">Error Rate (1q)</p>
              <p className="font-semibold text-[var(--foreground)]">{selected.errorRate1q}</p>
            </div>
            <div>
              <p className="text-[10px] text-[var(--foreground-subtle)]">Error Rate (2q)</p>
              <p className="font-semibold text-[var(--foreground)]">{selected.errorRate2q}</p>
            </div>
          </div>
        </Card>

        <Card className="gap-0 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[var(--foreground)]">Queue Status</h3>
            <span className="rounded-full bg-[var(--surface-2)] px-2 py-0.5 text-[10px] font-semibold text-[var(--foreground-muted)]">Preview</span>
          </div>
          <p className="mt-0.5 text-[11px] text-[var(--foreground-muted)]">Illustrative queue and estimated wait times.</p>

          <div className="mt-3 rounded-xl bg-[var(--accent)]/10 p-3">
            <p className="text-lg font-bold text-[var(--foreground)]">{QUEUE.length}</p>
            <p className="text-[10px] text-[var(--foreground-muted)]">jobs in queue</p>
            <p className="mt-1 text-lg font-bold text-[var(--foreground)]">{selected.avgQueue}</p>
            <p className="text-[10px] text-[var(--foreground-muted)]">estimated wait time</p>
          </div>

          <ul className="mt-3 flex flex-col gap-1.5 text-xs">
            {QUEUE.map((q) => (
              <li key={q.position} className="flex items-center justify-between">
                <span className="text-[var(--foreground-muted)]">Position {q.position}</span>
                <span className="font-semibold text-[var(--foreground)]">{q.eta}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="gap-0 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[var(--foreground)]">Quick Run</h3>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="rounded-lg text-[11px]">
                  {BACKENDS.find((b) => b.id === quickRunBackend)?.name}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuRadioGroup value={quickRunBackend} onValueChange={setQuickRunBackend}>
                  {BACKENDS.map((b) => (
                    <DropdownMenuRadioItem key={b.id} value={b.id}>
                      {b.name}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <p className="mt-0.5 text-[11px] text-[var(--foreground-muted)]">Try a circuit in the real editor.</p>

          <pre className="mt-3 overflow-x-auto rounded-lg bg-[var(--surface-2)] p-3 font-mono text-[11px] leading-relaxed text-[var(--foreground)]">
            {QUICK_RUN_CODE}
          </pre>

          <Button asChild className="mt-3 w-full rounded-lg">
            <Link href="/circuit-builder">
              <Play className="h-3.5 w-3.5" /> Run on {BACKENDS.find((b) => b.id === quickRunBackend)?.name} →
            </Link>
          </Button>
        </Card>
      </div>

      {/* Runs / Sample experiments */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <Card id="recent-runs" className="gap-0 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[var(--foreground)]">Recent Runs</h3>
            <Link href="/circuit-builder" className="text-[11px] font-semibold text-[var(--accent)] hover:underline">
              View All →
            </Link>
          </div>
          <p className="mt-0.5 text-[11px] text-[var(--foreground-muted)]">Your saved circuits from the simulator.</p>

          {!loggedIn ? (
            <p className="mt-6 text-center text-xs text-[var(--foreground-muted)]">Log in to see your saved circuits.</p>
          ) : recentCircuits.length === 0 ? (
            <p className="mt-6 text-center text-xs text-[var(--foreground-muted)]">
              No saved circuits yet —{" "}
              <Link href="/circuit-builder" className="font-semibold text-[var(--accent)] hover:underline">
                build one
              </Link>
              .
            </p>
          ) : (
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-[11px] uppercase tracking-wide text-[var(--foreground-subtle)]">
                    <th className="py-2 pr-4 font-semibold">#</th>
                    <th className="py-2 pr-4 font-semibold">Circuit</th>
                    <th className="py-2 pr-4 font-semibold">Qubits</th>
                    <th className="py-2 pr-4 font-semibold">Backend</th>
                    <th className="py-2 pr-4 font-semibold">Saved</th>
                    <th className="py-2 font-semibold">Result</th>
                  </tr>
                </thead>
                <tbody>
                  {recentCircuits.map((c, i) => (
                    <tr key={c.id} className="border-b border-[var(--border)] text-xs last:border-0">
                      <td className="py-2 pr-4 text-[var(--foreground-muted)]">{i + 1}</td>
                      <td className="py-2 pr-4 font-semibold text-[var(--foreground)]">Circuit ({c.numQubits}q)</td>
                      <td className="py-2 pr-4 text-[var(--foreground-muted)]">{c.numQubits}</td>
                      <td className="py-2 pr-4 text-[var(--foreground-muted)]">Qiskit Aer (Simulator)</td>
                      <td className="py-2 pr-4 text-[var(--foreground-muted)]">{relativeTime(c.createdAt)}</td>
                      <td className="py-2">
                        <Link href={`/circuit/${c.id}/view`} className="font-semibold text-[var(--accent)] hover:underline">
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card className="gap-0 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[var(--foreground)]">Sample Experiments</h3>
          </div>
          <p className="mt-0.5 text-[11px] text-[var(--foreground-muted)]">Ready-to-run circuits, in the real editor.</p>
          <ul className="mt-3 flex flex-col gap-2">
            {SAMPLE_EXPERIMENTS.map((exp, i) => (
              <li key={exp.title} className="flex items-center gap-2.5 rounded-xl border border-[var(--border)] p-2.5">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--accent)]/10 text-[11px] font-bold text-[var(--accent)]">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-[var(--foreground)]">{exp.title}</p>
                  <p className="truncate text-[10px] text-[var(--foreground-muted)]">{exp.desc}</p>
                </div>
                <Button asChild size="sm" className="shrink-0 rounded-lg text-[11px]">
                  <Link href="/circuit-builder">Run</Link>
                </Button>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </main>
  );
}
