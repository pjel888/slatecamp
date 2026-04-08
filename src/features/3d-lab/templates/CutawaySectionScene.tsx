// src/app/dashboard/3d-lab/_templates/CutawaySectionScene.tsx
import { useEffect, useMemo, useRef } from 'react'
import { useDisposeOnUnmount } from '@/components/r3f/useDisposeOnUnmount'
import { useThree } from '@react-three/fiber'
import { useAnimationComplete } from '@/features/3d-lab/hooks/useAnimationComplete'
import * as THREE from 'three'
import { useModuleInvalidate } from '@/features/3d-lab/hooks/useModuleInvalidate'
import { GeometryElement } from '@/features/3d-lab/components/templates/GeometryMesh'
import { useOverlayStore } from '@/features/3d-lab/stores/useOverlayStore'
import { SCENE_COLORS } from '@/features/3d-lab/constants/scene-colors'
import type { CutawaySectionConfig, GeometryInstruction } from '@/features/3d-lab/types/templates'
import type { ModuleStoreState } from '@/features/3d-lab/stores/createModuleStore'
import type { StoreApi, UseBoundStore } from 'zustand'

// ─── Cut Plane Indicator ────────────────────────────────────────────────────

function CutPlane({
  cutPosition,
  cutAxis,
}: {
  cutPosition: number
  cutAxis: 'x' | 'y' | 'z'
}) {
  const position: [number, number, number] = [0, 0, 0]
  const rotation: [number, number, number] = [0, 0, 0]

  if (cutAxis === 'y') {
    position[1] = cutPosition
    // Plane faces along Y by default — rotate to be horizontal
    rotation[0] = -Math.PI / 2
  } else if (cutAxis === 'x') {
    position[0] = cutPosition
    rotation[1] = Math.PI / 2
  } else {
    position[2] = cutPosition
  }

  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={[3, 3]} />
      <meshBasicMaterial
        color={SCENE_COLORS.cutPlaneRed}
        transparent
        opacity={0.15}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  )
}

// ─── Layer Group (with fade transition) ─────────────────────────────────────

interface LayerMeshProps {
  geometry: GeometryInstruction
  targetOpacity: number
}

function LayerMesh({ geometry, targetOpacity }: LayerMeshProps) {
  const matRef = useRef<THREE.MeshStandardMaterial>(null)
  const groupRef = useRef<THREE.Group>(null)
  const { invalidate } = useThree()

  useAnimationComplete(
    () => {
      if (matRef.current) {
        const current = matRef.current.opacity
        const next = THREE.MathUtils.lerp(current, targetOpacity, 0.15)
        if (Math.abs(next - current) > 0.001) {
          matRef.current.opacity = next
          invalidate()
        }
      }
      if (groupRef.current) {
        groupRef.current.visible = targetOpacity > 0.01 || (matRef.current?.opacity ?? 0) > 0.01
      }
    },
    () => !matRef.current || Math.abs(matRef.current.opacity - targetOpacity) <= 0.001,
  )

  return (
    <group ref={groupRef}>
      <mesh
        position={geometry.position}
        rotation={geometry.rotation ?? [0, 0, 0]}
        scale={geometry.scale ?? [1, 1, 1]}
      >
        <GeometryElement inst={geometry} />
        <meshStandardMaterial
          ref={matRef}
          color={geometry.color}
          transparent
          opacity={targetOpacity}
          depthWrite={targetOpacity > 0.5}
        />
      </mesh>
    </group>
  )
}

// ─── Main Scene Renderer ────────────────────────────────────────────────────

interface CutawaySectionSceneProps {
  config: CutawaySectionConfig
  useStore: UseBoundStore<StoreApi<ModuleStoreState>>
}

/** Fade zone width — layers within this distance of the cut start fading */
const FADE_ZONE = 0.08

export function CutawaySectionScene({ config, useStore }: CutawaySectionSceneProps) {
  const groupRef = useRef<THREE.Group>(null)
  useDisposeOnUnmount(groupRef)

  useModuleInvalidate(useStore)

  const params = useStore((s) => s.params)
  const activeAnnotation = useStore((s) => s.activeAnnotation)
  const cutPosition = typeof params.cutPosition === 'number' ? params.cutPosition : 1
  const cutAxis = config.cutAxis ?? 'y'

  const layersWithOpacity = useMemo(() => {
    return config.layers.map((layer) => {
      const layerTop = layer.depth + (layer.geometry.args?.[1] ?? 0)
      if (layerTop <= cutPosition) {
        return { layer, opacity: 1 }
      }
      if (layer.depth >= cutPosition) {
        return { layer, opacity: 0 }
      }
      // Partial fade
      const t = Math.max(0, Math.min(1, (cutPosition - layer.depth) / FADE_ZONE))
      return { layer, opacity: t }
    })
  }, [config.layers, cutPosition])

  // Emit overlay items for layer annotations
  const upsertItem = useOverlayStore((s) => s.upsertItem)
  const removeItem = useOverlayStore((s) => s.removeItem)

  useEffect(() => {
    const ids: string[] = []
    layersWithOpacity.forEach(({ layer, opacity }) => {
      const overlayId = `cutaway-layer-${layer.id}`
      ids.push(overlayId)
      if (opacity < 0.3) {
        removeItem(overlayId)
        return
      }
      const pos = layer.geometry.position
      const annotationPos = new THREE.Vector3(
        pos[0] + (layer.geometry.args?.[0] ?? 1) * 0.6 + 0.15,
        pos[1],
        pos[2],
      )
      upsertItem({
        id: overlayId,
        worldPosition: annotationPos,
        type: 'label',
        payload: {
          text: layer.label,
          subtext: layer.material,
          codeRef: layer.codeCitation,
        },
        visible: true,
      })
    })
    return () => ids.forEach((id) => removeItem(id))
  }, [layersWithOpacity, upsertItem, removeItem])

  // Suppress unused variable warning — activeAnnotation is subscribed for reactivity
  void activeAnnotation

  return (
    <group ref={groupRef} scale={config.scale ?? 1}>
      {/* Layer meshes */}
      {layersWithOpacity.map(({ layer, opacity }) => (
        <LayerMesh key={layer.id} geometry={layer.geometry} targetOpacity={opacity} />
      ))}

      {/* Cut plane indicator */}
      <CutPlane cutPosition={cutPosition} cutAxis={cutAxis} />
    </group>
  )
}
