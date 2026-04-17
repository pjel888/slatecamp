# SlateCamp — Complete Product Roadmap & Implementation Plan
## All Remaining Features — From Audit to Market Dominance
### 2026-03-26

---

## Document Purpose

This is the **single execution plan** for implementing every unimplemented feature identified in the Unimplemented Features Analysis. Payment integration (LemonSqueezy/PayRex button wiring, billing page) is **deferred** per founder directive — the revenue infrastructure exists but last-mile UI is postponed.

Every feature has: what to build, why it matters, database schema, file paths, component APIs, acceptance criteria, and dependencies. Organized into 8 phases across 24 weeks.

---

## Master Timeline Overview

| Phase | Name | Weeks | Solo Dev Days | Strategic Purpose |
|-------|------|-------|---------------|-------------------|
| **1** | Foundation Fixes | 1–2 | 10 days | Fix what's broken — SRS, IRT, security, credibility pages |
| **2** | Student Experience Gaps | 3–4 | 10 days | Search, scheduling, analytics export, Subject Focus fix |
| **3** | Retention Engine | 5–7 | 15 days | Streaks, heatmap deltas, PWA, notifications, re-engagement |
| **4** | Growth Loop | 8–10 | 15 days | Score sharing, referral program, activation tracking |
| **5** | Campfire Community | 11–14 | 20 days | The network moat — discussion, passers, accountability |
| **6** | Design System Enforcement | 15–17 | 15 days | Token migration, icon consolidation, accessibility |
| **7** | Data Moat & Intelligence | 18–20 | 15 days | Outcome tracking, growth dashboard, cohort analytics |
| **8** | Commercialization Layer | 21–24 | 20 days | Institutional dashboard, Guarantee Pro, white-label, 3D licensing |

**Total: ~24 weeks / ~120 solo dev days**

Payment integration slots in wherever you decide — it's a 1-day task (wire buttons + billing page) that can be inserted into any phase.

---

# PHASE 1: FOUNDATION FIXES
## Weeks 1–2 | 10 days | "Fix what's broken before building what's new"

**Rationale:** The audit identified critical disconnections in the pedagogical engine and security gaps. None of the growth or moat features matter if the core learning loop is silently broken and the app is vulnerable to XSS.

---

### 1.1 — Wire SRS into Testing Flow
**Priority:** CRITICAL — learning outcomes are silently degraded
**Effort:** 2–3 hours

**The problem:** `saveTestingInteraction()` in `src/lib/actions/testing.ts` records interactions but never calls `updateSrsSchedule()` or `deriveQualityRating()`. Every session through the testing hub (Camp/Storm/Chill/Focus Review/Custom/Simulation/Endurance) never updates SRS scheduling.

**Implementation:**
```
File: src/lib/actions/testing.ts
Location: After the upsert in saveTestingInteraction() (~line 492-544)

1. Import { deriveQualityRating } from '@/lib/srs/quality'
2. Import { updateSrsSchedule } from '@/lib/srs/update'
3. After successful upsert, call:
   const quality = deriveQualityRating({
     isCorrect: interaction.is_correct,
     timeSpent: interaction.time_spent_ms,
     confidence: interaction.confidence_level,
     luckyGuess: interaction.lucky_guess_flag
   })
   await updateSrsSchedule(userId, interaction.question_id, quality)
4. Wrap in try/catch — SRS failure should not break the session
```

**Reference pattern:** `src/lib/actions/quiz.ts:388-395` (the older flow that does this correctly)

**Acceptance criteria:**
- [ ] Complete a Camp Mode session → verify `srs_schedules` table has updated rows for answered questions
- [ ] Complete a Storm Mode session → verify same
- [ ] SRS failure does not crash the session (try/catch test)
- [ ] All 7 testing modes produce SRS updates

---

### 1.2 — Wire IRT Adaptive Question Selection
**Priority:** CRITICAL — PRD mandate unmet
**Effort:** 3–4 hours

**The problem:** `selectNextQuestion()`, `probabilityCorrect()`, and `updateTheta()` exist in `src/lib/srs/irt.ts` with passing tests but are never called. Sessions use `current_mastery_weight ASC` ordering instead of IRT P(correct)=0.75 targeting.

**Implementation:**
```
File: src/lib/actions/testing.ts
Location: Session creation function where questions are selected

1. Import { selectNextQuestion, updateTheta } from '@/lib/srs/irt'
2. During session creation, replace simple mastery ordering with:
   - Fetch user's current theta from user_global_stats (or default 0.0)
   - For each question slot in the session, call selectNextQuestion(availableQuestions, userTheta)
   - This targets P(correct)=0.75 — the optimal learning zone
3. After session completion (in saveTestingInteraction or session finalization):
   - Call updateTheta(currentTheta, questionDifficulty, isCorrect)
   - Write updated theta to user_global_stats

Schema addition (if theta column doesn't exist):
  ALTER TABLE user_global_stats ADD COLUMN IF NOT EXISTS theta FLOAT DEFAULT 0.0;
```

**Acceptance criteria:**
- [ ] New sessions use IRT-based question ordering (not mastery weight ASC)
- [ ] User theta updates after each completed session
- [ ] Questions cluster around the student's ability level (P≈0.75)

---

### 1.3 — Security Headers
**Priority:** CRITICAL — vulnerability
**Effort:** 15 minutes

**Implementation:**
```
File: next.config.ts

Add headers() function:
async headers() {
  return [{
    source: '/(.*)',
    headers: [
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
    ]
  }]
}
```

**Acceptance criteria:**
- [ ] `curl -I https://slatecamp.com` shows all 5 headers

---

### 1.4 — Sanitize XSS in Question Card
**Priority:** CRITICAL — stored XSS risk
**Effort:** 15 minutes

**Implementation:**
```
File: src/components/shared/question-card.tsx
Lines: 233, 243, 409

Add DOMPurify.sanitize() around all 3 dangerouslySetInnerHTML usages.
Reference: src/components/wiki/ElaborativeInterrogation.tsx (already does this correctly)

import DOMPurify from 'isomorphic-dompurify'

// Before:
dangerouslySetInnerHTML={{ __html: content }}
// After:
dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }}
```

---

### 1.5 — Delete Debug Taxonomy Route
**Priority:** CRITICAL — unauthenticated data exposure
**Effort:** 1 minute

```
Delete: src/app/api/debug-taxonomy/route.ts
```

---

### 1.6 — Auth Checks on Admin Read Functions
**Priority:** HIGH
**Effort:** 30 minutes

```
Files:
- src/lib/actions/admin/dashboard.ts → add canReviewContent() to getAdminStats(), getAdminDashboardData()
- src/lib/actions/admin/coverage.ts → add canReviewContent() to fetchCoverageData()
- src/lib/actions/admin/wiki-queries.ts → add canReviewContent() to getArticlesWithCoverage()

Files:
- src/lib/actions/social-proof.ts → add getUser() to getQuestionSocialProof(), getTopicDailyStudiers(), getTopicDailyStudiersBatch()
```

---

### 1.7 — Remove maximumScale:1
**Priority:** HIGH — WCAG 2.1 AA failure
**Effort:** 1 minute

```
File: src/app/layout.tsx:51
Remove: maximumScale: 1
```

---

### 1.8 — About Page
**Priority:** HIGH — credibility damage
**Effort:** 3–4 hours

```
File: src/app/(marketing)/about/page.tsx

Content:
- Philip's story (licensed architect, ALE journey, why SlateCamp exists)
- The camp metaphor explained
- The pedagogical approach (IRT, mastery-based, anti-inflation scoring)
- Team section (solo founder for now, advisory board if any)
- Mission statement

Design: Follow marketing page patterns (HeroSection, FeatureSectionLayout).
Use existing shared components. Syne headings, Inter body, cream backgrounds.
```

---

### 1.9 — Contact Page
**Priority:** HIGH — no support channel
**Effort:** 2–3 hours

```
File: src/app/(marketing)/contact/page.tsx

Content:
- Contact form (name, email, subject, message) → server action that sends email
- Support email displayed
- Social links (if applicable)
- FAQ accordion (top 5 questions)

Server action: src/lib/actions/contact.ts
- Zod validation on form fields
- Rate limiting (use existing rate limiter or implement simple per-IP throttle)
- Send via Resend or Supabase Edge Function
```

