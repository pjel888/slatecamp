// src/app/dashboard/3d-lab/_templates/ExplodedAssemblyScene.tsx
import { useRef, useState, useCallback, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { useModuleInvalidate } from '../_hooks/useModuleInvalidate'
import { GeometryElement } from '../_components/GeometryMesh'
import type { ExplodedAssemblyConfig, AssemblyPart } from '../_types/templates'
import type { ModuleStoreState } from '../_stores/createModuleStore'
import type { StoreApi, UseBoundStore } from 'zustand'
import type { Group } from 'three'
import { MathUtils } from 'three'

// ─── Single Assembly Part ───────────────────────────────────────────────────

interface PartMeshProps {
  part: AssemblyPart
  explodeValue: number
  isActive: boolean
  isFaded: boolean
  onPartClick: (id: string) => void
}

function PartMesh({ part, explodeValue, isActive, isFaded, onPartClick }: PartMeshProps) {
  const meshRef = useRef<Group>(null)
  const [hovered, setHovered] = useState(false)
  const { invalidate } = useThree()

  // Compute target position: base position + explodeOffset * explodeValue
  const basePos = part.geometry.position
  const targetX = basePos[0] + part.explodeOffset[0] * explodeValue
  const targetY = basePos[1] + part.explodeOffset[1] * explodeValue
  const targetZ = basePos[2] + part.explodeOffset[2] * explodeValue

  useFrame(() => {
    if (!meshRef.current) return
    const pos = meshRef.current.position
    const needsUpdate =
      Math.abs(pos.x - targetX) > 0.001 ||
      Math.abs(pos.y - targetY) > 0.001 ||
      Math.abs(pos.z - targetZ) > 0.001

    if (needsUpdate) {
      pos.x = MathUtils.lerp(pos.x, targetX, 0.12)
      pos.y = MathUtils.lerp(pos.y, targetY, 0.12)
      pos.z = MathUtils.lerp(pos.z, targetZ, 0.12)
      invalidate()
    }
  })

  const opacity = isFaded ? 0.2 : (part.geometry.opacity ?? 1)
  const emissive = isActive ? '#3b82f6' : hovered ? '#3b82f6' : '#000000'
  const emissiveIntensity = isActive ? 0.4 : hovered ? 0.22 : 0

  const handlePointerEnter = useCallback(() => {
    setHovered(true)
    invalidate()
  }, [invalidate])

  const handlePointerLeave = useCallback(() => {
    setHovered(false)
    invalidate()
  }, [invalidate])

  const handleClick = useCallback(() => {
    onPartClick(part.id)
  }, [onPartClick, part.id])

  const geo = part.geometry

  return (
    <group
      ref={meshRef}
      position={[basePos[0], basePos[1], basePos[2]]}
    >
      <mesh
        rotation={geo.rotation ?? [0, 0, 0]}
        scale={geo.scale ?? [1, 1, 1]}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onClick={handleClick}
      >
        <GeometryElement inst={geo} />
        <meshStandardMaterial
          color={geo.color}
          opacity={opacity}
          transparent={opacity < 1}
          emissive={emissive}
          emissiveIntensity={emissiveIntensity}
          roughness={0.75}
          metalness={0.0}
        />
      </mesh>

      {/* Active part annotation */}
      {isActive && (
        <Html distanceFactor={8} occlude={false} center>
          <div
            style={{ pointerEvents: 'none' }}
            className="w-52 bg-white/95 backdrop-blur-sm border border-border rounded-md shadow-lg p-2.5 -translate-y-full"
          >
            <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-0.5">
              Part
            </div>
            <h4 className="text-xs font-bold text-zinc-900 leading-snug mb-1">
              {part.label}
            </h4>
            {part.description && (
              <p className="text-[10px] text-zinc-500 leading-relaxed mb-1.5">
                {part.description}
              </p>
            )}
            {part.codeCitation && (
              <div className="text-[9px] text-zinc-400 mb-1">
                {part.codeCitation}
              </div>
            )}
          </div>
        </Html>
      )}
    </group>
  )
}

// ─── Single Assembly Group ──────────────────────────────────────────────────

interface AssemblyGroupProps {
  parts: AssemblyPart[]
  explodeValue: number
  activePartId: string | null
  onPartClick: (id: string) => void
  offsetX?: number
  label?: string
}

function AssemblyGroup({
  parts,
  explodeValue,
  activePartId,
  onPartClick,
  offsetX = 0,
  label,
}: AssemblyGroupProps) {
  return (
    <group position={[offsetX, 0, 0]}>
      {parts.map((part) => (
        <PartMesh
          key={part.id}
          part={part}
          explodeValue={explodeValue}
          isActive={activePartId === part.id}
          isFaded={activePartId !== null && activePartId !== part.id}
          onPartClick={onPartClick}
        />
      ))}
      {label && (
        <Html position={[0, -0.15, 0]} distanceFactor={8} occlude={false} center>
          <div
            style={{ pointerEvents: 'none' }}
            className="px-2 py-0.5 bg-white/90 backdrop-blur-sm border border-zinc-200 rounded shadow-sm whitespace-nowrap"
          >
            <span className="text-[9px] font-bold text-zinc-700 uppercase tracking-wide">
              {label}
            </span>
          </div>
        </Html>
      )}
    </group>
  )
}

// ─── Main Scene Renderer ────────────────────────────────────────────────────

interface ExplodedAssemblySceneProps {
  config: ExplodedAssemblyConfig
  useStore: UseBoundStore<StoreApi<ModuleStoreState>>
}

export function ExplodedAssemblyScene({
  config,
  useStore,
}: ExplodedAssemblySceneProps) {
  // Register invalidate bridge
  useModuleInvalidate(useStore)

  const explodeValue = useStore((s) => (s.params.explode as number) ?? 0)
  const activePartId = useStore((s) => s.activeAnnotation)
  const setActiveAnnotation = useStore((s) => s.setActiveAnnotation)

  const handlePartClick = useCallback(
    (id: string) => {
      setActiveAnnotation(activePartId === id ? null : id)
    },
    [activePartId, setActiveAnnotation],
  )

  // Group parts for comparison mode using the explicit `group` field on each part.
  // Falls back to ID prefix parsing only if no group is set (legacy safety).
  const orderGroups = useMemo(() => {
    if (!config.comparisonMode) return []
    const groups = new Map<string, { parts: AssemblyPart[]; label: string }>()
    for (const part of config.parts) {
      const groupKey = part.group ?? (() => {
        const dashIdx = part.id.indexOf('-')
        return dashIdx > 0 ? part.id.slice(0, dashIdx) : part.id
      })()
      if (!groups.has(groupKey)) {
        const label = groupKey.charAt(0).toUpperCase() + groupKey.slice(1)
        groups.set(groupKey, { parts: [], label })
      }
      groups.get(groupKey)!.parts.push(part)
    }
    return Array.from(groups.values())
  }, [config.comparisonMode, config.parts])

  // Comparison mode: render multiple assemblies side-by-side
  if (config.comparisonMode) {
    const totalOrders = orderGroups.length
    const spacing = 2.5
    const startX = -((totalOrders - 1) * spacing) / 2

    return (
      <group scale={config.scale ?? 1}>
        {/* Ground plane */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.005, 0]} receiveShadow>
          <planeGeometry args={[totalOrders * spacing + 2, 4]} />
          <meshStandardMaterial color="#f1f5f9" roughness={0.9} />
        </mesh>

        {orderGroups.map((group, i) => (
          <AssemblyGroup
            key={group.label}
            parts={group.parts}
            explodeValue={explodeValue}
            activePartId={activePartId}
            onPartClick={handlePartClick}
            offsetX={startX + i * spacing}
            label={group.label}
          />
        ))}
      </group>
    )
  }

  // Standard single-assembly mode
  return (
    <group scale={config.scale ?? 1}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.005, 0]} receiveShadow>
        <planeGeometry args={[5, 5]} />
        <meshStandardMaterial color="#f1f5f9" roughness={0.9} />
      </mesh>

      {config.parts.map((part) => (
        <PartMesh
          key={part.id}
          part={part}
          explodeValue={explodeValue}
          isActive={activePartId === part.id}
          isFaded={activePartId !== null && activePartId !== part.id}
          onPartClick={handlePartClick}
        />
      ))}
    </group>
  )
}
