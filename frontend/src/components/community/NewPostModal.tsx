"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import type { PostCategory } from "@/lib/community/samplePosts";

const CATEGORIES: PostCategory[] = ["Questions", "Showcase", "Resources", "Announcements"];

export default function NewPostModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (post: { title: string; body: string; category: PostCategory; tags: string[] }) => void;
}) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState<PostCategory>("Questions");
  const [tagsInput, setTagsInput] = useState("");

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
    if (!title.trim() || !body.trim()) return;
    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)
      .slice(0, 4);
    onSubmit({ title: title.trim(), body: body.trim(), category, tags });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 pt-10 sm:pt-16" role="dialog" aria-modal="true">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-[1px]" onClick={onClose} />
      <div className="relative z-10 mb-10 w-full max-w-lg rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-md)]">
        <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-3">
          <p className="text-sm font-bold text-[var(--foreground)]">New Post</p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--foreground-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3 p-5">
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                  category === c
                    ? "bg-[var(--accent)] text-[var(--accent-foreground)]"
                    : "border border-[var(--border)] text-[var(--foreground-muted)] hover:bg-[var(--surface-hover)]"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            autoFocus
            required
            className="rounded-lg border border-[var(--border)] bg-transparent px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="What's on your mind?"
            required
            rows={4}
            className="resize-none rounded-lg border border-[var(--border)] bg-transparent px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
          />
          <input
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="Tags, comma separated (e.g. Qiskit, Help)"
            className="rounded-lg border border-[var(--border)] bg-transparent px-3 py-2 text-xs text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
          />

          <div className="mt-1 flex items-center justify-between gap-3">
            <p className="text-[10px] text-[var(--foreground-subtle)]">Posted for this session only -- discussions aren&apos;t saved yet.</p>
            <button
              type="submit"
              className="shrink-0 rounded-lg bg-[var(--accent)] px-4 py-1.5 text-xs font-semibold text-[var(--accent-foreground)] transition-opacity hover:opacity-90"
            >
              Post
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
