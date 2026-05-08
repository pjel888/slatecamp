'use client'

import { useEffect, useMemo, useState } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { Edges, Line, OrbitControls, PerspectiveCamera } from '@react-three/drei'
import { WebGLErrorBoundary } from '@/components/r3f/WebGLErrorBoundary'
import { palette } from '@/components/graphics/tokens'
import { computeDevControls } from '@/lib/pd1096/computationEngine'
import type { BuildingParams, DevControlsResult, FirewallSide, LotParams, ZoneClass } from '@/lib/pd1096/types'

const SCENE_SCALE = 0.22
const LOT_PLATE_THICKNESS = 0.035
const BUILDING_HEIGHT_UNITS = 0.72
const BUILDABLE_LINE_LIFT = 0.09
const DEFAULT_RROW_WIDTH_M = 10
const DEFAULT_BUILDING_WIDTH_M = 12
const BUILDING_WIDTH_STEP_M = 0.5
const BUILDING_WIDTH_MIN_RATIO = 0.6
const BUILDING_WIDTH_OVERFLOW_ALLOWANCE_M = 2

const HERO_SCENE_COLORS = {
  lotSurface: palette.surfaceLight,
  building: palette.inkPrimary,
  guide: palette.slateBlue,
  violation: palette.warmRed,
  edge: palette.borderDefault,
  textLine: palette.inkSecondary,
} as const

type WidthState = 'comfortable' | 'setback' | 'lot'

interface HeroLotPreset {
  label: string
  width: number
  depth: number
  zoneClass: ZoneClass
  firewallActive: boolean
  firewallSides: FirewallSide[]
  building: BuildingParams
  rrowWidth: number
}

const HERO_LOT_PRESET: HeroLotPreset = {
  label: 'R-1 sample study lot',
  width: 20,
  depth: 15,
  zoneClass: 'R-1',
  firewallActive: false,
  firewallSides: [],
  building: { proposedFootprintWidth: DEFAULT_BUILDING_WIDTH_M, proposedFootprintDepth: 6, proposedStoreys: 2, floorHeight: 3 },
  rrowWidth: DEFAULT_RROW_WIDTH_M,
}

const formatMeters = (value: number) => `${value.toFixed(value % 1 === 0 ? 0 : 1)} m`
const toSceneUnits = (meters: number) => meters * SCENE_SCALE

const computePresetResult = (preset: HeroLotPreset): DevControlsResult => {
  const lot: LotParams = { width: preset.width, depth: preset.depth, type: 'interior' }

  return computeDevControls({
    lot,
    zoning: {
      zoneClass: preset.zoneClass,
      firewallActive: preset.firewallActive,
      firewallSides: preset.firewallSides,
    },
    building: preset.building,
    rrow: { width: preset.rrowWidth },
  })
}

const getWidthState = ({
  buildingWidth,
  buildableWidth,
  lotWidth,
}: {
  buildingWidth: number
  buildableWidth: number
  lotWidth: number
}): WidthState => {
  if (buildingWidth > lotWidth) return 'lot'
  if (buildingWidth > buildableWidth) return 'setback'
  return 'comfortable'
}

const getWidthStateCopy = (widthState: WidthState) => {
  if (widthState === 'lot') {
    return {
      label: 'Beyond lot line',
      body: 'Now the mass is wider than the sample lot. That is the instant red flag.',
      accentClass: 'text-red-700',
    }
  }

  if (widthState === 'setback') {
    return {
      label: 'Crossing the setback',
      body: 'The house still fits on the lot, but it is already crossing the side setback line.',
      accentClass: 'text-red-700',
    }
  }

  return {
    label: 'Inside the buildable area',
    body: 'The house sits inside the lot and inside the side setback lines.',
    accentClass: 'text-camp-cobalt',
  }
}

const SceneInvalidator = ({ depsKey }: { depsKey: string }) => {
  const { invalidate, gl } = useThree()

  useEffect(() => {
    gl.setClearColor(HERO_SCENE_COLORS.lotSurface, 0)
    invalidate()
  }, [depsKey, gl, invalidate])

  return null
}

