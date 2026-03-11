# CLAUDE.md — SlateCamp (formerly Cerebro)

> **For Claude Code:** Read this entire file before touching a single line of code.
> This is the single source of truth for how this project is built, what it does, and how it should feel.

---

## 0. THE BRAND — Read This First

Before writing a single component, understand what SlateCamp is at its core.

**SlateCamp is the definitive, all-in-one digital staging ground for professional licensure preparation.** It is the antidote to scattered PDFs, conflicting review center notes, and information overload. Every code, formula, and concept is already structured and double-checked by subject matter experts. While students are free to bring outside materials, SlateCamp is designed so they never have to.

**The one-line promise:** *Trust the camp, put in the reps, and we will eliminate the doubt.*

**The tagline:** *Know you'll pass.*

### 0.1 Brand Archetype

SlateCamp speaks like a **strict-but-caring mentor** — the professor whose class you actually prepare for. Warm enough to have a sidebar with you after lecture. Serious enough that you wouldn't show up underprepared. Can make a dry building code feel consequential. Jokes occasionally, but never lets you off the hook.

**NOT:** a drill sergeant, a cheerleader, a buddy, a software interface, or a corporate chatbot.

### 0.2 Brand Voice Rules (For All Copy in the UI)

| ✓ Do This | ✗ Not This |
|---|---|
| Authoritative, never arrogant | Exclamation points to manufacture hype |
| Empathetic, never pitying | "You're doing amazing just by showing up 💛" |
| Direct, zero-fluff | Vague motivational filler |
| Honest about numbers ("38% — here's the plan") | Inflated scores to make students feel better |
| Pair hard truths with a specific next step | Catastrophizing language ("CRITICAL DANGER") |

**Signature tone examples:**
- First login: *"You're in camp now. One platform. Everything verified. Let's find out exactly where you stand."*
- Low score: *"38%. That's where you are — not where you'll stay. Here are the three subjects to focus on this week."*
- Wrong answer: *"Not quite. Here's why that answer trips people — and why you won't miss it again."*
- High readiness: *"The data says you're ready. You earned that number. Walk in and do what you've been training for."*
- Exam week: *"You've answered this question in camp already. Tomorrow's just the official run. Trust the reps."*

### 0.3 Who We Build For

| Persona | Role | Primary Job | Key Need |
|---|---|---|---|
| **The Reviewee** | Primary B2C | Board exam prep (ALE, etc.) | One verified source; know exactly where they stand |
| **The Undergrad** | Secondary / Pipeline | Study support during college | Visualize concepts; build early foundation |
| **The Dean** | B2B | Institutional performance oversight | See cohort-level blind spots before exam season |

### 0.4 The Psychological Promise (UX North Star)

When a user logs into SlateCamp, the first psychological response must be an **exhale** — the relief of realizing they don't need to hunt for another PDF. Everything is here, perfectly organized and double-checked. The Readiness Score tells them exactly where they stand.

Every UX decision flows from this: **clarity over stimulation, structure over volume, honesty over comfort.**

---

## 1. What Is This Project?

SlateCamp is an AI-powered, unified study platform for **architecture students and board exam reviewees**, built as a "second brain" that combines expert-verified knowledge management, adaptive testing, real-time mastery analytics, and spatial/3D learning.

**Current focus:** Philippines Architecture (ALE exam). Multi-profession expansion planned (Civil Engineering → Nursing → CPA → Law).

**Document Status:** v4.0 — Unified Engine Model

---

## 2. Core Features (The "Big Six")

### Feature 1 — The SlateCamp Wiki (Taxonomy-Mapped CMS)
The definitive, SME-authored knowledge base. Every article carries a `topic_id` that maps it to the master syllabus. Bidirectional links, Zen reading mode, highlight-to-action toolkit, and peek-view references. **No orphan pages. Ever.**

