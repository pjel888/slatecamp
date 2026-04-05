// src/features/3d-lab/config/taxonomy.ts
// ─── 16-Category ALE-Aligned Asset Taxonomy ─────────────────────────────────
// Single source of truth for all 3D Lab module categorization.
// Categories mirror ALE board subjects for maximum learning efficiency.

export const ASSET_TAXONOMY = {
  // ── Building Laws & Codes ───────────────────────────────────────────────────
  BUILDING_CODE:   { id: '01', label: 'PD 1096: National Building Code',      icon: 'Buildings',     phase: 1 as const, aleSubject: 'Building Laws & Codes',          description: 'Occupancy, setbacks, FAR, BHL, room dimensions, egress widths, courts, ventilation openings' },
  ACCESSIBILITY:   { id: '02', label: 'BP 344: Accessibility Law',            icon: 'Wheelchair',    phase: 1 as const, aleSubject: 'Building Laws & Codes',          description: 'Ramps, accessible toilets, wheelchair clearances, tactile blocks, signage, counters' },
  FIRE_CODE:       { id: '03', label: 'RA 9514: Fire Code & Life Safety',     icon: 'FireSimple',    phase: 1 as const, aleSubject: 'Building Laws & Codes',          description: 'Fire travel distance, exits, sprinklers, alarms, suppression, fire doors, smoke control, fire ratings' },
  SITE_DEV:        { id: '16', label: 'Site Development & Parking',           icon: 'Car',           phase: 3 as const, aleSubject: 'Building Laws & Codes',          description: 'Parking layouts, parking slot dimensions, carport abutment rules' },

  // ── Structural Engineering ──────────────────────────────────────────────────
  STRUCTURAL:      { id: '04', label: 'NSCP: Structural Engineering',         icon: 'HardHat',       phase: 1 as const, aleSubject: 'Structural Engineering',          description: 'Load paths, seismic design, wind loads, base shear, beam/column analysis, LRFD' },

  // ── Building Utilities ──────────────────────────────────────────────────────
  PLUMBING:        { id: '05', label: 'NPCP: Plumbing Code',                  icon: 'Drop',          phase: 1 as const, aleSubject: 'Building Utilities',              description: 'Water supply, drainage, fixtures, vents, septic, grease traps, storm drainage' },
  ELECTRICAL:      { id: '06', label: 'PEC: Electrical Code',                 icon: 'Lightning',     phase: 2 as const, aleSubject: 'Building Utilities',              description: 'Panel boards, grounding, outlets, lighting, GFCI, emergency power' },
  MECHANICAL:      { id: '07', label: 'PMEC: Mechanical Code',                icon: 'Fan',           phase: 2 as const, aleSubject: 'Building Utilities',              description: 'HVAC ductwork, split AC, air changes, refrigeration cycle, ventilation analysis' },
  VERTICAL:        { id: '08', label: 'Vertical Circulation & Transport',     icon: 'Elevator',      phase: 2 as const, aleSubject: 'Building Utilities',              description: 'Stairs, ramps, elevators, escalators, handrails — all vertical movement systems' },

  // ── Building Materials & Construction ────────────────────────────────────────
  CONSTRUCTION:    { id: '09', label: 'Construction Methods & Sequences',     icon: 'Crane',         phase: 2 as const, aleSubject: 'Building Materials & Construction', description: 'Foundation, column, beam, slab, wall construction sequences, formwork, lintel' },
  MATERIALS:       { id: '10', label: 'Building Materials',                   icon: 'Cube',          phase: 2 as const, aleSubject: 'Building Materials & Construction', description: 'Concrete mix, CHB blocks, bond patterns, rebar, steel sections, lumber, mortar, waterproofing' },

  // ── Architecture (History, Theory, Design) ──────────────────────────────────
  ARCH_HISTORY:    { id: '11', label: 'History of Architecture',              icon: 'Bank',          phase: 1 as const, aleSubject: 'Architecture',                    description: 'Classical orders, structural evolution (Egyptian through Contemporary), world landmark structures' },
  PH_HERITAGE:     { id: '12', label: 'Philippine Vernacular & Heritage',     icon: 'Church',        phase: 1 as const, aleSubject: 'Architecture',                    description: 'Bahay Kubo, Bahay na Bato, colonial churches, Earthquake Baroque, Manila Art Deco, Locsin CCP' },

  // ── Urban Planning & Housing ────────────────────────────────────────────────
  PLANNING:        { id: '13', label: 'Urban Planning, Zoning & Housing',     icon: 'MapTrifold',    phase: 2 as const, aleSubject: 'Urban Planning & Housing',        description: 'Zoning overlays, CLUP, site circulation, subdivision layouts (PD 957/BP 220), housing open space' },

  // ── Professional Practice & Specifications ──────────────────────────────────
  PROF_PRACTICE:   { id: '14', label: 'Professional Practice & Specs',        icon: 'Briefcase',     phase: 3 as const, aleSubject: 'Professional Practice & Specs',    description: 'Project delivery methods, contract documents, CSI MasterFormat, door schedules' },
  ESTIMATING:      { id: '15', label: 'Estimating & Quantity Surveying',      icon: 'Calculator',    phase: 3 as const, aleSubject: 'Professional Practice & Specs',    description: 'Quantity takeoff, earthwork volume calculation' },
} as const

export type CategoryKey = keyof typeof ASSET_TAXONOMY
export type CategoryID = (typeof ASSET_TAXONOMY)[CategoryKey]['id']

/** ALE board subject groupings for the super-category UI layer */
export const ALE_SUBJECTS = [
  { label: 'Building Laws & Codes',          categories: ['BUILDING_CODE', 'ACCESSIBILITY', 'FIRE_CODE', 'SITE_DEV'] as const },
  { label: 'Structural Engineering',          categories: ['STRUCTURAL'] as const },
  { label: 'Building Utilities',              categories: ['PLUMBING', 'ELECTRICAL', 'MECHANICAL', 'VERTICAL'] as const },
  { label: 'Building Materials & Construction', categories: ['CONSTRUCTION', 'MATERIALS'] as const },
  { label: 'Architecture',                    categories: ['ARCH_HISTORY', 'PH_HERITAGE'] as const },
  { label: 'Urban Planning & Housing',        categories: ['PLANNING'] as const },
  { label: 'Professional Practice & Specs',   categories: ['PROF_PRACTICE', 'ESTIMATING'] as const },
] as const

/** Get category definition by its 2-digit ID string (e.g. '01') */
export function getCategoryById(id: string) {
  return Object.values(ASSET_TAXONOMY).find(c => c.id === id)
}

/** Get category key by its 2-digit ID string */
export function getCategoryKeyById(id: string): CategoryKey | undefined {
  const entry = Object.entries(ASSET_TAXONOMY).find(([, v]) => v.id === id)
  return entry?.[0] as CategoryKey | undefined
}

// ─── Phase Labels ───────────────────────────────────────────────────────────

export const PHASE_LABELS = {
  1: 'High-Impact Launch',
  2: 'Technical Deep-Dive',
  3: 'Specialist Release',
} as const

export type LaunchPhase = 1 | 2 | 3
