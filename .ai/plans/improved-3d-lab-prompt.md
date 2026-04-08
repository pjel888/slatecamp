# Prompt: 3D Lab — Exhaustive Product & Technical Specification

---

## SYSTEM CONTEXT

```
Primary Expertise: Next.js 14 App Router, React Three Fiber, drei, Three.js, Zustand, Supabase, Tailwind CSS, Shadcn UI, Educational Psychology (Mayer, Hattie, Roediger & Karpicke)
Product: SlateCamp — Interactive Learning Experience Platform for Philippine Architecture Licensure Examination (ALE) prep
Working Directory: slatecamp/
```

---

## PRE-EXECUTION: STATE SYNC (MANDATORY)

Before generating ANY content, read and internalize the following files in order:

1. `.ai/state/current-task.md`
2. `.ai/state/memory.md`
3. `.ai/docs/01-product/008-3d-lab.md` (the existing document you are extending)
4. All files in `.ai/state/` that reference the 3D Lab, Development Controls Lab, or calculator suite

After reading, produce a `<state_audit>` block confirming:
- Current task context and any blocking constraints
- What already exists in `008-3d-lab.md` that must be preserved or extended (not overwritten)
- Any open decisions or unresolved flags from memory (e.g., the angular plane θ coefficient verification gate)

**HALT if** the state files indicate conflicting priorities or if `008-3d-lab.md` already covers a section you're about to write — ask for clarification rather than overwriting.

---

## OBJECTIVE

Write an exhaustively detailed Product Requirements Document and Technical Specification for the **3D Lab** feature into the existing file:

```
.ai/docs/01-product/008-3d-lab.md
```

This document must be the single source of truth that a developer, designer, or learning scientist can read and fully understand every aspect of the 3D Lab without looking at any other document.

---

## REQUIRED DOCUMENT STRUCTURE

Write every section below. Each section header is mandatory. If information for a section is genuinely unavailable from context or memory, write the header with a `⚠️ NEEDS INPUT` flag and a specific question — do not skip it, do not fill it with assumptions.

### PART 1 — PRODUCT VISION & LEARNING FRAMEWORK

**1.1 Feature Overview**
- What the 3D Lab is, who it serves, and the core value proposition
- How it differentiates SlateCamp from every other ALE review platform
- The governing design question: "Does this model help a student understand this code or concept better than a 2D diagram?"

**1.2 Learning Science Foundation**
- Mayer's 12 Multimedia Learning Principles — which ones the 3D Lab activates and how
- Dual Coding Theory application (spatial + verbal channels)
- Hattie's Feedback Model — how the parametric sandbox delivers corrective feed-forward
- Roediger & Karpicke's Testing Effect — how in-canvas quizzing triggers retrieval practice
- Cognitive Load Management — the 4-layer progressive disclosure model (Layer 0: Model → Layer 1: Orientation Labels → Layer 2: Exploration Hotspots → Layer 3: Deep Knowledge)

**1.3 Interactivity Level Framework**
- Define each interactivity level (Level 1: Observe, Level 2: Explore, Level 3: Manipulate)
- Map every interaction type to its interactivity level
- Explain the pedagogical rationale for each level

**1.4 Behavioral Psychology & Retention Tactics**
- Specific behavioral hooks embedded in the 3D Lab experience
- How mastery gamification (not badges/confetti) is applied
- Completion signals, progress tracking, and how the 3D Lab feeds the Readiness Score
- Spaced repetition integration: how in-canvas quiz results feed the FSRS algorithm
- Session design: optimal session length, when to surface quiz prompts, when to suggest exit

---

### PART 2 — MODULE CATALOG (EVERY MODULE IN DETAIL)

For EACH of the following priority modules, write a full specification containing ALL of these sub-sections:

| # | Module | Code Reference |
|---|--------|---------------|
| 1 | PD 1096 Stairway Configurator | PD 1096 Sec 4.08 |
| 2 | RA 9514 Fire Exit Travel Distance | RA 9514 Annex |
| 3 | BP 344 Accessible Ramp | BP 344 2024 IRR |
| 4 | BP 344 Accessible Toilet | BP 344 2024 IRR |
| 5 | Classical Orders Comparison | ALE History |
| 6 | Structural Bay Span | NSCP 2015 |
| 7 | Floor Plan Egress | PD 1096 |
| 8 | CHB Wall Construction | PD 1096 Sec 7 |
| 9 | Electrical Panel Clearance | Philippine EC |
| 10 | Plumbing Trap Configuration | National Plumbing Code |

