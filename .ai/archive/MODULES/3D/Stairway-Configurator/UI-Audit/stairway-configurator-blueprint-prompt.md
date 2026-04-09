# PROMPT: Generate Module Blueprint for Stairway Configurator

> **What this is:** A single prompt you paste into your codebase AI (Claude Code, Cursor, etc.) that has access to the SlateCamp repo. The AI will scan the existing code, then output a populated blueprint for the Stairway Configurator module.

---

## INSTRUCTIONS FOR THE CODEBASE AI

You are generating a **Module Blueprint** — a typed declarative snapshot of the Stairway Configurator 3D Lab module's complete UI state. This blueprint is an interchange format: other AI models will receive it for UX audit, learning science review, and code compliance verification, then return it modified.

**Your job:**

1. **Check if `src/types/module-blueprint.ts` already exists.** If it does, import the types from there. If it doesn't, generate it first using the schema defined at the bottom of this prompt (Appendix A).
2. **Output:** `src/components/3d-lab/modules/StairwayConfigurator/stairway-configurator.blueprint.ts` — the populated blueprint conforming to the `ModuleBlueprint` schema.

**Before writing anything**, scan the following paths in the codebase. Read every file. Do not guess — ground every blueprint field in actual code:

```
# Primary module code — READ ALL OF THESE
src/components/3d-lab/modules/StairwayConfigurator/    # or wherever the stairway module lives
src/components/3d-lab/modules/Stairs/                  # alternative naming
src/components/3d-lab/                                 # shared 3D Lab components, canvas, viewer

# State management
src/stores/                                            # Zustand stores — look for stairway/stair store
src/stores/*stair*                                     # any stair-related store
src/stores/*compliance*                                # compliance evaluation store

# Computation / validation
src/lib/                                               # computation engines, validators
src/lib/*stair*                                        # stair-specific computations
src/lib/*compliance*                                   # compliance checking logic

# Types
src/types/                                             # existing type definitions
src/types/*stair*

# Route
app/dashboard/3d-lab/stairway-configurator/page.tsx    # or equivalent route file

# Also scan for any file containing:
# "stairway" "stair-config" "StairwayConfigurator" "riser" "tread" "nosing"
# "compliance-report" "ComplianceReport" "multi-law" "violation-preset"
```

If a file or directory doesn't exist, note that in a `// GAP:` comment.

---

## WHAT THE UI CONTAINS — CROSS-REFERENCE GUIDE

Use this as a visual cross-reference. **Always prefer what you find in code.** If code differs from this description, document the code and add `// AUDIT: UI screenshot shows X but code has Y`.

---

### LEFT SIDEBAR

**No tabs** — this module uses a single scrollable panel (unlike Site Dev Controls which has Lot/Build/Settings tabs).

**Header area:**
- Module title: "STAIRWAY CONFIGURATOR"
- Sub-header: "Parameters" with a refresh/reset icon button

**1. CONTEXT CARD** (narrative scenario block at top):
- Light background card with narrative text: "You're designing stairs for a mixed-use development in Quezon City. The project must satisfy multiple overlapping codes. Explore how PD 1096, BP 220, BP 344, and RA 9514 affect the same stair geometry."
- This is a key pedagogical element — it frames the module as a multi-law conflict resolution exercise, not just a dimension checker.

**2. PRESETS** — Two rows of preset buttons:

*Compliant presets (appear as outline/tag buttons):*
- `Standard House`
- `BP 220 Housing`
- `Public Hall`
- `Exit Stair`

*Violation presets (appear as warning-styled buttons with ⚠ icons):*
- `⚠ Riser Violation (PD 1096)`
- `⚠ Tread Too Shallow (PD 1096)`
- `⚠ Too Narrow for Public (PD 1096)`
- `⚠ Headroom Crush (PD 1096)`
- `⚠ Exit Riser Violation (RA 9514)`
- `⚠ No Landing (RA 9514)`
- `⚠ Too Narrow for Wheelchair (BP 344)`
- `⚠ BP 220 vs PD 1096 Conflict`
- `⚠ RA 9514 vs PD 1096 Conflict`
- `✓ All Laws Happy` (compliant preset styled differently — check mark)
- `⚠ Everything Wrong`

