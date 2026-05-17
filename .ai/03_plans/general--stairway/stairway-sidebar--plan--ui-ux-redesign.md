# Stairway Configurator Sidebar UI/UX Redesign Plan

Date: 2026-05-13
Route: `/dashboard/3d-lab/stairway-configurator`
Status: planning only — do not implement from this document until approved
Target files for later implementation:
- `src/features/3d-lab/components/templates/StairwayWorkbenchPanels.tsx`
- `src/features/3d-lab/components/templates/ComplianceReportPanel.tsx`
- `src/features/3d-lab/config/modules/08-vertical/stairway-configurator.ts` only if default/range values are approved

## 1. Planning objective

The sidebars must stop feeling like stacked marketing cards and become a professional 3D learning workbench:

- left sidebar = compact property inspector for the stair dimensions the learner manipulates;
- center viewport = dominant 3D thinking space;
- right sidebar = compact compliance inspector showing the four law layers and live violations;
- modal/drawer = deeper legal/source/repair explanation.

The goal is not merely “less padding.” The goal is better hierarchy, better density, better learning feedback, and less decision fatigue.

## 2. Evidence inspected

Skills used:
- `enterprise-saas-ui-ux`
- `edtech-learning-ui-ux`
- `3d-platform-ui-ux`
- `ui-density-hierarchy-audit`

Repo/context inspected:
- `.ai/09_archive/store/MODULES/3D/Stairway-Configurator/V2/stairway-configurator-ux-implementation-plan.md`
- `.ai/09_archive/store/MODULES/3D/Stairway-Configurator/V2/stairway-configurator-innovation-research.md`
- `.ai/03_plans/stairway-workbench-prototypes/prototype-comparison.md`
- `src/features/3d-lab/config/modules/08-vertical/stairway-configurator.ts`
- `src/features/3d-lab/config/modules/08-vertical/stairway-computation.ts`
- `src/features/3d-lab/config/modules/08-vertical/stairway-constants.ts`
- `src/features/3d-lab/components/templates/StairwayWorkbenchPanels.tsx`
- `src/features/3d-lab/components/templates/ComplianceReportPanel.tsx`

Current screenshot/measurement generated:
- `.ai/03_plans/stairway-workbench-prototypes/sidebar-planning-current-1440x820.png`

Current measured state at 1440×820:
- Left sidebar: 286×639, no scroll, outer `p-2.5`, gap `2`.
- Right sidebar: 386×639, no scroll, outer `p-2.5`.
- Left top `Stair information` section currently measures about 266×202, too tall for a compact read-only status area.
- Step body section currently measures about 266×185.
- Headroom and handrail standalone cards currently measure about 266×104 each.
- Right law rows are equal at about 143px each, which is structurally good, but internal header/content padding still feels bloated.

## 3. Non-negotiables from Philip’s direction

Keep:
- four visible law categories on the right: RA 9514, BP 344, PD 1096, BP 220;
- violation/check pills inside each law row;
- click opens modal with full law-specific checks;
- left sidebar structure:
  1. Stair information
  2. Step body: riser height, tread depth, clear stair width
  3. Headroom clearance
  4. Handrail height
- full-width sliders;
- no sidebar scrolling at normal desktop/laptop height;
- existing SlateCamp primitives where practical.

Avoid:
- nested card-in-card visuals;
- repeated `p-4`/`p-6` style spacing;
- stair type/scenario/law/occupancy/accessibility dropdowns in the default sidebar;
- Safe Preset / Study Cases in the default sidebar;
- long teaching paragraphs inside the sidebars;
- decorative glows, heavy borders, or fake premium effects;
- changing geometry/computation while doing visual refactor.

## 4. Core UX thesis

The first-glance experience should answer four questions in under 3 seconds:

1. Is this stair currently safe/legal enough?
2. Which dimension should I manipulate?
3. What changed in the model when I moved the slider?
4. Which law did I violate, and how do I repair it?

The sidebars should not try to teach everything at once. The primary learning loop is:

Observe safe default → manipulate one dimension → see 3D geometry change → see law pill change → click for explanation/repair.

## 5. Best first-glance information

### 5.1 Left sidebar first glance

The left sidebar should show only immediate geometry context and manipulable dimensions.

Top read-only strip: `Stair information`

Recommended first-glance metrics:

