// src/app/dashboard/3d-lab/_config/modules/plastering-layers.ts
import type { CutawaySectionConfig } from '../../_types/templates'

export const plasteringLayersConfig: CutawaySectionConfig = {
  id: 'plastering-layers',
  title: 'Plastering Layers',
  description:
    'Wall plaster cross-section — CHB substrate, scratch coat + float coat + finish coat layers, total 12–16mm per side, bonding, and surface finish.',
  subject: 'construction',
  cutAxis: 'y',
  camera: { position: [3, 2.5, 3.5], fov: 40 },
  layers: [
    {
      id: 'chb-substrate',
      label: 'CHB Substrate',
      material: 'CHB 150mm',
      description: 'CHB (concrete hollow block) substrate — surface must be clean, free of oil and loose particles. Porous surface enhances mechanical bond with plaster.',
      depth: 0,
      geometry: { id: 'geo-chb', type: 'box', args: [0.15, 3.0, 1.0], position: [0, 1.5, 0], color: '#d6d3d1' },
    },
    {
      id: 'bonding-agent',
      label: 'Bonding Agent / Roughening',
      material: 'Cement Slurry or Bonding Agent',
      description: 'Bonding treatment — cement slurry scratch coat or liquid bonding agent applied to substrate before plastering. Critical for adhesion on dense or smooth surfaces.',
      depth: 0.1,
      geometry: { id: 'geo-bond', type: 'box', args: [0.002, 3.0, 1.0], position: [0.076, 1.5, 0], color: '#9ca3af' },
    },
    {
      id: 'scratch-coat',
      label: 'Scratch Coat (6–8mm)',
      material: '1:3 Portland Cement Mortar — Scratched',
      description: 'Scratch coat — 6–8mm Portland cement mortar (1:3 PC:sand). Applied and surface scratched (scarified) while green to create key for next coat. 24-hour cure minimum.',
      depth: 0.25,
      geometry: { id: 'geo-scratch', type: 'box', args: [0.007, 3.0, 1.0], position: [0.0785, 1.5, 0], color: '#b0b0b0' },
    },
    {
      id: 'float-coat',
      label: 'Brown Coat / Float Coat (4–6mm)',
      material: '1:3.5 Mortar — Floated Level',
      description: 'Brown coat (float coat) — 4–6mm mortar (1:3.5 PC:sand). Floated flat and true — corrects wall alignment errors. Allowed to cure 24–48 hours.',
      depth: 0.4,
      geometry: { id: 'geo-float', type: 'box', args: [0.005, 3.0, 1.0], position: [0.0825, 1.5, 0], color: '#c0c0c0' },
    },
    {
      id: 'finish-coat',
      label: 'Finish Coat (3–5mm)',
      material: 'White Cement or Gypsum Skim',
      description: 'Finish coat — 3–5mm white cement putty or gypsum skim. Final smooth surface. Textured finishes can be applied while fresh. Cure 7 days before painting.',
      depth: 0.55,
      geometry: { id: 'geo-finish', type: 'box', args: [0.004, 3.0, 1.0], position: [0.0855, 1.5, 0], color: '#f8fafc' },
    },
    {
      id: 'paint-finish',
      label: 'Paint System (3 coats)',
      material: 'Primer + 2 coats Acrylic',
      description: 'Paint system — alkali-resistant primer + 2 coats acrylic latex paint. Plaster must be fully cured and dry (pH < 9) before painting to prevent saponification.',
      depth: 0.7,
      geometry: { id: 'geo-paint', type: 'box', args: [0.001, 3.0, 1.0], position: [0.0885, 1.5, 0], color: '#dbeafe' },
    },
    {
      id: 'total-thickness',
      label: 'Total Plaster: 12–16mm per side',
      material: 'Reference Dimension',
      description: 'Total plaster thickness per side: 12–16mm (scratch + float + finish). Both sides: 24–32mm total addition to wall thickness.',
      depth: 0.9,
      geometry: { id: 'geo-dim', type: 'box', args: [0.012, 3.0, 0.005], position: [0.081, 1.5, 0.505], color: '#D64545' },
    },
  ],
  annotations: [
    {
      id: 'ann-scratch',
      label: 'Scratch Coat: Must Be Scarified',
      description: 'Scratch coat must be horizontally scratched while green (not hard) — creates mechanical key for the brown coat. Without scratching, delamination risk is high.',
      position: () => [0.8, 2.5, 0.6],
    },
    {
      id: 'ann-cure',
      label: 'Cure Between Coats: 24h min',
      description: 'Each coat must cure minimum 24 hours before next coat application — prevents plastic shrinkage cracking and ensures adequate strength development.',
      position: () => [0.8, 1.5, 0.6],
    },
    {
      id: 'ann-total',
      label: 'Total: 12–16mm per side',
      description: 'Philippine standard: 12–16mm total plaster per side. Total 3-coat system. Lightweight plaster (gypsum): 8–12mm possible. Keep consistent to avoid differential shrinkage.',
      position: () => [0.8, 0.5, 0.6],
    },
  ],
  presets: [
    { label: 'Full Section', values: { cutPosition: 0.09 } },
    { label: 'Scratch Coat', values: { cutPosition: 0.079 } },
    { label: 'Float Coat', values: { cutPosition: 0.083 } },
    { label: 'Finish Coat', values: { cutPosition: 0.086 } },
  ],
}
