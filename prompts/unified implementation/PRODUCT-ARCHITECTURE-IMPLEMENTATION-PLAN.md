# PRODUCT-ARCHITECTURE-IMPLEMENTATION-PLAN.md
## SlateCamp — IRT & SRS Engine Integration
### 2026-03-25

---

## 1. EXECUTIVE SUMMARY

SlateCamp's deepest competitive moat is not its content library or its UI. It is the mastery measurement infrastructure: the closed loop from `user_interactions` → `user_node_mastery` → Readiness Score → progression mechanics that makes SlateCamp the only ALE prep platform that can tell a student *exactly* how ready they are and *exactly* what to study next.

Two critical engines exist in the codebase but are disconnected from production:

1. **IRT Adaptive Testing Engine** — The 2PL model (`probabilityCorrect`, `selectNextQuestion`, `updateTheta`) lives in `src/lib/srs/irt.ts` with 5 passing tests. It is never called. Sessions use `current_mastery_weight ASC` ordering instead of statistically optimal item selection. The PRD mandates IRT — this mandate is unmet.

2. **SRS Spaced Repetition Engine** — The SM-2 algorithm (`deriveQualityRating`, `updateSrsSchedule`) lives in `src/lib/srs/` with 21 passing tests. It works in the legacy `quiz.ts` flow but is **not called** by the primary `testing.ts` flow. Every session created through the Testing Hub (Camp/Storm/Chill/Focus Review/Custom/Simulation/Endurance) silently skips SRS updates. The spaced repetition system is effectively dead for the primary user path.

**What this plan does:** Reconnect both engines to the production testing flow, add the missing schema infrastructure, and integrate them into the existing mastery loop without disrupting any working feature.

**What this plan does NOT do:** Rebuild the mastery loop, replace the EMA scoring system, create new UX paradigms, or require a second engineer. Every change is designed for incremental deployment by a solo founder.

**Strategic value:**
- **Retention:** SRS-scheduled review sessions create a daily reason to return. Without SRS, students study when they remember to. With SRS, the platform tells them when to return and what to review.
- **Learning outcomes:** IRT-adaptive question selection means every question is calibrated to the student's ability. No wasted time on questions that are too easy (no signal) or too hard (no learning). Research shows adaptive testing improves learning efficiency by 20-40% versus random selection.
- **Competitive moat:** The combination of IRT + SRS + anti-inflation Readiness Score is proprietary IP that cannot be replicated without 12-18 months of data science investment and a calibrated question bank. This is SlateCamp's deepest moat — the algorithm that makes the product work.
- **Commercialization:** The Readiness Score API (Revenue Stream 2 in the IP commercialization ladder) requires IRT to be functional. White-label licensing (Revenue Stream 1) requires SRS to be connected. Neither revenue stream is possible until these engines are production-active.

---

## 2. PHASE 1 — EXISTING SYSTEM AUDIT

### 2.1 Integration Impact Matrix

| Component | Current State | IRT/SRS Integration Impact |
|---|---|---|
| **Question selection logic** | `src/lib/actions/testing.ts` creates sessions using DB-level ordering: `current_mastery_weight ASC` (weakest-first). No adaptive difficulty. Question pool filtered by `topic_id` and excluded already-answered IDs. Entry point: `createTestingSession()`. | **IRT replaces the ordering strategy.** Instead of `mastery_weight ASC`, the Server Action calls `select_next_item()` RPC which uses maximum Fisher information to pick the optimal question. The question pool filtering (topic, already-answered) remains unchanged. Impact: **medium** — swap the ordering logic in one function, preserve everything else. |
| **Question metadata** | `questions` table has: `question_id`, `topic_id`, `difficulty_label` (text: easy/medium/hard), `bloom_level`, `content`, `options`, `correct_answer`, `rationale`, `citations`. No numeric IRT parameters. | **Three IRT columns must be added:** `irt_difficulty FLOAT`, `irt_discrimination FLOAT`, `irt_guessing FLOAT`. The existing `difficulty_label` is a human-readable tag — it remains for admin UI. IRT params are the machine-readable calibration. Also add `irt_calibrated_at TIMESTAMPTZ` to track calibration freshness. Impact: **low** — additive columns, no existing column changes. |
| **User ability tracking** | `user_node_mastery` stores per-node EMA-weighted mastery (`mastery_weight FLOAT`). Updated by a trigger on `user_interactions` INSERT. No per-student global ability estimate. | **Theta is a separate signal from EMA mastery.** EMA mastery = how well the student has performed on a specific node over time. Theta = the student's overall ability level within a discipline, used by IRT to pick question difficulty. These serve different purposes and must coexist. A new `user_theta` table stores per-discipline theta. Impact: **low** — new table, no changes to existing EMA trigger. |
| **Session flow** | Session created in `createTestingSession()` → questions loaded → Zustand store (`useSessionStore`) manages client-side progression → answers submitted via `saveTestingInteraction()` → interaction INSERT triggers EMA update → session completed via `completeTestingSession()`. | **Two injection points:** (1) At session creation, replace batch question loading with single-question IRT selection. (2) At answer submission, add theta update + next question selection after the interaction INSERT. The Zustand store receives questions one at a time instead of all at once. Impact: **medium** — changes the question delivery pattern from batch to streaming. |
| **Mastery loop integrity** | `user_interactions` INSERT → trigger → `user_node_mastery` EMA update → `readiness_score_snapshots`. This loop is the core of the platform. | **No changes to this loop.** IRT theta updates happen in a separate RPC called by the Server Action, not in the existing trigger. SRS card updates happen in a separate call after the interaction INSERT. The EMA trigger continues to fire exactly as before. Impact: **zero** — both new engines operate alongside the existing loop, not inside it. |
| **Blindspot targeting** | `blindspot_queues` populated by a well-tested function (28 unit tests) that targets the 3 weakest nodes + unexplored grey nodes based on `user_node_mastery`. | **SRS and Blindspot are complementary, not conflicting.** Blindspot targets nodes with LOW mastery (student is weak and needs to learn). SRS targets nodes with DECAYING mastery (student knew it but is forgetting). They address different failure modes. When Blindspot selects a node, IRT can still pick the optimal question within that node. Impact: **zero** — Blindspot continues unchanged; SRS adds a new targeting dimension. |
| **Camp Trail integration** | `camp_trails` → `trail_days` → `trail_steps`. Trail steps prescribe topics (taxonomy nodes), not specific questions. When a student starts a trail step session, questions are fetched from the prescribed topic. | **IRT slots in naturally.** Trail steps already prescribe the topic (node). IRT replaces the question selection within that topic. SRS does not interfere with trail scheduling — trails are a structured curriculum path; SRS is for review of previously-studied material. Impact: **low** — trail sessions use IRT for question selection within prescribed topics. |
| **SRS engine code** | `src/lib/srs/sm2.ts` — SM-2 algorithm (correct, 6 tests). `src/lib/srs/quality.ts` — quality derivation from interaction data (correct, maps correctness + time + confidence to 0-5). `src/lib/srs/update.ts` — `updateSrsSchedule()` function (correct, 15 tests). Called by legacy `src/lib/actions/quiz.ts:388-395` but **NOT** by `src/lib/actions/testing.ts:492-544`. | **Reconnection is a 1-hour fix.** Add `deriveQualityRating()` + `updateSrsSchedule()` call to `saveTestingInteraction()` in `testing.ts`, matching the pattern already working in `quiz.ts`. This is the single highest-impact change in the entire plan. Impact: **critical but simple**. |
| **IRT engine code** | `src/lib/srs/irt.ts` — 2PL model with `probabilityCorrect()`, `selectNextQuestion()` (targets P(correct)=0.75), `updateTheta()` (Newton-Raphson single-step). 5 passing tests. Never called in production. | **Integration requires the Server Action to call these functions** during session creation and after each answer. Currently these are pure TypeScript functions. Phase 2 moves the heavy computation to PostgreSQL RPCs for sub-20ms performance, while keeping the TypeScript versions as reference implementations. Impact: **medium** — requires new RPCs and Server Action modifications. |
| **Readiness Score** | `src/lib/readiness-score.ts` — 330-line pure function with anti-inflation 6-vector computation. Reads from `user_node_mastery`. 0 tests (marked "DO NOT MODIFY WITHOUT TESTING"). | **IRT theta enriches but does not replace the Readiness Score.** The Readiness Score uses EMA mastery weights, which continue to update via the existing trigger. Theta is a separate signal that could be added as a 7th vector in a future iteration, but this plan does not modify the Readiness Score computation. Impact: **zero for now.** |

