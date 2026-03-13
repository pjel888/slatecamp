# 07 — Tests

The comprehensive QA and testing handbook for **SlateCamp**. Covers testing philosophy, tooling, every test layer from unit to E2E, feature-specific test plans, performance benchmarks, accessibility, and CI integration.

<aside>
🚨

**Zero-Data-Loss Mandate:** If a user is 3 hours into a 4-hour mock exam and their browser crashes, they must resume from the exact second they left off. This is our #1 non-negotiable. Every testing decision flows from this principle.

</aside>

---

## 🎯 Testing Philosophy

SlateCamp handles **high-stakes exam data** — a lost quiz session, an incorrect Readiness Score, or an AI hallucination directly erodes user trust and could impact someone's professional future. Testing is not a checkbox. It is infrastructure.

### Core Principles

- **Test behavior, not implementation** — tests should verify *what* the code does, not *how* it does it internally. Refactoring should not break tests
- **Test the critical path first** — prioritize tests that protect user data, financial transactions, and scoring accuracy
- **Fast feedback loops** — unit tests run in < 5 seconds locally. If a test is slow, it belongs in a higher layer
- **Tests are documentation** — well-named tests describe the expected behavior of the system. A new developer should understand the Readiness Score algorithm by reading the test file
- **No flaky tests** — a flaky test is worse than no test. If a test fails intermittently, fix it or delete it

---

## 🛠️ Testing Toolchain

| **Layer** | **Tool** | **Why This Tool** |
| --- | --- | --- |
| Unit Tests | **Bun Test** (built-in) | Native to our runtime, zero config, fastest execution, Jest-compatible API |
| Component Tests | **React Testing Library**  • **Bun Test** | Tests components the way users interact with them (not internal state) |
| Integration Tests | **Bun Test**  • **Supabase Local** (Docker) | Test real database interactions, RLS policies, and Server Actions against a local Supabase instance |
| E2E Tests | **Playwright** | Cross-browser, headless, supports Next.js App Router, excellent for multi-step user flows |
| Visual Regression | **Playwright Screenshots** | Catch unintended UI changes in heatmap, quiz interface, and dashboard |
| Performance | **Lighthouse CI**  • **Web Vitals** | Automated Core Web Vitals checks on every PR |
| Accessibility | **axe-core** (via Playwright) + **eslint-plugin-jsx-a11y** | Automated WCAG compliance scanning |
| API Testing | **Bun Test** (direct fetch) or **Thunder Client** (manual) | Test API routes and Server Actions with real HTTP requests |

### Running Tests

```bash
# ─── UNIT & INTEGRATION ────────────────────────────────
bun test                    # Run all tests
bun test --watch            # Watch mode (re-run on file change)
bun test --coverage         # Generate coverage report
bun test src/lib/           # Run tests in a specific directory
bun test scoring            # Run tests matching "scoring" in name

# ─── E2E (Playwright) ──────────────────────────────────
bunx playwright install     # First-time: install browsers
bunx playwright test        # Run all E2E tests (headless)
bunx playwright test --ui   # Interactive UI mode (debugging)
bunx playwright test --headed  # Watch tests run in real browser
bunx playwright show-report # View HTML test report

# ─── PERFORMANCE ────────────────────────────────────────
bunx lighthouse http://localhost:3000 --output html
```

---

## 📁 Test File Structure

Tests live alongside the code they test, using the `.test.ts` / `.test.tsx` convention:

