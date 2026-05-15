# UX Study, Happy Paths, and Layout Plan — Parking Lot Requirements

Current verdict: `STRATEGY REVISED / MORE SPECIFIC UI PLAN REQUIRED BEFORE IMPLEMENTATION`

## Direct answer to the strategy question

No, the earlier strategy should not be treated as 100% complete. It was strong on source-gating, legal/code readiness, and module-risk control, but it was not yet strong enough on SlateCamp's actual 3D Lab workbench layout.

The module must be planned around the existing pattern:

```text
LEFT SIDEBAR  |  3D VIEWPORT  |  RIGHT SIDEBAR
controls      |  spatial proof |  all information / feedback / law cards
```

The right sidebar is the canonical place for information. The viewport should show geometry and minimal labels only. The left sidebar should stay mostly operational. Scrolling should be avoided as much as possible, so both sidebars need tabs/segmented panels instead of long vertical stacks.

## Existing layout constraints to respect

Observed from current 3D Lab code:

- Main desktop shell uses a 5-column CSS grid:
  - left panel
  - left collapse handle
  - viewport `1fr`
  - right collapse handle
  - right panel
- The existing DevControls shell uses approximate widths:
  - left: `480px`
  - right: `300px`
  - handles: `20px`
- Stairway workbench has a more current preference:
  - aligned sidebars around `384px`
  - compact sections
  - no hidden primary features
  - minimal scroll
- Right panel currently has `overflow-y-auto` in generic shell, but this parking module should be designed to avoid needing it for the default and common happy paths.

## Revised layout principle

Use fixed workbench zones, not free-form content stacking.

### Left sidebar = input cockpit

Purpose: change the model.

Allowed content:
- compact project/scenario selector
- numeric controls
- presets
- minimal derived values that help control precision
- no long legal explanations
- no source quotes
- no multi-paragraph help

### 3D viewport = spatial cause/effect

Purpose: prove what changed.

Allowed content:
- parking bay geometry
- accessible stall/access aisle
- route-to-entry line
- dimension guides
- failure overlays on affected geometry
- minimal in-scene labels only when they clarify a physical dimension

Not allowed:
- long law cards
- full citations
- multiple floating explanation panels
- canvas-only compliance status

### Right sidebar = information and learning layer

Purpose: all feedback, law status, source confidence, and learning explanation.

Allowed content:
- current result summary
- law/source cards
- repair guidance
- source status
- exam trap notes
- details tabs
- source modal trigger

This is where the learner should read. The viewport is where they see.

## Desktop sidebar tab strategy

### Left sidebar tabs

Use compact horizontal tabs or segmented chips at the top. Maximum 3 visible tabs for v0.

Recommended v0 tabs:

1. `Setup`
   - project context
   - preset selector
   - total parking spaces
   - accessible spaces provided

2. `Geometry`
   - slot width
   - slot length
   - parking angle if source-ready
   - drive aisle width if source-ready

3. `Route`
   - accessible route toggle/measurement
   - off-site distance only if source-ready
   - disabled/deferred controls visible only as small locked rows, not full controls

Left sidebar density target:
- Header/tabs: 36–44px
- Each tab content: 4–6 controls max
- Row height: 34–44px
- Section padding: 8px
- No nested cards unless a section is truly distinct

### Right sidebar tabs

The right sidebar should use tabs because all information belongs there but must not scroll heavily.

Recommended v0 tabs:

1. `Checks`
   - top summary strip: current state, source status, issues count
   - compact rule rows for active checks only
   - each row: rule label, current value, threshold, status
   - no source paragraphs

2. `Fix`
   - repair guidance in priority order
   - one-line cause → action mapping
   - examples:
     - `Slot width is below pending minimum. Increase to at least 2.50m after source approval.`
     - `Accessible spaces are short by 1. Add one accessible stall near the route.`

3. `Sources`
   - source family cards collapsed by default
   - source status badges
   - page/section locator when available
   - button to open full source modal
   - no raw quote dumps in default sidebar

4. Optional later: `Exam`
   - exam traps and recall prompt
   - only if it does not crowd v0

Right sidebar density target:
- Width target: 384px if using stairway-style aligned sidebars; 300px is probably too narrow for source/status rows.
- Use tabbed content area with `min-h-0` and internal overflow only for the active tab if absolutely necessary.
- Default `Checks` tab must fit without vertical scroll at MacBook Pro 13-class height.
- Source quote text must open in modal/popover, not consume sidebar height.

