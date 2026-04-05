# UX/UI Strategy: Unified Wall Configurator

---

## 1. User Research & Cognitive Context

### 1.1 Primary User Persona

**Role:** Site estimator or junior quantity surveyor on a Philippine construction project.  
**Device context:** Desktop or tablet on-site; mid-range hardware, intermittent internet.  
**Task context:** Producing a material takeoff for a wall scope before issuing a purchase request.  
**Time pressure:** Estimating is a supporting task, not the primary job. The user needs answers in minutes, not a learning curve measured in sessions.

---

### 1.2 Pain Points: Disjointed Calculators vs. Unified System

| Pain point | Current state (separate calculators) | Unified system resolution |
|---|---|---|
| **Double-entry of geometry** | User enters L × H separately in each tool — CHB calculator, paint calculator, plaster calculator | One geometry entry block drives all downstream layers |
| **Lost opening deduction** | User manually subtracts door/window area before entering paint quantities — error-prone | Opening deduction is computed once and applied automatically to all finish layers |
| **Side ambiguity** | Paint calculator has no side context; user guesses whether to double | Explicit "1 side / 2 sides" toggle with live area preview drives all side-dependent layers |
| **Inconsistent waste factors** | User applies different or no waste to each material | Sensible defaults per material exposed as editable fields, not hidden constants |
| **No procurement output** | Most calculators output raw liters or kg with no packaging rounding | Three-tier output: theoretical → adjusted → procurement in commercial units |
| **Mental re-entry fatigue** | Switching between tools loses context; user re-reads spec sheets each time | Additive layer stack shows the complete sequence in one scrollable view |

---

### 1.3 Cognitive Load Reduction Priorities

**Priority 1 — Sequence is not negotiable.** The 7-step flow maps to the physical construction sequence: core → openings → sides → treatment → finish → output. Users who understand construction will recognize this order immediately. Do not reorder steps.

**Priority 2 — Gross vs. net must be made visible.** The single highest risk of estimation error is applying finish to gross area when openings exist. The UI must show both numbers simultaneously in a persistent summary panel and label them explicitly: "Gross area" and "Net area after openings."

**Priority 3 — Progressive disclosure.** Drywall seam length and specialty coatings are optional inputs. They must not appear in the default view. Surface them only after the user has established core + geometry.

**Priority 4 — Results must be self-explanatory.** The BOM output must be readable by a foreman with no software training. Labels must use trade language ("CHB pcs", "40-kg bags", "16 L pails"), not variable names.

---

## 2. Information Architecture & User Flow

### 2.1 Screen States

The configurator operates as a **single-page progressive form** — no full page navigations. The 7 steps are panels that appear in sequence. Completed steps collapse into a summary chip (editable on click). The active step is fully expanded.

```
┌─────────────────────────────────────────────────────────────────────┐
│  PERSISTENT AREA SUMMARY BAR (always visible at top)                 │
│  Gross: — sqm   │   Opening: — sqm   │   Net: — sqm   │   Sides: —  │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│  Step 1 — Core Type          [ACTIVE / EXPANDED]                      │
├──────────────────────────────────────────────────────────────────────┤
│  Step 2 — Wall Geometry      [LOCKED until Step 1 complete]           │
├──────────────────────────────────────────────────────────────────────┤
│  Step 3 — Openings           [LOCKED until Step 2 complete]           │
├──────────────────────────────────────────────────────────────────────┤
│  Step 4 — Sides              [LOCKED until Step 2 complete]           │
├──────────────────────────────────────────────────────────────────────┤
│  Step 5 — Treatment Layers   [LOCKED until Step 1 + 4 complete]       │
├──────────────────────────────────────────────────────────────────────┤
│  Step 6 — Finish Layers      [LOCKED until Step 5 visited]            │
├──────────────────────────────────────────────────────────────────────┤
│  Step 7 — Bill of Materials  [AUTO-UPDATES as any step changes]       │
└──────────────────────────────────────────────────────────────────────┘
```

### 2.2 Collapsed Step Chip Pattern

Once a step is complete, it collapses to a one-line summary chip showing its key values. Example:

```
✓  Step 2 — Geometry      5.0 m × 3.0 m × 2 walls = 30.00 sqm    [Edit]
✓  Step 3 — Openings      2 doors + 1 window = 4.41 sqm deducted   [Edit]
```

