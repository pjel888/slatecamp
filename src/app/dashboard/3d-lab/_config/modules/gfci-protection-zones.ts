// src/app/dashboard/3d-lab/_config/modules/gfci-protection-zones.ts
// GFCI Protection Zones — PEC (Philippine Electrical Code)
// ─────────────────────────────────────────────────────────────────────────────

import type {
  FloorPlanConfig,
  RoomDef,
  PathDef,
  FixtureDef,
  ParameterDef,
  ViolationRule,
  AnnotationDef,
  Preset,
} from '../../_types/templates'

// PEC GFCI Requirements (Ground Fault Circuit Interrupter):
// Required within 1.8m of water sources
// Mandatory: kitchens, bathrooms, garages, outdoor, laundry rooms, pool areas
// Outlet within 1.8m of sink: GFCI protected
// Boat docks, crawl spaces, unfinished basements also required

const ROOMS: RoomDef[] = [
  { id: 'kitchen', label: 'Kitchen (GFCI Required)', bounds: [0, 0, 12, 9], color: '#fef9c3', opacity: 0.55 },
  { id: 'living', label: 'Living Room (Standard)', bounds: [13, 0, 14, 9], color: '#bfdbfe', opacity: 0.4 },
  { id: 'master-bed', label: 'Master Bedroom (Standard)', bounds: [0, 10, 12, 9], color: '#c7d2fe', opacity: 0.4 },
  { id: 'master-bath', label: 'Master Bath (GFCI Required)', bounds: [13, 10, 7, 9], color: '#dbeafe', opacity: 0.55 },
  { id: 'bedroom-2', label: 'Bedroom 2 (Standard)', bounds: [21, 10, 6, 9], color: '#c7d2fe', opacity: 0.4 },
  { id: 'hallway', label: 'Hallway', bounds: [0, 19, 27, 3], color: '#d4d4d8', opacity: 0.35, zone: 'corridor' },
  { id: 'garage', label: 'Garage (GFCI Required)', bounds: [0, 22, 12, 8], color: '#fef3c7', opacity: 0.5 },
  { id: 'laundry', label: 'Laundry Room (GFCI Required)', bounds: [13, 22, 14, 8], color: '#ede9fe', opacity: 0.55 },
]

const PATHS: PathDef[] = [
  {
    id: 'gfci-circuit',
    label: 'GFCI-Protected Circuit',
    points: [[6, 0], [6, 9], [16.5, 9], [19.5, 9], [19.5, 19], [6, 19], [6, 30]],
    color: '#dc2626',
    width: 2,
  },
  {
    id: 'standard-circuit',
    label: 'Standard Circuit (No GFCI)',
    points: [[19.5, 0], [19.5, 9], [24, 9], [24, 19]],
    color: '#6b7280',
    width: 2,
  },
]

const FIXTURES: FixtureDef[] = [
  // Kitchen GFCI outlets
  { id: 'gfci-k1', label: 'GFCI Outlet (Kitchen Counter)', type: 'custom', position: [2, 4.5], color: '#dc2626', description: 'GFCI — kitchen counter within 1.8m of sink', codeCitation: 'PEC Rule 3.15.3' },
  { id: 'gfci-k2', label: 'GFCI Outlet (Kitchen Counter)', type: 'custom', position: [6, 4.5], color: '#dc2626', codeCitation: 'PEC Rule 3.15.3' },
  { id: 'gfci-k3', label: 'GFCI Outlet (Sink)', type: 'custom', position: [10, 4.5], color: '#dc2626', codeCitation: 'PEC Rule 3.15.3' },
  // Living room standard
  { id: 'std-l1', label: 'Standard Outlet (Living)', type: 'custom', position: [16, 4.5], color: '#6b7280', description: 'Standard outlet — not near water source', codeCitation: 'PEC' },
  { id: 'std-l2', label: 'Standard Outlet (Living)', type: 'custom', position: [22, 4.5], color: '#6b7280', codeCitation: 'PEC' },
  // Master bath GFCI
  { id: 'gfci-b1', label: 'GFCI Outlet (Master Bath)', type: 'custom', position: [16.5, 14.5], color: '#dc2626', description: 'GFCI — bathroom outlet within 1.8m of sink/tub', codeCitation: 'PEC Rule 3.15.3' },
  // Bedroom standard
  { id: 'std-bed1', label: 'Standard Outlet (Bedroom)', type: 'custom', position: [6, 14.5], color: '#6b7280', codeCitation: 'PEC' },
  { id: 'std-bed2', label: 'Standard Outlet (Bedroom 2)', type: 'custom', position: [24, 14.5], color: '#6b7280', codeCitation: 'PEC' },
  // Garage GFCI
  { id: 'gfci-g1', label: 'GFCI Outlet (Garage)', type: 'custom', position: [4, 26], color: '#dc2626', description: 'GFCI required throughout garage', codeCitation: 'PEC Rule 3.15.3' },
  { id: 'gfci-g2', label: 'GFCI Outlet (Garage)', type: 'custom', position: [9, 26], color: '#dc2626', codeCitation: 'PEC Rule 3.15.3' },
  // Laundry GFCI
  { id: 'gfci-l1', label: 'GFCI Outlet (Laundry)', type: 'custom', position: [16.5, 26], color: '#dc2626', description: 'GFCI required — laundry / wet area', codeCitation: 'PEC Rule 3.15.3' },
  { id: 'gfci-l2', label: 'GFCI Outlet (Laundry)', type: 'custom', position: [22, 26], color: '#dc2626', codeCitation: 'PEC Rule 3.15.3' },
  { id: 'exit-main', label: 'EXIT', type: 'exit', position: [13.5, 22], color: '#16a34a', codeCitation: 'RA 9514' },
]

