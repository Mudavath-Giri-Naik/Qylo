export default function BlochSphere({
  vector,
}: {
  vector: [number, number, number];
}) {
  const [x, y, z] = vector;

  const size = 260;
  const cx = size / 2;
  const cy = size / 2;
  const R = 92;
  const depthX = 0.42;
  const depthY = 0.22;

  const project = (px: number, py: number, pz: number) => ({
    x: cx + R * px + R * depthX * py,
    y: cy - R * pz - R * depthY * py,
  });

  const tip = project(x, y, z);
  const equatorRy = R * depthY + 6;

  const axisLine = (from: [number, number, number], to: [number, number, number]) => {
    const a = project(...from);
    const b = project(...to);
    return { x1: a.x, y1: a.y, x2: b.x, y2: b.y };
  };

  const xAxis = axisLine([-1, 0, 0], [1, 0, 0]);
  const yAxis = axisLine([0, -1, 0], [0, 1, 0]);
  const zAxis = axisLine([0, 0, -1], [0, 0, 1]);

  return (
    <div className="flex flex-col items-center">
      <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[260px]" role="img" aria-label="Bloch sphere">
        <circle cx={cx} cy={cy} r={R} fill="var(--chart-series-1)" fillOpacity={0.06} stroke="var(--chart-baseline)" strokeWidth={1} />
        <ellipse cx={cx} cy={cy} rx={R} ry={equatorRy} fill="none" stroke="var(--chart-grid)" strokeWidth={1} strokeDasharray="3 3" />

        <line {...xAxis} stroke="var(--chart-ink-muted)" strokeWidth={1} />
        <line {...yAxis} stroke="var(--chart-ink-muted)" strokeWidth={1} />
        <line {...zAxis} stroke="var(--chart-ink-muted)" strokeWidth={1} />

        <text x={project(0, 0, 1.18).x} y={project(0, 0, 1.18).y} textAnchor="middle" fontSize={12} fill="var(--chart-ink-secondary)">|0⟩</text>
        <text x={project(0, 0, -1.22).x} y={project(0, 0, -1.22).y} textAnchor="middle" fontSize={12} fill="var(--chart-ink-secondary)">|1⟩</text>
        <text x={project(1.18, 0, 0).x} y={project(1.18, 0, 0).y} textAnchor="middle" fontSize={11} fill="var(--chart-ink-muted)">+X</text>
        <text x={project(0, 1.22, 0).x} y={project(0, 1.22, 0).y} textAnchor="middle" fontSize={11} fill="var(--chart-ink-muted)">+Y</text>

        <line x1={cx} y1={cy} x2={tip.x} y2={tip.y} stroke="var(--chart-series-1)" strokeWidth={2.5} strokeLinecap="round" />
        <circle cx={tip.x} cy={tip.y} r={5} fill="var(--chart-series-1)" />
        <circle cx={cx} cy={cy} r={2} fill="var(--chart-ink-muted)" />
      </svg>
      <p className="mt-2 font-mono text-xs text-foreground/60">
        x={x.toFixed(3)}, y={y.toFixed(3)}, z={z.toFixed(3)}
      </p>
    </div>
  );
}
