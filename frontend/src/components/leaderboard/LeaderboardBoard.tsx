"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Award, ChevronRight, Crown, Sparkles, Target, TrendingUp, Trophy } from "lucide-react";
import {
  COMMUNITY_TOTAL_COUNTRIES,
  COMMUNITY_TOTAL_MEMBERS,
  rankWithYou,
  type RankedMember,
} from "@/lib/community/sampleCommunity";
import { avatarColor } from "@/lib/community/avatarColor";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const TABS = ["Global", "Monthly", "This Week", "By Institution", "By Country"] as const;
type Tab = (typeof TABS)[number];

const PERIODS = ["This Week", "This Month", "All Time"] as const;
const PERIOD_LABELS: Record<string, string> = { "This Week": "This Week", Monthly: "This Month", "All Time": "All Time" };

const TOP_INSTITUTIONS = [
  { name: "IISc Bangalore", points: 12430 },
  { name: "MIT", points: 10120 },
  { name: "IIT Delhi", points: 9860 },
  { name: "Stanford", points: 8940 },
  { name: "University of Tokyo", points: 7620 },
];

const TOP_COUNTRIES = [
  { name: "India", points: 28420 },
  { name: "USA", points: 24180 },
  { name: "Germany", points: 12560 },
  { name: "Canada", points: 8940 },
  { name: "UK", points: 7320 },
];

const RECENT_ACHIEVEMENTS = [
  { name: "Arjun Mehta", action: 'completed "Grover\'s Algorithm"', relative: "2 hours ago", icon: Trophy, color: "#f6b93b" },
  { name: "Priya Sharma", action: "solved 10 challenges", relative: "4 hours ago", icon: Target, color: "var(--marketing-green)" },
  { name: "Liam Chen", action: 'earned "Quantum Explorer" badge', relative: "6 hours ago", icon: Award, color: "#8e6ff7" },
];

function weightFor(tab: Tab, member: RankedMember): number {
  if (tab === "This Week") return member.circuits * 8 + member.challenges * 5;
  if (tab === "Monthly") return member.challenges * 30 + member.circuits * 4;
  return member.points;
}

