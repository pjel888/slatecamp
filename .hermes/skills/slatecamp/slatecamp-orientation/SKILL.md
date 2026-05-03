---
name: slatecamp-orientation
description: Codebase orientation workflow for Slatecamp. Use when starting a new session, auditing the .ai folder, mapping architecture, or preparing a Codebase Orientation Report before edits.
version: 1.0.0
metadata:
  hermes:
    category: slatecamp
    tags: [slatecamp, workflow]
---

# Slatecamp Orientation

## When to Use

Use this when the user asks Hermes to understand Slatecamp, audit the `.ai` folder, map the codebase, prepare for implementation, or produce a repository orientation report.

## Procedure

1. Confirm the task is read-only unless the user explicitly requested implementation.
2. Inspect `.ai/` first, then README/docs, Git status/history, manifests, config, source tree, and tests.
3. Compare `.ai` claims against the current repo.
4. Map architecture, data flow, state flow, commands, deployment, and risk areas.
5. Produce the Codebase Orientation Report.

## Verification

- Cite file paths inspected.
- Identify stale or unverified notes.
- Separate facts from inferences.

## Output

Use `templates/codebase-orientation-report.md`.
