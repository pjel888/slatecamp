/**
 * Memory Strength Engine
 *
 * Implements the Storage Strength (SS) vs Retrieval Strength (RS) model
 * from Bjork & Bjork (1992). SS represents durable, long-term encoding;
 * RS represents current accessibility. SS increases monotonically with
 * diverse practice; RS decays with time but decays slower when SS is high.
 */

// ── Types ────────────────────────────────────────────────────────────────────

export interface PracticeEvent {
  isCorrect: boolean
  difficulty: number // 0–1
  isInterleaved: boolean
}

export type ActivityType =
  | 'quick_refresh'
  | 'full_learning'
  | 'deepen'
  | 'camp_quiz'

export interface ActivityRecommendation {
  type: ActivityType
  questions?: number
  steps?: string[]
}

export type MemoryQuadrant = 'mastered' | 'surface_learning' | 'rusty' | 'needs_learning'

// ── Storage Strength ─────────────────────────────────────────────────────────

/**
 * Update storage strength after a practice event.
 * SS increases monotonically — it never decreases. Interleaved practice
 * and harder questions contribute a larger increment.
 */
export const updateStorageStrength = (
  current: number,
  event: PracticeEvent,
): number => {
  const BASE_INCREMENT = 0.05
  const contextBonus = event.isInterleaved ? 0.1 : 0
  const difficultyBonus = event.difficulty * 0.05

  return Math.min(current + BASE_INCREMENT + contextBonus + difficultyBonus, 1.0)
}

// ── Retrieval Strength ───────────────────────────────────────────────────────

/**
 * Compute current retrieval strength given time elapsed since last review.
 * Decay rate is modulated by storage strength — higher SS means slower decay.
 *
 * RS(t) = lastRS * exp(-decayRate * t)
 * where decayRate = 0.1 / max(SS, 0.1)
 */
export const currentRetrievalStrength = (
  lastRS: number,
  storageSt: number,
  daysSinceReview: number,
): number => {
  const decayRate = 0.1 / Math.max(storageSt, 0.1)
  return lastRS * Math.exp(-decayRate * daysSinceReview)
}

// ── Activity Recommendation ──────────────────────────────────────────────────

/**
 * Route a topic to the right learning activity based on its SS/RS profile.
 * Returns null when a topic is considered mastered (no action needed).
 */
export const recommendActivity = (
  ss: number,
  rs: number,
  _topicId: string,
): ActivityRecommendation | null => {
  // High SS + High RS → Mastered, nothing to do
  if (ss >= 0.7 && rs >= 0.7) return null

  // High SS + Low RS → Knowledge is encoded but not accessible — quick refresh
  if (ss >= 0.7 && rs < 0.5) {
    return { type: 'quick_refresh', questions: 5 }
  }

  // Low SS + Low RS → Needs full learning cycle
  if (ss < 0.4 && rs < 0.5) {
    return { type: 'full_learning', steps: ['wiki', 'camp_quiz'] }
  }

  // Low SS + High RS → Surface learning / cramming — deepen with interleaving
  if (ss < 0.4 && rs >= 0.7) {
    return { type: 'deepen', steps: ['interleaved_quiz'] }
  }

  // Default middle ground — standard practice
  return { type: 'camp_quiz', questions: 10 }
}

// ── Quadrant Classification ──────────────────────────────────────────────────

/**
 * Classify a topic into one of the four SS/RS quadrants.
 */
export const classifyQuadrant = (ss: number, rs: number): MemoryQuadrant => {
  if (ss >= 0.5 && rs >= 0.5) return 'mastered'
  if (ss < 0.5 && rs >= 0.5) return 'surface_learning'
  if (ss >= 0.5 && rs < 0.5) return 'rusty'
  return 'needs_learning'
}
