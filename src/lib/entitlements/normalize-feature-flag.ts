import type { UserTier } from '@/types/app'
import {
  ENTITLEMENT_FEATURE_KEYS,
  type EntitlementFeatureKey,
} from './feature-keys'
import type { NormalizedFeatureFlag } from './types'
import { normalizeTierValue } from './normalize-tier'

interface RawFeatureFlagRecord {
  key: string
  enabled: boolean | null
  target_tier?: string[] | null
  target_roles?: string[] | null
}

const ALL_PAID_TIERS: UserTier[] = ['pro', 'prime', 'institutional', 'enterprise']

const DB_KEY_SET = new Set<string>(
  Object.values(ENTITLEMENT_FEATURE_KEYS).filter(
    (key) => !key.startsWith('dev_') && !key.endsWith('_portal'),
  ),
)

export const isKnownFeatureKey = (value: string): value is EntitlementFeatureKey =>
  DB_KEY_SET.has(value)

export const normalizeFeatureFlagRecord = (
  record: RawFeatureFlagRecord,
): NormalizedFeatureFlag => {
  const rawTargetTier = record.target_tier ?? []
  const normalizationTrace = [`key:${record.key}`]

  const hasLegacyPaidShape =
    rawTargetTier.length > 0 &&
    rawTargetTier.every((value) =>
      ['camp', 'insurance', 'institutional'].includes(value),
    ) &&
    !rawTargetTier.some((value) => ['pro', 'prime', 'enterprise'].includes(value))

  const allowedTiers = hasLegacyPaidShape
    ? (() => {
        normalizationTrace.push('legacy-paid-shape=>all-paid')
        return ALL_PAID_TIERS
      })()
    : rawTargetTier.reduce<UserTier[]>((tiers, value) => {
        try {
          const normalized = normalizeTierValue(
            value,
            `feature_flags.${record.key}.target_tier`,
          ).tier
          if (!tiers.includes(normalized)) {
            tiers.push(normalized)
          }
        } catch {
          normalizationTrace.push(`unknown-tier:${value}`)
        }
        return tiers
      }, [])

  return {
    key: record.key,
    enabled: record.enabled !== false,
    allowedTiers,
    rawTargetTier,
    rawTargetRoles: record.target_roles ?? [],
    normalizationTrace,
  }
}
