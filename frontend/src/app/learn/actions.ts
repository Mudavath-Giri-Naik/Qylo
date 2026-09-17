"use server";

import { createClient } from "@/lib/supabase/server";

export async function markLessonReadAction(
  moduleCode: string,
  lessonId: string
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in." };
  }

  const { error } = await supabase.from("progress").insert({
    user_id: user.id,
    module_code: moduleCode,
    lesson_id: lessonId,
    status: "completed",
  });

  if (error) {
    return { error: error.message };
  }

  return {};
}
