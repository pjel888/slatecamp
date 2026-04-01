'use client'

import { useMemo, useEffect } from 'react'
import { Line } from '@react-three/drei'
import * as THREE from 'three'
import { useDevControlsStore } from '../../stores/useDevControlsStore'
import { useLotStore } from '../../stores/useLotStore'
import { useSelectionStore } from '../../stores/useSelectionStore'
import { GEOMETRY_Y, COLOR } from '../constants'
import { CITATIONS } from '@/lib/pd1096/zoningTables'
import { BOUNDARY_TAG_COLORS } from '@/types/lot'

export function LotGround() {
  const lotW = useDevControlsStore((s) => s.lot.width)
  const lotD = useDevControlsStore((s) => s.lot.depth)
  const tla = useDevControlsStore((s) => s.result.tla)
  const setSelection = useSelectionStore((s) => s.setSelection)
  const lotMode = useLotStore((s) => s.mode)
  const polygon = useLotStore((s) => s.computedPolygon)

  const handleClick = (e: { stopPropagation: () => void }) => {
    e.stopPropagation()
    setSelection('lot-ground', {
      objectId: 'lot-ground',
      layerType: 'lot',
      displayName: 'Total Lot Area (TLA)',
      codeReference: CITATIONS.tla,
      computedValues: {
        'TLA': `${tla.toFixed(1)} sqm`,
        'Mode': lotMode === 'rectangle' ? 'Basic Lot' : 'Surveyor Plot',
        ...(lotMode === 'rectangle'
          ? { 'Width': `${lotW.toFixed(1)} m`, 'Depth': `${lotD.toFixed(1)} m` }
          : { 'Perimeter': `${polygon?.perimeter.toFixed(1) ?? 0} m`, 'Segments': `${polygon?.edges.length ?? 0}` }
        ),
      },
      violations: [],
    })
  }

  if (lotMode === 'surveyor' && polygon && polygon.vertices.length >= 3) {
    return <PolygonLotGround polygon={polygon} onClick={handleClick} />
  }

  return <RectangularLotGround lotW={lotW} lotD={lotD} onClick={handleClick} />
}

// ─── Rectangular Lot (existing behavior) ────────────────────────────────────

function RectangularLotGround({ lotW, lotD, onClick }: {
  lotW: number; lotD: number; onClick: (e: { stopPropagation: () => void }) => void
}) {
  const boundaryPoints = useMemo(() => [
    new THREE.Vector3(0, GEOMETRY_Y.LOT_SURFACE + 0.001, 0),
    new THREE.Vector3(lotW, GEOMETRY_Y.LOT_SURFACE + 0.001, 0),
    new THREE.Vector3(lotW, GEOMETRY_Y.LOT_SURFACE + 0.001, lotD),
    new THREE.Vector3(0, GEOMETRY_Y.LOT_SURFACE + 0.001, lotD),
    new THREE.Vector3(0, GEOMETRY_Y.LOT_SURFACE + 0.001, 0),
  ], [lotW, lotD])

  return (
    <group>
      <mesh
        position={[lotW / 2, GEOMETRY_Y.LOT_SURFACE, lotD / 2]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
        onClick={onClick}
      >
        <planeGeometry args={[lotW, lotD]} />
        <meshStandardMaterial color={COLOR.LOT_SURFACE} roughness={0.9} metalness={0} />
      </mesh>
      <Line points={boundaryPoints} color="#4A5568" lineWidth={1.5} dashed dashSize={0.5} gapSize={0.3} />
    </group>
  )
}

// ─── Polygon Lot (surveyor mode) ────────────────────────────────────────────

function PolygonLotGround({ polygon, onClick }: {
  polygon: NonNullable<ReturnType<typeof useLotStore.getState>['computedPolygon']>
  onClick: (e: { stopPropagation: () => void }) => void
}) {
  // Build BufferGeometry directly in XZ plane (no rotation needed).
  // THREE.Shape + rotation causes mirroring artifacts — avoid entirely.
  // Fan triangulation from vertex 0 (works for convex; acceptable for typical lots).
  const geometry = useMemo(() => {
    const verts = polygon.vertices
    const N = verts.length
    if (N < 3) return new THREE.BufferGeometry()

    // Fan triangulation: triangle(0, i, i+1) for i = 1..N-2
    const positions: number[] = []
    const y = 0 // geometry is positioned via mesh.position.y
    for (let i = 1; i < N - 1; i++) {
      positions.push(verts[0].x, y, verts[0].z)
      positions.push(verts[i].x, y, verts[i].z)
      positions.push(verts[i + 1].x, y, verts[i + 1].z)
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    geo.computeVertexNormals()
    return geo
  }, [polygon.vertices])
  useEffect(() => () => { geometry.dispose() }, [geometry])

  // Color-coded boundary edges per boundary tag
  const edgeLines = useMemo(() => {
    const y = GEOMETRY_Y.LOT_SURFACE + 0.002
    return polygon.edges.map((edge) => ({
      points: [
        new THREE.Vector3(edge.from.x, y, edge.from.z),
        new THREE.Vector3(edge.to.x, y, edge.to.z),
      ],
      color: BOUNDARY_TAG_COLORS[edge.boundaryTag],
      key: edge.segmentId,
    }))
  }, [polygon.edges])

  // Closure gap line (if not closed)
  const gapLine = useMemo(() => {
    if (polygon.closure.isClosed) return null
    const y = GEOMETRY_Y.LOT_SURFACE + 0.003
    const last = polygon.vertices[polygon.vertices.length - 1]
    return [
      new THREE.Vector3(last.x, y, last.z),
      new THREE.Vector3(0, y, 0), // back to origin
    ]
  }, [polygon.vertices, polygon.closure.isClosed])

  return (
    <group>
      {/* Polygon surface — ShapeGeometry rendered flat on XZ plane */}
      {/* No rotation — geometry is built directly in XZ plane */}
      <mesh
        geometry={geometry}
        position={[0, GEOMETRY_Y.LOT_SURFACE, 0]}
        receiveShadow
        onClick={onClick}
      >
        <meshStandardMaterial color={COLOR.LOT_SURFACE} roughness={0.9} metalness={0} />
      </mesh>

      {/* Color-coded boundary edges */}
      {edgeLines.map((edge) => (
        <Line key={edge.key} points={edge.points} color={edge.color} lineWidth={2} />
      ))}

      {/* Closure gap (dashed red) — visible when polygon doesn't close */}
      {gapLine && (
        <Line points={gapLine} color="#D64545" lineWidth={1.5} dashed dashSize={0.3} gapSize={0.2} />
      )}
    </group>
  )
}
