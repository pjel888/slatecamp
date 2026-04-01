// src/hooks/useReducedMotion.ts — Reads reduced-motion preference from quiz store
// Blueprint H2: All animations must respect prefers-reduced-motion

import { useQuizStore } from '@/stores/useQuizStore'

/** Returns true when animations should be suppressed (instant transitions only) */
export const useReducedMotion = (): boolean => {
  return useQuizStore((s) => s.settings.reducedMotion)
}
