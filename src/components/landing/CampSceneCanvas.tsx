'use client'

import { Suspense, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Html, Instances, Instance, ContactShadows } from '@react-three/drei'
import * as THREE from 'three'
import { WebGLErrorBoundary } from '@/components/r3f/WebGLErrorBoundary'
import type { CampHotspotId } from './HeroCampScene'
import { CampSceneFallback } from './HeroCampScene'

type Vec3 = [number, number, number]

interface CampSceneCanvasProps {
  animate: boolean
  activeHotspot: CampHotspotId
  onHotspotChange: (hotspot: CampHotspotId) => void
}

const HOTSPOT_POSITIONS: Record<CampHotspotId, Vec3> = {
  campfire: [0.15, 0.46, 0.2],
  trail: [-1.95, 0.3, 1.85],
  lake: [2.35, 0.3, 0.8],
  summit: [-1.8, 1.45, -2.55],
  shore: [3.0, 0.26, 2.35],
}

const HOTSPOT_LABELS: Record<CampHotspotId, string> = {
  campfire: 'Learn together',
  trail: 'Follow structured paths',
  lake: 'Reflect and review',
  summit: 'Track mastery',
  shore: 'Launch your next goal',
}

const CAMERA_TARGETS: Record<CampHotspotId, Vec3> = {
  campfire: [4.8, 4.0, 5.2],
  trail: [3.3, 3.0, 6.0],
  lake: [5.3, 3.3, 4.4],
  summit: [3.8, 4.7, 5.1],
  shore: [5.4, 3.1, 5.7],
}

const TREE_POSITIONS: Array<[number, number, number, number]> = [
  [-3.4, 0.35, -1.2, 0.8],
  [-2.8, 0.35, 1.1, 0.65],
  [-2.0, 0.35, -0.8, 0.72],
  [-1.1, 0.35, -2.3, 0.9],
  [-0.8, 0.35, 2.3, 0.58],
  [1.1, 0.35, -2.6, 0.7],
  [1.8, 0.35, -1.8, 0.62],
  [2.7, 0.35, -1.0, 0.8],
  [3.3, 0.35, 0.0, 0.68],
  [2.0, 0.35, 2.6, 0.55],
]

const ROCK_POSITIONS: Array<[number, number, number, number]> = [
  [-2.7, 0.25, 0.2, 0.23],
  [-0.9, 0.25, 1.4, 0.18],
  [1.1, 0.25, -0.8, 0.24],
  [2.7, 0.25, 1.7, 0.2],
  [3.2, 0.25, -1.7, 0.18],
]

export function CampSceneCanvas({
  animate,
  activeHotspot,
  onHotspotChange,
}: CampSceneCanvasProps) {
  return (
    <WebGLErrorBoundary fallback={<CampSceneFallback label='Graphics fallback camp map' />}>
      <Canvas
        frameloop={animate ? 'always' : 'demand'}
        shadows={false}
        dpr={[1, 1.5]}
        camera={{ position: [4.8, 4, 5.2], fov: 42 }}
        gl={{
          antialias: true,
          alpha: true,
          stencil: false,
          depth: true,
          powerPreference: 'high-performance',
        }}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
        }}
      >
        <Suspense fallback={null}>
          <color attach='background' args={['#172235']} />
          <ambientLight intensity={1.7} />
          <directionalLight position={[4, 7, 3]} intensity={2.1} />
          <pointLight position={[0.15, 1.0, 0.2]} intensity={animate ? 2.2 : 1.5} color='#f59b43' />
          <CampScene
            animate={animate}
            activeHotspot={activeHotspot}
            onHotspotChange={onHotspotChange}
          />
          <CameraRig animate={animate} activeHotspot={activeHotspot} />
        </Suspense>
      </Canvas>
    </WebGLErrorBoundary>
  )
}

