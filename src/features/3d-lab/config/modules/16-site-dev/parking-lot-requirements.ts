import type { AnnotationDef, GeometryInstruction, ParameterDef, ParametricSceneConfig, Preset, SourceTruthRule, ViolationRule } from '@/features/3d-lab/types/templates'

type ParamValue = number | boolean | string

type ParkingParams = Record<string, ParamValue>

const STANDARD_SLOT_COLOR = '#cbd5e1'
const PWD_SLOT_COLOR = '#facc15'
const SLOT_LINE_COLOR = '#64748b'

export const PARKING_SOURCE_STATUSES = {
  LOCATED: 'LOCATED_NEEDS_SME_REVIEW',
  PARTIAL: 'PARTIAL_LOCATED_TABLE_NEEDS_EXTRACTION',
  FAIL_CLOSED: 'SOURCE_PENDING_FAIL_CLOSED',
  OPTIONAL: 'SOURCE_PENDING_OPTIONAL_OVERLAY',
  CONTEXT_ONLY: 'LOCATED_CONTEXT_ONLY_DEFER_DETAILED_RULES',
} as const

const sourceRules: SourceTruthRule[] = [
  {
    source_rule_id: 'PARK-PD1096-STD-STALL',
    source_card_id: 'PARK-PD1096-STD-STALL',
    source_candidate_id: 'parking-lot-requirements-2026-05-14',
    source_sha256: 'ca465dd26cb1c4a235fd63d01b19c7239a73920f3753b7807cc8e98a3ac33bc6',
    document_path: 'vitruvius-connection/001_Raw-Source-Layer/001-Laws/PD-1096/PD 1096 RIRR 2004 - Revised IRR (DPWH Official).pdf',
    page_locator: 'PDF p.97; internal page 94 of 267',
    section_locator: 'Rule VIII, Section 804, item 4(b)',
    exact_quote: 'The size of an average automobile (car) parking slot must be computed at 2.50 meters by 5.00 meters for perpendicular or diagonal parking and at 2.15 meters by 6.00 meters for parallel parking.',
    normalized_rule: 'Perpendicular/diagonal average car parking slot = 2.50 m x 5.00 m.',
    classification: 'code-mandated',
    compliance_scope: 'NBCP baseline for off-street/off-RROW on-site parking.',
    human_review_status: PARKING_SOURCE_STATUSES.LOCATED,
    fail_closed_when_source_missing: true,
    value: '2.50 m x 5.00 m',
  },
  {
    source_rule_id: 'PARK-PD1096-PARALLEL',
    source_card_id: 'PARK-PD1096-PARALLEL',
    source_candidate_id: 'parking-lot-requirements-2026-05-14',
    source_sha256: 'ca465dd26cb1c4a235fd63d01b19c7239a73920f3753b7807cc8e98a3ac33bc6',
    document_path: 'vitruvius-connection/001_Raw-Source-Layer/001-Laws/PD-1096/PD 1096 RIRR 2004 - Revised IRR (DPWH Official).pdf',
    page_locator: 'PDF p.97; internal page 94 of 267',
    section_locator: 'Rule VIII, Section 804, item 4(b)',
    exact_quote: 'The size of an average automobile (car) parking slot must be computed at 2.50 meters by 5.00 meters for perpendicular or diagonal parking and at 2.15 meters by 6.00 meters for parallel parking.',
    normalized_rule: 'Parallel average car parking slot = 2.15 m x 6.00 m.',
    classification: 'code-mandated',
    compliance_scope: 'NBCP baseline for parallel parking/loading slot.',
    human_review_status: PARKING_SOURCE_STATUSES.LOCATED,
    fail_closed_when_source_missing: true,
    value: '2.15 m x 6.00 m',
  },
  {
    source_rule_id: 'PARK-PD1096-AISLE-90',
    source_card_id: 'PARK-PD1096-AISLE-90',
    source_candidate_id: 'parking-lot-requirements-2026-05-14',
    source_sha256: 'ca465dd26cb1c4a235fd63d01b19c7239a73920f3753b7807cc8e98a3ac33bc6',
    document_path: 'vitruvius-connection/001_Raw-Source-Layer/001-Laws/PD-1096/PD 1096 RIRR 2004 - Revised IRR (DPWH Official).pdf',
    page_locator: 'NOT LOCATED in searched raw PD1096 RIRR text pages p.97-109 and keyword scan',
    section_locator: 'TBD',
    exact_quote: 'No reliable raw-text quote located for a 90-degree drive aisle width.',
    normalized_rule: 'Do not release a PD1096 90-degree aisle-width compliance check yet; 6.00 m remains unverified draft value.',
    classification: 'code-mandated',
    compliance_scope: 'Fail closed for aisle-width compliance labels.',
    human_review_status: PARKING_SOURCE_STATUSES.FAIL_CLOSED,
    fail_closed_when_source_missing: true,
    value: 'SOURCE PENDING',
  },
  {
    source_rule_id: 'PARK-PD1096-TABLE-VII-4',
    source_card_id: 'PARK-PD1096-TABLE-VII-4',
    source_candidate_id: 'parking-lot-requirements-2026-05-14',
    source_sha256: 'raw-extract-pd1096-complete-scan-page-217-227',
    document_path: 'vitruvius-connection/001_Raw-Source-Layer/001-Laws/PD-1096/PD 1096 - National Building Code Complete Scan.pdf',
    page_locator: 'PDF pp.217-227; printed pp.90-100',
    section_locator: 'Rule VII, Table VII.4 Minimum Required Off-Street (Off-RROW) cum On-Site Parking Slot, Parking-Area and Loading/Unloading Space Requirements by Allowed Use or Occupancy',
    exact_quote: 'Restaurant: one car slot for every 30.00 sq. meters of customer area; shopping center: one car slot for every 100.00 sq. meters of shopping floor area; office/commercial condo units above 70.00 sq. meters: one parking slot for every 70.00 sq. meters or fraction thereof; hotels: one car slot for every three rooms in highly urbanized areas and every seven rooms in other areas; hospitals: one slot per 25 public beds or 12 private beds; industrial: one car slot per 1,000.00 sq. meters GFA.',
    normalized_rule: 'PD1096 Table VII.4 provides parking ratios by use/occupancy and project quantity basis.',
    classification: 'code-mandated',
    compliance_scope: 'Typology-first parking requirement calculator for selected high-frequency occupancies.',
    human_review_status: PARKING_SOURCE_STATUSES.LOCATED,
    fail_closed_when_source_missing: true,
    value: 'typology parking ratios',
  },
  {
    source_rule_id: 'PARK-PD1096-RESTAURANT-RATIO',
    source_card_id: 'PARK-PD1096-TABLE-VII-4',
    source_candidate_id: 'parking-lot-requirements-2026-05-14',
    source_sha256: 'raw-extract-pd1096-complete-scan-page-223',
    document_path: 'vitruvius-connection/001_Raw-Source-Layer/001-Laws/PD-1096/PD 1096 - National Building Code Complete Scan.pdf',
    page_locator: 'PDF p.223; printed p.96',
    section_locator: 'Rule VII, Table VII.4, Group E Division E-2',
    exact_quote: 'Restaurants, fast-food centers, bars and beerhouses: One (1) car slot for every 30.00 sq. meters of customer area.',
    normalized_rule: 'Restaurants / fast-food / bars require 1 car slot per 30 sqm customer area.',
    classification: 'code-mandated',
    compliance_scope: 'Restaurant/customer-area parking calculation.',
    human_review_status: PARKING_SOURCE_STATUSES.LOCATED,
    fail_closed_when_source_missing: true,
    value: '1 slot / 30 sqm customer area',
  },
  {
    source_rule_id: 'PARK-PD1096-OFFICE-CONDO-LARGE',
    source_card_id: 'PARK-PD1096-TABLE-VII-4',
    source_candidate_id: 'parking-lot-requirements-2026-05-14',
    source_sha256: 'raw-extract-pd1096-complete-scan-page-224',
    document_path: 'vitruvius-connection/001_Raw-Source-Layer/001-Laws/PD-1096/PD 1096 - National Building Code Complete Scan.pdf',
    page_locator: 'PDF p.224; printed p.97',
    section_locator: 'Rule VII, Table VII.4, office/commercial/mixed-use condominium units',
    exact_quote: 'Unit with a gross floor area of more than 70.00 sq. meters - provide one (1) parking slot for every 70.00 sq. meters and for a fraction thereof.',
    normalized_rule: 'Office/commercial/mixed-use condominium unit above 70 sqm requires 1 slot per 70 sqm GFA or fraction thereof.',
    classification: 'code-mandated',
    compliance_scope: 'Office/commercial condominium parking calculation for the selected simplified typology.',
    human_review_status: PARKING_SOURCE_STATUSES.LOCATED,
    fail_closed_when_source_missing: true,
    value: '1 slot / 70 sqm GFA',
  },
  { source_rule_id: 'PARK-PD1096-SHOPPING-RATIO', source_card_id: 'PARK-PD1096-TABLE-VII-4', source_candidate_id: 'parking-lot-requirements-2026-05-14', source_sha256: 'raw-extract-pd1096-complete-scan-page-223', document_path: 'vitruvius-connection/001_Raw-Source-Layer/001-Laws/PD-1096/PD 1096 - National Building Code Complete Scan.pdf', page_locator: 'PDF p.223; printed p.96', section_locator: 'Rule VII, Table VII.4, Group E Division E-2', exact_quote: 'Neighborhood shopping center/supermarket: One (1) car slot for every 100.00 sq. meters of shopping floor area.', normalized_rule: 'Shopping center/supermarket requires 1 car slot per 100 sqm shopping floor area.', classification: 'code-mandated', compliance_scope: 'Shopping-center parking calculation.', human_review_status: PARKING_SOURCE_STATUSES.LOCATED, fail_closed_when_source_missing: true, value: '1 slot / 100 sqm shopping floor area' },
  { source_rule_id: 'PARK-PD1096-HOTEL-HUA-RATIO', source_card_id: 'PARK-PD1096-TABLE-VII-4', source_candidate_id: 'parking-lot-requirements-2026-05-14', source_sha256: 'raw-extract-pd1096-complete-scan-page-219', document_path: 'vitruvius-connection/001_Raw-Source-Layer/001-Laws/PD-1096/PD 1096 - National Building Code Complete Scan.pdf', page_locator: 'PDF p.219; printed p.92', section_locator: 'Rule VII, Table VII.4, Group B Hotels', exact_quote: 'Hotels: One (1) car parking slot for every three (3) rooms or a fraction thereof for highly urbanized areas.', normalized_rule: 'Hotels in highly urbanized areas require 1 car slot per 3 rooms or fraction thereof.', classification: 'code-mandated', compliance_scope: 'Hotel parking calculation.', human_review_status: PARKING_SOURCE_STATUSES.LOCATED, fail_closed_when_source_missing: true, value: '1 slot / 3 rooms' },
  { source_rule_id: 'PARK-PD1096-HOTEL-OTHER-RATIO', source_card_id: 'PARK-PD1096-TABLE-VII-4', source_candidate_id: 'parking-lot-requirements-2026-05-14', source_sha256: 'raw-extract-pd1096-complete-scan-page-219', document_path: 'vitruvius-connection/001_Raw-Source-Layer/001-Laws/PD-1096/PD 1096 - National Building Code Complete Scan.pdf', page_locator: 'PDF p.219; printed p.92', section_locator: 'Rule VII, Table VII.4, Group B Hotels', exact_quote: 'Hotels: one (1) car parking slot for every seven (7) rooms or a fraction thereof for all other areas.', normalized_rule: 'Hotels outside highly urbanized areas require 1 car slot per 7 rooms or fraction thereof.', classification: 'code-mandated', compliance_scope: 'Hotel parking calculation.', human_review_status: PARKING_SOURCE_STATUSES.LOCATED, fail_closed_when_source_missing: true, value: '1 slot / 7 rooms' },
  { source_rule_id: 'PARK-PD1096-PUBLIC-HOSPITAL-RATIO', source_card_id: 'PARK-PD1096-TABLE-VII-4', source_candidate_id: 'parking-lot-requirements-2026-05-14', source_sha256: 'raw-extract-pd1096-complete-scan-page-221', document_path: 'vitruvius-connection/001_Raw-Source-Layer/001-Laws/PD-1096/PD 1096 - National Building Code Complete Scan.pdf', page_locator: 'PDF p.221; printed p.94', section_locator: 'Rule VII, Table VII.4, Group D Public hospital', exact_quote: 'Public hospital: One (1) off-street cum on-site car parking slot for every twenty five (25) beds.', normalized_rule: 'Public hospitals require 1 car slot per 25 beds.', classification: 'code-mandated', compliance_scope: 'Public hospital parking calculation.', human_review_status: PARKING_SOURCE_STATUSES.LOCATED, fail_closed_when_source_missing: true, value: '1 slot / 25 beds' },
  { source_rule_id: 'PARK-PD1096-PRIVATE-HOSPITAL-RATIO', source_card_id: 'PARK-PD1096-TABLE-VII-4', source_candidate_id: 'parking-lot-requirements-2026-05-14', source_sha256: 'raw-extract-pd1096-complete-scan-page-222', document_path: 'vitruvius-connection/001_Raw-Source-Layer/001-Laws/PD-1096/PD 1096 - National Building Code Complete Scan.pdf', page_locator: 'PDF p.222; printed p.95', section_locator: 'Rule VII, Table VII.4, Group D Private hospital', exact_quote: 'Private hospital: One (1) off-street cum on-site car parking slot for every twelve (12) beds.', normalized_rule: 'Private hospitals and nursing homes require 1 car slot per 12 beds.', classification: 'code-mandated', compliance_scope: 'Private hospital parking calculation.', human_review_status: PARKING_SOURCE_STATUSES.LOCATED, fail_closed_when_source_missing: true, value: '1 slot / 12 beds' },
  { source_rule_id: 'PARK-PD1096-INDUSTRIAL-RATIO', source_card_id: 'PARK-PD1096-TABLE-VII-4', source_candidate_id: 'parking-lot-requirements-2026-05-14', source_sha256: 'raw-extract-pd1096-complete-scan-page-224-225', document_path: 'vitruvius-connection/001_Raw-Source-Layer/001-Laws/PD-1096/PD 1096 - National Building Code Complete Scan.pdf', page_locator: 'PDF pp.224-225; printed pp.97-98', section_locator: 'Rule VII, Table VII.4, Groups F/G Industrial', exact_quote: 'Industrial buildings... One (1) car slot for every 1,000.00 sq. meters of gross floor area.', normalized_rule: 'Industrial/warehouse/manufacturing occupancies require 1 car slot per 1,000 sqm gross floor area.', classification: 'code-mandated', compliance_scope: 'Industrial parking calculation.', human_review_status: PARKING_SOURCE_STATUSES.LOCATED, fail_closed_when_source_missing: true, value: '1 slot / 1,000 sqm GFA' },
  {
    source_rule_id: 'PARK-BP344-ACCESSIBLE-COUNT',
    source_card_id: 'PARK-BP344-ACCESSIBLE-COUNT',
    source_candidate_id: 'parking-lot-requirements-2026-05-14',
    source_sha256: '63ba8df9a0c5092aa28aae1e1afbbff4f82697768b4ce38230f960444a6a4953',
    document_path: 'vitruvius-connection/001_Raw-Source-Layer/001-Laws/BP-344/2024 Revised Implementing Rules and Regulations Batas Pambansa Blg. 344 _ National Council on Disability Affairs.pdf',
    page_locator: 'PDF pp.8-9',
    section_locator: 'Section A.6 Parking; Table A.6.1',
    exact_quote: '1-25:1; 26-50:2; 51-75:3; 76-100:4; 101-150:5; 151-200:6; 201-300:7; 301-400:8; 401-500:9; 501-1000:2% of Total Parking Spaces; 1001-Over:20+ (1 for each 100 or fraction over 1000).',
    normalized_rule: 'Accessible parking count bands as Table A.6.1.',
    classification: 'code-mandated',
    compliance_scope: 'Where parking slots are required.',
    human_review_status: PARKING_SOURCE_STATUSES.LOCATED,
    fail_closed_when_source_missing: true,
  },
  {
    source_rule_id: 'PARK-BP344-ACCESSIBLE-GEOM',
    source_card_id: 'PARK-BP344-ACCESSIBLE-GEOM',
    source_candidate_id: 'parking-lot-requirements-2026-05-14',
    source_sha256: '63ba8df9a0c5092aa28aae1e1afbbff4f82697768b4ce38230f960444a6a4953',
    document_path: 'vitruvius-connection/001_Raw-Source-Layer/001-Laws/BP-344/2024 Revised Implementing Rules and Regulations Batas Pambansa Blg. 344 _ National Council on Disability Affairs.pdf',
    page_locator: 'PDF pp.9-10; signage continues p.11',
    section_locator: 'Section A.6 Parking; Fig. A.6.1',
    exact_quote: 'Accessible parking slots shall have: A minimum width of 4000 mm and a length of 5000 mm. The additional 1500 mm width... accommodates wheelchair passage. A walkway with a minimum clear width of 1200 mm provided between the front ends of parked cars.',
    normalized_rule: 'Accessible stall = min 4000 mm x 5000 mm; includes extra 1500 mm adjacent wheelchair passage; front walkway min clear width 1200 mm.',
    classification: 'code-mandated',
    compliance_scope: 'Accessible parking slots under BP344 2024 Revised IRR.',
    human_review_status: PARKING_SOURCE_STATUSES.LOCATED,
    fail_closed_when_source_missing: true,
    value: '4000 mm x 5000 mm; 1200 mm front walkway',
  },
  {
    source_rule_id: 'PARK-BP220-RATIO',
    source_card_id: 'PARK-BP220-RATIO',
    source_candidate_id: 'parking-lot-requirements-2026-05-14',
    source_sha256: '7392741260c227647afe39de283f3efa979465692da8905e59be8857c8651614',
    document_path: 'vitruvius-connection/001_Raw-Source-Layer/001-Laws/BP-220/Revised_IRR_BP220_2008.pdf',
    page_locator: 'PDF p.39',
    section_locator: 'Section D.3(g) Parking Requirements (Amended per Board Res. No. 824, Series of 2008)',
    exact_quote: 'For multi-family dwellings and condominiums, the parking requirement shall be one (1) parking slot per eight (8) living units. The size of an average automobile (car) parking slot must be computed at 2.5 meters by 5.0 meters for perpendicular or diagonal parking and at 2.15 meters by 6.0 meters for parallel parking.',
    normalized_rule: 'BP220 multi-family dwellings and condominiums require 1 parking slot per 8 living units.',
    classification: 'code-mandated',
    compliance_scope: 'BP220 multi-family dwellings and condominiums; residential condominium provisions still require SME comparison with PD957 where applicable.',
    human_review_status: PARKING_SOURCE_STATUSES.LOCATED,
    fail_closed_when_source_missing: true,
    value: '1 parking slot per 8 living units',
  },
  {
    source_rule_id: 'PARK-RA11697-EV-COUNT',
    source_card_id: 'PARK-RA11697-EV-COUNT',
    source_candidate_id: 'parking-lot-requirements-2026-05-14',
    source_sha256: 'web-elibrary-ra11697-section-17-2026-05-14',
    document_path: 'https://elibrary.judiciary.gov.ph//thebookshelf//showdocs/2/95174',
    page_locator: 'Section 17',
    section_locator: 'RA 11697, Section 17 Dedicated Parking Slots for Electric Vehicles in Private and Public Buildings and Establishments',
    exact_quote: 'If there are twenty (20) or more parking slots, there should be at least five percent (5%) dedicated parking slots for EVs of the total number of parking slots.',
    normalized_rule: 'Private and public buildings and establishments with 20 or more parking slots must dedicate at least 5% of total parking slots for EVs.',
    classification: 'code-mandated',
    compliance_scope: 'Dedicated EV parking slots are included within the total parking slots.',
    human_review_status: PARKING_SOURCE_STATUSES.LOCATED,
    fail_closed_when_source_missing: true,
    value: '5% EV slots when total parking slots >= 20',
  },
  {
    source_rule_id: 'PARK-RA9514-GARAGE',
    source_card_id: 'PARK-RA9514-GARAGE',
    source_candidate_id: 'parking-lot-requirements-2026-05-14',
    source_sha256: 'ace1e9fbbeb67d294171ed743d46eda2a4c199b9bb642862bab8524b80754266',
    document_path: 'vitruvius-connection/001_Raw-Source-Layer/001-Laws/RA-9514/RA9514-RIRR-rev-2019.pdf',
    page_locator: 'PDF pp.190-191',
    section_locator: '2019 RIRR Special Provision for Parking Structures',
    exact_quote: 'The following provisions apply to parking structures of closed or open type, above or below ground, but not to mechanical or exclusively attendant parking facilities.',
    normalized_rule: 'RA9514 has parking-structure fire/life-safety scope; defer detailed fire checks from geometric MVP.',
    classification: 'pedagogical',
    compliance_scope: 'Parking structures open/closed, above/below ground.',
    human_review_status: PARKING_SOURCE_STATUSES.CONTEXT_ONLY,
    fail_closed_when_source_missing: true,
  },
]

