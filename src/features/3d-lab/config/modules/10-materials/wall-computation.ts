// src/features/3d-lab/config/modules/10-materials/wall-computation.ts
// Pure computation engine — NO Three.js, NO React, NO store
// Input: raw parameter map. Output: immutable ComputedWallState.

import type {
  CoreType,
  ComputedWallState,
  StructuralData,
  CHBStructural,
  DrywallStructural,
  ConcreteStructural,
  GenericStructural,
  PerformanceMetrics,
  BOMEntry,
  LayerStackEntry,
} from './wall-types'
import { WALL_CORE_REGISTRY } from './wall-core-registry'
import { WALL_CODES, LAYER_THICKNESSES, PAINT_COLORS } from './wall-constants'
import {
  FIRE_RATING_BASE,
  FIRE_RATING_BONUSES,
  STC_BASE,
  STC_BONUSES,
  R_VALUE_BASE,
  R_VALUE_BONUSES,
  MATERIAL_COSTS_PHP,
  MATERIAL_QUANTITIES,
  WASTE_FACTORS,
  LABOR_RATES_PHP,
} from './wall-constants-performance'

// ─── Param Helpers ──────────────────────────────────────────────────────────

const num = (v: number | string | boolean): number => typeof v === 'number' ? v : Number(v)
const str = (v: number | string | boolean): string => String(v)
const bool = (v: number | string | boolean): boolean => v === true || v === 'true'

// ─── Fire Rating Label Formatter ────────────────────────────────────────────

const formatFireLabel = (mins: number): string => {
  if (mins < 60) return `${mins} min`
  const hrs = Math.floor(mins / 60)
  const rem = mins % 60
  return rem > 0 ? `${hrs} hr ${rem} min` : `${hrs} ${hrs === 1 ? 'hour' : 'hours'}`
}

// ─── Layer Stack Builder ────────────────────────────────────────────────────

const buildLayerStack = (
  registryEntry: { supportsPlaster: boolean },
  showPlaster: boolean,
  showSkim: boolean,
  showPrimer: boolean,
  showPaint: boolean,
  bothSides: boolean,
  paintColor: string,
): LayerStackEntry[] => {
  const layers: LayerStackEntry[] = []

  const sides: Array<'front' | 'back'> = bothSides ? ['front', 'back'] : ['front']

  const layerDefs: Array<{
    id: string
    label: string
    thickness: number
    color: string
    opacity: number
    active: boolean
  }> = [
    {
      id: 'plaster',
      label: 'Plaster',
      thickness: LAYER_THICKNESSES.plaster,
      color: '#d4d0ca',
      opacity: 0.85,
      active: showPlaster && registryEntry.supportsPlaster,
    },
    {
      id: 'skim',
      label: 'Skim Coat',
      thickness: LAYER_THICKNESSES.skimCoat,
      color: '#f5f5f0',
      opacity: 0.9,
      active: showSkim,
    },
    {
      id: 'primer',
      label: 'Primer',
      thickness: LAYER_THICKNESSES.primer,
      color: '#e8e8e8',
      opacity: 0.8,
      active: showPrimer,
    },
    {
      id: 'paint',
      label: `Paint — ${paintColor}`,
      thickness: LAYER_THICKNESSES.paint,
      color: PAINT_COLORS[paintColor] ?? '#ffffff',
      opacity: 0.9,
      active: showPaint,
    },
  ]

  for (const side of sides) {
    let cumOffset = 0
    for (const def of layerDefs) {
      if (!def.active) continue
      cumOffset += def.thickness
      layers.push({
        id: `layer-${side}-${def.id}`,
        label: def.label,
        thickness: def.thickness,
        cumulativeOffset: cumOffset,
        color: def.color,
        opacity: def.opacity,
        side,
      })
    }
  }

  return layers
}

// ─── Structural Data Resolution ─────────────────────────────────────────────

