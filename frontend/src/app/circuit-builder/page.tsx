import { createClient } from "@/lib/supabase/server";
import Composer from "@/components/circuit-builder/Composer";

export default async function CircuitBuilderPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let role: "learner" | "instructor" | null = null;
  if (user) {
    const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single();
    role = profile?.role ?? null;
  }

  const links = user
    ? [
        { href: "/learn", label: "Learn" },
        { href: "/circuit-builder", label: "Circuit Builder" },
        { href: "/challenges", label: "Challenges" },
        role === "instructor"
          ? { href: "/instructor-dashboard", label: "Instructor Dashboard" }
          : { href: "/dashboard", label: "Dashboard" },
      ]
    : [];

  return <Composer loggedIn={!!user} links={links} />;
}
