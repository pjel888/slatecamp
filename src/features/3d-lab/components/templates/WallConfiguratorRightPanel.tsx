'use client'

// Composite right panel for the unified wall configurator (v2)
// Renders PerformanceDashboard + ComplianceReportPanel + BOMPanel + ComparisonDashboard

import { useMemo } from 'react'
import type { StoreApi, UseBoundStore } from 'zustand'
import type { ModuleStoreState } from '@/features/3d-lab/stores/createModuleStore'
import type { ParametricSceneConfig } from '@/features/3d-lab/types/templates'
import { computeWallState } from '@/features/3d-lab/config/modules/10-materials/wall-computation'
import { PerformanceDashboard } from './PerformanceDashboard'
import { BOMPanel } from './BOMPanel'
import { ComparisonDashboard } from './ComparisonDashboard'
import { ComplianceReportPanel } from './ComplianceReportPanel'

interface WallConfiguratorRightPanelProps {
  config: ParametricSceneConfig
  useStore: UseBoundStore<StoreApi<ModuleStoreState>>
}

export const WallConfiguratorRightPanel = ({ config, useStore }: WallConfiguratorRightPanelProps) => {
  const params = useStore((s) => s.params)

  const wallState = useMemo(() => computeWallState(params), [params])

  const viewMode = String(params.viewMode || 'overview')
  const isCompareMode = viewMode === 'compare'

  // For comparison mode, compute state for the comparison type
  const compareState = useMemo(() => {
    if (!isCompareMode) return null
    const compareParams = { ...params, coreType: String(params.compareWith || 'drywall') }
    return computeWallState(compareParams)
  }, [params, isCompareMode])

  return (
    <div className="flex flex-col gap-3 p-3 overflow-y-auto h-full">
      {/* Performance Dashboard — always visible */}
      <PerformanceDashboard performance={wallState.performance} />

      {/* Comparison Dashboard — visible in compare mode */}
      {isCompareMode && compareState && (
        <ComparisonDashboard
          typeALabel={wallState.registryEntry.label}
          typeBLabel={compareState.registryEntry.label}
          perfA={wallState.performance}
          perfB={compareState.performance}
        />
      )}

      {/* Compliance Report */}
      {config.violations && config.violations.length > 0 && (
        <ComplianceReportPanel
          embedded
          violations={config.violations}
          useStore={useStore}
        />
      )}

      {/* BOM Panel — collapsible */}
      <BOMPanel entries={wallState.bom} totalCost={wallState.bomTotal} />
    </div>
  )
}
