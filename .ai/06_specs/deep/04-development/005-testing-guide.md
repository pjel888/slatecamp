# Testing Guide

**Status:** Active
**Version:** 1.0
**Last Updated:** 2026-04-06
**Source-of-Truth:** `CLAUDE.md`, `package.json`

---

## Test Framework

| Tool | Details |
|------|---------|
| Runner | Bun (`bun test`) |
| Config | `bun-test.d.ts` in `src/types/` |
| Test pattern | `*.test.ts`, `*.test.tsx` |
| Location | Co-located with source in `__tests__/` directories |

---

## Running Tests

```bash
bun test              # Run all tests
bun test --watch     # Watch mode (if supported)
bun test src/lib/srs # Run specific test file
```

**Note:** There is no top-level `test` script in `package.json`. Run `bun test` directly.

---

## Current Test Status

| Status | File | Issue |
|--------|------|-------|
| ❌ Failing | `src/lib/quiz/mode-presets.test.ts` | `MODE_PRESETS.camp.navigation.backAllowed` expected `false`, received `true` |

All other tests pass.

---

## Test File Organization

Tests are co-located with source code in `__tests__/` directories:

```
src/
├── lib/
│   ├── srs/
│   │   ├── irt.ts
│   │   └── __tests__/
│   │       └── irt.test.ts
│   ├── quiz/
│   │   └── __tests__/
│   │       └── mode-presets.test.ts  ⚠️ FAILING
│   └── readiness-score.ts
│       └── __tests__/
│           └── readiness-score.test.ts
```

---

## Critical Paths to Test

| Component | File | Why Critical |
|-----------|------|-------------|
| IRT 2PL Model | `src/lib/srs/irt.ts` | All mastery decisions depend on this |
| Readiness Score | `src/lib/readiness-score.ts` | Exam readiness calculation (~330 lines) |
| SM-2 SRS | `src/lib/srs/sm2.ts` | Spaced repetition scheduling |
| Payment webhooks | `src/app/api/webhooks/*` | Financial data integrity |
| Auth flows | `src/lib/auth/` | Security-critical |

---

## Testing Patterns

### Testing IRT Calculations

```typescript
import { describe, it, expect } from 'bun:test'
import { calculateProbability } from '@/lib/srs/irt'

describe('IRT 2PL Model', () => {
  it('returns correct probability for average ability', () => {
    const p = calculateProbability({
      ability: 0,
      difficulty: 0,
      discrimination: 1,
    })
    // P(theta=0, b=0, a=1) = 0.5
    expect(p).toBeCloseTo(0.5, 2)
  })
})
```

### Testing Server Actions

```typescript
import { describe, it, expect, mock } from 'bun:test'

describe('createSession', () => {
  it('creates a session for authenticated user', async () => {
    const mockUser = { id: '123', role: 'user' }

    // Mock dependencies
    mock.module('@/lib/auth', () => ({
      getCurrentUser: () => Promise.resolve(mockUser),
    }))

    const session = await createSession({ mode: 'camp', questionCount: 10 })
    expect(session.success).toBe(true)
  })
})
```

---

## Mock Data

| Source | Location | Purpose |
|--------|----------|---------|
| `data/mock-questions.json` | `src/data/` | Mock question bank |
| `seed/questions.json` | `supabase/seed/` | Seed question data |
| `seed/taxonomy.json` | `supabase/seed/` | Seed taxonomy |

Use these files for consistent test data across the suite.

---

## Coverage Expectations

| Area | Target |
|------|--------|
| Business logic (IRT, SRS, Readiness) | 80% |
| UI components | 60% |
| Server actions | 70% |

---

## Known Issues

### mode-presets.test.ts Failure

**File:** `src/lib/quiz/mode-presets.test.ts`
**Expected:** `MODE_PRESETS.camp.navigation.backAllowed = false`
**Received:** `MODE_PRESETS.camp.navigation.backAllowed = true`

This suggests the default value for `backAllowed` in `camp` mode navigation was recently changed to `true`, but the test was not updated.

**Fix needed:** Update the test assertion to expect `true`, or revert the code change if `false` was the intended behavior.

---

*Source: `CLAUDE.md`, `package.json`*
