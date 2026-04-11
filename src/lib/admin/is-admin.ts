// Re-export from roles.ts for backward compatibility
// The old email-based logic is now handled internally by roles.ts
export { isAdmin, isSuperAdmin, canManageContent, canReviewContent, getUserRole, type UserRole } from './roles';
export { canSeeDevToolbar, canUseInternalTierBypass } from './access-policy';

/**
 * Check if the current user is an admin by checking auth metadata or email domain.
 * @deprecated Use getUserRole() from ./roles for more detailed role checking
 */
export async function isAdminLegacy(): Promise<boolean> {
  const { isAdmin } = await import('./roles');
  return isAdmin();
}

/**
 * Check if a specific email belongs to an admin.
 * @deprecated Use canonical role resolution and policy checks.
 */
export async function isAdminByEmail(email: string | undefined): Promise<boolean> {
  if (!email) return false;
  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim()).filter(Boolean)
  return email.endsWith('@slatecamp.com') || adminEmails.includes(email);
}