```
src/
├── lib/
│   ├── scoring/
│   │   ├── readiness-score.ts
│   │   ├── readiness-score.test.ts      ← Unit test
│   │   ├── ema-weighting.ts
│   │   ├── ema-weighting.test.ts        ← Unit test
│   │   ├── irt-calculation.ts
│   │   └── irt-calculation.test.ts      ← Unit test
│   ├── validations/
│   │   ├── quiz-submission.schema.ts
│   │   └── quiz-submission.schema.test.ts
│   └── utils.ts
│       └── utils.test.ts
├── components/
│   ├── dashboard/
│   │   ├── HeatmapNode.tsx
│   │   └── HeatmapNode.test.tsx         ← Component test
│   └── ui/
│       ├── Button.tsx
│       └── Button.test.tsx
├── app/
│   └── api/
│       └── quiz-sessions/
│           ├── route.ts
│           └── route.test.ts            ← Integration test
└── e2e/                                 ← E2E tests (root level)
    ├── onboarding.spec.ts
    ├── quiz-camp-mode.spec.ts
    ├── quiz-storm-mode.spec.ts
    ├── notes-capture.spec.ts
    ├── payment-flow.spec.ts
    └── fixtures/
        ├── test-user.ts
        └── mock-quiz-data.ts
```

### Naming Conventions

- Unit/Integration: `<module-name>.test.ts` or `<ComponentName>.test.tsx`
- E2E: `<feature-name>.spec.ts` (Playwright convention)
- Test fixtures/mocks: `src/e2e/fixtures/` or co-located `__mocks__/` directories
- Test descriptions use plain English: `it('returns a Readiness Score of 0 when no quizzes have been taken')`

---

## 🔬 Layer 1: Unit Tests

The foundation. Fast, isolated, no network calls, no database. Test pure logic.

### P0 — Scoring Engine (Must Be Perfect)

| **Module** | **What to Test** | **Example Assertions** |
| --- | --- | --- |
| Readiness Score (EMA) | Exponential Moving Average correctly weights recent vs. historical performance | Recent 90% + historical 40% → score closer to 90 than 40. Cold start returns 0. Single quiz returns raw score. |
| Item Response Theory (IRT) | Harder questions answered correctly boost score more than easy ones | Correct answer on difficulty=0.9 adds more than difficulty=0.2. Wrong answer on easy question penalizes more. |
| Lucky Guess Detector | Flags correct answers on complex questions answered suspiciously fast | Correct + difficulty>0.7 + time<5s → flagged. Correct + difficulty<0.3 + time<5s → not flagged (it was easy). |
| Spaced Repetition Scheduler | Weak topics are over-indexed in generated quiz batches | Topics at <50% mastery appear 3x more than >85% topics. Unexplored topics get baseline inclusion. |
| Heatmap Color Mapping | Mastery percentage → correct color bucket | 86% → Green. 60% → Yellow. 59% → Red. 0 attempts → Grey. Boundary values (85, 60) test edge cases. |
| Pacing Calculator | Average time per item and projected items left blank | 3m15s avg × 200 items = 650 min. Exam is 240 min → projected 126 items completed, 74 blank. |
| Endurance Decay Curve | Accuracy-over-time calculation for Endurance Cycle | Accuracy in blocks of 10 items. Detects >15% drop = decay point. Returns block number where decay starts. |

**Example Test (Readiness Score):**

```tsx
import { describe, it, expect } from 'bun:test'
import { calculateReadinessScore } from '@/lib/scoring/readiness-score'

describe('calculateReadinessScore', () => {
  it('returns 0 when no quiz history exists', () => {
    expect(calculateReadinessScore([])).toBe(0)
  })

  it('returns the raw score for a single quiz session', () => {
    const history = [{ score: 72, timestamp: Date.now() }]
    expect(calculateReadinessScore(history)).toBe(72)
  })

  it('weights recent performance higher than historical', () => {
    const history = [
      { score: 40, timestamp: Date.now() - 30 * 24 * 60 * 60 * 1000 }, // 30 days ago
      { score: 90, timestamp: Date.now() },                              // today
    ]
    const result = calculateReadinessScore(history)
    expect(result).toBeGreaterThan(75) // closer to 90 than 40
    expect(result).toBeLessThan(90)
  })

  it('never returns a value outside 0-100', () => {
    const edgeCases = [
      [{ score: 0, timestamp: Date.now() }],
      [{ score: 100, timestamp: Date.now() }],
      [{ score: -5, timestamp: Date.now() }],   // malformed input
      [{ score: 105, timestamp: Date.now() }],   // malformed input
    ]
    edgeCases.forEach((history) => {
      const result = calculateReadinessScore(history)
      expect(result).toBeGreaterThanOrEqual(0)
      expect(result).toBeLessThanOrEqual(100)
    })
  })
})
```

