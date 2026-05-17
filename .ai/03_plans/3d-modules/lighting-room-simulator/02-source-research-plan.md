# Source Research Plan — Lighting Room Simulator

## Objective

Identify, locate, extract, and verify every code/legal value used in the Lighting Room Simulator module. Each learner-visible number must be traceable to a primary law source.

## Source Families

| Priority | Law Family | Status | Notes |
|----------|-----------|--------|-------|
| P0 | DOE Guidelines on Energy Conserving Design of Buildings Table 3.1 | Located | v0 source family for illuminance teaching targets; still pending SME approval |
| P0 | Philippine Green Building Code Table 11 | Located | v0 source family for office LPD; still pending SME approval |
| P0 | RA 9514 Fire Code IRR §10.2.5.11 | Located | Exit illumination resolves to 10.7 lux; contextual unless displayed |
| P0 | PEC Rule 9.50.4 (Illumination) | Conflict / deferred from v0 display | No primary PEC locator found in this pass; do not show PEC as a v0 law card |
| P2 | PD 1096 Rule VIII (Light and Ventilation) | Needs sourcing | Ceiling heights, room sizes, window area |
| P3 | Lamp efficacy reference values | Pedagogical only | Incandescent/fluorescent/LED lm/W values are learning references, not legal thresholds |

## Source-Value Inventory

### Illuminance Requirements (PEC / DOE Energy Code)

| Room Type | Target Lux | Source | Verification Needed |
|-----------|-----------|--------|---------------------|
| Office (general) | 300 selected lower-bound target from 300-750 range | DOE Table 3.1 (`SRC-DOE-ILLUM-001`) | SME approval and learner wording |
| Drawing / drafting office | 750 selected target from 500-1,000 range | DOE Table 3.1 (`SRC-DOE-ILLUM-004`) | SME approval and learner wording |
| Reading / proofreading localized task | 500 selected lower-bound target from 500-1,000 proofreading range | DOE Table 3.1 (`SRC-DOE-ILLUM-002`) | Label carefully; do not call this generic library law |
| Corridor / Circulation | 50-150 range; 150 selected target only if labeled as selected range target | DOE Table 3.1 (`SRC-DOE-ILLUM-003`) | SME approval and learner wording |
| Classroom | 300 candidate value | DOE Table 3.1 | Not required for v0 hidden QA unless classroom preset is added |

### LPD Limits (Green Building Code)

| Occupancy | Max LPD (W/m²) | Source |
|-----------|----------------|--------|
| Office | 10.8 | Green Building Code Table 11 |
| School | 12.9 | Green Building Code Table 11 |
| Hospital | 12.9 | Green Building Code Table 11 |

### Lamp Efficacy (Reference Values)

| Type | lm/W | Verification Needed |
|------|------|---------------------|
| Incandescent | 10–18 | Confirm LEA-standard value |
| Fluorescent | 65–100 | Confirm LEA-standard value |
| LED | 60–160 | Confirm LEA-standard value |

### Exit Illumination (Fire Code)

| Value | Source | Section |
|-------|--------|---------|
| 10.7 lux at floor level | RA 9514 Fire Code IRR | §10.2.5.11 |

## Locator Priority

1. **DOE Guidelines on Energy Conserving Design of Buildings v2008 PDF** — located v0 source family for illuminance targets.
2. **Philippine Green Building Code** — located Table 11 source family for LPD limits.
3. **RA 9514 2019 RIRR** — located Fire Code emergency egress illumination source.
4. **PEC (Philippine Electrical Code)** — unresolved primary locator; deferred from v0 source-backed display.
5. **PD 1096 2004 Revised IRR** — Rule VIII remains contextual for natural light/ventilation and ceiling height, not artificial lux ownership.

## Next Steps

1. Keep `05-source-locator-workbook.csv` as the source-card seed for hidden QA.
2. Treat every `LOCATED` legal row as pending SME approval; do not render pass/fail language from it.
3. Do not show PEC as a source-backed law family until a primary PEC locator is added.
4. If classroom, hospital, PD 1096, or emergency-egress cards are added to v0, create matching workbook rows and source-card tests first.
