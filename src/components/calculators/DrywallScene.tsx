'use client'

import { useDrywallStore } from '@/app/calculators/_stores/drywallStore'
import { CALC_MATERIALS } from '@/app/calculators/_lib/calculator-materials'

// ─── StudArray ───────────────────────────────────────────────────────────────

function StudArray() {
  const studPositionsM = useDrywallStore((s) => s.computed.studPositionsM)
  const wallHeightMm = useDrywallStore((s) => s.wallHeightMm)

  const heightM = wallHeightMm / 1000

  if (studPositionsM.length === 0 || heightM <= 0) return null

  return (
    <group>
      {studPositionsM.map((x, i) => (
        <mesh key={i} position={[x, heightM / 2, 0]}>
          <boxGeometry args={[0.05, heightM, 0.04]} />
          <primitive object={CALC_MATERIALS.studMetal} attach="material" />
        </mesh>
      ))}
    </group>
  )
}

// ─── TrackBars ───────────────────────────────────────────────────────────────

function TrackBars() {
  const wallLengthMm = useDrywallStore((s) => s.wallLengthMm)
  const wallHeightMm = useDrywallStore((s) => s.wallHeightMm)
  const openings = useDrywallStore((s) => s.openings)

  const lengthM = wallLengthMm / 1000
  const heightM = wallHeightMm / 1000

  if (lengthM <= 0 || heightM <= 0) return null

  // Bottom track — segmented around floor-level doors
  const floorDoors = openings
    .filter((o) => o.type === 'door' && o.yOffsetMm === 0)
    .map((o) => ({ startM: o.xOffsetMm / 1000, endM: (o.xOffsetMm + o.widthMm) / 1000 }))
    .sort((a, b) => a.startM - b.startM)

  const bottomSegments: Array<{ startM: number; endM: number }> = []
  let cursor = 0
  for (const door of floorDoors) {
    if (door.startM > cursor) {
      bottomSegments.push({ startM: cursor, endM: door.startM })
    }
    cursor = door.endM
  }
  if (cursor < lengthM) {
    bottomSegments.push({ startM: cursor, endM: lengthM })
  }
  if (bottomSegments.length === 0) {
    bottomSegments.push({ startM: 0, endM: lengthM })
  }

  return (
    <group>
      {/* Top track — full length */}
      <mesh position={[lengthM / 2, heightM, 0]}>
        <boxGeometry args={[lengthM, 0.03, 0.05]} />
        <primitive object={CALC_MATERIALS.trackMetal} attach="material" />
      </mesh>

      {/* Bottom track — segmented */}
      {bottomSegments.map((seg, i) => {
        const segLen = seg.endM - seg.startM
        return (
          <mesh key={`btm-${i}`} position={[seg.startM + segLen / 2, 0, 0]}>
            <boxGeometry args={[segLen, 0.03, 0.05]} />
            <primitive object={CALC_MATERIALS.trackMetal} attach="material" />
          </mesh>
        )
      })}
    </group>
  )
}

// ─── HeaderTracks ────────────────────────────────────────────────────────────

function HeaderTracks() {
  const openings = useDrywallStore((s) => s.openings)

  return (
    <group>
      {openings.map((opening) => {
        const xM = (opening.xOffsetMm + opening.widthMm / 2) / 1000
        const yM = (opening.yOffsetMm + opening.heightMm) / 1000
        const wM = (opening.widthMm + 140) / 1000
        return (
          <mesh key={`header-${opening.id}`} position={[xM, yM, 0]}>
            <boxGeometry args={[wM, 0.03, 0.05]} />
            <primitive object={CALC_MATERIALS.headerTrack} attach="material" />
          </mesh>
        )
      })}
    </group>
  )
}

// ─── OpeningFraming ──────────────────────────────────────────────────────────

function OpeningFraming() {
  const openings = useDrywallStore((s) => s.openings)
  const wallHeightMm = useDrywallStore((s) => s.wallHeightMm)

  const heightM = wallHeightMm / 1000

  return (
    <group>
      {openings.map((opening) => {
        const leftX = opening.xOffsetMm / 1000
        const rightX = (opening.xOffsetMm + opening.widthMm) / 1000
        const trimmerH = opening.heightMm / 1000
        const trimmerY = opening.yOffsetMm / 1000 + trimmerH / 2
        return (
          <group key={`framing-${opening.id}`}>
            {/* Left trimmer */}
            <mesh position={[leftX - 0.025, trimmerY, 0]}>
              <boxGeometry args={[0.035, trimmerH, 0.04]} />
              <primitive object={CALC_MATERIALS.studMetal} attach="material" />
            </mesh>
            {/* Right trimmer */}
            <mesh position={[rightX + 0.025, trimmerY, 0]}>
              <boxGeometry args={[0.035, trimmerH, 0.04]} />
              <primitive object={CALC_MATERIALS.studMetal} attach="material" />
            </mesh>
            {/* Left king stud (full height, slightly offset) */}
            <mesh position={[leftX - 0.075, heightM / 2, 0]}>
              <boxGeometry args={[0.035, heightM, 0.04]} />
              <primitive object={CALC_MATERIALS.studMetal} attach="material" />
            </mesh>
            {/* Right king stud */}
            <mesh position={[rightX + 0.075, heightM / 2, 0]}>
              <boxGeometry args={[0.035, heightM, 0.04]} />
              <primitive object={CALC_MATERIALS.studMetal} attach="material" />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}

// ─── OpeningVoids ────────────────────────────────────────────────────────────

function OpeningVoids() {
  const openings = useDrywallStore((s) => s.openings)

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
          <boxGeometry args={[o.widthMm / 1000, o.heightMm / 1000, 0.08]} />
          <primitive object={CALC_MATERIALS.openingVoid} attach="material" />
        </mesh>
      ))}
    </group>
  )
}

// ─── BoardPanels ─────────────────────────────────────────────────────────────

function BoardPanels() {
  const boardPlacements = useDrywallStore((s) => s.computed.boardPlacements)
  const drywallViewMode = useDrywallStore((s) => s.drywallViewMode)

  if (drywallViewMode !== 'boarded' || boardPlacements.length === 0) return null

  return (
    <group>
      {boardPlacements.map((p) => {
        const zOffset = p.face === 'front' ? 0.03 : -0.03
        const material = p.isCut
          ? CALC_MATERIALS.boardCut
          : p.face === 'front'
            ? CALC_MATERIALS.boardFront
            : CALC_MATERIALS.boardBack

        return (
          <mesh
            key={p.id}
            position={[p.xM + p.wM / 2, p.yM + p.hM / 2, zOffset]}
          >
            <boxGeometry args={[p.wM, p.hM, 0.012]} />
            <primitive object={material} attach="material" />
          </mesh>
        )
      })}
    </group>
  )
}

// ─── Main Export ─────────────────────────────────────────────────────────────

export function DrywallScene() {
  return (
    <group>
      <StudArray />
      <TrackBars />
      <HeaderTracks />
      <OpeningFraming />
      <OpeningVoids />
      <BoardPanels />
    </group>
  )
}
