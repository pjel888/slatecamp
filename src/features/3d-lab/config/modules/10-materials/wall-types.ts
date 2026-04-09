// src/features/3d-lab/config/modules/10-materials/wall-types.ts
// Wall Configurator v2 — TypeScript type definitions
// Pure types only — no runtime code

import type { Vector3Tuple } from 'three'

// ─── Core Type System ───────────────────────────────────────────────────────

export type CoreType =
  | 'chb'
  | 'drywall'
  | 'plywood'
  | 'cement-board'
  | 'brick'
  | 'solid-concrete'
  | 'existing-wall'

export type StructuralSystem = 'unit-masonry' | 'framed' | 'panel' | 'monolithic' | 'generic'

export type WallLocation = 'interior' | 'exterior' | 'bathroom' | 'below-grade'

// Named WallViewMode to avoid collision with ViewMode in templates.ts:405
// (templates.ts ViewMode = camera projection; WallViewMode = wall visualization state)
export type WallViewMode = 'overview' | 'section-cut' | 'exploded' | 'build-sequence' | 'compare'

// ─── Extended Core Type Registry ────────────────────────────────────────────

export interface CoreTypeRegistryEntry {
  // ── Existing CoreConfig fields (preserved) ──
  thickness: number
  color: string
  label: string
  hasMortarPattern: boolean
  mortarSpacingH: number
  mortarSpacingV: number
  mortarColor: string
  supportsPlaster: boolean

  // ── Structural metadata (new) ──
  structuralSystem: StructuralSystem
  isLoadBearing: boolean | 'configurable'
  supportsInsulation: boolean
  supportsWaterproofing: boolean
  supportsMEP: boolean
  hasInternalCavity: boolean

  // ── Base performance data (new) ── ⚠️ NEEDS VERIFICATION
  baseFireRatingMinutes: number
  baseSTC: number
  baseRValue: number
  baseCostPerSqm: number   // Philippine Peso, approximate Metro Manila rates

  // ── Material quantity data (new) ──
  unitsPerSqm: number | null       // 12.5 for CHB, ~50 for brick, null for non-unit types
  mortarVolumePerSqm: number | null // cu.m. per sqm, null for non-masonry
}

// ─── CHB-Specific Structural Data ───────────────────────────────────────────

export interface CHBStructural {
  type: 'chb'
  rebarSpacingMm: number          // 600–1200mm
  rebarDiameterMm: number         // 10, 12, or 16
  bondBeamIntervalCourses: number // Every 3rd or 4th course
  chbSizeMm: number              // 100 or 150 (width)
  showReinforcement: boolean
  showStiffenerColumns: boolean
  groutingLevel: 'none' | 'partial' | 'solid'
}

// ─── Drywall-Specific Structural Data ───────────────────────────────────────

export interface DrywallStructural {
  type: 'drywall'
  studSpacingMm: number           // 400 or 600
  studDepthMm: number             // 64, 92, or 150
  gypsumThicknessMm: number       // 12.5 or 15.9
  gypsumLayers: 1 | 2
  showInsulation: boolean
  showBridging: boolean
  insulationType: 'fiberglass' | 'mineral-wool'
}

// ─── Generic Structural Data ────────────────────────────────────────────────

export interface GenericStructural {
  type: 'generic'
}

// ─── Concrete-Specific Structural Data ──────────────────────────────────────

export interface ConcreteStructural {
  type: 'concrete'
  rebarMeshSpacingMm: number      // 150 or 200
  rebarDiameterMm: number         // 10, 12
  showReinforcement: boolean
}

// Discriminated union for structural data
export type StructuralData = CHBStructural | DrywallStructural | ConcreteStructural | GenericStructural

// ─── Performance Metrics ────────────────────────────────────────────────────

export interface PerformanceMetrics {
  fireRatingMinutes: number
  fireRatingLabel: string         // e.g., "2 hours"
  stcRating: number
  rValue: number
  costPerSqm: number
  totalCost: number
}

// ─── BOM Entry ──────────────────────────────────────────────────────────────

export interface BOMEntry {
  material: string
  quantity: number
  unit: string
  unitCost: number                // Philippine Peso
  subtotal: number
  group: 'core' | 'finish' | 'structural' | 'labor' | 'waste'
}

// ─── Layer Stack Entry ──────────────────────────────────────────────────────

export interface LayerStackEntry {
  id: string
  label: string
  thickness: number               // meters
  cumulativeOffset: number        // meters from core face
  color: string
  opacity: number
  side: 'front' | 'back'
}

// ─── Computed Wall State (Central Data Object) ──────────────────────────────

export interface ComputedWallState {
  // ── Raw parameters (passthrough) ──
  coreType: CoreType
  wallLengthMm: number
  wallHeightMm: number
  bothSides: boolean

  // ── Resolved assembly ──
  coreThickness: number           // meters
  layerStack: LayerStackEntry[]
  totalThickness: number          // meters (core + all layers)
  wallAreaSqm: number

  // ── Structural data (discriminated by core type) ──
  structural: StructuralData

  // ── Performance metrics ── ⚠️ NEEDS VERIFICATION
  performance: PerformanceMetrics

  // ── BOM ──
  bom: BOMEntry[]
  bomTotal: number

  // ── Violation results ──
  violations: Array<{
    id: string
    message: string
    codeCitation: string
    severity: 'error' | 'warning' | 'info'
  }>

  // ── Registry entry for the active core type ──
  registryEntry: CoreTypeRegistryEntry
}
