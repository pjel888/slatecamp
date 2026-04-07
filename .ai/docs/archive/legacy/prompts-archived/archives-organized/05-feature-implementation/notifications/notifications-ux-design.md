# SlateCamp Notifications — UX Research & Design Specification

## Table of Contents

1. [UX Research Foundation](#ux-research-foundation)
2. [Notification Category Taxonomy](#notification-category-taxonomy)
3. [Notification Type Inventory](#notification-type-inventory)
4. [Header Notification Bell (Popup)](#header-notification-bell-popup)
5. [Notifications Page](#notifications-page)
6. [Design Decisions](#design-decisions)
7. [Component Architecture](#component-architecture)
8. [Implementation Roadmap](#implementation-roadmap)
9. [Empty, Loading, and Error States](#empty-loading-and-error-states)
10. [Notification Preferences (Settings)](#notification-preferences-settings)
11. [Anti-Patterns — What We Never Build](#anti-patterns--what-we-never-build)

---

## UX Research Foundation

### Why Notifications Exist in SlateCamp

SlateCamp's core loop is **study → measure → adjust → study**. Notifications exist to **re-engage students who've drifted** and **surface progress signals that trigger the next session**. They are not a marketing channel. They are not a retention hack. They are a coach tapping you on the shoulder.

Every notification must pass one test: **"Does this help the student study today or understand where they stand?"** If the answer is no, it doesn't get sent.

---

### Persona-Specific Notification Psychology

#### Persona 1: The Anxious First-Taker

- **Needs:** Gentle nudges that feel like a coach checking in, not a countdown to doom.
- **What works:** "Your Trail day is ready" — clear, actionable, no pressure.
- **What destroys trust:** "Only 46 days left!" — anxiety amplification. This persona is already anxious. Notifications must reduce anxiety, not inflate it.
- **Frequency tolerance:** 1–2 per day maximum. More than that triggers overwhelm.
- **Preferred types:** Trail day unlocked, score changes (upward), heatmap progress.

#### Persona 2: The Retaker

- **Needs:** Progress confirmation without judgment. Shame-sensitive — will disable notifications at the first sign of guilt.
- **What works:** "Your Heatmap shifted — 2 topics moved to amber." Progress signals, not guilt signals.
- **What destroys trust:** "You haven't studied in 3 days" — reads as failure confirmation. Retakers already carry shame from their previous attempt. Never remind them of inaction.
- **Frequency tolerance:** 1 per day. Less is more.
- **Preferred types:** Heatmap changes, blindspot detections, milestone transitions. Anything that says "the system sees your effort."

#### Persona 3: The Undergrad Prepper

- **Needs:** Curiosity-driven engagement. Low urgency, high ghost risk.
- **What works:** "A new 3D module is live: Stairway Design" — novelty and exploration.
- **What destroys trust:** Obligation-framing ("You should study today"). This persona hasn't committed to urgency yet.
- **Frequency tolerance:** 2–3 per week. Daily is too aggressive for their commitment level.
- **Preferred types:** Content updates, new features, Campfire activity. Notifications are the primary retention lever for this persona — but they must feel optional.

#### Persona 4: The Working Professional Returner

- **Needs:** Respect for their time. One daily nudge maximum.
- **What works:** "Your 25-min session is ready" — acknowledges their constraint, provides a clear time commitment.
- **What destroys trust:** Three notifications in an evening. This persona is juggling a job, possibly a family, and a licensure goal. Notification spam = instant unsubscribe.
- **Frequency tolerance:** 1 per day, ideally at their preferred study time.
- **Preferred types:** Trail day ready (with time estimate), weekly digest, score milestones.

---

### Research Insights Driving Design Decisions

| Insight | Evidence | Design Implication |
|---|---|---|
| ALE candidates check their phone 3–5x during study breaks | Interview data from 12 participants | Popup must load instantly; no loading spinner for badge count |
| Retakers associate red badges with failure signals | 4/6 retaker interviews mentioned "red dot anxiety" | Badge color is Cobalt Blue (#1B3FC4), never red |
| Students scan notifications for score changes first | Card-sorting exercise: 8/10 ranked score updates as #1 priority | Score change notifications always sort to top within time groups |
| Filipino students respond to social proof from batchmates | Cultural research — hiya (shame) culture + social proof weight | Campfire notifications include passer name, school, and score delta |
| Working professionals want a single daily touchpoint | 5/5 working professional interviews | Implement daily digest option in notification preferences |
| Users who receive >3 notifications/day have 40% higher unsubscribe rates | Industry benchmark (Leanplum, 2023) | Hard cap: maximum 3 notifications per user per day |

---

## Notification Category Taxonomy

### Categories and Priority Levels

```
┌─────────────────────────────────────────────────────────┐
│  CORE LOOP (High Priority)                              │
│  ├── Study Triggers — Trail day ready                   │
│  ├── Progress Signals — Score/heatmap changes           │
│  └── Milestone Alerts — Zone transitions                │
├─────────────────────────────────────────────────────────┤
│  ENGAGEMENT (Medium Priority)                           │
│  ├── Campfire Activity — Passer stories, replies        │
│  ├── Content Updates — New wiki, 3D modules             │
│  └── System Notices — Account, billing, tips            │
├─────────────────────────────────────────────────────────┤
│  NEVER NOTIFY (Blocked)                                 │
│  ├── Guilt trips ("You haven't studied in X days")      │
│  ├── Countdown anxiety ("Only X days left!")            │
│  ├── Fake urgency ("Don't miss out!")                   │
│  └── Streak breaks ("You lost your streak!")            │
└─────────────────────────────────────────────────────────┘
```

---

## Notification Type Inventory

### High Priority — Show in Popup + Page

These notifications appear in both the header bell popup and the full notifications page. They increment the badge count.

| Type | Title Pattern | Body Pattern | Icon | Icon Color | Deep Link |
|---|---|---|---|---|---|
| `score_change` | "Your Readiness Score moved" | "{old} → {new} after today's session on {topic}" | Trending up arrow | Cobalt Blue #1B3FC4 | `/score` |
| `trail_ready` | "Day {n} is ready" | "{topic} — estimated {duration} min" | Book icon | Signal Green #1B7A3C | `/trail/day/{n}` |
| `blindspot` | "Blindspot detected: {discipline}" | "{count} topics haven't been touched in {days} days" | Alert circle | Camp Orange #E8853A | `/map/discipline/{id}` |
| `zone_transition` | "You entered the {zone} Zone" | "Your Readiness Score crossed {threshold}. {encouragement}" | Star icon | Zone color | `/score` |
| `proof_unlocked` | "Proof Simulation unlocked" | "You've reached the threshold. Ready to test under real conditions?" | Shield icon | Cobalt Blue #1B3FC4 | `/proof` |

### Medium Priority — Page + Badge Count Only

These notifications appear on the full page and increment the badge count, but do not appear in the popup's top 5 unless there are fewer than 5 high-priority unread items.

| Type | Title Pattern | Body Pattern | Icon | Deep Link |
|---|---|---|---|---|
| `campfire_story` | "New passer story in Campfire" | "{quote excerpt} — {name}, {school}" | Chat bubble | `/campfire/post/{id}` |
| `campfire_reply` | "{name} replied to your post" | "{reply excerpt}" | Chat bubble | `/campfire/post/{id}` |
| `content_update` | "New {type} available" | "{title} — {description}" | Monitor icon | `/wiki/{slug}` or `/3d-lab/{id}` |
| `weekly_digest` | "Your weekly heatmap digest" | "{sessions} sessions. {changes} topics improved." | Calendar icon | `/map` |

### Low Priority — Page Only, No Badge

These notifications appear only on the full notifications page. They do not increment the badge count.

| Type | Title Pattern | Body Pattern | Icon | Deep Link |
|---|---|---|---|---|
| `coaching_tip` | "Tip: {tip_title}" | "{tip_body}" | Lightbulb icon | varies |
| `billing` | "Your Pro subscription renews in {days} days" | "Manage your subscription in settings" | Credit card icon | `/settings/billing` |
| `system` | "{title}" | "{body}" | Gear icon | varies |

---

## Header Notification Bell (Popup)

### Component: `NotificationBell`

**Location:** Right side of the global header, left of the user avatar.

**Behavior:**

1. **Default state:** Bell icon (22×22px) with no badge. Uses `stroke="var(--color-text-primary)"`, `stroke-width="1.5"`.
2. **Unread state:** Bell icon with a Cobalt Blue (#1B3FC4) circular badge at top-right. Badge displays the unread count (1–9). If count > 9, display "9+". Badge is 16×16px with white text at 9px font-weight 600.
3. **Click:** Opens a popover dropdown positioned below-right of the bell icon. Uses Shadcn `Popover` component.
4. **Auto-refresh:** Unread count polls every 60 seconds via the `useNotifications` Zustand store. Future: swap to Supabase Realtime subscription.

### Popup Layout

```
┌──────────────────────────────────────┐
│  Notifications          Mark all read │  ← Header row
├──────────────────────────────────────┤
│  ┃ [icon] Score moved: 68 → 72      │  ← Unread (blue left border)
│  ┃        Structural Systems · 2h    │
├──────────────────────────────────────┤
│  ┃ [icon] Day 15 is ready            │  ← Unread
│  ┃        Building Utilities · 5h    │
├──────────────────────────────────────┤
│  ┃ [icon] Blindspot: Building Laws   │  ← Unread
│  ┃        3 topics, 14 days · 6h     │
├──────────────────────────────────────┤
│    [icon] Passer story in Campfire   │  ← Read (no border, muted text)
│           Ana R., TIP · 2d           │
├──────────────────────────────────────┤
│         View all notifications       │  ← Footer link
└──────────────────────────────────────┘
```

**Popup width:** 380px (desktop), full-screen-width minus 32px (mobile).

**Maximum items in popup:** 5. Prioritize unread items, then most recent.

**Popup header:**
- Left: "Notifications" — 14px, font-weight 500, `color: var(--color-text-primary)`
- Right: "Mark all read" — 12px, `color: var(--color-text-info)`, click triggers `markAllRead` server action

**Popup footer:**
- Centered: "View all notifications" — 12px, `color: var(--color-text-info)`, links to `/notifications`
- Padding: 12px 16px

### Notification Item (Shared Component)

The `NotificationItem` component is used in both the popup and the full page.

**Unread treatment (3 combined signals):**
1. Left border: `border-left: 3px solid #1B3FC4` (Cobalt Blue)
2. Background: `background: var(--color-background-info)` (subtle tint)
3. Title weight: `font-weight: 500` (medium)

**Read treatment:**
1. No left border
2. Background: `var(--color-background-primary)` (default card surface)
3. Title color: `var(--color-text-secondary)` (muted)

**Accessibility note:** The unread state does not rely on color alone. Three independent cues (border, background, text weight) ensure the state is perceivable by colorblind users and users with low contrast sensitivity.

**Item layout:**

```
┌──────────────────────────────────────────┐
│  ┃  [36px icon]  Title text        2h ago│
│  ┃               Body text / description │
└──────────────────────────────────────────┘
```

- **Icon container:** 36×36px, `border-radius: 10px`, colored background per notification type
- **Gap between icon and text:** 14px
- **Title:** 13px, font-weight 500 (unread) or 400 (read)
- **Body:** 12px, `color: var(--color-text-secondary)` (unread) or `var(--color-text-tertiary)` (read)
- **Timestamp:** 11px, `color: var(--color-text-tertiary)`, right-aligned, flex-shrink: 0
- **Padding:** 14px 16px
- **Click behavior:** Navigate to deep link URL, mark as read via server action

### Icon Color Mapping

| Notification Type | Icon Background (Unread) | Icon Stroke Color | Icon Background (Read) |
|---|---|---|---|
| `score_change` | `var(--color-background-info)` | `#1B3FC4` | `var(--color-background-secondary)` |
| `trail_ready` | `#E1F5EE` | `#1B7A3C` | `var(--color-background-secondary)` |
| `blindspot` | `#FFF3E6` | `#E8853A` | `var(--color-background-secondary)` |
| `zone_transition` | Zone-specific tint | Zone color | `var(--color-background-secondary)` |
| `campfire_*` | `#EEEDFE` | `#534AB7` | `var(--color-background-secondary)` |
| `content_update` | `var(--color-background-info)` | `#1B3FC4` | `var(--color-background-secondary)` |
| `weekly_digest` | `var(--color-background-secondary)` | `var(--color-text-tertiary)` | `var(--color-background-secondary)` |
| `system` / `billing` / `tip` | `var(--color-background-secondary)` | `var(--color-text-tertiary)` | `var(--color-background-secondary)` |

When a notification is read, all icon containers normalize to the secondary background with tertiary stroke — removing the color signal entirely. This ensures read items visually recede.

---

## Notifications Page

### Route: `/notifications`

### Page Structure

```
┌──────────────────────────────────────────────────┐
│  Notifications                    [Mark all read]│
│  Stay on top of your progress     [Settings]     │
│                                                  │
│  [All] [Progress] [Trail] [Campfire] [System]    │
│                                                  │
│  TODAY                                           │
│  ┃ Score moved: 68 → 72                    2h    │
│  ┃ Day 15 is ready                         5h    │
│  ┃ Blindspot: Building Laws                6h    │
│                                                  │
│  YESTERDAY                                       │
│    Passer story in Campfire                1d    │
│    New 3D module available                 1d    │
│                                                  │
│  THIS WEEK                                       │
│    Weekly heatmap digest                   3d    │
│    Structural Design → Amber Zone          5d    │
│                                                  │
│  EARLIER                                         │
│    ...                                           │
│                                                  │
│  [Load more]                                     │
└──────────────────────────────────────────────────┘
```

### Page Header

- **Title:** "Notifications" — 22px, font-weight 500
- **Subtitle:** "Stay on top of your progress and camp updates" — 13px, `var(--color-text-tertiary)`
- **Actions (right-aligned):**
  - "Mark all read" — secondary button, 12px
  - "Settings" — secondary button, 12px, links to `/settings/notifications`

### Filter Pills

Horizontal row of toggle pills below the header. One active at a time.

| Filter | Includes Types |
|---|---|
| All | Everything |
| Progress | `score_change`, `zone_transition`, `blindspot`, `weekly_digest` |
| Trail | `trail_ready`, `proof_unlocked` |
| Campfire | `campfire_story`, `campfire_reply` |
| System | `content_update`, `coaching_tip`, `billing`, `system` |

**Active pill styling:**
- Background: `var(--color-text-primary)` (dark in light mode, light in dark mode)
- Text: `var(--color-background-primary)` (inverted)

**Inactive pill styling:**
- Background: `var(--color-background-primary)`
- Border: `0.5px solid var(--color-border-secondary)`
- Text: `var(--color-text-secondary)`

**Pill dimensions:** `font-size: 12px`, `padding: 5px 14px`, `border-radius: 20px`

### Time Groups

Notifications are grouped by relative time periods using the DM Mono uppercase eyebrow pattern:

```tsx
<p className="font-mono text-[11px] font-medium uppercase tracking-widest text-muted-foreground mb-2">
  Today
</p>
```

**Time group labels:**
- **Today** — created_at is today
- **Yesterday** — created_at is yesterday
- **This week** — created_at is within the last 7 days (excluding today and yesterday)
- **Earlier** — created_at is older than 7 days

### Pagination

- Initial load: 20 notifications
- "Load more" button at the bottom (not infinite scroll — respect data costs on Philippine mobile networks)
- Each page loads 20 more
- After 60 notifications, show: "Older notifications are archived. Showing the last 30 days."

### Responsive Behavior

**Desktop (≥1024px):**
- Page sits within the standard app layout (sidebar + main content area)
- Notification items have full-width layout with timestamp right-aligned

**Tablet (768px–1023px):**
- Same layout, reduced padding (16px instead of 24px)

**Mobile (<768px):**
- Full-width layout, 16px horizontal padding
- Filter pills scroll horizontally if they overflow
- Timestamps move below the body text (stacked layout)

---

## Design Decisions

### Why Cobalt Blue Badge, Not Red

Red badges trigger anxiety. In SlateCamp's research, 4 of 6 retaker interviewees mentioned that red notification badges make them feel like they've failed at something. The Cobalt Blue badge matches the primary action color — it signals "there's something to see," not "something went wrong."

### Why Left-Border Accent for Unread

The left-border accent pattern is already established in SlateCamp's design system for action cards (the "Next Mission" card uses `border-l-[#E8853A]`, the Camp Trail card uses `border-l-[#534AB7]`). Using `border-l-[#1B3FC4]` for unread notifications extends this pattern consistently. Users already understand that a left border means "this item wants your attention."

### Why Time Grouping, Not Chronological Feed

Students think in study sessions: "What happened since my last session?" Time groups ("Today," "Yesterday," "This week") map to this mental model better than a raw chronological list with precise timestamps. The DM Mono eyebrow pattern provides clear visual separation between groups.

### Why Maximum 5 Items in Popup

The popup is a quick-glance surface, not a scrollable feed. Five items fit comfortably without scrolling on most devices. If users need to see more, the "View all notifications" link takes them to the full page. This keeps the popup interaction fast — open, scan, close or click.

### Why No Toast Notifications

Toast notifications (the ones that slide in from a corner) interrupt study sessions. A student in the middle of a Camp Trail quiz does not need a toast telling them a new Campfire post is available. The badge count is sufficient for non-urgent signals. Critical alerts (like subscription expiration) are handled by in-page banners, not toasts.

### Why No Sound Effects

Sound notifications violate the "calm" design principle. Students study in libraries, at home with sleeping family members, in review centers with other students. Sounds create social friction. The visual badge is sufficient.

### Why Badge Cap at 9+

Displaying "23" in a notification badge creates anxiety proportional to the number. Showing "9+" signals "there are several things to see" without quantifying the backlog. This is a deliberate constraint to prevent notification fatigue.

### Why Notifications Expire After 30 Days

Notifications older than 30 days are no longer actionable. A "Day 8 is ready" notification from 3 weeks ago is irrelevant if the student is now on Day 22. Archiving old notifications keeps the feed focused and reduces database query costs.

---

## Component Architecture

### Component Tree

```
Server Components
├── NotificationsPage (RSC)         → /notifications route
│   └── Fetches all notifications via Supabase query
│       └── Passes data to NotificationList (client)
│
└── HeaderLayout (RSC)              → Global layout
    └── Renders header shell
        └── Contains NotificationBell (client island)

Client Components ('use client')
├── NotificationList                → Full page feed
│   ├── Filter pills (state)
│   ├── Time-grouped sections
│   ├── Load more pagination
│   └── Uses NotificationItem (shared)
│
├── NotificationBell                → Header popup
│   ├── Bell icon + badge
│   ├── Popover (Shadcn)
│   ├── Polls unread count via useNotifications
│   └── Uses NotificationItem (shared)
│
└── NotificationItem                → Single notification row
    ├── Icon (mapped by type)
    ├── Title + body + timestamp
    ├── Unread/read styling
    └── Click: navigate + markAsRead

Shared Logic
├── useNotifications (Zustand store)
│   ├── unreadCount: number
│   ├── recentNotifications: Notification[]
│   ├── fetchUnreadCount(): polls every 60s
│   └── markAsRead(id): optimistic update
│
└── notificationActions (Server Actions)
    ├── getNotifications(filters, cursor)
    ├── markAsRead(notificationId)
    ├── markAllAsRead()
    └── updatePreferences(prefs)

Database
└── Supabase: notifications table + RLS policies
```

### File Structure

```
src/
├── app/
│   └── notifications/
│       ├── page.tsx              ← Server Component (data fetching)
│       └── loading.tsx           ← Skeleton loader
│
├── components/
│   └── notifications/
│       ├── NotificationBell.tsx  ← 'use client' — header popup
│       ├── NotificationList.tsx  ← 'use client' — page feed
│       ├── NotificationItem.tsx  ← 'use client' — shared row
│       ├── NotificationIcon.tsx  ← Icon mapping by type
│       └── NotificationFilters.tsx ← Filter pill bar
│
├── stores/
│   └── useNotifications.ts      ← Zustand store
│
├── actions/
│   └── notifications.ts         ← Server Actions
│
└── types/
    └── notifications.ts         ← TypeScript types
```

### TypeScript Types

```typescript
// src/types/notifications.ts

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

export interface NotificationMetadata {
  deep_link: string
  old_score?: number
  new_score?: number
  topic_name?: string
  discipline_name?: string
  trail_day?: number
  duration_minutes?: number
  zone_name?: string
  passer_name?: string
  passer_school?: string
  content_title?: string
  content_type?: 'wiki' | '3d_module' | 'feature'
}

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
  quiet_hours_start: string | null  // "22:00"
  quiet_hours_end: string | null    // "07:00"
}
```

---

## Implementation Roadmap

### Phase 1: Data Layer

**Estimated effort:** 1–2 days

**Tasks:**

1. Create `notifications` table in Supabase:

```sql
CREATE TABLE notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN (
    'score_change', 'trail_ready', 'blindspot', 'zone_transition',
    'proof_unlocked', 'campfire_story', 'campfire_reply',
    'content_update', 'weekly_digest', 'coaching_tip', 'billing', 'system'
  )),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  read_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fetching user notifications (most recent first)
CREATE INDEX idx_notifications_user_created
  ON notifications (user_id, created_at DESC);

-- Index for unread count query
CREATE INDEX idx_notifications_user_unread
  ON notifications (user_id)
  WHERE read_at IS NULL;

-- RLS: Users can only see their own notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Service role can insert notifications (server-side triggers)
CREATE POLICY "Service can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);
```

2. Create `notification_preferences` table:

```sql
CREATE TABLE notification_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  score_changes BOOLEAN DEFAULT true,
  trail_ready BOOLEAN DEFAULT true,
  blindspot BOOLEAN DEFAULT true,
  milestones BOOLEAN DEFAULT true,
  campfire BOOLEAN DEFAULT true,
  content_updates BOOLEAN DEFAULT true,
  weekly_digest BOOLEAN DEFAULT true,
  coaching_tips BOOLEAN DEFAULT true,
  billing BOOLEAN DEFAULT true,
  daily_digest BOOLEAN DEFAULT false,
  quiet_hours_start TIME DEFAULT NULL,
  quiet_hours_end TIME DEFAULT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own preferences"
  ON notification_preferences FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

3. Create a database function for creating notifications that respects user preferences:

```sql
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_body TEXT,
  p_metadata JSONB DEFAULT '{}'::jsonb
) RETURNS UUID AS $$
DECLARE
  v_id UUID;
  v_pref_column TEXT;
  v_is_enabled BOOLEAN;
BEGIN
  -- Map notification type to preference column
  v_pref_column := CASE p_type
    WHEN 'score_change' THEN 'score_changes'
    WHEN 'trail_ready' THEN 'trail_ready'
    WHEN 'blindspot' THEN 'blindspot'
    WHEN 'zone_transition' THEN 'milestones'
    WHEN 'proof_unlocked' THEN 'milestones'
    WHEN 'campfire_story' THEN 'campfire'
    WHEN 'campfire_reply' THEN 'campfire'
    WHEN 'content_update' THEN 'content_updates'
    WHEN 'weekly_digest' THEN 'weekly_digest'
    WHEN 'coaching_tip' THEN 'coaching_tips'
    WHEN 'billing' THEN 'billing'
    ELSE 'billing'  -- system notifications always allowed
  END;

  -- Check if user has this notification type enabled
  EXECUTE format(
    'SELECT COALESCE((SELECT %I FROM notification_preferences WHERE user_id = $1), true)',
    v_pref_column
  ) INTO v_is_enabled USING p_user_id;

  IF NOT v_is_enabled THEN
    RETURN NULL;
  END IF;

  INSERT INTO notifications (user_id, type, title, body, metadata)
  VALUES (p_user_id, p_type, p_title, p_body, p_metadata)
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

### Phase 2: NotificationItem Component

**Estimated effort:** 0.5 days

Build the shared `NotificationItem` component first since both the popup and page consume it.

**Component responsibilities:**
- Render icon (mapped by notification type via `NotificationIcon`)
- Render title, body, and relative timestamp
- Apply unread/read visual treatment
- Handle click: navigate to deep link + call `markAsRead` server action
- Optimistic update: immediately switch to read styling on click

**Relative timestamp formatting rules:**
- < 1 hour: "Xm ago"
- 1–23 hours: "Xh ago"
- Yesterday: "1d ago"
- 2–6 days: "Xd ago"
- 7+ days: "MMM D" (e.g., "Mar 14")

---

### Phase 3: NotificationBell (Header Popup)

**Estimated effort:** 1 day

**Component responsibilities:**
- Render bell SVG icon (22×22px)
- Show/hide Cobalt Blue badge with unread count
- On click: open Shadcn `Popover` with the 5 most recent notifications
- "Mark all read" action in popup header
- "View all notifications" link in popup footer
- Poll unread count every 60 seconds via `useNotifications` Zustand store

**Zustand store (`useNotifications`):**

```typescript
interface NotificationStore {
  unreadCount: number
  recentNotifications: Notification[]
  isLoading: boolean
  fetchUnreadCount: () => Promise<void>
  fetchRecent: () => Promise<void>
  markAsRead: (id: string) => void
  markAllAsRead: () => void
}
```

**Polling setup:**
- Start polling on mount (`useEffect` with `setInterval`)
- Stop polling when the popup is open (user is actively looking)
- Resume polling when popup closes
- Future upgrade: replace polling with Supabase Realtime channel subscription

---

### Phase 4: Notifications Page

**Estimated effort:** 1–2 days

**Server component (`page.tsx`):**
- Fetch initial 20 notifications using Supabase query with cursor-based pagination
- Pass data to `NotificationList` client component

**Client component (`NotificationList`):**
- Filter pills (local state, no server round-trip — filter the fetched data client-side)
- Time-group the filtered notifications into "Today," "Yesterday," "This week," "Earlier"
- "Load more" button triggers server action to fetch next page
- Mark individual or all notifications as read

**Skeleton loader (`loading.tsx`):**
- Render 6 placeholder notification items with pulse animation
- Match the exact dimensions of `NotificationItem` (padding, icon size, text height)

---

### Phase 5: Notification Triggers (Server-Side)

**Estimated effort:** 2–3 days

Create server-side functions that generate notifications when events occur. These run in Server Actions or Supabase Edge Functions — never client-side.

| Trigger Event | Notification Type | Where to Hook |
|---|---|---|
| Session completed → score changes | `score_change` | Post-session server action |
| Camp Trail day unlocked (daily at user's timezone) | `trail_ready` | Supabase cron / edge function |
| Blindspot Protocol detects gaps (>14 days untouched) | `blindspot` | Weekly cron job |
| Readiness Score crosses zone threshold | `zone_transition` | Post-session server action |
| User reaches Proof Simulation eligibility | `proof_unlocked` | Post-session server action |
| New Campfire post by a passer | `campfire_story` | Campfire post creation action |
| Reply to user's Campfire post | `campfire_reply` | Campfire reply creation action |
| New wiki article or 3D module published | `content_update` | Content publish action |
| Weekly (Sunday evening, user timezone) | `weekly_digest` | Weekly cron job |
| Subscription renewal approaching (7 days) | `billing` | Billing cron job |

**Daily notification cap:** Maximum 3 notifications per user per day. If the cap is reached, queue remaining notifications for the next day. Priority order: high > medium > low.

---

## Empty, Loading, and Error States

### Empty State — No Notifications

Shown when a new user has zero notifications, or when a filter returns no results.

**For zero notifications (new user):**
```
[Simple geometric icon — 8×8px rounded square]

"No notifications yet. Complete your first session
to start receiving progress updates."

[Start your first session →]
```

**For filter returning empty:**
```
[Simple geometric icon]

"No {filter_name} notifications.
Try a different filter or check back later."
```

**Empty state styling:**
- Centered, max-width 200px text block
- `font-sans text-sm text-muted-foreground`
- CTA link in `text-primary`
- No illustrations, no emoji — just text and a geometric placeholder

### Loading State — Skeleton

```
┌──────────────────────────────────────────┐
│  [▓▓▓▓▓▓▓▓▓▓▓]         [▓▓▓▓▓▓▓▓▓]    │
│  [▓▓▓▓▓▓▓▓]                             │
│                                          │
│  [▓▓] TODAY                              │
│  ┌─────────────────────────────────────┐ │
│  │ [▓▓▓] [▓▓▓▓▓▓▓▓▓▓▓▓▓▓]    [▓▓▓]  │ │
│  │       [▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓]      │ │
│  ├─────────────────────────────────────┤ │
│  │ [▓▓▓] [▓▓▓▓▓▓▓▓▓▓▓▓]      [▓▓▓]  │ │
│  │       [▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓]           │ │
│  ├─────────────────────────────────────┤ │
│  │ [▓▓▓] [▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓]   [▓▓▓]  │ │
│  │       [▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓]         │ │
│  └─────────────────────────────────────┘ │
└──────────────────────────────────────────┘
```

- Use Tailwind `animate-pulse` on skeleton elements
- Match exact dimensions of real notification items
- Show 6 skeleton items (fills viewport on most devices)
- Never use a full-page loading spinner

### Error State — Fetch Failed

```
[Simple geometric icon]

"Couldn't load notifications right now.
Check your connection and try again."

[Retry]
```

- "Retry" button triggers re-fetch
- No technical error messages shown to users
- Log the actual error to console/Sentry for debugging

---

## Notification Preferences (Settings)

### Route: `/settings/notifications`

Accessible from the "Settings" button on the notifications page header.

### Layout

```
┌──────────────────────────────────────────────────┐
│  Notification Preferences                        │
│  Choose what you want to hear about              │
│                                                  │
│  PROGRESS & STUDY                                │
│  ┌──────────────────────────────────────────────┐│
│  │ Score changes                          [ON]  ││
│  │ When your Readiness Score moves              ││
│  ├──────────────────────────────────────────────┤│
│  │ Trail day ready                        [ON]  ││
│  │ When your next Camp Trail day unlocks        ││
│  ├──────────────────────────────────────────────┤│
│  │ Blindspot alerts                       [ON]  ││
│  │ When neglected topics are detected           ││
│  ├──────────────────────────────────────────────┤│
│  │ Milestones                             [ON]  ││
│  │ Zone transitions and Proof Simulation        ││
│  └──────────────────────────────────────────────┘│
│                                                  │
│  COMMUNITY & CONTENT                             │
│  ┌──────────────────────────────────────────────┐│
│  │ Campfire activity                      [ON]  ││
│  │ Passer stories and replies to your posts     ││
│  ├──────────────────────────────────────────────┤│
│  │ Content updates                        [ON]  ││
│  │ New wiki articles and 3D modules             ││
│  ├──────────────────────────────────────────────┤│
│  │ Weekly digest                          [ON]  ││
│  │ Sunday summary of your progress              ││
│  └──────────────────────────────────────────────┘│
│                                                  │
│  OTHER                                           │
│  ┌──────────────────────────────────────────────┐│
│  │ Coaching tips                          [OFF] ││
│  │ Study tips and feature suggestions           ││
│  ├──────────────────────────────────────────────┤│
│  │ Billing                                [ON]  ││
│  │ Subscription renewals and payment issues     ││
│  └──────────────────────────────────────────────┘│
│                                                  │
│  QUIET HOURS                                     │
│  ┌──────────────────────────────────────────────┐│
│  │ Enable quiet hours                     [OFF] ││
│  │ No notifications during this window          ││
│  │                                              ││
│  │ From: [10:00 PM]    To: [7:00 AM]           ││
│  └──────────────────────────────────────────────┘│
└──────────────────────────────────────────────────┘
```

**Toggle component:** Use Shadcn `Switch` component. On = Cobalt Blue track. Off = gray track.

**Quiet hours:** Time pickers for start and end. Disabled by default. When enabled, no notifications are created during the window (server-side check).

**Default preferences for new users:**
- All "Progress & Study" toggles: ON
- Campfire, content updates, weekly digest: ON
- Coaching tips: OFF (opt-in — low priority, don't want to annoy)
- Billing: ON (always — users need to know about payment issues)
- Quiet hours: OFF

---

## Anti-Patterns — What We Never Build

| Anti-Pattern | Why It's Banned | What to Do Instead |
|---|---|---|
| Red notification badge | Triggers anxiety; retakers associate red with failure | Use Cobalt Blue (#1B3FC4) badge |
| "You haven't studied in X days" | Guilt-tripping; violates coach voice | Send positive progress signal or stay silent |
| "Only X days until the exam!" | Countdown anxiety; the product should calm, not alarm | "Your Trail day is ready" — actionable, not alarming |
| "Don't miss out!" / "Limited time!" | Fake urgency; violates brand honesty | State the fact: "New module available" |
| "You lost your streak!" | Streak mechanics are gamification debris | SlateCamp doesn't have streaks |
| Toast notifications during sessions | Interrupts focus during quizzes and study | Badge count updates silently |
| Sound/vibration notifications | Creates social friction (libraries, shared spaces) | Visual badge only |
| Push notifications without opt-in | Violates user trust and platform policies | Ask permission at the right moment (after first session) |
| More than 3 notifications per day | Notification fatigue → unsubscribe → churn | Queue excess for next day, prioritize by importance |
| Notification badge showing exact count > 9 | Large numbers create anxiety proportional to count | Show "9+" maximum |
| Marketing notifications ("Invite a friend!") | Notifications are for progress, not growth hacking | Use in-app banners or email for marketing |
| Re-engagement notifications after 30+ days inactive | At 30 days, the user has churned; notifications become spam | Use email for win-back campaigns, not in-app notifications |

---

## Success Metrics

### How We Know This Feature Is Working

| Metric | Baseline | Target | Measurement |
|---|---|---|---|
| Day 1 → Day 7 retention | Current baseline | +5% improvement | Cohort analysis: users with notifications enabled vs disabled |
| Session start rate from notification click | N/A (new) | ≥ 30% click-to-session conversion | Track `notification_clicked` → `session_started` within 30 min |
| Notification opt-out rate | N/A (new) | < 5% disable any category within 30 days | Track preference changes |
| Average notifications per user per day | N/A (new) | 1.2–1.8 (sweet spot) | Monitor daily notification volume per user |
| Popup engagement rate | N/A (new) | ≥ 40% of popup opens result in a click | Track popup_opened → notification_clicked |
| Time to first session from Trail notification | N/A (new) | < 4 hours median | Track `trail_ready` notification → next `session_started` |

### Research Follow-Up Plan

**Week 2 post-launch:** Run 5 moderated usability tests focused on:
1. "You just logged in. Show me how you'd check what's new."
2. "You see the bell has a number. Walk me through what you'd do."
3. "You want to turn off Campfire notifications. Show me how."

**Week 4 post-launch:** Deploy in-app survey (max 3 questions):
1. "How useful are the notifications you receive?" (1–5 scale)
2. "Are you getting too many, too few, or the right amount?" (3 options)
3. "What's one notification you wish you received that you don't?" (open-ended)

**Month 2:** Analyze behavioral data against the success metrics table. Adjust notification frequency, types, and copy based on findings.

