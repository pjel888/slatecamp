'use client'

import React, { Suspense, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { Bounds, ContactShadows, OrbitControls, RoundedBox } from '@react-three/drei'
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
const DOOR = '#e5e7eb'
const FRAME = '#d1d5db'

const BRUSH_LINES = '#f8fafc'

function SteelMaterial({
  color = DEFAULT_LEAF,
  roughness = 0.34,
  metalness = 0.72,
  opacity = 1,
}: {
  color?: string
  roughness?: number
  metalness?: number
  opacity?: number
}) {
  return (
    <meshStandardMaterial
      color={color}
      roughness={roughness}
      metalness={metalness}
      transparent={opacity < 1}
      opacity={opacity}
    />
  )
}

function RoundedPlate({
  position = [0, 0, 0],
  width,
  height,
  depth = 0.06,
  color = DEFAULT_LEAF,
  radius = 0.035,
}: {
  position?: [number, number, number]
  width: number
  height: number
  depth?: number
  color?: string
  radius?: number
}) {
  return (
    <RoundedBox args={[width, height, depth]} radius={radius} smoothness={6} position={position}>
      <SteelMaterial color={color} />
    </RoundedBox>
  )
}

function CountersinkRing({ position, radius = 0.082 }: { position: [number, number, number]; radius?: number }) {
  return (
    <mesh position={position} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[radius, radius * 0.08, 12, 36]} />
      <meshStandardMaterial color="#f1f5f9" roughness={0.24} metalness={0.75} />
    </mesh>
  )
}

