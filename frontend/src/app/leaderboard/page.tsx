import { createClient } from "@/lib/supabase/server";
import { getDashboardOverview } from "@/lib/dashboard/queries";
import { Card } from "@/components/ui/card";

const SAMPLE_LEADERBOARD = [
  { name: "Arjun Mehta", points: 12400 },
  { name: "Priya Sharma", points: 10250 },
  { name: "Liam Chen", points: 9800 },
  { name: "Sophia Martinez", points: 8600 },
  { name: "Noah Kim", points: 6200 },
  { name: "Ananya Rao", points: 5100 },
  { name: "Ethan Brooks", points: 4300 },
];

export default async function LeaderboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const overview = await getDashboardOverview(user.id);
  const yourPoints = overview.challengesSolved * 250 + overview.circuitsBuilt * 60;

  const entries = [...SAMPLE_LEADERBOARD, { name: "You", points: yourPoints, isYou: true }].sort(
    (a, b) => b.points - a.points
  );

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="text-3xl font-bold tracking-tight text-[var(--foreground)]">Community Leaderboard</h1>
      <p className="mt-1 text-[var(--foreground-muted)]">
        Ranked by challenges solved and circuits built. Sample rankings for now — real community scoring is on the way.
      </p>

      <Card className="mt-6 p-2">
        <ul className="flex flex-col gap-1">
          {entries.map((entry, i) => (
            <li
              key={entry.name}
              className={`flex items-center justify-between rounded-lg px-3 py-2.5 ${
                "isYou" in entry && entry.isYou ? "bg-[var(--accent)]/10" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--surface-2)] text-xs font-bold text-[var(--foreground-muted)]">
                  {i + 1}
                </span>
                <span
                  className={`text-sm ${
                    "isYou" in entry && entry.isYou ? "font-semibold text-[var(--foreground)]" : "text-[var(--foreground)]"
                  }`}
                >
                  {entry.name}
                </span>
              </div>
              <span className="text-sm font-semibold text-[var(--foreground-muted)]">
                {entry.points.toLocaleString()} pts
              </span>
            </li>
          ))}
        </ul>
      </Card>
    </main>
  );
}
