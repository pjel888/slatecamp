# SlateCamp 3D Lab Library — Production Build Prompt
## 186 Modules. 13 Subject Areas. The First Interactive 3D Architecture Licensure Platform in the World.

---

## HOW TO USE THIS PROMPT

**Give this prompt AND the accompanying document `EVERY_ALE_CONCEPTS_THAT_BELONGS_TO_3D.md` to Claude Code together.** The document is the CONTENT BIBLE — it contains every module, every dimension, every code citation. This prompt is the EXECUTION FRAMEWORK — it tells the AI HOW to build, in what order, and to what standard.

---

## ROLE

You are simultaneously:

1. **Elite React Three Fiber (R3F) Architect** — You have shipped production 3D educational applications. You know the critical performance constraints: `frameloop="demand"` for interactive-not-animated scenes, Zustand as the 2D↔3D bridge (never React state in `useFrame`), ref mutations for geometry, dynamic imports for SSR safety, draw calls <100 per scene, `<Suspense>` boundaries for loading. You use basic primitives (Box, Cylinder, Plane, Line) to perfect interaction logic before replacing with production models.

2. **Philippine Architecture Licensure Content Expert** — You have studied the accompanying document thoroughly. It maps 186 3D-ready concepts across all 13 ALE subject areas with exact dimensions, code section references, and interaction patterns. Every number in that document comes from PD 1096, RA 9514, BP 344, NSCP 2015, PEC, NPCP, or the relevant Philippine code. TREAT THESE NUMBERS AS LAW. Do not approximate. Do not round. If the document says "minimum riser 200mm" — it's 200mm, not 20cm, not "about 200mm."

3. **Educational Psychologist (Constructivist Learning)** — Every 3D module follows the "Learn by Breaking" principle: the student manipulates parameters (sliders, toggles) and watches the 3D geometry respond. When they exceed a code limit, the model visually "breaks" — turns red, shows a violation annotation with the exact code citation. The failure state IS the teaching moment. The student doesn't memorize "maximum riser is 200mm" — they PUSH the slider past 200mm and WATCH the stair become non-compliant. That spatial memory survives exam day.

4. **Scalable Systems Architect** — You're not building 186 modules by hand. You're building a MODULE FRAMEWORK — a set of reusable scene templates, parameter systems, and UI patterns — then POPULATING it with content from the document. One `ParametricScene` component, configured 50 different ways. One `ExplodedAssembly` component, populated with 30 different models. The framework scales; the content fills it.

---

## TASK

Build the SlateCamp 3D Lab module library using the accompanying `EVERY_ALE_CONCEPTS_THAT_BELONGS_TO_3D.md` as the definitive content source. Start with the **10 highest-priority modules** identified in the document, then establish a scalable framework for the remaining 176.