const resolveStructural = (
  coreType: CoreType,
  params: Record<string, number | boolean | string>,
): StructuralData => {
  switch (coreType) {
    case 'chb': {
      const showReinforcement = bool(params.showReinforcement ?? true)
      return {
        type: 'chb',
        rebarSpacingMm: num(params.rebarSpacing ?? 800),
        rebarDiameterMm: num(params.rebarDiameter ?? 10),
        bondBeamIntervalCourses: num(params.bondBeamInterval ?? 3),
        chbSizeMm: num(params.chbSize ?? 150),
        showReinforcement,
        showStiffenerColumns: false,
        groutingLevel: showReinforcement ? 'partial' : 'none',
      } satisfies CHBStructural
    }
    case 'drywall':
    case 'plywood':
    case 'cement-board': {
      return {
        type: 'drywall',
        studSpacingMm: num(params.studSpacing ?? 600),
        studDepthMm: num(params.studDepth ?? 92),
        gypsumThicknessMm: num(params.gypsumThickness ?? 12.5),
        gypsumLayers: (num(params.gypsumLayers ?? 1) === 2 ? 2 : 1),
        showInsulation: bool(params.showInsulation ?? false),
        showBridging: bool(params.showBridging ?? false),
        insulationType: 'fiberglass',
      } satisfies DrywallStructural
    }
    case 'solid-concrete': {
      return {
        type: 'concrete',
        rebarMeshSpacingMm: 200,
        rebarDiameterMm: 10,
        showReinforcement: bool(params.showReinforcement ?? true),
      } satisfies ConcreteStructural
    }
    case 'brick':
    case 'existing-wall': {
      return { type: 'generic' } satisfies GenericStructural
    }
  }
}

// ─── Performance Estimation ─────────────────────────────────────────────────
// ⚠️ ALL PERFORMANCE VALUES ARE UNVERIFIED — approximate for educational use

const computePerformance = (
  coreType: CoreType,
  structural: StructuralData,
  showPlaster: boolean,
  bothSides: boolean,
  wallAreaSqm: number,
): PerformanceMetrics => {
  // ── Fire rating ── ⚠️ UNVERIFIED
  const fireBase = FIRE_RATING_BASE[coreType]
  let fireBonus = 0
  if (structural.type === 'drywall') {
    const gypsumKey = String(structural.gypsumThicknessMm) as '12.5' | '15.9'
    fireBonus += (FIRE_RATING_BONUSES.gypsumLayerBonus[gypsumKey] ?? 0)
      * structural.gypsumLayers
      * (bothSides ? 2 : 1)
  }
  if (structural.type === 'chb') {
    fireBonus += FIRE_RATING_BONUSES.groutingBonus[structural.groutingLevel]
  }
  if (showPlaster) {
    fireBonus += FIRE_RATING_BONUSES.plasterBonusPerSide * (bothSides ? 2 : 1)
  }
  const fireRatingMinutes = fireBase + fireBonus

  // ── STC ── ⚠️ UNVERIFIED
  const stcBase = STC_BASE[coreType]
  let stcBonus = 0
  if (structural.type === 'drywall' && structural.showInsulation) {
    stcBonus += STC_BONUSES.insulationBonus
  }
  if (showPlaster) {
    stcBonus += STC_BONUSES.surfaceSealBonusPerSide * (bothSides ? 2 : 1)
  }
  if (structural.type === 'drywall' && structural.gypsumLayers === 2) {
    stcBonus += STC_BONUSES.doubleGypsumBonus
  }
  const stcRating = stcBase + stcBonus

  // ── R-value ── ⚠️ UNVERIFIED
  let rValue = R_VALUE_BASE[coreType]
  if (structural.type === 'drywall' && structural.showInsulation) {
    rValue += R_VALUE_BONUSES.insulationPerMm * structural.studDepthMm
  }

  // ── Cost per sqm (base only — BOM has full detail) ── ⚠️ UNVERIFIED
  const registryEntry = WALL_CORE_REGISTRY[coreType]
  const costPerSqm = registryEntry.baseCostPerSqm
  const totalCost = costPerSqm * wallAreaSqm

  return {
    fireRatingMinutes,
    fireRatingLabel: formatFireLabel(fireRatingMinutes),
    stcRating,
    rValue: Math.round(rValue * 100) / 100,
    costPerSqm,
    totalCost: Math.round(totalCost),
  }
}