function Screw({
  position,
  radius = 0.055,
  head = 'countersunk',
}: {
  position: [number, number, number]
  radius?: number
  head?: 'countersunk' | 'round'
}) {
  return (
    <group position={position}>
      {head === 'countersunk' && <CountersinkRing position={[0, 0, -0.002]} radius={radius * 1.22} />}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        {head === 'countersunk' ? (
          <coneGeometry args={[radius * 1.18, 0.03, 32]} />
        ) : (
          <sphereGeometry args={[radius, 24, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
        )}
        <meshStandardMaterial color="#334155" roughness={0.42} metalness={0.62} />
      </mesh>
      <mesh position={[0, 0.002, 0.016]} rotation={[0, 0, Math.PI / 8]}>
        <boxGeometry args={[radius * 1.5, radius * 0.18, 0.008]} />
        <meshStandardMaterial color="#0f172a" roughness={0.5} metalness={0.3} />
      </mesh>
    </group>
  )
}

function EdgeBevel({ width, height }: { width: number; height: number }) {
  const edgeColor = '#e2e8f0'
  return (
    <group position={[0, 0, 0.038]}>
      <mesh position={[0, height / 2 - 0.018, 0]}>
        <boxGeometry args={[width * 0.94, 0.018, 0.014]} />
        <meshStandardMaterial color={edgeColor} roughness={0.45} metalness={0.35} />
      </mesh>
      <mesh position={[0, -height / 2 + 0.018, 0]}>
        <boxGeometry args={[width * 0.94, 0.018, 0.014]} />
        <meshStandardMaterial color={edgeColor} roughness={0.45} metalness={0.35} />
      </mesh>
      <mesh position={[width / 2 - 0.018, 0, 0]}>
        <boxGeometry args={[0.018, height * 0.94, 0.014]} />
        <meshStandardMaterial color={edgeColor} roughness={0.45} metalness={0.35} />
      </mesh>
      <mesh position={[-width / 2 + 0.018, 0, 0]}>
        <boxGeometry args={[0.018, height * 0.94, 0.014]} />
        <meshStandardMaterial color={edgeColor} roughness={0.45} metalness={0.35} />
      </mesh>
    </group>
  )
}

function FineGrooves({ width, height }: { width: number; height: number }) {
  return (
    <group position={[0, 0, 0.043]}>
      {[-0.3, 0, 0.3].map((y) => (
        <mesh key={y} position={[0, y * height, 0]}>
          <boxGeometry args={[width * 0.76, 0.007, 0.006]} />
          <meshStandardMaterial color={BRUSH_LINES} roughness={0.5} metalness={0.2} transparent opacity={0.42} />
        </mesh>
      ))}
    </group>
  )
}

function Leaf({ x = 0, width = 0.72, height = 1.8, color = DEFAULT_LEAF }: { x?: number; width?: number; height?: number; color?: string }) {
  return (
    <group position={[x, 0, 0]}>
      <RoundedPlate width={width} height={height} depth={0.058} color={color} radius={0.04} />
      <RoundedBox args={[width * 0.9, height * 0.9, 0.012]} radius={0.025} smoothness={4} position={[0, 0, 0.034]}>
        <meshStandardMaterial color="#cbd5e1" roughness={0.5} metalness={0.32} transparent opacity={0.36} />
      </RoundedBox>
      <EdgeBevel width={width} height={height} />
      <FineGrooves width={width} height={height} />
      <Screw position={[-width * 0.24, height * 0.28, 0.045]} />
      <Screw position={[width * 0.24, height * 0.28, 0.045]} />
      <Screw position={[-width * 0.24, -height * 0.28, 0.045]} />
      <Screw position={[width * 0.24, -height * 0.28, 0.045]} />
    </group>
  )
}

function PinBar({ height = 1.95, radius = 0.075, color = PIN }: { height?: number; radius?: number; color?: string }) {
  return (
    <group>
      <mesh rotation={[0, 0, Math.PI / 2]} position={[0, 0, 0.08]}>
        <cylinderGeometry args={[radius, radius, height, 48]} />
        <meshStandardMaterial color={color} roughness={0.28} metalness={0.74} />
      </mesh>
      <mesh position={[0, height / 2 + 0.035, 0.08]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[radius * 1.18, radius * 1.18, 0.045, 48]} />
        <meshStandardMaterial color="#111827" roughness={0.32} metalness={0.7} />
      </mesh>
      <mesh position={[0, -height / 2 - 0.035, 0.08]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[radius * 1.08, radius * 1.08, 0.032, 48]} />
        <meshStandardMaterial color="#111827" roughness={0.32} metalness={0.7} />
      </mesh>
    </group>
  )
}

function Knuckles({ height = 1.9, count = 5, color = PIN }: { height?: number; count?: number; color?: string }) {
  const segment = height / count
  return (
    <group position={[0, -height / 2 + segment / 2, 0.08]}>
      {Array.from({ length: count }, (_, index) => (
        <mesh key={index} position={[0, index * segment, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.102, 0.102, segment * 0.74, 48]} />
          <meshStandardMaterial color={index % 2 === 0 ? color : '#64748b'} roughness={0.32} metalness={0.76} />
        </mesh>
      ))}
    </group>
  )
}

function DoorFrameReference() {
  return (
    <group position={[0, 0, -0.09]}>
      <RoundedPlate position={[-0.66, 0, 0]} width={0.08} height={2.25} depth={0.05} color={FRAME} radius={0.018} />
      <RoundedPlate position={[0.66, 0, 0]} width={0.08} height={2.25} depth={0.05} color={DOOR} radius={0.018} />
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
        <group>
          <mesh position={[0, 1.32, 0.08]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.045, 0.045, 0.42, 32]} />
            <meshStandardMaterial color="#92400e" roughness={0.32} metalness={0.65} />
          </mesh>
          <mesh position={[0, 1.56, 0.08]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.15, 0.15, 0.075, 40]} />
            <meshStandardMaterial color="#92400e" roughness={0.4} metalness={0.55} />
          </mesh>
        </group>
      )}
      {bearingPositions.map((y) => (
        <group key={y} position={[0, y, 0.08]}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <torusGeometry args={[0.122, 0.018, 16, 48]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.18} metalness={0.9} />
          </mesh>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.132, 0.132, 0.026, 48]} />
            <meshStandardMaterial color="#cbd5e1" roughness={0.22} metalness={0.82} transparent opacity={0.45} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

function SpringHinge({ definition }: { definition: HingeDefinition }) {
  return (
    <group>
      <StandardButt type="spring" definition={definition} />
      <mesh position={[0, 0, 0.115]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.15, 0.15, 1.48, 48]} />
        <meshStandardMaterial color="#d97706" roughness={0.34} metalness={0.62} transparent opacity={0.42} />
      </mesh>
      <mesh position={[0, 0, 0.15]} rotation={[0, 0, Math.PI / 2]}>
        <torusKnotGeometry args={[0.145, 0.012, 128, 8, 3, 11]} />
        <meshStandardMaterial color="#fbbf24" roughness={0.24} metalness={0.65} />
      </mesh>
      {[-0.42, 0, 0.42].map((y) => (
        <mesh key={y} position={[0, y, 0.28]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.018, 0.018, 0.022, 16]} />
          <meshStandardMaterial color="#451a03" roughness={0.45} metalness={0.4} />
        </mesh>
      ))}
    </group>
  )
}

