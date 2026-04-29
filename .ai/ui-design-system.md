# UI and Design System

**Last audit:** 2026-04-29

## Sources of truth

- `DESIGN.md` — agent-readable visual identity and design-token contract.
- `src/app/globals.css` — implemented CSS custom properties and Tailwind CSS 4 tokens.
- `src/components/ui/` — shared primitives.
- `src/components/sidebar/`, `src/components/layout/`, `src/components/portal/`, `src/components/marketing/` — navigation and shell surfaces.
- `src/features/3d-lab/` and `src/components/r3f/` — 3D/R3F visual system.

## Current design contract

- Study-first, calm, work-focused ALE prep interface.
- Camp Cobalt primary (`#1B3FC4`), Ink foreground (`#1A2332`), semantic success/warning/destructive colors, Camp Orange sparingly for warm CTA, Trail Accent for Camp Trails.
- Atkinson Hyperlegible body/UI text, Plus Jakarta Sans headings, DM Mono for code/numeric/technical references.
- Compact 4px rhythm; common gaps 8/16/24px; no nested card stacks as a default pattern.
- Restrained borders/elevation; stronger shadows reserved for temporary elevation.
- `design:lint` validates `DESIGN.md`.

## Major UI surfaces

| Surface | Files | Notes |
| --- | --- | --- |
| Marketing/landing | src/components/landing/; src/components/marketing/ | Current landing components are being refactored in working tree. |
| Dashboard shell/sidebar | src/components/sidebar/; src/components/layout/; src/app/dashboard/layout.tsx | Main authenticated navigation. |
| Admin portal | src/components/admin/; src/app/admin/ | Content/editor/admin operations. |
| Quiz UI | src/components/quiz-v2/; src/stores/useQuizStore.ts | Real-time quiz interaction. |
| Wiki UI | src/components/wiki/ | Article navigation/rendering/interactive blocks. |
| 3D Lab UI | src/features/3d-lab/; src/components/r3f/ | WebGL canvas, controls, panels, hotspots. |
| Analytics | src/components/analytics/ | Charts and metrics. |
| Notes | src/components/notes/; src/hooks/useNoteEditor.ts | TipTap rich text note editing. |
