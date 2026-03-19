# Testing Patterns

**Analysis Date:** 2026-03-19

## Test Framework

**Runner:**
- Framework: Bun built-in test runner (`bun:test`)
- Config: No separate config file; tests discovered by `*.test.ts` / `*.test.tsx` suffix
- Version: Bun 1.x (latest)

**Assertion Library:**
- `bun:test` provides `expect()` matcher (similar to Jest/Vitest)
- Matchers: `toBeCloseTo()`, `toBeGreaterThan()`, `toBeLessThan()`, `toBe()`, `expect(...).toBe()`

**Run Commands:**
```bash
bun test                    # Run all tests
bun test --watch            # Watch mode
bun test --coverage         # Coverage report (if configured)
```

## Test File Organization

**Location:**
- Co-located in source tree (not separate `test/` directory)
- Example: `src/lib/srs/irt.ts` pairs with `src/lib/srs/irt.test.ts`
- Example: `src/app/dashboard/3d-lab/_utils/nbcpCalculator.ts` pairs with `src/app/dashboard/3d-lab/_utils/nbcpCalculator.test.ts`

**Naming:**
- Source file + `.test.ts` suffix (e.g., `quiz.test.ts`, `irt.test.ts`)
- Not `.spec.ts`; always `.test.ts`

**Structure:**
```
src/
├── lib/
│   ├── srs/
│   │   ├── irt.ts
│   │   └── irt.test.ts          ← Co-located
│   ├── actions/
│   │   ├── quiz.ts
│   │   └── quiz.test.ts
├── app/
│   └── dashboard/
│       └── 3d-lab/
│           ├── _utils/
│           │   ├── nbcpCalculator.ts
│           │   └── nbcpCalculator.test.ts
│           └── _components/
│               └── QuizRenderer.tsx
└── components/
    └── dashboard/
        ├── QuizRenderer.test.tsx
        └── QuizRenderer.tsx
```

## Test Structure

**Suite Organization:**
```typescript
import { expect, test, describe } from "bun:test";

describe("IRT Algorithm", () => {
  test("probabilityCorrect should return ~0.5 when theta equals difficulty", () => {
    const p = probabilityCorrect(0.5, 1.0, 0.5);
    expect(p).toBeCloseTo(0.5);
  });

  test("updateTheta should increase theta on correct answer", () => {
    // Setup
    const q: Question = { /* ... */ };

    // Execute
    const newTheta = updateTheta(0.5, q, true);

    // Assert
    expect(newTheta).toBeGreaterThan(0.5);
  });
});
```

**Patterns:**
- `describe()` for logical grouping of related tests
- `test()` for individual test cases (not `it()`)
- Flat structure: No deeply nested describes
- Comments for Arrange-Act-Assert flow (implicit, not explicit)

**Setup/Teardown:**
```typescript
import { describe, test, expect, beforeEach, afterEach } from "bun:test";

describe("Quiz State", () => {
  let store: Record<string, string> = {};

  beforeEach(() => {
    store = {};  // Clear before each test
  });

  afterEach(() => {
    // Cleanup if needed
  });

  test("should persist data", () => {
    // Uses fresh store from beforeEach
  });
});
```

## Mocking

**Framework:** None observed; tests use pure functions or simple test doubles

**Patterns:**

**localStorage Mock (for DOM-less Node environment):**
```typescript
const _store: Record<string, string> = {};
const localStorage = {
  getItem: (k: string) => _store[k] ?? null,
  setItem: (k: string, v: string) => { _store[k] = v },
  removeItem: (k: string) => { delete _store[k] },
  clear: () => { Object.keys(_store).forEach((k) => delete _store[k]) },
};
```

**Test Data Construction:**
```typescript
const inputs: NBCPInputs = {
  lotWidth: 50,
  lotDepth: 80,
  zoningClass: ZoningClass.R3,
  lotType: LotType.INSIDE,
  rrowWidth: 15,
  floorHeight: 3.0,
  firewalls: NO_FIREWALLS,
  floorsOverride: 0,
};

const result = calculateEnvelope(inputs);
```

**Constants for Test Data:**
```typescript
const NO_FIREWALLS = { front: false, rear: false, left: false, right: false };
```

**What to Mock:**
- Local browser APIs (localStorage, sessionStorage) — create lightweight mocks
- External APIs — NOT mocked; tests stay in `src/` and test pure logic
- Database calls — NOT tested; server actions are integration-tested via client

