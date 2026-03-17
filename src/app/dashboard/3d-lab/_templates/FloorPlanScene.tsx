'use client'

// src/app/dashboard/3d-lab/_templates/FloorPlanScene.tsx
import { useMemo } from 'react'
import { Line, Html } from '@react-three/drei'
import { Warning } from '@phosphor-icons/react'
import { SCIcon } from '@/components/graphics/icons/Icon'
import { useModuleInvalidate } from '../_hooks/useModuleInvalidate'
import type { FloorPlanConfig } from '../_types/templates'
import type { ModuleStoreState } from '../_stores/createModuleStore'
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
}: {
  bounds: [number, number, number, number]
  color: string
  opacity: number
  label?: string
}) {
  const [x, z, w, d] = bounds
  const cx = x + w / 2
  const cz = z + d / 2

  return (
    <group>
      <mesh position={[cx, 0.001, cz]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[w, d]} />
        <meshStandardMaterial
          color={color}
          opacity={opacity}
          transparent={opacity < 1}
        />
      </mesh>
      {label && (
        <Html position={[cx, 0.02, cz]} center>
          <div
            style={{ pointerEvents: 'none' }}
            className="text-[11px] font-bold text-zinc-600 whitespace-nowrap"
          >
            {label}
          </div>
        </Html>
      )}
    </group>
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
}: {
  points: Array<[number, number]>
  color: string
  width: number
  label?: string
  actualDistance?: number
  maxDistance?: number
}) {
  const points3D = useMemo<Vector3Tuple[]>(
    () => points.map(([x, z]) => [x, 0.01, z]),
    [points]
  )

  const isViolation =
    actualDistance !== undefined &&
    maxDistance !== undefined &&
    actualDistance > maxDistance

  const lineColor = isViolation ? '#D64545' : color

  const mid = midpoint(points)

  return (
    <group>
      <Line
        points={points3D}
        color={lineColor}
        lineWidth={width}
      />
      {actualDistance !== undefined && maxDistance !== undefined && (
        <Html position={[mid[0], 0.05, mid[1]]} center>
          <div
            style={{ pointerEvents: 'none' }}
            className={`text-[11px] font-bold whitespace-nowrap px-1 py-0.5 rounded ${
              isViolation
                ? 'bg-red-100 text-red-700 border border-red-300'
                : 'bg-green-100 text-green-700 border border-green-300'
            }`}
          >
            {actualDistance.toFixed(1)}m / max {maxDistance}m
          </div>
        </Html>
      )}
      {label && actualDistance === undefined && (
        <Html position={[mid[0], 0.05, mid[1]]} center>
          <div
            style={{ pointerEvents: 'none' }}
            className="text-[11px] font-medium text-zinc-500 whitespace-nowrap"
          >
            {label}
          </div>
        </Html>
      )}
    </group>
  )
}

// ─── Fixture ────────────────────────────────────────────────────────────────

function Fixture({
  type,
  position,
  color,
  label,
  coverageRadius,
}: {
  type: string
  position: [number, number]
  color: string
  label?: string
  coverageRadius?: number
}) {
  const [x, z] = position

  return (
    <group>
      {type === 'exit' && (
        <mesh position={[x, 0.025, z]}>
          <boxGeometry args={[0.5, 0.05, 0.3]} />
          <meshStandardMaterial color={color || '#2D9F6F'} />
        </mesh>
      )}

      {type === 'sprinkler' && (
        <>
          <mesh position={[x, 0.005, z]}>
            <cylinderGeometry args={[0.1, 0.1, 0.01, 16]} />
            <meshStandardMaterial color={color || '#3B6B9C'} />
          </mesh>
          {coverageRadius && (
            <mesh position={[x, 0.002, z]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[coverageRadius - 0.05, coverageRadius, 32]} />
              <meshStandardMaterial
                color={color || '#3B6B9C'}
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
          <meshStandardMaterial color={color || '#71717a'} />
        </mesh>
      )}

      {label && (
        <Html position={[x, 0.1, z]} center>
          <div
            style={{ pointerEvents: 'none' }}
            className="text-[11px] font-bold text-zinc-500 whitespace-nowrap"
          >
            {label}
          </div>
        </Html>
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
      <meshStandardMaterial color="#D64545" opacity={0.25} transparent />
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

  return (
    <group scale={config.scale ?? 1}>
      {/* Floor plan base plane */}
      <mesh
        position={[planW / 2, 0, planD / 2]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[planW, planD]} />
        <meshStandardMaterial color="#e4e4e7" />
      </mesh>

      {/* Room planes */}
      {config.rooms.map((room) => (
        <RoomPlane
          key={room.id}
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
          type={fixture.type}
          position={fixture.position}
          color={fixture.color ?? '#71717a'}
          label={fixture.label}
          coverageRadius={
            fixture.type === 'sprinkler' ? sprinklerRadius : undefined
          }
        />
      ))}

      {/* Violation annotations */}
      {activeViolations.map((v) => {
        const pos = v.position?.(params) ?? [planW / 2, 1, planD / 2]
        return (
          <Html
            key={v.id}
            position={pos}
            distanceFactor={12}
            occlude={false}
          >
            <div
              style={{ pointerEvents: 'none' }}
              className="flex items-start gap-1 bg-red-50 border border-red-300 rounded px-1.5 py-1 shadow-sm whitespace-nowrap -translate-x-1/2"
            >
              <SCIcon icon={Warning} size="xs" className="text-red-600 shrink-0 mt-px" />
              <div>
                <div className="text-[11px] font-bold text-red-700">
                  {v.message}
                </div>
                {v.codeCitation && (
                  <div className="text-[11px] text-red-500">
                    {v.codeCitation}
                  </div>
                )}
              </div>
            </div>
          </Html>
        )
      })}

      {/* Static annotations */}
      {visibleAnnotations.map((a) => {
        const pos = a.position(params)
        return (
          <Html key={a.id} position={pos} distanceFactor={12} occlude={false}>
            <div
              style={{ pointerEvents: 'none' }}
              className="bg-white/90 backdrop-blur-sm border border-zinc-200 rounded px-1.5 py-0.5 shadow-sm whitespace-nowrap -translate-x-1/2"
            >
              <div className="text-[11px] font-bold text-zinc-700">
                {a.label}
              </div>
              {a.codeCitation && (
                <div className="text-[11px] text-zinc-400">
                  {a.codeCitation}
                </div>
              )}
            </div>
          </Html>
        )
      })}
    </group>
  )
}
