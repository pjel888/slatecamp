'use client'

import React, { Suspense, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { Bounds, ContactShadows, Html, OrbitControls } from '@react-three/drei'
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
  leafColor?: string
  accentColor?: string
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
    accentColor: '#8b6f47',
  },
  'ball-bearing': {
    label: 'Ball-bearing hinge',
    subtitle: 'Bearing washers reduce friction at the knuckles.',
    caption: 'Used where heavier doors or higher cycles make smoother movement and wear resistance important.',
    accentColor: '#64748b',
  },
  spring: {
    label: 'Spring / double-acting hinge',
    subtitle: 'A spring barrel provides self-closing action.',
    caption: 'Used where a door must return toward closed position; the spring barrel is the visual clue.',
    accentColor: '#b45309',
  },
  pivot: {
    label: 'Pivot / floor pivot hinge',
    subtitle: 'The door rotates around top and bottom pivot points.',
    caption: 'Common for heavier or cleaner-detail doors where the rotation axis is carried by pivots instead of side leaves.',
    accentColor: '#475569',
  },
  continuous: {
    label: 'Continuous / piano hinge',
    subtitle: 'A long hinge distributes support along the height.',
    caption: 'Used for panels, cabinets, or doors where load distribution and alignment over a long edge matter.',
    accentColor: '#334155',
  },
  concealed: {
    label: 'Concealed hinge',
    subtitle: 'Linked arms sit inside cups or routed pockets.',
    caption: 'Often used in cabinets or flush architectural panels where the hinge should be hidden when closed.',
    accentColor: '#0f766e',
  },
  parliament: {
    label: 'Parliament / wide-throw hinge',
    subtitle: 'Offset leaves project the pivot away from the frame.',
    caption: 'Used when the door must swing clear of deep trim, reveals, or wall build-ups.',
    accentColor: '#6d28d9',
  },
  strap: {
    label: 'Strap / T hinge',
    subtitle: 'A long strap leaf spreads load across the door face.',
    caption: 'Common in gates, rustic doors, and utility conditions where face-fixed hardware is acceptable.',
    accentColor: '#7c2d12',
  },
}

const DEFAULT_LEAF = '#9ca3af'
const DARK_EDGE = '#475569'
const PIN = '#374151'
const SCREW = '#1f2937'
const DOOR = '#e5e7eb'
const FRAME = '#d1d5db'

function Screw({ position }: { position: [number, number, number] }) {
  return (
    <mesh position={position} rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[0.055, 0.055, 0.018, 24]} />
      <meshStandardMaterial color={SCREW} roughness={0.65} metalness={0.35} />
    </mesh>
  )
}

function Leaf({ x = 0, width = 0.72, height = 1.8, color = DEFAULT_LEAF }: { x?: number; width?: number; height?: number; color?: string }) {
  return (
    <group position={[x, 0, 0]}>
      <mesh>
        <boxGeometry args={[width, height, 0.055]} />
        <meshStandardMaterial color={color} roughness={0.48} metalness={0.5} />
      </mesh>
      <mesh position={[0, 0, 0.034]}>
        <boxGeometry args={[width * 0.92, height * 0.92, 0.01]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.6} metalness={0.25} transparent opacity={0.28} />
      </mesh>
      <Screw position={[-width * 0.24, height * 0.28, 0.045]} />
      <Screw position={[width * 0.24, height * 0.28, 0.045]} />
      <Screw position={[-width * 0.24, -height * 0.28, 0.045]} />
      <Screw position={[width * 0.24, -height * 0.28, 0.045]} />
    </group>
  )
}

function PinBar({ height = 1.95, radius = 0.075, color = PIN }: { height?: number; radius?: number; color?: string }) {
  return (
    <mesh rotation={[0, 0, Math.PI / 2]} position={[0, 0, 0.08]}>
      <cylinderGeometry args={[radius, radius, height, 36]} />
      <meshStandardMaterial color={color} roughness={0.35} metalness={0.65} />
    </mesh>
  )
}

function Knuckles({ height = 1.9, count = 5, color = PIN }: { height?: number; count?: number; color?: string }) {
  const segment = height / count
  return (
    <group position={[0, -height / 2 + segment / 2, 0.08]}>
      {Array.from({ length: count }, (_, index) => (
        <mesh key={index} position={[0, index * segment, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.095, 0.095, segment * 0.74, 32]} />
          <meshStandardMaterial color={index % 2 === 0 ? color : '#64748b'} roughness={0.38} metalness={0.7} />
        </mesh>
      ))}
    </group>
  )
}

function DoorFrameReference() {
  return (
    <group position={[0, 0, -0.09]}>
      <mesh position={[-0.66, 0, 0]}>
        <boxGeometry args={[0.08, 2.25, 0.05]} />
        <meshStandardMaterial color={FRAME} roughness={0.85} metalness={0.02} />
      </mesh>
      <mesh position={[0.66, 0, 0]}>
        <boxGeometry args={[0.08, 2.25, 0.05]} />
        <meshStandardMaterial color={DOOR} roughness={0.85} metalness={0.02} />
      </mesh>
    </group>
  )
}

