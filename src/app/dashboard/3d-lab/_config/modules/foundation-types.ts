// src/app/dashboard/3d-lab/_config/modules/foundation-types.ts
// Foundation Types — Construction
import type { ExplodedAssemblyConfig } from '../../_types/templates'

export const foundationTypesConfig: ExplodedAssemblyConfig = {
  id: 'foundation-types',
  title: 'Foundation Types',
  description: 'Side-by-side exploded comparison of five foundation types: isolated (spread) footing, combined footing, strip (continuous) footing, mat (raft) foundation, and pile foundation.',
  subject: 'construction',
  comparisonMode: true,
  parts: [
    // ── ISOLATED / SPREAD FOOTING (leftmost) ─────────────────────────────────
    {
      id: 'ft-iso-footing',
      label: 'Isolated Spread Footing',
      description: 'Single-column square footing. Most common and economical foundation for light to medium column loads on competent soil. Distributes load over enlarged base area.',
      codeCitation: 'NSCP Section 307',
      geometry: { id: 'ft-iso-footing-geo', type: 'box', position: [-1.8, -0.1, 0], args: [0.5, 0.15, 0.5], color: '#94a3b8' },
      explodeOffset: [-1.8, -0.3, 0],
    },
    {
      id: 'ft-iso-pedestal',
      label: 'Column Pedestal',
      description: 'Short concrete pedestal (stub column) connecting column to isolated footing. Provides clearance for rebar lap and grade beam connection.',
      geometry: { id: 'ft-iso-pedestal-geo', type: 'box', position: [-1.8, 0.15, 0], args: [0.18, 0.2, 0.18], color: '#71717a' },
      explodeOffset: [-1.8, 0.1, 0],
    },
    {
      id: 'ft-iso-rebar',
      label: 'Footing Rebar Mat',
      description: 'Two-way rebar mat in isolated footing resisting bending and punching shear. Critical zone: within 1.5×depth from column face.',
      geometry: { id: 'ft-iso-rebar-geo', type: 'box', position: [-1.8, -0.06, 0], args: [0.46, 0.02, 0.46], color: '#dc2626', opacity: 0.6, transparent: true },
      explodeOffset: [-1.8, 0, 0],
    },
    // ── COMBINED FOOTING (second) ────────────────────────────────────────────
    {
      id: 'ft-comb-footing',
      label: 'Combined Footing',
      description: 'Footing supporting two columns. Used when columns are close together or when exterior column cannot extend beyond property line.',
      codeCitation: 'NSCP Section 307',
      geometry: { id: 'ft-comb-footing-geo', type: 'box', position: [-0.9, -0.1, 0], args: [0.7, 0.15, 0.4], color: '#94a3b8' },
      explodeOffset: [-0.9, -0.3, 0],
    },
    {
      id: 'ft-comb-col1',
      label: 'Column 1 (Interior)',
      description: 'Interior column of combined footing. Centroid of footing aligned with resultant of two column loads for uniform bearing.',
      geometry: { id: 'ft-comb-col1-geo', type: 'box', position: [-1.1, 0.15, 0], args: [0.14, 0.2, 0.14], color: '#71717a' },
      explodeOffset: [-1.1, 0.1, 0],
    },
    {
      id: 'ft-comb-col2',
      label: 'Column 2 (Exterior/Edge)',
      description: 'Exterior column at property line. Combined footing allows load to remain within property.',
      geometry: { id: 'ft-comb-col2-geo', type: 'box', position: [-0.7, 0.15, 0], args: [0.14, 0.2, 0.14], color: '#71717a' },
      explodeOffset: [-0.7, 0.1, 0],
    },
    // ── STRIP / CONTINUOUS FOOTING (third) ───────────────────────────────────
    {
      id: 'ft-strip-footing',
      label: 'Strip (Continuous) Footing',
      description: 'Continuous wall footing below load-bearing masonry wall. Depth typically 600–750mm below grade. Width = 2–3× wall thickness.',
      codeCitation: 'NSCP Section 307 / PD 1096',
      geometry: { id: 'ft-strip-footing-geo', type: 'box', position: [0, -0.1, 0], args: [0.25, 0.15, 0.8], color: '#94a3b8' },
      explodeOffset: [0, -0.3, 0],
    },
    {
      id: 'ft-strip-wall',
      label: 'Load-Bearing Wall Above',
      description: 'CHB or concrete wall bearing on strip footing. Wall load is continuous — strip footing distributes it uniformly along its length.',
      geometry: { id: 'ft-strip-wall-geo', type: 'box', position: [0, 0.35, 0], args: [0.15, 0.6, 0.8], color: '#d4d4d8', opacity: 0.6, transparent: true },
      explodeOffset: [0, 0.2, 0],
    },
    {
      id: 'ft-strip-rebar',
      label: 'Strip Footing Longitudinal Bars',
      description: 'Longitudinal bars spanning weak zones; transverse bars resist bending. Minimum 2 top + 2 bottom bars.',
      geometry: { id: 'ft-strip-rebar-geo', type: 'box', position: [0, -0.06, 0], args: [0.02, 0.02, 0.78], color: '#dc2626', opacity: 0.7, transparent: true },
      explodeOffset: [0, 0, 0],
    },
    // ── MAT / RAFT (fourth) ───────────────────────────────────────────────────
    {
      id: 'ft-mat-slab',
      label: 'Mat / Raft Foundation',
      description: 'Continuous reinforced concrete slab under entire building footprint. Used on weak soils to distribute load broadly. Also controls differential settlement.',
      codeCitation: 'NSCP Section 307',
      geometry: { id: 'ft-mat-slab-geo', type: 'box', position: [0.9, -0.15, 0], args: [0.7, 0.2, 0.7], color: '#64748b' },
      explodeOffset: [0.9, -0.3, 0],
    },
    {
      id: 'ft-mat-col1',
      label: 'Column on Mat',
      description: 'Column bearing on mat foundation. No individual footings — all loads go directly into the mat slab.',
      geometry: { id: 'ft-mat-col1-geo', type: 'box', position: [0.72, 0.15, 0.22], args: [0.12, 0.25, 0.12], color: '#71717a' },
      explodeOffset: [0.72, 0.2, 0.22],
    },
    {
      id: 'ft-mat-col2',
      label: 'Column on Mat (2)',
      description: 'Second column on the mat. The mat bridges between columns, providing inverted two-way slab behaviour.',
      geometry: { id: 'ft-mat-col2-geo', type: 'box', position: [1.08, 0.15, -0.22], args: [0.12, 0.25, 0.12], color: '#71717a' },
      explodeOffset: [1.08, 0.2, -0.22],
    },
    // ── PILE FOUNDATION (right) ───────────────────────────────────────────────
    {
      id: 'ft-pile-cap',
      label: 'Pile Cap',
      description: 'Reinforced concrete pile cap distributing column load to group of piles. Minimum 3-pile group for stability against overturning.',
      codeCitation: 'NSCP Section 308',
      geometry: { id: 'ft-pile-cap-geo', type: 'box', position: [1.8, -0.05, 0], args: [0.55, 0.2, 0.55], color: '#94a3b8' },
      explodeOffset: [1.8, -0.1, 0],
    },
    {
      id: 'ft-pile-1',
      label: 'Concrete Pile (250mm sq)',
      description: 'Precast or cast-in-place concrete pile. Driven or bored to firm stratum. Square piles 250–350mm common in Philippines.',
      geometry: { id: 'ft-pile-1-geo', type: 'box', position: [1.63, -0.6, -0.18], args: [0.1, 0.8, 0.1], color: '#71717a' },
      explodeOffset: [1.63, -0.8, -0.3],
    },
    {
      id: 'ft-pile-2',
      label: 'Pile 2',
      description: 'Second pile of the pile group. Pile spacing minimum 3× pile diameter or 750mm centre-to-centre.',
      geometry: { id: 'ft-pile-2-geo', type: 'box', position: [1.8, -0.6, 0.18], args: [0.1, 0.8, 0.1], color: '#71717a' },
      explodeOffset: [1.8, -0.8, 0.3],
    },
    {
      id: 'ft-pile-3',
      label: 'Pile 3 (Third of Group)',
      description: 'Third pile completing minimum 3-pile group for moment stability.',
      geometry: { id: 'ft-pile-3-geo', type: 'box', position: [1.97, -0.6, -0.18], args: [0.1, 0.8, 0.1], color: '#71717a' },
      explodeOffset: [1.97, -0.8, -0.3],
    },
  ],
  camera: { position: [0, 2, 4], fov: 55 },
}
