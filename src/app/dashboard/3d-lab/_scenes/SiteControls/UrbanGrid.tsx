'use client'

import { useMemo } from 'react'
import * as THREE from 'three'

// ============================================================================
// URBAN GRID CONSTANTS — Derived from Master Spatial Plan
// ============================================================================

// Y-axis hierarchy (prevents Z-fighting absolutely)
const Y_TERRAIN = 0.0
const Y_ROAD = 0.05
const Y_SIDEWALK = 0.10
const Y_BUILDING = 0.15

// Grid dimensions (meters, 1 unit = 1 meter in scene space)
const GRID_EXTENT = 500 // half-width of 1km grid = 500m from center

// Central core
const PLAZA_SIZE = 150 // 150m x 150m pedestrian-exclusive superblock
const MAIN_BUILDING_HEIGHT = 45 // taller than any ring building
const MAIN_BUILDING_RADIUS = 20 // cylindrical main building

// Primary arterials (The Grand Cross) — 32m ROW
const PRIMARY_ROW = 32
const PRIMARY_MEDIAN = 8
const PRIMARY_VEHICLE = 7 // per direction (2 x 3.5m lanes)
const PRIMARY_BIKE = 4 // per direction (2 x 2m bike lanes)
const PRIMARY_SIDEWALK = 6.5 // per side

// Secondary grid streets — 18m ROW
const SECONDARY_ROW = 18
const SECONDARY_VEHICLE = 6 // two 3m lanes
const SECONDARY_CURBSIDE = 2.5
const SECONDARY_SIDEWALK = 4.75 // per side

// Block dimensions
const BLOCK_SIZE = 80 // 80m x 80m walkable blocks
const BLOCK_STEP = BLOCK_SIZE + SECONDARY_ROW // 98m center-to-center

// Zoning rings (amphitheater effect)
const RING_1_RADIUS = PLAZA_SIZE / 2 + BLOCK_STEP // ~175m
const RING_2_RADIUS = RING_1_RADIUS + BLOCK_STEP * 2 // ~371m
// Ring 3 = everything beyond Ring 2

const RING_1_HEIGHT = 12 // 3 stories
const RING_2_HEIGHT = 20 // 5 stories
const RING_3_MIN = 28 // 8 stories
const RING_3_MAX = 40 // 10 stories

// Colors
const COLOR_TERRAIN = '#8B9467' // muted green base
const COLOR_ROAD_PRIMARY = '#3A3A3A' // dark asphalt
const COLOR_ROAD_SECONDARY = '#4A4A4A' // slightly lighter
const COLOR_SIDEWALK = '#C8C4BC' // warm concrete
const COLOR_PLAZA = '#D4CFC4' // warm stone (matches SlateCamp ground)
const COLOR_MEDIAN = '#5D7A3A' // landscaped median
const COLOR_MAIN_BUILDING = '#1B3FC4' // SlateCamp cobalt
const COLOR_RING_1 = '#EDEAE4' // ghost white
const COLOR_RING_2 = '#E0DDD6'
const COLOR_RING_3 = '#D5D0C8'

// ============================================================================
// HELPER: Get building height based on distance from center
// ============================================================================

function getBuildingHeight(x: number, z: number): number {
  const dist = Math.sqrt(x * x + z * z)
  if (dist < RING_1_RADIUS) return RING_1_HEIGHT
  if (dist < RING_2_RADIUS) return RING_2_HEIGHT
  // Ring 3: interpolate between min and max based on distance
  const t = Math.min(1, (dist - RING_2_RADIUS) / (GRID_EXTENT - RING_2_RADIUS))
  return RING_3_MIN + (RING_3_MAX - RING_3_MIN) * t
}

function getBuildingColor(x: number, z: number): string {
  const dist = Math.sqrt(x * x + z * z)
  if (dist < RING_1_RADIUS) return COLOR_RING_1
  if (dist < RING_2_RADIUS) return COLOR_RING_2
  return COLOR_RING_3
}

// ============================================================================
// HELPER: Check if a position conflicts with primary arterials or plaza
// ============================================================================

function isInsidePrimaryArterial(x: number, z: number): boolean {
  // Primary arterials run through center along X and Z axes
  // Each is PRIMARY_ROW/2 = 16m from center axis
  return Math.abs(x) < PRIMARY_ROW / 2 || Math.abs(z) < PRIMARY_ROW / 2
}

function isInsidePlaza(x: number, z: number): boolean {
  return Math.abs(x) < PLAZA_SIZE / 2 && Math.abs(z) < PLAZA_SIZE / 2
}

// ============================================================================
// PROCEDURAL BLOCK GENERATION
// ============================================================================

interface BlockData {
  x: number
  z: number
  height: number
  color: string
  width: number
  depth: number
}