### Feature 2 — Adaptive Testing & Quizzing Engine
- **Camp Mode:** Immediate feedback, no timer. Deep learning and remediation.
- **Storm Mode:** Mock board simulation. Strict timer. No feedback until submission. Tab-switching keeps the clock running.
- Syllabus Selector (cascading checkbox tree from Subject → Module → Topic).
- Algorithmic Remediation: every wrong answer surfaces the SME-written rationale + a direct link to the exact Wiki `topic_id`.
- Spaced repetition targets weak nodes automatically.

### Feature 3 — Personal Notes & Workspace
Block-based workspace. Every note auto-tagged to the taxonomy. Cloze deletion for active recall. Smart resurfacing when a user is struggling with a related topic. Cross-device sync.

### Feature 4 — Interactive Media & 3D Lab
WebGL-powered models via React Three Fiber. Parametric sandbox (drag Floor Area Ratio → model responds in real time; exceed legal height → model turns red with code citation). Guided tours for MEPFS systems. In-canvas spatial quizzing.

### Feature 5 — AI Contextual Tutor (Bounded RAG)
- Strictly tethered to the SlateCamp database. No internet access. Temperature = 0.0.
- Branded as: **"SlateCamp Reference Assistant"** — a librarian pointing to a book, not an oracle.
- Every response cites its exact source (clickable badge → Wiki drawer).
- Socratic protocol: asks questions, never just hands over the answer during active quizzing.
- "I Don't Know" fallback: if it's not in the database, the AI says so.
- "Report Hallucination" flag on every response → routes to SME review queue.

### Feature 6 — The Analytics Dashboard (Global Heatmap)
- Taxonomy Heatmap: Green (>85%), Amber (60–84%), Red (<59%), Grey (unexplored).
- Readiness Score: EMA-weighted (recent performance > historical), IRT-calibrated (hard questions count more), Lucky Guess detector (correct answer in 2.5s on a calculation problem = flagged).
- Pacing Gauge: "You answer Steel Design correctly, but take 3m 15s. The exam allows 1m 30s. At this pace, you'll leave 20 items blank."
- Predictive Remediation CTA: "Generate a 30-item quiz targeting your Red Nodes."

---

## 3. Build & Run

```bash
npm run dev           # Next.js dev server
npm run build         # Production build
npm run lint          # ESLint
npm run typecheck     # TypeScript strict check
npx supabase gen types typescript --project-id $PROJECT_ID > types/supabase.ts
npm run test          # Jest unit tests
npm run test:e2e      # Playwright E2E
```

---

## 4. Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 (App Router), TypeScript strict |
| Styling | Tailwind CSS 4, shadcn/ui |
| Database | Supabase (PostgreSQL + RLS) |
| Auth | `@supabase/ssr`, cookie-based sessions. **NEVER localStorage.** |
| 3D | React Three Fiber, Three.js, `@react-three/drei` |
| AI / RAG | Bounded vector search (Pinecone/Weaviate), LLM at temp=0.0 |
| SRS | SM-2 algorithm (`src/lib/srs/sm2.ts`), IRT (`src/lib/srs/irt.ts`) |
| Payments | Stripe |
| Product Analytics | PostHog |

---

## 5. Architecture Decisions (Non-Negotiable)

- **Server Components by default.** `'use client'` only when absolutely required (interactivity, browser APIs).
- **Server Actions for ALL mutations.** No client-side Supabase writes, ever.
- **RLS enabled on every table.** Always verify policies before shipping a feature.
- **Everything scoped by `exam_profile_id`.** This is the user's active board exam context. Every query, every analytics row, every SRS queue — scoped to the active profile.
- **No `useEffect` for data fetching.** Use RSC `async` components.
- **No `any` types.** Fix the type properly.
- **No hardcoded colors.** Use CSS variables from `globals.css`.
- **No DB columns not in `DATABASE_SCHEMA.sql`.** That file is the schema source of truth.

---

## 6. File Structure

