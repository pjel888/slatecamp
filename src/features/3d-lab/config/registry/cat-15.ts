// cat-15: Estimating & Quantity Surveying
// Metadata-only registry for the 3D Lab browser.
// Do not import full module configs here; they are loaded via module-paths.ts.

import type { ModuleRegistryEntry } from '@/features/3d-lab/types/templates'

export const cat15Modules: ModuleRegistryEntry[] = [
  {
    id: "earthwork-volume",
    title: "Earthwork Volume",
    templateType: "parametric",
    subject: "estimating",
    categoryId: "ESTIMATING",
    launchPhase: 3,
    status: "ready",
    description: "Cut-and-fill terrain model with volume calculation, batter slopes, and spoil pile visualization for estimating earthwork quantities.",
  },
  {
    id: "quantity-takeoff-room",
    title: "Quantity Takeoff — Room",
    templateType: "parametric",
    subject: "estimating",
    categoryId: "ESTIMATING",
    launchPhase: 3,
    status: "ready",
    description: "Room model calculating floor area, wall area, and material quantities (concrete, CHB, rebar, paint) for cost estimation.",
  },
  {
    id: "calculator-flooring",
    title: "Flooring / Tile Visualizer",
    templateType: "calculator",
    subject: "Estimating & Quantity Surveying",
    categoryId: "ESTIMATING",
    launchPhase: 1,
    status: "built",
    description: "Estimate tiles with 3D pattern preview and waste calculation",
  },
  {
    id: "calculator-paint",
    title: "Paint Visualizer",
    templateType: "calculator",
    subject: "Estimating & Quantity Surveying",
    categoryId: "ESTIMATING",
    launchPhase: 1,
    status: "built",
    description: "Calculate paint for walls and ceilings with 3D room preview",
  },
  {
    id: "calculator-drywall",
    title: "Drywall Partition Estimator",
    templateType: "calculator",
    subject: "Estimating & Quantity Surveying",
    categoryId: "ESTIMATING",
    launchPhase: 1,
    status: "built",
    description: "Estimate studs, boards, and tracks for drywall partitions",
  },
  {
    id: "calculator-chb",
    title: "CHB Wall Builder",
    templateType: "calculator",
    subject: "Estimating & Quantity Surveying",
    categoryId: "ESTIMATING",
    launchPhase: 2,
    status: "built",
    description: "Estimate hollow blocks, mortar, cement, and rebar for masonry walls",
  },
]
