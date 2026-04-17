# Analytics Cross-Feature Expansion Plan <!-- updated: 2026-04-09 -->

**Created:** 2026-04-09
**Companion to:** `.ai/plans/analytics-gap-remediation-plan-2026-04-09.md`
**Source specs:** `006-analytics.md`, `002-drill-feature-specification.md`, `004-wiki-feature-specification.md`
**Purpose:** Implementation plan for 15 new analytics sections (7 student + 8 CEO/business) drawing data from drills, wiki, and behavioral systems.

---

## 0. Executive Summary

SlateCamp's drill and wiki features generate rich data across 20+ Supabase tables that the analytics dashboard currently ignores. This plan adds:

- **7 new student-facing analytics sections** to `/dashboard/analytics`
- **8 new CEO/business analytics sections** to `/ceo` portal
- **Data pipeline work** to populate currently-empty tables (`user_theta`, `session_predictions`, etc.)
- **Cross-feature correlation** between reading (wiki) and drilling performance

**Total estimated effort:** ~40h across 6 expansion phases
**Prerequisite:** Gap remediation Phases 0-1 must complete first (shared infrastructure)

---

## 1. Coordination Matrix <!-- updated: 2026-04-09 -->

This plan's phases interleave with the gap remediation plan. The left column is remediation, the right is expansion.

```
REMEDIATION                            EXPANSION
═══════════                            ═════════
Phase 0: Foundations (4h)      ──────► UNBLOCKS all expansion phases
Phase 1A: Error Boundaries (2h) ────► UNBLOCKS all expansion phases
Phase 1B: Result Types (5h)  ──┐
Phase 2: Design Tokens (3h)  ──┤     EX-Phase 0: Data Pipeline (6h) — can run parallel
Phase 3: Consistency (2h)    ──┤     EX-Phase 0.5: Tab Infrastructure (2h) — after EX-0
Phase 4: Performance (4h)   ──┤     EX-Phase 1: Student Drill Intel (8h) — after EX-0.5
Phase 5: Orphan Resolution (3h)┤     EX-Phase 2: Reading Intel (6h) — after EX-0.5
Phase 6: Accessibility (3h) ──┤     EX-Phase 3: CEO Core (8h) — after EX-0
Phase 7: Empty States (3h)  ──┘     EX-Phase 4: CEO Advanced (6h) — after EX-3
                                     EX-Phase 5: Cross-Feature (6h) — after EX-1+2
```

**Key dependencies:**
- EX-Phase 0 can start as soon as remediation Phase 0 completes, running in parallel with remediation Phases 1B-7.
- EX-Phase 0.5 (Tab Infrastructure) must complete before EX-Phase 1 and EX-Phase 2 can place sections.
- EX-Phase 0.0 (verification pass) runs first within EX-Phase 0 to de-risk assumptions.

---

## 2. EX-Phase 0: Data Pipeline Prerequisites <!-- updated: 2026-04-09 -->

**Priority:** P1 (high — unblocks all expansion)
**Estimated effort:** 6h
**Dependencies:** Remediation Phase 0 (shared-helpers.ts, chart-colors.ts)

**Rationale:** Several tables exist in schema but have 0 rows because the write-side isn't wired yet. These pipelines must be activated before analytics can read from them.

### Tasks

