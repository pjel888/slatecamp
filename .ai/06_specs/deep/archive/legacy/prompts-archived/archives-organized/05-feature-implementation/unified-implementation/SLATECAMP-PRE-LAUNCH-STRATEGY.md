# SLATECAMP PRE-LAUNCH STRATEGY
## Generated 2026-03-25 — Based on Global Codebase Audit + Seven-Specialist Business Analysis

---

## 1. EXECUTIVE SUMMARY

**The 30-day mission directive:** SlateCamp has a genuinely differentiated mastery engine (IRT-based scoring, 7 testing modes, anti-inflation readiness, 3D spatial visualization) wrapped in a modern stack — but it cannot make a single peso. Payment buttons are non-functional, the spaced repetition system is silently dead for all primary testing flows, and security headers are absent. The product is 90% infrastructure and 0% revenue. The mission for the next 30 days is to close the last-mile gaps that separate a remarkable technical achievement from a functioning business.

**The three numbers that matter:**

| Metric | Value | Why It Matters |
|--------|-------|----------------|
| Break-even subscriber count | ~560 paying users | At ₱399/month ARPU, 77% gross margin, ₱172,000/month burn |
| Target free→paid rate | >3% (grow to 7%+) | Below 2% = product-market fit problem, not a marketing problem |
| Engineering hours to revenue | ~8 hours | Wire 2 payment buttons + billing page. That's it. Everything else exists. |

**The one sentence that defines success:** SlateCamp launches with 50–100 beta users, 25+ paying subscribers (₱10,000 MRR — Gate 1), and 10+ video testimonials within 90 days of opening the doors.

**Overall audit verdict:** The codebase is a B- (72% weighted competitive score) with an A- infrastructure, B+ feature completeness, and a D+ on code quality. The core learning experience scores 88%. The monetization score is 45%. The gap between product quality and business readiness is the single largest risk to SlateCamp's survival.

---

## 2. THE PRE-LAUNCH HIT LIST

### 2.1 Launch Blockers — MUST FIX (Ship Date at Risk)

These items prevent a user from completing the core loop (Diagnostic → Readiness Score → Camp Trail → Storm Mode) or prevent Day-1 payment. Nothing else ships until these are resolved.

**LB-1: Payment Buttons Non-Functional (REVENUE-BLOCKING)**
- **File:** `/dashboard/upgrade` page
- **Problem:** GCash and Card payment buttons have no `onClick` handlers. The entire LemonSqueezy + PayRex infrastructure is built (webhook handlers working, checkout route exists at `src/app/api/payments/checkout/route.ts`, `user_subscriptions` table with RLS, tier derived from webhook metadata). The last-mile UI connection is missing.
- **Fix:** Add onClick handlers that call the existing checkout route.
- **Effort:** 2 hours
- **Business impact:** This is the only item preventing SlateCamp from generating any revenue whatsoever.

**LB-2: SRS Disconnected from Primary Testing Flow (LEARNING LOOP BROKEN)**
- **File:** `src/lib/actions/testing.ts:492-544`
- **Problem:** `saveTestingInteraction()` records quiz answers but never calls `updateSrsSchedule()` or `deriveQualityRating()`. Every session created through the Testing Hub (Camp Mode, Storm Mode, Chill Mode, Focus Review, Custom, Simulation, Endurance — all 7 modes) will never update spaced repetition scheduling. The correct pattern exists in `src/lib/actions/quiz.ts:388-395` but was not ported when the new testing flow was built.
- **Fix:** Add `deriveQualityRating()` + `updateSrsSchedule()` after the upsert in `saveTestingInteraction()`, matching the quiz.ts pattern.
- **Effort:** 1 hour
- **Business impact:** Without SRS, students practice but their review schedules never adapt. Learning outcomes silently degrade, which destroys the core value proposition ("Know you'll win") and poisons every testimonial and Readiness Score trajectory.

**LB-3: Security Headers Absent (VULNERABILITY)**
- **File:** `next.config.ts`
- **Problem:** No `X-Frame-Options`, `Content-Security-Policy`, `Strict-Transport-Security`, `X-Content-Type-Options`, `Referrer-Policy`, or `Permissions-Policy`. App is vulnerable to clickjacking and MIME sniffing.
- **Fix:** Add headers via the `headers()` function in `next.config.ts`.
- **Effort:** 15 minutes

**LB-4: Stored XSS in Question Card (SECURITY)**
- **File:** `src/components/shared/question-card.tsx` (lines 233, 243, 409)
- **Problem:** Three instances of `dangerouslySetInnerHTML` render database content without DOMPurify sanitization. Malicious question content could execute in every student's browser.
- **Fix:** Add `DOMPurify.sanitize()` around all 3 instances. Reference implementation exists in `src/components/wiki/ElaborativeInterrogation.tsx`.
- **Effort:** 15 minutes

**LB-5: Unauthenticated Debug Route (SECURITY)**
- **File:** `src/app/api/debug-taxonomy/route.ts`
- **Problem:** GET endpoint exposes taxonomy structure with zero auth. Any anonymous user can enumerate internal data.
- **Fix:** Delete the file or add `getUser()` + admin role check.
- **Effort:** 5 minutes

**LB-6: Cross-User Data Leak in Social Proof (SECURITY)**
- **File:** `src/lib/actions/social-proof.ts`
- **Problem:** Three server actions query `user_interactions` across all users without auth check. RLS mitigates but design is insecure-by-default.
- **Fix:** Add `getUser()` at the top of `getQuestionSocialProof()`, `getTopicDailyStudiers()`, `getTopicDailyStudiersBatch()`.
- **Effort:** 15 minutes

**LB-7: Admin Read Functions Missing Auth (SECURITY)**
- **Files:** `src/lib/actions/admin/dashboard.ts`, `coverage.ts`, `wiki-queries.ts`
- **Problem:** 5 admin query functions lack server-side auth checks.
- **Fix:** Add `canReviewContent()` check to each.
- **Effort:** 30 minutes

**LB-8: WCAG Zoom Blocking (ACCESSIBILITY)**
- **File:** `src/app/layout.tsx:51`
- **Problem:** `maximumScale: 1` blocks pinch-to-zoom. WCAG 2.1 AA failure.
- **Fix:** Remove `maximumScale: 1` from viewport metadata.
- **Effort:** 1 minute

### 2.2 Revenue Blockers — MUST FIX (Day-1 Monetization at Risk)

**RB-1: No Billing Settings Page**
- **Route:** `/dashboard/settings/billing` is defined but no page exists.
- **Problem:** Users who pay cannot manage their subscription, view invoices, or cancel. This will generate support tickets and chargebacks.
- **Fix:** Build billing management page using LemonSqueezy Customer Portal or custom UI.
- **Effort:** 4 hours

**RB-2: Upgrade Page at 60% Completeness**
- **Problem:** The upgrade page has feature comparison and pricing but the payment buttons are dead (see LB-1). Additionally, there is no ₱99 trial option, no installment framing (₱499 × 5 for Exam Pass), no exam-season urgency messaging, and no social proof counter ("X students enrolled for [exam month]").
- **Fix:** Wire buttons (LB-1) + add trial option + social proof counter.
- **Effort:** 4–6 hours total (including LB-1)

**RB-3: Settings Page at 50% Completeness**
- **Problem:** Profile editing (name, avatar) and notification preferences are missing. Billing settings page doesn't exist. A paying customer who can't manage their account loses trust.
- **Fix:** Build profile editing + notification preferences UI (backend exists at `email-preferences.ts`).
- **Effort:** 8 hours

### 2.3 Data Integrity Blockers — MUST FIX (Analytics Engine at Risk)

