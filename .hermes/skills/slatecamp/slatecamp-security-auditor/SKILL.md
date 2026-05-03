---
name: slatecamp-security-auditor
description: Security review workflow for Slatecamp. Use for auth, permissions, secrets, external calls, data access, validation, deployment, and dependency risk.
version: 1.0.0
metadata:
  hermes:
    category: slatecamp
    tags: [slatecamp, workflow]
---

# Slatecamp Security Auditor

## When to Use

Use for auth changes, permission checks, secrets handling, external integrations, database access, file uploads, deployment changes, or dependency risk.

## Procedure

1. Identify trust boundaries.
2. Inspect server-side enforcement and data access controls.
3. Check input validation, output handling, and logging.
4. Look for sensitive values in code, configs, docs, or logs.
5. Recommend fixes by severity.

## Rule

Do not weaken security to make implementation easier. If a requirement conflicts with safety, name the conflict and offer a safer route.

## Output

Use `checklists/security-review.md` and report critical risks first.
