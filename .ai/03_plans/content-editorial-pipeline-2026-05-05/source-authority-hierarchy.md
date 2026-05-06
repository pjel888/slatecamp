# Source Authority Hierarchy — Phase 0.5A Decision

**Date:** 2026-05-05
**Scope:** Define the ranking of source authority for the SlateCamp editorial pipeline. Distinguish primary sources from derived artifacts, and establish which sources may ground factual claims.
**Status:** Planning decision document. No implementation.

---

## 1. Authority Hierarchy (Ranked)

### Rank 1: Current Official Issuing-Body PDF or Official Gazette Publication
- **Examples:** DPWH-published PD 1096 IRR PDF, Official Gazette RA publication, NCDA BP 344 PDF.
- **Authority:** Highest. The official text as published by the issuing body.
- **Use for grounding:** Yes — primary canonical source.
- **Requirements:** Must be the current version; must be downloadable/verifiable from official domain.
- **Verification:** Hash match or direct download from `.gov.ph` or official publisher domain.

### Rank 2: Current Official Issuing-Body Web Page
- **Examples:** DPWH website building code page, PRC board program page, BFP fire code guidance page.
- **Authority:** Very high. Official web publication, but may be HTML summary rather than full text.
- **Use for grounding:** Yes, for claims that appear verbatim on the official page.
- **Requirements:** Must be current; URL must be from official domain.
- **Limitation:** HTML pages may be summaries; full legal text may only be in PDF.

### Rank 3: Local PDF Confirmed to Match Official Source
- **Examples:** PD 1096 IRR PDF downloaded from DPWH, hash-verified against official source.
- **Authority:** High. Same text as Rank 1/2, but stored locally.
- **Use for grounding:** Yes, once verified.
- **Requirements:** Provenance documented; hash matches official; extraction quality acceptable.
- **Classification in local inventory:** `LOCAL_OFFICIAL_PDF_VERIFIED`.

### Rank 4: Local PDF Manually Verified by SME/Admin
- **Examples:** PDF obtained through non-official channel but spot-checked by subject-matter expert against official text.
- **Authority:** High, with human verification backing.
- **Use for grounding:** Yes, with verification annotation.
- **Requirements:** SME sign-off; verification notes recorded; any discrepancies flagged.
- **Classification in local inventory:** `LOCAL_OFFICIAL_PDF_UNVERIFIED` until verified, then upgraded.

### Rank 5: Lawphil / Senate / Official Statute Archive
- **Examples:** lawphil.net statute text, senate.gov.ph legislative archives, officialgazette.gov.ph.
- **Authority:** Moderate for statute text unless cross-checked; may lag behind latest IRR amendments.
- **Use for grounding:** Yes, for statute text only after cross-checking against the issuing body's latest IRR/current implementation when the claim depends on implementing rules.
- **Requirements:** URL recorded; date of page capture recorded; checked for amendment notices.
- **Limitation:** IRR text may not be fully available; some archives only have the enabling act.

### Rank 6: PRC Board Program for Exam Logistics/Scope
- **Examples:** PRC-published architecture licensure exam program, syllabus, or scope document.
- **Authority:** High for exam scope and logistics; moderate for legal content.
- **Use for grounding:** Yes, for exam-scope claims (what topics are tested, weighting).
- **Limitation:** Not a legal source for building code claims.

### Rank 7: Internal Source-Pack Chunk Derived from Verified Source
- **Examples:** A chunk in `.ai/16_source_packs/` derived from a Rank 1–3 source, with hash and locator.
- **Authority:** High — but the chunk is a **grounding artifact**, not the source itself.
- **Use for grounding:** Yes, for AI validation and claim tracing.
- **Critical rule:** The chunk must point back to its Rank 1–3 parent. If the parent is invalidated, the chunk is invalidated.

