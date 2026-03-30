# Extended Production Documents — The Complete Set

The first checklist covered what the AI needs to run the security/performance audit. This document covers everything else that breaks production apps — the operational, data, testing, and business logic documents that prevent the *other* kinds of disasters: the ones where the code is technically correct but the product still fails.

---

## CATEGORY 1: Data Protection & Recovery

These prevent the "we lost student data" catastrophe.

### 7. `BACKUP-AND-RECOVERY-PLAN.md`

**What breaks without it:** Supabase manages backups, but do you know the RPO (how much data you can afford to lose) and RTO (how long recovery takes)? If the mastery engine corrupts data from a bad migration, can you restore to a point before the corruption?

**What to include:**
```
# Supabase Backup Configuration
Plan tier:           [Free / Pro / Enterprise]
Automatic backups:   [Daily / Point-in-time recovery]
Retention period:    [7 days / 30 days]
RPO target:          < 1 hour (a student can redo 1 hour of quizzes; more than that = trust destroyed)
RTO target:          < 30 minutes

# Manual Backup Procedures
Pre-migration backup:  pg_dump command with exact flags
                       Where backups are stored (S3 bucket / local / Supabase dashboard)
Post-migration verify: Query to confirm row counts match pre-backup

# Recovery Scenarios
Scenario 1: Bad migration corrupts user_node_mastery → rollback steps
Scenario 2: Accidental mass delete via service_role → restore from backup
Scenario 3: Supabase outage → status page monitoring + student-facing message
Scenario 4: RLS policy accidentally dropped → detection + emergency re-apply

# Immutable Data Protection
user_interactions:         NEVER deleted — this is the source of truth for all analytics
user_node_mastery:         NEVER deleted — this drives Readiness Score
readiness_score_snapshots: NEVER deleted — this is the trajectory chart history
```

---

### 8. `DATA-MIGRATION-PLAYBOOK.md`

**What breaks without it:** You will ship schema changes after launch. Every migration is a chance to corrupt live student data. The AI needs a strict protocol to follow when suggesting schema changes.

**What to include:**
```
# Pre-Migration Checklist
□ Backup taken and verified (pg_dump + row count check)
□ Migration tested on local Supabase (supabase db reset + apply)
□ Migration tested on Supabase branch database (if available)
□ Migration is additive (no DROP COLUMN — use _deprecated suffix)
□ New NOT NULL columns have DEFAULT values
□ New indexes use CONCURRENTLY (prevents table locks on large tables)
□ RLS policies reviewed for any new/changed columns
□ Type generation run: npx supabase gen types typescript --local

# During Migration
□ Run during lowest-traffic window (PH timezone: 2–5 AM PHT)
□ Monitor connection pool (Supavisor) during migration
□ If migration takes > 30 seconds, investigate lock contention

# Post-Migration Checklist
□ Verify row counts on affected tables
□ Spot-check 5 random user records for data integrity
□ Run the app locally against production DB (read-only) to verify queries work
□ Monitor Sentry for new errors for 1 hour post-deploy
□ Update domain-model.md with schema changes
□ Regenerate TypeScript types and commit
```

---

### 9. `SEED-DATA-AND-TEST-ACCOUNTS.md`

**What breaks without it:** The AI can't test its own suggestions without representative data. You can't QA loading states, empty states, edge cases, or subscription tier logic without accounts that represent each user state.

**What to include:**
```
# Test Accounts (Staging Environment)
test-free@slatecamp.com        → Free tier, completed diagnostic, 0 quiz sessions
test-pro@slatecamp.com         → Pro monthly, 50+ sessions, active Camp Trail enrollment
test-newuser@slatecamp.com     → Just signed up, no diagnostic, no data (empty states)
test-retaker@slatecamp.com     → Pro exam pass, 200+ sessions, high mastery, near exam date
test-expired@slatecamp.com     → Subscription lapsed 5 days ago (grace period active)
test-expired-30d@slatecamp.com → Subscription lapsed 35 days ago (grace period expired)
test-admin@slatecamp.com       → Admin/service role access (if applicable)

# Seed Data Script
Location: scripts/seed-test-data.ts
What it creates:
  - 5 user profiles with varying exam dates
  - 10–200 quiz sessions per user across all modes
  - Realistic user_interactions distribution across taxonomy
  - Computed user_node_mastery values (not random — follows EMA formula)
  - Notes, trail enrollments, readiness score snapshots
  - One user with zero data (empty state testing)

# How to Run
npm run seed:staging     → Seeds the staging Supabase project
npm run seed:local       → Seeds the local Supabase instance
```

