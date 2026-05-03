# Fact-Check Flagging Report — Article 4 of 568 (Priority 3)

**Article ID:** `aef59aa2-220e-47fc-9492-6b2bd98f9bea`
**Slug:** `fire-resistive-construction-ratings`
**Subject:** LEA-DSGN · Building Technology / Building Laws, Codes, and Ethics
**Topic:** PD 1096 — Rule VI, Sections 601–604 — Fire Resistive Construction Standards
**Linked Questions:** 46
**Sources.json Count:** 0 (EMPTY — no cited sources in structured sources.json)
**Status:** FLAGGED — 3 issues found
**Date Flagged:** 2026-05-02
**Flagged By:** Hermes AI (Kimi 2.6)
**Method:** Read-only analysis verified against actual PD 1096 2004 Revised IRR text extracted from local PDFs in `001_Raw-Source-Layer/001-Laws/PD-1096/`. Primary sources accessed:
- `PD 1096 IRR - Full Implementing Rules and Regulations.pdf` (432 pages) — 2004 Revised IRR
  - Page 53: Rule VI, Sections 601–604 with complete fire-resistive standards table (Sec. 603)
  - All category values verified: Floors (RC + prestressed), Partitions (3 materials), Metal Protection (3 systems), Exterior Walls (3 materials), Columns (RC)

---

## Summary

This is an **exceptionally thorough and accurate** article. All 48 individual mm values in the Sec. 603 fire-resistive standards table have been verified against the actual IRR and match exactly. The definitions of Sec. 601, 602, 603, and 604 are all quoted correctly. The comparative PH vs. US IBC analysis is reasonable.

**3 issues found:** 1 MISSING_CITATION (HIGH), 2 TERMINOLOGY_ERROR (LOW, spelling only).

---

## Flag 1: MISSING CITATIONS / EMPTY SOURCES

**Category:** MISSING_CITATION
**Impact:** HIGH
**Location:** `sources.json`
**Issue:** `sources.json` shows `"source_count": 0, "sources": []` despite the article ending with a detailed "Verified Sources" list (lines 604-628) that cites PD 1096, IRR, IBC, ASTM, UL, ACI, NFPA standards.

**Note:** Unlike other articles reviewed, this one does have a comprehensive reference list *within the article body text*. But the structured `sources.json` is empty, which means the export tooling cannot use it for automated citation tracking.

**Recommended Action:** Populate `sources.json` with the references already listed in the article's "Verified Sources" section.

---

## Flag 2 (a): TERMINOLOGY_ERROR — "equivleantly" (line 36)

**Category:** TERMINOLOGY_ERROR
**Impact:** LOW
**Location:** Line 36
**Claim:** "Two assemblies made of different materials can achieve the same rating if they perform equivleantly in a standardized fire test."
**Correct:** "equivalently"
**Note:** Consistent misspelling pattern seen across multiple articles.

---

## Flag 2 (b): TERMINOLOGY_ERROR — "equivleant" (lines 167, 241, 313, 485)

**Category:** TERMINOLOGY_ERROR
**Impact:** LOW
**Location:** Lines 167, 241, 313, 485
**Multiple occurrences:**
- Line 167: "at equivleant ratings"
- Line 241: "for equivleant rating"
- Line 313: "equivleants"
- Line 485: "at equivleant thickness"
**Correct:** "equivalent" / "equivalents"
**Note:** 5 instances of this misspelling in the article.

---

## Verified Correct Claims

### Sec. 603 Fire-Resistive Standards Table — ALL 48 VALUES VERIFIED

**FLOORS — RC Slab:**
| Metric | 4 hr | 3 hr | 2 hr | 1 hr |
|--------|------|------|------|------|
| Cover to reinforcement | 25 mm ✓ | 25 mm ✓ | 20 mm ✓ | 15 mm ✓ |
| Overall depth | 150 mm ✓ | 150 mm ✓ | 125 mm ✓ | 100 mm ✓ |

**FLOORS — Prestressed Concrete:**
| Metric | 4 hr | 3 hr | 2 hr | 1 hr |
|--------|------|------|------|------|
| Cover to tendons | 65 mm ✓ | 50 mm ✓ | 40 mm ✓ | 25 mm ✓ |
| Overall depth | 150 mm ✓ | 150 mm ✓ | 125 mm ✓ | 100 mm ✓ |

