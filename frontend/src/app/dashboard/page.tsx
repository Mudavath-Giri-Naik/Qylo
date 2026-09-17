import { createClient } from "@/lib/supabase/server";
import PlaceholderPage from "@/components/PlaceholderPage";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <PlaceholderPage
      title={`Welcome${user?.email ? `, ${user.email}` : ""}`}
      phase="Phase 5"
      description="Your learner dashboard: module completion, scores, and streaks will live here."
    />
  );
}
