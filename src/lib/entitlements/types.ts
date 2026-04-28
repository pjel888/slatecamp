import type { TierCapabilities } from '@/lib/dev/dev-mode'
import type { UserTier } from '@/types/app'
import type { EntitlementFeatureKey } from './feature-keys'

export type CanonicalRole =
  | 'anonymous'
  | 'member'
  | 'super_admin'
  | 'content_admin'
  | 'sme_reviewer'
  | 'developer'
  | 'admin'
  | 'ceo'
  | 'owner'

export type RoleSource =
  | 'app_metadata'
  | 'user_metadata'
  | 'profile'
  | 'user_roles'
  | 'admin_email'
  | 'dev_force_user'
  | 'none'

export type CanonicalSubscriptionStatus =
  | 'active'
  | 'trialing'
  | 'past_due'
  | 'canceled'
  | 'inactive'
  | 'unknown'

export type EntitlementDecisionReason =
  | 'allowed'
  | 'anonymous'
  | 'feature_disabled'
  | 'feature_missing'
  | 'insufficient_tier'
  | 'tooling_policy_denied'
  | 'admin_policy_denied'
  | 'config_mismatch'

export interface RoleResolution {
  normalizedRole: CanonicalRole
  compatibilityRole: Exclude<CanonicalRole, 'anonymous' | 'member'> | null
  resolvedFrom: RoleSource
  roleSources: RoleSource[]
  precedenceTrace: string[]
}

export interface NormalizedFeatureFlag {
  key: string
  enabled: boolean
  allowedTiers: UserTier[]
  rawTargetTier: string[]
  rawTargetRoles: string[]
  normalizationTrace: string[]
}

export interface DevOverrideState {
  simulatedTier: UserTier | null
  legacySpoofedTier: UserTier | null
  forcedTier: UserTier | null
  forcedUserIdActive: boolean
  localDevBypassActive: boolean
  allowDevPortalBypass: boolean
  featureOverrides: Partial<Record<EntitlementFeatureKey, boolean>>
  sourceTrace: string[]
}

export interface ToolingPolicySnapshot {
  developerPortal: boolean
  devToolbar: boolean
  devOverrideWrite: boolean
  internalTierBypass: boolean
  adminCms: boolean
  canReviewContent: boolean
  canManageUsers: boolean
  ceoPortal: boolean
}

export interface FeatureAccessDecision {
  featureKey: EntitlementFeatureKey
  allowed: boolean
  reason: EntitlementDecisionReason
  source: 'policy' | 'override' | 'flag' | 'tier' | 'default'
  trace: string[]
}

export type AdminPermission =
  | 'admin.access'
  | 'admin.dashboard.view'
  | 'admin.content.view'
  | 'admin.content.create'
  | 'admin.content.edit'
  | 'admin.content.delete'
  | 'admin.content.publish'
  | 'admin.content.approve'
  | 'admin.content.import'
  | 'admin.taxonomy.manage'
  | 'admin.assets.manage'
  | 'admin.pipeline.manage'
  | 'admin.reviews.view'
  | 'admin.audit.view'
  | 'admin.activity.view'
  | 'admin.search.use'
  | 'admin.analytics.view'
  | 'admin.settings.view'
  | 'admin.users.manage'
  | 'admin.preview.view'

export interface ViewerEntitlements {
  traceId: string
  userId: string | null
  email: string | null
  normalizedRole: CanonicalRole
  compatibilityRole: Exclude<CanonicalRole, 'anonymous' | 'member'> | null
  roleResolution: RoleResolution
  rawTier: UserTier
  subscriptionStatus: CanonicalSubscriptionStatus
  effectiveTier: UserTier
  capabilities: TierCapabilities
  tooling: ToolingPolicySnapshot
  overrides: DevOverrideState
  featureFlags: Partial<Record<EntitlementFeatureKey, NormalizedFeatureFlag>>
  decisions: Partial<Record<EntitlementFeatureKey, FeatureAccessDecision>>
  permissions: AdminPermission[]
}

export interface EntitlementAuditEvent {
  eventName:
    | 'entitlement.decision'
    | 'entitlement.denied'
    | 'entitlement.override.applied'
    | 'entitlement.override.cleared'
    | 'tooling.access'
    | 'tooling.override.write'
    | 'tooling.override.delete'
    | 'entitlement.config.mismatch'
  timestamp: string
  traceId: string
  userId: string | null
  routeOrAction: string
  featureKey?: string
  normalizedRole: CanonicalRole
  roleSource: RoleSource
  rawTier: UserTier
  subscriptionStatus: CanonicalSubscriptionStatus
  effectiveTier: UserTier
  overrideState: Omit<DevOverrideState, 'featureOverrides'> & {
    featureOverrides: Partial<Record<string, boolean>>
  }
  decision?: boolean
  denialReason?: EntitlementDecisionReason
  decisionSource?: string
  legacyDecision?: boolean | null
  canonicalDecision?: boolean | null
  trace?: string[]
}
