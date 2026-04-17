# Performance Standards

**Last Updated:** 2026-04-17

## Standards to preserve

- Prefer Server Components and server-side data assembly by default.
- Use loading boundaries when async work is real, not as decorative boilerplate.
- Treat 3D Lab, admin editors, quiz shells, analytics views, and developer inspection tools as performance-sensitive by default.
- Validate performance claims against live code and measured hotspots, not only architectural intent.

## Current hotspot reminders

1. 3D Lab pays special attention to canvas settings, module loading, and render-path cost.
2. Admin authoring pages should avoid list/detail overfetch and oversized client payloads.
3. Dashboard shell changes can broaden blast radius because shared bootstrap and gating logic sit on a common path.
4. “Many loading files” is not proof of good perceived performance.

## Verification expectations

- Recheck volatile counts from live code before citing them.
- When documenting a performance claim, name the concrete file or surface involved.
- Prefer companion references over repeating performance guidance in every audit.

## Companion docs

- `frontend-execution-model.md`
- `route-inventory.md`
- `../10_state/performance-state-summary.md`
