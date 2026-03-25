// src/app/dashboard/3d-lab/_templates/CutawaySectionScene.tsx
import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { useModuleInvalidate } from '../_hooks/useModuleInvalidate'
import { GeometryElement } from '../_components/GeometryMesh'
import type { CutawaySectionConfig, GeometryInstruction } from '../_types/templates'
import type { ModuleStoreState } from '../_stores/createModuleStore'
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
        color="#D64545"
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

  useFrame(() => {
    if (matRef.current) {
      const current = matRef.current.opacity
      const next = THREE.MathUtils.lerp(current, targetOpacity, 0.15)
      if (Math.abs(next - current) > 0.001) {
        matRef.current.opacity = next
        matRef.current.needsUpdate = true
        invalidate()
      }
    }
    if (groupRef.current) {
      groupRef.current.visible = targetOpacity > 0.01 || (matRef.current?.opacity ?? 0) > 0.01
    }
  })

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

  return (
    <group scale={config.scale ?? 1}>
      {/* Layer meshes */}
      {layersWithOpacity.map(({ layer, opacity }) => (
        <LayerMesh key={layer.id} geometry={layer.geometry} targetOpacity={opacity} />
      ))}

      {/* Cut plane indicator */}
      <CutPlane cutPosition={cutPosition} cutAxis={cutAxis} />

      {/* Layer annotations */}
      {layersWithOpacity.map(({ layer, opacity }) => {
        if (opacity < 0.3) return null

        const pos = layer.geometry.position
        const annotationPos: [number, number, number] = [
          pos[0] + (layer.geometry.args?.[0] ?? 1) * 0.6 + 0.15,
          pos[1],
          pos[2],
        ]

        const isActive = activeAnnotation === layer.id

        return (
          <Html
            key={`ann-${layer.id}`}
            position={annotationPos}
            distanceFactor={6}
            occlude={false}
          >
            <div
              style={{ pointerEvents: 'none', opacity: Math.min(opacity, 1) }}
              className={`
                whitespace-nowrap rounded px-1.5 py-0.5 shadow-sm border
                ${isActive
                  ? 'bg-primary-50 border-primary/40'
                  : 'bg-white/90 backdrop-blur-sm border-zinc-200'
                }
              `}
            >
              <div className="text-[11px] font-bold text-zinc-700">
                {layer.label}
              </div>
              {layer.material && (
                <div className="text-[11px] text-zinc-500">
                  {layer.material}
                </div>
              )}
              {layer.codeCitation && (
                <div className="text-[11px] text-primary font-medium">
                  {layer.codeCitation}
                </div>
              )}
            </div>
          </Html>
        )
      })}
    </group>
  )
}
