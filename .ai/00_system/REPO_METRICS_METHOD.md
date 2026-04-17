# REPO_METRICS_METHOD

## Purpose

Prevent drift in high-authority counts by documenting how to calculate them.

## Current metric methods

### App route counts

- pages:
  - `rg --files src/app -g 'page.tsx' | wc -l`
- layouts:
  - `rg --files src/app -g 'layout.tsx' | wc -l`
- loading files:
  - `rg --files src/app -g 'loading.tsx' | wc -l`
- error files:
  - `rg --files src/app -g 'error.tsx' | wc -l`
- route handlers:
  - `rg --files src/app -g 'route.ts' | wc -l`

### `AGENTS.md` inventory

- tracked:
  - `git ls-files '*AGENTS.md' | wc -l`

### Client-component count

Use exact pragma detection, not loose text search:
- `rg -l \"^'use client'|^\\\"use client\\\"\" src | wc -l`

## Current observed values on 2026-04-17

- pages: `124`
- layouts: `16`
- loading files: `95`
- error files: `9`
- route handlers: `12`
- tracked `AGENTS.md`: `122`
- exact `'use client'` pragma files: `677`

## Rule

Do not update high-authority docs with fresh counts unless the count method used here is also used for the refresh.