---

### 1.10 — Profile Editing
**Priority:** HIGH — basic user expectation
**Effort:** 4 hours

```
Route: /dashboard/settings/profile (or enhance existing /dashboard/settings)

Features:
- Edit display name
- Upload avatar (Supabase Storage bucket: 'avatars')
- View email (read-only — email change is auth-level)
- Exam target date selector

Schema:
- profiles table likely already has name, avatar_url columns
- Add exam_target_date DATE if not present

Server actions: src/lib/actions/profile.ts
- updateProfile({ displayName, avatarUrl, examTargetDate })
- uploadAvatar(file) → Supabase Storage → return public URL

Components:
- src/components/dashboard/settings/ProfileEditor.tsx
- Avatar upload with preview, crop optional
```

**Acceptance criteria:**
- [ ] User can change display name, see it reflected in sidebar
- [ ] User can upload avatar, see it in sidebar and profile
- [ ] Exam target date stored and used by exam countdown system (Phase 3)

---

## Phase 1 Verification Checklist

- [ ] SRS updates fire on all 7 testing modes
- [ ] IRT selects questions adaptively
- [ ] Security headers present on production
- [ ] XSS sanitized in question-card
- [ ] Debug route deleted
- [ ] Admin routes auth-gated
- [ ] Pinch-zoom enabled
- [ ] About page live
- [ ] Contact page live with working form
- [ ] Profile editing functional
- [ ] `bun run build` — zero errors

---

# PHASE 2: STUDENT EXPERIENCE GAPS
## Weeks 3–4 | 10 days | "What students expect but don't have"

---

### 2.1 — Full-Text Wiki Search (Student View)
**Priority:** P2 — market expectation
**Effort:** 5 days

```
Route: /dashboard/wiki/search (or integrated into wiki index)

Implementation approach:
1. Supabase full-text search using tsvector on wiki_articles
2. Add GIN index for performance

Schema migration:
  ALTER TABLE wiki_articles ADD COLUMN IF NOT EXISTS search_vector tsvector
    GENERATED ALWAYS AS (
      to_tsvector('english', coalesce(title, '') || ' ' || coalesce(content, ''))
    ) STORED;
  CREATE INDEX IF NOT EXISTS idx_wiki_search ON wiki_articles USING GIN(search_vector);

Server action: src/lib/actions/wiki-search.ts
  searchWikiArticles(query: string, limit = 20)
  - Uses plainto_tsquery for basic search
  - Returns: id, title, slug, snippet (ts_headline), taxonomy path
  - Filter by published articles only
  - Debounced on client (300ms)

Component: src/components/dashboard/wiki/WikiSearchPage.tsx
  - Search input with keyboard shortcut (⌘K or /?)
  - Results grouped by taxonomy subject
  - Each result shows: title, breadcrumb (Subject > Topic), snippet with highlights
  - Click → navigates to article
  - Empty state: "No articles match your search. Try broader terms."

  Bonus: wire into the existing Command Palette if one exists
```

**Acceptance criteria:**
- [ ] Student can search wiki articles from dashboard
- [ ] Results highlight matching terms
- [ ] Results grouped by subject
- [ ] Search returns in <200ms for typical queries
- [ ] Only published articles appear

---

### 2.2 — Question Bank Search/Filter (Student View)
**Priority:** P2 — market expectation
**Effort:** 4 days

```
Route: /dashboard/testing/explore (or integrated into testing hub)

Features:
- Filter by taxonomy subject (9 L1 subjects)
- Filter by difficulty range (slider or Easy/Medium/Hard chips)
- Filter by mastery status (Unexplored / Learning / Developing / Mastered)
- Search by question stem text
- "Start session with these filters" button → creates a Custom session

Server action: src/lib/actions/question-browser.ts
  browseQuestions({ subjects, difficultyRange, masteryFilter, searchText, page, limit })
  - Joins questions with user_question_mastery for mastery status
  - Paginated (20 per page)

Component: src/components/dashboard/testing/QuestionBrowser.tsx
  - Filter sidebar (left) + question list (right)
  - Each question card: stem preview, difficulty bar, mastery badge, topic breadcrumb
  - Click → shows full question in read-only QuestionCard
  - "Practice these" CTA → creates Custom session with applied filters
```

---

### 2.3 — Subject Focus Picker Fix (By Taxonomy Subject, Not Area)
**Priority:** P1 — bad UX, nobody reviews by Area
**Effort:** 3 days

```
File: The existing Subject Focus component used in session creation

Current behavior: Groups topics by Area A/B/C (PRC exam buckets)
New behavior: Groups topics by the 9 taxonomy L1 subjects

UI structure:
  □ History of Architecture (6 subtopics)
    ○ Pre-Historic & Ancient  ○ Medieval...

  □ Architectural Design (12 subtopics)
    ○ Residential  ○ Institutional...

  □ Structural Systems (8 subtopics)
    ...

  □ Building Utilities (7 subtopics)
    ...

  (etc — all 9 L1 subjects, each expandable)

Areas A/B/C shown as a light grouping label ABOVE the subjects:
  "Area A — Project Management"
    □ Professional Practice (subtopics...)
    □ Planning (subtopics...)
  "Area B — Technical Practice"
    □ Structural Systems...
    □ Building Utilities...
    □ Building Enclosure...

This preserves the exam context while making the primary selection unit the subject.

Implementation:
  - Query taxonomy_tree at L1 and L2
  - Group L1 subjects by their PRC area (store area mapping in constants or taxonomy metadata)
  - Replace area-first rendering with subject-first rendering
  - Keep pill selection, mastery dots, search, select/deselect all
```

---

### 2.4 — Practice Exam Result Comparison
**Priority:** P3
**Effort:** 4 days

```
Route: /dashboard/testing/simulation/compare

Features:
- List all completed simulation sessions
- Select 2–3 sessions to compare side-by-side
- Comparison view:
  - Overall score (side by side bars)
  - Per-subject breakdown (grouped bar chart)
  - Time per question distribution
  - Questions answered differently between attempts
  - Readiness Score at time of each attempt

Server action: src/lib/actions/simulation-compare.ts
  getSimulationHistory(userId)
  compareSimulations(sessionIds: string[])

Component: src/components/dashboard/testing/SimulationCompare.tsx
  - Session selector (checkboxes, max 3)
  - Comparison grid
  - "You improved in 4 subjects, declined in 1" summary
```

---

### 2.5 — Export Analytics Data
**Priority:** P3
**Effort:** 2 days

```
Route: /dashboard/analytics (add export button to existing page)

Export formats:
1. PDF report — summary card with Readiness Score, heatmap snapshot, subject breakdown
2. CSV — raw session data, question-level performance

Implementation:
  - PDF: Use existing jsPDF or html2canvas to screenshot analytics cards
    OR server-side: generate PDF via Puppeteer/Playwright on Vercel (complex)
    Simpler: generate a printable HTML page at /dashboard/analytics/report
    and let the browser's Print → Save as PDF handle it
  - CSV: Server action that queries user_interactions, formats as CSV, returns as download

Server action: src/lib/actions/analytics-export.ts
  exportAnalyticsCSV(userId, dateRange)
  generateAnalyticsReport(userId) → returns structured data for the report page

Component addition to existing analytics page:
  - "Export" dropdown button → PDF Report / CSV Download
```

---

### 2.6 — Study Scheduling / Calendar
**Priority:** P3
**Effort:** 8 days

```
Route: /dashboard/schedule

This sits alongside Camp Trail — Trail is the automated prescribed path,
Schedule is the student's own planning layer.

Features:
- Calendar view (month/week) showing:
  - Camp Trail daily prescriptions (auto-populated, read-only)
  - Custom study blocks (user-created)
  - ALE exam date (prominent marker)
  - Completed sessions (rendered as done)
- Create custom study block: subject, duration, notes
- Drag to reschedule
- Weekly summary: planned vs actual study hours

Schema:
  CREATE TABLE study_schedule (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    scheduled_date DATE NOT NULL,
    subject_id UUID REFERENCES taxonomy_tree(id),
    planned_duration_minutes INTEGER DEFAULT 30,
    notes TEXT,
    completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
  );

  ALTER TABLE study_schedule ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "Users manage own schedule"
    ON study_schedule FOR ALL
    USING (auth.uid() = user_id);

Server actions: src/lib/actions/schedule.ts
  getSchedule(userId, startDate, endDate)
  createStudyBlock({ date, subjectId, duration, notes })
  updateStudyBlock(id, updates)
  deleteStudyBlock(id)
  markComplete(id)

Component: src/components/dashboard/schedule/StudyCalendar.tsx
  - Use a lightweight calendar lib or build with CSS Grid
  - Day cells show: Trail prescription (blue), custom blocks (purple), completed (green check)
  - Click day → expand to see detail + add block
  - Exam countdown always visible in header
```

