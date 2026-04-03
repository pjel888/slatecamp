# PD 1096 Rules VII & VIII — Site Development Controls
## Comprehensive UX Implementation Plan

> **Skills synthesized:** slatecamp-ux-designer · slatecamp-ux-researcher · slatecamp-3d-interaction-designer · slatecamp-3d-information-designer · slatecamp-performance-gamification · arch-education-research · ale-topnotcher-strategy · ph-arch-construction-law

---

## Executive Brief

This document is the complete UX implementation plan for the PD 1096 Rules VII & VIII Site Development Controls module. The engineering spec has been written. This plan governs every decision about **what the student experiences** — what they see first, what they feel when they interact, what they remember afterward, and whether this module increases their probability of passing the ALE.

One governing principle drives every decision in this document:

> **A student who finishes this module should be able to compute AMBF, PSO, TOSL, ISA, and USA from raw lot data in under 90 seconds — and know exactly why each number exists.**

That outcome, and only that outcome, is the definition of success.

---

## Section 1: Learning Objective Framework

Before any UX decision is made, the module's learning objectives must be precisely defined. These objectives govern every subsequent design choice.

### Primary Learning Objective

> **After completing this module, the student can compute TGFA development control metrics (TLA, AMBF, PSO, TOSL, ISA, USA, MACA) for any lot configuration and identify which PD 1096 Rule VII or VIII provision governs each constraint.**

**Bloom's Taxonomy Level:** Level 3 — Apply (not Level 1/Remember, which is where most reviewers operate).

This is critical. The ALE does not ask "What does AMBF stand for?" It asks: "A 500 sqm lot in a C-1 zone has a 15m frontage. What is the allowable building footprint if the required front setback is 4.5m and side setbacks are 2.0m?" Students who only memorize the formula without spatial understanding consistently miscalculate.

### Key Values the Student Must Memorize From This Module

These five anchors are the primary retrieval targets. Every information design decision must reinforce these:

| Value | What It Is | PD 1096 Citation |
|---|---|---|
| `TLA = lot width × lot depth` | Total Lot Area — always the starting computation | IRR Rule VIII, Sec. 805 |
| `AMBF = min(buildable area, TLA × lot coverage %)` | Constrained by both setbacks AND zoning | IRR Rule VIII, Sec. 803 |
| `PSO = TLA − AMBF` | The open space obligation | IRR Rule VIII, Sec. 804 |
| `TOSL = ISA + USA = PSO` | Open space is divided, never lost | IRR Rule VIII, Sec. 806 |
| `TLA = AMBF + ISA + USA` | The identity that must always hold | IRR Rule VIII, Sec. 805 |

### ALE Question Types This Module Prepares

1. **Computation questions:** Given lot dimensions + zoning class, calculate AMBF, PSO, or TOSL.
2. **Identification questions:** Which metric does this provision govern?
3. **Application questions:** A designer proposes X. Does it violate Rule VII or VIII?
4. **Design problem (Area C):** The lot data is given. Compute your buildable envelope before drawing a single line.

The Area C connection is not incidental — it is the most important exam payoff. A student who internalizes this module's compute-before-design habit directly transfers it to Day 2 of the board exam.

### Module Success Criteria

- Student correctly answers 4/5 in-module quiz questions on first attempt without referencing the model
- Post-module, the student can reproduce the TLA identity formula (TLA = AMBF + ISA + USA) from memory
- Student can articulate the difference between ISA and USA in one sentence without looking at the screen
- Heatmap node for "Development Controls" moves from Red or Amber to Amber or Green after module completion

---

## Section 2: User Research Foundation

### Persona Mapping for This Module

Not all four SlateCamp personas engage with development controls equally. The research implications for each:

#### Persona 1: The Anxious First-Taker
**Engagement probability with this module:** High — development controls appear in nearly every Area C brief and in multiple Area A/B multiple-choice items. First-takers who attended review centers have seen this content but rarely understood it spatially.

**Key insight:** This persona has likely memorized the formula "AMBF = buildable width × buildable depth" but has never visualized what that means on an actual lot. The 3D sandbox is their first encounter with the geometry made concrete. **The module must feel like orientation, not review.**

**Design implication:** Progressive disclosure is essential for this persona. Do not show all seven metrics at once. Start with the lot itself. Add setbacks. Add the buildable zone. Build comprehension layer by layer.

#### Persona 2: The Retaker
**Engagement probability with this module:** Very high — retakers who failed often misapplied AMBF in Area C by forgetting the zoning cap or applying the wrong setback group. They come with a specific pain point and will engage deeply if the module surfaces the nuance they missed.

**Key insight:** The retaker knows the surface formula. What they need is the edge case — what happens when the setback-constrained AMBF is smaller than the zoning-allowed AMBF? The `min()` constraint is where they consistently err.

**Design implication:** The module must explicitly demonstrate the `min(setback-limited, zoning-limited)` constraint through a slider interaction. This is the "aha" moment for retakers. Design for it deliberately.

#### Persona 3: The Working Professional Returner
**Engagement probability with this module:** High for a different reason — this persona has actually applied for building permits and has encountered these terms in practice. The module contextualizes what they've seen on site. They will complete it quickly and benefit from the quiz to confirm they've internalized the correct ALE application (which may differ from loose site practice).

**Design implication:** Don't over-explain the conceptual foundation for this persona. Give them the module, let them explore, let the quiz confirm or correct. Time-efficient by design.

### Pre-Launch Research Assumptions to Validate

These are the assumptions built into the current engineering spec that have UX risk. Each must be monitored post-launch:

| Assumption | Risk Level | How to Validate |
|---|---|---|
| Students understand the concept of "setback" before entering this module | Medium | Add a one-screen pre-training card (see Section 4) |
| The 300 sqm default lot is sufficiently representative for first-run orientation | Low | Track if users immediately change lot dimensions vs. explore first |
| The compliance scorecard is self-explanatory without a legend | High | Conduct a 5-person moderated usability test before ship; use think-aloud |
| Students will click on the 3D zones to activate hotspots | Medium | Add a subtle "tap to explore" tooltip on first load |
| Mobile users will find the bottom sheet controls intuitive | High | Test specifically on Android (Realme/Samsung A-series) before ship |

### Behavioral Data to Track Post-Launch

These signals tell us if the module is working or broken:

| Signal | Interpretation | Response |
|---|---|---|
| Module opened but closed within 30 seconds | Controls panel or 3D scene is confusing on load | Usability test the first-run experience |
| High quiz attempts but low correct rate | Content isn't landing — comprehension gap | Revisit hotspot content, add pre-training |
| Students don't manipulate sliders | Parametric interaction isn't being discovered | Add interactive onboarding prompt |
| Students change only lot dimensions, not occupancy group | May not understand how occupancy affects setbacks | Emphasize occupancy selector in controls label |
| Module completion rate drops on mobile | Bottom sheet or 3D controls are unusable on small screens | Mobile-specific usability test |
| Quiz score feeds correctly to heatmap node | N/A — this must work on Day 1 | Instrument and confirm before ship |

### Post-Launch Survey (Trigger: 24 hrs after first completion)

One in-app survey question, surfaced once:

> "Did this 3D module help you understand development controls better than reading about them?"  
> `[Yes, much clearer] [Somewhat] [Not really] [I was already comfortable with this topic]`