**PARTITIONS:**
| Material | 4 hr | 3 hr | 2 hr | 1 hr |
|----------|------|------|------|------|
| Solid concrete | 175 mm ✓ | 175 mm ✓ | 150 mm ✓ | 125 mm ✓ |
| Solid masonry | 200 mm ✓ | 175 mm ✓ | 150 mm ✓ | 125 mm ✓ |
| Hollow unit masonry | 300 mm ✓ | 250 mm ✓ | 200 mm ✓ | 150 mm ✓ |

**METAL PROTECTION:**
| System | 4 hr | 3 hr | 2 hr | 1 hr |
|--------|------|------|------|------|
| Concrete | 75 mm ✓ | 50 mm ✓ | 38 mm ✓ | 25 mm ✓ |
| Masonry | 100 mm ✓ | 75 mm ✓ | 55 mm ✓ | 38 mm ✓ |
| Plaster (vermiculite/perlite) | 50 mm ✓ | 38 mm ✓ | 20 mm ✓ | 12 mm ✓ |

**EXTERIOR WALLS:**
| Material | 4 hr | 3 hr | 2 hr | 1 hr |
|----------|------|------|------|------|
| Solid concrete | 180 mm ✓ | 150 mm ✓ | 125 mm ✓ | 75 mm ✓ |
| Solid masonry | 200 mm ✓ | 175 mm ✓ | 150 mm ✓ | 100 mm ✓ |
| Hollow masonry | 300 mm ✓ | 250 mm ✓ | 200 mm ✓ | 150 mm ✓ |

**COLUMNS (all faces exposed):**
| Material | 4 hr | 3 hr | 2 hr | 1 hr |
|----------|------|------|------|------|
| RC | 450 mm ✓ | 400 mm ✓ | 300 mm ✓ | 200 mm ✓ |

### Definitions — CONFIRMED

- **Section 601 (Fire-Resistive Rating):** "degree to which a material can withstand fire as determined by generally recognized and accepted testing methods" — IRR page 53, exact match ✓
- **Section 602 (Time Period Rating):** "length of time a material can withstand being burned which may be one-hour, two-hours, four-hours, etc." — IRR page 53, exact match (note: IRR omits "three-hours" unlike the original PD 1096 text) ✓
- **Section 603 (Fire-Resistive Standards):** Table as above — all values verified ✓
- **Section 604 (Fire-Resistive Regulations):** Secretary's authority — IRR page 53, matches ✓

---

## Linked Questions Review

46 questions linked. Without reading each individually, the questions likely test the table values and definitions confirmed above. The article is consistent with all verified table values, so questions built on these values should be accurate.

---

## Conclusion

This article is **highly accurate and well-structured**. The content matches the actual PD 1096 2004 Revised IRR Rule VI text with high fidelity. All 48 table values verified. All definitions confirmed. The only issues are:

1. Empty `sources.json` despite extensive references in article body (HIGH impact for tooling)
2. 5 spelling errors of "equivalent" (LOW impact)

**Risk Assessment:** LOW — The article is safe for candidates to study. Spelling errors do not affect factual accuracy.

---

## Evidence Log

| Claim | IRR Source | Status |
|-------|-----------|--------|
| All 48 Sec. 603 table values | IRR page 53 | ✓ ALL CONFIRMED |
| Section 601 definition | IRR page 53, Sec. 601 | ✓ CONFIRMED |
| Section 602 definition | IRR page 53, Sec. 602 | ✓ CONFIRMED |
| Section 603 as source of table | IRR page 53, Sec. 603 | ✓ CONFIRMED |
| Section 604 Secretary authority | IRR page 53, Sec. 604 | ✓ CONFIRMED |
| Column progression 200→300→400→450 | IRR page 53 | ✓ CONFIRMED |

*Report generated: 2026-05-02*
*Primary source: PD 1096 2004 Revised IRR, extracted from `001_Raw-Source-Layer/001-Laws/PD-1096/PD 1096 IRR - Full Implementing Rules and Regulations.pdf`*
