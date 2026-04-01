'use client'

import { useMemo, useEffect } from 'react'
import { Line } from '@react-three/drei'
import * as THREE from 'three'
import { useDevControlsStore } from '../../stores/useDevControlsStore'
import { useLotStore } from '../../stores/useLotStore'
import { GEOMETRY_Y, COLOR, OPACITY } from '../constants'
import { computeSetbackInsetPolygon } from '@/lib/lot-geometry/inset'
import { buildRectangularPolygon } from '@/lib/lot-geometry/polygon'
import { polygonToPositions } from '@/lib/lot-geometry/polygonGeometry'
import type { LotVertex } from '@/types/lot'

// ─── Unified development controls for both rectangle and surveyor modes ─────
// Builds polygon from active lot source: useLotStore for surveyor, useDevControlsStore for rectangle.
// All layers (setbacks, AMBF, floor slabs, BHL, FLAR) derive shape from this polygon.

export function PolygonDevControls() {
  const lotMode = useLotStore((s) => s.mode)
  const surveyorPolygon = useLotStore((s) => s.computedPolygon)
  const lotW = useDevControlsStore((s) => s.lot.width)
  const lotD = useDevControlsStore((s) => s.lot.depth)
  // Extract individual setback values to avoid stale object reference issues
  const sbFront = useDevControlsStore((s) => s.result.setbacks.effective.front)
  const sbRear = useDevControlsStore((s) => s.result.setbacks.effective.rear)
  const sbLeft = useDevControlsStore((s) => s.result.setbacks.effective.left)
  const sbRight = useDevControlsStore((s) => s.result.setbacks.effective.right)
  const bhlMeters = useDevControlsStore((s) => s.result.bhlMeters)
  const bhlStoreys = useDevControlsStore((s) => s.result.bhlStoreys)
  const floors = useDevControlsStore((s) => s.building.proposedStoreys)
  const floorH = useDevControlsStore((s) => s.building.floorHeight)
  const maxFloors = useDevControlsStore((s) => s.result.maxCompliantFloors)
  const visibleLayers = useDevControlsStore((s) => s.visibleLayers)

  // Build the active polygon from the correct source
  const polygon = useMemo(() => {
    if (lotMode === 'surveyor' && surveyorPolygon && surveyorPolygon.vertices.length >= 3) {
      return surveyorPolygon
    }
    return buildRectangularPolygon(lotW, lotD)
  }, [lotMode, surveyorPolygon, lotW, lotD])

  // Compute the inset (buildable) polygon from lot polygon minus setbacks
  const insetData = useMemo(() => {
    if (polygon.vertices.length < 3) return null
    return computeSetbackInsetPolygon(polygon, {
      front: sbFront,
      rear: sbRear,
      left: sbLeft,
      right: sbRight,
    })
  }, [polygon, sbFront, sbRear, sbLeft, sbRight])

  if (polygon.vertices.length < 3 || !insetData || insetData.vertices.length < 3) {
    return null
  }

  const lotVerts = polygon.vertices
  const insetVerts = insetData.vertices

  return (
    <group>
      {/* Setback zone — filled area between lot boundary and inset polygon */}
      {visibleLayers.has('setbacks') && (
        <PolygonSetbackOverlay lotVerts={lotVerts} insetVerts={insetVerts} />
      )}

      {/* AMBF footprint — the inset polygon at ground level */}
      {visibleLayers.has('ambf') && (
        <PolygonFootprint vertices={insetVerts} />
      )}

      {/* Buildable envelope — inset polygon extruded to BHL */}
      {visibleLayers.has('ambf') && (
        <PolygonEnvelope vertices={insetVerts} height={bhlMeters} />
      )}

      {/* Floor slabs — inset polygon at each storey */}
      {visibleLayers.has('floors') && (
        <PolygonFloorSlabs
          vertices={insetVerts}
          floors={floors}
          floorHeight={floorH}
          maxCompliantFloors={maxFloors}
          bhlStoreys={bhlStoreys}
        />
      )}

      {/* BHL ceiling — lot-wide polygon at height limit */}
      {visibleLayers.has('bhl') && (
        <PolygonCeiling
          vertices={lotVerts}
          height={bhlMeters}
          color="#E8853A"
          borderColor="#D64545"
          opacity={0.22}
        />
      )}

      {/* FLAR ceiling — inset polygon at max compliant height */}
      {visibleLayers.has('flar') && (
        <PolygonCeiling
          vertices={insetVerts}
          height={Math.min(maxFloors * floorH, bhlMeters)}
          color={floors > maxFloors ? '#D4951A' : '#2D9F6F'}
          borderColor={floors > maxFloors ? '#D4951A' : '#2D9F6F'}
          opacity={0.18}
          dashed
        />
      )}
    </group>
  )
}

// ─── Setback overlay — difference between lot and inset polygons ────────────

function PolygonSetbackOverlay({ lotVerts, insetVerts }: { lotVerts: LotVertex[]; insetVerts: LotVertex[] }) {
  // Render the full lot polygon with setback tint, then overlay the inset as a cutout
  // Simpler approach: render the lot polygon as setback-colored, then the inset on top as lot-colored
  const lotGeo = useMemo(() => {
    const positions = polygonToPositions(lotVerts, GEOMETRY_Y.SETBACK_ZONE)
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    geo.computeVertexNormals()
    return geo
  }, [lotVerts])
  useEffect(() => () => { lotGeo.dispose() }, [lotGeo])

  return (
    <mesh geometry={lotGeo}>
      <meshStandardMaterial
        color={COLOR.SETBACK}
        transparent
        opacity={OPACITY.SETBACK_ZONE}
        side={THREE.DoubleSide}
        depthWrite={false}
        polygonOffset
        polygonOffsetFactor={-1}
        polygonOffsetUnits={-1}
      />
    </mesh>
  )
}