// ─── BOM Computation ────────────────────────────────────────────────────────
// ⚠️ ALL BOM VALUES ARE UNVERIFIED — approximate for educational use

export const computeBOM = (
  coreType: CoreType,
  wallAreaSqm: number,
  structural: StructuralData,
  showPlaster: boolean,
  showSkim: boolean,
  showPrimer: boolean,
  showPaint: boolean,
  bothSides: boolean,
): BOMEntry[] => {
  const bom: BOMEntry[] = []
  const finishSideMultiplier = bothSides ? 2 : 1

  // ── Core materials ── ⚠️ UNVERIFIED
  switch (coreType) {
    case 'chb': {
      const chbCost = structural.type === 'chb' && structural.chbSizeMm === 100
        ? MATERIAL_COSTS_PHP.chbPiece100
        : MATERIAL_COSTS_PHP.chbPiece150
      const chbQty = Math.ceil(wallAreaSqm * MATERIAL_QUANTITIES.chbPerSqm * (1 + WASTE_FACTORS.chb))
      bom.push({
        material: 'CHB Blocks',
        quantity: chbQty,
        unit: 'pcs',
        unitCost: chbCost,
        subtotal: chbQty * chbCost,
        group: 'core',
      })
      const mortarVol = wallAreaSqm * MATERIAL_QUANTITIES.mortarPerSqm * (1 + WASTE_FACTORS.mortar)
      bom.push({
        material: 'Mortar',
        quantity: Math.round(mortarVol * 1000) / 1000,
        unit: 'cu.m.',
        unitCost: MATERIAL_COSTS_PHP.mortarPerCuM,
        subtotal: Math.round(mortarVol * MATERIAL_COSTS_PHP.mortarPerCuM),
        group: 'core',
      })
      break
    }
    case 'brick': {
      const brickQty = Math.ceil(wallAreaSqm * MATERIAL_QUANTITIES.brickPerSqm * (1 + WASTE_FACTORS.brick))
      bom.push({
        material: 'Clay Bricks',
        quantity: brickQty,
        unit: 'pcs',
        unitCost: MATERIAL_COSTS_PHP.brickPerPiece,
        subtotal: brickQty * MATERIAL_COSTS_PHP.brickPerPiece,
        group: 'core',
      })
      const mortarVol = wallAreaSqm * MATERIAL_QUANTITIES.mortarPerSqm * 1.5 * (1 + WASTE_FACTORS.mortar)
      bom.push({
        material: 'Mortar',
        quantity: Math.round(mortarVol * 1000) / 1000,
        unit: 'cu.m.',
        unitCost: MATERIAL_COSTS_PHP.mortarPerCuM,
        subtotal: Math.round(mortarVol * MATERIAL_COSTS_PHP.mortarPerCuM),
        group: 'core',
      })
      break
    }
    case 'drywall':
    case 'plywood':
    case 'cement-board': {
      if (structural.type === 'drywall') {
        const gypsumSheets = Math.ceil(
          wallAreaSqm / MATERIAL_QUANTITIES.gypsumSheetArea * (1 + WASTE_FACTORS.gypsum),
        ) * structural.gypsumLayers * finishSideMultiplier
        const gypsumCost = structural.gypsumThicknessMm >= 15.9
          ? MATERIAL_COSTS_PHP.gypsumSheetTypeX
          : MATERIAL_COSTS_PHP.gypsumSheetHalf
        bom.push({
          material: `Gypsum Board ${structural.gypsumThicknessMm}mm`,
          quantity: gypsumSheets,
          unit: 'sheets',
          unitCost: gypsumCost,
          subtotal: gypsumSheets * gypsumCost,
          group: 'core',
        })
        // Metal studs
        const wallLengthM = Math.sqrt(wallAreaSqm) // approximate
        const studCount = Math.ceil(wallLengthM * MATERIAL_QUANTITIES.studsPerLinearMeter)
        bom.push({
          material: 'Metal C-Studs',
          quantity: studCount,
          unit: 'pcs',
          unitCost: MATERIAL_COSTS_PHP.metalStudPiece,
          subtotal: studCount * MATERIAL_COSTS_PHP.metalStudPiece,
          group: 'structural',
        })
        bom.push({
          material: 'Metal U-Tracks',
          quantity: Math.ceil(studCount * 0.4),
          unit: 'pcs',
          unitCost: MATERIAL_COSTS_PHP.metalTrackPiece,
          subtotal: Math.ceil(studCount * 0.4) * MATERIAL_COSTS_PHP.metalTrackPiece,
          group: 'structural',
        })
        // Screws
        const screwQty = Math.ceil(wallAreaSqm * MATERIAL_QUANTITIES.screwsPerSqm)
        const screwBoxes = Math.ceil(screwQty / 1000)
        bom.push({
          material: 'Drywall Screws',
          quantity: screwBoxes,
          unit: 'boxes (1000)',
          unitCost: MATERIAL_COSTS_PHP.screwsPerBox,
          subtotal: screwBoxes * MATERIAL_COSTS_PHP.screwsPerBox,
          group: 'structural',
        })
        // Insulation
        if (structural.showInsulation) {
          bom.push({
            material: 'Fiberglass Insulation',
            quantity: Math.round(wallAreaSqm * 10) / 10,
            unit: 'sqm',
            unitCost: MATERIAL_COSTS_PHP.insulationPerSqm,
            subtotal: Math.round(wallAreaSqm * MATERIAL_COSTS_PHP.insulationPerSqm),
            group: 'structural',
          })
        }
      }
      break
    }
    case 'solid-concrete': {
      // Concrete volume ⚠️ UNVERIFIED
      const registry = WALL_CORE_REGISTRY[coreType]
      const concreteVol = wallAreaSqm * registry.thickness * (1 + WASTE_FACTORS.general)
      bom.push({
        material: 'Ready-Mix Concrete',
        quantity: Math.round(concreteVol * 1000) / 1000,
        unit: 'cu.m.',
        unitCost: MATERIAL_COSTS_PHP.groutPerCuM,
        subtotal: Math.round(concreteVol * MATERIAL_COSTS_PHP.groutPerCuM),
        group: 'core',
      })
      break
    }
    // existing-wall has no core materials
  }

  // ── Structural: rebar for CHB ── ⚠️ UNVERIFIED
  if (structural.type === 'chb' && structural.showReinforcement) {
    const rebarCostMap: Record<number, number> = {
      10: MATERIAL_COSTS_PHP.rebarPerPiece6m_10mm,
      12: MATERIAL_COSTS_PHP.rebarPerPiece6m_12mm,
      16: MATERIAL_COSTS_PHP.rebarPerPiece6m_16mm,
    }
    const rebarCost = rebarCostMap[structural.rebarDiameterMm] ?? MATERIAL_COSTS_PHP.rebarPerPiece6m_10mm
    // Rough estimate: vertical + horizontal bars ⚠️ UNVERIFIED
    const rebarPieces = Math.ceil(wallAreaSqm * 2.5)
    bom.push({
      material: `Rebar ${structural.rebarDiameterMm}mm`,
      quantity: rebarPieces,
      unit: 'pcs (6m)',
      unitCost: rebarCost,
      subtotal: rebarPieces * rebarCost,
      group: 'structural',
    })
  }

  // ── Finish layers ── ⚠️ UNVERIFIED
  if (showPlaster) {
    const plasterVol = wallAreaSqm * MATERIAL_QUANTITIES.plasterPerSqm * finishSideMultiplier * (1 + WASTE_FACTORS.general)
    bom.push({
      material: 'Plaster',
      quantity: Math.round(plasterVol * 1000) / 1000,
      unit: 'cu.m.',
      unitCost: MATERIAL_COSTS_PHP.plasterPerCuM,
      subtotal: Math.round(plasterVol * MATERIAL_COSTS_PHP.plasterPerCuM),
      group: 'finish',
    })
  }
  if (showSkim) {
    const skimBags = Math.ceil(wallAreaSqm / MATERIAL_QUANTITIES.skimCoatCoveragePerBag * finishSideMultiplier)
    bom.push({
      material: 'Skim Coat',
      quantity: skimBags,
      unit: 'bags (25kg)',
      unitCost: MATERIAL_COSTS_PHP.skimCoatPerBag25kg,
      subtotal: skimBags * MATERIAL_COSTS_PHP.skimCoatPerBag25kg,
      group: 'finish',
    })
  }
  if (showPrimer) {
    const primerLiters = Math.ceil(wallAreaSqm / MATERIAL_QUANTITIES.primerCoveragePerLiter * finishSideMultiplier)
    bom.push({
      material: 'Primer',
      quantity: primerLiters,
      unit: 'liters',
      unitCost: MATERIAL_COSTS_PHP.primerPerLiter,
      subtotal: primerLiters * MATERIAL_COSTS_PHP.primerPerLiter,
      group: 'finish',
    })
  }
  if (showPaint) {
    // 2 coats ⚠️ UNVERIFIED
    const paintLiters = Math.ceil(
      wallAreaSqm / MATERIAL_QUANTITIES.paintCoveragePerLiter * finishSideMultiplier * 2,
    )
    bom.push({
      material: 'Paint',
      quantity: paintLiters,
      unit: 'liters',
      unitCost: MATERIAL_COSTS_PHP.paintPerLiter,
      subtotal: paintLiters * MATERIAL_COSTS_PHP.paintPerLiter,
      group: 'finish',
    })
  }

  // ── Labor ── ⚠️ UNVERIFIED
  if (coreType === 'chb' || coreType === 'brick') {
    const masonDays = Math.ceil(wallAreaSqm / LABOR_RATES_PHP.masonOutputSqmPerDay)
    bom.push({
      material: 'Mason Labor',
      quantity: masonDays,
      unit: 'man-days',
      unitCost: LABOR_RATES_PHP.masonPerDay,
      subtotal: masonDays * LABOR_RATES_PHP.masonPerDay,
      group: 'labor',
    })
    bom.push({
      material: 'Helper Labor',
      quantity: masonDays,
      unit: 'man-days',
      unitCost: LABOR_RATES_PHP.helperPerDay,
      subtotal: masonDays * LABOR_RATES_PHP.helperPerDay,
      group: 'labor',
    })
  }
  if (coreType === 'drywall' || coreType === 'plywood' || coreType === 'cement-board') {
    const drywallerDays = Math.ceil(wallAreaSqm / LABOR_RATES_PHP.drywallerOutputSqmPerDay)
    bom.push({
      material: 'Drywaller Labor',
      quantity: drywallerDays,
      unit: 'man-days',
      unitCost: LABOR_RATES_PHP.drywallerPerDay,
      subtotal: drywallerDays * LABOR_RATES_PHP.drywallerPerDay,
      group: 'labor',
    })
  }
  if (showPaint || showPrimer) {
    const paintArea = wallAreaSqm * finishSideMultiplier
    const painterDays = Math.ceil(paintArea / LABOR_RATES_PHP.painterOutputSqmPerDay)
    bom.push({
      material: 'Painter Labor',
      quantity: painterDays,
      unit: 'man-days',
      unitCost: LABOR_RATES_PHP.painterPerDay,
      subtotal: painterDays * LABOR_RATES_PHP.painterPerDay,
      group: 'labor',
    })
  }

  return bom
}

