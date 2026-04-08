// PD 1096 — National Building Code of the Philippines (& IRR)
// Verified constants from 03_regulatory_ledger.md

export const PD_1096 = {
  // Room Requirements (IRR Rule VIII §801, Table VIII.1)
  ROOM_MIN_AREA: {
    habitable: 6.0,    // sqm
    kitchen: 3.0,       // sqm
    bathroom: 1.2,      // sqm
    laundry: 1.5,       // sqm
  },
  ROOM_MIN_DIMENSION: {
    habitable: 2.0,     // m
    kitchen: 1.5,       // m
    bathroom: 0.9,      // m
    laundry: 0.9,       // m
  },
  // Ceiling Heights (IRR Rule VII)
  CEILING_HEIGHT: {
    habitable: 2.7,     // m — §701
    mezzanine: 1.8,     // m — §702
    basement: 2.4,      // m — §703
  },
  // Firewalls (IRR Rule VIII)
  FIREWALL: {
    parapetAboveRoof: 0.40,   // m
    fromOutermostEdge: 0.60,  // m
    underEaves: 0.30,         // m
  },
  // Staircase (IRR Rule VIII)
  STAIRCASE: {
    maxRiser: 0.20,      // m
    minDoorWidth: 0.90,  // m
    minDoorHeight: 2.00, // m
    maxDoorWidth: 1.20,  // m
  },
  // Natural Light & Ventilation (IRR Rule VIII §803)
  LIGHT_VENT: {
    minWindowToFloorRatio: 0.10, // 10% of floor area
    maxRoomDepthToWindowHeadRatio: 2.5, // 2.5x rule
  },
} as const
