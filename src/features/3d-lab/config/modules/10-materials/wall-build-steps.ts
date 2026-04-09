// src/features/3d-lab/config/modules/10-materials/wall-build-steps.ts
// Build sequence step definitions per core type

import type { CoreType } from './wall-types'

export interface BuildStep {
  id: string
  label: string
  description: string
  /** Which geometry IDs are visible at this step (cumulative — step N shows all IDs from steps 1..N) */
  visibleIds: string[]
}

const CHB_STEPS: BuildStep[] = [
  {
    id: 'chb-step-1',
    label: '1. Foundation / Floor Slab',
    description: 'The floor slab provides the bearing surface for the wall. Vertical rebar dowels protrude from the slab.',
    visibleIds: ['ground'],
  },
  {
    id: 'chb-step-2',
    label: '2. First Course (Mortar Bed)',
    description: 'A mortar bed is laid on the slab. The first course of CHB is placed, aligning with the rebar dowels.',
    visibleIds: ['ground', 'core-chb-simplified', 'core-chb-blocks', 'core-chb-boundary'],
  },
  {
    id: 'chb-step-3',
    label: '3. Block Coursing + Mortar',
    description: 'Subsequent courses are laid in running bond pattern. 10mm mortar bed joints and head joints between each block.',
    visibleIds: ['ground', 'core-chb-simplified', 'core-chb-blocks', 'core-chb-boundary'],
  },
  {
    id: 'chb-step-4',
    label: '4. Vertical Rebar + Grout',
    description: 'Vertical rebar (10-16mm) is placed in hollow cells at 600-1200mm intervals. Grout fills the reinforced cells.',
    visibleIds: ['ground', 'core-chb-simplified', 'core-chb-blocks', 'core-chb-boundary', 'struct-chb-rebar-v', 'struct-chb-grout'],
  },
  {
    id: 'chb-step-5',
    label: '5. Bond Beams + Horizontal Rebar',
    description: 'Horizontal rebar is placed in bond beam courses every 3rd or 4th course. These provide seismic resistance.',
    visibleIds: ['ground', 'core-chb-simplified', 'core-chb-blocks', 'core-chb-boundary', 'struct-chb-rebar-v', 'struct-chb-grout', 'struct-chb-rebar-h'],
  },
  {
    id: 'chb-step-6',
    label: '6. Plaster',
    description: 'Cement-sand plaster (12.7mm, 1:3 mix) is applied to the block face. Must cure 7 days before next layer.',
    visibleIds: ['ground', 'core-chb-simplified', 'core-chb-blocks', 'core-chb-boundary', 'struct-chb-rebar-v', 'struct-chb-grout', 'struct-chb-rebar-h', 'layer-front-plaster'],
  },
  {
    id: 'chb-step-7',
    label: '7. Skim Coat + Primer',
    description: 'Skim coat (3mm) levels the plaster surface. Primer seals the surface for paint adhesion.',
    visibleIds: ['ground', 'core-chb-simplified', 'core-chb-blocks', 'core-chb-boundary', 'struct-chb-rebar-v', 'struct-chb-grout', 'struct-chb-rebar-h', 'layer-front-plaster', 'layer-front-skim', 'layer-front-primer'],
  },
  {
    id: 'chb-step-8',
    label: '8. Paint (Finish)',
    description: 'Two coats of paint complete the wall. Coverage: 8-10 sqm per liter per coat.',
    visibleIds: ['ground', 'core-chb-simplified', 'core-chb-blocks', 'core-chb-boundary', 'struct-chb-rebar-v', 'struct-chb-grout', 'struct-chb-rebar-h', 'layer-front-plaster', 'layer-front-skim', 'layer-front-primer', 'layer-front-paint', 'thickness-edge'],
  },
]

