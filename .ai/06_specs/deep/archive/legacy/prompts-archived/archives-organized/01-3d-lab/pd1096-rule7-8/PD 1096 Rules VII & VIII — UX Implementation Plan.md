---

# 1. UX Research & ALE Cognitive Strategy

## 1.1 — Cognitive Friction Audit: Where ALE Reviewers Break Down

Based on the PD 1096 Rules VII & VIII document and the ALE failure patterns it encodes, six discrete cognitive friction points obstruct reviewers:

### Friction Point 1: The AMBF Three-Way Check (Critical)
The canonical formula `AMBF = min(AMBF_setback, AMBF_PSO, AMBF_TOSL)` requires a reviewer to hold **three independently computed values in working memory simultaneously**, then apply a min-selector. In examination conditions, reviewers collapse this to a single computation pathway — typically PSO-only — and miss the binding constraint. The 3D scene must externalize all three values as simultaneous, spatially distinct geometries.

**Cognitive fix:** Render all three envelope candidates as layered transparent volumes. The binding constraint (minimum AMBF) glows solid-blue. The non-binding constraints render as ghost volumes with amber/grey tinting. The reviewer sees the three-way competition spatially, not arithmetically.

### Friction Point 2: Area Closure Identity Abstraction
`TLA = AMBF + ISA + USA` is taught as an equation. Reviewers pass questions about it but fail to apply it to reverse-derivation scenarios (given TOSL and ISA, find USA). The equation is treated as text, not spatial truth.

**Cognitive fix:** The site plan is a literal pie. Each zone (AMBF, ISA, USA) is a color-filled ground plane tile. Changing one slider redraws the others in real-time, making the closure identity visually enforced — not memorized.

### Friction Point 3: TOSL vs. MACA Conflation
Reviewers conflate `TOSL = ISA + USA` (open space, excludes building) with `MACA = PSO + ISA` (construction area, includes impervious hardscape). These have overlapping vocabulary ("area," "open," "allowable") that is phonetically and semantically similar.

**Cognitive fix:** Use strict, persistent color-coding: TOSL zones are always green-tinted. MACA zones (building + impervious hardscape) are always blue-tinted. USA (planted softscape) carries a texture overlay (crosshatch). These color assignments are repeated in the formula panel, the ground plane, the data card, and the quiz feedback — multi-channel reinforcement per dual-coding theory.

### Friction Point 4: Angular Plane Reduction (AMVB)
The AMVB calculation — `Initial AMVB = AMBF × BHL`, then minus volume above the angular plane originating from the center of the RROW — is systematically skipped by reviewers because it is conceptually invisible. There is no intuitive sense of what "angular plane from the RROW centerline" means in 3D.

**Cognitive fix:** Animate the angular plane as a visible slicing geometry. A translucent diagonal plane sweeps inward from the RROW center. Geometry above the cutting plane fades to red. A volumetric counter tracks `AMVB_initial` and decrements in real-time as the plane angle changes, landing on `AMVB_final`.

### Friction Point 5: Zoning Class → Table Lookup → Value Chain
Reviewers must traverse: zoning class → Table VIII.1 → PSO%, ISA%, USA% → computation chain. This four-step lookup is a working memory burden. A wrong zoning selection poisons all downstream values — a single-point-of-failure that is invisible until the final check.

**Cognitive fix:** The zoning selector is the first and most prominent input. On selection, Table VIII.1 values auto-populate with a reveal animation (values cascade in, not flash). The selected row of the table remains visible as a persistent reference card throughout computation, so the lookup value is always externalized.

### Friction Point 6: Firewall Provisions Affecting Setbacks (Section 704)
Firewall adjacency allows zero side/rear setbacks for qualifying occupancies — a conditional rule that contradicts the default setback table. Reviewers apply default setbacks universally and miss the firewall exception, undercalculating AMBF.

**Cognitive fix:** A firewall toggle in the input panel activates a visual mode where the relevant side/rear setback planes disappear from the 3D scene. The freed area animates to join the buildable envelope. This makes the code exception spatially tangible.

---

## 1.2 — Cognitive Load Management Protocol

| Layer | Strategy | Implementation |
|---|---|---|
| **Intrinsic load** | Segment computation into 8-step sequence | Step-locked progression in Lab mode; all steps in Sandbox mode |
| **Extraneous load** | Eliminate decorative geometry | Only code-meaningful surfaces render; no ambient clutter |
| **Germane load** | Force active recall at each step | In-canvas quiz checkpoint after AMBF resolution before proceeding |
| **Split-attention** | Co-locate formula and geometry | Equation panel docks directly adjacent to the canvas element it describes |
| **Redundancy** | Consistent color/label across all panels | TLA = Slate Blue. AMBF = Cobalt. ISA = Amber. USA = Trail Green. TOSL = dual-zone. Never deviate. |

