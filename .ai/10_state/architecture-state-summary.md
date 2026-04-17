# Architecture State Summary

**Last Updated:** 2026-04-17

SlateCamp has a clear high-level architecture at the directory level:
- `src/app/` for route orchestration
- `src/components/` for shared UI
- `src/features/` for large behavior-rich domains
- `src/lib/` for actions, queries, entitlements, and services
- Supabase helpers and migrations as the data boundary

The main architectural risk is not missing structure; it is uneven enforcement of the intended boundaries. Admin authoring, dashboard shell assembly, and 3D Lab module loading remain the highest-signal pressure points.

Use:
- `../00_system/architecture-map.md`
- `../00_system/system-boundaries.md`
- `../00_system/data-boundary-map.md`
