# Source Bundle Reconciliation Plan — Phase 0.5A.3

**Created:** 2026-05-05T14:59:10Z
**Scope:** Convert the Phase 0.5A.2 file-level inventory into source-level document bundles.
**Status:** Planning/evidence only. No source-pack creation. No article/question edits. No Supabase mutation.

---

## 1. Purpose

The Phase 0.5A.2 inventory proves that `vitruvius-connection/` is visible and hashable, but it is still a file list. It does not yet prove which files represent the same source document.

This plan defines the next gate: group PDFs, raw Markdown, refined Markdown, sidecar JSON, canonical source pages, concept pages, and relationship pages into auditable source bundles.

A source bundle is not a source pack. It is a reconciliation unit used to decide whether a document can advance toward verification.

---

## 2. Inputs

| Input | Current Status | Role |
|---|---|---|
| `local-source-file-manifest.generated.csv` | 2,551 rows, all `DISCOVERY_ONLY` | File-level seed list |
| `local-source-file-hashes.json` | 2,551 SHA-256 entries | Byte identity evidence |
| `local-source-file-classification.md` | Layer/type/risk summary | Prioritization evidence |
| `local-source-file-gaps.md` | Gap list | Blocker register |
| `002_Raw-Conversion-Layer/` | Visible | Raw/conversion source files and sidecars |
| `003_Canonical-Knowledge-Layer/` | Visible | Derived source/concept/relationship graph |

---

## 3. Bundle Identity Model

Each reconciled bundle should receive a temporary `bundle_id` and a proposed stable `source_id`.

Recommended shape:

```yaml
bundle_id: bundle-000001
proposed_source_id: ra9514-rirr-bfp-2019
bundle_status: BUNDLED_UNVERIFIED
risk_tier: HIGH
source_family: law_code
primary_document_code: RA 9514 RIRR
source_title: Revised Implementing Rules and Regulations of RA 9514
issuing_body: BFP
version_year: 2019
files:
  pdf: []
  raw_markdown: []
  refined_markdown: []
  sidecar_json: []
  canonical_source_pages: []
  concept_pages: []
  relationship_pages: []
confidence:
  identity_match: medium
  pdf_text_pairing: unknown
  locator_support: unknown
  official_web_match: unverified
allowed_use: DISCOVERY_ONLY
next_gate: SOURCE_VERIFICATION_PACKET_REQUIRED
```

---

## 4. Bundle Status Values

| Status | Meaning | Grounding Allowed? |
|---|---|---|
| `UNBUNDLED` | File has not been assigned to a document bundle | No |
| `BUNDLED_UNVERIFIED` | Related files appear to represent one document, but provenance is not verified | No |
| `BUNDLED_WITH_PDF` | Bundle has at least one candidate PDF | No |
| `BUNDLED_DERIVED_ONLY` | Bundle has derived text but no retained original PDF | No |
| `OFFICIAL_URL_CANDIDATE_FOUND` | Official source candidate exists but match is not complete | No |
| `VERIFICATION_PACKET_READY` | Bundle has enough evidence for human/SME review | No |
| `VERIFICATION_PACKET_APPROVED` | Human/SME approved packet; may advance to source-pack planning | Yes, as `GROUNDING_CANDIDATE` only |
| `REJECTED_BUNDLE` | Bundle is misidentified, unusable, or unfit | No |

---

## 5. Matching Signals

Use multiple signals. Do not rely on filename similarity alone.

| Signal | Strength | Notes |
|---|---|---|
| Same directory family | Medium | Useful for `RA-9514/`, `UAP/`, etc. |
| Same normalized title | High | Must handle OCR/case/punctuation drift |
| Same document code | High | RA/PD/BP/IRR/SPP identifiers are strong anchors |
| Sidecar JSON `source_relative_path` / `refined_relative_path` | High | Strong pairing signal for raw/refined text |
| Canonical source frontmatter `source_relative_markdown_path` | High | Links canonical page back to refined source |
| Hash equality | High | Exact duplicate evidence |
| Text fingerprint similarity | Medium/High | Useful when filenames differ |
| Evidence snippets in relationship pages | Low/Medium | Helps discover related concepts, not enough for source identity |
| Concept page references | Low | Derived taxonomy only |

---

## 6. Required Reconciliation Checks

For every proposed bundle, record:

1. Candidate `source_id`.
2. All physical files in the bundle.
3. Whether an original PDF exists.
4. Whether Markdown/text is derived from a retained PDF.
5. Whether sidecar JSON records source/output hashes.
6. Whether page count can be determined.
7. Whether page locators survive in derived text.
8. Whether section/rule locators survive in derived text.
9. Whether tables/formulas are preserved or flagged.
10. Whether canonical source/concept/relationship pages are derived from the same source.
11. Candidate official URLs.
12. Bundle-level risk tier.
13. Bundle-level allowed use.
14. Human/SME review requirement.

---

## 7. Confidence Rules

### 7.1 Identity match confidence

| Confidence | Criteria |
|---|---|
| `high` | Title/document code/version align across PDF or raw file + refined file + sidecar/canonical page |
| `medium` | Directory/title/document code align, but PDF or sidecar evidence is incomplete |
| `low` | Only filename or relationship evidence suggests grouping |
| `unknown` | No reliable grouping signal |

### 7.2 PDF/text pair confidence

| Confidence | Criteria |
|---|---|
| `direct_extraction` | Sidecar metadata points from raw source to refined output and hashes are recorded |
| `strong_pair` | Same title/code/version and text fingerprint aligns with PDF extraction |
| `weak_pair` | Filename/directory suggests pair but no hash or extraction metadata |
| `derived_only` | Markdown/text exists but PDF is absent |
| `unknown` | Pairing cannot be established |

---

## 8. Output Artifacts for This Gate

The reconciliation pass should create these planning artifacts before any source-pack work:

| Artifact | Purpose |
|---|---|
| `source-bundle-map.generated.csv` | One row per reconciled source bundle |
| `source-bundle-map.generated.json` | Machine-readable bundle graph |
| `source-bundle-reconciliation-report.md` | Human-readable summary and blocker list |
| `source-bundle-high-risk-queue.md` | Legal/code bundles needing official/current verification first |
| `source-bundle-unpaired-files.md` | Files that could not be safely assigned |

These are evidence artifacts only. They do not approve any source.

---

## 9. Acceptance Criteria

This gate is complete when:

1. Every visible file is assigned to exactly one of:
   - a source bundle,
   - an orphan/unpaired file list,
   - a rejected/do-not-use list.
2. Every bundle has a proposed `source_id` or explicit `source_id = unresolved`.
3. Every bundle has a risk tier.
4. Every bundle has a PDF/text pair confidence value.
5. Every High/Critical legal-code bundle has an official-web verification requirement.
6. No bundle is promoted beyond `DISCOVERY_ONLY` by script alone.
7. Review packets can be generated for the highest-priority bundles.

---

## 10. Current Gate Verdict

```txt
CONDITIONAL GO for source-level reconciliation only
SOURCE_PACK_CREATION = BLOCKED
ARTICLE_REWRITING = BLOCKED
QUESTION_BANK_EDITING = BLOCKED
SUPABASE_MUTATION = BLOCKED
```

---

*End of Phase 0.5A.3 Source Bundle Reconciliation Plan.*
