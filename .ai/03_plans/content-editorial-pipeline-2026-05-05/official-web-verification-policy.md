# Official Web Verification Policy — Phase 0.5A Decision

**Date:** 2026-05-05
**Scope:** Define how official web sources verify local PDFs. Establish official-source preference hierarchy and rules for internet use in source verification.
**Status:** Planning decision document. No implementation. No internet use for rewriting.

---

## 1. Purpose

Local PDF-derived files cannot be treated as canonical until they are verified against official web sources. This policy defines:
- Which official sources are preferred for which document types.
- How verification is performed.
- What internet use is permitted and prohibited.
- What to do when official sources disagree or are unavailable.

---

## 2. Official Source Preference by Document Type

### 2.1 Building Codes and Regulations

| Document | Preferred Official Source | Fallback Source | Notes |
|---|---|---|---|
| **PD 1096** (National Building Code) | DPWH (www.dpwh.gov.ph) | Official Gazette (www.officialgazette.gov.ph) | Check for 2004 Revised IRR and any subsequent amendments |
| **BP 344** (Accessibility Law) | NCDA (www.ncda.gov.ph) | Official Gazette | 2024 Revised IRR is current |
| **RA 9514** (Fire Code) | BFP (www.bfp.gov.ph) | Official Gazette | Check for revised IRR |
| **BP 220** (Socialized Housing) | HUDCC / NHA | Official Gazette | Less frequently amended |
| **PD 957** (Subdivision/Condominium) | HLURB / DHSUD | Official Gazette | Check for DHSUD updates |

### 2.2 Professional Practice and Statutes

| Document | Preferred Official Source | Fallback Source | Notes |
|---|---|---|---|
| **RA 9266** (Architecture Act) | PRC (www.prc.gov.ph) | Official Gazette / Senate | Check for IRR and CPD rules |
| **SPP Documents** (200, 202, 203, 204, 207) | UAP / PRC | UAP official publications | May not be freely available online |
| **Civil Code** (Articles 1723, 2176–2194) | Official Gazette | Lawphil (www.lawphil.net) | Lawphil is well-maintained for statute text |

### 2.3 Structural and Technical

| Document | Preferred Official Source | Fallback Source | Notes |
|---|---|---|---|
| **NSCP** (National Structural Code) | ASEP / DPWH | ASEP official publications | Often requires purchase; check for free excerpts |

### 2.4 Exam Logistics and Scope

| Document | Preferred Official Source | Fallback Source | Notes |
|---|---|---|---|
| **LEA Board Program** | PRC (www.prc.gov.ph) | PRC regional offices | Program may be updated per exam cycle |
| **Exam Syllabus / Scope** | PRC | Review center publications (verify against PRC) | Review center docs are NOT canonical |

---

## 3. Verification Methodology

### 3.1 Direct Download Verification (Preferred)
1. Navigate to official source domain (e.g., `dpwh.gov.ph`).
2. Locate the official PDF or HTML publication page.
3. Download the official file.
4. Compute SHA-256 hash of official file.
5. Compute SHA-256 hash of local PDF.
6. Compare hashes.
7. If hashes match: local file is `verified_match`.
8. If hashes differ: investigate (different version, compression, corruption).

### 3.2 Content Spot-Check Verification (When Hash Match Is Impossible)
1. Obtain official PDF or authoritative HTML excerpt.
2. Select random sample pages (minimum 5% or 10 pages, whichever is larger).
3. Compare text, tables, and section numbers side-by-side.
4. Record any discrepancies.
5. If discrepancies are minor (header/footer differences): classify as `presumed_match` with notes.
6. If discrepancies are substantive (wrong sections, wrong numbers): classify as `mismatch`; do not use local file.

### 3.3 Version Date Verification
1. Record the version date on the official source page.
2. Record the version date on the local file (from filename, metadata, or cover page).
3. If official source shows a newer version: local file is outdated.
4. If official source shows same version: proceed with content verification.
5. If official source has no version date: flag as `version_uncertain`.

---

## 4. Permitted Internet Use

### 4.1 Permitted
- **Verifying current official source versions:** Checking DPWH, PRC, BFP, NCDA, Official Gazette for current PDFs and amendment notices.
- **Finding official PDFs:** Locating download links on `.gov.ph` domains.
- **Checking outdated local PDFs:** Comparing local version date against official publication date.
- **Checking amendments:** Searching for "PD 1096 amendment 2024" or similar to identify superseded versions.
- **Identifying issuing body:** Confirming which agency publishes a given regulation.
- **Exam program recency:** Checking PRC website for current exam program and scope.

### 4.2 Prohibited
- **Random unsourced article rewriting:** Using internet search results to rewrite wiki articles without official source verification.
- **Replacing official PDFs with summaries:** Treating blog posts, Wikipedia entries, or AI summaries as substitutes for official legal text.
- **Treating Scribd/CourseHero/Studocu as canonical:** These are third-party mirrors (Rank 10 in authority hierarchy). Use for discovery only, never for grounding.
- **Generating claims from search snippets:** A Google snippet is not a source. Do not cite search result previews as evidence.
- **Using LLM-generated legal text:** Do not ask AI models to "write the text of PD 1096 Section 805." Models may hallucinate legal text.

---

## 5. Handling Official Source Unavailability

| Scenario | Action |
|---|---|
| Official website is down | Retry after 24 hours; check Official Gazette or Senate archive as fallback |
| Official PDF link is broken | Search official site archive; contact issuing body if critical |
| Official source has only HTML summary | Use HTML for verification of specific claims; note that full text may require PDF |
| Official source requires login/purchase | Document barrier; classify as `access_restricted`; do not use unverified alternative |
| No official online source exists | Classify as `no_official_url_found`; rely on physical copy verification by SME |

