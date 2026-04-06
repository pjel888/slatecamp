'use client'

import { useState, useCallback } from 'react'
import { Html } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { useLabStore } from '@/features/3d-lab/stores/legacyLabStore'
import { HotspotAnnotation, type HotspotDef } from '@/features/3d-lab/components/templates/HotspotAnnotation'

/* ── Types ─────────────────────────────────────────────────────────────────── */

export type PartId =
  | 'stylobate'
  | 'shaft'
  | 'fluting'
  | 'echinus'
  | 'abacus'
  | 'entablature'

/* ── Constants ──────────────────────────────────────────────────────────────── */

// Geometry Y coordinates (all values in Three.js units)
// Step 1 bottom: y=0 → top: y=0.05
// Step 2 bottom: y=0.05 → top: y=0.10
// Shaft bottom: y=0.10 → top: y=1.80
// Necking: y≈1.785 (near shaft top)
// Echinus bottom: y=1.80 → top: y=1.92
// Abacus bottom: y=1.92 → top: y=2.02
// Architrave bottom: y=2.02 → top: y=2.22
// Frieze bottom: y=2.22 → top: y=2.52
// Cornice bottom: y=2.52 → top: y=2.60

const MAT = { roughness: 0.75, metalness: 0.0 }

const PART_NAMES: Record<string, string> = {
  stylobate: 'Stylobate',
  shaft: 'Column Shaft',
  echinus: 'Echinus',
  abacus: 'Abacus',
  entablature: 'Entablature',
}

const HOTSPOTS: HotspotDef[] = [
  {
    id: 'stylobate',
    position: [0.60, 0.075, 0],
    title: 'Stylobate',
    description:
      'The topmost step of the three-stepped platform upon which columns stand. Elevates the colonnade above the ground.',
    wikiSlug: 'classical-orders-stylobate',
  },
  {
    id: 'shaft',
    position: [0.30, 0.95, 0],
    title: 'Column Shaft',
    description:
      'Tapers toward the top with a subtle convex curve (entasis) to correct the optical sagging illusion of a perfectly straight column.',
    wikiSlug: 'classical-orders-column-shaft',
  },
  {
    id: 'fluting',
    position: [0.27, 1.30, 0],
    title: 'Fluting',
    description:
      '20 shallow vertical grooves with sharp arrises — broader and bolder than the Ionic order\'s 24 grooves. Creates strong shadow lines emphasising verticality.',
    wikiSlug: 'classical-orders-fluting',
  },
  {
    id: 'echinus',
    position: [0.38, 1.86, 0],
    title: 'Echinus',
    description:
      'The convex cushion molding forming the lower element of the Doric capital, mediating the transition from shaft to abacus.',
    wikiSlug: 'classical-orders-capital',
  },
  {
    id: 'abacus',
    position: [0.42, 1.97, 0],
    title: 'Abacus',
    description:
      'The flat square slab at the top of the capital. Plain and undecorated in the Doric order — directly supporting the entablature.',
    wikiSlug: 'classical-orders-capital',
  },
  {
    id: 'entablature',
    position: [0.55, 2.37, 0],
    title: 'Entablature',
    description:
      'Architrave (plain beam) + Frieze (triglyphs & metopes) + Cornice (projecting crown). The horizontal structure carried by the columns.',
    wikiSlug: 'classical-orders-entablature',
  },
]

/* ── Helpers ────────────────────────────────────────────────────────────────── */

function getEmissive(
  partId: PartId,
  hoveredPart: PartId | null,
  activePartId: string | null,
  isQuizMode: boolean,
): { emissive: string; emissiveIntensity: number } {
  const isActive = !isQuizMode && activePartId === partId
  const isHovered = hoveredPart === partId
  if (isActive) return { emissive: '#3b82f6', emissiveIntensity: 0.40 }
  if (isHovered) return { emissive: '#3b82f6', emissiveIntensity: 0.22 }
  return { emissive: '#000000', emissiveIntensity: 0 }
}

/* ── Scene Component ────────────────────────────────────────────────────────── */

interface Props {
  onPartClick: (id: PartId) => void
}

