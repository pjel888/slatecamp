# PROMPT: Generate Module Blueprint for Unified Wall Configurator

> **What this is:** A single prompt you paste into your codebase AI (Claude Code, Cursor, etc.) that has access to the SlateCamp repo. The AI will scan the existing code, then output a populated blueprint for the Unified Wall Configurator module.

---

## INSTRUCTIONS FOR THE CODEBASE AI

You are generating a **Module Blueprint** — a typed declarative snapshot of the Unified Wall Configurator 3D Lab module's complete UI state. This blueprint is an interchange format: other AI models will receive it for UX audit, learning science review, construction accuracy verification, and cost estimation review, then return it modified.

**Your job:**

1. **Check if `src/types/module-blueprint.ts` already exists.** If it does, import the types. If it doesn't, generate it first using the schema from the Site Development Controls blueprint prompt. Then **extend the schema** as needed for this module's unique features (performance metrics, bill of materials, view modes, material layer system). Mark all extensions with `// EXTENDED: Added for UnifiedWallConfigurator`.
2. **Output:** `src/components/3d-lab/modules/UnifiedWallConfigurator/unified-wall-configurator.blueprint.ts` — the populated blueprint conforming to the `ModuleBlueprint` schema.

**Before writing anything**, scan the following paths in the codebase. Read every file. Do not guess — ground every blueprint field in actual code:

```
# Primary module code — READ ALL OF THESE
src/components/3d-lab/modules/UnifiedWallConfigurator/   # or wherever this module lives
src/components/3d-lab/modules/UnifiedWall/               # alternative naming
src/components/3d-lab/modules/*wall*                     # any wall-related module
src/components/3d-lab/                                   # shared 3D Lab components

# State management
src/stores/*wall*                                        # wall configurator store
src/stores/*material*                                    # material/BOM store
src/stores/*performance*                                 # performance metrics store

# Computation / estimation
src/lib/*wall*                                           # wall computation engine
src/lib/*material*                                       # material estimation
src/lib/*cost*                                           # cost computation
src/lib/*bom*                                            # bill of materials
src/lib/*fire*                                           # fire rating computation
src/lib/*acoustic*                                       # acoustic (STC) computation
src/lib/*thermal*                                        # thermal (R-value) computation

# Types
src/types/*wall*
src/types/*material*

# Route
app/dashboard/3d-lab/unified-wall-configurator/page.tsx  # or equivalent

# Also scan for any file containing:
# "UnifiedWall" "WallConfigurator" "CHB" "drywall" "plywood"
# "BillOfMaterials" "BOM" "materialTakeoff" "fire-rating"
# "STC" "R-value" "thermal" "acoustic" "finish-layer"
```

---

## WHAT THE UI CONTAINS — CROSS-REFERENCE GUIDE

Use this as a visual cross-reference. **Always prefer what you find in code.**

---

### LEFT SIDEBAR

**View mode tabs at top:** `Overview` (active, filled blue) | `Section Cut` | `Exploded` | `Build`

These tabs change the 3D viewport visualization:
- **Overview** — Full 3D wall with all layers composed (current view)
- **Section Cut** — Cross-section showing material layers from inside to outside
- **Exploded** — Layers pulled apart spatially so each layer is individually visible
- **Build** — Step-by-step construction sequence animation/slideshow

Scan the code for what each view mode does to the scene. This is a CRITICAL UI feature — the four view modes are likely the module's primary educational mechanism, letting students see the same wall from different perspectives.

**1. WALL TYPE — Visual Card Selector**

Three cards in a horizontal row, each showing:
- A material thumbnail image
- Material name
- Thickness value
- Approximate cost per sqm

Current options:
- **CHB** (selected/active) — shows concrete block image, "150mm", "₱1.6k"
- **Drywall** — shows drywall image, "90mm", "₱1.2k"
- **Plywood** — shows plywood image, "75mm", "₱1.0k"

Selecting a card changes the entire wall assembly — core material, available finish layers, computation formulas, performance metrics, and bill of materials all change. This is NOT just a dropdown — it's a visual card selector component.

Scan the code for:
- The full list of wall types (there may be more than these 3 — the presets mention HardieFlex, Brick, Concrete)
- The wall assembly definition for each type (which layers compose the wall)
- Whether additional wall types are unlockable or planned

