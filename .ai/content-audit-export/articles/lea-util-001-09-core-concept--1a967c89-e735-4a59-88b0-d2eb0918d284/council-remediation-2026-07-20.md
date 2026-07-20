# Council Remediation — 2026-07-20

Bundle: `lea-util-001-09-core-concept--1a967c89-e735-4a59-88b0-d2eb0918d284`
Agent: Agent O (Building Utilities / MEPF stream)
Status: **PENDING APPLICATION**

## Source findings remediated

All three errors in this bundle are Rational Method hydrology questions with the same root cause: the answer-key generation **omitted the 0.00278 SI unit conversion constant** in the formula Q (m³/s) = 0.00278 × C × I (mm/hr) × A (ha), where 0.00278 = (1/3600 hr/s) × (1 m / 1000 mm) × (10000 m²/ha). This produces answers off from correct values by a factor of 5–10.

- **ERROR E3** (`668064be-11c5-46f9-876d-6d83bcfdd00f`, drainage area): Marked correct was `c`=3.4 ha. Solving A = Q / (0.00278 × C × I) = 0.120 / (0.00278 × 0.72 × 160) = 0.120 / 0.3201 = **0.375 ha**. ALL four original distractors (1.8/2.6/3.4/4.2 ha) are off by factor 5–10; correct value 0.375 ha is missing from the option set. Option set rewritten to include the correct value plus plausible distractors.
- **ERROR E4** (`ccb185a1-e572-440f-a3af-8664e7b54499`, peak discharge): Marked correct was `b`=0.136 m³/s. Substituting C=0.68, I=150 mm/hr, A=3.2 ha: Q = 0.00278 × 0.68 × 150 × 3.2 = **0.907 m³/s**. ALL four original distractors (0.0889/0.136/0.204/0.480 m³/s) are off by factor 2–10; correct value 0.907 m³/s is missing from the option set. Option set rewritten.
- **ERROR E5** (`fd8ab0be-1f83-4fa2-a084-7753875e2a37`, mixed-use pipe sufficiency): Marked correct was `a`=0.0724 m³/s discharge (qualitative conclusion "pipe insufficient" is correct, value wrong). Weighted C = 0.50×0.85 + 0.30×0.90 + 0.20×0.25 = **0.745**; Q = 0.00278 × 0.745 × 140 × 1.8 = **0.522 m³/s** (exceeds 200 mm pipe capacity 0.050 m³/s by factor of 10.4). The original value 0.0724 m³/s understates the discharge by a factor of 7.2 (erroneously used C ≈ 0.103). Option set rewritten with correct discharge value.

## Recomputation / verification

- E3: A = Q / (0.00278 × C × I) = 0.120 / (0.00278 × 0.72 × 160) = 0.375 ha.
- E4: Q = 0.00278 × C × I × A = 0.00278 × 0.68 × 150 × 3.2 = 0.907 m³/s.
- E5: C_weighted = 0.50×0.85 + 0.30×0.90 + 0.20×0.25 = 0.745; Q = 0.00278 × 0.745 × 140 × 1.8 = 0.522 m³/s vs 0.050 m³/s capacity.
- Source: PD 1096 NBC storm drainage provisions; Rational Method standard (Linsley, Kohler & Paulhus, *Hydrology for Engineers*).

## Question-edit files written

| Question UUID | Error | Correction |
| --- | --- | --- |
| `668064be-11c5-46f9-876d-6d83bcfdd00f` | E3 | correct_option_id changed from `c` (3.4 ha) to `b` (0.375 ha); option set rewritten with new distractors (0.0375/0.375/3.4/37.5 ha); rationale rewritten with full derivation; replaces earlier batch-043 placeholder edit. |
| `ccb185a1-e572-440f-a3af-8664e7b54499` | E4 | correct_option_id changed from `b` (0.136 m³/s) to `c` (0.907 m³/s); option set rewritten with new distractors; rationale rewritten; replaces earlier batch-043 placeholder edit. |
| `fd8ab0be-1f83-4fa2-a084-7753875e2a37` | E5 | correct_option_id remains `a` (qualitative "No, insufficient") but option a text rewritten with correct discharge 0.522 m³/s; rationale rewritten with weighted-C derivation; replaces earlier batch-043 placeholder edit. |

All JSON validated with `jq empty`. No edits were made to `normalized.md`, `candidate.md`, `original.md`, or `linked-questions.json`.
