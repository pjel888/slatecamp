# Lane C: Structural Deferred Clusters — Blocked-Source Recovery Analysis

**Agent:** Kimi / OpenCode Go (Sisyphus)
**Date:** 2026-05-14
**Scope:** 7 structural content clusters deferred in Batch 155 reservation manifest
**Write target:** `.ai/03_plans/blocked-source-recovery/lane-c-structural-kimi-opencode.md`
**Constraint:** Read-only analysis; zero edits to articles, sources, code, git, DB, or main.

---

## 1. Executive Summary

All 7 deferred structural clusters share a single root cause: **dependency on NSCP 2015 provisions** (seismic zones, deflection tables, conduit embedment rules, wind load chapters) that are present in the raw source layer as an **unconverted PDF**, plus **two timber clusters** that require Philippine timber design standards (NatCor/ASEAN) with no local source captured.

| Cluster | Topic | Verdict | Reopen after Batch 155? |
|---------|-------|---------|------------------------|
| lea-strc-004-02 | NSCP seismic zones (Z=0.2/0.4) | **READY_IF_CAPTURED_FROM_LOCAL_PDF** | Yes, if NSCP PDF is converted/extracted |
| lea-strc-007-03 | Deflection limits (NSCP Table 9.5.1) | **READY_IF_CAPTURED_FROM_LOCAL_PDF** | Yes, same blocker |
| lea-strc-007-05 | Embedded conduits (NSCP 406.3) | **READY_IF_CAPTURED_FROM_LOCAL_PDF** | Yes, same blocker |
| lea-strc-009-01 | Timber decay/termite resistance | **STILL_BLOCKED** | No — needs NatCor/NSCP timber chapter capture |
| lea-strc-009-02 | Philippine timber stress groups | **STILL_BLOCKED** | No — needs timber design manual/NSCP timber tables |
| lea-strc-009-03 | Timber ASD (fb=M/S, fv=3V/2A) | **READY_WITH_LOCAL_SOURCES** | Yes — generic mechanics textbooks cover the math |
| lea-strc-012-01 | Wind load provisions (V, Exposure A/B/C) | **READY_IF_CAPTURED_FROM_LOCAL_PDF** | Yes, if NSCP PDF is converted/extracted |

---

## 2. Critical Local Source Discovery

### 2.1 NSCP 2015 PDF — Present but Unconverted

**Path:** `vitruvius-connection/001_Raw-Source-Layer/006 -Structural/National Structural Code of the Philippines 2015.pdf`
**Size:** ~92.7 MB (92666420 bytes)
**SHA256:** *not yet computed*
**Conversion layer markdown:** **ABSENT** — no `raw_markdown/`, `refined_markdown/`, or `sidecar_json/` entry found for this file.
**Impact:** This single PDF unlocks 4 of the 7 deferred clusters. The Batch 155 reservation manifest did not recognize it as a capturable source because it lacks a searchable conversion.

**Action required to unblock:**
1. Run PyMuPDF / pdfplumber extraction on the NSCP 2015 PDF.
2. Produce `vitruvius-connection/002_Raw-Conversion-Layer/006 -Structural/raw_markdown/National Structural Code of the Philippines 2015.md`
3. Run the standard refinement pipeline to generate `.refined.md` and `.refined.json`
4. Re-run source-mapping for lea-strc-004-02, 007-03, 007-05, 012-01 against the converted text.

**Risk:** NSCP 2015 is a large scanned/technical document; OCR quality may be poor for tables. Table extraction (Table 9.5.1, seismic zone maps, wind speed contours) may require manual verification or specialized table-OCR.

### 2.2 Generic Structural Textbooks — Already Converted

These exist in `002_Raw-Conversion-Layer/006 -Structural/refined_markdown/` and can support conceptual framing:

