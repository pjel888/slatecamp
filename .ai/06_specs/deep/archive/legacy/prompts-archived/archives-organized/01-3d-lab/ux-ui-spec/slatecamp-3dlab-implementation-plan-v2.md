# MASTER IMPLEMENTATION PLAN: SLATECAMP 3D LEARNING LAB v2.0

**Last updated:** 2026-03-24
**Status:** Pre-development
**Stack:** Next.js App Router · React Three Fiber · drei · Zustand · Supabase · Tailwind CSS · Shadcn
**Target:** 60fps on mid-range Android (Snapdragon 680-tier), 375px+ viewports

---

## How to use this document

This plan is the single source of truth for building the SlateCamp 3D Lab. It is structured as a strict sequential execution — each phase must be complete and passing acceptance criteria before the next begins. A broken hotspot interaction in Phase 3 invalidates everything built on top of it in Phases 4–9.

Every design decision in this plan traces back to one of two source documents:

- **Research basis:** _The 3D Learning Path: From First Pixel to Lasting Spatial Memory_ — the cognitive psychology and educational research that governs interaction design.
- **UI spec:** _SlateCamp 3D Lab UX Research & UI Spec v1.0_ — the pixel-level visual specification for every component.

Where this plan says "research basis," the decision is grounded in published evidence. Where it says "design spec," the decision is an aesthetic or layout choice from the UI specification. Both are binding.

---

## Governing principles

These six principles override any local implementation decision. If a feature conflicts with any of these, the principle wins.

### 1. Guided discovery is the default mode

Unassisted discovery underperforms explicit instruction (d = −0.38). Guided discovery — scaffolded sequencing with student-controlled pacing — produces the strongest outcomes (d = 0.50). Every module defaults to guided discovery. Free exploration is earned by completing the guided path and scoring ≥80% on the in-canvas quiz.
**Research basis:** Alfieri et al. 2011 meta-analysis (164 studies, 940 comparisons).

### 2. Cognitive load stays below the working memory ceiling

No more than 5 hotspots visible simultaneously. No more than 40 words per annotation. Annotations appear adjacent to the element they describe (spatial contiguity, g = 0.63). Non-active geometry dims to 30% opacity during guided sequences. Seductive details (decorative geometry irrelevant to the code provision) are suppressed during learning.
**Research basis:** Cowan's 4±1 working memory limit; Stull & Mayer 2007 (signaling saturation); Schroeder & Cenkci 2018 meta-analysis (58 comparisons).

### 3. Generation before instruction

Parametric sliders require the student to set a dimension before the system reveals the correct value. This error-then-correction sequence exploits the generation effect (up to 40% recall improvement) and productive failure (g = 0.87). The slider does not hint at the answer.
**Research basis:** Slamecka & Graf 1978; Sinha & Kapur 2021 meta-analysis.

### 4. Student controls pacing — always

Auto-rotate is disabled on load. Hotspots never auto-advance. The guided sequence advances only when the student taps "Next." If a student lingers >45 seconds on a single hotspot without interaction, a subtle "Ready for the next one? →" prompt appears — but never forces progression.
**Research basis:** Self-determination theory (autonomy); Mayer's pacing principle.

### 5. The 3D Lab must transfer to 2D exam performance

The Philippine ALE tests spatial code knowledge on 2D plans, sections, and elevations. A 3D model only justifies its engineering cost if it produces spatial understanding that transfers to those 2D formats. Every module includes a 3D-to-2D bridge: preset architectural view buttons (Plan / Section / 3D) that teach dimensional translation, and at least one quiz question that presents information in a 2D format.
**Research basis:** Yamada & Hirokawa 2015 meta-analysis; Ohio State scaffolded VR study 2025.

### 6. Measure everything, assume nothing

The 90-second disorientation threshold, the ±30% slider range, the 5-hotspot limit — these are synthesized from research, not empirically validated in a WebGL architecture viewer. Every behavioral threshold must be instrumented for future A/B testing. Build to measure.

---

## Non-negotiable rules

Violations of these rules are bugs, not design choices.

| Rule | Reason |
|------|--------|
| ✕ Never auto-rotate the camera on load | Students need to establish their own spatial reference frame first |
| ✕ Never auto-advance through hotspots | Pacing is student-controlled, always |
| ✕ Never show more than 5 hotspot dots simultaneously | Working memory ceiling (4±1 chunks) |
| ✕ Never use AI-generated 3D models | Code-compliant dimensions require precision |
| ✕ Never add gamification to the 3D Lab | The ALE is stressful enough — the Lab is a focused workspace |
| ✕ Never block the model with a splash screen | Onboarding overlays the loaded model, never replaces it |
| ✕ Never place a hotspot without an attached question | Every hotspot earns its place by enabling retrieval practice |
| ✕ Never use a color outside the design token set | Visual consistency across the entire platform |
| ✕ Never exceed 5MB GLB file size | Philippine mobile bandwidth constraint |
| ✕ Never put more than 2 sentences in a hotspot label | Coherence principle — ruthless editing |
| ✓ Always provide loading, error, and empty states | Every async boundary has all three |
| ✓ Always test on 375px mobile viewport | SlateCamp's primary audience is on mobile |
| ✓ Always dispose R3F geometry on unmount | Memory leaks kill mobile performance |
| ✓ Always use `distanceFactor` on `Html` hotspots | Consistent dot size regardless of zoom |
| ✓ Always round slider values with `Math.round()` | Never display decimal millimeters |

---

## File structure

Define this structure before writing any code. Every file path referenced in this plan maps to this tree.

