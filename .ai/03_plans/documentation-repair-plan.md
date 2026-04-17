# Documentation Repair Plan

## Objective

Repair documentation authority, remove unsafe ambiguity, and make the repo’s documentation topology self-explanatory.

## Linked findings

- `DOC-001`
- `DOC-002`
- `DOC-003`
- `DOC-004`
- `AGT-001`
- `DATA-002`

## Scope

- root docs
- `.ai` governance docs
- `.ai/06_specs/deep` authority boundaries
- baseline Markdown dispositioning
- missing local `AGENTS.md` coverage in doc-heavy zones

## Non-goals

- rewriting the deep reference corpus for style alone
- deleting historical docs

## Prerequisites / readiness gates

- canonical `.ai` map approved
- agreement on which docs are entrypoints versus archives versus deep references

## Workstreams

### Workstream A: authority repair

- demote or supersede unsafe legacy authority docs
- correct stale counts in high-authority docs
- make source-of-truth ownership explicit in README and AGENTS

### Workstream B: topology clarification

- define the exact roles of `README.md`, `docs/`, `.ai/`, and `.ai/06_specs/deep/`
- clarify `.ai/06_specs` versus `.ai/06_specs/deep`

### Workstream C: local governance coverage

- add targeted `AGENTS.md` files to doc/governance subtrees
- add anti-loop rules to all relevant AGENTS surfaces

### Workstream D: baseline disposition maintenance

- keep one file-level disposition register
- route historical docs to legacy/superseded status instead of silent drift

## Dependencies

- `ai-folder-reorg-plan.md`
- `agents-governance-plan.md`

## Risks and mitigations

- Risk: over-editing historical docs erases context
- Mitigation: preserve history and mark status instead of rewriting away lineage

## Human approval decisions required

- which historical docs should remain user-facing versus index-only

## Acceptance criteria

- no unsafe authority conflicts remain among root docs and `.ai`
- every documentation surface has one clear role
- file-level disposition register exists for the frozen baseline

## Rollback / containment

- changes remain documentation-only and reversible

## Open questions

- Which `.ai/06_specs/deep` historical meta docs should stay discoverable from entrypoints?
