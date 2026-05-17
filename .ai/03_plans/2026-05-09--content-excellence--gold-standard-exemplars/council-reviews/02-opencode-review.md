# OpenCode Council Review

I detect **investigation + evaluation** intent — reviewing existing exemplar artifacts against the Content Excellence Goal, identifying gaps/weaknesses, and recommending improvements. My approach: parallel context gathering → synthesize → produce memo. No editing or committing.

Let me start by reading all the context files and launching exploration agents in parallel.
Background agents failed from model availability. I have the core context files already read. Let me directly explore the exemplar files and vitruvius-connection structure.
Now let me read all the exemplar source files and the validation report in parallel.
Let me also check vitruvius-connection structure and any existing worker brief templates.
I now have all the data needed. Let me produce the comprehensive review memo.

---

# Content Excellence Gold-Standard Exemplar Review Memo

**Date**: 2026-05-09
**Reviewer**: Sisyphus (Council Review)
**Scope**: Five exemplars in `.ai/03_plans/2026-05-09-content-excellence-gold-standard-exemplars/01-*` through `05-*`

---

## 1. Verdict

**The five exemplars pass for calibration — but they are NOT yet gold standard.**

They are a **strong foundation**: they start from learner tasks, cite local PDF sources, diagnose exam traps, avoid AI slop, and use plausible distractors. The reviewer memos are honest about current risk: `PASS_FOR_CALIBRATION, HOLD_FOR_DIRECT_PUBLICATION`.

However, four structural weaknesses prevent them from being true gold-standard calibration artifacts:

| Dimension | Current State | Gold Standard Gap |
|-----------|--------------|-------------------|
| Source-ledger format | Markdown with raw text-dump snippets | Per-claim JSON ledger with classification, status, and article_location (per `04-source-verification-and-accuracy-gates.md`) |
| Source-pack conflict visibility | Zero exemplar source-ledgers mention known hash conflicts or provenance issues | Every ledger must document conflict class and governance decision |
| Claim classification | Not implemented — exam strategy, legal dimension, and technical standard are mixed without labels | Every claim cluster must be classified per the schema (`LEGAL_DIMENSION`, `EXAM_STRATEGY`, `HISTORICAL_FACT`, etc.) |
| OCR evidence gaps | 2 of 5 exemplars have text-extraction failures for primary claims, unacknowledged in the article | Gap must be flagged in the article as `⚠️ NEEDS VERIFICATION` with closest probable source |

---

## 2. Top 10 Recommendations (Prioritized)

### 🔴 P1 — Must fix before use as calibration anchor

**1. Convert source-ledgers to per-claim JSON with classification and status.**

Current ledgers are markdown dumps of PyMuPDF extraction output. The target format is defined in `04-source-verification-and-accuracy-gates.md`:

```json
{
  "claims": [
    {
      "claim_id": "bp344-01",
      "claim_text": "Minimum clear width of 1200 mm",
      "claim_class": "LEGAL_DIMENSION",
      "article_location": "exemplar-article.md lines 7-11",
      "source_family": "BP 344 2024 Revised IRR",
      "locator": "Appendix A, Accessible Ramps, PDF p.2",
      "status": "SUPPORTED",
      "notes": ""
    },
    {
      "claim_id": "bp344-02",
      "claim_text": "Answer width first, then slope, then landing, then handrails",
      "claim_class": "EXAM_STRATEGY",
      "article_location": "lines 25-27",
      "source_family": null,
      "locator": null,
      "status": "EXAM_STRATEGY_NO_SOURCE_NEEDED",
      "notes": "Board heuristic, not codified"
    }
  ]
}
```

**2. Document source-pack conflict class in every source-ledger.**

The `02-vitruvius-source-layer-summary.md` records these conflicts:
- BP 344: `local_webpage_pdf_vs_official_download_pdf_hash_mismatch`
- RA 9266: `authority_host_unverified`
- RA 9514: `official_source_blocked`

