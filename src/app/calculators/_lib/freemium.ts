// src/app/calculators/_lib/freemium.ts
// Freemium gate constants. In production, isPremium comes from the auth context.
// For now, hardcode to false so all gates are visible during development.

/** Whether the current user has premium access. Hardcoded for development. */
export const IS_PREMIUM = false

/** Maximum free openings before requiring premium */
export const MAX_FREE_OPENINGS = 2

/** Maximum free exclusions before requiring premium */
export const MAX_FREE_EXCLUSIONS = 2

/** Check if user can add more items */
export function canAddMore(currentCount: number, max: number): boolean {
  return IS_PREMIUM || currentCount < max
}

/** Gate message for when limit is reached */
export function gateMessage(featureName: string): string {
  return `Upgrade to Pro for more ${featureName}`
}
