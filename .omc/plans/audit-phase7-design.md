# Phase 7: Design System, Accessibility & UX Audit

**Date:** 2026-03-25
**Scope:** `src/` directory of SlateCamp codebase
**Method:** Static analysis of all `.tsx`, `.ts`, `.jsx`, `.css` files

---

## Design System Health Scorecard

| Dimension | Score | Finding |
|---|---|---|
| Color tokens | CRITICAL | 2,576 hardcoded hex colors in Tailwind classes; tokens exist in CSS vars but are massively bypassed |
| Typography | NEEDS_WORK | 1 violation of min 11px rule; monospace on 197 label patterns (not code/data); 4 font families loaded (Inter, Syne, DM_Mono, GeistSans) but GeistSans used in 1 file |
| Shadows | CLEAN | 0 shadow-xl/2xl violations found |
| Border radii | CLEAN | 3 rounded-xl instances (dialog, wiki widget, dev page) -- dialog is a modal so acceptable; 2 minor violations |
| Transitions | CLEAN | 1 duration-500 violation; spring/bounce only in framer-motion (acceptable) |
| Component consistency | CRITICAL | 465 ad-hoc card divs vs 37 files using Card component; icon libraries split across Lucide (189 files) and Phosphor (135 files) |
| Empty states | NEEDS_WORK | Shared EmptyState component exists, used in ~12 files; many features lack empty state handling |
| Error boundaries | CLEAN | 8 error.tsx files across all major route segments; 123 error-handling patterns in components |
| Loading states | CLEAN | 87 loading.tsx files -- excellent coverage |
| Accessibility | CRITICAL | 293 aria attributes across 137 files; only 8 alt attributes total; 0 next/image usage; maximumScale:1 blocks pinch-zoom; button touch targets as small as 24px |
| Responsive design | NEEDS_WORK | 366 breakpoint utilities across 105 pages (3.5 per page avg); 0 usages of 2xl:; marketing pages well-covered, dashboard sparse |
| Voice guide | NEEDS_WORK | "drill" used in component names, labels, and descriptions (28 instances); "weakness" in 1 content description; "dominate" in 1 content description |
| Icon consistency | CRITICAL | Two icon libraries: Lucide React (189 files, 196 imports) AND Phosphor Icons (135 files, 140 imports) |
| Font consistency | NEEDS_WORK | 4 fonts loaded; GeistSans loaded globally for 1 component; Eyebrow component exists but ~113 raw monospace labels bypass it |
| prefers-reduced-motion | NEEDS_WORK | 12 instances of reduced-motion support; many animated components lack it |

---

## 1. Color Token Audit

### Actual Design System (derived from `src/app/globals.css`)

**Core tokens defined in `:root`:**
| Token | CSS Variable | Hex Value |
|---|---|---|
| Camp Cobalt (primary) | `--primary` | `#1B3FC4` |
| Camp Cobalt 50 | `--primary-50` | `#EEF2FC` |
| Camp Cobalt 700 | `--primary-700` | `#1535A8` |
| Camp Orange | `--camp-orange` | `#E8853A` |
| Emerald (success) | `--success` | `#2D9F6F` |
| Emerald 50 | `--success-50` | `#EDFAF4` |
| Warm Red (destructive) | `--destructive` | `#D64545` |
| Warm Red 50 | `--destructive-50` | `#FDF0F0` |
| Amber (warning) | `--warning` | `#D4951A` |
| Amber 50 | `--warning-50` | `#FEF8ED` |
| Info Blue | `--info` | `#3B82C8` |
| Ink Primary | `--text-primary` / `--foreground` | `#1A2332` |
| Ink Secondary | `--text-secondary` | `#4A5568` |
| Ink Tertiary | `--text-tertiary` / `--muted-foreground` | `#8896A7` |
| Border Default | `--border` | `#D4DAE3` |
| Surface Light | `--surface-light` | `#F8F7F5` |
| Surface Card | `--card` | `#FFFFFF` |
| Surface Focused | `--surface-focused` | `#F5F7FA` |

