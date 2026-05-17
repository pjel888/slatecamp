# 06 - Tab Architecture Proposal

> **Status**: Superseded by relevance-first product review, 2026-05-16
> **Principle**: The analytics route should feel like a learner notebook with physical tabs and a small set of decision-making panels.
> **Current source of truth**: [11 - Relevance-First Tab And Data Plan](./11-relevance-first-tab-and-data-plan.md)

## 1. Chosen Architecture

Use 4 primary tabs:

```text
Ready | Focus | Practice | Habits
```

This replaces the prior 6-tab proposal:

```text
Readiness | Performance | Topics | Learning | Behavior | Calibration
```

The 6-tab model improved information architecture compared with `Overview` / `Deep Insights`, but it still exposed too much analytical detail for a quiz-taking dashboard. The next implementation should treat most advanced metrics as secondary diagnostics.

## 2. Visual Tab Contract

The tab UI should look closer to browser tabs or notebook file tabs than to segmented controls.

Requirements:

- Active tab is visually attached to the content sheet.
- Inactive tabs sit behind or beside the active tab with a clear sheet-edge/border treatment.
- Tab strip and content panel share one surface; do not place cards inside cards.
- Labels stay short enough to scan quickly.
- Accessible names stay full even when mobile uses short visual labels.
- The visual language should imply "switch pages in this notebook," not "toggle filter pills."

Suggested structure:

```text
[ Ready ][ Focus ][ Practice ][ Habits ]________
|                                             |
| active tab sheet                           |
|                                             |
```

## 3. Server Rendering Strategy

Keep the previous architecture:

- `src/lib/analytics/tabs.ts` remains client-safe tab metadata.
- `src/app/dashboard/analytics/_lib/tab-sections.tsx` remains server-only panel composition.
- `src/app/dashboard/analytics/page.tsx` reads `searchParams` and renders only the active tab.
- `AnalyticsTabNav` imports only metadata and query helpers.

Do not implement secondary diagnostics by rendering all hidden panels in the DOM. Details must fetch/render only when opened.

Recommended URLs:

```text
/dashboard/analytics?tab=ready
/dashboard/analytics?tab=focus
/dashboard/analytics?tab=practice
/dashboard/analytics?tab=habits
```

Compatibility aliases for the MVP must map exactly:

| Existing id or route | Exact destination |
|---|---|
| `readiness` | `/dashboard/analytics?tab=ready` |
| `performance` | `/dashboard/analytics?tab=practice` |
| `topics` | `/dashboard/analytics?tab=focus` |
| `learning` | `/dashboard/analytics?tab=habits&detail=retention` |
| `behavior` | `/dashboard/analytics?tab=habits` |
| `calibration` | `/dashboard/analytics?tab=ready&detail=calibration` |
| `/dashboard/analytics/advanced` | `/dashboard/analytics?tab=ready` |

## 4. Primary Tab Assignments

### Ready

Answers: "Am I on track for the LEA?"

Default visible panels:

| Section | Role |
|---|---|
| `ReadinessSection` | main readiness signal |
| `SubjectMasteryServer` | top-level subject coverage, compacted |
| `ExamCountdownSection` | time pressure/context |

Do not show trajectory, IRT, and monthly report by default unless condensed into one simple readiness summary.

### Focus

Answers: "What should I quiz or review next?"

Default visible panels:

| Section | Role |
|---|---|
| `WeakestTopicsSection` | next study targets |
| `TopicIntelligenceSection` | ranked next-topic intelligence |
| `ErrorPatternsSection` | mistake pattern to correct |

This should be the most action-oriented tab. If it cannot produce a recommended next quiz, the plan should call that out as a product gap.

### Practice

Answers: "What did my quizzes reveal?"

Default visible panels:

| Section | Role |
|---|---|
| `SessionHistorySection` | recent quiz trend |
| `AccuracyBySubjectSection` | where performance varies |
| `PacingInsightsSection` | pacing coaching in plain language |

Keep detailed pacing scatterplots and difficulty diagnostics secondary.

### Habits

Answers: "Am I practicing consistently enough?"

Default visible panels:

| Section | Role |
|---|---|
| `StudyStreakCalendarSection` | consistency signal |
| `TimelineHeatmapSection` | recent activity pattern |
| `ForgettingCurvesSection` | retention risk |

