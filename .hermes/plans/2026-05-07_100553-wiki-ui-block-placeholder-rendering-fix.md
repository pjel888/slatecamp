# Wiki UI Block Placeholder Rendering Fix Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Stop real wiki article pages from rendering literal `[SLATECAMP_UI_BLOCK:...]` placeholder text and restore custom wiki components such as `ArticleMedia`, `WikiMistakeCard`, and `WikiMistakeList` on production article content.

**Architecture:** The MDX renderer already supports `ArticleMedia` through `WIKI_COMPONENTS`; the broken article content is not reaching MDX as `<ArticleMedia />`. The source of truth must remain the roundtrip protocol: UI blocks are extracted into `ui-blocks.json`, placeholders are allowed only in `normalized.md`, and `candidate.md`/Supabase content must contain real JSX component tags. The fix should combine immediate data repair, renderer guardrails, and content-audit push safety so this class of bug cannot silently ship again.

**Tech Stack:** Next.js App Router, React Server Components, `next-mdx-remote/rsc`, `@mdx-js/mdx`, Supabase `wiki_articles.content`, Bun/Vitest-style tests.

---

## Current Evidence

1. Runtime page `http://localhost:3000/dashboard/wiki/916cb394-9854-4d8e-ae0a-fd1747e37b3f` returns HTTP 200 but includes raw `SLATECAMP_UI_BLOCK` text and does not include `data-media-block-id` or `Image Placeholder` from `ArticleMedia.tsx`.

2. Local export for article `lea-matl-007-04-core-concept` shows the three content states clearly:
   - `.ai/content-audit-export/articles/lea-matl-007-04-core-concept--916cb394-9854-4d8e-ae0a-fd1747e37b3f/original.md`
     - `SLATECAMP_UI_BLOCK=0`
     - `<ArticleMedia=2`
     - MDX compile: pass
   - `.ai/content-audit-export/articles/lea-matl-007-04-core-concept--916cb394-9854-4d8e-ae0a-fd1747e37b3f/normalized.md`
     - `SLATECAMP_UI_BLOCK=8`
     - `<ArticleMedia=0`
     - MDX compile: fail with `Could not parse expression with acorn`
   - `.ai/content-audit-export/articles/lea-matl-007-04-core-concept--916cb394-9854-4d8e-ae0a-fd1747e37b3f/candidate.md`
     - `SLATECAMP_UI_BLOCK=0`
     - `<ArticleMedia=2`
     - MDX compile: pass

3. `src/components/wiki/article/WikiArticle.tsx` already imports and registers `ArticleMedia` in `WIKI_COMPONENTS`. The component registry is not the primary failure.

4. `src/components/wiki/blocks/ArticleMedia.tsx` renders a visible placeholder UI when called with `status="placeholder"`. The user is not seeing that UI because the component is never invoked.

5. `src/lib/wiki-markdown.ts` fallback behavior is being triggered after MDX parse failure and turns raw placeholder markers into normal markdown paragraphs/lists. This explains the observed frontend output.

6. Prior push record from `push-result.json` on 2026-05-04 blocked a no-op push when `candidate.md` matched `original.md`. A newer `compose-report.json` on 2026-05-06 shows `candidate_hash` now differs from `original_hash`, `placeholders_found=8`, `placeholders_resolved=8`, `safe_to_diff=true`, and `blockers=[]`.

## Root Cause Statement

This is not an `ArticleMedia` registration/rendering bug. The live article content being served to the frontend contains the normalized roundtrip placeholder block:

```md
[SLATECAMP_UI_BLOCK:ui_0001 component="ArticleMedia" status="preserved"]
Extracted summary:
- Props: ...
- Text: (none detected)
[/SLATECAMP_UI_BLOCK]
```

That placeholder format is intended for `normalized.md` only. It is not valid MDX component syntax, so MDX compilation fails, fallback rendering runs, and the fallback emits the placeholder as literal article text.

## Non-Goals

