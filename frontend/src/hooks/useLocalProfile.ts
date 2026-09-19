"use client";

import { useCallback, useState } from "react";

export interface LocalProfile {
  displayName: string;
  headline: string;
  bio: string;
  tagline: string;
  tags: string[];
  interests: string[];
  avatarColor: string | null;
  github: string;
  linkedin: string;
  completedSteps: {
    avatar: boolean;
    bio: boolean;
    institution: boolean;
    social: boolean;
  };
}

const STORAGE_PREFIX = "qylo-profile:";

function humanizeEmail(email: string): string {
  const local = email.split("@")[0] ?? "";
  const words = local
    .replace(/[^a-zA-Z]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (words.length === 0) return "Quantum Learner";
  return words.map((w) => w[0]!.toUpperCase() + w.slice(1).toLowerCase()).join(" ");
}

export function defaultLocalProfile(email: string, role: "learner" | "instructor" | null): LocalProfile {
  return {
    displayName: humanizeEmail(email),
    headline: "Quantum computing learner",
    bio: "Exploring quantum computing and building cool things with qubits.",
    tagline: "Small steps in superposition lead to big possibilities.",
    tags: [role === "instructor" ? "Instructor" : "Quantum Learner"],
    interests: [],
    avatarColor: null,
    github: "",
    linkedin: "",
    completedSteps: { avatar: false, bio: false, institution: false, social: false },
  };
}

function readStored(userId: string): Partial<LocalProfile> | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_PREFIX + userId);
    return raw ? (JSON.parse(raw) as Partial<LocalProfile>) : null;
  } catch {
    return null;
  }
}

function writeStored(userId: string, profile: LocalProfile) {
  try {
    window.localStorage.setItem(STORAGE_PREFIX + userId, JSON.stringify(profile));
  } catch {
    // localStorage unavailable (private mode, etc.) -- edits just won't persist across reloads.
  }
}

export function useLocalProfile(userId: string, defaults: LocalProfile) {
  const [profile, setProfile] = useState<LocalProfile>(() => {
    if (typeof window === "undefined") return defaults;
    const stored = readStored(userId);
    return stored ? { ...defaults, ...stored } : defaults;
  });

  const update = useCallback(
    (patch: Partial<LocalProfile>) => {
      setProfile((prev) => {
        const next = { ...prev, ...patch };
        writeStored(userId, next);
        return next;
      });
    },
    [userId]
  );

  return { profile, update };
}
