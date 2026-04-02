// src/app/calculators/_lib/paint-engine.ts
// Pure paint estimation computation engine.

export interface PaintInputs {
  inputMode: 'room' | 'wall-by-wall'
  roomLengthMm: number
  roomWidthMm: number
  wallHeightMm: number
  wallSegments: Array<{
    id: string
    lengthMm: number
    heightMm: number
  }>
  openings: Array<{
    id: string
    type: 'door' | 'window'
    widthMm: number
    heightMm: number
    wallId: string
    xOffsetMm: number
    yOffsetMm: number
  }>
  includeCeiling: boolean
  ceilingAreaOverrideSqm: number | null
  substrateType: 'new-concrete' | 'repaint' | 'exterior'
  coatsTopcoat: number
  coatsPrimer: number
  topcoatCoverageSqmPerLiter: number
  primerCoverageSqmPerLiter: number
  wastePercent: number
  canSizesAvailable: number[]
  selectedColorHex: string
}

export interface PaintEstimate {
  grossWallAreaSqm: number
  openingAreaSqm: number
  netWallAreaSqm: number
  ceilingAreaSqm: number
  basePaintableAreaSqm: number
  topcoatCoats: number
  primerCoats: number
  adjustedTopcoatAreaSqm: number
  topcoatLiters: number
  primerLiters: number | null
  topcoatCanSuggestion: Array<{ sizeLiters: number; quantity: number }>
  primerCanSuggestion: Array<{ sizeLiters: number; quantity: number }> | null
  wastePercentApplied: number
  wallAreas: Array<{
    wallId: string
    grossSqm: number
    openingsSqm: number
    netSqm: number
  }>
  assumptions: string[]
}

/** Compute optimal can combination for a given volume */
function computeCanSuggestion(
  liters: number,
  canSizes: number[],
): Array<{ sizeLiters: number; quantity: number }> {
  if (canSizes.length === 0 || liters <= 0) return []
  // Sort descending
  const sorted = [...canSizes].sort((a, b) => b - a)
  const result: Array<{ sizeLiters: number; quantity: number }> = []
  let remaining = liters

  for (const size of sorted) {
    if (remaining <= 0) break
    const qty = Math.floor(remaining / size)
    if (qty > 0) {
      result.push({ sizeLiters: size, quantity: qty })
      remaining -= qty * size
    }
  }
  // Round up remainder to smallest can
  if (remaining > 0) {
    const smallest = sorted[sorted.length - 1]
    const existing = result.find((r) => r.sizeLiters === smallest)
    if (existing) {
      existing.quantity += 1
    } else {
      result.push({ sizeLiters: smallest, quantity: 1 })
    }
  }
  return result
}

