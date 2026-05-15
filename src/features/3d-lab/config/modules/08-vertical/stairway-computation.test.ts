import { describe, test, expect } from 'bun:test'
import {
  anyLawFailsDimension,
  computeParallelDimensionFailures,
  computeStairState,
  computeBlondelComfort,
  computePitch,
} from './stairway-computation'
import { computeEgressRequirements } from './stairway-egress'
import { CODE_VIOLATION_COLOR } from './stairway-constants'
import { stairwayConfigurator } from './stairway-code-compliance'

describe('computeBlondelComfort', () => {
  test('riser=185, tread=250 → comfortable (2R+T=620)', () => {
    const result = computeBlondelComfort(185, 250)
    expect(result.twoRPlusT).toBe(620)
    expect(result.comfortStatus).toBe('comfortable')
  })

  test('riser=200, tread=300 → too-stretched (2R+T=700)', () => {
    const result = computeBlondelComfort(200, 300)
    expect(result.twoRPlusT).toBe(700)
    expect(result.comfortStatus).toBe('too-stretched')
  })

  test('riser=130, tread=200 → too-cramped (2R+T=460)', () => {
    const result = computeBlondelComfort(130, 200)
    expect(result.twoRPlusT).toBe(460)
    expect(result.comfortStatus).toBe('too-cramped')
  })

  test('boundary: riser=150, tread=300 → comfortable (2R+T=600)', () => {
    const result = computeBlondelComfort(150, 300)
    expect(result.twoRPlusT).toBe(600)
    expect(result.comfortStatus).toBe('comfortable')
  })

  test('boundary: riser=175, tread=300 → too-stretched (2R+T=650)', () => {
    const result = computeBlondelComfort(175, 300)
    expect(result.twoRPlusT).toBe(650)
    expect(result.comfortStatus).toBe('comfortable')
  })
})

describe('computePitch', () => {
  test('riser=185, tread=250 → steep (~36.5°)', () => {
    const result = computePitch(185, 250)
    expect(result.pitchAngle).toBeCloseTo(36.47, 1)
    expect(result.pitchStatus).toBe('steep')
  })

  test('riser=150, tread=300 → comfortable (~26.6°)', () => {
    const result = computePitch(150, 300)
    expect(result.pitchAngle).toBeCloseTo(26.57, 1)
    expect(result.pitchStatus).toBe('comfortable')
  })

  test('riser=250, tread=200 → ladder-like (~51.3°)', () => {
    const result = computePitch(250, 200)
    expect(result.pitchAngle).toBeCloseTo(51.34, 1)
    expect(result.pitchStatus).toBe('ladder-like')
  })

  test('riser=50, tread=300 → ramp-like (~9.5°)', () => {
    const result = computePitch(50, 300)
    expect(result.pitchAngle).toBeCloseTo(9.46, 1)
    expect(result.pitchStatus).toBe('ramp-like')
  })
})