---

## Phase 2 Verification Checklist

- [ ] Wiki search returns relevant articles with highlighted snippets
- [ ] Question browser filters work across all dimensions
- [ ] Subject Focus shows 9 taxonomy subjects, not 3 areas
- [ ] Simulation comparison works for 2+ sessions
- [ ] Analytics export produces valid CSV and printable report
- [ ] Study calendar shows Trail + custom blocks + exam date
- [ ] `bun run build` — zero errors

---

# PHASE 3: RETENTION ENGINE
## Weeks 5–7 | 15 days | "Make quitting harder than continuing"

---

### 3.1 — Daily Streak System
**Priority:** HIGH — most proven retention mechanic in EdTech
**Effort:** 5 days

**Design constraint:** Must pass the anti-gamification test. Streak is informational ("Day 12"), not celebratory. No confetti, no badges, no "Amazing!" No streak-as-goal — the streak serves the study habit, not the other way around.

```
Schema:
  CREATE TABLE user_streaks (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id),
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_active_date DATE,
    streak_shields INTEGER DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT now()
  );

  ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "Users read own streak"
    ON user_streaks FOR SELECT USING (auth.uid() = user_id);
  CREATE POLICY "System updates streaks"
    ON user_streaks FOR UPDATE USING (auth.uid() = user_id);

Logic (src/lib/actions/streak.ts):
  recordActivity(userId):
    - Get last_active_date
    - If today → no-op (already counted)
    - If yesterday → current_streak++, update last_active_date
    - If older → check streak_shields > 0
      - Yes: decrement shield, current_streak++ (streak preserved)
      - No: reset current_streak to 1
    - Update longest_streak if current > longest

  Called from: saveTestingInteraction() — after successful SRS update
  Also called from: any session completion action

UI placement:
  - Dashboard home: subtle streak indicator near Readiness Score
    "Day 14" in DM Mono, small, beside the score ring
  - Session start screen: "Day 14 — keep building"
  - Session end screen: "Day 15" (if it incremented)

  If streak breaks:
    "You missed a day. Your streak resets to Day 1."
    No guilt. No red. Just factual.
    If shields available: "Use a Streak Shield to protect your streak?"

  Streak Shield (future monetization lever):
    - Users get 1 free shield per month
    - Additional shields: ₱20 each (in-app purchase — defer to payment phase)
    - For now: just track shields, set default to 1

Anti-pattern enforcement:
  - NO fire emoji
  - NO "You're on fire!"
  - NO streak-themed animations
  - Just the number. DM Mono. Muted foreground.
```

**Acceptance criteria:**
- [ ] Streak increments on session completion
- [ ] Streak resets after 1 missed day (no shield)
- [ ] Streak preserved when shield used
- [ ] Longest streak tracked
- [ ] UI shows streak as a quiet number, not a celebration
- [ ] No streak display when streak = 0 (avoid "Day 0" shame)

---

### 3.2 — Heatmap Delta Tracking & Notifications
**Priority:** HIGH — leverages existing 95%-complete analytics
**Effort:** 3 days

```
Schema:
  CREATE TABLE heatmap_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    snapshot_date DATE NOT NULL,
    node_states JSONB NOT NULL, -- { "node_id": "mastery_level", ... }
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, snapshot_date)
  );

Logic (src/lib/actions/heatmap-delta.ts):
  takeWeeklySnapshot(userId):
    - Query user_topic_mastery for all nodes
    - Store as JSONB snapshot
    - Cron: runs every Sunday midnight via Vercel cron

  computeDelta(userId):
    - Get latest 2 snapshots
    - Compare node states
    - Return: { improved: [...], declined: [...], newlyExplored: [...] }

  Called by: Dashboard home page load (show weekly summary card)

UI (add to dashboard home):
  Card: "This Week's Progress"
    "You improved 4 nodes and explored 2 new topics."
    List: "Structural Systems → Amber to Green" (max 5 items)
    Link: "View full heatmap →"

  If no improvement:
    "No mastery changes this week. Start a session to move forward."
```

---

### 3.3 — PWA Manifest + Service Worker
**Priority:** P2 — 0% score on mobile/offline
**Effort:** 5 days

```
Files to create:
  public/manifest.json
  public/sw.js (or use next-pwa / serwist)
  src/app/layout.tsx (add manifest link)

Manifest:
{
  "name": "SlateCamp — ALE Review",
  "short_name": "SlateCamp",
  "description": "Architecture Licensure Exam preparation platform",
  "start_url": "/dashboard",
  "display": "standalone",
  "background_color": "#F8F7F5",
  "theme_color": "#1B3FC4",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}

Service Worker strategy:
  - Cache-first for: static assets, wiki articles (after first load)
  - Network-first for: testing sessions, analytics, user data
  - Offline fallback page: /offline (simple page saying "You're offline. Cached content available.")

  Recommended: Use Serwist (the maintained fork of next-pwa)
  npm install @serwist/next

Offline capabilities (Phase 1 — basic):
  - Cached wiki articles readable offline
  - Cached heatmap viewable offline
  - Testing sessions require network (question data is server-fetched)
  - Queue offline session completions for sync when back online (matches existing localStorage pattern)

Do NOT attempt:
  - Full offline testing (too complex for Phase 1)
  - Background sync of questions (data integrity risk)

Icon generation:
  - Create 192x192 and 512x512 PNGs from SlateCamp logo
  - Add Apple touch icon meta tags
```

**Acceptance criteria:**
- [ ] "Add to Home Screen" prompt appears on mobile browsers
- [ ] App launches in standalone mode from home screen
- [ ] Cached wiki articles readable offline
- [ ] Correct theme color and splash screen
- [ ] Lighthouse PWA audit passes basic checks

---

### 3.4 — Notification Preferences UI
**Priority:** P1
**Effort:** 2 days

```
Route: /dashboard/settings/notifications (or tab within settings)

Backend: email-preferences.ts already partially exists per audit

UI:
  Toggle switches for:
  - Camp Trail daily reminder (email)
  - Weekly progress summary (email)
  - Streak break alert (push — when PWA is ready)
  - Exam countdown milestones (email at T-90, T-60, T-30, T-14, T-7)
  - Re-engagement reminders (email — for dormant users)
  - Campfire activity (email digest — when Campfire ships)

Schema (if not already present):
  CREATE TABLE notification_preferences (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id),
    trail_reminder BOOLEAN DEFAULT true,
    weekly_summary BOOLEAN DEFAULT true,
    streak_alert BOOLEAN DEFAULT true,
    exam_countdown BOOLEAN DEFAULT true,
    reengagement BOOLEAN DEFAULT true,
    campfire_digest BOOLEAN DEFAULT false,
    updated_at TIMESTAMPTZ DEFAULT now()
  );

  The actual email sending infrastructure defers to Phase 3.5.
  This phase just builds the preferences UI and stores choices.
```

---

### 3.5 — Re-engagement Email Sequences
**Priority:** P2 — fights churn
**Effort:** 5 days