**What NOT to Mock:**
- Supabase calls (not tested at unit level)
- External HTTP requests (not tested at unit level)
- Third-party libraries used correctly (use real implementations)

## Fixtures and Factories

**Test Data:**
```typescript
const q: Question = {
  question_id: "q1",
  topic_id: "t1",
  text: "Test",
  options: [],
  rationale: null,
  difficulty: 0.5,
  difficulty_rating: 0.5,
  discrimination_rating: 1.0,
  created_at: new Date().toISOString()
};
```

**Location:**
- Inline within test file (no separate fixtures directory)
- Reusable test constants defined at top of file:
  ```typescript
  const NO_FIREWALLS = { front: false, rear: false, left: false, right: false };
  ```

**Factories:**
- Not observed; tests construct objects inline with necessary properties

## Coverage

**Requirements:** Not enforced; no coverage thresholds in config

**View Coverage:**
```bash
bun test --coverage  # If coverage tooling available
```

**Observed practice:**
- Focus on algorithmic units (IRT scoring, building envelope calculations, state logic)
- Component rendering (e.g., `QuizRenderer.test.tsx`) tested via pure logic mirrors, not DOM rendering

## Test Types

**Unit Tests:**
- Scope: Pure functions in `src/lib/` (algorithms, calculations, state transitions)
- Approach: Test function with specific inputs, assert output matches expectation
- Example: IRT probability calculation, building code envelope calculator
- Coverage: All branches of conditional logic

**Integration Tests:**
- Scope: Rare; not observed in codebase
- Approach: N/A

**E2E Tests:**
- Framework: Not used
- Approach: Not applicable (app uses server actions + client rendering; manual testing in dev)

## Common Patterns

**Async Testing:**
```typescript
test("updateTheta should increase theta on correct answer", async () => {
  const q: Question = { /* ... */ };
  const newTheta = updateTheta(0.5, q, true);  // Synchronous (no async in this lib)
  expect(newTheta).toBeGreaterThan(0.5);
});
```
*Note: Most tests are synchronous; async patterns not heavily exercised in test suite.*

**Error Testing:**
```typescript
// Test for boundaries and edge cases
test("probabilityCorrect should handle zero discrimination", () => {
  // a = 0 → P(correct) = 0.5 always
  const p = probabilityCorrect(0.5, 0, 0.5);
  expect(p).toBeCloseTo(0.5);
});

test("selectNextQuestion should return null when all answered", () => {
  const questions: Question[] = [ /* ... */ ];
  const answeredAll = new Set(questions.map(q => q.question_id));
  const next = selectNextQuestion(0.5, questions, answeredAll);
  expect(next).toBe(null);
});
```

**State Logic Mirroring:**
```typescript
// Test file mirrors exact component logic to catch divergence
function getOptionState(
  optionId: string,
  correctOptionId: string,
  selectedAnswer: string | undefined,
  struckSet: Set<string>,
  isChecked: boolean,
): OptionState {
  const isSelected = selectedAnswer === optionId;
  const isCorrect = optionId === correctOptionId;
  const isStruck = struckSet.has(optionId);

  if (!isChecked) {
    if (isSelected) return 'selected';
    if (isStruck) return 'struck';
    return 'default';
  }
  if (isCorrect) return 'correct';
  if (isSelected && !isCorrect) return 'wrong';
  return 'faded';
}

describe("getOptionState — pre-check", () => {
  const correct = 'opt-a';
  const wrong = 'opt-b';

  test("unselected, unchosen option is 'default'", () => {
    expect(getOptionState(wrong, correct, undefined, new Set(), false))
      .toBe('default');
  });
});
```

## Test Examples by File

**`src/lib/srs/irt.test.ts` — Algorithmic Unit Tests:**
- Tests IRT probability, theta updates, question selection
- Uses inline fixture objects
- Asserts numerical relationships (`toBeGreaterThan`, `toBeCloseTo`)

**`src/app/dashboard/3d-lab/_utils/nbcpCalculator.test.ts` — Domain Logic Tests:**
- Tests building code envelope calculations
- Organized by scenario (Scenario A, B, C)
- Descriptive test names matching calculations in comments above
- Extensive assertion chains for complex results

**`src/components/dashboard/QuizRenderer.test.tsx` — Component Logic Tests:**
- Tests mirrored state logic (option states, score computation, response parsing)
- localStorage mock for session persistence
- No DOM rendering; pure function logic validation

---

*Testing analysis: 2026-03-19*