### P1 — Validation & Data Integrity

| **Module** | **What to Test** |
| --- | --- |
| Zod Schemas (Quiz Submission) | Rejects missing fields, wrong types, out-of-range values. Accepts valid payloads. Tests `quiz_id`, `answers[]`, `timestamps[]`. |
| Zod Schemas (User Profile) | Validates email format, password min length, display name constraints. |
| Zod Schemas (Env Vars) | Startup fails if `NEXT_PUBLIC_SUPABASE_URL` is missing or malformed. |
| Taxonomy Mapper | `topic_id` resolution returns correct subject → module → topic hierarchy. Orphan detection works. |
| Markdown Sanitizer | `isomorphic-dompurify` strips XSS vectors from Wiki content. Preserves safe HTML (bold, links, KaTeX). |
| Date/Time Utilities | Quiz timestamps format correctly across timezones. Pacing metrics handle DST transitions. |

### P2 — Utility Functions

| **Module** | **What to Test** |
| --- | --- |
| `cn()` utility | Merges Tailwind classes correctly. Deduplicates conflicting classes (e.g., `bg-red-500`  • `bg-blue-500` → last wins). |
| Format helpers | Number formatting (percentages, scores), time formatting (mm:ss for pacing), truncation. |
| URL/slug generators | Wiki article titles → URL-safe slugs. Handles special characters, unicode, max length. |

---

## 🔗 Layer 2: Integration Tests

Test how modules work together — database interactions, API routes, Server Actions, and auth flows. These require a **local Supabase instance** running via Docker.

### Local Supabase Setup

```bash
# Start local Supabase (Docker required)
bunx supabase start

# Run migrations against local instance
bunx supabase db reset

# Seed test data
bun run db:seed

# Run integration tests
bun test --filter integration

# Stop local Supabase
bunx supabase stop
```

### P0 — Data Pipeline (Zero-Data-Loss)

| **Flow** | **What to Test** | **How** |
| --- | --- | --- |
| Quiz Auto-Save (10s) | Quiz state persists every 10 seconds. Resume after disconnect matches exact state (selected answers, flagged items, timer position). | Start quiz → answer 5 items → flag 2 → simulate disconnect → reconnect → verify full state match. |
| Quiz → Analytics Pipeline | Submitting a completed quiz correctly updates `user_interactions` AND `user_node_mastery` tables. Readiness Score recalculates. | Submit quiz → query both tables → verify row counts, score values, and `topic_id` mappings. |
| Offline Quiz Completion | Full quiz payload loads. User can complete entire quiz with no network. Submission queues and resolves on reconnect. | Fetch payload → disconnect → answer all → reconnect → verify submission success and analytics update. |
| Concurrent Save Conflict | Two simultaneous auto-save writes don't corrupt data. Last-write-wins with sequence number. | Trigger two overlapping saves with different answer states → verify the later sequence number persists. |

### P0 — Authentication & Authorization

| **Flow** | **What to Test** | **How** |
| --- | --- | --- |
| Supabase Auth (Sign Up) | New user creation → session token → redirect to onboarding quiz. | POST to auth endpoint → verify session cookie set → verify user row in `auth.users`. |
| Supabase Auth (SSR Session) | Server Components correctly read session from cookies. Expired session → redirect to login. | Make Server Component request with valid/expired/missing token → verify behavior. |
| Row-Level Security (RLS) | User A cannot read or write User B's notes, quiz data, or mastery scores via direct Supabase query. | Create two test users → authenticate as User A → attempt SELECT on User B's data → verify empty result. |
| Middleware Auth Guard | All `/dashboard/*` routes redirect to `/auth/login` when unauthenticated. | Request dashboard routes without session → verify 302 redirect. |