function Sparkline({ points }: { points: number }) {
  const values = [0.38, 0.48, 0.44, 0.58, 0.68, 0.62, 0.82, 1].map((f) => Math.round(f * Math.max(points, 100)));
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

export default function LeaderboardBoard({ you, loggedIn }: { you: { points: number; challenges: number; circuits: number }; loggedIn: boolean }) {
  const [tab, setTab] = useState<Tab>("Global");

  const ranked = useMemo(() => rankWithYou(you), [you]);
  const podium = useMemo(() => [...ranked].sort((a, b) => b.points - a.points).slice(0, 3), [ranked]);
  const yourRank = ranked.findIndex((m) => m.isYou) + 1;
  const percentile = Math.max(1, Math.round((yourRank / ranked.length) * 100));

  const rows = useMemo(() => {
    if (tab === "By Institution" || tab === "By Country") return ranked;
    return [...ranked].sort((a, b) => weightFor(tab, b) - weightFor(tab, a));
  }, [ranked, tab]);

  const grouped = useMemo(() => {
    if (tab !== "By Institution" && tab !== "By Country") return null;
    const key = tab === "By Institution" ? "institution" : "country";
    const map = new Map<string, { name: string; points: number; members: number; hasYou: boolean }>();
    for (const m of ranked) {
      const k = m[key];
      const entry = map.get(k) ?? { name: k, points: 0, members: 0, hasYou: false };
      entry.points += m.points;
      entry.members += 1;
      entry.hasYou = entry.hasYou || m.isYou;
      map.set(k, entry);
    }
    return Array.from(map.values()).sort((a, b) => b.points - a.points);
  }, [ranked, tab]);

  return (
    <main className="mx-auto max-w-7xl px-6 py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">Leaderboard</h1>
          <p className="mt-0.5 text-sm text-[var(--foreground-muted)]">
            Celebrate progress, compete, and get inspired by the quantum community.
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="rounded-lg">
              {PERIOD_LABELS[tab === "This Week" || tab === "Monthly" ? tab : "All Time"]}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuRadioGroup
              value={tab === "This Week" || tab === "Monthly" ? tab : "All Time"}
              onValueChange={(v) => setTab(v === "All Time" ? "Global" : (v as Tab))}
            >
              {PERIODS.map((p) => (
                <DropdownMenuRadioItem key={p} value={p === "This Month" ? "Monthly" : p}>
                  {p}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex min-w-0 flex-col gap-4">
          {/* Podium */}
          <Card className="relative gap-0 overflow-hidden p-6">
            <Sparkles className="pointer-events-none absolute left-10 top-6 h-3.5 w-3.5 text-[var(--accent)] opacity-60" />
            <Sparkles className="pointer-events-none absolute right-14 top-10 h-3 w-3 text-[var(--marketing-pink)] opacity-60" />
            <Sparkles className="pointer-events-none absolute left-1/3 bottom-10 h-2.5 w-2.5 text-[var(--marketing-green)] opacity-60" />
            <div className="flex items-end justify-center gap-6 sm:gap-10">
              {[podium[1], podium[0], podium[2]].map((member, i) =>
                member ? (
                  <div key={member.name} className="flex flex-col items-center">
                    <div className="relative">
                      {i === 1 && <Crown className="absolute -top-5 left-1/2 h-5 w-5 -translate-x-1/2 text-[#f6b93b]" />}
                      <span
                        className={`absolute -top-1.5 -right-1.5 flex items-center justify-center rounded-full text-[10px] font-bold text-white ${
                          i === 1 ? "h-6 w-6 bg-[#f6b93b]" : "h-5 w-5 bg-[var(--foreground-muted)]"
                        }`}
                      >
                        {i === 1 ? 1 : i === 0 ? 2 : 3}
                      </span>
                      <Avatar size={i === 1 ? "lg" : "default"} className={i === 1 ? "h-[72px] w-[72px]" : "h-14 w-14"}>
                        <AvatarFallback style={{ background: avatarColor(member.name), color: "#fff" }} className="text-base font-semibold">
                          {member.name[0]}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <p className={`mt-2 font-bold text-[var(--foreground)] ${i === 1 ? "text-base" : "text-sm"}`}>{member.name}</p>
                    <p className="text-[11px] text-[var(--foreground-muted)]">{member.institution}</p>
                    <p className={`font-bold text-[var(--foreground)] ${i === 1 ? "text-lg" : "text-sm"}`}>{member.points.toLocaleString()} pts</p>
                    <div
                      className={`mt-2 w-20 rounded-t-lg ${i === 1 ? "h-16 bg-[#f6b93b]/25" : i === 0 ? "h-10 bg-[var(--surface-2)]" : "h-6 bg-[var(--surface-2)]"}`}
                    />
                  </div>
                ) : null
              )}
            </div>
          </Card>

          {/* Tabs */}
          <div className="flex items-center gap-5 overflow-x-auto border-b border-[var(--border)]">
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

          {/* Table */}
          <Card className="gap-0 overflow-hidden p-0">
            {grouped ? (
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-[11px] uppercase tracking-wide text-[var(--foreground-subtle)]">
                    <th className="px-4 py-2.5 font-semibold">#</th>
                    <th className="px-4 py-2.5 font-semibold">{tab === "By Institution" ? "Institution" : "Country"}</th>
                    <th className="px-4 py-2.5 font-semibold">Members</th>
                    <th className="px-4 py-2.5 text-right font-semibold">Total Points</th>
                  </tr>
                </thead>
                <tbody>
                  {grouped.map((g, i) => (
                    <tr key={g.name} className={`border-b border-[var(--border)] last:border-0 ${g.hasYou ? "bg-[var(--accent)]/10" : ""}`}>
                      <td className="px-4 py-2.5">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--surface-2)] text-[11px] font-bold text-[var(--foreground-muted)]">
                          {i + 1}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 font-semibold text-[var(--foreground)]">{g.name}</td>
                      <td className="px-4 py-2.5 text-[var(--foreground-muted)]">{g.members}</td>
                      <td className="px-4 py-2.5 text-right font-semibold text-[var(--foreground)]">{g.points.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)] text-[11px] uppercase tracking-wide text-[var(--foreground-subtle)]">
                      <th className="px-4 py-2.5 font-semibold">#</th>
                      <th className="px-4 py-2.5 font-semibold">User</th>
                      <th className="hidden px-4 py-2.5 font-semibold sm:table-cell">Institution</th>
                      <th className="px-4 py-2.5 text-right font-semibold">Points</th>
                      <th className="hidden px-4 py-2.5 text-right font-semibold md:table-cell">Challenges</th>
                      <th className="hidden px-4 py-2.5 text-right font-semibold md:table-cell">Circuits</th>
                      <th className="hidden px-4 py-2.5 font-semibold lg:table-cell">Badges</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((m, i) => (
                      <tr key={m.name} className={`border-b border-[var(--border)] last:border-0 ${m.isYou ? "bg-[var(--accent)]/10" : ""}`}>
                        <td className="px-4 py-2.5">
                          <span
                            className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold ${
                              i === 0
                                ? "bg-[#f6b93b] text-white"
                                : m.isYou
                                  ? "bg-[var(--accent)] text-[var(--accent-foreground)]"
                                  : "bg-[var(--surface-2)] text-[var(--foreground-muted)]"
                            }`}
                          >
                            {i + 1}
                          </span>
                        </td>
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-2.5">
                            <Avatar size="sm">
                              <AvatarFallback style={{ background: avatarColor(m.name), color: "#fff" }} className="text-[10px] font-semibold">
                                {m.name[0]}
                              </AvatarFallback>
                            </Avatar>
                            <span className={`font-semibold ${m.isYou ? "text-[var(--accent)]" : "text-[var(--foreground)]"}`}>{m.name}</span>
                          </div>
                        </td>
                        <td className="hidden px-4 py-2.5 text-[var(--foreground-muted)] sm:table-cell">{m.institution}</td>
                        <td className="px-4 py-2.5 text-right font-semibold text-[var(--foreground)]">{m.points.toLocaleString()}</td>
                        <td className="hidden px-4 py-2.5 text-right text-[var(--foreground-muted)] md:table-cell">{m.challenges}</td>
                        <td className="hidden px-4 py-2.5 text-right text-[var(--foreground-muted)] md:table-cell">{m.circuits}</td>
                        <td className="hidden px-4 py-2.5 lg:table-cell">
                          <div className="flex items-center gap-1">
                            {m.badgeColors.map((c, bi) => (
                              <span key={bi} className="h-2.5 w-2.5 rounded-full" style={{ background: c }} />
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <aside className="flex flex-col gap-4 lg:sticky lg:top-4">
          <Card className="gap-0 p-4">
            <h3 className="text-sm font-bold text-[var(--foreground)]">Your Rank</h3>
            {loggedIn ? (
              <>
                <p className="mt-1 text-3xl font-bold text-[var(--foreground)]">#{yourRank}</p>
                <div className="mt-0.5 flex items-center gap-2">
                  <span className="text-sm font-semibold text-[var(--foreground-muted)]">{you.points.toLocaleString()} pts</span>
                  <span className="flex items-center gap-0.5 text-[11px] font-semibold text-[var(--marketing-green)]">
                    <TrendingUp className="h-3 w-3" /> Top {percentile}%
                  </span>
                </div>
                <Sparkline points={you.points} />
                <div className="mt-2 rounded-lg bg-[var(--accent)]/10 px-3 py-2 text-xs font-semibold text-[var(--accent)]">
                  Keep going! You&apos;re in the top {percentile}%
                </div>
              </>
            ) : (
              <p className="mt-2 text-xs text-[var(--foreground-muted)]">Log in to see your rank.</p>
            )}
          </Card>

          <Card className="gap-0 p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[var(--foreground)]">Top Institutions</h3>
              <span className="text-[11px] font-semibold text-[var(--accent)]">View All</span>
            </div>
            <ul className="mt-2 flex flex-col gap-0.5">
              {TOP_INSTITUTIONS.map((entry, i) => (
                <li key={entry.name} className="flex items-center justify-between rounded-lg px-1 py-1.5">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--surface-2)] text-[10px] font-bold text-[var(--foreground-muted)]">
                      {i + 1}
                    </span>
                    <span className="truncate text-xs text-[var(--foreground)]">{entry.name}</span>
                  </div>
                  <span className="shrink-0 text-xs font-semibold text-[var(--foreground-muted)]">{entry.points.toLocaleString()}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="gap-0 p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[var(--foreground)]">Top Countries</h3>
              <span className="text-[11px] font-semibold text-[var(--accent)]">View All</span>
            </div>
            <ul className="mt-2 flex flex-col gap-0.5">
              {TOP_COUNTRIES.map((entry, i) => (
                <li key={entry.name} className="flex items-center justify-between rounded-lg px-1 py-1.5">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--surface-2)] text-[10px] font-bold text-[var(--foreground-muted)]">
                      {i + 1}
                    </span>
                    <span className="truncate text-xs text-[var(--foreground)]">{entry.name}</span>
                  </div>
                  <span className="shrink-0 text-xs font-semibold text-[var(--foreground-muted)]">{entry.points.toLocaleString()}</span>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-[10px] text-[var(--foreground-subtle)]">
              {COMMUNITY_TOTAL_MEMBERS.toLocaleString()} members across {COMMUNITY_TOTAL_COUNTRIES} countries
            </p>
          </Card>

          <Card className="gap-0 p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[var(--foreground)]">Recent Achievements</h3>
              <Link href="/community" className="text-[11px] font-semibold text-[var(--accent)] hover:underline">
                View All
              </Link>
            </div>
            <ul className="mt-2 flex flex-col gap-2.5">
              {RECENT_ACHIEVEMENTS.map((item) => (
                <li key={`${item.name}-${item.relative}`} className="flex items-start gap-2.5">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full" style={{ background: `${item.color}26`, color: item.color }}>
                    <item.icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-[var(--foreground)]">
                      <span className="font-semibold">{item.name}</span> {item.action}
                    </p>
                    <p className="text-[10px] text-[var(--foreground-muted)]">{item.relative}</p>
                  </div>
                  <ChevronRight className="ml-auto h-3.5 w-3.5 shrink-0 text-[var(--foreground-subtle)]" />
                </li>
              ))}
            </ul>
          </Card>
        </aside>
      </div>
    </main>
  );
}
