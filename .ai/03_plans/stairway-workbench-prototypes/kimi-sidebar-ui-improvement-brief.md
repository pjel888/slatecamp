# Kimi 2.6 delegation brief — Stairway Configurator Sidebar UI Rescue

Route: http://localhost:3000/dashboard/3d-lab/stairway-configurator
Repo: /Users/philiplewis/slatecamp

User feedback, verbatim priority:
- “why are there so much padding everywhere omg?!”
- Left/right sidebars still feel padded, bloated, and not professional enough.
- Earlier issue: sliders were too short. Sliders must use the available row width.
- Must use existing SlateCamp UI components/primitives where appropriate.

Current target files:
- src/features/3d-lab/components/templates/StairwayWorkbenchPanels.tsx
- src/features/3d-lab/components/templates/ComplianceReportPanel.tsx
- src/features/3d-lab/hooks/useTemplateContent.tsx only if needed; do not change routing unless necessary.

Current screenshot to review:
- .ai/03_plans/stairway-workbench-prototypes/implemented-stairway-workbench-ui-rescue-final-1440x820.png

Current known state:
- Left sidebar uses Card/Badge/Separator/LabSlider.
- Right sidebar uses Badge/Card/Separator and Modal primitive for law details.
- Sliders now measure about 218px track width inside 286px sidebar, but user says padding is excessive.
- Desktop 1440x820 currently has no sidebar scroll: left clientHeight/scrollHeight 639/639, right 639/639.
- Right law rows are equal height at about 143px each.
- Lint passes on touched panel files.
- Repo-wide type-check fails due to unrelated pre-existing script errors; do not fix those.

Hard requirements:
1. Reduce visible padding/density waste in both sidebars.
2. Preserve full-width sliders; do not return to compact `LabSlider compact` or `w-20` behavior.
3. Preserve current left panel structure:
   - Stair information read-only metrics
   - Step body: riser height, tread depth, clear stair width
   - Headroom clearance
   - Handrail height
4. Preserve current right panel structure:
   - Four law categories: RA 9514, BP 344, PD 1096, BP 220
   - horizontal row dividers between law cards
   - violation/check pills inside each law row
   - click opens full law-specific modal details
5. Do not add stair type/scenario/law/occupancy dropdowns.
6. Do not introduce sidebar scrolling at 1440x820 if avoidable.
7. Prefer SlateCamp primitives and tokens: Card, Badge, Separator, Modal, LabSlider, token classes. Avoid inline hardcoded colors except existing law accent colors.
8. Improve visual hierarchy through density, alignment, typography, and background layers; do not add heavy borders, glows, or decorative clutter.

Design direction:
- Treat this like a professional 3D software inspector, not a marketing card layout.
- Inspector panels should be compact, highly legible, and rhythmically aligned.
- Reduce nested card padding. Current cards feel like padded cards inside padded sidebars.
- Left sidebar should feel like a compact property inspector:
  - maybe tighter outer padding: p-1.5 or p-2
  - tighter card/header/content padding
  - reduce vertical gaps
  - use separators only where they improve scannability
  - slider labels/value rows can be compact but readable
  - metric grid should be dense and not oversized
- Right sidebar should feel like a compliance layer inspector:
  - compact law rows with clear but not bloated header/body
  - pills should not create huge vertical whitespace
  - maintain equal row heights and dividers

Implementation request:
- Make a focused code edit to the two sidebar components only, unless you discover a compelling reason otherwise.
- After editing, run targeted lint for the touched files.
- If possible, use Playwright/Chrome to screenshot the route and measure:
  - no sidebar scroll at 1440x820
  - slider track widths
  - law row heights equal
- Return a concise summary: files changed, design changes, validation, remaining risks.

Do not:
- Change geometry/computation logic.
- Remove the law categories.
- Replace violation feedback with generic compliance rows.
- Add new dependencies.
- Touch unrelated files.
