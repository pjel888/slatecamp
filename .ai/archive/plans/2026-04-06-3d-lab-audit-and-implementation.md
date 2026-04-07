# 3D Lab Remaining Implementation Plan

**Date:** 2026-04-06  
**Status:** Active / Remaining Work Only  
**Purpose:** This file was trimmed after the first implementation pass. It now contains only the unfinished 3D Lab work that still needs to be executed later.

## Already Completed

These items are already done and should not be reopened unless there is a regression:

- Canonical module routing exists at `/dashboard/3d-lab/[moduleId]`.
- Legacy `?model=` entry now redirects to the canonical module route.
- Legacy `/dashboard/3d-lab/wall-configurator` access is normalized to `/dashboard/3d-lab/unified-wall-configurator`.
- The persistent WebGL canvas was removed from `src/app/dashboard/3d-lab/layout.tsx`; the browser page no longer mounts the full viewer runtime by default.
- Shared browser/module shell primitives now exist in `src/features/3d-lab/components/shell`.
- 3D Lab compatibility imports were restored well enough for repo-wide `type-check` and `build` to pass.

## Not Archive-Ready Yet

The plan should stay active because these gaps are still visible in the live repo:

- `src/features/3d-lab/components/CategoryGrid.tsx` still generates legacy `?model=` links instead of always using the canonical module route.
- `src/lib/lab-analytics.ts` sends telemetry to `/api/analytics/3d-lab`, but there is no matching API route under `src/app/api`.
- `src/lib/actions/lab.ts` exports `create3DLabSession`, `record3DLabInteraction`, and `get3DModuleBySlug`, but those actions are still not wired into the live module runtime.
- `src/features/3d-lab/components/ModuleViewer.tsx` still synthesizes shell metadata with placeholders such as `estimatedMinutes: 5`, `visitedCount={0}`, empty hotspot arrays in runtime props, and local-only onboarding/session assumptions.
- State is still split across multiple contracts:
  - `src/features/3d-lab/stores/useLabStore.ts`
  - `src/features/3d-lab/stores/legacyLabStore.ts`
  - `src/features/3d-lab/stores/useWallLabStore.ts`
  - `src/features/wall-configurator/store/useWallConfigStore.ts`
- `src/app/dashboard/3d-lab/AGENTS.md` is stale and still describes the old query-param-only route model and old `_components/_config/_templates` structure.
- UI-facing 3D Lab shell/browser/wall-configurator components still contain large amounts of hardcoded visual styling instead of Slatecamp tokens.

## Remaining Workstreams

## Workstream 1: Finish Route Normalization

**Goal**

Remove the last live dependency on legacy `?model=` navigation and make all 3D Lab links resolve through one route helper.

**Files**

- `src/features/3d-lab/components/CategoryGrid.tsx`
- `src/features/3d-lab/components/ModuleCard.tsx`
- `src/components/sidebar/sidebar-constants.ts`
- `src/lib/constants/routes.ts`
- Any admin/model registry links that still deep-link through legacy query params

**Tasks**

- Replace the remaining `?model=` link generation in `CategoryGrid` with `ROUTES.THREE_D_LAB_MODULE(...)`.
- Sweep the feature for any remaining runtime links that bypass the canonical route helper.
- Keep the redirect in `src/app/dashboard/3d-lab/page.tsx` so old links remain valid, but stop generating new ones.
- Ensure the featured module banner and every module card use the same route helper.

**Done when**

- No user-facing 3D Lab navigation path generates `?model=` links anymore.
- Redirects only exist for backwards compatibility.

## Workstream 2: Wire the Real Session and Interaction Pipeline

**Goal**

Connect the visible 3D Lab runtime to the session/interaction server actions that already exist, so the product stops behaving like a purely local mock shell.

**Recommended path**

Keep registry/config files as the rendering source of truth for module geometry and scene config, but wire runtime session state and hotspot interaction persistence through `src/lib/actions/lab.ts`.

