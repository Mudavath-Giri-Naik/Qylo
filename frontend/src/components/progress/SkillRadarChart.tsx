"use client";

import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import type { SkillPoint } from "@/lib/dashboard/insights";

const chartConfig = {
  value: { label: "Proficiency", color: "var(--accent)" },
} satisfies ChartConfig;

export default function SkillRadarChart({ data }: { data: SkillPoint[] }) {
  return (
    <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-72 w-full">
      <RadarChart data={data} outerRadius="75%">
        <PolarGrid />
        <PolarAngleAxis dataKey="skill" tick={{ fontSize: 11, fill: "var(--foreground-muted)" }} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Radar dataKey="value" fill="var(--color-value)" fillOpacity={0.35} stroke="var(--color-value)" strokeWidth={2} />
      </RadarChart>
    </ChartContainer>
  );
}
