'use client'

import { useLabStore } from '@/stores/useLabStore'
import type { ModuleConfig } from '@/types/3d-lab'
import { LabTopBar } from './LabTopBar'
import { LabCanvas } from './LabCanvas'

interface LabViewerProps {
  config: ModuleConfig
  children?: React.ReactNode
  onBack?: () => void
}

export const LabViewer = ({ config, children, onBack }: LabViewerProps) => {
  const visitedHotspotIds = useLabStore((s) => s.visitedHotspotIds)
  const panelMode = useLabStore((s) => s.panelMode)

  const visitedCount = visitedHotspotIds.size
  const totalCount = config.hotspots.length

  // Orbit is disabled when a question panel is active (question mode)
  const orbitEnabled = panelMode !== 'question' && panelMode !== 'quiz'

  const handleBack = () => {
    onBack?.()
  }

  return (
    <div className="flex flex-col h-screen" style={{ backgroundColor: '#F2F0EB' }}>
      {/* Fixed 36px top bar */}
      <LabTopBar
        title={config.title}
        codeReference={config.codeReference}
        visitedCount={visitedCount}
        totalCount={totalCount}
        onBack={handleBack}
      />

      {/* Canvas area fills remaining height; relative so overlays can position:absolute */}
      <div className="flex-1 relative overflow-hidden">
        <LabCanvas
          defaultCameraPosition={config.defaultCameraPosition}
          defaultCameraTarget={config.defaultCameraTarget}
          orbitEnabled={orbitEnabled}
        >
          {children}
        </LabCanvas>
      </div>
    </div>
  )
}
