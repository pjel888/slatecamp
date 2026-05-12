'use client'

import { type CSSProperties, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Edges, OrbitControls, PerspectiveCamera } from '@react-three/drei'
import { HouseLine, Lightbulb, Pause, Play } from '@phosphor-icons/react/dist/ssr'
import { motion } from 'framer-motion'
import { CanvasTexture, SRGBColorSpace, type Group, BufferGeometry, Float32BufferAttribute, DoubleSide } from 'three'
import { SCIcon } from '@/components/graphics/icons/Icon'
import { WebGLErrorBoundary } from '@/components/r3f/WebGLErrorBoundary'
import { SlideToSubmit } from '@/components/quiz-v2/SlideToSubmit'
import { palette } from '@/components/graphics/tokens'
import { playCorrectSound } from '@/lib/audio/feedbackSounds'

type Vector3Tuple = [number, number, number]

const LOT_COLORS = {
  surface: palette.surfaceCard,
  surfaceSoft: palette.surfaceFocused,
  line: palette.slateBlue700,
  guide: palette.slateBlue,
  dimension: palette.campOrange,
  front: palette.slateBlue,
  side: palette.teal,
  rear: palette.emerald,
  road: palette.inkSecondary,
  roadStripe: palette.surfaceCard,
  roadEdge: palette.inkTertiary,
  roadSeam: palette.inkPrimary,
  sidewalk: palette.surfaceFocused,
  curb: palette.borderDefault,
  text: palette.inkPrimary,
  shadow: palette.inkSecondary,
  houseMassing: '#FFFFFF',
  houseEdge: '#0A0A0A',
  houseRoof: '#FFFFFF',
} as const

const LOT_WIDTH_METERS = 16
const LOT_LENGTH_METERS = 32
const LOT_SCALE = 0.1
const LOT_WIDTH = LOT_WIDTH_METERS * LOT_SCALE
const LOT_LENGTH = LOT_LENGTH_METERS * LOT_SCALE
const LOT_THICKNESS = 0.03
const DIMENSION_OFFSET = 0.32
export const SETBACK_GRID_STEP_METERS = 0.5
const GRID_STEP = SETBACK_GRID_STEP_METERS * LOT_SCALE
const GRID_COLUMNS = Math.round(LOT_WIDTH_METERS / SETBACK_GRID_STEP_METERS)
const GRID_ROWS = Math.round(LOT_LENGTH_METERS / SETBACK_GRID_STEP_METERS)
const GRID_X_LINES = Array.from(
  { length: GRID_COLUMNS - 1 },
  (_, index) => -LOT_WIDTH / 2 + (index + 1) * GRID_STEP,
)
const GRID_Z_LINES = Array.from(
  { length: GRID_ROWS - 1 },
  (_, index) => -LOT_LENGTH / 2 + (index + 1) * GRID_STEP,
)
const SETBACK_FILL_THICKNESS = 0.006
const SETBACK_FILL_Y = LOT_THICKNESS / 2 + 0.006
const ROAD_DEPTH = 0.36
const ROAD_GAP = 0.08
const ROAD_THICKNESS = 0.018
const ROAD_WIDTH = LOT_WIDTH
const ROAD_Y = LOT_THICKNESS / 2 - ROAD_THICKNESS / 2 - 0.004
const SIDEWALK_DEPTH = 0.06
const SIDEWALK_THICKNESS = 0.014
const CURB_DEPTH = 0.014
const CURB_THICKNESS = 0.022
const ROAD_MARKING_THICKNESS = 0.003
const MODEL_ROTATION_SPEED = 0.11
export const LOT_MODEL_GROUP_POSITION: Vector3Tuple = [0, 0.08, 0]

export interface SetbackValues {
  front: number
  side: number
  rear: number
}

interface SetbackGridArea {
  startColumn: number
  endColumnExclusive: number
  columnCount: number
  startRow: number
  endRowExclusive: number
  rowCount: number
}

interface SetbackBandSpec {
  color: string
  grid: SetbackGridArea
  position: Vector3Tuple
  size: Vector3Tuple
}

interface RoadDetailRect {
  position: Vector3Tuple
  size: Vector3Tuple
}

export interface RoadDetailPlan {
  roadTopY: number
  nearSidewalk: RoadDetailRect
  farSidewalk: RoadDetailRect
  nearCurb: RoadDetailRect
  farCurb: RoadDetailRect
  laneEdgeLines: RoadDetailRect[]
  centerDashes: RoadDetailRect[]
  sidewalkJoints: RoadDetailRect[]
  asphaltSeams: RoadDetailRect[]
}

export interface SetbackGridPlan {
  columns: number
  rows: number
  gridStepMeters: number
  frontRows: number
  sideColumns: number
  rearRows: number
  road: {
    position: Vector3Tuple
    size: Vector3Tuple
  }
  bands: {
    front: SetbackBandSpec
    rear: SetbackBandSpec
    leftSide: SetbackBandSpec
    rightSide: SetbackBandSpec
  }
}

const roundSceneValue = (value: number) => Number(value.toFixed(5))
const toGridCount = (meters: number) => Math.max(0, Math.round(meters / SETBACK_GRID_STEP_METERS))
const toSceneUnitsFromCells = (cells: number) => roundSceneValue(cells * GRID_STEP)

const createGridArea = ({
  startColumn,
  endColumnExclusive,
  startRow,
  endRowExclusive,
}: {
  startColumn: number
  endColumnExclusive: number
  startRow: number
  endRowExclusive: number
}): SetbackGridArea => ({
  startColumn,
  endColumnExclusive,
  columnCount: Math.max(0, endColumnExclusive - startColumn),
  startRow,
  endRowExclusive,
  rowCount: Math.max(0, endRowExclusive - startRow),
})

