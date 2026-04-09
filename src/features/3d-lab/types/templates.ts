// src/features/3d-lab/types/templates.ts
// ─── Template Type System ────────────────────────────────────────────────────
// All type definitions for the 3D Lab module system. No runtime code.

import type React from 'react'
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
  /** Progressive disclosure level — controls sidebar grouping visibility */
  disclosureLevel?: 'essential' | 'advanced' | 'expert'
  /** Optional visibility predicate — parameter hidden when this returns false.
   *  Receives current param values. Used for core-type-dependent parameter panels. */
  visibleWhen?: (params: Record<string, number | boolean | string>) => boolean
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
  | 'extruded-profile'
  | 'instanced'

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
  /** 2D cross-section points for extruded-profile type */
  profilePoints?: [number, number][]
  /** Extrusion depth in scene units for extruded-profile type */
  extrudeDepth?: number
  // ── Instanced geometry fields (used when type === 'instanced') ──
  /** Base shape for instanced geometry */
  instancedShape?: 'box' | 'cylinder' | 'sphere'
  /** Constructor args for the base shape */
  instancedShapeArgs?: number[]
  /** World-space positions for each instance */
  instancedPositions?: Vector3Tuple[]
  /** Per-instance rotations (optional — defaults to [0,0,0]) */
  instancedRotations?: Vector3Tuple[]
  /** Per-instance colors (optional — uses `color` for all if omitted) */
  instancedColors?: string[]
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

// ─── Viewport Shell Config ──────────────────────────────────────────────────
// Slot-based layout configuration: declares which shell containers a module uses.

export interface SidebarConfig {
  /** Start collapsed on load */
  defaultCollapsed?: boolean
  /** Panel width in px */
  width?: number
  /** Panel header title */
  title?: string
  /** Tab label in mobile bottom sheet */
  mobileTabLabel?: string
}

export interface ViewportShellConfig {
  /** Left sidebar slot — false/undefined = hidden */
  leftSidebar?: boolean | SidebarConfig
  /** Right sidebar slot — false/undefined = hidden */
  rightSidebar?: boolean | SidebarConfig
  /** Status bar below canvas */
  statusBar?: boolean
  /** Override mobile bottom sheet tab labels (auto-derived from sidebars if omitted) */
  mobileBottomSheetTabs?: string[]
}

// ─── Viewport Capabilities ──────────────────────────────────────────────────
// Config-driven toolbar controls: declares which viewport tools a module supports.

export type ViewMode = 'perspective' | 'orthographic' | 'isometric' | 'top-down'

export interface CrossSectionConfig {
  axis: 'x' | 'y' | 'z'
  range: [number, number]
}

export interface ViewportCapabilities {
  /** Camera presets — true = default 5 presets, or provide custom array */
  cameraPresets?: boolean | CameraPreset[]
  /** Available view modes */
  viewModes?: ViewMode[]
  /** Cross-section clipping plane */
  crossSection?: boolean | CrossSectionConfig
  /** Exploded view toggle */
  explodedView?: boolean
  /** Human scale silhouette toggle */
  humanScale?: boolean
  /** Focus mode toggle */
  focusMode?: boolean
  /** Reset camera button (default: true) */
  resetCamera?: boolean
  /** Module's default camera position — used by Reset button in CameraNavigationBar */
  defaultCamera?: {
    position: [number, number, number]
    target?: [number, number, number]
    fov?: number
  }
  /** Floating toolbar configuration — declares module-specific toolbar items */
  floatingToolbar?: FloatingToolbarConfig
  /** Enable KPI metrics bar */
  kpiMetrics?: boolean
  /** Enable camera preset bar */
  cameraPresetBar?: boolean
  /** Show compass rose for site planning modules */
  compassRose?: boolean
  /** Guided tour stops for this module */
  tourStops?: Array<{
    id: string
    title: string
    description: string
    cameraPosition?: [number, number, number]
    spotlightElement?: string
  }>
}

export interface FloatingToolbarConfig {
  position: 'top-left' | 'top-right'
  items: FloatingToolbarItem[]
}

export interface FloatingToolbarItem {
  id: string
  /** Lucide icon name */
  icon: string
  label: string
  shortcut?: string
  type: 'toggle' | 'action'
  /** Store field this toggles. Validated at runtime in dev mode — not compile-time typed.
   *  ADR: Untyped string key was chosen over generic type parameter to keep config declaration
   *  ergonomics simple. The FloatingToolbar component validates at runtime in dev. */
  storeBinding?: string
}

