# Source-Audited Production-Line Reservation: Batches 090-092

**Reserved at:** 2026-05-12T07:27:54+08:00
**Status:** `RESERVED_PRE_START_NOT_COMPLETE`
**Baseline commit:** `3957e8c08`
**Branch:** `3dlab-gray-viewport-bg`
**Workspace:** `/Users/philiplewis/slatecamp`

## Reservation Scope

This document records the reservation of the next three local-first source-audited article/question batches (090, 091, 092) so that future workers can continue safely if credits or network fail.

**Explicit constraints:**
- No article content edits during reservation.
- No question-edit mutations during reservation.
- No Supabase push/apply, deploy, or commit during reservation.
- Batch 090 may begin execution only after this reservation is committed and pushed.

## Batch 090 — PD 1096 Building-Code Cluster

| # | Article ID | Slug | Subject | Linked Qs | Source Family |
|---|---|---|---|---|---|
| 1 | `16ba355e-811c-4191-98c2-c7fac22ca59b` | `location-on-property-and-exterior-walls` | LEA-DSGN | 40 | PD 1096 RIRR 2004 |
| 2 | `915c1016-2ed6-4b47-b2ca-f12965c6bc9f` | `ceiling-heights-and-room-sizes` | LEA-DSGN | 37 | PD 1096 RIRR 2004 |
| 3 | `42eb0c36-da27-4b7e-a1e3-4ed915bfca8d` | `minimum-requirements-group-a-dwellings` | LEA-DSGN | 36 | PD 1096 RIRR 2004 |
| 4 | `3ad2ad2a-e525-44c3-8edf-bf7036d9c31a` | `rule-i-general-provisions` | LEA-DSGN | 30 | PD 1096 RIRR 2004 |
| 5 | `850a66f9-db5d-4068-a763-0bc4c1d9872a` | `minimum-parking-requirements` | LEA-DSGN | 28 | PD 1096 RIRR 2004 + BP 344 |

**Batch 090 counts:** 5 articles, 171 linked questions, 172 question-edit files.
**Known blocker:** `minimum-parking-requirements` has 28 linked questions but 29 question-edit files (including `index.json`). Verify correspondence and remove any orphaned file before batch acceptance.

## Batch 091 — Construction Systems + Fire Safety

| # | Article ID | Slug | Subject | Linked Qs | Source Family |
|---|---|---|---|---|---|
| 1 | `bd009a97-21fe-400e-8717-615d5a877cfd` | `excavation-foundation-and-veneer` | LEA-MATL | 39 | PD 1096 RIRR 2004 |
| 2 | `3a28da11-0053-4b2f-85a8-f675a3d10a43` | `glass-and-glazing-area-limits` | LEA-DSGN | 39 | PD 1096 RIRR 2004 |
| 3 | `9437579a-377e-41ec-8527-4c0399348746` | `fire-zones-and-existing-buildings` | LEA-UTIL | 33 | PD 1096 RIRR 2004 |
| 4 | `68eeacdb-a61b-4f53-bbe9-e2459fa8d152` | `certificate-of-occupancy` | LEA-PRAC | 32 | PD 1096 RIRR 2004 |
| 5 | `ad9732f1-f733-4bc1-acb5-72b4bb53555d` | `dangerous-and-ruinous-buildings` | LEA-UTIL | 25 | PD 1096 RIRR 2004 |

**Batch 091 counts:** 5 articles, 168 linked questions, 168 question-edit files.
**Blockers:** None.

## Batch 092 — Accessibility, Fire Code, Professional Practice

