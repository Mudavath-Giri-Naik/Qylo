"use client";

import { useId, useState } from "react";

export default function Histogram({ counts }: { counts: Record<string, number> }) {
  const gradientId = useId();
  const entries = Object.entries(counts).sort(([a], [b]) => (a < b ? -1 : 1));
  const total = entries.reduce((sum, [, c]) => sum + c, 0);
  const [hovered, setHovered] = useState<string | null>(null);

  if (entries.length === 0 || total === 0) {
    return <p className="text-sm text-foreground/60">No results yet.</p>;
  }

  const width = 640;
  const height = 300;
  const padding = { top: 24, right: 16, bottom: 56, left: 40 };
  const plotW = width - padding.left - padding.right;
  const plotH = height - padding.top - padding.bottom;
  const barGap = 12;
  const barW = Math.min(56, (plotW - barGap * (entries.length - 1)) / entries.length);
  const maxProb = Math.max(...entries.map(([, c]) => c / total));
  const yScale = (p: number) => (maxProb > 0 ? (p / maxProb) * plotH : 0);

  return (
    <div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" role="img" aria-label="Measurement probability histogram">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--chart-series-1)" stopOpacity="1" />
            <stop offset="100%" stopColor="var(--chart-series-1)" stopOpacity="0.75" />
          </linearGradient>
        </defs>

        {[0, 0.25, 0.5, 0.75, 1].map((f) => (
          <g key={f}>
            <line
              x1={padding.left}
              x2={width - padding.right}
              y1={padding.top + plotH * (1 - f)}
              y2={padding.top + plotH * (1 - f)}
              stroke="var(--chart-grid)"
              strokeWidth={1}
            />
            <text
              x={padding.left - 8}
              y={padding.top + plotH * (1 - f) + 4}
              textAnchor="end"
              fontSize={10}
              fill="var(--chart-ink-muted)"
            >
              {Math.round(f * (maxProb > 0 ? maxProb * 100 : 100))}
            </text>
          </g>
        ))}

        <line
          x1={padding.left}
          x2={width - padding.right}
          y1={padding.top + plotH}
          y2={padding.top + plotH}
          stroke="var(--chart-baseline)"
          strokeWidth={1.5}
        />

        {entries.map(([bitstring, count], i) => {
          const prob = count / total;
          const barH = yScale(prob);
          const x =
            padding.left +
            i * (barW + barGap) +
            Math.max(0, (plotW - entries.length * barW - (entries.length - 1) * barGap) / 2);
          const y = padding.top + plotH - barH;
          const isHovered = hovered === bitstring;

          return (
            <g
              key={bitstring}
              onMouseEnter={() => setHovered(bitstring)}
              onMouseLeave={() => setHovered(null)}
            >
              <title>{`${bitstring}: ${count} shots (${(prob * 100).toFixed(1)}%)`}</title>
              <rect
                x={x}
                y={y}
                width={barW}
                height={Math.max(barH, 2)}
                rx={4}
                fill={`url(#${gradientId})`}
                opacity={isHovered ? 1 : 0.92}
              />
              <text
                x={x + barW / 2}
                y={y - 6}
                textAnchor="middle"
                fontSize={12}
                fill="var(--chart-ink-secondary)"
              >
                {(prob * 100).toFixed(1)}%
              </text>
              <text
                x={x + barW / 2}
                y={padding.top + plotH + 18}
                textAnchor="middle"
                fontSize={13}
                fontFamily="var(--font-geist-mono)"
                fill="var(--chart-ink-primary)"
              >
                {bitstring}
              </text>
            </g>
          );
        })}

        <text
          x={padding.left / 2 - 6}
          y={padding.top + plotH / 2}
          textAnchor="middle"
          fontSize={11}
          fill="var(--chart-ink-secondary)"
          transform={`rotate(-90, ${padding.left / 2 - 6}, ${padding.top + plotH / 2})`}
        >
          Probability (%)
        </text>
        <text
          x={padding.left + plotW / 2}
          y={height - 8}
          textAnchor="middle"
          fontSize={11}
          fill="var(--chart-ink-secondary)"
        >
          Computational basis states
        </text>
      </svg>
      <p className="mt-1 text-center text-xs text-foreground/50">{total} shots</p>
    </div>
  );
}
