# 08 — Quality Rubric and Pilot Playbook

## Quality rubric

Use this rubric before marking an edit ready for review or apply.

| Dimension | Pass standard | Blocker examples |
| --- | --- | --- |
| Scope control | Edit addresses the stated article/question issue only. | Broad rewrite, new claims, unrelated style sweep. |
| Source fidelity | Factual changes are backed by a named source and section/page where practical. | Citation invented, source only loosely related, legal section missing for code requirement. |
| UI preservation | Placeholders remain intact and raw UI blocks remain unchanged. | Missing placeholder, changed `block_id`, edited `ui-blocks.json`, hand-edited `candidate.md`. |
| Question alignment | Linked question impact is either explicitly none or represented in `question-edits/<question_id>.json`. | Article correction changes an answer but no question review is recorded. |
| Recomposition | `candidate.md` is generated from `normalized.md` and `ui-blocks.json`. | Candidate manually edited or compose report has blockers. |
| Diff clarity | Diff is understandable and limited to intended prose changes. | Diff includes unrelated formatting churn or UI block movement. |
| Push safety | Dry-run passes stale/hash/placeholder/UI-block checks. | Remote stale, unresolved placeholders, unsafe diff, missing reports. |
| Reviewability | Review packet explains intent, evidence, commands, and decision. | Reviewer must infer why changes exist from diff alone. |

## Risk tiers

### Tier 0 — Mechanical cleanup

Examples:

- Typo fixes.
- Markdown heading/list cleanup.
- Removing duplicated words.

Required evidence:

- Compose, diff, validate.
- Push dry-run if apply is planned.

### Tier 1 — Factual wording with stable answer key

Examples:

- Clarifying a definition.
- Adding a source label.
- Correcting a non-numeric factual phrase.

Required evidence:

- Review packet with source record.
- Linked question impact note.
- Compose, diff, validate, push dry-run.

### Tier 2 — Legal/code/numeric correction

Examples:

- PD 1096, BP 344, RA 9514, PRC/PRBOA requirement changes.
- Required dimensions, dates, exemptions, section/rule references.

Required evidence:

- Primary source or official regulator source.
- Exact section/rule/table/page when available.
- Human review before apply.
- Linked question answer-key review.

### Tier 3 — Answer-key or assessment logic change

Examples:

- Changing `correct_option_id`, `correct_value`, `accepted_answers`, `options`, or scoring tolerance.

Required evidence:

- Question edit file.
- Source-backed reason.
- Reviewer approval in `approved_by` / `approved_at`.
- Question dry-run before question apply.
- Separate article apply and question apply decisions.

## Dry-run-only pilot playbook

Before broad editorial use, run one no-apply pilot.

### Pilot article selection

Choose one article that has:

- At least one linked question.
- At least one source row.
- A manageable diff target.
- Preferably at least one UI placeholder, so preservation is exercised.

Avoid first pilot articles with:

- Unknown/unparseable critical UI blocks.
- Major legal/code rewrites.
- Multiple answer-key changes.
- Stale export baseline.

### Pilot sequence

1. Read the protocol README and this playbook.
2. Select the article and create a review packet.
3. Make a small edit in `normalized.md`.
4. If a linked question is affected, create one `question-edits/<question_id>.json` draft but do not apply it.
5. Run:

   ```bash
   bun run content-audit:compose -- --article-id <article_id> --overwrite
   bun run content-audit:diff -- --article-id <article_id> --summary
   bun run content-audit:validate -- --article-id <article_id> --summary
   bun run content-audit:push:dry-run -- --article-id <article_id>
   ```

6. If a question edit was drafted, run:

   ```bash
   bun run content-audit:push-question:dry-run -- --question-id <question_id>
   ```

7. Stop. Do not apply during the pilot unless a separate explicit approval is recorded.
8. Update `.ai/03_plans/content-audit-editor-protocol/README.md` with pilot status and friction notes.

## Pilot success criteria

- Editor can find the correct bundle and required files without extra instructions.
- Review packet captures intent, evidence, question impact, and command outputs.
- Compose/diff/validate/push dry-run reports are understandable.
- UI placeholders remain intact.
- No live Supabase data is changed.
- Any protocol confusion is logged as a docs follow-up.

## Common failure paths

| Failure | Meaning | Required response |
| --- | --- | --- |
| Stale remote content | Supabase article changed after export. | Re-export before editing/pushing. |
| Unresolved placeholder | `normalized.md` placeholder was damaged or not recomposed. | Restore placeholder from prior diff or re-normalize from original. |
| UI block count mismatch | Preserved raw UI did not reinsert exactly. | Stop; inspect `ui-blocks.json`, compose report, and diff report. |
| Unsafe diff | Local diff includes unsupported or unexplained changes. | Narrow edit; rerun compose/diff/validate. |
| Unknown critical block | Parser could not classify a custom block. | Do not force unless reviewed; prefer parser/code follow-up. |
| Question stale hash | Remote question changed after export. | Re-export article bundle before question push. |
| Source uncertainty | Evidence is insufficient or conflicting. | Mark review blocked; do not convert uncertainty into a factual correction. |

## Graduation criteria

Move from pilot to batch editing only after:

- At least one dry-run-only article pilot succeeds.
- At least one linked question dry-run succeeds if question edits are in scope.
- Reviewers agree that packet templates contain enough context.
- The protocol has been updated for any pilot confusion.
- Bulk apply remains disabled in practice unless a separate batch approval process exists.
