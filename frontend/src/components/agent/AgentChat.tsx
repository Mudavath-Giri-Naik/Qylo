"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { askAgent, type ChatTurn } from "@/lib/agent/api";
import type { CircuitJson } from "@/lib/circuit/types";

const MAX_HISTORY_TURNS = 6;

export default function AgentChat({
  title = "Ask the tutor",
  moduleCode,
  getCircuit,
  quickActionLabel,
  placeholder = "Ask a question...",
}: {
  title?: string;
  moduleCode?: string | null;
  getCircuit?: () => CircuitJson | null;
  quickActionLabel?: string;
  placeholder?: string;
}) {
  const [userId, setUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatTurn[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  async function send(question: string) {
    if (!userId) {
      setError("You must be logged in to ask the tutor.");
      return;
    }
    const trimmed = question.trim();
    if (!trimmed && !getCircuit) return;

    const userTurn: ChatTurn = { role: "user", content: trimmed || "(explain my circuit)" };
    const nextMessages = [...messages, userTurn];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const result = await askAgent({
        userId,
        question: trimmed || undefined,
        circuit: getCircuit ? getCircuit() : undefined,
        moduleCode,
        history: nextMessages.slice(-MAX_HISTORY_TURNS),
      });
      setMessages((prev) => [...prev, { role: "model", content: result.answer }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-full flex-col rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-sm)]">
      <div className="flex items-center gap-2 border-b border-[var(--border)] px-4 py-3">
        <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
        <h2 className="text-sm font-semibold text-[var(--foreground)]">{title}</h2>
      </div>

      <div ref={scrollRef} className="thin-scrollbar flex-1 space-y-3 overflow-y-auto px-4 py-3">
        {messages.length === 0 && (
          <p className="text-xs text-[var(--foreground-subtle)]">
            {quickActionLabel
              ? `Ask a question, or use "${quickActionLabel}" below.`
              : "Ask a question about this lesson."}
          </p>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`rounded-xl px-3 py-2 text-sm ${
              m.role === "user"
                ? "ml-6 bg-[var(--accent)] text-[var(--accent-foreground)]"
                : "mr-6 bg-[var(--surface-2)] text-[var(--foreground)]"
            }`}
          >
            <p className="whitespace-pre-wrap">{m.content}</p>
          </div>
        ))}
        {loading && <p className="mr-6 text-xs text-[var(--foreground-subtle)]">Thinking...</p>}
        {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
      </div>

      <div className="flex flex-col gap-2 border-t border-[var(--border)] p-3">
        {quickActionLabel && getCircuit && (
          <button
            type="button"
            onClick={() => send("")}
            disabled={loading}
            className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--surface-hover)] disabled:opacity-60"
          >
            {quickActionLabel}
          </button>
        )}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (input.trim()) send(input);
          }}
          className="flex gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={placeholder}
            disabled={loading}
            className="flex-1 rounded-lg border border-[var(--border)] bg-transparent px-3 py-1.5 text-sm text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="rounded-lg bg-[var(--accent)] px-3 py-1.5 text-sm font-medium text-[var(--accent-foreground)] disabled:opacity-60"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
