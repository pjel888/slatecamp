'use client'

import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { useSiteControlsStore } from '../../_stores/siteControlsStore'

/**
 * Bridges Zustand store changes to R3F's demand-mode invalidation.
 * Without this, slider changes won't trigger re-renders in frameloop="demand".
 */
export function useInvalidateOnStoreChange(): void {
  const invalidate = useThree((s) => s.invalidate)

  // Register invalidate fn in store so 2D controls can trigger Canvas re-renders
  useEffect(() => {
    useSiteControlsStore.getState().setInvalidateFn(invalidate)
    return () => useSiteControlsStore.getState().setInvalidateFn(null)
  }, [invalidate])

  // Subscribe to every store value that affects 3D rendering
  const lotWidth = useSiteControlsStore((s) => s.inputs.lotWidth)
  const lotDepth = useSiteControlsStore((s) => s.inputs.lotDepth)
  const numFloors = useSiteControlsStore((s) => s.inputs.numFloors)
  const floorHeight = useSiteControlsStore((s) => s.inputs.floorHeight)
  const zoningClass = useSiteControlsStore((s) => s.inputs.zoningClass)
  const rrowWidth = useSiteControlsStore((s) => s.inputs.rrowWidth)
  const activeZone = useSiteControlsStore((s) => s.activeZone)
  const showDimensions = useSiteControlsStore((s) => s.showDimensions)
  const viewMode = useSiteControlsStore((s) => s.viewMode)
  const tourStep = useSiteControlsStore((s) => s.tourStep)

  useEffect(() => {
    invalidate()
  }, [lotWidth, lotDepth, numFloors, floorHeight, zoningClass, rrowWidth, activeZone, showDimensions, viewMode, tourStep, invalidate])
}

export default function InvalidateOnChange() {
  useInvalidateOnStoreChange()
  return null
}
