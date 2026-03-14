"use server";

import { createClient, getUser } from "@/lib/supabase/server";

export async function getUserEmailPreferences() {
  const supabase = await createClient();
  const { data: { user } } = await getUser();
  if (!user) return { email_notifications_enabled: true, marketing_emails_enabled: false };

  const { data, error } = await supabase
    .from("user_subscriptions")
    .select("email_notifications_enabled, marketing_emails_enabled")
    .eq("user_id", user.id)
    .single();

  if (error || !data) return { email_notifications_enabled: true, marketing_emails_enabled: false };
  return data;
}

export async function updateEmailPreferences(preferences: {
  email_notifications_enabled?: boolean;
  marketing_emails_enabled?: boolean;
}) {
  const supabase = await createClient();
  const { data: { user } } = await getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("user_subscriptions")
    .update(preferences)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  return { success: true };
}