**Per-module specification template (apply to ALL 10):**

```
## Module [#]: [Name]

### Learning Objective
- What the student will be able to DO after interacting with this module
- Which ALE subject area and taxonomy node this maps to
- Bloom's level targeted (Remember / Understand / Apply / Analyze)

### Interaction Type
- Primary interaction pattern (Orbit+Annotate / Parametric Sandbox / Cross-Section / Exploded Assembly / Guided Tour / Floor Plan Nav / Side-by-Side Compare / In-Canvas Quiz)
- Secondary interaction patterns if applicable
- Interactivity Level (1, 2, or 3)

### 3D Scene Description
- What geometry exists in the scene (every element named)
- Default camera position, FOV, and orbit constraints
- Lighting rig (key, fill, ambient, environment preset)
- Ground plane and shadow setup
- Scene scale (real-world units in meters)

### Parametric Controls (if applicable)
- Every slider/toggle/input: parameter name, label, unit, min, max, step, default value
- Code bounds for each parameter (PD 1096 / BP 344 / etc. — min and max with section citation)
- Violation feedback behavior: what turns red, what dimension lines appear, what warning text shows

### Hotspot Inventory
- Every hotspot: ID, 3D position description, label, category (requirement/dimension/violation/info), description text, code reference, dimension callout
- Maximum 6 visible simultaneously — describe grouping/filter logic if more than 6 exist

### In-Canvas Quiz Questions (if applicable)
- 2-3 sample quiz questions with choices, correct answer, and rationale
- Where in 3D space the quiz card appears
- What triggers the quiz prompt (exploration milestone, time-in-module, explicit button)

### Cross-Section / Exploded View Behavior (if applicable)
- Which clipping planes exist, their axis and range
- Which parts separate in exploded view, separation distance, animation timing
- What internal structure is revealed

### Camera Choreography
- Named camera presets (e.g., "Overview", "Detail: Tread Depth", "Section Cut")
- Transition behavior between presets (lerp speed, easing)
- Mobile vs desktop orbit constraint differences

### Model Asset Specification
- Source: Parametric (runtime BufferGeometry) or Pre-built (GLB from Blender)
- If GLB: polygon budget, texture resolution, file size target, Draco compression
- If parametric: which Three.js geometries are constructed, Float32Array strategy
- Blender Python script requirements (if applicable)

### Wiki Integration
- Which wiki articles this module links to
- Where the "Read more in Wiki →" link appears in the UI
- Bidirectional: does the wiki article embed a link back to this 3D module?

### Mobile-Specific Behavior
- Touch gesture mapping (tap, drag, pinch, long-press)
- Bottom sheet control layout (which controls appear, in what order)
- Performance considerations for mid-range Android (target: Snapdragon 600-series)
```

**Also include a section for the Development Controls Lab** (PD 1096 Rules VII & VIII — AMBF, PSO, TOSL, ISA, USA, MACA, BHL, FLAR) as an extended module specification. This is the most complex module and has its own subsections:
- Surveyor Mode (bearing-and-distance lot plotting from TCT/OCT)
- Custom polygon lot input
- Dual-column sidebar with InfoPopover components
- Angular plane θ coefficient — mark this as `⚠️ PRODUCTION GATE: Requires IRR verification by licensed architect`

---

### PART 3 — UX/UI SPECIFICATION

**3.1 Information Architecture**
- Full sitemap/navigation tree showing how a user reaches the 3D Lab from the dashboard
- Module browsing: how modules are organized (by code reference? by subject area? by building system?)
- Module card design: what metadata is shown (title, code ref, interactivity level, completion %, estimated time)
- Search and filter: can users search modules? filter by code? by interaction type?

**3.2 Module Viewer Layout**
- Desktop layout (full specification with measurements): header bar, 3D canvas area, side panel, code reference panel
- Mobile layout: full-width canvas, bottom sheet overlay, header bar
- Breakpoint behavior: at what px does the layout switch?
- Panel collapse/expand behavior and animation