### Rank 8: Database Citation Row
- **Examples:** `wiki_article_sources` row, `taxonomy_sources` row, `questions.code_citation`.
- **Authority:** Low. These are **discovery seeds**, not verifiable text.
- **Use for grounding:** **No.** Cannot be used to validate factual claims.
- **Permitted use:** Discovery, cross-reference, gap analysis.

### Rank 9: Existing Article Content
- **Examples:** `wiki_articles.content`, `questions.rationale`, historical fact-checking flags.
- **Authority:** **Not a source.** This is editorial content.
- **Use for grounding:** **No.**
- **Permitted use:** Diff baseline, pedagogy review, fact-preservation comparison (against a real source).

### Rank 10: Third-Party Mirrors
- **Examples:** Scribd uploads, CourseHero documents, Studocu pages, random blog posts, university PDF mirrors.
- **Authority:** **Not authoritative.**
- **Use for grounding:** **No.**
- **Permitted use:** Discovery only — "this document exists elsewhere" — but never for claim validation.

---

## 2. Key Principles

### 2.1 Extracted Text Is a Grounding Artifact, Not the Source
A source-pack chunk (Rank 7) is useful for AI validation, but it derives its authority from its parent source (Rank 1–3). If the parent is found to be outdated, wrong, or non-official, the chunk must be marked invalid regardless of its own quality.

### 2.2 Existing Article Content Is Not Source Truth
No article in `wiki_articles.content` can be cited as proof that a legal claim is correct. Articles are written for learners and may contain paraphrase, simplification, or historical error.

### 2.3 Third-Party Mirrors Are Discovery Only
Scribd, CourseHero, Studocu, and similar sites may host copies of official documents, but they are not authoritative sources. They may be outdated, annotated, incomplete, or altered. Use them only to discover that a document exists; verify against official sources before grounding any claim.

### 2.4 `wiki_article_sources` Is Discovery Seed Only
The 1,110 rows in `wiki_article_sources` (Rank 8) tell us which sources articles claim to reference. They do not contain source text, verified URLs, or claim locators. They are a starting point for source-pack building, not a substitute for it.

---

## 3. Pipeline Rule: Minimum Authority for Claim Grounding

| Content Risk Level | Minimum Authority Rank | Example |
|---|---|---|
| **Critical** (answer keys, code citations, dimensional standards) | Rank 1–3 (official PDF or verified local PDF) | PD 1096 setback dimensions, BP 344 ramp slope |
| **High** (legal penalties, fire safety requirements, structural loads) | Rank 1–4 (official or SME-verified) | RA 9514 egress width, NSCP load factors |
| **Medium** (professional practice rules, contract clauses) | Rank 1–5, but Rank 5 only when IRR/current implementing text is not materially relevant or official text is unavailable and reviewed | RA 9266 statute text, SPP scope; escalate to Rank 1–3 when exam answer depends on current implementation |
| **Low** (general knowledge, history, theory) | Rank 1–6 (official or PRC program) | Exam history, architectural theory |

---

## 4. Local Verified Official PDFs as Canonical Candidates

A local PDF can become a canonical candidate (suitable for source-pack derivation) ONLY when:
1. It matches Rank 1 or Rank 2 (official source).
2. Hash and provenance are documented.
3. Extraction quality is assessed as acceptable.
4. It is classified in the local inventory as `LOCAL_OFFICIAL_PDF_VERIFIED`.

Until these conditions are met, a local PDF is `LOCAL_UNKNOWN_PROVENANCE` and must not be used for grounding.

---

## 5. What Claude Should Review Next

1. Is Rank 5 (Lawphil/Senate) too high? Some statutes on lawphil.net may not reflect the latest amendments.
2. Should there be a separate rank for "current IRR" vs "original enabling act"? The 2004 Revised IRR of PD 1096 may differ from the original decree text.
3. Should Rank 6 (PRC board program) be higher for exam-scope claims and lower for legal-content claims?
4. Is the "minimum authority for claim grounding" table too permissive for Medium/Low risk? Should all legal claims require Rank 1–3?
