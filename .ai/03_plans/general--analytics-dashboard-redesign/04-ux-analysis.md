# 04 — UX/UI Analysis

> **Analysis date**: 2026-05-16
> **Method**: route/source audit, runtime Playwright measurement, SlateCamp UX principles

## Primary UX Failure

The current page overloads a dashboard workspace with report-style stacking. Users enter analytics with one question, but the UI forces them through a long sequence of unrelated charts.

This is not only a "scroll depth" problem. It is an information architecture and layout-density problem:

- 34 total analytics sections exist.
- The previous plan still kept all 34 sections visible by default across six tabs.
- The route uses a centered `max-w-5xl` content body inside a much wider dashboard pane.
- The dashboard main pane becomes the scroll container, so the user loses stable dashboard context while reviewing charts.
- The learner is using a quiz-prep product, not an expert analytics console; too many charts create hesitation instead of action.

## User Experience Principles

| Principle | Requirement |
|---|---|
| Intent first | Tabs must be named by the question they answer, not by data sophistication |
| Dense but calm | Use the whole dashboard pane, compact gaps, and predictable grids without turning the screen into noise |
| No scroll theater | Do not add scroll helpers as the fix; remove the need to scroll by reducing per-tab payload |
| Honest analytics | Account for current chart meanings and data boundaries, but do not expose every diagnostic by default |
| Fast focus | A student should reach the relevant analytics group in one click |

## Current Heuristic Findings

| Heuristic | Current result | Required correction |
|---|---|---|
| Visibility of system status | User cannot see what matters because too many charts compete | Use 4 physical tabs with 3 primary panels each |
| User control | User can only switch between two overloaded routes | Direct tab access to user-intent groups |
| Recognition over recall | User must remember charts seen several scrolls earlier | Keep related charts in one viewport-fit tab |
| Aesthetic/minimalist design | Too many equal-weight sections compete | Promote only quiz-relevant panels; move diagnostics behind details |
| Flexibility | Repeat visitors cannot jump to their common question | URL-addressable tabs |

## Why Full-Width Matters

At `1440x900`, the dashboard main pane is about `1376px` wide after sidebar/header chrome, but analytics content is capped at `1024px`. That leaves more than 300px of practical horizontal workspace unused before considering internal chart padding.

For a dashboard, horizontal space should buy:

- two or three compact cards per row,
- wider charts where visual comparison matters,
- fewer stacked rows,
- less internal scrolling.

The implementation should not globally remove width constraints from all `DataLayout` pages. It should make analytics opt into a dashboard-specific full-height/full-width mode.

## Mobile Position

Mobile cannot always guarantee every chart in every tab fits a single physical screen. The requirement is still to avoid the current monolithic scroll:

- Tab list can scroll horizontally.
- Each tab should have a compact mobile order with the most actionable chart first.
- Dense cards can collapse, but do not put all 34 sections into one mobile column.
- Any internal overflow should be local to a chart/table that genuinely needs it, not the whole analytics page by default.

## Tab Visual Direction

Use tabs that read like browser tabs or notebook file tabs:

- active tab connected to the content sheet,
- inactive tabs visually tucked behind the active sheet,
- border and background continuity between active tab and panel,
- short labels: `Ready`, `Focus`, `Practice`, `Habits`,
- no floating segmented-pill nav as the final visual language.

## Removed Recommendations

The previous plan mentioned back-to-top buttons, sticky table of contents, and scroll mitigations. Those are explicitly not the primary solution. Keep them out of MVP implementation unless they serve a separate accessibility need after the tabbed layout is working.

## UX Acceptance Checks

- Desktop screenshots show all primary content for a selected tab without scrolling the dashboard main pane.
- Tab labels are readable and have adequate hit targets.
- The first tab answers readiness immediately; it must not be a random chart sampler.
- No default chart is hidden behind vague "Deep Insights" language; secondary diagnostics must be explicit and on demand.
- Empty/error states remain local to the chart panel and do not collapse the grid unpredictably.
- No tab shows more than four primary panels by default.
