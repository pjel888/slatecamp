'use client'

import { useRef, useEffect, useLayoutEffect } from 'react'
import { useDisposeOnUnmount } from '@/components/r3f/useDisposeOnUnmount'
import { useFrame, useThree } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { useLabStore } from '@/features/3d-lab/stores/legacyLabStore'
import { useInvalidateOnChange } from '@/features/3d-lab/hooks/useInvalidateOnChange'

// 1 Three.js unit = 12.5 metres
const SCALE = 0.08
const FLOOR_HEIGHT_M = 3
const LOT_Y = 0.005  // half-thickness of lot plate
const MAX_ZONE_FAR = 4.0

// Helpers for instancing to avoid per-frame allocations
const tempObject = new THREE.Object3D()

/** Lerp a value toward target. Returns true when settled (within epsilon). */
function lerp(current: number, target: number, factor: number, epsilon = 0.001): [number, boolean] {
  const next = current + (target - current) * factor
  return [Math.abs(next - target) < epsilon ? target : next, Math.abs(next - target) < epsilon]
}

function toU(meters: number) { return meters * SCALE }

function computeScene(lotArea: number, far: number, bhl: number, setbackFront: number, setbackSide: number) {
  const lotSideM = Math.sqrt(lotArea)

  const footprintSideM = Math.max(3, lotSideM - (setbackFront + setbackSide) * 2)
  const footprintAreaM2 = footprintSideM ** 2

  const maxFloorAreaM2 = lotArea * far
  const floors = Math.max(1, Math.round(maxFloorAreaM2 / footprintAreaM2))
  const buildingHeightM = floors * FLOOR_HEIGHT_M

  const isFARViolation = far > MAX_ZONE_FAR
  const isBHLViolation = buildingHeightM > bhl
  const isViolation = isFARViolation || isBHLViolation

  return {
    lotSideM,
    footprintSideM,
    buildingHeightM,
    floors,
    maxFloorAreaM2,
    isFARViolation,
    isBHLViolation,
    isViolation,
  }
}

/**
 * The FAR Calculator scene — all R3F geometry.
 * Optimized with InstancedMesh for floor plates, property lines, and setbacks.
 */
