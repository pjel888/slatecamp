// src/app/dashboard/3d-lab/_templates/AnimatedSequenceScene.tsx
import { useEffect, useRef } from 'react'
import { useDisposeOnUnmount } from '@/components/r3f/useDisposeOnUnmount'
import { useThree } from '@react-three/fiber'
import { useModuleInvalidate } from '@/features/3d-lab/hooks/useModuleInvalidate'
import { useAnimationComplete } from '@/features/3d-lab/hooks/useAnimationComplete'
import { GeometryElement } from '@/features/3d-lab/components/templates/GeometryMesh'
import { useOverlayStore } from '@/features/3d-lab/stores/useOverlayStore'
import { GroundPlane } from '@/features/3d-lab/components/rendering/GroundPlane'
import type { AnimatedSequenceConfig, GeometryInstruction } from '@/features/3d-lab/types/templates'
import type { ModuleStoreState } from '@/features/3d-lab/stores/createModuleStore'
import type { StoreApi, UseBoundStore } from 'zustand'
import type { Mesh, MeshStandardMaterial, Group } from 'three'
import { MathUtils, Vector3 } from 'three'

// ─── Fading Geometry Mesh ───────────────────────────────────────────────────

interface FadingMeshProps {
  inst: GeometryInstruction
  isCurrent: boolean
  fadeDurationMs: number
}

function FadingMesh({ inst, isCurrent, fadeDurationMs }: FadingMeshProps) {
  const meshRef = useRef<Mesh>(null)
  const matRef = useRef<MeshStandardMaterial>(null)
  const opacityRef = useRef(isCurrent ? 0 : (inst.opacity ?? 1))
  const targetOpacity = inst.opacity ?? 1
  const { invalidate } = useThree()
  const upsertItem = useOverlayStore((s) => s.upsertItem)
  const removeItem = useOverlayStore((s) => s.removeItem)

  // Speed: how fast we approach target opacity per second
  const fadeSpeed = fadeDurationMs > 0 ? 1000 / fadeDurationMs : 10

  useAnimationComplete(
    (_, delta) => {
      if (!meshRef.current || !matRef.current) return

      const mat = matRef.current

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
    },
    () => Math.abs(opacityRef.current - targetOpacity) <= 0.005,
  )

  // Emit overlay for label
  const overlayId = `animated-step-${inst.id}`
  useEffect(() => {
    if (inst.label) {
      const pos = inst.position
      upsertItem({
        id: overlayId,
        worldPosition: new Vector3(pos[0], pos[1], pos[2]),
        type: 'label',
        payload: { text: inst.label },
        visible: true,
      })
    }
    return () => removeItem(overlayId)
  }, [inst.label, inst.position, upsertItem, removeItem, overlayId])

  return (
    <mesh
      ref={meshRef}
      position={inst.position}
      rotation={inst.rotation ?? [0, 0, 0]}
      scale={inst.scale ?? [1, 1, 1]}
    >
      <GeometryElement inst={inst} />
      <meshStandardMaterial
        ref={matRef}
        color={inst.color}
        opacity={isCurrent ? 0 : targetOpacity}
        transparent
        roughness={0.75}
        metalness={0.0}
      />
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
  const groupRef = useRef<Group>(null)
  useDisposeOnUnmount(groupRef)

  useModuleInvalidate(useStore)

  const currentStep = useStore((s) => (s.params.currentStep as number) ?? 0)

  return (
    <group ref={groupRef} scale={config.scale ?? 1}>
      <GroundPlane size={[12, 12]} />

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
