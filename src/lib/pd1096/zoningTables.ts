// src/lib/pd1096/zoningTables.ts
// ─── PD 1096 2004 Revised IRR — Canonical Lookup Tables ────────────────────
// ZERO framework dependencies. Pure TypeScript only.
//
// Tables sourced exclusively from the 2004 Revised IRR:
//   Table VIII.1 — PSO / ISA / USA / TOSL by Zoning Class
//   Table VIII.2 — Residential Minimum Setbacks
//   Table VIII.3 — Commercial/Industrial Setbacks by RROW Width
//   Table VII.2  — Building Height Limits
//   Table VII.G.1 — FLAR by Zone
//   Table VII.G.2 — GFA to TGFA Multiplier
//
// DO NOT modify without cross-referencing the official IRR text.

import type { ZoneClass, FirewallSide, PerSideSetbacks } from './types'

// ─── Table VIII.1 Entry ─────────────────────────────────────────────────────

export interface ZoningTableEntry {
  label: string
  // PSO — Percentage of Site Occupancy (decimal 0.0–1.0, as fraction of TLA)
  psoNoFirewall: number | null    // null for R-1 (setback-only per IRR)
  psoWithFirewall: number | null  // null if firewalls not permitted
  // Open space components (decimal, as fraction of TLA)
  isaPercent: number              // Max Impervious Surface Area
  usaPercent: number              // Min Unpaved Surface Area
  toslPercent: number             // Derived: 100% - PSO%
  // Building height
  bhlStoreys: number
  bhlMeters: number
  // Floor area
  flarMin: number
  flarMax: number
  tgfaMultiplier: number          // Table VII.G.2
  // Classification
  isResidential: boolean
  // Firewall permissions (§704.4c)
  firewallAllowed: FirewallSide[]
}

// ─── Table VIII.1 — PSO / ISA / USA / TOSL by Zoning Class ─────────────────
// All percentages as decimals (e.g., 0.55 = 55% of TLA).
//
// R-1 NOTE: R-1 has no standalone PSO value. AMBF is determined exclusively
// by setback enforcement (Table VIII.2). The PSO path is not computed for R-1.
// However, the ISA/USA/TOSL values still apply for open space compliance.
//
// FIREWALL NOTE: Firewall status changes PSO by 5-15 percentage points
// (Table VIII.1 columns "e" vs "f"). R-1 has no firewalls permitted.

