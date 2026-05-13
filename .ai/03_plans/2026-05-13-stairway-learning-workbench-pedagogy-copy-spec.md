# Stairway Learning Workbench — Pedagogy, Curriculum, and Copy Specification

Date: 2026-05-13
Status: planning specification
Purpose: prevent the redesign from becoming only a prettier configurator. This module must teach stair-code reasoning for LEA candidates.

## 1. Teaching promise

The workbench teaches candidates to reason from scenario to law to dimension to correction.

The learner should finish the module able to:

1. identify riser, tread, width, handrail, headroom, landing/vertical rise, and egress requirements;
2. determine which law is active for a given project condition;
3. recognize cross-law conflicts;
4. distinguish legal requirements from comfort guidance;
5. correct a noncompliant stair;
6. transfer the learning to 2D diagrams and text-only ALE-style questions.

## 2. Learning science model

Use these methods intentionally:

- Worked examples: first show a correct stair and explain why it passes.
- Productive failure: give a flawed scenario before revealing the exact threshold.
- Contrasting cases: same geometry, different legal condition.
- Retrieval practice: ask the learner to recall the rule before showing it again.
- Fading: move from 3D support to 2D diagram to text-only exam item.
- Error-based feedback: explain why the wrong interpretation is tempting.

## 3. Mode curriculum

### Learn mode

Purpose:
- build vocabulary and measurement competence.

Sequence:
1. What is being measured?
2. Where is it visible in the model?
3. Which law or guidance may govern it?
4. What mistake do exam candidates make?
5. Quick recall check.

Example copy:

“Riser height is the vertical distance from one tread surface to the next. In exam questions, do not judge the number alone. First ask whether the stair is ordinary, accessible-route-related, BP 220 housing, or a required exit stair.”

### Diagnose mode

Purpose:
- teach violation recognition and correction.

Sequence:
1. Load a flawed scenario.
2. Ask: “Which dimension fails first?”
3. Learner selects element or answer.
4. Reveal diagnosis.
5. Show smallest correction.

Example prompt:

“This stair serves a required exit. It looks usable, but one dimension now fails a stricter life-safety check. Select the failing dimension before opening the citation.”

### Compare mode

Purpose:
- teach law applicability.

Sequence:
1. Show one geometry.
2. Switch scenario condition.
3. Show active law change.
4. Ask learner to explain the changed result.

Example prompt:

“The stair geometry did not change. Only the project condition changed. Which law became active, and why did the result change?”

### Sandbox mode

Purpose:
- allow exploration and self-explanation.

Sequence:
1. all controls unlocked;
2. learner changes values;
3. module shows live delta feedback;
4. learner can reset or create a deliberate violation.

Example helper:

“Use Sandbox to test cause and effect. A passing stair can fail when the scenario changes, even if the geometry stays the same.”

### Challenge mode

Purpose:
- transfer to exam performance.

Sequence:
1. scenario prompt;
2. hidden hints;
3. learner identifies dimension, law, correction;
4. feedback explains answer;
5. optional source/citation reveal.

Example prompt:

“A commercial stair is marked as a required exit. The riser is 185 mm and tread depth is 250 mm. Which statement best describes the compliance issue?”

## 4. Required misconception library

The UI and challenge feedback should explicitly address these mistakes:

1. “If it passes PD 1096, it automatically passes everything.”
2. “A comfortable stair is always legally compliant.”
3. “BP 220 values apply to all residential stairs.”
4. “Accessible route means every stair rule becomes BP 344 only.”
5. “Required exit stair is just a label; dimensions stay the same.”
6. “When laws differ, average the numbers.”
7. “International/IBC/ADA references are Philippine requirements.”
8. “Handrail height is a decorative preference.”
9. “Width is only a comfort issue, not an egress issue.”
10. “A 3D passing status replaces source/citation checking.”

## 5. Copy rules

### Tone

Use board-review clarity:

- direct;
- source-aware;
- no motivational fluff;
- no AI-style “delve,” “landscape,” “crucial,” “pivotal,” or decorative prose;
- short explanations tied to exam action.

### Labels

Preferred labels:
- “Active laws”
- “Core geometry”
- “Critical fixes”
- “Why this applies”
- “Smallest correction”
- “Legal requirement”
- “Comfort guidance”
- “Comparison only”
- “Source audit pending”

Avoid labels:
- “AI analysis”
- “smart insight”
- “magic fix”
- “guaranteed compliant”
- “official approval”

## 6. Fix-card copy patterns

### Legal failure

Template:

“`{Dimension}` is `{actual}`. For this scenario, `{law}` requires `{limit/range}`. Fix by `{action}`.”

Example:

“Riser height is 185 mm. For this required-exit scenario, the active RA 9514 check is stricter than the baseline stair setting. Fix by lowering riser height to the active limit or re-checking whether the stair is actually a required exit.”

### Cross-law conflict

Template:

“`{Law A}` and `{Law B}` do not point to the same design threshold. Do not average them. Confirm the project classification and apply the governing condition.”

### Comfort warning

Template:

“This is a comfort/design warning, not a Philippine legal violation. Use it to judge stair usability, but do not cite it as the governing code requirement.”

### Source pending

Template:

“This value is currently backed by the module constants. Treat source text as pending until the raw law source excerpt is audited and linked.”

## 7. Checkpoint question types

Every dimension should eventually support at least one checkpoint question.

### Recognition

“Which part of the stair is the tread depth?”

### Applicability

“Which law becomes active when the stair is part of an accessible route?”

### Diagnosis

“What is the first failing dimension in this scenario?”

### Correction

“What is the smallest change that fixes the violation?”

### Conflict reasoning

“The stair passes one rule but fails another. What should the designer check first?”

### Exam transfer

“Given a 2D section with riser/tread labels, identify the noncompliant dimension.”

## 8. Deliberate error presets

Create these as future presets or challenge cases:

1. Over-high riser.
2. Under-depth tread.
3. Narrow required exit stair.
4. Insufficient headroom.
5. Handrail height outside active range.
6. Excessive vertical rise without landing trigger.
7. Accessible route width/handrail conflict.
8. Comfortable but legally failing.
9. Legally passing but comfort warning.
10. Same geometry, law changed by scenario toggle.

## 9. Exam-transfer ladder

The module should fade assistance in this order:

1. 3D model + visible thresholds + full explanation.
2. 3D model + hidden threshold until answer.
3. 2D section/elevation diagram + dimension labels.
4. 2D plan/section with incomplete labels.
5. Text-only ALE-style item.
6. Mixed timed review with similar but not identical values.

## 10. Source/legal teaching rules

For every learner-facing rule:

- identify source law;
- identify whether it is verified, pending, comparison-only, or unverified;
- show applicability condition;
- distinguish legal violation from comfort/design guidance.

Do not show exact source quotes until source audit has extracted and verified them from raw PDFs.

## 11. Content acceptance criteria

The pedagogy layer is ready when:

- every mode has a distinct learning purpose;
- each dimension has a teaching note, misconception, and checkpoint type;
- fix cards use learner-action language, not raw error messages;
- legal/comparison/comfort guidance are visually and textually distinct;
- challenge mode asks for dimension + law + correction;
- the module can produce at least one 3D-to-2D-to-text transfer path.
