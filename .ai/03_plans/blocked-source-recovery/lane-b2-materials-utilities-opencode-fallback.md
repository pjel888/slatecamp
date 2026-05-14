# Lane B2 — Blocked-Source Recovery: Materials/Utilities Clusters

**Report:** `lane-b2-materials-utilities-opencode-fallback.md`
**Generated:** 2026-05-14
**Repo:** /Users/philiplewis/slatecamp
**Scope:** lea-matl-009-02, lea-util-004-05, lea-util-004-08
**Role:** Read-only investigation. No edits to article folders, source folders, code, git, Supabase, deploy, DB, or main.

---

## 1. Executive Summary

| Cluster | Topic | Verdict | Can Reopen After Batch 155? |
|---------|-------|---------|---------------------------|
| `lea-matl-009-02` | CSI MasterFormat specification system | **READY_IF_CAPTURED_FROM_WEB** | Yes, if CSI publisher page captured |
| `lea-util-004-05` | Seismic bracing and earthquake resilience (MEPF) | **READY_IF_CAPTURED_FROM_LOCAL_PDF** | Yes, same NSCP 2015 PDF blocker as Lane C |
| `lea-util-004-08` | Seismic bracing requirements per NSCP 2015 | **READY_IF_CAPTURED_FROM_LOCAL_PDF** | Yes, same NSCP 2015 PDF blocker |

All three clusters are hard-blocked in the Batch 155 reservation manifest (`production-line-batch-155-reservation-manifest.json`, lines 32-34). Two of three (util-004-05, util-004-08) share the same root cause as Lane C's structural clusters: the unconverted NSCP 2015 PDF. The third (matl-009-02) requires web capture of CSI MasterFormat reference material that does not exist locally in any source layer.

---

## 2. Cluster Details

### 2.1 lea-matl-009-02 — CSI MasterFormat

**Article ID:** `0ed94cf5-6a2b-4062-8e8b-4f514ca89be5`
**Title:** "CSI MasterFormat"
**Subject:** Building Materials and Construction Methods
**Status:** published, 4 sources, 10 linked questions
**Block reason:** 6 unresolved placeholders (compose-error.json), AND hard-blocked (no local sources for CSI/MasterFormat)
**Parser status:** passed; content_complexity: plain_markdown

**What the article covers:**
- CSI MasterFormat 50-division structure (00-49)
- Core construction divisions (03 Concrete, 04 Masonry, 05 Metals, 06 Wood, 07 Thermal & Moisture Protection, 08 Openings, 09 Finishes)
- 3-part specification format: Part 1 General, Part 2 Products, Part 3 Execution
- Philippine adaptation: DPWH Standard Specifications vs CSI format
- Tropical climate customization (waterproofing, mold resistance, termite protection)
- 4 LEA question patterns: Division Identification, 3-Part Format Application, Cross-Division Coordination, Philippine Adaptation

**Why it's blocked:** The vitruvius-connection source layers (001_Raw-Source-Layer, 002_Raw-Conversion-Layer, 003_Canonical-Knowledge-Layer) contain Philippine laws, codes, IRRs, technical textbooks, and lecture notes — but **no CSI/MasterFormat documentation**. CSI MasterFormat is a US proprietary standard published by the Construction Specifications Institute. It does not exist as a free public document. The article currently has 4 unverified sources.

**Why it can be recovered:** The basic MasterFormat division structure (numbers and titles) is publicly referenceable from CSI's official publisher page and widely cross-referenced in construction industry standards (WBDG, DesignGuide). The article's claims are primarily about navigation/structure and Philippine adaptation — not proprietary section-level details. A CSI publisher page capture plus authoritative industry cross-references would suffice.

---

### 2.2 lea-util-004-05 — Seismic Bracing and Earthquake Resilience

