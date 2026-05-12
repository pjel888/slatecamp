# Final Push Command Plan

**Generated:** 2026-05-03
**Purpose:** Exact command sequence for live Supabase push of content-audit export.
**Authorization required:** **`PUSH TO SUPABASE NOW`** (exact phrase)

---

## Step 1 — Final Compose

Verify compose is still clean before push:

```bash
bun run content-audit:compose -- --all --overwrite
```

Expected output:
```
✓ compose <uuid>: changed; blockers=0 (or "matches original; blockers=0")
Composed 567 candidate(s)
```

Any compose blocker means the candidate is corrupted — investigate before proceeding.

---

## Step 2 — Final Safety Dry-Run

Run safety check without mutation:

```bash
bun run content-audit:push:dry-run -- --all-safe
```

Expected output:
```
✓ push dry/safe-check <uuid>: blockers=0
... (567 lines, all blockers=0)
```

Any blocker means the article is not safe to push. Investigate before proceeding.

---

## Step 3 — LIVE PUSH

**DO NOT RUN THIS UNLESS USER SAYS `PUSH TO SUPABASE NOW`**

```bash
bun run content-audit:push:apply -- --all-safe --confirm "APPLY ALL SAFE CONTENT AUDIT PUSHES"
```

Expected outcome:
- 567 wiki_articles created/updated in Supabase
- Question edits applied for 165 non-duplicate edits
- 695 duplicate edits skipped (status: "duplicate")
- Pipeline exits with code 0

---

## Post-Push Verification

After push completes, verify:

1. **Article count:** 567 articles in Supabase `wiki_articles` table
2. **Question count:** Verify question edits were applied correctly
3. **Spot-check sample:** Review 5-10 article candidate.md vs live content
4. **Duplicate exclusion:** Confirm no duplicate questions appeared learner-facing
5. **Pipeline logs:** Check run log for any warnings

---

## Rollback Notes

- The content-audit push is **incremental and non-destructive** — it uses `upsert` operations, not full table replacements.
- If issues arise mid-push, the pipeline can be stopped (Ctrl+C). Already-pushed articles remain intact.
- To revert: re-export the specific article from Supabase before the push, then re-apply the local improvements.
- The pre-push export bundle remains preserved locally in `.ai/content-audit-export/articles/`.

---

## Expected Duplicate Behavior

- **695 question edits** with `status: "duplicate"` are **skipped** — `push-question-to-supabase.ts` returns early without mutation.
- Duplicate questions already present in Supabase (from original export) remain untouched — they are NOT re-pushed.
- No new duplicate questions are created on Supabase.
- Duplicate accounting is purely local — no Supabase `status` column is involved.

---

## Expected Counts

| Item | Count |
|------|:-----:|
| Articles pushed | 567 |
| Question edits applied | 165 |
| Duplicate edits skipped | 695 |
| Total question edits | 860 |
| Supabase mutations | 0 before push; 567 after push |

---

## Pre-Push Checklist

- [ ] Human explicitly says **`PUSH TO SUPABASE NOW`**
- [ ] Step 1 compose passes: 567/567, 0 blockers
- [ ] Step 2 dry-run passes: 567/567, 0 blockers
- [ ] No other agent/user is modifying Supabase content simultaneously
- [ ] Confirmed: push is writing to intended Supabase project (`hrpdwqurngnyajuhbkdg`)

---

**Command plan complete. Awaiting `PUSH TO SUPABASE NOW` authorization.**
