# 2026-04-06: Comprehensive Testing Feature Audit & Implementation Plan (Updated)

**Author:** Gemini CLI (Senior Frontend Engineer)  
**Status:** PROPOSED (Pivoted to Hero Configurator)  
**Related Tasks:** testing-feature-audit-consolidation

---

## Executive Summary

This plan outlines the consolidation and UX pivot of SlateCamp's testing feature suite. We are moving from static testing modes to a dynamic **"Hero Configurator"** UI and an **"Intelligent Question Routing"** backend algorithm. This strategy reduces decision fatigue, enhances pedagogical precision, and efficiently utilizes our 7,000-question bank.

---

## 1. UX/UI Audit: The Dynamic Testing Hub

The testing ecosystem is being simplified into a single, high-intent entry point on the `/dashboard/testing` route.

### 1.1 The "Hero Configurator" Component (Workstream E)

Instead of choosing a mode first, users build their session dynamically through a tactile interface.

#### UI Features:
- **Draggable Subject Tokens:** Core subjects (Building Tech, Structural Design, etc.) represented as pills that can be dragged into a "Canvas" or "Drop Zone".
- **Frictionless Defaults:** 
    - Question Count: Default **50** (Slider range: 10–100).
    - Timer: Default **Off** (Options: Off, 30m, 1h, 2h).
- **Bulk Actions:** "Add All Subjects" and "Clear All" utility buttons for rapid configuration.
- **"Slide to Start Testing Session":** A custom slider component that replaces the standard "Start" button.
    - **Locked State:** Slider is disabled and visually muted until $\ge 1$ subject is added.
    - **Intentional Interaction:** If clicked/slid while locked, a tooltip points to the subject zone: *"Please select at least one subject to begin."*

---

## 2. Backend Strategy: Intelligent Question Routing

We are replacing `ORDER BY RANDOM()` with a pedagogical routing algorithm to ensure users encounter a balanced mix of content.

### 2.1 The 60/30/10 Algorithm (Workstream D)

When a session is initialized, the backend constructs a question pool based on the following distribution:

1.  **The Discovery Quota (60%):** Questions the user has **never seen**.
    - *Query:* `questions` where no entry exists in `user_interactions` for the `user_id`.
2.  **The Remediation Quota (30%):** Questions previously answered **incorrectly**.
    - *Query:* `questions` where the most recent `user_interactions` entry for the user has `is_correct = false`.
3.  **The Spaced Repetition Quota (10%):** Questions previously **mastered** but not seen in 14+ days.
    - *Query:* `questions` where `is_correct = true` and `interaction_timestamp < now() - INTERVAL '14 days'`.

### 2.2 Architecture & Caching
- **Pre-warming Queues:** During the login phase (or as a background job), the system pre-calculates the "Unseen" and "Remediation" IDs for the user's primary discipline.
- **Next.js Integration:** Use React Server Components for the initial state of the Hero Card and Server Actions for the session initialization (`startSession`).

---

## 3. Specialized Entities: Requirements & UI/UX

While the standard modes are consolidated, two modes remain functionally unique and will use the same routing engine but with specific overrides.

### 3.1 Full Exam Simulation (`fullexam`)
- **Config Overrides:** Locked at 200 questions, strict 4h countdown timer.
- **Results Logic:** 24h delay enforced via `completed_at` timestamp.
- **Proctored UI:** Disables all non-essential navigation and feedback.

### 3.2 Design Endurance Training (`extended`)
- **Stamina Analysis:** Real-time accuracy-by-block tracking via `src/lib/quiz/stamina-analysis.ts`.
- **UI Nudges:** Fatigue alerts when accuracy drops below 15% from the session baseline.

---

## 4. Database Migration & Compatibility (Workstream C)

### 4.1 Required SQL Migration (Supabase)
To support the 60/30/10 algorithm without performance bottlenecks, we will use a real-time, event-driven approach. A dedicated `user_question_states` table will act as a cache, updated automatically via PostgreSQL triggers whenever a user interacts with a question.

```sql
-- 1. Ensure indexes for routing performance on raw interactions
CREATE INDEX IF NOT EXISTS idx_user_interactions_routing 
ON user_interactions (user_id, question_id, is_correct, interaction_timestamp);

-- 2. Create the real-time state cache table
CREATE TABLE IF NOT EXISTS user_question_states (
    user_id           UUID NOT NULL,
    question_id       UUID NOT NULL,
    last_seen_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_is_correct   BOOLEAN NOT NULL,
    total_attempts    INTEGER NOT NULL DEFAULT 1,
    total_time_ms     INTEGER NOT NULL DEFAULT 0,
    avg_time_ms       INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (user_id, question_id)
);

-- 3. Create a function to upsert state on every interaction
CREATE OR REPLACE FUNCTION update_user_question_state()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_question_states (
        user_id, 
        question_id, 
        last_seen_at, 
        last_is_correct, 
        total_attempts,
        total_time_ms,
        avg_time_ms
    )
    VALUES (
        NEW.user_id, 
        NEW.question_id, 
        NEW.interaction_timestamp, 
        NEW.is_correct, 
        1,
        COALESCE(NEW.time_spent_ms, 0),
        COALESCE(NEW.time_spent_ms, 0)
    )
    ON CONFLICT (user_id, question_id) DO UPDATE SET
        last_seen_at = EXCLUDED.last_seen_at,
        last_is_correct = EXCLUDED.last_is_correct,
        total_attempts = user_question_states.total_attempts + 1,
        total_time_ms = user_question_states.total_time_ms + COALESCE(NEW.time_spent_ms, 0),
        avg_time_ms = (user_question_states.total_time_ms + COALESCE(NEW.time_spent_ms, 0)) / (user_question_states.total_attempts + 1);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Attach the trigger to the user_interactions table
DROP TRIGGER IF EXISTS trg_update_user_question_state ON user_interactions;
CREATE TRIGGER trg_update_user_question_state
AFTER INSERT ON user_interactions
FOR EACH ROW
EXECUTE FUNCTION update_user_question_state();
```

### 4.2 Codebase Alignment (Technical Observation)
With the introduction of real-time triggers, the manual refresh of the question state is no longer required in the application layer.

- **Action:** Remove the redundant RPC call `void supabase.rpc('refresh_user_question_states')` from `src/lib/actions/quiz-v2/end-session.ts`. 
- **Benefit:** This reduces the number of round-trips to the database during session finalization and prevents potential race conditions between the application's manual refresh and the database's automatic trigger.

---

## 5. Implementation Plan (Pivoted)

### Phase 1: Routing Engine & Optimization (Days 1-2)
1. Apply the optimized indexes and real-time `user_question_states` table/trigger to the database.
2. Refactor `startSession` action to implement the 60/30/10 selection logic using the cache table.
3. Verify the algorithm with the 7,000-question bank using performance benchmarks.

### Phase 2: Hero Configurator UI (Days 3-4)
1. Implement the `HeroConfigurator` component with `dnd-kit`.
2. Build the `SlideToStart` component with `framer-motion`.
3. Integrate sliders for question count and timer defaults.

### Phase 3: Consolidation & Specialized Modes (Day 5)
1. Update `StandardQuizShell` to consume the new dynamic config.
2. Ensure `SimulationShell` and `EnduranceShell` correctly override the hero defaults.

### Phase 4: Verification (Day 6)
1. End-to-end testing of the "Slide to Start" flow.
2. Verify "Unseen" vs "Remediation" distribution in generated sessions.
3. Performance audit of the trigger-based state updates and routing query speed.
