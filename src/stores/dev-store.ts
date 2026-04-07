import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { UserTier, UserType, OrgMemberRole } from '@/types/app'
import type { FeatureFlagKey } from '@/config/feature-flags'

// ---------------------------------------------------------------------------
// Impersonation Presets
// ---------------------------------------------------------------------------

export interface ImpersonationPreset {
  id: string
  label: string
  description: string
  role: string
  tier: UserTier
  userType: UserType
  orgId: string | null
}

export const IMPERSONATION_PRESETS: ImpersonationPreset[] = [
  {
    id: 'ale_reviewer',
    label: 'ALE Reviewer',
    description: 'Primary target: Board exam candidate using Camp tier',
    role: 'user',
    tier: 'camp',
    userType: 'regular',
    orgId: null,
  },
  {
    id: 'arch_student',
    label: 'Architecture Student',
    description: 'B2C free-tier individual learner',
    role: 'user',
    tier: 'free',
    userType: 'regular',
    orgId: null,
  },
  {
    id: 'ust_student',
    label: 'UST Student',
    description: 'B2B2C institutional member',
    role: 'user',
    tier: 'institutional',
    userType: 'educational',
    orgId: 'ust-placeholder',
  },
  {
    id: 'aecom_employee',
    label: 'AECOM Employee',
    description: 'B2B corporate member',
    role: 'user',
    tier: 'insurance',
    userType: 'corporate',
    orgId: 'aecom-placeholder',
  },
  {
    id: 'university_dean',
    label: 'University Dean',
    description: 'B2B2C org admin (educational)',
    role: 'admin',
    tier: 'institutional',
    userType: 'educational',
    orgId: 'ust-placeholder',
  },
  {
    id: 'sme_admin',
    label: 'SME / Content Admin',
    description: 'Content management role',
    role: 'content_admin',
    tier: 'institutional',
    userType: 'regular',
    orgId: null,
  },
  {
    id: 'super_admin',
    label: 'Super Admin',
    description: 'Full platform access',
    role: 'super_admin',
    tier: 'institutional',
    userType: 'regular',
    orgId: null,
  },
]

// ---------------------------------------------------------------------------
// Store Interface
// ---------------------------------------------------------------------------

interface DevState {
  // Impersonation
  isImpersonating: boolean
  impersonatedRole: string | null
  impersonatedTier: UserTier | null
  impersonatedOrgId: string | null
  impersonatedUserType: UserType | null
  activePresetId: string | null

  // Feature flag overrides (dev only)
  featureOverrides: Partial<Record<FeatureFlagKey, boolean>>

  // UI state
  isOverlayOpen: boolean
  showDevBadges: boolean

  // Actions
  impersonateAs: (preset: ImpersonationPreset) => void
  stopImpersonating: () => void
  setFeatureOverride: (key: FeatureFlagKey, value: boolean | null) => void
  clearFeatureOverrides: () => void
  toggleOverlay: () => void
  setOverlayOpen: (open: boolean) => void
  toggleDevBadges: () => void
}

// ---------------------------------------------------------------------------
// Store (persisted to sessionStorage — clears on tab close for security)
// ---------------------------------------------------------------------------

export const useDevStore = create<DevState>()(
  persist(
    (set) => ({
      // Impersonation defaults
      isImpersonating: false,
      impersonatedRole: null,
      impersonatedTier: null,
      impersonatedOrgId: null,
      impersonatedUserType: null,
      activePresetId: null,

      // Feature overrides
      featureOverrides: {},

      // UI
      isOverlayOpen: false,
      showDevBadges: false,

      // Actions
      impersonateAs: (preset) =>
        set({
          isImpersonating: true,
          impersonatedRole: preset.role,
          impersonatedTier: preset.tier,
          impersonatedOrgId: preset.orgId,
          impersonatedUserType: preset.userType,
          activePresetId: preset.id,
        }),

      stopImpersonating: () =>
        set({
          isImpersonating: false,
          impersonatedRole: null,
          impersonatedTier: null,
          impersonatedOrgId: null,
          impersonatedUserType: null,
          activePresetId: null,
        }),

      setFeatureOverride: (key, value) =>
        set((state) => {
          const next = { ...state.featureOverrides }
          if (value === null) {
            delete next[key]
          } else {
            next[key] = value
          }
          return { featureOverrides: next }
        }),

      clearFeatureOverrides: () => set({ featureOverrides: {} }),

      toggleOverlay: () => set((s) => ({ isOverlayOpen: !s.isOverlayOpen })),
      setOverlayOpen: (open) => set({ isOverlayOpen: open }),
      toggleDevBadges: () => set((s) => ({ showDevBadges: !s.showDevBadges })),
    }),
    {
      name: 'cerebro-dev-store',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' && process.env.NODE_ENV !== 'production'
          ? sessionStorage
          : {
              getItem: () => null,
              setItem: () => {},
              removeItem: () => {},
            },
      ),
      partialize: (state) => ({
        isImpersonating: state.isImpersonating,
        impersonatedRole: state.impersonatedRole,
        impersonatedTier: state.impersonatedTier,
        impersonatedOrgId: state.impersonatedOrgId,
        impersonatedUserType: state.impersonatedUserType,
        activePresetId: state.activePresetId,
        featureOverrides: state.featureOverrides,
        showDevBadges: state.showDevBadges,
      }),
    },
  ),
)
