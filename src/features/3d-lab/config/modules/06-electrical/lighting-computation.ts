export type LightingLampType = 'incandescent' | 'fluorescent' | 'led'
export type LightingRoomType = 'office' | 'reading' | 'drafting' | 'corridor' | 'custom'
export type LightingSourceStatus =
  | 'APPROVED'
  | 'APPROVED_INTERNAL'
  | 'LOCATED'
  | 'SOURCE_PENDING'
  | 'CONFLICT'
  | 'PEDAGOGICAL_ONLY'

export type LightingParamValue = number | boolean | string
export type LightingParamRecord = Record<string, LightingParamValue>

export interface LightingTargetReference {
  label: string
  targetLux: number | null
  sourceId: string
  sourceStatus: LightingSourceStatus
  sourceLabel: string
}

export interface LightingLpdReference {
  label: string
  wattsPerSqm: number
  sourceId: string
  sourceStatus: LightingSourceStatus
  sourceLabel: string
}

export interface LightingRoomState {
  lampType: LightingLampType
  roomType: LightingRoomType
  roomWidthM: number
  roomDepthM: number
  roomAreaSqm: number
  mountingHeightM: number
  wattage: number
  lumens: number
  beamAngleDeg: number
  colorTemperatureK: number
  showBeamCone: boolean
  averageLux: number
  rawAverageLux: number
  targetLux: number | null
  targetLabel: string
  targetSourceId: string
  targetSourceStatus: LightingSourceStatus
  targetSourceLabel: string
  isBelowTeachingTarget: boolean
  canRenderLegalResult: boolean
  lpdWattsPerSqm: number
  rawLpdWattsPerSqm: number
  locatedLpdReferenceWattsPerSqm: number
  lpdReferenceLabel: string
  lpdSourceId: string
  lpdSourceStatus: LightingSourceStatus
  lpdSourceLabel: string
  canRenderLpdLegalResult: boolean
  exceedsLocatedLpdReference: boolean
  efficacyLumensPerWatt: number
  beamDiameterM: number
  lumensNeededForTarget: number | null
  lumenDeltaToTarget: number | null
  visualLightIntensity: number
  visualLightColor: string
  targetReviewLabel: string
  energyReviewLabel: string
}

const DEFAULT_LAMP_TYPE: LightingLampType = 'led'
const DEFAULT_ROOM_TYPE: LightingRoomType = 'office'

export const LIGHTING_LAMP_EFFICACY: Record<LightingLampType, number> = {
  incandescent: 12,
  fluorescent: 60,
  led: 100,
}

export const LIGHTING_REVIEW_COLORS = {
  review: '#D97706',
  ready: '#2D9F6F',
} as const

export const LIGHTING_ROOM_TARGETS: Record<LightingRoomType, LightingTargetReference> = {
  office: {
    label: 'Office work area',
    targetLux: 300,
    sourceId: 'SRC-DOE-ILLUM-001',
    sourceStatus: 'LOCATED',
    sourceLabel: 'DOE Table 3.1 value located; SME approval pending',
  },
  reading: {
    label: 'Reading / study table',
    targetLux: 500,
    sourceId: 'SRC-DOE-ILLUM-002',
    sourceStatus: 'LOCATED',
    sourceLabel: 'DOE Table 3.1 value located; SME approval pending',
  },
  drafting: {
    label: 'Drafting / detailed work',
    targetLux: 750,
    sourceId: 'SRC-DOE-ILLUM-004',
    sourceStatus: 'LOCATED',
    sourceLabel: 'DOE Table 3.1 value located; SME approval pending',
  },
  corridor: {
    label: 'Corridor / circulation',
    targetLux: 150,
    sourceId: 'SRC-DOE-ILLUM-003',
    sourceStatus: 'LOCATED',
    sourceLabel: 'DOE Table 3.1 value located; SME approval pending',
  },
  custom: {
    label: 'Custom teaching setup',
    targetLux: null,
    sourceId: 'SRC-SLATE-PHOTOMETRY-001',
    sourceStatus: 'APPROVED_INTERNAL',
    sourceLabel: 'SlateCamp simplified teaching model only',
  },
}

