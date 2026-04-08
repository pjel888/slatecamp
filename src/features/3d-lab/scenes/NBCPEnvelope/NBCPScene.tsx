// src/app/dashboard/3d-lab/_scenes/NBCPEnvelope/NBCPScene.tsx
'use client'

import { useRef, useEffect, useLayoutEffect } from 'react'
import { useDisposeOnUnmount } from '@/components/r3f/useDisposeOnUnmount'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useNBCPStore } from '@/features/3d-lab/stores/nbcpStore'
import { useNBCPInvalidateOnChange } from '@/features/3d-lab/hooks/useNBCPInvalidateOnChange'
import { useOverlayStore } from '@/features/3d-lab/stores/useOverlayStore'
import { LotType } from '@/features/3d-lab/constants/nbcp'
import { SCENE_COLORS } from '@/features/3d-lab/constants/scene-colors'

// ─── Scale ────────────────────────────────────────────────────────────────────
// 1 Three.js unit = 20m
const SCALE = 0.05
const LOT_Y = 0.005  // half-thickness of lot plate

// Helpers for instancing to avoid per-frame allocations
const tempObject = new THREE.Object3D()

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toU(meters: number) { return meters * SCALE }

/** Lerp a value toward target. Returns true when settled (within epsilon). */
function lerp(current: number, target: number, factor: number, epsilon = 0.001): [number, boolean] {
  const next = current + (target - current) * factor
  return [Math.abs(next - target) < epsilon ? target : next, Math.abs(next - target) < epsilon]
}

// ─── Scene ────────────────────────────────────────────────────────────────────

