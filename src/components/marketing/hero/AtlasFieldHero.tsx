'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Line, PerspectiveCamera } from '@react-three/drei'
import { easing } from 'maath'
import type { Group } from 'three'
import { WebGLErrorBoundary } from '@/components/r3f/WebGLErrorBoundary'
import { palette } from '@/components/graphics/tokens'

const ATLAS_COLORS = {
  sheet: palette.surfaceCard,
  sheetBlue: palette.surfaceFocused,
  guide: palette.surfaceCard,
  guideSoft: palette.surfaceCard,
  node: palette.surfaceCard,
  amber: palette.surfaceCard,
  emerald: palette.surfaceCard,
  ink: palette.surfaceCard,
  shadow: palette.surfaceCard,
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

const SHEET_THICKNESS = 0.012
const GHOST_OFFSETS: Vec3[] = [
  [-0.045, 0.014, 0.034],
  [0.052, -0.01, -0.04],
]

const BASE_SHEETS: SheetSpec[] = [
  { position: [-0.72, -0.03, 0.34], rotation: [-0.54, 0.16, -0.32], scale: [1.72, SHEET_THICKNESS, 1.02], color: ATLAS_COLORS.sheet, opacity: 0.25 },
  { position: [-0.54, 0.09, 0.2], rotation: [-0.53, 0.13, -0.26], scale: [2.14, SHEET_THICKNESS, 1.22], color: ATLAS_COLORS.sheet, opacity: 0.27 },
  { position: [-0.38, 0.2, 0.1], rotation: [-0.52, 0.1, -0.21], scale: [1.88, SHEET_THICKNESS, 1.08], color: ATLAS_COLORS.sheet, opacity: 0.24 },
  { position: [-0.2, 0.31, 0.02], rotation: [-0.51, 0.07, -0.15], scale: [2.06, SHEET_THICKNESS, 1.18], color: ATLAS_COLORS.sheet, opacity: 0.27 },
  { position: [-0.02, 0.42, -0.07], rotation: [-0.52, 0.05, -0.08], scale: [1.58, SHEET_THICKNESS, 0.94], color: ATLAS_COLORS.sheet, opacity: 0.23 },
  { position: [0.13, 0.54, -0.16], rotation: [-0.5, 0.03, -0.02], scale: [1.9, SHEET_THICKNESS, 1.08], color: ATLAS_COLORS.sheet, opacity: 0.25 },
  { position: [0.29, 0.66, -0.25], rotation: [-0.51, 0.01, 0.05], scale: [1.68, SHEET_THICKNESS, 0.98], color: ATLAS_COLORS.sheet, opacity: 0.23 },
  { position: [0.46, 0.78, -0.34], rotation: [-0.5, -0.02, 0.12], scale: [1.98, SHEET_THICKNESS, 1.1], color: ATLAS_COLORS.sheet, opacity: 0.24 },
  { position: [0.62, 0.9, -0.44], rotation: [-0.49, -0.04, 0.18], scale: [1.5, SHEET_THICKNESS, 0.86], color: ATLAS_COLORS.sheet, opacity: 0.22 },
  { position: [-0.58, 0.55, -0.38], rotation: [-0.56, 0.19, -0.12], scale: [1.28, SHEET_THICKNESS, 0.78], color: ATLAS_COLORS.sheet, opacity: 0.21 },
  { position: [0.12, 0.12, 0.4], rotation: [-0.48, -0.08, -0.2], scale: [1.36, SHEET_THICKNESS, 0.8], color: ATLAS_COLORS.sheet, opacity: 0.21 },
  { position: [0.78, 0.36, 0.06], rotation: [-0.5, -0.14, 0.1], scale: [1.44, SHEET_THICKNESS, 0.84], color: ATLAS_COLORS.sheet, opacity: 0.2 },
]

const lerp = (from: number, to: number, amount: number) => from + (to - from) * amount
const midpointVec = (from: Vec3, to: Vec3): Vec3 => [
  lerp(from[0], to[0], 0.5),
  lerp(from[1], to[1], 0.5),
  lerp(from[2], to[2], 0.5),
]

const createInBetweenSheet = (current: SheetSpec, next: SheetSpec, index: number): SheetSpec => ({
  position: midpointVec(current.position, next.position),
  rotation: [
    lerp(current.rotation[0], next.rotation[0], 0.5) + (index % 2 === 0 ? 0.006 : -0.006),
    lerp(current.rotation[1], next.rotation[1], 0.5) + (index % 3 === 0 ? -0.01 : 0.01),
    lerp(current.rotation[2], next.rotation[2], 0.5) + (index % 2 === 0 ? 0.012 : -0.012),
  ],
  scale: [
    lerp(current.scale[0], next.scale[0], 0.5) * 0.94,
    SHEET_THICKNESS,
    lerp(current.scale[2], next.scale[2], 0.5) * 0.94,
  ],
  color: ATLAS_COLORS.sheet,
  opacity: lerp(current.opacity, next.opacity, 0.5) * 0.82,
})

const SHEETS: SheetSpec[] = BASE_SHEETS.flatMap((sheet, index) => {
  const nextSheet = BASE_SHEETS[index + 1]
  return nextSheet ? [sheet, createInBetweenSheet(sheet, nextSheet, index)] : [sheet]
})

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
    <div className='absolute inset-[-12%] bg-[radial-gradient(circle_at_30%_22%,rgba(148,163,184,0.22),transparent_26%),radial-gradient(circle_at_76%_18%,rgba(100,116,139,0.14),transparent_24%),linear-gradient(135deg,rgba(255,255,255,0.08),transparent_52%)]' />
    <div className='absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.10)_1px,transparent_1px)] [background-size:34px_34px]' />
    <div className='absolute left-[10%] top-[22%] h-px w-[62%] rotate-[-8deg] bg-linear-to-r from-transparent via-camp-amber/40 to-transparent' />
    <div className='absolute right-[12%] top-[18%] h-44 w-44 rounded-full border border-white/10' />
  </div>
)