export const ZONING_TABLE: Record<ZoneClass, ZoningTableEntry> = {
  'R-1': {
    label: 'R-1 Low-Density Residential',
    psoNoFirewall: null,    // setback-only per IRR
    psoWithFirewall: null,
    isaPercent: 0.30, usaPercent: 0.15, toslPercent: 0.45,
    bhlStoreys: 3, bhlMeters: 10,
    flarMin: 1.50, flarMax: 1.50, tgfaMultiplier: 1.50,
    isResidential: true,
    firewallAllowed: [],
  },
  'R-2-basic': {
    label: 'R-2 Basic (Duplex/Rowhouse)',
    psoNoFirewall: 0.55, psoWithFirewall: 0.60,
    isaPercent: 0.30, usaPercent: 0.10, toslPercent: 0.40,
    bhlStoreys: 3, bhlMeters: 10,
    flarMin: 1.30, flarMax: 1.50, tgfaMultiplier: 1.50,
    isResidential: true,
    firewallAllowed: ['rear', 'left', 'right'],
  },
  'R-2-max': {
    label: 'R-2 Maximum (Apartment)',
    psoNoFirewall: 0.60, psoWithFirewall: 0.70,
    isaPercent: 0.20, usaPercent: 0.10, toslPercent: 0.30,
    bhlStoreys: 5, bhlMeters: 15,
    flarMin: 2.10, flarMax: 3.00, tgfaMultiplier: 1.50,
    isResidential: true,
    firewallAllowed: ['rear', 'left', 'right'],
  },
  'R-3-basic': {
    label: 'R-3 Basic Medium-Density Residential',
    psoNoFirewall: 0.60, psoWithFirewall: 0.70,
    isaPercent: 0.20, usaPercent: 0.10, toslPercent: 0.30,
    bhlStoreys: 3, bhlMeters: 10,
    flarMin: 1.80, flarMax: 2.10, tgfaMultiplier: 1.50,
    isResidential: true,
    firewallAllowed: ['rear', 'left', 'right'],
  },
  'R-3-max': {
    label: 'R-3 Maximum High-Density Residential',
    psoNoFirewall: 0.65, psoWithFirewall: 0.70,
    isaPercent: 0.20, usaPercent: 0.15, toslPercent: 0.35,
    bhlStoreys: 12, bhlMeters: 36,
    flarMin: 7.10, flarMax: 8.10, tgfaMultiplier: 1.50,
    isResidential: true,
    firewallAllowed: ['rear', 'left', 'right'],
  },
  'R-4': {
    label: 'R-4 High-Rise Condominium',
    psoNoFirewall: 0.70, psoWithFirewall: 0.80,
    isaPercent: 0.20, usaPercent: 0.10, toslPercent: 0.30,
    bhlStoreys: 3, bhlMeters: 10,
    flarMin: 1.60, flarMax: 1.80, tgfaMultiplier: 1.50,
    isResidential: true,
    firewallAllowed: ['rear', 'left', 'right'],
  },
  'R-5': {
    label: 'R-5 Very High-Density Residential',
    psoNoFirewall: 0.70, psoWithFirewall: 0.80,
    isaPercent: 0.20, usaPercent: 0.10, toslPercent: 0.30,
    bhlStoreys: 18, bhlMeters: 54,
    flarMin: 6.00, flarMax: 9.00, tgfaMultiplier: 1.50,
    isResidential: true,
    firewallAllowed: ['rear', 'left', 'right'],
  },
  'Com-1': {
    label: 'Com-1 Low-Intensity Commercial',
    psoNoFirewall: 0.65, psoWithFirewall: 0.75,
    isaPercent: 0.20, usaPercent: 0.15, toslPercent: 0.35,
    bhlStoreys: 5, bhlMeters: 15,
    flarMin: 1.70, flarMax: 3.00, tgfaMultiplier: 1.30,
    isResidential: false,
    firewallAllowed: ['rear', 'left', 'right'],
  },
  'Com-2': {
    label: 'Com-2 Medium-Intensity Commercial',
    psoNoFirewall: 0.75, psoWithFirewall: 0.85,
    isaPercent: 0.20, usaPercent: 0.05, toslPercent: 0.25,
    bhlStoreys: 6, bhlMeters: 18,
    flarMin: 3.60, flarMax: 9.00, tgfaMultiplier: 1.30,
    isResidential: false,
    firewallAllowed: ['rear', 'left', 'right'],
  },
  'Com-3': {
    label: 'Com-3 High-Intensity Commercial',
    psoNoFirewall: 0.80, psoWithFirewall: 0.90,
    isaPercent: 0.15, usaPercent: 0.05, toslPercent: 0.20,
    bhlStoreys: 48, bhlMeters: 180,
    flarMin: 9.00, flarMax: 34.00, tgfaMultiplier: 1.25,
    isResidential: false,
    firewallAllowed: ['rear', 'left', 'right'],
  },
  'Ind-1': {
    label: 'Ind-1 Light Industrial',
    psoNoFirewall: 0.70, psoWithFirewall: 0.80,
    isaPercent: 0.15, usaPercent: 0.15, toslPercent: 0.30,
    bhlStoreys: 3, bhlMeters: 10,
    flarMin: 1.50, flarMax: 2.50, tgfaMultiplier: 1.25,
    isResidential: false,
    firewallAllowed: ['rear', 'left', 'right'],
  },
  'Ind-2': {
    label: 'Ind-2 Medium Industrial',
    psoNoFirewall: 0.70, psoWithFirewall: 0.80,
    isaPercent: 0.15, usaPercent: 0.15, toslPercent: 0.30,
    bhlStoreys: 3, bhlMeters: 10,
    flarMin: 2.50, flarMax: 3.00, tgfaMultiplier: 1.25,
    isResidential: false,
    firewallAllowed: ['rear', 'left', 'right'],
  },
  'Ind-3': {
    label: 'Ind-3 Heavy Industrial',
    psoNoFirewall: 0.70, psoWithFirewall: 0.80,
    isaPercent: 0.15, usaPercent: 0.15, toslPercent: 0.30,
    bhlStoreys: 3, bhlMeters: 10,
    flarMin: 3.00, flarMax: 5.00, tgfaMultiplier: 1.25,
    isResidential: false,
    firewallAllowed: ['rear', 'left', 'right'],
  },
  'Institutional': {
    label: 'Institutional',
    psoNoFirewall: 0.50, psoWithFirewall: 0.60,
    isaPercent: 0.20, usaPercent: 0.30, toslPercent: 0.50,
    bhlStoreys: 3, bhlMeters: 10,
    flarMin: 2.50, flarMax: 2.50, tgfaMultiplier: 1.30,
    isResidential: false,
    firewallAllowed: ['rear', 'left', 'right'],
  },
  'Cultural': {
    label: 'Cultural',
    psoNoFirewall: 0.60, psoWithFirewall: 0.70,
    isaPercent: 0.20, usaPercent: 0.20, toslPercent: 0.40,
    bhlStoreys: 3, bhlMeters: 10,
    flarMin: 3.50, flarMax: 3.50, tgfaMultiplier: 1.30,
    isResidential: false,
    firewallAllowed: ['rear', 'left', 'right'],
  },
} as const