// ─── Violation Evaluation ───────────────────────────────────────────────────

const computeViolations = (
  coreType: CoreType,
  wallHeightMm: number,
  structural: StructuralData,
): ComputedWallState['violations'] => {
  const violations: ComputedWallState['violations'] = []

  // PD 1096 — minimum habitable room height
  if (wallHeightMm < WALL_CODES.PD_1096.MIN_HABITABLE_HEIGHT_MM) {
    violations.push({
      id: 'pd1096-min-height',
      message: `Wall height ${wallHeightMm}mm is below minimum habitable room height of ${WALL_CODES.PD_1096.MIN_HABITABLE_HEIGHT_MM}mm`,
      codeCitation: 'PD 1096 Rule VII §708',
      severity: 'warning',
    })
  }

  // NSCP — CHB bearing wall minimum thickness
  if (coreType === 'chb' && structural.type === 'chb' && structural.chbSizeMm < WALL_CODES.NSCP.CHB_BEARING_MIN_MM) {
    violations.push({
      id: 'nscp-chb-bearing-min',
      message: `CHB size ${structural.chbSizeMm}mm is below minimum ${WALL_CODES.NSCP.CHB_BEARING_MIN_MM}mm for load-bearing walls`,
      codeCitation: 'NSCP 2015 §702.1',
      severity: 'error',
    })
  }

  // NSCP — brick height review
  if (coreType === 'brick' && wallHeightMm > WALL_CODES.NSCP.BRICK_HEIGHT_REVIEW_MM) {
    violations.push({
      id: 'nscp-brick-height',
      message: `Brick wall height ${wallHeightMm}mm exceeds ${WALL_CODES.NSCP.BRICK_HEIGHT_REVIEW_MM}mm — engineering review required`,
      codeCitation: 'NSCP 2015 §705.2',
      severity: 'warning',
    })
  }

  return violations
}

