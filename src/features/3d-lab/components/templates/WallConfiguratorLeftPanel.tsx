'use client'

// Composite left panel for the unified wall configurator (v2)
// Renders ViewModeButtonStrip + CoreTypeCardStrip + GenericControlPanel

import type { StoreApi, UseBoundStore } from 'zustand'
import type { ModuleStoreState } from '@/features/3d-lab/stores/createModuleStore'
import type { ParametricSceneConfig } from '@/features/3d-lab/types/templates'
import { CoreTypeCardStrip } from './CoreTypeCardStrip'
import { ViewModeButtonStrip } from './ViewModeButtonStrip'
import { GenericControlPanel } from './GenericControlPanel'
import type { CoreType, WallViewMode } from '@/features/3d-lab/config/modules/10-materials/wall-types'

interface WallConfiguratorLeftPanelProps {
  config: ParametricSceneConfig
  useStore: UseBoundStore<StoreApi<ModuleStoreState>>
}

export const WallConfiguratorLeftPanel = ({ config, useStore }: WallConfiguratorLeftPanelProps) => {
  const params = useStore((s) => s.params)
  const setParam = useStore((s) => s.setParam)

  const activeCoreType = String(params.coreType || 'chb') as CoreType
  const activeViewMode = String(params.viewMode || 'overview') as WallViewMode

  const handleCoreTypeSelect = (type: CoreType) => {
    setParam('coreType', type)
  }

  const handleViewModeChange = (mode: WallViewMode) => {
    setParam('viewMode', mode)
  }

  return (
    <div className="flex flex-col gap-3 h-full overflow-y-auto">
      {/* View Mode Buttons */}
      <div className="px-3 pt-3">
        <ViewModeButtonStrip activeMode={activeViewMode} onModeChange={handleViewModeChange} />
      </div>

      {/* Core Type Card Selector */}
      <div className="px-3">
        <CoreTypeCardStrip activeCoreType={activeCoreType} onSelect={handleCoreTypeSelect} />
      </div>

      {/* Standard Parameter Controls */}
      <GenericControlPanel
        embedded
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
