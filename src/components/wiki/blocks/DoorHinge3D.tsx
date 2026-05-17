'use client'

import React, { Suspense, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { Bounds, Edges, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

type HingeType =
  | 'butt'
  | 'loose-pin'
  | 'ball-bearing'
  | 'spring'
  | 'pivot'
  | 'continuous'
  | 'concealed'
  | 'parliament'
  | 'strap'

type HingeDefinition = {
  label: string
  subtitle: string
  caption: string
}

const HINGE_DEFINITIONS: Record<HingeType, HingeDefinition> = {
  butt: {
    label: 'Butt / full-mortise hinge',
    subtitle: 'Two rectangular leaves knuckled around a central pin.',
    caption: 'Typical door-and-frame hinge. The leaves are usually mortised into the edge of the door and jamb.',
  },
  'loose-pin': {
    label: 'Loose-pin hinge',
    subtitle: 'A butt hinge variant with a removable pin.',
    caption: 'The removable pin lets the door leaf be lifted off after the pin is withdrawn, where security conditions allow it.',
  },
  'ball-bearing': {
    label: 'Ball-bearing hinge',
    subtitle: 'Bearing washers reduce friction at the knuckles.',
    caption: 'Used where heavier doors or higher cycles make smoother movement and wear resistance important.',
  },
  spring: {
    label: 'Spring / double-acting hinge',
    subtitle: 'A spring barrel provides self-closing action.',
    caption: 'Used where a door must return toward closed position; the spring barrel is the visual clue.',
  },
  pivot: {
    label: 'Pivot / floor pivot hinge',
    subtitle: 'The door rotates around top and bottom pivot points.',
    caption: 'Common for heavier or cleaner-detail doors where the rotation axis is carried by pivots instead of side leaves.',
  },
  continuous: {
    label: 'Continuous / piano hinge',
    subtitle: 'A long hinge distributes support along the height.',
    caption: 'Used for panels, cabinets, or doors where load distribution and alignment over a long edge matter.',
  },
  concealed: {
    label: 'Concealed hinge',
    subtitle: 'Linked arms sit inside cups or routed pockets.',
    caption: 'Often used in cabinets or flush architectural panels where the hinge should be hidden when closed.',
  },
  parliament: {
    label: 'Parliament / wide-throw hinge',
    subtitle: 'Offset leaves project the pivot away from the frame.',
    caption: 'Used when the door must swing clear of deep trim, reveals, or wall build-ups.',
  },
  strap: {
    label: 'Strap / T hinge',
    subtitle: 'A long strap leaf spreads load across the door face.',
    caption: 'Common in gates, rustic doors, and utility conditions where face-fixed hardware is acceptable.',
  },
}

const LEAF = '#c8d3df'
const BODY = '#b7c4d1'
const BARREL = '#9eacba'
const SCREW = '#8796a6'
const OUTLINE = '#526274'
const HARDWARE = LEAF
const CANVAS_BG = '#0f4c81'

function Mat({ color = HARDWARE }: { color?: string }) {
  return <meshStandardMaterial color={color} roughness={0.82} metalness={0.08} />
}

function Box({
  position = [0, 0, 0],
  size,
  color = HARDWARE,
}: {
  position?: [number, number, number]
  size: [number, number, number]
  color?: string
}) {
  return (
    <mesh position={position}>
      <boxGeometry args={size} />
      <Mat color={color} />
      <Edges color={OUTLINE} threshold={18} />
    </mesh>
  )
}

function CylinderY({
  position = [0, 0, 0],
  radius,
  height,
  color = HARDWARE,
  segments = 32,
}: {
  position?: [number, number, number]
  radius: number
  height: number
  color?: string
  segments?: number
}) {
  return (
    <mesh position={position}>
      <cylinderGeometry args={[radius, radius, height, segments]} />
      <Mat color={color} />
      <Edges color={OUTLINE} threshold={22} />
    </mesh>
  )
}

function DiskFront({
  position,
  radius = 0.055,
  color = SCREW,
}: {
  position: [number, number, number]
  radius?: number
  color?: string
}) {
  return (
    <group position={position}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[radius, radius, 0.02, 28]} />
        <Mat color={color} />
        <Edges color={OUTLINE} threshold={20} />
      </mesh>
      <mesh position={[0, 0, 0.014]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[radius * 0.58, radius * 0.94, 28]} />
        <meshStandardMaterial color="#6f7f90" roughness={0.88} metalness={0.05} side={THREE.DoubleSide} />
      </mesh>
      <Box position={[0, 0, 0.022]} size={[radius * 1.45, radius * 0.16, 0.012]} color="#5e6d7d" />
      <Box position={[0, 0, 0.024]} size={[radius * 0.16, radius * 1.45, 0.012]} color="#5e6d7d" />
    </group>
  )
}

function HingeLeaf({ x, height = 1.75, width = 0.58, screwCount = 4 }: { x: number; height?: number; width?: number; screwCount?: 2 | 4 }) {
  const ys = screwCount === 2 ? [height * 0.28, -height * 0.28] : [height * 0.32, height * 0.12, -height * 0.12, -height * 0.32]
  return (
    <group position={[x, 0, 0]}>
      <Box size={[width, height, 0.06]} color={LEAF} />
      <Box position={[0, height / 2 - 0.035, 0.04]} size={[width, 0.025, 0.02]} color={BODY} />
      <Box position={[0, -height / 2 + 0.035, 0.04]} size={[width, 0.025, 0.02]} color={BODY} />
      {ys.map((y) => <DiskFront key={y} position={[0, y, 0.055]} />)}
    </group>
  )
}

function KnuckleSet({ height = 1.85, count = 5, radius = 0.08, color = BARREL }: { height?: number; count?: number; radius?: number; color?: string }) {
  const segment = height / count
  return (
    <group>
      <CylinderY radius={radius * 0.55} height={height + 0.08} color={SCREW} />
      {Array.from({ length: count }, (_, index) => (
        <group key={index} position={[0, -height / 2 + segment / 2 + index * segment, 0.015]}>
          <CylinderY
            radius={radius}
            height={segment * 0.76}
            color={index % 2 === 0 ? color : BODY}
          />
          <Box
            position={[index % 2 === 0 ? -radius * 1.18 : radius * 1.18, 0, -0.01]}
            size={[radius * 1.45, segment * 0.56, 0.04]}
            color={index % 2 === 0 ? BODY : LEAF}
          />
        </group>
      ))}
      <CylinderY position={[0, height / 2 + 0.065, 0.015]} radius={radius * 0.72} height={0.06} color={SCREW} />
      <CylinderY position={[0, -height / 2 - 0.065, 0.015]} radius={radius * 0.72} height={0.06} color={SCREW} />
    </group>
  )
}

function ButtFamily({ type }: { type: HingeType }) {
  const bridgeYs = [-0.62, 0, 0.62]
  const movingBridgeYs = [-0.31, 0.31]

  return (
    <group>
      <HingeLeaf x={-0.38} width={0.5} />
      <HingeLeaf x={0.38} width={0.5} />
      {bridgeYs.map((y) => <Box key={`fixed-${y}`} position={[-0.12, y, 0.035]} size={[0.22, 0.26, 0.052]} color={BODY} />)}
      {movingBridgeYs.map((y) => <Box key={`moving-${y}`} position={[0.12, y, 0.035]} size={[0.22, 0.28, 0.052]} color={LEAF} />)}
      <KnuckleSet color={BARREL} />

      {type === 'loose-pin' && (
        <group>
          <CylinderY position={[0, 1.17, 0.04]} radius={0.04} height={0.36} color={LEAF} />
          <CylinderY position={[0, 1.4, 0.04]} radius={0.12} height={0.07} color={LEAF} />
          <mesh position={[0, 1.48, 0.04]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.12, 0.012, 10, 28]} />
            <Mat color={SCREW} />
          </mesh>
        </group>
      )}

      {type === 'ball-bearing' && [-0.56, 0, 0.56].map((y) => (
        <group key={y} position={[0, y, 0.08]}>
          <CylinderY radius={0.13} height={0.04} color={BODY} />
          <CylinderY radius={0.095} height={0.052} color={LEAF} />
          {[-0.055, 0, 0.055].map((x) => <mesh key={x} position={[x, 0, 0.055]}><sphereGeometry args={[0.018, 12, 8]} /><Mat color={SCREW} /></mesh>)}
        </group>
      ))}

      {type === 'spring' && (
        <group position={[0, 0, 0.12]}>
          <CylinderY radius={0.14} height={1.55} color={BARREL} />
          {Array.from({ length: 11 }, (_, i) => (
            <Box key={i} position={[0, -0.72 + i * 0.145, 0.155]} size={[0.34, 0.018, 0.024]} color={SCREW} />
          ))}
          <CylinderY position={[0, 0.86, 0.12]} radius={0.105} height={0.08} color={LEAF} />
          <CylinderY position={[0, -0.86, 0.12]} radius={0.105} height={0.08} color={LEAF} />
        </group>
      )}
    </group>
  )
}

