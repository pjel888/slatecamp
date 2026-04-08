'use client'

// src/app/dashboard/3d-lab/_templates/FloorPlanScene.tsx
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import type { Group } from 'three'
import { useDisposeOnUnmount } from '@/components/r3f/useDisposeOnUnmount'
import { Line } from '@react-three/drei'
import { useModuleInvalidate } from '@/features/3d-lab/hooks/useModuleInvalidate'
import { useOverlayStore } from '@/features/3d-lab/stores/useOverlayStore'
import { SCENE_COLORS } from '@/features/3d-lab/constants/scene-colors'
import type { FloorPlanConfig } from '@/features/3d-lab/types/templates'
import type { ModuleStoreState } from '@/features/3d-lab/stores/createModuleStore'
import type { StoreApi, UseBoundStore } from 'zustand'
import type { Vector3Tuple } from 'three'

// ─── Helpers ────────────────────────────────────────────────────────────────

function midpoint(points: Array<[number, number]>): [number, number] {
  if (points.length < 2) return points[0] ?? [0, 0]
  const mid = Math.floor(points.length / 2)
  const a = points[mid - 1]
  const b = points[mid]
  return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]
}

function pathLength(points: Array<[number, number]>): number {
  let total = 0
  for (let i = 1; i < points.length; i++) {
    const dx = points[i][0] - points[i - 1][0]
    const dz = points[i][1] - points[i - 1][1]
    total += Math.sqrt(dx * dx + dz * dz)
  }
  return total
}

// ─── Room Plane ─────────────────────────────────────────────────────────────

function RoomPlane({
  bounds,
  color,
  opacity,
  label,
  roomId,
}: {
  bounds: [number, number, number, number]
  color: string
  opacity: number
  label?: string
  roomId: string
}) {
  const [x, z, w, d] = bounds
  const cx = x + w / 2
  const cz = z + d / 2
  const upsertItem = useOverlayStore((s) => s.upsertItem)
  const removeItem = useOverlayStore((s) => s.removeItem)

  const overlayId = `floorplan-room-${roomId}`
  useEffect(() => {
    if (label) {
      upsertItem({
        id: overlayId,
        worldPosition: new THREE.Vector3(cx, 0.02, cz),
        type: 'label',
        payload: { text: label },
        visible: true,
      })
    }
    return () => removeItem(overlayId)
  }, [label, cx, cz, upsertItem, removeItem, overlayId])

  return (
    <mesh position={[cx, 0.001, cz]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[w, d]} />
      <meshStandardMaterial
        color={color}
        opacity={opacity}
        transparent={opacity < 1}
      />
    </mesh>
  )
}

// ─── Path Line ──────────────────────────────────────────────────────────────

function PathLine({
  points,
  color,
  width,
  label,
  actualDistance,
  maxDistance,
  pathId,
}: {
  points: Array<[number, number]>
  color: string
  width: number
  label?: string
  actualDistance?: number
  maxDistance?: number
  pathId: string
}) {
  const points3D = useMemo<Vector3Tuple[]>(
    () => points.map(([x, z]) => [x, 0.01, z]),
    [points]
  )

  const isViolation =
    actualDistance !== undefined &&
    maxDistance !== undefined &&
    actualDistance > maxDistance

  const lineColor = isViolation ? SCENE_COLORS.buildingViolation : color

  const mid = midpoint(points)
  const upsertItem = useOverlayStore((s) => s.upsertItem)
  const removeItem = useOverlayStore((s) => s.removeItem)

  const overlayId = `floorplan-path-${pathId}`
  useEffect(() => {
    if (actualDistance !== undefined && maxDistance !== undefined) {
      upsertItem({
        id: overlayId,
        worldPosition: new THREE.Vector3(mid[0], 0.05, mid[1]),
        type: 'dimension',
        payload: {
          value: actualDistance,
          unit: 'm',
          label: `max ${maxDistance}m`,
          isViolating: isViolation,
        },
        visible: true,
      })
    } else if (label) {
      upsertItem({
        id: overlayId,
        worldPosition: new THREE.Vector3(mid[0], 0.05, mid[1]),
        type: 'label',
        payload: { text: label },
        visible: true,
      })
    }
    return () => removeItem(overlayId)
  }, [actualDistance, maxDistance, label, mid, isViolation, upsertItem, removeItem, overlayId])

  return (
    <Line
      points={points3D}
      color={lineColor}
      lineWidth={width}
    />
  )
}

