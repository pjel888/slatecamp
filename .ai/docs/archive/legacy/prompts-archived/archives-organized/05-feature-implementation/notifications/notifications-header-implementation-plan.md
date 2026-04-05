# SlateCamp Notifications + Unified Header — Technical Implementation Plan

## Table of Contents

1. [Header Architecture Overview](#header-architecture-overview)
2. [Phase 1: Database Schema & Migrations](#phase-1-database-schema--migrations)
3. [Phase 2: TypeScript Types](#phase-2-typescript-types)
4. [Phase 3: Query Layer & Server Actions](#phase-3-query-layer--server-actions)
5. [Phase 4: Utility Functions](#phase-4-utility-functions)
6. [Phase 5: Zustand Store](#phase-5-zustand-store)
7. [Phase 6: NotificationIcon Component](#phase-6-notificationicon-component)
8. [Phase 7: NotificationItem Component](#phase-7-notificationitem-component)
9. [Phase 8: NotificationBell Component](#phase-8-notificationbell-component)
10. [Phase 9: Unified Header — HeaderActions Component](#phase-9-unified-header--headeractions-component)
11. [Phase 10: Notifications Page](#phase-10-notifications-page)
12. [Phase 11: Notification Triggers (Server-Side)](#phase-11-notification-triggers-server-side)
13. [Phase 12: Notification Preferences](#phase-12-notification-preferences)
14. [Phase 13: Supabase Realtime Upgrade](#phase-13-supabase-realtime-upgrade)
15. [Pre-Ship Checklist](#pre-ship-checklist)

---

## Header Architecture Overview

### The Problem

The student dashboard header currently has the Omnibar trigger and user avatar, but no notifications. We need to add a notification bell **between** the search trigger and the avatar, all grouped on the right side of the header.

### The Existing Omnibar

The Omnibar (`src/components/shared/Omnibar.tsx`) is a `cmdk`-powered floating panel modal that:
- Searches wiki articles via full-text `ilike` queries on Supabase
- Shows a results list + article preview sidebar (768px wide panel)
- Maintains search history in `localStorage`
- Triggers via `⌘K` / `Ctrl+K` keyboard shortcut
- Uses `FloatingPanel` component with `position="top-center"` and `backdrop="blur"`
- Is a **modal overlay** — the header only holds a trigger button for it

### Header Layout (Right Side)

```
┌─────────────────────────────────────────────────────────────────┐
│  [SlateCamp Logo]  [Nav Items...]           [🔍] [🔔 3] [MC]  │
│                                              ↑     ↑      ↑    │
│                                          Omnibar  Bell  Avatar  │
│                                          trigger               │
└─────────────────────────────────────────────────────────────────┘
```

**Right-side element order:** Search trigger → Notification bell → User avatar

**Spacing:** `gap-2` (8px) between elements. Each element is a 36×36px touch target minimum.

### Component Hierarchy

```
HeaderLayout (RSC — existing)
└── HeaderActions ('use client' — NEW)
    ├── OmnibarTrigger ('use client' — NEW)
    │   ├── Search icon button (36×36px ghost button)
    │   └── Omnibar (existing modal — renders via portal)
    │
    ├── NotificationBell ('use client' — NEW)
    │   ├── Bell icon + badge (36×36px ghost button)
    │   └── Popover (Shadcn — renders on click)
    │       ├── Popup header ("Notifications" + "Mark all read")
    │       ├── NotificationItem × 5 (shared component)
    │       └── Popup footer ("View all notifications" link)
    │
    └── UserAvatar (existing)
```

### File Structure (Final State)

```
src/
├── app/
│   └── notifications/
│       ├── page.tsx                          ← RSC — data fetching + auth guard
│       └── loading.tsx                       ← Skeleton loader
│
├── components/
│   ├── layout/
│   │   └── HeaderActions.tsx                 ← 'use client' — search + bell + avatar group
│   │
│   ├── notifications/
│   │   ├── NotificationBell.tsx              ← 'use client' — bell icon + popover
│   │   ├── NotificationList.tsx              ← 'use client' — full page feed
│   │   ├── NotificationItem.tsx              ← 'use client' — shared row component
│   │   ├── NotificationIcon.tsx              ← Pure — icon mapper by type
│   │   ├── NotificationFilters.tsx           ← 'use client' — filter pill bar
│   │   ├── NotificationPreferences.tsx       ← 'use client' — settings toggles
│   │   └── skeletons/
│   │       ├── NotificationBellSkeleton.tsx
│   │       └── NotificationListSkeleton.tsx
│   │
│   └── shared/
│       ├── Omnibar.tsx                       ← EXISTING — no changes needed
│       ├── OmnibarTrigger.tsx                ← NEW — extracted trigger button
│       └── floating-panel.tsx                ← EXISTING — used by Omnibar
│
├── lib/
│   ├── queries/
│   │   └── notifications.ts                 ← All Supabase read queries
│   ├── actions/
│   │   └── notifications.ts                 ← Server Actions (mark read, preferences)
│   └── utils/
│       └── notifications.ts                 ← Time formatting, grouping helpers
│
├── stores/
│   └── useNotificationStore.ts              ← Zustand store (badge count, recent items)
│
└── types/
    └── notifications.ts                     ← All TypeScript types + enums
```

### Build Order & Dependencies

```
Phase 1 (DB)
  │
  ▼
Phase 2 (Types) ──→ Phase 3 (Queries/Actions) ──→ Phase 4 (Utils)
                                                       │
                                                       ▼
Phase 5 (Store) ──→ Phase 6 (Icon) ──→ Phase 7 (Item) ──→ Phase 8 (Bell)
                                                              │
                                                              ▼
                                              Phase 9 (HeaderActions — INTEGRATION)
                                                              │
                                                              ▼
                                              Phase 10 (Notifications Page)
                                                              │
                                                              ▼
                                              Phase 11 (Triggers) → Phase 12 (Prefs) → Phase 13 (Realtime)
```

Each phase produces a working build. Run `npm run build` at every gate. Never combine phases.

---

## Phase 1: Database Schema & Migrations

**Estimated effort:** 1–2 days
**Dependencies:** None
**Builds on:** Existing `auth.users` and `profiles` tables

### Migration 1: `20260326_create_notifications.sql`

```sql
-- ============================================================
-- NOTIFICATIONS TABLE
-- Serves: Core loop re-engagement + progress signaling
-- Access pattern: User fetches own notifications, most recent first
-- Write pattern: Server-side triggers insert, user marks as read
-- ============================================================

-- Step 1: Create notification_type enum
CREATE TYPE public.notification_type AS ENUM (
  'score_change',
  'trail_ready',
  'blindspot',
  'zone_transition',
  'proof_unlocked',
  'campfire_story',
  'campfire_reply',
  'content_update',
  'weekly_digest',
  'coaching_tip',
  'billing',
  'system'
);

-- Step 2: Create notifications table
CREATE TABLE public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type public.notification_type NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  read_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Step 3: Indexes
-- Primary access pattern: user's notifications, newest first
CREATE INDEX idx_notifications_user_created
  ON public.notifications (user_id, created_at DESC);

-- Unread count query: WHERE user_id = X AND read_at IS NULL
CREATE INDEX idx_notifications_user_unread
  ON public.notifications (user_id)
  WHERE read_at IS NULL;

-- Cleanup job: delete notifications older than 30 days
CREATE INDEX idx_notifications_created_at
  ON public.notifications (created_at);

-- Step 4: RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own notifications"
  ON public.notifications FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- Service role inserts only — no INSERT policy for authenticated users
CREATE POLICY "Service can insert notifications"
  ON public.notifications FOR INSERT TO service_role
  WITH CHECK (true);

-- Step 5: updated_at trigger
CREATE TRIGGER tr_notifications_updated_at
  BEFORE UPDATE ON public.notifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Migration 2: `20260326_create_notification_preferences.sql`

```sql
-- ============================================================
-- NOTIFICATION PREFERENCES TABLE
-- Serves: User controls which notification types they receive
-- Access pattern: Checked on every notification insert (server-side)
-- Write pattern: User updates own preferences from settings page
-- ============================================================

CREATE TABLE public.notification_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Per-type toggles (all default ON except coaching_tips)
  score_changes BOOLEAN NOT NULL DEFAULT true,
  trail_ready BOOLEAN NOT NULL DEFAULT true,
  blindspot BOOLEAN NOT NULL DEFAULT true,
  milestones BOOLEAN NOT NULL DEFAULT true,
  campfire BOOLEAN NOT NULL DEFAULT true,
  content_updates BOOLEAN NOT NULL DEFAULT true,
  weekly_digest BOOLEAN NOT NULL DEFAULT true,
  coaching_tips BOOLEAN NOT NULL DEFAULT false,
  billing BOOLEAN NOT NULL DEFAULT true,

  -- Digest mode
  daily_digest BOOLEAN NOT NULL DEFAULT false,

  -- Quiet hours (user's local time)
  quiet_hours_start TIME DEFAULT NULL,
  quiet_hours_end TIME DEFAULT NULL,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notification_preferences_user_id
  ON public.notification_preferences (user_id);

ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own preferences"
  ON public.notification_preferences FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own preferences"
  ON public.notification_preferences FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own preferences"
  ON public.notification_preferences FOR UPDATE TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Service can select all preferences"
  ON public.notification_preferences FOR SELECT TO service_role
  USING (true);

CREATE TRIGGER tr_notification_preferences_updated_at
  BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Migration 3: `20260326_create_notification_helper.sql`

```sql
-- ============================================================
-- HELPER: create_notification()
-- Called by Server Actions / Edge Functions
-- Respects user preferences and daily cap (max 3/day)
-- ============================================================

CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id UUID,
  p_type public.notification_type,
  p_title TEXT,
  p_body TEXT,
  p_metadata JSONB DEFAULT '{}'::jsonb
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id UUID;
  v_is_enabled BOOLEAN := true;
  v_daily_count INTEGER;
  v_pref_column TEXT;
BEGIN
  -- 1. Map type → preference column
  v_pref_column := CASE p_type
    WHEN 'score_change'    THEN 'score_changes'
    WHEN 'trail_ready'     THEN 'trail_ready'
    WHEN 'blindspot'       THEN 'blindspot'
    WHEN 'zone_transition' THEN 'milestones'
    WHEN 'proof_unlocked'  THEN 'milestones'
    WHEN 'campfire_story'  THEN 'campfire'
    WHEN 'campfire_reply'  THEN 'campfire'
    WHEN 'content_update'  THEN 'content_updates'
    WHEN 'weekly_digest'   THEN 'weekly_digest'
    WHEN 'coaching_tip'    THEN 'coaching_tips'
    WHEN 'billing'         THEN 'billing'
    WHEN 'system'          THEN 'billing'
  END;

  -- 2. Check preferences (default true if no row)
  EXECUTE format(
    'SELECT COALESCE(
       (SELECT %I FROM public.notification_preferences WHERE user_id = $1),
       true
     )',
    v_pref_column
  ) INTO v_is_enabled USING p_user_id;

  IF NOT v_is_enabled THEN RETURN NULL; END IF;

  -- 3. Daily cap: max 3/day (excludes billing/system)
  IF p_type NOT IN ('billing', 'system') THEN
    SELECT COUNT(*) INTO v_daily_count
    FROM public.notifications
    WHERE user_id = p_user_id
      AND created_at >= (now() AT TIME ZONE 'Asia/Manila')::date::timestamptz
      AND type NOT IN ('billing', 'system');

    IF v_daily_count >= 3 THEN RETURN NULL; END IF;
  END IF;

  -- 4. Insert
  INSERT INTO public.notifications (user_id, type, title, body, metadata)
  VALUES (p_user_id, p_type, p_title, p_body, p_metadata)
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

REVOKE ALL ON FUNCTION public.create_notification FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_notification TO service_role;
```

### Post-Migration Verification

```bash
supabase db push
npx supabase gen types typescript --local > src/types/database.ts
npm run build  # Must pass
```

---

## Phase 2: TypeScript Types

**Estimated effort:** 0.5 day

### `src/types/notifications.ts`

```typescript
// ── Notification type enum (matches DB enum) ──
export type NotificationType =
  | 'score_change'
  | 'trail_ready'
  | 'blindspot'
  | 'zone_transition'
  | 'proof_unlocked'
  | 'campfire_story'
  | 'campfire_reply'
  | 'content_update'
  | 'weekly_digest'
  | 'coaching_tip'
  | 'billing'
  | 'system'

export type NotificationPriority = 'high' | 'medium' | 'low'
export type NotificationFilter = 'all' | 'progress' | 'trail' | 'campfire' | 'system'
export type TimeGroup = 'today' | 'yesterday' | 'this_week' | 'earlier'

// ── Core notification object (matches DB row) ──
export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  body: string
  metadata: NotificationMetadata
  read_at: string | null
  created_at: string
}

// ── Metadata JSONB payload (varies by type) ──
export interface NotificationMetadata {
  deep_link?: string
  old_score?: number
  new_score?: number
  topic_name?: string
  discipline_name?: string
  trail_day?: number
  duration_minutes?: number
  zone_name?: string
  threshold?: number
  passer_name?: string
  passer_school?: string
  post_id?: string
  content_title?: string
  content_type?: 'wiki' | '3d_module' | 'feature'
  content_slug?: string
  sessions_completed?: number
  topics_improved?: number
}

// ── User preferences (matches DB row) ──
export interface NotificationPreferences {
  score_changes: boolean
  trail_ready: boolean
  blindspot: boolean
  milestones: boolean
  campfire: boolean
  content_updates: boolean
  weekly_digest: boolean
  coaching_tips: boolean
  billing: boolean
  daily_digest: boolean
  quiet_hours_start: string | null
  quiet_hours_end: string | null
}

// ── Query result wrapper (standard SlateCamp pattern) ──
export interface QueryResult<T> {
  data: T | null
  error: string | null
}

// ── Grouped notifications (output of groupByTime utility) ──
export interface GroupedNotifications {
  label: TimeGroup
  displayLabel: string
  items: Notification[]
}

// ── Priority mapping ──
export const NOTIFICATION_PRIORITY: Record<NotificationType, NotificationPriority> = {
  score_change: 'high',
  trail_ready: 'high',
  blindspot: 'high',
  zone_transition: 'high',
  proof_unlocked: 'high',
  campfire_story: 'medium',
  campfire_reply: 'medium',
  content_update: 'medium',
  weekly_digest: 'medium',
  coaching_tip: 'low',
  billing: 'low',
  system: 'low',
}

// ── Deep link fallbacks ──
export const DEFAULT_DEEP_LINKS: Record<NotificationType, string> = {
  score_change: '/dashboard',
  trail_ready: '/dashboard/trail',
  blindspot: '/dashboard/heatmap',
  zone_transition: '/dashboard',
  proof_unlocked: '/dashboard/trail',
  campfire_story: '/dashboard/campfire',
  campfire_reply: '/dashboard/campfire',
  content_update: '/dashboard/wiki',
  weekly_digest: '/dashboard/heatmap',
  coaching_tip: '/dashboard',
  billing: '/dashboard/settings',
  system: '/dashboard',
}

// ── Filter → type mapping ──
export const FILTER_TYPE_MAP: Record<NotificationFilter, NotificationType[] | null> = {
  all: null,
  progress: ['score_change', 'zone_transition', 'blindspot', 'weekly_digest'],
  trail: ['trail_ready', 'proof_unlocked'],
  campfire: ['campfire_story', 'campfire_reply'],
  system: ['content_update', 'coaching_tip', 'billing', 'system'],
}
```

### Build Gate

```bash
npx tsc --noEmit  # Zero type errors
npm run build     # Zero build errors
```

---

## Phase 3: Query Layer & Server Actions

**Estimated effort:** 1 day
**Dependencies:** Phase 1 (tables), Phase 2 (types)
**Convention:** Queries in `src/lib/queries/`, mutations in `src/lib/actions/`

### `src/lib/queries/notifications.ts`

```typescript
import { createClient } from '@/lib/supabase/server'
import type {
  Notification,
  NotificationPreferences,
  NotificationFilter,
  QueryResult,
  FILTER_TYPE_MAP,
} from '@/types/notifications'

// NOTIFICATIONS: NotificationBell — unread count for header badge
export async function fetchUnreadCount(
  userId: string
): Promise<QueryResult<number>> {
  try {
    const supabase = createClient()
    const { count, error } = await supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .is('read_at', null)

    if (error) throw error
    return { data: count ?? 0, error: null }
  } catch (err) {
    console.error('[NOTIFICATIONS: Bell] fetchUnreadCount:', err)
    return { data: null, error: 'Failed to load notification count.' }
  }
}

// NOTIFICATIONS: NotificationBell — recent items for popup
export async function fetchRecentNotifications(
  userId: string,
  limit: number = 5
): Promise<QueryResult<Notification[]>> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('notifications')
      .select('id, user_id, type, title, body, metadata, read_at, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return { data: data as Notification[], error: null }
  } catch (err) {
    console.error('[NOTIFICATIONS: Bell] fetchRecentNotifications:', err)
    return { data: null, error: 'Failed to load notifications.' }
  }
}

// NOTIFICATIONS: NotificationsPage — paginated list with filters
export async function fetchNotifications(
  userId: string,
  options: {
    filter?: NotificationFilter
    cursor?: string    // ISO timestamp for cursor-based pagination
    limit?: number
  } = {}
): Promise<QueryResult<Notification[]>> {
  try {
    const supabase = createClient()
    const { filter = 'all', cursor, limit = 20 } = options

    let query = supabase
      .from('notifications')
      .select('id, user_id, type, title, body, metadata, read_at, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    // Apply filter
    const types = FILTER_TYPE_MAP[filter]
    if (types) {
      query = query.in('type', types)
    }

    // Cursor-based pagination
    if (cursor) {
      query = query.lt('created_at', cursor)
    }

    const { data, error } = await query
    if (error) throw error
    return { data: data as Notification[], error: null }
  } catch (err) {
    console.error('[NOTIFICATIONS: Page] fetchNotifications:', err)
    return { data: null, error: 'Failed to load notifications.' }
  }
}

// NOTIFICATIONS: Preferences
export async function fetchNotificationPreferences(
  userId: string
): Promise<QueryResult<NotificationPreferences>> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('notification_preferences')
      .select(
        'score_changes, trail_ready, blindspot, milestones, campfire, ' +
        'content_updates, weekly_digest, coaching_tips, billing, ' +
        'daily_digest, quiet_hours_start, quiet_hours_end'
      )
      .eq('user_id', userId)
      .maybeSingle()

    if (error) throw error

    // Return defaults if no preferences row exists
    if (!data) {
      return {
        data: {
          score_changes: true, trail_ready: true, blindspot: true,
          milestones: true, campfire: true, content_updates: true,
          weekly_digest: true, coaching_tips: false, billing: true,
          daily_digest: false, quiet_hours_start: null, quiet_hours_end: null,
        },
        error: null,
      }
    }

    return { data: data as NotificationPreferences, error: null }
  } catch (err) {
    console.error('[NOTIFICATIONS: Preferences] fetchPreferences:', err)
    return { data: null, error: 'Failed to load notification preferences.' }
  }
}
```

### `src/lib/actions/notifications.ts`

```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { NotificationPreferences } from '@/types/notifications'

// Mark a single notification as read
export async function markNotificationAsRead(notificationId: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'You must be logged in.' }

  const { error } = await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('id', notificationId)
    .eq('user_id', user.id)
    .is('read_at', null)

  if (error) {
    console.error('[NOTIFICATIONS] markAsRead failed:', error)
    return { error: 'Failed to mark notification as read.' }
  }

  revalidatePath('/notifications')
  return { success: true }
}

// Mark all notifications as read
export async function markAllNotificationsAsRead() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'You must be logged in.' }

  const { error } = await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('user_id', user.id)
    .is('read_at', null)

  if (error) {
    console.error('[NOTIFICATIONS] markAllAsRead failed:', error)
    return { error: 'Failed to mark notifications as read.' }
  }

  revalidatePath('/notifications')
  return { success: true }
}

// Update notification preferences
export async function updateNotificationPreferences(
  preferences: Partial<NotificationPreferences>
) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'You must be logged in.' }

  const { error } = await supabase
    .from('notification_preferences')
    .upsert(
      { user_id: user.id, ...preferences, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    )

  if (error) {
    console.error('[NOTIFICATIONS] updatePreferences failed:', error)
    return { error: 'Failed to update preferences.' }
  }

  revalidatePath('/notifications')
  return { success: true }
}

// Fetch unread count (for client-side polling via server action)
export async function getUnreadCount(): Promise<{ count: number; error: string | null }> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { count: 0, error: null }

  const { count, error } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .is('read_at', null)

  if (error) {
    console.error('[NOTIFICATIONS] getUnreadCount failed:', error)
    return { count: 0, error: 'Failed to fetch count.' }
  }

  return { count: count ?? 0, error: null }
}

// Fetch recent notifications (for client-side popup refresh)
export async function getRecentNotifications() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: [], error: null }

  const { data, error } = await supabase
    .from('notifications')
    .select('id, user_id, type, title, body, metadata, read_at, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  if (error) {
    console.error('[NOTIFICATIONS] getRecent failed:', error)
    return { data: [], error: 'Failed to fetch notifications.' }
  }

  return { data, error: null }
}
```

### Build Gate

```bash
npx tsc --noEmit
npm run build
```

---

## Phase 4: Utility Functions

**Estimated effort:** 0.25 day

### `src/lib/utils/notifications.ts`

```typescript
import type { Notification, GroupedNotifications, TimeGroup } from '@/types/notifications'
import { DEFAULT_DEEP_LINKS } from '@/types/notifications'

// Format relative timestamp
export function formatNotificationTime(isoString: string): string {
  const now = new Date()
  const date = new Date(isoString)
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60_000)
  const diffHours = Math.floor(diffMs / 3_600_000)
  const diffDays = Math.floor(diffMs / 86_400_000)

  if (diffMin < 1) return 'Just now'
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays === 1) return '1d ago'
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })
}

// Group notifications by time period
export function groupNotificationsByTime(
  notifications: Notification[]
): GroupedNotifications[] {
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterdayStart = new Date(todayStart.getTime() - 86_400_000)
  const weekStart = new Date(todayStart.getTime() - 7 * 86_400_000)

  const groups: Record<TimeGroup, Notification[]> = {
    today: [], yesterday: [], this_week: [], earlier: [],
  }

  for (const n of notifications) {
    const created = new Date(n.created_at)
    if (created >= todayStart) groups.today.push(n)
    else if (created >= yesterdayStart) groups.yesterday.push(n)
    else if (created >= weekStart) groups.this_week.push(n)
    else groups.earlier.push(n)
  }

  const labels: Record<TimeGroup, string> = {
    today: 'Today', yesterday: 'Yesterday',
    this_week: 'This week', earlier: 'Earlier',
  }

  return (Object.entries(groups) as [TimeGroup, Notification[]][])
    .filter(([, items]) => items.length > 0)
    .map(([label, items]) => ({ label, displayLabel: labels[label], items }))
}

// Get deep link for a notification
export function getNotificationDeepLink(notification: Notification): string {
  return notification.metadata?.deep_link ?? DEFAULT_DEEP_LINKS[notification.type]
}
```

---

## Phase 5: Zustand Store

**Estimated effort:** 0.5 day

### `src/stores/useNotificationStore.ts`

```typescript
import { create } from 'zustand'
import type { Notification } from '@/types/notifications'
import {
  getUnreadCount,
  getRecentNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '@/lib/actions/notifications'

interface NotificationStore {
  unreadCount: number
  recentNotifications: Notification[]
  isPopoverOpen: boolean
  isLoading: boolean

  setPopoverOpen: (open: boolean) => void
  fetchUnreadCount: () => Promise<void>
  fetchRecent: () => Promise<void>
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  startPolling: () => () => void
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  unreadCount: 0,
  recentNotifications: [],
  isPopoverOpen: false,
  isLoading: false,

  setPopoverOpen: (open) => {
    set({ isPopoverOpen: open })
    if (open) get().fetchRecent()
  },

  fetchUnreadCount: async () => {
    const { count } = await getUnreadCount()
    set({ unreadCount: count })
  },

  fetchRecent: async () => {
    set({ isLoading: true })
    const { data } = await getRecentNotifications()
    set({ recentNotifications: (data ?? []) as Notification[], isLoading: false })
    const { count } = await getUnreadCount()
    set({ unreadCount: count })
  },

  markAsRead: async (id) => {
    // Optimistic update
    set((s) => ({
      unreadCount: Math.max(0, s.unreadCount - 1),
      recentNotifications: s.recentNotifications.map((n) =>
        n.id === id ? { ...n, read_at: new Date().toISOString() } : n
      ),
    }))
    const result = await markNotificationAsRead(id)
    if (result.error) get().fetchRecent()  // Rollback
  },

  markAllAsRead: async () => {
    set((s) => ({
      unreadCount: 0,
      recentNotifications: s.recentNotifications.map((n) => ({
        ...n, read_at: n.read_at ?? new Date().toISOString(),
      })),
    }))
    const result = await markAllNotificationsAsRead()
    if (result.error) get().fetchRecent()
  },

  startPolling: () => {
    get().fetchUnreadCount()
    const id = setInterval(() => {
      if (!get().isPopoverOpen) get().fetchUnreadCount()
    }, 60_000)
    return () => clearInterval(id)
  },
}))
```

---

## Phase 6: NotificationIcon Component

**Estimated effort:** 0.25 day
**Convention:** Pure component, no directive needed

### `src/components/notifications/NotificationIcon.tsx`

```typescript
import {
  TrendUp,
  BookOpen,
  Warning,
  Star,
  Shield,
  ChatCircle,
  Monitor,
  Calendar,
  Lightbulb,
  CreditCard,
  Gear,
} from '@phosphor-icons/react/dist/ssr'
import { SCIcon } from '@/components/graphics/icons/Icon'
import type { NotificationType } from '@/types/notifications'

// Icon config: component, unread bg, unread stroke, read bg
const ICON_MAP: Record<NotificationType, {
  icon: typeof TrendUp
  unreadBg: string
  unreadStroke: string
}> = {
  score_change:   { icon: TrendUp,     unreadBg: 'bg-blue-50',   unreadStroke: 'text-[#1B3FC4]' },
  trail_ready:    { icon: BookOpen,     unreadBg: 'bg-green-50',  unreadStroke: 'text-[#1B7A3C]' },
  blindspot:      { icon: Warning,      unreadBg: 'bg-orange-50', unreadStroke: 'text-[#E8853A]' },
  zone_transition:{ icon: Star,         unreadBg: 'bg-blue-50',   unreadStroke: 'text-[#1B3FC4]' },
  proof_unlocked: { icon: Shield,       unreadBg: 'bg-blue-50',   unreadStroke: 'text-[#1B3FC4]' },
  campfire_story: { icon: ChatCircle,   unreadBg: 'bg-purple-50', unreadStroke: 'text-[#534AB7]' },
  campfire_reply: { icon: ChatCircle,   unreadBg: 'bg-purple-50', unreadStroke: 'text-[#534AB7]' },
  content_update: { icon: Monitor,      unreadBg: 'bg-blue-50',   unreadStroke: 'text-[#1B3FC4]' },
  weekly_digest:  { icon: Calendar,     unreadBg: 'bg-muted',     unreadStroke: 'text-muted-foreground' },
  coaching_tip:   { icon: Lightbulb,    unreadBg: 'bg-muted',     unreadStroke: 'text-muted-foreground' },
  billing:        { icon: CreditCard,   unreadBg: 'bg-muted',     unreadStroke: 'text-muted-foreground' },
  system:         { icon: Gear,         unreadBg: 'bg-muted',     unreadStroke: 'text-muted-foreground' },
}

interface NotificationIconProps {
  type: NotificationType
  isUnread: boolean
}

export function NotificationIcon({ type, isUnread }: NotificationIconProps) {
  const config = ICON_MAP[type]
  return (
    <div className={`flex-shrink-0 w-9 h-9 rounded-[10px] flex items-center justify-center ${
      isUnread ? config.unreadBg : 'bg-muted'
    }`}>
      <SCIcon
        icon={config.icon}
        size="sm"
        className={isUnread ? config.unreadStroke : 'text-muted-foreground'}
      />
    </div>
  )
}
```

---

## Phase 7: NotificationItem Component

**Estimated effort:** 0.5 day

### `src/components/notifications/NotificationItem.tsx`

```typescript
'use client'

import { useRouter } from 'next/navigation'
import { NotificationIcon } from '@/components/notifications/NotificationIcon'
import { useNotificationStore } from '@/stores/useNotificationStore'
import { formatNotificationTime, getNotificationDeepLink } from '@/lib/utils/notifications'
import { cn } from '@/lib/utils'
import type { Notification } from '@/types/notifications'

interface NotificationItemProps {
  notification: Notification
  variant?: 'popup' | 'page'
}

export function NotificationItem({ notification, variant = 'page' }: NotificationItemProps) {
  const router = useRouter()
  const markAsRead = useNotificationStore((s) => s.markAsRead)
  const setPopoverOpen = useNotificationStore((s) => s.setPopoverOpen)

  const isUnread = notification.read_at === null
  const deepLink = getNotificationDeepLink(notification)

  function handleClick() {
    if (isUnread) markAsRead(notification.id)
    if (variant === 'popup') setPopoverOpen(false)
    router.push(deepLink)
  }

  return (
    <button
      onClick={handleClick}
      className={cn(
        'flex w-full gap-3.5 px-4 py-3.5 text-left transition-colors duration-150 cursor-pointer',
        isUnread
          ? 'bg-[color:var(--color-background-info)] border-l-[3px] border-l-[#1B3FC4]'
          : 'border-l-[3px] border-l-transparent hover:bg-muted/50',
      )}
    >
      <NotificationIcon type={notification.type} isUnread={isUnread} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className={cn(
            'text-[13px] truncate',
            isUnread ? 'font-medium text-foreground' : 'text-muted-foreground'
          )}>
            {notification.title}
          </p>
          <span className="text-[11px] text-muted-foreground flex-shrink-0">
            {formatNotificationTime(notification.created_at)}
          </span>
        </div>
        <p className={cn(
          'text-[12px] mt-0.5 line-clamp-2',
          isUnread ? 'text-muted-foreground' : 'text-muted-foreground/70'
        )}>
          {notification.body}
        </p>
      </div>
    </button>
  )
}
```

---

## Phase 8: NotificationBell Component

**Estimated effort:** 1 day
**Dependencies:** Phase 5 (store), Phase 7 (item)

### `src/components/notifications/NotificationBell.tsx`

```typescript
'use client'

import { useEffect } from 'react'
import { Bell } from '@phosphor-icons/react/dist/ssr'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useNotificationStore } from '@/stores/useNotificationStore'
import { NotificationItem } from '@/components/notifications/NotificationItem'
import { CircleNotch } from '@phosphor-icons/react/dist/ssr'
import Link from 'next/link'

export function NotificationBell() {
  const {
    unreadCount,
    recentNotifications,
    isPopoverOpen,
    isLoading,
    setPopoverOpen,
    markAllAsRead,
    startPolling,
  } = useNotificationStore()

  // Start polling on mount
  useEffect(() => {
    const cleanup = startPolling()
    return cleanup
  }, [startPolling])

  // Clamp display count
  const displayCount = unreadCount > 9 ? '9+' : unreadCount

  return (
    <Popover open={isPopoverOpen} onOpenChange={setPopoverOpen}>
      <PopoverTrigger asChild>
        <button
          className="relative flex items-center justify-center w-9 h-9 rounded-lg hover:bg-muted transition-colors duration-150"
          aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
        >
          <Bell size={20} weight="regular" className="text-foreground" />

          {/* Badge */}
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-[#1B3FC4] text-white text-[10px] font-semibold leading-none">
              {displayCount}
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[380px] p-0 rounded-xl shadow-lg border border-border overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <span className="text-sm font-medium text-foreground">Notifications</span>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-xs text-primary hover:underline"
            >
              Mark all read
            </button>
          )}
        </div>

        {/* Items */}
        <div className="max-h-[400px] overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <CircleNotch size={20} className="text-muted-foreground animate-spin" />
            </div>
          ) : recentNotifications.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm text-muted-foreground">No notifications yet</p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                Complete a session to start receiving updates
              </p>
            </div>
          ) : (
            recentNotifications.map((n) => (
              <NotificationItem
                key={n.id}
                notification={n}
                variant="popup"
              />
            ))
          )}
        </div>

        {/* Footer */}
        {recentNotifications.length > 0 && (
          <div className="border-t border-border px-4 py-3 text-center">
            <Link
              href="/notifications"
              onClick={() => setPopoverOpen(false)}
              className="text-xs text-primary hover:underline"
            >
              View all notifications
            </Link>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
```

---

## Phase 9: Unified Header — HeaderActions Component

**This is the integration phase.** This is where the existing Omnibar and the new NotificationBell come together in the header.

**Estimated effort:** 1 day
**Dependencies:** Phase 8 (bell complete), existing Omnibar working

### Step 1: Extract OmnibarTrigger

The existing Omnibar is toggled by `open` / `setOpen` state. Currently, whatever parent component holds this state also renders a trigger button. We extract that trigger into a dedicated component so `HeaderActions` can compose it cleanly.

#### `src/components/shared/OmnibarTrigger.tsx`

```typescript
'use client'

import { useState } from 'react'
import { MagnifyingGlass } from '@phosphor-icons/react/dist/ssr'
import { Omnibar } from '@/components/shared/Omnibar'

export function OmnibarTrigger() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Trigger button — ghost style, 36×36px touch target */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center justify-center w-9 h-9 rounded-lg hover:bg-muted transition-colors duration-150"
        aria-label="Search (Ctrl+K)"
      >
        <MagnifyingGlass size={20} weight="regular" className="text-foreground" />
      </button>

      {/* The Omnibar modal renders via portal — no layout impact */}
      <Omnibar open={open} setOpen={setOpen} />
    </>
  )
}
```

**Why extract?** The Omnibar component already handles its own `⌘K` listener internally, so even without clicking the trigger button, the keyboard shortcut works. The trigger is just the visual affordance in the header.

### Step 2: Create HeaderActions

This is the unified right-side header group that composes all three elements.

#### `src/components/layout/HeaderActions.tsx`

```typescript
'use client'

import { OmnibarTrigger } from '@/components/shared/OmnibarTrigger'
import { NotificationBell } from '@/components/notifications/NotificationBell'

// UserAvatar — import from wherever it currently lives in your codebase
// If it's inline in the layout, extract it first.
// import { UserAvatar } from '@/components/layout/UserAvatar'

interface HeaderActionsProps {
  /** User initials for the avatar (e.g., "MC") */
  userInitials: string
  /** Full name for aria-label */
  userName: string
}

export function HeaderActions({ userInitials, userName }: HeaderActionsProps) {
  return (
    <div className="flex items-center gap-2">
      {/* 1. Search trigger → opens Omnibar modal */}
      <OmnibarTrigger />

      {/* 2. Notification bell → opens popover */}
      <NotificationBell />

      {/* 3. User avatar */}
      <button
        className="flex items-center justify-center w-9 h-9 rounded-full bg-[color:var(--color-background-info)] text-[#1B3FC4] text-xs font-medium"
        aria-label={`Profile: ${userName}`}
      >
        {userInitials}
      </button>
    </div>
  )
}
```

### Step 3: Wire into Existing Header Layout

Find the existing header layout component (likely in `src/app/dashboard/layout.tsx` or a shared `Header.tsx`). Replace the current right-side content with the new `HeaderActions` component.

**Before (pseudocode of what likely exists):**

```tsx
// Inside the header's right side
<div className="flex items-center gap-...">
  {/* Some search trigger */}
  <button onClick={() => setOmnibarOpen(true)}>
    <MagnifyingGlass />
  </button>
  <Omnibar open={omnibarOpen} setOpen={setOmnibarOpen} />

  {/* Avatar */}
  <div className="w-8 h-8 rounded-full ...">MC</div>
</div>
```

**After:**

```tsx
import { Suspense } from 'react'
import { HeaderActions } from '@/components/layout/HeaderActions'
import { Skeleton } from '@/components/ui/skeleton'

// Inside the header's right side — replace the existing search + avatar block
<Suspense fallback={
  <div className="flex items-center gap-2">
    <Skeleton className="w-9 h-9 rounded-lg" />
    <Skeleton className="w-9 h-9 rounded-lg" />
    <Skeleton className="w-9 h-9 rounded-full" />
  </div>
}>
  <HeaderActions
    userInitials={getUserInitials(user)}
    userName={user.full_name ?? 'User'}
  />
</Suspense>
```

### Step 4: Remove Old Omnibar State from Layout

If the current layout holds `useState` for the Omnibar's `open` state, **remove it**. The `OmnibarTrigger` component now owns that state internally. This also means if the layout was previously a Server Component but had `'use client'` only because of the Omnibar state, it can potentially become a Server Component again (push `'use client'` to the leaves).

### Header Layout Spec (Visual)

```
┌────────────────────────────────────────────────────────────────────────┐
│  h=56px, bg-background, border-b border-border, sticky top-0 z-50    │
│                                                                        │
│  [Logo "SlateCamp"]  [... nav or breadcrumbs ...]     [🔍] [🔔₃] [MC] │
│                                                        ↑    ↑     ↑    │
│                                                     36px  36px  36px   │
│                                                        ← gap-2 (8px)  │
│                                                                        │
│  padding: 0 24px (desktop), 0 16px (mobile)                           │
└────────────────────────────────────────────────────────────────────────┘
```

**Element dimensions:**
- Search trigger: `w-9 h-9` (36×36px), `rounded-lg`, ghost button
- Notification bell: `w-9 h-9` (36×36px), `rounded-lg`, ghost button
- User avatar: `w-9 h-9` (36×36px), `rounded-full`, info bg
- Gap between all three: `gap-2` (8px)

**Hover state for all three:** `hover:bg-muted` — consistent ghost button behavior.

**Mobile (<768px):** Same layout, same sizes. The popover width becomes `calc(100vw - 32px)` and aligns to the right edge with 16px margin.

### Build Gate

```bash
npx tsc --noEmit
npm run build
# Manual test: click search icon → Omnibar opens
# Manual test: ⌘K → Omnibar opens
# Manual test: click bell → popover opens
# Manual test: click avatar → navigates to profile/settings
```

---

## Phase 10: Notifications Page

**Estimated effort:** 1–2 days
**Dependencies:** Phase 7 (NotificationItem), Phase 3 (queries)

### `src/app/notifications/page.tsx` (Server Component)

```typescript
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { fetchNotifications } from '@/lib/queries/notifications'
import { NotificationList } from '@/components/notifications/NotificationList'

export const metadata = { title: 'Notifications — SlateCamp' }

export default async function NotificationsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: notifications } = await fetchNotifications(user.id, { limit: 20 })

  return <NotificationList initialNotifications={notifications ?? []} />
}
```

### `src/app/notifications/loading.tsx`

```typescript
import { Skeleton } from '@/components/ui/skeleton'

export default function NotificationsLoading() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      {/* Header skeleton */}
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="h-7 w-40" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-24 rounded-lg" />
          <Skeleton className="h-8 w-20 rounded-lg" />
        </div>
      </div>
      {/* Filter pills skeleton */}
      <div className="flex gap-1.5 mb-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-7 w-20 rounded-full" />
        ))}
      </div>
      {/* Time group label */}
      <Skeleton className="h-3 w-12 mb-3" />
      {/* Notification items skeleton */}
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex gap-3.5 px-4 py-3.5 mb-px">
          <Skeleton className="w-9 h-9 rounded-[10px] flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-full" />
          </div>
        </div>
      ))}
    </div>
  )
}
```

### `src/components/notifications/NotificationList.tsx` (Client Component)

```typescript
'use client'

import { useState, useTransition } from 'react'
import { NotificationItem } from '@/components/notifications/NotificationItem'
import { NotificationFilters } from '@/components/notifications/NotificationFilters'
import { groupNotificationsByTime } from '@/lib/utils/notifications'
import { markAllNotificationsAsRead } from '@/lib/actions/notifications'
import Link from 'next/link'
import type { Notification, NotificationFilter } from '@/types/notifications'
import { FILTER_TYPE_MAP } from '@/types/notifications'

interface NotificationListProps {
  initialNotifications: Notification[]
}

export function NotificationList({ initialNotifications }: NotificationListProps) {
  const [notifications] = useState(initialNotifications)
  const [filter, setFilter] = useState<NotificationFilter>('all')
  const [isPending, startTransition] = useTransition()

  // Client-side filtering
  const filtered = filter === 'all'
    ? notifications
    : notifications.filter((n) => FILTER_TYPE_MAP[filter]?.includes(n.type))

  const grouped = groupNotificationsByTime(filtered)

  function handleMarkAllRead() {
    startTransition(async () => {
      await markAllNotificationsAsRead()
    })
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-xl font-medium text-foreground">Notifications</h1>
        <div className="flex gap-2">
          <button
            onClick={handleMarkAllRead}
            disabled={isPending}
            className="text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground transition-colors"
          >
            Mark all read
          </button>
          <Link
            href="/dashboard/settings"
            className="text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground transition-colors"
          >
            Settings
          </Link>
        </div>
      </div>
      <p className="text-[13px] text-muted-foreground mb-5">
        Stay on top of your progress and camp updates
      </p>

      {/* Filters */}
      <NotificationFilters activeFilter={filter} onFilterChange={setFilter} />

      {/* Grouped feed */}
      {grouped.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-sm text-muted-foreground">
            {filter === 'all'
              ? 'No notifications yet. Complete your first session to start receiving updates.'
              : `No ${filter} notifications.`}
          </p>
        </div>
      ) : (
        grouped.map((group) => (
          <div key={group.label} className="mb-6">
            <p className="font-mono text-[11px] font-medium uppercase tracking-widest text-muted-foreground mb-2 px-4">
              {group.displayLabel}
            </p>
            <div className="bg-card rounded-lg overflow-hidden border border-border">
              {group.items.map((n) => (
                <NotificationItem key={n.id} notification={n} variant="page" />
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
```

### `src/components/notifications/NotificationFilters.tsx`

```typescript
'use client'

import { cn } from '@/lib/utils'
import type { NotificationFilter } from '@/types/notifications'

const FILTERS: { value: NotificationFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'progress', label: 'Progress' },
  { value: 'trail', label: 'Trail' },
  { value: 'campfire', label: 'Campfire' },
  { value: 'system', label: 'System' },
]

interface NotificationFiltersProps {
  activeFilter: NotificationFilter
  onFilterChange: (filter: NotificationFilter) => void
}

export function NotificationFilters({ activeFilter, onFilterChange }: NotificationFiltersProps) {
  return (
    <div className="flex gap-1.5 mb-6 flex-wrap">
      {FILTERS.map((f) => (
        <button
          key={f.value}
          onClick={() => onFilterChange(f.value)}
          className={cn(
            'text-xs px-3.5 py-1.5 rounded-full transition-colors duration-150',
            activeFilter === f.value
              ? 'bg-foreground text-background'
              : 'bg-card border border-border text-muted-foreground hover:border-border/80'
          )}
        >
          {f.label}
        </button>
      ))}
    </div>
  )
}
```

---

## Phase 11: Notification Triggers (Server-Side)

**Estimated effort:** 2–3 days

These server-side functions create notifications when events happen. They use the `create_notification()` database function which handles preference checks and daily caps.

### Trigger Hooks

| Trigger Event | Notification Type | Where to Hook |
|---|---|---|
| Session completed → score changes | `score_change` | Post-session server action (after readiness score recalculation) |
| Camp Trail day unlocked | `trail_ready` | Daily cron / edge function (at user's timezone) |
| Blindspot Protocol detects gaps (>14 days untouched) | `blindspot` | Weekly cron job |
| Score crosses zone threshold | `zone_transition` | Post-session server action |
| User reaches Proof Simulation eligibility | `proof_unlocked` | Post-session server action |
| New Campfire post by a passer | `campfire_story` | Campfire post creation action |
| Reply to user's Campfire post | `campfire_reply` | Campfire reply creation action |
| New wiki article or 3D module published | `content_update` | Content publish action |
| Weekly digest (Sunday evening) | `weekly_digest` | Weekly cron job |
| Subscription renewal approaching (7 days) | `billing` | Billing cron job |

### Example: Score Change Trigger

Add this call at the end of the existing session completion server action:

```typescript
// Inside the existing completeSession() server action, after score recalculation

import { createClient } from '@supabase/supabase-js'

// Use service role client for notification insertion
const serviceClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Only notify if score actually changed
if (newScore !== previousScore) {
  await serviceClient.rpc('create_notification', {
    p_user_id: userId,
    p_type: 'score_change',
    p_title: 'Your Readiness Score moved',
    p_body: `${previousScore} → ${newScore} after today's session on ${topicName}`,
    p_metadata: {
      deep_link: '/dashboard',
      old_score: previousScore,
      new_score: newScore,
      topic_name: topicName,
    },
  })
}
```

---

## Phase 12: Notification Preferences

**Estimated effort:** 1 day
**Route:** `/dashboard/settings` (add a "Notifications" section to existing settings page)

Build a `NotificationPreferences` client component with Shadcn `Switch` toggles for each notification category, grouped into "Progress & Study," "Community & Content," and "Other" sections, plus quiet hours time pickers. Uses the `updateNotificationPreferences` server action.

---

## Phase 13: Supabase Realtime Upgrade

**Estimated effort:** 0.5 day
**When:** After Phase 12 is stable and tested

Replace the 60-second polling in `useNotificationStore` with a Supabase Realtime subscription:

```typescript
// In useNotificationStore.ts — replace startPolling()
startRealtime: () => {
  const supabase = createClient()
  const channel = supabase
    .channel('notifications')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        set((s) => ({
          unreadCount: s.unreadCount + 1,
          recentNotifications: [payload.new as Notification, ...s.recentNotifications].slice(0, 5),
        }))
      }
    )
    .subscribe()

  return () => { supabase.removeChannel(channel) }
}
```

---

## Pre-Ship Checklist

### Architecture

- [ ] No inline components in routing files
- [ ] No `'use client'` on components that don't need it
- [ ] No Supabase calls outside `src/lib/queries/` or `src/lib/actions/`
- [ ] No `select('*')` queries
- [ ] Omnibar trigger extracted — layout no longer holds Omnibar state
- [ ] `HeaderActions` is the single `'use client'` island in the header

### TypeScript

- [ ] No new `any` types
- [ ] No `@ts-ignore` without explanation
- [ ] All exported functions have return types
- [ ] All props have explicit interfaces

### Imports

- [ ] No unused imports
- [ ] All imports use `@/` absolute paths
- [ ] No barrel files mixing Server/Client components

### Data

- [ ] All queries scope to `user_id`
- [ ] Errors handled and returned as `QueryResult<T>`
- [ ] RLS policies tested: user can only see own notifications
- [ ] `(select auth.uid())` wrapped in subselect in RLS policies

### UX Contract

- [ ] NotificationBell has skeleton loading state
- [ ] NotificationsPage has skeleton loading state (`loading.tsx`)
- [ ] Popup has empty state with CTA
- [ ] Page has empty state with CTA
- [ ] Badge count capped at 9+
- [ ] Badge color is Cobalt Blue (#1B3FC4), never red
- [ ] Unread items use 3 signals: left border + background tint + font weight
- [ ] All interactive elements have 44×44px minimum touch targets
- [ ] Bell icon has `aria-label` with unread count
- [ ] Popover keyboard-navigable (Escape to close)

### Omnibar Integration

- [ ] `⌘K` / `Ctrl+K` still opens Omnibar from any page
- [ ] Search trigger icon click opens Omnibar
- [ ] Omnibar modal does not conflict with notification popover (both can't be open simultaneously — Omnibar renders as backdrop-blur modal which blocks popover)
- [ ] No duplicate `⌘K` listeners (Omnibar handles its own)
- [ ] Search history in `localStorage` still works

### Brand

- [ ] Feels like a coach, not a machine
- [ ] No gamification debris (no confetti, no streak counts)
- [ ] DM Mono eyebrow pattern for time group labels
- [ ] Consistent ghost button styling across all three header actions

### Build

- [ ] `npm run build` → zero errors
- [ ] `npx tsc --noEmit` → zero errors
- [ ] No `console.log` statements (only `console.error` in catch blocks)