function PivotHinge({ definition }: { definition: HingeDefinition }) {
  return (
    <group>
      <RoundedPlate position={[0, 0, -0.06]} width={1.15} height={2.05} depth={0.06} color={DOOR} radius={0.035} />
      <RoundedPlate position={[0, -1.14, 0.02]} width={0.82} height={0.12} depth={0.32} color={definition.accentColor} radius={0.035} />
      <RoundedPlate position={[0, 1.14, 0.02]} width={0.82} height={0.12} depth={0.32} color={definition.accentColor} radius={0.035} />
      {[-0.28, 0.28].map((x) => (
        <React.Fragment key={x}>
          <Screw position={[x, -1.14, 0.19]} />
          <Screw position={[x, 1.14, 0.19]} />
        </React.Fragment>
      ))}
      <mesh position={[0, -1.02, 0.17]}>
        <cylinderGeometry args={[0.12, 0.12, 0.22, 48]} />
        <meshStandardMaterial color={PIN} metalness={0.76} roughness={0.26} />
      </mesh>
      <mesh position={[0, 1.02, 0.17]}>
        <cylinderGeometry args={[0.12, 0.12, 0.22, 48]} />
        <meshStandardMaterial color={PIN} metalness={0.76} roughness={0.26} />
      </mesh>
      <mesh position={[0, 0, 0.12]}>
        <cylinderGeometry args={[0.028, 0.028, 2.04, 32]} />
        <meshStandardMaterial color="#0f172a" metalness={0.7} roughness={0.35} />
      </mesh>
    </group>
  )
}

function ContinuousHinge({ definition }: { definition: HingeDefinition }) {
  return (
    <group scale={[0.78, 1.18, 1]}>
      <DoorFrameReference />
      <Leaf x={-0.34} width={0.5} height={2.35} />
      <Leaf x={0.34} width={0.5} height={2.35} />
      {Array.from({ length: 7 }, (_, i) => -0.9 + i * 0.3).map((y) => (
        <React.Fragment key={y}>
          <Screw position={[-0.34, y, 0.046]} radius={0.042} />
          <Screw position={[0.34, y + 0.15, 0.046]} radius={0.042} />
        </React.Fragment>
      ))}
      <Knuckles height={2.45} count={13} color={definition.accentColor} />
      <PinBar height={2.52} radius={0.055} />
    </group>
  )
}

