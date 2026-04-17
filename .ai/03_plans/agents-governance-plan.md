# AGENTS Governance Plan

## Objective

Make the AGENTS hierarchy and tool-mirror governance explicit, bounded, and non-recursive.

## Linked findings

- `AGT-001`
- `META-003`
- `META-004`
- `META-005`
- `META-006`
- `TOOL-001`
- `TOOL-005`

## Scope

- root and local `AGENTS.md` files
- doc-heavy subtrees missing AGENTS boundaries
- tool mirror ownership rules
- OMX runtime governance rules

## Non-goals

- changing runtime behavior in this documentation-only run

## Prerequisites / readiness gates

- approved `.ai` canonical map
- agreed policy on whether mirrors are generated or manually maintained

## Workstreams

### Workstream A: hierarchy completion

- add AGENTS boundaries for doc/governance and meta-tooling subtrees
- include scope, edit rules, source-of-truth rules, anti-loop rule, and remediation gating

### Workstream B: mirror governance

- declare one source for agent/skill payloads
- document parity and sync expectations for `.claude/.codex/.cursor/.gemini`

### Workstream C: runtime boundary clarity

- define `.omx` as runtime-only and non-canonical
- document cleanup expectations for stale active states

### Workstream D: dependency contract repair

- either add the missing `docs/shared/agent-tiers.md` contract or repair the referencing skill workflow
- unify MCP contract documentation

## Dependencies

- `ai-folder-reorg-plan.md`
- `documentation-repair-plan.md`

## Risks and mitigations

- Risk: too many local AGENTS files create noise
- Mitigation: add them only in high-value boundaries and keep them concise

## Human approval decisions required

- whether mirror trees remain tracked copies or become generated artifacts

## Acceptance criteria

- no major doc/governance subtree lacks a local operating contract where one materially reduces drift
- mirror update policy is explicit
- AGENTS files consistently state that generated audit artifacts do not recursively expand scope
- AGENTS files consistently state that remediation requires a later implementation-approved run

## Rollback / containment

- documentation-only, reversible edits

## Open questions

- Should `.omx` get a tracked top-level `AGENTS.md` despite being gitignored?