```
Infrastructure:
  Email provider: Resend (already likely in stack for transactional email)
                  OR Supabase Edge Functions + smtp

Cron job: Vercel cron (already 2 configured per audit)
  Schedule: Daily at 9:00 PM PHT (Philippine peak study time)

Logic (src/lib/crons/reengagement.ts):
  1. Query users where last_session_completed_at < now() - interval '6 days'
     AND notification_preferences.reengagement = true
  2. Determine which template based on days since last activity:

  Day 6:  subject: "Your Camp Trail is waiting"
          body: "Still preparing for {examMonth}? You were on Day {trailDay}."
          CTA: "Continue your Trail →"

  Day 10: subject: "10 days since your last session"
          body: "Your Readiness Score hasn't updated. Candidates who pause
                 for 10+ days see a {X}% score decline on average."
          CTA: "Quick 15-minute session →"

  Day 15: subject: "Rebaseline in 15 minutes"
          body: "One diagnostic session. 15 minutes. Your new Camp Trail
                 starts fresh from wherever you are."
          CTA: "Take a diagnostic →"

  Day 21: subject: "7 days Pro — on us"
          body: "We want you back. Here's a week of Pro access, free."
          CTA: "Claim your week →"
          Action: Auto-extend Pro by 7 days (server action)

  3. Track: emails_sent table with user_id, template, sent_at
  4. Do NOT re-send same template within 30 days
  5. Respect unsubscribe (notification_preferences.reengagement = false)

Schema:
  CREATE TABLE reengagement_emails (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    template VARCHAR(50) NOT NULL,
    sent_at TIMESTAMPTZ DEFAULT now()
  );

Email templates: src/lib/email/templates/
  - reengagement-day6.tsx (React Email or plain HTML)
  - reengagement-day10.tsx
  - reengagement-day15.tsx
  - reengagement-day21.tsx
```

---

## Phase 3 Verification Checklist

- [ ] Streak increments, resets, and shields work correctly
- [ ] Heatmap delta card shows weekly node changes on dashboard
- [ ] PWA installable on mobile, cached content works offline
- [ ] Notification preferences save and load correctly
- [ ] Re-engagement cron fires daily, sends correct template per dormancy tier
- [ ] Users can unsubscribe from re-engagement emails
- [ ] `bun run build` — zero errors

---

# PHASE 4: GROWTH LOOP
## Weeks 8–10 | 15 days | "Every user should bring another user"

---

### 4.1 — Score Sharing / Social Proof
**Priority:** HIGH — enables the core growth loop
**Effort:** 5 days

```
The growth loop breaks at "shares progress" because no sharing mechanism exists.
This is the most important growth feature to build.

Feature set:
1. Shareable Readiness Score card (image)
2. Shareable session result card
3. Share buttons (Facebook, Twitter/X, copy link)

Implementation:

  Route: /api/share/score-card/[userId] (generates OG image)
  Route: /api/share/session-card/[sessionId]

  Use: @vercel/og or satori for server-side image generation

  Score Card design (follows design system):
    - White card, Cobalt Blue accent
    - SlateCamp logo (small, top-left)
    - Readiness Score ring (large, center)
    - "Readiness Score: 72/100"
    - Score trajectory mini-chart (if available)
    - "I've improved +18 points in 4 weeks"
    - "Are you ALE-ready? slatecamp.com/try"
    - DM Mono for numbers, Inter for text

  Session Result Card:
    - "[Mode] Session Complete"
    - "Score: 85% on Structural Systems"
    - Session stats (questions, time, accuracy)
    - "Practice with me on SlateCamp → slatecamp.com/try"

UI placements:
  1. Score Reveal page: "Share your score" button
  2. Session debrief page: "Share this result" button
  3. Dashboard home (near Readiness Score): "Share progress" icon button
  4. Analytics page: "Share my journey" (shows trajectory)

Share actions:
  - Facebook: Open share dialog with OG image URL
  - Twitter/X: Pre-filled tweet with score + link
  - Copy link: Copies shareable URL to clipboard
  - Download image: Downloads the card as PNG

OG meta tags for shared URLs:
  /share/[userId] → shows score card as og:image
  This means when someone pastes the link on Facebook, the card renders as a preview

Server action: src/lib/actions/sharing.ts
  generateShareToken(userId) → short-lived token for public score view
  getPublicScoreCard(token) → returns score data for rendering
```

**Acceptance criteria:**
- [ ] Score card generates correctly with dynamic data
- [ ] Share to Facebook shows card preview
- [ ] Share to Twitter pre-fills tweet
- [ ] Copy link works
- [ ] Shared links resolve to a public preview (no auth required)
- [ ] Cards follow SlateCamp design system (no emoji, no confetti)

---

### 4.2 — Referral Program (Tier 1: Peer Referral)
**Priority:** HIGH — direct growth lever
**Effort:** 7 days

```
Schema:
  CREATE TABLE referral_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) NOT NULL UNIQUE,
    code VARCHAR(12) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT now()
  );

  CREATE TABLE referral_conversions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id UUID REFERENCES auth.users(id) NOT NULL,
    referred_id UUID REFERENCES auth.users(id) NOT NULL UNIQUE,
    code VARCHAR(12) NOT NULL,
    status VARCHAR(20) DEFAULT 'signed_up', -- signed_up, converted_pro, rewarded
    reward_granted BOOLEAN DEFAULT false,
    signed_up_at TIMESTAMPTZ DEFAULT now(),
    converted_at TIMESTAMPTZ,
    rewarded_at TIMESTAMPTZ
  );

  ALTER TABLE referral_codes ENABLE ROW LEVEL SECURITY;
  ALTER TABLE referral_conversions ENABLE ROW LEVEL SECURITY;

  CREATE POLICY "Users see own code" ON referral_codes
    FOR SELECT USING (auth.uid() = user_id);
  CREATE POLICY "Users see own referrals" ON referral_conversions
    FOR SELECT USING (auth.uid() = referrer_id);

Logic:
  Auto-generate referral code on first Pro subscription (or on demand)
  Code format: SC-{6 random alphanumeric} (e.g., SC-X7K2M9)

  Referral flow:
  1. User shares code (in-app or via share card)
  2. New user enters code during signup (field on registration form)
  3. System creates referral_conversions record (status: signed_up)
  4. When referred user converts to Pro → status: converted_pro
  5. Referrer gets 14 days Pro extension → status: rewarded

  Referrer reward: src/lib/actions/referral.ts
    grantReferralReward(referrerId):
      - Extend user_subscriptions.expires_at by 14 days
      - Set reward_granted = true
      - Send notification email

UI:
  Route: /dashboard/referral (or section in settings)
  Components:
    - ReferralCodeCard: shows code, copy button, share buttons
    - ReferralStats: total referrals, conversions, rewards earned
    - ReferralList: table of referred friends with status

  Registration form addition:
    - "Have a referral code?" collapsible field
    - Validates code exists before form submission

  Messaging (per Growth Engine skill):
    "Share this with your batchmates before it's too late."
    NOT "Earn rewards by referring friends!"
    The frame is protection, not profit.
```

---

### 4.3 — Cohort Activation Tracking (CEO Dashboard)
**Priority:** P2 — measures whether growth loop works
**Effort:** 3 days

```
Add to CEO dashboard (existing /ceo/insights or new section):

Activation Funnel Visualization:
  Signup → Diagnostic Complete → Camp Trail Day 1 → Day 3 (paywall) → Pro Conversion

  For each step: count, conversion rate, drop-off rate
  Filterable by: date range, signup source (referral vs organic)

SQL view or materialized view:
  CREATE MATERIALIZED VIEW activation_funnel AS
  WITH signups AS (
    SELECT id as user_id, created_at::date as signup_date
    FROM auth.users
    WHERE created_at > now() - interval '90 days'
  ),
  diagnostics AS (
    SELECT DISTINCT user_id FROM testing_sessions
    WHERE mode = 'assessment' AND completed = true
  ),
  trail_d1 AS (
    SELECT DISTINCT user_id FROM trail_progress
    WHERE day_number = 1 AND completed = true
  ),
  trail_d3 AS (
    SELECT DISTINCT user_id FROM trail_progress
    WHERE day_number = 3 AND completed = true
  ),
  conversions AS (
    SELECT DISTINCT user_id FROM user_subscriptions
    WHERE tier != 'free'
  )
  SELECT
    signup_date,
    COUNT(DISTINCT s.user_id) as signups,
    COUNT(DISTINCT d.user_id) as diagnostic_complete,
    COUNT(DISTINCT t1.user_id) as trail_day_1,
    COUNT(DISTINCT t3.user_id) as trail_day_3,
    COUNT(DISTINCT c.user_id) as converted
  FROM signups s
  LEFT JOIN diagnostics d ON s.user_id = d.user_id
  LEFT JOIN trail_d1 t1 ON s.user_id = t1.user_id
  LEFT JOIN trail_d3 t3 ON s.user_id = t3.user_id
  LEFT JOIN conversions c ON s.user_id = c.user_id
  GROUP BY signup_date;

  (Adjust table/column names to match actual schema)

Component: src/components/ceo/ActivationFunnel.tsx
  - Horizontal funnel chart (Recharts)
  - Each stage shows count and % conversion from previous
  - Date range filter
```