Follow-on (if "Not really"): "What would have made it more useful?" (open-ended)

This single data point drives the first iteration cycle.

---

## Section 3: Educational Design Framework

### Dual Coding Application

This module is a textbook dual coding case: every formula (verbal) is simultaneously represented as 3D geometry (visual-spatial). The design must preserve and amplify this dual encoding.

**Concrete dual coding pairs to enforce:**

| Verbal (Text) | Visual-Spatial (3D) | Must Appear Together? |
|---|---|---|
| `TLA = lot width × lot depth` | The grey LotPlane filling the full lot footprint | Yes — TLA hotspot must show the formula |
| `AMBF = buildableW × buildableD` | The building volume box in its constrained zone | Yes — AMBF hotspot shows the computation live |
| `PSO = TLA − AMBF` | The colored open-space zones flanking the building | Yes — PSO label must visualize as area |
| `TOSL = ISA + USA` | Two distinct colored planes (cement + green) | Yes — clicking either must reveal the parent TOSL relationship |
| `Setback = required margin` | Red-tinted void between lot edge and building | Yes — setback annotation must show the code-required distance |

**Anti-pattern to avoid:** If the formula lives only in the side panel and not spatially anchored to the geometry, the dual encoding breaks. Every number must be visible both as text and as a proportional 3D element.

### Mayer's Multimedia Principles — Compliance Audit

Evaluate the engineering spec against all 12 Mayer principles before ship:

| Principle | Status in Current Spec | Design Action |
|---|---|---|
| Coherence (remove extraneous) | ⚠️ Risk | Remove any decorative 3D elements. The ContactShadows are fine — they ground the model spatially. The Environment preset must not distract. |
| Signaling (highlight key elements) | ✅ Good | Zone hotspots + active zone opacity dimming does this correctly. |
| Redundancy (don't duplicate text verbatim) | ⚠️ Risk | The side panel must NOT repeat what a hotspot already says. Hotspot = explanation. Panel = controls and scorecard only. |
| Spatial Contiguity (labels near elements) | ✅ Good | Html hotspots are anchored to geometry position. Maintain this. |
| Temporal Contiguity | N/A for this module (no animation narration) | — |
| Segmenting (student controls pacing) | ✅ Good | No auto-advance. Student drives all exploration. |
| Pre-Training | ❌ Missing | **Add a pre-training card.** Student must know what "setback" and "lot coverage" mean before the model loads. Design specified in Section 4. |
| Modality | Acceptable | Text panel is fine here. Optional future improvement: audio narration for guided tour. |
| Multimedia | ✅ Core value | This is the module's entire premise. |
| Personalization | ⚠️ Risk | Hotspot descriptions currently use formal code language. **Rewrite all hotspot content to conversational tone.** See Section 6. |
| Voice | Future improvement | Text voice is fine for v1. |
| Embodiment | N/A | — |

**Priority actions from this audit:** (1) Add pre-training card. (2) Rewrite hotspot content to conversational voice. (3) Ensure panel never duplicates hotspot content.

### Interactivity Level Assessment

This module targets **Level 3 — Interactive** (Moreno & Mayer, 2007), the highest level, where students manipulate parameters and receive immediate, specific, corrective feedback. This is the correct target for a code-application module.

**The feedback loop that makes this Level 3:**
```
Student moves slider → Geometry changes immediately → Scorecard updates → 
Violation overlay activates if non-compliant → Student sees the consequence → 
Student learns the constraint
```

This must work with zero perceptible lag. If the geometry update takes more than ~200ms after a slider change, the causal connection between action and feedback breaks. The `frameloop="demand"` approach in the engineering spec is correct — but the Zustand store update → geometry regeneration → canvas re-render pipeline must be profiled on a mid-range Android device before ship.

---

## Section 4: UX Design Specification

### Screen Architecture

```
SiteControlsPage
├── LabPageHeader                          ← Breadcrumb + module identity
│   ├── Back button → /3d-lab
│   ├── Title: "Site Development Controls"
│   ├── Badge: "PD 1096 Rules VII & VIII"
│   └── Action row: [View Mode] [Dimensions] [Reset]
├── PreTrainingCard (first-time only)      ← NEW — see spec below
├── SiteControlsModule
│   ├── PD1096Canvas (65% width, desktop)
│   └── ControlsSidebar (35% width, desktop)
│       ├── SiteControlsControls
│       └── ComplianceScorecard
└── ModuleFooter
    ├── "Test yourself on AMBF computations →"   ← Quiz link
    ├── "Read the Wiki article →"                 ← Wiki deep link
    └── [Try Design Challenge Mode]               ← Gamification entry
```

### Pre-Training Card (First-Run Only)

The pre-training card appears on first module load, above the 3D canvas. It is a single card, dismissible, that ensures students have the mental vocabulary they need before they encounter the model.

**Content:**
```
┌─────────────────────────────────────────────────────────────────┐
│  EYEBROW: Before You Explore                                     │
│                                                                  │
│  H3: Three terms to know before you start                        │
│                                                                  │
│  [Icon] Setback                                                  │
│  Body: The minimum distance your building must stay from the     │
│  lot boundary. Governed by occupancy type and lot area.          │
│                                                                  │
│  [Icon] Lot Coverage                                             │
│  Body: The percentage of your lot that can be covered by the     │
│  building footprint. Set by your zoning class (R-1, C-1, etc.)  │
│                                                                  │
│  [Icon] Open Space Obligation                                    │
│  Body: Whatever is NOT under the building must serve as open     │
│  space — either paved (ISA) or landscaped (USA).                │
│                                                                  │
│  [Dismiss: Got it — show me the model]  ← Primary button        │
│  [I already know these terms — skip]    ← Tertiary text link    │
└─────────────────────────────────────────────────────────────────┘
```

**Design rules:**
- Show only on first visit (localStorage flag — `pd1096_pretraining_dismissed: true`)
- Do not show if the student has completed a related quiz in the past 30 days (they have context)
- The "skip" option must be visible — no forced reading
- Do not block the 3D canvas on mobile — the card appears above the fold, canvas below

### Desktop Layout (≥1024px)

```
┌───────────────────────────────────────────────────────────────────┐
│ ← 3D Lab    Site Development Controls          [PD 1096 Rules VII & VIII] │
├───────────────────────────────────────────────────────────────────┤
│                                    │ PARAMETERS                   │
│                                    │                              │
│                                    │ Lot Width    [====○=====] 15m│
│                                    │ Lot Depth    [=====○====] 20m│
│                                    │ Bldg Height  [=○=========] 6m│
│                                    │                              │
│         PD1096Canvas               │ Occupancy Group   [Group A ▾]│
│         (3D scene)                 │ Zoning Class          [R-1 ▾]│
│                                    │                              │
│                                    │ ─────────────────────────── │
│                                    │                              │
│                                    │ COMPLIANCE CHECK             │
│                                    │ 4/5 requirements met         │
│                                    │ [●] AMBF 148.5 sqm   PASS   │
│                                    │ [●] TOSL 151.5 sqm   PASS   │
│                                    │ ...                          │
├───────────────────────────────────────────────────────────────────┤
│ [Test yourself →]  [Read Wiki →]  [⚡ Design Challenge]           │
└───────────────────────────────────────────────────────────────────┘
```

**View mode toggle** (top right of canvas):
- `[Perspective]` — default, 3/4 view from above-corner
- `[Plan View]` — true top-down, OrbitControls disabled, zones visible as flat areas
- `[Dimensions]` — overlays DimensionLines component

Switching between modes must animate the camera with a 400ms lerp transition, not a hard cut. Hard cuts disorient the student's spatial understanding.

### Mobile Layout (<768px)

```
┌─────────────────────────────┐
│ ← 3D Lab  Site Controls     │
├─────────────────────────────┤
│                             │
│                             │
│        PD1096Canvas         │
│        (full width)         │
│                             │
│                             │
├─────────────────────────────┤
│ [Parameters ▾] [Compliance] │  ← Tab switcher for bottom sheet
│─────────────────────────────│
│ Lot Width  [====○=====] 15m │
│ Lot Depth  [=====○====] 20m │
│ ...                         │
└─────────────────────────────┘
```

**Mobile-specific rules:**
- Canvas is always full-width — never shrink it for controls
- Controls live in a **fixed-height bottom sheet** (40% of screen height by default, draggable up to 60%)
- Bottom sheet has two tabs: **Parameters** and **Compliance Check**
- The "Dimensions" toggle is hidden on mobile — DimensionLines are too small to read on a 6" screen; replace with the Compliance Scorecard as the primary feedback mechanism
- Hotspot tooltips must open in the **bottom sheet** on mobile, not as floating overlays — floating overlays overlap with finger position and are impossible to read

### Component Specifications

#### SiteControlsControls (2D Panel)

Sliders must use a custom SlateCamp slider component, not a native HTML range input. The custom slider provides:
- Code-bound markers: a visible tick at the minimum or maximum allowed value
- Real-time value display in monospace (DM Mono) to the right of the slider
- Violation state: when value exceeds code bounds, the value turns `#E63329` (Alert Red)
- Soft bounce animation: if the student drags past the code limit (e.g., building height exceeds BHL for their zoning class), the slider has a brief spring-back animation at the limit — tactile feedback that a constraint has been hit

```
Label row:
  EYEBROW: LOT WIDTH               15.0 m  ← value in DM Mono
  [━━━━━━━━━━━━●━━━━━━━━━━━━━━━━━━] 
                                            (slider, no violation)
  
  EYEBROW: LOT WIDTH               5.0 m  ← value in Alert Red
  [●━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━]        (violation — too small for setbacks)
  ⚠ Setbacks require at least 6m   ← Violation message below slider
```

#### ComplianceScorecard

The scorecard has two states: **all-pass** and **at-least-one-fail**.

**All-pass state** — this is the "green scorecard" win state the Design Challenge targets:
```
┌────────────────────────────────┐
│ COMPLIANCE CHECK               │
│                                │
│ All requirements met ✓         │  ← In Trail Green (#2ECC71)
│                                │
│ [●] AMBF 148.5 sqm · Rule VIII Sec. 803
│ [●] TOSL 151.5 sqm · Rule VIII Sec. 806
│ [●] TLA identity · Rule VIII Sec. 805
│ [●] Front setback 4.5m · Rule VII Sec. 704
│ [●] Rear setback 2.0m · Rule VII Sec. 704
│                                │
│ This configuration is          │
│ code-compliant.                │
└────────────────────────────────┘
```

**At-least-one-fail state:**
```
┌────────────────────────────────┐
│ COMPLIANCE CHECK               │
│                                │
│ 3/5 requirements met           │  ← Neutral tone, not alarm
│                                │
│ [●] AMBF 148.5 sqm · PASS     │  ← Green dot
│ [●] TOSL 151.5 sqm · PASS     │
│ [○] Building footprint · FAIL │  ← Red dot with provision
│    Footprint exceeds AMBF by   │
│    12.3 sqm                    │
│    See: Rule VIII Sec. 803    │
│ ...                            │
└────────────────────────────────┘
```

**Critical design rule:** Failure states must be informational, not alarming. The violation is data, not punishment. The scorecard is a checklist, not a report card. The visual weight of a fail state should never be higher than necessary to communicate "adjust this."

### State Specifications

Every screen must have defined states. The Site Controls module has four:

**Loading state:** Canvas shows a skeleton — a grey rectangle (the lot) with a lighter grey box (the building) and no controls. The controls panel shows skeleton loading bars. Duration should be imperceptible on WiFi; tolerable on mobile data (max 2 seconds for initial render, 0 for subsequent since all geometry is runtime BufferGeometry).

**First-run state:** Pre-training card visible. Canvas ready but dimmed behind the card. No interaction until card is dismissed.

**Active state:** Standard interaction. Canvas at full opacity. Controls functional. Hotspots visible on hover/click.

**Violation state:** One or more compliance items fail. ViolationOverlay active on the AMBF mesh. Scorecard shows fail items. Compliance count badge (3/5) visible in the header. Student can still interact — the violation is feedback, not a blocker.

**Design Challenge state:** Different header badge. Scenario text visible above controls. Scorecard acts as the win-condition indicator. No other visual changes — the same module, repurposed.

### Typography Application

All typography must follow the SlateCamp design system:

| Element | Size | Weight | Font | Color |
|---|---|---|---|---|
| Page title "Site Development Controls" | H1 / 28px | 700 | System | Deep Charcoal (#1A1A2E) |
| Badge "PD 1096 Rules VII & VIII" | Label / 12px | 500 | System | Slate Blue (#1E3A5F) on light bg |
| Eyebrow labels in controls ("LOT WIDTH") | 9px | 500 | DM Mono | Grey Fog (#9B9B9B) |
| Slider values | 14px | 500 | DM Mono | Foreground (or Alert Red on violation) |
| Scorecard count "4/5 requirements met" | 14px | 600 | System | Foreground |
| Scorecard item label | 12px | 500 | System | Foreground |
| Scorecard code reference | 10px | 400 | DM Mono | Grey Fog |
| Hotspot label (floating in 3D) | 10px | 500 | DM Mono | White on dark bg |

### Dark Mode Specification

SlateCamp students study late at night. This module must ship with dark mode support.

Canvas background: change `#F2F0EB` → `#1A1A2E` (Deep Charcoal) in dark mode.

LotPlane color: `#E8E4DB` (light) → `#2A2A3E` (dark — elevated surface on dark bg).

AMBFVolume color: `#B8B4A8` (light) → `#4A5568` (dark — visible building mass).

ISA zone: `#C4BAA5` (light) → `#3A3A4E` (dark).

USA zone: `#7B9E6A` (light) → `#2D5A1B` (dark — keep the green semantic, reduce saturation).

Side panel: System dark mode background. All existing Tailwind dark mode classes apply.

**Implementation:** Use CSS variables in the canvas `style` prop. Check `useTheme()` from the theme provider and pass the appropriate palette. This is a single `useMemo` that re-runs when theme changes.

### Accessibility Requirements

- All interactive elements in the 2D panel have 44×44px minimum touch targets
- Color is never the sole indicator: violation state uses red color + warning icon + text message
- Scorecard pass/fail uses green/red color + ✓/○ symbols + "PASS"/"FAIL" text label
- Slider has proper `aria-label`, `aria-valuemin`, `aria-valuemax`, `aria-valuenow`
- Hotspot tooltips are `role="tooltip"` with `aria-describedby` linking to the trigger element
- Canvas itself is `aria-label="Interactive 3D site development model"` with `role="img"` for screen readers that cannot navigate 3D scenes

---

## Section 5: 3D Interaction Design Specification

### Interaction Type Classification

This module is a **Parametric Sandbox** — the highest-value 3D interaction type (Level 3: Interactive). The interaction contract is:

```
Slider drag → store update → geometry recompute → canvas re-render → scorecard update
          [student action]  [~0ms]              [<16ms on device]   [synchronous]
```

Every link in this chain must be fast enough to feel instantaneous. If geometry update lags by >200ms, the parametric learning loop breaks.

### Zone Click Interaction — Interaction States

The `activeZone` system has a clear interaction contract that must be consistently communicated:

**State: No zone active (default)**
- All zones at full opacity
- All hotspot dots visible, no tooltips open
- Click/tap anywhere on a zone → that zone becomes active

**State: One zone active (e.g., AMBF)**
- Active zone: full opacity, outline glow (Outlines component)
- Inactive zones: opacity 0.25 (dimmed but still spatially visible)
- Active zone's hotspot tooltip: open
- Click/tap on another zone → switches active zone
- Click/tap on empty space (Canvas `onPointerMissed`) → all zones deactivate
- This "close-on-miss" must be wired on both desktop and mobile

**State: Violation active**
- ViolationOverlay pulsing red on AMBF mesh
- Scorecard shows fail items
- Student can still click zones and manipulate sliders
- Violation state does not lock the interaction — it is feedback, not a blocker

### Zone Interaction Map

| User Action | Target Element | Result |
|---|---|---|
| Click/tap on LotPlane | Grey ground plane | Opens TLA hotspot (shows TLA formula + current area) |
| Click/tap on AMBFVolume | Building box | Opens AMBF hotspot (shows AMBF computation + setback constraint explanation) |
| Click/tap on ISA zone | Front paved plane | Opens ISA hotspot (ISA formula, current area, what ISA means) |
| Click/tap on USA zone | Rear green plane | Opens USA hotspot (USA formula, current area, landscaping definition) |
| Click/tap on SetbackZones | Red tinted margins | Opens setback hotspot (which rule governs this setback, current required distance) |
| Hover over AMBFVolume (desktop) | Building box | Shows Outlines glow, cursor: pointer |
| Drag slider | Any slider | All geometry updates; scorecard updates; active hotspot numeric values update |
| Toggle "Plan View" | View mode button | Camera animates to top-down, zones visible as 2D colored areas |
| Toggle "Dimensions" | Dimension button | DimensionLines appear/disappear |
| Click "Reset" | Reset button | Lot returns to 15×20m defaults, R-1 zoning, Group A |

### Camera Choreography

Three camera states with defined positions:

**Perspective (default):**
```typescript
position: [18, 12, 22]  // 3/4 view from front-right
fov: 45
lookAt: [7.5, 0, 10]   // Center of a 15×20m lot
```

**Plan View (top-down):**
```typescript
position: [0, 40, 0]   // Directly above
fov: 50
up: [0, 0, -1]         // North-up orientation
```

**Zone Focus (when a zone is activated):**
Each zone has a defined focus camera that positions the view to see the zone clearly without a hard cut:
```typescript
ambf:  { position: [12, 10, 15], lookAt: [6, 3, 10] }  // Building box centered
isa:   { position: [7.5, 8, -3], lookAt: [7.5, 0, 4] } // Front paved zone
usa:   { position: [7.5, 8, 23], lookAt: [7.5, 0, 18] } // Rear green zone
```

**Transition:** All camera moves use `useCameraTransition()` with `delta * 3` lerp speed. This produces a smooth ~400ms transition that maintains spatial orientation. Never instant-cut between views.

**OrbitControls constraints specific to this module:**
```typescript
minDistance: 5          // Can't zoom so close the lot fills the screen
maxDistance: 60         // Can zoom out to see lot in context
maxPolarAngle: Math.PI / 2  // Can't go below ground (looking up through the lot)
enablePan: false        // No panning — lot is always centered
```

### Mobile Touch Pattern

On mobile (< 768px), adjust the interaction model:

1. **Hotspot tooltips** → open as bottom sheet content, not floating overlays
2. **Zone activation** → single tap, same as desktop
3. **Orbit** → one-finger drag (OrbitControls default)
4. **Zoom** → two-finger pinch (OrbitControls default)
5. **Slider interaction** → in bottom sheet, full-width sliders with 44px height minimum
6. **No hover state** → remove cursor change and hover outlines (touch devices don't hover)

**Bottom sheet behavior on mobile:**
- Default height: 40% of viewport
- Draggable up to 60% (to see more controls)
- When a zone is tapped, bottom sheet switches to the "Compliance" tab and shows the hotspot content there
- Canvas remains interactive when bottom sheet is open (OrbitControls still work on the upper 60%)

### Violation Feedback UX

When the student's parameters produce a non-compliant state:

**Tier 1 — Mild violation (borderline):** Scorecard item turns red. ViolationOverlay activates on the affected geometry with 20% opacity pulse. No interruption to the interaction.

**Tier 2 — Severe violation (e.g., setbacks consume entire lot, buildable area = 0m²):** Scorecard shows 0/5. AMBF box disappears (height = 0). A gentle inline message appears below the scorecard: *"At this lot size, the required setbacks leave no buildable area. Increase lot dimensions."* No modal. No error dialog. Information only.

**Tier 3 — Math identity failure (floating point error):** Console error only. Never surface this to the student. The validation guard in `useSiteControls` handles this internally.

---

## Section 6: 3D Information Design Specification

### Progressive Disclosure Architecture

This module reveals information in four layers, never all at once:

**Layer 0: The Model (always visible, no labels)**
On load, the 3D model renders with no hotspots and no labels. For ~2 seconds, the student orients spatially: they see the lot, the building box, the green zone, the grey zone. Shape and proportion communicate before any text appears.

This 2-second delay is intentional. Do not skip it by loading hotspots instantly. Spatial comprehension requires a moment before verbal labels add cognitive load.

**Layer 1: Orientation Labels (appear after 2-second delay)**
Four persistent labels anchor the student's vocabulary:

| Label | Position | Content |
|---|---|---|
| "LOT" | Above lot plane center | Small floating tag: "LOT — TLA" |
| "BUILDING ZONE" | Above AMBF box | Small floating tag: "AMBF" |
| "PAVED OPEN SPACE" | Above ISA zone | Small floating tag: "ISA" |
| "LANDSCAPED OPEN SPACE" | Above USA zone | Small floating tag: "USA" |

These are always-visible, low-cognitive-load labels. Not interactive. Just nomenclature.

**Layer 2: Exploration Hotspots (appear on first orbit interaction)**
After the student first moves the camera (orbits, zooms, or taps a zone), the hotspot dots fade in. Maximum 5 hotspot dots visible at any time.

**Layer 3: Deep Knowledge (on hotspot click only)**
Full tooltip with formula, explanation, dimension callout, code citation, and quiz trigger.

### Hotspot Content — Complete Specification

All hotspot content is written to Mayer's Personalization Principle: conversational tone, second person, plain language before code language.

---

#### Hotspot 1: TLA — Total Lot Area

**Trigger position:** Center of LotPlane
**Category:** `info`
**Dot color:** `#6B7280` (Grey)

```
CATEGORY: INFO

Title: Total Lot Area (TLA)

Explanation: This is your starting point for every development control
calculation. It's the complete ground area of your lot — everything inside
the property boundaries.

Dimension callout:
  TLA = lot width × lot depth
  Default: 15.0m × 20.0m = 300.00 sqm

Code citation: PD 1096 IRR Rule VIII, Sec. 805

[Quiz: What is the TLA of a 12m × 25m lot? ▸]
[Read in Wiki: Development Controls →]
```

---

#### Hotspot 2: AMBF — Building Footprint

**Trigger position:** Top center of AMBFVolume
**Category:** `requirement`
**Dot color:** `#1B3FC4` (Cobalt)

```
CATEGORY: REQUIREMENT

Title: Allowable Maximum Building Footprint (AMBF)

Explanation: This is the maximum area your building's ground floor can
cover. It's constrained by TWO limits at the same time — both must be
satisfied. The smaller of the two wins.

Dimension callout (dynamic):
  Constrained by setbacks: {buildableWidth} × {buildableDepth} = {ambf_setback} sqm
  Constrained by zoning:   TLA × {lotCoveragePercent}% = {ambf_zoning} sqm
  Effective AMBF:          min({ambf_setback}, {ambf_zoning}) = {ambf} sqm

Code citation: PD 1096 IRR Rule VIII, Sec. 803

[Quiz: Which constraint is binding for the current configuration? ▸]
```

**Critical content note:** The "two constraints, take the minimum" logic is the most commonly misunderstood concept in this topic. The hotspot must explicitly surface it. This is where retakers lost points.

---

#### Hotspot 3: PSO — Percentage of Site Occupancy

**Trigger position:** Edge between AMBF and open space zones
**Category:** `requirement`
**Dot color:** `#1B3FC4` (Cobalt)

```
CATEGORY: REQUIREMENT

Title: Open Space Requirement (PSO)

Explanation: PSO isn't really a "percentage" — it's the actual area of open
space your lot must maintain. It's everything that's NOT your building
footprint. The name is historical; treat it as an area.

Dimension callout (dynamic):
  PSO = TLA − AMBF
  PSO = {tla} − {ambf} = {pso} sqm

Note: PSO and TOSL are the same area. PSO describes the requirement;
TOSL describes how that area is divided.

Code citation: PD 1096 IRR Rule VIII, Sec. 804
```

---

#### Hotspot 4: ISA — Impervious Surface Area

**Trigger position:** Center of ISA (paved) zone
**Category:** `info`
**Dot color:** `#6B7280` (Grey)

```
CATEGORY: INFO

Title: Impervious Surface Area (ISA)

Explanation: This is the paved portion of your required open space —
driveways, terraces, hard pathways. It lets water runoff happen (it
doesn't absorb). Usually 30% of TOSL for standard residential lots.

Dimension callout (dynamic):
  ISA = TOSL × {impervious_ratio}
  ISA = {tosl} × 30% = {isa} sqm

Code citation: PD 1096 IRR Rule VIII, Sec. 806

[Quiz: What surfaces count as ISA? ▸]
```

---

#### Hotspot 5: USA — Unpaved Surface Area

**Trigger position:** Center of USA (landscaped) zone
**Category:** `info`
**Dot color:** `#6B7280` (Grey)

```
CATEGORY: INFO

Title: Unpaved Surface Area (USA)

Explanation: This is the landscaped, soil-contact portion of your open
space — planted strips, lawns, garden beds. It absorbs water. Usually
70% of TOSL. Think: everything that can grow.

Dimension callout (dynamic):
  USA = TOSL × {pervious_ratio}
  USA = {tosl} × 70% = {usa} sqm

Identity check:
  TLA = AMBF + ISA + USA
  {tla} = {ambf} + {isa} + {usa} ✓

Code citation: PD 1096 IRR Rule VIII, Sec. 806
```

---

#### Hotspot 6: Setbacks

**Trigger position:** Midpoint of front setback zone
**Category:** `requirement`
**Dot color:** `#E63329` (Alert Red — setbacks constrain design)

```
CATEGORY: REQUIREMENT

Title: Required Setbacks (Rule VII)

Explanation: Setbacks are the minimum distances between your building and
each property line. They're not optional clearances — they're legally
required voids that reduce your buildable area.

Dimension callout (dynamic, Group A example):
  Front: {setbacks.front}m · Rear: {setbacks.rear}m
  Left: {setbacks.left}m · Right: {setbacks.right}m

  These values change when you switch Occupancy Group above.

Code citation: PD 1096 IRR Rule VII, Sec. 704–708
(Group A: lot ≤200sqm → F:2m, R:2m, S:1.5m each)
(Group A: lot >200sqm → F:4.5m, R:2m, S:2m each)

[Quiz: What is the front setback for a Group D (commercial) lot? ▸]
```

---

### In-Canvas Quiz Sequence — Full Specification

The module has five dynamic quiz questions. All are parametric — the correct answer changes based on the current slider state, making the quiz impossible to memorize in advance.

**Quiz placement strategy:** Strategy 3 (In-Situ Challenge) — questions are spatially anchored to the element they test. They appear after the student has orbited the model at least once (engagement gate) and are triggered by zone hotspot clicks.

---

**Quiz 1: TLA Computation**
*Triggered by:* Clicking the TLA hotspot
*Position:* Floating above lot plane center

```
Question (dynamic):
"With the current lot dimensions ({lotWidth}m × {lotDepth}m), what is the TLA?"

Choices:
A. {lotWidth * lotDepth} sqm  ← correct
B. {(lotWidth + 2) * lotDepth} sqm
C. {lotWidth * (lotDepth - 2)} sqm
D. {(lotWidth * lotDepth) / 2} sqm

Correct: A

Rationale: TLA = lot width × lot depth = {lotWidth} × {lotDepth} = {lotWidth * lotDepth} sqm.
This is always the first number you compute — everything else flows from it.
```

---

**Quiz 2: AMBF Constraint (Binding Limit)**
*Triggered by:* Clicking the AMBF hotspot
*Position:* Above building box

```
Question (dynamic):
"For the current configuration, which constraint limits the AMBF?"

[Compute both internally and surface the right answer]

Case A (setbacks bind — ambf_setback < ambf_zoning):
"The setback-limited area ({ambf_setback} sqm) is smaller than the
zoning limit ({ambf_zoning} sqm). Which constraint governs?"

Choices:
A. Setbacks (Rule VII)    ← correct
B. Lot coverage % (Rule VIII)
C. Both equally
D. Neither — AMBF is unrestricted

Rationale: You always take the MORE restrictive limit. Here, setbacks
leave only {ambf_setback} sqm buildable, while zoning would allow {ambf_zoning} sqm.
The setbacks are binding. This is the most commonly missed concept on the exam.
```

---

**Quiz 3: PSO Area Calculation**
*Triggered by:* Clicking either open-space zone (ISA or USA)
*Position:* Between the two open-space zones

```
Question (dynamic):
"The lot is {tla} sqm and the AMBF is {ambf} sqm. What is the PSO?"

Choices:
A. {pso} sqm               ← correct (TLA - AMBF)
B. {ambf} sqm              (common mistake: confusing AMBF and PSO)
C. {tla - ambf - isa} sqm  (partial calculation)
D. {tla * 0.4} sqm        (flat 40% guess)

Rationale: PSO = TLA − AMBF = {tla} − {ambf} = {pso} sqm.
This is the obligatory open space — neither ISA nor USA can reduce it
below this value.
```

---

**Quiz 4: ISA/USA Identification**
*Triggered by:* After completing Quiz 3
*Position:* Above ISA zone

```
Question (static — contextual):
"A concrete driveway occupying the front setback area belongs to which category?"

Choices:
A. ISA — Impervious Surface Area   ← correct
B. USA — Unpaved Surface Area
C. AMBF — it's under the building
D. PSO — open space without classification

Rationale: Driveways are paved and impervious — they don't absorb water.
They count as ISA. USA is reserved for soil-contact, plantable surfaces.
The difference matters for sustainable design questions in Area B.
```

---

**Quiz 5: TLA Identity Verification**
*Triggered by:* After Quiz 4, or when Scorecard shows all-pass
*Position:* Center of lot, floating at 2m height

```
Question (dynamic):
"With the current configuration, which equation holds true?"

[Show four options, all formatted like the identity]

A. {tla} = {ambf} + {isa} + {usa}    ← correct (the identity)
B. {tla} = {ambf} + {pso}            (also true — but not the full identity)
C. {ambf} = {isa} + {usa}            (false — AMBF and open space are separate)
D. {tla} = {tosl} × {lot_coverage}  (false — formula is wrong)

Rationale: TLA = AMBF + ISA + USA always holds. This is the fundamental
identity of site development controls. Memorize it. It appears on the exam
both directly and embedded in Area C computation problems.

Note: B is also true, but A is the complete, useful form.
```

---

### Cognitive Load Management

Maximum simultaneous information on-screen at any time:

| Information Type | Maximum | Current Spec Status |
|---|---|---|
| Orientation labels | 4 | ✅ Four labels (LOT, AMBF, ISA, USA) |
| Hotspot dots | 5 | ✅ Five hotspots defined |
| Open tooltips | 1 | ✅ activeZone pattern enforces this |
| Dimension lines | 4 | ✅ DimensionLines shows ~4 annotations |
| Scorecard items | 5 | ✅ Current scorecard has exactly 5 |
| Active quiz | 1 | ✅ Only one quiz at a time |
| Slider controls | 5 | ✅ Five sliders in the panel |

**The Load Test:** Squint at the fullest state (all dimension lines visible, one tooltip open, scorecard open). Can you tell what to look at? If not, reduce. The orientation labels must remain the most visually prominent text in the scene at all times.

---

## Section 7: Engagement Design — Design Challenge Mode

### The Win State This Module Builds Toward

The Compliance Scorecard showing "All requirements met ✓" is the module's intrinsic win state. No badges. No confetti. No points. A quiet, factual all-green scorecard is the most powerful reward SlateCamp can offer, because it means something: the configuration is actually code-compliant.

This is the core of SlateCamp's mastery gamification philosophy: the green scorecard IS the reward because it represents real knowledge, not performed engagement.

### Design Challenge Mode — Full Specification

Design Challenge Mode repurposes the exact same 3D module with a framing layer that makes the parametric sandbox into an active design problem.

**Entry point:** "Design Challenge" button in the module footer. Also accessible from quiz question bank items tagged `['AMBF', 'TOSL', 'Rule VIII']`.

**Challenge structure:**

The system selects a challenge from a seed bank. Three difficulty tiers:

**Tier 1 — Constrained Optimization (First-takers)**
> *"You have a 300 sqm lot in an R-2 zone. Maximize your AMBF without violating any Rule VII or VIII constraint. The required setbacks are: Front 4.5m, Rear 2.0m, Side 2.0m. What is the maximum achievable AMBF?"*

Module pre-loads: `lotWidth=15, lotDepth=20, zoningClass='R-2', occupancyGroup='A'`

Student goal: Make the Compliance Scorecard fully green while using the `buildingHeight` and zoning selectors to understand that AMBF is constrained by the lot — not something they can change by adjusting the building height.

Win condition: Scorecard all-pass + student identifies that effective AMBF = 148.5 sqm.

---

**Tier 2 — Zoning Comparison (Intermediate)**
> *"A commercial developer has a 400 sqm lot. Compare C-1 and C-2 zoning: which allows a larger AMBF? By how much?"*

Module pre-loads: `lotWidth=20, lotDepth=20, occupancyGroup='D'`

Student toggles between C-1 and C-2 in the zoning class selector and reads the AMBF from the Compliance Scorecard. The 3D building box visually expands or contracts with each zoning change.

Win condition: Student identifies the AMBF difference and records the correct values.

---

**Tier 3 — ALE Scenario (Advanced / Retakers)**
> *"Area C simulation: You are designing a community center on a 500 sqm lot in a mixed-use zone (MXD). The lot is 20m wide × 25m deep. Required front setback: 4.5m. Side setbacks: 2.0m. Rear setback: 3.0m. Occupancy is Group B (E-2). Compute AMBF, PSO, TOSL. What is the maximum footprint if the lot coverage limit is 70%?"*

Module pre-loads all dimensions. Student must read the computed values from the scorecard and record them without assistance. This exactly mirrors the Area C compute-before-design protocol.

Win condition: Student correctly records AMBF = min(setback-limited, zoning-limited) = correct value.

---

### Design Challenge UX Layer

When Design Challenge Mode is active, the module receives a lightweight framing overlay:

**Header changes:**
- Module badge changes from "PD 1096 Rules VII & VIII" → "⚡ Design Challenge"
- A scenario brief appears below the header in a collapsible card

**Scenario brief card:**
```
┌─────────────────────────────────────────────────────────┐
│ ⚡ DESIGN CHALLENGE                    [Collapse ▲]      │
│                                                          │
│ Challenge text here (1-3 sentences describing the        │
│ design problem)                                          │
│                                                          │
│ Goal: Make the Compliance Scorecard fully green.         │
│                                                          │
│ [Hint: Show setback table] ← collapsible, costs no pts  │
└─────────────────────────────────────────────────────────┘
```

**Controls:** Remain fully interactive. No locks. No guided steps. The student solves the problem using the same parametric sandbox they've been exploring.

**Completion:** When Scorecard goes all-green:
```
┌────────────────────────────────────────┐
│  CHALLENGE COMPLETE                    │
│                                        │
│  Effective AMBF: {ambf} sqm            │
│  PSO: {pso} sqm                        │
│  TOSL: {tosl} sqm ({isa} ISA + {usa} USA)│
│                                        │
│  This configuration is code-compliant. │
│  Your computation is exam-ready.       │
│                                        │
│  [Try a harder challenge ▸]            │
│  [Test yourself in the quiz bank →]    │
│  [Return to 3D Lab ←]                  │
└────────────────────────────────────────┘
```

**No celebration animation. No confetti. The numbers are the reward.** The student who gets here knows exactly how to compute development controls for any lot. That knowledge is what the ALE will test.

---

## Section 8: The Topnotcher's Lens

### Why This Module Directly Impacts Board Exam Performance

The ALE is not asking students to understand development controls in the abstract. It is asking them to compute them quickly, correctly, under pressure, for a lot they've never seen before.

The topnotcher's Area C protocol step 2 is: **"Compute before designing."** Before drawing a single line, the correct exam strategy is:

1. Read lot dimensions from the brief
2. Compute TLA
3. Identify occupancy group → look up setbacks
4. Compute buildable dimensions (width and depth)
5. Compute AMBF (setback-limited)
6. Check against zoning lot coverage → take the minimum
7. That number is your maximum building footprint. Now draw.

A student who completes this 3D module with genuine comprehension can execute steps 2–6 in under 90 seconds from memory. That is the exam payoff.

**What this module trains, specifically:**

The parametric slider interaction trains the student's spatial intuition for how setback changes affect buildable area. After manipulating the lot width slider and watching the AMBF box shrink and expand in real time, the student develops a felt sense of the constraint — not just a formula. On exam day, they will visualize the lot automatically.

The TLA identity quiz trains the exact formula needed for computation verification. The student who can confirm their AMBF + ISA + USA = TLA in the field knows their numbers are right before they commit them to paper.

The Design Challenge mode trains the compute-before-design protocol under a mild pressure framing. It is the study version of the exam's actual demand.

### Linking This Module to Camp Trail

This module is not a standalone tool. It should appear in the Camp Trail at the correct position in the study sequence:

**Prerequisite modules (must complete before this module in Trail):**
- PD 1096 Overview (Week 1)
- Occupancy Groups (Week 2)
- Zoning Classification (Week 3)

**This module (recommended: Week 4–5):**
- Site Development Controls 3D Lab (this module)

**Follow-on modules (assigned after this module):**
- TGFA and GFA Computation (uses AMBF as input)
- Floor Area Ratio and Building Height Limit
- Area C: Compute-before-design practice session (uses this module's output directly)

---

## Section 9: Code Accuracy Review

Before shipping, every PD 1096 citation in the module's hotspot content and compliance scorecard must be verified against the current IRR.

### Citation Audit Table

| Citation Used | Element | Verification Status | Action |
|---|---|---|---|
| IRR Rule VIII, Sec. 805 | TLA formula | ⚠️ Verify | Cross-reference current IRR before ship |
| IRR Rule VIII, Sec. 803 | AMBF definition | ⚠️ Verify | Section numbering can shift across IRR editions |
| IRR Rule VIII, Sec. 804 | PSO definition | ⚠️ Verify | Same |
| IRR Rule VIII, Sec. 806 | TOSL / ISA / USA | ⚠️ Verify | Confirm ISA/USA ratio defaults are in IRR or are derived |
| IRR Rule VIII, Sec. 808 | MACA formula | ⚠️ Verify | MACA appears in the math engine but not yet in any hotspot |
| IRR Rule VII, Sec. 704 | Setback table (Group A) | ⚠️ Verify | The 2.0m/1.5m/4.5m values need explicit IRR section confirmation |
| IRR Rule VII, Sec. 704–708 | Setback table (Groups B–G) | ❌ Not yet specified | The engineering spec only implements Groups A, C/D, E. Groups B, F, G need setback values added or the selector must be limited to implemented groups |

### Known Code Risk Areas

**Risk 1: The MACA formula appears in the math engine but has no hotspot.**
MACA = AMBF × (1 + allowable_additional_coverage) is computed but not explained anywhere in the UX. If this value appears in the compliance scorecard without a hotspot, students will not understand what it is. **Resolution: Either add a MACA hotspot, or remove MACA from the scorecard until hotspot content is ready.**

**Risk 2: The occupancy selector includes Groups B, F, G, but the setback table in the engineering spec only implements A, C/D, E.**
If a student selects Group B (Educational), the `computeSetbacks()` function falls through to the conservative default (4.5/2.0/2.0/2.0). This produces a correct-looking but potentially incorrect setback. **Resolution: Limit the occupancy selector to Groups A, C, D, E for v1, or implement all seven groups with verified values before ship.**

**Risk 3: ISA/USA ratio of 30%/70% is not explicitly mandated by PD 1096.**
The engineering spec treats this as a default. PD 1096 may specify minimum USA requirements for certain occupancy types or zoning classes. **Resolution: Verify whether PD 1096 mandates ISA/USA ratios or if these are design guidelines. If the latter, label the ratio as "typical practice (30/70)" rather than presenting it as code-required.**

**Risk 4: The setback for Group A lots ≤200 sqm uses 2.0m front setback.**
The engineering spec has `{ front: 2.0, rear: 2.0, left: 1.5, right: 1.5 }` for Group A lots ≤200 sqm. This must be verified against the current IRR Rule VII. **Resolution: Pull the exact table from the verified IRR before ship. A wrong setback value produces a wrong AMBF, which costs a student an Area C question.**

### Code Accuracy Ship Gate

**This module cannot ship to students until every section citation has been verified by a licensed architect or against a current copy of the PD 1096 IRR.**

The module footer already includes: *"All PD 1096 formulas are cited to IRR Rules VII and VIII. Verify specific section numbers against the current PD 1096 IRR before shipping to students."* This warning exists in the engineering spec. Honor it.

The UX implementation should add a **visible pre-launch flag** in the Compliance Scorecard during development/staging:

```
⚠ CODE CITATIONS PENDING VERIFICATION
These section references are flagged for review.
Do not publish this module until citations are confirmed.
```

Remove this flag only after architect review sign-off.

---

## Section 10: UX Implementation Sequence

This sequence runs in parallel with the engineering execution order. UX deliverables are review gates before engineering phases proceed.

### Pre-Development (Day 0) — UX Deliverables

Before any code is written, produce:

1. **Module learning objective card** (this document, Section 1) — reviewed and approved ✓
2. **Hotspot content draft** (this document, Section 6) — written, needs architect citation review
3. **Quiz question bank draft** (this document, Section 6) — written, needs math verification against 300 sqm test case
4. **Wireframes** (desktop + mobile) — static layouts for the SiteControlsPage
5. **Pre-training card content** — written in this document, needs design mockup

### Day 1 (Math Engine) — UX Gate

Before math engine ships: **verify the 300 sqm validation table against the hotspot dimension callouts.** The numbers in the hotspots will pull live from `useSiteControls()` — but the expected values in the quiz rationales are hardcoded. They must match the math engine exactly.

Run the math engine unit test with 300 sqm inputs. Confirm all values match Section 6 quiz question rationales. If any value differs, update the quiz rationales (not the math engine — the math is ground truth).

### Day 2 (Store) — UX Gate

After Zustand store is wired: **test the bottom sheet tab-switching behavior on mobile.** The store's `activeZone` drives which tab is active on mobile. Confirm that clicking an ISA hotspot on mobile (canvas) updates the bottom sheet to the Compliance tab and shows ISA hotspot content there — not in a floating overlay.

### Days 3–4 (3D Geometry) — UX Gate

After LotPlane, SetbackZones, AMBFVolume, OpenSpaceZones are built: **the dual coding check.** Put the module in front of one person who has not seen the engineering spec. Ask: "Look at this for 30 seconds. Can you identify which part is the building and which part is the open space?" If they cannot, the color differentiation is insufficient.

**Color thresholds for dual coding clarity:**
- AMBF box must be visually distinct from both ISA and USA — if they look similar from the default camera angle, increase contrast
- ISA (cement grey `#C4BAA5`) and USA (landscape green `#7B9E6A`) must be distinguishable to colorblind users — add pattern differentiation (hatching) as an accessibility fallback

### Day 5 (Interactivity) — UX Gate

After hotspots, dimension lines, and violation overlay: **the interaction audit.** Walk through every zone interaction in the Interaction Map (Section 5) on both desktop and a physical mobile device. Confirm:

- [ ] Every zone click opens the correct hotspot
- [ ] `onPointerMissed` closes all hotspots
- [ ] Camera transitions smoothly (no jarring cuts)
- [ ] Violation overlay activates exactly when compliance fails
- [ ] Bottom sheet tab switching works on mobile
- [ ] Touch targets are all 44px minimum

### Day 6 (Controls + Scorecard) — UX Gate

After SiteControlsControls and ComplianceScorecard: **the first-run walkthrough.**

Simulate a first-time student. Dismiss the pre-training card. Orbit the model. Click each zone. Read each hotspot. Adjust each slider. Trigger a violation. Watch the scorecard update. Answer a quiz question.

Time the full experience. Target: a student who reads every hotspot and completes every quiz should finish in 12–15 minutes. If it's under 8 minutes, the content is too thin. If it's over 20 minutes, the progressive disclosure is broken (too much appearing at once).

### Day 7 (Integration + Validation) — UX Gate

After route integration and end-to-end 300 sqm validation: **the pre-launch checklist.**

**Design Review Checklist (from UX Designer Skill):**

Purpose:
- [ ] This module has exactly one primary job: teach development control computation
- [ ] A student can identify what to do within 5 seconds of load
- [ ] The module advances toward Area C competency

Hierarchy:
- [ ] The 3D canvas is the dominant visual element
- [ ] Primary CTA (quiz trigger) is visually distinct from secondary links
- [ ] TLA identity is the most prominent formula in the information hierarchy

States:
- [ ] Loading state: canvas skeleton visible
- [ ] First-run state: pre-training card visible
- [ ] Active state: full interaction
- [ ] Violation state: informational, not alarming
- [ ] All-pass state: green scorecard (Design Challenge win condition)
- [ ] Error state: what happens if `useSiteControls()` throws? (define graceful fallback)

Accessibility:
- [ ] 4.5:1 contrast ratio on all text
- [ ] 44px minimum touch targets
- [ ] Color is not the sole indicator anywhere
- [ ] Screen reader tested (VoiceOver / TalkBack)

Brand:
- [ ] Feels like a coach — informational, calm, purposeful
- [ ] No gamification debris (badges, confetti, XP)
- [ ] Camp metaphor language consistent ("Design Challenge" not "Level Up")
- [ ] Violation states are data, not alarm

Code Accuracy:
- [ ] All PD 1096 citations verified by licensed architect
- [ ] MACA hotspot added or MACA removed from scorecard for v1
- [ ] Occupancy selector limited to implemented groups only
- [ ] ISA/USA ratio labeled as "typical practice" if not code-mandated

---

## Section 11: Heatmap Integration

When the student completes the in-module quiz sequence (all five questions attempted), the results must feed the Heatmap node for "Development Controls" under the Building Laws taxonomy.

**Quiz-to-heatmap mapping:**

| Quiz Score | Heatmap Node Movement | Readiness Score Impact |
|---|---|---|
| 0/5 or 1/5 | Node stays Red (or moves to Red if was Grey) | Negative delta |
| 2/5 or 3/5 | Node moves to Amber | Small positive delta |
| 4/5 | Node moves to Green | Positive delta |
| 5/5 | Node moves to Strong Green | Strong positive delta |

**After-module screen (bottom of page, replaces the standard quiz link banner):**

```
┌──────────────────────────────────────────────────────────┐
│  MODULE COMPLETE                                          │
│                                                          │
│  Development Controls · 4/5                              │
│                                                          │
│  ✓ TLA computation                                       │
│  ✓ AMBF binding constraint                               │
│  ✓ PSO area                                              │
│  ✓ ISA/USA identification                                │
│  ✗ TLA identity — reviewed                               │
│                                                          │
│  Your heatmap has been updated.                          │
│                                                          │
│  [Return to 3D Lab ←]      [Quiz Bank: Rule VIII →]     │
└──────────────────────────────────────────────────────────┘
```

This screen appears as a non-blocking bottom section of the page — not a modal. The 3D model remains visible above it. The student can return to the model after seeing their results.

---

## Appendix A: Copywriting — UI Labels

All UI text used in this module. Write in SlateCamp brand voice (coach-like, honest, direct).

| Element | Text |
|---|---|
| Page title | Site Development Controls |
| Page badge | PD 1096 Rules VII & VIII |
| Pre-training card title | Three terms to know before you start |
| Pre-training dismiss | Got it — show me the model |
| Pre-training skip | I already know these terms |
| Reset button | Reset |
| View mode: perspective | Perspective |
| View mode: plan | Plan View |
| View mode: dimensions | Dimensions |
| Controls eyebrow: width | Lot Width |
| Controls eyebrow: depth | Lot Depth |
| Controls eyebrow: height | Building Height |
| Controls eyebrow: occupancy | Occupancy Group |
| Controls eyebrow: zoning | Zoning Class |
| Scorecard title | Compliance Check |
| Scorecard all-pass | All requirements met ✓ |
| Scorecard partial | {n}/5 requirements met |
| Scorecard violation message | Adjust this parameter to resolve the violation |
| Design Challenge badge | ⚡ Design Challenge |
| Challenge goal text | Make the Compliance Scorecard fully green. |
| Challenge hint label | Hint: Show setback table |
| Challenge complete title | Challenge Complete |
| Challenge complete body | Your computation is exam-ready. |
| Quiz trigger | Quick Check ▸ |
| Quiz correct (brief) | That's right. |
| Quiz incorrect (brief) | Here's what the code says. |
| Module complete title | Module Complete |
| Module complete heatmap | Your heatmap has been updated. |
| Footer quiz link | Test yourself on development controls → |
| Footer wiki link | Read the Wiki article on Rule VIII → |
| Footer challenge link | ⚡ Try a Design Challenge |

---

## Appendix B: Success Metrics Dashboard

Post-launch, track these metrics to determine if the UX implementation succeeded:

| Metric | Target | Red Flag | Measurement |
|---|---|---|---|
| Module open → quiz attempt rate | ≥70% | <40% | Events |
| Quiz Q1–Q5 completion rate | ≥80% | <50% | Events |
| Quiz correct rate (all 5) | ≥50% first-attempt correct | <25% | Events |
| "Green scorecard" achievement rate | ≥60% of sessions | <30% | Events |
| Design Challenge attempt rate | ≥30% of module completers | <10% | Events |
| Heatmap node movement after module | ≥80% move at least one state | <50% | Heatmap delta |
| Module → quiz bank conversion | ≥40% click "Quiz Bank: Rule VIII" | <15% | Click events |
| D1 return rate after module completion | ≥50% | <25% | Cohort analysis |
| Mobile completion rate (vs desktop) | Within 15% of desktop | >25% gap | Segmented events |

Review this dashboard 2 weeks post-launch. Any metric in red flag territory triggers a focused usability test (5 participants, moderated, 30 minutes) on that specific failure point.

---

*This UX implementation plan is the governing document for all user experience decisions on the PD 1096 Rules VII & VIII Site Development Controls module. Engineering specs govern HOW it is built. This document governs WHAT the student experiences. Both must be true before this module reaches a student.*

*Code citation verification required before public ship. All content reviewed against: slatecamp-ux-designer · slatecamp-ux-researcher · slatecamp-3d-interaction-designer · slatecamp-3d-information-designer · slatecamp-performance-gamification · arch-education-research · ale-topnotcher-strategy · ph-arch-construction-law*