**Article ID:** `1caee82f-c2c8-409b-a3bf-41576bc702c5`
**Title:** "Seismic bracing and earthquake resilience"
**Subject:** Building Utilities MEPF
**Status:** published, **sources.json EMPTY** (MISSING_CITATION - HIGH per fact-checking flag #150)
**Linked questions:** 10
**Normalized content:** 191 lines — broad MEPF disaster resilience article

**What the article covers (beyond seismic bracing):**
- Seismic demand levels, SDC D+, NSCP 2015 design spectra (0.4g horizontal, 0.2-0.3g vertical)
- Seismic force formula: Fp = (0.4 × ap × SDS × Wp × Ip)/Rp
- Piping flex couplings at seismic isolation joints
- **Wind-resistant design for typhoons** (NSCP Sections 26-27, BVS = 250 km/h, design wind pressure = 0.613 × V² × (I × Cf))
- **Flood protection** (RA 10121 zoning, design flood elevation, sump/drainage systems)
- **Emergency lighting** (PD 1096 Rule VIII Sec 811: 1 fc minimum, 90-min battery)
- **Exit signage** (30 m visibility, letter height 4.23 mm/ft)
- **Smoke control** (NSCP Section 909: stairwell pressurization 25-50 Pa)
- **Emergency communication** (PA systems, IEC 60268-16 intelligibility ≥ 0.70)
- **Emergency power** (NSCP Section 1205, auto-transfer ≤ 0.15 seconds, 72-hour autonomy for critical facilities)
- **System resilience** (water supply redundancy, microgrid, satellite comms)

**Why it's blocked:** No sources cited at all. The article makes claims referencing NSCP 2015, PD 1096, RA 10121, RA 9514, IEC 60268-16, and ASTM F1554 — none of which have associated verified source records. The primary blocker is the **unconverted NSCP 2015 PDF** in `vitruvius-connection/001_Raw-Source-Layer/006 -Structural/National Structural Code of the Philippines 2015.pdf` (same 92.7 MB PDF as in Lane C structural clusters).

**Why it can be recovered:** The NSCP 2015 PDF conversion would unlock most of the seismic/wind/emergency power claims. PD 1096 RIRR, RA 9266 IRR, and UAP SPP documents already exist as refined markdown in the conversion layer (verified in Batch 155 reservation manifest for adjacent clusters). RA 10121 and RA 9514 may exist in the 001-Laws directory. FEMA P-414 provides authoritative supplementary guidance on duct/pipe seismic restraints.

---

### 2.3 lea-util-004-08 — Seismic Bracing Requirements per NSCP 2015

**Article ID:** `585425ad-355a-4180-b64b-a872115f39f6`
**Title:** "Seismic bracing requirements per NSCP 2015"
**Subject:** Building Utilities MEPF
**Status:** published, **sources.json EMPTY** (MISSING_CITATION - HIGH per fact-checking flag #183)
**Linked questions:** 10
**Normalized content:** 471 lines — extremely detailed, code-specific

**What the article covers (highly specific claims):**
- NSCP 2015 Section 208 SDC A-F assignment table (Zone 1-4 by occupancy)
- Seismic force formula: Fp = (0.4 ap SDS Wp Ip)/Rp with worked example (5-ton chiller)
- Component amplification factor ap = 1.0-2.5 per NSCP Table 1307.4.1
- Component importance factor Ip = 1.0-2.0 per NSCP Table 1307.3.1
- Equipment weight thresholds (100 kg for mechanical equipment anchorage)
- Bracing hardware: M16 Grade 8.8 anchor bolts, 4:1 safety factor for cable restraints
- Seismic joints: ±200 mm total movement, flexible metallic hose per ASME B16.39
- Flexible connections: ±100 mm minimum travel, 150 mm fabric connectors
- Elevator seismic switches: 0.15g activation threshold, ≤1 second response per ASME A17.1
- Automatic gas shutoff: 0.5g inertial, <1 second closure
- Sprinkler seismic protection: 3 m support intervals, gravity tank sizing
- Water heater strapping: two stainless bands, maximum 600 mm spacing
- Generator auto-start sequence per ISO 3006, IEC 62310-3
- Specific Philippine fault data: Philippine Fault (M 6.5-7.5, 400-year recurrence), West Valley Fault (M 6.8-7.2), Marikina Valley Fault (M 7.0-7.3, 180-year recurrence) — citing PHIVOLCS Open File Report 2008-001 and PHIVOLCS 2017
- Specific historical earthquakes: 1990 Luzon (M 7.7), 2012 Negros (M 6.8), 2019 Davao (M 6.3)
- Detailed post-earthquake inspection protocol (4 phases: 0-5 min, 5-30 min, 30 min-2 hr, 2-6 hr)

**Why it's blocked:** Same root cause as util-004-05 — no verified source records. But the **specificity is much higher** — the article cites exact NSCP table numbers (1307.4.1, 1307.3.1, 1307.4.2), PHIVOLCS report IDs, ASME standard numbers, and earthquake magnitudes with exact recurrence intervals. These require NSCP 2015 text extraction to verify.

**Why it can be recovered:** The NSCP 2015 **full text** is available on Internet Archive at `https://archive.org/stream/NSCP2015/NSCP-2015_djvu.txt`. The local NSCP PDF exists at `vitruvius-connection/001_Raw-Source-Layer/006 -Structural/National Structural Code of the Philippines 2015.pdf`. FEMA P-414 supports the installation methodology claims. PHIVOLCS earthquake data is publicly available.

---

## 3. Local Source Files Found

### 3.1 For lea-matl-009-02 (CSI MasterFormat)

**vitruvius-connection/ status:** NO CSI/MasterFormat source files found in any layer.

| Layer | Searched | Result |
|-------|----------|--------|
| `001_Raw-Source-Layer/004-Technology/` | All 49 entries (PDFs, source-map-batch dirs) | No CSI/MasterFormat documents |
| `002_Raw-Conversion-Layer/004-Technology/refined_markdown/` | All 89 entries | No CSI/MasterFormat references |
| `003_Canonical-Knowledge-Layer/009-Practice/` | index.md, log.md only | No synthesized CSI content |

**Adjacent cluster sources (matl-009-03, matl-009-04) use:** RA 9266 IRR, PD 1096 RIRR, UAP SPP 203, Design Process — none cover CSI/MasterFormat.

### 3.2 For lea-util-004-05 and lea-util-004-08 (Seismic Bracing)

**Critical local source — PRESENT but UNCONVERTED:**

| File | Path | Size | Status |
|------|------|------|--------|
| NSCP 2015 PDF | `vitruvius-connection/001_Raw-Source-Layer/006 -Structural/National Structural Code of the Philippines 2015.pdf` | 92.7 MB | RAW ONLY — no refined markdown conversion exists |

**Conversion layer gap confirmed:** No `raw_markdown/`, `refined_markdown/`, or `sidecar_json/` entry for NSCP 2015 in `002_Raw-Conversion-Layer/006 -Structural/`.

**Supplementary local sources (already converted — support general MEPF knowledge):**

| File | Path | Relevance |
|------|------|-----------|
| George Salvan Architectural Utilities 1 (Plumbing) | `002_Raw-Conversion-Layer/005-Utilities/refined_markdown/` | Plumbing seismic provisions |
| George Salvan Architectural Utilities 2 (Electrical/Mechanical) | `002_Raw-Conversion-Layer/005-Utilities/refined_markdown/` | Electrical/mechanical seismic provisions |
| Mechanical and Electrical Equipment for Buildings (Grondzik, Wiley 2010) | `002_Raw-Conversion-Layer/005-Utilities/refined_markdown/` | MEP seismic/wind general principles |
| National Plumbing Code of the Philippines | `002_Raw-Conversion-Layer/005-Utilities/refined_markdown/` | Plumbing code references |
| Phil Electrical Code | `002_Raw-Conversion-Layer/005-Utilities/refined_markdown/` | Electrical code references |
| PD 1096 RIRR 2004 | `002_Raw-Conversion-Layer/001-Laws/refined_markdown/PD-1096/` | Emergency lighting, exit requirements |
| RA 9266 IRR | `002_Raw-Conversion-Layer/001-Laws/refined_markdown/RA-9266/` | Professional practice context |

**Fire code presence:** RA 9514 (Fire Code of the Philippines) — path not verified but likely exists in `001_Raw-Source-Layer/001-Laws/` since it's referenced in Lane A's recovery report. If present, it would support the sprinkler and smoke control claims.

**No local sources found for:**
- FEMA 412/413/414 (seismic restraint guides)
- ASHRAE seismic bracing standards
- SMACNA duct construction standards
- ASME B16.39 (flexible couplings), ASME B31.1 (power piping), ASME A17.1 (elevators)
- PHIVOLCS fault data (no local PDF of PHIVOLCS Open File Report 2008-001)

---

## 4. Authoritative Web Sources Identified

### 4.1 For lea-matl-009-02 (CSI MasterFormat)

#### Primary authoritative source
- **CSI MasterFormat 2020 Edition — Publisher Page**
  - URL: `https://www.csiresources.org/standards/masterformat`
  - Publisher: Construction Specifications Institute (CSI) and Construction Specifications Canada (CSC)
  - ISBN: 978-1-7349654-2-1 (2020 edition, 700 pages)
  - **Claims supported:** 50-division structure (00-49), division number assignments, 3-part format standard, MasterFormat as the industry standard for organizing construction specifications
  - **Risk:** Full standard is proprietary/paid ($). The publisher page and publicly available division-level numbers/titles summaries are sufficient for LEA-level claims (which test structure/navigation, not proprietary section details).

#### Supplementary authoritative references
- **Whole Building Design Guide (WBDG) — MasterFormat reference:**
  - URL: `https://www.wbdg.org/design-disciplines/specifications`
  - WBDG is maintained by the National Institute of Building Sciences — an authoritative US government-chartered organization.
  - **Claims supported:** Standard specification practices, 3-part format, MasterFormat as organizing framework for construction documents.

- **DesignGuide — CSI MasterFormat Index:**
  - URL: `https://www.designguide.com/csi-masterformat-index`
  - Publicly browsable division hierarchy.
  - **Claims supported:** Division-to-material mapping (navigation reference). **Caution:** Commercial site — use only as a secondary cross-reference to CSI's official structure.

- **DPWH Standard Specifications (Volumes II and III):**
  - URL: `https://www.dpwh.gov.ph/dpwh/business/procurement/gs` (DPWH procurement standards page)
  - The DPWH publishes standard specifications that architects must reconcile with CSI format.
  - **Claims supported:** Article claim that "DPWH Standard Specifications do not strictly follow CSI format but share the same logical structure."

#### Proposed raw/refined capture paths for lea-matl-009-02
```
Raw target: vitruvius-connection/001_Raw-Source-Layer/004-Technology/source-map-batch-156/lea-matl-009-02-csi-masterformat.source-capture.md
Refined target: vitruvius-connection/002_Raw-Conversion-Layer/004-Technology/refined_markdown/source-map-batch-156/lea-matl-009-02-csi-masterformat.refined.md
Sidecar target: vitruvius-connection/002_Raw-Conversion-Layer/004-Technology/sidecar_json/source-map-batch-156/lea-matl-009-02-csi-masterformat.refined.json
```

**Refined source records to create:**
| Source | Type | Basis |
|--------|------|-------|
| CSI. MasterFormat 2020 Edition. ISBN 978-1-7349654-2-1. csiresources.org. | `industry_standard_primary` | Definitive MasterFormat authority |
| NIBS. Whole Building Design Guide — Specifications. wbdg.org. | `industry_reference_authoritative` | US government-chartered confirmation of 3-part format |
| DPWH Standard Specifications Volumes II and III. dpwh.gov.ph. | `government_standard_ph` | Philippine government specification comparison |

### 4.2 For lea-util-004-05 and lea-util-004-08 (Seismic Utilities)

#### Primary authoritative source — NSCP 2015 full text (Internet Archive)
- **NSCP 2015 Volume I — Full Text:**
  - URL: `https://archive.org/stream/NSCP2015/NSCP-2015_djvu.txt`
  - Published by: Association of Structural Engineers of the Philippines (ASEP)
  - **Claims supported (verified from visible text):**
    - Preface: ASEP adapted AISC 14th edition and ASCE/SEI 7-10 for Philippine conditions
    - Section 208 (Minimum Design Loads): Seismic Zone classification, near-source factors, response spectrum
    - Section 412 (Diaphragms), Section 418 (Earthquake-Resistant Structures)
    - Seismic Zone 4 assignment, earthquake recording instrumentation requirements
    - Load combinations for strength design (U = 1.2D + 1.0E + f₁L)
    - Earthquake load E = ρEh + Ev, where Ev = 0.5CaID
  - **Risk:** Internet Archive text is OCR from scanned pages — some table data may be garbled. Cross-reference with the local PDF for table verification.

#### FEMA seismic restraint guides (authoritative, free, US government)
- **FEMA P-414 — Installing Seismic Restraints for Duct and Pipe:**
  - URL: `https://www.fema.gov/emergency-managers/risk-management/building-science/publications?name=P-414`
  - Published: January 2004, 91 pages
  - **Claims supported:** Installation methods for duct/pipe seismic braces, cable restraints, sway braces, anchor types, hardware selection, attachment to structure. Provides the methodology that the NSCP references but does not illustrate.

- **FEMA P-412 — Installing Seismic Restraints for Mechanical Equipment:**
  - URL: `https://www.fema.gov/emergency-managers/risk-management/building-science/publications`
  - Published: December 2002
  - **Claims supported:** Anchoring mechanical equipment (chillers, pumps, air handlers) to structure, vibration isolators, housekeeping pads.

- **FEMA P-413 — Installing Seismic Restraints for Electrical Equipment:**
  - URL: Same FEMA library
  - Published: January 2004
  - **Claims supported:** Electrical equipment anchorage, cable tray bracing, conduit seismic restraints.

- **FEMA E-74 — Reducing the Risks of Nonstructural Earthquake Damage:**
  - URL: `https://femae74.atcouncil.org/`
  - Chapter 6.4 covers Mechanical, Electrical, and Plumbing Components specifically
  - **Claims supported:** ASCE/SEI 7-10 Chapter 13 compliance, anchorage requirements by SDC, Importance Factor Ip, flexible connections, exemption thresholds

#### Philippine government sources
- **DPWH — National Building Code references:**
  - URL: `https://www.dpwh.gov.ph/`
  - PD 1096 IRRs are available from DPWH or have already been captured in the conversion layer.

- **PHIVOLCS earthquake data (fault systems and seismic hazard):**
  - URL: `https://www.phivolcs.dost.gov.ph/`
  - Philippine Institute of Volcanology and Seismology — the authoritative Philippine source for fault data, seismic hazard maps, and earthquake catalogs.
  - **Claims supported:** Fault line locations, magnitudes, recurrence intervals cited in lea-util-004-08.
  - **Risk:** PHIVOLCS Open File Report 2008-001 is the specific citation — may not be directly downloadable. PHIVOLCS publishes hazard maps and summaries publicly.

#### Supplementary technical references
- **ASCE/SEI 7-10 — Minimum Design Loads for Buildings (NSCP parent standard):**
  - NSCP 2015 is largely adapted from ASCE/SEI 7-10. The ASCE standard provides the underlying methodology.
  - URL: `https://ascelibrary.org/doi/book/10.1061/9780784412916`
  - **Risk:** ASCE 7 is proprietary/paid. The NSCP adaptation is the primary Philippines authority.

#### Proposed raw/refined capture paths for lea-util-004-05 and 004-08
```
PRIMARY (unlocks both clusters):
  Raw: vitruvius-connection/001_Raw-Source-Layer/006 -Structural/National Structural Code of the Philippines 2015.pdf
  Target raw markdown: vitruvius-connection/002_Raw-Conversion-Layer/006 -Structural/raw_markdown/National Structural Code of the Philippines 2015.md
  Target refined: vitruvius-connection/002_Raw-Conversion-Layer/006 -Structural/refined_markdown/National Structural Code of the Philippines 2015.md
  Target sidecar: vitruvius-connection/002_Raw-Conversion-Layer/006 -Structural/sidecar_json/National Structural Code of the Philippines 2015.json

  Extraction priority for utilities:
    Chapter 13 (Seismic Design — nonstructural components, equipment anchorage)
    Sections 26-27 (Wind Loads — basic wind speed, exposure categories, design wind pressure)
    Section 909 (Smoke Control Systems)
    Section 1205 (Emergency Power Systems)
    Section 1206 (Emergency Lighting)
    Section 208 (Seismic Design Categories, Importance Factors)

SUPPLEMENTARY (web capture):
  FEMA P-414 → vitruvius-connection/002_Raw-Conversion-Layer/005-Utilities/refined_markdown/source-map-batch-156/FEMA-P-414-seismic-restraints-duct-pipe.refined.md
  FEMA P-412 → vitruvius-connection/002_Raw-Conversion-Layer/005-Utilities/refined_markdown/source-map-batch-156/FEMA-P-412-seismic-restraints-mechanical.refined.md
  PHIVOLCS fault data → vitruvius-connection/001_Raw-Source-Layer/005-Utilities/source-map-batch-156/phivolcs-fault-data.source-capture.md
```

---

## 5. Safe Claim Boundaries

### 5.1 lea-matl-009-02 — CSI MasterFormat

**SAFE to claim with CSI publisher page + WBDG:**
- MasterFormat organizes construction information into 50 numbered divisions (00-49)
- Division 03 = Concrete, 04 = Masonry, 05 = Metals, 06 = Wood/Plastics/Composites, 07 = Thermal & Moisture Protection, 08 = Openings, 09 = Finishes
- The standard 3-part format: Part 1 General, Part 2 Products, Part 3 Execution
- MasterFormat is maintained by CSI and CSC, updated every few years (2020 is current edition)
- DPWH Standard Specifications organize content similarly but do not follow CSI numbering

**DO NOT claim:**
- Exact section numbers beyond the division level (e.g., "Section 03 30 00" — verified from publisher index but verify against latest edition)
- That CSI MasterFormat is mandatory in Philippine projects (article correctly states it is not)
- That specific DPWH sections map 1:1 to CSI divisions (the mapping is approximate)

### 5.2 lea-util-004-05 — Seismic Bracing and Earthquake Resilience

**SAFE to claim with converted NSCP 2015:**
- NSCP 2015 Chapter 13 governs nonstructural component seismic design
- SDC D or higher for high-occupancy buildings in Zone 4
- Seismic force formula Fp = (0.4 ap SDS Wp Ip)/Rp
- Typical Philippine Zone 4 PGA = 0.40g
- Wind design per NSCP Sections 26-27, BVS location-dependent

**SAFE to claim with existing converted PD 1096 + RA 9266:**
- Emergency lighting: 1 fc (10.76 lux) minimum, 90-minute battery per PD 1096 Rule VIII Sec 811
- Exit signage: 30 m visibility, lettering standards

**DO NOT claim without NSCP conversion:**
- Specific seismic demand values for equipment (0.4g horizontal, 0.2g vertical — verify against NSCP Chapter 13 tables)
- Exact SDC assignment rules (Table-based; verify table extract)
- That emergency power auto-transfer must be ≤0.15 seconds for ALL buildings (verify scope: critical facilities vs general)

### 5.3 lea-util-004-08 — Seismic Bracing Requirements per NSCP 2015

**SAFE to claim with converted NSCP 2015:**
- NSCP Section 208 SDC A-F table (confirmed from Internet Archive text for Zone → SDC mapping)
- Seismic force formula with component factors (ap, Ip, Rp)
- Equipment anchorage requirements (weight thresholds, anchor bolt grades)
- Building expansion joint accommodation principles

**SAFE to claim with FEMA P-414:**
- Cable restraint safety factor 4:1 (FEMA standard recommendation)
- Flexible conduit loop minimum 300 mm (industry standard, verified from FEMA)
- Support spacing for piping/duct at seismic joints

**CLAIMS REQUIRING SPECIFIC VERIFICATION (high risk):**
- "M16 Grade 8.8 anchor bolts minimum" — verify against NSCP 2015 Chapter 13Table or ACI 318 Chapter 17
- "Elevator seismic switch activation at 0.15g per ASME A17.1" — verify exact ANSI/ASME A17.1 threshold; may be building-code-specific
- "Sprinkler support at maximum 3 m intervals per NSCP 1307.4" — verify section number and spacing
- "Generator auto-start within 30 seconds per ISO 3006" — verify exact ISO reference
- Specific earthquake magnitudes and recurrence intervals — verify against PHIVOLCS data

**DO NOT claim without PHIVOLCS source capture:**
- Exact fault recurrence intervals (400 years for Philippine Fault, 180 years for Marikina Valley Fault)
- Specific earthquake magnitudes and dates (1990 M 7.7, 2012 M 6.8, 2019 M 6.3)
- These are factual but require authoritative PHIVOLCS source capture for source-record integrity

---

## 6. Risks

### Shared risks (all three clusters)
1. **Placeholder blockers secondary to source blockers:** All three clusters have compose-error.json issues (matl-009-02 has 6 unresolved placeholders; util clusters are likely similar). These should be resolved AFTER source capture, not before — placeholder UI assets can't be filled without knowing what claims the sources support.

2. **NSCP 2015 PDF conversion is the highest-yield single action:** Converting this one PDF would unblock 2 of 3 clusters here PLUS 4 of 7 structural clusters in Lane C. The 92.7 MB PDF is the single most impactful unconverted source in the vitruvius layer.

### lea-matl-009-02 specific risks
3. **CSI MasterFormat is proprietary:** There is no authorized free version. Claims must be bounded to the publicly referenceable division structure, not proprietary section-level details. The LEA tests structure/navigation, not specific section content — this aligns with safe boundaries.
4. **Edition risk:** The article may reference a specific MasterFormat edition (likely 2016 or 2020). The CSI publisher page documentation should note that MasterFormat is periodically updated.

### lea-util-004-05 specific risks
5. **Article scope is broader than title suggests:** The article covers wind, flood, lighting, signage, smoke control, communications, power, and resilience — NOT just seismic bracing. Source records must cover this breadth, which means the cluster actually needs multiple source families (NSCP + PD 1096 + RA 10121 + RA 9514 + Philippine codes), not just one.
6. **RA 10121 (Disaster Risk Reduction Act) source gap:** The article references RA 10121 for flood zoning and critical facility resilience requirements. This law may or may not be in the vitruvius layer — it was not verified in this investigation.

### lea-util-004-08 specific risks
7. **Extremely high claim specificity:** This is arguably the highest-specificity article in the non-structural utilities space. It cites exact table numbers, formula coefficients, fault recurrence intervals, hardware grades, and inspection protocols. Every numeric claim requires source verification. A single wrong number (e.g., 0.15g vs 0.10g elevator threshold) could mislead exam candidates.
8. **PHIVOLCS source capture needed:** The Philippine fault data (magnitudes, recurrence intervals) requires PHIVOLCS source capture. PHIVOLCS data is publicly available but has not been captured in the vitruvius layer.
9. **Internet Archive NSCP text quality unknown:** The OCR at `archive.org/stream/NSCP2015/NSCP-2015_djvu.txt` is from a scanned document. Table data may be garbled. The local PDF extraction is preferred for table verification, but the Internet Archive text can serve as an interim cross-reference.

---

## 7. Can These Clusters Be Reopened Now?

**lea-matl-009-02:** NOT immediately. Requires:
1. Capture CSI MasterFormat publisher page as raw source
2. Create refined source record with safe claim boundaries
3. Resolve 6 unresolved placeholders (ui_0001-ui_0006 — likely media/diagram assets)
4. Re-run compose pipeline with source records created

**Estimated reopening:** Eligible for Batch 156+ if CSI publisher page captured.

**lea-util-004-05 and lea-util-004-08:** NOT immediately. Both require:
1. Convert NSCP 2015 PDF to refined markdown (shared blocker with Lane C structural clusters)
2. Capture FEMA P-414 (for both) and FEMA P-412/P-413 (for 004-05 breadth)
3. Verify RA 10121 source availability in vitruvius layer
4. Capture PHIVOLCS fault data (for 004-08's specific earthquake claims)
5. Create source records for each cluster mapping article claims to converted sources

**Estimated reopening:** Eligible for Batch 156+ if NSCP 2015 is converted AND FEMA guides are captured.

---

## 8. Recommended Actions

### Priority 1 — NSCP 2015 PDF Conversion
This is the shared blocker for 6 clusters across Lane B2 and Lane C. Run PyMuPDF/pdfplumber extraction on `vitruvius-connection/001_Raw-Source-Layer/006 -Structural/National Structural Code of the Philippines 2015.pdf`, prioritizing Chapters 13, 208, 26-27, 909, and 1205-1206.

### Priority 2 — CSI MasterFormat Web Capture
Capture the CSI publisher page (csiresources.org/standards/masterformat), WBDG reference, and DPWH standard specifications page as raw source records for lea-matl-009-02.

### Priority 3 — FEMA Guide Capture
Download FEMA P-414 (duct/pipe) and P-412 (mechanical equipment) as supplementary source records. These are US government publications — freely downloadable.

### Priority 4 — PHIVOLCS Fault Data Capture
For lea-util-004-08's earthquake history claims. PHIVOLCS publishes seismic hazard maps and fault data at phivolcs.dost.gov.ph.

---

## 9. Investigation Evidence

| Evidence | Location |
|----------|----------|
| Batch 155 reservation manifest | `.ai/03_plans/production-line-batch-155-reservation-manifest.json` (lines 32-34) |
| Residual exhaustion plan | `.ai/03_plans/production-line-residual-exhaustion-after-154.md` |
| lea-matl-009-02 article metadata | `.ai/content-audit-export/articles/lea-matl-009-02-core-concept--0ed94cf5-6a2b-4062-8e8b-4f514ca89be5/article-metadata.json` |
| lea-matl-009-02 compose error | `.ai/content-audit-export/articles/lea-matl-009-02-core-concept--0ed94cf5-6a2b-4062-8e8b-4f514ca89be5/compose-error.json` |
| lea-matl-009-02 original content | `.ai/content-audit-export/target-mapping-no-apply-2026-05-09/articles/lea-matl-009-02-core-concept--0ed94cf5-6a2b-4062-8e8b-4f514ca89be5/original.md` |
| lea-util-004-05 normalized content | `.ai/content-audit-export/articles/lea-util-004-05-seismic-bracing-and-earthquake-resilience--1caee82f-c2c8-409b-a3bf-41576bc702c5/normalized.md` |
| lea-util-004-05 fact-check flag | `.ai/14_fact_checking/flags/flag-150-lea-util-004-05-seismic-bracing-and-eart.md` (MISSING_CITATION - HIGH) |
| lea-util-004-08 normalized content | `.ai/content-audit-export/articles/lea-util-004-08-seismic-bracing-requirements-per-nscp-2015--585425ad-355a-4180-b64b-a872115f39f6/normalized.md` |
| lea-util-004-08 fact-check flag | `.ai/14_fact_checking/flags/flag-183-lea-util-004-08-seismic-bracing-requirem.md` (MISSING_CITATION - HIGH) |
| NSCP 2015 PDF (raw, unconverted) | `vitruvius-connection/001_Raw-Source-Layer/006 -Structural/National Structural Code of the Philippines 2015.pdf` (92.7 MB) |
| NSCP 2015 conversion gap | No refined markdown found in `002_Raw-Conversion-Layer/006 -Structural/` |
| NSCP 2015 Internet Archive text | `https://archive.org/stream/NSCP2015/NSCP-2015_djvu.txt` |
| CSI MasterFormat publisher page | `https://www.csiresources.org/standards/masterformat` |
| CSI MasterFormat 2020 | ISBN 978-1-7349654-2-1, 700 pages, published June 2020 |
| FEMA P-414 (duct/pipe) | `https://www.fema.gov/emergency-managers/risk-management/building-science/publications?name=P-414` |
| FEMA P-412 (mechanical) | FEMA building science publications library |
| FEMA E-74 (nonstructural) | `https://femae74.atcouncil.org/` (Chapter 6.4: MEP Components) |
| PHIVOLCS | `https://www.phivolcs.dost.gov.ph/` |
| DPWH | `https://www.dpwh.gov.ph/` |
| Technology source layer | `vitruvius-connection/001_Raw-Source-Layer/004-Technology/` (49 entries) |
| Utilities source layer | `vitruvius-connection/001_Raw-Source-Layer/005-Utilities/` (29 entries) |
| Technology conversion layer | `vitruvius-connection/002_Raw-Conversion-Layer/004-Technology/refined_markdown/` (89 entries) |
| Utilities conversion layer | `vitruvius-connection/002_Raw-Conversion-Layer/005-Utilities/refined_markdown/` (56 entries) |
| Lane C structural report (same NSCP blocker) | `.ai/03_plans/blocked-source-recovery/lane-c-structural-kimi-opencode.md` |
| Lane A theory report (format reference) | `.ai/03_plans/blocked-source-recovery/lane-a-theory-legal-commanded-by-swarm.md` |
| Original CSI prompt | `.ai/03_plans/blocked-source-recovery/prompt-csi-masterformat.md` |
| Original seismic prompt | `.ai/03_plans/blocked-source-recovery/prompt-seismic-utilities.md` |
| LANL MasterFormat 2020 revisions | `https://engstandards.lanl.gov/specs/MasterFormat-2020.pdf` |
| ASCE 7-10 MEP bracing presentation | `https://www.slideshare.net/slideshow/asce-7-10-presentation-on-seismic-bracing-for-mep-systems/59943975` |
| Adjacent cluster: lea-util-004-04 | `.ai/14_fact_checking/flags/flag-151-lea-util-004-04-when-fire-alarm-systems.md` |
| Adjacent cluster: lea-util-004-06 | `.ai/14_fact_checking/flags/flag-152-lea-util-004-06-cctv-systems.md` |
| Adjacent cluster: lea-util-004-07 | `.ai/content-audit-export/articles/lea-util-004-07-core-concepts-and-formulas--b75b3e00-5fe7-4717-95d0-b65ea5b2bb28/original.md` |

---

*End of report. No article folders, source folders, code, git, Supabase, or deploy touched.*
