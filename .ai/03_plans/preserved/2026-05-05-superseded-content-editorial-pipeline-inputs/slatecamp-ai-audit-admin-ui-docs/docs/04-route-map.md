# Route Map

Use the existing SlateCamp admin routing conventions. The exact file paths depend on the repository structure. Codex should inspect the repo first.

## Required routes

```text
/admin/ai-audit
/admin/ai-audit/articles
/admin/ai-audit/questions
/admin/ai-audit/findings
/admin/ai-audit/runs
```

## Optional detail routes

These may be separate pages or implemented as drawers/modals from the table.

```text
/admin/ai-audit/articles/[articleId]
/admin/ai-audit/questions/[questionId]
/admin/ai-audit/findings/[findingId]
/admin/ai-audit/runs/[runId]
```

## Recommended layout

`/admin/ai-audit` should include tabs or internal navigation:

```text
Overview | Articles | Questions | Findings | Runs | Settings/Future
```

Settings can be omitted from MVP or shown as a disabled/future tab.

## Navigation label

Add an admin nav item:

```text
AI Audit
```

Suggested icon semantics:

- shield/check,
- clipboard check,
- radar/scope,
- activity/log.

Use existing icon library.

## Route authorization

Every route must be admin-only. Reuse existing admin protection. Do not create a public route.
