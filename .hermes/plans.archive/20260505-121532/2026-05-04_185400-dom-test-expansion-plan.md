# Plan: Expand SlateCamp DOM/Component Test Suite

## Goal
Grow the Vitest+jsdom+RTL test suite from 7 tests (2 files) to a meaningful set of high-value component tests that cover real UI risk: user interaction, conditional rendering, accessibility states, and form behavior. Do not migrate existing bun:test logic tests. Keep Vitest narrow to React DOM concerns.

## Current Context
- **Stack:** Vitest 4.1.5, jsdom, React Testing Library, jest-dom matchers, user-event
- **Setup:** `tests/vitest/setup.ts` (mocks for matchMedia, localStorage, sessionStorage, scrollTo)
- **Custom render:** `tests/vitest/utils/render.tsx` wraps `ThemeProvider`
- **Existing tests:** `empty-state.test.tsx` (5 tests), `theme-toggle.test.tsx` (2 tests)
- **Coverage:** Currently 74% statements, 58% branch across tested files — but only 2 component files are exercised

## Proposed Approach
Target components in this priority order:

1. **UI primitives with interaction** — button, input, checkbox, search-input
2. **Shared components with state machines** — question-card (quiz/review/preview/compact variants), mode-button
3. **Shared components with conditional rendering** — action-card, empty-state (already covered), stat-card
4. **Accessibility-heavy components** — dialog, option-row keyboard handling in question-card

Avoid:
- Pure presentational components with no branching (separator, skeleton, avatar)
- Admin components that depend heavily on server actions or complex context
- Analytics chart components (canvas/SVG heavy, jsdom limitations)
- Components already well-covered by bun:test

## Step-by-Step Plan

### Phase 1: UI Primitives (Interaction Foundation)
**Goal:** Verify the design system primitives behave correctly under user input.

| File | Component | What to Test |
|------|-----------|--------------|
| `tests/vitest/components/ui/button.test.tsx` | Button | renders with each variant/size; handles click; shows spinner when pending (useFormStatus); disabled state prevents click; asChild forwards ref |
| `tests/vitest/components/ui/input.test.tsx` | Input, SearchInput | Input renders with sizes, accepts typing, respects disabled/aria-invalid; SearchInput debounces onChange (300ms default), shows clear button when has value, calls onClear, shows spinner when loading, renders shortcutHint |
| `tests/vitest/components/ui/checkbox.test.tsx` | Checkbox | toggles checked on click; respects defaultChecked; disabled prevents toggle; renders Check icon when checked |

**Expected new tests:** ~15-20

### Phase 2: QuestionCard (State Machine)
**Goal:** Cover the most complex shared component — a 4-variant state machine with accessibility.

| File | Component | What to Test |
|------|-----------|--------------|
| `tests/vitest/components/shared/question-card.test.tsx` | QuestionCard | **quiz variant:** renders stem + options; selecting option calls onSelectOption; submitted=true shows correct/incorrect/faded states; **review variant:** shows correct answer highlighted, user's wrong answer highlighted, rationale collapsible toggle; **preview variant:** shows metadata badges, highlights correct answer; **compact variant:** truncates stem, shows badges; **all variants:** flag button calls onFlag, keyboard Enter/Space selects option, aria-labels on options |

**Expected new tests:** ~10-12

### Phase 3: ActionCard + ModeButton (Conditional Rendering)
**Goal:** Cover components with props-driven layout changes.

| File | Component | What to Test |
|------|-----------|--------------|
| `tests/vitest/components/shared/action-card.test.tsx` | ActionCard | renders icon, badge, title, subtitle, description, metadata, footer; onClick handler; href renders as Link; omits missing optional slots |
| `tests/vitest/components/shared/mode-button.test.tsx` | ModeButton | renders each mode (camp, storm, focus_review, proof, chill); each variant (solid, outline, ghost); disabled state; onClick handler |

**Expected new tests:** ~8-10

### Phase 4: Dialog (Accessibility + Interaction)
**Goal:** Cover modal behavior with focus management and keyboard interaction.

