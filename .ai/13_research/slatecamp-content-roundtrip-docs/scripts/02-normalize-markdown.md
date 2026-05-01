# Script Spec: Normalize Markdown

Suggested file:

```text
scripts/content-audit/normalize-markdown.ts
```

## Responsibilities

```text
- read original.md
- detect custom UI blocks
- extract UI blocks
- generate placeholders
- write normalized.md
- write ui-blocks.json
- record parser status
```

## Implementation options

Use a parser if the repo already has one. Otherwise use a conservative scanner first.

For MDX-style components, consider AST tooling only if already available. A conservative regex/state-machine approach is acceptable for MVP if it preserves unknown blocks rather than trying to understand them.

## Conservative rule

When unsure whether something is prose or UI, treat it as protected UI.
