// src/features/3d-lab/config/modules/01-building-code/site-development-controls.ts
// PD 1096 Rules VII & VIII — Site Development Controls (PSO, AMBF, ISA, USA, TOSL, MACA)
// This is a BESPOKE scene (custom Canvas + own store), not a parametric template.
// The config exists for registry/catalog purposes; rendering is handled by _scenes/SiteControls/.
// ─────────────────────────────────────────────────────────────────────────────

import type { ParametricSceneConfig } from '@/features/3d-lab/types/templates'

export const siteDevelopmentControlsConfig: ParametricSceneConfig = {
  id: 'site-development-controls',
  title: 'Site Development Controls',
  description:
    'Interactive 3D lot model for PD 1096 Rules VII & VIII. Visualizes TLA, AMBF, PSO, ISA, USA, TOSL, and MACA as parametric zones. Manipulate lot dimensions and zoning class to see how development controls constrain the building footprint and open-space obligations in real time.',
  subject: 'pd-1096',
  parameters: [],
  geometry: () => [],
  violations: [],
  annotations: [],
  presets: [],
  camera: { position: [18, 12, 22], fov: 45 },
}

