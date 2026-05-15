# Repo Agent Model

**Last Updated:** 2026-05-09

## Hierarchy

- Root `AGENTS.md` governs repo-wide behavior
- Nested `AGENTS.md` files govern their subtree and should refine, not contradict, parent rules
- Local scope files win when they are more specific and still consistent with higher-order constraints

## Current payload model

- governance and contract docs live in `12_agents/`
- live project agent payload files live in `12_agents/payloads/`
- mirror-tool copies still exist outside `.ai` and require a later parity/generator decision

## Expectations

1. Audit the live subtree before editing.
2. Follow the canonical sources for that scope (code, config, schema, scripts, and current `.ai` docs).
3. Update the local `AGENTS.md` whenever structure, workflows, or key file references drift.
4. Avoid blind global edits; trace callers, consumers, and dependencies first.
5. Keep documentation and operational state in sync with implementation reality.
6. Use the verified AI bench when it materially improves review quality, planning depth, implementation throughput, or parallel read-only analysis: Codex/GPT-5.5 for primary builds and developer-agent work; OpenCode/OpenCode Go and Command Code for external CLI work; Kimi for long-context synthesis. Keep OpenRouter in the app/runtime learner/user AI boundary, not the default developer-agent boundary. The orchestrating agent remains responsible for final edits, validation, and claims.

## Handoff rules

- Escalate from local subtree docs to `.ai` when changes affect repo-wide ownership, architecture, priorities, or risks.
- Escalate to root README when onboarding/setup/repo-entrypoint guidance changes.
- Preserve historical material by logging supersession rather than deleting context silently.
- Keep companion-tool guidance aligned with `.ai/00_system/CODEX_ENABLEMENT_GUIDE.md` and mirror surfaces such as `.codex/AGENTS.md`.