export interface CameraPreset {
  id: string
  label: string
  position: Vector3Tuple
  target?: Vector3Tuple
  fov?: number
  zoom?: number
}

// ─── Viewport Shell Content ─────────────────────────────────────────────────
// What templates return to inject into shell slots.

export interface ViewportShellContent {
  /** Left sidebar slot content */
  leftSidebarContent?: React.ReactNode
  /** Right sidebar slot content */
  rightSidebarContent?: React.ReactNode
  /** R3F scene content — always required */
  canvasContent: React.ReactNode
  /** Status bar content */
  statusBarContent?: React.ReactNode
  /** Template-specific toolbar additions */
  toolbarExtras?: React.ReactNode
}

// ─── Template Default Configs ───────────────────────────────────────────────

const DEFAULT_FLOATING_TOOLBAR: FloatingToolbarConfig = {
  position: 'top-left' as const,
  items: [
    { id: 'grid', icon: 'Grid3x3', label: 'Grid', shortcut: 'G', type: 'toggle' as const, storeBinding: 'gridVisible' },
    { id: 'dimensions', icon: 'Ruler', label: 'Dimensions', shortcut: 'D', type: 'toggle' as const, storeBinding: 'dimensionsVisible' },
    { id: 'screenshot', icon: 'Camera', label: 'Screenshot', shortcut: 'P', type: 'action' as const },
    { id: 'fullscreen', icon: 'Maximize2', label: 'Fullscreen', shortcut: 'F', type: 'action' as const },
  ],
}

export const TEMPLATE_SHELL_DEFAULTS: Record<TemplateType, { shell: ViewportShellConfig; capabilities: ViewportCapabilities }> = {
  parametric: {
    shell: {
      leftSidebar: { width: 320, title: 'Controls', mobileTabLabel: 'Controls' },
      rightSidebar: { width: 300, title: 'Controls', mobileTabLabel: 'Controls' },
    },
    capabilities: {
      cameraPresets: true, viewModes: ['perspective', 'isometric'], resetCamera: true,
      cameraPresetBar: true, floatingToolbar: DEFAULT_FLOATING_TOOLBAR,
    },
  },
  exploded: {
    shell: { rightSidebar: { width: 300, title: 'Parts', mobileTabLabel: 'Parts' } },
    capabilities: {
      cameraPresets: true, viewModes: ['perspective', 'isometric'], explodedView: true, resetCamera: true,
      cameraPresetBar: true, floatingToolbar: DEFAULT_FLOATING_TOOLBAR,
    },
  },
  cutaway: {
    shell: { rightSidebar: { width: 300, title: 'Layers', mobileTabLabel: 'Layers' } },
    capabilities: {
      cameraPresets: true, viewModes: ['perspective', 'isometric'], crossSection: true, resetCamera: true,
      cameraPresetBar: true, floatingToolbar: DEFAULT_FLOATING_TOOLBAR,
    },
  },
  floorplan: {
    shell: { rightSidebar: { width: 300, title: 'Legend', mobileTabLabel: 'Legend' } },
    capabilities: {
      cameraPresets: true, viewModes: ['top-down', 'perspective'], resetCamera: true,
      cameraPresetBar: true, floatingToolbar: DEFAULT_FLOATING_TOOLBAR,
    },
  },
  animated: {
    shell: { rightSidebar: { width: 300, title: 'Steps', mobileTabLabel: 'Steps' } },
    capabilities: {
      cameraPresets: true, viewModes: ['perspective', 'isometric'], resetCamera: true,
      cameraPresetBar: true, floatingToolbar: DEFAULT_FLOATING_TOOLBAR,
    },
  },
  calculator: {
    shell: {
      leftSidebar: { width: 340, title: 'Inputs', mobileTabLabel: 'Inputs' },
      rightSidebar: { width: 340, title: 'Results', mobileTabLabel: 'Results' },
    },
    capabilities: {
      viewModes: ['orthographic', 'perspective'], resetCamera: true,
      cameraPresetBar: true, floatingToolbar: DEFAULT_FLOATING_TOOLBAR,
    },
  },
  'wall-configurator': {
    shell: {
      leftSidebar: { width: 340, title: 'Configure', mobileTabLabel: 'Configure' },
      rightSidebar: { width: 320, title: 'Materials', mobileTabLabel: 'Materials' },
    },
    capabilities: {
      cameraPresets: true, viewModes: ['perspective', 'isometric'], resetCamera: true,
      cameraPresetBar: true, floatingToolbar: DEFAULT_FLOATING_TOOLBAR,
    },
  },
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