**CRITICAL:** Each preset button sets specific stairway parameter values AND project classification toggles to demonstrate a particular compliance scenario. The violation presets are a pedagogical tool — students click them to SEE what a violation looks like in 3D and in the compliance report. Document the exact parameter values each preset applies.

**3. PROJECT CLASSIFICATION** (collapsible section):
- **Project Type** — Dropdown: `general_residential` (find all options in code — likely includes commercial, industrial, institutional, housing/BP220, etc.)
- **Part of Accessible Route?** — Toggle switch (off by default). When ON, activates BP 344 compliance layer.
- **Required Exit Stair?** — Toggle switch (off by default). When ON, activates RA 9514 compliance layer with stricter requirements.
- **Occupant Load > 50?** — Toggle switch (off by default). When ON, changes minimum width requirements per PD 1096.

**CRITICAL:** These toggles control WHICH compliance laws are active. The right panel's compliance sections appear/disappear or change their requirements based on these toggles. Document the exact mapping: which toggle activates which compliance rules.

**4. STAIR GEOMETRY** (collapsible section):
- **Stair Type** — Dropdown: `straight` (find all options — likely: straight, L-shaped, U-shaped, spiral, etc.)
- **Below this dropdown** — the screenshot is cut off, but there MUST be parameter sliders/inputs. Scan the code for ALL stair geometry controls. Expected controls include:
  - Riser Height (mm)
  - Tread Depth (mm)
  - Stair Width (mm)
  - Number of Risers
  - Floor-to-Floor Height (mm)
  - Landing Width (mm)
  - Landing Depth (mm)
  - Headroom Clearance (mm)
  - Handrail Height (mm)
  - Nosing Projection (mm)
  - Stringer Thickness (mm)

Document EVERY control with its exact `min`, `max`, `step`, `defaultValue`, and `unit` from the code. If a control exists in code but isn't visible in this screenshot description, include it anyway — the screenshot is truncated.

**5. Any additional sections below STAIR GEOMETRY** — Scan the code for:
- Material/visual settings
- Dimension display toggles
- Annotation toggles
- 2R+T comfort formula display
- Any other sections

---

### 3D VIEWPORT

**Scene objects visible:**

1. **Stairway geometry** — Parametric 3D model generated from stair parameters. This is NOT a loaded GLB — it's computed geometry (likely BufferGeometry or composed Three.js primitives). Includes:
   - Individual treads (horizontal step surfaces)
   - Risers (vertical faces between treads)
   - Stringers (side structural members)
   - Landing platform at top
   - Nosing projections (if enabled)

2. **Handrails** — 3D handrail geometry at the specified height. May include:
   - Primary handrail
   - Lower handrail (700mm for BP 344 — the compliance panel mentions "lower rail at 700 mm shown in 3D")
   - Balusters

3. **Headroom clearance plane** — Transparent plane showing headroom measurement (if headroom visualization is active)

4. **Dimension lines / annotations** — Dimension indicators showing riser height, tread depth, width, headroom, handrail height

5. **Floor planes** — Upper and lower floor reference planes

6. **Violation highlights** — When a parameter violates a code, the relevant geometry likely changes color (red tint, outline, etc.)

**Material/rendering:** The screenshot shows a clean architectural diagram style — light gray/white materials with visible edges/wireframe, semi-transparent where appropriate. The stair appears to use `MeshStandardMaterial` with edges visible (drei `<Edges>` component or outline rendering).

**Viewport toolbar (bottom-center):** Three small icon buttons:
- Green circular arrow (refresh/regenerate geometry)
- Expand/fullscreen icon
- Reset view icon

---

### RIGHT SIDEBAR — COMPLIANCE PANEL

