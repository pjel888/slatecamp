# Technical & Business Blueprint: Project Cerebro (SlateCamp)

**Role:** Lead Technical Due Diligence Auditor / Principal Next.js 16 Architect  
**Status:** **[RESTRICTED IP / SOURCE OF TRUTH]**  

---

## 1. Business Overview & Value Proposition

**SlateCamp (Project Cerebro)** is a proprietary, closed-loop diagnostic instrument disguised as a high-fidelity educational SaaS platform. It is engineered for high-stakes professional certification and board exam preparation. 

### Core Loop: Assess, Diagnose, Remediate
The platform discards traditional "passive memorization" in favor of cognitive stratification.
1. **Assess:** Users engage in heavily monitored, adaptive quiz sessions (`user_interactions`) where both correctness and latency are measured.
2. **Diagnose:** The platform calculates a granular `current_mastery_weight` across a 6-level taxonomy tree using Item Response Theory (IRT) and Exponential Moving Averages (EMA).
3. **Remediate:** Based on these exact diagnostics, users are pushed into specialized action gateways (Blindspot Protocol, Endurance Cycle, Predictive Remediation) and guided by a Socratic AI tutor.

---

## 2. The Tech Stack

An exhaustive inventory of the application infrastructure based on the `package.json` and architectural configuration:

### Frontend & UI Layer
* **Framework:** Next.js 16.1.6 (App Router) with React 19.2 (Server Components, Server Actions).
* **Styling:** Tailwind CSS v4 (`@tailwindcss/postcss`) with custom CSS variables mapped to the "Rams Standard" aesthetic.
* **Component Library:** Shadcn UI (`radix-ui`), Headless UI (`@base-ui/react`), Lucide React.
* **Data Visualization:** Recharts (3.8.0) with custom mathematical SVG gradients.
* **3D Spatial Web:** `three.js` (0.183.2), `@react-three/fiber`, `@react-three/drei`, `camera-controls`.
* **Rich Text / CMS:** Tiptap Headless Editor (`@tiptap/react`, `@tiptap/pm`) with Katex (Math) and Markdown integration.

### Backend & Data Layer
* **Database:** Supabase (PostgreSQL 15+) heavily utilizing Row Level Security (RLS) and custom PL/pgSQL triggers (`update_updated_at_column`).
* **Extensions:** `pg_graphql`, `pg_stat_statements`, `pgcrypto`, `uuid-ossp`, `pgjwt`.
* **Authentication:** Supabase Auth (`@supabase/ssr` 0.9.0).
* **Payments:** Dual-gateway integration with Stripe (`stripe` 20.4.1) and Payrex (`payrex-node` 1.7.3).

### AI & Pipeline
* **LLM Orchestration:** Anthropic SDK (`@anthropic-ai/sdk`) for Claude Sonnet 3.5/4 logic, with OpenAI fallbacks for `text-embedding-3-small` vectorization.

---

## 3. Proprietary IP & Algorithms (Deep Dive)

The core IP of SlateCamp lies in its data ingestion and mathematical modeling.

### A. The Readiness Score (EMA + IRT Calibration)
* **Mechanics:** The global Readiness Score is a composite metric pulled from `user_global_stats.global_readiness_score`. It is calculated dynamically across four dimensions:
  1. **Accuracy (40% weight):** Rolling 30-day correctness.
  2. **Coverage (30% weight):** Distinct questions answered relative to the total question pool.
  3. **Recency (20% weight):** Penalty logic drops score by 10% per day away from the platform.
  4. **Weak Area (10% weight):** Percentage of nodes where `current_mastery_weight < 0.6`.
* **IRT (Item Response Theory):** The 2-Parameter Logistic (2PL) model (found in `src/lib/srs/irt.ts`) computes the probability of a correct answer: `P = 1 / (1 + exp(-a * (θ - b)))`. Questions are dynamically selected to keep the user in the "Goldilocks Zone" ($P \approx 0.75$).

### B. The Lucky Guess Detector & EMA Mastery
* **Mechanics:** Located in `src/lib/actions/quiz.ts` (`recordMastery`), the system utilizes Exponential Moving Averages (EMA) to smooth mastery scores.
* **Lucky Guess Invalidation:** A user interaction is flagged as a `suspected_guess` if they answer correctly but their `time_spent_ms` is impossibly fast based on the question's difficulty (`speedThreshold = 3000 + (difficulty * 5000)`). If flagged, the score multiplier becomes `0.0`, entirely nullifying the mastery bump.
* **Mode Multipliers:** The EMA `alpha` shifts based on the cognitive load of the test mode:
  * `proof_sim` (Simulation): $\alpha = 0.6$ (High impact)
  * `storm` (Rapid Fire): $\alpha = 0.4$
  * `blindspot`: $\alpha = 0.3$
  * `camp` (Standard): $\alpha = 0.2$
  * `chill`: $\alpha = 0.1$ (Low impact)