// ─── Fixture ────────────────────────────────────────────────────────────────

function Fixture({
  type,
  position,
  color,
  label,
  coverageRadius,
  fixtureId,
}: {
  type: string
  position: [number, number]
  color: string
  label?: string
  coverageRadius?: number
  fixtureId: string
}) {
  const [x, z] = position
  const upsertItem = useOverlayStore((s) => s.upsertItem)
  const removeItem = useOverlayStore((s) => s.removeItem)

  const overlayId = `floorplan-fixture-${fixtureId}`
  useEffect(() => {
    if (label) {
      upsertItem({
        id: overlayId,
        worldPosition: new THREE.Vector3(x, 0.1, z),
        type: 'label',
        payload: { text: label },
        visible: true,
      })
    }
    return () => removeItem(overlayId)
  }, [label, x, z, upsertItem, removeItem, overlayId])

  return (
    <group>
      {type === 'exit' && (
        <mesh position={[x, 0.025, z]}>
          <boxGeometry args={[0.5, 0.05, 0.3]} />
          <meshStandardMaterial color={color || SCENE_COLORS.fixtureExit} />
        </mesh>
      )}

      {type === 'sprinkler' && (
        <>
          <mesh position={[x, 0.005, z]}>
            <cylinderGeometry args={[0.1, 0.1, 0.01, 16]} />
            <meshStandardMaterial color={color || SCENE_COLORS.fixtureSprinkler} />
          </mesh>
          {coverageRadius && (
            <mesh position={[x, 0.002, z]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[coverageRadius - 0.05, coverageRadius, 32]} />
              <meshStandardMaterial
                color={color || SCENE_COLORS.fixtureSprinkler}
                opacity={0.15}
                transparent
              />
            </mesh>
          )}
        </>
      )}

      {type !== 'exit' && type !== 'sprinkler' && (
        <mesh position={[x, 0.015, z]}>
          <boxGeometry args={[0.3, 0.03, 0.3]} />
          <meshStandardMaterial color={color || SCENE_COLORS.fixtureDefault} />
        </mesh>
      )}
    </group>
  )
}

// ─── Dead-End Zone Highlight ────────────────────────────────────────────────

function DeadEndZone({
  bounds,
}: {
  bounds: [number, number, number, number]
}) {
  const [x, z, w, d] = bounds
  const cx = x + w / 2
  const cz = z + d / 2

  return (
    <mesh position={[cx, 0.003, cz]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[w, d]} />
      <meshStandardMaterial color={SCENE_COLORS.deadEndZone} opacity={0.25} transparent />
    </mesh>
  )
}

// ─── Main Scene ─────────────────────────────────────────────────────────────

interface FloorPlanSceneProps {
  config: FloorPlanConfig
  useStore: UseBoundStore<StoreApi<ModuleStoreState>>
  /** Optional: compute dynamic path colors based on params */
  computePathCompliance?: (
    path: { id: string; points: Array<[number, number]> },
    params: Record<string, number | boolean | string>
  ) => { actualDistance: number; maxDistance: number } | null
  /** Optional: bounds of dead-end zones that are in violation */
  deadEndZones?: Array<[number, number, number, number]>
  /** Optional: coverage radius for sprinkler fixtures */
  sprinklerRadius?: number
}

