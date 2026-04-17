# Implementation Plan

## Objective

Sequence the eventual implementation work so the repo is stabilized before deeper refactors or structural cleanup begin.

## Linked findings

- `TOOL-002`
- `TOOL-003`
- `TOOL-004`
- `DOC-001`
- `META-003`
- `ARC-001`
- `ARC-002`
- `ARC-003`
- `CQ-001`
- `PERF-001`
- `PERF-002`

## Scope

- bootstrap and validation restoration
- governance and documentation authority repair
- high-risk security/data fixes
- targeted architectural decomposition in the highest-risk surfaces

## Non-goals

- wholesale stylistic rewrites
- broad refactors before validation and governance are stable

## Prerequisites / readiness gates

- lockfile/package-manager decision
- approval for implementation run
- baseline docs from this audit accepted as planning input

## Sequencing

### Phase 0: environment and governance readiness

- restore one working install path
- define CI validation gates
- demote unsafe legacy docs and fix state authority conflicts

### Phase 1: security and data integrity

- repair public data exposure
- patch framework/dependency vulnerabilities
- harden webhook idempotency and dev trust boundaries

### Phase 2: admin surface containment

- split admin content index from detail payloads
- separate authoring read models, preview compilation, and mutation services
- shrink broad editor files into responsibility-based slices

### Phase 3: 3D Lab architecture and performance

- establish one registry authority
- remove always-on screenshot-readback cost
- rationalize legacy loader paths

### Phase 4: route and shell boundary cleanup

- slim dashboard layout responsibilities
- remove inline route helpers where they violate thin-page conventions

### Phase 5: staged quality guardrails

- introduce explicit query contracts where `select('*')` remains
- stage stricter typing and lint rules after the highest-risk hotspots are decomposed

## Dependencies

- `risk-management-plan.md`
- `documentation-repair-plan.md`
- `ai-folder-reorg-plan.md`

## Human approval decisions required

- whether to tackle admin or 3D surfaces first after risk fixes
- whether stricter compiler/lint rules become blocking or advisory first

## Acceptance criteria

- install/build/validation path works cleanly
- critical security/data issues are fixed
- unsafe legacy authority docs are demoted
- highest-risk admin and 3D hotspots have bounded ownership and lighter payload paths

## Rollback / containment

- isolate work by phase and subsystem
- avoid mixing governance fixes with functional refactors in one batch

## Open questions

- Which admin editing behaviors are most timing-sensitive and need regression coverage first?
- Which 3D screenshot affordances are actually essential to keep?
