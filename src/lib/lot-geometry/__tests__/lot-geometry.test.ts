import { describe, test, expect } from 'bun:test'
import { bearingToAzimuthRad, polarToCartesian } from '../bearing'
import { buildPolygonFromSegments, buildRectangularPolygon } from '../polygon'
import { bowditchAdjust } from '../bowditch'
import { computeSetbackInsetPolygon } from '../inset'
import type { LotSegment, SurveyorBearing } from '@/types/lot'

// ─── Helper ─────────────────────────────────────────────────────────────────

function makeBearing(base: 'N' | 'S', deg: number, min: number, sec: number, turn: 'E' | 'W'): SurveyorBearing {
  return { base, degrees: deg, minutes: min, seconds: sec, turn }
}

function makeSegment(base: 'N' | 'S', deg: number, turn: 'E' | 'W', dist: number, tag: 'front' | 'rear' | 'left_side' | 'right_side', id?: string): LotSegment {
  return { id: id ?? `seg-${Math.random()}`, bearing: makeBearing(base, deg, 0, 0, turn), distance: dist, boundaryTag: tag }
}

// ─── Bearing Conversion ─────────────────────────────────────────────────────

describe('bearingToAzimuthRad', () => {
  test('N 0° E = 0 radians (due North)', () => {
    const az = bearingToAzimuthRad(makeBearing('N', 0, 0, 0, 'E'))
    expect(az).toBeCloseTo(0, 5)
  })

  test('N 90° E = π/2 radians (due East)', () => {
    const az = bearingToAzimuthRad(makeBearing('N', 90, 0, 0, 'E'))
    expect(az).toBeCloseTo(Math.PI / 2, 5)
  })

  test('S 0° E = π radians (due South)', () => {
    const az = bearingToAzimuthRad(makeBearing('S', 0, 0, 0, 'E'))
    expect(az).toBeCloseTo(Math.PI, 5)
  })

  test('N 90° W = 3π/2 radians (due West)', () => {
    const az = bearingToAzimuthRad(makeBearing('N', 90, 0, 0, 'W'))
    expect(az).toBeCloseTo(3 * Math.PI / 2, 5)
  })

  test('N 45° E = π/4 radians', () => {
    const az = bearingToAzimuthRad(makeBearing('N', 45, 0, 0, 'E'))
    expect(az).toBeCloseTo(Math.PI / 4, 5)
  })

  test('minutes and seconds convert correctly: N 65° 30\' 00" E', () => {
    const az = bearingToAzimuthRad(makeBearing('N', 65, 30, 0, 'E'))
    const expectedDeg = 65.5
    expect(az).toBeCloseTo((expectedDeg * Math.PI) / 180, 5)
  })
})

describe('polarToCartesian', () => {
  test('due North (azimuth 0): dx=0, dz=distance', () => {
    const { dx, dz } = polarToCartesian(0, 10)
    expect(dx).toBeCloseTo(0, 5)
    expect(dz).toBeCloseTo(10, 5)
  })

  test('due East (azimuth π/2): dx=distance, dz=0', () => {
    const { dx, dz } = polarToCartesian(Math.PI / 2, 10)
    expect(dx).toBeCloseTo(10, 5)
    expect(dz).toBeCloseTo(0, 5)
  })
})

// ─── Polygon Construction ───────────────────────────────────────────────────

