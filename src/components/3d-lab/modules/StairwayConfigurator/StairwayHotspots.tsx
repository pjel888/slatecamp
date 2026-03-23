'use client'

import { Html } from '@react-three/drei'
import { stairwayConfig } from './stairway.config'

interface StairwayHotspotsProps {
  onHotspotClick: (id: string) => void
  activeHotspotId?: string | null
  visitedIds: Set<string>
  visibleIds: string[]
}

// Colour tokens
const COLOR_EXAM_CRITICAL = '#1B3FC4'  // Camp Cobalt
const COLOR_INFORMATIONAL = '#3B82C8'  // Info Blue
const COLOR_VIOLATION = '#D64545'      // Warm Red
const COLOR_VISITED = '#2D9F6F'        // Emerald
const COLOR_ACTIVE_RING = '#E8853A'    // Camp Orange

const dotColorForType = (type: string): string => {
  if (type === 'exam-critical') return COLOR_EXAM_CRITICAL
  if (type === 'violation') return COLOR_VIOLATION
  return COLOR_INFORMATIONAL
}

export const StairwayHotspots = ({
  onHotspotClick,
  activeHotspotId,
  visitedIds,
  visibleIds,
}: StairwayHotspotsProps) => {
  const visibleSet = new Set(visibleIds)

  return (
    <>
      {stairwayConfig.hotspots
        .filter((h) => visibleSet.has(h.id))
        .map((hotspot) => {
          const isActive = hotspot.id === activeHotspotId
          const isVisited = visitedIds.has(hotspot.id)
          const dotColor = isVisited
            ? COLOR_VISITED
            : dotColorForType(hotspot.type)

          return (
            <Html
              key={hotspot.id}
              position={hotspot.position}
              center
              zIndexRange={[10, 20]}
              style={{ pointerEvents: 'none' }}
            >
              <button
                onClick={() => onHotspotClick(hotspot.id)}
                aria-label={hotspot.label}
                style={{
                  pointerEvents: 'auto',
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  backgroundColor: dotColor,
                  border: isActive
                    ? `3px solid ${COLOR_ACTIVE_RING}`
                    : '2px solid rgba(255,255,255,0.85)',
                  boxShadow: isActive
                    ? `0 0 0 2px ${COLOR_ACTIVE_RING}40`
                    : '0 1px 4px rgba(0,0,0,0.25)',
                  cursor: 'pointer',
                  transition: 'transform 150ms ease-out, box-shadow 150ms ease-out',
                  transform: isActive ? 'scale(1.25)' : 'scale(1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0,
                  outline: 'none',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    ;(e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.15)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    ;(e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'
                  }
                }}
              >
                {/* Pulse ring for exam-critical, unvisited hotspots */}
                {hotspot.type === 'exam-critical' && !isVisited && !isActive && (
                  <span
                    style={{
                      position: 'absolute',
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      border: `2px solid ${COLOR_EXAM_CRITICAL}`,
                      opacity: 0.5,
                      animation: 'ping 1.5s cubic-bezier(0,0,0.2,1) infinite',
                      pointerEvents: 'none',
                    }}
                  />
                )}
              </button>
            </Html>
          )
        })}
    </>
  )
}
