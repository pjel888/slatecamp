// src/app/dashboard/3d-lab/_config/moduleRegistry.ts
// ─── Module Registry ─────────────────────────────────────────────────────────
// Metadata-only registry for all 3D Lab modules. No runtime scene code here.

import type { ModuleRegistryEntry, TemplateType } from '../_types/templates'

// ─── Subject Areas ───────────────────────────────────────────────────────────

export const SUBJECT_AREAS = [
  { id: 'pd-1096',       label: 'PD 1096 (Building Code)',       count: 6 },
  { id: 'ra-9514',       label: 'RA 9514 (Fire Code)',           count: 4 },
  { id: 'bp-344',        label: 'BP 344 (Accessibility)',        count: 3 },
  { id: 'history',       label: 'History of Architecture',       count: 4 },
  { id: 'nscp',          label: 'NSCP (Structural)',             count: 4 },
  { id: 'npcp',          label: 'NPCP (Plumbing)',               count: 3 },
  { id: 'pec',           label: 'PEC (Electrical)',              count: 3 },
  { id: 'pmec',          label: 'PMEC (Mechanical)',             count: 2 },
  { id: 'materials',     label: 'Building Materials',            count: 3 },
  { id: 'specs',         label: 'Specifications',                count: 2 },
  { id: 'estimating',    label: 'Estimating',                    count: 2 },
  { id: 'prof-practice', label: 'Professional Practice',         count: 2 },
  { id: 'planning',      label: 'Urban Planning & Design',       count: 2 },
] as const satisfies ReadonlyArray<{ id: string; label: string; count: number }>

// ─── Module Registry ─────────────────────────────────────────────────────────

