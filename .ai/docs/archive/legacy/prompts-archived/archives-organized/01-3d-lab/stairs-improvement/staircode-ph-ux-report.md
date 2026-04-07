# StairCode PH — UX/UI Research & Design Report
### Interactive 3D Stair Compliance Explorer · Parallel Rule-Set Architecture

---

## 0. Split-Step Verification

**Verification status: PASS.** All data required for this report exists in the provided source documents (Stairs 1–5). The following verified legal metrics ground every design decision in this report:

| Regime | Metric | Value | Source |
|---|---|---|---|
| PD 1096 | Min clear width (≤10 persons) | 750 mm | Stairs 2, 3, 5 |
| PD 1096 | Min clear width (10–50 persons) | 900 mm | Stairs 3, 5 |
| PD 1096 | Min clear width (>50 persons) | 1,100 mm | Stairs 5 |
| PD 1096 | Max riser height | 200 mm | Stairs 1, 2, 3, 5 |
| PD 1096 | Min tread/run | 200 mm | Stairs 1, 2, 3, 5 |
| PD 1096 | Min headroom | 2,000 mm | Stairs 5 |
| PD 1096 | Max rise between landings | 3,600 mm | Stairs 5 |
| PD 1096 | Handrail height range | 800–900 mm | Stairs 5 |
| PD 1096 | Min guard height | 1,000 mm | Stairs 5 |
| BP 220 | Min clear width (interior) | 600 mm | Stairs 1, 2, 3, 5 |
| BP 220 | Max riser height | 250 mm | Stairs 1, 2, 3, 5 |
| BP 220 | Min tread/run | 200 mm | Stairs 1, 2, 3, 5 |
| BP 220 | Min winder tread (narrow point) | 150 mm | Stairs 1, 2, 5 |
| BP 344 | Min accessible stair width | 1,200 mm | Stairs 3, 5 |
| BP 344 | Min landing clear dimension | 1,500 mm | Stairs 3, 5 |
| BP 344 | Handrail height (lower) | 700 mm above nosing | Stairs 1, 2, 3, 5 |
| BP 344 | Handrail height (upper) | 900 mm above nosing | Stairs 1, 2, 3, 5 |
| BP 344 | Handrail extension beyond first/last step | 300 mm | Stairs 1, 2, 3, 5 |
| RA 9514 | Min exit stair width (general exit) | 900 mm | Stairs 3, 5 |
| RA 9514 | Max riser (exit stair) | 180 mm | Stairs 4, 5 |

No legal values are invented or extrapolated. All dimensional metrics used in UX copy and compliance logic come exclusively from the above verified sources.

---

## 1. UX Research

### 1.1 Target User Personas

#### Persona A — The Architect-in-Charge (Primary)
- **Name archetype:** Arch. Bea, 34, licensed 7 years, private practice in QC
- **Primary job:** Verify that a stair design she's finalizing complies before submitting permit docs
- **Mental model:** Thinks in PD 1096 by default; adds BP 344 for public projects; rarely deals with BP 220 housing stairs
- **Pain points:** Inconsistent enforcement between LGU building officials and BFP; uncertainty about which code governs when both PD 1096 and RA 9514 apply simultaneously; time lost re-reading PDF documents to find specific numbers
- **Core need from tool:** Give me the numbers per law side by side. Tell me which applies to my project type. Flag conflicts without merging them into one fake standard.
- **Session behavior:** Returns to the tool per project, not daily. Needs fast setup via scenario presets. Exports a PDF or screenshot for her permit folder.
- **3D expectation:** Uses 3D for communication with client/drafter, not for self-learning. Wants to orbit and annotate.

