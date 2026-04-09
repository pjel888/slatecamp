# PROMPT: Generate Module Blueprint for Site Development Controls

> **What this is:** A single prompt you paste into your codebase AI (Claude Code, Cursor, etc.) that has access to the SlateCamp repo. The AI will scan the existing code, then output two files: a TypeScript schema and a populated blueprint for the Site Development Controls module.

---

## INSTRUCTIONS FOR THE CODEBASE AI

You are generating a **Module Blueprint** — a typed declarative snapshot of the Site Development Controls 3D Lab module's complete UI state. This blueprint is an interchange format: other AI models will receive it for UX audit, learning science review, and compliance verification, then return it modified. You will later consume the modified blueprint to update the actual codebase.

**Your job has two parts:**

1. **Output File 1:** `src/types/module-blueprint.ts` — the reusable `ModuleBlueprint` TypeScript interface (the schema). If this file already exists, skip this step.
2. **Output File 2:** `src/components/3d-lab/modules/SiteDevControls/site-dev-controls.blueprint.ts` — the populated blueprint for THIS module, conforming to the schema.

**Before writing anything**, scan the following paths in the codebase to understand the current implementation. Read every file. Do not guess — ground every blueprint field in actual code:

```
# Primary module code — READ ALL OF THESE
src/components/3d-lab/modules/SiteDevControls/    # or wherever the site-development-controls module lives
src/components/3d-lab/                             # shared 3D Lab components, canvas, viewer
src/stores/                                        # Zustand stores related to dev controls / 3D Lab
src/lib/                                           # computation engines, helpers
src/types/                                         # existing type definitions

# Also scan for
- Any file containing "site-dev" or "SiteDev" or "development-controls" or "DevControls"
- Any Zustand store that manages lot dimensions, zoning, setbacks, compliance state
- The route file at app/dashboard/3d-lab/site-development-controls/page.tsx (or equivalent)
```

If a file or directory doesn't exist, note that in a comment and infer from what IS there.

---

## FILE 1: THE SCHEMA — `module-blueprint.ts`

Generate the following TypeScript interface. This is the universal schema — it must work for ANY 3D Lab module (Stairs, Unified Wall, future modules), not just Site Dev Controls. Every field must be documented with JSDoc.

```typescript
// src/types/module-blueprint.ts
// ═══════════════════════════════════════════════════════════════
// ModuleBlueprint — AI-Portable Interchange Format for 3D Lab Modules
// ═══════════════════════════════════════════════════════════════
//
// PURPOSE:
//   Captures the complete declarative UI state of a 3D Lab module
//   in a single file that any AI model can read, audit, and return
//   modified. The codebase AI then consumes changes to update code.
//
// RULES:
//   1. Every field is DECLARATIVE, not imperative. Describe WHAT, never HOW.
//   2. No React components, no JSX, no hooks — pure data.
//   3. All values must be serializable (no functions, no class instances).
//      Exception: `validatorSignature` fields describe function shape as strings.
//   4. Use string unions over enums for JSON portability.
//   5. Every field that exists in the codebase MUST be captured here.
//      If the current UI has it, the blueprint has it.
//
// VERSIONING:
//   Bump `schemaVersion` when fields are added/removed/renamed.
// ═══════════════════════════════════════════════════════════════

export interface ModuleBlueprint {
  /** Schema version for forward compatibility. Semver string. */
  schemaVersion: string

  // ─── MODULE IDENTITY ──────────────────────────────────────
  meta: ModuleMeta

  // ─── ZUSTAND STORE SHAPE ──────────────────────────────────
  /** Describes the Zustand store fields, their types, and default values.
   *  This is THE source of truth for what state this module manages. */
  store: StoreSchema

  // ─── LEFT SIDEBAR: CONTROL PANELS ────────────────────────
  /** Top-level tabs (e.g., Lot | Build | Settings) */
  sidebar: SidebarSchema

  // ─── CENTER: 3D VIEWPORT ──────────────────────────────────
  scene: SceneSchema

  // ─── RIGHT SIDEBAR: COMPLIANCE / INFO PANELS ──────────────
  infoPanel: InfoPanelSchema

  // ─── BOTTOM HUD ───────────────────────────────────────────
  hud: HudSchema

  // ─── GUIDED TOUR ──────────────────────────────────────────
  tour: TourSchema

  // ─── TOOLBAR (top of viewport) ────────────────────────────
  toolbar: ToolbarSchema

  // ─── COMPUTATION ENGINE ───────────────────────────────────
  /** Pure function signatures that drive computed values.
   *  Not the implementation — just input→output signatures. */
  computations: ComputationSchema[]

  // ─── CODE COMPLIANCE RULES ────────────────────────────────
  compliance: ComplianceRuleSchema[]

  // ─── LEARNING INTEGRATION ─────────────────────────────────
  learning: LearningSchema

  // ─── INTERACTION MAP ──────────────────────────────────────
  /** Which control drives which parameter / visual change */
  bindings: BindingSchema[]

  // ─── CAMERA PRESETS ───────────────────────────────────────
  cameraPresets: CameraPreset[]

  // ─── KEYBOARD SHORTCUTS ───────────────────────────────────
  shortcuts: ShortcutSchema[]
}

// ═══════════════════════════════════════════════════════════════
// SUB-SCHEMAS
// ═══════════════════════════════════════════════════════════════

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
  /** Control ID — matches store field name or action name */
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
  /** React component name as string — for documentation only */
  componentName: string
  /** Description of what this custom control does */
  behavior: string
}

// ─── SCENE ──────────────────────────────────────────────────

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

// ─── INFO PANEL (Right Sidebar) ─────────────────────────────

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

// ─── HUD (Bottom Overlay) ───────────────────────────────────

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

// ─── TOUR ───────────────────────────────────────────────────

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

// ─── TOOLBAR ────────────────────────────────────────────────

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

// ─── COMPUTATIONS ───────────────────────────────────────────

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
  /** The formula in readable notation (e.g., "AMBF = min(setbackArea, PSO × TLA, TOSL × TLA)") */
  formula?: string
}

// ─── COMPLIANCE ─────────────────────────────────────────────

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
}

// ─── LEARNING ───────────────────────────────────────────────

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
  /** Success criteria — how we know the module worked */
  successCriteria: string
  /** Quiz integration points within the module (not tour quizzes) */
  quizIntegration: {
    type: 'post-exploration' | 'checkpoint' | 'in-situ'
    description: string
  }[]
}

// ─── BINDINGS ───────────────────────────────────────────────

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

// ─── CAMERA PRESETS ─────────────────────────────────────────

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

// ─── SHORTCUTS ──────────────────────────────────────────────

export interface ShortcutSchema {
  key: string
  modifier?: 'ctrl' | 'shift' | 'alt' | 'meta'
  action: string
  description: string
}
```

