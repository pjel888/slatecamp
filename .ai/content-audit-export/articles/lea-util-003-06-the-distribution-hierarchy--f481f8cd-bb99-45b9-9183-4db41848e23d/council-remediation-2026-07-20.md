# Council Remediation — 2026-07-20

Bundle: `lea-util-003-06-the-distribution-hierarchy--f481f8cd-bb99-45b9-9183-4db41848e23d`
Agent: Agent O (Building Utilities / MEPF stream)
Status: **PENDING APPLICATION**

## Source findings remediated

- **ERROR E6** (`3d0302ae-a364-44cc-97b5-f88c8daebf4a`, 15-story mixed-use electrical distribution): Internally contradictory option a. Option a text specifies "#2/0 AWG penthouse feeder (acceptable voltage drop 4.1%)" but the rationale computes "#2/0 AWG yields Vd ≈ 6.7% (unacceptable); #4/0 AWG yields Vd ≈ 4.3% (acceptable)" and recommends upsizing to #4/0 AWG. #2/0 AWG cannot simultaneously be "acceptable at 4.1%" and yield "6.7% unacceptable". Independent recomputation (copper K=12.9, 75°C) confirms #2/0 AWG gives 8.75% Vd (unacceptable) and #4/0 AWG gives 5.5% Vd (marginal but acceptable). Option a text rewritten to specify #4/0 AWG with the correct drop percentage (~5.5%); correct_option_id remains `a` since the rest of option a (1500 kVA transformer, dual 1500 A bus ducts, dual ground rods at 2.5 Ω) is consistent with the rationale and the demand-load derivation (1500 kW × 0.75 = 1125 kW; kVA = 1125 / 0.92 PF = 1222 kVA; select 1500 kVA).

## Recomputation / verification

- Penthouse current I = 180 kW / (√3 × 380V × 0.9 PF) = 304 A.
- #2/0 AWG (67.4 mm²) Vd over 200 m at 75°C: Vd = √3 × 0.0213 × 200 × 304 / 67.4 = 33.2 V = 8.75% (unacceptable).
- #4/0 AWG (107.2 mm²) Vd over 200 m: Vd = √3 × 0.0213 × 200 × 304 / 107.2 = 20.9 V = 5.5% (marginal but acceptable per PEC Art. 2.5.4).
- Source: PEC Part 2 Article 2.5.4 (Voltage Drop, recommended max 5% feeder + 5% branch); PEC Articles 2.6.1–2.6.3 (Switchgear); Part 4 Article 4.1.3 (grounding electrode system).

## Question-edit files written

| Question UUID | Error | Correction |
| --- | --- | --- |
| `3d0302ae-a364-44cc-97b5-f88c8daebf4a` | E6 | correct_option_id remains `a`; option a text rewritten to specify `#4/0 AWG penthouse feeder (voltage drop approximately 5.5% over 200 m run)` instead of the contradictory `#2/0 AWG ... 4.1%`; rationale rewritten with full recomputation; replaces earlier batch-041 placeholder edit. |

All JSON validated with `jq empty`. No edits were made to `normalized.md`, `candidate.md`, `original.md`, or `linked-questions.json`.