export const getSetbackGridPlan = (setbacks: SetbackValues): SetbackGridPlan => {
  const halfWidth = LOT_WIDTH / 2
  const halfLength = LOT_LENGTH / 2
  const frontRows = Math.min(GRID_ROWS, toGridCount(setbacks.front))
  const rearRows = Math.min(GRID_ROWS - frontRows, toGridCount(setbacks.rear))
  const sideColumns = Math.min(Math.floor(GRID_COLUMNS / 2), toGridCount(setbacks.side))
  const frontDepth = toSceneUnitsFromCells(frontRows)
  const rearDepth = toSceneUnitsFromCells(rearRows)
  const sideDepth = toSceneUnitsFromCells(sideColumns)
  const sideRowCount = Math.max(0, GRID_ROWS - frontRows - rearRows)
  const sideSpan = toSceneUnitsFromCells(sideRowCount)
  const sideStartRow = frontRows
  const sideEndRowExclusive = GRID_ROWS - rearRows

  return {
    columns: GRID_COLUMNS,
    rows: GRID_ROWS,
    gridStepMeters: SETBACK_GRID_STEP_METERS,
    frontRows,
    sideColumns,
    rearRows,
    road: {
      size: [ROAD_WIDTH, ROAD_THICKNESS, ROAD_DEPTH],
      position: [0, ROAD_Y, roundSceneValue(-halfLength - ROAD_GAP - ROAD_DEPTH / 2)],
    },
    bands: {
      front: {
        color: LOT_COLORS.front,
        grid: createGridArea({ startColumn: 0, endColumnExclusive: GRID_COLUMNS, startRow: 0, endRowExclusive: frontRows }),
        size: [LOT_WIDTH, SETBACK_FILL_THICKNESS, frontDepth],
        position: [0, SETBACK_FILL_Y, roundSceneValue(-halfLength + frontDepth / 2)],
      },
      rear: {
        color: LOT_COLORS.rear,
        grid: createGridArea({ startColumn: 0, endColumnExclusive: GRID_COLUMNS, startRow: GRID_ROWS - rearRows, endRowExclusive: GRID_ROWS }),
        size: [LOT_WIDTH, SETBACK_FILL_THICKNESS, rearDepth],
        position: [0, SETBACK_FILL_Y, roundSceneValue(halfLength - rearDepth / 2)],
      },
      leftSide: {
        color: LOT_COLORS.side,
        grid: createGridArea({
          startColumn: 0,
          endColumnExclusive: sideColumns,
          startRow: sideStartRow,
          endRowExclusive: sideEndRowExclusive,
        }),
        size: [sideDepth, SETBACK_FILL_THICKNESS, sideSpan],
        position: [roundSceneValue(-halfWidth + sideDepth / 2), SETBACK_FILL_Y, roundSceneValue((frontDepth - rearDepth) / 2)],
      },
      rightSide: {
        color: LOT_COLORS.side,
        grid: createGridArea({
          startColumn: GRID_COLUMNS - sideColumns,
          endColumnExclusive: GRID_COLUMNS,
          startRow: sideStartRow,
          endRowExclusive: sideEndRowExclusive,
        }),
        size: [sideDepth, SETBACK_FILL_THICKNESS, sideSpan],
        position: [roundSceneValue(halfWidth - sideDepth / 2), SETBACK_FILL_Y, roundSceneValue((frontDepth - rearDepth) / 2)],
      },
    },
  }
}

const createRoadRect = (
  position: Vector3Tuple,
  size: Vector3Tuple,
): RoadDetailRect => ({ position, size })

export const getRoadDetailPlan = (
  road: SetbackGridPlan['road'] = getSetbackGridPlan({ front: 0, side: 0, rear: 0 }).road,
): RoadDetailPlan => {
  const [roadWidth, , roadDepth] = road.size
  const roadTopY = road.position[1] + ROAD_THICKNESS / 2 + 0.004
  const nearRoadEdgeZ = road.position[2] + roadDepth / 2
  const farRoadEdgeZ = road.position[2] - roadDepth / 2
  const markingY = roadTopY + 0.003
  const sidewalkY = roadTopY + SIDEWALK_THICKNESS / 2
  const curbY = roadTopY + CURB_THICKNESS / 2
  const centerDashCount = 5
  const centerDashLength = roundSceneValue(roadWidth * 0.095)
  const centerDashSpan = roadWidth * 0.76
  const centerDashGap = (centerDashSpan - centerDashLength * centerDashCount) / (centerDashCount - 1)
  const firstDashX = -centerDashSpan / 2 + centerDashLength / 2
  const sidewalkJointXs = [-0.6, -0.2, 0.2, 0.6].map((value) => roundSceneValue(value))
  const nearSidewalkZ = roundSceneValue(nearRoadEdgeZ + ROAD_GAP / 2)
  const farSidewalkZ = roundSceneValue(farRoadEdgeZ - SIDEWALK_DEPTH / 2 - 0.014)

  return {
    roadTopY,
    nearSidewalk: createRoadRect(
      [0, sidewalkY, nearSidewalkZ],
      [roadWidth, SIDEWALK_THICKNESS, SIDEWALK_DEPTH],
    ),
    farSidewalk: createRoadRect(
      [0, sidewalkY, farSidewalkZ],
      [roadWidth, SIDEWALK_THICKNESS, SIDEWALK_DEPTH],
    ),
    nearCurb: createRoadRect(
      [0, curbY, roundSceneValue(nearRoadEdgeZ + CURB_DEPTH / 2)],
      [roadWidth, CURB_THICKNESS, CURB_DEPTH],
    ),
    farCurb: createRoadRect(
      [0, curbY, roundSceneValue(farRoadEdgeZ - CURB_DEPTH / 2)],
      [roadWidth, CURB_THICKNESS, CURB_DEPTH],
    ),
    laneEdgeLines: [
      createRoadRect(
        [0, markingY, roundSceneValue(road.position[2] + roadDepth * 0.34)],
        [roadWidth * 0.82, ROAD_MARKING_THICKNESS, 0.008],
      ),
      createRoadRect(
        [0, markingY, roundSceneValue(road.position[2] - roadDepth * 0.34)],
        [roadWidth * 0.82, ROAD_MARKING_THICKNESS, 0.008],
      ),
    ],
    centerDashes: Array.from({ length: centerDashCount }, (_, index) => (
      createRoadRect(
        [roundSceneValue(firstDashX + index * (centerDashLength + centerDashGap)), markingY + 0.001, road.position[2]],
        [centerDashLength, ROAD_MARKING_THICKNESS, 0.014],
      )
    )),
    sidewalkJoints: [
      ...sidewalkJointXs.map((x) => createRoadRect(
        [x, sidewalkY + 0.008, nearSidewalkZ],
        [0.004, ROAD_MARKING_THICKNESS, SIDEWALK_DEPTH * 0.72],
      )),
      ...sidewalkJointXs.map((x) => createRoadRect(
        [x, sidewalkY + 0.008, farSidewalkZ],
        [0.004, ROAD_MARKING_THICKNESS, SIDEWALK_DEPTH * 0.72],
      )),
    ],
    asphaltSeams: [-0.36, 0.36].map((x) => createRoadRect(
      [roundSceneValue(x), markingY - 0.001, road.position[2]],
      [0.004, ROAD_MARKING_THICKNESS, roadDepth * 0.76],
    )),
  }
}

