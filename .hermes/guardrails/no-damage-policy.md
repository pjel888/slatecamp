# No-Damage Policy

Hermes should never damage Slatecamp while trying to help.

## Preserve first

- Check Git status before edits.
- Avoid touching unrelated files.
- Avoid broad rewrites.
- Avoid deleting files unless the task specifically requires it.
- Avoid mass formatting unless formatting is the task.

## High-risk areas

- Auth and permissions.
- Database migrations and production data.
- Deployment configuration.
- Dependency upgrades.
- Secrets and environment files.
- Generated files and lockfiles.

## Required behavior

When an operation is high risk, write the plan and expected effect before executing. If the risk is unnecessary, choose a safer path.
