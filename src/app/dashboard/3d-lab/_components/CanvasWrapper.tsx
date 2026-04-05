'use client'

import { memo, type ReactNode, Suspense, useState, useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { CanvasLoadingOverlay } from '@/components/r3f/CanvasLoadingOverlay'
import { useInvalidateOnChange } from '../_hooks/useInvalidateOnChange'
import { SceneTunnel } from './GlobalCanvasPortal'

interface CanvasWrapperProps {
  children: ReactNode
  minPolarAngle?: number
  maxPolarAngle?: number
  cameraPosition?: [number, number, number]
  cameraFov?: number
  showGround?: boolean
  minDistance?: number
  maxDistance?: number
  /** Use orthographic camera instead of perspective */
  orthographic?: boolean
  /** Orthographic zoom level (only used when orthographic=true) */
  cameraZoom?: number
  /** Disable tone mapping — use for diagrammatic flat-shaded scenes */
  flat?: boolean
  /** Skip StudioLighting — use when providing custom lighting as children */
  disableLighting?: boolean
  /** Skip SceneBase (ground, fog, tone mapping) — use for custom scene setup */
  disableSceneBase?: boolean
  /** Disable shadow casting on Canvas */
  disableShadows?: boolean
  /** Canvas clear color override */
  clearColor?: string
  /** WebGL config overrides */
  glConfig?: Record<string, unknown>
}

/** Renders inside Canvas — registers the R3F invalidate fn into Zustand */
function InvalidateRegistrar() {
  useInvalidateOnChange()
  return null
}

/**
 * Shared Canvas wrapper for all new 3D Lab scenes.
 * Portals content into a persistent Global Canvas via SceneTunnel.
 * Prevents WebGL context proliferation (UX Plan §01, Audit 2026).
 */
export const CanvasWrapper = memo(function CanvasWrapper({
  children,
  minPolarAngle = 0,
  maxPolarAngle = Math.PI / 1.75,
  cameraPosition = [6, 6, 6],
  cameraFov = 35,
  showGround = true,
  minDistance = 3,
  maxDistance = Infinity,
  orthographic = false,
  cameraZoom = 80,
  flat = false,
  disableLighting = false,
  disableSceneBase = false,
  disableShadows = false,
  clearColor,
  glConfig,
}: CanvasWrapperProps) {
  // Use a local state for when the scene is "mounted" into the global canvas
  const [ready, setReady] = useState(false)
  useEffect(() => {
    setReady(true)
    return () => setReady(false)
  }, [])

  return (
    <div className="relative h-full w-full overflow-hidden pointer-events-none">
      {/* Loading overlay */}
      <CanvasLoadingOverlay visible={!ready} />

      {/* 
         Content is portaled into the persistent Global Canvas.
         This prevents WebGL context re-initialization on navigation.
      */}
      <SceneTunnel.In>
        <InvalidateRegistrar />
        
        {/*
           Scene-specific lighting / base logic could go here if needed,
           but ideally layout handles common defaults.
        */}
        
        <Suspense fallback={null}>
          {children}
        </Suspense>
      </SceneTunnel.In>
    </div>
  )
})
