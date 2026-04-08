// BP 344 — Accessibility Law (& 2024 IRR)

export const BP_344 = {
  // Wheelchair Dimensions
  WHEELCHAIR: {
    minWidth: 0.80,       // m
    minLength: 1.10,      // m
    turningCircle: 1.80,  // m diameter
  },
  // Corridor (single wheelchair)
  MIN_CORRIDOR_WIDTH: 0.90, // m
  // Ramp
  RAMP: {
    maxGradient: 1 / 12,         // ratio (1:12)
    maxCrossSlope: 1 / 48,       // ratio (1:48)
    intermediateLanding: 1.80,   // m (for runs > 10.50m)
    endLanding: 1.80,            // m
    zocaloEdge: 0.10,            // m (100mm)
  },
  // Handrails
  HANDRAIL: {
    lowerHeight: 0.70,           // m
    upperHeight: 0.90,           // m
    intermediateThreshold: 3.00, // m ramp width
  },
  // Reach Range
  REACH: {
    minVertical: 0.70,    // m
    maxVertical: 1.20,    // m
    kneeUnderCounter: 0.70, // m
  },
  // Doors
  MIN_DOOR_WIDTH: 0.80,  // m (800mm)
  // Elevator
  ELEVATOR: {
    minInternal: [1.10, 1.40] as [number, number], // m [width, depth]
    maxDistanceFromEntrance: 30.0,                  // m
  },
  // Staircase
  STAIRCASE: {
    maxRiser: 0.20,       // m
  },
} as const
