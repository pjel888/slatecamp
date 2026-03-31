// src/app/dashboard/3d-lab/_utils/siteControlsCalculator.ts
//
// Pure math engine for PD 1096 Rules VII & VIII site development controls.
// ZERO React, ZERO Zustand, ZERO Three.js. Unit-testable in isolation.
//
// AUTHORITY: 2004 Revised IRR of PD 1096 (DPWH, April 2005)
// All formulas fact-checked against official IRR text and Table VIII.1.
//
// CRITICAL CORRECTIONS (from Fact-Check document):
// - PSO is a RATIO (AMBF/TLA), NOT an area in sqm
// - MACA = AMBF + ISA (simple sum), NOT a multiplier
// - ISA/USA are redistributed within TOSL to maintain identity
// - R-1 Basic max PSO = 50%, NOT 60%

import {
  ZoningClass,
  getBaseSetbacks,
} from '../_constants/nbcp'

import {
  SITE_CONTROL_TABLE,
  type SiteControlZoning,
} from '../_constants/siteControls'

// -- I/O Types ----------------------------------------------------------------

export interface SiteControlInputs {
  lotWidth: number          // meters, 5-100
  lotDepth: number          // meters, 5-100
  zoningClass: ZoningClass
  rrowWidth: number         // meters, 6-40
  numFloors: number         // 1-10
  floorHeight: number       // meters, 2.4-5.0
}

export interface Violation {
  field: string
  message: string
  codeCitation: string
  severity: 'error' | 'warning'
}

export interface PerSideSetbacks {
  front: number
  rear: number
  left: number
  right: number
}

export interface SiteControlOutputs {
  // Step 1: Lot
  tla: number

  // Step 2: Setbacks (Rule VII Sec. 704 + Rule VIII Sec. 804)
  setbacks: PerSideSetbacks

  // Step 3: Buildable envelope
  buildableWidth: number
  buildableDepth: number

  // Step 4: AMBF (Rule VIII Sec. 803, Table VIII.1)
  ambf_by_setbacks: number
  ambf_by_pso: number
  ambf: number

  // Step 5: PSO -- a RATIO (0.0-1.0), NOT an area
  pso: number

  // Step 6: Open space -- redistributed within TOSL to guarantee identity
  tosl: number
  isa: number               // Redistributed: TOSL * (ISA% / (ISA% + USA%))
  usa: number               // Redistributed: TOSL * (USA% / (ISA% + USA%))

  // Step 7: MACA = AMBF + ISA (simple sum, NOT a multiplier)
  maca: number

  // Step 8: Floor-based outputs
  buildingHeight: number
  tgfa: number
  bhl: number
  footprintPct: number

  // Table VIII.1 reference values (for UI display)
  zoningData: SiteControlZoning
  lotCoverageMax: number    // PSO% limit (e.g. 0.50)
  isaPercent: number        // ISA% from table (e.g. 0.30)
  usaPercent: number        // USA% from table (e.g. 0.20)

  // Compliance
  violations: Violation[]
  compliance: {
    ambfOk: boolean
    toslOk: boolean
    identityOk: boolean
    setbacksOk: boolean
    floorHeightOk: boolean
    message: string
  }
}

// -- Calculator ---------------------------------------------------------------