| Task | Table | Current Rows | Change | Files to Modify |
|------|-------|-------------|--------|----------------|
| EX-0.0 Component verification pass (30min) | N/A | N/A | **Before any pipeline work:** Confirm each target component exists, renders, and its server action exists. Check: `PredictionSlider.tsx` has submit handler, `PostdictionPrompt.tsx` renders, `WikiReadTracker.tsx` calls `recordArticleRead()`, `wiki-reads.ts` exists. If any are stubs or broken, document scope expansion. | Read-only — no modifications |
| EX-0.1 Wire `user_theta` writes | `user_theta` | 0 | After each completed session, compute theta via IRT engine and upsert to `user_theta`. Add to post-session hooks in `end-session.ts`. Use `waitUntil()` / fire-and-forget — must not add latency to session end. | `src/lib/actions/quiz-v2/end-session.ts`, `src/lib/srs/irt.ts` |
| EX-0.2 Wire `session_predictions` writes | `session_predictions` | 0 | `PredictionSlider` and `PostdictionPrompt` components exist but don't persist. Add server action to save prediction data. | Create `src/lib/actions/quiz-v2/save-prediction.ts`, modify `PredictionSlider.tsx`, `PostdictionPrompt.tsx` |
| EX-0.3 Wire `wiki_article_reads` writes | `wiki_article_reads` | 0 | `WikiReadTracker` component exists and tracks scroll depth + time. Verify it calls `recordArticleRead()` and `updateReadProgress()` from `wiki-reads.ts`. If not wired, connect. | `src/components/wiki/shared/WikiReadTracker.tsx`, `src/lib/actions/wiki-reads.ts` |
| EX-0.4 Wire `analytics_events` writes | `analytics_events` | 0 | Create lightweight `trackEvent(eventName, properties)` server action. Instrument key touchpoints: first drill start, zone transitions, first wiki read, first bookmark. | Create `src/lib/actions/analytics-events.ts`, instrument 4-5 key actions |
| EX-0.5 Verify wiki tracking tables | `wiki_bookmarks`, `wiki_highlights`, `wiki_ei_responses` | 0 | These should already be written by wiki components. Verify the server actions actually execute. If writes fail silently, fix. | `src/lib/actions/wiki-actions.ts` |
| EX-0.6 Create analytics query helpers | N/A | N/A | Create `src/lib/actions/analytics/cross-feature-data.ts` with shared helpers for joining drill + wiki data. Reuse `shared-helpers.ts` (from remediation Phase 0). | Create new file |

### Verification
- [ ] `user_theta` gets a row after completing a drill session
- [ ] `session_predictions` gets a row when PredictionSlider is used
- [ ] `wiki_article_reads` gets a row after reading an article with scroll tracking
- [ ] `analytics_events` gets a row for tracked touchpoints
- [ ] All wiki tracking tables verified operational

### Open Questions
- ⚠️ NEEDS PRODUCT INPUT: Should `analytics_events` track client-side events (via server action) or server-side events only? Client-side gives more coverage but adds network requests.

---

## 2.5. EX-Phase 0.5: Tab Infrastructure <!-- updated: 2026-04-09 -->

**Priority:** P1 (high — unblocks student analytics placement)
**Estimated effort:** 2h
**Dependencies:** EX-Phase 0, Remediation Phase 0

**Rationale:** The "Advanced Insights" tab decision requires actual route/UI infrastructure before EX-Phase 1 can place sections. Creating `/dashboard/analytics/advanced/page.tsx` as a parallel route reuses the same layout, shared components, and Suspense infrastructure.

### Tasks

| Task | Files | Change Description | Verification |
|------|-------|-------------------|-------------|
| EX-0.5.1 Create advanced analytics route | Create `src/app/dashboard/analytics/advanced/page.tsx`, `src/app/dashboard/analytics/advanced/loading.tsx` | New page.tsx that will house the 9 expansion student sections. Uses same `AnalyticsPageLayout` via parent layout. `loading.tsx` with skeleton grid. `export const dynamic = 'force-dynamic'`. | Route `/dashboard/analytics/advanced` renders empty state initially |
| EX-0.5.2 Add tab navigation to analytics layout | Modify `src/app/dashboard/analytics/layout.tsx` | Add a tab bar component below `SharedPageLayout` with two tabs: "Overview" (`/dashboard/analytics`) and "Advanced Insights" (`/dashboard/analytics/advanced`). Use shadcn `Tabs` or a simple `nav` with `Link` components. Active tab determined by `usePathname()`. | Both tabs render, clicking switches routes, active state highlights correctly |
| EX-0.5.3 Update AGENTS.md | Modify `src/app/dashboard/analytics/AGENTS.md` | Document the new `advanced/` subdirectory, tab navigation pattern, and that expansion sections go in `advanced/page.tsx`. | Agent docs accurate |

### Codebase AI Execution Notes
- Files to read: `src/app/dashboard/analytics/layout.tsx`, `src/app/dashboard/analytics/page.tsx` (for pattern reference)
- The tab bar must be a Client Component (needs `usePathname`) — keep it minimal, extract to `src/components/analytics/AnalyticsTabNav.tsx`
- URL sharing: tabs are separate routes, so `/dashboard/analytics/advanced` is directly linkable

