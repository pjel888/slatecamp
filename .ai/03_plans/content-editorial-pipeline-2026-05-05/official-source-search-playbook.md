# Official Source Search Playbook — Phase 0.5B Planning Playbook

**Created:** 2026-05-05T14:59:10Z
**Scope:** Standardize official-web source discovery and verification for SlateCamp source candidates.
**Status:** Planning/evidence only. Search results are not approval.

**Phase numbering note:** This is a completed Phase 0.5B planning playbook, not the Phase 0.5B.3 human/SME review gate.

---

## 1. Purpose

Official web search is used to verify source authority, currency, issuing body, version, and amendments. It must not become a random internet-summary workflow.

This playbook tells agents where to search first for each source family and how to record evidence.

---

## 2. General Rules

1. Prefer official issuing-body pages and PDFs.
2. Prefer current official copies over archives unless current implementation is not relevant.
3. Record failed official searches; absence of an official URL is evidence.
4. Third-party mirrors are discovery leads only.
5. Do not use blogs, Scribd, CourseHero, Studocu, summaries, or review handouts as canonical sources.
6. For High/Critical legal-code content, do not use `presumed_match` casually.
7. Critical-risk content requires `verified_match` or `expert_reviewed` human confirmation.
8. If PRC exam-program material conflicts with current law, flag the conflict instead of silently normalizing it.

---

## 3. Search Record Template

```yaml
search_id: oss-ra9514-rirr-001
source_id: ra9514-rirr-bfp-2019
searched_at_utc: 2026-05-05T00:00:00Z
searched_by: agent_or_human
source_family: fire_code
queries:
  - site:bfp.gov.ph RA 9514 RIRR 2019 PDF
  - site:officialgazette.gov.ph RA 9514 revised implementing rules
sources_checked:
  - BFP official website
  - Official Gazette
  - Lawphil
url_candidates:
  - url: https://...
    host: bfp.gov.ph
    host_classification: official_issuing_body
    retrieval_status: reachable
    title_match: high
    version_match: high
    file_match: not_checked
selected_candidate: null
search_result_status: official_candidate_found
notes:
  - Candidate found but local PDF hash comparison not completed.
```

---

## 4. Source-Family Anchors

| Source Family | Search First | Secondary | Notes |
|---|---|---|---|
| Republic Acts | Official Gazette, Lawphil | Senate/House bill history | Law text may differ from IRR/current implementation relevance |
| IRRs | Issuing agency official site | Official Gazette, Lawphil | Prefer agency-issued IRR PDF when current |
| PD 1096 / NBCP | DPWH official sources | Official Gazette/Lawphil for decree | Verify version/year; many mirrors exist |
| BP 344 / Accessibility | NCDA, DPWH, Official Gazette | Lawphil for statute | Check amended laws and revised IRR status |
| RA 9514 / Fire Code | BFP official sources | Official Gazette/Lawphil | RIRR/current version is critical for exam/legal accuracy |
| RA 9266 / Architecture Act | PRC/PRBoA, Official Gazette, Lawphil | UAP/architecture orgs for context only | SPP/IRR/current board interpretation may matter |
| UAP SPP / professional practice | PRBoA/PRC/UAP official publications when available | Instructor handouts for discovery only | Handouts require verification against original references |
| PRC board programs | PRC official board program PDFs/pages | None except archived PRC notices | Exam scope/logistics source; may differ from current law priorities |
| Procurement / RA 9184 | GPPB official site | Official Gazette/Lawphil | IRR and amendments matter |
| DHSUD / housing laws | DHSUD official site | Official Gazette/Lawphil | Verify implementing rules and amendments |
| Environmental / sanitation laws | DENR/DOH/official agency | Official Gazette/Lawphil | Agency IRRs often more exam-useful than bare statute |
| Structural textbooks | Publisher/ISBN/copyright page | Library metadata | Copyright/provider boundary must be reviewed before AI processing |

---

## 5. Match Status Rules

| Status | Use When | Promotion Impact |
|---|---|---|
| `verified_match` | Local file hash/text/page spot checks match official source | Can support packet approval |
| `presumed_match` | Strong title/version/body evidence, but exact hash/direct PDF match unavailable | Low/Medium possible; High requires exhaustive notes; Critical no |
| `unverified` | Candidate found but comparison not done | Discovery only |
| `no_official_url_found` | Exhaustive official-source search found no official URL | Requires human review before any use |
| `official_conflict_found` | Multiple official sources differ | Block and escalate |

---

## 6. Verification Methods

Preferred methods, strongest first:

1. Exact PDF hash match to official download.
2. Official PDF downloaded and local text fingerprint matches.
3. Page/section spot check against official HTML/PDF.
4. Human/SME review with notes.
5. Strong metadata match plus documented exhaustive official search.

Never approve a High/Critical legal-code source based only on title similarity.

---

## 7. Required Notes for Failed Searches

If no official source is found, record:

- exact queries used,
- official domains checked,
- date/time searched,
- whether archived official pages were checked,
- strongest non-official discovery lead,
- why the source remains blocked or why human review is requested.

---

## 8. Output Artifacts

Recommended future outputs:

| Artifact | Purpose |
|---|---|
| `official-source-search-log.generated.csv` | One row per search attempt |
| `official-url-candidates.generated.json` | Candidate URL evidence per source bundle |
| `official-source-conflicts.md` | Conflicts between local, official, and archived sources |
| `official-search-failures.md` | Exhaustive searches with no official candidate |

---

*End of Official Source Search Playbook.*
