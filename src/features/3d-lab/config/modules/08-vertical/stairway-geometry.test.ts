import { describe, test, expect } from 'bun:test'
import { stairwayConfigurator } from './stairway-code-compliance'
import { validateStairGeometry } from './stairway-geometry-validator'
import { CODE_VIOLATION_COLOR, HEADROOM_PASS_COLOR, STAIR_MODEL_COLOR } from './stairway-constants'

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
  test('module uses Stairway Code Compliance identity and NW default camera', () => {
    expect(stairwayConfigurator.id).toBe('stairway-code-compliance')
    expect(stairwayConfigurator.title).toBe('Stairway Code Compliance')

    const camera = stairwayConfigurator.camera!
    expect(camera.position[0]).toBeLessThan(0)
    expect(camera.position[1]).toBeGreaterThan(0)
    expect(camera.position[2]).toBeGreaterThan(0)
    expect(camera.target?.[1]).toBeGreaterThan(0)
    expect(camera.fov).toBeLessThanOrEqual(35)
    expect(camera.resetPreset).toBe('perspective')
    expect(camera.zoomToFit?.position).toEqual(camera.position)
    expect(camera.zoomToFit?.target).toEqual(camera.target)
    expect(camera.zoomToFit?.zoom).toBeGreaterThan(0)
  })

  test('straight stair join planes do not overlap landings and treads', () => {
    const geometry = buildGeometry()
    const report = validateStairGeometry(geometry)

    expect(report.hasErrors).toBe(false)
    expect(report.findings).toEqual([])
  })


  test('straight stair dimensions render at true meter scale', () => {
    const geometry = buildGeometry({
      stairWidth: 1200,
      riserHeight: 180,
      treadDepth: 280,
      headroom: 2100,
      numRisers: 12,
    })
    const firstTread = geometry.find((instruction) => instruction.id === 'tread-0')!
    const lastTread = geometry.find((instruction) => instruction.id === 'tread-11')!
    const bottomLanding = geometry.find((instruction) => instruction.id === 'base-platform')!
    const topLanding = geometry.find((instruction) => instruction.id === 'top-landing')!
    const headroomPlane = geometry.find((instruction) => instruction.id === 'headroom-plane')!

    expect(firstTread.args).toEqual([1.2, 0.03, 0.28])
    expect(firstTread.position[0]).toBeCloseTo(0, 8)
    expect(firstTread.position[1]).toBeCloseTo(0.18 - 0.015, 8)
    expect(firstTread.position[2]).toBeCloseTo(0, 8)
    expect(lastTread.position[1] + lastTread.args[1] / 2).toBeCloseTo(2.16, 8)
    expect(bottomLanding.args[0]).toBeCloseTo(1.2, 8)
    expect(topLanding.args[0]).toBeCloseTo(1.2, 8)
    expect(bottomLanding.args[2]).toBeCloseTo(1.219, 8)
    expect(topLanding.args[2]).toBeCloseTo(1.219, 8)
    expect(topLanding.position[1] + topLanding.args[1] / 2).toBeCloseTo(2.16, 8)
    expect(headroomPlane.position[1] - (topLanding.position[1] + topLanding.args[1] / 2)).toBeCloseTo(2.1, 8)
    const bottomLandingOuterZ = bottomLanding.position[2] + bottomLanding.args[2] / 2
    const topLandingOuterZ = topLanding.position[2] - topLanding.args[2] / 2
    const expectedHeadroomCenterZ = (bottomLandingOuterZ + topLandingOuterZ) / 2
    const expectedHeadroomDepth = Math.abs(bottomLandingOuterZ - topLandingOuterZ)

    expect(headroomPlane.position[2]).toBeCloseTo(expectedHeadroomCenterZ, 8)
    expect(headroomPlane.args[0]).toBeCloseTo(topLanding.args[0], 8)
    expect(headroomPlane.args[2]).toBeCloseTo(expectedHeadroomDepth, 8)
    expect(headroomPlane.args[2]).toBeGreaterThan(topLanding.args[2])
  })

  test('headroom clearance violation plane is universal red, not law blue', () => {
    const passingGeometry = buildGeometry({ headroom: 2100 })
    const passingHeadroomPlane = passingGeometry.find((instruction) => instruction.id === 'headroom-plane')!
    expect(passingHeadroomPlane.color).toBe(HEADROOM_PASS_COLOR)

    const failingGeometry = buildGeometry({ headroom: 1900 })
    const failingHeadroomPlane = failingGeometry.find((instruction) => instruction.id === 'headroom-plane')!
    expect(failingHeadroomPlane.color).toBe(CODE_VIOLATION_COLOR)
    expect(failingHeadroomPlane.material).toBe('basic')
    expect(failingHeadroomPlane.depthWrite).toBe(false)
    expect(failingHeadroomPlane.cameraFitExclude).toBe(true)
    expect(failingHeadroomPlane.color).not.toBe('#3498DB')
    expect(failingHeadroomPlane.color).not.toBe('#4A7FAD')
  })

  test('passing physical stair assembly uses one gray color for treads, risers, landings, and railings', () => {
    const geometry = buildGeometry({
      stairWidth: 1200,
      riserHeight: 180,
      treadDepth: 250,
      handrailHeight: 900,
      headroom: 2100,
      treadMaterial: 'wood',
      toleranceMode: false,
      toleranceRange: 0,
      isAccessibleRoute: false,
      numRisers: 12,
    })

    const physicalStairIds = geometry
      .filter((instruction) =>
        instruction.id === 'base-platform' ||
        instruction.id === 'top-landing' ||
        instruction.id.startsWith('tread-') ||
        instruction.id.startsWith('riser-') ||
        instruction.id.startsWith('handrail-'),
      )
      .map((instruction) => instruction.id)

    expect(physicalStairIds.length).toBeGreaterThan(0)
    for (const id of physicalStairIds) {
      const instruction = geometry.find((item) => item.id === id)!
      expect(instruction.color).toBe(STAIR_MODEL_COLOR)
    }
  })

  test('violating physical stair parts turn red while unrelated parts stay gray', () => {
    const geometry = buildGeometry({
      stairWidth: 900,
      riserHeight: 190,
      treadDepth: 190,
      handrailHeight: 950,
      headroom: 2100,
      isAccessibleRoute: true,
      isExitStair: true,
      numRisers: 12,
    })

    const tread = geometry.find((instruction) => instruction.id === 'tread-0')!
    const riser = geometry.find((instruction) => instruction.id === 'riser-0')!
    const handrail = geometry.find((instruction) => instruction.id === 'handrail-L')!
    const bp344Rail = geometry.find((instruction) => instruction.id === 'bp344-rail-900-L')!
    const landing = geometry.find((instruction) => instruction.id === 'top-landing')!

    expect(tread.color).toBe(CODE_VIOLATION_COLOR)
    expect(riser.color).toBe(CODE_VIOLATION_COLOR)
    expect(handrail.color).toBe(CODE_VIOLATION_COLOR)
    expect(bp344Rail.color).toBe(CODE_VIOLATION_COLOR)
    expect(landing.color).toBe(STAIR_MODEL_COLOR)
  })

  test('model turns risers red for any law-card failure, including RA 9514 even when exit-stair toggle is off', () => {
    const geometry = buildGeometry({
      riserHeight: 185,
      treadDepth: 250,
      stairWidth: 1200,
      handrailHeight: 900,
      isExitStair: false,
      isAccessibleRoute: false,
    })

    const riser = geometry.find((instruction) => instruction.id === 'riser-0')!
    const tread = geometry.find((instruction) => instruction.id === 'tread-0')!
    const handrail = geometry.find((instruction) => instruction.id === 'handrail-L')!

    expect(riser.color).toBe(CODE_VIOLATION_COLOR)
    expect(tread.color).toBe(STAIR_MODEL_COLOR)
    expect(handrail.color).toBe(STAIR_MODEL_COLOR)
  })

  test('handrail extensions run horizontally to the landing edges', () => {
    const geometry = buildGeometry({
      stairWidth: 900,
      riserHeight: 185,
      treadDepth: 250,
      handrailHeight: 860,
      numRisers: 12,
    })
    const bottomLanding = geometry.find((instruction) => instruction.id === 'base-platform')!
    const topLanding = geometry.find((instruction) => instruction.id === 'top-landing')!
    const bottomExt = geometry.find((instruction) => instruction.id === 'handrail-ext-bottom-L')!
    const slopedRail = geometry.find((instruction) => instruction.id === 'handrail-L')!
    const topExt = geometry.find((instruction) => instruction.id === 'handrail-ext-top-L')!

    const bottomOuterEdgeZ = bottomLanding.position[2] + bottomLanding.args[2] / 2
    const bottomInnerEdgeZ = bottomLanding.position[2] - bottomLanding.args[2] / 2
    const topInnerEdgeZ = topLanding.position[2] + topLanding.args[2] / 2
    const topOuterEdgeZ = topLanding.position[2] - topLanding.args[2] / 2

    expect(bottomLanding.args[0]).toBeCloseTo(0.9, 8)
    expect(topLanding.args[0]).toBeCloseTo(0.9, 8)
    expect(bottomLanding.args[2]).toBeCloseTo(1.219, 8)
    expect(topLanding.args[2]).toBeCloseTo(1.219, 8)
    expect(bottomExt.rotation).toEqual([Math.PI / 2, 0, 0])
    expect(topExt.rotation).toEqual([Math.PI / 2, 0, 0])
    expect(bottomExt.args[2]).toBeCloseTo(bottomOuterEdgeZ - bottomInnerEdgeZ, 8)
    expect(topExt.args[2]).toBeCloseTo(topInnerEdgeZ - topOuterEdgeZ, 8)
    expect(bottomExt.position[2]).toBeCloseTo((bottomOuterEdgeZ + bottomInnerEdgeZ) / 2, 8)
    expect(topExt.position[2]).toBeCloseTo((topInnerEdgeZ + topOuterEdgeZ) / 2, 8)
    expect(bottomExt.position[1]).toBeCloseTo(slopedRail.position[1] - (slopedRail.args[2] / 2) * Math.sin(slopedRail.rotation[0] - Math.PI / 2), 6)
    expect(topExt.position[1]).toBeGreaterThan(bottomExt.position[1])
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