// ─── Table VIII.2 — Residential Minimum Setbacks (meters) ──────────────────
// R-1 uses height-band lookup (by RROW width).
// R-2 through R-5 use fixed values per zone.

type ResidentialZone = 'R-1' | 'R-2-basic' | 'R-2-max' | 'R-3-basic' | 'R-3-max' | 'R-4' | 'R-5'

export interface ResidentialSetbackEntry {
  front: number
  side: number
  rear: number
  note: string
}

export const RESIDENTIAL_SETBACKS: Record<ResidentialZone, ResidentialSetbackEntry> = {
  'R-1':       { front: 4.50, side: 2.00, rear: 2.00, note: 'Both sides required' },
  'R-2-basic': { front: 3.00, side: 2.00, rear: 2.00, note: 'One side only required' },
  'R-2-max':   { front: 8.00, side: 2.00, rear: 2.00, note: 'Front 8m at grade; upper floors 3m min. One side only.' },
  'R-3-basic': { front: 3.00, side: 2.00, rear: 2.00, note: 'Both sides required' },
  'R-3-max':   { front: 8.00, side: 2.00, rear: 2.00, note: 'Front 8m at grade; upper floors 3m. Abutments conditional.' },
  'R-4':       { front: 4.50, side: 0,    rear: 0,    note: 'Side and rear optional per §804.10' },
  'R-5':       { front: 6.00, side: 3.00, rear: 3.00, note: 'Side optional' },
}

// ─── Table VIII.3 — Commercial/Industrial Setbacks by RROW Width ───────────

export interface CommercialSetbackBand {
  minRrow: number     // inclusive
  maxRrow: number     // exclusive (Infinity for last)
  front: number
  side: number
  rear: number
}

export const COMMERCIAL_SETBACK_BANDS: CommercialSetbackBand[] = [
  { minRrow: 0,  maxRrow: 10, front: 5.00, side: 2.00, rear: 2.00 },
  { minRrow: 10, maxRrow: 15, front: 5.00, side: 2.00, rear: 2.00 },
  { minRrow: 15, maxRrow: 20, front: 5.00, side: 3.00, rear: 3.00 },
  { minRrow: 20, maxRrow: 25, front: 5.00, side: 3.00, rear: 3.00 },
  { minRrow: 25, maxRrow: 30, front: 6.00, side: 3.00, rear: 3.00 },
  { minRrow: 30, maxRrow: Infinity, front: 8.00, side: 5.00, rear: 5.00 },
]

// ─── Table VII.2 — RROW-based Building Height Limit ────────────────────────

export interface RrowBhlBand {
  minRrow: number     // inclusive
  maxRrow: number     // exclusive
  bhlStoreys: number
}

export const RROW_BHL_BANDS: RrowBhlBand[] = [
  { minRrow: 0,  maxRrow: 8,        bhlStoreys: 3  },
  { minRrow: 8,  maxRrow: 10,       bhlStoreys: 5  },
  { minRrow: 10, maxRrow: 12,       bhlStoreys: 5  },
  { minRrow: 12, maxRrow: 15,       bhlStoreys: 12 },
  { minRrow: 15, maxRrow: 20,       bhlStoreys: 15 },
  { minRrow: 20, maxRrow: 30,       bhlStoreys: 18 },
  { minRrow: 30, maxRrow: Infinity, bhlStoreys: 36 },
]

// ─── GFA Conversion Factors — Table VII.G.2 ────────────────────────────────

