"use client";

import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import type { LocalProfile } from "@/hooks/useLocalProfile";

const AVATAR_COLORS = ["#2a78d6", "#8e6ff7", "#ec6cb9", "#f6b93b", "#34c77b", "#f97316"];

export default function EditProfileModal({
  profile,
  onClose,
  onSave,
}: {
  profile: LocalProfile;
  onClose: () => void;
  onSave: (patch: Partial<LocalProfile>) => void;
}) {
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [headline, setHeadline] = useState(profile.headline);
  const [bio, setBio] = useState(profile.bio);
  const [tagline, setTagline] = useState(profile.tagline);
  const [tagsInput, setTagsInput] = useState(profile.tags.join(", "));
  const [interestsInput, setInterestsInput] = useState(profile.interests.join(", "));
  const [avatarColor, setAvatarColor] = useState(profile.avatarColor);
  const [github, setGithub] = useState(profile.github);
  const [linkedin, setLinkedin] = useState(profile.linkedin);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedBio = bio.trim();
    const trimmedHeadline = headline.trim();
    const trimmedGithub = github.trim();
    const trimmedLinkedin = linkedin.trim();
    onSave({
      displayName: displayName.trim() || profile.displayName,
      headline: trimmedHeadline,
      bio: trimmedBio,
      tagline: tagline.trim(),
      tags: tagsInput.split(",").map((t) => t.trim()).filter(Boolean).slice(0, 6),
      interests: interestsInput.split(",").map((t) => t.trim()).filter(Boolean).slice(0, 8),
      avatarColor,
      github: trimmedGithub,
      linkedin: trimmedLinkedin,
      completedSteps: {
        avatar: avatarColor !== null,
        bio: trimmedBio.length > 0,
        institution: trimmedHeadline.length > 0,
        social: trimmedGithub.length > 0 || trimmedLinkedin.length > 0,
      },
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 pt-10 sm:pt-16" role="dialog" aria-modal="true">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-[1px]" onClick={onClose} />
      <div className="relative z-10 mb-10 w-full max-w-lg rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-md)]">
        <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-3">
          <p className="text-sm font-bold text-[var(--foreground)]">Edit Profile</p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--foreground-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex max-h-[70vh] flex-col gap-3 overflow-y-auto p-5">
          <div className="flex flex-col gap-1 text-xs font-semibold text-[var(--foreground-muted)]">
            Avatar color
            <div className="flex items-center gap-2">
              {AVATAR_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setAvatarColor(c)}
                  aria-label={`Use avatar color ${c}`}
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ring-2 ring-offset-2 ring-offset-[var(--surface)] transition-transform hover:scale-105 ${
                    avatarColor === c ? "ring-[var(--foreground)]" : "ring-transparent"
                  }`}
                  style={{ background: c }}
                >
                  {avatarColor === c && <Check className="h-3.5 w-3.5 text-white" />}
                </button>
              ))}
            </div>
          </div>
          <label className="flex flex-col gap-1 text-xs font-semibold text-[var(--foreground-muted)]">
            Display name
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              autoFocus
              className="rounded-lg border border-[var(--border)] bg-transparent px-3 py-2 text-sm font-normal text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs font-semibold text-[var(--foreground-muted)]">
            Headline
            <input
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="e.g. B.Tech CSE (AI & ML) | MVGR College"
              className="rounded-lg border border-[var(--border)] bg-transparent px-3 py-2 text-sm font-normal text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs font-semibold text-[var(--foreground-muted)]">
            Bio
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="resize-none rounded-lg border border-[var(--border)] bg-transparent px-3 py-2 text-sm font-normal text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs font-semibold text-[var(--foreground-muted)]">
            Tagline / quote
            <input
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="rounded-lg border border-[var(--border)] bg-transparent px-3 py-2 text-sm font-normal text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs font-semibold text-[var(--foreground-muted)]">
            Badges, comma separated
            <input
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="Quantum Learner, Problem Solver, Open to Collaborate"
              className="rounded-lg border border-[var(--border)] bg-transparent px-3 py-2 text-xs font-normal text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs font-semibold text-[var(--foreground-muted)]">
            Interests, comma separated
            <input
              value={interestsInput}
              onChange={(e) => setInterestsInput(e.target.value)}
              placeholder="Quantum Hardware, Research, Open Source, Hackathons"
              className="rounded-lg border border-[var(--border)] bg-transparent px-3 py-2 text-xs font-normal text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
            />
          </label>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-xs font-semibold text-[var(--foreground-muted)]">
              GitHub username
              <input
                value={github}
                onChange={(e) => setGithub(e.target.value)}
                placeholder="octocat"
                className="rounded-lg border border-[var(--border)] bg-transparent px-3 py-2 text-xs font-normal text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs font-semibold text-[var(--foreground-muted)]">
              LinkedIn URL
              <input
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                placeholder="linkedin.com/in/..."
                className="rounded-lg border border-[var(--border)] bg-transparent px-3 py-2 text-xs font-normal text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
              />
            </label>
          </div>

          <div className="mt-1 flex items-center justify-between gap-3">
            <p className="text-[10px] text-[var(--foreground-subtle)]">Saved in this browser only -- not synced elsewhere yet.</p>
            <button
              type="submit"
              className="shrink-0 rounded-lg bg-[var(--accent)] px-4 py-1.5 text-xs font-semibold text-[var(--accent-foreground)] transition-opacity hover:opacity-90"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
