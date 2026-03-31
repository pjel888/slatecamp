'use client'

import { useState, useEffect } from 'react'
import { Html } from '@react-three/drei'
import { useSiteControlsStore } from '../../_stores/siteControlsStore'
import { SITE_CONTROL_CITATIONS } from '../../_constants/siteControls'
import type { TourStep } from '../../_stores/siteControlsStore'

// ─── Category Colors ───────────────────────────────────────────────────────────

const CATEGORY_COLORS = {
  code: '#1B3FC4',    // Cobalt — code requirement
  dimension: '#D4951A', // Amber — dimension/measurement
  violation: '#D64545', // Warm Red — violation
} as const

type HotspotCategory = keyof typeof CATEGORY_COLORS

// ─── Hotspot Data ─────────────────────────────────────────────────────────────

interface HotspotDef {
  id: 'tla' | 'ambf' | 'isa' | 'usa' | 'setbacks' | 'violation'
  label: string
  fullName: string
  citation: string
  category: HotspotCategory
  minTourStep: TourStep // first tour step at which this hotspot is visible
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
    category: 'code',
    minTourStep: 0,
    getPosition: (s) => [s.lotWidth / 2, 0.3, s.lotDepth / 2],
    getArea: (s) => `${s.tla.toFixed(1)} sqm`,
    description: 'Your starting point for every development control calculation — the complete ground area inside your property boundaries.',
  },
  {
    id: 'setbacks',
    label: 'SETBACKS',
    fullName: 'Required Setbacks',
    citation: SITE_CONTROL_CITATIONS.setbacks,
    category: 'code',
    minTourStep: 1,
    getPosition: (s) => [0.5, 0.5, s.lotDepth / 2],
    getArea: (s) => `F:${s.setbacks.front}m S:${s.setbacks.left}m R:${s.setbacks.rear}m`,
    description: 'Minimum distances from your building to each lot line, determined by zoning class and road right-of-way width.',
  },
  {
    id: 'ambf',
    label: 'AMBF',
    fullName: 'Allowable Maximum Building Footprint',
    citation: SITE_CONTROL_CITATIONS.ambf,
    category: 'code',
    minTourStep: 2,
    getPosition: (s) => [
      s.setbacks.left + s.buildableWidth / 2,
      s.buildingHeight + 0.5,
      s.setbacks.front + s.buildableDepth / 2,
    ],
    getArea: (s) => `${s.ambf.toFixed(1)} sqm`,
    description: "The maximum footprint your building may occupy. Constrained by BOTH setbacks and your zoning class's max lot coverage — whichever is smaller wins.",
  },
  {
    id: 'isa',
    label: 'ISA',
    fullName: 'Impervious Surface Area',
    citation: SITE_CONTROL_CITATIONS.isa,
    category: 'dimension',
    minTourStep: 4,
    getPosition: (s) => [s.lotWidth / 2, 0.5, s.setbacks.front / 2],
    getArea: (s) => `${s.isa.toFixed(1)} sqm`,
    description: 'Paved open space — driveways, terraces, walkways. Calculated as a direct percentage of TLA, not a fraction of TOSL.',
  },
  {
    id: 'usa',
    label: 'USA',
    fullName: 'Unpaved Surface Area',
    citation: SITE_CONTROL_CITATIONS.usa,
    category: 'dimension',
    minTourStep: 4,
    getPosition: (s) => [s.lotWidth / 2, 0.5, s.lotDepth - s.setbacks.rear / 2],
    getArea: (s) => `${s.usa.toFixed(1)} sqm`,
    description: 'Landscaped open space — soil, planting strips, lawns. Required for stormwater absorption and air circulation.',
  },
]

// Violation hotspot — only rendered conditionally when violations exist (minTourStep 3)
const VIOLATION_HOTSPOT: HotspotDef = {
  id: 'violation',
  label: 'VIOLATION',
  fullName: 'Code Violation Detected',
  citation: '',
  category: 'violation',
  minTourStep: 3,
  getPosition: (s) => [
    s.setbacks.left + s.buildableWidth / 2,
    s.buildingHeight + 1.5,
    s.setbacks.front + s.buildableDepth / 2,
  ],
  getArea: () => '',
  description: '',
}

// ─── Tour Step Visibility ─────────────────────────────────────────────────────

function isVisibleAtStep(minTourStep: TourStep, currentStep: TourStep): boolean {
  // null or 5 = show all
  if (currentStep === null || currentStep === 5) return true
  if (minTourStep === null) return true
  return currentStep >= minTourStep
}

// ─── Data Hook ────────────────────────────────────────────────────────────────

function useHotspotData() {
  const lotWidth = useSiteControlsStore((s) => s.inputs.lotWidth)
  const lotDepth = useSiteControlsStore((s) => s.inputs.lotDepth)
  const buildingHeight = useSiteControlsStore((s) => s.computed.buildingHeight)
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
    violations: computed.violations,
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
  const color = CATEGORY_COLORS[def.category]

  // Build tooltip area text; violation hotspot uses first violation message
  const areaText = def.id === 'violation'
    ? data.violations[0]?.message ?? ''
    : def.getArea(data)

  const citationText = def.id === 'violation'
    ? (data.violations[0]?.codeCitation ?? '')
    : def.citation

  const descText = def.id === 'violation'
    ? data.violations.map((v) => v.message).join(' — ')
    : def.description

  return (
    <div
      className="relative cursor-pointer select-none"
      onClick={(e) => {
        e.stopPropagation()
        onToggle()
      }}
    >
      {/* Dot */}
      <div
        className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-white shadow-md"
        style={{ backgroundColor: color }}
      >
        <span className="font-mono text-[11px] font-bold text-white">
          {def.label[0]}
        </span>
      </div>

      {/* Expanded tooltip */}
      {isActive && (
        <div className="absolute left-7 top-0 z-50 w-64 rounded-md border border-[#D4DAE3] bg-white p-3 shadow-sm">
          <p className="mb-0.5 font-mono text-xs font-bold" style={{ color }}>
            {def.label}
          </p>
          <p className="mb-1 text-[11px] font-medium text-[#1A2332]">
            {def.fullName}
          </p>
          {areaText && (
            <p className="mb-1 font-mono text-xs text-[#1A2332]">
              {areaText}
            </p>
          )}
          {descText && (
            <p className="mb-2 text-xs leading-relaxed text-[#4A5568]">
              {descText}
            </p>
          )}
          {citationText && (
            <p className="font-mono text-[10px] text-[#8896A7]">
              {citationText}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function ZoneHotspots() {
  const activeZone = useSiteControlsStore((s) => s.activeZone)
  const setActiveZone = useSiteControlsStore((s) => s.setActiveZone)
  const tourStep = useSiteControlsStore((s) => s.tourStep)
  const data = useHotspotData()

  // Progressive disclosure: hotspots appear after 2-second delay (UX plan Layer 2)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 2000)
    return () => clearTimeout(timer)
  }, [])

  if (!visible) return null

  // Build the active hotspot list based on tour step
  const activeHotspots: HotspotDef[] = HOTSPOTS.filter((def) =>
    isVisibleAtStep(def.minTourStep, tourStep)
  )

  // Add conditional violation hotspot when there are violations and tour step allows it
  if (
    data.violations.length > 0 &&
    isVisibleAtStep(VIOLATION_HOTSPOT.minTourStep, tourStep)
  ) {
    activeHotspots.push(VIOLATION_HOTSPOT)
  }

  return (
    <>
      {activeHotspots.map((def) => (
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
