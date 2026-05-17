# Baseline Validation

Date/time: 2026-05-06T17:08:37

| Command | Exit | Log | Notes |
|---|---:|---|---|
| `bun run build-storybook` | 134 | `.ai/03_plans/ui-componentization-audit-2026-05-06/reports/baseline-logs/bun-run-build-storybook.log` | baseline failure: Storybook build OOM at default Node heap |
| `bun run design-lint` | 0 | `.ai/03_plans/ui-componentization-audit-2026-05-06/reports/baseline-logs/bun-run-design-lint.log` | passed/no blocking notes |
| `bun run inspect-ui` | 0 | `.ai/03_plans/ui-componentization-audit-2026-05-06/reports/baseline-logs/bun-run-inspect-ui.log` | passed/no blocking notes |
| `bun run lint` | 0 | `.ai/03_plans/ui-componentization-audit-2026-05-06/reports/baseline-logs/bun-run-lint.log` | lint passed with 10 warnings |
| `bun run test-dom` | 0 | `.ai/03_plans/ui-componentization-audit-2026-05-06/reports/baseline-logs/bun-run-test-dom.log` | passed/no blocking notes |
| `bun run type-check` | 2 | `.ai/03_plans/ui-componentization-audit-2026-05-06/reports/baseline-logs/bun-run-type-check.log` | pre-existing baseline failure: missing `openai` package/types for scripts/normalize-distractors.ts |

## Baseline interpretation

- `bun run type-check` failed before implementation due to `scripts/normalize-distractors.ts` importing `openai` without installed type/module resolution. This is recorded as a baseline failure and was not introduced by UI componentization work.
- `bun run build-storybook` failed before implementation with Node heap out-of-memory after transforming 11208 modules. This is recorded as a baseline environment/resource failure. Future Storybook validation should retry with increased heap, e.g. `NODE_OPTIONS=--max-old-space-size=8192 bun run build-storybook`.
- `bun run lint`, `bun run design:lint`, `bun run test:dom`, and `bun run inspect:ui` passed.
