'use client'

// src/app/dashboard/3d-lab/_templates/WallConfiguratorTemplate.tsx
// Entry-point template for the Wall Configurator 3D Lab module.
// Uses the wall-specific Zustand store (useWallLabStore) instead of createModuleStore.

import { CanvasWrapper } from '@/features/3d-lab/components/CanvasWrapper'
import { SceneErrorBoundary } from '@/features/3d-lab/components/templates/SceneErrorBoundary'
import { LabPanelLayout } from '@/features/3d-lab/components/templates/LabPanelLayout'
import { WallConfiguratorRenderer } from './WallConfiguratorRenderer'
import { ConfigPanel } from '@/features/3d-lab/components/templates/WallConfigurator/ConfigPanel'
import { BOMPanel } from '@/features/3d-lab/components/templates/WallConfigurator/BOMPanel'
import type { ParametricSceneConfig } from '@/features/3d-lab/types/templates'

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
      <SceneErrorBoundary>
        <CanvasWrapper
          sceneConfig={{
            cameraPosition: cameraPos,
            cameraFov: cameraFov,
            minDistance: 1,
            maxDistance: 25,
            showGround: false,
          }}
        >
          <WallConfiguratorRenderer config={config} />
        </CanvasWrapper>
      </SceneErrorBoundary>
    </LabPanelLayout>
  )
}
