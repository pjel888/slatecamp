# 11 - Relevance-First Tab And Data Plan

> **Status**: Superseding planning update, 2026-05-16
> **Purpose**: Refine the first dense-tab plan after product review: the dashboard should look more like physical browser/notebook tabs and should show only quiz-relevant analytics by default.
> **Boundary**: Planning only. This document does not authorize source implementation by itself.

## 1. Decision

Move from a 6-tab, all-34-visible analytics workspace to a **4-tab learner dashboard** with a secondary diagnostics layer.

Default tabs:

```text
Ready | Focus | Practice | Habits
```

The current 34-section inventory remains accounted for, but only the most actionable sections should be visible by default. The analytics page is for a candidate deciding what quiz to take, what topic to review, and whether they are on track for the LEA. It is not a business intelligence console.

## 2. RALPLAN-DR Summary

### Principles

1. **Quiz relevance first**: a visible metric must change the learner's next quiz, study topic, pacing behavior, or confidence judgment.
2. **One screen, few decisions**: each tab should show 3 primary panels, with clear hierarchy.
3. **Physical tab affordance**: tabs should read like connected browser/notebook tabs, not pill buttons floating above a card.
4. **Diagnostics are secondary**: advanced charts remain available for drill-in, not default dashboard payload.
5. **No hidden fetch tax**: inactive/secondary detail should not fetch by default.

### Decision Drivers

| Driver | Implication |
|---|---|
| Quiz-taking context | Prioritize readiness, weak topics, recent performance, and habits over expert diagnostics. |
| Cognitive load | Reduce equal-weight charts; default page should not make the learner interpret 30+ panels. |
| Existing source shape | Reuse the query-state tab architecture, server-only registry, and compact variants from the prior pass. |

### Viable Options

| Option | Pros | Cons | Verdict |
|---|---|---|---|
| A. Keep 6 tabs and restyle them | Minimal source churn; all current sections stay visible | Still too much analytics for a quiz-taking product; labels feel like reporting categories | Reject |
| B. Use 4 primary tabs plus secondary details | Matches learner questions; reduces visible payload; keeps existing architecture | Requires deliberate deferral/more-detail policy | Choose |
| C. Single "coach" screen with expandable modules | Strongest simplification | Bigger product/design change; would erase tab affordance user requested | Defer |

## 3. Tab UI Contract

The tab control should visually behave like browser tabs or notebook file tabs:

- Active tab connects to the content sheet through shared border/background.
- Inactive tabs sit behind the active tab, with a visible bottom border or tucked edge.
- Do not use the current segmented-pill look as the final UI.
- Do not wrap the whole dashboard in a decorative centered card.
- Keep labels short: `Ready`, `Focus`, `Practice`, `Habits`.
- Each tab may include a small supporting label below or inside the connected sheet, not inside every tab.
- Desktop target height: `36-44px` for the tab strip.
- Mobile: horizontal file-tab strip with full accessible names and visible active state.

Suggested visual structure:

```text
[ Ready ][ Focus ][ Practice ][ Habits ]______
|                                           |
| active tab content sheet                 |
|                                           |
```

The active tab should look physically attached to the content area. This is the main UI correction from the current flat pill/segmented nav.

## 4. Relevance Filter

Before any analytics panel is visible by default, it must pass at least one test:

| Test | Question |
|---|---|
| Next quiz | Does this change what quiz mode/topic/difficulty the learner should start next? |
| Exam readiness | Does this change whether the learner is on pace for the LEA? |
| Error correction | Does this explain the most common mistake pattern to fix now? |
| Study consistency | Does this reveal whether the learner is building enough practice habit? |

If the answer is no, the panel belongs in secondary diagnostics, a details drawer, an advanced route, or an admin/coach surface.

## 5. Primary Dashboard Payload

Default visible payload should start at **12 panels total**.

| Tab | User question | Primary visible panels | Default panel count |
|---|---|---|---:|
| Ready | "Am I on track for the LEA?" | `ReadinessSection`, `SubjectMasteryServer`, `ExamCountdownSection` | 3 |
| Focus | "What should I quiz or review next?" | `WeakestTopicsSection`, `TopicIntelligenceSection`, `ErrorPatternsSection` | 3 |
| Practice | "What did my quizzes reveal?" | `SessionHistorySection`, `AccuracyBySubjectSection`, `PacingInsightsSection` | 3 |
| Habits | "Am I practicing consistently enough?" | `StudyStreakCalendarSection`, `TimelineHeatmapSection`, `ForgettingCurvesSection` | 3 |