- `Applied Strength of Materials.md` / `.refined.json`
- `Fundamentals of Structural Engineering.md` / `.refined.json`
- `Fundamentals of Structural Analysis 3E Solutions Manual.md`
- `Engineering Mechanics Statics *` (multiple editions, Hibbeler, Bedford, Riley, etc.)
- `Dynamics of Structures: Theory and applications to earthquake engineering.md` (used in Batch 143 for lea-strc-004-01)
- `Building Structures Illustrated.md` / `Building Construction Illustrated.md` (used in Batch 143)

**Limitation:** These are U.S./international textbooks. They do **not** contain Philippine-specific code values (Z=0.2/0.4, NSCP Table 9.5.1 exact ratios, Philippine timber species tables). They can support *methodology* and *formula derivation* but not *code-specific exam answers*.

---

## 3. Per-Cluster Deep Dive

### 3.1 lea-strc-004-02 — NSCP Seismic Zones

- **Article ID:** cc7363f6-b2bf-4ed9-a9b4-81d82eae98fe
- **Title:** "NSCP 2015 divides the Philippines into two seismic"
- **Block reason:** `normalized.md missing` (target-mapping-no-apply export)
- **Source dependency:** NSCP 2015 seismic zone map and Z-factor table (Zone 1: Z=0.2 for Palawan/Tawi-Tawi/Sulu; Zone 2: Z=0.4 for all others).
- **Local source found:** `National Structural Code of the Philippines 2015.pdf` (raw, unconverted)
- **Local source NOT found:** No refined markdown; no source-map-batch file for this cluster.
- **Safe claim boundary without NSCP conversion:** Cannot verify exact province lists or Z values. Generic earthquake engineering principles (ground motion, base shear formula V=ZICW) are available from `Dynamics of Structures` but the *specific Philippine zone assignments* are not.
- **Verdict:** **READY_IF_CAPTURED_FROM_LOCAL_PDF** — unblock immediately upon NSCP 2015 PDF conversion + table extraction.

### 3.2 lea-strc-007-03 — Deflection Limits

- **Article ID:** f122ad42-0858-4bb6-ac19-6a788bac4c43
- **Title:** "Deflection limits are based"
- **Block reason:** `normalized.md missing`
- **Source dependency:** NSCP 2015 Table 9.5.1 (span-to-depth ratios: L/20, L/24, L/28, L/10 for solid slabs; L/16, L/18.5, L/21, L/8 for beams/ribbed slabs). Also Section 409.9.2.2 (joist top slab thickness t ≥ spacing/12, min 50 mm).
- **Local source found:** Same NSCP 2015 PDF.
- **Local source NOT found:** No refined markdown. No source-map-batch file.
- **Safe claim boundary without NSCP conversion:** Generic deflection theory (elastic beam theory, moment of inertia, section modulus) is abundant in local textbooks. The *NSCP-specific minimum thickness ratios* (L/20 vs L/16 distinction between slab and beam) cannot be verified.
- **Verdict:** **READY_IF_CAPTURED_FROM_LOCAL_PDF** — unblock upon NSCP 2015 PDF conversion.

### 3.3 lea-strc-007-05 — Embedded Conduits

- **Article ID:** f39f802d-ddcb-4fd5-b9cd-bb1c6e0e8ef3
- **Title:** "Embedded conduits—electrical, HVAC, plumbing ducts"
- **Block reason:** `normalized.md missing`
- **Source dependency:** NSCP 2015 Section 406.3 (conduit size limits: h/3 for slabs/beams, 0.04A for columns, w_rib/4 for joists; spacing 3 diameters; cover requirements).
- **Local source found:** Same NSCP 2015 PDF.
- **Local source NOT found:** No refined markdown. No source-map-batch file.
- **Safe claim boundary without NSCP conversion:** General concrete construction principles (conduit weakens section, need spacing, cover rules) are in `Building Construction Illustrated`. The *exact NSCP fractions* (1/3, 4%, 3 diameters) and *reinforcement compensation ratios* cannot be verified.
- **Verdict:** **READY_IF_CAPTURED_FROM_LOCAL_PDF** — unblock upon NSCP 2015 PDF conversion.

### 3.4 lea-strc-009-01 — Timber Decay and Termite Resistance

