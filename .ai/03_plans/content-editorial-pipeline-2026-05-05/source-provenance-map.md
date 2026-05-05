# Source Provenance Map — Phase 0.5 Evidence

**Date:** 2026-05-05
**Scope:** Map every available source record and its provenance evidence. Distinguish citation rows from source packs. Identify whether source text is available, versioned, official, and claim-addressable.
**Method:** Read-only inspection of local export artifacts, live DB counts, and schema definitions.

---

## Provenance Quality Legend

| Quality Level | Meaning |
|---|---|
| `OFFICIAL_TEXT_AVAILABLE` | Full official source text is present in the repo/DB as excerpts or chunks. |
| `URL_ONLY` | A URL is known but source text is not stored locally. |
| `METADATA_ONLY` | Label, description, or type exists, but no URL or text. |
| `UNVERIFIED` | Row exists but `is_verified` is false or unchecked. |
| `CLAIM_ADDRESSABLE` | A specific claim can be mapped to a specific source chunk/section/page. |
| `CITATION_ROW_ONLY` | Database row links an article to a source concept, but no excerpt is stored. |

---

## 1. wiki_article_sources — Article-Scoped Citation Rows

| Field | Present? | Claim-addressable? | Notes |
|---|---|---|---|
| `source_id` (UUID) | Yes | No | Synthetic key |
| `article_id` (UUID) | Yes | No | Links to wiki_articles |
| `label` (TEXT) | Yes | Partial | Human-readable source name; not a locator |
| `url` (TEXT) | Sometimes | No | May be official URL, TBD, or placeholder |
| `source_type` (TAXONOMY_SOURCE_TYPE) | Yes | No | e.g., `pdf`, `website`, `book`, `law` |
| `description` (TEXT) | Sometimes | No | Free-text editorial description |
| `sort_order` (SMALLINT) | Yes | No | Display order only |
| `is_verified` (BOOLEAN) | Yes, defaults FALSE | No | Most rows are unverified |
| `created_at` / `updated_at` | Yes | No | Timestamp, not version |

**Provenance verdict:** `CITATION_ROW_ONLY` / `UNVERIFIED`

**Evidence:**
- 1,110 rows exported across 567 article bundles.
- Average ~2 sources per article.
- Many articles have `source_count: 0`.
- No `source_text` column. No `page_start`/`page_end`. No `section_label`. No `hash`.
- `is_verified` defaults to `FALSE`.

**Can it ground a claim?** No. It can say "this article references PD 1096" but not "PD 1096 Rule VIII Section 805 says X on page 123."

---

## 2. taxonomy_sources — Node-Scoped Citation Rows

| Field | Present? | Claim-addressable? | Notes |
|---|---|---|---|
| `id` (UUID) | Yes | No | Synthetic key |
| `node_id` (UUID) | Yes | No | Links to taxonomy_tree |
| `label` (TEXT) | N/A (0 rows) | No | Schema supports it |
| `url` (TEXT) | N/A (0 rows) | No | Schema supports it |
| `source_type` (TAXONOMY_SOURCE_TYPE) | N/A (0 rows) | No | Schema supports it |
| `is_verified` (BOOLEAN) | N/A (0 rows) | No | Schema supports it |
| `sort_order` (SMALLINT) | N/A (0 rows) | No | Schema supports it |

**Provenance verdict:** `UNKNOWN` — schema exists, zero data

**Evidence:**
- Live count: 0 rows.
- Table comment claims "v5.0 COMPLETE: all 66 source URLs populated with verified official URLs."
- Contradiction documented in `state-doc-contradictions.md` and `live-db-schema-delta.md`.

**Can it ground a claim?** No. The table is empty.

---

## 3. questions.code_citation — Question-Level Metadata

| Field | Present? | Claim-addressable? | Notes |
|---|---|---|---|
| `code_citation` (TEXT) | Sometimes (~30–40% of questions estimated) | Partial | Free-text section reference |
| `topic_id` (UUID) | Yes | No | Taxonomy link |

**Provenance verdict:** `CITATION_ROW_ONLY` / `UNVERIFIED`

**Evidence:**
- 7,159 questions in `questions` table.
- `code_citation` is nullable TEXT.
- No structured format enforced ("Sec 502", "Section 502", "§502" all possible).
- Fact-checking flags confirm wrong section references exist.
- No foreign key to a source pack or verified source text.

**Can it ground a claim?** No. It is an author-entered citation that must be cross-checked against a verified source pack.

---

## 4. design_scenario_questions.code_citation — Design Scenario Metadata

| Field | Present? | Claim-addressable? | Notes |
|---|---|---|---|
| `code_citation` (TEXT) | Sometimes | Partial | Free-text section reference |

**Provenance verdict:** Same as `questions.code_citation`.

**Evidence:**
- 249 design scenario questions.
- Same risks: unverified, free-text, no structured source pack link.

---

## 5. Local `.ai/content-audit-export/articles/*/sources.json` — Exported Citation Rows

| Content | Present? | Claim-addressable? | Notes |
|---|---|---|---|
| `label` | Yes | No | Source name |
| `url` | Sometimes | No | May be valid, TBD, or missing |
| `source_type` | Yes | No | e.g., `law`, `pdf`, `website` |
| `description` | Sometimes | No | Editorial description |
| `is_verified` | Yes | No | Mostly FALSE |

