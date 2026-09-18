"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";

const chartConfig = {
  lessons: { label: "Lessons read", color: "var(--chart-1)" },
  challenges: { label: "Challenges passed", color: "var(--chart-2)" },
} satisfies ChartConfig;

export default function ModuleCompletionChart({
  data,
}: {
  data: { module: string; lessons: number; challenges: number }[];
}) {
  return (
    <ChartContainer config={chartConfig} className="mb-6 max-h-64 w-full">
      <BarChart data={data}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="module" tickLine={false} axisLine={false} tickMargin={8} />
        <YAxis tickLine={false} axisLine={false} tickMargin={8} domain={[0, 100]} unit="%" />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="lessons" fill="var(--color-lessons)" radius={4} />
        <Bar dataKey="challenges" fill="var(--color-challenges)" radius={4} />
      </BarChart>
    </ChartContainer>
  );
}