Clicking "Edit" re-expands the step panel inline — no navigation away from the page.

### 2.3 User Flow Map

```
START
  │
  ▼
[1] Select Core Type
  │   CHB  ──────────────────────────────────────┐
  │   Drywall  ───────────────────────────────────┤ → seeded layer defaults per type
  │   Existing Finished Wall  ────────────────────┘
  │
  ▼
[2] Enter Wall Geometry
  │   Length (m) / Height (m) / Wall Count
  │   → Gross area computed and shown live
  │
  ▼
[3] Enter Openings (optional — can skip)
  │   Add opening rows: label / width / height / qty
  │   → Opening area deducted live
  │   → Net area updated in persistent summary bar
  │
  ▼
[4] Choose Sides
  │   [1 Side]  [Both Sides]  (toggle)
  │   → Finish area = net area × sides, shown in bar
  │
  ▼
[5] Select Treatment Layers
  │   Layer cards appear based on core type
  │   Each layer: toggle ON/OFF + wastage % input
  │   (CHB: plaster, skim; Drywall: board, tape, compound; Existing: skim)
  │
  ▼
[6] Select Finish Layers
  │   Primer: toggle ON/OFF + coverage rate (default 7 sqm/L)
  │   Topcoat: toggle ON/OFF + coat count stepper + coverage rate
  │   → Live BOM preview updates in Step 7 panel
  │
  ▼
[7] View Bill of Materials
      Three-tier table + area summary card + assumptions footer
      [Print / Export] action
```

---

## 3. UI Component Strategy: Additive Layers & Geometry

### 3.1 Persistent Area Summary Bar

**Location:** Fixed below the configurator title. Always in viewport.  
**Purpose:** Ensures the user always knows their gross/net distinction regardless of which step is open.

```
┌─────────────────────────────────────────────────────────────────────────┐
│  WALL AREA                                                               │
│  Gross  30.00 sqm   │   Openings  4.41 sqm   │   Net  25.59 sqm         │
│                                                  Finish area: 25.59 sqm  │
└─────────────────────────────────────────────────────────────────────────┘
```

- All four values update reactively as the user enters data.
- "Finish area" label updates to show "× 2 = 51.18 sqm" when Both Sides is selected.
- Typography: eyebrow label in DM Mono uppercase 9px; values in DM Mono tabular-nums 16px.
- Background: `bg-card border-b border-border` — visually distinct from the step panels beneath it.

**Never hide or collapse this bar.** It is the structural anchor that separates gross from net throughout the entire flow.

---

### 3.2 Core Type Selector Cards (Step 1)

Three horizontal cards (desktop) or vertical stack (tablet/mobile).

Each card contains:
```
[EYEBROW — DM Mono uppercase 9px]
Core Type Label (Inter medium 16px)
──────────────────────
Finishing sequence preview:
  1. CHB core
  2. Cement-sand plaster
  3. Skim coat (optional)
  4. Primer
  5. Topcoat
──────────────────────
Typical use: Interior/exterior masonry walls
```

**Selected state:** Left border accent `border-l-[3px] border-l-primary` with `bg-card` shadow. **Unselected state:** `bg-muted/30 border border-border`. No color fill on unselected — selection should feel like a decision, not a decoration.

---

### 3.3 Openings Dynamic List (Step 3)

```
┌───────────────────────────────────────────────────────────────┐
│  OPENINGS                                                      │
│  Label            Width (m)   Height (m)   Qty     Area       │
│  ─────────────────────────────────────────────────────────    │
│  Door A           [0.90]      [2.10]       [1]     1.89 sqm  [✕]│
│  Window 1         [1.20]      [1.20]       [2]     2.88 sqm  [✕]│
│  ─────────────────────────────────────────────────────────    │
│  Total opening area:  4.77 sqm                                 │
│                                                                │
│  [+ Add Opening]                                               │
└───────────────────────────────────────────────────────────────┘
```

- Area column auto-calculates: `width × height × qty`, shown in DM Mono.
- Total updates live.
- If total opening area ≥ gross area: inline error banner below the list, "Continue" disabled.
- The persistent area summary bar updates simultaneously.

---

### 3.4 Sides Toggle (Step 4)

