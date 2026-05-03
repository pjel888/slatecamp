# Deployment and Operations

## Deployment rule

Do not deploy, migrate production data, rotate credentials, or change infrastructure without explicit user direction and a rollback plan.

## Pre-deploy checks

- Git working tree is clean or changes are intentional.
- Environment variables are documented and available.
- Build passes.
- Tests pass or skipped tests are explained.
- Database changes have a rollback or recovery path.
- User-facing change has smoke-test steps.

## Incident mindset

During a failure, optimize for clarity:

1. Stop guessing.
2. Identify blast radius.
3. Preserve evidence.
4. Check recent changes.
5. Apply the smallest reversible mitigation.
6. Document what happened and what prevents recurrence.