### P0 — Payment Processing

| **Flow** | **What to Test** | **How** |
| --- | --- | --- |
| Stripe Webhook (Subscription) | `checkout.session.completed` → user tier upgraded in database → feature gates unlocked. | Send test webhook event → verify `user_subscriptions` table updated → verify Storm Mode accessible. |
| Stripe Webhook (Cancellation) | `customer.subscription.deleted` → user reverts to Free tier → paid features gated. | Send cancellation webhook → verify tier downgrade → verify Storm Mode returns paywall. |
| Stripe Webhook (Signature) | Webhook with invalid signature is rejected with 400. | Send request with tampered `stripe-signature` header → verify rejection. |
| PayRex (GCash/Maya) | Payment intent created → user pays → callback received → tier activated. | Create payment → simulate success callback → verify tier activation. |
| Tier Feature Gating | Free users: no Storm Mode, no AI Tutor, limited quiz items. Camp users: full quiz + analytics. Insurance: everything. | Authenticate as each tier → attempt to access gated endpoints → verify correct 200/403 responses. |

### P1 — AI RAG Pipeline

| **Flow** | **What to Test** | **How** |
| --- | --- | --- |
| Vector Search → LLM | Query → pgvector/Pinecone search → LLM response contains ONLY sourced content with clickable citation badges. | Ask known question → verify response matches Wiki source → verify citation `topic_id` is correct. |
| "I Don't Know" Protocol | Question about topic NOT in Wiki database → AI responds with "I don't have that information" + redirect to nearest subject node. | Ask question about unindexed topic → verify fallback response. |
| Auditor LLM (Double-Pass) | Secondary LLM catches hallucinated building code numbers, dates, or legal citations. | Inject test case where primary LLM output includes a fabricated code number → verify Auditor flags it. |
| Socratic Mode (During Quiz) | When triggered during active quiz, AI guides with questions instead of direct answers. | Send quiz-context request → verify response contains no direct answer, only guiding questions. |
| Temperature Enforcement | LLM is configured at temperature 0.0 — responses are deterministic for identical inputs. | Send same query 5 times → verify identical or near-identical responses. |

### P1 — Content Pipeline

| **Flow** | **What to Test** | **How** |
| --- | --- | --- |
| Wiki Capture → Notes | Highlighted Wiki text captured with correct `topic_id`, source badge, block structure, and formatting. | Simulate highlight capture → verify note block in database matches source content and metadata. |
| Cloze Deletion Creation | User highlights word → "Hide" converts to active recall flashcard → stores correctly. | Create cloze → verify stored block has hidden word, reveal trigger, and source reference. |
| Quiz Rationale → Note Capture | Saving a rationale from quiz feedback preserves the full explanation, correct answer, and Teleport Link. | Capture rationale → verify all fields stored → verify Teleport Link resolves to correct Wiki paragraph. |
| Taxonomy Integrity | Every quiz question and Wiki article has a valid `topic_id`. No orphan content. | Query all content → JOIN against taxonomy table → verify zero NULLs. |

---

## 🌐 Layer 3: E2E Tests (Playwright)

Full browser-based tests simulating real user flows. These are the slowest tests — run only critical paths, and run them in CI on every PR.

### Configuration

```tsx
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './src/e2e',
  timeout: 60_000,
  retries: 2,
  fullyParallel: true,
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 7'] } },
    { name: 'mobile-safari', use: { ...devices['iPhone 14'] } },
  ],
  webServer: {
    command: 'bun dev',
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },
})
```

### Critical User Flows

