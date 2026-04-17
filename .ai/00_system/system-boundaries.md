# System Boundaries

**Last Updated:** 2026-04-16

## Intended boundaries
- Route shells in `src/app/` should orchestrate, not contain heavy business logic
- Business logic should prefer `src/lib/` action/query/service modules
- Shared UI belongs in `src/components/`; larger behavior-rich domains belong in `src/features/`
- Data truth comes from Supabase helpers, SQL schema, and migrations
- `.ai/` and `AGENTS.md` govern understanding and execution, not product runtime

## Observed boundary drift
1. Client-component share is higher than the stated target (<40%), indicating server/client responsibility drift.
2. Several actions and utilities still use broad selects or fallback patterns that mix service and compatibility logic.
3. Admin/editor/wiki flows cross component, action, renderer, and cache boundaries, which raises coordination cost.
4. 3D Lab hooks couple UI behavior, telemetry, and state progression in client-heavy code.
