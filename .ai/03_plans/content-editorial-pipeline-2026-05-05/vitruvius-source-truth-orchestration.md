# Vitruvius Source Truth Orchestration — Phase 0.5C

**Created:** 2026-05-05T14:59:10Z  
**Scope:** Define how `vitruvius-connection/`, official internet sources, source packs, terminal scripts, and `/admin/ai-audit` work together.  
**Status:** Architecture/readiness document. No implementation. No source approval.

---

## 1. Executive Summary

`vitruvius-connection/` should become a core source-intake and knowledge-graph substrate for SlateCamp, but it must not be treated as automatic canonical truth.

Correct role assignment:

```txt
Vitruvius = local corpus + extracted knowledge graph + discovery substrate
Official web = authority/currency verification layer
Source packs = approved grounding layer
/admin/ai-audit = human review and governance surface
Terminal scripts = execution layer
Supabase content tables = mutation target only after approval and dry-run validation
```

---

## 2. Source Authority Stack

| Rank | Layer | Authority Role | Can Ground Claims? |
|---:|---|---|---|
| 1 | Official issuing-body PDF or official current page | Primary authority | Yes after capture/verification |
| 2 | Local PDF matched to official source | Local source candidate | Yes after verification/human approval |
| 3 | Local PDF manually verified by SME/admin | Human-approved source candidate | Yes with review notes |
| 4 | PDF-derived Markdown/text | Search/extraction artifact | Only through verified parent source |
| 5 | Vitruvius canonical source/concept/relationship pages | Discovery and knowledge graph | Not alone |
| 6 | `wiki_article_sources` rows | Citation discovery metadata | Not alone |
| 7 | Existing article/question content | Audit target | No |
| 8 | Third-party mirrors or web summaries | Discovery only | No |

---

## 3. Vitruvius Layer Roles

### 3.1 `002_Raw-Conversion-Layer/`

Use for:

- locating PDFs and extracted source text,
- matching raw/refined Markdown to source identities,
- reading sidecar JSON extraction metadata,
- computing source/text hashes,
- determining locator support and extraction quality.

Do not use for:

- automatic source approval,
- direct article rewriting,
- direct answer-key correction.

### 3.2 `003_Canonical-Knowledge-Layer/`

Use for:

- discovering concepts and relationships,
- identifying candidate source-to-topic coverage,
- finding evidence snippets and document references,
- prioritizing high-impact sources.

Do not use as:

- legal/code authority without underlying verified source,
- a substitute for official-web verification,
- a replacement for page/section locators.

---

## 4. Orchestration Flow

### Stage A — File Inventory

Already completed for Phase 0.5A.2.

```txt
vitruvius-connection/ → file inventory + manifest + hashes + classification + gaps
```

Current result:

```txt
2,551 files visible
47 PDFs
1,840 Markdown/text files
664 JSON/other files
0 verified source candidates
```

### Stage B — Source Bundle Reconciliation

```txt
file rows → source bundles
```

Outputs:

- `source-bundle-map.generated.csv`
- `source-bundle-map.generated.json`
- `source-bundle-reconciliation-report.md`
- `source-bundle-high-risk-queue.md`
- `source-bundle-unpaired-files.md`

### Stage C — Official Web Verification

```txt
source bundles → official URL candidates → match evidence
```

Checks:

- issuing body,
- document title,
- version/effective date,
- amendment status,
- PDF/text fingerprint or hash match,
- page/section spot checks.

### Stage D — Source Verification Packets

```txt
verified evidence → human/SME packet
```

Outputs:

- packet markdown or JSON,
- conflicts list,
- reviewer decision,
- approved allowed use.

### Stage E — Source-Pack Planning

Only approved packets may enter this stage.

```txt
approved source candidate → source pack schema → chunks with locators
```

### Stage F — Article/Question Audit

```txt
source packs + Supabase pull export → findings/proposals/review packets
```

No mutation yet.

### Stage G — Human Review in `/admin/ai-audit`

```txt
local audit outputs → admin run/items/findings/proposals/decisions
```

Admin review decides whether proposals can proceed to terminal dry-run/apply.

### Stage H — Terminal Apply

Only after approval:

```txt
candidate.md / question-edits → validation → dry-run → explicit apply
```

---

## 5. `/admin/ai-audit` Boundary

The admin route exists at:

```txt
src/app/admin/ai-audit/
```

Current correct role:

- visibility,
- review queue,
- findings/proposals display,
- human decisions,
- status cache.

Current non-role:

- no browser-side model provider calls,
- no bulk rewrite execution,
- no direct article/question publishing,
- no source approval without review evidence.

The browser should observe and govern the pipeline. Terminal scripts should execute the pipeline.

---

## 6. Admin AI Audit Mapping

| Pipeline Artifact | Admin Target |
|---|---|
| Source reconciliation run | `ai_audit_runs` |
| One source bundle | `ai_audit_items.target_type = source` |
| Missing official URL | `ai_audit_findings.risk_type = missing_sources` or `needs_source_check` |
| Local/official mismatch | `ai_audit_findings.risk_type = source_conflict` |
| Poor extraction quality | `ai_audit_findings.risk_type = needs_source_check` |
| Source approval packet | `ai_change_proposals.proposal_type = source_update` or review decision metadata |
| Human source approval/rejection | `ai_review_decisions` |
| Article claim issue | `ai_audit_findings.target_type = wiki_article` |
| Question answer-key issue | `ai_audit_findings.target_type = question` |
| Proposed correction | `ai_change_proposals` |

---

## 7. Required Bridge Extension

The existing bridge script:

```txt
scripts/content-audit/sync-run-log-to-admin-audit.ts
```

currently syncs run-level metadata to `ai_audit_runs`.

Future bridge must also support:

1. `ai_audit_items` inserts for source/article/question targets.
2. `ai_audit_findings` inserts for generated findings.
3. `ai_change_proposals` inserts for staged source/content/question proposals.
4. `ai_review_decisions` linkage for admin decisions.
5. `ai_audit_status_cache` updates for target status.
6. Metadata fields for local artifact path and hash.

This is future implementation. Do not claim it exists until code is built and live schema is verified.

---

## 8. Gate Verdict

```txt
VITRUVIUS_AS_DISCOVERY_SUBSTRATE = GO
VITRUVIUS_AS_AUTOMATIC_CANONICAL_TRUTH = NO-GO
OFFICIAL_WEB_VERIFICATION = REQUIRED
SOURCE_PACK_CREATION = BLOCKED UNTIL PACKET APPROVAL
ADMIN_AI_AUDIT_AS_REVIEW_SURFACE = GO IN REPO, LIVE DB STILL BLOCKED
TERMINAL_PIPELINE_AS_EXECUTION_LAYER = GO AFTER SCRIPT IMPLEMENTATION
BROWSER_EXECUTION_OR_DIRECT_PUBLISH = NO-GO
```

---

*End of Vitruvius Source Truth Orchestration.*
