"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Bookmark,
  CheckCircle2,
  ChevronDown,
  Clock,
  Pause,
  Play,
  Share2,
} from "lucide-react";
import type { LessonLanguage } from "@/lib/learn/modules";
import type { LessonSummary } from "@/lib/learn/queries";
import type { Difficulty } from "@/lib/learn/moduleMeta";
import type { ModuleHero, ModuleInstructor } from "@/lib/learn/presentation";
import { avatarColor } from "@/lib/community/avatarColor";
import LanguageSwitcher from "@/components/learn/LanguageSwitcher";
import CourseHeroIllustration from "@/components/learn/CourseHeroIllustration";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";

const MILESTONES = [25, 50, 75, 100];

function progressMessage(percent: number): string {
  if (percent >= 100) return "You've completed this course! 🎉 Time to put it into practice.";
  if (percent > 0) return "Great job! 🎉 You're on the path to completing this course. Keep going!";
  return "Ready to start? Your first lesson is just a click away.";
}

export default function CourseDetail({
  moduleCode,
  title,
  description,
  longDescription,
  audience,
  instructor,
  hero,
  difficulty,
  hours,
  lessons,
  completedLessonIds,
  lang,
}: {
  moduleCode: string;
  title: string;
  description: string;
  longDescription: string;
  audience: string[];
  instructor: ModuleInstructor;
  hero: ModuleHero;
  difficulty: Difficulty;
  hours: number;
  lessons: LessonSummary[];
  completedLessonIds: string[];
  lang: LessonLanguage;
}) {
  const [expanded, setExpanded] = useState(false);
  const langSuffix = lang === "en" ? "" : `?lang=${lang}`;

  const completed = new Set(completedLessonIds);
  const totalLessons = lessons.length;
  const lessonsRead = lessons.filter((l) => completed.has(l.id)).length;
  const percent = totalLessons > 0 ? Math.round((lessonsRead / totalLessons) * 100) : 0;
  const currentIndex = lessons.findIndex((l) => !completed.has(l.id));
  const activeIndex = currentIndex === -1 ? lessons.length - 1 : currentIndex;
  const activeLesson = lessons[activeIndex];
  const buttonLabel = percent >= 100 ? "Review Course" : percent > 0 ? "Continue Learning" : "Start Learning";
  // No per-lesson duration is tracked -- split the module's total estimated
  // hours evenly across its lessons for a rough per-lesson figure.
  const minutesPerLesson = totalLessons > 0 ? Math.max(5, Math.round((hours * 60) / totalLessons)) : 0;

  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/learn" className="text-sm text-[var(--foreground-muted)] hover:text-[var(--foreground)]">
          ← All Courses
        </Link>
        <LanguageSwitcher current={lang} />
      </div>

      <h1 className="mt-3 text-2xl font-bold tracking-tight text-[var(--foreground)]" lang={lang}>
        {title}
      </h1>

      <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex min-w-0 flex-col gap-6">
          {/* Hero */}
          <div
            className="relative overflow-hidden rounded-2xl p-6 sm:p-8"
            style={{ background: "linear-gradient(135deg, #0c1226 0%, #171235 55%, #241a45 100%)" }}
          >
            <div className="relative z-10 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_260px]">
              <div className="min-w-0">
                <span className="inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white">{difficulty}</span>
                <h2 className="mt-3 text-3xl font-bold leading-tight text-white sm:text-4xl">
                  {hero.lead}
                  <br />
                  <span className="bg-gradient-to-r from-violet-300 to-fuchsia-300 bg-clip-text text-transparent">{hero.highlight}</span>
                </h2>
                <p className="mt-3 max-w-md text-sm text-white/70">{description}</p>

                <div className="mt-5 flex flex-wrap items-center gap-5 text-sm text-white/85">
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="h-4 w-4" />
                    <span className="font-semibold text-white">{totalLessons}</span> Lessons
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    <span className="font-semibold text-white">{hours} hours</span> Total Content
                  </span>
                  <span className="flex items-center gap-1.5">
                    <BarChart3 className="h-4 w-4" />
                    <span className="font-semibold text-white">{difficulty}</span> Level
                  </span>
                </div>

                {activeLesson && (
                  <Link
                    href={`/learn/${moduleCode}/${activeLesson.order_index}${langSuffix}`}
                    className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#171235] transition-opacity hover:opacity-90"
                  >
                    {buttonLabel}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                )}
              </div>

              <div className="hidden flex-col items-center justify-center gap-2 lg:flex">
                <p className="-rotate-2 self-end pr-2 text-right font-serif text-sm italic leading-snug text-white/80">
                  {hero.note.split("\n").map((line, i) => (
                    <span key={i} className="block">
                      {line}
                      {i === hero.note.split("\n").length - 1 && <span className="block h-px w-full bg-white/40" />}
                    </span>
                  ))}
                </p>
                <CourseHeroIllustration />
              </div>
            </div>
          </div>

          {/* Instructor */}
          <Card className="gap-0 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <Avatar className="h-11 w-11">
                  <AvatarFallback style={{ background: avatarColor(instructor.name), color: "#fff" }} className="font-semibold">
                    {instructor.name
                      .split(" ")
                      .filter((w) => w !== "Dr.")
                      .map((w) => w[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-[var(--foreground)]">{instructor.name}</p>
                  <p className="truncate text-xs text-[var(--foreground-muted)]">{instructor.title}</p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  title="Sharing coming soon"
                  className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--foreground-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)]"
                >
                  <Share2 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  title="Saving coming soon"
                  className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--foreground-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)]"
                >
                  <Bookmark className="h-4 w-4" />
                </button>
              </div>
            </div>
          </Card>

          {/* About */}
          <div>
            <h3 className="text-lg font-bold text-[var(--foreground)]">About This Course</h3>
            <p className={`mt-2 text-sm leading-relaxed text-[var(--foreground-muted)] ${expanded ? "" : "line-clamp-3"}`}>{longDescription}</p>
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="mt-1.5 flex items-center gap-1 text-sm font-semibold text-[var(--accent)] hover:underline"
            >
              {expanded ? "Show less" : "Show more"}
              <ChevronDown className={`h-4 w-4 transition-transform ${expanded ? "rotate-180" : ""}`} />
            </button>
          </div>

          {/* Audience */}
          <div>
            <h3 className="text-lg font-bold text-[var(--foreground)]">This Course Is For:</h3>
            <ul className="mt-2 flex flex-col gap-1.5">
              {audience.map((line) => (
                <li key={line} className="flex items-start gap-2 text-sm text-[var(--foreground-muted)]">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[var(--foreground-subtle)]" />
                  {line}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right rail */}
        <aside className="flex flex-col gap-4 lg:sticky lg:top-4 lg:self-start">
          <Card className="gap-0 p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[var(--foreground)]">Your Study Progress</h3>
              <span className="rounded-full bg-[var(--surface-2)] px-2 py-0.5 text-xs font-bold text-[var(--foreground)]">{percent}%</span>
            </div>
            <div className="relative mt-4 h-1.5 w-full rounded-full bg-[var(--surface-2)]">
              <div className="h-full rounded-full bg-[var(--foreground)]" style={{ width: `${percent}%` }} />
            </div>
            <div className="mt-2 flex items-center justify-between">
              {MILESTONES.map((m) => (
                <span
                  key={m}
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold ${
                    percent >= m ? "bg-[var(--foreground)] text-[var(--background)]" : "bg-[var(--surface-2)] text-[var(--foreground-subtle)]"
                  }`}
                >
                  {m}
                </span>
              ))}
            </div>
            <p className="mt-3 rounded-lg bg-[var(--surface-2)] p-2.5 text-xs text-[var(--foreground-muted)]">{progressMessage(percent)}</p>
          </Card>

          <Card className="gap-0 p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[var(--foreground)]">Course Content</h3>
              <span className="text-xs font-semibold text-[var(--foreground-muted)]">
                {lessonsRead}/{totalLessons}
              </span>
            </div>
            <ol className="mt-3 flex flex-col gap-1.5">
              {lessons.map((lesson, i) => {
                const isDone = completed.has(lesson.id);
                const isActive = i === activeIndex && !isDone;
                return (
                  <li key={lesson.id}>
                    <Link
                      href={`/learn/${moduleCode}/${lesson.order_index}${langSuffix}`}
                      className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors ${
                        isActive
                          ? "border-[var(--border-strong)] bg-[var(--surface-2)]"
                          : "border-transparent hover:bg-[var(--surface-hover)]"
                      }`}
                    >
                      {isDone ? (
                        <CheckCircle2 className="h-6 w-6 shrink-0 text-[var(--marketing-green)]" />
                      ) : isActive ? (
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--foreground)] text-[var(--background)]">
                          <Pause className="h-3 w-3 fill-current" />
                        </span>
                      ) : (
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--surface-2)] text-[var(--foreground-subtle)]">
                          <Play className="h-3 w-3 fill-current" />
                        </span>
                      )}
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-[var(--foreground)]" lang={lesson.language}>
                          {i + 1}. {lesson.title}
                        </span>
                        <span className="block text-xs text-[var(--foreground-muted)]">{minutesPerLesson} min</span>
                      </span>
                    </Link>
                  </li>
                );
              })}
              {lessons.length === 0 && <p className="text-xs text-[var(--foreground-muted)]">No lessons in this module yet.</p>}
            </ol>
          </Card>
        </aside>
      </div>
    </main>
  );
}