### 2.2 Architectural Blockers

| Blocker | Severity | Mitigation |
|---|---|---|
| `saveTestingInteraction()` does not call SRS update | **CRITICAL** — SRS is dead for all new sessions | Sprint 1 fix: add 4 lines matching `quiz.ts:388-395` pattern |
| IRT functions exist only in TypeScript, not as PostgreSQL RPCs | **HIGH** — sub-20ms item selection requires DB-side computation | Sprint 2: create `select_next_item` and `update_theta` RPCs |
| `questions` table lacks IRT parameter columns | **HIGH** — no numeric difficulty/discrimination data for IRT to use | Sprint 1: additive migration, cold-start defaults |
| No `user_theta` table or column exists | **HIGH** — no place to store/read student ability estimates | Sprint 1: new table with per-discipline theta |
| Session flow loads all questions at creation time | **MEDIUM** — IRT needs to select one question at a time based on the previous answer | Sprint 2: modify session flow to streaming question delivery |
| No SRS UI surface in dashboard | **LOW** — students cannot see or act on due review nodes | Sprint 4: `<ReviewDueCount />` widget |
| `readiness-score.ts` has 0 tests | **LOW for this plan** — we're not modifying it, but it's a landmine for future work | Separate hardening sprint |

### 2.3 Audit Conclusion

The existing architecture is well-suited for IRT and SRS integration. The mastery loop (`user_interactions` → trigger → `user_node_mastery`) does not need modification. Both engines operate alongside it, not inside it. The primary risk is not architectural — it's that the SRS disconnection has been silently degrading learning outcomes for every student using the Testing Hub. Reconnecting SRS is the single highest-ROI task in this entire plan.

---

## 3. PHASE 2 — IRT ENGINE BACKEND ARCHITECTURE

### 3.1 Architecture Decision Records

**ADR-001: IRT computation in PostgreSQL RPCs, not Edge Functions or client-side.**

Decision: All IRT computation (item selection, theta update) runs as PostgreSQL RPC functions via `supabase.rpc()`.

Rationale:
- Edge Functions have 150ms+ cold starts — unacceptable mid-quiz when a student is waiting for the next question
- Edge Functions have 50MB memory limits — item selection with large question pools needs efficient in-memory computation
- PostgreSQL RPCs execute in < 5ms on Supabase infrastructure with proper indexing because the computation runs next to the data
- Client-side computation would expose the IRT algorithm (proprietary IP) and add network round-trip latency
- The existing TypeScript implementations in `src/lib/srs/irt.ts` serve as reference/test implementations

**ADR-002: Theta is per-discipline, not global.**

Decision: Store one theta value per user per discipline (e.g., Structural Design, Professional Practice, etc.).

Rationale:
- A student who excels at Structural Design may struggle with Professional Practice. A single global theta would be meaningless for adaptive question selection within a specific topic area.
- The ALE has 3 official areas (A: Design 30%, B: Technology 30%, C: Professional Practice 40%). Per-discipline theta allows IRT to adapt within each area independently.
- The `disciplines` table already exists in the taxonomy tree. Theta maps naturally to this level.
- Per-discipline theta also enables the Readiness Score to incorporate discipline-specific ability estimates in future iterations.

**ADR-003: Theta and EMA mastery are parallel signals, not replacements.**

Decision: IRT theta lives in a new `user_theta` table. The existing `user_node_mastery` EMA system continues unchanged. Both feed into the learning loop but serve different purposes.

Rationale:
- EMA mastery = per-node historical performance (how well has the student done on Topic X over time). Used for the Taxonomy Heatmap, Blindspot targeting, and Readiness Score.
- IRT theta = per-discipline ability estimate (what difficulty level of questions should the student see). Used for adaptive question selection.
- Replacing EMA with theta would break the Heatmap, Blindspot, and Readiness Score — all working features.
- In the future, theta can be added as a 7th input vector to the Readiness Score computation, but that is a separate decision.

**ADR-004: 2PL model, not 3PL.**

Decision: Use the 2-Parameter Logistic model (difficulty + discrimination), not 3PL (which adds a guessing parameter).

Rationale:
- 3PL's guessing parameter (c) is notoriously difficult to calibrate and requires large sample sizes (1,000+ responses per item).
- SlateCamp's question bank will not have sufficient response data per item to reliably estimate c for months.
- The existing `src/lib/srs/irt.ts` implements 2PL. Switching to 3PL would require rewriting the item selection and theta update logic.
- 2PL is mathematically simpler, more stable with small sample sizes, and sufficient for adaptive selection.
- If guessing becomes a measurable problem (e.g., multiple-choice questions with 4 options have a floor of 25%), we can add a fixed guessing constant (c=0.25) without migrating to full 3PL estimation.

**ADR-005: Maximum Fisher Information for item selection.**

Decision: Select the next item by maximizing Fisher information at the student's current theta estimate.

Rationale:
- Fisher information quantifies how much statistical information an item provides about a student's ability at a given theta value.
- For 2PL, Fisher information at theta is: `I(theta) = a² * P(theta) * (1 - P(theta))` where `a` = discrimination and `P(theta)` = probability of correct response.
- This naturally selects items where the student has roughly a 50% chance of answering correctly (maximum uncertainty = maximum information), modulated by discrimination.
- The existing implementation targets P(correct) = 0.75, which is a common pedagogical compromise (enough challenge to learn, enough success to motivate). We keep this as a configurable parameter.
- Alternative approaches (Kullback-Leibler, Bayesian optimal design) provide marginal improvement at significant computational cost. Maximum information is the standard for operational CAT systems.

**ADR-006: Newton-Raphson MLE for theta updates, not EAP.**

Decision: Update theta after each response using Maximum Likelihood Estimation via Newton-Raphson single-step, matching the existing implementation.

Rationale:
- The existing `updateTheta()` in `src/lib/srs/irt.ts` uses Newton-Raphson single-step MLE. It works and is tested.
- EAP (Expected A Posteriori) requires numerical integration over the posterior distribution, which is significantly more expensive computationally — inappropriate for a per-response update that must complete in < 5ms.
- Newton-Raphson single-step is the standard for operational CAT theta estimation and converges quickly with well-calibrated items.
- Risk: MLE can diverge with perfect response patterns (all correct or all incorrect). Mitigation: clamp theta to [-4, 4] and add a Bayesian prior for the first 5 responses (ADR-007).

**ADR-007: Cold-start strategy.**

Decisions:

For new students (no theta):
- Initial theta = 0.0 (average ability on the logistic scale).
- First 5 questions use a fixed "warm-up" sequence: 1 easy (b ≈ -1.5), 2 medium (b ≈ 0), 2 medium-hard (b ≈ 1.0). This prevents the MLE from diverging on early responses.
- After 5 responses, switch to full adaptive selection.
- Apply a weak Bayesian prior (N(0, 1)) during the first 10 responses to regularize theta estimates.

For new questions (no IRT parameters):
- Default: `irt_difficulty = 0.0` (medium), `irt_discrimination = 1.0` (average), `irt_guessing = 0.0` (2PL, no guessing).
- Map existing `difficulty_label` to initial estimates: `easy → -1.5`, `medium → 0.0`, `hard → 1.5`.
- Flag as `irt_calibrated_at = NULL` (uncalibrated).
- After 30+ student responses, run calibration to estimate true parameters from response data.