describe('buildPolygonFromSegments', () => {
  test('returns null for fewer than 3 segments', () => {
    expect(buildPolygonFromSegments([])).toBeNull()
    expect(buildPolygonFromSegments([makeSegment('N', 0, 'E', 10, 'front')])).toBeNull()
  })

  test('rectangular lot: N→E→S→W = 20×15 = 300 sqm', () => {
    const segments: LotSegment[] = [
      makeSegment('N', 90, 'E', 20, 'front'),   // East 20m
      makeSegment('S', 0, 'E', 15, 'right_side'), // South 15m (S 0° E = due south... wait)
    ]
    // Actually for a clean rectangle: East, South, West, North
    const rect: LotSegment[] = [
      makeSegment('N', 90, 'E', 20, 'front'),     // due East 20m
      makeSegment('S', 0, 'W', 15, 'right_side'),  // due South 15m → S 0° W...
    ]
    // Let's use the direct approach
    const rectSegments: LotSegment[] = [
      { id: '1', bearing: makeBearing('N', 90, 0, 0, 'E'), distance: 20, boundaryTag: 'front' },    // East
      { id: '2', bearing: makeBearing('S', 0, 0, 0, 'E'), distance: 15, boundaryTag: 'right_side' }, // South
      { id: '3', bearing: makeBearing('N', 90, 0, 0, 'W'), distance: 20, boundaryTag: 'rear' },      // West
      { id: '4', bearing: makeBearing('N', 0, 0, 0, 'E'), distance: 15, boundaryTag: 'left_side' },  // North
    ]
    const poly = buildPolygonFromSegments(rectSegments)
    expect(poly).not.toBeNull()
    expect(poly!.area).toBeCloseTo(300, 1)
    expect(poly!.perimeter).toBeCloseTo(70, 1)
    expect(poly!.vertices.length).toBe(4)
    expect(poly!.closure.isClosed).toBe(true)
    expect(poly!.closure.closureErrorMeters).toBeCloseTo(0, 3)
  })

  test('triangular lot: 3 segments', () => {
    // Equilateral-ish triangle: side 10m
    const segments: LotSegment[] = [
      { id: '1', bearing: makeBearing('N', 90, 0, 0, 'E'), distance: 10, boundaryTag: 'front' },
      { id: '2', bearing: makeBearing('S', 30, 0, 0, 'W'), distance: 10, boundaryTag: 'right_side' },
      { id: '3', bearing: makeBearing('N', 30, 0, 0, 'W'), distance: 10, boundaryTag: 'left_side' },
    ]
    const poly = buildPolygonFromSegments(segments)
    expect(poly).not.toBeNull()
    expect(poly!.vertices.length).toBe(3)
    expect(poly!.area).toBeGreaterThan(0)
    // Equilateral triangle area = (√3/4) × 10² ≈ 43.3
    expect(poly!.area).toBeCloseTo(43.3, 0)
  })

  test('closure error detected for unclosed polygon', () => {
    const segments: LotSegment[] = [
      { id: '1', bearing: makeBearing('N', 90, 0, 0, 'E'), distance: 20, boundaryTag: 'front' },
      { id: '2', bearing: makeBearing('S', 0, 0, 0, 'E'), distance: 15, boundaryTag: 'right_side' },
      { id: '3', bearing: makeBearing('N', 90, 0, 0, 'W'), distance: 20, boundaryTag: 'rear' },
      { id: '4', bearing: makeBearing('N', 0, 0, 0, 'E'), distance: 10, boundaryTag: 'left_side' }, // 10 instead of 15 — doesn't close
    ]
    const poly = buildPolygonFromSegments(segments)
    expect(poly).not.toBeNull()
    expect(poly!.closure.isClosed).toBe(false)
    expect(poly!.closure.closureErrorMeters).toBeCloseTo(5, 1) // 5m gap
  })
})

// ─── Rectangular Polygon ────────────────────────────────────────────────────

describe('buildRectangularPolygon', () => {
  test('20×15 = 300 sqm with correct bounds', () => {
    const poly = buildRectangularPolygon(20, 15)
    expect(poly.area).toBe(300)
    expect(poly.perimeter).toBe(70)
    expect(poly.vertices.length).toBe(4)
    expect(poly.boundingBox.width).toBe(20)
    expect(poly.boundingBox.depth).toBe(15)
    expect(poly.closure.isClosed).toBe(true)
    expect(poly.centroid.x).toBe(10)
    expect(poly.centroid.z).toBe(7.5)
  })

  test('edges have correct boundary tags', () => {
    const poly = buildRectangularPolygon(10, 10)
    expect(poly.edges[0].boundaryTag).toBe('front')
    expect(poly.edges[1].boundaryTag).toBe('right_side')
    expect(poly.edges[2].boundaryTag).toBe('rear')
    expect(poly.edges[3].boundaryTag).toBe('left_side')
  })
})

// ─── Bowditch Adjustment ────────────────────────────────────────────────────

describe('bowditchAdjust', () => {
  test('adjusts closure error proportionally', () => {
    // Simulate a square that doesn't quite close: last point at (0.1, 0.2) instead of (0,0)
    const rawVertices = [
      { x: 0, z: 0 },
      { x: 10, z: 0 },
      { x: 10, z: 10 },
      { x: 0, z: 10 },
      { x: 0.1, z: 0.2 }, // closure error
    ]
    const distances = [10, 10, 10, 10]
    const adjusted = bowditchAdjust(rawVertices, distances)

    expect(adjusted.length).toBe(4)
    // First vertex stays at origin
    expect(adjusted[0].x).toBe(0)
    expect(adjusted[0].z).toBe(0)
    // Last vertex should be closer to (0, 10) than the raw (0, 10)
    // The adjustment distributes the error proportionally
    expect(adjusted[3].x).toBeCloseTo(-0.075, 2) // -(0.1) × (30/40) = -0.075
    expect(adjusted[3].z).toBeCloseTo(9.85, 2)   // 10 - (0.2) × (30/40) = 9.85
  })
})

// ─── Polygon Inset ──────────────────────────────────────────────────────────

describe('computeSetbackInsetPolygon', () => {
  test('rectangular lot with uniform 2m setback → reduced area', () => {
    const poly = buildRectangularPolygon(20, 15)
    const result = computeSetbackInsetPolygon(poly, { front: 2, rear: 2, left: 2, right: 2 })

    // Inset: (20-4) × (15-4) = 16 × 11 = 176 sqm
    expect(result.vertices.length).toBe(4)
    expect(result.area).toBeCloseTo(176, 0)
  })

  test('asymmetric setbacks: front=4.5, rear=2, left=2, right=2', () => {
    const poly = buildRectangularPolygon(20, 15)
    const result = computeSetbackInsetPolygon(poly, { front: 4.5, rear: 2, left: 2, right: 2 })

    // Inset: (20-4) × (15-4.5-2) = 16 × 8.5 = 136 sqm
    expect(result.area).toBeCloseTo(136, 0)
  })
})
