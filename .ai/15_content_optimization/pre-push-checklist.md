# Pre-Push Checklist

**Purpose:** Steps to complete before any Supabase live push of the content-audit export.
**Status:** Blocked pending human decisions (see Section A).

---

## A. Required Before Live Push

These items MUST be resolved before running a live push. Skipping them risks publishing incorrect or duplicate content to learners.

### [ ] 1. Re-export 2 stale BP 344 articles
- **Articles:** `bp-344-ramp-slope-tiers`, `bp-344-tactile-and-visual-alarms`
- **Issue:** Local `original.md` hash doesn't match article metadata hash
- **Cause:** Re-export cycle happened but local files weren't refreshed
- **Fix:** Re-export specific articles from Supabase, or overwrite local `original.md` with fresh export data
- **After fix:** Re-run compose and dry-run for these 2 articles

### [ ] 2. Confirm duplicate question strategy
- `status: "duplicate"` in question-edits JSON currently blocks push with exit code 1
- **Human must choose** one option from the duplicate question decision note
- See: `.ai/15_content_optimization/duplicate-question-decision-note.md`
- **After decision:** Implement the corresponding script change or keep the blocker

### [ ] 3. Re-run compose after all fixes
```bash
bun run content-audit:compose -- --all --overwrite
```
- Verify: 0 blockers, 567/567 composed

### [ ] 4. Re-run `--all-safe` dry-run
```bash
bun run content-audit:push:dry-run -- --all-safe
```
- Verify: 0 errors, completes in ~80 seconds
- Verify: No `stale_check_failed` or `unsafe_diff` blockers (except those intentionally accepted)

### [ ] 5. Confirm no Supabase mutation occurred during review
- Verify Supabase has not been modified since the original content-audit export
- If modified, re-export affected articles

### [ ] 6. Human acceptance of source-reference backlog
- 102 articles still lack source references
- 63 High priority (legal/statutory claims)
- 38 Medium priority (technical standards)
- **Decision:** Accept backlog as-is OR complete source pass before push
- Backlog reference: `.ai/15_content_optimization/source-backlog-102.md`

---

## B. Optional But Recommended

### [ ] 7. Source-reference pass for 102 articles
- Target: Articles with legal/code/technical claims but empty `sources.json`
- Priority order: Professional Practice → Contract Docs → Planning → Materials → Other
- See backlog for full list with priorities

### [ ] 8. Human spot-check of high-risk articles
- **RA 9266 articles** — verify Section 4 / Section 41 / penalty corrections
- **BP 344 articles** — verify section references match 2024 IRR format
- **PD 1096 articles** — verify Rule/Section citations
- **SPP Document articles** — verify process flow accuracy
- **Planning articles** — verify dimensional standards

### [ ] 9. Manual review of duplicate clusters
- 695 duplicate questions across 72 "Other Named" articles
- Spot-check 20-30 clusters to confirm duplicates are truly exact copies
- Verify no useful variations were incorrectly marked for removal

### [ ] 10. Review script changes before merge
- `scripts/content-audit/push-question-to-supabase.ts` — duplicate blocking
- `scripts/content-audit/lib.ts` — optional chaining fix
- Verify changes are properly committed and documented

### [ ] 11. Verify roundtrip-safe format (future-proofing, not push-blocking)
- 60 articles still have raw MDX tags (`<Warn>`, `<Tip>`, `<ExamTip>`)
- These render correctly but won't survive future re-exports
- Consider a dedicated maintenance pass

---

## C. Final Pre-Push Commands

Run these in order before the live push:

```bash
# Step 1: Fresh compose
bun run content-audit:compose -- --all --overwrite

# Step 2: Safety dry-run
bun run content-audit:push:dry-run -- --all-safe

# Step 3: Validate all (if available)
# bun run content-audit:validate -- --all

# Step 4: Verify counts
# 567 articles, 0 blockers, 0 errors
```

---

## D. Live Push Authorization

**Do NOT proceed to live push until:**
- [ ] All items in Section A are resolved
- [ ] Human explicitly says: **`PUSH TO SUPABASE NOW`**

**Live push command (only when authorized):**
```bash
bun run content-audit:push:apply -- --all-safe --confirm "APPLY ALL SAFE CONTENT AUDIT PUSHES"
```

**Post-push verification:**
```bash
# Verify articles were created/updated
# Verify question edits were applied
# Spot-check a sample of articles on the live site
```

---

## E. Rollback Plan (if push goes wrong)

- Content-audit push is designed to be incremental and non-destructive
- If issues arise: stop the pipeline, assess scope, and restore from the pre-push export
- The export files are always preserved locally — the pipeline never deletes them

---

**Pre-push checklist complete. Supabase remains untouched.**
