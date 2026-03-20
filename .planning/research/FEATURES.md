# Feature Research: Professional Dashboard Sidebar

**Domain:** SaaS dashboard sidebar navigation (overlay-style, grouped navigation)
**Researched:** 2026-03-20
**Confidence:** HIGH

## Reference Analysis

Findings synthesized from six professional SaaS products:

| Product | Sidebar Model | Key Pattern | Notable Detail |
|---------|--------------|-------------|----------------|
| **GitHub** | Collapsed rail + overlay expand | Bottom account popover, overlay doesn't push content | User avatar + org switcher at bottom, theme toggle in popover |
| **Supabase** | Persistent sidebar with grouped sections | Dense navigation grouped by service (Auth, Storage, SQL, etc.) | Separate sidebars for Org vs Project scope; lock collapsed/expanded |
| **Linear** | Collapsible sidebar with hover sub-menus | Team-based grouping, condensed views | Personalizable: drag-reorder items, right-click to customize |
| **Notion** | Resizable sidebar with nested pages | Favorites/Private/Shared/Teamspaces sections | 224px default width, drag-to-resize edge, nested page trees |
| **Vercel** | Resizable + hideable sidebar (2026 redesign) | Unified nav across team/project levels, project-as-filter | Mobile floating bottom bar, reordered by workflow priority |
| **shadcn/ui** | Composable component system | SidebarGroup/SidebarMenu/SidebarFooter primitives | Three variants: sidebar, floating, inset; icon-only collapse mode |

---

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these and the sidebar feels broken or amateur.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Grouped navigation with section labels** | Every professional SaaS (GitHub, Supabase, Linear, Vercel) groups nav items into labeled sections. A flat list reads as "student project." | MEDIUM | Use uppercase, small-size (11-12px), muted-color labels (e.g., LEARN, PRACTICE, DATA). Labels hidden when collapsed. shadcn SidebarGroup + SidebarGroupLabel maps directly to this. |
| **Active route indicator** | Users need constant spatial awareness of where they are. All reference apps highlight the active item. | LOW | Already exists. Current left-border pill + background tint + bold text is solid. Keep the 4px left accent bar pattern -- GitHub and Linear both use this. |
| **Collapsed icon-only rail with tooltips** | Standard pattern across GitHub, Supabase, Linear, Vercel. Users expect to reclaim horizontal space. | LOW | Already exists (72px rail). Tooltips on hover are critical in collapsed state -- users cannot navigate without them. Ensure tooltip appears reliably with consistent side offset. |
| **Collapse/expand toggle button** | Users expect a clear, always-accessible trigger to toggle sidebar state. Every reference app has one. | LOW | Already exists. Current SidebarSimple icon approach is standard. Position should stay consistent between states (top area, accessible in both collapsed and expanded). |
| **Collapse state persistence** | Users are frustrated when the sidebar resets on page navigation. All reference apps persist this. | LOW | Already exists via localStorage. Keep it. |
| **Logo/brand at top** | Anchoring element that confirms which product the user is in. Universal across all reference apps. | LOW | Already exists. Logomark in collapsed state, full logo in expanded state is the standard pattern (GitHub, Supabase, Vercel all do this). |
| **Smooth collapse/expand transition** | Jarring state changes feel broken. Every professional app animates this. | LOW | Already exists with 300ms transition. Keep the opacity fade on text, width transition on container. Do not exceed 300ms per Campfire design system. |
| **Overlay expand (not content-push)** | GitHub popularized this: expanding the sidebar overlays content rather than pushing it, preventing layout shift. Vercel and Linear also use this. Users of content-heavy dashboards expect it. | MEDIUM | This is the primary architectural change from current implementation. Requires: (1) collapsed rail stays in document flow at fixed width, (2) expanded sidebar is position:fixed or absolute overlaying content, (3) subtle backdrop/scrim behind overlay, (4) click-outside-to-close behavior. |
| **User identity display** | Users need to confirm they're in the right account. GitHub, Supabase, Notion, Vercel all show user identity prominently. | LOW | Already exists (avatar + name). Keep avatar with initials fallback. Position at top below logo is correct for SlateCamp's layout (Notion and Supabase do this; GitHub puts it at bottom). |
| **Leave-session guard dialog** | SlateCamp-specific but critical: users in an active quiz must be warned before navigating away. This is domain-specific table stakes. | LOW | Already exists. Keep the Dialog-based confirmation pattern. |

