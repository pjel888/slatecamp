# Source Conflict Resolution Policy — Phase 0.5A Decision

**Date:** 2026-05-05
**Scope:** Define what happens when local files, official web sources, article content, and question rationales disagree. Establish default high-risk behavior.
**Status:** Planning decision document. No implementation.

---

## 1. Purpose

In a source-grounded editorial pipeline, conflicts between sources are inevitable. This policy defines resolution rules for every major conflict type. The default posture is conservative: **when in doubt, flag the conflict and require human review. Do not rewrite automatically.**

---

## 2. Conflict Types and Resolution Rules

### 2.1 Local PDF Differs from Official Web PDF

**Scenario:** The local PDF contains text that does not match the official web PDF.

| Sub-scenario | Resolution |
|---|---|
| Local PDF is older version | **Flag as `OUTDATED_LOCAL`**. Do not use for grounding. Obtain current official version. |
| Local PDF is same version but has extraction errors | **Flag as `EXTRACTION_ERROR`**. Do not use for grounding. Re-extract or obtain clean PDF. |
| Official web PDF is newer/amended | **Flag as `OFFICIAL_UPDATED`**. Update local file to current version; re-verify. |
| Local PDF appears to be annotated/edited | **Flag as `ALTERED_LOCAL`**. Do not use for grounding. Obtain unmodified official PDF. |
| Cannot determine which is correct | **Flag as `AMBIGUOUS_CONFLICT`**. Require SME human review. Do not rewrite. |

**Default behavior:** Flag conflict, block usage, require human review.

---

### 2.2 Article Claim Differs from Source

**Scenario:** A `wiki_articles.content` claim contradicts the official source text.

| Sub-scenario | Resolution |
|---|---|
| Article is wrong; source is correct | **Flag article claim as `INCORRECT`**. Propose correction with source citation. Route to reviewer for high-risk content. |
| Article paraphrases correctly but wording differs | **Flag as `PARAPHRASE_OK`** if meaning is preserved. No rewrite needed unless pedagogy requires it. |
| Article simplifies for learners; source is technical | **Flag as `SIMPLIFICATION`**. Acceptable if not misleading. Do not "correct" pedagogical simplification unless it causes exam harm. |
| Source is ambiguous; article makes a reasonable interpretation | **Flag as `INTERPRETATION`**. Document ambiguity. Do not force a single reading unless the exam requires it. |
| Cannot determine which is correct | **Flag as `AMBIGUOUS_CONFLICT`**. Require SME human review. Do not rewrite. |

**Default behavior:** Flag discrepancy, do not auto-rewrite, require reviewer for high-risk claims.

---

### 2.3 Question Rationale Differs from Source

**Scenario:** A question's rationale text contradicts the official source or the answer key.

| Sub-scenario | Resolution |
|---|---|
| Rationale is wrong; answer key is correct | **Critical bug**. Flag question for immediate review. Rationale must be rewritten. |
| Rationale is correct but cites wrong section | **Flag as `CITATION_ERROR`**. Update citation; verify rationale still supports answer key. |
| Answer key is wrong; source supports different answer | **Critical bug**. Flag question for immediate review. Answer key may need correction. |
| Rationale and answer key both wrong | **Critical bug**. Flag question for immediate review. Full rewrite required. |
| Source is unclear on the specific point | **Flag as `SOURCE_UNCLEAR`**. Require SME review. Do not guess. |

**Default behavior:** Flag conflict, block question from publication, require SME review. **Never auto-change an answer key without human approval.**

---

### 2.4 Statute Differs from IRR

**Scenario:** The original enabling act (statute) says one thing; the Implementing Rules and Regulations (IRR) says something different.

| Sub-scenario | Resolution |
|---|---|
| IRR clarifies or elaborates the statute | **IRR governs** for operational/building code claims. Cite both; note that IRR is the operative text. |
| IRR contradicts the statute on a material point | **Flag as `STATUTE_IRR_CONFLICT`**. This is a legal ambiguity. Require legal/SME review. Do not resolve automatically. |
| Exam typically tests IRR, not statute | **Prefer IRR** for exam-prep content, but note the statutory basis. |
| Exam typically tests statute text verbatim | **Prefer statute** for verbatim recall questions, but note IRR interpretation. |

**Default behavior:** Cite both; note which is operative for the claim. Flag material conflicts for SME review.

---

### 2.5 Old IRR Differs from Amended IRR

**Scenario:** A new IRR amendment changes a rule that was in the old IRR.

