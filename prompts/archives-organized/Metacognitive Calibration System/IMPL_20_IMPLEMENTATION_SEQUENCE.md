# IMPL_20: Implementation Sequence & Dependency Graph

**Purpose:** Sprint-by-sprint build order with dependency tracking, feature flags, and testing checkpoints.

---

## Dependency Graph

```
IMPL_19 (Schema Migrations) ← EVERYTHING depends on this. Run first.
    │
    ├── IMPL_01 (Predictions) ← standalone, no dependencies
    ├── IMPL_02 (Confidence) ← standalone, no dependencies
    │       │
    │       ├── IMPL_03 (Calibration Score) ← depends on IMPL_02 (needs confidence data)
    │       └── IMPL_09 (Wrong Answer Taxonomy) ← uses confidence data for priority scoring
    │               │
    │               └── IMPL_15 (Socratic AI) ← uses error classification from IMPL_09
    │
    ├── IMPL_04 (Prequestions) ← standalone, needs questions table only
    ├── IMPL_05 (Successive Relearning) ← standalone, new quiz mode
    ├── IMPL_06 (Interleaving) ← modifies start-session, standalone
    ├── IMPL_07 (Generation Questions) ← standalone, new question type
    │
    ├── IMPL_10 (Feed-Forward) ← enhanced by IMPL_09 (error categories)
    │       │
    │       └── IMPL_13 (Daily Dose) ← depends on IMPL_10 (recommendation engine)
    │
    ├── IMPL_11 (Forgetting Rates) ← standalone
    │       │
    │       └── IMPL_12 (Memory Strength) ← extends IMPL_11 (decay model)
    │
    ├── IMPL_08 (Pressure Ladder) ← standalone, extends existing Storm Mode
    │       │
    │       └── IMPL_14 (Progress Proof) ← uses simulation data from IMPL_08
    │
    ├── IMPL_16 (3D Lab Loop) ← standalone, depends on existing 3D infrastructure
    │
    ├── IMPL_17 (Student Vizs) ← depends on IMPL_02, IMPL_03, IMPL_11 for data
    └── IMPL_18 (Commercial Vizs) ← depends on accumulated user data
```

---

## Sprint Plan

### Sprint 0: Foundation (Week 1, Days 1–2)
**Goal:** Run all migrations, set up feature flags.

| Task | Effort | Owner |
|---|---|---|
| Run IMPL_19 migration 001–008 on staging | 1 hr | Backend |
| Verify all tables created, RLS policies active | 30 min | Backend |
| Set up feature flags (see below) | 1 hr | Frontend |
| Deploy migrations to production (behind flags) | 30 min | DevOps |

**Feature flag setup:**
```typescript
// src/lib/feature-flags.ts
export const FLAGS = {
  PREDICTION_PROMPTS: false,    // IMPL_01
  CONFIDENCE_INPUT: false,      // IMPL_02
  CALIBRATION_SCORE: false,     // IMPL_03
  PREQUESTIONS: false,          // IMPL_04
  SUCCESSIVE_RELEARNING: false, // IMPL_05
  INTERLEAVING: false,          // IMPL_06
  GENERATION_QUESTIONS: false,  // IMPL_07
  PRESSURE_LADDER: false,       // IMPL_08
  ERROR_TAXONOMY: false,        // IMPL_09
  FEED_FORWARD: false,          // IMPL_10
  FORGETTING_RATES: false,      // IMPL_11
  MEMORY_STRENGTH: false,       // IMPL_12
  DAILY_DOSE: false,            // IMPL_13
  PROGRESS_PROOF: false,        // IMPL_14
  SOCRATIC_AI: false,           // IMPL_15
  LAB_QUIZ: false,              // IMPL_16
  NEW_VISUALIZATIONS: false,    // IMPL_17
  COMMERCIAL_VIZS: false,       // IMPL_18
} as const;
```

Store in environment variables or Supabase `app_settings` table for runtime toggling.

---

### Sprint 1: Metacognitive Core (Week 1–2, Days 3–10)
**Goal:** Ship the three highest-impact, lowest-effort features.

