# Styling Architecture & Tailwind Audit: 2026-04-04

## 📊 Executive Summary
The styling architecture is in a critical "Shadow State" between Tailwind v3 and v4, leading to massive **Token Fragmentation** and **Design System Drift**. Over 400 lines of CSS in `globals.css` define redundant variables that are frequently bypassed by hardcoded hex values in components, while the presence of both `tailwind.config.ts` and `@theme` blocks creates a confusing multi-source-of-truth configuration. This hybrid approach significantly bloats the CSS bundle and forces high-specificity overrides, degrading both performance and maintainability.

## 🔍 Missing Context Dependencies
- `src/components/graphics/gradients.css` (Imported in globals.css)
- `src/components/graphics/patterns.css` (Imported in globals.css)
- `shadcn/tailwind.css` (Imported in globals.css)
- `src/hooks/useReducedMotion.ts` (Referenced in QuizOption)

## 🎨 Config, Theme, & Purge Bloat
| Severity | Location | Configuration Anti-Pattern | Remediation Strategy (Plain Text Only) |
| :--- | :--- | :--- | :--- |
| **CRITICAL** | `tailwind.config.ts` / `globals.css` | **Configuration Schism**: Both a legacy `tailwind.config.ts` and a v4-style `@theme` block in `globals.css` exist. This creates a race condition for theme resolution and doubles the configuration surface area. | **Unified v4 Migration**: Deprecate `tailwind.config.ts` entirely. Move all remaining logic (plugins, content paths) into the CSS-first `@theme` block or `postcss.config.mjs` as per Tailwind v4 standards. |
| **HIGH** | `globals.css:26-170` | **Token Redundancy**: The `@theme` block re-defines system colors (e.g., `primary-50`) using CSS variables that are already defined in `:root`. This creates an unnecessary indirection layer that bloats the final CSS. | **Direct Variable Mapping**: Map Tailwind theme keys directly to the functional `:root` variables without the intermediate `--color-*` re-declarations unless dynamic aliasing is required. |
| **MED** | `tailwind.config.ts:20` | **Opaque Plugin Ingestion**: The `@tailwindcss/typography` plugin is loaded via `require` in a TS file while other plugins use `@plugin` in CSS. This inconsistency fragments the build pipeline. | **CSS-Native Plugin Loading**: Standardize all plugin loading using the `@plugin` directive within the main CSS entry point. |

## 🗑️ Global CSS & Custom Class Tech Debt
| Severity | Location (File/Line) | CSS Anti-Pattern / Dead Code | Remediation Strategy (Plain Text Only) |
| :--- | :--- | :--- | :--- |
| **HIGH** | `globals.css:400+` | **Utility Override Inflation**: Custom classes like `.wiki-prose h2` use hardcoded colors and fonts that should be handled by Tailwind's `typography` plugin or utility combinations. This creates specificity silos. | **Typography Plugin Customization**: Use the `@tailwindcss/typography` configuration to define prose styles globally rather than using nested custom CSS selectors. |
| **HIGH** | `globals.css:250-320` | **Animation Bloat**: Multiple manual `@keyframes` and animation classes (e.g., `drawer-slide-in-right`) are defined while `tw-animate-css` is also imported. This leads to redundant animation logic. | **Animation Consolidation**: Purge custom keyframes in favor of the standard Tailwind `animate-*` utilities or a unified animation library config. |
| **MED** | `globals.css:235` | **Coarse Pointer Hack**: Global `@media (pointer: coarse)` overrides for button sizes bypass Tailwind's responsive and utility-first nature, potentially causing layout shifts on device orientation changes. | **Variant-Based Touch Targets**: Use Tailwind's `touch-manipulation` utilities or custom variants (e.g., `touch:h-12`) to handle target sizing more predictably. |

## 📐 Component Styling & UI Inconsistencies
| Severity | Location (File/Line) | Utility Anti-Pattern | Remediation Strategy (Plain Text Only) |
| :--- | :--- | :--- | :--- |
| **CRITICAL** | `QuizOption.tsx:21-31` | **Hardcoded Hex Values**: `STATE_CLASSES` and `LETTER_CLASSES` use strings like `border-[#D4DAE3]` and `bg-[#F8F7F5]`. These are arbitrary values that bypass the 200+ design tokens defined in `globals.css`. | **Token Reconciliation**: Replace all arbitrary hex utilities with the semantic tokens defined in the theme (e.g., `border-border` or `bg-surface-light`). |
| **HIGH** | `QuizOption.tsx:64` | **Nested Conditional Logic**: The `cn()` call combines complex JS logic with arbitrary opacity values (`lg:opacity-0`). This makes the component's visual state difficult to trace through the design system. | **Variant Component Pattern**: Move complex state-to-class mapping into a CVA (Class Variance Authority) schema to separate style logic from component render logic. |
| **MED** | `QuizOption.tsx:43` | **Redundant Transition Classes**: Manually applying `transition-all duration-150 ease-out` on every option creates thousands of CSS rules in large lists that could be handled by a single parent utility or more surgical transitions. | **Inherited Transition Utility**: Apply base transitions at the design system level for common interactive elements to reduce component-level utility repetition. |

## 🗺️ Strategic Implementation Roadmap
1. **Phase 1: Configuration & Purge Locking**
   - Execute a full migration to Tailwind v4 "CSS-First" config.
   - Delete `tailwind.config.ts` and consolidate all `@theme` variables to remove redundancy.
   - Unify plugin loading into the `@plugin` directive.

2. **Phase 2: Global CSS Deconstruction**
   - Refactor `.wiki-prose` and other custom component CSS into the Tailwind Typography plugin config.
   - Audit and remove redundant `@keyframes` that overlap with `tw-animate-css`.
   - Implement a strict "No Custom CSS" policy for layout and typography, forcing the use of theme tokens.

3. **Phase 3: Component Pattern Standardization**
   - Perform a "Hex Hunt" across the `src/components` directory to replace arbitrary values with theme variables.
   - Implement `class-variance-authority` (CVA) for complex interactive components like `QuizOption` to manage states (`correct`, `incorrect`, `selected`) cleanly.
   - Standardize responsive touch targets using Tailwind variants instead of global media query overrides.
