# Phase 1A Reconciliation — Senior Planning Review (read-only)

**Reviewed:** 5 reconciliation documents + spot-checked load-bearing claims against repo state.
**Live evidence anchors verified:** 567 article dirs, 567 `ui-blocks.json`, 130 `question-edits/` dirs, no source-pack roots, `ai-feature-guard.ts` confirmed 7-line stub, `export-summary.json` confirmed stale (`ui_block_count: 0` / `parser_status: "not_started"` corpus-wide, generated `2026-05-04T09:10:23.838Z`).

---

## VERDICT

**Phase 1A: CONDITIONAL CONTINUE** — read-only inventory may proceed, but four classification corrections must land before sign-off (see §Required Corrections). The five reconciliation docs are substantively correct and well-evidenced; they are the strongest planning artifacts produced so far. They overclaim in three specific places.

**Phase 0.5 source-pack readiness: BLOCKED.** Two independent hard blockers, not one.

**Phase 1B: BLOCKED.** Six preconditions added beyond what `readiness-report.md §15` lists.

---

## Challenges to the user's eight focus points

### 1. Is per-article `ui-blocks.json` safe as Phase 1A evidence?
**Mostly yes, but the doc over-promotes it.** `ui-blocks.json` is canonical for *what the parser extracted at one moment*, not for *what is editorially present and valid*. The doc declares it Priority 1 "canonical" with `parser confidence: high` cited from a single sample (`overview-building-materials...`). For Phase 1A inventory: acceptable. For Phase 1B selection or readiness scoring: not yet — needs a stratified spot-check across high/medium/low component clusters and at least one negative-case sample (parser confidence `low` or `failed`). One sample article is not corpus-grade evidence.

**Required:** add a "sampling protocol used" subsection naming N samples across complexity tiers; otherwise the trust hierarchy is built on one data point.

### 2. Is `export-summary.json` stale, incomplete, or generated before parser work?
**It is stale for parser fields. Root cause is hypothesized, not proven.** The doc identifies a 14-second gap between `generated_at` (export) and a sampled `normalized_created_at` (ui-blocks) — that is consistent with normalization running after export *in the same orchestrated run* and never re-emitting the summary. But the document presents this as confirmed root cause ("Root cause: Export summary is a Supabase-export manifest, not a post-normalization manifest"). That is the most likely explanation; it is not yet proven by reading `export-article-bundles.ts` and `normalize-article-bundles.ts` orchestration code.

**Required:** label as *working hypothesis* until the source of `ui_block_count`/`parser_status` writes is traced. The `component_count: 0` field at the manifest level (also confirmed) reinforces but does not prove the hypothesis.

### 3. Is the question-bank failure-mode map separate enough from article rewriting?
**Conceptually yes. Operationally no, in two ways.**
- The doc cites "100+ question-edits/ JSON files." Live count is **130 directories** (verified). Minor but worth correcting — the planning posture "question-edits exist but are partial" is materially understated as evidence weight when 23% of articles have prior QA artifacts.
- More importantly: the failure-mode taxonomy is excellent, but it omits a *coupling* failure mode. When an article is rewritten in Phase 1B, the linked questions' rationales, citations, and code references can become silently desynchronized. This is neither pure "article failure" nor pure "question failure" — it is a roundtrip-coupling failure unique to Phase 1B operations. Currently absent from the map.

**Required:** add Section 7 "Article-Question Coupling Failures" with: rationale-source-drift, citation-section-drift, distractor-becoming-correct-after-edit, mastery-data-invalidation.

### 4. Are export freshness criteria strong enough before Phase 1B?
**The criteria are good but the threshold is too lax.** The doc proposes ≤24-hour staleness window. For Phase 1B editorial work where AI proposals will be staged against local artifacts, 24h means up to a full day of live-DB drift can hide. Recommend ≤6h for active editorial sessions, with migration-version equality as a hard gate. The current export is "PASS (barely)" at the 24h boundary — that is exactly the wrong margin to start Phase 1B from.

**Also missing:** the freshness checklist has no failure mode for *partial* exports. If `export-article-bundles.ts` errored mid-run on article 423, the count would be 422 ≠ 567 — flagged. But if it errored on writing one `linked-questions.json` while emitting top-level summary, the summary shows complete and the bundle is silently truncated. Need per-bundle integrity check, not just count match.

### 5. Do live DB schema deltas undermine admin audit assumptions?
**Yes, more than the doc admits.** The doc correctly classifies `ai_audit_*` table existence as "uncertain not absent." But `admin-ai-audit-current-state.md` (per memory S288) maps 10 admin routes and Server Actions on the assumption these tables are live. If they are not, that document is not just imprecise — it is wrong about the operational surface. The new live-db-schema-delta.md should explicitly mark `admin-ai-audit-current-state.md` as **conditional on live verification** rather than treating it as established Phase 1A evidence.

