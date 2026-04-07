# SlateCamp — Unimplemented Features Analysis
## Cross-referenced from Codebase Audit + Strategy Skills + Past Conversations
### 2026-03-26

---

## How to Read This Document

Every feature below was **designed, discussed, or planned** across your skill files, past conversations, and strategic documents — but has **zero implementation in the codebase** as of the March 25 audit. Features are organized by strategic category (Competitive Moat, Growth Engine, IP Commercialization, Design System) with implementation priority.

---

## 1. REVENUE-BLOCKING (Not Implemented — Blocks All Monetization)

### 1.1 Functional Payment Buttons
- **Source:** Audit §4, §6, §12, §13
- **Status:** LemonSqueezy + PayRex infrastructure exists. Webhook handlers work. Checkout route exists. But the upgrade page buttons have **no onClick handlers**. Zero revenue is possible.
- **Effort:** ~2 hours
- **Moat impact:** None — but nothing else matters until money flows.

### 1.2 Billing Settings Page (`/dashboard/settings/billing`)
- **Source:** Audit §4 (Settings at 50%), §14
- **Status:** Route defined but **no page exists**. Users cannot manage subscriptions, view invoices, or cancel.
- **Effort:** ~4 hours

### 1.3 Profile Editing (Name, Avatar)
- **Source:** Audit §14 (P1)
- **Status:** No implementation. Basic user expectation for any paid product.
- **Effort:** ~4 hours

---

## 2. COMPETITIVE MOAT — Features Discussed but Never Built