---

## 3. EX-Phase 1: Student Analytics — Drill Intelligence <!-- updated: 2026-04-09 -->

**Priority:** P1 (high)
**Estimated effort:** 8h
**Dependencies:** EX-Phase 0, Remediation Phase 0+1

**New sections to add to `/dashboard/analytics`:**

### EX-1.1 IRT Ability Trajectory

**Data Source:** `user_theta` (theta, theta_se, responses_count, updated_at)
**Chart Type:** Recharts AreaChart — theta value as line, ± SE as shaded band
**Pattern:** Server Section (`IRTTrajectorySection`) → dynamic import → Client (`IRTTrajectoryChart`)
**Files to create:**
- `src/components/analytics/IRTTrajectorySection.tsx` (server, async)
- `src/components/analytics/IRTTrajectoryChart.tsx` (client, recharts)
- `src/lib/actions/analytics/get-irt-data.ts` (server action)

**Query:**
```sql
SELECT theta, theta_se, responses_count, updated_at
FROM user_theta
WHERE user_id = $1
ORDER BY updated_at ASC
LIMIT 50
```

**Empty state:** "Complete more drills to see your ability trajectory."
**Value:** Most scientifically rigorous progress metric — shows actual IRT ability estimate, not just raw accuracy.

### EX-1.2 Mastery History Sparklines

**Data Source:** `user_mastery_history` (topic_id, mastery_weight, created_at)
**Chart Type:** Small multiples — grid of tiny sparklines per topic
**Pattern:** Server Section → direct import → Client
**Files to create:**
- `src/components/analytics/MasterySparklineSection.tsx`
- `src/components/analytics/MasterySparklineGrid.tsx`
- `src/lib/actions/analytics/get-mastery-history.ts`

**Query:**
```sql
SELECT topic_id, mastery_weight, created_at
FROM user_mastery_history
WHERE user_id = $1
ORDER BY created_at ASC
```
Group by topic_id, join with `taxonomy_tree` for names.

**Empty state:** "Mastery trends appear after multiple drill sessions."
**Value:** Shows trajectory per topic — is it improving, plateauing, or declining?

### EX-1.3 Study Mode Funnel

**Data Source:** `quiz_sessions` (test_mode, started_at, status)
**Chart Type:** Stacked area chart or alluvial — mode usage over time, colored by zone
**Pattern:** Server Section → dynamic import → Client
**Files to create:**
- `src/components/analytics/ModeFunnelSection.tsx`
- `src/components/analytics/ModeFunnel.tsx`
- `src/lib/actions/analytics/get-mode-funnel.ts`

**Query:**
```sql
SELECT test_mode, date_trunc('week', started_at) as week, count(*)
FROM quiz_sessions
WHERE user_id = $1 AND status = 'completed'
GROUP BY test_mode, week
ORDER BY week ASC
```

**Empty state:** "Complete drills across different modes to see your progression."
**Value:** Visualizes zone progression — are you moving from Foundations to Exam Readiness?

### EX-1.4 Metacognitive Accuracy

**Data Source:** `session_predictions` (predicted_score, actual_score, postdiction_score)
**Chart Type:** Recharts ScatterChart — predicted (X) vs actual (Y) with perfect calibration diagonal
**Pattern:** Server Section → dynamic import → Client
**Files to create:**
- `src/components/analytics/MetacognitionSection.tsx`
- `src/components/analytics/MetacognitionChart.tsx`
- `src/lib/actions/analytics/get-metacognition-data.ts`

**Empty state:** "Use the prediction slider before drills to track your self-assessment accuracy."
**Value:** "Are you getting better at knowing what you know?"

### EX-1.5 Relearning Velocity

**Data Source:** `successive_relearning_cycles` (topic_id, status, cycle_count, created_at)
**Chart Type:** Horizontal bar chart — cycles to mastery per topic
**Pattern:** Server Section → direct import → Client
**Files to create:**
- `src/components/analytics/RelearningVelocitySection.tsx`
- `src/components/analytics/RelearningVelocity.tsx`
- `src/lib/actions/analytics/get-relearning-data.ts`