function PivotHinge() {
  return (
    <group>
      <Box position={[0.1, 0, -0.02]} size={[0.54, 1.72, 0.055]} color={LEAF} />
      <Box position={[-0.33, -1.0, 0.035]} size={[0.88, 0.22, 0.12]} color={BODY} />
      <Box position={[-0.33, 1.0, 0.035]} size={[0.88, 0.22, 0.12]} color={BODY} />
      <CylinderY position={[-0.66, 0, 0.09]} radius={0.026} height={2.18} color={SCREW} />
      <CylinderY position={[-0.66, -1.0, 0.13]} radius={0.145} height={0.19} color={BARREL} />
      <CylinderY position={[-0.66, 1.0, 0.13]} radius={0.145} height={0.19} color={BARREL} />
      <CylinderY position={[-0.66, -0.78, 0.105]} radius={0.075} height={0.24} color={BODY} />
      <CylinderY position={[-0.66, 0.78, 0.105]} radius={0.075} height={0.24} color={BODY} />
      <Box position={[-0.43, -1.0, 0.08]} size={[0.34, 0.11, 0.075]} color={BODY} />
      <Box position={[-0.43, 1.0, 0.08]} size={[0.34, 0.11, 0.075]} color={BODY} />
      <Box position={[-0.66, -1.18, 0.035]} size={[0.46, 0.16, 0.06]} color={LEAF} />
      <Box position={[-0.66, 1.18, 0.035]} size={[0.46, 0.16, 0.06]} color={LEAF} />
      {[-0.42, 0.04].map((x) => (
        <React.Fragment key={x}>
          <DiskFront position={[x, -0.96, 0.14]} radius={0.045} />
          <DiskFront position={[x, 0.96, 0.14]} radius={0.045} />
        </React.Fragment>
      ))}
    </group>
  )
}

