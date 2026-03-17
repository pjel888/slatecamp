// src/app/dashboard/3d-lab/_config/modules/ivatan-stone-house.ts
// Ivatan Stone House — Philippine Vernacular Architecture
import type { ExplodedAssemblyConfig } from '../../_types/templates'

function yOff(v: number): [number, number, number] { return [0, v, 0] }

export const ivatanStoneHouseConfig: ExplodedAssemblyConfig = {
  id: 'ivatan-stone-house',
  title: 'Ivatan Stone House (Sinadumparan)',
  description: 'Exploded assembly of the Ivatan stone house from Batanes, Philippines. Shows thick limestone walls, cogon thatch roof, low profile, and typhoon-resistant construction evolved for the world\'s most typhoon-prone archipelago.',
  subject: 'history',
  parts: [
    {
      id: 'ivt-foundation',
      label: 'Limestone Foundation',
      description: 'Rubble limestone foundation. Batanes limestone (coral) is abundant locally and provides high compressive strength. Foundation typically 400mm wide.',
      geometry: { id: 'ivt-foundation-geo', type: 'box', position: [0, 0.05, 0], args: [1.4, 0.1, 1.0], color: '#e2d9c8' },
      explodeOffset: yOff(0),
    },
    {
      id: 'ivt-wall-front',
      label: 'Front Wall (500mm Limestone)',
      description: 'Massive 400–600mm thick limestone rubble wall laid in lime mortar. Thermal mass moderates temperature. Withstands Typhoon-force winds through sheer weight.',
      geometry: { id: 'ivt-wall-front-geo', type: 'box', position: [0, 0.7, -0.48], args: [1.4, 1.3, 0.5], color: '#d6cab8' },
      explodeOffset: [0, 0.2, -0.7],
    },
    {
      id: 'ivt-wall-rear',
      label: 'Rear Wall (Limestone)',
      description: 'Rear thick limestone wall. Few or no openings on windward side to resist typhoon pressure.',
      geometry: { id: 'ivt-wall-rear-geo', type: 'box', position: [0, 0.7, 0.48], args: [1.4, 1.3, 0.5], color: '#d6cab8' },
      explodeOffset: [0, 0.2, 0.7],
    },
    {
      id: 'ivt-wall-left',
      label: 'Side Wall (Limestone)',
      description: 'Side gable wall. The low eave height reduces wind uplift. Overall building height is kept minimal — low profile is a key typhoon strategy.',
      geometry: { id: 'ivt-wall-left-geo', type: 'box', position: [-0.68, 0.7, 0], args: [0.5, 1.3, 1.0], color: '#d6cab8' },
      explodeOffset: [-0.9, 0.2, 0],
    },
    {
      id: 'ivt-wall-right',
      label: 'Side Wall (Right)',
      description: 'Right side limestone wall. Lime-plastered exterior reflects heat and sheds rain.',
      geometry: { id: 'ivt-wall-right-geo', type: 'box', position: [0.68, 0.7, 0], args: [0.5, 1.3, 1.0], color: '#d6cab8' },
      explodeOffset: [0.9, 0.2, 0],
    },
    {
      id: 'ivt-window',
      label: 'Window Opening (Small)',
      description: 'Small window openings with thick stone reveals. Limited in size and number to reduce wind infiltration. Placed on leeward side.',
      geometry: { id: 'ivt-window-geo', type: 'box', position: [0, 0.8, -0.73], args: [0.2, 0.2, 0.05], color: '#1e293b', opacity: 0.6, transparent: true },
      explodeOffset: [0, 0.2, -0.9],
    },
    {
      id: 'ivt-roof-plate',
      label: 'Wall Plate / Lintel',
      description: 'Heavy timber wall plate spanning the top of the stone walls, providing bearing for the roof structure.',
      geometry: { id: 'ivt-roof-plate-geo', type: 'box', position: [0, 1.4, 0], args: [1.4, 0.1, 1.0], color: '#92400e' },
      explodeOffset: yOff(0.5),
    },
    {
      id: 'ivt-roof-frame',
      label: 'Roof Frame (Low Pitch)',
      description: 'Timber rafter frame with relatively shallow pitch (~25°). Low pitch reduces wind uplift compared to steep tropical roofs. Eaves extend past walls for shade.',
      geometry: { id: 'ivt-roof-frame-geo', type: 'box', position: [0, 1.6, 0], args: [1.5, 0.08, 1.1], color: '#a3734c' },
      explodeOffset: yOff(0.7),
    },
    {
      id: 'ivt-cogon-thatch',
      label: 'Cogon Grass Thatch',
      description: 'Thick cogon thatch — 200–300mm deep — tied in bundles to bamboo purlins. The thatch flexes in typhoon winds rather than being ripped off. Locally sourced from Batanes grasslands.',
      geometry: { id: 'ivt-cogon-thatch-geo', type: 'box', position: [0, 1.75, 0], args: [1.5, 0.25, 1.1], color: '#ca8a04' },
      explodeOffset: yOff(1.0),
    },
  ],
  camera: { position: [3, 2.5, 3], fov: 45 },
}
