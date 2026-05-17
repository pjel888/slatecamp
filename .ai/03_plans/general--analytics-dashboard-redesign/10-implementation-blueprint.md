# 10 - Implementation Blueprint

> **Status**: Updated after relevance-first product review, 2026-05-16
> **Purpose**: Source-ready brief for the next analytics dashboard iteration.
> **Boundary**: Planning only. Implementation requires a later `$ralph` or `$team` execution run.

## 1. Product Target

Build `/dashboard/analytics` as a lean quiz-taking decision dashboard.

The future implementation is successful when:

- tabs look like physical browser/notebook tabs connected to the content sheet,
- default tabs are `Ready`, `Focus`, `Practice`, and `Habits`,
- default visible analytics are reduced from 34 sections to about 12 primary panels,
- every non-primary analytics section is mapped to secondary diagnostics, relocation, or removal,
- only active/default panels fetch/render by default,
- desktop dashboard passes the hard no-scroll gate at `1440x900`, `1512x982`, and `1920x1080`,
- mobile tab and panel overflow remain keyboard/focus reachable.

## 2. Current Working Reality

The prior source pass created a useful technical foundation:

| Source | Current role |
|---|---|
| `src/lib/analytics/tabs.ts` | 6-tab client-safe metadata |
| `src/app/dashboard/analytics/_lib/tab-sections.tsx` | server-only panel registry with all 34 sections distributed across six tabs |
| `src/components/analytics/AnalyticsTabNav.tsx` | query-state tab links with accessible labels |
| `src/app/dashboard/analytics/page.tsx` | active tab rendering from `searchParams` |
| `e2e/analytics-dashboard-tabs.spec.ts` | bounded/no-scroll/keyboard mobile checks |

The next implementation should revise that foundation, not return to the old stacked Overview/Advanced pages.

## 3. Tab And URL Model

Preferred ids:

```ts
ready | focus | practice | habits
```

Preferred URLs:

```text
/dashboard/analytics?tab=ready
/dashboard/analytics?tab=focus
/dashboard/analytics?tab=practice
/dashboard/analytics?tab=habits
```

Compatibility:

| Existing id or route | Exact MVP destination |
|---|---|
| `readiness` | `/dashboard/analytics?tab=ready` |
| `performance` | `/dashboard/analytics?tab=practice` |
| `topics` | `/dashboard/analytics?tab=focus` |
| `learning` | `/dashboard/analytics?tab=habits&detail=retention` |
| `behavior` | `/dashboard/analytics?tab=habits` |
| `calibration` | `/dashboard/analytics?tab=ready&detail=calibration` |
| `/dashboard/analytics/advanced` | `/dashboard/analytics?tab=ready` |

## 4. Primary Panel Composition

### Ready

| Panel | Relevance test | Why primary | Nearby secondary |
|---|---|---|---|
| `ReadinessSection` | Exam readiness | Primary on-track/off-track signal. | `SimulationTrajectorySection`, `IRTTrajectorySection` |
| `SubjectMasteryServer` | Next quiz, exam readiness | Compact subject risk/coverage scan. | `RadarSection` |
| `ExamCountdownSection` | Exam readiness | Adds urgency and time pressure. | `ProgressCardSection` |

### Focus

| Panel | Relevance test | Why primary | Nearby secondary |
|---|---|---|---|
| `WeakestTopicsSection` | Next quiz, error correction | Direct next-topic targets. | `MasterySparklineSection` |
| `TopicIntelligenceSection` | Next quiz | Ranked topic recommendation surface. | reading and retention diagnostics |
| `ErrorPatternsSection` | Error correction | Names the mistake pattern to fix now. | calibration/metacognition diagnostics |

### Practice

| Panel | Relevance test | Why primary | Nearby secondary |
|---|---|---|---|
| `SessionHistorySection` | Next quiz, exam readiness | Recent quiz trend without raw diagnostics. | simulation/IRT trajectories |
| `AccuracyBySubjectSection` | Next quiz, error correction | Subject-level performance gaps. | `DifficultyMasterySection`, `TimeSpentDistributionSection` |
| `PacingInsightsSection` | Pacing behavior | Plain-language pacing coaching. | `PacingQuadrantSection`, `PacingAccuracySection` |

### Habits

| Panel | Relevance test | Why primary | Nearby secondary |
|---|---|---|---|
| `StudyStreakCalendarSection` | Study consistency | Simplest habit signal. | mode/multimodal diagnostics |
| `TimelineHeatmapSection` | Study consistency | Recent practice pattern and missed days. | `StudyVelocitySection` |
| `ForgettingCurvesSection` | Next quiz, study consistency | Retention risk that can drive review selection. | `MemorySection`, relearning/reading diagnostics |

Default panel cap: 3 preferred, 4 maximum without product review.

## 5. Secondary Diagnostics MVP Contract

The next implementation should use query-based on-demand detail subviews:

```text
/dashboard/analytics?tab=ready&detail=readiness-diagnostics
/dashboard/analytics?tab=ready&detail=calibration
/dashboard/analytics?tab=practice&detail=pacing
/dashboard/analytics?tab=habits&detail=retention
/dashboard/analytics?tab=habits&detail=stamina
/dashboard/analytics?tab=ready&detail=exam-outcome
```

MVP rule:

- default tab render shows primary panels only,
- `detail` render fetches only the selected secondary group,
- unopened details do not fetch/render,
- if a detail UI is not implemented in the first source pass, the docs and code must explicitly mark secondary diagnostics as deferred rather than silently dropping them.

Create a typed secondary mapping in or near the server-only registry:

