// src/app/dashboard/3d-lab/_templates/FloorPlanWalkthrough.tsx
'use client'

import { useMemo } from 'react'
import { AlertTriangle } from 'lucide-react'
import { CanvasWrapper } from '../_components/CanvasWrapper'
import { GenericControlPanel } from '../_components/GenericControlPanel'
import { FloorPlanScene } from './FloorPlanScene'
import { createModuleStore } from '../_stores/createModuleStore'
import type { FloorPlanConfig } from '../_types/templates'

// ─── Violation Summary Bar ──────────────────────────────────────────────────

function ViolationBar({
  config,
  useStore,
}: {
  config: FloorPlanConfig
  useStore: ReturnType<typeof createModuleStore>
}) {
  const params = useStore((s) => s.params)

  const activeViolations = useMemo(
    () => (config.violations ?? []).filter((v) => v.check(params)),
    [config.violations, params]
  )

  if (activeViolations.length === 0) return null

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 bg-red-600 text-white rounded-md px-3 py-1.5 shadow-lg">
      <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
      <span className="text-[11px] font-bold">
        {activeViolations.length} code violation
        {activeViolations.length !== 1 ? 's' : ''} detected
      </span>
    </div>
  )
}

// ─── Legend Overlay ──────────────────────────────────────────────────────────

function LegendOverlay() {
  const items = [
    { color: 'bg-green-500', label: 'Compliant path' },
    { color: 'bg-red-500', label: 'Travel distance exceeded' },
    { color: 'bg-green-600', label: 'Exit' },
    { color: 'bg-blue-500', label: 'Sprinkler head' },
    { color: 'bg-red-400/60', label: 'Dead-end violation zone' },
  ]

  return (
    <div className="absolute right-4 top-4 z-10 bg-white/90 backdrop-blur-sm border border-border rounded-md shadow-lg p-2.5 space-y-1.5">
      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
        Legend
      </span>
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-2">
          <span className={`w-3 h-2 rounded-sm ${item.color} shrink-0`} />
          <span className="text-[10px] font-medium text-zinc-600">
            {item.label}
          </span>
        </div>
      ))}
    </div>
  )
}

// ─── Travel Distance Computation ────────────────────────────────────────────

/** Travel distance limits per occupancy type: [no sprinkler, sprinklered] in meters */
const TRAVEL_DISTANCE_LIMITS: Record<string, [number, number]> = {
  'Assembly/Business': [46, 61],
  Mercantile: [30, 46],
  Industrial: [31, 46],
  Educational: [46, 61],
  Residential: [46, 61],
}

/** Dead-end corridor limits by occupancy type in meters */
const DEAD_END_LIMITS: Record<string, number> = {
  'Assembly/Business': 6,
  Mercantile: 15,
  Industrial: 15,
  Educational: 6,
  Residential: 15,
}

function getMaxTravelDistance(
  occupancy: string,
  sprinklered: boolean
): number {
  const limits = TRAVEL_DISTANCE_LIMITS[occupancy] ?? [46, 61]
  return sprinklered ? limits[1] : limits[0]
}

function pathLength(points: Array<[number, number]>): number {
  let total = 0
  for (let i = 1; i < points.length; i++) {
    const dx = points[i][0] - points[i - 1][0]
    const dz = points[i][1] - points[i - 1][1]
    total += Math.sqrt(dx * dx + dz * dz)
  }
  return total
}

// ─── Main Component ─────────────────────────────────────────────────────────

interface FloorPlanWalkthroughProps {
  config: FloorPlanConfig
}

export default function FloorPlanWalkthrough({
  config,
}: FloorPlanWalkthroughProps) {
  // Build default values from parameter definitions
  const defaults = useMemo(() => {
    const d: Record<string, number | boolean | string> = {}
    for (const p of config.parameters ?? []) {
      d[p.key] = p.default
    }
    return d
  }, [config.parameters])

  // Create a stable Zustand store
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const useStore = useMemo(() => createModuleStore(defaults), [config.id])

  const cameraPos = config.camera?.position ?? [0, 15, 8]
  const cameraFov = config.camera?.fov ?? 45

  // Compliance computer for path lines
  const computePathCompliance = useMemo(() => {
    return (
      path: { id: string; points: Array<[number, number]> },
      params: Record<string, number | boolean | string>
    ) => {
      const occupancy = String(params.occupancyType ?? 'Assembly/Business')
      const sprinklered = Boolean(params.sprinklered ?? true)
      const maxDist = getMaxTravelDistance(occupancy, sprinklered)
      const actual = pathLength(path.points)
      return { actualDistance: actual, maxDistance: maxDist }
    }
  }, [])

  // Dead-end zone bounds (static dead-end corridor spur area)
  const DeadEndZoneComputer = useMemo(() => {
    return function useDeadEndZones() {
      const params = useStore((s) => s.params)
      const occupancy = String(params.occupancyType ?? 'Assembly/Business')
      const deadEndLimit = DEAD_END_LIMITS[occupancy] ?? 15

      // The dead-end corridor spur is 8m long; if it exceeds the limit, highlight it
      if (8 > deadEndLimit) {
        // Dead-end spur location from config: typically at the end of the corridor
        // We return the bounds of the dead-end spur area
        return [[22, 8.5, 8, 3] as [number, number, number, number]]
      }
      return []
    }
  }, [useStore])

  // We need a wrapper that uses the hook
  return <FloorPlanWalkthroughInner
    config={config}
    useStore={useStore}
    cameraPos={cameraPos}
    cameraFov={cameraFov}
    computePathCompliance={computePathCompliance}
    DeadEndZoneComputer={DeadEndZoneComputer}
  />
}

// Inner component that can use hooks from the store
function FloorPlanWalkthroughInner({
  config,
  useStore,
  cameraPos,
  cameraFov,
  computePathCompliance,
  DeadEndZoneComputer,
}: {
  config: FloorPlanConfig
  useStore: ReturnType<typeof createModuleStore>
  cameraPos: [number, number, number]
  cameraFov: number
  computePathCompliance: (
    path: { id: string; points: Array<[number, number]> },
    params: Record<string, number | boolean | string>
  ) => { actualDistance: number; maxDistance: number }
  DeadEndZoneComputer: () => Array<[number, number, number, number]>
}) {
  const deadEndZones = DeadEndZoneComputer()

  return (
    <div className="relative h-full w-full">
      {/* 3D Canvas */}
      <CanvasWrapper
        cameraPosition={cameraPos}
        cameraFov={cameraFov}
        showGround={false}
        minDistance={5}
        maxDistance={40}
      >
        <FloorPlanScene
          config={config}
          useStore={useStore}
          computePathCompliance={computePathCompliance}
          deadEndZones={deadEndZones}
          sprinklerRadius={3}
        />
      </CanvasWrapper>

      {/* Control Panel */}
      <GenericControlPanel
        title={config.title}
        parameters={config.parameters ?? []}
        presets={config.presets}
        useStore={useStore}
      />

      {/* Legend */}
      <LegendOverlay />

      {/* Violation Summary Bar */}
      <ViolationBar config={config} useStore={useStore} />
    </div>
  )
}
