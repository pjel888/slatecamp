# Client-Server Boundary Rules

**Last Updated:** 2026-04-17

## Current baseline

- SlateCamp still intends to be server-first.
- The repo currently contains `677` `use client` files, so boundary discipline matters more than slogans.

## Rules grounded in current reality

1. Treat Server Components, route handlers, and server actions as the default data and mutation path.
2. Treat client stores and long-lived client hooks as justified exceptions, not the baseline model.
3. When a client workflow crosses route boundaries or calls server actions directly, document why it cannot stay route-local.
4. If browser Supabase reads coexist with privileged server writes in one surface, document the trust boundary explicitly.
5. Treat admin editor flows, quiz/testing shells, device/gesture systems, notifications, and 3D Lab as the main justified client-heavy domains.
6. Re-measure client-heavy surface counts after broad UI or platform changes instead of reusing old numbers.

## Where future audits should look first

- `src/features/3d-lab/`
- `src/components/admin/unified-editor/`
- `src/stores/`
- `src/hooks/`
- `src/app/dashboard/*`

## Companion docs

- `frontend-execution-model.md`
- `data-flow-map.md`
- `../00_system/data-boundary-map.md`