export function numberParam(params: ParkingParams, key: string, fallback: number): number {
  const value = params[key]
  return typeof value === 'number' ? value : Number(value ?? fallback)
}

export function requiredAccessibleParkingSlots(totalStalls: number): number {
  if (totalStalls <= 0) return 0
  if (totalStalls <= 25) return 1
  if (totalStalls <= 50) return 2
  if (totalStalls <= 75) return 3
  if (totalStalls <= 100) return 4
  if (totalStalls <= 150) return 5
  if (totalStalls <= 200) return 6
  if (totalStalls <= 300) return 7
  if (totalStalls <= 400) return 8
  if (totalStalls <= 500) return 9
  if (totalStalls <= 1000) return Math.ceil(totalStalls * 0.02)
  return 20 + Math.ceil((totalStalls - 1000) / 100)
}

export function requiredEvParkingSlots(totalStalls: number): number {
  const safeTotal = Math.max(0, Math.ceil(totalStalls))
  if (safeTotal < 20) return 0
  return Math.ceil(safeTotal * 0.05)
}

export function parkingStallMinimums(orientation: string) {
  if (orientation === 'parallel') return { widthMm: 2150, depthMm: 6000, sourceRuleId: 'PARK-PD1096-PARALLEL' }
  return { widthMm: 2500, depthMm: 5000, sourceRuleId: 'PARK-PD1096-STD-STALL' }
}

