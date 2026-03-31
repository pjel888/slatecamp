'use client'

import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { useSiteControlsStore } from '../../_stores/siteControlsStore'

/**
 * Registers the R3F Canvas invalidate function into the Zustand store.
 * This bridges demand rendering: store mutations call invalidateFn()
 * to trigger a single re-render instead of running every frame.
 *
 * Must be called inside a <Canvas> component.
 */
export function useInvalidateOnStoreChange() {
  const invalidate = useThree((s) => s.invalidate)
  const setInvalidateFn = useSiteControlsStore((s) => s.setInvalidateFn)

  useEffect(() => {
    setInvalidateFn(invalidate)
    return () => setInvalidateFn(null)
  }, [invalidate, setInvalidateFn])
}
