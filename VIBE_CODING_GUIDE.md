# Cerebro — Vibe Coding Guide

**How to build this app with Cursor IDE and Claude Code using AI agents, sub-agents, skills, and rules.**

---

## 1. The Two Tools — When to Use Which

You have two AI-assisted development environments. They serve different purposes.

### Cursor IDE (Primary Build Tool)
**Use for:** Writing code, building components, implementing features, debugging.

**How it works:** Cursor reads your `.cursorrules` file (and `.cursor/rules/*.mdc` files) at the start of every conversation. These rules constrain the AI so it generates code that matches your architecture, design system, and database schema.

**Key features to use:**
- **Composer (Agent Mode):** For multi-file feature implementation. "Build the Review Mode infinite scroll with rich post-answer panels."
- **Tab Predictions:** Cursor predicts your next code as you type.
- **Chat (Cmd+L):** Ask questions about your codebase. "How does the session builder currently work?"
- **@-mentions:** Reference files directly. "@DATABASE_SCHEMA.sql what's the structure of session_questions?"
- **Plan Mode:** For complex features, start with planning before implementation.

### Claude Code (Terminal Agent)
**Use for:** Research, architecture decisions, refactoring across many files, migrations, running builds/tests, and orchestrating sub-agents.

**How it works:** Claude Code reads your `CLAUDE.md` file for project context. It operates in your terminal with access to your filesystem, git, and CLI tools. It can spawn sub-agents for parallel work.

**Key features to use:**
- **Sub-agents:** Spawn specialized workers for focused tasks.
- **Plan Mode:** `/plan` before implementing complex features.
- **Commands/Skills:** Reusable workflows you define once.
- **Agent Teams:** Multiple agents working in parallel on different domains.

---

## 2. File Setup — Your AI Infrastructure

Place these files in your project root:

```
cerebro/
├── .cursorrules                    # Rules for Cursor IDE (included in this package)
├── CLAUDE.md                       # Context for Claude Code (included in this package)
├── PRD.md                          # Product requirements (included in this package)
├── DATABASE_SCHEMA.sql             # DB schema source of truth (included in this package)
├── FEATURE_TREE.md                 # Feature hierarchy (included in this package)
│
├── .cursor/
│   └── rules/                      # Cursor MDC rules (optional, for advanced use)
│       ├── quiz-engine.mdc         # Auto-activates when editing quiz/ files
│       ├── 3d-components.mdc       # Auto-activates when editing 3d/ files
│       ├── supabase.mdc            # Auto-activates when editing lib/supabase/
│       └── design-system.mdc       # Auto-activates when editing components/ui/
│
└── .claude/
    └── agents/                     # Claude Code sub-agents
        ├── db-architect.md
        ├── quiz-engineer.md
        ├── design-reviewer.md
        └── test-writer.md
```

---

## 3. Cursor Rules — The Constraint System

