# Local Editing Rules

## Safe article editing

Edit `normalized.md` for prose changes.

Do not edit `original.md`.

Do not edit UI block placeholders unless you know how they map to `ui-blocks.json`.

## UI block editing

By default, UI blocks are preserved exactly.

If a UI block must be edited, create an explicit edited block record rather than modifying raw content invisibly.

Recommended generated sidecar:

```text
ui-block-edits.json
```

Each edit should include:

```text
block_id
old_raw
new_raw
why_changed
edited_by
created_at
validation_status
```

## Question editing

Do not edit `linked-questions.json` directly unless the implementation supports diffing and pushing question updates safely.

Preferred future folder:

```text
question-edits/
  <question_id>.json
```

## Candidate generation

`candidate.md` should always be generated, not manually edited.

If a human edits `candidate.md`, the system should warn that the edit may not round-trip.
