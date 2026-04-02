// src/components/r3f/SceneInvalidator.tsx
// Version-counter-based invalidation bridge for Calculator Suite stores.
// Watches a numeric version counter in a Zustand store and calls R3F
// invalidate() when it changes. This is the sole render trigger for
// calculator tools using frameloop="demand".
'use client'

import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'

interface SceneInvalidatorProps {
  /**
   * The current version counter value from the store.
   * Pass via a Zustand selector: `useMyStore((s) => s.inputVersion)`
   */
  inputVersion: number
}

/**
 * Watches a version counter and calls invalidate() when it changes.
 * Mount inside a Canvas as a direct child or inside Suspense.
 *
 * This is the ONLY place invalidate() should be called in response to
 * user input in Calculator Suite tools. Individual scene components
 * must NOT call invalidate() themselves.
 *
 * @example
 * // Inside Canvas:
 * const inputVersion = useFlooringStore((s) => s.inputVersion)
 * <SceneInvalidator inputVersion={inputVersion} />
 */
export function SceneInvalidator({ inputVersion }: SceneInvalidatorProps) {
  const invalidate = useThree((s) => s.invalidate)

  useEffect(() => {
    invalidate()
  }, [inputVersion, invalidate])

  return null
}
