<!-- Parent: ../AGENTS.md -->

# .github

## Scope

This file governs `.github/`.

## Responsibility

This subtree owns repository automation metadata such as workflows and PR templates.

## Edit rules

- Keep workflow and template claims aligned with `package.json` and actual validation policy.
- If CI gates change, update root docs and `.ai` readiness docs in the same change.

## Anti-loop rule

- Audit artifacts about CI do not become CI automation by themselves.
- Remediation requires a later implementation-approved run.