**Header:** "COMPLIANCE" with "COMPLIANCE REPORT" sub-header and "ALL PASS" badge (green). Note: the top-left of the app shows "1 Issue" in red, suggesting the compliance state may actually have issues despite the "ALL PASS" badge — investigate this in code.

The compliance panel is organized **by law** (not by computation type like Site Dev Controls). Each law section is a collapsible card:

**1. RA 9514 — Fire Code** (red "1 ISSUE" badge):
- Subtitle: "Exit stair - Life-safety overlay"
- This section is ONLY active when "Required Exit Stair?" toggle is ON
- Checks:
  - ❌ `RA 9514: Max exit stair riser is 180 mm` (FAILING — red)
  - ✓ `RA 9514: Min exit stair width is 900 mm`
  - ✓ `RA 9514: Min exit stair tread is 250 mm` (verify exact value in code)
  - ✓ `RA 9514: Max 3600 mm vertical rise between landings for exit stairs`
- Source: `RA 9514 IRR - BFP`

**2. BP 344 — Accessibility** (blue "1 ISSUE" badge):
- Subtitle: "Accessible route overlay"
- This section is ONLY active when "Part of Accessible Route?" toggle is ON
- Checks:
  - ❌ `BP 344: Min accessible stair width is 1200 mm` (FAILING — red)
  - ✓ `BP 344: Primary handrail must be at 900 mm (lower rail at 700 mm shown in 3D)`
- Source: `BP 344 IRR - DPWH`

**3. PD 1096 — NBCP** (green "COMPLIANT" badge):
- Subtitle: "General - All buildings"
- This section is ALWAYS active (PD 1096 applies to all buildings)
- Checks:
  - ✓ `PD 1096: Maximum riser height is 200 mm`
  - ✓ `PD 1096: Minimum tread depth is 250 mm` (verify exact value)
  - ✓ `Minimum headroom clearance is 2000 mm` (verify — screenshot shows ~2099)
  - ✓ `PD 1096: Max 3600 mm vertical rise between landings`
  - ✓ `PD 1096: Min width 1100 mm for occupant load > 50`
  - ✓ `PD 1096: Min width 900 mm for 10-50 occupants`
  - ✓ `PD 1096: Min width 750 mm for private stairs (≤10 persons)`
  - ✓ `PD 1096: Handrails must be 860-960 mm above nosing`
- Source: `PD 1096 - DPWH`