| **Scenario** | **Steps** | **Expected Outcome** |
| --- | --- | --- |
| **Onboarding → First Score** | Sign up → forced 10-item diagnostic quiz → submit → see Readiness Score + heatmap | Score renders within 2s of submission. Heatmap nodes colored correctly. Red nodes visible. |
| **Camp Mode Full Run** | Select topic → start 10-item quiz → answer all → check rationale on wrong answer → click Teleport Link | Instant feedback per question. Rationale drawer opens. Teleport Link opens correct Wiki paragraph in peek view. |
| **Storm Mode Full Run** | Select 100 items → start timer → answer all → submit → review scorecard | No feedback during test. Timer accurate to ±1 second. Scorecard shows per-topic breakdown. |
| **Auto-Save Recovery** | Start Storm Mode → answer 20 items → flag 3 → close browser → reopen → resume | All 20 answers preserved. 3 flags preserved. Timer resumes from correct position. |
| **3D Lab Parametric** | Open 3D Lab → adjust FAR slider beyond legal limit → observe red geometry + code citation tooltip | Model updates in real-time. Tooltip cites exact building code section. Click opens Wiki reference. |
| **Notes Capture Flow** | Read Wiki article → highlight text → click "Capture" → open Notes → verify note with Source Badge | Note appears with correct formatting, `topic_id` tag, and clickable Source Badge linking back to Wiki origin. |
| **Cross-Device Sync** | Capture note on desktop viewport → switch to mobile viewport → verify note appears | Block structure intact. Source Badge functional. No data loss. |
| **Payment Upgrade** | Free user → click Storm Mode → paywall appears → complete Stripe checkout → Storm Mode unlocked | Paywall renders with correct pricing. After payment, page reloads with Storm Mode accessible. No double-charge. |
| **Omnibar Search** | Press Cmd+K → type partial query → select result → navigate to correct page | Results appear in <100ms. Typo tolerance works. Navigation lands on correct Wiki article or topic. |
| **Blindspot Protocol** | Complete quiz with red nodes → dashboard shows Blindspot queue → complete queue → node reclassifies | Queue targets correct weak nodes. Post-completion, at least one node moves from Red → Amber on heatmap. |

**Example E2E Test (Auto-Save Recovery):**

```tsx
import { test, expect } from '@playwright/test'

test('quiz auto-save survives browser close and restores exact state', async ({ page, context }) => {
  // Login
  await page.goto('/auth/login')
  await page.fill('[name="email"]', 'test@slatecamp.com')
  await page.fill('[name="password"]', 'testpassword123')
  await page.click('button[type="submit"]')
  await page.waitForURL('/dashboard')

  // Start a Storm Mode quiz
  await page.goto('/dashboard/testing')
  await page.click('[data-testid="start-storm-mode"]')
  await page.waitForSelector('[data-testid="quiz-question"]')

  // Answer 5 questions and flag 2
  for (let i = 0; i < 5; i++) {
    await page.click(`[data-testid="option-${i % 4}"]`)
    if (i === 1 || i === 3) {
      await page.click('[data-testid="flag-toggle"]')
    }
    await page.click('[data-testid="next-question"]')
  }

  // Wait for auto-save (10 second interval)
  await page.waitForTimeout(12_000)

  // Record current state
  const timerText = await page.textContent('[data-testid="quiz-timer"]')

  // Simulate browser crash by closing context
  const cookies = await context.cookies()
  await page.close()

  // Reopen and resume
  const newPage = await context.newPage()
  await newPage.goto('/dashboard/testing')

  // Verify resume prompt appears
  await expect(newPage.locator('[data-testid="resume-quiz-prompt"]')).toBeVisible()
  await newPage.click('[data-testid="resume-quiz"]')

  // Verify state restored
  const questionNumber = await newPage.textContent('[data-testid="question-counter"]')
  expect(questionNumber).toContain('6') // should be on question 6

  // Verify flags preserved
  await newPage.click('[data-testid="question-grid"]')
  const flaggedItems = await newPage.locator('[data-testid="flagged-item"]').count()
  expect(flaggedItems).toBe(2)
})
```

---

## 🔴 Critical Path Tests (Deployment Gate)

These tests **must pass** before any deployment to production. Failures block the CI pipeline.

