'use client'

import { toiletConfig } from './toilet.config'
import { ToiletModel } from './ToiletModel'
import { ToiletHotspots } from './ToiletHotspots'

interface AccessibleToiletProps {
  activeHotspotId?: string | null
  visitedIds: Set<string>
  visibleHotspotIds: string[]
  onHotspotClick: (id: string) => void
  dimNonActive?: boolean
}

const AccessibleToilet = ({
  activeHotspotId,
  visitedIds,
  visibleHotspotIds,
  onHotspotClick,
  dimNonActive = false,
}: AccessibleToiletProps) => {
  // Resolve which mesh to highlight from the active hotspot
  const activeHotspot = activeHotspotId
    ? toiletConfig.hotspots.find((h) => h.id === activeHotspotId)
    : null
  const highlightMeshName = activeHotspot?.highlightMeshName ?? null

  return (
    <>
      <ToiletModel
        modelUrl={toiletConfig.modelUrl}
        highlightMeshName={highlightMeshName}
        dimNonActive={dimNonActive}
      />
      <ToiletHotspots
        onHotspotClick={onHotspotClick}
        activeHotspotId={activeHotspotId}
        visitedIds={visitedIds}
        visibleIds={visibleHotspotIds}
      />
    </>
  )
}

export default AccessibleToilet
