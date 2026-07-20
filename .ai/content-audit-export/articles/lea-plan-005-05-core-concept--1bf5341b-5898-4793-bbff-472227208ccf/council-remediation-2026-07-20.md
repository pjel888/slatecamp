# Council Remediation 2026-07-20 — lea-plan-005-05

Agent: **P (Planning stream)** | Date: 2026-07-20 | Pass: `council-remediation-2026-07-20/agent-P override`

## Bundle

- Slug: `lea-plan-005-05-core-concept`
- Article ID: `1bf5341b-5898-4793-bbff-472227208ccf`

## Confirmed errors (1)

### 1. `953513e5-8e59-4813-baab-85f0bf06d819` — PD 1067 creek easement (internal contradiction)

- Original defect: The question asked for a "creek easement under PD 1067" but the marked-correct option used a **4 m** figure. No 4-meter easement exists anywhere in the Water Code. PD 1067 Article 51 fixes easements only by LAND CLASSIFICATION (3m urban / 20m agricultural / 40m forest). For an urban creek the correct answer is **3 m**.
- Recomputation: urban classification → 3 m (Article 51).
- Edit file: `question-edits/953513e5-8e59-4813-baab-85f0bf06d819.json`
- New correct option: **a** (3 m).

## Sources cited

- PD 1067 Article 51 (Water Code easements by land classification)
- lawphil.net/statutes/presdecs/pd1976/pd_1067_1976.html
- Supreme Court E-Library PD 1067

## Validation

Edit JSON passes `jq empty`. `approved_by` = `agent-P-planning-council-2026-07-20`. Primary content files NOT modified.
