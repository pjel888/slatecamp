# Active Risks

**Last Updated:** 2026-04-17

1. **Documentation drift risk** — surface area is large enough that stale counts and stale ownership notes reappear quickly.
2. **Instruction drift risk** — 114 tracked `AGENTS.md` files require lightweight ongoing maintenance discipline.
3. **Validation ambiguity risk** — tests exist, but the root script surface does not expose a single canonical `test` entrypoint.
4. **Doc topology ambiguity** — future contributors may still confuse `README.md`, `docs/`, `.ai/`, and `.ai/06_specs/deep/` without enforcement.
5. **Broad-scope audit risk** — future agents may claim “repo-wide audit” after only scanning top-level directories unless the audit standard is enforced.