**Provenance verdict:** `CITATION_ROW_ONLY` / `UNVERIFIED`

**Evidence:**
- Direct export from `wiki_article_sources`.
- No source text excerpts. No hashes. No page locators.
- Same limitations as the DB table.

---

## 6. Local `.ai/14_fact_checking/flags/*.md` — Historical Review Artifacts

| Content | Present? | Claim-addressable? | Notes |
|---|---|---|---|
| Per-article flag reports | Yes | No | Judgments, not source text |
| Verdicts (`LIKELY_CORRECT`, etc.) | Yes | No | Editorial opinion |
| Claim references | Sometimes | Partial | May cite a section but without verified excerpt |

**Provenance verdict:** `DERIVED_ARTIFACT` — useful for risk triage, not for grounding.

---

## 7. External Official Sources — Not Yet in Repo

| Source | Official Text Available? | Version Known? | URL Known? | Locally Stored? |
|---|---|---|---|---|
| PD 1096 (2004 Revised IRR) | No (not in repo) | 2004 | Partial (via sources.json) | No |
| BP 344 (2024 Revised IRR) | No (not in repo) | 2024 | Partial | No |
| RA 9266 + IRR | No (not in repo) | Current | Partial | No |
| RA 9514 + IRR | No (not in repo) | Current | Partial | No |
| NSCP | No (not in repo) | 2015 (assumed) | Partial | No |
| BP 220 | No (not in repo) | Current | Partial | No |
| PD 957 | No (not in repo) | Current | Partial | No |
| SPP Documents (200, 202, 203, 204, 207) | No (not in repo) | Current | Partial | No |
| Civil Code (Articles 1723, 2176–2194) | No (not in repo) | Current | Partial | No |

**Provenance verdict:** `MISSING` — the intended canonical sources are not yet structured in the repo.

---

## 8. Source-to-Claim Traceability Matrix

| Source Record Type | Has Source Label? | Has URL? | Has Source Text? | Versioned? | Claim-Addressable? | Can Validate AI Rewrite? |
|---|---|---|---|---|---|---|
| `wiki_article_sources` | Yes | Sometimes | No | No | No | No |
| `taxonomy_sources` | Schema only | Schema only | No | No | No | No |
| `questions.code_citation` | Sometimes | No | No | No | Partial (section only) | No |
| `sources.json` (bundle export) | Yes | Sometimes | No | No | No | No |
| Fact-checking flags | Yes | Sometimes | No | No | No | No |
| External official PDFs (planned) | Yes | Yes | **Planned** | **Planned** | **Planned** | **Planned** |

---

## 9. Coverage by Article Cluster

### PD 1096 Cluster (High-risk building code articles)

| Source Availability | Article Count (estimated) | Source Type |
|---|---|---|
| Articles with `sources.json` entries referencing PD 1096 | ~40–60 | Citation rows only |
| Articles with verified source text excerpts | 0 | None |
| Articles with zero sources | ~15–25 (from pilot candidate shortlist) | None |

### BP 344 Cluster (Accessibility articles)

| Source Availability | Article Count (estimated) | Source Type |
|---|---|---|
| Articles with `sources.json` entries referencing BP 344 | ~20–30 | Citation rows only |
| Articles with verified source text excerpts | 0 | None |
| Articles with zero sources | ~10–15 | None |

### RA 9514 Cluster (Fire code articles)

| Source Availability | Article Count (estimated) | Source Type |
|---|---|---|
| Articles with `sources.json` entries referencing RA 9514 | ~15–25 | Citation rows only |
| Articles with verified source text excerpts | 0 | None |
| Articles with zero sources | ~5–10 | None |

### RA 9266 / Professional Practice Cluster

| Source Availability | Article Count (estimated) | Source Type |
|---|---|---|
| Articles with `sources.json` entries referencing RA 9266 or SPP | ~80–120 | Citation rows only |
| Articles with verified source text excerpts | 0 | None |
| Articles with zero sources | ~20–40 | None |

### Contracts / SPP / Compensation Cluster

| Source Availability | Article Count (estimated) | Source Type |
|---|---|---|
| Articles with `sources.json` entries referencing SPP docs | ~30–50 | Citation rows only |
| Articles with verified source text excerpts | 0 | None |
| Articles with zero sources | ~10–20 | None |

---

## 10. Key Finding: The Gap Between Citation and Source Pack

The repo has **1,110 citation rows** but **0 source packs**.

A citation row says: "This article is about PD 1096."
A source pack says: "PD 1096 Rule VIII Section 805(a) states: 'Every building shall have...' on page 123 of the 2004 Revised IRR. Hash: sha256:..."

The pipeline cannot safely propose factual changes until the latter exists.

---

## 11. Claude Review Focus

1. Should `wiki_article_sources` be upgraded in-place (add `source_text_excerpt`, `page_start`, `hash` columns) or should a new `source_packs` table be created?
2. Is the `taxonomy_sources` table comment a data-integrity bug that needs immediate investigation?
3. Should `questions.code_citation` be normalized to a structured format with foreign-key linkage to source packs?
4. Which external source should be the first source-pack feasibility target?
