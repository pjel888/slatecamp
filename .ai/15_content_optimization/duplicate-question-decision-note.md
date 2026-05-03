# Duplicate Question Decision Note

**Purpose:** Explain the duplicate question situation and present options for human decision.  
**Scope:** 695 duplicate questions across 72 "Other Named" articles (~22% question bank inflation).  

---

## Situation

During the full question audit, **695 exact duplicate questions** were found. These are identical text-matched pairs — same question text, same options, same answer key, same explanation — with different question IDs. They were discovered in **72 articles** within the "Other Named" category (History, Theory, Design, Materials, Utilities, Planning).

**How detected:** By grouping all ~7,159 questions by their `text` field. Exact text matches across different `question_id` values were flagged as duplicates.

**How flagged:** Each duplicate was marked via a `question-edits/<id>.json` file with:
```json
{
  "question_id": "<duplicate-uuid>",
  "status": "duplicate",
  "duplicate_of": "<kept-uuid>",
  "reason": "Exact duplicate of question <kept-uuid>. Same text, options, and answer key."
}
```
No questions were deleted or modified. No `linked-questions.json` was changed.

---

## Pipeline Behavior (Current)

**Before the fix:** The push pipeline (`push-question-to-supabase.ts`) silently ignored the `status: "duplicate"` field. If a live push was run, the duplicate questions would be pushed as regular updates with whatever other fields existed in the edit file. The duplicate flag would be lost.

**After the fix (current):** The pipeline now checks each question-edit for `edit.status === 'duplicate'`. If found, the push is **blocked immediately** with exit code 1 and a push report explaining the block. This prevents accidental learner-facing duplicate publication.

**Important constraint:** The Supabase `questions` table has **no `status` column**, no `is_published`, no `is_active`, no `is_archived`, no `is_deleted` field. There is no database-native mechanism to mark questions as inactive at the schema level.

---

## Options

### Option A — Exclude duplicates from push payload
**What:** Modify the push pipeline to skip question-edits with `status: "duplicate"` (don't push them at all). Remove the blocking behavior, add a skip.

**Effect:** Duplicate questions remain in Supabase from the original export but receive no updates. They are not re-published. They may still appear learner-facing if the frontend fetches all questions associated with an article.

**Risk:** Low. The export already exists in Supabase; this just prevents re-publishing. Learner-facing appearance depends on frontend query behavior (not content-audit scope).

**Effort:** Small (modify the same pipeline file to skip instead of block).

**Reversible:** Yes — revert the skip logic.

### Option B — Archive/deactivate duplicates
**What:** If the schema adds a visibility/status column, mark duplicates as inactive or archived.

**Effect:** Most robust — questions exist in the DB but are explicitly excluded from learner-facing queries.

**Risk:** High. Requires a database migration, RLS policy updates, frontend query changes. Far outside the content-audit scope.

**Effort:** High (DB schema change + app code + migration).

**Reversible:** Partially (data loss risk if deletion is involved).

**Not recommended for this release.**

### Option C — Keep duplicates flagged but blocked (current behavior)
**What:** Leave the pipeline blocking behavior in place. Do not push until a strategy is chosen.

**Effect:** Safest for review. Prevents any accidental duplicate publication. Also prevents any live push from completing until resolved.

**Risk:** Minimal. The pipeline explicitly reports why it's blocked. The blocker is intentional.

**Effort:** Zero (already implemented).

**Reversible:** Yes — remove the check block.

**Recommended for review phase.** Allows the reviewer to examine flagged data before committing to a strategy.

### Option D — Delete duplicates locally
**What:** Delete the duplicate questions from `linked-questions.json` locally, remove the question-edit files, and regenerate the candidate.

**Effect:** Cleanest output — no duplicate questions in the push payload at all. No trace of duplicates in the export.

**Risk:** 
- Irreversible without a fresh export
- Risk of removing useful variations (confirmed all are exact copies, but human verification is recommended)
- Some `duplicate_of` references would break if the kept question was also removed

**Effort:** Moderate (bulk deletion script + compose regeneration).

**Reversible:** No (local deletion is permanent without VCS or re-export).

**Not recommended until duplicates are manually spot-checked.**

---

## Recommendation

### For review phase: Use **Option C** (keep blocked)
The current implementation blocks duplicate-flagged edits from being pushed. This is the safest posture for review. The reviewer can examine the flagged clusters without risk of accidental publication.

### For live push: Use **Option A** (skip duplicates)
Once the reviewer confirms the duplicate flags are correct:
1. Modify `push-question-to-supabase.ts` to skip `status: "duplicate"` edits instead of blocking them
2. Run a targeted push for non-duplicate edits only
3. Verify count of affected edits

### Not recommended: Options B or D
- Option B requires schema changes outside the content-audit pipeline
- Option D is too risky without manual verification of all 695 clusters

---

## Implementation Notes

### If choosing Option A (skip):
Change in `push-question-to-supabase.ts`:
```typescript
// Before: blocks with exit 1
if (edit.status === 'duplicate') {
  // Block push
}

// After: skip silently
if (edit.status === 'duplicate') {
  // Log and continue without pushing
  console.log(`Skipping duplicate question ${questionId}`)
  continue  // or return, depending on flow
}
```

### If choosing Option C (keep blocked):
No changes needed — this is the current behavior.

---

## Verification

After choosing and implementing a strategy, verify by:

1. Run `bun run content-audit:push:dry-run -- --all-safe`
2. Check that duplicate-flagged articles pass without errors (Option A) or are explicitly blocked (Option C)
3. Verify question-edit count matches expectations:
   - 860 total edits
   - 695 duplicate flags
   - 165 non-duplicate edits (answer key fixes, explanation rewrites, dedup markers)
4. Spot-check a sample of pushed edits via Supabase or the frontend

---

**Duplicate question decision note complete. Supabase remains untouched.**
