# Council Remediation — 2026-07-20

Bundle: `lea-util-003-08-summary-for-exam-preparation--29d54ad6-6af8-4c7b-b504-fa6e0a1e5220`
Agent: Agent O (Building Utilities / MEPF stream)
Status: **PENDING APPLICATION**

## Source findings remediated

- **ERROR E7** (`a931bd9c-871e-4538-8ceb-3e7a0b07d5b2`, commercial solar NPV): Marked correct was `c`=+4-6M PHP positive NPV. The stem explicitly fixes the tariff as "12 PHP/kWh (assumed constant)" — so positive NPV of +4-6M PHP is mathematically impossible. Recomputation: Year 1 revenue = 30,368 kWh × 12 PHP = 364,416 PHP. PV of degraded energy savings (0.7%/year degradation, 5% discount, 25 years) = **4,809,387 PHP**. PV of O&M (1% of 8.5M = 85,000 PHP/year flat × annuity factor 14.094) = **1,197,985 PHP**. NPV = 4,809,387 − 8,500,000 − 1,197,985 = **−4,888,599 PHP (approximately −4.9M, NEGATIVE)**. Correct option is `a` (negative NPV). The originally marked answer `c` would require an unstated tariff escalation of 5–7%/year, contradicting the stem's "assumed constant" wording.

## Recomputation / verification

- Year 1 revenue: 30,368 kWh × 12 PHP/kWh = 364,416 PHP.
- Geometric series PV with degradation: PV = (30,368 × 12 / 1.05) × [(1 − 0.9457²⁵) / (1 − 0.9457)] = 4,809,387 PHP.
- O&M PV using annuity factor 14.094 at 5%/25y: 85,000 × 14.094 = 1,197,985 PHP.
- NPV = PV_savings − Capex − PV_OM = 4,809,387 − 8,500,000 − 1,197,985 = −4,888,599 PHP.
- Source: RA 9513 (Renewable Energy Act of 2008) for context on tariff/incentive structure; NPV/DCF methodology per stem inputs.

## Question-edit files written

| Question UUID | Error | Correction |
| --- | --- | --- |
| `a931bd9c-871e-4538-8ceb-3e7a0b07d5b2` | E7 | correct_option_id changed from `c` (+4-6M PHP) to `a` (negative, approximately −4.9M PHP); option a text rewritten to specify the corrected range (approximately −4.9 million PHP, in the −2.0 to −5.0 million PHP range); rationale rewritten with full DCF recomputation; replaces earlier batch-047 placeholder edit. |

All JSON validated with `jq empty`. No edits were made to `normalized.md`, `candidate.md`, `original.md`, or `linked-questions.json`.
