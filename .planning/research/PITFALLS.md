# Domain Pitfalls: Dashboard Sidebar Redesign

**Domain:** Overlay sidebar with grouped navigation, popover account menu, collapse/expand states
**Project:** SlateCamp Dashboard Sidebar Redesign
**Researched:** 2026-03-20
**Codebase context:** Next.js 16 App Router, React 19, Tailwind CSS 4, shadcn/ui (Radix primitives), Phosphor Icons

---

## Critical Pitfalls

Mistakes that cause rewrites, broken accessibility, or production-blocking issues.

---

### Pitfall 1: Layout Shift When Switching from Push to Overlay

**What goes wrong:** The current sidebar uses `transition-[width]` on the `<aside>` element inside a flex container. The main content `<div className="flex-1">` reflows every time the sidebar width changes. Switching to overlay means the sidebar must be *removed from document flow* (via `position: fixed` or `absolute`), but if the collapsed rail still participates in the flex layout, expanding the overlay sidebar will still cause content to jump or the rail width to change, defeating the purpose.

**Why it happens:** Developers keep the sidebar in the flex flow for the collapsed rail state but overlay it when expanded, creating a hybrid where the flex container's basis changes depending on sidebar state. Or they animate `width` on the overlay instead of using `transform: translateX`, triggering layout recalculation on every animation frame.

**Consequences:**
- Main content area shifts horizontally when sidebar opens/closes
- CLS (Cumulative Layout Shift) penalty on page transitions
- Animation jank from width-based transitions (layout triggers on every frame instead of compositor-only)

**Warning signs:**
- Main content text reflows when toggling the sidebar
- DevTools Performance panel shows "Layout" events during sidebar animation
- Content behind the overlay sidebar "pushes" rightward

**Prevention:**
1. The collapsed rail must be a **fixed-width element that always occupies the same space** in the flex layout (e.g., always `w-[72px]`). It never changes width.
2. The expanded overlay must be `position: fixed` or `position: absolute` and rendered *on top of* the main content, not inside the flex flow.
3. Animate the overlay panel with `transform: translateX(-100%)` to `translateX(0)` -- never animate `width`. Transform animations run on the GPU compositor and skip layout/paint entirely.
4. The flex container should always see the same sidebar rail width regardless of expanded/collapsed state.

**Phase relevance:** This is the foundational architectural decision. Must be resolved in Phase 1 (layout restructuring) before any visual work begins.

**Confidence:** HIGH -- multiple sources confirm transform outperforms width animation. The existing codebase at line 211 uses `transition-[width]` which is exactly the anti-pattern to replace.

---

### Pitfall 2: Hydration Mismatch Flicker on Sidebar Collapse State

**What goes wrong:** The current sidebar reads `localStorage` in a `useEffect` to restore collapse state (line 174-179 of `Sidebar.tsx`). On initial server render, React renders the sidebar in its default state (expanded, `collapsed: false`). Then after hydration, `useEffect` fires, reads `localStorage`, and flips to collapsed -- causing a visible flash where the sidebar renders expanded for one frame then snaps to collapsed.

**Why it happens:** Next.js server-renders the component with no access to `localStorage`. The client hydrates with the same default state. Only after mount does `useEffect` read the stored preference. This creates a 1-frame flash that is especially jarring on fast connections where the page renders quickly.

**Consequences:**
- Visible layout flash on every page load for users who prefer collapsed sidebar
- In overlay model, this is worse: the overlay might flash open then close
- Feels unpolished and "student project" -- directly contradicts the project's stated goal

**Warning signs:**
- Sidebar visibly changes state 100-300ms after page load
- React DevTools shows state update immediately after mount
- Users on fast connections report "sidebar flicker"

