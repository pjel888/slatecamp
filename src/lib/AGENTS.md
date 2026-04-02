<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-24 | Updated: 2026-04-02 -->

# lib

## Purpose

The `src/lib` directory contains all business logic, utilities, and service integrations for SlateCamp. This is a discipline-agnostic, high-performance study engine for professional licensure exams, built with Next.js, React, Supabase, and Three.js.

All data mutations flow exclusively through **Server Actions** in `actions/`. No direct database writes from components.

## Key Files

| File | Description |
|------|-------------|
| `utils.ts` | Utility exports: `cn()` for Tailwind class merging (use `clsx` + `twMerge`, never string concat) |
| `routes.ts` | Single source of truth for dashboard route configs—labels, icons, groups, and navigation structure |
| `analytics.ts` | Client-side event tracking (page views, interactions, feature usage) |
| `analytics-server.ts` | Server-side event tracking (async event dispatch to analytics backend) |
| `lab-analytics.ts` | 3D Lab analytics: spatial interaction tracking, performance metrics for Three.js/R3F |
| `readiness-score.ts` | Readiness Score calculation engine using IRT 2-parameter logistic model with 6 anti-inflation vectors (pure function, no DB access) |
| `rate-limit.ts` | Rate limiting implementation (prevents abuse of APIs and endpoints) |
| `wiki-markdown.ts` | Wiki markdown processing: parsing, citation extraction, formatting for display |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `actions/` | **Server Actions only.** 116 files across root + admin/ (13 files), ceo/ (4 files), dev/ (2 files), analytics/ (5 files), mastery/ (5 files), quiz-v2/ (18 files), daily-dose/ (2 files), progress-report/ (2 files), wiki/ (2 files), ai/ (1 file) handling ALL data mutations. Never access DB from components; always route through actions. |
| `admin/` | Admin-specific logic: role checks, permission gates, admin profile retrieval, feature flags. |
| `ai/` | AI contextual tutor integration (Anthropic API). Temperature 0.0. Mandatory citation badges. Prompts and provider abstraction. |
| `audio/` | Audio playback utilities for feedback sounds and ambient cues. |
| `audit/` | Audit trail logging: action tracking, user behavior logs for compliance and debugging. |
| `blindspot/` | Blindspot detection algorithm: identifies weak knowledge areas by analyzing question patterns and mastery data. |
| `constants/` | Centralized constants: site config, design tokens (Campfire palette), enums, pricing, analytics event names, readiness thresholds. |
| `context/` | React Context providers: auth, user profile, feature flags, theme, modal state, demo mode. |
| `demo/` | Demo mode utilities: mock Supabase client, config flags, fake data generation. |
| `dev/` | Developer utilities: dev mode flags, debug helpers, test data generation. |
| `endurance/` | Extended practice session logic: session scheduling, streak tracking, difficulty adaptation. |
| `hooks/` | Shared React hooks: `useToast`, `useDraggableFloatingPosition`, `useFeatureFlag`, `useUserRole`. |
| `import/` | Data import utilities: CSV parsing, question import schema, validation. |
| `notes/` | Note system logic: image uploads, note persistence, attachments. |
| `outcomes/` | Exam outcome predictions: scoring models, pass/fail estimation. |
| `payments/` | Payment provider abstraction: routes checkout to Stripe or PayRex based on `PAYMENT_PROVIDER` env var. |
| `payrex/` | PayRex payment gateway config: singleton client, PHP plans (centavos), GCash/Maya/QRPH support. |
| `paywall/` | Paywall and access control: daily cap enforcement, score reveal gates, feature paywalls. |
| `proof-simulation/` | Full exam simulation logic: full-length test mode, timer, review rules. |
| `readiness/` | Readiness score details: velocity tracking, churn detection, threshold logic. |
| `signals/` | User learning signals: learning velocity, struggle indicators, mastery signals. |
| `queries/` | Read-only query functions for server components (NOT server actions). Trail queries + ceo/ subdir for CEO portal reads. |
| `srs/` | **Spaced Repetition System.** 7 files: IRT 2-parameter logistic model, SM2 algorithm, retention curves, review queue scheduling. Core mastery algorithm. |
| `stripe/` | Stripe payment gateway config: singleton client, PHP plans, price IDs from env vars. |
| `supabase/` | Supabase client and utilities: browser client, server client, middleware, admin client, type definitions, error formatting. |
| `utils/` | General utilities: text processing, constants, helper functions, wiki utilities. |
| `validations/` | Zod validation schemas: request body validation, form input schemas. |
| `wiki/` | Wiki article lifecycle: CRUD with SME review workflow (draft -> review -> approved -> published). |
| `quiz/` | Quiz engine logic (19 files): question selection algorithms, session management, mode orchestration, offline support. |
| `pd1096/` | PD 1096 (Philippine Building Code) calculation logic (6 files): setback computation, building height, lot occupancy, FLAR. |
| `lot-geometry/` | Lot geometry calculations (5 files): site planning, setback visualization, area computation. |
| `cage/` | CAGE content assessment framework (5 files): question quality, content grading, assessment metrics. |
| `inference/` | Statistical inference (3 files): learning analytics, pattern detection, predictive modeling. |
| `adaptive/` | Adaptive learning algorithms (1 file): difficulty adjustment, personalized sequencing. |
| `workflow/` | Workflow and pipeline logic: content orchestration, async processing. |
| `__tests__/` | Unit tests and integration tests. |

