# Question Round-Trip Future

This milestone exports linked questions. It does not need to fully implement question editing/pushing, but the design should not block it.

## Future local structure

```text
question-edits/
  <question_id>.json
  <question_id>.diff.json
```

## Question push should be explicit

```bash
pnpm content-audit:push-question --question <question_id> --apply
```

## Required stale check

Hash current question fields before pushing. Compare with exported question hash.

## Why separate from article push

Article edits and question edits have different risks. Updating them together can hide answer-key changes.