```
src/
├── components/3d-lab/
│   ├── LabViewer.tsx              # Full-page wrapper — dark top bar, canvas area, overlay container
│   ├── LabCanvas.tsx              # R3F Canvas — lighting, controls, Suspense boundary
│   ├── LabTopBar.tsx              # Dark 36px bar — back link, module title, progress
│   ├── HotspotDot.tsx             # Pulsing dot in 3D space (drei Html component)
│   ├── HotspotGroup.tsx           # Manages visibility, progressive reveal, max-5 constraint
│   ├── InfoPanel.tsx              # 2D overlay — hotspot info, values table, practice CTA
│   ├── QuestionPanel.tsx          # 2D overlay — MCQ stem, 4 options, rationale
│   ├── QuizMode.tsx               # End-of-module quiz — hides annotations, bottom-sheet questions
│   ├── ToolPalette.tsx            # Bottom-right floating dark toolbar
│   ├── ParameterPanel.tsx         # Left-side 240px drawer for parametric controls
│   ├── ParametricSlider.tsx       # Reusable slider with cobalt/gold/red compliance states
│   ├── ComplianceStatus.tsx       # Live compliant/limit/violation indicator
│   ├── OnboardingFlow.tsx         # Global 3-step first-time experience
│   ├── ModuleContextCard.tsx      # Per-module orientation card (top-left, auto-dismiss 6s)
│   ├── GuidedSequencer.tsx        # Controls guided discovery flow — camera nav, hotspot locking
│   ├── FreeExploreToggle.tsx      # Adaptive toggle between guided and free modes
│   ├── DisorientationDetector.tsx # Behavioral telemetry — orbit velocity, zoom cycling, idle time
│   ├── ExitSummary.tsx            # Module completion screen — score, key dimensions, flashcard CTA
│   ├── PresetViewButtons.tsx      # Plan / Section / 3D camera presets (2D bridge)
│   ├── LabLoadingState.tsx        # GLB loading — spinner, progress %, pre-training tips
│   ├── LabErrorState.tsx          # GLB fail — SVG fallback, wiki redirect
│   ├── LabEmptyState.tsx          # No modules available for this topic
│   └── modules/
│       ├── AccessibleToilet/
│       │   ├── index.tsx
│       │   ├── ToiletModel.tsx
│       │   ├── ToiletHotspots.tsx
│       │   └── toilet.config.ts    # Hotspot data, quiz questions, compliance rules
│       └── StairwayConfigurator/
│           ├── index.tsx
│           ├── StairwayModel.tsx
│           ├── StairwayHotspots.tsx
│           ├── StairwayControls.tsx
│           └── stairway.config.ts
│
├── types/3d-lab.ts                 # All TypeScript interfaces — the contract for everything
├── stores/useLabStore.ts           # Zustand store — global 3D Lab state
├── hooks/
│   ├── useLabTelemetry.ts          # Behavioral event tracking hook
│   ├── useGuidedSequence.ts        # Manages guided discovery progression
│   └── useComplianceCheck.ts       # Evaluates parametric values against code thresholds
└── lib/
    └── lab-analytics.ts            # Telemetry event definitions and dispatch
```

---

## Phase 1: Type contracts and state management

**Goal:** Establish the rigid data structures that govern the entire 3D Lab ecosystem. Nothing renders until these are written, reviewed, and stable. Interfaces are the contract for everything that follows.

### 1.1 — Define TypeScript interfaces

Create `src/types/3d-lab.ts` with the following interfaces. Every field is intentional — do not add fields speculatively and do not omit any.

```typescript
// src/types/3d-lab.ts

export type HotspotType = 'informational' | 'exam-critical' | 'violation'

export type PanelMode = 'none' | 'info' | 'question' | 'quiz'

export type ComplianceState = 'compliant' | 'at-limit' | 'violation'

export type ExploreMode = 'guided' | 'free'

export interface HotspotData {
  id: string
  position: [number, number, number]       // World-space coordinates
  type: HotspotType
  label: string                            // Short text beside dot (toggle-able)
  eyebrow: string                          // DM Mono header in info panel
  title: string                            // Info panel title — short noun phrase, never a sentence
  body: string                             // 2–3 sentences max (≤40 words). Concept first, value last.
  values: Array<{
    label: string
    value: string
    isOld?: boolean                        // true = renders with strikethrough (superseded standard)
  }>
  source: string                           // Full code citation — never abbreviated
  questionId: string                       // ID of attached MCQ
  highlightMeshName?: string               // Mesh to tint cobalt when hotspot is active
  sequenceOrder: number                    // Position in guided discovery sequence (1-indexed)
  category?: string                        // For models with >5 hotspots: filter group
}

export interface LabQuestion {
  id: string
  hotspotId: string
  type: 'multiple-choice' | 'slider-adjust' | 'hotspot-click'
  stem: string
  options?: Array<{ id: string; text: string }>  // For multiple-choice
  correctOptionId?: string                        // For multiple-choice
  correctValue?: number                           // For slider-adjust
  correctHotspotId?: string                       // For hotspot-click
  rationale: string                               // 2–3 sentences: why correct AND why common wrong is wrong
  taxonomyNode: string                            // Links to heatmap node for score update
}

export interface ParametricControl {
  id: string
  label: string
  unit: 'mm' | 'degrees' | 'ratio'
  min: number
  max: number
  codeMin?: number                         // Code-required minimum (triggers violation below this)
  codeMax?: number                         // Code-required maximum (triggers violation above this)
  step: number                             // 1 for mm, 0.5 for ratios
  defaultValue: number                     // Random within ±30% of threshold on each session
  affectsMeshes: string[]                  // Mesh names to update on change
}

export interface ModuleConfig {
  slug: string
  title: string
  codeReference: string                    // e.g., "BP 344 §6.3" or "PD 1096 §4.08"
  subject: string                          // e.g., "Accessibility" or "Structural"
  learningObjective: string                // One sentence shown in module context card
  estimatedMinutes: number
  modelUrl: string                         // Path to GLB in Supabase storage
  modelSizeMB: number                      // Displayed during loading; max 5.0
  defaultCameraPosition: [number, number, number]
  defaultCameraTarget: [number, number, number]
  hotspots: HotspotData[]
  questions: LabQuestion[]
  parametricControls?: ParametricControl[]
  supportsCrossSection: boolean
  supportsExplodedView: boolean
  preTrainingTips: string[]                // 2–3 tips rotated during loading screen
  presetViews: {                           // Architectural camera presets for 2D bridge
    plan?: [number, number, number]
    section?: [number, number, number]
    elevation?: [number, number, number]
  }
}

export interface TelemetryEvent {
  moduleSlug: string
  event: string                            // e.g., 'hotspot_opened', 'question_answered', 'slider_adjusted'
  timestamp: number
  payload: Record<string, unknown>
}
```

