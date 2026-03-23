'use client'

import { stairwayConfig } from './stairway.config'
import { StairwayModel } from './StairwayModel'
import { StairwayHotspots } from './StairwayHotspots'
import { StairwayControls } from './StairwayControls'

interface StairwayConfiguratorProps {
  activeHotspotId?: string | null
  visitedIds: Set<string>
  visibleHotspotIds: string[]
  onHotspotClick: (id: string) => void
  dimNonActive?: boolean
  showControls?: boolean
}

const StairwayConfigurator = ({
  activeHotspotId,
  visitedIds,
  visibleHotspotIds,
  onHotspotClick,
  dimNonActive = false,
  showControls = true,
}: StairwayConfiguratorProps) => {
  // Resolve which mesh to highlight from the active hotspot
  const activeHotspot = activeHotspotId
    ? stairwayConfig.hotspots.find((h) => h.id === activeHotspotId)
    : null
  const highlightMeshName = activeHotspot?.highlightMeshName ?? null

  return (
    <>
      <StairwayModel
        modelUrl={stairwayConfig.modelUrl}
        highlightMeshName={highlightMeshName}
        dimNonActive={dimNonActive}
      />
      <StairwayHotspots
        onHotspotClick={onHotspotClick}
        activeHotspotId={activeHotspotId}
        visitedIds={visitedIds}
        visibleIds={visibleHotspotIds}
      />
      {/* StairwayControls renders outside the R3F canvas via a portal —
          the parent lab shell is expected to render this via showControls prop */}
      {showControls && (
        // This fragment is intentionally outside the Canvas; the parent must
        // render StairwayControls in a DOM overlay, not inside R3F context.
        // Exporting it separately allows the lab shell to place it in the panel.
        <></>
      )}
    </>
  )
}

export default StairwayConfigurator

// Named export so the lab shell can render controls in the side panel
export { StairwayControls } from './StairwayControls'
