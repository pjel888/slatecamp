# Local Source File Classification — Phase 0.5A.2

**Generated:** 2026-05-05T14:47:56Z  
**Source intake path:** `vitruvius-connection/`

---

## Classification Summary

| Classification | Count | Allowed use posture |
|---|---:|---|
| `LOCAL_DERIVED_TEXT_UNVERIFIED` | 1840 | `DISCOVERY_ONLY`; no file is verified. |
| `LOCAL_UNKNOWN_PROVENANCE` | 711 | `DISCOVERY_ONLY`; no file is verified. |

---

## Gate Classification

The intake is now file-visible and hashable, but no file can be promoted to `VERIFIED_SOURCE_CANDIDATE` in this pass.

Reasons:

1. No human/SME verification has been recorded.
2. Official web match status is `unverified` for generated rows.
3. Page counts, locator support, extraction quality, and table/formula preservation are not established.
4. The visible folders are `002_Raw-Conversion-Layer` and `003_Canonical-Knowledge-Layer`; no `001_Raw-Source-Layer` was visible.
5. Markdown and JSON files are derived/metadata artifacts, not original sources.
6. PDFs are retained candidates for reconciliation, not automatically official/current/canonical.

---

## Conservative Allowed Use

| Allowed use | File count |
|---|---:|
| `DISCOVERY_ONLY` | 2551 |

All rows are `DISCOVERY_ONLY` in this generated pass. A future row may be marked `AUTHORING_CONTEXT_ONLY` or `GROUNDING_CANDIDATE` only after the intake protocol permits it through metadata, provenance, and verification evidence.

---

## Risk Summary

| Risk tier | File count |
|---|---:|
| `MEDIUM` | 1840 |
| `LOW` | 664 |
| `HIGH` | 47 |

---

## Status

```txt
SOURCE_FILES_VISIBLE = true
HASHES_COMPUTED = true
VERIFIED_SOURCE_CANDIDATE = 0
CANONICAL_AFTER_REVIEW = 0
SOURCE_PACK_CREATION = BLOCKED
```

---

*End of generated classification.*
