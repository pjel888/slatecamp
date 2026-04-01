'use client'

// DevControlsLayers — All 3D development control layers for rectangular lots.
// Single component renders: setback zones, AMBF footprint, buildable envelope,
// floor slabs, TOSL overlay, BHL ceiling, FLAR ceiling.
// Uses only standard Three.js primitives (planeGeometry, boxGeometry) for reliability.

import { Line, Edges } from '@react-three/drei'
import * as THREE from 'three'
import { useDevControlsStore } from '../../stores/useDevControlsStore'
import { GEOMETRY_Y, COLOR, OPACITY } from '../constants'

export function DevControlsLayers() {
  // ── Store selectors ───────────────────────────────────────────────
  const lotW = useDevControlsStore((s) => s.lot.width)
  const lotD = useDevControlsStore((s) => s.lot.depth)
  const sbF = useDevControlsStore((s) => s.result.setbacks.effective.front)
  const sbR = useDevControlsStore((s) => s.result.setbacks.effective.rear)
  const sbL = useDevControlsStore((s) => s.result.setbacks.effective.left)
  const sbRt = useDevControlsStore((s) => s.result.setbacks.effective.right)
  const bhlMeters = useDevControlsStore((s) => s.result.bhlMeters)
  const bhlStoreys = useDevControlsStore((s) => s.result.bhlStoreys)
  const ambf = useDevControlsStore((s) => s.result.ambf)
  const fpW = useDevControlsStore((s) => s.building.proposedFootprintWidth)
  const fpD = useDevControlsStore((s) => s.building.proposedFootprintDepth)
  const floors = useDevControlsStore((s) => s.building.proposedStoreys)
  const floorH = useDevControlsStore((s) => s.building.floorHeight)
  const maxFloors = useDevControlsStore((s) => s.result.maxCompliantFloors)
  const layers = useDevControlsStore((s) => s.visibleLayers)
  const xray = useDevControlsStore((s) => s.xrayMode)

  // X-ray: when OFF, floor slabs are fully opaque (solid building).
  // When ON, floor slabs become transparent and edges are drawn for wireframe effect.

  // ── Derived dimensions ────────────────────────────────────────────
  const bW = Math.max(0.1, lotW - sbL - sbRt)  // buildable width
  const bD = Math.max(0.1, lotD - sbF - sbR)    // buildable depth
  const bCx = sbL + bW / 2                       // buildable center X
  const bCz = sbF + bD / 2                       // buildable center Z
  const lotCx = lotW / 2
  const lotCz = lotD / 2

  return (
    <group>
      {/* ═══ SETBACK ZONES ═══ */}
      {layers.has('setbacks') && (
        <group>
          {sbF > 0 && <SetbackPlane x={lotCx} z={sbF / 2} w={lotW} d={sbF} />}
          {sbR > 0 && <SetbackPlane x={lotCx} z={lotD - sbR / 2} w={lotW} d={sbR} />}
          {sbL > 0 && <SetbackPlane x={sbL / 2} z={lotCz} w={sbL} d={lotD} />}
          {sbRt > 0 && <SetbackPlane x={lotW - sbRt / 2} z={lotCz} w={sbRt} d={lotD} />}
        </group>
      )}

      {/* ═══ AMBF FOOTPRINT (buildable area at ground level) ═══ */}
      {layers.has('ambf') && (
        <group>
          <mesh position={[bCx, GEOMETRY_Y.AMBF_FOOTPRINT, bCz]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[bW, bD]} />
            <meshStandardMaterial
              color={COLOR.AMBF_BINDING} transparent opacity={0.20}
              side={THREE.DoubleSide} depthWrite={false}
              polygonOffset polygonOffsetFactor={-5} polygonOffsetUnits={-5}
            />
          </mesh>
          <Line
            points={ambfOutline(sbL, sbF, bW, bD, GEOMETRY_Y.AMBF_FOOTPRINT + 0.001)}
            color={COLOR.AMBF_BINDING} lineWidth={2}
          />
        </group>
      )}

      {/* ═══ BUILDABLE ENVELOPE (transparent box: AMBF × BHL) ═══ */}
      {layers.has('ambf') && bhlMeters > 0 && (
        <mesh position={[bCx, GEOMETRY_Y.BUILDING_BASE + bhlMeters / 2, bCz]}>
          <boxGeometry args={[bW, bhlMeters, bD]} />
          <meshStandardMaterial
            color={COLOR.AMBF_BINDING} transparent opacity={OPACITY.AMBF_BINDING}
            side={THREE.DoubleSide} depthWrite={false}
          />
          <Edges color="#FFFFFF" lineWidth={1.5} />
        </mesh>
      )}

      {/* ═══ FLOOR SLABS (uses proposed footprint, positioned at setback origin) ═══ */}
      {layers.has('floors') && fpW > 0 && fpD > 0 && (() => {
        // Encroachment detection:
        // Setback encroachment = footprint touches or exceeds buildable area
        const setbackEncroach = fpW > bW + 0.01 || fpD > bD + 0.01
        // Lot boundary encroachment = footprint + setback origin exceeds lot boundary
        const lotEncroachW = sbL + fpW > lotW + 0.01
        const lotEncroachD = sbF + fpD > lotD + 0.01
        const lotEncroach = lotEncroachW || lotEncroachD
        const isAmbfViolation = fpW * fpD > ambf + 0.01

        return (
          <group>
            {Array.from({ length: Math.min(floors, 50) }, (_, i) => {
              const fn = i + 1
              const y = GEOMETRY_Y.BUILDING_BASE + i * floorH + 0.075
              let color: string = COLOR.BUILDING
              // Priority: lot encroachment (worst) > BHL > setback > FLAR > normal
              if (lotEncroach) { color = '#991b1b' }
              else if (fn > bhlStoreys) { color = '#D64545' }
              else if (setbackEncroach || isAmbfViolation) { color = '#D64545' }
              else if (fn > maxFloors) { color = '#D4951A' }

              // X-ray OFF = solid opaque floors. X-ray ON = transparent + edge wireframes.
              const slabOpacity = xray ? 0.15 : 1.0
              return (
                <mesh key={fn} position={[sbL + fpW / 2, y, sbF + fpD / 2]}>
                  <boxGeometry args={[fpW, 0.15, fpD]} />
                  <meshStandardMaterial
                    color={color}
                    transparent={xray}
                    opacity={slabOpacity}
                    roughness={0.8}
                    metalness={0.05}
                    depthWrite={!xray}
                  />
                  {xray && <Edges color={color} threshold={15} />}
                </mesh>
              )
            })}
          </group>
        )
      })()}

      {/* ═══ TOSL OVERLAY (full lot open space) ═══ */}
      {layers.has('tosl') && (
        <mesh position={[lotCx, GEOMETRY_Y.TOSL_OVERLAY, lotCz]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[lotW, lotD]} />
          <meshStandardMaterial
            color={COLOR.TOSL} transparent opacity={OPACITY.TOSL_OVERLAY}
            side={THREE.DoubleSide} depthWrite={false}
            polygonOffset polygonOffsetFactor={-4} polygonOffsetUnits={-4}
          />
        </mesh>
      )}

      {/* ═══ BHL CEILING (orange plane at height limit — lot-wide) ═══ */}
      {layers.has('bhl') && bhlMeters > 0 && (
        <group>
          <mesh position={[lotCx, GEOMETRY_Y.BUILDING_BASE + bhlMeters, lotCz]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[lotW, lotD]} />
            <meshStandardMaterial color="#E8853A" transparent opacity={0.22} side={THREE.DoubleSide} depthWrite={false} />
          </mesh>
          <Line
            points={rectOutline(0, 0, lotW, lotD, GEOMETRY_Y.BUILDING_BASE + bhlMeters)}
            color="#D64545" lineWidth={2}
          />
          {/* Dashed vertical posts at lot corners */}
          {[[0, 0], [lotW, 0], [lotW, lotD], [0, lotD]].map(([x, z], i) => (
            <Line key={i}
              points={[new THREE.Vector3(x, GEOMETRY_Y.BUILDING_BASE, z), new THREE.Vector3(x, GEOMETRY_Y.BUILDING_BASE + bhlMeters, z)]}
              color="#D64545" lineWidth={1} dashed dashSize={0.5} gapSize={0.4}
            />
          ))}
        </group>
      )}

      {/* ═══ FLAR CEILING (green/amber at max FLAR-compliant height) ═══ */}
      {layers.has('flar') && maxFloors > 0 && (() => {
        const flarH = Math.min(maxFloors * floorH, bhlMeters)
        const flarY = GEOMETRY_Y.BUILDING_BASE + flarH
        const exceeded = floors > maxFloors
        const clr = exceeded ? '#D4951A' : '#2D9F6F'
        return (
          <group>
            <mesh position={[bCx, flarY, bCz]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[bW, bD]} />
              <meshStandardMaterial color={clr} transparent opacity={0.18} side={THREE.DoubleSide} depthWrite={false} />
            </mesh>
            <Line points={ambfOutline(sbL, sbF, bW, bD, flarY)} color={clr} lineWidth={1.5} dashed dashSize={0.6} gapSize={0.4} />
          </group>
        )
      })()}
    </group>
  )
}

// ── Helpers ─────────────────────────────────────────────────────────

function SetbackPlane({ x, z, w, d }: { x: number; z: number; w: number; d: number }) {
  return (
    <mesh position={[x, GEOMETRY_Y.SETBACK_ZONE, z]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[w, d]} />
      <meshStandardMaterial
        color={COLOR.SETBACK} transparent opacity={OPACITY.SETBACK_ZONE}
        side={THREE.DoubleSide} depthWrite={false}
        polygonOffset polygonOffsetFactor={-1} polygonOffsetUnits={-1}
      />
    </mesh>
  )
}

function rectOutline(x: number, z: number, w: number, d: number, y: number) {
  return [
    new THREE.Vector3(x, y, z),
    new THREE.Vector3(x + w, y, z),
    new THREE.Vector3(x + w, y, z + d),
    new THREE.Vector3(x, y, z + d),
    new THREE.Vector3(x, y, z),
  ]
}

function ambfOutline(sbL: number, sbF: number, bW: number, bD: number, y: number) {
  return rectOutline(sbL, sbF, bW, bD, y)
}
