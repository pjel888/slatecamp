# Pending IP & Architectural Features

**Date:** 2026-04-04
**Source Audit:** `.ai/IP Execution Plan/IP_EXECUTION_PLAN.md`, `.ai/GLOBAL-CODEBASE-AUDIT-REPORT.md`, `.ai/docs/PLATFORM_OVERVIEW.md`

Based on a holistic review of the legacy `.ai/` documentation compared to the current state of the application, SlateCamp has successfully implemented its foundational pedagogical engine (IRT 2PL, SM-2, Readiness Score). However, the final tier of proprietary "IP-defining" features remains unimplemented in the codebase.

These features represent the transition from a standard study app to a defensible diagnostic instrument.

---

## 1. The "Lucky Guess" Detector (High Priority)
**Concept:** A time-difficulty correlation system that penalizes students who answer high-difficulty questions suspiciously fast, as this indicates a guess rather than true mastery.

**Current State:** Unimplemented. `time_spent_ms` is recorded in `user_interactions`, but not utilized to discount mastery scores.

**Implementation Plan:**
- **Location:** `src/lib/actions/quiz-v2/submit-answer.ts`
- **Logic:** Before updating the EMA mastery score, evaluate `time_spent_ms`.
- **Condition:** `IF (is_correct === true AND time_spent_ms < threshold_ms AND difficulty_rating >= 0.7)`
- **Action:** Flag as `suspected_guess = true`. Apply a 50% credit weight to that interaction's EMA contribution, forcing the Spaced Repetition system to re-test the topic later.

## 2. Zero-Hallucination Double-Pass & Citation UI (High Priority)
**Concept:** A two-LLM verification pipeline for the AI Tutor to ensure it never hallucinates building codes or legal citations.

**Current State:** Unimplemented. The AI Tutor uses a single-pass RAG pipeline.

**Implementation Plan:**
- **Location:** `src/app/api/ai/tutor/route.ts`
- **Logic:**
  - *Pass 1 (Generator):* Queries pgvector, generates response strictly appending `[Source: {article_id}]` tags.
  - *Pass 2 (Auditor):* A secondary, lightweight LLM call verifies that every metric/claim exists in the retrieved context chunks. If it fails, fallback to "I don't know."
- **UI:** A `<CitationBadge>` component that regex-matches `[Source: X]` and renders a clickable Camp Cobalt pill linking to the exact Wiki paragraph.

## 3. 3D Lab "Learning by Breaking" (High Priority)
**Concept:** The 3D models must visually communicate legal failure when a student drags a parametric slider beyond building code limits.

**Current State:** 3D models and sliders exist via React Three Fiber, but visual compliance feedback is unimplemented.

**Implementation Plan:**
- **Location:** `src/components/3d/Workspace.tsx` and `useLabStore.ts`
- **Logic:** Store local state for maximum building code parameters (e.g., `max_far`, `max_height`).
- **Action:** When a slider exceeds a threshold, dynamically transition the `MeshStandardMaterial` color to `THREE.Color('#D64545')` (Campfire Warm Red). Trigger an `<Html>` Drei component displaying the specific legal citation.

## 4. Full Exam Simulation 24-Hour Delay (Medium Priority)
**Concept:** "Proof Simulation™" requires a 24-hour cooling-off period before results are revealed to mirror actual exam anxiety and prevent immediate rationalization of wrong answers.

**Current State:** Unimplemented. Results are delivered immediately across all modes.

**Implementation Plan:**
- **Database:** Add `simulation_completed_at` to the user's simulation attempt record.
- **Location:** `src/components/testing/hub/ReviewHub.tsx`
- **Logic:** If `Date.now() < simulation_completed_at + 24 hours`, render a locked state countdown timer. Do not render the diagnostic breakdown link until the timer hits zero.
- **Gate:** Proof Simulation only unlocks when `Readiness Score >= 65%`.

## 5. Nightly Focus Review Scan / Blindspot Protocol (Medium Priority)
**Concept:** A nightly cron job that hunts for a student's weakest or unexplored taxonomy nodes and auto-generates a targeted quiz queue for the next day.

**Current State:** `blindspot_queues` table exists, but the nightly generation engine is unverified/unimplemented.

**Implementation Plan:**
- **Location:** Supabase `pg_cron` or a Vercel Cron hitting `/api/cron/blindspot-scan`
- **Logic:** Scan `user_node_mastery` for nodes where `current_mastery_weight < 0.59` (Red) or `total_attempts = 0`.
- **Action:** Generate a JSON array of the top 3 weakest `topic_id`s and insert it into the queue table. Display to students as "Focus Review" in the UI.

---

## Technical Debt to Address Before Launch

While auditing the legacy `.ai/` files, several critical technical debt items were flagged in `GLOBAL-CODEBASE-AUDIT-REPORT.md` that require verification:

1. **Security Headers:** Verify `next.config.ts` includes `X-Frame-Options`, `Content-Security-Policy`, etc.
2. **XSS Vulnerabilities:** Verify `DOMPurify` is used around `dangerouslySetInnerHTML` in `src/components/shared/question-card.tsx`.
3. **Payment Button Wiring:** Ensure the Stripe/PayRex buttons on the `/dashboard/upgrade` page are actually hooked up to the checkout API route.
4. **TypeScript Strict Mode:** The project currently runs with `strict: false`. Moving to `strict: true` is highly recommended for long-term stability.
