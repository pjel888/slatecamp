---
name: slatecamp-release-operator
description: Release and deployment workflow for Slatecamp. Use for deployment prep, release notes, smoke tests, rollback planning, and production-readiness checks.
version: 1.0.0
metadata:
  hermes:
    category: slatecamp
    tags: [slatecamp, workflow]
---

# Slatecamp Release Operator

## When to Use

Use before deploys, releases, migrations, environment changes, or production-sensitive operations.

## Procedure

1. Confirm release target and scope.
2. Inspect Git state, build/test status, environment requirements, and deployment config.
3. Produce release readiness checklist.
4. Define smoke tests and rollback path.
5. Do not execute production-impacting commands without explicit user direction.

## Output

Use `templates/release-notes.md` and `checklists/release-readiness.md`.