export function NBCPScene() {
  const groupRef = useRef<THREE.Group>(null)
  useDisposeOnUnmount(groupRef)

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

  // Setback zone positions
  const frontSbDepth = toU(setbacks.front)
  const rearSbDepth  = toU(setbacks.rear)
  const leftSbWidth  = toU(setbacks.left)
  const rightSbWidth = toU(setbacks.right)

  // BHL line color
  const bhlLineColor = violations.length > 0 ? SCENE_COLORS.bhlViolation : SCENE_COLORS.bhlCompliant

  // RROW plane(s)
  const rrowWu = toU(inputs.rrowWidth)
  const showRearRrow = inputs.lotType === LotType.THROUGH

  const neighborH = toU(Math.max(bhl_meters * 0.7, inputs.floorHeight * 2))
  const showLeftNeighbor  = inputs.lotType === LotType.INSIDE || inputs.lotType === LotType.THROUGH || inputs.lotType === LotType.END
  const showRightNeighbor = inputs.lotType === LotType.INSIDE || inputs.lotType === LotType.THROUGH || inputs.lotType === LotType.CORNER
  const showLeftRrow      = inputs.lotType === LotType.CORNER
  const showRightRrow     = inputs.lotType === LotType.END

  // Emit overlay items for all labels
  const upsertItem = useOverlayStore((s) => s.upsertItem)
  const removeItem = useOverlayStore((s) => s.removeItem)

  useEffect(() => {
    const ids: string[] = []

    // RROW label
    const rrowId = 'nbcp-rrow'
    ids.push(rrowId)
    upsertItem({
      id: rrowId,
      worldPosition: new THREE.Vector3(0, 0, lotDu / 2 + rrowWu / 2),
      type: 'label',
      payload: { text: `RROW: ${inputs.rrowWidth.toFixed(1)}m` },
      visible: true,
    })

    // Setback labels
    if (frontSbDepth > 0) {
      const id = 'nbcp-sb-front'
      ids.push(id)
      upsertItem({
        id,
        worldPosition: new THREE.Vector3(0, LOT_Y, lotDu / 2 - frontSbDepth / 2),
        type: 'dimension',
        payload: { value: setbacks.front, unit: 'm', label: 'Front', isViolating: false },
        visible: true,
      })
    }
    if (rearSbDepth > 0) {
      const id = 'nbcp-sb-rear'
      ids.push(id)
      upsertItem({
        id,
        worldPosition: new THREE.Vector3(0, LOT_Y, -(lotDu / 2 - rearSbDepth / 2)),
        type: 'dimension',
        payload: { value: setbacks.rear, unit: 'm', label: 'Rear', isViolating: false },
        visible: true,
      })
    }
    if (leftSbWidth > 0) {
      const id = 'nbcp-sb-left'
      ids.push(id)
      upsertItem({
        id,
        worldPosition: new THREE.Vector3(-(lotWu / 2 - leftSbWidth / 2), LOT_Y, 0),
        type: 'dimension',
        payload: { value: setbacks.left, unit: 'm', label: 'Left', isViolating: false },
        visible: true,
      })
    }
    if (rightSbWidth > 0) {
      const id = 'nbcp-sb-right'
      ids.push(id)
      upsertItem({
        id,
        worldPosition: new THREE.Vector3(lotWu / 2 - rightSbWidth / 2, LOT_Y, 0),
        type: 'dimension',
        payload: { value: setbacks.right, unit: 'm', label: 'Right', isViolating: false },
        visible: true,
      })
    }

    // Height + storeys label
    const heightId = 'nbcp-height'
    ids.push(heightId)
    upsertItem({
      id: heightId,
      worldPosition: new THREE.Vector3(toU(computed.buildableWidth) / 2 + 0.08, LOT_Y * 2 + toU(displayHeight) / 2, 0),
      type: 'label',
      payload: { text: `${displayHeight.toFixed(1)}m · ${displayStoreys}F` },
      visible: true,
    })

    // AMBF / FLAR label
    const ambfId = 'nbcp-ambf'
    ids.push(ambfId)
    upsertItem({
      id: ambfId,
      worldPosition: new THREE.Vector3(0, LOT_Y * 2 + toU(displayHeight) + 0.06, 0),
      type: 'label',
      payload: { text: `AMBF: ${ambf.toFixed(0)} sqm`, subtext: `FLAR ${flar.toFixed(2)}x` },
      visible: true,
    })

    // BHL label
    const bhlId = 'nbcp-bhl'
    ids.push(bhlId)
    const bhlText = `BHL ${bhl_meters.toFixed(1)}m (${bhl_effective}F) — ${bhl_source === 'rrow' ? 'RROW-limited' : 'Zoning-limited'}`
    upsertItem({
      id: bhlId,
      worldPosition: new THREE.Vector3(lotWu * 0.6 + 0.08, LOT_Y * 2 + bhlU, 0),
      type: violations.length > 0 ? 'violation' : 'label',
      payload: violations.length > 0
        ? { law: 'BHL', section: 'NBCP', message: bhlText, severity: 'error' as const }
        : { text: bhlText },
      visible: true,
    })

    return () => ids.forEach((id) => removeItem(id))
  }, [
    lotWu, lotDu, rrowWu, inputs.rrowWidth, frontSbDepth, rearSbDepth, leftSbWidth, rightSbWidth,
    setbacks, computed.buildableWidth, displayHeight, displayStoreys, ambf, flar,
    bhl_meters, bhl_effective, bhl_source, bhlU, violations.length, upsertItem, removeItem,
  ])

  return (
    <group ref={groupRef}>
      {/* ── RROW plane(s) ──────────────────────────────────────────────── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, lotDu / 2 + rrowWu / 2]}>
        <planeGeometry args={[lotWu + rrowWu, rrowWu]} />
        <meshStandardMaterial color={SCENE_COLORS.rrowSurface} />
      </mesh>

      {showRearRrow && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -(lotDu / 2 + rrowWu / 2)]}>
          <planeGeometry args={[lotWu + rrowWu, rrowWu]} />
          <meshStandardMaterial color={SCENE_COLORS.rrowSurface} />
        </mesh>
      )}

      {showLeftRrow && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-(lotWu / 2 + rrowWu / 2), 0, 0]}>
          <planeGeometry args={[rrowWu, lotDu + rrowWu]} />
          <meshStandardMaterial color={SCENE_COLORS.rrowSurface} />
        </mesh>
      )}

      {showRightRrow && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[(lotWu / 2 + rrowWu / 2), 0, 0]}>
          <planeGeometry args={[rrowWu, lotDu + rrowWu]} />
          <meshStandardMaterial color={SCENE_COLORS.rrowSurface} />
        </mesh>
      )}

      {/* ── Neighboring lots ────────────────────────────────────────────── */}
      {showLeftNeighbor && (
        <group position={[-lotWu, 0, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[lotWu, lotDu]} />
            <meshStandardMaterial color={SCENE_COLORS.neighborLot} />
          </mesh>
          <mesh position={[0, LOT_Y * 2 + neighborH / 2, 0]}>
            <boxGeometry args={[lotWu * 0.65, neighborH, lotDu * 0.6]} />
            <meshStandardMaterial color={SCENE_COLORS.neighborBuilding} transparent opacity={0.35} roughness={0.8} />
          </mesh>
        </group>
      )}
      {showRightNeighbor && (
        <group position={[lotWu, 0, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[lotWu, lotDu]} />
            <meshStandardMaterial color={SCENE_COLORS.neighborLot} />
          </mesh>
          <mesh position={[0, LOT_Y * 2 + neighborH / 2, 0]}>
            <boxGeometry args={[lotWu * 0.65, neighborH, lotDu * 0.6]} />
            <meshStandardMaterial color={SCENE_COLORS.neighborBuilding} transparent opacity={0.35} roughness={0.8} />
          </mesh>
        </group>
      )}

      {/* ── Lot plate ──────────────────────────────────────────────────── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[lotWu, lotDu]} />
        <meshStandardMaterial color={SCENE_COLORS.groundNeutral} />
      </mesh>

      {/* Property lines (Optimized via InstancedMesh) */}
      <instancedMesh ref={propLinesRef} args={[null, null, 4]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={SCENE_COLORS.propertyLine} />
      </instancedMesh>

      {/* Setback zones (Optimized via InstancedMesh) */}
      <instancedMesh ref={setbacksRef} args={[null, null, 4]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1, 1]} />
        <meshStandardMaterial color={SCENE_COLORS.setbackZone} transparent opacity={0.45} />
      </instancedMesh>

      {/* ── Building envelope ───────────────────────────────────────────── */}
      <mesh ref={buildingRef} castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          ref={buildingMatRef}
          color={SCENE_COLORS.buildingPrimary}
          transparent
          opacity={0.65}
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>

      {/* Floor plate lines (Optimized via InstancedMesh) */}
      <instancedMesh ref={instancedRef} args={[null, null, 100]} frustumCulled={false}>
        <boxGeometry args={[1, 0.005, 1]} />
        <meshStandardMaterial color={SCENE_COLORS.floorPlateEdge} transparent opacity={0.4} />
      </instancedMesh>

      {/* ── BHL reference line ──────────────────────────────────────────── */}
      <mesh position={[0, LOT_Y * 2 + bhlU, 0]}>
        <boxGeometry args={[lotWu * 1.2, 0.006, 0.006]} />
        <meshStandardMaterial color={bhlLineColor} transparent opacity={0.85} />
      </mesh>
    </group>
  )
}