---

## CATEGORY 2: Testing & Quality Gates

These prevent "it worked in staging but broke in production."

### 10. `TESTING-STRATEGY.md`

**What breaks without it:** The AI will suggest code changes across dozens of files. Without a testing strategy, you have no way to verify that fixes don't break existing functionality. You're doing surgery without checking the patient's pulse.

**What to include:**
```
# What We Test (and How)

## Critical Path Tests (must pass before every deploy)
These cover the core loop — if any of these break, students can't study:
1. Auth flow:        signup → login → dashboard redirect → logout
2. Quiz flow:        select mode → answer questions → complete → score saved
3. Mastery update:   quiz completion → user_interactions inserted → mastery recalculated
4. Readiness Score:  mastery change → score snapshot created → dashboard reflects new score
5. Subscription:     free user hits paywall → checkout → webhook → access granted

## Testing Stack
Unit tests:          [Vitest / Jest] — pure functions, query transforms, Zod schemas
Integration tests:   [Playwright / Cypress] — critical user flows (the 5 above)
RLS policy tests:    SQL test scripts that attempt unauthorized access and verify denial
API route tests:     [supertest or manual] — webhook signature verification, cron auth

## What We Don't Test (yet)
- Individual component rendering (low ROI at current stage)
- CSS/visual regression (manual QA for now)
- 3D Lab interactions (too complex for automated testing at launch)

## How to Run
npm run test           → Unit tests
npm run test:e2e       → Playwright critical path tests
npm run test:rls       → RLS policy verification SQL scripts
```

---

### 11. `RLS-POLICY-TEST-SUITE.md`

**What breaks without it:** RLS is your last line of defense. The only way to verify it works is to try to break it. This document contains SQL scripts that attempt unauthorized access against every table.

**What to include:**
```
# RLS Verification Protocol
# Run these queries AS a specific user to verify row-level isolation

-- Setup: Connect as test user A
SET request.jwt.claims = '{"sub": "user-a-uuid"}';

-- Test 1: User A cannot see User B's quiz sessions
SELECT count(*) FROM quiz_sessions WHERE user_id = 'user-b-uuid';
-- Expected: 0 rows

-- Test 2: User A cannot update User B's notes
UPDATE notes SET title = 'hacked' WHERE user_id = 'user-b-uuid';
-- Expected: 0 rows affected

-- Test 3: User A cannot insert a quiz session for User B
INSERT INTO quiz_sessions (user_id, mode, status)
VALUES ('user-b-uuid', 'camp', 'in_progress');
-- Expected: RLS violation error

-- Test 4: User A cannot delete any user_interactions (no DELETE policy)
DELETE FROM user_interactions WHERE user_id = 'user-a-uuid';
-- Expected: RLS violation error (no DELETE policy exists)

-- Test 5: Anonymous user can read wiki_articles
SET request.jwt.claims = '{}';
SELECT count(*) FROM wiki_articles WHERE status = 'published';
-- Expected: > 0 rows

-- Test 6: Anonymous user cannot read user data
SELECT count(*) FROM profiles;
-- Expected: 0 rows

# Run for EVERY table in the public schema.
# Re-run after every migration that touches RLS policies.
```

---

### 12. `CRITICAL-USER-FLOWS.md`

**What breaks without it:** When the AI suggests changes to middleware, Server Actions, or query functions, it needs to know which user flows those changes will affect. This is the regression map.