const DRYWALL_STEPS: BuildStep[] = [
  {
    id: 'drywall-step-1',
    label: '1. Floor Slab Preparation',
    description: 'The floor slab is marked with the partition layout line. Power-actuated fasteners are prepared.',
    visibleIds: ['ground'],
  },
  {
    id: 'drywall-step-2',
    label: '2. Bottom Track Installation',
    description: 'U-track is fixed to the floor slab with power-actuated fasteners at 600mm max spacing.',
    visibleIds: ['ground', 'struct-drywall-bottom-track'],
  },
  {
    id: 'drywall-step-3',
    label: '3. Top Track + C-Studs',
    description: 'Top U-track is fixed to the ceiling. C-studs are inserted into tracks at 400mm or 600mm spacing.',
    visibleIds: ['ground', 'struct-drywall-bottom-track', 'struct-drywall-top-track', 'struct-drywall-studs'],
  },
  {
    id: 'drywall-step-4',
    label: '4. Horizontal Bridging',
    description: 'Flat strap bridging runs through stud knockouts at 1200mm vertical intervals to prevent stud rotation.',
    visibleIds: ['ground', 'struct-drywall-bottom-track', 'struct-drywall-top-track', 'struct-drywall-studs', 'struct-drywall-bridging'],
  },
  {
    id: 'drywall-step-5',
    label: '5. Insulation (Optional)',
    description: 'Fiberglass batt or mineral wool insulation is placed between studs for acoustic and thermal performance.',
    visibleIds: ['ground', 'struct-drywall-bottom-track', 'struct-drywall-top-track', 'struct-drywall-studs', 'struct-drywall-bridging', 'struct-drywall-insulation'],
  },
  {
    id: 'drywall-step-6',
    label: '6. Gypsum Board (Front)',
    description: 'Gypsum board is screwed to stud flanges — 300mm on edges, 400mm in field. Type X for fire rating.',
    visibleIds: ['ground', 'struct-drywall-bottom-track', 'struct-drywall-top-track', 'struct-drywall-studs', 'struct-drywall-bridging', 'struct-drywall-insulation', 'struct-drywall-board-front'],
  },
  {
    id: 'drywall-step-7',
    label: '7. Gypsum Board (Back) + Taping',
    description: 'Back board is installed if both sides. Paper tape and 3 coats of joint compound finish all joints.',
    visibleIds: ['ground', 'struct-drywall-bottom-track', 'struct-drywall-top-track', 'struct-drywall-studs', 'struct-drywall-bridging', 'struct-drywall-insulation', 'struct-drywall-board-front', 'struct-drywall-board-back'],
  },
  {
    id: 'drywall-step-8',
    label: '8. Primer + Paint (Finish)',
    description: 'Primer seals the gypsum surface. Two coats of paint complete the partition.',
    visibleIds: ['ground', 'struct-drywall-bottom-track', 'struct-drywall-top-track', 'struct-drywall-studs', 'struct-drywall-bridging', 'struct-drywall-insulation', 'struct-drywall-board-front', 'struct-drywall-board-back', 'layer-front-primer', 'layer-front-paint', 'thickness-edge'],
  },
]

// Generic steps for types without detailed structural representation
const GENERIC_STEPS: BuildStep[] = [
  {
    id: 'generic-step-1',
    label: '1. Foundation',
    description: 'Floor slab provides the bearing surface.',
    visibleIds: ['ground'],
  },
  {
    id: 'generic-step-2',
    label: '2. Core Wall',
    description: 'The core wall material is constructed or installed.',
    visibleIds: ['ground', 'wall-core'],
  },
  {
    id: 'generic-step-3',
    label: '3. Plaster (if applicable)',
    description: 'Cement-sand plaster is applied to the wall face.',
    visibleIds: ['ground', 'wall-core', 'layer-front-plaster'],
  },
  {
    id: 'generic-step-4',
    label: '4. Skim Coat',
    description: 'Skim coat levels the surface for painting.',
    visibleIds: ['ground', 'wall-core', 'layer-front-plaster', 'layer-front-skim'],
  },
  {
    id: 'generic-step-5',
    label: '5. Primer',
    description: 'Primer seals the surface for paint adhesion.',
    visibleIds: ['ground', 'wall-core', 'layer-front-plaster', 'layer-front-skim', 'layer-front-primer'],
  },
  {
    id: 'generic-step-6',
    label: '6. Paint (Finish)',
    description: 'Two coats of paint complete the wall.',
    visibleIds: ['ground', 'wall-core', 'layer-front-plaster', 'layer-front-skim', 'layer-front-primer', 'layer-front-paint', 'thickness-edge'],
  },
]

export const getBuildSteps = (coreType: CoreType): BuildStep[] => {
  switch (coreType) {
    case 'chb':
      return CHB_STEPS
    case 'drywall':
      return DRYWALL_STEPS
    case 'plywood':
    case 'cement-board':
    case 'brick':
    case 'solid-concrete':
    case 'existing-wall':
      return GENERIC_STEPS
    default: {
      const _exhaustive: never = coreType
      throw new Error(`Unknown core type: ${_exhaustive}`)
    }
  }
}
