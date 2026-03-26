// Pure calculation functions for Design Development Controls
// Governing codes: PD 1096 (National Building Code), BP 344 (Accessibility), RA 9514 (Fire Code)

export interface SiteInputs {
  lotArea: number
  lotCoverage: number        // percentage, e.g. 70 for 70%
  floorAreaRatio: number     // e.g. 3.0
  buildingHeight: number     // meters
  occupancyType: string      // PD 1096 occupancy group key
  buildingType: 'residential' | 'commercial' | 'institutional' | 'industrial'
  numberOfFloors: number
  isAccessible: boolean      // BP 344 applies
  parkingRequired: boolean
  isSprinklered: boolean
}

export interface Setbacks {
  front: number
  rear: number
  side: number
}

export interface CalculatedOutputs {
  pso: number                  // Percentage Site Occupancy (%)
  ambf: number                 // Allowable Maximum Building Footprint (sqm)
  tgfa: number                 // Total Gross Floor Area (sqm)
  occupantLoad: number         // persons
  requiredParking: number      // slots
  accessibleParking: number    // slots (BP 344)
  travelDistance: number       // meters (max allowed)
  exitWidthRequired: number    // meters
  setbacks: Setbacks           // meters
  codeRefs: CodeRefs
}

export interface CodeRefs {
  pso: string
  ambf: string
  tgfa: string
  occupantLoad: string
  requiredParking: string
  accessibleParking: string
  travelDistance: string
  exitWidthRequired: string
  setbacks: string
}

// ─── Occupancy load factors (sqm per person) ──────────────────────────────
// Source: PD 1096 Table VII-1, Rule VII, Div. 1, Sec. 1207
export type OccupancyKey =
  | 'assembly_standing'
  | 'assembly_seated'
  | 'business'
  | 'educational_classroom'
  | 'educational_shop'
  | 'residential'
  | 'mercantile_ground'
  | 'mercantile_upper'
  | 'industrial'

export interface OccupancyConfig {
  label: string
  sqmPerPerson: number
  group: string
  codeRef: string
}

export const OCCUPANCY_TYPES: Record<OccupancyKey, OccupancyConfig> = {
  assembly_standing: {
    label: 'Assembly — Standing (A)',
    sqmPerPerson: 1.4,
    group: 'A',
    codeRef: 'PD 1096 §VII-1207, Table VII-1',
  },
  assembly_seated: {
    label: 'Assembly — Seated (A)',
    sqmPerPerson: 2.8,
    group: 'A',
    codeRef: 'PD 1096 §VII-1207, Table VII-1',
  },
  business: {
    label: 'Business / Office (B)',
    sqmPerPerson: 9.3,
    group: 'B',
    codeRef: 'PD 1096 §VII-1207, Table VII-1',
  },
  educational_classroom: {
    label: 'Educational — Classroom (E)',
    sqmPerPerson: 1.9,
    group: 'E',
    codeRef: 'PD 1096 §VII-1207, Table VII-1',
  },
  educational_shop: {
    label: 'Educational — Shop (E)',
    sqmPerPerson: 4.6,
    group: 'E',
    codeRef: 'PD 1096 §VII-1207, Table VII-1',
  },
  residential: {
    label: 'Residential (R)',
    sqmPerPerson: 18.6,
    group: 'R',
    codeRef: 'PD 1096 §VII-1207, Table VII-1',
  },
  mercantile_ground: {
    label: 'Mercantile — Ground Floor (M)',
    sqmPerPerson: 2.8,
    group: 'M',
    codeRef: 'PD 1096 §VII-1207, Table VII-1',
  },
  mercantile_upper: {
    label: 'Mercantile — Upper Floor (M)',
    sqmPerPerson: 5.6,
    group: 'M',
    codeRef: 'PD 1096 §VII-1207, Table VII-1',
  },
  industrial: {
    label: 'Industrial / Hazardous (F/H)',
    sqmPerPerson: 9.3,
    group: 'F/H',
    codeRef: 'PD 1096 §VII-1207, Table VII-1',
  },
}

// ─── Travel distance limits (meters) ──────────────────────────────────────
// Source: RA 9514 IRR Rule 10, Sec. 10.2.3 / NFPA 101 Table 7.6
const TRAVEL_DISTANCE: Record<string, { unsprinklered: number }> = {
  assembly_standing: { unsprinklered: 30 },
  assembly_seated:   { unsprinklered: 30 },
  business:          { unsprinklered: 46 },
  educational_classroom: { unsprinklered: 30 },
  educational_shop:  { unsprinklered: 30 },
  residential:       { unsprinklered: 30 },
  mercantile_ground: { unsprinklered: 46 },
  mercantile_upper:  { unsprinklered: 46 },
  industrial:        { unsprinklered: 46 },
}

// ─── Setbacks by building type (meters) ───────────────────────────────────
// Source: PD 1096 Rule VII, Div. 2, Sec. 1208 — simplified by building type
const SETBACKS_BY_TYPE: Record<SiteInputs['buildingType'], Setbacks> = {
  residential:   { front: 4.5, rear: 2.0, side: 2.0 },
  commercial:    { front: 6.0, rear: 3.0, side: 3.0 },
  institutional: { front: 6.0, rear: 5.0, side: 3.0 },
  industrial:    { front: 6.0, rear: 5.0, side: 5.0 },
}