function ContinuousHinge() {
  return (
    <group scale={[0.8, 1.12, 1]}>
      <HingeLeaf x={-0.27} height={2.25} width={0.42} screwCount={4} />
      <HingeLeaf x={0.27} height={2.25} width={0.42} screwCount={4} />
      <Box position={[-0.08, 0, 0.022]} size={[0.16, 2.2, 0.052]} color={BODY} />
      <Box position={[0.08, 0, 0.022]} size={[0.16, 2.2, 0.052]} color={BODY} />
      <KnuckleSet height={2.35} count={13} radius={0.055} color={BARREL} />
    </group>
  )
}

function ConcealedHinge() {
  return (
    <group>
      <Box position={[-0.62, 0, -0.04]} size={[0.38, 1.12, 0.06]} color={LEAF} />
      <Box position={[0.62, 0, -0.04]} size={[0.42, 0.92, 0.06]} color={BODY} />
      <mesh position={[-0.58, 0, 0.045]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 0.075, 44]} />
        <Mat color={BODY} />
        <Edges color={OUTLINE} threshold={20} />
      </mesh>
      <mesh position={[-0.58, 0, 0.072]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.225, 0.225, 0.03, 44]} />
        <Mat color="#7f8da0" />
      </mesh>
      <mesh position={[-0.58, 0, 0.088]}>
        <torusGeometry args={[0.22, 0.02, 12, 44]} />
        <Mat color={LEAF} />
      </mesh>
      <mesh position={[-0.58, 0, 0.094]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.14, 0.14, 0.016, 36]} />
        <Mat color={BARREL} />
      </mesh>
      <Box position={[0.58, 0, 0.055]} size={[0.3, 0.58, 0.07]} color={LEAF} />
      <Box position={[0.58, 0.24, 0.1]} size={[0.22, 0.08, 0.055]} color={BARREL} />
      <Box position={[0.58, -0.24, 0.1]} size={[0.22, 0.08, 0.055]} color={BARREL} />
      <group rotation={[0, 0, -0.32]}><Box position={[0, 0.13, 0.1]} size={[0.9, 0.075, 0.045]} color={LEAF} /></group>
      <group rotation={[0, 0, 0.32]}><Box position={[0, -0.13, 0.12]} size={[0.9, 0.075, 0.045]} color={BARREL} /></group>
      <CylinderY position={[-0.16, 0.33, 0.13]} radius={0.055} height={0.24} color={BARREL} />
      <CylinderY position={[0.16, -0.33, 0.13]} radius={0.055} height={0.24} color={BARREL} />
      {[[-0.58, 0], [0.58, 0], [0, 0.24], [0, -0.24]].map(([x, y]) => <DiskFront key={`${x}-${y}`} position={[x, y, 0.12]} radius={0.04} />)}
    </group>
  )
}

