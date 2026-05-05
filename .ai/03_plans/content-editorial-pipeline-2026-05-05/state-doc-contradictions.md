# State Document Contradictions — Phase 1A Evidence

**Generated:** 2026-05-05  
**Scope:** Contradictions between current repo state, exported artifacts, plan assumptions, migrations, comments, and prior review notes.  
**Purpose:** Prevent false confidence before implementation. This is an evidence document, not a design document.

---

## Severity Legend

| Severity | Meaning |
|---|---|
| `BLOCKER` | Must be resolved before the named gate can proceed. |
| `HIGH_RISK` | Can proceed only with explicit constraint/owner; likely to break implementation if ignored. |
| `MEDIUM_RISK` | Needs tracking before pilot or scale. |
| `LOW_RISK` | Documentation or cleanup issue; does not block read-only inventory. |
| `NOTE` | Context to preserve; not a contradiction by itself. |

---

## Contradiction Register

| Contradiction | Evidence A | Evidence B | Severity | Why It Matters | Required Resolution Before |
|---|---|---|---|---|---|
| Source-grounded editorial doctrine exists, but source-pack infrastructure is absent. | Plan pack states every factual change must trace to an approved source pack: `README.md` lines 60–62 and `10-source-pack-and-grounding-plan.md`. | Claude review and repo search confirm no `.ai/16_source_packs/`, no `.ai/content-audit-export/source-packs/`, and no root `001_Raw-Source-Layer/`. | `BLOCKER` | Source-grounded generation/fact checking cannot be proven without source chunks, versions, hashes, and claim linkage. | Phase 0.5 source-pack readiness |
| Exported `sources.json` creates appearance of source readiness, but it is not claim grounding. | `.ai/content-audit-export/export-summary.json` reports 1,110 sources; `current-artifact-map.md` classifies bundle `sources.json` as Supabase-exported source metadata. | `readiness-report.md` states source packs and source-chunk ledger do not exist. | `BLOCKER` | Metadata links are not enough to prove a generated or revised factual claim is supported by a specific source excerpt. | Phase 0.5 source-pack readiness |
| Product launch posture is live-AI-provider-free, but the editorial pipeline plan requires AI providers in later phases. | `README.md` line 13 states the launch pass is explicitly payment-free and live-AI-provider-free; `docs/product-ux-ui-feature-audit.md` also states live-AI-provider-free. | `05-ai-prompt-and-model-roles-plan.md`, prompt templates, and Phases 3–6 assume AI diagnosis/proposal/checker roles. | `BLOCKER` | Provider-backed workers may conflict with the current product posture unless explicitly scoped as internal/offline editorial tooling. | Phase 1B |
| Package commands advertise fact-check/rewrite, but those commands are guarded stubs. | `package.json` exposes `content-audit:fact-check` and `content-audit:rewrite`. | `package.json` maps both to `scripts/content-audit/ai-feature-guard.ts`; `run-content-roundtrip.ts` also maps `fact-check` and `rewrite` to the guard. | `BLOCKER` | Anyone reading command names could incorrectly assume fact-check/rewrite are functional pipeline stages. | Phase 1B |
| Current admin AI audit exists, but it does not apply content changes. | `/admin/ai-audit` routes, actions, queries, and DB tables exist; `admin-ai-audit-current-state.md` maps 10 page routes and Server Actions. | `admin-ai-audit-current-state.md` records `createChangeProposal` and `updateProposalStatus` as staged-only and not mutating `wiki_articles.content` or `questions`. | `HIGH_RISK` | The admin surface is adjacent infrastructure, not a full production editorial pipeline. Plans must not assume browser approval applies content. | Phase 1B |
| AI audit DB foundation exists, but replay-grade provenance is incomplete. | Migration `20260501085339_create_ai_audit_admin_tables.sql` creates `ai_audit_runs`, `ai_audit_items`, `ai_audit_findings`, `ai_change_proposals`, `ai_review_decisions`, and status cache structures. | `15-observability-and-replay-plan.md` requires prompt version, source-pack version, provider/model, validator version, raw output hash, final diff, and replay fields; these are not yet fully mapped to DB columns or JSONB. | `HIGH_RISK` | Reviewers cannot reconstruct why an AI proposal was made without prompt/source/model/version traceability. | Phase 1B |
| Question-bank scale exists, but question workflow is not equivalent to article workflow. | `.ai/content-audit-export/export-summary.json` reports 7,159 questions; article bundles include `linked-questions.json`; `push-question-to-supabase.ts` exists. | `11-question-bank-specific-plan.md` says questions need first-class handling; current plan still centers per-article artifacts and only partial `question-edits/` conventions. | `HIGH_RISK` | Answer keys, distractors, rationales, duplicate detection, and scoring metadata fail differently from prose. | Phase 1B |
| Historical fact-checking artifacts exist, but they are not source packs and not active pipeline outputs. | `.ai/14_fact_checking/` has 446 files including 418 flag files and 13 question-flag files. | `current-artifact-map.md` classifies these as `REVIEW_ARTIFACT` / `GENERATED_REPORT` / `DO_NOT_USE_AS_GROUNDING_SOURCE`; `ai-feature-guard.ts` disables active AI fact-check/rewrite commands. | `HIGH_RISK` | Prior flags are useful evidence but must not be used as primary factual authority or proof of current source grounding. | Phase 1A |
| Content optimization artifacts exist, but they are not current executable editorial pipeline guarantees. | `.ai/15_content_optimization/` has reports such as `final-audit-report.md`, `release-readiness-report.md`, and closure/state artifacts. | The new plan pack requires structured artifacts (`editorial-diagnosis.json`, `fact-ledger.json`, `proposed-edits.json`, etc.) that are not produced by `.ai/15_content_optimization/`. | `HIGH_RISK` | Historical optimization success does not mean the new pipeline can safely rewrite 500+ articles. | Phase 1A |
| Roundtrip safety exists for articles, but not for source-grounded AI proposals. | `scripts/content-audit/normalize-article-bundles.ts`, `compose-candidates.ts`, `diff-candidates.ts`, `validate-bundles.ts`, and `push-candidates-to-supabase.ts` exist and are mapped in `current-script-map.md`. | The plan requires fact ledgers, source-pack citation completeness, prompt eval, model role configs, and post-edit fact checks that do not yet exist. | `HIGH_RISK` | A safe markdown roundtrip does not equal safe AI editorial transformation. | Phase 1B |
| Local export is large and useful, but freshness against live Supabase is not proven for future implementation start. | Local export reports 567 articles and 7,159 questions. | `readiness-report.md` notes export freshness must be confirmed before implementation; current Phase 1A docs are based on local artifacts. | `MEDIUM_RISK` | Pilot selection and validation may drift if Supabase changes before implementation begins. | Pilot |
| `tmp-*.ts` debug scripts remain beside production content-audit scripts. | `current-script-map.md` maps six `tmp-*.ts` files as `DEBUG_OR_TMP`. | They are in the same script directory as core commands and some perform direct push/fetch debugging. | `MEDIUM_RISK` | Accidental execution or reuse could bypass planned safety gates. | Phase 1A |
| Some article candidates show zero source coverage in high-risk legal/code clusters. | `pilot-candidate-shortlist.md` marks many PD 1096, BP 344, RA 9266, and RA 9514 candidates as 0 sources. | The benchmark plan requires high-risk legal/code source-grounded checking. | `BLOCKER` | High-risk pilot cannot validate source-grounded editing until approved source packs cover these clusters. | Phase 0.5 source-pack readiness |
| Component inventory exists, but prop/nesting/schema validation is not yet proven. | `scan-component-inventory.ts`, `wiki-component-whitelist.json`, and component inventory outputs exist. | `08 Custom Component Readiness` in `readiness-report.md` says Phase 1A must determine whether inventory is name-only or prop/nesting aware. | `HIGH_RISK` | An AI proposal may insert a valid component name with invalid props or invalid MDX nesting. | Phase 1B |
| Admin review operations exist as actions, but reviewer SLA/authority is not finalized. | Admin actions can create manual findings, proposals, decisions, and run items. | `18-reviewer-ops-and-sla-plan.md` still contains decision questions; `readiness-report.md` says roles, capacity, authority, and SLA are unanswered. | `HIGH_RISK` | Human review gate is not meaningful unless authority and throughput are defined. | Pilot |
| Rollback is planned but not rehearsed. | `19-rollback-drill-plan.md` exists; roadmap now includes Phase 4.5 rollback/failure/admin-visibility rehearsal before local apply. | No rollback drill report exists yet. | `HIGH_RISK` | No generated or locally applied edits should proceed toward production without proven recovery. | Phase 4.5 rollback rehearsal |
| Artifact versioning is planned, but semver/provenance policy is not finalized. | `04-data-artifact-schema-plan.md` and `15-observability-and-replay-plan.md` require artifact schema/version fields. | Claude review flagged date-like schema versions and missing source-pack/prompt-version hashes in replay requirements. | `MEDIUM_RISK` | Schema churn during pilot could make outputs unreplayable or incomparable. | Phase 1B |
| Phase 1A evidence docs required Claude correction before sign-off. | `02-audit-and-readiness-plan.md` requires `readiness-report.md`, `current-script-map.md`, `current-artifact-map.md`, `admin-ai-audit-current-state.md`, `state-doc-contradictions.md`, and `pilot-candidate-shortlist.md`. | Claude Phase 1A review found corrections: UI-block contradiction, local-vs-DB mutation taxonomy, admin permission nuance, pilot-pool issues. | `MEDIUM_RISK` | Phase 1A can proceed as read-only inventory, but acceptance requires incorporating the review corrections. | Phase 1A |
| Pilot candidate shortlist is a candidate pool, not a final benchmark sample. | `pilot-candidate-shortlist.md` intentionally lists a candidate pool across clusters. | `03-pilot-study-and-benchmark-plan.md` still requires choosing a 20-article smoke pilot and 30–35 article benchmark pilot. | `NOTE` | The pool should not be mistaken for the actual pilot set. | Pilot |
| Corpus summary says zero UI blocks, but per-article artifacts contain UI blocks. | Claude Phase 1A review confirmed `export-summary.json` reports `ui_block_count: 0` across all 567 articles and `parser_status: "not_started"`. | Sampled per-article `ui-blocks.json` contains real blocks, and normalized/candidate artifacts exist. | `HIGH_RISK` | Component-complexity ratings and UI-block readiness cannot rely on corpus summary fields until canonical artifact source is declared. | Phase 1A |
| Parser status says not started, but normalized roundtrip artifacts exist. | `export-summary.json` reports `parser_status: "not_started"` corpus-wide. | Article bundles contain `normalized.md`, `ui-blocks.json`, `candidate.md`, and diff artifacts from the roundtrip pipeline. | `HIGH_RISK` | The export summary appears stale or incomplete for parser-state fields; using it for readiness would understate component/roundtrip work already done. | Phase 1A |
| Shared library safety was not initially inventoried. | `02-audit-and-readiness-plan.md` required inspecting `scripts/content-audit/lib.ts`. | Initial script map focused on executable scripts; `lib.ts` is now added as a shared dependency needing review. | `MEDIUM_RISK` | Library behavior can alter dry-run semantics, placeholder parsing, and DB access across many commands. | Phase 1A |
| Admin permission boundaries are more nuanced than approve-only. | `updateProposalStatus(approved)` requires `admin.content.approve`. | Several audit-state mutations and target-status overrides require only `admin.content.view`. | `MEDIUM_RISK` | Future pipeline integration must not assume all meaningful admin-state changes require approve-level authority. | Phase 1B |
| Superseded plan disposition is not cross-linked by every inventory doc. | `00-existing-plan-disposition.md` archives prior plan folders as superseded inputs. | The five inventory docs do not all cite that disposition decision. | `LOW_RISK` | If a prior plan contains conflicting assumptions, a reader may not know which source wins. | Phase 1A |
| `taxonomy_sources` table comment claims completeness, but live row count is 0. | `DATABASE_SCHEMA.sql` defines `taxonomy_sources`; table comment (per Philip's live observation) says "v5.0 COMPLETE: all 66 source URLs populated with verified official URLs." | Live Supabase read-only check on 2026-05-05 reports `taxonomy_sources: 0 rows`. | `BLOCKER` | Source-grounded editorial pipeline cannot use a table with 0 rows as a source authority, regardless of comment claims. | Phase 0.5 source-pack readiness |
| Local admin AI audit migration exists but is not visible in live applied migrations. | Repo contains `supabase/migrations/20260505145349_restrict_ai_audit_admin_access.sql`. | Philip did not see this migration in the live applied migration list; live endpoint is `20260505132000_create_user_exam_date_preferences` (earlier timestamp). | `HIGH_RISK` | If `ai_audit_*` tables exist live, authenticated learners may retain unintended SELECT access on audit views. | Phase 1B |
| No obvious live public `ai_audit_*` tables are visible. | Repo docs (`admin-ai-audit-current-state.md`) and code assume 6 audit tables + views exist. | Philip's live public table list did not show obvious `ai_audit_*` tables. | `HIGH_RISK` now; upgrade to `BLOCKER` if deterministic `information_schema.tables` query returns zero rows. | Admin AI audit surface may be non-functional or using different storage; plans assuming live audit tables may fail. | Phase 1B |
| Existing `question-edits/` coverage changes pilot risk classification. | Phase 1A follow-up found 130 `question-edits/` directories, 107 with JSON files, 860 JSON files total. | `pilot-candidate-shortlist.md` does not yet score candidates by prior question-edit/review artifact presence. | `MEDIUM_RISK` | Articles with existing question-edit artifacts are higher-risk pilots because new article edits may conflict with prior QA/question edits. | Pilot selection |
| `wiki_article_sources` has 1,110 rows but provenance is not yet verified. | Live Supabase count reports `wiki_article_sources: 1,110 rows`; export summary reports matching source count. | `taxonomy_sources` proves source-related table comments/count assumptions can be misleading; article source rows may be metadata links rather than verified source-pack excerpts. | `BLOCKER` | Phase 0.5 must decide whether `wiki_article_sources` can substitute for any part of source-pack grounding or only seed source discovery. | Phase 0.5 source-pack readiness |
| Existing `BATCH_VERIFIED` stamps have unconfirmed current authority. | Some `question-edits/review-notes.json` files contain claims such as `BATCH_VERIFIED`. | Active AI fact-check/rewrite commands are guarded by `ai-feature-guard.ts`; prior AI/QA stamps may not represent current accepted QA. | `MEDIUM_RISK` | Prior review notes are useful risk evidence but cannot be treated as source-grounded validation without provenance and re-checking. | Phase 1B |

---

## Phase 1A Safe Conclusions

- Existing scripts and artifacts can be mapped read-only.
- Local export evidence can support candidate-pool selection.
- Admin UI/database current state can be documented.
- Historical fact-check/optimization artifacts can be used as risk evidence, not as source authority.

## Still Blocked

- Source-grounded AI generation/checking.
- Any rewrite pipeline.
- Any answer-key change workflow.
- Any Supabase mutation.
- Any browser-triggered AI execution.
- Any production pilot.
- Any admin AI audit operation that assumes live `ai_audit_*` tables exist and are properly restricted.

## Claude Review Focus

Claude should review whether:

1. Any contradiction is overstated or unsupported by repo evidence.
2. Any blocker should be moved to a different gate.
3. Any hidden contradiction is missing from the register.
4. Any historical artifact is being over-trusted.
5. The Phase 1A safe conclusions are too permissive.
6. The `taxonomy_sources` contradiction is correctly classified as `BLOCKER` given the source-pack readiness gate.
7. The `ai_audit_*` table visibility contradiction should be upgraded to `BLOCKER` if live absence is confirmed.
8. Whether `restrict_ai_audit_admin_access.sql` should be applied to live Supabase immediately, or if it is intentionally deferred.
