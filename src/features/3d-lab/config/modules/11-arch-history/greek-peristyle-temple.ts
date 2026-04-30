// src/features/3d-lab/config/modules/greek-peristyle-temple.ts
// Greek Peristyle Temple — Architectural History
import type { ExplodedAssemblyConfig } from '@/features/3d-lab/types/templates'

function yOff(v: number): [number, number, number] { return [0, v, 0] }

export const greekPeristyleTempleConfig: ExplodedAssemblyConfig = {
  id: 'greek-peristyle-temple',
  title: 'Greek Peristyle Temple',
  description: 'Exploded assembly of a Greek peristyle temple (hexastyle). Shows three-stepped crepidoma, Doric peristyle colonnade, pronaos, cella (naos), opisthodomos, and pediment.',
  subject: 'history',
  parts: [
    {
      id: 'gpt-krepis-1',
      label: 'Krepis — Step 1 (Stylobate)',
      description: 'Top step (stylobate) of the three-step platform. Column drums rest directly on the stylobate — no individual bases in Greek Doric.',
      geometry: { id: 'gpt-krepis-1-geo', type: 'box', position: [0, 0.04, 0], args: [2.4, 0.08, 1.2], color: '#d4d4d8' },
      explodeOffset: yOff(0),
    },
    {
      id: 'gpt-krepis-2',
      label: 'Krepis — Step 2 (Stereobate)',
      description: 'Middle step. Three-stepped krepidoma provides both visual platform and drainage slope.',
      geometry: { id: 'gpt-krepis-2-geo', type: 'box', position: [0, -0.08, 0], args: [2.55, 0.08, 1.35], color: '#a1a1aa' },
      explodeOffset: yOff(-0.2),
    },
    {
      id: 'gpt-krepis-3',
      label: 'Krepis — Step 3 (Euthynteria)',
      description: 'Bottom step and levelling course. Sets the horizontal datum for the entire temple.',
      geometry: { id: 'gpt-krepis-3-geo', type: 'box', position: [0, -0.2, 0], args: [2.7, 0.08, 1.5], color: '#94a3b8' },
      explodeOffset: yOff(-0.4),
    },
    {
      id: 'gpt-col-front-1',
      label: 'Front Column 1 (Peristyle)',
      description: 'Doric peristyle column. Hexastyle = 6 columns across front. Columns have 20 flutes, no base.',
      geometry: { id: 'gpt-col-front-1-geo', type: 'cylinder', position: [-1.0, 0.55, -0.5], args: [0.07, 0.06, 0.9, 16], color: '#e4e4e7' },
      explodeOffset: [-1.2, 0.3, -0.7],
    },
    {
      id: 'gpt-col-front-2',
      label: 'Front Column 2',
      description: 'Second front peristyle column. Intercolumniation = column spacing centre-to-centre.',
      geometry: { id: 'gpt-col-front-2-geo', type: 'cylinder', position: [-0.4, 0.55, -0.5], args: [0.07, 0.06, 0.9, 16], color: '#e4e4e7' },
      explodeOffset: [-0.5, 0.3, -0.7],
    },
    {
      id: 'gpt-col-front-centre',
      label: 'Front Column 3 (Centre)',
      description: 'Centre-left front column. No column at exact centre in hexastyle (even number).',
      geometry: { id: 'gpt-col-front-centre-geo', type: 'cylinder', position: [0.2, 0.55, -0.5], args: [0.07, 0.06, 0.9, 16], color: '#e4e4e7' },
      explodeOffset: [0.3, 0.3, -0.7],
    },
    {
      id: 'gpt-cella',
      label: 'Cella (Naos)',
      description: 'Inner sanctuary housing the cult statue. Surrounded by the peristyle colonnade. Accessible only to priests.',
      geometry: { id: 'gpt-cella-geo', type: 'box', position: [0, 0.35, 0], args: [1.2, 0.6, 0.7], color: '#d4d4d8', opacity: 0.75, transparent: true },
      explodeOffset: yOff(0.3),
    },
    {
      id: 'gpt-pronaos',
      label: 'Pronaos (Entrance Porch)',
      description: 'Front vestibule with two columns in antis. Transition space from exterior colonnade to cella.',
      geometry: { id: 'gpt-pronaos-geo', type: 'box', position: [0, 0.35, -0.4], args: [0.8, 0.6, 0.25], color: '#a1a1aa', opacity: 0.7, transparent: true },
      explodeOffset: [0, 0.3, -0.6],
    },
    {
      id: 'gpt-entablature',
      label: 'Entablature (Doric)',
      description: 'Doric entablature: plain architrave, triglyph-metope frieze, projecting cornice. Runs continuously around all four sides.',
      geometry: { id: 'gpt-entablature-geo', type: 'box', position: [0, 0.75, 0], args: [2.4, 0.25, 1.2], color: '#94a3b8' },
      explodeOffset: yOff(0.6),
    },
    {
      id: 'gpt-pediment',
      label: 'Pediment (Tympanum)',
      description: 'Triangular gable end (pediment) with tympanum for sculptural group. Low pitch ~13–15°. Acroteria at apex and corners.',
      geometry: { id: 'gpt-pediment-geo', type: 'cone', position: [0, 1.12, -0.5], args: [1.2, 0.4, 4], color: '#d4d4d8' },
      explodeOffset: yOff(0.9),
    },
  ],
  camera: { position: [4, 3, 4], fov: 45 },
}