For bootstrapping from historical data:
- `user_interactions` contains all historical response data (question_id, is_correct, response_time).
- A batch calibration script can estimate IRT parameters for all questions with 30+ responses.
- Student theta can be estimated from their interaction history using the calibrated item parameters.
- This bootstrap runs as a one-time migration script, not a production code path.


### 3.2 Schema Additions

**Migration: `20260326_add_irt_columns_to_questions.sql`**

```sql
-- Add IRT 2PL parameters to questions table
ALTER TABLE public.questions
  ADD COLUMN irt_difficulty FLOAT DEFAULT 0.0,
  ADD COLUMN irt_discrimination FLOAT DEFAULT 1.0,
  ADD COLUMN irt_guessing FLOAT DEFAULT 0.0,
  ADD COLUMN irt_calibrated_at TIMESTAMPTZ DEFAULT NULL;

-- Index for IRT item selection queries
-- Filters by topic_id (existing), orders by information criterion (computed)
CREATE INDEX idx_questions_irt_params
  ON public.questions(topic_id, irt_difficulty, irt_discrimination)
  WHERE irt_discrimination > 0;

-- Backfill difficulty estimates from existing difficulty_label
UPDATE public.questions SET irt_difficulty = CASE
  WHEN difficulty_label = 'easy' THEN -1.5
  WHEN difficulty_label = 'medium' THEN 0.0
  WHEN difficulty_label = 'hard' THEN 1.5
  ELSE 0.0
END;

COMMENT ON COLUMN public.questions.irt_difficulty IS '2PL difficulty parameter (b). Higher = harder. Scale: [-4, 4]. Default 0.0 = medium.';
COMMENT ON COLUMN public.questions.irt_discrimination IS '2PL discrimination parameter (a). Higher = more discriminating. Scale: [0.1, 3.0]. Default 1.0 = average.';
COMMENT ON COLUMN public.questions.irt_guessing IS 'Reserved for future 3PL. Currently unused (always 0.0).';
COMMENT ON COLUMN public.questions.irt_calibrated_at IS 'NULL = uncalibrated (using defaults). Set when batch calibration runs.';
```

**Migration: `20260326_create_user_theta.sql`**

```sql
-- Per-discipline ability estimate for IRT adaptive testing
CREATE TABLE public.user_theta (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  discipline_id UUID NOT NULL,
  theta FLOAT NOT NULL DEFAULT 0.0,
  theta_se FLOAT NOT NULL DEFAULT 1.0,  -- standard error (confidence in estimate)
  responses_count INTEGER NOT NULL DEFAULT 0,
  last_updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT uq_user_theta_user_discipline UNIQUE (user_id, discipline_id),
  CONSTRAINT chk_theta_range CHECK (theta BETWEEN -4.0 AND 4.0),
  CONSTRAINT chk_theta_se_positive CHECK (theta_se > 0)
);

ALTER TABLE public.user_theta ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_user_theta_user_id ON public.user_theta(user_id);
CREATE INDEX idx_user_theta_user_discipline ON public.user_theta(user_id, discipline_id);

-- RLS policies
CREATE POLICY "Users can select own theta"
  ON public.user_theta FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own theta"
  ON public.user_theta FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own theta"
  ON public.user_theta FOR UPDATE TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- Auto-update updated_at
CREATE TRIGGER tr_user_theta_updated_at
  BEFORE UPDATE ON public.user_theta
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE public.user_theta IS 'IRT ability estimates per user per discipline. Theta on logistic scale [-4, 4]. SE decreases as responses_count increases.';
COMMENT ON COLUMN public.user_theta.theta IS 'Ability estimate on 2PL logistic scale. 0.0 = average. Positive = higher ability.';
COMMENT ON COLUMN public.user_theta.theta_se IS 'Standard error of theta estimate. Starts at 1.0, decreases with responses. Below 0.3 = reliable.';
```


### 3.3 RPC Functions

**Function: `select_next_item`**

```sql
-- Selects the optimal next question for IRT adaptive testing
-- Uses Maximum Fisher Information criterion
-- Must execute in < 20ms for a pool of 500 candidate questions

CREATE OR REPLACE FUNCTION public.select_next_item(
  p_user_id UUID,
  p_session_id UUID,
  p_discipline_id UUID DEFAULT NULL,
  p_topic_id UUID DEFAULT NULL,
  p_target_p FLOAT DEFAULT 0.75  -- target probability of correct response
)
RETURNS TABLE (
  question_id UUID,
  irt_difficulty FLOAT,
  irt_discrimination FLOAT,
  predicted_p_correct FLOAT,
  fisher_information FLOAT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_theta FLOAT;
  v_responses_count INTEGER;
BEGIN
  -- 1. Get student's current theta for this discipline
  SELECT ut.theta, ut.responses_count
  INTO v_theta, v_responses_count
  FROM user_theta ut
  WHERE ut.user_id = p_user_id
    AND (p_discipline_id IS NULL OR ut.discipline_id = p_discipline_id)
  LIMIT 1;

  -- Cold start: no theta record yet, use default
  IF v_theta IS NULL THEN
    v_theta := 0.0;
    v_responses_count := 0;
  END IF;

  -- 2. For warm-up phase (first 5 questions), use fixed difficulty targeting
  IF v_responses_count < 5 THEN
    RETURN QUERY
    SELECT
      q.question_id,
      q.irt_difficulty,
      q.irt_discrimination,
      (1.0 / (1.0 + exp(-q.irt_discrimination * (v_theta - q.irt_difficulty))))::FLOAT AS predicted_p_correct,
      0.0::FLOAT AS fisher_information
    FROM questions q
    WHERE (p_topic_id IS NULL OR q.topic_id = p_topic_id::TEXT)
      AND q.question_id NOT IN (
        SELECT ui.question_id FROM user_interactions ui
        WHERE ui.session_id = p_session_id
      )
      AND q.irt_discrimination > 0
    ORDER BY ABS(q.irt_difficulty - (
      CASE v_responses_count
        WHEN 0 THEN -1.5  -- easy
        WHEN 1 THEN 0.0   -- medium
        WHEN 2 THEN 0.0   -- medium
        WHEN 3 THEN 1.0   -- medium-hard
        WHEN 4 THEN 1.0   -- medium-hard
        ELSE 0.0
      END
    ))
    LIMIT 1;
    RETURN;
  END IF;

  -- 3. Full adaptive selection: Maximum Fisher Information
  --    For 2PL: I(theta) = a^2 * P(theta) * (1 - P(theta))
  --    Where P(theta) = 1 / (1 + exp(-a * (theta - b)))
  RETURN QUERY
  WITH candidate_items AS (
    SELECT
      q.question_id,
      q.irt_difficulty AS b,
      q.irt_discrimination AS a,
      -- 2PL probability of correct response
      (1.0 / (1.0 + exp(-q.irt_discrimination * (v_theta - q.irt_difficulty)))) AS p_correct
    FROM questions q
    WHERE (p_topic_id IS NULL OR q.topic_id = p_topic_id::TEXT)
      AND q.question_id NOT IN (
        SELECT ui.question_id FROM user_interactions ui
        WHERE ui.session_id = p_session_id
      )
      AND q.irt_discrimination > 0
  )
  SELECT
    ci.question_id,
    ci.b AS irt_difficulty,
    ci.a AS irt_discrimination,
    ci.p_correct::FLOAT AS predicted_p_correct,
    -- Fisher information: a^2 * P * (1-P)
    (ci.a * ci.a * ci.p_correct * (1.0 - ci.p_correct))::FLOAT AS fisher_information
  FROM candidate_items ci
  -- Weight Fisher information toward target probability
  -- This biases selection toward items where P(correct) ≈ p_target
  ORDER BY
    (ci.a * ci.a * ci.p_correct * (1.0 - ci.p_correct))
    * (1.0 - ABS(ci.p_correct - p_target_p) * 2.0)  -- penalty for deviating from target
    DESC
  LIMIT 1;
END;
$$;

-- Grant execute to authenticated users (RLS on underlying tables handles row security)
GRANT EXECUTE ON FUNCTION public.select_next_item TO authenticated;

COMMENT ON FUNCTION public.select_next_item IS 'IRT 2PL adaptive item selection. Returns the question that maximizes Fisher information at the students current theta, biased toward target P(correct). Cold-start warm-up for first 5 questions.';
```

