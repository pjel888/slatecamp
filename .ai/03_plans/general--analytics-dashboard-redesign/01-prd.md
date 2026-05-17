# 01 — Product Requirements Document

> **Feature**: Analytics Dashboard Relevance-First Tab Redesign
> **Target Pages**: `/dashboard/analytics` and `/dashboard/analytics/advanced`
> **Primary User**: LEA candidates studying inside the authenticated SlateCamp dashboard
> **Status**: Planning artifact; no source implementation in this pass

## 1. Problem Statement

Historically, the analytics dashboard behaved like a long report embedded in a dashboard shell: the Overview route rendered 25 sections in a vertical stack and the Advanced route rendered 9 more. The first implementation pass replaced that with a 6-tab query-state foundation and a server-only panel registry, but it still kept all 34 sections visible by default across those tabs.

The root layout issue is not only the number of charts. Analytics inherits `DataLayout`'s default centered content body:

```text
max-w-5xl mx-auto px-4 xl:px-6 py-6
```

That default is reasonable for reading surfaces, but it wastes dashboard workspace width and increases chart height pressure. The first redesign plan fixed the layout direction but still treated all 34 sections as default dashboard content. Product review now changes the requirement: analytics should become a lean quiz-taking decision surface, not a full diagnostic report.

## 2. User Need

LEA candidates open analytics to answer a specific question quickly:

| User question | Expected surface |
|---|---|
| "Am I on track for the LEA?" | `Ready` tab |
| "What should I quiz or review next?" | `Focus` tab |
| "What did my quizzes reveal?" | `Practice` tab |
| "Am I practicing consistently enough?" | `Habits` tab |

The current or prior six-tab model is still too reporting-oriented for a quiz-taking product. The dashboard should answer fewer questions well.

## 3. Goals

| # | Goal | Success metric |
|---|---|---|
| G1 | Remove vertical scrolling from desktop analytics tabs | At `1440x900`, `1512x982`, and `1920x1080`, `document`, `body`, dashboard `<main>`, and the active tab sheet each have vertical scroll delta `<= 8px` |
| G2 | Use available dashboard width | Analytics content is not constrained by a centered `max-w-5xl mx-auto` body; wide panes use dense 12-column layouts |
| G3 | Replace report tabs with learner tabs | 4 tabs: `Ready`, `Focus`, `Practice`, `Habits` |
| G4 | Trim default payload | About 12 primary panels visible by default; no tab shows more than 4 primary panels without product review |
| G5 | Avoid hidden server work | Only the active tab's server sections fetch/render by default |
| G6 | Keep implementation native to current stack | Next.js App Router, Server Components, Tailwind, current chart components, and Recharts remain in use |
| G7 | Preserve diagnostic accountability | All 34 current sections are mapped to primary, secondary, moved, or intentionally removed status |

## 4. Non-Goals

- No new charting library.
- No redesign of every individual chart.
- No database/schema changes.
- No unsafe removal of `ExamOutcomeForm`; it is the one write-capable analytics path. It may move behind `?detail=exam-outcome`, but its validation, pending state, and action boundary must remain safe.
- No back-to-top FAB, sticky table of contents, or scrollspy as the primary solution.
- No client-only tab wrapper that renders all sections and hides inactive panels.

## 5. Functional Requirements

### FR1: Physical Tab Navigation
- Replace segmented-pill tabs with browser/notebook-like tabs attached to the content sheet.
- Use 4 short labels: `Ready`, `Focus`, `Practice`, `Habits`.
- Tabs must be keyboard accessible and have practical hit targets near or above 44px where possible.
- Mobile may horizontally scroll the tab list, but the active tab must remain obvious and accessible.
- URLs must deep-link to each tab.

### FR2: Viewport-Fit Layout
- Analytics must opt out of the default centered `DataLayout` body by using `fullHeight`, `contentClassName`, or a route-specific layout equivalent.
- The dashboard `<main>` must not be the normal scroll container for desktop analytics tabs.
- Use 12-column responsive grids, compact gaps, and explicit min-height/height budgets for fixed-format chart panels.
- Wide charts may span 6, 8, or 12 columns; compact cards should share rows instead of stacking.

### FR3: Server Component Integrity
- The top-level route may use `searchParams` or subroutes to choose the active tab server-side.
- Server section components should stay server-rendered.
- Client components remain leaf chart/form/tab interactions unless a specific exception is justified.

### FR4: Relevance-First Section Policy
- Live inventory is 34 sections: 25 historical Overview plus 9 historical Advanced.
- Only quiz-relevant primary panels should be visible by default.
- Implementation must maintain a matrix of where each section moved: primary tab, secondary diagnostics, moved route, or product-removed.
- If a section is useful but not urgent for the learner's next quiz decision, it should move behind on-demand details instead of remaining equal-weight on the dashboard.

### FR5: Loading And Error Handling
- Historical Overview-origin sections should keep `AnalyticsChartContainer` semantics when moved into the 4-tab registry.
- Historical Advanced-origin sections should be normalized to `AnalyticsChartContainer` or an explicitly equivalent wrapper before becoming primary or secondary detail panels.
- Loading states should match the active tab, not skeletons for the old monolithic page.

## 6. Success Criteria

- [ ] At `1440x900`, `1512x982`, and `1920x1080`, `document`, `body`, dashboard `<main>`, and the active tab sheet each have vertical scroll delta `<= 8px`.
- [ ] The narrow centered analytics body is gone from the analytics route.
- [ ] Default tab set is `Ready`, `Focus`, `Practice`, `Habits`.
- [ ] Tab UI looks like connected browser/notebook tabs, not segmented pills.
- [ ] No primary tab renders more than 4 visible panels by default.
- [ ] All 34 current analytics sections are mapped to primary, secondary, moved, or intentionally removed status.
- [ ] Active tab is URL-addressable and reload-safe.
- [ ] Inactive tabs do not fetch all server data by default.
- [ ] Unknown `detail` slugs and tab/detail mismatches canonicalize to the base valid tab instead of rendering every diagnostic group.
- [ ] `bun run type-check` passes after implementation.
- [ ] `bun run lint` passes after implementation.
- [ ] Playwright screenshot/DOM checks cover desktop, laptop, tablet, and mobile.

## 7. Constraints And Risks

| Constraint | Detail |
|---|---|
| Dashboard shell | Non-root dashboard pages currently scroll inside `<main>`; analytics must deliberately constrain content within that shell |
| Shared layout risk | `DataLayout` and `HeaderHero` are shared; prefer route-specific overrides over global behavior changes unless reviewed |
| Data cost | Rendering hidden tabs would multiply Supabase/server action work |
| Write path | `ExamOutcomeForm` reports to `exam_outcomes`; preserve its action/error behavior |
| Mobile | Small screens may need limited vertical movement, but tabs must still prevent the old all-section scroll stack |
| Cognitive load | The dashboard must not ask a quiz taker to interpret expert diagnostics before deciding what to practice next |

## 8. Recommended URL Strategy

Prefer `searchParams` on `/dashboard/analytics?tab=<slug>` for the first implementation because it avoids creating new route files and lets the server page render only the selected tab.

Keep `/dashboard/analytics/advanced` as a compatibility redirect or compatibility view until existing links are migrated.
