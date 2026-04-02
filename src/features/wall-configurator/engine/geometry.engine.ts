import type { WallGeometry, Opening, AreaState, SideCount } from '../types/wall.types'

export function computeAreaState(
  geometry: WallGeometry,
  openings: Opening[],
  sides: SideCount
): AreaState {
  const grossAreaSqm = geometry.lengthM * geometry.heightM * geometry.wallCount

  const openingAreaSqm = openings.reduce(
    (sum, o) => sum + o.widthM * o.heightM * o.quantity,
    0
  )

  const clampedOpeningArea = Math.min(openingAreaSqm, grossAreaSqm)
  const netAreaSqm = grossAreaSqm - clampedOpeningArea
  const finishAreaSqm = netAreaSqm * sides

  return { grossAreaSqm, openingAreaSqm: clampedOpeningArea, netAreaSqm, finishAreaSqm }
}
