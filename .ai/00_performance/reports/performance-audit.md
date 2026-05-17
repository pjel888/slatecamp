# Performance Audit

**Last Updated:** 2026-04-16

## Evidence-based performance risks
- Client-component share is 51.7%, above the repo's stated target (<40%).
- 3D Lab and telemetry/guided-sequence hooks are inherently client-heavy and need strict discipline.
- Admin dashboards/editors and analytics pages are likely table/chart-heavy hotspots.
- Root layout loads multiple fonts and global UI providers, which increases base client/runtime cost.

## Strong signals
- 96 `loading.tsx` files show attention to loading states.
- `PortalLayout` and server actions reduce some duplication.
- 3D-related guidance already emphasizes demand-based rendering, but the codebase still needs continuous verification.
