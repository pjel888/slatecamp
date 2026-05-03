---
name: slatecamp-feature-planner
description: Feature planning workflow for Slatecamp. Use when defining scope, acceptance criteria, implementation steps, affected files, risks, and verification before building a feature.
version: 1.0.0
metadata:
  hermes:
    category: slatecamp
    tags: [slatecamp, workflow]
---

# Slatecamp Feature Planner

## When to Use

Use before implementing a new feature or changing product behavior.

## Procedure

1. Identify the user problem and desired outcome.
2. Inspect existing flows, adjacent components, data paths, tests, and docs.
3. Define scope and out-of-scope boundaries.
4. Identify affected files and likely commands.
5. Write a narrow implementation plan.
6. Implement only after the plan is clear or the user asked for direct execution.

## Pitfalls

- Planning from assumptions instead of files.
- Expanding scope into a redesign.
- Adding dependencies before checking current tools.

## Output

Use `templates/implementation-plan.md` or `templates/feature-brief.md`.
