import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Google redirects here (via Supabase) with a `code` param after the user
// consents. Exchanging it for a session sets the auth cookies, then we send
// the user to the dashboard that matches their role -- new Google sign-ins
// get a "learner" row automatically via the public.handle_new_user trigger.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      let redirectPath = "/dashboard";
      if (user) {
        const { data: profile } = await supabase
          .from("users")
          .select("role")
          .eq("id", user.id)
          .single();
        if (profile?.role === "instructor") redirectPath = "/instructor-dashboard";
      }

      return NextResponse.redirect(`${origin}${redirectPath}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
