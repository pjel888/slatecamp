# Source ID Naming Convention — Phase 0.5A.1

**Date:** 2026-05-05  
**Scope:** Define stable, human-readable, version-aware naming conventions for `source_id` and chunk IDs used in the source manifest and source packs.  
**Status:** Planning document only. No implementation.

---

## 1. Principles

All source IDs and chunk IDs must be:

1. **Stable** — Once assigned, an ID must not change. If the document is revised, a new ID is created.
2. **Human-readable** — A human should be able to guess the document from the ID.
3. **Lowercase** — All IDs are lowercase to avoid case-sensitivity issues.
4. **Slug-safe** — IDs must be safe for use in filenames, URLs, and CSV cells. Allowed characters: `a-z`, `0-9`, `-`, `_`, `:` (chunk separator only).
5. **Version-aware** — The ID must encode the document version or year so that revisions are distinguishable.
6. **Hierarchical** — Chunk IDs must encode the document, rule, and section hierarchy for traceability.

---

## 2. Source ID Format

### 2.1 Base Format

```
<document-code>-<document-type>-<publisher-or-source>-<version-or-year>
```

### 2.2 Segment Definitions

| Segment | Description | Examples |
|---|---|---|
| `document-code` | Short code for the law or document family | `pd1096`, `bp344`, `ra9266`, `ra9514`, `spp`, `prc` |
| `document-type` | Type of document within the family | `irr`, `act`, `code`, `rules`, `contract`, `program`, `memo` |
| `publisher-or-source` | Issuing body or source identifier | `dpwh`, `ncda`, `bfp`, `prc`, `og` (Official Gazette), `local` |
| `version-or-year` | Year of the version. Use `unknown` only as a temporary unresolved value; use `current` only with a manifest `date_assigned_current`/notes entry explaining evidence. | `2004`, `2024`, `unknown` |

### 2.3 Examples

| Document | Source ID |
|---|---|
| PD 1096 National Building Code of the Philippines (2004 Revised IRR, DPWH) | `pd1096-irr-dpwh-2004` |
| BP 344 Accessibility Law (2024 Revised IRR, NCDA) | `bp344-irr-ncda-2024` |
| RA 9266 Architecture Act (original act, Official Gazette/Lawphil) | `ra9266-act-og-2004` |
| RA 9514 Fire Code (2019 Revised IRR, BFP) | `ra9514-irr-bfp-2019` |
| SPP / Standard Philippine Contract form | `spp-contract-local-unknown` until version evidence is recorded |
| PRC Architecture Licensure Exam program / syllabus | `prc-program-prc-current` |

### 2.4 Special Cases

| Case | Rule | Example |
|---|---|---|
| Unknown publisher | Use `unknown` or `local` | `pd1096-irr-unknown-2004` |
| Unknown year | Use `unknown` and require manifest notes; do not leave unresolved permanently | `ra9266-act-og-unknown` |
| Current label needed | `current` is temporary only and requires `date_assigned_current` plus evidence in manifest notes | `prc-program-prc-current` with date/evidence notes |
| Multiple publishers | Use the primary one; note others in manifest | `bp344-irr-ncda-2024` (note: also published by Official Gazette) |
| Translated document | Append `-lang-<code>` to base ID | `bp344-irr-ncda-2024-lang-tl` |
| Amendment / errata | Append `-amend-<n>` or `-errata-<date>` | `pd1096-irr-dpwh-2004-errata-2010` |

---

## 3. Chunk ID Format

### 3.1 Base Format

```
<source_id>::<locator-type>-<locator-value>[::<hierarchy>...]
```

### 3.2 Segment Definitions

| Segment | Description | Examples |
|---|---|---|
| `source_id` | The base source ID (see Section 2) | `bp344-irr-ncda-2024` |
| `locator-type` | Type of locator: `page`, `rule`, `section`, `article`, `chapter` | `page`, `rule`, `section` |
| `locator-value` | The locator value, zero-padded for sortability | `012`, `vii`, `704` |
| `hierarchy` | Optional additional hierarchy levels | `rule-ii`, `section-3`, `division-3` |

### 3.3 Examples

| Chunk Description | Chunk ID |
|---|---|
| BP 344 IRR 2024, page 12, Rule II, Section 3 | `bp344-irr-ncda-2024::page-012::rule-ii::section-3` |
| PD 1096 IRR, Rule VII, Section 704 | `pd1096-irr-dpwh-2004::rule-vii::section-704` |
| RA 9514 IRR 2019, Rule 10, Division 3 | `ra9514-irr-bfp-2019::rule-10::division-3` |
| RA 9266 Act, Chapter 3, Article 15 | `ra9266-act-og-2004::chapter-3::article-15` |
| SPP Contract, Section 5.2 | `spp-contract-local-unknown::section-5.2` until version evidence is recorded |
| PRC Program, Module 4, Topic 2 | `prc-program-prc-current::module-4::topic-2` |

### 3.4 Locator Value Rules

| Locator Type | Formatting Rule | Example |
|---|---|---|
| `page` | Zero-padded to 3 digits | `page-001`, `page-042`, `page-142` |
| `rule` | Roman numerals or Arabic numerals as in original | `rule-vii`, `rule-10` |
| `section` | Arabic numerals; preserve decimals | `section-3`, `section-704`, `section-5.2` |
| `article` | Arabic numerals | `article-15` |
| `chapter` | Arabic numerals | `chapter-3` |
| `division` | Arabic numerals | `division-3` |
| `module` | Arabic numerals | `module-4` |
| `topic` | Arabic numerals | `topic-2` |

