# Change Scope Guardrail

## Principle

The best change is the smallest change that solves the actual problem without creating a worse one.

## Scope control

Before editing, identify:

- Required files.
- Adjacent files that may need tests.
- Files that must not be touched.
- Verification command.

## Stop conditions

Stop and report instead of continuing when:

- The task requires a product decision not provided by the user.
- The repo has conflicting conventions.
- The change touches critical systems beyond the request.
- Verification reveals a larger unrelated failure.