```
┌──────────────────────────────────────────────────┐
│  TREATMENT SIDES                                   │
│                                                    │
│  [  1 Side  ]    [  Both Sides  ]                  │
│                                                    │
│  Plaster, skim, primer, and paint quantities       │
│  apply to 1 face (25.59 sqm).                      │
└──────────────────────────────────────────────────┘
```

- Toggle is a two-state segmented control — not a checkbox or dropdown.
- The sentence below the toggle updates in real time: "...apply to 2 faces (51.18 sqm)" when Both Sides is selected.
- This explanation must be present every time the toggle is shown — the side selector is the highest-risk ambiguity point in the entire form.

---

### 3.5 Additive Layer Stack (Steps 5 & 6)

Each layer is rendered as a **Layer Card** — a horizontally constrained row with four zones:

```
┌─────────────────────────────────────────────────────────────────────────┐
│  ● [TOGGLE]  Cement-Sand Plaster (Palitada)          [BASIS: area/side]  │
│              Mix 1:2 · Thickness 12.7 mm · 1 or both sides              │
│                                    Wastage: [5%  ▾]                      │
└─────────────────────────────────────────────────────────────────────────┘
```

**Zones:**
1. **Toggle** — ON (filled cobalt blue pill) / OFF (muted).
2. **Layer label + spec line** — material name in Inter medium 14px; sub-spec in Inter 12px muted.
3. **Basis badge** — DM Mono uppercase pill: "AREA / SIDE" or "PIECE" or "LINEAR".
4. **Wastage field** — inline editable number input, 3-char width.

**Layer ordering is fixed and reflects the construction sequence.** CHB always appears before plaster; plaster before skim; skim before primer; primer before topcoat. The order communicates the dependency chain without text explanation.

**Disabled layers** (OFF state) remain visible in the stack at reduced opacity. They are not removed from the DOM. This allows the user to see the complete sequence and opt back in without confusion.

**Expandable advanced inputs** for layers that have additional parameters:

For TOPCOAT specifically:
```
▼ Topcoat Paint (2 coats)
   Coverage rate: [7  ] sqm/L/coat
   Number of coats: [ − ] 2 [ + ]
```

---

### 3.6 Layer Stack State — CHB Core

```
● [ON]  CHB Core Units                    [BASIS: PIECE]
         0.40 m × 0.20 m face · 12.5 pcs/sqm
                                           Wastage: [5%]

● [ON]  Cement-Sand Plaster               [BASIS: AREA / SIDE]
         Mix 1:2 · Thickness 12.7 mm
                                           Wastage: [5%]

○ [OFF] Skim / Putty Coat                 [BASIS: AREA / SIDE]
         Surface correction only
                                           Wastage: [10%]

● [ON]  Primer                            [BASIS: AREA / SIDE]
         Coverage: 7 sqm/L · 1 coat
                                           Wastage: [10%]

● [ON]  Topcoat Paint                     [BASIS: AREA / SIDE]
         Coverage: 7 sqm/L · 2 coats
                                           Wastage: [10%]
```

### 3.7 Layer Stack State — Drywall Core

```
● [ON]  Gypsum Board 4'×8'                [BASIS: PANEL / SIDE]
         2.973 sqm per board
                                           Wastage: [5%]

● [ON]  Mesh Joint Tape                   [BASIS: LINEAR]
         Applied at seams and corners
                                           Wastage: [10%]

● [ON]  Joint Compound                    [BASIS: LINEAR]
         Boysen · 12 lm/L
                                           Wastage: [10%]
         Seam length: [   ] lm  ← user-editable; auto if blank

● [ON]  Primer                            [BASIS: AREA / SIDE]
         Coverage: 7 sqm/L · 1 coat
                                           Wastage: [10%]

● [ON]  Topcoat Paint                     [BASIS: AREA / SIDE]
         Coverage: 7 sqm/L · 2 coats
                                           Wastage: [10%]
```

---

## 4. Bill of Materials: Results Visualization

### 4.1 Three-Tier Output Rationale

| Tier | Label | Purpose | User action |
|---|---|---|---|
| Theoretical | "Formula Qty" | What the formula computes at 0% waste | Reference — not for ordering |
| Adjusted | "With Wastage" | Formula qty × (1 + waste factor) | Cross-check against field experience |
| Procurement | "Order Qty" | Adjusted qty rounded to commercial package sizes | **This is what to write on the purchase request** |