**What to include:**
```
# Flow 1: First-Time User Onboarding
Landing page → Sign up → Onboarding questions (exam date, school) → 
Diagnostic Quiz (30 questions) → Readiness Score reveal → 
Dashboard (heatmap + score) → Prompted to start Camp Trail

Files involved: middleware.ts, /signup/page.tsx, /onboarding/page.tsx,
  actions/profile.ts, actions/quiz.ts, queries/dashboard.ts
Tables touched: profiles, quiz_sessions, user_interactions, 
  user_node_mastery, readiness_score_snapshots

# Flow 2: Daily Study Session (Core Loop)
Login → Dashboard → Choose quiz mode → Quiz engine (Zustand) →
Answer 10–30 questions → Session complete → Mastery updated →
Readiness Score refreshed → Dashboard reflects changes

Files involved: queries/dashboard.ts, actions/quiz.ts, 
  stores/useSessionStore.ts, components/quiz/*
Tables touched: quiz_sessions, user_interactions, user_node_mastery,
  readiness_score_snapshots

# Flow 3: Subscription Purchase
Free user hits paywall → Choose plan → Redirect to Stripe/Payrex →
Payment completes → Webhook fires → user_subscriptions updated →
User redirected back → Pro features unlocked immediately

Files involved: components/Paywall.tsx, actions/subscription.ts,
  api/webhooks/stripe/route.ts, api/webhooks/payrex/route.ts
Tables touched: user_subscriptions

# Flow 4: Subscription Expiry
Subscription lapses → Grace period starts (30 days) →
User sees "subscription expired" banner → Read-only access to own data →
New quiz sessions blocked → After 30 days, full lock (paywall on every page)

Files involved: middleware.ts, actions/subscription.ts, 
  components/SubscriptionBanner.tsx
Tables touched: user_subscriptions

# Flow 5: Quiz Session Recovery (network drop)
Student answering quiz → Network drops → Zustand store persists state →
Network returns → Answers sync → Session completes normally
OR: Student closes browser → Returns → Session marked abandoned after timeout

Files involved: stores/useSessionStore.ts, actions/quiz.ts,
  hooks/useNetworkStatus.ts (if exists)
Tables touched: quiz_sessions, user_interactions

# Flow 6: Camp Trail Progression
Enroll in trail → Complete Day 1 steps (quiz + wiki + optional 3D Lab) →
Day 1 marked complete → Day 2 unlocks → Progress tracked →
Trail completion → Certificate or milestone acknowledgment

Files involved: actions/trail.ts, queries/trail.ts, 
  components/trail/*
Tables touched: user_trail_enrollments, user_trail_progress,
  trail_day_completions, session_trail_credits
```

---

## CATEGORY 3: Business Logic That Lives Outside Code

These prevent "the code is correct but the product is wrong."

### 13. `SUBSCRIPTION-LIFECYCLE-SPEC.md`

**What breaks without it:** Subscription logic is the #1 source of production bugs in SaaS. The AI needs to know every state transition, not just "free vs paid."

**What to include:**
```
# Subscription States
NONE        → Never subscribed (new user, free tier)
TRIALING    → On free trial (if you offer one)
ACTIVE      → Paying, subscription current
PAST_DUE    → Payment failed, retry in progress (Stripe handles retries)
GRACE       → Subscription canceled/expired, within 30-day grace window
EXPIRED     → Grace period over, full paywall enforced
CANCELED    → User actively canceled (treat as GRACE until period ends)

# State Transitions
NONE → ACTIVE:      Checkout completed (webhook: checkout.session.completed)
ACTIVE → PAST_DUE:  Payment failed (webhook: invoice.payment_failed)
PAST_DUE → ACTIVE:  Retry succeeds (webhook: invoice.payment_succeeded)
PAST_DUE → GRACE:   All retries exhausted (webhook: customer.subscription.deleted)
ACTIVE → CANCELED:  User cancels (webhook: customer.subscription.updated, cancel_at_period_end = true)
CANCELED → GRACE:   Billing period ends (webhook: customer.subscription.deleted)
GRACE → EXPIRED:    30 days after grace start (cron job or Supabase function)

# What Each State Can Access
State       | Quiz | Wiki | Notes | Trail | 3D Lab | Readiness Score
------------|------|------|-------|-------|--------|----------------
NONE        | 5/day| All  | 10max | 3days | 1 mod  | Basic
ACTIVE      | ∞    | All  | ∞     | All   | All    | Full
PAST_DUE    | ∞    | All  | ∞     | All   | All    | Full (still paying)
GRACE       | 0    | All  | Read  | Read  | Read   | Read-only
EXPIRED     | 0    | All  | Read  | 0     | 0      | Hidden
CANCELED    | ∞    | All  | ∞     | All   | All    | Full (until period ends)

# Edge Cases the AI Must Handle
- Student is mid-quiz when subscription expires → Let them finish the session
- Student on grace period tries to start quiz → Show paywall, not error
- Webhook arrives out of order → Idempotent processing (check current state before applying)
- Student pays via Payrex (GCash) → Webhook structure differs from Stripe
- Student downgrades mid-billing-cycle → Access continues until period ends
```

