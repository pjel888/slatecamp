// ---------------------------------------------------------------------------
// Feature Flag Definitions (Layer 1 — zero latency, config-only)
// ---------------------------------------------------------------------------
// These are the static definitions of all feature flags in the system.
// Resolution order: dev override > DB value > config default
// ---------------------------------------------------------------------------

export type FeatureFlagCategory = 'access' | 'org' | 'dev'

export interface FeatureFlagDefinition {
  key: string
  defaultValue: boolean
  description: string
  category: FeatureFlagCategory
}

export const FEATURE_FLAGS = {
  '3d_lab_access': {
    key: '3d_lab_access',
    defaultValue: false,
    description: '3D Lab workspace access',
    category: 'access',
  },
  ai_tutor_access: {
    key: 'ai_tutor_access',
    defaultValue: false,
    description: 'AI Contextual Tutor access',
    category: 'access',
  },
  srs_review_access: {
    key: 'srs_review_access',
    defaultValue: false,
    description: 'Spaced Repetition System review queue',
    category: 'access',
  },
  org_dashboard: {
    key: 'org_dashboard',
    defaultValue: false,
    description: 'Organization admin dashboard',
    category: 'org',
  },
  seat_management: {
    key: 'seat_management',
    defaultValue: false,
    description: 'Organization seat/license management',
    category: 'org',
  },
  dev_badges: {
    key: 'dev_badges',
    defaultValue: false,
    description: 'Show dev info badges on pages',
    category: 'dev',
  },
  dev_console: {
    key: 'dev_console',
    defaultValue: false,
    description: 'Enable /developer console route',
    category: 'dev',
  },
} as const satisfies Record<string, FeatureFlagDefinition>

export type FeatureFlagKey = keyof typeof FEATURE_FLAGS

/**
 * Get the config default value for a flag key.
 */
export function getConfigDefault(key: FeatureFlagKey): boolean {
  return FEATURE_FLAGS[key].defaultValue
}

/**
 * Get all flag definitions, optionally filtered by category.
 */
export function getAllFlags(category?: FeatureFlagCategory): FeatureFlagDefinition[] {
  const all = Object.values(FEATURE_FLAGS)
  if (!category) return all
  return all.filter((f) => f.category === category)
}
