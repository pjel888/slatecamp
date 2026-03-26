# Quiz Engine Phase 2 — Design Spec

**Date:** 2026-03-26
**Status:** Approved

## Features

### 1. Topic Picker Rewrite (IntroSlide2)

Replace hardcoded Area A/B/C grouping with real taxonomy data.

- **Data source:** `taxonomy_tree` — subjects at level 1 (`parent_id` is a discipline node), subtopics at level 2+ (children of subjects)
- **Layout:** Flat list of subjects (no area grouping). Each subject is an expandable row showing its subtopic chips.
- **Mastery data:** Join with `user_node_mastery` to show per-subject mastery percentage
- **Questions link:** `questions.topic_id → taxonomy_tree.node_id` (questions are tagged at subtopic level, subjects are inferred via parent chain)
- **Server-side fetch:** Setup page queries taxonomy + mastery, passes to IntroSlide2 as props
- **Focused mode:** Pre-selects subjects where mastery < 0.70
- **Search:** Filters across subject names and subtopic names
- **Subject `ale_id` format:** "ALE-HIST", "ALE-STRUCT", etc.

### 2. Swipe-to-Submit

Primary answer submission gesture per doc 08b.

- **Library:** `@use-gesture/react` for gesture detection
- **Animation:** CSS transforms + transitions (no spring library)
- **Threshold:** 40% of card width (~120px mobile)
- **Below threshold:** Snap back (200ms ease-out)
- **Above threshold:** Card exits right (300ms), confirmation strip revealed, submit fires
- **Affordance:** Chevron (›) on selected card's right edge
- **Fallback:** "Check Answer" ghost link below options (accessibility + desktop)
- **Desktop:** Enter/Space submits selected answer
- **First-time tooltip:** Tracked via localStorage `has_seen_swipe_tutorial`
- **Haptic:** `navigator.vibrate(10)` at threshold crossing

### 3. Question History (Pro Users, Review Only)

Show per-question history in merged results page.

- **Data source:** `user_interactions` — aggregate by `(user_id, question_id)`: COUNT, COUNT(is_correct=true), COUNT(is_correct=false), MAX(created_at)
- **Query:** Batched in `getReviewData` server action for all session question IDs
- **Display:** Below question stem in review cards: "Seen 6x: ✓4 ✗2 · Last seen 3 days ago"
- **Pattern labels:** "First encounter", "Consistent ✓ — solid", "Seen 5x: ✓1 ✗4 — blindspot", "✗✗✗✓✓ — getting it"
- **Pro gate:** Check `profiles.subscription_tier`. Free users: section doesn't render (no teaser).

### 4. Merged Results + Review Page

Combine results dashboard and review into single scrollable page.

- **Route:** `/quiz/[mode]/session/[sessionId]/results` (existing)
- **Review route:** `/quiz/[mode]/session/[sessionId]/review` → redirect to results
- **Section 1:** Score hero (count-up, percentage, growth delta, readiness card)
- **Section 2:** Subject breakdown bars + stamina chart (≥50Q) + sticky filter pills
- **Section 3:** Inline question review cards (two-column). Wrong=expanded, correct=collapsed.
- **Section 4:** CTAs ("Practice Missed (N)", "Start Day X", "Dashboard")
- **Filters:** All / Incorrect / Flagged / Low Confidence — sticky on scroll
- **Performance:** Virtualize for 50+ questions (IntersectionObserver)