---

### 14. `RATE-LIMITS-AND-ABUSE-PREVENTION.md`

**What breaks without it:** On launch day, if someone scripts 10,000 quiz sessions, your DB melts, your Supabase bill explodes, and real students can't study.

**What to include:**
```
# API Rate Limits
Server Actions (authenticated):  60 requests/minute per user
API Route Handlers:              30 requests/minute per IP
Webhook endpoints:               100 requests/minute (Stripe/Payrex volume)
AI features (Claude API):        10 requests/minute per user (cost control)

# Quiz Engine Limits
Max concurrent sessions per user:     1
Max questions per session:            50
Max sessions per day (free tier):     5
Max sessions per day (pro tier):      No limit (but flag > 50/day as suspicious)
Session timeout (abandoned):          2 hours of inactivity

# Abuse Signals
Flag for review if any user:
- Creates > 50 quiz sessions in 24 hours
- Answers > 500 questions in 1 hour (bot-like speed)
- Generates > 100 API calls in 1 minute
- Has multiple accounts from same IP completing diagnostics (gaming free tier)

# Implementation
Where rate limiting lives: [Middleware / Vercel Edge Config / Upstash Redis]
How to implement:          [Vercel built-in / @upstash/ratelimit / custom]
What happens on limit hit: Return 429 with Retry-After header + friendly UI message
```

---

### 15. `FEATURE-FLAGS-REGISTRY.md`

**What breaks without it:** You will need to ship features gradually, kill features instantly, and A/B test without redeploying. The AI needs to know your feature flag system to suggest safe rollout strategies for production changes.

**What to include:**
```
# Feature Flag System
Storage:         feature_flags table in Supabase (already in schema)
Evaluation:      Server-side only (checked in Server Components / Actions)
Client access:   Passed as props from Server Components, never fetched client-side
Cache:           Per-request (no stale flags)

# Active Flags
Flag Name              | Type    | Default | Description
-----------------------|---------|---------|------------
enable_3d_lab          | boolean | false   | 3D Lab feature access
enable_ai_coach        | boolean | false   | Claude-powered study recommendations
enable_camp_trail_v2   | boolean | false   | New trail progression engine
maintenance_mode       | boolean | false   | Show maintenance page to all users
force_paywall          | boolean | false   | Block all free access (emergency monetization)

# Rollout Protocol
1. Ship feature behind flag (default: off)
2. Enable for test accounts first
3. Enable for 10% of users (random, stable assignment by user_id)
4. Monitor error rates and performance for 24 hours
5. Ramp to 50% → 100% over 3–7 days
6. Remove flag and dead code after 30 days of 100% rollout

# Kill Switch Protocol
If a feature causes production issues:
1. Set flag to false in Supabase dashboard (immediate, no deploy needed)
2. Investigate root cause
3. Fix and re-enable via normal rollout protocol
```

---

### 16. `WEBHOOK-CONTRACTS.md`

**What breaks without it:** Payment webhooks are the most dangerous code in your app. If they fail silently, students pay but don't get access. If they're not idempotent, students get double-charged or double-credited.

**What to include:**
```
# Stripe Webhooks
Endpoint: /api/webhooks/stripe
Verification: stripe.webhooks.constructEvent(body, sig, STRIPE_WEBHOOK_SECRET)

Events we handle:
checkout.session.completed     → Create/activate user_subscriptions row
invoice.payment_succeeded      → Update subscription status to ACTIVE
invoice.payment_failed         → Update subscription status to PAST_DUE
customer.subscription.updated  → Handle plan changes, cancellation scheduling
customer.subscription.deleted  → Start grace period (set grace_started_at)

Idempotency: Check stripe_subscription_id + event type before applying.
             If already processed (status already matches), return 200 and do nothing.
Retry policy: Stripe retries for up to 72 hours. Our endpoint MUST return 200
              even if we've already processed the event.

# Payrex Webhooks
Endpoint: /api/webhooks/payrex
Verification: [HMAC signature / API key header — document exact method]

Events we handle:
payment.paid                   → Activate subscription
payment.failed                 → Log, notify user via email

# Common Failure Modes
- Webhook arrives before user exists in profiles → Queue and retry
- Webhook arrives out of order (deleted before created) → Check timestamps
- Webhook replay attack → Verify signature + check idempotency key
- Supabase down when webhook arrives → Return 500 so Stripe retries
```

