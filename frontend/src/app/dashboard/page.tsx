import Link from "next/link";
import { ArrowRight, ArrowUpRight, Award, BookOpen, Boxes, Sparkle, Target, Trophy, Zap } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getDashboardOverview } from "@/lib/dashboard/queries";
import { Card } from "@/components/ui/card";

const SAMPLE_LEADERBOARD = [
  { name: "Arjun Mehta", points: 12400 },
  { name: "Priya Sharma", points: 10250 },
  { name: "Liam Chen", points: 9800 },
  { name: "Sophia Martinez", points: 8600 },
];

function AtomIllustration() {
  return (
    <svg viewBox="0 0 220 180" className="h-full w-full" aria-hidden>
      <g stroke="var(--accent)" strokeWidth="1.6" fill="none" opacity="0.55">
        <ellipse cx="110" cy="90" rx="95" ry="38" />
        <ellipse cx="110" cy="90" rx="95" ry="38" transform="rotate(60 110 90)" />
        <ellipse cx="110" cy="90" rx="95" ry="38" transform="rotate(120 110 90)" />
      </g>
      <circle cx="110" cy="90" r="16" fill="var(--accent)" opacity="0.9" />
      <circle cx="110" cy="90" r="24" fill="var(--accent)" opacity="0.15" />
    </svg>
  );
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const overview = await getDashboardOverview(user.id);
  const displayName = user.email ? user.email.split("@")[0] : "there";

  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      <h1 className="text-3xl font-bold tracking-tight text-[var(--foreground)]">Dashboard</h1>
      <p className="mt-1 text-[var(--foreground-muted)]">Your quantum learning journey starts here.</p>

      {/* Row 1 */}
      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="relative overflow-hidden p-8 lg:col-span-2">
          <div className="absolute right-0 top-0 h-full w-1/2 opacity-90 max-lg:hidden">
            <AtomIllustration />
          </div>
          <Sparkle aria-hidden className="pointer-events-none absolute right-[15%] top-8 h-4 w-4 text-[var(--marketing-pink)] max-lg:hidden" />
          <Sparkle aria-hidden className="pointer-events-none absolute right-[28%] top-20 h-3 w-3 text-[var(--accent)] max-lg:hidden" />
          <Sparkle aria-hidden className="pointer-events-none absolute right-[8%] bottom-10 h-3 w-3 text-[var(--marketing-green)] max-lg:hidden" />

          <div className="relative max-w-sm">
            <h2 className="text-2xl font-bold text-[var(--foreground)]">
              Welcome back, <span className="capitalize">{displayName}</span> <span aria-hidden>👋</span>
            </h2>
            <p className="mt-2 text-sm text-[var(--foreground-muted)]">
              Explore quantum computing, learn real algorithms, build circuits and run them on real quantum hardware.
            </p>

            <div className="mt-6 flex items-center gap-8">
              <div>
                <p className="text-2xl font-bold text-[var(--foreground)]">{overview.totalModules}</p>
                <p className="text-xs text-[var(--foreground-muted)]">Courses Enrolled</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--foreground)]">{overview.circuitsBuilt}</p>
                <p className="text-xs text-[var(--foreground-muted)]">Circuits Built</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--foreground)]">{overview.challengesSolved}</p>
                <p className="text-xs text-[var(--foreground-muted)]">Challenges Solved</p>
              </div>
            </div>

            <Link
              href="/learn"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[var(--marketing-ink)] px-4 py-2.5 text-sm font-semibold text-[var(--background)] transition-opacity hover:opacity-90"
            >
              Continue Learning <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[var(--foreground)]">Current Learning Path</h3>
            <Link href="/learn" className="text-xs font-semibold text-[var(--accent)] hover:underline">
              View All
            </Link>
          </div>

          <div className="mt-4 rounded-xl border border-[var(--border)] p-4">
            {overview.currentModule ? (
              <>
                <p className="text-sm font-semibold text-[var(--foreground)]">{overview.currentModule.title}</p>
                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[var(--surface-2)]">
                  <div
                    className="h-full rounded-full bg-[var(--marketing-green)]"
                    style={{ width: `${overview.currentModule.percent}%` }}
                  />
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-[var(--foreground-muted)]">
                  <span>Module in progress</span>
                  <span>{overview.currentModule.percent}%</span>
                </div>
              </>
            ) : (
              <p className="text-sm text-[var(--foreground-muted)]">All modules complete — nice work!</p>
            )}
          </div>

          <Link
            href={overview.currentModule ? `/learn/${overview.currentModule.code}` : "/learn"}
            className="mt-4 block rounded-lg bg-[var(--accent)]/10 px-4 py-2.5 text-center text-sm font-semibold text-[var(--accent)] transition-colors hover:bg-[var(--accent)]/15"
          >
            Continue Learning
          </Link>
        </Card>

        <Card className="p-6" style={{ background: "color-mix(in srgb, var(--marketing-green) 10%, var(--surface))" }}>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[var(--foreground)]">Hardware Access</h3>
            <Link href="/hardware-access" className="text-xs font-semibold text-[var(--accent)] hover:underline">
              View All
            </Link>
          </div>

          <div className="mt-4 rounded-xl bg-[var(--surface)] p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-[var(--foreground)]">IBM Quantum</span>
              <span className="flex items-center gap-1.5 text-xs font-semibold text-[var(--marketing-green)]">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--marketing-green)]" /> Available
              </span>
            </div>
            <p className="mt-1.5 text-xs text-[var(--foreground-muted)]">Run your circuits on real quantum hardware.</p>
            <Link
              href="/circuit-builder"
              className="mt-3 block rounded-lg bg-[var(--marketing-green)] px-4 py-2 text-center text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              Launch Composer
            </Link>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-[var(--surface)] p-3">
              <p className="text-lg font-bold text-[var(--foreground)]">{overview.circuitsThisMonth}</p>
              <p className="text-xs text-[var(--foreground-muted)]">Runs this month</p>
            </div>
            <div className="rounded-xl bg-[var(--surface)] p-3">
              <p className="text-lg font-bold text-[var(--foreground)]">95%</p>
              <p className="text-xs text-[var(--foreground-muted)]">Success rate</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Row 2 */}
      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[var(--foreground)]">Overall Learning Progress</h3>
            <Link href="/my-progress" className="text-xs font-semibold text-[var(--accent)] hover:underline">
              View Details
            </Link>
          </div>

          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-4xl font-bold text-[var(--foreground)]">{overview.overallPercent}%</span>
            {overview.weeklyLessonPercent > 0 && (
              <span className="flex items-center gap-0.5 rounded-full bg-[var(--marketing-green)]/15 px-2 py-0.5 text-xs font-semibold text-[var(--marketing-green)]">
                <ArrowUpRight className="h-3 w-3" /> {overview.weeklyLessonPercent}%
              </span>
            )}
          </div>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[var(--surface-2)]">
            <div className="h-full rounded-full bg-[var(--accent)]" style={{ width: `${overview.overallPercent}%` }} />
          </div>
          <p className="mt-2 text-xs text-[var(--foreground-muted)]">You&apos;re doing great! Keep going.</p>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2.5 rounded-xl bg-blue-500/10 p-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/15 text-blue-600 dark:text-blue-400">
                <BookOpen className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-bold text-[var(--foreground)]">{overview.totalModules}</p>
                <p className="text-[11px] text-[var(--foreground-muted)]">Courses Enrolled</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 rounded-xl bg-[var(--marketing-green)]/10 p-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--marketing-green)]/15 text-[var(--marketing-green)]">
                <Award className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-bold text-[var(--foreground)]">{overview.challengesSolved}</p>
                <p className="text-[11px] text-[var(--foreground-muted)]">Certificates Earned</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 rounded-xl bg-orange-500/10 p-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-500/15 text-orange-600 dark:text-orange-400">
                <Target className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-bold text-[var(--foreground)]">{overview.challengesAttempted}</p>
                <p className="text-[11px] text-[var(--foreground-muted)]">Challenges Attempted</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 rounded-xl bg-[var(--marketing-pink)]/10 p-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--marketing-pink)]/20 text-[var(--marketing-pink)]">
                <Trophy className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-bold text-[var(--foreground)]">{overview.challengesSolved}</p>
                <p className="text-[11px] text-[var(--foreground-muted)]">Challenges Solved</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[var(--foreground)]">Recent Activity</h3>
            <Link href="/my-progress" className="text-xs font-semibold text-[var(--accent)] hover:underline">
              View All
            </Link>
          </div>

          <ul className="mt-4 flex flex-col gap-4">
            {overview.recentActivity.length === 0 ? (
              <p className="text-sm text-[var(--foreground-muted)]">
                No activity yet — try a challenge to get started.
              </p>
            ) : (
              overview.recentActivity.map((item) => (
                <li key={item.id} className="flex items-start gap-3">
                  <span
                    className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                    style={{
                      background:
                        item.tone === "green"
                          ? "var(--marketing-green)"
                          : item.tone === "orange"
                            ? "#f97316"
                            : item.tone === "pink"
                              ? "var(--marketing-pink)"
                              : "var(--accent)",
                    }}
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm text-[var(--foreground)]">{item.label}</p>
                    <p className="text-xs text-[var(--foreground-muted)]">{item.relative}</p>
                  </div>
                </li>
              ))
            )}
          </ul>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[var(--foreground)]">Community Leaderboard</h3>
            <Link href="/leaderboard" className="text-xs font-semibold text-[var(--accent)] hover:underline">
              View All
            </Link>
          </div>

          <ul className="mt-4 flex flex-col gap-1">
            {SAMPLE_LEADERBOARD.map((entry, i) => (
              <li key={entry.name} className="flex items-center justify-between rounded-lg px-2 py-2">
                <div className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--surface-2)] text-xs font-bold text-[var(--foreground-muted)]">
                    {i + 1}
                  </span>
                  <span className="text-sm text-[var(--foreground)]">{entry.name}</span>
                </div>
                <span className="text-sm font-semibold text-[var(--foreground-muted)]">
                  {entry.points.toLocaleString()} pts
                </span>
              </li>
            ))}
            <li className="flex items-center justify-between rounded-lg bg-[var(--accent)]/10 px-2 py-2">
              <div className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--accent)] text-xs font-bold text-[var(--accent-foreground)]">
                  5
                </span>
                <span className="text-sm font-semibold text-[var(--foreground)]">You</span>
              </div>
              <span className="text-sm font-semibold text-[var(--accent)]">
                {(overview.challengesSolved * 250 + overview.circuitsBuilt * 60).toLocaleString()} pts
              </span>
            </li>
          </ul>
        </Card>
      </div>

      {/* Row 3 */}
      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="p-6">
          <h3 className="text-sm font-bold text-[var(--foreground)]">Weekly Learning Streak</h3>
          <p className="mt-3 text-3xl font-bold text-[var(--foreground)]">
            {overview.streakDays} day{overview.streakDays === 1 ? "" : "s"}
          </p>
          <p className="text-xs text-[var(--foreground-muted)]">Keep your streak alive!</p>

          <div className="mt-4 flex justify-between">
            {overview.weeklyStreak.map((day) => (
              <div key={day.label} className="flex flex-col items-center gap-1.5">
                <span
                  className={`h-3 w-3 rounded-full ${
                    day.active ? "bg-[var(--accent)]" : "border border-[var(--border-strong)]"
                  }`}
                />
                <span className={`text-xs ${day.isToday ? "font-bold text-[var(--foreground)]" : "text-[var(--foreground-muted)]"}`}>
                  {day.label}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[var(--foreground)]">Challenges</h3>
            <Link href="/challenges" className="text-xs font-semibold text-[var(--accent)] hover:underline">
              View All
            </Link>
          </div>
          <p className="mt-3 text-3xl font-bold text-[var(--foreground)]">
            {overview.challengesThisWeek} / {Math.max(5, overview.challengesThisWeek)}
          </p>
          <p className="text-xs text-[var(--foreground-muted)]">challenges completed this week</p>
          <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-[var(--surface-2)]">
            <div
              className="h-full rounded-full bg-orange-500"
              style={{ width: `${Math.min(100, Math.round((overview.challengesThisWeek / Math.max(5, overview.challengesThisWeek)) * 100))}%` }}
            />
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-sm font-bold text-[var(--foreground)]">Explore Next</h3>
          <Link
            href={overview.nextSuggestion ? `/learn/${overview.nextSuggestion.moduleCode}` : "/challenges"}
            className="mt-3 flex items-center justify-between rounded-xl border border-[var(--border)] p-4 transition-colors hover:bg-[var(--surface-hover)]"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[var(--accent)]">
                {overview.nextSuggestion
                  ? `Try a challenge in ${overview.nextSuggestion.moduleTitle}`
                  : "Browse all challenges"}
              </p>
              <p className="mt-1 text-xs text-[var(--foreground-muted)]">
                Apply what you learned and solve a real problem.
              </p>
            </div>
            <ArrowRight className="h-4 w-4 shrink-0 text-[var(--foreground-muted)]" />
          </Link>

          <div className="mt-3 flex items-center gap-2 text-xs text-[var(--foreground-muted)]">
            <Boxes className="h-3.5 w-3.5" />
            <Zap className="h-3.5 w-3.5" />
            <span>Powered by real Qiskit simulation</span>
          </div>
        </Card>
      </div>
    </main>
  );
}
