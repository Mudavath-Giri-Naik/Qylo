"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Clock, Grid3x3, List } from "lucide-react";
import { DIFFICULTY_BADGE, MODULE_META, THEME_STYLES, type Difficulty } from "@/lib/learn/moduleMeta";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export interface CourseCardData {
  code: string;
  title: string;
  description: string;
  lessons: number;
  hours: number;
  percent: number;
  href: string;
}

export default function CourseGrid({ courses }: { courses: CourseCardData[] }) {
  const [levelFilter, setLevelFilter] = useState<Difficulty | "All">("All");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [view, setView] = useState<"grid" | "list">("grid");

  const categories = useMemo(() => Array.from(new Set(courses.map((c) => MODULE_META[c.code].category))), [courses]);

  const filtered = courses.filter((c) => {
    const meta = MODULE_META[c.code];
    return (levelFilter === "All" || meta.difficulty === levelFilter) && (categoryFilter === "All" || meta.category === categoryFilter);
  });

  return (
    <div>
      <div className="mt-6 flex flex-wrap items-center justify-end gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="rounded-lg">
              {levelFilter === "All" ? "All Levels" : levelFilter}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuRadioGroup value={levelFilter} onValueChange={(v) => setLevelFilter(v as Difficulty | "All")}>
              <DropdownMenuRadioItem value="All">All Levels</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="Beginner">Beginner</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="Intermediate">Intermediate</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="Advanced">Advanced</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="rounded-lg">
              {categoryFilter === "All" ? "All Categories" : categoryFilter}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuRadioGroup value={categoryFilter} onValueChange={setCategoryFilter}>
              <DropdownMenuRadioItem value="All">All Categories</DropdownMenuRadioItem>
              {categories.map((cat) => (
                <DropdownMenuRadioItem key={cat} value={cat}>
                  {cat}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex items-center gap-1 rounded-lg border border-[var(--border)] p-1">
          <Button
            variant={view === "grid" ? "secondary" : "ghost"}
            size="icon"
            aria-pressed={view === "grid"}
            onClick={() => setView("grid")}
          >
            <Grid3x3 className="h-4 w-4" />
          </Button>
          <Button
            variant={view === "list" ? "secondary" : "ghost"}
            size="icon"
            aria-pressed={view === "list"}
            onClick={() => setView("list")}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="mt-16 text-center text-sm text-[var(--foreground-muted)]">No courses match those filters.</p>
      ) : (
        <div className={view === "grid" ? "mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4" : "mt-6 flex flex-col gap-3"}>
          {filtered.map((course) => (
            <CourseCard key={course.code} course={course} compact={view === "list"} />
          ))}
        </div>
      )}
    </div>
  );
}

function CourseCard({ course, compact }: { course: CourseCardData; compact: boolean }) {
  const meta = MODULE_META[course.code];
  const theme = THEME_STYLES[meta.theme];
  const badge = DIFFICULTY_BADGE[meta.difficulty];
  const buttonLabel = course.percent >= 100 ? "Review" : course.percent > 0 ? "Continue" : "Start";
  const Icon = meta.icon;

  return (
    <div
      className={`flex overflow-hidden rounded-2xl border border-[var(--border)] p-5 ${compact ? "flex-row items-center gap-5" : "flex-col"}`}
      style={{ background: theme.bg }}
    >
      <div className={compact ? "flex shrink-0 items-center gap-4" : ""}>
        <div className="flex items-start justify-between">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl" style={{ background: theme.iconBg }}>
            <Icon className="h-5 w-5" style={{ color: theme.iconFg }} />
          </div>
          {!compact && (
            <span
              className="rounded-full px-2.5 py-1 text-[11px] font-semibold"
              style={{ background: badge.bg, color: badge.fg }}
            >
              {meta.difficulty}
            </span>
          )}
        </div>
      </div>

      <div className={compact ? "min-w-0 flex-1" : "flex flex-1 flex-col"}>
        <div className={compact ? "flex items-center gap-2" : "mt-4"}>
          <h3 className="text-lg font-bold text-[var(--foreground)]">{course.title}</h3>
          {compact && (
            <span
              className="shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold"
              style={{ background: badge.bg, color: badge.fg }}
            >
              {meta.difficulty}
            </span>
          )}
        </div>
        <p className="text-xs text-[var(--foreground-muted)]">{meta.category}</p>
        {!compact && <p className="mt-2 line-clamp-2 flex-1 text-sm text-[var(--foreground-muted)]">{course.description}</p>}

        <div className={compact ? "mt-2 flex items-center gap-4" : "mt-4"}>
          <div className={compact ? "flex w-40 shrink-0 flex-col gap-1" : ""}>
            <div className="flex items-center justify-between text-xs text-[var(--foreground-muted)]">
              <span>Progress</span>
              <span className="font-semibold text-[var(--foreground)]">{course.percent}%</span>
            </div>
            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-[var(--surface-2)]">
              <div className="h-full rounded-full" style={{ width: `${course.percent}%`, background: theme.bar }} />
            </div>
          </div>
        </div>

        <div className={compact ? "flex shrink-0 items-center gap-4" : "mt-3 flex items-center justify-between"}>
          <div className="flex items-center gap-3 text-xs text-[var(--foreground-muted)]">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: theme.iconFg }} />
              {course.lessons} lessons
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {course.hours} hours
            </span>
          </div>
          <Link
            href={course.href}
            className="shrink-0 rounded-lg bg-[var(--marketing-ink)] px-3.5 py-1.5 text-xs font-semibold text-[var(--background)] transition-opacity hover:opacity-90"
          >
            {buttonLabel}
          </Link>
        </div>
      </div>
    </div>
  );
}
