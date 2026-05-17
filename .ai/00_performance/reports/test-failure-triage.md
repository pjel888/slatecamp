# Test Triage Report — 14 Failing Unit Tests

**Generated:** 2026-05-04
**Branch:** codebase-modernization-batch1-2
**Runner:** bun test v1.3.10
**Overall Results:** 698 pass / 14 fail / 14 errors / 5203 expect() calls across 97 files

---

## Executive Summary

All 14 failures are **identical in root cause**: Playwright e2e test files (`.spec.ts`) are being loaded by `bun test`, but they use `@playwright/test` APIs (`test.describe()`) which cannot execute under bun's test runner. This is a **test-runner mismatch**, not an application code defect.

The project's `package.json` test script is `bun test src/` — which correctly scopes to `src/` and would exclude `e2e/`. The 14 failures only occur when running `bun test` with no directory argument, causing bun to crawl the entire tree including `e2e/`.

**Zero production impact. All 14 are false failures.**

---

## Root Cause Analysis

- **Category:** env / test configuration
- **Mechanism:** bun test by default discovers `*.test.ts`, `*.spec.ts`, `*.test.tsx`, `*.spec.tsx` files. The 14 e2e Playwright spec files match `*.spec.ts`.
- **Fix:** Either (a) always run `bun test src/` as the package.json script does, (b) add a `bunfig.toml` with test.exclude patterns for `e2e/`, or (c) rename e2e files to avoid `.spec.ts` extension (unlikely — Playwright config depends on that pattern).
- **Fixability:** Easy (use correct CLI invocation or add bunfig.toml exclusion).
- **Deterministic:** Yes — every run produces the same 14 failures.

---

## Detailed Per-File Triage

### 1. e2e/authenticated-demo-3d-lab.spec.ts
- **Test name:** (module load — never reaches describe blocks)
- **Failure type:** LoadError / RunnerIncompat
- **Error:** `Playwright Test did not expect test.describe() to be called here.`
- **Root cause category:** env
- **Fixability:** easy
- **Production impact:** none
- **Notes:** Line 8:6 — `test.describe('Authenticated Demo - 3D Lab', ...)`

### 2. e2e/wiki-learning.spec.ts
- **Test name:** (module load)
- **Failure type:** LoadError / RunnerIncompat
- **Error:** `Playwright Test did not expect test.describe() to be called here.`
- **Root cause category:** env
- **Fixability:** easy
- **Production impact:** none
- **Notes:** Line 8:6

### 3. e2e/ceo-portal.spec.ts
- **Test name:** (module load)
- **Failure type:** LoadError / RunnerIncompat
- **Error:** `Playwright Test did not expect test.describe() to be called here.`
- **Root cause category:** env
- **Fixability:** easy
- **Production impact:** none
- **Notes:** Line 10:6

### 4. e2e/access-boundaries.spec.ts
- **Test name:** (module load)
- **Failure type:** LoadError / RunnerIncompat
- **Error:** `Playwright Test did not expect test.describe() to be called here.`
- **Root cause category:** env
- **Fixability:** easy
- **Production impact:** none
- **Notes:** Line 36:6

### 5. e2e/quiz-real-user-flow.spec.ts
- **Test name:** (module load)
- **Failure type:** LoadError / RunnerIncompat
- **Error:** `Playwright Test did not expect test.describe() to be called here.`
- **Root cause category:** env
- **Fixability:** easy
- **Production impact:** none
- **Notes:** Line 51:6

### 6. e2e/admin-permissions-developer.spec.ts
- **Test name:** (module load)
- **Failure type:** LoadError / RunnerIncompat
- **Error:** `Playwright Test did not expect test.describe() to be called here.`
- **Root cause category:** env
- **Fixability:** easy
- **Production impact:** none
- **Notes:** Line 9:6

