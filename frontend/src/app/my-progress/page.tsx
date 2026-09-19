import { Award, BookOpen, Lock, Target, Zap } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getDashboardData, getDashboardOverview } from "@/lib/dashboard/queries";
import { ACHIEVEMENT_COLORS, ACHIEVEMENT_ICONS, buildAchievements } from "@/lib/dashboard/achievements";
import { computeSkillProgress, getActivityHeatmap, getFirstCircuitDate } from "@/lib/dashboard/insights";
import { rankWithYou } from "@/lib/community/sampleCommunity";
import { MODULE_META, THEME_STYLES } from "@/lib/learn/moduleMeta";
import JoinClassForm from "@/components/dashboard/JoinClassForm";
import SkillRadarChart from "@/components/progress/SkillRadarChart";
import ActivityHeatmap from "@/components/progress/ActivityHeatmap";
import { Card } from "@/components/ui/card";

export default async function MyProgressPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const [{ modules, submissions }, overview, heatmap, firstCircuitAt] = await Promise.all([
    getDashboardData(user.id),
    getDashboardOverview(user.id),
    getActivityHeatmap(user.id),
    getFirstCircuitDate(user.id),
  ]);

  const coursesCompleted = modules.filter((m) => m.totalLessons > 0 && m.lessonsRead >= m.totalLessons).length;
  const yourPoints = overview.challengesSolved * 250 + overview.circuitsBuilt * 60;
  const ranked = rankWithYou({ points: yourPoints, challenges: overview.challengesSolved, circuits: overview.circuitsBuilt });
  const yourRank = ranked.findIndex((m) => m.isYou) + 1;
  const percentile = Math.max(1, Math.round((yourRank / ranked.length) * 100));

  const skillData = computeSkillProgress(modules, overview);
  const lastSolvedAt = submissions.find((s) => s.passed)?.timestamp ?? null;
  const achievements = buildAchievements({
    circuitsBuilt: overview.circuitsBuilt,
    firstCircuitAt,
    challengesSolved: overview.challengesSolved,
    lastSolvedAt,
    streakDays: overview.streakDays,
  });

  return (
    <main className="mx-auto max-w-7xl px-6 py-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">My Progress</h1>
          <p className="mt-0.5 text-sm text-[var(--foreground-muted)]">
            Track your learning journey, skills, and achievements in quantum computing.
          </p>
        </div>
        <JoinClassForm />
      </div>

      {/* Stat strip */}
      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Card className="gap-0 p-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/15 text-blue-600 dark:text-blue-400">
            <BookOpen className="h-4.5 w-4.5" />
          </div>
          <p className="mt-2 text-xs font-semibold text-[var(--foreground-muted)]">Courses Completed</p>
          <p className="mt-0.5 text-xl font-bold text-[var(--foreground)]">
            {coursesCompleted} <span className="text-sm font-medium text-[var(--foreground-subtle)]">of {modules.length} enrolled</span>
          </p>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[var(--surface-2)]">
            <div
              className="h-full rounded-full bg-blue-500"
              style={{ width: `${modules.length > 0 ? Math.round((coursesCompleted / modules.length) * 100) : 0}%` }}
            />
          </div>
        </Card>

        <Card className="gap-0 p-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--marketing-pink)]/20 text-[var(--marketing-pink)]">
            <Target className="h-4.5 w-4.5" />
          </div>
          <p className="mt-2 text-xs font-semibold text-[var(--foreground-muted)]">Challenges Solved</p>
          <p className="mt-0.5 text-xl font-bold text-[var(--foreground)]">
            {overview.challengesSolved} <span className="text-sm font-medium text-[var(--foreground-subtle)]">of {overview.totalChallenges} attempted</span>
          </p>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[var(--surface-2)]">
            <div
              className="h-full rounded-full bg-[var(--marketing-pink)]"
              style={{ width: `${overview.totalChallenges > 0 ? Math.round((overview.challengesSolved / overview.totalChallenges) * 100) : 0}%` }}
            />
          </div>
        </Card>

        <Card className="gap-0 p-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500/15 text-orange-600 dark:text-orange-400">
            <Zap className="h-4.5 w-4.5" />
          </div>
          <p className="mt-2 text-xs font-semibold text-[var(--foreground-muted)]">Current Streak</p>
          <p className="mt-0.5 text-xl font-bold text-[var(--foreground)]">
            {overview.streakDays} day{overview.streakDays === 1 ? "" : "s"}
          </p>
          <p className="mt-2 text-[11px] font-semibold text-orange-600 dark:text-orange-400">
            {overview.streakDays > 0 ? "Keep it going!" : "Start today!"}
          </p>
        </Card>

        <Card className="gap-0 p-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-600 dark:text-indigo-400">
            <Award className="h-4.5 w-4.5" />
          </div>
          <p className="mt-2 text-xs font-semibold text-[var(--foreground-muted)]">Total Points</p>
          <p className="mt-0.5 text-xl font-bold text-[var(--foreground)]">{yourPoints.toLocaleString()}</p>
          <p className="mt-2 text-[11px] font-semibold text-[var(--accent)]">Top {percentile}% globally</p>
        </Card>
      </div>

      {/* Row 2 */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="gap-0 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[var(--foreground)]">Learning Progress</h3>
            <span className="text-[11px] text-[var(--foreground-muted)]">Your progress across enrolled courses</span>
          </div>
          <div className="mt-3 flex flex-col gap-3.5">
            {modules.map((m) => {
              const meta = MODULE_META[m.module_code];
              const percent = m.totalLessons > 0 ? Math.round((m.lessonsRead / m.totalLessons) * 100) : 0;
              return (
                <div key={m.module_code}>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: meta ? THEME_STYLES[meta.theme].bar : "var(--accent)" }} />
                      <span className="truncate text-xs font-semibold text-[var(--foreground)]">{m.title}</span>
                    </div>
                    <span className="shrink-0 text-[11px] font-semibold text-[var(--foreground-muted)]">
                      {percent}%
                    </span>
                  </div>
                  <p className="ml-4 text-[10px] text-[var(--foreground-subtle)]">
                    {m.lessonsRead} / {m.totalLessons} lessons
                  </p>
                  <div className="ml-4 mt-1 h-1.5 overflow-hidden rounded-full bg-[var(--surface-2)]">
                    <div className="h-full rounded-full bg-[var(--accent)]" style={{ width: `${percent}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="gap-0 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[var(--foreground)]">Skill Progress</h3>
            <span className="text-[11px] text-[var(--foreground-muted)]">Your proficiency in key quantum skills</span>
          </div>
          <SkillRadarChart data={skillData} />
        </Card>

        <Card className="gap-0 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[var(--foreground)]">Activity Calendar</h3>
            <span className="text-[11px] text-[var(--foreground-muted)]">Last 13 weeks</span>
          </div>
          <div className="mt-3">
            <ActivityHeatmap data={heatmap} />
          </div>
          <div className="mt-3 flex items-center justify-end gap-1.5 text-[10px] text-[var(--foreground-subtle)]">
            Less
            {[0, 1, 2, 3, 4].map((level) => (
              <span
                key={level}
                className="h-2.5 w-2.5 rounded-[2px]"
                style={{
                  background:
                    level === 0
                      ? "var(--surface-2)"
                      : `color-mix(in srgb, var(--accent) ${level * 25}%, var(--surface-2))`,
                }}
              />
            ))}
            More
          </div>
        </Card>
      </div>

      {/* Row 3 */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="gap-0 p-4 lg:col-span-2">
          <h3 className="text-sm font-bold text-[var(--foreground)]">Recent Achievements</h3>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {achievements.map((a) => {
              const Icon = ACHIEVEMENT_ICONS[a.id];
              const colors = ACHIEVEMENT_COLORS[a.id];
              return (
                <div
                  key={a.id}
                  className={`rounded-xl border p-3 ${
                    a.unlocked ? "border-[var(--border)] bg-[var(--surface)]" : "border-dashed border-[var(--border)] opacity-60"
                  }`}
                >
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-full"
                    style={a.unlocked ? { background: colors.bg, color: colors.fg } : { background: "var(--surface-2)", color: "var(--foreground-subtle)" }}
                  >
                    {a.unlocked ? <Icon className="h-4 w-4" /> : <Lock className="h-3.5 w-3.5" />}
                  </div>
                  <p className="mt-2 text-xs font-bold text-[var(--foreground)]">{a.title}</p>
                  <p className="mt-0.5 text-[10px] leading-snug text-[var(--foreground-muted)]">{a.description}</p>
                  {a.relative && <p className="mt-1 text-[10px] text-[var(--foreground-subtle)]">{a.relative}</p>}
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="gap-0 p-4">
          <h3 className="text-sm font-bold text-[var(--foreground)]">Recent Activity</h3>
          <ul className="mt-2.5 flex flex-col gap-2.5">
            {overview.recentActivity.length === 0 ? (
              <p className="text-xs text-[var(--foreground-muted)]">No activity yet — try a challenge.</p>
            ) : (
              overview.recentActivity.map((item) => (
                <li key={item.id} className="flex items-start gap-2.5">
                  <span
                    className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full"
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
                    <p className="truncate text-xs text-[var(--foreground)]">{item.label}</p>
                    <p className="text-[10px] text-[var(--foreground-muted)]">{item.relative}</p>
                  </div>
                </li>
              ))
            )}
          </ul>
        </Card>
      </div>
    </main>
  );
}