---

## 1.3 — Dual-Mode Learning Architecture

Two operational modes govern all interaction states. These are not UI tabs — they are **root-level app states** that reconfigure every surface.

| Dimension | **Sandbox / Lab Mode** | **Mock Licensure Exam Mode** |
|---|---|---|
| **Purpose** | Spatial understanding, parametric exploration | ALE-calibrated performance testing |
| **Input access** | All parameters exposed | Given (locked), derived (hidden until revealed) |
| **Formula visibility** | Always visible with live values | Hidden; student must recall and solve |
| **3D feedback** | Immediate on every slider change | Deferred until "Submit Answer" |
| **Sound** | Ambient confirmation tones | Correct/incorrect sound gates |
| **Readiness score impact** | No scoring | Feeds Readiness Score computation |
| **AMBF display** | All three candidates visible | One correct answer revealed post-submission |

---

# 2. Interface Layout & Interaction Flow

## 2.1 — Master Screen Architecture

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  NAV BAR                                                                      │
│  [← 3D Lab]   "Development Controls — Rules VII & VIII"   [LAB | EXAM] Toggle │
│  ──────────────────────────────────────────────────────────────────────────── │
│                                                                                │
│  ┌────────────────────────────────────────┐  ┌─────────────────────────────┐ │
│  │                                        │  │  INPUT PANEL                │ │
│  │                                        │  │  ─────────────────────────  │ │
│  │                                        │  │  EYEBROW: Lot Parameters    │ │
│  │                                        │  │  Lot Width     [___] m      │ │
│  │         R3F CANVAS                     │  │  Lot Depth     [___] m      │ │
│  │         (3D Site + Building Envelope)  │  │  TLA:          ████ sqm     │ │
│  │                                        │  │  ─────────────────────────  │ │
│  │  [ORBIT] [TOP] [FRONT] [ISOMETRIC]     │  │  EYEBROW: Zoning            │ │
│  │                                        │  │  Zone Class  [▼ R-2     ]   │ │
│  │                                        │  │  PSO%:  60%  ISA%: 20%      │ │
│  │                                        │  │  USA%:  20%  ← Table VIII.1 │ │
│  │                                        │  │  ─────────────────────────  │ │
│  └────────────────────────────────────────┘  │  EYEBROW: RROW / Firewall   │ │
│                                               │  RROW Width    [___] m      │ │
│  ┌────────────────────────────────────────┐  │  Firewall      [ ] Active   │ │
│  │  CLOSURE EQUATION STRIP               │  │  ─────────────────────────  │ │
│  │  TLA = AMBF + ISA + USA              │  │  [▶ Compute Controls]       │ │
│  │  ████  = ████ + ████ + ████          │  └─────────────────────────────┘ │
│  │  (live values, color-coded by zone)   │                                   │
│  └────────────────────────────────────────┘  ┌─────────────────────────────┐ │
│                                               │  RESULTS PANEL              │ │
│  ┌────────────────────────────────────────┐  │  AMBF Three-Way Check       │ │
│  │  COMPLIANCE SCORECARD                 │  │  ┌──────────────────────┐   │ │
│  │  ● AMBF   14.4m × 10m = 144 sqm  ✓  │  │  │ Setback AMBF: 144m² │   │ │
│  │  ● TOSL   30% of TLA = 90 sqm    ✓  │  │  │ PSO AMBF:    150m²  │   │ │
│  │  ● ISA    20% of TLA = 60 sqm    ✓  │  │  │ TOSL AMBF:   161m²  │   │ │
│  │  ● USA    10% of TLA = 30 sqm    ✓  │  │  │ → BINDING: 144m²    │   │ │
│  │  ● MACA   204 sqm                ✓  │  │  └──────────────────────┘   │ │
│  └────────────────────────────────────────┘  │  BHL / AMVB               │ │
│                                               └─────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 2.2 — R3F Canvas Zone Breakdown

The 3D canvas renders **five spatially distinct geometry layers**, each mapped to a code concept:

```
LAYER 1  → Lot Ground Plane         color: #E8E4DB (raw earth)
LAYER 2  → Setback Exclusion Zones  color: #E74C3C at 15% opacity (red tint)
LAYER 3  → ISA Zone (impervious)    color: #F5A623 at 25% opacity (amber)
LAYER 4  → USA Zone (softscape)     color: #2ECC71 at 25% opacity (green, crosshatch tex)
LAYER 5  → AMBF Envelope Volume     color: #1E3A5F at 18% opacity (slate blue solid box)
           → Ghost candidates       (PSO-AMBF: amber ghost | TOSL-AMBF: grey ghost)
           → Angular Plane Slicer   (diagonal plane, red wireframe, sweeps from RROW center)
           → AMVB Residual Volume   (trimmed blue volume above angular plane = fades red)
```

