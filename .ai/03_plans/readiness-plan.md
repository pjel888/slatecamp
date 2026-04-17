# Readiness Plan

## Objective

Move the repository from audit-negative readiness to evidence-backed readiness across architecture, release, documentation, operations, and AI/governance.

## Linked findings

- `ARC-001`
- `ARC-002`
- `PERF-001`
- `PERF-002`
- `TOOL-002`
- `TOOL-003`
- `TOOL-004`
- `DOC-001`
- `DOC-002`
- `DOC-003`
- `META-003`
- `META-004`

## Scope

- architecture readiness
- release/deployment readiness
- documentation readiness
- operational readiness
- AI/governance readiness

## Non-goals

- feature roadmap changes unrelated to readiness

## Readiness gates

### Architecture readiness

- high-risk shell, admin, and 3D boundaries are decomposed enough to be owned safely
- worst payload overfetch paths are removed

### Release/deployment readiness

- one install/lock contract works
- CI enforces core app validation
- critical dependency advisories are cleared or explicitly accepted

### Documentation readiness

- unsafe authority docs are demoted or superseded
- count drift is corrected or downgraded from high-authority docs
- source-of-truth boundaries are explicit

### Operational readiness

- webhook replay handling is hardened
- schema/policy truth is current
- dev bypass paths are bounded to explicit local-only rules

### AI/governance readiness

- `.ai` authority map is singular
- tool mirrors have a parity contract
- `.omx` is documented as runtime-only

## Workstreams

- Validation and CI restoration
- Security/data remediation
- Documentation authority repair
- `.ai` and AGENTS governance hardening
- Admin and 3D hotspot decomposition

## Risks and mitigations

- Risk: readiness work stalls in governance-only loops
- Mitigation: use this audit’s finding IDs and stop each phase with evidence gates

## Dependencies

- `executive-remediation-roadmap.md`
- `risk-management-plan.md`
- `documentation-repair-plan.md`

## Human approval decisions required

- acceptable residual dependency risk, if any
- target evidence required for “ready” declaration

## Acceptance criteria

- readiness table in `readiness-audit.md` can be reclassified with evidence instead of estimates

## Rollback / containment

- reclassify readiness by dimension; do not tie all gates to one mega-release

## Open questions

- Which readiness dimensions matter most for the next actual delivery milestone?
