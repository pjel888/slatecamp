'use client'

import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { useSiteControlsStore } from '../../_stores/siteControlsStore'

/**
 * Registers the R3F Canvas invalidate function into the Zustand store,
 * then triggers an initial render. Without this kick, frameloop="demand"
 * never renders the first frame because no store mutation has occurred yet.
 */
export function useInvalidateOnStoreChange() {
  const invalidate = useThree((s) => s.invalidate)
  const setInvalidateFn = useSiteControlsStore((s) => s.setInvalidateFn)

  useEffect(() => {
    setInvalidateFn(invalidate)
    // Kick an initial render so the scene is visible on mount
    invalidate()
    return () => setInvalidateFn(null)
  }, [invalidate, setInvalidateFn])
}
