# 12 - Agent Execution Handoff

## Intended Next Work

Use this folder as the active planning basis for a later implementation run that builds LI into 3D Lab.

## Recommended Implementation Mode

Use a planned implementation lane, not ad hoc patching. The first code run should target a small slice:

1. Type/template widening.
2. Hotspot payload extension.
3. Dashboard metadata.
4. Focused tests.

Do not implement all modules in one PR.

## Required Pre-Edit Checklist

- Re-read root `AGENTS.md`.
- Re-read `src/features/3d-lab/AGENTS.md`.
- Re-read `src/app/dashboard/3d-lab/AGENTS.md`.
- Inspect live `templates.ts`, `useTemplateContent.tsx`, `ModuleCard.tsx`, `LabBrowser.tsx`, overlay store/card files, registry files, and tests.
- Run required blast-radius analysis before editing functions/classes/methods.
- Confirm current scripts in `package.json`.
- Confirm branch/worktree expectations with current repo state.

## Suggested Task Slices

### Slice 1 - LI Types and Template Defaults

Files likely owned:

- `src/features/3d-lab/types/templates.ts`
- `src/features/3d-lab/components/ModuleCard.tsx`
- focused type/registry tests

Validation:

- `bun run type-check`
- focused registry/template tests

### Slice 2 - Hotspot Payload Contract

Files likely owned:

- `src/features/3d-lab/stores/useOverlayStore.ts`
- `src/features/3d-lab/components/overlays/HotspotCard.tsx`
- `src/features/3d-lab/components/templates/HotspotQuestion.tsx`
- focused overlay/hotspot tests

Validation:

- focused hotspot tests,
- existing hotspot smoke behavior unchanged.

### Slice 3 - Learning Components

Files likely owned:

- `src/features/3d-lab/components/learning/*`
- `src/features/3d-lab/hooks/useTemplateContent.tsx`
- `src/features/3d-lab/components/LabViewport.tsx` if required

Validation:

- component tests,
- type-check,
- one local route smoke after first config exists.

### Slice 4 - First Module

Files likely owned:

- new `bp344-ramp-hotspots` config,
- category registry,
- dashboard visibility,
- module path tests,
- Playwright route smoke.

Validation:

- `bun run type-check`
- focused `bun test` for module path/registry/config
- `bun run test:e2e:auth-demo:3d-lab`
- manual screenshot or browser smoke if UI changes are visible.

## Source Truth Instructions

- Use source cards from the archived truth handoff.
- Do not use competitor text, media, or diagrams as production content.
- Label anything not source-confirmed as pedagogical or do not ship it.
- Keep GBC out of compliance MVP until official source cards exist.

## Documentation Sync

When code changes ship, update:

- relevant 3D Lab module catalog/architecture docs,
- `.ai/03_plans/2026-05-13-li-vizcode-3d-learning-master-plan/` only if implementation decisions change,
- local `AGENTS.md` files only if workflow, ownership, or structure changes.

## Completion Evidence

A later implementation run should report:

- files changed,
- module(s) added,
- tests run and exit result,
- Playwright/browser evidence,
- PI regression evidence,
- source-card readiness status,
- known release gaps.
