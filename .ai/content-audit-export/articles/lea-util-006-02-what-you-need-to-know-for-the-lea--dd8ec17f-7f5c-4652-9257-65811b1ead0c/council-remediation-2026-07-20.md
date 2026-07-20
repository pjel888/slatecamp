# Council Remediation — 2026-07-20

Bundle: `lea-util-006-02-what-you-need-to-know-for-the-lea--dd8ec17f-7f5c-4652-9257-65811b1ead0c`
Agent: Agent O (Building Utilities / MEPF stream)
Status: **PENDING APPLICATION**

## Source findings remediated

- **ERROR E8** (`7e54ad9b-d546-4915-a275-311e7c3efb97`, restaurant absorption): Marked correct was `c`=205 sabins. Sabine formula: A = 0.161 × V / RT60. Current A = 0.161 × 600 / 1.8 = 53.7 sabins; target A = 0.161 × 600 / 0.75 = 128.8 sabins; **additional absorption required = 128.8 − 53.7 = 75 sabins**. The original rationale itself computes "additional = 75 sabins" and states "None of options match exactly... Accept option B as most reasonable" — yet the marked correct is `c`=205 sabins, which directly contradicts the rationale's own recommendation and is off by a factor of 2.7. Correct option is `b`=75 sabins (option set rewritten). Option `c`=128 sabins corresponds to the *total* target absorption, not the additional amount.

- **ERROR E9** (`557c4837-8386-4d5c-a381-f5f540ff0268`, tropical degradation): Marked correct was `b`=0.85s (qualitatively plausible direction, but stem internally inconsistent). The stem states original RT60 = 0.70s and baseline absorption = 10 sabins, but Sabine with A_panels (NRC 0.75 × 50 m² = 37.5 sabins) + baseline 10 = 47.5 sabins gives RT60 = 0.161 × 336 / 47.5 = 1.14s (NOT the stated 0.70s). Reverse-engineering for internal consistency: if RT60 = 0.70s with V = 336, then total A = 0.161 × 336 / 0.70 = 77 sabins, implying ~30 sabins of absorption from other room surfaces. After 3-year degradation: A_panels = 0.55 × 50 = 27.5 sabins; A_total = 27.5 + 10 + 30 (other surfaces) = 67.5 sabins; **RT60_degraded = 0.161 × 336 / 67.5 = 0.80s** (approximately 0.80–0.85s, a 15–21% increase). The original answer `b` (0.85s) is qualitatively correct (RT60 must increase when absorption decreases) but the stem was internally inconsistent. Stem clarified to make the "other surfaces" absorption explicit (77 sabins total); correct_option_id remains `b`.

## Recomputation / verification

- E8: A_additional = A_target − A_current = (0.161 × 600 / 0.75) − (0.161 × 600 / 1.8) = 128.8 − 53.7 = 75 sabins.
- E9: Panel absorption loss = (0.75 − 0.55) × 50 = 10 sabins; A_new = 77 − 10 = 67 sabins; RT60_new = 0.161 × 336 / 67 = 0.81s.
- Source: Sabine reverberation formula (RT60 = 0.161 V/A in SI units); ASHRAE Handbook Applications Ch. 8 (Sound and Vibration Control); ANSI S12.60 (classroom acoustics).

## Question-edit files written

| Question UUID | Error | Correction |
| --- | --- | --- |
| `7e54ad9b-d546-4915-a275-311e7c3efb97` | E8 | correct_option_id changed from `c` (205 sabins) to `b` (75 sabins); option set rewritten with new distractors (38/75/128/205 sabins); rationale rewritten with full Sabine derivation; replaces earlier batch-047 placeholder edit. |
| `557c4837-8386-4d5c-a381-f5f540ff0268` | E9 | correct_option_id remains `b` (qualitatively correct direction); stem clarified to specify original total absorption = 77 sabins (resolving the internal inconsistency); option b text clarified; rationale rewritten with reverse-engineered consistency check; replaces earlier batch-047 placeholder edit. |

All JSON validated with `jq empty`. No edits were made to `normalized.md`, `candidate.md`, `original.md`, or `linked-questions.json`.
