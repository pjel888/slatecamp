// src/app/dashboard/3d-lab/_hooks/useNBCPInvalidateOnChange.ts
'use client'

import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { useNBCPStore } from '../_stores/nbcpStore'

/**
 * Registers the R3F `invalidate` function into the NBCP Zustand store.
 * Call this inside an R3F Canvas component (NBCPScene.tsx).
 *
 * Mirrors useInvalidateOnChange.ts exactly but wired to useNBCPStore,
 * keeping the two stores completely independent.
 */
export function useNBCPInvalidateOnChange() {
  const { invalidate } = useThree()
  const setInvalidateFn = useNBCPStore((s) => s.setInvalidateFn)

  useEffect(() => {
    setInvalidateFn(invalidate)
    return () => setInvalidateFn(null)
  }, [invalidate, setInvalidateFn])
}
