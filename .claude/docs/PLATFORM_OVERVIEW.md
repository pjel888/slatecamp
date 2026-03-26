# Technical & Business Audit: SlateCamp

**Date:** March 26, 2026
**Status:** **[UPDATED — reflects current codebase state]**

---

## 1. Business Overview

**SlateCamp** is a high-fidelity, AI-integrated educational SaaS platform engineered for the Philippine Architecture Licensure Exam (ALE). Architecture is the beachhead market; the platform is built to expand to any PRC-regulated profession.

- **Target Audience:** ALE reviewees, returning reviewers, architecture undergraduates, DAE apprentices, practicing architects.
- **Core Value Proposition:** Transitioning study from passive memorization to active mastery through adaptive quizzing, spatial 3D visualization, and data-driven readiness scoring. "Know you'll win."
- **Revenue Model:** Tiered subscription (Free, Camp ₱499-799/mo, Insurance ₱3,999/6mo, Institutional bulk) managed via Stripe (international) and PayRex (Philippines — GCash, Maya, bank transfers).

---

## 2. Tech Stack

| Layer | Technologies |
|---|---|
| **Framework** | Next.js App Router, React 19 (Server Components, Server Actions) |
| **Styling** | Tailwind CSS 4, shadcn/ui, Phosphor Icons |
| **Database** | Supabase (PostgreSQL 17, ap-northeast-1) with RLS, pgvector, Realtime |
| **Authentication** | Supabase Auth with SSR (`@supabase/ssr`) |
| **3D Rendering** | Three.js, @react-three/fiber, @react-three/drei |
| **Editor** | Tiptap (notes), MDX (wiki) |
| **Charts** | Recharts |
| **AI** | Anthropic SDK (Claude), RAG pipeline |
| **Payments** | Stripe (global) + PayRex (Philippines) |
| **Validation** | Zod |
| **State** | Zustand (quiz, lab, notifications) |
| **Package Manager** | Bun (`bun.lock`) |
| **Deployment** | Vercel |
| **Design System** | Campfire |

---

## 3. Core Features (What's Built)

### A. Quiz Engine v2 (9 Modes)

The primary product surface. Config-driven via `QuizSessionConfig` JSONB — a single `QuizShell` component handles all 9 modes:

| Mode | Questions | Feedback | Purpose |
|---|---|---|---|
| Camp | 20 | Immediate | Guided daily study |
| Chill | 10 | Immediate, skip-friendly | Low-pressure practice |
| Subject | 15 | Immediate, adaptive | Single-subject deep dive |
| Focused | 15 | Immediate | Weakest areas (data-driven) |
| Custom | User picks | User picks | Full control |
| Storm | 50 | Deferred (60min timed) | Exam simulation |
| Full Exam | 200 | 24hr delayed (4hr timed) | ALE simulation |
| Extended | 100 | Immediate | Stamina training |
| Article Review | 5 | Immediate | Wiki-integrated |

**Key components:** `QuizShell`, `OptionsColumn`, `FeedbackPanel`, `QuizFooter`, `SetupFlow`, `ResultsDashboard`, `ReviewCardList`

**Algorithms:** IRT 2PL question selection, adaptive difficulty, EMA mastery, SM-2 spaced repetition, confidence calibration, stamina analysis

### B. Readiness Score

Anti-inflation scoring with 6 vectors: diminishing streak returns, difficulty ceiling (70/82), grey node penalty, Bloom's cognitive ceiling (75/87), question bank depth weight, recency decay (30-day half-life). PRC area-weighted: 30/30/40.

**Implementation:** `src/lib/readiness-score.ts` (pure function), `src/lib/actions/readiness-score-update.ts` (DB wiring)

### C. Knowledge Wiki

Taxonomy-mapped articles with MDX rendering, 9-type WikiItemRenderer (heading, fact, definition, formula, code_provision, detail, exam_tip, cross_ref, warning), interactive widgets (BP-344, DSGN-013), elaborative interrogation prompts, inline quizzes, bookmarks, read tracking, full-text search.

### D. 3D Learning Lab