**Prevention:**
1. **Use a cookie instead of localStorage** to persist sidebar state. Cookies are sent with the request and available during server rendering. The server component in `layout.tsx` can read the cookie and pass the initial state as a prop to the Sidebar. This is exactly how shadcn/ui's official sidebar component solves this problem.
2. If cookies are not feasible, use a **CSS-only initial state** that matches the most common user preference (collapsed), then hydrate to the actual preference. The visual jump from collapsed-to-expanded is less jarring than expanded-to-collapsed because the content area doesn't shrink.
3. As a fallback, add `opacity-0` to the sidebar on server render and fade in after hydration -- this hides the flash but adds perceived latency.

**Phase relevance:** Must be addressed in Phase 1 alongside the layout restructuring. The state persistence mechanism affects how the server component passes props to the client component.

**Confidence:** HIGH -- the existing code at lines 174-179 exhibits this exact pattern. Next.js official docs and multiple 2025-2026 articles confirm cookies as the solution for SSR-compatible state persistence.

---

### Pitfall 3: Focus Trap and Keyboard Navigation Failure on Overlay

**What goes wrong:** When the sidebar opens as an overlay with a backdrop, keyboard users can Tab out of the sidebar into the obscured content behind it. Screen readers can navigate to elements hidden behind the backdrop. Pressing Escape does nothing. The user is effectively stranded or, worse, interacting with invisible content.

**Why it happens:** Developers treat the overlay sidebar as a styled div rather than as a modal-like surface that requires focus containment. They add visual backdrop dimming but forget that focus and screen reader virtual cursors are not constrained by CSS opacity or z-index.

**Consequences:**
- WCAG 2.1 Level A failure (2.1.1 Keyboard, 2.4.3 Focus Order)
- Screen reader users interact with content they cannot see
- Keyboard-only users cannot close the sidebar without clicking
- Potential legal liability for accessibility non-compliance

**Warning signs:**
- Pressing Tab while sidebar is open moves focus to main content area
- Screen reader announces elements behind the backdrop
- No way to close sidebar via Escape key
- Focus does not move to sidebar when it opens
- Focus does not return to the toggle button when sidebar closes

**Prevention:**
1. When the overlay sidebar opens, apply the **`inert` attribute** to the main content area. This is the modern, correct approach -- it removes all descendant elements from the tab order and accessibility tree in one declaration. Browser support is universal in 2026 (Chrome, Edge, Safari, Firefox all support it).
2. Add `onKeyDown` handler for Escape to close the sidebar.
3. On open: move focus to the first focusable element in the sidebar (or the sidebar itself with `tabIndex={-1}`).
4. On close: return focus to the element that triggered the open (the toggle button).
5. Add `aria-expanded` to the toggle button reflecting sidebar state.
6. Add `role="dialog"` and `aria-label="Navigation sidebar"` to the overlay panel (since it behaves as a non-modal dialog when open).
7. The backdrop click handler must also close the sidebar.

**Phase relevance:** Must be built into the overlay implementation from the start (Phase 1/2). Retrofitting focus management is significantly harder than building it in.

**Confidence:** HIGH -- WAI-ARIA authoring practices and MDN documentation are authoritative here. The `inert` attribute approach is specifically recommended for this exact use case.

---

### Pitfall 4: Z-Index Stacking Wars Between Sidebar, Tooltips, Popovers, and Dialogs

**What goes wrong:** The sidebar overlay needs a z-index above main content. The account popover (Radix Popover) renders in a portal at the document body with z-index `2147483647`. Tooltips on collapsed rail items also use Radix portals. The leave-session Dialog (already in the codebase, line 391) uses yet another portal. These all fight for stacking position, and some combinations cause elements to render behind the sidebar backdrop or behind each other.

**Why it happens:** Radix primitives use portal rendering to escape parent `overflow: hidden`. Each portal gets its own stacking context. Without a coordinated z-index strategy, developers add increasingly large z-index values reactively ("z-index wars"). The current sidebar already has `z-10` (line 216), which is low and will conflict with overlay needs.

**Consequences:**
- Tooltips appear behind the sidebar overlay backdrop
- The account popover opens but is hidden behind the leave-session dialog
- Dropdown menus clip or render in wrong positions
- DevToolbar (already at some z-index) overlaps the sidebar

