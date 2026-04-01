// src/lib/quiz/haptics.ts — Semantic haptic feedback patterns for quiz interactions
// Blueprint §3.6: Differentiated haptic patterns for correct vs incorrect

import { useQuizStore } from '@/stores/useQuizStore'

const isHapticEnabled = (): boolean => {
  if (typeof navigator === 'undefined' || !navigator.vibrate) return false
  return useQuizStore.getState().settings.hapticEnabled
}

/** Light tap — confirms gesture completion (SlideToSubmit threshold reached) */
export const hapticSelect = (): void => {
  if (!isHapticEnabled()) return
  navigator.vibrate(10)
}

/** Short tap — positive reinforcement for correct answer */
export const hapticCorrect = (): void => {
  if (!isHapticEnabled()) return
  navigator.vibrate(10)
}

/** Double-pulse — distinct pattern for incorrect answer */
export const hapticIncorrect = (): void => {
  if (!isHapticEnabled()) return
  navigator.vibrate([20, 50, 20])
}

/** Triple-pulse ascending — achievement/badge unlock */
export const hapticAchievement = (): void => {
  if (!isHapticEnabled()) return
  navigator.vibrate([15, 40, 20, 40, 30])
}
