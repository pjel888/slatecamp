'use client'

import { create } from 'zustand'
import { buildPolygonFromSegments, buildRectangularPolygon } from '@/lib/lot-geometry/polygon'
import type {
  LotMode, LotSegment, ComputedLotPolygon, BoundaryTag, SurveyorBearing,
} from '@/types/lot'

// ─── Default Segments (empty — user builds from scratch or loads preset) ────

const DEFAULT_RECTANGLE = { width: 20, depth: 15 }
const DEFAULT_CLOSURE_TOLERANCE = 0.05 // meters (5cm)

// ─── Store Interface ────────────────────────────────────────────────────────

interface LotStore {
  // ── Mode Toggle ─────────────────────────────────────────
  mode: LotMode
  setMode: (mode: LotMode) => void

  // ── Rectangle Mode (existing behavior, unchanged) ──────
  rectangle: { width: number; depth: number }
  setRectangleWidth: (w: number) => void
  setRectangleDepth: (d: number) => void

  // ── Surveyor Mode ──────────────────────────────────────
  segments: LotSegment[]
  closureTolerance: number
  autoAdjust: boolean
  addSegment: (segment?: Partial<LotSegment>) => void
  updateSegment: (id: string, patch: Partial<LotSegment>) => void
  removeSegment: (id: string) => void
  reorderSegments: (fromIndex: number, toIndex: number) => void
  clearSegments: () => void
  setAutoAdjust: (v: boolean) => void
  loadPresetSegments: (segments: LotSegment[]) => void

  // ── Computed Output (derived, shared by both modes) ────
  computedPolygon: ComputedLotPolygon | null

  // ── Compatibility Bridge ───────────────────────────────
  /** Returns lot data regardless of mode for the compliance engine */
  getLotData: () => {
    width: number
    depth: number
    area: number
    polygon: ComputedLotPolygon | null
  }
}

// ─── Helpers ────────────────────────────────────────────────────────────────

let segmentCounter = 0

function makeDefaultSegment(overrides?: Partial<LotSegment>): LotSegment {
  segmentCounter++
  return {
    id: `seg-${segmentCounter}-${Date.now()}`,
    bearing: { base: 'N', degrees: 0, minutes: 0, seconds: 0, turn: 'E' },
    distance: 10,
    boundaryTag: 'front',
    ...overrides,
  }
}

function recomputePolygon(mode: LotMode, rectangle: { width: number; depth: number }, segments: LotSegment[]): ComputedLotPolygon | null {
  if (mode === 'rectangle') {
    return buildRectangularPolygon(rectangle.width, rectangle.depth)
  }
  if (segments.length < 3) return null
  return buildPolygonFromSegments(segments)
}

// ─── Store ──────────────────────────────────────────────────────────────────

export const useLotStore = create<LotStore>()((set, get) => ({
  // ── Mode
  mode: 'rectangle',
  setMode: (mode) => {
    const s = get()
    const polygon = recomputePolygon(mode, s.rectangle, s.segments)
    set({ mode, computedPolygon: polygon })
  },

  // ── Rectangle
  rectangle: DEFAULT_RECTANGLE,
  setRectangleWidth: (w) => {
    const rect = { ...get().rectangle, width: w }
    const polygon = recomputePolygon('rectangle', rect, get().segments)
    set({ rectangle: rect, computedPolygon: polygon })
  },
  setRectangleDepth: (d) => {
    const rect = { ...get().rectangle, depth: d }
    const polygon = recomputePolygon('rectangle', rect, get().segments)
    set({ rectangle: rect, computedPolygon: polygon })
  },

  // ── Surveyor
  segments: [],
  closureTolerance: DEFAULT_CLOSURE_TOLERANCE,
  autoAdjust: false,

  addSegment: (overrides) => {
    const s = get()
    const segments = [...s.segments, makeDefaultSegment(overrides)]
    const polygon = recomputePolygon(s.mode, s.rectangle, segments)
    set({ segments, computedPolygon: polygon })
  },

  updateSegment: (id, patch) => {
    const s = get()
    const segments = s.segments.map(seg =>
      seg.id === id ? { ...seg, ...patch } : seg
    )
    const polygon = recomputePolygon(s.mode, s.rectangle, segments)
    set({ segments, computedPolygon: polygon })
  },

  removeSegment: (id) => {
    const s = get()
    const segments = s.segments.filter(seg => seg.id !== id)
    const polygon = recomputePolygon(s.mode, s.rectangle, segments)
    set({ segments, computedPolygon: polygon })
  },

  reorderSegments: (fromIndex, toIndex) => {
    const s = get()
    const segments = [...s.segments]
    const [moved] = segments.splice(fromIndex, 1)
    segments.splice(toIndex, 0, moved)
    const polygon = recomputePolygon(s.mode, s.rectangle, segments)
    set({ segments, computedPolygon: polygon })
  },

  clearSegments: () => {
    const s = get()
    const polygon = recomputePolygon(s.mode, s.rectangle, [])
    set({ segments: [], computedPolygon: polygon })
  },

  setAutoAdjust: (v) => set({ autoAdjust: v }),

  loadPresetSegments: (segments) => {
    const s = get()
    const polygon = recomputePolygon(s.mode, s.rectangle, segments)
    set({ segments, computedPolygon: polygon, mode: 'surveyor' })
  },

  // ── Computed
  computedPolygon: buildRectangularPolygon(DEFAULT_RECTANGLE.width, DEFAULT_RECTANGLE.depth),

  // ── Bridge
  getLotData: () => {
    const s = get()
    const poly = s.computedPolygon
    if (s.mode === 'rectangle' || !poly) {
      return {
        width: s.rectangle.width,
        depth: s.rectangle.depth,
        area: s.rectangle.width * s.rectangle.depth,
        polygon: poly,
      }
    }
    return {
      width: poly.boundingBox.width,
      depth: poly.boundingBox.depth,
      area: poly.area,
      polygon: poly,
    }
  },
}))