| Tab | Detail slug | Group | Sections |
|---|---|---|---|
| `ready` | `readiness-diagnostics` | Readiness diagnostics | `SimulationTrajectorySection`, `IRTTrajectorySection`, `ProgressCardSection`, `RadarSection` |
| `ready` | `calibration` | Calibration diagnostics | `CalibrationScoreSection`, `ConfidenceCalibrationSection`, `MetacognitionSection` |
| `ready` | `exam-outcome` | Exam outcome | `ExamOutcomeSection` |
| `practice` | `pacing` | Performance diagnostics | `PacingQuadrantSection`, `PacingAccuracySection`, `DifficultyMasterySection`, `TimeSpentDistributionSection` |
| `habits` | `retention` | Learning/retention diagnostics | `MemorySection`, `StudyVelocitySection`, `RelearningVelocitySection`, `ReadingCorrelationSection`, `ReadingDepthSection`, `MasterySparklineSection` |
| `habits` | `stamina` | Habit diagnostics | `StaminaSection`, `StaminaHeatmapSection`, `ModeFunnelSection`, `MultimodalStudySection` |

`ExamOutcomeSection` is special: it is hidden from the default dashboard but must remain reachable through `?tab=ready&detail=exam-outcome` or a later dedicated outcome surface. Do not remove its write path without a separate product/security review.

Invalid `detail` slugs and tab/detail mismatches must canonicalize to the base valid tab. They must not 404 and must not render every secondary group as a fallback.

Do not delete these sections by accident. The product decision is "not default visible," not "data is worthless."

## 6. Tab UI Blueprint

Current nav resembles a pill/segmented control. Replace it with a connected tab strip:

- active tab shares background and border with the content sheet,
- inactive tabs have top/side borders and a visible lower edge,
- active tab appears in front,
- content sheet starts immediately below the strip,
- no decorative outer card around the whole dashboard,
- focus ring remains visible,
- mobile keeps horizontal overflow but preserves full accessible labels.

Useful implementation hooks/classes for tests:

```text
data-analytics-tab-strip
data-analytics-tab-link="<id>"
data-analytics-tab-panel="<id>"
```

## 7. Layout Contract

Reuse the prior viewport-fit rules:

- analytics route uses full dashboard width,
- at `1440x900`, `1512x982`, and `1920x1080`, `document`, `body`, dashboard `<main>`, and the active tab sheet must each have vertical scroll delta `<= 8px`,
- each panel is bounded with `min-h-0`,
- mobile overflow is local and focusable,
- no clipping of labels, controls, legends, focus rings, empty states, or form controls.

Every primary desktop tab must fit in 1-2 content rows at the named desktop viewports unless a future product review replaces a raw chart with a denser summary card.

## 8. Implementation Order

1. Re-run the mandatory code-intel triad because the working tree has moved since the prior source pass.
2. Update `src/lib/analytics/tabs.ts` ids, labels, hrefs, descriptions, and compatibility parsing.
3. Restyle `AnalyticsTabNav` into browser/notebook tabs with stable test hooks.
4. Update `tab-sections.tsx` to render only the 12 primary panels by default.
5. Add a secondary diagnostics map and the exact `tab` + `detail` compatibility contract above; render details on demand if in scope, otherwise mark them explicitly deferred.
6. Keep `page.tsx` active-tab rendering and invalid-tab fallback.
7. Update `/advanced` compatibility behavior.
8. Update loading skeleton to match the 4-tab/default-panel model.
9. Expand E2E tests for tab count, primary panel cap, no default secondary render, the named-viewport desktop no-scroll gate, detail slug behavior, and mobile focus reachability.

## 9. Validation

Run:

```text
bun run type-check
bun run lint
git diff --check
```

Playwright must verify:

- exactly 4 primary tab links,
- active tab URL reload works,
- each tab renders no more than 4 primary panels,
- secondary diagnostic section names are not present by default,
- desktop `document`, `body`, dashboard `<main>`, and active tab sheet each have vertical scroll delta `<= 8px` at `1440x900`, `1512x982`, and `1920x1080`,
- every canonical detail slug in Section 5 is reachable,
- invalid `detail` slugs and tab/detail mismatches canonicalize to the base valid tab,
- a selected detail fetches/renders only its mapped secondary group, with unopened groups absent from the DOM and server composition,
- mobile scroll-bearing panels are named, focusable, and keyboard-scrollable,
- `/dashboard/analytics/advanced` compatibility resolves to `/dashboard/analytics?tab=ready`.
- old six-tab ids resolve exactly as listed in Section 3.

## 10. Source-Readiness Triad Notes

The prior triad showed analytics route composition can have high graph blast radius even when individual symbols are low risk. Before editing source again:

- GitNexus: run status, targeted impacts for `AnalyticsTabNav`, `AnalyticsPage`, and the tab registry symbols if indexed, then detect-changes before completion.
- code-review-graph: use changed-file context/impact radius for analytics files.
- ChunkHound: run targeted searches for `ANALYTICS_TABS`, `ANALYTICS_TAB_PANELS`, `AnalyticsTabNav`, and secondary diagnostic section names.

If any tool reports stale/unavailable state, record that in the implementation handoff and use a safe CLI fallback where available.

## 11. Explicit Non-Goals

- Do not add a new charting package.
- Do not globally redesign `DataLayout`, `HeaderHero`, or `DashboardContentFrame`.
- Do not create a generic `Advanced` tab.
- Do not render all secondary diagnostics behind CSS-hidden panels.
- Do not reintroduce a long all-section mobile stack.
