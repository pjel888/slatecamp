// src/app/calculators/_lib/input-validation.ts
// Input validation bounds for calculator number fields.

export function clampInput(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

export const VALIDATION = {
  roomLengthMm: { min: 100, max: 30000 },
  roomWidthMm: { min: 100, max: 30000 },
  wallLengthMm: { min: 100, max: 30000 },
  wallHeightMm: { min: 1000, max: 10000 },
  tileLengthMm: { min: 50, max: 2000 },
  tileWidthMm: { min: 50, max: 2000 },
  groutJointMm: { min: 0, max: 20 },
  wastePercent: { min: 0, max: 50 },
  includeSparePercent: { min: 0, max: 30 },
  boxCoverageSqm: { min: 0.1, max: 100 },
  coatsTopcoat: { min: 1, max: 5 },
  coatsPrimer: { min: 0, max: 3 },
  topcoatCoverageSqmPerLiter: { min: 1, max: 50 },
  primerCoverageSqmPerLiter: { min: 1, max: 50 },
  studSpacingMm: { min: 200, max: 1200 },
  boardLengthMm: { min: 600, max: 5000 },
  boardWidthMm: { min: 300, max: 2500 },
  trackStockLengthMm: { min: 1000, max: 6000 },
} as const

export type ValidatedField = keyof typeof VALIDATION

/** Get min/max for a field, or undefined if not a validated field */
export function getValidation(field: string): { min: number; max: number } | undefined {
  return VALIDATION[field as ValidatedField]
}