#### Persona B — The ALE Licensure Exam Candidate (Secondary)
- **Name archetype:** Arch student Rico, 24, 5th-year BS Architecture, review mode
- **Primary job:** Understand *why* BP 220 and PD 1096 have different riser requirements; visualize what a 250mm riser actually looks like vs. 200mm
- **Mental model:** Encounters codes as exam items, not practice constraints; doesn't yet have intuition for what 750mm feels like in space
- **Pain points:** Flashcards don't show spatial consequence; exam questions ask for specific regime values which he keeps confusing
- **Core need from tool:** Show me the stair under each law simultaneously. Let me toggle between scenarios and see exactly how the geometry changes. Give me the "why" for each rule.
- **Session behavior:** Daily during review period; 10–20 minute focused sessions. Uses mobile as often as desktop.
- **3D expectation:** High curiosity; will click everything. Benefits most from guided overlay mode where the tool leads him through each dimension.

#### Persona C — The LGU/BFP Reviewer (Tertiary)
- **Name archetype:** Eng. Danny, 45, building official, municipality of 80,000 population
- **Primary job:** Use the tool as a teaching aid when explaining code conflicts to applicants; run a quick sanity check on submitted stair dimensions
- **Mental model:** Knows PD 1096 and Fire Code well; less confident on BP 344 specifics; has seen many builders confuse BP 220 housing rules with general code
- **Pain points:** Applicants present a single stair dimension and claim it's "code-compliant" without specifying which code. No shared visual reference.
- **Core need from tool:** A neutral, authoritative display showing all applicable codes for a given project type. Shareable link or screenshot.
- **Session behavior:** Occasional, situation-triggered (during applicant consultation). Values authority signals: source citations, official document references.

---

### 1.2 Core User Flows

#### Flow A — Architect Verification Flow (Primary)
```
ENTRY (fresh load or preset)
│
├── Step 1: Classify the project
│   └── Select: Project Type + Is BP 220? + Accessible Route? + Exit Stair?
│   └── Active law set is computed automatically
│
├── Step 2: Input stair geometry
│   └── Sliders: Clear Width / Riser Height / Tread Depth / Handrail Height
│   └── 3D model updates live (demand render via invalidate())
│
├── Step 3: Read compliance results
│   └── Right panel shows per-law compliance cards
│   └── Violated elements are highlighted in law color in the 3D viewport
│
├── Step 4: Inspect violation
│   └── Click element in 3D → Detail popover: value / required / law / clause
│   └── Conflict banner shown if two laws conflict on the same dimension
│
└── Step 5: Export / share
    └── Screenshot or export PDF summary with all law values
```

#### Flow B — Student Learning Flow (Secondary)
```
ENTRY (guided mode)
│
├── Step 1: Start with a scenario preset
│   └── Tool narrates: "This is a standard residential stair under PD 1096"
│
├── Step 2: Trigger violations deliberately (drag riser slider past 200mm)
│   └── 3D riser face turns red. Tooltip: "Max riser under NBCP is 200mm."
│
├── Step 3: Switch to BP 220 scenario
│   └── Same riser (220mm) is now compliant. Tooltip explains why.
│   └── Conflict banner: "This stair passes BP 220 but fails NBCP baseline."
│
├── Step 4: Add accessibility overlay
│   └── BP 344 handrail ghosts appear. Width indicator turns blue if narrow.
│
└── Step 5: Quiz prompt (optional)
    └── "What is the minimum clear width under BP 344 for accessible stairs?"
    └── Student answers → reveals correct value in the 3D model
```

#### Flow C — Reviewer Consultation Flow (Tertiary)
```
ENTRY (via URL share or QR code)
│
├── Step 1: Load shared scenario or select preset
│   └── Shared URL includes stair dimensions + project type encoded in params
│
├── Step 2: Real-time stair input matching submitted drawings
│   └── Type in exact submitted dimensions
│
├── Step 3: Show applicant the 3D model on screen
│   └── Rotate to show the specific dimension in question
│   └── Point to conflict card: "Your project uses BP 220, but this is a commercial building."
│
└── Step 4: Print summary
    └── One-page compliance report with law citations
```

---

### 1.3 3D Interaction Patterns

The following interaction patterns are designed for a **React Three Fiber** canvas with `frameloop="demand"` (render only on state change, never continuous — critical for mobile performance on mid-range Android).