### 1.2 — Initialize Zustand store

Create `src/stores/useLabStore.ts`. The store holds all global 3D Lab state. No component-local state for anything that crosses component boundaries.

```typescript
// src/stores/useLabStore.ts

import { create } from 'zustand'
import type { PanelMode, ExploreMode, ComplianceState } from '@/types/3d-lab'

interface LabState {
  // Panel state
  activeHotspotId: string | null
  panelMode: PanelMode
  questionAnswered: boolean
  selectedOptionId: string | null

  // Progress tracking
  visitedHotspotIds: Set<string>
  answeredQuestionIds: Set<string>
  correctQuestionIds: Set<string>
  currentSequenceIndex: number             // Guided mode: which hotspot is "current"

  // Exploration mode
  exploreMode: ExploreMode
  guidedSequenceComplete: boolean

  // Parametric state
  parametricValues: Record<string, number>
  complianceState: ComplianceState

  // View state
  crossSectionEnabled: boolean
  explodedViewEnabled: boolean
  labelsVisible: boolean
  cameraIsOrbiting: boolean
  quizModeActive: boolean                  // true = annotations hidden, quiz bottom-sheet visible

  // Actions
  openHotspot: (id: string) => void
  closePanel: () => void
  openQuestion: () => void
  selectOption: (optionId: string) => void
  advanceSequence: () => void
  setExploreMode: (mode: ExploreMode) => void
  setParametricValue: (controlId: string, value: number) => void
  setComplianceState: (state: ComplianceState) => void
  toggleCrossSection: () => void
  toggleExplodedView: () => void
  toggleLabels: () => void
  enterQuizMode: () => void
  exitQuizMode: () => void
  resetCamera: () => void
  resetSession: () => void
}
```

### 1.3 — Define telemetry hooks

Create `src/hooks/useLabTelemetry.ts`. This hook tracks behavioral signals that drive adaptive scaffolding.

**Events to track:**

| Event | Payload | Purpose |
|-------|---------|---------|
| `module_loaded` | `slug`, `loadTimeMs`, `modelSizeMB` | Performance baseline |
| `time_to_first_hotspot` | `slug`, `durationMs` | Disorientation signal (>90s = intervention) |
| `hotspot_opened` | `hotspotId`, `type`, `sequenceOrder` | Learning progression |
| `question_answered` | `questionId`, `correct`, `selectedOptionId`, `timeMs` | Quiz performance |
| `slider_adjusted` | `controlId`, `value`, `isViolation` | Generation behavior |
| `orbit_velocity` | `angularVelocity`, `timestamp` | Disorientation signal (erratic = >90°/s) |
| `zoom_cycle` | `count`, `windowMs` | Disorientation signal (>3 in 5s = lost) |
| `idle_detected` | `durationMs` | Overwhelm signal (>10s after load) |
| `mode_switch` | `from`, `to`, `trigger` | Adaptive scaffolding signal |
| `preset_view_used` | `viewName` | 2D bridge engagement |
| `quiz_completed` | `score`, `total`, `timeMs` | Module mastery |
| `module_exited` | `completionPercent`, `totalTimeMs` | Session health |

### Acceptance criteria — Phase 1

- [ ] All interfaces compile with zero TypeScript errors
- [ ] Zustand store initializes correctly with default values
- [ ] Every action function mutates state as expected (unit test each)
- [ ] Telemetry hook fires events to console in development mode
- [ ] No runtime state exists outside the Zustand store for cross-component concerns

---

## Phase 2: Canvas environment and page shell

**Goal:** Build the pristine, visually calm 3D stage and the full-page layout wrapper. After this phase, you should see a cream-background viewport with working orbit controls and nothing else.

### 2.1 — LabViewer page wrapper

Create `LabViewer.tsx` as the full-page layout. This is the outermost component.

**Layout structure (top to bottom):**

1. **Dark top bar** (36px height, `#0F1F5C` navy background)
   - Left: "← Back to wiki" link (DM Mono 10px, `rgba(255,255,255,.4)`)
   - Center: Module title + code reference (DM Mono 11px, `rgba(255,255,255,.6)`, 500wt)
   - Right: Hotspot progress "3 of 6 hotspots" (DM Mono 10px, `rgba(255,255,255,.3)`)

2. **Canvas area** (fills remaining viewport height)
   - Contains the R3F Canvas, all overlay panels float above it
   - No sidebar. No fixed panels competing with the 3D view.

### 2.2 — LabCanvas setup

Create `LabCanvas.tsx` — the R3F Canvas with lighting and camera controls.

**Exact values (from UI spec):**

```
Background:         #F2F0EB (SlateCamp Cream)
Ambient light:      intensity 0.5
Directional light:  position [5, 10, 5], intensity 1.0, castShadow, shadow-mapSize [2048, 2048]
ContactShadows:     position [0, 0, 0], opacity 0.35, scale 10, blur 2
Environment:        preset "city"
Camera FOV:         45°
Camera position:    Three-quarter elevated isometric (per-module default, e.g., [3, 2, 5])
Antialias:          Always true
GL alpha:           false
```

