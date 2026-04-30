// src/features/3d-lab/config/modules/florence-cathedral-dome.ts
import type { CutawaySectionConfig } from '@/features/3d-lab/types/templates'

export const florenceCathedralDomeConfig: CutawaySectionConfig = {
  id: 'florence-cathedral-dome',
  title: 'Florence Cathedral Dome',
  description:
    'Brunelleschi\'s dome (1420–1436) — 42m double-shell with 8 major + 16 minor ribs, herringbone brick, iron tension chains, lantern.',
  subject: 'history',
  cutAxis: 'y',
  camera: { position: [4.5, 4, 4.5], fov: 42 },
  layers: [
    {
      id: 'octagonal-drum',
      label: 'Gothic Octagonal Drum',
      material: 'White Marble / Green Marble Bands',
      description: 'Octagonal drum completed in Gothic style — 42m clear span, no centering formwork possible in 1420. Brunelleschi devised a solution without temporary support.',
      depth: 0,
      geometry: { id: 'geo-odrum', type: 'cylinder', args: [3.0, 3.0, 1.5, 8], position: [0, 0.75, 0], color: '#f8f8f8' },
    },
    {
      id: 'major-ribs',
      label: '8 Major Stone Ribs',
      material: 'Sandstone Ribs',
      description: 'Eight major sandstone ribs at octagon corners — visible on exterior as white marble ribs. Primary structural spine from drum to lantern.',
      depth: 0.2,
      geometry: { id: 'geo-majr', type: 'box', args: [0.25, 4.5, 0.3], position: [-3.0, 3.25, 0], rotation: [0, 0, 0.2], color: '#ffffff' },
    },
    {
      id: 'minor-ribs',
      label: '16 Minor Brick Ribs',
      material: 'Brick Ribs',
      description: 'Sixteen minor ribs between major ones — guided herringbone brick placement and connected inner and outer shells structurally.',
      depth: 0.35,
      geometry: { id: 'geo-minr', type: 'box', args: [0.12, 4.0, 0.15], position: [-2.5, 3.0, 1.0], rotation: [0, 0, 0.18], color: '#e5c99a' },
    },
    {
      id: 'inner-shell-brick',
      label: 'Inner Shell (Herringbone Brick)',
      material: 'Sandstone & Brick — Herringbone (a spina pesce)',
      description: 'Inner shell 42m span — herringbone brick laying (a spina pesce): horizontal courses every 7th ring prevent horizontal slip. Self-supporting during construction.',
      depth: 0.5,
      geometry: { id: 'geo-ishell', type: 'sphere', args: [2.8, 20, 20, 0, Math.PI * 2, 0, Math.PI / 2], position: [0, 1.5, 0], color: '#c4913f' },
    },
    {
      id: 'outer-shell-tile',
      label: 'Outer Shell (Terracotta Tiles)',
      material: 'Red Terracotta Pantile',
      description: 'Outer shell of red terracotta pantile — distinctive Florence skyline color. More steeply curved than inner shell (ogival profile for visual height).',
      depth: 0.65,
      geometry: { id: 'geo-oshell', type: 'sphere', args: [3.3, 20, 20, 0, Math.PI * 2, 0, Math.PI / 2], position: [0, 1.2, 0], color: '#b05a2a', opacity: 0.5, transparent: true },
    },
    {
      id: 'iron-chains',
      label: 'Iron Chain Tension Rings',
      material: 'Iron Chain + Stone Links',
      description: 'Four horizontal iron chain rings (stone links at corners) resist outward thrust. Revolutionary structural use of iron in tension — 1420s innovation.',
      depth: 0.8,
      geometry: { id: 'geo-ichain', type: 'ring', args: [2.75, 2.9, 24], position: [0, 1.5, 0], rotation: [Math.PI / 2, 0, 0], color: '#374151' },
    },
    {
      id: 'marble-lantern',
      label: 'White Marble Lantern',
      material: 'White Marble (Completed 1461)',
      description: 'Marble lantern completed after Brunelleschi\'s death — adds compression at crown, reduces shell lip instability. Pinnacle of Renaissance civic ambition.',
      depth: 0.9,
      geometry: { id: 'geo-mlantern', type: 'cylinder', args: [0.4, 0.6, 1.2, 8], position: [0, 5.2, 0], color: '#f8f8f8' },
    },
  ],
  annotations: [
    {
      id: 'ann-herringbone',
      label: 'Herringbone: No Centering Needed',
      description: 'Herringbone (a spina pesce) brick laying creates self-supporting courses — horizontal compression prevents rings from slipping inward. Revolutionary construction without centering.',
      position: () => [-3.5, 3.5, 0.8],
    },
    {
      id: 'ann-double',
      label: 'Double Shell: 8 + 16 Ribs',
      description: 'Inner structural shell (sandstone/brick), 8 major + 16 minor ribs, outer decorative shell (terracotta). Void between shells allows maintenance access.',
      position: () => [3.5, 3.0, 0.8],
    },
    {
      id: 'ann-span',
      label: '42m Span — Largest Masonry Dome',
      description: 'At 42m clear span, largest masonry dome ever built without centering. Exceeds Pantheon (43.3m) if measured as an octagon, but built 1300 years later without Roman concrete.',
      position: () => [3.0, 1.0, 0.8],
    },
  ],
  presets: [
    { label: 'Full Dome', values: { cutPosition: 3.0 } },
    { label: 'Drum Level', values: { cutPosition: 0.5 } },
    { label: 'Shell Section', values: { cutPosition: 3.0 } },
    { label: 'Lantern', values: { cutPosition: 5.5 } },
  ],
}

