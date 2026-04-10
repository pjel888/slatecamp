import { describe, test, expect } from 'bun:test'
import { stairwayConfigurator } from './stairway-configurator'
import { validateStairGeometry } from './stairway-geometry-validator'

const buildGeometry = (overrides: Record<string, number | boolean | string> = {}) =>
  stairwayConfigurator.geometry({
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
    stairType: 'straight',
    ...overrides,
  })

describe('stairway geometry validation', () => {
  test('straight stair join planes do not overlap landings and treads', () => {
    const geometry = buildGeometry()
    const report = validateStairGeometry(geometry)

    expect(report.hasErrors).toBe(false)
    expect(report.findings).toEqual([])
  })

  test('l-shape stair keeps a valid turning join after split normalization', () => {
    const geometry = buildGeometry({
      stairType: 'l-shape',
      turnDirection: 'left',
      numRisers: 5,
      risersBeforeTurn: 12,
    })
    const report = validateStairGeometry(geometry)

    expect(report.hasErrors).toBe(false)
    expect(report.findings).toEqual([])
  })

  test('u-shape intermediate landing is centered between both flights', () => {
    const geometry = buildGeometry({
      stairType: 'u-shape',
      numRisers: 10,
      risersBeforeTurn: 6,
    })
    const report = validateStairGeometry(geometry)

    expect(report.hasErrors).toBe(false)
    expect(report.findings).toEqual([])
  })

  test('evacuation dots are deterministic for the same inputs', () => {
    const first = buildGeometry({
      evacuationActive: true,
      floorArea: 300,
      occupancyType: 'assembly',
      providedExits: 2,
      isSprinklered: false,
    })
      .filter((instruction) => instruction.id.startsWith('evac-dot-'))
      .map((instruction) => instruction.position)
    const second = buildGeometry({
      evacuationActive: true,
      floorArea: 300,
      occupancyType: 'assembly',
      providedExits: 2,
      isSprinklered: false,
    })
      .filter((instruction) => instruction.id.startsWith('evac-dot-'))
      .map((instruction) => instruction.position)

    expect(first).toEqual(second)
  })
})