The `restrict_ai_audit_admin_access.sql` not-applied finding is **a security observation requiring a confirmatory query before Phase 1B**, not just a documentation gap. If the audit tables exist live and the restriction migration is not applied, authenticated users may have read access to AI proposals/findings/runs.

**Required:** the doc must specify the exact `information_schema.tables` query Philip should run to disambiguate (one query, deterministic answer).

### 6. Can source-pack readiness proceed while `taxonomy_sources` has zero rows?
**No, and the doc correctly classifies this BLOCKER, but the framing is incomplete.** Two independent blockers exist for Phase 0.5:
- **Blocker A (filesystem):** No `.ai/16_source_packs/`, no `.ai/content-audit-export/source-packs/`, no `001_Raw-Source-Layer/`. Verified absent.
- **Blocker B (database):** `taxonomy_sources` 0 rows despite `v5.0 COMPLETE` comment.

The docs treat these as one "source readiness" issue. They are independent: filesystem source packs are the *content corpus*; `taxonomy_sources` is the *topic-level authoritative URL ledger*. A pipeline could in principle work from one without the other, but the current plan needs both. The 0-row table with a "COMPLETE" comment is also a **data-integrity warning** — somebody dropped or failed to populate after asserting completion. That deserves its own investigation row.

Also: `wiki_article_sources` has 1,110 rows (article-scoped). The docs do not explicitly evaluate whether `wiki_article_sources` could substitute for `taxonomy_sources` for any subset of grounding work. That should be a stated decision, not an unstated assumption.

### 7. Does any statement overclaim live Supabase readiness?
**Yes, three statements.**

a. `export-freshness-strategy.md` line 108: "Counts match live: PASS." Counts matching is necessary but not sufficient — content could have drifted in 24 hours without changing row counts (UPDATEs to `wiki_articles.content` are invisible to count-checks). Should read "Row counts match — content drift not verified."

b. `ui-block-count-reconciliation.md` line 67: trusts `export-summary.json` for "counts that come directly from Supabase (article_count, question_count, source_count, taxonomy_link_count)." These are correct *for the export run*, not *for live*. They become stale the moment a row is inserted/deleted live.

c. The implicit claim across all five docs that 1,110 `wiki_article_sources` represent "real" sources. The 0-row `taxonomy_sources` proves at least one source-related table can claim completeness while being empty. Apply the same skepticism to `wiki_article_sources`: are the 1,110 rows verified URLs, or scraped/seeded entries?

### 8. Does the correction that `question-edits/` directories exist change prior gates?
**Yes — and the implication is under-developed.** The prior Phase 1A inventory (memory S288) listed `question-edits/ enumeration` as a *gap*. The new map proves 130 directories exist. This changes three things:

- **Pilot candidate shortlist:** `pilot-candidate-shortlist.md` should re-rank candidates. Articles with existing `question-edits/` artifacts have prior-edit history that may conflict with new Phase 1B edits — they are *higher risk* for pilot, not lower. Currently no signal in the shortlist for this.
- **Phase 1A safe-script classification:** any script that touches `question-edits/` (write or merge) needs reclassification. The doc lists none, but the memory record showed `batch-add-ui-blocks.ts` was misclassified as `SAFE_PHASE_1A_READ_ONLY` while modifying local files. Apply the same scrutiny to question-edit-touching scripts.
- **Trustworthiness of `review-notes.json`:** these files claim `BATCH_VERIFIED` for code-citation chains. The new map cites this as evidence. But who/what generated the "BATCH_VERIFIED" stamps? If the answer is "a previous AI fact-check pass that has since been guarded out by `ai-feature-guard.ts`," then those stamps are *not* trustable as current QA. The doc should not list them as evidence without provenance.

---

## Blockers before Phase 0.5 source-pack readiness

1. **Source-pack filesystem absent.** No `.ai/16_source_packs/`, no `.ai/content-audit-export/source-packs/`, no `001_Raw-Source-Layer/`. (Verified.)
2. **`taxonomy_sources` table empty.** 0 rows live; comment claims completeness. Investigate the discrepancy and decide whether `wiki_article_sources` (1,110 rows) can substitute for any subset.
3. **Source-pack schema undefined.** The plan references source packs but no schema, version field, or hash policy is committed in the reconciliation docs.
4. **High-risk legal/code clusters have zero source coverage.** PD 1096, BP 344, RA 9266, RA 9514 articles in `pilot-candidate-shortlist.md` show 0 sources — the very clusters Phase 0.5 is intended to ground.

## Blockers before Phase 1B