**The Procurement column is the primary column.** It must be the rightmost, largest, and most visually prominent. Theoretical is reference data — present but subdued.

---

### 4.2 BOM Table Layout

```
┌───────────────────────────────────────────────────────────────────────────────────┐
│  BILL OF MATERIALS                                             25.59 sqm net area  │
│  CHB Wall · 1 Side · Plaster + Primer + Topcoat                                   │
├─────────────────────┬────────────┬─────────────┬───────────────┬──────────────────┤
│  MATERIAL           │  UNIT      │  FORMULA QTY│  +WASTAGE     │  ORDER QTY ▲     │
├─────────────────────┼────────────┼─────────────┼───────────────┼──────────────────┤
│  CHB Units          │  pcs       │  319.9      │  335.8        │  336 pcs         │
│  Cement (plaster)   │  40-kg bag │  5.18 bags  │  5.44 bags    │  6 bags          │
│  Sand (plaster)     │  m³        │  0.289 m³   │  0.303 m³     │  0.31 m³         │
│  Primer             │  L         │  3.66 L     │  4.02 L       │  2 × 4 L cans    │
│  Topcoat Paint      │  L         │  7.31 L     │  8.04 L       │  1 × 16 L pail   │
└─────────────────────┴────────────┴─────────────┴───────────────┴──────────────────┘
```

**Column design rules:**
- "ORDER QTY" column: `font-mono font-medium text-sm text-foreground` — full opacity.
- "FORMULA QTY" and "+WASTAGE" columns: `font-mono text-sm text-muted-foreground` — visible but receded.
- Column header "ORDER QTY" carries a small upward-triangle icon (▲) to indicate it is the primary column.
- Every row where Procurement differs substantially from Adjusted shows a tooltip on the Order Qty cell: "Rounded up to nearest whole bag / board / pail."

---

### 4.3 Area Summary Card (top of BOM)

```
┌─────────────────────────────────────────────────────────────────────┐
│  AREA BREAKDOWN                                                      │
│  ─────────────────────────────────────────────────────────────────  │
│  Gross wall area    5.0 m × 3.0 m × 2 walls     30.00 sqm           │
│  Opening deductions  2 doors + 1 window          −4.41 sqm           │
│  Net wall area                                   25.59 sqm           │
│  Finish area (1 side)                            25.59 sqm           │
└─────────────────────────────────────────────────────────────────────┘
```

This card appears at the very top of the BOM output, before the materials table. Its presence makes the gross → net deduction explicit for every person who reads the output, including someone who did not configure the form themselves.

---

### 4.4 Assumptions Footer

Every BOM printout ends with a fixed assumptions block:

```
─────────────────────────────────────────────────────
ENGINEERING CONSTANTS USED
─────────────────────────────────────────────────────
CHB face size: 0.40 m × 0.20 m (12.5 pcs/sqm before waste)
Plaster thickness: 12.7 mm (1/2 inch minimum)
Plaster mix: 1 cement : 2 sand by volume
Dry-volume factor: 1.33
Cement bag: 40 kg at 1,440 kg/m³ bulk density
Paint coverage: 7 sqm/L/coat (configurable)
Wastage: CHB 5% · Plaster 5% · Paint 10%
─────────────────────────────────────────────────────
Quantities are estimates for procurement planning.
Verify with licensed estimator before issuing purchase order.
─────────────────────────────────────────────────────
```

This block is always present in print output. It must never be hidden behind a toggle.

---

### 4.5 Print / Export Action

- "Print BOM" button: opens browser print dialog with a print-optimized CSS class applied. Print view shows: Area Summary card + BOM table + Assumptions footer. Navigation, step panels, and area bar are hidden in print.
- Secondary: "Copy as text" — copies BOM rows as tab-delimited text for pasting into spreadsheets.

---

## 5. Usability Testing Protocol

### 5.1 Test Setup

**Participants:** 5 participants minimum per round. Target: site estimators, junior engineers, or draftspeople with exposure to material takeoff tasks. Philippine construction context preferred but not required.  
**Format:** Moderated task-based session, 30–45 minutes. Remote acceptable (screen share + video).  
**Device:** Desktop or tablet (priority hardware). One session on mobile to flag breakpoints.  
**Prototype fidelity:** Medium-fidelity interactive prototype in Figma or HTML/JS. All three BOM tiers must be functional (not placeholder values) for Scenario 3.

---