const SETBACK_QUIZ_OPTIONS = [
  {
    id: 'r1-correct',
    setbacks: { front: 4.5, side: 2, rear: 2 },
    values: { front: '4.50 m', side: '2.00 m', rear: '2.00 m' },
    isCorrect: true,
  },
  {
    id: 'r1-wide-side',
    setbacks: { front: 5, side: 3, rear: 1 },
    values: { front: '5.00 m', side: '3.00 m', rear: '1.00 m' },
    isCorrect: false,
  },
  {
    id: 'r1-equal-yard',
    setbacks: { front: 3, side: 3, rear: 3 },
    values: { front: '3.00 m', side: '3.00 m', rear: '3.00 m' },
    isCorrect: false,
  },
  {
    id: 'r1-small-front',
    setbacks: { front: 2, side: 2, rear: 4.5 },
    values: { front: '2.00 m', side: '2.00 m', rear: '4.50 m' },
    isCorrect: false,
  },
] as const

const SETBACK_VALUE_ROWS = [
  ['Front', 'front'],
  ['Side', 'side'],
  ['Rear', 'rear'],
] as const

const SUCCESS_BURST_PARTICLES = [
  { x: -146, y: -34, rotate: -22, delay: 0, color: LOT_COLORS.front },
  { x: -104, y: -58, rotate: 18, delay: 30, color: LOT_COLORS.side },
  { x: -58, y: -74, rotate: -38, delay: 58, color: LOT_COLORS.rear },
  { x: -14, y: -84, rotate: 28, delay: 16, color: LOT_COLORS.front },
  { x: 38, y: -76, rotate: -16, delay: 46, color: LOT_COLORS.side },
  { x: 84, y: -60, rotate: 34, delay: 72, color: LOT_COLORS.rear },
  { x: 132, y: -38, rotate: -28, delay: 24, color: LOT_COLORS.front },
] as const

const isWebGLContext = (context: RenderingContext | null): context is WebGLRenderingContext | WebGL2RenderingContext =>
  Boolean(context && 'getParameter' in context && typeof context.getParameter === 'function')

const usePrefersReducedMotion = () => {
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(query.matches)

    update()
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])

  return reduced
}

const useSafeWebGLStatus = () => {
  const [available, setAvailable] = useState<boolean | null>(null)

  useEffect(() => {
    let mounted = true

    const markUnavailable = () => {
      if (mounted) setAvailable(false)
    }

    try {
      if (!('WebGLRenderingContext' in window)) {
        markUnavailable()
        return () => {
          mounted = false
        }
      }

      const canvas = document.createElement('canvas')
      const context =
        canvas.getContext('webgl2', { failIfMajorPerformanceCaveat: false }) ??
        canvas.getContext('webgl', { failIfMajorPerformanceCaveat: false })

      if (!isWebGLContext(context)) {
        markUnavailable()
        return () => {
          mounted = false
        }
      }

      context.getParameter(context.VERSION)
      if (mounted) setAvailable(true)
    } catch {
      markUnavailable()
    }

    return () => {
      mounted = false
    }
  }, [])

  return available
}

const LotUnavailableFallback = () => (
  <div className='pointer-events-none absolute inset-0' aria-hidden='true' />
)

const GuideLine = ({
  args,
  position,
  color = LOT_COLORS.guide,
  opacity = 0.62,
}: {
  args: Vector3Tuple
  position: Vector3Tuple
  color?: string
  opacity?: number
}) => (
  <mesh position={position}>
    <boxGeometry args={args} />
    <meshBasicMaterial color={color} transparent opacity={opacity} toneMapped={false} />
  </mesh>
)

const SetbackFill = ({
  spec,
  gradient,
}: {
  spec: SetbackBandSpec
  gradient?: { from: string; to: string }
}) => {
  const texture = useMemo(() => {
    if (!gradient || typeof document === 'undefined') return null

    const canvas = document.createElement('canvas')
    canvas.width = 2
    canvas.height = 128
    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    const grad = ctx.createLinearGradient(0, 0, 0, 128)
    grad.addColorStop(0, gradient.from)
    grad.addColorStop(1, gradient.to)
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, 2, 128)

    const tex = new CanvasTexture(canvas)
    tex.colorSpace = SRGBColorSpace
    tex.needsUpdate = true
    return tex
  }, [gradient?.from, gradient?.to])

  useEffect(() => () => texture?.dispose(), [texture])

  return (
    <mesh position={spec.position} renderOrder={2}>
      <boxGeometry args={spec.size} />
      <meshBasicMaterial
        color={texture ? '#ffffff' : spec.color}
        map={texture}
        transparent
        opacity={0.68}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  )
}

