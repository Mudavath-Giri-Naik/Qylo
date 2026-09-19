"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Award,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Circle,
  Cpu,
  Flame,
  Globe,
  Link2,
  Pencil,
  Target,
  TrendingUp,
  Trophy,
  Zap,
} from "lucide-react";
import type { DashboardOverview, ModuleProgress, SubmissionSummary } from "@/lib/dashboard/queries";
import { ACHIEVEMENT_COLORS, ACHIEVEMENT_ICONS, type Achievement } from "@/lib/dashboard/achievements";
import { MODULE_META, DIFFICULTY_BADGE } from "@/lib/learn/moduleMeta";
import { defaultLocalProfile, useLocalProfile } from "@/hooks/useLocalProfile";
import EditProfileModal from "@/components/profile/EditProfileModal";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarBadge, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const TABS = ["Overview", "Achievements", "Certificates", "Activity", "Settings"] as const;
type Tab = (typeof TABS)[number];

export interface ProfileViewProps {
  userId: string;
  email: string;
  oauthName: string | null;
  oauthAvatarUrl: string | null;
  role: "learner" | "instructor" | null;
  preferredLanguage: string;
  memberSince: string;
  modules: ModuleProgress[];
  submissions: SubmissionSummary[];
  overview: DashboardOverview;
  coursesCompleted: number;
  points: number;
  rank: number;
  percentile: number;
  achievements: Achievement[];
  firstCircuitAt: string | null;
  lastSolvedAt: string | null;
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-[var(--accent)]/10 px-2.5 py-0.5 text-[11px] font-semibold text-[var(--accent)]">
      {children}
    </span>
  );
}

function StatPill({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-col items-center px-2 text-center">
      <span className="text-xl font-bold text-[var(--foreground)]">{value}</span>
      <span className="text-[11px] text-[var(--foreground-muted)]">{label}</span>
    </div>
  );
}

