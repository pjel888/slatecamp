# 03 — Data Visualization Matrix

> Live inventory from source on 2026-05-16. Account for all 34 sections, but do **not** show all 34 by default. The current product direction is relevance-first: primary dashboard panels should help a quiz taker decide what to do next.

## Overview Route: 25 Sections

| # | Section | Visible primitive | Current height | Current source |
|---|---|---|---:|---|
| 1 | `SubjectMasteryServer` | mastery wheel + subject breakdown | `520px` | `src/components/dashboard/SubjectMasteryServer.tsx` |
| 2 | `ReadinessSection` | readiness trajectory | `220px` | `getReadinessSectionData()` |
| 3 | `ExamCountdownSection` | countdown/readiness card | `220px` | analytics action data |
| 4 | `TimelineHeatmapSection` | activity heatmap | `140px` | `getTimelineHeatmapData()` |
| 5 | `SessionHistorySection` | session trend line | `260px` | analytics action data |
| 6 | `ProgressCardSection` | monthly progress card | `280px` | analytics action data |
| 7 | `SimulationTrajectorySection` | simulation trajectory | `280px` | analytics action data |
| 8 | `PacingQuadrantSection` | pacing/accuracy scatter quadrant | `360px` | `getPacingQuadrantData()` |
| 9 | `StaminaSection` | stamina curve | `360px` | `getStaminaCurveData()` |
| 10 | `StaminaHeatmapSection` | stamina heatmap | `340px` | analytics action data |
| 11 | `DifficultyMasterySection` | difficulty/mastery scatter | `340px` | analytics action data |
| 12 | `AccuracyBySubjectSection` | subject accuracy bars | `280px` | analytics action data |
| 13 | `TimeSpentDistributionSection` | time distribution | `280px` | analytics action data |
| 14 | `ForgettingCurvesSection` | forgetting curves | `320px` | analytics action data |
| 15 | `StudyVelocitySection` | study velocity bars/line | `320px` | analytics action data |
| 16 | `RadarSection` | subject radar chart | `320px` | dashboard radar helpers |
| 17 | `MemorySection` | memory health map | `320px` | `getMemoryHealthData()` |
| 18 | `PacingInsightsSection` | pacing insight card | `320px` | analytics action data |
| 19 | `PacingAccuracySection` | pacing/accuracy correlation | `340px` | analytics action data |
| 20 | `CalibrationScoreSection` | Brier/calibration card | `280px` | calibration action data |
| 21 | `ConfidenceCalibrationSection` | confidence calibration chart | `280px` | calibration action data |
| 22 | `StudyStreakCalendarSection` | streak calendar | `280px` | analytics action data |
| 23 | `WeakestTopicsSection` | weakest topics bars | `320px` | analytics action data |
| 24 | `ErrorPatternsSection` | error pattern distribution | `320px` | analytics action data |
| 25 | `ExamOutcomeSection` | exam outcome form/card | `280px` | `reportExamOutcome` write path |

## Advanced Route: 9 Sections

| # | Section | Visible primitive | Current height | Current source |
|---|---|---|---:|---|
| A1 | `IRTTrajectorySection` | IRT theta trajectory | `320px` | `src/lib/actions/analytics/get-irt-data.ts` |
| A2 | `MasterySparklineSection` | mastery sparkline grid | `320px` | analytics mastery history data |
| A3 | `ModeFunnelSection` | mode funnel | `320px` | `get-mode-funnel.ts` |
| A4 | `MetacognitionSection` | metacognition chart | `320px` | `get-metacognition-data.ts` |
| A5 | `RelearningVelocitySection` | relearning velocity | `320px` | `get-relearning-data.ts` |
| A6 | `ReadingCorrelationSection` | reading/quiz correlation | `320px` | `get-reading-correlation-data.ts` |
| A7 | `ReadingDepthSection` | reading depth heatmap | `320px` | `get-reading-depth-data.ts` |
| A8 | `MultimodalStudySection` | study mode mix | `320px` | `get-multimodal-study-data.ts` |
| A9 | `TopicIntelligenceSection` | topic intelligence cards | `400px` | `get-topic-intelligence-data.ts` |

## Relevance-First Primary Mapping

