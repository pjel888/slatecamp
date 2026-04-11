import crypto from 'node:crypto'
import { createClient, getUser } from '@/lib/supabase/server'
import type { UserTier } from '@/types/app'
import { logEntitlementAuditEvent } from './audit'
import { type EntitlementFeatureKey, ENTITLEMENT_FEATURE_KEYS } from './feature-keys'
import { normalizeFeatureFlagRecord } from './normalize-feature-flag'
import { normalizeTierValue, toConfigMismatchEvent } from './normalize-tier'
import { resolveDevOverrides } from './dev-overrides'
import { resolveRoleFromInputs } from './resolve-role'
import { buildViewerEntitlements, evaluateFeatureAccess } from './resolve-entitlements'
import type {
  CanonicalSubscriptionStatus,
  ViewerEntitlements,
} from './types'

interface SubscriptionRow {
  tier: string | null
  status: string | null
}

const normalizeSubscriptionStatus = (
  value: string | null,
): CanonicalSubscriptionStatus => {
  if (value === 'active' || value === 'trialing' || value === 'past_due') {
    return value
  }

  if (value === 'canceled') {
    return 'canceled'
  }

  if (value === null) {
    return 'inactive'
  }

  return 'unknown'
}

export const getViewerEntitlements = async (
  featureKeys: EntitlementFeatureKey[] = [],
): Promise<ViewerEntitlements> => {
  const traceId = crypto.randomUUID()
  const supabase = await createClient()
  const {
    data: { user },
  } = await getUser()
  const overrides = await resolveDevOverrides()

  if (!user) {
    const anonymous = buildViewerEntitlements({
      traceId,
      userId: null,
      email: null,
      rawTier: 'free',
      subscriptionStatus: 'inactive',
      roleResolution: resolveRoleFromInputs({}),
      overrides,
      featureFlags: {},
    })

    for (const featureKey of featureKeys) {
      anonymous.decisions[featureKey] = evaluateFeatureAccess(anonymous, featureKey)
    }

    return anonymous
  }

  const [profileResult, roleRowsResult, subscriptionResult, featureFlagsResult] =
    await Promise.all([
      supabase.from('profiles').select('role').eq('id', user.id).maybeSingle(),
      supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('user_subscriptions')
        .select('tier, status')
        .eq('user_id', user.id)
        .maybeSingle(),
      supabase
        .from('feature_flags')
        .select('key, enabled, target_tier, target_roles'),
    ])

  const roleResolution = resolveRoleFromInputs({
    email: user.email,
    appMetadataRole: user.app_metadata?.role,
    userMetadataRole: user.user_metadata?.role,
    profileRole: profileResult.data?.role,
    userRoleRows: roleRowsResult.data ?? [],
    forcedUserIdActive:
      process.env.NODE_ENV === 'development' && Boolean(process.env.DEV_FORCE_USER_ID),
  })

  const subscription = subscriptionResult.data as SubscriptionRow | null
  let rawTier: UserTier = 'free'

  try {
    rawTier = normalizeTierValue(subscription?.tier, 'user_subscriptions.tier').tier
  } catch {
    logEntitlementAuditEvent(
      toConfigMismatchEvent(
        traceId,
        user.id,
        subscription?.tier,
        'user_subscriptions.tier',
      ),
    )
  }

  const normalizedFeatureFlags = Object.fromEntries(
    (featureFlagsResult.data ?? []).map((record) => {
      const normalized = normalizeFeatureFlagRecord(record)

      if (!Object.values(ENTITLEMENT_FEATURE_KEYS).includes(normalized.key as EntitlementFeatureKey)) {
        logEntitlementAuditEvent(
          toConfigMismatchEvent(
            traceId,
            user.id,
            normalized.key,
            'feature_flags.key',
          ),
        )
      }

      if ((record.target_roles ?? []).length > 0) {
        logEntitlementAuditEvent({
          eventName: 'entitlement.config.mismatch',
          timestamp: new Date().toISOString(),
          traceId,
          userId: user.id,
          routeOrAction: 'feature_flags.target_roles',
          featureKey: normalized.key,
          normalizedRole: roleResolution.normalizedRole,
          roleSource: roleResolution.resolvedFrom,
          rawTier,
          subscriptionStatus: normalizeSubscriptionStatus(subscription?.status ?? null),
          effectiveTier: rawTier,
          overrideState: {
            ...overrides,
            featureOverrides: Object.fromEntries(
              Object.entries(overrides.featureOverrides),
            ),
          },
          trace: ['target_roles_present_but_runtime_ignored'],
        })
      }

      return [normalized.key, normalized]
    }),
  ) as ViewerEntitlements['featureFlags']

  const entitlements = buildViewerEntitlements({
    traceId,
    userId: user.id,
    email: user.email ?? null,
    rawTier,
    subscriptionStatus: normalizeSubscriptionStatus(subscription?.status ?? null),
    roleResolution,
    overrides,
    featureFlags: normalizedFeatureFlags,
  })

  for (const featureKey of featureKeys) {
    entitlements.decisions[featureKey] = evaluateFeatureAccess(entitlements, featureKey)
  }

  return entitlements
}