**Empty state:** "Successive relearning data appears after focus-review sessions."
**Value:** Shows which topics required multiple relearning cycles — highlights persistent weak spots.

### Verification (all EX-Phase 1)
- [ ] All 5 new sections render with data from populated tables
- [ ] All 5 new sections show `ChartEmptyState` when data is empty
- [ ] All 5 wrapped in `AnalyticsErrorBoundary`
- [ ] All 5 use `dynamic()` import pattern (consistent with remediation Phase 3)
- [ ] `bun run type-check` passes
- [ ] Page layout updated in `page.tsx` with new rows

---

## 4. EX-Phase 2: Student Analytics — Reading Intelligence <!-- updated: 2026-04-09 -->

**Priority:** P1 (high)
**Estimated effort:** 6h
**Dependencies:** EX-Phase 0 (wiki tracking verified), Remediation Phase 0+1

### EX-2.1 Reading ↔ Drilling Correlation

**Data Source:** `wiki_article_reads` (scroll depth, time) + `user_node_mastery` (mastery weight), joined via `wiki_article_taxonomy` → `taxonomy_tree`
**Chart Type:** Recharts ScatterChart — X: reading depth, Y: mastery weight, bubble size: drill count
**Files to create:**
- `src/components/analytics/ReadingCorrelationSection.tsx`
- `src/components/analytics/ReadingCorrelationChart.tsx`
- `src/lib/actions/analytics/get-reading-correlation.ts`

**Value:** "Topics you read AND drilled perform better" — reinforces multimodal study habit.

### EX-2.2 Reading Depth Map

**Data Source:** `wiki_article_reads` (article_id, read_pct, time_spent) + `wiki_article_taxonomy` + `taxonomy_tree`
**Chart Type:** Custom heatmap overlay on taxonomy grid (similar to existing TimelineHeatmap pattern)
**Files to create:**
- `src/components/analytics/ReadingDepthSection.tsx`
- `src/components/analytics/ReadingDepthMap.tsx`
- `src/lib/actions/analytics/get-reading-depth.ts`

**Value:** Shows which curriculum areas are deeply read vs skimmed — guides study planning.

### Verification (EX-Phase 2)
- [ ] Both sections render with wiki reading data
- [ ] Correlation chart correctly joins wiki reads → taxonomy → mastery
- [ ] Reading depth map aligns with taxonomy heatmap structure
- [ ] Empty states for users with no wiki reads

---

## 5. EX-Phase 3: CEO/Business Analytics — Core <!-- updated: 2026-04-09 -->

**Priority:** P2 (medium)
**Estimated effort:** 8h
**Dependencies:** EX-Phase 0 (analytics_events wired)

**These sections live in the CEO portal (`/ceo`), NOT the student analytics page.**

### EX-3.1 Feature Adoption Funnel

**Data Source:** `analytics_events` + `quiz_sessions` + `wiki_article_reads` + `profiles`
**Chart Type:** Funnel chart or horizontal stacked bar
**Metrics:**
1. Signed up (profiles count)
2. First drill started (first quiz_session per user)
3. Reached Zone 2 (first session with Zone 2 mode)
4. Reached Zone 3 (first session with Zone 3 mode)
5. Took full simulation (first proof_sim session)
6. Read first wiki article (first wiki_article_reads per user)

**Files to create:**
- `src/components/ceo/analytics/AdoptionFunnelSection.tsx`
- `src/components/ceo/analytics/AdoptionFunnel.tsx`
- `src/lib/queries/ceo/get-adoption-funnel.ts`

**Value:** Where do users drop off? Directly informs onboarding and product improvements.

### EX-3.2 Content Effectiveness

**Data Source:** `wiki_article_reads` + `wiki_article_feedback` + `user_node_mastery` + `wiki_articles`
**Chart Type:** Table + scatter plot — articles ranked by "mastery lift" (mastery change after reading)
**Files to create:**
- `src/components/ceo/analytics/ContentEffectivenessSection.tsx`
- `src/components/ceo/analytics/ContentEffectiveness.tsx`
- `src/lib/queries/ceo/get-content-effectiveness.ts`

**Value:** Which articles actually improve student outcomes? Prioritize content investment.

### EX-3.3 Engagement Depth Score