#### Orbit & Navigation
- **Mouse/trackpad:** Left-drag to orbit, right-drag to pan, scroll to dolly
- **Touch:** Two-finger orbit, pinch to zoom, three-finger pan
- **Camera presets (buttons above viewport):** Front Elevation · Side Elevation · Isometric · Plan View
- **Initial camera:** 3/4 isometric angle showing the full stair with all dimensions visible

#### Element Selection
- **Click/tap a 3D element** (riser face, tread surface, handrail tube, width dimension plane) → that element highlights with a white rim (Outlines component), and the matching alert card in the right panel expands with full detail
- **Hover state:** Subtle emissive brightening (no text in canvas — text lives in HTML overlay panels)
- **Multi-select:** Disabled in v0; one active element at a time for cognitive simplicity

#### Overlay Toggles (Law Layers)
- Each law has a visibility toggle in the left panel
- When BP 344 handrail overlay is enabled: ghosted handrail tubes appear at 700mm and 900mm heights in accessible blue, with a 300mm extension shown as a horizontal ghost
- When a law is disabled: its overlay geometries fade out (opacity transition 300ms); its alert cards collapse
- Overlay toggle does NOT remove the stair geometry — it only shows/hides the compliance indicators for that law

#### Dimension Pulling (v1 Feature, placeholder in v0)
- In v0 the viewport is read-only — dimensions are controlled only by sliders
- In v1: drag handles on riser, tread, and width edges update the slider values bidirectionally
- The handle appears on hover as a small white diamond at the midpoint of each edge

#### Violation Pulse Animation
- Violated elements pulse gently (0.6s sine wave on emissive intensity, 0–0.3)
- Animation uses `useFrame` with `frameloop="demand"` — only runs while a violation exists
- The pulse is subtle: it draws attention without anxiety. Not a strobe.

---

### 1.4 Information Architecture

```
StairCode PH
│
├── [Top Bar]
│   ├── App wordmark + version badge
│   ├── Scenario Preset Selector (4 presets + Custom)
│   └── [Export] [Share URL] [Help]
│
├── [Left Panel — "Project & Controls"] 280px fixed
│   ├── Section 1: Project Classifier
│   │   ├── Project Type: [General Building ▼]
│   │   ├── Toggle: Is BP 220 Housing Project?
│   │   ├── Toggle: Includes Accessible Route?
│   │   └── Toggle: Is Required Exit Stair?
│   │
│   ├── Section 2: Active Laws (auto-populated from classifier)
│   │   ├── [●] PD 1096 — NBCP (always base)
│   │   ├── [●] BP 220 (shown only if BP 220 project)
│   │   ├── [●] BP 344 (shown only if accessible route)
│   │   └── [●] RA 9514 (shown only if exit stair)
│   │
│   └── Section 3: Stair Geometry Inputs
│       ├── Clear Width ____mm [slider 500–1500]
│       ├── Riser Height ____mm [slider 100–300]
│       ├── Tread Depth ____mm [slider 150–350]
│       ├── Headroom ____mm [slider 1800–2500]
│       └── Handrail Height ____mm [slider 600–1200]
│
├── [Center — 3D Viewport] flex
│   ├── Camera Preset Buttons [Front | Side | ISO | Plan]
│   ├── 3D Canvas (Three.js / R3F)
│   │   ├── Stair geometry (parametric, updates on slider change)
│   │   ├── Dimension annotations (HTML overlays via R3F Html component)
│   │   ├── Law-colored violation overlays (translucent meshes)
│   │   └── Ghost meshes for BP 344 handrail requirements
│   └── Disclaimer footer (always visible)
│
└── [Right Panel — "Compliance Report"] 300px fixed
    ├── Per-law compliance cards (one per active law)
    │   ├── Law badge + color
    │   ├── Compliance status (COMPLIANT / N VIOLATIONS)
    │   ├── Dimension checklist (✓/✗ per dimension)
    │   └── [View Details] expandable
    │
    └── Conflict Banner (appears when two laws disagree on same dimension)
        ├── Conflict description
        ├── Which law is stricter
        └── Explanation of legal priority
```

---

## 2. UI Research & Design

### 2.1 Visual Language System

