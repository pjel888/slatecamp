# SlateCamp Stairway Configurator — UX & UI Implementation Plan

**Module:** Stairway Configurator 2.0
**Date:** April 9, 2026
**Status:** Planning
**Design Authority:** SlateCamp UX

---

## Table of Contents

1. [The UX Thesis](#1-the-ux-thesis)
2. [Research Foundation — Why Violation-First Learning Works](#2-research-foundation)
3. [The Viewport Sanctity Rule](#3-the-viewport-sanctity-rule)
4. [Screen Layout Architecture](#4-screen-layout-architecture)
5. [The Violation Preset System — Core Learning Mechanic](#5-the-violation-preset-system)
6. [The Three-Panel Information Architecture](#6-the-three-panel-information-architecture)
7. [Interaction Flow Map](#7-interaction-flow-map)
8. [3D Viewport UX — What Goes Inside](#8-3d-viewport-ux)
9. [Annotation System UX — The No-Block Protocol](#9-annotation-system-ux)
10. [Compliance Report Panel UX](#10-compliance-report-panel-ux)
11. [Parameter Panel UX](#11-parameter-panel-ux)
12. [Mobile Responsive Strategy](#12-mobile-responsive-strategy)
13. [Component Library Integration](#13-component-library-integration)
14. [Microinteractions and Transitions](#14-microinteractions-and-transitions)
15. [Onboarding and First-Run Experience](#15-onboarding-and-first-run-experience)
16. [Accessibility](#16-accessibility)
17. [UX Metrics and Success Criteria](#17-ux-metrics-and-success-criteria)

---

## 1. The UX Thesis

**The stairway configurator teaches building codes by making violations visible, spatial, and visceral — not by presenting rules as text.**

The learning experience is built on one insight: students remember what they *see go wrong* more than what they read went right. When a student drags a riser slider to 210 mm and the 3D stairway physically turns red, they have a spatial memory of "200 mm is the line" that no flashcard can replicate. When they toggle "Exit Stair" and watch the same riser turn Evacuation Red because RA 9514's stricter 180 mm limit now applies, they've internalized multi-law compliance through felt experience.

The UX must make this experience effortless. The student should never have to *figure out* the interface. The interface should disappear, leaving only the stair model, the sliders, and the immediate visual feedback loop. Every panel, every button, every annotation exists to serve this loop — and nothing else.

**The UX serves three user modes:**

| Mode | User Intent | UX Priority |
|---|---|---|
| **Explorer** | "I want to see what happens when I change things" | Sliders respond instantly. Violations appear immediately. Zero friction between thought and feedback. |
| **Student** | "I need to learn the specific code values for the ALE" | Violation messages cite the exact law and section. Presets demonstrate key scenarios. Quiz integration tests recall. |
| **Reviewer** | "I'm checking if a specific stair design complies" | Input exact values. See all applicable laws evaluated in parallel. Export or screenshot the compliance report. |

---

## 2. Research Foundation — Why Violation-First Learning Works

### 2.1 Productive Failure (Kapur, 2008, 2014, 2015)

Manu Kapur's research at the National Institute of Education, Singapore, established that students who attempt problem-solving *before* receiving instruction — and who inevitably produce errors — achieve higher conceptual understanding and transfer than students who receive instruction first. The mechanism: errors create "knowledge gaps" that prime the student to absorb the correct information more deeply when it arrives.

**Application to the Stairway Configurator:** The violation preset system is a Productive Failure engine. When the student clicks "Riser Violation (PD 1096)" and sees the 3D model turn red at 210 mm, they have *experienced the violation* before reading the rule. The compliance report then provides the "consolidation phase" — the correct value, the law citation, and the explanation. This sequence (error → understanding) is significantly more effective than the reverse (instruction → confirmation).

**Source:** Kapur, M. (2014). Productive failure in learning math. *Cognitive Science*, 38(5), 1008–1022. Kapur, M. (2015). Learning from productive failure. *Learning: Research and Practice*, 1(1), 51–65.

### 2.2 Deliberate Error Effect (Wong & Lim, 2022)

Recent research by Wong and Lim found that deliberately making a mistake and then correcting it — even when the learner knows the correct answer — is more beneficial for concept learning than highlighting concepts, creating concept maps, or generating real-world examples. The act of engaging with the error itself is the learning mechanism.

**Application:** The preset system allows students to deliberately explore violations even after they know the correct values. The "challenge mode" can ask students to *create* a specific violation ("Set the stair to violate RA 9514 but pass PD 1096") — this is the deliberate error effect in action.

**Source:** Wong, S. S. H. & Lim, S. W. H. (2022). The derring effect: Deliberate errors enhance learning. *Journal of Experimental Psychology: General*, 151(1), 25–40.

### 2.3 Elaboration on Errors (Loibl & Rummel, 2014)

Research on productive failure found that the initial problem-solving activity remains ineffective if it is followed by instruction that focuses only on correct solutions. Students who engaged in problem solving prior to instruction outperformed peers only when the instruction *built on the erroneous attempts by comparing them to the correct solution*. When instruction focused on correct solutions only, no benefit emerged.

**Application:** The compliance report panel must explicitly compare the violation to the correct value. Not just "PD 1096: Max riser is 200 mm" but "Current: 210 mm → exceeds PD 1096 max of 200 mm by 10 mm." The delta — the distance between the error and the correct value — is the critical information that produces learning.

**Source:** Loibl, K. & Rummel, N. (2014). Knowing what you don't know makes failure productive. *Learning and Instruction*, 34, 74–85.

### 2.4 Vicarious Failure (Kapur, 2014b)

Students can learn from observing others' failures, not just from their own. However, Kapur found that *generating your own* failures produces stronger learning than observing someone else's. The implication: the preset system (vicarious failure — "look at this violation") is useful but the sandbox mode (productive failure — "create your own violation") is more powerful.

**Application:** The UX should guide students from presets (vicarious) → sandbox (generative) → challenge (deliberate). This is a progression from passive to active learning within the same module.

### 2.5 Contrasting Cases (Schwartz & Martin, 2004; Sinha & Kapur, 2021)

Presenting contrasting cases — a correct example alongside an incorrect one — helps students identify the critical features that distinguish compliance from violation. This is more effective than studying correct examples alone.

**Application:** The preset system should include paired presets: "Compliant House" next to "Riser Violation." The student sees the same stair geometry in two states and must identify what changed. The 3D model makes the contrast spatial — the student literally sees the difference.

---

## 3. The Viewport Sanctity Rule

**THE LAW: Nothing blocks the 3D model. Ever.**

This is the single most important UX rule in this module and it is not open to compromise.

### 3.1 The Problem Being Solved

The current 3D Lab has a pattern where drei `<Html>` components are placed inside the 3D viewport as floating text boxes that track mesh positions and follow the camera during orbit. These boxes:

- Physically occlude the 3D geometry the student needs to see.
- Create visual noise that competes with the violation colors for attention.
- Move during orbit, causing motion sickness on mobile and making text unreadable during interaction.
- Accumulate — when multiple violations fire simultaneously, the viewport becomes a wall of floating text.
- Scale unpredictably with camera zoom — too small when zoomed out, too large when zoomed in.

### 3.2 The Rule — In Full

**Rule 1: No text boxes inside the 3D viewport.** The viewport renders geometry, violation colors, dimension lines, and small marker dots only. Text content lives in the side panels (parameter panel on the left, compliance report on the right).

**Rule 2: No camera-following labels larger than a badge.** The only elements permitted to float in the viewport are: small circular marker dots (≤ 12px diameter) that indicate clickable/hoverable elements, and minimal numeric badges (e.g., "185 mm" in a tight pill — max 60px wide) that are tethered to a specific geometry point and do NOT track the camera.

**Rule 3: No tooltip panels inside the viewport.** When the student clicks or hovers on a 3D element, the detail information appears in the compliance report panel (right side) — not as a floating tooltip in the viewport. The viewport element may briefly highlight (outline pulse, color flash) to confirm the selection, but the content appears in the panel.

**Rule 4: Dimension lines are lines, not labels.** Dimension annotations are thin lines with a small numeric value rendered as a drei `<Text>` component (SDF text, not HTML). These are small, low-profile, and positioned offset from the geometry. They do NOT have backgrounds, borders, or card-like styling.

**Rule 5: The viewport is the student's thinking space.** The student orbits, zooms, and inspects. The viewport responds with geometry changes and color shifts. Text-heavy information delivery happens in the panels. This split respects the dual-channel processing model (Mayer, 2001) — spatial information through the visual/pictorial channel (viewport), verbal information through the verbal channel (panels).

### 3.3 What IS Allowed Inside the Viewport

| Element | Max Size | Style | Purpose |
|---|---|---|---|
| Violation color on geometry | N/A (it IS the geometry) | Solid fill per law color palette | Primary feedback signal |
| Marker dot | 8–12px circle | Filled circle, law color or white | Indicates clickable element |
| Dimension value | ≤ 60px wide pill | Monospace, no background, small shadow for legibility | Shows current measurement |
| Dimension line | 1–2px stroke | Dashed or solid, subtle gray or white | Connects measurement endpoints |
| Comfort gauge | 120×60px max | Corner-anchored, semi-transparent bg | Persistent Blondel 2R+T readout |
| Ghost geometry | N/A (it IS geometry) | 15–25% opacity, comparison color | International code overlay |

### 3.4 What Is BANNED From the Viewport

| Element | Why It's Banned | Where It Goes Instead |
|---|---|---|
| Floating text boxes with card styling | Blocks geometry, creates visual noise | Compliance report panel (right) |
| Violation messages with full sentences | Too much text in spatial processing channel | Compliance report panel (right) |
| Code citation paragraphs | Overwhelms cognitive load in 3D context | Compliance report panel → expand section |
| Quiz question overlays | Covers the model the quiz is about | Bottom sheet or dedicated quiz panel |
| Historical context annotations | Long-form text doesn't belong in 3D space | History panel section or slide-out drawer |
| Camera-following billboards | Causes nausea during orbit, unreadable | Marker dot in viewport → detail in panel |

### 3.5 Enforcement Mechanism

Create a shared component `<ViewportContent>` wrapper that enforces the sanctity rule at the component level. Any child of `<ViewportContent>` that is a drei `<Html>` component with width > 80px or height > 40px triggers a development-mode console warning: "VIEWPORT SANCTITY VIOLATION: Html element exceeds maximum viewport annotation size. Move this content to a panel." This catches violations during development before they reach production.

---

## 4. Screen Layout Architecture

### 4.1 Desktop Layout (≥ 1024px)

```
┌──────────────────────────────────────────────────────────────────────┐
│  HEADER BAR (48px): Module title · Breadcrumb · View mode toggles   │
├────────────┬──────────────────────────────────┬──────────────────────┤
│            │                                  │                      │
│  LEFT      │                                  │  RIGHT               │
│  PANEL     │       3D VIEWPORT                │  PANEL               │
│  (280px)   │       (flexible)                 │  (320px)             │
│            │                                  │                      │
│  Parameters│   The model lives here.          │  Compliance          │
│  Presets   │   Nothing blocks it.             │  Report              │
│  Toggles   │   Violation colors are           │  Per-law cards       │
│  Mode      │   the primary feedback.          │  Violation detail    │
│  Selector  │                                  │  Comparison delta    │
│            │                                  │                      │
│            │                                  │                      │
│            │                                  │                      │
├────────────┴──────────────────────────────────┴──────────────────────┤
│  BOTTOM BAR (optional, 48px): Tour controls · Quiz prompt · Context │
└──────────────────────────────────────────────────────────────────────┘
```

**Key decisions:**
- Left panel holds input controls (parameters, presets, toggles). The student acts here.
- Right panel holds output information (compliance results, violation details). The student reads here.
- The 3D viewport fills all remaining space. It is never compressed below 50% of the screen width.
- Panels are collapsible. Double-clicking the panel edge or pressing `[` / `]` collapses left/right panels respectively, giving the viewport full width for focused inspection.

### 4.2 Panel Collapse Behavior

| State | Left Panel | Viewport | Right Panel |
|---|---|---|---|
| **Default** | 280px, visible | Flex (remaining) | 320px, visible |
| **Inspect mode** | Collapsed (icon strip, 48px) | Expanded | 320px, visible |
| **Fullscreen 3D** | Collapsed | Full width | Collapsed |
| **Reading mode** | 280px, visible | Reduced | Expanded (400px) |

Panel collapse transitions are animated (200ms ease-out). The viewport smoothly resizes to fill available space. The 3D camera does NOT reset during panel collapse — the student's viewing angle is preserved.

### 4.3 Tablet Layout (768–1023px)

- Left panel becomes a slide-out drawer (hamburger trigger).
- Right panel becomes a bottom sheet (swipe-up from a persistent "Compliance" tab at the bottom).
- Viewport fills the full screen when panels are closed.
- Preset chips are moved to a horizontal scrolling strip above the viewport.

### 4.4 Mobile Layout (< 768px)

Detailed in Section 12.

---

## 5. The Violation Preset System — Core Learning Mechanic

### 5.1 The Pedagogy

The preset system is the entry point for most students. Instead of expecting students to understand what each slider does (high extraneous cognitive load), presets say: "Here's what a riser violation looks like. Now look at the model. Now look at the compliance report. Now you understand."

Presets are organized into two categories:

**Scenario Presets** — Complete project configurations that represent real-world stair designs. These are the existing presets (Standard House, BP 220 Housing, Public Hall, Exit Stair) plus new ones. They set ALL parameters at once.

**Violation Presets** — Targeted configurations that demonstrate a specific code violation. These modify the minimum number of parameters needed to trigger the violation, leaving other parameters at compliant defaults. They are the primary learning tool.

### 5.2 Violation Preset Design

Each violation preset must satisfy these criteria:

1. **Triggers exactly one primary violation.** The student should not have to sort through multiple simultaneous violations to find the one being demonstrated. (Secondary violations are acceptable if they naturally co-occur.)
2. **The violation is visible in the 3D model.** The color change must be obvious — the affected element turns the relevant law color. If the violation is dimensional (width too narrow), the deficit indicator planes must be visible.
3. **The compliant state is one click away.** A "Fix this" button or a "Show Compliant" toggle snaps the violated parameter to its nearest compliant value, showing the before/after contrast.
4. **The preset name tells the student what to look for.** Not "Preset 5" but "Riser Violation (PD 1096)" or "Width Too Narrow for Accessibility (BP 344)."

### 5.3 Violation Preset Registry

| Preset Name | Primary Violation | Key Parameter Change | Law | Severity |
|---|---|---|---|---|
| **Riser Violation (PD 1096)** | Riser exceeds 200 mm | riserHeight: 210 mm | PD 1096 | Error |
| **Tread Too Shallow (PD 1096)** | Tread below 200 mm | treadDepth: 185 mm | PD 1096 | Error |
| **Too Narrow for Public (PD 1096)** | Width below 1,100 mm for >50 occupancy | stairWidth: 900 mm, isHighOccupancy: true | PD 1096 | Error |
| **Headroom Crush (PD 1096)** | Headroom below 2,000 mm | headroom: 1,900 mm | PD 1096 | Error |
| **Exit Riser Violation (RA 9514)** | Exit stair riser exceeds 180 mm | riserHeight: 195 mm, isExitStair: true | RA 9514 | Error |
| **No Landing (RA 9514)** | Vertical rise exceeds 3,000 mm without landing | numRisers: 18, riserHeight: 185 mm, isExitStair: true | RA 9514 | Error |
| **Too Narrow for Wheelchair (BP 344)** | Accessible width below 1,200 mm | stairWidth: 1,000 mm, isAccessibleRoute: true | BP 344 | Error |
| **BP 220 vs PD 1096 Conflict** | Passes BP 220 but fails PD 1096 baseline | riserHeight: 230 mm, projectType: bp220_socialized | Cross-law | Warning |
| **RA 9514 vs PD 1096 Conflict** | Passes PD 1096 but fails RA 9514 | riserHeight: 195 mm, isExitStair: true | Cross-law | Warning |
| **All Laws Happy** | Full compliance across all applicable laws | (carefully tuned values) | N/A | Pass |
| **Everything Wrong** | Maximum simultaneous violations | (extreme values, all overlays active) | Multiple | Error |

### 5.4 Violation Preset UX Flow

```
Student sees preset chip strip → clicks "Riser Violation (PD 1096)"
  → Parameters animate to violation values (slider slides visually, ~300ms)
  → 3D model: risers turn PD 1096 Code Slate (#4A7FAD)
  → Compliance report: PD 1096 card shows "1 ISSUE" badge, violation row highlighted
  → Riser dimension badge in viewport updates to "210 mm" in violation color
  → Student absorbs the violation spatially (sees the color) and textually (reads the panel)
  → Student clicks "Fix" button on the violation row
  → Slider animates riserHeight from 210 → 200 mm
  → Risers transition from Code Slate → Neutral gray (~400ms color lerp)
  → Compliance report: PD 1096 card shows "COMPLIANT" badge
  → Student has seen: violation → correction → compliance in one flow
```

### 5.5 Paired Preset Pattern — Contrasting Cases

For maximum learning impact, presets are displayed in pairs where possible. The UI shows a "before/after" toggle within a single preset chip:

```
┌─────────────────────────────────┐
│  ◯ Riser Violation    ◉ Fixed  │  ← toggle within the chip
│     PD 1096                     │
└─────────────────────────────────┘
```

Toggling between the two states animates the parameter change and the resulting 3D color shift. This is the contrasting case pattern (Schwartz & Martin, 2004) — the student sees both states and identifies the critical difference.

---

## 6. The Three-Panel Information Architecture

### 6.1 Left Panel — "The Controls"

The left panel is the student's input surface. It contains, in order from top to bottom:

1. **Module title and context scenario** (collapsed by default, expandable). The brief ("You're designing stairs for a mixed-use development in Quezon City...").
2. **Preset chip strip** — Horizontally scrollable on mobile, wrapping on desktop. Two groups: "Scenarios" and "Violations" separated by a subtle divider.
3. **Project Classification** — Dropdown (project type) and toggles (accessible route, exit stair, high occupancy). These are "mode switches" that change which laws apply.
4. **Stair Geometry** — The six slider controls. Each slider shows its current value, unit, and a subtle green/red indicator dot showing whether the current value is compliant.
5. **Advanced Toggles** (collapsed accordion) — Compare Mode, Tolerance Mode, History Layer, Material selector. These are secondary features that don't appear until the student is ready.

### 6.2 Center — "The Model"

The 3D viewport. The student's spatial thinking space. Governed by the Viewport Sanctity Rule (Section 3). Contains only: geometry, violation colors, small marker dots, dimension value pills, dimension lines, and the corner-anchored comfort gauge.

### 6.3 Right Panel — "The Report"

The right panel is the student's output/reading surface. It contains, in order from top to bottom:

1. **Summary badge** — "ALL PASS" (green) or "2 ISSUES" (red) — the at-a-glance status.
2. **Per-law compliance cards** — One card per applicable law (RA 9514, BP 344, PD 1096, BP 220), ordered by severity. Each card shows: law name, subtitle ("Exit stair · Life-safety overlay"), issue count badge, and a list of dimension checks with pass/fail icons.
3. **Selected element detail** (appears when a 3D element is clicked) — Shows the focused element's name, current value, all applicable law limits, compliance status per law, and the "Fix" button.
4. **International comparison section** (appears when Compare Mode is active) — Shows IBC/ADA/IRC evaluation results.
5. **Legal disclaimer** — "Visual design aid only. Final authority rests with your LGU Building Official and the Bureau of Fire Protection."

### 6.4 Information Flow Between Panels

```
LEFT (Input)          →    CENTER (Spatial)    →    RIGHT (Output)
Student adjusts           Model updates              Report updates
  slider                    geometry +                  compliance
                            violation colors            card states

Student clicks            Element highlights           Element detail
  preset                    (color change)              appears in panel

Student toggles           Overlay geometry             New law card
  "Exit Stair"              appears/disappears          appears/disappears
```

The flow is always left → center → right. The student never needs to look at the right panel to understand what to do next in the left panel. The panels are independent reading surfaces.

---

## 7. Interaction Flow Map

### 7.1 First-Time Flow (Guided)

```
1. Module loads → Default "Standard House" preset active
   → Model is fully compliant (all green/neutral)
   → Brief toast: "Try dragging a slider or clicking a violation preset"

2. Student clicks "Riser Violation (PD 1096)" preset chip
   → Parameters animate to violation state
   → Risers turn Code Slate
   → Right panel: PD 1096 card shows "1 ISSUE"
   → Pulse animation on the violation row to draw eye

3. Student reads the violation in the right panel
   → "PD 1096: Maximum riser height is 200 mm"
   → "Current: 210 mm (exceeds by 10 mm)"

4. Student clicks "Fix" on the violation row
   → Slider animates to 200 mm
   → Risers return to neutral
   → Card shows "COMPLIANT"

5. Student explores freely (sandbox mode)
   → Drags sliders, toggles overlays
   → Each violation triggers immediately
```

### 7.2 Returning User Flow (Sandbox)

```
1. Module loads with last-used parameters (persisted in local storage)
2. Student immediately adjusts sliders or tries new presets
3. Deep features accessible via Advanced Toggles accordion
```

### 7.3 Challenge Flow

```
1. Student activates "Challenge Mode" from mode selector
2. System presents a prompt: "Configure a stair that passes RA 9514 as an exit
   stair but violates BP 344 accessibility width. You have 60 seconds."
3. Student manipulates parameters to create the specified violation pattern
4. System validates: Did the student produce the correct violation combination?
5. Feedback: Which rules they got right, which they missed
```

---

## 8. 3D Viewport UX — What Goes Inside

### 8.1 Visual Feedback Hierarchy

The viewport communicates through a strict visual hierarchy:

| Priority | Signal | Visual Treatment | When It Fires |
|---|---|---|---|
| **1** | Element violation color | Full face color change (solid, opaque) | When any law violation is active on this element |
| **2** | Deficit indicator planes | Translucent colored planes flanking the stair | When width is below minimum |
| **3** | Ghost overlay geometry | Translucent comparison shapes | When BP 344, Compare Mode, etc. are active |
| **4** | Dimension value badge | Small monospace pill at measurement point | Always (when "Show Dimensions" is on) |
| **5** | Selection highlight | Bright outline pulse (Edges component) | When student clicks/hovers an element |
| **6** | Comfort gauge | Corner-anchored semi-transparent widget | Always (when enabled in settings) |

### 8.2 Color Communication System

Colors are the primary communication channel inside the viewport. Every color has exactly one meaning:

| Color | Hex | Meaning | Used On |
|---|---|---|---|
| Evacuation Red | `#E74C3C` | RA 9514 violation (life-safety) | Violating element faces |
| Access Blue | `#3498DB` | BP 344 violation / overlay | Violating faces, ghost handrails |
| Code Slate | `#4A7FAD` | PD 1096 violation (baseline) | Violating element faces |
| Housing Amber | `#F5A623` | BP 220 violation (contextual) | Violating element faces |
| Clearance Green | `#2ECC71` | Explicit pass (used sparingly) | Only on "Fix" animation flash |
| Neutral Gray | `#a1a1aa` | No violation, default state | All compliant elements |
| Comparison Ghost | `#94a3b8` | International code overlay | Ghost geometry (15–25% opacity) |

**Rule: Colors never appear on-screen without a corresponding legend.** The first time a violation color appears, the right panel's law card for that color also becomes prominent. The student always knows "red = RA 9514" because the RA 9514 card is red and says "1 ISSUE."

### 8.3 Camera Interaction UX

| Gesture | Desktop | Mobile | Result |
|---|---|---|---|
| Orbit | Left-click drag | One-finger drag | Camera rotates around model |
| Pan | Right-click drag | Two-finger drag | Camera translates |
| Zoom | Scroll wheel | Pinch | Camera moves closer/farther |
| Select element | Left-click (no drag) | Tap (no drag) | Element highlights, detail in right panel |
| Reset camera | Double-click empty space | Double-tap empty space | Returns to default 3/4 view |
| Quick view | View buttons in header | Same | Snaps to predefined camera angle |

**Orbit constraint:** The camera cannot orbit below the ground plane (negative Y). Minimum polar angle: 10° above horizontal. This prevents the student from accidentally looking at the underside of the stair, which is disorienting and unhelpful.

---

## 9. Annotation System UX — The No-Block Protocol

### 9.1 Annotation Categories and Their Homes

| Annotation Type | Lives In | Not In |
|---|---|---|
| Violation message ("PD 1096: Max riser is 200 mm") | Right panel → law card → violation row | ~~Floating text box in viewport~~ |
| Code citation ("PD 1096 IRR Rule VIII §804") | Right panel → violation row → expandable detail | ~~Viewport tooltip~~ |
| Current dimension value ("185 mm") | Viewport → small monospace pill at element | OK here — it's small |
| Dimension line (visual) | Viewport → thin line between endpoints | OK here — it's geometry |
| Historical context ("Blondel, 1672") | Right panel → history section or slide-out | ~~Viewport annotation~~ |
| Quiz question | Bottom sheet or dedicated quiz overlay | ~~Viewport card~~ |
| Comfort formula readout ("2R+T = 620 mm") | Viewport → corner-anchored gauge widget | OK here — it's small, fixed position |

### 9.2 Dimension Display Pattern

Dimensions appear as small value pills attached to the relevant geometry by a thin leader line. The pill:

- Is rendered using drei `<Text>` (SDF text, crisp at any zoom) — NOT `<Html>`.
- Uses monospace font (DM Mono or system monospace), 0.04 scene units tall (~14px equivalent at default zoom).
- Has no background (text only with a subtle drop shadow for legibility against any geometry color).
- Is positioned offset from the element (never overlapping the face it measures).
- Shows the value and unit only (e.g., "185 mm"). No law name, no "compliant" label.
- Changes color to match the element's violation color when violated. Gray when compliant.

**Maximum simultaneous dimension displays:** 4. If more than 4 dimensions would be visible, the system shows only the 4 most relevant to the current context (violated dimensions always take priority over compliant ones).

### 9.3 Selection Highlight Pattern

When the student clicks/taps a 3D element:

1. **Viewport response:** The element gets a bright outline (drei `<Edges>` component with increased lineWidth and a highlight color — white or bright version of the element color). The outline pulses once (scale up 1.02x over 200ms, then back to 1.0x) to confirm the selection.

2. **Panel response:** The right panel scrolls to show the "Element Detail" section. This section shows: element name, current value, per-law compliance breakdown, the "Fix" button, and a "Learn More" link to the wiki article.

3. **Other elements response:** All non-selected elements reduce to 60% opacity (~0.3s transition). The selected element remains at full opacity. This creates a visual "spotlight" effect that isolates the selected element.

4. **Deselection:** Clicking empty space or pressing Escape deselects. All elements return to full opacity.

---

## 10. Compliance Report Panel UX

### 10.1 Card Anatomy

Each law gets a card in the right panel. The card anatomy:

```
┌─────────────────────────────────────────┐
│  ● RA 9514 — Fire Code       1 ISSUE   │  ← Header: law color dot, name, badge
│    Exit stair · Life-safety overlay      │  ← Subtitle: context
├─────────────────────────────────────────┤
│  ✗ Max exit stair riser is 180 mm       │  ← Violation row (red icon)
│    Current: 195 mm · Exceeds by 15 mm   │  ← Delta display
│    [Fix →]                               │  ← Fix button (animates slider)
├─────────────────────────────────────────┤
│  ✓ Min exit stair width is 900 mm       │  ← Pass row (green icon)
│  ✓ Min exit stair tread is 200 mm       │
│  ✓ Max 3,000 mm vertical rise           │
├─────────────────────────────────────────┤
│  Source: RA 9514 IRR · BFP               │  ← Citation footer
└─────────────────────────────────────────┘
```

### 10.2 Card Behavior Rules

**Rule: Cards are ordered by severity.** The law with the most severe violation appears at the top. Within a card, violation rows appear before pass rows.

**Rule: Cards for inapplicable laws are hidden.** If "Exit Stair" toggle is off, the RA 9514 card does not appear. If the project type is not BP 220, the BP 220 card does not appear. This prevents clutter and teaches students which laws apply to which project types.

**Rule: The "Fix" button modifies the slider.** Clicking "Fix" on a violation row animates the corresponding slider to the nearest compliant value. The 3D model updates accordingly. The student sees the fix happen in real-time.

**Rule: Violation rows are clickable.** Clicking a violation row highlights the corresponding 3D element in the viewport (selection highlight pattern) and scrolls the element into view if the camera isn't facing it.

**Rule: Pass rows are collapsed by default.** Only violation rows are expanded. Pass rows show as a single line with a green check and the rule text. They expand on click to show the threshold and current value.

### 10.3 Summary Badge

Above the cards, a summary badge:

- **"ALL PASS"** — Green badge. All applicable laws are satisfied. Appears only when genuinely all rules pass.
- **"2 ISSUES"** — Red badge with count. Tapping it scrolls to the first violation.
- **"1 WARNING"** — Amber badge. Cross-law conflicts only (no hard violations).

---

## 11. Parameter Panel UX

### 11.1 Slider Design

Each slider follows this anatomy:

```
┌───────────────────────────────────────┐
│  Riser Height                 185 mm  │  ← Label + live value
│  ●━━━━━━━━━━━━━━━━○──────────────────│  ← Slider track
│  100                            300   │  ← Min/max labels
└───────────────────────────────────────┘
```

**Live value display:** The value updates in real-time as the slider is dragged. It is right-aligned on the same line as the label. The value turns red when it violates any applicable law, and shows a subtle green dot when compliant.

**Slider track:** The track has a colored fill from the start to the current position. The fill color is blue (brand) when compliant, and shifts to the most severe violation's law color when violated.

**Snap feedback:** When the student drags past a code threshold (e.g., riser crosses 200 mm), the slider provides a subtle haptic bump (on mobile) or a brief resistance animation (snap-and-continue on desktop). This makes code boundaries feel physical.

**Threshold markers:** Thin vertical tick marks on the slider track at each applicable code threshold. Example on the riser slider: a tick at 180 mm (RA 9514 exit max, if exit stair is active), 200 mm (PD 1096 max), and 250 mm (BP 220 max, if housing project). Each tick is colored with its law color.

### 11.2 Toggle Design

Toggles for project classification (Accessible Route, Exit Stair, High Occupancy) use the existing SlateCamp toggle component. When a toggle is activated:

1. The toggle slides to "on" position.
2. The relevant law card appears in the right panel (with a slide-down animation).
3. If the current geometry violates the newly activated law, the 3D model immediately shows the violation color.
4. A subtle "law activated" indicator appears next to the toggle: a small colored dot matching the law color.

### 11.3 Preset Chip Design

Preset chips use a horizontal scrollable strip:

```
┌──────────────────────────────────────────────────────────────────┐
│ [Standard House] [BP 220 Housing] [Public Hall] [Exit Stair]    │ ← Scenarios
│ [Riser ✗ PD1096] [Width ✗ BP344] [Exit ✗ RA9514] [Conflict ⚠]│ ← Violations
└──────────────────────────────────────────────────────────────────┘
```

**Chip styling:**
- Scenario presets: Outlined chips, no fill, text color matches brand.
- Violation presets: Filled chips with law color as background, white text, with a ✗ icon indicating the violation type.
- Active preset: Elevated shadow, thicker border.
- Chips are horizontally scrollable on mobile. On desktop, they wrap to multiple lines if needed.

---

## 12. Mobile Responsive Strategy

### 12.1 Mobile Layout (< 768px)

On mobile, the three-panel layout transforms:

```
┌──────────────────────────────┐
│  HEADER: Title · ≡ Menu      │  ← Hamburger opens left panel as drawer
├──────────────────────────────┤
│  PRESET STRIP (scrollable)   │  ← Always visible, horizontally scrollable
├──────────────────────────────┤
│                              │
│     3D VIEWPORT              │  ← Full width, ~55% of screen height
│     (full width)             │
│                              │
├──────────────────────────────┤
│  ─── COMPLIANCE (swipe up) ──│  ← Bottom sheet, collapsed to summary
│  ALL PASS  ·  Show Details ▴ │
└──────────────────────────────┘
```

**The bottom sheet pattern:** The compliance report lives in a bottom sheet that has three states:

1. **Peek** (default): Shows only the summary badge ("ALL PASS" or "2 ISSUES") and is 48px tall. Does not obscure the viewport.
2. **Half-open** (swipe up or tap): Shows the per-law cards in a scrollable list. Takes up ~45% of the screen. The viewport shrinks proportionally.
3. **Full-open** (swipe up further): Takes up ~85% of the screen. For reading detailed violation information.

**Left panel as drawer:** The parameter controls are accessed via a hamburger menu that opens a slide-out drawer from the left. This keeps the viewport unobstructed while parameters are not being adjusted.

### 12.2 Mobile Touch Targets

All touch targets must be ≥ 48×48px (Android Material guidelines). This applies to:

- Preset chips: minimum 48px height.
- Toggle switches: existing component already compliant.
- Slider thumb: 48px hit area (visual thumb can be smaller).
- 3D element tap targets: elements smaller than 48px equivalent in screen space get an enlarged invisible hit area.

### 12.3 Mobile Performance

Mobile-specific UX decisions for performance:

- Dimension value pills are hidden by default on mobile. Activated via "Show Dimensions" toggle.
- Ghost geometry (compare mode, BP 344 overlay) renders at lower opacity (10% instead of 20%) to reduce overdraw.
- The comfort gauge is simplified to a single line of text ("2R+T: 620 mm ✓") instead of the full arc widget.

---

## 13. Component Library Integration

### 13.1 Existing Components to Reuse

| Component | From | Used For |
|---|---|---|
| `<Toggle>` | SlateCamp Shadcn library | Project classification toggles |
| `<Slider>` | SlateCamp Shadcn library (extended) | Geometry parameter sliders |
| `<Select>` / `<Dropdown>` | SlateCamp Shadcn library | Project type selector |
| `<Card>` | SlateCamp Shadcn library | Compliance report law cards |
| `<Badge>` | SlateCamp Shadcn library | Issue count badges, severity labels |
| `<Tooltip>` | SlateCamp Shadcn library | Slider threshold hover explanations (panel only, not viewport) |
| `<Accordion>` | SlateCamp Shadcn library | Advanced toggles section, pass row expansion |
| `<Sheet>` (bottom sheet) | SlateCamp Shadcn library | Mobile compliance report |
| `<Drawer>` | SlateCamp Shadcn library | Mobile parameter panel |
| `<Button>` | SlateCamp Shadcn library | Fix buttons, view mode toggles |
| `<ScrollArea>` | SlateCamp Shadcn library | Panel content overflow |

### 13.2 New Components to Create

| Component | Purpose | Add to Storybook | Notes |
|---|---|---|---|
| `<PresetChip>` | Scenario and violation preset selector | Yes | Two variants: scenario (outlined) and violation (filled with law color). Props: label, lawColor?, isViolation?, isActive, onClick. |
| `<PresetChipStrip>` | Horizontally scrollable preset container | Yes | Uses `<ScrollArea>` horizontal. Groups presets by category with dividers. |
| `<ComplianceLawCard>` | Per-law compliance result display | Yes | Props: lawName, lawColor, subtitle, issues (array), source. Variants: compliant, has-issues. |
| `<ViolationRow>` | Single violation within a law card | Yes | Props: message, currentValue, limit, delta, severity, onFix, onClick. Has "Fix →" action. |
| `<PassRow>` | Single passing check within a law card | Yes | Props: message. Collapsed by default, expandable. |
| `<ComplianceSummaryBadge>` | Top-of-panel summary (ALL PASS / N ISSUES) | Yes | Props: issueCount, warningCount. Color-coded. |
| `<DimensionSlider>` | Extended slider with threshold markers and law-colored fill | Yes | Wraps base `<Slider>`. Props: thresholds (array of {value, lawColor}), isViolating. |
| `<ViewportComfortGauge>` | Corner-anchored 2R+T display | Yes | Props: twoRPlusT, pitchAngle, status. Rendered as drei `<Html>` with `transform={false}`. |
| `<ElementDetailPanel>` | Right panel section for clicked element detail | Yes | Props: elementName, currentValue, lawEvaluations (array), onFix. |
| `<LawActivationDot>` | Small colored dot next to toggles showing which law is active | Yes | Props: lawColor, isActive. 8px circle. |
| `<FixButton>` | Branded "Fix →" action that triggers slider animation | Yes | Props: onClick, lawColor. Styled as text button with law-color accent. |

### 13.3 Storybook Stories Structure

```
stories/
├── 3d-lab/
│   ├── PresetChip.stories.tsx         # All variants: scenario, violation, active states
│   ├── PresetChipStrip.stories.tsx    # Scrollable strip with grouped presets
│   ├── ComplianceLawCard.stories.tsx  # PD 1096, RA 9514, BP 344, BP 220 variants
│   ├── ViolationRow.stories.tsx       # With/without Fix button, different severities
│   ├── ComplianceSummaryBadge.stories.tsx  # ALL PASS, N ISSUES, N WARNINGS
│   ├── DimensionSlider.stories.tsx    # With threshold markers, violation state
│   ├── ViewportComfortGauge.stories.tsx  # Different 2R+T values and statuses
│   └── ElementDetailPanel.stories.tsx  # Multi-law evaluation display
```

---

## 14. Microinteractions and Transitions

### 14.1 Interaction Feedback Timing

| Action | Feedback | Timing |
|---|---|---|
| Slider drag | 3D model updates in real-time | < 16ms (every frame) |
| Slider crosses threshold | Track color shifts, slider "bumps" | Immediate, 100ms bump |
| Preset click | Parameters animate to new values | 300ms ease-out per slider |
| Preset click | 3D geometry color transition | 400ms color lerp |
| Preset click | Right panel card state changes | 200ms fade transition |
| Toggle activation | Law card appears in right panel | 250ms slide-down |
| Toggle deactivation | Law card disappears | 200ms slide-up + fade |
| Element click | Viewport highlight pulse | 200ms scale pulse |
| Element click | Non-selected elements dim | 300ms opacity transition |
| "Fix" button click | Slider animates to compliant value | 500ms ease-in-out |
| "Fix" button click | 3D color transitions to neutral | 400ms color lerp |
| Camera view change | Camera position lerp | 600–800ms ease-out |
| Panel collapse | Panel width animation | 200ms ease-out |

### 14.2 Violation Color Transition

When a parameter crosses a code threshold, the affected geometry element transitions from one color to another. This transition must be:

- **Smooth:** Color lerp over 400ms, not an instant snap. The student's eye tracks the change.
- **Directional:** Transitioning *into* violation (neutral → red) uses a slightly slower ease (400ms). Transitioning *out of* violation (red → neutral) uses a faster ease (250ms). The violation registers more strongly because it lingers slightly longer.
- **Priority-aware:** If the element already has a violation color and a higher-severity violation fires, the transition goes directly to the new (higher severity) color — it does not pass through neutral first.

---

## 15. Onboarding and First-Run Experience

### 15.1 First-Run Sequence

On the student's first visit to the Stairway Configurator, a lightweight onboarding sequence runs. It is NOT a modal overlay and NOT a multi-step wizard. It is a series of inline UI hints:

1. **On load:** A single-line toast at the top of the viewport: "Drag a slider or tap a violation preset to explore." Auto-dismisses after 5 seconds. Dismisses on any interaction.

2. **On first preset click:** The right panel's first violation row briefly pulses a subtle highlight border to draw attention to where the explanation lives.

3. **On first "Fix" click:** A brief confetti-free confirmation: the summary badge animates from "1 ISSUE" → "ALL PASS" with a satisfying green transition.

4. **After 3 interactions:** No more hints. The student has demonstrated they understand the loop.

### 15.2 What We DON'T Do

- No tutorial modals that block the 3D viewport.
- No multi-step walkthroughs that require clicking "Next" 5 times.
- No video explanations that play before the student can interact.
- No "welcome" overlay that demands the student's email.

The module is designed to be self-evident. If the student needs a tutorial to use it, the design has failed.

---

## 16. Accessibility

### 16.1 WCAG 2.1 AA Requirements

- **Color contrast:** All text in panels meets 4.5:1 contrast ratio against its background. Violation colors in the 3D viewport are supplemented by pattern (cross-hatching for color-blind users) as a future enhancement.
- **Keyboard navigation:** All sliders, toggles, presets, and buttons are keyboard-accessible. Tab order follows the logical flow: presets → project classification → geometry sliders → right panel cards.
- **Screen reader:** Each violation row has `aria-label` text that describes the violation completely. Example: "PD 1096 violation: Maximum riser height is 200 millimeters. Current value is 210 millimeters, exceeding the limit by 10 millimeters."
- **Reduced motion:** If `prefers-reduced-motion` is set, all transitions are instant (0ms). Color changes still occur but without lerp animation.
- **Touch targets:** All interactive elements ≥ 48×48px.

### 16.2 3D Accessibility Considerations

3D content is inherently challenging for screen reader users. The right panel provides a complete text-based representation of all compliance information, making the 3D viewport supplementary — not the only way to access the information. A screen reader user can navigate the entire compliance report without interacting with the 3D model.

---

## 17. UX Metrics and Success Criteria

### 17.1 Engagement Metrics

| Metric | Target | Measurement |
|---|---|---|
| Time to first violation explored | < 30 seconds | Analytics: time from module load to first preset click or slider-triggered violation |
| Preset click rate (first session) | > 70% of users click at least 1 preset | Analytics: preset click events |
| "Fix" button usage | > 50% of users who see a violation click "Fix" at least once | Analytics: fix button click events |
| Average violations explored per session | ≥ 3 different violation types | Analytics: distinct violation rule IDs triggered |
| Return rate | > 40% return within 7 days | Analytics: module revisit tracking |
| Session duration | 3–8 minutes (sweet spot) | Analytics: time on module |

### 17.2 Learning Metrics

| Metric | Target | Measurement |
|---|---|---|
| Post-module quiz accuracy (stair code questions) | ≥ 70% on first attempt | Quiz integration: in-module questions |
| Riser height threshold recall | > 80% correctly recall "200 mm" after 1 session | Spaced repetition quiz on riser height |
| Multi-law awareness | > 60% can identify which laws apply to exit stairs | Quiz: "Which laws govern an exit stair?" |
| Conflict detection | > 50% can explain a BP 220 vs PD 1096 riser conflict | Quiz: scenario-based conflict question |

### 17.3 UX Quality Signals

| Signal | Healthy | Unhealthy |
|---|---|---|
| Viewport interaction ratio | > 60% of time spent in viewport or sliders | < 40% (student is lost in panels) |
| Panel scroll depth | Right panel scrolled > 50% | Right panel never scrolled (student isn't reading results) |
| Panic clicks (rapid random clicking) | < 5% of sessions | > 15% (UI is confusing) |
| Orbit beyond constraints | < 3% of sessions hit orbit limits | > 10% (constraints are too tight) |
| "Back to default" usage | < 20% of interactions | > 40% (student keeps getting lost) |

---

## Appendix A: Research Sources

1. Kapur, M. (2008). Productive failure. *Cognition and Instruction*, 26(3), 379–424.
2. Kapur, M. (2014a). Productive failure in learning math. *Cognitive Science*, 38(5), 1008–1022.
3. Kapur, M. (2015). Learning from productive failure. *Learning: Research and Practice*, 1(1), 51–65. URL: https://www.tandfonline.com/doi/10.1080/23735082.2015.1002195
4. Wong, S. S. H. & Lim, S. W. H. (2022). The derring effect: Deliberate errors enhance learning. *Journal of Experimental Psychology: General*, 151(1), 25–40.
5. Loibl, K. & Rummel, N. (2014). Knowing what you don't know makes failure productive. *Learning and Instruction*, 34, 74–85.
6. Loibl, K., Roll, I., & Rummel, N. (2017). Towards a theory of when and how problem solving followed by instruction works: A meta-analysis. *Educational Psychology Review*, 29(4), 693–715.
7. Sinha, T. & Kapur, M. (2021). When problem solving followed by instruction works: Evidence for productive failure. *Review of Educational Research*, 91(5). URL: https://journals.sagepub.com/doi/10.3102/00346543211019105
8. Schwartz, D. L. & Martin, T. (2004). Inventing to prepare for future learning: The hidden efficiency of encouraging original student production in statistics instruction. *Cognition and Instruction*, 22(2), 129–184.
9. Narciss, S. et al. (2025). Learning from errors and failure in educational contexts. *British Journal of Educational Psychology*. URL: https://pmc.ncbi.nlm.nih.gov/articles/PMC11803059/
10. Mayer, R. E. (2001). *Multimedia Learning*. Cambridge University Press. (Dual-channel processing, coherence principle, signaling principle, segmenting principle)
11. Sweller, J. (1988). Cognitive load during problem solving. *Cognitive Science*, 12(2), 257–285.
12. Roediger, H. L. & Karpicke, J. D. (2006). Test-enhanced learning. *Psychological Science*, 17(3), 249–255.

---

*This document governs all UX decisions for the Stairway Configurator. When in doubt about a design choice, return to Section 3 (Viewport Sanctity) and Section 2 (Research Foundation). The model is the primary teacher. The panels are the reference materials. The presets are the lesson plan.*

*Last updated: April 9, 2026*