- **Article ID:** 84cf250f-9168-4bba-9b7a-55dd370f1c31
- **Title:** "Decay and termite resistance in timber"
- **Block reason:** `normalized.md missing`
- **Source dependency:** NatCor timber standards or NSCP 2015 timber chapter for Philippine species durability classification (Narra, Kamagong, Dao, Tangile resistance tables; heartwood/sapwood acceptance rules; 5% sapwood limit; 90% face rule).
- **Local source found:** None. No timber design manual or NatCor standard in `001_Raw-Source-Layer/006 -Structural/`.
- **Local source NOT found:** No Philippine Forestry Code PDF. No ASEAN timber standard. No NSCP timber chapter extracted.
- **Safe claim boundary:** The article already contains specific species claims (Narra/Kamagong = both; Dao/Tangile = decay only; 5% sapwood limit; 90% face rule). These are **highly specific** and **not corroborated** by any local source currently in Vitruvius. The generic structural textbooks do not cover Philippine timber species.
- **Verdict:** **STILL_BLOCKED** — requires capture of NatCor standard, NSCP 2015 timber chapter, or Philippine Forestry Code. Not reopenable after Batch 155 without new source acquisition.

### 3.5 lea-strc-009-02 — Philippine Timber Stress Groups

- **Article ID:** 047334de-c79a-4d6a-aa23-58a321b71e2e
- **Title:** "Philippine timber stress groups rank species by bending"
- **Block reason:** Unresolved placeholders ui_0001–ui_0005 (compose-error.json); parser_status: passed; normalized.md exists.
- **Source dependency:** NSCP timber stress tables or NatCor stress group classifications for Philippine species (Group I/II/III allowable stresses: Fb, Fv, Fc).
- **Local source found:** None for Philippine-specific timber tables. Generic mechanics textbooks cover stress formulas but not species-specific allowable stresses.
- **Local source NOT found:** No NatCor or NSCP timber chapter conversion.
- **Safe claim boundary:** The article references "Narra Group II" (Fb=12 MPa, Fv=1.2 MPa) and "Group I/II/III" classifications. These values cannot be verified against any local source.
- **Verdict:** **STILL_BLOCKED** — needs NSCP timber chapter or NatCor capture. The placeholder issue is secondary to the source gap.

### 3.6 lea-strc-009-03 — Timber ASD

- **Article ID:** 9375b273-4d0d-4ce2-8a7c-991b7e3d4a8c
- **Title:** "Allowable Stress Design (ASD)"
- **Block reason:** `normalized.md missing`
- **Source dependency:** ASD methodology (fb = M/S, fv = 3V/2A, S = bh²/6, I = bh³/12) and adjustment factors (CD, CM, Ct, etc.).
- **Local source found:** **YES** — multiple local textbooks cover these formulas in depth:
  - `Applied Strength of Materials.md`
  - `Fundamentals of Structural Engineering.md`
  - `Engineering Mechanics Statics` (multiple editions)
  - `Mechanics and Strength of Materials.md`
- **Local source NOT found:** NSCP timber adjustment factor tables (CD load duration, CM wet service, Ct temperature, CL beam stability, Cf form factor, Ci incising). The *generic formulas* are sourceable; the *timber-specific adjustment factors* are not.
- **Safe claim boundary:** The article can be rewritten around **generic ASD mechanics** using local textbooks, with a clear boundary: state that adjustment factors are "per NSCP/NatCor tables" without enumerating exact values. The worked examples (bending stress check, shear stress check, section modulus calculation) are fully derivable from local mechanics sources.
- **Verdict:** **READY_WITH_LOCAL_SOURCES** — can proceed using existing structural mechanics textbooks, provided claims are bounded to generic formulas and adjustment factors are referenced rather than specified.

### 3.7 lea-strc-012-01 — Wind Load Provisions

