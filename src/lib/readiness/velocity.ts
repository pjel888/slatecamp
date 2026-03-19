/**
 * Score Velocity — DS Report: "pts/day over 7d"
 * Velocity states:
 *   > +0.8 pts/day  = Accelerating
 *   +0.2 to +0.8    = Steady
 *   -0.2 to +0.2    = Plateaued
 *   < -0.2          = Declining
 */

type VelocityState = 'accelerating' | 'steady' | 'plateaued' | 'declining'

export const computeScoreVelocity = (
  snapshots: { score: number; computed_at: string }[]
): { velocity: number; state: VelocityState } => {
  if (snapshots.length < 2) return { velocity: 0, state: 'plateaued' }

  const sorted = [...snapshots].sort(
    (a, b) => new Date(b.computed_at).getTime() - new Date(a.computed_at).getTime()
  )

  const latest = sorted[0]
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const baseline =
    sorted.find((s) => new Date(s.computed_at) <= sevenDaysAgo) || sorted[sorted.length - 1]

  const daysDelta =
    (new Date(latest.computed_at).getTime() - new Date(baseline.computed_at).getTime()) /
    (1000 * 60 * 60 * 24)

  if (daysDelta === 0) return { velocity: 0, state: 'plateaued' }

  const velocity = (latest.score - baseline.score) / daysDelta

  const state: VelocityState =
    velocity > 0.8
      ? 'accelerating'
      : velocity > 0.2
        ? 'steady'
        : velocity > -0.2
          ? 'plateaued'
          : 'declining'

  return { velocity: Math.round(velocity * 100) / 100, state }
}
