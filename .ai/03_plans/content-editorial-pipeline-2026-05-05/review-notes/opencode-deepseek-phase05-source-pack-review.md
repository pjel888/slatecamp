I detect **evaluation** intent — you're asking me to critically review a set of planning documents for correctness, completeness, and readiness gating. My approach: read all documents in parallel → synthesize findings → deliver a structured review with verdict, blockers, corrections, and overclaims.
All 8 documents read. Now synthesizing and challenging the specific claims requested.

---

## Phase 0.5 Senior Review Verdict

### Overall Verdict: NO-GO / CONDITIONAL GO — Verdict is Correctly Maintained

The documents collectively form a coherent and defensible gate. The reasoning chain is sound: there are zero approved source packs, therefore source-grounded AI work is impossible, therefore Phase 1B is correctly blocked. No document contradicts this. However, I find **5 required corrections** and **2 overclaims** that must be addressed before the gate can be fully trusted.

---

## 1. Is `wiki_article_sources` Being Over-Trusted?

**Finding: Not over-trusted in classification, but the classification name itself is misleading.**

The substance is correct: `source-canonicality-decision.md` properly records that all 1,110 rows have `is_verified: false`, all exported URLs are null, and no source text or hashes exist. It correctly prohibits claim grounding. The permitted uses ("seed discovery," "generate source-needs report," "cross-check") are narrowly scoped.

**But the classification label `CANONICAL_CANDIDATE` is the second-highest confidence tier in the legend.** Given that every other existing data structure is classified lower (`SUPPORTING_CONTEXT_ONLY`, `DERIVED_ARTIFACT_ONLY`, `NOT_A_SOURCE`, `UNKNOWN`), `CANONICAL_CANDIDATE` occupies a visually deceptive position at the top of the hierarchy. A reader scanning the summary table sees "CANONICAL_CANDIDATE — Could become a primary source pack" as the best available classification among existing data, which could seed false confidence.

**Correction required:** Rename to `CITATION_SEED_ONLY` or `DISCOVERY_SEED_ONLY`. Reserve `CANONICAL_CANDIDATE` for actual source packs that have been built and partially verified (i.e., what the schema calls "Level 1 feasibility"). The current label overstates proximity to canonicality.

---

## 2. Is `taxonomy_sources` Row-Count Contradiction Properly Blocking?

**Finding: Correctly blocked as a hard BLOCKER. The contradiction is well-evidenced and appropriately gated.**

The contradiction appears in 4 separate documents with consistent severity:
- `state-doc-contradictions.md` contradiction #49: `BLOCKER`
- `source-canonicality-decision.md`: "cannot be authoritative while row count is zero"
- `live-db-schema-delta.md`: "BLOCKER for source-grounded pipeline and separate data-integrity investigation"
- `source-pack-readiness-report.md` minimum unblock criteria #5

The required resolution is properly scoped: investigate, don't assume. The documents don't speculate about what happened (data loss vs. stale comment vs. never-populated). The blocking is correctly operationalized: "Until then, all source-grounded pipeline work must ignore taxonomy_sources."

**No correction needed.** This is the best-handled contradiction in the set.

---

## 3. Is `taxonomy_tree.wiki_items` Correctly Treated?

**Finding: Correctly classified as `SUPPORTING_CONTEXT_ONLY`. No overclaim.**

The classification in `source-canonicality-decision.md` is precise: "navigation/join artifact, not a source text. It does not contain legal/code excerpts, URLs, or verified references." This is exactly right. The JSONB array maps article slugs to taxonomy nodes — it's a discovery tool, nothing more.

**No correction needed.**

---

## 4. Is `wiki_articles.content` Incorrectly Treated as Evidence?

**Finding: Correctly classified as `AUTHORING_BRIEF_ONLY` / `DERIVED_ARTIFACT_ONLY`, but the "baseline" framing carries a subtle risk.**

The classification is correct. The documents explicitly state that article content is editorial prose, may contain errors (confirmed by fact-checking flags), and cannot validate legal claims.

**However:** The phrase "rewrite baseline" and "diff anchor" appears in permitted uses. While this is operationally correct (you need to know what the article currently says before you change it), there's a risk that a future implementation treats the baseline as "close enough to truth" rather than "what the article currently says, which may itself be wrong." The fact-checking evidence in `.ai/14_fact_checking/` (418 flags, confirmed wrong section references) proves that the baseline already contains errors.

