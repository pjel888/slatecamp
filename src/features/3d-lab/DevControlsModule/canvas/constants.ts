// canvas/constants.ts
// ─── Single source of truth for all 3D scene constants ─────────────────────
// No component may hardcode Y values, colors, or camera positions.

// ─── Y-Axis Geometry Constants (Anti-Z-Fighting System) ─────────────────────
// Minimum separation = 0.01 world units (1cm at 1:100 scale).
// WebGL 24-bit depth buffer resolves ~0.000001 at close range.
import { SCENE_COLORS } from '@/features/3d-lab/constants/scene-colors'

// Z-fighting is geometrically impossible in this system.

export const GEOMETRY_Y = {
  BASE_GROUND:    0.000,   // Raw earth / terrain base
  ROAD:           0.010,   // Road surface
  ROAD_MARKING:   0.011,   // Painted lane markings
  CURB:           0.040,   // Curb edge
  SIDEWALK:       0.050,   // Raised pedestrian pavement
  LOT_SURFACE:    0.100,   // Lot ground fill
  SETBACK_ZONE:   0.101,   // Setback overlay plane (transparent)
  HARDSCAPE_ISA:  0.102,   // Impervious surface area fill
  SOFTSCAPE_USA:  0.103,   // Unpaved surface area fill
  TOSL_OVERLAY:   0.104,   // TOSL zone highlight (transparent)
  AMBF_FOOTPRINT: 0.105,   // Buildable footprint indicator
  AMBF_GHOST_PSO: 0.106,   // Non-binding PSO candidate (transparent)
  AMBF_GHOST_SB:  0.107,   // Non-binding setback candidate (transparent)
  BUILDING_BASE:  0.200,   // Bottom of building extrusion
} as const

export type GeometryYKey = keyof typeof GEOMETRY_Y

// ─── Color System (Immutable — Multi-Channel Consistency Required) ──────────
// Same token must appear in formula panel, ground plane, data card, and quiz.

export const COLOR = {
  // Ground & context
  GROUND:          SCENE_COLORS.groundLight, // Raw earth / terrain — slightly darker than white
  ROAD:            '#6B7280',   // Road surface
  ROAD_MARKING:    '#FFFFFF',   // Lane markings
  SIDEWALK:        '#D4D0C8',   // Pedestrian pavement
  LOT_SURFACE:     '#cbd5e1',   // Lot ground fill — Tailwind slate-300 (light grey, visible against white bg)

  // Zones
  AMBF_BINDING:    '#1B3FC4',   // Buildable footprint — Camp Cobalt
  AMBF_GHOST_PSO:  '#F5A623',   // Non-binding PSO candidate — amber
  AMBF_GHOST_SB:   '#9CA3AF',   // Non-binding setback candidate — grey
  SETBACK:         '#E74C3C',   // Setback exclusion (used with low opacity)
  ISA:             '#F5A623',   // Impervious hardscape — amber
  USA:             '#4A7C59',   // Permeable softscape — trail-green
  TOSL:            '#86efac',   // Total open space — Tailwind green-300 (visible against gray lot)
  BUILDING:        '#a1a1aa',   // Extruded floors — Tailwind zinc-400 (medium concrete gray)

  // State
  SELECTION:       '#1B3FC4',   // Selected mesh — Camp Cobalt
  GREYSCALE:       '#9CA3AF',   // Non-selected in focus mode
  VIOLATION:       '#E63329',   // Code exceedance — red
  VIOLATION_BASE:  '#E8E4DB',   // Violation shader base (ground)
  FIREWALL:        '#FF6B35',   // Firewall marker

  // Slatecamp tokens
  COBALT:          '#1B3FC4',
  COBALT_50:       '#EEF2FC',
  EMERALD:         '#2D9F6F',
  WARM_RED:        '#D64545',
  AMBER:           '#D4951A',
} as const

// ─── Opacity Presets ────────────────────────────────────────────────────────

export const OPACITY = {
  SETBACK_ZONE:    0.15,    // 15% — red tint
  ISA_ZONE:        0.25,    // 25% — amber fill
  USA_ZONE:        0.25,    // 25% — trail-green fill
  TOSL_OVERLAY:    0.25,    // 25% — clearly visible green overlay
  AMBF_GHOST:      0.10,    // 10% — non-binding candidates
  AMBF_BINDING:    0.18,    // 18% — binding envelope
  FLOOR_SLAB:      0.85,    // 85% — building floors
  DIMENSION_LINE:  0.60,    // 60% — annotation lines
} as const

// ─── Camera Presets ─────────────────────────────────────────────────────────

export interface CameraPresetConfig {
  position: [number, number, number]
  target: [number, number, number]
  fov: number
  isOrtho?: boolean
}

export const CAMERA_PRESETS: Record<string, CameraPresetConfig> = {
  // Default perspective
  perspective: {
    position: [18, 14, 20],
    target: [10, 0, 7.5],
    fov: 42,
  },
  orbit: {
    position: [18, 14, 20],
    target: [10, 0, 7.5],
    fov: 42,
  },
  // Elevation views
  top: {
    position: [10, 50, 7.5],
    target: [10, 0, 7.5],
    fov: 42,
    isOrtho: true,
  },
  front: {
    position: [10, 8, 40],
    target: [10, 4, 7.5],
    fov: 42,
    isOrtho: true,
  },
  left: {
    position: [-20, 8, 7.5],
    target: [10, 4, 7.5],
    fov: 42,
  },
  right: {
    position: [40, 8, 7.5],
    target: [10, 4, 7.5],
    fov: 42,
  },
  rear: {
    position: [10, 8, -25],
    target: [10, 4, 7.5],
    fov: 42,
  },
  // 4-corner isometric views (orthographic, 45° azimuth from each corner)
  'iso-ne': {
    position: [35, 25, 30],
    target: [10, 0, 7.5],
    fov: 35,
    isOrtho: true,
  },
  'iso-nw': {
    position: [-15, 25, 30],
    target: [10, 0, 7.5],
    fov: 35,
    isOrtho: true,
  },
  'iso-se': {
    position: [35, 25, -15],
    target: [10, 0, 7.5],
    fov: 35,
    isOrtho: true,
  },
  'iso-sw': {
    position: [-15, 25, -15],
    target: [10, 0, 7.5],
    fov: 35,
    isOrtho: true,
  },
} as const

// ─── Scene Constants ────────────────────────────────────────────────────────

export const SCENE = {
  SKY_COLOR:          SCENE_COLORS.skyWhite,
  DPR_RANGE:          [1, 1.5] as [number, number],
  MAX_DRAW_CALLS:     20,
  FLOOR_HEIGHT_DEFAULT: 3.0,
  CONTEXT_BUILDING_COLOR: '#D4D0C8',
  SHADOW_OPACITY:     0.15,
} as const
