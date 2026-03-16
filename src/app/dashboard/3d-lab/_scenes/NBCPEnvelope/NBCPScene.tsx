// src/app/dashboard/3d-lab/_scenes/NBCPEnvelope/NBCPScene.tsx
'use client'

import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { useNBCPStore } from '../../_stores/nbcpStore'
import { useNBCPInvalidateOnChange } from '../../_hooks/useNBCPInvalidateOnChange'
import { ViolationIndicator } from '../../_components/ViolationIndicator'
import { LotType } from '../../_constants/nbcp'

// ─── Scale ────────────────────────────────────────────────────────────────────
// 1 Three.js unit = 20m
const SCALE = 0.05
const LOT_Y = 0.005  // half-thickness of lot plate

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toU(meters: number) { return meters * SCALE }

/** Clamp distanceFactor for <Html> based on lot area for readability at all scales */
function labelDistanceFactor(tla: number): number {
  if (tla < 100)   return 6
  if (tla < 1000)  return 7
  if (tla < 5000)  return 9
  return 12
}

/** Lerp a value toward target. Returns true when settled (within epsilon). */
function lerp(current: number, target: number, factor: number, epsilon = 0.001): [number, boolean] {
  const next = current + (target - current) * factor
  return [Math.abs(next - target) < epsilon ? target : next, Math.abs(next - target) < epsilon]
}

// ─── Scene ────────────────────────────────────────────────────────────────────

