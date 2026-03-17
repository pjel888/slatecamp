// src/app/dashboard/3d-lab/_config/modules/formwork-assembly.ts
// Formwork Assembly — Construction (Slab Formwork)
import type { ExplodedAssemblyConfig } from '../../_types/templates'

function yOff(v: number): [number, number, number] { return [0, v, 0] }

export const formworkAssemblyConfig: ExplodedAssemblyConfig = {
  id: 'formwork-assembly',
  title: 'Slab Formwork Assembly',
  description: 'Exploded assembly of typical elevated slab formwork showing: formply deck, primary and secondary timber stringers, adjustable steel props (shores), base plates, and u-head forks. Per DPWH standards.',
  subject: 'construction',
  parts: [
    {
      id: 'fw-concrete-slab',
      label: 'Concrete Slab (Poured)',
      description: 'Fresh concrete being poured — formwork must support wet concrete pressure (24 kN/m³) plus construction live load (2.4 kN/m²).',
      codeCitation: 'NSCP Section 602 / ACI 347',
      geometry: { id: 'fw-concrete-slab-geo', type: 'box', position: [0, 0.61, 0], args: [1.2, 0.15, 0.8], color: '#94a3b8', opacity: 0.7, transparent: true },
      explodeOffset: yOff(0.5),
    },
    {
      id: 'fw-formply',
      label: 'Formply Deck (18mm)',
      description: 'Phenolic-coated plywood (formply) 18mm thick — forms the soffit surface of the slab. Typical reuse: 10–20 pours. Sheet size 1220×2440mm.',
      codeCitation: 'DPWH Blue Book / PNS 196',
      geometry: { id: 'fw-formply-geo', type: 'box', position: [0, 0.53, 0], args: [1.2, 0.018, 0.8], color: '#ca8a04' },
      explodeOffset: yOff(0.3),
    },
    {
      id: 'fw-secondary-joist-1',
      label: 'Secondary Joist (50×100mm)',
      description: 'Secondary timber joist (50×100mm) spanning parallel at 300–400mm O.C., directly under formply. Also called "joists" or "ledgers".',
      geometry: { id: 'fw-secondary-joist-1-geo', type: 'box', position: [-0.3, 0.46, 0], args: [0.05, 0.1, 0.8], color: '#b45309' },
      explodeOffset: [-0.4, 0.15, 0],
    },
    {
      id: 'fw-secondary-joist-2',
      label: 'Secondary Joist (50×100mm) 2',
      description: 'Second secondary joist — same spacing. Carries deck load to primary stringers perpendicular below.',
      geometry: { id: 'fw-secondary-joist-2-geo', type: 'box', position: [0.3, 0.46, 0], args: [0.05, 0.1, 0.8], color: '#b45309' },
      explodeOffset: [0.4, 0.15, 0],
    },
    {
      id: 'fw-primary-stringer',
      label: 'Primary Stringer (100×150mm)',
      description: 'Primary timber stringer (100×150mm) spanning perpendicular to secondary joists, sitting in the U-head fork. Transfers load to props. Spans typically 1.2–1.5m between props.',
      geometry: { id: 'fw-primary-stringer-geo', type: 'box', position: [0, 0.37, -0.25], args: [1.2, 0.15, 0.1], color: '#92400e' },
      explodeOffset: yOff(0),
    },
    {
      id: 'fw-u-head',
      label: 'U-Head Fork (Prop Head)',
      description: 'U-shaped steel fork (u-head) welded to top of adjustable prop — cradles the primary stringer. Allows fast placement without nailing.',
      codeCitation: 'BS EN 1065 / DPWH Spec',
      geometry: { id: 'fw-u-head-geo', type: 'box', position: [0, 0.29, -0.25], args: [0.15, 0.05, 0.13], color: '#71717a' },
      explodeOffset: [0, -0.1, -0.25],
    },
    {
      id: 'fw-prop-outer',
      label: 'Outer Prop Tube (Adjustable Shore)',
      description: 'Outer tube of adjustable steel prop. Extension locked by steel pin through hole array. Prop capacity: 1.5–3.0 tonnes depending on extension.',
      geometry: { id: 'fw-prop-outer-geo', type: 'cylinder', position: [0, 0.05, -0.25], args: [0.025, 0.025, 0.5, 8], color: '#64748b' },
      explodeOffset: [0, -0.3, -0.25],
    },
    {
      id: 'fw-prop-inner',
      label: 'Inner Extension Tube',
      description: 'Inner telescoping tube of prop — slides inside outer tube and is locked with pin for height adjustment. Allows 300–500mm adjustment range.',
      geometry: { id: 'fw-prop-inner-geo', type: 'cylinder', position: [0, -0.15, -0.25], args: [0.018, 0.018, 0.28, 8], color: '#52525b' },
      explodeOffset: [0, -0.5, -0.25],
    },
    {
      id: 'fw-base-plate',
      label: 'Base Plate (150×150mm)',
      description: 'Steel base plate with central nut — distributes prop load to timber sole plate below. Minimum 150×150×5mm plate. Adjustable nut allows final levelling.',
      geometry: { id: 'fw-base-plate-geo', type: 'box', position: [0, -0.32, -0.25], args: [0.15, 0.015, 0.15], color: '#71717a' },
      explodeOffset: [0, -0.7, -0.25],
    },
    {
      id: 'fw-sole-plate',
      label: 'Sole Plate (Timber)',
      description: 'Timber sole plate on slab below, distributing prop reaction over a larger area of existing concrete. Min 50×150mm plank. Prevents point loading and slab punching.',
      geometry: { id: 'fw-sole-plate-geo', type: 'box', position: [0, -0.36, -0.25], args: [0.6, 0.05, 0.15], color: '#D4951A' },
      explodeOffset: [0, -0.9, -0.25],
    },
    {
      id: 'fw-tie-wire',
      label: 'Tie Wire / Lateral Bracing',
      description: '#16 gauge tie wire or steel tube X-bracing between adjacent props. Prevents prop buckling and lateral movement. Required when prop height exceeds 3× least dimension.',
      codeCitation: 'ACI 347 / DPWH Blue Book',
      geometry: { id: 'fw-tie-wire-geo', type: 'cylinder', position: [0.3, 0.05, -0.25], rotation: [0, 0, 0.35], args: [0.005, 0.005, 0.6, 6], color: '#a1a1aa' },
      explodeOffset: [0.5, -0.2, -0.2],
    },
  ],
  camera: { position: [2, 2, 2], fov: 50 },
}
