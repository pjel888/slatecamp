'use client'

// src/features/3d-lab/components/rendering/AssetPreloader.tsx
// Wraps scene children in Suspense and tracks asset loading progress via drei's useProgress.

import { Suspense } from 'react'
import { useProgress } from '@react-three/drei'
import { LoadingProgress } from '@/components/r3f/LoadingProgress'

// ─── ProgressOverlay ─────────────────────────────────────────────────────────

/**
 * DOM-side overlay that reads drei's global useProgress state.
 * Rendered outside the Canvas so it stays visible while WebGL assets load.
 */
const ProgressOverlay = () => {
  const { progress, active } = useProgress()

  if (!active && progress >= 100) return null

  return (
    <LoadingProgress
      visible={active || progress < 100}
      progress={progress}
      message="Loading Assets..."
    />
  )
}

// ─── AssetPreloader ───────────────────────────────────────────────────────────

interface AssetPreloaderProps {
  /** R3F scene content that may suspend while loading assets */
  children: React.ReactNode
  /** Optional fallback shown inside the Canvas during Suspense (defaults to null) */
  canvasFallback?: React.ReactNode
}

/**
 * AssetPreloader — wraps R3F scene children in a Suspense boundary and
 * projects loading progress from drei's useProgress onto a DOM overlay.
 *
 * Usage (inside a Canvas):
 *   <AssetPreloader>
 *     <MyScene />
 *   </AssetPreloader>
 *
 * The ProgressOverlay sibling must be rendered outside the Canvas in the
 * parent component tree (e.g. LabViewportFrame) so it is visible over the
 * WebGL surface during asset loading.
 */
export const AssetPreloader = ({ children, canvasFallback = null }: AssetPreloaderProps) => {
  return (
    <Suspense fallback={canvasFallback}>
      {children}
    </Suspense>
  )
}

// Re-export ProgressOverlay so callers can place it in the DOM layer
export { ProgressOverlay as AssetProgressOverlay }