export const LIGHTING_FORMULA_SOURCE_ID = 'SRC-SLATE-PHOTOMETRY-001'
export const LOCATED_PGBC_OFFICE_LPD_REFERENCE = 10.8

export const LIGHTING_LPD_REFERENCE: LightingLpdReference = {
  label: 'Office LPD reference',
  wattsPerSqm: LOCATED_PGBC_OFFICE_LPD_REFERENCE,
  sourceId: 'SRC-PGBC-LPD-001',
  sourceStatus: 'LOCATED',
  sourceLabel: 'Philippine Green Building Code Table 11 value located; SME approval pending',
}

export function canRenderLightingLegalResult(status: LightingSourceStatus): boolean {
  return status === 'APPROVED'
}

export function suggestedLumensForTarget(targetLux: number | null, areaSqm: number): number | null {
  if (targetLux == null) return null
  return roundToStep(targetLux * areaSqm, 50)
}

export function lumensForLampWatts(lampType: LightingLampType, wattage: number): number {
  return Math.round(wattage * LIGHTING_LAMP_EFFICACY[lampType])
}

export function computeLightingRoomState(params: LightingParamRecord): LightingRoomState {
  const lampType = parseLampType(params.lampType)
  const roomType = parseRoomType(params.roomType)
  const roomWidthM = clampNumber(readNumber(params, 'roomWidth', 4), 2, 8)
  const roomDepthM = clampNumber(readNumber(params, 'roomDepth', 4), 2, 8)
  const mountingHeightM = clampNumber(readNumber(params, 'mountingHeight', 2.7), 2.1, 3.6)
  const wattage = clampNumber(readNumber(params, 'wattage', 48), 5, 300)
  const lumens = clampNumber(readNumber(params, 'lumens', 4800), 100, 18000)
  const beamAngleDeg = clampNumber(readNumber(params, 'beamAngle', 90), 15, 120)
  const colorTemperatureK = clampNumber(readNumber(params, 'colorTemperature', 4000), 2700, 6500)
  const showBeamCone = readBoolean(params, 'showBeamCone', true)
  const roomAreaSqm = roundTo(roomWidthM * roomDepthM, 2)
  const rawAverageLux = roomAreaSqm > 0 ? lumens / roomAreaSqm : 0
  const averageLux = Math.round(rawAverageLux)
  const target = LIGHTING_ROOM_TARGETS[roomType]
  const targetLux = target.targetLux
  const lumensNeeded = suggestedLumensForTarget(targetLux, roomAreaSqm)
  const lumenDeltaToTarget = lumensNeeded == null ? null : lumensNeeded - lumens
  const isBelowTeachingTarget = targetLux != null && rawAverageLux < targetLux
  const rawLpdWattsPerSqm = roomAreaSqm > 0 ? wattage / roomAreaSqm : 0
  const lpdWattsPerSqm = roundTo(rawLpdWattsPerSqm, 1)
  const efficacyLumensPerWatt = roundTo(wattage > 0 ? lumens / wattage : 0, 1)
  const beamDiameterM = roundTo(2 * mountingHeightM * Math.tan(degreesToRadians(beamAngleDeg / 2)), 1)
  const canRenderLegalResult = canRenderLightingLegalResult(target.sourceStatus)
  const canRenderLpdLegalResult = canRenderLightingLegalResult(LIGHTING_LPD_REFERENCE.sourceStatus)
  const exceedsLocatedLpdReference = rawLpdWattsPerSqm > LIGHTING_LPD_REFERENCE.wattsPerSqm

  return {
    lampType,
    roomType,
    roomWidthM,
    roomDepthM,
    roomAreaSqm,
    mountingHeightM,
    wattage,
    lumens,
    beamAngleDeg,
    colorTemperatureK,
    showBeamCone,
    averageLux,
    rawAverageLux,
    targetLux,
    targetLabel: target.label,
    targetSourceId: target.sourceId,
    targetSourceStatus: target.sourceStatus,
    targetSourceLabel: target.sourceLabel,
    isBelowTeachingTarget,
    canRenderLegalResult,
    lpdWattsPerSqm,
    rawLpdWattsPerSqm,
    locatedLpdReferenceWattsPerSqm: LIGHTING_LPD_REFERENCE.wattsPerSqm,
    lpdReferenceLabel: LIGHTING_LPD_REFERENCE.label,
    lpdSourceId: LIGHTING_LPD_REFERENCE.sourceId,
    lpdSourceStatus: LIGHTING_LPD_REFERENCE.sourceStatus,
    lpdSourceLabel: LIGHTING_LPD_REFERENCE.sourceLabel,
    canRenderLpdLegalResult,
    exceedsLocatedLpdReference,
    efficacyLumensPerWatt,
    beamDiameterM,
    lumensNeededForTarget: lumensNeeded,
    lumenDeltaToTarget,
    visualLightIntensity: mapLumensToVisualIntensity(lumens),
    visualLightColor: kelvinToHex(colorTemperatureK),
    targetReviewLabel: targetLux == null
      ? 'Teaching model only'
      : isBelowTeachingTarget
        ? 'Below teaching target'
        : 'At teaching target',
    energyReviewLabel: getLpdReviewLabel(exceedsLocatedLpdReference, LIGHTING_LPD_REFERENCE.sourceStatus),
  }
}