---

## CATEGORY 4: Operational Readiness

These prevent "the app is fine but we can't operate it."

### 17. `MONITORING-AND-ALERTING-SPEC.md`

**What breaks without it:** The audit (Phase 3) will recommend setting up Sentry. But Sentry with default config is noise. This document tells the AI what to actually alert on.

**What to include:**
```
# Alert Tiers

## P0 — Wake Up (PagerDuty / SMS / immediate)
- Auth system down (login failures > 50% in 5 minutes)
- Payment webhook returning 500s (students paying but not getting access)
- Database connection pool exhausted
- RLS policy error detected (data leak risk)
- Error rate > 10% on any route for 5+ minutes

## P1 — Fix Today (Slack / email)
- New unhandled error type appearing > 10 times in 1 hour
- API response time p95 > 3 seconds for 15+ minutes
- Supabase approaching rate limits or storage limits
- Failed quiz session save (student loses progress)
- Stripe/Payrex webhook failure (individual, not systemic)

## P2 — Fix This Week (Dashboard only)
- JS bundle size increased > 10% from last deploy
- New console.error patterns in production
- 404 rate spike (broken links or SEO issues)
- Slow query detected (> 500ms)

# Dashboards
Main dashboard:     Error rate, p95 latency, active users, quiz completions/hour
Payment dashboard:  Webhook success rate, conversion rate, MRR
Student dashboard:  DAU/WAU, quiz sessions/day, average session length, churn signals
```

---

### 18. `LOAD-TESTING-SCENARIOS.md`

**What breaks without it:** Your GTM strategy targets exam-season launches. When 500 students hit the diagnostic quiz simultaneously on launch day, will the app hold?

**What to include:**
```
# Target Load Profile
Normal day:          50–200 concurrent users
Exam season peak:    500–1,000 concurrent users
Viral spike:         2,000–5,000 concurrent (TikTok goes viral)
Launch day target:   Sustain 500 concurrent without degradation

# Critical Scenarios to Test

## Scenario 1: Diagnostic Quiz Stampede
500 users start diagnostic quiz simultaneously
Each user answers 30 questions over 20 minutes
= 500 INSERT into quiz_sessions
= 15,000 INSERT into user_interactions (over 20 min)
= 500 mastery recalculations at completion
Test: Can user_node_mastery triggers handle 500 concurrent updates?

## Scenario 2: Dashboard Load
200 users refresh dashboard simultaneously
Each dashboard loads: heatmap, readiness score, recent sessions, trail progress
= 800+ concurrent SELECT queries
Test: Are indexes sufficient? Does connection pooling hold?

## Scenario 3: Webhook Flood
100 Stripe webhooks arrive in 60 seconds (batch renewal day)
Test: Does the webhook handler process all without dropping any?

# Tools
[k6 / Artillery / Locust] — pick one, document the test scripts
Run against: staging environment (never production)
Baseline metrics: Record p50/p95/p99 latency + error rate at each load level
```

---

### 19. `CRON-JOBS-AND-SCHEDULED-TASKS.md`

**What breaks without it:** Background processes are invisible until they fail. If the readiness score cron stops running, students see stale scores and lose trust.

**What to include:**
```
# Scheduled Tasks

Task                          | Schedule      | What It Does                              | Failure Impact
------------------------------|---------------|-------------------------------------------|---------------
Readiness Score recalc        | Every 15 min  | Recalculates scores for users with new data| Stale scores on dashboard
Subscription grace expiry     | Daily 3 AM PHT| Moves GRACE → EXPIRED after 30 days       | Free access for expired users
Abandoned session cleanup     | Every 2 hours | Marks old in_progress sessions as abandoned| Blocks new sessions (if max 1 concurrent)
Analytics aggregation         | Daily 4 AM PHT| Rolls up user_interactions into daily stats| Stale analytics, wrong churn signals
Supabase storage cleanup      | Weekly        | Removes orphaned files from storage bucket | Storage costs creep up

# Implementation
Where they run:   [Vercel Cron / Supabase pg_cron / external (BetterStack, Inngest)]
Auth mechanism:   CRON_SECRET header verified in route handler
Monitoring:       Each cron logs start/end/duration/row-count to analytics_events
Alert on:         Any cron that hasn't run in 2x its expected interval
```