export const MODULE_REGISTRY: ModuleRegistryEntry[] = [
  // ── Priority 1–10 ─────────────────────────────────────────────────────────
  {
    id: 'stairway-configurator',
    title: 'Stairway Configurator',
    templateType: 'parametric',
    subject: 'pd-1096',
    codeRef: 'PD 1096 Rule VIII',
    priority: 1,
    status: 'ready',
    description: 'Configure stair geometry and verify code compliance for rise, run, headroom, and handrails.',
  },
  {
    id: 'fire-travel-distance',
    title: 'Fire Travel Distance',
    templateType: 'floorplan',
    subject: 'ra-9514',
    codeRef: 'RA 9514 Rule 10',
    priority: 2,
    status: 'ready',
    description: 'Visualize maximum travel distances to exits with animated egress paths.',
  },
  {
    id: 'ramp-accessible-toilet',
    title: 'Ramp & Accessible Toilet',
    templateType: 'parametric',
    subject: 'bp-344',
    codeRef: 'BP 344',
    priority: 3,
    status: 'ready',
    description: 'Configure accessible ramp slope and toilet clearances per BP 344.',
  },
  {
    id: 'classical-orders-comparison',
    title: 'Classical Orders Comparison',
    templateType: 'exploded',
    subject: 'history',
    priority: 4,
    status: 'ready',
    description: 'Exploded view comparing Doric, Ionic, and Corinthian column orders.',
  },
  {
    id: 'nbcp-envelope',
    title: 'NBCP Building Envelope',
    templateType: 'parametric',
    subject: 'pd-1096',
    codeRef: 'PD 1096 Rule VII',
    priority: 5,
    status: 'built',
    description: 'Interactive building envelope with FAR, setbacks, BHL, and firewall effects.',
  },
  {
    id: 'structural-load-path',
    title: 'Structural Load Path',
    templateType: 'animated',
    subject: 'nscp',
    codeRef: 'NSCP',
    priority: 6,
    status: 'ready',
    description: 'Animated sequence showing gravity and lateral load paths through a structure.',
  },
  {
    id: 'plumbing-fixture-cutaway',
    title: 'Plumbing Fixture Cutaway',
    templateType: 'cutaway',
    subject: 'npcp',
    codeRef: 'NPCP',
    priority: 7,
    status: 'ready',
    description: 'Cutaway section of plumbing fixtures showing trap, vent, and drain connections.',
  },
  {
    id: 'seismic-parameter-map',
    title: 'Seismic Parameter Map',
    templateType: 'parametric',
    subject: 'nscp',
    codeRef: 'NSCP Chapter 2',
    priority: 8,
    status: 'ready',
    description: 'Interactive seismic zone map with base shear parameter visualization.',
  },
  {
    id: 'bahay-na-bato',
    title: 'Bahay na Bato',
    templateType: 'exploded',
    subject: 'history',
    priority: 9,
    status: 'ready',
    description: 'Exploded assembly of the traditional Filipino stone house showing structural layers.',
  },
  {
    id: 'construction-sequence-foundation',
    title: 'Construction Sequence: Foundation',
    templateType: 'animated',
    subject: 'materials',
    priority: 10,
    status: 'ready',
    description: 'Step-by-step animated construction sequence from excavation to foundation completion.',
  },

  // ── PD 1096 (Building Code) ────────────────────────────────────────────────
  {
    id: 'occupancy-classification',
    title: 'Occupancy Classification',
    templateType: 'parametric',
    subject: 'pd-1096',
    codeRef: 'PD 1096 Rule V',
    status: 'planned',
    description: 'Interactive occupancy type selector showing allowed building uses and mixed occupancy rules.',
  },
  {
    id: 'corridor-width-calculator',
    title: 'Corridor Width Calculator',
    templateType: 'parametric',
    subject: 'pd-1096',
    codeRef: 'PD 1096 Rule VIII',
    status: 'planned',
    description: 'Parametric corridor showing minimum widths based on occupant load.',
  },
  {
    id: 'light-ventilation-openings',
    title: 'Light & Ventilation Openings',
    templateType: 'parametric',
    subject: 'pd-1096',
    codeRef: 'PD 1096 Rule VIII',
    status: 'planned',
    description: 'Room configurator validating window-to-floor area ratios.',
  },
  {
    id: 'parking-layout',
    title: 'Parking Layout',
    templateType: 'floorplan',
    subject: 'pd-1096',
    codeRef: 'PD 1096 Rule VIII',
    status: 'planned',
    description: 'Floor plan with parking stall dimensions and aisle widths.',
  },

  // ── RA 9514 (Fire Code) ────────────────────────────────────────────────────
  {
    id: 'fire-exit-layout',
    title: 'Fire Exit Layout',
    templateType: 'floorplan',
    subject: 'ra-9514',
    codeRef: 'RA 9514 Rule 10',
    status: 'planned',
    description: 'Floor plan showing exit placement, width, and remoteness requirements.',
  },
  {
    id: 'fire-zone-classification',
    title: 'Fire Zone Classification',
    templateType: 'floorplan',
    subject: 'ra-9514',
    codeRef: 'RA 9514 Rule 7',
    status: 'planned',
    description: 'Interactive fire zone map with allowable areas and construction types.',
  },
  {
    id: 'sprinkler-layout',
    title: 'Sprinkler System Layout',
    templateType: 'floorplan',
    subject: 'ra-9514',
    codeRef: 'RA 9514 Rule 11',
    status: 'planned',
    description: 'Sprinkler coverage plan showing spacing, coverage area, and pipe sizing.',
  },

  // ── BP 344 (Accessibility) ─────────────────────────────────────────────────
  {
    id: 'accessible-parking',
    title: 'Accessible Parking',
    templateType: 'floorplan',
    subject: 'bp-344',
    codeRef: 'BP 344',
    status: 'planned',
    description: 'Accessible parking stall layout with access aisle and signage placement.',
  },
  {
    id: 'elevator-dimensions',
    title: 'Accessible Elevator',
    templateType: 'parametric',
    subject: 'bp-344',
    codeRef: 'BP 344',
    status: 'planned',
    description: 'Elevator car dimensions and door clearances per accessibility standards.',
  },

  // ── History of Architecture ────────────────────────────────────────────────
  {
    id: 'gothic-ribbed-vault',
    title: 'Gothic Ribbed Vault',
    templateType: 'exploded',
    subject: 'history',
    status: 'planned',
    description: 'Exploded view of Gothic ribbed vault showing ribs, webbing, and keystone.',
  },
  {
    id: 'bahay-kubo',
    title: 'Bahay Kubo',
    templateType: 'exploded',
    subject: 'history',
    status: 'planned',
    description: 'Exploded assembly of the traditional nipa hut structural system.',
  },

  // ── NSCP (Structural) ─────────────────────────────────────────────────────
  {
    id: 'beam-stress-diagram',
    title: 'Beam Stress Diagram',
    templateType: 'parametric',
    subject: 'nscp',
    codeRef: 'NSCP',
    status: 'planned',
    description: 'Interactive beam showing shear and moment diagrams under various loading.',
  },
  {
    id: 'column-interaction-diagram',
    title: 'Column Interaction Diagram',
    templateType: 'parametric',
    subject: 'nscp',
    codeRef: 'NSCP',
    status: 'planned',
    description: 'P-M interaction diagram for reinforced concrete column design.',
  },

  // ── NPCP (Plumbing) ───────────────────────────────────────────────────────
  {
    id: 'drainage-system-cutaway',
    title: 'Drainage System Cutaway',
    templateType: 'cutaway',
    subject: 'npcp',
    codeRef: 'NPCP',
    status: 'planned',
    description: 'Cutaway of building drainage showing soil, waste, and vent stacks.',
  },
  {
    id: 'water-supply-riser',
    title: 'Water Supply Riser',
    templateType: 'cutaway',
    subject: 'npcp',
    codeRef: 'NPCP',
    status: 'planned',
    description: 'Cutaway of water supply riser system showing pipe sizing and pressure zones.',
  },

  // ── PEC (Electrical) ──────────────────────────────────────────────────────
  {
    id: 'panel-board-layout',
    title: 'Panel Board Layout',
    templateType: 'cutaway',
    subject: 'pec',
    codeRef: 'PEC',
    status: 'planned',
    description: 'Cutaway of electrical panel showing breaker arrangement and wire sizing.',
  },
  {
    id: 'lighting-layout',
    title: 'Lighting Layout',
    templateType: 'floorplan',
    subject: 'pec',
    codeRef: 'PEC',
    status: 'planned',
    description: 'Floor plan showing lighting fixture placement and lux level calculations.',
  },
  {
    id: 'grounding-system',
    title: 'Grounding System',
    templateType: 'cutaway',
    subject: 'pec',
    codeRef: 'PEC',
    status: 'planned',
    description: 'Cutaway showing grounding electrode system and bonding connections.',
  },

  // ── PMEC (Mechanical) ─────────────────────────────────────────────────────
  {
    id: 'hvac-duct-layout',
    title: 'HVAC Duct Layout',
    templateType: 'floorplan',
    subject: 'pmec',
    codeRef: 'PMEC',
    status: 'planned',
    description: 'Duct routing plan showing supply, return, and exhaust duct sizing.',
  },
  {
    id: 'split-ac-cutaway',
    title: 'Split AC Unit Cutaway',
    templateType: 'cutaway',
    subject: 'pmec',
    codeRef: 'PMEC',
    status: 'planned',
    description: 'Cutaway of split-type air conditioning showing refrigerant cycle components.',
  },

  // ── Building Materials ────────────────────────────────────────────────────
  {
    id: 'concrete-mix-proportions',
    title: 'Concrete Mix Proportions',
    templateType: 'parametric',
    subject: 'materials',
    status: 'planned',
    description: 'Interactive concrete mix design showing aggregate, cement, water ratios.',
  },
  {
    id: 'wall-section-assembly',
    title: 'Wall Section Assembly',
    templateType: 'exploded',
    subject: 'materials',
    status: 'planned',
    description: 'Exploded wall section showing layers from exterior finish to interior.',
  },

  // ── Specifications ────────────────────────────────────────────────────────
  {
    id: 'csi-masterformat-explorer',
    title: 'CSI MasterFormat Explorer',
    templateType: 'parametric',
    subject: 'specs',
    status: 'planned',
    description: 'Interactive CSI division explorer with section detail drill-down.',
  },
  {
    id: 'door-schedule-configurator',
    title: 'Door Schedule Configurator',
    templateType: 'parametric',
    subject: 'specs',
    status: 'planned',
    description: 'Door type selector showing hardware sets, fire ratings, and clearances.',
  },

  // ── Estimating ────────────────────────────────────────────────────────────
  {
    id: 'quantity-takeoff-room',
    title: 'Quantity Takeoff: Room',
    templateType: 'parametric',
    subject: 'estimating',
    status: 'planned',
    description: 'Room configurator computing material quantities for walls, floor, and ceiling.',
  },
  {
    id: 'earthwork-volume',
    title: 'Earthwork Volume Calculator',
    templateType: 'parametric',
    subject: 'estimating',
    status: 'planned',
    description: 'Cut-and-fill volume calculator with prismoidal correction.',
  },

  // ── Professional Practice ─────────────────────────────────────────────────
  {
    id: 'project-delivery-methods',
    title: 'Project Delivery Methods',
    templateType: 'animated',
    subject: 'prof-practice',
    status: 'planned',
    description: 'Animated comparison of Design-Bid-Build, Design-Build, and CM-at-Risk timelines.',
  },
  {
    id: 'contract-document-hierarchy',
    title: 'Contract Document Hierarchy',
    templateType: 'exploded',
    subject: 'prof-practice',
    status: 'planned',
    description: 'Exploded view of contract document precedence from agreement to addenda.',
  },

  // ── Urban Planning & Design ───────────────────────────────────────────────
  {
    id: 'zoning-setback-overlay',
    title: 'Zoning Setback Overlay',
    templateType: 'floorplan',
    subject: 'planning',
    status: 'planned',
    description: 'Site plan overlay showing setback lines, easements, and buildable area.',
  },
  {
    id: 'site-circulation-analysis',
    title: 'Site Circulation Analysis',
    templateType: 'floorplan',
    subject: 'planning',
    status: 'planned',
    description: 'Site plan with vehicular and pedestrian circulation paths and conflict points.',
  },
]

// ─── Helper Functions ────────────────────────────────────────────────────────

export function getModuleById(id: string): ModuleRegistryEntry | undefined {
  return MODULE_REGISTRY.find((m) => m.id === id)
}

export function getModulesBySubject(subject: string): ModuleRegistryEntry[] {
  return MODULE_REGISTRY.filter((m) => m.subject === subject)
}

export function getModulesByTemplate(
  templateType: TemplateType
): ModuleRegistryEntry[] {
  return MODULE_REGISTRY.filter((m) => m.templateType === templateType)
}

export function getPriorityModules(): ModuleRegistryEntry[] {
  return MODULE_REGISTRY.filter((m) => m.priority != null).sort(
    (a, b) => (a.priority ?? Infinity) - (b.priority ?? Infinity)
  )
}
