"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I

function randomCode(length = 6): string {
  let code = "";
  for (let i = 0; i < length; i++) {
    code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  }
  return code;
}

export default function CreateClassForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError("You must be logged in.");
      setLoading(false);
      return;
    }

    // Join codes are unique; retry a couple of times on the astronomically
    // unlikely case of a collision.
    for (let attempt = 0; attempt < 5; attempt++) {
      const { error: insertError } = await supabase
        .from("classes")
        .insert({ instructor_id: user.id, name: name.trim(), join_code: randomCode() });

      if (!insertError) {
        setLoading(false);
        router.refresh();
        return;
      }
      if (insertError.code !== "23505") {
        setError(insertError.message);
        setLoading(false);
        return;
      }
    }
    setError("Couldn't generate a unique join code, please try again.");
    setLoading(false);
  }

  return (
    <form onSubmit={handleCreate} className="flex items-center gap-2">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Class name"
        disabled={loading}
        className="rounded-md border border-black/10 bg-transparent px-3 py-1.5 text-sm dark:border-white/15"
      />
      <button
        type="submit"
        disabled={loading || !name.trim()}
        className="rounded-md bg-foreground px-3 py-1.5 text-sm font-medium text-background disabled:opacity-60"
      >
        {loading ? "Creating..." : "Create class"}
      </button>
      {error && <span className="text-xs text-red-600 dark:text-red-400">{error}</span>}
    </form>
  );
}