function StandardButt({ type, definition }: { type: HingeType; definition: HingeDefinition }) {
  const accent = definition.accentColor ?? DARK_EDGE
  const bearingPositions = type === 'ball-bearing' ? [-0.64, 0, 0.64] : []
  return (
    <group>
      <DoorFrameReference />
      <Leaf x={-0.39} color={definition.leafColor ?? DEFAULT_LEAF} />
      <Leaf x={0.39} color={definition.leafColor ?? DEFAULT_LEAF} />
      <Knuckles color={accent} />
      <PinBar color={type === 'loose-pin' ? '#78350f' : PIN} />
      {type === 'loose-pin' && (
        <mesh position={[0, 1.13, 0.08]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.14, 0.14, 0.08, 32]} />
          <meshStandardMaterial color="#92400e" roughness={0.45} metalness={0.45} />
        </mesh>
      )}
      {bearingPositions.map((y) => (
        <mesh key={y} position={[0, y, 0.08]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.105, 0.018, 12, 36]} />
          <meshStandardMaterial color="#e5e7eb" roughness={0.22} metalness={0.8} />
        </mesh>
      ))}
    </group>
  )
}

function SpringHinge({ definition }: { definition: HingeDefinition }) {
  return (
    <group>
      <StandardButt type="spring" definition={definition} />
      <mesh position={[0, 0, 0.08]} rotation={[0, 0, Math.PI / 2]}>
        <torusKnotGeometry args={[0.105, 0.012, 92, 8, 3, 9]} />
        <meshStandardMaterial color="#f59e0b" roughness={0.28} metalness={0.55} />
      </mesh>
    </group>
  )
}

function PivotHinge({ definition }: { definition: HingeDefinition }) {
  return (
    <group>
      <mesh position={[0, 0, -0.06]}>
        <boxGeometry args={[1.15, 2.05, 0.06]} />
        <meshStandardMaterial color={DOOR} roughness={0.9} />
      </mesh>
      <mesh position={[0, -1.14, 0.02]}>
        <boxGeometry args={[0.7, 0.08, 0.28]} />
        <meshStandardMaterial color={definition.accentColor} metalness={0.55} roughness={0.36} />
      </mesh>
      <mesh position={[0, 1.14, 0.02]}>
        <boxGeometry args={[0.7, 0.08, 0.28]} />
        <meshStandardMaterial color={definition.accentColor} metalness={0.55} roughness={0.36} />
      </mesh>
      <mesh position={[0, -1.02, 0.17]}>
        <cylinderGeometry args={[0.11, 0.11, 0.18, 32]} />
        <meshStandardMaterial color={PIN} metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0, 1.02, 0.17]}>
        <cylinderGeometry args={[0.11, 0.11, 0.18, 32]} />
        <meshStandardMaterial color={PIN} metalness={0.7} roughness={0.3} />
      </mesh>
    </group>
  )
}

function ContinuousHinge({ definition }: { definition: HingeDefinition }) {
  return (
    <group scale={[0.78, 1.18, 1]}>
      <DoorFrameReference />
      <Leaf x={-0.34} width={0.58} height={2.35} />
      <Leaf x={0.34} width={0.58} height={2.35} />
      <Knuckles height={2.45} count={13} color={definition.accentColor} />
      <PinBar height={2.52} radius={0.055} />
    </group>
  )
}

function ConcealedHinge({ definition }: { definition: HingeDefinition }) {
  return (
    <group>
      <mesh position={[-0.48, 0, -0.04]}>
        <boxGeometry args={[0.45, 1.25, 0.08]} />
        <meshStandardMaterial color={FRAME} roughness={0.85} />
      </mesh>
      <mesh position={[0.48, 0, -0.04]}>
        <boxGeometry args={[0.45, 1.25, 0.08]} />
        <meshStandardMaterial color={DOOR} roughness={0.85} />
      </mesh>
      <mesh position={[-0.48, 0.34, 0.08]}>
        <cylinderGeometry args={[0.22, 0.22, 0.06, 48]} />
        <meshStandardMaterial color={definition.accentColor} roughness={0.48} metalness={0.42} />
      </mesh>
      <mesh position={[0.48, -0.34, 0.08]}>
        <cylinderGeometry args={[0.22, 0.22, 0.06, 48]} />
        <meshStandardMaterial color={definition.accentColor} roughness={0.48} metalness={0.42} />
      </mesh>
      <mesh position={[0, 0.12, 0.1]} rotation={[0, 0, -0.42]}>
        <boxGeometry args={[0.82, 0.11, 0.06]} />
        <meshStandardMaterial color="#64748b" metalness={0.6} roughness={0.35} />
      </mesh>
      <mesh position={[0, -0.12, 0.1]} rotation={[0, 0, 0.42]}>
        <boxGeometry args={[0.82, 0.11, 0.06]} />
        <meshStandardMaterial color="#475569" metalness={0.6} roughness={0.35} />
      </mesh>
    </group>
  )
}

