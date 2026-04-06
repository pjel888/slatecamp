// src/app/dashboard/3d-lab/_config/modules/pantheon-cutaway.ts
import type { CutawaySectionConfig } from '@/features/3d-lab/types/templates'

export const pantheonCutawayConfig: CutawaySectionConfig = {
  id: 'pantheon-cutaway',
  title: 'Pantheon Cutaway',
  description:
    'Rome\'s Pantheon (118–128 CE) — 43.3m unreinforced concrete dome, stepped rings, sunken coffers, and the oculus. Dome radius equals interior height.',
  subject: 'history',
  cutAxis: 'y',
  camera: { position: [5, 4, 5], fov: 42 },
  layers: [
    {
      id: 'rotunda-wall',
      label: 'Rotunda Wall (6.4m thick)',
      material: 'Opus Caementicium (Varying Aggregate)',
      description: 'Cylindrical rotunda wall — 6.4m thick at base. Aggregate intentionally lightened in upper courses: travertine at base → tufa → pumice near crown.',
      depth: 0,
      geometry: { id: 'geo-rot', type: 'cylinder', args: [3.5, 3.5, 4.5, 24, 1, 1], position: [0, 2.25, 0], color: '#9ca3af' },
    },
    {
      id: 'coffers',
      label: 'Dome Coffers (5 rings × 28)',
      material: 'Concrete with Stucco Face',
      description: '5 rings of 28 coffers each — reduce dome weight by ~15%. Originally gilded bronze. Decrease in size toward crown creates forced perspective illusion.',
      depth: 0.2,
      geometry: { id: 'geo-cof1', type: 'box', args: [0.4, 0.4, 0.15], position: [-1.5, 3.5, 2.0], color: '#c4913f' },
    },
    {
      id: 'dome-shell',
      label: 'Unreinforced Concrete Dome',
      material: 'Opus Caementicium — Pumice Aggregate',
      description: '43.3m diameter dome — no steel reinforcement. 1.2m thick at base tapering to 1.2m at oculus. Pumice aggregate at crown reduces density.',
      depth: 0.35,
      geometry: { id: 'geo-dome', type: 'sphere', args: [3.5, 24, 24, 0, Math.PI * 2, 0, Math.PI / 2], position: [0, 3.5, 0], color: '#b0a090' },
    },
    {
      id: 'oculus',
      label: 'Oculus (8.7m diameter)',
      material: 'Open to Sky',
      description: 'Oculus — 8.7m open hole at dome apex. Only light source. Acts as compression ring — critical structural element converting dome stress to compressive ring.',
      depth: 0.5,
      geometry: { id: 'geo-oculus', type: 'ring', args: [0.5, 0.7, 24], position: [0, 7.0, 0], rotation: [Math.PI / 2, 0, 0], color: '#dbeafe' },
    },
    {
      id: 'stepped-rings',
      label: 'Stepped Exterior Rings',
      material: 'Concrete Buttressing Rings',
      description: 'Seven stepped concrete rings on exterior — appear decorative but act as buttresses concentrating dome thrust at the wall-dome junction.',
      depth: 0.65,
      geometry: { id: 'geo-rings', type: 'cylinder', args: [3.8, 3.4, 0.5, 24, 1, 1], position: [0, 3.7, 0], color: '#9ca3af' },
    },
    {
      id: 'portico',
      label: 'Corinthian Portico',
      material: 'Egyptian Granite Columns',
      description: 'Eight monolithic grey Egyptian granite columns, 14.15m tall — front portico adds procession and conceals the dome\'s mass.',
      depth: 0.8,
      geometry: { id: 'geo-port', type: 'cylinder', args: [0.25, 0.25, 4.0, 12], position: [-1.0, 2.0, 3.5], color: '#d4a853' },
    },
    {
      id: 'marble-floor',
      label: 'Marble Floor (Original)',
      material: 'Colored Marble Opus Sectile',
      description: 'Original marble floor — geometric colored marble patterns. Floor level unchanged since antiquity. Rain from oculus drains through slightly cambered floor.',
      depth: 0.9,
      geometry: { id: 'geo-floor', type: 'cylinder', args: [3.5, 3.5, 0.1, 24], position: [0, 0.05, 0], color: '#e5e7eb' },
    },
  ],
  annotations: [
    {
      id: 'ann-oculus',
      label: 'Oculus: Structural & Symbolic',
      description: 'The 8.7m oculus is both structural (compression ring) and symbolic (eye to the heavens). Radius of dome equals the height from floor to oculus: 43.3m = 43.3m.',
      position: () => [2.5, 7.0, 0.8],
    },
    {
      id: 'ann-aggregate',
      label: 'Graduated Aggregate Density',
      description: 'Roman engineers reduced concrete density in upper dome by changing aggregate: travertine (base) → tufa → pumice (near oculus). Structural optimization in 118 CE.',
      position: () => [-3.0, 5.5, 0.8],
    },
    {
      id: 'ann-perfect',
      label: 'Perfect Sphere Interior',
      description: 'Interior diameter equals total interior height — a sphere 43.3m in diameter would fit exactly inside the rotunda. The perfect geometric ideal of antiquity.',
      position: () => [3.5, 2.0, 0.8],
    },
  ],
  presets: [
    { label: 'Full Cutaway', values: { cutPosition: 4.0 } },
    { label: 'Ground Floor', values: { cutPosition: 0.5 } },
    { label: 'Dome Section', values: { cutPosition: 5.0 } },
    { label: 'Oculus Level', values: { cutPosition: 7.0 } },
  ],
}

