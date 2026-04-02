// src/app/calculators/_lib/unit-conversion.ts
// Unit conversion utilities. Store values are always in mm/sq.m. internally.
// These convert for display only.

export type UnitSystem = 'metric' | 'imperial'

export function mmToDisplay(mm: number, system: UnitSystem): { value: number; unit: string } {
  if (system === 'imperial') {
    const inches = mm / 25.4
    if (inches >= 12) {
      return { value: Math.round(inches / 12 * 100) / 100, unit: 'ft' }
    }
    return { value: Math.round(inches * 100) / 100, unit: 'in' }
  }
  return { value: mm, unit: 'mm' }
}

export function displayToMm(value: number, unit: string): number {
  switch (unit) {
    case 'in': return value * 25.4
    case 'ft': return value * 304.8
    default: return value // mm
  }
}

export function sqmToDisplay(sqm: number, system: UnitSystem): { value: number; unit: string } {
  if (system === 'imperial') {
    return { value: Math.round(sqm * 10.7639 * 100) / 100, unit: 'sq.ft.' }
  }
  return { value: sqm, unit: 'sq.m.' }
}

export function litersToDisplay(liters: number, system: UnitSystem): { value: number; unit: string } {
  if (system === 'imperial') {
    return { value: Math.round(liters * 0.264172 * 100) / 100, unit: 'gal' }
  }
  return { value: liters, unit: 'L' }
}