// ─── Parking ratios by building type ──────────────────────────────────────
// Source: PD 1096 Rule XIX, Sec. 1901 / Table XIX-1
const PARKING_RATIO: Record<SiteInputs['buildingType'], { slotsPerUnit?: number; sqmPerSlot?: number }> = {
  residential:   { slotsPerUnit: 1 },
  commercial:    { sqmPerSlot: 100 },
  institutional: { sqmPerSlot: 100 },
  industrial:    { sqmPerSlot: 150 },
}

// ─── Core calculations ─────────────────────────────────────────────────────

const calcAMBF = (lotArea: number, lotCoverage: number): number =>
  round2(lotArea * (lotCoverage / 100))

const calcTGFA = (ambf: number, far: number): number =>
  round2(ambf * far)

const calcPSO = (ambf: number, lotArea: number): number =>
  lotArea > 0 ? round2((ambf / lotArea) * 100) : 0

const calcOccupantLoad = (tgfa: number, occupancyType: string): number => {
  const config = OCCUPANCY_TYPES[occupancyType as OccupancyKey]
  if (!config || config.sqmPerPerson <= 0) return 0
  return Math.ceil(tgfa / config.sqmPerPerson)
}

const calcRequiredParking = (
  buildingType: SiteInputs['buildingType'],
  tgfa: number,
  _numberOfFloors: number,
): number => {
  const ratio = PARKING_RATIO[buildingType]
  if (!ratio) return 0
  if (ratio.slotsPerUnit) {
    // For residential: 1 slot per unit — approximate units as floors * (tgfa/floors/80sqm avg unit)
    const approxUnits = Math.max(1, Math.round(tgfa / 80))
    return approxUnits * ratio.slotsPerUnit
  }
  if (ratio.sqmPerSlot) {
    return Math.ceil(tgfa / ratio.sqmPerSlot)
  }
  return 0
}

const calcAccessibleParking = (requiredParking: number): number => {
  // BP 344 Sec. 5: 1 accessible slot per 50 regular slots, minimum 1
  return Math.max(1, Math.ceil(requiredParking / 50))
}

const calcTravelDistance = (occupancyType: string, isSprinklered: boolean): number => {
  const base = TRAVEL_DISTANCE[occupancyType]?.unsprinklered ?? 30
  // RA 9514 permits 50% increase for sprinklered buildings
  return isSprinklered ? round2(base * 1.5) : base
}

const calcExitWidth = (occupantLoad: number): number => {
  // RA 9514 / PD 1096 §VII-1207: 6.1mm per occupant, minimum 900mm
  const widthMm = occupantLoad * 6.1
  return round2(Math.max(900, widthMm) / 1000) // convert to meters
}

const round2 = (n: number): number => Math.round(n * 100) / 100

// ─── Main exported calculator ──────────────────────────────────────────────

export const calculate = (inputs: SiteInputs): CalculatedOutputs => {
  const ambf = calcAMBF(inputs.lotArea, inputs.lotCoverage)
  const tgfa = calcTGFA(ambf, inputs.floorAreaRatio)
  const pso = calcPSO(ambf, inputs.lotArea)
  const occupantLoad = calcOccupantLoad(tgfa, inputs.occupancyType)
  const requiredParking = inputs.parkingRequired
    ? calcRequiredParking(inputs.buildingType, tgfa, inputs.numberOfFloors)
    : 0
  const accessibleParking = inputs.isAccessible
    ? calcAccessibleParking(requiredParking)
    : 0
  const travelDistance = calcTravelDistance(inputs.occupancyType, inputs.isSprinklered)
  const exitWidthRequired = calcExitWidth(occupantLoad)
  const setbacks = SETBACKS_BY_TYPE[inputs.buildingType]

  const codeRefs: CodeRefs = {
    pso: 'PD 1096 §VII-1202',
    ambf: 'PD 1096 §VII-1202',
    tgfa: 'PD 1096 §VII-1202',
    occupantLoad: OCCUPANCY_TYPES[inputs.occupancyType as OccupancyKey]?.codeRef ?? 'PD 1096 §VII-1207',
    requiredParking: 'PD 1096 §XIX-1901, Table XIX-1',
    accessibleParking: 'BP 344 §5 (1 per 50 slots, min. 1)',
    travelDistance: 'RA 9514 IRR Rule 10, §10.2.3',
    exitWidthRequired: 'RA 9514 / PD 1096 §VII-1207 (6.1mm/occupant)',
    setbacks: 'PD 1096 §VII-1208, Rule VII Div. 2',
  }

  return {
    pso,
    ambf,
    tgfa,
    occupantLoad,
    requiredParking,
    accessibleParking,
    travelDistance,
    exitWidthRequired,
    setbacks,
    codeRefs,
  }
}

export const DEFAULT_INPUTS: SiteInputs = {
  lotArea: 500,
  lotCoverage: 70,
  floorAreaRatio: 3.0,
  buildingHeight: 12,
  occupancyType: 'business',
  buildingType: 'commercial',
  numberOfFloors: 3,
  isAccessible: true,
  parkingRequired: true,
  isSprinklered: false,
}
