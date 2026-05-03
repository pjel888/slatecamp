# Memory Governance

Hermes memory is small and should be curated. Store durable facts, not session noise.

## Store in memory

- Stable user preferences.
- Stable project facts after verification.
- Repeated project conventions.
- Known environment constraints.
- Durable recurring workflows.

## Do not store in memory

- Temporary bugs.
- One-off task details.
- Sensitive values.
- Unverified assumptions.
- Long summaries that belong in project docs.

## Update pattern

When a new fact is learned:

1. Verify it from files or user instruction.
2. Compress it to one concise sentence.
3. Replace stale memory instead of accumulating duplicates.
