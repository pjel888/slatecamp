// src/features/3d-lab/constants/nbcp.ts
// 2004 Revised IRR of PD 1096 — Rules VII & VIII
// IMPORTANT: Every value here is sourced from the IRR. Do NOT modify without
// cross-referencing the 2004 Revised Implementing Rules and Regulations of PD 1096.

// ─── Enums ────────────────────────────────────────────────────────────────────

export enum ZoningClass {
  R1       = 'R1',
  R2_BASIC = 'R2_BASIC',
  R2_MAX   = 'R2_MAX',
  R3       = 'R3',
  R4       = 'R4',
  R5       = 'R5',
  C1       = 'C1',
  C2       = 'C2',
  C3       = 'C3',
  I1       = 'I1',
  I2       = 'I2',
}

export enum LotType {
  INSIDE = 'INSIDE',
  CORNER = 'CORNER',
  THROUGH = 'THROUGH',
  END    = 'END',
}

// ─── Zoning Table ─────────────────────────────────────────────────────────────
// IRR Rule VII Guidelines Table VII.G.1 — FLAR Designations
// IRR Rule VII §707 + Table VII.2 — Building Height Limits
// IRR Rule VIII §802-803 — Percentage of Site Occupancy (PSO)
//
// flar: mid-range of the allowed FLAR band for simulation
// pso_inside: used for INSIDE and THROUGH lots (0.0–1.0 decimal, e.g. 0.80 = 80%)
// pso_corner: used for CORNER lots only; END lots use pso_inside

export interface ZoningEntry {
  label: string
  flar: number
  bhl_storeys: number
  pso_inside: number  // also used for THROUGH and END lots
  pso_corner: number  // CORNER lots only
  isResidential: boolean
}

export const ZONING_TABLE: Record<ZoningClass, ZoningEntry> = {
  [ZoningClass.R1]:       { label: 'R-1 Low-Density Residential',        flar: 1.20, bhl_storeys: 3,  pso_inside: 0.80, pso_corner: 0.80, isResidential: true  },
  [ZoningClass.R2_BASIC]: { label: 'R-2 Basic (Duplex/Rowhouse)',         flar: 2.00, bhl_storeys: 3,  pso_inside: 0.80, pso_corner: 0.85, isResidential: true  },
  [ZoningClass.R2_MAX]:   { label: 'R-2 Max (Apartment)',                 flar: 3.00, bhl_storeys: 5,  pso_inside: 0.80, pso_corner: 0.85, isResidential: true  },
  [ZoningClass.R3]:       { label: 'R-3 High-Density Residential',        flar: 5.00, bhl_storeys: 12, pso_inside: 0.70, pso_corner: 0.75, isResidential: true  },
  [ZoningClass.R4]:       { label: 'R-4 High-Rise Condominium',           flar: 7.50, bhl_storeys: 18, pso_inside: 0.70, pso_corner: 0.75, isResidential: true  },
  [ZoningClass.R5]:       { label: 'R-5 Very High-Density Residential',   flar: 9.00, bhl_storeys: 36, pso_inside: 0.60, pso_corner: 0.65, isResidential: true  },
  [ZoningClass.C1]:       { label: 'C-1 Low-Intensity Commercial',        flar: 2.80, bhl_storeys: 5,  pso_inside: 0.80, pso_corner: 0.85, isResidential: false },
  [ZoningClass.C2]:       { label: 'C-2 Medium-Intensity Commercial',     flar: 6.30, bhl_storeys: 15, pso_inside: 0.80, pso_corner: 0.85, isResidential: false },
  [ZoningClass.C3]:       { label: 'C-3 High-Intensity Commercial',       flar: 12.00, bhl_storeys: 30, pso_inside: 0.70, pso_corner: 0.75, isResidential: false },
  [ZoningClass.I1]:       { label: 'I-1 Light Industrial',                flar: 1.75, bhl_storeys: 5,  pso_inside: 0.70, pso_corner: 0.75, isResidential: false },
  [ZoningClass.I2]:       { label: 'I-2 Medium Industrial',               flar: 1.25, bhl_storeys: 3,  pso_inside: 0.60, pso_corner: 0.65, isResidential: false },
} as const

// ─── RROW → BHL Cap ───────────────────────────────────────────────────────────
// IRR Rule VII §707 + Table VII.2
// CRITICAL: minRrow uses >= (inclusive lower bound). 8.00m → 5 storeys (8.00–9.99m band).

export interface RrowBhlEntry {
  minRrow: number   // inclusive
  maxRrow: number   // exclusive (except last entry which is Infinity)
  bhl_storeys: number
}

export const RROW_BHL_TABLE: RrowBhlEntry[] = [
  { minRrow: 0,    maxRrow: 8,    bhl_storeys: 3  },  // < 8m
  { minRrow: 8,    maxRrow: 10,   bhl_storeys: 5  },  // 8.00–9.99m
  { minRrow: 10,   maxRrow: 12,   bhl_storeys: 5  },  // 10.00–11.99m
  { minRrow: 12,   maxRrow: 15,   bhl_storeys: 12 },  // 12.00–14.99m
  { minRrow: 15,   maxRrow: 20,   bhl_storeys: 15 },  // 15.00–19.99m
  { minRrow: 20,   maxRrow: 30,   bhl_storeys: 18 },  // 20.00–29.99m
  { minRrow: 30,   maxRrow: Infinity, bhl_storeys: 36 }, // 30m+
] as const

