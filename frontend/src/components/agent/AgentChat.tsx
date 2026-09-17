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
    <div className="flex h-full flex-col rounded-lg border border-black/10 dark:border-white/10">
      <div className="border-b border-black/10 px-4 py-3 dark:border-white/10">
        <h2 className="text-sm font-semibold">{title}</h2>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
        {messages.length === 0 && (
          <p className="text-xs text-foreground/50">
            {quickActionLabel
              ? `Ask a question, or use "${quickActionLabel}" below.`
              : "Ask a question about this lesson."}
          </p>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`rounded-md px-3 py-2 text-sm ${
              m.role === "user"
                ? "ml-6 bg-foreground text-background"
                : "mr-6 bg-black/[0.04] dark:bg-white/[0.06]"
            }`}
          >
            <p className="whitespace-pre-wrap">{m.content}</p>
          </div>
        ))}
        {loading && <p className="mr-6 text-xs text-foreground/50">Thinking...</p>}
        {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
      </div>

      <div className="flex flex-col gap-2 border-t border-black/10 p-3 dark:border-white/10">
        {quickActionLabel && getCircuit && (
          <button
            type="button"
            onClick={() => send("")}
            disabled={loading}
            className="rounded-md border border-black/10 px-3 py-1.5 text-xs font-medium disabled:opacity-60 dark:border-white/15"
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
            className="flex-1 rounded-md border border-black/10 bg-transparent px-3 py-1.5 text-sm dark:border-white/15"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="rounded-md bg-foreground px-3 py-1.5 text-sm font-medium text-background disabled:opacity-60"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
