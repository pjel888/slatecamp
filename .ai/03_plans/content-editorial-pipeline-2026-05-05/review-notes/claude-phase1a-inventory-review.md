# Senior Planning Review — Phase 1A Inventory

**Date:** 2026-05-05 | **Verdict:** Phase 1A may proceed as read-only inventory **with the corrections below**. Phase 1B remains gated.

I spot-verified the load-bearing claims:
- 6 `tmp-*.ts` files: present.
- `ai-feature-guard.ts`: 7 lines, `process.exit(2)`. Confirmed hard-disabled.
- Source-pack roots (`.ai/16_source_packs/`, `.ai/content-audit-export/source-packs/`, `001_Raw-Source-Layer/`): all absent.
- `export-summary.json` totals: 567 articles, 7,159 linked_question_count sum, 1,110 source_count sum. Confirmed.
- **But:** `parser_status: "not_started"` and `ui_block_count: 0` across **all 567** articles in the summary, while a sampled `ui-blocks.json` contains 12 real blocks. Summary fields are stale relative to per-article artifacts. **This contradicts an assumption every doc relies on.**

---

## 1. Missing evidence

1. **UI-block summary vs. per-article artifact mismatch** is unresolved.
   - `pilot-candidate-shortlist.md §5.4` flags it as "needs clarification."
   - `current-artifact-map.md` describes `ui-blocks.json` as `DERIVED_EXPORT` without disclosing that the corpus-level summary disagrees with it.
   - `state-doc-contradictions.md` does **not** register this contradiction.
   - **Required:** Phase 1A must determine whether `export-summary.json` predates the last normalize/parser pass, and which value (summary vs. per-article) is current. Until resolved, every "low UI complexity" rating in the shortlist is unsupported.

2. **Per-bundle hash freshness vs. live Supabase.** No doc records the export run timestamp or whether any of the 567 `original.md` hashes still match `wiki_articles.content`. Without this, "candidate pool from local export" is provenance-thin if Supabase has drifted.

3. **Migration `20260505145349_restrict_ai_audit_admin_access.sql` was not actually read.** `admin-ai-audit-current-state.md §4.4` discloses this. Phase 1A must finish reading it before any admin-integration claim in Phase 1B.

4. **`question-edits/` directories are claimed to exist in some bundles** (readiness-report §4.1). No doc enumerates which bundles, how many, or what schema is used. The contradictions register flags the artifact gap but the inventory documents do not list a single example path.

5. **`tmp-direct-push.ts` blast-radius proof.** `current-script-map.md` warns it bypasses the `eq('content', original)` gate but does not confirm it has never been run against prod, nor that prod credentials were never present in its environment. Phase 1A should confirm via git history / log inspection, not assertion.

6. **No row count for any `ai_audit_*` table.** `admin-ai-audit-current-state.md` documents schema and surface but does not state whether the tables are empty, partially populated, or polluted with pre-launch test data. This matters for Phase 7 sync-bridge planning.

---

## 2. Overconfident conclusions