| File | Component | What to Test |
|------|-----------|--------------|
| `tests/vitest/components/ui/dialog.test.tsx` | Dialog | renders trigger + content when open; closes on overlay click; closes on close button click; renders correct size variant; traps focus (where jsdom allows); renders header, footer, title, description slots |

**Expected new tests:** ~5-6

### Phase 5: Coverage Threshold + Cleanup
**Goal:** Set a meaningful baseline and document the test patterns.

- Add `coverage.thresholds` to `vitest.config.ts` only after Phase 1-4 are merged and stable:
  ```ts
  coverage: {
    thresholds: {
      statements: 70,
      branches: 50,
      functions: 50,
      lines: 70,
    },
  }
  ```
- Update `TESTING.md` with component test patterns:
  - Prefer `screen.getByRole` over `container.querySelector`
  - Use `userEvent` over `fireEvent` for realistic interactions
  - Mock `window.matchMedia` and storage via setup.ts (already done)
  - Test user-visible behavior, not implementation details

## Files Likely to Change

### New test files
```
tests/vitest/components/ui/button.test.tsx
tests/vitest/components/ui/input.test.tsx
tests/vitest/components/ui/checkbox.test.tsx
tests/vitest/components/ui/dialog.test.tsx
tests/vitest/components/shared/question-card.test.tsx
tests/vitest/components/shared/action-card.test.tsx
tests/vitest/components/shared/mode-button.test.tsx
```

### Modified config/docs
```
vitest.config.ts          (add coverage thresholds in Phase 5 only)
TESTING.md                (add component test patterns section)
```

## Tests / Validation Per Phase

After each phase, run:
```bash
bun run test:dom           # should pass
bun run test:dom:coverage  # review coverage delta
bun run type-check         # no TS errors in new test files
bun run lint               # no lint errors in new test files
```

## Risks, Tradeoffs, and Open Questions

1. **jsdom vs. real browser for complex interactions:** Dialog focus trapping and some Radix primitives may behave differently in jsdom vs. real browsers. If a test is flaky or impossible in jsdom, skip it with a comment and rely on Playwright e2e for that behavior.

2. **Debounce timing in SearchInput:** Testing debounce requires `vi.useFakeTimers()`. Ensure cleanup (`vi.useRealTimers()`) happens in `afterEach` to avoid leaking fake timers to other tests.

3. **DOMPurify in question-card:** `dangerouslySetInnerHTML` with DOMPurify may require `isomorphic-dompurify` to work in jsdom. If it fails, mock DOMPurify.sanitize to be identity function in tests.

4. **next/link in ActionCard:** `next/link` requires mock in jsdom. Either wrap with a mock router provider or mock the `next/link` module in the test file.

5. **Form status in Button:** `useFormStatus` is a React DOM hook. In jsdom without a real form submission context, it may always return `{ pending: false }`. Test the pending state by mocking `react-dom`'s `useFormStatus` or by testing the spinner prop directly.

6. **Base UI primitives:** Components use `@base-ui/react` primitives (Checkbox, Dialog, Input). These may have portal/teleport behavior that jsdom handles poorly. If a component test fails due to portal rendering, use `screen.getByRole` with `{ hidden: true }` or mock the portal behavior.

## Execution Order

1. Phase 1 (UI primitives) — highest value, builds testing muscle
2. Phase 2 (QuestionCard) — highest complexity, validates state machine testing approach
3. Phase 3 (ActionCard + ModeButton) — reinforces patterns, good coverage gains
4. Phase 4 (Dialog) — accessibility focus, may surface jsdom limitations
5. Phase 5 (Thresholds + docs) — only after coverage is stable and meaningful

## Success Criteria
- `bun run test:dom` runs 30+ tests across 7+ files
- No test asserts `true` or tests implementation details only
- Every test exercises user-visible behavior (render, click, type, toggle, keyboard)
- Coverage report shows meaningful branch coverage on tested components
- `bun run lint` and `bun run type-check` remain exit-zero