**Warning signs:**
- Any floating element appearing behind another floating element
- Needing to use z-index values > 50 for the sidebar
- Radix portal elements visually appearing under the sidebar backdrop

**Prevention:**
1. Define a **z-index scale as CSS custom properties** in a single location (e.g., `globals.css` or a Tailwind plugin):
   ```
   --z-rail: 10        /* collapsed sidebar rail */
   --z-sidebar: 40     /* expanded overlay sidebar */
   --z-backdrop: 39    /* sidebar backdrop, below sidebar */
   --z-tooltip: 50     /* tooltips, above everything in sidebar context */
   --z-popover: 50     /* popovers, same level as tooltips */
   --z-dialog: 100     /* modal dialogs, above everything */
   --z-devtools: 200   /* dev toolbar, always on top */
   ```
2. Since Radix portals render at document body level, their z-index is relative to the root stacking context. The sidebar backdrop and overlay must also be in the root stacking context (not nested inside a parent with `isolation: isolate` or other stacking context creators).
3. **Never put `opacity`, `transform`, or `filter` on the sidebar's parent container** -- these create new stacking contexts that trap child z-index values. The current sidebar is inside a flex container that does not have these properties, which is correct.
4. Use Radix's `sideOffset` and `align` props to position tooltips and popovers away from the sidebar edge to avoid visual clipping.

**Phase relevance:** Establish the z-index scale in Phase 1. Apply it to every floating element throughout all subsequent phases.

**Confidence:** HIGH -- Radix GitHub issue #1317 documents portal z-index conflicts. The stacking context rules are CSS specification-level facts.

---

### Pitfall 5: Tooltip-Inside-Popover Auto-Open Bug (Radix-Specific)

**What goes wrong:** The account settings popover at the bottom of the sidebar will contain interactive items (theme toggle, settings link, logout). If any of these items have Radix Tooltips, the tooltip will auto-open when the popover opens because Radix Popover auto-focuses the first focusable element, and if that element is a Tooltip trigger, the tooltip fires on focus.

