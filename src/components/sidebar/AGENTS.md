<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-24 | Updated: 2026-03-24 -->

# sidebar

## Purpose

Navigation sidebar for SlateCamp using rail + overlay (hamburger drawer) pattern (like Supabase/GitHub). Displays grouped navigation (Learn, Practice, Data) with collapsible sections, user tier badge, and contextual CTAs. The sidebar is the primary entry point for navigating between Dashboard, Wiki, Quiz, and Review subsystems.

## Key Files

| File | Description |
|------|-------------|
| `SidebarProvider.tsx` | Context provider and state manager. Manages open/closed state, active route, user tier context. Exposes `useSidebar()` hook for child components. |
| `SidebarShell.tsx` | Top-level layout wrapper. Composes rail, overlay panel, and main content area. Manages responsive breakpoints (md = 768px threshold). |
| `SidebarRail.tsx` | Vertical icon bar (fixed, collapsed). Shows logomark, nav group icons (Learn/Practice/Data), user tier badge, settings icon. Clickable icons expand overlay on mobile or toggle width on desktop (if desktop mode — but overlay is standard). |
| `SidebarOverlay.tsx` | Expanded navigation panel (full width sidebar or drawer). Slides in from left on mobile via Framer Motion. Shows nav groups, current route highlight, user profile, footer CTA. On desktop, may be sticky or drawer (no inline collapsible width transitions). |
| `SidebarPanel.tsx` | Layout shell for overlay content. Composed of header (logo + collapse), scrollable nav area, and pinned footer. Accepts named slot props (header, nav, footer). |
| `SidebarHeader.tsx` | Header of overlay panel. Logo, "SlateCamp" text (if space allows), collapse/close button. |
| `SidebarContent.tsx` | Scrollable content area. Renders nav groups and items. |
| `SidebarNavGroup.tsx` | Collapsible group container (Learn/Practice/Data). Shows group label, icon, toggle chevron, list of nav items. Highlights active group. |
| `SidebarNavItem.tsx` | Individual nav item. Shows icon, label, badge (if Pro feature), active/hover state. Links to route via Next.js Link. Emits `onBeforeNavigate` callback for tracking. |
| `SidebarUserProfile.tsx` | User profile section. Shows avatar, name, email, tier badge. Links to account settings. May show status (Online/Away). |
| `SidebarFooter.tsx` | Pinned footer outside scroll area. Contains upgrade CTA (if free tier), settings link, sign-out button. |
| `SidebarUpgradeCTA.tsx` | "Upgrade to Pro" button/card. Upsell messaging. Only shown to free tier users. Links to pricing page. |

## Subdirectories (if any)

None. All sidebar components are flat in `src/components/sidebar/`.

## For AI Agents

### Working In This Directory

The sidebar is the **navigation hub** for SlateCamp. It must adhere to the rail + overlay (drawer) pattern — NEVER use inline collapsible width transitions. Mobile-first responsive design is critical.

**Critical constraint:** NEVER implement inline collapsible sidebar (e.g., width transition from 64px to 240px). Instead:
- **Desktop:** Full-width overlay sidebar (sticky or drawer, configurable, but recommend sticky).
- **Mobile (<768px):** Icon rail (fixed left) with hamburger toggle → slides overlay panel from left.
- **Breakpoint:** md = 768px (Tailwind default).

**Navigation structure** (from `src/lib/routes.ts`):
- Three groups: Learn, Practice, Data (in that order).
- Each group has routes with icons, labels, and optional badges (Pro-only features).
- Active route is highlighted in current group.
- Routes derived from GROUPED_NAVIGATION and DASHBOARD_ROUTES configs.

**User context:**
- Tier badge shows user's plan (Free → Sparkle icon #D4951A, Camp/Insurance → Lightning icon #1B3FC4, Pro → Crown icon #D4951A).
- Free tier shows "Upgrade" CTA in footer.
- Paid tiers may show additional features or reserved action items.

**Language:** Growth-framed. Sidebar labels are direct and scannable (no verbose descriptions). Use "Learn," "Practice," "Data" for group names. Item labels are concise ("Dashboard," "Wiki," "Quiz," "Review," "CampTrails").