**OrbitControls constraints:**

```
enablePan:       false (exception: large floor plan modules may enable with damping)
enableDamping:   true, dampingFactor 0.05
minPolarAngle:   0.1 (prevents looking straight down)
maxPolarAngle:   Math.PI / 2 (prevents going below the floor)
minDistance:      1
maxDistance:      15
autoRotate:      false (never, always)
```

### 2.3 — Loading, error, and empty states

**LabLoadingState.tsx:**
The loading screen is a learning opportunity, not dead time. The pre-training principle (d = 0.75) means displaying relevant building code facts while the model loads.

- Cream background renders immediately (never a blank white screen)
- Centered cobalt spinner (24px circular indicator, not full-page)
- Module name in DM Mono 10px below spinner
- Progress percentage from GLB loader
- Rotating pre-training tips from `moduleConfig.preTrainingTips` (e.g., "BP 344 requires a minimum 1500mm turning radius for wheelchairs. You'll measure this in the model.")
- Accelerating progress bar (feels 11% shorter than constant-speed bars per Harrison 2007)
- **Abort threshold:** If loading exceeds 8 seconds, display a "View as 2D" fallback button

**LabErrorState.tsx:**
- Architectural line drawing (SVG placeholder) of the topic
- "3D model unavailable. The wiki article has all the information you need."
- Link to relevant wiki section
- Never a red error message — calm, informative, redirects

**LabEmptyState.tsx:**
- "No 3D model yet for this topic. Check back — we're building it."
- DM Mono eyebrow, 2-line Inter body
- Never "Coming soon" — honest about the current state

### Acceptance criteria — Phase 2

- [ ] Full-page layout renders with dark top bar, cream canvas, and correct proportions
- [ ] Empty scene runs at 60fps on a mid-range laptop
- [ ] OrbitControls respond to drag/scroll/pinch with smooth damping
- [ ] Camera cannot pan off the model, cannot go below the floor, cannot clip through geometry
- [ ] Loading state displays spinner + progress + pre-training tips
- [ ] Error state displays when given a broken GLB URL
- [ ] Top bar shows back link, module title, and progress indicator
- [ ] On 375px mobile viewport: layout is usable, no horizontal overflow

---

## Phase 3: GLB model loading and module configuration

**Goal:** Load the first real 3D model (Accessible Toilet), verify performance, and establish the module configuration pattern that all future modules follow.

### 3.1 — GLB loader with Suspense

Use `useGLTF` from drei inside a Suspense boundary. The Suspense fallback is `LabLoadingState`.

**Asset budget per module:**
- Maximum GLB size: 5 MB compressed (Draco + gzip)
- Target load time: 1–2 seconds on Philippine 4G (15–25 Mbps)
- Progressive loading: low-poly silhouette at 0.5s, full quality by 3–5s

**Model material palette (from UI spec):**
- Primary geometry: matte off-white (`#F5F3EE`)
- Structural elements: light gray (`#C8C5BE`)
- Active hotspot highlight: Cobalt Blue tint at 40% opacity
- Violation state: Signal Red at 30% opacity
- Dimmed geometry (guided mode): 30% opacity

### 3.2 — Module configuration pattern

Each module lives in its own directory under `components/3d-lab/modules/` and exports a `ModuleConfig` object from its `.config.ts` file. This config contains all hotspot data, questions, parametric controls, and compliance rules — no data fetching at this level.

**First module:** Accessible Toilet (BP 344). This is the reference implementation. All other modules copy its pattern.

### 3.3 — Performance monitoring

- If FPS drops below 20 for >3 seconds, show a dismissible toast: "This model is running slowly. Try closing other tabs for a better experience." (Signal Gold background, DM Mono, bottom of screen.)
- Log `renderer.info` (draw calls, triangles, textures) per frame in development mode
- On screens narrower than 375px: show a static annotated screenshot fallback with message: "3D Lab works best on larger screens."

### Acceptance criteria — Phase 3

- [ ] Accessible Toilet GLB loads and renders with correct materials
- [ ] ContactShadows ground the model visually
- [ ] Model stays under 5 MB compressed
- [ ] Runs at 60fps on a mid-range laptop with the loaded model
- [ ] `toilet.config.ts` exports a valid `ModuleConfig` with all hotspots and questions
- [ ] Geometry disposes correctly on unmount (no memory leak on route change)
- [ ] Low-performance toast triggers correctly when FPS drops below threshold

---

## Phase 4: Hotspot interaction system

**Goal:** Build the primary spatial anchors for learning — the dots, info panels, and question overlays. This is the core interaction loop of the entire 3D Lab.

### 4.1 — HotspotDot component

Build using drei's `Html` component with `distanceFactor={8}` to maintain consistent screen size regardless of camera zoom.

**Three dot types, three colors — color encodes meaning, never decoration:**

| Type | Color | Hex | Ring color | Semantic |
|------|-------|-----|------------|----------|
| Informational | Cobalt | `#1B3FC4` | `rgba(27,63,196,0.3)` | Explains a dimension or provision |
| Exam-critical | Gold | `#F5A623` | `rgba(245,166,35,0.3)` | A specific value the ALE has historically tested |
| Violation | Red | `#E63329` | `rgba(230,51,41,0.3)` | Marks a code compliance failure |

**Four interaction states:**

