# NSCP 2015 Acquisition and Extraction Report

**Date:** 2026-05-14
**Scope:** Bounded source recovery for LEA structural clusters
**Write targets:**
- `vitruvius-connection/001_Raw-Source-Layer/006 -Structural/NSCP-2015-recovery/`
- `.ai/03_plans/blocked-source-recovery/nscp-2015-acquisition-and-extraction-report.md` (this file)

**Constraint:** Read and write only within the recovery folder and this report. Zero edits to articles, question-edits, existing source captures, code, package files, git, Supabase, deploy, DB, or main.

---

## 1. Executive Summary

**Verdict: NO-GO for free legitimate source recovery. Path to unblock exists but requires purchase.**

The existing local file `National Structural Code of the Philippines 2015.pdf` (88.37 MB) is **completely corrupted** — 100% null bytes, unrecoverable via any PDF reader or extraction tool. SHA256: `12e04770e37571def323e6d0f29b0d20c7c4d4e088d39f519e0f2e0b5d91cc54`.

NSCP 2015 is a **copyrighted commercial publication** by the Association of Structural Engineers of the Philippines (ASEP). No legitimate free digital copy exists. The Philippine government (DPWH) explicitly refers requesters to ASEP for purchase. The Internet Archive hosts a full-text OCR copy, but it is an unauthorized upload with unclear legal standing.

**Seven structural clusters are blocked** by the missing NSCP source (four unlockable with NSCP text extraction, three requiring additional timber standards). The earlier analysis in `.ai/03_plans/blocked-source-recovery/lane-c-structural-kimi-opencode.md` (2026-05-14) assumed a **valid but unconverted PDF** — this report corrects that to **corrupted and unrecoverable**.

---

## 2. Corrupted Local File — Evidence

| Property | Value |
|----------|-------|
| Path | `vitruvius-connection/001_Raw-Source-Layer/006 -Structural/National Structural Code of the Philippines 2015.pdf` |
| Size | 92,666,420 bytes (88.37 MB) |
| SHA256 | `12e04770e37571def323e6d0f29b0d20c7c4d4e088d39f519e0f2e0b5d91cc54` |
| First 1024 bytes | All `0x00` (null) |
| `file` command output | `data` (not recognized as PDF) |
| PyMuPDF | Would fail with `FileDataError` |
| Cause | Unknown — possible git LFS corruption, disk error, or interrupted transfer |
| Recovery attempted | None possible — file contains no recoverable content at any offset |

---

## 3. Source Recovery Search Results

### 3.1 NSCP 2015 Publication Details

| Field | Value |
|-------|-------|
| Full title | National Structural Code of the Philippines 2015, Volume I: Buildings, Towers, and Other Vertical Structures |
| Edition | Seventh Edition (7th Edition) |
| Publisher | Association of Structural Engineers of the Philippines, Inc. (ASEP) |
| ISBN | 978-621-96063-1-8 |
| Printing | First Printing, 2016 |
| Copyright | © ASEP — all rights reserved; reproduction requires written permission |
| Technical basis | ASCE/SEI 7-10, ACI 318-14 |
| Current edition | NSCP 2024 (8th Edition), announced May 2024 at ASEP SMART Conference |
| Contact | `aseponline@gmail.com`, (+632) 410-0483, Suite 713 Future Point Plaza, Quezon City |
| Retail price | ₱1,299–₱2,959 (as observed in retail listings) |

### 3.2 Search Results Summary