**Files**

- `src/lib/actions/lab.ts`
- `src/features/3d-lab/components/ModuleViewer.tsx`
- `src/features/3d-lab/components/LabViewport.tsx`
- `src/hooks/useLabTelemetry.ts`
- Any hotspot/question interaction handlers in the shell or viewer

**Tasks**

- Create a module session when a user enters a module.
- Persist meaningful interactions when hotspots are opened, questions are answered, or module completion milestones are hit.
- Decide what to do with `get3DModuleBySlug`:
  - either integrate it into the live module load path where appropriate, or
  - explicitly deprecate/remove that server contract if static registry configs remain authoritative.
- Replace shell placeholders with real session-derived counts where possible.

**Done when**

- Entering a module creates a real lab session or an intentionally equivalent tracked runtime state.
- Hotspot/question interactions stop being purely local.
- The visible runtime is no longer disconnected from the persistence model defined in `lab.ts`.

## Workstream 3: Fix the Telemetry Contract

**Goal**

Make telemetry either real or remove the dead contract.

**Files**

- `src/lib/lab-analytics.ts`
- `src/hooks/useLabTelemetry.ts`
- `src/app/api/analytics/3d-lab/route.ts` or equivalent new API file
- Viewer/hotspot event emitters

**Tasks**

- Implement the missing `/api/analytics/3d-lab` endpoint, or remove/replace the current client sender.
- Wire `useLabTelemetry` to actual user interactions instead of only instantiating the hook.
- Cover at least:
  - module load
  - first hotspot open
  - hotspot/question interactions
  - preset/tool usage where relevant
  - module exit/completion
- Make failure behavior safe and silent; telemetry must never block the viewer.

**Done when**

- The analytics endpoint exists and receives the events the client claims to send, or the dead queue contract has been removed.

## Workstream 4: Consolidate State Ownership

**Goal**

Reduce the current multi-store drift and make the shell/store boundaries explicit.

**Files**

- `src/features/3d-lab/stores/useLabStore.ts`
- `src/features/3d-lab/stores/legacyLabStore.ts`
- `src/features/3d-lab/stores/useWallLabStore.ts`
- `src/features/wall-configurator/store/useWallConfigStore.ts`
- Any feature hooks still importing legacy/private compatibility surfaces

**Tasks**

- Keep one canonical shell-level store for module viewer state.
- Keep template-specific stores only where the runtime actually needs template-local state.
- Fence `legacyLabStore` behind compatibility-only adapters, or retire it entirely if the remaining templates can move off it.
- Decide how the wall configurator state fits into the 3D Lab shell:
  - unify it behind a shell adapter, or
  - explicitly separate it with a clean boundary instead of overlapping contracts.
- Keep `localStorage` only for local-only affordances such as first-time onboarding; do not let it stand in for session/product state.

**Done when**

- There is a documented canonical store boundary for shell state.
- Compatibility stores are clearly transitional or removed.

## Workstream 5: Replace Synthetic Module Metadata With Real Shell Data

**Goal**

Make the module shell describe the real module, not a placeholder reconstruction.

**Files**

- `src/features/3d-lab/components/ModuleViewer.tsx`
- `src/features/3d-lab/components/LabTopBar.tsx`
- `src/features/3d-lab/components/ModuleContextCard.tsx`
- `src/features/3d-lab/components/InfoPanel.tsx`

**Tasks**

- Stop hardcoding shell defaults such as `estimatedMinutes: 5`, empty hotspot arrays in runtime props, and `visitedCount={0}`.
- Feed the shell with real module metadata from the registry and, where applicable, session state from the live runtime.
- Ensure onboarding/context cards describe real module objectives, hotspot counts, and code references.
- Make module completion/progress UI reflect actual tracked state rather than placeholder counts.

**Done when**

- The top bar, context card, and info shell all reflect real module data.
- Placeholder metrics are removed or explicitly marked as temporary.

