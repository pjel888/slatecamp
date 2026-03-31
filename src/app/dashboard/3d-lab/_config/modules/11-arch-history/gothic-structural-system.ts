// src/app/dashboard/3d-lab/_config/modules/gothic-structural-system.ts
import type { CutawaySectionConfig } from '../../../_types/templates'

export const gothicStructuralSystemConfig: CutawaySectionConfig = {
  id: 'gothic-structural-system',
  title: 'Gothic Structural System',
  description:
    'Gothic cathedral cross-section — pointed arch, ribbed vault, flying buttress, and tracery working together to dissolve masonry walls into glass.',
  subject: 'history',
  cutAxis: 'y',
  camera: { position: [5, 4.5, 5], fov: 42 },
  layers: [
    {
      id: 'nave-pier',
      label: 'Compound Nave Pier',
      material: 'Limestone — Clustered Shafts',
      description: 'Slender compound pier with clustered shafts — each shaft corresponds to a vault rib or arch above. Dematerialized compared to Romanesque piers.',
      depth: 0,
      geometry: { id: 'geo-pier', type: 'cylinder', args: [0.3, 0.3, 5.5, 8], position: [-1.5, 2.75, 0], color: '#d6d3d1' },
    },
    {
      id: 'pointed-arch',
      label: 'Pointed Arch',
      material: 'Limestone Voussoirs',
      description: 'Pointed (two-centered) arch — reduces horizontal thrust compared to semicircular arch, allows variable span widths, and achieves greater height.',
      depth: 0.2,
      geometry: { id: 'geo-parch', type: 'ring', args: [1.2, 1.5, 24], position: [0, 5.5, 0], rotation: [Math.PI / 2, 0, 0], color: '#c4c4c4' },
    },
    {
      id: 'ribbed-vault',
      label: 'Ribbed Vault',
      material: 'Limestone Ribs + Stone Webbing',
      description: 'Ribbed vault: diagonal ribs concentrate loads, allowing thinner vault webbing. Ribs visible as structural and decorative elements.',
      depth: 0.35,
      geometry: { id: 'geo-rib1', type: 'cylinder', args: [0.05, 0.05, 3.5, 8], position: [0, 6.0, 0], rotation: [0, 0, Math.PI / 4], color: '#b0b0b0' },
    },
    {
      id: 'clerestory-window',
      label: 'Clerestory Window (Tracery)',
      material: 'Stained Glass + Stone Tracery',
      description: 'Large clerestory windows with stone tracery — possible because flying buttresses have relieved the wall of structural duty. Gothic innovation.',
      depth: 0.5,
      geometry: { id: 'geo-win', type: 'box', args: [0.8, 2.5, 0.1], position: [-1.2, 5.8, 0.6], color: '#bfdbfe', opacity: 0.8, transparent: true },
    },
    {
      id: 'flying-buttress-arm',
      label: 'Flying Buttress Arm',
      material: 'Limestone Arch',
      description: 'Flying buttress arm — slender arch carrying vault thrust over the aisle roof to the outer buttress pier. Removes thrust from nave wall entirely.',
      depth: 0.65,
      geometry: { id: 'geo-fbarm', type: 'cylinder', args: [0.12, 0.12, 2.0, 8], position: [-2.5, 5.5, 0], rotation: [0, 0, Math.PI / 5], color: '#c0c0c0' },
    },
    {
      id: 'buttress-pier',
      label: 'Outer Buttress Pier with Pinnacle',
      material: 'Limestone with Lead Pinnacle',
      description: 'Outer buttress pier receiving flying buttress thrust. Pinnacle on top adds weight, increasing compressive force and reducing tendency to overturn.',
      depth: 0.8,
      geometry: { id: 'geo-bp', type: 'box', args: [0.5, 5.0, 0.5], position: [-3.0, 2.5, 0], color: '#d4d4d4' },
    },
    {
      id: 'pinnacle',
      label: 'Decorative Pinnacle',
      material: 'Carved Limestone',
      description: 'Pinnacle — structurally loads the buttress pier to keep thrust resultant within the pier cross-section. Also visually vertical.',
      depth: 0.9,
      geometry: { id: 'geo-pinn', type: 'cone', args: [0.2, 1.0, 8], position: [-3.0, 5.5, 0], color: '#e5e5e5' },
    },
  ],
  annotations: [
    {
      id: 'ann-fb',
      label: 'Flying Buttress — Key Innovation',
      description: 'The flying buttress transfers nave vault thrust over the aisle to an outer pier, freeing the nave wall for large windows. Invented in 12th c. France.',
      position: () => [-4.0, 5.5, 0.8],
    },
    {
      id: 'ann-pointed',
      label: 'Pointed Arch Reduces Thrust',
      description: 'Pointed arch generates less horizontal thrust than semicircular arch for same span — allows taller, thinner walls and more complex vault geometries.',
      position: () => [1.5, 6.0, 0.8],
    },
    {
      id: 'ann-tracery',
      label: 'Stone Tracery in Windows',
      description: 'Geometric stone tracery fills window openings — bar tracery (Gothic), plate tracery (early), and flamboyant (late Gothic). Pure ornamental geometry.',
      position: () => [-0.5, 7.0, 0.8],
    },
  ],
  presets: [
    { label: 'Full Section', values: { cutPosition: 4.0 } },
    { label: 'Pier Level', values: { cutPosition: 2.5 } },
    { label: 'Clerestory', values: { cutPosition: 5.5 } },
    { label: 'Flying Buttress', values: { cutPosition: 5.5 } },
  ],
}
