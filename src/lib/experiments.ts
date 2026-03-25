// Deterministic variant assignment via hash
export const getVariant = (userId: string, experimentId: string, variants: string[]): string => {
  let hash = 0
  const key = `${userId}:${experimentId}`
  for (let i = 0; i < key.length; i++) {
    hash = ((hash << 5) - hash + key.charCodeAt(i)) | 0
  }
  return variants[Math.abs(hash) % variants.length]
}

export const EXPERIMENTS = {
  SCORE_REVEAL_ZONE_FRAMING: {
    id: 'score_reveal_zone_framing',
    variants: ['control', 'zone_framing'],
    active: false, // Enable when ready
  },
  PAYWALL_TRIGGER_TIMING: {
    id: 'paywall_trigger_timing',
    variants: ['immediate', 'after_second_session'],
    active: false,
  },
  DASHBOARD_ONE_ACTION: {
    id: 'dashboard_one_action',
    variants: ['control', 'one_action'],
    active: false,
  },
} as const
