'use client'

import { useMemo } from 'react'
import { Line } from '@react-three/drei'
import { ArchMass } from '../../_components/ArchMass'
import { useSiteControlsStore } from '../../_stores/siteControlsStore'

/**
 * Building footprint extruded box using ArchMass.
 * Uses computed.buildingHeight (numFloors × floorHeight).
 * In tourStep 2: renders as flat 0.3m slab.
 * In tourStep 3+ or null: renders full height with floor division lines.
 */
export function AMBFVolume() {
  const buildableWidth = useSiteControlsStore((s) => s.computed.buildableWidth)
  const buildableDepth = useSiteControlsStore((s) => s.computed.buildableDepth)
  const setbacks = useSiteControlsStore((s) => s.computed.setbacks)
  const buildingHeight = useSiteControlsStore((s) => s.computed.buildingHeight)
  const numFloors = useSiteControlsStore((s) => s.inputs.numFloors)
  const floorHeight = useSiteControlsStore((s) => s.inputs.floorHeight)
  const activeZone = useSiteControlsStore((s) => s.activeZone)
  const setActiveZone = useSiteControlsStore((s) => s.setActiveZone)
  const tourStep = useSiteControlsStore((s) => s.tourStep)

  // Don't render if no buildable area
  if (buildableWidth <= 0 || buildableDepth <= 0) return null

  const isActive = activeZone === 'ambf'
  const dimmed = activeZone !== null && !isActive

  // tourStep 2 = flat slab, everything else = full height
  const isSlab = tourStep === 2
  const effectiveHeight = isSlab ? 0.3 : buildingHeight

  const px = setbacks.left + buildableWidth / 2
  const py = effectiveHeight / 2
  const pz = setbacks.front + buildableDepth / 2

  // Floor division lines — only shown when full height (tourStep >= 3 or null)
  const floorLines = useMemo(() => {
    if (isSlab) return []
    const lines: Array<{ key: string; points: [number, number, number][] }> = []
    const x0 = setbacks.left
    const x1 = setbacks.left + buildableWidth
    const z0 = setbacks.front
    const z1 = setbacks.front + buildableDepth

    for (let i = 1; i < numFloors; i++) {
      const y = floorHeight * i
      lines.push({
        key: `floor-${i}`,
        points: [
          [x0, y, z0],
          [x1, y, z0],
          [x1, y, z1],
          [x0, y, z1],
          [x0, y, z0],
        ],
      })
    }
    return lines
  }, [isSlab, numFloors, floorHeight, buildableWidth, buildableDepth, setbacks])

  return (
    <group>
      <ArchMass
        position={[px, py, pz]}
        isActive={isActive}
        color="#1B3FC4"
        opacity={dimmed ? 0.25 : 1.0}
        onClick={(e) => {
          e.stopPropagation()
          setActiveZone(isActive ? null : 'ambf')
        }}
        onPointerOver={(e) => {
          e.stopPropagation()
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'auto'
        }}
      >
        <boxGeometry args={[buildableWidth, effectiveHeight, buildableDepth]} />
      </ArchMass>

      {/* Floor division lines */}
      {floorLines.map((fl) => (
        <Line
          key={fl.key}
          points={fl.points}
          color="#1B3FC4"
          lineWidth={0.5}
          transparent
          opacity={dimmed ? 0.15 : 0.45}
        />
      ))}
    </group>
  )
}
