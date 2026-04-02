<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-02 | Updated: 2026-04-02 -->

# layout

## Purpose

Header action bar components. Omnibar (search), QuickCaptureDrawer (notes), NotificationBell, user menu.

## For AI Agents

1. **Reusable header:** Mount in any page needing search/notes/notifications
2. **Child state management:** Each component owns its open/closed state
3. **Consistent styling:** All buttons use iconButtonClass (36px, rounded-sm, muted)

## Dependencies

Internal: @/components/shared/Omnibar, @/components/notes/QuickCaptureDrawer, @/components/notifications/NotificationBell, @/lib/context/note-context, @/lib/utils

External: react, @phosphor-icons/react, tailwindcss

<!-- MANUAL: -->
