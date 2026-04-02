// src/components/r3f/useRegisterInvalidate.ts
// Generic invalidation bridge — registers R3F invalidate() into any Zustand store.
// Shared between 3D Lab (via wrapper hooks) and Calculator Suite (directly).

import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'

/**
 * Registers R3F's `invalidate()` function into a Zustand store so that
 * UI controls outside the Canvas can trigger on-demand re-renders without
 * causing React reconciliation inside the Canvas tree.
 *
 * Works with `frameloop="demand"` — the Canvas renders zero frames until
 * invalidate() is called.
 *
 * @param setInvalidateFn — The store's setter for the invalidate function.
 *   Obtained via a selector: `useMyStore((s) => s.setInvalidateFn)`
 *
 * @example
 * // Inside a Canvas child component:
 * const setInvalidateFn = useMyStore((s) => s.setInvalidateFn)
 * useRegisterInvalidate(setInvalidateFn)
 */
export function useRegisterInvalidate(
  setInvalidateFn: (fn: (() => void) | null) => void,
) {
  const { invalidate } = useThree()

  useEffect(() => {
    setInvalidateFn(invalidate)
    return () => setInvalidateFn(null)
  }, [invalidate, setInvalidateFn])
}