## Workstream 6: Finish Shell and Visual Standardization

**Goal**

Normalize the browser/module shell and wall-configurator UI around the Campfire token system.

**Scope note**

Focus on user-facing shell/browser/wizard surfaces first. Do not churn every scene material color unless there is a clear semantic/token payoff.

**Files**

- `src/features/3d-lab/components/CategoryGrid.tsx`
- `src/features/3d-lab/components/LabBrowser.tsx`
- `src/features/3d-lab/components/LabTopBar.tsx`
- `src/features/3d-lab/components/ModuleContextCard.tsx`
- `src/features/3d-lab/components/InfoPanel.tsx`
- `src/features/3d-lab/components/OnboardingFlow.tsx`
- `src/features/wall-configurator/components/steps/*`
- Any shared shell primitives under `src/features/3d-lab/components/shell`

**Tasks**

- Replace hardcoded UI hex values with Campfire semantic tokens where the colors are part of the product shell/UI.
- Remove inline typography ownership where shared primitives or tokens should own it.
- Normalize panel widths, spacing, radii, shadows, and overlay offsets across browser and module shells.
- Bring the wall configurator into the same shell hierarchy so it no longer feels like a separate product.

**Done when**

- The browser, module shell, and wall configurator read as one feature family.
- The main shell components no longer depend on scattered hardcoded UI colors.

## Workstream 7: Update Documentation and Storybook

**Goal**

Make the docs and component review surface match the current architecture.

**Files**

- `src/app/dashboard/3d-lab/AGENTS.md`
- Story files under `src/features/3d-lab/components/*.stories.tsx`
- Any supporting Storybook fixtures/decorators

**Tasks**

- Rewrite `src/app/dashboard/3d-lab/AGENTS.md` so it reflects:
  - canonical `[moduleId]` routing
  - current shell/component ownership
  - current feature-owned paths instead of the old `_components/_config/_templates` model
- Add or update stories for shared shell primitives and key module shell states.
- Ensure future componentization/restyling work remains reviewable in isolation.

**Done when**

- The AGENTS doc no longer describes the pre-refactor route model.
- The main shell states are represented in Storybook.

## Recommended Execution Order

1. Finish route normalization.
2. Wire the real session/interaction pipeline.
3. Fix the telemetry contract.
4. Consolidate state ownership.
5. Replace synthetic module metadata with real shell data.
6. Finish shell and visual standardization.
7. Update docs and Storybook.

## Archive Criteria

Archive this plan only when all of the following are true:

- No user-facing 3D Lab links generate `?model=` URLs.
- The live module runtime is wired to its real session/interaction path, or the unused server contracts have been formally removed.
- The telemetry endpoint mismatch is resolved.
- The shell/store ownership is explicit and no longer split across overlapping legacy contracts without explanation.
- `ModuleViewer` no longer relies on placeholder shell metadata.
- `src/app/dashboard/3d-lab/AGENTS.md` matches the actual route and component structure.
- The major shell/browser/wall-configurator UI surfaces have been normalized onto shared tokens/primitives.

## Rerun Verification Checklist

Run these after the next 3D Lab pass:

- `bun test`
- `bun run type-check`
- `bun run build`
- `bun run lint`

Manual checks:

- `/dashboard/3d-lab` renders as a browser page without forcing viewer-only WebGL behavior.
- Module cards and featured entry points navigate directly to `/dashboard/3d-lab/[moduleId]`.
- Sidebar navigation and in-feature navigation agree on the same routes.
- Opening a module creates or resumes the intended session state.
- Hotspot/question interactions are actually tracked or intentionally excluded with a documented reason.
- The analytics contract is real end to end, or removed.
- The wall configurator feels like part of the same module shell, not a separate app.

## Maintenance Note

This file was trimmed on 2026-04-06 to remove already completed routing/layout work and preserve only the remaining implementation backlog.