**Camera presets** (triggered by toolbar buttons):
- **ORBIT**: free orbit, minPolarAngle: 0.1, maxPolarAngle: π/2, enablePan: false
- **TOP**: orthographic, looking straight down — best for area legibility
- **FRONT**: perspective, facing the RROW frontage — best for BHL/AMVB visualization
- **ISOMETRIC**: fixed isometric angle, shows full envelope composition

---

## 2.3 — Closure Equation Strip

The equation strip docked below the canvas is the **spatial memory anchor**:

```
┌──────────────────────────────────────────────────────────────────────────────┐
│   TLA          =   AMBF          +   ISA          +   USA                    │
│   [300 sqm]       [144 sqm]         [60 sqm]         [30 sqm]               │
│   ██████████      ████████░░░░       ████░░░░░░░░     ████░░░░░░░░░░░        │
│   (full width)    (proportional fill relative to TLA)                        │
│                                                                               │
│   Also:  TLA = MACA + USA  →  [204 sqm] + [30 sqm] = 300 sqm ✓             │
│          MACA = AMBF + ISA →  [144 sqm] + [60 sqm] = 204 sqm ✓             │
└──────────────────────────────────────────────────────────────────────────────┘
```

- Each term is **color-coded** to its ground plane tile in the 3D scene
- Progress bars are proportional to TLA (not to max width) — they are the equation made visual
- On hover/tap of any term: the corresponding 3D geometry highlights with a rim glow
- When values violate closure: the equation strip turns red with an inequality indicator `≠`

---

## 2.4 — AMBF Three-Way Check Panel (Core Interaction)

This panel is the pedagogical center of the module:

```
┌──────────────────────────────────────────────────────┐
│  EYEBROW: AMBF Three-Way Check (Sec. 704.4)          │
│  ──────────────────────────────────────────────────  │
│                                                        │
│  Method 1: Setback-Based                             │
│  Buildable W: (10 - 1.5 - 1.5) = 7m                 │
│  Buildable D: (30 - 4.5 - 2.0) = 23.5m              │
│  → AMBF_setback = 7 × 23.5 = 164.5 m²               │
│                                                        │
│  Method 2: PSO-Based                                 │
│  PSO% = 70%  (R-2 zone, Table VIII.1)                │
│  → AMBF_PSO = 0.70 × 300 = 210 m²                   │
│                                                        │
│  Method 3: TOSL-Based                               │
│  TOSL% = 30% → (1 - 0.30) × 300 = 210 m²           │
│  → AMBF_TOSL = 210 m²                               │
│                                                        │
│  ┌────────────────────────────────────────────────┐  │
│  │  BINDING CONSTRAINT → METHOD 1: 164.5 m²      │  │
│  │  ████████████████ (most restrictive = governs) │  │
│  └────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘
```

In the 3D canvas, this panel's state drives:
- `AMBF_setback` → cobalt-blue solid envelope
- `AMBF_PSO` → amber ghost envelope (larger than setback-based = non-binding)
- `AMBF_TOSL` → grey ghost envelope
- The cobalt envelope has visible `Edges` component (white wireframe outline)
- The ghost envelopes use `meshStandardMaterial` with `transparent: true, opacity: 0.06`

---

## 2.5 — Mock Licensure Exam Mode Flow

```
ENTER EXAM MODE
     │
     ▼
[Screen: Problem Set Card]
  "Given: Lot 10m × 30m, Zone R-2, RROW = 6m"
  "What is the maximum allowable building footprint (AMBF)?"
     │
     ▼
[3D Canvas — LOT RENDERED, ENVELOPE HIDDEN]
  Student sees: lot ground, RROW indicator, setback overlay visible
  Student does NOT see: AMBF envelope, ghost candidates, results panel
     │
     ▼
[Answer Input — inline below canvas]
  "Enter your computed AMBF: [______] sqm"
  [Submit Answer]  ← Primary button
     │
     ├── CORRECT ──────────────────────────────────────────────────────►
     │   SOUND: soft ascending chime (220Hz → 330Hz → 440Hz, 180ms)
     │   3D: AMBF envelope animates INTO scene from below (Y: -BHL → 0)
     │   Panel: Three-way check reveals with "✓ Binding: Setback Method"
     │   Score: +1 point to Readiness Score (Development Controls node)
     │   Toast: "Correct. Setback method governs at 164.5 m²"
     │
     └── INCORRECT ─────────────────────────────────────────────────────►
         SOUND: low dull thud (150Hz, 80ms, -18dB) — not harsh, corrective
         3D: Correct envelope appears, wrong-zone area flashes red briefly
         Panel: Step-by-step derivation reveals, wrong step highlighted in amber
         Toast: "Review: PSO method gives 210m² but setback governs at 164.5m²"
         Score: node records miss → amber flag on Development Controls heatmap node
```