const RectLine = ({
  width,
  depth,
  y,
  color,
  lineWidth = 1.5,
}: {
  width: number
  depth: number
  y: number
  color: string
  lineWidth?: number
}) => {
  const halfWidth = width / 2
  const halfDepth = depth / 2

  return (
    <Line
      points={[
        [-halfWidth, y, -halfDepth],
        [halfWidth, y, -halfDepth],
        [halfWidth, y, halfDepth],
        [-halfWidth, y, halfDepth],
        [-halfWidth, y, -halfDepth],
      ]}
      color={color}
      lineWidth={lineWidth}
    />
  )
}

const SideSetbackLines = ({
  lotWidth,
  lotDepth,
  leftSetback,
  rightSetback,
}: {
  lotWidth: number
  lotDepth: number
  leftSetback: number
  rightSetback: number
}) => {
  const y = LOT_PLATE_THICKNESS + BUILDABLE_LINE_LIFT + 0.01
  const halfDepth = lotDepth / 2

  return (
    <>
      <Line
        points={[
          [-lotWidth / 2 + leftSetback, y, -halfDepth],
          [-lotWidth / 2 + leftSetback, y, halfDepth],
        ]}
        color={HERO_SCENE_COLORS.guide}
        lineWidth={2}
      />
      <Line
        points={[
          [lotWidth / 2 - rightSetback, y, -halfDepth],
          [lotWidth / 2 - rightSetback, y, halfDepth],
        ]}
        color={HERO_SCENE_COLORS.guide}
        lineWidth={2}
      />
    </>
  )
}

const HeroEnvelopeFallbackPoster = ({ widthState }: { widthState: WidthState }) => {
  const stateCopy = getWidthStateCopy(widthState)

  return (
    <div className='absolute inset-0 flex items-center justify-center bg-transparent p-6 text-center'>
      <div className='max-w-sm'>
        <p className='font-[family-name:var(--font-dm-mono)] text-[10px] font-semibold uppercase tracking-[0.18em] text-camp-cobalt'>
          3D preview fallback
        </p>
        <p className={`mt-2 text-sm font-semibold ${stateCopy.accentClass}`}>{stateCopy.label}</p>
        <p className='mt-2 text-xs leading-relaxed text-text-2'>
          Your browser can still use the building-width study control if WebGL is unavailable.
        </p>
      </div>
    </div>
  )
}

