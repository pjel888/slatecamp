# Repo Agent Model

**Last Updated:** 2026-04-16

## Hierarchy
- Root `AGENTS.md` governs repo-wide behavior
- Nested `AGENTS.md` files govern their subtree and should refine, not contradict, parent rules
- Local scope files win when they are more specific and still consistent with higher-order constraints

## Expectations
1. Audit the live subtree before editing.
2. Follow the canonical sources for that scope (code/config/schema/scripts/docs).
3. Update the local `AGENTS.md` whenever structure, workflows, or key file references drift.
4. Avoid blind global edits; trace callers/consumers/dependencies first.
5. Keep documentation and operational state in sync with implementation reality.

## Handoff rules
- Escalate from local subtree docs to `.ai` when changes affect repo-wide ownership, architecture, priorities, or risks.
- Escalate to root README when onboarding/setup/repo-entrypoint guidance changes.
- Preserve historical material by logging supersession rather than deleting context silently.