- [ ]  **Quiz auto-save survives browser crash** — close tab mid-quiz, reopen, verify exact state restored (answers, flags, timer)
- [ ]  **Full quiz payload loads offline** — disconnect after payload fetch, complete entire quiz, reconnect, submit successfully
- [ ]  **RLS prevents cross-user data access** — authenticate as User A, attempt to read User B's mastery data via direct query, verify empty result
- [ ]  **Readiness Score accuracy** — submit known quiz data, verify calculated score matches expected value within ±0.1%
- [ ]  **EMA weighting correctness** — verify recent scores are weighted higher than historical scores by the correct exponential factor
- [ ]  **AI Tutor returns ONLY sourced content** — ask about topic not in Wiki, verify "I don't know" fallback fires
- [ ]  **Auditor LLM catches hallucination** — inject fabricated building code number, verify Auditor flags it before response delivery
- [ ]  **Stripe webhook → tier gating** — verify free user cannot access Storm Mode; paid user can; cancelled user reverts
- [ ]  **PayRex callback → tier activation** — verify GCash/Maya payment success callback activates correct subscription tier
- [ ]  **Heatmap boundary values** — verify 85% → Green, 84% → Yellow, 60% → Yellow, 59% → Red, 0 attempts → Grey

---

## 📊 Performance Benchmarks

| **Metric** | **Target** | **Tool** | **Frequency** |
| --- | --- | --- | --- |
| Largest Contentful Paint (LCP) | < 1.5s | Lighthouse CI | Every PR |
| First Input Delay (FID) | < 50ms | Lighthouse CI | Every PR |
| Cumulative Layout Shift (CLS) | < 0.05 | Lighthouse CI | Every PR |
| Time to Interactive (TTI) | < 2s | Lighthouse CI | Every PR |
| Wiki page load (SSG) | < 100ms | CDN cache-hit monitoring | Continuous |
| 3D Lab initial load | < 3s | React Suspense boundary timing | Every PR with 3D changes |
| 3D Lab frame rate | 60 FPS (standard laptop) | Three.js stats monitor | Manual on 3D changes |
| Quiz payload fetch (200 items) | < 500ms | Network waterfall | Every PR with API changes |
| Auto-save round trip | < 200ms | Supabase insert latency | Continuous |
| AI Tutor response (full pipeline) | < 3s | End-to-end timing | Every PR with AI changes |
| Omnibar search results | < 100ms | Search index query time | Every PR with search changes |
| JS bundle size (main) | < 250 KB (gzipped) | `ANALYZE=true bun run build` | Weekly |

### Performance Test Script

```bash
# Run Lighthouse CI against local dev server
bunx @lhci/cli autorun --config=lighthouserc.json

# Analyze bundle size
ANALYZE=true bun run build

# Profile 3D Lab performance
# Open Chrome DevTools → Performance tab → Record while interacting with 3D Lab
```

---

## ♿ Accessibility Testing

SlateCamp must be accessible to all users, including those using screen readers or keyboard-only navigation.

### Standards

- **WCAG 2.1 Level AA** compliance minimum
- All interactive elements reachable via keyboard (`Tab`, `Enter`, `Escape`)
- Color is never the sole indicator of meaning (heatmap nodes use color + pattern/label)
- Focus indicators visible on all interactive elements (never remove `outline`)
- All images have descriptive `alt` text
- Form inputs have associated `<label>` elements

### Automated Checks

| **Tool** | **What It Checks** | **When** |
| --- | --- | --- |
| `eslint-plugin-jsx-a11y` | Missing `alt` text, missing labels, invalid ARIA attributes, non-interactive element handlers | Every lint run (blocks PR) |
| axe-core (Playwright) | Full WCAG 2.1 AA scan of rendered pages — color contrast, heading hierarchy, landmark regions | E2E test suite |
| Lighthouse Accessibility | Accessibility score (target: ≥ 90) | Every PR via Lighthouse CI |

### Manual Checks (Monthly)