---

## Phase 4 Verification Checklist

- [ ] Score cards generate with correct data and design system compliance
- [ ] Sharing to Facebook/Twitter works with OG image previews
- [ ] Referral code auto-generates for users
- [ ] Referral code entry works during registration
- [ ] Referral reward (14-day extension) triggers on conversion
- [ ] Activation funnel displays in CEO dashboard
- [ ] `bun run build` — zero errors

---

# PHASE 5: CAMPFIRE COMMUNITY
## Weeks 11–14 | 20 days | "The moat no competitor can copy"

**This is the most strategically important phase.** Campfire creates the network effect that compounds with each exam cycle.

---

### 5.1 — Campfire Database Schema
**Effort:** 1 day

```
Schema:

  -- Discussion threads
  CREATE TABLE campfire_threads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID REFERENCES auth.users(id) NOT NULL,
    title VARCHAR(300) NOT NULL,
    body TEXT NOT NULL,
    category VARCHAR(50) NOT NULL, -- 'question', 'discussion', 'resource', 'success_story'
    taxonomy_node_id UUID REFERENCES taxonomy_tree(id), -- optional topic tag
    is_pinned BOOLEAN DEFAULT false,
    is_locked BOOLEAN DEFAULT false,
    upvote_count INTEGER DEFAULT 0,
    reply_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
  );

  -- Replies
  CREATE TABLE campfire_replies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thread_id UUID REFERENCES campfire_threads(id) ON DELETE CASCADE NOT NULL,
    author_id UUID REFERENCES auth.users(id) NOT NULL,
    body TEXT NOT NULL,
    parent_reply_id UUID REFERENCES campfire_replies(id), -- nested replies
    is_accepted_answer BOOLEAN DEFAULT false,
    upvote_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
  );

  -- Upvotes (prevents double-voting)
  CREATE TABLE campfire_votes (
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    target_type VARCHAR(10) NOT NULL, -- 'thread' or 'reply'
    target_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (user_id, target_type, target_id)
  );

  -- Passer verification
  CREATE TABLE passer_profiles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id),
    exam_date DATE NOT NULL,
    exam_cycle VARCHAR(20), -- 'Jan 2026', 'Jun 2026'
    final_readiness_score FLOAT,
    score_trajectory JSONB, -- historical score snapshots
    is_verified BOOLEAN DEFAULT false, -- admin-verified
    verified_at TIMESTAMPTZ,
    badge_label VARCHAR(100), -- "Class of January 2026"
    bio TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
  );

  -- Hall of Passers (public-facing)
  CREATE TABLE hall_of_passers (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id),
    display_name VARCHAR(100) NOT NULL,
    avatar_url TEXT,
    exam_date DATE,
    badge_label VARCHAR(100),
    final_readiness_score FLOAT,
    testimonial TEXT,
    is_featured BOOLEAN DEFAULT false,
    published_at TIMESTAMPTZ DEFAULT now()
  );

  -- RLS
  ALTER TABLE campfire_threads ENABLE ROW LEVEL SECURITY;
  ALTER TABLE campfire_replies ENABLE ROW LEVEL SECURITY;
  ALTER TABLE campfire_votes ENABLE ROW LEVEL SECURITY;
  ALTER TABLE passer_profiles ENABLE ROW LEVEL SECURITY;
  ALTER TABLE hall_of_passers ENABLE ROW LEVEL SECURITY;

  -- All authenticated users can read threads and replies
  CREATE POLICY "Authenticated read threads" ON campfire_threads
    FOR SELECT USING (auth.role() = 'authenticated');
  CREATE POLICY "Authors manage own threads" ON campfire_threads
    FOR ALL USING (auth.uid() = author_id);
  -- (similar for replies, votes)
  -- Hall of passers readable by all (even anonymous for marketing)
  CREATE POLICY "Public read hall" ON hall_of_passers
    FOR SELECT USING (true);
```

---

### 5.2 — Campfire Discussion UI
**Effort:** 8 days

```
Route: /dashboard/campfire

Pages:
  /dashboard/campfire              → Thread list (feed)
  /dashboard/campfire/new          → Create thread
  /dashboard/campfire/[threadId]   → Thread detail + replies

Components:
  src/components/dashboard/campfire/
    CampfireFeed.tsx          — Thread list with filters
    ThreadCard.tsx             — Thread preview in feed
    ThreadDetail.tsx           — Full thread + reply tree
    ReplyEditor.tsx            — Rich text reply input (TipTap lite or textarea)
    CategoryFilter.tsx         — Filter by: All, Questions, Discussions, Resources, Success Stories
    TopicTag.tsx               — Shows taxonomy node tag on thread
    UpvoteButton.tsx           — Vote toggle (prevents double-vote)
    PasserBadge.tsx            — "ALE Passer — Class of Jan 2026" badge on author cards
    AcceptedAnswerBanner.tsx   — Green checkmark on accepted reply

Feed behavior:
  - Default sort: Hot (upvotes × recency decay)
  - Alternative sorts: Newest, Most upvoted, Unanswered
  - Filter by category
  - Filter by taxonomy subject (optional)
  - Search threads

Thread creation:
  - Title (required)
  - Body (required, markdown supported)
  - Category selector (required)
  - Topic tag (optional — select taxonomy node)
  - "Post to Campfire" button

Thread detail:
  - Thread header (title, author, timestamp, category badge, topic tag, upvotes)
  - Reply tree (flat or max 1 level of nesting)
  - Reply editor at bottom
  - If author or admin: pin, lock, delete
  - If thread category = 'question': author can mark one reply as "Accepted Answer"

Passer identification:
  - If author has passer_profiles.is_verified = true → show PasserBadge next to name
  - This creates immediate trust signal on their answers

Moderation:
  - Admin can: delete threads/replies, lock threads, pin threads
  - Users can: report threads/replies (simple flag → creates admin queue item)
  - Auto-hide: threads/replies with 5+ reports hidden pending review

Server actions: src/lib/actions/campfire.ts
  getThreads(filters, sort, page)
  getThread(threadId)
  createThread(data)
  createReply(threadId, data)
  toggleUpvote(targetType, targetId)
  acceptAnswer(replyId)
  reportContent(targetType, targetId, reason)
  pinThread(threadId) — admin only
  lockThread(threadId) — admin only
  deleteThread(threadId) — admin or author
```

---

### 5.3 — Passer Verification & Hall of Passers
**Effort:** 5 days

```
Passer self-report flow:
  Route: /dashboard/campfire/i-passed (or triggered post-exam-date)

  Step 1: "Did you take the ALE?" (yes/no)
  Step 2: "Did you pass?" (yes/no/waiting for results)
  Step 3: If yes: "Congratulations. Your final Readiness Score was {X}."
          Capture: exam_date, optional testimonial
  Step 4: "Would you like to be featured in the Hall of Passers?" (consent)
  Step 5: "Would you like to become a SlateCamp Ambassador?" (links to referral Tier 2 — future)

  Admin verification: Admin reviews passer claims (manual for now)
  Future: PRC result scraping or user-uploaded proof

Hall of Passers page:
  Route: /hall-of-passers (public marketing page, no auth required)
  Also accessible: /dashboard/campfire/hall

  Layout:
    - Hero: "They passed. So can you."
    - Grid of passer cards:
      - Avatar, name, exam date, badge label
      - Final Readiness Score ring
      - Testimonial quote (truncated, expandable)
      - "I started at [X] and finished at [Y]" trajectory
    - CTA: "Start your journey → /try"

  Passer cards sorted by: most recent exam date first
  Featured passers pinned to top (is_featured = true)

Automated post-exam prompt:
  Cron: After each ALE exam date (configured in system settings)
  Email all active users: "The ALE was {date}. How did it go?"
  Links to /dashboard/campfire/i-passed
```

---