React Three Fiber canvas with hotspot annotations linked to taxonomy. Guided + free exploration modes. Parametric controls (slider-based dimension adjustment), compliance state visualization, cross-section/exploded views, quiz mode within lab.

### E. Camp Trails (Guided Study Plans)

Trail types: time-gated, subject mastery, code deep-dive, remediation, exam simulation. Day-by-day structure with steps (quiz/wiki/lab/review). Enrollment tracking, streak management, missed day handling, score trajectory.

### F. Analytics Dashboard

**Existing:** Pacing Quadrant, Readiness Trajectory, Stamina Curve, Timeline Heatmap, Memory Health Map, Bloom Cognitive Tracker. Chart coaching annotations for pedagogical context.

**New (Metacognitive):** Calibration Curve, Calibration Score Card, Error Pattern Card, Memory Strength Quadrant, Forgetting Curves, Stamina Heatmap, Difficulty/Mastery Scatter, Study Velocity, Pacing/Accuracy, Exam Countdown, Progress Card, Simulation Trajectory, Exam Outcome Form.

### G. Additional Features

- **Flash Cards** — DB-driven from question bank, category browse, swipe/keyboard
- **Cram Card** — Auto-generated from wrong-answer patterns (20-session gate)
- **Design Practice** — Calculator (PD 1096/BP 344), Design Problems (5 levels, timer, BP 344 checklist), Design Quiz (12 scenario-based computation quizzes)
- **Notes** — Rich Tiptap editor with folder organization, contextual anchoring to taxonomy
- **Notifications** — 12 types, real-time via Supabase Realtime, preferences, quiet hours
- **SRS** — SM-2 spaced repetition cards with due scheduling
- **Onboarding** — Multi-path: first-taker, returning reviewer, undergrad, DAE, comp exam bridge
- **Results Day** — Passer/non-passer flows, social sharing, professional mode transition
- **Study Pods** — Group accountability (max 6), score deltas (never absolute scores)
- **Code Updates** — Building code changelog feed
- **Assessment** — Diagnostic quiz + score reveal ceremony

### H. Admin & Business

- **CMS** — Unified content editor (articles + questions + EI prompts), taxonomy editor, pipeline management, SME review queue
- **CEO Dashboard** — Financial (MRR, ARR, burn, runway), unit economics (CAC, LTV, churn), cohort retention, team management
- **Developer Hub** — Component registry, design system docs, API reference, DB viewer, test data tools
- **Payments** — Stripe + PayRex with paywall gating, daily question cap for free tier

---

## 4. Proprietary IP & Algorithms

### I. IRT 2PL Model (`src/lib/srs/irt.ts`)
Selects questions at the optimal challenge point (P ≈ 0.75). Updates user theta via Newton-Raphson step. **Status: Implemented and live.**

### II. SM-2 with Response-Time Weighting (`src/lib/srs/sm2.ts`)
Quality calculation based on correctness, latency, and confidence. Adjusts ease factor and review intervals. **Status: Implemented and live.**

### III. Readiness Score Engine (`src/lib/readiness-score.ts`)
6-vector anti-inflation composite. PRC area-weighted (30/30/40). **Status: Implemented and live.**

### IV. Metacognitive Calibration System (NEW — 16 features implemented)

**Confidence & Calibration:**
- [x] Confidence-weighted scoring — 3-level input (Guessing/Partly sure/Confident) on every question
- [x] Brier-based Calibration Score — 30-day rolling snapshot stored in `calibration_snapshots`
- [x] Calibration Curve visualization — Recharts diagonal reference line, overconfidence/underconfidence fills
- [x] 2x2 Diagnostic Matrix — Confident+Wrong quadrant drives priority review

**Self-Assessment Training:**
- [x] Pre-session Prediction Slider — "How do you think you'll do?" before Storm/FullExam
- [x] Post-session Postdiction — "How do you think you did?" before score reveal
- [x] Prediction vs Actual comparison card with trend tracking