**Function: `update_theta`**

```sql
-- Updates student theta after an answer using Newton-Raphson MLE single-step
-- Called by Server Action after each interaction INSERT

CREATE OR REPLACE FUNCTION public.update_theta(
  p_user_id UUID,
  p_discipline_id UUID,
  p_item_difficulty FLOAT,
  p_item_discrimination FLOAT,
  p_is_correct BOOLEAN
)
RETURNS TABLE (
  new_theta FLOAT,
  new_se FLOAT,
  new_responses_count INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_theta FLOAT;
  v_se FLOAT;
  v_count INTEGER;
  v_p FLOAT;         -- P(correct) at current theta
  v_response FLOAT;  -- 1.0 if correct, 0.0 if incorrect
  v_a FLOAT;         -- discrimination
  v_info FLOAT;      -- Fisher information
  v_gradient FLOAT;  -- first derivative of log-likelihood
  v_step FLOAT;      -- Newton-Raphson step
  v_prior_weight FLOAT;  -- Bayesian prior strength (decays with responses)
BEGIN
  v_a := p_item_discrimination;
  v_response := CASE WHEN p_is_correct THEN 1.0 ELSE 0.0 END;

  -- Get current theta (or create default)
  SELECT ut.theta, ut.theta_se, ut.responses_count
  INTO v_theta, v_se, v_count
  FROM user_theta ut
  WHERE ut.user_id = p_user_id AND ut.discipline_id = p_discipline_id;

  IF v_theta IS NULL THEN
    -- First response: create record
    v_theta := 0.0;
    v_se := 1.0;
    v_count := 0;

    INSERT INTO user_theta (user_id, discipline_id, theta, theta_se, responses_count)
    VALUES (p_user_id, p_discipline_id, v_theta, v_se, v_count);
  END IF;

  -- Compute P(correct) at current theta
  v_p := 1.0 / (1.0 + exp(-v_a * (v_theta - p_item_difficulty)));

  -- Clamp p away from 0 and 1 to prevent division issues
  v_p := GREATEST(0.001, LEAST(0.999, v_p));

  -- Fisher information at current theta: a^2 * P * (1-P)
  v_info := v_a * v_a * v_p * (1.0 - v_p);

  -- Log-likelihood gradient: a * (response - P)
  v_gradient := v_a * (v_response - v_p);

  -- Bayesian prior regularization for first 10 responses
  -- Prior: N(0, 1) -> adds -theta/1.0 to gradient and 1.0 to info
  v_prior_weight := GREATEST(0.0, 1.0 - (v_count::FLOAT / 10.0));
  v_gradient := v_gradient - v_prior_weight * v_theta;
  v_info := v_info + v_prior_weight;

  -- Newton-Raphson step: theta_new = theta + gradient / info
  v_step := v_gradient / GREATEST(v_info, 0.01);  -- prevent division by near-zero

  -- Clamp step size to prevent wild jumps
  v_step := GREATEST(-1.0, LEAST(1.0, v_step));

  -- Update theta
  v_theta := GREATEST(-4.0, LEAST(4.0, v_theta + v_step));

  -- Update standard error (inverse sqrt of cumulative info)
  v_se := 1.0 / GREATEST(sqrt(v_info * (v_count + 1)), 0.1);

  v_count := v_count + 1;

  -- Persist
  UPDATE user_theta
  SET theta = v_theta,
      theta_se = v_se,
      responses_count = v_count,
      last_updated_at = now(),
      updated_at = now()
  WHERE user_id = p_user_id AND discipline_id = p_discipline_id;

  -- Return updated values
  RETURN QUERY SELECT v_theta, v_se, v_count;
END;
$$;

GRANT EXECUTE ON FUNCTION public.update_theta TO authenticated;

COMMENT ON FUNCTION public.update_theta IS 'Newton-Raphson MLE single-step theta update with Bayesian prior for first 10 responses. Clamps theta to [-4, 4] and step size to [-1, 1].';
```


### 3.4 IRT Calibration Script (Batch — Not Production Path)

This script runs offline to calibrate IRT parameters from historical `user_interactions` data. It is not part of the production code path — it runs as a scheduled migration or manual operation.

```sql
-- Batch IRT calibration: estimate item difficulty from historical response data
-- Run after accumulating 30+ responses per question
-- This is a simplified method; full IRT calibration uses EM algorithm (MMLE)

CREATE OR REPLACE FUNCTION public.calibrate_irt_batch()
RETURNS TABLE (
  question_id UUID,
  new_difficulty FLOAT,
  new_discrimination FLOAT,
  response_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH response_stats AS (
    SELECT
      ui.question_id,
      COUNT(*) AS n_responses,
      AVG(CASE WHEN ui.is_correct THEN 1.0 ELSE 0.0 END) AS p_correct,
      STDDEV(CASE WHEN ui.is_correct THEN 1.0 ELSE 0.0 END) AS sd_correct
    FROM user_interactions ui
    WHERE ui.question_id IS NOT NULL
    GROUP BY ui.question_id
    HAVING COUNT(*) >= 30
  )
  SELECT
    rs.question_id,
    -- Map proportion correct to difficulty via inverse logistic
    -- p = 0.5 → b = 0 (medium), p = 0.9 → b ≈ -2.2 (easy), p = 0.1 → b ≈ 2.2 (hard)
    GREATEST(-4.0, LEAST(4.0,
      -ln(rs.p_correct / GREATEST(1.0 - rs.p_correct, 0.01))
    ))::FLOAT AS new_difficulty,
    -- Discrimination from variance (higher variance = lower discrimination)
    GREATEST(0.3, LEAST(3.0,
      CASE WHEN rs.sd_correct > 0.01
        THEN 1.0 / (rs.sd_correct * 2.5)
        ELSE 1.0
      END
    ))::FLOAT AS new_discrimination,
    rs.n_responses AS response_count
  FROM response_stats rs;
END;
$$;

-- Usage:
-- UPDATE questions q
-- SET irt_difficulty = c.new_difficulty,
--     irt_discrimination = c.new_discrimination,
--     irt_calibrated_at = now()
-- FROM calibrate_irt_batch() c
-- WHERE q.question_id = c.question_id;
```


---

## 4. PHASE 3 — SRS ENGINE BACKEND ARCHITECTURE

### 4.1 Architecture Decision Records

**ADR-008: SRS operates on taxonomy nodes, not individual questions.**

Decision: `user_srs_cards` has one row per user × taxonomy node. When a node is due for review, the quiz engine selects questions from that node (using IRT if calibrated, random otherwise).

Rationale:
- Students don't "review a question" — they review a concept (node). Seeing the same question repeatedly tests recall of the specific question, not understanding of the concept.
- This makes SRS and IRT complementary: SRS decides WHEN to review, IRT decides WHAT question to show within the node.
- The existing `user_node_mastery` is also per-node, so SRS cards align naturally with the mastery data.

**ADR-009: SM-2 algorithm, not FSRS.**

Decision: Keep the existing SM-2 implementation. Do not migrate to FSRS.

Rationale:
- SM-2 is already implemented, tested (21 tests), and correct in `src/lib/srs/`.
- FSRS requires training a neural network on user response data, which SlateCamp doesn't have enough of yet.
- SM-2 is well-understood, debuggable, and performs well for the first 12-18 months of operation.
- Migration to FSRS can happen later when sufficient response data is collected, as a drop-in replacement at the scheduling layer.