None of these appear in the exemplar source-ledgers. Every ledger must have a `source_pack_conflicts` or `provenance_notes` field showing the known conflict class and whether governance approved it for use.

**3. Acknowledge OCR extraction failures in article text.**

Exemplar 04 (NPC) has **two** query failures — the key legal claim about Section 311.4 venting prohibition returned no extracted text. The article states it as fact without flagging. Similarly, exemplar 05 (Vitruvius) has a primary-query failure (`ARCHITECTURE depends on Order`).

Fix: Insert `⚠️ NEEDS VERIFICATION — text extraction of Section 311.4 failed; verified by PDF page locator only` in the article or source-ledger. This aligns with the Content Excellence Goal's directive: "IF a value cannot be verified against primary source, flag it."

### 🟡 P2 — Should fix before scaling

**4. Add answer-key roundtrip demonstration.**

The exemplars are fully disconnected from live Supabase content. A true gold standard must show the roundtrip: take a real `normalized.md` and `linked-questions.json`, edit, validate that answer keys remain consistent, and produce a diff. Without this, the exemplars validate the *form* but not the *integration*.

Suggestion: Take one existing live article, convert it to exemplar format alongside source-ledger, and demonstrate the preservation of answer keys and UI block IDs.

**5. Normalize the "Board shortcut" / exam strategy sections.**

Currently inconsistent:
- 01 bp344: cited source? No. But it's exam strategy.
- 02 ra9266: cited source? No. Exam strategy.
- 04 npcp: cited source? No. Exam strategy.
- 05 vitruvius: cited source? No. Exam strategy.

All are fine as exam strategy. But they should be **consistently labeled** as such in the source-ledger claim classification. Recommend adding a footnote or inline label: `(Exam strategy — no codified source)`.

### 🟢 P3 — Worth doing immediately

**6. Create a claim-control section in article.md footer.**

Each exemplar-article.md should end with a brief claim control note:
- Total claims made
- How many have source locators
- How many are EXAM_STRATEGY (no source needed)
- How many have extraction gaps
- PDF pages verified vs. pages cited

This makes the article self-documenting for SME reviewers.

**7. Cross-reference hazard between exemplars.**

Exemplar 04 Q1 distractor A says: "10.7 is a lux value in the Fire Code egress excerpt." This references exemplar 03 content. Clever integration, but fragile — if exemplar 03 changes its value or source, exemplar 04 silently becomes wrong. Flag cross-exemplar references in a `cross_references` field in the question set, or avoid them in standalone calibration artifacts.

**8. Add THEORY_CONCEPT claim class for exemplar 05 (Vitruvius).**

The Vitruvius exemplar correctly uses the Morris Hicky Morgan translation. But the source-ledger doesn't classify its claims. The claim that "architecture depends on Order, Arrangement, Eurythmy, Symmetry, Propriety, and Economy" is a `THEORY_CONCEPT`, not a `LEGAL_DIMENSION`. The OCR extraction failure for this primary claim should be flagged more visibly.

**9. Standardize source-ledger "not found by text extraction" entries.**

Three queries across exemplars 04 and 05 failed. The ledger should indicate whether the claim was:
- Verified by visual inspection of the PDF (page locator)
- Verified by alternative text extraction method
- Flagged as needs verification

Currently, the failed queries just say "not available" without indicating whether the claim is actually supported by page-level visual check. This ambiguity is a quality risk.

**10. Write the worker-facing rule about source layer precedence.**

This directly addresses your prompt's final recommendation:

---

## 3. Current Exemplar Fixes (Specific)

