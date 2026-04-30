// src/features/3d-lab/config/modules/vigan-heritage-house.ts
// Vigan Heritage House — Philippine Vernacular Architecture
import type { ExplodedAssemblyConfig } from '@/features/3d-lab/types/templates'

function yOff(v: number): [number, number, number] { return [0, v, 0] }

export const viganHeritageHouseConfig: ExplodedAssemblyConfig = {
  id: 'vigan-heritage-house',
  title: 'Vigan Heritage House',
  description: 'Exploded assembly of a Vigan (Ilocos) heritage house showing the hybrid Spanish-Chinese construction: coral stone silong (ground floor), hardwood upper floor (second storey), sliding capiz ventanillas, and tile roof.',
  subject: 'history',
  parts: [
    {
      id: 'vhh-coral-foundation',
      label: 'Coral Stone Foundation',
      description: 'Thick coral stone and volcanic tuff (adobe) foundation walls. Quarried from the Ilocos coast — 400–600mm thick, providing thermal mass and earthquake resistance.',
      geometry: { id: 'vhh-coral-foundation-geo', type: 'box', position: [0, 0.05, 0], args: [1.2, 0.1, 0.8], color: '#e7d5b3' },
      explodeOffset: yOff(0),
    },
    {
      id: 'vhh-silong-wall',
      label: 'Silong Wall (Coral Stone)',
      description: 'Ground floor (silong) walls of coral stone or brick. Historically used as warehouse, stable, or kitchen. Thick masonry resists typhoon and earthquake.',
      geometry: { id: 'vhh-silong-wall-geo', type: 'box', position: [0, 0.5, -0.4], args: [1.2, 0.8, 0.12], color: '#d6b896' },
      explodeOffset: [0, 0.2, -0.7],
    },
    {
      id: 'vhh-silong-side',
      label: 'Silong Side Wall',
      description: 'Side coral stone wall of the silong. Narrow ventilation openings with iron grilles for security.',
      geometry: { id: 'vhh-silong-side-geo', type: 'box', position: [-0.6, 0.5, 0], args: [0.12, 0.8, 0.8], color: '#d6b896' },
      explodeOffset: [-0.8, 0.2, 0],
    },
    {
      id: 'vhh-floor-upper',
      label: 'Hardwood Floor (Upper)',
      description: 'Molave or narra hardwood plank floor of the principal floor (sala). Upper floor is timber frame construction — lighter and more flexible than stone ground floor.',
      geometry: { id: 'vhh-floor-upper-geo', type: 'box', position: [0, 0.97, 0], args: [1.2, 0.06, 0.8], color: '#92400e' },
      explodeOffset: yOff(0.5),
    },
    {
      id: 'vhh-upper-wall',
      label: 'Wooden Upper Wall',
      description: 'Upper storey walls of hardwood planks or carved balustrades. More open than the stone ground floor — admits light and breeze.',
      geometry: { id: 'vhh-upper-wall-geo', type: 'box', position: [0, 1.45, -0.4], args: [1.2, 0.8, 0.08], color: '#a3734c', opacity: 0.85, transparent: true },
      explodeOffset: [0, 0.5, -0.7],
    },
    {
      id: 'vhh-ventanilla',
      label: 'Ventanilla (Sliding Capiz Window)',
      description: 'Sliding capiz shell window panels (ventanillas). The capiz shell (Placuna placenta) transmits diffused light while blocking rain. Signature element of Philippine colonial architecture.',
      geometry: { id: 'vhh-ventanilla-geo', type: 'box', position: [0, 1.45, -0.44], args: [0.5, 0.35, 0.02], color: '#fef9c3', opacity: 0.6, transparent: true },
      explodeOffset: [0, 0.5, -0.9],
    },
    {
      id: 'vhh-balcony',
      label: 'Balcony (Volada)',
      description: 'Cantilevered hardwood balcony projecting over the street. Protected by turned wooden balusters. Prominent social space in Vigan\'s Mestizo district.',
      geometry: { id: 'vhh-balcony-geo', type: 'box', position: [0, 1.1, -0.52], args: [0.9, 0.08, 0.2], color: '#78350f' },
      explodeOffset: [0, 0.4, -0.9],
    },
    {
      id: 'vhh-roof-structure',
      label: 'Roof Structure (Cuchillos)',
      description: 'Timber roof trusses (cuchillos) supporting the tile roof. Local hardwood with Spanish-influenced truss geometry.',
      geometry: { id: 'vhh-roof-structure-geo', type: 'box', position: [0, 1.92, 0], args: [1.2, 0.12, 0.8], color: '#92400e' },
      explodeOffset: yOff(0.8),
    },
    {
      id: 'vhh-roof-tile',
      label: 'Clay Tile Roof (Tejas)',
      description: 'Spanish-influenced half-round clay roof tiles (tejas). Steeply pitched for tropical rainfall. Characteristic orange-red colour of Vigan\'s heritage zone.',
      geometry: { id: 'vhh-roof-tile-geo', type: 'cone', position: [0, 2.25, 0], args: [0.7, 0.65, 4], color: '#c2410c' },
      explodeOffset: yOff(1.1),
    },
  ],
  camera: { position: [3, 2.5, 3], fov: 45 },
}

