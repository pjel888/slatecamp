'use client'

import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { useLabStore } from '../_stores/labStore'

/**
 * Call this inside an R3F Canvas component.
 * Registers the R3F `invalidate` function into the Zustand store so that
 * 2D UI sliders can trigger on-demand Canvas re-renders without causing
 * React re-renders inside the Canvas tree.
 *
 * Works in tandem with frameloop="demand" on the Canvas.
 */
export function useInvalidateOnChange() {
  const { invalidate } = useThree()
  const setInvalidateFn = useLabStore((s) => s.setInvalidateFn)

  useEffect(() => {
    setInvalidateFn(invalidate)
    return () => setInvalidateFn(null)
  }, [invalidate, setInvalidateFn])
}
