'use client'

import { useEffect, useRef } from 'react'
import type { Group } from 'three'
import { useDisposeOnUnmount } from '@/components/r3f/useDisposeOnUnmount'
import { useThree } from '@react-three/fiber'
import { Edges } from '@react-three/drei'
import { usePaintStore } from '@/app/calculators/_stores/paintStore'
import { CALC_MATERIALS, setPaintableWallColor } from '@/app/calculators/_lib/calculator-materials'

// ─── Wall ID mapping for opening placement ───────────────────────────────────

type WallId = 'wall-front' | 'wall-back' | 'wall-left' | 'wall-right'

// ─── ColorUpdater ────────────────────────────────────────────────────────────

function ColorUpdater() {
  const selectedColorHex = usePaintStore((s) => s.selectedColorHex)
  const { invalidate } = useThree()

  useEffect(() => {
    setPaintableWallColor(selectedColorHex)
    invalidate()
  }, [selectedColorHex, invalidate])

  return null
}

// ─── RoomShell ───────────────────────────────────────────────────────────────

function RoomShell() {
  const roomLengthMm = usePaintStore((s) => s.roomLengthMm)
  const roomWidthMm = usePaintStore((s) => s.roomWidthMm)
  const wallHeightMm = usePaintStore((s) => s.wallHeightMm)
  const hoveredSurface = usePaintStore((s) => s.hoveredSurface)
  const setHoveredSurface = usePaintStore((s) => s.setHoveredSurface)

  const lengthM = roomLengthMm / 1000
  const widthM = roomWidthMm / 1000
  const heightM = wallHeightMm / 1000

  const walls: Array<{
    id: WallId
    position: [number, number, number]
    size: [number, number, number]
  }> = [
    { id: 'wall-front', position: [lengthM / 2, heightM / 2, 0], size: [lengthM, heightM, 0.01] },
    { id: 'wall-back', position: [lengthM / 2, heightM / 2, widthM], size: [lengthM, heightM, 0.01] },
    { id: 'wall-left', position: [0, heightM / 2, widthM / 2], size: [0.01, heightM, widthM] },
    { id: 'wall-right', position: [lengthM, heightM / 2, widthM / 2], size: [0.01, heightM, widthM] },
  ]

  return (
    <group>
      {walls.map((wall) => (
        <mesh
          key={wall.id}
          position={wall.position}
          onPointerEnter={(e) => {
            e.stopPropagation()
            setHoveredSurface(wall.id)
          }}
          onPointerLeave={(e) => {
            e.stopPropagation()
            setHoveredSurface(null)
          }}
        >
          <boxGeometry args={wall.size} />
          <primitive
            object={
              hoveredSurface === wall.id
                ? CALC_MATERIALS.wallPaintableHover
                : CALC_MATERIALS.wallPaintable
            }
            attach="material"
          />
          <Edges threshold={15} color="#666666" />
        </mesh>
      ))}
    </group>
  )
}

// ─── OpeningCutouts ──────────────────────────────────────────────────────────

function OpeningCutouts() {
  const openings = usePaintStore((s) => s.openings)
  const roomLengthMm = usePaintStore((s) => s.roomLengthMm)
  const roomWidthMm = usePaintStore((s) => s.roomWidthMm)

  const lengthM = roomLengthMm / 1000
  const widthM = roomWidthMm / 1000

  return (
    <group>
      {openings.map((opening) => {
        const oW = opening.widthMm / 1000
        const oH = opening.heightMm / 1000
        const oX = opening.xOffsetMm / 1000
        const oY = opening.yOffsetMm / 1000

        let position: [number, number, number] = [0, 0, 0]

        switch (opening.wallId as WallId) {
          case 'wall-front':
            position = [oX + oW / 2, oY + oH / 2, -0.005]
            break
          case 'wall-back':
            position = [oX + oW / 2, oY + oH / 2, widthM + 0.005]
            break
          case 'wall-left':
            position = [-0.005, oY + oH / 2, oX + oW / 2]
            break
          case 'wall-right':
            position = [lengthM + 0.005, oY + oH / 2, oX + oW / 2]
            break
        }

        // Opening boxes are thin and sit just in front of the wall face
        const isLeftRight = opening.wallId === 'wall-left' || opening.wallId === 'wall-right'
        const size: [number, number, number] = isLeftRight
          ? [0.02, oH, oW]
          : [oW, oH, 0.02]

        return (
          <mesh key={opening.id} position={position}>
            <boxGeometry args={size} />
            <primitive object={CALC_MATERIALS.openingVoid} attach="material" />
          </mesh>
        )
      })}
    </group>
  )
}

// ─── CeilingSurface ──────────────────────────────────────────────────────────

function CeilingSurface() {
  const includeCeiling = usePaintStore((s) => s.includeCeiling)
  const roomLengthMm = usePaintStore((s) => s.roomLengthMm)
  const roomWidthMm = usePaintStore((s) => s.roomWidthMm)
  const wallHeightMm = usePaintStore((s) => s.wallHeightMm)

  if (!includeCeiling) return null

  const lengthM = roomLengthMm / 1000
  const widthM = roomWidthMm / 1000
  const heightM = wallHeightMm / 1000

  return (
    <mesh position={[lengthM / 2, heightM, widthM / 2]}>
      <boxGeometry args={[lengthM, 0.005, widthM]} />
      <primitive object={CALC_MATERIALS.ceilingSurface} attach="material" />
    </mesh>
  )
}

// ─── PaintScene (main export) ────────────────────────────────────────────────

export function PaintScene() {
  const groupRef = useRef<Group>(null)
  useDisposeOnUnmount(groupRef)

  return (
    <group ref={groupRef}>
      <ColorUpdater />
      <RoomShell />
      <OpeningCutouts />
      <CeilingSurface />
    </group>
  )
}