describe('computeStairState — preset validation', () => {
  test('module defaults have no parallel law-card violations', () => {
    const params = Object.fromEntries(
      stairwayConfigurator.parameters.map((parameter) => [parameter.key, parameter.default]),
    )

    const activeViolations = (stairwayConfigurator.violations ?? []).filter((rule) => {
      const lawPrefix = rule.id.split('-')[0]
      const evalParams =
        lawPrefix === 'ra9514'
          ? { ...params, isExitStair: true }
          : lawPrefix === 'bp344'
            ? { ...params, isAccessibleRoute: true }
            : lawPrefix === 'bp220'
              ? { ...params, projectType: 'bp220_socialized' }
              : params

      return rule.check(evalParams)
    })

    expect(activeViolations.map((rule) => rule.id)).toEqual([])
  })

  test('parallel law-card dimension failures are exposed for model and slider coloring', () => {
    const baseParams = Object.fromEntries(
      stairwayConfigurator.parameters.map((parameter) => [parameter.key, parameter.default]),
    )

    const failures = computeParallelDimensionFailures({
      ...baseParams,
      riserHeight: 185,
      treadDepth: 195,
      stairWidth: 900,
      headroom: 1900,
      handrailHeight: 950,
    })

    expect(failures).toMatchObject({
      riserHeight: true,
      treadDepth: true,
      stairWidth: true,
      headroom: true,
      handrailHeight: true,
    })

    expect(anyLawFailsDimension({ ...baseParams, riserHeight: 185 }, 'riserHeight')).toBe(true)
    expect(anyLawFailsDimension({ ...baseParams, treadDepth: 195 }, 'treadDepth')).toBe(true)
    expect(anyLawFailsDimension({ ...baseParams, stairWidth: 900 }, 'stairWidth')).toBe(true)
    expect(anyLawFailsDimension({ ...baseParams, headroom: 1900 }, 'headroom')).toBe(true)
    expect(anyLawFailsDimension({ ...baseParams, handrailHeight: 950 }, 'handrailHeight')).toBe(true)
    expect(anyLawFailsDimension({ ...baseParams, numRisers: 21 }, 'verticalRise')).toBe(true)

    expect(anyLawFailsDimension({ ...baseParams, riserHeight: 150 }, 'riserHeight')).toBe(false)
    expect(anyLawFailsDimension({ ...baseParams, treadDepth: 300 }, 'treadDepth')).toBe(false)
    expect(anyLawFailsDimension({ ...baseParams, stairWidth: 1500 }, 'stairWidth')).toBe(false)
    expect(anyLawFailsDimension({ ...baseParams, headroom: 2100 }, 'headroom')).toBe(false)
    expect(anyLawFailsDimension({ ...baseParams, handrailHeight: 900 }, 'handrailHeight')).toBe(false)
  })

  test('BP 344 accessible stair riser, tread, and width limits are first-class law checks', () => {
    const failing = computeStairState({
      projectType: 'commercial',
      isAccessibleRoute: true,
      isExitStair: false,
      stairWidth: 1200,
      riserHeight: 175,
      treadDepth: 280,
      handrailHeight: 900,
      numRisers: 12,
    })

    expect(failing.riserCompliance.bp344.applies).toBe(true)
    expect(failing.riserCompliance.bp344.passes).toBe(false)
    expect(failing.riserCompliance.bp344.limit).toBe(150)
    expect(failing.treadCompliance.bp344.applies).toBe(true)
    expect(failing.treadCompliance.bp344.passes).toBe(false)
    expect(failing.treadCompliance.bp344.limit).toBe(300)
    expect(failing.widthCompliance.bp344.applies).toBe(true)
    expect(failing.widthCompliance.bp344.passes).toBe(false)
    expect(failing.widthCompliance.bp344.limit).toBe(1500)

    const passing = computeStairState({
      projectType: 'commercial',
      isAccessibleRoute: true,
      isExitStair: false,
      stairWidth: 1500,
      riserHeight: 150,
      treadDepth: 300,
      handrailHeight: 900,
      numRisers: 12,
    })

    expect(passing.riserCompliance.bp344.passes).toBe(true)
    expect(passing.treadCompliance.bp344.passes).toBe(true)
    expect(passing.widthCompliance.bp344.passes).toBe(true)
  })

  test('Standard House preset: no riser/tread violations', () => {
    const state = computeStairState({
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
    })
    expect(state.riserColor).toBeNull()
    expect(state.treadColor).toBeNull()
    expect(state.comfortStatus).toBe('comfortable')
    expect(state.isBP220).toBe(false)
  })

  test('Exit Stair preset: RA 9514 conflict on riser 190>180', () => {
    const state = computeStairState({
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
    })
    expect(state.riserColor).toBe(CODE_VIOLATION_COLOR)
    expect(state.riserCompliance.ra9514.passes).toBe(false)
    expect(state.riserCompliance.ra9514.applies).toBe(true)
  })

  test('BP 220 Housing preset: BP 220 passes, PD 1096 conflict', () => {
    const state = computeStairState({
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
    })
    expect(state.isBP220).toBe(true)
    expect(state.riserCompliance.bp220.passes).toBe(true) // 240 ≤ 250
    expect(state.riserCompliance.bp220.applies).toBe(true)
    expect(state.riserCompliance.conflicts.length).toBeGreaterThan(0)
  })

  test('BP 344 handrail failures drive the universal code violation color, not law blue', () => {
    const state = computeStairState({
      projectType: 'commercial',
      isAccessibleRoute: true,
      handrailHeight: 860,
      stairWidth: 1200,
      riserHeight: 170,
      treadDepth: 300,
      numRisers: 12,
    })

    expect(state.handrailCompliance.bp344.applies).toBe(true)
    expect(state.handrailCompliance.bp344.passes).toBe(false)
    expect(state.dimensionStatuses.handrailHeight.failingLawKey).toBe('bp344')
    expect(state.handrailColor).toBe(CODE_VIOLATION_COLOR)
  })

  test('international comparison uses the active Philippine baseline', () => {
    const state = computeStairState({
      projectType: 'commercial',
      isAccessibleRoute: true,
      isExitStair: true,
      stairWidth: 1050,
      riserHeight: 190,
      treadDepth: 260,
      numRisers: 14,
      handrailHeight: 860,
    })

    const riserDelta = state.internationalDeltas.find((delta) => delta.dimension === 'riserHeight')
    const widthDelta = state.internationalDeltas.find((delta) => delta.dimension === 'stairWidth')
    const handrailDelta = state.internationalDeltas.find((delta) => delta.dimension === 'handrailHeight')
    const verticalRiseDelta = state.internationalDeltas.find((delta) => delta.dimension === 'verticalRise')

    expect(riserDelta?.phLaw).toBe('BP 344')
    expect(riserDelta?.phValue).toBe(150)
    expect(widthDelta?.phLaw).toBe('BP 344')
    expect(handrailDelta?.phLaw).toBe('BP 344')
    expect(verticalRiseDelta?.phLaw).toBe('RA 9514')
  })

  test('tolerance mode propagates actual total rise into compliance state', () => {
    const state = computeStairState({
      riserHeight: 185,
      treadDepth: 250,
      numRisers: 8,
      toleranceMode: true,
      toleranceRange: 5,
    })

    expect(state.actualRiserHeights).toHaveLength(8)
    expect(state.actualTreadElevations).toHaveLength(8)
    expect(state.actualTreadElevations.at(-1)).toBeCloseTo(state.actualTotalRise, 5)
    expect(state.verticalRiseCompliance.pd1096.actual).toBeCloseTo(state.actualTotalRise, 5)
  })
})