### The .cursorrules file (Legacy but still works)
This file is included in your package. It contains:
- Stack definition (don't suggest alternatives)
- Architecture rules (Server Components, Server Actions, RLS)
- Design system (Rams Standard colors, typography, component patterns)
- Anti-patterns (what to NEVER do)

### MDC Rules (Advanced — Optional but Powerful)
MDC rules live in `.cursor/rules/` and activate based on file context. Create them when you want rules that only apply to certain parts of the codebase.

**Example: `.cursor/rules/quiz-engine.mdc`**
```markdown
---
description: Rules for the quiz engine components and pages
globs:
  - src/app/(dashboard)/quiz/**
  - src/components/quiz/**
alwaysApply: false
---

## Quiz Engine Rules
- Quiz UI: single column, max-width 720px, centered, immersive
- Use `useOptimistic` for instant answer feedback
- Server Actions for logging responses to `session_questions`
- After each answer, update: session_questions, srs_queue (Pro/Max), subject_mastery
- Show rich content after answering: explanation, references, fun_facts, 3D link
- Response time tracking: capture `presented_at` and `answered_at` timestamps
- Progress bar at top using --amber color
- Keyboard shortcuts: 1-4 for answers, Enter for next
- Mobile: swipe right for next question
```

**Example: `.cursor/rules/design-system.mdc`**
```markdown
---
description: Rams Standard design system enforcement
globs:
  - src/components/**
  - src/app/**/*.tsx
alwaysApply: false
---

## Rams Standard Design Rules
- NEVER use hardcoded hex colors. Always CSS variables: var(--amber), var(--green), etc.
- NEVER use gradients or heavy box-shadows
- All transitions: 150ms ease. No bouncy/spring animations.
- Buttons: solid fill for primary (amber), ghost for secondary
- Cards: white bg, 1px border bone, 8px radius, subtle shadow
- Loading states: skeleton screens ONLY, never spinners
- Icons: Lucide only, stroke 1.5px, 20px size
- Touch targets: minimum 44px on mobile
- Typography: use the defined type scale (text-xs through text-4xl)
```

---

## 4. Claude Code Sub-Agents — Your AI Development Team

Sub-agents are specialized AI workers you define once and reuse. They run in their own context window (saving your main conversation's tokens) and return summaries.

### How to Create Sub-Agents

**Option A: Using Claude Code CLI**
```bash
# In your terminal with Claude Code active:
/agents
# Select "Create new agent"
# Follow the prompts
```

**Option B: Manual File Creation**
Create markdown files in `.claude/agents/`:

### Recommended Sub-Agents for Cerebro

**1. Database Architect (`.claude/agents/db-architect.md`)**
```markdown
---
name: db-architect
description: Database schema expert. Validates changes against DATABASE_SCHEMA.sql, writes migrations, checks RLS policies. Invoke when creating or modifying any database-related code.
tools: Read, Write, Edit, Bash, Glob, Grep
model: sonnet
---

You are a PostgreSQL and Supabase database architect for Project Cerebro.

CRITICAL RULES:
1. DATABASE_SCHEMA.sql is the SINGLE source of truth. Never create columns, tables, or types not defined there.
2. Every table MUST have RLS enabled with appropriate policies.
3. All queries must respect the exam_profile_id scope — data is isolated per exam profile.
4. Use Supabase-generated types. Never manually define DB types.

When invoked:
1. Read DATABASE_SCHEMA.sql first
2. Validate the requested change against the existing schema
3. If the change requires a migration, write it in supabase/migrations/
4. Verify RLS policies cover the new/modified table
5. Update the types: run `npx supabase gen types typescript`

Always check for:
- Missing indexes on frequently queried columns
- N+1 query patterns
- Proper foreign key constraints
- exam_profile_id scoping on all user-facing queries
```

**2. Quiz Engine Specialist (`.claude/agents/quiz-engineer.md`)**
```markdown
---
name: quiz-engineer
description: Expert on the quiz/session engine. Handles Review Mode, Sessions Mode, question rendering, response tracking, and SRS. Invoke for any quiz-related feature work.
tools: Read, Write, Edit, Bash, Glob, Grep
model: sonnet
---

You are the quiz engine specialist for Project Cerebro.

CONTEXT:
- Three modes: Review Mode (doomscroll, no analytics), Sessions Mode (tracked), 3D Library
- Questions have rich content: explanation, references[], fun_facts[], mnemonics, images
- Sessions track every response in session_questions with response_time_ms
- Per-question lifetime stats via materialized view question_user_performance
- SRS uses SM-2 algorithm, scoped per exam_profile

RULES:
1. Quiz UI: single column, max-width 720px, centered, immersive
2. Use `useOptimistic` for instant feedback (sub-100ms)
3. Server Actions for ALL database writes
4. Review Mode: NEVER show analytics to the user
5. Sessions Mode: track everything — selected_answer, is_correct, response_time_ms, presented_at, answered_at
6. After answering: show explanation, references, fun_facts, 3D link, and (Pro/Max) per-question history

When building quiz features:
1. Read the relevant section of PRD.md
2. Check DATABASE_SCHEMA.sql for the exact table structure
3. Implement with Server Components + Server Actions
4. Ensure mobile-first responsive with 44px touch targets
```

**3. Design Reviewer (`.claude/agents/design-reviewer.md`)**
```markdown
---
name: design-reviewer
description: Reviews components against the Rams Standard design system. Checks colors, typography, spacing, animations, and accessibility. Invoke after building UI components.
tools: Read, Glob, Grep
model: haiku
---

You are a design system reviewer for Project Cerebro, enforcing the "Rams Standard" (Dieter Rams / Braun inspired).

REVIEW CHECKLIST:
- [ ] No hardcoded hex colors — all via CSS variables
- [ ] No gradients or heavy shadows
- [ ] Transitions: 150ms ease (no bouncy/spring)
- [ ] Touch targets >= 44px on mobile
- [ ] Skeleton loading states (never spinners)
- [ ] Icons: Lucide only, stroke 1.5px
- [ ] Cards: white bg, 1px border, 8px radius
- [ ] Primary CTA: amber background
- [ ] Correct/incorrect: green/red accents
- [ ] Typography follows the defined scale
- [ ] WCAG 2.1 AA color contrast

When reviewing:
1. Run `grep -r '#[0-9A-Fa-f]\{6\}' src/components/` to find hardcoded colors
2. Check for inline styles
3. Verify responsive breakpoints
4. Flag any spinner/loading wheels
5. Report findings organized by: Critical → Warning → Suggestion
```

**4. Test Writer (`.claude/agents/test-writer.md`)**
```markdown
---
name: test-writer
description: Writes unit tests (Jest) and E2E tests (Playwright) for Cerebro features. Invoke after implementing a feature.
tools: Read, Write, Edit, Bash, Glob, Grep
model: sonnet
---

You are a test engineer for Project Cerebro.

TESTING STRATEGY:
- Unit tests (Jest): lib/ functions, utility helpers, SRS algorithm, IRT calculations
- Component tests (React Testing Library): quiz components, dashboard widgets
- E2E tests (Playwright): auth flow, quiz session flow, session builder

PRIORITIES (test these first):
1. Quiz answer submission → session_questions update → SRS queue update
2. Session builder → correct question count → randomization
3. Exam profile switching → context isolation
4. Review Mode → NO analytics leakage
5. Authentication flow → protected routes

When invoked:
1. Identify the feature to test
2. Write tests that cover happy path + edge cases
3. Run tests: `npm run test` or `npm run test:e2e`
4. Fix any failures
5. Report coverage
```

---

## 5. How to Use Sub-Agents in Practice

### Invoke a sub-agent explicitly:
```
"Have the db-architect validate my migration for the new study_time_logs table"
"Ask quiz-engineer to build the Review Mode infinite scroll component"
"Get design-reviewer to audit all components in src/components/quiz/"
```

### Claude auto-invokes when relevant:
If you've set `description` well, Claude Code will automatically delegate when it encounters a matching task. For example, asking "build the session summary page" may automatically invoke `quiz-engineer`.

### Chain sub-agents for complex features:
```
"I need to add the session retake feature:
1. Have db-architect verify the retake_of_session_id FK and any needed indexes
2. Have quiz-engineer implement the retake flow (same questions, new responses)
3. Have test-writer write E2E tests for the retake comparison view
4. Have design-reviewer audit the comparison UI"
```

---

## 6. Skills (Reusable Workflows)

Skills are command-like workflows that Claude Code can execute. They differ from sub-agents in that they're on-demand procedures, not persistent workers.

### Create a skill:
Place skill files in `.claude/commands/` or reference via `CLAUDE.md`.

**Example: Feature Implementation Skill**
Add this to CLAUDE.md:

```markdown
## /implement workflow
When I say "/implement [feature]":
1. Read PRD.md for the feature spec
2. Read DATABASE_SCHEMA.sql for relevant tables
3. Create a plan (list files to create/modify)
4. Ask me to approve the plan
5. Implement file by file, committing after each logical unit
6. Run lint and typecheck after each file
7. Write tests for the feature
8. Run tests
9. Summarize what was built and what to test manually
```

**Example: Database Migration Skill**
```markdown
## /migrate workflow  
When I say "/migrate [description]":
1. Read DATABASE_SCHEMA.sql
2. Generate a Supabase migration file in supabase/migrations/
3. Include RLS policies if new tables are created
4. Run `npx supabase db push` to apply
5. Regenerate types: `npx supabase gen types typescript`
6. Update any affected TypeScript types
```

---

## 7. Workflow — Building a Feature End-to-End

Here's the recommended workflow for building each feature:

### Step 1: Context Loading
```
# In Cursor Composer or Claude Code:
"Read PRD.md section [X] and DATABASE_SCHEMA.sql. 
I want to build [feature name]."
```

### Step 2: Planning (use Plan Mode)
```
"Create a plan for implementing [feature]. List:
- Files to create
- Files to modify  
- Database changes needed
- Components to build
- Server Actions needed
Do NOT start coding yet."
```

### Step 3: Approve & Build
Review the plan. Then:
```
"Plan approved. Start with [first file]. 
Follow .cursorrules and the Rams Standard design system."
```

### Step 4: Review
```
# In Claude Code:
"Have design-reviewer audit the components I just built in src/components/quiz/"
"Have db-architect verify my migration"
```

### Step 5: Test
```
"Have test-writer create tests for [feature]"
```

### Step 6: Commit
```
"Create a conventional commit for this feature: feat(quiz): add session retake with comparison view"
```

---

## 8. Phase-by-Phase Build Prompts

### Phase 1: Foundation
```
Read PRD.md and DATABASE_SCHEMA.sql. Initialize a Next.js 15 project with:
- TypeScript strict mode
- Tailwind CSS 4 + shadcn/ui  
- Supabase SSR auth (@supabase/ssr)
- The Rams Standard CSS variables in globals.css
- Protected route group (dashboard) with layout
- Auth pages (login, register, magic link)
- Onboarding flow (select board exam → target date → create exam profile)
- Dashboard layout with exam profile switcher in header
- Subject cards grid seeded with ALE architecture subjects
- Deploy to Vercel
```

### Phase 2: Review Mode
```
Read PRD.md "Mode 1: Review Mode." Build the doomscroll study experience:
- Full-screen question card (one at a time, centered, 720px max)
- After tapping an answer: rich panel expands with explanation, references, fun_facts, images, 3D link
- Subject/topic filter (top bar or drawer)
- Infinite scroll pagination (Supabase cursor-based)
- Lightweight tracking to review_mode_interactions (NOT shown to user)
- Mobile-optimized: swipe up for next
- Follow Rams Standard design. No analytics UI.
```

### Phase 3: Sessions Mode
```
Read PRD.md "Mode 2: Sessions Mode" and DATABASE_SCHEMA.sql tables: 
review_sessions, session_questions, session_templates.

Build:
1. Subject Quick-Start: click subject → choose count (10/25/50/100) → start
2. Custom Session Builder: select subjects + count per subject → configure → start
3. Quiz engine: optimistic UI, progress bar, timer (optional), keyboard shortcuts
4. After each answer: log to session_questions with response_time_ms
5. Session summary: score, per-subject breakdown, time stats
6. Session history: list of past sessions with retake button
7. Retake: same questions, comparison view showing improvement delta
8. Per-question history (Pro/Max): "Seen 5x, correct 3x (60%)" shown after answering
9. Session templates: save and reuse custom sessions
```

### Phase 4: Analytics
```
Read PRD.md section 7 "Analytics." Build:
1. Study time tracking (study_time_logs table, idle detection at 2 min)
2. Dashboard widgets: streak, mastery radar, countdown, recent sessions
3. Analytics page: performance over time, subject breakdown, response time analysis
4. Question analytics: per-question lifetime stats from question_user_performance view
5. Weekly email report (Resend)
6. Subject mastery calculation (rolling window of last 50 responses)
```

### Phase 5: 3D Library
```
Read PRD.md "Mode 3: Visual Learning / 3D Library" and DATABASE_SCHEMA.sql 
tables: three_d_models, model_callouts.

Build:
1. 3D model browser grid (filtered by subject)
2. Model viewer: React Three Fiber + drei (OrbitControls, Environment)
3. Callout points as interactive 3D labels
4. Tap callout → info panel (label, description, image, linked questions)
5. "Quiz Me on This" → mini session from callout's linked questions
6. Layer toggle, explode view (if model supports it)
7. Gate behind Pro/Max tier
```

### Phase 6: AI Layer
```
Read PRD.md AI sections. Build:
1. SRS: SM-2 algorithm in lib/srs/sm2.ts, queue in srs_queue table
2. PDF ingestion: upload → parse → chunk (500 tokens) → embed → store
3. Socratic Tutor: RAG with pgvector, streaming responses
4. AI study recommendations (Max): prescriptive insights from analytics data
5. Predictive score model (Max): IRT-based theta estimation
6. AI provider abstraction (swappable OpenAI ↔ Anthropic)
```

### Phase 7: Marketplace & Monetization
```
Build:
1. Stripe: subscriptions (Pro/Max), checkout sessions, customer portal, webhooks
2. Marketplace: browse/filter question banks, preview, purchase, ratings
3. Seller flow: create bank → submit for review → set price → publish
4. Tier gating: enforce feature limits per user tier
5. Polish: error boundaries, empty states, 404, accessibility audit, PWA
```

---

## 9. Context Management Tips

### In Cursor:
- Use `@filename` to reference specific files in chat
- Start new Composer sessions for new features (don't let context accumulate)
- If Cursor generates wrong patterns, re-paste the relevant `.cursorrules` section in chat

### In Claude Code:
- Start fresh sessions per feature (`/clear` between tasks)
- Use `/compact` proactively at ~50% context usage (before Claude loses accuracy)
- Delegate research and exploration to sub-agents (preserves main context)
- Keep CLAUDE.md under 200 lines (move details to PRD.md, reference with @)
- Use `/plan` before complex implementations

### General:
- Commit often. Small, atomic commits. One feature per commit.
- Run `npm run typecheck` after every file — catch type errors early.
- Re-generate Supabase types after any migration: `npx supabase gen types typescript`
- When the AI drifts, re-paste the relevant section from PRD.md or DATABASE_SCHEMA.sql

---

## 10. Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# AI Provider
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
AI_PROVIDER=openai

# Stripe  
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_PRO_PRICE_ID=
STRIPE_MAX_PRICE_ID=

# Email
RESEND_API_KEY=

# Analytics
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=

# App
NEXT_PUBLIC_APP_URL=https://cerebro.app
```
