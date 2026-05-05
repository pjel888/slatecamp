import { cookies } from 'next/headers'
import type { UserTier } from '@/types/app'
import {
  ENTITLEMENT_FEATURE_KEYS,
  type EntitlementFeatureKey,
} from './feature-keys'
import type { DevOverrideState } from './types'
import { isCanonicalTier } from './normalize-tier'
import {
  isDevForceUserAllowed,
  isDevPortalBypassAllowed,
} from '@/lib/env/production-guardrails'

export const DEV_OVERRIDE_COOKIE_NAME = 'cerebro_dev_flags'

export interface DevOverrideCookiePayload {
  simulatedTier?: UserTier | null
  spoofedTier?: UserTier | null
  bypass3dGate?: boolean
  bypassAiGate?: boolean
  bypassSrsGate?: boolean
}

export type FeatureFlags = DevOverrideCookiePayload

const EMPTY_OVERRIDES: DevOverrideState = {
  simulatedTier: null,
  legacySpoofedTier: null,
  forcedTier: null,
  forcedUserIdActive: false,
  localDevBypassActive: false,
  allowDevPortalBypass: false,
  featureOverrides: {},
  sourceTrace: [],
}

const parseTier = (value: unknown): UserTier | null =>
  isCanonicalTier(value) ? value : null

export const readDevOverrideCookie = async (): Promise<DevOverrideCookiePayload> => {
  try {
    const cookieStore = await cookies()
    const raw = cookieStore.get(DEV_OVERRIDE_COOKIE_NAME)?.value
    if (!raw) {
      return {}
    }

    return JSON.parse(raw) as DevOverrideCookiePayload
  } catch {
    return {}
  }
}

export const resolveDevOverrides = async (): Promise<DevOverrideState> => {
  const cookiePayload = await readDevOverrideCookie()
  const featureOverrides: Partial<Record<EntitlementFeatureKey, boolean>> = {}
  const sourceTrace: string[] = []

  if (cookiePayload.bypass3dGate) {
    featureOverrides[ENTITLEMENT_FEATURE_KEYS.threeDLabFull] = true
    sourceTrace.push('cookie:bypass3dGate')
  }

  if (cookiePayload.bypassAiGate) {
    featureOverrides[ENTITLEMENT_FEATURE_KEYS.aiAssistantUnlimited] = true
    sourceTrace.push('cookie:bypassAiGate')
  }

  if (cookiePayload.bypassSrsGate) {
    featureOverrides[ENTITLEMENT_FEATURE_KEYS.srsReview] = true
    sourceTrace.push('cookie:bypassSrsGate')
  }

  const simulatedTier = parseTier(cookiePayload.simulatedTier)
  const legacySpoofedTier = parseTier(cookiePayload.spoofedTier)
  const forcedTier = parseTier(process.env.DEV_FORCE_TIER)
  const forcedUserIdActive = isDevForceUserAllowed()
  const localDevBypassActive =
    process.env.NODE_ENV === 'development' && !process.env.NEXT_PUBLIC_SUPABASE_URL
  const allowDevPortalBypass = isDevPortalBypassAllowed()

  if (simulatedTier) {
    sourceTrace.push(`cookie:simulatedTier(${simulatedTier})`)
  }

  if (legacySpoofedTier) {
    sourceTrace.push(`cookie:spoofedTier(${legacySpoofedTier})`)
  }

  if (forcedTier) {
    sourceTrace.push(`env:DEV_FORCE_TIER(${forcedTier})`)
  }

  if (forcedUserIdActive) {
    sourceTrace.push('env:DEV_FORCE_USER_ID')
  }

  if (localDevBypassActive) {
    sourceTrace.push('env:local-dev-bypass')
  }

  if (allowDevPortalBypass) {
    sourceTrace.push('env:ALLOW_DEV_PORTAL_BYPASS')
  }

  return {
    ...EMPTY_OVERRIDES,
    simulatedTier: simulatedTier ?? legacySpoofedTier ?? null,
    legacySpoofedTier,
    forcedTier,
    forcedUserIdActive,
    localDevBypassActive,
    allowDevPortalBypass,
    featureOverrides,
    sourceTrace,
  }
}

export const serializeDevOverrides = (
  overrides: DevOverrideCookiePayload,
): string => JSON.stringify(overrides)