**3.3 Component Hierarchy**
Write the full React component tree as a diagram:
```
3DLabPage (Server Component — data fetch)
└── 3DLabShell (Client — layout wrapper)
    ├── ModuleBrowser (module selection grid)
    │   └── ModuleCard
    ├── ModuleViewer (active module wrapper)
    │   ├── ModuleHeader (back, title, settings, fullscreen)
    │   ├── ModuleCanvas (R3F Canvas)
    │   │   ├── SceneSetup (lights, environment, shadows)
    │   │   ├── [ModuleName]Model
    │   │   ├── [ModuleName]Hotspots
    │   │   ├── DimensionLines
    │   │   ├── InCanvasQuiz
    │   │   └── OrbitControls
    │   ├── ControlPanel / BottomSheet
    │   │   ├── ParameterSlider(s)
    │   │   ├── ViolationIndicator
    │   │   └── ViewPresetButtons
    │   └── CodeReferencePanel
    └── ModuleCompletionOverlay
```
- For EVERY component in this tree, specify: Client or Server, props interface, which Zustand store slices it reads, key behaviors

**3.4 Loading States & Error Handling**
- Skeleton screen while module list loads
- 3D canvas loading state (what does the user see while the GLB downloads?)
- WebGL context lost recovery
- Model load failure fallback (what if the GLB 404s or is corrupted?)
- Device capability detection: what happens on a device that can't run WebGL?

**3.5 Onboarding & First-Time UX**
- First-visit 3D Lab experience (guided prompt? tutorial module? tooltip tour?)
- Orbit/pinch/tap instruction overlay for mobile users
- Progressive feature reveal: do all interaction types unlock immediately or progressively?

**3.6 Accessibility**
- Keyboard navigation for hotspots and controls
- Screen reader announcements for parametric value changes
- Reduced motion mode: disable camera animations, skip exploded view transitions
- Color contrast for violation indicators (not just red/green — consider colorblindness)

---

### PART 4 — TECHNICAL ARCHITECTURE

**4.1 Rendering Architecture**
- Next.js App Router page structure: which route serves the 3D Lab?
- Server Component vs Client Component boundary map
- `next/dynamic` with `ssr: false` strategy for the R3F Canvas
- React Suspense boundaries: where they sit, what fallback they show

**4.2 State Management**
- Complete Zustand store schema for `useLabStore`:
  - All slices: `activeModule`, `parameters`, `activeHotspot`, `cameraPreset`, `violationState`, `quizState`, `completionState`
  - Every action/setter with TypeScript signature
  - Selector patterns for re-render optimization
- How module-specific state is scoped (one store per module, or one global store with module key?)
- State persistence: is any 3D Lab state persisted to Supabase? (completion, quiz answers, parameter snapshots)

**4.3 Data Fetching & Network**
- Module metadata: fetched from Supabase on page load (Server Component)
- GLB assets: loaded from Supabase Storage `3d-models` bucket
- Asset loading strategy: preload on hover? lazy load on navigate? prefetch adjacent modules?
- CDN caching headers for GLB files
- Bandwidth budget: what's the maximum acceptable load time on Philippine 4G (10-15 Mbps)?

**4.4 Asset Pipeline**
- Blender → GLB export settings (Draco compression, texture baking, scale)
- `gltf-transform` or `gltf-pipeline` optimization step
- KTX2 texture compression: used or not? If not, why?
- Naming convention for GLB files in storage
- Versioning strategy: how do we update a model without breaking cached versions?

**4.5 Performance Engineering**
- Polygon budget per module (max 50,000 triangles)
- GLB file size budget (max 5MB)
- Texture budget (max 1024×1024)
- Target FPS: 60fps desktop, 30fps minimum mobile
- Memory management: `dispose()` patterns for geometry and materials on unmount
- `useGLTF.preload()` strategy
- `frameloop="demand"` vs `"always"` — which modules use which?
- Draw call monitoring with `stats-gl` or `renderer.info`
- `PerformanceMonitor` adaptive DPR for low-end devices

**4.6 Supabase Schema**
- Tables involved: `lab_modules`, `lab_hotspots`, `lab_quiz_questions`, `lab_user_progress`, `lab_session_events`
- Schema for each table (columns, types, constraints, RLS policies)
- Queries: list modules, fetch module detail, record completion, log quiz answer, fetch user progress

---