| Primary tab | User question | Default visible sections | Count |
|---|---|---|---:|
| Ready | "Am I on track for the LEA?" | `ReadinessSection`, `SubjectMasteryServer`, `ExamCountdownSection` | 3 |
| Focus | "What should I quiz or review next?" | `WeakestTopicsSection`, `TopicIntelligenceSection`, `ErrorPatternsSection` | 3 |
| Practice | "What did my quizzes reveal?" | `SessionHistorySection`, `AccuracyBySubjectSection`, `PacingInsightsSection` | 3 |
| Habits | "Am I practicing consistently enough?" | `StudyStreakCalendarSection`, `TimelineHeatmapSection`, `ForgettingCurvesSection` | 3 |

Primary default total: **12 visible sections**.

### Primary Panel Relevance Rationale

| Tab | Panel | Passes relevance test | Why visible by default | Nearby alternatives kept secondary |
|---|---|---|---|---|
| Ready | `ReadinessSection` | Exam readiness | Gives the clearest current on-track/off-track signal. | `SimulationTrajectorySection` and `IRTTrajectorySection` are useful trends, but not the first decision. |
| Ready | `SubjectMasteryServer` | Next quiz, exam readiness | Shows which subject area threatens readiness and can drive the next quiz choice. | `RadarSection` is less actionable and stays diagnostic. |
| Ready | `ExamCountdownSection` | Exam readiness | Converts readiness into time pressure and urgency. | `ProgressCardSection` is broader reporting and stays diagnostic. |
| Focus | `WeakestTopicsSection` | Next quiz, error correction | Directly identifies what the learner should quiz or review next. | `MasterySparklineSection` is historical context and stays diagnostic. |
| Focus | `TopicIntelligenceSection` | Next quiz | Best fit for ranked next-topic recommendations. | Reading and memory analytics are supporting diagnostics, not default decisions. |
| Focus | `ErrorPatternsSection` | Error correction | Names the mistake pattern to fix now. | Calibration/metacognition charts are explanatory, not default action cards. |
| Practice | `SessionHistorySection` | Next quiz, exam readiness | Shows recent quiz trend without forcing the learner into raw diagnostics. | Simulation trajectory and IRT remain deeper readiness diagnostics. |
| Practice | `AccuracyBySubjectSection` | Next quiz, error correction | Quickly reveals subject-level performance gaps. | Difficulty and time-spent breakdowns stay secondary. |
| Practice | `PacingInsightsSection` | Next quiz, pacing behavior | Provides plain-language pacing coaching. | `PacingQuadrantSection` and `PacingAccuracySection` are raw diagnostics. |
| Habits | `StudyStreakCalendarSection` | Study consistency | Gives the simplest consistency signal. | Mode funnel and multimodal mix are secondary behavior diagnostics. |
| Habits | `TimelineHeatmapSection` | Study consistency | Shows recent practice distribution and missed days. | `StudyVelocitySection` is useful but less immediate. |
| Habits | `ForgettingCurvesSection` | Next quiz, study consistency | Flags retention risk that can drive review selection. | `MemorySection` and relearning/reading charts remain retention diagnostics. |

## Secondary Diagnostics Mapping

| Tab | Detail slug | Secondary group | Sections | Default visibility |
|---|---|---|---|---|
| `ready` | `readiness-diagnostics` | Readiness diagnostics | `SimulationTrajectorySection`, `IRTTrajectorySection`, `ProgressCardSection`, `RadarSection` | Hidden until selected |
| `ready` | `calibration` | Calibration diagnostics | `CalibrationScoreSection`, `ConfidenceCalibrationSection`, `MetacognitionSection` | Hidden until selected |
| `ready` | `exam-outcome` | Exam outcome | `ExamOutcomeSection` | Hidden until selected; write path must remain safe |
| `practice` | `pacing` | Performance diagnostics | `PacingQuadrantSection`, `PacingAccuracySection`, `DifficultyMasterySection`, `TimeSpentDistributionSection` | Hidden until selected |
| `habits` | `retention` | Learning/retention diagnostics | `MemorySection`, `StudyVelocitySection`, `RelearningVelocitySection`, `ReadingCorrelationSection`, `ReadingDepthSection`, `MasterySparklineSection` | Hidden until selected |
| `habits` | `stamina` | Habit diagnostics | `StaminaSection`, `StaminaHeatmapSection`, `ModeFunnelSection`, `MultimodalStudySection` | Hidden until selected |

Invalid `detail` slugs and tab/detail mismatches must canonicalize to the base valid tab. They must not render all secondary diagnostics as a fallback.

## Implementation Guardrail

The mapping above intentionally accounts for all 34 sections while showing only 12 by default. If later implementation changes the count, update this file in the same diff and state whether the change is primary, secondary, relocation, deferral, or removal.