- [ ]  Complete quiz flow using keyboard only (no mouse)
- [ ]  Navigate Wiki article using screen reader (VoiceOver/NVDA)
- [ ]  Verify heatmap is understandable without color (labels, patterns)
- [ ]  Check all focus traps in modals (Cmd+K palette, AI Tutor drawer, quiz grid)
- [ ]  Verify dark mode maintains contrast ratios

**Accessibility E2E Test Example:**

```tsx
import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test('dashboard has no accessibility violations', async ({ page }) => {
  await page.goto('/dashboard')
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze()
  expect(results.violations).toEqual([])
})
```

---

## 🔒 Security Testing

| **Threat** | **Test** | **Layer** |
| --- | --- | --- |
| XSS via Wiki Content | Inject `<script>alert('xss')</script>` into Wiki markdown → verify it's sanitized by DOMPurify | Unit |
| XSS via Notes Input | Paste malicious HTML into TipTap editor → verify sanitized on save and on render | Integration |
| SQL Injection (Supabase) | Pass `'; DROP TABLE users; --` as quiz answer → verify parameterized query rejects it | Integration |
| IDOR (Insecure Direct Object Reference) | Modify quiz session ID in URL to another user's session → verify 403 / empty result | Integration |
| RLS Bypass | Use `service_role` key patterns to test that anon key cannot bypass RLS policies | Integration |
| Stripe Webhook Spoofing | Send webhook with invalid `stripe-signature` → verify 400 rejection | Integration |
| Rate Limiting (Auth) | Send 20 rapid login attempts → verify rate limit kicks in after threshold | Integration |
| Rate Limiting (AI Tutor) | Send 50 rapid AI queries → verify rate limit response after threshold | Integration |
| Client Bundle Secrets | Build production bundle → grep for `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY` → verify zero matches | CI |
| CSP Headers | Verify `Content-Security-Policy` header present on production responses and blocks inline scripts | E2E |

---

## 🏗️ Feature-Specific Test Plans

### Quiz Engine

- **Camp Mode Tests**
    - Selecting a topic tree generates correct number of quiz items
    - Each question renders with all 4 options
    - Selecting an answer shows immediate green/red feedback
    - Wrong answer expands rationale drawer with SME explanation
    - Teleport Link navigates to exact Wiki paragraph without leaving quiz context
    - "Flag for Review" toggles correctly and persists across questions
    - Question grid navigator reflects answered/unanswered/flagged states
    - Strike-through on option removes it visually but doesn't auto-select
    - Completing quiz shows summary with per-topic breakdown
    - Analytics tables update within 5 seconds of submission

### 3D Lab

- **3D Rendering Tests**
    - Canvas renders at 60 FPS on standard laptop (Intel UHD / M1 baseline)
    - Parametric sliders update geometry in real-time (< 16ms per frame)
    - Exceeding legal limits changes geometry color to red + shows code citation
    - X-Ray mode progressively strips building layers
    - Cutaway modifier reveals internal MEPFS systems
    - Hotspot click opens correct Wiki reference in peek drawer
    - Guided Tour plays cinematic fly-through without frame drops
    - 3D Lab lazy-loads via React Suspense (does not block dashboard load)
    - Canvas adapts to viewport resize without distortion
    - Camera controls (orbit, pan, zoom) work on both desktop and touch devices

### Analytics Dashboard

- **Heatmap & Scoring Tests**
    - Taxonomy Heatmap renders all nodes with correct color-coding
    - Node Inspector opens on click with historical accuracy graph
    - Readiness Score displays correct value after quiz submission
    - Score recalculates when Proof Simulation data is added (pressure-tested component)
    - Pacing Gauge shows correct items/minute rate
    - Pacing warning appears when projected pace would leave items blank
    - "Fix It" button generates quiz targeting only Red nodes
    - Endurance window metric updates after Endurance Cycle completion
    - Blindspot Protocol queue appears at dashboard top with correct targeting
    - All charts (Recharts) render without errors and are responsive

### Notes & Workspace