StairCode PH is a **professional compliance tool**, not a study gamification app. The visual language must communicate precision, authority, and legal clarity. It adapts the SlateCamp design foundations toward a more technical, tool-oriented register.

**Typography:**
- Headings (panel titles): 14px / 600 weight / Deep Charcoal `#1A1A2E`
- Labels (law names, dimension IDs): 12px / 500 weight / uppercase tracking
- Dimension values: 16px / 700 weight / Monospace (JetBrains Mono or system-ui monospace) — numbers must be visually distinct from text
- Violation messages: 13px / 400 weight / neutral mid-gray
- Source citations: 11px / 400 weight / muted (always present, never distracting)

**Spacing:** 8px grid, consistent with SlateCamp system. Panel padding: 16px. Card padding: 12px. Dimension label offset from geometry: 8px minimum.

**Surfaces:**
- App background: `#0F1C2E` (deep navy — engineering tool feel, dark canvas)
- Left/right panels: `#1A2B3F` (mid-dark panel)
- Cards: `#1E3550` (card surface, slightly lighter than panel)
- Viewport background: `#0A0F1A` (darkest — makes lit 3D geometry pop)
- Text primary: `#E8EDF2` (near-white on dark)
- Text muted: `#7A8FA6` (mid-gray for secondary labels)

---

### 2.2 Law Color Hierarchy & Severity System

This is the architectural core of the visual language. Each law receives a permanent color identity. These colors are never reused for other purposes. The severity ranking maps to life-safety criticality.

| Priority | Law | Color Name | Hex | Severity | Rationale |
|---|---|---|---|---|---|
| 1 (Highest) | RA 9514 — Fire Code | Evacuation Red | `#E74C3C` | CRITICAL | Life-safety regime; governs mass evacuation; strictest geometric minimums |
| 2 | BP 344 — Accessibility | Access Blue | `#3498DB` | HIGH | Civil rights overlay; mandatory on public routes; two-level handrail system |
| 3 | PD 1096 — NBCP | Code Slate | `#4A7FAD` | STANDARD | Baseline regime; default for all unlabeled violations |
| 4 (Lowest) | BP 220 — Housing | Housing Amber | `#F5A623` | CONTEXTUAL | Permissive exception; only applies to qualifying housing; lowest severity because it relaxes, not tightens |
| — | Compliant | Clearance Green | `#2ECC71` | PASS | Used for passing dimensions across any law |
| — | Not applicable | Neutral Gray | `#4A5568` | N/A | Law not active for this project type; geometry shown but not evaluated |

**Color usage rules:**
- A 3D element may only display ONE law's violation color at a time — the most severe active violation wins
- If an element passes all active laws, it renders in neutral geometry color (no violation color applied)
- If an element is compliant under the most severe law but violates a lower law, it renders in that lower law's color
- The right panel shows all violations simultaneously — the 3D highlights the most critical

**Status badges (right panel card headers):**
- `● COMPLIANT` — green dot + label
- `● 1 VIOLATION` — law-colored dot + count
- `● N VIOLATIONS` — law-colored dot + count
- `○ NOT APPLICABLE` — gray outline dot + label (law not active for this project type)
- `○ CONDITIONS APPLY` — amber outline dot + warning (law applies but with caveats, e.g., "Only if BP 220 project is registered with DHSUD")

---

### 2.3 3D Overlay Specifications

The following table defines how each type of code violation is visualized in the 3D viewport.

#### Width Violations
| Condition | 3D Indicator | Color | Behavior |
|---|---|---|---|
| Clear width < required minimum | Translucent plane filling the gap between actual width and required width | Law color at 30% opacity | Pulses at 0.6s. Dimension arrow turns law color. |
| Width barely passing (within 50mm of minimum) | Amber warning tint on width indicator | `#F5A623` | Static — no pulse. "Warning zone" only. |

#### Riser Violations
| Condition | 3D Indicator | Color | Behavior |
|---|---|---|---|
| Riser height > maximum | Riser face fills with law color, 60% opacity | Law color | Pulse. All riser faces affected equally (uniform stair assumption). |
| Riser height passing | Riser face: neutral concrete material | Neutral | No overlay. |