function ParliamentHinge() {
  return (
    <group>
      <Box position={[-0.95, 0, -0.05]} size={[0.18, 1.68, 0.055]} color={LEAF} />
      <Box position={[0.95, 0, -0.05]} size={[0.18, 1.68, 0.055]} color={LEAF} />
      <Box position={[-0.58, 0, 0.015]} size={[0.62, 1.42, 0.055]} color={LEAF} />
      <Box position={[0.58, 0, 0.015]} size={[0.62, 1.42, 0.055]} color={LEAF} />
      <Box position={[-0.28, 0, 0.075]} size={[0.36, 1.18, 0.07]} color={BODY} />
      <Box position={[0.28, 0, 0.075]} size={[0.36, 1.18, 0.07]} color={BODY} />
      <Box position={[-0.06, 0.48, 0.11]} size={[0.2, 0.16, 0.075]} color={BODY} />
      <Box position={[0.06, -0.48, 0.11]} size={[0.2, 0.16, 0.075]} color={LEAF} />
      <KnuckleSet height={1.65} count={5} radius={0.082} color={BARREL} />
      {[-0.95, 0.95].flatMap((x) => [0.48, -0.48].map((y) => <DiskFront key={`${x}-${y}`} position={[x, y, 0.005]} radius={0.043} />))}
      {[-0.56, 0.56].flatMap((x) => [0.32, -0.32].map((y) => <DiskFront key={`throw-${x}-${y}`} position={[x, y, 0.08]} radius={0.04} />))}
    </group>
  )
}

