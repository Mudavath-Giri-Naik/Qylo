interface QSpherePoint {
  bitstring: string;
  probability: number;
  phaseDeg: number;
  x: number;
  y: number;
  z: number;
}

function phaseColor(phaseDeg: number): string {
  const hue = ((phaseDeg % 360) + 360) % 360;
  return `hsl(${hue}, 72%, 52%)`;
}

function computePoints(statevector: [number, number][], numQubits: number): QSpherePoint[] {
  const byWeight = new Map<number, number[]>();
  for (let i = 0; i < statevector.length; i++) {
    const bits = i.toString(2).padStart(numQubits, "0");
    const weight = bits.split("").filter((b) => b === "1").length;
    const list = byWeight.get(weight);
    if (list) list.push(i);
    else byWeight.set(weight, [i]);
  }

  const points: QSpherePoint[] = [];
  for (const [weight, indices] of byWeight.entries()) {
    const theta = numQubits === 0 ? 0 : (Math.PI * weight) / numQubits;
    indices.forEach((idx, j) => {
      const [re, im] = statevector[idx];
      const probability = re * re + im * im;
      if (probability < 1e-6) return;
      const phi = (2 * Math.PI * j) / indices.length;
      points.push({
        bitstring: idx.toString(2).padStart(numQubits, "0"),
        probability,
        phaseDeg: (Math.atan2(im, re) * 180) / Math.PI,
        x: Math.sin(theta) * Math.cos(phi),
        y: Math.sin(theta) * Math.sin(phi),
        z: Math.cos(theta),
      });
    });
  }
  return points.sort((a, b) => b.probability - a.probability);
}

export default function QSphere({
  statevector,
  numQubits,
}: {
  statevector: [number, number][];
  numQubits: number;
}) {
  const points = computePoints(statevector, numQubits);

  const size = 280;
  const cx = size / 2;
  const cy = size / 2;
  const R = 98;
  const depthX = 0.42;
  const depthY = 0.22;

  const project = (x: number, y: number, z: number) => ({
    x: cx + R * x + R * depthX * y,
    y: cy - R * z - R * depthY * y,
  });

  const equatorRy = R * depthY + 6;
  const maxProbability = Math.max(...points.map((p) => p.probability), 1e-9);

  return (
    <div className="flex flex-col items-center gap-3">
      <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[280px]" role="img" aria-label="Q-sphere">
        <circle cx={cx} cy={cy} r={R} fill="var(--chart-series-1)" fillOpacity={0.05} stroke="var(--chart-baseline)" strokeWidth={1} />
        <ellipse cx={cx} cy={cy} rx={R} ry={equatorRy} fill="none" stroke="var(--chart-grid)" strokeWidth={1} strokeDasharray="3 3" />
        <line
          x1={project(0, 0, -1.15).x}
          y1={project(0, 0, -1.15).y}
          x2={project(0, 0, 1.15).x}
          y2={project(0, 0, 1.15).y}
          stroke="var(--chart-ink-muted)"
          strokeWidth={1}
        />

        {points.map((p) => {
          const tip = project(p.x, p.y, p.z);
          const radius = 3 + 7 * Math.sqrt(p.probability / maxProbability);
          const color = phaseColor(p.phaseDeg);
          return (
            <g key={p.bitstring}>
              <title>{`|${p.bitstring}⟩: ${(p.probability * 100).toFixed(1)}%, phase ${p.phaseDeg.toFixed(0)}°`}</title>
              <line x1={cx} y1={cy} x2={tip.x} y2={tip.y} stroke={color} strokeWidth={1.5} strokeOpacity={0.6} />
              <circle cx={tip.x} cy={tip.y} r={radius} fill={color} stroke="var(--surface)" strokeWidth={1.5} />
            </g>
          );
        })}
        <circle cx={cx} cy={cy} r={2} fill="var(--chart-ink-muted)" />
      </svg>

      <div className="flex w-full flex-col gap-1.5">
        {points.slice(0, 8).map((p) => (
          <div key={p.bitstring} className="flex items-center gap-2 text-xs">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: phaseColor(p.phaseDeg) }}
            />
            <span className="font-mono text-[var(--foreground)]">|{p.bitstring}⟩</span>
            <span className="text-[var(--foreground-muted)]">{(p.probability * 100).toFixed(1)}%</span>
            <span className="ml-auto text-[var(--foreground-subtle)]">{p.phaseDeg.toFixed(0)}°</span>
          </div>
        ))}
        {points.length > 8 && (
          <p className="text-xs text-[var(--foreground-subtle)]">+{points.length - 8} more</p>
        )}
      </div>
    </div>
  );
}
