import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { logoutAction } from "@/app/auth/actions";

export default async function NavBar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let role: "learner" | "instructor" | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();
    role = profile?.role ?? null;
  }

  const links = [
    { href: "/learn", label: "Learn" },
    { href: "/circuit-builder", label: "Circuit Builder" },
    { href: "/challenges", label: "Challenges" },
  ];

  return (
    <header className="border-b border-black/10 dark:border-white/10">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          Qylo
        </Link>

        <div className="flex items-center gap-6">
          {user &&
            links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-foreground/70 transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}

          {user && role === "learner" && (
            <Link
              href="/dashboard"
              className="text-sm text-foreground/70 transition-colors hover:text-foreground"
            >
              Dashboard
            </Link>
          )}

          {user && role === "instructor" && (
            <Link
              href="/instructor-dashboard"
              className="text-sm text-foreground/70 transition-colors hover:text-foreground"
            >
              Instructor Dashboard
            </Link>
          )}

          {user ? (
            <form action={logoutAction}>
              <button
                type="submit"
                className="rounded-md border border-black/10 px-3 py-1.5 text-sm transition-colors hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
              >
                Log out
              </button>
            </form>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/login" className="text-sm text-foreground/70 hover:text-foreground">
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded-md bg-foreground px-3 py-1.5 text-sm font-medium text-background"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
