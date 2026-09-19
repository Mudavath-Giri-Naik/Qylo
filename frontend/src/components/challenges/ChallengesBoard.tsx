"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Calendar,
  ChevronRight,
  Flame,
  Grid3x3,
  List,
  Search,
  Star,
  TrendingUp,
  Trophy,
} from "lucide-react";
import type { StreakDay } from "@/lib/dashboard/queries";
import { MODULES, moduleTitle } from "@/lib/learn/modules";
import { normalizeDifficulty, pointsFor } from "@/lib/challenges/presentation";
import type { Challenge } from "@/lib/challenges/types";
import ChallengeCard from "@/components/challenges/ChallengeCard";
import ChallengeModal from "@/components/challenges/ChallengeModal";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const DIFFICULTY_TABS = ["All Challenges", "Beginner", "Intermediate", "Advanced", "Featured"] as const;
type DifficultyTab = (typeof DIFFICULTY_TABS)[number];

const SORTS = [
  { value: "latest", label: "Latest" },
  { value: "oldest", label: "Oldest" },
  { value: "points", label: "Most Points" },
] as const;
type SortValue = (typeof SORTS)[number]["value"];

const UPCOMING = [
  { title: "Quantum ML Challenge", subtitle: "Coming soon" },
  { title: "Qiskit Global Hackathon", subtitle: "Coming soon" },
  { title: "Real Hardware Challenge", subtitle: "Coming soon" },
];

export interface ChallengerEntry {
  name: string;
  points: number;
}