1. **Idle:** 18×18px circle. Type color fill. 2.5px white border. Outer pulse ring (6px, type color at 30% opacity, 2s ease-in-out infinite animation).
2. **Hover:** Scale 1.25 (200ms ease). Pulse ring expands to 10px. Cursor: pointer.
3. **Active (clicked):** Scale 1.15. White border becomes 3px. Connecting leader line (0.5px, dashed, type color) runs to the info panel. Associated model geometry receives cobalt tint.
4. **Visited:** Pulse ring stops. Small ✓ checkmark appears at bottom-right of dot. Opacity 70%.

**Accessibility:** Supplement all color-coded states with icons (✓, ✗, ⚠) and pattern fills for colorblind users.

### 4.2 — HotspotGroup manager

This component enforces the max-5 constraint and manages progressive reveal for guided mode.

- In **guided mode:** Hotspots reveal sequentially based on `sequenceOrder`. Only the current hotspot and previously visited hotspots are visible. A progress indicator ("3 of 7") appears at the bottom of the screen.
- In **free mode:** All hotspots visible (up to 5 per category). If a module has >5, use a category filter to show one group at a time.
- The group dims non-active geometry to 30% opacity when any hotspot is active during guided mode.

### 4.3 — InfoPanel

A 240px-wide 2D HTML overlay that floats over the canvas. Connected to the active hotspot via a leader line.

**Panel anatomy (from UI spec):**

- **Eyebrow** (DM Mono 9px, uppercase): `[Element type] · [Source section]`. Gold hotspots: "Most-tested · ALE Watch" in gold.
- **Title** (Inter 13px, 600wt): Name of the element. Short noun phrase.
- **Body** (Inter 12px, 400wt): 2–3 sentences max. Concept first, value last. Never starts with "The minimum is…"
- **Values table:** 2–3 rows. 2024 correct value first. Old superseded value below with strikethrough.
- **Source line** (DM Mono 10px): Full section reference, never abbreviated.
- **Practice CTA:** "Practice a question on this →". Opens question panel. Never says "Take a quiz" — framing is deliberate practice.

**Positioning logic:**
- Default: right side of the hotspot dot
- If hotspot is in the right half of the viewport: panel opens to the left
- Always keeps 16px clear of viewport edges
- **Mobile:** Anchors to bottom of screen as a drawer, not a floating card

**Close behavior:** Tap outside the panel OR tap the dot again. No explicit close button.

### 4.4 — QuestionPanel

A 280px-wide overlay that replaces (not stacks with) the info panel.

**Interaction flow:**

1. Student taps "Practice a question on this →"
2. Info panel fades out (150ms). Question panel fades in at the same position.
3. Canvas dims slightly (20% background overlay). Camera orbit locks.
4. **Question:** Exactly 1 per hotspot. Tests the specific dimension shown in the info panel.
5. **Options:** Always exactly 4. One correct. Three plausible distractors including the superseded 2013 value where applicable.
6. Student selects an option → all options lock immediately.
7. Correct option → green background. Student's wrong choice (if wrong) → red.
8. **Rationale** appears inline below options (2–3 sentences: why correct AND why common wrong is wrong).
9. "← Back to model" link below rationale. Closes panel, re-enables orbit, dot gets ✓ visited mark.
10. Heatmap node update fires silently in the background.

**Feedback timing:** ≤0.5 seconds from selection to result display. Spatial working memory decays rapidly — delayed feedback impairs learning (Maddox et al. 2003).

### 4.5 — Complete hotspot state machine

```
IDLE → [click dot] → INFO_OPEN → [tap CTA] → QUESTION_OPEN → [select option] → ANSWERED → [back to model] → IDLE
                    ↘ [tap outside] → IDLE
```

### Acceptance criteria — Phase 4

- [ ] All three hotspot dot types render correctly in 3D space with consistent screen size at all zoom levels
- [ ] All four interaction states (idle, hover, active, visited) transition smoothly
- [ ] Info panel opens adjacent to the dot with correct positioning logic (left/right/bottom-sheet)
- [ ] Info panel displays all content fields from `HotspotData`
- [ ] Question panel replaces info panel with smooth crossfade
- [ ] Options lock on selection. Correct/wrong states display immediately.
- [ ] Rationale appears inline. "← Back to model" returns to idle state.
- [ ] Visited hotspot shows ✓ mark and stops pulsing
- [ ] Leader line connects active dot to info panel
- [ ] Canvas dims 20% during question mode
- [ ] Camera orbit locks during question mode, re-enables on panel close
- [ ] Mobile: info panel renders as bottom-sheet drawer on 375px viewport

---

## Phase 5: Tool palette and preset views

**Goal:** Build the student's control interface and the 2D bridge.

### 5.1 — ToolPalette

A floating dark-glass pill in the bottom-right corner.

**Visual treatment:**
- Background: `rgba(20, 23, 36, 0.92)` with backdrop-filter blur 8px
- Border: 0.5px `rgba(255,255,255,.1)`, border-radius 10px
- Position: fixed, bottom-right, 16px margin. Mobile: bottom-center.
- Button dimensions: 36×36px, border-radius 7px, 44px touch target

**Buttons (in order):**

| Button | Function | Active state | Availability |
|--------|----------|-------------|-------------|
| Orbit | Free orbit (default mode) | Cobalt fill, white icon | Always |
| Cross-section | Horizontal cut plane | Cobalt fill, cut plane appears | Per-module support flag |
| Explode | Component separation (600ms ease-out) | Cobalt fill, components separate | Per-module support flag |
| Reset camera | Return to module's default view | Momentary flash | Always |
| Label toggle | Show/hide hotspot text labels | Cobalt when visible | Always |
| Help | Compact control overlay | None (momentary) | Always |

**Button states:** Default (6% white bg, 55% white icon) → Hover (12% white bg, 85% icon, 150ms) → Active (Cobalt fill, white icon) → Disabled (2% bg, 20% icon, cursor not-allowed).