function generateBlocks(): BlockData[] {
  const blocks: BlockData[] = []

  // Generate blocks on the grid, stepping by BLOCK_STEP
  // Start from -GRID_EXTENT, step by BLOCK_STEP
  for (let bx = -GRID_EXTENT + BLOCK_SIZE / 2; bx < GRID_EXTENT; bx += BLOCK_STEP) {
    for (let bz = -GRID_EXTENT + BLOCK_SIZE / 2; bz < GRID_EXTENT; bz += BLOCK_STEP) {
      // Skip if this block center falls inside the plaza zone
      if (isInsidePlaza(bx, bz)) continue

      // Skip if this block overlaps a primary arterial
      // Check all four corners of the block
      const halfBlock = BLOCK_SIZE / 2
      const corners = [
        [bx - halfBlock, bz - halfBlock],
        [bx + halfBlock, bz - halfBlock],
        [bx - halfBlock, bz + halfBlock],
        [bx + halfBlock, bz + halfBlock],
      ]
      const overlapsArterial = corners.some(([cx, cz]) =>
        Math.abs(cx) < PRIMARY_ROW / 2 + 2 || Math.abs(cz) < PRIMARY_ROW / 2 + 2
      )
      if (overlapsArterial) continue

      // Subdivide block into lots (4 x 2 = 8 lots per block, 20m x 40m each)
      const lotW = 20
      const lotD = 40
      const lotsPerRow = Math.floor(BLOCK_SIZE / lotW) // 4
      const lotsPerCol = Math.floor(BLOCK_SIZE / lotD) // 2
      const lotSetback = 3 // setback from lot edge

      for (let lx = 0; lx < lotsPerRow; lx++) {
        for (let lz = 0; lz < lotsPerCol; lz++) {
          const lotCenterX = bx - halfBlock + lotW / 2 + lx * lotW
          const lotCenterZ = bz - halfBlock + lotD / 2 + lz * lotD

          // Building sits inside the lot with setbacks
          const buildW = lotW - lotSetback * 2 // 14m
          const buildD = lotD - lotSetback * 2 // 34m

          // Vary building footprint slightly for visual interest
          const seed = Math.abs(Math.sin(lotCenterX * 0.1 + lotCenterZ * 0.13))
          const variedW = buildW * (0.7 + seed * 0.3)
          const variedD = buildD * (0.6 + seed * 0.4)

          const height = getBuildingHeight(lotCenterX, lotCenterZ)
          // Slight height variation within the ring
          const variedHeight = height * (0.75 + seed * 0.25)

          blocks.push({
            x: lotCenterX,
            z: lotCenterZ,
            height: variedHeight,
            color: getBuildingColor(lotCenterX, lotCenterZ),
            width: variedW,
            depth: variedD,
          })
        }
      }
    }
  }

  return blocks
}

// ============================================================================
// SECONDARY STREET SEGMENTS
// ============================================================================

interface StreetSegment {
  x: number
  z: number
  width: number
  depth: number
  color: string
  y: number
}

