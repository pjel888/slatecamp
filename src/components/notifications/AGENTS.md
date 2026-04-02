<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-02 | Updated: 2026-04-02 -->

# notifications

## Purpose

Real-time notification system UI. Popover bell icon with badge, notification list, filtering, item rendering, preferences. Integrates Supabase Realtime.

## For AI Agents

1. **Realtime via Supabase:** NotificationBell calls startRealtime() on mount
2. **State in useNotificationStore:** No local useState for notification data
3. **Filtering client-side:** NotificationFilters drives store filter state

## Dependencies

Internal: @/stores/useNotificationStore, @/lib/utils

External: react, @supabase/supabase-js, @phosphor-icons/react, date-fns, tailwindcss

<!-- MANUAL: -->