### PART 5 — INTEGRATION POINTS

**5.1 Wiki Integration**
- Bidirectional linking: 3D module ↔ wiki article
- How the "Open in 3D Lab" button works from a wiki article
- How the "Read in Wiki →" link works from the 3D Lab side panel

**5.2 Quiz Engine Integration**
- How in-canvas quiz questions are sourced (from `questions` table? separate `lab_quiz_questions`?)
- How quiz results feed the FSRS spaced repetition scheduler
- How quiz results feed the Readiness Score
- CAGE binding: does the in-canvas quiz use CAGE or is it exempt? (document the decision and rationale)

**5.3 Calculator Suite Integration**
- Which calculators share computation logic with 3D modules? (e.g., stairway rise/run, CHB wall estimator)
- Can a user launch a calculator from within a 3D module context?

**5.4 Dashboard Integration**
- How 3D Lab progress appears on the student dashboard
- Which metrics are surfaced: modules explored, modules completed, quiz accuracy, time spent

---

### PART 6 — ROADMAP & PHASING

**6.1 Phase 1 — MVP (ship first)**
- Which 3 modules ship first and why
- Minimum viable interaction types
- What is explicitly deferred to Phase 2

**6.2 Phase 2 — Expansion**
- Modules 4-10
- Advanced interaction types (guided tours, in-canvas quizzing)
- Wiki and quiz engine integration

**6.3 Phase 3 — Full Vision**
- Remaining modules (beyond the 10 priority)
- User-generated parameter snapshots ("save my configuration")
- AR mode exploration (long-term)
- B2B white-label 3D modules for review centers

---

## EXECUTION PIPELINE

Execute in strict order:

**STAGE 1 — AUDIT**
1. Read all `.ai/state/` files. Produce `<state_audit>`.
2. Read existing `008-3d-lab.md`. Identify what exists vs what's missing.
3. Write implementation plan to `.ai/plans/document_3d_lab_plan.md`.

**STAGE 2 — WRITE**
4. Write the full document into `.ai/docs/01-product/008-3d-lab.md`.
   - If the file already has content, EXTEND it — do not overwrite existing sections unless they are stubs.
   - Use Mermaid diagrams for: component hierarchy, data flow, navigation IA, and Supabase schema ERD.
5. Update `.ai/plans/document_3d_lab_plan.md` with checkmarks as each Part is completed.

**STAGE 3 — CLOSE**
6. Update `.ai/state/current-task.md` and `.ai/state/memory.md`.
7. Archive `.ai/plans/document_3d_lab_plan.md` → `.ai/plans/archive/`.
8. Git commit with message: `docs(product): exhaustive 3D Lab PRD and technical specification`

---

## VERIFICATION CHECKLIST

Before finalizing, confirm:

- [ ] Every section header from the Required Document Structure exists in the output
- [ ] All 10 priority modules + Development Controls Lab have full per-module specs
- [ ] Component hierarchy includes Client/Server boundary annotations
- [ ] Zustand store schema has TypeScript interfaces, not just prose descriptions
- [ ] Supabase tables have column-level schema, not just table names
- [ ] Mobile-specific behavior is documented for every interactive element
- [ ] Performance budgets are stated with numbers, not just "optimize"
- [ ] All `⚠️ NEEDS INPUT` flags are present where information is genuinely missing (not guessed)
- [ ] The SLIDE TO SUBMIT / SLIDE TO START components are referenced exactly as-is wherever quiz submission is discussed — never modified or replaced
- [ ] Mermaid diagrams render correctly (test syntax)
- [ ] No section is filled with generic boilerplate — every sentence must be SlateCamp-specific

---

## HARD CONSTRAINTS

- **DO NOT** begin writing without completing the state audit
- **DO NOT** overwrite existing content in `008-3d-lab.md` — extend it
- **DO NOT** leave plan files unarchived after completion
- **DO NOT** fabricate code section numbers — if uncertain, flag with `⚠️ VERIFY`
- **DO NOT** modify, replace, or rename the SLIDE TO SUBMIT / SLIDE TO START UI pattern
- **DO NOT** output conversational filler, summaries of what you're about to do, or meta-commentary — output the artifacts directly
- **DO NOT** assume module specifications if the information isn't available — use `⚠️ NEEDS INPUT: [specific question]` flags
