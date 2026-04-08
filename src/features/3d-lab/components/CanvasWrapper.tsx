'use client'

import { memo, type ReactNode, Suspense, useState, useEffect } from 'react'
import { CanvasLoadingOverlay } from '@/components/r3f/CanvasLoadingOverlay'
import { useInvalidateOnChange } from '@/features/3d-lab/hooks/useInvalidateOnChange'
import { SceneTunnel } from './GlobalCanvasPortal'
import { SceneConfig, type SceneConfigProps } from './rendering/SceneConfig'
import { CameraSync } from './overlays/CameraSync'

interface CanvasWrapperProps {
  children: ReactNode
  /** Scene configuration (camera, controls, lighting, environment).
   *  Defaults to {} — all SceneConfig defaults apply.
   *  Omit only if the consumer manages everything internally (e.g. own makeDefault camera). */
  sceneConfig?: SceneConfigProps
}

const InvalidateRegistrar = () => {
  useInvalidateOnChange()
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
        <Suspense fallback={null}>{children}</Suspense>
      </SceneTunnel.In>
    </div>
  )
})
