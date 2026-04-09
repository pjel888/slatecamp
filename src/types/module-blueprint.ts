// src/types/module-blueprint.ts
// ===============================================================
// ModuleBlueprint -- AI-Portable Interchange Format for 3D Lab Modules
// ===============================================================
//
// PURPOSE:
//   Captures the complete declarative UI state of a 3D Lab module
//   in a single file that any AI model can read, audit, and return
//   modified. The codebase AI then consumes changes to update code.
//
// RULES:
//   1. Every field is DECLARATIVE, not imperative. Describe WHAT, never HOW.
//   2. No React components, no JSX, no hooks -- pure data.
//   3. All values must be serializable (no functions, no class instances).
//      Exception: `validatorSignature` fields describe function shape as strings.
//   4. Use string unions over enums for JSON portability.
//   5. Every field that exists in the codebase MUST be captured here.
//      If the current UI has it, the blueprint has it.
//
// VERSIONING:
//   Bump `schemaVersion` when fields are added/removed/renamed.
// ===============================================================

export interface ModuleBlueprint {
  /** Schema version for forward compatibility. Semver string. */
  schemaVersion: string

  // --- MODULE IDENTITY ---
  meta: ModuleMeta

  // --- ZUSTAND STORE SHAPE ---
  /** Describes the Zustand store fields, their types, and default values.
   *  This is THE source of truth for what state this module manages. */
  store: StoreSchema

  // --- LEFT SIDEBAR: CONTROL PANELS ---
  /** Top-level tabs (e.g., Lot | Build | Settings) */
  sidebar: SidebarSchema

  // --- CENTER: 3D VIEWPORT ---
  scene: SceneSchema

  // --- RIGHT SIDEBAR: COMPLIANCE / INFO PANELS ---
  infoPanel: InfoPanelSchema

  // --- BOTTOM HUD ---
  hud: HudSchema

  // --- GUIDED TOUR ---
  tour: TourSchema

  // --- TOOLBAR (top of viewport) ---
  toolbar: ToolbarSchema

  // --- COMPUTATION ENGINE ---
  /** Pure function signatures that drive computed values.
   *  Not the implementation -- just input->output signatures. */
  computations: ComputationSchema[]

  // --- CODE COMPLIANCE RULES ---
  compliance: ComplianceRuleSchema[]

  // --- LEARNING INTEGRATION ---
  learning: LearningSchema

  // --- INTERACTION MAP ---
  /** Which control drives which parameter / visual change */
  bindings: BindingSchema[]

  // --- CAMERA PRESETS ---
  cameraPresets: CameraPreset[]

  // --- KEYBOARD SHORTCUTS ---
  shortcuts: ShortcutSchema[]

  // --- PRESETS ---
  /** Preset definitions — parameter overrides for educational scenarios */
  presets?: PresetSchema[]

  // --- PERFORMANCE METRICS (optional — modules with computed performance data) ---
  /** Performance metrics computed from assembly configuration */
  performanceMetrics?: PerformanceMetricSchema[]

  // --- BILL OF MATERIALS (optional — modules with material takeoff) ---
  /** Bill of Materials configuration */
  billOfMaterials?: BillOfMaterialsSchema

  // --- VIEW MODES (optional — modules with multiple visualization states) ---
  /** View mode definitions */
  viewModes?: ViewModeSchema[]
}

// ===============================================================
// SUB-SCHEMAS
// ===============================================================

export interface ModuleMeta {
  /** Unique slug matching the URL route segment */
  slug: string
  /** Display name shown in header */
  displayName: string
  /** Module category in the 3D Lab browser */
  category: string
  /** Route path from dashboard root */
  routePath: string
  /** ALE taxonomy nodes this module covers */
  aleTaxonomy: string[]
  /** PD 1096 / RA 9514 / BP 344 rule references */
  codeReferences: string[]
  /** Brief description for the module browser card */
  description: string
  /** Current implementation status */
  status: 'production' | 'beta' | 'prototype' | 'planned'
}

export interface StoreSchema {
  /** Name of the Zustand store (e.g., "useDevControlsStore") */
  storeName: string
  /** File path relative to src/ */
  filePath: string
  /** Every field in the store */
  fields: StoreField[]
}