### 7. e2e/authenticated-demo.spec.ts
- **Test name:** (module load)
- **Failure type:** LoadError / RunnerIncompat
- **Error:** `Playwright Test did not expect test.describe() to be called here.`
- **Root cause category:** env
- **Fixability:** easy
- **Production impact:** none
- **Notes:** Line 8:6

### 8. e2e/launch-smoke.spec.ts
- **Test name:** (module load)
- **Failure type:** LoadError / RunnerIncompat
- **Error:** `Playwright Test did not expect test.describe() to be called here.`
- **Root cause category:** env
- **Fixability:** easy
- **Production impact:** none
- **Notes:** Line 62:6

### 9. e2e/learning-flow.spec.ts
- **Test name:** (module load)
- **Failure type:** LoadError / RunnerIncompat
- **Error:** `Playwright Test did not expect test.describe() to be called here.`
- **Root cause category:** env
- **Fixability:** easy
- **Production impact:** none
- **Notes:** Line 7:6

### 10. e2e/authenticated-demo-restricted.spec.ts
- **Test name:** (module load)
- **Failure type:** LoadError / RunnerIncompat
- **Error:** `Playwright Test did not expect test.describe() to be called here.`
- **Root cause category:** env
- **Fixability:** easy
- **Production impact:** none
- **Notes:** Line 16:6

### 11. e2e/admin-permissions-content-admin.spec.ts
- **Test name:** (module load)
- **Failure type:** LoadError / RunnerIncompat
- **Error:** `Playwright Test did not expect test.describe() to be called here.`
- **Root cause category:** env
- **Fixability:** easy
- **Production impact:** none
- **Notes:** Line 8:6

### 12. e2e/admin-permissions-sme-reviewer.spec.ts
- **Test name:** (module load)
- **Failure type:** LoadError / RunnerIncompat
- **Error:** `Playwright Test did not expect test.describe() to be called here.`
- **Root cause category:** env
- **Fixability:** easy
- **Production impact:** none
- **Notes:** Line 8:6

### 13. e2e/authenticated-demo-portals.spec.ts
- **Test name:** (module load)
- **Failure type:** LoadError / RunnerIncompat
- **Error:** `Playwright Test did not expect test.describe() to be called here.`
- **Root cause category:** env
- **Fixability:** easy
- **Production impact:** none
- **Notes:** Line 8:6

### 14. e2e/sidebar-navigation.spec.ts
- **Test name:** (module load)
- **Failure type:** LoadError / RunnerIncompat
- **Error:** `Playwright Test did not expect test.describe() to be called here.`
- **Root cause category:** env
- **Fixability:** easy
- **Production impact:** none
- **Notes:** Line 21:6

---

## Failure Type Distribution

| Failure Type | Count |
|---|---|
| LoadError / RunnerIncompat (Playwright test in bun runner) | 14 |

## Root Cause Category Distribution

| Category | Count |
|---|---|
| env (test runner mismatch) | 14 |

## Fixability Summary

| Fixability | Count |
|---|---|
| easy | 14 |

## Production Impact Summary

| Impact | Count |
|---|---|
| none | 14 |

---

## Recommended Fix

**Option A (preferred — already in place):** Always run tests via the package.json script:
```
bun test src/
```
This scopes discovery to `src/` and excludes `e2e/` entirely.

**Option B (defensive):** Add a `bunfig.toml` at the project root:
```toml
[test]
exclude = ["e2e/", "node_modules/"]
```

**Option C (if Playwright files must remain `.spec.ts`):** No code changes needed. The e2e tests are intended for `npx playwright test`, not `bun test`.

---

## Additional Observations

- The test run also surfaced one minor logging artifact: a ZodError in `getSessionQuestions` appears in the output but belongs to a **passing** test that validates error handling — it is not a failure.
- All 698 passing tests are genuine bun-compatible unit/integration tests. None show flakiness or unexpected behavior.
- The `src/lib/srs/update.test.ts` and `src/lib/actions/analytics.test.ts` tests emit log lines for error-path testing (SRS failures, analytics tree query failures) — these are expected test behavior, not failures.
