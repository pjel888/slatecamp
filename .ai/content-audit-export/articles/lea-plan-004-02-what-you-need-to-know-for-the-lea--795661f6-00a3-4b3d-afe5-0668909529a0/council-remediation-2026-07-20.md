# Council Remediation 2026-07-20 — lea-plan-004-02

Agent: **P (Planning stream)** | Date: 2026-07-20 | Pass: `council-remediation-2026-07-20/agent-P override`

## Bundle

- Slug: `lea-plan-004-02-what-you-need-to-know-for-the-lea`
- Article ID: `795661f6-00a3-4b3d-afe5-0668909529a0`

## Confirmed errors (1)

### 1. `17ec5efc-a394-4c40-a41c-3ae68ee3d329` — PD 1067 agricultural river easement

- Original defect: Marked-correct option applied a fabricated width-based rule ("rivers <X m require Y m easement") to derive an incorrect easement distance. PD 1067 Article 51 does NOT use river width — it uses LAND CLASSIFICATION. For agricultural land, the easement is **20 m**.
- Recomputation: Article 51 = 3m urban / 20m agricultural / 40m forest, applied by land classification regardless of river width.
- Edit file: `question-edits/17ec5efc-a394-4c40-a41c-3ae68ee3d329.json`
- New correct option: **b** (20 m).

## Sources cited

- PD 1067 Article 51 (Water Code easements by land classification)
- lawphil.net/statutes/presdecs/pd1976/pd_1067_1976.html
- Supreme Court E-Library PD 1067

## Validation

Edit JSON passes `jq empty`. `approved_by` = `agent-P-planning-council-2026-07-20`. Primary content files NOT modified.