---

## 2.6 — Sound Design Specification

| Trigger | Sound Profile | Technical Spec |
|---|---|---|
| Correct answer (exam mode) | Ascending soft chime, non-celebratory | 220→330→440Hz, sine, 180ms, -12dB |
| Incorrect answer | Dull low thud | 150Hz, square wave, 80ms, -18dB |
| Slider drag (sandbox) | Subtle tick per 1% value change | 800Hz, 5ms, -24dB — confirms feedback loop |
| Three-way check — binding found | Soft "lock" click | 600Hz, 30ms — completion of analysis |
| Violation detected | Gentle triple pulse | 200Hz × 3, 60ms each, -16dB |
| Exam timer warning (final 60s) | Ambient low hum | 80Hz, sine, -30dB — tension, not panic |
| Mode toggle (LAB ↔ EXAM) | Mechanical switch sound | 400ms, stereo width, -14dB |

**Implementation:** Use the Web Audio API via a `useSoundEngine` hook. Sounds are synthesized (not imported audio files) to eliminate asset load cost. All sounds respect system mute. No sound plays in the first session until user opts in (Philippine student context: study in shared spaces).

---

## 2.7 — Mobile Adaptation (< 768px)

On mobile, the side panel collapses to a **draggable bottom sheet**:

```
┌──────────────────────────────────────┐
│  [← Lab]  Dev Controls  [LAB|EXAM]  │
├──────────────────────────────────────┤
│                                      │
│                                      │
│      R3F CANVAS (full width)         │  ← 60% viewport height
│                                      │
│  [ORBIT] [TOP] [ISO]                 │
│                                      │
├──────────────────────────────────────┤
│  ── (drag handle) ──────────────── │  ← Bottom sheet, 40% default
│  TLA = AMBF + ISA + USA            │
│  [300]  [144]  [60]  [30]   sqm    │
│                                      │
│  Lot Width [___]m  Depth [___]m     │
│  Zone: [▼ R-2]                      │
│                                      │
│  [Compute Controls]                  │
└──────────────────────────────────────┘
```

Bottom sheet drag states: 20% (peek — shows equation strip only) | 40% (default — inputs visible) | 85% (expanded — full results panel)

---

# 3. Technical Implementation Strategy

## 3.1 — Component Tree

```
app/
└── lab/
    └── development-controls/
        └── page.tsx                        ← Server Component (metadata, auth guard)
            └── <DevControlsLabClient />    ← 'use client' boundary

DevControlsLabClient
├── <LabModeToggle />                       ← LAB | EXAM state switch
├── <LabLayout>                             ← Responsive grid container
│   ├── <DevControlsCanvas />              ← R3F Canvas wrapper
│   │   └── <Canvas ...>
│   │       ├── <LabScene />               ← Scene root (lighting, env, camera)
│   │       │   ├── <LotGroundPlane />     ← TLA ground geometry
│   │       │   ├── <SetbackZones />       ← 4 setback exclusion planes
│   │       │   ├── <OpenSpaceZones />     ← ISA + USA ground tiles
│   │       │   ├── <AMBFEnvelope />       ← Binding AMBF volume (solid)
│   │       │   ├── <AMBFGhostCandidates/> ← PSO-AMBF + TOSL-AMBF ghosts
│   │       │   ├── <AngularPlane />       ← AMVB angular cut geometry
│   │       │   ├── <AMVBVolume />         ← Final trimmed volume
│   │       │   ├── <DimensionLines />     ← Width/depth/setback annotations
│   │       │   ├── <RROWIndicator />      ← RROW width + centerline marker
│   │       │   └── <FirewallMarkers />    ← Conditional (if firewallActive)
│   │       ├── <LabCamera />              ← OrbitControls + preset transitions
│   │       └── <LabLighting />            ← directionalLight + ambientLight
│   │
│   ├── <InputPanel />                     ← Lot + zoning inputs
│   │   ├── <LotDimensionsInput />
│   │   ├── <ZoningSelector />             ← Drives Table VIII.1 lookup
│   │   ├── <RROWInput />
│   │   └── <FirewallToggle />
│   │
│   ├── <ClosureEquationStrip />           ← TLA = AMBF + ISA + USA visual
│   │
│   ├── <AMBFThreeWayPanel />             ← Setback / PSO / TOSL candidates
│   │
│   └── <ComplianceScorecard />           ← Pass/fail per metric
│
└── [EXAM MODE OVERLAY]
    ├── <ExamProblemCard />               ← Problem statement
    ├── <ExamAnswerInput />               ← Numerical input + submit
    └── <ExamFeedbackReveal />            ← Post-submission explanation
```