export interface StoreField {
  /** Field name as it appears in code */
  name: string
  /** TypeScript type as a string (e.g., "number", "ZoningClassification", "'R-1' | 'R-2' | 'C-1'") */
  type: string
  /** Default value */
  defaultValue: string
  /** What this field controls */
  description: string
  /** Is this field derived/computed from other fields? */
  computed: boolean
  /** If computed, which fields does it depend on? */
  dependencies?: string[]
}

export interface SidebarSchema {
  /** Width in pixels or Tailwind class */
  width: string
  /** Tab definitions. null if no tabs (single panel). */
  tabs: SidebarTab[] | null
}

export interface SidebarTab {
  /** Tab ID matching route or internal state */
  id: string
  /** Display label */
  label: string
  /** Icon name (Lucide icon or custom) */
  icon?: string
  /** Is this the default active tab? */
  default: boolean
  /** Sections within this tab, rendered top to bottom */
  sections: SidebarSection[]
}

export interface SidebarSection {
  /** Section ID */
  id: string
  /** Section header text. null = no header. */
  title: string | null
  /** Is this section collapsible? */
  collapsible: boolean
  /** Is it collapsed by default? */
  defaultCollapsed: boolean
  /** Visual style hint */
  variant: 'default' | 'card' | 'inset' | 'highlighted'
  /** Badge or indicator on the section header (e.g., warning triangle) */
  headerBadge?: { type: 'warning' | 'info' | 'count'; value?: string }
  /** Controls within this section */
  controls: SidebarControl[]
}

export type SidebarControl =
  | SliderControl
  | DropdownControl
  | ToggleControl
  | ButtonControl
  | DisplayField
  | DisplayGroup
  | CustomControl

interface BaseControl {
  /** Control ID -- matches store field name or action name */
  id: string
  /** Label shown to user */
  label: string
  /** Tooltip or helper text */
  description?: string
  /** Store field this control reads/writes. null = display only. */
  storeBinding?: string
}

export interface SliderControl extends BaseControl {
  controlType: 'slider'
  min: number
  max: number
  step: number
  defaultValue: number
  unit: string
  /** Show numeric input alongside slider? */
  showInput: boolean
}

export interface DropdownControl extends BaseControl {
  controlType: 'dropdown'
  options: { value: string; label: string; description?: string }[]
  defaultValue: string
}

export interface ToggleControl extends BaseControl {
  controlType: 'toggle'
  defaultValue: boolean
}

export interface ButtonControl extends BaseControl {
  controlType: 'button'
  variant: 'primary' | 'secondary' | 'ghost' | 'destructive'
  /** Action name dispatched to store or handler */
  action: string
}

export interface DisplayField extends BaseControl {
  controlType: 'display'
  /** Format of the displayed value */
  format: 'number' | 'percentage' | 'text' | 'formula'
  unit?: string
  /** Store field (or computed expression) that provides the value */
  sourceExpression: string
}

export interface DisplayGroup extends BaseControl {
  controlType: 'display-group'
  /** Key-value pairs displayed together (e.g., Table VIII.1 Reference) */
  fields: { label: string; sourceExpression: string; unit?: string; format?: string }[]
}

export interface CustomControl extends BaseControl {
  controlType: 'custom'
  /** React component name as string -- for documentation only */
  componentName: string
  /** Description of what this custom control does */
  behavior: string
}

// --- SCENE ---

export interface SceneSchema {
  /** Canvas configuration */
  canvas: {
    camera: { position: [number, number, number]; fov: number; near?: number; far?: number }
    shadows: boolean
    dpr: [number, number]
    frameloop: 'always' | 'demand' | 'never'
    background: string
    gl?: Record<string, unknown>
  }
  /** Lighting setup */
  lighting: LightingConfig[]
  /** Environment preset (drei Environment component) */
  environment: { preset?: string; files?: string; background?: boolean } | null
  /** Ground plane / contact shadows */
  ground: {
    type: 'plane' | 'contact-shadows' | 'grid' | 'none'
    config: Record<string, unknown>
  }
  /** OrbitControls or other camera control config */
  controls: {
    type: 'orbit' | 'map' | 'fly' | 'none'
    config: Record<string, unknown>
  }
  /** 3D objects in the scene (lot geometry, building massing, setback planes, etc.) */
  objects: SceneObject[]
  /** Overlay layers rendered in 3D space (setback lines, dimension lines, zone fills) */
  overlays: SceneOverlay[]
}