**DI-1: IRT Engine Completely Orphaned**
- **Files:** `src/lib/srs/irt.ts`
- **Problem:** All three IRT functions (`probabilityCorrect`, `selectNextQuestion`, `updateTheta`) exist with passing tests but are never called in any production code path. Session creation uses simple `current_mastery_weight ASC` ordering instead of IRT adaptive P(correct)=0.75 targeting. User theta is never updated. The PRD mandates IRT usage — this mandate is unmet.
- **Fix:** Wire `selectNextQuestion()` into session creation in `src/lib/actions/testing.ts`.
- **Effort:** 2 hours
- **Launch priority:** Tier 2 (fix this month). The simple mastery ordering works adequately for launch. IRT integration improves learning quality but is not a blocker.

**DI-2: Legacy Readiness Score Still Active**
- **File:** `src/lib/actions/readiness.ts`
- **Problem:** A simpler readiness formula with hardcoded `srsHealth: 50` coexists with the production anti-inflation 6-vector system in `user_global_stats.global_readiness_score`. If any consumer reads from the legacy function, scores will be inconsistent.
- **Fix:** Deprecate or gate the legacy function. Route all consumers to `user_global_stats.global_readiness_score`.
- **Effort:** 1 hour

**DI-3: Readiness Score Has Zero Tests**
- **File:** `src/lib/readiness-score.ts`
- **Problem:** 330-line pure function marked "DO NOT MODIFY WITHOUT TESTING" has zero tests. This is the single most important computation in the product. A regression here destroys every user's trust.
- **Fix:** Write comprehensive unit tests covering edge cases.
- **Effort:** 4 hours
- **Launch priority:** Tier 1 (fix this week). A broken Readiness Score is worse than no product.

### 2.4 Activation Friction — High Priority (Time-to-Value at Risk)

**AF-1: Onboarding Page Has 10 Sequential Awaits**
- **File:** `src/app/(auth)/onboarding/page.tsx`
- **Problem:** 10 sequential `await` calls create ~500ms of unnecessary latency on the onboarding page. This is the first page a new user sees after signing up. Every 100ms of delay increases drop-off.
- **Fix:** Wrap independent queries in `Promise.all()`.
- **Effort:** 30 minutes

**AF-2: Score Reveal Page Has 6 Sequential Awaits**
- **File:** `src/app/dashboard/score-reveal/page.tsx`
- **Problem:** 6 sequential awaits on the highest-stakes UX moment in the product. The score reveal is where anxiety converts to activation — or where the student bounces forever.
- **Fix:** Parallelize independent queries.
- **Effort:** 15 minutes

**AF-3: Testing Hub Has 8 Sequential Awaits**
- **File:** `src/app/dashboard/testing/page.tsx`
- **Problem:** The testing hub is the daily workhorse page. 8 sequential awaits add ~400ms latency every time a student starts a session.
- **Fix:** Parallelize independent queries.
- **Effort:** 15 minutes

