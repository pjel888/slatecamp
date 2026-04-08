// src/features/3d-lab/types/templates.ts
// ─── Template Type System ────────────────────────────────────────────────────
// All type definitions for the 3D Lab module system. No runtime code.

import type { Vector3Tuple } from 'three'
import type { CategoryKey, LaunchPhase } from '../config/taxonomy'

// ─── Regulatory Citation Types ───────────────────────────────────────────────

export type ValueClassification = 'code-mandated' | 'code-derived' | 'pedagogical' | 'ux-arbitrary'

export interface LegalCitation {
  law: string
  section: string
  article?: string
  description: string
  value?: string
  classification: ValueClassification
  verified?: string
}

// ─── Template Types ──────────────────────────────────────────────────────────

export type TemplateType =
  | 'parametric'
  | 'exploded'
  | 'floorplan'
  | 'cutaway'
  | 'animated'
  | 'calculator'
  | 'wall-configurator'

// ─── Parameter Definitions ───────────────────────────────────────────────────

export interface ParameterDef {
  key: string
  label: string
  type: 'slider' | 'toggle' | 'dropdown'
  /** Slider min value */
  min?: number
  /** Slider max value */
  max?: number
  /** Slider step */
  step?: number
  /** Default value — number for slider, boolean for toggle, string for dropdown */
  default: number | boolean | string
  /** Display unit (e.g. 'm', 'mm', 'deg') */
  unit?: string
  /** Dropdown options — only used when type is 'dropdown' */
  options?: Array<{ value: string; label: string }>
  /** Group label for collapsible sections */
  group?: string
  /** Decimal places for slider display */
  decimals?: number
}

// ─── Violation Rules ─────────────────────────────────────────────────────────

export type Severity = 'error' | 'warning' | 'info'

export interface ViolationRule {
  id: string
  /** Returns true when the violation is active */
  check: (params: Record<string, number | boolean | string>) => boolean
  /** The parameter key this violation relates to */
  field: string
  /** Human-readable violation message */
  message: string
  /** Code section citation (e.g. 'PD 1096 Rule VII §2.a') */
  codeCitation?: string
  severity: Severity
  /** World-space position for the violation indicator */
  position?: (params: Record<string, number | boolean | string>) => Vector3Tuple
}

// ─── Annotation Definitions ──────────────────────────────────────────────────

export interface AnnotationDef {
  id: string
  label: string
  description: string
  /** Code section citation */
  codeCitation?: string
  /** World-space position — can be dynamic based on params */
  position: (params: Record<string, number | boolean | string>) => Vector3Tuple
  /** Optional visibility predicate */
  visibleWhen?: (params: Record<string, number | boolean | string>) => boolean
}

// ─── Presets ─────────────────────────────────────────────────────────────────

export interface Preset {
  label: string
  values: Record<string, number | boolean | string>
}

// ─── Geometry Instructions ───────────────────────────────────────────────────

export type GeometryType =
  | 'box'
  | 'cylinder'
  | 'plane'
  | 'line'
  | 'ring'
  | 'sphere'
  | 'cone'

export interface GeometryInstruction {
  id: string
  type: GeometryType
  position: Vector3Tuple
  rotation?: Vector3Tuple
  scale?: Vector3Tuple
  /** Constructor args — meaning depends on type (e.g. [width, height, depth] for box) */
  args: number[]
  color: string
  opacity?: number
  transparent?: boolean
  /** Optional label displayed via Html overlay */
  label?: string
}

// ─── Camera Config ───────────────────────────────────────────────────────────

export interface CameraConfig {
  position: Vector3Tuple
  target?: Vector3Tuple
  fov?: number
  near?: number
  far?: number
}

// ─── Parametric Scene Config ─────────────────────────────────────────────────