**CONFLICT: Dual token systems.** Globals.css defines BOTH shadcn semantic tokens (`--primary`, `--destructive`) AND a parallel "Camp Standard" system (`--camp-cobalt`, `--camp-red`, `--camp-green`, `--camp-amber`) with DIFFERENT hex values:
| shadcn token | hex | Camp Standard token | hex | Match? |
|---|---|---|---|---|
| `--primary` | `#1B3FC4` | `--camp-cobalt` | `#1B3FC4` | YES |
| `--destructive` | `#D64545` | `--camp-red` | `#E63329` | NO |
| `--success` | `#2D9F6F` | `--camp-green` | `#1B7A3C` | NO |
| `--warning` | `#D4951A` | `--camp-amber` | `#F5A623` | NO |

Also defined: `--signal-gold: #F5A623`, `--signal-red: #E63329`, `--signal-green: #1B7A3C` (wiki-specific), duplicating Camp Standard.

### Hardcoded Hex Color Usage (CRITICAL)

**Total: 2,576 hardcoded hex colors in Tailwind utility classes**
- `bg-[#...]`: 834 instances
- `text-[#...]`: 1,235 instances
- `border-[#...]`: 507 instances
- Additional inline styles with color: ~3,043 occurrences (includes fill, stroke, backgroundColor)

**Top 10 most-used hardcoded values (all have CSS variable equivalents):**
| Hex | Count | Should be |
|---|---|---|
| `#1B3FC4` | 406 | `text-primary` / `bg-primary` |
| `#D4DAE3` | 343 | `border-border` |
| `#8896A7` | 315 | `text-muted-foreground` |
| `#4A5568` | 223 | `text-text-secondary` |
| `#1A2332` | 221 | `text-foreground` |
| `#EEF2FC` | 141 | `bg-primary-50` |
| `#D64545` | 113 | `text-destructive` |
| `#D4951A` | 110 | `text-warning` |
| `#1535A8` | 106 | `text-primary-700` |
| `#2D9F6F` | 102 | `text-success` |

These 10 values account for ~2,080 of 2,576 hardcoded instances (81%). Migrating just these would dramatically improve token compliance.

---

## 2. Typography Audit

### Font Loading (`src/app/layout.tsx`)
- **Inter** -- primary sans-serif (via `--font-inter`, `font-sans`)
- **Syne** -- display headings (via `--font-syne`, `font-display`)
- **DM Mono** -- monospace labels (via `--font-dm-mono`)
- **GeistSans** -- loaded globally via `geist/font/sans` but **used in exactly 1 file**: `src/components/marketing/HeroHeadline.tsx`

**Issue:** GeistSans adds ~40-80KB of font weight for a single component. Should be dynamically imported or removed.

### Min Text Size Violations
| File | Line | Value |
|---|---|---|
| `src/components/wiki/mdx-components-shared.ts` | 55 | `text-[10px]` on table header cells |

1 violation of the 11px minimum rule.

### Monospace Misuse on Labels
**197 instances** of `font-mono` (or `font-[family-name:var(--font-dm-mono)]`) with `uppercase tracking-*` patterns -- these are category labels, section headers, and eyebrows, NOT code or data values.

The Eyebrow component (`src/components/ui/eyebrow.tsx`) exists to standardize this pattern but is only used in 28 files (~84 instances). An estimated **113 raw instances** bypass it.

---

## 3. Shadow Violations

| Pattern | Count | Status |
|---|---|---|
| `shadow-xl` | 0 | CLEAN |
| `shadow-2xl` | 0 | CLEAN |

No violations found.

---

## 4. Border Radius Violations

| File | Line | Pattern | Severity |
|---|---|---|---|
| `src/components/wiki/ElaborativeInterrogation.tsx` | 118 | `rounded-xl` on widget container | MINOR -- not a standard card |
| `src/components/ui/dialog.tsx` | 69 | `rounded-xl` on dialog | OK -- modals may use rounded-lg/xl |
| `src/app/developer/design-system/content-blocks/[component]/page.tsx` | 413 | `rounded-xl` on dev preview card | MINOR |

**0 rounded-2xl or rounded-3xl violations.**

Note: The `@theme` block in globals.css caps `--radius-xl` at `0.5rem` (8px, same as `--radius-lg`), effectively neutralizing rounded-xl overuse at the token level.

