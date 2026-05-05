# Testing Guide

SlateCamp has three complementary test layers:

| Layer | Tool | Environment | Purpose |
|-------|------|-------------|---------|
| Unit / logic | `bun:test` | Node.js | Pure functions, server logic, data transforms |
| DOM / component | Vitest + jsdom | Simulated browser | React component rendering, user interactions, prop behavior |
| E2E / browser | Playwright | Real Chromium | Full page flows, auth, visual regression, AI inspection |

---

## 1. Unit tests (`bun:test`)

The codebase already uses Bun's built-in test runner for ~715 test files under `src/`.
These are best for server-side logic, utilities, engines, and API route handlers.

```bash
# Run all unit tests
bun run test

# With coverage
bun run test:coverage
```

Tests live next to the code they exercise (e.g. `src/lib/engine.test.ts`).

---

## 2. DOM / component tests (Vitest + jsdom)

Vitest is configured separately from `bun:test` and targets **`tests/vitest/`**.
It uses **jsdom** to simulate a browser DOM and **React Testing Library** to render
components and fire user events.

### Why jsdom?
jsdom is the default simulated DOM for compatibility. It supports the APIs that
`next-themes`, `@radix-ui/react-tooltip`, and most SlateCamp components need.

### Run component tests

```bash
# Once
bun run test:dom

# Watch mode (recommended while authoring)
bun run test:dom:watch

# With coverage
bun run test:dom:coverage
```

Coverage output is written to `coverage/` (already gitignored). The HTML report
can be viewed at `coverage/index.html`.

### Write a component test

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { EmptyState } from '@/components/shared/empty-state'

describe('EmptyState', () => {
  it('renders title and description', () => {
    render(
      <EmptyState
        title="No quizzes yet"
        description="Start your first quiz to track progress."
      />,
    )

    expect(screen.getByText('No quizzes yet')).toBeInTheDocument()
  })
})
```

### Render utility with providers

If a component needs `ThemeProvider` (or other global context), use the wrapped
render helper:

```tsx
import { render, screen } from '@/tests/vitest/utils/render'
import { ThemeToggle } from '@/components/shared/ThemeToggle'

describe('ThemeToggle', () => {
  it('toggles theme when clicked', async () => {
    render(<ThemeToggle />)
    // ...
  })
})
```

The helper lives at `tests/vitest/utils/render.tsx` and wraps RTL's `render`
with `ThemeProvider` plus jsdom mocks for `matchMedia`, `localStorage`, and
`scrollTo`.

---

## 3. E2E / browser tests (Playwright)

Playwright runs against a **real Chromium** browser (and optionally mobile
emulation). The project already has an extensive E2E suite under `e2e/`, custom
runner scripts, and a `playwright.config.ts` that starts the dev server automatically.

### Run E2E tests

```bash
# Smoke tests against a built app
bun run test:e2e:smoke

# Full auth-demo suite
bun run test:e2e:auth-demo

# Interactive UI mode
bun run test:e2e:ui

# Headed (visible browser)
bun run test:e2e:headed
```

### Dialog accessibility (Playwright)

Dialog behavior — focus traps, Escape key handling, overlay clicks, and accessible
semantics — is tested in a real browser because jsdom cannot reliably simulate
focus management or portal rendering.

```bash
# Run dialog accessibility tests against the dev portal (requires demo auth)
bun run test:e2e:dialog
```

Tests cover:
- Dialog opens from trigger and exposes `role="dialog"` + accessible name
- Escape key closes dialog
- Cancel button closes dialog
- Overlay click closes dialog
- Keyboard navigation stays inside dialog content
- Action button closes dialog regardless of server result
- Multiple dialogs on the same page behave independently
- Page returns to fully usable state after close

---

### AI UI Inspection

A dedicated test captures screenshots, console errors, network failures, and
visible text so an AI or codebase agent can inspect the UI without opening a
browser manually.

```bash
# Run the inspection and view the report
bun run inspect:ui
```

**Port behavior:**
- Default port is **3217** (avoids conflict with the dev server on 3000).
- To inspect an already-running dev server on port 3000:
  ```bash
  PLAYWRIGHT_PORT=3000 bun run inspect:ui
  ```

**Artifacts are written to `test-results/ai-inspection/`:**
- `homepage-full.png` — full-page screenshot
- `homepage-viewport.png` — viewport screenshot
- `report.json` — structured diagnostics (title, URL, visible text, console errors, network failures)

**Failure behavior:**
The command exits with a non-zero code when serious UI problems are detected:
- Uncaught page errors (`pageerror`)
- `console.error` entries not on the allowlist
- Failed same-origin critical assets (scripts, styles, fonts, JSON)
- Missing expected app content on the homepage
- Failed screenshot capture

The JSON report is written **before** assertions, so it is available even when
the test fails.

### Visual regression

`e2e/visual-login.spec.ts` asserts that `/login` matches a stored baseline
screenshot.

**IMPORTANT:** Playwright screenshots are platform-specific (OS, browser version,
GPU, fonts). Baselines generated on macOS will not match on Linux CI.

```bash
# Update baseline after intentional visual changes
bunx playwright test e2e/visual-login.spec.ts --project=chromium --update-snapshots

