// src/app/dashboard/3d-lab/_config/modules/wall-types-comparison.ts
import type { CutawaySectionConfig } from '../../_types/templates'

export const wallTypesComparisonConfig: CutawaySectionConfig = {
  id: 'wall-types-comparison',
  title: 'Wall Types Comparison',
  description:
    'Cross-section comparing CHB solid, cavity wall, veneer, curtain wall, and drywall construction — thicknesses, materials, and applications.',
  subject: 'construction',
  cutAxis: 'y',
  camera: { position: [6, 3, 6], fov: 42 },
  layers: [
    {
      id: 'chb-solid',
      label: 'Solid CHB Wall (150mm)',
      material: 'CHB 150mm + Plaster Both Sides',
      description: 'Standard solid CHB 150mm wall — most common Philippine residential and commercial construction. Total thickness with plaster: ~175mm. 1-hour fire rating.',
      depth: 0,
      geometry: { id: 'geo-chb', type: 'box', args: [0.15, 3.0, 1.0], position: [-4.0, 1.5, 0], color: '#d6d3d1' },
    },
    {
      id: 'chb-plaster',
      label: 'CHB Plaster (12mm each side)',
      material: 'Portland Cement Plaster',
      description: '12–16mm cement plaster each side — scratch coat + finish coat. Total wall: 150mm CHB + 24–32mm plaster = 174–182mm.',
      depth: 0.1,
      geometry: { id: 'geo-chbplaster', type: 'box', args: [0.012, 3.0, 1.0], position: [-3.906, 1.5, 0], color: '#e5e7eb' },
    },
    {
      id: 'cavity-wall',
      label: 'Cavity Wall (2 wythes + 50mm air)',
      material: 'Two CHB Wythes with Cavity',
      description: 'Cavity wall — two 100mm CHB wythes with 50mm air cavity (total 250mm). Cavity breaks thermal bridge and prevents moisture transfer. Wall ties connect wythes.',
      depth: 0.25,
      geometry: { id: 'geo-cav', type: 'box', args: [0.25, 3.0, 1.0], position: [-2.0, 1.5, 0], color: '#b0b0b0', opacity: 0.8, transparent: true },
    },
    {
      id: 'cavity-insulation',
      label: 'Cavity Insulation (Optional)',
      material: 'Rigid Foam / Mineral Wool',
      description: 'Optional insulation filling cavity — dramatically improves thermal performance in air-conditioned spaces. R-value 1.5–3.5 depending on type.',
      depth: 0.35,
      geometry: { id: 'geo-cavin', type: 'box', args: [0.05, 3.0, 1.0], position: [-1.975, 1.5, 0], color: '#fbbf24' },
    },
    {
      id: 'veneer-wall',
      label: 'Brick Veneer on RC Frame',
      material: 'Brick Veneer + Air Space + RC',
      description: 'Brick veneer — single wythe decorative brick tied to RC structural frame. 25mm air space behind. Non-structural — brick carries only self-weight.',
      depth: 0.5,
      geometry: { id: 'geo-veneer', type: 'box', args: [0.1, 3.0, 1.0], position: [0, 1.5, 0], color: '#b45309' },
    },
    {
      id: 'curtain-wall',
      label: 'Curtain Wall (Aluminium + Glass)',
      material: 'Aluminium Mullion + IGU',
      description: 'Curtain wall — aluminium frame with insulating glass unit (IGU). Non-structural, hung from floor slabs. Allows full-height glazing. Thermally broken frames minimize condensation.',
      depth: 0.65,
      geometry: { id: 'geo-cw', type: 'box', args: [0.06, 3.0, 1.0], position: [2.0, 1.5, 0], color: '#7dd3fc', opacity: 0.8, transparent: true },
    },
    {
      id: 'drywall',
      label: 'Drywall / Gypsum Partition',
      material: 'Gypsum Board on Metal Stud',
      description: 'Metal stud + gypsum board partition — 65–90mm studs, 12mm gypsum each side. Lightweight, fast construction, easy services integration. Interior non-loadbearing only.',
      depth: 0.8,
      geometry: { id: 'geo-dry', type: 'box', args: [0.09, 3.0, 1.0], position: [4.0, 1.5, 0], color: '#f1f5f9' },
    },
  ],
  annotations: [
    {
      id: 'ann-chb',
      label: 'CHB: Most Common PH',
      description: 'CHB 150mm is the standard Philippine wall — economical, fire-rated, available nationwide. Poor thermal performance without insulation.',
      position: () => [-4.0, 3.5, 0.6],
    },
    {
      id: 'ann-cavity',
      label: 'Cavity: Best Moisture Control',
      description: 'Cavity wall breaks the path for moisture migration — critical in typhoon-prone areas. Cavity must drain at base through weep holes.',
      position: () => [-2.0, 3.5, 0.6],
    },
    {
      id: 'ann-curtain',
      label: 'Curtain Wall: Non-Structural',
      description: 'Curtain wall is non-structural — takes no column or slab loads. Hung from floor slabs via anchor brackets. Glass can be single, double, or triple IGU.',
      position: () => [2.0, 3.5, 0.6],
    },
  ],
  presets: [
    { label: 'All Wall Types', values: { cutPosition: 1.5 } },
    { label: 'CHB & Cavity', values: { cutPosition: 1.5 } },
    { label: 'Curtain Wall', values: { cutPosition: 1.5 } },
    { label: 'Drywall', values: { cutPosition: 1.5 } },
  ],
}
