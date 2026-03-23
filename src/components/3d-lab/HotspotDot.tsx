'use client'

import { useState } from 'react'
import { Html } from '@react-three/drei'
import type { HotspotData } from '@/types/3d-lab'

interface HotspotDotProps {
  hotspot: HotspotData
  isActive: boolean
  isVisited: boolean
  isVisible: boolean
  onClick: (id: string) => void
}

const TYPE_COLORS: Record<HotspotData['type'], { fill: string; ring: string }> = {
  informational: { fill: '#1B3FC4', ring: 'rgba(27,63,196,0.3)' },
  'exam-critical': { fill: '#F5A623', ring: 'rgba(245,166,35,0.3)' },
  violation: { fill: '#E63329', ring: 'rgba(230,51,41,0.3)' },
}

const PULSE_KEYFRAMES = `
@keyframes hotspot-pulse {
  0%, 100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.3;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.6);
    opacity: 0.1;
  }
}
`

export const HotspotDot = ({
  hotspot,
  isActive,
  isVisited,
  isVisible,
  onClick,
}: HotspotDotProps) => {
  const [isHovered, setIsHovered] = useState(false)

  if (!isVisible) return null

  const { fill, ring } = TYPE_COLORS[hotspot.type]

  const dotSize = 18
  const borderWidth = isActive ? 3 : 2.5

  const scale = isActive ? 1.15 : isHovered ? 1.25 : 1
  const opacity = isVisited && !isActive ? 0.7 : 1

  // Pulse: stops when active or visited
  const pulseRunning = !isActive && !isVisited
  const ringSize = isHovered ? 10 : 6

  return (
    <Html
      position={hotspot.position}
      distanceFactor={8}
      zIndexRange={[100, 0]}
      style={{ pointerEvents: 'auto' }}
    >
      <style>{`
        ${PULSE_KEYFRAMES}
        @media (prefers-reduced-motion: reduce) {
          .hotspot-pulse-ring {
            animation: none !important;
          }
        }
      `}</style>

      {/* 44px touch target wrapper */}
      <button
        onClick={() => onClick(hotspot.id)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        aria-label={`Hotspot: ${hotspot.label}`}
        aria-pressed={isActive}
        style={{
          width: '44px',
          height: '44px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'transparent',
          border: 'none',
          padding: 0,
          cursor: 'pointer',
          position: 'relative',
          transform: 'translate(-50%, -50%)',
        }}
      >
        {/* Outer pulse ring */}
        <span
          className="hotspot-pulse-ring"
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: `${dotSize + ringSize * 2}px`,
            height: `${dotSize + ringSize * 2}px`,
            borderRadius: '50%',
            backgroundColor: ring,
            transform: 'translate(-50%, -50%)',
            animationName: 'hotspot-pulse',
            animationDuration: '2s',
            animationTimingFunction: 'ease-in-out',
            animationIterationCount: 'infinite',
            animationPlayState: pulseRunning ? 'running' : 'paused',
            transition: 'width 200ms ease, height 200ms ease',
            pointerEvents: 'none',
          }}
        />

        {/* Main dot */}
        <span
          style={{
            width: `${dotSize}px`,
            height: `${dotSize}px`,
            borderRadius: '50%',
            backgroundColor: fill,
            border: `${borderWidth}px solid white`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: `scale(${scale})`,
            opacity,
            transition: 'transform 200ms ease, opacity 150ms ease-out',
            position: 'relative',
            flexShrink: 0,
          }}
        >
          {/* Visited checkmark */}
          {isVisited && (
            <span
              style={{
                position: 'absolute',
                bottom: '-3px',
                right: '-3px',
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: '#2D9F6F',
                border: '1.5px solid white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '6px',
                color: 'white',
                lineHeight: 1,
                pointerEvents: 'none',
              }}
            >
              ✓
            </span>
          )}
        </span>
      </button>
    </Html>
  )
}