export function requiredBp220ParkingSlots(livingUnits: number): number {
  if (livingUnits <= 0) return 0
  return Math.ceil(livingUnits / 8)
}

export type ParkingRequirementTypology = {
  id: string
  label: string
  basisLabel: string
  basisUnit: string
  per: number
  sourceRuleId: string
  ruleLabel: string
  displayLabel: string
  selectorGroup: string
  selectorHint: string
  iconKey: 'dining' | 'retail' | 'office' | 'hotel' | 'healthcare' | 'industrial' | 'housing'
  defaultBasisValue: number
  maxBasisValue: number
}

export const parkingRequirementTypologies: ParkingRequirementTypology[] = [
  { id: 'restaurant', label: 'Restaurant / fast-food / bar', displayLabel: 'Restaurants and bars', selectorGroup: 'Food and beverage', selectorHint: 'Customer-area basis for the parking ratio.', iconKey: 'dining', basisLabel: 'Customer area', basisUnit: 'sqm customer area', per: 30, sourceRuleId: 'PARK-PD1096-RESTAURANT-RATIO', ruleLabel: '1 car slot per 30 sqm customer area', defaultBasisValue: 300, maxBasisValue: 3000 },
  { id: 'shopping-center', label: 'Neighborhood shopping / supermarket', displayLabel: 'Shopping center or supermarket', selectorGroup: 'Retail', selectorHint: 'Shopping floor area basis for the parking ratio.', iconKey: 'retail', basisLabel: 'Shopping floor area', basisUnit: 'sqm shopping floor area', per: 100, sourceRuleId: 'PARK-PD1096-SHOPPING-RATIO', ruleLabel: '1 car slot per 100 sqm shopping floor area', defaultBasisValue: 1000, maxBasisValue: 10000 },
  { id: 'office-condominium-large', label: 'Office / commercial condo unit >70 sqm', displayLabel: 'Office or commercial condominium', selectorGroup: 'Business', selectorHint: 'Gross floor area basis for the parking ratio.', iconKey: 'office', basisLabel: 'Gross floor area', basisUnit: 'sqm gross floor area', per: 70, sourceRuleId: 'PARK-PD1096-OFFICE-CONDO-LARGE', ruleLabel: '1 car slot per 70 sqm gross floor area or fraction thereof', defaultBasisValue: 700, maxBasisValue: 10000 },
  { id: 'hotel-highly-urbanized', label: 'Hotel — highly urbanized area', displayLabel: 'Hotel in a highly urbanized area', selectorGroup: 'Hotels', selectorHint: 'Room-count basis for the parking ratio.', iconKey: 'hotel', basisLabel: 'Hotel rooms', basisUnit: 'rooms', per: 3, sourceRuleId: 'PARK-PD1096-HOTEL-HUA-RATIO', ruleLabel: '1 car slot per 3 rooms or fraction thereof', defaultBasisValue: 60, maxBasisValue: 1000 },
  { id: 'hotel-other-area', label: 'Hotel — other areas', displayLabel: 'Hotel in all other areas', selectorGroup: 'Hotels', selectorHint: 'Room-count basis for the parking ratio.', iconKey: 'hotel', basisLabel: 'Hotel rooms', basisUnit: 'rooms', per: 7, sourceRuleId: 'PARK-PD1096-HOTEL-OTHER-RATIO', ruleLabel: '1 car slot per 7 rooms or fraction thereof', defaultBasisValue: 60, maxBasisValue: 1000 },
  { id: 'public-hospital', label: 'Public hospital', displayLabel: 'Public hospital', selectorGroup: 'Healthcare', selectorHint: 'Public-bed count basis for the parking ratio.', iconKey: 'healthcare', basisLabel: 'Public hospital beds', basisUnit: 'beds', per: 25, sourceRuleId: 'PARK-PD1096-PUBLIC-HOSPITAL-RATIO', ruleLabel: '1 car slot per 25 beds', defaultBasisValue: 100, maxBasisValue: 2000 },
  { id: 'private-hospital', label: 'Private hospital / nursing home', displayLabel: 'Private hospital or nursing home', selectorGroup: 'Healthcare', selectorHint: 'Private-bed count basis for the parking ratio.', iconKey: 'healthcare', basisLabel: 'Private hospital beds', basisUnit: 'beds', per: 12, sourceRuleId: 'PARK-PD1096-PRIVATE-HOSPITAL-RATIO', ruleLabel: '1 car slot per 12 beds', defaultBasisValue: 120, maxBasisValue: 2000 },
  { id: 'industrial', label: 'Industrial / warehouse / manufacturing', displayLabel: 'Industrial or warehouse', selectorGroup: 'Industrial', selectorHint: 'Gross floor area basis for the parking ratio.', iconKey: 'industrial', basisLabel: 'Gross floor area', basisUnit: 'sqm gross floor area', per: 1000, sourceRuleId: 'PARK-PD1096-INDUSTRIAL-RATIO', ruleLabel: '1 car slot per 1,000 sqm gross floor area', defaultBasisValue: 5000, maxBasisValue: 50000 },
  { id: 'bp220-multifamily', label: 'BP 220 multifamily / condominium', displayLabel: 'Multifamily dwelling or condominium', selectorGroup: 'Residential', selectorHint: 'Living-unit basis for the parking ratio.', iconKey: 'housing', basisLabel: 'Living units', basisUnit: 'living units', per: 8, sourceRuleId: 'PARK-BP220-RATIO', ruleLabel: '1 parking slot per 8 living units', defaultBasisValue: 80, maxBasisValue: 2000 },
]

