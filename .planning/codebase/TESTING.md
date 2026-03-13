# SlateCamp Testing Practices

This document outlines the testing philosophy, toolchain, and coverage targets for the **SlateCamp** project.

---

## 🎯 Testing Philosophy

SlateCamp handles **high-stakes exam data**. Testing is not optional; it is critical infrastructure.

- **Test behavior, not implementation**: Verify *what* the code does, not *how*.
- **Critical path first**: Protect user data, scoring accuracy, and payments.
- **Zero-Data-Loss Mandate**: Critical sessions must survive crashes (test auto-save/recovery).
- **Tests are documentation**: Well-named tests describe the system's expected behavior.

---

## 🛠️ Testing Toolchain

| **Layer** | **Tool** | **Description** |
| --- | --- | --- |
| **Unit Tests** | **Bun Test** | Pure logic, scoring algorithms, utility functions. Fast and Jest-compatible. |
| **Component Tests** | **React Testing Library** | Component interaction and accessibility testing. |
| **Integration Tests** | **Bun Test + Supabase Local** | Server Actions, API routes, and database interactions (RLS). |
| **E2E Tests** | **Playwright** | Full browser flows (onboarding, quiz completion, payments). |
| **Visual Regression** | **Playwright Screenshots** | Catch UI regressions in heatmaps and 3D Lab. |
| **Accessibility** | **axe-core** + **eslint-plugin-jsx-a11y** | WCAG 2.1 AA compliance. |
| **Performance** | **Lighthouse CI** | Core Web Vitals monitoring (LCP < 1.5s). |

---

## 📁 Test Structure

Tests live alongside the code they test (co-located):

```
src/
├── lib/
│   ├── scoring/
│   │   ├── readiness-score.ts
│   │   └── readiness-score.test.ts      ← Unit test
├── components/
│   ├── dashboard/
│   │   ├── HeatmapNode.tsx
│   │   └── HeatmapNode.test.tsx         ← Component test
└── e2e/                                 ← E2E tests (root level)
    ├── onboarding.spec.ts
    └── quiz-flow.spec.ts
```

---

## 🔬 Testing Layers

### Layer 1: Unit Tests (Fast & Isolated)
- **Scoring Engine**: EMA (Exponential Moving Average), IRT (Item Response Theory), Pacing.
- **Validation**: Zod schemas for quiz submissions and user profiles.
- **Utilities**: `cn()` helper, formatters, taxonomy mappers.

### Layer 2: Integration Tests (Real Environments)
- **Data Pipeline**: Auto-save persistence, resume state after disconnect.
- **Auth & RLS**: Verifying User A cannot access User B's data via Supabase.
- **Payments**: Stripe and PayRex webhooks/callbacks.
- **AI RAG**: LLM deterministic responses (Temperature 0.0) and citation validation.

### Layer 3: E2E Tests (Playwright)
- Onboarding flow to first Readiness Score.
- Full quiz session (Camp & Storm modes).
- 3D Lab interactions and parametric updates.
- Note capture from Wiki/Rationale.

---

## 📈 Coverage Targets

| Area | Target | Rationale |
| --- | --- | --- |
| **Scoring Algorithms** | **95%+** | Core product reliability. |
| **Zod Schemas** | **90%+** | Data integrity gate. |
| **API / Server Actions** | **80%+** | User data entry points. |
| **Overall Project** | **75%+** | Healthy quality baseline. |

---

## 🔴 Deployment Gate (Mandatory)

Before merging any PR or deploying to production, the following must pass:
1. **Lint & Typecheck**: Zero warnings/errors.
2. **Unit & Integration**: All tests pass locally.
3. **E2E Critical Paths**: Onboarding, Quiz, Auto-save Recovery.
4. **Accessibility**: No violations (WCAG 2.1 AA).
5. **Security**: Webhook signatures, RLS verification, XSS sanitization.

---

## 🚀 Running Tests

```bash
# Run unit & integration tests
bun test

# Run tests with coverage
bun test --coverage

# Run E2E tests
bunx playwright test

# Interactive E2E debugging
bunx playwright test --ui
```
