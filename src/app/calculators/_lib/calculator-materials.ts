// src/app/calculators/_lib/calculator-materials.ts
// Cached THREE.js materials for all Calculator Suite tools.
// Materials are created once and reused — never disposed during app lifecycle.
// Each unique material/geometry pair = 1 draw call. Reuse keeps budget ≤50.

import * as THREE from 'three'

/** Cached materials — created once, shared across all calculator scenes */
export const CALC_MATERIALS = {
  // ─── Flooring ───────────────────────────────────────────────────────────────
  /** Room floor base surface */
  floorBase: new THREE.MeshBasicMaterial({ color: '#E8E4DE', side: THREE.DoubleSide }),
  /** Full (uncut) tile */
  tileFull: new THREE.MeshStandardMaterial({ color: '#D4C9B8', roughness: 0.9, metalness: 0 }),
  /** Cut tile — contrasting color to distinguish from full tiles */
  tileCut: new THREE.MeshStandardMaterial({ color: '#E8A87C', roughness: 0.9, metalness: 0 }),
  /** Tile inside exclusion zone (should not render, but available for ghost effect) */
  tileExcluded: new THREE.MeshBasicMaterial({ color: '#3A3A3A', transparent: true, opacity: 0.3 }),
  /** Grout gap between tiles */
  groutGap: new THREE.MeshBasicMaterial({ color: '#9E9E9E' }),
  /** Exclusion zone (column, fixed island) */
  exclusionZone: new THREE.MeshBasicMaterial({ color: '#2C2C2C', transparent: true, opacity: 0.6 }),

  // ─── Paint ──────────────────────────────────────────────────────────────────
  /** Paintable wall surface — color updated at runtime via setPaintableWallColor() */
  wallPaintable: new THREE.MeshStandardMaterial({ color: '#FFFFFF', roughness: 0.95, metalness: 0 }),
  /** Paintable wall hover state — emissive highlight */
  wallPaintableHover: new THREE.MeshStandardMaterial({
    color: '#FFFFFF',
    roughness: 0.95,
    metalness: 0,
    emissive: new THREE.Color('#444444'),
  }),
  /** Door/window opening void */
  openingVoid: new THREE.MeshBasicMaterial({ color: '#1A1A1A', transparent: true, opacity: 0.4 }),
  /** Ceiling surface */
  ceilingSurface: new THREE.MeshStandardMaterial({ color: '#F5F5F5', roughness: 0.95, metalness: 0 }),

  // ─── Drywall ────────────────────────────────────────────────────────────────
  /** Metal stud */
  studMetal: new THREE.MeshStandardMaterial({ color: '#A8A8A8', roughness: 0.6, metalness: 0.3 }),
  /** Track (top/bottom runner) */
  trackMetal: new THREE.MeshStandardMaterial({ color: '#909090', roughness: 0.6, metalness: 0.3 }),
  /** Board front face */
  boardFront: new THREE.MeshStandardMaterial({ color: '#F0EDE6', roughness: 0.95, metalness: 0 }),
  /** Board back face */
  boardBack: new THREE.MeshStandardMaterial({ color: '#E6E2DA', roughness: 0.95, metalness: 0 }),
  /** Cut board — contrasting color */
  boardCut: new THREE.MeshStandardMaterial({ color: '#E8A87C', roughness: 0.95, metalness: 0 }),
  /** Header track above openings */
  headerTrack: new THREE.MeshStandardMaterial({ color: '#7A7A7A', roughness: 0.6, metalness: 0.3 }),

  // ─── CHB ──────────────────────────────────────────────────────────────────────
  /** CHB block face */
  chbBlock: new THREE.MeshStandardMaterial({ color: '#B8A89A', roughness: 0.85, metalness: 0 }),
  /** Cut CHB block */
  chbBlockCut: new THREE.MeshStandardMaterial({ color: '#E8A87C', roughness: 0.85, metalness: 0 }),
  /** Mortar joint */
  chbMortar: new THREE.MeshStandardMaterial({ color: '#9E9590', roughness: 0.95, metalness: 0 }),
  /** Rebar */
  chbRebar: new THREE.MeshStandardMaterial({ color: '#5A5A5A', roughness: 0.4, metalness: 0.5 }),
  /** Lintel above openings */
  chbLintel: new THREE.MeshStandardMaterial({ color: '#7A7A7A', roughness: 0.6, metalness: 0.2 }),

  // ─── Shared ─────────────────────────────────────────────────────────────────
  /** Edge outlines for geometry wireframes */
  edgeLines: new THREE.LineBasicMaterial({ color: '#333333', linewidth: 1 }),
  /** Selection highlight overlay */
  selectionHighlight: new THREE.MeshBasicMaterial({
    color: '#FFD700',
    transparent: true,
    opacity: 0.25,
  }),
} as const

/**
 * Update the paintable wall color at runtime.
 * Mutates the existing material — does NOT create a new one.
 * Call invalidate() after calling this.
 */
export function setPaintableWallColor(hex: string): void {
  CALC_MATERIALS.wallPaintable.color.set(hex)
  CALC_MATERIALS.wallPaintableHover.color.set(hex)
}
