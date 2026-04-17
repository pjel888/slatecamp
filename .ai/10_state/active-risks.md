# Active Risks

**Last Updated:** 2026-04-17

1. **Volatile count drift** — route, AGENTS, and client-surface counts change quickly, so top-level docs can go stale unless remeasured.
2. **Validation ambiguity** — there is still no root `test` script, so verification quality depends on following `VALIDATION_MATRIX.md`.
3. **Environment-contract gap** — the repo still lacks a committed `.env.example`, so environment truth remains documentation-backed rather than machine-backed.
4. **Developer-surface trust ambiguity** — `/developer` still mixes runtime-backed and mock/static views.
5. **Parallel workflow friction** — the installed `ultrawork` skill expects `docs/shared/agent-tiers.md`, which this repo still does not provide.
