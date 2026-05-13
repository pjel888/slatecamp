# Source-Audited Article Batch 106 Local-First Report

- Batch ID: source-audited-article-batch-106-local-first
- Generated at: 2026-05-13T14:20:00+08:00
- Branch: 3dlab-gray-viewport-bg
- Start baseline commit: 527dc3a64
- Previous accepted batch commit: 527dc3a64
- Status: pass local-first; real git stage/commit/push blocked by sandbox `.git` write restriction
- Scope: 5 eligible CMP articles, 50 linked questions, 50 question-edit JSON files.
- Primary source rule: local raw PDFs under `vitruvius-connection/001_Raw-Source-Layer`, with local conversions for line anchors.
- Forbidden actions observed: no Supabase push, no deploy, no production DB mutation, no merge to main.
- Git commit/push state: not performed because this Codex sandbox cannot create `.git/index.lock` or write inside `.git`.

## Selected Articles

| Article | Status | Sources | Linked Questions | Question Edits | Scenario |
| --- | --- | ---: | ---: | ---: | --- |
| lea-prac-cmp-008-choosing-mdpe-vs-percentage-of-pcc-the-decision-matrix | pass | 4 | 10 | 10 | added |
| lea-prac-cmp-009-lump-sum-fixed-fee-scope-discipline-risk-allocation-and-appropriate-use | pass | 5 | 10 | 10 | added |
| lea-prac-cmp-010-per-diem-retainer-and-honorarium-definitions-scope-and-philippine-application | pass | 4 | 10 | 10 | added |
| lea-prac-cmp-011-reimbursable-expenses-what-is-reimbursable-what-is-absorbed-and-how-to-bill | pass | 4 | 10 | 10 | added |
| lea-prac-cmp-012-fees-for-repetitive-designs-reduced-fees-and-their-justification | pass | 3 | 10 | 10 | added |

## Validation Gates

- Compose/diff/validate strict 5/5: pass
- UI-block edit validation: pass
- Scoped JSON parse: pass (107 files)
- Placeholder/internal-note/source-gap scan: pass
- Source hash checks: pass (480 references across 12 unique source artifacts)
- Linked-question/question-edit count checks: pass (50/50)
- Stale compose-error scan: pass
- Prior-batch duplicate selection scan: pass for accepted Batches 087-105; historical re-audit overlap recorded separately
- Targeted content-audit tests: pass (34 pass, 0 fail, 328 expect calls)
- Scoped git diff --check: pass
- Cached diff check: pass via temporary alternate index; real staging is blocked by this sandbox

## Source Decisions

- CMP-008 now separates percentage of PCC from MDPE by service type and measurable-personnel-expense logic, with mixed compensation framed as source-approved project-by-project analysis.
- CMP-009 removed unsupported lump-sum contingency/rate heuristics and anchored fixed/lump-sum use to clearly defined scope, public-project paperwork rationale, and PACS time-limit/extra-compensation clauses.
- CMP-010 distinguishes per diem, honorarium, and retainer using UAP/SPP consulting-service language and keeps blended agreements tied to explicit scopes and reimbursables.
- CMP-011 treats reimbursables as chargeable out-of-pocket costs separate from professional fee, with the UAP Standards 50.0-km travel/living-expense boundary and agreement documentation controls.
- CMP-012 keeps repetitive-design fee discussion to source-backed Group 6/Group 7 classification and rejects automatic discount percentages not present in the checked local sources.

## Follow-On Handoff

Do not start Batch 107 until Batch 106 is actually staged, committed, and pushed outside this sandbox. After that gate, continue Batch 107 with the next eligible fixed/manifest article sequence after CMP-012 unless live artifacts show a later completed batch. Preserve THIN_NEEDS_EXPANSION, scenario eligibility, and source-primary findings for the final depth remediation pass after all local-first batches are complete.