**The 10 Priority Modules (from the document's analysis):**

| # | Module | Subject | Interaction Type | Why Priority |
|---|--------|---------|-----------------|-------------|
| 1 | PD 1096 Stairway Configurator | Building Code | Parametric sliders | Tested in every ALE, multiple interacting parameters |
| 2 | Fire Code Travel Distance Floor Plan | RA 9514 | Floor plan walkthrough with distance overlay | Most commonly failed topic area |
| 3 | BP 344 Ramp & Accessible Toilet | Accessibility | Slider-adjusted gradients and dimensions | 2024 IRR changes create confusion |
| 4 | Classical Orders Comparison | History | Exploded model with proportional overlay | Pure spatial/visual, five detailed models |
| 5 | Development Controls (PSO/TGFA/AMBF) | Building Code | Parametric lot model | Abstract formulas become intuitive |
| 6 | Structural Load Path Animation | NSCP | Animated force diagrams | Transforms conceptual understanding |
| 7 | Plumbing Fixture Installation Cutaway | NPCP | Cutaway with pipe routing | Fixture units in spatial context |
| 8 | Seismic Parameter Map Explorer | NSCP | Interactive Philippine map | Zone factors and soil profiles |
| 9 | Bahay na Bato Exploded Assembly | History | Exploded assembly with material callouts | Heavily tested Philippine heritage |
| 10 | Construction Sequence Animations | Materials | Step-by-step animated build | Physical logic of building |

---

## CONTEXT

### Technical Environment
- **Framework:** Next.js (App Router), React, TypeScript
- **3D Stack:** `@react-three/fiber`, `@react-three/drei`, Three.js
- **State Management:** Zustand (for parameter state + 2D↔3D bridge)
- **Styling:** Tailwind CSS (GitHub Primer × Apple HIG hybrid)
- **Backend:** Supabase (for progress tracking, module metadata)
- **Existing Infrastructure:** 3D Lab infrastructure from previous prompts (CanvasWrapper, ControlPanel, HotspotAnnotation, ViolationIndicator, labStore)

### The Existing 3D Lab Infrastructure (REUSE IT)
These components were built in previous phases. Use them — don't rebuild:
- `CanvasWrapper.tsx` — Shared Canvas with lights, controls, Suspense
- `ControlPanel.tsx` — Floating slider/toggle panel (2D overlay)
- `HotspotAnnotation.tsx` — 3D-anchored tooltip via Drei `<Html>`
- `ViolationIndicator.tsx` — Code violation display with citation
- `labStore.ts` — Zustand store for parametric state
- `useInvalidateOnChange.ts` — Trigger re-render on store changes

**If these don't exist yet, build them first (Phase 1).**

### Tools You MUST Use
- **File System Tools** — Read the existing 3D Lab directory to understand what infrastructure is already built. Read the CanvasWrapper, ControlPanel, and store patterns.
- **Supabase MCP** — Check if module metadata tables exist (for tracking which modules a student has explored, progress, quiz integration).
- **Web Search** — For ANY dimension or code value you're uncertain about, VERIFY against the actual Philippine code. The accompanying document has been researched, but always cross-check critical values.
- **`.claude/docs`, `.claude/skills`, `.claude/agents`** — Use all available tools.

---

## THE MODULE FRAMEWORK ARCHITECTURE

### The Key Insight: Don't Build 186 Modules. Build 5 Templates.

The 186 modules fall into **5 interaction patterns**. Build one reusable template for each pattern, then populate with content.

### Template 1: `ParametricScene` — Slider-Driven Geometry
**Used for:** Stairways, rooms, lots, ramps, courts, parking, setbacks, septic tanks, elevator shafts
**How it works:** User adjusts sliders → Zustand store updates → 3D geometry morphs in real-time → violation detection runs → red/green compliance feedback with code citation
**Key props:**
```tsx
interface ParametricSceneConfig {
  id: string
  title: string
  description: string
  subject: string                    // 'PD 1096', 'BP 344', etc.
  parameters: ParameterDef[]         // Slider/toggle definitions
  geometry: GeometryBuilder          // Function that builds 3D from parameters
  violations: ViolationRule[]        // Code compliance checks
  annotations: AnnotationDef[]       // 3D-anchored labels
  defaultPresets: Preset[]           // "R-1 Standard", "Accessible", etc.
}

interface ParameterDef {
  key: string
  label: string
  type: 'slider' | 'toggle' | 'dropdown'
  min?: number
  max?: number
  step?: number
  default: number | boolean | string
  unit?: string                      // 'mm', 'm', 'sqm', '%'
  options?: { label: string; value: string }[]  // For dropdowns
}

interface ViolationRule {
  id: string
  check: (params: Record<string, any>) => boolean  // Returns true if VIOLATED
  field: string                      // Which parameter is violated
  message: string                    // "Exceeds maximum riser height"
  codeCitation: string               // "PD 1096 IRR Rule VIII §804"
  severity: 'error' | 'warning'
}
```

### Template 2: `ExplodedAssembly` — Component Isolation with Hotspots
**Used for:** Classical orders, construction types, wall assemblies, firewall sections, foundation types, Philippine heritage buildings
**How it works:** A 3D model with named parts. User clicks a part → it isolates (other parts fade/move away) → hotspot annotation shows name, description, dimensions, code reference. Explode slider pulls all parts apart simultaneously.
**Key props:**
```tsx
interface ExplodedAssemblyConfig {
  id: string
  title: string
  parts: AssemblyPart[]              // Each part of the assembly
  explodeAxis: 'y' | 'x' | 'z'     // Direction parts separate
  comparisonMode?: boolean           // Side-by-side (e.g., 5 classical orders)
}

interface AssemblyPart {
  id: string
  label: string
  description: string
  dimensions?: string                // "200 × 200 × 400 mm"
  codeCitation?: string
  geometry: THREE.BufferGeometry | 'box' | 'cylinder' | 'custom'
  position: [number, number, number]
  explodeOffset: number              // How far this part moves when exploded
  color: string
  material?: string                  // "Reinforced concrete", "Nipa palm"
}
```

### Template 3: `FloorPlanWalkthrough` — 2D Plan with 3D Overlay
**Used for:** Fire egress travel distances, occupant load, exit placement, electrical outlet spacing, GFCI zones
**How it works:** A 2D floor plan rendered as a flat 3D surface. Colored overlays show coverage zones, travel distances as glowing path lines, exits as annotated doors. Toggle between sprinklered/unsprinklered, different occupancy types.
**Key props:**
```tsx
interface FloorPlanConfig {
  id: string
  title: string
  planDimensions: { width: number; depth: number }
  zones: ZoneDef[]                   // Colored overlay regions
  pathLines: PathDef[]               // Travel distance lines
  fixtures: FixtureDef[]             // Outlets, exits, sprinklers, etc.
  toggles: ToggleDef[]               // "Sprinklered" ON/OFF, "Occupancy Type" dropdown
}
```

### Template 4: `CutawaySection` — Sliceable Building Section
**Used for:** Plumbing installations, HVAC ducts, pipe slopes, waterproofing, structural details, rebar placement
**How it works:** A building cross-section that can be "cut" at different depths using a slider. Each layer is labeled with material, dimensions, and code reference. Think of it as a 3D X-ray of a building element.
**Key props:**
```tsx
interface CutawaySectionConfig {
  id: string
  title: string
  layers: LayerDef[]                 // Each layer of the assembly
  cutAxis: 'x' | 'y' | 'z'
  cutRange: [number, number]         // Min/max cut position
  annotations: AnnotationDef[]
}
```

### Template 5: `AnimatedSequence` — Step-by-Step Build
**Used for:** Construction sequences (foundation → column → slab), structural evolution timeline, smoke control systems
**How it works:** A timeline slider or play/pause controls that advance through discrete steps. Each step adds or transforms geometry with smooth transitions. Step labels explain what's happening and why.
**Key props:**
```tsx
interface AnimatedSequenceConfig {
  id: string
  title: string
  steps: SequenceStep[]
  autoPlaySpeed?: number             // ms per step (0 = manual only)
}

interface SequenceStep {
  label: string
  description: string
  codeCitation?: string
  duration: number                   // ms for transition
  geometryChanges: GeometryChange[]  // What appears/moves/changes
}
```

---

## TOKEN CONSERVATION & EXECUTION CONSTRAINTS

**CRITICAL: Building 3D scenes is the most token-expensive work in the entire platform. Discipline is mandatory.**

1. **FRAMEWORK FIRST.** Build the 5 reusable templates before populating ANY specific module. One well-built `ParametricScene` component enables 50+ modules.
2. **PRIMITIVES ONLY.** All geometry uses Box, Cylinder, Plane, Line, Ring. No GLTF models. No textures. No shaders. These are teaching tools, not architectural renders.
3. **ONE MODULE AT A TIME.** Complete each module fully (config + geometry + violations + annotations + testing) before starting the next.
4. **EXACT DIMENSIONS FROM THE DOCUMENT.** When the document says "minimum riser 200mm" — the default slider value is 200, the violation triggers at 201+, and the annotation says "PD 1096 IRR Rule VIII." No improvising.
5. **REUSE INFRASTRUCTURE.** Every module uses the same CanvasWrapper, ControlPanel, HotspotAnnotation. Don't recreate them per module.
6. **CONFIG-DRIVEN.** Each module should be definable as a JSON-like config object. The templates interpret the config. This means adding a new module is just adding a new config — not writing new R3F code.

---

## PHASED EXECUTION PLAN

---

### PHASE 1: Infrastructure Verification & Template Architecture

**Objective:** Verify existing 3D Lab infrastructure. Define the 5 template component interfaces. Build any missing infrastructure.

**Step 1.1 — Audit Existing Infrastructure**
Read the 3D Lab directory. Verify which of these exist and are functional:
- CanvasWrapper, ControlPanel, HotspotAnnotation, ViolationIndicator
- labStore (Zustand), useInvalidateOnChange hook
- Scene routing (`/3d-lab/[subject]/[scene]`)
- Any existing scene implementations

**Step 1.2 — Build Missing Infrastructure**
If any core components are missing, build them now using the specifications from the 3D Lab Master Prompt.

**Step 1.3 — Define Template Interfaces**
Create the TypeScript interfaces for all 5 templates (ParametricScene, ExplodedAssembly, FloorPlanWalkthrough, CutawaySection, AnimatedSequence) as defined above.

**Step 1.4 — Create Module Registry**
```tsx
// src/app/3d-lab/_config/moduleRegistry.ts
export const MODULE_REGISTRY: ModuleConfig[] = [
  { id: 'stairway-configurator', title: 'PD 1096 Stairway Configurator', template: 'parametric', subject: 'PD 1096', priority: 1 },
  { id: 'fire-travel-distance', title: 'Fire Code Travel Distance', template: 'floorplan', subject: 'RA 9514', priority: 2 },
  // ... all 186 modules registered (metadata only — content added per-module)
]
```

**STOP.** Say: "Phase 1 Complete. Infrastructure verified/built. Template interfaces defined. Reply 'Proceed' to build Template 1: ParametricScene."

---

### PHASE 2: Build Template 1 — `ParametricScene`

**Objective:** Build the reusable parametric scene template. This single component will power ~50% of all modules.

Build `ParametricScene.tsx` that:
- Accepts a `ParametricSceneConfig` object
- Renders the ControlPanel from the config's `parameters` array
- Runs the `geometry` builder function to create 3D shapes from parameter values
- Runs all `violations` checks on every parameter change
- Renders `annotations` as `<Html>` elements at 3D positions
- Shows violation indicators when rules are broken
- Supports `presets` for one-click parameter sets
- Uses `frameloop="demand"` + `invalidate()` pattern
- All geometry via refs in `useFrame`

**Test it with Module #5: Development Controls (PSO/TGFA/AMBF)** since the NBCP Envelope Generator config was already designed in a previous prompt. This validates the template works end-to-end.

**STOP.** Say: "Phase 2 Complete. ParametricScene template built and validated with PSO/TGFA module."

---

### PHASE 3: Build Priority Module #1 — Stairway Configurator

**Objective:** Build the highest-priority module using the ParametricScene template.

**From the document, the stairway parameters are:**
- Maximum riser: 200mm
- Minimum tread: 250mm
- Maximum riser variation per flight: 5mm
- Headroom ≥ 2.00m from nosing
- Maximum 3.60m vertical between landings
- Minimum widths: 1,100mm (>50 occ), 900mm (≤50), 750mm (private <10)
- Handrails: 800–900mm above nosing
- Intermediate handrails every 3,000mm of width
- Minimum 38mm wall clearance

**Build the config object** with all these as sliders/parameters, violation rules for each limit, and 3D geometry that builds a stair from these parameters in real-time.

**STOP.** Say: "Phase 3 Complete. Stairway Configurator is functional."

---

### PHASE 4: Build Template 2 — `ExplodedAssembly` + Module #4 (Classical Orders)

**Objective:** Build the exploded assembly template and validate with Classical Orders.

The document specifies 5 orders with exact proportions:
- Tuscan (1:7), Doric (1:8, 20 flutes), Ionic (1:9, 24 flutes, volutes), Corinthian (1:10, acanthus), Composite (1:10, volutes + acanthus)

Build using stacked primitives (cylinders for shafts, boxes for entablature). Each part is a separate mesh with hotspot annotation. Explode slider separates them vertically. Comparison mode shows all 5 side-by-side.

**STOP.** Say: "Phase 4 Complete. ExplodedAssembly template built. Classical Orders module functional."

---

### PHASE 5: Build Template 3 — `FloorPlanWalkthrough` + Module #2 (Fire Travel Distance)

**Objective:** Build the floor plan template and validate with Fire Code travel distances.

From the document:
- Travel distances: 46m assembly/business (no sprinklers), 61m (sprinklered), 30m mercantile (no), 46m (yes), 31m industrial (no), 46m (yes)
- Dead-end corridors: 6m (educational/institutional/assembly), 15m (all others)
- Occupant load factors by use type
- Required exits: 2 for 10-499 occupants, 3 for 500-999, 4 for 1,000+

Build as a flat 3D floor plan with colored path overlays, distance labels, and sprinkler toggle.

**STOP.** Verify. Then continue with remaining priority modules.

---

### PHASES 6-10: Remaining Priority Modules

Each phase builds one priority module, alternating between templates to validate all 5:

- **Phase 6:** Module #3 — BP 344 Ramp & Accessible Toilet (ParametricScene with 2024 IRR values)
- **Phase 7:** Module #6 — Structural Load Path (AnimatedSequence template)
- **Phase 8:** Module #7 — Plumbing Fixture Cutaway (CutawaySection template)
- **Phase 9:** Module #9 — Bahay na Bato (ExplodedAssembly)
- **Phase 10:** Module #10 — Construction Sequence Foundation→Slab (AnimatedSequence)

Modules #5 (PSO/TGFA) was built in Phase 2 as the template validator.
Module #8 (Seismic Map) requires a specialized map component — defer or build as a custom scene.

---

## THE MODULE GALLERY / INDEX PAGE

After the priority modules are built, create the 3D Lab landing page:

```
/3d-lab/
├── page.tsx — Module gallery grouped by subject area
│   ├── PD 1096 National Building Code (28 modules)
│   ├── RA 9514 Fire Code (18 modules)
│   ├── BP 344 Accessibility (14 modules)
│   ├── History & Heritage (33 modules)
│   ├── NSCP Structural (16 modules)
│   ├── Plumbing (14 modules)
│   ├── Electrical (10 modules)
│   ├── Mechanical (8 modules)
│   └── ... (remaining categories)
├── [subject]/
│   └── [module]/
│       └── page.tsx — Individual 3D scene
```

Each gallery card shows: module title, subject tag, interaction type icon, completion status (if student has explored it), and estimated time.

---

## THE CONTENT PIPELINE FOR REMAINING 176 MODULES

After the 10 priority modules validate all 5 templates, the remaining modules become a CONTENT POPULATION exercise:

1. **Read the relevant section** of `EVERY_ALE_CONCEPTS_THAT_BELONGS_TO_3D.md`
2. **Choose the template** (parametric, exploded, floorplan, cutaway, animated)
3. **Create a config object** with all parameters, violations, annotations from the document
4. **Register in MODULE_REGISTRY**
5. **Test** — verify all dimensions match the document, all violations trigger correctly

This is the scalable path to 186 modules. The templates do the rendering work. The configs provide the content. Adding a module becomes a 30-minute task, not a 3-hour engineering effort.

---

## VERIFICATION CHECKLIST (Per Module)

- [ ] Every dimension matches the accompanying document EXACTLY (mm, m, sqm, %)
- [ ] Every code citation is accurate (PD 1096 §xxx, RA 9514 §xxx, BP 344 §xxx)
- [ ] Every violation triggers at the correct threshold
- [ ] Violation annotations include the exact code section reference
- [ ] Sliders have correct min/max/step/default/unit
- [ ] Presets produce correctly-configured starting states
- [ ] Annotations are 3D-anchored (Spatial Contiguity) — not in distant panels
- [ ] Performance: <50 draw calls, 60fps desktop, 30fps+ mobile
- [ ] `frameloop="demand"` is set, `invalidate()` called on parameter change
- [ ] Works on mobile with touch controls
- [ ] Design system compliant (control panel matches GitHub+Apple hybrid aesthetic)

---

## FINAL REMINDERS

1. **THE DOCUMENT IS THE BIBLE.** Every dimension, every code citation, every interaction pattern comes from `EVERY_ALE_CONCEPTS_THAT_BELONGS_TO_3D.md`. Don't improvise. Don't approximate. The students are studying for a licensure exam — accuracy is non-negotiable.

2. **TEMPLATES SCALE. HAND-CODING DOESN'T.** Build 5 reusable templates. Populate with 186 configs. If you find yourself writing custom R3F code for a new module, stop and ask: "Should this be a template feature instead?"

3. **THE VIOLATION IS THE LESSON.** When a student pushes a stair riser past 200mm and the stair turns red with "PD 1096 IRR Rule VIII: Maximum riser 200mm" — that is the moment they'll remember on exam day. Design every violation state with care.

4. **THESE 10 MODULES COVER 35-40% OF ALE QUESTIONS.** This isn't a nice-to-have. This is the core product. Build it with the precision of someone whose own exam depends on it.

5. **NO COMPETITOR HAS THIS.** Not VIZCODE. Not Arkitekto. Not any review center. SlateCamp's 3D Lab is the first interactive 3D architecture licensure platform in the world. Build it like it matters — because it does.

---

*Execute Phase 1 now. Verify infrastructure and define template interfaces.*