export function getParkingRequirementTypology(id: string): ParkingRequirementTypology | undefined {
  return parkingRequirementTypologies.find((item) => item.id === id)
}

export function requiredParkingSlotsForTypology(typologyId: string, basisValue: number): number {
  const typology = getParkingRequirementTypology(typologyId) ?? parkingRequirementTypologies[0]
  if (basisValue <= 0) return 0
  return Math.ceil(basisValue / typology.per)
}

export function evaluateParkingChecks(params: ParkingParams) {
  const typologyId = String(params.typology ?? 'office-condominium-large')
  const selectedTypology = getParkingRequirementTypology(typologyId) ?? parkingRequirementTypologies[0]
  const basisValue = numberParam(params, 'basisValue', selectedTypology.id === 'bp220-multifamily' ? numberParam(params, 'livingUnits', selectedTypology.defaultBasisValue) : selectedTypology.defaultBasisValue)
  const requiredParkingSlots = requiredParkingSlotsForTypology(selectedTypology.id, basisValue)
  const totalStalls = numberParam(params, 'providedStalls', numberParam(params, 'totalStalls', requiredParkingSlots))
  const livingUnits = selectedTypology.id === 'bp220-multifamily' ? basisValue : numberParam(params, 'livingUnits', 80)
  const accessibleStalls = numberParam(params, 'accessibleStalls', 1)
  const stallWidthMm = numberParam(params, 'stallWidthMm', 2500)
  const stallDepthMm = numberParam(params, 'stallDepthMm', 5000)
  const accessibleWidthMm = numberParam(params, 'accessibleWidthMm', 4000)
  const accessibleDepthMm = numberParam(params, 'accessibleDepthMm', 5000)
  const frontWalkwayMm = numberParam(params, 'frontWalkwayMm', 1200)
  const offsiteDistanceM = numberParam(params, 'offsiteDistanceM', 0)
  const orientation = String(params.orientation ?? 'perpendicular')
  const offsiteEnabled = Boolean(params.offsiteEnabled)
  const garageStructure = Boolean(params.garageStructure)
  const minimum = parkingStallMinimums(orientation)
  const requiredAccessible = requiredAccessibleParkingSlots(totalStalls)
  const requiredEvSlots = requiredEvParkingSlots(totalStalls)
  const requiredBp220 = requiredBp220ParkingSlots(livingUnits)

  return {
    totalStalls,
    providedStalls: totalStalls,
    basisValue,
    selectedTypology,
    requiredParkingSlots,
    parkingShortfall: Math.max(0, requiredParkingSlots - totalStalls),
    parkingSurplus: Math.max(0, totalStalls - requiredParkingSlots),
    livingUnits,
    accessibleStalls,
    requiredAccessible,
    requiredPwdSlots: requiredAccessible,
    requiredEvSlots,
    requiredBp220,
    bp220ParkingShortfall: Math.max(0, requiredBp220 - totalStalls),
    accessibleCountShortfall: Math.max(0, requiredAccessible - accessibleStalls),
    standardWidthShortfallMm: Math.max(0, minimum.widthMm - stallWidthMm),
    standardDepthShortfallMm: Math.max(0, minimum.depthMm - stallDepthMm),
    accessibleWidthShortfallMm: Math.max(0, 4000 - accessibleWidthMm),
    accessibleDepthShortfallMm: Math.max(0, 5000 - accessibleDepthMm),
    frontWalkwayShortfallMm: Math.max(0, 1200 - frontWalkwayMm),
    aisleSourcePending: true,
    offsiteNeedsReview: offsiteEnabled && offsiteDistanceM > 0,
    garageScopeWarning: garageStructure,
    minimum,
  }
}

