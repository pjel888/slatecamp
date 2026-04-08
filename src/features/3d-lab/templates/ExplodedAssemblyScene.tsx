// src/app/dashboard/3d-lab/_templates/ExplodedAssemblyScene.tsx
import { useRef, useState, useCallback, useEffect, useMemo } from 'react'
import { useDisposeOnUnmount } from '@/components/r3f/useDisposeOnUnmount'
import { useFrame, useThree } from '@react-three/fiber'
import { useModuleInvalidate } from '@/features/3d-lab/hooks/useModuleInvalidate'
import { GeometryElement } from '@/features/3d-lab/components/templates/GeometryMesh'
import { useOverlayStore } from '@/features/3d-lab/stores/useOverlayStore'
import { GroundPlane } from '@/features/3d-lab/components/rendering/GroundPlane'
import { SCENE_COLORS } from '@/features/3d-lab/constants/scene-colors'
import type { ExplodedAssemblyConfig, AssemblyPart } from '@/features/3d-lab/types/templates'
import type { ModuleStoreState } from '@/features/3d-lab/stores/createModuleStore'
import type { StoreApi, UseBoundStore } from 'zustand'
import type { Group } from 'three'
import { MathUtils, Vector3 } from 'three'

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
  const upsertItem = useOverlayStore((s) => s.upsertItem)
  const removeItem = useOverlayStore((s) => s.removeItem)

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

  // Emit overlay for active part tooltip
  const overlayId = `exploded-part-${part.id}`
  useEffect(() => {
    if (isActive) {
      upsertItem({
        id: overlayId,
        worldPosition: new Vector3(targetX, targetY, targetZ),
        type: 'label',
        payload: {
          text: part.label,
          subtext: part.description,
          codeRef: part.codeCitation,
        },
        visible: true,
        zIndex: 20,
      })
    } else {
      removeItem(overlayId)
    }
    return () => removeItem(overlayId)
  }, [isActive, targetX, targetY, targetZ, part.label, part.description, part.codeCitation, upsertItem, removeItem, overlayId])

  const opacity = isFaded ? 0.2 : (part.geometry.opacity ?? 1)
  const emissive = isActive ? SCENE_COLORS.activeEmissive : hovered ? SCENE_COLORS.hoverEmissive : '#000000'
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
  const upsertItem = useOverlayStore((s) => s.upsertItem)
  const removeItem = useOverlayStore((s) => s.removeItem)

  const overlayId = `assembly-group-${label ?? 'default'}`
  useEffect(() => {
    if (label) {
      upsertItem({
        id: overlayId,
        worldPosition: new Vector3(offsetX, -0.15, 0),
        type: 'label',
        payload: { text: label },
        visible: true,
      })
    }
    return () => removeItem(overlayId)
  }, [label, offsetX, upsertItem, removeItem, overlayId])

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
  const groupRef = useRef<Group>(null)
  useDisposeOnUnmount(groupRef)

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
      <group ref={groupRef} scale={config.scale ?? 1}>
        <GroundPlane size={[totalOrders * spacing + 2, 4]} />

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
    <group ref={groupRef} scale={config.scale ?? 1}>
      <GroundPlane />

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
