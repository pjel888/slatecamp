# SlateCamp — Testing & QA

## 🎯 Testing Philosophy
SlateCamp handles high-stakes professional data. Our testing mandate is **Zero-Data-Loss**: users must be able to resume a 4-hour exam from the exact second they left off after a crash.

## 🛠️ Testing Toolchain
*   **Unit Tests**: Bun Test (Native, fastest, P0 for scoring logic).
*   **Component Tests**: React Testing Library + Bun Test.
*   **Integration Tests**: Bun Test + Supabase Local (Docker) — verifying RLS and Server Actions.
*   **E2E Tests**: Playwright — verifying critical paths (Onboarding, Storm Mode, Payments).
*   **Performance**: Lighthouse CI (Target: LCP < 1.5s, TTI < 2s).
*   **Accessibility**: axe-core + eslint-plugin-jsx-a11y (Target: WCAG 2.1 AA).

## 📁 Critical Path Coverage
The following modules **must** have 95%+ test coverage:
1.  **Scoring Engine (`src/lib/scoring/`)**: EMA weighting, IRT difficulty, and Lucky Guess detection.
2.  **Data Persistence**: Auto-save (10s interval) and offline queue sync.
3.  **Auth & Security**: Supabase RLS policies and Server Action validation.
4.  **AI RAG Pipeline**: Citation accuracy and hallucination auditing.

## 🧪 Running Tests
```bash
# Run all unit/integration tests
bun test

# Run tests with coverage
bun test --coverage

# Run E2E tests (requires dev server)
bunx playwright test

# Run accessibility audit
bunx playwright test --grep accessibility
```

## 🔴 Deployment Gate (Pre-PR Checklist)
- [ ] `bun run lint` passes zero warnings.
- [ ] `bun run type-check` passes zero errors.
- [ ] All `bun test` suites pass locally.
- [ ] Auto-save recovery verified in E2E.
- [ ] RLS policies verified against cross-user data access.