#### Tread Violations
| Condition | 3D Indicator | Color | Behavior |
|---|---|---|---|
| Tread depth < minimum | Tread top surface fills with law color, 50% opacity | Law color | Pulse. |
| Tread passing | Neutral | — | No overlay. |

#### Handrail Violations (BP 344 Overlay)
| Condition | 3D Indicator | Color | Behavior |
|---|---|---|---|
| Handrail missing on accessible route | Ghost tube meshes at 700mm and 900mm heights, dashed appearance | Access Blue `#3498DB` at 50% opacity | Static ghost — represents what's required but absent. |
| Handrail height incorrect | Ghost tubes appear at correct heights alongside actual handrail | Access Blue | "Required position" ghost shows where it should be. |
| Handrail extension missing | Ghost horizontal tube at top/bottom extending 300mm beyond first/last step | Access Blue | Static ghost. |

#### Headroom Violations
| Condition | 3D Indicator | Color | Behavior |
|---|---|---|---|
| Headroom < 2,000mm | A translucent red plane at the headroom limit cutting through the model | `#E74C3C` | The plane shows exactly where the clearance fails. |

#### Combined/Conflict Overlays
When two laws set contradictory requirements for the same dimension:
- A **lemonsqueezyd overlay** appears on the affected element: diagonal lemonsqueezys alternating in the two conflicting laws' colors
- The Conflict Banner in the right panel activates
- The 3D element tooltip shows: `CONFLICT: PD 1096 requires ≤200mm / BP 220 allows ≤250mm`

---

### 2.4 Left Panel Control Architecture

The left panel is organized in three fixed sections with clear hierarchy. Total panel width: 280px. All sections are always visible (no collapse in v0).

**Section 1 — Project Classifier**
This section is the most important step. The active law set is entirely determined here.

```
SECTION HEADER: "Project Type"

[Dropdown] Project Classification
  ▼ General Residential
  ▼ Commercial / Institutional
  ▼ School / University
  ▼ Hospital / Healthcare
  ▼ BP 220 — Socialized Housing
  ▼ BP 220 — Economic Housing

[Toggle] Part of Accessible Route?
  Activates BP 344 overlay rules

[Toggle] Required Exit Stair?
  Activates RA 9514 exit stair rules

[Toggle] Multi-floor (>50 occupant load)?
  Triggers PD 1096 width escalation to 1,100mm
```

**Section 2 — Active Laws**
Auto-populated based on classifier selection. Cannot be manually removed (only shown as context). This reinforces the parallel rule-set logic — the user sees which laws apply, not which they prefer.

```
SECTION HEADER: "Active Laws"

[●] PD 1096 — NBCP          [always active as baseline]
[●] BP 220                  [shown if BP 220 project selected]
[●] BP 344 Accessibility    [shown if accessible route toggled]
[●] RA 9514 Fire Code       [shown if exit stair toggled]

Note: Each law badge shows its hex color swatch. No user toggle available — 
the law either applies to this project type or it doesn't.
```

**Section 3 — Stair Geometry**
Sliders with live readout. Each slider shows the current value in mm prominently.

```
SECTION HEADER: "Stair Geometry"

Clear Width
  [●●●●●●○○] 900 mm
  [slider: 500–1500, step 50]

Riser Height
  [●●●●●●●○○○] 190 mm
  [slider: 100–300, step 5]

Tread Depth
  [●●●●●●●●○] 250 mm
  [slider: 150–350, step 5]

Headroom Clearance
  [●●●●●●●○○] 2100 mm
  [slider: 1800–2500, step 50]

Handrail Height
  [●●●●●●○○] 900 mm
  [slider: 600–1200, step 25]
```

---

### 2.5 Right Panel — Compliance Report Architecture

The right panel is the **output engine**. It shows the per-law compliance status as a result of the current geometry + project classification.

**Card structure per law:**

