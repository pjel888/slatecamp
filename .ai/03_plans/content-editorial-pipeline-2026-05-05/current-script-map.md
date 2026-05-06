# Current Script Map — Phase 1A Reconciliation

**Generated:** 2026-05-05  
**Scope:** `scripts/content-audit/` and `package.json` `content-audit:*` commands  
**Method:** Read-only source inspection of every `.ts` file and `package.json` commands  
**Purpose:** Classify every script for Phase 1A safety before any mutation

---

## Classification Legend

| Classification | Meaning |
|---|---|
| `SAFE_PHASE_1A_READ_ONLY` | Reads local files or DB and does not write DB or content-shape artifacts. Safe for evidence gathering when command scope is explicit. |
| `LOCAL_MUTATING_NOT_PHASE_1A` | Does not write Supabase, but changes local derived artifacts such as `normalized.md`, `candidate.md`, `ui-blocks.json`, reports, or sync state. Not Phase 1A-safe unless Philip explicitly authorizes regeneration. |
| `UNSAFE_MUTATING` | Writes to Supabase DB (`wiki_articles`, `questions`, or `ai_audit_*`) or dispatches to commands that can. Requires explicit approval, dry-run proof, and rollback/recovery planning. |
| `UNKNOWN_NEEDS_REVIEW` | Behavior not fully determined from source read. Needs SME review before classification. |
| `DEBUG_OR_TMP` | Ad-hoc debug/test scripts. Not part of the pipeline. Do not run without explicit need. |
| `DEPRECATED_OR_SUPERSEDED` | Superseded by newer scripts or no longer relevant; still runnable/importable until archived with approval. |

**Safety note:** Phase 1A is read-only inventory. Local writes can still shift hashes, regenerate artifacts, or mask drift. This map distinguishes DB mutation from local mutation.

---

## Script Inventory

### 1. `export-article-bundles.ts`
- **Package commands:** `content-audit:pull`, `content-audit:export`
- **Reads:** `wiki_articles` table (via Supabase service-role client), local sync-state.json, local article directories
- **Writes:** Local `.ai/content-audit-export/articles/*/` (original.md, article-metadata.json, linked-questions.json, sources.json, taxonomy.json), manifest.json, export-summary.json, sync-state.json, run-log.json
- **DB access:** `createContentAuditSupabaseClient()` — reads `wiki_articles`, `wiki_article_taxonomy`, `questions`, `wiki_article_sources`
- **Mutating:** No Supabase writes. Only local file writes.
- **Touches articles/questions/sources:** Yes — exports article content, linked questions, sources, taxonomy
- **Provider/API dependencies:** Supabase only (service-role client)
- **Risk:** LOW (read-only on DB, writes to local export directory only)
- **Phase 1A Safety:** `SAFE_PHASE_1A_READ_ONLY`
- **Notes:** Core export pipeline. Changed-only incremental mode supported via `--changed-only`. Exports 567 articles, 7,159 questions, 1,110 sources.

### 2. `normalize-article-bundles.ts`
- **Package commands:** `content-audit:normalize`
- **Reads:** Local article directories (original.md, article-metadata.json)
- **Writes:** Local article directories (normalized.md, ui-blocks.json, parser-errors.json, ui-block-edits.json, article-metadata.json updated), sync-state.json
- **DB access:** None
- **Mutating:** No Supabase writes. Local file writes only.
- **Touches articles/questions/sources:** Touches article content (normalized.md is derived from original.md)
- **Provider/API dependencies:** None
- **Risk:** LOW (local-only transformation)
- **Phase 1A Safety:** `SAFE_PHASE_1A_READ_ONLY`
- **Notes:** Parses original.md -> extracts UI blocks -> produces normalized.md with placeholders. Does NOT touch original.md.

### 3. `scan-component-inventory.ts`
- **Package commands:** `content-audit:inventory`, `content-audit:components`
- **Reads:** Local article directories (ui-blocks.json, normalized.md), repo source for component registry
- **Writes:** Local `.ai/content-audit-export/component-inventory/` (components.json, component-files.json, component-usage-in-articles.json, unknown-components.json, component-audit-report.json, component-fit-notes.md)
- **DB access:** None
- **Mutating:** No Supabase writes. Local file writes only.
- **Touches articles/questions/sources:** Reads article UI blocks for component usage mapping
- **Provider/API dependencies:** None
- **Risk:** LOW
- **Phase 1A Safety:** `SAFE_PHASE_1A_READ_ONLY`

