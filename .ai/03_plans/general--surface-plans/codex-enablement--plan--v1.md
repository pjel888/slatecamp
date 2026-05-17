# CODEX_ENABLEMENT_PLAN

## Objective

Make SlateCamp faster to orient in, safer to change, and easier to validate for future Codex sessions.

## Linked findings

- `CEX-ENV-001`
- `CEX-VAL-001`
- `CEX-DOC-001`
- `CEX-DOC-002`
- `CEX-DATA-001`
- `CEX-SKILL-001`

## Scope

- Codex-facing docs
- validation/environment contracts
- route and data maps
- repo-shared skills
- `/admin` and `/developer` enablement docs

## Non-goals

- product implementation
- env file creation
- CI/package changes

## Dependencies

- agreement that `.agents/skills` is the Codex shared skill surface
- continued `.ai` governance maintenance

## Sequence

1. establish baseline, findings, run log
2. publish environment + validation + docs-source-of-truth contracts
3. audit `/admin`, `/developer`, and data boundaries
4. publish repo-shared Codex skills
5. refresh critical AGENTS and README
6. maintain the refreshed bridge-doc layer and periodically remeasure volatile counts

## Risks

- overproducing docs without clarifying authority
- letting refreshed bridge docs drift without a repeatable measurement/update habit

## Acceptance criteria

- future Codex sessions can identify canonical docs in under one pass
- env and validation assumptions are documented without inventing missing files or commands
- `.agents/skills` is present and clearly related to `.ai`

## Open questions

- should `/developer` become the canonical runtime truth surface for more ops views in a later implementation run?