| Sub-scenario | Resolution |
|---|---|
| Amendment is current and in force | **Use amended IRR**. Mark old IRR claims as `SUPERSEDED`. |
| Amendment has an effective date in the future | **Use current IRR** until effective date; note upcoming change. |
| Amendment is proposed/draft, not final | **Do not use draft**. Use current final IRR. Flag as `DRAFT_AMENDMENT` for awareness only. |
| Old IRR is still tested on upcoming exam | **PRC program governs**. If PRC tests old version, content must match tested version. |

**Default behavior:** Use current in-force version unless PRC program specifies otherwise. Flag superseded content.

---

### 2.6 Source Page Has No Version Date

**Scenario:** An official source page or PDF does not display a version date, edition date, or effective date.

| Resolution |
|---|---|
| **Flag as `VERSION_UNCERTAIN`**. |
| Record URL and date of access. |
| Search for amendment history on the same site. |
| Cross-check against Official Gazette publication dates. |
| If version cannot be determined, classify as `UNVERIFIED` and limit use to low-risk claims. |

**Default behavior:** Do not assume "no date = current." Uncertain versions are unverified.

---

### 2.7 Source URL Is Dead

**Scenario:** A previously working official URL returns 404 or redirects to a generic page.

| Resolution |
|---|---|
| **Flag as `URL_DEAD`**. |
| Check archive.org (Wayback Machine) for cached version. |
| Search the official site for relocated document. |
| Contact issuing body if document is critical. |
| If no replacement URL is found, classify existing local copy as `NO_OFFICIAL_VERIFICATION` and require SME review before use. |

**Default behavior:** Dead URLs do not invalidate a previously verified local file, but they prevent re-verification. Document the dead URL and search for replacement.

---

### 2.8 Two Official Agencies Host Different Versions

**Scenario:** DPWH hosts one version of PD 1096 IRR; another agency (e.g., a local government unit) hosts a different version.

| Resolution |
|---|---|
| **Prefer the issuing body's version** (DPWH for PD 1096). |
| Document the discrepancy. |
| If the secondary agency is explicitly delegated authority (e.g., DHSUD for housing), consider both but prioritize the primary issuer. |
| Flag as `INTER_AGENCY_DISCREPANCY` and require SME review if the difference is material. |

**Default behavior:** Issuing body > delegated agency > local government. Document all versions.

---

## 3. Universal Resolution Heuristics

### 3.1 The "Do No Harm" Rule
When a conflict affects exam-prep content, the resolution that minimizes learner harm takes precedence. If both options seem equally valid, choose the one that is less likely to cause a student to answer incorrectly on the LEA.

### 3.2 The "PRC Program" Override
If the PRC board program explicitly specifies a version, rule, or interpretation, that specification governs the default exam-prep posture, but it does not erase legal/source conflicts. If the PRC program appears to contradict current legal text or current IRR text, flag the discrepancy as `PRC_VS_CURRENT_LAW`, include both texts in the review packet, and require human SME review. The default exam-prep answer may follow PRC, but the contradiction must be disclosed in editorial treatment rather than silently normalized.

### 3.3 The "Human Review" Escalation
Any conflict that cannot be resolved by the rules above MUST be escalated to human SME review. AI must not guess. The pipeline must generate a review packet with:
- The claim in question.
- The conflicting sources.
- The automated resolution attempt (if any).
- A recommendation: accept source A, accept source B, rewrite needed, or unclear.

---

## 4. Conflict Logging

Every conflict must be logged with:
- `conflict_id` — unique identifier.
- `claim_id` or `article_id` or `question_id` — affected content.
- `conflict_type` — one of the types above.
- `source_a` — first conflicting source (with rank, URL, version).
- `source_b` — second conflicting source (with rank, URL, version).
- `automated_resolution` — what the rule says (or `none`).
- `human_review_required` — boolean.
- `resolution_status` — `open`, `resolved_source_a`, `resolved_source_b`, `resolved_rewrite`, `resolved_ambiguous`, `stale`.
- `resolved_by` — human identifier or script name.
- `resolved_at` — timestamp.

---

## 5. What Claude Should Review Next

1. Should there be a "conflict severity" level (info, warning, critical) that determines whether the pipeline halts or continues?
2. Is the "PRC Program Override" too strong? Should there be a caveat that PRC program errors should still be flagged even if they govern exam prep?
3. Should conflicts involving answer keys automatically trigger a `halt_pipeline` flag until resolved?
4. Should there be a time-bound resolution SLA (e.g., all critical conflicts must be resolved within 48 hours)?