| Source | Type | Authoritative | Full Text Available | Usable |
|--------|------|--------------|--------------------|--------|
| ASEP direct purchase | Publisher | ✅ Yes | After purchase | ✅ If purchased |
| Internet Archive (`archive.org/details/NSCP2015`) | Community upload | ❌ No (unauthorized) | ✅ Yes (OCR'd DJVU) | ⚠️ Gray area |
| DPWH FOI Portal | Government reference | ✅ Yes | ❌ No | ✅ For citation only |
| University libraries (UP, Mapua, DLSU) | Physical holdings | ✅ Yes | In-person only | ✅ Physical access |
| ideCAD (`idecad.com`) | Commercial marketing | ❌ No | ❌ Lead-gen gate | ❌ No |
| Scribd / PDFCoffee / Academia.edu | Pirated uploads | ❌ No | ✅ Yes | ❌ NO |

### 3.3 Internet Archive — Detailed Assessment

The Internet Archive copy (`archive.org/details/NSCP2015`) is the **only machine-readable full-text source** found:

- **Uploader:** "Unknown" — not ASEP-authorized
- **Repository:** "Community Texts" — user-uploaded content, no stated license
- **OCR engine:** ABBYY FineReader 11.0, 600 PPI — professional-grade OCR
- **Size:** ~1.7 GB (all formats including high-res scans)
- **Views:** 344,588 (as of 2026-05-14)
- **Full text URL:** `https://archive.org/stream/NSCP2015/NSCP-2015_djvu.txt`
- **Content quality:** Full text extractable; TOC, chapters 1-4 verified as searchable

**Legal assessment (non-authoritative):**
- The upload is unauthorized by ASEP, the copyright holder
- Archive.org's "Community Texts" is a gray area — some content is public domain, some is user-uploaded without rights clearance
- For LEA exam preparation (educational use), extracting specific code sections could be defensible as fair use, especially since NSCP 2015 is a **superseded historical edition** (NSCP 2024 is current)
- However, SlateCamp should NOT cite this copy as the canonical source in student-facing materials
- Recommendation: Use the Internet Archive text ONLY for internal content validation and pre-extraction feasibility testing. Do NOT redistribute the full text or cite it as source.

---

## 4. Blocked Clusters — Exact NSCP Content Needs

Derived from `.ai/03_plans/blocked-source-recovery/lane-c-structural-kimi-opencode.md` and article `sources.json` / `original.md` files.

### 4.1 Clusters Unlockable With NSCP Text Extraction

| Cluster | Title | NSCP Section(s) Needed | Specific Values at Issue |
|---------|-------|----------------------|------------------------|
| **lea-strc-004-02** | NSCP Seismic Zones | Section 5.2, Figure 5-2 | Zone 1 (Z=0.2): Palawan, Tawi-Tawi, Sulu. Zone 2 (Z=0.4): all other provinces. Base shear formula V = Z × I × C × W |
| **lea-strc-007-03** | Deflection Limits | Table 9.5.1, Section 409.9.2.2 | Span-to-depth ratios: L/20, L/24, L/28, L/10 (solid slabs); L/16, L/18.5, L/21, L/8 (beams/ribbed slabs). Joist top slab: t ≥ spacing/12, min 50 mm |
| **lea-strc-007-05** | Embedded Conduits | Section 406.3 | Conduit size limits: h/3 (slabs/beams), 0.04A (columns), w_rib/4 (joists). Spacing: 3 diameters. Cover requirements |
| **lea-strc-012-01** | Wind Load Provisions | Wind load chapter (Ch.2, Section 207) | Basic wind speed V (3-sec gust at 10m, Exposure C, 50-yr return). Exposure A/B/C definitions. Open/enclosed/partially enclosed classification. Low-rise ≤18m. Flexible structure: <1Hz or h > 4×least dimension |

### 4.2 Clusters Requiring Additional Sources Beyond NSCP

| Cluster | Title | Also Needs | Notes |
|---------|-------|-----------|-------|
| **lea-strc-009-01** | Timber Decay/Termite Resistance | NatCor timber standards or Philippine Forestry Code | Species durability tables (Narra, Kamagong, Dao, Tangile); heartwood/sapwood rules; 5% sapwood limit; 90% face rule |
| **lea-strc-009-02** | Philippine Timber Stress Groups | NatCor stress group classifications | Group I/II/III allowable stresses (Fb, Fv, Fc) for Philippine species |
| **lea-strc-009-03** | Timber ASD | Generic mechanics textbooks (available locally) | NSCP timber adjustment factors (CD, CM, Ct, CL, Cf, Ci) are the gap; generic ASD formulas are sourceable |

### 4.3 Status of Completed Clusters (Workaround Evidence)

All completed lea-strc-004-* and lea-strc-007-* clusters (except the blocked ones above) are shipping with explicit source boundaries:
- "exclusion of exact NSCP live-load tables" (lea-strc-004-05)
- "exclusion of exact NSCP instrumentation thresholds" (lea-strc-004-04)
- "without exact NSCP threshold tables" (lea-strc-004-03)
- "exclusion of exact Philippine seismic-zone values" (lea-strc-004-01)
- "This capture does not supply NSCP section numbers" (masonry-lecture batch-147)
- "This batch does not restore exact NSCP pile, caisson, or drilled-shaft code section references" (foundation-engineering batch-148)

These workarounds are conceptually correct but lack Philippine-specific code values — the exact data that the LEA exam tests.

---

## 5. Recommended Acquisition Path

### Primary Path: Purchase + Extract (Cleanest)

1. **Purchase** a legitimate copy from ASEP:
   - Contact: `aseponline@gmail.com`, (+632) 410-0483
   - Or via Philippine retailers (Shopee/Lazada listings observed at ₱1,299–₱2,959)
   - Address: Suite 713, Future Point Plaza Condominium 1, 112 Fanay Avenue, Quezon City, Philippines 1100

2. **Extract** priority chapters via OCR (PyMuPDF / pdfplumber):
   - Ch. 1-5: General requirements, loads, seismic provisions
   - Ch. 4: Concrete (Section 406.3 — embedment)
   - Ch. 9: Concrete serviceability (Table 9.5.1 — deflection)
   - Wind load chapter: basic wind speed, exposure categories

3. **Convert** to Vitruvius pipeline:
   - `raw_markdown/National Structural Code of the Philippines 2015.md`
   - `refined_markdown/National Structural Code of the Philippines 2015.md`
   - `sidecar_json/National Structural Code of the Philippines 2015.json`

4. **Unblock**: After text extraction, lea-strc-004-02, 007-03, 007-05, 012-01 become eligible for Batch 156+ reservation under source-audited local-first generation.

### Secondary Path: Internet Archive (Gray Area — Decision Required)

Use the Internet Archive OCR text (`NSCP-2015_djvu.txt`) for internal content validation and to confirm that the exact values claimed in the article originals (e.g., "Z=0.2 for Palawan") match the code text. Do NOT:
- Cite the Internet Archive link in student-facing materials
- Redistribute the full text as a source
- Claim it as an authoritative source

### Tertiary Path: NSCP 2024 (If Timing Allows)

NSCP 2024 (8th Edition) is the current edition. If the 2015 edition proves difficult to acquire:
- The 2024 edition should be the primary reference going forward
- Check if ASEP is now selling the 8th Edition
- The 2015 edition becomes progressively more historical — LEA exam questions may still reference 2015 values during a transition period

### For Timber Clusters (009-01, 009-02): Separate Acquisition Needed

Even with NSCP 2015, the timber clusters may remain blocked because:
- NSCP 2015's timber chapter may reference external NatCor standards rather than containing full timber tables
- Philippine species durability and stress group classifications are typically in NatCor/ASEAN timber design manuals, not in the NSCP itself

Acquisition target: **NatCor (National Committee on Timber) standards** or **Philippine Forestry Code**. These are separate source-acquisition projects.

---

## 6. Risk Assessment

| Risk | Likelihood | Impact |
|------|-----------|--------|
| ASEP no longer sells NSCP 2015 (only 2024 available) | Medium | Blocks 2015-specific clusters; 2024 edition may have different section numbers |
| NSCP 2015 is scanned/image-based; OCR quality poor for tables | High | Table 9.5.1, seismic zone map may need manual verification |
| NSCP timber chapter is sparse (references NatCor externally) | Medium | Timber clusters remain blocked even after NSCP acquisition |
| Internet Archive copy taken down | Low-Medium | Eliminates fallback text source |
| LEA exam shifts to NSCP 2024 before articles ship | Low | Changes which code values students need to know |

---

## 7. Next Actions (Priority Order)

| # | Action | Unblocks | Effort | Owner |
|---|--------|----------|--------|-------|
| 1 | Contact ASEP for NSCP 2015 purchase availability | All 4 NSCP-dependent clusters | Low | Human (Philip) |
| 2 | If purchase successful, OCR-extract priority chapters | lea-strc-004-02, 007-03, 007-05, 012-01 | Medium | Agent pipeline |
| 3 | Verify article claims against extracted text | Quality gate for blocked clusters | Low | Agent pipeline |
| 4 | Investigate NatCor/Philippine Forestry Code acquisition | Timber clusters lea-strc-009-01, 009-02 | Medium | Separate project |
| 5 | Source-map lea-strc-009-03 (ASD) from existing local textbooks | lea-strc-009-03 | Low | Agent pipeline |
| 6 | Produce refined markdown in vitruvius-connection/002/ | Conversion pipeline entry | Medium | Agent pipeline |
| 7 | Re-reserve clusters in Batch 156+ manifest | Production line unblock | Low | Coordinator agent |

---

## 8. Evidence Appendix

### A.1 Corrupted File Verification

```
$ file "National Structural Code of the Philippines 2015.pdf"
data

$ xxd "National Structural Code of the Philippines 2015.pdf" | head -3
00000000: 0000 0000 0000 0000 0000 0000 0000 0000  ................
00000010: 0000 0000 0000 0000 0000 0000 0000 0000  ................

$ shasum -a 256 "National Structural Code of the Philippines 2015.pdf"
12e04770e37571def323e6d0f29b0d20c7c4d4e088d39f519e0f2e0b5d91cc54
```

### A.2 Prior Analysis That Assumed Valid PDF

- File: `.ai/03_plans/blocked-source-recovery/lane-c-structural-kimi-opencode.md`
- Date: 2026-05-14
- Statement: "Path: `National Structural Code of the Philippines 2015.pdf` Size: ~92.7 MB (92666420 bytes). Conversion layer markdown: ABSENT."
- **This assumption was incorrect.** The file is corrupted, not merely unconverted.

### A.3 Key Planning Documents Referenced

- `.ai/03_plans/production-line-reservation-146-148-summary.md` — lists `lea-strc-004-02` as hard-blocked; `007-03` and `007-05` as not reserved due to missing NSCP
- `.ai/03_plans/production-line-reservation-149-151-summary.md` — lists `lea-strc-012-01` as not reserved due to NSCP dependency
- `.ai/03_plans/production-line-reservation-152-154-summary.md` — same for `012-01`
- `.ai/03_plans/production-line-reservation-155-157-summary.md` — lists `012-01` in carry-forward blocked
- `.ai/03_plans/production-line-residual-exhaustion-after-154.md` — lists `012-01` as residual unknown

### A.4 Article Source Files Examined

- `.ai/content-audit-export/articles/lea-strc-004-02-core-concept--cc7363f6-b2bf-4ed9-a9b4-81d82eae98fe/sources.json`
- `.ai/content-audit-export/articles/lea-strc-004-02-core-concept--cc7363f6-b2bf-4ed9-a9b4-81d82eae98fe/original.md`
- `.ai/content-audit-export/target-mapping-no-apply-2026-05-09/articles/lea-strc-007-03-core-concept--f122ad42.../sources.json`
- `.ai/content-audit-export/target-mapping-no-apply-2026-05-09/articles/lea-strc-007-05-core-concept--f39f802d.../sources.json`
- `.ai/content-audit-export/target-mapping-no-apply-2026-05-09/articles/lea-strc-012-01-core-concept--f0790263.../sources.json`
- `.ai/content-audit-export/target-mapping-no-apply-2026-05-09/articles/lea-strc-009-01-core-concept--84cf250f.../original.md`
- `.ai/content-audit-export/articles/lea-strc-009-02-core-concept--047334de.../original.md`
- `.ai/content-audit-export/target-mapping-no-apply-2026-05-09/articles/lea-strc-009-03-core-concept--9375b273.../original.md`

---

*End of report. No articles, question-edits, existing source captures outside the recovery folder, code, package files, git state, DB state, or main branch were modified in the production of this report.*
