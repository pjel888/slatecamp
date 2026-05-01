# Decision 0001: Build Admin UI Before AI Integration

## Decision

Build `/admin/ai-audit` workflow/status dashboard before integrating AI fact-checking providers.

## Rationale

AI output must be logged, reviewed, filtered, and approved. Without a stable admin UI and audit tables, AI results would be hard to trust and impossible to operationalize.

## Consequences

- First milestone produces no automated fact-checking.
- Admins can manually log and manage findings.
- Future AI providers can write into the same tables.
- The system remains safe because no content is mutated automatically.

## Status

Accepted for current implementation.
