// src/app/dashboard/3d-lab/_config/modules/fire-detection-layout.ts
// Fire Detection Layout — RA 9514 (Fire Code of the Philippines)
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
} from '../../../_types/templates'

// RA 9514 / NFPA 72 Detector requirements:
// Smoke detector: max 84 sqm coverage, max 9.1m spacing
// Heat detector: max 46.5 sqm coverage, max 6.1m spacing
// Detectors must be within 4.5m of any wall

const ROOMS: RoomDef[] = [
  { id: 'open-floor', label: 'Open Office Floor', bounds: [0, 0, 22, 14], color: '#bfdbfe', opacity: 0.45 },
  { id: 'conference-a', label: 'Conference Room A', bounds: [0, 15, 10, 6], color: '#c7d2fe', opacity: 0.5 },
  { id: 'conference-b', label: 'Conference Room B', bounds: [11, 15, 11, 6], color: '#c7d2fe', opacity: 0.5 },
  { id: 'corridor', label: 'Egress Corridor', bounds: [0, 21, 22, 3], color: '#d4d4d8', opacity: 0.35, zone: 'corridor' },
  { id: 'kitchen', label: 'Pantry / Kitchen', bounds: [0, 24, 8, 4], color: '#fef9c3', opacity: 0.5 },
  { id: 'server', label: 'Server Room', bounds: [9, 24, 13, 4], color: '#fee2e2', opacity: 0.5 },
]

const PATHS: PathDef[] = [
  {
    id: 'detection-loop-1',
    label: 'Detection Circuit Loop 1',
    points: [[1, 1], [21, 1], [21, 13], [1, 13], [1, 1]],
    color: '#D4951A',
    width: 2,
  },
  {
    id: 'detection-loop-2',
    label: 'Detection Circuit Loop 2',
    points: [[1, 15], [1, 28], [21, 28], [21, 15]],
    color: '#D4951A',
    width: 2,
  },
]

const FIXTURES: FixtureDef[] = [
  // Open office smoke detectors (9.1m grid)
  { id: 'sd-1', label: 'Smoke Detector', type: 'custom', position: [3.5, 3.5], color: '#D4951A', description: 'Coverage: 84 sqm max', codeCitation: 'RA 9514 / NFPA 72' },
  { id: 'sd-2', label: 'Smoke Detector', type: 'custom', position: [11, 3.5], color: '#D4951A', codeCitation: 'RA 9514 / NFPA 72' },
  { id: 'sd-3', label: 'Smoke Detector', type: 'custom', position: [18.5, 3.5], color: '#D4951A', codeCitation: 'RA 9514 / NFPA 72' },
  { id: 'sd-4', label: 'Smoke Detector', type: 'custom', position: [3.5, 10.5], color: '#D4951A', codeCitation: 'RA 9514 / NFPA 72' },
  { id: 'sd-5', label: 'Smoke Detector', type: 'custom', position: [11, 10.5], color: '#D4951A', codeCitation: 'RA 9514 / NFPA 72' },
  { id: 'sd-6', label: 'Smoke Detector', type: 'custom', position: [18.5, 10.5], color: '#D4951A', codeCitation: 'RA 9514 / NFPA 72' },
  // Conference rooms
  { id: 'sd-7', label: 'Smoke Detector', type: 'custom', position: [5, 18], color: '#D4951A', codeCitation: 'RA 9514 / NFPA 72' },
  { id: 'sd-8', label: 'Smoke Detector', type: 'custom', position: [16.5, 18], color: '#D4951A', codeCitation: 'RA 9514 / NFPA 72' },
  // Corridor
  { id: 'sd-9', label: 'Smoke Detector', type: 'custom', position: [6, 22.5], color: '#D4951A', codeCitation: 'RA 9514 / NFPA 72' },
  { id: 'sd-10', label: 'Smoke Detector', type: 'custom', position: [16, 22.5], color: '#D4951A', codeCitation: 'RA 9514 / NFPA 72' },
  // Kitchen — heat detector (not smoke due to cooking fumes)
  { id: 'hd-1', label: 'Heat Detector (Kitchen)', type: 'custom', position: [4, 26], color: '#D64545', description: 'Heat detector (not smoke) in kitchen areas', codeCitation: 'RA 9514 / NFPA 72' },
  // Server room — very early warning
  { id: 'vsd-1', label: 'VESDA / Early Warning (Server)', type: 'custom', position: [15.5, 26], color: '#7c3aed', description: 'Very Early Smoke Detection Apparatus', codeCitation: 'RA 9514 / NFPA 72' },
  { id: 'exit-main', label: 'EXIT', type: 'exit', position: [11, 21], color: '#2D9F6F', codeCitation: 'RA 9514' },
]

