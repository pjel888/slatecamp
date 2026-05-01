# Question Round-Trip Future

This milestone exports linked questions and now includes an explicit stale-safe question push command. Question edits remain separate from article push and require a local question-edits sidecar plus --apply.

## Future local structure

```text
question-edits/
  <question_id>.json
  <question_id>.diff.json
```

## Question push should be explicit

```bash
bun run content-audit:push-question:apply -- --question-id <question_id>
```

## Required stale check

Hash current question fields before pushing. Compare with exported question hash.

## Why separate from article push

Article edits and question edits have different risks. Updating them together can hide answer-key changes.