- **Article ID:** f0790263-a20b-4d36-bebb-05474566cbce
- **Title:** "Wind load provisions"
- **Block reason:** `normalized.md missing`
- **Source dependency:** NSCP 2015 wind load chapter (basic wind speed V, 3-sec gust at 10m, Exposure C, 50-year return period, Exposure A/B/C definitions, open/enclosed/partially enclosed classifications, low-rise ≤18m, flexible structure <1Hz or h>4×least dimension).
- **Local source found:** Same NSCP 2015 PDF.
- **Local source NOT found:** No refined markdown. No source-map-batch file.
- **Safe claim boundary without NSCP conversion:** General wind engineering concepts (basic wind speed, exposure categories, building classifications) appear in `Fundamentals of Structural Engineering` and `Building Structures Illustrated`. However, the *Philippine-specific basic wind speed values*, *exact exposure definitions*, and *NSCP low-rise/flexibility thresholds* cannot be verified.
- **Verdict:** **READY_IF_CAPTURED_FROM_LOCAL_PDF** — unblock upon NSCP 2015 PDF conversion.

---

## 4. Proposed Raw/Refined Capture Paths

### Path A: NSCP 2015 PDF Conversion (Unlocks 4 clusters)

```
Source: vitruvius-connection/001_Raw-Source-Layer/006 -Structural/National Structural Code of the Philippines 2015.pdf
Target raw: vitruvius-connection/002_Raw-Conversion-Layer/006 -Structural/raw_markdown/National Structural Code of the Philippines 2015.md
Target refined: vitruvius-connection/002_Raw-Conversion-Layer/006 -Structural/refined_markdown/National Structural Code of the Philippines 2015.md
Target sidecar: vitruvius-connection/002_Raw-Conversion-Layer/006 -Structural/sidecar_json/National Structural Code of the Philippines 2015.json
```

**Recommended extraction priority (chapters/sections):**
1. Seismic provisions (for lea-strc-004-02): seismic zone map, Z factors, base shear formula
2. Concrete deflection/serviceability (for lea-strc-007-03): Table 9.5.1, Section 409.9.2.2
3. Concrete embedment (for lea-strc-007-05): Section 406.3
4. Wind load (for lea-strc-012-01): basic wind speed, exposure categories, building classifications
5. Timber design (for lea-strc-009-01/02): species tables, stress groups, adjustment factors

### Path B: Generic Mechanics Textbooks (Unlocks lea-strc-009-03)

Use existing refined sources:
- `Applied Strength of Materials.refined.md`
- `Fundamentals of Structural Engineering.refined.md`
- `Engineering Mechanics Statics *` (multiple editions)

Produce source-map for lea-strc-009-03 referencing these for generic ASD formulas.

### Path C: Web Capture (For timber clusters if local fails)

**Authoritative candidates:**
- **ASEP (Association of Structural Engineers of the Philippines):** https://asep.ph/ — may publish NSCP errata or summaries. Not guaranteed to have full timber tables.
- **DPWH:** https://www.dpwh.gov.ph/ — may have building code references or downloadable IRR supplements.
- **NSCP 2015 itself:** If the local PDF extraction fails, a searchable digital edition may exist through ASEP or academic libraries. **Caution:** copyright-protected; capture only publicly accessible excerpts.
- **Wikipedia:** Acceptable only as citation trail for general concepts (ASD, wind engineering, seismic zones). **Not** authoritative for exact code values.

---

## 5. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| NSCP 2015 PDF is scanned/image-based; OCR produces garbled tables | High | Blocks 4 clusters | Use specialized table-OCR (camelot, tabula-py) or manual table extraction |
| NSCP 2015 timber chapter is sparse or refers to external NatCor standard | Medium | Blocks 2 timber clusters even after NSCP conversion | Plan secondary source capture for NatCor or Philippine Forestry Code |
| Batch 155 reservation constraints prohibit source-folder edits | Low | Delays NSCP conversion | The reservation manifest constraints apply to Batch 155 production, not to source-layer maintenance; confirm with Philip before editing source layer |
| lea-strc-009-02 placeholder blockers mask deeper source issues | Medium | Time wasted on UI fixes while source remains missing | Prioritize source capture over placeholder resolution |

---

## 6. Recommendation