const PARAMETERS: ParameterDef[] = [
  {
    key: 'kitchenGfci',
    label: 'Kitchen GFCI Installed',
    type: 'toggle',
    default: true,
    group: 'Zones',
  },
  {
    key: 'bathroomGfci',
    label: 'Bathroom GFCI Installed',
    type: 'toggle',
    default: true,
    group: 'Zones',
  },
  {
    key: 'garageGfci',
    label: 'Garage GFCI Installed',
    type: 'toggle',
    default: true,
    group: 'Zones',
  },
  {
    key: 'laundryGfci',
    label: 'Laundry GFCI Installed',
    type: 'toggle',
    default: true,
    group: 'Zones',
  },
]

const VIOLATIONS: ViolationRule[] = [
  {
    id: 'kitchen-no-gfci',
    field: 'kitchenGfci',
    severity: 'error',
    check: (p) => !p.kitchenGfci,
    message: 'GFCI protection required for all kitchen countertop outlets within 1.8m of sink',
    codeCitation: 'PEC Rule 3.15.3',
    position: () => [6, 1, 4.5],
  },
  {
    id: 'bathroom-no-gfci',
    field: 'bathroomGfci',
    severity: 'error',
    check: (p) => !p.bathroomGfci,
    message: 'GFCI protection required for all bathroom outlets',
    codeCitation: 'PEC Rule 3.15.3',
    position: () => [16.5, 1, 14.5],
  },
  {
    id: 'garage-no-gfci',
    field: 'garageGfci',
    severity: 'error',
    check: (p) => !p.garageGfci,
    message: 'GFCI protection required for all garage outlets',
    codeCitation: 'PEC Rule 3.15.3',
    position: () => [6, 1, 26],
  },
  {
    id: 'laundry-no-gfci',
    field: 'laundryGfci',
    severity: 'error',
    check: (p) => !p.laundryGfci,
    message: 'GFCI protection required for laundry room outlets',
    codeCitation: 'PEC Rule 3.15.3',
    position: () => [19, 1, 26],
  },
]

const ANNOTATIONS: AnnotationDef[] = [
  {
    id: 'ann-gfci-def',
    label: 'GFCI Operation',
    description: 'GFCI trips in ≤25ms when ground fault current exceeds 5mA, preventing electrocution near water',
    codeCitation: 'PEC Rule 3.15.3',
    position: () => [6, 1.5, 4.5],
  },
  {
    id: 'ann-zones',
    label: 'Required GFCI Zones',
    description: 'Kitchen, bathroom, garage, laundry, outdoor, pool/spa areas: all outlets must be GFCI-protected',
    codeCitation: 'PEC Rule 3.15.3',
    position: () => [13.5, 1.5, 14],
  },
  {
    id: 'ann-standard',
    label: 'Non-GFCI Areas',
    description: 'Bedrooms and living rooms do not require GFCI unless within 1.8m of a water source',
    codeCitation: 'PEC',
    position: () => [19.5, 1.5, 4.5],
  },
]

const PRESETS: Preset[] = [
  { label: 'Fully Compliant', values: { kitchenGfci: true, bathroomGfci: true, garageGfci: true, laundryGfci: true } },
  { label: 'Kitchen + Bath Only', values: { kitchenGfci: true, bathroomGfci: true, garageGfci: false, laundryGfci: false } },
  { label: 'Old Construction (None)', values: { kitchenGfci: false, bathroomGfci: false, garageGfci: false, laundryGfci: false } },
  { label: 'Partial Compliance', values: { kitchenGfci: true, bathroomGfci: false, garageGfci: true, laundryGfci: false } },
]

export const gfciProtectionZonesConfig: FloorPlanConfig = {
  id: 'gfci-protection-zones',
  title: 'GFCI Protection Zones',
  description: 'House floor plan highlighting GFCI-required zones (kitchen, bathroom, garage, laundry) with outlet placement per PEC Rule 3.15.3.',
  subject: 'pec',
  rooms: ROOMS,
  paths: PATHS,
  fixtures: FIXTURES,
  parameters: PARAMETERS,
  violations: VIOLATIONS,
  annotations: ANNOTATIONS,
  presets: PRESETS,
  planSize: [27, 30],
  camera: { position: [0, 28, 10], fov: 44 },
  scale: 1,
}
