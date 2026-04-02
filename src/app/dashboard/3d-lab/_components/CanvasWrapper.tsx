'use client'

import { memo, type ReactNode, Suspense, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { CanvasLoadingOverlay } from '@/components/r3f/CanvasLoadingOverlay'
import { useInvalidateOnChange } from '../_hooks/useInvalidateOnChange'
import { SceneBase } from './SceneBase'
import { StudioLighting } from './StudioLighting'

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
 * Uses frameloop="demand" + Zustand invalidate bridge for zero-waste rendering.
 *
 * Loading overlay is shown only until the Canvas WebGL context is created,
 * then hidden. Without this gate the spinner would overlay the scene permanently.
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
  const [canvasReady, setCanvasReady] = useState(false)

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Loading overlay — removed once Canvas WebGL context is created */}
      <CanvasLoadingOverlay visible={!canvasReady} />

      <Canvas
        frameloop="demand"
        dpr={[1, 1.5]}
        camera={
          orthographic
            ? { position: cameraPosition, zoom: cameraZoom, near: 0.1, far: 100 }
            : { position: cameraPosition, fov: cameraFov }
        }
        orthographic={orthographic}
        flat={flat}
        shadows={!disableShadows}
        gl={glConfig}
        style={{ position: 'absolute', inset: 0 }}
        onCreated={(state) => {
          if (clearColor) {
            state.gl.setClearColor(clearColor)
          }
          setCanvasReady(true)
        }}
      >
        <InvalidateRegistrar />

        {/* Architectural studio lighting rig (UX Plan §02) */}
        {!disableLighting && <StudioLighting />}

        {/* Sky + ground + fog + contact shadows (UX Plan §01) */}
        {!disableSceneBase && <SceneBase showGround={showGround} />}

        <OrbitControls
          makeDefault
          minPolarAngle={minPolarAngle}
          maxPolarAngle={maxPolarAngle}
          {...(orthographic
            ? { minZoom: 30, maxZoom: 200, enableDamping: true, dampingFactor: 0.1 }
            : { minDistance, maxDistance }
          )}
        />
        <Suspense fallback={null}>{children}</Suspense>
      </Canvas>
    </div>
  )
})