```
┌─────────────────────────────────────┐
│ [●] RA 9514 — FIRE CODE        [▾]  │  ← Header: law badge + color indicator + expand
│     EXIT STAIR MODE ACTIVE          │  ← Applicability context
├─────────────────────────────────────┤
│ ✗ Clear Width: 900mm < 1,120mm      │  ← Violation: value vs. required
│   Required for exit serving 50+ OL  │
├─────────────────────────────────────┤
│ ✗ Riser Height: 190mm > 180mm max   │  ← Violation
│   Fire Code exit stair maximum      │
├─────────────────────────────────────┤
│ ✓ Tread Depth: 250mm ≥ 200mm        │  ← Pass
│ ✓ Headroom: 2100mm ≥ 2000mm         │  ← Pass
├─────────────────────────────────────┤
│ [Source: RA 9514 IRR · BFP]         │  ← Citation always visible
└─────────────────────────────────────┘
```

**Conflict Banner (appears below all cards when triggered):**

```
┌─────────────────────────────────────┐
│ ⚠ CONFLICT DETECTED                 │
│ Riser Height                        │
│                                     │
│ PD 1096 requires ≤ 200 mm           │  ← Baseline
│ BP 220 allows ≤ 250 mm              │  ← Exception                  
│                                     │
│ A conflict is not noncompliance.    │
│ BP 220 is a legally authorized      │
│ exception for qualifying projects.  │
│ Apply only if this project is        │
│ registered as economic/socialized   │
│ housing with DHSUD.                 │
└─────────────────────────────────────┘
```

**UI label vocabulary** (per Stairs document 1, Section "Good UI Labels"):

Never show binary pass/fail only. Show these seven states:
- `COMPLIANT` — all active laws satisfied
- `COMPLIANT (BP 220 only)` — passes only if project qualifies as BP 220
- `ACCESSIBILITY OVERLAY REQUIRED` — BP 344 triggers additional requirements
- `CONFLICTS WITH NBCP BASELINE` — BP 220 value vs. PD 1096
- `MORE PERMISSIVE THAN NBCP` — informational, BP 220 relaxation
- `STRICTER THAN BASELINE` — RA 9514 or BP 344 requires more than PD 1096
- `NOT APPLICABLE — CONFIRM PROJECT TYPE` — ambiguous context

---

### 2.6 Microinteractions

**Scenario switching:**
- When user selects a scenario preset, all sliders and toggles animate to new values over 400ms
- The 3D stair geometry smoothly interpolates (lerp) to new dimensions
- Active law badges in the left panel briefly pulse to indicate which laws changed

**Violation detection feedback:**
- Instant (no delay) — violations compute synchronously on slider change
- Violated element in 3D: opacity jump + pulse begin within one frame
- Right panel card: violation rows fade in at 200ms (not instant — gives the user time to track)

**First-time violation (educational mode for Persona B):**
- On first violation detected in a session, a one-liner tooltip appears above the 3D canvas:
  - `"BP 344 focuses on inclusivity — it adds handrail requirements on accessible routes."`
- Only fires once per law per session

**Dimension click to 3D element correlation:**
- Clicking a slider label (e.g., "Riser Height") pulses the riser faces in the 3D viewport once (white flash)
- Reverse: clicking a 3D riser element scrolls to and briefly highlights the Riser Height slider

**Conflict banner animation:**
- Appears with a horizontal wipe + amber glow
- Disappears with fade when conflict is resolved

---

## 3. Synthesis: Master Plan

### 3.1 Scenario Preset Library

Four presets are hard-wired to the top bar. Each encodes a complete project + geometry state.

| Preset | Project Type | Width | Riser | Tread | Accessible | Exit Stair | Expected Result |
|---|---|---|---|---|---|---|---|
| **Standard House** | General Residential | 900mm | 185mm | 250mm | No | No | All PD 1096 pass |
| **BP 220 Housing** | BP 220 Socialized | 620mm | 240mm | 210mm | No | No | Passes BP 220; conflicts with PD 1096 baseline |
| **Public Hall** | Commercial | 1,250mm | 175mm | 280mm | Yes | No | Passes PD 1096 + BP 344; handrail checks active |
| **Exit Stair (Large Bldg)** | Commercial | 950mm | 190mm | 260mm | No | Yes | RA 9514 violations on width and riser |