---

## FILE 2: THE POPULATED BLUEPRINT — `site-dev-controls.blueprint.ts`

Now, **scan the actual codebase** and populate every field of the blueprint for the Site Development Controls module. Here is what the UI contains based on the current production state (use this as a cross-reference — always prefer what you find in code):

### LEFT SIDEBAR — LOT TAB (active by default)

**Tabs:** `Lot` | `Build` | `Settings`

**Lot Tab contents (top to bottom):**

1. **ZONING CLASSIFICATION** — Dropdown: "R-1 Low-Density Residential" (sets Table VIII.1 development controls). Changing this reconfigures all Table VIII.1 values (PSO, ISA, USA, TOSL, BHL, FLAR).

2. **LOT PARAMETERS** — Three sliders:
   - LOT WIDTH: value 20.0 m (with slider + numeric display)
   - LOT DEPTH: value 15.0 m (with slider + numeric display)
   - RROW WIDTH: value 10 m (with slider + numeric display)

3. **TABLE VIII.1 REFERENCE** — Display-only card showing:
   - PSO: N/A (setback-only)
   - ISA: 10% of TLA
   - USA: 15% of TLA
   - TOSL: 45% of TLA
   - BHL: 3F / 10m
   - FLAR: 1.5~1.5

4. **LOT SUMMARY** — Display-only card showing computed values:
   - Total Lot Area: 300.0 sqm
   - Frontage: 20.0 m
   - Lot Depth: 15.0 m
   - RROW: 10 m

5. **PRESETS** — Collapsible section with a Reset button

6. **VIOLATION CASE STUDIES** — Collapsible section with a warning (⚠) badge

### BUILD TAB & SETTINGS TAB

Scan the code for whatever controls exist under these tabs. Common Build tab controls: number of floors, floor height, building footprint adjustments, setback overrides. Settings tab: visual settings, dimension display toggles, unit system.

### 3D VIEWPORT

**Scene objects visible:**
- **Lot ground plane** — flat rectangular surface representing the lot boundary
- **Building massing** — 3D extruded volume representing the building within the lot (semi-transparent dark material)
- **Setback zone planes** — colored planes on the lot surface showing front/rear/side setback areas (appear as reddish translucent strips)
- **RROW (Road Right-of-Way)** — shown as a separate zone at the front of the lot
- **Setback boundary lines** — red lines delineating setback edges

**Toolbar (top-left of viewport):** 7 icon buttons — identify each from the code. Likely: grid toggle, pen/draw, eye/visibility, layers, cube/3D, settings/gear, fullscreen.

### RIGHT SIDEBAR — COMPLIANCE PANEL

1. **COMPLIANCE STATUS** — Top bar: "PASS" badge with "9 of 9 checks pass" and a full green progress bar.

2. **AMBF THREE-WAY CHECK** — Expandable section showing three AMBF computation methods:
   - **By Setback** (with a "GOVERNS" badge): 136.0 sqm — with formula `(W-L-R)(D-F-Rear?)`
   - **By PSO**: 136.0 sqm — with formula `PSO% × TLA`
   - **By TOSL**: 136.0 sqm — with formula `(1-TOSL%) × TLA = PSO` and notes showing `AMBF = min(setback, PSO) = 136.0 sqm (45.3% of TLA)`

3. **AREA CLOSURE IDENTITY** — Stacked horizontal bar visualization:
   - Segments: AMBF (dark) + ISA (blue) + USA (lighter) = verified
   - Numeric: 136 + 90 + 74 = 300 sqm