// ─── Setback Tables ───────────────────────────────────────────────────────────

export interface SetbackValues {
  front: number
  side: number
  rear: number
}

// IRR Rule VIII Table VIII.2 — R-1 Residential only, by building height
// Note: Table VIII.2 is height-band based (not continuous incremental).
// The incremental setback rule (§804.6) is applied ON TOP of these values.
export interface R1SetbackEntry {
  maxStoreys: number
  setbacksIfRrowBelow10: SetbackValues
  setbacksIfRrowAtLeast10: SetbackValues
}

export const SETBACK_TABLE_R1: R1SetbackEntry[] = [
  {
    maxStoreys: 2,
    setbacksIfRrowBelow10:    { front: 3.0, side: 1.5, rear: 2.0 },
    setbacksIfRrowAtLeast10:  { front: 4.5, side: 1.5, rear: 2.0 },
  },
  {
    maxStoreys: 3,
    setbacksIfRrowBelow10:    { front: 4.5, side: 2.0, rear: 2.0 },
    setbacksIfRrowAtLeast10:  { front: 4.5, side: 2.0, rear: 2.0 },
  },
] as const

// IRR Rule VIII Table VIII.3 — Non-residential and higher-density, by RROW width
export interface GeneralSetbackEntry {
  minRrow: number   // inclusive
  maxRrow: number   // exclusive
  setbacks: SetbackValues
}

export const SETBACK_TABLE_GENERAL: GeneralSetbackEntry[] = [
  { minRrow: 0,   maxRrow: 15,  setbacks: { front: 5.0, side: 2.0, rear: 2.0 } },
  { minRrow: 15,  maxRrow: 20,  setbacks: { front: 5.0, side: 3.0, rear: 3.0 } },
  { minRrow: 20,  maxRrow: 30,  setbacks: { front: 6.0, side: 3.0, rear: 3.0 } },
  { minRrow: 30,  maxRrow: Infinity, setbacks: { front: 8.0, side: 5.0, rear: 5.0 } },
] as const

// ─── Firewall Permissions ─────────────────────────────────────────────────────
// IRR Rule VII — firewall provisions by zone
// R-1: no firewalls permitted on any property line
// R-2: rear and side property lines only (not front/RROW-facing)
// R-3+, Commercial, Industrial: rear and side property lines

export type FirewallSide = 'front' | 'rear' | 'left' | 'right'

export const FIREWALL_ALLOWED: Record<ZoningClass, FirewallSide[]> = {
  [ZoningClass.R1]:       [],
  [ZoningClass.R2_BASIC]: ['rear', 'left', 'right'],
  [ZoningClass.R2_MAX]:   ['rear', 'left', 'right'],
  [ZoningClass.R3]:       ['rear', 'left', 'right'],
  [ZoningClass.R4]:       ['rear', 'left', 'right'],
  [ZoningClass.R5]:       ['rear', 'left', 'right'],
  [ZoningClass.C1]:       ['rear', 'left', 'right'],
  [ZoningClass.C2]:       ['rear', 'left', 'right'],
  [ZoningClass.C3]:       ['rear', 'left', 'right'],
  [ZoningClass.I1]:       ['rear', 'left', 'right'],
  [ZoningClass.I2]:       ['rear', 'left', 'right'],
} as const

// ─── GFA Conversion Factors ───────────────────────────────────────────────────
// IRR Rule VII Guidelines — TGFA = GFA × conversionFactor
export const GFA_CONVERSION = {
  residential:    1.2,
  nonResidential: 1.3,
} as const

// ─── Lookup Helpers ───────────────────────────────────────────────────────────

/** Returns BHL cap (storeys) from RROW width. Uses >= on lower bound. */
export function getRrowBhl(rrowWidth: number): number {
  const entry = RROW_BHL_TABLE.find(e => rrowWidth >= e.minRrow && rrowWidth < e.maxRrow)
  return entry?.bhl_storeys ?? 3
}

/** Returns base setbacks (before incremental) for a given zone and RROW. */
export function getBaseSetbacks(
  zoningClass: ZoningClass,
  rrowWidth: number,
  bhlEffective: number,
): SetbackValues {
  if (zoningClass === ZoningClass.R1) {
    const entry = SETBACK_TABLE_R1.find(e => bhlEffective <= e.maxStoreys)
      ?? SETBACK_TABLE_R1[SETBACK_TABLE_R1.length - 1]
    return rrowWidth < 10
      ? { ...entry.setbacksIfRrowBelow10 }
      : { ...entry.setbacksIfRrowAtLeast10 }
  }
  const entry = SETBACK_TABLE_GENERAL.find(e => rrowWidth >= e.minRrow && rrowWidth < e.maxRrow)
    ?? SETBACK_TABLE_GENERAL[SETBACK_TABLE_GENERAL.length - 1]
  return { ...entry.setbacks }
}
