'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Line, PerspectiveCamera } from '@react-three/drei'
import { easing } from 'maath'
import type { Group, Mesh } from 'three'
import { WebGLErrorBoundary } from '@/components/r3f/WebGLErrorBoundary'
import { palette } from '@/components/graphics/tokens'

const ATLAS_COLORS = {
  sheet: palette.surfaceCard,
  sheetBlue: palette.slateBlue50,
  guide: palette.slateBlue,
  guideSoft: palette.borderDefault,
  node: palette.slateBlue,
  amber: palette.amber,
  emerald: palette.emerald,
  ink: palette.inkPrimary,
  shadow: palette.inkTertiary,
} as const

type Vec3 = [number, number, number]

interface SheetSpec {
  position: Vec3
  rotation: Vec3
  scale: Vec3
  color: string
  opacity: number
}

interface NodeSpec {
  id: string
  start: Vec3
  end: Vec3
  color: string
  radius: number
}

const SHEETS: SheetSpec[] = [
  { position: [-0.34, 0.1, 0.12], rotation: [-0.52, 0.1, -0.22], scale: [2.1, 0.035, 1.28], color: ATLAS_COLORS.sheet, opacity: 0.9 },
  { position: [-0.2, 0.24, 0.03], rotation: [-0.52, 0.08, -0.16], scale: [2.04, 0.035, 1.24], color: ATLAS_COLORS.sheetBlue, opacity: 0.82 },
  { position: [-0.05, 0.38, -0.05], rotation: [-0.52, 0.06, -0.09], scale: [1.96, 0.035, 1.2], color: ATLAS_COLORS.sheet, opacity: 0.92 },
  { position: [0.1, 0.53, -0.14], rotation: [-0.52, 0.03, -0.02], scale: [1.88, 0.035, 1.16], color: ATLAS_COLORS.sheetBlue, opacity: 0.8 },
  { position: [0.24, 0.68, -0.24], rotation: [-0.52, 0, 0.04], scale: [1.78, 0.035, 1.1], color: ATLAS_COLORS.sheet, opacity: 0.94 },
]

const NODES: NodeSpec[] = [
  { id: 'codes', start: [-2.2, 1.3, -0.8], end: [-1.24, 0.98, -0.52], color: ATLAS_COLORS.node, radius: 0.04 },
  { id: 'history', start: [1.9, 1.5, -0.9], end: [-0.86, 1.28, -0.7], color: ATLAS_COLORS.node, radius: 0.032 },
  { id: 'utilities', start: [-1.8, -0.35, 0.85], end: [-0.42, 1.12, -0.52], color: ATLAS_COLORS.amber, radius: 0.036 },
  { id: 'structure', start: [2.2, -0.2, 0.75], end: [0.16, 1.24, -0.66], color: ATLAS_COLORS.node, radius: 0.034 },
  { id: 'planning', start: [-2.0, 0.55, 1.2], end: [0.62, 1.03, -0.46], color: ATLAS_COLORS.emerald, radius: 0.045 },
  { id: 'egress', start: [2.25, 0.82, 0.9], end: [0.98, 1.2, -0.62], color: ATLAS_COLORS.node, radius: 0.035 },
  { id: 'materials', start: [-1.55, 1.85, 0.1], end: [1.22, 0.78, -0.26], color: ATLAS_COLORS.amber, radius: 0.032 },
  { id: 'practice', start: [1.5, -0.8, -0.1], end: [0.68, 0.54, 0.02], color: ATLAS_COLORS.emerald, radius: 0.046 },
  { id: 'repair', start: [-0.1, 2.1, -1.15], end: [-0.02, 1.5, -0.86], color: ATLAS_COLORS.amber, radius: 0.04 },
  { id: 'visuals', start: [-2.15, -0.65, -0.2], end: [-0.76, 0.64, -0.1], color: ATLAS_COLORS.node, radius: 0.033 },
  { id: 'tools', start: [2.0, 1.9, 0.3], end: [1.08, 0.46, 0.08], color: ATLAS_COLORS.emerald, radius: 0.036 },
  { id: 'next', start: [0.55, -1.05, 1.0], end: [0.22, 0.3, 0.22], color: ATLAS_COLORS.node, radius: 0.034 },
]