Stamina, mode mix, reading depth, and multimodal study are useful diagnostics but not default quiz-taking decisions.

## 5. Secondary Diagnostics

Secondary diagnostics must be explicit and on demand. MVP uses query subviews:

| Tab | Detail slug | Sections |
|---|---|---|
| `ready` | `readiness-diagnostics` | `SimulationTrajectorySection`, `IRTTrajectorySection`, `ProgressCardSection`, `RadarSection` |
| `ready` | `calibration` | `CalibrationScoreSection`, `ConfidenceCalibrationSection`, `MetacognitionSection` |
| `ready` | `exam-outcome` | `ExamOutcomeSection` |
| `practice` | `pacing` | `PacingQuadrantSection`, `PacingAccuracySection`, `DifficultyMasterySection`, `TimeSpentDistributionSection` |
| `habits` | `retention` | `MemorySection`, `StudyVelocitySection`, `RelearningVelocitySection`, `ReadingCorrelationSection`, `ReadingDepthSection`, `MasterySparklineSection` |
| `habits` | `stamina` | `StaminaSection`, `StaminaHeatmapSection`, `ModeFunnelSection`, `MultimodalStudySection` |

Invalid `detail` slugs and tab/detail mismatches must canonicalize to the base valid tab instead of rendering every diagnostic group.

Later versions may use a drawer or dedicated diagnostics route, but only after preserving the same primary/secondary separation.

Rejected pattern:

```text
[ Ready ][ Focus ][ Practice ][ Habits ][ Advanced ]
```

A generic `Advanced` tab recreates the old `Deep Insights` bucket.

## 6. Height And Density Budget

The 4-tab version should be easier to fit than the 6-tab/all-section version.

Recommended target:

| Area | Budget |
|---|---:|
| Tab strip | `36-44px` |
| Active tab header/coach line | `32-48px` |
| Primary panels per tab | 3, maximum 4 without product review |
| Desktop rows | 1-2 rows |
| Dashboard `<main>` scroll | no vertical scroll delta over `8px` at `1440x900`, `1512x982`, and `1920x1080` |

If a tab needs more than 4 default panels, treat that as evidence the tab needs a better summary card, not more raw charts.

## 7. Files Likely To Change Later

| File | Expected change |
|---|---|
| `src/lib/analytics/tabs.ts` | Change ids/labels to `ready`, `focus`, `practice`, `habits`; retain compatibility parsing for old ids if needed. |
| `src/components/analytics/AnalyticsTabNav.tsx` | Restyle from segmented pills to connected browser/notebook tabs. |
| `src/app/dashboard/analytics/_lib/tab-sections.tsx` | Reduce default panels to primary 12 and introduce secondary diagnostics grouping. |
| `src/app/dashboard/analytics/page.tsx` | Continue rendering only active/default panels; add detail query support only if implemented. |
| `e2e/analytics-dashboard-tabs.spec.ts` | Assert 4 tabs, primary panel cap, no default secondary rendering, tab affordance hooks/classes, mobile focus reachability. |

## 8. Verification Plan

- `bun run type-check`
- `bun run lint`
- `git diff --check`
- Playwright assertions:
  - only 4 primary tabs are visible,
  - each tab has no more than 4 primary panels,
  - no secondary diagnostic panel renders by default,
  - at `1440x900`, `1512x982`, and `1920x1080`, `document`, `body`, dashboard `<main>`, and active tab sheet each have vertical scroll delta `<= 8px`,
  - each canonical `detail` slug is reachable and invalid detail state canonicalizes safely,
  - mobile tab strip and scroll regions are keyboard/focus reachable,
  - `/dashboard/analytics/advanced` compatibility resolves to `/dashboard/analytics?tab=ready`.

## 9. Follow-Up Staffing

### Ralph

Recommended for the next implementation because the changes touch source architecture and UI styling together:

```text
$ralph implement .ai/03_plans/analytics-dashboard-redesign/11-relevance-first-tab-and-data-plan.md
```

### Team

Use team if implementation should be split:

| Lane | Role |
|---|---|
| UI/tab visual design | connected notebook/browser tab strip |
| Server registry/data trimming | primary vs secondary panel composition |
| QA | Playwright, screenshots, accessibility/focus checks |
