'use client'

import { useRef, useMemo, useEffect } from 'react'
import * as THREE from 'three'
import { useCHBStore } from '@/app/calculators/_stores/chbStore'
import { CALC_MATERIALS } from '@/app/calculators/_lib/calculator-materials'

// ─── CHBBlockWall ───────────────────────────────────────────────────────────

function CHBBlockWall() {
  const blockGrid = useCHBStore((s) => s.computed.blockGrid)
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])

  const fullCells = useMemo(
    () => blockGrid.filter((c) => !c.isCut && !c.isExcluded),
    [blockGrid],
  )

  const moduleW = fullCells[0]?.w ?? 0.4
  const moduleH = fullCells[0]?.h ?? 0.2
  const blockThicknessM = 0.15
  const maxCount = Math.min(Math.max(fullCells.length, 1), 10000)

  useEffect(() => {
    const mesh = meshRef.current
    if (!mesh) return

    fullCells.forEach((cell, i) => {
      dummy.position.set(cell.x + cell.offsetX + moduleW / 2, cell.y + moduleH / 2, 0)
      dummy.scale.set(1, 1, 1)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
    })

    mesh.count = fullCells.length
    mesh.instanceMatrix.needsUpdate = true
  }, [fullCells, dummy, moduleW, moduleH])

  if (fullCells.length === 0) return null

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, maxCount]}>
      <boxGeometry args={[moduleW, moduleH, blockThicknessM]} />
      <primitive object={CALC_MATERIALS.chbBlock} attach="material" />
    </instancedMesh>
  )
}

// ─── CHBCutBlocks ───────────────────────────────────────────────────────────

function CHBCutBlocks() {
  const blockGrid = useCHBStore((s) => s.computed.blockGrid)
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])

  const cutCells = useMemo(
    () => blockGrid.filter((c) => c.isCut && !c.isExcluded),
    [blockGrid],
  )

  const moduleW = cutCells[0]?.w ?? 0.4
  const moduleH = cutCells[0]?.h ?? 0.2
  const blockThicknessM = 0.15
  const maxCount = Math.min(Math.max(cutCells.length, 1), 10000)

  useEffect(() => {
    const mesh = meshRef.current
    if (!mesh) return

    cutCells.forEach((cell, i) => {
      dummy.position.set(cell.x + cell.offsetX + moduleW / 2, cell.y + moduleH / 2, 0)
      dummy.scale.set(1, 1, 1)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
    })

    mesh.count = cutCells.length
    mesh.instanceMatrix.needsUpdate = true
  }, [cutCells, dummy, moduleW, moduleH])

  if (cutCells.length === 0) return null

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, maxCount]}>
      <boxGeometry args={[moduleW, moduleH, blockThicknessM]} />
      <primitive object={CALC_MATERIALS.chbBlockCut} attach="material" />
    </instancedMesh>
  )
}

// ─── MortarGrid ─────────────────────────────────────────────────────────────

function MortarGrid() {
  const wallLengthMm = useCHBStore((s) => s.wallLengthMm)
  const wallHeightMm = useCHBStore((s) => s.wallHeightMm)
  const blockLengthMm = useCHBStore((s) => s.blockLengthMm)
  const blockHeightMm = useCHBStore((s) => s.blockHeightMm)
  const mortarJointMm = useCHBStore((s) => s.mortarJointMm)

  const wallLengthM = wallLengthMm / 1000
  const wallHeightM = wallHeightMm / 1000
  const courseH = (blockHeightMm + mortarJointMm) / 1000
  const mortarThickness = mortarJointMm / 1000

  if (wallLengthM <= 0 || wallHeightM <= 0) return null

  const horizontalLines: number[] = []
  let y = courseH
  while (y < wallHeightM) {
    horizontalLines.push(y)
    y += courseH
  }

  const moduleW = (blockLengthMm + mortarJointMm) / 1000
  const verticalLines: number[] = []
  let x = moduleW
  while (x < wallLengthM) {
    verticalLines.push(x)
    x += moduleW
  }

  return (
    <group>
      {/* Horizontal mortar lines at each course boundary */}
      {horizontalLines.map((yPos, i) => (
        <mesh key={`h-${i}`} position={[wallLengthM / 2, yPos, 0]}>
          <boxGeometry args={[wallLengthM, mortarThickness, 0.16]} />
          <primitive object={CALC_MATERIALS.chbMortar} attach="material" />
        </mesh>
      ))}

      {/* Vertical mortar lines at each block boundary */}
      {verticalLines.map((xPos, i) => (
        <mesh key={`v-${i}`} position={[xPos, wallHeightM / 2, 0]}>
          <boxGeometry args={[mortarThickness, wallHeightM, 0.16]} />
          <primitive object={CALC_MATERIALS.chbMortar} attach="material" />
        </mesh>
      ))}
    </group>
  )
}