const HeroEnvelopeScene = ({
  preset,
  result,
  buildingWidthMeters,
  widthState,
}: {
  preset: HeroLotPreset
  result: DevControlsResult
  buildingWidthMeters: number
  widthState: WidthState
}) => {
  const lotWidth = toSceneUnits(preset.width)
  const lotDepth = toSceneUnits(preset.depth)
  const buildableWidth = toSceneUnits(Math.max(result.buildableWidth, 0.1))
  const buildableDepth = toSceneUnits(Math.max(result.buildableDepth, 0.1))
  const buildingWidth = toSceneUnits(buildingWidthMeters)
  const buildingDepth = toSceneUnits(Math.min(preset.building.proposedFootprintDepth, Math.max(result.buildableDepth, 0.1)))
  const sideSetbackLeft = toSceneUnits(result.setbacks.effective.left)
  const sideSetbackRight = toSceneUnits(result.setbacks.effective.right)
  const isViolation = widthState !== 'comfortable'
  const edgeColor = isViolation ? HERO_SCENE_COLORS.violation : HERO_SCENE_COLORS.guide
  const depsKey = `${buildingWidthMeters}:${widthState}:${result.buildableWidth}:${result.buildableDepth}`

  return (
    <>
      <SceneInvalidator depsKey={depsKey} />
      <PerspectiveCamera makeDefault position={[2.9, 2.45, 3.35]} fov={32} />
      <OrbitControls
        makeDefault
        enablePan={false}
        enableZoom={false}
        enableRotate={false}
        minPolarAngle={Math.PI / 5}
        maxPolarAngle={Math.PI / 2.35}
      />
      <ambientLight intensity={1.08} />
      <directionalLight position={[4, 7, 5]} intensity={1.25} castShadow />
      <directionalLight position={[-5, 3, -4]} intensity={0.24} color={HERO_SCENE_COLORS.guide} />

      <group rotation={[0, -0.16, 0]}>
        <mesh position={[0, 0, 0]} receiveShadow>
          <boxGeometry args={[lotWidth, LOT_PLATE_THICKNESS, lotDepth]} />
          <meshStandardMaterial color={HERO_SCENE_COLORS.lotSurface} roughness={0.94} metalness={0.01} />
          <Edges color={HERO_SCENE_COLORS.edge} />
        </mesh>

        <RectLine
          width={lotWidth}
          depth={lotDepth}
          y={LOT_PLATE_THICKNESS + BUILDABLE_LINE_LIFT}
          color={widthState === 'lot' ? HERO_SCENE_COLORS.violation : HERO_SCENE_COLORS.textLine}
          lineWidth={1.6}
        />
        <RectLine
          width={buildableWidth}
          depth={buildableDepth}
          y={LOT_PLATE_THICKNESS + BUILDABLE_LINE_LIFT + 0.018}
          color={edgeColor}
          lineWidth={2.25}
        />
        <SideSetbackLines
          lotWidth={lotWidth}
          lotDepth={lotDepth}
          leftSetback={sideSetbackLeft}
          rightSetback={sideSetbackRight}
        />

        <mesh position={[0, LOT_PLATE_THICKNESS + BUILDING_HEIGHT_UNITS / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[buildingWidth, BUILDING_HEIGHT_UNITS, buildingDepth]} />
          <meshStandardMaterial color={HERO_SCENE_COLORS.building} roughness={0.62} metalness={0.04} />
          <Edges color={edgeColor} />
        </mesh>
      </group>
    </>
  )
}

const HeroEnvelopeCanvas = ({
  preset,
  result,
  buildingWidthMeters,
  widthState,
}: {
  preset: HeroLotPreset
  result: DevControlsResult
  buildingWidthMeters: number
  widthState: WidthState
}) => (
  <div
    className='relative z-10 h-full min-h-[455px] w-full overflow-visible bg-transparent'
    role='img'
    aria-label='Educational Three.js diagram showing a sample lot, side setback lines, and a building mass that grows until it crosses the setback and then the lot line.'
  >
    <WebGLErrorBoundary fallback={<HeroEnvelopeFallbackPoster widthState={widthState} />}>
      <Canvas
        frameloop='demand'
        dpr={[1, 1.5]}
        shadows
        gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
        fallback={<HeroEnvelopeFallbackPoster widthState={widthState} />}
      >
        <HeroEnvelopeScene
          preset={preset}
          result={result}
          buildingWidthMeters={buildingWidthMeters}
          widthState={widthState}
        />
      </Canvas>
    </WebGLErrorBoundary>
  </div>
)

export const HeroCodeEnvelopeExplorer = () => {
  const preset = HERO_LOT_PRESET
  const result = useMemo(() => computePresetResult(preset), [preset])
  const minBuildingWidth = Math.round(result.buildableWidth * BUILDING_WIDTH_MIN_RATIO)
  const maxBuildingWidth = preset.width + BUILDING_WIDTH_OVERFLOW_ALLOWANCE_M
  const [buildingWidthMeters, setBuildingWidthMeters] = useState(DEFAULT_BUILDING_WIDTH_M)
  const widthState = getWidthState({
    buildingWidth: buildingWidthMeters,
    buildableWidth: result.buildableWidth,
    lotWidth: preset.width,
  })
  const stateCopy = getWidthStateCopy(widthState)
  const storyWidths = [
    { label: 'Safe width', width: DEFAULT_BUILDING_WIDTH_M },
    { label: 'Cross setback', width: Math.min(result.buildableWidth + 1, maxBuildingWidth) },
    { label: 'Beyond lot', width: Math.min(preset.width + 1, maxBuildingWidth) },
  ] as const
  const safeEndPercent = ((result.buildableWidth - minBuildingWidth) / (maxBuildingWidth - minBuildingWidth)) * 100
  const lotLinePercent = ((preset.width - minBuildingWidth) / (maxBuildingWidth - minBuildingWidth)) * 100
  const sliderBackground = `linear-gradient(to right, ${palette.slateBlue} 0%, ${palette.slateBlue} ${safeEndPercent}%, ${palette.inkTertiary} ${safeEndPercent}%, ${palette.inkTertiary} ${lotLinePercent}%, ${palette.warmRed} ${lotLinePercent}%, ${palette.warmRed} 100%)`

  return (
    <div className='relative min-h-[530px] overflow-visible py-2 lg:py-0'>
      <h2 className='sr-only'>Widen the house. See when the lot stops working.</h2>

      <HeroEnvelopeCanvas
        preset={preset}
        result={result}
        buildingWidthMeters={buildingWidthMeters}
        widthState={widthState}
      />

      <div aria-live='polite' className={`pointer-events-none absolute right-2 top-8 max-w-[255px] text-[12px] font-semibold leading-relaxed ${stateCopy.accentClass}`}>
        <p className='font-[family-name:var(--font-dm-mono)] text-[10px] uppercase tracking-[0.14em]'>
          {stateCopy.label}
        </p>
        <p className='mt-1 text-camp-black'>{stateCopy.body}</p>
      </div>

      <div className='absolute inset-x-0 bottom-0 z-20 space-y-3 bg-transparent'>
        <div className='flex flex-wrap items-end justify-between gap-3'>
          <div>
            <label htmlFor='building-width' className='text-[13px] font-extrabold text-camp-black'>
              Building width: {formatMeters(buildingWidthMeters)}
            </label>
            <p className='mt-1 text-[12px] font-medium leading-relaxed text-text-2'>
              Drag or jump through the story: safe width → side setback breach → beyond the lot line.
            </p>
          </div>
          <div className='flex flex-wrap gap-1.5' aria-label='Width story presets'>
            {storyWidths.map((story) => (
              <button
                key={story.label}
                type='button'
                onClick={() => setBuildingWidthMeters(story.width)}
                className='rounded-sm border border-border-design/70 bg-white/45 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-camp-black backdrop-blur-sm transition-colors hover:border-camp-cobalt/50 hover:text-camp-cobalt focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-camp-cobalt focus-visible:ring-offset-2'
              >
                {story.label}
              </button>
            ))}
          </div>
        </div>

        <input
          id='building-width'
          min={minBuildingWidth}
          max={maxBuildingWidth}
          step={BUILDING_WIDTH_STEP_M}
          value={buildingWidthMeters}
          onChange={(event) => setBuildingWidthMeters(Number(event.target.value))}
          type='range'
          className='h-2 w-full cursor-pointer appearance-none rounded-full accent-camp-cobalt [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-camp-cobalt [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-camp-cobalt'
          style={{ background: sliderBackground }}
          aria-describedby='building-width-help'
        />
        <div id='building-width-help' className='flex justify-between font-[family-name:var(--font-dm-mono)] text-[10px] font-semibold uppercase tracking-[0.12em] text-text-2'>
          <span>Safe</span>
          <span>Buildable width {formatMeters(result.buildableWidth)}</span>
          <span>Lot width {formatMeters(preset.width)}</span>
        </div>
        <p className='text-[11px] font-medium leading-relaxed text-text-2'>
          Side setbacks: left {formatMeters(result.setbacks.effective.left)} · right {formatMeters(result.setbacks.effective.right)}. Educational preview only; use the full 3D Lab and source-backed wiki before relying on a rule.
        </p>
      </div>
    </div>
  )
}
