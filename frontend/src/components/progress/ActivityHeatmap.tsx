import type { ActivityHeatmap as ActivityHeatmapData } from "@/lib/dashboard/insights";

const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function levelFor(count: number, maxCount: number): number {
  if (count === 0) return 0;
  if (maxCount <= 1) return 4;
  const ratio = count / maxCount;
  if (ratio > 0.75) return 4;
  if (ratio > 0.5) return 3;
  if (ratio > 0.25) return 2;
  return 1;
}

const LEVEL_OPACITY = [0, 0.28, 0.5, 0.72, 1];

function monthLabelFor(weeks: ActivityHeatmapData["weeks"], index: number): string | null {
  const day = new Date(weeks[index][0].date);
  if (index === 0) return day.toLocaleDateString("en-US", { month: "short" });
  const prev = new Date(weeks[index - 1][0].date);
  return day.getMonth() !== prev.getMonth() ? day.toLocaleDateString("en-US", { month: "short" }) : null;
}

export default function ActivityHeatmap({ data }: { data: ActivityHeatmapData }) {
  return (
    <div className="flex gap-2">
      <div className="flex flex-col justify-between py-4 text-[10px] text-[var(--foreground-subtle)]">
        {WEEKDAY_LABELS.map((label, i) => (
          <span key={label} className={i % 2 === 0 ? "" : "opacity-0"}>
            {label}
          </span>
        ))}
      </div>

      <div className="flex-1 overflow-x-auto">
        <div className="mb-1 flex gap-[3px] pl-px text-[10px] text-[var(--foreground-subtle)]">
          {data.weeks.map((_, i) => (
            <span key={i} className="w-[13px] shrink-0 text-center">
              {monthLabelFor(data.weeks, i) ?? ""}
            </span>
          ))}
        </div>
        <div className="flex gap-[3px]">
          {data.weeks.map((week, wi) => (
            <div key={wi} className="flex shrink-0 flex-col gap-[3px]">
              {week.map((day) => {
                const level = levelFor(day.count, data.maxCount);
                return (
                  <div
                    key={day.date}
                    title={`${day.date} · ${day.count} ${day.count === 1 ? "activity" : "activities"}`}
                    className="h-[13px] w-[13px] rounded-[3px]"
                    style={{
                      background:
                        level === 0
                          ? "var(--surface-2)"
                          : `color-mix(in srgb, var(--accent) ${Math.round(LEVEL_OPACITY[level] * 100)}%, var(--surface-2))`,
                    }}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
