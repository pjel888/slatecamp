'use client'

import { useEffect, useMemo, useState } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { Edges, Html, Line, OrbitControls, PerspectiveCamera } from '@react-three/drei'
import { WebGLErrorBoundary } from '@/components/r3f/WebGLErrorBoundary'
import { palette } from '@/components/graphics/tokens'
import { computeDevControls } from '@/lib/pd1096/computationEngine'
import type { BuildingParams, DevControlsResult, FirewallSide, LotParams, ZoneClass } from '@/lib/pd1096/types'

const EAVE_MINIMUM_CLEARANCE_MM = 750
const MILLIMETERS_PER_METER = 1000
const SCENE_SCALE = 0.13
const LOT_PLATE_THICKNESS = 0.04
const BUILDING_HEIGHT_UNITS = 0.72
const SETBACK_ZONE_HEIGHT = 0.035
const DEFAULT_RROW_WIDTH_M = 10

const HERO_SCENE_COLORS = {
  clear: palette.emerald,
  warning: palette.warmRed,
  amber: palette.amber,
  blueLight: palette.infoBlue,
  lotSurface: palette.inkPrimary,
  building: palette.slateBlue,
  propertyLine: palette.surfaceFocused,
  transparentWhiteEdge: 'rgba(255,255,255,0.28)',
  transparentWhiteStrongEdge: 'rgba(255,255,255,0.34)',
  transparentWhiteGuide: 'rgba(255,255,255,0.46)',
  transparentAmberSoftEdge: 'rgba(212,149,26,0.55)',
  transparentAmberStrongEdge: 'rgba(212,149,26,0.72)',
} as const

const EAVE_OPTIONS = [600, 800, 950, 1100] as const

type LotPresetIndex = 0 | 1 | 2

interface HeroLotPreset {
  label: string
  shortLabel: string
  width: number
  depth: number
  zoneClass: ZoneClass
  firewallActive: boolean
  firewallSides: FirewallSide[]
  building: BuildingParams
  rrowWidth: number
}

const LOT_PRESETS: readonly HeroLotPreset[] = [
  {
    label: 'R-1 board-review lot',
    shortLabel: 'R-1 practice case',
    width: 20,
    depth: 15,
    zoneClass: 'R-1',
    firewallActive: false,
    firewallSides: [],
    building: { proposedFootprintWidth: 12, proposedFootprintDepth: 6, proposedStoreys: 2, floorHeight: 3 },
    rrowWidth: DEFAULT_RROW_WIDTH_M,
  },
  {
    label: 'R-2 rowhouse lot',
    shortLabel: 'Firewall study case',
    width: 8,
    depth: 20,
    zoneClass: 'R-2-basic',
    firewallActive: true,
    firewallSides: ['left'],
    building: { proposedFootprintWidth: 5, proposedFootprintDepth: 14, proposedStoreys: 3, floorHeight: 3 },
    rrowWidth: 8,
  },
  {
    label: 'C-1 commercial lot',
    shortLabel: 'Road-width case',
    width: 30,
    depth: 40,
    zoneClass: 'Com-1',
    firewallActive: false,
    firewallSides: [],
    building: { proposedFootprintWidth: 18, proposedFootprintDepth: 28, proposedStoreys: 4, floorHeight: 3.5 },
    rrowWidth: 15,
  },
] as const

const formatMeters = (value: number) => `${value.toFixed(value % 1 === 0 ? 0 : 1)} m`
const toSceneUnits = (meters: number) => meters * SCENE_SCALE

const getCenteredBuildingWidthMeters = (preset: HeroLotPreset, result: DevControlsResult) =>
  Math.min(preset.building.proposedFootprintWidth, Math.max(result.buildableWidth, 0.1))

const calculateSceneSideClearanceMm = ({
  preset,
  result,
  eaveProjection,
}: {
  preset: HeroLotPreset
  result: DevControlsResult
  eaveProjection: number
}) => {
  const centeredBuildingWidth = getCenteredBuildingWidthMeters(preset, result)
  const sideClearanceMeters = (preset.width - centeredBuildingWidth) / 2
  return Math.round(sideClearanceMeters * MILLIMETERS_PER_METER - eaveProjection)
}

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

const SceneInvalidator = ({ depsKey }: { depsKey: string }) => {
  const { invalidate, gl } = useThree()

  useEffect(() => {
    gl.setClearColor(HERO_SCENE_COLORS.lotSurface, 0)
    invalidate()
  }, [depsKey, gl, invalidate])

  return null
}

