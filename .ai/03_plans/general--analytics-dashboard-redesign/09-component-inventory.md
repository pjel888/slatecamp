# 09 — Component Inventory And Change Surface

> **Refresh date**: 2026-05-16
> **Scope**: files relevant to a later analytics dashboard tab implementation

## 1. File Counts

| Area | Current count / note |
|---|---|
| `src/app/dashboard/analytics/` | route layout, page, loading, error, AGENTS, and `advanced/` |
| `src/app/dashboard/analytics/page.tsx` | current working tree renders one active query tab from the server-only registry |
| `src/app/dashboard/analytics/_lib/tab-sections.tsx` | current working tree distributes all 34 sections across six query tabs |
| `src/app/dashboard/analytics/advanced/page.tsx` | current working tree redirects for compatibility |
| `src/components/analytics/*.tsx` | 72 TSX files |
| `src/components/analytics/*Section.tsx` | 33 section files |
| `src/lib/actions/analytics*.ts` | root analytics action files |
| `src/lib/actions/analytics/*.ts` | 16-file analytics action subdirectory plus AGENTS |

## 2. Route And Layout Files

| File | Role | Implementation relevance |
|---|---|---|
| `src/app/dashboard/analytics/layout.tsx` | wraps analytics in `DataLayout` and `AnalyticsTabNav` | Must opt analytics out of narrow centered layout |
| `src/app/dashboard/analytics/page.tsx` | active tab renderer | Keep server-side tab selection |
| `src/app/dashboard/analytics/_lib/tab-sections.tsx` | server-only 6-tab registry | Trim to primary panels and secondary diagnostics mapping |
| `src/app/dashboard/analytics/advanced/page.tsx` | compatibility redirect | Preserve exact legacy behavior |
| `src/app/dashboard/analytics/loading.tsx` | current monolithic skeleton | Should become active-tab-aware |
| `src/app/dashboard/analytics/error.tsx` | route-level error | Preserve |
| `src/components/analytics/AnalyticsTabNav.tsx` | current query tab nav | Restyle to physical notebook/browser tabs |
| `src/components/layouts/category/DataLayout.tsx` | shared category layout | Touch only if route props are insufficient |
| `src/components/layout/HeaderHero.tsx` | shared hero width | Avoid global edits unless reviewed |
| `src/components/dashboard/DashboardContentFrame.tsx` | dashboard main scroll owner | Usually do not edit; measure against it |

## 3. Section Groups For Later Implementation

The earlier 6-tab grouping remains useful as source history, but the next implementation should use the relevance-first grouping below.

| Primary tab | Default section count | Notes |
|---|---:|---|
| Ready | 3 | readiness, compact subject mastery, countdown |
| Focus | 3 | weak topics, topic intelligence, error patterns |
| Practice | 3 | session trend, subject accuracy, pacing insight |
| Habits | 3 | streak, timeline, forgetting curves |

Primary default total: 12 sections. The remaining 22 sections stay mapped as secondary diagnostics in [03 - Data Visualization Matrix](./03-data-visualization-matrix.md).

## 4. Risk Correction

The old inventory described the redesign as "3-4 files" and "very low risk." That is too optimistic.

Docs-only edits are low risk. The later source implementation is at least medium risk and can become high risk if it changes shared layout primitives.

Why:

- `DataLayout` and `HeaderHero` are shared outside analytics.
- `DashboardContentFrame` owns dashboard scroll behavior.
- Analytics sections perform many server reads.
- `ExamOutcomeForm` performs a write.
- A client-only tab implementation could accidentally render/fetch every tab.
- Keeping all 34 charts visible by default would still overload the learner even if the no-scroll layout technically passes.

## 5. Safer Change Strategy

Prefer this write scope:

1. Route-specific analytics layout props/overrides.
2. Analytics tab config and nav.
3. Server-only section registry for primary panel rendering and secondary diagnostics mapping.
4. Server-side active-tab rendering in analytics page.
5. Advanced route compatibility.
6. Active-tab loading skeletons.
7. Physical tab-strip styling and tests.
8. Compact variants only for row-budget blockers named in [10 - Implementation Blueprint](./10-implementation-blueprint.md).

Avoid this unless explicitly reviewed:

- global removal of `max-w-5xl` from `DataLayout`,
- changing dashboard shell scroll behavior globally,
- rewriting chart components before the tab/layout architecture works,
- adding dependencies.

The width check is route-scoped. The future implementation should prove analytics no longer uses the centered `max-w-5xl mx-auto` body, but it should not delete that default from `DataLayout` for every data page.

## 6. Compact Variant Hot Spots

| File | Why it matters |
|---|---|
| `src/components/dashboard/SubjectMasteryCard.tsx` | Current analytics slot is `520px`; Readiness tab needs a compact `360px` row. |
| `src/components/dashboard/SubjectMasteryServer.tsx` | Needs a prop passthrough if the card gains a compact variant. |
| `src/components/analytics/TopicIntelligenceCards.tsx` | Hardcodes `h-[400px] overflow-y-auto`; Topics tab budgets it to a `340px` row. |
| `src/components/analytics/TopicIntelligenceSection.tsx` | Empty state also hardcodes `h-[400px]`. |
| `src/components/analytics/TimelineHeatmap.tsx` | Width-heavy; local horizontal overflow is acceptable but page overflow is not. |
| `src/components/analytics/StaminaHeatmap.tsx` | SVG height grows with row count and needs a bounded panel strategy. |

In the relevance-first plan, some of these hot spots may move out of default rendering rather than being compacted immediately.

## 7. Client/Server Boundary Files

| File | Boundary |
|---|---|
| `src/lib/analytics/tabs.ts` | Client-safe metadata only: tab ids, labels, href helpers, ordering, and descriptions. |
| `src/app/dashboard/analytics/_lib/tab-sections.tsx` | Server-only registry: imports section components and composes active tab panels. |
| `src/components/analytics/AnalyticsTabNav.tsx` | Client component that imports only client-safe metadata. |

## 8. Validation Matrix For Later Source Work

| Validation | Why |
|---|---|
| `bun run type-check` | Server component/searchParams/route contracts |
| `bun run lint` | Client/server boundary and style regressions |
| Playwright screenshot/DOM audit | Proves no desktop main-scroll and full-width use |
| Primary payload assertion | Proves no tab renders more than 4 visible primary panels |
| Path/reference grep | Catches stale `/advanced`, analytics route-level `max-w-5xl`, and hardcoded route strings |
| Manual demo-auth smoke | Confirms authenticated dashboard shell and tabs render with realistic data |

## 9. Blast-Radius Evidence From Planning Audit

| Tool | Result |
|---|---|
| code-review-graph docs scope | Low impact: markdown docs have no directly changed code nodes |
| code-review-graph future source scope | High risk when including analytics route + shared layout files |
| ChunkHound | Found analytics route/nav/DataLayout references and corroborated narrow-width touchpoints |
| GitNexus | Prior run was restored and current at that time, but relevance-first implementation must rerun targeted impacts and detect-changes because the planned source diff changed. |