const AtlasAnimator = ({ reducedMotion }: { reducedMotion: boolean }) => {
  const { invalidate, gl } = useThree()

  useEffect(() => {
    gl.setClearColor(ATLAS_COLORS.sheet, 0)
    invalidate()
  }, [gl, invalidate])

  useFrame(() => {
    if (!reducedMotion) invalidate()
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

  useFrame(({ clock }, delta) => {
    const group = groupRef.current
    if (!group || reducedMotion) return

    const elapsed = clock.elapsedTime
    const phase = index * 1.37
    const targetRotation: Vec3 = [
      spec.rotation[0] + Math.sin(elapsed * (0.2 + index * 0.012) + phase) * 0.04,
      spec.rotation[1] + Math.sin(elapsed * (0.17 + index * 0.01) + phase * 0.72) * 0.062,
      spec.rotation[2] + Math.cos(elapsed * (0.16 + index * 0.008) + phase * 1.18) * 0.04,
    ]
    const targetPosition: Vec3 = [
      spec.position[0] + Math.sin(elapsed * 0.18 + phase) * 0.012,
      spec.position[1] + Math.cos(elapsed * 0.16 + phase * 0.8) * 0.01,
      spec.position[2] + Math.sin(elapsed * 0.14 + phase * 1.1) * 0.012,
    ]

    easing.damp3(group.position, targetPosition, 0.46, delta)
    easing.dampE(group.rotation, targetRotation, 0.72, delta)
  })

  return (
    <group ref={groupRef}>
      {GHOST_OFFSETS.map((offset, ghostIndex) => (
        <mesh key={ghostIndex} position={offset} renderOrder={index - ghostIndex - 1}>
          <boxGeometry args={spec.scale} />
          <meshBasicMaterial
            color={spec.color}
            transparent
            opacity={spec.opacity * (ghostIndex === 0 ? 0.28 : 0.18)}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      ))}
      <mesh renderOrder={index}>
        <boxGeometry args={spec.scale} />
        <meshBasicMaterial
          color={spec.color}
          transparent
          opacity={spec.opacity}
          depthWrite={false}
          toneMapped={false}
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
        lineWidth={0.82}
        transparent
        opacity={0.46}
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
        lineWidth={0.36}
        transparent
        opacity={0.22}
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
        lineWidth={0.32}
        transparent
        opacity={0.23}
      />
      <Line
        points={[
          [-spec.scale[0] * 0.4, spec.scale[1] + 0.009, -spec.scale[2] * 0.36],
          [spec.scale[0] * 0.35, spec.scale[1] + 0.009, -spec.scale[2] * 0.36],
        ]}
        color={ATLAS_COLORS.guideSoft}
        lineWidth={0.3}
        transparent
        opacity={0.24}
      />
    </group>
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
        <Line key={index} points={points} color={ATLAS_COLORS.guideSoft} lineWidth={0.92} transparent opacity={0.86} />
      ))}
      <Line points={[[-1.9, -0.36, -0.92], [-0.78, 0.08, -0.48], [0.1, 0.4, -0.2], [0.94, 0.72, -0.46], [1.52, 1.02, -0.72]]} color={ATLAS_COLORS.guide} lineWidth={2.35} transparent opacity={0.95} />
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
          lineWidth={0.96}
          transparent
          opacity={0.78}
        />
      ))}
    </group>
  </>
)

const AtlasFieldCanvas = ({ reducedMotion }: { reducedMotion: boolean }) => (
  <div
    className='absolute inset-[-8%] z-0 overflow-visible bg-transparent opacity-[0.58] sm:opacity-[0.68]'
    style={{
      maskImage: 'linear-gradient(to bottom, black 0%, rgba(0,0,0,0.9) 52%, rgba(0,0,0,0.48) 80%, transparent 100%)',
      WebkitMaskImage: 'linear-gradient(to bottom, black 0%, rgba(0,0,0,0.9) 52%, rgba(0,0,0,0.48) 80%, transparent 100%)',
    }}
    role='img'
    aria-label='Decorative abstract architecture knowledge atlas: faint blueprint sheets and guide lines float over a camp landscape.'
  >
    <WebGLErrorBoundary fallback={<AtlasFallbackPoster />}>
      <Canvas
        frameloop='always'
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
      <div className='absolute inset-0 bg-[radial-gradient(circle_at_68%_42%,rgba(148,163,184,0.18),transparent_32%),radial-gradient(circle_at_32%_70%,rgba(100,116,139,0.10),transparent_28%)]' />
      {webGLAvailable && !reducedMotion ? <AtlasFieldCanvas reducedMotion={false} /> : <AtlasFallbackPoster />}
    </div>
  )
}

export const AtlasFieldHero = AtlasAtmosphere