```
src/
├── app/
│   ├── (auth)/               # Login, register, onboarding
│   └── dashboard/            # Protected routes
│       ├── wiki/
│       ├── testing/
│       ├── 3d-lab/
│       ├── notes/
│       ├── analytics/
│       └── settings/
├── components/
│   ├── ui/                   # shadcn primitives (don't modify)
│   ├── wiki/
│   ├── quiz/
│   ├── analytics/
│   ├── 3d/
│   ├── notes/
│   ├── dashboard/
│   └── shared/
└── lib/
    ├── supabase/             # client.ts, server.ts, admin.ts, middleware.ts
    ├── ai/                   # provider.ts, embeddings.ts, rag.ts, prompts.ts
    ├── srs/                  # sm2.ts, irt.ts
    └── stripe/               # config.ts, webhooks.ts
```

---

## 7. Database Essentials

- **Source of truth:** `DATABASE_SCHEMA.sql` at project root. Never deviate.
- **RLS:** Every table. Every time. Check policies before shipping.
- **Scope:** Everything reads/writes through `exam_profile_id`.
- **Key materialized view:** `question_user_performance` — tracks per-question lifetime stats.
- **Question schema is rich by design:** `explanation`, `references[]`, `fun_facts[]`, `mnemonics`, `image_urls`. A question is a full learning unit, not just a prompt-and-answer pair.
- **Core telemetry table `user_interactions`:** Logs every micro-interaction (not just final scores). Columns: `interaction_id`, `user_id`, `session_id`, `question_id`, `topic_id`, `selected_option_id`, `is_correct`, `time_spent_ms`, `interaction_timestamp`, `test_mode` (enum: `'camp'` | `'storm'`).
- **Aggregation table `user_node_mastery`:** Updated asynchronously via background workers after every quiz submission. Never query `user_interactions` directly for dashboard loads — use this table.

---

## 8. Design System — "Rams Standard"

Inspired by Braun/Dieter Rams. **Achromatic base + functional accents. No decoration for decoration's sake.**

### Color Tokens
```css
/* Primary action */
--color-cta:        #ED8008;   /* Amber — the camp's signature accent */

/* Feedback */
--color-correct:    #34C759;   /* Correct answer */
--color-incorrect:  #FF3B30;   /* Wrong answer */

/* Heatmap */
--color-mastered:   #34C759;   /* >85% */
--color-familiar:   #ED8008;   /* 60–84% */
--color-danger:     #FF3B30;   /* <59% */
--color-unexplored: #8E8E93;   /* Not yet attempted */
```

### Typography
- UI elements: clean, legible sans-serif (system or Geist)
- Body text / reading: high-readability serif for the Wiki
- Line length for reading: **65–75 characters max** — this is ergonomic, not aesthetic. Don't break it.

### Motion
- Transitions: **150ms max.** No bouncy springs. No page-load spectacle.
- Loading states: **skeleton loaders only.** No spinners.

### Layout
- Quiz UI: **720px max-width, centered, immersive.** This is the most important screen in the product. Treat it accordingly.
- No gradients. No heavy drop shadows. No decorative animations.
- Dark Mode: Deep slate grays (`#1E293B` to `#0F172A`). **Never pure black** (`#000000`) — it causes ghosting on screens with astigmatism.
- Light Mode: Soft off-whites. **Never pure white** (`#FFFFFF`).

### Design Principles (Ranked)
1. The interface must produce **calm.** Not excitement. Not stimulation.
2. **Clarity over cleverness.** If it needs to be explained, redesign it.
3. **Review Mode must feel stress-free.** No analytics. No performance indicators. Intentionally separated from assessment context.
4. **The Readiness Score is the emotional anchor.** Every design decision that touches it must reinforce trust and honesty, never inflate it.

---

## 9. Testing Modes — Critical UX Rules