const RoadStrip = () => {
  const road = getSetbackGridPlan({ front: 0, side: 0, rear: 0 }).road
  const roadDetails = getRoadDetailPlan(road)

  return (
    <group>
      <mesh position={road.position} renderOrder={0}>
        <boxGeometry args={road.size} />
        <meshBasicMaterial color={LOT_COLORS.road} transparent opacity={0.34} toneMapped={false} />
      </mesh>
      <GuideLine
        args={roadDetails.nearSidewalk.size}
        position={roadDetails.nearSidewalk.position}
        color={LOT_COLORS.sidewalk}
        opacity={0.78}
      />
      <GuideLine
        args={roadDetails.farSidewalk.size}
        position={roadDetails.farSidewalk.position}
        color={LOT_COLORS.sidewalk}
        opacity={0.48}
      />
      <GuideLine
        args={roadDetails.nearCurb.size}
        position={roadDetails.nearCurb.position}
        color={LOT_COLORS.curb}
        opacity={0.78}
      />
      <GuideLine
        args={roadDetails.farCurb.size}
        position={roadDetails.farCurb.position}
        color={LOT_COLORS.curb}
        opacity={0.48}
      />
      {roadDetails.sidewalkJoints.map((joint) => (
        <GuideLine
          key={`sidewalk-joint-${joint.position.join('-')}`}
          args={joint.size}
          position={joint.position}
          color={LOT_COLORS.roadSeam}
          opacity={0.12}
        />
      ))}
      {roadDetails.asphaltSeams.map((seam) => (
        <GuideLine
          key={`asphalt-seam-${seam.position[0]}`}
          args={seam.size}
          position={seam.position}
          color={LOT_COLORS.roadSeam}
          opacity={0.12}
        />
      ))}
      {roadDetails.laneEdgeLines.map((line) => (
        <GuideLine
          key={`lane-edge-${line.position[2]}`}
          args={line.size}
          position={line.position}
          color={LOT_COLORS.roadEdge}
          opacity={0.36}
        />
      ))}
      {roadDetails.centerDashes.map((dash) => (
        <GuideLine
          key={`road-center-dash-${dash.position[0]}`}
          args={dash.size}
          position={dash.position}
          color={LOT_COLORS.roadStripe}
          opacity={0.78}
        />
      ))}
      <GuideLine
        args={[road.size[0] * 0.78, ROAD_MARKING_THICKNESS, 0.003]}
        position={[0, roadDetails.roadTopY + 0.002, road.position[2]]}
        color={LOT_COLORS.roadStripe}
        opacity={0.24}
      />
    </group>
  )
}

const SetbackBands = ({ setbacks }: { setbacks: SetbackValues }) => {
  const plan = useMemo(() => getSetbackGridPlan(setbacks), [setbacks])

  return (
    <>
      <SetbackFill spec={plan.bands.front} gradient={{ from: LOT_COLORS.front, to: LOT_COLORS.side }} />
      <SetbackFill spec={plan.bands.rear} gradient={{ from: LOT_COLORS.side, to: LOT_COLORS.rear }} />
      <SetbackFill spec={plan.bands.leftSide} />
      <SetbackFill spec={plan.bands.rightSide} />
    </>
  )
}

const HOUSE_HEIGHT = 0.42
const ROOF_HEIGHT = HOUSE_HEIGHT * 0.5
const EAVE_OVERHANG = 0.05

const createHipRoofGeometry = (width: number, depth: number, height: number) => {
  const geometry = new BufferGeometry()
  const hw = width / 2
  const hd = depth / 2

  const vertices = new Float32Array([
    // Front face (facing -Z)
    0, height, 0,
    hw, 0, -hd,
    -hw, 0, -hd,
    // Right face (facing +X)
    0, height, 0,
    hw, 0, hd,
    hw, 0, -hd,
    // Back face (facing +Z)
    0, height, 0,
    -hw, 0, hd,
    hw, 0, hd,
    // Left face (facing -X)
    0, height, 0,
    -hw, 0, -hd,
    -hw, 0, hd,
  ])

  geometry.setAttribute('position', new Float32BufferAttribute(vertices, 3))
  geometry.computeVertexNormals()
  return geometry
}

const HouseMassing = ({ setbacks }: { setbacks: SetbackValues }) => {
  const plan = getSetbackGridPlan(setbacks)
  const halfLength = LOT_LENGTH / 2

  const frontDepth = plan.bands.front.size[2]
  const rearDepth = plan.bands.rear.size[2]
  const sideDepth = plan.bands.leftSide.size[0]

  const buildableWidth = Math.max(0.01, LOT_WIDTH - 2 * sideDepth)
  const buildableDepth = Math.max(0.01, LOT_LENGTH - frontDepth - rearDepth)

  const houseWidth = buildableWidth * 0.98
  const houseDepth = buildableDepth * 0.58
  const houseY = LOT_THICKNESS / 2 + HOUSE_HEIGHT / 2 + 0.004

  const frontBuildableEdgeZ = -halfLength + frontDepth
  const houseZ = frontBuildableEdgeZ + houseDepth / 2

  const roofWidth = houseWidth + EAVE_OVERHANG * 2
  const roofDepth = houseDepth + EAVE_OVERHANG * 2
  const roofY = houseY + HOUSE_HEIGHT / 2

  const roofGeometry = useMemo(
    () => createHipRoofGeometry(roofWidth, roofDepth, ROOF_HEIGHT),
    [roofWidth, roofDepth]
  )

  useEffect(() => () => roofGeometry.dispose(), [roofGeometry])

  if (buildableWidth <= 0.02 || buildableDepth <= 0.02) return null

  return (
    <group renderOrder={3}>
      {/* House body */}
      <mesh position={[0, houseY, houseZ]}>
        <boxGeometry args={[houseWidth, HOUSE_HEIGHT, houseDepth]} />
        <meshPhysicalMaterial
          color={LOT_COLORS.houseMassing}
          roughness={0.4}
          transmission={0.12}
          transparent
          opacity={0.4}
          toneMapped={false}
        />
        <Edges color={LOT_COLORS.houseEdge} threshold={12} linewidth={0.4} />
      </mesh>

      {/* Hip roof with eaves */}
      <mesh position={[0, roofY, houseZ]} geometry={roofGeometry}>
        <meshPhysicalMaterial
          color={LOT_COLORS.houseRoof}
          roughness={0.4}
          transmission={0.08}
          transparent
          opacity={0.4}
          side={DoubleSide}
          toneMapped={false}
        />
        <Edges color={LOT_COLORS.houseEdge} threshold={12} linewidth={0.4} />
      </mesh>
    </group>
  )
}