### 5.4 — Exam Countdown System
**Effort:** 3 days (builds on profile exam_target_date from Phase 1)

```
Uses: profiles.exam_target_date (set in Phase 1.10)

Implementation:
  Utility: src/lib/exam-countdown.ts
    getCountdownStage(examDate):
      returns { daysRemaining, stage, message, uiChanges }

  Stages (from Performance Gamification skill):
    T-90+: "Your Camp Trail has you covered."
    T-60:  Camp Trail progress bar becomes more prominent
    T-30:  Heatmap shown on every session entry
    T-14:  "{daysRemaining} days. {redNodeCount} nodes still need work. Here's the priority."
    T-7:   "Stop learning new things. Review what you know."
    T-1:   "Tomorrow is the exam. Your Readiness Score is {X}. You did the work."
    T-0:   "Go win."
    T+1:   Trigger passer self-report flow

UI integration:
  - Dashboard home: countdown card (subtle, not panic-inducing)
  - Session start: contextual message based on stage
  - Sidebar: small countdown number when T < 30
```

---

## Phase 5 Verification Checklist

- [ ] Campfire thread creation, listing, detail, replies all work
- [ ] Upvoting works (toggle, prevents double-vote)
- [ ] Category and topic filtering works
- [ ] Passer self-report flow completes and creates passer_profiles record
- [ ] Hall of Passers renders publicly (no auth required)
- [ ] Passer badge displays on community posts
- [ ] Accepted answer marking works
- [ ] Moderation: report, pin, lock, delete all functional
- [ ] Exam countdown displays correct stage-appropriate message
- [ ] `bun run build` — zero errors

---

# PHASE 6: DESIGN SYSTEM ENFORCEMENT
## Weeks 15–17 | 15 days | "Make the codebase match the design spec"

---

### 6.1 — Resolve Dual Token System
**Effort:** 1 day

```
File: src/app/globals.css

Decision: Keep shadcn semantic tokens as the canonical system.
Deprecate the Camp Standard parallel tokens.

Mapping:
  --camp-cobalt → already matches --primary (#1B3FC4) ✓
  --camp-red → map to --destructive (resolve hex conflict)
  --camp-green → map to --success (resolve hex conflict)
  --camp-amber → map to --warning (resolve hex conflict)

Action:
  1. Document the canonical hex values for each semantic token
  2. Remove --camp-red, --camp-green, --camp-amber variables
  3. Update any CSS that references --camp-* to use semantic equivalents
  4. Add design system comment block at top of globals.css
```

---

### 6.2 — Design Token Migration (Top 10 Hex Values)
**Effort:** 8 days (covers 81% of 2,576 instances)

```
Migration map (from audit):
  #1B3FC4 (406 instances) → text-primary / bg-primary
  #D4DAE3 (343 instances) → border-border
  #8896A7 (315 instances) → text-muted-foreground
  #4A5568 (223 instances) → text-text-secondary (or text-foreground/70)
  #1A2332 (221 instances) → text-foreground
  #EEF2FC (141 instances) → bg-primary-50 (or bg-primary/5)
  #D64545 (113 instances) → text-destructive
  #D4951A (110 instances) → text-warning
  #1535A8 (106 instances) → text-primary-700 (or text-primary dark variant)
  #2D9F6F (102 instances) → text-success

Strategy:
  - Work directory by directory (worst first per audit: wiki/, testing/, dashboard/, admin/, ceo/)
  - Use find-and-replace with review (not blind replace — some hexes are in SVGs, charts, etc.)
  - Run ESLint hex-color rule after each directory to verify
  - Do NOT touch: chart colors in Recharts configs, SVG fills in 3D lab, brand-specific marketing assets

Order:
  Day 1-2: src/components/wiki/ (worst offender)
  Day 3-4: src/components/testing/
  Day 5-6: src/components/dashboard/
  Day 7: src/components/admin/ + src/app/(protected)/ceo/
  Day 8: Remaining scattered instances + ESLint verification pass
```

---

### 6.3 — Icon Library Consolidation
**Effort:** 3 days

```
Decision (from audit): Keep Phosphor (135 files, primary design choice).
Migrate Lucide usages (57 custom files — shadcn primitives will keep Lucide internally).

Strategy:
  1. Map Lucide icons to Phosphor equivalents
     Most have 1:1 matches (ArrowLeft → ArrowLeft, Search → MagnifyingGlass, etc.)
  2. Create migration script or do manually file-by-file
  3. Remove lucide-react from package.json after migration
  4. Keep lucide-react only if shadcn/ui components import it internally

  Exception: If shadcn components import Lucide internally (likely for ChevronDown, Check, X, etc.),
  keep lucide-react as a dependency but don't use it directly in custom components.
```

---

### 6.4 — Card Component Adoption
**Effort:** 4 days (covers highest-impact pages)

```
Target: Migrate the most visible ad-hoc card divs to use the shared Card component.

Don't migrate all 465 at once — prioritize:
  1. Dashboard home page cards (student sees these daily)
  2. Testing hub cards (session mode selectors)
  3. Analytics page cards
  4. Settings cards
  5. Wiki article cards in browse view

Pattern:
  Before: <div className="bg-card border border-border rounded-xl p-4">
  After:  <Card className="p-4">

  Before: <div className="bg-white border border-[#D4DAE3] rounded-xl p-4 shadow-sm">
  After:  <Card className="p-4">

  This naturally eliminates many hardcoded hex colors simultaneously.
```

---

### 6.5 — Accessibility Fixes
**Effort:** 3 days

```
1. Color contrast fixes (2 hours):
   - Darken #8896A7 (Ink Tertiary) to pass AA on white
   - Darken #2D9F6F (Emerald/success) to pass AA on white
   - Darken #D4951A (Amber/warning) to pass AA on white
   - Darken #E8853A (Camp Orange) to pass AA on white
   - Test with WebAIM contrast checker

2. Touch targets (4 hours):
   File: src/components/ui/button.tsx
   Add @media (pointer: coarse) overrides for 44px minimum:
     @media (pointer: coarse) {
       .btn-sm { min-height: 44px; min-width: 44px; }
       .btn-icon { min-height: 44px; min-width: 44px; }
     }

3. Alt text audit (4 hours):
   - Find all <img> and <Image> tags without alt
   - Add descriptive alt text to content images
   - Add alt="" to purely decorative images
   - Target: every image has an alt attribute

4. prefers-reduced-motion (2 hours):
   - Audit all Framer Motion animations
   - Add prefers-reduced-motion media query to disable non-essential animations
   - Keep: loading skeletons, progress bar transitions
   - Disable: stagger reveals, heatmap animations, score ring animation
```

---

## Phase 6 Verification Checklist

- [ ] Single token system in globals.css (no conflicting Camp Standard tokens)
- [ ] Top 10 hex values replaced with semantic tokens (>80% of instances)
- [ ] ESLint hex-color rule shows significant reduction
- [ ] Single icon library in custom components
- [ ] Dashboard and testing hub use Card component
- [ ] All contrast failures fixed (WebAIM passes)
- [ ] Touch targets ≥44px on mobile
- [ ] All images have alt attributes
- [ ] Reduced motion respected
- [ ] Dark mode significantly improved (blocked by token migration)
- [ ] `bun run build` — zero errors

---

# PHASE 7: DATA MOAT & INTELLIGENCE
## Weeks 18–20 | 15 days | "Data that compounds with each exam cycle"

---

### 7.1 — Post-Exam Outcome Tracking
**Effort:** 5 days