const SetbackZone = ({
  position,
  size,
}: {
  position: [number, number, number]
  size: [number, number, number]
}) => (
  <mesh position={position} receiveShadow>
    <boxGeometry args={size} />
    <meshStandardMaterial color={HERO_SCENE_COLORS.amber} transparent opacity={0.2} roughness={0.85} />
    <Edges color={HERO_SCENE_COLORS.transparentAmberSoftEdge} />
  </mesh>
)

const PropertyLine = ({ width, depth }: { width: number; depth: number }) => {
  const halfWidth = width / 2
  const halfDepth = depth / 2
  const y = LOT_PLATE_THICKNESS + 0.015

  return (
    <Line
      points={[
        [-halfWidth, y, -halfDepth],
        [halfWidth, y, -halfDepth],
        [halfWidth, y, halfDepth],
        [-halfWidth, y, halfDepth],
        [-halfWidth, y, -halfDepth],
      ]}
      color={HERO_SCENE_COLORS.propertyLine}
      lineWidth={1.2}
      dashed
      dashSize={0.16}
      gapSize={0.08}
    />
  )
}

const HeroEnvelopeFallbackPoster = ({ isCompliant }: { isCompliant: boolean }) => (
  <div className='absolute inset-0 flex items-center justify-center bg-camp-black p-6 text-center text-white'>
    <div className='max-w-sm rounded-2xl border border-white/10 bg-white/8 p-5 shadow-2xl'>
      <p className='font-[family-name:var(--font-dm-mono)] text-[10px] font-semibold uppercase tracking-[0.18em] text-camp-amber'>
        3D preview fallback
      </p>
      <p className='mt-2 text-sm font-semibold'>
        {isCompliant ? 'Compliant clearance state shown.' : 'Clearance warning state shown.'}
      </p>
      <p className='mt-2 text-xs leading-relaxed text-white/70'>
        Your browser can still use the study controls and dimensions if WebGL is unavailable.
      </p>
    </div>
  </div>
)

