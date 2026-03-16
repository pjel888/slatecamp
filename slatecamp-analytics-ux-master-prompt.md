# SlateCamp Analytics Page Overhaul — Master Execution Prompt

---

## ROLE

You are simultaneously:

1. **Elite EdTech CTO & Data Product Leader** — You understand that analytics is not a feature — it is the MOAT. Any app can serve questions. Very few translate raw test data into behavioral coaching that changes how a student studies. This is what makes SlateCamp a premium product worth paying for. You think about analytics as the feature that makes students say "I finally understand WHY I keep getting Structural Systems wrong" — not just "I got 68%."

2. **Principal Next.js Architect & Data Engineer** — You write performant, type-safe code. You understand that complex analytical queries belong in Supabase RPC functions or database views — NOT in client-side JavaScript. You optimize for perceived performance: the page loads instantly with skeleton states, data streams in progressively. Heavy aggregations are precomputed or cached. Charts never block the main thread.

3. **World-Class Data Visualization Designer** — You follow Edward Tufte's principles: maximize the data-ink ratio, eliminate chartjunk, and make every pixel of ink represent data. You also follow Dieter Rams: the visualization must be understandable without a legend, useful without explanation, and beautiful without decoration. Charts are NOT decorative — they are cognitive tools. Every axis, every color, every label must earn its place.

4. **Educational Psychologist & Metacognition Specialist** — You are deeply versed in Metacognitive Monitoring (Dunning-Kruger, Calibration research), Cognitive Load Theory (Sweller), the Forgetting Curve (Ebbinghaus), Desirable Difficulties (Bjork), and Self-Regulated Learning (Zimmerman). You understand that analytics should train metacognition — the student should leave the analytics page with BETTER self-awareness about their learning, not just more numbers.

---

## TASK

Conduct a comprehensive overhaul of the SlateCamp Analytics Page. Transform it from a collection of mock-data dashboard widgets into a purpose-built analytical experience that translates raw testing telemetry into actionable behavioral insights and metacognitive coaching.

**What "world-class analytics" means concretely:**
- A student opens the analytics page and within 10 seconds understands: (a) their overall trajectory, (b) their specific behavioral patterns, and (c) what to change
- Every chart answers a QUESTION, not just displays DATA. "Am I improving?" "Where am I weakest?" "Am I rushing or overthinking?" "Is my memory holding?"
- The insights are accessible to a 20-year-old non-data-scientist — no jargon, no ambiguous axes, no unexplained metrics
- The page actively coaches: not "Your accuracy is 68%" but "You lose 15% accuracy on Structural Systems because you spend 40% less time on those questions — slow down on this subject"
- All data is REAL — pulled from verified database tables, not mock arrays
- The page is fast — heavy aggregations happen server-side, charts render progressively

---

## CONTEXT

### Technical Environment
- **Framework:** Next.js (App Router), React, TypeScript
- **Styling:** Tailwind CSS
- **Charting:** Recharts (already installed and in use — see current components)
- **Backend:** Supabase (Postgres + RLS)
- **Current State:** The analytics page exists at `src/app/analytics/page.tsx`. It currently reuses dashboard-oriented components (`DashboardRightColumn.tsx`) with heavy mock data. The `SubjectRadarChart` pulls real mastery data. Everything else uses hardcoded mock arrays.

### Current Code Audit (What You're Starting With)

**Known components already built:**
- `SubjectRadarChart` — Radar chart using real `SubjectMastery` data. Well-built, uses Recharts, has custom tooltip and gradient fill. **Keep and enhance.**
- `UnifiedReadinessCard` — Shows readiness score with trajectory chart. Uses MOCK_WEEKLY_DATA. Needs to be wired to real data.
- `MetricSmall` — Small metric cards (Avg Pacing, Exam Goal, Streak, SRS Due). Currently static/mock. Needs real data.
- `PredictiveRemediationCard` — Hardcoded "Pharmacokinetics" remediation suggestion. Needs algorithmic backing.
- `ActionTall` — Action cards (Blindspot Protocol, Endurance Cycle, Proof Simulation). These are ACTION launchers, not analytics — evaluate whether they belong here or on the Dashboard.
- `DailyCrucibleCard` — Single daily question. This is an ACTION component, not analytics. Likely belongs on Dashboard.
- `PacingLeaksCard` — Pacing insight. Good concept, but hardcoded. Needs real latency data.
- `PinnedRecentActivity` — Timeline of recent actions. Uses MOCK_RECENT_ACTIVITY. Evaluate placement.

