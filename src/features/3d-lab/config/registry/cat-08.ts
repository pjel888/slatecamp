// cat-08: Vertical Circulation & Transport
// Metadata-only registry for the 3D Lab browser.
// Do not import full module configs here; they are loaded via module-paths.ts.

import type { ModuleRegistryEntry } from '@/features/3d-lab/types/templates'

export const cat08Modules: ModuleRegistryEntry[] = [
  {
    id: "elevator-hoistway",
    title: "Elevator Hoistway",
    templateType: "cutaway",
    subject: "pmec",
    categoryId: "VERTICAL",
    launchPhase: 2,
    status: "ready",
    description: "Elevator hoistway cross-section — cab 1100mm wide, 610mm pit clearance, overhead machine room, fire-rated walls per PMEC.",
  },
  {
    id: "escalator-section",
    title: "Escalator Section",
    templateType: "cutaway",
    subject: "pmec",
    categoryId: "VERTICAL",
    launchPhase: 2,
    status: "ready",
    description: "Escalator cross-section — 30° inclination, draft curtain 300mm, sprinklers within 600mm of curtain, truss, steps, handrail per PMEC.",
  },
  {
    id: "handrail-requirements",
    title: "Handrail Requirements",
    templateType: "parametric",
    subject: "pd-1096",
    categoryId: "VERTICAL",
    launchPhase: 2,
    status: "ready",
    description: "Stairway section with handrail heights 800–900mm above nosing, 38mm wall clearance, dual rails per PD 1096 Rule VIII §809.",
  },
  {
    id: "stairway-code-compliance",
    title: "Stairway Code Compliance",
    templateType: "parametric",
    subject: "Building Technology",
    categoryId: "VERTICAL",
    launchPhase: 2,
    status: "ready",
    description: "Multi-law 3D stair compliance explorer — PD 1096, BP 220, BP 344, and RA 9514 evaluated in parallel with conflict detection.",
  },
]