### 3.5 Chunk ID Rules

1. **Uniqueness.** A chunk ID must be unique within the entire repository. If two chunks from different sources would have the same ID, append a disambiguator: `::part-a`, `::part-b`.
2. **Immutability.** Once a chunk ID is assigned, it must not change. If the source text is re-extracted, the chunk ID remains the same if the content is substantively identical; a new ID is created if the content changes.
3. **Sortability.** Chunk IDs should sort in reading order when sorted lexicographically. Use zero-padding for page numbers and consistent Roman/Arabic numeral conventions.
4. **Human readability.** A human should be able to look at a chunk ID and know which document, rule, and section it refers to.

---

## 4. ID Stability and Versioning

### 4.1 When to Create a New Source ID

A new source ID is required when:

- A new edition or revision of the document is obtained.
- The document is re-issued by a different publisher.
- A significant amendment or errata changes the document structure.

A new source ID is **not** required when:

- The same PDF is re-hashed (hash changes due to file metadata, not content).
- The same document is re-extracted with a better tool (chunk IDs remain stable; extraction report is updated).

### 4.2 Chunk ID Stability Across Re-extraction

If a document is re-extracted with a better tool but the content is substantively the same:

- Chunk IDs **must remain the same**.
- The `derived_text_sha256` will change; this is expected and recorded in the manifest.
- The `extraction_method`, `extraction_tool_version`, and `extraction_quality` fields are updated.

If re-extraction changes the content (e.g., OCR correction changes a word):

- A new source ID may be required if the changes are extensive.
- If changes are minor, the existing chunk IDs may be retained with a note in the `notes` field.

### 4.3 `current` and `unknown` labels

- Prefer explicit version years whenever evidence exists.
- `unknown` means the version year is unresolved and must be prioritized for verification before grounding.
- `current` is allowed only as a temporary operational label for documents that are inherently recency-based, such as PRC exam programs, and must be paired with manifest `date_assigned_current` plus evidence notes.
- A `current` or `unknown` source ID cannot be promoted to `CANONICAL_AFTER_REVIEW` until the version evidence is resolved or explicitly accepted by human review.

---

## 5. Examples by Document Family

### 5.1 PD 1096 (National Building Code)

| Document | Source ID | Example Chunk ID |
|---|---|---|
| 2004 Revised IRR, DPWH | `pd1096-irr-dpwh-2004` | `pd1096-irr-dpwh-2004::rule-vii::section-704` |
| 1977 Original Code | `pd1096-code-og-1977` | `pd1096-code-og-1977::section-101` |
| Latest available (unknown year) | `pd1096-irr-dpwh-unknown` | `pd1096-irr-dpwh-unknown::rule-i::section-100` |

### 5.2 BP 344 (Accessibility Law)

| Document | Source ID | Example Chunk ID |
|---|---|---|
| 2024 Revised IRR, NCDA | `bp344-irr-ncda-2024` | `bp344-irr-ncda-2024::page-012::rule-ii::section-3` |
| 2009 Original IRR | `bp344-irr-ncda-2009` | `bp344-irr-ncda-2009::rule-i::section-1` |

### 5.3 RA 9266 (Architecture Act)

| Document | Source ID | Example Chunk ID |
|---|---|---|
| Original Act, Official Gazette/Lawphil | `ra9266-act-og-2004` | `ra9266-act-og-2004::chapter-3::article-15` |
| IRR (if any, version unresolved) | `ra9266-irr-prc-unknown` | `ra9266-irr-prc-unknown::rule-1::section-1` |

### 5.4 RA 9514 (Fire Code)

| Document | Source ID | Example Chunk ID |
|---|---|---|
| 2019 Revised IRR, BFP | `ra9514-irr-bfp-2019` | `ra9514-irr-bfp-2019::rule-10::division-3` |
| 2008 Original IRR | `ra9514-irr-bfp-2008` | `ra9514-irr-bfp-2008::rule-1::section-1` |

### 5.5 SPP / Contracts

| Document | Source ID | Example Chunk ID |
|---|---|---|
| Standard Philippine Contract form | `spp-contract-local-unknown` | `spp-contract-local-unknown::section-5.2` |
| Specific contract type (e.g., construction) | `spp-contract-construction-local-unknown` | `spp-contract-construction-local-unknown::article-12` |

### 5.6 PRC Programs

| Document | Source ID | Example Chunk ID |
|---|---|---|
| Architecture Licensure Exam syllabus | `prc-program-prc-current` | `prc-program-prc-current::module-4::topic-2` |
| Specific program year | `prc-program-prc-2026` | `prc-program-prc-2026::module-1::topic-1` |

---

## 6. Document Relationships

| Document | Relationship |
|---|---|
| `source-drop-intake-protocol.md` | Uses these IDs in the manifest and state machine |
| `source-file-manifest-schema.md` | Defines the `source_id` field that must follow this convention |
| `10-source-pack-and-grounding-plan.md` | Uses chunk IDs for claim-to-chunk mapping |

---

*End of Phase 0.5A.1 Source ID Naming Convention*
