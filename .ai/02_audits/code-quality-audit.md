# Code Quality Audit

## Scope

- `src/`
- `tsconfig.json`
- `eslint.config.mjs`

## Linked findings

- `CQ-001`
- `CQ-002`
- `CQ-003`
- `CQ-004`
- `ARC-003`

## Observed

- Admin authoring logic is split poorly across heavy client components and server helpers
- Query and action layers still use broad `select('*')` patterns in content, quiz, and helper flows
- TypeScript strictness is intentionally relaxed across the repo
- ESLint correctness guardrails are partially disabled in the baseline config

## Material findings

### `CQ-001` Admin authoring boundary coupling

Observed in:
- `src/components/admin/unified-editor/ContentEditorIndex.tsx`
- `src/components/admin/unified-editor/QuestionsPanel.tsx`
- `src/components/admin/unified-editor/EIPromptsPanel.tsx`
- `src/components/admin/unified-editor/SaveAllBar.tsx`
- `src/lib/actions/admin/content.ts`

Impact:
- mutation, preview, read-model shaping, and UI composition are too tightly coupled

### `CQ-002` Weak query contracts

Representative evidence:
- `src/lib/actions/wiki-actions.ts`
- `src/lib/actions/quiz-v2/successive-relearning.ts`
- `src/lib/actions/wiki-interactions.ts`
- `src/lib/design-scenarios.ts`

Impact:
- schema coupling stays high
- type inference remains coarse
- payload and review surfaces are wider than necessary

### `CQ-003` Relaxed compiler contract

Observed in `tsconfig.json`:
- `strict: false`
- `noImplicitAny: false`
- `strictNullChecks: false`

Impact:
- unsafe assumptions can compile cleanly
- the repo’s size makes permissive defaults more damaging, not less

### `CQ-004` Relaxed lint contract

Observed in `eslint.config.mjs`:
- `@typescript-eslint/no-explicit-any` disabled
- multiple `react-hooks/*` rules disabled
- baseline safety rules loosened to avoid failures

Impact:
- repo conventions are documented more strongly than they are enforced

## Inferred

- The current quality posture is optimized for throughput and baseline stability, not for long-term defect prevention

## Unknown

- How many current runtime defects are masked by the relaxed compiler and lint posture versus external dependency/install noise
