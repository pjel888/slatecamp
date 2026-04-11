import type { UserRole } from './roles'
import {
  canSeeDevToolbarForRole,
  canUseInternalTierBypassForRole,
} from '@/lib/entitlements/policy'

/**
 * @deprecated Prefer `canSeeDevToolbarForRole()` from `@/lib/entitlements/policy`.
 */
export const canSeeDevToolbar = (role: UserRole | null): boolean =>
  role !== null && canSeeDevToolbarForRole(role)

/**
 * @deprecated Prefer `canUseInternalTierBypassForRole()` from `@/lib/entitlements/policy`.
 */
export const canUseInternalTierBypass = (role: UserRole | null): boolean =>
  role !== null && canUseInternalTierBypassForRole(role)
