import { createClient } from "@/lib/supabase/server";

/**
 * Check if the current user is an admin by querying the profiles table.
 * Uses the is_admin column on the profile record.
 */
export async function isAdmin(): Promise<boolean> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return false;

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  return profile?.is_admin === true;
}

/**
 * Check if a specific email belongs to an admin.
 * Also queries the profiles table to verify is_admin status.
 * @deprecated Prefer using isAdmin() which uses the current session
 */
export async function isAdminByEmail(email: string | undefined): Promise<boolean> {
  if (!email) return false;

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("email", email)
    .single();

  return profile?.is_admin === true;
}
