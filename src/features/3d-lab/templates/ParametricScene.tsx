// src/app/dashboard/3d-lab/_templates/ParametricScene.tsx
// Uses LabPanelLayout for consistent grid + collapse handles (matches Site Dev).
'use client'

import { useMemo } from 'react'
import { CanvasWrapper } from '@/features/3d-lab/components/CanvasWrapper'
import { GenericControlPanel } from '@/features/3d-lab/components/templates/GenericControlPanel'
import { ComplianceReportPanel } from '@/features/3d-lab/components/templates/ComplianceReportPanel'
import { LabPanelLayout } from '@/features/3d-lab/components/templates/LabPanelLayout'
import { ParametricSceneRenderer } from './ParametricSceneRenderer'
import { createModuleStore } from '@/features/3d-lab/stores/createModuleStore'
import type { ParametricSceneConfig } from '@/features/3d-lab/types/templates'

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

  // Auto-detect multi-law modules for compliance panel
  const hasCompliancePanel = useMemo(() => {
    if (!config.violations || config.violations.length === 0) return false
    const prefixes = new Set(
      config.violations.map((v) => v.id.split('-')[0])
    )
    prefixes.delete('conflict')
    return prefixes.size > 1
  }, [config.violations])

  const leftPanel = (
    <GenericControlPanel
      embedded
      title={config.title}
      parameters={config.parameters}
      presets={config.presets}
      useStore={useStore}
      contextScenario={config.contextScenario}
      violations={config.violations}
    />
  )

  const rightPanel =
    hasCompliancePanel && config.violations ? (
      <ComplianceReportPanel
        embedded
        violations={config.violations}
        useStore={useStore}
      />
    ) : undefined

  return (
    <LabPanelLayout
      leftPanel={leftPanel}
      leftWidth={240}
      rightPanel={rightPanel}
      rightWidth={280}
    >
      <CanvasWrapper
        cameraPosition={cameraPos}
        cameraFov={cameraFov}
        minDistance={1}
        maxDistance={25}
        showGround={false}
      >
        <ParametricSceneRenderer
          config={config}
          useStore={useStore}
          hideOverlays={hasCompliancePanel}
        />
      </CanvasWrapper>
    </LabPanelLayout>
  )
}
