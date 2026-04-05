'use client'

// canvas/InvalidateBridge.tsx
// ─── Demand-mode rendering bridge: Zustand store → R3F invalidate() ────────
// Registers the R3F invalidate function into the store on mount.
// Subscribes to all rendering-relevant state slices and calls invalidate()
// whenever any of them change. This enables frameloop="demand" — the GPU
// only renders when actual changes occur.

import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { useDevControlsStore } from '../stores/useDevControlsStore'

export function InvalidateBridge() {
  const invalidate = useThree((s) => s.invalidate)
  const setInvalidateFn = useDevControlsStore((s) => s.setInvalidateFn)

  // Register the invalidate function on mount, clear on unmount
  useEffect(() => {
    setInvalidateFn(invalidate)
    return () => setInvalidateFn(null)
  }, [invalidate, setInvalidateFn])

  // Subscribe to all store changes and invalidate on any mutation
  useEffect(() => {
    const unsub = useDevControlsStore.subscribe(() => {
      invalidate()
    })
    return unsub
  }, [invalidate])

  return null
}