export function mapLumensToVisualIntensity(lumens: number): number {
  return roundTo(clampNumber(lumens / 1600, 0.25, 8), 2)
}

export function kelvinToHex(kelvin: number): string {
  const temperature = clampNumber(kelvin, 1000, 40000) / 100
  const red = temperature <= 66
    ? 255
    : 329.698727446 * ((temperature - 60) ** -0.1332047592)
  const green = temperature <= 66
    ? 99.4708025861 * Math.log(temperature) - 161.1195681661
    : 288.1221695283 * ((temperature - 60) ** -0.0755148492)
  const blue = temperature >= 66
    ? 255
    : temperature <= 19
      ? 0
      : 138.5177312231 * Math.log(temperature - 10) - 305.0447927307

  return `#${toHexChannel(red)}${toHexChannel(green)}${toHexChannel(blue)}`
}

function parseLampType(value: LightingParamValue | undefined): LightingLampType {
  return value === 'incandescent' || value === 'fluorescent' || value === 'led'
    ? value
    : DEFAULT_LAMP_TYPE
}

function parseRoomType(value: LightingParamValue | undefined): LightingRoomType {
  return value === 'office' || value === 'reading' || value === 'drafting' || value === 'corridor' || value === 'custom'
    ? value
    : DEFAULT_ROOM_TYPE
}

function readNumber(params: LightingParamRecord, key: string, fallback: number): number {
  const value = params[key]
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) return parsed
  }
  return fallback
}

function readBoolean(params: LightingParamRecord, key: string, fallback: boolean): boolean {
  const value = params[key]
  if (typeof value === 'boolean') return value
  if (typeof value === 'string') return value === 'true'
  return fallback
}

function roundTo(value: number, decimals: number): number {
  const factor = 10 ** decimals
  return Math.round(value * factor) / factor
}

function roundToStep(value: number, step: number): number {
  return Math.round(value / step) * step
}

function clampNumber(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function degreesToRadians(degrees: number): number {
  return (degrees * Math.PI) / 180
}

function toHexChannel(value: number): string {
  const channel = Math.round(clampNumber(value, 0, 255))
  return channel.toString(16).padStart(2, '0')
}

function getLpdReviewLabel(exceedsReference: boolean, sourceStatus: LightingSourceStatus): string {
  if (!canRenderLightingLegalResult(sourceStatus)) {
    return exceedsReference
      ? 'Above located LPD reference'
      : 'Review against located LPD reference'
  }

  return exceedsReference
    ? 'Above approved LPD limit'
    : 'At approved LPD limit'
}