**ADR-010: Quality rating derived automatically, not user-reported.**

Decision: Use the existing `deriveQualityRating()` function that maps correctness + response time + confidence to SM-2 quality (0-5). Students never see or interact with the quality rating.

Rationale:
- Asking students to self-rate recall quality ("How well did you know this?") creates friction and is unreliable (Dunning-Kruger effect).
- The existing derivation function is well-designed and tested. It considers multiple signals that are more objective than self-report.
- This is also a UX decision: SlateCamp controls the algorithm. The student studies; SlateCamp decides when to bring it back.


### 4.2 Schema

**Migration: `20260326_create_user_srs_cards.sql`**

```sql
-- SRS scheduling cards: one per user × taxonomy node
-- Tracks when each node is due for review based on SM-2 algorithm

CREATE TABLE public.user_srs_cards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  node_id TEXT NOT NULL,  -- taxonomy_tree node identifier
  ease_factor FLOAT NOT NULL DEFAULT 2.5,  -- SM-2 ease factor (floor: 1.3)
  interval_days FLOAT NOT NULL DEFAULT 1.0,  -- current interval in days
  repetitions INTEGER NOT NULL DEFAULT 0,  -- consecutive successful reviews
  quality_last INTEGER DEFAULT NULL,  -- last SM-2 quality rating (0-5)
  next_review_at TIMESTAMPTZ NOT NULL DEFAULT now(),  -- when this node is due
  last_reviewed_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT uq_user_srs_cards_user_node UNIQUE (user_id, node_id),
  CONSTRAINT chk_ease_factor_min CHECK (ease_factor >= 1.3),
  CONSTRAINT chk_interval_positive CHECK (interval_days > 0),
  CONSTRAINT chk_quality_range CHECK (quality_last IS NULL OR quality_last BETWEEN 0 AND 5)
);

ALTER TABLE public.user_srs_cards ENABLE ROW LEVEL SECURITY;

-- Primary query pattern: "what nodes are due for review for this user?"
CREATE INDEX idx_user_srs_cards_review_due
  ON public.user_srs_cards(user_id, next_review_at)
  WHERE next_review_at <= now();

CREATE INDEX idx_user_srs_cards_user_id ON public.user_srs_cards(user_id);
CREATE INDEX idx_user_srs_cards_node_id ON public.user_srs_cards(node_id);

-- RLS policies
CREATE POLICY "Users can select own SRS cards"
  ON public.user_srs_cards FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own SRS cards"
  ON public.user_srs_cards FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own SRS cards"
  ON public.user_srs_cards FOR UPDATE TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- Auto-update updated_at
CREATE TRIGGER tr_user_srs_cards_updated_at
  BEFORE UPDATE ON public.user_srs_cards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE public.user_srs_cards IS 'SM-2 spaced repetition scheduling. One card per user per taxonomy node. Cards created on first interaction with a node. next_review_at determines when the node appears in the review deck.';
```


### 4.3 SRS RPCs

**Function: `get_review_deck`**

```sql
-- Returns taxonomy nodes due for review, ordered by overdue priority
CREATE OR REPLACE FUNCTION public.get_review_deck(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
  node_id TEXT,
  ease_factor FLOAT,
  interval_days FLOAT,
  repetitions INTEGER,
  next_review_at TIMESTAMPTZ,
  overdue_days FLOAT,
  last_reviewed_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    srs.node_id,
    srs.ease_factor,
    srs.interval_days,
    srs.repetitions,
    srs.next_review_at,
    EXTRACT(EPOCH FROM (now() - srs.next_review_at)) / 86400.0 AS overdue_days,
    srs.last_reviewed_at
  FROM user_srs_cards srs
  WHERE srs.user_id = p_user_id
    AND srs.next_review_at <= now()
  ORDER BY srs.next_review_at ASC  -- most overdue first
  LIMIT p_limit;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_review_deck TO authenticated;
```

**Function: `get_review_due_count`**

```sql
-- Returns count of nodes due for review (for dashboard widget)
CREATE OR REPLACE FUNCTION public.get_review_due_count(
  p_user_id UUID
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO v_count
  FROM user_srs_cards
  WHERE user_id = p_user_id
    AND next_review_at <= now();

  RETURN COALESCE(v_count, 0);
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_review_due_count TO authenticated;
```


### 4.4 SRS ↔ Blindspot ↔ IRT Data Flow

```
Student answers a question in ANY mode
  │
  ├─→ INSERT user_interactions (immutable log)
  │     └─→ TRIGGER: update user_node_mastery (EMA)
  │           └─→ Readiness Score recalculated
  │           └─→ Blindspot queue regenerated (targets LOW mastery nodes)
  │
  ├─→ RPC: update_theta (IRT ability update)
  │     └─→ Next question selected via select_next_item
  │
  └─→ updateSrsSchedule() (SM-2 card update)
        └─→ user_srs_cards.next_review_at updated
              └─→ Node appears in review deck when due (targets DECAYING mastery nodes)

Review session starts
  │
  ├─→ RPC: get_review_deck → returns due nodes
  │
  └─→ For each node: select_next_item scoped to that node's topic_id
        └─→ Student sees IRT-optimal question from a spaced-repetition-scheduled node
```

**Key distinction:**
- **Blindspot** = "You've never been good at this. Study it." (Targets weakness)
- **SRS** = "You used to know this. Review it before you forget." (Targets decay)
- **IRT** = "Here's a question at exactly your level." (Optimizes difficulty)

These three systems form a triangle: Blindspot picks what to learn, SRS picks when to review, IRT picks how hard the question should be. They never conflict because they operate on orthogonal dimensions.


---

## 5. PHASE 4 — NEXT.JS INTEGRATION LAYER

### 5.1 Adaptive Quiz Session Flow

**Modified Server Action: `createTestingSession()`**

File: `src/lib/actions/testing.ts`

```typescript
// BEFORE: loads all questions at once, ordered by mastery_weight ASC
// AFTER: loads first question via IRT RPC, subsequent questions fetched one at a time

export async function createAdaptiveSession(
  userId: string,
  mode: SessionMode,
  config: {
    disciplineId?: string;
    topicId?: string;
    questionCount: number;
  }
): Promise<{ sessionId: string; firstQuestion: Question } | { error: string }> {
  const supabase = createClient()

  // 1. Create session record (same as existing)
  const { data: session, error: sessionError } = await supabase
    .from('quiz_sessions')
    .insert({
      user_id: userId,
      mode,
      status: 'in_progress',
      question_count: config.questionCount,
      current_question_index: 0,
      started_at: new Date().toISOString(),
    })
    .select('id')
    .single()

  if (sessionError) return { error: 'Failed to create session.' }

  // 2. Get first question via IRT (or fallback to random for non-adaptive modes)
  let firstQuestion: Question

  if (['camp', 'storm', 'review'].includes(mode)) {
    // IRT adaptive selection
    const { data: irtResult, error: irtError } = await supabase
      .rpc('select_next_item', {
        p_user_id: userId,
        p_session_id: session.id,
        p_discipline_id: config.disciplineId || null,
        p_topic_id: config.topicId || null,
      })

    if (irtError || !irtResult?.length) {
      // Fallback: random selection if IRT fails
      firstQuestion = await fallbackRandomQuestion(supabase, config.topicId)
    } else {
      firstQuestion = await fetchQuestionById(supabase, irtResult[0].question_id)
    }
  } else {
    // Non-adaptive modes (blindspot, proof, etc.) use existing selection
    firstQuestion = await existingQuestionSelection(supabase, mode, config)
  }

  return { sessionId: session.id, firstQuestion }
}
```

**Modified Server Action: `saveTestingInteraction()`**

File: `src/lib/actions/testing.ts`