---

## 3.2 — Zustand Store Schema

```typescript
// stores/useDevControlsStore.ts

import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

// ── Domain Types ───────────────────────────────────────────────────────────────

type ZoneClass =
  | 'R-1' | 'R-2' | 'R-3' | 'R-4' | 'R-5'
  | 'C-1' | 'C-2' | 'C-3'
  | 'I-1' | 'I-2' | 'I-3'
  | 'GI'

type LabMode = 'sandbox' | 'exam'

type CameraPreset = 'orbit' | 'top' | 'front' | 'isometric'

interface LotDimensions {
  width: number         // meters
  depth: number         // meters
  tla: number           // computed: width × depth
}

interface ZoningParameters {
  zoneClass: ZoneClass
  psoPercent: number    // from Table VIII.1 (0.0–1.0)
  isaPercent: number    // from Table VIII.1
  usaPercent: number    // from Table VIII.1
  bhl: number           // Building Height Limit (meters)
  far: number           // Floor Area Ratio
}

interface SetbackRequirements {
  front: number         // meters — from Table VIII.2 / VIII.3
  rear: number
  left: number
  right: number
}

interface AMBFCandidates {
  setbackBased: number  // (width - L - R) × (depth - F - Rr)
  psoBased: number      // psoPercent × tla
  toslBased: number     // (1 - toslPercent) × tla
  binding: number       // Math.min(setbackBased, psoBased, toslBased)
  bindingMethod: 'setback' | 'pso' | 'tosl'
}

interface SiteMetrics {
  ambf: number          // = AMBFCandidates.binding
  tosl: number          // = ISA area + USA area
  isa: number           // isaPercent × tla
  usa: number           // usaPercent × tla
  maca: number          // ambf + isa
  tgfa: number          // ambf × number of floors (when BHL known)
  amvbInitial: number   // ambf × bhl
  amvbFinal: number     // Initial minus volume above angular plane
  closureCheck: boolean // tla === (ambf + isa + usa) within floating-point tolerance
}

interface AngularPlaneState {
  rrowWidth: number     // meters
  rrowCenterX: number   // computed position in scene coordinates
  planeAngleDeg: number // angle of angular plane from horizontal
  slicedVolume: number  // volume above plane (subtracted from AMVB)
}

interface ExamState {
  currentProblem: ExamProblem | null
  userAnswer: number | null
  isSubmitted: boolean
  isCorrect: boolean | null
  revealStep: number    // 0 = hidden, 1 = binding, 2 = full derivation
}

interface ExamProblem {
  id: string
  givenLot: LotDimensions
  givenZone: ZoneClass
  givenRROW: number
  targetMetric: 'ambf' | 'tosl' | 'isa' | 'usa' | 'maca' | 'amvb'
  correctAnswer: number
  tolerance: number     // ±0.5 sqm default
  codeRef: string
  rationale: string
}

// ── Store ──────────────────────────────────────────────────────────────────────

interface DevControlsStore {
  // ─ Mode
  labMode: LabMode
  setLabMode: (mode: LabMode) => void

  // ─ Inputs
  lot: LotDimensions
  setLotWidth: (w: number) => void
  setLotDepth: (d: number) => void

  zoning: ZoningParameters
  setZoneClass: (z: ZoneClass) => void

  rrowWidth: number
  setRrowWidth: (w: number) => void

  firewallActive: boolean
  toggleFirewall: () => void

  // ─ Computed (derived in selectors, not stored)
  setbacks: SetbackRequirements
  ambfCandidates: AMBFCandidates
  siteMetrics: SiteMetrics
  angularPlane: AngularPlaneState

  // ─ 3D Scene State
  cameraPreset: CameraPreset
  setCameraPreset: (p: CameraPreset) => void
  activeHotspot: string | null
  setActiveHotspot: (id: string | null) => void
  highlightedMetric: keyof SiteMetrics | null
  setHighlightedMetric: (m: keyof SiteMetrics | null) => void

  // ─ Exam Mode
  exam: ExamState
  loadExamProblem: (p: ExamProblem) => void
  submitAnswer: (answer: number) => void
  advanceRevealStep: () => void
  resetExam: () => void

  // ─ Sound
  soundEnabled: boolean
  toggleSound: () => void
}

export const useDevControlsStore = create<DevControlsStore>()(
  subscribeWithSelector((set, get) => ({
    labMode: 'sandbox',
    setLabMode: (mode) => set({ labMode: mode }),

    lot: { width: 10, depth: 30, tla: 300 },
    setLotWidth: (w) => set(s => ({
      lot: { ...s.lot, width: w, tla: w * s.lot.depth }
    })),
    setLotDepth: (d) => set(s => ({
      lot: { ...s.lot, depth: d, tla: s.lot.width * d }
    })),

    // zoning default → R-2 from Table VIII.1
    zoning: {
      zoneClass: 'R-2',
      psoPercent: 0.70,
      isaPercent: 0.20,
      usaPercent: 0.10,
      bhl: 13,   // R-2 typical BHL
      far: 1.8,
    },
    setZoneClass: (z) => set({ zoning: TABLE_VIII_1[z] }),

    rrowWidth: 6,
    setRrowWidth: (w) => set({ rrowWidth: w }),

    firewallActive: false,
    toggleFirewall: () => set(s => ({ firewallActive: !s.firewallActive })),

    // Computed values — updated via subscribeWithSelector watchers
    setbacks: computeSetbacks({ width: 10, depth: 30, tla: 300 }, 'A', false),
    ambfCandidates: { setbackBased: 0, psoBased: 0, toslBased: 0, binding: 0, bindingMethod: 'setback' },
    siteMetrics: { ambf: 0, tosl: 0, isa: 0, usa: 0, maca: 0, tgfa: 0, amvbInitial: 0, amvbFinal: 0, closureCheck: false },
    angularPlane: { rrowWidth: 6, rrowCenterX: 0, planeAngleDeg: 45, slicedVolume: 0 },

    cameraPreset: 'isometric',
    setCameraPreset: (p) => set({ cameraPreset: p }),
    activeHotspot: null,
    setActiveHotspot: (id) => set({ activeHotspot: id }),
    highlightedMetric: null,
    setHighlightedMetric: (m) => set({ highlightedMetric: m }),

    exam: { currentProblem: null, userAnswer: null, isSubmitted: false, isCorrect: null, revealStep: 0 },
    loadExamProblem: (p) => set({ exam: { currentProblem: p, userAnswer: null, isSubmitted: false, isCorrect: null, revealStep: 0 } }),
    submitAnswer: (answer) => {
      const { exam } = get()
      if (!exam.currentProblem) return
      const isCorrect = Math.abs(answer - exam.currentProblem.correctAnswer) <= exam.currentProblem.tolerance
      set({ exam: { ...exam, userAnswer: answer, isSubmitted: true, isCorrect, revealStep: 1 } })
    },
    advanceRevealStep: () => set(s => ({ exam: { ...s.exam, revealStep: s.exam.revealStep + 1 } })),
    resetExam: () => set({ exam: { currentProblem: null, userAnswer: null, isSubmitted: false, isCorrect: null, revealStep: 0 } }),

    soundEnabled: false,
    toggleSound: () => set(s => ({ soundEnabled: !s.soundEnabled })),
  }))
)
```