export function NBCPScene() {
  useNBCPInvalidateOnChange()
  const { invalidate } = useThree()

  // Lerp targets — read directly from store (not subscribed)
  const buildingRef = useRef<THREE.Mesh>(null)
  const buildingMatRef = useRef<THREE.MeshStandardMaterial>(null)

  // Current animated values stored in refs (not React state — no re-render)
  const animRef = useRef({ w: 0.001, d: 0.001, h: 0.001 })

  useFrame(() => {
    const { computed, inputs } = useNBCPStore.getState()
    const target = {
      w: Math.max(0.001, toU(computed.buildableWidth)),
      d: Math.max(0.001, toU(computed.buildableDepth)),
      h: Math.max(0.001, toU(computed.effectiveHeight)),
    }

    const LERP_FACTOR = 0.12  // ~400ms to settle at 60fps
    let anyMoving = false

    const [nw, wSettled] = lerp(animRef.current.w, target.w, LERP_FACTOR)
    const [nd, dSettled] = lerp(animRef.current.d, target.d, LERP_FACTOR)
    const [nh, hSettled] = lerp(animRef.current.h, target.h, LERP_FACTOR)

    animRef.current = { w: nw, d: nd, h: nh }
    anyMoving = !wSettled || !dSettled || !hSettled

    if (buildingRef.current) {
      buildingRef.current.scale.set(nw, nh, nd)
      buildingRef.current.position.y = LOT_Y * 2 + nh / 2
    }

    // Building color
    if (buildingMatRef.current) {
      const { violations, bhl_source } = computed
      const hasViolation = violations.length > 0
      const color = hasViolation ? '#dc2626' : bhl_source === 'rrow' ? '#d97706' : '#2563eb'
      buildingMatRef.current.color.set(color)
    }

    if (anyMoving) invalidate()  // self-schedule next frame while animating
  })

  // Static values (don't need animation)
  const { computed, inputs } = useNBCPStore()
  const {
    tla, bhl_effective, bhl_meters, bhl_source,
    ambf, setbacks, effectiveStoreys, effectiveHeight,
    flar, violations,
  } = computed

  const lotWu = toU(inputs.lotWidth)
  const lotDu = toU(inputs.lotDepth)
  const bhlU  = toU(bhl_meters)

  const df = labelDistanceFactor(tla)

  // Setback zone positions
  const frontSbDepth = toU(setbacks.front)
  const rearSbDepth  = toU(setbacks.rear)
  const leftSbWidth  = toU(setbacks.left)
  const rightSbWidth = toU(setbacks.right)

  // BHL line color
  const bhlLineColor = violations.length > 0 ? '#dc2626' : bhl_source === 'rrow' ? '#d97706' : '#16a34a'

  // RROW plane(s)
  const rrowWu = toU(inputs.rrowWidth)
  const showRearRrow = inputs.lotType === LotType.THROUGH

  return (
    <group>
      {/* ── RROW plane(s) ──────────────────────────────────────────────── */}
      {/* Front RROW */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, lotDu / 2 + rrowWu / 2]}>
        <planeGeometry args={[lotWu + rrowWu, rrowWu]} />
        <meshStandardMaterial color="#d1d5db" />
      </mesh>
      <Html position={[0, 0, lotDu / 2 + rrowWu / 2]} distanceFactor={df} occlude={false}>
        <div style={{ pointerEvents: 'none' }} className="bg-white/90 border border-zinc-200 rounded px-1.5 py-0.5 text-[9px] font-bold text-zinc-500 whitespace-nowrap -translate-x-1/2">
          RROW: {inputs.rrowWidth.toFixed(1)}m
        </div>
      </Html>

      {/* Rear RROW (Through lots only) */}
      {showRearRrow && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -(lotDu / 2 + rrowWu / 2)]}>
          <planeGeometry args={[lotWu + rrowWu, rrowWu]} />
          <meshStandardMaterial color="#d1d5db" />
        </mesh>
      )}

      {/* ── Lot plate ──────────────────────────────────────────────────── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[lotWu, lotDu]} />
        <meshStandardMaterial color="#e5e7eb" />
      </mesh>

      {/* Property lines (thin box strips) */}
      {/* Front/rear */}
      {([1, -1] as const).map(dir => (
        <mesh key={`prop-fb-${dir}`} position={[0, 0.003, dir * lotDu / 2]}>
          <boxGeometry args={[lotWu, 0.006, 0.008]} />
          <meshStandardMaterial color="#374151" />
        </mesh>
      ))}
      {/* Left/right */}
      {([1, -1] as const).map(dir => (
        <mesh key={`prop-lr-${dir}`} position={[dir * lotWu / 2, 0.003, 0]}>
          <boxGeometry args={[0.008, 0.006, lotDu]} />
          <meshStandardMaterial color="#374151" />
        </mesh>
      ))}

      {/* ── Setback zones (ground planes, light blue) ───────────────────── */}
      {/* Front setback */}
      {frontSbDepth > 0 && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, LOT_Y, lotDu / 2 - frontSbDepth / 2]}>
          <planeGeometry args={[lotWu, frontSbDepth]} />
          <meshStandardMaterial color="#bfdbfe" transparent opacity={0.45} />
        </mesh>
      )}
      {/* Rear setback */}
      {rearSbDepth > 0 && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, LOT_Y, -(lotDu / 2 - rearSbDepth / 2)]}>
          <planeGeometry args={[lotWu, rearSbDepth]} />
          <meshStandardMaterial color="#bfdbfe" transparent opacity={0.45} />
        </mesh>
      )}
      {/* Left setback */}
      {leftSbWidth > 0 && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-(lotWu / 2 - leftSbWidth / 2), LOT_Y, 0]}>
          <planeGeometry args={[leftSbWidth, lotDu]} />
          <meshStandardMaterial color="#bfdbfe" transparent opacity={0.45} />
        </mesh>
      )}
      {/* Right setback */}
      {rightSbWidth > 0 && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[(lotWu / 2 - rightSbWidth / 2), LOT_Y, 0]}>
          <planeGeometry args={[rightSbWidth, lotDu]} />
          <meshStandardMaterial color="#bfdbfe" transparent opacity={0.45} />
        </mesh>
      )}

      {/* Setback labels */}
      {frontSbDepth > 0 && (
        <Html position={[0, LOT_Y, lotDu / 2 - frontSbDepth / 2]} distanceFactor={df} occlude={false}>
          <div style={{ pointerEvents: 'none' }} className="bg-white/80 border border-zinc-200 rounded px-1 py-0.5 text-[9px] font-mono text-zinc-600 -translate-x-1/2 whitespace-nowrap">
            Front: {setbacks.front.toFixed(1)}m
          </div>
        </Html>
      )}
      {rearSbDepth > 0 && (
        <Html position={[0, LOT_Y, -(lotDu / 2 - rearSbDepth / 2)]} distanceFactor={df} occlude={false}>
          <div style={{ pointerEvents: 'none' }} className="bg-white/80 border border-zinc-200 rounded px-1 py-0.5 text-[9px] font-mono text-zinc-600 -translate-x-1/2 whitespace-nowrap">
            Rear: {setbacks.rear.toFixed(1)}m
          </div>
        </Html>
      )}

      {/* ── Building envelope ───────────────────────────────────────────── */}
      {/* Unit cube — scaled by useFrame via animRef */}
      <mesh ref={buildingRef} castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          ref={buildingMatRef}
          color="#2563eb"
          transparent
          opacity={0.65}
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>

      {/* Floor plate lines */}
      {Array.from({ length: effectiveStoreys - 1 }, (_, i) => {
        const floorY = LOT_Y * 2 + toU((i + 1) * inputs.floorHeight)
        const bw = toU(computed.buildableWidth)
        const bd = toU(computed.buildableDepth)
        return (
          <mesh key={`floor-${i}`} position={[0, floorY, 0]}>
            <boxGeometry args={[bw, 0.005, bd]} />
            <meshStandardMaterial color="#1d4ed8" transparent opacity={0.4} />
          </mesh>
        )
      })}

      {/* ── 3D-anchored labels ──────────────────────────────────────────── */}
      {/* Height label — right face */}
      <Html
        position={[toU(computed.buildableWidth) / 2 + 0.08, LOT_Y * 2 + toU(effectiveHeight) / 2, 0]}
        distanceFactor={df} occlude={false}
      >
        <div style={{ pointerEvents: 'none' }} className="bg-white/90 backdrop-blur-sm px-1.5 py-0.5 rounded border border-zinc-200 shadow-sm whitespace-nowrap">
          <span className="text-[9px] font-bold text-zinc-700">
            {effectiveHeight.toFixed(1)}m · {effectiveStoreys}F
          </span>
        </div>
      </Html>

      {/* AMBF label — top face */}
      <Html
        position={[0, LOT_Y * 2 + toU(effectiveHeight) + 0.06, 0]}
        distanceFactor={df} occlude={false}
      >
        <div style={{ pointerEvents: 'none' }} className="bg-white/90 backdrop-blur-sm px-1.5 py-0.5 rounded border border-zinc-200 shadow-sm whitespace-nowrap text-center">
          <div className="text-[9px] font-bold text-zinc-700">AMBF: {ambf.toFixed(0)} sqm</div>
          <div className="text-[9px] text-zinc-500">FLAR {flar.toFixed(2)}x</div>
        </div>
      </Html>

      {/* ── BHL reference line ──────────────────────────────────────────── */}
      <mesh position={[0, LOT_Y * 2 + bhlU, 0]}>
        <boxGeometry args={[lotWu * 1.2, 0.006, 0.006]} />
        <meshStandardMaterial color={bhlLineColor} transparent opacity={0.85} />
      </mesh>
      <Html
        position={[lotWu * 0.6 + 0.08, LOT_Y * 2 + bhlU, 0]}
        distanceFactor={df} occlude={false}
      >
        <div style={{ pointerEvents: 'none' }} className={`px-1.5 py-0.5 rounded border shadow-sm whitespace-nowrap ${
          violations.length > 0 ? 'bg-red-50 border-red-200' :
          bhl_source === 'rrow' ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200'
        }`}>
          <span className={`text-[9px] font-bold ${
            violations.length > 0 ? 'text-red-700' :
            bhl_source === 'rrow' ? 'text-amber-700' : 'text-slate-500'
          }`}>
            BHL {bhl_meters.toFixed(1)}m ({bhl_effective}F) — {bhl_source === 'rrow' ? 'RROW-limited' : 'Zoning-limited'}
          </span>
        </div>
      </Html>

      {/* ── Violation annotations ───────────────────────────────────────── */}
      {violations.map((v, i) => (
        <ViolationIndicator
          key={i}
          position={[
            0,
            LOT_Y * 2 + toU(effectiveHeight) + 0.25 + i * 0.18,
            0,
          ]}
          message={v.message}
          codeRef={v.codeCitation}
          visible
          distanceFactor={df}
        />
      ))}
    </group>
  )
}