const parameters: ParameterDef[] = [
  { key: 'typology', label: 'Building use', type: 'dropdown', default: 'office-condominium-large', options: parkingRequirementTypologies.map((item) => ({ value: item.id, label: item.label })), group: 'Calculator' },
  { key: 'basisValue', label: 'Area / quantity', type: 'slider', min: 1, max: 10000, step: 1, default: 700, group: 'Calculator' },
]

function addBox(inst: GeometryInstruction[], id: string, position: [number, number, number], args: number[], color: string, label?: string, opacity = 1, material: GeometryInstruction['material'] = 'standard') {
  inst.push({ id, type: 'box', position, args, color, label, opacity, transparent: opacity < 1, material })
}

type ParkingGridLayout = {
  count: number
  columns: number
  rows: number
  slotWidth: number
  slotDepth: number
  gap: number
  width: number
  depth: number
}

export function computeParkingGridLayout(count: number, slotWidth: number, slotDepth: number, gap: number): ParkingGridLayout {
  const safeCount = Math.max(0, Math.ceil(count))
  if (safeCount === 0) {
    return { count: 0, columns: 0, rows: 0, slotWidth, slotDepth, gap, width: 0, depth: 0 }
  }

  let best: ParkingGridLayout | null = null
  let bestScore = Number.POSITIVE_INFINITY

  for (let columns = 1; columns <= safeCount; columns += 1) {
    const rows = Math.ceil(safeCount / columns)
    const width = columns * slotWidth + Math.max(0, columns - 1) * gap
    const depth = rows * slotDepth + Math.max(0, rows - 1) * gap
    const aspect = Math.max(width / depth, depth / width)
    const emptyCells = columns * rows - safeCount
    const score = aspect + emptyCells * 0.02

    if (score < bestScore) {
      bestScore = score
      best = { count: safeCount, columns, rows, slotWidth, slotDepth, gap, width, depth }
    }
  }

  return best ?? { count: safeCount, columns: 1, rows: safeCount, slotWidth, slotDepth, gap, width: slotWidth, depth: safeCount * slotDepth + Math.max(0, safeCount - 1) * gap }
}

