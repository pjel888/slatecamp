# Council Remediation 2026-07-20 — lea-plan-003-06

Agent: **P (Planning stream)** | Date: 2026-07-20 | Pass: `council-remediation-2026-07-20/agent-P override`

## Bundle

- Slug: `lea-plan-003-06-core-concept`
- Article ID: `08dff936-85fa-4f57-8388-466ecca109e4`

## Confirmed errors (4)

### 1. `3d759df0-102f-4b3f-bc24-63bd2af73f18` — RA 7279 relocation in danger areas

- Original defect: Treated relocation as optional in danger-area evictions. RA 7279 §29 makes relocation MANDATORY before eviction.
- Edit file: `question-edits/3d759df0-102f-4b3f-bc24-63bd2af73f18.json`
- New correct option: **a** (relocation required even in danger areas).

### 2. `6a467a4e-50f0-49c4-8b60-81259222e122` — RA 7279 resettlement content

- Original defect: Limited resettlement to "temporary shelter only." RA 7279 §21-22 requires resettlement to include basic services AND livelihood.
- Edit file: `question-edits/6a467a4e-50f0-49c4-8b60-81259222e122.json`
- New correct option: **b** (basic services + livelihood).

### 3. `e7dc5b84-1a93-4aba-a58d-7d4abe4d1204` — RA 7279 §28 safeguards

- Original defect: Listed only one safeguard (notice OR consultation OR relocation). RA 7279 §28 requires ALL THREE: 30-day notice + consultation + relocation.
- Edit file: `question-edits/e7dc5b84-1a93-4aba-a58d-7d4abe4d1204.json`
- New correct option: **a** (all three safeguards).

### 4. `cf41acaf-11b2-4938-ad66-4e883c7e9cac` — PD 1067 agricultural shore easement

- Original defect: Misstated PD 1067 Article 51 agricultural shore easement as 3m or 40m. Article 51 fixes agricultural areas at **20m**.
- Recomputation: Article 51 easement of public use = 3m urban / 20m agricultural / 40m forest.
- Edit file: `question-edits/cf41acaf-11b2-4938-ad66-4e883c7e9cac.json`
- New correct option: **b** (20m).

## Sources cited

- RA 7279 §§21-22 (resettlement content), §§28-29 (eviction safeguards; relocation mandatory)
- PD 1067 Article 51 (Water Code easements by land classification)
- lawphil.net; Supreme Court E-Library

## Validation

All four edit JSONs pass `jq empty`. `approved_by` = `agent-P-planning-council-2026-07-20`. Primary content files NOT modified.