export const TGFA_MULTIPLIER = {
  residential: 1.50,
  commercial: 1.30,
  industrial: 1.25,
} as const

// ─── Code Citations ─────────────────────────────────────────────────────────

export const CITATIONS = {
  tla:      'PD 1096 IRR Rule VIII, Sec. 803',
  pso:      'PD 1096 IRR Rule VIII, Sec. 803, Table VIII.1',
  ambf:     'PD 1096 IRR Rule VIII, Sec. 803, Table VIII.1',
  setbacks: 'PD 1096 IRR Rule VII, Sec. 704 + Rule VIII, Sec. 804, Tables VIII.2/VIII.3',
  isa:      'PD 1096 IRR Rule VIII, Sec. 803, Table VIII.1',
  usa:      'PD 1096 IRR Rule VIII, Sec. 803, Table VIII.1',
  tosl:     'PD 1096 IRR Rule VIII, Sec. 803, Table VIII.1 (note d)',
  maca:     'PD 1096 IRR Rule VIII, Sec. 803, Table VIII.1 (note c)',
  gfa:      'PD 1096 IRR Rule VII, Sec. 705, Table VII.G.1',
  tgfa:     'PD 1096 IRR Rule VII, Sec. 705, Table VII.G.2',
  flar:     'PD 1096 IRR Rule VII Guidelines, Table VII.G.1',
  bhl:      'PD 1096 IRR Rule VII, Sec. 707, Table VII.2',
  amvb:     'PD 1096 IRR Rule VII Guidelines — Angular Plane ⚠️ AUDIT FLAG',
  incremental: 'PD 1096 IRR Rule VIII, Sec. 804.6',
  firewall: 'PD 1096 IRR Rule VII, Sec. 704.4c',
  closure:  'PD 1096 IRR Rule VIII, Sec. 803 Note (d): TLA = AMBF + ISA + USA',
} as const

// ─── Lookup Helpers ─────────────────────────────────────────────────────────

const ZONE_CLASSES = Object.keys(ZONING_TABLE) as ZoneClass[]

export function getZoningEntry(zoneClass: ZoneClass): ZoningTableEntry {
  const entry = ZONING_TABLE[zoneClass]
  if (!entry) throw new Error(`Unknown zoning class: ${zoneClass}. Valid: ${ZONE_CLASSES.join(', ')}`)
  return entry
}

export function isResidentialZone(zoneClass: ZoneClass): boolean {
  return getZoningEntry(zoneClass).isResidential
}

export function lookupRrowBhl(rrowWidth: number): number {
  const band = RROW_BHL_BANDS.find(b => rrowWidth >= b.minRrow && rrowWidth < b.maxRrow)
  return band?.bhlStoreys ?? 3
}

export function lookupCommercialSetbacks(rrowWidth: number): { front: number; side: number; rear: number } {
  const band = COMMERCIAL_SETBACK_BANDS.find(b => rrowWidth >= b.minRrow && rrowWidth < b.maxRrow)
    ?? COMMERCIAL_SETBACK_BANDS[COMMERCIAL_SETBACK_BANDS.length - 1]
  return { front: band.front, side: band.side, rear: band.rear }
}

/** Returns the effective PSO for the given zone and firewall status. null if PSO path not applicable (R-1). */
export function lookupPSO(zoneClass: ZoneClass, firewallActive: boolean): number | null {
  const entry = getZoningEntry(zoneClass)
  return firewallActive ? entry.psoWithFirewall : entry.psoNoFirewall
}

/** Returns the FLAR midpoint for parametric display. Exam mode should show full range. */
export function lookupFLAR(zoneClass: ZoneClass): { min: number; max: number; mid: number } {
  const entry = getZoningEntry(zoneClass)
  return {
    min: entry.flarMin,
    max: entry.flarMax,
    mid: (entry.flarMin + entry.flarMax) / 2,
  }
}

/** Returns TGFA multiplier based on zone classification. */
export function lookupTGFAMultiplier(zoneClass: ZoneClass): number {
  const entry = getZoningEntry(zoneClass)
  if (entry.isResidential) return TGFA_MULTIPLIER.residential
  if (zoneClass.startsWith('Ind')) return TGFA_MULTIPLIER.industrial
  return TGFA_MULTIPLIER.commercial
}

/** Returns all valid ZoneClass values. */
export function getAllZoneClasses(): ZoneClass[] {
  return [...ZONE_CLASSES]
}