function geometry(params: ParkingParams): GeometryInstruction[] {
  const checks = evaluateParkingChecks(params)
  const totalRequiredSlots = Math.max(0, checks.requiredParkingSlots)
  if (totalRequiredSlots === 0) return []

  const pwdSlotCount = Math.min(totalRequiredSlots, Math.max(0, checks.requiredAccessible))
  const normalSlotCount = Math.max(0, totalRequiredSlots - pwdSlotCount)
  const standardSlotW = 2.5
  const pwdSlotW = 4
  const slotD = 5
  const gap = 0.32
  const normalLayout = computeParkingGridLayout(normalSlotCount, standardSlotW, slotD, gap)
  const pwdLayout = computeParkingGridLayout(pwdSlotCount, pwdSlotW, slotD, gap)
  const groupGap = normalLayout.count > 0 && pwdLayout.count > 0 ? 4 : 0
  const normalCenterX = -(pwdLayout.width + groupGap) / 2
  const pwdCenterX = (normalLayout.width + groupGap) / 2
  const inst: GeometryInstruction[] = []

  const addSlotGrid = (kind: 'normal' | 'pwd', layout: ParkingGridLayout, centerX: number, color: string) => {
    if (layout.count <= 0) return

    const startX = centerX - layout.width / 2 + layout.slotWidth / 2
    const startZ = -layout.depth / 2 + layout.slotDepth / 2

    for (let i = 0; i < layout.count; i += 1) {
      const col = i % layout.columns
      const row = Math.floor(i / layout.columns)
      const x = startX + col * (layout.slotWidth + layout.gap)
      const z = startZ + row * (layout.slotDepth + layout.gap)
      const prefix = kind === 'pwd' ? 'pwd-parking-slot' : 'parking-slot'
      const label = kind === 'pwd' ? 'PWD required parking slot' : 'Required parking slot'

      addBox(inst, `${prefix}-${i + 1}`, [x, 0.025, z], [layout.slotWidth, 0.05, layout.slotDepth], color, label, kind === 'pwd' ? 1 : 0.78, kind === 'pwd' ? 'basic' : 'standard')
      addBox(inst, `${prefix}-line-${i + 1}`, [x, 0.065, z], [layout.slotWidth + 0.04, 0.012, layout.slotDepth + 0.04], SLOT_LINE_COLOR, undefined, kind === 'pwd' ? 0.26 : 0.1)
    }
  }

  addSlotGrid('normal', normalLayout, normalCenterX, STANDARD_SLOT_COLOR)
  addSlotGrid('pwd', pwdLayout, pwdCenterX, PWD_SLOT_COLOR)

  return inst
}