function generateStreets(): StreetSegment[] {
  const streets: StreetSegment[] = []

  // Secondary streets run between blocks
  for (let pos = -GRID_EXTENT; pos < GRID_EXTENT; pos += BLOCK_STEP) {
    // Skip streets that overlap primary arterials
    if (Math.abs(pos) < PRIMARY_ROW / 2 + SECONDARY_ROW) continue

    // Horizontal street (runs along X, at z = pos)
    streets.push({
      x: 0,
      z: pos,
      width: GRID_EXTENT * 2,
      depth: SECONDARY_VEHICLE,
      color: COLOR_ROAD_SECONDARY,
      y: Y_ROAD,
    })
    // Sidewalks for horizontal street
    streets.push({
      x: 0,
      z: pos - SECONDARY_VEHICLE / 2 - SECONDARY_SIDEWALK / 2,
      width: GRID_EXTENT * 2,
      depth: SECONDARY_SIDEWALK,
      color: COLOR_SIDEWALK,
      y: Y_SIDEWALK,
    })
    streets.push({
      x: 0,
      z: pos + SECONDARY_VEHICLE / 2 + SECONDARY_SIDEWALK / 2,
      width: GRID_EXTENT * 2,
      depth: SECONDARY_SIDEWALK,
      color: COLOR_SIDEWALK,
      y: Y_SIDEWALK,
    })

    // Vertical street (runs along Z, at x = pos)
    streets.push({
      x: pos,
      z: 0,
      width: SECONDARY_VEHICLE,
      depth: GRID_EXTENT * 2,
      color: COLOR_ROAD_SECONDARY,
      y: Y_ROAD,
    })
    // Sidewalks for vertical street
    streets.push({
      x: pos - SECONDARY_VEHICLE / 2 - SECONDARY_SIDEWALK / 2,
      z: 0,
      width: SECONDARY_SIDEWALK,
      depth: GRID_EXTENT * 2,
      color: COLOR_SIDEWALK,
      y: Y_SIDEWALK,
    })
    streets.push({
      x: pos + SECONDARY_VEHICLE / 2 + SECONDARY_SIDEWALK / 2,
      z: 0,
      width: SECONDARY_SIDEWALK,
      depth: GRID_EXTENT * 2,
      color: COLOR_SIDEWALK,
      y: Y_SIDEWALK,
    })
  }

  return streets
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function UrbanGrid() {
  const blocks = useMemo(() => generateBlocks(), [])
  const streets = useMemo(() => generateStreets(), [])

  return (
    <group>
      {/* ── Layer 0: Terrain base ─────────────────────────────────────── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, Y_TERRAIN, 0]}>
        <planeGeometry args={[GRID_EXTENT * 2.2, GRID_EXTENT * 2.2]} />
        <meshStandardMaterial color={COLOR_TERRAIN} roughness={0.95} />
      </mesh>

      {/* ── Layer 1: Primary Arterials (The Grand Cross) ──────────────── */}
      {/* North-South arterial (along Z axis) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, Y_ROAD, 0]}>
        <planeGeometry args={[PRIMARY_ROW, GRID_EXTENT * 2.2]} />
        <meshStandardMaterial color={COLOR_ROAD_PRIMARY} roughness={0.85} />
      </mesh>
      {/* East-West arterial (along X axis) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, Y_ROAD + 0.001, 0]}>
        <planeGeometry args={[GRID_EXTENT * 2.2, PRIMARY_ROW]} />
        <meshStandardMaterial color={COLOR_ROAD_PRIMARY} roughness={0.85} />
      </mesh>

      {/* Primary arterial medians (landscaped center strip) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, Y_ROAD + 0.01, 0]}>
        <planeGeometry args={[PRIMARY_MEDIAN, GRID_EXTENT * 2.2]} />
        <meshStandardMaterial color={COLOR_MEDIAN} roughness={0.9} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, Y_ROAD + 0.011, 0]}>
        <planeGeometry args={[GRID_EXTENT * 2.2, PRIMARY_MEDIAN]} />
        <meshStandardMaterial color={COLOR_MEDIAN} roughness={0.9} />
      </mesh>

      {/* Primary arterial sidewalks (6.5m each side) */}
      {[-1, 1].map((dir) => (
        <group key={`primary-sw-${dir}`}>
          {/* Along Z axis */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[dir * (PRIMARY_ROW / 2 - PRIMARY_SIDEWALK / 2), Y_SIDEWALK, 0]}>
            <planeGeometry args={[PRIMARY_SIDEWALK, GRID_EXTENT * 2.2]} />
            <meshStandardMaterial color={COLOR_SIDEWALK} roughness={0.92} />
          </mesh>
          {/* Along X axis */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, Y_SIDEWALK + 0.001, dir * (PRIMARY_ROW / 2 - PRIMARY_SIDEWALK / 2)]}>
            <planeGeometry args={[GRID_EXTENT * 2.2, PRIMARY_SIDEWALK]} />
            <meshStandardMaterial color={COLOR_SIDEWALK} roughness={0.92} />
          </mesh>
        </group>
      ))}

      {/* ── Layer 1.5: Secondary Street Network ───────────────────────── */}
      {streets.map((s, i) => (
        <mesh key={`street-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[s.x, s.y, s.z]}>
          <planeGeometry args={[s.width, s.depth]} />
          <meshStandardMaterial color={s.color} roughness={0.9} />
        </mesh>
      ))}

      {/* ── Layer 2: Central Plaza (150m x 150m) ──────────────────────── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, Y_SIDEWALK + 0.01, 0]}>
        <planeGeometry args={[PLAZA_SIZE, PLAZA_SIZE]} />
        <meshStandardMaterial color={COLOR_PLAZA} roughness={0.88} />
      </mesh>

      {/* ── Layer 3: Main Building (cylinder at center) ────────────────── */}
      <mesh position={[0, Y_BUILDING + MAIN_BUILDING_HEIGHT / 2, 0]} castShadow>
        <cylinderGeometry args={[MAIN_BUILDING_RADIUS, MAIN_BUILDING_RADIUS * 1.1, MAIN_BUILDING_HEIGHT, 32]} />
        <meshStandardMaterial
          color={COLOR_MAIN_BUILDING}
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>
      {/* Main building podium */}
      <mesh position={[0, Y_BUILDING + 3, 0]} castShadow>
        <boxGeometry args={[50, 6, 50]} />
        <meshStandardMaterial color={COLOR_MAIN_BUILDING} roughness={0.4} metalness={0.05} />
      </mesh>

      {/* ── Layer 3: Procedurally Generated Buildings ──────────────────── */}
      {blocks.map((b, i) => (
        <mesh
          key={`bldg-${i}`}
          position={[b.x, Y_BUILDING + b.height / 2, b.z]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[b.width, b.height, b.depth]} />
          <meshStandardMaterial color={b.color} roughness={0.85} />
        </mesh>
      ))}
    </group>
  )
}
