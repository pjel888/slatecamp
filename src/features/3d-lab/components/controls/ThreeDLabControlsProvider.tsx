'use client'

import { useEffect, type ReactNode } from 'react'
import type { CameraSelectionPreset } from '@/features/3d-lab/utils/camera-presets'
import { useViewportShellStore } from '@/features/3d-lab/stores/useViewportShellStore'

export interface ThreeDLabCameraPreset {
  position: [number, number, number]
  target: [number, number, number]
  fov?: number
  zoom?: number
}

export interface ThreeDLabCameraControlConfig {
  presets?: Partial<Record<CameraSelectionPreset, ThreeDLabCameraPreset>>
  zoomToFit?: ThreeDLabCameraPreset
  resetPreset?: CameraSelectionPreset
  minDistance?: number
  maxDistance?: number
  minPanTargetDistance?: number
  minPolarAngle?: number
  maxPolarAngle?: number
}

export const THREE_D_LAB_CONTROL_MAPPING = {
  mouse: {
    left: 'orbit-or-pan-by-active-mode',
    shiftLeft: 'temporary-pan-while-orbiting',
    middle: 'orbit',
    right: 'reserved-context-menu',
    wheel: 'zoom-to-cursor',
  },
  touch: {
    oneFinger: 'orbit-or-pan-by-active-mode',
    twoFinger: 'dolly-pan',
  },
  keyboard: {
    o: 'orbit-mode',
    h: 'pan-mode',
    one: 'front',
    two: 'top',
    three: 'iso',
    z: 'zoom-to-fit',
    home: 'zoom-to-fit',
    r: 'reset',
    g: 'toggle-grid',
    d: 'toggle-dimensions',
    x: 'toggle-xray',
    l: 'toggle-layers',
  },
  toolbar: {
    zoomSlider: 'continuous-zoom-delta',
    zoomExtents: 'fit-visible-lesson-model',
  },
} as const

interface ThreeDLabControlsProviderProps {
  config?: ThreeDLabCameraControlConfig
  children?: ReactNode
}

export function ThreeDLabControlsProvider({
  config,
  children,
}: ThreeDLabControlsProviderProps) {
  useEffect(() => {
    const resolvedConfig = config ?? {}
    useViewportShellStore.getState().setCameraControlConfig(resolvedConfig)

    if (typeof window !== 'undefined') {
      ;(window as unknown as { __slatecamp3dLabControls?: unknown }).__slatecamp3dLabControls = {
        provider: 'ThreeDLabControlsProvider',
        mapping: THREE_D_LAB_CONTROL_MAPPING,
        config: resolvedConfig,
      }
    }

    return () => {
      useViewportShellStore.getState().resetCameraControlConfig()
      if (typeof window !== 'undefined') {
        delete (window as unknown as { __slatecamp3dLabControls?: unknown }).__slatecamp3dLabControls
      }
    }
  }, [config])

  return <>{children}</>
}