| Metric | Why it belongs | Display |
|---|---|---|
| Steps | Learner understands total flight count | `12` |
| Rise | Overall vertical height | `2,160 mm` |
| Run | Overall horizontal footprint | `3,080 mm` |
| 2R+T | Core ALE comfort formula | `640 mm` |
| Pitch | Spatial steepness | `32.7°` |
| Width | Current clear width | `1,200 mm` |

But this should not be six mini-cards. Use a compact data grid/table-like strip:

- no individual rounded boxes per metric;
- two or three columns;
- label/value rows with tight rhythm;
- tabular numerals;
- one subtle background panel only.

Reason: individual metric boxes create the current padded-card problem.

### 5.2 Left sidebar controls

Only five controls are visible by default:

1. Riser height
2. Tread depth
3. Clear stair width
4. Headroom clearance
5. Handrail height

Each control row must show:

- label;
- current value + unit;
- full-width slider;
- no helper paragraph;
- optional tiny pass/issue marker only when failing.

Do not repeat the value in both the card header and slider label if it creates clutter. Preferred pattern:

`Riser height                         180 mm`
`[ full width slider track ]`

### 5.3 Right sidebar first glance

The right sidebar should answer:

- total number of active violations;
- which law layer is affected;
- which check failed;
- whether a law is currently only an overlay/context or is actively applicable.

Keep the four-law row model:

1. RA 9514 — Fire Code
2. BP 344 — Accessibility
3. PD 1096 — NBCP
4. BP 220 — Housing

For each law row, first glance should show:

- short law label;
- active/pass badge;
- one-line scope in muted text;
- compact pills for failed checks, or a small pass summary if none;
- color identity as a thin left rail or subtle dot, not a bulky accent block.

Do not show every passing check as equal visual weight. Passing checks can be summarized; failing checks deserve the primary pill space.

## 6. Recommended default values

Current defaults from `stairway-configurator.ts`:

- riser height: 185 mm
- tread depth: 250 mm
- clear width: 900 mm
- headroom: 2100 mm
- handrail height: 900 mm
- num risers: 12

Current computed state:

- 2R+T = 620 mm
- pitch = 36.5°
- total rise = 2220 mm
- total run = 2750 mm

Problem:
- If RA 9514 and BP 344 are evaluated as forced overlays for teaching, the current 185 mm riser violates RA 9514 max 180 mm, and 900 mm width violates BP 344 accessible width 1200 mm.
- This makes the module open with violations even though Philip’s target direction has repeatedly been a premium, calm, passing default where violations appear when the learner intentionally changes values.

Recommended default for a calm passing first load:

| Parameter | Recommended default | Why |
|---|---:|---|
| Riser height | 180 mm | Passes RA 9514 max riser and PD 1096/BP 220. Teaches fire-code strictness. |
| Tread depth | 280 mm | Passes local 200 mm minimum and aligns with international/comfortable stair intuition. |
| Clear stair width | 1200 mm | Passes BP 344 accessible route width overlay and all local width minimums. |
| Headroom | 2100 mm | Safely above PD 1096 2000 mm. |
| Handrail height | 900 mm | Fits PD 1096 800–900 and BP 344 upper rail height. |
| Risers | 12 | Keep existing unless geometry/layout needs change. |

Computed recommended default:

- 2R+T = 640 mm, inside Blondel comfort range 600–650 mm.
- pitch = 32.7°, comfortable.
- total rise = 2160 mm.
- total run = 3080 mm.

This default is more educational because it starts from “this is what good looks like,” then learners can create violations deliberately.

## 7. Implemented slider ranges and step values

Philip corrected the planning direction: the sliders must go well beyond legal limits so learners can deliberately create obvious violations. The default should still begin calm and instructional, but each control must have enough travel to show failure states clearly.

Implemented ranges:

| Control | Min | Max | Step | Default | Reason |
|---|---:|---:|---:|---:|---|
| Riser height | 50 mm | 900 mm | 5 mm | 180 mm | Lets learners exaggerate RA 9514 / PD 1096 / BP 220 riser violations. |
| Tread depth | 50 mm | 900 mm | 5 mm | 280 mm | Shows too-shallow tread violations and extreme tread behavior. |
| Clear stair width | 300 mm | 2400 mm | 25 mm | 1200 mm | Shows narrow BP 220 / PD 1096 / RA 9514 / BP 344 failures while allowing oversized widths. |
| Headroom clearance | 1200 mm | 3200 mm | 50 mm | 2100 mm | Makes below-2000 mm headroom violations obvious. |
| Handrail height | 300 mm | 1600 mm | 25 mm | 900 mm | Shows below/above acceptable handrail bands and BP 344 rail references. |

