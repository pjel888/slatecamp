// RA 9514 — Fire Code of the Philippines (& IRR)

export const RA_9514 = {
  // Travel Distance (IRR Rule 10)
  TRAVEL_DISTANCE: {
    noSprinkler: {
      assembly: 46, business: 46, mercantile: 30,
      industrial: 31, educational: 46, residential: 46,
    },
    sprinklered: {
      assembly: 61, business: 61, mercantile: 46,
      industrial: 46, educational: 61, residential: 61,
    },
  },
  // Dead-End Corridors (IRR Rule 10)
  DEAD_END_MAX: {
    assembly: 6, business: 6, mercantile: 15,
    industrial: 15, educational: 6, residential: 15,
  },
  // Required Exits (IRR Rule 10)
  REQUIRED_EXITS: [
    { maxOccupants: 500, minExits: 2 },
    { maxOccupants: 1000, minExits: 3 },
    { maxOccupants: Infinity, minExits: 4 },
  ],
  // Occupant Load Factors (sqm per person) — IRR Rule 10
  OCCUPANT_LOAD_FACTOR: {
    assembly: 0.65, business: 9.3, educational: 1.85,
    residential: 18.6, mercantile: 2.8, industrial: 9.3,
  },
  // High-Rise Definition (IRR Rule 3)
  HIGH_RISE_THRESHOLD_M: 15,
  // Fire Extinguisher (IRR)
  EXTINGUISHER_MAX_TRAVEL_M: 23,
} as const
