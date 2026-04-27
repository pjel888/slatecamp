// cat-14: Professional Practice & Specs
// Metadata-only registry for the 3D Lab browser.
// Do not import full module configs here; they are loaded via module-paths.ts.

import type { ModuleRegistryEntry } from '@/features/3d-lab/types/templates'

export const cat14Modules: ModuleRegistryEntry[] = [
  {
    id: "contract-document-hierarchy",
    title: "Contract Document Hierarchy",
    templateType: "exploded",
    subject: "prof-practice",
    categoryId: "PROF_PRACTICE",
    launchPhase: 3,
    status: "ready",
    description: "Layered stack showing the legal hierarchy of construction contract documents: from Owner-Architect Agreement at the apex down through General Conditions, Specifications, and Drawings.",
  },
  {
    id: "csi-masterformat-explorer",
    title: "CSI MasterFormat Explorer",
    templateType: "parametric",
    subject: "specs",
    categoryId: "PROF_PRACTICE",
    launchPhase: 3,
    status: "ready",
    description: "3D organizational chart of CSI MasterFormat divisions used in Philippine construction specifications and project manuals.",
  },
  {
    id: "door-schedule-configurator",
    title: "Door Schedule Configurator",
    templateType: "parametric",
    subject: "pd-1096",
    categoryId: "PROF_PRACTICE",
    launchPhase: 3,
    status: "ready",
    description: "Door types, dimensions, materials, and hardware per PD 1096 and BP 344 with accessibility and fire code compliance checks.",
  },
  {
    id: "project-delivery-methods",
    title: "Project Delivery Methods",
    templateType: "animated",
    subject: "prof-practice",
    categoryId: "PROF_PRACTICE",
    launchPhase: 3,
    status: "ready",
    description: "Animated comparison of the four primary project delivery methods: Design-Bid-Build, Design-Build, CM at Risk, and IPD. Each step illustrates the contractual relationships and phase overlaps.",
  },
]
