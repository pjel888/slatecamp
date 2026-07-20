# Council Remediation 2026-07-20 — lea-plan-004-06

Agent: **P (Planning stream)** | Date: 2026-07-20 | Pass: `council-remediation-2026-07-20/agent-P override`

## Bundle

- Slug: `lea-plan-004-06-core-concept`
- Article ID: `d4ab12a3-cec8-4104-b276-4fe649c2e35f`

## Confirmed errors (1)

### 1. `2713f23f-dea3-4356-a121-1bf064be885b` — PD 1067 urban creek easement

- Original defect: Marked-correct option and rationale invoked a fabricated width-based rule: "PD 1067 specifies streams and rivers with width less than 6 meters require a 3-meter easement," applied to a 3.5 m wide creek. There is NO width-based rule in PD 1067. Article 51 fixes the easement by LAND CLASSIFICATION (3m urban / 20m agricultural / 40m forest). For an urban creek, the answer is **3 m** — but the statutory path is land classification, not stream width.
- Recomputation: urban classification → 3 m (Article 51).
- Edit file: `question-edits/2713f23f-dea3-4356-a121-1bf064be885b.json`
- New correct option: **a** (3 m) with the corrected statutory rationale.

## Sources cited

- PD 1067 Article 51 (Water Code easements by land classification)
- lawphil.net/statutes/presdecs/pd1976/pd_1067_1976.html
- Supreme Court E-Library PD 1067

## Validation

Edit JSON passes `jq empty`. `approved_by` = `agent-P-planning-council-2026-07-20`. Primary content files NOT modified.