---

## 5. Transition Violations

| File | Line | Pattern |
|---|---|---|
| `src/components/shared/score-display.tsx` | 143 | `duration-500` on progress bar animation |

**1 violation** of the 300ms max rule.

**Spring/bounce easing:** Only in framer-motion structural animations (RationaleDrawer, AITutorDrawer, FloatingTestimonialMarquee) -- acceptable per design system rules.

---

## 6. Component Consistency

### Button Implementations
- **1 canonical Button** (`src/components/ui/button.tsx`) built on `@base-ui/react/button` with CVA variants
- Variants: primary, secondary/outline, ghost, destructive, link, success, warmCta
- Sizes: xs (h-7), sm (h-8), md/default (h-9), lg (h-10), xl (h-12), icon (size-8), icon-xs (size-6), icon-sm (size-7), icon-lg (size-9)
- Also: `IconButton` (`icon-button.tsx`), `ModeButton` (`mode-button.tsx`), `CloseButton` (`close-button.tsx`)

### Card Patterns (CRITICAL)
- **Card component** (`src/components/ui/card.tsx`): used in 37 files
- **Ad-hoc card divs** (rounded + border + bg-white/bg-card patterns): **465 instances**
- Ratio: 8% use the component, 92% are ad-hoc

### Dialog/Modal Patterns
- Dialog component: 21 usages
- Sheet (slide-over): 3 usages
- AlertDialog: 1 usage
- Total: 25 files use shared modal components

### Icon Libraries (CRITICAL)
- **Lucide React**: 196 imports across 189 files
- **Phosphor Icons**: 140 imports across 135 files
- Both libraries are used throughout the codebase with no clear domain boundary

### shadcn/Base UI Primitive Usage
17 UI components use `@base-ui/react` primitives (button, checkbox, dialog, dropdown-menu, etc.) -- good coverage of interactive primitives.

---

## 7. Empty State Coverage

**Shared component:** `src/components/shared/empty-state.tsx` (EmptyState)

**Files using EmptyState:** ~12 (ContentEditorIndex, AdminActivity, AdminSettings, ContentSearch, TaxonomyPicker, DataTable, ComponentShowcase)

**Routes/features WITHOUT empty state handling:** Dashboard home, Wiki listing, Notes (no notes), Testing Hub (no sessions), Analytics (no data), 3D Lab (no modules), CampTrails (no trails), CEO pages. Many of these render conditional content but lack a welcoming empty state message.

---

## 8. Error State Coverage

**Error boundaries (error.tsx):** 8 files
- `src/app/error.tsx` (root)
- `src/app/(auth)/error.tsx`
- `src/app/admin/error.tsx`
- `src/app/dashboard/error.tsx`
- `src/app/dashboard/3d-lab/error.tsx`
- `src/app/dashboard/testing/session/[sessionId]/error.tsx`
- `src/app/dashboard/testing/session/[sessionId]/debrief/error.tsx`
- `src/app/developer/error.tsx`

**Component-level error handling:** 123 catch/error patterns across 52 components.

**Not-found pages:** 4 (`/`, `/dashboard`, `/developer`, `/developer/design-system`)

Good coverage overall.

---

## 9. Accessibility Audit

### ARIA Usage
- **293 total** aria-label/aria-describedby/role attributes across 137 files
- Average: ~2.1 per file -- moderate

### Image Alt Text (CRITICAL)
- **8 total** `alt=` attributes across 6 files
- **0 uses** of `next/image` (Image component)
- **1 raw `<img>` tag** (AssetList.tsx:113 -- has alt)
- Most images appear to be SVG icons (not requiring alt), but any `<img>` usage should have alt text

### Keyboard Navigation
- **91 occurrences** of onKeyDown/onKeyUp/tabIndex/focus-visible/focus-within across 52 files
- Base UI primitives provide built-in keyboard support
- Custom interactive elements (taxonomy tree, question navigator, quiz options) have keyboard handlers