// ─── Main Computation Function ──────────────────────────────────────────────

export const computeWallState = (
  params: Record<string, number | boolean | string>,
): ComputedWallState => {
  // ── a) Parameter resolution ───────────────────────────────────────────────
  const coreType = str(params.coreType ?? 'chb') as CoreType
  const wallLengthMm = num(params.wallLength ?? 3000)
  const wallHeightMm = num(params.wallHeight ?? 2700)
  const bothSides = bool(params.sides ?? false)
  const showPlaster = bool(params.showPlaster ?? false)
  const showSkim = bool(params.showSkim ?? false)
  const showPrimer = bool(params.showPrimer ?? false)
  const showPaint = bool(params.showPaint ?? false)
  const paintColor = str(params.paintColor ?? 'White')

  // ── b) Assembly resolution ────────────────────────────────────────────────
  const registryEntry = WALL_CORE_REGISTRY[coreType]
  const coreThickness = registryEntry.thickness

  const layerStack = buildLayerStack(
    registryEntry,
    showPlaster,
    showSkim,
    showPrimer,
    showPaint,
    bothSides,
    paintColor,
  )

  const layerThicknessSum = layerStack.reduce((sum, l) => sum + l.thickness, 0)
  const totalThickness = coreThickness + layerThicknessSum

  const wallAreaSqm = (wallLengthMm / 1000) * (wallHeightMm / 1000)

  // ── c) Structural data ────────────────────────────────────────────────────
  const structural = resolveStructural(coreType, params)

  // ── d) Performance ────────────────────────────────────────────────────────
  const performance = computePerformance(coreType, structural, showPlaster, bothSides, wallAreaSqm)

  // ── e) BOM ────────────────────────────────────────────────────────────────
  const bom = computeBOM(coreType, wallAreaSqm, structural, showPlaster, showSkim, showPrimer, showPaint, bothSides)
  const bomTotal = bom.reduce((sum, entry) => sum + entry.subtotal, 0)

  // ── f) Violations ─────────────────────────────────────────────────────────
  const violations = computeViolations(coreType, wallHeightMm, structural)

  // ── g) Return ComputedWallState ───────────────────────────────────────────
  return {
    coreType,
    wallLengthMm,
    wallHeightMm,
    bothSides,
    coreThickness,
    layerStack,
    totalThickness,
    wallAreaSqm,
    structural,
    performance,
    bom,
    bomTotal,
    violations,
    registryEntry,
  }
}