Threshold annotations still matter later:
- riser: 180 mm RA 9514, 200 mm PD 1096, 250 mm BP 220;
- tread: 200 mm local minimum;
- width: 600 / 750 / 900 / 1100 / 1200 mm relevant law thresholds;
- headroom: 2000 mm;
- handrail: 700 / 800 / 900 mm references.

Do not narrow the ranges in the implementation just to make the UI look tidy. The module’s learning value depends on intentionally crossing thresholds.

## 8. Visual design direction

### 8.1 Replace “cards everywhere” with inspector sections

Current left panel has multiple card shells:

- Card wrapper
- Header padding
- Separator
- Content padding
- Inner metric boxes
- Slider label/value layout

This creates padding accumulation.

Proposed left panel structure:

- one outer panel background;
- one compact `Stair information` block with a table-like metrics grid;
- one `Step body` section with three slider rows separated by hairline dividers or row gaps;
- two smaller standalone sections for headroom and handrail, but not visually as large cards;
- no nested metric boxes.

Use:
- `rounded-md`/`rounded-lg` only on actual group surfaces;
- `px-2 py-1.5` or `px-2.5 py-2` for group interiors;
- `gap-1.5`/`gap-2`, not broad `space-y-4` inside narrow panels.

### 8.2 Left sidebar target dimensions

At 1440×820:

- outer sidebar width: keep 286px for now, unless implementation reveals width strain;
- outer padding: 6–8px, not 10–12px;
- information block target height: 88–112px, not 202px;
- step body target height: 150–165px, not 185px;
- standalone control target height: 72–84px each, not 104px;
- total content target: under 520px, leaving breathing room without scroll.

### 8.3 Right sidebar target dimensions

Keep 386px unless the center viewport needs more space.

At 1440×820:

- outer padding: 6–8px;
- header height: 32–36px instead of 40px if possible;
- law row height remains equal, but internal row structure becomes denser;
- card header inside each law row should be about 34–44px, not 63px;
- pill area should use compact wrapping and show failing checks first.

### 8.4 Typography

Use typography as hierarchy before adding boxes:

- law/control labels: 11–12px, medium/semibold;
- values: 12–13px, tabular numerals, mono allowed;
- section labels: 10–10.5px uppercase mono with restrained tracking;
- helper text: 10.5–11px only when necessary;
- modal content can be larger because it is a reading surface.

### 8.5 Color and borders

Use:
- background layers: panel bg → group bg → row bg only when needed;
- subtle separators instead of full borders around every row;
- law color as a small identity rail/dot/pill edge;
- green/red status badges sparingly.

Avoid:
- borders plus shadows plus background on the same small card;
- large colored rails that consume space;
- high-contrast boxes around every metric.

## 9. Proposed left sidebar information architecture

Wireframe-level structure:

```text
┌ Left Inspector ─────────────────────┐
│ Stair information        PASS/LIVE  │
│ Steps 12     Rise 2160   Run 3080   │
│ 2R+T 640     Pitch 32.7  Width 1200 │
│─────────────────────────────────────│
│ Step body                           │
│ Riser height              180 mm    │
│ [ full-width slider             ]   │
│ Tread depth               280 mm    │
│ [ full-width slider             ]   │
│ Clear stair width        1200 mm    │
│ [ full-width slider             ]   │
│─────────────────────────────────────│
│ Headroom clearance       2100 mm    │
│ [ full-width slider             ]   │
│─────────────────────────────────────│
│ Handrail height           900 mm    │
│ [ full-width slider             ]   │
└─────────────────────────────────────┘
```

Key point: these are sections, not fat nested cards.

## 10. Proposed right sidebar information architecture

Wireframe-level structure:

```text
┌ Compliance Inspector ───────────────┐
│ Law checks                 ALL PASS │
│─────────────────────────────────────│
│ ▌ RA 9514 Fire Code          PASS   │
│   Exit stair / life safety          │
│   ✓ Riser  ✓ Width  ✓ Tread  +1     │
│─────────────────────────────────────│
│ ▌ BP 344 Accessibility       PASS   │
│   Accessible route overlay          │
│   ✓ Width  ✓ Handrail               │
│─────────────────────────────────────│
│ ▌ PD 1096 NBCP              PASS    │
│   Baseline building code            │
│   ✓ Riser  ✓ Tread  ✓ Headroom +3   │
│─────────────────────────────────────│
│ ▌ BP 220 Housing            PASS    │
│   Economic/socialized housing       │
│   ✓ Riser  ✓ Tread  ✓ Width         │
└─────────────────────────────────────┘
```

