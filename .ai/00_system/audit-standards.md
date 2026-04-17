# Audit Standards

**Last Updated:** 2026-04-16

## Required evidence classes
Every significant audit claim should be grounded in one or more of:
- live code paths
- config files
- package scripts
- database schema / migrations
- active docs
- operational state/log artifacts

## Minimum audit domains for repo-wide passes
1. App/routes/portals
2. Components and UI systems
3. Shared logic/services/actions/queries
4. Data/schema/migrations
5. Auth/entitlements/governance boundaries
6. Build/dev tooling and scripts
7. Tests/validation patterns
8. Documentation topology
9. `.ai` operational layer
10. `AGENTS.md` hierarchy

## Classification language
Use explicit classifications:
- accurate
- partially stale
- materially outdated
- misleading
- duplicated
- ambiguous ownership
- missing
- historical but useful

## Anti-slop rules
- Do not infer behavior from filenames alone.
- Do not call a doc current unless it was checked against current code or config.
- Do not mix fact capture and recommendation without clearly separating them.
- Do not recommend product refactors in a documentation-only task unless documentation truth cannot be restored otherwise.
