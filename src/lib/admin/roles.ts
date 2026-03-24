import { createClient } from "@/lib/supabase/server";

export type UserRole = 'super_admin' | 'content_admin' | 'sme_reviewer';

/**
 * Get the user's role from the database
 */
export async function getUserRole(): Promise<UserRole | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  // Check database roles first
  const { data: dbRole } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (dbRole) return dbRole.role as UserRole;

  // Fallback to legacy email-based admin
  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim()).filter(Boolean)
  if (user.email && adminEmails.includes(user.email)) {
    return 'super_admin';
  }

  return null;
}

/**
 * Check if user is an admin (super_admin or content_admin)
 */
export async function isAdmin(): Promise<boolean> {
  const role = await getUserRole();
  return role === 'super_admin' || role === 'content_admin';
}

/**
 * Check if user is a super_admin
 */
export async function isSuperAdmin(): Promise<boolean> {
  const role = await getUserRole();
  return role === 'super_admin';
}

/**
 * Check if user can manage content (create/edit/delete questions, wiki, assets)
 */
export async function canManageContent(): Promise<boolean> {
  const role = await getUserRole();
  return role === 'super_admin' || role === 'content_admin';
}

/**
 * Check if user can review content (SME reviewer)
 */
export async function canReviewContent(): Promise<boolean> {
  const role = await getUserRole();
  return role === 'super_admin' || role === 'content_admin' || role === 'sme_reviewer';
}

/**
 * Check if user can manage users (only super_admin)
 */
export async function canManageUsers(): Promise<boolean> {
  const role = await getUserRole();
  return role === 'super_admin';
}

/**
 * Get all roles for a user
 */
export async function getUserRoles(): Promise<UserRole[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  const { data: roles } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id);

  return (roles?.map(r => r.role as UserRole)) || [];
}
