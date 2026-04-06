# Storybook Support Layer

This directory owns Storybook-only infrastructure for SlateCamp.

## Rules

- Reusable component docs live in Storybook, not under `/developer/components`.
- Operational and architecture docs live in `/developer`.
- Story discovery is intentionally limited to `src/components`, curated `src/features`, and `src/storybook/scenes`.
- Autodocs stays tag-based through `.storybook/main.ts`, so docs remain opt-in and intentional.
- Browser API mocks, router helpers, fixtures, and scene-only adapters belong under `src/storybook/`, not beside production app routes.
- `bun run check:storybook` is the repository guard for Storybook. It rejects placeholder scaffolds and story files that do not import a real component module.
- If a public reusable component is added or materially changed, its Storybook docs should land in the same PR.
- Review story coverage by folder each sprint until the highest-value uncovered groups are documented.

## Subfolders

- `decorators/` - app-provider decorators and preview wrappers
- `fixtures/` - reusable wiki and portal data for stories
- `mocks/` - browser, router, and server-action test doubles
- `scenes/` - curated composition stories that are not owned by a single component module
