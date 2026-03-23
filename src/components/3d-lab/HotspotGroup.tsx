'use client'

import { Html } from '@react-three/drei'
import type { HotspotData } from '@/types/3d-lab'
import { HotspotDot } from './HotspotDot'

interface HotspotGroupProps {
  hotspots: HotspotData[]
  exploreMode: 'guided' | 'free'
  currentSequenceIndex: number
  activeHotspotId: string | null
  visitedIds: Set<string>
  onHotspotClick: (id: string) => void
}

const MAX_PER_CATEGORY = 5

const getVisibleHotspots = (
  hotspots: HotspotData[],
  exploreMode: 'guided' | 'free',
  currentSequenceIndex: number,
): HotspotData[] => {
  if (exploreMode === 'guided') {
    // Show hotspots with sequenceOrder <= currentSequenceIndex + 1
    // (current + all previously visited), capped at 5
    const filtered = hotspots
      .filter((h) => h.sequenceOrder <= currentSequenceIndex + 1)
      .sort((a, b) => a.sequenceOrder - b.sequenceOrder)
    return filtered.slice(0, MAX_PER_CATEGORY)
  }

  // FREE mode: all hotspots, up to 5 per category
  if (hotspots.length <= MAX_PER_CATEGORY) return hotspots

  // Group by category, take up to 5 per category
  const byCategory = new Map<string, HotspotData[]>()
  for (const h of hotspots) {
    const cat = h.category ?? '__default__'
    if (!byCategory.has(cat)) byCategory.set(cat, [])
    byCategory.get(cat)!.push(h)
  }

  const result: HotspotData[] = []
  for (const group of byCategory.values()) {
    result.push(...group.slice(0, MAX_PER_CATEGORY))
  }
  return result
}

export const HotspotGroup = ({
  hotspots,
  exploreMode,
  currentSequenceIndex,
  activeHotspotId,
  visitedIds,
  onHotspotClick,
}: HotspotGroupProps) => {
  const visibleHotspots = getVisibleHotspots(hotspots, exploreMode, currentSequenceIndex)
  const totalCount = hotspots.length

  return (
    <>
      {visibleHotspots.map((hotspot) => (
        <HotspotDot
          key={hotspot.id}
          hotspot={hotspot}
          isActive={activeHotspotId === hotspot.id}
          isVisited={visitedIds.has(hotspot.id)}
          isVisible={true}
          onClick={onHotspotClick}
        />
      ))}

      {/* Progress indicator — anchored to a fixed screen position via Html */}
      {totalCount > 0 && (
        <Html
          position={[0, 0, 0]}
          style={{ pointerEvents: 'none' }}
          zIndexRange={[10, 0]}
          prepend
        >
          <span
            style={{
              fontFamily: '"DM Mono", monospace',
              fontSize: '10px',
              color: 'rgba(255,255,255,0.5)',
              pointerEvents: 'none',
              userSelect: 'none',
            }}
          >
            {visibleHotspots.length} of {totalCount}
          </span>
        </Html>
      )}
    </>
  )
}
