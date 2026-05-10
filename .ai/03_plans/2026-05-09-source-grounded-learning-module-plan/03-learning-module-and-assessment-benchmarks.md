# 03 — Learning Module and Assessment Benchmarks

Generated: `2026-05-09T05:14:46.925474+00:00`

## External benchmark sources checked

The planning pass checked these external references for module and MCQ quality:

- **NBME Item Writing Guide** — https://www.nbme.org/sites/default/files/2021-02/NBME_Item%20Writing%20Guide_R_6.pdf — MCQ/item-writing quality: one-best-answer items, focused stems/lead-ins, plausible distractors, avoid technical item flaws.
- **AERA/APA/NCME Standards for Educational and Psychological Testing** — https://www.aera.net/Publications/Books/Standards-for-Educational-Psychological-Testing-2014-Edition — Validity, reliability, fairness, documentation, and defensible assessment use.
- **APA Standards landing page** — https://www.apa.org/science/programs/testing/standards — Companion source for the Standards book and testing-quality framing.
- **University of Waterloo Centre for Teaching Excellence — Designing Multiple-Choice Questions** — https://uwaterloo.ca/centre-for-teaching-excellence/catalogs/tip-sheets/designing-multiple-choice-questions — MCQ anatomy: question prompt, key, plausible distractors; practical item-writing guidance.
- **Carnegie Mellon Eberly Center — Learning Objectives** — https://www.cmu.edu/teaching/designteach/design/learningobjectives.html — Constructive alignment: objectives, assessments, and instructional strategies must align.
- **Quality Matters Higher Education Rubric Standards** — https://www.qualitymatters.org/qa-resources/rubric-standards/higher-ed-rubric — Course/module design alignment among objectives, assessment, instructional materials, activities, and technology.
- **National Academies — How People Learn II** — https://nap.nationalacademies.org/catalog/24783/how-people-learn-ii-learners-contexts-and-cultures — Learning science: prior knowledge, practice, feedback, transfer, motivation, and context.
- **Retrieval Practice strategies** — https://www.retrievalpractice.org/strategies — Study design: retrieval practice, spacing, interleaving, and metacognitive prompts.
- **CAST Universal Design for Learning Guidelines** — https://udlguidelines.cast.org/ — Accessibility and representation/engagement/action-expression design checks for learning components.
- **Haladyna, Downing & Rodriguez (2002) item-writing guideline review** — https://www.tandfonline.com/doi/abs/10.1207/S15324818AME1503_5 — Scholarly cross-check for MCQ item-writing rules; use as secondary citation only unless full text is available.
- **Voxyz Quill Pack** — https://www.voxyz.ai/marketplace/quill — Voice calibration, draft-only publication control, editable banned-word rules, voice samples, post history, and self-review before release.
- **Research Paper Writing Skills** — https://github.com/Master-cai/Research-Paper-Writing-Skills — Story-before-sentence workflow, one-message-per-paragraph drafting, reverse outlining, claim-evidence alignment, and adversarial review.
- **Anti-AI-Slop Writing** — https://github.com/jalaalrd/anti-ai-slop-writing — Anti-generic prose checks: banned AI phrases, rhythm variation, no fake specificity, no invented anecdotes, and final human-voice audit.
- **Stanford STORM research page** — https://storm-project.stanford.edu/research/storm/ — Pre-writing through diverse perspectives, source-grounded question asking, outline curation, and outline-quality evaluation.
- **Stanford STORM Discover / Co-STORM** — https://storm.genie.stanford.edu/discover — Interactive knowledge-curation prototype; deeper use requires sign-in and generated reports still require important-information checking.

Machine-readable source check: `artifacts/benchmark-source-check.generated.json`.

## Module-design benchmark for SlateCamp

A SlateCamp article should function as an exam-prep learning module, not as a raw knowledge dump.

Required module qualities:

1. **Constructive alignment.** Objectives, explanation, UI components, and linked questions must test the same concept. This follows the alignment principle emphasized by Carnegie Mellon Eberly and Quality Matters.
2. **Specific learning objectives.** Each article should state 2–5 measurable objectives: calculate, distinguish, identify governing section, select compliant option, diagnose violation, etc.
3. **Retrieval-ready design.** Each section should create a memory hook, self-test, trap, or linked question bridge. Retrieval practice and spacing should be intentionally supported.
4. **Transfer to board scenarios.** Articles should explain how the rule or concept appears in LEA-style prompts: drawings, dimensions, occupancy, professional liability, contracts, sequence, or design decision.
5. **Source transparency.** Legal/code claims need official/source-pack locators. Non-legal conceptual claims need source family and confidence level.
6. **Accessibility and UDL.** Visual components must not be the only carrier of meaning; prose must remain complete and screen-reader-safe.

## Article tone standard

Use a board-review tone:

- direct, precise, and exam-oriented;
- no AI meta-commentary;
- no overconfident unsourced legal language;
- define abbreviations on first use;
- distinguish current rule, legacy rule, and common exam trap;
- use Philippine context first where applicable;
- explain why a wrong answer is tempting.


## World-class educator voice gate

The module must feel like it was written by a careful Filipino board-review educator, not by a generic content generator.

