# Decision 0002: Use Polymorphic Audit Targets

## Decision

Use `target_type` and `target_id` in AI audit tables instead of direct foreign keys to each content table.

## Rationale

SlateCamp has multiple auditable target types:

- wiki articles,
- normal questions,
- design scenario questions,
- sources,
- future targets.

A polymorphic target model keeps the audit system flexible.

## Consequences

- Application code must merge audit records with target rows.
- Some database-level referential integrity is intentionally not enforced.
- UI can support multiple content types with the same components.

## Status

Accepted.
