// src/features/3d-lab/config/modules/10-materials/wall-core-registry.ts
// Extended core type registry — structural metadata + performance baselines
// Preserves ALL existing CORE_CONFIGS field values exactly

import type { CoreType, CoreTypeRegistryEntry } from './wall-types'

// ⚠️ Performance base values are APPROXIMATE for educational use — NEEDS SME VERIFICATION

export const WALL_CORE_REGISTRY: Record<CoreType, CoreTypeRegistryEntry> = {
  'chb': {
    // ── Existing CoreConfig fields (preserved exactly) ──
    thickness: 0.150,
    color: '#a8a29e',
    label: 'CHB Core',
    hasMortarPattern: true,
    mortarSpacingH: 0.200,
    mortarSpacingV: 0.400,
    mortarColor: '#8d8680',
    supportsPlaster: true,
    // ── Structural metadata ──
    structuralSystem: 'unit-masonry',
    isLoadBearing: 'configurable',
    supportsInsulation: false,
    supportsWaterproofing: true,
    supportsMEP: false,
    hasInternalCavity: true,
    // ── Base performance ── ⚠️ UNVERIFIED
    baseFireRatingMinutes: 60,    // Source: NCMA TEK 7-1D — 150mm CHB unfilled
    baseSTC: 45,                   // Source: CMHA TEK 13-01D
    baseRValue: 1.8,              // Source: Estimated
    baseCostPerSqm: 3200,         // Source: Metro Manila approx 2026
    // ── Material quantities ──
    unitsPerSqm: 12.5,            // Source: Scribd CHB doc
    mortarVolumePerSqm: 0.02,     // Source: Scribd CHB doc
  },
  'drywall': {
    // ── Existing CoreConfig fields (preserved exactly) ──
    thickness: 0.100,
    color: '#f5f5f4',
    label: 'Drywall (Studs + Board)',
    hasMortarPattern: false,
    mortarSpacingH: 0,
    mortarSpacingV: 0,
    mortarColor: '',
    supportsPlaster: false,
    // ── Structural metadata ──
    structuralSystem: 'framed',
    isLoadBearing: false,
    supportsInsulation: true,
    supportsWaterproofing: false,
    supportsMEP: true,
    hasInternalCavity: true,
    // ── Base performance ── ⚠️ UNVERIFIED
    baseFireRatingMinutes: 30,    // Source: American Gypsum — single ½" each side
    baseSTC: 35,                   // Source: National Gypsum — no insulation
    baseRValue: 1.0,
    baseCostPerSqm: 1800,
    // ── Material quantities ──
    unitsPerSqm: null,
    mortarVolumePerSqm: null,
  },
  'plywood': {
    // ── Existing CoreConfig fields (preserved exactly) ──
    thickness: 0.075,
    color: '#c2956b',
    label: 'Plywood Panel',
    hasMortarPattern: false,
    mortarSpacingH: 0,
    mortarSpacingV: 0,
    mortarColor: '',
    supportsPlaster: false,
    // ── Structural metadata ──
    structuralSystem: 'panel',
    isLoadBearing: false,
    supportsInsulation: true,
    supportsWaterproofing: false,
    supportsMEP: true,
    hasInternalCavity: true,
    // ── Base performance ── ⚠️ UNVERIFIED
    baseFireRatingMinutes: 0,     // Source: Combustible — not rated
    baseSTC: 28,
    baseRValue: 1.5,
    baseCostPerSqm: 1200,
    // ── Material quantities ──
    unitsPerSqm: null,
    mortarVolumePerSqm: null,
  },
  'cement-board': {
    // ── Existing CoreConfig fields (preserved exactly) ──
    thickness: 0.100,
    color: '#d6d3d1',
    label: 'Cement Board (HardieFlex)',
    hasMortarPattern: false,
    mortarSpacingH: 0,
    mortarSpacingV: 0,
    mortarColor: '',
    supportsPlaster: false,
    // ── Structural metadata ──
    structuralSystem: 'panel',
    isLoadBearing: false,
    supportsInsulation: true,
    supportsWaterproofing: false,
    supportsMEP: true,
    hasInternalCavity: true,
    // ── Base performance ── ⚠️ UNVERIFIED
    baseFireRatingMinutes: 60,    // Source: USG — with Type X backing
    baseSTC: 33,
    baseRValue: 0.8,
    baseCostPerSqm: 2100,
    // ── Material quantities ──
    unitsPerSqm: null,
    mortarVolumePerSqm: null,
  },
  'brick': {
    // ── Existing CoreConfig fields (preserved exactly) ──
    thickness: 0.200,
    color: '#b45309',
    label: 'Brick Masonry',
    hasMortarPattern: true,
    mortarSpacingH: 0.100,
    mortarSpacingV: 0.200,
    mortarColor: '#92400e',
    supportsPlaster: true,
    // ── Structural metadata ──
    structuralSystem: 'unit-masonry',
    isLoadBearing: true,
    supportsInsulation: false,
    supportsWaterproofing: true,
    supportsMEP: false,
    hasInternalCavity: false,
    // ── Base performance ── ⚠️ UNVERIFIED
    baseFireRatingMinutes: 120,   // Source: NCMA — 200mm brick
    baseSTC: 50,                   // Source: CMHA
    baseRValue: 1.5,
    baseCostPerSqm: 3800,
    // ── Material quantities ──
    unitsPerSqm: 50,              // Source: Standard 200×100×65mm bricks
    mortarVolumePerSqm: 0.03,
  },
  'solid-concrete': {
    // ── Existing CoreConfig fields (preserved exactly) ──
    thickness: 0.150,
    color: '#78716c',
    label: 'Solid Concrete',
    hasMortarPattern: false,
    mortarSpacingH: 0,
    mortarSpacingV: 0,
    mortarColor: '',
    supportsPlaster: true,
    // ── Structural metadata ──
    structuralSystem: 'monolithic',
    isLoadBearing: true,
    supportsInsulation: false,
    supportsWaterproofing: true,
    supportsMEP: false,
    hasInternalCavity: false,
    // ── Base performance ── ⚠️ UNVERIFIED
    baseFireRatingMinutes: 120,   // Source: ACI 216
    baseSTC: 47,
    baseRValue: 1.2,
    baseCostPerSqm: 4200,
    // ── Material quantities ──
    unitsPerSqm: null,
    mortarVolumePerSqm: null,
  },
  'existing-wall': {
    // ── Existing CoreConfig fields (preserved exactly) ──
    thickness: 0.150,
    color: '#e7e5e4',
    label: 'Existing Wall',
    hasMortarPattern: false,
    mortarSpacingH: 0,
    mortarSpacingV: 0,
    mortarColor: '',
    supportsPlaster: true,
    // ── Structural metadata ──
    structuralSystem: 'generic',
    isLoadBearing: 'configurable',
    supportsInsulation: false,
    supportsWaterproofing: false,
    supportsMEP: false,
    hasInternalCavity: false,
    // ── Base performance ── ⚠️ UNVERIFIED
    baseFireRatingMinutes: 60,    // Source: Assumed
    baseSTC: 40,
    baseRValue: 1.5,
    baseCostPerSqm: 0,            // No core cost for existing wall
    // ── Material quantities ──
    unitsPerSqm: null,
    mortarVolumePerSqm: null,
  },
}