# Run visual test (use only in a locked environment)
bun run test:visual
```

Snapshots are stored in `e2e/visual-login.spec.ts-snapshots/`.

**Recommendation:** Run visual regression only in CI (Linux) or Docker. Do not
make it a default local blocker unless the environment is locked.

---

## 4. Configuration files

| File | Purpose |
|------|---------|
| `vitest.config.ts` | Vitest entry point: esbuild JSX automatic, jsdom env, path aliases |
| `tests/vitest/setup.ts` | jest-dom matchers, `cleanup()` after each test, jsdom mocks |
| `tests/vitest/vitest.d.ts` | TypeScript declarations for jest-dom matchers in Vitest |
| `tests/vitest/utils/render.tsx` | Reusable `render()` wrapper with `ThemeProvider` |
| `playwright.config.ts` | Playwright projects, webServer, traces/screenshots on failure |
| `scripts/inspect-ui.ts` | One-command AI inspection runner |

---

## 5. Coverage thresholds (DOM tests)

Vitest coverage is configured in `vitest.config.ts` but **disabled by default**.
Current DOM test coverage (May 2026):

| Metric | Current | Threshold | Status |
|--------|---------|-----------|--------|
| Statements | 81.33% | 75% | ✓ conservative |
| Branches | 86.4% | 80% | ✓ conservative |
| Functions | 73.68% | 65% | ✓ conservative |
| Lines | 82.69% | 75% | ✓ conservative |

To enable enforcement, set `enabled: true` in `vitest.config.ts` under
`test.coverage`. Only enable when the suite is stable and adding new tests
is unlikely to drop numbers below these floors.

---

## 6. Recommended CI command sequence

```bash
bun run type-check
bun run lint
bun run test           # 715+ bun unit tests
bun run test:dom       # React DOM/component tests
bun run test:dom:coverage
bun run test:e2e:smoke # Playwright smoke tests
bun run test:e2e:dialog # Dialog accessibility tests
bun run inspect:ui     # AI inspection (fails on critical UI errors)
```

## Lint

```bash
bun run lint
```

Checks `src/`, `app/`, `components/`, `scripts/`, `tests/`, and `e2e/` for ESLint errors.
Generated files in `.ai/` are excluded from the lint gate (see `eslint.config.mjs`).

---

## 6. Quick reference

| Task | Command |
|------|---------|
| Type check | `bun run type-check` |
| Lint | `bun run lint` |
| Unit tests | `bun run test` |
| Component tests | `bun run test:dom` |
| Component tests (watch) | `bun run test:dom:watch` |
| Component tests (coverage) | `bun run test:dom:coverage` |
| E2E smoke | `bun run test:e2e:smoke` |
| Dialog accessibility | `bun run test:e2e:dialog` |
| AI inspect (port 3217) | `bun run inspect:ui` |
| AI inspect (existing dev server) | `PLAYWRIGHT_PORT=3000 bun run inspect:ui` |
| Visual regression | `bun run test:visual` |
| Update visual snapshots | `bunx playwright test e2e/visual-login.spec.ts --project=chromium --update-snapshots` |
