export interface FloorTilesInput {
  roomLength: number
  roomWidth: number
  tileSize: number
  groutWidth: number
}

export interface FloorTilesResult {
  totalArea: number
  wholeTiles: number
  cutTiles: number
  totalTiles: number
  wastePercentage: number
}

export interface WallPaintInput {
  wallHeight: number
  wallWidth: number
  doorCount: number
  windowCount: number
  coats: 1 | 2 | 3
  coverageRate: number
}

export interface WallPaintResult {
  grossArea: number
  openingsArea: number
  netPaintableArea: number
  litersNeeded: number
}

export interface SurveyLine {
  id: string
  bearing: {
    from: 'N' | 'S'
    degrees: number
    minutes: number
    to: 'E' | 'W'
  }
  distance: number
}

export interface LotPlotterInput {
  lines: SurveyLine[]
}

export interface LotPlotterResult {
  coordinates: { x: number; y: number }[]
  totalArea: number
  perimeter: number
  isClosed: boolean
}