function ConcealedHinge({ definition }: { definition: HingeDefinition }) {
  return (
    <group>
      <RoundedPlate position={[-0.48, 0, -0.04]} width={0.45} height={1.25} depth={0.08} color={FRAME} radius={0.04} />
      <RoundedPlate position={[0.48, 0, -0.04]} width={0.45} height={1.25} depth={0.08} color={DOOR} radius={0.04} />
      <mesh position={[-0.48, 0.34, 0.08]}>
        <cylinderGeometry args={[0.22, 0.22, 0.06, 48]} />
        <meshStandardMaterial color={definition.accentColor} roughness={0.48} metalness={0.42} />
      </mesh>
      <mesh position={[0.48, -0.34, 0.08]}>
        <cylinderGeometry args={[0.22, 0.22, 0.06, 48]} />
        <meshStandardMaterial color={definition.accentColor} roughness={0.48} metalness={0.42} />
      </mesh>
      <group rotation={[0, 0, -0.42]}><RoundedPlate position={[0, 0.12, 0.1]} width={0.82} height={0.11} depth={0.06} color="#64748b" radius={0.025} /></group>
      <group rotation={[0, 0, 0.42]}><RoundedPlate position={[0, -0.12, 0.1]} width={0.82} height={0.11} depth={0.06} color="#475569" radius={0.025} /></group>
      {[[-0.2, 0.24], [0.2, -0.24], [0, 0]].map(([x, y]) => (
        <mesh key={`${x}-${y}`} position={[x, y, 0.145]}>
          <sphereGeometry args={[0.045, 24, 16]} />
          <meshStandardMaterial color="#0f172a" metalness={0.62} roughness={0.35} />
        </mesh>
      ))}
      <Screw position={[-0.48, 0.34, 0.145]} radius={0.038} />
      <Screw position={[0.48, -0.34, 0.145]} radius={0.038} />
    </group>
  )
}

function ParliamentHinge({ definition }: { definition: HingeDefinition }) {
  return (
    <group>
      <DoorFrameReference />
      <Leaf x={-0.56} width={0.52} height={1.6} />
      <Leaf x={0.56} width={0.52} height={1.6} />
      <RoundedPlate position={[-0.22, 0, 0.02]} width={0.42} height={1.52} depth={0.045} color="#a78bfa" radius={0.035} />
      <RoundedPlate position={[0.22, 0, 0.02]} width={0.42} height={1.52} depth={0.045} color="#a78bfa" radius={0.035} />
      <Knuckles height={1.7} count={5} color={definition.accentColor} />
      <PinBar height={1.8} color={definition.accentColor} />
    </group>
  )
}

function StrapHinge({ definition }: { definition: HingeDefinition }) {
  return (
    <group>
      <RoundedPlate position={[0.2, 0, -0.06]} width={1.6} height={1.7} depth={0.055} color={DOOR} radius={0.035} />
      <RoundedPlate position={[-0.66, 0, 0.03]} width={0.28} height={1.35} depth={0.08} color={definition.accentColor} radius={0.035} />
      <RoundedPlate position={[0.04, 0, 0.035]} width={1.22} height={0.2} depth={0.075} color={definition.accentColor} radius={0.05} />
      <mesh position={[0.72, 0, 0.035]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[0.34, 0.34, 0.075]} />
        <meshStandardMaterial color={definition.accentColor} roughness={0.42} metalness={0.55} />
      </mesh>
      <mesh position={[0.86, 0, 0.036]}>
        <coneGeometry args={[0.15, 0.32, 4]} />
        <meshStandardMaterial color={definition.accentColor} roughness={0.42} metalness={0.55} />
      </mesh>
      <PinBar height={1.44} color={PIN} />
      {[-0.46, -0.12, 0.28, 0.66].map((x) => <Screw key={x} position={[x, 0, 0.09]} radius={0.06} head="round" />)}
      <Screw position={[-0.66, 0.38, 0.09]} radius={0.055} head="round" />
      <Screw position={[-0.66, -0.38, 0.09]} radius={0.055} head="round" />
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
      <ambientLight intensity={0.78} />
      <directionalLight position={[2.5, 3.5, 4]} intensity={1.35} />
      <directionalLight position={[-3, 2, -2]} intensity={0.42} />
      <pointLight position={[0, 1.8, 2.5]} intensity={0.45} />
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
