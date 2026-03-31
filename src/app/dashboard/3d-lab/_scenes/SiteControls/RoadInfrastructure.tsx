'use client'

import { Line } from '@react-three/drei'
import { useSiteControlsStore } from '../../_stores/siteControlsStore'

/**
 * Road, sidewalks, and utility strips around the lot.
 *
 * Philippine RROW layout per PD 1096:
 * |-- sidewalk --|-- carriageway --|-- sidewalk --|
 *
 * Roads are clipped to the lot frontage width only (no overshoot into side lots).
 * Side streets run perpendicular, connecting front and rear roads.
 */
export function RoadInfrastructure() {
  const lotWidth = useSiteControlsStore((s) => s.inputs.lotWidth)
  const lotDepth = useSiteControlsStore((s) => s.inputs.lotDepth)
  const rrowWidth = useSiteControlsStore((s) => s.inputs.rrowWidth)

  const sidewalkW = rrowWidth <= 8 ? 1.0 : rrowWidth <= 12 ? 1.5 : rrowWidth <= 18 ? 2.0 : 2.5
  const carriageway = rrowWidth - sidewalkW * 2

  const cx = lotWidth / 2
  const yRoad = -0.002
  const ySidewalk = 0.003
  const yLine = 0.005

  // Side street width (narrower access road)
  const sideStreetW = 6
  const sideSwW = 1 // side street sidewalk
  const sideCarriageway = sideStreetW - sideSwW * 2 // 4m

  // Extents: roads run from side street to side street
  // Side streets are at the edges of the lot
  const sideStreetLeftCenter = -(sideStreetW / 2)
  const sideStreetRightCenter = lotWidth + sideStreetW / 2

  // Front road length = lot width + both side streets
  const frontRoadLen = lotWidth + sideStreetW * 2

  // Front road Z positions
  const nearSwZ = -(sidewalkW / 2)
  const roadZ = -(sidewalkW + carriageway / 2)
  const farSwZ = -(sidewalkW + carriageway + sidewalkW / 2)

  // Rear road (narrower, 6m RROW: 1m sw + 4m road + 1m sw)
  const rearNearSwZ = lotDepth + sideSwW / 2
  const rearRoadZ = lotDepth + sideSwW + sideCarriageway / 2
  const rearFarSwZ = lotDepth + sideSwW + sideCarriageway + sideSwW / 2
  const rearRoadLen = frontRoadLen

  // Side streets run from front far sidewalk to rear far sidewalk
  const sideStreetLen = lotDepth + rrowWidth + sideStreetW + 2
  const sideStreetCenterZ = lotDepth / 2

  return (
    <group>
      {/* ── FRONT ROAD (main, wider RROW) ────────────────────────────── */}
      {/* Near sidewalk */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[cx, ySidewalk, nearSwZ]}>
        <planeGeometry args={[frontRoadLen, sidewalkW]} />
        <meshStandardMaterial color="#C8C4BC" roughness={0.95} />
      </mesh>
      {/* Carriageway */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[cx, yRoad, roadZ]}>
        <planeGeometry args={[frontRoadLen, carriageway]} />
        <meshStandardMaterial color="#4A4A4A" roughness={0.85} />
      </mesh>
      {/* Far sidewalk */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[cx, ySidewalk, farSwZ]}>
        <planeGeometry args={[frontRoadLen, sidewalkW]} />
        <meshStandardMaterial color="#C8C4BC" roughness={0.95} />
      </mesh>
      {/* Center line */}
      <Line
        points={[[cx - frontRoadLen / 2, yLine, roadZ], [cx + frontRoadLen / 2, yLine, roadZ]]}
        color="#F5A623" lineWidth={1} dashed dashSize={1.5} gapSize={1.0}
      />
      {/* Curb lines */}
      <Line points={[[cx - frontRoadLen / 2, yLine, 0], [cx + frontRoadLen / 2, yLine, 0]]} color="#9CA3AF" lineWidth={1} />
      <Line points={[[cx - frontRoadLen / 2, yLine, -sidewalkW], [cx + frontRoadLen / 2, yLine, -sidewalkW]]} color="#9CA3AF" lineWidth={0.5} />
      <Line points={[[cx - frontRoadLen / 2, yLine, -(sidewalkW + carriageway)], [cx + frontRoadLen / 2, yLine, -(sidewalkW + carriageway)]]} color="#9CA3AF" lineWidth={0.5} />

      {/* ── REAR ROAD (narrower access) ──────────────────────────────── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[cx, ySidewalk, rearNearSwZ]}>
        <planeGeometry args={[rearRoadLen, sideSwW]} />
        <meshStandardMaterial color="#C8C4BC" roughness={0.95} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[cx, yRoad, rearRoadZ]}>
        <planeGeometry args={[rearRoadLen, sideCarriageway]} />
        <meshStandardMaterial color="#5A5A5A" roughness={0.9} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[cx, ySidewalk, rearFarSwZ]}>
        <planeGeometry args={[rearRoadLen, sideSwW]} />
        <meshStandardMaterial color="#C8C4BC" roughness={0.95} />
      </mesh>

      {/* ── LEFT SIDE STREET ─────────────────────────────────────────── */}
      {/* Sidewalk left */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[sideStreetLeftCenter - sideCarriageway / 2 - sideSwW / 2, ySidewalk, sideStreetCenterZ]}>
        <planeGeometry args={[sideSwW, sideStreetLen]} />
        <meshStandardMaterial color="#C8C4BC" roughness={0.95} />
      </mesh>
      {/* Carriageway */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[sideStreetLeftCenter, yRoad, sideStreetCenterZ]}>
        <planeGeometry args={[sideCarriageway, sideStreetLen]} />
        <meshStandardMaterial color="#5A5A5A" roughness={0.9} />
      </mesh>
      {/* Sidewalk right (near lot) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[sideStreetLeftCenter + sideCarriageway / 2 + sideSwW / 2, ySidewalk, sideStreetCenterZ]}>
        <planeGeometry args={[sideSwW, sideStreetLen]} />
        <meshStandardMaterial color="#C8C4BC" roughness={0.95} />
      </mesh>

      {/* ── RIGHT SIDE STREET ────────────────────────────────────────── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[sideStreetRightCenter - sideCarriageway / 2 - sideSwW / 2, ySidewalk, sideStreetCenterZ]}>
        <planeGeometry args={[sideSwW, sideStreetLen]} />
        <meshStandardMaterial color="#C8C4BC" roughness={0.95} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[sideStreetRightCenter, yRoad, sideStreetCenterZ]}>
        <planeGeometry args={[sideCarriageway, sideStreetLen]} />
        <meshStandardMaterial color="#5A5A5A" roughness={0.9} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[sideStreetRightCenter + sideCarriageway / 2 + sideSwW / 2, ySidewalk, sideStreetCenterZ]}>
        <planeGeometry args={[sideSwW, sideStreetLen]} />
        <meshStandardMaterial color="#C8C4BC" roughness={0.95} />
      </mesh>
    </group>
  )
}
