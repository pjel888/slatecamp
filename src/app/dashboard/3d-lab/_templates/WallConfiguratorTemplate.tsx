'use client'

// src/app/dashboard/3d-lab/_templates/WallConfiguratorTemplate.tsx
// Entry-point template for the Wall Configurator 3D Lab module.
// Uses the wall-specific Zustand store (useWallLabStore) instead of createModuleStore.

import { CanvasWrapper } from '../_components/CanvasWrapper'
import { LabPanelLayout } from '../_components/LabPanelLayout'
import { WallConfiguratorRenderer } from './WallConfiguratorRenderer'
import { ConfigPanel } from '../_components/WallConfigurator/ConfigPanel'
import { BOMPanel } from '../_components/WallConfigurator/BOMPanel'
import type { ParametricSceneConfig } from '../_types/templates'

interface Props {
  config: ParametricSceneConfig
}

export default function WallConfiguratorTemplate({ config }: Props) {
  // Front-facing camera to see material patterns on the wall face
  const cameraPos: [number, number, number] = [1.5, 2, 7]
  const cameraFov = 42

  return (
    <LabPanelLayout
      leftPanel={<ConfigPanel />}
      leftWidth={320}
      rightPanel={<BOMPanel />}
      rightWidth={340}
    >
      <CanvasWrapper
        cameraPosition={cameraPos}
        cameraFov={cameraFov}
        minDistance={1}
        maxDistance={25}
        showGround={false}
      >
        <WallConfiguratorRenderer config={config} />
      </CanvasWrapper>
    </LabPanelLayout>
  )
}