### Touch Target Sizes (NEEDS_WORK)
Button minimum sizes:
| Size | Dimensions | Meets 44px? |
|---|---|---|
| icon-xs | 24x24px | NO |
| xs | 28px tall | NO |
| icon-sm | 28x28px | NO |
| icon | 32x32px | NO |
| sm | 32px tall | NO |
| md/default | 36px tall | NO |
| lg | 40px tall | NO |
| xl | 48px tall | YES |
| icon-lg | 36x36px | NO |

**Only the `xl` button size meets the 44px WCAG touch target minimum.** All other sizes are below threshold. On mobile, this is a significant accessibility concern.

### Zoom Blocking (CRITICAL)
`src/app/layout.tsx:51` sets `maximumScale: 1` in viewport metadata. This **blocks pinch-to-zoom** on mobile, which is a WCAG 2.1 Level AA failure (Success Criterion 1.4.4 Resize Text).

### Color Contrast (Spot Check)
| Foreground | Background | Contrast Ratio | Pass (AA)? |
|---|---|---|---|
| `#1A2332` (Ink Primary) | `#FFFFFF` (white) | ~15.6:1 | YES |
| `#4A5568` (Ink Secondary) | `#FFFFFF` | ~7.4:1 | YES |
| `#8896A7` (Ink Tertiary) | `#FFFFFF` | ~3.9:1 | NO (needs 4.5:1 for normal text) |
| `#1B3FC4` (Camp Cobalt) | `#FFFFFF` | ~5.8:1 | YES |
| `#2D9F6F` (Emerald) | `#FFFFFF` | ~3.7:1 | NO |
| `#D4951A` (Amber) | `#FFFFFF` | ~3.0:1 | NO |
| `#E8853A` (Camp Orange) | `#FFFFFF` | ~3.0:1 | NO |
| `#D64545` (Warm Red) | `#FFFFFF` | ~4.3:1 | NO (borderline) |

**4-5 semantic colors fail AA contrast on white backgrounds** when used as text. This affects status badges, warning text, success indicators, and orange CTAs.

### prefers-reduced-motion
- **12 instances** of reduced-motion support across the codebase
- Supported in: globals.css (4 blocks), 3d-lab components (2), audio feedback (2), sidebar (2), HeroCommandBar (1), patterns.css (1)
- **NOT supported in:** framer-motion animations (quiz drawers, marketing sections), CSS transitions on interactive elements, loading spinners

---

## 10. Responsive Design

### Breakpoint Distribution
| Breakpoint | Count | Coverage |
|---|---|---|
| `sm:` | 151 | Most used |
| `md:` | 88 | Moderate |
| `lg:` | 101 | Good |
| `xl:` | 26 | Sparse |
| `2xl:` | 0 | None |
| **Total** | **366** | |

**105 page components** with 366 total breakpoint usages = **3.5 per page average**. This is low for a responsive app.

### Mobile Navigation
- `MobileDrawer.tsx` and `MobileTopBar.tsx` exist in sidebar
- `MobileNav.tsx` exists in portal
- Mobile-specific layouts are present but breakpoint coverage is thin within page content

---

## 11. Voice Guide Violations

### "drill" (forbidden -- should be "practice" or "review")
| File | Context |
|---|---|
| `src/components/wiki/widgets/bp344/RecallDrill.tsx:76` | UI label: "Interactive -- Recall Drill (2024 IRR)" |
| `src/components/wiki/widgets/dsgn013/DimensionDrill.tsx:49` | Code comment: "Drill card" |
| `src/lib/developer/componentRegistry.ts:48-59` | Tags array: `['drill', ...]` (4 entries) |
| `src/lib/actions/daily-mission.ts:49` | Mission ID: `'daily-drill'` |
| `src/lib/actions/dashboard.ts:17,237` | Type: `'drill'`; catalyst type |
| `src/app/developer/components/page.tsx:998,1034,1058,1082` | Descriptions: "recall drill", "Rapid-fire recall drill" (4 instances) |
| `src/app/developer/design-system/widgets/[component]/page.tsx:207,219,231` | Descriptions: "retrieval practice drill" (3 instances) |
| Component filenames | RecallDrill.tsx, DimensionDrill.tsx, SpatialQualityDrill.tsx, BodyDimensionDrill.tsx |