- **Notes System Tests**
    - Highlight-to-Capture from Wiki preserves formatting and `topic_id`
    - Highlight-to-Capture from Quiz rationale preserves explanation + Teleport Link
    - 3D Lab snapshot-to-notes stores image with canvas label
    - Block editor supports all TipTap operations (bold, italic, lists, headings, code)
    - Cloze deletion creates functional flashcard with reveal toggle
    - Split-pane view renders notes alongside Wiki/Quiz without layout break
    - Cross-subject cheat sheet allows dragging blocks from different topics
    - Source Badge on every captured block links back to origin
    - Notes sync across devices within 5 seconds
    - Deleting a note removes it from all views and database

---

## 🔄 CI Pipeline Integration

### GitHub Actions Test Matrix

```yaml
# .github/workflows/test.yml
name: Test Suite
on: [push, pull_request]

jobs:
  lint-and-typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - run: bun install --frozen-lockfile
      - run: bun run lint
      - run: bun run type-check

  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - run: bun install --frozen-lockfile
      - run: bun test --coverage

  integration-tests:
    runs-on: ubuntu-latest
    services:
      supabase:
        image: supabase/postgres
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - run: bun install --frozen-lockfile
      - run: bunx supabase db reset
      - run: bun test --filter integration

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - run: bun install --frozen-lockfile
      - run: bunx playwright install --with-deps
      - run: bun run build
      - run: bunx playwright test
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/

  lighthouse:
    runs-on: ubuntu-latest
    needs: [unit-tests]
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - run: bun install --frozen-lockfile
      - run: bun run build
      - run: bunx @lhci/cli autorun
```

### What Blocks Deployment

| **Check** | **Blocks PR Merge?** | **Blocks Production Deploy?** |
| --- | --- | --- |
| ESLint (zero warnings) | Yes | Yes |
| TypeScript (zero errors) | Yes | Yes |
| Unit tests (all pass) | Yes | Yes |
| Integration tests (all pass) | Yes | Yes |
| E2E critical paths (all pass) | Yes | Yes |
| Lighthouse performance (LCP < 1.5s) | Warning only | No (monitored) |
| Lighthouse accessibility (≥ 90) | Warning only | No (monitored) |
| Bundle size (< 250 KB gzip) | Warning only | No (monitored) |

---

## 📈 Coverage Targets

| **Area** | **Target** | **Rationale** |
| --- | --- | --- |
| Scoring algorithms (`src/lib/scoring/`) | **95%+** | This is the core product. Incorrect scores destroy trust. |
| Zod validation schemas | **90%+** | Data integrity gate. Every edge case matters. |
| API routes / Server Actions | **80%+** | Entry points for all user data. Must handle errors gracefully. |
| Utility functions (`src/lib/`) | **80%+** | Shared across features. Bugs here cascade everywhere. |
| UI components (`src/components/`) | **60%+** | Test interactive behavior and accessibility. Skip pure layout. |
| E2E critical paths | **100% of listed scenarios** | Every critical flow in the table above must have a passing test. |
| **Overall project** | **75%+** | Healthy baseline that doesn't incentivize testing for coverage's sake. |

<aside>
⚠️

**Coverage is a metric, not a goal.** 100% coverage with shallow assertions is worse than 75% coverage with meaningful tests. Every test should answer: *"If this test fails, what real user problem did we catch?"*

</aside>

---

## ✅ Testing Checklist (Before Every PR)

- [ ]  New business logic has unit tests with edge cases
- [ ]  New API routes / Server Actions have integration tests
- [ ]  Zod schemas have validation tests (valid + invalid inputs)
- [ ]  No `test.skip` or `test.todo` left without a tracking issue
- [ ]  All tests pass locally: `bun test`
- [ ]  No flaky tests introduced (run 3x to confirm stability)
- [ ]  E2E tests updated if user flow changed
- [ ]  Accessibility: `eslint-plugin-jsx-a11y` passes
- [ ]  No `console.log` in test files (use assertions, not print debugging)
- [ ]  Test descriptions are human-readable plain English
- [ ]  Mocks are minimal — prefer real implementations where practical