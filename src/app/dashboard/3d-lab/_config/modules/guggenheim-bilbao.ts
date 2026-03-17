// src/app/dashboard/3d-lab/_config/modules/guggenheim-bilbao.ts
import type { CutawaySectionConfig } from '../../_types/templates'

export const guggenheimBilbaoConfig: CutawaySectionConfig = {
  id: 'guggenheim-bilbao',
  title: 'Guggenheim Bilbao',
  description:
    'Frank Gehry\'s Guggenheim Bilbao (1997) — titanium-clad steel frame, curved gallery volumes, CATIA digital design, and structural steel spine.',
  subject: 'history',
  cutAxis: 'y',
  camera: { position: [4.5, 3.5, 4.5], fov: 42 },
  layers: [
    {
      id: 'rc-podium',
      label: 'RC Podium / Foundation',
      material: 'Reinforced Concrete',
      description: 'Concrete podium containing service areas, loading, and parking. Conventional RC below the dramatic titanium-clad form.',
      depth: 0,
      geometry: { id: 'geo-pod', type: 'box', args: [5, 1.0, 1.5], position: [0, 0.5, 0], color: '#b0b0b0' },
    },
    {
      id: 'structural-steel-spine',
      label: 'Primary Steel Spine',
      material: 'Wide-Flange Steel (W-sections)',
      description: 'Primary structural steel spine — conventional wide-flange sections define the main floor plates. CNC fabrication allowed complex geometries.',
      depth: 0.2,
      geometry: { id: 'geo-spine', type: 'box', args: [0.3, 5.0, 0.3], position: [0, 3.5, 0], color: '#64748b' },
    },
    {
      id: 'curved-steel-frame',
      label: 'Curved Secondary Steel',
      material: 'HSS Steel (Bent Tubes)',
      description: 'Secondary steel members bent and twisted to follow CATIA-generated curved geometry — each member unique, cut by CNC to tolerance of 1mm.',
      depth: 0.35,
      geometry: { id: 'geo-csf', type: 'cylinder', args: [0.05, 0.05, 3.5, 8], position: [1.5, 3.0, 0], rotation: [0.3, 0, 0.5], color: '#475569' },
    },
    {
      id: 'subframe',
      label: 'Stainless Steel Subframe',
      material: '316 Stainless Steel Clips',
      description: 'Stainless steel subframe clips mounted to primary steel — provides adjustment for the titanium panel installation tolerances.',
      depth: 0.5,
      geometry: { id: 'geo-sub', type: 'box', args: [0.04, 0.04, 3.0], position: [2.0, 2.5, 0], color: '#94a3b8' },
    },
    {
      id: 'titanium-panels',
      label: 'Titanium Cladding Panels',
      material: 'Titanium Sheet 0.38mm',
      description: '33,000 m² of 0.38mm titanium sheets — each panel unique, slightly overlapping like fish scales. Golden hue in sunlight, silver in shade.',
      depth: 0.65,
      geometry: { id: 'geo-ti', type: 'box', args: [0.002, 3.0, 0.6], position: [2.05, 2.5, 0], color: '#e2e8f0' },
    },
    {
      id: 'limestone-walls',
      label: 'Limestone Gallery Walls',
      material: 'Limestone (Traditional Volumes)',
      description: 'Rectilinear gallery volumes clad in Spanish limestone — contrasts with titanium-clad curved sculptural elements. Houses permanent collection.',
      depth: 0.8,
      geometry: { id: 'geo-lime', type: 'box', args: [0.05, 4.0, 1.5], position: [-2.2, 2.5, 0], color: '#d4a853' },
    },
    {
      id: 'glazed-atrium',
      label: 'Central Glazed Atrium',
      material: 'Structural Glass + Steel',
      description: 'Central "flower" atrium — curved glass panels on steel armature. 50m tall interior volume connecting galleries.',
      depth: 0.9,
      geometry: { id: 'geo-atrium', type: 'cylinder', args: [1.0, 1.0, 5.0, 16, 1, 1], position: [0, 2.5, 0], color: '#7dd3fc', opacity: 0.3, transparent: true },
    },
  ],
  annotations: [
    {
      id: 'ann-catia',
      label: 'CATIA — Aerospace Software',
      description: 'Gehry used CATIA (originally aerospace software) to resolve complex double-curved geometry — translating physical cardboard models into CNC fabrication data.',
      position: () => [3.0, 4.0, 0.8],
    },
    {
      id: 'ann-titanium',
      label: 'Titanium: 0.38mm Panels',
      description: 'Titanium chosen for durability (100+ year lifespan), color in Bilbao light, and workability into complex curves. Originally Gehry wanted stainless — titanium cheaper and better.',
      position: () => [3.0, 2.5, 0.8],
    },
    {
      id: 'ann-bilbao',
      label: '"Bilbao Effect"',
      description: 'Guggenheim Bilbao revitalized the city and spawned the "Bilbao Effect" — theory that iconic architecture drives economic regeneration. Tourist visits: 4M in first 3 years.',
      position: () => [-3.0, 3.5, 0.8],
    },
  ],
  presets: [
    { label: 'Full Section', values: { cutPosition: 3.0 } },
    { label: 'Podium', values: { cutPosition: 0.8 } },
    { label: 'Steel Frame', values: { cutPosition: 2.5 } },
    { label: 'Titanium Skin', values: { cutPosition: 2.1 } },
  ],
}
