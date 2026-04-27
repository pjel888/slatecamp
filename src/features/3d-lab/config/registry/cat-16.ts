// cat-16: Site Development & Parking
// Metadata-only registry for the 3D Lab browser.
// Do not import full module configs here; they are loaded via module-paths.ts.

import type { ModuleRegistryEntry } from '@/features/3d-lab/types/templates'

export const cat16Modules: ModuleRegistryEntry[] = [
  {
    id: "carport-abutment-rules",
    title: "Carport Abutment Rules",
    templateType: "parametric",
    subject: "pd-1096",
    categoryId: "SITE_DEV",
    launchPhase: 3,
    status: "ready",
    description: "Carport model: max 3.20m height, solid walls max 1.50m, perforated blocks required above per PD 1096 Rule VII §708.",
  },
  {
    id: "parking-layout",
    title: "Parking Layout",
    templateType: "floorplan",
    subject: "pd-1096",
    categoryId: "SITE_DEV",
    launchPhase: 3,
    status: "ready",
    description: "Parking floor plan with vehicle stall types, drive aisle widths, and circulation paths per PD 1096 National Building Code requirements.",
  },
  {
    id: "parking-slot-dimensions",
    title: "Parking Slot Dimensions",
    templateType: "parametric",
    subject: "pd-1096",
    categoryId: "SITE_DEV",
    launchPhase: 3,
    status: "ready",
    description: "Parking floor with vehicle type toggles showing car, parallel, truck, and PWD slot dimensions per PD 1096 Rule XIX.",
  },
  {
    id: "solar-orientation-painter",
    title: "Solar Orientation Painter",
    templateType: "parametric",
    subject: "pd-1096",
    categoryId: "SITE_DEV",
    launchPhase: 1,
    status: "ready",
    description: "Sun path and shadow analysis for building orientation per PD 1096 §803 natural lighting requirements. Adjust time, month, and building orientation to optimize daylight.",
  },
]
