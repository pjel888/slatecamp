// src/app/dashboard/3d-lab/_templates/FloorPlanWalkthrough.tsx
'use client'

import { useMemo } from 'react'
import { Warning } from '@phosphor-icons/react/dist/ssr'
import { SCIcon } from '@/components/graphics/icons/Icon'
import { CanvasWrapper } from '@/features/3d-lab/components/CanvasWrapper'
import { GenericControlPanel } from '@/features/3d-lab/components/templates/GenericControlPanel'
import { FloorPlanScene } from './FloorPlanScene'
import { createModuleStore } from '@/features/3d-lab/stores/createModuleStore'
import type { FloorPlanConfig } from '@/features/3d-lab/types/templates'

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
      <SCIcon icon={Warning} size="xs" className="shrink-0" />
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
    { color: 'bg-camp-cobalt', label: 'Sprinkler head' },
    { color: 'bg-red-400/60', label: 'Dead-end violation zone' },
  ]

  return (
    <div className="absolute right-4 top-4 z-10 bg-card/90 backdrop-blur-sm border border-border rounded-md shadow-lg p-2.5 space-y-1.5">
      <span className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">
        Legend
      </span>
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-2">
          <span className={`w-3 h-2 rounded-sm ${item.color} shrink-0`} />
          <span className="text-[11px] font-medium text-foreground">
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

  const params = useStore((s) => s.params)
  const cameraPos = config.camera?.position ?? [0, 15, 8]
  const cameraFov = config.camera?.fov ?? 45

  // Compliance computer for path lines
  const computePathCompliance = useMemo(() => {
    return (
      path: { id: string; points: Array<[number, number]> },
      pathParams: Record<string, number | boolean | string>
    ) => {
      const occupancy = String(pathParams.occupancyType ?? 'Assembly/Business')
      const sprinklered = Boolean(pathParams.sprinklered ?? true)
      const maxDist = getMaxTravelDistance(occupancy, sprinklered)
      const actual = pathLength(path.points)
      return { actualDistance: actual, maxDistance: maxDist }
    }
  }, [])

  // Dead-end zone bounds — 8m spur exceeds limit for some occupancy types
  const deadEndZones = useMemo(() => {
    const occupancy = String(params.occupancyType ?? 'Assembly/Business')
    const deadEndLimit = DEAD_END_LIMITS[occupancy] ?? 15
    if (8 > deadEndLimit) {
      return [[22, 8.5, 8, 3] as [number, number, number, number]]
    }
    return [] as Array<[number, number, number, number]>
  }, [params.occupancyType])

  return (
    <div className="relative h-full w-full">
      {/* 3D Canvas */}
      <CanvasWrapper
        sceneConfig={{
          cameraPosition: cameraPos,
          cameraFov: cameraFov,
          showGround: false,
          minDistance: 5,
          maxDistance: 40,
        }}
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

