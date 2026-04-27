// cat-07: PMEC: Mechanical Code
// Metadata-only registry for the 3D Lab browser.
// Do not import full module configs here; they are loaded via module-paths.ts.

import type { ModuleRegistryEntry } from '@/features/3d-lab/types/templates'

export const cat07Modules: ModuleRegistryEntry[] = [
  {
    id: "air-changes-per-hour",
    title: "Air Changes Per Hour (ACH)",
    templateType: "animated",
    subject: "pmec",
    categoryId: "MECHANICAL",
    launchPhase: 2,
    status: "ready",
    description: "Animated cross-sections showing airflow patterns and required ACH by room type: offices (3 ACH), kitchens (10 ACH), and operating rooms (15–25 ACH). Higher ACH removes contaminants and maintains air quality.",
  },
  {
    id: "cross-ventilation-analysis",
    title: "Cross-Ventilation Analysis",
    templateType: "animated",
    subject: "pmec",
    categoryId: "MECHANICAL",
    launchPhase: 2,
    status: "ready",
    description: "Natural cross-ventilation: windward openings receive positive pressure from wind, leeward openings exhaust air at negative pressure. Effective cross-ventilation requires openings on opposite walls and unobstructed flow paths.",
  },
  {
    id: "hvac-duct-layout",
    title: "HVAC Duct Layout",
    templateType: "floorplan",
    subject: "pmec",
    categoryId: "MECHANICAL",
    launchPhase: 2,
    status: "ready",
    description: "Floor plan with supply and return duct routing, AHU placement, and duct velocity compliance per PMEC (Philippine Mechanical Engineering Code).",
  },
  {
    id: "machine-room-layout",
    title: "Machine Room Layout",
    templateType: "floorplan",
    subject: "pmec",
    categoryId: "MECHANICAL",
    launchPhase: 2,
    status: "ready",
    description: "Mechanical room plan with chiller, AHU, and pump placement, clearance requirements, service walkways, and piping routes per PMEC.",
  },
  {
    id: "refrigeration-cycle",
    title: "Vapor-Compression Refrigeration Cycle",
    templateType: "animated",
    subject: "pmec",
    categoryId: "MECHANICAL",
    launchPhase: 2,
    status: "ready",
    description: "The four stages of the vapor-compression refrigeration cycle: compression (low → high pressure), condensation (heat rejection), expansion (pressure drop), and evaporation (heat absorption / cooling effect).",
  },
  {
    id: "split-ac-cutaway",
    title: "Split AC System Cutaway",
    templateType: "cutaway",
    subject: "pmec",
    categoryId: "MECHANICAL",
    launchPhase: 2,
    status: "ready",
    description: "Split-type air conditioning system cross-section showing indoor evaporator unit, outdoor condenser unit, refrigerant lines (liquid and suction), and condensate drain per PMEC.",
  },
]
