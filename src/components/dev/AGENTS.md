<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-25 -->

# dev

## Purpose

Internal developer tools for SlateCamp development and debugging. Provides a floating dev toolbar, demo shell, feature flag management, impersonation panel, and system diagnostics. These components are intended for local development only and should NOT render in production builds.

## Key Files

| File | Description |
|------|-------------|
| `demo-shell.tsx` | Floating "Dev Mode" pill linking to dashboard + embedded DevToolbar. Only renders when NOT on dashboard routes. `'use client'` |
| `dev-toolbar.tsx` | Draggable floating toolbar: connection state indicator, tier switcher, feature flag toggles, quick links to dev routes. Uses `useDevStore` for state. Supports collapse/expand. `'use client'` |
| `dev-badge.tsx` | Small badge indicating dev/preview environment. Positioned fixed on screen. |
| `dev-keyboard-provider.tsx` | Global keyboard shortcut provider for dev tools (e.g., toggle toolbar visibility). `'use client'` |
| `dev-overlay.tsx` | Full-screen overlay for dev diagnostics and debugging panels. `'use client'` |
| `feature-flag-board.tsx` | Feature flag management panel: grouped by category (Access, Org, Dev), shows flag source (override/db/config), toggle overrides. Uses `useDevStore` and `useAllFeatureFlags`. `'use client'` |
| `impersonation-panel.tsx` | Panel for impersonating different user roles/tiers during development. `'use client'` |
| `system-info.tsx` | System information display: build version, environment, connection state, feature flags summary. |

## Subdirectories

None. All dev components are flat in `src/components/dev/`.

## For AI Agents

### Working In This Directory

1. **Dev-only rendering.** These components must NOT appear in production. Guard rendering with environment checks or conditional imports. DemoShell already filters by pathname.

2. **Dev store.** State management uses `useDevStore` from `@/stores/dev-store` (Zustand). This store holds tier simulation, feature flag overrides, and toolbar visibility state.

3. **Feature flags.** The FeatureFlagBoard reads from `@/config/feature-flags` (FEATURE_FLAGS, FeatureFlagKey, FeatureFlagCategory) and `@/lib/hooks/useFeatureFlag` for resolved values. Overrides are persisted in the dev store.

4. **Draggable positioning.** DevToolbar uses `useDraggableFloatingPosition` hook from `@/lib/hooks/` for drag-and-drop positioning. Default position is bottom-right (16px from edges).

5. **Phosphor icons.** Dev tools use Phosphor icons (`@phosphor-icons/react`) via the SCIcon wrapper from `@/components/graphics/icons/Icon`.

6. **Tier config.** DevToolbar maps UserTier values to labels and colors. The tier type comes from `@/types/app`.

## Dependencies

### Internal

| Module | Purpose |
|--------|---------|
| `@/stores/dev-store` | useDevStore: tier simulation, feature flag overrides, toolbar state |
| `@/config/feature-flags` | FEATURE_FLAGS, FeatureFlagKey, FeatureFlagCategory |
| `@/lib/hooks/useFeatureFlag` | useAllFeatureFlags for resolved flag values |
| `@/lib/hooks/useDraggableFloatingPosition` | Draggable floating panel positioning |
| `@/lib/dev/dev-mode` | DevConnectionState type |
| `@/lib/admin/feature-flags` | FeatureFlags type |
| `@/types/app` | UserTier type |
| `@/components/graphics/icons/Icon` | SCIcon wrapper |

### External

| Package | Usage | Version |
|---------|-------|---------|
| **react** | Hooks: useState, useCallback, useEffect | ^19.2.4 |
| **next/navigation** | usePathname, useRouter | 16.1.6 |
| **@phosphor-icons/react** | Icons: Wrench, Lightning, Cube, Brain, Terminal, etc. | ^1.4.14 |

<!-- MANUAL: -->