const ROUTES: [number, number][] = [
  [0, 1], [1, 2], [2, 4], [4, 5], [5, 6], [6, 8], [8, 3], [3, 7], [7, 11], [11, 10], [10, 5], [9, 2], [9, 11], [0, 9],
]

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

const isWebGLContext = (context: RenderingContext | null): context is WebGLRenderingContext | WebGL2RenderingContext =>
  Boolean(context && 'getParameter' in context && typeof context.getParameter === 'function')

const useSafeWebGLStatus = () => {
  const [available, setAvailable] = useState(false)

  useEffect(() => {
    let mounted = true

    const markUnavailable = () => {
      if (mounted) setAvailable(false)
    }

    const handleWebGLError = (event: ErrorEvent) => {
      const message = `${event.message ?? ''} ${event.error instanceof Error ? event.error.message : ''}`
      if (/webgl|webglrenderer|error creating webgl context/i.test(message)) {
        event.preventDefault()
        markUnavailable()
      }
    }

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason
      const message = reason instanceof Error ? reason.message : String(reason ?? '')
      if (/webgl|webglrenderer|error creating webgl context/i.test(message)) {
        event.preventDefault()
        markUnavailable()
      }
    }

    window.addEventListener('error', handleWebGLError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    try {
      if (!('WebGLRenderingContext' in window)) {
        markUnavailable()
        return () => {
          mounted = false
          window.removeEventListener('error', handleWebGLError)
          window.removeEventListener('unhandledrejection', handleUnhandledRejection)
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
          window.removeEventListener('error', handleWebGLError)
          window.removeEventListener('unhandledrejection', handleUnhandledRejection)
        }
      }

      context.getParameter(context.VERSION)
      if (mounted) setAvailable(true)
    } catch {
      markUnavailable()
    }

    return () => {
      mounted = false
      window.removeEventListener('error', handleWebGLError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [])

  return available
}

const AtlasFallbackPoster = () => (
  <div className='absolute inset-0 overflow-hidden' aria-hidden='true'>
    <div className='absolute inset-[-12%] bg-[radial-gradient(circle_at_30%_22%,rgba(93,136,255,0.22),transparent_26%),radial-gradient(circle_at_76%_18%,rgba(232,133,58,0.16),transparent_24%),linear-gradient(135deg,rgba(255,255,255,0.08),transparent_52%)]' />
    <div className='absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.10)_1px,transparent_1px)] [background-size:34px_34px]' />
    <div className='absolute left-[10%] top-[22%] h-px w-[62%] rotate-[-8deg] bg-linear-to-r from-transparent via-camp-amber/40 to-transparent' />
    <div className='absolute right-[12%] top-[18%] h-44 w-44 rounded-full border border-white/10' />
  </div>
)

const AtlasAnimator = ({ reducedMotion }: { reducedMotion: boolean }) => {
  const { invalidate, gl } = useThree()
  const start = useRef<number | null>(null)

  useEffect(() => {
    gl.setClearColor(ATLAS_COLORS.sheet, 0)
    invalidate()
  }, [gl, invalidate])

  useFrame(({ clock }) => {
    if (reducedMotion) return
    start.current ??= clock.elapsedTime
    const elapsed = clock.elapsedTime - start.current
    if (elapsed < 4.6) invalidate()
  })

  return null
}

const AnimatedSheet = ({ spec, index, reducedMotion }: { spec: SheetSpec; index: number; reducedMotion: boolean }) => {
  const groupRef = useRef<Group>(null)
  const startPosition = useMemo<Vec3>(() => [spec.position[0] - 0.75 + index * 0.12, spec.position[1] + 0.55, spec.position[2] + 0.34], [index, spec.position])

  useEffect(() => {
    const group = groupRef.current
    if (!group) return
    const position = reducedMotion ? spec.position : startPosition
    group.position.set(...position)
    group.rotation.set(...spec.rotation)
  }, [reducedMotion, spec.position, spec.rotation, startPosition])

  useFrame((_, delta) => {
    const group = groupRef.current
    if (!group || reducedMotion) return
    easing.damp3(group.position, spec.position, 0.42, delta)
    easing.dampE(group.rotation, spec.rotation, 0.48, delta)
  })

  return (
    <group ref={groupRef}>
      <mesh renderOrder={index}>
        <boxGeometry args={spec.scale} />
        <meshStandardMaterial
          color={spec.color}
          transparent
          opacity={spec.opacity}
          roughness={0.72}
          metalness={0.02}
          depthWrite={false}
        />
      </mesh>
      <Line
        points={[
          [-spec.scale[0] / 2, spec.scale[1] + 0.004, -spec.scale[2] / 2],
          [spec.scale[0] / 2, spec.scale[1] + 0.004, -spec.scale[2] / 2],
          [spec.scale[0] / 2, spec.scale[1] + 0.004, spec.scale[2] / 2],
          [-spec.scale[0] / 2, spec.scale[1] + 0.004, spec.scale[2] / 2],
          [-spec.scale[0] / 2, spec.scale[1] + 0.004, -spec.scale[2] / 2],
        ]}
        color={ATLAS_COLORS.guideSoft}
        lineWidth={1.1}
      />
      <Line
        points={[
          [-spec.scale[0] * 0.34, spec.scale[1] + 0.007, -spec.scale[2] * 0.18],
          [-spec.scale[0] * 0.02, spec.scale[1] + 0.007, -spec.scale[2] * 0.18],
          [-spec.scale[0] * 0.02, spec.scale[1] + 0.007, spec.scale[2] * 0.16],
          [-spec.scale[0] * 0.34, spec.scale[1] + 0.007, spec.scale[2] * 0.16],
          [-spec.scale[0] * 0.34, spec.scale[1] + 0.007, -spec.scale[2] * 0.18],
        ]}
        color={ATLAS_COLORS.guide}
        lineWidth={0.7}
        transparent
        opacity={0.32}
      />
      <Line
        points={[
          [spec.scale[0] * 0.12, spec.scale[1] + 0.008, spec.scale[2] * 0.25],
          [spec.scale[0] * 0.42, spec.scale[1] + 0.008, spec.scale[2] * 0.25],
          [spec.scale[0] * 0.42, spec.scale[1] + 0.008, spec.scale[2] * 0.42],
          [spec.scale[0] * 0.12, spec.scale[1] + 0.008, spec.scale[2] * 0.42],
          [spec.scale[0] * 0.12, spec.scale[1] + 0.008, spec.scale[2] * 0.25],
        ]}
        color={ATLAS_COLORS.amber}
        lineWidth={0.58}
        transparent
        opacity={0.38}
      />
      <Line
        points={[
          [-spec.scale[0] * 0.4, spec.scale[1] + 0.009, -spec.scale[2] * 0.36],
          [spec.scale[0] * 0.35, spec.scale[1] + 0.009, -spec.scale[2] * 0.36],
        ]}
        color={ATLAS_COLORS.guideSoft}
        lineWidth={0.55}
        transparent
        opacity={0.42}
      />
    </group>
  )
}

const AnimatedNode = ({ node, reducedMotion }: { node: NodeSpec; reducedMotion: boolean }) => {
  const meshRef = useRef<Mesh>(null)

  useEffect(() => {
    const mesh = meshRef.current
    if (!mesh) return
    const position = reducedMotion ? node.end : node.start
    mesh.position.set(...position)
  }, [node.end, node.start, reducedMotion])

  useFrame((_, delta) => {
    const mesh = meshRef.current
    if (!mesh || reducedMotion) return
    easing.damp3(mesh.position, node.end, 0.5, delta)
  })

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[node.radius, 16, 16]} />
      <meshStandardMaterial color={node.color} roughness={0.58} metalness={0.02} />
    </mesh>
  )
}

const BlueprintField = () => {
  const gridLines = useMemo(() => {
    const lines: Vec3[][] = []
    for (let i = -3; i <= 3; i += 1) {
      lines.push([[-2.4, -0.44, i * 0.34], [2.4, -0.44, i * 0.34]])
      lines.push([[i * 0.34, -0.44, -1.28], [i * 0.34, -0.44, 1.28]])
    }
    return lines
  }, [])

  return (
    <group rotation={[-0.08, 0, 0]}>
      {gridLines.map((points, index) => (
        <Line key={index} points={points} color={ATLAS_COLORS.guideSoft} lineWidth={0.55} transparent opacity={0.5} />
      ))}
      <Line points={[[-1.9, -0.36, -0.92], [-0.78, 0.08, -0.48], [0.1, 0.4, -0.2], [0.94, 0.72, -0.46], [1.52, 1.02, -0.72]]} color={ATLAS_COLORS.guide} lineWidth={1.7} transparent opacity={0.72} />
    </group>
  )
}

const AtlasFieldScene = ({ reducedMotion }: { reducedMotion: boolean }) => (
  <>
    <AtlasAnimator reducedMotion={reducedMotion} />
    <PerspectiveCamera makeDefault position={[0.2, 1.34, 3.25]} fov={39} onUpdate={(camera) => camera.lookAt(0, 0.52, 0)} />
    <ambientLight intensity={1.15} />
    <directionalLight position={[3.2, 4.6, 4]} intensity={1.1} color={ATLAS_COLORS.sheet} />
    <directionalLight position={[-3.5, 2, -2]} intensity={0.34} color={ATLAS_COLORS.guide} />

    <group rotation={[0.04, -0.3, 0.02]} position={[0.02, -0.04, 0]} scale={1.34}>
      <BlueprintField />
      {SHEETS.map((spec, index) => (
        <AnimatedSheet key={index} spec={spec} index={index} reducedMotion={reducedMotion} />
      ))}
      {ROUTES.map(([from, to]) => (
        <Line
          key={`${from}-${to}`}
          points={[NODES[from].end, NODES[to].end]}
          color={ATLAS_COLORS.guide}
          lineWidth={0.8}
          transparent
          opacity={0.48}
        />
      ))}
      {NODES.map((node) => (
        <AnimatedNode key={node.id} node={node} reducedMotion={reducedMotion} />
      ))}
    </group>
  </>
)

const AtlasFieldCanvas = ({ reducedMotion }: { reducedMotion: boolean }) => (
  <div
    className='absolute inset-[-8%] z-0 overflow-visible bg-transparent opacity-55 mix-blend-screen sm:opacity-70'
    role='img'
    aria-label='Decorative abstract architecture knowledge atlas: scattered topic nodes organize around floating blueprint sheets.'
  >
    <WebGLErrorBoundary fallback={<AtlasFallbackPoster />}>
      <Canvas
        frameloop='demand'
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
        fallback={<AtlasFallbackPoster />}
      >
        <AtlasFieldScene reducedMotion={reducedMotion} />
      </Canvas>
    </WebGLErrorBoundary>
  </div>
)

export const AtlasAtmosphere = () => {
  const reducedMotion = usePrefersReducedMotion()
  const webGLAvailable = useSafeWebGLStatus()

  return (
    <div
      className='pointer-events-none absolute inset-0 z-0 overflow-hidden'
      data-testid='atlas-atmosphere'
      aria-hidden='true'
    >
      <div className='absolute inset-0 bg-[radial-gradient(circle_at_68%_42%,rgba(93,136,255,0.18),transparent_32%),radial-gradient(circle_at_32%_70%,rgba(232,133,58,0.12),transparent_28%)]' />
      {webGLAvailable && !reducedMotion ? <AtlasFieldCanvas reducedMotion={false} /> : <AtlasFallbackPoster />}
    </div>
  )
}

export const AtlasFieldHero = AtlasAtmosphere
