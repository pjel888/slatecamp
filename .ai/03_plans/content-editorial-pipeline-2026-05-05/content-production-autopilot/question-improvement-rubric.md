# SlateCamp Question Improvement Rubric

Each publish-ready question edit must:

1. Preserve the correct answer unless evidence proves it is wrong.
2. Log any answer-key change separately with source evidence.
3. Make distractors plausible, not random.
4. Avoid length, specificity, and phrasing giveaways.
5. Ensure every option is unique and unambiguous.
6. Make the rationale teach the concept, not merely restate the answer.
7. Anchor legal/code claims to source evidence where applicable.
8. Keep Bloom level, difficulty, and practice context aligned, or correct them only with evidence.
9. Use `question-edits/<question_id>.json`; never edit `linked-questions.json` directly.
10. Quarantine ambiguous or unsupported items.

Validation gates:
- correct option ID exists in options
- no duplicate option text
- rationale supports correct option
- no unsupported legal/code claim
- JSON schema valid
- baseline hash present