4. **DETAILED SCORECARD** — Grid of pass/fail checks:
   - AMBF ✓, TOSL ✓, ISA ✓
   - USA ✓, BHL ✓, TGFA ✓
   - AMVB ✓, FLOORHEIGHT ✓, AREA ✓

5. **CODE REFERENCE** — Collapsible section (collapsed in screenshot)

### BOTTOM HUD

**Metrics bar (dark background, center-bottom):**
- TLA: 300 sqm
- AMBF: 136 sqm
- PSO: 45.3 %
- TOSL: 164 sqm
- BHL: 3F

**Camera preset buttons (below metrics):**
- Orbit | Plan | Front | Iso | Dims

**Chat input** — small input field at bottom center (below camera buttons)

### GUIDED TOUR (overlay at bottom-center)

Currently showing: "STEP 1 OF 6 — Read the Lot"
Narration: "Start with the Total Lot Area (TLA). The lot boundary defines the full extent of your site — everything else is carved from this."
Buttons: [Next] [Skip tour]
Progress: 6 dots indicating 6 total stops.

### BOTTOM STATUS BAR

Fixed bar at very bottom: "R-1 Low-Density Residential   FLAR 1.50   BHL 3F/9m"
Right side: "INSTITUTIONAL" toggle/label

---

### CRITICAL INSTRUCTIONS FOR POPULATING THE BLUEPRINT

1. **Scan every React component file** in the module directory. For each component, identify:
   - What props it receives
   - What store fields it reads (look for `useDevControlsStore` or similar Zustand selectors)
   - What store actions it dispatches
   - What visual elements it renders

2. **Scan the Zustand store** completely. Every field, every action, every computed selector. Document the full shape in `store.fields`.

3. **Scan the computation engine** (likely in `src/lib/` or co-located). Document every pure function: its name, inputs, outputs, and the formula it implements.

4. **For each SidebarControl**, find the exact `min`, `max`, `step`, `defaultValue` from the code. Do not guess. If a slider's range isn't explicitly defined, note it with a `// TODO: verify range` comment.

5. **For each compliance rule**, find where pass/fail is evaluated. Document the exact logic.

6. **For each scene object**, describe what geometry primitive or parametric function creates it, what store fields drive its position/scale/visibility, and what material it uses.

7. **For bindings**, trace the full reactive chain: slider → store field → computation → derived value → scene object update + compliance re-evaluation + HUD metric update.

8. **For the tour**, find all 6 stops and their exact narration text, camera positions, and any quiz questions.

9. **Include ALL tabs** (Lot, Build, Settings). If Build or Settings tabs exist in code, document them fully.

10. **Mark anything uncertain** with `// AUDIT: [question]` comments so the reviewing AI knows what to check.

---

### OUTPUT FORMAT

```typescript
// src/components/3d-lab/modules/SiteDevControls/site-dev-controls.blueprint.ts
import type { ModuleBlueprint } from '@/types/module-blueprint'

export const siteDevControlsBlueprint: ModuleBlueprint = {
  schemaVersion: '1.0.0',

  meta: {
    slug: 'site-development-controls',
    displayName: 'Site Development Controls',
    // ... populate every field from the codebase
  },

  store: {
    storeName: 'useDevControlsStore', // or whatever the actual store name is
    filePath: 'stores/...', // actual path
    fields: [
      // ... every single field
    ],
  },

  sidebar: {
    // ... every tab, every section, every control
    // with exact min/max/step/default from code
  },

  scene: {
    // ... canvas config, lighting, objects, overlays
  },

  infoPanel: {
    // ... every section of the right sidebar
  },

  hud: {
    // ... every metric, every extra
  },

  tour: {
    // ... all 6 stops with exact narration text
  },

  toolbar: {
    // ... all 7 toolbar buttons
  },

  computations: [
    // ... every computation function with formula
  ],

  compliance: [
    // ... all 9 compliance checks
  ],

  learning: {
    // ... objectives, Bloom's level, key values
  },

  bindings: [
    // ... every slider → store → computation → visual chain
  ],

  cameraPresets: [
    // ... Orbit, Plan, Front, Iso, Dims
  ],

  shortcuts: [
    // ... any keyboard shortcuts
  ],
}
```

---

### WHAT SUCCESS LOOKS LIKE

The output blueprint file should be:

- **Complete** — An AI that has NEVER seen the SlateCamp codebase can read this blueprint and understand exactly what the Site Development Controls module looks like, how it works, what it computes, and how every UI element connects to every other.
- **Accurate** — Every value (slider ranges, zoning options, formula expressions, tour narration) comes directly from the codebase, not invented.
- **Auditable** — A UX reviewer, learning scientist, or code compliance expert can read this file and give specific, actionable feedback on any section.
- **Round-trippable** — You (the codebase AI) can later receive a modified blueprint back and know exactly which files to update to implement the changes.

If any section of the codebase is missing, incomplete, or inconsistent with the UI screenshot described above, flag it with `// GAP: [description]` so the audit AI can recommend what to build.