export interface LightingConfig {
  type: 'ambient' | 'directional' | 'point' | 'spot' | 'hemisphere'
  props: Record<string, unknown>
}

export interface SceneObject {
  /** Unique ID */
  id: string
  /** What this object represents semantically */
  semanticRole: string
  /** How the geometry is created */
  geometrySource: 'parametric' | 'glb' | 'primitive' | 'line' | 'plane'
  /** Description of what store fields drive this object's geometry/transform/visibility */
  reactivity: string
  /** Material description */
  material: { type: string; props: Record<string, unknown> }
  /** Visibility condition (e.g., "always", "when viewMode === 'setbacks'") */
  visibilityCondition: string
}

export interface SceneOverlay {
  /** Unique ID */
  id: string
  /** What this overlay represents */
  semanticRole: string
  /** Type of overlay */
  overlayType: 'zone-fill' | 'dimension-line' | 'label' | 'boundary-line' | 'hatch' | 'custom'
  /** Description of reactive behavior */
  reactivity: string
  /** Visibility condition */
  visibilityCondition: string
}

// --- INFO PANEL (Right Sidebar) ---

export interface InfoPanelSchema {
  /** Width in pixels or Tailwind class */
  width: string
  /** Is it collapsible/toggleable? */
  collapsible: boolean
  /** Sections rendered top to bottom */
  sections: InfoPanelSection[]
}

export interface InfoPanelSection {
  id: string
  title: string
  collapsible: boolean
  defaultCollapsed: boolean
  /** The type of content in this section */
  contentType: 'status-bar' | 'computation-display' | 'scorecard' | 'stacked-bar' | 'code-reference' | 'custom'
  /** Detailed description of what this section shows and how it's computed */
  content: string
  /** Store fields this section reads */
  dependencies: string[]
}

// --- HUD (Bottom Overlay) ---

export interface HudSchema {
  /** Position on screen */
  position: 'bottom-center' | 'bottom-left' | 'bottom-right' | 'top-center'
  /** Metrics displayed in the HUD bar */
  metrics: HudMetric[]
  /** Additional HUD elements (camera preset buttons, etc.) */
  extras: HudExtra[]
}

export interface HudMetric {
  id: string
  label: string
  sourceExpression: string
  unit: string
  format: 'number' | 'percentage' | 'floors'
  /** Highlight condition (e.g., turn red on violation) */
  highlightCondition?: string
}

export interface HudExtra {
  id: string
  type: 'camera-presets' | 'view-toggles' | 'chat-input' | 'custom'
  config: Record<string, unknown>
}

// --- TOUR ---

export interface TourSchema {
  /** Total number of stops */
  totalStops: number
  /** Can user skip the tour? */
  skippable: boolean
  /** Tour stops in order */
  stops: TourStop[]
}

export interface TourStop {
  /** Stop number (1-indexed) */
  step: number
  /** Short title */
  title: string
  /** Narration text shown to the student */
  narration: string
  /** Camera position and target during this stop */
  camera: { position: [number, number, number]; lookAt: [number, number, number] }
  /** Which scene elements to highlight/emphasize */
  highlights: string[]
  /** Store fields to enable/set during this stop (e.g., enable a specific slider) */
  stateOverrides?: Record<string, unknown>
  /** Quiz question at this stop (null = narration only) */
  quiz: TourQuiz | null
}

export interface TourQuiz {
  question: string
  choices: { id: string; text: string }[]
  correctId: string
  rationale: string
}

// --- TOOLBAR ---

export interface ToolbarSchema {
  position: 'top-left' | 'top-center' | 'top-right'
  items: ToolbarItem[]
}

export interface ToolbarItem {
  id: string
  icon: string
  label: string
  type: 'toggle' | 'action' | 'dropdown'
  /** What this toolbar item does */
  behavior: string
  /** Store field it toggles (for toggle type) */
  storeBinding?: string
  /** Keyboard shortcut (e.g., "G" for grid) */
  shortcut?: string
}

// --- COMPUTATIONS ---

export interface ComputationSchema {
  /** Function name as it appears in code */
  functionName: string
  /** File path relative to src/ */
  filePath: string
  /** Input parameter names and types */
  inputs: { name: string; type: string }[]
  /** Output fields and types */
  outputs: { name: string; type: string }[]
  /** Plain-English description of the computation */
  description: string
  /** The code reference this computation implements */
  codeReference?: string
  /** The formula in readable notation (e.g., "AMBF = min(setbackArea, PSO x TLA, TOSL x TLA)") */
  formula?: string
}