**2. UNIFIED WALL CONFIGURATOR — Parameters** (with refresh icon)

**Context card:** "You are preparing a wall material takeoff for a mixed-use building with different wall types per area. Determine the correct finishing sequence and estimate materials for each wall type under Philippine construction standards."

**3. PRESETS** — 12 outline tag buttons (all construction scenarios, no violation presets):

- `Standard CHB Room`
- `Drywall Office Partition`
- `Plywood Temp Partition`
- `HardieFlex Exterior`
- `Brick Feature Wall`
- `Concrete Basement`
- `Quick Repaint`
- `CHB with Reinforcement`
- `Drywall with Framing`
- `Fire-Rated Corridor`
- `Bathroom Wall (6" studs)`
- `Budget Partition`

**CRITICAL:** Each preset configures the complete wall assembly: core type, dimensions, finish layers, reinforcement, and any special features. Some presets likely set wall types that aren't in the 3 visible cards (e.g., "Brick Feature Wall", "Concrete Basement", "HardieFlex Exterior"). Document the exact configuration each preset applies.

**4. DIMENSIONS** (collapsible section):
- **Wall Length:** 5000 mm (slider, range 1000–10000)
- **Wall Height:** 3000 mm (slider, range 2400–4000)
- Check code for additional dimension controls (wall thickness may be set by wall type, not slider)

