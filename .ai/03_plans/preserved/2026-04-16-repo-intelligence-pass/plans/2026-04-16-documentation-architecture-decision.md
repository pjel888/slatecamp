# Documentation Architecture Decision

**Date:** 2026-04-16

## Decision
Use a documentation-architecture-first model:
- `README.md` = comprehensive repo entrypoint
- `docs/` = root-level bridge/pointer surface
- `.ai/` = operational planning/audit/state/agent-governance layer
- `.ai/docs/` = deep reference/spec corpus

## Why
This preserves the value of the current `.ai/docs` corpus without forcing `README.md` to become a mirror of every deep document.

## Consequences
- README can be made comprehensive without duplicating the entire doc corpus
- `.ai` can focus on truth reconciliation, operational planning, and state
- deeper specs stay in `.ai/docs`
- index/governance docs must clearly describe these roles to avoid future drift