Required voice qualities:

1. **Exam-room empathy.** Name the pressure the learner actually faces: confusing tables, similar section numbers, outdated reviewer notes, and drawing-based traps.
2. **Concrete Philippine practice context.** Use local professional scenarios only when they are clearly hypothetical or source-supported. Never invent a real project, client, city incident, or enforcement story.
3. **Human-scale explanation.** Translate dimensions, clearances, periods, and fees into what a candidate can visualize or remember, while keeping exact legal wording source-backed.
4. **Transfer coaching.** Explain how to recognize the rule when the board hides it inside a scenario, plan, occupancy, contract, permit, or liability question.
5. **Mistake diagnosis.** Explain why a wrong answer is tempting before explaining why it fails.
6. **No AI tells.** Avoid generic motivational filler, inflated certainty, repetitive summary language, and invented anecdotes.

Each edited article should include at least two of these educator moves when appropriate:

- a brief "You are here" scenario;
- a "This is why candidates miss it" warning;
- a "Why this number matters" memory anchor;
- a contractor/client/LGU/practice pushback warning stated as a hypothetical;
- a compact board-style decision rule;
- a teach-back or retrieval prompt.

A module that is merely accurate but generic is not a 5. It can be source-safe and still fail the educator-quality gate.


## Pre-writing and human-voice workflow additions

The user-supplied writing references add four process gates before publication:

1. **Perspective-first outline.** Before drafting, ask STORM-style questions from five perspectives: learner, board examiner, practitioner, source auditor, and question writer.
2. **Story before sentences.** Define the article's exam task, source-backed rule, trap, worked example, and practice bridge before editing prose.
3. **Reverse outline.** After drafting, list each paragraph's one message and remove or revise paragraphs that do not support the learning objective.
4. **Anti-slop audit.** Remove generic AI vocabulary, default rule-of-three structures, fake polish, invented specificity, and any unsourced anecdote.

A module can be accurate and still fail if it reads like generic AI output. The final article should sound like a careful board-review teacher who knows which mistake the student is about to make.

## Recommended article module skeleton

```md
# <Article Title>

## What you must be able to answer
- <exam task 1>
- <exam task 2>

## Source status
- Source family: <PD 1096 / BP 344 / etc.>
- Source pack / raw file / official URL: <locator>
- Version warning: <none / source conflict / pending>

## Core rule or concept
<plain-language explanation>

## Board exam pattern
<how the concept appears in LEA questions>

## Exact standards to remember
<only source-backed values, with sections/pages>

## Common traps
<WikiMistakeCard / list candidates>

## Worked example or decision flow
<calculation, scenario, or step sequence>

## Practice bridge
- Linked question IDs: <ids>
- Retrieval prompts: <prompts>

## References
<source family + locator + hash/source-pack ID>
```

## MCQ quality benchmark

Use NBME/Waterloo/Haladyna-style item principles adapted to the LEA:

1. Ask one focused problem.
2. Put the problem in the question prompt, not in scattered option wording.
3. Use one best answer, not opinion or multiple defensible answers.
4. Keep options homogeneous and parallel.
5. Make distractors plausible and diagnostic of misconceptions.
6. Avoid irrelevant trick wording.
7. Avoid negative stems unless legally necessary; if used, emphasize the negative.
8. Avoid `all of the above`, `none of the above`, and clueing patterns unless there is a defensible reason.
9. Rationales must teach: why correct, why each distractor fails, and where the rule comes from.
10. For legal/code questions, cite section/rule/page/source-pack locator.

## MCQ rewrite skeleton

```json
{
  "question_id": "<uuid>",
  "baseline_hash": "sha256:<current-linked-question-hash>",
  "reason": "Source-grounded clarity/accuracy remediation for <article/source family>.",
  "approved_by": "hermes-agent-content-optimizer",
  "approved_at": "<ISO timestamp>",
  "proposed": {
    "text": "<focused LEA-style question prompt>",
    "options": [
      {"id": "A", "text": "..."},
      {"id": "B", "text": "..."},
      {"id": "C", "text": "..."},
      {"id": "D", "text": "..."}
    ],
    "correct_option_id": "<id>",
    "rationale": {
      "correct": "<why source supports the key>",
      "A": "<why option A is correct or wrong>",
      "B": "<why option B is correct or wrong>",
      "C": "<why option C is correct or wrong>",
      "D": "<why option D is correct or wrong>",
      "takeaway": "<one sentence the learner should remember>",
      "source_locator": "<source pack/source file + section/page>"
    }
  }
}
```

## Quality rubric

Score each article/question cluster before publish:

- **5 — Source-grounded and exam-ready:** all legal/code claims have locators; module teaches application; linked questions align.
- **4 — Strong but minor gaps:** minor prose/UX issues, no critical fact risk.
- **3 — Usable draft:** core facts likely right, but locators or linked-question alignment incomplete.
- **2 — Source-risk draft:** useful content but legal/code claims lack verification.
- **1 — Do not publish:** unsupported, outdated, contradictory, or pedagogically confusing.

Only 4–5 should be candidates for publication. Legal/code articles require 5 for factual claims even if prose quality is 4.