**Correction required:** Add an explicit caveat under permitted uses: *"The baseline may itself contain factual errors. The fact-preservation comparison must verify against a source pack, not assume baseline correctness."*

---

## 5. Is Question-Bank Source Coverage Sufficiently Separated from Article Source Coverage?

**Finding: Intent to separate is clear, but operational separation is incomplete. This is a gap.**

The documents correctly assert that questions fail differently from prose (`readiness-report.md` Finding 5, `state-doc-contradictions.md` #31). The coverage gap map has a separate Section 2 for question-bank clusters.

**But the source-pack schema is article-centric:**

- `linked_questions` is an array field on the source pack object — questions are treated as consumers of article-level source packs rather than having their own source-grounding requirements
- The claim-to-chunk linkage object (`source-pack-schema-readiness.md` Section 2.3) doesn't distinguish article claims from question claims (e.g., "PD 1096 Rule VIII §805 says X" in an answer key vs. in article prose)
- Question-specific risks (answer-key correctness, distractor source-traceability, `questions.rationale` contradiction) don't map cleanly to the article-centric claim-linkage object
- `questions.code_citation` is free-text (`source-provenance-map.md`) — there's no plan to normalize it to structured section references that could be validated against source pack chunks

The minimum unblock criteria requires zero question-level source packs (only article-level). This is a defensible starting point — article source packs can cover question answer keys for overlapping topics. But the operational gap should be explicitly acknowledged.

**Correction required:** Add a question-level source-grounding subsection to the source-pack schema. At minimum, define how `questions.code_citation` will be validated against source pack chunks during Phase 1B (normalization strategy, section-matching rules, contradiction flagging).

---

## 6. Is the Source-Pack Schema Strict Enough for High-Risk Law/Code Claims?

**Finding: Strong foundation but missing structured legal citation fields. Free-text `section_label` is insufficient.**

The schema is comprehensive on provenance, integrity, and verification. It mandates hashes, verification status, reviewer attribution, page locators, and support levels. These are all necessary.

**But for Philippine legal/regulatory sources, `section_label` as free-text string is a gap:**

| What the schema has | What's missing for law/code validation |
|---|---|
| `section_label: "Rule VIII, Section 805"` | No `law_code` (PD 1096 / RA 9514 / BP 344) |
| `section_hierarchy: ["Rule VIII", "Section 805"]` | No `rule_number` as structured integer |
| `page_start`, `page_end` | No `section_number` as structured integer |
| Free-text keywords | No `irr_year` (2004, 2024) |
| | No `paragraph_identifier` (a, b, c subsections) |
| | No `is_current_version` flag |

Free-text labels make deterministic validation fragile. "Rule VIII Section 805" could be entered as "Rule 8 Sec 805," "R8 §805," or "Section 805, Rule VIII." Without structured fields, a validator cannot reliably answer "does this section actually exist in the source document?" or "is this the current IRR version?"

**Correction required:** Add structured legal citation fields to the Chunk object: `law_code`, `rule_number`, `section_number`, `irr_year`, `paragraph_identifier`, and `is_current_version`. Reserve `section_label` as the human-readable display string, but require structured fields for validation.

---

## 7. Does Phase 1B Remain Correctly Blocked?

**Finding: Yes, correctly blocked. The gate logic is sound and internally consistent.**

All 8 documents agree: NO-GO for source-grounded prototype, CONDITIONAL GO for read-only planning. The blocking is operationalized through the acceptance rule ("no high-risk article enters Phase 1B without approved source-pack candidate or unsourced baseline marking") and minimum unblock criteria (7 specific, verifiable requirements).

The "unsourced baseline" escape hatch is correctly scoped: only low-risk articles, structural/component changes only, human SME review required. This prevents the escape hatch from becoming a bypass.

**However:** The `state-doc-contradictions.md` contradiction #51 (`ai_audit_*` tables may not exist live) is classified as `HIGH_RISK`. Given that the entire admin review pipeline depends on these tables, and live existence is unconfirmed, I recommend upgrading this to `BLOCKER`. You cannot safely plan Phase 1B admin integration if the storage layer is unconfirmed.

**Correction required:** Upgrade `state-doc-contradictions.md` contradiction #51 severity from `HIGH_RISK` to `BLOCKER` — no admin audit pipeline integration assumption is safe until `information_schema.tables` query confirms `ai_audit_*` existence.

---

## 8. Is Any Source-Grounded Generation Implied Before Source Packs Exist?

**Finding: Generation is correctly blocked everywhere, but one action item wording is risky.**

The documents uniformly and repeatedly state that source-grounded generation is blocked. The safe/blocked tables in `source-pack-readiness-report.md` are explicit. The `source-coverage-gap-map.md` Section 7 lists blocked actions. No document proposes starting generation without source packs.

**However:** `source-pack-readiness-report.md` Section 7, item #12 states: *"Run a single non-mutating claim-extraction demo. Extract claims from one article and map to source pack chunks (manual or scripted)."*

This is listed under "Short-term (Unblock Phase 1B)." While the description says "manual or scripted" and is correctly sequenced after building a source pack first (item #8), the phrase "claim-extraction demo" could be read by a future agent as "start extracting claims with AI." Since claim extraction is a Phase 3 activity (per the AI prompt plan), this wording prefigures work that should not begin until source packs exist.

**Correction required:** Re-word to: *"Read-only claim-mapping exercise: manually identify 5 claims in one article and document which source pack chunk would support or refute each claim. No automatic or AI-assisted extraction."*

---

## Summary Deliverables

### Phase 0.5 Verdict

**NO-GO for source-grounded prototype. CONDITIONAL GO for read-only planning, coverage mapping, and schema design.** The gate is correctly maintained. The documents are internally consistent and properly evidence-based.

### Blockers Before Phase 1B (all correctly identified, one severity upgrade needed)

| # | Blocker | Severity | Status |
|---|---|---|---|
| 1 | Zero approved source packs | BLOCKER | Correctly identified |
| 2 | `taxonomy_sources` 0 rows vs "COMPLETE" comment | BLOCKER | Correctly identified |
| 3 | `ai_audit_*` table existence unconfirmed | **Requires upgrade to BLOCKER** | Currently HIGH_RISK in contradiction #51 |
| 4 | `restrict_ai_audit_admin_access` migration not applied | HIGH_RISK | Correct, but should elevate if tables confirmed to exist |
| 5 | Copyright/provider boundary for Philippine government docs not decided | HIGH | Correctly identified |
| 6 | Source-pack storage location not decided | MEDIUM | Correctly identified |
| 7 | `wiki_article_sources` verification audit not completed | BLOCKER | Correctly identified in contradiction #53 |

### Required Corrections

1. **Rename `CANONICAL_CANDIDATE` to `CITATION_SEED_ONLY` or `DISCOVERY_SEED_ONLY`** — the current name overstates proximity to canonicality (affects `source-canonicality-decision.md` summary table and any referencing documents).

2. **Add structured legal citation fields to the Chunk schema** (`source-pack-schema-readiness.md` Section 2.2): `law_code`, `rule_number`, `section_number`, `irr_year`, `paragraph_identifier`, `is_current_version`. Free-text `section_label` is insufficient for deterministic validation of Philippine legal references.

3. **Add question-level source-grounding subsection** to the source-pack schema. Define how `questions.code_citation` (free-text) will be normalized and validated against source pack chunks.

4. **Add explicit baseline-error caveat** to `wiki_articles.content` permitted uses in `source-canonicality-decision.md`: "The baseline may itself contain factual errors. Fact-preservation comparison must verify against a source pack, not assume baseline correctness."

5. **Upgrade contradiction #51** in `state-doc-contradictions.md` from `HIGH_RISK` to `BLOCKER` — no admin audit pipeline integration planning is safe until `ai_audit_*` table existence is confirmed live.

### Overclaims to Remove

1. **`source-pack-readiness-report.md` Section 7, item #12:** Re-word "claim-extraction demo" to "read-only claim-mapping exercise" with explicit prohibition on AI-assisted extraction.

2. **`source-canonicality-decision.md` summary table row for `wiki_article_sources`:** The current label `CANONICAL_CANDIDATE (reserved)` implies higher authority than is warranted for unverified, null-URL, no-text citation rows. Rename per correction #1 above.

### Minimum Evidence Needed for Source-Pack Approval

The existing minimum unblock criteria in `source-pack-readiness-report.md` Section 5.1 are sound: one approved source pack (10+ chunks, verified, hashed), storage location decided, provider boundary decided, `taxonomy_sources` contradiction resolved, `wiki_article_sources` verification audit completed. I recommend adding:

- **#8: Structured citation fields populated** for at least 5 chunks in the first source pack (law_code, rule_number, section_number, irr_year) to prove the schema supports deterministic section validation.
