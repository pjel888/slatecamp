# 08 — Worker Brief Template

Use this template for future article/question editing workers. It is intentionally strict.

**Mandatory preamble for every worker:** Read and apply `.ai/CONTENT_EXCELLENCE_GOAL.md` before producing any content artifact.

## Mission

Improve one SlateCamp article and its linked questions as a source-grounded LEA learning module.

## Inputs

- Article folder: `<path>`
- Article ID: `<uuid>`
- Slug/title: `<slug/title>`
- Taxonomy node: `<node>`
- Source family: `<PD 1096 / BP 344 / etc.>`
- Source status: `<READY_SOURCE_PACK / LOCAL_RAW_NEEDS_RECONCILIATION / ...>`
- Approved source packs/raw files: `<paths>`
- Linked question IDs: `<ids>`
- Existing UI blocks: `<component counts>`

## Non-goals

- Do not edit `original.md`.
- Do not hand-write `candidate.md`.
- Do not edit `linked-questions.json` directly.
- Do not invent legal/code facts.
- Do not change answer keys unless explicitly assigned and source-reviewed.
- Do not push to Supabase.

## Required output files

- Edited `normalized.md` only if article edits are authorized.
- `question-edits/<question_id>.json` only if question edits are authorized.
- `source-ledger/<article_id>.json` or batch equivalent.
- Review memo.

## Educator-quality checklist

The article must read like careful board-review teaching, not generic AI prose. Include appropriate exam-task framing, common trap diagnosis, concrete Philippine practice context, and human-scale explanation. Any real-world story must be sourced or clearly hypothetical. Do not invent incidents, clients, enforcement stories, or practice anecdotes.

Use the added writing-quality gates from Quill, Research Paper Writing Skills, Anti-AI-Slop Writing, and STORM:

- calibrate against an approved SlateCamp voice exemplar when one exists;
- draft only, never publish or push;
- build a perspective-first outline before prose;
- keep one paragraph to one message;
- reverse-outline after drafting;
- run an anti-slop audit for banned generic phrases, fake polish, identical paragraph structure, and unsourced specificity.

## Article task checklist

1. Read all local article files.
2. Identify existing UI placeholders and block IDs.
3. Build claim ledger before rewriting.
4. Build a STORM-style perspective map: learner, examiner, practitioner, source auditor, question writer.
5. Draft a mini-outline before editing prose: exam task, source-backed rule, trap, worked example, practice bridge.
6. Remove or mark unsupported legal/code claims.
7. Add exam-task framing and learning objectives.
8. Improve explanations for application and transfer.
9. Add common traps only when source-supported.
10. Keep UI blocks intact or modify by roundtrip protocol.
11. Reverse-outline the draft and confirm one message per paragraph.
12. Run anti-slop audit and remove generic AI phrasing.
13. Compose, diff, validate.
14. Report changed files and unresolved risks.

## Question task checklist

1. Verify each linked question's baseline.
2. Map each question to article objective.
3. Check stem, key, distractors, rationale, and source locator.
4. Write `question-edits/<question_id>.json` for authorized changes.
5. Flag answer-key risks separately.
6. Validate and report.

## Reviewer prompt

Review the proposed article/question changes for:

- source accuracy;
- legal/code locator sufficiency;
- article-question alignment;
- MCQ item-writing quality;
- UI roundtrip safety;
- unsupported or overconfident claims;
- answer-key risk;
- publication readiness;
- whether the prose feels like a world-class educator: precise, humane, locally contextual, and free of generic AI filler;
- whether the outline was curated before drafting, not retrofitted after;
- whether the reverse outline proves every paragraph supports the article objective;
- whether any banned AI phrase, invented specificity, or fake anecdote remains.

Return:

- `PASS`, `PASS_WITH_FIXES`, or `BLOCK`;
- exact blockers;
- exact file/line references;
- source conflicts;
- recommended action.
