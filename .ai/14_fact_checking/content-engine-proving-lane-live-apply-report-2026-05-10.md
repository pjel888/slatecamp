# Content Engine Proving Lane Live Apply Report — 2026-05-10

## Scope

Applied only the approved small live lane:

- 5 existing article repairs
- 2 existing question replacements

No new article insertion workflow was run. No ADD_NEW question insertion workflow was run.

## Article Apply Results

All 5 existing article repairs were applied to `wiki_articles.content` and read back from Supabase.

- BP 344 Ramp Slope Tiers — `5a8ca807-31d5-4a32-933a-c6b83517c6de`
  - Remote content matches local `candidate.md`: yes
  - Raw placeholder markers after apply: 0
  - Remote `updated_at`: `2026-05-09T16:24:34.190588+00:00`
- RA 9266 Foreign Architects — `ae4bdc43-1451-4aa5-8c12-65283f4bbdfd`
  - Remote content matches local `candidate.md`: yes
  - Raw placeholder markers after apply: 0
  - Remote `updated_at`: `2026-05-09T16:24:36.764416+00:00`
- Vitruvius / Classical Architectural Theory — `25607252-c20a-4013-99f5-af11e829fd18`
  - Remote content matches local `candidate.md`: yes
  - Raw placeholder markers after apply: 0
  - Remote `updated_at`: `2026-05-09T16:24:38.23363+00:00`
- PD 1096 Rule VII Area Metrics — `85bcd328-436d-49ba-9d37-7b202d0d38d4`
  - Remote content matches local `candidate.md`: yes
  - Raw placeholder markers after apply: 0
  - Remote `updated_at`: `2026-05-09T16:25:52.603175+00:00`
- UAP SPP 201 Pre-Design Services — `16bb270e-6887-4bbe-a62e-eace6c4d3fdb`
  - Remote content matches local `candidate.md`: yes
  - Raw placeholder markers after apply: 0
  - Remote `updated_at`: `2026-05-09T16:25:53.475813+00:00`

## Question Apply Results

Both existing question replacements were applied and read back from Supabase. Remote fields match the local `question-edits/<question_id>.json` proposed fields.

- BP 344 question replacement — `4c92b571-c5f6-45e7-accd-4567ebe47393`
  - Remote proposed fields match: yes
  - Remote `updated_at`: `2026-05-09T16:26:03.460347+00:00`
- RA 9266 question replacement — `c348de7a-021d-4ff6-9c91-c9673fb255f6`
  - Remote proposed fields match: yes
  - Remote `updated_at`: `2026-05-09T16:26:04.852429+00:00`

## Recovery Note

The first article apply attempt succeeded for BP 344, RA 9266, and Vitruvius, then failed on PD 1096 and UAP SPP 201 with a Supabase `Bad Request` during the update call.

Root cause: placeholder-repair apply was using the full remote `content` blob as the compare-and-swap filter. For the two failed rows, that produced a PostgREST bad request before mutation.

Fix applied:

- `scripts/content-audit/lib.ts`
  - `updateArticleContentIfUnchanged()` now supports `originalUpdatedAt`.
- `scripts/content-audit/push-candidates-to-supabase.ts`
  - placeholder-repair mode now uses the freshly fetched `updated_at` value as the stale-safe filter instead of sending the full placeholder-corrupted content blob in the URL.
- `scripts/content-audit/content-audit.test.ts`
  - added coverage for the `updated_at` compare-and-swap repair path.

The two failed article applies were retried with `--strict true` and both succeeded.

## Browser QA

Browser QA was rerun before live apply:

- Overall status: PASS
- 10/10 viewport checks passed
- Raw placeholder openings rendered: 0
- Raw placeholder closings rendered: 0
- Console errors: 0
- Page errors: 0
- Horizontal overflow: false

Table-specific checks passed for BP 344 and PD 1096:

- Caption present: yes
- `role="table"` present: yes
- Tabs present: yes
- Native `<table>` elements rendered: 0
- Expected table text present: yes

## Source Fixes Needed for the Gate

Two renderer/parser fixes were required to make `WikiTableTabs` reliable in the live wiki renderer path:

- `src/lib/wiki-markdown.ts`
  - preserves escaped `\n` sequences inside JSX string props while still removing actual JSX line-continuation backslashes.
- `src/components/wiki/shared/parse-mdx-prop.ts`
  - escapes raw newline characters inside JSON string values before `JSON.parse()`, matching the shape produced by `next-mdx-remote`.

Regression coverage:

- `src/lib/__tests__/wiki-markdown.test.ts`
- `tests/vitest/components/wiki-table-tabs.test.tsx`

## Verification Commands

- `bun test scripts/content-audit/content-audit.test.ts src/lib/__tests__/wiki-markdown.test.ts`
- `bun run test:dom -- tests/vitest/components/wiki-table-tabs.test.tsx`
- `bun run type-check`
- `bun run lint`
- `git diff --check -- src/lib/wiki-markdown.ts src/components/wiki/shared/parse-mdx-prop.ts tests/vitest/components/wiki-table-tabs.test.tsx .ai/content-audit-export/target-mapping-no-apply-2026-05-09`

Validation status:

- Type-check: passed
- Targeted Bun tests: passed
- Targeted Vitest/jsdom test: passed
- Lint: passed with 0 errors and 11 pre-existing warnings
- Diff whitespace check: passed

## Parked Work

Still parked:

- 4 new article tickets
- 23 ADD_NEW question tickets
- RA 9514 insertion ticket until it clears the 900-word floor and insertion workflow review
