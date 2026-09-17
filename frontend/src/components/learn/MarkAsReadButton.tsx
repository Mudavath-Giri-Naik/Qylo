"use client";

import { useState, useTransition } from "react";
import { markLessonReadAction } from "@/app/learn/actions";

export default function MarkAsReadButton({
  moduleCode,
  lessonId,
}: {
  moduleCode: string;
  lessonId: string;
}) {
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (done) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-600/30 bg-emerald-600/10 px-3 py-1.5 text-sm font-medium text-emerald-700 dark:text-emerald-400">
        ✓ Marked as read
      </span>
    );
  }

  return (
    <div>
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const result = await markLessonReadAction(moduleCode, lessonId);
            if (result.error) setError(result.error);
            else setDone(true);
          })
        }
        className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--surface-hover)] disabled:opacity-60"
      >
        {pending ? "Marking..." : "Mark as read"}
      </button>
      {error && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}
