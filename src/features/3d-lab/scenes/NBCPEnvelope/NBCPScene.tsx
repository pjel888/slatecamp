// src/app/dashboard/3d-lab/_scenes/NBCPEnvelope/NBCPScene.tsx
'use client'

import { useRef, useEffect, useLayoutEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { useNBCPStore } from '@/features/3d-lab/stores/nbcpStore'
import { useNBCPInvalidateOnChange } from '@/features/3d-lab/hooks/useNBCPInvalidateOnChange'
import { LotType } from '@/features/3d-lab/constants/nbcp'

// ─── Scale ────────────────────────────────────────────────────────────────────
// 1 Three.js unit = 20m
const SCALE = 0.05
const LOT_Y = 0.005  // half-thickness of lot plate

// Helpers for instancing to avoid per-frame allocations
const tempObject = new THREE.Object3D()

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toU(meters: number) { return meters * SCALE }

/** Clamp distanceFactor for <Html> based on lot area for readability at all scales */
function labelDistanceFactor(tla: number): number {
  if (tla < 100)   return 6
  if (tla < 1000)  return 7
  if (tla < 5000)  return 9
  return 12
}

/** Lerp a value toward target. Returns true when settled (within epsilon). */
function lerp(current: number, target: number, factor: number, epsilon = 0.001): [number, boolean] {
  const next = current + (target - current) * factor
  return [Math.abs(next - target) < epsilon ? target : next, Math.abs(next - target) < epsilon]
}

// ─── Scene ────────────────────────────────────────────────────────────────────

export function NBCPScene() {
  useNBCPInvalidateOnChange()
  const { invalidate } = useThree()

  // Lerp targets — updated via store subscription to avoid getState() in useFrame
  const buildingRef = useRef<THREE.Mesh>(null)
  const buildingMatRef = useRef<THREE.MeshStandardMaterial>(null)
  const instancedRef = useRef<THREE.InstancedMesh>(null)
  const propLinesRef = useRef<THREE.InstancedMesh>(null)
  const setbacksRef = useRef<THREE.InstancedMesh>(null)

  // Pre-allocated refs for performance
  const targetRef = useRef({ w: 0.001, d: 0.001, h: 0.001, hasViolations: false })
  const animRef = useRef({ w: 0.001, d: 0.001, h: 0.001 })

  // Subscribe to store changes once on mount
  useEffect(() => {
    return useNBCPStore.subscribe((state) => {
      targetRef.current.w = Math.max(0.001, toU(state.computed.buildableWidth))
      targetRef.current.d = Math.max(0.001, toU(state.computed.buildableDepth))
      targetRef.current.h = Math.max(0.001, toU(state.computed.displayHeight))
      targetRef.current.hasViolations = state.computed.violations.length > 0
    })
  }, [])

  // Static values (don't need animation)
  const { computed, inputs } = useNBCPStore()
  const {
    tla, bhl_effective, bhl_meters, bhl_source,
    setbacks,
    displayStoreys, displayHeight,
    ambf, flar, violations,
  } = computed

  // Update instance matrices for floor plates, property lines, and setbacks
  useLayoutEffect(() => {
    if (!instancedRef.current || !propLinesRef.current || !setbacksRef.current) return
    
    // 1. Floor plates
    const bw = toU(computed.buildableWidth)
    const bd = toU(computed.buildableDepth)
    const count = Math.max(0, displayStoreys - 1)
    for (let i = 0; i < count; i++) {
      const floorY = LOT_Y * 2 + toU((i + 1) * inputs.floorHeight)
      tempObject.position.set(0, floorY, 0)
      tempObject.scale.set(bw, 1, bd)
      tempObject.updateMatrix()
      instancedRef.current.setMatrixAt(i, tempObject.matrix)
    }
    instancedRef.current.count = count
    instancedRef.current.instanceMatrix.needsUpdate = true

    // 2. Property boundary lines
    const lotWu = toU(inputs.lotWidth)
    const lotDu = toU(inputs.lotDepth)
    // FB segments
    for (let i = 0; i < 2; i++) {
      const dir = i === 0 ? 1 : -1
      tempObject.position.set(0, 0.003, dir * lotDu / 2)
      tempObject.scale.set(lotWu, 0.006, 0.008)
      tempObject.updateMatrix()
      propLinesRef.current.setMatrixAt(i, tempObject.matrix)
    }
    // LR segments
    for (let i = 0; i < 2; i++) {
      const dir = i === 0 ? 1 : -1
      tempObject.position.set(dir * lotWu / 2, 0.003, 0)
      tempObject.scale.set(0.008, 0.006, lotDu)
      tempObject.updateMatrix()
      propLinesRef.current.setMatrixAt(i + 2, tempObject.matrix)
    }
    propLinesRef.current.instanceMatrix.needsUpdate = true

    // 3. Setback zones (4 segments: Front, Rear, Left, Right)
    const frontSbU = toU(setbacks.front)
    const rearSbU  = toU(setbacks.rear)
    const leftSbU  = toU(setbacks.left)
    const rightSbU = toU(setbacks.right)
    
    let setbackIdx = 0
    if (frontSbU > 0) {
      tempObject.position.set(0, LOT_Y, lotDu / 2 - frontSbU / 2)
      tempObject.scale.set(lotWu, 1, frontSbU)
      tempObject.updateMatrix()
      setbacksRef.current.setMatrixAt(setbackIdx++, tempObject.matrix)
    }
    if (rearSbU > 0) {
      tempObject.position.set(0, LOT_Y, -(lotDu / 2 - rearSbU / 2))
      tempObject.scale.set(lotWu, 1, rearSbU)
      tempObject.updateMatrix()
      setbacksRef.current.setMatrixAt(setbackIdx++, tempObject.matrix)
    }
    if (leftSbU > 0) {
      tempObject.position.set(-(lotWu / 2 - leftSbU / 2), LOT_Y, 0)
      tempObject.scale.set(leftSbU, 1, lotDu)
      tempObject.updateMatrix()
      setbacksRef.current.setMatrixAt(setbackIdx++, tempObject.matrix)
    }
    if (rightSbU > 0) {
      tempObject.position.set((lotWu / 2 - rightSbU / 2), LOT_Y, 0)
      tempObject.scale.set(rightSbU, 1, lotDu)
      tempObject.updateMatrix()
      setbacksRef.current.setMatrixAt(setbackIdx++, tempObject.matrix)
    }
    setbacksRef.current.count = setbackIdx
    setbacksRef.current.instanceMatrix.needsUpdate = true
  }, [displayStoreys, computed.buildableWidth, computed.buildableDepth, inputs.lotWidth, inputs.lotDepth, setbacks])

  useFrame(() => {
    const target = targetRef.current
    const LERP_FACTOR = 0.12  // ~400ms to settle at 60fps
    
    const [nw, wSettled] = lerp(animRef.current.w, target.w, LERP_FACTOR)
    const [nd, dSettled] = lerp(animRef.current.d, target.d, LERP_FACTOR)
    const [nh, hSettled] = lerp(animRef.current.h, target.h, LERP_FACTOR)

    // Mutate existing ref directly to avoid GC pressure
    animRef.current.w = nw
    animRef.current.d = nd
    animRef.current.h = nh

    const anyMoving = !wSettled || !dSettled || !hSettled

    if (buildingRef.current) {
      buildingRef.current.scale.set(nw, nh, nd)
      buildingRef.current.position.y = LOT_Y * 2 + nh / 2
    }

    // Building color: blue = compliant, red = BHL violated
    if (buildingMatRef.current) {
      const color = target.hasViolations ? '#D64545' : '#1B3FC4'
      buildingMatRef.current.color.set(color)
    }

    if (anyMoving) invalidate()  // self-schedule next frame while animating
  })

  const lotWu = toU(inputs.lotWidth)
  const lotDu = toU(inputs.lotDepth)
  const bhlU  = toU(bhl_meters)

  const df = labelDistanceFactor(tla)

  // Setback zone positions
  const frontSbDepth = toU(setbacks.front)
  const rearSbDepth  = toU(setbacks.rear)
  const leftSbWidth  = toU(setbacks.left)
  const rightSbWidth = toU(setbacks.right)

  // BHL line color
  const bhlLineColor = violations.length > 0 ? '#D64545' : '#2D9F6F'

  // RROW plane(s)
  const rrowWu = toU(inputs.rrowWidth)
  const showRearRrow = inputs.lotType === LotType.THROUGH

  const neighborH = toU(Math.max(bhl_meters * 0.7, inputs.floorHeight * 2))
  const showLeftNeighbor  = inputs.lotType === LotType.INSIDE || inputs.lotType === LotType.THROUGH || inputs.lotType === LotType.END
  const showRightNeighbor = inputs.lotType === LotType.INSIDE || inputs.lotType === LotType.THROUGH || inputs.lotType === LotType.CORNER
  const showLeftRrow      = inputs.lotType === LotType.CORNER
  const showRightRrow     = inputs.lotType === LotType.END

  return (
    <group>
      {/* ── RROW plane(s) ──────────────────────────────────────────────── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, lotDu / 2 + rrowWu / 2]}>
        <planeGeometry args={[lotWu + rrowWu, rrowWu]} />
        <meshStandardMaterial color="#d1d5db" />
      </mesh>
      <Html position={[0, 0, lotDu / 2 + rrowWu / 2]} distanceFactor={df} occlude={false}>
        <div style={{ pointerEvents: 'none' }} className="bg-card/90 border border-border rounded px-1.5 py-0.5 text-[11px] font-bold text-text-secondary whitespace-nowrap -translate-x-1/2">
          RROW: {inputs.rrowWidth.toFixed(1)}m
        </div>
      </Html>

      {showRearRrow && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -(lotDu / 2 + rrowWu / 2)]}>
          <planeGeometry args={[lotWu + rrowWu, rrowWu]} />
          <meshStandardMaterial color="#d1d5db" />
        </mesh>
      )}

      {showLeftRrow && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-(lotWu / 2 + rrowWu / 2), 0, 0]}>
          <planeGeometry args={[rrowWu, lotDu + rrowWu]} />
          <meshStandardMaterial color="#d1d5db" />
        </mesh>
      )}

      {showRightRrow && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[(lotWu / 2 + rrowWu / 2), 0, 0]}>
          <planeGeometry args={[rrowWu, lotDu + rrowWu]} />
          <meshStandardMaterial color="#d1d5db" />
        </mesh>
      )}

      {/* ── Neighboring lots ────────────────────────────────────────────── */}
      {showLeftNeighbor && (
        <group position={[-lotWu, 0, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[lotWu, lotDu]} />
            <meshStandardMaterial color="#f3f4f6" />
          </mesh>
          <mesh position={[0, LOT_Y * 2 + neighborH / 2, 0]}>
            <boxGeometry args={[lotWu * 0.65, neighborH, lotDu * 0.6]} />
            <meshStandardMaterial color="#9ca3af" transparent opacity={0.35} roughness={0.8} />
          </mesh>
        </group>
      )}
      {showRightNeighbor && (
        <group position={[lotWu, 0, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[lotWu, lotDu]} />
            <meshStandardMaterial color="#f3f4f6" />
          </mesh>
          <mesh position={[0, LOT_Y * 2 + neighborH / 2, 0]}>
            <boxGeometry args={[lotWu * 0.65, neighborH, lotDu * 0.6]} />
            <meshStandardMaterial color="#9ca3af" transparent opacity={0.35} roughness={0.8} />
          </mesh>
        </group>
      )}

      {/* ── Lot plate ──────────────────────────────────────────────────── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[lotWu, lotDu]} />
        <meshStandardMaterial color="#e5e7eb" />
      </mesh>

      {/* Property lines (Optimized via InstancedMesh) */}
      <instancedMesh ref={propLinesRef} args={[null, null, 4]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#374151" />
      </instancedMesh>

      {/* Setback zones (Optimized via InstancedMesh) */}
      <instancedMesh ref={setbacksRef} args={[null, null, 4]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1, 1]} />
        <meshStandardMaterial color="#bfdbfe" transparent opacity={0.45} />
      </instancedMesh>

      {frontSbDepth > 0 && (
        <Html position={[0, LOT_Y, lotDu / 2 - frontSbDepth / 2]} distanceFactor={df} occlude={false}>
          <div style={{ pointerEvents: 'none' }} className="bg-card/80 border border-border rounded px-1 py-0.5 text-[11px] font-mono text-foreground -translate-x-1/2 whitespace-nowrap">
            Front: {setbacks.front.toFixed(1)}m
          </div>
        </Html>
      )}
      {rearSbDepth > 0 && (
        <Html position={[0, LOT_Y, -(lotDu / 2 - rearSbDepth / 2)]} distanceFactor={df} occlude={false}>
          <div style={{ pointerEvents: 'none' }} className="bg-card/80 border border-border rounded px-1 py-0.5 text-[11px] font-mono text-foreground -translate-x-1/2 whitespace-nowrap">
            Rear: {setbacks.rear.toFixed(1)}m
          </div>
        </Html>
      )}
      {leftSbWidth > 0 && (
        <Html position={[-(lotWu / 2 - leftSbWidth / 2), LOT_Y, 0]} distanceFactor={df} occlude={false}>
          <div style={{ pointerEvents: 'none' }} className="bg-card/80 border border-border rounded px-1 py-0.5 text-[11px] font-mono text-foreground -translate-x-1/2 whitespace-nowrap">
            Left: {setbacks.left.toFixed(1)}m
          </div>
        </Html>
      )}
      {rightSbWidth > 0 && (
        <Html position={[(lotWu / 2 - rightSbWidth / 2), LOT_Y, 0]} distanceFactor={df} occlude={false}>
          <div style={{ pointerEvents: 'none' }} className="bg-card/80 border border-border rounded px-1 py-0.5 text-[11px] font-mono text-foreground -translate-x-1/2 whitespace-nowrap">
            Right: {setbacks.right.toFixed(1)}m
          </div>
        </Html>
      )}

      {/* ── Building envelope ───────────────────────────────────────────── */}
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
      <Html
        position={[toU(computed.buildableWidth) / 2 + 0.08, LOT_Y * 2 + toU(displayHeight) / 2, 0]}
        distanceFactor={df} occlude={false}
      >
        <div style={{ pointerEvents: 'none' }} className="bg-white/90 backdrop-blur-sm px-1.5 py-0.5 rounded border border-zinc-200 shadow-sm whitespace-nowrap">
          <span className="text-[11px] font-bold text-zinc-700">
            {displayHeight.toFixed(1)}m · {displayStoreys}F
          </span>
        </div>
      </Html>

      <Html
        position={[0, LOT_Y * 2 + toU(displayHeight) + 0.06, 0]}
        distanceFactor={df} occlude={false}
      >
        <div style={{ pointerEvents: 'none' }} className="bg-white/90 backdrop-blur-sm px-1.5 py-0.5 rounded border border-zinc-200 shadow-sm whitespace-nowrap text-center">
          <div className="text-[11px] font-bold text-zinc-700">AMBF: {ambf.toFixed(0)} sqm</div>
          <div className="text-[11px] text-zinc-500">FLAR {flar.toFixed(2)}x</div>
        </div>
      </Html>

      {/* ── BHL reference line ──────────────────────────────────────────── */}
      <mesh position={[0, LOT_Y * 2 + bhlU, 0]}>
        <boxGeometry args={[lotWu * 1.2, 0.006, 0.006]} />
        <meshStandardMaterial color={bhlLineColor} transparent opacity={0.85} />
      </mesh>
      <Html
        position={[lotWu * 0.6 + 0.08, LOT_Y * 2 + bhlU, 0]}
        distanceFactor={df} occlude={false}
      >
        <div style={{ pointerEvents: 'none' }} className={`px-1.5 py-0.5 rounded border shadow-sm whitespace-nowrap ${
          violations.length > 0 ? 'bg-red-50 border-red-200' :
          bhl_source === 'rrow' ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200'
        }`}>
          <span className={`text-[11px] font-bold ${
            violations.length > 0 ? 'text-red-700' :
            bhl_source === 'rrow' ? 'text-amber-700' : 'text-slate-500'
          }`}>
            BHL {bhl_meters.toFixed(1)}m ({bhl_effective}F) — {bhl_source === 'rrow' ? 'RROW-limited' : 'Zoning-limited'}
          </span>
        </div>
      </Html>
    </group>
  )
}