function CampScene({
  animate,
  activeHotspot,
  onHotspotChange,
}: CampSceneCanvasProps) {
  return (
    <group rotation={[0, -0.28, 0]} position={[0, -0.6, 0]}>
      <Terrain />
      <Mountains />
      <Trail />
      <Lake animate={animate} />
      <Shore />
      <Trees animate={animate} />
      <Rocks />
      <Cabin />
      <Tent />
      <Campfire animate={animate} />
      <Signpost />
      {(Object.keys(HOTSPOT_POSITIONS) as CampHotspotId[]).map((id) => (
        <SceneHotspot
          key={id}
          id={id}
          active={activeHotspot === id}
          position={HOTSPOT_POSITIONS[id]}
          onHotspotChange={onHotspotChange}
        />
      ))}
      <ContactShadows
        position={[0, 0.02, 0]}
        opacity={0.25}
        scale={8}
        blur={2}
        far={5}
      />
    </group>
  )
}

function Terrain() {
  return (
    <group>
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[4.1, 4.45, 0.42, 9]} />
        <meshStandardMaterial color='#315b3e' roughness={0.92} />
      </mesh>
      <mesh position={[0, -0.23, 0]}>
        <cylinderGeometry args={[4.18, 4.52, 0.28, 9]} />
        <meshStandardMaterial color='#8d704f' roughness={0.95} />
      </mesh>
    </group>
  )
}