```typescript
export async function saveTestingInteraction(
  sessionId: string,
  questionId: string,
  answerId: string,
  responseTimeMs: number,
  isCorrect: boolean,
  config: {
    disciplineId?: string;
    topicId?: string;
    nodeId?: string;
  }
): Promise<{
  nextQuestion: Question | null;  // null if session complete
  isCorrect: boolean;
} | { error: string }> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  // 1. INSERT interaction (triggers EMA update via existing trigger) — UNCHANGED
  const { error: interactionError } = await supabase
    .from('user_interactions')
    .insert({
      session_id: sessionId,
      question_id: questionId,
      user_id: user.id,
      selected_answer: answerId,
      is_correct: isCorrect,
      response_time_ms: responseTimeMs,
      topic_id: config.topicId,
    })

  if (interactionError) return { error: 'Failed to save interaction.' }

  // 2. SRS update — THE CRITICAL RECONNECTION (matches quiz.ts:388-395 pattern)
  try {
    if (config.nodeId) {
      const quality = deriveQualityRating({
        isCorrect,
        responseTimeMs,
        // additional signals as available
      })
      await updateSrsSchedule(user.id, config.nodeId, quality)
    }
  } catch (srsError) {
    // SRS failure must not block the quiz flow
    console.error('[TESTING: SRS] updateSrsSchedule failed:', srsError)
  }

  // 3. IRT theta update — NEW
  try {
    if (config.disciplineId) {
      const { data: questionParams } = await supabase
        .from('questions')
        .select('irt_difficulty, irt_discrimination')
        .eq('question_id', questionId)
        .single()

      if (questionParams) {
        await supabase.rpc('update_theta', {
          p_user_id: user.id,
          p_discipline_id: config.disciplineId,
          p_item_difficulty: questionParams.irt_difficulty,
          p_item_discrimination: questionParams.irt_discrimination,
          p_is_correct: isCorrect,
        })
      }
    }
  } catch (thetaError) {
    // Theta failure must not block the quiz flow
    console.error('[TESTING: IRT] update_theta failed:', thetaError)
  }

  // 4. Select next question via IRT — NEW
  const { data: nextItem } = await supabase.rpc('select_next_item', {
    p_user_id: user.id,
    p_session_id: sessionId,
    p_discipline_id: config.disciplineId || null,
    p_topic_id: config.topicId || null,
  })

  const nextQuestion = nextItem?.length
    ? await fetchQuestionById(supabase, nextItem[0].question_id)
    : null  // no more questions = session complete

  return { nextQuestion, isCorrect }
}
```


### 5.2 SRS Review Deck

**New query: `src/lib/queries/srs.ts`**

```typescript
// SRS: ReviewDueCount
export async function fetchReviewDueCount(
  userId: string
): Promise<QueryResult<number>> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase.rpc('get_review_due_count', {
      p_user_id: userId,
    })
    if (error) throw error
    return { data: data ?? 0, error: null }
  } catch (err) {
    console.error('[SRS: ReviewDueCount] fetchReviewDueCount:', err)
    return { data: null, error: 'Failed to load review count.' }
  }
}

// SRS: ReviewDeck
export async function fetchReviewDeck(
  userId: string,
  limit: number = 20
): Promise<QueryResult<ReviewNode[]>> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase.rpc('get_review_deck', {
      p_user_id: userId,
      p_limit: limit,
    })
    if (error) throw error
    return { data: data ?? [], error: null }
  } catch (err) {
    console.error('[SRS: ReviewDeck] fetchReviewDeck:', err)
    return { data: null, error: 'Failed to load review deck.' }
  }
}
```

**New action: `src/lib/actions/srs.ts`**

```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { deriveQualityRating } from '@/lib/srs/quality'
import { updateSrsSchedule } from '@/lib/srs/update'

// SRS: Start Review Session
export async function startReviewSession(
  userId: string
): Promise<{ sessionId: string; reviewNodes: ReviewNode[] } | { error: string }> {
  const supabase = createClient()

  // Get due nodes
  const { data: deck, error: deckError } = await supabase.rpc('get_review_deck', {
    p_user_id: userId,
    p_limit: 20,
  })

  if (deckError || !deck?.length) {
    return { error: 'No nodes due for review.' }
  }

  // Create session with mode: 'review'
  const { data: session, error: sessionError } = await supabase
    .from('quiz_sessions')
    .insert({
      user_id: userId,
      mode: 'review',
      status: 'in_progress',
      question_count: deck.length,
      current_question_index: 0,
      started_at: new Date().toISOString(),
    })
    .select('id')
    .single()

  if (sessionError) return { error: 'Failed to create review session.' }

  return { sessionId: session.id, reviewNodes: deck }
}

// SRS: Complete Review Session
export async function completeReviewSession(
  sessionId: string
): Promise<{ success: boolean } | { error: string }> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('quiz_sessions')
    .update({ status: 'completed', completed_at: new Date().toISOString() })
    .eq('id', sessionId)
    .eq('user_id', user.id)

  if (error) return { error: 'Failed to complete session.' }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/testing')

  return { success: true }
}
```


### 5.3 Caching Strategy

| Resource | Cacheable? | Strategy | Invalidation |
|---|---|---|---|
| Active quiz session (next question) | **NO** | Never cache. Each question depends on the previous answer. Server Action returns next question directly. | N/A |
| Review deck (due node list) | **YES — short TTL** | Cache per-user, 5-minute TTL via `unstable_cache` with `revalidateTag('srs-deck')` | Invalidate on session complete (`revalidateTag('srs-deck')`) |
| Review due count (dashboard widget) | **YES — short TTL** | Same as review deck, shares the `srs-deck` tag | Same as above |
| Readiness Score | **YES — event-driven** | Cached per-user. Revalidate when `user_node_mastery` updates (after any session). | `revalidatePath('/dashboard')` in `completeTestingSession()` (already present) |
| Taxonomy Heatmap | **YES — event-driven** | Same as Readiness Score — revalidates on mastery update | Same as above |
| IRT question parameters | **YES — long TTL** | Question IRT params change only during batch calibration. Cache indefinitely; bust on calibration run. | Manual revalidation after `calibrate_irt_batch()` |
| User theta | **NO** | Updated every answer. Read by `select_next_item` RPC directly from DB. | N/A — always fresh from DB |

### 5.4 File Location Summary

| File | Type | Status |
|---|---|---|
| `src/lib/queries/srs.ts` | Query module | **NEW** — fetchReviewDueCount, fetchReviewDeck |
| `src/lib/queries/adaptive-quiz.ts` | Query module | **NEW** — fetchQuestionById, fetchUserTheta |
| `src/lib/actions/srs.ts` | Server Actions | **NEW** — startReviewSession, completeReviewSession |
| `src/lib/actions/testing.ts` | Server Actions | **MODIFIED** — add SRS call, add IRT theta update, add IRT next-item selection |
| `src/lib/srs/irt.ts` | Pure functions | **UNCHANGED** — reference implementation, tested |
| `src/lib/srs/sm2.ts` | Pure functions | **UNCHANGED** — SM-2 algorithm, tested |
| `src/lib/srs/quality.ts` | Pure functions | **UNCHANGED** — quality derivation, tested |
| `src/lib/srs/update.ts` | Pure functions | **UNCHANGED** — SRS schedule updater, tested |


---

## 6. PHASE 5 — UX & COMPONENT ARCHITECTURE

### 6.1 Adaptive Difficulty — What Students See (and Don't)

**Principle: IRT is invisible infrastructure. The student sees the result (better questions), never the mechanism (theta scores, Fisher information).**

| What the student sees | What happens in the backend |
|---|---|
| "Start Session" button (unchanged) | `createAdaptiveSession()` calls `select_next_item` RPC |
| Questions that feel "about right" in difficulty | IRT targets P(correct) ≈ 0.75 at their current theta |
| Normal session flow — answer, feedback, next question | `saveTestingInteraction()` updates theta + selects next item |
| Session summary: "You answered 18/25 correctly" | Normal score display. No mention of adaptive difficulty. |
| Taxonomy Heatmap getting greener | EMA mastery updates exactly as before. IRT doesn't change the heatmap. |

