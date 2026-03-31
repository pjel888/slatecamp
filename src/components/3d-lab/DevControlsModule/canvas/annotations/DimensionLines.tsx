'use client'

import { useMemo } from 'react'
import { Line, Html } from '@react-three/drei'
import * as THREE from 'three'
import { useDevControlsStore } from '../../stores/useDevControlsStore'
import { GEOMETRY_Y } from '../constants'

// Dimension lines — drei Line + Html labels (NO drei Text — zero text in canvas rule).
// Shows lot dimensions, setback distances, and buildable envelope dimensions.

interface DimLineProps {
  start: [number, number, number]
  end: [number, number, number]
  label: string
  offset?: [number, number, number]
}

function DimLine({ start, end, label, offset = [0, 0.5, 0] }: DimLineProps) {
  const mid: [number, number, number] = [
    (start[0] + end[0]) / 2 + offset[0],
    (start[1] + end[1]) / 2 + offset[1],
    (start[2] + end[2]) / 2 + offset[2],
  ]

  const points = useMemo(() => [
    new THREE.Vector3(...start),
    new THREE.Vector3(...end),
  ], [start, end])

  return (
    <group>
      <Line points={points} color="#4A5568" lineWidth={1} dashed dashSize={0.2} gapSize={0.15} />
      <Html position={mid} style={{ pointerEvents: 'none' }}>
        <div className="rounded-sm bg-white/90 px-1 py-0.5 text-[9px] font-mono text-[#1A2332] shadow-sm whitespace-nowrap border border-[#D4DAE3]">
          {label}
        </div>
      </Html>
    </group>
  )
}

export function DimensionLines() {
  const lotW = useDevControlsStore((s) => s.lot.width)
  const lotD = useDevControlsStore((s) => s.lot.depth)
  const sb = useDevControlsStore((s) => s.result.setbacks.effective)
  const bW = useDevControlsStore((s) => s.result.buildableWidth)
  const bD = useDevControlsStore((s) => s.result.buildableDepth)
  const bhl = useDevControlsStore((s) => s.result.bhlMeters)

  const y = GEOMETRY_Y.LOT_SURFACE + 0.05

  return (
    <group>
      {/* Lot width — along front edge */}
      <DimLine
        start={[0, y, -1.5]}
        end={[lotW, y, -1.5]}
        label={`${lotW.toFixed(1)}m`}
      />

      {/* Lot depth — along left edge */}
      <DimLine
        start={[-1.5, y, 0]}
        end={[-1.5, y, lotD]}
        label={`${lotD.toFixed(1)}m`}
      />

      {/* Front setback */}
      {sb.front > 0 && (
        <DimLine
          start={[lotW + 1, y, 0]}
          end={[lotW + 1, y, sb.front]}
          label={`F: ${sb.front.toFixed(1)}m`}
        />
      )}

      {/* Rear setback */}
      {sb.rear > 0 && (
        <DimLine
          start={[lotW + 1, y, lotD - sb.rear]}
          end={[lotW + 1, y, lotD]}
          label={`R: ${sb.rear.toFixed(1)}m`}
        />
      )}

      {/* Left setback */}
      {sb.left > 0 && (
        <DimLine
          start={[0, y, lotD + 1]}
          end={[sb.left, y, lotD + 1]}
          label={`L: ${sb.left.toFixed(1)}m`}
        />
      )}

      {/* Right setback */}
      {sb.right > 0 && (
        <DimLine
          start={[lotW - sb.right, y, lotD + 1]}
          end={[lotW, y, lotD + 1]}
          label={`R: ${sb.right.toFixed(1)}m`}
        />
      )}

      {/* Buildable width */}
      {bW > 0 && (
        <DimLine
          start={[sb.left, y + 0.3, sb.front - 0.5]}
          end={[sb.left + bW, y + 0.3, sb.front - 0.5]}
          label={`${bW.toFixed(1)}m`}
        />
      )}

      {/* BHL height */}
      {bhl > 0 && (
        <DimLine
          start={[lotW + 2, GEOMETRY_Y.BUILDING_BASE, lotD / 2]}
          end={[lotW + 2, GEOMETRY_Y.BUILDING_BASE + bhl, lotD / 2]}
          label={`BHL: ${bhl.toFixed(1)}m`}
          offset={[0.5, 0, 0]}
        />
      )}
    </group>
  )
}
