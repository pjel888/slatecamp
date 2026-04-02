<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-02 | Updated: 2026-04-02 -->

# lot-geometry

## Purpose

The `lot-geometry` directory implements computational geometry utilities for lot surveying and polygon manipulation: bearing conversions, polygon construction from survey segments, Bowditch closure adjustment for coordinate reconciliation, and setback inset calculation. Used by the 3D Lab to render accurate lot geometry with survey data as input.

## Key Files

| File | Description |
|------|-------------|
| `index.ts` | Barrel exports: bearing conversions, polygon builders, Bowditch adjustment, inset calculation |
| `bearing.ts` | Bearing-to-azimuth conversion (bearing 0° = North, azimuth 0° = East). Polar-to-Cartesian projection. |
| `polygon.ts` | Polygon construction: `buildPolygonFromSegments()` from survey data, `buildRectangularPolygon()` for simple lots |
| `bowditch.ts` | Bowditch method: coordinate closure adjustment (minimizes error accumulation from survey measurements) |
| `inset.ts` | Setback inset: shrink polygon by per-side setback distances (for AMBF visualization) |
| `__tests__/lot-geometry.test.ts` | Unit tests for bearing conversion, closure, and inset calculations |

## For AI Agents

### Working In This Directory

**Survey Data Format:**
- Bearings expressed as cardinal compass directions: "N 30° E", "S 45° 30' W", etc.
- Distances in meters.
- Polygon vertices stored as {x, z} (x = East–West, z = North–South in 3D space).
- Vertices ordered counter-clockwise (CCW convention).

**Bearing Conversion Rules:**
- Bearing 0° = North (positive z-axis).
- Bearing 90° = East (positive x-axis).
- Bearings increase clockwise.
- Azimuth 0° = East (positive x-axis).
- Azimuth 90° = South (negative z-axis).
- Conversion: `azimuth = (450 - bearing) % 360`.

**Bowditch Closure Adjustment:**
- Input: survey segments with bearings and distances.
- Calculation: compute coordinates from bearings, measure closure error (discrepancy between computed final point and actual closure).
- Adjustment: proportionally distribute error back to each coordinate based on segment length.
- Output: adjusted coordinates with minimal closure error.
- Used to reconcile hand-measured surveys with ground truth.

**Setback Inset:**
- Input: polygon vertices and per-side setback distances (front, rear, left, right).
- Calculation: parallel inset of each edge by setback distance.
- Output: new polygon representing buildable area (AMBF boundary).
- Edge cases: convex vs. concave vertices require different handling (offset direction).

### Common Patterns

**Converting Bearing to Azimuth:**
```typescript
import { bearingToAzimuthRad } from '@/lib/lot-geometry'

const bearing = 'N 45 E' // 45° east of north
const azimuthRad = bearingToAzimuthRad(bearing)
```

**Polar to Cartesian:**
```typescript
import { polarToCartesian } from '@/lib/lot-geometry'

const azimuth = Math.PI / 4 // 45°
const distance = 30 // meters
const { x, z } = polarToCartesian(azimuth, distance)
```

**Building Polygon from Survey Segments:**
```typescript
import { buildPolygonFromSegments } from '@/lib/lot-geometry'

const segments = [
  { bearing: 'N 0°', distance: 30 },  // North 30m
  { bearing: 'E 90°', distance: 40 }, // East 40m
  { bearing: 'S 0°', distance: 30 },  // South 30m
  { bearing: 'W 90°', distance: 40 }, // West 40m
]
const polygon = buildPolygonFromSegments(segments)
// polygon.vertices: [{x: 0, z: 0}, {x: 40, z: 0}, {x: 40, z: -30}, {x: 0, z: -30}]
```

**Bowditch Adjustment:**
```typescript
import { bowditchAdjust } from '@/lib/lot-geometry'

const segments = [
  { bearing: 'N 0°', distance: 30 },
  { bearing: 'E 90°', distance: 40 },
  { bearing: 'S 0°', distance: 29.8 }, // Slight measurement error
  { bearing: 'W 90°', distance: 39.7 }, // Slight measurement error
]
const adjusted = bowditchAdjust(segments)
// adjusted coordinates sum to exact closure
```

**Setback Inset:**
```typescript
import { computeSetbackInsetPolygon } from '@/lib/lot-geometry'

const polygon = { vertices: [{x: 0, z: 0}, {x: 40, z: 0}, {x: 40, z: -30}, {x: 0, z: -30}] }
const setbacks = { front: 5, rear: 3, left: 2, right: 2 }
const ambfPolygon = computeSetbackInsetPolygon(polygon, setbacks)
// ambfPolygon represents the buildable footprint area
```

## Dependencies

### Internal

- **Bearing/Azimuth Types:** Cardinal directions parsed from strings (e.g., "N 30° E").
- **Polygon Types:** {x, z} Cartesian coordinates.

### External

- **Zero external npm dependencies.** Pure TypeScript for deterministic geometry calculations.
- **Target runtime:** Node.js or browser (3D Lab visualization).

---

**Last Updated:** 2026-04-02

**For questions about survey geometry, consult `.claude/agents/ph-arch-professional-context.md` in the repository root.**