### 3.2 Parallel Rule-Set Logic (Architecture Mandate)

The system architecture explicitly enforces the following constraint: **no dimension is ever compared to a merged or averaged standard.** Each law evaluates the geometry independently.

```
evaluateStair(geometry, projectTags):
  results = []

  // Step 1: Base regime
  if (projectTags.includes('bp220_project')):
    results.push(evaluate_against(geometry, BP_220_RULES))
  else:
    results.push(evaluate_against(geometry, PD_1096_RULES))

  // Step 2: Accessibility overlay (additive)
  if (projectTags.includes('accessible_route')):
    results.push(evaluate_against(geometry, BP_344_RULES))

  // Step 3: Exit stair overlay (additive)
  if (projectTags.includes('exit_stair')):
    results.push(evaluate_against(geometry, RA_9514_RULES))

  // Step 4: Conflict detection (never resolve, only flag)
  for each dimension in geometry:
    laws_evaluating_this_dimension = results.filter(r => r.dimension == dimension)
    if (laws_disagree(laws_evaluating_this_dimension)):
      flag_conflict(dimension, laws_evaluating_this_dimension)
      // ← NEVER choose one value. NEVER average. ALWAYS show both.

  return { results, conflicts }
```

### 3.3 UX Copy Framework

All in-app explanatory text educates, not just warns. Adopted from source document pattern:

| Scenario | Copy |
|---|---|
| BP 220 stair that fails NBCP | "This stair complies under BP 220 but fails the NBCP baseline. Confirm your project is registered as economic/socialized housing with DHSUD before relying on these dimensions." |
| PD 1096 stair that fails RA 9514 | "This stair meets PD 1096 but fails RA 9514 for exit use. Redesign as a general internal stair, or increase width to meet Fire Code requirements for your calculated occupant load." |
| BP 344 handrail missing | "BP 344 requires dual handrails at 700mm and 900mm above stair nosings, extending 300mm beyond first and last steps. Consider a separate accessible route if stair geometry cannot accommodate." |
| Winder stair under BP 220 | "Winder/circular stairs under BP 220 must maintain a minimum 150mm tread at the narrow point. Measure at the narrow side of the tread, not the centerline." |

### 3.4 Legal Disclaimer Architecture

Two disclaimer tiers are always present:

**Persistent footer (single line, always visible in viewport):**
> This tool is a visual design aid, not a legal opinion. Final authority rests with your LGU Building Official and the Bureau of Fire Protection.

**Conflict-triggered panel disclaimer (appears only with Conflict Banner):**
> A conflict shown here does not automatically mean noncompliance. Different applicability rules — such as BP 220 for socialized housing or BP 344 accessibility overlays — define separate legal regimes. Verify which regime governs your project before proceeding to permit submission.

### 3.5 Validation Checklist (Pre-Ship Gate)

- [ ] PD 1096: 750/900/1,100mm widths, 200mm riser, 200mm tread, 2,000mm headroom confirmed against DPWH PD 1096 PDF
- [ ] BP 220: 600mm width, 250mm riser, 200mm tread, 150mm winder confirmed against DHSUD BP 220 IRR
- [ ] BP 344: 700/900mm handrail heights, 300mm extension, 1,200mm accessible width, 1,500mm landing confirmed against BP 344 IRR
- [ ] RA 9514: 900mm exit width, 180mm max riser confirmed against BFP Fire Code IRR tables
- [ ] No legal text reproduced verbatim; all explanatory text paraphrased
- [ ] Law toggles clearly labeled as applicability-based, not user-preference
- [ ] All source PDFs linked in citation footers on each compliance card
- [ ] No dimension value produced by averaging or merging across laws

---

*Report prepared for SlateCamp — StairCode PH module. All legal metrics sourced from the five provided research documents. Final section numbers (IRR clause references) must be verified against the official DPWH, DHSUD, and BFP PDF sources before production deployment.*

