export default function AmplitudeList({
  statevector,
  numQubits,
}: {
  statevector: [number, number][];
  numQubits: number;
}) {
  const rows = statevector
    .map(([re, im], i) => {
      const probability = re * re + im * im;
      const phaseDeg = (Math.atan2(im, re) * 180) / Math.PI;
      const bitstring = i.toString(2).padStart(numQubits, "0");
      return { bitstring, probability, phaseDeg };
    })
    .filter((r) => r.probability > 1e-6);

  if (rows.length === 0) {
    return <p className="text-sm text-foreground/60">No amplitudes to show.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs text-foreground/50">
        Statevector amplitudes (probability and phase) — a Q-sphere is planned as a later
        upgrade.
      </p>
      {rows.map((row) => (
        <div key={row.bitstring} className="flex items-center gap-3">
          <span className="w-16 shrink-0 font-mono text-xs text-foreground/80">
            |{row.bitstring}⟩
          </span>
          <div className="h-3 flex-1 overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.min(100, row.probability * 100)}%`,
                background: "var(--chart-series-1)",
              }}
            />
          </div>
          <span className="w-14 shrink-0 text-right text-xs text-foreground/70">
            {(row.probability * 100).toFixed(1)}%
          </span>
          <span className="w-16 shrink-0 text-right text-xs text-foreground/50">
            {row.phaseDeg.toFixed(0)}°
          </span>
        </div>
      ))}
    </div>
  );
}