**What the student NEVER sees:**
- Their theta score
- The word "adaptive" or "IRT" anywhere in the UI
- Item difficulty/discrimination parameters
- Any indication that easier questions are being served because they're struggling
- Any indication that harder questions are being served because they're excelling

**If a student is struggling (theta dropping):**
- Show effort-based signals: "You've answered 47 questions this week" (absolute progress)
- Show time-based signals: "3-day study streak" (consistency)
- Do NOT show declining accuracy percentages or mastery score drops during active sessions
- The session summary shows raw score (18/25) but the Heatmap and Readiness Score will naturally reflect the struggle via EMA — this is honest and the student can process it outside the session context

**Post-session message (new, subtle):**
After an IRT-adaptive session completes, add one line to the session summary:
> "This session was calibrated to your current level."

This normalizes adaptive difficulty as a feature without explaining the mechanism. It reframes "the questions were hard" as "the system is working for you."


### 6.2 SRS Review Interface

**New component: `<ReviewDueCount />`**

Location: `src/components/dashboard/ReviewDueCount.tsx`

```typescript
// Server Component — no 'use client' needed
import { fetchReviewDueCount } from '@/lib/queries/srs'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface ReviewDueCountProps {
  userId: string
}

export async function ReviewDueCount({ userId }: ReviewDueCountProps) {
  const { data: count } = await fetchReviewDueCount(userId)

  if (!count || count === 0) return null  // don't show if nothing due

  return (
    <div className="flex items-center justify-between rounded-xl border bg-card p-4">
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Review Due
        </p>
        <p className="text-2xl font-mono tabular-nums font-bold">
          {count} {count === 1 ? 'topic' : 'topics'}
        </p>
      </div>
      <Link href="/dashboard/testing?mode=review">
        <Button variant="default" size="sm">
          Start Review
        </Button>
      </Link>
    </div>
  )
}
```

Placement: Dashboard page, above the Taxonomy Heatmap. Wrapped in `<Suspense fallback={<ReviewDueCountSkeleton />}>`.

Behavior:
- Shows only when count > 0 (no empty state clutter)
- CTA links to testing hub with `mode=review` pre-selected
- Server Component — count fetched server-side, no client JS
- Revalidates when `srs-deck` tag is busted (on session complete)

**Review session UX:**
- Uses the existing `<QuizSession />` component with `mode: 'review'`
- Questions are scoped to due SRS nodes (one at a time, IRT-selected within each node)
- Session summary after completion shows: nodes reviewed, next review dates for each node
- No new UI paradigm — review sessions feel like regular quiz sessions because they ARE regular quiz sessions with a different question source

**Modified component: `<TaxonomyHeatmap />`**

Add SRS review indicators to existing heatmap nodes:

```typescript
// Modified MasteryNode type — add optional SRS data
interface MasteryNode {
  node_id: string
  mastery_weight: number
  // ... existing fields ...
  srs_due?: boolean  // NEW: true if this node has an SRS card due for review
}
```

Visual treatment: Nodes due for review get a small pulsing dot indicator (not a badge, not a notification count — a subtle visual signal that something is waiting). This uses the existing node tile; no new component needed. Just a conditional CSS class:

```css
.srs-due-indicator {
  position: absolute;
  top: 2px;
  right: 2px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--primary);
  animation: pulse 2s ease-in-out infinite;
}
```

**Dashboard notification banner (deferred — Sprint 5+):**
A persistent but dismissible banner at the top of the dashboard: "You have 5 topics due for review." This is lower priority than the `<ReviewDueCount />` widget because the widget is already visible on the dashboard. The banner adds value for students who navigate directly to testing without seeing the dashboard.


### 6.3 Component Modification Summary

| Component | Change Type | What Changes |
|---|---|---|
| `QuizSession` (existing) | **MODIFIED** | Accept `getNextQuestion` as injected strategy prop instead of loading all questions upfront. Support `mode: 'review'`. |
| `useSessionStore` (Zustand) | **MODIFIED** | Change from storing full question array to storing current question + fetchNext callback. Add `currentNodeId` for SRS context. |
| `TaxonomyHeatmap` (existing) | **MODIFIED** | Accept `showSrsIndicators` prop. Overlay due-for-review dot on applicable nodes. |
| `ReviewDueCount` | **NEW** | Server Component, dashboard widget, shows review due count + CTA |
| `ReviewDueCountSkeleton` | **NEW** | Skeleton loading state for ReviewDueCount |
| Session summary (existing) | **MODIFIED** | Add "calibrated to your level" line for IRT-adaptive sessions. Show next review dates for review sessions. |

### 6.4 What NOT to Build

| Tempting Feature | Why Not |
|---|---|
| Separate "Adaptive Quiz" UI | IRT is a backend swap. The existing quiz UI is the UI. Adding a separate adaptive mode would confuse students with too many options (already 7 modes). |
| SRS Settings page | The algorithm is not user-configurable. SlateCamp decides the optimal schedule. Exposing interval/ease controls would let students sabotage their own learning. |
| Theta/IRT dashboard | Internal infrastructure. Showing theta to students adds cognitive load without improving outcomes. The Readiness Score is the student-facing ability indicator. |
| "Review deck builder" | Students don't curate their review deck. The algorithm curates it. Manual deck building defeats the purpose of spaced repetition. |
| Difficulty preference slider | "I want harder questions" is not how IRT works. IRT gives you the right difficulty, not the difficulty you want. |


---

## 7. SPRINT BACKLOG — ORDERED BY DEPENDENCY

### Sprint 1: Foundation (Week 1)
**Goal:** SRS reconnected, IRT schema in place, cold-start defaults applied.

| # | Task | File(s) | Effort | Dependency |
|---|---|---|---|---|
| 1.1 | **Reconnect SRS to testing flow** | `src/lib/actions/testing.ts` | 1 hour | None — highest impact task |
| 1.2 | Run migration: `20260326_add_irt_columns_to_questions.sql` | Supabase CLI | 15 min | None |
| 1.3 | Run migration: `20260326_create_user_theta.sql` | Supabase CLI | 15 min | None |
| 1.4 | Run migration: `20260326_create_user_srs_cards.sql` | Supabase CLI | 15 min | None |
| 1.5 | Backfill IRT defaults from `difficulty_label` | SQL one-time | 15 min | 1.2 |
| 1.6 | Generate updated TypeScript types | `npx supabase gen types typescript` | 5 min | 1.2, 1.3, 1.4 |
| 1.7 | Write tests for `select_next_item` RPC | Test file | 2 hours | 1.2, 1.3 |
| 1.8 | Write tests for `update_theta` RPC | Test file | 1 hour | 1.3 |

**Sprint 1 exit criteria:** SRS updates fire on every testing session. IRT tables exist with cold-start defaults. All new RPCs have tests.

### Sprint 2: IRT Adaptive Selection (Week 2)
**Goal:** Sessions use IRT for question selection in adaptive modes.

| # | Task | File(s) | Effort | Dependency |
|---|---|---|---|---|
| 2.1 | Deploy `select_next_item` RPC to production | Supabase CLI | 30 min | 1.2, 1.3 |
| 2.2 | Deploy `update_theta` RPC to production | Supabase CLI | 30 min | 1.3 |
| 2.3 | Modify `saveTestingInteraction()` to call `update_theta` | `src/lib/actions/testing.ts` | 1 hour | 2.2 |
| 2.4 | Modify session creation to use `select_next_item` for first question | `src/lib/actions/testing.ts` | 2 hours | 2.1 |
| 2.5 | Modify `saveTestingInteraction()` to call `select_next_item` for next question | `src/lib/actions/testing.ts` | 1 hour | 2.1, 2.3 |
| 2.6 | Modify `useSessionStore` for streaming question delivery | `src/stores/useSessionStore.ts` | 2 hours | 2.4, 2.5 |
| 2.7 | Add fallback to random selection when IRT fails | `src/lib/actions/testing.ts` | 30 min | 2.4 |

