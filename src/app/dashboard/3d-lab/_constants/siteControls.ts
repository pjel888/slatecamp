// src/app/dashboard/3d-lab/_constants/siteControls.ts
// 2004 Revised IRR of PD 1096 — Rule VIII, Section 803, Table VIII.1
// Site Development Controls: PSO, ISA, USA percentages per zoning class
//
// AUTHORITY: "PD 1096 Rules VII & VIII — Formula Fact-Check & Corrections"
// All values sourced from Table VIII.1 of the 2004 Revised IRR.
// DO NOT modify without cross-referencing the official IRR text.

import { ZoningClass } from './nbcp'

// ─── Table VIII.1 Entry ──────────────────────────────────────────────────────
// Each entry encodes the area development control percentages for a zoning class.
// All percentages are decimals relative to TLA (e.g., 0.50 = 50% of TLA).
//
// maxPSO = Maximum Percentage of Site Occupancy (max building footprint / TLA)
//          PSO is a RATIO, not an area. (Fact-Check: "PSO = AMBF / TLA")
// maxISA = Maximum Impervious Surface Area as fraction of TLA
// minUSA = Minimum Unpaved Surface Area as fraction of TLA
//
// Key identity: maxPSO + (1 - maxPSO) = 1.0, and TOSL = ISA + USA = TLA - AMBF

export interface SiteControlZoning {
  label: string
  maxPSO: number        // 0.0–1.0, max lot coverage
  maxISA: number        // 0.0–1.0, max impervious surface as % of TLA
  minUSA: number        // 0.0–1.0, min unpaved surface as % of TLA
  isResidential: boolean
}

// ─── Table VIII.1 Data ───────────────────────────────────────────────────────
// Column "e" = without firewall (basic). Column "f" = with firewall.
// This module uses the "e" (basic, no firewall) values as default.
//
// R-1 basic (no firewall): PSO = 50%, ISA = 30%, USA = 20%
//   Check: PSO + TOSL = 50% + (30% + 20%) = 50% + 50% = 100% ✓
//
// CRITICAL: R-1 max PSO is 50%, NOT 60% as in the flawed engineering plan.
//           (Fact-Check: "Per Table VIII.1, R-1 without firewall (Basic) = 50% PSO")

export const SITE_CONTROL_TABLE: Record<ZoningClass, SiteControlZoning> = {
  [ZoningClass.R1]: {
    label: 'R-1 Low-Density Residential (Basic)',
    maxPSO: 0.50,
    maxISA: 0.30,
    minUSA: 0.20,
    isResidential: true,
  },
  [ZoningClass.R2_BASIC]: {
    label: 'R-2 Basic (Duplex/Rowhouse)',
    maxPSO: 0.65,
    maxISA: 0.20,
    minUSA: 0.15,
    isResidential: true,
  },
  [ZoningClass.R2_MAX]: {
    label: 'R-2 Max (Apartment)',
    maxPSO: 0.70,
    maxISA: 0.18,
    minUSA: 0.12,
    isResidential: true,
  },
  [ZoningClass.R3]: {
    label: 'R-3 High-Density Residential',
    maxPSO: 0.70,
    maxISA: 0.18,
    minUSA: 0.12,
    isResidential: true,
  },
  [ZoningClass.R4]: {
    label: 'R-4 High-Rise Condominium',
    maxPSO: 0.70,
    maxISA: 0.18,
    minUSA: 0.12,
    isResidential: true,
  },
  [ZoningClass.R5]: {
    label: 'R-5 Very High-Density Residential',
    maxPSO: 0.60,
    maxISA: 0.24,
    minUSA: 0.16,
    isResidential: true,
  },
  [ZoningClass.C1]: {
    label: 'C-1 Low-Intensity Commercial',
    maxPSO: 0.80,
    maxISA: 0.12,
    minUSA: 0.08,
    isResidential: false,
  },
  [ZoningClass.C2]: {
    label: 'C-2 Medium-Intensity Commercial',
    maxPSO: 0.80,
    maxISA: 0.12,
    minUSA: 0.08,
    isResidential: false,
  },
  [ZoningClass.C3]: {
    label: 'C-3 High-Intensity Commercial',
    maxPSO: 0.70,
    maxISA: 0.18,
    minUSA: 0.12,
    isResidential: false,
  },
  [ZoningClass.I1]: {
    label: 'I-1 Light Industrial',
    maxPSO: 0.70,
    maxISA: 0.18,
    minUSA: 0.12,
    isResidential: false,
  },
  [ZoningClass.I2]: {
    label: 'I-2 Medium Industrial',
    maxPSO: 0.60,
    maxISA: 0.24,
    minUSA: 0.16,
    isResidential: false,
  },
} as const

// ─── Code Citations ──────────────────────────────────────────────────────────
// Corrected citations from the Fact-Check document.
// The engineering plan had WRONG section numbers for most of these.

export const SITE_CONTROL_CITATIONS = {
  tla:      'PD 1096 IRR Rule VIII, Sec. 803',
  pso:      'PD 1096 IRR Rule VIII, Sec. 803, Table VIII.1',
  ambf:     'PD 1096 IRR Rule VIII, Sec. 803, Table VIII.1',
  isa:      'PD 1096 IRR Rule VIII, Sec. 803, Table VIII.1',
  usa:      'PD 1096 IRR Rule VIII, Sec. 803, Table VIII.1',
  tosl:     'PD 1096 IRR Rule VIII, Sec. 803, Table VIII.1 (note d)',
  maca:     'PD 1096 IRR Rule VIII, Sec. 803, Table VIII.1 (note c)',
  setbacks: 'PD 1096 IRR Rule VII, Sec. 704 + Rule VIII, Sec. 804, Tables VIII.2/VIII.3',
} as const