### 5.2 Scenario 1 — Opening Deduction Awareness

**Objective:** Validate that users understand the distinction between gross area and net area, and that opening deductions happen automatically.

**Task brief given to participant:**  
*"You are estimating materials for a CHB partition wall: 4 meters long, 3 meters high, with one door (0.90 m × 2.10 m) and one window (1.20 m × 1.20 m). Set this up in the configurator and identify the area that will be used to calculate plaster quantities."*

**Success criteria:**
- User enters the wall geometry in Step 2 without manually subtracting the opening area.
- User adds openings in Step 3 and observes the net area update in the persistent summary bar.
- When asked "What area will be used for plaster?" the user answers with the net area (25.59 sqm), not the gross area (12 sqm of the single wall, or 24 sqm gross).

**Failure signals to observe:**
- User attempts to pre-subtract openings from the length/height input before entry.
- User cannot locate the net area value after completing Step 3.
- User believes the gross area is used for plaster when openings are entered.

**Probe question after task:** "Where in the screen would you look to confirm how much area the plaster calculation is based on?"

---

### 5.3 Scenario 2 — Side Selection Ambiguity

**Objective:** Validate that users understand the 1 side / 2 sides distinction and can correctly identify when to change it, without guidance from the facilitator.

**Task brief given to participant:**  
*"You're finishing both faces of a drywall partition between two offices — gypsum boards on both sides, with primer and paint on both sides. Configure this correctly in the configurator."*

**Success criteria:**
- User selects "Both Sides" in Step 4 without prompting.
- User can read the updated finish area from the persistent summary bar (net area × 2).
- The BOM board count and paint quantities reflect the both-sides multiplier, and the user can articulate why the board count is roughly double the one-side scenario.

**Failure signals to observe:**
- User selects "1 Side" and does not notice or question the output.
- User selects "Both Sides" but cannot find where the doubled finish area is shown.
- User doubles the geometry inputs (wall count × 2) instead of using the sides toggle.

**Probe question after task:** "If you had set this to one side instead, what quantity would change in the bill of materials — and by how much?"

---

### 5.4 Scenario 3 — Procurement Tier Interpretation

**Objective:** Validate that the three-tier BOM output is correctly interpreted — specifically that the "Order Qty" column, not the formula or wastage column, is what the user takes to a supplier.

**Task brief given to participant:**  
*"You've completed the configuration. Your site foreman is calling you right now asking: 'How many bags of cement do I need to order for plastering?' Look at the results and give them a number."*

**Success criteria:**
- User reads from the "Order Qty" column (procurement tier), not from the "Formula Qty" or "+Wastage" columns.
- User reads the rounded, whole-unit value (e.g., "6 bags"), not a decimal (e.g., "5.44 bags").
- User does not need to perform any additional mental arithmetic.

**Failure signals to observe:**
- User reads the decimal adjusted quantity and rounds manually ("about 5 and a half bags").
- User reads the theoretical quantity (no waste applied).
- User cannot distinguish which column to use without asking the facilitator.
- User is confused by three columns having different numbers for the same material.

**Probe question after task:** "There are three numbers for cement in this table. Can you tell me in your own words what each one means and which one you'd actually use?"

---

### 5.5 Metrics to Capture Per Scenario

| Metric | Capture method |
|---|---|
| Task completion rate | Binary: did the user arrive at the correct answer without facilitator correction? |
| Time on task | Stopwatch: from task brief read to correct answer |
| Error count | Facilitator tally: incorrect inputs entered before successful completion |
| Think-aloud flags | Note verbatim any confusion about gross vs. net, sides, or tier interpretation |
| Net area probe accuracy | Post-task: can user point to net area value without prompting? |
| Procurement column recognition | Post-task: can user identify "Order Qty" as the actionable column? |

---

### 5.6 Pass/Fail Thresholds for Design Release

| Criterion | Threshold |
|---|---|
| Scenario 1 — Net area identified correctly | ≥ 4 of 5 participants (80%) |
| Scenario 2 — Both sides applied correctly without guidance | ≥ 4 of 5 participants (80%) |
| Scenario 3 — Procurement column used for ordering | ≥ 5 of 5 participants (100%) |
| No participant believes finish applies to gross area when openings are entered | 0 failures tolerated |

If any threshold is not met, the failing component is redesigned and re-tested before the feature is released.
