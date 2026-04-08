// NSCP — National Structural Code of the Philippines
// Minimal placeholder — expand when Cat 04 modules are built

export const NSCP = {
  SEISMIC_ZONES: ['2', '4'] as const,
  SOIL_PROFILES: ['SA', 'SB', 'SC', 'SD', 'SE', 'SF'] as const,
  // Seismic Importance Factor
  IMPORTANCE_FACTOR: {
    essential: 1.5,
    hazardous: 1.25,
    special: 1.0,
    standard: 1.0,
  },
} as const