### Differentiators (Competitive Advantage)

Features that elevate the sidebar from "works fine" to "feels premium." Not required, but these are what separate a professional product from a competent one.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Bottom account popover (GitHub-style)** | Moves account actions (settings, theme, logout) out of the main nav flow and into a clean popover at the sidebar footer. This declutters navigation and feels polished. GitHub, Supabase, and Vercel all use this pattern. | MEDIUM | Popover triggered by avatar/name click at bottom. Contains: user name/email, theme toggle, Settings link, Logout button. In collapsed state, popover triggered by avatar icon click. Use shadcn Popover component. |
| **Freemium upgrade CTA card** | Monetization touchpoint that feels native, not intrusive. Best practice from Notion, Figma, and Claude: a subtle card pinned above the footer with upgrade messaging that ties to user context. | LOW | Small card above the account popover. Shows tier badge + "Upgrade" CTA for free users. Hidden for paid users. Do not make it flashy or animated -- professional users find aggressive upsells disrespectful. Passes the Campfire three-part engagement test. |
| **Keyboard navigation and shortcuts** | Power users (the target audience: working professionals studying for exams) navigate by keyboard. WCAG 2.1.1 requires it. Linear and Notion both support keyboard sidebar navigation. | MEDIUM | Tab/Shift+Tab through items, Enter to navigate, Escape to close overlay. Arrow keys within groups. Focus trap when overlay is open. Visible focus ring (2px Camp Cobalt outline). |
| **Backdrop scrim on overlay** | A subtle semi-transparent backdrop behind the expanded overlay sidebar creates visual hierarchy and signals "this is a temporary layer." GitHub and Linear both use this. | LOW | Very subtle: `bg-black/10` to `bg-black/20` max. Click on backdrop closes sidebar. Must respect prefers-reduced-motion (instant appear vs fade). |
| **Dashboard as standalone top-level item** | Dashboard/Home link should have visual weight distinct from grouped items. GitHub does this with a home icon at the top, visually separated from grouped sections. It signals "this is home base." | LOW | Render Dashboard link above the first group with slightly different styling -- same component, but positioned solo above the LEARN/PRACTICE/DATA groups. Not inside any group. |
| **Hover-to-expand (optional, defer)** | Linear allows hovering over the collapsed rail to temporarily expand the sidebar. Reduces click friction. | HIGH | Defer to v2. Requires careful timing logic (delay before expand, delay before collapse), edge cases with popover interactions, and can create accidental expansions. The toggle button is sufficient for v1. |
| **Accessible focus management on overlay open/close** | When the overlay opens, focus should move into the sidebar. When it closes, focus should return to the trigger. This is WCAG 2.4.3 (Focus Order). | MEDIUM | Use a focus trap (e.g., radix-ui FocusTrap or manual implementation). On Escape, close overlay and return focus to the toggle button. Screen reader announcement of sidebar state changes. |
| **Reduced-motion compliance** | Campfire design system mandates this. Professional products (Linear, Vercel) respect this. Disabling transitions for users with vestibular disorders is not optional. | LOW | Wrap all transitions in `@media (prefers-reduced-motion: reduce)` to set duration to 0. The existing code does not fully implement this. |

### Anti-Features (Deliberately NOT Building)