---

## 3.3 — Pure Computation Engine (PD 1096-Canonical, No Side Effects)

```typescript
// lib/pd1096/computations.ts
// ══════════════════════════════════════════════════════════════════════════════
// PD 1096 IRR — Rule VII & VIII Canonical Computation Engine
// All formulas sourced strictly from the 2004 Revised IRR document.
// ══════════════════════════════════════════════════════════════════════════════

export const TABLE_VIII_1: Record<ZoneClass, ZoningParameters> = {
  'R-1': { zoneClass: 'R-1', psoPercent: 0.60, isaPercent: 0.20, usaPercent: 0.20, bhl: 10,  far: 1.2 },
  'R-2': { zoneClass: 'R-2', psoPercent: 0.70, isaPercent: 0.20, usaPercent: 0.10, bhl: 13,  far: 1.8 },
  'R-3': { zoneClass: 'R-3', psoPercent: 0.80, isaPercent: 0.10, usaPercent: 0.10, bhl: 21,  far: 3.0 },
  'C-1': { zoneClass: 'C-1', psoPercent: 0.80, isaPercent: 0.15, usaPercent: 0.05, bhl: 15,  far: 2.5 },
  'C-2': { zoneClass: 'C-2', psoPercent: 0.90, isaPercent: 0.07, usaPercent: 0.03, bhl: 45,  far: 4.0 },
  'C-3': { zoneClass: 'C-3', psoPercent: 0.90, isaPercent: 0.07, usaPercent: 0.03, bhl: 60,  far: 6.0 },
  // ... additional zones
}

/**
 * Compute setback requirements from Tables VIII.2 / VIII.3
 * Returns zero for firewall-adjacent sides when firewallActive = true
 */
export function computeSetbacks(
  lot: LotDimensions,
  occupancyGroup: string,
  firewallActive: boolean
): SetbackRequirements {
  const base = occupancyGroup.startsWith('A')
    ? { front: 4.5, rear: 2.0, left: 2.0, right: 2.0 }
    : occupancyGroup.startsWith('D') || occupancyGroup.startsWith('C')
    ? { front: 4.5, rear: 2.0, left: 2.0, right: 2.0 }
    : { front: 4.5, rear: 2.0, left: 2.0, right: 2.0 }

  // Section 704 — Firewall provision: firewall-adjacent side(s) = 0 setback
  return firewallActive
    ? { ...base, left: 0, right: 0 }
    : base
}

/**
 * AMBF Three-Way Check — Section 704.4
 * Returns all three candidates + binding result
 * Canonical: AMBF = min(AMBF_setback, AMBF_PSO, AMBF_TOSL)
 */
export function computeAMBFThreeWay(
  lot: LotDimensions,
  zoning: ZoningParameters,
  setbacks: SetbackRequirements
): AMBFCandidates {
  const buildableWidth = lot.width - setbacks.left - setbacks.right
  const buildableDepth = lot.depth - setbacks.front - setbacks.rear
  const setbackBased = Math.max(0, buildableWidth * buildableDepth)

  const psoBased = zoning.psoPercent * lot.tla

  const toslPercent = zoning.isaPercent + zoning.usaPercent
  const toslBased = (1 - toslPercent) * lot.tla

  const binding = Math.min(setbackBased, psoBased, toslBased)
  const bindingMethod =
    binding === setbackBased ? 'setback' :
    binding === psoBased ? 'pso' : 'tosl'

  return { setbackBased, psoBased, toslBased, binding, bindingMethod }
}

/**
 * Site Metrics — Section 803
 * Area Closure Identity: TLA = AMBF + ISA + USA (enforced here)
 */
export function computeSiteMetrics(
  lot: LotDimensions,
  zoning: ZoningParameters,
  ambf: number
): SiteMetrics {
  const isa = zoning.isaPercent * lot.tla
  const usa = zoning.usaPercent * lot.tla
  const tosl = isa + usa                          // TOSL = ISA + USA (Sec. 803)
  const maca = ambf + isa                         // MACA = PSO(area) + ISA (Sec. 803)
  const tgfa = ambf * Math.floor(zoning.bhl / 3) // approximate floor count
  const amvbInitial = ambf * zoning.bhl           // Step 1: footprint prism

  // Step 2: Angular plane reduction (RROW-center-origin)
  // Angular plane creates a triangular reduction from RROW center
  // Sliced volume approximated as (BHL² / (2 × tan(45°))) × frontage_width
  const angularSlice = (zoning.bhl ** 2 / 2) * lot.width  // simplified 45° plane
  const amvbFinal = Math.max(0, amvbInitial - angularSlice)

  // Closure check: TLA === AMBF + ISA + USA (within floating-point tolerance)
  const closureCheck = Math.abs(lot.tla - (ambf + isa + usa)) < 0.01

  return { ambf, tosl, isa, usa, maca, tgfa, amvbInitial, amvbFinal, closureCheck }
}

/**
 * Reactivity bridge — call in Zustand subscriber to recompute on lot/zone/rrow change
 */
export function recomputeAll(store: DevControlsStore): Partial<DevControlsStore> {
  const { lot, zoning, firewallActive } = store
  const setbacks = computeSetbacks(lot, 'A', firewallActive)
  const ambfCandidates = computeAMBFThreeWay(lot, zoning, setbacks)
  const siteMetrics = computeSiteMetrics(lot, zoning, ambfCandidates.binding)
  return { setbacks, ambfCandidates, siteMetrics }
}
```