**4. BP 220 — Housing** (green "COMPLIANT" badge):
- Subtitle: "Economic / Socialized Housing"
- This section is ONLY active when Project Type includes BP 220 housing
- Checks:
  - ✓ `BP 220: Maximum riser height is 250 mm for housing` (verify — this is more lenient than PD 1096's 200mm)
  - ✓ `BP 220: Minimum tread depth is 250 mm` (verify exact value)
  - ✓ `BP 220: Min interior stair width is 600 mm`
- Source: `BP 220 IRR - DHSUD`

**CRITICAL COMPLIANCE ARCHITECTURE:** This module's unique pedagogical value is **multi-law conflict resolution**. The same stairway geometry is simultaneously evaluated against 4 different laws, each with different thresholds. The "conflict" presets (e.g., "BP 220 vs PD 1096 Conflict") demonstrate cases where a stair complies with one law but violates another. Document:
- The exact threshold values for each check per law
- The activation condition for each law section (which toggle/dropdown activates it)
- How conflicts are displayed when a parameter passes one law but fails another

---

### BOTTOM AREA

**Bottom status text** (partially visible): Some text about "visual design" and "prompt" — scan code for what this is. May be an AI chat input or design context display.

**INSTITUTIONAL toggle** — Bottom-right corner, same as Site Dev Controls.

---

### GUIDED TOUR

The screenshot does NOT show an active guided tour, but scan the code for whether this module has one. The Site Dev Controls module has a 6-stop tour. If the Stairway Configurator has a tour, document all stops. If it doesn't have one yet, add:
```typescript
tour: {
  totalStops: 0,
  skippable: true,
  stops: [],
  // GAP: No guided tour implemented yet. Recommend 6-stop tour:
  // 1. Orient — "This is a stairway governed by multiple Philippine building laws"
  // 2. Riser — "The riser height is the most commonly tested dimension"
  // 3. Tread — "Tread depth determines walking comfort"
  // 4. Width — "Width requirements change based on occupancy and exit status"
  // 5. Multi-law — "Toggle the project classification to see how different laws apply"
  // 6. Conflict — "Click 'BP 220 vs PD 1096 Conflict' to see what happens when laws disagree"
}
```

---

## CRITICAL INSTRUCTIONS FOR POPULATING THE BLUEPRINT

### 1. Store — Full Zustand Shape

Scan the Zustand store completely. This module likely has a complex store because it manages:
- Raw geometry parameters (riser, tread, width, etc.)
- Project classification state (toggles, project type)
- Computed values (total rise, going, 2R+T, number of treads)
- Active preset ID
- Compliance evaluation results per law
- UI state (which sections are collapsed, which law cards are expanded)

Document every field, its type, default value, and whether it's computed.

### 2. Presets — Complete Parameter Maps

For EVERY preset button (compliant and violation), document the exact values it sets. This is the most important pedagogical data in the module. Example structure:

```typescript
{
  presetId: 'riser-violation-pd1096',
  label: 'Riser Violation (PD 1096)',
  icon: 'warning',
  category: 'violation',
  // The exact parameter overrides this preset applies:
  parameterOverrides: {
    riserHeight: 220,        // exceeds PD 1096 max of 200mm
    treadDepth: 270,         // compliant
    stairWidth: 1000,        // compliant
    // ... every parameter this preset sets
  },
  classificationOverrides: {
    projectType: 'general_residential',
    isAccessibleRoute: false,
    isExitStair: false,
    occupantLoadOver50: false,
  },
  // Which compliance checks this is designed to fail:
  expectedViolations: ['pd1096-max-riser'],
  // Pedagogical purpose:
  teachingPoint: 'Demonstrates what happens when riser exceeds PD 1096 200mm maximum',
}
```

### 3. Multi-Law Compliance Engine

This is the module's core innovation. Document:
- How the compliance engine is structured (single function? per-law evaluators? rule registry?)
- The exact interface for a compliance check result
- How the "GOVERNS" / "most restrictive" logic works when multiple laws set different thresholds for the same parameter
- How the per-law sections in the right panel are populated
- The activation conditions for each law layer

### 4. Parametric Geometry

Document how the 3D stair geometry is generated:
- Is it BufferGeometry built from vertices?
- Is it composed Three.js primitives (BoxGeometry for treads/risers)?
- Does it use a computation function that takes parameters and returns geometry data?
- How does the geometry react to parameter changes (full rebuild? interpolation?)
- How are violation states shown on the geometry (color change? outline?)

### 5. Reactive Binding Chains

This module has more complex bindings than Site Dev Controls because:
- A single slider (e.g., riser height) affects multiple compliance checks across different laws simultaneously
- Toggles (exit stair, accessible route) don't change geometry — they change which compliance rules are active
- Presets override multiple parameters AND classification toggles at once

Document every chain:
```
riserHeight slider → store.riserHeight → 
  → recompute totalRise, 2R+T
  → re-evaluate PD1096 riser check (max 200mm)
  → re-evaluate RA9514 riser check (max 180mm, if exit stair active)
  → re-evaluate BP220 riser check (max 250mm, if housing active)
  → update 3D geometry (rebuild stair mesh)
  → update HUD metrics (if any)
  → update violation highlight on riser faces (if failing)
```

### 6. Dimension Lines / Annotations in 3D

Document which dimension lines appear in the 3D scene:
- Riser height dimension (vertical line on riser face)
- Tread depth dimension (horizontal line on tread)
- Width dimension (across the stair)
- Headroom clearance (vertical from nosing line to ceiling)
- Handrail height (vertical from nosing to handrail)
- Total rise (vertical full height)
- Landing dimensions
- Which dimensions are always visible vs. toggled

### 7. Mark All Uncertainties

Use these comment tags:
- `// AUDIT: [question for reviewing AI]` — things the reviewer should check
- `// GAP: [missing feature]` — things that should exist but don't in the codebase
- `// CONFLICT: [description]` — code says X but UI shows Y
- `// TODO: verify [value]` — values you're not 100% certain about

---

## OUTPUT FORMAT

```typescript
// src/components/3d-lab/modules/StairwayConfigurator/stairway-configurator.blueprint.ts
import type { ModuleBlueprint } from '@/types/module-blueprint'

export const stairwayConfiguratorBlueprint: ModuleBlueprint = {
  schemaVersion: '1.0.0',

  meta: {
    slug: 'stairway-configurator',
    displayName: 'Stairway Configurator',
    category: 'Code Compliance',
    routePath: '/dashboard/3d-lab/stairway-configurator',
    aleTaxonomy: ['PD 1096 - Building Design', 'RA 9514 - Fire Code', 'BP 344 - Accessibility', 'BP 220 - Housing'],
    codeReferences: [
      'PD 1096 IRR Rule VIII Sec 4.08 — Stairs and Exits',
      'RA 9514 IRR — Exit Stairs',
      'BP 344 2024 IRR — Accessible Stairs',
      'BP 220 IRR — Socialized/Economic Housing Stairs',
    ],
    description: 'Interactive parametric stairway that simultaneously evaluates compliance against PD 1096, RA 9514, BP 344, and BP 220. Students explore how different laws set different thresholds for the same geometry.',
    status: 'production', // or whatever the actual status is
  },

  store: {
    storeName: '...', // actual store name from code
    filePath: '...',  // actual path
    fields: [
      // EVERY field — geometry params, classification, computed, UI state
      // Example:
      // { name: 'riserHeight', type: 'number', defaultValue: '180', description: 'Riser height in mm', computed: false },
      // { name: 'totalRise', type: 'number', defaultValue: '...', description: 'Total floor-to-floor rise', computed: true, dependencies: ['riserHeight', 'numberOfRisers'] },
    ],
  },

  sidebar: {
    width: '...', // from code
    tabs: null,   // This module has NO tabs — single scrollable panel
    // Since there are no tabs, use a single implicit tab to hold all sections:
    // Actually, re-read the schema — if tabs is null, we need to document sections differently.
    // Use this pattern: tabs with a single default tab containing all sections.
    // OR if the schema supports tabless sidebar, document it accordingly.
    // ADAPT to match the actual ModuleBlueprint schema.
  },

  scene: {
    canvas: { /* from code */ },
    lighting: [ /* from code */ ],
    environment: null, // or from code
    ground: { /* from code */ },
    controls: { /* OrbitControls config from code */ },
    objects: [
      // Stairway treads (parametric)
      // Stairway risers (parametric)
      // Stringers
      // Landing
      // Handrails (primary + secondary)
      // Nosing projections
      // Floor planes (upper/lower)
      // Headroom clearance plane
      // Violation highlight overlays
    ],
    overlays: [
      // Dimension lines for riser height
      // Dimension lines for tread depth
      // Dimension lines for width
      // Dimension lines for headroom
      // Dimension lines for handrail height
      // Code violation indicators
    ],
  },

  infoPanel: {
    width: '...',
    collapsible: true, // or from code
    sections: [
      // COMPLIANCE REPORT header with ALL PASS / ISSUES badge
      // RA 9514 — Fire Code section (conditional on isExitStair)
      // BP 344 — Accessibility section (conditional on isAccessibleRoute)
      // PD 1096 — NBCP section (always active)
      // BP 220 — Housing section (conditional on projectType)
    ],
  },

  hud: {
    // Document whatever bottom HUD exists — may be minimal for this module
    // The three toolbar buttons (refresh, expand, reset) go in toolbar, not HUD
  },

  tour: {
    // From code, or GAP comment if no tour exists
  },

  toolbar: {
    position: 'bottom-center', // based on screenshot
    items: [
      // Green refresh/regenerate button
      // Expand/fullscreen button
      // Reset view button
    ],
  },

  computations: [
    // Total rise = riserHeight × numberOfRisers
    // Total going = treadDepth × (numberOfRisers - 1)
    // 2R + T comfort formula
    // Stair angle
    // Headroom clearance check
    // Per-law compliance evaluations
    // ALL computation functions from code
  ],

  compliance: [
    // ALL compliance rules — grouped by law
    // PD 1096 rules (always active):
    //   - max riser 200mm
    //   - min tread 250mm
    //   - min headroom 2100mm
    //   - max vertical rise between landings 3600mm
    //   - min width by occupant load (750/900/1100mm)
    //   - handrail height 860-960mm
    //
    // RA 9514 rules (active when isExitStair):
    //   - max exit riser 180mm (STRICTER than PD 1096)
    //   - min exit stair width 900mm (or code value)
    //   - min exit tread 250mm (or code value)
    //   - max vertical rise between landings 3600mm
    //
    // BP 344 rules (active when isAccessibleRoute):
    //   - min accessible stair width 1200mm (STRICTER than PD 1096)
    //   - handrail at 900mm + lower rail at 700mm
    //
    // BP 220 rules (active when projectType is housing):
    //   - max riser 250mm (MORE LENIENT than PD 1096)
    //   - min tread 250mm
    //   - min width 600mm (MORE LENIENT than PD 1096)
    //
    // For EACH rule, document:
    //   id, label, codeSection, logic, dependencies, activationCondition,
    //   violationVisualization, passVisualization, threshold value
  ],

  learning: {
    primaryObjective: 'Understand how PD 1096, RA 9514, BP 344, and BP 220 set different dimensional requirements for the same stairway geometry, and identify which law governs in each project scenario.',
    bloomLevel: 4, // Analyze — students must compare and evaluate across laws
    keyValues: [
      'PD 1096: Max riser 200mm, min tread 250mm',
      'RA 9514: Max exit riser 180mm (stricter)',
      'BP 344: Min accessible stair width 1200mm',
      'BP 220: Max riser 250mm, min width 600mm (more lenient)',
      'PD 1096: Handrails 860-960mm above nosing',
      'PD 1096: Max 3600mm vertical rise between landings',
      'PD 1096: Width thresholds — 750/900/1100mm by occupant load',
      '2R + T comfort range: 600-650mm',
    ],
    prerequisites: [
      'Basic understanding of PD 1096 occupancy classification',
      'Concept of exit stairs vs. general stairs',
      'Awareness that multiple laws can apply simultaneously',
    ],
    aleQuestionTypes: [
      'Given stair dimensions, identify which code is violated',
      'Given project type, determine which minimum width applies',
      'Identify which law has the MOST RESTRICTIVE requirement for a given parameter',
      'Calculate 2R+T and check against comfort range',
      'Determine if a stair serving as an exit AND accessible route meets all applicable codes',
    ],
    successCriteria: 'Student can correctly predict which laws are violated when clicking any violation preset BEFORE seeing the compliance report.',
    quizIntegration: [
      // From code, or GAP if not implemented
    ],
  },

  bindings: [
    // === GEOMETRY PARAMETER BINDINGS ===
    // riserHeight slider → store → recompute geometry + all riser compliance checks
    // treadDepth slider → store → recompute geometry + all tread compliance checks
    // stairWidth slider → store → recompute geometry + all width compliance checks
    // numberOfRisers → store → recompute totalRise + geometry + landing check
    // ... every slider

    // === CLASSIFICATION TOGGLE BINDINGS ===
    // isExitStair toggle → store → activate/deactivate RA 9514 section
    // isAccessibleRoute toggle → store → activate/deactivate BP 344 section
    // occupantLoadOver50 toggle → store → change PD 1096 width threshold
    // projectType dropdown → store → activate/deactivate BP 220 section

    // === PRESET BINDINGS ===
    // Each preset button → sets multiple store fields at once → triggers full recomputation
  ],

  cameraPresets: [
    // From code — the screenshot doesn't show named camera buttons like Site Dev Controls
    // but check if there are any in code
    // The viewport toolbar has refresh/expand/reset, NOT camera presets
    // If no camera presets exist, document as empty array with GAP comment
  ],

  shortcuts: [
    // From code — any keyboard shortcuts
  ],
}

// ════════════════════════════════════════════════════════════════
// PRESETS — Document separately for readability
// ════════════════════════════════════════════════════════════════
// This is NOT part of the ModuleBlueprint schema but is critical
// supplementary data. Include it as a separate export or as comments.

/*
PRESET DOCUMENTATION:

For each preset, document:
1. presetId (string)
2. label (display text)
3. category ('compliant' | 'violation')
4. parameterOverrides (Record<string, number | string | boolean>)
   — the exact values set when clicking this preset
5. classificationOverrides (Record<string, unknown>)
   — any project classification changes
6. expectedViolations (string[])
   — which compliance rule IDs should fail
7. teachingPoint (string)
   — the pedagogical purpose of this preset

Document ALL 15 presets:
- Standard House
- BP 220 Housing
- Public Hall
- Exit Stair
- Riser Violation (PD 1096)
- Tread Too Shallow (PD 1096)
- Too Narrow for Public (PD 1096)
- Headroom Crush (PD 1096)
- Exit Riser Violation (RA 9514)
- No Landing (RA 9514)
- Too Narrow for Wheelchair (BP 344)
- BP 220 vs PD 1096 Conflict
- RA 9514 vs PD 1096 Conflict
- All Laws Happy
- Everything Wrong
*/
```

---

## WHAT SUCCESS LOOKS LIKE

The output blueprint must pass these tests:

1. **Completeness** — An AI that has never seen SlateCamp can read this blueprint and draw an accurate wireframe of the entire Stairway Configurator UI, including the left sidebar with all controls, the 3D viewport with all objects, and the right panel with all compliance sections and their per-law checks.

2. **Preset fidelity** — Every preset's exact parameter values are documented. An auditor can verify that "Riser Violation (PD 1096)" actually sets a riser height above 200mm.

3. **Multi-law mapping** — The relationship between project classification toggles and active compliance sections is explicit. An auditor can trace: "If I turn on 'Required Exit Stair?', the RA 9514 section appears with these specific checks at these thresholds."

4. **Code accuracy** — Every threshold value (200mm, 180mm, 250mm, 1200mm, etc.) comes from the actual compliance evaluation code, not from this prompt's description. If the code uses different values, the blueprint shows the code values with an `// AUDIT:` note.

5. **Round-trippable** — You (the codebase AI) can later receive this blueprint back with modifications (e.g., "AUDIT: Add BP 344 check for tactile warning strips at top of stairs") and know exactly which files to update.

---

## APPENDIX A: THE SCHEMA

If `src/types/module-blueprint.ts` does not already exist, generate it using the schema from the Site Development Controls blueprint prompt. The schema is universal — it works for both modules. If the Stairway Configurator needs fields that the current schema doesn't support (e.g., `presets` array, `activationCondition` on compliance rules), **extend the schema** by adding the new interfaces and add a comment `// EXTENDED: Added for StairwayConfigurator multi-law compliance pattern`.

Specifically, consider whether the schema needs:
- A `presets` top-level field on `ModuleBlueprint` for preset definitions
- An `activationCondition` field on `ComplianceRuleSchema` to express "only active when isExitStair === true"
- A `lawGroup` field on `ComplianceRuleSchema` to group checks by law (PD 1096, RA 9514, BP 344, BP 220)
- A `conflictsWith` field on `ComplianceRuleSchema` to express multi-law conflicts

If you extend the schema, ensure backward compatibility — existing Site Dev Controls blueprint should still conform.
