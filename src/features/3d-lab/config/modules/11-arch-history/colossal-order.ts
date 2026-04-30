// src/features/3d-lab/config/modules/colossal-order.ts
// Colossal Order — Classical Architecture History
import type { ExplodedAssemblyConfig } from '@/features/3d-lab/types/templates'

function yOff(v: number): [number, number, number] { return [0, v, 0] }

export const colossalOrderConfig: ExplodedAssemblyConfig = {
  id: 'colossal-order',
  title: 'Colossal Order',
  description: 'Exploded Colossal (Giant) Order — a single column spanning two or more storeys. Pioneered by Michelangelo at the Capitoline Hill. Shows column rising through ground floor, piano nobile, and second floor.',
  subject: 'history',
  parts: [
    {
      id: 'co-ground-floor',
      label: 'Ground Floor Podium',
      description: 'High podium base elevating the column base above street level. Common in Roman and Renaissance colossal compositions.',
      geometry: { id: 'co-ground-floor-geo', type: 'box', position: [0, 0.1, 0], args: [1.2, 0.2, 1.0], color: '#d4d4d8' },
      explodeOffset: yOff(0),
    },
    {
      id: 'co-base',
      label: 'Attic Base (Oversized)',
      description: 'Large Attic column base. Scale dwarfs human figures — the colossal effect relies on this size contrast.',
      geometry: { id: 'co-base-geo', type: 'cylinder', position: [0, 0.28, 0], args: [0.18, 0.18, 0.16, 16], color: '#e4e4e7' },
      explodeOffset: yOff(0.1),
    },
    {
      id: 'co-shaft-lower',
      label: 'Shaft — Ground Floor Zone',
      description: 'Lower shaft section passing through the ground floor (rez-de-chaussée). Small entresol windows flank the column.',
      geometry: { id: 'co-shaft-lower-geo', type: 'cylinder', position: [0, 0.85, 0], args: [0.14, 0.13, 1.0, 16], color: '#e4e4e7' },
      explodeOffset: yOff(0.4),
    },
    {
      id: 'co-floor-slab-1',
      label: 'First Floor Slab (Penetrated)',
      description: 'Floor slab at piano nobile level. The colossal column passes through it — requiring careful structural detailing.',
      geometry: { id: 'co-floor-slab-1-geo', type: 'box', position: [0, 1.35, 0], args: [1.2, 0.08, 1.0], color: '#94a3b8', opacity: 0.6, transparent: true },
      explodeOffset: [0.8, 0.6, 0],
    },
    {
      id: 'co-shaft-upper',
      label: 'Shaft — Piano Nobile Zone',
      description: 'Upper shaft section rising through the piano nobile and second floor, maintaining vertical continuity across two storeys.',
      geometry: { id: 'co-shaft-upper-geo', type: 'cylinder', position: [0, 1.9, 0], args: [0.13, 0.1, 1.0, 16], color: '#e4e4e7' },
      explodeOffset: yOff(0.8),
    },
    {
      id: 'co-floor-slab-2',
      label: 'Second Floor Slab (Penetrated)',
      description: 'Second floor slab also penetrated by the column. The colossal order unifies façade composition across multiple storeys.',
      geometry: { id: 'co-floor-slab-2-geo', type: 'box', position: [0, 2.4, 0], args: [1.2, 0.08, 1.0], color: '#94a3b8', opacity: 0.6, transparent: true },
      explodeOffset: [0.8, 1.2, 0],
    },
    {
      id: 'co-capital',
      label: 'Capital (Corinthian/Composite)',
      description: 'Elaborate capital — usually Corinthian or Composite — whose height is proportionally reduced relative to the oversized shaft for visual balance.',
      geometry: { id: 'co-capital-geo', type: 'cylinder', position: [0, 2.55, 0], args: [0.18, 0.13, 0.2, 16], color: '#a1a1aa' },
      explodeOffset: yOff(1.3),
    },
    {
      id: 'co-entablature',
      label: 'Entablature (Full Scale)',
      description: 'Full entablature at roofline. The colossal order entablature projects boldly, unifying the entire façade height.',
      geometry: { id: 'co-entablature-geo', type: 'box', position: [0, 2.8, 0], args: [1.2, 0.35, 1.0], color: '#71717a' },
      explodeOffset: yOff(1.6),
    },
    {
      id: 'co-attic-story',
      label: 'Attic Storey / Balustrade',
      description: 'Attic storey above the main entablature — common in Roman triumphal arches and Renaissance palaces with colossal order.',
      geometry: { id: 'co-attic-story-geo', type: 'box', position: [0, 3.1, 0], args: [1.2, 0.3, 1.0], color: '#d4d4d8' },
      explodeOffset: yOff(1.9),
    },
  ],
  camera: { position: [3, 3, 3], fov: 45 },
}

