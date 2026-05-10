// Centralized scene colors for 3D Lab modules.
// Meshes inside <Canvas> must use hex strings (not Tailwind tokens).
// DOM overlays should use Tailwind classes instead.

export const SCENE_COLORS = {
  // Shared viewport environment
  skyWhite: '#ffffff',
  groundGridCell: '#d1d5db',
  groundGridSection: '#94a3b8',

  // Ground planes
  groundLight: '#f1f5f9',
  groundNeutral: '#e5e7eb',
  groundFloorPlan: '#e4e4e7',

  // Building materials
  buildingPrimary: '#1B3FC4',
  buildingPrimaryDark: '#1535A8',
  buildingViolation: '#D64545',
  buildingCompliant: '#2D9F6F',

  // Setback / zoning
  setbackZone: '#bfdbfe',
  propertyLine: '#374151',
  rrowSurface: '#d1d5db',
  neighborLot: '#f3f4f6',
  neighborBuilding: '#9ca3af',

  // Classical Orders
  stoneLight: '#dde1ea',
  stoneMedium: '#c8cdd6',
  stoneDark: '#b8bdc8',
  stoneCapital: '#c4c9d4',
  stoneEntablature: '#ced2db',
  stoneCornice: '#c2c7d1',
  stoneNecking: '#a8adb6',

  // Interactive
  hoverEmissive: '#3b82f6',
  activeEmissive: '#3b82f6',

  // Human silhouette
  humanBody: '#6b7280',

  // Cut plane
  cutPlaneRed: '#D64545',

  // BHL lines
  bhlCompliant: '#2D9F6F',
  bhlViolation: '#D64545',

  // Fixture defaults
  fixtureExit: '#2D9F6F',
  fixtureSprinkler: '#1B3FC4',
  fixtureDefault: '#71717a',

  // Dead-end zone
  deadEndZone: '#D64545',

  // Floor plates
  floorPlateEdge: '#1535A8',
} as const