// ─── AMBF footprint — inset polygon at ground level ─────────────────────────

function PolygonFootprint({ vertices }: { vertices: LotVertex[] }) {
  const geo = useMemo(() => {
    const positions = polygonToPositions(vertices, GEOMETRY_Y.AMBF_FOOTPRINT)
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    g.computeVertexNormals()
    return g
  }, [vertices])
  useEffect(() => () => { geo.dispose() }, [geo])

  const perimeterPoints = useMemo(() => {
    const y = GEOMETRY_Y.AMBF_FOOTPRINT + 0.001
    return [...vertices.map(v => new THREE.Vector3(v.x, y, v.z)), new THREE.Vector3(vertices[0].x, y, vertices[0].z)]
  }, [vertices])

  return (
    <group>
      <mesh geometry={geo}>
        <meshStandardMaterial
          color={COLOR.AMBF_BINDING}
          transparent
          opacity={0.20}
          side={THREE.DoubleSide}
          depthWrite={false}
          polygonOffset
          polygonOffsetFactor={-5}
          polygonOffsetUnits={-5}
        />
      </mesh>
      <Line points={perimeterPoints} color={COLOR.AMBF_BINDING} lineWidth={2} />
    </group>
  )
}

// ─── Buildable envelope — transparent volume ────────────────────────────────

function PolygonEnvelope({ vertices, height }: { vertices: LotVertex[]; height: number }) {
  // Top cap
  const topGeo = useMemo(() => {
    const positions = polygonToPositions(vertices, GEOMETRY_Y.BUILDING_BASE + height)
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    g.computeVertexNormals()
    return g
  }, [vertices, height])
  useEffect(() => () => { topGeo.dispose() }, [topGeo])

  // Vertical edges
  const edgeLines = useMemo(() => {
    const baseY = GEOMETRY_Y.BUILDING_BASE
    const topY = baseY + height
    return vertices.map((v, i) => [
      new THREE.Vector3(v.x, baseY, v.z),
      new THREE.Vector3(v.x, topY, v.z),
    ] as [THREE.Vector3, THREE.Vector3])
  }, [vertices, height])

  const topPerimeter = useMemo(() => {
    const y = GEOMETRY_Y.BUILDING_BASE + height
    return [...vertices.map(v => new THREE.Vector3(v.x, y, v.z)), new THREE.Vector3(vertices[0].x, y, vertices[0].z)]
  }, [vertices, height])

  return (
    <group>
      <mesh geometry={topGeo}>
        <meshStandardMaterial
          color={COLOR.AMBF_BINDING}
          transparent
          opacity={OPACITY.AMBF_BINDING}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      <Line points={topPerimeter} color="#FFFFFF" lineWidth={1.5} />
      {edgeLines.map((pair, i) => (
        <Line key={i} points={pair} color="#FFFFFF" lineWidth={1} dashed dashSize={0.4} gapSize={0.3} />
      ))}
    </group>
  )
}

// ─── Floor slabs — polygon at each storey ───────────────────────────────────

function PolygonFloorSlabs({ vertices, floors, floorHeight, maxCompliantFloors, bhlStoreys }: {
  vertices: LotVertex[]; floors: number; floorHeight: number; maxCompliantFloors: number; bhlStoreys: number
}) {
  const slabGeos = useMemo(() => {
    return Array.from({ length: Math.min(floors, 50) }, (_, i) => {
      const y = GEOMETRY_Y.BUILDING_BASE + i * floorHeight + 0.075
      const positions = polygonToPositions(vertices, y)
      const g = new THREE.BufferGeometry()
      g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
      g.computeVertexNormals()
      return { geo: g, floorNum: i + 1 }
    })
  }, [vertices, floors, floorHeight])
  useEffect(() => () => { slabGeos.forEach(s => s.geo.dispose()) }, [slabGeos])

  return (
    <group>
      {slabGeos.map(({ geo, floorNum }) => {
        const isFlarViolation = floorNum > maxCompliantFloors
        const isBhlViolation = floorNum > bhlStoreys
        let color: string = COLOR.BUILDING
        let opacity: number = OPACITY.FLOOR_SLAB
        if (isBhlViolation) { color = '#D64545'; opacity = 0.55 }
        else if (isFlarViolation) { color = '#D4951A'; opacity = 0.60 }

        return (
          <mesh key={floorNum} geometry={geo} castShadow receiveShadow>
            <meshStandardMaterial color={color} transparent opacity={opacity} roughness={0.8} metalness={0.05} />
          </mesh>
        )
      })}
    </group>
  )
}

// ─── Polygon ceiling (BHL or FLAR) ──────────────────────────────────────────

function PolygonCeiling({ vertices, height, color, borderColor, opacity, dashed }: {
  vertices: LotVertex[]; height: number; color: string; borderColor: string; opacity: number; dashed?: boolean
}) {
  const y = GEOMETRY_Y.BUILDING_BASE + height

  const geo = useMemo(() => {
    const positions = polygonToPositions(vertices, y)
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    g.computeVertexNormals()
    return g
  }, [vertices, y])
  useEffect(() => () => { geo.dispose() }, [geo])

  const perimeterPoints = useMemo(() =>
    [...vertices.map(v => new THREE.Vector3(v.x, y, v.z)), new THREE.Vector3(vertices[0].x, y, vertices[0].z)]
  , [vertices, y])

  return (
    <group>
      <mesh geometry={geo}>
        <meshStandardMaterial color={color} transparent opacity={opacity} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <Line
        points={perimeterPoints}
        color={borderColor}
        lineWidth={1.5}
        {...(dashed ? { dashed: true, dashSize: 0.6, gapSize: 0.4 } : {})}
      />
    </group>
  )
}