**Sprint 2 exit criteria:** Camp and Storm mode sessions use IRT adaptive selection. Theta updates after every answer. Fallback to random selection works when IRT RPC fails.

### Sprint 3: SRS Review Flow (Week 3)
**Goal:** Students can start review sessions for due nodes.

| # | Task | File(s) | Effort | Dependency |
|---|---|---|---|---|
| 3.1 | Deploy `get_review_deck` and `get_review_due_count` RPCs | Supabase CLI | 30 min | 1.4 |
| 3.2 | Create `src/lib/queries/srs.ts` | New file | 1 hour | 3.1 |
| 3.3 | Create `src/lib/actions/srs.ts` | New file | 2 hours | 3.1, 3.2 |
| 3.4 | Backfill `user_srs_cards` from existing `user_node_mastery` data | SQL one-time | 1 hour | 1.4 |
| 3.5 | Add `mode: 'review'` to session mode enum/type | Types + DB | 30 min | None |
| 3.6 | Write tests for review session actions | Test file | 2 hours | 3.3 |

**Sprint 3 exit criteria:** Review sessions can be created from due SRS nodes. SRS cards backfilled from existing mastery data.

### Sprint 4: Frontend Integration (Week 4)
**Goal:** Dashboard shows review widget, quiz sessions use adaptive delivery.

| # | Task | File(s) | Effort | Dependency |
|---|---|---|---|---|
| 4.1 | Build `<ReviewDueCount />` component | `src/components/dashboard/ReviewDueCount.tsx` | 1 hour | 3.2 |
| 4.2 | Build `<ReviewDueCountSkeleton />` | `src/components/dashboard/skeletons/` | 15 min | 4.1 |
| 4.3 | Add ReviewDueCount to dashboard page with Suspense | `src/app/dashboard/page.tsx` | 30 min | 4.1, 4.2 |
| 4.4 | Modify QuizSession for streaming question delivery | `src/components/dashboard/QuizRenderer.tsx` | 3 hours | 2.6 |
| 4.5 | Add SRS due indicators to TaxonomyHeatmap | Heatmap component | 1 hour | 3.2 |
| 4.6 | Add "calibrated to your level" line to session summary | Results component | 15 min | 2.4 |
| 4.7 | Add review session summary with next review dates | Results component | 1 hour | 3.3 |

**Sprint 4 exit criteria:** Dashboard shows review due count. Students can complete full adaptive + review session flows end-to-end.

### Sprint 5: Historical Calibration (Week 5-6)
**Goal:** Bootstrap IRT parameters from existing data.

| # | Task | File(s) | Effort | Dependency |
|---|---|---|---|---|
| 5.1 | Deploy `calibrate_irt_batch()` function | Supabase CLI | 30 min | 1.2 |
| 5.2 | Run batch calibration on all questions with 30+ responses | SQL | 1 hour | 5.1 |
| 5.3 | Bootstrap student theta from historical interactions | SQL script | 2 hours | 5.2, 1.3 |
| 5.4 | Validate calibration: compare IRT difficulty vs. actual p(correct) | Analysis | 2 hours | 5.2 |
| 5.5 | Set up scheduled recalibration (monthly cron) | Vercel cron | 1 hour | 5.2 |

**Sprint 5 exit criteria:** All questions with sufficient data have calibrated IRT parameters. Student theta bootstrapped. Monthly recalibration scheduled.

### Sprint 6: Monitoring & Validation (Week 7)
**Goal:** Confirm engines are working and improving outcomes.

| # | Task | File(s) | Effort | Dependency |
|---|---|---|---|---|
| 6.1 | Add analytics events for IRT session starts | `src/lib/actions/testing.ts` | 30 min | 2.4 |
| 6.2 | Add analytics events for SRS review completions | `src/lib/actions/srs.ts` | 30 min | 3.3 |
| 6.3 | Build CEO dashboard card: IRT adoption rate | CEO analytics | 2 hours | 6.1 |
| 6.4 | Build CEO dashboard card: SRS review compliance rate | CEO analytics | 2 hours | 6.2 |
| 6.5 | A/B test framework: adaptive vs. random selection | Feature flag | 3 hours | 2.4 |
| 6.6 | Measure: session completion rates (adaptive vs. random) | Analytics query | 1 hour | 6.5 |
| 6.7 | Measure: 30-day retention (adaptive vs. random) | Analytics query | 1 hour | 6.5 |

**Sprint 6 exit criteria:** Monitoring dashboards live. A/B test running. Data collection for outcome validation.


---

## 8. RISK REGISTER

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| IRT RPC exceeds 20ms latency with large question pools | Medium | High — student waits for next question | Index on `(topic_id, irt_difficulty, irt_discrimination)`. Pre-filter by topic. Monitor with `pg_stat_statements`. Fallback to TypeScript implementation if needed. |
| Newton-Raphson theta diverges on edge cases | Low | Medium — theta jumps to ±4 boundary | Clamped to [-4, 4]. Step size clamped to [-1, 1]. Bayesian prior for first 10 responses. |
| Batch calibration produces unreasonable parameters | Medium | Medium — questions appear too easy/hard | Validate: check that calibrated difficulty correlates with actual p(correct). Clamp parameters to reasonable ranges. Admin dashboard flag for outlier items. |
| SRS card backfill creates too many due reviews on day 1 | High | Medium — student opens dashboard, sees "87 topics to review" | Stagger: set `next_review_at` to random dates over the next 7 days during backfill, instead of all at `now()`. |
| QuizSession streaming delivery breaks offline fallback | Medium | High — current localStorage auto-save assumes all questions are loaded | Keep localStorage backup of current question. Add reconnection logic that fetches next question from server on restore. |
| IRT parameters change the feel of Camp Mode | Medium | Low — students might notice questions feel different | A/B test first. Monitor session abandonment rates. If abandonment increases, adjust target P(correct) from 0.75 to 0.80 (easier). |
| Solo developer bottleneck on 7-sprint plan | High | Medium — plan stretches beyond 7 weeks | Sprints 1 and 3 are independent and can be parallelized if capacity allows. Sprint 1.1 (SRS reconnect) alone delivers 60% of the plan's value in 1 hour. |


---

## 9. IP PROTECTION NOTES

### What to keep server-side only:
- IRT `select_next_item` RPC — never expose the item selection algorithm to the client
- `update_theta` RPC — theta computation is proprietary
- `calibrate_irt_batch()` — calibration methodology is core IP
- SM-2 scheduling parameters (ease factor, interval calculation) — the scheduling logic stays in Server Actions
- Quality derivation function (`deriveQualityRating`) — how we map interaction signals to SM-2 quality is proprietary

### What to trademark:
- "Readiness Score" — the student-facing name for the calibrated ability assessment
- "Camp Trail" — the structured study path system
- "Blindspot Protocol" — the weak-node targeting system

### What to document as trade secrets:
- The anti-inflation 6-vector Readiness Score computation
- The IRT ↔ SRS ↔ Blindspot integration architecture (the triangle)
- The quality derivation algorithm (correctness + time + confidence → SM-2 quality)
- The cold-start warm-up sequence for new students

### What NOT to patent (trade secret is better):
- The IRT and SM-2 algorithms themselves are published mathematics. You cannot patent them.
- The specific integration architecture (how they connect to each other and to the mastery loop) is the trade secret. This is the part a competitor cannot reverse-engineer from the UI.
- Keep this document itself confidential. It is the blueprint for SlateCamp's competitive moat.


---

*Document generated 2026-03-25. All schema, RPCs, and code patterns are designed for SlateCamp's production stack (Next.js 16, React 19, Supabase PostgreSQL, Zustand 5). All SQL is migration-ready and follows SlateCamp naming conventions.*