| Mode | Timer | Feedback | Analytics Tracked | User Emotional State |
|---|---|---|---|---|
| **Review Mode** | ❌ | Immediate | ❌ No user-facing analytics | Exploration, low-stakes |
| **Camp Mode** | ❌ | Immediate + rationale | ✅ Full tracking | Learning, self-correction |
| **Storm Mode** | ✅ Strict | None until submit | ✅ Full tracking | Exam simulation, pressure |

**Rule:** Never show Review Mode analytics in the UI. It is intentionally stress-free. Do not add performance indicators to it under any circumstances.

---

## 10. AI Tutor — Hard Rules

The AI Contextual Tutor operates under a **Zero-Hallucination Mandate.** This is not a preference — it is a brand promise. One incorrect AI-generated building code could cause a student to fail their board exam.

| Rule | Implementation |
|---|---|
| Bounded context only | No internet access. Vector DB from SlateCamp Wiki only. |
| Deterministic output | Temperature = `0.0` |
| Mandatory citations | Every response must include a clickable `[Source: topic_id]` badge |
| Socratic protocol | Does not give direct answers during active quizzing |
| "I Don't Know" fallback | If not in the DB, say so explicitly — do not fabricate |
| Double-pass verification | Secondary LLM auditor checks for hallucinated numbers/codes before display |
| Hallucination report | Flag on every response. Routes to SME review queue. |

**Branding:** Never call it "AI," "Bot," "Oracle," or "Assistant" in isolation. Always: **"SlateCamp Reference Assistant."**

---

## 11. Pricing Tiers (For Feature Gating)

| Tier | Price | What's Included |
|---|---|---|
| **Free** | ₱0 | Syllabus outline, 5 basic 3D models, 20 practice questions/day |
| **Camp** | ₱499–799/mo | Full quizzing engine, Readiness Score, full analytics |
| **Insurance** | ₱3,999 (6-month lump sum) | Everything: AI Tutor, unlimited 3D Lab, Storm Mode, full suite |

**Conversion psychology:** The "Insurance" tier is purchased after graduation, for the review season. Framed as a fraction of a physical review center's fee. The high-anxiety pre-exam window is the primary upsell moment — design for it deliberately.

---

## 12. GTM Context (Shapes Feature Prioritization)

- **Phase 1 (Now):** Architecture beachhead. ALE reviewees + undergrads. Prove Readiness Score drives daily return.
- **Phase 2 (Near-term):** Institutional B2B. Dean's cohort dashboard. Aggregate heatmaps for faculty.
- **Phase 3 (Long-term):** Horizontal expansion. Civil Engineering, Nursing, CPA. Codebase stays. Taxonomy and content swap.

**The wedge logic:** Architecture handles 3D complexity, spatial reasoning, and dense building code logic. If the platform works here, every lighter-weight exam is a frictionless content-entry exercise.

---

## 13. Common Mistakes — Do Not Make These

```
❌  useEffect for data fetching         → Use RSC async components
❌  Client-side Supabase writes         → Server Actions only
❌  Hardcoded color values              → CSS variables from globals.css
❌  Analytics visible in Review Mode   → Review Mode is intentionally analytics-free
❌  New DB columns not in schema file  → DATABASE_SCHEMA.sql is the single source of truth
❌  TypeScript `any`                   → Fix the type properly
❌  AI response without citation badge → Every AI output must cite its source
❌  Pure black (#000000) backgrounds   → Use slate gray (#0F172A minimum)
❌  Pure white (#FFFFFF) backgrounds   → Use soft off-whites
❌  Bouncy animations / heavy shadows  → 150ms transitions, skeleton loaders only
❌  Inflate the Readiness Score        → The number must always be brutally honest
```

---

## 14. The One Question That Governs Every Decision

> **Does this make a student more likely to pass their board exam?**

If the answer is not clearly **yes** — it doesn't ship.

We do not build for the pitch deck. We do not build for design awards. We build for the exam.

---

*SlateCamp — Know you'll pass.*
*v4.0 · Unified Engine Model · Internal Reference*
