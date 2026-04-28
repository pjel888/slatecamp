// Re-export from roles.ts for backward compatibility
export { isAdmin, isSuperAdmin, canManageContent, canReviewContent, getUserRole, type UserRole } from './roles';
export { canSeeDevToolbar, canUseInternalTierBypass } from './access-policy';

/**
 * @deprecated Legacy email-based admin check removed for security.
 * Always returns false. Use canonical role resolution via getUserRole().
 */
export async function isAdminByEmail(_email: string | undefined): Promise<boolean> {
  return false;
}
