// src/app/dashboard/3d-lab/_config/modules/renaissance-dome-construction.ts
import type { CutawaySectionConfig } from '../../../_types/templates'

export const renaissanceDomeConstructionConfig: CutawaySectionConfig = {
  id: 'renaissance-dome-construction',
  title: 'Renaissance Dome Construction',
  description:
    'Double-shell Renaissance dome section — inner and outer shells connected by ribs, herringbone brick courses, compression ring at base.',
  subject: 'history',
  cutAxis: 'y',
  camera: { position: [4.5, 4, 4.5], fov: 42 },
  layers: [
    {
      id: 'drum',
      label: 'Octagonal Drum',
      material: 'Marble-clad Sandstone',
      description: 'Octagonal drum rising from the crossing — supports both shells. Florence Cathedral drum has eight large ocular windows between Gothic ribs.',
      depth: 0,
      geometry: { id: 'geo-drum', type: 'cylinder', args: [2.5, 2.5, 1.0, 8], position: [0, 0.5, 0], color: '#d4a853' },
    },
    {
      id: 'inner-shell',
      label: 'Inner Shell (Structural)',
      material: 'Sandstone / Brick (Herringbone)',
      description: 'Inner shell — main load-bearing dome. Brick laid in herringbone (a spina pesce) pattern for stability during construction without centering. Florence: 42m span.',
      depth: 0.2,
      geometry: { id: 'geo-inner', type: 'sphere', args: [2.2, 20, 20, 0, Math.PI * 2, 0, Math.PI / 2], position: [0, 1.0, 0], color: '#c4913f' },
    },
    {
      id: 'major-ribs',
      label: 'Major Stone Ribs (8)',
      material: 'Sandstone Rib',
      description: 'Eight major stone ribs at angles of octagon — span from drum to lantern. Visible on exterior as white marble ribs on terracotta tiles.',
      depth: 0.4,
      geometry: { id: 'geo-majrib', type: 'box', args: [0.2, 2.5, 0.2], position: [-2.2, 2.25, 0], rotation: [0, 0, -0.4], color: '#f8f8f8' },
    },
    {
      id: 'minor-ribs',
      label: 'Minor Ribs (16)',
      material: 'Brick Rib',
      description: 'Sixteen minor brick ribs between major ribs — connect inner and outer shells, distribute loads, and guided brick laying.',
      depth: 0.5,
      geometry: { id: 'geo-minrib', type: 'box', args: [0.1, 2.2, 0.1], position: [-1.8, 2.1, 0.8], rotation: [0, 0, -0.35], color: '#e5c99a' },
    },
    {
      id: 'outer-shell',
      label: 'Outer Shell (Weathering)',
      material: 'Terracotta Tile on Brick',
      description: 'Outer shell provides weather protection and visual form. Lighter construction than inner shell — supported off the ribs at intervals.',
      depth: 0.65,
      geometry: { id: 'geo-outer', type: 'sphere', args: [2.7, 20, 20, 0, Math.PI * 2, 0, Math.PI / 2], position: [0, 0.8, 0], color: '#b05a2a', opacity: 0.5, transparent: true },
    },
    {
      id: 'chain-ring',
      label: 'Tension Ring (Iron Chains)',
      material: 'Iron Chain / Stone Ring',
      description: 'Iron tension chains at base of dome resist outward thrust — Brunelleschi used four iron chain rings at various heights. Revolutionary use of iron in tension.',
      depth: 0.8,
      geometry: { id: 'geo-chain', type: 'ring', args: [2.15, 2.35, 24], position: [0, 1.0, 0], rotation: [Math.PI / 2, 0, 0], color: '#374151' },
    },
    {
      id: 'lantern',
      label: 'Lantern (Compression Cap)',
      material: 'White Marble',
      description: 'Stone lantern at apex — adds compressive weight to crown, reduces tendency of shell to deform outward. Also admits light.',
      depth: 0.95,
      geometry: { id: 'geo-lantern', type: 'cylinder', args: [0.3, 0.5, 0.8, 8], position: [0, 4.0, 0], color: '#f8f8f8' },
    },
  ],
  annotations: [
    {
      id: 'ann-double',
      label: 'Double-Shell Innovation',
      description: 'Double-shell dome allows outer form to be more steeply pointed (visual) while inner shell carries structural loads. Void between shells reduces weight.',
      position: () => [3.0, 2.5, 0.8],
    },
    {
      id: 'ann-herringbone',
      label: 'Herringbone Brick Pattern',
      description: 'Brunelleschi\'s herringbone (a spina pesce) brick laying: every 7th course horizontal, rest angled — allows self-supporting construction without centering formwork.',
      position: () => [-3.0, 3.0, 0.8],
    },
    {
      id: 'ann-chains',
      label: 'Iron Chains as Tension Ring',
      description: 'Four iron chains at different heights act as hoop tension rings restraining dome spread. A structural precursor to prestressed concrete ring beams.',
      position: () => [-3.0, 1.0, 0.8],
    },
  ],
  presets: [
    { label: 'Full Dome', values: { cutPosition: 2.5 } },
    { label: 'Drum Level', values: { cutPosition: 0.5 } },
    { label: 'Shell Section', values: { cutPosition: 2.5 } },
    { label: 'Lantern', values: { cutPosition: 4.0 } },
  ],
}
