"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function JoinClassForm() {
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<{ ok: boolean; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;

    setLoading(true);
    setStatus(null);
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setStatus({ ok: false, message: "You must be logged in." });
      setLoading(false);
      return;
    }

    const { data: klass, error: lookupError } = await supabase
      .from("classes")
      .select("id, name")
      .eq("join_code", trimmed)
      .single();

    if (lookupError || !klass) {
      setStatus({ ok: false, message: "No class found with that code." });
      setLoading(false);
      return;
    }

    const { error: joinError } = await supabase
      .from("class_members")
      .insert({ class_id: klass.id, student_id: user.id });

    setLoading(false);
    if (joinError) {
      if (joinError.code === "23505") {
        setStatus({ ok: true, message: `You're already in "${klass.name}".` });
      } else {
        setStatus({ ok: false, message: joinError.message });
      }
      return;
    }

    setStatus({ ok: true, message: `Joined "${klass.name}".` });
    setCode("");
  }

  return (
    <form onSubmit={handleJoin} className="flex items-center gap-2">
      <input
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Join code"
        disabled={loading}
        className="w-32 rounded-md border border-black/10 bg-transparent px-3 py-1.5 text-sm uppercase dark:border-white/15"
      />
      <button
        type="submit"
        disabled={loading || !code.trim()}
        className="rounded-md border border-black/10 px-3 py-1.5 text-sm font-medium disabled:opacity-60 dark:border-white/15"
      >
        {loading ? "Joining..." : "Join class"}
      </button>
      {status && (
        <span
          className={`text-xs ${
            status.ok ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
          }`}
        >
          {status.message}
        </span>
      )}
    </form>
  );
}
