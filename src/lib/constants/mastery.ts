/**
 * Mastery level thresholds.
 * Used across analytics, dashboard, and focus review features.
 * Changing these values affects how mastery is displayed everywhere.
 */
export const MASTERY_THRESHOLDS = {
  STRONG: 0.76,
  DEVELOPING: 0.51,
  BUILDING: 0.26,
} as const

export type MasteryLevel = 'Strong' | 'Developing' | 'Building' | 'Exploring'

export const getMasteryLevel = (weight: number): MasteryLevel => {
  if (weight >= MASTERY_THRESHOLDS.STRONG) return 'Strong'
  if (weight >= MASTERY_THRESHOLDS.DEVELOPING) return 'Developing'
  if (weight >= MASTERY_THRESHOLDS.BUILDING) return 'Building'
  return 'Exploring'
}