export function FloorPlanScene({
  config,
  useStore,
  computePathCompliance,
  deadEndZones,
  sprinklerRadius,
}: FloorPlanSceneProps) {
  const groupRef = useRef<Group>(null)
  useDisposeOnUnmount(groupRef)

  // Register invalidate bridge
  useModuleInvalidate(useStore)

  const params = useStore((s) => s.params)
  const [planW, planD] = config.planSize ?? [30, 20]

  // Compute active violations
  const activeViolations = useMemo(
    () => (config.violations ?? []).filter((v) => v.check(params)),
    [config.violations, params]
  )

  // Compute visible annotations
  const visibleAnnotations = useMemo(
    () =>
      (config.annotations ?? []).filter(
        (a) => !a.visibleWhen || a.visibleWhen(params)
      ),
    [config.annotations, params]
  )

  // Filter fixtures based on sprinkler toggle
  const visibleFixtures = useMemo(
    () =>
      (config.fixtures ?? []).filter((f) => {
        if (f.type === 'sprinkler' && params.sprinklered === false) return false
        return true
      }),
    [config.fixtures, params]
  )

  // Emit overlay items for violations and annotations
  const upsertItem = useOverlayStore((s) => s.upsertItem)
  const removeItem = useOverlayStore((s) => s.removeItem)

  useEffect(() => {
    const ids: string[] = []

    // Violation overlays
    activeViolations.forEach((v) => {
      const id = `floorplan-violation-${v.id}`
      ids.push(id)
      const pos = v.position?.(params) ?? [planW / 2, 1, planD / 2]
      upsertItem({
        id,
        worldPosition: new THREE.Vector3(pos[0], pos[1], pos[2]),
        type: 'violation',
        payload: {
          law: v.codeCitation ?? '',
          section: v.codeCitation ?? '',
          message: v.message,
          severity: 'error',
        },
        visible: true,
      })
    })

    // Annotation overlays
    visibleAnnotations.forEach((a) => {
      const id = `floorplan-annotation-${a.id}`
      ids.push(id)
      const pos = a.position(params)
      upsertItem({
        id,
        worldPosition: new THREE.Vector3(pos[0], pos[1], pos[2]),
        type: 'label',
        payload: {
          text: a.label,
          codeRef: a.codeCitation,
        },
        visible: true,
      })
    })

    return () => ids.forEach((id) => removeItem(id))
  }, [activeViolations, visibleAnnotations, params, planW, planD, upsertItem, removeItem])

  return (
    <group ref={groupRef} scale={config.scale ?? 1}>
      {/* Floor plan base plane */}
      <mesh
        position={[planW / 2, 0, planD / 2]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[planW, planD]} />
        <meshStandardMaterial color={SCENE_COLORS.groundFloorPlan} />
      </mesh>

      {/* Room planes */}
      {config.rooms.map((room) => (
        <RoomPlane
          key={room.id}
          roomId={room.id}
          bounds={room.bounds}
          color={room.color}
          opacity={room.opacity ?? 0.6}
          label={room.label}
        />
      ))}

      {/* Dead-end zones */}
      {(deadEndZones ?? []).map((bounds, i) => (
        <DeadEndZone key={`deadend-${i}`} bounds={bounds} />
      ))}

      {/* Path lines */}
      {(config.paths ?? []).map((path) => {
        const compliance = computePathCompliance?.(path, params)
        return (
          <PathLine
            key={path.id}
            pathId={path.id}
            points={path.points}
            color={path.color}
            width={path.width ?? 2}
            label={path.label}
            actualDistance={compliance?.actualDistance ?? pathLength(path.points)}
            maxDistance={compliance?.maxDistance}
          />
        )
      })}

      {/* Fixtures */}
      {visibleFixtures.map((fixture) => (
        <Fixture
          key={fixture.id}
          fixtureId={fixture.id}
          type={fixture.type}
          position={fixture.position}
          color={fixture.color ?? SCENE_COLORS.fixtureDefault}
          label={fixture.label}
          coverageRadius={
            fixture.type === 'sprinkler' ? sprinklerRadius : undefined
          }
        />
      ))}
    </group>
  )
}
