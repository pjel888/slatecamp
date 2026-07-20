# Council Remediation 2026-07-20 — lea-plan-003-02

Agent: **P (Planning stream)** | Date: 2026-07-20 | Pass: `council-remediation-2026-07-20/agent-P override`

## Bundle

- Slug: `lea-plan-003-02-what-you-need-to-know-for-the-lea`
- Article ID: `7c0e2fa5-7f3d-419a-b592-50346ac7ab2f`

## Confirmed errors (1)

### 1. `0b9007bf-064f-4550-a673-4ce7b1b04ff1` — BP 220 economic single-detached minimum

- Original defect: Marked-correct option gave wrong BP 220 minimum lot/floor for economic single-detached housing. BP 220 Appendix II sets economic single-detached at **72 sqm lot / 22 sqm minimum floor area**.
- Recomputation: BP 220 economic single-detached lot range 54-72 sqm; smallest allowable lot for single-detached is 54 sqm, the standard reference figure is 72 sqm, with floor area 22 sqm.
- Edit file: `question-edits/0b9007bf-064f-4550-a673-4ce7b1b04ff1.json`
- New correct option: **b** (72 sqm lot / 22 sqm floor).

## Sources cited

- BP 220 Appendix II (Rules and Standards for Economic and Socialized Housing)
- lawphil.net BP 220 text
- DHSUD / HLURB planning standards

## Validation

Edit JSON passes `jq empty`. `approved_by` = `agent-P-planning-council-2026-07-20`. Primary content files NOT modified.