| Exemplar | Issue | Fix |
|----------|-------|-----|
| 01 bp344-ramp | "Board shortcut" section has no claim classification | Add `EXAM_STRATEGY` claim to source-ledger; no codified source needed |
| 02 ra9266-foreign | Source pack `authority_host_unverified` not documented | Add provenance note to source-ledger: "RA 9266 IRR source pack: authority_host_unverified — governance approved for pilot use" |
| 03 ra9514-egress | Source pack `official_source_blocked` not documented; integrity issue noted in 04-source-verification.md (pack chunks point to BP 344 content) | Add provenance note. Since the article was written from local PDF (not the corrupted source pack), the article itself is grounded, but document the pack issue in the ledger. |
| 03 ra9514-egress | Article refers to Rule 10 Section 10.2.5.2 — verify this matches the 2019 RIRR section numbering | Add a verification note in the ledger that the section numbering was confirmed by PDF page locator |
| 04 npcp | Two extraction failures: `FIXTlJRE liN IT` (OCR typo) and `no vent pipe shall be used` | Flag in both article and ledger: `⚠️ NEEDS VERIFICATION — OCR of Section 311.4 failed; confirmed by page locator only. SME visual check required.` |
| 04 npcp | PDF naming inconsistency: "Revised National Plumbing Code of the Philippines.pdf" | Verify this is the current official version, not a superseded edition. Add provenance note. |
| 05 vitruvius | Primary claim extraction failed | Flag: `⚠️ NEEDS VERIFICATION — OCR of Book I, Chapter II principles list failed; verified by Morgan translation page locator.` |

---

## 4. New Exemplar Topic Recommendations

Priority-ordered by LEA exam yield and source verifiability:

| Priority | Topic | Source Folder | LEA Subject | Rationale |
|----------|-------|--------------|-------------|-----------|
| 1 | **PD 1096: TGFA, AMBF, PSO, IS OS computation** | `001-Laws/PD-1096/` (15 PDFs) | Building Laws | Consistently tested. Most candidates confuse TGFA vs. AMBF vs. PSO. Source-verifiable from NBCP IRR. |
| 2 | **PD 1096: Parking computation by occupancy** | `001-Laws/PD-1096/` | Building Laws | Rule X. High distractor potential (people mix residential and commercial ratios). |
| 3 | **RA 9184: Architectural services procurement thresholds** | `001-Laws/RA-9184/` (4 PDFs) | Professional Practice | Common scenario question. Clear numerical thresholds for source verification. |
| 4 | **BP 220: Economic housing minimum lot/floor areas** | `001-Laws/BP-220/` | Building Laws | Directly testable numbers. Contrasts with PD 957 and PD 1096 standards. |
| 5 | **Civil Code Art. 1723: Engineer/Architect liability for building collapse** | `001-Laws/RA-386/` (Civil Code) | Professional Practice | Classic scenario question. Time-bar provisions (15 years/10 years after project acceptance) are frequently tested. |
| 6 | **PD 957: Condominium/Subdivision buyer protection — development controls** | `001-Laws/PD-957/` (4 PDFs) | Building Laws | Different from NBCP. Separate rules for subdivision lot sales vs. condominium units. |
| 7 | **BP 344: Accessible parking spaces, toilet layouts, and door clearances** | `001-Laws/BP-344/` (2 PDFs) | Building Laws | Complements existing ramp exemplar. Different dimension set (parking space width, toilet stall dimensions). |
| 8 | **UAP Doc 201: Standard professional service scope and fee computation** | `001-Laws/UAP/` (21 PDFs) | Professional Practice | Rich source material (21 PDFs). Fee computation and service phase definitions are testable. |
| 9 | **RA 9514: Occupancy classifications and fire protection system triggers** | `001-Laws/RA-9514/` | Fire Code | Complements existing egress exemplar. Different section — fire protection triggers by occupancy type. |
| 10 | **Philippine Electrical Code: Minimum receptacle spacing and branch circuit loads** | `005-Utilities/Phil Electrical Code.pdf` | Building Utilities | High yield. Numerical values for spacing (every 3.6m along walls, etc.). |
| 11 | **Theory of Architecture: Elements vs. Principles of Design** | `003-Theory/TOA 2 (Elements + Principles).pdf` | Theory | Complements Vitruvius exemplar. Contrasting source class: textbook (Salvan, TOA) vs. primary (Vitruvius). Demonstrate proper secondary-source handling. |
| 12 | **Site planning: Minimum subdivision road widths and easements** | `001-Laws/HLURB-DHSUD/` (16 PDFs) | Planning/Design | Local source-verifiable through HLURB/DHSUD rules. |
| 13 | **Building Technology: CHB reinforcement requirements for load-bearing vs. non-load-bearing walls** | `004-Technology/Building Construction 3 Lecture.pdf`, `George-Salvan-Architectural-Building-Materials.pdf` | Building Technology | High yield. Numerical values for vertical/horizontal reinforcement spacing. Signal treatment of textbook vs. code sources. |