export default function ChallengesBoard({
  challenges,
  passedIds,
  streakDays,
  weeklyStreak,
  challengesSolved,
  totalChallenges,
  yourPoints,
  pointsThisWeek,
  rank,
  totalRanked,
  topChallengers,
}: {
  challenges: Challenge[];
  passedIds: string[];
  streakDays: number;
  weeklyStreak: StreakDay[];
  challengesSolved: number;
  totalChallenges: number;
  yourPoints: number;
  pointsThisWeek: number;
  rank: number;
  totalRanked: number;
  topChallengers: ChallengerEntry[];
}) {
  const passed = useMemo(() => new Set(passedIds), [passedIds]);

  const [difficultyTab, setDifficultyTab] = useState<DifficultyTab>("All Challenges");
  const [topic, setTopic] = useState<string>("All");
  const [sortBy, setSortBy] = useState<SortValue>("latest");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Challenge | null>(null);

  const featuredIds = useMemo(() => {
    const seenModules = new Set<string>();
    const ids = new Set<string>();
    for (const c of challenges) {
      if (c.grading_rule.type === "circuit") {
        ids.add(c.id);
        continue;
      }
      if (!seenModules.has(c.module_code)) {
        seenModules.add(c.module_code);
        ids.add(c.id);
      }
    }
    return ids;
  }, [challenges]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    let list = challenges.filter((c) => {
      if (difficultyTab === "Featured" && !featuredIds.has(c.id)) return false;
      if (difficultyTab !== "All Challenges" && difficultyTab !== "Featured" && normalizeDifficulty(c.difficulty) !== difficultyTab) {
        return false;
      }
      if (topic !== "All" && c.module_code !== topic) return false;
      if (query && !c.prompt.toLowerCase().includes(query)) return false;
      return true;
    });

    list = [...list].sort((a, b) => {
      if (sortBy === "latest") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sortBy === "oldest") return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      return pointsFor(b) - pointsFor(a);
    });

    return list;
  }, [challenges, difficultyTab, featuredIds, topic, search, sortBy]);

  const percentile = Math.max(1, Math.round((rank / totalRanked) * 100));

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-6 py-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">Challenges</h1>
          <p className="mt-0.5 text-sm text-[var(--foreground-muted)]">
            Test your knowledge, solve real problems, and grow your quantum skills.
          </p>
        </div>
        <Link
          href="/my-progress"
          className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] px-3.5 py-1.5 text-xs font-semibold text-[var(--accent)] transition-colors hover:bg-[var(--surface-hover)]"
        >
          My Submissions <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Stat strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card className="gap-0 p-3.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/15 text-blue-600 dark:text-blue-400">
              <Trophy className="h-4.5 w-4.5" />
            </div>
            <div className="min-w-0">
              <p className="text-lg font-bold text-[var(--foreground)]">{challengesSolved}</p>
              <p className="truncate text-[11px] text-[var(--foreground-muted)]">Challenges Solved</p>
            </div>
          </div>
          <p className="mt-1.5 text-[10px] text-[var(--foreground-subtle)]">out of {totalChallenges} available</p>
        </Card>

        <Card className="gap-0 p-3.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--marketing-green)]/15 text-[var(--marketing-green)]">
              <TrendingUp className="h-4.5 w-4.5" />
            </div>
            <div className="min-w-0">
              <p className="text-lg font-bold text-[var(--foreground)]">#{rank}</p>
              <p className="truncate text-[11px] text-[var(--foreground-muted)]">Global Rank</p>
            </div>
          </div>
          <p className="mt-1.5 text-[10px] text-[var(--foreground-subtle)]">Top {percentile}% · out of {totalRanked}</p>
        </Card>

        <Card className="gap-0 p-3.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-500/15 text-orange-600 dark:text-orange-400">
              <Flame className="h-4.5 w-4.5" />
            </div>
            <div className="min-w-0">
              <p className="text-lg font-bold text-[var(--foreground)]">{streakDays}</p>
              <p className="truncate text-[11px] text-[var(--foreground-muted)]">Day Streak</p>
            </div>
          </div>
          <p className="mt-1.5 text-[10px] text-[var(--foreground-subtle)]">
            {streakDays > 0 ? "Keep it going!" : "Solve one today"}
          </p>
        </Card>

        <Card className="gap-0 p-3.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--marketing-pink)]/20 text-[var(--marketing-pink)]">
              <Star className="h-4.5 w-4.5" />
            </div>
            <div className="min-w-0">
              <p className="text-lg font-bold text-[var(--foreground)]">{yourPoints.toLocaleString()}</p>
              <p className="truncate text-[11px] text-[var(--foreground-muted)]">Total Points</p>
            </div>
          </div>
          <p className="mt-1.5 text-[10px] text-[var(--foreground-subtle)]">
            {pointsThisWeek > 0 ? `+${pointsThisWeek} this week` : "Solve a challenge to earn points"}
          </p>
        </Card>
      </div>

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
        {/* Main column */}
        <div className="flex min-w-0 flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-5 overflow-x-auto border-b border-[var(--border)]">
              {DIFFICULTY_TABS.map((tab) => {
                const active = difficultyTab === tab;
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setDifficultyTab(tab)}
                    className={`relative shrink-0 whitespace-nowrap pb-2 text-sm font-semibold transition-colors ${
                      active ? "text-[var(--foreground)]" : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
                    }`}
                  >
                    {tab}
                    {active && <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-[var(--accent)]" />}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="rounded-lg">
                    {topic === "All" ? "All Topics" : moduleTitle(MODULES.find((m) => m.code === topic)!, "en")}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuRadioGroup value={topic} onValueChange={setTopic}>
                    <DropdownMenuRadioItem value="All">All Topics</DropdownMenuRadioItem>
                    {MODULES.map((m) => (
                      <DropdownMenuRadioItem key={m.code} value={m.code}>
                        {moduleTitle(m, "en")}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="rounded-lg">
                    Sort by: {SORTS.find((s) => s.value === sortBy)?.label}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuRadioGroup value={sortBy} onValueChange={(v) => setSortBy(v as SortValue)}>
                    {SORTS.map((s) => (
                      <DropdownMenuRadioItem key={s.value} value={s.value}>
                        {s.label}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="relative w-full max-w-xs">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--foreground-subtle)]" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search challenges..."
                className="h-8 rounded-lg pl-8 text-xs"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-[var(--foreground-muted)]">
                {filtered.length} of {challenges.length} challenges
              </span>
              <div className="flex items-center gap-1 rounded-lg border border-[var(--border)] p-1">
                <Button variant={view === "grid" ? "secondary" : "ghost"} size="icon-sm" aria-pressed={view === "grid"} onClick={() => setView("grid")}>
                  <Grid3x3 className="h-3.5 w-3.5" />
                </Button>
                <Button variant={view === "list" ? "secondary" : "ghost"} size="icon-sm" aria-pressed={view === "list"} onClick={() => setView("list")}>
                  <List className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>

          {filtered.length === 0 ? (
            <p className="mt-16 text-center text-sm text-[var(--foreground-muted)]">No challenges match those filters.</p>
          ) : (
            <div className={view === "grid" ? "grid grid-cols-1 items-start gap-3 sm:grid-cols-2 xl:grid-cols-3" : "flex min-w-0 flex-col gap-2.5"}>
              {filtered.map((challenge) => (
                <ChallengeCard
                  key={challenge.id}
                  challenge={challenge}
                  passed={passed.has(challenge.id)}
                  compact={view === "list"}
                  onSolve={setSelected}
                />
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="flex flex-col gap-3 lg:sticky lg:top-4">
          <Card className="gap-0 p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[var(--foreground)]">Your Streak</h3>
              <Link href="/my-progress" className="text-[11px] font-semibold text-[var(--accent)] hover:underline">
                View Calendar
              </Link>
            </div>
            <div className="mt-3 flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-orange-500/15 text-orange-500">
                <Flame className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xl font-bold text-[var(--foreground)]">
                  {streakDays} day{streakDays === 1 ? "" : "s"}
                </p>
                <p className="text-[11px] text-[var(--foreground-muted)]">
                  {streakDays > 0 ? "Solve a challenge every day!" : "Start your streak today!"}
                </p>
              </div>
            </div>
            <div className="mt-3 flex justify-between">
              {weeklyStreak.map((day) => (
                <div key={day.label} className="flex flex-col items-center gap-1">
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full ${
                      day.active ? "bg-[var(--accent)]" : "border border-[var(--border-strong)]"
                    }`}
                  />
                  <span className={`text-[10px] ${day.isToday ? "font-bold text-[var(--foreground)]" : "text-[var(--foreground-muted)]"}`}>
                    {day.label}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="gap-0 p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[var(--foreground)]">Top Challengers</h3>
              <Link href="/leaderboard" className="text-[11px] font-semibold text-[var(--accent)] hover:underline">
                View All
              </Link>
            </div>
            <ul className="mt-2 flex flex-col gap-0.5">
              {topChallengers.map((entry, i) => (
                <li key={entry.name} className="flex items-center justify-between rounded-lg px-1 py-1.5">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--surface-2)] text-[10px] font-bold text-[var(--foreground-muted)]">
                      {i + 1}
                    </span>
                    <Avatar size="sm">
                      <AvatarFallback className="bg-[var(--accent)]/15 text-[10px] font-semibold text-[var(--accent)]">
                        {entry.name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <span className="truncate text-xs text-[var(--foreground)]">{entry.name}</span>
                  </div>
                  <span className="shrink-0 text-xs font-semibold text-[var(--foreground-muted)]">{entry.points.toLocaleString()}</span>
                </li>
              ))}
              <li className="flex items-center justify-between rounded-lg bg-[var(--accent)]/10 px-1 py-1.5">
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-[10px] font-bold text-[var(--accent-foreground)]">
                    {rank}
                  </span>
                  <span className="text-xs font-semibold text-[var(--foreground)]">You</span>
                </div>
                <span className="text-xs font-semibold text-[var(--accent)]">{yourPoints.toLocaleString()}</span>
              </li>
            </ul>
          </Card>

          <Card className="gap-0 p-4">
            <h3 className="text-sm font-bold text-[var(--foreground)]">Upcoming Challenges</h3>
            <ul className="mt-2 flex flex-col gap-2">
              {UPCOMING.map((item) => (
                <li key={item.title} className="flex items-center gap-2.5 rounded-xl border border-[var(--border)] p-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--accent)]/10 text-[var(--accent)]">
                    <Calendar className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-[var(--foreground)]">{item.title}</p>
                    <p className="text-[10px] text-[var(--foreground-muted)]">{item.subtitle}</p>
                  </div>
                  <ChevronRight className="ml-auto h-3.5 w-3.5 shrink-0 text-[var(--foreground-muted)]" />
                </li>
              ))}
            </ul>
          </Card>
        </aside>
      </div>

      {selected && <ChallengeModal challenge={selected} onClose={() => setSelected(null)} />}
    </main>
  );
}
