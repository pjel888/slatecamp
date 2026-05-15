# Parking Lot Requirements — Stairway UI Principles Study

Source studied: http://localhost:3000/dashboard/3d-lab/stairway-code-compliance at 1440x900.
Screenshot captured: `.ai/03_plans/3d-modules/parking-lot-requirements/stairway-ui-study-1440.png`.
Relevant code inspected: `StairwayWorkbenchPanels.tsx`, `DevControlsLabV2.tsx`, and `useTemplateContent.tsx` references.

## Measured layout observations

- Page body at 1440x900 had no document overflow: body scrollWidth 1440, clientWidth 1440, scrollHeight 900, clientHeight 900.
- Workbench content area after dashboard chrome measured about 1360w x 752h.
- Left stairway panel measured 384w x 718.5h.
- Right compliance report measured 386w x 718.5h.
- Viewport occupies the remaining center space and does not push sidebars out.
- Both sidebars use `overflow-hidden`; content is compressed into compact rows instead of relying on page scroll.

## Principles to carry into parking module

1. Symmetric inspector widths
   - Parking should keep left/right sidebars around 384px on desktop unless the parking information density proves otherwise.
   - The center 3D viewport remains the flexible `1fr` column.

2. No page scroll
   - Main shell must stay `h-full min-h-0 overflow-hidden`.
   - If a tab needs scrolling, only the active tab body may scroll; never the full page and never the 3D viewport.

3. Left sidebar is the input cockpit
   - Left content should be short, direct, and manipulable.
   - Use compact sections, not large cards.
   - Target 4–6 visible primary controls per tab.
   - Parking left tabs should be something like: Lot, Layout, Accessible, Context.
   - Advanced/legal context controls belong in compact rows or a secondary tab, not in the default view.

4. Right sidebar is the information/control tower
   - All learner-visible explanation, checks, source status, and fix guidance stay on the right.
   - Default right tab should be Checks.
   - Secondary tabs: Fix and Sources.
   - Source quotes should open in a modal/popover, not consume the right sidebar body.

5. Dense rows beat decorative cards
   - Stairway uses 16–20px information rows and tabular values.
   - Parking should use the same density: label, required value, actual value/status, compact source badge.
   - Avoid repeated large card headers, icon clutter, nested cards, and p-4/p-6 spacing.

6. Status language must be legally safe
   - Stairway uses direct compliance cards. Parking must adapt this to source-gated language:
     - LOCATED rules can show pass/fail after formula implementation.
     - SOURCE_PENDING rules show REVIEW / SOURCE PENDING, never COMPLIANT or VIOLATION.
     - RA 9514 appears as scope warning/context, not as a geometric failure.

7. Viewport is teaching surface, not decoration
   - 3D highlights must map directly to checks: accessible stall, access aisle/passage, front walkway, off-site distance, possible fire-safety scope marker.
   - Do not use large decorative overlays that reduce model readability.

## Parking-specific adaptation

Recommended desktop shell:

- Left sidebar: 384px
- Left collapse handle: existing handle width
- 3D viewport: 1fr
- Right collapse handle: existing handle width
- Right sidebar: 384px

Left tabs:

1. Lot
   - total parking slots
   - project type/context
   - national rule family selector where legally appropriate
   - off-site toggle/distance if relevant

2. Layout
   - stall orientation
   - stall width/depth
   - row count / slot count input
   - aisle width shown as SOURCE PENDING until verified if using PD1096 90-degree aisle

3. Accessible
   - accessible slot count
   - accessible stall width/depth
   - route/location options
   - slope/ramp warning toggle

Right tabs:

1. Checks
   - top summary count: OK / Review / Source pending
   - BP344 accessible count
   - BP344 accessible geometry
   - PD1096/BP220 stall dimensions
   - PD1096 aisle shown as REVIEW / SOURCE PENDING

2. Fix
   - one prioritized fix at a time
   - show exact adjustment: e.g. “increase accessible slot width to 4000 mm”
   - no legal quote wall

3. Sources
   - compact source cards by rule ID
   - status badge: LOCATED, PARTIAL, SOURCE PENDING, CONTEXT ONLY
   - “open quote” action opens modal/popover

## Acceptance criteria for future implementation

- 1440x900: no document scroll; left and right panels visible; viewport not clipped.
- 1280x800: no document scroll; active tab body may scroll internally only if unavoidable.
- Left panel: no default tab with more than 6 primary controls visible.
- Right default tab: Checks, not Sources.
- No raw source quotes in default right tab.
- `PARK-PD1096-AISLE-90` cannot render as pass/fail while release_status is `SOURCE_PENDING_FAIL_CLOSED`.
- BP344 active accessible geometry target must be 4000mm x 5000mm unless SME changes source precedence.