### 4. `suggest-component-placements.ts`
- **Package commands:** `content-audit:component-suggestions`
- **Reads:** Local article directories, component-inventory/components.json
- **Writes:** Local suggestion report JSON
- **DB access:** None
- **Mutating:** No Supabase writes. Local file writes only.
- **Touches articles/questions/sources:** Reads article content for analysis only
- **Provider/API dependencies:** None
- **Risk:** LOW
- **Phase 1A Safety:** `SAFE_PHASE_1A_READ_ONLY`
- **Notes:** Metadata-only report — explicitly does not rewrite articles. Comment: "This report is metadata-only. It does not insert components or rewrite articles."

### 5. `map-component-usage.ts`
- **Package commands:** None (standalone)
- **Reads:** Local article directories
- **Writes:** Local mapping report
- **DB access:** None
- **Mutating:** No
- **Phase 1A Safety:** `SAFE_PHASE_1A_READ_ONLY`

### 6. `validate-bundles.ts`
- **Package commands:** `content-audit:validate`
- **Reads:** Local article directories (all bundle files), manifest.json, sync-state.json
- **Writes:** Local validation report JSON
- **DB access:** None
- **Mutating:** No
- **Touches articles/questions/sources:** Reads all bundle artifacts for structural validation
- **Provider/API dependencies:** None
- **Risk:** LOW
- **Phase 1A Safety:** `SAFE_PHASE_1A_READ_ONLY`
- **Notes:** Validates file existence, hash consistency, placeholder integrity, UI block validity.

### 7. `validate-ui-block-edits.ts`
- **Package commands:** `content-audit:ui-block-edits`
- **Reads:** Local article directories (ui-blocks.json, article-metadata.json)
- **Writes:** Local validation report JSON
- **DB access:** None
- **Mutating:** No
- **Phase 1A Safety:** `SAFE_PHASE_1A_READ_ONLY`

### 8. `compose-candidates.ts`
- **Package commands:** `content-audit:compose`
- **Reads:** Local article directories (normalized.md, ui-blocks.json, article-metadata.json, original.md)
- **Writes:** Local article directories (candidate.md, compose-report.json, compose-error.json), sync-state.json
- **DB access:** None
- **Mutating:** No Supabase writes. Local candidate.md generation only.
- **Touches articles/questions/sources:** Generates candidate.md from normalized.md + ui-blocks.json
- **Provider/API dependencies:** None
- **Risk:** LOW
- **Phase 1A Safety:** `LOCAL_MUTATING_NOT_PHASE_1A`
- **Notes:** Pure local transform. Does NOT push to Supabase, but re-running it changes `candidate.md`, compose reports, sync-state hashes, and downstream diff baselines. Use only after explicit regeneration approval.

### 9. `compose-candidate.ts` (singular)
- **Package commands:** None (standalone, likely superseded by compose-candidates.ts)
- **Phase 1A Safety:** `DEPRECATED_OR_SUPERSEDED`
- **Notes:** Single-article version. `compose-candidates.ts` is the canonical batch version.

### 10. `diff-candidates.ts`
- **Package commands:** `content-audit:diff`
- **Reads:** Local article directories (original.md, candidate.md, normalized.md, ui-blocks.json, article-metadata.json)
- **Writes:** Local article directories (diff-report.json, diff-report.md), sync-state.json
- **DB access:** None
- **Mutating:** No Supabase writes. Local diff generation only.
- **Provider/API dependencies:** None
- **Risk:** LOW
- **Phase 1A Safety:** `SAFE_PHASE_1A_READ_ONLY`

### 11. `diff-candidate.ts` (singular)
- **Package commands:** None (standalone)
- **Phase 1A Safety:** `DEPRECATED_OR_SUPERSEDED`

