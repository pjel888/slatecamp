# Architecture Audit

**Last Updated:** 2026-04-16

## Findings
- App Router is organized around multiple portal surfaces rather than one app shell.
- `PortalLayout` centralizes common portal chrome, which is a healthy boundary.
- `src/lib/supabase/server.ts` is the core server-side data/auth access shim.
- `middleware.ts` handles session refresh and pathname propagation globally.
- `src/lib/actions/` is broad and functionally dense; `quiz-v2`, `admin`, and analytics are especially deep.

## Weaknesses
- Root layout currently loads multiple font families, while older design-system guidance emphasized tighter typography constraints.
- Large shared action modules raise discoverability and verification cost.
- Client-heavy stores/hooks accumulate substantial workflow logic outside server-first boundaries.

## Highest-leverage improvements
- Continue splitting stable summary docs by domain so architectural truth is easier to query.
- Audit the highest-traffic client-heavy shells for server-component recovery opportunities.
- Add clearer ownership maps for admin and quiz-v2 flows.