**AF-4: About and Contact Pages Are "Coming Soon" Stubs**
- **Problem:** A student considering paying ₱399/month who clicks "About" and sees "Coming Soon" loses trust. These pages are credibility infrastructure.
- **Fix:** Write real About page (Philip's story, architect credibility) and Contact page (support email, response time commitment).
- **Effort:** 2–4 hours

### 2.5 Polish Before Launch (Ship-Quality Bar)

| Item | File(s) | Effort | Priority |
|------|---------|--------|----------|
| AI Tutor citations not clickable | `src/components/quiz/AITutorDrawer.tsx:169-171` | 30 min | P1 |
| Rename "drill" to "practice/review" (28+ instances) | Component names, labels, IDs | 2 hours | P1 |
| Remove GeistSans font (loaded globally for 1 component) | `src/app/layout.tsx`, `HeroHeadline.tsx` | 15 min | P2 |
| Replace ~200KB `@shadergradient/react` with CSS gradient | `src/components/dashboard/GradientImage.tsx` | 30 min | P2 |
| Color contrast failures (5 colors fail WCAG AA) | `globals.css` | 2 hours | P1 |
| Mobile touch targets below 44px | `src/components/ui/button.tsx` | 1 hour | P1 |

### 2.6 Hide/Delay Features (Cut from Launch Scope)

| Feature | Current State | Action | Rationale |
|---------|--------------|--------|-----------|
| Developer Portal (21 pages) | 70–90% complete | HIDE behind feature flag | Zero student-facing value. Internal tooling, not launch-critical. |
| Content Marketplace | Routes defined, no implementation | HIDE routes | P4 feature. Building this before 500 paying users is misallocation. |
| Collaborative Study Groups | 0% implemented | DO NOT BUILD yet | P3 feature. Design the Study Pod mechanic post-launch based on real user behavior data. |
| PWA / Offline Mode | 0% implemented | DEFER | Important for mobile market but not a launch blocker. Revisit at Gate 2 (200 subscribers). |
| Study Scheduling / Calendar | Not built | DEFER | Camp Trails daily prescriptions serve this need for launch. |
| Orphan components (9 files, 1,292 lines) | Dead code | DELETE | `TestingHub.tsx`, `FloatingTestimonialMarquee.tsx`, `ModeIntroScreen.tsx`, `TransitionLink.tsx`, `TierBadge.tsx`, `GradientImage.tsx`, `SignOutButton.tsx`, `TableSkeleton.tsx`, `QuizRenderer.test.tsx` |
| Unused dependencies (8 packages) | Never imported | REMOVE | `camera-controls`, `katex`, `next-devtools-mcp`, `pdf-parse`, `react-markdown`, `rehype-katex`, `remark-math`, `three-stdlib` |
| Duplicate route trees (3 pairs) | Redirect shims | DELETE old trees | `/dashboard/developer/*`, `/dashboard/trails/*`, `/admin/wiki/*` are redundant |

### 2.7 Estimated Total Engineering Effort

| Tier | Category | Hours | Timeline |
|------|----------|-------|----------|
| **Tier 1** | Launch Blockers (LB-1 through LB-8) | **~4.5 hours** | Day 1–2 |
| **Tier 1** | Revenue Blockers (RB-1 through RB-3) | **~16 hours** | Day 2–5 |
| **Tier 1** | Data Integrity (DI-3: readiness score tests) | **~4 hours** | Day 3–4 |
| **Tier 1** | Activation Friction (AF-1 through AF-4) | **~4 hours** | Day 4–5 |
| **Tier 1** | Polish (P1 items) | **~5.5 hours** | Day 5–7 |
| **Subtotal: Launch-ready** | | **~34 hours** | **~7 working days** |
| Tier 2 | IRT wiring, query layer, waterfall fixes, `strictNullChecks` | ~30–40 hours | Weeks 2–4 |
| Tier 3 | Dead code, hex migration, icon consolidation, Vitest setup | ~30–40 hours | Month 2 |

**Bottom line: SlateCamp can be revenue-capable in 7 working days of focused engineering.** The infrastructure is 90% there. The last 10% is wiring.

---

## 3. MONETIZATION PLAYBOOK

### 3.1 Freemium Gate Architecture

**Current state (from audit):** Paywall enforcement exists — 3D Lab has tier gating, the Readiness Score widget has a locked state, and the checkout flow requires auth and blocks free tier. The freemium gate logic is partially implemented but the payment buttons are dead.

**Required free vs. paid split for launch:**

| Feature | Free Tier | Pro Tier | Gate Mechanic |
|---------|-----------|----------|---------------|
| Orientation Diagnostic (20 questions) | Full access, one-time | Full access | No gate — this is the acquisition hook |
| Readiness Score | Revealed once after diagnostic, then blurred | Live, updated after every session, with trajectory chart | Blur + "Track your progress. Go Pro." CTA |
| Taxonomy Heatmap | Shown briefly after diagnostic, then blurred | Full access with node-level drill-down | Blur + "See your full map. Go Pro." CTA |
| Camp Trail | Days 1–3 only | Full 90-day trail | Hard gate at Day 4: "Your trail continues. Unlock Day 4." |
| Camp Mode | 3 sessions | Unlimited | Soft gate: "You've used your free sessions. Go Pro for unlimited." |
| Storm Mode (timed simulation) | Not available | Full access | Hard gate: "Prove you're ready. Go Pro." |
| Focus Review / Blindspot | Not available | Full access | Hard gate |
| 3D Lab | Not available (tier gating exists) | Full access | Existing gate works |
| Wiki | Limited (10 articles/day) | Unlimited | Soft gate with counter |
| Campfire (community) | View only | Full participation | FOMO gate: "See what passers are discussing. Join Pro." |
| Analytics Dashboard | Basic (last 7 days) | Full (all-time, 8 visualizations, trajectory) | Feature gate |

**Gate assessment:** The current implementation is approximately correct but needs two fixes: (1) ensure the Readiness Score blurs after the initial reveal (audit confirms locked score widget exists), and (2) ensure Camp Trail hard-gates at Day 4 (audit shows Camp Trails at 85% completeness — verify the gate).

### 3.2 Conversion Trigger Map

The paywall must appear at psychologically optimal moments — when anxiety is highest and the product has already demonstrated value.

| # | Trigger Moment | User's Emotional State | CTA Message | Implementation Status |
|---|----------------|----------------------|-------------|----------------------|
| 1 | **Post-diagnostic score reveal** | Anxiety + curiosity ("I'm only at 34?") | "Your journey starts here. Track every point of progress with Pro." | Score reveal page exists (90%). Add Pro CTA if missing. |
| 2 | **Heatmap shown then blurred** | Frustration + FOMO ("I could see my weak spots for a second") | "Your map is waiting. Unlock it." | Locked widget exists. Verify blur animation. |
| 3 | **Camp Trail Day 4 gate** | Invested, momentum built ("I've done 3 days, I can't stop now") | "Day 4 is ready. Continue your Trail." | Camp Trail at 85%. Verify gate triggers at Day 4. |
| 4 | **After failing a Storm Mode session** (Pro users only — upsell to Exam Pass) | Urgency + self-doubt | "Your Storm Mode score was 42. The Exam Pass gives you Blindspot Protocol to target exactly where you're weak." | Storm Mode exists. Add post-session upsell screen. |
| 5 | **After Blindspot Protocol reveals gaps** | Targeted anxiety ("I didn't know I was weak in Building Laws") | "Fix your blind spots. The exam won't wait." | Blindspot Protocol exists. Add CTA on results screen. |
| 6 | **Exam countdown T-14 days** | Peak urgency | "14 days left. X nodes are still red. Go Pro to fix them in time." | Requires exam date awareness (collected in onboarding). Build countdown CTA component. |
| 7 | **Free session limit reached** | Frustration + demonstrated value | "You've completed 3 free sessions. You're clearly serious about this. Continue with Pro." | Needs session counter + gate logic. |

**Priority:** Triggers 1, 2, 3, and 7 are P0 (must exist at launch). Triggers 4, 5, 6 are P1 (add in first 2 weeks).

### 3.3 Payment Flow Architecture

**Current state from audit:**

| Component | Status | Notes |
|-----------|--------|-------|
| LemonSqueezy integration | Configured, webhook handler working | Signature verified, tier from metadata |
| PayRex integration | Configured, webhook handler working | Signature verified |
| Checkout route | `src/app/api/payments/checkout/route.ts` exists | Requires auth, blocks free tier |
| Payment buttons | **NON-FUNCTIONAL** — no `onClick` handlers | The critical 2-hour fix |
| Billing management page | Route defined, no page | Must build (4 hours) |
| `user_subscriptions` table | Exists with RLS | Tier derived from webhook, not client |
| Free trial (₱99 for 7 days) | Not implemented | High-value conversion optimization |
| Installment framing | Not implemented | ₱499 × 5 for Exam Pass via BillEase/Tendopay |
| GCash direct | Via PayRex integration | Verify GCash flow end-to-end |
| Exam season surge pricing | Not implemented | Mechanism to raise prices 15–25% in final 8 weeks before ALE |

**Immediate action plan:**
1. Wire payment button `onClick` → checkout route (2 hours)
2. Build billing settings page with LemonSqueezy Customer Portal embed (4 hours)
3. Test end-to-end: signup → diagnostic → score reveal → upgrade → payment → Pro features unlock (2 hours)
4. Total: 8 hours to revenue-capable

**Post-launch payment optimizations (Week 2–4):**
- Add ₱99 trial option (dramatically lowers friction — converts at higher rate than free trial because ₱99 signals commitment)
- Add social proof counter near pricing: "X students enrolled for the [Month] ALE"
- Add exam date countdown near pricing: "Y days until the exam. Start now."
- Implement installment framing for Exam Pass tier

### 3.4 Pricing Strategy

**Launch pricing (validated against Philippine EdTech benchmarks):**

| Tier | Price | Positioning | Target Persona |
|------|-------|-------------|----------------|
| Free | ₱0 | "See where you stand" | All — acquisition hook |
| ₱99 Trial | ₱99 for 7 days Pro | "Try everything for less than a meal" | Cautious first-takers, price-sensitive |
| Pro Monthly | ₱399/month | "Your daily study engine" | Casual starters, 4–6 months before exam |
| Pro Exam Pass | ₱1,999 one-time (90 days) | "One payment. Full focus. No distractions." | Committed candidates, 1–3 months before exam |

**Anchoring strategy:** Always position Pro Exam Pass relative to review center pricing. "₱1,999 — the cost of one week at a review center. SlateCamp gives you 90 days of data-driven preparation." Review centers charge ₱8,000–₱25,000.

**Exam season surge pricing (implement by Month 2):** Raise prices 15–25% in the final 8 weeks before the ALE. Announce in advance: "Prices increase on [date]. Lock in current rates now." This creates urgency AND rewards early commitment.

### 3.5 Revenue Leak Fixes

| Leak | Risk | Fix |
|------|------|-----|
| Pro features accessible via direct URL navigation | MEDIUM — audit shows paywall enforcement exists for 3D Lab and score widget, but verify all gated features | Comprehensive audit: test every Pro feature URL while logged in as free user |
| Subscription expiry doesn't revoke access | MEDIUM — verify webhook handles `customer.subscription.deleted` | Test cancellation flow end-to-end |
| No attribution tracking on paywall conversions | HIGH for optimization — can't know which trigger converted | Add `conversion_source` field to checkout: "score_reveal", "trail_day4", "heatmap_blur", etc. |
| Missing `"use server"` on 52 action files | LOW for revenue but HIGH for security — actions could be called from client | Add directive to all 52 files (15 minutes, scriptable) |

---

## 4. THE VIRALITY BLUEPRINT

### 4.1 Readiness Score Sharing Loop

**The mechanic:** The Readiness Score is inherently shareable social content. "I went from 34 to 71 in 6 weeks!" is the kind of post Filipino architecture students will organically share on Facebook and Instagram.

**The shareable asset (BUILD THIS):**
- A branded image card: SlateCamp logo + student's Readiness Score + score delta ("↑37 points") + miniature heatmap thumbnail (blurred for non-users) + exam countdown + "See where you stand → slatecamp.com"
- Generated server-side via an OG image API route (Next.js `ImageResponse` from `next/og`)
- Unique share URL: `slatecamp.com/score/[encrypted-user-id]` that resolves to a landing page with "See how you compare" CTA → diagnostic signup

**Share triggers:**
- After score improves by +5 points: "You gained 5 points this week. Share your progress?"
- After completing Camp Trail milestone (Day 30, Day 60, Day 90): "You've completed 30 days. That's real commitment."
- After first Storm Mode completion: "You just survived your first simulation."

**Current state from audit:** Export analytics data is listed as P3 in the feature backlog. No sharing infrastructure exists. OG meta tags are not mentioned. This is a net-new build.

**Build estimate:** 8–12 hours (OG image generation + share URL route + share prompt UI + landing page for recipients)

**Viral coefficient math:** If 20% of users share → 15% of their architecture school batchmates see it → 10% of those click through → 30% of click-throughs sign up → K = 0.20 × 0.15 × 0.10 × 0.30 = 0.0009 per individual interaction. But architecture school cohorts are dense — average batchmate network of 50–100. So effective reach per share = 50 × 0.15 × 0.10 × 0.30 = 0.225 new signups per share. At 20% share rate across 1,000 users → 200 shares → 45 new signups. Modest but free.

### 4.2 Study Pod Mechanic

**The mechanic:** 4–6 students link accounts as a Study Pod. Social accountability reduces churn by an estimated 2–3x.

**Pod features:**
- Shared view of each member's Readiness Score range (blurred to range — "in the 60s", not exact)
- Weekly activity indicator: "3 of 5 pod members completed a session this week"
- Pod score delta: "Your pod's average moved +3 points this week"
- Pod milestone: When all members clear 70% Readiness Score → unlock Proof Simulation one week early
- Pod formation CTA: "Bring 5 batchmates. Everyone gets 1 month Pro free."

**Current state from audit:** Collaborative Features score = 0%. Study groups listed as P3 (3–4 weeks effort). No database schema for groups exists.

**Build estimate:** 3–4 weeks. Not a launch feature. Design and build after collecting real user behavior data from the first 100 users (beta phase). The Study Pod should be the first major post-launch feature (Month 2–3).

**Required schema (design now, build later):**
```sql
study_pods (id, name, invite_code, created_by, created_at, exam_date)
study_pod_members (id, pod_id FK, user_id FK, joined_at, role ENUM('leader','member'))
```

### 4.3 Passer Referral Engine

**The mechanic:** Every ALE passer is SlateCamp's most valuable marketing asset. One passer story properly told is worth ₱50,000 in acquisition spend.

**The Passer Sequence (BUILD THIS — Month 2):**
1. Post-exam: prompt user to self-report result (pass/fail) via in-app survey
2. If passed → create Passer Profile: name, exam date, final Readiness Score, score trajectory chart
3. Display in Hall of Passers (public page, SEO-indexed)
4. Generate shareable "SlateCamp Certified ALE Passer" image for LinkedIn/Facebook
5. Invite to Campfire with "Class of [Exam Date]" identity badge
6. Activate Ambassador program: free Pro for life + ₱200 GCash per referral conversion

**Current state from audit:** No exam outcome tracking exists. The `exam_outcomes` table is referenced in the DB architect skill but not confirmed in the audit's 51-table schema. The Campfire community is referenced in the product vision but its implementation status is not detailed in the audit.

**Priority:** Design the `exam_outcomes` table now (pre-launch). Build the Passer flow before the first ALE cycle completes.

### 4.4 Peer Referral Program

**The mechanic:** Every user gets a unique referral code.
- Referred friend: ₱100 off first Pro month
- Referrer: 14 days Pro extension per conversion
- No cap: more referrals = more free Pro time
- Message framing: "Share this with your batchmates before it's too late." Not "earn cash" — "protect your friend."

**Current state:** Not implemented. Requires: referral code generation, tracking table, discount application in checkout flow, referrer credit logic.

**Build estimate:** 12–16 hours. Target: launch alongside community-led growth phase (Week 4–8).

### 4.5 School Ambassador Program

**The mechanic:** 1 ambassador per target school. Free Pro for life + referral code + ₱500 per 5 paying conversions. 10 ambassadors × 10 conversions each = 100 paying users, zero ad spend.

**Target schools (priority order):** UST, PLM, Mapua, PUP, FEU, UE, NU, UP (Diliman & Manila)

**Current state:** No admin dashboard for tracking ambassador performance. Requires: ambassador registration, referral code assignment, conversion tracking dashboard, payout tracking.

**Build estimate:** Admin features (8–12 hours). But the ambassador program can run manually (spreadsheet + GCash payouts) for the first 6 months. Do not build the tooling before validating the program works.

### 4.6 Social Proof Infrastructure Audit

| Element | Current State | Action |
|---------|--------------|--------|
| "X students enrolled for [exam month]" counter | Not implemented | BUILD — add near upgrade CTA and pricing page. Query from `profiles` table with exam date filter. 2 hours. |
| Testimonial components | `FloatingTestimonialMarquee.tsx` exists but is ORPHANED (zero imports) | EVALUATE — decide if the component is usable or rewrite. Need real testimonials first (beta phase). |
| NPS survey | Not implemented | BUILD — in-app survey at Week 2 and Week 4 of usage. Use simple modal + Supabase insert. 4 hours. |
| OG meta tags for social sharing | Not confirmed in audit | VERIFY — check `layout.tsx` for proper OpenGraph metadata. Fix if missing. 1 hour. |
| Share image generation | Not implemented | BUILD — OG image API route for Readiness Score cards. 4 hours. |
| Deep links | Not confirmed | VERIFY — ensure shared URLs resolve correctly for non-logged-in users. |

---

## 5. ACTIVATION & ONBOARDING REDESIGN

### 5.1 The 10-Minute Activation Path

**Current onboarding flow (from audit):**
```
/try (5 free questions, try-before-signup)
  → /register (email/Google signup)
  → /onboarding (4 fields: name, exam date, first-taker/retaker, school)
  → /assessment (20-question diagnostic)
  → /score-reveal (Readiness Score + Heatmap)
  → [Camp Trail Day 1 prompt — VERIFY THIS EXISTS]
```

**Audit assessment:** "Complete and well-designed. Try-before-signup pattern is strong. Time to 'aha moment' (seeing your Readiness Score) is ~20–30 minutes."

**Critical issues identified:**

1. **Onboarding page has 10 sequential awaits** — ~500ms wasted latency on the first page after signup. Fix: `Promise.all()`. (30 min)

2. **Score reveal page has 6 sequential awaits** — ~300ms wasted on the highest-stakes moment. Fix: parallelize. (15 min)

3. **20-question diagnostic may cause drop-off** — The audit notes: "consider allowing skip with default score." Recommendation: keep the 20-question diagnostic (it's the activation hook that produces the anxiety → conversion trigger) but add a progress bar and estimated time remaining ("12 minutes left").

4. **Score reveal → Camp Trail Day 1 transition** — VERIFY that the score reveal page has a clear, prominent CTA that leads directly to Camp Trail Day 1. If the student sees their score (34/100) and has no immediate next action, they bounce. The CTA must be: "Start Day 1 of your Camp Trail now — we'll target your weakest area first."

### 5.2 Score Reveal UX Specification

The score reveal is the single highest-stakes UX moment in SlateCamp. It must accomplish five things in 30 seconds:

| Requirement | Implementation |
|-------------|---------------|
| 1. Feel honest | Show the number without softening. "Your Readiness Score is 34 out of 100." No "Great start!" if 34 is not great. |
| 2. Contextualize | "34 means you have significant gaps in 4 of 9 ALE areas. Here's where." Show mini-heatmap with red nodes highlighted. |
| 3. Create a gap | "Students who pass typically reach 75+. You have work to do — and a clear path to do it." |
| 4. Offer immediate next action | Giant CTA button: "Start Day 1 — we'll target [weakest area name] first." This must be the dominant visual element. |
| 5. Frame as starting point | "This is where you begin, not where you end. Every point of progress is tracked." |

**Current state:** Score reveal page exists at 90% completeness. VERIFY all 5 requirements are met. The mini-heatmap and Camp Trail CTA are the most likely missing elements.

**Persona-specific variants:**
- **Retaker:** Add empathy framing: "This time is different. SlateCamp shows you exactly where to focus." Remove any shame-triggering language. Do NOT show comparison to first-takers.
- **Working Professional:** Add time framing: "30-minute daily sessions. Built for your schedule."
- **Undergrad Prepper:** Add curiosity framing: "See how you compare to recent ALE passers."

### 5.3 First-Session Design (Camp Trail Day 1)

After score reveal, the student must start Camp Trail Day 1 within 60 seconds.

**Requirements:**
- Camp Trail auto-populated based on diagnostic results (weakest nodes first)
- Day 1 targets their weakest area (most motivating — immediate personal relevance)
- Session length: 15–20 minutes for Day 1 (not 30 — lower the barrier on first session)
- Post-session screen shows Heatmap delta: "You just answered 15 questions in Building Laws. 1 node moved from Grey to Red — your map is changing."
- Clear "Come back tomorrow for Day 2" prompt with exam countdown: "89 days to go. Day 2 is ready tomorrow."

**Current state:** Camp Trails at 85% completeness. Testing hub at 85–95%. VERIFY the trail auto-generation from diagnostic data and the post-session heatmap delta display.

### 5.4 The 72-Hour Retention Bridge

**Day 1 complete:**
- In-app: "Day 2 unlocks tomorrow at 8AM. Your Readiness Score is [X]."
- Push/email (8PM): "Day 2 of your Camp Trail is ready. Your score was 34 — let's move it."

**Day 2 complete:**
- In-app: "Day 3 unlocked. 2 nodes are now Red instead of Grey. The map is changing."
- Push/email (8PM): "Day 3 is ready. You've been consistent for 2 days — that matters more than you think."

**Day 3 complete (free tier limit):**
- Paywall: "Day 4 is ready. Go Pro to continue your Trail."
- Frame: "You've invested 3 days. Your score moved [X] points. Don't lose this momentum."

**Current state from audit:** Notification preferences backend exists (`email-preferences.ts`). Email automation infrastructure status is unclear. Push notification system is not mentioned in the audit.

**Build priority:** Email notifications for the 72-hour bridge are P0 for launch. Push notifications are P1 (add within first month). The bridge can initially be email-only.

### 5.5 Notification Infrastructure Requirements

| Channel | Status | Build Estimate |
|---------|--------|----------------|
| Email (transactional) | Backend exists at `email-preferences.ts` | Verify Resend/SendGrid integration. Wire 3 bridge emails. 4 hours. |
| Push notifications (web) | Not implemented (no PWA, no service worker) | P2 — defer until PWA work (Month 2–3) |
| In-app notifications | Not confirmed | Build notification bell + dropdown. 8 hours. P1. |
| SMS | Not implemented | Not needed for launch. Filipino students check Messenger/Viber/email. |

---

## 6. RETENTION & GAMIFICATION

### 6.1 Permitted Mechanics (Implementation Status)

| Mechanic | Description | Codebase Status | Launch Priority |
|----------|-------------|-----------------|-----------------|
| **Mastery Tier Progression** | Heatmap nodes: Grey → Red → Amber → Green based on real mastery weight | IMPLEMENTED — Taxonomy Heatmap at 95% (Analytics). Mastery calculation exists in `user_node_mastery`. | P0 (already built) |
| **Readiness Score as Game Score** | Score trajectory line chart over time | IMPLEMENTED — "readiness trajectory" in analytics visualizations (95%). Append-only `readiness_score_snapshots` table exists. | P0 (already built) |
| **Exam Countdown Dramatization** | Progressive UI shift as ALE approaches | PARTIALLY — exam date collected in onboarding. Countdown display not confirmed in core dashboard. | P1 (build countdown component, 2 hours) |
| **Cohort Competition (Tier-Matched)** | Compete against peers at same Readiness Score range | NOT BUILT | P2 (post-launch, requires 200+ users for meaningful cohorts) |
| **Study Pod Accountability** | Groups of 4–6, shared activity | NOT BUILT (0% collaborative features) | P2 (3–4 weeks, Month 2–3) |
| **Passer Effect (Social Proof)** | Post-exam celebration cascade, Passer Profile, Hall of Passers | NOT BUILT | P1 (build before first ALE cycle completes) |
| **Storm Mode Score Delta Sharing** | Share "+6 points from last week" to pod/cohort | NOT BUILT | P3 (requires Study Pods first) |

### 6.2 Forbidden Mechanics Check

**Scanned the audit for forbidden patterns:**

| Forbidden Mechanic | Found in Codebase? | Action |
|---|---|---|
| Badges for sessions completed | NOT FOUND | Clean |
| Virtual currency / coins | NOT FOUND | Clean |
| Global leaderboard (untiered) | NOT FOUND | Clean |
| Confetti / celebration animations | NOT CONFIRMED — Framer Motion is present (12 extensions) but audit doesn't flag celebration animations | VERIFY — check for confetti/fireworks on score reveal or session complete |
| Streaks as primary goal | NOT FOUND as primary mechanic | Clean — but if added later, must be secondary to mastery |
| XP points system | NOT FOUND | Clean |
| "You're on a roll!" notifications | NOT FOUND | Clean |

**Assessment:** The codebase is clean of dopamine gamification. The audit explicitly notes a "Gamification-free achievement system" in the P4 feature backlog with the requirement "Must pass 3-part engagement test." This aligns perfectly with SlateCamp's mastery gamification philosophy.

### 6.3 Retention Infrastructure Audit

| Mechanic | Status | Action |
|----------|--------|--------|
| Daily streak counter | NOT CONFIRMED in audit | BUILD — simple counter in dashboard header. Query `trail_day_completions` for consecutive days. 2 hours. |
| Camp Trail progress ("Day 23 of 90") | Camp Trails at 85%. LIKELY EXISTS but VERIFY. | VERIFY — ensure progress bar is visible on every session entry screen. |
| Heatmap delta notifications ("3 nodes moved from red to amber this week") | NOT BUILT | BUILD — weekly email digest summarizing mastery progress. 4 hours. |
| Push notification system | NOT BUILT (no PWA) | DEFER to Month 2–3 |
| Re-engagement sequences (6, 10, 15, 21 day silence) | NOT BUILT | BUILD — 4 email templates triggered by inactivity. 4 hours. |
| Campfire community | Referenced in product vision. Implementation status unclear from audit. | VERIFY — if built, ensure it's accessible from main dashboard. If not built, defer to post-launch. |

---

## 7. DATA & ANALYTICS READINESS

### 7.1 Event Tracking Completeness

| Event | Expected Table | Status (from Audit) | Gap |
|-------|---------------|---------------------|-----|
| Quiz answer submitted | `user_interactions` | EXISTS — immutable event log, auto-save every 10s | None |
| Diagnostic completed | `quiz_sessions` (status='completed', mode='assessment') | EXISTS | None |
| Readiness Score computed | `readiness_score_snapshots` | EXISTS — append-only | None |
| Camp Trail day started | `user_trail_progress` / `analytics_events` | LIKELY EXISTS (85% trail completeness) | VERIFY |
| Camp Trail day completed | `trail_day_completions` | EXISTS | None |
| Paywall viewed | `analytics_events` | UNCLEAR — `analytics_events` has RLS bug blocking anonymous inserts | FIX RLS policy |
| Payment completed | Via LemonSqueezy/PayRex webhooks → `user_subscriptions` | EXISTS | None |
| Referral code used | NOT TRACKED | NOT BUILT | BUILD when referral system ships |
| Share action (score, heatmap) | NOT TRACKED | NOT BUILT | BUILD when sharing ships |
| Session abandoned | LIKELY TRACKED — quiz has auto-save + status field | VERIFY — check for 'abandoned' status tracking |

### 7.2 KPI Query Readiness

| KPI | Can Query Now? | Missing Infrastructure |
|-----|---------------|----------------------|
| Free→Paid conversion rate | PARTIAL — `user_subscriptions` exists but no `conversion_source` tracking | Add attribution field |
| Day-1 / Day-7 / Day-30 retention | YES — `quiz_sessions.started_at` + `user_interactions` timestamps | None |
| Diagnostic completion rate | YES — `quiz_sessions` with mode='assessment' | None |
| Time to first Readiness Score | YES — `profiles.created_at` → first `readiness_score_snapshots.created_at` | None |
| CAC by channel (UTM tracking) | NO — no UTM parameter capture | BUILD — capture UTM params at signup, store in `profiles` or `analytics_events` |
| NPS score | NO — no survey system | BUILD — in-app NPS survey |
| Churn rate (monthly) | PARTIAL — `user_subscriptions` has status but unclear if churn timestamp tracked | VERIFY LemonSqueezy webhook captures cancellation timestamp |
| DAU/MAU ratio | YES — `user_interactions` or `quiz_sessions` with date filters | None |
| MRR (current) | YES — CEO Command Center at 90%, MRR dashboard exists | None |
| Cohort retention table | PARTIAL — CEO Behavioral Insights at 90% with cohort analysis | VERIFY cohort query accuracy |
| Revenue per acquisition channel | NO — no UTM/source attribution | BUILD UTM tracking |
| Viral coefficient (K) | NO — no referral tracking | BUILD when referral system ships |

**Critical gap:** UTM parameter capture. Without it, Philip cannot know which channel is working. This is a 2-hour build (capture UTM params from URL on signup, store in `profiles` table or `analytics_events`). Must ship before any paid acquisition.

### 7.3 Outcome Tracking (The Data Moat Foundation)

**The most valuable data SlateCamp will ever collect:** Did the student pass the ALE?

**Required infrastructure:**
1. `exam_outcomes` table: `id`, `user_id`, `exam_date`, `result` (pass/fail/no_show), `reported_at`, `final_readiness_score` (snapshot at exam date), `verified` (boolean)
2. Post-exam survey flow: triggered 1–3 days after the ALE date for all users with that exam date in their profile
3. Readiness Score → Pass/Fail correlation model: built after the first exam cycle with 100+ data points
4. User consent: collected at signup for anonymized data use (standard EdTech practice)

**Current state:** The audit's 51-table schema does not explicitly mention `exam_outcomes`. The DB architect skill references it as a planned table. Must be designed and migrated before the first ALE cycle.

**Build estimate:** Schema + migration (1 hour), post-exam survey UI (4 hours), data analysis query (2 hours). Total: 7 hours. Target: complete before the first ALE exam date.

### 7.4 Technical Debt Priority (from DB Audit)

| Rank | Issue | Launch Impact | Effort |
|------|-------|--------------|--------|
| 1 | SRS disconnected from testing flow | CRITICAL — learning loop broken | 1 hour |
| 2 | Payment buttons non-functional | CRITICAL — revenue blocked | 2 hours |
| 3 | Security headers absent | CRITICAL — vulnerability | 15 min |
| 4 | XSS in question-card | CRITICAL — security | 15 min |
| 5 | `analytics_events` RLS blocks anonymous inserts | HIGH — pre-signup tracking broken | 30 min |
| 6 | 79% of server actions lack error handling | HIGH — raw Supabase errors leak to client | 4–6 hours |
| 7 | 22 waterfall pages | MEDIUM — latency on critical flows | 3 hours |
| 8 | 47 `select('*')` queries | MEDIUM — overfetching, scale risk | 4–6 hours |
| 9 | TypeScript `strict: false` | MEDIUM — runtime null crashes | 8–16 hours |
| 10 | Missing indexes on core tables | MEDIUM — performance under load | 1 hour |
| 11 | 2,576 hardcoded hex colors | LOW for launch — visual debt | 8–12 hours |
| 12 | Dual icon libraries | LOW for launch — bundle size | 4–6 hours |

---

## 8. GTM CALENDAR

### 8.1 Pre-Launch Phase (Now → Launch Day)

**Current date:** 2026-03-25. The next ALE date must be determined to align the GTM calendar. Assuming the next ALE is approximately 4–6 months away (Q3 2026), SlateCamp is at approximately T-5 to T-6 months — the ideal moment to begin pre-launch activities.

**Week 1–2: Engineering Sprint (Fix Launch Blockers)**
```
Day 1-2:  Wire payment buttons + security fixes (LB-1 through LB-8)    [4.5 hours]
Day 2-5:  Build billing page + upgrade page polish (RB-1, RB-2)        [8 hours]
Day 3-4:  Write readiness score tests (DI-3)                            [4 hours]
Day 4-5:  Fix activation waterfalls (AF-1 through AF-3)                 [1 hour]
Day 5-7:  Polish items (AI citations, drill→practice rename, About page) [5.5 hours]
Day 7:    END-TO-END TEST: Signup → Diagnostic → Score → Trail → Pay → Pro
```

**Week 3–4: Philip's Personal Network Activation**
```
- DM every batchmate, classmate, professional contact (not broadcast)
- Ask 10 people to be beta testers. Each refers 5 more. Target: 50 beta users.
- Join every "ALE Reviewees" Facebook group. Contribute. Do not sell.
- Create SlateCamp accounts for beta testers, collect exam dates.
```

**Week 5–8: Beta + Waitlist**
```
- Waitlist landing page live: "Know you'll pass the ALE. SlateCamp is coming."
  Email capture + early-bird offer (first 200 get 3 months Pro free)
- Beta management: weekly check-in per user via Messenger/WhatsApp
- NPS survey at Week 2 and Week 4 of beta
- Collection targets: 10+ testimonials (video preferred), 3 before/after Readiness Score case studies
- Success criteria: >40% of beta users complete at least 5 Camp Trail sessions
```

### 8.2 Closed Beta (Weeks 1–4 Post-Launch)

**Invite criteria:**
- ALE exam within next 4 months (high urgency = high engagement)
- Mix of first-takers and retakers
- At least 3 architecture schools represented
- Geographically diverse (Metro Manila + at least 1 Visayas/Mindanao)

**Beta management protocol:**
- 5-minute weekly check-in per user
- "What feature was most valuable this week?" and "What almost made you stop using it?"
- Track: average sessions/week, diagnostic completion rate, score trajectory, drop-off points
- Gate decision: proceed to community-led launch ONLY if free→paid conversion >3% AND NPS >40

**Admin dashboard requirements:** The CEO Portal (4 pages, 90% complete) with Command Center, Behavioral Insights, and cohort analysis should provide the monitoring needed. VERIFY that beta user activity can be filtered and tracked.

### 8.3 Community-Led Launch (Weeks 4–8)

**Channel 1: "Topnotcher Effect"**
- Announce that a beta user hit [X] Readiness Score or improved by [Y] points
- Post in every ALE Facebook group with a screenshot
- This is a proof event, not a testimonial

**Channel 2: Architecture School Ambassadors**
- Recruit 1 per target school (UST, FEU, PLM, PUP, Mapua, UP, NU, UE)
- Free Pro for life + referral code + ₱500 per 5 conversions
- Run manually via spreadsheet for first 6 months

**Channel 3: UAP Student Chapter Partnerships**
- Offer free "ALE Readiness Workshop" to any student chapter
- Philip speaks for 60 minutes. At the end: diagnostic link + special event code (₱100 off first month)
- Conversion expectation: 15–25% of attendees sign up within 48 hours

**Channel 4: Review Center Partnerships (B2B seed)**
- Pitch to top 10 ALE review centers in Metro Manila
- "₱500/student. We run the digital layer — branded as yours."
- Even 2 centers at 50 students each = 100 new paying users in a single deal

### 8.4 Paid Growth Activation (Month 3+ — ONLY After Gates Passed)

**Gate criteria — ALL must be true before spending on ads:**
- Free→Paid conversion >3%
- NPS >40
- 10+ social proof testimonials (video preferred)
- CAC payback modeled at <8 months in the target channel

**Channel priority (if gates passed):**

| Channel | Budget | Targeting | Creative |
|---------|--------|-----------|----------|
| Meta (FB/IG) | ₱500–₱1,000/day (70% FB, 30% IG) | Architecture students, 20–30, Filipino. Interest: "Architecture", "UAP", "PRC", "Licensure Exam" | Video preferred. Authentic student content > polished ads. "Still guessing if you're ready? Stop." |
| TikTok | Organic first, then Spark Ads | Architecture student creators | "My daily ALE study routine", "Watch my Readiness Score go from 34 to 78" |
| Google Search | ₱200–₱500/day | "ALE reviewer Philippines", "architecture Licensure Exam reviewer" | Highest intent. Landing page: "Prepare for the [Month] ALE" |

### 8.5 Exam Calendar Alignment

```
T-6 months before ALE:  Community seeding, beta launch, content publishing
T-4 months:             Full launch, open access, first paid campaigns
T-2 months:             Exam season surge pricing (+15-25%)
                        Urgency messaging dominates: "X days until the ALE"
                        Storm Mode and Proof Simulation front and center
T-1 month:              Heaviest paid spend of the cycle
                        Retargeting cold audiences
                        Cohort accountability push
                        Final conversion push: Exam Pass featured prominently
T-1 week:               "How many days until the exam? Your Readiness Score is [X]."
Exam week:              Go quiet on sales. Send encouragement only.
                        "We know you're ready. Trust the data."
Post-exam:              Celebrate passers (UGC goldmine)
                        Immediate outreach to retakers: "Let's figure out what went wrong."
                        Collect testimonials while emotion is fresh
                        Begin next cycle seeding immediately
```

---

## 9. MARKETING & POSITIONING

### 9.1 Core Messaging (for Architecture Students)

**Hero message:** *"Know you'll win."*

**Messaging angles (ranked by conversion power):**

| Angle | Message | Target Persona | Channel |
|-------|---------|----------------|---------|
| **Anxiety reduction** | "Still guessing if you're ready? Stop. SlateCamp shows you exactly where you stand — and exactly what to fix." | Anxious First-Taker | Facebook ads, landing page hero |
| **Authority** | "Built by an architect who passed the ALE. Every question calibrated to the PRC taxonomy." | All personas | About page, landing page, PR |
| **Data over hope** | "Your batchmates are studying with hope. You're studying with data." | First-Taker, Working Professional | TikTok, Instagram |
| **Time efficiency** | "30 minutes a day. 90 days of structured review. A map that shows you exactly what to study next." | Working Professional | Google Search ads |
| **Social proof** | "Join [X] architecture students already preparing for the [Month] ALE." | All personas | Pricing page, upgrade CTA |
| **Urgency** | "[X] days until the ALE. Your Readiness Score is waiting." | All personas (T-2 months) | Retargeting, email, push |
| **Retaker empathy** | "Last time, you studied hard. This time, you study smart. SlateCamp shows you what changed." | Retaker | Direct messaging, Campfire |
| **Cost anchoring** | "₱1,999 for 90 days. That's the cost of one week at a review center." | Price-sensitive | Pricing page, ads |

### 9.2 Channel-Specific Copy

**Facebook (primary — 70% of Meta budget):**
- Lead with anxiety. Architecture students scroll Facebook while procrastinating from studying.
- Hook: "Your batchmate scored 72 on SlateCamp. What's your score?"
- CTA: "Take the free diagnostic. Know where you stand."

**TikTok:**
- Lead with transformation. 15–30 second videos.
- "Watch my Readiness Score go from 34 to 71 in 6 weeks" (screen recording format)
- "My daily ALE study routine with SlateCamp" (day-in-the-life format)
- Must feel organic, not produced. Student-generated content performs 3–5x better than brand content.

**Google Search:**
- Lead with intent. These users are actively searching for a solution.
- Headline: "ALE Licensure Exam Reviewer | Data-Driven Prep by an Architect"
- Description: "Free diagnostic. See your Readiness Score in 20 minutes. 7 testing modes. Built by an architect who passed."
- Landing page URL: exam-specific, e.g. `/ale-review-[month]-2026`

### 9.3 School Outreach Pitch Template

**Subject:** Free SlateCamp Pro access for your 5th-year students

**Email body:**
> Hi [Dean/Chair name],
>
> I'm Philip, a licensed architect and the founder of SlateCamp — a digital ALE preparation platform built specifically for the Philippine architecture licensure exam.
>
> We're offering free Pro access to 5th-year students at [School Name] who are preparing for the upcoming ALE. No cost to the school or the students.
>
> What SlateCamp provides: a Readiness Score that tells each student exactly where they stand across the 9 ALE areas, a structured 90-day study trail, timed exam simulations, and interactive 3D building models.
>
> Would you be open to a 30-minute demo? I can also present directly to your 5th-year class — I've done this at [other school names if applicable].
>
> Best,
> Philip

### 9.4 Review Center Partnership Pitch Template

**Subject:** Add a digital layer to your ALE review program

**Email body:**
> Hi [Review Center name],
>
> I'm Philip, a licensed architect and founder of SlateCamp — a digital ALE mastery platform.
>
> You have the students, the brand, and the classroom. We have the adaptive testing engine, the Readiness Score algorithm, and the taxonomy mapping. Together, we can offer your students something no other review center has: data-driven exam readiness tracking.
>
> The proposal: ₱500 per student per exam cycle. We run the digital layer — your students access SlateCamp with your branding. You get a dashboard showing each student's readiness score and progress.
>
> Two review centers × 50 students each = 100 students with measurable progress data. That's a marketing asset for your next enrollment cycle.
>
> Can we talk for 20 minutes?

---

## 10. MOAT-BUILDING PRIORITIES

### 10.1 Domain Expertise Moat (Philip's Visibility Strategy)

**Why this matters:** Philip is a licensed architect. No generic EdTech founder can replicate this without years of investment. This is SlateCamp's most immediate competitive advantage.

**Actions for the next 90 days:**
- Publish 4 "ALE Insights" posts on LinkedIn/Facebook: analysis of which ALE areas have highest failure rates, study strategies, common mistakes. Position Philip as the expert.
- Speak at 2–3 UAP student chapter events. Every speaking engagement = 20–100 qualified prospects in a room for 60 minutes.
- Create a "Meet the Architect Behind SlateCamp" video for the About page.
- Build relationships with 3–5 licensed architects who can serve as content advisors/validators. Recruit before any competitor has reason to.

### 10.2 Data Moat (Performance Data Collection)

**Actions:**
- Ensure every quiz answer is logged in `user_interactions` (EXISTS — confirmed in audit)
- Tag every question with taxonomy node, difficulty level, and ALE exam area (EXISTS — taxonomy mapping at 90%)
- Design and migrate `exam_outcomes` table before first ALE cycle
- Build post-exam survey flow
- Begin Readiness Score → Pass/Fail correlation analysis after first exam cycle (this data is the moat)
- Add user consent for anonymized data use at signup

### 10.3 Content Moat (Wiki + Question Bank)

**Current state:** Wiki at 90–95% completeness, Question Bank CRUD at 95%, taxonomy coverage map at 90%. This is already strong.

**Actions:**
- Target: 1,000+ validated questions covering all 9 ALE areas before launch
- Every question authored or reviewed by a licensed architect
- SlateCamp Wiki should be the definitive, publicly accessible ALE reference (SEO asset)
- Wiki pages should have proper meta tags for Google indexing ("ALE building code requirements", "Philippine architecture licensure exam review")

### 10.4 Community Moat (Campfire Activation)

**Current state:** Campfire implementation status is unclear from the audit. Collaborative features scored 0%.

**Actions:**
- If Campfire is built: activate it during beta phase. Seed with Philip + early passers.
- If Campfire is not built: DEFER to post-launch. Use a private Facebook group or Telegram group for the beta cohort. The community mechanic matters more than the proprietary platform.
- Target: 50 passers active in Campfire before the end of the first exam cycle

### 10.5 Institutional Moat (First Partnerships)

**Actions:**
- Month 1–3: Philip personally approaches architecture department chairs at UST, PLM, Mapua (top 3 priorities)
- Offer: Free trial access to 5th-year students preparing for the ALE. No cost.
- Target: 1 signed institutional deal within 6 months of launch
- Build the institutional dashboard (educator view with student progress) as a P2 feature (Month 3–6)

---

## 11. RISK REGISTER

| # | Risk | Probability | Impact | Mitigation |
|---|------|-------------|--------|------------|
| 1 | Launch delayed by accumulated technical debt (1.2% test coverage, strict mode off) | MEDIUM | HIGH | Focus the 7-day sprint on launch blockers only. Defer all Tier 2/3 debt. Ship imperfect. |
| 2 | Low diagnostic completion rate (<50%) | MEDIUM | HIGH | Add progress bar + time estimate to diagnostic. Consider 15-question short form with option to extend. |
| 3 | Free→Paid conversion <2% | MEDIUM | CRITICAL | Run paywall A/B tests: timing (Day 3 vs Day 5), messaging (anxiety vs value), price point (₱299 vs ₱399). If <2% after 60 days, the freemium gate needs fundamental redesign. |
| 4 | Payment integration failure on launch day | LOW | CRITICAL | Test end-to-end checkout with real LemonSqueezy test cards + PayRex sandbox before opening doors. Have manual subscription activation as backup. |
| 5 | Competitor launches during beta | LOW | MEDIUM | Accelerate community moat (Campfire) and institutional partnerships. 100 testimonials beat a competitor with 0. First-mover in ALE digital mastery is hard to displace. |
| 6 | Missing exam season window | HIGH (if launch is delayed) | CRITICAL | ALE exam dates are fixed. If SlateCamp is not running at full speed 8 weeks before the ALE, the highest-converting period of the cycle is wasted. Work backward from the ALE date. |
| 7 | SRS disconnection discovered by users before fix | MEDIUM (if fix delayed) | HIGH | Fix LB-2 on Day 1 of the sprint. This is a 1-hour fix with the highest learning impact. |
| 8 | Solo developer burnout | HIGH | CRITICAL | Philip has shipped 273 commits in 18 days. This pace is unsustainable. The 7-day sprint should be followed by a deliberate pace reduction. First hire (Content + Community Operator) should be at Gate 1 (₱10,000 MRR). |
| 9 | Architecture students prefer offline review materials | MEDIUM | MEDIUM | SlateCamp doesn't replace review centers — it complements them. Position accordingly. "Your review center teaches. SlateCamp measures. Together, you know you're ready." |
| 10 | Readiness Score loses student trust (feels inaccurate) | LOW | CRITICAL | The anti-inflation 6-vector system is well-designed (confirmed in audit). Write comprehensive tests (DI-3). Never show inflated scores. Honesty builds trust. |

---

## 12. SUCCESS METRICS & DECISION GATES

| Milestone | Target | Timeline | Gate Decision |
|-----------|--------|----------|---------------|
| **Sprint Complete** | All 8 Launch Blockers fixed, payment flow tested end-to-end | Week 1 | Open beta doors |
| **Beta Validation** | 50+ beta users, >40% complete 5+ Camp Trail sessions, NPS >40 | Week 4–6 | Proceed to community-led launch |
| **Gate 1: First Paying Cohort** | 25+ paying subscribers, ₱10,000 MRR | Month 3 | Unlock paid acquisition budget (₱10K–₱30K/month). Unlock first part-time hire consideration. |
| **PMF Confirmation** | Free→Paid >3%, Day-7 retention >40%, 10+ video testimonials | Month 4–6 | Scale community-led channels. Activate paid ads. |
| **Gate 2: Growth Engine Working** | 200+ paying subscribers, ₱80,000 MRR | Month 9 | First full-time hire: Content + Community Operator (₱25K–₱35K/month) |
| **Gate 3: Operational Break-Even** | ~560 paying subscribers, ₱223,000 MRR | Month 18 | Company self-sustains. No external capital needed. |
| **Gate 4: Profitable + Hiring** | ~1,000 subscribers, ₱400,000 MRR | Month 24 | Scale team: Growth Lead + B2B Partnerships Lead |
| **First Exam Cycle Complete** | Readiness Score → Pass/Fail correlation data collected, passers activated as referrers | After first ALE | The data moat begins compounding. Hall of Passers goes live. Passer referral engine activates. |

---

## APPENDIX A: THE 7-DAY LAUNCH SPRINT (Day-by-Day)

```
DAY 1 (4 hours):
  □ Wire payment buttons onClick → checkout route           [2 hours]
  □ Add security headers to next.config.ts                  [15 min]
  □ Sanitize XSS in question-card.tsx (3 instances)         [15 min]
  □ Delete debug-taxonomy route                             [5 min]
  □ Add auth to social-proof.ts (3 functions)               [15 min]
  □ Add auth to admin read functions (5 functions)           [30 min]
  □ Remove maximumScale:1 from layout.tsx                    [1 min]

DAY 2 (6 hours):
  □ Wire SRS into testing flow (testing.ts)                  [1 hour]
  □ Build billing settings page                              [4 hours]
  □ Fix analytics_events RLS for anonymous inserts           [30 min]
  □ Add "use server" to 52 action files                      [15 min]

DAY 3 (6 hours):
  □ Write readiness score unit tests                         [4 hours]
  □ Fix onboarding waterfall (Promise.all)                   [30 min]
  □ Fix score-reveal waterfall (Promise.all)                 [15 min]
  □ Fix testing hub waterfall (Promise.all)                  [15 min]
  □ Deprecate legacy readiness score function                [1 hour]

DAY 4 (6 hours):
  □ Upgrade page polish: social proof counter                [2 hours]
  □ Profile editing UI (name, avatar)                        [4 hours]

DAY 5 (5 hours):
  □ Write About page (Philip's story, credibility)           [2 hours]
  □ Write Contact page (support email, response commitment)  [1 hour]
  □ Fix color contrast failures (5 colors)                   [1 hour]
  □ Add mobile touch target overrides                        [1 hour]

DAY 6 (4 hours):
  □ Rename "drill" → "practice/review" (28+ instances)       [2 hours]
  □ Make AI Tutor citations clickable                        [30 min]
  □ Remove GeistSans font + @shadergradient/react            [45 min]
  □ Delete 9 orphan components                               [30 min]
  □ Remove 8 unused dependencies                             [15 min]

DAY 7 (4 hours):
  □ END-TO-END TESTING:
    - New user signup (email + Google)
    - Diagnostic flow (20 questions, score reveal)
    - Camp Trail Day 1 (session start, session complete)
    - Heatmap update verification
    - Upgrade flow (₱399 test payment via LemonSqueezy test mode)
    - Pro feature unlock verification
    - Billing page (subscription visible, cancel works)
    - Score trajectory chart (readiness score history)
  □ Fix any issues found during E2E test
  □ DECISION: Launch beta or iterate
```

**Total sprint effort: ~35 hours across 7 days.**

After the sprint: SlateCamp is revenue-capable, security-hardened, and activation-optimized. Open the doors to the first 50 beta users from Philip's personal network.

---

*Strategy generated 2026-03-25 by the SlateCamp Pre-Launch War Council. Every finding references specific files, tables, and data points from the Global Codebase Audit Report dated 2026-03-25. Financial projections grounded in SlateCamp skill-documented unit economics (₱399 ARPU, 77% GM, 8% churn, ₱250 blended CAC). All recommendations aligned against the Five Moats framework (Domain, Data, Content, Community, Institutional).*


