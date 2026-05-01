# Git and Storage Policy

The generated export can probably fit in the repo workspace, but decide what gets committed.

## Commit these

```text
scripts/
docs/
prompts if any
schemas
migration or type updates if needed
```

## Usually gitignore these

```text
.ai/content-audit-export/articles/**/original.md
.ai/content-audit-export/articles/**/candidate.md
.ai/content-audit-export/articles/**/diff-report.json
.ai/content-audit-export/runs/
```

## Maybe commit these if useful

```text
.ai/content-audit-export/component-inventory/component-fit-notes.md
.ai/content-audit-export/component-inventory/components.json
.ai/content-audit-export/component-inventory/component-usage-in-articles.json
```

## Recommended `.gitignore` policy

If the content is public and the team wants Codex/Kimi to analyze it locally, keeping generated exports in the workspace is fine. But avoid accidental commits by default unless intentionally versioning content.

A safe approach:

```text
- commit scripts and docs
- gitignore generated exports
- optionally commit a small sample export for testing
```
