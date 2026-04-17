# Readiness Audit

## Readiness summary

| Dimension | Status | Linked findings |
| --- | --- | --- |
| Architecture readiness | red | `ARC-001`, `ARC-002`, `ARC-003`, `ARC-004`, `PERF-001`, `PERF-002` |
| Release / deployment readiness | red | `TOOL-002`, `TOOL-003`, `TOOL-004`, `SEC-001`, `SEC-002` |
| Documentation readiness | red | `DOC-001`, `DOC-002`, `DOC-003`, `DOC-004`, `AGT-001` |
| Operational readiness | amber | `SEC-003`, `SEC-004`, `DATA-002`, `META-005` |
| AI / governance readiness | red | `META-001`, `META-003`, `META-004`, `TOOL-005` |

## Architecture readiness

Blocked by:
- monolithic admin and 3D hotspots
- route-layer boundary drift
- 3D registry and shared viewport cost drift
- admin index overfetch and heavy shell responsibilities

## Release and deployment readiness

Blocked by:
- broken Bun bootstrap
- dual-lockfile contract
- framework and dependency vulnerability debt
- Storybook-only CI enforcement

## Documentation readiness

Blocked by:
- unsafe legacy authority documents
- stale count drift in high-authority docs
- unresolved source-of-truth ambiguity inside `.ai`

## Operational readiness

Constrained by:
- non-atomic webhook replay handling
- stale schema snapshot for policy review
- development-mode privilege bypass risk
- stale OMX runtime residue

## AI and governance readiness

Blocked by:
- overlapping `.ai` folder responsibilities
- split state authority
- unmanaged tool mirror duplication
- split MCP contracts

## Exit condition for readiness

The repo becomes readiness-positive only after:
- one canonical install/lock contract exists
- app-wide CI gates enforce build/lint/type-check or approved equivalents
- `.ai` authority and state hierarchy are made singular
- unsafe legacy docs are demoted or superseded
- high-risk data/security findings are remediated in a later implementation-approved run
