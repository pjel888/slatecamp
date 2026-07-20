# Council Remediation 2026-07-20 — lea-plan-003-01

Agent: **P (Planning stream)** | Date: 2026-07-20 | Pass: `council-remediation-2026-07-20/agent-P override`

## Bundle

- Slug: `lea-plan-003-01-what-you-need-to-know-for-the-lea`
- Article ID: `0d2e80df-4f76-484e-9b1f-5502da9e35be`

## Confirmed errors (3)

### 1. `c5d281b1-da59-4ce8-a53b-d6f5ae121aed` — RA 10884 subdivision share

- Original defect: Marked-correct option treated RA 10884 Balanced Housing subdivision share as "15-20%". RA 10884 Section 5 fixes it at **15%** (condominium 5%); the 20% figure is the superseded RA 7279 rate.
- Recomputation: 15% of saleable area for subdivision projects (RA 10884 §5).
- Edit file: `question-edits/c5d281b1-da59-4ce8-a53b-d6f5ae121aed.json`
- New correct option: **b** (15%).

### 2. `b7780e3e-9362-44c8-9c2e-82c530c4d3f2` — RA 7279 danger areas

- Original defect: Treated danger areas as a blanket "eviction-only" category without statutory basis. RA 7279 §28 classifies danger areas by TYPE (e.g., along waterways, under fault lines, on landslide-prone slopes) and §29 makes eviction lawful only within that taxonomy.
- Edit file: `question-edits/b7780e3e-9362-44c8-9c2e-82c530c4d3f2.json`
- New correct option: **a** (danger areas are defined by hazard type under RA 7279 §28).

### 3. `94ce568e-aef9-4b01-9517-0da5e088d45f` — RA 7279 safeguards in danger areas

- Original defect: Implied that because the area is a "danger area," the 30-day notice + consultation + relocation safeguards of RA 7279 §28-29 do not apply. They DO apply even in danger-area evictions.
- Edit file: `question-edits/94ce568e-aef9-4b01-9517-0da5e088d45f.json`
- New correct option: **c** (safeguards apply even in danger areas).

## Sources cited

- RA 10884 §5 (Balanced Housing Development Reform Act) — 15% subdivision / 5% condominium
- RA 7279 §§28-29 (UDHA) — danger-area definition by type; eviction safeguards
- lawphil.net, Supreme Court E-Library

## Validation

All three question-edit JSONs pass `jq empty`. `approved_by` = `agent-P-planning-council-2026-07-20`. Primary content files (normalized.md, candidate.md, original.md) NOT modified.