**Why it happens:** Radix Tooltip opens on both hover and focus by default. Radix Popover moves focus into its content on open. These two behaviors combine to create an unwanted tooltip appearing immediately when the popover opens. This is a documented issue (radix-ui/primitives#2248).

**Consequences:**
- Distracting tooltip flashes inside the account popover every time it opens
- Tooltip may overlap popover content, causing visual noise
- Users perceive the UI as buggy

**Warning signs:**
- Opening the account popover causes a tooltip to flash on the first item
- Tooltips appear on items that are inside popovers or dropdowns

**Prevention:**
1. **Do not use Radix Tooltip inside Radix Popover content.** Use `title` attribute for simple hover text, or use a custom hover-only tooltip that does not respond to focus events.
2. Alternatively, set `delayDuration={700}` on tooltips inside popovers so they only appear after a deliberate hover, not on the focus event that fires when the popover opens.
3. Consider using `DropdownMenu` (Radix) instead of `Popover` for the account menu -- DropdownMenu has built-in keyboard navigation (arrow keys), role="menu" semantics, and does not trigger tooltips on its items.

**Phase relevance:** Phase 3 (account popover implementation). Must be decided before building the popover content.

**Confidence:** HIGH -- radix-ui/primitives#2248 is a confirmed, documented issue with specific workarounds.

---

## Moderate Pitfalls

Mistakes that cause rework, polish issues, or partial functionality breakage.

---

### Pitfall 6: Group Labels Blocking Click Targets When Collapsed

**What goes wrong:** When the sidebar collapses to an icon-only rail, section group labels (LEARN, PRACTICE, DATA) are visually hidden with `opacity: 0` or negative margin. But the DOM elements remain in place and intercept mouse events, making the nav icon buttons partially or completely unclickable.

**Why it happens:** CSS visibility techniques like `opacity: 0`, `font-size: 0`, or negative margins hide elements visually but leave them in the pointer event path. Developers test visually (looks hidden) but not interactively (still blocks clicks).

**Consequences:**
- Users cannot click certain nav items when sidebar is collapsed
- Appears as a random, hard-to-reproduce bug since it depends on exact element overlap
- Reported as shadcn/ui issue #8037, with fix merged in PR #8077

**Warning signs:**
- Click on a collapsed sidebar icon does not navigate
- Hovering over a collapsed icon shows no cursor change in certain areas
- DevTools element inspector reveals a hidden label element stacked above the icon

**Prevention:**
1. When collapsed, group labels must have `pointer-events: none` applied.
2. Better yet, use `display: none` or `visibility: hidden` instead of `opacity: 0` for collapsed labels -- these fully remove the element from hit-testing.
3. Alternatively, conditionally render labels only when expanded: `{!collapsed && <SidebarGroupLabel>}`.
4. Test collapsed state by clicking every icon, not just visually inspecting.

**Phase relevance:** Phase 2 (grouped navigation implementation). Must be verified during collapsed-state testing.

**Confidence:** HIGH -- shadcn/ui issue #8037 and its fix PR #8077 document this exact bug with the exact solution.

---

### Pitfall 7: Overlay Sidebar Does Not Close on Route Navigation

**What goes wrong:** User expands the sidebar overlay, clicks a nav link, navigates to a new page -- but the sidebar stays open overlaying the new page content. The user must manually close the sidebar after every navigation. This is especially bad with Next.js App Router's client-side navigation where the page change is seamless.

**Why it happens:** Client-side navigation in Next.js does not trigger a full page reload. The sidebar state (expanded) persists across navigations because it is client-side React state. Developers expect the navigation to "reset" the sidebar but it does not.

**Consequences:**
- Users always need two actions: click nav link, then close sidebar
- On smaller desktop screens, the overlay permanently obscures content
- Feels broken compared to reference UIs (GitHub closes overlay on navigation)

**Warning signs:**
- Sidebar overlay remains visible after clicking a nav link
- Users report "sidebar won't close"

**Prevention:**
1. Listen to `pathname` changes via `usePathname()` and auto-close the overlay when the route changes.
2. In the nav link click handler, close the sidebar immediately (set expanded to false) before or alongside the navigation.
3. The collapsed rail should remain visible -- only the overlay expansion should close on navigation.
4. Implementation pattern:
   ```typescript
   const pathname = usePathname()
   useEffect(() => {
     setExpanded(false) // close overlay on any route change
   }, [pathname])
   ```

**Phase relevance:** Phase 2 (overlay behavior). Must be wired up when implementing the expand/collapse toggle.

**Confidence:** HIGH -- this is a universal pattern for overlay navigation in SPA frameworks. The existing codebase already uses `usePathname()` (line 164).

---

### Pitfall 8: Animation Duration Violates Design System and Reduced Motion

**What goes wrong:** Sidebar expand/collapse animation exceeds the 300ms maximum specified in the Campfire design system, or decorative animations run for users who have `prefers-reduced-motion: reduce` enabled. The current codebase already has `duration-300` in several places, but the overlay transition needs careful handling.

**Why it happens:** Developers tune animation duration by feel. The overlay slide-in "feels better" at 400ms or 500ms. Or they use a spring/physics-based animation that has variable duration. They forget to check the design system constraint or skip the reduced-motion media query.

**Consequences:**
- Design system violation (Campfire mandates max 300ms, ease-out default)
- Users with vestibular disorders experience nausea or dizziness from large sliding surfaces
- Inconsistent animation timing across the app

**Warning signs:**
- Animation duration constants > 300ms in sidebar code
- No `prefers-reduced-motion` media query or `useReducedMotion` hook
- Sidebar slides in with bounce or spring easing
- `duration-500`, `duration-700`, or `duration-1000` classes anywhere in sidebar code

**Prevention:**
1. Hard-code sidebar transition to `duration-200 ease-out` for the transform animation. 200ms is perceptually instant for a slide-in but still visible enough to orient the user.
2. Wrap all motion in a `prefers-reduced-motion` check:
   ```css
   @media (prefers-reduced-motion: reduce) {
     .sidebar-overlay { transition: none; }
   }
   ```
   Or in Tailwind: `motion-reduce:transition-none`.
3. For reduced motion, change the sidebar to appear/disappear instantly (opacity fade at most) rather than sliding.
4. Never use `bounce`, `spring`, or easing functions with overshoot on the sidebar. The Campfire design system explicitly forbids these except for Framer Motion structural animations, and the sidebar is not a structural animation case.

**Phase relevance:** Phase 2 (animation implementation). Must be baked into the transition CSS from the start.

**Confidence:** HIGH -- the constraints are defined in the project's own CLAUDE.md design system specification.

---

### Pitfall 9: Popover Clipped by Sidebar Overflow

**What goes wrong:** The account popover at the bottom of the sidebar opens but is visually clipped because the sidebar has `overflow: hidden` or `overflow-y: auto` (the current sidebar uses `overflow-y-auto overflow-x-hidden` on the content area at line 255). The popover renders inside the sidebar DOM and gets cut off by the overflow boundary.

**Why it happens:** Radix Popover uses portal rendering by default, which should escape overflow containers. But if the developer disables portal rendering (e.g., for styling convenience) or if the popover trigger is positioned near the bottom edge of the sidebar, the popover arrow or content may extend beyond the viewport. Additionally, if the popover is inside a scrollable container, scroll position affects the popover's visual position.

**Consequences:**
- Account popover is partially or fully invisible
- Popover appears detached from its trigger after scrolling
- Users cannot access account settings, theme toggle, or logout

**Warning signs:**
- Popover content visually cut off at the sidebar boundary
- Popover shifts position when sidebar content is scrolled
- Popover appears in wrong location after window resize

**Prevention:**
1. **Keep Radix Popover's default portal rendering enabled.** This renders the popover content in a portal at `document.body`, escaping all overflow containers.
2. Position the account popover trigger in the sidebar footer area, which should be **outside the scrollable content area** -- pinned to the bottom with `shrink-0`, not inside the `overflow-y-auto` container.
3. Use `side="top"` and `align="start"` on the popover content since the trigger is at the bottom of the sidebar. This ensures the popover opens upward and does not extend below the viewport.
4. Use Radix's `collisionPadding` prop to ensure the popover stays within the viewport.

**Phase relevance:** Phase 3 (account popover). The sidebar layout must separate the scrollable nav area from the pinned footer area in Phase 1.

**Confidence:** HIGH -- the current code already has `overflow-x-hidden` and `overflow-y-auto` on the content container. Radix's portal rendering is documented behavior.

---

### Pitfall 10: Backdrop Click Handler Interfering with Sidebar Content Clicks

**What goes wrong:** The backdrop (semi-transparent overlay behind the expanded sidebar) has a click handler to close the sidebar. But click events from inside the sidebar bubble up to the backdrop, causing the sidebar to close when clicking any interactive element within it.

**Why it happens:** The backdrop is often implemented as a full-screen div behind the sidebar, but if the sidebar is a child of the backdrop element (or the event propagation is not stopped), clicks inside the sidebar propagate to the backdrop's close handler.

**Consequences:**
- Clicking any nav link closes the sidebar before navigation completes
- Clicking the account popover trigger closes the sidebar
- The sidebar feels "impossible to use" because every click closes it

**Warning signs:**
- Sidebar closes when clicking items inside it
- Race condition: nav link click fires but sidebar closes simultaneously
- Popover opens then sidebar closes immediately

**Prevention:**
1. The backdrop must be a **sibling element** to the sidebar panel, not a parent. Render them side by side:
   ```jsx
   <div className="fixed inset-0 z-[39] bg-black/20" onClick={closeSidebar} />
   <aside className="fixed left-0 top-0 z-[40] ...">...</aside>
   ```
2. If the backdrop must wrap the sidebar, add `onClick={(e) => e.stopPropagation()}` on the sidebar panel to prevent bubbling.
3. On the backdrop, use `onMouseDown` instead of `onClick` to handle the close -- this prevents the case where a user mouse-downs inside the sidebar, drags to the backdrop, and mouse-ups, which would trigger `onClick` on the backdrop.

**Phase relevance:** Phase 2 (overlay backdrop implementation).

**Confidence:** HIGH -- event propagation behavior is JavaScript specification-level. Multiple sidebar libraries (react-sidebar, Semantic-UI) have documented this exact issue.

---

## Minor Pitfalls

Issues that cause polish problems or minor rework.

---

### Pitfall 11: Active Route Matching Breaks with Grouped Navigation Restructuring

**What goes wrong:** The current active state logic (line 344-345) uses `pathname === href || pathname.startsWith(href)`. When adding the CampTrails route and renaming Testing to Review, the routes may be restructured. If `/dashboard` is matched as a prefix for `/dashboard/camptrails`, the Dashboard item stays highlighted when on CampTrails.

**Prevention:** Use exact match for `/dashboard` and prefix match only for sub-routes. The existing code already handles this correctly for `/dashboard` specifically, but verify it still works after adding new routes. Test every route in both collapsed and expanded states.

**Phase relevance:** Phase 2 (navigation restructuring).

---

### Pitfall 12: Freemium CTA Card Competes with Navigation for Vertical Space

**What goes wrong:** The upgrade CTA card pinned above the account popover consumes vertical space in the sidebar. On shorter viewports (e.g., 768px laptop screens), the nav section runs out of room and important nav items are pushed below the fold, requiring scroll to reach them.

**Prevention:**
1. The CTA card must be compact (max 60-80px height).
2. If viewport height is below a threshold (e.g., `< 700px`), hide the CTA card entirely or collapse it to a single-line "Upgrade" link.
3. The nav area must scroll independently from the header/footer sections. The current code already has `overflow-y-auto` on the content area, but after restructuring, ensure the CTA is outside the scrollable area and the nav has enough min-height.

**Phase relevance:** Phase 3 (freemium CTA implementation). Viewport testing required.

---

### Pitfall 13: Leave-Session Dialog Z-Index Conflict with Overlay Sidebar

**What goes wrong:** The existing leave-session Dialog (lines 391-421) renders via Radix Dialog portal. If the user opens the overlay sidebar during an active session and clicks a nav link, the leave-session dialog needs to appear *above* the sidebar overlay and its backdrop. Without coordinated z-indexing, the dialog may render behind the sidebar.

**Prevention:** The z-index scale from Pitfall 4 addresses this. Ensure the Dialog portal's z-index (100+) is higher than the sidebar overlay (40) and backdrop (39). Test this specific interaction: active session + expanded sidebar + click nav link.

**Phase relevance:** Phase 2 (overlay implementation) -- must verify the existing dialog still works correctly.

---

### Pitfall 14: Icon-Only Rail Tooltip Positioning After Layout Change

**What goes wrong:** The existing collapsed sidebar uses Radix Tooltip with `side="right"` and `sideOffset={12}` (line 145). After switching to a fixed-position overlay model, the tooltip position calculation may change because the sidebar's position context changes from static/relative (flex child) to fixed. Tooltips may appear offset or misaligned.

**Prevention:** After restructuring the sidebar layout, re-test every tooltip in collapsed state. Adjust `sideOffset` if the sidebar's position model has changed. Radix's Popper engine should handle fixed positioning correctly, but the offset values were tuned for the current layout.

**Phase relevance:** Phase 1 (layout restructuring) -- test immediately after changing position model.

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Layout restructuring (flex to fixed) | Content layout shift (Pitfall 1), hydration flicker (Pitfall 2), tooltip repositioning (Pitfall 14) | Establish fixed-rail + overlay architecture first. Use cookie for state. Retest tooltips. |
| Overlay behavior (backdrop, transitions) | Focus trap missing (Pitfall 3), animation violations (Pitfall 8), backdrop click bubbling (Pitfall 10), auto-close on nav (Pitfall 7) | Use `inert` attribute. Hard-code 200ms ease-out. Sibling backdrop element. Listen to pathname changes. |
| Grouped navigation | Labels blocking clicks (Pitfall 6), active route mismatch (Pitfall 11) | `pointer-events-none` or conditional render for labels. Test all routes. |
| Account popover | Tooltip auto-open bug (Pitfall 5), overflow clipping (Pitfall 9) | Use DropdownMenu instead of Popover, or avoid tooltips inside. Keep portal rendering. Pin trigger outside scroll area. |
| Freemium CTA | Viewport height squeeze (Pitfall 12) | Compact card, responsive hide on short viewports. |
| Integration with existing features | Dialog z-index conflict (Pitfall 13) | Coordinated z-index scale. Test active session + sidebar + dialog flow. |

---

## Sources

### Official Documentation
- [MDN: Stacking Context](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Positioned_layout/Stacking_context) -- CSS stacking context specification
- [MDN: inert attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/inert) -- Browser support and usage
- [MDN: aria-expanded](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-expanded) -- ARIA attribute for toggle buttons
- [MDN: aria-haspopup](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-haspopup) -- ARIA for popover triggers
- [HTML Spec: Popover attribute](https://html.spec.whatwg.org/multipage/popover.html) -- Native popover API

### Framework and Library Issues
- [Radix UI: Z-index issues with Dialog.Portal and Popover](https://github.com/radix-ui/primitives/issues/1317) -- Portal z-index conflicts
- [Radix UI: Tooltip within popover opens automatically](https://github.com/radix-ui/primitives/issues/2248) -- Tooltip + Popover focus bug
- [shadcn/ui: SidebarGroupLabel overlaps clickable elements](https://github.com/shadcn-ui/ui/issues/8037) -- Collapsed label blocking clicks
- [shadcn/ui: Fix pointer events on collapsible icon group label](https://github.com/shadcn-ui/ui/pull/8077) -- Fix for label click blocking

### Performance and Animation
- [Sidebar Animation Performance Analysis](https://www.joshuawootonn.com/sidebar-animation-performance) -- Width vs transform benchmarks
- [Chrome: Hardware-accelerated animations](https://developer.chrome.com/blog/hardware-accelerated-animations) -- GPU compositing for transforms
- [Josh Comeau: Accessible Animations with prefers-reduced-motion](https://www.joshwcomeau.com/react/prefers-reduced-motion/) -- React reduced motion implementation

### Accessibility
- [Level Access: Accessible Navigation Menus](https://www.levelaccess.com/blog/accessible-navigation-menus-pitfalls-and-best-practices/) -- Navigation menu pitfalls
- [Yale: Focus and Keyboard Operability](https://usability.yale.edu/web-accessibility/articles/focus-keyboard-operability) -- Focus management guide
- [TPGi: The Current State of Modal Dialog Accessibility](https://www.tpgi.com/the-current-state-of-modal-dialog-accessibility/) -- Modal dialog patterns
- [web.dev: The inert attribute](https://web.dev/articles/inert) -- Using inert for overlay background content

### Hydration and SSR
- [Next.js: React Hydration Error](https://nextjs.org/docs/messages/react-hydration-error) -- Official hydration mismatch docs
- [Achromatic: Using the new Shadcn Sidebar](https://www.achromatic.dev/blog/shadcn-sidebar) -- Cookie-based sidebar state persistence
- [DEV: Zero Flicker SSR Hydration Fix](https://dev.to/sidmohanty11/how-to-fix-react-hydration-mismatches-with-a-simple-inline-script-hack-zero-flicker-ssr-44fi) -- Inline script approach

### UX Patterns
- [UX Planet: Best UX Practices for Designing a Sidebar](https://uxplanet.org/best-ux-practices-for-designing-a-sidebar-9174ee0ecaa2) -- Sidebar UX patterns
- [GitBook Blog: Rebuilding GitBook's Sidebar](https://www.gitbook.com/blog/new-sidebar) -- Real-world sidebar rebuild case study
