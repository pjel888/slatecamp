'use client'

import { useState, useEffect } from 'react'
import { Html } from '@react-three/drei'
import { useSiteControlsStore } from '../../_stores/siteControlsStore'
import { SITE_CONTROL_CITATIONS } from '../../_constants/siteControls'

// ─── Hotspot Data ─────────────────────────────────────────────────────────────

interface HotspotDef {
  id: 'tla' | 'ambf' | 'isa' | 'usa' | 'setbacks'
  label: string
  fullName: string
  citation: string
  getPosition: (s: ReturnType<typeof useHotspotData>) => [number, number, number]
  getArea: (s: ReturnType<typeof useHotspotData>) => string
  description: string
}

const HOTSPOTS: HotspotDef[] = [
  {
    id: 'tla',
    label: 'TLA',
    fullName: 'Total Lot Area',
    citation: SITE_CONTROL_CITATIONS.tla,
    getPosition: (s) => [s.lotWidth / 2, 0.3, s.lotDepth / 2],
    getArea: (s) => `${s.tla.toFixed(1)} sqm`,
    description: 'Your starting point for every development control calculation — the complete ground area inside your property boundaries.',
  },
  {
    id: 'ambf',
    label: 'AMBF',
    fullName: 'Allowable Maximum Building Footprint',
    citation: SITE_CONTROL_CITATIONS.ambf,
    getPosition: (s) => [
      s.setbacks.left + s.buildableWidth / 2,
      s.buildingHeight + 0.5,
      s.setbacks.front + s.buildableDepth / 2,
    ],
    getArea: (s) => `${s.ambf.toFixed(1)} sqm`,
    description: 'The maximum footprint your building may occupy. Constrained by BOTH setbacks and your zoning class\'s max lot coverage — whichever is smaller wins.',
  },
  {
    id: 'isa',
    label: 'ISA',
    fullName: 'Impervious Surface Area',
    citation: SITE_CONTROL_CITATIONS.isa,
    getPosition: (s) => [s.lotWidth / 2, 0.5, s.setbacks.front / 2],
    getArea: (s) => `${s.isa.toFixed(1)} sqm`,
    description: 'Paved open space — driveways, terraces, walkways. Calculated as a direct percentage of TLA, not a fraction of TOSL.',
  },
  {
    id: 'usa',
    label: 'USA',
    fullName: 'Unpaved Surface Area',
    citation: SITE_CONTROL_CITATIONS.usa,
    getPosition: (s) => [s.lotWidth / 2, 0.5, s.lotDepth - s.setbacks.rear / 2],
    getArea: (s) => `${s.usa.toFixed(1)} sqm`,
    description: 'Landscaped open space — soil, planting strips, lawns. Required for stormwater absorption and air circulation.',
  },
  {
    id: 'setbacks',
    label: 'SETBACKS',
    fullName: 'Required Setbacks',
    citation: SITE_CONTROL_CITATIONS.setbacks,
    getPosition: (s) => [0.5, 0.5, s.lotDepth / 2],
    getArea: (s) => `F:${s.setbacks.front}m S:${s.setbacks.left}m R:${s.setbacks.rear}m`,
    description: 'Minimum distances from your building to each lot line, determined by zoning class and road right-of-way width.',
  },
]

// ─── Data Hook ────────────────────────────────────────────────────────────────

function useHotspotData() {
  const lotWidth = useSiteControlsStore((s) => s.inputs.lotWidth)
  const lotDepth = useSiteControlsStore((s) => s.inputs.lotDepth)
  const buildingHeight = useSiteControlsStore((s) => s.inputs.buildingHeight)
  const computed = useSiteControlsStore((s) => s.computed)

  return {
    lotWidth,
    lotDepth,
    buildingHeight,
    tla: computed.tla,
    ambf: computed.ambf,
    isa: computed.isa,
    usa: computed.usa,
    buildableWidth: computed.buildableWidth,
    buildableDepth: computed.buildableDepth,
    setbacks: computed.setbacks,
  }
}

// ─── Hotspot Marker ───────────────────────────────────────────────────────────

function HotspotMarker({
  def,
  data,
  isActive,
  onToggle,
}: {
  def: HotspotDef
  data: ReturnType<typeof useHotspotData>
  isActive: boolean
  onToggle: () => void
}) {
  return (
    <div
      className="relative cursor-pointer select-none"
      onClick={(e) => {
        e.stopPropagation()
        onToggle()
      }}
    >
      {/* Dot */}
      <div className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-[#1B3FC4] shadow-md">
        <span className="font-mono text-[8px] font-bold text-white">
          {def.label[0]}
        </span>
      </div>

      {/* Expanded tooltip */}
      {isActive && (
        <div className="absolute left-7 top-0 z-50 w-64 rounded-lg border border-gray-200 bg-white p-3 shadow-lg">
          <p className="mb-0.5 font-mono text-xs font-bold text-[#1B3FC4]">
            {def.label}
          </p>
          <p className="mb-1 text-[11px] font-medium text-gray-800">
            {def.fullName}
          </p>
          <p className="mb-1 font-mono text-xs text-gray-900">
            {def.getArea(data)}
          </p>
          <p className="mb-2 text-xs leading-relaxed text-gray-700">
            {def.description}
          </p>
          <p className="font-mono text-[10px] text-gray-400">
            {def.citation}
          </p>
        </div>
      )}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function ZoneHotspots() {
  const activeZone = useSiteControlsStore((s) => s.activeZone)
  const setActiveZone = useSiteControlsStore((s) => s.setActiveZone)
  const data = useHotspotData()

  // Progressive disclosure: hotspots appear after 2-second delay (UX plan Layer 2)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 2000)
    return () => clearTimeout(timer)
  }, [])

  if (!visible) return null

  return (
    <>
      {HOTSPOTS.map((def) => (
        <Html
          key={def.id}
          position={def.getPosition(data)}
          center
          distanceFactor={12}
          style={{ pointerEvents: 'auto' }}
          zIndexRange={[10, 0]}
        >
          <HotspotMarker
            def={def}
            data={data}
            isActive={activeZone === def.id}
            onToggle={() => setActiveZone(activeZone === def.id ? null : def.id)}
          />
        </Html>
      ))}
    </>
  )
}
