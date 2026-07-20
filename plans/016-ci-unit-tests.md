# Plan 016 — Run unit tests (bun + vitest) in CI

> Audit: 2026-07-20, commit `064e3a43a`. Category: DX. Severity: HIGH. Effort: S. Risk: low.
> **Status: ✅ APPLIED.** Vetted against live code: `.github/workflows/ci.yml` ran only `type-check`, `lint`, `build`, Playwright install, one smoke spec.

## Why this mattered

95 test files existed and passed locally, but CI didn't run them. Test regressions on PRs weren't caught — the suite gave a false sense of coverage. Two lines in the workflow file fix this.

## What was changed

In `.github/workflows/ci.yml`, added two steps after the existing `lint` step and before `build`:

```yaml
      - name: Unit tests (bun)
        run: bun run test

      - name: DOM tests (vitest)
        run: bun run test:dom
```

## Verification

- `bun run test` — 813 pass / 0 fail (95 files).
- `bun run test:dom` — 69 pass / 0 fail (11 files).
- `bunx js-yaml .github/workflows/ci.yml > /dev/null` — YAML well-formed.

## Maintenance note

The durable rule: CI runs all three test runners — `bun run test` (unit), `bun run test:dom` (DOM), `bun run test:e2e:smoke` (Playwright smoke). When a new runner is added, wire it here.
