import { Atom, Boxes, Sigma, Waypoints, type LucideIcon } from "lucide-react";

export type Difficulty = "Beginner" | "Intermediate" | "Advanced";

export interface ModuleMeta2 {
  category: string;
  difficulty: Difficulty;
  icon: LucideIcon;
  theme: "green" | "pink" | "blue" | "indigo";
  hours: number;
}

export const MODULE_META: Record<string, ModuleMeta2> = {
  "QT-M1": { category: "Core Concepts", difficulty: "Beginner", icon: Atom, theme: "blue", hours: 6 },
  "QT-M2": { category: "Hands-on", difficulty: "Beginner", icon: Waypoints, theme: "pink", hours: 5 },
  "QT-M3": { category: "Algorithms", difficulty: "Intermediate", icon: Sigma, theme: "indigo", hours: 8 },
  "QT-M4": { category: "Advanced Topics", difficulty: "Advanced", icon: Boxes, theme: "green", hours: 7 },
};

export const THEME_STYLES: Record<
  ModuleMeta2["theme"],
  { bg: string; iconBg: string; iconFg: string; bar: string; badgeBg: string; badgeFg: string }
> = {
  blue: {
    bg: "color-mix(in srgb, var(--accent) 7%, var(--surface))",
    iconBg: "color-mix(in srgb, var(--accent) 16%, transparent)",
    iconFg: "var(--accent)",
    bar: "var(--accent)",
    badgeBg: "color-mix(in srgb, var(--accent) 16%, transparent)",
    badgeFg: "var(--accent)",
  },
  pink: {
    bg: "color-mix(in srgb, var(--marketing-pink) 10%, var(--surface))",
    iconBg: "color-mix(in srgb, var(--marketing-pink) 22%, transparent)",
    iconFg: "var(--marketing-pink)",
    bar: "var(--marketing-pink)",
    badgeBg: "color-mix(in srgb, var(--marketing-pink) 20%, transparent)",
    badgeFg: "var(--marketing-pink)",
  },
  green: {
    bg: "color-mix(in srgb, var(--marketing-green) 8%, var(--surface))",
    iconBg: "color-mix(in srgb, var(--marketing-green) 16%, transparent)",
    iconFg: "var(--marketing-green)",
    bar: "var(--marketing-green)",
    badgeBg: "color-mix(in srgb, var(--marketing-green) 16%, transparent)",
    badgeFg: "var(--marketing-green)",
  },
  indigo: {
    bg: "color-mix(in srgb, #6366f1 8%, var(--surface))",
    iconBg: "color-mix(in srgb, #6366f1 16%, transparent)",
    iconFg: "#6366f1",
    bar: "#6366f1",
    badgeBg: "color-mix(in srgb, #6366f1 16%, transparent)",
    badgeFg: "#6366f1",
  },
};

export const DIFFICULTY_BADGE: Record<Difficulty, { bg: string; fg: string }> = {
  Beginner: { bg: "color-mix(in srgb, var(--marketing-green) 18%, transparent)", fg: "var(--marketing-green)" },
  Intermediate: { bg: "color-mix(in srgb, var(--accent) 18%, transparent)", fg: "var(--accent)" },
  Advanced: { bg: "color-mix(in srgb, var(--marketing-pink) 20%, transparent)", fg: "var(--marketing-pink)" },
};