**Known layout:** 12-column grid, 10-col main area + 2-col right sidebar. Two-row architecture in main area.

**Known design system:** Cards use `rounded-sm border-zinc-200 bg-white shadow-none p-2`. Text uses `text-[9px]/[10px]/[11px]` sizing. Icons from Lucide. `RichInfoPopover` for contextual help. Very compact, utilitarian aesthetic.

**Critical Issue:** Many current "analytics" components are actually dashboard/action components reused here. The analytics page needs its own purpose-built visualizations that ANALYZE behavior — not just display metrics or launch actions.

### Tools You MUST Use
- **Supabase MCP** — Query `information_schema` to verify ALL tables related to testing telemetry. Specifically check for: per-question response times (`time_spent_ms` or similar), answer change history, session-level data (start time, end time, question count), per-question correctness, subject/topic tagging on questions, any existing mastery/IRT/EMA scores, spaced repetition data. THE ENTIRE ANALYTICS STRATEGY DEPENDS ON WHAT DATA EXISTS. If critical telemetry columns are missing, you must propose migrations BEFORE designing charts.
- **File System Tools** — Read every file in the analytics and dashboard component directories. Read the mastery actions file (`lib/actions/mastery`). Read any other data-fetching utilities. Understand the complete current implementation.
- **`.claude/docs`, `.claude/skills`, `.claude/agents`** — Check and use.

---

## THE ANALYTICAL PSYCHOLOGY MANDATE

Every visualization must be justified by a specific metacognitive or pedagogical purpose:

### 1. Metacognitive Calibration (Dunning & Kruger, 1999; Koriat, 1997)
Students are notoriously bad at judging their own competence. Low performers overestimate their ability. High performers underestimate it. Analytics must CALIBRATE their self-perception.

**The key visualization:** Confidence vs. Competence mapping. If we capture confidence data (or can infer it from response time patterns), we can show students where they THINK they know the material vs. where they ACTUALLY know it.

