# Council Remediation — 2026-07-20

Bundle: `lea-util-001-06-core-concept--68dc5ecb-7b3f-4394-a7b7-770336b3ce98`
Agent: Agent O (Building Utilities / MEPF stream)
Status: **PENDING APPLICATION**

## Source findings remediated

- **ERROR E1** (`9fc94eab-3953-4408-9461-8fb9442439f2`, biodegradable storage): Marked correct was `c`=3,600 L. Largest waste stream is biodegradable at 60%: 200 kg/day × 0.60 = 120 kg/day × 3 days = 360 kg × 4 L/kg = **1,440 L**. Correct option is `b`=1,440 L. The original marked answer would require 900 kg of stored biodegradable waste, implying 4.5 days of the FULL unsegregated stream (not the biodegradable fraction).
- **ERROR E2** (`ee3acf88-d088-4044-9c79-f11577b8162a`, compost yield): Marked correct was `a`=32.85 MT. With 3:1 wet-to-finished ratio, finished compost = biodegradable mass / 3 = (219 MT × 0.60) / 3 = 131.4 / 3 = **43.8 MT**. Correct option is `b`=43.8 MT. The original answer results from dividing by 4 (a 4:1 ratio that contradicts the explicitly stated 3:1 ratio in the stem).

## Recomputation / verification

- E1: RA 9003 segregation volume = (daily biodegradable mass × storage days × bulk density factor) = 120 × 3 × 4 = 1,440 L.
- E2: RA 9003 compost yield = (annual biodegradable mass) / (wet-to-finished ratio) = 131.4 / 3 = 43.8 MT/year.
- Cross-check E2: 1,500 persons × 0.4 kg/day × 365 days = 219,000 kg = 219 MT annual total — matches stem, so fraction allocation is internally consistent.

## Question-edit files written

| Question UUID | Error | Correction |
| --- | --- | --- |
| `9fc94eab-3953-4408-9461-8fb9442439f2` | E1 | correct_option_id changed from `c` to `b` (1,440 L); options unchanged; rationale rewritten with recomputation; replaces earlier batch-037 placeholder edit. |
| `ee3acf88-d088-4044-9c79-f11577b8162a` | E2 | correct_option_id changed from `a` to `b` (43.8 MT); options unchanged; rationale rewritten with recomputation; replaces earlier batch-037 placeholder edit. |

All JSON validated with `jq empty`. No edits were made to `normalized.md`, `candidate.md`, `original.md`, or `linked-questions.json`.
