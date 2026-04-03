# SlateCamp Business & Profitability Implementation Plan

> **For:** Philip (Founder/CEO) — Private Executive Reference
> **Version:** 1.0 — March 2026
> **Purpose:** A single-source-of-truth document that maps every metric, milestone, system, and decision the CEO Dashboard must surface — grounded in SlateCamp's revenue architecture, profitability gates, competitive moats, growth engine, GTM calendar, and IP commercialization strategy.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [The Four Profitability Gates](#2-the-four-profitability-gates)
3. [Revenue Architecture & Pricing](#3-revenue-architecture--pricing)
4. [Unit Economics Requirements](#4-unit-economics-requirements)
5. [Cost Structure & Burn Management](#5-cost-structure--burn-management)
6. [Growth Engine & AARRR Funnel](#6-growth-engine--aarrr-funnel)
7. [GTM Calendar & Exam-Cycle Alignment](#7-gtm-calendar--exam-cycle-alignment)
8. [Competitive Moat Monitoring](#8-competitive-moat-monitoring)
9. [IP Commercialization Roadmap](#9-ip-commercialization-roadmap)
10. [CEO Dashboard Metrics Map](#10-ceo-dashboard-metrics-map)
11. [Team & Hiring Trigger Framework](#11-team--hiring-trigger-framework)
12. [Risk Register & Contingency Playbook](#12-risk-register--contingency-playbook)
13. [Implementation Timeline](#13-implementation-timeline)

---

## 1. Executive Summary

SlateCamp is a mastery-based ALE preparation platform entering a market with no direct digital competitor. The business model is freemium B2C subscription revenue evolving into multi-stream income (B2B institutional licensing, algorithm licensing, data intelligence, outcome-based pricing, and platform expansion to adjacent professions).

The path to profitability follows a four-gate framework. Each gate unlocks specific spending, hiring, and strategic moves. The CEO Dashboard is the cockpit that surfaces whether each gate's conditions are met, where the bottleneck is, and what action to take next.

**The three questions the dashboard answers:**

1. **Is the business surviving?** — Financial health, runway, burn rate, MRR trajectory
2. **Are students learning and staying?** — Behavioral analytics tied to revenue (retention, churn, activation, conversion)
3. **Is the team structured to execute?** — Headcount, cost allocation, role coverage, hiring triggers

Everything in this document feeds directly into the `/ceo` route implementation.

---

## 2. The Four Profitability Gates

Each gate has entry conditions, spending unlocks, and a revenue milestone that opens the next gate. The CEO Dashboard must clearly show which gate SlateCamp is currently in and how far along the path to the next gate.

### Gate 0 → Gate 1: Zero to Validation

| Attribute | Detail |
|---|---|
| **Timeline** | Month 0–3 from launch |
| **Goal** | Prove willingness to pay. First ₱10,000 MRR. |
| **Burn target** | < ₱20,000/month total |
| **Revenue milestone** | ₱10,000 MRR (~25–30 paying Pro subscribers) |
| **Exit conditions** | Free→Paid conversion rate confirmed > 3%, NPS > 40 |
| **Spending allowed** | Near-zero. Hosting, payment processing, minimal tools. |
| **Spending NOT allowed** | Branding agencies, premium tools, paid team, office, conferences, paid ads |

**Dashboard requirement:** Show MRR progress bar toward ₱10,000. Show conversion rate and NPS as gate-exit indicators. If either condition is unmet, show a warning: "Gate 1 not cleared — iterate on product before scaling spend."

### Gate 1 → Gate 2: Validation to Repeatability

| Attribute | Detail |
|---|---|
| **Timeline** | Month 3–9 |
| **Goal** | Build the acquisition engine. Prove predictable growth. |
| **Revenue milestone** | ₱80,000 MRR (~200 paying subscribers) |
| **Spending unlocked** | Paid acquisition (₱10K–₱30K/month Meta/TikTok), one part-time content creator (₱8K–₱15K/month), analytics + email tools |
| **Key ratio** | MRR growth rate vs. cost growth rate. MRR must grow faster than costs. |
| **Exit conditions** | CAC payback < 8 months, MRR growth > cost growth for 3 consecutive months |

**Dashboard requirement:** Show MRR trajectory chart with cost overlay. Surface the MRR-to-cost growth ratio. Show CAC payback period. If ₱10K in new monthly spend does not produce > ₱10K in new MRR, flag it.

### Gate 2 → Gate 3: Repeatability to Break-Even

| Attribute | Detail |
|---|---|
| **Timeline** | Month 9–18 |
| **Goal** | Operational break-even. The business pays for itself. |
| **Revenue milestone** | ₱223,000 MRR (~560 paying subscribers) |
| **Hiring unlocked** | Growth/Marketing Lead (₱25K–₱40K/month), Customer Success / Content Lead (₱20K–₱35K/month) |
| **Break-even math** | Total monthly burn ₱172,000 ÷ 0.77 gross margin = ₱223,000 MRR needed |

**Break-even cost structure at Gate 3:**

| Line Item | Monthly Cost (₱) |
|---|---|
| Philip's draw | 50,000 |
| Growth Lead | 32,000 |
| Content Lead | 27,000 |
| Hosting + infrastructure | 15,000 |
| Tools + software | 8,000 |
| Ad spend (budgeted) | 40,000 |
| **Total monthly burn** | **172,000** |

**Dashboard requirement:** Show runway gauge, burn rate vs. MRR, and a projected break-even date based on current growth trajectory. Show subscriber count vs. 560 target.

### Gate 3 → Gate 4: Break-Even to Profitable Growth

| Attribute | Detail |
|---|---|
| **Timeline** | Month 18–36 |
| **Goal** | Consistent profit. Selective reinvestment. Build institutional revenue. |
| **Revenue milestone** | ₱400,000 MRR (~1,000 subscribers) |
| **Operating leverage** | Each subscriber past 560 contributes ~₱307/month in marginal profit |
| **Second-wave hires** | B2B Sales/Partnerships Lead (₱30K–₱45K/month), ALE SME / Content Lead (₱25K–₱40K/month) |

**Dashboard requirement:** Show contribution margin per marginal subscriber. Show monthly surplus and how it's being reinvested. Track institutional pipeline.

---

## 3. Revenue Architecture & Pricing

### 3.1 B2C Tier Structure

| Tier | Price | Access | Best For |
|---|---|---|---|
| **FREE** | ₱0 | Diagnostic quiz (one-time), Readiness Score (revealed once), blurred Heatmap, 3 Camp Trail days, limited Wiki | Acquisition hook. Proves value. |
| **PRO MONTHLY** | ₱299–₱399/month | Live Readiness Score, full Heatmap + trajectory, full Camp Trail, Camp + Storm Mode, 3D Lab, Campfire, unlimited Wiki | Casual starters, 4–6 months from exam |
| **PRO EXAM PASS** | ₱1,499–₱2,499 one-time (90-day access) | Everything in Pro Monthly + Endurance Cycle + Blindspot Protocol + priority support | Committed candidates, 1–3 months pre-exam |

### 3.2 B2B Institutional Pricing (Phase 2, 6–18 months post-launch)

| Package | Pricing |
|---|---|
| School License (50 students) | ₱15,000–₱25,000/semester |
| School License (100 students) | ₱25,000–₱45,000/semester |
| School License (200+ students) | ₱150–₱250/student/semester |
| Review Center Bundle | ₱500–₱800/student per batch |

### 3.3 Future Premium Tiers

| Tier | Price | Trigger |
|---|---|---|
| **Topnotcher Track** | ₱4,999–₱9,999 | Phase 2–3. AI coach, cohort group, guaranteed improvement. |
| **Guarantee Pro** | ₱4,999 | Phase 3. Partial refund if student fails ALE after meeting usage thresholds. Net revenue uplift ~142% vs. standard pricing. |

### 3.4 Freemium Gate Logic

The Readiness Score is the freemium gate. It must deliver value (the score itself) before gating continued value (live tracking, trajectory, action plan).

**Behind the paywall (must-gate):** Live Readiness Score tracking, full Heatmap with trajectory, Storm Mode, 3D Lab, Campfire community.

**Not behind the paywall (must-keep-free):** Diagnostic quiz, initial score reveal, limited Wiki, Camp Trail Days 1–3.

### 3.5 Revenue Scenario Models

| Scenario | Pro Monthly | Exam Pass | B2B | Annual Revenue |
|---|---|---|---|---|
| **Conservative (Year 1)** | 300 × ₱399/month | 150 × ₱1,999/cycle × 2 | — | ~₱1.4M |
| **Base Case (Year 1–2)** | 800 × ₱399/month | 400 × ₱1,999/cycle × 2 | — | ~₱5.4M |
| **Upside (Year 2–3)** | 1,500 × ₱399/month | 800 × ₱1,999/cycle × 2 | 5 schools × ₱35K/sem | ~₱10.7M |

**Dashboard requirement:** Revenue breakdown by tier (Pro Monthly, Pro Exam Pass, Institutional). Show actual vs. scenario projections. Show ARPU trend.

### 3.6 Pricing Psychology Levers

- **Anchor to review centers:** ₱2,499 vs. ₱15,000+ classroom review. "The cost of one month of classes."
- **Installment option:** ₱2,499 → ₱499 × 5 via GCash installment partners (BillEase, Plentina, Tendopay).
- **₱99 trial:** 7-day Pro trial at ₱99. Higher conversion than free trial.
- **Exam season surge pricing:** +15–25% in the final 8 weeks before ALE. Announce in advance.
- **Loss framing:** "You're leaving ₱2,499 of protection on the table" outperforms gain framing.
- **Social proof at paywall:** "X students already enrolled for [exam month]."

---

## 4. Unit Economics Requirements

These are the numbers the CEO Dashboard must compute and display.

### 4.1 Core Unit Economics

| Metric | Formula | Target |
|---|---|---|
| **MRR** | Sum of active subscription revenue (monthly) | Gate-dependent |
| **ARR** | MRR × 12 | Gate-dependent |
| **ARPU** | Total revenue ÷ paying users | ₱399 (Pro Monthly baseline) |
| **CAC** | Total acquisition spend ÷ new paying users (period) | < ₱1,000 |
| **LTV** | ARPU × (1 / monthly churn rate) | > ₱3,000 |
| **LTV:CAC** | LTV ÷ CAC | > 3:1 |
| **CAC Payback** | CAC ÷ (ARPU × gross margin) | < 6 months |
| **Monthly Churn Rate** | Cancelled users ÷ active paying users | < 8% |
| **Gross Margin** | (Revenue − COGS) ÷ Revenue | ~77% |
| **Net Burn** | Monthly burn − MRR | Negative = profitable |
| **Runway** | Cash on hand ÷ net burn | > 12 months always |

### 4.2 Conversion Economics

| Metric | Formula | Target |
|---|---|---|
| **Free→Paid Conversion** | New paid users ÷ total free signups (cohort) | > 3% (grow to 7%+) |
| **Diagnostic Completion** | Users completing diagnostic ÷ total signups | > 60% |
| **Day-3 Paywall Conversion** | Users converting at Camp Trail Day 3 wall ÷ users reaching Day 3 | > 12% |
| **Exam Pass Upsell Rate** | Exam Pass purchases ÷ total Pro users | Track per cycle |

### 4.3 Marginal Economics (Post Break-Even)

| Metric | Value |
|---|---|
| Revenue per marginal subscriber | ₱399 |
| Variable cost per marginal subscriber | ₱92 (23% of revenue) |
| Contribution per marginal subscriber | ₱307/month |
| Each additional 100 subscribers | +₱30,700 monthly profit |
| Each additional 1,000 subscribers | +₱307,000 monthly profit |

**Dashboard requirement:** All unit economics displayed on the Command Center page. CAC and LTV updated monthly. LTV:CAC ratio displayed as a health indicator. Contribution margin per subscriber shown post-break-even.

---

## 5. Cost Structure & Burn Management

### 5.1 Cost Categories for `ceo_financial_entries`

The financial tracking system must categorize every peso. These are the `category` values the CEO will use:

**Revenue categories:**
- `subscription_revenue` — B2C Pro Monthly and Exam Pass
- `institutional_revenue` — B2B school/review center contracts
- `api_licensing_revenue` — Readiness Score API fees (future)
- `data_intelligence_revenue` — Performance reports to institutions (future)
- `white_label_revenue` — Engine licensing to partners (future)

**Expense categories:**
- `salaries` — Philip's draw + team compensation
- `contractors` — Part-time content creators, consultants
- `ad_spend` — Meta, TikTok, Google ads
- `server_costs` — Supabase, Vercel, CDN, hosting
- `tools` — Analytics, email, CRM, design tools
- `payment_processing` — Stripe + Payrex fees (~3% of revenue)
- `content_production` — SME fees for wiki, questions, 3D Lab
- `legal` — IP protection, trademarks, contracts
- `office` — Co-working or rent (if applicable)
- `miscellaneous` — Everything else

### 5.2 Cost Structure Rules

1. **No full-time hire before the hire can be justified by revenue impact.** Every hire must have a measurable output tied to MRR, retention, or cost reduction.
2. **Infrastructure scales; headcount doesn't.** Prefer tools over people where a tool achieves the same outcome.
3. **Content investment has the best ROI.** One wiki article serves 10,000 users. One 3D Lab module differentiates for years.
4. **Paid acquisition is a multiplier, not a foundation.** If organic channels aren't converting, paid won't save the business.
5. **Exam seasonality is a cash flow weapon.** Build reserves during peak → deploy during off-season for content/product development. Never let surplus evaporate in operational bloat.

### 5.3 Burn Rate Scenarios by Gate

| Gate | Target Burn | Key Costs |
|---|---|---|
| Gate 0–1 | < ₱20,000/month | Hosting, payment processing |
| Gate 1–2 | ₱40,000–₱60,000/month | + Ad spend, part-time content creator, tools |
| Gate 2–3 | ₱120,000–₱172,000/month | + Growth Lead, Content Lead, scaled ad budget |
| Gate 3–4 | ₱220,000–₱300,000/month | + B2B Lead, SME Lead, scaled infrastructure |

**Dashboard requirement:** Monthly burn rate trend chart. Expense breakdown by category (pie/bar). Revenue vs. expense overlay. Runway gauge based on cash on hand ÷ net burn.

---

## 6. Growth Engine & AARRR Funnel

### 6.1 Funnel Metrics (Dashboard Must Track)

| Stage | Metric | Target | Data Source |
|---|---|---|---|
| **Acquisition** | New free signups (weekly/monthly) | Growing 15%+ MoM | `auth.users` |
| **Acquisition** | Cost per free signup | < ₱50 | `ceo_financial_entries` (ad spend) ÷ signups |
| **Acquisition** | Acquisition source distribution | Diversified | `user_global_stats.acquisition_source` |
| **Activation** | Diagnostic completion rate | > 60% of signups within 24h | `quiz_sessions` (mode = diagnostic) |
| **Activation** | Time to first Readiness Score | < 30 minutes from signup | `readiness_score_snapshots` − `profiles.created_at` |
| **Activation** | Day-1 Camp Trail completion | > 50% | `trail_day_completions` |
| **Retention** | Day-7 retention | > 40% | `user_global_stats.last_session_at` |
| **Retention** | Day-30 retention | > 25% | Same |
| **Retention** | DAU/MAU ratio (stickiness) | > 25% | `quiz_sessions` daily/monthly active |
| **Retention** | Avg sessions per user per week | Growing | `user_global_stats.total_sessions` |
| **Retention** | Camp Trail completion rate | Measure baseline | `trail_day_completions` ÷ `user_trail_enrollments` |
| **Revenue** | Free→Paid conversion rate | > 3%, grow to 7%+ | `user_global_stats.converted_at` |
| **Revenue** | Median days to conversion | Decreasing | `converted_at` − `first_session_at` |
| **Revenue** | Median sessions before conversion | Track | `user_global_stats` |
| **Revenue** | Readiness Score at conversion | Track | `readiness_score_snapshots` at `converted_at` |
| **Revenue** | Monthly churn rate | < 8% | Cancelled ÷ active paying |
| **Referral** | Viral coefficient (K) | > 0.5, target > 1.0 | Referral signups ÷ total users |
| **Referral** | NPS | > 50 | Survey (periodic) |

### 6.2 The Core Growth Loop

```
Student feels ALE anxiety
    → Discovers SlateCamp (social / referral / SEO)
    → Takes Diagnostic → Gets Readiness Score
    → "My score is 34/100. I need to fix this."
    → Activates Camp Trail (free days first)
    → Score improves → shares progress
    → Friends see it → discover SlateCamp
    → Passes exam → posts about it
    → [LOOP RESTARTS — friends of passers become next cohort]
```

**Dashboard requirement:** Cohort retention table (signup month × weeks since signup). Churn risk distribution segmented by risk level. Time-to-Value funnel visualization. Engagement snapshot with DAU/MAU, sessions/week, Trail completion.

### 6.3 Retention Mechanisms to Build & Monitor

| Mechanism | Description | Metric to Track |
|---|---|---|
| Daily streak | Visible streak counter per user | Avg streak length, streak-break recovery rate |
| Camp Trail progress | "Day 23 of 90" sunk-cost psychology | Trail completion rate by cohort |
| Heatmap pull | Red→amber→green progress anxiety/pride | Heatmap delta per session |
| Push notifications | Timed nudges at 8–9 PM | Open rate, session-from-notification rate |
| Campfire community | Social accountability | Community members' churn rate vs. solo users |
| Re-engagement sequences | Escalating win-back (Day 6, 10, 15, 21) | Win-back conversion rate |

### 6.4 Referral Program Tiers

| Tier | Trigger | Offer | Expected Output |
|---|---|---|---|
| Peer Referral | Any active user | Give ₱100 off → Get 14 days Pro free | Baseline referral flow |
| Passer Referral | User passes ALE | Free Pro for life + ₱200/referral cash | Avg passer refers 3–5 candidates |
| Group Referral | 5 users form study pod | All 5 get 30 days Pro free | Pods churn at 2× lower rate |

---

## 7. GTM Calendar & Exam-Cycle Alignment

### 7.1 GTM Phases

| Phase | Timeline | Goal | Spend |
|---|---|---|---|
| **Phase 0: Pre-Launch** | T-12 to T-8 weeks | 500–1,000 waitlist leads | ₱0 (personal network, school orgs, FB groups) |
| **Phase 1: Closed Beta** | Weeks 1–4 post-launch | 50–100 real users, validate PMF | ₱0 (beta management, surveys) |
| **Phase 2: Community-Led Launch** | Weeks 4–8 | 300–500 free signups → 50–100 paying | ₱0 (ambassadors, UAP workshops, review center partnerships) |
| **Phase 3: Paid Growth** | Month 3+ (post-PMF only) | Scale acquisition with confirmed economics | ₱10K–₱30K/month ads (only if conv. > 3%, NPS > 40, CAC payback < 8 months) |

### 7.2 Exam-Cycle Marketing Calendar

```
T-6 months:  Community seeding, waitlist/beta, content publishing
T-4 months:  Full launch, first paid campaigns, school workshops
T-2 months:  "Exam season surge" pricing (+15–25%), urgency messaging
T-1 month:   Heaviest paid spend, retargeting, Exam Pass bundle push
Exam week:   Go quiet on sales. Encouragement content only.
Post-exam:   Celebrate passers, outreach retakers, collect testimonials
```

### 7.3 Paid Channel Strategy (Phase 3+)

| Channel | Budget Split | Strategy |
|---|---|---|
| **Meta (FB/IG)** | 70% FB, 30% IG | Interest targeting (architecture, UAP, PRC), video > static, ₱500–₱1,000/day start |
| **TikTok** | Organic first → Spark Ads | "Study with SlateCamp" student-generated content, boost performing organic |
| **Google Search** | ₱200–₱500/day | Intent capture: "ALE reviewer Philippines", exam-specific landing pages |
| **YouTube** | Retargeting only | Pre-roll on architecture content, retarget non-converters |

### 7.4 B2B School GTM Sequence

| Week | Action |
|---|---|
| 1 | Identify contact (architecture dept chair or student affairs) |
| 2 | Warm approach: free trial for 5th-year students, no pitch |
| 3 | Follow-up with beta results (anonymized score improvements) |
| 4 | Institutional proposal: semester license with per-student pricing |
| 6–8 | Close, onboard (batch import, educator dashboard briefing, Philip presents) |

**Target schools (priority):** UST, PLM, Mapua, PUP, FEU, UE, NU, UP.
**Expected close rate:** 20–30% of schools contacted.

**Dashboard requirement:** Track acquisition source distribution. Track CAC by channel. Track referral program performance (K factor). Track school pipeline (contacted → demo → proposal → signed).

---

## 8. Competitive Moat Monitoring

### 8.1 The Five Moats

| Moat | Description | Durability | Year 1 Target |
|---|---|---|---|
| **Domain Expertise** (Founder) | Philip is a licensed architect. Credibility with schools, UAP, students. | High | Position Philip as visible ALE expert. Lock advisory board. |
| **Proprietary Data** | Performance profiles from thousands of ALE candidates. Better Readiness Score model. | High, compounding | Instrument every session. 1,000+ candidate profiles by end of Year 1. |
| **Content Library** | Complete, ALE-calibrated taxonomy content. Accurate, architect-produced. | Medium-high | Full taxonomy coverage. 1,000+ validated questions. |
| **Community Network** (Campfire) | Passers help reviewees. Network effect. | High | 50+ passers active in Campfire after first exam cycle. |
| **Institutional Relationships** | School contracts, review center partnerships, UAP endorsement. | High | 1 school or review center signed. |

### 8.2 Moat Health Indicators (Dashboard)

| Moat | Metric to Track | Warning Signal |
|---|---|---|
| Data | Total candidate performance profiles | Growth stalling (< 50 new profiles/month) |
| Data | Readiness Score → ALE outcome correlation | Not collecting post-exam outcome data |
| Content | Taxonomy coverage (% nodes with content) | < 80% coverage approaching exam season |
| Content | Question bank size | < 500 validated questions |
| Community | Active Campfire members | < 20 active passers after first cycle |
| Institutional | Signed school/review center contracts | Zero institutional revenue after Month 12 |

### 8.3 Competitive Response Playbook

| Threat | Response |
|---|---|
| Review center launches digital product | Accelerate school partnerships. Offer white-label licensing. "Don't build it — license SlateCamp instead." |
| Well-funded EdTech enters ALE prep | Accelerate community + data moats. Lock multi-year school deals. Push for UAP endorsement. |
| Copycat founder launches | Brand dominance — flood social proof (100+ success stories). Trademark SlateCamp, Readiness Score, Camp Trail, Campfire. |

---

## 9. IP Commercialization Roadmap

### 9.1 IP Asset Inventory

| Asset | Commercial Potential | Revenue Stream |
|---|---|---|
| Readiness Score Algorithm | License to other EdTech for different Licensure Exams | API-as-a-Service |
| Adaptive Testing Engine | White-label to review centers, corporate training | White-Label Licensing |
| ALE Taxonomy Map | License to publishers, UAP, CHED | Data/Content Licensing |
| 3D Lab WebGL Modules | License to architecture schools as curriculum tool | Standalone Product |
| Performance Dataset | Sell anonymized intelligence to UAP, schools, HR firms | Intelligence Product |
| Camp Trail Framework | License as curriculum architecture to other exam prep companies | Framework Licensing |

### 9.2 Commercialization Priority Ladder

| Tier | Timeline | Revenue Stream | Revenue Potential |
|---|---|---|---|
| **Tier 1** | Now | B2C subscription revenue | Foundation — validates everything |
| **Tier 2** | Month 6–12 | White-label licensing to review centers | ₱600K/year (5 centers × 100 students × ₱600 × 2 cycles) |
| **Tier 3** | Month 12–18 | Guarantee Pro + Readiness Score API | Premium: +142% uplift. API: ₱5K–₱20K/month/licensee |
| **Tier 4** | Month 18–36 | Data intelligence + platform expansion (Nursing, CE) | ₱500K–₱2M/year (data). Nursing alone: ₱3.2M/year at 2% capture |
| **Tier 5** | Month 36+ | Acquisition positioning or institutional partnerships | 4–10× ARR exit multiple |

### 9.3 Platform Expansion Priority

| Profession | Annual Candidates | Content Investment | Revenue at 2% Capture |
|---|---|---|---|
| Architecture (ALE) | ~16,000–24,000 | Current (beachhead) | Current |
| Nursing (NLE) | ~100,000+ | 3–6 months SME content | ~₱3.2M/year |
| Civil Engineering | ~20,000+ | Structural overlap with ALE | ~₱640K/year |
| CPA | ~15,000+ | High willingness to pay | ~₱960K/year |
| Medicine (PLE) | ~5,000+ | Deepest content investment | Highest ARPU |

### 9.4 Outcome-Based Pricing (Guarantee Pro)

| Parameter | Value |
|---|---|
| Price | ₱4,999 (vs. ₱1,999 standard) |
| Refund condition | 60+ days usage, 80%+ Camp Trail completion, verified exam attempt, still failed |
| Expected refund rate | 5–10% (activity threshold filters out most) |
| Net revenue per 100 users | ₱483,900 (vs. ₱199,900 at standard) |
| Revenue uplift | +142% |

**Dashboard requirement:** Track IP commercialization pipeline. Show revenue by stream (B2C, B2B, API, data). Surface when Tier 2/3/4 readiness conditions are met.

---

## 10. CEO Dashboard Metrics Map

This section maps every metric to the specific dashboard page and data source.

### 10.1 Command Center (`/ceo` main page) — North Star Metrics

| Metric | Type | Data Source | Display |
|---|---|---|---|
| MRR | Financial | `user_subscriptions` (active, sum by plan price) | MetricCard, ₱XX,XXX format |
| ARR | Financial | MRR × 12 | MetricCard |
| Monthly Burn | Financial | `ceo_financial_entries` (expenses, current month) | MetricCard |
| Net Burn | Financial | Burn − MRR | MetricCard (directional indicator) |
| Runway (months) | Financial | Cash on hand ÷ net burn | RunwayGauge |
| Cash on Hand | Financial | Manual entry in `ceo_financial_entries` | MetricCard |
| Total Registered Users | Growth | `auth.users` count | MetricCard |
| Paying Users | Growth | `user_subscriptions` (active) count | MetricCard |
| Free→Paid Conversion % | Growth | Paying ÷ total registered | MetricCard |
| CAC | Unit Econ | Manual entry or computed from ad spend ÷ new paid | MetricCard |
| LTV | Unit Econ | ARPU × (1 / churn rate) | MetricCard |
| LTV:CAC Ratio | Unit Econ | LTV ÷ CAC | MetricCard (health indicator) |
| Revenue Trend (6 months) | Financial | `ceo_financial_entries` + `user_subscriptions` | RevenueChart (Recharts AreaChart) |
| Current Gate | Status | Derived from MRR thresholds | Visual gate indicator |

### 10.2 Behavioral Insights (`/ceo/insights`)

| Metric | Data Source | Display |
|---|---|---|
| Cohort retention table | `user_global_stats` (signup month × weeks active) | CohortRetentionTable (heatmap grid) |
| Churn risk distribution | `user_global_stats.churn_risk_score` segmented into low/med/high/critical | ChurnRiskBars |
| Time-to-Value funnel | `user_global_stats` (first_session_at, converted_at) + `quiz_sessions` + `readiness_score_snapshots` | TimeToValueFunnel |
| DAU/MAU ratio | `quiz_sessions` (daily/monthly distinct users) | MetricCard |
| Avg sessions/week | `user_global_stats.total_sessions` / weeks active | MetricCard |
| Camp Trail completion rate | `trail_day_completions` ÷ `user_trail_enrollments` | MetricCard |
| Top churn signals | Derived from `user_interactions` + `user_global_stats` correlations | Text insight cards |
| Score velocity (7d) | `user_global_stats.score_velocity_7d` distribution | Chart or distribution card |
| Readiness Score at conversion | `readiness_score_snapshots` at `converted_at` timestamp | MetricCard |

### 10.3 Team Management (`/ceo/team`)

| Metric | Data Source | Display |
|---|---|---|
| Team roster | `ceo_team_members` | TeamTable (sortable, filterable by dept) |
| Department cost allocation | `ceo_team_members` aggregated by department | DepartmentCostChart (pie/bar) |
| Headcount by department | `ceo_team_members` (active, grouped by department) | MetricCard per dept |
| Total team cost as % of burn | Team cost ÷ total monthly burn | MetricCard |
| System role assignments | `ceo_team_members.system_role` | RoleAssignmentModal |
| Alumni tracking | `ceo_team_members` where `end_date` < today | Badge in TeamTable |

### 10.4 Detailed Financials (`/ceo/financials`)

| Metric | Data Source | Display |
|---|---|---|
| Revenue vs. expense trend (monthly) | `ceo_financial_entries` | Recharts AreaChart |
| Expense breakdown by category | `ceo_financial_entries` (type = expense, grouped by category) | Pie chart |
| Revenue breakdown by stream | `ceo_financial_entries` (type = revenue, grouped by category) | Stacked bar |
| Recurring vs. one-time expenses | `ceo_financial_entries.is_recurring` | Toggle filter |
| Financial entry form | `ceo_financial_entries` (insert) | FinancialEntryForm |
| Investor export | All metrics summarized | One-click markdown export |

---

## 11. Team & Hiring Trigger Framework

### 11.1 Hiring Decision Rules

**Rule:** No hire unless (a) Philip is personally the bottleneck, AND (b) the hire has a clear, measurable output tied to MRR, retention, or cost reduction.

### 11.2 Hiring Sequence

| Hire | Title | Monthly Cost (₱) | Trigger | Success Metric |
|---|---|---|---|---|
| #1 | Growth/Marketing Lead | 25,000–40,000 | ₱80K–₱150K MRR. Philip can't do growth + product. | CAC payback < 6 months on managed channels |
| #2 | Customer Success / Content Lead | 20,000–35,000 | Same trigger window. Retention needs dedicated attention. | Day-30 retention improves from baseline |
| #3 | B2B Sales / Partnerships Lead | 30,000–45,000 | 800–1,000 subscribers. B2B pipeline exceeds Philip's capacity. | ≥ 2 institutional contracts per quarter |
| #4 | ALE SME / Content Lead | 25,000–40,000 | Content quality at risk or expansion to new professions. | Wiki coverage at 100% taxonomy, content quality maintained |

### 11.3 Cost Allocation Targets

| Department | Target % of Burn |
|---|---|
| Engineering (Philip + future devs) | 30–40% |
| Content | 15–25% |
| Marketing/Growth | 20–30% (including ad spend) |
| Operations + Tools | 10–15% |

**Dashboard requirement:** Show current allocation vs. targets. Flag when any department exceeds its target band.

---

## 12. Risk Register & Contingency Playbook

### 12.1 Financial Risks

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| Cash runway drops below 6 months | Medium | Critical | Dashboard runway warning at 6 months. Immediate cost cuts triggered. |
| Ad spend ROI turns negative | Medium | High | Kill underperforming channels within 7 days. Return to organic-only growth. |
| Payment provider failure (Stripe/Payrex) | Low | High | Maintain dual payment rails. |
| Exam season revenue misses projection | Medium | High | Pre-build 2-month cash reserve from prior peak. |

### 12.2 Growth Risks

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| Free→Paid conversion < 3% | Medium | Critical | Do not activate paid spend. Iterate on freemium gate, onboarding, paywall timing. |
| Day-7 retention < 30% | Medium | High | Diagnose Camp Trail friction. A/B test onboarding flow. |
| MRR growth stalls | Medium | High | Run the growth plateau diagnostic (see below). |
| Referral program underperforms (K < 0.3) | Medium | Medium | Test reward framing. Activate passer referral tier. |

### 12.3 Growth Plateau Diagnostic

When MRR growth stalls, diagnose in this order. Solve one bottleneck at a time:

1. **Acquisition problem?** (New free signups declining) → Fix activation rate, channel diversification, content volume.
2. **Activation problem?** (Signups not completing diagnostic) → Fix onboarding friction, diagnostic length, time-to-value.
3. **Conversion problem?** (Activations not converting to paid) → Fix paywall timing, freemium gate, pricing, social proof.
4. **Retention problem?** (Paying users churning too fast) → Fix Camp Trail engagement, Blindspot Protocol, pod accountability.
5. **ARPU problem?** (Revenue not growing proportionally to users) → Push Exam Pass upsell, Guarantee Pro, B2B licensing.

**Dashboard requirement:** Surface the diagnostic with color-coded indicators. If any stage's metrics are below target, flag it as the likely bottleneck.

---

## 13. Implementation Timeline

### Phase 1: Foundation (Weeks 1–2)

**Build:**
- CEO route shell, auth gate, sidebar navigation
- Supabase migrations for `ceo_financial_entries` and `ceo_team_members`
- Design tokens and skeleton loaders

**Monitor:** Nothing yet — infrastructure only.

### Phase 2: Command Center (Weeks 3–4)

**Build:**
- MRR, ARR, burn rate, net burn, runway metrics
- Revenue trend chart (6 months)
- MetricCard components for all North Star metrics
- RunwayGauge visualization
- Gate indicator (which profitability gate SlateCamp is in)

**Monitor:** Financial health, runway, MRR trajectory.

### Phase 3: Team Management (Weeks 5–6)

**Build:**
- Team roster table with department filter
- Department cost allocation chart
- Role assignment modal
- Server Actions for team CRUD

**Monitor:** Team cost as % of burn, department allocation vs. targets.

### Phase 4: Behavioral Analytics (Weeks 7–9)

**Build:**
- Cohort retention heatmap table
- Churn risk distribution bars
- Time-to-Value funnel
- Engagement snapshot metrics (DAU/MAU, sessions/week, Trail completion)
- Growth plateau diagnostic indicators

**Monitor:** AARRR funnel health, retention cohorts, churn risk, activation rates.

### Phase 5: Detailed Financials & Export (Weeks 10–12)

**Build:**
- Financial entry form (revenue/expense/investment)
- Revenue vs. expense trend chart
- Expense breakdown by category
- Revenue breakdown by stream
- Investor summary export (markdown)
- Moat health indicators
- IP commercialization pipeline tracker

**Monitor:** Full financial picture, revenue by stream, moat health, commercialization readiness.

---

## Appendix A: Self-Funding Bootstrap Math

| Parameter | Value |
|---|---|
| Monthly self-funding budget | ₱50,000–₱80,000 (living + tools) |
| Bootstrap period to break-even | 18 months |
| Total bootstrap cost | 18 × ₱65,000 = ₱1,170,000 |
| Break-even MRR | ₱223,000 |
| Monthly surplus at break-even | ₱51,000 |
| Fundraising decision | Raise only to accelerate, not to survive |

## Appendix B: Acquisition Target Positioning

| Acquirer Type | Why They Want SlateCamp | Multiple |
|---|---|---|
| Global publishers (Pearson, Rex) | Philippine market entry, ALE content library | 4–8× ARR |
| Philippine conglomerate (Ayala, SM, PLDT) | Education platform play, brand, data | 5–10× ARR |
| SEA EdTech (Ruangguru, Zenius) | Philippine market + licensure prep vertical | 5–8× ARR |
| Private equity roll-up | Multiple EdTech platforms combined | 3–5× EBITDA |

**Build for exit from Day 1** — even if Philip never intends to sell. Acquisition-readiness forces the discipline that makes SlateCamp durable.

## Appendix C: Revenue Decision Framework

Before any pricing or monetization change, answer these four questions:

1. **Does it reduce friction to the first payment?** → Strongly consider.
2. **Does it increase ARPU without killing volume?** → Strongly consider.
3. **Does it create a new buyer segment we couldn't reach before?** → Explore it.
4. **Does it align the student's success with our revenue?** → It's defensible long-term.

## Appendix D: Moat Assessment Test

Before any major product or business decision:

1. Does this strengthen any of our 5 moats?
2. Does this create a data, content, or community asset that compounds?
3. Does this deepen institutional relationships?
4. Can a copycat do this in less than 12 months?
5. Does this make the next 1,000 users more valuable than the last 1,000?

---

> **This document is the strategic backbone behind every number on the CEO Dashboard. Every metric displayed, every chart rendered, and every empty state message should trace back to a section in this plan. If a feature on `/ceo` can't be justified by this document, it doesn't belong there.**

