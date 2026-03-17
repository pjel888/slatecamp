// src/app/dashboard/3d-lab/_templates/AnimatedSequenceScene.tsx
import { useRef, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { useModuleInvalidate } from '../_hooks/useModuleInvalidate'
import type { AnimatedSequenceConfig, GeometryInstruction } from '../_types/templates'
import type { ModuleStoreState } from '../_stores/createModuleStore'
import type { StoreApi, UseBoundStore } from 'zustand'
import type { Mesh, MeshStandardMaterial } from 'three'
import { MathUtils } from 'three'

// ─── Geometry Renderer ──────────────────────────────────────────────────────

function GeometryElement({ inst }: { inst: GeometryInstruction }) {
  const geometryEl = useMemo(() => {
    switch (inst.type) {
      case 'box':
        return <boxGeometry args={inst.args as [number, number, number]} />
      case 'cylinder':
        return <cylinderGeometry args={inst.args as [number, number, number, number]} />
      case 'ring':
        return <ringGeometry args={inst.args as [number, number, number]} />
      case 'sphere':
        return <sphereGeometry args={inst.args as [number, number, number]} />
      case 'cone':
        return <coneGeometry args={inst.args as [number, number, number]} />
      case 'plane':
        return <planeGeometry args={inst.args as [number, number]} />
      default:
        return <boxGeometry args={[0.1, 0.1, 0.1]} />
    }
  }, [inst.type, inst.args])

  return geometryEl
}

// ─── Fading Geometry Mesh ───────────────────────────────────────────────────

interface FadingMeshProps {
  inst: GeometryInstruction
  isCurrent: boolean
  fadeDurationMs: number
}

function FadingMesh({ inst, isCurrent, fadeDurationMs }: FadingMeshProps) {
  const meshRef = useRef<Mesh>(null)
  const opacityRef = useRef(isCurrent ? 0 : (inst.opacity ?? 1))
  const targetOpacity = inst.opacity ?? 1
  const { invalidate } = useThree()

  // Speed: how fast we approach target opacity per second
  const fadeSpeed = fadeDurationMs > 0 ? 1000 / fadeDurationMs : 10

  useFrame((_, delta) => {
    if (!meshRef.current) return

    const mat = meshRef.current.material as MeshStandardMaterial
    if (!mat) return

    if (isCurrent) {
      // Fade in towards target
      if (Math.abs(opacityRef.current - targetOpacity) > 0.005) {
        opacityRef.current = MathUtils.lerp(
          opacityRef.current,
          targetOpacity,
          Math.min(delta * fadeSpeed * 3, 1),
        )
        mat.opacity = opacityRef.current
        mat.transparent = true
        invalidate()
      } else if (opacityRef.current !== targetOpacity) {
        opacityRef.current = targetOpacity
        mat.opacity = targetOpacity
        mat.transparent = targetOpacity < 1
        invalidate()
      }
    } else {
      // Already visible — snap to target
      if (opacityRef.current !== targetOpacity) {
        opacityRef.current = targetOpacity
        mat.opacity = targetOpacity
        mat.transparent = targetOpacity < 1
        invalidate()
      }
    }
  })

  return (
    <mesh
      ref={meshRef}
      position={inst.position}
      rotation={inst.rotation ?? [0, 0, 0]}
      scale={inst.scale ?? [1, 1, 1]}
    >
      <GeometryElement inst={inst} />
      <meshStandardMaterial
        color={inst.color}
        opacity={isCurrent ? 0 : targetOpacity}
        transparent
        roughness={0.75}
        metalness={0.0}
      />
      {inst.label && (
        <Html distanceFactor={8} occlude={false} center>
          <div
            style={{ pointerEvents: 'none' }}
            className="px-1.5 py-0.5 bg-white/90 backdrop-blur-sm border border-zinc-200 rounded shadow-sm whitespace-nowrap"
          >
            <span className="text-[9px] font-bold text-zinc-700">
              {inst.label}
            </span>
          </div>
        </Html>
      )}
    </mesh>
  )
}

// ─── Step Group ─────────────────────────────────────────────────────────────

interface StepGroupProps {
  geometries: GeometryInstruction[]
  isCurrent: boolean
  fadeDurationMs: number
}

function StepGroup({ geometries, isCurrent, fadeDurationMs }: StepGroupProps) {
  return (
    <group>
      {geometries.map((inst) => (
        <FadingMesh
          key={inst.id}
          inst={inst}
          isCurrent={isCurrent}
          fadeDurationMs={fadeDurationMs}
        />
      ))}
    </group>
  )
}

// ─── Main Scene ─────────────────────────────────────────────────────────────

interface AnimatedSequenceSceneProps {
  config: AnimatedSequenceConfig
  useStore: UseBoundStore<StoreApi<ModuleStoreState>>
}

export function AnimatedSequenceScene({
  config,
  useStore,
}: AnimatedSequenceSceneProps) {
  useModuleInvalidate(useStore)

  const currentStep = useStore((s) => (s.params.currentStep as number) ?? 0)

  return (
    <group scale={config.scale ?? 1}>
      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.005, 0]} receiveShadow>
        <planeGeometry args={[12, 12]} />
        <meshStandardMaterial color="#f1f5f9" roughness={0.9} />
      </mesh>

      {config.steps.map((step, idx) => {
        if (idx > currentStep) return null
        return (
          <StepGroup
            key={step.id}
            geometries={step.geometry}
            isCurrent={idx === currentStep}
            fadeDurationMs={step.duration}
          />
        )
      })}
    </group>
  )
}