export function computePaintEstimate(inputs: PaintInputs): PaintEstimate {
  // Gross wall area
  let grossWallAreaSqm: number
  const wallAreas: PaintEstimate['wallAreas'] = []

  if (inputs.inputMode === 'room') {
    // Room mode: 2(L + W) × H
    grossWallAreaSqm =
      (2 * (inputs.roomLengthMm + inputs.roomWidthMm) * inputs.wallHeightMm) / 1_000_000

    // Generate 4 walls for per-wall breakdown
    const walls = [
      { id: 'wall-front', lengthMm: inputs.roomLengthMm },
      { id: 'wall-right', lengthMm: inputs.roomWidthMm },
      { id: 'wall-back', lengthMm: inputs.roomLengthMm },
      { id: 'wall-left', lengthMm: inputs.roomWidthMm },
    ]
    for (const wall of walls) {
      const gross = (wall.lengthMm * inputs.wallHeightMm) / 1_000_000
      const openingsSqm = inputs.openings
        .filter((o) => o.wallId === wall.id)
        .reduce((sum, o) => sum + (o.widthMm * o.heightMm) / 1_000_000, 0)
      wallAreas.push({
        wallId: wall.id,
        grossSqm: gross,
        openingsSqm,
        netSqm: Math.max(0, gross - openingsSqm),
      })
    }
  } else {
    // Wall-by-wall mode
    grossWallAreaSqm = inputs.wallSegments.reduce(
      (sum, seg) => sum + (seg.lengthMm * seg.heightMm) / 1_000_000,
      0,
    )
    for (const seg of inputs.wallSegments) {
      const gross = (seg.lengthMm * seg.heightMm) / 1_000_000
      const openingsSqm = inputs.openings
        .filter((o) => o.wallId === seg.id)
        .reduce((sum, o) => sum + (o.widthMm * o.heightMm) / 1_000_000, 0)
      wallAreas.push({
        wallId: seg.id,
        grossSqm: gross,
        openingsSqm,
        netSqm: Math.max(0, gross - openingsSqm),
      })
    }
  }

  // Opening area
  const openingAreaSqm = inputs.openings.reduce(
    (sum, o) => sum + (o.widthMm * o.heightMm) / 1_000_000,
    0,
  )

  // Net wall area
  const netWallAreaSqm = Math.max(0, grossWallAreaSqm - openingAreaSqm)

  // Ceiling area
  let ceilingAreaSqm = 0
  if (inputs.includeCeiling) {
    if (inputs.ceilingAreaOverrideSqm != null) {
      ceilingAreaSqm = inputs.ceilingAreaOverrideSqm
    } else if (inputs.inputMode === 'room') {
      ceilingAreaSqm = (inputs.roomLengthMm * inputs.roomWidthMm) / 1_000_000
    }
  }

  // Base paintable area
  const basePaintableAreaSqm = netWallAreaSqm + ceilingAreaSqm

  // Adjusted topcoat area (waste + coats)
  const wasteFraction = inputs.wastePercent / 100
  const adjustedTopcoatAreaSqm =
    basePaintableAreaSqm * (1 + wasteFraction) * inputs.coatsTopcoat

  // Topcoat liters
  const topcoatLiters =
    inputs.topcoatCoverageSqmPerLiter > 0
      ? adjustedTopcoatAreaSqm / inputs.topcoatCoverageSqmPerLiter
      : 0

  // Primer
  let primerLiters: number | null = null
  if (inputs.coatsPrimer > 0 && inputs.primerCoverageSqmPerLiter > 0) {
    const primerArea = basePaintableAreaSqm * inputs.coatsPrimer
    primerLiters = primerArea / inputs.primerCoverageSqmPerLiter
  }

  // Can suggestions
  const topcoatCanSuggestion = computeCanSuggestion(topcoatLiters, inputs.canSizesAvailable)
  const primerCanSuggestion =
    primerLiters != null
      ? computeCanSuggestion(primerLiters, inputs.canSizesAvailable)
      : null

  // Assumptions
  const assumptions: string[] = [
    `Substrate: ${inputs.substrateType.replace(/-/g, ' ')}`,
    `Topcoat: ${inputs.coatsTopcoat} coat${inputs.coatsTopcoat !== 1 ? 's' : ''} at ${inputs.topcoatCoverageSqmPerLiter} sq.m./liter`,
    `Waste allowance: ${inputs.wastePercent}%`,
  ]
  if (inputs.coatsPrimer > 0) {
    assumptions.push(
      `Primer: ${inputs.coatsPrimer} coat at ${inputs.primerCoverageSqmPerLiter} sq.m./liter`,
    )
  }
  if (inputs.includeCeiling) {
    assumptions.push(
      inputs.ceilingAreaOverrideSqm != null
        ? `Ceiling area: ${inputs.ceilingAreaOverrideSqm} sq.m. (manual override)`
        : 'Ceiling area: computed from room dimensions',
    )
  }

  return {
    grossWallAreaSqm,
    openingAreaSqm,
    netWallAreaSqm,
    ceilingAreaSqm,
    basePaintableAreaSqm,
    topcoatCoats: inputs.coatsTopcoat,
    primerCoats: inputs.coatsPrimer,
    adjustedTopcoatAreaSqm,
    topcoatLiters,
    primerLiters,
    topcoatCanSuggestion,
    primerCanSuggestion,
    wastePercentApplied: inputs.wastePercent,
    wallAreas,
    assumptions,
  }
}