### 12. `push-candidates-to-supabase.ts`
- **Package commands:** `content-audit:push:dry-run`, `content-audit:push:apply`, `content-audit:push`
- **Reads:** Local article directories (candidate.md, original.md, article-metadata.json, diff-report.json, ui-blocks.json), `wiki_articles` table for content-hash verification
- **Writes:** **Supabase `wiki_articles`** (content field) via `.eq('content', original)` safety gate, sync-state.json, push report
- **DB access:** `createContentAuditSupabaseClient()` — **WRITES** to `wiki_articles.content`, reads `wiki_articles.content` for hash verification
- **Mutating:** **YES — writes to production content.**
- **Touches articles:** Directly updates `wiki_articles.content`
- **Provider/API dependencies:** Supabase
- **Risk:** **HIGH** — writes to live article content. Requires `--apply` + `--confirm "APPLY ALL SAFE CONTENT AUDIT PUSHES"` to bypass dry-run. Uses `updateArticleContentIfUnchanged` safety gate.
- **Phase 1A Safety:** `UNSAFE_MUTATING`
- **Notes:** Default mode is `--dry-run`. Requires explicit confirmation. Has `assertBulkApplyConfirmation` guard.

### 13. `push-to-supabase.ts`
- **Package commands:** None (1-line re-export)
- **Content:** `import './push-candidates-to-supabase'`
- **Phase 1A Safety:** `DEPRECATED_OR_SUPERSEDED`
- **Notes:** Thin alias for push-candidates-to-supabase.ts.

### 14. `push-question-to-supabase.ts`
- **Package commands:** `content-audit:push-question:dry-run`, `content-audit:push-question:apply`
- **Reads:** Local article directories (linked-questions.json, article-metadata.json), `questions` table for baseline hash verification
- **Writes:** **Supabase `questions`** table (text, options, correct_option_id, rationale, etc.)
- **DB access:** `createContentAuditSupabaseClient()` — **WRITES** to `questions`
- **Mutating:** **YES — writes to question bank.**
- **Touches questions:** Directly updates `questions` rows
- **Provider/API dependencies:** Supabase
- **Risk:** **HIGH** — writes to live question bank. Uses `ALLOWED_UPDATE_FIELDS` whitelist.
- **Phase 1A Safety:** `UNSAFE_MUTATING`
- **Notes:** Default dry-run. Requires `--question-id` or `--question`.

### 15. `sync-run-log-to-admin-audit.ts`
- **Package commands:** `content-audit:admin-log`
- **Reads:** Local run-log.json from content-audit-export/runs/
- **Writes:** **Supabase `ai_audit_runs`** table (INSERT)
- **DB access:** `createContentAuditSupabaseClient()` — **WRITES** to `ai_audit_runs`
- **Mutating:** **YES — writes to admin audit infrastructure.**
- **Touches admin preview tables:** Writes to `ai_audit_runs` (admin audit log table, not article content)
- **Provider/API dependencies:** Supabase
- **Risk:** **MEDIUM** — writes to admin audit tables, NOT to article/question content. Errors are non-fatal (logged as warnings).
- **Phase 1A Safety:** `UNSAFE_MUTATING` (but low blast radius — only ai_audit_runs, not content)
- **Notes:** Syncs run-log metadata to admin audit surface for traceability. "Optional admin audit logging" — errors are warnings, not blockers.

### 16. `ai-feature-guard.ts`
- **Package commands:** `content-audit:fact-check`, `content-audit:rewrite`
- **Content:** Exits immediately with code 2. Prints: "[feature] is intentionally disabled for the content round-trip foundation: no AI APIs, fact-checking, or automatic rewriting are integrated in this milestone."
- **DB access:** None
- **Mutating:** No
- **Phase 1A Safety:** `SAFE_PHASE_1A_READ_ONLY`
- **Notes:** Intentional guard. All AI features are gated behind this disabled command. This is BY DESIGN for the current milestone.

### 17. `run-content-roundtrip.ts`
- **Package commands:** `content-audit:roundtrip`
- **Function:** Orchestrator that spawns child processes for each pipeline step
- **Reads/Writes:** Depends on which sub-command is run
- **Mutating:** Depends on sub-command (delegates to push-* for mutations)
- **Phase 1A Safety:** `UNSAFE_MUTATING` (orchestrator dispatches to unsafe children if invoked with push/admin-log/question-push steps)
- **Notes:** Simple `spawnSync` dispatcher mapping command names to script paths. Classify individual invocations by child command; do not list the orchestrator itself as Phase 1A-safe.

