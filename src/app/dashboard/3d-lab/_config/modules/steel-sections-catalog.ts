// src/app/dashboard/3d-lab/_config/modules/steel-sections-catalog.ts
// Steel Sections Catalog — Construction Materials
import type { ExplodedAssemblyConfig } from '../../_types/templates'

export const steelSectionsCatalogConfig: ExplodedAssemblyConfig = {
  id: 'steel-sections-catalog',
  title: 'Steel Sections Catalog',
  description: 'Side-by-side comparison of Philippine standard structural steel sections: W-shapes (wide flange), C-channels, equal angles, and C-purlins — showing characteristic cross-section geometry.',
  subject: 'materials',
  comparisonMode: true,
  parts: [
    // ── W-SHAPE / WIDE FLANGE (left) ─────────────────────────────────────────
    {
      id: 'ssc-w-web',
      label: 'W-Shape Web',
      description: 'Wide flange (W-shape) web — vertical plate connecting the two flanges. Carries shear load. Slender web allows efficient material use.',
      codeCitation: 'AISC Steel Construction Manual / PSSC',
      geometry: { id: 'ssc-w-web-geo', type: 'box', position: [-1.2, 0, 0], args: [0.015, 0.3, 0.3], color: '#64748b' },
      explodeOffset: [-1.2, 0, 0],
    },
    {
      id: 'ssc-w-flange-top',
      label: 'W-Shape Top Flange',
      description: 'Wide horizontal top flange. Carries compression in positive bending. Width ≈ depth for wide flange (W-section).',
      geometry: { id: 'ssc-w-flange-top-geo', type: 'box', position: [-1.2, 0.155, 0], args: [0.015, 0.015, 0.25], color: '#64748b' },
      explodeOffset: [-1.2, 0.3, 0],
    },
    {
      id: 'ssc-w-flange-bot',
      label: 'W-Shape Bottom Flange',
      description: 'Wide bottom flange — carries tension in positive bending. W-shapes are the most efficient sections for beams and columns.',
      geometry: { id: 'ssc-w-flange-bot-geo', type: 'box', position: [-1.2, -0.155, 0], args: [0.015, 0.015, 0.25], color: '#64748b' },
      explodeOffset: [-1.2, -0.3, 0],
    },
    // ── C-CHANNEL (second) ────────────────────────────────────────────────────
    {
      id: 'ssc-c-web',
      label: 'C-Channel Web',
      description: 'C-channel (standard channel) web. Asymmetric section — shear centre not at centroid. Used for purlins, girts, framing members.',
      codeCitation: 'AISC / PSSC C-Shapes',
      geometry: { id: 'ssc-c-web-geo', type: 'box', position: [-0.6, 0, 0], args: [0.015, 0.25, 0.2], color: '#52525b' },
      explodeOffset: [-0.6, 0, 0],
    },
    {
      id: 'ssc-c-flange-top',
      label: 'C-Channel Top Flange',
      description: 'Top flange of C-channel. Flanges have sloped inner face (standard) or parallel (MC-channel).',
      geometry: { id: 'ssc-c-flange-top-geo', type: 'box', position: [-0.6, 0.125, 0.075], args: [0.015, 0.015, 0.15], color: '#52525b' },
      explodeOffset: [-0.6, 0.25, 0],
    },
    {
      id: 'ssc-c-flange-bot',
      label: 'C-Channel Bottom Flange',
      description: 'Bottom flange of C-channel — same length as top flange.',
      geometry: { id: 'ssc-c-flange-bot-geo', type: 'box', position: [-0.6, -0.125, 0.075], args: [0.015, 0.015, 0.15], color: '#52525b' },
      explodeOffset: [-0.6, -0.25, 0],
    },
    // ── EQUAL ANGLE (third) ──────────────────────────────────────────────────
    {
      id: 'ssc-ang-leg1',
      label: 'Angle Leg 1 (L-Shape)',
      description: 'Equal angle section (L-shape) — both legs same length. Used for bracing, connections, framing. Legs may be 50×50mm to 150×150mm.',
      codeCitation: 'AISC L-Shapes / PSSC',
      geometry: { id: 'ssc-ang-leg1-geo', type: 'box', position: [0, 0.08, 0], args: [0.01, 0.15, 0.15], color: '#a1a1aa' },
      explodeOffset: [0, 0.2, 0],
    },
    {
      id: 'ssc-ang-leg2',
      label: 'Angle Leg 2',
      description: 'Second leg of equal angle, perpendicular to first. Fillet at corner provides stress flow.',
      geometry: { id: 'ssc-ang-leg2-geo', type: 'box', position: [0, -0.075, 0.07], args: [0.01, 0.01, 0.15], color: '#a1a1aa' },
      explodeOffset: [0, -0.15, 0.1],
    },
    {
      id: 'ssc-ang-double',
      label: 'Double Angle (Back-to-Back)',
      description: 'Two angles back-to-back form a T-section used for truss chords and long compression members.',
      geometry: { id: 'ssc-ang-double-geo', type: 'box', position: [0.02, 0.08, 0], args: [0.01, 0.15, 0.15], color: '#71717a' },
      explodeOffset: [0.04, 0.2, 0],
    },
    // ── C-PURLIN (right) ──────────────────────────────────────────────────────
    {
      id: 'ssc-pur-web',
      label: 'C-Purlin Web',
      description: 'Cold-formed C-purlin web. Purlins span between rafters to support roof cladding. Standard Philippine sizes: 75×45, 100×50, 150×65mm.',
      codeCitation: 'AISI S100 / Philippine Steel',
      geometry: { id: 'ssc-pur-web-geo', type: 'box', position: [0.6, 0, 0], args: [0.012, 0.15, 0.8], color: '#94a3b8' },
      explodeOffset: [0.6, 0, 0],
    },
    {
      id: 'ssc-pur-flange-top',
      label: 'C-Purlin Top Flange',
      description: 'Cold-formed top flange of C-purlin. Thinner gauge than hot-rolled C-channels (typically 1.5–3.0mm).',
      geometry: { id: 'ssc-pur-flange-top-geo', type: 'box', position: [0.6, 0.08, 0.05], args: [0.012, 0.012, 0.7], color: '#94a3b8' },
      explodeOffset: [0.6, 0.2, 0],
    },
    {
      id: 'ssc-pur-flange-bot',
      label: 'C-Purlin Bottom Flange',
      description: 'Cold-formed bottom flange. Purlins often used back-to-back or with Z-purlins for continuous lap splice at rafters.',
      geometry: { id: 'ssc-pur-flange-bot-geo', type: 'box', position: [0.6, -0.08, 0.05], args: [0.012, 0.012, 0.7], color: '#94a3b8' },
      explodeOffset: [0.6, -0.2, 0],
    },
    {
      id: 'ssc-pur-lip',
      label: 'C-Purlin Stiffening Lip',
      description: 'Return lip at flange edge — stiffens flange against local buckling. Distinguishes lipped C-purlin from plain C-channel.',
      geometry: { id: 'ssc-pur-lip-geo', type: 'box', position: [0.615, 0.088, 0.05], args: [0.012, 0.025, 0.7], color: '#71717a' },
      explodeOffset: [0.65, 0.2, 0],
    },
  ],
  camera: { position: [0, 2, 3], fov: 50 },
}