**Data Source:** Composite from `wiki_highlights`, `wiki_bookmarks`, `teach_back_submissions`, `wiki_ei_responses`, `session_behavioral_summaries`
**Chart Type:** Card with composite score + breakdown bars
**Metrics:** Weighted composite: highlights (0.15) + bookmarks (0.1) + teach-backs (0.25) + EI responses (0.2) + session quality (0.3)
**Files to create:**
- `src/components/ceo/analytics/EngagementDepthSection.tsx`
- `src/components/ceo/analytics/EngagementDepthCard.tsx`
- `src/lib/queries/ceo/get-engagement-depth.ts`

**Value:** Beyond DAU/MAU — are users deeply engaged or just clicking through?

### EX-3.4 Content Coverage Gap

**Data Source:** `taxonomy_tree` LEFT JOIN `wiki_articles` LEFT JOIN `questions`
**Chart Type:** Treemap or colored taxonomy grid — green (both), yellow (one), red (neither)
**Files to create:**
- `src/components/ceo/analytics/CoverageGapSection.tsx`
- `src/components/ceo/analytics/CoverageGapMap.tsx`
- `src/lib/queries/ceo/get-coverage-gap.ts`

**Value:** Product roadmap input — where to invest content next.

### Verification (EX-Phase 3)
- [ ] All 4 sections render in CEO portal
- [ ] Adoption funnel counts match manual verification
- [ ] Content effectiveness correctly joins reads → mastery
- [ ] Coverage gap identifies topics with no articles or no questions

---

## 6. EX-Phase 4: CEO/Business Analytics — Advanced <!-- updated: 2026-04-09 -->

**Priority:** P2 (medium)
**Estimated effort:** 6h
**Dependencies:** EX-Phase 3, EX-Phase 0

### EX-4.1 Predictive Pass Rate

**Data Source:** `user_theta` + `exam_outcomes`
**Chart Type:** Line chart — projected pass rate by cohort over time, validated against actual outcomes when available
**Files to create:**
- `src/components/ceo/analytics/PassRateSection.tsx`
- `src/components/ceo/analytics/PassRateChart.tsx`
- `src/lib/queries/ceo/get-pass-rate.ts`

**Value:** The ultimate business metric — "does SlateCamp work?" Investor-grade evidence.

### EX-4.2 CAGE Signal Quality

**Data Source:** `interaction_signal_traces` + `cage_binding_tokens` + `session_behavioral_summaries.integrity_flag_counts`
**Chart Type:** Dashboard card with metrics: verification success rate, anomaly rate, signal coverage
**Files to create:**
- `src/components/ceo/analytics/CAGEQualitySection.tsx`
- `src/components/ceo/analytics/CAGEQualityDashboard.tsx`
- `src/lib/queries/ceo/get-cage-quality.ts`

**Value:** Patent value demonstration — quantifies behavioral signal integrity for IP valuation.

### EX-4.3 Study Pattern Cohorts

**Data Source:** `quiz_sessions` (timing, frequency, mode distribution) + `wiki_article_reads`
**Chart Type:** Bubble chart or cluster visualization — user archetypes
**Cohorts:** Crammer (high volume, short period), Steady (regular cadence), Deep Diver (high wiki reads + drills), Skimmer (many sessions, low depth)
**Files to create:**
- `src/components/ceo/analytics/StudyCohortSection.tsx`
- `src/components/ceo/analytics/StudyCohortChart.tsx`
- `src/lib/queries/ceo/get-study-cohorts.ts`

**Value:** Personalization strategy + marketing segmentation.

### EX-4.4 Question Bank Health

**Data Source:** `questions` + `user_interactions` (aggregate across all users)
**Chart Type:** Table with sortable columns — discrimination index, difficulty distribution, usage rate
**Files to create:**
- `src/components/ceo/analytics/QuestionHealthSection.tsx`
- `src/components/ceo/analytics/QuestionHealthTable.tsx`
- `src/lib/queries/ceo/get-question-health.ts`

**Note:** This requires service-role queries (aggregate across all users), not user-scoped. Use `createServiceClient()`.
**Value:** Content team efficiency — which questions need revision or retirement.