const DimensionLabel = ({
  label,
  position,
  scale = [0.46, 0.115, 1],
}: {
  label: string
  position: [number, number, number]
  scale?: [number, number, number]
}) => {
  const texture = useMemo(() => {
    if (typeof document === 'undefined') return null

    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 128

    const context = canvas.getContext('2d')
    if (!context) return null

    context.clearRect(0, 0, canvas.width, canvas.height)
    context.font = '900 62px Arial, sans-serif'
    context.textAlign = 'center'
    context.textBaseline = 'middle'
    context.lineJoin = 'round'
    context.lineWidth = 9
    context.strokeStyle = 'rgba(255,255,255,0.88)'
    context.strokeText(label.toUpperCase(), 256, 65)
    context.lineWidth = 3
    context.strokeStyle = 'rgba(15,23,42,0.18)'
    context.strokeText(label.toUpperCase(), 256, 65)
    context.fillStyle = LOT_COLORS.text
    context.fillText(label.toUpperCase(), 256, 65)

    const labelTexture = new CanvasTexture(canvas)
    labelTexture.colorSpace = SRGBColorSpace
    labelTexture.needsUpdate = true
    return labelTexture
  }, [label])

  useEffect(() => () => texture?.dispose(), [texture])

  if (!texture) return null

  return (
    <sprite position={position} scale={scale} renderOrder={8}>
      <spriteMaterial map={texture} transparent depthTest={false} depthWrite={false} toneMapped={false} />
    </sprite>
  )
}

const LotMesh = ({
  reducedMotion,
  rotationPlaying,
  selectedSetbacks,
}: {
  reducedMotion: boolean
  rotationPlaying: boolean
  selectedSetbacks?: SetbackValues
}) => {
  const groupRef = useRef<Group>(null)
  const halfWidth = LOT_WIDTH / 2
  const halfLength = LOT_LENGTH / 2
  const topY = LOT_THICKNESS / 2

  useFrame((_, delta) => {
    const group = groupRef.current
    if (!group || !rotationPlaying || reducedMotion) return

    group.rotation.y += delta * MODEL_ROTATION_SPEED
  })

  return (
    <group ref={groupRef} rotation={[0, -0.62, 0]} position={LOT_MODEL_GROUP_POSITION} scale={1.18}>
      <RoadStrip />

      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[LOT_WIDTH, LOT_THICKNESS, LOT_LENGTH]} />
        <meshPhysicalMaterial
          color={LOT_COLORS.surface}
          roughness={0.54}
          transmission={0.04}
          transparent
          opacity={0.68}
          toneMapped={false}
        />
        <Edges color={LOT_COLORS.line} threshold={12} linewidth={0.65} />
      </mesh>

      <GuideLine
        args={[LOT_WIDTH, LOT_THICKNESS + 0.012, 0.01]}
        position={[0, 0, halfLength + 0.008]}
        color={LOT_COLORS.line}
        opacity={0.16}
      />
      <GuideLine
        args={[0.01, LOT_THICKNESS + 0.012, LOT_LENGTH]}
        position={[halfWidth + 0.008, 0, 0]}
        color={LOT_COLORS.line}
        opacity={0.15}
      />

      <mesh position={[0, -LOT_THICKNESS / 2 - 0.035, 0]}>
        <boxGeometry args={[LOT_WIDTH + 0.04, 0.04, LOT_LENGTH + 0.04]} />
        <meshBasicMaterial color={LOT_COLORS.shadow} transparent opacity={0.08} toneMapped={false} />
      </mesh>

      <GuideLine args={[LOT_WIDTH, 0.01, 0.01]} position={[0, topY + 0.014, -halfLength]} color={LOT_COLORS.line} opacity={0.46} />
      <GuideLine args={[LOT_WIDTH, 0.01, 0.01]} position={[0, topY + 0.014, halfLength]} color={LOT_COLORS.line} opacity={0.46} />
      <GuideLine args={[0.01, 0.01, LOT_LENGTH]} position={[-halfWidth, topY + 0.014, 0]} color={LOT_COLORS.line} opacity={0.46} />
      <GuideLine args={[0.01, 0.01, LOT_LENGTH]} position={[halfWidth, topY + 0.014, 0]} color={LOT_COLORS.line} opacity={0.46} />

      {selectedSetbacks ? <SetbackBands setbacks={selectedSetbacks} /> : null}
      {selectedSetbacks ? <HouseMassing setbacks={selectedSetbacks} /> : null}

      {GRID_Z_LINES.map((z, index) => {
        const isMeterLine = (index + 1) % 2 === 0
        return (
          <GuideLine
            key={`grid-z-${z}`}
            args={[LOT_WIDTH, 0.008, isMeterLine ? 0.003 : 0.0018]}
            position={[0, topY + 0.024, z]}
            color={LOT_COLORS.guide}
            opacity={isMeterLine ? 0.28 : 0.12}
          />
        )
      })}
      {GRID_X_LINES.map((x, index) => {
        const isMeterLine = (index + 1) % 2 === 0
        return (
          <GuideLine
            key={`grid-x-${x}`}
            args={[isMeterLine ? 0.003 : 0.0018, 0.008, LOT_LENGTH]}
            position={[x, topY + 0.026, 0]}
            color={LOT_COLORS.guide}
            opacity={isMeterLine ? 0.24 : 0.1}
          />
        )
      })}

      <GuideLine
        args={[0.004, 0.006, LOT_LENGTH]}
        position={[halfWidth + DIMENSION_OFFSET, topY + 0.08, 0]}
        color={LOT_COLORS.dimension}
        opacity={0.68}
      />
      <GuideLine
        args={[0.09, 0.006, 0.004]}
        position={[halfWidth + DIMENSION_OFFSET, topY + 0.08, -halfLength]}
        color={LOT_COLORS.dimension}
        opacity={0.68}
      />
      <GuideLine
        args={[0.09, 0.006, 0.004]}
        position={[halfWidth + DIMENSION_OFFSET, topY + 0.08, halfLength]}
        color={LOT_COLORS.dimension}
        opacity={0.68}
      />
      <DimensionLabel label='32 m' position={[halfWidth + DIMENSION_OFFSET, topY + 0.105, 0]} scale={[0.66, 0.16, 1]} />

      <GuideLine
        args={[LOT_WIDTH, 0.006, 0.004]}
        position={[0, topY + 0.08, halfLength + DIMENSION_OFFSET]}
        color={LOT_COLORS.dimension}
        opacity={0.68}
      />
      <GuideLine
        args={[0.004, 0.006, 0.09]}
        position={[-halfWidth, topY + 0.08, halfLength + DIMENSION_OFFSET]}
        color={LOT_COLORS.dimension}
        opacity={0.68}
      />
      <GuideLine
        args={[0.004, 0.006, 0.09]}
        position={[halfWidth, topY + 0.08, halfLength + DIMENSION_OFFSET]}
        color={LOT_COLORS.dimension}
        opacity={0.68}
      />
      <DimensionLabel label='16 m' position={[0, topY + 0.105, halfLength + DIMENSION_OFFSET]} scale={[0.66, 0.16, 1]} />

    </group>
  )
}

