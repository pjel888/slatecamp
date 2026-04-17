# Client-Server Boundary Audit

## Boundary misuse and cleanup opportunities

### `L3-C01` — static wiki landing page is client-marked
`src/app/dashboard/wiki/page.tsx` is a likely serverification quick win.

### `L3-C02` — wiki sidebar has split data paths
- desktop: server-cached loader path
- mobile: client fetch/build path

This is a cleanup candidate because the same taxonomy surface crosses boundaries differently inside one feature.

### `L3-C03` / `L3-C04` — admin editor and knowledge flow
The admin stack mixes:
- large client controllers
- broad server loaders
- repeated client-side taxonomy traversal and question fetches

### `L3-C05` — duplicated notes orchestration
The route/server layer and two client shells divide note hydration and autosave inconsistently.

### `L5-C04` / `L5-C05` — Supabase helper and bootstrap boundaries
These are not low-risk cleanup candidates yet. They are boundary cleanup blockers because auth/session/bootstrap behavior still depends on mixed runtime contexts and tolerant callers.

## Expected payoff later

- reduce unnecessary client work
- reduce duplicated fetch/transform paths
- make route vs lib vs component responsibilities easier to reason about
- lower cleanup blast radius in admin/wiki/notes surfaces

## Linked findings and plans

- findings: `CLN-008`, `CLN-009`, `CLN-010`, `CLN-014`
- plans: `../03_plans/component-optimization-plan.md`, `../03_plans/cleanup-safety-validation-plan.md`

