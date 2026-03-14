import { createClient } from "@/lib/supabase/server";

/**
 * Check if the current user is an admin by checking auth metadata or email domain.
 */
export async function isAdmin(): Promise<boolean> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return false;

  const adminEmails = ['philipjonlewis@gmail.com'];
  return (
    user.app_metadata?.role === 'admin' || 
    user.email?.endsWith('@slatecamp.com') === true ||
    (user.email && adminEmails.includes(user.email))
  );
}

/**
 * Check if a specific email belongs to an admin.
 */
export async function isAdminByEmail(email: string | undefined): Promise<boolean> {
  if (!email) return false;
  const adminEmails = ['philipjonlewis@gmail.com'];
  return email.endsWith('@slatecamp.com') || adminEmails.includes(email);
}
