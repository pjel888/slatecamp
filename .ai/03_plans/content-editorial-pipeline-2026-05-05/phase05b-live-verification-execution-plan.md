# Phase 0.5B Live Official-Source Verification Execution Plan

**Generated:** 2026-05-05T15:28:29Z  
**Scope:** Plan the future live official-source verification run for reconciled Vitruvius source bundles.  
**Status:** Planning only. This file does not execute web retrieval, approve sources, create source packs, edit content, or mutate Supabase.

---

## 1. Purpose

Phase 0.5A.3 produced conservative source bundles and candidate official-search seeds. Phase 0.5B defines how a future live verification run should check official-source candidates without promoting anything by automation alone.

The live run answers only:

```txt
What official-source evidence exists for each reconciled bundle, and what remains missing for human/SME review?
```

It does not answer:

```txt
Is this source approved for SlateCamp grounding?
```

Approval remains Phase 0.5B.3 human/SME review.

---

## 2. Inputs

| Input | Role | Required before run? |
|---|---|---:|
| `source-bundle-map.generated.csv` | bundle identity/risk/source-family seed | Yes |
| `source-official-url-candidates.generated.csv` | domain/query seed list | Yes |
| `official-source-search-playbook.md` | official host priority and match rules | Yes |
| `source-verification-packet-schema.md` | fields needed for review packets | Yes |
| `source-pack-governance-decision-register.md` | provider/copyright/chunking decisions | Recommended before broad run |

---

## 3. Allowed Verification Actions

A live verification worker may:

1. Search only official or authority-adjacent hosts listed in the playbook.
2. Record reachable official URL candidates.
3. Download or inspect public official PDFs/pages only when allowed by robots/terms and needed for evidence.
4. Compute hashes for retrieved public files if downloaded to a temporary evidence cache.
5. Compare title, document code, year/version, issuer, page count, and text fingerprints against local bundle metadata.
6. Record failed searches and dead links.
7. Produce evidence rows for human review.

A live verification worker must not:

1. Promote `allowed_use` beyond `DISCOVERY_ONLY`.
2. Mark `verification_status` as `expert_reviewed` or `fully_verified` without human review.
3. Create source packs, chunks, or embeddings.
4. Rewrite articles or questions.
5. Mutate Supabase.
6. Treat third-party mirrors as canonical.
7. Upload local copyrighted PDFs to external providers unless governance permits it.

---

## 4. Priority Order

1. High/Critical `law_code_policy` bundles with retained PDFs.
2. High/Critical `law_code_policy` derived-only bundles whose parent PDF must be recovered.
3. PRC/CHED/UAP/SPP professional-practice sources.
4. DHSUD/HLURB/LGU zoning and planning sources.
5. Medium-risk technical references.
6. Low-risk metadata/concept graph support files.

---

## 5. Domain Policy

| Source family | First hosts | Secondary hosts | Disallowed for authority |
|---|---|---|---|
| Republic Acts / PD / BP / EO | Official Gazette | Lawphil, issuing agency | blogs, Scribd, CourseHero, Studocu |
| IRR / Fire Code | BFP / issuing agency | Official Gazette, Lawphil | review-center summaries |
| NBCP / PD 1096 | DPWH / NBCDO | Official Gazette, Lawphil | random PDF mirrors |
| BP 344 | NCDA / DPWH | Official Gazette, Lawphil | accessibility summaries |
| UAP/SPP/RA 9266 | PRC/PRBoA/UAP | Official Gazette/Lawphil for statutes | handouts as canonical source |
| PRC board program | PRC | archived PRC notices | unofficial exam reviewers |
| LGU zoning/CLUP | LGU official site | DHSUD/HLURB where applicable | document-sharing mirrors |
| Textbooks | publisher/ISBN/library metadata | copyright page | unauthorized PDF mirrors |

---

## 6. Match Status Rules

| Status | Meaning | Can promote source? |
|---|---|---:|
| `unverified` | Not checked or not enough evidence | No |
| `official_candidate_found` | Official-looking candidate located but not matched | No |
| `no_official_url_found` | Search completed with no official URL | No |
| `mismatch` | Candidate conflicts with local file/version | No |
| `presumed_match` | Strong title/version/page evidence, no hash/direct match | No automatic promotion |
| `verified_match` | Hash/text/page/version evidence supports match | No automatic promotion; human review still required |
| `expert_reviewed` | Human/SME decision recorded | May support packet approval |

---

## 7. Required Outputs

Future live verification should produce:

1. `official-source-verification-evidence.generated.csv`
2. `official-source-verification-evidence.generated.json`
3. `official-source-verification-run-report.md`
4. `official-source-verification-conflicts.md`
5. Updated draft packet queue or pending packet files, still unapproved.

The evidence schema is defined in `official-source-verification-evidence-schema.md`.

---

## 8. Failure Handling

| Failure | Required logging | Next action |
|---|---|---|
| official site unreachable | URL, timestamp, error class | retry later or human search |
| ambiguous version | all candidate URLs and differing dates | conflict packet |
| local PDF differs from official | hash/text/page mismatch evidence | SME review |
| third-party only | mirror URL recorded as discovery lead | no promotion |
| copyrighted textbook | copyright/provider boundary unresolved | governance review |

---

## 9. Acceptance Criteria

This planning gate is complete when:

1. Evidence table schema exists.
2. Domain/source-family policy is explicit.
3. Match statuses are defined and non-promotional.
4. Failure logging is defined.
5. Human/SME handoff is defined.
6. Non-mutation boundaries are explicit.

```txt
PHASE_0_5B_LIVE_VERIFICATION_EXECUTION_PLAN = READY_FOR_REVIEW
LIVE_VERIFICATION_RUN = NOT_EXECUTED
SOURCE_APPROVAL = BLOCKED
SOURCE_PACK_CREATION = BLOCKED
```