```
This is the data that makes the Readiness Score provably predictive.

Flow:
  1. User sets exam_target_date in profile (Phase 1)
  2. After exam date passes, cron triggers email: "How did the ALE go?"
  3. User reports: passed / failed / waiting for results / didn't take it
  4. If passed or failed: record in exam_outcomes table
  5. Data feeds correlation analysis: Readiness Score → Pass/Fail

Schema:
  CREATE TABLE exam_outcomes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    exam_date DATE NOT NULL,
    exam_cycle VARCHAR(20), -- 'Jan 2026', 'Jun 2026'
    outcome VARCHAR(20) NOT NULL, -- 'passed', 'failed', 'waiting', 'did_not_take'
    final_readiness_score FLOAT, -- snapshot at time of exam
    readiness_score_trajectory JSONB, -- weekly snapshots leading up to exam
    total_sessions INTEGER,
    total_questions_answered INTEGER,
    trail_completion_percentage FLOAT,
    self_reported_at TIMESTAMPTZ DEFAULT now(),
    consent_data_research BOOLEAN DEFAULT false, -- consent for anonymized research use
    consent_public_profile BOOLEAN DEFAULT false -- consent for Hall of Passers
  );

  ALTER TABLE exam_outcomes ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "Users manage own outcomes" ON exam_outcomes
    FOR ALL USING (auth.uid() = user_id);

Correlation analysis (CEO dashboard):
  Route: /ceo/outcomes (new page or section in existing insights)

  Visualizations:
    1. Readiness Score vs Pass Rate scatter plot
       X: final readiness score, Y: 1 (pass) or 0 (fail)
       With logistic regression curve overlay
       → "Students with Readiness Score ≥72 pass at 89% rate"

    2. Usage metrics vs Outcome
       Sessions completed, trail completion %, days active → pass rate
       → "Students who completed ≥60% of Camp Trail pass at 3.2x the rate"

    3. Score trajectory patterns
       Show average trajectory of passers vs failers over time
       → Visual proof that the platform works

  This data becomes:
    - Marketing asset ("89% pass rate for students who reach 72+")
    - Algorithm improvement input (refine Readiness Score model)
    - Institutional sales proof ("here's what happens to students who use SlateCamp")
```

---

### 7.2 — Growth Metrics Dashboard (CEO Portal)
**Effort:** 5 days

```
Add to existing CEO dashboard (/ceo or /ceo/growth):

Metrics to add (from Growth Engine skill):

  1. Viral Coefficient (K)
     Formula: (referral signups in period) / (total users in period)
     Source: referral_conversions table
     Display: Single number with trend arrow

  2. DAU/MAU Ratio
     Formula: daily_active_users / monthly_active_users
     Source: testing_sessions or user_interactions (users with activity)
     Target: > 25%
     Display: Number + 30-day trend line

  3. NPS (Net Promoter Score)
     Requires: In-app NPS survey (simple 0-10 scale)
     Trigger: After 14+ days of activity, once per quarter
     Formula: % promoters (9-10) - % detractors (0-6)
     Schema addition:
       CREATE TABLE nps_responses (
         id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
         user_id UUID REFERENCES auth.users(id),
         score INTEGER CHECK (score >= 0 AND score <= 10),
         feedback TEXT,
         created_at TIMESTAMPTZ DEFAULT now()
       );

  4. Diagnostic Completion Rate (Activation metric)
     Formula: completed_diagnostics / signups (same cohort)
     Source: testing_sessions WHERE mode = 'assessment'
     Target: > 60%

  5. Re-enrollment Rate
     Formula: users who return after one exam cycle / total users from previous cycle
     Source: Cross-reference exam_outcomes with new sessions in next cycle

  6. Churn Rate
     Formula: cancelled_or_inactive / active_start_of_month
     Target: < 8%/month

Layout: Add as a new "Growth" tab in CEO dashboard
Use existing Recharts and CEO dashboard patterns (MetricCard, trend charts)
```

---

### 7.3 — NPS Survey Component
**Effort:** 3 days

```
Component: src/components/dashboard/NPSSurvey.tsx

Trigger logic:
  - Show after user has been active 14+ days
  - Show only once per quarter (check nps_responses)
  - Show as a non-intrusive bottom-right slide-up
  - NOT a modal (don't interrupt study flow)

UI:
  "How likely are you to recommend SlateCamp to a fellow ALE candidate?"
  [0] [1] [2] [3] [4] [5] [6] [7] [8] [9] [10]
  "Not likely"                              "Very likely"

  After score selection:
  "Any feedback?" (optional textarea)
  [Submit] [Dismiss]

  After submit:
  "Thanks for your feedback." (disappears after 2s)

Server action: src/lib/actions/nps.ts
  submitNPS({ score, feedback })
  shouldShowNPS(userId) → boolean
```

---

### 7.4 — Data Consent Collection
**Effort:** 2 days

```
Required before any data commercialization (IP Commercialization Revenue Stream 3)

Add to: Onboarding flow (after registration, before diagnostic)
  OR: Settings page with a consent banner

Consent categories:
  1. Performance data for product improvement (default: true, required for service)
  2. Anonymized data for research and institutional reports (opt-in)
  3. Public passer profile (opt-in, asked at passer self-report time)

Schema:
  CREATE TABLE user_consents (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id),
    product_improvement BOOLEAN DEFAULT true,
    research_data BOOLEAN DEFAULT false,
    public_profile BOOLEAN DEFAULT false,
    consented_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
  );

UI: Simple toggle switches in Settings with clear plain-language explanations.
  "Allow SlateCamp to use your anonymized performance data for research
   (helps us understand ALE readiness patterns nationwide)"
```

---

## Phase 7 Verification Checklist

- [ ] Post-exam outcome survey triggers for users past their exam date
- [ ] Outcome data feeds CEO correlation analysis
- [ ] Growth metrics (K, DAU/MAU, churn, diagnostic completion) display in CEO dashboard
- [ ] NPS survey shows at correct intervals, records responses
- [ ] Data consent collected and stored, respects user choices
- [ ] `bun run build` — zero errors

---

# PHASE 8: COMMERCIALIZATION LAYER
## Weeks 21–24 | 20 days | "Build the revenue infrastructure beyond B2C"

---

### 8.1 — Guarantee Pro Tier
**Effort:** 5 days

```
New pricing tier on upgrade page:

  Guarantee Pro: ₱4,999 (one-time, 90-day access)
    Everything in Exam Pass PLUS:
    - "If you use SlateCamp for 60+ days, complete 80%+ of Camp Trail,
       and still fail the ALE — you get ₱2,000 back."
    - Priority support
    - Extended Campfire access (post-exam)

Schema:
  -- Track activity thresholds for guarantee eligibility
  CREATE TABLE guarantee_tracking (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id),
    subscription_id UUID REFERENCES user_subscriptions(id),
    active_days INTEGER DEFAULT 0, -- days with at least 1 session
    trail_completion FLOAT DEFAULT 0, -- percentage of assigned trail completed
    meets_activity_threshold BOOLEAN GENERATED ALWAYS AS (
      active_days >= 60 AND trail_completion >= 0.8
    ) STORED,
    refund_eligible BOOLEAN DEFAULT false,
    refund_requested BOOLEAN DEFAULT false,
    refund_processed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
  );

Daily cron update:
  - For each Guarantee Pro user: increment active_days if they had a session today
  - Update trail_completion from trail_progress

Refund flow:
  1. After exam_outcomes.outcome = 'failed' AND meets_activity_threshold = true
  2. User sees: "You're eligible for the Guarantee refund. Claim ₱2,000."
  3. Claim triggers: admin notification + refund processing (manual initially, automate later)

Upgrade page addition:
  - Third tier card between Pro Monthly and Exam Pass (or above Exam Pass)
  - Badge: "GUARANTEE" in camp-orange
  - Prominent "Your money back if you don't pass" messaging
  - Terms link to detailed eligibility criteria
```

---

### 8.2 — Institutional Dashboard (School Portal)
**Effort:** 10 days

