import { describe, expect, test } from 'bun:test'
import {
  computeParkingGridLayout,
  evaluateParkingChecks,
  getParkingRequirementTypology,
  parkingLotRequirementsConfig,
  parkingRequirementTypologies,
  parkingStallMinimums,
  requiredAccessibleParkingSlots,
  requiredBp220ParkingSlots,
  requiredEvParkingSlots,
  requiredParkingSlotsForTypology,
} from './parking-lot-requirements'

describe('parking lot requirements source-gated module', () => {
  test('uses a hidden QA-safe source gate and stable route identity', () => {
    expect(parkingLotRequirementsConfig.id).toBe('parking-lot-requirements')
    expect(parkingLotRequirementsConfig.title).toBe('Parking Lot Requirements')
    expect(parkingLotRequirementsConfig.sourceTruth?.sourceGateStatus).toBe('SOURCE_PENDING')
    expect(parkingLotRequirementsConfig.sourceTruth?.canShowSourceBackedCompliance).toBe(false)
  })

  test('encodes BP 344 Table A.6.1 accessible parking count bands exactly', () => {
    expect(requiredAccessibleParkingSlots(1)).toBe(1)
    expect(requiredAccessibleParkingSlots(25)).toBe(1)
    expect(requiredAccessibleParkingSlots(26)).toBe(2)
    expect(requiredAccessibleParkingSlots(50)).toBe(2)
    expect(requiredAccessibleParkingSlots(51)).toBe(3)
    expect(requiredAccessibleParkingSlots(100)).toBe(4)
    expect(requiredAccessibleParkingSlots(101)).toBe(5)
    expect(requiredAccessibleParkingSlots(200)).toBe(6)
    expect(requiredAccessibleParkingSlots(201)).toBe(7)
    expect(requiredAccessibleParkingSlots(500)).toBe(9)
    expect(requiredAccessibleParkingSlots(501)).toBe(11)
    expect(requiredAccessibleParkingSlots(1000)).toBe(20)
    expect(requiredAccessibleParkingSlots(1001)).toBe(21)
    expect(requiredAccessibleParkingSlots(1100)).toBe(21)
    expect(requiredAccessibleParkingSlots(1101)).toBe(22)
  })

  test('encodes BP 220 multi-family parking ratio from raw source extraction', () => {
    expect(requiredBp220ParkingSlots(0)).toBe(0)
    expect(requiredBp220ParkingSlots(1)).toBe(1)
    expect(requiredBp220ParkingSlots(8)).toBe(1)
    expect(requiredBp220ParkingSlots(9)).toBe(2)
    expect(requiredBp220ParkingSlots(80)).toBe(10)

    const checks = evaluateParkingChecks({ totalStalls: 8, livingUnits: 80 })
    expect(checks.requiredBp220).toBe(10)
    expect(checks.bp220ParkingShortfall).toBe(2)

    const bp220Rule = parkingLotRequirementsConfig.violations?.find((rule) => rule.id === 'bp220-parking-ratio-shortfall')
    const sourceRule = parkingLotRequirementsConfig.sourceTruth?.sourceRules.find((rule) => rule.source_rule_id === 'PARK-BP220-RATIO')
    expect(sourceRule?.human_review_status).toBe('LOCATED_NEEDS_SME_REVIEW')
    expect(sourceRule?.normalized_rule).toContain('1 parking slot per 8 living units')
    expect(bp220Rule?.check({ totalStalls: 8, livingUnits: 80 })).toBe(true)
    expect(bp220Rule?.check({ totalStalls: 10, livingUnits: 80 })).toBe(false)
  })

  test('encodes RA 11697 EV parking as an included total-slot subset', () => {
    expect(requiredEvParkingSlots(0)).toBe(0)
    expect(requiredEvParkingSlots(19)).toBe(0)
    expect(requiredEvParkingSlots(20)).toBe(1)
    expect(requiredEvParkingSlots(21)).toBe(2)
    expect(requiredEvParkingSlots(100)).toBe(5)

    const belowThreshold = evaluateParkingChecks({
      typology: 'office-condominium-large',
      basisValue: 700,
    })
    expect(belowThreshold.requiredParkingSlots).toBe(10)
    expect(belowThreshold.requiredAccessible).toBe(1)
    expect(belowThreshold.requiredEvSlots).toBe(0)

    const atThreshold = evaluateParkingChecks({
      typology: 'office-condominium-large',
      basisValue: 1400,
    })
    expect(atThreshold.requiredParkingSlots).toBe(20)
    expect(atThreshold.totalStalls).toBe(20)
    expect(atThreshold.requiredAccessible).toBe(1)
    expect(atThreshold.requiredEvSlots).toBe(1)

    const sourceRule = parkingLotRequirementsConfig.sourceTruth?.sourceRules.find((rule) => rule.source_rule_id === 'PARK-RA11697-EV-COUNT')
    expect(sourceRule?.section_locator).toContain('Section 17')
    expect(sourceRule?.normalized_rule).toContain('5% of total parking slots')
  })

  test('keeps the default parameter surface calculator-first only', () => {
    const keys = parkingLotRequirementsConfig.parameters.map((param) => param.key)

    expect(keys).toEqual(['typology', 'basisValue'])
    expect(keys).not.toContain('providedStalls')
    expect(keys).not.toContain('accessibleStalls')
    expect(keys).not.toContain('stallWidthMm')
    expect(keys).not.toContain('stallDepthMm')
    expect(keys).not.toContain('accessibleWidthMm')
    expect(keys).not.toContain('accessibleDepthMm')
    expect(keys).not.toContain('frontWalkwayMm')
    expect(keys).not.toContain('driveAisleMm')
    expect(keys).not.toContain('orientation')
  })

  test('keeps default annotations off so advanced BP344/source notes do not clutter first view', () => {
    expect(parkingLotRequirementsConfig.alwaysShowAnnotations).toBe(false)
    expect(parkingLotRequirementsConfig.defaultVisibleAnnotationIds).toEqual([])
  })

  test('computes typology-first parking requirements from PD1096 Table VII.4 source cards', () => {
    expect(parkingRequirementTypologies.map((item) => item.id)).toContain('restaurant')
    expect(getParkingRequirementTypology('restaurant')?.basisUnit).toBe('sqm customer area')
    expect(requiredParkingSlotsForTypology('restaurant', 30)).toBe(1)
    expect(requiredParkingSlotsForTypology('restaurant', 31)).toBe(2)
    expect(requiredParkingSlotsForTypology('office-condominium-large', 71)).toBe(2)
    expect(requiredParkingSlotsForTypology('hotel-highly-urbanized', 4)).toBe(2)
    expect(requiredParkingSlotsForTypology('public-hospital', 26)).toBe(2)

    const office = evaluateParkingChecks({ typology: 'office-condominium-large', basisValue: 210, providedStalls: 2, accessibleStalls: 1 })
    expect(office.requiredParkingSlots).toBe(3)
    expect(office.parkingShortfall).toBe(1)
    expect(office.selectedTypology?.sourceRuleId).toBe('PARK-PD1096-OFFICE-CONDO-LARGE')
    expect(office.requiredAccessible).toBe(1)
    expect(office.requiredPwdSlots).toBe(1)
  })

  test('allows a zero basis to mean no required parking', () => {
    const checks = evaluateParkingChecks({
      typology: 'office-condominium-large',
      basisValue: 0,
    })
    const geometry = parkingLotRequirementsConfig.geometry({
      typology: 'office-condominium-large',
      basisValue: 0,
    })

    expect(checks.requiredParkingSlots).toBe(0)
    expect(checks.totalStalls).toBe(0)
    expect(checks.requiredAccessible).toBe(0)
    expect(checks.requiredEvSlots).toBe(0)
    expect(geometry).toEqual([])
  })

  test('uses source-located stall dimensions and BP344 4000x5000 accessible geometry', () => {
    expect(parkingStallMinimums('perpendicular')).toEqual({
      widthMm: 2500,
      depthMm: 5000,
      sourceRuleId: 'PARK-PD1096-STD-STALL',
    })
    expect(parkingStallMinimums('parallel')).toEqual({
      widthMm: 2150,
      depthMm: 6000,
      sourceRuleId: 'PARK-PD1096-PARALLEL',
    })

    const passing = evaluateParkingChecks({
      totalStalls: 50,
      accessibleStalls: 2,
      stallWidthMm: 2500,
      stallDepthMm: 5000,
      accessibleWidthMm: 4000,
      accessibleDepthMm: 5000,
      frontWalkwayMm: 1200,
      orientation: 'perpendicular',
    })

    expect(passing.accessibleCountShortfall).toBe(0)
    expect(passing.standardWidthShortfallMm).toBe(0)
    expect(passing.standardDepthShortfallMm).toBe(0)
    expect(passing.accessibleWidthShortfallMm).toBe(0)
    expect(passing.accessibleDepthShortfallMm).toBe(0)
    expect(passing.frontWalkwayShortfallMm).toBe(0)
  })

  test('attributes parallel stall checks to the parallel source card', () => {
    const standardWidthRule = parkingLotRequirementsConfig.violations?.find((rule) => rule.id === 'pd1096-standard-stall-width')
    const parallelWidthRule = parkingLotRequirementsConfig.violations?.find((rule) => rule.id === 'pd1096-parallel-stall-width')
    const standardDepthRule = parkingLotRequirementsConfig.violations?.find((rule) => rule.id === 'pd1096-standard-stall-depth')
    const parallelDepthRule = parkingLotRequirementsConfig.violations?.find((rule) => rule.id === 'pd1096-parallel-stall-depth')

    expect(standardWidthRule?.sourceRuleId).toBe('PARK-PD1096-STD-STALL')
    expect(parallelWidthRule?.sourceRuleId).toBe('PARK-PD1096-PARALLEL')
    expect(standardDepthRule?.sourceRuleId).toBe('PARK-PD1096-STD-STALL')
    expect(parallelDepthRule?.sourceRuleId).toBe('PARK-PD1096-PARALLEL')

    const tooShortParallel = { orientation: 'parallel', stallWidthMm: 2100, stallDepthMm: 5500 }
    expect(standardWidthRule?.check(tooShortParallel)).toBe(false)
    expect(parallelWidthRule?.check(tooShortParallel)).toBe(true)
    expect(standardDepthRule?.check(tooShortParallel)).toBe(false)
    expect(parallelDepthRule?.check(tooShortParallel)).toBe(true)
  })

  test('fails closed for PD1096 90-degree aisle width instead of encoding a pass/fail threshold', () => {
    const aisleRule = parkingLotRequirementsConfig.violations?.find((rule) => rule.id === 'pd1096-aisle-source-pending')
    const sourceRule = parkingLotRequirementsConfig.sourceTruth?.sourceRules.find((rule) => rule.source_rule_id === 'PARK-PD1096-AISLE-90')

    expect(aisleRule?.severity).toBe('warning')
    expect(aisleRule?.message).toContain('source-pending')
    expect(sourceRule?.human_review_status).toBe('SOURCE_PENDING_FAIL_CLOSED')
    expect(sourceRule?.normalized_rule).toContain('Do not release')
    expect(aisleRule?.check({ driveAisleMm: 3000 })).toBe(true)
    expect(aisleRule?.check({ driveAisleMm: 8000 })).toBe(true)
  })

  test('parking grid layout chooses compact square-ish footprints instead of long strips', () => {
    const normalLayout = computeParkingGridLayout(258, 2.5, 5, 0.32)
    const pwdLayout = computeParkingGridLayout(7, 4, 5, 0.32)

    expect(normalLayout.columns).toBeGreaterThan(10)
    expect(normalLayout.rows).toBeGreaterThan(10)
    expect(Math.max(normalLayout.width / normalLayout.depth, normalLayout.depth / normalLayout.width)).toBeLessThan(1.25)
    expect(pwdLayout.columns).toBeGreaterThanOrEqual(2)
    expect(pwdLayout.rows).toBeGreaterThanOrEqual(2)
    expect(Math.max(pwdLayout.width / pwdLayout.depth, pwdLayout.depth / pwdLayout.width)).toBeLessThan(1.6)
  })

  test('geometry renders PWD slots as part of the total required-slot count', () => {
    const geometry = parkingLotRequirementsConfig.geometry({
      typology: 'office-condominium-large',
      basisValue: 18000,
    })

    const standardSlots = geometry.filter((instruction) => /^parking-slot-\d+$/.test(instruction.id))
    const pwdSlots = geometry.filter((instruction) => /^pwd-parking-slot-\d+$/.test(instruction.id))
    const normalMaxX = Math.max(...standardSlots.map((instruction) => instruction.position[0] + instruction.args[0] / 2))
    const pwdMinX = Math.min(...pwdSlots.map((instruction) => instruction.position[0] - instruction.args[0] / 2))

    expect(geometry.some((instruction) => instruction.id === 'parking-grid-slab')).toBe(false)
    expect(standardSlots.length + pwdSlots.length).toBe(258)
    expect(standardSlots.length).toBe(251)
    expect(pwdSlots.length).toBe(7)
    expect(pwdMinX - normalMaxX).toBeGreaterThanOrEqual(3.99)
    expect(pwdSlots.every((instruction) => instruction.args[0] === 4 && instruction.args[2] === 5)).toBe(true)
    expect(pwdSlots.every((instruction) => instruction.color === '#facc15')).toBe(true)
    expect(pwdSlots.every((instruction) => instruction.material === 'basic')).toBe(true)
    expect(geometry.some((instruction) => instruction.id.includes('walkway'))).toBe(false)
    expect(geometry.some((instruction) => instruction.id.includes('passage'))).toBe(false)
    expect(geometry.some((instruction) => instruction.id.includes('accessible-marker'))).toBe(false)
    expect(geometry.some((instruction) => instruction.id.includes('car'))).toBe(false)
    expect(geometry.some((instruction) => instruction.id.includes('aisle'))).toBe(false)
    expect(geometry.some((instruction) => instruction.id.includes('ra9514'))).toBe(false)
  })
})