export function calculateSiteControls(inputs: SiteControlInputs): SiteControlOutputs {
  const { lotWidth, lotDepth, zoningClass, rrowWidth, numFloors, floorHeight } = inputs
  const violations: Violation[] = []

  // Table VIII.1 lookup
  const zoningData = SITE_CONTROL_TABLE[zoningClass]
  const lotCoverageMax = zoningData.maxPSO
  const isaPercent = zoningData.maxISA
  const usaPercent = zoningData.minUSA

  // -- Step 1: TLA (Rule VIII Sec. 803) --
  const tla = lotWidth * lotDepth

  // -- Step 2: Setbacks (Rule VII Sec. 704 + Rule VIII Sec. 804) --
  const bhlForSetbacks = zoningClass === ZoningClass.R1 ? 3 : 5
  const baseSetbacks = getBaseSetbacks(zoningClass, rrowWidth, bhlForSetbacks)
  const setbacks: PerSideSetbacks = {
    front: baseSetbacks.front,
    rear: baseSetbacks.rear,
    left: baseSetbacks.side,
    right: baseSetbacks.side,
  }

  // -- Step 3: Buildable envelope (Rule VII Sec. 704) --
  // Clamped to 0 to handle lots smaller than setbacks
  const buildableWidth = Math.max(0, lotWidth - setbacks.left - setbacks.right)
  const buildableDepth = Math.max(0, lotDepth - setbacks.front - setbacks.rear)

  // -- Step 4: AMBF (Rule VIII Sec. 803, Table VIII.1) --
  // The binding constraint: lesser of setback-limited OR zoning-capped
  const ambf_by_setbacks = buildableWidth * buildableDepth
  const ambf_by_pso = lotCoverageMax * tla
  const ambf = Math.min(ambf_by_setbacks, ambf_by_pso)

  if (ambf <= 0) {
    violations.push({
      field: 'ambf',
      message: 'Required setbacks consume the entire lot - no buildable area remains.',
      codeCitation: 'IRR Rule VIII Sec. 803 + Rule VII Sec. 704',
      severity: 'error',
    })
  }

  // -- Step 5: PSO (Rule VIII Sec. 803) --
  // PSO is a dimensionless RATIO, NOT an area in sqm
  const pso = tla > 0 ? ambf / tla : 0

  // -- Step 6: Open space with redistribution --
  // TOSL = TLA - AMBF (the area complement)
  // ISA and USA are redistributed within TOSL proportionally
  // to maintain the governing identity: AMBF + ISA + USA = TLA
  const tosl = tla - ambf
  const openSpaceRatioSum = isaPercent + usaPercent
  const isaRatio = openSpaceRatioSum > 0 ? isaPercent / openSpaceRatioSum : 0.6
  const usaRatio = openSpaceRatioSum > 0 ? usaPercent / openSpaceRatioSum : 0.4
  const isa = tosl * isaRatio
  const usa = tosl * usaRatio

  // -- Step 7: MACA (Rule VIII Sec. 803, Table VIII.1 note c) --
  // MACA = AMBF + ISA (simple sum, NOT a multiplier on AMBF)
  const maca = ambf + isa

  // -- Step 8: Floor-based outputs --
  const buildingHeight = numFloors * floorHeight
  const tgfa = ambf * numFloors
  const bhl = buildingHeight
  const footprintPct = tla > 0 ? (ambf / tla) * 100 : 0

  // -- Validation: governing identity (AMBF + ISA + USA = TLA) --
  const identityDiff = Math.abs((ambf + isa + usa) - tla)
  const identityOk = identityDiff < 0.01

  if (!identityOk) {
    console.error(
      `[SiteControls] Identity violation: AMBF(${ambf}) + ISA(${isa}) + USA(${usa}) = ${ambf + isa + usa}, expected TLA(${tla}). Diff: ${identityDiff}`,
    )
  }

  // -- Compliance checks --
  const ambfOk = ambf <= ambf_by_pso + 0.01
  const minTosl = (1 - lotCoverageMax) * tla
  const toslOk = tosl >= minTosl - 0.01
  const setbacksOk = buildableWidth > 0 && buildableDepth > 0
  const floorHeightOk = floorHeight >= 2.7

  if (!ambfOk) {
    violations.push({
      field: 'ambf',
      message: `Building footprint (${ambf.toFixed(1)} sqm) exceeds max PSO allowance (${ambf_by_pso.toFixed(1)} sqm).`,
      codeCitation: 'IRR Rule VIII Sec. 803, Table VIII.1',
      severity: 'error',
    })
  }

  if (!toslOk) {
    violations.push({
      field: 'tosl',
      message: `Open space (${tosl.toFixed(1)} sqm) is below minimum required (${minTosl.toFixed(1)} sqm).`,
      codeCitation: 'IRR Rule VIII Sec. 803, Table VIII.1 (note d)',
      severity: 'error',
    })
  }

  if (!floorHeightOk) {
    violations.push({
      field: 'floorHeight',
      message: `Floor-to-floor height (${floorHeight.toFixed(1)}m) is below the 2.7m minimum for habitable rooms.`,
      codeCitation: 'PD 1096 IRR Rule VIII Sec. 805',
      severity: 'warning',
    })
  }

  const allChecks = [ambfOk, toslOk, identityOk, setbacksOk, floorHeightOk]
  const allPass = allChecks.every(Boolean)
  let message = 'All requirements met - this configuration is code-compliant.'
  if (!setbacksOk) {
    message = 'Required setbacks leave no buildable area. Increase lot dimensions.'
  } else if (!allPass) {
    const passCount = allChecks.filter(Boolean).length
    message = `${passCount}/${allChecks.length} requirements met. Adjust parameters to achieve compliance.`
  }

  return {
    tla,
    setbacks,
    buildableWidth,
    buildableDepth,
    ambf_by_setbacks,
    ambf_by_pso,
    ambf,
    pso,
    tosl,
    isa,
    usa,
    maca,
    buildingHeight,
    tgfa,
    bhl,
    footprintPct,
    zoningData,
    lotCoverageMax,
    isaPercent,
    usaPercent,
    violations,
    compliance: {
      ambfOk,
      toslOk,
      identityOk,
      setbacksOk,
      floorHeightOk,
      message,
    },
  }
}