const SceneInvalidator = ({ rotationPlaying }: { rotationPlaying: boolean }) => {
  const { gl, invalidate } = useThree()

  useEffect(() => {
    gl.setClearColor(LOT_COLORS.surface, 0)
    invalidate()
  }, [gl, invalidate])

  useFrame(() => {
    if (rotationPlaying) invalidate()
  })

  return null
}

const LotScene = ({
  rotationPlaying,
  reducedMotion,
  selectedSetbacks,
  onInteract,
}: {
  rotationPlaying: boolean
  reducedMotion: boolean
  selectedSetbacks?: SetbackValues
  onInteract: () => void
}) => (
  <>
    <SceneInvalidator rotationPlaying={rotationPlaying} />
    <PerspectiveCamera makeDefault position={[3.28, 4.92, 6.05]} fov={24} onUpdate={(camera) => camera.lookAt(0, 0, 0)} />
    <ambientLight intensity={1.18} />
    <directionalLight position={[2.2, 3.4, 4.2]} intensity={0.92} color={LOT_COLORS.surface} />
    <directionalLight position={[-2.4, 1.8, 1.6]} intensity={0.28} color={LOT_COLORS.surfaceSoft} />
    <LotMesh reducedMotion={reducedMotion} rotationPlaying={rotationPlaying} selectedSetbacks={selectedSetbacks} />
    <OrbitControls
      enablePan={false}
      enableZoom={false}
      rotateSpeed={0.18}
      enableDamping
      dampingFactor={0.08}
      minPolarAngle={Math.PI * 0.24}
      maxPolarAngle={Math.PI * 0.76}
      onStart={onInteract}
    />
  </>
)