When failing:

```text
│ ▌ RA 9514 Fire Code       1 ISSUE   │
│   Exit stair / life safety          │
│   ✕ Max riser                       │
```

Pill behavior:
- failing pills appear first;
- passing pills can be summarized if space is tight;
- click any law row/pill → modal with all checks, actual value, required value, delta, source/citation confidence, and repair guidance.

## 11. Compliance modal content model

The modal should carry the teaching load, not the sidebar.

For each check, show:

- status: pass/fail/warning;
- dimension: e.g. `Riser height`;
- current value: e.g. `185 mm`;
- required value: e.g. `≤ 180 mm`;
- delta: e.g. `5 mm too high`;
- repair: e.g. `Lower riser height to 180 mm or below`;
- source/citation label from existing law metadata;
- source-audit status if not fully verified.

This is where learning science matters: feedback must be specific and repairable.

## 12. Implementation sequence after approval

### Phase 1 — Planning acceptance

- Philip reviews this plan.
- Confirm whether to change default values to the recommended calm passing state.
- Confirm whether legal overlays should be forced for teaching on first load or only shown as applicable/contextual.

### Phase 2 — Left sidebar density refactor

Target file:
- `StairwayWorkbenchPanels.tsx`

Actions:
- replace heavy Card-based visual stack with compact inspector-section components;
- remove individual metric boxes;
- reduce outer padding to 6–8px;
- reduce `space-y-4` slider gaps;
- keep full-width LabSlider;
- preserve the approved four-section structure.

Verification:
- no sidebar scroll at 1440×820;
- slider tracks remain full width;
- `Stair information` block height reduced materially;
- eslint targeted file passes.

### Phase 3 — Right sidebar density refactor

Target file:
- `ComplianceReportPanel.tsx`

Actions:
- keep four equal law rows;
- compress row header vertical padding;
- use one panel card/surface and dividers, not per-row card bulk;
- fail-first pill ordering;
- passing summary does not dominate;
- modal remains accessible/shared primitive.

Verification:
- four law rows remain equal height;
- no sidebar scroll at 1440×820;
- clicking law row/pill still opens modal;
- eslint targeted file passes.

### Phase 4 — Default/range adjustment only if approved

Target file:
- `stairway-configurator.ts`

Recommended changes:
- riser default 180 mm;
- tread default 280 mm;
- width default 1200 mm;
- keep headroom 2100 mm;
- keep handrail 900 mm;
- keep visible sidebar slider ranges as currently narrowed unless a lesson mode needs the wider config range.

Verification:
- current default opens calm/pass or intentionally documented status;
- moving riser above 180 triggers RA 9514 issue;
- moving width below 1200 triggers BP 344 issue;
- moving headroom below 2000 triggers PD 1096 issue;
- moving handrail above 900 triggers relevant issue;
- 2R+T and pitch update correctly.

## 13. Acceptance criteria

A redesign is accepted only if:

- left and right sidebars do not scroll at 1440×820;
- viewport remains dominant;
- no nested card-padding stack is visible;
- first glance shows geometry status, core controls, and law status;
- sliders use full available width;
- violations appear immediately in the relevant law row when sliders cross thresholds;
- modal provides full rule/check detail;
- no fake citations are introduced;
- targeted lint passes;
- screenshot evidence confirms the visual improvement.

## 14. Open decisions for Philip

1. Should we change the default stair values to the recommended calm passing state?
   - Recommended: yes. Use 180 / 280 / 1200 / 2100 / 900.

2. Should the right panel show passing checks as pills, or only failing checks plus a compact “all checks passed” summary?
   - Recommended: failing checks as pills; passing checks summarized unless the learner opens modal.

3. Should law applicability be visually distinguished from law comparison overlays?
   - Recommended: yes. A law can be “currently applicable” or “comparison overlay.” The sidebar can show this as tiny muted copy, not as a control.

4. Should threshold marks appear on the sliders?
   - Recommended: yes eventually, but not in the first density refactor unless LabSlider already supports it cleanly. Threshold marks are high learning value, but we should not overload Phase 1.

## 15. Recommended next action

Proceed with Phase 2 and Phase 3 only after Philip accepts this plan. Do not yet alter geometry/computation. If default values are approved, adjust them in Phase 4 after visual density is fixed.
