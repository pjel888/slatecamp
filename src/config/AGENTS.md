<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-24 | Updated: 2026-03-24 -->

# config

## Purpose

Application configuration and feature flag definitions. Provides zero-latency, config-only feature gating with a resolution order of: dev override > DB value > config default.

## Key Files

| File | Description |
|------|-------------|
| `feature-flags.ts` | Feature flag definitions — 3d_lab_access, ai_tutor_access, srs_review_access, org_dashboard, seat_management, dev_badges, dev_console. Categories: access, org, dev |

## For AI Agents

### Working In This Directory

- New feature flags: add to the `FEATURE_FLAGS` object with key, defaultValue, description, and category
- Flag categories: `access` (user-tier gating), `org` (organization features), `dev` (developer tools)
- Resolution order: dev override > database value > config default
- Use `getConfigDefault(key)` to read defaults, `getAllFlags(category?)` to list flags

### Common Patterns

- `as const satisfies Record<string, FeatureFlagDefinition>` for type-safe flag keys
- `FeatureFlagKey` type derived from `keyof typeof FEATURE_FLAGS`

## Dependencies

### Internal

- Used by `src/lib/context/` — flag provider context
- Used by `src/lib/actions/admin/` — admin flag management

<!-- MANUAL: -->
