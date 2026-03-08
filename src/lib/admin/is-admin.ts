/**
 * Admin check: schema does not have profiles.is_admin.
 * Use ADMIN_EMAILS (comma-separated) in .env.local to grant admin (e.g. "you@example.com,other@example.com").
 * In demo mode, mock profile may still include is_admin; combine with profile?.is_admin when available.
 */
export function isAdminByEmail(email: string | undefined): boolean {
  if (!email) return false;
  const list = process.env.ADMIN_EMAILS?.split(",").map((e) => e.trim()).filter(Boolean) ?? [];
  return list.includes(email);
}