The exact component implementation may combine, summarize, or replace panels if the future design creates a better learner-facing card from the same data. The acceptance rule is that the default view must not exceed four panels per tab without product review.

### Primary Panel Rationale

| Tab | Panel | Passes relevance test | Why it remains visible | Nearby alternatives kept secondary |
|---|---|---|---|---|
| Ready | `ReadinessSection` | Exam readiness | Clearest answer to "am I on track?" | Trajectory and IRT views are secondary diagnostics. |
| Ready | `SubjectMasteryServer` | Next quiz, exam readiness | Shows subject risk that can change the next quiz choice. | Radar is less actionable as a default view. |
| Ready | `ExamCountdownSection` | Exam readiness | Adds time pressure and urgency. | Monthly progress stays secondary. |
| Focus | `WeakestTopicsSection` | Next quiz, error correction | Directly identifies next review targets. | Historical mastery sparkline stays secondary. |
| Focus | `TopicIntelligenceSection` | Next quiz | Best fit for ranked topic recommendations. | Reading and retention charts support, but do not lead, this decision. |
| Focus | `ErrorPatternsSection` | Error correction | Tells the learner what mistake pattern to fix now. | Calibration/metacognition charts explain confidence, not the default next action. |
| Practice | `SessionHistorySection` | Next quiz, exam readiness | Recent quiz trend is the fastest performance scan. | Simulation and IRT trends remain deeper diagnostics. |
| Practice | `AccuracyBySubjectSection` | Next quiz, error correction | Shows performance gaps by subject. | Difficulty and time-spent charts stay diagnostic. |
| Practice | `PacingInsightsSection` | Pacing behavior | Gives coaching without raw scatterplot interpretation. | Pacing quadrant/correlation charts stay secondary. |
| Habits | `StudyStreakCalendarSection` | Study consistency | Most direct consistency signal. | Mode funnel and multimodal mix stay secondary. |
| Habits | `TimelineHeatmapSection` | Study consistency | Shows recent rhythm and missed practice windows. | Study velocity stays secondary. |
| Habits | `ForgettingCurvesSection` | Next quiz, study consistency | Flags review risk that can change topic choice. | Memory, relearning, and reading-depth views stay retention diagnostics. |

## 6. Secondary Diagnostics

Secondary panels remain accounted for but should not be visible by default:

| Tab | Detail slug | Secondary group | Sections |
|---|---|---|---|
| `ready` | `readiness-diagnostics` | Readiness diagnostics | `SimulationTrajectorySection`, `IRTTrajectorySection`, `ProgressCardSection`, `RadarSection` |
| `ready` | `calibration` | Calibration diagnostics | `CalibrationScoreSection`, `ConfidenceCalibrationSection`, `MetacognitionSection` |
| `ready` | `exam-outcome` | Exam outcome | `ExamOutcomeSection` |
| `practice` | `pacing` | Performance diagnostics | `PacingQuadrantSection`, `PacingAccuracySection`, `DifficultyMasterySection`, `TimeSpentDistributionSection` |
| `habits` | `retention` | Learning/retention diagnostics | `MemorySection`, `StudyVelocitySection`, `RelearningVelocitySection`, `ReadingCorrelationSection`, `ReadingDepthSection`, `MasterySparklineSection` |
| `habits` | `stamina` | Habit diagnostics | `StaminaSection`, `StaminaHeatmapSection`, `ModeFunnelSection`, `MultimodalStudySection` |

MVP secondary access contract:

1. Use only the canonical query subviews listed in the table above.
2. Render/fetch only the selected detail group.
3. If detail rendering is deferred from the first source pass, make that explicit in code/docs; do not silently drop the mapped diagnostics.
4. `ExamOutcomeSection` must remain reachable through `?tab=ready&detail=exam-outcome` or a later dedicated outcome surface because it is the one write-capable analytics path.
5. Invalid `detail` slugs and tab/detail mismatches canonicalize to the base valid tab; they must not render all secondary diagnostics.

