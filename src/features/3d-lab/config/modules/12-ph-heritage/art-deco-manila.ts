// src/app/dashboard/3d-lab/_config/modules/art-deco-manila.ts
import type { CutawaySectionConfig } from '@/features/3d-lab/types/templates'

export const artDecoManilaConfig: CutawaySectionConfig = {
  id: 'art-deco-manila',
  title: 'Art Deco Manila',
  description:
    'Philippine Art Deco architecture (1920s–1940s) — Metropolitan Theater style, geometric ornament, stepped profile, zigzag motifs, and tropical adaptations.',
  subject: 'history',
  cutAxis: 'y',
  camera: { position: [4.5, 4, 4.5], fov: 42 },
  layers: [
    {
      id: 'rc-frame',
      label: 'RC Frame Structure',
      material: 'Reinforced Concrete Frame',
      description: 'Reinforced concrete frame — Art Deco period coincided with widespread adoption of RC in Philippines. Frame allows expressive facade independent of structure.',
      depth: 0,
      geometry: { id: 'geo-rc', type: 'box', args: [0.4, 8.0, 0.4], position: [-1.5, 4.0, 0], color: '#b0b0b0' },
    },
    {
      id: 'stepped-facade',
      label: 'Stepped / Setback Profile',
      material: 'Stucco-clad RC',
      description: 'Characteristic Art Deco stepped setback profile — vertical fins and horizontal banding in stepped composition. Metropolitan Theater (Juan Nakpil, 1931) exemplifies this.',
      depth: 0.2,
      geometry: { id: 'geo-step1', type: 'box', args: [3.5, 0.4, 1.0], position: [0, 6.5, 0], color: '#e5e7eb' },
    },
    {
      id: 'stepped-facade-2',
      label: 'Upper Setback',
      material: 'Stucco-clad RC',
      description: 'Second setback tier — progressively narrowing floors create the characteristic Art Deco silhouette.',
      depth: 0.25,
      geometry: { id: 'geo-step2', type: 'box', args: [2.5, 0.4, 1.0], position: [0, 7.5, 0], color: '#d4d4d4' },
    },
    {
      id: 'geometric-ornament',
      label: 'Geometric Bas-Relief Ornament',
      material: 'Cast Concrete / Terracotta',
      description: 'Geometric sunburst, chevron, zigzag, and stylized floral patterns — cast in concrete or terracotta. Philippine Art Deco added local flora (sampaguita, palay) to international vocabulary.',
      depth: 0.4,
      geometry: { id: 'geo-ornament', type: 'box', args: [0.06, 5.0, 0.9], position: [-1.7, 3.5, 0.55], color: '#f5f0e8' },
    },
    {
      id: 'vertical-fins',
      label: 'Vertical Pilasters / Fins',
      material: 'Concrete / Stucco',
      description: 'Vertical pilasters or fins emphasize height and create rhythmic façade grid — characteristic of Streamline Moderne variant also present in Manila.',
      depth: 0.55,
      geometry: { id: 'geo-fin', type: 'box', args: [0.15, 7.0, 0.15], position: [0.5, 4.5, 0.5], color: '#e8e8e8' },
    },
    {
      id: 'arcade-ground',
      label: 'Ground Floor Arcade',
      material: 'Concrete Arcade',
      description: 'Tropical adaptation — shaded arcade at ground floor provides pedestrian shelter from sun and rain. Philippine Art Deco buildings often have colonnaded ground floors.',
      depth: 0.7,
      geometry: { id: 'geo-arcade', type: 'cylinder', args: [0.2, 0.2, 2.5, 8], position: [-1.0, 1.25, 0.4], color: '#d4d4d4' },
    },
    {
      id: 'zigzag-frieze',
      label: 'Zigzag Cornice Frieze',
      material: 'Cast Concrete Frieze',
      description: 'Zigzag (chevron) cornice frieze — quintessential Art Deco motif. Speed, modernity, and machine-age ornament translated into architecture.',
      depth: 0.85,
      geometry: { id: 'geo-zig', type: 'box', args: [3.5, 0.3, 0.4], position: [0, 5.8, 0.3], color: '#c4c4c4' },
    },
  ],
  annotations: [
    {
      id: 'ann-nakpil',
      label: 'Juan Nakpil — Metropolitan Theater',
      description: 'Juan Nakpil\'s Metropolitan Theater (1931, Manila) — premier Philippine Art Deco landmark. Tropical Art Deco combining international style with Philippine flora motifs and arcade.',
      position: () => [2.5, 7.0, 0.8],
    },
    {
      id: 'ann-tropical',
      label: 'Tropical Adaptation',
      description: 'Philippine Art Deco adapted for climate: deep arcades, shading devices, and open ventilation details modify the international Art Deco vocabulary.',
      position: () => [-2.5, 1.5, 0.8],
    },
    {
      id: 'ann-period',
      label: '1920s–1940s Period',
      description: 'Art Deco in Philippines flourished 1925–1942 — government buildings, cinemas, and commercial blocks in Manila, Iloilo, and Cebu. Post-war rebuilding replaced many.',
      position: () => [2.5, 3.5, 0.8],
    },
  ],
  presets: [
    { label: 'Full Facade', values: { cutPosition: 4.5 } },
    { label: 'Ground Arcade', values: { cutPosition: 1.0 } },
    { label: 'Ornament Zone', values: { cutPosition: 3.5 } },
    { label: 'Stepped Crown', values: { cutPosition: 7.5 } },
  ],
}