**Learning Engine:**
- [x] Successive Relearning — 3 consecutive correct → spaced retests (1d/3d/7d/14d) → "durable"
- [x] Interleaved Topic Mixing — 70/30 primary/sibling questions, gated at 60% mastery
- [x] Generation Questions — numeric, short_text, formula with fuzzy answer matching (1.2x EMA weight)
- [x] Progressive Pressure Ladder — 4 levels (Learning → Exam), unlocked by readiness score

**Feedback Intelligence:**
- [x] Wrong Answer Taxonomy — 6 error categories classified per interaction
- [x] Feed-Forward Recommendation Engine — 3 post-session action cards
- [x] Socratic AI Error Exploration — 5-turn Socratic chat + AI-generated mnemonics
- [x] Pre-Questions Before Wiki — 3-5 MCQs before reading (g=1.25 effect size)

**Retention & Scheduling:**
- [x] Personalized Forgetting Rates — ACT-R decay model per user-topic
- [x] Storage/Retrieval Strength — Bjork's Theory of Disuse (2-dimension memory model)
- [x] Review Calendar — 7-day forward view with overdue/due/upcoming topics
- [x] Cramming Detector — warns after 40+ questions on one topic in 4 hours
- [x] Adaptive Daily Dose — one-tap personalized study session from 6 signal sources

**Visualizations & Reporting:**
- [x] 7 new analytics charts: Forgetting Curves, Stamina Heatmap, Difficulty/Mastery Scatter, Study Velocity, Pacing/Accuracy, Exam Countdown, Calibration Curve
- [x] Monthly Progress Report — shareable card with Web Share API
- [x] Simulation Trajectory — line chart tracking full-exam performance over time
- [x] Exam Outcome Self-Reporting — for future pass-rate correlation

### V. Pending IP Features
- [ ] Lucky Guess Detector (time-threshold penalty on suspiciously fast correct answers)
- [ ] Double-Pass LLM Verification (generator + auditor for zero-hallucination AI tutor)
- [ ] 3D Bounds Breaking (visual code violation feedback with Warm Red material)

---

## 5. Design System: Campfire

Warm, inviting, research-backed. Light mode primary. Inter typeface. Camp Cobalt `#1B3FC4` primary accent.

| Token | Hex | Usage |
|---|---|---|
| Camp Cobalt | `#1B3FC4` | Primary actions, nav, links |
| Emerald | `#2D9F6F` | Success, correct |
| Warm Red | `#D64545` | Error, critical |
| Amber | `#D4951A` | Warning |
| Surface Light | `#F8F7F5` | Page background (warm white) |
| Ink Primary | `#1A2332` | Main text |

- Cards: `rounded-md shadow-none`, Buttons: `rounded-sm`, Modals: `rounded-lg`
- Transitions: max 300ms. No gamification. No shame language.

---

## 6. Database

**64 tables** in production (PostgreSQL 17, Supabase). Full schema in `DATABASE_SCHEMA.sql`.

Key tables: `profiles` (PK: `id`), `taxonomy_tree`, `questions`, `quiz_sessions`, `user_interactions`, `user_node_mastery`, `user_global_stats`, `readiness_score_snapshots`, `wiki_articles`, `notifications`, `camp_trails`, `design_problems`, `study_pods`, `notes`.

All tables have RLS enabled. `profiles` PK is `id` (NOT `user_id`).

---

## 7. Strategic Position

1. **Data Integrity:** Strict RLS, triggers for `updated_at` consistency, 64 tables with comprehensive indexing.
2. **Scalability:** Supabase + Server Actions architecture with parallel data fetching (16 concurrent queries on dashboard).
3. **Moat:** Integrated loop (Wiki + Quiz + 3D + AI + Notes + Analytics + Trails) across a proprietary 6-level taxonomy. Network effects from study pods and community. Design quiz scenarios that no competitor has.
4. **Philippines-first:** PayRex for GCash/Maya, culturally sensitive UX (no shame language, retaker support), ALE-specific content.

---

**End of Audit Report.**
_For detailed architecture, see `CURRENT_ARCHITECTURE.md`. For design tokens, see `05 — Design.md`._
