# 02 — Article Editing Rules

## Source-of-truth hierarchy inside a bundle

| File | Role | Editable? |
| --- | --- | --- |
| `original.md` | Immutable Supabase export baseline | No |
| `normalized.md` | Main article editing surface | Yes |
| `ui-blocks.json` | Exact preserved UI/custom blocks | No by default |
| `candidate.md` | Generated recomposition for push | No manual edits |
| `diff-report.json` | Generated local safety report | No manual edits |
| `push-report.json` | Generated remote safety report | No manual edits |

## Placeholder preservation

A normalized article may contain UI placeholders like:

```text
[SLATECAMP_UI_BLOCK:block_0001 component="RampInteractiveDiagram" status="preserved"]
Extracted summary:
- Props: slope="1:12", width="1200mm"
- Text: Ramps must provide safe accessible movement.
[/SLATECAMP_UI_BLOCK]
```

Rules:

- Do not delete the opening marker.
- Do not delete the closing marker.
- Do not change the `block_id`.
- Do not change the component name.
- Do not rewrite the extracted summary as a substitute for editing the raw UI block.
- Keep placeholders near the surrounding prose they contextualize.

The placeholder summary is for readability. The raw UI block in `ui-blocks.json` is the preserved truth used for recomposition.

## Article edit classes

### Safe routine edits

Safe routine edits may be made directly in `normalized.md`:

- Fix typographical errors.
- Clarify awkward grammar while preserving meaning.
- Normalize headings and list formatting.
- Remove duplicated sentences.
- Add source labels that are already present in `sources.json`.

### Source-backed factual edits

Factual edits require evidence notes in the review issue or adjacent editor notes:

- State the old claim.
- State the corrected claim.
- Cite a source from `sources.json` or an approved external primary source.
- Note linked question impact.

### High-risk edits

High-risk edits require human review before apply:

- Legal/code requirement changes.
- Numerical requirement changes.
- Date, law title, section, rule, or exception changes.
- Answer-key impacts for linked questions.
- Changes near custom UI placeholders.
- Any edit requiring `--force`.

## UI block edits

Current policy: **raw UI block edits are not supported in this milestone**.

The current compose path rebuilds `candidate.md` from `normalized.md` placeholders and preserved `ui-blocks.json` raw content. It does not apply proposed raw content from `ui-block-edits.json`.

`ui-block-edits.json` is only a ledger/future validation aid. The validation command checks that proposed edits are well-formed and reviewable metadata; it does not authorize, apply, or recompose those edits:

```bash
bun run content-audit:ui-block-edits -- --article-id <article_id>
```

If a raw UI block must change, stop the article push and create a follow-up implementation task for a supported UI-block edit compose/apply path. Do not hand-edit `ui-blocks.json` or `candidate.md` to bypass this limitation.

## Candidate discipline

`candidate.md` is generated output, not an editing surface.

If `candidate.md` needs to change:

1. Edit `normalized.md`. Raw UI sidecar proposals are ledger-only and do not affect `candidate.md` in this milestone.
2. Run compose again:

   ```bash
   bun run content-audit:compose -- --article-id <article_id> --overwrite
   ```

3. Re-run diff and validation.

## Formatting rules

- Keep markdown headings meaningful and hierarchical.
- Prefer short paragraphs for reviewability.
- Preserve tables unless a source-backed correction requires changing them.
- Do not reflow large sections only for style.
- Do not convert custom syntax to plain markdown if it was preserved as a UI block.
- Do not remove citations, source labels, or code citations unless replacing them with better evidence.

## Edit decision matrix

| Situation | Action | Required artifact |
| --- | --- | --- |
| Typo or grammar only | Edit `normalized.md`. | Diff/validate reports. |
| Factual statement with source support | Edit `normalized.md`. | Review packet fact-check record. |
| Factual statement unclear | Do not assert correction. | Blocker escalation note. |
| Linked question wording affected | Draft question edit. | `question-edits/<question_id>.json`. |
| Answer key affected | Stop for reviewer approval. | Source-backed question edit + approval metadata. |
| UI raw block appears wrong | Do not edit raw UI. | Follow-up implementation task. |
| Component suggestion looks useful | Do not auto-insert. | Future component recommendation task, if desired. |

## Completion criteria for article edits

An article edit is locally complete only when:

- `normalized.md` contains the intended edits.
- UI placeholders remain resolvable.
- `candidate.md` has been regenerated.
- `diff-report.json` and `validation-report.json` have no blockers.
- Push dry-run has no blockers.
- Any linked question impact has a separate question edit file or an explicit no-change note.