### "weakness" (forbidden -- should be "area to revisit" or "developing skill")
| File | Line | Context |
|---|---|---|
| `src/app/dashboard/3d-lab/_config/modules/egyptian-post-lintel.ts` | 57 | Content: "stone tensile weakness" (architectural term, acceptable in domain content) |

### "dominate" (forbidden -- should be "master" or "cover")
| File | Line | Context |
|---|---|---|
| `src/components/wiki/widgets/dsgn013/DHRatioExplorer.tsx` | 21 | Content: "Vertical surfaces dominate the visual field" (architectural description, acceptable in domain content) |

### "behind" / "overdue" / "grind" / "conquer"
No user-facing violations found. "behind" used only in code comments and architectural descriptions.

---

## 12. Icon Consistency (CRITICAL)

**Two libraries in concurrent use:**

| Library | Files | Imports |
|---|---|---|
| Lucide React (`lucide-react`) | 189 | 196 |
| Phosphor Icons (`@phosphor-icons/react`) | 135 | 140 |

Many files import from BOTH libraries. No domain-based separation pattern detected -- both are used in UI components, admin, dashboard, wiki, and shared components.

---

## Campfire Violation Inventory

### CRITICAL -- Hardcoded Colors (Top files by count, sampled)
All files under `src/components/wiki/`, `src/components/testing/`, `src/components/dashboard/`, `src/components/admin/`, `src/app/(protected)/ceo/` contain heavy hardcoded hex usage. The top 10 hex values account for 2,080 of 2,576 total (81%).

### CRITICAL -- Touch Targets
`src/components/ui/button.tsx` -- all sizes except `xl` are below 44px minimum.

### CRITICAL -- Zoom Blocking
`src/app/layout.tsx:51` -- `maximumScale: 1`

### CRITICAL -- Dual Icon Libraries
189 files use Lucide; 135 files use Phosphor. No consolidation strategy.

### CRITICAL -- Ad-hoc Card Patterns
465 ad-hoc card divs vs 37 files using the Card component.

### NEEDS_WORK -- Color Contrast Failures
`#8896A7` (Ink Tertiary), `#2D9F6F` (Emerald), `#D4951A` (Amber), `#E8853A` (Camp Orange), `#D64545` (Warm Red) all fail WCAG AA on white.

### NEEDS_WORK -- Dual Color Token Systems
shadcn semantic tokens and "Camp Standard" tokens define conflicting values for red, green, and amber.

### NEEDS_WORK -- Voice Guide
"drill" appears in component names, labels, IDs, and descriptions (28+ instances).

### MINOR -- Typography
1 instance of text-[10px]; GeistSans loaded globally for 1 component; ~113 raw monospace labels bypass Eyebrow component.

### MINOR -- Radius
2 non-modal `rounded-xl` instances.

### MINOR -- Transition
1 instance of `duration-500`.

---

## Priority Remediation Roadmap

### P0 -- Accessibility Blockers
1. **Remove `maximumScale: 1`** from `src/app/layout.tsx:51` (WCAG failure)
2. **Add mobile touch target overrides** -- ensure all interactive elements meet 44px on touch devices via `@media (pointer: coarse)` padding

### P1 -- Design Token Migration
3. **Migrate top 10 hardcoded hex values to semantic tokens** -- covers 81% of violations (2,080 instances)
4. **Resolve dual token system** -- deprecate Camp Standard tokens (`--camp-red`, `--camp-green`, `--camp-amber`) in favor of shadcn semantic tokens, or vice versa
5. **Consolidate icon library** -- pick Lucide or Phosphor and migrate; both ship full icon sets

### P2 -- Component Consolidation
6. **Migrate ad-hoc card divs to Card component** -- 465 instances
7. **Replace raw monospace labels with Eyebrow component** -- ~113 instances
8. **Remove GeistSans** -- loaded globally for 1 component

### P3 -- Voice Guide & Polish
9. **Rename "Drill" components and labels** -- use "Practice" or "Review"
10. **Fix color contrast** -- darken Ink Tertiary, Emerald, Amber, Camp Orange for AA compliance
11. **Expand reduced-motion support** to framer-motion animations
12. **Increase responsive breakpoint coverage** on dashboard pages