const PARAMETERS: ParameterDef[] = [
  {
    key: 'detectorType',
    label: 'Primary Detector Type',
    type: 'dropdown',
    default: 'smoke',
    options: [
      { value: 'smoke', label: 'Smoke Detector (Ionization/Photoelectric)' },
      { value: 'heat', label: 'Heat Detector (Fixed/Rate-of-Rise)' },
      { value: 'combo', label: 'Combination Smoke + Heat' },
    ],
    group: 'Detector',
  },
  {
    key: 'detectorSpacing',
    label: 'Detector Spacing',
    type: 'slider',
    min: 3,
    max: 12,
    step: 0.5,
    default: 9.1,
    unit: 'm',
    group: 'Layout',
  },
  {
    key: 'addressable',
    label: 'Addressable System',
    type: 'toggle',
    default: true,
    group: 'System',
  },
]

const VIOLATIONS: ViolationRule[] = [
  {
    id: 'spacing-exceeded',
    field: 'detectorSpacing',
    severity: 'error',
    check: (p) => p.detectorType === 'smoke' && Number(p.detectorSpacing) > 9.1,
    message: 'Smoke detector spacing exceeds 9.1m maximum per RA 9514 / NFPA 72',
    codeCitation: 'RA 9514 / NFPA 72',
    position: () => [11, 1, 7],
  },
  {
    id: 'heat-spacing-exceeded',
    field: 'detectorSpacing',
    severity: 'error',
    check: (p) => p.detectorType === 'heat' && Number(p.detectorSpacing) > 6.1,
    message: 'Heat detector spacing exceeds 6.1m maximum',
    codeCitation: 'RA 9514 / NFPA 72',
    position: () => [11, 1, 7],
  },
  {
    id: 'coverage-exceeded',
    field: 'detectorSpacing',
    severity: 'warning',
    check: (p) => Number(p.detectorSpacing) > 8,
    message: 'Spacing approaching maximum; verify coverage in irregular room shapes',
    codeCitation: 'NFPA 72',
    position: () => [11, 1, 3.5],
  },
]

const ANNOTATIONS: AnnotationDef[] = [
  {
    id: 'ann-coverage',
    label: 'Detector Coverage Area',
    description: 'Smoke detectors cover max 84 sqm (9.1m grid). Coverage circles should overlap at walls.',
    codeCitation: 'RA 9514 / NFPA 72',
    position: () => [11, 1.5, 7],
  },
  {
    id: 'ann-kitchen-heat',
    label: 'Kitchen: Heat Not Smoke',
    description: 'Smoke detectors not permitted in kitchens; use heat detectors to avoid nuisance trips',
    codeCitation: 'NFPA 72',
    position: () => [4, 1.5, 26],
  },
  {
    id: 'ann-facp',
    label: 'FACP Location',
    description: 'Fire Alarm Control Panel (FACP) at building entrance; accessible to fire brigade',
    codeCitation: 'RA 9514',
    position: () => [11, 1.5, 22],
  },
]

const PRESETS: Preset[] = [
  { label: 'Standard Smoke (9.1m)', values: { detectorType: 'smoke', detectorSpacing: 9.1, addressable: true } },
  { label: 'Heat Detectors (6.1m)', values: { detectorType: 'heat', detectorSpacing: 6.1, addressable: true } },
  { label: 'Dense Combo Layout', values: { detectorType: 'combo', detectorSpacing: 6.0, addressable: true } },
  { label: 'Violation Demo', values: { detectorType: 'smoke', detectorSpacing: 11.0, addressable: false } },
]

export const fireDetectionLayoutConfig: FloorPlanConfig = {
  id: 'fire-detection-layout',
  title: 'Fire Detection Layout',
  description: 'Floor plan showing smoke and heat detector placement, coverage areas, and spacing compliance per RA 9514 and NFPA 72.',
  subject: 'ra-9514',
  rooms: ROOMS,
  paths: PATHS,
  fixtures: FIXTURES,
  parameters: PARAMETERS,
  violations: VIOLATIONS,
  annotations: ANNOTATIONS,
  presets: PRESETS,
  planSize: [22, 28],
  camera: { position: [0, 26, 10], fov: 42 },
  scale: 1,
}