**Tooltip:** DM Mono 10px label above button on hover, 200ms delay.

### 5.2 — PresetViewButtons

Three buttons in the bottom toolbar: **Plan** / **Section** / **3D** (default). Tapping any button smooth-animates the camera to that standard architectural view.

This is not a navigation convenience — it is the 2D bridge. It teaches students to think in plan/section/3D, which is the exact cognitive skill the ALE tests.

**Research basis:** The Ohio State study found 360 minutes of 3D-to-2D bridged instruction matched 900 minutes of paper-only instruction.

### Acceptance criteria — Phase 5

- [ ] Tool palette renders as dark glass pill with correct position and blur
- [ ] All 6 buttons display correct icons and respond to hover/active/disabled states
- [ ] Reset camera smoothly animates to module default position
- [ ] Label toggle shows/hides text labels (not dots)
- [ ] Cross-section and explode buttons disabled for modules that don't support them
- [ ] Preset view buttons smoothly animate camera to plan/section/3D positions
- [ ] Tooltips appear on hover with 200ms delay
- [ ] Mobile: palette moves to bottom-center

---

## Phase 6: Parametric engine

**Goal:** Build the left-hand drawer for interactive building code variables. This is the highest-value interaction — it directly trains "what happens when the variable changes" reasoning.

### 6.1 — ParameterPanel

A 240px left-side drawer. Slides in over the canvas on module load for parametric modules.

- Pure white background, 0.5px right border
- Header: DM Mono 9px eyebrow (module name) + Inter 13px 600wt title (code reference)
- Not dismissible while parametric controls are active

### 6.2 — ParametricSlider

**Generation-before-instruction flow:**

1. Slider appears set to a random starting position within ±30% of the code threshold. The system does NOT hint at the correct value.
2. Student drags slider. Model geometry updates in real-time. No color feedback yet.
3. Student taps "Check."
4. **Non-compliant:** Geometry turns red, violation animation plays, correct value appears with code citation.
5. **Compliant:** Geometry turns green, "Correct — [code citation]" appears.
6. "Try again?" offered for a second attempt (generation effect is strongest with multiple attempts).

**Slider visual specification:**

- Track: 4px height, `#E0DED8`, border-radius 2px
- Fill: 4px height, color changes dynamically:
  - **Cobalt** (`#1B3FC4`): normal range
  - **Signal Gold** (`#F5A623`): at code limit (exactly at max/min)
  - **Signal Red** (`#E63329`): exceeds code limit
- Thumb: 14×14px white circle, 2px cobalt border. Hover: 2.5px. Drag: scale 1.2.
- Value display: DM Mono 12px 500wt, right-aligned, updates live, always `Math.round()`
- Range labels: DM Mono 9px ink-muted below track. "min 250" / "max 200"
- Range constraint: ±30% around the critical threshold (meaningful decisions, not obvious extremes)

### 6.3 — ComplianceStatus

Persistent indicator at the bottom of the parameter panel. Updates in real time.

- **Green:** "Compliant — All values within [code] limits."
- **Gold:** "At limit — One value exactly at maximum/minimum."
- **Red:** "Violation — One or more values exceed code limits."

### Acceptance criteria — Phase 6

- [ ] Parameter panel slides in from left with correct width and styling
- [ ] Slider track fill changes color dynamically (cobalt → gold → red)
- [ ] Slider thumb responds to drag with no transition delay
- [ ] Model geometry updates in real-time as slider moves
- [ ] "Check" button evaluates compliance and displays correct/violation feedback
- [ ] Compliance indicator at panel bottom updates in real-time
- [ ] Slider values always display as rounded integers (no decimals)
- [ ] Slider range is constrained to ±30% of code threshold
- [ ] Random starting position changes each session (no hint at correct value)

---

## Phase 7: Guided discovery sequencer and adaptive scaffolding

**Goal:** Implement the guided-vs-free exploration system. This is the most research-critical phase — it determines whether the 3D Lab produces learning or just exploration.

### 7.1 — GuidedSequencer

Controls the guided discovery flow when `exploreMode === 'guided'`.

**Sequence per hotspot (repeat for each in `sequenceOrder`):**

1. Camera auto-navigates to optimal view of the element (0.8s smooth transition)
2. Non-active geometry dims to 30% opacity
3. Annotation panel appears via leader line
4. Orbit constrained to ±45° around the current view (constraining interactivity improves spatial understanding per Khooshabeh et al. 2008)
5. Student manipulates within constraints, reads annotation
6. Student taps "Next" to advance. System never auto-advances.
7. If student lingers >45s with no interaction: subtle "Ready for the next one? →" prompt

### 7.2 — FreeExploreToggle

Adaptive scaffolding based on student history and behavior.

**Default mode selection (from research decision tree):**

| Condition | Default mode |
|-----------|-------------|
| First time viewing module + completed <3 modules total | Full guided. Free explore toggle hidden until sequence completes. |
| First time viewing module + completed ≥3 modules with avg quiz ≥70% | Abbreviated guided. Free explore toggle visible from start. |
| Returning to module + previous quiz <80% | Guided (re-learning path). Sequence focuses on previously missed questions only. |
| Returning to module + previous quiz ≥80% | Free exploration. All hotspots visible. Quiz available immediately. |

**Behavioral overrides (real-time):**

| Signal | Threshold | Action |
|--------|-----------|--------|
| Erratic navigation with no hotspot engagement | >90 seconds | Nearest unvisited hotspot pulses with "Start here →" tooltip |
| Continued erratic navigation | >180 seconds | Explicit "Switch to Guided Mode?" prompt |
| Student in guided mode skips 3+ consecutive hotspots | N/A | System suggests free explore (expertise reversal signal) |
| Student in free mode zooms directly to 3+ correct elements | N/A | Confirm free explore, reduce UI scaffolding further |

