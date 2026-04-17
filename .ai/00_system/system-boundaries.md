# System Boundaries

**Last Updated:** 2026-04-17

## Intended boundaries

- Route shells and layouts under `src/app/` should orchestrate composition, auth, and surface assembly.
- Business logic should prefer `src/lib/` actions, queries, entitlements, and service helpers.
- Shared reusable UI belongs in `src/components/`; behavior-rich domains belong in `src/features/`.
- Data truth comes from Supabase helpers, SQL schema, and migrations.
- `.ai/` and `AGENTS.md` govern understanding, validation, and execution discipline, not runtime behavior.

## Observed boundary pressure

1. The repo currently has `677` `use client` files, so server-first intent still faces real client-boundary pressure.
2. Admin surfaces mix route guards, browser Supabase reads, user-session reads, server actions, and service-role writes.
3. Broad `select('*')` and compatibility fallbacks still blur data-contract boundaries in some action/query paths.
4. 3D Lab and quiz shells concentrate client state, telemetry, and high-complexity interaction logic.

## Practical review rules

- If a route file starts owning view helpers, state logic, or data shaping, treat it as a boundary warning.
- If browser and server Supabase access coexist in one workflow, document the trust boundary explicitly.
- If a preserved historical doc explains an old boundary model, label it historical instead of letting it compete with live docs.

## Companion docs

- `architecture-map.md`
- `data-boundary-map.md`
- `../06_specs/client-server-boundary-rules.md`
- `../10_state/frontend-state-summary.md`
