# Sidebar Redesign Correction Plan

> For Hermes: this is a focused correction plan for the desktop SlateCamp sidebar after the oversized cobalt brand-panel experiment caused visual imbalance and alignment failures.

Goal: Restore the sidebar to a professional, compact, study-first navigation component with stable icon geometry, a legible brand lockup, and restrained separation from the dashboard surface.

Architecture: Keep the compositor-friendly grid + clip-path layout. Do not return to width animation. Replace the 324px-tall brand block with a compact fixed-height brand header that has identical height in collapsed and expanded states. Increase the collapsed rail from 52px to 64px so the rail has enough optical breathing room.

Design principles used:
- Navigation first, branding second. A sidebar must help the user move; the brand cannot consume the first third of the viewport.
- Collapsed rails need enough width for target clarity. 52px is too tight for a refined desktop rail; 64px is the minimum comfortable rail here.
- Icon positions must be spatially locked between expanded and collapsed states.
- Text labels reduce icon ambiguity in expanded state; collapsed state must still preserve tooltips and accessible labels.
- Dividers must align to the content they separate. The brand underline must share the exact left edge and visual width of the SlateCamp lockup, not an unrelated inset.
- Edge separation should be crisp and narrow: a 1px edge plus restrained shadow, not a broad glow.

Problems in current implementation:
1. Collapsed rail is only 52px, but the header consumes 324px vertically.
2. Dashboard begins at y=346/362, making the collapsed rail look broken and top-heavy.
3. The brand divider starts at x=28 while the logo starts at x=12, so the line is visibly not aligned to the logo/lockup.
4. The 300x300 card creates a decorative marketing block inside a utility navigation rail.
5. The bottom rail, avatar, and toggle feel cramped because the icon slot is 40px inside a 52px rail.

Correction tasks:

Task 1 — Reset sidebar geometry
- Modify `src/components/sidebar/types.ts`.
- Set expanded width to 288px.
- Set collapsed width to 64px using 8px padding + 48px icon slot + 8px padding.
- Update icon container width from 40px to 48px.

Task 2 — Replace tall brand panel with compact header
- Modify `src/components/sidebar/SidebarHeader.tsx`.
- Use a fixed 96px header in both states.
- Use a compact cobalt brand panel inside the header, not a 300px square.
- Align the logo slot to the same 48px rail as nav icons.
- Place the divider under the lockup with the same left edge and width as the lockup.
- Keep the tier pill subtle and expanded-only.

Task 3 — Update all sidebar rows to the new 48px icon slot
- Modify `SidebarNavItem.tsx` and `SidebarFooter.tsx`.
- Change grid columns from `40px` to `48px`.
- Change icon/footer containers from `w-10` to `w-12`.
- Preserve row heights and label fade behavior.

Task 4 — Keep the edge elegant but visible
- Modify `SidebarDesktopLayout.tsx` if needed.
- Use a slightly stronger 1px edge and tight shadow: `1px 0 0 rgba(15, 23, 42, 0.10), 8px 0 14px -14px rgba(15, 23, 42, 0.40)`.
- Do not increase spread.

Acceptance criteria:
- Collapsed sidebar width: 64px.
- Expanded sidebar width: 288px.
- Header height is identical in both states.
- Dashboard/Wiki/Notes/etc. icon center x/y deltas are 0 between collapsed and expanded states.
- Brand logo/lockup line left edge matches the brand lockup left edge.
- No 300px-tall collapsed brand block remains.
- Type-check passes.
- Lint has 0 new errors.
- `git diff --check` is clean.
