// src/app/dashboard/3d-lab/_config/modules/tactile-block-types.ts
// Tactile Block Types — BP 344 Accessibility
import type { ExplodedAssemblyConfig } from '../../_types/templates'

// Each block is 300×300mm nominal. Shown at 1:10 scale = 0.3 units.

export const tactileBlockTypesConfig: ExplodedAssemblyConfig = {
  id: 'tactile-block-types',
  title: 'Tactile Block Types',
  description: 'Side-by-side comparison of the three BP 344 tactile paving block types: Directional (parallel bars), Warning (5×5 dome grid), and Positional (staggered domes) — each 300×300mm.',
  subject: 'bp-344',
  comparisonMode: true,
  parts: [
    // ── DIRECTIONAL BLOCK (left) ─────────────────────────────────────────────
    {
      id: 'tbt-dir-base',
      label: 'Directional Block — Base',
      description: 'Directional (guidance) block 300×300mm. Indicates path of travel. At least 4 parallel raised bars running in direction of travel.',
      codeCitation: 'BP 344 IRR Section 2.01',
      geometry: { id: 'tbt-dir-base-geo', type: 'box', position: [-0.65, 0, 0], args: [0.3, 0.04, 0.3], color: '#D4951A' },
      explodeOffset: [-0.65, 0, 0],
    },
    {
      id: 'tbt-dir-bar-1',
      label: 'Directional Bar 1 (34mm raised)',
      description: 'Raised bar 34mm wide × 4mm high running full block length. 5 bars at 40mm centres on 300mm block.',
      codeCitation: 'BP 344 IRR Section 2.01',
      geometry: { id: 'tbt-dir-bar-1-geo', type: 'box', position: [-0.73, 0.02, 0], args: [0.034, 0.004, 0.3], color: '#D4951A' },
      explodeOffset: [-0.73, 0.1, 0],
    },
    {
      id: 'tbt-dir-bar-2',
      label: 'Directional Bar 2',
      description: 'Second parallel directional bar.',
      geometry: { id: 'tbt-dir-bar-2-geo', type: 'box', position: [-0.69, 0.02, 0], args: [0.034, 0.004, 0.3], color: '#D4951A' },
      explodeOffset: [-0.69, 0.1, 0],
    },
    {
      id: 'tbt-dir-bar-3',
      label: 'Directional Bar 3',
      description: 'Centre bar of the directional block.',
      geometry: { id: 'tbt-dir-bar-3-geo', type: 'box', position: [-0.65, 0.02, 0], args: [0.034, 0.004, 0.3], color: '#D4951A' },
      explodeOffset: [-0.65, 0.1, 0],
    },
    {
      id: 'tbt-dir-bar-4',
      label: 'Directional Bar 4',
      description: 'Fourth parallel bar.',
      geometry: { id: 'tbt-dir-bar-4-geo', type: 'box', position: [-0.61, 0.02, 0], args: [0.034, 0.004, 0.3], color: '#D4951A' },
      explodeOffset: [-0.61, 0.1, 0],
    },
    {
      id: 'tbt-dir-bar-5',
      label: 'Directional Bar 5',
      description: 'Fifth parallel bar completing the directional block pattern.',
      geometry: { id: 'tbt-dir-bar-5-geo', type: 'box', position: [-0.57, 0.02, 0], args: [0.034, 0.004, 0.3], color: '#D4951A' },
      explodeOffset: [-0.57, 0.1, 0],
    },
    // ── WARNING BLOCK (centre) ───────────────────────────────────────────────
    {
      id: 'tbt-warn-base',
      label: 'Warning Block — Base',
      description: 'Warning (attention) block 300×300mm. 5×5 grid of 25 truncated domes (35mm dia) indicating hazard ahead: kerb drop, stair head, platform edge.',
      codeCitation: 'BP 344 IRR Section 2.01',
      geometry: { id: 'tbt-warn-base-geo', type: 'box', position: [0, 0, 0], args: [0.3, 0.04, 0.3], color: '#ef4444' },
      explodeOffset: [0, 0, 0],
    },
    {
      id: 'tbt-warn-dome-1',
      label: 'Warning Dome Row A',
      description: '5 truncated domes (35mm dia) in first row at 60mm centres. Raised 5mm above block surface.',
      codeCitation: 'BP 344 IRR Section 2.01',
      geometry: { id: 'tbt-warn-dome-1-geo', type: 'sphere', position: [0, 0.025, -0.1], args: [0.017, 8, 6], color: '#D64545' },
      explodeOffset: [0, 0.15, 0],
    },
    {
      id: 'tbt-warn-dome-2',
      label: 'Warning Dome Row B',
      description: 'Second row of 5 truncated domes in the 5×5 grid pattern.',
      geometry: { id: 'tbt-warn-dome-2-geo', type: 'sphere', position: [0, 0.025, -0.05], args: [0.017, 8, 6], color: '#D64545' },
      explodeOffset: [0, 0.15, 0],
    },
    {
      id: 'tbt-warn-dome-centre',
      label: 'Warning Dome Row C (Centre)',
      description: 'Centre row of the 5×5 warning dome grid.',
      geometry: { id: 'tbt-warn-dome-centre-geo', type: 'sphere', position: [0, 0.025, 0], args: [0.017, 8, 6], color: '#D64545' },
      explodeOffset: [0, 0.15, 0],
    },
    // ── POSITIONAL BLOCK (right) ─────────────────────────────────────────────
    {
      id: 'tbt-pos-base',
      label: 'Positional Block — Base',
      description: 'Positional block 300×300mm. 25 staggered domes (23mm dia) in offset rows indicating a decision point or junction.',
      codeCitation: 'BP 344 IRR Section 2.01',
      geometry: { id: 'tbt-pos-base-geo', type: 'box', position: [0.65, 0, 0], args: [0.3, 0.04, 0.3], color: '#2D9F6F' },
      explodeOffset: [0.65, 0, 0],
    },
    {
      id: 'tbt-pos-dome-a',
      label: 'Positional Dome Row A (23mm)',
      description: 'Staggered dome row — smaller 23mm diameter domes offset from adjacent rows. Used at corners, junctions, transit stops.',
      codeCitation: 'BP 344 IRR Section 2.01',
      geometry: { id: 'tbt-pos-dome-a-geo', type: 'sphere', position: [0.65, 0.025, -0.08], args: [0.011, 8, 6], color: '#15803d' },
      explodeOffset: [0.65, 0.15, 0],
    },
    {
      id: 'tbt-pos-dome-b',
      label: 'Positional Dome Row B',
      description: 'Second staggered row offset by half-pitch. Creates distinctive texture differentiating positional from warning blocks.',
      geometry: { id: 'tbt-pos-dome-b-geo', type: 'sphere', position: [0.65, 0.025, 0], args: [0.011, 8, 6], color: '#15803d' },
      explodeOffset: [0.65, 0.15, 0],
    },
    {
      id: 'tbt-pos-dome-c',
      label: 'Positional Dome Row C',
      description: 'Third staggered dome row completing the positional block surface.',
      geometry: { id: 'tbt-pos-dome-c-geo', type: 'sphere', position: [0.65, 0.025, 0.08], args: [0.011, 8, 6], color: '#15803d' },
      explodeOffset: [0.65, 0.15, 0],
    },
  ],
  camera: { position: [0, 2.5, 2.5], fov: 50 },
}
