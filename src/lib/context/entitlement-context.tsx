'use client'

import { createContext, useContext, useMemo } from 'react'
import type { ViewerEntitlements } from '@/lib/entitlements/types'
import { evaluateFeatureAccess } from '@/lib/entitlements/resolve-entitlements'
import type { EntitlementFeatureKey } from '@/lib/entitlements/feature-keys'

interface EntitlementContextValue {
  entitlements: ViewerEntitlements
  canAccess: (featureKey: EntitlementFeatureKey) => boolean
}

const DEFAULT_ENTITLEMENTS = {
  traceId: 'client-default',
  userId: null,
  email: null,
  normalizedRole: 'anonymous',
  compatibilityRole: null,
  roleResolution: {
    normalizedRole: 'anonymous',
    compatibilityRole: null,
    resolvedFrom: 'none',
    roleSources: ['none'],
    precedenceTrace: ['fallback=>anonymous'],
  },
  rawTier: 'free',
  subscriptionStatus: 'inactive',
  effectiveTier: 'free',
  capabilities: {
    questionsPerDay: 50,
    aiTokens: 0,
    savedConfigs: 0,
    srsAccess: false,
    threeDLabAccess: false,
    aiTutorAccess: false,
    customBanksAccess: false,
  },
  tooling: {
    developerPortal: false,
    devToolbar: false,
    devOverrideWrite: false,
    internalTierBypass: false,
    adminCms: false,
    canReviewContent: false,
    canManageUsers: false,
    ceoPortal: false,
  },
  overrides: {
    simulatedTier: null,
    legacySpoofedTier: null,
    forcedTier: null,
    forcedUserIdActive: false,
    localDevBypassActive: false,
    allowDevPortalBypass: false,
    featureOverrides: {},
    sourceTrace: [],
  },
  featureFlags: {},
  decisions: {},
  permissions: [],
} as unknown as ViewerEntitlements

const EntitlementContext = createContext<EntitlementContextValue>({
  entitlements: DEFAULT_ENTITLEMENTS,
  canAccess: () => false,
})

export const useEntitlements = (): EntitlementContextValue =>
  useContext(EntitlementContext)

export const EntitlementProvider = ({
  children,
  entitlements,
}: {
  children: React.ReactNode
  entitlements: ViewerEntitlements
}) => {
  const value = useMemo<EntitlementContextValue>(
    () => ({
      entitlements,
      canAccess: (featureKey) => evaluateFeatureAccess(entitlements, featureKey).allowed,
    }),
    [entitlements],
  )

  return (
    <EntitlementContext.Provider value={value}>
      {children}
    </EntitlementContext.Provider>
  )
}