1. All Phase 0.5 blockers above (Phase 1B depends on Phase 0.5).
2. **Live `ai_audit_*` table existence unconfirmed.** Need one deterministic `information_schema.tables` query before relying on admin AI audit infrastructure.
3. **`restrict_ai_audit_admin_access.sql` not applied live.** If audit tables exist live, this is a current security exposure. Apply or document deferral with rationale.
4. **No automated `isExportFresh()` gate.** Manual freshness assertions are insufficient for a 567-article pipeline. Build a deterministic gate that checks count match, migration version equality, normalized_at ≥ exported_at, and per-bundle hash integrity.
5. **No question-level roundtrip safety.** No compose-diff-validate equivalent for questions exists. Article-only roundtrip is not enough.
6. **`tmp-direct-push.ts` and 5 sibling `tmp-*.ts` files still in production script directory.** Quarantine or move before any Phase 1B execution.
7. **Article-question coupling failure mode untracked.** Any rewrite of a Phase 1B article whose linked questions cite specific code sections silently risks rationale drift. No detector exists.
8. **Aggregate content hash absent from `export-summary.json`.** Verifying 567 individual hashes is slow; lack of aggregate hash means there is no fast integrity check before each Phase 1B run.

---

## Required corrections to the five reconciliation docs

**`ui-block-count-reconciliation.md`:**
- Change "Root cause: Export summary is a Supabase-export manifest, not a post-normalization manifest" to a labeled hypothesis until traced to source code.
- Add a sampling-protocol subsection. One sample article is not corpus-grade evidence for declaring `ui-blocks.json` canonical.
- Note that `parser confidence: high` is the parser's self-assessment, not an editorial validity claim.

**`question-bank-failure-mode-map.md`:**
- Update "100+" to **130** question-edits directories (verified count).
- Add Section 7 "Article-Question Coupling Failures" covering rationale-source-drift, citation-section-drift, distractor-becoming-correct-after-edit, mastery-data-invalidation.
- Add provenance qualifier on `review-notes.json` evidence: stamp like `BATCH_VERIFIED` from prior AI passes are not current QA without re-validation.

**`export-freshness-strategy.md`:**
- Tighten staleness window: ≤6h for Phase 1B (24h is too lax at the editorial-work boundary).
- Add per-bundle integrity check to the freshness checklist (not just count match).
- Reword line 108 from "Counts match live: PASS" to "Row counts match — content drift not verified" since UPDATEs are invisible to count checks.
- Add migration-version equality as a hard gate, not a recommended field.

**`live-db-schema-delta.md`:**
- Specify the exact deterministic SQL query to confirm `ai_audit_*` table existence (single `information_schema.tables` query). Currently the doc says "Run a targeted Supabase query" without specifying it.
- Mark `admin-ai-audit-current-state.md` as **conditional on live verification** in the schema-delta register, since 10 admin routes assume tables that are unconfirmed.
- Treat `taxonomy_sources` 0-rows-vs-COMPLETE-comment as a **data-integrity investigation row**, not just a contradiction line.
- Add explicit Phase 0.5 evaluation: can `wiki_article_sources` (1,110 rows) substitute for any portion of `taxonomy_sources` for grounding purposes?

**`state-doc-contradictions.md`:**
- Reclassify "Pilot candidate shortlist may need re-ranking due to question-edits coverage" as a new MEDIUM_RISK row. Articles with existing `question-edits/` artifacts are *higher* pilot risk, not lower — currently the register doesn't capture this.
- Upgrade the `ai_audit_*` visibility row from `HIGH_RISK` to `BLOCKER` once Philip runs the deterministic table-existence query (severity is conditional on the query result).
- Add row: "`wiki_article_sources` 1,110 rows have unverified provenance — same skepticism as `taxonomy_sources` should apply until source-of-truth confirmed."
- Add row: "130 question-edits/ directories use `BATCH_VERIFIED` stamps from prior AI fact-check passes that are now guarded by `ai-feature-guard.ts`. Stamp authority is unconfirmed."

---

## Bottom line

The reconciliation docs are a real improvement over prior Phase 1A inventory work — they correctly identify the export-summary staleness, the schema delta, the source-pack absence, and the question-bank separation. They overclaim in three places (single-sample sufficiency, root-cause certainty for export staleness, and live readiness implied by count matching). With the corrections above, Phase 1A can sign off and the team has a defensible foundation. Without them, Phase 1B will start on the same kind of overconfidence that produced the original `ui_block_count: 0` confusion — silently inheriting one stale claim into automated downstream gates.

Phase 0.5 is a hard stop until source packs and `taxonomy_sources` are resolved. Phase 1B is a hard stop until the eight preconditions above are met.