| Day | Task | IMPL | Effort |
|---|---|---|---|
| 3 | Build PredictionPrompt component | 01 | 2 hrs |
| 3 | Integrate into SetupFlow (Storm/Proof Sim only) | 01 | 1 hr |
| 3 | Build postdiction step in ResultsDashboard | 01 | 2 hrs |
| 4 | Build ConfidenceInput component | 02 | 2 hrs |
| 4 | Integrate into OptionsColumn | 02 | 1 hr |
| 4 | Modify submit-answer to store confidence | 02 | 1 hr |
| 5 | Build ConfidenceMatrix component | 02 | 3 hrs |
| 5 | Add to ResultsDashboard | 02 | 1 hr |
| 6 | Implement Lucky Guess detector logic in submit-answer | IP Plan | 3 hrs |
| 7 | Implement Focus Review pg_cron job | IP Plan | 3 hrs |
| 8–9 | Build Feed-Forward recommendation engine | 10 | 8 hrs |
| 8–9 | Build FeedForwardCards component | 10 | 4 hrs |
| 10 | QA all Sprint 1 features on staging | — | 4 hrs |

**Testing checkpoint:**
- [ ] Prediction prompt appears before Storm sessions
- [ ] Confidence input appears and submits correctly
- [ ] 2×2 matrix renders with correct quadrant assignments
- [ ] Lucky Guess flags suspicious interactions
- [ ] Focus Review queue generates nightly
- [ ] Feed-Forward shows 3 relevant recommendations post-session

**Ship:** Enable flags for PREDICTION_PROMPTS, CONFIDENCE_INPUT, FEED_FORWARD

---

### Sprint 2: Learning Engine Upgrades (Week 3–4)
**Goal:** Ship retrieval practice amplifiers and the Daily Dose.

| Day | Task | IMPL | Effort |
|---|---|---|---|
| 1–2 | Build PrequestionGate for Wiki | 04 | 8 hrs |
| 3 | Build interleave toggle + question mixing logic | 06 | 6 hrs |
| 4–5 | Build Adaptive Daily Dose algorithm | 13 | 10 hrs |
| 5 | Build MicroPlan time picker | 13 | 3 hrs |
| 6 | Build Today's Recommendation banner | 13 | 3 hrs |
| 7 | Build Calibration Score algorithm + snapshot | 03 | 6 hrs |
| 8 | Build CalibrationCurve Recharts component | 03/17 | 4 hrs |
| 9–10 | QA Sprint 2 | — | 6 hrs |

**Testing checkpoint:**
- [ ] Prequestions appear before Wiki articles with ≥3 available questions
- [ ] Interleaved sessions correctly mix 70/30 primary/related topics
- [ ] Daily Dose generates appropriate activities based on user state
- [ ] Calibration Score calculates correctly from confidence + accuracy data
- [ ] Calibration Curve renders with coaching annotations

**Ship:** Enable PREQUESTIONS, INTERLEAVING, DAILY_DOSE, CALIBRATION_SCORE

---

### Sprint 3: Feedback Intelligence (Week 5–6)
**Goal:** Make wrong answers diagnostic, not just disappointing.

| Day | Task | IMPL | Effort |
|---|---|---|---|
| 1–2 | Build error classifier | 09 | 8 hrs |
| 2 | Integrate into submit-answer | 09 | 2 hrs |
| 3 | Enhance FeedbackPanel with diagnostic messages | 09 | 4 hrs |
| 4–5 | Build Post-Simulation Debrief | 08 | 8 hrs |
| 6–7 | Build Pressure Ladder timer variants | 08 | 6 hrs |
| 8 | Build Exam-Day Simulation Protocol checklist | 08 | 3 hrs |
| 9–10 | QA Sprint 3 | — | 6 hrs |

**Ship:** Enable ERROR_TAXONOMY, PRESSURE_LADDER

---

### Sprint 4: Retention & Depth (Week 7–8)
**Goal:** Ship successive relearning, forgetting curves, and progress proof.

