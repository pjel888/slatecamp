# Script Spec: Compose Candidate Article

Suggested file:

```text
scripts/content-audit/compose-candidate.ts
```

## Responsibilities

```text
- read normalized.md
- read ui-blocks.json
- replace placeholders with raw UI blocks
- write candidate.md
- validate that all UI blocks are accounted for
```

## Placeholder mismatch behavior

If normalized.md references a missing block id:

```text
abort
write compose-error.json
```

If ui-blocks.json contains an unused block id:

```text
warn
mark safe_to_push = false unless explicitly allowed
```
