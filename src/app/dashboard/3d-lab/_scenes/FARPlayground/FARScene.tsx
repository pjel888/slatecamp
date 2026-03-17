'use client'

import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { useLabStore } from '../../_stores/labStore'
import { useInvalidateOnChange } from '../../_hooks/useInvalidateOnChange'

// 1 Three.js unit = 12.5 metres
const SCALE = 0.08
const FLOOR_HEIGHT_M = 3
const LOT_Y = 0.005  // half-thickness of lot plate
const MAX_ZONE_FAR = 4.0

/** Lerp a value toward target. Returns true when settled (within epsilon). */
function lerp(current: number, target: number, factor: number, epsilon = 0.001): [number, boolean] {
  const next = current + (target - current) * factor
  return [Math.abs(next - target) < epsilon ? target : next, Math.abs(next - target) < epsilon]
}

function toU(meters: number) { return meters * SCALE }

function computeScene(lotArea: number, far: number, bhl: number, setbackFront: number, setbackSide: number) {
  const lotSideM = Math.sqrt(lotArea)

  const footprintSideM = Math.max(3, lotSideM - (setbackFront + setbackSide) * 2)
  const footprintAreaM2 = footprintSideM ** 2

  const maxFloorAreaM2 = lotArea * far
  const floors = Math.max(1, Math.round(maxFloorAreaM2 / footprintAreaM2))
  const buildingHeightM = floors * FLOOR_HEIGHT_M

  const isFARViolation = far > MAX_ZONE_FAR
  const isBHLViolation = buildingHeightM > bhl
  const isViolation = isFARViolation || isBHLViolation

  return {
    lotSideM,
    footprintSideM,
    buildingHeightM,
    floors,
    maxFloorAreaM2,
    isFARViolation,
    isBHLViolation,
    isViolation,
  }
}

/**
 * The FAR Calculator scene — all R3F geometry.
 * Must be used inside a Canvas (via FARPlayground wrapper).
 * Uses frameloop="demand" + lerp animation, consistent with NBCPScene.
 */