## For AI Agents

### Working In This Directory

**Before writing any code:**

1. **Check the Agent Protocol.** Read `.claude/agents/` for domain-specific persona rules (e.g., `db-architect.md`, `quiz-engineer.md`).
2. **Check the Skills.** Apply universal constraints from `.claude/skills/` (e.g., `enforce-server-components`, `clean-code`).
3. **Verify against PRDs.** Consult `.claude/docs/` blueprints and PRDs to understand the _why_ before building.
4. **Check DATABASE_SCHEMA.sql.** Never hallucinate tables, columns, or foreign keys—read the actual schema.

**Mutation Rule (CRITICAL):**
- **ALL data mutations MUST go through Server Actions in `actions/`.** Do not access the database directly from React components. Components call Server Actions, which handle all Supabase writes.
- Server Actions use `'use server'` directive and live in `actions/` subdirectories.

**IRT Mastery Calculations (CRITICAL):**
- All mastery and difficulty calculations use the **2-parameter logistic IRT model** defined in `srs/irt.ts`.
- Probability formula: `P(correct | θ, a, b) = 1 / (1 + exp(-a * (θ - b)))`
- Theta = student ability, a = discrimination, b = difficulty.
- Never implement ad-hoc mastery scoring; use `srs/irt.ts` functions.

**Readiness Score (CRITICAL):**
- Implements 6 anti-inflation vectors in `readiness-score.ts` (pure function):
  1. Diminishing returns on consecutive correct streaks
  2. Difficulty ceiling (score capped until Level 3/4 questions answered correctly)
  3. Grey node penalty (unvisited nodes drag score down)
  4. Bloom's cognitive level ceiling (recall-only practice capped)
  5. Question bank depth weight (thin coverage reduces contribution)
  6. Recency decay (stale mastery counts less)
- Called from `readiness-score-update.ts` Server Action (DB reads happen in the action, not in the pure function).

**AI Tutor (CRITICAL):**
- Temperature MUST be 0.0 (deterministic output).
- Always include mandatory citation badges linking to exact Wiki paragraphs.
- Use structured rationales from questions (Misconception vs. Principle) to tailor responses.
- Implemented in `ai/provider.ts` (Anthropic or OpenAI abstraction).

**Design System (Campfire):**
- Colors: Camp Cobalt (`#1B3FC4`), Camp Orange (`#E8853A`), Emerald (`#2D9F6F`), Warm Red (`#D64545`), Amber (`#D4951A`).
- Typography: Inter font, minimum 11px text size (never `text-[8px]`, `text-[9px]`, `text-[10px]`).
- Shadows: `shadow-none` for cards at rest, `shadow-sm` on hover, `shadow-md` for dropdowns, `shadow-lg` for modals.
- Border radii: `rounded-md` (8px) for cards, `rounded-sm` (6px) for buttons/inputs, `rounded-lg` (12px) for modals.
- Transitions: max 300ms, `duration-150 ease-out` default. Never use `bounce` or `spring` easing.
- See `constants/` for Campfire design tokens.

**Voice & Tone (Campfire):**
- Words to avoid: "Blindspot Protocol" → "Focus Review"; "Endurance Cycle" → "Extended Practice"; "drill/grind" → "practice/review/session".
- Growth-framed copy: "42 topics covered" not "58 remaining"; "area to revisit" not "weakness".
- Never use "pass" as a guaranteed outcome in headlines; use "Know you'll win."

**Arrow Functions Only:**
- Always use arrow functions: `const fn = () => {}` never `function fn() {}`.

**Common Patterns:**

#### Creating a Server Action
```typescript
'use server'

import { createClient, getUser } from '@/lib/supabase/server'
import { trackServerEvent } from '@/lib/analytics-server'

export const myMutation = async (payload: MyInput): Promise<MyOutput> => {
  const supabase = await createClient()
  const { data: { user } } = await getUser()
  if (!user) throw new Error('Unauthorized')

  // DB write via Supabase
  const { data, error } = await supabase
    .from('my_table')
    .insert({ user_id: user.id, ...payload })
    .single()

  if (error) throw new Error(error.message)

  // Track event (async, can fire-and-forget)
  trackServerEvent('action_completed', {
    userId: user.id,
    timestamp: new Date().toISOString(),
  })

  return data
}
```