**Practical implications:**
- Don't just show "68% accuracy" — show WHERE that 68% comes from (which subjects, which question types)
- Reveal hidden strengths (subjects where they perform well but don't realize it)
- Reveal dangerous blind spots (subjects where they feel confident but consistently fail)
- Frame insights as discoveries, not judgments: "Interesting pattern: you score highest on questions you spend the MOST time on in Building Tech" — this teaches them that slowing down works

### 2. Behavioral Pattern Recognition (Kahneman, 2011 — System 1 vs. System 2)
Students develop unconscious testing behaviors that they can't see without data:
- **Rushing:** Fast responses + low accuracy = System 1 (intuitive, error-prone) thinking
- **Overthinking:** Slow responses + low accuracy = Second-guessing, anxiety-driven deliberation
- **Mastered:** Fast responses + high accuracy = Automaticity, genuine knowledge
- **Careful & Correct:** Slow responses + high accuracy = Deliberate, effortful but effective

**The key visualization:** A Pacing vs. Accuracy Quadrant (scatterplot). Each point is a subject or topic. The four quadrants instantly reveal behavioral patterns across the entire syllabus.

**Practical implications:**
- This is THE signature visualization — it's what makes SlateCamp analytics unique
- Label the quadrants with human-readable names ("Rushing," "Overthinking," "Mastered," "Careful")
- Color-code by subject for instant recognition
- Include specific coaching text: "3 subjects in the 'Rushing' quadrant — try spending 30 more seconds per question on these"

### 3. Cognitive Stamina & Fatigue (Baumeister, 2002; Warm et al., 2008)
Accuracy decays over long testing sessions. This is cognitive fatigue — a real neurological phenomenon. Students need to see their personal fatigue curve so they can train endurance.

**The key visualization:** Accuracy vs. Question Position (line chart). Plot accuracy for questions 1-10, 11-20, 21-30, etc. averaged across all sessions. A declining slope = fatigue. A stable line = good endurance.

**Practical implications:**
- This requires per-question position data within sessions
- Show the student's curve against an "ideal" flat line
- If they fade after question 20, coach them: "Your accuracy drops 18% after question 20. Try building stamina with 25-question sessions before attempting 50."
- Track improvement over time: "Your stamina curve has flattened — you're building endurance"

### 4. Memory Consolidation & Forgetting Curve (Ebbinghaus, 1885)
Without spaced repetition, knowledge decays exponentially. If SRS data exists, we can show the student their retention health.

**The key visualization:** Topic-level retention decay. For topics the student has studied but not reviewed recently, show how much estimated retention has decayed based on time since last review.

**Practical implications:**
- This requires SRS or review timestamp data
- Use a warm-to-cool color gradient: green (recently reviewed, high retention) → amber → red (long since reviewed, estimated low retention)
- Frame as "Memory Health" not "Forgetting" — growth-oriented language
- Pair with action: "3 topics need refreshing — Start Review →"

### 5. Trajectory & Readiness (IRT/EMA if available)
The student needs to see their overall direction — are they converging on the passing threshold?

**The key visualization:** Readiness Score over Time (area chart). A smoothed line showing their composite score trending toward the exam passing mark. The passing threshold is a reference line.

**Practical implications:**
- This already exists partially in `UnifiedReadinessCard` — it needs real data
- The trajectory should feel ENCOURAGING. Even small upward trends should be visible.
- If the student is below the threshold, don't frame it as "failing" — frame it as "distance to target is closing"
- Show projected date to reach target if possible (linear extrapolation at minimum)

---

## TOKEN CONSERVATION & EXECUTION CONSTRAINTS

**CRITICAL: This is a complex, multi-phase overhaul. You WILL run out of tokens if you are not disciplined.**

1. **No verbose preambles.** Brief transitions only: "Auditing schema..." then results. Don't explain what you're about to do.
2. **No redundant code comments.** Comment only non-obvious logic.
3. **Surgical edits.** Never rewrite an entire file to change 15 lines. Show diffs with location context.
4. **No prompt repetition.** Execute directly.
5. **Batch file reads.** Read multiple files in succession without analysis paragraphs between each.
6. **Tables for analysis, prose only for psychological rationale.**
7. **One-shot components.** Write complete components on the first pass. No placeholder → refactor cycles.
8. **Backend first.** Write the Supabase queries/RPCs BEFORE the chart components. A beautiful chart with no data is worthless.
9. **Reuse what works.** The existing design system (card styles, text sizing, color patterns) is established. Don't reinvent it. Extend it for analytics-specific needs.
10. **Prioritize the signature visualizations.** If tokens are running low, the Pacing Quadrant and Stamina Curve are more valuable than polishing existing metric cards.

---

## PHASED EXECUTION PLAN

Follow strictly. Each phase builds on verified outputs. **Do NOT skip. Do NOT assume.**

---

### PHASE 1: Deep Telemetry Audit & Data Capability Assessment

**Objective:** Determine EXACTLY what data exists in the database to support advanced analytics. The entire strategy depends on this.

**Step 1.1 — Database Schema Audit**
Use Supabase MCP to inspect all testing-related tables. For each table, document columns, types, and relationships.

**Specifically verify the existence of these CRITICAL data points:**

| Data Point | Why It's Critical | Where to Look |
|-----------|------------------|---------------|
| Per-question response time | Powers Pacing Quadrant, Stamina Curve, latency metrics | `time_spent_ms`, `started_at`/`completed_at` on response rows |
| Per-question correctness | Powers accuracy analysis, subject breakdowns | `is_correct`, `selected_option` vs `correct_option` |
| Question position in session | Powers Stamina Curve (accuracy by position) | `question_number`, `sequence_order`, or derivable from timestamps |
| Subject/Topic per question | Powers per-subject analysis, radar chart, quadrant grouping | FK to subjects/topics on questions table |
| Session metadata | Powers trajectory, session-level analysis | `quiz_sessions` with start/end times, total questions, mode |
| Historical score progression | Powers trajectory chart | Timestamped scores, EMA values, or derivable from sessions |
| Answer changes within a question | Powers decision-quality analysis | Multiple response records per question, or a `changes` count |
| Confidence signal | Powers calibration analysis | `confidence_level` or similar field |
| SRS/Review timestamps | Powers forgetting curve / memory health | Review history, last-reviewed dates per topic |
| Mastery/IRT scores | Powers readiness and subject mastery | `mastery_data`, ability estimates, theta values |

**Step 1.2 — Codebase Audit**
Read:
- `src/app/analytics/page.tsx` (current page — already provided but verify for changes)
- ALL components in the dashboard components directory
- `src/lib/actions/mastery.ts` and any other data-fetching actions
- Any existing API routes or server actions related to testing/analytics
- State management setup
- Check for existing Supabase RPC functions or database views

**Step 1.3 — Output: Telemetry Capability Matrix**

```
## TELEMETRY CAPABILITY MATRIX
| Data Point | Available? | Source Table.Column | Quality | Notes |
|-----------|-----------|-------------------|---------|-------|
| Per-question time | Yes/No/Partial | responses.time_spent_ms | Clean/Noisy/Missing | ... |
| Per-question correctness | ... | ... | ... | ... |
| Question position | ... | ... | ... | ... |
| Subject per question | ... | ... | ... | ... |
| Session metadata | ... | ... | ... | ... |
| Score history | ... | ... | ... | ... |
| Answer changes | ... | ... | ... | ... |
| Confidence signal | ... | ... | ... | ... |
| SRS timestamps | ... | ... | ... | ... |
| Mastery scores | ... | ... | ... | ... |

## REQUIRED MIGRATIONS
| # | Migration | Adds | Enables | Complexity |
|---|----------|------|---------|------------|
| 1 | Add `time_spent_ms` to responses | Per-question timing | Pacing Quadrant, Stamina Curve | Simple ALTER TABLE |
| 2 | ... | ... | ... | ... |
(If no migrations needed, state "None — schema supports all planned analytics")

## CURRENT COMPONENT AUDIT
| Component | Real Data? | Belongs on Analytics? | Action Needed |
|-----------|-----------|----------------------|---------------|
| SubjectRadarChart | Yes | Yes | Enhance |
| UnifiedReadinessCard | Mock | Yes | Wire to real data |
| MetricSmall | Mock | Depends | Evaluate |
| PredictiveRemediationCard | Hardcoded | Yes (if algorithmic) | Rebuild with real data |
| DailyCrucibleCard | Hardcoded | No — Dashboard | Move to Dashboard |
| ActionTall | Hardcoded | No — Dashboard | Move to Dashboard |
| PacingLeaksCard | Hardcoded | Yes (as insight) | Wire to real data |
| PinnedRecentActivity | Mock | Maybe — evaluate | Wire or move |

## DATA FLOW GAPS
- [List any gaps between what data exists and what visualizations need]
```

**STOP HERE.** Output the telemetry matrix and say:
> "Phase 1 Complete. I have a verified telemetry capability matrix and identified [N] migrations needed. Reply 'Proceed' to begin Visualization Blueprinting in Phase 2."

---

### PHASE 2: Data Visualization & UX Blueprint

**Objective:** Design every visualization, its psychological purpose, its data source, and its exact visual specification. No chart exists without a question it answers.

**Step 2.1 — The Analytics Page Philosophy**

Define the page's information architecture. The student's cognitive flow should be:

1. **Macro Orientation** (top) — "How am I doing overall?" → Readiness trajectory + key summary metrics
2. **Behavioral Diagnosis** (middle, prominent) — "What patterns should I change?" → Pacing Quadrant + Stamina Curve
3. **Domain Mastery** (supporting) — "Where am I strong and weak?" → Enhanced radar + subject breakdown
4. **Memory Health** (if SRS data exists) — "What's fading?" → Retention status
5. **Actionable Coaching** (integrated throughout) — "What should I do about it?" → Contextual recommendations attached to each visualization

**This is NOT a dashboard.** The dashboard is where you START studying. The analytics page is where you UNDERSTAND your studying. Different purpose, different design. Action cards (Blindspot Protocol, Endurance Cycle, Proof Simulation) may appear here ONLY if they are contextually triggered by analytical insights — not as static launchers.

**Step 2.2 — Visualization Specifications**

For each visualization, define:

#### Chart: [Name]
- **Question it answers:** [The specific question this visualization helps the student answer]
- **Psychological framework:** [Which metacognitive/learning principle it applies]
- **Data source:** [Exact tables and columns from Phase 1, or proposed query]
- **Chart type:** [Specific Recharts component(s)]
- **Axes / Dimensions:** [What each axis represents, units, scales]
- **Visual encoding:** [Colors, sizes, shapes — what do they MEAN?]
- **Coaching layer:** [What text annotation or insight accompanies this chart?]
- **Empty state:** [What to show when insufficient data exists]
- **Interaction:** [Hover tooltips, click behaviors, filters]
- **Anti-patterns:** [What this chart must NEVER do]

**Mandatory Visualizations to Design:**

1. **Readiness Trajectory** (refactored from `UnifiedReadinessCard`)
   - Question: "Am I on track to pass the exam?"
   - Real data, not mock. Smoothed EMA/IRT score over time against passing threshold.
   - Show projected convergence date if trending upward.
   - NEVER frame current position as "failing" — always show direction and distance.

2. **The Pacing Quadrant** ⭐ (NEW — Signature Visualization)
   - Question: "Where am I rushing, overthinking, mastered, or guessing?"
   - Scatterplot: X-axis = average response time, Y-axis = accuracy percentage. Each dot = one subject/topic.
   - Four labeled quadrants: "Rushing" (fast + wrong), "Mastered" (fast + right), "Overthinking" (slow + wrong), "Careful" (slow + right)
   - Midpoint lines based on target time and passing accuracy
   - Color-coded by subject
   - THIS is the chart that makes SlateCamp analytics unique. Design it beautifully.

3. **Cognitive Stamina Curve** (NEW)
   - Question: "Do I fade during long sessions?"
   - Line chart: X-axis = question position in session (bucketed: 1-5, 6-10, 11-15...), Y-axis = accuracy
   - Show trend line and fatigue inflection point
   - Coach: "Your accuracy drops 22% after question 25"

4. **Subject Mastery Radar** (existing — enhance)
   - Question: "Where are my strengths and weaknesses across the syllabus?"
   - Already built with real data. Enhance with:
     - Trend indicators per subject (improving, stable, declining)
     - Click-through to subject detail
     - Better empty state

5. **Pacing Insights** (refactored from `PacingLeaksCard`)
   - Question: "Which specific topics eat my time?"
   - Real data: top 3 subjects/topics where avg time exceeds target
   - Show ratio vs. target (e.g., "2.4x target time")
   - Paired with coaching: "Spending extra time here isn't helping — your accuracy is the same. Try flagging and moving on."

6. **Memory Health / Retention Map** (NEW — if SRS data exists)
   - Question: "What have I learned that's starting to fade?"
   - Grid or heatmap of topics colored by estimated retention
   - Green = recently reviewed, strong. Amber = needs refresh. Gray = not yet studied.
   - Paired with action: "3 topics need refreshing → Start Review"

7. **Summary Metrics Bar** (refactored from `MetricSmall` cards)
   - Key numbers at a glance: Total questions answered, average accuracy, average pacing, days until exam, current streak
   - All REAL data
   - Compact, supportive, not dominant

**Step 2.3 — Page Layout**
Define responsive layout grid:
- **Desktop:** 12-column grid. Top row: readiness trajectory + summary metrics. Middle row: Pacing Quadrant (large, 8 cols) + Stamina Curve (4 cols). Lower rows: Radar + Retention + Insights.
- **Tablet:** Stack into 2 columns, priority order maintained.
- **Mobile:** Single column. Readiness → Summary → Pacing Quadrant → Stamina → Radar → Retention.
- **The Pacing Quadrant must be LARGE.** It is the centerpiece. Don't shrink it to fit more widgets.

**Step 2.4 — Color System for Analytics**
Define a data-visualization-specific color palette:
- **Chart colors:** Must be distinguishable by colorblind users (avoid red/green as only differentiator)
- **Subject colors:** Consistent across all charts (if Structural Systems is blue on the radar, it's blue on the quadrant)
- **Quadrant colors:** Soft backgrounds for each quadrant zone (not harsh borders)
- **Trend colors:** Green for positive, amber for neutral, blue-gray for declining (NOT red — avoid anxiety)
- **Grid lines:** Extremely subtle (`#f4f4f5` or lighter). Tufte principle: minimize non-data ink.

**Step 2.5 — Coaching Language Guide**
For each visualization, define the coaching text patterns:

| Insight Type | ✅ Example | ❌ Anti-pattern |
|-------------|-----------|----------------|
| Rushing detection | "You answer Building Tech questions 40% faster than average — and score 15% lower. Slowing down here could help." | "WARNING: You are rushing through Building Tech!" |
| Fatigue detection | "Your accuracy holds steady for 20 questions, then starts to dip. Building stamina with 25-question sessions could help." | "You perform badly after question 20." |
| Weakness identification | "Structural Systems has the most room for growth — focused review sessions could have the biggest impact." | "You are failing Structural Systems." |
| Strength recognition | "You've built strong mastery in Professional Practice — this is one of your most reliable subjects." | (Omitting strengths entirely and only showing weaknesses) |
| Memory decay | "3 topics you studied last month are ready for a quick refresh to lock in the knowledge." | "You're forgetting 3 topics!" |

**Step 2.6 — Output: Full Analytics Blueprint**
Produce the complete visualization specification.

**STOP HERE.** Output the blueprint and say:
> "Phase 2 Complete. The Analytics Visualization Blueprint is ready. Reply 'Proceed' to execute Backend Data Aggregation in Phase 3."

---

### PHASE 3: Backend Data Aggregation

**Objective:** Write all server-side data queries, Supabase RPC functions, views, or Next.js Server Actions needed to feed the visualizations. Charts cannot be built without data pipelines.

**Step 3.1 — Query Design Principles**
- Heavy aggregations (averaging across sessions, grouping by subject) belong in Supabase RPC functions or SQL views — NOT in client-side JavaScript
- Use parameterized queries with the authenticated user's ID (respect RLS)
- Return data pre-shaped for Recharts consumption: arrays of objects with named keys matching chart `dataKey` props
- Include reasonable defaults and empty-state handling
- Optimize for performance: use indexes, limit result sets, avoid N+1 queries

**Step 3.2 — Required Data Pipelines**

Based on Phase 2 specifications, build:

1. **Readiness Trajectory Query** — Historical composite scores over time for the current user. Return: `[{ date, score, passingThreshold }]`

2. **Pacing Quadrant Query** — Per-subject average response time and accuracy. Return: `[{ subject, avgTimeMs, accuracy, questionCount, color }]`

3. **Stamina Curve Query** — Accuracy bucketed by question position across all sessions. Return: `[{ positionBucket, accuracy, sampleSize }]`

4. **Subject Mastery Query** — Already exists via `getSubjectMasteryData()`. Verify it returns what the enhanced radar needs. Augment if necessary.

5. **Pacing Insights Query** — Top N subjects where avg time exceeds target, with accuracy context. Return: `[{ subject, avgTimeMs, targetTimeMs, ratio, accuracy }]`

6. **Memory Health Query** (if SRS data exists) — Topics with estimated retention based on last review date. Return: `[{ topic, lastReviewed, estimatedRetention, status }]`

7. **Summary Metrics Query** — Aggregate stats: total questions answered, overall accuracy, average pacing, current streak, exam countdown. Return: `{ totalQuestions, avgAccuracy, avgPacingMs, streak, daysUntilExam }`

**Step 3.3 — Migration Scripts (if identified in Phase 1)**
Write any required `ALTER TABLE` statements or new table creation scripts for missing telemetry columns.

**Step 3.4 — Output: All Backend Code**
Provide exact code for all queries, RPCs, server actions, and migrations.

**STOP HERE.** Output the backend code and say:
> "Phase 3 Complete. All data pipelines are built. Reply 'Proceed' to build Frontend Chart Components in Phase 4."

---

### PHASE 4: Frontend Chart Components

**Objective:** Build the pure visualization components using Recharts. Each component receives pre-shaped data as props and renders the chart. No data fetching inside components.

**Component List:**

1. **`ReadinessTrajectory.tsx`** — Area chart with reference line. Refactored from `UnifiedReadinessCard` to use real data props.

2. **`PacingQuadrant.tsx`** ⭐ — ScatterChart with four labeled quadrant zones, reference lines at target thresholds, color-coded dots, rich tooltips with coaching text. THE signature component.

3. **`StaminaCurve.tsx`** — Line chart showing accuracy by session position. Includes trend annotation and coaching text.

4. **`SubjectRadarChart.tsx`** — Enhanced version of existing component. Add trend indicators, better empty state, click interaction.

5. **`PacingInsights.tsx`** — Compact insight cards showing top time-draining topics with coaching language. Refactored from `PacingLeaksCard` with real data.

6. **`MemoryHealthMap.tsx`** — Grid/heatmap of topic retention. Color-coded by estimated retention level. (Only if SRS data verified in Phase 1.)

7. **`AnalyticsSummaryBar.tsx`** — Row of key metrics. Refactored from `MetricSmall` with real data props.

8. **`ChartCoachingAnnotation.tsx`** — Reusable component for inline coaching text below charts. Receives insight text as prop.

**Execution Rules:**
- Full TypeScript types for all props (define interfaces for each data shape)
- Tailwind CSS exclusively
- Follow existing design system: `rounded-sm border-zinc-200 bg-white shadow-none p-2`
- Recharts configuration: consistent axis styling, subtle grid lines, custom tooltips matching existing design
- Accessibility: ARIA labels on chart containers, meaningful alt text, keyboard-navigable tooltips
- Responsive: charts must work at mobile widths (consider simplified mobile versions of complex charts like the Quadrant)
- Loading states: skeleton components for each chart
- Empty states: meaningful messaging when insufficient data ("Complete 5 quizzes to unlock your Pacing Profile")
- Animation: subtle, fast Recharts animations (1000-1500ms). Nothing distracting.
- Color consistency: use CSS variables or a shared color config so subject colors are identical across all charts

**STOP HERE.** Output all chart components and say:
> "Phase 4 Complete. All chart components are built. Reply 'Proceed' to execute Analytics Page Assembly in Phase 5."

---

### PHASE 5: Analytics Page Assembly

**Objective:** Wire everything together into the final `analytics/page.tsx`.

**Step 5.1 — Page Architecture**
- Server Component at the page level for data fetching
- Parallel data fetching (use `Promise.all` or parallel server action calls)
- Suspense boundaries around each chart section with skeleton fallbacks
- Client Components only for interactive charts

**Step 5.2 — Layout Assembly**
Implement the responsive grid from Phase 2:
- Desktop: 12-column grid with defined row structure
- Tablet: 2-column adaptation
- Mobile: Single column, priority ordering
- Ensure the Pacing Quadrant gets prominent placement and sufficient size

**Step 5.3 — Coaching Integration**
Wire the coaching text to each visualization:
- Derive coaching insights from the data (e.g., count subjects in "Rushing" quadrant → generate coaching text)
- Use `ChartCoachingAnnotation` component consistently

**Step 5.4 — Component Migration**
- Remove action-oriented components that belong on Dashboard (DailyCrucibleCard, ActionTall)
- Keep analytics-relevant components (ReadinessTrajectory, PacingInsights)
- Add new visualization components from Phase 4
- Wire `PredictiveRemediationCard` to real algorithmic data (or replace with data-driven recommendation)

**Step 5.5 — Remove Mock Data**
- Delete ALL mock data arrays (MOCK_WEEKLY_DATA, MOCK_RECENT_ACTIVITY, etc.)
- Every data point on the page must flow from a Supabase query
- If a visualization can't be supported by real data yet, show an appropriate empty state — NEVER show fake data as if it's real

**Step 5.6 — Verification**
- All charts render with real data
- Responsive at all breakpoints
- Loading states work (Suspense + skeletons)
- Empty states work (new user with no quiz history)
- No TypeScript errors
- No console errors
- Subject colors are consistent across all charts
- Coaching text generates correctly from data
- Performance: page loads perceived-fast (skeleton → progressive chart population)

**Output:** The complete, working, data-driven analytics page.

---

## DESIGN PRINCIPLES CHECKLIST

Before finalizing any visualization:

- [ ] **Tufte: Data-Ink Ratio** — Can any non-data pixel be removed? Grid lines too heavy? Borders unnecessary?
- [ ] **Tufte: Chartjunk** — Is there any decoration that doesn't represent data? Remove it.
- [ ] **Rams #4 — Understandable** — Can the student understand this chart in 5 seconds without reading a legend?
- [ ] **Rams #10 — As little design as possible** — Is this the simplest possible representation of this data?
- [ ] **Question Test** — Does this chart answer a specific question? Can you state the question in one sentence?
- [ ] **Coaching Test** — Does this visualization come with an actionable insight? Or is it just "information"?
- [ ] **Anxiety Check** — Would this chart make a struggling student feel worse? If yes, reframe.
- [ ] **Colorblind Check** — Does the chart work if you remove color? (Use shape, position, or pattern as redundant encoding)
- [ ] **Mobile Check** — Is this chart readable on a 375px screen?
- [ ] **Empty State Check** — What shows when there's no data? Is it encouraging, not blank?
- [ ] **Real Data Check** — Is EVERY number on this page coming from the database? NO MOCK DATA.

---

## ANALYTICS VS. DASHBOARD — THE SEPARATION PRINCIPLE

This is critical. The Dashboard and Analytics page have DIFFERENT purposes:

| Aspect | Dashboard | Analytics |
|--------|-----------|-----------|
| **Purpose** | Start studying | Understand studying |
| **Emotional tone** | Calm, activating | Insightful, coaching |
| **Time horizon** | Today | Weeks/months |
| **Primary action** | "Start Quiz →" | "Slow down on Structural Systems" |
| **Data depth** | Shallow (one number, one action) | Deep (trends, patterns, correlations) |
| **Components** | DailyCatalyst, DueItems, RecentActivity | Pacing Quadrant, Stamina Curve, Trajectory |
| **Cognitive demand** | Minimal (act on instinct) | Moderate (reflect and learn) |

**If a component is about DOING → it belongs on Dashboard.**
**If a component is about UNDERSTANDING → it belongs on Analytics.**

Components that blur this line (like PredictiveRemediationCard) belong on Analytics ONLY if they are triggered by analytical insight, not as static action launchers.

---

## THE USER, ON THE ANALYTICS PAGE

Same nursing student. It's Sunday evening. She's done 3 quizzes this week and wants to understand how she's doing before planning next week's study.

**What she needs to see:**
- "My readiness score went from 62 to 68 this week — I'm trending toward the target" (trajectory)
- "I'm rushing through Building Tech — my accuracy there is 20% lower than subjects where I take more time" (pacing quadrant)
- "I fade after question 25 — I should do shorter sessions" (stamina curve)
- "Structural Systems is my weakest area but it's improving" (radar)
- "Pharmacology needs a refresh — I haven't reviewed it in 2 weeks" (memory health)

**What she should FEEL:**
- "I understand my studying now. I know what to change."
- NOT "I have so many problems. This is overwhelming."

---

## FINAL REMINDERS

1. **DATA FIRST.** Phase 1 is the foundation. If the database can't support a visualization, either propose a migration or cut the visualization. Never fake it with mock data.

2. **EVERY CHART ANSWERS A QUESTION.** If you can't state the question in one sentence, the chart doesn't belong.

3. **COACHING, NOT REPORTING.** The difference between a mediocre analytics page and a great one is: mediocre shows data, great tells you what to DO about the data.

4. **THE PACING QUADRANT IS THE STAR.** This is the visualization no competitor has. Design it to be beautiful, insightful, and immediately understandable. It should be screenshot-worthy — the kind of thing a student shares with their study group.

5. **EFFICIENCY IS NON-NEGOTIABLE.** Backend aggregation happens in SQL. Charts render progressively. No client-side heavy computation. No wasted tokens.

---

*Execute Phase 1 now. Begin the Deep Telemetry Audit.*
