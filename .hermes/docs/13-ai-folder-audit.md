# `.ai` Folder Audit

The `.ai` folder is valuable only if it stays aligned with the live repository.

## Audit checklist

- Does each `.ai` claim match current files?
- Does it mention deleted paths, renamed modules, or obsolete workflows?
- Does it omit major new features or architecture changes?
- Does it contain TODOs that are already resolved?
- Does it contain instructions that conflict with current user goals?

## Audit output

```text
Still accurate:
Stale or wrong:
Missing:
Recommended updates:
High-risk contradictions:
```

## Rule

Do not change `.ai` automatically during audit unless the user asks for documentation updates.