#### Using Readiness Score
```typescript
import { computeReadinessScore } from '@/lib/readiness-score'
import { getReadinessData } from '@/lib/actions/readiness-score-update'

// In a Server Action:
const data = await getReadinessData(userId) // fetch from DB
const { overallScore, subScores } = computeReadinessScore(data)
```

#### IRT Mastery Query
```typescript
import { probabilityCorrect, selectNextQuestion } from '@/lib/srs/irt'

const userTheta = 0.5 // student ability estimate
const question = { difficulty_rating: 0.2, discrimination_rating: 1.5 }
const prob = probabilityCorrect(userTheta, 1.5, 0.2) // ≈ 0.75
```

#### Client-Side Analytics
```typescript
'use client'

import { trackEvent } from '@/lib/analytics'

const handleQuestionAnswered = (questionId: string, isCorrect: boolean) => {
  trackEvent('question_answered', {
    question_id: questionId,
    is_correct: isCorrect,
    timestamp: new Date().toISOString(),
  })
}
```

#### Supabase Query (Server Action)
```typescript
'use server'

import { createClient } from '@/lib/supabase/server'

export const getUserQuizzes = async () => {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('quiz_sessions')
    .select('*')
    .eq('status', 'completed')
    .order('created_at', { ascending: false })
    .limit(10)

  if (error) throw new Error(error.message)
  return data
}
```

#### Using a Hook
```typescript
'use client'

import { useFeatureFlag } from '@/lib/hooks/useFeatureFlag'

const MyComponent = () => {
  const isNewUIEnabled = useFeatureFlag('new_ui_v2')

  if (!isNewUIEnabled) return <OldUI />
  return <NewUI />
}
```

#### Validating Input (Zod)
```typescript
'use server'

import { z } from 'zod'
import { validateInput } from '@/lib/validations'

const CreateQuizSchema = z.object({
  name: z.string().min(1).max(255),
  questionCount: z.number().int().min(1).max(100),
  difficulty: z.enum(['easy', 'medium', 'hard']),
})

export const createQuiz = async (input: unknown) => {
  const validated = CreateQuizSchema.parse(input) // throws if invalid
  // proceed with validated data
}
```

### Common Patterns

**Server Actions (Data Mutations):**
- Location: `actions/` subdirectories.
- Always mark with `'use server'` directive.
- Call `createClient()` to get Supabase instance (server-side version).
- Call `getUser()` to get current user.
- Throw meaningful errors; let Next.js error boundary catch.
- Fire `trackServerEvent()` for analytics (async, non-blocking).

**Pure Calculations:**
- Functions like `readiness-score.ts`, `srs/irt.ts` are pure functions with no side effects.
- Database reads happen in the calling Server Action, not in the pure function.
- Tests should run without DB access; use mocked input objects.

**React Hooks:**
- Hooks live in `hooks/`.
- Use React hooks for client-side state (feature flags, user role, toast messages).
- Never access Supabase directly from hooks; call Server Actions instead.

**Constants & Config:**
- Design tokens (colors, spacing) in `constants/design.ts` or similar.
- Site configuration in `constants/index.ts`.
- Centralize all magic strings and numbers to avoid duplication.

**Error Handling:**
- Supabase errors are caught and logged.
- Use `supabase/format-error.ts` to format errors consistently.
- Never expose raw DB errors to the client; sanitize messages.

**Testing:**
- Tests live in `__tests__/` or co-located with source (e.g., `file.test.ts`).
- Use unit tests for pure functions (IRT, readiness score).
- Use integration tests for Server Actions (mock Supabase).

## Dependencies

### Internal

- **Supabase:** Database, auth, real-time subscriptions. Client created via `createClient()` (browser) or `createServerClient()` (server).
- **Analytics:** Event tracking via `analytics.ts` (client) and `analytics-server.ts` (server).
- **IRT Model:** Mastery calculations via `srs/irt.ts` (2-parameter logistic).
- **Readiness Score:** Anti-inflation scoring via `readiness-score.ts` (pure function).
- **AI Tutor:** Contextual help via `ai/provider.ts` (Anthropic/OpenAI, Temperature 0.0).
- **Validation:** Input schemas via `validations/` (Zod).
- **Routes:** Navigation metadata via `routes.ts` (SSOT for dashboard routes).

### External

- **Next.js:** App Router, Server Actions, middleware.
- **React:** Components, hooks, context.
- **Tailwind CSS 4:** Utility-first styling. Use `cn()` helper for class merging.
- **shadcn/ui:** Base UI components from @base-ui/react.
- **Three.js & React Three Fiber:** 3D Lab spatial computing (target 60 FPS).
- **Anthropic / OpenAI:** LLM providers for AI tutor.
- **Zod:** Schema validation for runtime type checking.
- **Zustand:** (Optional) Client-side state management.

---

**Last Updated:** 2026-03-25

**For questions or updates to this guide, consult `.claude/agents/` and `.claude/docs/` in the repository root.**