**Accessibility:** All nav items have proper aria-labels. Current page indicator via aria-current. Keyboard navigation (arrow keys, Enter to select).

### Common Patterns

1. **Rail + Overlay pattern:**
   - Desktop: Full-width sidebar (sticky) or overlay (modal-like).
   - Mobile: Icon rail + full-screen drawer overlay.
   - Framer Motion: Drawer slides in from left with `x: -100% → x: 0` animation.
2. **Responsive breakpoints:**
   - `<md`: Show rail only, toggle drawer on hamburger.
   - `>=md`: Show full sidebar (sticky or collapsible via toggle).
3. **Group collapsing:** Learn/Practice/Data groups are collapsible. Chevron icon rotates on toggle. Active group may auto-expand.
4. **Badge system:** Pro-only features show "Pro" badge next to item label. Styled with primary color.
5. **Active state highlighting:** Current route has bold text, background tint, and left border accent (4px #1B3FC4).
6. **Keyboard support:** Tab through items, Enter to navigate, Escape to close drawer on mobile.
7. **Context provider:** SidebarProvider manages open/close and exposes via useSidebar() hook. Child components consume state to avoid prop drilling.

## Dependencies

### Internal

- `@/lib/routes.ts` — GROUPED_NAVIGATION, NAV_GROUPS, RouteConfig
- `@/lib/constants/routes.ts` — ROUTES constant (alternative source if needed)
- `@/types/app` — UserTier, NavGroup
- `@/components/shared/TierBadge` — User tier display component
- `@/components/ui/*` — shadcn/ui (Button, Tooltip, etc.)
- `@/components/graphics/icons/Icon` — SCIcon wrapper for Phosphor
- `@/lib/utils` — cn() utility

### External

- `react` (19.x) — Hooks, context, useReducer
- `framer-motion` — Drawer slide animations, AnimatePresence
- `@phosphor-icons/react` — Icons (ChartBar, Cube, Brain, FileText, etc.)
- `next/link` — Client-side navigation
- `next/navigation` — usePathname, useRouter
- `next/image` — Avatar/logo images

## Campfire Design System

### Colors & Styling

- **Active item:** bg-[#EEF2FC] text-[#1535A8] border-l-4 border-[#1B3FC4]
- **Hover item:** bg-[#F5F5F5] text-[#4A5568]
- **Text (normal):** text-[#4A5568]
- **Text (muted):** text-[#8896A7]
- **Background (sidebar):** bg-white
- **Border:** border-[#D4DAE3]
- **Badge (Pro):** bg-[#1B3FC4] text-white text-[11px] font-medium rounded-full px-2 py-1
- **Tier icon colors:**
  - Free: text-[#D4951A] (Sparkle)
  - Camp/Insurance: text-[#1B3FC4] (Lightning)
  - Pro: text-[#D4951A] (Crown)
- **Shadows:** shadow-md (drawer), shadow-lg (overlay on mobile)
- **Radii:** rounded-sm (6px buttons), rounded-md (8px cards)
- **Transitions:** max 300ms, duration-150 ease-out. Drawer uses custom 250ms for slide.

### Typography

- Minimum text: 11px (text-[11px]). NEVER 8/9/10px.
- Monospace: NOT used in sidebar.
- Inter via next/font/google.
- Group labels: text-xs font-medium uppercase tracking-widest #8896A7
- Nav item labels: text-sm font-medium #4A5568 (normal), #1535A8 (active)
- User name: text-sm font-medium #1A2332
- User email: text-xs #8896A7

### Layout

- **Rail width:** 64px (fixed)
- **Sidebar width:** 240px (if sticky desktop) or full viewport width (if drawer/overlay)
- **Mobile drawer:** w-full or w-[280px] depending on design intent (recommend w-full for simplicity, drawer overlay)
- **Header height:** 56px (composes logo, text, toggle)
- **Nav item height:** 40px min (touch-friendly)
- **Responsive:** Use `md:` Tailwind prefix for desktop breakpoint

<!-- MANUAL: -->

