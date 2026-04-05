# SlateCamp IP & UX Execution Plan

**Document Purpose:** This document serves as the master architectural prompt and context file for AI agents executing the final IP-critical features of the SlateCamp platform.

---

### **Role**

Act as an Elite Principal React/Next.js Architect, World-Class UX Designer (adhering strictly to the **Campfire** design language), and Supabase Database Administrator. Prioritize absolute token economy, zero-defect code execution, and perfect alignment with SlateCamp's proprietary IP requirements.

### **Task**

Execute the critical IP gap implementations identified in the Strategic Audit. This includes database schema updates, complex Next.js API route structuring for AI pipelines, UI component creation for citations and 3D feedback, and automated database cron jobs. Ensure all UI updates maintain the warm, functional **Campfire** design language — clean, purposeful, no gamification.

### **Context**

Here's what I know:

- **Environment:** Next.js 16 (App Router), React 19, shadcn/ui, Supabase (pgvector, RLS, pg_cron), React Three Fiber (3D Lab).
- **Package Manager:** Bun (`bun.lock`)
- **Reference Docs:** Always refer to `.claude/docs` and general `.claude` workspace context before executing.
- **Current State (March 2026):** The platform has implemented foundational features:
  - [x] IRT 2-PL model (`src/lib/srs/irt.ts`)
  - [x] SM-2 spaced repetition (`src/lib/srs/sm2.ts`)
  - [x] EMA mastery scoring (`src/lib/actions/mastery-actions.ts`)
  - [x] Readiness Score update action (`src/lib/actions/readiness-score-update.ts`)
  - [x] Quiz Engine v2: `QuizShell`, `OptionsColumn`, `FeedbackPanel`, `QuizFooter`
  - [x] Setup flow: `SetupFlow`, `IntroSlide1`, `IntroSlide2`
  - [x] Results: `ResultsDashboard`, `ResultsCTAs`, `ReviewCard`, `ReviewCardList`, `ReviewFilterBar`
  - [x] Testing hub: `ReviewHub`, `SessionsTable`
  - [x] All server actions: `start-session`, `submit-answer`, `end-session`, `get-review-data`
  - [x] Analytics components: `PacingInsights`, `PacingQuadrant`, `ReadinessTrajectory`, `StaminaCurve`, `ChartCoachingAnnotation`
  - [x] Notifications system: `src/components/notifications/`, `src/lib/actions/notifications.ts`
  - [ ] Lucky Guess detection logic in submit-answer
  - [ ] Double-Pass LLM verification pipeline
  - [ ] 3D bounds breaking with Campfire Warm Red
  - [ ] Full Exam Simulation 24-hour delay
  - [ ] Nightly Focus Review scan (pg_cron)
- **Constraint:** Execution must be hyper-efficient. Do not rewrite entire files unless necessary. Use minimal, precise code diffs.

### **UI Naming Note (Critical)**

IP/trademark names are used in internal docs and legal filings. Student-facing UI must use these labels:

| IP Name             | UI Label             |
| ------------------- | -------------------- |
| Blindspot Protocol™ | Focus Review         |
| Endurance Cycle™    | Extended Practice    |
| Proof Simulation™   | Full Exam Simulation |

Never display the IP/trademark names in the student-facing UI.

### **Reasoning**

To legally protect SlateCamp's IP and fulfill its core marketing promises ("Zero-Hallucination AI", "Predictive Readiness"), the architecture must enforce strict physical and temporal rules. Relying on basic CRUD is insufficient. We must implement time-threshold penalties (Lucky Guess), multi-agent verification (Double-Pass), and strict procedural visualization (3D bounds) to cross the threshold from a "quiz app" into a proprietary diagnostic instrument.

### **Comprehensive Implementation Strategy (By Priority)**

**1. The "Lucky Guess" Detector (High Priority)**

- **Database:** The `user_interactions` table already includes `time_spent_ms` (integer). No migration needed.
- **Logic (`src/lib/actions/quiz-v2/submit-answer.ts`):** Before updating the EMA mastery score, evaluate `time_spent_ms` against the expected duration for the question's `difficulty_rating`.
- **Condition:** `IF (is_correct === true AND time_spent_ms < threshold_ms AND difficulty_rating >= 0.7)`.
- **Execution:** Flag `suspected_guess = true`. Apply 50% credit weight to that interaction's EMA contribution, forcing the Spaced Repetition system to re-test the topic later.