const violations: ViolationRule[] = [
  { id: 'bp344-accessible-count-shortfall', field: 'accessibleStalls', severity: 'error', sourceRuleId: 'PARK-BP344-ACCESSIBLE-COUNT', sourceCardId: 'PARK-BP344-ACCESSIBLE-COUNT', codeCitation: 'BP 344 2024 Revised IRR Section A.6 Table A.6.1', message: 'Accessible parking slots provided are below the BP 344 Table A.6.1 calculation.', check: (p) => evaluateParkingChecks(p).accessibleCountShortfall > 0, position: () => [0, 1, 0] },
  { id: 'bp344-accessible-stall-width', field: 'accessibleWidthMm', severity: 'error', sourceRuleId: 'PARK-BP344-ACCESSIBLE-GEOM', sourceCardId: 'PARK-BP344-ACCESSIBLE-GEOM', codeCitation: 'BP 344 2024 Revised IRR Section A.6', message: 'Accessible parking slot width is below the 4000 mm source-candidate minimum.', check: (p) => evaluateParkingChecks(p).accessibleWidthShortfallMm > 0, position: () => [2, 1, 0] },
  { id: 'bp344-accessible-stall-depth', field: 'accessibleDepthMm', severity: 'error', sourceRuleId: 'PARK-BP344-ACCESSIBLE-GEOM', sourceCardId: 'PARK-BP344-ACCESSIBLE-GEOM', codeCitation: 'BP 344 2024 Revised IRR Section A.6', message: 'Accessible parking slot length is below the 5000 mm source-candidate minimum.', check: (p) => evaluateParkingChecks(p).accessibleDepthShortfallMm > 0, position: () => [2, 1, -2] },
  { id: 'bp344-front-walkway-width', field: 'frontWalkwayMm', severity: 'error', sourceRuleId: 'PARK-BP344-ACCESSIBLE-GEOM', sourceCardId: 'PARK-BP344-ACCESSIBLE-GEOM', codeCitation: 'BP 344 2024 Revised IRR Section A.6', message: 'Front walkway clear width is below the 1200 mm source-candidate minimum.', check: (p) => evaluateParkingChecks(p).frontWalkwayShortfallMm > 0, position: () => [2, 1, -4] },
  { id: 'pd1096-standard-stall-width', field: 'stallWidthMm', severity: 'error', sourceRuleId: 'PARK-PD1096-STD-STALL', sourceCardId: 'PARK-PD1096-STD-STALL', codeCitation: 'PD 1096 RIRR Rule VIII Section 804 item 4(b)', message: 'Perpendicular/diagonal parking stall width is below the 2.50 m raw-source candidate minimum.', check: (p) => String(p.orientation ?? 'perpendicular') !== 'parallel' && evaluateParkingChecks(p).standardWidthShortfallMm > 0, position: () => [-2, 1, 0] },
  { id: 'pd1096-standard-stall-depth', field: 'stallDepthMm', severity: 'error', sourceRuleId: 'PARK-PD1096-STD-STALL', sourceCardId: 'PARK-PD1096-STD-STALL', codeCitation: 'PD 1096 RIRR Rule VIII Section 804 item 4(b)', message: 'Perpendicular/diagonal parking stall depth is below the 5.00 m raw-source candidate minimum.', check: (p) => String(p.orientation ?? 'perpendicular') !== 'parallel' && evaluateParkingChecks(p).standardDepthShortfallMm > 0, position: () => [-2, 1, -2] },
  { id: 'pd1096-parallel-stall-width', field: 'stallWidthMm', severity: 'error', sourceRuleId: 'PARK-PD1096-PARALLEL', sourceCardId: 'PARK-PD1096-PARALLEL', codeCitation: 'PD 1096 RIRR Rule VIII Section 804 item 4(b)', message: 'Parallel parking stall width is below the 2.15 m raw-source candidate minimum.', check: (p) => String(p.orientation ?? 'perpendicular') === 'parallel' && evaluateParkingChecks(p).standardWidthShortfallMm > 0, position: () => [-2, 1, 0] },
  { id: 'pd1096-parallel-stall-depth', field: 'stallDepthMm', severity: 'error', sourceRuleId: 'PARK-PD1096-PARALLEL', sourceCardId: 'PARK-PD1096-PARALLEL', codeCitation: 'PD 1096 RIRR Rule VIII Section 804 item 4(b)', message: 'Parallel parking stall depth is below the 6.00 m raw-source candidate minimum.', check: (p) => String(p.orientation ?? 'perpendicular') === 'parallel' && evaluateParkingChecks(p).standardDepthShortfallMm > 0, position: () => [-2, 1, -2] },
  { id: 'pd1096-aisle-source-pending', field: 'driveAisleMm', severity: 'warning', sourceRuleId: 'PARK-PD1096-AISLE-90', sourceCardId: 'PARK-PD1096-AISLE-90', codeCitation: 'SOURCE PENDING', message: 'Drive aisle width is shown for visualization only; PD 1096 90-degree aisle value is source-pending and fails closed.', check: () => true, position: () => [0, 1, 2] },
  { id: 'bp220-parking-ratio-shortfall', field: 'totalStalls', severity: 'warning', sourceRuleId: 'PARK-BP220-RATIO', sourceCardId: 'PARK-BP220-RATIO', codeCitation: 'BP 220 Section D.3(g) Parking Requirements', message: 'BP 220 multi-family parking slots are below the 1 slot per 8 living units source-candidate calculation. Keep as REVIEW until SME approval.', check: (p) => evaluateParkingChecks(p).bp220ParkingShortfall > 0, position: () => [0, 1, 4] },
  { id: 'ra9514-garage-scope-warning', field: 'garageStructure', severity: 'info', sourceRuleId: 'PARK-RA9514-GARAGE', sourceCardId: 'PARK-RA9514-GARAGE', codeCitation: 'RA 9514 RIRR parking structures special provision', message: 'Parking-structure fire/life-safety rules may apply; MVP geometry does not encode RA 9514 garage checks.', check: (p) => Boolean(p.garageStructure), position: () => [0, 2, 0] },
]