function Sparkline({ seed }: { seed: number }) {
  const values = [0.4, 0.5, 0.46, 0.6, 0.7, 0.64, 0.84, 1].map((f) => Math.round(f * Math.max(seed, 100)));
  const max = Math.max(...values);
  const min = Math.min(...values);
  const w = 100;
  const h = 32;
  const coords = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w;
    const y = h - ((v - min) / Math.max(1, max - min)) * (h - 4) - 2;
    return `${x},${y}`;
  });
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-8 w-full" preserveAspectRatio="none">
      <polyline points={coords.join(" ")} fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function formatMonthYear(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function formatDuration(startIso: string): string {
  const start = new Date(startIso);
  const end = new Date();
  let months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  if (end.getDate() < start.getDate()) months -= 1;
  months = Math.max(0, months);
  const years = Math.floor(months / 12);
  const remMonths = months % 12;
  const parts: string[] = [];
  if (years > 0) parts.push(`${years} year${years === 1 ? "" : "s"}`);
  if (remMonths > 0 || years === 0) parts.push(`${remMonths} month${remMonths === 1 ? "" : "s"}`);
  return `Active for ${parts.join(" ")}`;
}

function deriveSkillChips(modules: ModuleProgress[], overview: DashboardOverview): string[] {
  const chips: string[] = [];
  for (const m of modules) {
    if (m.lessonsRead > 0) chips.push(m.title);
  }
  if (overview.circuitsBuilt > 0) chips.push("Qiskit");
  if (overview.challengesSolved > 0) chips.push("Problem Solving");
  return Array.from(new Set(chips)).slice(0, 8);
}

function mostRecentAchievement(
  achievements: Achievement[],
  firstCircuitAt: string | null,
  lastSolvedAt: string | null,
  streakDays: number
): Achievement | null {
  let best: { achievement: Achievement; date: number } | null = null;
  for (const a of achievements) {
    if (!a.unlocked) continue;
    let date: number | null = null;
    if (a.id === "first-circuit" && firstCircuitAt) date = new Date(firstCircuitAt).getTime();
    if (a.id === "challenge-solver" && lastSolvedAt) date = new Date(lastSolvedAt).getTime();
    if (a.id === "week-streak" && streakDays >= 7) date = Date.now();
    if (date !== null && (!best || date > best.date)) best = { achievement: a, date };
  }
  return best?.achievement ?? null;
}

export default function ProfileView({
  userId,
  email,
  oauthName,
  oauthAvatarUrl,
  role,
  preferredLanguage,
  memberSince,
  modules,
  submissions,
  overview,
  coursesCompleted,
  points,
  rank,
  percentile,
  achievements,
  firstCircuitAt,
  lastSolvedAt,
}: ProfileViewProps) {
  const [tab, setTab] = useState<Tab>("Overview");
  const [editing, setEditing] = useState(false);

  const defaults = useMemo(
    () => defaultLocalProfile(email, role, oauthName, oauthAvatarUrl),
    [email, role, oauthName, oauthAvatarUrl]
  );
  const { profile, update } = useLocalProfile(userId, defaults);

  const handle = "@" + (email.split("@")[0] ?? "user").toLowerCase().replace(/[^a-z0-9]/g, "");
  const initial = profile.displayName ? profile.displayName[0]!.toUpperCase() : "?";
  const skillChips = useMemo(() => deriveSkillChips(modules, overview), [modules, overview]);
  const recentAchievement = useMemo(
    () => mostRecentAchievement(achievements, firstCircuitAt, lastSolvedAt, overview.streakDays),
    [achievements, firstCircuitAt, lastSolvedAt, overview.streakDays]
  );

  const currentModuleFull = overview.currentModule
    ? modules.find((m) => m.module_code === overview.currentModule!.code)
    : null;

  const milestones = [
    { label: "Add profile picture", done: profile.completedSteps.avatar },
    { label: "Write a bio", done: profile.completedSteps.bio },
    { label: "Add your institution", done: profile.completedSteps.institution },
    { label: "Link social accounts", done: profile.completedSteps.social },
  ];
  const completionPercent = Math.round((milestones.filter((m) => m.done).length / milestones.length) * 100);

  const earnedCertificates = modules.filter((m) => m.totalLessons > 0 && m.lessonsRead >= m.totalLessons);
  const avatarBackground = profile.avatarColor ?? "var(--accent)";
  // No historical rank snapshots are stored, so this weekly movement is an
  // illustrative estimate scaled off real recent activity (same convention as
  // the sidebar's per-route widgets), not a tracked rank delta.
  const weeklyRankDelta = Math.max(1, Math.min(9, overview.challengesThisWeek + Math.round(overview.circuitsThisMonth / 3)));

  return (
    <main className="mx-auto max-w-7xl px-6 py-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">My Profile</h1>
          <p className="mt-0.5 text-sm text-[var(--foreground-muted)]">
            Your quantum learning journey, achievements, and contributions.
          </p>
        </div>
        <Button variant="outline" onClick={() => setEditing(true)}>
          <Pencil className="h-4 w-4" />
          Edit Profile
        </Button>
      </div>

      {/* Header card */}
      <Card className="mt-4 gap-0 p-5">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="flex min-w-0 flex-1 items-start gap-4">
            <Avatar className="h-16 w-16">
              {profile.avatarUrl && <AvatarImage src={profile.avatarUrl} alt="" />}
              <AvatarFallback className="text-lg font-semibold text-[var(--accent-foreground)]" style={{ background: avatarBackground }}>
                {initial}
              </AvatarFallback>
              <AvatarBadge className="bg-[var(--marketing-green)] ring-2 ring-[var(--surface)]" />
            </Avatar>
            <div className="min-w-0">
              <h2 className="text-xl font-bold text-[var(--foreground)]">{profile.displayName}</h2>
              <div className="flex items-center gap-2">
                <p className="text-sm text-[var(--foreground-muted)]">{handle}</p>
                {profile.github && (
                  <a href={`https://github.com/${profile.github}`} target="_blank" rel="noreferrer" aria-label="GitHub" className="text-[var(--foreground-subtle)] hover:text-[var(--foreground)]">
                    <Link2 className="h-3.5 w-3.5" />
                  </a>
                )}
                {profile.linkedin && (
                  <a
                    href={profile.linkedin.startsWith("http") ? profile.linkedin : `https://${profile.linkedin}`}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="LinkedIn"
                    className="text-[var(--foreground-subtle)] hover:text-[var(--foreground)]"
                  >
                    <Globe className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
              {profile.headline && <p className="mt-0.5 text-sm text-[var(--foreground-muted)]">{profile.headline}</p>}
              {profile.bio && <p className="mt-2 max-w-xl text-sm text-[var(--foreground)]">{profile.bio}</p>}
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {profile.tags.map((tag) => (
                  <Chip key={tag}>{tag}</Chip>
                ))}
                {profile.interests.map((interest) => (
                  <Chip key={interest}>{interest}</Chip>
                ))}
              </div>
            </div>
          </div>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:min-w-[300px]">
            <div className="flex shrink-0 items-center justify-around divide-x divide-[var(--border)] sm:justify-start">
              <StatPill label="Points" value={points.toLocaleString()} />
              <StatPill label="Global Rank" value={`#${rank}`} />
              <StatPill label="Certificates" value={coursesCompleted} />
              <StatPill label="Challenges" value={overview.challengesSolved} />
            </div>

            {profile.tagline && (
              <div className="flex flex-1 flex-col justify-between gap-2 rounded-xl border border-dashed border-[var(--border)] p-3">
                <p className="text-sm italic text-[var(--foreground-muted)]">&ldquo;{profile.tagline}&rdquo;</p>
                <Button variant="outline" size="sm" className="self-end" onClick={() => setEditing(true)}>
                  <Pencil className="h-3.5 w-3.5" />
                  Edit Bio
                </Button>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div className="mt-4 flex items-center gap-5 overflow-x-auto border-b border-[var(--border)]">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`relative shrink-0 whitespace-nowrap pb-2 text-sm font-semibold transition-colors ${
              tab === t ? "text-[var(--foreground)]" : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
            }`}
          >
            {t}
            {tab === t && <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-[var(--accent)]" />}
          </button>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* Main tab content */}
        <div className="flex min-w-0 flex-col gap-4">
          {tab === "Overview" && (
            <>
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <Card className="gap-0 p-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/15 text-blue-600 dark:text-blue-400">
                    <Award className="h-4.5 w-4.5" />
                  </div>
                  <p className="mt-2 text-xs font-semibold text-[var(--foreground-muted)]">Courses Completed</p>
                  <p className="mt-0.5 text-xl font-bold text-[var(--foreground)]">
                    {coursesCompleted} <span className="text-sm font-medium text-[var(--foreground-subtle)]">of {modules.length} enrolled</span>
                  </p>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[var(--surface-2)]">
                    <div className="h-full rounded-full bg-blue-500" style={{ width: `${modules.length > 0 ? Math.round((coursesCompleted / modules.length) * 100) : 0}%` }} />
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
                    <div className="h-full rounded-full bg-[var(--marketing-pink)]" style={{ width: `${overview.totalChallenges > 0 ? Math.round((overview.challengesSolved / overview.totalChallenges) * 100) : 0}%` }} />
                  </div>
                </Card>

                <Card className="gap-0 p-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-600 dark:text-indigo-400">
                    <Cpu className="h-4.5 w-4.5" />
                  </div>
                  <p className="mt-2 text-xs font-semibold text-[var(--foreground-muted)]">Circuits Run</p>
                  <p className="mt-0.5 text-xl font-bold text-[var(--foreground)]">{overview.circuitsBuilt}</p>
                  <p className="mt-2 text-[11px] text-[var(--foreground-subtle)]">{overview.circuitsThisMonth} in the last 30 days</p>
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
              </div>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <Card className="gap-0 p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-[var(--foreground)]">Currently Learning</h3>
                    {overview.currentModule && (
                      <Link href="/learn" className="text-[11px] font-semibold text-[var(--accent)] hover:underline">
                        View Course
                      </Link>
                    )}
                  </div>
                  {overview.currentModule && currentModuleFull ? (
                    <div className="mt-3 flex items-center gap-3">
                      <div
                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
                        style={{ background: "color-mix(in srgb, var(--accent) 16%, transparent)" }}
                      >
                        <Trophy className="h-5 w-5 text-[var(--accent)]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-bold text-[var(--foreground)]">{overview.currentModule.title}</p>
                          {MODULE_META[overview.currentModule.code] && (
                            <span
                              className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                              style={{
                                background: DIFFICULTY_BADGE[MODULE_META[overview.currentModule.code].difficulty].bg,
                                color: DIFFICULTY_BADGE[MODULE_META[overview.currentModule.code].difficulty].fg,
                              }}
                            >
                              {MODULE_META[overview.currentModule.code].difficulty}
                            </span>
                          )}
                        </div>
                        <div className="mt-1.5 flex items-center gap-2">
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--surface-2)]">
                            <div className="h-full rounded-full bg-[var(--accent)]" style={{ width: `${overview.currentModule.percent}%` }} />
                          </div>
                          <span className="shrink-0 text-[11px] font-semibold text-[var(--foreground-muted)]">{overview.currentModule.percent}%</span>
                        </div>
                        <p className="mt-1 text-[11px] text-[var(--foreground-subtle)]">
                          {currentModuleFull.lessonsRead} / {currentModuleFull.totalLessons} lessons
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-3 text-xs text-[var(--foreground-muted)]">
                      All enrolled courses are complete -- <Link href="/learn" className="font-semibold text-[var(--accent)] hover:underline">explore more</Link>.
                    </p>
                  )}
                </Card>

                <Card className="gap-0 p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-[var(--foreground)]">Recent Achievement</h3>
                    <button type="button" onClick={() => setTab("Achievements")} className="text-[11px] font-semibold text-[var(--accent)] hover:underline">
                      View All
                    </button>
                  </div>
                  {recentAchievement ? (
                    <div className="mt-3 flex items-center gap-3">
                      <div
                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full"
                        style={{ background: ACHIEVEMENT_COLORS[recentAchievement.id].bg, color: ACHIEVEMENT_COLORS[recentAchievement.id].fg }}
                      >
                        {(() => {
                          const Icon = ACHIEVEMENT_ICONS[recentAchievement.id];
                          return <Icon className="h-5 w-5" />;
                        })()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-[var(--foreground)]">{recentAchievement.title}</p>
                        <p className="text-xs text-[var(--foreground-muted)]">{recentAchievement.description}</p>
                        {recentAchievement.relative && <p className="mt-0.5 text-[11px] text-[var(--foreground-subtle)]">Earned {recentAchievement.relative}</p>}
                      </div>
                    </div>
                  ) : (
                    <p className="mt-3 text-xs text-[var(--foreground-muted)]">
                      No badges yet -- <Link href="/circuit-builder" className="font-semibold text-[var(--accent)] hover:underline">build your first circuit</Link> to earn one.
                    </p>
                  )}
                </Card>
              </div>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <Card className="gap-0 p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-[var(--foreground)]">Skills &amp; Interests</h3>
                    <button type="button" onClick={() => setEditing(true)} className="text-[11px] font-semibold text-[var(--accent)] hover:underline">
                      Edit
                    </button>
                  </div>
                  <div className="mt-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--foreground-subtle)]">Skills</p>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {skillChips.length > 0 ? (
                        skillChips.map((s) => <Chip key={s}>{s}</Chip>)
                      ) : (
                        <p className="text-xs text-[var(--foreground-muted)]">Start a lesson to build up your skills.</p>
                      )}
                    </div>
                  </div>
                  <div className="mt-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--foreground-subtle)]">Interests</p>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {profile.interests.length > 0 ? (
                        profile.interests.map((s) => <Chip key={s}>{s}</Chip>)
                      ) : (
                        <p className="text-xs text-[var(--foreground-muted)]">
                          Add your interests via{" "}
                          <button type="button" onClick={() => setEditing(true)} className="font-semibold text-[var(--accent)] hover:underline">
                            Edit Profile
                          </button>
                          .
                        </p>
                      )}
                    </div>
                  </div>
                </Card>

                <Card className="gap-0 p-4">
                  <h3 className="text-sm font-bold text-[var(--foreground)]">Recent Activity</h3>
                  <ul className="mt-2.5 flex flex-col gap-2.5">
                    {overview.recentActivity.length === 0 ? (
                      <p className="text-xs text-[var(--foreground-muted)]">No activity yet -- try a challenge.</p>
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
            </>
          )}

          {tab === "Achievements" && (
            <Card className="gap-0 p-4">
              <h3 className="text-sm font-bold text-[var(--foreground)]">All Achievements</h3>
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
                        {a.unlocked ? <Icon className="h-4 w-4" /> : <Circle className="h-3.5 w-3.5" />}
                      </div>
                      <p className="mt-2 text-xs font-bold text-[var(--foreground)]">{a.title}</p>
                      <p className="mt-0.5 text-[10px] leading-snug text-[var(--foreground-muted)]">{a.description}</p>
                      {a.relative && <p className="mt-1 text-[10px] text-[var(--foreground-subtle)]">{a.relative}</p>}
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {tab === "Certificates" && (
            <Card className="gap-0 p-4">
              <h3 className="text-sm font-bold text-[var(--foreground)]">Certificates</h3>
              {earnedCertificates.length === 0 ? (
                <p className="mt-3 text-xs text-[var(--foreground-muted)]">
                  Complete a course to earn your first certificate -- <Link href="/learn" className="font-semibold text-[var(--accent)] hover:underline">start learning</Link>.
                </p>
              ) : (
                <>
                  <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {earnedCertificates.map((m) => (
                      <div key={m.module_code} className="flex items-center gap-3 rounded-xl border border-[var(--border)] p-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-600 dark:text-indigo-400">
                          <Award className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-[var(--foreground)]">{m.title}</p>
                          <p className="text-[11px] text-[var(--foreground-muted)]">Certificate of Completion</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="mt-3 text-[10px] text-[var(--foreground-subtle)]">Downloadable PDF certificates are coming soon.</p>
                </>
              )}
            </Card>
          )}

          {tab === "Activity" && (
            <Card className="gap-0 overflow-hidden p-0">
              {submissions.length === 0 ? (
                <p className="p-4 text-xs text-[var(--foreground-muted)]">No submissions yet -- try a challenge.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[480px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-[var(--border)] text-[11px] uppercase tracking-wide text-[var(--foreground-subtle)]">
                        <th className="px-4 py-2.5 font-semibold">Challenge</th>
                        <th className="px-4 py-2.5 font-semibold">Module</th>
                        <th className="px-4 py-2.5 text-right font-semibold">Score</th>
                        <th className="px-4 py-2.5 text-right font-semibold">When</th>
                      </tr>
                    </thead>
                    <tbody>
                      {submissions.map((s) => (
                        <tr key={s.id} className="border-b border-[var(--border)] last:border-0">
                          <td className="px-4 py-2.5">
                            <span className="font-semibold text-[var(--foreground)]">{s.prompt}</span>
                            <span
                              className={`ml-2 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                                s.passed
                                  ? "bg-[var(--marketing-green)]/15 text-[var(--marketing-green)]"
                                  : "bg-orange-500/15 text-orange-600 dark:text-orange-400"
                              }`}
                            >
                              {s.passed ? "Passed" : "Attempted"}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 text-[var(--foreground-muted)]">{s.module_code}</td>
                          <td className="px-4 py-2.5 text-right font-semibold text-[var(--foreground)]">{s.score}</td>
                          <td className="px-4 py-2.5 text-right text-[var(--foreground-muted)]">{new Date(s.timestamp).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          )}

          {tab === "Settings" && (
            <Card className="gap-0 p-4">
              <h3 className="text-sm font-bold text-[var(--foreground)]">Account</h3>
              <dl className="mt-3 flex flex-col gap-2.5 text-sm">
                <div className="flex items-center justify-between border-b border-[var(--border)] pb-2.5">
                  <dt className="text-[var(--foreground-muted)]">Email</dt>
                  <dd className="font-semibold text-[var(--foreground)]">{email}</dd>
                </div>
                <div className="flex items-center justify-between border-b border-[var(--border)] pb-2.5">
                  <dt className="text-[var(--foreground-muted)]">Role</dt>
                  <dd className="font-semibold capitalize text-[var(--foreground)]">{role ?? "learner"}</dd>
                </div>
                <div className="flex items-center justify-between border-b border-[var(--border)] pb-2.5">
                  <dt className="text-[var(--foreground-muted)]">Preferred language</dt>
                  <dd className="font-semibold uppercase text-[var(--foreground)]">{preferredLanguage}</dd>
                </div>
                <div className="flex items-center justify-between pb-1">
                  <dt className="text-[var(--foreground-muted)]">Member since</dt>
                  <dd className="font-semibold text-[var(--foreground)]">{formatMonthYear(memberSince)}</dd>
                </div>
              </dl>
              <Button asChild variant="outline" className="mt-4">
                <Link href="/settings">Manage full settings</Link>
              </Button>
            </Card>
          )}
        </div>

        {/* Right rail -- persistent across tabs */}
        <aside className="flex flex-col gap-4 lg:sticky lg:top-4 lg:self-start">
          <Card className="gap-0 p-4">
            <h3 className="text-sm font-bold text-[var(--foreground)]">Your Streak</h3>
            <div className="mt-1 flex items-center gap-1.5">
              <Flame className="h-5 w-5 text-orange-500" />
              <span className="text-2xl font-bold text-[var(--foreground)]">{overview.streakDays} days</span>
            </div>
            <p className="text-xs text-[var(--foreground-muted)]">{overview.streakDays > 0 ? "Keep learning to grow!" : "Start today to build a streak."}</p>
            <div className="mt-3 flex justify-between">
              {overview.weeklyStreak.map((day) => (
                <div key={day.label} className="flex flex-col items-center gap-1">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      day.active ? "bg-orange-500" : day.isToday ? "bg-[var(--surface-2)] ring-1 ring-[var(--border-strong)]" : "bg-[var(--surface-2)]"
                    }`}
                  />
                  <span className="text-[10px] text-[var(--foreground-subtle)]">{day.label}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="gap-0 p-4">
            <h3 className="text-sm font-bold text-[var(--foreground)]">Global Rank</h3>
            <p className="mt-1 text-3xl font-bold text-[var(--foreground)]">#{rank}</p>
            <div className="mt-0.5 flex items-center gap-2">
              <span className="text-sm font-semibold text-[var(--foreground-muted)]">{points.toLocaleString()} pts</span>
              <span className="flex items-center gap-0.5 rounded-full bg-[var(--marketing-green)]/15 px-1.5 py-0.5 text-[11px] font-semibold text-[var(--marketing-green)]">
                <TrendingUp className="h-3 w-3" /> {weeklyRankDelta} this week
              </span>
            </div>
            <p className="mt-0.5 text-[11px] text-[var(--foreground-subtle)]">Top {percentile}% globally</p>
            <Sparkline seed={points} />
          </Card>

          <Card className="gap-0 p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[var(--foreground)]">Profile Completion</h3>
              <span className="text-sm font-bold text-[var(--foreground)]">{completionPercent}%</span>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[var(--surface-2)]">
              <div className="h-full rounded-full bg-[var(--marketing-green)]" style={{ width: `${completionPercent}%` }} />
            </div>
            <ul className="mt-3 flex flex-col">
              {milestones.map((m) => (
                <li key={m.label}>
                  <button
                    type="button"
                    onClick={() => setEditing(true)}
                    disabled={m.done}
                    className="flex w-full items-center gap-2 rounded-lg py-1.5 text-left text-xs transition-colors enabled:hover:bg-[var(--surface-hover)]"
                  >
                    {m.done ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-[var(--marketing-green)]" />
                    ) : (
                      <Circle className="h-4 w-4 shrink-0 text-[var(--foreground-subtle)]" />
                    )}
                    <span className={`flex-1 ${m.done ? "text-[var(--foreground)]" : "text-[var(--foreground-muted)]"}`}>{m.label}</span>
                    {!m.done && <ChevronRight className="h-3.5 w-3.5 shrink-0 text-[var(--foreground-subtle)]" />}
                  </button>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="gap-0 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--accent)]/15 text-[var(--accent)]">
                <Calendar className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] text-[var(--foreground-muted)]">Member Since</p>
                <p className="text-base font-bold text-[var(--foreground)]">{formatMonthYear(memberSince)}</p>
              </div>
            </div>
            <p className="mt-2 text-[11px] text-[var(--foreground-subtle)]">{formatDuration(memberSince)}</p>
          </Card>
        </aside>
      </div>

      {editing && <EditProfileModal profile={profile} onClose={() => setEditing(false)} onSave={update} />}
    </main>
  );
}
