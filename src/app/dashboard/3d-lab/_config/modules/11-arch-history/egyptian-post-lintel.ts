// src/app/dashboard/3d-lab/_config/modules/egyptian-post-lintel.ts
import type { CutawaySectionConfig } from '../../../_types/templates'

export const egyptianPostLintelConfig: CutawaySectionConfig = {
  id: 'egyptian-post-lintel',
  title: 'Egyptian Post & Lintel',
  description:
    'Massive stone column post-and-lintel system of ancient Egypt — papyriform columns, stone architrave, hypostyle hall cross-section.',
  subject: 'history',
  cutAxis: 'y',
  camera: { position: [5, 4, 5], fov: 42 },
  layers: [
    {
      id: 'stone-base',
      label: 'Stone Stylobate / Base',
      material: 'Sandstone / Limestone',
      description: 'Continuous stone platform (stylobate) supporting the columns. Raised above ground level — Egyptian temples often on elevated podium.',
      depth: 0,
      geometry: { id: 'geo-base', type: 'box', args: [5, 0.4, 1.5], position: [0, 0.2, 0], color: '#d4a853' },
    },
    {
      id: 'column-shaft',
      label: 'Column Shaft (Papyriform)',
      material: 'Sandstone — Bundled Papyrus Form',
      description: 'Massive papyriform column shaft — bundle of papyrus stalks stylized in stone. Typical diameter 1–3m, height 10–20m in large temples.',
      depth: 0.2,
      geometry: { id: 'geo-col', type: 'cylinder', args: [0.35, 0.4, 4.5, 12], position: [-1.2, 2.65, 0], color: '#c4913f' },
    },
    {
      id: 'column-shaft-2',
      label: 'Column Shaft (Right)',
      material: 'Sandstone — Bundled Papyrus Form',
      description: 'Second column shaft — hypostyle halls had rows of columns supporting the roof.',
      depth: 0.25,
      geometry: { id: 'geo-col2', type: 'cylinder', args: [0.35, 0.4, 4.5, 12], position: [1.2, 2.65, 0], color: '#c4913f' },
    },
    {
      id: 'capital',
      label: 'Column Capital (Campaniform)',
      material: 'Carved Sandstone',
      description: 'Campaniform (bell/lotus-flower) capital at top of column. Supports the architrave directly — no arch used.',
      depth: 0.4,
      geometry: { id: 'geo-cap', type: 'cylinder', args: [0.5, 0.35, 0.4, 12], position: [-1.2, 5.1, 0], color: '#b8842e' },
    },
    {
      id: 'capital-2',
      label: 'Capital (Right)',
      material: 'Carved Sandstone',
      description: 'Right column capital supporting the stone lintel.',
      depth: 0.45,
      geometry: { id: 'geo-cap2', type: 'cylinder', args: [0.5, 0.35, 0.4, 12], position: [1.2, 5.1, 0], color: '#b8842e' },
    },
    {
      id: 'architrave',
      label: 'Stone Architrave (Lintel)',
      material: 'Monolithic Granite/Sandstone',
      description: 'Massive stone architrave (lintel) spanning between columns. Spans limited by stone tensile weakness — wide column spacing impractical.',
      depth: 0.6,
      geometry: { id: 'geo-arch', type: 'box', args: [3.2, 0.5, 0.8], position: [0, 5.55, 0], color: '#a87030' },
    },
    {
      id: 'hieroglyph-relief',
      label: 'Hieroglyphic Relief Carving',
      material: 'Incised Stone Carving',
      description: 'Incised hieroglyphic reliefs on columns and walls — decorative and religious narratives covering all surfaces.',
      depth: 0.8,
      geometry: { id: 'geo-relief', type: 'box', args: [0.72, 3.0, 0.01], position: [-1.2, 2.4, 0.41], color: '#8B6914' },
    },
    {
      id: 'roof-slab',
      label: 'Flat Stone Roof Slab',
      material: 'Sandstone Roof Blocks',
      description: 'Flat stone roof blocks supported by the architrave. No vaults — post-and-lintel defines Egyptian structural vocabulary.',
      depth: 1.0,
      geometry: { id: 'geo-roof', type: 'box', args: [3.2, 0.4, 1.5], position: [0, 6.0, 0], color: '#c4913f' },
    },
  ],
  annotations: [
    {
      id: 'ann-span',
      label: 'Span Limited by Stone Tensile Strength',
      description: 'Stone weak in tension — post-and-lintel spans limited to ~5–8m max without risk of lintel fracture. Dense column grids result in hypostyle halls.',
      position: () => [0, 5.5, 1.0],
    },
    {
      id: 'ann-capital',
      label: 'Campaniform Capital',
      description: 'Lotus or papyrus capital forms — three types: papyriform (closed bud), campaniform (open bell), and palm capitals. Purely compressive load path.',
      position: () => [-2.0, 5.2, 0.8],
    },
    {
      id: 'ann-mass',
      label: 'Massive Column Proportions',
      description: 'Egyptian columns are thick relative to height — height rarely exceeds 10× diameter. Contrast with slender Greek orders.',
      position: () => [-2.5, 2.5, 0.8],
    },
  ],
  presets: [
    { label: 'Full Section', values: { cutPosition: 3.0 } },
    { label: 'Column Base', values: { cutPosition: 0.5 } },
    { label: 'Capital Zone', values: { cutPosition: 5.3 } },
    { label: 'Architrave', values: { cutPosition: 5.7 } },
  ],
}