export interface ParametricSceneConfig {
  id: string
  title: string
  description: string
  subject: string
  parameters: ParameterDef[]
  /** Builds geometry instructions from current parameter values */
  geometry: (params: Record<string, number | boolean | string>) => GeometryInstruction[]
  violations?: ViolationRule[]
  annotations?: AnnotationDef[]
  presets?: Preset[]
  camera?: CameraConfig
  /** Uniform scale factor applied to the whole scene */
  scale?: number
  // ── Research-Driven Additions ──────────────────────────────
  /** 2-sentence professional scenario shown at module open */
  contextScenario?: string
  /** Estimated LEA questions per sitting covered by this module */
  leaQuestionCount?: number
  /** e.g. 'code compliance', 'dimensional recall', 'visual identification' */
  leaQuestionType?: string
  /** Which learning phases are built */
  supportedPhases?: Array<'guided' | 'faded' | 'sandbox' | 'challenge'>
  /** Whether challenge mode (find violations) is available */
  hasChallengeMode?: boolean
  /** Show a 1.7m human silhouette for scale reference */
  showHumanScale?: boolean
}

// ─── Exploded Assembly Config ────────────────────────────────────────────────

export interface AssemblyPart {
  id: string
  label: string
  /** Geometry in assembled position */
  geometry: GeometryInstruction
  /** Offset applied when explode slider = 1 */
  explodeOffset: Vector3Tuple
  /** Optional group for multi-level explosion */
  group?: string
  /** Description shown in annotation */
  description?: string
  codeCitation?: string
}

export interface ExplodedAssemblyConfig {
  id: string
  title: string
  description: string
  subject: string
  parts: AssemblyPart[]
  parameters?: ParameterDef[]
  /** Enable side-by-side comparison mode */
  comparisonMode?: boolean
  annotations?: AnnotationDef[]
  presets?: Preset[]
  camera?: CameraConfig
  scale?: number
  // ── Research-Driven Additions ──────────────────────────────
  contextScenario?: string
  leaQuestionCount?: number
  leaQuestionType?: string
  supportedPhases?: Array<'guided' | 'faded' | 'sandbox' | 'challenge'>
  hasChallengeMode?: boolean
  showHumanScale?: boolean
}

// ─── Floor Plan Config ───────────────────────────────────────────────────────

export interface RoomDef {
  id: string
  label: string
  /** [x, z, width, depth] in plan coordinates */
  bounds: [number, number, number, number]
  color: string
  opacity?: number
  /** Zone type for code compliance */
  zone?: string
}

export interface PathDef {
  id: string
  label: string
  /** Array of [x, z] waypoints */
  points: Array<[number, number]>
  color: string
  /** Line width in pixels */
  width?: number
  /** Whether to animate a traveling marker */
  animated?: boolean
}

export interface FixtureDef {
  id: string
  label: string
  type: 'door' | 'window' | 'stair' | 'exit' | 'extinguisher' | 'sprinkler' | 'custom'
  position: [number, number]
  rotation?: number
  /** Size in plan units */
  size?: [number, number]
  color?: string
  description?: string
  codeCitation?: string
}

export interface FloorPlanConfig {
  id: string
  title: string
  description: string
  subject: string
  rooms: RoomDef[]
  paths?: PathDef[]
  fixtures?: FixtureDef[]
  parameters?: ParameterDef[]
  violations?: ViolationRule[]
  annotations?: AnnotationDef[]
  presets?: Preset[]
  camera?: CameraConfig
  /** Plan dimensions [width, depth] in meters */
  planSize?: [number, number]
  scale?: number
  // ── Research-Driven Additions ──────────────────────────────
  contextScenario?: string
  leaQuestionCount?: number
  leaQuestionType?: string
  supportedPhases?: Array<'guided' | 'faded' | 'sandbox' | 'challenge'>
  hasChallengeMode?: boolean
}

// ─── Cutaway Section Config ──────────────────────────────────────────────────

export interface LayerDef {
  id: string
  label: string
  /** Geometry for this layer */
  geometry: GeometryInstruction
  /** Position along the cut axis (0 = innermost, 1 = outermost) */
  depth: number
  /** Description shown when layer is selected */
  description?: string
  codeCitation?: string
  /** Material label */
  material?: string
}

export interface CutawaySectionConfig {
  id: string
  title: string
  description: string
  subject: string
  layers: LayerDef[]
  /** Axis along which the cut is made */
  cutAxis?: 'x' | 'y' | 'z'
  parameters?: ParameterDef[]
  annotations?: AnnotationDef[]
  presets?: Preset[]
  camera?: CameraConfig
  scale?: number
  // ── Research-Driven Additions ──────────────────────────────
  contextScenario?: string
  leaQuestionCount?: number
  leaQuestionType?: string
  supportedPhases?: Array<'guided' | 'faded' | 'sandbox' | 'challenge'>
  hasChallengeMode?: boolean
}

