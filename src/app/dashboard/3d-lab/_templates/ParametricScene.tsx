// src/app/dashboard/3d-lab/_templates/ParametricScene.tsx
// Cleaned up: all chrome (top bar, badges, banners, violation bar) removed.
// ModuleViewer provides the shell. This component renders ONLY the 3D canvas + control panel.
'use client'

import { useMemo } from 'react'
import { CanvasWrapper } from '../_components/CanvasWrapper'
import { GenericControlPanel } from '../_components/GenericControlPanel'
import { ParametricSceneRenderer } from './ParametricSceneRenderer'
import { createModuleStore } from '../_stores/createModuleStore'
import type { ParametricSceneConfig } from '../_types/templates'

interface ParametricSceneProps {
  config: ParametricSceneConfig
}

export default function ParametricScene({ config }: ParametricSceneProps) {
  const defaults = useMemo(() => {
    const d: Record<string, number | boolean | string> = {}
    for (const p of config.parameters) {
      d[p.key] = p.default
    }
    return d
  }, [config.parameters])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const useStore = useMemo(() => createModuleStore(defaults), [config.id])

  const cameraPos = config.camera?.position ?? [3, 3, 3]
  const cameraFov = config.camera?.fov ?? 45

  return (
    <div className="relative h-full w-full">
      {/* 3D Canvas — offset left to make room for the 240px control panel */}
      <div className="absolute inset-0 left-[240px] max-sm:left-0 max-sm:bottom-[50vh]">
        <CanvasWrapper
          cameraPosition={cameraPos}
          cameraFov={cameraFov}
          minDistance={1}
          maxDistance={25}
        >
          <ParametricSceneRenderer config={config} useStore={useStore} />
        </CanvasWrapper>
      </div>

      {/* Control Panel — flush left drawer with violations + context scenario */}
      <GenericControlPanel
        title={config.title}
        parameters={config.parameters}
        presets={config.presets}
        useStore={useStore}
        contextScenario={config.contextScenario}
        violations={config.violations}
      />
    </div>
  )
}
