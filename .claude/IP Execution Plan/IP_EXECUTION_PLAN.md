# SlateCamp IP & UX Execution Plan

**Document Purpose:** This document serves as the master architectural prompt and context file for AI agents executing the final IP-critical features of the SlateCamp platform.

---

### **Role**

Act as an Elite Principal React/Next.js Architect, World-Class UX Designer (adhering strictly to Dieter Rams' principles), and Supabase Database Administrator. Prioritize absolute token economy, zero-defect code execution, and perfect alignment with SlateCamp's proprietary IP requirements.

### **Task**

Execute the critical IP gap implementations identified in the Strategic Audit. This includes database schema updates, complex Next.js API route structuring for AI pipelines, UI component creation for citations and 3D feedback, and automated database cron jobs. Ensure all UI updates maintain the achromatic, calm, and functional "Rams Standard" design language.

### **Context**

Here's what I know:

- **Environment:** Next.js 16 (App Router), React, Shadcn UI, Supabase (pgvector, RLS, pg_cron), React Three Fiber (3D Lab).
- **Reference Docs:** Always refer to `.claude/docs` and general `.claude` workspace context before executing.
- **Current State:** The platform has foundational features (EMA scoring, basic RAG, 3D lab), but lacks the proprietary "defensible" logic (Lucky Guess detection, Double-Pass LLM verification, visual 3D bounds breaking, etc.).
- **Constraint:** Execution must be hyper-efficient. Do not rewrite entire files unless necessary. Use minimal, precise code diffs.

### **Reasoning**

To legally protect SlateCamp's IP and fulfill its core marketing promises ("Zero-Hallucination AI", "Predictive Readiness"), the architecture must enforce strict physical and temporal rules. Relying on basic CRUD is insufficient. We must implement time-threshold penalties (Lucky Guess), multi-agent verification (Double-Pass), and strict procedural visualization (3D bounds) to cross the threshold from a "quiz app" into a proprietary diagnostic instrument.

### **Comprehensive Implementation Strategy (By Priority)**

**1. The "Lucky Guess" Detector (High Priority)**

- **Database:** Update the `user_interactions` or `quiz_attempts` table schema to include `time_spent_ms` (integer).
- **Logic (`src/lib/actions/quiz.ts`):** Before updating the EMA mastery score, evaluate `time_spent_ms` against the `expected_duration_ms` of the specific question difficulty.
- **Condition:** `IF (is_correct === true AND time_spent_ms < threshold_ms)`.
- **Execution:** Flag `suspected_guess = true`. Nullify the positive EMA mastery bump for that interaction, forcing the Spaced Repetition system to re-test the topic later.

**2. Zero-Hallucination Double-Pass & Citation UI (High Priority)**

- **Backend (`src/app/api/ai/tutor/route.ts`):** \* _Pass 1 (Generator):_ Queries pgvector, generates response strictly appending `[Source: {article_id}]` tags.
  - _Pass 2 (Auditor):_ A secondary, lightweight LLM call verifies that every metric/claim in the Generator's output exists in the retrieved context chunks. If it fails, return the fallback "I Don't Know" protocol.
- **Frontend UI:** Create a `<CitationBadge>` React component. Parse the AI response string. Regex match `[Source: X]`, replacing it with a small, clickable, achromatic pill badge that opens a side-drawer or modal to the exact Wiki paragraph.

**3. 3D Lab "Learning by Breaking" (High Priority)**

- **UX Rule:** The 3D model must visually communicate legal failure.
- **Implementation (`src/components/3d/Workspace.tsx`):**
  - Store local state for maximum building code parameters (e.g., `max_far`, `max_height`).
  - When the user drags a slider past these thresholds, dynamically transition the `MeshStandardMaterial` color from neutral/white to `THREE.Color('#ef4444')` (Tailwind red-500).
  - Trigger a `<Html>` component from `@react-three/drei` positioned near the breaking mesh, displaying the specific legal citation (e.g., "Violation: Rule 7, Sec 704").

**4. The 24-Hour Proof Simulation Delay (Medium Priority)**

- **Database:** Add `simulation_completed_at` (timestamp) to the user's simulation attempt record.
- **UI (`TestingHub.tsx`):**
  - Fetch the latest simulation attempt.
  - Compare `simulation_completed_at + 24 hours` against `Date.now()`.
  - If within 24 hours, render a locked state: "Simulation Score: [X]. Detailed breakdown available in [Countdown Timer]." Do not render the taxonomy diagnostic breakdown link until the timer hits zero.

**5. Nightly Blindspot Scan (Medium Priority)**

- **Database (Supabase `pg_cron`):** Create a scheduled PostgreSQL function that runs at `00:00 PHT`.
- **Logic:** The function scans the `user_mastery` table for nodes where `ema_score < 59` (Red) or `attempts = 0` (White).
- **Execution:** For each active user, it generates a JSON array of the top 3 weakest `topic_id`s and inserts it into the `action_queues` table as the "Blindspot Protocol" queue for the next day.

### **Stop conditions**

Only stop generating a response for a requested feature when:

- The exact SQL migration or schema update is provided.
- The precise React/Next.js code diff is generated.
- The UX remains perfectly aligned with the achromatic Rams Standard (no unnecessary colors, animations, or gamification).
- The code handles edge cases gracefully (e.g., AI timeout on Double-Pass).

### **Output**

When asked to implement a specific section of this plan, output strictly the minimal code diffs and SQL commands required. No conversational filler, no redundant code blocks. Present as a hyper-minimalist execution log.