### Verification (EX-Phase 4)
- [ ] All 4 sections render in CEO portal
- [ ] CAGE quality metrics match manual trace inspection
- [ ] Question health uses service-role client for cross-user aggregation
- [ ] Pass rate handles 0 exam_outcomes gracefully

---

## 7. EX-Phase 5: Cross-Feature Intelligence <!-- updated: 2026-04-09 -->

**Priority:** P3 (low — builds on all prior phases)
**Estimated effort:** 6h
**Dependencies:** EX-Phase 1 + EX-Phase 2 (all student analytics in place)

**These are the highest-value analytics that connect drill performance with wiki reading behavior.**

### EX-5.1 Multimodal Study Score (Student)

**Data Source:** Combined: `wiki_article_reads`, `user_interactions`, `user_node_mastery`, `teach_back_submissions`
**Chart Type:** Radar chart with 4 axes: Reading Depth, Drill Volume, Teach-back Quality, Mastery Outcome
**Files to create:**
- `src/components/analytics/MultimodalStudySection.tsx`
- `src/components/analytics/MultimodalStudyRadar.tsx`
- `src/lib/actions/analytics/get-multimodal-score.ts`

**Value:** Shows the student their learning balance — "you drill a lot but don't read; reading the wiki would help."

### EX-5.2 Topic Intelligence Cards (Student)

**Data Source:** Per-topic join of: mastery weight, drill count, wiki read depth, EI accuracy, forgetting rate, relearning cycles
**Chart Type:** Expandable card grid — one card per weak topic with multi-signal summary
**Files to create:**
- `src/components/analytics/TopicIntelligenceSection.tsx`
- `src/components/analytics/TopicIntelligenceCard.tsx`
- `src/lib/actions/analytics/get-topic-intelligence.ts`

**Value:** The most actionable section — "for THIS topic, here's everything you should do."

### EX-5.3 Learning Velocity Dashboard (CEO)

**Data Source:** Aggregate across users: time-to-mastery by topic, correlated with reading + drilling patterns
**Chart Type:** Heatmap — topics (Y) vs weeks (X), color = avg mastery velocity across all users
**Files to create:**
- `src/components/ceo/analytics/LearningVelocitySection.tsx`
- `src/components/ceo/analytics/LearningVelocityHeatmap.tsx`
- `src/lib/queries/ceo/get-learning-velocity.ts`

**Value:** "Which topics are hardest for students in aggregate?" — curriculum difficulty map for content strategy.

### Verification (EX-Phase 5)
- [ ] Multimodal radar shows balanced axes when user reads AND drills
- [ ] Topic intelligence cards show correct multi-signal data per topic
- [ ] Learning velocity heatmap uses service-role for cross-user aggregation

---

## 8. File Creation Summary <!-- updated: 2026-04-09 -->

### Student Analytics (`src/components/analytics/`)

| Phase | New Section Components | New Client Components | New Server Actions |
|-------|----------------------|----------------------|-------------------|
| EX-1 | 5 | 5 | 5 (in `analytics/`) |
| EX-2 | 2 | 2 | 2 (in `analytics/`) |
| EX-5 | 2 | 2 | 2 (in `analytics/`) |
| **Total** | **9** | **9** | **9** |

### CEO Analytics (`src/components/ceo/analytics/`)

| Phase | New Section Components | New Client Components | New Query Modules |
|-------|----------------------|----------------------|------------------|
| EX-3 | 4 | 4 | 4 (in `queries/ceo/`) |
| EX-4 | 4 | 4 | 4 (in `queries/ceo/`) |
| EX-5 | 1 | 1 | 1 (in `queries/ceo/`) |
| **Total** | **9** | **9** | **9** |

### Data Pipeline (`src/lib/actions/`)

| Phase | New Files | Modified Files |
|-------|-----------|---------------|
| EX-0 | `analytics-events.ts`, `quiz-v2/save-prediction.ts`, `analytics/cross-feature-data.ts` | `quiz-v2/end-session.ts`, `PredictionSlider.tsx`, `PostdictionPrompt.tsx`, `WikiReadTracker.tsx` |

### Grand Total: ~39 new files, ~6 modified files

---

## 9. Effort Summary <!-- updated: 2026-04-09 -->