// ─── VerticalRebar ──────────────────────────────────────────────────────────

function VerticalRebar() {
  const verticalPositions = useCHBStore((s) => s.computed.verticalRebarPositionsM)
  const wallHeightMm = useCHBStore((s) => s.wallHeightMm)

  const heightM = wallHeightMm / 1000
  const rebarRadius = 0.005

  if (verticalPositions.length === 0 || heightM <= 0) return null

  return (
    <group>
      {verticalPositions.map((xPos, i) => (
        <mesh key={`vr-${i}`} position={[xPos, heightM / 2, 0]} rotation={[0, 0, 0]}>
          <cylinderGeometry args={[rebarRadius, rebarRadius, heightM, 8]} />
          <primitive object={CALC_MATERIALS.chbRebar} attach="material" />
        </mesh>
      ))}
    </group>
  )
}

// ─── HorizontalRebar ────────────────────────────────────────────────────────

function HorizontalRebar() {
  const horizontalPositions = useCHBStore((s) => s.computed.horizontalRebarPositionsM)
  const wallLengthMm = useCHBStore((s) => s.wallLengthMm)

  const lengthM = wallLengthMm / 1000
  const rebarRadius = 0.005

  if (horizontalPositions.length === 0 || lengthM <= 0) return null

  return (
    <group>
      {horizontalPositions.map((yPos, i) => (
        <mesh key={`hr-${i}`} position={[lengthM / 2, yPos, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[rebarRadius, rebarRadius, lengthM, 8]} />
          <primitive object={CALC_MATERIALS.chbRebar} attach="material" />
        </mesh>
      ))}
    </group>
  )
}

// ─── OpeningVoids ───────────────────────────────────────────────────────────

function OpeningVoids() {
  const openings = useCHBStore((s) => s.openings)

  if (openings.length === 0) return null

  return (
    <group>
      {openings.map((o) => (
        <mesh
          key={o.id}
          position={[
            o.xOffsetMm / 1000 + o.widthMm / 2000,
            o.yOffsetMm / 1000 + o.heightMm / 2000,
            0,
          ]}
        >
          <boxGeometry args={[o.widthMm / 1000, o.heightMm / 1000, 0.2]} />
          <primitive object={CALC_MATERIALS.openingVoid} attach="material" />
        </mesh>
      ))}
    </group>
  )
}

// ─── LintelsAboveOpenings ───────────────────────────────────────────────────

function LintelsAboveOpenings() {
  const openings = useCHBStore((s) => s.openings)

  if (openings.length === 0) return null

  const lintelHeightM = 0.2 // one course (200mm)
  const bearingMm = 100 // 100mm bearing each side

  return (
    <group>
      {openings.map((o) => {
        const xCenterM = (o.xOffsetMm + o.widthMm / 2) / 1000
        const yTopM = (o.yOffsetMm + o.heightMm) / 1000
        const lintelWidthM = (o.widthMm + bearingMm * 2) / 1000

        return (
          <mesh
            key={`lintel-${o.id}`}
            position={[xCenterM, yTopM + lintelHeightM / 2, 0]}
          >
            <boxGeometry args={[lintelWidthM, lintelHeightM, 0.16]} />
            <primitive object={CALC_MATERIALS.chbLintel} attach="material" />
          </mesh>
        )
      })}
    </group>
  )
}

// ─── CHBScene (main export) ─────────────────────────────────────────────────

export function CHBScene() {
  return (
    <group>
      <CHBBlockWall />
      <CHBCutBlocks />
      <MortarGrid />
      <VerticalRebar />
      <HorizontalRebar />
      <OpeningVoids />
      <LintelsAboveOpenings />
    </group>
  )
}