Features that seem appealing but create problems for this specific use case.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| **Nested flyout/mega-menu sub-navigation** | "Let users drill into sub-pages from the sidebar." | SlateCamp has 7 top-level routes -- nowhere near enough to justify sub-menus. Flyouts add interaction complexity, are hostile to keyboard users, and break on touch devices. Linear's hover sub-menus work because they have dozens of views per team; SlateCamp does not. | Keep flat items within groups. If a section grows beyond 5-6 items, revisit grouping strategy -- but do not add flyouts. |
| **Drag-to-reorder sidebar items** | "Let users customize their nav order." Linear and Notion offer this. | Premature personalization for a product with 7 nav items. Adds significant implementation complexity (drag-and-drop, persistence, default reset) for minimal user value. This makes sense when you have 20+ items. | Fixed, opinionated ordering based on user workflow priority. Revisit only if item count exceeds 10. |
| **Resizable sidebar width** | "Let users drag the sidebar edge to resize." Notion does this. | SlateCamp's sidebar has exactly two states: collapsed rail and expanded overlay. A resizable width adds a third dimension of state with no clear user value. The content in the sidebar (short labels + icons) does not benefit from variable width. | Fixed 260px expanded, 72px collapsed. Two states, no ambiguity. |
| **Sidebar search/command palette** | "Add a search bar in the sidebar." Notion has this. | SlateCamp should have a global command palette (Cmd+K), not a sidebar-embedded search. Putting search in the sidebar conflates navigation with discovery and wastes prime sidebar real estate. | Build a global command palette as a separate feature (modal overlay). Keep the sidebar purely for navigation. |
| **Accordion-collapsible groups** | "Let users collapse individual LEARN/PRACTICE/DATA sections." shadcn supports this via Collapsible wrapper. | With only 2-3 items per group, collapsing a group saves no meaningful space and adds click friction. This pattern makes sense when groups have 5+ items (like Supabase's service groups). SlateCamp's groups are small enough to show all items at all times. | Show all groups expanded at all times. If a group grows past 5 items, reconsider. |
| **Animated sidebar icons (micro-interactions)** | "Add subtle animations to icons on hover/active." | Violates Campfire design system engagement policy: decorative animations that don't improve learning outcomes fail the three-part test. Professional users preparing for licensure exams do not need bouncing icons. | Static icons with weight change (regular -> bold) on active state. This is what the current implementation does and it is correct. |
| **Multi-level breadcrumbs in sidebar** | "Show the user's path context in the sidebar." | The sidebar shows top-level navigation, not path context. Breadcrumbs belong in the main content header (where SlateCamp already has a DashboardHeader). Mixing these creates visual noise. | Keep breadcrumbs in the content area header. Sidebar shows only top-level nav. |
| **Notification badges on nav items** | "Show unread counts on Wiki, Notes, etc." | SlateCamp is a study tool, not a messaging platform. Notification badges create urgency and anxiety -- directly opposed to the "Confident Companion" voice. Working adults studying for exams do not need red dots pressuring them. | If notification-style features are needed later (e.g., "3 topics ready for review"), use the dashboard home page, not sidebar badges. |

---

## Feature Dependencies

```
[Overlay expand model]
    |-- requires --> [Collapsed rail stays in document flow]
    |-- requires --> [Backdrop scrim]
    |-- requires --> [Click-outside-to-close]
    |-- requires --> [Focus trap on open]
    |-- requires --> [Escape key to close]
    |-- enhances --> [Smooth transition animation]

[Bottom account popover]
    |-- requires --> [User identity display] (already exists)
    |-- requires --> [shadcn Popover component] (already available)
    |-- enhances --> [Freemium upgrade CTA card] (CTA goes above popover)

[Grouped navigation]
    |-- requires --> [Section labels] (LEARN, PRACTICE, DATA)
    |-- requires --> [Dashboard as standalone item] (above groups)
    |-- independent of --> [Overlay expand model] (can be built separately)

[Freemium CTA card]
    |-- requires --> [Tier detection] (already exists)
    |-- enhances --> [Bottom account popover] (positioned above it)
    |-- independent of --> [Overlay expand model]

[Keyboard navigation]
    |-- requires --> [Focus trap on overlay]
    |-- enhances --> [Overlay expand model]
    |-- enhances --> [Bottom account popover]

[Reduced-motion compliance]
    |-- enhances --> [All transition features]
    |-- independent (can be applied at any point)
```

### Dependency Notes

- **Overlay expand requires collapsed rail in document flow:** The collapsed rail must remain static (not hidden) so the expanded overlay can position relative to it. This is the fundamental architectural change.
- **Bottom account popover requires user identity:** Already exists. The popover wraps the existing avatar display with additional account actions.
- **Grouped navigation is independent of overlay:** Groups can be implemented while the sidebar is still push-model, then the overlay behavior layered on top. This allows incremental delivery.
- **Keyboard navigation depends on overlay focus trap:** Arrow key navigation within the sidebar and Escape-to-close only matter once the overlay model is in place. Tab order is relevant regardless.

---

## MVP Definition

### Launch With (v1)

Minimum set to achieve "professional sidebar" goal:

- [ ] **Overlay expand model** -- the primary architectural change. Without this, the sidebar still feels like the current push model.
- [ ] **Grouped navigation (LEARN, PRACTICE, DATA)** -- the second most visible change. Transforms flat list into structured navigation.
- [ ] **Dashboard as standalone top-level item** -- separates the home link from groups for visual hierarchy.
- [ ] **Bottom account popover** -- moves settings/logout out of nav flow, matches GitHub/Supabase pattern.
- [ ] **Backdrop scrim on overlay** -- required for overlay to feel intentional, not buggy.
- [ ] **Click-outside-to-close** -- standard overlay behavior; without it, overlay feels broken.
- [ ] **Escape key closes overlay** -- baseline keyboard accessibility for overlay.
- [ ] **Freemium upgrade CTA card** -- monetization requirement from PROJECT.md.
- [ ] **Renamed "Testing" to "Review"** -- label change, trivial but specified in requirements.
- [ ] **CampTrails nav link added** -- new route stub, specified in requirements.

### Add After Validation (v1.x)

Features to add once core overlay sidebar is working:

- [ ] **Full keyboard navigation (arrow keys within groups)** -- polish after core interaction model is solid
- [ ] **Full focus trap on overlay open** -- proper WCAG compliance for the overlay
- [ ] **Reduced-motion compliance audit** -- wrap all transitions, test with prefers-reduced-motion
- [ ] **Accessible screen reader announcements** -- aria-live regions for sidebar state changes

### Future Consideration (v2+)

Features to defer until the sidebar pattern is proven:

- [ ] **Hover-to-expand** -- complex timing logic, defer until user feedback requests it
- [ ] **Partner ad placement slot** -- mentioned in PROJECT.md as future, not v1
- [ ] **Mobile responsive sidebar** -- explicitly out of scope per PROJECT.md

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Overlay expand model | HIGH | MEDIUM | P1 |
| Grouped navigation with labels | HIGH | LOW | P1 |
| Dashboard as standalone item | MEDIUM | LOW | P1 |
| Bottom account popover | HIGH | MEDIUM | P1 |
| Backdrop scrim | MEDIUM | LOW | P1 |
| Click-outside-to-close | HIGH | LOW | P1 |
| Escape key closes overlay | HIGH | LOW | P1 |
| Freemium CTA card | MEDIUM | LOW | P1 |
| Rename Testing to Review | LOW | LOW | P1 |
| CampTrails nav link | LOW | LOW | P1 |
| Full keyboard arrow navigation | MEDIUM | MEDIUM | P2 |
| Focus trap on overlay | MEDIUM | MEDIUM | P2 |
| Reduced-motion compliance | MEDIUM | LOW | P2 |
| Screen reader announcements | MEDIUM | LOW | P2 |
| Hover-to-expand | LOW | HIGH | P3 |
| Partner ad slot | LOW | LOW | P3 |

**Priority key:**
- P1: Must have for launch -- the sidebar does not feel "professional" without these
- P2: Should have, add immediately after P1 is stable -- accessibility polish
- P3: Nice to have, future consideration -- user-requested or business-requested

---

## Competitor Feature Analysis

| Feature | GitHub | Supabase | Linear | Notion | Vercel | SlateCamp Approach |
|---------|--------|----------|--------|--------|--------|--------------------|
| **Expand model** | Overlay | Persistent | Collapsible | Resizable | Hideable + resizable | Overlay (like GitHub) |
| **Grouped sections** | Minimal (repos, teams) | Heavy (Auth, DB, Storage, etc.) | Team-based | Favorites/Private/Shared | Project-as-filter | 3 groups: LEARN, PRACTICE, DATA |
| **Section labels** | Subtle | Bold category headers | Team icons + names | Section headers | Tab-like scoping | Uppercase muted labels |
| **Account popover** | Bottom avatar popover | Bottom org/user area | Top-left workspace menu | Top-left workspace menu | Top team switcher | Bottom avatar popover (like GitHub) |
| **Collapsed state** | Icon rail + tooltip | Icon rail + tooltip | Full collapse (no rail) | Full collapse (no rail) | Full hide | Icon rail + tooltip (like GitHub/Supabase) |
| **Active indicator** | Left border accent | Background highlight | Background + bold | Background highlight | Background highlight | Left border accent + background (current, keep) |
| **Upgrade CTA** | N/A (no freemium) | N/A (separate billing) | N/A | Subtle upgrade link | N/A | Dedicated CTA card above footer |
| **Keyboard nav** | Full | Partial | Full | Full | Partial | P2 target |
| **Theme toggle** | In account popover | Separate setting | In settings | In settings | In account popover | Move to account popover |

---

## Sources

- [Sidebar - shadcn/ui](https://ui.shadcn.com/docs/components/radix/sidebar) -- composable sidebar component documentation
- [Best UX Practices for Designing a Sidebar - UX Planet](https://uxplanet.org/best-ux-practices-for-designing-a-sidebar-9174ee0ecaa2) -- sidebar design guidelines
- [How we redesigned the Linear UI](https://linear.app/now/how-we-redesigned-the-linear-ui) -- Linear sidebar redesign rationale
- [Personalized sidebar - Linear Changelog](https://linear.app/changelog/2024-12-18-personalized-sidebar) -- Linear customization features
- [Navigate with the sidebar - Notion Help Center](https://www.notion.com/help/navigate-with-the-sidebar) -- Notion sidebar structure
- [New dashboard redesign - Vercel](https://vercel.com/changelog/dashboard-navigation-redesign-rollout) -- Vercel 2026 sidebar redesign
- [Dashboard Navigation Changes - Supabase](https://github.com/orgs/supabase/discussions/33670) -- Supabase navigation restructure
- [The Anatomy of High-Performance SaaS Dashboard Design - SaaSFrame](https://www.saasframe.io/blog/the-anatomy-of-high-performance-saas-dashboard-design-2026-trends-patterns) -- 2026 dashboard trends
- [Best Sidebar Menu Design Examples - Navbar Gallery](https://www.navbar.gallery/blog/best-side-bar-navigation-menu-design-examples) -- sidebar design examples
- [Freemium upgrade prompts - Appcues](https://www.appcues.com/blog/best-freemium-upgrade-prompts) -- freemium CTA placement patterns
- [WCAG 2.1.1 Keyboard Accessibility - UXPin](https://www.uxpin.com/studio/blog/wcag-211-keyboard-accessibility-explained/) -- keyboard navigation requirements
- [Expandable/Collapsible Sidebar Pros and Cons - Groovy Menu](https://groovymenu.grooni.com/expandable-collapsible-sidebar-menus-on-website-pros-and-cons/) -- expand/collapse tradeoffs

---
*Feature research for: SaaS dashboard sidebar (overlay-style, grouped navigation)*
*Researched: 2026-03-20*