const annotations: AnnotationDef[] = [
  { id: 'parking-source-gate', label: 'Source-gated QA module', description: 'Compliance wording remains conservative until source cards receive human/SME approval.', codeCitation: 'Source locator workbook', sourceCardId: 'PARK-PD1096-AISLE-90', sourceRuleId: 'PARK-PD1096-AISLE-90', position: () => [0, 2.3, 0] },
  { id: 'bp344-accessible-geometry', label: 'BP 344 candidate: 4000×5000 mm', description: 'Current raw BP 344 candidate uses 4000 mm width and 5000 mm length, not the older 3700 mm scaffold.', codeCitation: 'BP 344 2024 Revised IRR Section A.6', sourceCardId: 'PARK-BP344-ACCESSIBLE-GEOM', sourceRuleId: 'PARK-BP344-ACCESSIBLE-GEOM', position: () => [3, 1.4, -2] },
]

const presets: Preset[] = [
  { id: 'bp344-50-slot-baseline', label: '50 slots: BP344 count baseline', values: { totalStalls: 50, livingUnits: 80, accessibleStalls: 2, stallWidthMm: 2500, stallDepthMm: 5000, accessibleWidthMm: 4000, accessibleDepthMm: 5000, frontWalkwayMm: 1200, driveAisleMm: 6000, orientation: 'perpendicular', offsiteEnabled: false, offsiteDistanceM: 0, garageStructure: false } },
  { id: 'bp344-100-slot-shortfall', label: '100 slots: accessible shortfall demo', values: { totalStalls: 100, livingUnits: 80, accessibleStalls: 2, stallWidthMm: 2500, stallDepthMm: 5000, accessibleWidthMm: 3700, accessibleDepthMm: 5000, frontWalkwayMm: 1000, driveAisleMm: 6000, orientation: 'perpendicular', offsiteEnabled: false, offsiteDistanceM: 0, garageStructure: false } },
  { id: 'bp220-80-unit-shortfall', label: '80 units: BP220 ratio review', values: { totalStalls: 8, livingUnits: 80, accessibleStalls: 1, stallWidthMm: 2500, stallDepthMm: 5000, accessibleWidthMm: 4000, accessibleDepthMm: 5000, frontWalkwayMm: 1200, driveAisleMm: 6000, orientation: 'perpendicular', offsiteEnabled: false, offsiteDistanceM: 0, garageStructure: false } },
]

export const parkingLotRequirementsConfig: ParametricSceneConfig = {
  id: 'parking-lot-requirements',
  title: 'Parking Lot Requirements',
  description: 'Source-gated parking requirement calculator for selected PD 1096 and BP 220 typologies. Advanced dimensions, accessibility, and local overlays remain review-only.',
  subject: 'pd-1096',
  parameters,
  geometry,
  violations,
  annotations,
  presets,
  sourceTruth: {
    sourceRules,
    sourceSha256: 'parking-lot-requirements-source-locator-workbook-2026-05-14',
    sourceGateStatus: 'SOURCE_PENDING',
    canShowSourceBackedCompliance: false,
  },
  camera: {
    position: [-8, 7, 9],
    target: [0, 0, 0],
    fov: 35,
    zoomToFit: { position: [-8, 7, 9], target: [0, 0, 0], fov: 35, zoom: 1 },
    resetPreset: 'perspective',
  },
  contextScenario: 'Calculator-first parking requirement module. Show required parking count for the selected typology and basis while keeping source-pending dimensions, accessibility, provided comparisons, and overlays out of the default legal conclusion.',
  leaQuestionType: 'code compliance',
  supportedPhases: ['guided', 'sandbox'],
  hasChallengeMode: false,
  showHumanScale: false,
  alwaysShowAnnotations: false,
  defaultVisibleAnnotationIds: [],
}