---

## 3.4 — R3F Scene: AMBF Envelope Component

```typescript
// components/lab/AMBFEnvelope.tsx
'use client'

import { useRef, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Edges, Html } from '@react-three/drei'
import * as THREE from 'three'
import { useDevControlsStore } from '@/stores/useDevControlsStore'

export function AMBFEnvelope() {
  const meshRef = useRef<THREE.Mesh>(null)
  const invalidate = useThree(s => s.invalidate)

  const ambf = useDevControlsStore(s => s.ambfCandidates.binding)
  const setbacks = useDevControlsStore(s => s.setbacks)
  const lot = useDevControlsStore(s => s.lot)
  const bhl = useDevControlsStore(s => s.zoning.bhl)
  const highlighted = useDevControlsStore(s => s.highlightedMetric === 'ambf')
  const labMode = useDevControlsStore(s => s.labMode)
  const examRevealStep = useDevControlsStore(s => s.exam.revealStep)

  // In exam mode, hide until revealStep >= 1
  const isVisible = labMode === 'sandbox' || examRevealStep >= 1

  const buildableWidth = lot.width - setbacks.left - setbacks.right
  const buildableDepth = lot.depth - setbacks.front - setbacks.rear

  const posX = setbacks.left + buildableWidth / 2
  const posZ = setbacks.front + buildableDepth / 2

  // Opacity pulses when highlighted (from equation strip hover)
  useFrame((_, delta) => {
    if (!meshRef.current) return
    const mat = meshRef.current.material as THREE.MeshStandardMaterial
    if (highlighted) {
      mat.opacity = 0.18 + Math.sin(Date.now() * 0.005) * 0.06
      invalidate()
    } else {
      mat.opacity = THREE.MathUtils.lerp(mat.opacity, 0.18, delta * 5)
    }
  })

  if (!isVisible) return null

  return (
    <group>
      {/* Solid AMBF Volume */}
      <mesh
        ref={meshRef}
        position={[posX, bhl / 2, posZ]}
      >
        <boxGeometry args={[buildableWidth, bhl, buildableDepth]} />
        <meshStandardMaterial
          color="#1E3A5F"
          transparent
          opacity={0.18}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
        <Edges color="#FFFFFF" lineWidth={1.5} />
      </mesh>

      {/* Dimension annotation — top face center */}
      <Html position={[posX, bhl + 0.5, posZ]} center>
        <div className="bg-[#1E3A5F] text-white font-mono text-[10px] px-2 py-1 rounded shadow-lg">
          AMBF {ambf.toFixed(1)} m²
        </div>
      </Html>
    </group>
  )
}
```

