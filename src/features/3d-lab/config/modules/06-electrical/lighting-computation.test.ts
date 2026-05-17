import { describe, expect, test } from 'bun:test'
import {
  LIGHTING_LPD_REFERENCE,
  LIGHTING_ROOM_TARGETS,
  canRenderLightingLegalResult,
  computeLightingRoomState,
  kelvinToHex,
  lumensForLampWatts,
  suggestedLumensForTarget,
} from './lighting-computation'

describe('lighting room computation', () => {
  test('computes average illuminance with the simplified lumens over area model', () => {
    const state = computeLightingRoomState({
      roomWidth: 4,
      roomDepth: 4,
      lumens: 4800,
      wattage: 48,
      lampType: 'led',
      roomType: 'office',
      mountingHeight: 2.7,
      beamAngle: 90,
      colorTemperature: 4000,
      showBeamCone: true,
    })

    expect(state.roomAreaSqm).toBe(16)
    expect(state.averageLux).toBe(300)
    expect(state.lpdWattsPerSqm).toBe(3)
    expect(state.efficacyLumensPerWatt).toBe(100)
    expect(state.beamDiameterM).toBe(5.4)
    expect(state.targetReviewLabel).toBe('At teaching target')
    expect(state.energyReviewLabel).toBe('Review against located LPD reference')
  })

  test('keeps target recommendations proportional to room area', () => {
    expect(suggestedLumensForTarget(750, 16)).toBe(12000)

    const drafting = computeLightingRoomState({
      roomWidth: 4,
      roomDepth: 4,
      lumens: 6000,
      wattage: 60,
      lampType: 'led',
      roomType: 'drafting',
    })

    expect(drafting.lumensNeededForTarget).toBe(12000)
    expect(drafting.lumenDeltaToTarget).toBe(6000)
    expect(drafting.isBelowTeachingTarget).toBe(true)
  })

  test('uses lamp efficacy presets for wattage-linked lumen updates', () => {
    expect(lumensForLampWatts('incandescent', 100)).toBe(1200)
    expect(lumensForLampWatts('fluorescent', 40)).toBe(2400)
    expect(lumensForLampWatts('led', 48)).toBe(4800)
  })

  test('does not render legal result language until a source is approved', () => {
    expect(canRenderLightingLegalResult('LOCATED')).toBe(false)
    expect(canRenderLightingLegalResult('SOURCE_PENDING')).toBe(false)
    expect(canRenderLightingLegalResult('APPROVED_INTERNAL')).toBe(false)
    expect(canRenderLightingLegalResult('APPROVED')).toBe(true)

    const office = computeLightingRoomState({ roomType: 'office', lumens: 4800, wattage: 48 })
    expect(office.targetSourceStatus).toBe('LOCATED')
    expect(office.canRenderLegalResult).toBe(false)
    expect(office.lpdSourceStatus).toBe('LOCATED')
    expect(office.canRenderLpdLegalResult).toBe(false)
  })

  test('keeps energy comparison as a located reference review', () => {
    const state = computeLightingRoomState({
      roomWidth: 4,
      roomDepth: 4,
      lumens: 18000,
      wattage: 300,
      lampType: 'led',
      roomType: 'office',
    })

    expect(state.lpdWattsPerSqm).toBe(18.8)
    expect(state.exceedsLocatedLpdReference).toBe(true)
    expect(state.energyReviewLabel).toBe('Above located LPD reference')
    expect(state.lpdSourceId).toBe('SRC-PGBC-LPD-001')
    expect(state.lpdSourceLabel).toContain('Philippine Green Building Code')
  })

  test('matches located source IDs from the planning workbook', () => {
    expect(LIGHTING_ROOM_TARGETS.office.sourceId).toBe('SRC-DOE-ILLUM-001')
    expect(LIGHTING_ROOM_TARGETS.reading.sourceId).toBe('SRC-DOE-ILLUM-002')
    expect(LIGHTING_ROOM_TARGETS.corridor.sourceId).toBe('SRC-DOE-ILLUM-003')
    expect(LIGHTING_ROOM_TARGETS.drafting.sourceId).toBe('SRC-DOE-ILLUM-004')
    expect(LIGHTING_LPD_REFERENCE.sourceId).toBe('SRC-PGBC-LPD-001')
  })

  test('maps color temperature to stable visual color tokens', () => {
    expect(kelvinToHex(2700)).toMatch(/^#[0-9a-f]{6}$/)
    expect(kelvinToHex(6500)).toMatch(/^#[0-9a-f]{6}$/)
    expect(kelvinToHex(2700)).not.toBe(kelvinToHex(6500))
  })
})