## Proposed desktop wireframe

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ 3D Lab shell / module title / compact toolbar                                │
├────────────── LEFT 384 ──────────────┬──────── VIEWPORT ────────┬─ RIGHT 384 ┤
│ Parking Requirements                 │                          │ Checks Fix │
│ [Setup] [Geometry] [Route]           │      3D parking lot       │ Sources    │
│                                      │                          │            │
│ Setup tab:                           │   - lot slab              │ Summary    │
│ • Preset: Small public lot           │   - standard stalls       │ OK/Review  │
│ • Project: Generic NBCP              │   - accessible stall      │            │
│ • Total spaces: 25                   │   - access aisle          │ Active     │
│ • Accessible spaces: 1               │   - route to entrance     │ checks:    │
│                                      │   - red exact failures    │ • stall    │
│ Derived micro-row:                   │                          │ • access   │
│ Required accessible: source pending  │                          │ • count    │
│                                      │                          │            │
└──────────────────────────────────────┴──────────────────────────┴────────────┘
```

## Happy paths

### Happy path 1 — First-load orientation

User lands on the module.

Expected state:
- Model opens in a calm, passing-looking baseline.
- Left `Setup` tab is active.
- Right `Checks` tab is active.
- Right summary says source status clearly, e.g. `QA preview · source pending`.
- No final `COMPLIANT` wording if source is pending.
- No scrolling needed to understand the default state.

Learning outcome:
- User understands: this is a parking lot geometry/checking module.

### Happy path 2 — Learner changes stall width

User opens `Geometry` tab and drags slot width below threshold.

Expected state:
- Affected stall dimension guide turns red.
- Only the failing physical element turns red; the whole lot does not turn red.
- Right `Checks` tab updates immediately.
- Right row shows current width, pending minimum, and `FORMULA ISSUE` while source-pending.
- `Fix` tab gives one repair action.

Learning outcome:
- User connects numerical width to visible stall geometry.

### Happy path 3 — Accessible count shortage

User sets total spaces to a band that requires more accessible spaces, or reduces accessible spaces provided.

Expected state:
- Right `Checks` tab flags accessible count shortage.
- Viewport shows missing accessible stall as ghost/red outline, not global red wash.
- `Fix` tab says how many accessible stalls are missing.
- `Sources` tab shows BP 344 table source status.

Learning outcome:
- User understands accessible parking is a count/table requirement plus spatial placement.

### Happy path 4 — Accessible route inspection

User switches left tab to `Route`.

Expected state:
- Viewport emphasizes route from accessible stall to building entrance.
- Right `Checks` tab switches or filters to route-related checks only if the user selects a route element.
- Long route/signage/source explanation stays in right `Sources` tab or modal.

Learning outcome:
- User sees accessible parking as a route system, not only a blue parking rectangle.

### Happy path 5 — Source-detail drilldown

User clicks source details from the right `Sources` tab.

Expected state:
- A modal/popover opens with raw locator, quote, normalized rule, and status.
- Sidebar does not become a scroll-heavy source dump.
- Modal has close, focus handling, and readable text.

Learning outcome:
- User can audit the rule without losing the spatial scene.

### Happy path 6 — Repair loop

User creates a formula issue, then switches to `Fix`, adjusts values, and resolves the issue.

Expected state:
- Right `Fix` tab lists the smallest repair first.
- Left active control remains visible if repair is in the active tab; if not, `Fix` should indicate the left tab/control to open.
- Geometry returns from red to neutral/passing state.

Learning outcome:
- User learns a code threshold by correcting it.

## Exam trap paths

### Trap 1 — Treating all standards as universal

User selects or sees international comparison.

Required behavior:
- International values are visually labeled `Comparative only`.
- They cannot drive pass/fail.

### Trap 2 — Treating accessible parking as only stall width

Required behavior:
- Right `Checks` separates count, stall/access aisle geometry, route, and source status.
- `Fix` never says only “make it wider” if count or route is the actual issue.

### Trap 3 — Treating BP 220 housing rules as all-project rules

Required behavior:
- Project context is visible in left `Setup`.
- Right `Checks` shows applicability: `BP 220 housing context only`.

### Trap 4 — Source-pending false confidence

Required behavior:
- Source-pending rules never show `COMPLIANT` or `VIOLATION`.
- Even happy/default states say `CALCULATION OK`, not `COMPLIANT`, until source-approved.

## No-scroll strategy

The no-scroll target is realistic only if we use tabs and restrict default visible content.

Rules:
1. Right sidebar default tab is `Checks`, not `Sources`.
2. Source quotes are modal-only.
3. Each right tab has one job.
4. Left tab content has max 6 controls.
5. Advanced/deferred controls are not rendered as full-height disabled forms.
6. Use compact rows, not large cards.
7. Use one summary strip and rows, not stacked explanation cards.
8. If scrolling exists, it must be inside a single active tab body, not the entire shell.

## Revised acceptance criteria before implementation

- Planning includes a tabbed left/right sidebar design.
- Default happy path fits without scroll at MacBook Pro 13-class viewport.
- All learner information is in the right sidebar or modal, not viewport overlays.
- Left sidebar contains controls only, plus tiny derived values.
- Right sidebar has `Checks`, `Fix`, and `Sources` tabs at minimum.
- Every happy path has expected left tab, viewport state, and right tab state.
- Source-pending labels are validated in the right sidebar.
- The implementation plan must name exact components for sidebars before code starts.

## Revised implementation implication

Do not implement a generic long-form parking module. Implement a parking workbench layout first:

```text
ParkingWorkbenchLeftPanel
ParkingWorkbenchViewportScene
ParkingWorkbenchRightPanel
ParkingWorkbenchTabs
ParkingSourceModal
```

The module should use existing 3D Lab shell patterns, but likely needs custom parking panels rather than relying only on generic `ParametricSceneConfig` sidebar rendering.