**5. WALL TYPE** (collapsible section — separate from the visual card selector):
- **Wall Core Type:** Dropdown `chb`
- This section likely contains additional configuration below the dropdown that's cut off in the screenshot. Scan for:
  - CHB block size (4", 6", 8")
  - Reinforcement options (rebar spacing, bond beam)
  - Core fill (hollow vs. grouted)
  - Drywall-specific: stud spacing, stud gauge, number of board layers
  - Plywood-specific: thickness, grade

**6. FINISH LAYERS** — Scan the code for a finish layer configuration section. This module is about FINISHING SEQUENCE, so there must be controls for:
- Interior finish (plaster, skim coat, paint, tiles, wallpaper)
- Exterior finish (if applicable)
- Primer type and coats
- Paint type and coats
- Waterproofing (for bathroom walls)
- Fire-rated board layers (for fire-rated corridor preset)
- The ORDER of layers matters — this is a construction sequence tool

**7. Any additional sections** — Scan for:
- Opening deductions (doors, windows)
- Special features (electrical boxes, plumbing rough-in)
- Construction method notes
- ALE exam integration / quiz triggers

---

### 3D VIEWPORT

**Overview mode (current):**
- 3D wall segment with visible material layers
- Clean architectural rendering (light gray surfaces, subtle edge rendering)
- Wall appears as a standing panel with a perpendicular return/wing wall at one end
- Floor surface visible
- Material color coding may be subtle in overview mode

**Section Cut mode:** Scan code for:
- Cross-section plane cutting through the wall
- Each material layer visible in cross-section with labels
- Layer thicknesses annotated
- Material hatching patterns (CHB blocks, drywall, etc.)

**Exploded mode:** Scan code for:
- Each layer spatially separated along the thickness axis
- Individual layer labels (core → plaster → primer → paint, etc.)
- Layer thickness annotations
- Connection/sequence arrows or numbering

**Build mode:** Scan code for:
- Step-by-step construction sequence
- Animated layer addition or manual step-through
- Construction instruction text per step
- The order: typically foundation → core wall → structural (rebar/grouting) → rough plaster → finish plaster → primer → paint

**Scene objects to document:**
- Core wall geometry (CHB blocks / drywall boards / plywood sheets)
- Individual finish layer geometries
- Reinforcement elements (rebar, bond beam — for CHB)
- Framing elements (studs, tracks — for drywall)
- Floor/ground plane
- Dimension annotations
- Layer labels (for section cut and exploded views)
- Material color coding per layer

**Viewport toolbar (bottom-center):** Three icon buttons:
- Green refresh/regenerate
- Expand/fullscreen
- Reset view

---

### RIGHT SIDEBAR — PERFORMANCE + BOM

This right panel is fundamentally different from the other two modules. It shows PERFORMANCE METRICS and a BILL OF MATERIALS, not compliance checks.

**1. PERFORMANCE** — Header section with 4 metric cards in a 2×2 grid:

| Metric | Value | Details |
|--------|-------|---------|
| 🔥 FIRE | 2 hr 15 min | "RA 9514 ✓" with progress bar |
| 🔊 ACOUSTIC | STC 47 | "IBC min Δ..." with progress bar |
| ₱ COST/SQM | ₱3,200 | with progress bar |
| 🌡️ THERMAL | R-1.8 | with progress bar |

Each card has:
- Icon (fire, acoustic, cost, thermal)
- Metric label
- Value with unit
- Reference standard or benchmark
- Progress/quality bar (indicating how good the value is relative to benchmarks)

Document from code:
- How each metric is computed (which wall assembly properties feed into it)
- What the benchmark ranges are (what makes the progress bar full vs. empty)
- Which code references apply (RA 9514 for fire, IBC for acoustic, etc.)
- How these metrics change when wall type or layers change

**2. COMPLIANCE REPORT** — "ALL PASS" badge
- Disclaimer text: "Visual design aid only. Final authority rests with your LGU Building Official and the Bureau of Fire Protection."
- Scan code for what compliance checks exist — likely fire rating compliance per RA 9514 and possibly structural adequacy per NSCP

**3. BILL OF MATERIALS** — "₱15,490" total with expand/collapse icon

Line-item cost breakdown organized by category:

**CORE MATERIALS:**
- CHB Blocks: 263 pcs — ₱3,654
- Mortar: 0.33 cu.m. — ₱1,155

**STRUCTURAL:**
- Rebar 12mm: 36.99 pcs (6m) — ₱3,238

**FINISH LAYERS:**
- Plaster: 0.21 cu.m. — ₱751
- Primer: 2.66 liters — ₱400
- Paint: 4.66 liters — ₱1,000

**LABOR:**
- Mason Labor: 3.99 man-days — ₱2,700
- Helper Labor: 3.99 man-days — ₱1,800
- Painter Labor: 1.99 man-days — ₱800

**Total: ₱15,490**

**CRITICAL BOM DOCUMENTATION:** For each line item, document from code:
- The formula that computes the quantity (e.g., CHB blocks = wallArea / blockFaceArea × wasteFactor)
- The unit price source (hardcoded? configurable? fetched from a price table?)
- The unit of measure
- How the line items change when wall type changes (drywall BOM is completely different from CHB BOM)
- Labor computation formulas (productivity rates per man-day)
- Waste factors applied

---

### BOTTOM AREA

- "Prices are approximate... in Metro and suburbs" disclaimer
- INSTITUTIONAL toggle (bottom-right)

---

## SCHEMA EXTENSIONS NEEDED

The base `ModuleBlueprint` schema (from Site Dev Controls) does NOT have fields for:

1. **View modes** — The 4-tab viewport switcher (Overview/Section Cut/Exploded/Build) needs a schema addition. Add:

```typescript
export interface ViewModeSchema {
  /** Available view modes for the 3D viewport */
  modes: ViewMode[]
  /** Default active mode */
  defaultMode: string
}

export interface ViewMode {
  id: string
  label: string
  icon?: string
  /** What changes in the scene when this mode is active */
  sceneEffect: string
  /** Which scene objects are visible/hidden in this mode */
  objectVisibility: Record<string, boolean | string>
  /** Camera behavior in this mode (free orbit? locked? animated?) */
  cameraBehavior: string
  /** Any special UI elements that appear only in this mode */
  modeSpecificUI?: string
}
```

2. **Performance metrics** — The 4-card performance panel needs:

```typescript
export interface PerformanceMetricSchema {
  id: string
  label: string
  icon: string
  unit: string
  /** How this metric is computed */
  computation: string
  /** Store field or computed expression for the value */
  sourceExpression: string
  /** Benchmark for the progress bar (min/max range for "good") */
  benchmark: { min: number; max: number; optimalDirection: 'higher' | 'lower' }
  /** Code reference (e.g., "RA 9514" for fire rating) */
  codeReference?: string
}
```

3. **Bill of Materials** — The itemized cost panel needs:

```typescript
export interface BillOfMaterialsSchema {
  /** Total cost source expression */
  totalCostExpression: string
  /** Currency symbol */
  currency: string
  /** Line item categories */
  categories: BOMCategory[]
  /** Disclaimer text */
  disclaimer?: string
}

export interface BOMCategory {
  id: string
  label: string
  items: BOMItem[]
}

export interface BOMItem {
  id: string
  /** Material/labor name */
  name: string
  /** Quantity computation formula description */
  quantityFormula: string
  /** Store field or expression for computed quantity */
  quantityExpression: string
  /** Unit of measure (pcs, cu.m., liters, man-days, etc.) */
  unit: string
  /** Unit price (or expression if dynamic) */
  unitPrice: number | string
  /** Total cost expression */
  totalCostExpression: string
  /** Does this item exist for ALL wall types or only specific ones? */
  applicableWallTypes: string[] | 'all'
}
```

4. **Wall assembly / layer system** — The core data model for this module:

```typescript
export interface WallAssemblySchema {
  /** Available wall types */
  wallTypes: WallTypeDefinition[]
  /** The layer stack model — how layers compose */
  layerSystem: LayerDefinition[]
}

export interface WallTypeDefinition {
  id: string
  label: string
  /** Thumbnail image path */
  thumbnail?: string
  /** Base thickness in mm */
  baseThickness: number
  /** Approximate cost per sqm for the card display */
  approxCostPerSqm: number
  /** Which layers are included by default */
  defaultLayers: string[]
  /** Available optional layers */
  optionalLayers: string[]
  /** Core-specific configuration options */
  coreConfig: Record<string, unknown>
}

export interface LayerDefinition {
  id: string
  label: string
  /** Layer category */
  category: 'core' | 'structural' | 'finish' | 'waterproofing' | 'insulation' | 'fire-rated'
  /** Position in the assembly (inside-to-outside order) */
  order: number
  /** Thickness in mm (fixed or parametric) */
  thickness: number | string
  /** Material properties for performance calculations */
  materialProperties: {
    fireRatingMinutes?: number
    stcContribution?: number
    thermalR?: number
    density?: number
  }
  /** Visual properties for 3D rendering */
  visual: {
    color: string
    opacity: number
    hatchPattern?: string
  }
}
```

5. **Presets** — Same as Stairway Configurator extension. If not already added, add the `presets` field to the top-level `ModuleBlueprint`.

Add ALL of these to `module-blueprint.ts` as optional fields (so existing blueprints still conform):

```typescript
export interface ModuleBlueprint {
  // ... existing fields ...

  /** View mode switcher (e.g., Overview/Section Cut/Exploded/Build). Optional. */
  viewModes?: ViewModeSchema

  /** Performance metrics panel. Optional. */
  performanceMetrics?: PerformanceMetricSchema[]

  /** Bill of Materials / cost estimation panel. Optional. */
  billOfMaterials?: BillOfMaterialsSchema

  /** Wall assembly / material layer system. Optional. */
  wallAssembly?: WallAssemblySchema

  /** Preset configurations. Optional. */
  presets?: PresetSchema[]
}
```

---

## CRITICAL INSTRUCTIONS FOR POPULATING THE BLUEPRINT

### 1. Wall Assembly Data Model

This is the heart of the module. Scan the code for the complete wall assembly definition system:
- How are wall types defined? (TypeScript interfaces, config objects, database records?)
- What layers does each wall type include?
- How does changing the wall type rebuild the entire assembly, BOM, and performance metrics?
- What's the layer ordering system? (inside → outside? numbered?)

### 2. Material Estimation Engine

Document every computation function for material quantities:
- CHB block count formula (wall area ÷ block face area × waste factor — what's the waste factor?)
- Mortar volume formula (joints × mortar per joint — what joint thickness?)
- Rebar quantity (spacing rules — every how many courses? vertical rebar spacing?)
- Plaster volume (area × thickness — what thickness per coat?)
- Paint coverage (area ÷ spreading rate — what spreading rate per paint type?)
- Labor productivity rates (how many sqm per man-day for each trade?)
- Drywall: board count, screw count, joint tape, joint compound
- Plywood: sheet count, nail count, framing lumber

For EVERY formula, document the actual constants used in code (waste factors, productivity rates, unit prices). These are the values a construction estimating expert will audit.

### 3. Performance Computations

Document how each performance metric is calculated:
- **Fire rating:** Based on wall assembly (e.g., 150mm CHB = 2 hours, plus finish layer contributions). What lookup table or formula is used? Reference RA 9514 fire resistance tables.
- **STC (Sound Transmission Class):** Based on mass law + layer composition. What formula? IBC reference?
- **Cost/sqm:** Total BOM cost ÷ wall area. Simple, but document the aggregation.
- **Thermal R-value:** Sum of layer R-values. What R-value per material? What standard?

### 4. View Mode Scene Configurations

For each of the 4 view modes, document:
- Which scene objects are visible/hidden
- Camera position and constraints
- Any animation (Build mode likely has sequential layer animation)
- Any additional UI overlays (labels, dimensions, sequence numbers)
- How the transition between modes works (instant swap? animation?)

### 5. Presets — Complete Assembly Definitions

For ALL 12 presets, document:
- Which wall type they set
- Which layers they enable/disable
- Dimension overrides
- Any special configuration (reinforcement spacing, stud gauge, etc.)
- The pedagogical purpose (what construction scenario does this represent?)

Example:
```typescript
{
  presetId: 'fire-rated-corridor',
  label: 'Fire-Rated Corridor',
  wallType: 'drywall',           // or 'chb'?
  dimensions: { length: 5000, height: 3000 },
  layers: ['core', 'fire-rated-board', 'fire-rated-board', 'joint-compound', 'primer', 'fire-rated-paint'],
  coreConfig: { studSpacing: 400, studGauge: 20, boardLayers: 2 },
  teachingPoint: 'Shows how double-layer Type X drywall achieves 2-hour fire rating for corridor walls per RA 9514.',
}
```

### 6. Unit Prices and Philippine Market Data

The BOM uses Philippine peso pricing. Document:
- Where unit prices are stored (hardcoded constants? config file? Supabase table?)
- The price date/source (2024 Metro Manila prices? DPWH unit costs? RSMeans PH?)
- Whether prices are user-editable or fixed
- The "Metro and suburbs" qualifier in the disclaimer

### 7. Construction Sequence (Build Mode)

If Build mode implements a step-by-step construction sequence, document:
- The number of steps
- What each step adds to the scene
- The narration/instruction text per step
- Whether it's animated or manual step-through
- The pedagogical connection to ALE exam content (ALE tests finishing sequences)

### 8. Mark All Uncertainties

Use these comment tags:
- `// AUDIT: [question for reviewing AI]` — things the reviewer should check
- `// GAP: [missing feature]` — features that should exist but don't
- `// VERIFY-PRICE: [item]` — unit prices that need market verification
- `// VERIFY-FORMULA: [computation]` — estimation formulas that need construction expert verification
- `// CONFLICT: [description]` — code vs. UI discrepancies

---

## OUTPUT FORMAT

```typescript
// src/components/3d-lab/modules/UnifiedWallConfigurator/unified-wall-configurator.blueprint.ts
import type { ModuleBlueprint } from '@/types/module-blueprint'

export const unifiedWallConfiguratorBlueprint: ModuleBlueprint = {
  schemaVersion: '1.0.0',

  meta: {
    slug: 'unified-wall-configurator',
    displayName: 'Unified Wall Configurator',
    category: 'Construction Calculator',
    routePath: '/dashboard/3d-lab/unified-wall-configurator',
    aleTaxonomy: [
      'Building Technology — Wall Construction',
      'Building Technology — Material Estimation',
      'Building Technology — Finishing Sequence',
      'RA 9514 — Fire-Rated Assemblies',
    ],
    codeReferences: [
      'PD 1096 IRR — General Wall Construction Requirements',
      'RA 9514 IRR — Fire Resistance Ratings',
      'NSCP 2015 — Structural Masonry Requirements',
      'BP 344 2024 IRR — Accessible Features (grab bar blocking)',
    ],
    description: 'Interactive wall assembly configurator that visualizes CHB, drywall, and plywood construction with layer-by-layer exploded views, cross-sections, step-by-step build sequences, performance metrics (fire/acoustic/thermal/cost), and full bill of materials with Philippine market pricing.',
    status: 'production', // or actual status
  },

  store: {
    storeName: '...', // from code
    filePath: '...',
    fields: [
      // Wall type selection
      // Dimension parameters (length, height)
      // Core configuration (block size, stud spacing, etc.)
      // Layer enable/disable states
      // Finish layer options
      // Computed: material quantities per BOM item
      // Computed: performance metrics (fire, STC, R-value, cost)
      // Computed: total cost
      // Computed: labor estimates
      // UI state: active view mode, expanded sections, active preset
      // EVERY field from code
    ],
  },

  sidebar: {
    width: '...',
    tabs: [
      // NOTE: The sidebar itself doesn't have tabs.
      // The VIEWPORT has tabs (Overview/Section Cut/Exploded/Build).
      // The sidebar is a single scrollable panel.
      // Adapt to schema — if tabs is for sidebar only, set to null.
    ],
  },

  viewModes: {
    modes: [
      // Overview, Section Cut, Exploded, Build
      // Full scene configuration per mode
    ],
    defaultMode: 'overview',
  },

  scene: {
    // Canvas config, lighting, objects per view mode
    // Wall core geometry
    // Each finish layer as separate geometry
    // Reinforcement elements
    // Framing elements (if drywall)
    // Dimension annotations
    // Layer labels (section cut + exploded modes)
    // Construction sequence elements (build mode)
  },

  infoPanel: {
    sections: [
      // PERFORMANCE header
      // Fire rating metric card
      // Acoustic STC metric card
      // Cost/sqm metric card
      // Thermal R-value metric card
      // COMPLIANCE REPORT section
      // BILL OF MATERIALS section
    ],
  },

  performanceMetrics: [
    // Fire: { computation formula, benchmark, RA 9514 reference }
    // Acoustic: { STC computation, IBC benchmark }
    // Cost: { total ÷ area }
    // Thermal: { R-value sum of layers }
  ],

  billOfMaterials: {
    totalCostExpression: '...',
    currency: '₱',
    categories: [
      // CORE MATERIALS: CHB blocks, mortar (or drywall boards, screws, etc.)
      // STRUCTURAL: Rebar (or studs, tracks)
      // FINISH LAYERS: Plaster, primer, paint (or joint compound, tape)
      // LABOR: Mason, helper, painter (or drywall installer, taper)
    ],
    disclaimer: 'Prices are approximate... in Metro and suburbs',
  },

  wallAssembly: {
    wallTypes: [
      // CHB: { layers, config, performance baseline }
      // Drywall: { layers, config, performance baseline }
      // Plywood: { layers, config, performance baseline }
      // Any additional types from code (HardieFlex, Brick, Concrete?)
    ],
    layerSystem: [
      // Every layer definition with material properties
    ],
  },

  presets: [
    // All 12 presets with complete assembly configurations
  ],

  hud: {
    // Minimal — this module may not have a bottom HUD like Site Dev Controls
  },

  tour: {
    // From code, or GAP if not implemented
    // Recommended tour structure if missing:
    // 1. Orient — "This is a CHB wall assembly common in Philippine construction"
    // 2. Section Cut — "Switch to Section Cut to see the layers"
    // 3. Exploded — "Exploded view separates each layer"
    // 4. Build — "Build mode shows the construction sequence"
    // 5. Performance — "Check fire rating and acoustic performance"
    // 6. BOM — "The bill of materials shows exact quantities and costs"
  },

  toolbar: {
    position: 'bottom-center',
    items: [
      // Green refresh button
      // Expand/fullscreen button
      // Reset view button
    ],
  },

  computations: [
    // === MATERIAL QUANTITY COMPUTATIONS ===
    // CHB block count
    // Mortar volume
    // Rebar quantity
    // Plaster volume
    // Primer quantity
    // Paint quantity
    // (Drywall equivalents: board count, screw count, etc.)
    // (Plywood equivalents: sheet count, nail count, etc.)
    //
    // === LABOR COMPUTATIONS ===
    // Mason man-days
    // Helper man-days
    // Painter man-days
    //
    // === COST COMPUTATIONS ===
    // Per-item cost (quantity × unit price)
    // Category subtotals
    // Grand total
    //
    // === PERFORMANCE COMPUTATIONS ===
    // Fire rating from assembly layers
    // STC from mass/layer composition
    // Thermal R-value from layer properties
    // Cost per sqm
  ],

  compliance: [
    // Fire rating compliance (RA 9514 minimum for occupancy type)
    // Structural adequacy (NSCP masonry requirements if CHB)
    // Any other compliance checks from code
  ],

  learning: {
    primaryObjective: 'Identify the correct material layer sequence for CHB, drywall, and plywood wall assemblies, estimate material quantities using Philippine construction standards, and evaluate wall performance (fire, acoustic, thermal, cost).',
    bloomLevel: 3, // Apply — students apply estimation formulas and evaluate assemblies
    keyValues: [
      'Standard CHB wall: 150mm blocks, plastered both sides, 2-hour fire rating',
      'CHB mortar joint thickness: 10mm',
      'CHB rebar: every 800mm vertical, every 3rd course horizontal',
      'Plaster thickness: 15-20mm per side',
      'Paint spreading rate: approximately 12 sqm per liter',
      'Mason productivity: approximately 8 sqm per day (CHB)',
      'Drywall STC advantage over CHB at equivalent thickness',
    ],
    prerequisites: [
      'Basic construction material knowledge',
      'Understanding of wall assembly layers',
      'Familiarity with Philippine unit costs',
    ],
    aleQuestionTypes: [
      'Given wall dimensions, compute number of CHB blocks needed',
      'Identify the correct finishing sequence for a CHB wall',
      'Compare fire ratings of different wall assemblies',
      'Estimate mortar quantity for a given wall area',
      'Determine which wall type meets a specific fire rating requirement',
      'Identify materials in an exploded wall section diagram',
    ],
    successCriteria: 'Student can estimate CHB block count within 5% of computed answer and correctly sequence all finishing layers from core to final paint.',
    quizIntegration: [],
  },

  bindings: [
    // === WALL TYPE CHANGE ===
    // wallType card selection → store → rebuild entire assembly → recompute ALL quantities
    //   → recompute ALL performance metrics → rebuild BOM → rebuild 3D geometry

    // === DIMENSION CHANGES ===
    // wallLength slider → store → recompute wall area → recompute ALL quantities → update BOM
    // wallHeight slider → store → recompute wall area → recompute ALL quantities → update BOM

    // === CORE CONFIG CHANGES ===
    // (CHB) blockSize dropdown → store → recompute block count + mortar + rebar
    // (Drywall) studSpacing → store → recompute stud count + board layout
    // etc.

    // === LAYER TOGGLES ===
    // Each finish layer toggle → store → add/remove layer → recompute performance + BOM

    // === VIEW MODE ===
    // viewMode tab → store → change scene object visibility + camera

    // === PRESETS ===
    // Each preset → sets multiple store fields → triggers full recomputation
  ],

  cameraPresets: [
    // Likely no named camera presets (unlike Site Dev Controls)
    // Camera behavior may be controlled by view mode instead
    // Document from code
  ],

  shortcuts: [
    // From code
  ],
}
```

---

## WHAT SUCCESS LOOKS LIKE

The output blueprint must pass these tests:

1. **Construction accuracy** — A licensed architect or quantity surveyor can review the BOM formulas and verify that block counts, mortar volumes, rebar quantities, and labor estimates are reasonable for Philippine construction practice.

2. **Assembly completeness** — Every wall type's complete layer stack is documented. An auditor can verify that a "Fire-Rated Corridor" preset actually produces a 2-hour fire-rated assembly.

3. **View mode fidelity** — The 4 view modes are fully documented with their scene configurations. An auditor can verify that Section Cut shows a true cross-section and Build mode shows a correct construction sequence.

4. **Price auditability** — Every unit price is documented with its source. An auditor can flag prices that are outdated or incorrect for current Philippine market conditions.

5. **Pedagogical alignment** — The learning objectives and key values align with ALE Building Technology exam content. An auditor can verify that the material estimation formulas match what's taught in BS Architecture programs.

6. **Round-trippable** — You (the codebase AI) can later receive this blueprint back with modifications (e.g., "AUDIT: Add waterproofing layer option for bathroom walls", "VERIFY-PRICE: CHB block price should be ₱14, not ₱13.90") and know exactly which files to update.