| Claim | Doc | Why overconfident |
|---|---|---|
| "Exports 567 articles, 7,159 questions, 1,110 sources" stated as current truth | `current-script-map.md` §1 | These numbers come from a stale-as-of-?? export. They are not ground truth for *current* Supabase state. Phrase as "as of export run X." |
| `validate-bundles.ts` Phase 1A safety = `SAFE_PHASE_1A_READ_ONLY` | §6 | The script writes to local `sync-state.json`. "Local-write" is fine, but the table caption mixes "DB read-only" and "writes only locally" under one label. Add a column distinguishing **DB-mutation** from **local-mutation**. Same applies to `normalize-article-bundles.ts`, `compose-candidates.ts`, `batch-add-ui-blocks.ts`. |
| "Reads `wiki_articles.content` for hash verification" classifies pull/export as fully safe | §1 | Service-role read of production is not zero-risk if it implies cost, log noise, or rate-limiting. Add: requires explicit run authorization. |
| Phase 1A safety verdict on `run-content-roundtrip.ts` = `SAFE_PHASE_1A_READ_ONLY` | §17 | Orchestrator inherits safety from its child. Listing it as safe in the summary table while child includes `push:apply` invites accidental mutation. Should be `UNSAFE_MUTATING` whenever push is in the dispatch map. |
| "Adjacent infrastructure only" verdict on `/admin/ai-audit` | `admin-ai-audit-current-state.md` §12.3 | The actions can mutate `ai_audit_findings`, `ai_change_proposals`, `ai_audit_runs`, `ai_audit_items`, and `ai_audit_status_cache`. They do not mutate `wiki_articles.content`/`questions`, which is the relevant safety property — but "adjacent" understates that browser sessions can write rich audit-table state, including `ai_review_decisions` (immutable trail). State this precisely. |
| "All entries are manual. `no_ai_job_started: true`" | `admin-ai-audit-current-state.md` §11.1 | This is true of paths visible in the action layer, but is not verified against actual current row content. Empty-table assumption ≠ verified absence of AI-flagged rows. |
| `ai_audit_dashboard_summary` etc. listed as views with no SQL inspection | §4.2 | Views' filtering logic is part of access control. Not yet read. Don't claim they are safe-by-construction. |
| Source pack absence flagged `BLOCKER` for "Phase 0.5" only | `state-doc-contradictions.md` row 1 & §13.7 | Resolution column says "Phase 0.5 source-pack readiness" — the readiness report itself classifies this as Critical and as gating Phase 1B AI proposals. Severity is correct but scope is understated: it also blocks any high-risk pilot selection in the current shortlist, since 60+ of 70 candidates have 0 sources. |

---

## 3. Unsafe Phase 1A classifications

- **`sync-run-log-to-admin-audit.ts` should not appear in the §10.1 "Phase 1A Safe Commands" code block under any flag.** It is `UNSAFE_MUTATING` (writes `ai_audit_runs`). The current script-map shows it with `--dry-run` in the safe command list. Verify the script supports `--dry-run` semantically (i.e., guarantees no INSERT) before listing it. If it does, document the flag's enforcement. If it does not, remove from the safe-commands block.

- **`batch-add-ui-blocks.ts` is classified `SAFE_PHASE_1A_READ_ONLY` (local-only)** but the script *modifies `normalized.md` for many articles*. That is content-shape mutation of a `DERIVED_EXPORT` artifact other downstream tools depend on. Phase 1A should be **read-only**, not "writes-allowed-if-local." Reclassify as `LOCAL_MUTATING_NOT_PHASE_1A` or equivalent.

- **`reconcile-stale-baselines.ts` is correctly `UNSAFE_MUTATING`**, but it is the most surprising mutator in the directory (multi-step pipeline with implicit push). It deserves a callout above the summary table rather than buried at #18.

- **`compose-candidates.ts` and `normalize-article-bundles.ts` are classified safe** but each writes derived artifacts that are inputs to push. Add a note that re-running them shifts hashes downstream, which can mask drift in subsequent diffs. This is a Phase 1A safety nuance worth recording.

- **The `DEPRECATED_OR_SUPERSEDED` items (`compose-candidate.ts`, `diff-candidate.ts`, `push-to-supabase.ts`)** are still importable and runnable. Phase 1A is read-only inventory, so they should not be deleted, but they should be flagged for archive in Phase 1B with explicit owner-approval requirement.

---

## 4. Contradictions not captured

Add these rows to `state-doc-contradictions.md`:

1. **`export-summary.json` reports zero UI blocks corpus-wide; per-article `ui-blocks.json` files contain real blocks.** Severity `HIGH_RISK` for Phase 1A. Required resolution before Phase 1A acceptance.
2. **`parser_status: "not_started"` for all 567 articles** disagrees with the existence of populated `normalized.md` files. Severity `HIGH_RISK`.
3. **`README.md` "live-AI-provider-free" launch posture vs. `scripts/content-audit/lib.ts` likely already importing AI provider client paths.** Not actually verified — `lib.ts` was listed in §"Required sources to inspect" of `02-audit-and-readiness-plan.md` but not surfaced in `current-script-map.md`. Severity `MEDIUM_RISK`. (`lib.ts` is missing from the script inventory.)
4. **Plan pack disposition decision in `00-existing-plan-disposition.md` is not cross-referenced by any of the five inventory docs.** If the disposition statement was wrong, all five inventories silently inherit the error. Severity `LOW_RISK`/`NOTE`.
5. **`admin.content.approve` permission scope.** Only `updateProposalStatus` requires it. `updateAuditTargetStatus` can override target status with only `admin.content.view`, despite the `overrideOpenFindings` gate. This is a permission-boundary nuance, not a bug, but Phase 1B integration plans should note it before mapping pipeline writes to admin actions. Severity `MEDIUM_RISK`.