### 18. `reconcile-stale-baselines.ts`
- **Package commands:** None (standalone)
- **Reads:** Local article directories, Supabase `wiki_articles.content` for hash comparison
- **Writes:** Local article directories (refreshed original.md, normalized.md, ui-blocks.json, candidate.md, diff-report.json), **then pushes to Supabase `wiki_articles.content`**
- **DB access:** `createContentAuditSupabaseClient()` — reads AND writes `wiki_articles`
- **Mutating:** **YES — full reconciliation pipeline with push.**
- **Touches articles:** Updates `wiki_articles.content` for 26 specific repaired article IDs
- **Risk:** **HIGH** — multi-step mutation. Updates original.md from live Supabase content, re-normalizes, recomposes, diffs, then pushes.
- **Phase 1A Safety:** `UNSAFE_MUTATING`
- **Notes:** Has `--dry-run` and `--apply` modes. Targets 26 specific article IDs with corrupted/hallucinated components.

### 19. `batch-add-ui-blocks.ts`
- **Package commands:** None (standalone)
- **Reads:** Local article directories (normalized.md, ui-blocks.json)
- **Writes:** Local article directories (updated normalized.md with new UI placeholders, updated ui-blocks.json), sync-state.json
- **DB access:** None (local only)
- **Mutating:** No Supabase writes. Local file modification only.
- **Risk:** MEDIUM (modifies local normalized content, but not DB)
- **Phase 1A Safety:** `LOCAL_MUTATING_NOT_PHASE_1A`
- **Notes:** Adds 2-4 UI components per article as placeholders. Hashes local paths (`/Users/philiplewis/slatecamp`). 856 lines — substantial script. Not safe for Phase 1A because it rewrites local `normalized.md` and `ui-blocks.json` even though it does not touch Supabase.

### 20. `normalize-markdown.ts`
- **Package commands:** None (standalone)
- **Reads:** Local markdown files
- **Writes:** Local normalized output
- **DB access:** None
- **Mutating:** No Supabase writes
- **Phase 1A Safety:** `SAFE_PHASE_1A_READ_ONLY`

### 21. `content-audit.test.ts`
- **Package commands:** None (test file)
- **Phase 1A Safety:** `SAFE_PHASE_1A_READ_ONLY`
- **Notes:** Test file for content audit utilities.

### 22. `lib.ts`
- **Package commands:** None directly; imported by multiple scripts.
- **Reads/Writes:** Shared library functions determine actual callers' behavior.
- **DB access:** Defines/exports Supabase client helpers and shared bundle utilities used by export, push, validation, compose, and sync scripts.
- **Provider/API dependencies:** Supabase helper dependencies; no live AI provider call identified in the Phase 1A map.
- **Phase 1A Safety:** `UNKNOWN_NEEDS_REVIEW` as a shared dependency, not a standalone command.
- **Notes:** Must be included in any future command-safety review because library changes can alter dry-run semantics, placeholder parsing, and DB access behavior across many scripts.

---

## TMP / Debug Scripts

All tmp-*.ts files are ad-hoc debug scripts specific to troubleshooting push operations. They contain hardcoded article IDs (`265185c0-c1ac-4f40-8db0-bde23084f634`, `9a20ebf2-c7c1-4c0f-b8bc-8d6139878a0c`) and absolute local paths.

| File | Purpose | Phase 1A Safety |
|---|---|---|
| `tmp-push-debug.ts` | Debug push with strict `.eq('content', original)` hash gate | `DEBUG_OR_TMP` |
| `tmp-push-debug2.ts` | Debug push WITHOUT content hash gate | `DEBUG_OR_TMP` |
| `tmp-push-debug3.ts` | Debug push — compare vanilla vs content-filtered update for small article | `DEBUG_OR_TMP` |
| `tmp-push-debug4.ts` | Debug content hash mismatch — fetches remote content and compares byte-for-byte with local original.md | `DEBUG_OR_TMP` |
| `tmp-direct-push.ts` | Direct push of candidate.md to Supabase bypassing all safety gates | `DEBUG_OR_TMP` |
| `tmp-fetch.ts` | Fetch remote article content and hash for comparison | `DEBUG_OR_TMP` |