const HeroEnvelopeScene = ({
  preset,
  result,
  showSetbacks,
  eaveProjection,
  clearDistance,
  isCompliant,
}: {
  preset: HeroLotPreset
  result: DevControlsResult
  showSetbacks: boolean
  eaveProjection: number
  clearDistance: number
  isCompliant: boolean
}) => {
  const lotWidth = toSceneUnits(preset.width)
  const lotDepth = toSceneUnits(preset.depth)
  const buildingWidth = toSceneUnits(getCenteredBuildingWidthMeters(preset, result))
  const buildingDepth = toSceneUnits(Math.min(preset.building.proposedFootprintDepth, Math.max(result.buildableDepth, 0.1)))
  const buildableWidth = toSceneUnits(result.buildableWidth)
  const buildableDepth = toSceneUnits(result.buildableDepth)
  const eaveProjectionUnits = toSceneUnits(eaveProjection / MILLIMETERS_PER_METER)
  const propertySideX = lotWidth / 2
  const roofWidth = buildingWidth + eaveProjectionUnits * 2
  const roofDepth = buildingDepth + eaveProjectionUnits * 2
  const clearanceColor = isCompliant ? HERO_SCENE_COLORS.clear : HERO_SCENE_COLORS.warning
  const depsKey = `${preset.label}:${showSetbacks}:${eaveProjection}:${result.buildableWidth}:${result.buildableDepth}`
  const sideSetbackLeft = toSceneUnits(result.setbacks.effective.left)
  const sideSetbackRight = toSceneUnits(result.setbacks.effective.right)
  const frontSetback = toSceneUnits(result.setbacks.effective.front)
  const rearSetback = toSceneUnits(result.setbacks.effective.rear)
  const setbackY = LOT_PLATE_THICKNESS + SETBACK_ZONE_HEIGHT / 2

  return (
    <>
      <SceneInvalidator depsKey={depsKey} />
      <PerspectiveCamera makeDefault position={[3.7, 3.2, 4.6]} fov={38} />
      <OrbitControls
        makeDefault
        enablePan={false}
        enableZoom={false}
        autoRotate
        autoRotateSpeed={0.22}
        minPolarAngle={Math.PI / 5}
        maxPolarAngle={Math.PI / 2.25}
      />
      <ambientLight intensity={0.72} />
      <directionalLight position={[4, 7, 5]} intensity={1.7} castShadow />
      <directionalLight position={[-5, 3, -4]} intensity={0.45} color={HERO_SCENE_COLORS.blueLight} />

      <group rotation={[0, -0.18, 0]}>
        <mesh position={[0, 0, 0]} receiveShadow>
          <boxGeometry args={[lotWidth, LOT_PLATE_THICKNESS, lotDepth]} />
          <meshStandardMaterial color={HERO_SCENE_COLORS.lotSurface} roughness={0.92} metalness={0.02} />
          <Edges color={HERO_SCENE_COLORS.transparentWhiteEdge} />
        </mesh>
        <PropertyLine width={lotWidth} depth={lotDepth} />

        {showSetbacks && (
          <>
            <SetbackZone
              position={[0, setbackY, lotDepth / 2 - frontSetback / 2]}
              size={[lotWidth, SETBACK_ZONE_HEIGHT, Math.max(frontSetback, 0.01)]}
            />
            <SetbackZone
              position={[0, setbackY, -lotDepth / 2 + rearSetback / 2]}
              size={[lotWidth, SETBACK_ZONE_HEIGHT, Math.max(rearSetback, 0.01)]}
            />
            <SetbackZone
              position={[-lotWidth / 2 + sideSetbackLeft / 2, setbackY, 0]}
              size={[Math.max(sideSetbackLeft, 0.01), SETBACK_ZONE_HEIGHT, lotDepth]}
            />
            <SetbackZone
              position={[lotWidth / 2 - sideSetbackRight / 2, setbackY, 0]}
              size={[Math.max(sideSetbackRight, 0.01), SETBACK_ZONE_HEIGHT, lotDepth]}
            />
            <mesh position={[0, LOT_PLATE_THICKNESS + 0.025, 0]}>
              <boxGeometry args={[Math.max(buildableWidth, 0.01), 0.02, Math.max(buildableDepth, 0.01)]} />
              <meshStandardMaterial color={HERO_SCENE_COLORS.amber} transparent opacity={0.12} roughness={0.9} />
              <Edges color={HERO_SCENE_COLORS.transparentAmberStrongEdge} />
            </mesh>
          </>
        )}

        <mesh position={[0, LOT_PLATE_THICKNESS + BUILDING_HEIGHT_UNITS / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[buildingWidth, BUILDING_HEIGHT_UNITS, buildingDepth]} />
          <meshStandardMaterial color={HERO_SCENE_COLORS.building} roughness={0.58} metalness={0.08} />
          <Edges color={HERO_SCENE_COLORS.transparentWhiteStrongEdge} />
        </mesh>

        <mesh position={[0, LOT_PLATE_THICKNESS + BUILDING_HEIGHT_UNITS + 0.045, 0]} castShadow>
          <boxGeometry args={[roofWidth, 0.09, roofDepth]} />
          <meshStandardMaterial color={isCompliant ? HERO_SCENE_COLORS.amber : HERO_SCENE_COLORS.warning} roughness={0.5} metalness={0.02} />
          <Edges color={clearanceColor} />
        </mesh>

        <Line
          points={[
            [roofWidth / 2, LOT_PLATE_THICKNESS + BUILDING_HEIGHT_UNITS + 0.18, buildingDepth / 2 + 0.12],
            [propertySideX, LOT_PLATE_THICKNESS + BUILDING_HEIGHT_UNITS + 0.18, buildingDepth / 2 + 0.12],
          ]}
          color={clearanceColor}
          lineWidth={2}
        />
        <Line
          points={[
            [propertySideX, LOT_PLATE_THICKNESS + 0.05, -lotDepth / 2],
            [propertySideX, LOT_PLATE_THICKNESS + BUILDING_HEIGHT_UNITS + 0.34, -lotDepth / 2],
          ]}
          color={HERO_SCENE_COLORS.transparentWhiteGuide}
          lineWidth={1}
          dashed
          dashSize={0.09}
          gapSize={0.06}
        />
        <Html position={[0, LOT_PLATE_THICKNESS + BUILDING_HEIGHT_UNITS + 0.42, -buildingDepth / 2 - 0.18]} center>
          <span className='rounded-full border border-white/10 bg-camp-black/80 px-2 py-1 font-[family-name:var(--font-dm-mono)] text-[9px] font-semibold text-white/80 shadow-xl backdrop-blur'>
            {clearDistance} mm clear · target {EAVE_MINIMUM_CLEARANCE_MM} mm
          </span>
        </Html>
      </group>
    </>
  )
}

const HeroEnvelopeCanvas = ({
  preset,
  result,
  showSetbacks,
  eaveProjection,
  clearDistance,
  isCompliant,
}: {
  preset: HeroLotPreset
  result: DevControlsResult
  showSetbacks: boolean
  eaveProjection: number
  clearDistance: number
  isCompliant: boolean
}) => (
  <div
    className='relative z-10 h-full min-h-[318px] w-full overflow-hidden rounded-2xl border border-white/10 bg-camp-black shadow-[0_24px_40px_rgba(0,0,0,0.32)]'
    role='img'
    aria-label='Educational Three.js diagram showing a site-development lot, setback bands, buildable envelope, building mass, and eave clearance from a side or rear property line.'
  >
    <WebGLErrorBoundary fallback={<HeroEnvelopeFallbackPoster isCompliant={isCompliant} />}>
      <Canvas
        frameloop='demand'
        dpr={[1, 1.5]}
        shadows
        gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
        fallback={<HeroEnvelopeFallbackPoster isCompliant={isCompliant} />}
      >
        <HeroEnvelopeScene
          preset={preset}
          result={result}
          showSetbacks={showSetbacks}
          eaveProjection={eaveProjection}
          clearDistance={clearDistance}
          isCompliant={isCompliant}
        />
      </Canvas>
    </WebGLErrorBoundary>
    <div className='pointer-events-none absolute left-3 top-3 rounded-full border border-white/10 bg-black/35 px-3 py-1 font-[family-name:var(--font-dm-mono)] text-[10px] font-semibold uppercase tracking-[0.14em] text-white/72 backdrop-blur'>
      Three.js study preview
    </div>
  </div>
)

export const HeroCodeEnvelopeExplorer = () => {
  const [presetIndex, setPresetIndex] = useState<LotPresetIndex>(0)
  const [showSetbacks, setShowSetbacks] = useState(true)
  const [eaveProjection, setEaveProjection] = useState(800)

  const preset = LOT_PRESETS[presetIndex]
  const result = useMemo(() => computePresetResult(preset), [preset])
  const clearDistance = calculateSceneSideClearanceMm({ preset, result, eaveProjection })
  const isCompliant = clearDistance >= EAVE_MINIMUM_CLEARANCE_MM

  return (
    <div className='relative overflow-hidden rounded-[28px] border border-camp-cobalt/15 bg-camp-black p-3 shadow-[0_28px_80px_rgba(15,23,42,0.28)]'>
      <div className='absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(245,166,35,0.28),transparent_32%),radial-gradient(circle_at_90%_30%,rgba(59,130,246,0.34),transparent_32%),linear-gradient(135deg,rgba(255,255,255,0.08),transparent)]' />
      <div className='relative overflow-hidden rounded-[22px] border border-white/10 bg-camp-black'>
        <div className='flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3'>
          <div>
            <p className='font-[family-name:var(--font-dm-mono)] text-[10px] font-semibold tracking-[0.18em] uppercase text-camp-amber'>
              Code Envelope Explorer
            </p>
            <h2 className='mt-1 text-[15px] font-bold text-white'>
              Try a setback. Watch the buildable envelope change.
            </h2>
          </div>
          <div className='rounded-full border border-white/10 bg-white/8 px-3 py-1 font-[family-name:var(--font-dm-mono)] text-[11px] text-white/70'>
            PD 1096 / NBCP study preview
          </div>
        </div>

        <div className='grid gap-0 lg:grid-cols-[1fr_250px]'>
          <div className='relative min-h-[360px] overflow-hidden p-4 sm:p-6'>
            <div className='absolute inset-0 opacity-60 [background-image:linear-gradient(rgba(126,179,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(126,179,255,0.08)_1px,transparent_1px)] [background-size:28px_28px]' />
            <HeroEnvelopeCanvas
              preset={preset}
              result={result}
              showSetbacks={showSetbacks}
              eaveProjection={eaveProjection}
              clearDistance={clearDistance}
              isCompliant={isCompliant}
            />
          </div>

          <div className='border-t border-white/10 bg-white/[0.035] p-4 lg:border-l lg:border-t-0'>
            <div className='space-y-4'>
              <div>
                <p id='sample-lot-label' className='text-[11px] font-semibold uppercase tracking-[0.16em] text-white/70'>Sample lot</p>
                <div className='mt-2 grid gap-2' role='radiogroup' aria-labelledby='sample-lot-label'>
                  {LOT_PRESETS.map((lot, index) => (
                    <button
                      key={lot.label}
                      type='button'
                      role='radio'
                      aria-checked={presetIndex === index}
                      onClick={() => setPresetIndex(index as LotPresetIndex)}
                      className={`rounded-lg border px-3 py-2 text-left text-[12px] transition ${
                        presetIndex === index
                          ? 'border-camp-amber bg-camp-amber/15 text-white'
                          : 'border-white/10 bg-white/5 text-white/70 hover:border-white/25 hover:text-white/90'
                      }`}
                    >
                      <span className='block font-semibold'>{lot.label}</span>
                      <span className='font-[family-name:var(--font-dm-mono)] text-[11px] opacity-75'>
                        {formatMeters(lot.width)} × {formatMeters(lot.depth)} · {lot.shortLabel}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className='rounded-xl border border-white/10 bg-black/20 p-3'>
                <div className='flex items-center justify-between gap-3'>
                  <label htmlFor='eave-projection' className='text-[12px] font-semibold text-white'>
                    Eave projection
                  </label>
                  <output htmlFor='eave-projection' className='font-[family-name:var(--font-dm-mono)] text-[11px] text-camp-amber'>
                    {eaveProjection} mm
                  </output>
                </div>
                <input
                  id='eave-projection'
                  min='600'
                  max='1100'
                  step='50'
                  value={eaveProjection}
                  onChange={(event) => setEaveProjection(Number(event.target.value))}
                  type='range'
                  className='mt-3 w-full accent-camp-amber'
                />
                <div className='mt-2 flex justify-between text-[11px] text-white/60'>
                  {EAVE_OPTIONS.map((option) => (
                    <button
                      key={option}
                      type='button'
                      onClick={() => setEaveProjection(option)}
                      className='rounded px-1 py-0.5 hover:bg-white/10 hover:text-white/70'
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type='button'
                onClick={() => setShowSetbacks((value) => !value)}
                className='flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/8 px-3 py-2 text-left text-[12px] text-white transition hover:border-white/25'
                aria-pressed={showSetbacks}
              >
                <span>
                  <span className='block font-semibold'>Show setbacks</span>
                  <span className='text-[11px] text-white/70'>Toggle site-control bands and buildable envelope.</span>
                </span>
                <span className={`h-5 w-9 rounded-full p-0.5 transition ${showSetbacks ? 'bg-camp-amber' : 'bg-white/18'}`}>
                  <span className={`block h-4 w-4 rounded-full bg-white transition ${showSetbacks ? 'translate-x-4' : ''}`} />
                </span>
              </button>

              <div className='grid grid-cols-2 gap-2'>
                <div className='rounded-xl border border-white/10 bg-white/6 p-3'>
                  <p className='text-[11px] uppercase tracking-[0.16em] text-white/60'>Buildable width</p>
                  <p className='mt-1 font-[family-name:var(--font-dm-mono)] text-[18px] font-bold text-white'>
                    {formatMeters(result.buildableWidth)}
                  </p>
                </div>
                <div className='rounded-xl border border-white/10 bg-white/6 p-3'>
                  <p className='text-[11px] uppercase tracking-[0.16em] text-white/60'>Buildable depth</p>
                  <p className='mt-1 font-[family-name:var(--font-dm-mono)] text-[18px] font-bold text-white'>
                    {formatMeters(result.buildableDepth)}
                  </p>
                </div>
              </div>

              <div className={`rounded-xl border p-3 ${isCompliant ? 'border-emerald-300/20 bg-emerald-300/10' : 'border-red-300/30 bg-red-300/12'}`}>
                <p className='font-[family-name:var(--font-dm-mono)] text-[10px] uppercase tracking-[0.16em] text-camp-amber'>
                  {isCompliant ? 'Compliant study state' : 'Too close in this study state'} · {clearDistance} mm clear
                </p>
                <p className='mt-1 text-[12px] leading-relaxed text-white/75' aria-live='polite'>
                  PD 1096 Rules VII & VIII site controls are shown as a study visual. The eave/canopy clearance callout uses a {EAVE_MINIMUM_CLEARANCE_MM} mm target; source locators should still be checked in the full 3D Lab and wiki.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