---

### 20. `CONTENT-MANAGEMENT-PROTOCOL.md`

**What breaks without it:** Wiki articles, quiz questions, and taxonomy content are your product. If someone publishes a question with a wrong answer, or a wiki article with incorrect code references, students learn wrong information and fail the exam.

**What to include:**
```
# Content Publication Flow
Draft → Review → Published

# Who Can Publish
Wiki articles:       [Philip / content team] via Supabase dashboard or admin UI
Quiz questions:      [Philip / subject matter experts] — requires answer key verification
Taxonomy changes:    Philip only — taxonomy structure affects all downstream systems
3D Lab content:      Philip only — requires GLB pipeline + hotspot mapping

# Content Validation Rules
Quiz questions:
  □ Exactly 4 answer choices
  □ Exactly 1 correct answer marked
  □ Distractor rationales written for all 3 wrong answers
  □ Mapped to correct taxonomy node
  □ Difficulty tag assigned (easy / medium / hard)
  □ Code reference verified against ph-arch-construction-law skill

Wiki articles:
  □ Mapped to taxonomy node
  □ All code section references verified
  □ Reading time estimated (word count / 200)
  □ Content preview generated (first 200 chars, stripped of markdown)

# Rollback
If published content is wrong:
  1. Set status to 'draft' immediately (removes from student view)
  2. Fix content
  3. Re-publish
  4. If quiz question was answered by students with wrong answer key:
     → Flag affected user_interactions
     → Recalculate affected user_node_mastery
     → Log incident
```

---

## The Complete Document Map

| # | Document | Category | Creates Before or After Audit |
|---|----------|----------|-------------------------------|
| 1 | Route Map | Security | Before |
| 2 | Env Registry | Security | Before |
| 3 | Server Actions Inventory | Security | Before |
| 4 | Deployment Config | Operations | Before |
| 5 | Third-Party Services | Operations | Before |
| 6 | Subscription Access Matrix | Business Logic | Before |
| 7 | Backup & Recovery Plan | Data Protection | Before |
| 8 | Data Migration Playbook | Data Protection | Before |
| 9 | Seed Data & Test Accounts | Testing | Before |
| 10 | Testing Strategy | Testing | Before |
| 11 | RLS Policy Test Suite | Testing | Before |
| 12 | Critical User Flows | Testing | Before |
| 13 | Subscription Lifecycle Spec | Business Logic | Before |
| 14 | Rate Limits & Abuse Prevention | Security | Before |
| 15 | Feature Flags Registry | Operations | Before |
| 16 | Webhook Contracts | Business Logic | Before |
| 17 | Monitoring & Alerting Spec | Operations | Before |
| 18 | Load Testing Scenarios | Testing | Before |
| 19 | Cron Jobs & Scheduled Tasks | Operations | Before |
| 20 | Content Management Protocol | Business Logic | Before |

**Plus the 3 post-audit documents from the first checklist:**
| 21 | Production Runbook | Operations | After |
| 22 | Pre-Deploy Checklist | Quality Gates | After |
| 23 | Incident Log | Operations | After (ongoing) |

---

## Realistic Prioritization

You don't need all 20 before you run the audit. Here's the order that gives the AI the most value per hour of your time:

**Must have (audit won't work well without these):**
1. Route Map (30 min)
2. Server Actions Inventory (45 min)
3. Subscription Lifecycle Spec (1 hour)
4. Critical User Flows (1 hour)
5. Env Registry (15 min)
6. Webhook Contracts (45 min)

**Should have (prevents the AI from suggesting things that break your business):**
7. Subscription Access Matrix (30 min)
8. Rate Limits & Abuse Prevention (30 min)
9. Deployment Config (20 min)
10. Feature Flags Registry (20 min)
11. Cron Jobs & Scheduled Tasks (30 min)

**Nice to have (you'll wish you had these by week 2 of production):**
12–20. Everything else. Write them in the first two weeks after launch.

**Total for "must have" set: ~4 hours.** Combined with the 3.5 hours from the first checklist, you're looking at a solid day of documentation work that transforms the AI audit from "generic checklist" to "surgical production roadmap."
