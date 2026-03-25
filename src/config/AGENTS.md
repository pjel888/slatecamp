<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-24 | Updated: 2026-03-25 -->

# config

## Purpose

Application configuration and feature flag definitions. Provides portal configuration for admin/developer/CEO shells and zero-latency, config-only feature gating with a resolution order of: dev override > DB value > config default.

## Key Files

| File | Description |
|------|-------------|
| `portals.ts` | Portal configuration -- defines label, basePath, topbarBg, accentColor, accentLightColor, backLabel/backHref for admin, developer, and ceo portals. Exports `PORTALS` const and `PortalKey` type. |
| `feature-flags.ts` | Feature flag definitions -- 3d_lab_access, ai_tutor_access, srs_review_access, org_dashboard, seat_management, dev_badges, dev_console. Categories: access, org, dev. Exports `FEATURE_FLAGS`, `FeatureFlagKey`, `FeatureFlagDefinition`. |

## For AI Agents

### Working In This Directory

- **Portals:** Add new portal shells by adding an entry to the `PORTALS` object in `portals.ts` with all required `PortalConfig` fields
- **Feature flags:** Add to the `FEATURE_FLAGS` object with key, defaultValue, description, and category
- Flag categories: `access` (user-tier gating), `org` (organization features), `dev` (developer tools)
- Resolution order: dev override > database value > config default
- Use `getConfigDefault(key)` to read defaults, `getAllFlags(category?)` to list flags

### Common Patterns

- `as const satisfies Record<string, ...>` for type-safe keys on both portals and flags
- `PortalKey` and `FeatureFlagKey` types derived from `keyof typeof` their respective const objects
- Portal colors use hex values matching the Campfire design system

## Dependencies

### Internal

- Used by `src/components/portal/` -- PortalLayout consumes portal config
- Used by `src/lib/context/` -- flag provider context
- Used by `src/lib/actions/admin/` -- admin flag management
- Used by `src/app/api/admin/flags/` -- API route for dev flag overrides

<!-- MANUAL: -->