// ─── Animated Sequence Config ────────────────────────────────────────────────

export interface SequenceStep {
  id: string
  label: string
  description: string
  /** Duration of this step in seconds */
  duration: number
  /** Geometry visible during this step */
  geometry: GeometryInstruction[]
  /** Camera position for this step (optional override) */
  camera?: CameraConfig
  codeCitation?: string
}

export interface AnimatedSequenceConfig {
  id: string
  title: string
  description: string
  subject: string
  steps: SequenceStep[]
  parameters?: ParameterDef[]
  annotations?: AnnotationDef[]
  presets?: Preset[]
  camera?: CameraConfig
  /** Whether the sequence loops */
  loop?: boolean
  /** Auto-play interval in milliseconds (default 1500) */
  autoPlaySpeed?: number
  scale?: number
  // ── Research-Driven Additions ──────────────────────────────
  contextScenario?: string
  leaQuestionCount?: number
  leaQuestionType?: string
  supportedPhases?: Array<'guided' | 'faded' | 'sandbox' | 'challenge'>
  hasChallengeMode?: boolean
}

// ─── Calculator Config ──────────────────────────────────────────────────────

export type CalculatorToolType = 'flooring' | 'paint' | 'drywall' | 'chb'

export interface CalculatorConfig {
  id: string
  title: string
  description: string
  subject: string
  /** Which calculator tool this config drives */
  toolType: CalculatorToolType
  /** Orthographic camera — calculators use orthographic for accurate proportions */
  camera?: {
    position: Vector3Tuple
    zoom?: number
    near?: number
    far?: number
  }
  /** Scale factor */
  scale?: number
  /** Sponsor data — prefills defaults, shown in sponsor card */
  sponsorData?: {
    name: string
    logoUrl?: string
    presets?: Record<string, number | string>
  }
  // ── Research-Driven Additions ──────────────────────────────
  contextScenario?: string
  leaQuestionCount?: number
  leaQuestionType?: string
}

// ─── Discriminated Union ─────────────────────────────────────────────────────

export type ModuleConfig =
  | ({ templateType: 'parametric' } & ParametricSceneConfig)
  | ({ templateType: 'exploded' } & ExplodedAssemblyConfig)
  | ({ templateType: 'floorplan' } & FloorPlanConfig)
  | ({ templateType: 'cutaway' } & CutawaySectionConfig)
  | ({ templateType: 'animated' } & AnimatedSequenceConfig)
  | ({ templateType: 'calculator' } & CalculatorConfig)
  | ({ templateType: 'wall-configurator' } & ParametricSceneConfig)

// ─── Module Registry Entry ───────────────────────────────────────────────────

export type ModuleStatus = 'built' | 'ready' | 'planned'

export interface ModuleRegistryEntry {
  id: string
  title: string
  templateType: TemplateType
  subject: string
  /** New 18-category taxonomy key */
  categoryId?: CategoryKey
  /** Phased release: 1 = High-Impact, 2 = Technical, 3 = Specialist */
  launchPhase?: LaunchPhase
  /** Regulatory code reference */
  codeRef?: string
  /** Priority ranking (1 = highest) */
  priority?: number
  /** Build status */
  status: ModuleStatus
  /** Short description for the gallery card */
  description?: string
  /** Thumbnail path (relative to public/) */
  thumbnail?: string
  // ── Research-Driven Additions ──────────────────────────────
  /** 2-sentence professional scenario shown at module open */
  contextScenario?: string
  /** Estimated LEA questions per sitting */
  leaQuestionCount?: number
  /** Which learning phases are built */
  supportedPhases?: Array<'guided' | 'faded' | 'sandbox' | 'challenge'>
  // ── Asset Preloading Manifest ──────────────────────────────
  /**
   * Optional asset manifest for future preloading support.
   * Paths are relative to /public/.
   */
  assets?: {
    /** GLTF/GLB/DRACO model paths to preload */
    models?: string[]
    /** Texture image paths to preload */
    textures?: string[]
  }
}