1. **Immediate:** Convert/extract the NSCP 2015 PDF. This is the highest-yield unblocking action (4 clusters).
2. **Parallel:** Produce a source-map for lea-strc-009-03 using existing mechanics textbooks; this cluster can be reopened immediately.
3. **Secondary:** Investigate NatCor or Philippine timber design manual acquisition for lea-strc-009-01 and 009-02. These two clusters should remain deferred until a timber-specific source is captured.
4. **After Batch 155:** Once NSCP 2015 is converted, re-run source-audited local-first generation for lea-strc-004-02, 007-03, 007-05, and 012-01. They should be eligible for Batch 156+ reservation.

---

## 7. Evidence Appendix

### A.1 Batch 155 Reservation Manifest Reference
- **File:** `.ai/03_plans/production-line-batch-155-reservation-manifest.json`
- **Lines 29-44:** `hard_blocked_not_reserved` includes `lea-strc-004-02`; `known_deferrals_not_reserved` includes `lea-strc-007-03`, `007-05`, `009-01`, `009-02`, `009-03`, `012-01`.
- **Lines 169-186:** Residual inventory confirms these clusters remain after Batch 155.

### A.2 NSCP 2015 PDF Evidence
- **File:** `vitruvius-connection/001_Raw-Source-Layer/006 -Structural/National Structural Code of the Philippines 2015.pdf`
- **Size:** 92,666,420 bytes
- **Confirmed by:** `ls -la` and `find` in Section 2.1

### A.3 Missing Conversion Evidence
- **Search:** `glob` for `vitruvius-connection/002_Raw-Conversion-Layer/**/National*Structural*` returned **0 files**.
- **Search:** `grep` for `NSCP|National Structural Code` in `002_Raw-Conversion-Layer/006 -Structural` returned references in *sidecar metadata* and *other source-captures* but **no dedicated markdown conversion** of the NSCP 2015 PDF itself.

### A.4 Existing Structural Textbook Conversions
- **Path:** `vitruvius-connection/002_Raw-Conversion-Layer/006 -Structural/refined_markdown/`
- **Files confirmed present:** `Applied Strength of Materials.refined.md`, `Fundamentals of Structural Engineering.refined.md`, `Engineering Mechanics Statics 14th Edition by Russell C. Hibbeler.md`, `Mechanics and Strength of Materials.md`, and 30+ others.

### A.5 Article Original Content Paths
- lea-strc-004-02: `.ai/content-audit-export/target-mapping-no-apply-2026-05-09/articles/lea-strc-004-02-core-concept--cc7363f6-b2bf-4ed9-a9b4-81d82eae98fe/original.md`
- lea-strc-007-03: `.ai/content-audit-export/target-mapping-no-apply-2026-05-09/articles/lea-strc-007-03-core-concept--f122ad42-0858-4bb6-ac19-6a788bac4c43/original.md`
- lea-strc-007-05: `.ai/content-audit-export/target-mapping-no-apply-2026-05-09/articles/lea-strc-007-05-core-concept--f39f802d-ddcb-4fd5-b9cd-bb1c6e0e8ef3/original.md`
- lea-strc-009-01: `.ai/content-audit-export/target-mapping-no-apply-2026-05-09/articles/lea-strc-009-01-core-concept--84cf250f-9168-4bba-9b7a-55dd370f1c31/original.md`
- lea-strc-009-02: `.ai/content-audit-export/articles/lea-strc-009-02-core-concept--047334de-c79a-4d6a-aa23-58a321b71e2e/original.md`
- lea-strc-009-03: `.ai/content-audit-export/target-mapping-no-apply-2026-05-09/articles/lea-strc-009-03-core-concept--9375b273-4d0d-4ce2-8a7c-991b7e3d4a8c/original.md`
- lea-strc-012-01: `.ai/content-audit-export/target-mapping-no-apply-2026-05-09/articles/lea-strc-012-01-core-concept--f0790263-a20b-4d36-bebb-05474566cbce/original.md`

---

*End of report. No files, articles, sources, code, git state, DB state, or main branch were modified in the production of this analysis.*
