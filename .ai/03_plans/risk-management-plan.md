# Risk Management Plan

## Objective

Reduce the highest current reliability, security, governance, and maintainability risks before any broad implementation cleanup.

## Linked findings

- `TOOL-002`
- `TOOL-003`
- `SEC-001`
- `SEC-002`
- `SEC-003`
- `DATA-001`
- `DATA-002`
- `META-003`
- `META-004`
- `CQ-002`
- `CQ-003`
- `CQ-004`

## Scope

- release blockers
- security and data exposure risks
- install/validation risks
- state/governance conflicts
- broad code-quality guardrail debt

## Non-goals

- feature expansion
- refactor-for-aesthetics work without risk reduction impact

## Prerequisites / readiness gates

- human approval to run implementation work after this planning pass
- clean decision on authoritative package-manager contract
- clean decision on `.ai` and tool-mirror ownership model

## Risk priority order

1. restore reproducible bootstrap and validation
2. close real security and data exposure risks
3. eliminate governance/state conflicts that can misdirect future agents
4. tighten code-quality guardrails in a staged, low-churn way

## Workstreams

### Workstream A: bootstrap and validation integrity

- converge on one lockfile/install contract
- restore clean dependency hydration
- make CI enforce app build/lint/type-check or approved replacements

### Workstream B: security and trust boundaries

- patch vulnerable framework/dependency ranges
- repair `wiki_article_sources` exposure
- make webhook idempotency atomic
- harden development impersonation boundaries

### Workstream C: schema and policy truth

- regenerate a policy-aware canonical schema artifact
- add drift checks between snapshot and migrations

### Workstream D: governance conflict reduction

- retire legacy `.ai/state` authority language
- define `.omx` runtime-only rules
- define generator/parity rules for tool mirrors

### Workstream E: staged quality tightening

- decide which strictness and lint rules can become advisory first
- tighten data contract patterns before global strictness escalations

## Risks and mitigations

- Risk: large guardrail changes overwhelm the repo
- Mitigation: stage compiler/lint tightening after bootstrap and security repair

- Risk: fixing security without schema/document updates leaves repeated drift
- Mitigation: pair every implementation fix with snapshot and doc refresh gates

## Dependencies

- `readiness-plan.md`
- `agents-governance-plan.md`
- `ai-folder-reorg-plan.md`

## Human approval decisions required

- which package manager and lockfile are authoritative
- whether Next and related packages can be upgraded immediately
- whether service-role dev bypass remains allowed locally

## Acceptance criteria

- documented install path works
- CI enforces critical gates
- critical data/security findings are remediated
- state and mirror ownership conflicts are documented and reduced

## Rollback / containment

- use phased implementation with one risk family at a time
- keep schema/policy snapshots and docs updated at each step

## Open questions

- Which dependency advisories are acceptable as deferred dev-only risk, if any?
- Can webhook replay safety be improved without changing provider-facing semantics?
