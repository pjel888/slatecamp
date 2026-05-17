# Lint Triage — 2026-05-04

Branch: `codebase-modernization-batch1-2`
Command: `bun run lint`

## Summary

| Category          | Count |
|-------------------|-------|
| Initial errors    | 8     |
| Initial warnings  | 15    |
| Total             | 23    |
| Fixed (low-risk)  | 23    |
| Risky (untouched) | 0     |
| Remaining         | 0     |

**Result: All 23 issues were low-risk and fixed. Lint passes clean (exit code 0).**

---

## Errors (8) — all `@typescript-eslint/no-require-imports`

All errors were `require()` calls in `scripts/content-audit/` — static requires for Node built-in modules (`node:fs`, `node:child_process`). All trivially convertible to ESM `import` with zero behavioral change.

| # | File | Line | Rule | Fix Applied |
|---|------|------|------|-------------|
| 1 | `scripts/content-audit/reconcile-stale-baselines.ts` | 99 | `no-require-imports` | Added `readdirSync` to existing `node:fs` import; removed `require('node:fs')` |
| 2 | `scripts/content-audit/reconcile-stale-baselines.ts` | 209 | `no-require-imports` | Added top-level `import { execSync } from 'node:child_process'`; removed inline `require()` |
| 3 | `scripts/content-audit/reconcile-stale-baselines.ts` | 220 | `no-require-imports` | Removed redundant `require()` (covered by top-level import) |
| 4 | `scripts/content-audit/reconcile-stale-baselines.ts` | 233 | `no-require-imports` | Removed redundant `require()` (covered by top-level import) |
| 5 | `scripts/content-audit/reconcile-stale-baselines.ts` | 246 | `no-require-imports` | Removed redundant `require()` (covered by top-level import) |
| 6 | `scripts/content-audit/tmp-direct-push.ts` | 4 | `no-require-imports` | Converted to `import * as fs from 'node:fs'` |
| 7 | `scripts/content-audit/tmp-push-debug.ts` | 8 | `no-require-imports` | Converted to `import * as fs from 'node:fs'` |
| 8 | `scripts/content-audit/tmp-push-debug2.ts` | 6 | `no-require-imports` | Converted to `import * as fs from 'node:fs'` |

**Risk classification:** LOW-RISK. All were static requires for Node built-ins in one-off tooling scripts. No dynamic requires, no conditional requires, no architecture changes needed.

---

## Warnings (15)

### `@typescript-eslint/no-unused-vars` (12)

| # | File | Line | Variable | Fix Applied |
|---|------|------|----------|-------------|
| 1 | `scripts/content-audit/reconcile-stale-baselines.ts` | 28 | `nowIso` (import) | Removed from import destructuring (unused) |
| 2 | `scripts/content-audit/reconcile-stale-baselines.ts` | 97 | `dirs` | Prefixed: `_dirs` |
| 3 | `scripts/content-audit/reconcile-stale-baselines.ts` | 176 | `blockId` | Prefixed: `_blockId` |
| 4 | `scripts/content-audit/tmp-direct-push.ts` | 2 | `sha256` (import) | Removed from import; also removed `require` → `import * as fs` |
| 5 | `scripts/content-audit/tmp-push-debug2.ts` | 2 | `sha256` (import) | Removed from import; also removed `require` → `import * as fs` |
| 6 | `src/app/dashboard/area-c/design-quiz/_components/DesignQuizSession.tsx` | 37 | `isCalculating` | Prefixed: `_isCalculating` (setter `setIsCalculating` is still used) |
| 7 | `src/components/shared/GlobalLoadingOverlay.tsx` | 3 | `useCallback` (import) | Removed from React import |
| 8 | `src/components/wiki/blocks/ArticleMedia.tsx` | 260 | `suggestedSearchQuery` | Prefixed: `_suggestedSearchQuery` |
| 9 | `src/components/wiki/blocks/ArticleMedia.tsx` | 291 | `headingId` | Prefixed: `_headingId` |
| 10 | `src/lib/actions/wiki-actions.ts` | 362 | `elapsed` | Prefixed: `_elapsed` (line 362) |
| 11 | `src/lib/actions/wiki-actions.ts` | 452 | `elapsed` | Prefixed: `_elapsed` (line 452) |
| 12 | `src/stores/useGlobalLoadingStore.test.ts` | 1–2 | `afterEach`, `mock`, `renderToStaticMarkup` (imports) | Removed unused imports |

**Risk classification:** LOW-RISK. Unused variables/imports — removed or prefixed with `_`. No behavioral change.

### Unused eslint-disable directive (1)

| # | File | Line | Rule | Fix Applied |
|---|------|------|------|-------------|
| 13 | `src/hooks/useGlobalLoading.ts` | 45 | `react-hooks/exhaustive-deps` | Removed `// eslint-disable-line` comment (no violations were reported) |

**Risk classification:** LOW-RISK. The disable directive was suppressing nothing — removing it is a no-op.

### Note: `_suggestedSearchQuery` warning counted as 1 (lint treats unused destructured prop as one warning, not two: unused arg + unused var)

Wait — actually lint reported 2 warnings for ArticleMedia.tsx: `suggestedSearchQuery` (args) and `headingId` (vars). That's correct at 2.

---

## Files Modified

| File | Changes |
|------|---------|
| `scripts/content-audit/reconcile-stale-baselines.ts` | Added `readdirSync` + `execSync` imports; removed `nowIso` import; removed 5 `require()` calls; prefixed `_dirs`, `_blockId` |
| `scripts/content-audit/tmp-direct-push.ts` | Converted `require('node:fs')` to `import * as fs`; removed unused `sha256` import |
| `scripts/content-audit/tmp-push-debug.ts` | Converted `require('node:fs')` to `import * as fs`; restored `articleId` declaration |
| `scripts/content-audit/tmp-push-debug2.ts` | Converted `require('node:fs')` to `import * as fs`; removed unused `sha256` import; restored `articleId` declaration |
| `src/app/dashboard/area-c/design-quiz/_components/DesignQuizSession.tsx` | Prefixed `isCalculating` → `_isCalculating` |
| `src/components/shared/GlobalLoadingOverlay.tsx` | Removed unused `useCallback` import |
| `src/components/wiki/blocks/ArticleMedia.tsx` | Prefixed `suggestedSearchQuery` → `_suggestedSearchQuery`, `headingId` → `_headingId` |
| `src/hooks/useGlobalLoading.ts` | Removed unused eslint-disable directive |
| `src/lib/actions/wiki-actions.ts` | Prefixed `elapsed` → `_elapsed` (2 occurrences) |
| `src/stores/useGlobalLoadingStore.test.ts` | Removed unused imports: `afterEach`, `mock`, `renderToStaticMarkup` |

---

## Pre-existing Issues (not addressed — out of scope)

The following TypeScript errors were observed during patch-level lint checks but are pre-existing and unrelated to this triage:

- `node_modules/@types/mdx/types.d.ts` — `Cannot find namespace 'JSX'` (4 occurrences) — MDX type definitions issue
- `scripts/content-audit/lib.ts` — `esModuleInterop` flag for `node:path` default import + 18 `downlevelIteration` / iterator issues — tsconfig flag needed for this script directory
- `scripts/content-audit/tmp-*.ts` — Top-level `await` in non-ESM module context — tsconfig flag needed
- Various `src/` files — `Cannot find module '@/...'` when linted outside the full project TypeScript context

These are tsconfig/project-configuration issues, not eslint violations, and were not part of the lint triage scope.