---

## 6. Verification Record Template

For each verified source, record:

```
Document: PD 1096 2004 Revised IRR
Local file: vitruvius-connection/pdfs/pd1096-irr-2004.pdf
Local hash: sha256:...
Official URL: https://www.dpwh.gov.ph/... (or "not found")
Official source domain: dpwh.gov.ph
Verification method: direct_download / spot_check / version_only
Verification date: 2026-05-05
Verified by: [human identifier or script name]
Result: verified_match / presumed_match / mismatch / outdated / version_uncertain
Notes: [any discrepancies or caveats]
```

---

## 7. Current Verification State (Phase 0.5B Candidate Web Anchors)

The following URLs are **candidate official/near-official verification anchors** collected for planning. They are not yet hash-verified against local files because `vitruvius-connection/` and local PDFs do not exist yet. Treat every row as evidence for where verification should start, not as completed source-pack approval.

| Document | Official Issuing Body | Official URL | Official PDF? | Version/Date | Verification Status |
|---|---|---|---|---|---|
| PD 1096 | DPWH / Official Gazette | OG: https://www.officialgazette.gov.ph/1977/02/19/presidential-decree-no-1096-s-1977/ • DPWH: https://www.dpwh.gov.ph/dpwh/infrastructure/building-code | Web text yes; official PDF not clearly surfaced | PD signed Feb. 19, 1977; 2004 Revised IRR is operative | `CANDIDATE_URL_IDENTIFIED` |
| BP 344 | NCDA / Official Gazette | OG: https://www.officialgazette.gov.ph/1982/12/07/batas-pambansa-blg-344-s-1982/ • NCDA IRR: https://www.ncda.gov.ph/disability-laws/implementing-rules-and-regulations-irr/2024-revised-implementing-rules-and-regulations-batas-pambansa-blg-344/ • NCDA PDF: https://ncda.gov.ph/wp-content/uploads/2024/08/amended-IRR-BP-344-Official-Gazette.pdf | **Yes** — NCDA-hosted PDF | 1982 original; 2024 revised IRR | `CANDIDATE_URL_IDENTIFIED` |
| RA 9514 | BFP / Official Gazette | OG: https://www.officialgazette.gov.ph/2008/12/19/republic-act-no-9514/ • BFP PDF: https://bfp.gov.ph/wp-content/uploads/2019/10/RA9514-RIRR-rev-2019.pdf | **Yes** — BFP official PDF | RA signed Dec. 19, 2008; 2019 Revised IRR | `CANDIDATE_URL_IDENTIFIED` |
| RA 9266 | Official Gazette | https://www.officialgazette.gov.ph/2004/03/17/republic-act-no-9266/ | Web text yes; official PDF not clearly surfaced | RA approved Mar. 17, 2004; published July 2004 | `CANDIDATE_URL_IDENTIFIED` |
| NSCP | ASEP | https://aseponline.org / https://asep.org.ph | No free official PDF found | Copyrighted professional code; 2015 7th Edition cited | `PUBLISHER_CANDIDATE_IDENTIFIED` |
| PD 957 | Official Gazette | https://www.officialgazette.gov.ph/1976/07/12/presidential-decree-no-957-s-1976/ | Web text yes; official PDF not clearly surfaced | PD dated July 12, 1976 | `CANDIDATE_URL_IDENTIFIED` |
| PRC Board Program | PRC | https://www.prc.gov.ph/articles • https://www.prc.gov.ph/exam-schedules-menu | Sometimes — article/PDF attachments | 2026 schedule references found; architecture-specific permalink not fully verified | `CANDIDATE_PAGE_IDENTIFIED` |
| BP 220 | Official Gazette | [Search required] | Pending | Pending | `NOT_STARTED` |
| SPP Documents | UAP / PRC | [Search required] | Pending | Pending | `NOT_STARTED` |

### Verified Secondary Cross-References (Not .gov.ph)

| Document | Lawphil URL |
|---|---|
| PD 1096 | https://lawphil.net/statutes/presdecs/pd1977/pd_1096_1977.html |
| BP 344 | https://lawphil.net/statutes/bataspam/bp1983/bp_344_1983.html |
| RA 9514 | https://lawphil.net/statutes/repacts/ra2008/ra_9514_2008.html |
| RA 9266 | https://lawphil.net/statutes/repacts/ra2004/ra_9266_2004.html |
| PD 957 | https://lawphil.net/statutes/presdecs/pd1976/pd_957_1976.html |

**Caveat:** Lawphil is a widely trusted secondary source (Rank 5 in authority hierarchy), but the canonical source remains Official Gazette / issuing body. Use Lawphil for discovery and cross-checking, not as the sole authority for critical claims.

**Caveat:** Official Gazette pages may return 403 to automated fetchers. Verification above is from search confirmation on the official domain. Direct download for hash verification may require browser-based or manual retrieval.

---

## 8. What Claude Should Review Next

1. Should there be a time limit on verification validity (e.g., re-verify every 6 months)?
2. Is the spot-check sample size (5% or 10 pages) sufficient for legal documents where every number matters?
3. Should there be a mandatory "verification failed" escalation path when an official source contradicts a local PDF?
4. **`presumed_match` cannot approve Critical-risk content.** For answer keys, dimensional standards, code citations, and other Critical-risk claims, `presumed_match` is insufficient. Critical-risk grounding requires either `verified_match` by hash/direct official retrieval or `expert_reviewed` human confirmation with documented page/section spot checks.
