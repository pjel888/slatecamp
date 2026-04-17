# DOCS_AND_AGENTS_HARDENING_PLAN

## Objective

Keep docs and AGENTS from drifting again by defining update triggers, authority, and maintenance expectations.

## Linked findings

- `CEX-DOC-001`
- `CEX-DOC-002`
- `CEX-AGT-001`

## Scope

- root docs
- `.ai` governance docs
- listed critical AGENTS
- repo-shared skills references

## Non-goals

- CI or automation implementation

## Dependencies

- `DOCS_SOURCE_OF_TRUTH.md`
- `VALIDATION_MATRIX.md`

## Sequence

1. define canonical owners
2. update AGENTS to point to the right contracts
3. refresh volatile active summaries when live counts or boundaries drift
4. demote preserved historical docs when they still look operationally current

## Risks

- accidental doc sprawl
- updating historical docs as if they were current

## Acceptance criteria

- AGENTS are concise and aligned with live docs
- major active bridge docs are current and future refresh passes can stay bounded
- future structure changes have clear documentation update triggers

## Open questions

- should there be a recurring “docs freshness” review cadence, or only update-on-change triggers?
