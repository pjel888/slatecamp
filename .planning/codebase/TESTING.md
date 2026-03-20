# Testing

## Framework

- **Test runner:** Bun (`bun:test`)
- **Assertion:** Bun built-in (`expect`, `describe`, `test`)
- **No Jest/Vitest** — Pure Bun test runner
- **Type definitions:** `src/types/bun-test.d.ts`

## Test Files (11 total)

### SRS / Algorithm Tests
- `src/lib/srs/irt.test.ts` — IRT 2PL model (probability, theta updates, question selection)
- `src/lib/srs/sm2.test.ts` — SM-2 spaced repetition algorithm
- `src/lib/srs/update.test.ts` — SRS state update functions

### Domain Logic Tests
- `src/lib/blindspot/generate-queue.test.ts` — Blindspot queue generation
- `src/lib/rate-limit.test.ts` — In-memory rate limiter
- `src/lib/actions/analytics.test.ts` — Analytics server actions
- `src/lib/actions/dashboard-page.test.ts` — Dashboard page actions
- `src/lib/actions/quiz.test.ts` — Quiz server actions

### 3D Lab Tests
- `src/app/dashboard/3d-lab/_constants/nbcp.test.ts` — NBCP constants
- `src/app/dashboard/3d-lab/_utils/nbcpCalculator.test.ts` — NBCP calculator

### Component Tests
- `src/components/dashboard/QuizRenderer.test.tsx` — Quiz renderer component

## Test Patterns

### Co-location
- Tests are co-located next to source files (`.test.ts` / `.test.tsx` suffix)
- No separate `__tests__` directories
- No `test/` or `tests/` top-level directory

### Style
```typescript
import { expect, test, describe } from "bun:test";
import { functionUnderTest } from "./module";

describe("Module Name", () => {
  test("should do expected behavior", () => {
    const result = functionUnderTest(input);
    expect(result).toBeCloseTo(expected);
  });
});
```

### Mocking
- Minimal mocking — tests focus on pure logic (IRT, SM-2, rate limiting)
- No database mocks in tests (demo mode provides mock Supabase for app-level)
- No HTTP mocking libraries detected

## Coverage

- **Covered:** SRS algorithms (IRT, SM-2), rate limiting, blindspot queue, NBCP calculator
- **Partially covered:** Server actions (analytics, dashboard-page, quiz), QuizRenderer component
- **Not covered:** Middleware, auth flows, API routes, webhooks, AI endpoints, wiki, payments, most components

## Running Tests

```bash
bun test                    # Run all tests
bun test src/lib/srs/       # Run SRS tests only
```

## E2E / Integration Tests

- **None detected** — No Playwright, Cypress, or similar E2E framework
- **No CI test configuration** visible
