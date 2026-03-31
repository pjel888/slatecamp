'use client'

import { Html } from '@react-three/drei'
import { useDevControlsStore } from '../../stores/useDevControlsStore'
import { useSelectionStore } from '../../stores/useSelectionStore'
import { GEOMETRY_Y, COLOR } from '../constants'
import { CITATIONS } from '@/lib/pd1096/zoningTables'

// Zone hotspots — Html badges anchored in 3D space.
// Clicking selects the zone and populates the selection store.
// NO drei Text — all labels are DOM elements via Html.

interface HotspotBadgeProps {
  position: [number, number, number]
  label: string
  value: string
  objectId: string
  layerType: 'lot' | 'setback' | 'ambf' | 'isa' | 'usa' | 'tosl' | 'building' | 'rrow'
  codeRef: string
  computedValues: Record<string, number | string>
}

function HotspotBadge({ position, label, value, objectId, layerType, codeRef, computedValues }: HotspotBadgeProps) {
  const activeHotspot = useDevControlsStore((s) => s.activeHotspot)
  const setActiveHotspot = useDevControlsStore((s) => s.setActiveHotspot)
  const setSelection = useSelectionStore((s) => s.setSelection)

  const isActive = activeHotspot === objectId

  return (
    <Html position={position} style={{ pointerEvents: 'auto' }}>
      <button
        onClick={() => {
          setActiveHotspot(isActive ? null : objectId)
          if (!isActive) {
            setSelection(objectId, {
              objectId,
              layerType,
              displayName: label,
              codeReference: codeRef,
              computedValues,
              violations: [],
            })
          }
        }}
        className={`
          flex items-center gap-1.5 rounded-sm px-2 py-1 text-[10px] font-medium
          transition-all duration-150 whitespace-nowrap cursor-pointer select-none
          ${isActive
            ? 'bg-[#1B3FC4] text-white shadow-sm'
            : 'bg-white/90 text-[#1A2332] border border-[#D4DAE3] hover:border-[#1B3FC4] hover:bg-[#EEF2FC] shadow-sm'
          }
        `}
      >
        <span className="font-mono text-[9px] uppercase tracking-wider opacity-70">{label}</span>
        <span className="font-mono font-semibold">{value}</span>
      </button>
    </Html>
  )
}

export function ZoneHotspots() {
  const lotW = useDevControlsStore((s) => s.lot.width)
  const lotD = useDevControlsStore((s) => s.lot.depth)
  const r = useDevControlsStore((s) => s.result)
  const sb = r.setbacks.effective

  const midX = lotW / 2
  const midZ = lotD / 2
  const y = GEOMETRY_Y.LOT_SURFACE + 0.3

  return (
    <group>
      {/* TLA badge — center of lot */}
      <HotspotBadge
        position={[midX, y, midZ]}
        label="TLA"
        value={`${r.tla.toFixed(0)} sqm`}
        objectId="hotspot-tla"
        layerType="lot"
        codeRef={CITATIONS.tla}
        computedValues={{ 'TLA': `${r.tla.toFixed(1)} sqm`, 'Width': `${lotW}m`, 'Depth': `${lotD}m` }}
      />

      {/* AMBF badge — center of buildable area */}
      {r.buildableWidth > 0 && r.buildableDepth > 0 && (
        <HotspotBadge
          position={[sb.left + r.buildableWidth / 2, y + 2, sb.front + r.buildableDepth / 2]}
          label="AMBF"
          value={`${r.ambf.toFixed(0)} sqm`}
          objectId="hotspot-ambf"
          layerType="ambf"
          codeRef={CITATIONS.ambf}
          computedValues={{
            'AMBF': `${r.ambf.toFixed(1)} sqm`,
            'By Setbacks': `${r.ambfCandidates.bySetbacks.toFixed(1)} sqm`,
            'By PSO': `${r.ambfCandidates.byPSO.toFixed(1)} sqm`,
            'Binding': r.ambfCandidates.bindingSource,
          }}
        />
      )}

      {/* TOSL badge — side of lot */}
      <HotspotBadge
        position={[lotW + 0.5, y, midZ]}
        label="TOSL"
        value={`${r.tosl.toFixed(0)} sqm`}
        objectId="hotspot-tosl"
        layerType="tosl"
        codeRef={CITATIONS.tosl}
        computedValues={{
          'TOSL': `${r.tosl.toFixed(1)} sqm`,
          'ISA': `${r.isa.toFixed(1)} sqm`,
          'USA': `${r.usa.toFixed(1)} sqm`,
        }}
      />

      {/* BHL badge — top of building envelope */}
      <HotspotBadge
        position={[sb.left + r.buildableWidth / 2, GEOMETRY_Y.BUILDING_BASE + r.bhlMeters + 1, sb.front + r.buildableDepth / 2]}
        label="BHL"
        value={`${r.bhlStoreys}F / ${r.bhlMeters.toFixed(0)}m`}
        objectId="hotspot-bhl"
        layerType="building"
        codeRef={CITATIONS.bhl}
        computedValues={{
          'BHL': `${r.bhlStoreys} storeys (${r.bhlMeters.toFixed(1)}m)`,
          'Source': r.bhlSource,
          'Proposed': `${r.proposedHeight.toFixed(1)}m`,
        }}
      />
    </group>
  )
}