- Do not manually edit one article row in Supabase as the only fix.
- Do not remove or bypass `WIKI_COMPONENTS`.
- Do not replace the MDX pipeline with a bespoke renderer.
- Do not let `createMdxFallbackSource` become the normal render path for valid wiki content.
- Do not delete the roundtrip placeholder protocol; keep it for the content audit workflow.

## Acceptance Criteria

1. Article `916cb394-9854-4d8e-ae0a-fd1747e37b3f` renders `ArticleMedia` component output instead of literal `[SLATECAMP_UI_BLOCK:...]` text.
2. The rendered page includes `data-media-block-id="media-paint-coating-comparison"` or another reliable `ArticleMedia` DOM signal.
3. The rendered page does not contain `SLATECAMP_UI_BLOCK` in HTML or React flight payload.
4. `candidate.md` remains the only file allowed to be pushed to Supabase from the audit workflow.
5. Push/apply tooling blocks any candidate or remote update payload that still contains `[SLATECAMP_UI_BLOCK:`.
6. Tests cover both renderer behavior and content-audit push safety.
7. Existing wiki markdown tests still pass.
8. Typecheck and lint pass, or any pre-existing unrelated failures are documented.

---

## Implementation Plan

### Task 1: Confirm current live content state and cache behavior

**Objective:** Prove whether the page is rendering raw placeholder content from Supabase or from stale Next/cache state.

**Files:**
- Inspect: `src/lib/actions/cached-queries.ts`
- Inspect: `src/app/dashboard/wiki/[articleId]/page.tsx`
- Inspect: `src/lib/actions/wiki-actions.ts`

**Steps:**
1. Run a page fetch against the article URL and capture these booleans:
   - contains `SLATECAMP_UI_BLOCK`
   - contains `data-media-block-id`
   - contains `media-paint-coating-comparison`
2. If safe DB read credentials are available locally, run a read-only Supabase query for `wiki_articles.article_id`, `content`, and `updated_at` for article `916cb394-9854-4d8e-ae0a-fd1747e37b3f`. Do not print secrets.
3. Compare the DB content hash to local `original.md`, `normalized.md`, and `candidate.md` hashes.
4. Check whether the route/cache layer could be serving stale normalized content after DB repair.

**Expected finding:** Live content or cache contains normalized placeholders, not JSX component tags.

**Verification:** Produce a short evidence note with hashes and route output booleans.

---

### Task 2: Add a renderer-level sentinel for raw UI block placeholders

**Objective:** Prevent the wiki renderer from silently degrading raw placeholders into article text.

**Files:**
- Modify: `src/lib/wiki-markdown.ts`
- Modify: `src/lib/__tests__/wiki-markdown.test.ts`
- Possibly modify: `src/components/wiki/article/WikiArticle.tsx`

**Implementation direction:**
Add a small utility near existing MDX sanitation utilities:

```ts
export function containsSlatecampUiBlockPlaceholder(source: string) {
  return /\[SLATECAMP_UI_BLOCK:[^\]]+\]/.test(source)
}
```

Then choose one of these two renderer policies:

**Preferred policy A — fail closed in development/admin views:**
- If raw placeholders are detected before compile, render a clear internal warning or throw a controlled error in dev.
- Do not let fallback render them as ordinary educational content.

**Fallback policy B — repair only self-contained placeholder summaries:**
- Add `restoreSlatecampUiBlockPlaceholders(source)` that converts placeholder summaries back into JSX when the placeholder contains complete `Props:` data.
- Use this only before `sanitizeMDX`, and log/flag unresolved blocks.
- This can recover `ArticleMedia` blocks but may not safely recover rich children for every component.

Recommended choice: implement policy A first, then only add policy B if product requirements demand best-effort display from already-corrupted rows.

**Tests:**
Add tests that assert:
1. `containsSlatecampUiBlockPlaceholder(normalizedSource)` returns true.
2. A source with raw `[SLATECAMP_UI_BLOCK:...]` is not converted by `createMdxFallbackSource` into normal-looking student content without a sentinel.
3. A normal `<ArticleMedia ... />` source remains valid and unchanged by `sanitizeMDX`/`normalizeWikiMdxComponentBlocks`.

