<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-25 -->

# graphics

## Purpose

Slatecamp Graphic System v2 -- design tokens, icon system, CSS patterns, and SVG utility components for SlateCamp. Provides the canonical color palette for SVG/Canvas contexts, the SCIcon wrapper for Phosphor icons with standardized sizing, and CSS files for gradients and noise patterns.

## Key Files

| File | Description |
|------|-------------|
| `tokens.ts` | Campfire design tokens for graphic contexts. Exports `palette` (static hex values for SVG/Canvas), `cssVars` (CSS custom property references for JSX style props), and re-exports `getScoreColor` from shared score-display. |
| `gradients.css` | CSS gradient definitions for graphic compositions and backgrounds. |
| `patterns.css` | CSS noise and pattern definitions for textures and overlays. |
| `icons/Icon.tsx` | SCIcon component: standardized Phosphor icon wrapper. Maps size names (xs/sm/md/lg/xl/2xl) to pixel values (14/18/20/24/32/48). Supports weight, color, className, and ariaLabel. `'use client'` |
| `icons/iconMap.ts` | Registry mapping string icon names to Phosphor icon components. Used for dynamic icon resolution. |
| `icons/index.ts` | Barrel exports for icon system. |
| `logos/SlateCampLogo.tsx` | SlateCamp logo SVG. Sized via className. |
| `ui/NoiseFilter.tsx` | SVG noise filter component for textured backgrounds. Reusable in any SVG context. |

## Subdirectories

| Directory | Purpose | File Count |
|-----------|---------|------------|
| `icons/` | SCIcon wrapper and icon name-to-component mapping | 3 files |
| `logos/` | Logo SVG components (SlateCampLogo, SlateCampLogomark) | 2 files |
| `ui/` | SVG utility components (NoiseFilter) | 1 file |

## For AI Agents

### Working In This Directory

1. **tokens.ts is the source of truth for graphic colors.** For app-wide theming, use `globals.css` CSS custom properties instead. `tokens.ts` is specifically for SVG, Canvas, and graphic composition contexts where CSS variables are not available.

2. **SCIcon usage.** Always use `SCIcon` (imported as `SCIcon` from `@/components/graphics/icons/Icon`) for Phosphor icons throughout the app. Do NOT render Phosphor icons directly. The size tiers are:
   - `xs`: 14px
   - `sm`: 18px
   - `md`: 20px (default)
   - `lg`: 24px
   - `xl`: 32px
   - `2xl`: 48px

3. **Icon map for dynamic resolution.** When an icon name is provided as a string (e.g., from a config file or database), use `iconMap.ts` to resolve it to the actual Phosphor component.

4. **Palette consistency.** The `palette` object in `tokens.ts` must stay synchronized with the Campfire design tokens defined in CLAUDE.md. If a color changes in the design system, update both `tokens.ts` and `globals.css`.

5. **Score color re-export.** `tokens.ts` re-exports `getScoreColorHex` from `@/components/shared/score-display` as `getScoreColor`. This ensures a single canonical source for readiness score color thresholds across both graphic and UI contexts.

## Dependencies

### Internal

| Module | Purpose |
|--------|---------|
| `@/components/shared/score-display` | getScoreColorHex re-exported as getScoreColor |
| `@/lib/utils` | cn() for className merging in SCIcon |

### External

| Package | Usage | Version |
|---------|-------|---------|
| **@phosphor-icons/react** | Icon components, IconWeight type, Icon type | ^1.4.14 |

<!-- MANUAL: -->