| # | Article ID | Slug | Subject | Linked Qs | Source Family |
|---|---|---|---|---|---|
| 1 | `e6c2a686-5b8c-477d-b5e4-d02bef987743` | `pedestrian-protection-during-construction` | LEA-DSGN | 32 | PD 1096 RIRR 2004 |
| 2 | `16a0bc40-d538-4e4a-8408-cd41dd7aa7aa` | `signs-design-and-construction` | LEA-DSGN | 37 | PD 1096 RIRR 2004 |
| 3 | `cb947ab1-7737-4bde-8a47-606b5d305ed6` | `pd-1096-rule-viii-light-and-ventilation` | LEA-DSGN | 26 | PD 1096 RIRR 2004 |
| 4 | `1d37a355-c8bf-4d5e-a41b-07a9817a4427` | `lea-util-004-04-when-fire-alarm-systems-are-mandatory-ra-9514-irr` | LEA-UTIL | 25 | RA 9514 2019 RIRR |
| 5 | `f2c105fd-51fc-4b48-b53a-77242dbb91b0` | `uap-spp-doc-standards-of-professional-practice-for-philippine-architects` | LEA-PRAC | 10 | UAP SPP |

**Batch 092 counts:** 5 articles, 130 linked questions, 130 question-edit files.
**Blockers:** None.

## Exclusion Verification

- **Excluded set:** 325 article IDs from Batches 001-089 (source-audited ledgers, reports, scoped checks, dated recovery artifacts, and handoff).
- **Unused pool:** 242 articles remain available from 567 total article directories.
- **Selected IDs in exclusion set:** 0 (PASS).

## Local Raw Source Families Confirmed

| Family | Path | Status |
|---|---|---|
| PD 1096 RIRR 2004 DPWH Official | `vitruvius-connection/001_Raw-Source-Layer/001-Laws/PD-1096/PD 1096 RIRR 2004 - Revised IRR (DPWH Official).pdf` | Exists |
| BP 344 2024 Revised IRR | `vitruvius-connection/001_Raw-Source-Layer/001-Laws/BP-344/2024 Revised Implementing Rules and Regulations Batas Pambansa Blg. 344 _ National Council on Disability Affairs.pdf` | Exists |
| RA 9514 2019 Revised IRR | `vitruvius-connection/001_Raw-Source-Layer/001-Laws/RA-9514/RA9514-RIRR-rev-2019.pdf` | Exists |
| UAP Standards of Professional Practice | `vitruvius-connection/001_Raw-Source-Layer/001-Laws/UAP/Standards of Professional Practice2.pdf` | Exists |
| Building Construction Illustrated 5th Ed | `vitruvius-connection/001_Raw-Source-Layer/004-Technology/Building Construction Illustrated (5th Edition).pdf` | Exists |

## Files Written

1. `/Users/philiplewis/slatecamp/.ai/03_plans/production-line-batch-090-manifest.json`
2. `/Users/philiplewis/slatecamp/.ai/03_plans/production-line-batch-091-manifest.json`
3. `/Users/philiplewis/slatecamp/.ai/03_plans/production-line-batch-092-manifest.json`
4. `/Users/philiplewis/slatecamp/.ai/03_plans/source-audited-production-line-coordination.md` (updated)
5. `/Users/philiplewis/slatecamp/.ai/03_plans/source-audited-local-first-batches-handoff.md` (appended)
6. `/Users/philiplewis/slatecamp/.ai/03_plans/source-audited-production-line-reservation-090-092.md` (this file)

## Next Steps

1. Commit and push the reservation files so Batch 090 can begin.
2. Batch 090 worker: verify `minimum-parking-requirements` question-edit mismatch before acceptance.
3. Execute Batch 090 source-audit protocol (raw PDF audit → compose → diff → validate → UI-block edits → JSON parse → scans → tests → report/ledger/scoped checks → handoff update).
4. After Batch 090 acceptance, proceed to Batch 091, then Batch 092.

## Safety Notes

- Do not start Batch 090 execution before this reservation commit is pushed.
- Do not silently replace `minimum-parking-requirements` with an easier article; resolve the blocker explicitly.
- Internet may be used only as supplemental discovery; primary evidence must be local raw sources under `vitruvius-connection/001_Raw-Source-Layer`.
