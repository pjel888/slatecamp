# UI Component Consolidation Audit: 2026-04-04

## 📊 Executive Summary
The UI layer exhibits significant **Component Fragmentation** and **Naming Inconsistency**, with multiple near-identical components (e.g., `StatCard.tsx` vs `stat-card.tsx`) coexisting in the same directories. The system relies heavily on **Config-Driven Monoliths** instead of **Atomic Composition**, leading to "prop explosion" in core components like `Badge` and `IconButton`. This fragmentation creates a high cognitive load for developers and makes global UI updates (like a border-radius or color shift) impossible to execute across the entire site without manual, per-component refactoring.

## 🔍 Missing Context Dependencies
- `src/components/ui/card.tsx` (Base Card component referenced in StatCard)
- `src/components/ui/tooltip.tsx` (Referenced in IconButton)
- `src/lib/utils.ts` (For `cn` utility)
- `@phosphor-icons/react` (Icon library used across components)

## 👯 Component Fragmentation & Duplication
| Severity | Suspected Duplicates | Mechanism of Redundancy | Remediation Strategy (Plain Text Only) |
| :--- | :--- | :--- | :--- |
| **CRITICAL** | `StatCard.tsx` vs `stat-card.tsx` | **Direct Shadow Duplication**: Both exist in `src/components/shared/` with slightly different prop structures (`title` vs `eyebrow`) and styling (one uses `ui/card`, the other a raw `div`). | **Consolidate to Kebab-Case**: Delete `StatCard.tsx`. Refactor `stat-card.tsx` to use `ui/card` as a base and implement all needed variants (e.g., clickable links) through a single, stable API. |
| **CRITICAL** | `EmptyState.tsx` vs `empty-state.tsx` | **Hybrid Boundary Split**: Both exist in `src/components/shared/`. One is a Server Component, the other a Client Component. They have conflicting prop schemas for actions and icons. | **Unified Headless API**: Create a single `EmptyState` component using a "slots" pattern for actions, allowing it to function correctly in both server and client contexts without duplicating layout logic. |
| **HIGH** | `StatusBadge` (in `badge.tsx`) vs `status-badge.tsx` | **Implementation Drift**: `StatusBadge` is defined as a preset within the base `badge.tsx` and also as a standalone file in the same folder. This makes it impossible to know which "Published" badge is the source of truth. | **Internal Preset Consolidation**: Remove the standalone `status-badge.tsx`. Define all semantic presets within `badge.tsx` to ensure visual consistency across the entire platform. |
| **MED** | `IconButton.tsx` vs `Button.tsx` | **Variant Fragmentation**: `IconButton` is a wrapper that adds a tooltip but duplicates basic button styles and variants. `Button` already has an `icon` size variant. | **Wrapper Refactoring**: Deprecate `IconButton` as a standalone UI primitive. Use the base `Button` with the `icon` size and wrap it in a `Tooltip` only where needed through composition. |

## 🧨 Component API & Prop Bloat
| Severity | Location (File/Interface) | Anti-Pattern | Remediation Strategy (Plain Text Only) |
| :--- | :--- | :--- | :--- |
| **HIGH** | `src/components/ui/badge.tsx` | **Boolean Prop Overload**: Uses `pill`, `dot`, `dismissible` as boolean flags. This is difficult to scale if new visual styles (like "glass") are needed. | **Refactor to Variants**: Move `pill` and `dot` into the `cva` variants object under `shape` or `decoration`. This allows for mutually exclusive or combinable styles without cluttering the main component props. |
| **HIGH** | `src/components/ui/button.tsx` | **Typo in CVA Constants**: Variants like `primary` use `text-[8px]rimary-foreground` (likely a search/replace error). This breaks the design system theme colors. | **Manual Cleanup**: Correct the variant strings to use the proper theme variable names (e.g., `text-primary-foreground`). |
| **MED** | `src/components/shared/stat-card.tsx` | **Hardcoded Sub-components**: The layout for `eyebrow`, `value`, and `trend` is fixed within the component, preventing any deviation in visual order. | **Polymorphic Slots**: Update the interface to accept `React.ReactNode` for these slots, or move to a Compound Component pattern. |

## 🧩 Composition Opportunities (Monoliths)
| Severity | Location (File/Line) | Rigidity Flaw | Remediation Strategy (Plain Text Only) |
| :--- | :--- | :--- | :--- |
| **HIGH** | `src/components/ui/icon-button.tsx` | **Implicit Dependency Injection**: Hardcodes the `Tooltip` component inside the button. This prevents using the button in areas where tooltips aren't desired or require different trigger behaviors (e.g., click vs. hover). | **Compositional Tooltip**: Separate the button primitive from the tooltip. Require the consumer to wrap the button in a `<Tooltip>` if needed, keeping the UI primitives "pure." |
| **MED** | `src/components/shared/StatCard.tsx` | **Lack of Customizability**: The `StatCardInner` is private and un-exported, making it impossible to reuse the stat layout inside a different container (like a modal or a side panel). | **Atomic Exporting**: Export sub-components like `StatCardValue` or `StatCardLabel` to allow users to compose their own stat displays while maintaining design system consistency. |

## 🗺️ Strategic Consolidation Roadmap
1. **Phase 1: Pruning & Variant Mapping**
   - Execute a "File Sync Audit" to delete Case-Sensitivity duplicates (`StatCard.tsx`, `EmptyState.tsx`) in favor of kebab-case versions.
   - Consolidate all standalone "semantic badge" files (`status-badge.tsx`, `legal-citation-badge.tsx`) into variants or presets within the base `badge.tsx`.
   - Fix the broken string literals in `button.tsx` and `badge.tsx` variants.

2. **Phase 2: API Standardization**
   - Ensure all UI primitives in `src/components/ui/` extend their native HTML counterparts (e.g., `ButtonProps extends React.ButtonHTMLAttributes`).
   - Standardize the use of `cva` for all component variants to eliminate manual `cn()` string concatenation.
   - Replace rigid boolean flags (e.g., `pill`) with structured CVA variants (`variant`, `size`, `shape`).

3. **Phase 3: Composition Refactoring**
   - Refactor monolithic "Configuration" components (like `IconButton` with internal tooltips) into "Composition" patterns.
   - Introduce Compound Components for complex structures like `Card` and `StatCard` to allow for flexible content layouts without breaking the design system.
   - Move all "Business-Domain" UI (like `LegalCitationBadge`) out of `ui/` and into `shared/` or `features/`, reserving `ui/` for pure, headless primitives.
