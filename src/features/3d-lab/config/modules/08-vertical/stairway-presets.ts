// ──────────────────────────────────────────────────────────────────────────────
// stairway-presets.ts — Scenario & Violation Presets
// 4 existing scenario presets + 11 new violation presets for Phase 1.
// ──────────────────────────────────────────────────────────────────────────────

import type { Preset } from '@/features/3d-lab/types/templates'

// ── Scenario Presets (existing — preserved with identical values) ────────────

const SCENARIO_PRESETS: Preset[] = [
  {
    label: 'Standard House',
    values: {
      projectType: 'general_residential',
      isAccessibleRoute: false,
      isExitStair: false,
      isHighOccupancy: false,
      stairWidth: 900,
      riserHeight: 185,
      treadDepth: 250,
      headroom: 2100,
      handrailHeight: 860,
      numRisers: 12,
    },
  },
  {
    label: 'BP 220 Housing',
    values: {
      projectType: 'bp220_socialized',
      isAccessibleRoute: false,
      isExitStair: false,
      isHighOccupancy: false,
      stairWidth: 620,
      riserHeight: 240,
      treadDepth: 210,
      headroom: 2100,
      handrailHeight: 850,
      numRisers: 14,
    },
  },
  {
    label: 'Public Hall',
    values: {
      projectType: 'commercial',
      isAccessibleRoute: true,
      isExitStair: false,
      isHighOccupancy: true,
      stairWidth: 1500,
      riserHeight: 150,
      treadDepth: 300,
      headroom: 2200,
      handrailHeight: 900,
      numRisers: 12,
    },
  },
  {
    label: 'Exit Stair',
    values: {
      projectType: 'commercial',
      isAccessibleRoute: false,
      isExitStair: true,
      isHighOccupancy: true,
      stairWidth: 950,
      riserHeight: 190,
      treadDepth: 260,
      headroom: 2100,
      handrailHeight: 900,
      numRisers: 14,
    },
  },
]

// ── Violation Presets (new — each triggers a specific violation) ─────────────

const VIOLATION_PRESETS: Preset[] = [
  {
    label: '⚠ Riser Violation (PD 1096)',
    values: {
      projectType: 'general_residential',
      isAccessibleRoute: false,
      isExitStair: false,
      isHighOccupancy: false,
      stairWidth: 900,
      riserHeight: 210,
      treadDepth: 250,
      headroom: 2100,
      handrailHeight: 900,
      numRisers: 12,
    },
  },
  {
    label: '⚠ Tread Too Shallow (PD 1096)',
    values: {
      projectType: 'general_residential',
      isAccessibleRoute: false,
      isExitStair: false,
      isHighOccupancy: false,
      stairWidth: 900,
      riserHeight: 185,
      treadDepth: 185,
      headroom: 2100,
      handrailHeight: 900,
      numRisers: 12,
    },
  },
  {
    label: '⚠ Too Narrow for Public (PD 1096)',
    values: {
      projectType: 'commercial',
      isAccessibleRoute: false,
      isExitStair: false,
      isHighOccupancy: true,
      stairWidth: 900,
      riserHeight: 185,
      treadDepth: 250,
      headroom: 2100,
      handrailHeight: 900,
      numRisers: 12,
    },
  },
  {
    label: '⚠ Headroom Crush (PD 1096)',
    values: {
      projectType: 'general_residential',
      isAccessibleRoute: false,
      isExitStair: false,
      isHighOccupancy: false,
      stairWidth: 900,
      riserHeight: 185,
      treadDepth: 250,
      headroom: 1900,
      handrailHeight: 900,
      numRisers: 12,
    },
  },
  {
    label: '⚠ Exit Riser Violation (RA 9514)',
    values: {
      projectType: 'commercial',
      isAccessibleRoute: false,
      isExitStair: true,
      isHighOccupancy: true,
      stairWidth: 950,
      riserHeight: 195,
      treadDepth: 260,
      headroom: 2100,
      handrailHeight: 900,
      numRisers: 14,
    },
  },
  {
    label: '⚠ No Landing (RA 9514)',
    values: {
      projectType: 'commercial',
      isAccessibleRoute: false,
      isExitStair: true,
      isHighOccupancy: true,
      stairWidth: 950,
      riserHeight: 185,
      treadDepth: 260,
      headroom: 2100,
      handrailHeight: 900,
      numRisers: 18,
      // totalRise = 18 × 185 = 3,330 mm > RA 9514 max 3,000 mm
    },
  },
  {
    label: '⚠ Too Narrow for Wheelchair (BP 344)',
    values: {
      projectType: 'commercial',
      isAccessibleRoute: true,
      isExitStair: false,
      isHighOccupancy: false,
      stairWidth: 1000,
      riserHeight: 150,
      treadDepth: 300,
      headroom: 2200,
      handrailHeight: 900,
      numRisers: 12,
    },
  },
  {
    label: '⚠ BP 220 vs PD 1096 Conflict',
    values: {
      projectType: 'bp220_socialized',
      isAccessibleRoute: false,
      isExitStair: false,
      isHighOccupancy: false,
      stairWidth: 650,
      riserHeight: 230,
      treadDepth: 210,
      headroom: 2100,
      handrailHeight: 850,
      numRisers: 14,
      // Passes BP 220 (≤250) but exceeds PD 1096 (≤200)
    },
  },
  {
    label: '⚠ RA 9514 vs PD 1096 Conflict',
    values: {
      projectType: 'commercial',
      isAccessibleRoute: false,
      isExitStair: true,
      isHighOccupancy: true,
      stairWidth: 950,
      riserHeight: 195,
      treadDepth: 260,
      headroom: 2100,
      handrailHeight: 900,
      numRisers: 14,
      // Passes PD 1096 (≤200) but exceeds RA 9514 (≤180)
    },
  },
  {
    label: '✓ All Laws Happy',
    values: {
      projectType: 'commercial',
      isAccessibleRoute: true,
      isExitStair: true,
      isHighOccupancy: true,
      stairWidth: 1500,
      riserHeight: 150,
      treadDepth: 300,
      headroom: 2200,
      handrailHeight: 900,
      numRisers: 12,
      // Satisfies ALL laws including BP 344 + RA 9514
    },
  },
  {
    label: '⚠ Everything Wrong',
    values: {
      projectType: 'commercial',
      isAccessibleRoute: true,
      isExitStair: true,
      isHighOccupancy: true,
      stairWidth: 500,
      riserHeight: 280,
      treadDepth: 155,
      headroom: 1850,
      handrailHeight: 650,
      numRisers: 20,
      // Triggers maximum simultaneous violations across all laws
    },
  },
]

// ── Combined Export ──────────────────────────────────────────────────────────

export const ALL_PRESETS: Preset[] = [...SCENARIO_PRESETS, ...VIOLATION_PRESETS]
