'use client'

import { memo, type ReactNode, Suspense, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, ContactShadows } from '@react-three/drei'
import { Loader2 } from 'lucide-react'
import { useInvalidateOnChange } from '../_hooks/useInvalidateOnChange'

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
  maxDistance = 20,
}: CanvasWrapperProps) {
  const [canvasReady, setCanvasReady] = useState(false)

  return (
    <div className="relative h-full w-full rounded-md border border-border bg-[#FBFBFA] overflow-hidden">
      {/* Loading overlay — removed once Canvas WebGL context is created */}
      {!canvasReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-50/50 z-10">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-zinc-300" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">
              Loading Scene...
            </span>
          </div>
        </div>
      )}

      <Canvas
        frameloop="demand"
        dpr={[1, 1.5]}
        camera={{ position: cameraPosition, fov: cameraFov }}
        shadows={false}
        style={{ position: 'absolute', inset: 0 }}
        onCreated={() => setCanvasReady(true)}
      >
        <InvalidateRegistrar />
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={1.2} />
        <OrbitControls
          makeDefault
          minPolarAngle={minPolarAngle}
          maxPolarAngle={maxPolarAngle}
          minDistance={minDistance}
          maxDistance={maxDistance}
        />
        {showGround && (
          <ContactShadows
            position={[0, -0.01, 0]}
            opacity={0.25}
            scale={20}
            blur={2}
            far={5}
          />
        )}
        <Suspense fallback={null}>{children}</Suspense>
      </Canvas>
    </div>
  )
})
