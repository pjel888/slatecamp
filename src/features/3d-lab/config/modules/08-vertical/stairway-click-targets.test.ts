import { describe, test, expect } from 'bun:test'
import { stairwayConfigurator } from './stairway-configurator'
import {
  isExplicitlyNonInteractiveStairwayId,
  matchClickTarget,
} from './stairway-click-targets'

const buildGeometry = (overrides: Record<string, number | boolean | string> = {}) =>
  stairwayConfigurator.geometry({
    projectType: 'commercial',
    isAccessibleRoute: true,
    isExitStair: true,
    isHighOccupancy: true,
    stairWidth: 1100,
    riserHeight: 180,
    treadDepth: 280,
    headroom: 2100,
    handrailHeight: 900,
    numRisers: 12,
    compareMode: true,
    detailViewActive: true,
    handrailDetailActive: true,
    primaryUsers: 'children',
    evacuationActive: true,
    floorArea: 300,
    occupancyType: 'assembly',
    providedExits: 2,
    stairType: 'straight',
    ...overrides,
  })

describe('stairway click target coverage', () => {
  test('all meaningful generated ids are inspectable or explicitly non-interactive', () => {
    const ids = new Set([
      ...buildGeometry().map((instruction) => instruction.id),
      ...buildGeometry({ stairType: 'l-shape', turnDirection: 'right', risersBeforeTurn: 7 }).map((instruction) => instruction.id),
      ...buildGeometry({ stairType: 'u-shape', risersBeforeTurn: 6 }).map((instruction) => instruction.id),
    ])

    const uncovered = [...ids].filter((id) => !matchClickTarget(id) && !isExplicitlyNonInteractiveStairwayId(id))

    expect(uncovered).toEqual([])
  })
})