describe('computeEgressRequirements', () => {
  test('Assembly 300sqm → OL=462, 3 exits', () => {
    const result = computeEgressRequirements(300, 'assembly', 2, 900, false)
    expect(result.occupantLoad).toBe(462)
    expect(result.requiredExitsRA9514).toBe(3)
    expect(result.effectiveRequiredExits).toBe(3)
    expect(result.exitsCompliant).toBe(false) // 2 < 3
  })

  test('Business 500sqm → OL=54, 2 exits (PD 1096 override)', () => {
    const result = computeEgressRequirements(500, 'business', 2, 900, false)
    expect(result.occupantLoad).toBe(54)
    expect(result.requiredExitsRA9514).toBe(2)
    expect(result.pd1096Override).toBe(false) // 500 is not > 500
    expect(result.effectiveRequiredExits).toBe(2)
    expect(result.exitsCompliant).toBe(true)
  })

  test('Business 600sqm → PD 1096 override (>500sqm)', () => {
    const result = computeEgressRequirements(600, 'business', 1, 900, false)
    expect(result.pd1096Override).toBe(true)
    expect(result.effectiveRequiredExits).toBe(2)
    expect(result.exitsCompliant).toBe(false) // 1 < 2
  })

  test('Residential 100sqm → OL=6, 1 exit', () => {
    const result = computeEgressRequirements(100, 'residential', 1, 900, false)
    expect(result.occupantLoad).toBe(6)
    expect(result.requiredExitsRA9514).toBe(1)
    expect(result.exitsCompliant).toBe(true)
  })

  test('Exit width: 710mm minimum per exit', () => {
    const result = computeEgressRequirements(100, 'residential', 2, 900, false)
    expect(result.requiredWidthPerExit).toBe(710) // floor at 710
  })

  test('Stair qualification: width 600mm < 710mm → does not count', () => {
    const result = computeEgressRequirements(100, 'business', 2, 600, false)
    expect(result.stairCountsAsExit).toBe(false)
  })

  test('Stair qualification: width 900mm ≥ 710mm → counts', () => {
    const result = computeEgressRequirements(100, 'business', 2, 900, false)
    expect(result.stairCountsAsExit).toBe(true)
  })

  test('egress exposes both provided-exit and required-exit width bases', () => {
    const result = computeEgressRequirements(300, 'assembly', 2, 900, false)

    expect(result.requiredWidthPerProvidedExit).toBeGreaterThan(result.requiredWidthPerRequiredExit)
    expect(result.requiredWidthPerExit).toBe(result.requiredWidthPerRequiredExit)
    expect(result.meetsMinimumExitElementWidth).toBe(true)
    expect(result.passesExitStairWidth).toBe(true)
  })

  test('Travel distance: mercantile unsprinklered = 30m', () => {
    const result = computeEgressRequirements(100, 'mercantile', 2, 900, false)
    expect(result.travelDistanceLimit).toBe(30)
  })

  test('Travel distance: assembly sprinklered = 61m', () => {
    const result = computeEgressRequirements(100, 'assembly', 2, 900, true)
    expect(result.travelDistanceLimit).toBe(61)
  })
})