function StrapHinge() {
  return (
    <group>
      <Box position={[-0.62, 0, 0.02]} size={[0.24, 1.18, 0.06]} color={LEAF} />
      <Box position={[-0.36, 0, 0.035]} size={[0.22, 0.34, 0.075]} color={BODY} />
      <Box position={[0.1, 0, 0.03]} size={[1.22, 0.16, 0.055]} color={LEAF} />
      <Box position={[0.52, 0.105, 0.033]} size={[0.5, 0.12, 0.052]} color={LEAF} />
      <Box position={[0.52, -0.105, 0.033]} size={[0.5, 0.12, 0.052]} color={LEAF} />
      <Box position={[0.84, 0, 0.034]} size={[0.26, 0.24, 0.055]} color={LEAF} />
      <CylinderY position={[-0.78, 0, 0.08]} radius={0.07} height={1.28} color={BARREL} />
      <CylinderY position={[-0.78, 0.38, 0.09]} radius={0.08} height={0.24} color={BODY} />
      <CylinderY position={[-0.78, -0.38, 0.09]} radius={0.08} height={0.24} color={BODY} />
      {[-0.52, -0.1, 0.32, 0.7].map((x) => <DiskFront key={x} position={[x, 0, 0.085]} radius={0.05} />)}
      {[0.35, -0.35].map((y) => <DiskFront key={y} position={[-0.62, y, 0.09]} radius={0.055} />)}
    </group>
  )
}

function HingeModel({ type }: { type: HingeType }) {
  if (type === 'pivot') return <PivotHinge />
  if (type === 'continuous') return <ContinuousHinge />
  if (type === 'concealed') return <ConcealedHinge />
  if (type === 'parliament') return <ParliamentHinge />
  if (type === 'strap') return <StrapHinge />
  return <ButtFamily type={type} />
}

function Scene({ type }: { type: HingeType }) {
  const target = useMemo(() => new THREE.Vector3(0, 0, 0), [])

  return (
    <>
      <color attach="background" args={[CANVAS_BG]} />
      <ambientLight intensity={1.15} />
      <directionalLight position={[2.8, 3.2, 4.2]} intensity={1.05} />
      <directionalLight position={[-2.6, -1.4, 2.0]} intensity={0.36} />
      <Bounds fit clip observe margin={1.28}>
        <group rotation={[0.06, -0.14, 0]}>
          <HingeModel type={type} />
        </group>
      </Bounds>
      <OrbitControls
        makeDefault
        target={target}
        enableDamping
        dampingFactor={0.08}
        enablePan={false}
        enableZoom
        zoomSpeed={0.42}
        minDistance={2.0}
        maxDistance={4.3}
        minPolarAngle={0}
        maxPolarAngle={Math.PI}
      />
    </>
  )
}

export function DoorHinge3D({
  type = 'butt',
  title,
  caption,
}: {
  type?: HingeType
  title?: string
  caption?: string
}) {
  const safeType = HINGE_DEFINITIONS[type] ? type : 'butt'
  const definition = HINGE_DEFINITIONS[safeType]

  return (
    <figure className="not-prose my-7 overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-3 dark:border-slate-800 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-camp-cobalt-600 dark:text-camp-cobalt-300">3D hardware study</p>
          <h4 className="mt-1 text-base font-semibold text-slate-950 dark:text-slate-50">{title ?? definition.label}</h4>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-300">{definition.subtitle}</p>
        </div>
      </div>
      <div className="relative h-[280px] w-full overflow-hidden sm:h-[340px]" style={{ backgroundColor: CANVAS_BG }}>
        <Suspense fallback={<div className="flex h-full items-center justify-center text-sm text-slate-500">Loading hinge model…</div>}>
          <Canvas
            frameloop="demand"
            dpr={[1, 1.4]}
            camera={{ position: [2.3, 1.45, 3.0], fov: 38, near: 0.1, far: 20 }}
            gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
          >
            <Scene type={safeType} />
          </Canvas>
        </Suspense>
      </div>
      <figcaption className="border-t border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-relaxed text-slate-600 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-300">
        {caption ?? definition.caption}
      </figcaption>
    </figure>
  )
}

export default DoorHinge3D