### 7.3 — DisorientationDetector

Tracks behavioral signals from the research to detect spatial disorientation.

**Signals monitored:**

- **Rapid erratic rotation:** Angular velocity >90°/s without pausing at any viewpoint for >1 second
- **Zoom cycling:** Repeated zoom-in/zoom-out >3 times in 5 seconds without dwelling
- **No interaction after load:** >10 seconds with zero input
- **Direct zoom to element:** Within 3 seconds → expert signal, no intervention needed
- **Systematic pause-rotate-pause:** Oriented exploration, no intervention needed

**Important:** User self-reports of disorientation do not reliably correlate with actual disorientation (Otter & Johnson 2000). Behavioral telemetry is more accurate than asking.

### 7.4 — First contact: canonical view and orientation

When a module loads, the following sequence executes before guided discovery begins.

**Research basis:** Palmer, Rosch & Chase 1981 — three-quarter elevated view maximizes diagnostic information. Siegel & White 1975 — landmark knowledge develops first.

1. **0–3 seconds:** Model appears in canonical three-quarter view. Static. No hotspots visible. No UI overlays except a subtle "Pinch to zoom, drag to rotate" tooltip that fades after 3 seconds.
2. **At 3 seconds:** Human-scale figure (1.7m) fades in as physical reference. First hotspot begins pulsing.
3. **Orientation task (optional for modules that warrant it):** "Tap the main entrance door" — confirms the student can navigate the touch interface and has registered the primary spatial anchor.

### Acceptance criteria — Phase 7

- [ ] Guided sequence auto-navigates camera to each hotspot with 0.8s smooth transition
- [ ] Non-active geometry dims to 30% during guided mode
- [ ] Orbit constrains to ±45° around active element in guided mode
- [ ] "Next" button advances sequence; system never auto-advances
- [ ] Free explore toggle appears/hides based on student history
- [ ] 90-second disorientation intervention triggers correctly
- [ ] 180-second guided mode prompt triggers correctly
- [ ] 3+ skip detection suggests free explore mode
- [ ] Canonical view holds for 3 seconds before hotspots appear
- [ ] Human-scale reference figure fades in at 3 seconds
- [ ] All behavioral thresholds are configurable (not hardcoded) for future A/B testing

---

## Phase 8: Onboarding

**Goal:** Every student who opens a 3D module for the first time understands what they're looking at, how to move around, and what to do first — in under 20 seconds.

### 8.1 — Two-tier system

**Tier 1 — Global controls** (once per lifetime):
- Trigger: `localStorage.getItem('3dlab_onboarded') === null`
- Format: 3-step bottom sheet (mobile) or centered modal (desktop). Dark background.
- Each card: icon + 1-line instruction
  1. "Drag anywhere to rotate the model. Scroll or pinch to zoom."
  2. "Tap the glowing dots on the model to open a code annotation."
  3. "After reading a hotspot, tap 'Practice a question' to answer one exam question."
- CTA: "Start exploring →". Sets `3dlab_onboarded: true`.
- "Skip" link available immediately.
- **Critical:** Onboarding overlays the loaded model. Never a blank screen with instructions.

**Tier 2 — Module context card** (once per module):
- Trigger: `localStorage.getItem('module_[slug]_seen') === null`
- Format: Small card, top-left corner, auto-dismiss after 6 seconds OR on any canvas interaction
- Content: Module name + 1-sentence learning objective + hotspot count + estimated time
- Auto-dismiss has a thin cobalt progress bar at the bottom

### Acceptance criteria — Phase 8

- [ ] New user sees Tier 1 global onboarding on first module visit
- [ ] Returning user skips Tier 1
- [ ] First visit to any module shows Tier 2 context card
- [ ] Context card auto-dismisses after 6 seconds with visible timer
- [ ] Any canvas interaction immediately dismisses the context card
- [ ] Model is visible behind onboarding overlays at all times
- [ ] "Skip" link works on Tier 1

---

## Phase 9: In-canvas quiz and exit summary

**Goal:** The quiz phase converts spatial exploration into durable memory through retrieval practice. The exit summary consolidates the session and bridges to spaced repetition.

### 9.1 — QuizMode

After completing all hotspots in a module, a "Test yourself →" button appears.

**Key design decision:** Show the 3D model but **hide all annotations, labels, and dimension callouts** during quiz mode. This preserves spatial context (encoding specificity) while forcing genuine retrieval. The model provides spatial cues — "That's the door I examined" — without providing the answer.

**Research basis:** Agarwal et al. 2008 — open-book quiz conditions led to more forgetting over one week compared to closed-book conditions. Showing annotations during a quiz defeats the retrieval practice benefit.

**Quiz format mix:**
- 40% Slider-adjust questions ("Drag the door width to the minimum BP 344 requires")
- 40% Hotspot-click questions ("Tap the element that violates the fire egress code")
- 20% Multiple-choice questions (factual/declarative, lowest spatial engagement)

**Research basis for interleaving:** Pan et al. 2019 — d = 0.67 for discriminative learning from mixed retrieval modes.

**Question count:** 5–7 per module. No second attempts during quiz (the generation phase in Phase 6 is where multiple attempts belong).

**Quiz UX:**
- All annotations fade out. Model dims slightly to signal mode change.
- Quiz panel appears as a bottom sheet (within thumb zone on mobile)
- 3D model remains visible and interactive above the quiz panel

### 9.2 — ExitSummary

Module completion screen. Leaves the student with a consolidated mental model.

**Content:**
1. Score (e.g., "5/7")
2. Thumbnail of the 3D model from canonical view (screenshot-able)
3. List of key dimensions with ✓/✗ marks
4. "Review in Wiki →" button linking to the specific section
5. "Add to Flashcards" auto-toggle (default ON)

