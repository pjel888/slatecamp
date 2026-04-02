'use client'

import { useRef, useMemo, useEffect } from 'react'
import * as THREE from 'three'
import { Line } from '@react-three/drei'
import { useFlooringStore } from '@/app/calculators/_stores/flooringStore'
import { CALC_MATERIALS } from '@/app/calculators/_lib/calculator-materials'

// ─── FloorPlane ──────────────────────────────────────────────────────────────

function FloorPlane() {
  const roomLengthMm = useFlooringStore((s) => s.roomLengthMm)
  const roomWidthMm = useFlooringStore((s) => s.roomWidthMm)

  const lengthM = roomLengthMm / 1000
  const widthM = roomWidthMm / 1000

  return (
    <mesh position={[lengthM / 2, 0, widthM / 2]}>
      <boxGeometry args={[lengthM, 0.005, widthM]} />
      <primitive object={CALC_MATERIALS.floorBase} attach="material" />
    </mesh>
  )
}

// ─── ExclusionZones ──────────────────────────────────────────────────────────

function ExclusionZones() {
  const exclusions = useFlooringStore((s) => s.exclusions)

  if (exclusions.length === 0) return null

  return (
    <group>
      {exclusions.map((ex) => (
        <mesh
          key={ex.id}
          position={[ex.xMm / 1000, 0.01, ex.yMm / 1000]}
        >
          <boxGeometry
            args={[ex.widthMm / 1000, 0.02, ex.heightMm / 1000]}
          />
          <primitive object={CALC_MATERIALS.exclusionZone} attach="material" />
        </mesh>
      ))}
    </group>
  )
}

// ─── TileGridInstanced ───────────────────────────────────────────────────────

function TileGridInstanced() {
  const tileGrid = useFlooringStore((s) => s.computed.tileGrid)
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])

  const fullCells = useMemo(
    () => tileGrid.filter((c) => !c.isCut && !c.isExcluded),
    [tileGrid],
  )

  const tileW = tileGrid[0]?.w ?? 0.1
  const tileD = tileGrid[0]?.d ?? 0.1
  const maxCount = Math.min(Math.max(fullCells.length, 1), 10000)

  useEffect(() => {
    const mesh = meshRef.current
    if (!mesh) return

    fullCells.forEach((cell, i) => {
      dummy.position.set(cell.x + cell.w / 2, 0.006, cell.z + cell.d / 2)
      dummy.rotation.set(-Math.PI / 2, 0, 0)
      dummy.scale.set(1, 1, 1)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
    })

    mesh.count = fullCells.length
    mesh.instanceMatrix.needsUpdate = true
  }, [fullCells, dummy])

  if (fullCells.length === 0) return null

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, maxCount]}>
      <planeGeometry args={[tileW, tileD]} />
      <primitive object={CALC_MATERIALS.tileFull} attach="material" />
    </instancedMesh>
  )
}

// ─── CutTileGridInstanced ────────────────────────────────────────────────────

function CutTileGridInstanced() {
  const tileGrid = useFlooringStore((s) => s.computed.tileGrid)
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])

  const cutCells = useMemo(
    () => tileGrid.filter((c) => c.isCut && !c.isExcluded),
    [tileGrid],
  )

  const tileW = tileGrid[0]?.w ?? 0.1
  const tileD = tileGrid[0]?.d ?? 0.1
  const maxCount = Math.min(Math.max(cutCells.length, 1), 10000)

  useEffect(() => {
    const mesh = meshRef.current
    if (!mesh) return

    cutCells.forEach((cell, i) => {
      dummy.position.set(cell.x + cell.w / 2, 0.006, cell.z + cell.d / 2)
      dummy.rotation.set(-Math.PI / 2, 0, 0)
      dummy.scale.set(1, 1, 1)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
    })

    mesh.count = cutCells.length
    mesh.instanceMatrix.needsUpdate = true
  }, [cutCells, dummy])

  if (cutCells.length === 0) return null

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, maxCount]}>
      <planeGeometry args={[tileW, tileD]} />
      <primitive object={CALC_MATERIALS.tileCut} attach="material" />
    </instancedMesh>
  )
}

// ─── PatternOrientationArrow ─────────────────────────────────────────────────

function PatternOrientationArrow() {
  const pattern = useFlooringStore((s) => s.pattern)
  const orientationDeg = useFlooringStore((s) => s.orientationDeg)
  const roomLengthMm = useFlooringStore((s) => s.roomLengthMm)
  const roomWidthMm = useFlooringStore((s) => s.roomWidthMm)

  const centerX = roomLengthMm / 1000 / 2
  const centerZ = roomWidthMm / 1000 / 2
  const rad = (orientationDeg * Math.PI) / 180
  const len = 0.3

  const tipX = centerX + Math.cos(rad) * len
  const tipZ = centerZ + Math.sin(rad) * len

  // Arrowhead wings
  const wingAngle = Math.PI * 0.8
  const wingLen = 0.08
  const wing1X = tipX + Math.cos(rad + wingAngle) * wingLen
  const wing1Z = tipZ + Math.sin(rad + wingAngle) * wingLen
  const wing2X = tipX + Math.cos(rad - wingAngle) * wingLen
  const wing2Z = tipZ + Math.sin(rad - wingAngle) * wingLen

  if (pattern === 'straight' && orientationDeg === 0) return null

  const y = 0.015

  return (
    <group>
      <Line
        points={[
          [centerX, y, centerZ],
          [tipX, y, tipZ],
        ]}
        color="#333333"
        lineWidth={2}
      />
      <Line
        points={[
          [wing1X, y, wing1Z],
          [tipX, y, tipZ],
          [wing2X, y, wing2Z],
        ]}
        color="#333333"
        lineWidth={2}
      />
    </group>
  )
}

// ─── FlooringScene (main export) ─────────────────────────────────────────────

export function FlooringScene() {
  return (
    <group>
      <FloorPlane />
      <ExclusionZones />
      <TileGridInstanced />
      <CutTileGridInstanced />
      <PatternOrientationArrow />
    </group>
  )
}