**Verification command:**

```bash
bun test src/lib/__tests__/wiki-markdown.test.ts
```

---

### Task 3: Harden content-audit push safety so normalized placeholders cannot be pushed

**Objective:** Make it impossible for `normalized.md`-style placeholders to enter `wiki_articles.content` through the content-audit push workflow.

**Files:**
- Modify: `scripts/content-audit/lib.ts`
- Modify: `scripts/content-audit/content-audit.test.ts`
- Possibly modify: `scripts/content-audit/push-candidates-to-supabase.ts`

**Implementation direction:**
In `evaluatePushSafety`, add blockers when `input.candidate` contains raw placeholders:

```ts
if (input.candidate?.includes('[SLATECAMP_UI_BLOCK:')) {
  blockers.push('candidate.md contains raw SLATECAMP_UI_BLOCK placeholders; run compose-candidates before push.')
}
```

Also add a remote-content diagnostic warning/blocker when appropriate:

```ts
if (input.remoteContent?.includes('[SLATECAMP_UI_BLOCK:')) {
  warnings.push('Remote Supabase content contains raw SLATECAMP_UI_BLOCK placeholders and should be repaired from candidate.md.')
}
```

Do not block repair solely because remote content is already placeholder-corrupted; otherwise the safe repair path may be impossible. Instead, add an explicit repair mode or allow the normal stale-safe update only when the expected remote hash matches the corrupted baseline.

**Tests:**
Add tests for:
1. Candidate with raw placeholders is blocked.
2. Candidate with real `<ArticleMedia />` passes placeholder-specific safety.
3. Remote with raw placeholders produces a warning or repair-specific signal.
4. Existing no-op blocker behavior remains unchanged.

**Verification command:**

```bash
bun test scripts/content-audit/content-audit.test.ts
```

---

### Task 4: Define and implement a safe repair path for corrupted remote rows

**Objective:** Repair existing articles whose Supabase `content` contains raw placeholders while preserving stale checks.

**Files:**
- Modify: `scripts/content-audit/lib.ts`
- Modify: `scripts/content-audit/push-candidates-to-supabase.ts`
- Possibly create: `scripts/content-audit/repair-placeholder-content.ts`
- Update tests: `scripts/content-audit/content-audit.test.ts`

**Implementation direction:**
Preferred minimal path:
1. Reuse existing `candidate.md` generation from `composeCandidate`.
2. Add a guarded option such as `--repair-placeholders` to push tooling.
3. Allow update when all conditions are true:
   - remote content contains `[SLATECAMP_UI_BLOCK:`
   - candidate content does not contain `[SLATECAMP_UI_BLOCK:`
   - `ui-blocks.json` has no unresolved critical blocks
   - `compose-report.json` reports `placeholders_resolved === placeholders_found`
   - `diff-report.json` is safe
   - update uses `.eq('content', remote.content)` or an equivalent exact stale guard, not a blind update
4. Write `push-result.json` with a clear `repair_mode: 'placeholder_content'` field.

**Do not:**
- Force update by article ID alone.
- Repair all articles without a dry-run inventory first.
- Treat reconstructed placeholder summaries as equivalent to original JSX unless verified by `ui-blocks.json`/candidate.

**Verification command:**

```bash
bun run content-audit:push --dry-run -- --article-id 916cb394-9854-4d8e-ae0a-fd1747e37b3f --repair-placeholders
```

Expected: dry-run passes with clear repair intent and no mutation.

---

### Task 5: Repair the affected article from `candidate.md`

**Objective:** Restore the real article page using the composed candidate, not a manual content edit.

**Files/Data:**
- Source candidate: `.ai/content-audit-export/articles/lea-matl-007-04-core-concept--916cb394-9854-4d8e-ae0a-fd1747e37b3f/candidate.md`
- Target row: `wiki_articles.article_id = '916cb394-9854-4d8e-ae0a-fd1747e37b3f'`

