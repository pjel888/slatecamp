// src/features/3d-lab/config/modules/lintel-over-opening.ts
import type { CutawaySectionConfig } from '@/features/3d-lab/types/templates'

export const lintelOverOpeningConfig: CutawaySectionConfig = {
  id: 'lintel-over-opening',
  title: 'Lintel Over Opening',
  description:
    'RC lintel detail above window or door opening in CHB wall — bearing length, reinforcement, depth sizing, and construction sequence.',
  subject: 'construction',
  cutAxis: 'y',
  camera: { position: [3.5, 3, 3.5], fov: 40 },
  layers: [
    {
      id: 'chb-wall',
      label: 'CHB Wall (150mm)',
      material: 'CHB 150mm',
      description: 'CHB 150mm structural wall with window/door opening. Wall carries vertical loads — lintel spans the opening and transfers loads to wall on both sides.',
      depth: 0,
      geometry: { id: 'geo-chb', type: 'box', args: [3.5, 3.0, 0.15], position: [0, 1.5, 0], color: '#d6d3d1' },
    },
    {
      id: 'opening',
      label: 'Window / Door Opening',
      material: 'Open Void',
      description: 'Window or door opening in CHB wall — opening interrupts load path from wall above. Lintel bridges across opening to carry the load.',
      depth: 0.05,
      geometry: { id: 'geo-opening', type: 'box', args: [1.2, 1.5, 0.15], position: [0, 1.0, 0], color: '#dbeafe', opacity: 0.3, transparent: true },
    },
    {
      id: 'lintel-concrete',
      label: 'RC Lintel (Concrete)',
      material: 'Grade 25 Concrete',
      description: 'Reinforced concrete lintel — depth typically 150–200mm for openings up to 1.5m. Wider openings need deeper lintel. Width matches wall thickness (150mm).',
      depth: 0.2,
      geometry: { id: 'geo-lintcon', type: 'box', args: [1.7, 0.2, 0.15], position: [0, 1.85, 0], color: '#b0b0b0' },
    },
    {
      id: 'lintel-bars',
      label: 'Main Reinforcement (Bottom)',
      material: '2 × 12mm Deformed Bars',
      description: 'Main tension reinforcement at bottom of lintel — typically 2 × 12mm for openings ≤1.2m, 3 × 12mm for 1.2–1.8m. Clear cover: 25mm to stirrup.',
      depth: 0.35,
      geometry: { id: 'geo-bars', type: 'cylinder', args: [0.006, 0.006, 1.7, 8], position: [0, 1.765, 0], rotation: [0, 0, Math.PI / 2], color: '#374151' },
    },
    {
      id: 'lintel-stirrups',
      label: 'Stirrups (10mm at 150 c/c)',
      material: '10mm Deformed Bar Stirrups',
      description: '10mm stirrups at 150mm centers throughout lintel — carry shear forces near supports and hold main bars in position.',
      depth: 0.5,
      geometry: { id: 'geo-stir', type: 'box', args: [0.01, 0.18, 0.13], position: [-0.6, 1.85, 0], color: '#374151' },
    },
    {
      id: 'bearing-length',
      label: 'Bearing Length (150mm min each side)',
      material: 'CHB / Grouted Bearing',
      description: 'Lintel must bear minimum 150mm on CHB wall each side — distributes lintel reaction to wall below. Grouted cells preferred at bearing zone.',
      depth: 0.65,
      geometry: { id: 'geo-bearing', type: 'box', args: [0.15, 0.2, 0.15], position: [-0.925, 1.85, 0], color: '#f97316' },
    },
    {
      id: 'wall-above-lintel',
      label: 'Wall Load Above Lintel',
      material: 'CHB above Opening',
      description: 'CHB courses above the lintel — load from these courses transferred through lintel by beam action. Masonry arching action also reduces lintel load for low h/span ratios.',
      depth: 0.8,
      geometry: { id: 'geo-above', type: 'box', args: [1.2, 0.9, 0.15], position: [0, 2.35, 0], color: '#d6d3d1' },
    },
  ],
  annotations: [
    {
      id: 'ann-depth',
      label: 'Lintel Depth: 1/10 span min',
      description: 'Rule of thumb: lintel depth ≥ span/10. For 1.2m opening: 120mm min (use 150mm). For 1.8m: 180mm min (use 200mm). Always verify by structural calculation.',
      position: () => [1.5, 2.0, 0.3],
    },
    {
      id: 'ann-bearing',
      label: 'Bearing: 150mm min each side',
      description: 'Lintel must bear on at least 150mm of CHB wall on each side — minimum bearing length prevents crushing of CHB at support point.',
      position: () => [-2.0, 2.0, 0.3],
    },
    {
      id: 'ann-steel',
      label: 'Bottom Bars Carry Tension',
      description: 'Lintel acts as simply supported beam — bending tension at bottom. Main bars at bottom face. Top bars (if present) carry negative moment near supports.',
      position: () => [1.5, 1.7, 0.3],
    },
  ],
  presets: [
    { label: 'Full Detail', values: { cutPosition: 1.85 } },
    { label: 'Opening View', values: { cutPosition: 1.0 } },
    { label: 'Lintel Section', values: { cutPosition: 1.85 } },
    { label: 'Bearing Zone', values: { cutPosition: 1.85 } },
  ],
}