// --- COMPLIANCE ---

export interface ComplianceRuleSchema {
  /** Rule ID (e.g., "ambf-check", "bhl-check") */
  id: string
  /** Display label */
  label: string
  /** The code section (e.g., "PD 1096 IRR Rule VIII Table VIII.1") */
  codeSection: string
  /** How compliance is determined */
  logic: string
  /** Store fields involved */
  dependencies: string[]
  /** What happens visually when this rule fails */
  violationVisualization: string
  /** What happens visually when this rule passes */
  passVisualization: string
  /** Law group this rule belongs to (e.g., 'PD 1096', 'RA 9514') */
  lawGroup?: string
  /** Condition for this rule to be active (e.g., "isExitStair === true") */
  activationCondition?: string
  /** Rule IDs in other laws that conflict with this one */
  conflictsWith?: string[]
}

// --- PRESETS ---

export interface PresetSchema {
  /** Unique identifier for this preset */
  id: string
  /** Display label */
  label: string
  /** Preset category for UI grouping */
  category: 'compliant' | 'violation' | 'edge-case'
  /** Parameter values this preset applies */
  parameterOverrides: Record<string, string | number | boolean>
  /** Which compliance rule IDs this preset is expected to violate */
  expectedViolations?: string[]
  /** Pedagogical purpose */
  teachingPoint?: string
}

// --- LEARNING ---

export interface LearningSchema {
  /** Primary learning objective */
  primaryObjective: string
  /** Bloom's taxonomy level (1=Remember, 2=Understand, 3=Apply, 4=Analyze) */
  bloomLevel: 1 | 2 | 3 | 4
  /** Key values the student should memorize from this module */
  keyValues: string[]
  /** Prerequisite knowledge */
  prerequisites: string[]
  /** ALE question types this module prepares for */
  aleQuestionTypes: string[]
  /** Success criteria -- how we know the module worked */
  successCriteria: string
  /** Quiz integration points within the module (not tour quizzes) */
  quizIntegration: {
    type: 'post-exploration' | 'checkpoint' | 'in-situ'
    description: string
  }[]
}

// --- BINDINGS ---

export interface BindingSchema {
  /** The control or input that triggers the change */
  source: { type: 'slider' | 'dropdown' | 'toggle' | 'input' | 'preset'; id: string }
  /** The store field that changes */
  storeField: string
  /** What reacts to this change (scene objects, computations, compliance checks) */
  effects: string[]
  /** Description of the reactive chain */
  description: string
}

// --- CAMERA PRESETS ---

export interface CameraPreset {
  id: string
  label: string
  position: [number, number, number]
  lookAt: [number, number, number]
  /** Animation duration in ms (0 = instant) */
  transitionDuration: number
  /** Is this an orthographic view? */
  orthographic: boolean
}

// --- SHORTCUTS ---

export interface ShortcutSchema {
  key: string
  modifier?: 'ctrl' | 'shift' | 'alt' | 'meta'
  action: string
  description: string
}

// --- PERFORMANCE METRICS ---

export interface PerformanceMetricSchema {
  /** Metric identifier */
  id: string
  /** Display label */
  label: string
  /** Unit of measurement */
  unit: string
  /** Description of how this metric is computed */
  computationSource: string
  /** Color scale thresholds for status indicators */
  colorScale: { threshold: number; status: 'good' | 'warning' | 'danger' }[]
}

// --- BILL OF MATERIALS ---

export interface BillOfMaterialsSchema {
  /** Function or file that computes BOM entries */
  computationSource: string
  /** BOM grouping categories */
  groups: string[]
  /** Price disclaimer text */
  priceDisclaimer: string
  /** Price region context */
  priceRegion: string
  /** Last updated date for pricing data */
  priceLastUpdated: string
}

// --- VIEW MODES ---

export interface ViewModeSchema {
  /** View mode identifier */
  id: string
  /** Display label */
  label: string
  /** Description of what this view mode shows */
  description: string
  /** How geometry is affected */
  geometryEffect: string
  /** How camera is affected (if at all) */
  cameraEffect?: string
}
