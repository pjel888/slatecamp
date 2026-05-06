# Phase 0.6 Source Reconciliation Tooling — Review Memo

**Verdict: PASS_WITH_MINOR_NOTES**

The five scripts collectively constitute a discovery-only reconciliation pipeline. They read local evidence, hash files, and emit deterministic reports/payloads under `.ai/03_plans/...`. No Supabase client is imported, no HTTP fetch is performed, no source is promoted, and dry-run flags are baked into the payload model with runtime guards.

## What I verified

**Non-mutating / no hidden writes** ✓
- No `@supabase/*` import anywhere in the five files; no `fetch` / network call.
- Only filesystem writes target `.ai/03_plans/content-editorial-pipeline-2026-05-05/*.generated.*` and one validation `.md`.
- The schema probe (`validate-admin-ai-audit-schema.ts:30`) shells out to `psql` with a single `select` against `information_schema.tables`. No DDL/DML.

**Dry-run defaults** ✓
- `admin-ai-audit-source-payload.dry-run.json` payload sets `dry_run: true`, `db_write_attempted: false` literal in `build-source-verification-admin-payload.ts:62-63`. `validatePayload()` (`:101-110`) throws if either flips, or if any proposal proposes `allowed_use`, `source_approval`, `article_content`, or `question_content` change ≠ `'none'`.
- Schema probe defaults to `dry_run: true` regardless of env presence; when env is missing, it short-circuits to `DB_SCHEMA_PROBE_SKIPPED_NO_ENV` and never opens a connection.

**No source approval promotion** ✓
- `MatrixRow.source_approval_status` and `source_pack_creation_status` are typed as the literal `'blocked'` (`source-reconciliation-utils.ts:62-63`) — assignments other than `'blocked'` would not compile.
- `FORBIDDEN_PROMOTION_VALUES` (`:13-23`) plus `assertNoPromotionStatusValues` (`:269-282`) scans every record with a status-like key for forbidden values and throws. This guard is invoked in all three downstream scripts before write.
- `readinessForRow` (`:259-267`) caps best-case state at `eligible_for_future_human_review`; even that does not promote — gate fields remain `blocked`.

**Hash/mismatch posture for the named documents** ✓
- **RA 11201** (bundle 18): `exact_hash_match` on raw PDF + `conversion_layer_mismatch: true` (regex matches "conversion"/"ocr" in the lead's `conflict_type`/`local_file_hash_if_known`) → readiness `blocked_conversion_mismatch`. Conservative: hash match alone is not promoted.
- **RA 11285** (bundle 19): `exact_hash_match` + `locator_not_checked` → readiness `blocked_missing_locators`. SME-required blocker also recorded. Conservative.
- **DOE DC2019-11-0014**: lead reports no local PDF, but token-based candidate scoring still finds matches (RA 11285 sibling files), so matrix records `multiple_local_candidates` → `blocked_hash_mismatch`. Effect on gate posture is conservative; classification semantics are slightly imprecise (see Minor below).
- **BP 344 2024 IRR**: official `7c4a75a5…` vs local `63ba8df9…` correctly resolves to `multiple_local_candidates` + `local_webpage_pdf_vs_official_download_pdf_hash_mismatch` → blocked.
- **PD 1096 IRR**: 432-page DPWH `a482d110…` vs local 368-page `ca465dd2…` resolves to `multiple_local_candidates` + `local_version_vs_current_dpwh_download_hash_mismatch` → blocked.

**Locator/readiness conservatism** ✓
- `deriveLocatorStatus` defaults to `locator_missing` when no signal, and to `locator_not_checked` when derived text exists but evidence isn't yet extracted. Only an explicit "found"/"yes" promotes to `locator_supported`. The `readinessForRow` cascade rejects anything below `locator_supported` even before checking SME flags.

**Admin payload dry-run** ✓
- All 9 items, 28 findings, 9 proposals carry `source_approval_status: 'blocked'` and proposal-type `maintain_blocked_gate_and_collect_evidence`. The `proposed_next_action` is the row's `next_action`, with no content delta. Output validation `.md` confirms.

**TypeScript** ✓
- `MatrixRow` literal-typed status fields prevent silent promotion at compile time.
- `assertNoPromotionStatusValues` accepts `Record<string, unknown>[]` — callers cast through `unknown`, which is correct given the heterogeneous record shapes.
- Empty input guards (`leads.length === 0`, `rows.length === 0`) throw rather than silently emit empty payloads.

**Validation completeness** ✓
- `assertNoPromotionStatusValues` regex `(status|state|decision|readiness|approval|creation|match|flag)$` covers all current status fields including `local_raw_pdf_match_status` and `derived_text_match_status`.
- Schema probe redacts `postgres://...` URLs in stderr (`validate-admin-ai-audit-schema.ts:51-53`).

## Critical issues

None.

## Important issues

None.

## Minor notes

1. **`findCandidates` over-matches when no local file exists.** For DOE DC2019-11-0014 the lead explicitly states `local_pdf_available="not_found_in_001_by_filename_search"` and `local_file_hash_if_known=""`, yet token scoring catches RA 11285 sibling files and the matrix labels the row `multiple_local_candidates` instead of `no_local_pdf`. Gate posture is unaffected (still blocked) but the classification is misleading. Consider an early short-circuit when the lead carries an explicit "not found" signal, or require a token-overlap floor (e.g., require document_code substring) before counting a candidate.

2. **Narrative text leaks into `official_pdf_url` for PD 1216.** `lead.official_gazette_link_if_any` carries `"https://… returned 403 in Claude/Hermes runtime"`. The truthiness check at `readinessForRow:260` therefore treats this as "evidence present." The row still ends up `blocked_hash_mismatch`, so no promotion bypass — but a `URL.canParse()` (or trim-after-whitespace) would make the field cleaner and keep the `blocked_missing_official_evidence` path honest for future leads.

3. **`assertNoPromotionStatusValues` uses exact-equality.** Forbidden values like `approved_pending_review` or `verified_pending_human` would slip past. Defense-in-depth would use `.includes()` against a smaller core list (`approved`, `verified`, `canonical`, `safe_to`, `ready_for`). Not blocking for current data.

4. **Schema probe uses `spawnSync` with 15s timeout.** Fine for a CLI, but if `DATABASE_URL` ever points at a remote project, a slower handshake could trip the timeout. Acceptable trade-off given the read-only intent.

5. **Schema probe `process.exit(1)` on `psql` non-zero status** runs after files are already written — that's good for diagnostics — but the `console.log` JSON line shows `ok: false` on failure; CI consumers should grep status, not exit code only.

## Recommended fixes (optional, non-blocking)

- `source-reconciliation-utils.ts:158-177`: when `lead.local_pdf_available` text contains `"not_found"`, return an empty candidate list so `buildMatrixRow` resolves to `no_local_pdf` rather than `multiple_local_candidates`.
- `source-reconciliation-utils.ts:224`: validate `lead.pdf_url` / `official_gazette_link_if_any` with `URL.canParse(value.split(/\s/)[0])` before assigning to `official_pdf_url`.
- `source-reconciliation-utils.ts:269-282`: switch the forbidden-value check from `text === forbidden` to `text.includes(forbidden)` for a tighter defense-in-depth posture.

Overall the gate posture (zero approvals, zero source-pack creations, zero Supabase mutations, zero admin live sync) is preserved by both type-system constraints and runtime assertions. Safe to keep as the Phase 0.6 deliverable.