| Phase | Name | Priority | New Sections | Est. Hours | Dependencies |
|-------|------|----------|-------------|-----------|-------------|
| EX-0 | Data Pipeline | P1 | 0 | 6h | Remediation Phase 0 |
| EX-0.5 | Tab Infrastructure | P1 | 0 (route + nav) | 2h | EX-0 |
| EX-1 | Student — Drill Intelligence | P1 | 5 | 8h | EX-0.5, Remediation P0+P1A |
| EX-2 | Student — Reading Intelligence | P1 | 2 | 6h | EX-0.5, Remediation P0+P1A |
| EX-3 | CEO — Core | P2 | 4 | 8h | EX-0 |
| EX-4 | CEO — Advanced | P2 | 4 | 6h | EX-3 |
| EX-5 | Cross-Feature Intelligence | P3 | 3 | 6h | EX-1 + EX-2 |
| **Total** | | | **18** | **42h** | |

**Combined with remediation (29h): Total analytics overhaul = ~71h across 16 phases.**

---

## 10. Risk Register <!-- updated: 2026-04-09 -->

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Empty tables stay empty if write-side hooks fail | High | High | EX-Phase 0 verifies each write pipeline with integration tests before building read-side analytics |
| CEO portal queries on cross-user data are slow | Medium | Medium | Use service-role + `unstable_cache` with 1h TTL for CEO sections |
| Too many sections overload the analytics page | Medium | Low | Group new student sections into an "Advanced" tab or collapsible section |
| `user_theta` computation adds latency to session end | Low | Medium | Compute theta in `waitUntil()` / fire-and-forget background, same as SRS updates |
| CAGE signal table has minimal data (18 rows) | High | Low | Show "Collecting data..." state for CAGE quality section until sufficient samples |

---

## 11. Product Decisions — RESOLVED <!-- updated: 2026-04-09 -->

All 5 decisions resolved on 2026-04-09:

| Decision | Resolution | Rationale | Blocking Phase |
|----------|-----------|-----------|---------------|
| New student sections placement | **B) New "Advanced Insights" tab** | Keeps existing 23-section page manageable. Basic view = current, Advanced = drill intelligence + reading analytics. | EX-1, EX-2 |
| Analytics events scope | **C) Progressive — start with 5 key funnel events** | Signup, first drill, first wiki read, reached Zone 2, took simulation. Expand later with data. | EX-0 |
| CEO analytics access | **A) CEO role only** | Consistent with existing `/ceo` portal access control. No change needed. | EX-3 |
| Question bank health granularity | **A) Expose individual question IDs** | Content team needs item-level data to identify questions needing revision. | EX-4 |
| Engagement depth score weights | **A) Fixed weights, ship now** | Weights: highlights (0.15), bookmarks (0.1), teach-backs (0.25), EI responses (0.2), session quality (0.3). Revisit with real data later. | EX-3 |

---

## 12. Spec Update Plan <!-- updated: 2026-04-09 -->

After each expansion phase, `006-analytics.md` must be updated:

| Phase | Spec Changes |
|-------|-------------|
| EX-0 | §9 (Unused Data Sources): Move populated tables to §5.3 (actively queried). Add new server actions to §5.2. |
| EX-1 | §4: Add subsections 4.24-4.28 for 5 new student sections. §7: Update component tree. §8: Add new type definitions. |
| EX-2 | §4: Add subsections 4.29-4.30 for 2 reading sections. Cross-reference with wiki spec. |
| EX-3 | §12 (CEO Analytics): Expand with 4 new business sections, data sources, chart types. |
| EX-4 | §12: Add 4 advanced CEO sections. |
| EX-5 | §4: Add subsections 4.31-4.32 for cross-feature student sections. §12: Add learning velocity. |

---

## 13. Changelog <!-- updated: 2026-04-09 -->

| Date | Change | Author |
|------|--------|--------|
| 2026-04-09 | Review incorporation: Added EX-0.0 verification pass, EX-Phase 0.5 tab infrastructure, updated coordination matrix for Phase 1A/1B split, updated effort to 42h/71h combined. All 5 product decisions resolved. | AI |
| 2026-04-09 | Initial cross-feature expansion plan. 18 new sections (9 student + 9 CEO), 6 phases, ~40h estimated. Coordinates with gap remediation plan. | AI |