---

## 5. Source-Ledger Required Fields

Based on the gap between current implementation and the `04-source-verification-and-accuracy-gates.md` specification:

### Per-document fields (current)
- Document ID, relative path, SHA256, PDF page count, locator set, PDF pages used, verification status, extraction method, source tier, SME release status

### Per-document fields (missing — ADD)
- `source_pack_id` (link to approved pack if one exists)
- `provenance_notes` — where the PDF came from, hash conflict class, governance decision
- `official_download_url` — where the official version can be retrieved
- `official_hash` — from official source (if obtainable)
- `conflict_class` — one of the known risk classes from `02-vitruvius-source-layer-summary.md`
- `governance_status` — whether SME or governance approved use despite conflicts

### Per-claim fields (ENTIRELY NEW)
- `claim_id` — unique within ledger
- `claim_text` — verbatim from article
- `claim_class` — one of: `LEGAL_DIMENSION`, `LEGAL_SCOPE`, `LEGAL_PROCESS`, `TECHNICAL_STANDARD`, `HISTORICAL_FACT`, `THEORY_CONCEPT`, `EXAM_STRATEGY`
- `article_location` — section heading and approximate line range
- `locator` — Rule/Section/Page/Table
- `source_family` — e.g., "BP 344 2024 Revised IRR"
- `status` — `SUPPORTED`, `NEEDS_REVIEW`, `REMOVE_OR_REWRITE`, `EXAM_STRATEGY_NO_SOURCE_NEEDED`
- `extraction_verified` — boolean for whether PDF text extraction succeeded
- `notes` — free text for extraction failures, ambiguity, or SME questions

---

## 6. Validation Gates

The current validation report (PASS) checks structural completeness: expected files exist, JSON parses, hashes match. But it does not check substantive quality:

### Current validation coverage
- ✅ Expected exemplar directories (5)
- ✅ Expected per-exemplar files (4 per directory)
- ✅ JSON files parse correctly
- ✅ Source PDF hashes match
- ✅ Anti-slop scan (markdown surface only)

### Gaps — Add these gates

**Substantive gates:**
- [ ] Every LEGAL_DIMENSION claim has a locator with page number
- [ ] Every locator page number exists within the PDF page count
- [ ] No TEXT_EXTRACTION_FAILURE claim has status `SUPPORTED` (must be `NEEDS_REVIEW`)
- [ ] All EXTERNAL_CROSS_REFERENCE between exemplars is documented
- [ ] Source-ledger has per-claim entries matching all factual claims in article
- [ ] "Board shortcut" sections are classified as EXAM_STRATEGY in ledger
- [ ] Source-pack conflict class is documented where a governed pack exists

**Integrity gates:**
- [ ] Article claims do not exceed what source-ledger supports
- [ ] Answer keys in question set do not have missing source locators
- [ ] Distractor rationales reference actual code language, not invented thresholds
- [ ] Cross-exemplar references (e.g., NPC to Fire Code) are flagged

**Publishability gates (for when conversion happens):**
- [ ] Article maps to an existing Supabase article or creates a clean new bundle
- [ ] Question IDs do not collide with existing live question IDs
- [ ] UI block inventory is accounted for in roundtrip

---

## 7. Risks / What Not to Do

### What not to do

