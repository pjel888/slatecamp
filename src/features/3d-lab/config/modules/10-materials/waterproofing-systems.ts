// src/features/3d-lab/config/modules/waterproofing-systems.ts
import type { CutawaySectionConfig } from '@/features/3d-lab/types/templates'

export const waterproofingSystemsConfig: CutawaySectionConfig = {
  id: 'waterproofing-systems',
  title: 'Waterproofing Systems',
  description:
    'Flat roof/slab waterproofing comparison — membrane (bituminous), cementitious coating, crystalline, and liquid polyurethane systems in cutaway section.',
  subject: 'materials',
  cutAxis: 'y',
  camera: { position: [5, 3, 5], fov: 42 },
  layers: [
    {
      id: 'structural-slab',
      label: 'RC Structural Slab',
      material: 'Reinforced Concrete 150mm',
      description: 'Base reinforced concrete slab — all waterproofing systems applied over this substrate. Surface must be prepared (clean, sound, free of voids).',
      depth: 0,
      geometry: { id: 'geo-slab', type: 'box', args: [5, 0.15, 1.0], position: [0, 0.075, 0], color: '#b0b0b0' },
    },
    {
      id: 'primer-coat',
      label: 'Primer / Bonding Coat',
      material: 'Bituminous Primer',
      description: 'Primer coat applied to concrete substrate — improves adhesion of membrane, seals capillaries, and primes the surface.',
      depth: 0.15,
      geometry: { id: 'geo-primer', type: 'box', args: [1.0, 0.003, 1.0], position: [-1.75, 0.153, 0], color: '#1c1917' },
    },
    {
      id: 'bituminous-membrane',
      label: 'Bituminous Membrane (SBS)',
      material: 'SBS Modified Bitumen Sheet 4mm',
      description: 'SBS modified bitumen membrane — 4mm torch-applied sheet. Most common Philippine waterproofing. High elongation, excellent crack bridging, 20-year lifespan.',
      depth: 0.3,
      geometry: { id: 'geo-bitmem', type: 'box', args: [1.0, 0.004, 1.0], position: [-1.75, 0.157, 0], color: '#374151' },
    },
    {
      id: 'cementitious-coat',
      label: 'Cementitious Waterproofing',
      material: '2-component Cementitious Coating',
      description: '2-component polymer-modified cementitious coating — brush-applied in 2–3 coats. Good for below-grade and water features. Breathable, bonds directly to concrete.',
      depth: 0.5,
      geometry: { id: 'geo-cem', type: 'box', args: [1.0, 0.006, 1.0], position: [-0.25, 0.153, 0], color: '#9ca3af' },
    },
    {
      id: 'crystalline-coat',
      label: 'Crystalline Waterproofing',
      material: 'Crystalline Admixture / Slurry',
      description: 'Crystalline system — active chemicals react with moisture and concrete to form insoluble crystals blocking capillaries. Self-healing, permanent. Applied as slurry or admixed.',
      depth: 0.65,
      geometry: { id: 'geo-cryst', type: 'box', args: [1.0, 0.004, 1.0], position: [1.25, 0.152, 0], color: '#e5e7eb' },
    },
    {
      id: 'polyurethane-liquid',
      label: 'Liquid PU Waterproofing',
      material: 'Polyurethane Liquid Membrane 2mm',
      description: 'Liquid polyurethane membrane — 2mm applied by roller/brush. Seamless, excellent elongation (>200%), UV-stable with topcoat. Ideal for complex geometry, around penetrations.',
      depth: 0.8,
      geometry: { id: 'geo-pu', type: 'box', args: [1.0, 0.002, 1.0], position: [2.25, 0.151, 0], color: '#fbbf24' },
    },
    {
      id: 'protection-screed',
      label: 'Protection Screed / Topping',
      material: '40mm Cement Screed',
      description: 'Protection screed over membrane — protects waterproofing from puncture, foot traffic, and UV. 40mm min over bituminous membrane.',
      depth: 0.95,
      geometry: { id: 'geo-screed', type: 'box', args: [5, 0.04, 1.0], position: [0, 0.17, 0], color: '#d4d4d4' },
    },
  ],
  annotations: [
    {
      id: 'ann-bitmem',
      label: 'SBS Membrane: Most Common',
      description: 'SBS modified bituminous membrane most widely used in Philippines — 4mm torch-applied, single-ply. Requires primer and protection screed. 20-year warranty typical.',
      position: () => [-1.75, 0.8, 0.6],
    },
    {
      id: 'ann-crystalline',
      label: 'Crystalline: Self-Healing',
      description: 'Crystalline waterproofing uniquely self-heals hairline cracks — active chemicals migrate into cracks and re-crystallize when wetted. Only system with this property.',
      position: () => [1.25, 0.8, 0.6],
    },
    {
      id: 'ann-pu',
      label: 'Liquid PU: Seamless',
      description: 'Liquid PU is truly seamless — no laps or seams. Excellent for roofs with many penetrations, drainage points, and complex geometry. UV topcoat required.',
      position: () => [2.75, 0.8, 0.6],
    },
  ],
  presets: [
    { label: 'All Systems', values: { cutPosition: 0.2 } },
    { label: 'Bituminous', values: { cutPosition: 0.16 } },
    { label: 'Cementitious', values: { cutPosition: 0.16 } },
    { label: 'Crystalline + PU', values: { cutPosition: 0.16 } },
  ],
}