---

## 3.5 — Performance Configuration

```typescript
// Canvas config — frameloop="demand" for energy/performance on mid-range Android
<Canvas
  frameloop="demand"                              // Render on invalidate only
  dpr={[1, 1.5]}                                 // Cap at 1.5x — PH device reality
  gl={{
    antialias: true,
    alpha: false,
    powerPreference: 'default',                  // Not 'high-performance' — thermal safety
    stencil: false,
    depth: true,
  }}
  camera={{ position: [15, 20, 25], fov: 45, near: 0.1, far: 500 }}
  performance={{ min: 0.5, max: 1, debounce: 200 }}
  onPointerMissed={() => useDevControlsStore.getState().setActiveHotspot(null)}
>
  <PerformanceMonitor
    onDecline={() => useDevControlsStore.getState().setDpr(1)}
    onIncline={() => useDevControlsStore.getState().setDpr(1.5)}
  />
```

**Geometry budget targets:**
- Lot ground + setback zones: `PlaneGeometry`, 4 vertices each — negligible
- AMBF envelope: `BoxGeometry(1,1,1)` — 1 draw call, geometry reused via `useMemo`
- Ghost candidates: same geometry, different material instances — 2 additional draw calls
- Angular plane: custom `BufferGeometry` from 4 vertices — 1 draw call
- Dimension lines: `Line` from drei — 1 draw call per line, max 8 lines = 8 calls
- **Total target: ≤ 20 draw calls in steady state**

All `Html` overlays from drei are DOM elements, not WebGL — they do not count toward draw calls but must be managed with `occlude` prop to cull when behind geometry.

---

## 3.6 — Readiness Score Integration

```typescript
// On correct exam answer → update Supabase mastery record
async function recordExamResult(
  userId: string,
  topicId: 'development-controls-ambf' | 'development-controls-pso' | 'development-controls-amvb',
  isCorrect: boolean
) {
  const { error } = await supabase
    .from('quiz_attempts')
    .insert({
      user_id: userId,
      topic_id: topicId,
      taxonomy_node: 'building-laws/pd1096/rule-viii',
      is_correct: isCorrect,
      difficulty: 3,                     // ALE-calibrated difficulty weight
      attempted_at: new Date().toISOString(),
    })

  // Trigger Readiness Score recalculation via Edge Function
  if (!error) {
    await supabase.functions.invoke('recalculate-readiness-score', {
      body: { user_id: userId, affected_node: 'building-laws/pd1096/rule-viii' }
    })
  }
}
```

The `building-laws/pd1096/rule-viii` heatmap node on the student's Taxonomy Map updates with the correct amber/green/red color after each exam interaction — closing the loop from 3D Lab interaction to Readiness Score change visibility.