export function ClassicalOrdersScene({ onPartClick }: Props) {
  const { invalidate } = useThree()
  const [hoveredPart, setHoveredPartRaw] = useState<PartId | null>(null)

  const activeHotspotId = useLabStore((s) => s.activeHotspotId)
  const setActiveHotspot = useLabStore((s) => s.setActiveHotspot)
  const isQuizMode = useLabStore((s) => s.isQuizMode)
  const quizTargetPartId = useLabStore((s) => s.quizTargetPartId) as PartId | null

  const setHoveredPart = useCallback(
    (id: PartId | null) => {
      setHoveredPartRaw(id)
      invalidate()
    },
    [invalidate],
  )

  const handleMeshClick = useCallback(
    (partId: PartId) => {
      if (!isQuizMode) setActiveHotspot(partId)
      onPartClick(partId)
    },
    [isQuizMode, setActiveHotspot, onPartClick],
  )

  // Per-part emissive helper — pure function, not a hook
  const e = (partId: PartId) => getEmissive(partId, hoveredPart, activeHotspotId, isQuizMode)

  return (
    <group>
      {/* ── Ground plane ──────────────────────────────────────────────────── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.005, 0]} receiveShadow>
        <planeGeometry args={[5, 5]} />
        <meshStandardMaterial color="#f1f5f9" roughness={0.9} />
      </mesh>

      {/* ── Stylobate: 2-step platform ───────────────────────────────────── */}
      {/* Step 1 — base step (widest) */}
      <mesh
        position={[0, 0.025, 0]}
        onPointerEnter={() => setHoveredPart('stylobate')}
        onPointerLeave={() => setHoveredPart(null)}
        onClick={() => handleMeshClick('stylobate')}
      >
        <boxGeometry args={[1.10, 0.05, 1.10]} />
        <meshStandardMaterial color="#c8cdd6" {...MAT} {...e('stylobate')} />
      </mesh>
      {/* Step 2 — stylobate proper */}
      <mesh
        position={[0, 0.075, 0]}
        onPointerEnter={() => setHoveredPart('stylobate')}
        onPointerLeave={() => setHoveredPart(null)}
        onClick={() => handleMeshClick('stylobate')}
      >
        <boxGeometry args={[0.90, 0.05, 0.90]} />
        <meshStandardMaterial color="#c8cdd6" {...MAT} {...e('stylobate')} />
      </mesh>

      {/* ── Column Shaft (tapered cylinder — entasis simplified) ─────────── */}
      {/* radiusTop=0.19, radiusBottom=0.24, height=1.70, segments=24 */}
      <mesh
        position={[0, 0.95, 0]}
        onPointerEnter={() => setHoveredPart('shaft')}
        onPointerLeave={() => setHoveredPart(null)}
        onClick={() => handleMeshClick('shaft')}
      >
        <cylinderGeometry args={[0.19, 0.24, 1.70, 24]} />
        <meshStandardMaterial color="#dde1ea" {...MAT} {...e('shaft')} />
      </mesh>

      {/* Necking ring (narrow band at top of shaft) */}
      <mesh position={[0, 1.785, 0]}>
        <cylinderGeometry args={[0.205, 0.205, 0.03, 24]} />
        <meshStandardMaterial color="#a8adb6" {...MAT} />
      </mesh>

      {/* ── Echinus (convex cushion capital) ────────────────────────────── */}
      <mesh
        position={[0, 1.86, 0]}
        onPointerEnter={() => setHoveredPart('echinus')}
        onPointerLeave={() => setHoveredPart(null)}
        onClick={() => handleMeshClick('echinus')}
      >
        <cylinderGeometry args={[0.30, 0.20, 0.12, 24]} />
        <meshStandardMaterial color="#c4c9d4" {...MAT} {...e('echinus')} />
      </mesh>

      {/* ── Abacus (flat square slab) ────────────────────────────────────── */}
      <mesh
        position={[0, 1.97, 0]}
        onPointerEnter={() => setHoveredPart('abacus')}
        onPointerLeave={() => setHoveredPart(null)}
        onClick={() => handleMeshClick('abacus')}
      >
        <boxGeometry args={[0.68, 0.10, 0.68]} />
        <meshStandardMaterial color="#b8bdc8" {...MAT} {...e('abacus')} />
      </mesh>

      {/* ── Entablature ──────────────────────────────────────────────────── */}
      {/* Architrave: plain horizontal beam */}
      <mesh
        position={[0, 2.12, 0]}
        onPointerEnter={() => setHoveredPart('entablature')}
        onPointerLeave={() => setHoveredPart(null)}
        onClick={() => handleMeshClick('entablature')}
      >
        <boxGeometry args={[0.80, 0.20, 0.80]} />
        <meshStandardMaterial color="#ced2db" {...MAT} {...e('entablature')} />
      </mesh>
      {/* Frieze: triglyphs + metopes zone */}
      <mesh
        position={[0, 2.37, 0]}
        onPointerEnter={() => setHoveredPart('entablature')}
        onPointerLeave={() => setHoveredPart(null)}
        onClick={() => handleMeshClick('entablature')}
      >
        <boxGeometry args={[0.84, 0.30, 0.84]} />
        <meshStandardMaterial color="#ced2db" {...MAT} {...e('entablature')} />
      </mesh>
      {/* Cornice: projecting crown molding */}
      <mesh
        position={[0, 2.56, 0]}
        onPointerEnter={() => setHoveredPart('entablature')}
        onPointerLeave={() => setHoveredPart(null)}
        onClick={() => handleMeshClick('entablature')}
      >
        <boxGeometry args={[0.94, 0.08, 0.94]} />
        <meshStandardMaterial color="#c2c7d1" {...MAT} {...e('entablature')} />
      </mesh>

      {/* ── Hotspot Annotations (hidden in quiz mode) ────────────────────── */}
      {!isQuizMode &&
        HOTSPOTS.map((hotspot) => (
          <HotspotAnnotation
            key={hotspot.id}
            hotspot={hotspot}
            isActive={activeHotspotId === hotspot.id}
            onActivate={(id) => setActiveHotspot(id)}
            onDeactivate={() => setActiveHotspot(null)}
            isQuizMode={false}
          />
        ))}

      {/* ── Quiz Mode Prompt ─────────────────────────────────────────────── */}
      {isQuizMode && quizTargetPartId && (
        <Html position={[0, 3.1, 0]} distanceFactor={8} occlude={false} center>
          <div
            style={{ pointerEvents: 'none' }}
            className="px-3 py-2 bg-amber-50 border border-amber-200 rounded-md shadow-sm text-center whitespace-nowrap"
          >
            <div className="text-[11px] font-black uppercase tracking-widest text-amber-600 mb-0.5">
              Find it
            </div>
            <div className="text-xs font-bold text-amber-900">
              Click the {PART_NAMES[quizTargetPartId] ?? quizTargetPartId}
            </div>
          </div>
        </Html>
      )}
    </group>
  )
}
