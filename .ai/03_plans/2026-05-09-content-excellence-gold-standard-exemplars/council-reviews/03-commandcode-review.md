# Command Code Council Review

I'll review the gold-standard exemplar pack systematically. Let me read all the relevant files first.Let me read the full exemplar files to assess their quality.Let me check the available law folders in vitruvius-connection for additional exemplar recommendations.Now I have all the information needed. Let me compile the review memo.---

## Gold-Standard Exemplar Pack Review Memo

**Date:** 2026-05-09
**Reviewer:** Code Review Agent
**Scope:** 5 calibration exemplars + source-layer inventory

---

### Verdict

**Status: PASS FOR CALIBRATION with conditional holds.**

The five exemplars successfully demonstrate the CONTENT_EXCELLENCE_GOAL standard structure. They avoid AI slop, cite primary sources with PDF page locators, target exam traps, and write from learner tasks rather than generic introductions. However, **exemplars 03, 04, and 05 have source-verification gaps that block them from being true gold-standard artifacts** without remediation.

---

### Current Exemplar Fixes Required

| Exemplar | Issue | Fix |
|----------|-------|-----|
| **03-RA9514** | Uses source-pack with known conflict (chunks point to BP 344, not RA 9514 per accuracy gates doc) | Rebuild source-pack from actual RA 9514 RIRR PDF; add conflict-class warning to ledger |
| **04-NPCP** | OCR extraction failed for "FIXTlJRE liN IT" and vent pipe query | Manual PDF verification; add visual-check field to ledger template |
| **05-Vitruvius** | "ARCHITECTURE depends on Order" not found by extraction | Manual page verification; old PDFs need OCR cleanup or manual transcription |

---

### Top 10 Recommendations (Prioritized)

1. **Fix source-pack-ra-9514-rirr conflict immediately** — labeled as Fire Code but contains BP 344 content; quarantine until rebuilt
2. **Add manual PDF visual-check gate** for all OCR-extracted claims before SME release
3. **Implement JSON source-ledger schema** with claim-level tracking (claim_id, claim_class, status: SUPPORTED/NEEDS_REVIEW/REMOVE)
4. **Add conflict-class visibility** to every legal/code exemplar (raw_source_matches_official_but_conversion_layer_hash_mismatch, etc.)
5. **Create cross-exemplar linking** — BP 344 ramps relate to PD 1096 accessibility; RA 9266 foreign architect relates to UAP SPP
6. **Build PD 1096 NBC exemplar** — AMBF computation is highest-yield LEA topic not yet covered
7. **Add "claim class" tags** to article sections: LEGAL_DIMENSION, LEGAL_SCOPE, LEGAL_PROCESS, TECHNICAL_STANDARD, HISTORICAL_FACT
8. **Create exemplar for BP 220** — socialized housing rules, small but exam-relevant
9. **Add UAP SPP exemplar** — 21 PDFs in source layer, professional practice core
10. **Build RA 9184 (Green Building) exemplar** — 4 PDFs, increasingly tested, source-verifiable

---

### New Exemplar Topic Recommendations

**Immediate priority (high LEA yield, source-available):**

| Topic | Source Folder | Why High-Yield |
|-------|---------------|----------------|
| PD 1096 NBC AMBF computation | `001-Laws/PD-1096/` | Classic LEA calculation question |
| PD 1096 NBC occupancy classifications | `001-Laws/PD-1096/` | Foundation for all building code questions |
| BP 220 socialized housing | `001-Laws/BP-220/` | Specific exemptions, exam-trap prone |
| UAP SPP scope of services | `001-Laws/UAP/` | Professional practice core |
| RA 9184 green building requirements | `001-Laws/RA-9184/` | Increasingly tested, IRR available |
| PD 957 subdivision standards | `001-Laws/PD-957/` | Land development exam section |
| George Salvan architectural character | `002-History/` | Standard history/theory reference |
| NSCP structural provisions | Check DPWH folder | Seismic/wind load basics |

---

### Source-Ledger Required Fields

Every exemplar source-ledger must include:

```markdown
## Required Fields
- Document ID (e.g., `BP344_2024_IRR`)
- Relative path to `001_Raw-Source-Layer/`
- SHA256 hash
- PDF page count
- Locator set ID
- PDF pages used (list)
- Text extraction method
- Source tier (primary/local/official)
- **Conflict class** (none_detected_by_script | raw_source_matches_official_but_conversion_layer_hash_mismatch | ...)
- **SME release status** (pending | approved | rejected)
- **Visual PDF check** (completed | not_required | pending)
- Extracted evidence snippets with query + page + excerpt
```

---

### Validation Gates

Before any exemplar graduates from calibration to publication:

1. **Deterministic validator**: All claims have locators
2. **Source reviewer**: PDF visual check confirms extraction accuracy
3. **Conflict-class reviewer**: Source-pack integrity verified (pack_id, source_family, document_code align)
4. **Question reviewer**: Distractors are plausible, rationale explains why wrong answers fail
5. **SME gate**: Licensed architect or board examiner sign-off

---

### Risks / What Not To Do

- **Do not** let conversion layer (002) or canonical layer (003) silently replace raw source (001) as legal truth
- **Do not** publish exemplars with `SME release status: pending`
- **Do not** ignore conflict-class warnings in source-packs
- **Do not** assume OCR extraction is accurate for old/scanned PDFs — always require visual check
- **Do not** create new exemplars for topics where source-pack has known integrity issues (e.g., RA 9514 RIRR until rebuilt)

---

### Writing File Guidance

All SlateCamp writing files must include this hierarchy reminder:

> **Source hierarchy for legal/code claims:**
> 1. Approved source packs (`.ai/16_source_packs/`)
> 2. Raw official evidence (`vitruvius-connection/001_Raw-Source-Layer/`)
> 3. Official agency web/PDF (for version confirmation)
> 4. **002 Conversion layer** — search/discovery only, never sole legal truth
> 5. **003 Canonical layer** — concept relationships only, never sole legal truth
> 6. Textbooks — secondary context only, mark as non-statutory

**Every content production prompt must prepend:**
> Read and apply `.ai/CONTENT_EXCELLENCE_GOAL.md` before producing any content artifact.


## Raw status

```json
{
  "tool": "commandcode",
  "started_at": "2026-05-09T07:01:50Z",
  "duration_seconds": 159.69,
  "returncode": 0
}
```

## stderr

```text

```