**All tmp-*.ts scripts are classified as `DEBUG_OR_TMP`.** They are not part of the pipeline. Do not run without explicit need.

### TMP Risk Note
`tmp-direct-push.ts` directly updates `wiki_articles.content` without the `eq('content', original)` safety gate. This bypasses the primary safety mechanism of the canonical push script. **If run with live Supabase credentials, it would mutate production content without audit trail.**

---

## Package Command Summary

| Command | Script | Classification |
|---|---|---|
| `content-audit:pull` / `:export` | export-article-bundles.ts | `SAFE_PHASE_1A_READ_ONLY` only when explicitly authorized; service-role DB read + local export writes |
| `content-audit:normalize` | normalize-article-bundles.ts | `LOCAL_MUTATING_NOT_PHASE_1A` |
| `content-audit:inventory` / `:components` | scan-component-inventory.ts | `LOCAL_MUTATING_NOT_PHASE_1A` (writes inventory reports) |
| `content-audit:compose` | compose-candidates.ts | `LOCAL_MUTATING_NOT_PHASE_1A` |
| `content-audit:diff` | diff-candidates.ts | `LOCAL_MUTATING_NOT_PHASE_1A` |
| `content-audit:validate` | validate-bundles.ts | `LOCAL_MUTATING_NOT_PHASE_1A` (writes validation report) |
| `content-audit:push:dry-run` | push-candidates-to-supabase.ts --dry-run | `UNKNOWN_NEEDS_REVIEW` for Phase 1A until dry-run/no-write semantics are reverified for the current version |
| `content-audit:push:apply` | push-candidates-to-supabase.ts --apply | `UNSAFE_MUTATING` |
| `content-audit:push` | push-candidates-to-supabase.ts | `UNSAFE_MUTATING` |
| `content-audit:roundtrip` | run-content-roundtrip.ts | `UNSAFE_MUTATING` as an orchestrator because unsafe children are in its dispatch map |
| `content-audit:push-question:dry-run` | push-question-to-supabase.ts --dry-run | `UNKNOWN_NEEDS_REVIEW` for Phase 1A until dry-run/no-write semantics are reverified for the current version |
| `content-audit:push-question:apply` | push-question-to-supabase.ts --apply | `UNSAFE_MUTATING` |
| `content-audit:admin-log` | sync-run-log-to-admin-audit.ts | `UNSAFE_MUTATING` (writes `ai_audit_runs`; remove from safe command list until dry-run semantics are proven) |
| `content-audit:component-suggestions` | suggest-component-placements.ts | `LOCAL_MUTATING_NOT_PHASE_1A` (writes suggestion reports) |
| `content-audit:ui-block-edits` | validate-ui-block-edits.ts | `LOCAL_MUTATING_NOT_PHASE_1A` (writes validation report) |
| `content-audit:fact-check` | ai-feature-guard.ts (disabled) | `SAFE_PHASE_1A_READ_ONLY` (intentionally disabled) |
| `content-audit:rewrite` | ai-feature-guard.ts (disabled) | `SAFE_PHASE_1A_READ_ONLY` (intentionally disabled) |

---

## Summary for Phase 1A

- **Confirmed no DB/content mutation:** `ai-feature-guard.ts`, test files, pure read/inspection done through file reads.
- **Local-write commands:** Most content-audit commands regenerate derived reports or bundle artifacts; they are not Phase 1A-safe unless explicit regeneration is authorized.
- **DB-read command:** `content-audit:pull` reads Supabase using service-role access and writes local export artifacts; treat as authorized read-only export, not casual inspection.
- **DB-mutating commands:** `push:*`, `push-question:*`, `admin-log`, `reconcile-stale-baselines.ts`, and the `roundtrip` orchestrator when it dispatches unsafe children.
- **Debug/tmp scripts:** must not run.
- **All AI features** (`content-audit:fact-check`, `content-audit:rewrite`) are intentionally disabled in `ai-feature-guard.ts`.

### Phase 1A Safe Commands

```bash
# Phase 1A default is file inspection only.
# Do not run local-regeneration or DB-mutating commands unless Philip explicitly authorizes the exact command.
# If export freshness must be checked, prefer a bounded pull dry-run with explicit approval:
# bun run content-audit:pull -- --dry-run --limit 1
```
