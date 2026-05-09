# 09 — Quality Hardening and World-Class Educator Gate

Generated: `2026-05-09T05:14:46.925474+00:00`

## Standing standard

All content-production prompts must begin with:

> Read and apply `.ai/CONTENT_EXCELLENCE_GOAL.md` before producing any content artifact.

## Honest readiness status

This plan pack, paired with `.ai/CONTENT_EXCELLENCE_GOAL.md`, is strong enough to start Phase 0 readiness work. It is not, by itself, a guarantee that future articles/questions will be world-class or non-AI-sounding.

A document can constrain risk, but quality comes from execution: source verification, skilled editing, independent review, learner-centered examples, and tight publication gates.

## Hard no-go before scaled editing

Do not begin scaled article/question editing until these are complete:

1. Source coverage matrix for all 567 articles and 7,159 linked questions.
2. Source-pack integrity audit confirming metadata, locator, chunk text, and hashes agree.
3. Quarantine or rebuild of any mislabeled pack, especially `source-pack-ra-9514-rirr` until actual RA 9514 RIRR chunks are verified.
4. Source-ledger schema and validator.
5. Dedicated validator for `question-edits/<question_id>.json`.
6. One approved SlateCamp voice calibration pack: sample article excerpt, sample rationale, banned phrases, preferred rhythm, and flat-to-alive examples.
7. One approved gold-standard example each for:
   - legal/code article;
   - professional-practice article;
   - history/theory article;
   - technical systems/materials article;
   - MCQ remediation with teaching rationale.

## World-class educator rubric

A publishable SlateCamp module must pass all five gates.

### Gate 1 — Truth

- Every legal/code/dimensional claim has a locator.
- Source version and conflict status are visible.
- Unsupported claims are removed, softened, or marked pending.
- Answer-key changes have source locator, independent review, and human/SME approval when high risk.

### Gate 2 — Teaching

- The article begins with what the candidate must be able to answer.
- Objectives, explanation, components, and linked questions align.
- The explanation moves from concept to application to exam trap.
- The learner gets retrieval prompts, not just passive reading.

### Gate 3 — Human voice

- The writing is direct, precise, and locally contextual.
- Scenarios are clearly hypothetical unless sourced.
- Dimensions and procedures are anchored to memory or practice without exaggerating.
- Wrong answers are explained as understandable mistakes, then corrected.
- The prose avoids generic AI cadence, empty encouragement, and overconfident legal phrasing.

### Gate 4 — Platform safety

- Edits are in `normalized.md` only.
- Question changes are in `question-edits/<question_id>.json` only.
- `candidate.md` is generated, never hand-written.
- Existing UI placeholders are preserved or intentionally repaired.
- Compose, diff, validate, dry-run, review, apply, and remote verification are all evidenced.


### Gate 5 — Curation and prose discipline

- The article has a pre-writing outline built from learner, examiner, practitioner, source-auditor, and question-writer perspectives.
- The final draft passes reverse outlining: one paragraph, one message, with a visible link to the learning objective.
- The prose avoids generic AI cadence, default rule-of-three lists, flat summaries, fake polish, and unsourced specificity.
- Voice is checked against approved SlateCamp exemplars before any batch-scale work.
- External curation tools are treated as lead generators only; important information is verified against local/official sources before use.

## Gold exemplar requirement

Before scaling, create and review gold examples. Each exemplar should include:

- before/after article excerpt;
- claim ledger excerpt;
- linked question before/after;
- rationale showing why distractors are plausible;
- source locator evidence;
- component decision notes;
- reviewer memo explaining why the result feels human and useful;
- reverse outline showing each paragraph message;
- anti-slop checklist showing removed generic phrases or confirming none remain.

No worker should batch-edit without these examples as the standard.

## Quality score interpretation

- **5:** Source-grounded, exam-ready, human, teachable, and platform-safe.
- **4:** Safe and useful, but needs minor educator polish.
- **3:** Good draft, not publish-ready.
- **2:** Source or teaching risk. Hold.
- **1:** Unsafe, confusing, unsupported, or generic AI output. Block.

Legal/code articles need a **5 on truth** even if prose quality is otherwise strong.