**Steps:**
1. Run the repair dry-run from Task 4.
2. Confirm candidate contains no `[SLATECAMP_UI_BLOCK:` markers.
3. Confirm candidate contains expected component tags:
   - `<ArticleMedia`
   - `<WikiMistakeCard` or other restored block tags as applicable
4. Apply the repair with the guarded command only after dry-run passes.
5. Clear or revalidate route cache if needed.

**Verification commands:**

```bash
python3 - <<'PY'
from pathlib import Path
p = Path('.ai/content-audit-export/articles/lea-matl-007-04-core-concept--916cb394-9854-4d8e-ae0a-fd1747e37b3f/candidate.md')
s = p.read_text()
print('SLATECAMP_UI_BLOCK', s.count('[SLATECAMP_UI_BLOCK:'))
print('ArticleMedia', s.count('<ArticleMedia'))
print('WikiMistakeCard', s.count('<WikiMistakeCard'))
PY
```

```bash
bun run content-audit:push:apply -- --article-id 916cb394-9854-4d8e-ae0a-fd1747e37b3f --repair-placeholders
```

Expected after apply:
- updated rows count is 1
- `push-result.json` says `pushed: true`
- `candidate_hash` matches the pushed content hash

---

### Task 6: Verify page render end-to-end

**Objective:** Prove the frontend now renders actual wiki components.

**Files:**
- No code changes expected in this task.

**Steps:**
1. Fetch the article page.
2. Assert no `SLATECAMP_UI_BLOCK` appears in the HTML/flight payload.
3. Assert `data-media-block-id` appears.
4. Assert `media-paint-coating-comparison` appears inside component output, not just source text.
5. If cache still serves old content, inspect and trigger the project’s standard cache invalidation path.

**Verification snippet:**

```bash
python3 - <<'PY'
import urllib.request
url = 'http://localhost:3000/dashboard/wiki/916cb394-9854-4d8e-ae0a-fd1747e37b3f'
html = urllib.request.urlopen(url).read().decode('utf-8', 'replace')
checks = {
    'has_slatecamp_ui_block': 'SLATECAMP_UI_BLOCK' in html,
    'has_data_media_block_id': 'data-media-block-id' in html,
    'has_media_id': 'media-paint-coating-comparison' in html,
    'has_image_placeholder_copy': 'Image Placeholder' in html,
}
for key, value in checks.items():
    print(key, value)
PY
```

Expected:
- `has_slatecamp_ui_block False`
- `has_data_media_block_id True`
- `has_media_id True`

---

### Task 7: Inventory all articles with raw placeholders

**Objective:** Determine whether this is isolated or a bulk content corruption issue.

**Files/Data:**
- Supabase table: `wiki_articles`
- Local export root: `.ai/content-audit-export/articles/`

**Steps:**
1. Run a read-only DB inventory for rows where `content ilike '%[SLATECAMP_UI_BLOCK:%'`.
2. Compare each article ID to local export directories.
3. Classify rows:
   - repair-ready: candidate exists and has no raw placeholders
   - needs compose: normalized/ui-blocks exist but candidate missing or stale
   - blocked: unresolved placeholders or unknown UI blocks
4. Generate a report under `.ai/` or `.hermes/plans/` before any bulk mutation.

**Suggested report path:**

```text
.ai/wiki-mdx-render-debug/references/raw-ui-placeholder-inventory-2026-05-07.md
```

**Verification:**
Report includes counts and article IDs for each class.

---

### Task 8: Add regression verification to the existing MDX pipeline script

**Objective:** Ensure future exports/candidates and real article content do not regress.

**Files:**
- Modify: `.ai/wiki-mdx-render-debug/scripts/verify_pipeline.ts`
- Possibly add: `.ai/wiki-mdx-render-debug/references/articlemedia-placeholder-regression-2026-05-07.md`

**Implementation direction:**
Add checks that flag:
1. Source contains `[SLATECAMP_UI_BLOCK:` before compile.
2. Fallback output contains `[SLATECAMP_UI_BLOCK:`.
3. Known component IDs such as `media-paint-coating-comparison` compile into component references when the candidate contains `<ArticleMedia />`.

**Verification command:**