function Mountains() {
  return (
    <group position={[-0.7, 0.05, -2.85]}>
      {[
        [-1.35, 0, 0, 1.2, '#405269'],
        [-0.35, 0, -0.25, 1.65, '#50627a'],
        [0.95, 0, 0.05, 1.35, '#3f5066'],
      ].map(([x, y, z, scale, color], index) => (
        <group key={index} position={[x as number, y as number, z as number]} scale={scale as number}>
          <mesh position={[0, 0.75, 0]} rotation={[0, Math.PI / 4, 0]}>
            <coneGeometry args={[0.86, 1.95, 4]} />
            <meshStandardMaterial color={color as string} roughness={0.9} />
          </mesh>
          <mesh position={[0, 1.46, 0]} rotation={[0, Math.PI / 4, 0]} scale={0.42}>
            <coneGeometry args={[0.84, 0.72, 4]} />
            <meshStandardMaterial color='#e7edf0' roughness={0.65} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

function Trail() {
  const stones = useMemo(
    () =>
      Array.from({ length: 12 }, (_, index) => {
        const t = index / 11
        const x = -2.5 + t * 2.7 + Math.sin(t * Math.PI * 2) * 0.22
        const z = 2.45 - t * 2.3
        return [x, 0.25, z, 0.18 + t * 0.05] as const
      }),
    [],
  )

  return (
    <group>
      {stones.map(([x, y, z, scale], index) => (
        <mesh
          key={index}
          position={[x, y, z]}
          rotation={[0, index * 0.36, 0]}
          scale={[scale * 1.5, 0.06, scale * 0.9]}
        >
          <cylinderGeometry args={[1, 1, 1, 7]} />
          <meshStandardMaterial color='#d5b47d' roughness={0.9} />
        </mesh>
      ))}
    </group>
  )
}

function Lake({ animate }: { animate: boolean }) {
  const waterRef = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    if (!animate || !waterRef.current) return
    waterRef.current.position.y = 0.275 + Math.sin(clock.elapsedTime * 1.4) * 0.012
    waterRef.current.rotation.z = Math.sin(clock.elapsedTime * 0.45) * 0.025
  })

  return (
    <group position={[2.15, 0.24, 0.85]} rotation={[0, -0.2, 0]}>
      <mesh ref={waterRef} scale={[1.15, 0.06, 0.72]}>
        <cylinderGeometry args={[1, 1, 1, 32]} />
        <meshStandardMaterial color='#4b9bad' roughness={0.32} metalness={0.02} />
      </mesh>
      <mesh scale={[1.28, 0.04, 0.84]} position={[0, -0.03, 0]}>
        <cylinderGeometry args={[1, 1, 1, 32]} />
        <meshStandardMaterial color='#d0bc86' roughness={0.9} />
      </mesh>
    </group>
  )
}

function Shore() {
  return (
    <group position={[3.0, 0.24, 2.25]} rotation={[0, 0.2, 0]}>
      <mesh scale={[0.92, 0.05, 0.42]}>
        <cylinderGeometry args={[1, 1, 1, 24]} />
        <meshStandardMaterial color='#d8c08a' roughness={0.92} />
      </mesh>
      <mesh position={[0.25, 0.06, -0.02]} scale={[0.52, 0.04, 0.22]}>
        <cylinderGeometry args={[1, 1, 1, 24]} />
        <meshStandardMaterial color='#66a8b6' roughness={0.38} />
      </mesh>
    </group>
  )
}

function Trees({ animate }: { animate: boolean }) {
  const groupRef = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    if (!animate || !groupRef.current) return
    groupRef.current.rotation.z = Math.sin(clock.elapsedTime * 0.7) * 0.008
  })

  return (
    <group ref={groupRef}>
      <Instances limit={TREE_POSITIONS.length}>
        <coneGeometry args={[0.28, 0.82, 5]} />
        <meshStandardMaterial color='#477a54' roughness={0.9} />
        {TREE_POSITIONS.map(([x, y, z, scale], index) => (
          <Instance key={index} position={[x, y + 0.52 * scale, z]} scale={scale} />
        ))}
      </Instances>
      <Instances limit={TREE_POSITIONS.length}>
        <boxGeometry args={[0.12, 0.38, 0.12]} />
        <meshStandardMaterial color='#765238' roughness={0.9} />
        {TREE_POSITIONS.map(([x, y, z, scale], index) => (
          <Instance key={index} position={[x, y + 0.17 * scale, z]} scale={scale} />
        ))}
      </Instances>
    </group>
  )
}

function Rocks() {
  return (
    <Instances limit={ROCK_POSITIONS.length}>
      <dodecahedronGeometry args={[1, 0]} />
      <meshStandardMaterial color='#7c8790' roughness={0.94} />
      {ROCK_POSITIONS.map(([x, y, z, scale], index) => (
        <Instance
          key={index}
          position={[x, y, z]}
          rotation={[index * 0.4, index * 0.7, 0]}
          scale={[scale * 1.3, scale * 0.72, scale]}
        />
      ))}
    </Instances>
  )
}

function Cabin() {
  return (
    <group position={[1.05, 0.36, -1.05]} rotation={[0, -0.55, 0]}>
      <mesh position={[0, 0.22, 0]}>
        <boxGeometry args={[0.86, 0.45, 0.58]} />
        <meshStandardMaterial color='#8b6144' roughness={0.86} />
      </mesh>
      <mesh position={[0, 0.52, 0]} rotation={[0, 0, Math.PI / 4]} scale={[0.72, 0.72, 0.64]}>
        <boxGeometry args={[0.72, 0.72, 0.72]} />
        <meshStandardMaterial color='#d1a15e' roughness={0.82} />
      </mesh>
      <mesh position={[0.02, 0.12, 0.3]}>
        <boxGeometry args={[0.18, 0.26, 0.035]} />
        <meshStandardMaterial color='#273246' roughness={0.75} />
      </mesh>
    </group>
  )
}

function Tent() {
  return (
    <group position={[-1.2, 0.34, 0.68]} rotation={[0, 0.48, 0]}>
      <mesh position={[0, 0.22, 0]} rotation={[0, Math.PI / 4, 0]} scale={[0.64, 0.5, 0.72]}>
        <coneGeometry args={[0.8, 0.8, 4]} />
        <meshStandardMaterial color='#e3b56c' roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.18, 0.36]} scale={[0.22, 0.32, 0.04]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color='#304257' roughness={0.8} />
      </mesh>
    </group>
  )
}