### C. Response-Time Weighted Spaced Repetition (Modified SM-2)
* **Mechanics:** Located in `src/lib/srs/sm2.ts`, the algorithm modifies the traditional SuperMemo-2 model.
* Quality scores (1-5) are not just based on binary correctness, but heavily weighted by **Latency** and **Self-Reported Confidence**. A correct answer taking $< 5000\text{ms}$ with high confidence yields a $5$; taking $< 20000\text{ms}$ yields a $3$.

### D. Anti-Hallucination Socratic Pipeline
* **Mechanics:** The AI Tutor prompt (`src/lib/ai/prompts.ts`) is strictly engineered to *never* reveal the answer. It utilizes RAG context (uploaded study materials) and the student's `weakDomains`.
* **Guardrails:** The prompt forces the LLM to ask exactly *one* guiding question at a time. It only provides a hint (not the answer) if the student remains stuck after 3 consecutive exchanges.

---

## 4. Core Features (User & Admin)

### User Facing
1. **Testing Hub (Adaptive Modes):**
   * **Camp:** The baseline adaptive testing mode.
   * **Storm:** Rapid-fire testing under intense time pressure.
   * **Chill:** Untimed, exploratory learning.
   * **Blindspot:** Forces the user through nodes with $< 0.6$ mastery.
   * **Proof Sim:** Full-length board exam simulation (highest EMA impact).
2. **Dashboard Diagnostics:** Features a GitHub-style Activity Heatmap, macro Readiness Score, and an absolute-color-mapped Subject Mastery Radar Chart.
3. **3D Lab Sandbox:** Interactive Three.js/Fiber models with `spatial_hotspots` physically linked to taxonomy `node_id`s, allowing users to spin 3D anatomical/mechanical models and answer questions based on clicked regions.
4. **Knowledge Wiki & Notes:** A hierarchical syllabus reader seamlessly integrated with a user note-taking engine (Tiptap).

### Admin / Enterprise Facing
1. **Taxonomy CMS:** An interface to manage the 6-level taxonomy tree (`discipline > subject > topic...`).
2. **Double-Pass Question Engine:** Tools to auto-generate IRT-calibrated questions via LLM, review their distractors, and map them to the taxonomy.
3. **Audit Logging & Status Tracking:** Strict visibility toggles (`draft`, `published`, `review`) for both 3D assets and Wiki articles.

---

## 5. UX/UI Design System: "The Rams Standard"

The frontend strictly enforces a design philosophy merging Dieter Rams' industrial minimalism ("Less, but better") with Apple's Human Interface Guidelines.

* **Color Palette (Achromatic + Signal):** UI chrome relies entirely on nuanced grays (`Zinc-50` through `Zinc-900`, `Snow`, `Bone`, `Charcoal`). Vibrant colors (`Signal Red` `#ef4444`, `Signal Amber` `#f97316`, `Signal Green` `#10b981`) are reserved *exclusively* for data visualization and critical feedback.
* **Geometry:** Rigorous use of `rounded-sm` and `rounded-xl` borders (`0.75rem` base radius) with zero heavy borders. `border-zinc-200` and `shadow-none` prevent visual noise.
* **Tactility:** Instant mechanical feedback. Buttons scale to $0.98$ on active state (`:active { transform: scale(0.98); }`).
* **Data Visualization (Recharts):** Charts are stripped of excessive axes and grid lines. The Subject Mastery Radar Chart uses mathematical SVG `<radialGradient>` mappings to ensure polygons never hallucinate a "green" perimeter if the underlying score maxes out at 40%.

---

## 6. Database Schema Map

The platform's relational integrity relies on `user_id` tracking mapped against a universal `taxonomy_tree`.

### Core Flow Diagram

```text
[auth.users] (Supabase Auth)
   │
   ├──> [user_global_stats] (1:1) -- Global Readiness, Current Discipline, Streak
   │
   ├──> [quiz_sessions] (1:N) -- Tracks Test Mode, Config, Status
   │       │
   │       └──> [user_interactions] (1:N) -- Logs EVERY click: question_id, time_spent_ms, is_correct
   │
   ├──> [user_node_mastery] (1:N) -- The Brain: topic_id, current_mastery_weight, avg_time_ms
   │
   └──> [notes] (1:N) -- Tied to both User and Taxonomy topic_id

[taxonomy_tree] (The Master Map)
   │
   ├──> Parent/Child hierarchy (Levels 1-6)
   ├──> Maps to [questions].topic_id
   ├──> Maps to [wiki_articles].node_id (via wiki_article_taxonomy)
   └──> Maps to [spatial_hotspots].node_id (3D Lab coordinates)
```

**Key Takeaway:** The `taxonomy_tree` acts as the platform's central nervous system. A single topic node connects a 3D visual hotspot, a chunk of syllabus text, the student's personal notes, and their algorithmic mastery score simultaneously.

---
**End of Blueprint.**  
*Save this document. For all future builds, instruct the AI: "Read SLATECAMP_BLUEPRINT.md to understand the architecture."*