export function FARScene() {
  useInvalidateOnChange()
  const { invalidate } = useThree()

  const buildingRef = useRef<THREE.Mesh>(null)
  const buildingMatRef = useRef<THREE.MeshStandardMaterial>(null)
  const animRef = useRef({ w: 0.001, h: 0.001 })

  useFrame(() => {
    const { lotArea, far, bhl, setbackFront, setbackSide } = useLabStore.getState()
    const s = computeScene(lotArea, far, bhl, setbackFront, setbackSide)
    const targetW = Math.max(0.001, toU(s.footprintSideM))
    const targetH = Math.max(0.001, toU(s.buildingHeightM))

    const LERP_FACTOR = 0.12
    const [nw, wSettled] = lerp(animRef.current.w, targetW, LERP_FACTOR)
    const [nh, hSettled] = lerp(animRef.current.h, targetH, LERP_FACTOR)
    animRef.current = { w: nw, h: nh }

    if (buildingRef.current) {
      buildingRef.current.scale.set(nw, nh, nw)
      buildingRef.current.position.y = LOT_Y * 2 + nh / 2
    }
    if (buildingMatRef.current) {
      buildingMatRef.current.color.set(s.isViolation ? '#D64545' : '#3B6B9C')
    }

    if (!wSettled || !hSettled) invalidate()
  })

  // Static values for geometry layout
  const { lotArea, far, bhl, setbackFront, setbackSide } = useLabStore()
  const s = computeScene(lotArea, far, bhl, setbackFront, setbackSide)

  const lotU    = toU(s.lotSideM)
  const bhlU    = toU(bhl)
  const frontSbU = toU(setbackFront)
  const sideSbU  = toU(setbackSide)
  const bhlColor = s.isBHLViolation ? '#D64545' : '#2D9F6F'

  return (
    <group>
      {/* ── Lot plate ──────────────────────────────────────────────────── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[lotU, lotU]} />
        <meshStandardMaterial color="#e5e7eb" />
      </mesh>

      {/* Property boundary lines */}
      {([1, -1] as const).map(dir => (
        <mesh key={`prop-fb-${dir}`} position={[0, 0.003, dir * lotU / 2]}>
          <boxGeometry args={[lotU, 0.006, 0.008]} />
          <meshStandardMaterial color="#374151" />
        </mesh>
      ))}
      {([1, -1] as const).map(dir => (
        <mesh key={`prop-lr-${dir}`} position={[dir * lotU / 2, 0.003, 0]}>
          <boxGeometry args={[0.008, 0.006, lotU]} />
          <meshStandardMaterial color="#374151" />
        </mesh>
      ))}

      {/* ── Setback zones (ground planes, light blue) ───────────────────── */}
      {/* Front setback */}
      {frontSbU > 0 && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, LOT_Y, lotU / 2 - frontSbU / 2]}>
          <planeGeometry args={[lotU, frontSbU]} />
          <meshStandardMaterial color="#bfdbfe" transparent opacity={0.45} />
        </mesh>
      )}
      {/* Rear setback */}
      {frontSbU > 0 && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, LOT_Y, -(lotU / 2 - frontSbU / 2)]}>
          <planeGeometry args={[lotU, frontSbU]} />
          <meshStandardMaterial color="#bfdbfe" transparent opacity={0.45} />
        </mesh>
      )}
      {/* Left setback */}
      {sideSbU > 0 && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-(lotU / 2 - sideSbU / 2), LOT_Y, 0]}>
          <planeGeometry args={[sideSbU, lotU]} />
          <meshStandardMaterial color="#bfdbfe" transparent opacity={0.45} />
        </mesh>
      )}
      {/* Right setback */}
      {sideSbU > 0 && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[(lotU / 2 - sideSbU / 2), LOT_Y, 0]}>
          <planeGeometry args={[sideSbU, lotU]} />
          <meshStandardMaterial color="#bfdbfe" transparent opacity={0.45} />
        </mesh>
      )}

      {/* Setback labels */}
      {frontSbU > 0 && (
        <Html position={[0, LOT_Y, lotU / 2 - frontSbU / 2]} distanceFactor={8} occlude={false}>
          <div style={{ pointerEvents: 'none' }} className="bg-white/80 border border-zinc-200 rounded px-1 py-0.5 text-[11px] font-mono text-zinc-600 -translate-x-1/2 whitespace-nowrap">
            Front/Rear: {setbackFront.toFixed(1)}m
          </div>
        </Html>
      )}
      {sideSbU > 0 && (
        <Html position={[-(lotU / 2 - sideSbU / 2), LOT_Y, 0]} distanceFactor={8} occlude={false}>
          <div style={{ pointerEvents: 'none' }} className="bg-white/80 border border-zinc-200 rounded px-1 py-0.5 text-[11px] font-mono text-zinc-600 -translate-x-1/2 whitespace-nowrap">
            Side: {setbackSide.toFixed(1)}m
          </div>
        </Html>
      )}

      {/* ── Building envelope (unit cube, scaled by useFrame) ───────────── */}
      <mesh ref={buildingRef} castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          ref={buildingMatRef}
          color="#3B6B9C"
          transparent
          opacity={0.65}
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>

      {/* Floor plate lines */}
      {Array.from({ length: s.floors - 1 }, (_, i) => {
        const floorY = LOT_Y * 2 + toU((i + 1) * FLOOR_HEIGHT_M)
        const bw = toU(s.footprintSideM)
        return (
          <mesh key={`floor-${i}`} position={[0, floorY, 0]}>
            <boxGeometry args={[bw, 0.005, bw]} />
            <meshStandardMaterial color="#2F5A85" transparent opacity={0.4} />
          </mesh>
        )
      })}

      {/* ── 3D-anchored labels ──────────────────────────────────────────── */}
      {/* Height label — right face */}
      <Html
        position={[toU(s.footprintSideM) / 2 + 0.1, LOT_Y * 2 + toU(s.buildingHeightM) / 2, 0]}
        distanceFactor={8} occlude={false}
      >
        <div style={{ pointerEvents: 'none' }} className="bg-white/90 backdrop-blur-sm px-1.5 py-0.5 rounded border border-zinc-200 shadow-sm whitespace-nowrap">
          <span className="text-[11px] font-bold text-zinc-700">
            {s.buildingHeightM.toFixed(1)}m · {s.floors}F
          </span>
        </div>
      </Html>

      {/* FAR / GFA label — above building */}
      <Html
        position={[0, LOT_Y * 2 + toU(s.buildingHeightM) + 0.1, 0]}
        distanceFactor={8} occlude={false}
      >
        <div style={{ pointerEvents: 'none' }} className={`px-1.5 py-0.5 rounded border shadow-sm whitespace-nowrap text-center ${
          s.isFARViolation ? 'bg-red-50 border-red-200' : 'bg-white/90 backdrop-blur-sm border-zinc-200'
        }`}>
          <div className={`text-[11px] font-bold ${s.isFARViolation ? 'text-red-700' : 'text-zinc-700'}`}>
            FAR {far.toFixed(1)}× — {s.maxFloorAreaM2.toFixed(0)} sqm GFA
          </div>
          {s.isFARViolation && (
            <div className="text-[11px] text-red-500">Exceeds zone max {MAX_ZONE_FAR}×</div>
          )}
        </div>
      </Html>

      {/* ── BHL reference line ──────────────────────────────────────────── */}
      <mesh position={[0, LOT_Y * 2 + bhlU, 0]}>
        <boxGeometry args={[lotU * 1.2, 0.006, 0.006]} />
        <meshStandardMaterial color={bhlColor} transparent opacity={0.85} />
      </mesh>
      <Html
        position={[lotU * 0.62 + 0.06, LOT_Y * 2 + bhlU, 0]}
        distanceFactor={8} occlude={false}
      >
        <div style={{ pointerEvents: 'none' }} className={`px-1.5 py-0.5 rounded border shadow-sm whitespace-nowrap ${
          s.isBHLViolation ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-200'
        }`}>
          <span className={`text-[11px] font-bold ${s.isBHLViolation ? 'text-red-700' : 'text-slate-500'}`}>
            BHL {bhl}m{s.isBHLViolation ? ' ⚠ EXCEEDED' : ' (limit)'}
          </span>
        </div>
      </Html>
    </group>
  )
}
