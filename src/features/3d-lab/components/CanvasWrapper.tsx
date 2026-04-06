'use client'

import { memo, type ReactNode, Suspense, useState, useEffect } from 'react'
import { CanvasLoadingOverlay } from '@/components/r3f/CanvasLoadingOverlay'
import { useInvalidateOnChange } from '@/features/3d-lab/hooks/useInvalidateOnChange'
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
  orthographic?: boolean
  cameraZoom?: number
  flat?: boolean
  disableLighting?: boolean
  disableSceneBase?: boolean
  disableShadows?: boolean
  clearColor?: string
  glConfig?: Record<string, unknown>
}

const InvalidateRegistrar = () => {
  useInvalidateOnChange()
  return null
}

export const CanvasWrapper = memo(function CanvasWrapper({
  children,
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
        <Suspense fallback={null}>{children}</Suspense>
      </SceneTunnel.In>
    </div>
  )
})