```
Route: /institution (new portal, separate from /admin and /ceo)

This is a read-only analytics portal for architecture school department chairs
and review center administrators.

Schema:
  CREATE TABLE institutions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'university', 'review_center'
    contact_person VARCHAR(200),
    contact_email VARCHAR(200),
    logo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
  );

  CREATE TABLE institution_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID REFERENCES institutions(id) NOT NULL,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    role VARCHAR(20) DEFAULT 'student', -- 'student', 'admin', 'viewer'
    enrolled_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(institution_id, user_id)
  );

  CREATE TABLE institution_licenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID REFERENCES institutions(id) NOT NULL,
    tier VARCHAR(50) NOT NULL, -- 'semester', 'annual', 'trial'
    student_cap INTEGER NOT NULL,
    starts_at DATE NOT NULL,
    expires_at DATE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
  );

  -- RLS: institution admins see their institution's data only
  ALTER TABLE institutions ENABLE ROW LEVEL SECURITY;
  ALTER TABLE institution_memberships ENABLE ROW LEVEL SECURITY;
  ALTER TABLE institution_licenses ENABLE ROW LEVEL SECURITY;

Portal pages:
  /institution                    → Dashboard overview
  /institution/students           → Student roster with readiness scores
  /institution/performance        → Aggregate analytics
  /institution/settings           → Institution profile, license info

Dashboard:
  - Active students count (vs license cap)
  - Average Readiness Score (aggregate)
  - Readiness Score distribution histogram
  - Weakest taxonomy subjects (aggregate across all students)
  - Top performers list
  - Exam outcome summary (if available)

Student roster:
  - Table: name, readiness score, streak, trail progress, last active
  - Click → individual student detail (read-only analytics view)
  - Export roster as CSV

Performance analytics:
  - Subject-level performance heatmap (aggregate)
  - Cohort comparison (this semester vs last)
  - Usage trends (sessions per week, average session duration)

Auth: institution admin role in institution_memberships
  - Added by SlateCamp admin (manual onboarding for now)
  - Middleware: /institution/* routes require institution admin role

Student self-enrollment:
  - Student enters institution code during onboarding
  - Creates institution_memberships record
  - Student retains full personal dashboard — institution sees aggregate only
```

---

### 8.3 — White-Label Engine Foundation
**Effort:** 5 days (foundation only — full white-label is Phase 2 of commercialization)

```
This phase builds the theming infrastructure. Full white-label
(custom domains, separate deployments) is a later milestone.

Implementation:
  1. Brand config table:
     CREATE TABLE brand_configs (
       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
       institution_id UUID REFERENCES institutions(id),
       primary_color VARCHAR(7) DEFAULT '#1B3FC4',
       logo_url TEXT,
       brand_name VARCHAR(100) DEFAULT 'SlateCamp',
       tagline VARCHAR(200),
       is_active BOOLEAN DEFAULT true
     );

  2. Brand context provider:
     src/lib/brand/BrandProvider.tsx
       - Reads brand_config based on institution context (or default SlateCamp)
       - Sets CSS custom properties dynamically
       - Components read from CSS variables (already partially in place from token system)

  3. Minimal UI changes:
       - Sidebar logo reads from brand config
       - Primary color CSS variable overridden from brand config
       - "Powered by SlateCamp" footer on white-labeled instances

  This is the FOUNDATION. Full white-label (custom domains, DNS, separate Vercel deployments)
  comes later when institutional revenue justifies the infrastructure cost.
```

---

### 8.4 — 3D Lab Standalone Access Mode
**Effort:** 3 days

```
The 3D Lab exists and works at 80% completion. This adds a standalone access mode
for schools that want 3D Lab without the full exam prep platform.

Implementation:
  1. New route: /3d-lab/[moduleId] (public, no auth, but license-gated)
  2. License check: institution_licenses.tier includes '3d_lab_only'
  3. Access control: institution code + active license → full 3D Lab access
  4. Standalone UI: 3D Lab viewer without sidebar, without testing hub
     - Keep: all 3D interactive features, hotspots, annotations, cross-sections
     - Remove: navigation to testing, wiki, analytics
     - Add: "Full ALE prep platform →" upsell CTA

  Schema:
    -- Add 3d_lab tier to institution_licenses
    -- tier: 'semester', 'annual', 'trial', '3d_lab_only'

  Marketing page:
    /3d-lab (public landing page)
    - Hero: "Interactive 3D Architectural Models for the Classroom"
    - Module gallery with previews
    - Pricing: ₱3,000–₱8,000/class/semester
    - "Request a demo" form
```

---

## Phase 8 Verification Checklist

- [ ] Guarantee Pro tier displays on upgrade page with eligibility terms
- [ ] Activity tracking cron updates active_days and trail_completion
- [ ] Refund eligibility auto-computed
- [ ] Institutional portal shows aggregate student analytics
- [ ] Institution admin can view student roster and performance
- [ ] Students can self-enroll via institution code
- [ ] Brand config overrides primary color and logo
- [ ] "Powered by SlateCamp" shows on white-labeled instances
- [ ] 3D Lab accessible in standalone mode with license check
- [ ] `bun run build` — zero errors

---

# DEFERRED FEATURES (Post-24 Weeks)

These features were in the analysis but are intentionally deferred because they either require significant user base first, or their ROI is unclear at current scale:

| Feature | Reason for Deferral | Trigger to Build |
|---------|-------------------|------------------|
| **Payment Buttons + Billing Page** | Founder directive — deferred | Insert whenever ready (1 day) |
| **Readiness Score API** | Needs data volume + external customers | When 5+ institutions express interest |
| **ALE Performance Intelligence Product** | Needs 1,000+ user outcomes | After 2 full exam cycles with outcome data |
| **Content Marketplace** | Needs content contributor ecosystem | When 10+ external content creators onboard |
| **Platform Expansion (NLE, CE, etc.)** | Needs ALE market proven first | When ALE captures 10%+ of candidates |
| **Study Pods** | Needs Campfire community active first | After Campfire has 100+ weekly active users |
| **Referral Tier 2 (Passer Ambassador)** | Needs passers first | After first exam cycle with outcome tracking |
| **Referral Tier 3 (Group/Pod)** | Needs Study Pods | After pods feature ships |
| **Cohort Competition (Mastery-Tiered)** | Needs user volume for tiers | When 500+ concurrent active users |

---

# APPENDIX: DATABASE MIGRATIONS SUMMARY

All new tables across all 8 phases, in recommended migration order:

```
Migration 039: ALTER user_global_stats ADD theta
Migration 040: CREATE user_streaks
Migration 041: CREATE heatmap_snapshots
Migration 042: CREATE notification_preferences
Migration 043: CREATE reengagement_emails
Migration 044: CREATE referral_codes + referral_conversions
Migration 045: CREATE study_schedule
Migration 046: CREATE campfire_threads + campfire_replies + campfire_votes
Migration 047: CREATE passer_profiles + hall_of_passers
Migration 048: CREATE exam_outcomes
Migration 049: CREATE nps_responses
Migration 050: CREATE user_consents
Migration 051: CREATE guarantee_tracking
Migration 052: CREATE institutions + institution_memberships + institution_licenses
Migration 053: CREATE brand_configs
Migration 054: ADD search_vector to wiki_articles + GIN index
Migration 055: CREATE MATERIALIZED VIEW activation_funnel
```

---

# APPENDIX: NEW FILE CREATION SUMMARY

Estimated new files per phase:

| Phase | New Files | Key Files |
|-------|-----------|-----------|
| 1 | ~8 | contact.ts, profile.ts, about/page.tsx, contact/page.tsx, ProfileEditor.tsx |
| 2 | ~12 | wiki-search.ts, question-browser.ts, schedule.ts, WikiSearchPage.tsx, QuestionBrowser.tsx, StudyCalendar.tsx, SimulationCompare.tsx |
| 3 | ~15 | streak.ts, heatmap-delta.ts, manifest.json, sw.js, reengagement.ts, email templates (4), NotificationSettings.tsx |
| 4 | ~10 | sharing.ts, referral.ts, score-card API routes (2), ReferralCodeCard.tsx, ActivationFunnel.tsx |
| 5 | ~20 | campfire.ts, CampfireFeed.tsx, ThreadCard.tsx, ThreadDetail.tsx, ReplyEditor.tsx, PasserBadge.tsx, HallOfPassers page, PasserFlow page, ExamCountdown.tsx |
| 6 | ~0 (modifications only) | globals.css updates, component migrations |
| 7 | ~8 | nps.ts, outcome-tracking.ts, consent.ts, NPSSurvey.tsx, OutcomeCorrelation.tsx, GrowthMetrics.tsx |
| 8 | ~15 | guarantee.ts, institution portal pages (4), BrandProvider.tsx, 3DLabStandalone.tsx, brand_configs routes |
| **Total** | **~88 new files** | |

---

*Roadmap generated 2026-03-26. Derived from the Unimplemented Features Analysis, cross-referenced with: slatecamp-competitive-moat, slatecamp-growth-engine, slatecamp-ip-commercialization, slatecamp-design-system-engineer, slatecamp-performance-gamification, slatecamp-revenue-architecture, slatecamp-db-architect skills, and the Global Codebase Audit Report (2026-03-25).*