| Day | Task | IMPL | Effort |
|---|---|---|---|
| 1–3 | Build successive relearning mode | 05 | 12 hrs |
| 4–5 | Build personalized forgetting rate updater | 11 | 8 hrs |
| 5 | Build Review Calendar UI | 11 | 4 hrs |
| 6 | Build cramming detector | 11 | 2 hrs |
| 7–8 | Build monthly Progress Report generator | 14 | 8 hrs |
| 8 | Build sharable Progress Card | 14 | 4 hrs |
| 9 | Build Simulation Trajectory chart | 14 | 3 hrs |
| 10 | QA Sprint 4 | — | 6 hrs |

**Ship:** Enable SUCCESSIVE_RELEARNING, FORGETTING_RATES, PROGRESS_PROOF

---

### Sprint 5: 3D Lab & AI (Week 9–10)
**Goal:** Complete the 3D learning loop and Socratic AI.

| Day | Task | IMPL | Effort |
|---|---|---|---|
| 1–2 | Implement Bounds Breaking (Warm Red + citations) | IP Plan/16 | 8 hrs |
| 3–4 | Build In-Lab Quiz Mode | 16 | 10 hrs |
| 5 | Build Before/After compliance toggle | 16 | 4 hrs |
| 6 | Wire 3D → Quiz → Wiki bidirectional links | 16 | 3 hrs |
| 7–8 | Build SocraticExplorer component | 15 | 8 hrs |
| 9 | Build mnemonic generation feature | 15 | 3 hrs |
| 10 | QA Sprint 5 | — | 6 hrs |

**Ship:** Enable LAB_QUIZ, SOCRATIC_AI

---

### Sprint 6: Visualizations & Polish (Week 11–12)
**Goal:** Ship remaining student and commercial visualizations.

| Day | Task | IMPL | Effort |
|---|---|---|---|
| 1–2 | Build Stamina Heatmap, Forgetting Curves viz | 17 | 8 hrs |
| 3 | Build Difficulty/Mastery Scatter, Velocity Tracker | 17 | 6 hrs |
| 4 | Build Pacing/Accuracy Trade-off, Countdown | 17 | 4 hrs |
| 5–6 | Build Knowledge Network Graph (D3) | 17 | 10 hrs |
| 7 | Build Generation Questions + CMS tooling | 07 | 6 hrs |
| 8 | Build Memory Strength model | 12 | 4 hrs |
| 9 | Build ExportableChart wrapper + commercial viz | 18 | 6 hrs |
| 10 | Final QA, performance testing | — | 6 hrs |

**Ship:** Enable remaining flags. Full feature set live.

---

## Progressive Rollout Strategy

1. **Internal testing (1 week):** All features on staging with team accounts
2. **Beta cohort (2 weeks):** Enable for 10% of active users. Monitor error rates, performance, engagement.
3. **Full rollout:** Enable for all users. Remove feature flags after 30 days stable.

### Key Metrics to Watch During Rollout

| Metric | Threshold | Action if Exceeded |
|---|---|---|
| Page load time increase | > 200ms | Optimize queries, add caching |
| Quiz submission latency | > 500ms | Profile submit-answer action |
| Error rate (Sentry) | > 0.5% | Disable flag, hotfix |
| Confidence input skip rate | > 60% | Revisit UI placement/copy |
| Daily Dose start rate | < 20% | Revisit recommendation quality |
| Calibration data completeness | < 50% after 2 weeks | Make confidence input more prominent |

---

## Total Effort Summary

| Sprint | Duration | Key Deliverables |
|---|---|---|
| Sprint 0 | 2 days | Migrations, flags |
| Sprint 1 | 8 days | Predictions, Confidence, Lucky Guess, Focus Review, Feed-Forward |
| Sprint 2 | 10 days | Prequestions, Interleaving, Daily Dose, Calibration Score |
| Sprint 3 | 10 days | Error Taxonomy, Pressure Ladder, Simulation Protocol |
| Sprint 4 | 10 days | Successive Relearning, Forgetting Rates, Progress Proof |
| Sprint 5 | 10 days | 3D Lab Loop, Socratic AI |
| Sprint 6 | 10 days | All Visualizations, Generation Questions, Polish |
| **Total** | **~12 weeks** | **All 20 implementations shipped** |

This aligns with a single ALE exam cycle. Start now, ship before the next exam season.