---

## 5. Pilot candidate shortlist — challenges

1. **Ratings of "component complexity" are inferred from titles, not artifact content.** With `ui-blocks.json` actually populated and `export-summary.json.ui_block_count` stale, every "Low/Medium/High" rating is unsupported. Re-derive from per-article `ui-blocks.json` length, then state the rating method in §1.

2. **70 candidates is too many for Phase 1A's purpose.** The plan calls for ~35. Padding to 2x without a stated decision rule defeats the value of a shortlist. Either (a) trim to ~40 with rationale, or (b) declare the file a *candidate pool* (not shortlist) and rename — current §1 already says "candidate pool" but the title still says "shortlist."

3. **8 `high-risk` candidates with 0 sources collide with the "source-grounding" pilot role.** A pilot article with zero sources cannot benchmark source-grounded editing. These articles can benchmark fact-flagging or unsupported-claim detection, but not source-grounded rewrite. Split the role taxonomy: `source-grounding-feasible` requires `source_count ≥ N`; `unsourced-baseline` is the right label for the 0-source legal cluster.

4. **Article 39 (MDPE formula)** is correctly flagged for review, but the file lists no other formula-only articles (e.g., parking, area metrics, height limits, schedule of payments, MDPE) under a single grouping. They are scattered across clusters. A "computation/formula" cluster with explicit math-validation requirements would be more useful than the current `component-stress` umbrella, which conflates tables, formulas, and structured frameworks.

5. **Duplicate entries.** `prac-eth-cpd` appears as candidate 52 and 59. `prac-eth-section5` as 36 and 60. `mepf-noise` as 30 and 61. `pd-1096-rule-vii-area-metrics` as 5 and 63. `fire-resistive-construction-ratings` as 6, 27, 64. Consolidate before §3 cluster summary recounts them as separate.

6. **No control article from question-bank-only failure modes.** All zero-question scenarios (orphaned questions, missing answer keys, duplicates) are absent. The `12-question-bank-specific-plan.md` requires these — pilot must include them.

7. **"Unknown" in `Source Coverage` column for design/theory rows** indicates the script that generated the table did not query export-summary fully. Either fill in or omit the row until evidence exists.

8. **Smoke pilot has 2 entries marked `smoke`; the plan calls for 20.** The shortlist is misaligned with the pilot plan it cites. Either expand the smoke set or state explicitly that the smoke pilot is selected separately.

---

## 6. Can Phase 1A proceed as read-only inventory?

**Yes, conditionally.**

Phase 1A is allowed to proceed because:
- All 5 documents are evidence-oriented and based on actual file inspection, not stale plan docs.
- No script in the safe-commands block writes to Supabase **content** tables.
- The current admin surface is read-instrumented and cannot apply edits to `wiki_articles.content` from the browser.

But the following corrections must land before Phase 1A is signed off:
- Reclassify `batch-add-ui-blocks.ts` as not-1A-safe.
- Verify and document `sync-run-log-to-admin-audit.ts --dry-run` semantics or remove from safe list.
- Add the `ui_block_count` / `parser_status` contradiction to the contradictions register.
- De-duplicate the shortlist and clarify "pool vs. shortlist."
- Add `lib.ts` to the script inventory.

---

## 7. What remains blocked before Phase 1B

Beyond what `readiness-report.md §15` lists, **add these specific 1B preconditions**:

1. **Export freshness gate.** A current export run must be performed (or the existing run hash-verified against live Supabase) before any 1B prototype article is selected.
2. **UI-block status reconciliation.** Whichever artifact (`export-summary.json` vs. per-article `ui-blocks.json`) is canonical must be declared, and the other regenerated or marked superseded.
3. **`admin.content.approve` boundary writeup.** Phase 7 admin-integration plan needs an explicit decision on whether pipeline-applied content writes go through `updateProposalStatus(approved)` (browser-driven) or terminal scripts only (current state). Today's docs are ambiguous.
4. **`tmp-*.ts` disposition.** Not deletion — but a documented archive plan with owner sign-off, before Phase 1B touches the same directory.
5. **Source-pack feasibility proof for at least 1 pilot candidate.** Without it, Phase 1B has no real article to prototype against in the source-grounding role.
6. **Migration `20260505145349_restrict_ai_audit_admin_access.sql` fully read and summarized.**
7. **Decision on whether AI-as-internal-tool is permitted under live-AI-free launch posture.** This is in `state-doc-contradictions.md` row 3 as a Phase 1B blocker — affirmed.

---

## 8. Recommended updates

### `current-script-map.md`
- Add `lib.ts` row.
- Split safety taxonomy into `DB_MUTATION` vs. `LOCAL_MUTATION` vs. `READ_ONLY`. Reclassify `batch-add-ui-blocks.ts`, `normalize-article-bundles.ts`, `compose-candidates.ts`, `diff-candidates.ts` accordingly.
- In the §"Phase 1A Safe Commands" code block, remove `content-audit:admin-log -- --dry-run` until dry-run semantics are confirmed.
- Add §"Run authorization required" footer listing every script that connects to Supabase even in read-only mode.
- Move `reconcile-stale-baselines.ts` from #18 to top of UNSAFE list; add bold callout.

### `current-artifact-map.md`
- Add a **§"Provenance freshness"** subsection. State the export run timestamp/ID, last-modified bounds, and the resolution of the `ui_block_count: 0` vs. populated `ui-blocks.json` discrepancy.
- Replace the §"Key Finding: Source Coverage Gap" with a per-cluster table that ties source_count to pilot-eligibility for the source-grounding role.
- Mark the artifact-trustworthiness summary's `manifest.json` and `export-summary.json` as `SOURCE_OF_TRUTH (run-bound)` to avoid implying they are evergreen.

### `admin-ai-audit-current-state.md`
- §4.4: read and summarize the `restrict_ai_audit_admin_access` migration; document any RLS policies it adds.
- §11.1: replace "All entries are manual" with a verified-via-query statement (or mark as unverified).
- §12.3: change "adjacent infrastructure only" verdict text to specify *which* tables the admin UI can mutate (audit-trail tables, not content tables).
- Add §"Permission-scope nuances" listing actions that mutate audit state under `admin.content.view` (not `approve`), so Phase 7 doesn't assume otherwise.

### `state-doc-contradictions.md`
- Add the 5 missing rows enumerated in §4 above.
- For row 12 ("Phase 1A evidence docs are still being created and reviewed"), update once this review is incorporated.
- Promote the source-pack contradiction's resolution column to also list "blocks pilot candidate selection in source-grounding role."

### `pilot-candidate-shortlist.md`
- De-duplicate (5+ duplicates noted).
- Re-derive component complexity from per-article `ui-blocks.json` after the freshness reconciliation.
- Rename to "candidate pool" or trim to ~40.
- Split `source-grounding` role into `source-grounding-feasible` vs. `unsourced-baseline`.
- Add a question-bank-only failure-mode cluster (orphan questions, missing keys, duplicates).
- Fill in or remove "Unknown" source coverage entries.
- Reconcile smoke pilot count with the pilot plan (2 vs. 20).

---

**Bottom line:** The five Phase 1A docs are substantively sound and evidence-grounded — better than typical plan-doc inventories. Three issues prevent immediate sign-off: a real corpus-level data contradiction (UI blocks) is undocumented; the safety classification taxonomy conflates DB- and local-mutation; and the pilot candidate file conflates pool, shortlist, and roles. None of these require new code. All can be fixed by document edits before Phase 1A closes.