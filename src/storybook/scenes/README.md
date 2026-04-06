# Storybook Scenes

Put curated composition stories here when a scene spans multiple reusable components or needs story-only adapters.

## Rules

- Do not import `src/app` pages directly into scenes.
- Prefer fixture-driven adapters over live server data.
- Keep scenes focused on documenting a stable reusable composition, not route-private glue.