1. **Do not push exemplars as Supabase articles.** They are not article bundles. They lack `normalized.md`, `ui-blocks.json`, `original.md`, and linked Supabase question IDs. The reviewer memos correctly flag this.

2. **Do not silo the exemplar format from the editing workflow.** If the exemplar format diverges from the worker brief template (08), workers will have two incompatible standards. The exemplar format (4 files) and the worker brief format (normalized.md, question-edits/*.json, source-ledger/*.json) need to be reconciled into a single format.

3. **Do not treat OCR text extraction as verified fact.** PyMuPDF extraction can produce scrambled text, missing tables, and misread dimensions. The ledgers record extraction output faithfully, but extraction success is not source verification. An extraction failure does not mean the source is wrong — and a successful extraction does not guarantee the source is correctly interpreted.

4. **Do not create new exemplars until the source-ledger format is standardized.** Creating more exemplars with the current markdown-ledger format multiplies the conversion cost when the JSON per-claim format is adopted. Freeze new exemplar production until the format decision is made.

5. **Do not assume `001_Raw-Source-Layer` PDFs are the current official version.** Some PDFs may be superseded IRRs or earlier versions. The source-pack conflict classes document this risk. Every exemplar must verify version currency before treating the PDF as definitive.

6. **Do not let the canonical/conversion layers substitute for raw sources.** The source layer summary clearly states: `003_Canonical-Knowledge-Layer` is for concept discovery only, not legal/code truth. `002_Raw-Conversion-Layer` has OCR drift risk. The exemplars correctly cite back to `001_Raw-Source-Layer`, but the worker brief template must enforce this as policy.

### Key risks

| Risk | Severity | Mitigation |
|------|----------|-----------|
| OCR extraction gaps for core legal claims | HIGH | Flag in article as `⚠️ NEEDS VERIFICATION`; require SME visual check; do not publish with unverified claims |
| Source-ledger format migration (markdown → JSON per-claim) | MEDIUM | Decide format now before creating more exemplars; batch-migrate existing 5 |
| Source-pack corruption (RA 9514 pack points to BP 344 content) | HIGH | Do not use `source-pack-ra-9514-rirr` for RA 9514 edits until rebuilt. The exemplar correctly bypasses it by using local PDF, but future workers need explicit warning |
| Cross-exemplar dependency without explicit tracking | LOW | Add `cross_references` metadata to question sets; accept only in calibration, not in production |
| Answer-key drift during SME review | MEDIUM | SME review may spot errors that change answer keys. This is CORRECT and necessary — but must follow the answer-key change protocol (independent review + source locator) |

---

## 8. Worker File Rule — Source Layer Precedence

**What `.ai` content production files and AGENTS.md should say so future workers immediately know the source hierarchy:**

```
## Source Layer Precedence (NON-NEGOTIABLE)

When writing or editing LEA content, follow this source hierarchy:

### FIRST — Primary Evidence
Go to `vitruvius-connection/001_Raw-Source-Layer/` first.
- Laws: `001-Laws/<LAW-CODE>/` (find the IRR PDF, not the RA text alone)
- History: `002-History/`
- Theory: `003-Theory/`
- Technology: `004-Technology/`
- Utilities: `005-Utilities/`

Locate the governing PDF. Extract the relevant section. Record:
- Full path to the PDF in the local repo
- SHA256 hash
- PDF page number for the claim
- Any OCR extraction issues

### SECOND — Approved Source Packs
If the topic is covered by a governed source pack under `.ai/16_source_packs/packs/`:
- Use it for locators and chunk-level search
- But verify the pack's conflict status first (check `conflict_status` field)
- Do NOT assume pack content matches its label — spot-check the chunk text against the raw source

### THIRD (DISCOVERY ONLY) — Conversion and Canonical Layers
- `vitruvius-connection/002_Raw-Conversion-Layer/` — searchable text only. If text differs from raw PDF, the raw PDF governs.
- `vitruvius-connection/003_Canonical-Knowledge-Layer/` — concept relationships and article discovery only. NEVER cite it as legal/code authority.

### FOURTH (SECONDARY ONLY) — Textbooks, Reviewers, Tertiary Sources
- Salvan, Fajardo, and similar textbooks are valid for theory, history, materials, and design explanation
- Mark claims as `TECHNICAL_STANDARD`, `THEORY_CONCEPT`, or `HISTORICAL_FACT` to distinguish from legal claims
- Never use a textbook to override a code/law primary source

### Rule
Every factual claim in the final article must have a locator to the highest available source tier. If only a textbook exists for the claim, that is acceptable — but label it as secondary. If no source exists at all, flag as `⚠️ NEEDS VERIFICATION`.
```

**Place this rule in:**
1. `.ai/CONTENT_EXCELLENCE_GOAL.md` — add a short "Source Layer Precedence" section after the existing "Factual Accuracy Hierarchy" (Section 6)
2. `.ai/03_plans/2026-05-09-source-grounded-learning-module-plan/08-worker-brief-template.md` — add as a preamble section
3. `.ai/03_plans/2026-05-09-content-excellence-gold-standard-exemplars/README.md` — add as explicit guidance


## Raw status

```json
{
  "tool": "opencode",
  "model": "opencode-go/deepseek-v4-flash",
  "started_at": "2026-05-09T07:01:36Z",
  "duration_seconds": 247.3,
  "returncode": 0
}
```

## stderr

```text
[93m[1m! [0m agent "plan" is a subagent, not a primary agent. Falling back to default agent
[0m
> ​Sisyphus - Ultraworker · deepseek-v4-flash
[0m
[0m→ [0mRead .ai/CONTENT_EXCELLENCE_GOAL.md
[0m→ [0mRead .ai/03_plans/2026-05-09-content-excellence-gold-standard-exemplars/council-review-packet.generated.json
[0m→ [0mRead .ai/03_plans/2026-05-09-source-grounded-learning-module-plan/02-vitruvius-source-layer-summary.md
[0m→ [0mRead .ai/03_plans/2026-05-09-source-grounded-learning-module-plan/04-source-verification-and-accuracy-gates.md
[0m• [0mFind exemplar files under 01-* through 05-*[90m Explore Agent[0m
[0m✓ [0mFind exemplar files under 01-* through 05-*[90m Explore Agent[0m
[0m• [0mFind vitruvius-connection source folders[90m Explore Agent[0m
[0m✓ [0mFind vitruvius-connection source folders[90m Explore Agent[0m
[0m• [0mFind source-ledger patterns in codebase[90m Explore Agent[0m
[0m✓ [0mFind source-ledger patterns in codebase[90m Explore Agent[0m
[0m✱ [0mGlob ".ai/03_plans/2026-05-09-content-excellence-gold-standard-exemplars/*/"
[0m✱ [0mGlob ".ai/03_plans/2026-05-09-content-excellence-gold-standard-exemplars/**/*.md"
[0m✱ [0mGlob ".ai/03_plans/2026-05-09-content-excellence-gold-standard-exemplars/**/*.json"
[0m→ [0mRead .ai/03_plans/2026-05-09-content-excellence-gold-standard-exemplars/validation-report.md
[0m→ [0mRead .ai/03_plans/2026-05-09-content-excellence-gold-standard-exemplars/01-bp344-accessible-ramp-geometry/exemplar-article.md
[0m→ [0mRead .ai/03_plans/2026-05-09-content-excellence-gold-standard-exemplars/01-bp344-accessible-ramp-geometry/source-ledger.md
[0m→ [0mRead .ai/03_plans/2026-05-09-content-excellence-gold-standard-exemplars/01-bp344-accessible-ramp-geometry/reviewer-memo.md
[0m→ [0mRead .ai/03_plans/2026-05-09-content-excellence-gold-standard-exemplars/01-bp344-accessible-ramp-geometry/exemplar-question-set.json
[0m→ [0mRead .ai/03_plans/2026-05-09-content-excellence-gold-standard-exemplars/02-ra9266-foreign-architect-temporary-permit/exemplar-article.md
[0m→ [0mRead .ai/03_plans/2026-05-09-content-excellence-gold-standard-exemplars/02-ra9266-foreign-architect-temporary-permit/source-ledger.md
[0m→ [0mRead .ai/03_plans/2026-05-09-content-excellence-gold-standard-exemplars/02-ra9266-foreign-architect-temporary-permit/reviewer-memo.md
[0m→ [0mRead .ai/03_plans/2026-05-09-content-excellence-gold-standard-exemplars/02-ra9266-foreign-architect-temporary-permit/exemplar-question-set.json
[0m→ [0mRead .ai/03_plans/2026-05-09-content-excellence-gold-standard-exemplars/03-ra9514-means-of-egress-width-and-count/exemplar-article.md
[0m→ [0mRead .ai/03_plans/2026-05-09-content-excellence-gold-standard-exemplars/03-ra9514-means-of-egress-width-and-count/source-ledger.md
[0m→ [0mRead .ai/03_plans/2026-05-09-content-excellence-gold-standard-exemplars/03-ra9514-means-of-egress-width-and-count/reviewer-memo.md
[0m→ [0mRead .ai/03_plans/2026-05-09-content-excellence-gold-standard-exemplars/03-ra9514-means-of-egress-width-and-count/exemplar-question-set.json
[0m→ [0mRead .ai/03_plans/2026-05-09-content-excellence-gold-standard-exemplars/04-npcp-fixture-unit-and-venting/exemplar-article.md
[0m→ [0mRead .ai/03_plans/2026-05-09-content-excellence-gold-standard-exemplars/04-npcp-fixture-unit-and-venting/source-ledger.md
[0m→ [0mRead .ai/03_plans/2026-05-09-content-excellence-gold-standard-exemplars/04-npcp-fixture-unit-and-venting/reviewer-memo.md
[0m→ [0mRead .ai/03_plans/2026-05-09-content-excellence-gold-standard-exemplars/04-npcp-fixture-unit-and-venting/exemplar-question-set.json
[0m→ [0mRead .ai/03_plans/2026-05-09-content-excellence-gold-standard-exemplars/05-vitruvius-principles-and-departments/exemplar-article.md
[0m→ [0mRead .ai/03_plans/2026-05-09-content-excellence-gold-standard-exemplars/05-vitruvius-principles-and-departments/source-ledger.md
[0m→ [0mRead .ai/03_plans/2026-05-09-content-excellence-gold-standard-exemplars/05-vitruvius-principles-and-departments/reviewer-memo.md
[0m→ [0mRead .ai/03_plans/2026-05-09-content-excellence-gold-standard-exemplars/05-vitruvius-principles-and-departments/exemplar-question-set.json
[0m→ [0mRead .ai/03_plans/2026-05-09-content-excellence-gold-standard-exemplars/exemplar-index.json
[0m→ [0mRead vitruvius-connection/001_Raw-Source-Layer
[0m→ [0mRead vitruvius-connection
[0m→ [0mRead .ai/03_plans/2026-05-09-source-grounded-learning-module-plan/08-worker-brief-template.md
[0m→ [0mRead .ai/03_plans/2026-05-09-content-excellence-gold-standard-exemplars/exemplar-index.json
[0m→ [0mRead vitruvius-connection/001_Raw-Source-Layer/001-Laws
[0m→ [0mRead vitruvius-connection/001_Raw-Source-Layer/002-History
[0m✗ [0mread failed
[91m[1mError: [0mFile not found: /Users/philiplewis/slatecamp/vitruvius-connection/001_Raw-Source-Layer/007-Structural
[0m→ [0mRead vitruvius-connection/001_Raw-Source-Layer/003-Theory
[0m→ [0mRead vitruvius-connection/001_Raw-Source-Layer/004-Technology
[0m→ [0mRead vitruvius-connection/001_Raw-Source-Layer/005-Utilities

```
