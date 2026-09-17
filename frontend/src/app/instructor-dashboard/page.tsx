import { createClient } from "@/lib/supabase/server";
import PlaceholderPage from "@/components/PlaceholderPage";

export default async function InstructorDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <PlaceholderPage
      title={`Welcome${user?.email ? `, ${user.email}` : ""}`}
      phase="Phase 5"
      description="Your instructor dashboard: class roster, per-student completion, and curriculum-aligned reports will live here."
    />
  );
}
