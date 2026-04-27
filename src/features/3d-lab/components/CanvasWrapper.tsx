'use client'

import { memo, type ReactNode, Suspense, useState, useEffect } from 'react'
import { CanvasLoadingOverlay } from '@/components/r3f/CanvasLoadingOverlay'
import { useRegisterInvalidate } from '@/components/r3f/useRegisterInvalidate'
import { useViewportShellStore } from '@/features/3d-lab/stores/useViewportShellStore'
import { useCameraSnap } from '@/features/3d-lab/hooks/useCameraSnap'
import { SceneTunnel } from './GlobalCanvasPortal'
import { SceneConfig, type SceneConfigProps } from './rendering/SceneConfig'
import { CameraSync } from './overlays/CameraSync'
import { SceneGround } from './shell/SceneGround'

interface CanvasWrapperProps {
  children: ReactNode
  /** Scene configuration (camera, controls, lighting, environment).
   *  Defaults to {} — all SceneConfig defaults apply.
   *  Omit only if the consumer manages everything internally (e.g. own makeDefault camera). */
  sceneConfig?: SceneConfigProps
}

const InvalidateRegistrar = () => {
  // Register R3F invalidate into the viewport shell store so toolbar toggles
  // (grid, xray, dimensions) and camera presets can trigger scene re-renders.
  const setViewportInvalidateFn = useViewportShellStore((s) => s.setInvalidateFn)
  useRegisterInvalidate(setViewportInvalidateFn)
  useCameraSnap()
  return null
}

export const CanvasWrapper = memo(function CanvasWrapper({
  children,
  sceneConfig = {},
}: CanvasWrapperProps) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setReady(true)
    return () => setReady(false)
  }, [])

  return (
    <div className="relative h-full w-full overflow-hidden pointer-events-none">
      <CanvasLoadingOverlay visible={!ready} />
      <SceneTunnel.In>
        <InvalidateRegistrar />
        <SceneConfig {...sceneConfig} />
        <CameraSync />
        <SceneGround />
        <Suspense fallback={null}>{children}</Suspense>
      </SceneTunnel.In>
    </div>
  )
})