Do not add a generic `Advanced` tab as a dumping ground. That recreates the old `Deep Insights` problem.

## 7. Default Tab Guidance

Default tab should be `Ready`, not `Overview`.

`Ready` should include a single clear answer above the grid:

```text
You are [on track / behind / ready]. Do this next: [recommended quiz action].
```

If the implementation cannot yet generate a recommended quiz action, use the strongest available proxy:

- weakest subject/topic,
- readiness trend direction,
- countdown urgency,
- most recent quiz performance.

## 8. Implementation Implications

The prior query-state/server-registry architecture is still correct. The next implementation should change:

- `ANALYTICS_TAB_IDS` from 6 ids to 4 ids, with old-id aliases:
  - `readiness` -> `ready`
  - `performance` -> `practice`
  - `topics` -> `focus`
  - `learning` -> `habits&detail=retention`
  - `behavior` -> `habits`
  - `calibration` -> `ready&detail=calibration`
- `/dashboard/analytics/advanced` -> `/dashboard/analytics?tab=ready`.
- `ANALYTICS_TABS` labels to short file-tab labels.
- `ANALYTICS_TAB_PANELS` so each primary panel renders only 3 default panels.
- Secondary diagnostics must be moved out of default rendering and fetched only when opened.
- `AnalyticsTabNav` visual styling should become connected browser/notebook tabs, not segmented pills.
- E2E tests should assert panel count, tab visual affordance hooks/classes, no default render of secondary diagnostics, and no page-level scroll.
- E2E tests should assert the hard no-scroll gate at `1440x900`, `1512x982`, and `1920x1080` for `document`, `body`, dashboard `<main>`, and the active tab sheet.
- Detail tests should assert each canonical `detail` slug is reachable, invalid slugs canonicalize safely, and unopened detail groups remain absent.

## 9. Acceptance Criteria

- [ ] Default analytics view has 4 primary tabs: `Ready`, `Focus`, `Practice`, `Habits`.
- [ ] Tab UI visually reads as connected notebook/browser tabs, not pills.
- [ ] No primary tab renders more than 4 visible panels by default.
- [ ] Default visible payload is about 12 panels total, not 34.
- [ ] Every hidden/deferred section is mapped to a secondary diagnostics group.
- [ ] Inactive tabs and unopened detail panels do not fetch/render by default.
- [ ] At `1440x900`, `1512x982`, and `1920x1080`, `document`, `body`, dashboard `<main>`, and active tab sheet each have vertical scroll delta `<= 8px`.
- [ ] Every canonical secondary `detail` slug is reachable and fetches/renders only its mapped group.
- [ ] Invalid `detail` slugs and tab/detail mismatches canonicalize to the base valid tab.
- [ ] Mobile tab strip remains usable and panel overflow is focusable/reachable.

## 10. Follow-Up Staffing

### Ralph

Use Ralph for a single-owner implementation when ready. Suggested prompt:

```text
$ralph implement .ai/03_plans/analytics-dashboard-redesign/11-relevance-first-tab-and-data-plan.md
```

Reasoning: high. Scope: analytics tabs, tab nav styling, server-only panel registry, E2E coverage.

### Team

Use team only if separating UI tab styling, panel registry changes, and Playwright tests into parallel lanes. Suggested lanes:

| Lane | Ownership |
|---|---|
| Frontend UI | `AnalyticsTabNav`, tab sheet styling, responsive visual polish |
| Server/registry | tab ids, metadata, `tab-sections.tsx`, secondary diagnostics policy |
| QA | Playwright tests, visual screenshots, keyboard/mobile checks |

## 11. ADR

**Decision**: Use 4 physical-looking learner tabs and show only primary quiz-relevant analytics by default.

**Drivers**: learner focus, quiz-taking context, low cognitive load, source architecture already supports active-tab rendering.

**Alternatives considered**: keep 6 tabs; single coach screen; generic advanced tab.

**Why chosen**: 4 tabs are easier to scan, map to real learner questions, and prevent the analytics route from becoming a BI surface.

**Consequences**: some existing charts move behind secondary detail. This is intentional, not chart loss. Implementation must keep data accounted for and fetch secondary content on demand.

**Follow-ups**: design the physical tab visual treatment, define secondary diagnostics UI, and write tests that fail if all 34 sections return to default rendering.