const SetbackQuizOverlay = ({
  selectedOptionId,
  checked,
  onSelectOption,
}: {
  selectedOptionId: string | null
  checked: boolean
  onSelectOption: (optionId: string) => void
}) => {
  const selectedOption = SETBACK_QUIZ_OPTIONS.find((option) => option.id === selectedOptionId)

  return (
    <aside
      aria-label='R-1 setback quiz modal'
      className={`absolute inset-x-0 top-0 z-30 w-full cursor-default overflow-hidden rounded-lg border border-white/38 bg-slate-100/[0.18] p-0 text-left shadow-[0_16px_44px_rgba(15,23,42,0.10)] ring-1 ring-slate-900/[0.028] backdrop-blur-[10px] backdrop-saturate-125 ${selectedOptionId ? 'opacity-100' : 'opacity-60 hover:opacity-100'}`}
      onPointerDown={(event) => event.stopPropagation()}
      onWheel={(event) => event.stopPropagation()}
    >
      <div className='grid grid-cols-3 items-center border-b border-white/28 bg-white/[0.14] p-1' data-testid='hero-setback-quiz-header'>
        <span className='justify-self-start rounded-full border border-primary/25 bg-primary/10 px-2 py-0.5 font-[family-name:var(--font-dm-mono)] text-[8px] font-bold uppercase tracking-[0.12em] text-primary'>
          Question
        </span>
        <p className='text-center font-[family-name:var(--font-dm-mono)] text-[8px] font-bold uppercase tracking-[0.18em] text-slate-500'>
          Site rule check
        </p>
        <span className='justify-self-end rounded-full border border-camp-amber/25 bg-camp-amber/10 px-2 py-0.5 font-[family-name:var(--font-dm-mono)] text-[8px] font-bold uppercase tracking-[0.12em] text-camp-amber'>
          PD 1096
        </span>
      </div>

      <div className='relative bg-slate-100/[0.08] p-1' data-testid='hero-setback-quiz-body'>
        <div className='pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.035),rgba(255,255,255,0.006)_54%,rgba(148,163,184,0.035))]' aria-hidden='true' />
        <div className='relative grid gap-2 md:grid-cols-[minmax(0,0.88fr)_minmax(0,1.42fr)] md:items-start'>
          <div>
            <p className='text-[11px] font-extrabold leading-[1.18] tracking-[-0.01em] text-slate-950 border-b border-white/28 pb-1.5 mb-1'>
              For an R-1 residential single-detached dwelling, what are the minimum setbacks?
            </p>
            <div className='flex items-center gap-2' data-testid='setback-color-legend'>
              {[
                { label: 'Front', color: LOT_COLORS.front },
                { label: 'Side', color: LOT_COLORS.side },
                { label: 'Rear', color: LOT_COLORS.rear },
              ].map((item) => (
                <span key={item.label} className='flex items-center gap-1'>
                  <span
                    className='inline-block h-2 w-2 rounded-sm'
                    style={{ backgroundColor: item.color }}
                    aria-hidden='true'
                  />
                  <span className='text-[8px] font-bold uppercase tracking-wider text-slate-600'>
                    {item.label}
                  </span>
                </span>
              ))}
            </div>
            {checked && selectedOption ? (
              <p className='mt-1 text-[8px] font-bold leading-snug text-slate-600' aria-live='polite'>
                {selectedOption.isCorrect
                  ? 'Correct: 4.50 m front, 2.00 m sides, 2.00 m rear.'
                  : 'Not this one. Check the R-1 row in Table VIII.2.'}
              </p>
            ) : null}
          </div>

          <div className='grid grid-cols-2 gap-1' role='radiogroup' aria-label='R-1 residential setback options'>
            {SETBACK_QUIZ_OPTIONS.map((option, index) => {
              const selected = selectedOptionId === option.id
              const letter = String.fromCharCode(97 + index)
              const markerClass = selected
                ? option.isCorrect
                  ? 'border-camp-green/45 bg-camp-green/18 text-camp-green shadow-[0_0_10px_rgba(36,151,92,0.16)]'
                  : 'border-camp-amber/45 bg-camp-amber/18 text-camp-amber shadow-[0_0_10px_rgba(212,149,26,0.14)]'
                : 'border-primary/25 bg-primary/[0.16] text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.38)]'
              return (
                <button
                  key={option.id}
                  type='button'
                  role='radio'
                  aria-checked={selected}
                  onClick={(event) => {
                    event.stopPropagation()
                    onSelectOption(option.id)
                  }}
                  className={`min-w-0 cursor-pointer rounded-[5px] border px-1.5 py-1 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 ${
                    selected
                      ? option.isCorrect
                        ? 'border-camp-green/45 bg-camp-green/12 text-slate-950'
                        : 'border-camp-amber/45 bg-camp-amber/12 text-slate-950'
                      : 'border-slate-900/8 bg-white/10 text-slate-700 hover:border-primary/24 hover:bg-white/18'
                  }`}
                >
                  <span className='flex items-stretch gap-1'>
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center self-center rounded-full border font-[family-name:var(--font-dm-mono)] text-[8px] font-extrabold leading-none tracking-[0.045em] ${markerClass}`}
                    >
                      {letter}
                    </span>
                    <span className='w-px self-stretch bg-slate-900/8' aria-hidden='true' />
                    <span className='grid flex-1 gap-0.5 font-[family-name:var(--font-dm-mono)] text-[8px] font-extrabold uppercase tracking-[0.045em]'>
                      {SETBACK_VALUE_ROWS.map(([label, key]) => (
                        <span key={key} className='flex items-baseline justify-between gap-1.5 whitespace-nowrap leading-none'>
                          <span className='min-w-[2.9rem] shrink-0 text-slate-500'>{label}</span>
                          <span className='shrink-0 text-right text-slate-950'>{option.values[key]}</span>
                        </span>
                      ))}
                    </span>
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </aside>
  )
}

const CorrectSetbackSuccessEffect = ({
  effectKey,
  reducedMotion,
}: {
  effectKey: number
  reducedMotion: boolean
}) => {
  if (effectKey === 0 || reducedMotion) return null

  return (
    <div
      key={effectKey}
      data-testid='hero-setback-success-effect'
      className='pointer-events-none absolute inset-x-0 bottom-0 z-40 h-[5.75rem] overflow-visible rounded-lg'
      aria-hidden='true'
    >
      <style>{`
        @keyframes hero-setback-success-ring {
          0% { opacity: 0; transform: scale(0.96); }
          18% { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(1.045); }
        }

        @keyframes hero-setback-success-particle {
          0% { opacity: 0; transform: translate(-50%, 0) scale(0.55) rotate(0deg); }
          18% { opacity: 0.95; }
          100% { opacity: 0; transform: translate(calc(-50% + var(--burst-x)), var(--burst-y)) scale(0.82) rotate(var(--burst-rotate)); }
        }
      `}</style>
      <span className='absolute inset-x-1.5 bottom-2 h-14 rounded-lg border border-camp-green/45 bg-camp-green/10 shadow-[0_0_24px_rgba(36,151,92,0.22)] [animation:hero-setback-success-ring_820ms_cubic-bezier(0.22,1,0.36,1)_both]' />
      {SUCCESS_BURST_PARTICLES.map((particle, index) => (
        <span
          key={`${effectKey}-${index}`}
          className='absolute bottom-8 left-1/2 h-1.5 w-3 rounded-[2px] opacity-0 shadow-[0_0_10px_var(--burst-color)] [animation:hero-setback-success-particle_760ms_cubic-bezier(0.16,1,0.3,1)_var(--burst-delay)_both]'
          style={
            {
              '--burst-color': particle.color,
              '--burst-delay': `${particle.delay}ms`,
              '--burst-rotate': `${particle.rotate}deg`,
              '--burst-x': `${particle.x}px`,
              '--burst-y': `${particle.y}px`,
              backgroundColor: particle.color,
            } as CSSProperties
          }
        />
      ))}
    </div>
  )
}

export const HeroHousePreview = () => {
  const reducedMotion = usePrefersReducedMotion()
  const webGLAvailable = useSafeWebGLStatus()
  const [rotationPlaying, setRotationPlaying] = useState(true)
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(SETBACK_QUIZ_OPTIONS[0].id)
  const [checked, setChecked] = useState(false)
  const [successEffectKey, setSuccessEffectKey] = useState(0)
  const selectedOption = SETBACK_QUIZ_OPTIONS.find((option) => option.id === selectedOptionId)
  const selectedOptionIdRef = useRef(selectedOptionId)
  const answerIsCorrect = Boolean(checked && selectedOption?.isCorrect)
  const slideSubmitCheckedLabel = selectedOption?.isCorrect
    ? 'You are correct!'
    : 'Sign up to get it right next time'
  const rotationControlActive = rotationPlaying && !reducedMotion
  const rotationControlLabel = reducedMotion
    ? 'Slow lot rotation paused for reduced motion'
    : rotationPlaying
      ? 'Pause slow lot rotation'
      : 'Play slow lot rotation'
  const setbackVisualizationText = selectedOption
    ? `Visualization: front ${selectedOption.values.front} is beside the road, side ${selectedOption.values.side} fills only uncolored side cells, and rear ${selectedOption.values.rear} is opposite the road.`
    : 'Select a setback option to color the half-meter grid: blue front, blue-green side, and green rear.'

  const handleSelectOption = (optionId: string) => {
    setSelectedOptionId((prev) => (prev === optionId ? null : optionId))
    setChecked(false)
    setSuccessEffectKey(0)
  }

  const handleSubmitSetbackQuiz = () => {
    if (!selectedOption || selectedOptionIdRef.current !== selectedOption.id) return

    setChecked(true)

    if (selectedOption.isCorrect) {
      if (!reducedMotion) playCorrectSound()
      setSuccessEffectKey((current) => current + 1)
      return
    }

    setSuccessEffectKey(0)
  }

  const handleModelInteract = () => {
    setRotationPlaying(false)
  }

  useEffect(() => {
    selectedOptionIdRef.current = selectedOptionId
  }, [selectedOptionId])

  useEffect(() => {
    if (reducedMotion) setRotationPlaying(false)
  }, [reducedMotion])

  return (
    <div
      className='relative h-[380px] w-full cursor-grab overflow-visible bg-transparent active:cursor-grabbing lg:h-full'
      role='group'
      aria-label='Interactive R-1 setback proof with a three-dimensional 16 by 32 meter lot model, answer choices, and slide-to-submit control.'
      data-testid='hero-house-preview'
      style={
        {
          '--hero-question-card-height': '7.25rem',
          '--hero-slider-stack-height': '4.625rem',
        } as CSSProperties
      }
      onPointerDown={handleModelInteract}
      onWheel={handleModelInteract}
    >
      {webGLAvailable === null ? null : (
        <div
          data-testid='hero-lot-model-stage'
          className='absolute inset-x-[-14%] bottom-[var(--hero-slider-stack-height)] top-[calc(var(--hero-question-card-height)+0.25rem)] overflow-hidden [mask-image:linear-gradient(to_bottom,transparent_0%,black_8%,black_92%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,transparent_0%,black_8%,black_92%,transparent_100%)]'
        >
          {webGLAvailable && !reducedMotion ? (
            <WebGLErrorBoundary fallback={<LotUnavailableFallback />}>
              <Canvas
                frameloop='always'
                dpr={[1, 1.5]}
                gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
                fallback={<LotUnavailableFallback />}
              >
                <LotScene
                  rotationPlaying={rotationControlActive}
                  reducedMotion={false}
                  selectedSetbacks={selectedOption?.setbacks}
                  onInteract={handleModelInteract}
                />
              </Canvas>
            </WebGLErrorBoundary>
          ) : (
            <LotUnavailableFallback />
          )}
        </div>
      )}
      <SetbackQuizOverlay selectedOptionId={selectedOptionId} checked={checked} onSelectOption={handleSelectOption} />
      <button
        type='button'
        data-testid='hero-model-rotation-toggle'
        aria-label={rotationControlLabel}
        aria-pressed={rotationControlActive}
        disabled={reducedMotion}
        className='group absolute right-2 z-40 inline-flex h-7 w-7 items-center justify-center rounded-full text-slate-700/80 transition hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 disabled:pointer-events-none disabled:opacity-40 bottom-[calc(var(--hero-slider-stack-height)+0.35rem)]'
        onClick={(event) => {
          event.stopPropagation()
          setRotationPlaying((playing) => !playing)
        }}
        onPointerDown={(event) => event.stopPropagation()}
        onWheel={(event) => event.stopPropagation()}
      >
        <span
          data-testid='hero-model-rotation-icon-shell'
          className='inline-flex h-6 w-6 items-center justify-center text-white/72 [filter:drop-shadow(0_1px_2px_rgba(15,23,42,0.36))_drop-shadow(0_0_10px_rgba(255,255,255,0.66))] transition-[color,filter,opacity] duration-150 group-hover:text-white/92 group-hover:[filter:drop-shadow(0_1px_3px_rgba(15,23,42,0.42))_drop-shadow(0_0_14px_rgba(255,255,255,0.84))]'
        >
          <SCIcon icon={rotationControlActive ? Pause : Play} size='sm' weight='fill' className='opacity-95' />
        </span>
      </button>
      <div
        className={`absolute inset-x-0 bottom-0 z-30 mb-2 cursor-default rounded-lg border p-1.5 shadow-[0_14px_42px_rgba(15,23,42,0.12)] ring-1 backdrop-blur-[24px] backdrop-saturate-150 transition-[background-color,border-color,box-shadow] duration-300 ${
          answerIsCorrect
            ? 'border-camp-green/45 bg-camp-green/[0.13] ring-camp-green/25 shadow-[0_14px_42px_rgba(36,151,92,0.18)]'
            : 'border-white/32 bg-white/[0.10] ring-white/20'
        }`}
        onPointerDown={(event) => event.stopPropagation()}
        onWheel={(event) => event.stopPropagation()}
      >
        <SlideToSubmit
          onSubmit={handleSubmitSetbackQuiz}
          disabled={!selectedOptionId || checked}
          checked={checked}
          label='Slide to submit'
          checkedLabel={slideSubmitCheckedLabel}
          testId='hero-setback-slide-submit'
        />
      </div>
      <CorrectSetbackSuccessEffect effectKey={successEffectKey} reducedMotion={reducedMotion} />

      <motion.div
        drag
        dragMomentum
        dragElastic={0.1}
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onPointerDown={(e) => e.stopPropagation()}
        onWheel={(e) => e.stopPropagation()}
        className='absolute z-[35] w-[220px] cursor-grab rounded-lg border border-white/30 bg-white/[0.14] p-2 shadow-[0_8px_28px_rgba(15,23,42,0.12)] backdrop-blur-md active:cursor-grabbing'
        style={{ left: '-8.5rem', bottom: 'calc(var(--hero-slider-stack-height) + 2.5rem)' }}
      >
        <div className='flex items-start gap-2.5'>
          <span className='inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-camp-amber/18 text-camp-amber'>
            <SCIcon icon={Lightbulb} size='xs' weight='fill' />
          </span>
          <div>
            <p className='text-[9px] font-bold uppercase tracking-wider text-camp-amber'>
              Did you know?
            </p>
            <p className='text-[10px] font-medium leading-tight text-slate-950'>
              RA 9266 was signed March 17, 2004 — replacing the 54-year-old RA 545 and giving architects the exclusive right to sign and seal architectural plans.
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div
        drag
        dragMomentum
        dragElastic={0.1}
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onPointerDown={(e) => e.stopPropagation()}
        onWheel={(e) => e.stopPropagation()}
        className='absolute z-[35] w-[220px] cursor-grab rounded-lg border border-white/30 bg-white/[0.14] p-2 shadow-[0_8px_28px_rgba(15,23,42,0.12)] backdrop-blur-md active:cursor-grabbing'
        style={{ right: '-7.5rem', top: 'calc(var(--hero-question-card-height) + 2.25rem)' }}
      >
        <div className='flex items-start gap-2.5'>
          <span className='inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-camp-green/18 text-camp-green'>
            <SCIcon icon={HouseLine} size='xs' weight='fill' />
          </span>
          <div>
            <p className='text-[9px] font-bold uppercase tracking-wider text-camp-green'>
              Did you know?
            </p>
            <p className='text-[10px] font-medium leading-tight text-slate-950'>
              Setbacks create firebreaks, ensure safe emergency access, and guarantee every building receives natural light and ventilation.
            </p>
          </div>
        </div>
      </motion.div>

      <p className='sr-only'>Drag the three-dimensional 16 by 32 meter lot model to orbit it.</p>
      <p className='sr-only' aria-live='polite'>
        {setbackVisualizationText}
      </p>
    </div>
  )
}