### 2.1 Campfire Community (Network Moat — Moat #4)
- **Source:** Competitive Moat skill (Moat 4), Growth Engine skill (retention mechanism #5, referral tier 2 & 3), UX Researcher chat (sidebar navigation includes `/dashboard/campfire`)
- **Status:** 0% implemented. Audit confirms "Collaborative Features: 0%". The sidebar navigation was designed to include a "Community" section with Campfire, but no routes, no components, no database tables exist.
- **What was planned:** Curated community of passers helping reviewees. Passer badges, Hall of Passers, moderated Q&A, mentorship pairing, accountability partners, study pods.
- **Moat significance:** The single hardest feature for a competitor to replicate. Network effects compound with each exam cycle.
- **Effort:** 3–4 weeks for MVP (discussion threads, passer verification, basic moderation)

### 2.2 Institutional Dashboard (Distribution Moat — Moat #5)
- **Source:** Competitive Moat skill (Moat 5), IP Commercialization skill (Revenue Stream 1)
- **Status:** 0% implemented. No school-facing portal, no institutional analytics, no multi-tenant admin.
- **What was planned:** School partnerships dashboard where architecture department chairs see aggregate student performance, compare cohorts, and track ALE readiness at the program level.
- **Moat significance:** Institutional contracts are sticky — once integrated, switching costs are very high.
- **Effort:** 4–6 weeks (separate portal, institutional RLS, aggregate analytics views)

### 2.3 Post-Exam Outcome Tracking (Data Moat — Moat #2)
- **Source:** Competitive Moat skill (Moat 2), IP Commercialization skill (Revenue Stream 3)
- **Status:** 0% implemented. No mechanism to correlate Readiness Scores with actual ALE pass/fail results.
- **What was planned:** Post-exam survey flow where users self-report ALE results. Consent-based data collection. Readiness Score → Outcome correlation analysis.
- **Moat significance:** The data that makes SlateCamp's Readiness Score algorithm provably accurate. Without this, the score is a number — with it, it's a validated predictor.
- **Effort:** 1 week (survey flow, consent collection, correlation dashboard in CEO portal)

### 2.4 Content Marketplace
- **Source:** Audit §14 (P4), dead code analysis shows `src/lib/constants/ads.ts` — ad system never implemented
- **Status:** Routes defined but zero implementation.
- **Effort:** 4–6 weeks

---

## 3. GROWTH ENGINE — Features Designed but Never Built

### 3.1 Referral Program (All 3 Tiers)
- **Source:** Growth Engine skill (Referral Program Architecture — Tier 1: Peer, Tier 2: Passer, Tier 3: Group)
- **Status:** 0% implemented. No referral codes, no referral tracking table, no reward mechanics.
- **What was planned:**
  - Tier 1: Unique referral code per user. Referred friend gets ₱100 off Pro, referrer gets 14 days free.
  - Tier 2: Passers become ambassadors with lifetime free Pro, ₱200/referral cash payout, Hall of Passers badge.
  - Tier 3: Study pods of 5+ users get 30 days Pro free, shared Heatmap view, challenge mechanics.
- **Growth impact:** Target viral coefficient K > 0.5. Passer referrals expected to generate 3–5 new users each.
- **Effort:** 2–3 weeks (referral table, code generation, tracking, reward fulfillment)

### 3.2 Daily Streak System
- **Source:** Growth Engine skill (Retention mechanism #1)
- **Status:** 0% implemented. No streak counter, no streak recovery mechanic.
- **What was planned:** Visible streak counter on every session. "Don't break the streak" nudge. Streak Shield recovery (₱20 in-app purchase — also a revenue lever).
- **Constraint:** Must pass the anti-gamification test from Design System skill. No confetti, no badges, no toxic positivity. Streak should be informational ("Day 12"), not celebratory.
- **Effort:** 1 week

### 3.3 Push Notifications (Mobile)
- **Source:** Growth Engine skill (Retention mechanism #4), Audit §14 (Notification preferences UI at P1)
- **Status:** Backend partially exists (`email-preferences.ts` noted in audit) but no push notification infrastructure. No PWA manifest, no service worker.
- **What was planned:** Timed notifications at 8–9 PM (peak Filipino study window). Camp Trail reminders, exam countdown, social comparison nudges.
- **Effort:** 1–2 weeks (requires PWA manifest first)

### 3.4 PWA / Offline Mode
- **Source:** Audit §4 (Mobile Experience: 60%, Offline Mode: 0%), §14 (P2)
- **Status:** 0% implemented. No service worker, no manifest, no offline support. Audit scored this 0%.
- **Growth impact:** Critical for Philippine market where mobile data is intermittent.
- **Effort:** 2–3 weeks

### 3.5 Re-engagement Email Sequences
- **Source:** Growth Engine skill (Re-engagement Sequences — Day 6/10/15/21 silence)
- **Status:** 0% implemented. No automated email triggers, no dormancy detection, no win-back flows.
- **What was planned:** Progressive re-engagement — gentle reminder → data-driven urgency → rebaseline offer → 7 days Pro free win-back.
- **Effort:** 1–2 weeks (email provider integration, dormancy cron job, template system)

### 3.6 Heatmap Delta Notifications
- **Source:** Growth Engine skill (Retention mechanism #3)
- **Status:** Heatmap exists and works well (95% analytics score). But no delta tracking — "This week you turned 3 nodes from red to amber" does not exist.
- **Effort:** 3–5 days

### 3.7 Study Pod Feature (Group Referral)
- **Source:** Growth Engine skill (Referral Tier 3)
- **Status:** 0% implemented. No linked accounts, no shared views, no group challenge mechanics.
- **What was planned:** 5+ users form a pod. Shared Heatmap view, challenge each other's scores. Pods churn at 2x lower rates.
- **Effort:** 3–4 weeks

### 3.8 Score Sharing / Social Proof
- **Source:** Growth Engine skill (Core Growth Loop — "shares progress")
- **Status:** 0% implemented. No shareable score cards, no social sharing integration, no "Share my progress" button.
- **What was planned:** Readiness Score improvement shareable as social content ("I went from 34 to 71 in 6 weeks!"). This is the Duolingo streak mechanic for licensure prep.
- **Effort:** 1 week (shareable image generation, social meta tags, share buttons)

---

## 4. IP COMMERCIALIZATION — Features Designed but Never Built

### 4.1 White-Label Engine Toggle
- **Source:** IP Commercialization skill (Revenue Stream 1)
- **Status:** 0% implemented. No brand theming layer, no multi-tenant configuration.
- **What was planned:** Admin dashboard toggle for logo + color scheme swap. Review centers run SlateCamp under their own brand.
- **Revenue potential:** 5 centers × 100 students × ₱600 = ₱600,000/year
- **Effort:** 2–3 weeks (theming layer, tenant config, institutional admin)

### 4.2 Readiness Score API
- **Source:** IP Commercialization skill (Revenue Stream 2)
- **Status:** 0% implemented. The scoring algorithm exists as pure functions but has no API wrapper, no auth layer, no rate limiting, no documentation.
- **What was planned:** Other EdTech companies send quiz performance data via API, SlateCamp returns calibrated readiness score. Monthly API fee ₱5,000–₱20,000.
- **Effort:** 4–6 weeks (API wrapper, auth, rate limiting, documentation, monitoring)

### 4.3 ALE Performance Intelligence Product
- **Source:** IP Commercialization skill (Revenue Stream 3)
- **Status:** 0% implemented. CEO dashboard tracks internal metrics, but no anonymized aggregate report generation, no institutional buyer interface.
- **What was planned:** Anonymized data sold to UAP, architecture schools, HR firms. Requires user consent collection at signup (not currently implemented).
- **Revenue potential:** ₱500,000–₱2,000,000/year from data intelligence alone.
- **Effort:** 3–4 weeks (consent flow, anonymization pipeline, report generation)

### 4.4 Outcome-Based / Guarantee Pro Pricing
- **Source:** IP Commercialization skill (Revenue Stream 4)
- **Status:** 0% implemented. Current pricing tiers exist on the upgrade page but no "Guarantee Pro" tier, no activity threshold tracking, no refund automation.
- **What was planned:** ₱4,999 tier. Refund ₱2,000 if student uses platform 60+ days, completes 80%+ trail, and still fails. Expected refund rate 5–10%.
- **Revenue uplift:** +142% revenue from same cohort vs. standard pricing.
- **Effort:** 1–2 weeks (new tier, activity tracking, refund logic)

### 4.5 Platform Expansion to Other Professions
- **Source:** IP Commercialization skill (Revenue Stream 5)
- **Status:** 0% implemented. The audit notes the codebase is "discipline-agnostic" in its executive summary, but no actual multi-discipline taxonomy, no profession selector, no content isolation.
- **What was planned:** Deploy same engine for NLE (nursing), CE Board, CPA, Medicine, Law — same codebase, new taxonomy, new content.
- **Revenue math for nursing alone:** 2% capture × 100K candidates × ₱399/mo × 4 months = ₱3.2M/year.
- **Effort:** 3–6 months per profession (content production is the bottleneck, not code)

### 4.6 3D Lab as Standalone Curriculum Product
- **Source:** IP Commercialization skill (Revenue Stream 6)
- **Status:** 3D Lab exists and works (80% complete per audit). But no standalone licensing mode, no school-facing portal, no semester license management.
- **What was planned:** Per-class semester license ₱3,000–₱8,000. School-wide ₱30,000–₱80,000/year.
- **Effort:** 2–3 weeks (standalone access mode, license management, school admin portal)

---

## 5. DESIGN SYSTEM — Planned Standards Not Yet Enforced

### 5.1 Design Token Migration (2,576 hardcoded hex colors)
- **Source:** Design System skill (entire color system), Audit §9
- **Status:** Token system defined in `globals.css` with proper CSS variables. But 2,576 Tailwind class hexes bypass it entirely. 81% of instances are just 10 values that have direct token equivalents.
- **Effort:** 8–12 hours for top 10 values

### 5.2 Dual Token System Resolution
- **Source:** Design System skill, Audit §9
- **Status:** `globals.css` defines BOTH shadcn semantic tokens AND a parallel "Camp Standard" system with conflicting hex values for red, green, and amber. Neither is deprecated.
- **Effort:** 2 hours

### 5.3 Icon Library Consolidation (Lucide + Phosphor)
- **Source:** Audit §9, §11
- **Status:** Lucide in 189 files, Phosphor in 135 files, with no domain boundary. ~60KB waste.
- **Effort:** 4–6 hours

### 5.4 Card Component Adoption (92% bypass)
- **Source:** Design System skill (Card Anatomy), Audit §9
- **Status:** 465 ad-hoc card divs vs. 37 using the shared Card component. 92% of cards don't use the design system component.
- **Effort:** 8–12 hours

### 5.5 Accessibility Fixes
- **Source:** Design System skill, Audit §9
- **Status:** `maximumScale: 1` blocks pinch-zoom (WCAG 2.1 AA failure). Button touch targets below 44px. Only 8 `alt=` attributes across entire codebase. 5 colors fail AA contrast.
- **Effort:** 4–8 hours

### 5.6 Dark Mode Enforcement
- **Source:** Design System skill (Dark Mode section)
- **Status:** Dark mode is defined in the skill and CSS variables support it, but the 2,576 hardcoded hex colors mean dark mode is effectively broken for most of the app.
- **Effort:** Blocked by 5.1 (token migration)

---

## 6. PEDAGOGICAL ENGINE — Designed but Disconnected

### 6.1 SRS Reconnection to Testing Flow
- **Source:** Audit §10 (CRITICAL)
- **Status:** SM-2 algorithm is correct and tested. But `saveTestingInteraction()` in the new testing flow never calls `updateSrsSchedule()` or `deriveQualityRating()`. Spaced repetition is dead for all 7 testing modes.
- **Effort:** 1 hour

### 6.2 IRT Adaptive Question Selection
- **Source:** Audit §10 (CRITICAL)
- **Status:** IRT 2PL functions exist with passing tests but are never called in production. Sessions use simple `current_mastery_weight ASC` ordering instead of P(correct)=0.75 targeting.
- **Effort:** 2 hours

### 6.3 Study Scheduling / Calendar
- **Source:** Audit §14 (P3)
- **Status:** Camp Trails provide daily prescriptions, but no user-controlled study scheduling, no calendar view, no custom pacing.
- **Effort:** 2 weeks

### 6.4 Practice Exam Result Comparison
- **Source:** Audit §14 (P3)
- **Status:** Users can take simulation exams but cannot compare attempts side by side.
- **Effort:** 1 week

### 6.5 Export Analytics Data
- **Source:** Audit §14 (P3)
- **Status:** 8 analytics visualizations exist but no export (PDF report, CSV, shareable link).
- **Effort:** 3 days

---

## 7. MARKETING & CREDIBILITY — Stubs and Missing Pages

### 7.1 About Page
- **Source:** Audit §12, §14
- **Status:** "Coming Soon" stub. Damages credibility for paying customers.
- **Effort:** 2 hours

### 7.2 Contact Page
- **Source:** Audit §12, §14
- **Status:** "Coming Soon" stub. No support channel for paying customers.
- **Effort:** 2 hours

### 7.3 Full-Text Wiki Search (Student View)
- **Source:** Audit §14 (P2)
- **Status:** Admin has search. Students do not have a dedicated wiki search page.
- **Effort:** 1 week

### 7.4 Question Bank Search/Filter (Student View)
- **Source:** Audit §14 (P2)
- **Status:** Market expectation. Not implemented.
- **Effort:** 1 week

---

## 8. GROWTH METRICS & MONITORING — Planned but Not Tracked

### 8.1 Growth Metrics Dashboard
- **Source:** Growth Engine skill (Growth Metrics Dashboard)
- **Status:** CEO dashboard exists with MRR/ARR/runway. But the specific growth metrics designed in the skill are not tracked: Viral Coefficient (K), NPS, DAU/MAU ratio, Re-enrollment Rate, Diagnostic Completion Rate as activation metric.
- **Effort:** 1–2 weeks (add to CEO dashboard)

### 8.2 Cohort Activation Tracking
- **Source:** Growth Engine skill (Activation Engineering)
- **Status:** CEO dashboard has behavioral insights but doesn't track the specific activation funnel: signup → diagnostic completion → Camp Trail Day 1 → Day 3 paywall → conversion.
- **Effort:** 1 week

---

## Summary: What's Built vs. What's Planned

| Category | Features Planned | Features Built | Gap |
|----------|-----------------|---------------|-----|
| Revenue/Payments | 4 (buttons, billing, profile, Guarantee Pro) | 0 functional | 100% |
| Competitive Moat Features | 4 (Campfire, Institutional, Outcome Tracking, Marketplace) | 0 | 100% |
| Growth Engine Features | 8 (Referral, Streak, Push, PWA, Re-engagement, Heatmap Delta, Pods, Sharing) | 0 | 100% |
| IP Commercialization | 6 (White-label, API, Data Product, Guarantee, Expansion, 3D Licensing) | 0 | 100% |
| Design System Enforcement | 6 (Tokens, Dual System, Icons, Cards, A11y, Dark Mode) | Defined but not enforced | ~90% |
| Pedagogical Engine | 5 (SRS, IRT, Scheduling, Comparison, Export) | Algorithms exist but disconnected | ~60% |
| Marketing/Credibility | 4 (About, Contact, Wiki Search, Q Search) | 0 | 100% |
| Growth Monitoring | 2 (Metrics Dashboard, Activation Tracking) | Partial (CEO dashboard exists) | ~70% |

**Total features designed across all skills and conversations: ~39**
**Total features fully implemented and working: ~3** (algorithms exist but are disconnected)
**Implementation gap: ~92%**

---

## Recommended Execution Sequence

**Week 1 (Revenue + Critical Fixes):**
Wire payment buttons, build billing page, fix SRS disconnection, wire IRT, add security headers, sanitize XSS

**Weeks 2–3 (Growth Foundation):**
PWA manifest, About/Contact pages, score sharing, referral program Tier 1, notification preferences UI, Heatmap delta tracking

**Weeks 4–6 (Moat Building):**
Campfire community MVP, post-exam outcome tracking, daily streak system, re-engagement email sequences

**Weeks 7–12 (Commercialization):**
Institutional dashboard, Guarantee Pro tier, study scheduling, wiki/question search for students, design token migration

**Months 4–6 (IP Revenue):**
White-label engine, Readiness Score API, study pods, platform expansion planning

---

*Analysis generated 2026-03-26. Cross-referenced from: Global Codebase Audit Report (2026-03-25), slatecamp-competitive-moat skill, slatecamp-growth-engine skill, slatecamp-ip-commercialization skill, slatecamp-design-system-engineer skill, and 15+ past conversations covering admin console planning, developer hub implementation, UX research, content generation, and fact-checking pipelines.*