function Campfire({ animate }: { animate: boolean }) {
  const flameRef = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    if (!animate || !flameRef.current) return
    const pulse = 1 + Math.sin(clock.elapsedTime * 5.2) * 0.08
    flameRef.current.scale.set(pulse, 1 + Math.sin(clock.elapsedTime * 4.4) * 0.12, pulse)
  })

  return (
    <group position={[0.15, 0.28, 0.2]}>
      <mesh rotation={[0, 0, 0.85]} position={[-0.13, 0.08, 0]}>
        <boxGeometry args={[0.44, 0.08, 0.09]} />
        <meshStandardMaterial color='#6f4831' roughness={0.9} />
      </mesh>
      <mesh rotation={[0, 0, -0.85]} position={[0.13, 0.08, 0]}>
        <boxGeometry args={[0.44, 0.08, 0.09]} />
        <meshStandardMaterial color='#6f4831' roughness={0.9} />
      </mesh>
      <group ref={flameRef}>
        <mesh position={[0, 0.38, 0]} rotation={[0, Math.PI / 4, 0]}>
          <coneGeometry args={[0.18, 0.52, 5]} />
          <meshStandardMaterial color='#f49b3d' emissive='#e8853a' emissiveIntensity={0.55} roughness={0.6} />
        </mesh>
        <mesh position={[0.02, 0.4, 0.02]} rotation={[0, Math.PI / 4, 0]} scale={0.58}>
          <coneGeometry args={[0.18, 0.52, 5]} />
          <meshStandardMaterial color='#ffd27a' emissive='#e8853a' emissiveIntensity={0.75} roughness={0.5} />
        </mesh>
      </group>
    </group>
  )
}

function Signpost() {
  return (
    <group position={[-2.0, 0.28, 1.84]} rotation={[0, 0.24, 0]}>
      <mesh position={[0, 0.34, 0]}>
        <boxGeometry args={[0.08, 0.68, 0.08]} />
        <meshStandardMaterial color='#72503a' roughness={0.9} />
      </mesh>
      <mesh position={[0.22, 0.58, 0]}>
        <boxGeometry args={[0.56, 0.16, 0.06]} />
        <meshStandardMaterial color='#d7b274' roughness={0.85} />
      </mesh>
    </group>
  )
}

function SceneHotspot({
  id,
  active,
  position,
  onHotspotChange,
}: {
  id: CampHotspotId
  active: boolean
  position: Vec3
  onHotspotChange: (hotspot: CampHotspotId) => void
}) {
  return (
    <Html position={position} center distanceFactor={7.2} zIndexRange={[20, 10]}>
      <button
        type='button'
        onClick={() => onHotspotChange(id)}
        onPointerEnter={() => onHotspotChange(id)}
        className={`group inline-flex items-center gap-2 rounded-sm border px-2 py-1 text-[10px] font-bold text-ink shadow-lg backdrop-blur-md transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
          active
            ? 'border-white bg-white'
            : 'border-white/50 bg-white/75 hover:bg-white'
        }`}
        aria-label={HOTSPOT_LABELS[id]}
      >
        <span
          className={`h-2 w-2 rounded-full ${
            active ? 'bg-camp-orange' : 'bg-camp-cobalt'
          }`}
          aria-hidden='true'
        />
        <span className='hidden whitespace-nowrap sm:inline'>{HOTSPOT_LABELS[id]}</span>
      </button>
    </Html>
  )
}

function CameraRig({
  animate,
  activeHotspot,
}: {
  animate: boolean
  activeHotspot: CampHotspotId
}) {
  const { camera, pointer } = useThree()
  const target = useMemo(() => new THREE.Vector3(0, 0.45, 0), [])

  useFrame(({ clock }) => {
    const base = CAMERA_TARGETS[activeHotspot]
    const drift = animate ? Math.sin(clock.elapsedTime * 0.35) * 0.12 : 0
    const next = new THREE.Vector3(
      base[0] + (animate ? pointer.x * 0.26 : 0),
      base[1] + drift,
      base[2] + (animate ? pointer.y * -0.18 : 0),
    )

    camera.position.lerp(next, animate ? 0.045 : 0.14)
    camera.lookAt(target)
  })

  return null
}
