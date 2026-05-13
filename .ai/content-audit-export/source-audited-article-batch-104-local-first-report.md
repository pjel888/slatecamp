# Source-Audited Article Batch 104 Local-First Report

- Batch ID: source-audited-article-batch-104-local-first
- Generated at: 2026-05-13T11:58:43+08:00
- Branch: 3dlab-gray-viewport-bg
- Baseline commit: e6c5a6cf3
- Previous accepted batch commit: ddf04af43
- Status: pass
- Scope: 5 eligible fixed/manifest articles, 50 linked questions, 50 question-edit JSON files.
- Primary source rule: local raw PDFs under `vitruvius-connection/001_Raw-Source-Layer`, with local conversions or batch OCR extract for line anchors.
- Forbidden actions observed: no Supabase push, no deploy, no production DB mutation, no merge to main.

## Selected Articles

| Article | Status | Sources | Linked Questions | Question Edits | Scenario |
| --- | --- | ---: | ---: | ---: | --- |
| lea-prac-frm-019-project-management-in-an-architectural-firm-scope-schedule-budget-and-communication-control | pass | 3 | 10 | 10 | added |
| lea-prac-frm-020-technical-specifications-writing-csi-masterformat-specification-types-and-the-architect-s-responsibility | pass | 4 | 10 | 10 | added |
| lea-prac-frm-021-quantity-surveying-and-cost-estimation-the-architect-s-role-vs-the-qs-professional | pass | 3 | 10 | 10 | added |
| lea-prac-cmp-001-core-concept | pass | 2 | 10 | 10 | added |
| lea-prac-cmp-002-factors-that-determine-project-group-classification-a-decision-framework | pass | 2 | 10 | 10 | added |

## Validation Gates

- Compose/diff/validate strict 5/5: pass
- UI-block edit validation: pass
- Scoped JSON parse: pass (108 files)
- Placeholder/internal-note/source-gap scan: pass
- Source hash checks: pass (28 files)
- Linked-question/question-edit count checks: pass
- Stale compose-error scan: pass
- Prior-batch duplicate selection scan: pass
- Targeted content-audit tests: pass
- Scoped git diff --check: pass
- Cached diff check: pass

## Source Decisions

- FRM-019 kept project management claims to UAP phase deliverables, Construction Project Management Handbook control practices, and UAP contract-document/change-control context.
- FRM-020 rewrote unsupported CSI MasterFormat precision into source-safe specification, conflict, addenda, and performance-characteristic questions. Exact CSI division structure remains final-depth source-needed.
- FRM-021 rewrote unsupported percentage accuracy claims into source-safe cost-estimate limitation, PCC, and quantity-checking claims. Exact QS credential scope and estimate accuracy ranges remain final-depth source-needed.
- CMP-001 resolved fee-table support by adding a batch-scoped OCR conversion anchor for SPP 202 PDF pages 55-57 and preserving UAP Standards line anchors for classification and PCC.
- CMP-002 tightened classification factors to source descriptions and rejected invented automatic escalation rules based on prestige, consultant count, fast-track status, LEED status, or site difficulty alone.

## Follow-On Handoff

Continue Batch 105 with the next eligible fixed/manifest articles not selected in accepted Batches 087-104. Preserve THIN_NEEDS_EXPANSION, scenario eligibility, and source-primary findings for the final depth remediation pass after all local-first batches are complete.
