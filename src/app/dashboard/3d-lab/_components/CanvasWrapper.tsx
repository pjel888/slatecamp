'use client'

import { memo, type ReactNode, Suspense, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { CircleNotch } from '@phosphor-icons/react/dist/ssr'
import { SCIcon } from '@/components/graphics/icons/Icon'
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
}: CanvasWrapperProps) {
  const [canvasReady, setCanvasReady] = useState(false)

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Loading overlay — removed once Canvas WebGL context is created */}
      {!canvasReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#EEF2FA]/80 z-10">
          <div className="flex flex-col items-center gap-3">
            <SCIcon icon={CircleNotch} size="lg" className="animate-spin text-zinc-300" />
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-400">
              Loading Scene...
            </span>
          </div>
        </div>
      )}

      <Canvas
        frameloop="demand"
        dpr={[1, 1.5]}
        camera={{ position: cameraPosition, fov: cameraFov }}
        shadows
        style={{ position: 'absolute', inset: 0 }}
        onCreated={() => setCanvasReady(true)}
      >
        <InvalidateRegistrar />

        {/* Architectural studio lighting rig (UX Plan §02) */}
        <StudioLighting />

        {/* Sky + ground + fog + contact shadows (UX Plan §01) */}
        <SceneBase showGround={showGround} />

        <OrbitControls
          makeDefault
          minPolarAngle={minPolarAngle}
          maxPolarAngle={maxPolarAngle}
          minDistance={minDistance}
          maxDistance={maxDistance}
        />
        <Suspense fallback={null}>{children}</Suspense>
      </Canvas>
    </div>
  )
})