function ParliamentHinge({ definition }: { definition: HingeDefinition }) {
  return (
    <group>
      <DoorFrameReference />
      <Leaf x={-0.56} width={0.52} height={1.6} />
      <Leaf x={0.56} width={0.52} height={1.6} />
      <mesh position={[-0.22, 0, 0.02]}>
        <boxGeometry args={[0.42, 1.52, 0.045]} />
        <meshStandardMaterial color="#a78bfa" roughness={0.5} metalness={0.35} />
      </mesh>
      <mesh position={[0.22, 0, 0.02]}>
        <boxGeometry args={[0.42, 1.52, 0.045]} />
        <meshStandardMaterial color="#a78bfa" roughness={0.5} metalness={0.35} />
      </mesh>
      <Knuckles height={1.7} count={5} color={definition.accentColor} />
      <PinBar height={1.8} color={definition.accentColor} />
    </group>
  )
}

function StrapHinge({ definition }: { definition: HingeDefinition }) {
  return (
    <group>
      <mesh position={[0.2, 0, -0.06]}>
        <boxGeometry args={[1.6, 1.7, 0.055]} />
        <meshStandardMaterial color={DOOR} roughness={0.9} />
      </mesh>
      <mesh position={[-0.66, 0, 0.03]}>
        <boxGeometry args={[0.28, 1.35, 0.08]} />
        <meshStandardMaterial color={definition.accentColor} roughness={0.45} metalness={0.5} />
      </mesh>
      <mesh position={[0.08, 0, 0.035]}>
        <boxGeometry args={[1.16, 0.2, 0.075]} />
        <meshStandardMaterial color={definition.accentColor} roughness={0.45} metalness={0.5} />
      </mesh>
      <mesh position={[0.72, 0, 0.035]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[0.28, 0.28, 0.075]} />
        <meshStandardMaterial color={definition.accentColor} roughness={0.45} metalness={0.5} />
      </mesh>
      <PinBar height={1.44} color={PIN} />
      {[-0.36, 0.24, 0.72].map((x) => <Screw key={x} position={[x, 0, 0.09]} />)}
    </group>
  )
}

function HingeModel({ type }: { type: HingeType }) {
  const definition = HINGE_DEFINITIONS[type]

  if (type === 'spring') return <SpringHinge definition={definition} />
  if (type === 'pivot') return <PivotHinge definition={definition} />
  if (type === 'continuous') return <ContinuousHinge definition={definition} />
  if (type === 'concealed') return <ConcealedHinge definition={definition} />
  if (type === 'parliament') return <ParliamentHinge definition={definition} />
  if (type === 'strap') return <StrapHinge definition={definition} />
  return <StandardButt type={type} definition={definition} />
}

function Scene({ type }: { type: HingeType }) {
  const target = useMemo(() => new THREE.Vector3(0, 0, 0), [])

  return (
    <>
      <color attach="background" args={['#f8fafc']} />
      <ambientLight intensity={0.75} />
      <directionalLight position={[2.5, 3.5, 4]} intensity={1.35} />
      <directionalLight position={[-3, 2, -2]} intensity={0.35} />
      <Bounds fit clip observe margin={1.35}>
        <group rotation={[0.08, -0.36, 0]}>
          <HingeModel type={type} />
        </group>
      </Bounds>
      <ContactShadows position={[0, -1.26, 0]} opacity={0.18} scale={4} blur={2.6} far={2.5} />
      <OrbitControls
        makeDefault
        target={target}
        enableDamping
        dampingFactor={0.08}
        enablePan
        panSpeed={0.35}
        enableZoom
        zoomSpeed={0.45}
        minDistance={2.1}
        maxDistance={4.6}
        minPolarAngle={0.35}
        maxPolarAngle={Math.PI / 1.72}
      />
      <Html position={[0, -1.46, 0]} center className="pointer-events-none select-none">
        <span className="rounded-full border border-slate-200 bg-white/90 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.12em] text-slate-500 shadow-sm">
          orbit · limited zoom · pan
        </span>
      </Html>
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
    <figure className="not-prose my-7 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-3 dark:border-slate-800 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-camp-cobalt-600 dark:text-camp-cobalt-300">3D hardware study</p>
          <h4 className="mt-1 text-base font-semibold text-slate-950 dark:text-slate-50">{title ?? definition.label}</h4>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-300">{definition.subtitle}</p>
        </div>
        <div className="rounded-full border border-slate-200 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.12em] text-slate-500 dark:border-slate-700 dark:text-slate-400">
          article embed
        </div>
      </div>
      <div className="relative h-[280px] w-full bg-slate-50 dark:bg-slate-900 sm:h-[340px]">
        <Suspense fallback={<div className="flex h-full items-center justify-center text-sm text-slate-500">Loading hinge model…</div>}>
          <Canvas
            frameloop="demand"
            dpr={[1, 1.6]}
            camera={{ position: [2.4, 1.55, 3.1], fov: 38, near: 0.1, far: 20 }}
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
