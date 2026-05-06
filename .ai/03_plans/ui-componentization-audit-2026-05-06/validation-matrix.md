# Validation Matrix — UI Componentization Audit

## Always after each implementation batch
- `bun run type-check`
- `bun run lint`

## When DESIGN.md, globals, tokens, primitives, radius/elevation/color semantics are touched
- `bun run design:lint`

## When stories or shared visual components are touched
- `bun run check:storybook`
- `bun run build-storybook`

## When component behavior is touched
- `bun run test:dom`
- targeted `bun test` files if unit tests exist.

## When dialogs, sheets, popovers, focus, keyboard, overlays, or modals are touched
- `bun run test:e2e:dialog`
- Browser inspection of open/close, Escape/backdrop policy, Tab/Shift+Tab, focus restore, mobile viewport.

## When broad UI routes are touched
- `bun run inspect:ui`
- `bun run test:e2e:ui`
- `bun run test:e2e:smoke`

## Surface-specific E2E
- Wiki: `bun run test:e2e:auth-demo:wiki`
- Learning/quiz: `bun run test:e2e:auth-demo:learning`, `bun run test:e2e:quiz-real` when real flow is relevant.
- Sidebar: `bun run test:e2e:auth-demo:sidebar`
- 3D Lab: `bun run test:e2e:auth-demo:3d-lab`
- Admin roles: relevant `test:e2e:auth-demo:admin-*`
- Portals: `bun run test:e2e:auth-demo:portals`

## Visual regression
- `bun run test:visual` currently covers login only. Use as a smoke visual check, not full UI assurance.
- Add/expand route visual screenshots later only in stable visual environment.

## Build
- `bun run build` near final regression.
- If a dev server is running, kill it before build per repo guidance.

## Pass/fail rule
A batch cannot be reported complete until every required command has either passed or a pre-existing/baseline failure is documented with evidence and shown unrelated to the batch.
