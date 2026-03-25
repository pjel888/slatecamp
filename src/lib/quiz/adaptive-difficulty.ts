// ─── Adaptive Difficulty Algorithm (Doc 4 §3.3) ─────────────────────────────
// Wilson et al., 2019: The 85% Rule — optimal learning occurs at 85% accuracy

import type { AdaptiveState } from '@/types/quiz-config'

/** Default adaptive state for a new session */
export const createAdaptiveState = (initialDifficulty: number = 3): AdaptiveState => ({
  recentWindow: [],
  currentAccuracy: 0,
  targetAccuracy: 0.85,
  currentDifficulty: initialDifficulty,
})

/** Update adaptive state after an answer */
export const updateAdaptiveState = (
  state: AdaptiveState,
  isCorrect: boolean,
): AdaptiveState => {
  const WINDOW_SIZE = 5
  const recentWindow = [...state.recentWindow, isCorrect].slice(-WINDOW_SIZE)
  const currentAccuracy = recentWindow.length > 0
    ? recentWindow.filter(Boolean).length / recentWindow.length
    : 0

  let currentDifficulty = state.currentDifficulty

  // Only adjust after we have enough data (at least 3 answers)
  if (recentWindow.length >= 3) {
    if (currentAccuracy >= 0.90) {
      // Too easy — increase difficulty
      currentDifficulty = Math.min(5, currentDifficulty + 1)
    } else if (currentAccuracy <= 0.60) {
      // Too hard — decrease difficulty
      currentDifficulty = Math.max(1, currentDifficulty - 1)
    }
    // 60-90% → stay at current difficulty (sweet spot)
  }

  return {
    recentWindow,
    currentAccuracy,
    targetAccuracy: state.targetAccuracy,
    currentDifficulty,
  }
}

/** Map difficulty level (1-5) to a human label */
export const getDifficultyLabel = (level: number): 'Easy' | 'Medium' | 'Hard' => {
  if (level <= 2) return 'Easy'
  if (level <= 4) return 'Medium'
  return 'Hard'
}

/** Map user mastery to an initial difficulty estimate */
export const masteryToDifficulty = (mastery: number): number => {
  if (mastery >= 0.8) return 4
  if (mastery >= 0.6) return 3
  if (mastery >= 0.4) return 2
  return 1
}
