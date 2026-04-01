// src/lib/lot-geometry/index.ts
// ─── Barrel export for lot geometry library ────────────────────────────────

export { bearingToAzimuthRad, polarToCartesian, formatBearing } from './bearing'
export { buildPolygonFromSegments, buildRectangularPolygon } from './polygon'
export { bowditchAdjust } from './bowditch'
export { computeSetbackInsetPolygon } from './inset'