```bash
bun .ai/wiki-mdx-render-debug/scripts/verify_pipeline.ts
```

Expected: no ArticleMedia regression; any placeholder-corrupted rows are listed explicitly.

---

### Task 9: Run full validation

**Objective:** Confirm the fix does not break existing wiki/content behavior.

**Commands:**

```bash
bun test src/lib/__tests__/wiki-markdown.test.ts
bun test scripts/content-audit/content-audit.test.ts
bun run type-check
bun run lint
```

If full lint/typecheck has pre-existing failures, document:
- exact command
- failure summary
- why it is unrelated or what follow-up is needed

---

### Task 10: Final review and commit grouping

**Objective:** Keep the change auditable and reversible.

**Commit grouping recommendation:**
1. `test: cover raw slatecamp ui placeholder regressions`
2. `fix: block raw ui placeholders from wiki fallback rendering`
3. `fix: add guarded content-audit placeholder repair path`
4. `chore: repair lea-matl paint coating article ui blocks`
5. `docs: document articlemedia placeholder root cause`

**Review checklist:**
- No secrets printed or committed.
- No broad Supabase mutation without dry-run inventory.
- No manual one-off content patch as the only solution.
- No fallback path that makes corrupted content appear normal without diagnostics.
- `candidate.md`/Supabase content contains JSX, not placeholders.

---

## Files Likely to Change

Code/tests:
- `src/lib/wiki-markdown.ts`
- `src/lib/__tests__/wiki-markdown.test.ts`
- `scripts/content-audit/lib.ts`
- `scripts/content-audit/content-audit.test.ts`
- `scripts/content-audit/push-candidates-to-supabase.ts`
- optional: `scripts/content-audit/repair-placeholder-content.ts`
- optional: `.ai/wiki-mdx-render-debug/scripts/verify_pipeline.ts`

Generated/local audit artifacts:
- `.ai/content-audit-export/articles/lea-matl-007-04-core-concept--916cb394-9854-4d8e-ae0a-fd1747e37b3f/push-result.json`
- `.ai/content-audit-export/articles/lea-matl-007-04-core-concept--916cb394-9854-4d8e-ae0a-fd1747e37b3f/push-report.json`
- optional: `.ai/wiki-mdx-render-debug/references/raw-ui-placeholder-inventory-2026-05-07.md`
- optional: `.ai/wiki-mdx-render-debug/references/articlemedia-placeholder-regression-2026-05-07.md`

Data:
- Supabase `wiki_articles.content` for article `916cb394-9854-4d8e-ae0a-fd1747e37b3f`
- possibly additional rows found by raw-placeholder inventory

---

## Risks and Tradeoffs

1. **Repairing from summaries is lossy.** Do not reconstruct rich UI blocks from placeholder summary text unless absolutely necessary. Prefer `ui-blocks.json` + `candidate.md`.

2. **Current remote hash may differ from local export baseline.** The repair path must use exact stale guards against the current remote content.

3. **Fallback rendering can hide serious content corruption.** A visible diagnostic is safer than silently converting corrupted content into student-facing prose.

4. **Bulk repair can damage content if candidate files are stale.** Always inventory first, classify rows, and dry-run before apply.

5. **Cache can mask successful DB repair.** Verify both database content and page HTML after apply.

6. **Some UI blocks may have children.** `ArticleMedia` is self-contained, but `WikiMistakeCard`/other blocks may rely on children. Preserve the raw block from `ui-blocks.json`, not just `Props:`.

---

## Recommended Execution Order

1. Task 1: confirm live state.
2. Task 3: add push safety blocker tests and implementation.
3. Task 4: add guarded repair mode.
4. Task 5: repair this article from candidate.
5. Task 6: verify the page.
6. Task 2: add renderer sentinel if not already covered by repair/tooling.
7. Task 7: inventory all affected articles.
8. Task 8: extend pipeline regression script.
9. Task 9: run full validation.
10. Task 10: review and commit.

This sequence fixes the immediate broken page while closing the pipeline hole that allowed normalized placeholders to become live article content.