**2. Zero-Hallucination Double-Pass & Citation UI (High Priority)**

- **Backend (`src/app/api/ai/tutor/route.ts`):**
  - _Pass 1 (Generator):_ Queries pgvector, generates response strictly appending `[Source: {article_id}]` tags.
  - _Pass 2 (Auditor):_ A secondary, lightweight LLM call verifies that every metric/claim in the Generator's output exists in the retrieved context chunks. If it fails, return the fallback "I don't know" protocol.
- **Frontend UI:** Create a `<CitationBadge>` React component. Parse the AI response string. Regex match `[Source: X]`, replacing it with a small, clickable Camp Cobalt pill badge (`bg-[#EEF2FC] text-[#1B3FC4] rounded-full`) that opens a side-drawer to the exact Wiki paragraph.

**3. 3D Lab "Learning by Breaking" (High Priority)**

- **UX Rule:** The 3D model must visually communicate legal failure.
- **Implementation (`src/components/3d/Workspace.tsx`):**
  - Store local state for maximum building code parameters (e.g., `max_far`, `max_height`).
  - When the user drags a slider past these thresholds, dynamically transition the `MeshStandardMaterial` color from neutral/white to `THREE.Color('#D64545')` (Campfire Warm Red `--warm-red`).
  - Trigger a `<Html>` component from `@react-three/drei` positioned near the breaking mesh, displaying the specific legal citation (e.g., "Violation: Rule 7, Sec 704").

**4. The 24-Hour Full Exam Simulation Delay (Medium Priority)**

- **Database:** Add `simulation_completed_at` (timestamp) to the user's simulation attempt record.
- **UI (`src/components/testing/hub/ReviewHub.tsx`):**
  - Fetch the latest simulation attempt.
  - Compare `simulation_completed_at + 24 hours` against `Date.now()`.
  - If within 24 hours, render a locked state: "Simulation Score: [X]. Detailed breakdown available in [Countdown Timer]." Do not render the taxonomy diagnostic breakdown link until the timer hits zero.
- **Gate condition:** Full Exam Simulation is only unlocked when the student's **Readiness Score ≥ 65%**. Below that, the button is grayed out with: _"Unlock Full Exam Simulation when your Readiness Score reaches 65%."_

**5. Nightly Focus Review Scan (Medium Priority)**

- **Database (Supabase `pg_cron`):** Create a scheduled PostgreSQL function that runs at `00:00 PHT`.
- **Logic:** The function scans the `user_node_mastery` table for nodes where `current_mastery_weight < 0.59` (Red) or `total_attempts = 0` (Unexplored).
- **Execution:** For each active user, generates a JSON array of the top 3 weakest `topic_id`s and inserts it into a queue table as the Focus Review queue for the next day.
- **UI label:** This is displayed to students as **"Focus Review"** — never "Blindspot Protocol" in the student UI.

### **SlateCamp Design Constraints**

All new UI must adhere to the SlateCamp design system (see `SlateCamp Design System.md`):

- **Primary color:** Camp Cobalt `#1B3FC4` (`--camp-cobalt`)
- **Success:** Emerald `#2D9F6F` (`--emerald`)
- **Error/violation:** Warm Red `#D64545` (`--warm-red`)
- **Warning:** Amber `#D4951A` (`--amber`)
- **Backgrounds:** Surface Light `#F8F7F5` (warm white — NOT Zinc-100)
- **Radii:** `rounded-sm` (6px) buttons, `rounded-md` (8px) cards, `rounded-lg` (12px) modals
- **Shadows:** `shadow-none` at rest, `shadow-sm` on hover, `shadow-lg` on modals
- **No gamification:** Zero confetti, badges, streaks, or leaderboards
- **No `rounded-xl` or larger** on standard elements

### **Stop conditions**

Only stop generating a response for a requested feature when:

- The exact SQL migration or schema update is provided.
- The precise React/Next.js code diff is generated.
- The UX remains perfectly aligned with the Campfire design language (no unnecessary colors, animations, or gamification).
- The code handles edge cases gracefully (e.g., AI timeout on Double-Pass).

### **Output**

When asked to implement a specific section of this plan, output strictly the minimal code diffs and SQL commands required. No conversational filler, no redundant code blocks. Present as a hyper-minimalist execution log.
