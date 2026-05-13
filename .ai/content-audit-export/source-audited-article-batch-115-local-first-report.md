# Source-Audited Article Batch 115 Local-First Report

- Batch ID: source-audited-article-batch-115-local-first
- Generated at: 2026-05-13T20:45:00+08:00
- Branch: 3dlab-gray-viewport-bg
- Start baseline commit: 9c4d1f5e9
- Previous accepted batch commit: 9c4d1f5e9
- Status: pass local-first; live git stage/commit/push blocked by `.git/index.lock` permission denial.
- Scope: 5 eligible professional-practice articles, 50 linked questions, 50 question-edit JSON files.
- Primary source rule: local raw PDFs under `vitruvius-connection/001_Raw-Source-Layer`, with local conversions for line anchors.
- Forbidden actions observed: no Supabase push, no deploy, no production DB mutation, no merge to main.

## Selected Articles

| Article | Status | Sources | Linked Questions | Question Edits | Scenario |
| --- | --- | ---: | ---: | ---: | --- |
| lea-prac-law-008-lea-structure-subjects-areas-passing-standard-and-retaking | pass | 1 | 10 | 10 | added |
| lea-prac-law-009-certificate-of-registration-oath-taking-and-the-professional-id-card | pass | 1 | 10 | 10 | added |
| lea-prac-law-012-quasi-delict-and-tort-in-architectural-practice-civil-code-articles-2176-2194 | pass | 2 | 10 | 10 | added |
| lea-prac-law-013-ownership-of-architectural-plans-ra-9266-section-33-and-client-rights | pass | 1 | 10 | 10 | added |
| lea-prac-law-016-the-contract-document-package-who-draws-and-who-signs-each-component | pass | 2 | 10 | 10 | added |

## Validation Gates

- Compose/diff/validate strict 5/5: pass
- UI-block edit validation: pass
- Scoped JSON parse: pass; 114 JSON files parsed
- Placeholder/internal-note/source-gap scan: pass
- Source hash checks: pass; 14 checked file references
- Linked-question/question-edit count checks: pass (50/50)
- Stale compose-error scan: pass
- Prior-batch duplicate selection scan: pass for accepted Batches 087-114
- Targeted content-audit tests: pass; 34 pass, 0 fail, 328 expect() calls
- Scoped git diff --check: pass
- Cached diff check: pass via temporary index after staging intended files only
- Real git stage/commit/push gate: blocked_live_index; `git add` failed with `.git/index.lock` permission denial, so real commit/push was not performed.
- GitHub network reachability: blocked_dns_resolution; `git ls-remote --heads origin 3dlab-gray-viewport-bg` could not resolve `github.com`.

## Source Decisions

- lea-prac-law-008-lea-structure-subjects-areas-passing-standard-and-retaking: Bounded to RA 9266 IRR Sections 13, 15, and 16 for LEA subject coverage, rating computation, result reporting, failure, and reapplication consequences.
- lea-prac-law-009-certificate-of-registration-oath-taking-and-the-professional-id-card: Bounded to RA 9266 IRR Sections 18 through 21 for oath, COR, PIC, registry entry, validity, renewal, and signing/sealing authority.
- lea-prac-law-012-quasi-delict-and-tort-in-architectural-practice-civil-code-articles-2176-2194: Bounded to Civil Code Articles 1723, 2176, 2180, 2192, 2194, 1146, and 1150 plus RA 9266 signing/sealing authority for architecture-liability framing.
- lea-prac-law-013-ownership-of-architectural-plans-ra-9266-section-33-and-client-rights: Bounded to RA 9266 IRR definitions of copyright/ownership and Section 33 prohibiting derivative, repeated, or duplicated use without architect consent.
- lea-prac-law-016-the-contract-document-package-who-draws-and-who-signs-each-component: Bounded to RA 9266 IRR Sections 20, 21, 23, and 32 plus UAP Document 301 Articles 1.16 through 5.06 for contract-document preparation, coordination, signing, and sealing.

## Source-Gap Exclusions

- LAW-014 and LAW-015 were not selected because no local RA 8293/IP Code raw PDF exists under `vitruvius-connection/001_Raw-Source-Layer`; both currently lack source evidence and question edits.

## Final-Depth Carryover

- lea-prac-law-008-lea-structure-subjects-areas-passing-standard-and-retaking: Do not restore current PRC online-result workflow, per-subject review mechanics, or modern retaker scheduling without current local PRC/Board sources.
- lea-prac-law-009-certificate-of-registration-oath-taking-and-the-professional-id-card: Do not restore current PRC appointment/online renewal mechanics, CPD-currentness, or replacement-card procedure without current local PRC/CPD sources.
- lea-prac-law-012-quasi-delict-and-tort-in-architectural-practice-civil-code-articles-2176-2194: Removed Article 1155/discovery-date framing and preserved deeper prescription/doctrine reconciliation for final depth if local primary legal sources are added.
- lea-prac-law-013-ownership-of-architectural-plans-ra-9266-section-33-and-client-rights: Do not restore RA 8293/IP Code, moral-rights, transfer/license, or copyright-duration detail until a local primary IP source is added.
- lea-prac-law-016-the-contract-document-package-who-draws-and-who-signs-each-component: Do not restore current permit-office checklist, discipline-specific signing edge cases, or project-delivery contract exhibits without local current sources.

## Follow-On Handoff

After Batch 115 is accepted, scan for Batch 116 using the next eligible fixed/manifest article clusters not selected in accepted Batches 087-115. Do not fabricate a copyright/IP batch from LAW-014 or LAW-015 until a local primary IP source is added. If only source-gap clusters remain, freeze local-first state for the second audit rather than publishing.