**Spaced repetition bridge:** Auto-generate flashcards from the module's key dimensions and violations. Schedule at 1 day, 3 days, 7 days, and 14 days.

**Return to wiki:** The wiki article re-opens scrolled to the section corresponding to the completed module, with key dimensions highlighted. This closes the **Wiki → 3D Lab → Quiz → Wiki** learning loop.

### 9.3 — Score-based adaptive default

After quiz completion, update the student's record for this module:
- Score ≥80%: Future visits default to free exploration mode
- Score <80%: Future visits default to guided mode, focused on missed questions

### Acceptance criteria — Phase 9

- [ ] "Test yourself" button appears after all hotspots are visited
- [ ] Entering quiz mode hides all annotations and dimension callouts
- [ ] Model remains visible and interactive during quiz
- [ ] Quiz bottom sheet renders within thumb zone on mobile
- [ ] Slider-adjust, hotspot-click, and multiple-choice question types all function
- [ ] Immediate feedback (≤0.5s) after each answer with camera auto-navigating to the relevant element
- [ ] Exit summary displays score, key dimensions with ✓/✗, and wiki return link
- [ ] Flashcard auto-generation fires on module completion
- [ ] Student's adaptive mode default updates based on quiz score

---

## Phase 10: Cross-section, exploded view, and advanced interactions

**Goal:** Implement the advanced visualization tools that only apply to certain modules.

### 10.1 — Cross-section mode

A horizontal cut plane reveals interior spaces. Toggle via the tool palette.

- Clipping plane position is per-module (configured in `module.config.ts`)
- Smooth transition on enable/disable (300ms)
- Cut face rendered with a subtle hatch pattern or edge highlight to indicate the cut

### 10.2 — Exploded view

Component separation animation reveals assembly or layering.

- Components separate with a 600ms ease-out animation
- Separation distances configured per-module
- Hotspot dots maintain their positions relative to their component (they move with the explosion)

### 10.3 — Violation visualization

For parametric modules: when a dimension is non-compliant, the affected geometry highlights red and a brief animation shows *why* it fails — e.g., a wheelchair avatar attempting to pass through a too-narrow door.

**Research basis:** Becker et al. 2025 — insight moments nearly double memory retention.

### Acceptance criteria — Phase 10

- [ ] Cross-section plane renders at configured position with smooth toggle
- [ ] Exploded view separates components with 600ms animation
- [ ] Hotspots move with their components during exploded view
- [ ] Violation animations play correctly for parametric modules
- [ ] These features only enable for modules that declare support in config

---

## Performance budget

| Metric | Target | Hard limit |
|--------|--------|-----------|
| GLB file size | ≤2 MB | 5 MB |
| Canvas FPS (idle) | 60fps | 30fps |
| Canvas FPS (interaction) | 60fps | 20fps (triggers low-perf toast below 20) |
| Time to first paint | <0.5s | 1s |
| Time to model visible | <2s | 5s (progressive loading) |
| Time to interactive | <3s | 8s (triggers "View as 2D" fallback) |
| Memory per module | <50 MB | 100 MB |
| Draw calls (loaded scene) | <100 | 200 |

---

## Testing strategy

Every phase has acceptance criteria. Here is the testing approach for each category:

**Unit tests** (Vitest):
- Zustand store actions and state transitions
- Compliance check logic (parametric values vs. code thresholds)
- Telemetry event formatting

**Component tests** (React Testing Library):
- Info panel renders correct content from `HotspotData`
- Question panel locks options on selection
- Onboarding gating logic (localStorage checks)

**Visual regression** (manual for now, Playwright screenshots later):
- Hotspot dot states at all zoom levels
- Info panel positioning (left/right/bottom-sheet)
- Slider color transitions (cobalt → gold → red)
- Dark tool palette on cream background

**Integration tests** (manual until Playwright R3F support stabilizes):
- Full hotspot flow: click dot → read info → answer question → return to model
- Guided sequence: camera navigation, hotspot locking, progressive reveal
- Parametric flow: adjust slider → check → violation feedback → retry

**Device testing:**
- Desktop: Chrome, Firefox, Safari (latest)
- Mobile: Chrome on Android (mid-range), Safari on iOS 16+
- Viewport: 375px (minimum), 768px (tablet), 1280px (desktop)

---

## Research gaps and honest uncertainties

Several design decisions in this plan rest on extrapolation, not direct evidence. These are the measurement priorities.

1. **No study directly compares guided vs. free exploration in a WebGL architecture model viewer.** The evidence comes from VR anatomy, multimedia learning, and hypertext navigation. A/B test guided vs. free as soon as the user base supports statistical power.

2. **The 90-second disorientation threshold is synthesized, not empirically established.** It derives from multiple sources. The actual threshold for a mobile WebGL viewer may be shorter (smaller screen) or longer (architecture students have above-average spatial training). Make all thresholds configurable.

3. **Context-dependent memory effects are smaller than originally thought.** The Murre 2021 replication of Godden & Baddeley failed. The in-canvas quiz is still justified by retrieval practice benefits, but the context reinstatement benefit may be negligible.

4. **Touch vs. mouse equivalence for spatial encoding is under-researched.** Monitor behavioral metrics closely for touch-only users. The smaller field of view and lower precision of touch may produce inferior spatial schemas.

5. **The productive failure effect (g = 0.87) may be inflated by publication bias.** The corrected estimate is likely g = 0.40–0.60. Still strong enough to justify the generation-before-instruction design, but calibrate expectations.

These gaps define what to measure first. Instrument every phase transition, log every behavioral signal, and run A/B tests as soon as possible. The plan is a hypothesis. The data will confirm, modify, or reject each decision. Build to measure.
