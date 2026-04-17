# Dependency Rationalization Audit

Implementation note (2026-04-17):
- implemented:
  - `DEP-01` — `dompurify`
  - `DEP-02` — `nextjs-toploader`
  - `DEP-03` — `@storybook/test`
  - `DEP-04` — `@radix-ui/react-visually-hidden`
  - `DEP-05` — `@tiptap/pm`, `@tiptap/suggestion`
  - `@types/dompurify`
  - `SCRIPT-01` — `check:storybook-placeholders`

## Likely dependency cleanup candidates

- `DEP-01` — `dompurify` and `@types/dompurify`
  - live code imports `isomorphic-dompurify`
  - no direct `dompurify` usage found in repo source/config

- `DEP-02` — `nextjs-toploader`
  - no live references found
  - custom route-progress implementation already exists in `src/components/shared/NavigationProgress.tsx`

- `DEP-03` — `@storybook/test`
  - no direct imports or story-runner usage found
  - no `play:` story evidence returned by the audit lane

- `DEP-04` — `@radix-ui/react-visually-hidden`
  - no live references found in source or Storybook config

- `DEP-05` — `@tiptap/pm` and `@tiptap/suggestion`
  - no direct live references found in current editor surfaces

## Tooling cleanup candidates

- `TOOL-01` — retire `package-lock.json` if Bun remains the only supported package manager
- `SCRIPT-01` — collapse `check:storybook-placeholders` into `check:storybook` once compatibility callers are gone

## Validation surface findings

- no root `test` script exists
- no canonical `validate` command exists
- CI and PR expectations are still fragmented across Storybook/build asks rather than one cleanup-safe pipeline

## Main caution

Do not remove packages only because repo search missed them once. Reconfirm via lockfile/package diff, storybook config, and typecheck/lint/build-storybook/build on the later implementation run.

## Linked findings and plans

- findings: `CLN-012`, `CLN-013`, `CLN-015`
- plans: `../03_plans/dependency-rationalization-plan.md`, `../03_plans/cleanup-safety-validation-plan.md`
