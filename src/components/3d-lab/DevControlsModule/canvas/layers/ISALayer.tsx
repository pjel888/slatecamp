'use client'

import { useRef, useState } from 'react'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { useDevControlsStore } from '../../stores/useDevControlsStore'
import { useSelectionStore } from '../../stores/useSelectionStore'
import { GEOMETRY_Y, COLOR, OPACITY } from '../constants'
import { setCursor, clearCursor } from '../cursor'
import { CITATIONS } from '@/lib/pd1096/zoningTables'

// ISA (Impervious Surface Area) — draggable + resizable amber zone.
// Area-clamped: width × depth never exceeds computed ISA limit.
// Position-clamped: always within lot boundaries.

const HANDLE_SIZE = 0.4

export function ISALayer() {
  const lotW = useDevControlsStore((s) => s.lot.width)
  const lotD = useDevControlsStore((s) => s.lot.depth)
  const isa = useDevControlsStore((s) => s.result.isa)
  const isaPercent = useDevControlsStore((s) => s.result.isaPercent)
  const tla = useDevControlsStore((s) => s.result.tla)
  const placement = useDevControlsStore((s) => s.isaPlacement)
  const setPlacement = useDevControlsStore((s) => s.setIsaPlacement)
  const setSelection = useSelectionStore((s) => s.setSelection)
  const setIsDraggingZone = useDevControlsStore((s) => s.setIsDraggingZone)

  const [dragging, setDragging] = useState(false)
  const [resizing, setResizing] = useState(false)
  const dragOffset = useRef({ x: 0, z: 0 })

  if (isa <= 0) return null

  const { x, z, w, d } = placement
  const currentArea = w * d
  const y = GEOMETRY_Y.HARDSCAPE_ISA

  return (
    <group>
      {/* ISA zone plane — draggable */}
      <mesh
        position={[x + w / 2, y, z + d / 2]}
        rotation={[-Math.PI / 2, 0, 0]}
        onPointerOver={() => setCursor('hover')}
        onPointerOut={() => clearCursor('hover')}
        onPointerDown={(e) => {
          e.stopPropagation()
          const pt = e.point
          dragOffset.current = { x: pt.x - x, z: pt.z - z }
          setDragging(true)
          setIsDraggingZone(true)
          setCursor('drag')
        }}
        onPointerMove={(e) => {
          if (!dragging) return
          e.stopPropagation()
          const pt = e.point
          setPlacement({
            x: Math.max(0, Math.min(pt.x - dragOffset.current.x, lotW - w)),
            z: Math.max(0, Math.min(pt.z - dragOffset.current.z, lotD - d)),
          })
        }}
        onPointerUp={() => { setDragging(false); setIsDraggingZone(false); clearCursor('drag') }}
        onClick={(e) => {
          e.stopPropagation()
          setSelection('isa-zone', {
            objectId: 'isa-zone',
            layerType: 'isa',
            displayName: 'Impervious Surface Area (ISA)',
            codeReference: CITATIONS.isa,
            computedValues: {
              'Max ISA': `${isa.toFixed(1)} sqm`,
              'Current': `${currentArea.toFixed(1)} sqm`,
              'Table %': `${(isaPercent * 100).toFixed(0)}% of TLA`,
            },
            violations: currentArea > isa + 0.01 ? ['Exceeds ISA limit'] : [],
          })
        }}
      >
        <planeGeometry args={[w, d]} />
        <meshStandardMaterial
          color={COLOR.ISA}
          transparent
          opacity={dragging ? 0.40 : OPACITY.ISA_ZONE}
          side={THREE.DoubleSide}
          depthWrite={false}
          polygonOffset
          polygonOffsetFactor={-2}
          polygonOffsetUnits={-2}
        />
      </mesh>

      {/* Resize handle — bottom-right corner */}
      <mesh
        position={[x + w, y + 0.01, z + d]}
        onPointerOver={() => setCursor('resize')}
        onPointerOut={() => clearCursor('resize')}
        onPointerDown={(e) => {
          e.stopPropagation()
          setResizing(true)
          setIsDraggingZone(true)
          setCursor('resize')
        }}
        onPointerMove={(e) => {
          if (!resizing) return
          e.stopPropagation()
          const pt = e.point
          const newW = Math.max(1, Math.min(pt.x - x, lotW - x))
          const maxD = isa / Math.max(newW, 0.1)
          const newD = Math.max(1, Math.min(pt.z - z, lotD - z, maxD))
          setPlacement({ w: newW, d: newD })
        }}
        onPointerUp={() => { setResizing(false); setIsDraggingZone(false); clearCursor('resize') }}
      >
        <sphereGeometry args={[HANDLE_SIZE, 8, 8]} />
        <meshStandardMaterial color={COLOR.ISA} opacity={0.8} transparent />
      </mesh>

      {/* Area label */}
      <Html
        position={[x + w / 2, y + 0.3, z + d / 2]}
        style={{ pointerEvents: 'none' }}
      >
        <div className={`rounded-sm px-1.5 py-0.5 text-[9px] font-mono font-medium whitespace-nowrap ${
          currentArea > isa + 0.01
            ? 'bg-[#D64545]/90 text-white'
            : 'bg-[#F5A623]/90 text-white'
        }`}>
          ISA {currentArea.toFixed(0)} / {isa.toFixed(0)} sqm
        </div>
      </Html>
    </group>
  )
}