export function FARScene() {
  const groupRef = useRef<THREE.Group>(null)
  useDisposeOnUnmount(groupRef)

  useInvalidateOnChange()
  const { invalidate } = useThree()

  const buildingRef = useRef<THREE.Mesh>(null)
  const buildingMatRef = useRef<THREE.MeshStandardMaterial>(null)
  const instancedRef = useRef<THREE.InstancedMesh>(null)
  const propLinesRef = useRef<THREE.InstancedMesh>(null)
  const setbacksRef = useRef<THREE.InstancedMesh>(null)
  
  // Pre-allocated refs for performance
  const targetRef = useRef({ w: 0.001, h: 0.001, isViolation: false })
  const animRef = useRef({ w: 0.001, h: 0.001 })

  // Subscribe to store changes once on mount
  useEffect(() => {
    return useLabStore.subscribe((state) => {
      const s = computeScene(state.lotArea, state.far, state.bhl, state.setbackFront, state.setbackSide)
      targetRef.current.w = Math.max(0.001, toU(s.footprintSideM))
      targetRef.current.h = Math.max(0.001, toU(s.buildingHeightM))
      targetRef.current.isViolation = s.isViolation
    })
  }, [])

  // Static values for geometry layout (non-animated)
  const { lotArea, far, bhl, setbackFront, setbackSide } = useLabStore()
  const s = computeScene(lotArea, far, bhl, setbackFront, setbackSide)

  const lotU    = toU(s.lotSideM)
  const bhlU    = toU(bhl)
  const frontSbU = toU(setbackFront)
  const sideSbU  = toU(setbackSide)
  const bhlColor = s.isBHLViolation ? '#D64545' : '#2D9F6F'

  // Update instance matrices for floor plates, property lines, and setbacks
  useLayoutEffect(() => {
    if (!instancedRef.current || !propLinesRef.current || !setbacksRef.current) return
    
    // 1. Floor plates
    const bw = toU(s.footprintSideM)
    const count = Math.max(0, s.floors - 1)
    for (let i = 0; i < count; i++) {
      const floorY = LOT_Y * 2 + toU((i + 1) * FLOOR_HEIGHT_M)
      tempObject.position.set(0, floorY, 0)
      tempObject.scale.set(bw, 1, bw)
      tempObject.updateMatrix()
      instancedRef.current.setMatrixAt(i, tempObject.matrix)
    }
    instancedRef.current.count = count
    instancedRef.current.instanceMatrix.needsUpdate = true

    // 2. Property boundary lines (4 segments)
    const lu = toU(s.lotSideM)
    // FB segments
    for (let i = 0; i < 2; i++) {
      const dir = i === 0 ? 1 : -1
      tempObject.position.set(0, 0.003, dir * lu / 2)
      tempObject.scale.set(lu, 0.006, 0.008)
      tempObject.updateMatrix()
      propLinesRef.current.setMatrixAt(i, tempObject.matrix)
    }
    // LR segments
    for (let i = 0; i < 2; i++) {
      const dir = i === 0 ? 1 : -1
      tempObject.position.set(dir * lu / 2, 0.003, 0)
      tempObject.scale.set(0.008, 0.006, lu)
      tempObject.updateMatrix()
      propLinesRef.current.setMatrixAt(i + 2, tempObject.matrix)
    }
    propLinesRef.current.instanceMatrix.needsUpdate = true

    // 3. Setback zones (4 segments: Front, Rear, Left, Right)
    let setbackIdx = 0
    // Front/Rear
    if (frontSbU > 0) {
      for (let i = 0; i < 2; i++) {
        const dir = i === 0 ? 1 : -1
        tempObject.position.set(0, LOT_Y, dir * (lu / 2 - frontSbU / 2))
        tempObject.scale.set(lu, 1, frontSbU)
        tempObject.updateMatrix()
        setbacksRef.current.setMatrixAt(setbackIdx++, tempObject.matrix)
      }
    }
    // Left/Right
    if (sideSbU > 0) {
      for (let i = 0; i < 2; i++) {
        const dir = i === 0 ? 1 : -1
        tempObject.position.set(dir * (lu / 2 - sideSbU / 2), LOT_Y, 0)
        tempObject.scale.set(sideSbU, 1, lu)
        tempObject.updateMatrix()
        setbacksRef.current.setMatrixAt(setbackIdx++, tempObject.matrix)
      }
    }
    setbacksRef.current.count = setbackIdx
    setbacksRef.current.instanceMatrix.needsUpdate = true
  }, [s.floors, s.footprintSideM, s.lotSideM, frontSbU, sideSbU])

  useFrame(() => {
    const target = targetRef.current
    const LERP_FACTOR = 0.12
    
    const [nw, wSettled] = lerp(animRef.current.w, target.w, LERP_FACTOR)
    const [nh, hSettled] = lerp(animRef.current.h, target.h, LERP_FACTOR)

    // Mutate existing ref directly to avoid GC pressure
    animRef.current.w = nw
    animRef.current.h = nh

    if (buildingRef.current) {
      buildingRef.current.scale.set(nw, nh, nw)
      buildingRef.current.position.y = LOT_Y * 2 + nh / 2
    }
    if (buildingMatRef.current) {
      buildingMatRef.current.color.set(target.isViolation ? '#D64545' : '#1B3FC4')
    }

    if (!wSettled || !hSettled) invalidate()
  })

  return (
    <group ref={groupRef}>
      {/* ── Lot plate ──────────────────────────────────────────────────── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[lotU, lotU]} />
        <meshStandardMaterial color="#e5e7eb" />
      </mesh>

      {/* Property boundary lines (Optimized via InstancedMesh) */}
      <instancedMesh ref={propLinesRef} args={[null, null, 4]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#374151" />
      </instancedMesh>

      {/* Setback zones (Optimized via InstancedMesh) */}
      <instancedMesh ref={setbacksRef} args={[null, null, 4]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1, 1]} />
        <meshStandardMaterial color="#bfdbfe" transparent opacity={0.45} />
      </instancedMesh>

      {/* Setback labels */}
      {frontSbU > 0 && (
        <Html position={[0, LOT_Y, lotU / 2 - frontSbU / 2]} distanceFactor={8} occlude={false}>
          <div style={{ pointerEvents: 'none' }} className="bg-card/80 border border-border rounded px-1 py-0.5 text-[11px] font-mono text-foreground -translate-x-1/2 whitespace-nowrap">
            Front/Rear: {setbackFront.toFixed(1)}m
          </div>
        </Html>
      )}
      {sideSbU > 0 && (
        <Html position={[-(lotU / 2 - sideSbU / 2), LOT_Y, 0]} distanceFactor={8} occlude={false}>
          <div style={{ pointerEvents: 'none' }} className="bg-card/80 border border-border rounded px-1 py-0.5 text-[11px] font-mono text-foreground -translate-x-1/2 whitespace-nowrap">
            Side: {setbackSide.toFixed(1)}m
          </div>
        </Html>
      )}

      {/* ── Building envelope (unit cube, scaled by useFrame) ───────────── */}
      <mesh ref={buildingRef} castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          ref={buildingMatRef}
          color="#1B3FC4"
          transparent
          opacity={0.65}
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>

      {/* Floor plate lines (Optimized via InstancedMesh) */}
      <instancedMesh ref={instancedRef} args={[null, null, 100]} frustumCulled={false}>
        <boxGeometry args={[1, 0.005, 1]} />
        <meshStandardMaterial color="#1535A8" transparent opacity={0.4} />
      </instancedMesh>

      {/* ── 3D-anchored labels ──────────────────────────────────────────── */}
      {/* Height label — right face */}
      <Html
        position={[toU(s.footprintSideM) / 2 + 0.1, LOT_Y * 2 + toU(s.buildingHeightM) / 2, 0]}
        distanceFactor={8} occlude={false}
      >
        <div style={{ pointerEvents: 'none' }} className="bg-card/90 backdrop-blur-sm px-1.5 py-0.5 rounded border border-border shadow-sm whitespace-nowrap">
          <span className="text-[11px] font-bold text-foreground">
            {s.buildingHeightM.toFixed(1)}m · {s.floors}F
          </span>
        </div>
      </Html>

      {/* FAR / GFA label — above building */}
      <Html
        position={[0, LOT_Y * 2 + toU(s.buildingHeightM) + 0.1, 0]}
        distanceFactor={8} occlude={false}
      >
        <div style={{ pointerEvents: 'none' }} className={`px-1.5 py-0.5 rounded border shadow-sm whitespace-nowrap text-center ${
          s.isFARViolation ? 'bg-red-50 border-red-200' : 'bg-card/90 backdrop-blur-sm border-border'
        }`}>
          <div className={`text-[11px] font-bold ${s.isFARViolation ? 'text-red-700' : 'text-foreground'}`}>
            FAR {far.toFixed(1)}× — {s.maxFloorAreaM2.toFixed(0)} sqm GFA
          </div>
          {s.isFARViolation && (
            <div className="text-[11px] text-red-500">Exceeds zone max {MAX_ZONE_FAR}×</div>
          )}
        </div>
      </Html>

      {/* ── BHL reference line ──────────────────────────────────────────── */}
      <mesh position={[0, LOT_Y * 2 + bhlU, 0]}>
        <boxGeometry args={[lotU * 1.2, 0.006, 0.006]} />
        <meshStandardMaterial color={bhlColor} transparent opacity={0.85} />
      </mesh>
      <Html
        position={[lotU * 0.62 + 0.06, LOT_Y * 2 + bhlU, 0]}
        distanceFactor={8} occlude={false}
      >
        <div style={{ pointerEvents: 'none' }} className={`px-1.5 py-0.5 rounded border shadow-sm whitespace-nowrap ${
          s.isBHLViolation ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-200'
        }`}>
          <span className={`text-[11px] font-bold ${s.isBHLViolation ? 'text-red-700' : 'text-slate-500'}`}>
            BHL {bhl}m{s.isBHLViolation ? ' ⚠ EXCEEDED' : ' (limit)'}
          </span>
        </div>
      </Html>
    </group>
  )
}
