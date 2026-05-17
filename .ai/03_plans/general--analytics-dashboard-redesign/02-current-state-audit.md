# 02 — Current State Audit

> **Audit date**: 2026-05-16
> **Scope**: `/dashboard/analytics`, `/dashboard/analytics/advanced`, analytics components, parent dashboard shell, and planning-doc correctness

## 1. Route Structure

This file originally audited the pre-redesign route. The current working tree now contains a 6-tab implementation foundation:

- `src/lib/analytics/tabs.ts` defines `readiness`, `performance`, `topics`, `learning`, `behavior`, and `calibration`.
- `src/app/dashboard/analytics/_lib/tab-sections.tsx` is a server-only registry that renders all 34 sections across those six tabs.
- `src/components/analytics/AnalyticsTabNav.tsx` renders query-state links with full accessible labels.
- `e2e/analytics-dashboard-tabs.spec.ts` covers bounded desktop tabs and mobile panel focus/scroll behavior.

Product review supersedes the 6-tab/all-section payload. The next implementation should reduce this foundation to 4 primary tabs and about 12 default panels, as defined in [11 - Relevance-First Tab And Data Plan](./11-relevance-first-tab-and-data-plan.md).

Historical pre-redesign structure:

```text
src/app/dashboard/analytics/
├── AGENTS.md
├── error.tsx          # client route error boundary
├── layout.tsx         # DataLayout + AnalyticsTabNav
├── loading.tsx        # old overview-style skeleton
├── page.tsx           # historical pre-pass: 25 Overview sections
└── advanced/
    ├── loading.tsx
    └── page.tsx       # historical pre-pass: 9 Advanced sections
```

Both pages export `dynamic = 'force-dynamic'`. The parent analytics layout wraps both pages in `DataLayout` and renders `AnalyticsTabNav`.

## 2. Parent Shell Reality

Analytics sits inside the authenticated dashboard shell:

- `DashboardLayoutContent` uses a fixed `h-screen overflow-hidden` app frame.
- `DashboardContentFrame` renders a non-root dashboard `<main>` with `overflow-y-auto bg-page-bg`.
- Analytics then adds `SharedPageLayout`, `HeaderHero`, and `DataLayout` content inside that scrollable main.

This means the visible browser document may not scroll, but the dashboard content pane scrolls heavily.

## 3. Runtime Measurement

Playwright against `http://localhost:3000/dashboard/analytics` produced these artifacts:

| Viewport | Main pane | Main scroll height | Content width | Screenshot |
|---|---:|---:|---:|---|
| `1440x900` | `1376x844` | `5731px` | `1024px` | `.omx/artifacts/analytics-dashboard-redesign/desktop-1440x900.png` |
| `1920x1080` | `1856x1024` | long internal scroll | `1024px` | `.omx/artifacts/analytics-dashboard-redesign/desktop-1920x1080.png` |
| `393x852` | `393x706` | mobile internal content overflow | `373px` | `.omx/artifacts/analytics-dashboard-redesign/mobile-393x852.png` |

The key issue is visible in one number: at `1440x900`, analytics uses a `1024px` centered content body inside a `1376px` main pane while still producing `5731px` of vertical content.

## 4. Layout Drivers

| Driver | Source | Effect |
|---|---|---|
| Dashboard internal scroll | `DashboardContentFrame` | Non-root dashboard pages scroll inside `<main>` |
| Centered content width | `DataLayout` default branch | Caps analytics at `max-w-5xl mx-auto` |
| Header width | `HeaderHero` inner wrapper | Also caps header text to `max-w-5xl` |
| Historical vertical stack | pre-redesign `analytics/page.tsx` and `advanced/page.tsx` | Forced every chart row below the previous one |
| Current 6-tab foundation | `AnalyticsTabNav` plus `src/lib/analytics/tabs.ts` | Splits content by reporting categories, but still needs the 4 learner-tab reduction |

## 5. Component Architecture

Most visualizations follow:

```text
*Section.tsx server component
  -> server action/data helper
  -> dynamic client chart component
```

Overview wraps sections in `AnalyticsChartContainer`, which provides Suspense skeletons and `AnalyticsErrorBoundary`.

Advanced currently uses raw `Suspense` plus `AnalyticsErrorBoundary`; this should be normalized during implementation unless a specific reason exists to keep the separate pattern.

## 6. Data And Write Paths

Main analytics data comes from:

- `src/lib/actions/analytics.ts`
- `src/lib/actions/analytics-data.ts`
- `src/lib/actions/analytics/*.ts`
- mastery/progress-report helpers used by selected sections

Tables touched include `user_global_stats`, `user_interactions`, `quiz_sessions`, `user_node_mastery`, `taxonomy_tree`, `readiness_score_snapshots`, `wiki_article_reads`, `wiki_articles`, `user_theta`, `calibration_snapshots`, `session_predictions`, `questions`, and `exam_outcomes`.

`ExamOutcomeForm` is the notable write-capable path because it reports outcomes through `reportExamOutcome`.

## 7. Current Anti-Patterns

| ID | Anti-pattern | Why it matters |
|---|---|---|
| AP1 | Analytics inherits article-like centered layout | Wastes dashboard width and increases vertical pressure |
| AP2 | Historical pre-pass rendered 25 Overview sections in one stack | Creates a 5k+ px internal scroll area |
| AP3 | Historical pre-pass rendered 9 Advanced sections in one stack | The "Deep Insights" tab repeated the same problem |
| AP4 | Tabs describe depth, not user intent | Users cannot jump to the question they came to answer |
| AP5 | Advanced wrapper pattern differs | Increases implementation/test variance |
| AP6 | Existing docs miscount sections | Implementation could accidentally drop charts |
| AP7 | All 34 sections remain visible by default in the first dense-tab plan | Still too much for a quiz-taking learner surface |

## 8. Evidence Systems

| System | Result |
|---|---|
| Source inspection | Historical source pass confirmed 25 Overview + 9 Advanced sections and the shared layout constraints; current working source now has the 6-tab foundation noted above |
| Playwright runtime audit | Confirmed internal dashboard main scroll and narrow content width |
| code-review-graph | Docs-only edits are low impact; future source changes touching analytics layout are high blast radius because they touch shared layout/route files |
| ChunkHound | Regex corroborated analytics route, tab nav, DataLayout width pattern, and key component references |
| GitNexus | Prior source pass restored GitNexus via CLI and later runs showed broad dirty-tree risk from unrelated files. Future implementation must rerun targeted impacts and detect-changes against the current tree. |
