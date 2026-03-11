"use server";

import { createClient, getUser } from "@/lib/supabase/server";

export async function updateEmailPreferences(prefs: {
  final_stretch_daily?: boolean;
}): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await getUser();
  if (!user) return;
  const { data: existing } = await supabase
    .from("profiles")
    .select("email_preferences")
    .eq("id", user.id)
    .single();
  const current = (existing?.email_preferences as Record<string, boolean> | null) ?? {};
  await supabase
    .from("profiles")
    .update({
      email_preferences: { ...current, ...prefs },
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);
}
