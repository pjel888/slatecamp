# SlateCamp CEO Dashboard — Comprehensive UX Research & Design Plan
## `/ceo` Route: Executive Command Center

> **Document type:** UX Research + Full Feature Specification + Step-by-Step Path Documentation
> **Route:** `/ceo` (4 sub-routes: `/ceo`, `/ceo/team`, `/ceo/insights`, `/ceo/financials`)
> **User:** Philip (SlateCamp founder/CEO) — sole user, super_admin role
> **Core question this dashboard answers:** Is the business surviving? Are students learning? Is the team structured to execute?
> **Version:** 1.0 · March 2026

---

## Part 1 — Research Foundation

### Who Is Using This and How

The CEO dashboard has exactly one user: Philip. This changes everything about how it should be designed. Consumer product UX research talks about discoverability for new users, onboarding flows, and intuitive navigation for strangers. None of that applies here. The research question for a single-user executive dashboard is fundamentally different: **how does one person, under high cognitive load, make better decisions faster?**

The person opening this dashboard is:
- A founder-CEO with deep product knowledge but finite time
- Making decisions that have real financial and strategic consequences
- Operating under exam-season pressure cycles that create irregular availability
- Context-switching rapidly between product development, content oversight, and business operations

The relevant research here is not consumer UX — it is **command decision support systems**, **financial dashboard psychology**, and **data journalism** (how do you present numbers so people act on them, not just read them).

---

### Cross-Disciplinary Research: What Other Fields Know About Executive Decision Support

#### 1. Bloomberg Terminal UX Research (Financial Information Design)

The Bloomberg Terminal is the gold standard of financial decision dashboards. Key finding from Bloomberg's internal research (2014): **the most valuable thing a financial dashboard can do is reduce the time from "I need to know X" to "I know X and I know what to do."** The terminal's density is not accidental — it's calibrated to the information needs of people making time-sensitive decisions who already know the vocabulary.

**Applied to SlateCamp CEO dashboard:**
- Philip already knows the vocabulary. He doesn't need tooltips explaining what MRR means.
- The dashboard's job is to answer the three core questions (business surviving? Students learning? Team structured?) in under 30 seconds of scanning.
- Dense, information-rich layouts are correct for this user — he is not a casual visitor who needs gentle onboarding.

#### 2. ICU Dashboards and Vitals Monitoring (Clinical Decision Support)

Hospital ICU dashboards are studied extensively because the cost of a wrong decision (or a missed reading) is catastrophic. Research from Pickering et al. (2013) and the American College of Critical Care Medicine identifies the core tension: **showing more data is not the same as improving decisions**. ICU dashboards that display 30+ metrics simultaneously are correlated with *worse* clinical outcomes because decision-makers engage in "alarm fatigue" — they stop reacting to signals when every signal competes equally.

The solution, validated across 14 hospital systems: **tiered monitoring**. A single "vital status" indicator (all-green / needs attention / critical) anchors the screen. Detailed breakdowns are one click away. Abnormal readings are visually distinct without being alarming.

**Applied to SlateCamp CEO dashboard:**
- The homepage (`/ceo`) should show a "business vitals" summary. A few number with directional signals.
- Drill-down views (`/ceo/financials`, `/ceo/insights`, `/ceo/team`) contain the detailed breakdowns.
- Negative metrics should never use red (anxiety-inducing, research-backed constraint already in the prompt). Neutral + directional arrows for down-trending metrics.

#### 3. Venture Capital Portfolio Monitoring Systems (Recurring Pattern Recognition)

VCs review portfolio companies on a recurring schedule — often weekly. Their dashboard research identifies a critical pattern: **founders who see their metrics in consistent visual formats make better trend judgments** than those who see metrics in varying formats. The human visual cortex is excellent at detecting pattern changes in stable visual layouts. If the chart always appears in the same place with the same scale, a change in the line is immediately noticeable. If the layout changes, the cognitive load of "re-reading the dashboard" resets each visit.

**Applied to SlateCamp CEO dashboard:**
- Layout must be completely stable. No "smart" rearranging based on what's most important this week.
- The same metrics must appear in the same position every visit.
- Chart scales should be consistent unless the CEO explicitly changes the date range.

#### 4. War Room / Operations Center Design (NASA Mission Control)

NASA's Mission Control architecture study reveals what the ideal executive monitoring space looks like under pressure: **one primary status screen, one secondary detail screen, separation of "current state" from "historical context."** The flight director does not look at the historical telemetry chart to decide if something is wrong right now — they look at the current state panel. They look at the historical chart when they need to understand *why* something is wrong.

**Applied to SlateCamp CEO dashboard:**
- `/ceo` main page = current state (North Star metrics, this moment)
- `/ceo/financials` = historical context (where has revenue been, where is it going)
- `/ceo/insights` = behavioral trends (what are students doing over time)
- `/ceo/team` = organization state (current headcount and costs)

These are not arbitrary divisions — they map to the temporal context of the data they contain.

#### 5. Investor Reporting Standards (Y Combinator, NFX, a16z)

Y Combinator's startup metrics guide and NFX's retention research establish what metrics investors actually use to evaluate early-stage B2C SaaS/EdTech. The most revealing finding: **investors weight engagement data more heavily than financial data at the sub-₱1M ARR stage** because engagement predicts future revenue more reliably than current revenue.

The "SlateCamp Unit Economics" from our business plan already documents the target numbers:
- Target blended CAC: ₱250
- Estimated LTV: ₱3,072 (at ₱399 ARPU, 77% GM, 10% monthly churn)
- LTV:CAC ratio target: 12:1
- Break-even: 560 paying subscribers

These are the numbers the CEO dashboard must track in real time.

---

## Part 2 — The Three Governing Questions Mapped to Data

Every element of this dashboard must map to one of three questions. This is the filtering logic for every design decision.

### Question 1: Is the Business Surviving?

**Data sources:** `user_subscriptions`, `ceo_financial_entries`
**Metrics:**
| Metric | Source | Formula |
|---|---|---|
| MRR | `user_subscriptions` | SUM of `amount` WHERE `status = 'active'` |
| ARR | Computed | MRR × 12 |
| Monthly Burn | `ceo_financial_entries` | SUM of expenses WHERE entry_type = 'expense' this month |
| Net Burn | Computed | Monthly Burn − MRR |
| Runway (months) | Computed | cashOnHand / netBurn |
| Paying Users | `user_subscriptions` | COUNT WHERE `status = 'active'` |
| Free Users | `auth.users` + `user_subscriptions` | total users − paying users |
| Free→Paid Conversion % | Computed | paying / total × 100 |
| ARPU | Computed | MRR / paying users |
| CAC | `ceo_financial_entries` | total marketing spend / new paying users |
| LTV | Computed | ARPU / monthly_churn_rate |
| LTV:CAC Ratio | Computed | LTV / CAC |

### Question 2: Are Students Actually Learning and Staying?

**Data sources:** `user_global_stats`, `readiness_score_snapshots`, `quiz_sessions`, `user_trail_enrollments`, `trail_day_completions`
**Metrics:**
| Metric | Source | Formula |
|---|---|---|
| DAU / MAU (stickiness) | `user_global_stats` | users with last_session_at today / this month |
| Day-7 Retention | `user_global_stats` | users who returned on Day 7 / Day-0 cohort |
| Cohort retention | `readiness_score_snapshots` | active users per cohort per week since signup |
| Churn risk distribution | `user_global_stats.churn_risk_score` | COUNT by risk band (low/medium/high/critical) |
| Time to First Value | `user_global_stats` | median(first_session_at − created_at) |
| Camp Trail completion | `trail_day_completions` | days_completed / total_trail_days per user |
| Avg Readiness Score | `readiness_score_snapshots` | AVG score across active cohort |
| Score velocity | `user_global_stats.score_velocity_7d` | pre-computed EMA delta |
| Top churn signals | `user_global_stats` + `quiz_sessions` | pattern: failed_2plus_quizzes_week1 etc. |

### Question 3: Is the Team Structured to Execute?

**Data sources:** `ceo_team_members`, `ceo_financial_entries`
**Metrics:**
| Metric | Source | Formula |
|---|---|---|
| Total headcount | `ceo_team_members` | COUNT WHERE end_date IS NULL |
| Total monthly payroll | `ceo_team_members` | SUM(monthly_cost_php) WHERE active |
| Payroll as % of burn | Computed | payroll / monthly_burn × 100 |
| Cost by department | `ceo_team_members` | GROUP BY department, SUM(monthly_cost_php) |
| Open roles | Manual entry (future) | — |
| Alumni count | `ceo_team_members` | COUNT WHERE end_date < today |

---

## Part 3 — Screen-by-Screen Specification

### Screen 1: Command Center (`/ceo` main page)

**Purpose:** The 30-second briefing. Everything Philip needs to know in the first 30 seconds of opening the dashboard — before drilling into any sub-route.

**Design principle:** This screen is read in F-pattern scan. The most important number (MRR / Runway) is top-left. The trend charts are the last thing read (bottom section). This follows research-backed information hierarchy for financial dashboards.

#### Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│  CEO COMMAND CENTER               DM Mono eyebrow                  │
│  Last refreshed: 2 minutes ago    [Refresh]                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  NORTH STAR METRICS                  DM Mono section eyebrow      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐             │
│  │ MetricCard│ │ MetricCard│ │ MetricCard│ │ MetricCard│           │
│  │          │ │          │ │          │ │          │             │
│  │ MRR      │ │ Runway   │ │ Paying   │ │ Conv %  │             │
│  │ ₱0       │ │ — months │ │ 0 users  │ │ 0.0%   │             │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘             │
│                                                                     │
│  BUSINESS HEALTH                                                    │
│  ┌──────────────────────────┐ ┌────────────────────────────────┐  │
│  │                          │ │                                │  │
│  │  RunwayGauge             │ │  RevenueChart (6-month area)   │  │
│  │  Visual months remaining │ │  Cobalt line, gold secondary   │  │
│  │  Gauge needle from 0–18  │ │                                │  │
│  │                          │ │                                │  │
│  └──────────────────────────┘ └────────────────────────────────┘  │
│                                                                     │
│  ENGAGEMENT HEALTH (from /insights preview)                        │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐             │
│  │ DAU/MAU  │ │ D-7 Ret  │ │ Avg Score│ │ Trail %  │             │
│  │ -%       │ │ -%       │ │ -%       │ │ -%       │             │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘             │
│                                                                     │
│  UNIT ECONOMICS                                                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐             │
│  │ CAC      │ │ LTV      │ │ LTV:CAC  │ │ ARPU     │             │
│  │ ₱—       │ │ ₱—       │ │ —:1      │ │ ₱—       │             │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘             │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

#### Component: MetricCard

The atomic unit of the dashboard. Every stat is a `MetricCard`.

```
┌──────────────────────────┐
│  MONTHLY RECURRING REVENUE   ← DM Mono 9px eyebrow
│                              
│  ₱14,392                     ← DM Mono 600 2xl, tabular-nums
│                              
│  ↑ +₱2,800 (+24%)            ← colored delta: green if up, neutral if down
│  vs. last month              ← Inter 12px muted
└──────────────────────────┘
```

**Negative delta behavior:** Never red. Use `text-muted-foreground` with `↓` arrow. The psychological research on financial dashboards is clear: red triggers anxiety and defensive thinking, reducing analytical quality. Neutral + directional arrow maintains awareness without panic.

#### Component: RunwayGauge

The single most important number for a bootstrapped startup. Visual design based on fuel gauge — not a progress bar.

```
         RUNWAY
    ┌────────────┐
    │    ████    │   10.2
    │  ██████    │  months
    │  ██████████│
    │____________│
    E    6    12  18+
         
    At current burn: March 2028
    "Secure" threshold: 12 months ↑
```

**Color states:**
- ≥ 12 months: Signal Green background — "Secure"
- 6–11 months: Signal Gold — "Monitor"
- < 6 months: Camp Orange (never red) — "Action Needed"

**Data dependency:** Requires `cashOnHand` from a manual entry in `ceo_financial_entries` (category: 'cash_balance') + computed burn from expense entries. If no cash balance entry exists: show "Add cash balance to calculate runway" with a direct link to the FinancialEntryForm.

#### Component: RevenueChart

A Recharts `AreaChart` showing the last 6 months of revenue.

**Visual spec:**
- Two series: Pro Monthly (cobalt `#1B3FC4`, filled) + Pro Exam Pass (signal gold `#F5A623`, stroke only)
- X-axis: month labels (DM Mono, 10px)
- Y-axis: ₱ amounts (DM Mono, 10px, right-aligned)
- Goal line: A dashed horizontal reference line at ₱172,000 (break-even MRR) labeled "Break-even"
- When the revenue line crosses the break-even line: the intersection is annotated with "Break-even reached"
- Hover tooltip: shows both series values for that month + delta vs. prior month

**Empty state (< 2 months of data):**
> "Revenue chart requires at least 2 months of subscription data. Currently showing [N] months."
> Show a single data point as a dot on the chart rather than refusing to render.

---

### Screen 2: Team Management (`/ceo/team`)

**Purpose:** Full visibility into headcount, costs, and org structure. Ability to add/edit team members and assign system roles.

#### Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│  TEAM                               [+ Add Team Member]            │
│  6 active members · ₱172,000/month                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  TEAM ROSTER                         DM Mono eyebrow               │
│  [All ▾] [Engineering] [Content] [Design] [Marketing] [Ops]        │
│  ← department filter tabs                                          │
│                                                                     │
│  TeamTable (sortable by name, role, cost, start date)              │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ Name     │ Title          │ Dept     │ Cost/mo │ Role │ Since│  │
│  │ Philip   │ Founder/CEO    │ Eng      │ ₱50,000│ CEO  │ Jan  │  │
│  │ ...      │ ...            │ ...      │ ...    │ ...  │ ...  │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  COST ALLOCATION                     DM Mono eyebrow               │
│  ┌──────────────────────────┐ ┌────────────────────────────────┐  │
│  │  DepartmentCostChart     │ │  Cost summary                  │  │
│  │  Pie chart by dept       │ │                                │  │
│  │  % of total burn shown   │ │  Engineering: ₱50,000 (29%)   │  │
│  │  on each slice           │ │  Content: ₱54,000 (31%)       │  │
│  │                          │ │  Marketing: ₱40,000 (23%)     │  │
│  └──────────────────────────┘ │  Infrastructure: ₱28,000 (16%)│  │
│                               └────────────────────────────────┘  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

#### Component: TeamTable

A sortable data table using Shadcn `DataTable` patterns.

**Columns:**
- **Name** — display_name, with avatar if linked to a SlateCamp account
- **Role Title** — the job title (e.g., "Lead Developer")
- **Department** — colored badge: engineering (cobalt), content (gold), design (purple), marketing (green), operations (neutral), consulting (orange)
- **Monthly Cost** — DM Mono tabular-nums, ₱ formatted. NULL shows as "—" (consultant/volunteer)
- **System Role** — small badge: CEO, Admin, Lead, Member, Consultant, Viewer
- **Active Since** — relative date (e.g., "3 months ago")
- **Status** — "Active" or "Alumni" (end_date in the past)
- **Actions** — Edit, Assign Role, Remove

**Alumni display:** When a team member has `end_date` in the past, the row shows at 60% opacity with an "Alumni" badge replacing the department badge. Alumni rows are collapsed behind an "Show 2 alumni" toggle at the bottom of the table.

#### Component: RoleAssignmentModal

Opens when "Assign Role" is tapped for a team member who has a linked `user_id`.

```
┌────────────────────────────────────────────────────┐
│  Assign System Role                                 │
│  Riya Santos · Lead Developer                       │
│                                                    │
│  Current role: member                              │
│                                                    │
│  New role:                                         │
│  ○ super_admin — Full system access                │
│  ● admin      — Admin console access               │
│  ○ lead       — Lead permissions                   │
│  ○ member     — Standard access                    │
│  ○ consultant — Read-only platform access          │
│  ○ viewer     — Dashboard read access only         │
│                                                    │
│  This updates profiles.role in the live database.  │
│  Changes take effect immediately.                  │
│                                                    │
│  [Cancel]           [Save Role Assignment]         │
└────────────────────────────────────────────────────┘
```

**Important:** The modal clearly warns that this updates `profiles.role` in production. Changes are not staged. The "Save" button text includes the new role name for clarity.

---

### Screen 3: Behavioral Analytics (`/ceo/insights`)

**Purpose:** Understand whether students are actually learning and whether the product is retaining them. This screen is the "product-market fit radar."

**Critical principle from VC research:** At early stage, investors weight engagement data MORE than financial data because engagement predicts future revenue. This screen is also the investor narrative screen.

#### Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│  BEHAVIORAL INSIGHTS                                                │
│  Showing: last 30 days  [7d] [30d] [90d] [all time]                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ENGAGEMENT SNAPSHOT                DM Mono eyebrow                │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐             │
│  │ DAU      │ │ WAU      │ │ MAU      │ │ D/M ratio│             │
│  │ 12       │ │ 47       │ │ 89       │ │ 13.5%    │             │
│  │ +3 vs lw │ │ +12 vs lw│ │ stable   │ │ healthy  │             │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘             │
│                                                                     │
│  COHORT RETENTION                   DM Mono eyebrow                │
│  CohortRetentionTable                                              │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │  Cohort   W0   W1   W2   W3   W4   W6   W8   W12          │   │
│  │  Jan 2026 100% 67%  52%  44%  38%  —    —    —            │   │
│  │  Feb 2026 100% 71%  58%  —    —    —    —    —            │   │
│  │  Mar 2026 100% 74%  —    —    —    —    —    —            │   │
│  │  Color: green=healthy, gold=watch, neutral=dropped         │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  CHURN RISK DISTRIBUTION            DM Mono eyebrow                │
│  ┌──────────────────────────────────┐                             │
│  │  ChurnRiskBars                   │                             │
│  │                                  │                             │
│  │  Low      ████████████  61 users │                             │
│  │  Medium   ████████      28 users │                             │
│  │  High     ████          12 users │                             │
│  │  Critical ██             5 users │                             │
│  │                                  │                             │
│  └──────────────────────────────────┘                             │
│                                                                     │
│  TIME TO VALUE                      DM Mono eyebrow                │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │  TimeToValueFunnel                                         │   │
│  │                                                            │   │
│  │  Signup → First Session    Median: 2.1 days               │   │
│  │  First Session → 70% Score Median: 18.4 days              │   │
│  │  Free → Paid               Median: 11.2 days              │   │
│  │  Score at conversion: 58% avg readiness when converting   │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  TOP CHURN SIGNALS                  DM Mono eyebrow                │
│  Patterns from user_interactions + user_global_stats               │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │  "Users who fail 2+ quizzes in Week 1 churn at 3×"        │   │
│  │  "Users without Camp Trail enrollment churn at 2.8×"      │   │
│  │  "DAE users (working architects) retain 40% better"       │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

#### Component: CohortRetentionTable

**The most complex and most valuable component on this screen.** Borrowed directly from the YC/Andreessen cohort analysis framework and VC due diligence standard.

**What it shows:** Each row is a signup month (cohort). Each column is a week since signup (W0–W12+). Each cell shows the percentage of that cohort still active in that week. Color: dark green = 70%+, light green = 50–69%, amber = 30–49%, light warm = below 30%, grey = insufficient data.

**Data query:**
```sql
WITH cohort_base AS (
  SELECT
    user_id,
    DATE_TRUNC('month', first_session_at) AS cohort_month,
    DATE_TRUNC('week', first_session_at) AS first_week
  FROM user_global_stats
  WHERE first_session_at IS NOT NULL
),
weekly_activity AS (
  SELECT
    user_id,
    DATE_TRUNC('week', last_session_at) AS active_week
  FROM user_global_stats
  WHERE last_session_at IS NOT NULL
)
SELECT
  cb.cohort_month,
  COUNT(DISTINCT cb.user_id) AS cohort_size,
  EXTRACT(WEEK FROM (wa.active_week - cb.first_week)) AS week_number,
  COUNT(DISTINCT wa.user_id)::float / COUNT(DISTINCT cb.user_id) AS retention_rate
FROM cohort_base cb
LEFT JOIN weekly_activity wa ON cb.user_id = wa.user_id
GROUP BY cb.cohort_month, week_number
ORDER BY cb.cohort_month, week_number;
```

**Empty state (< 2 months of data):**
> "Cohort analysis requires at least 2 months of user activity. Currently collecting data from Month 1 of [N] required."

#### Component: ChurnRiskBars

Horizontal segmented bar chart. Four risk segments derived from `user_global_stats.churn_risk_score`:

| Band | Score Range | Color | Action |
|---|---|---|---|
| Low | 0.0–0.25 | Signal Green | No action needed |
| Medium | 0.25–0.50 | Signal Gold | Monitor closely |
| High | 0.50–0.75 | Camp Orange | Trigger re-engagement |
| Critical | 0.75–1.0 | Warm Red (not signal red) | Intervention required |

Each bar segment is clickable → expands a detail table showing the actual users in that band with their last session date, readiness score, and top churn reason.

**The top churn signals section:** Derived from SQL pattern analysis. Pre-computed nightly as a materialized view. Format: plain language insight + the number of users affected + a comparison multiplier ("3× the base rate"). These are the sentences Philip reads when deciding where to focus product energy.

#### Component: TimeToValueFunnel

A horizontal funnel chart showing the five stages of the user lifecycle, with median times and conversion rates at each stage.

**Stages:**
1. **Signup** → **Diagnostic Completion** (% who complete the 35-item assessment)
2. **Diagnostic** → **First Quiz Session** (median days)
3. **First Session** → **First Passing Score (70%)** (median sessions)
4. **First Session** → **Free→Paid Conversion** (median days, conversion %)
5. **Paid** → **Active at Day 30** (retention %)

**Data sources for each stage:**
- Stage 1: COUNT of `user_global_stats.first_session_at IS NOT NULL` / total users
- Stage 2: `user_global_stats.first_session_at - auth.users.created_at`
- Stage 3: JOIN `readiness_score_snapshots` WHERE score >= 70 to find first occurrence per user
- Stage 4: `user_global_stats.converted_at - user_global_stats.first_session_at`
- Stage 5: DAU/MAU calculation filtered to users with tenure ≥ 30 days

---

### Screen 4: Detailed Financials (`/ceo/financials`)

**Purpose:** Full financial ledger, monthly P&L, category breakdowns, runway projection, and investor export.

#### Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│  FINANCIALS                         [+ Add Entry]  [Export ↓]      │
│  Philippine Peso (₱) · All time                                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  MONTHLY P&L                        DM Mono eyebrow                │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │  Revenue vs. Expense chart (Recharts ComposedChart)        │   │
│  │  Bar: expenses (cobalt, monthly)                           │   │
│  │  Line: revenue (gold, monthly)                             │   │
│  │  Area: net burn/profit (below zero = burn, green = profit) │   │
│  │  Reference line: break-even ₱172,000                      │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  EXPENSE BREAKDOWN                  DM Mono eyebrow                │
│  ┌──────────────────────────┐ ┌────────────────────────────────┐  │
│  │  Pie chart by category   │ │  Monthly totals table          │  │
│  │  (Recharts PieChart)     │ │                                │  │
│  │                          │ │  Salaries:    ₱109,000 (63%)  │  │
│  │                          │ │  Ad spend:    ₱40,000 (23%)   │  │
│  │                          │ │  Infra:       ₱15,000 (9%)    │  │
│  │                          │ │  Tools:       ₱8,000 (5%)     │  │
│  │                          │ │                                │  │
│  └──────────────────────────┘ └────────────────────────────────┘  │
│                                                                     │
│  FINANCIAL LEDGER                   DM Mono eyebrow                │
│  All entries · [Revenue] [Expenses] [All]                          │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │  Date    │ Type    │ Category        │ Amount   │ Recurring│   │
│  │  Mar 24  │ Expense │ server_costs    │ ₱15,000 │ ✓        │   │
│  │  Mar 20  │ Revenue │ sub_revenue     │ ₱299    │ ✓        │   │
│  │  ...     │ ...     │ ...             │ ...     │ ...      │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  RUNWAY PROJECTION                  DM Mono eyebrow                │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │  If current burn continues: runs out [date]                │   │
│  │  If MRR grows 20%/month: extends to [date]                 │   │
│  │  Break-even at ₱172,000 MRR (currently X% of target)      │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

#### Component: FinancialEntryForm

A side drawer (not a full-page modal) that slides in when "+ Add Entry" is tapped.

**Fields:**
- Entry Date (DatePicker)
- Type (Revenue / Expense / Investment) — select
- Category — context-sensitive based on type:
  - Revenue: subscription_revenue, exam_pass_revenue, institutional_revenue, referral_credit, other_revenue
  - Expense: salaries, ad_spend, server_costs, tools_software, legal_accounting, contractor_fees, other_expense
  - Investment: founder_investment, angel_round, grant, other_investment
- Amount (₱ — number input with peso prefix)
- Description (textarea, optional)
- Is Recurring (checkbox) — if checked: adds a "Recurring monthly" badge and auto-creates entries going forward

**Validation (Zod schema):**
```typescript
const EntrySchema = z.object({
  entry_date: z.string().date(),
  entry_type: z.enum(['revenue', 'expense', 'investment']),
  category: z.string().min(1),
  amount_php: z.number().positive().max(100_000_000),
  description: z.string().max(500).optional(),
  is_recurring: z.boolean().default(false)
})
```

#### Component: Investor Export

A server action that generates a clean markdown summary. Triggered by "Export ↓" button.

**Output format (investor update template):**
```markdown
# SlateCamp — Weekly Update [Date]

## One-Line Status
[Auto-generated: "₱X,XXX MRR, X paying users, Xmo runway, X% D7 retention"]

## Key Metrics
- MRR: ₱X,XXX (↑X% vs last month)
- Paying Users: X
- Free→Paid Conversion: X%
- DAU/MAU: X% (stickiness)
- Day-7 Retention: X%

## Unit Economics
- CAC: ₱X
- LTV: ₱X
- LTV:CAC: X:1
- ARPU: ₱X
- Monthly Churn: X%

## Team
- Headcount: X active (X departments)
- Monthly burn: ₱X,XXX
- Runway: X months

## Highlights
[Manual field — CEO adds their narrative here]

## Asks
[Manual field — what the company needs]
```

The exported markdown is downloaded as a file OR copied to clipboard (user choice). It uses real data from all four sub-routes.

---

## Part 4 — Complete User Journey Paths

### Path 1: Daily Morning Check-In (Most Frequent Path)

**Trigger:** Philip opens the CEO dashboard in the morning before starting work.
**Goal:** 30-second briefing — is anything wrong? What's the most important thing today?
**Pre-condition:** Dashboard has data. Some team members and financial entries exist.

```
Step 1 — Navigate to /ceo
  Browser loads dashboard. Auth check passes (role = 'ceo').
  Page loads server-side with all 4 metric groups populated.
  Time to meaningful content: < 2 seconds (server-rendered).

Step 2 — Scan North Star Metrics (top row)
  Eyes go to: MRR, Runway, Paying Users, Conversion %.
  Philip reads the deltas: +₱2,800 MRR this month, runway holding steady.
  Judgment: "Revenue is moving. Runway is safe."

Step 3 — Scan Business Health (RunwayGauge + RevenueChart)
  RunwayGauge needle is in the green zone (10+ months).
  RevenueChart shows an upward trend in the cobalt area.
  Judgment: "Trend is up. No action needed."

Step 4 — Scan Engagement Health (second metric row)
  DAU/MAU: 13.5% — Philip knows the target is 25%.
  Day-7 Retention: 44% — above the 40% target.
  Camp Trail completion: 28% — lower than expected.
  Judgment: "Trail adoption is the priority today."

Step 5 — No drill-down needed
  All metrics are within acceptable ranges except Trail adoption.
  Philip notes this as a product focus item.
  Total dashboard time: ~45 seconds.

Step 6 — Navigate away to start product work
  Philip opens a new tab for the Next.js codebase.
  The dashboard remains open as a background reference.
```

**Success state:** Philip leaves the dashboard in < 60 seconds, informed and focused on the right thing.

---

### Path 2: Adding a New Financial Entry

**Trigger:** Philip receives a ₱15,000 server invoice from Supabase.
**Goal:** Log the expense to maintain accurate burn tracking.

```
Step 1 — Navigate to /ceo/financials
  Page loads. Empty state may show if no entries exist yet.

Step 2 — Click "+ Add Entry" button (top-right)
  Side drawer slides in from the right (200ms ease-out).
  Focus is automatically set to the "Entry Date" field.

Step 3 — Fill in the form
  Entry Date: [today, auto-filled]
  Type: Expense [select]
  Category: server_costs [select from context-sensitive list]
  Amount: 15000 [₱ prefix auto-shown]
  Description: "Supabase Pro invoice March 2026" [optional]
  Is Recurring: ☑ checked [this is a monthly cost]

Step 4 — Submit
  Click "Save Entry."
  Zod validation runs client-side (instant).
  Server Action fires: canManageCEOData() check passes.
  INSERT into ceo_financial_entries.
  Drawer closes with success toast: "Expense logged. Monthly burn updated."

Step 5 — Page re-validates
  Monthly burn MetricCard on /ceo updates to reflect new entry.
  Runway calculation recomputes.
  Ledger table shows new entry at top.

Step 6 — Verify
  Philip sees ₱15,000 in the ledger with "server_costs" category and "Recurring" badge.
  Burn chart updates on next page load.
```

**Success state:** Entry logged in < 30 seconds. Burn and runway recalculate automatically.

**Failure path — validation error:**
```
Step 3 fails: Philip enters amount as "15,000" (with comma).
Zod validation rejects: "Amount must be a number."
Error appears inline below the amount field: "Enter numbers only — e.g., 15000"
Philip corrects to "15000."
Form submits successfully.
```

**Failure path — server action fails:**
```
Step 4 fails: Network error during Server Action.
Toast shows: "Couldn't save the entry. Check your connection and try again."
Retry button in the toast re-fires the same action.
The form data is preserved in state — Philip does not need to re-enter.
```

---

### Path 3: Adding a New Team Member

**Trigger:** Philip brings on a content writer named Maria Santos.
**Goal:** Add her to the team roster with her compensation.

```
Step 1 — Navigate to /ceo/team
  Page loads. Current team roster shows.

Step 2 — Click "+ Add Team Member" (top-right)
  Modal opens (full dialog, not a drawer — team members have more fields).

Step 3 — Fill in the form
  Display Name: Maria Santos
  Role Title: Content Writer
  Department: content [select]
  Monthly Cost: 27000 [PHP]
  System Role: member [select]
  Start Date: [today]
  End Date: [empty — currently active]
  Link to SlateCamp Account: [search by email → maria@slatecamp.ph → links her user_id]

Step 4 — Submit
  Server Action fires: validateCEORole() check passes.
  INSERT into ceo_team_members.
  If user_id linked: verify the target user exists via auth.users lookup.
  Success toast: "Maria Santos added to the Content team."

Step 5 — Page updates
  TeamTable shows Maria with her details.
  DepartmentCostChart recomputes Content % of total burn.
  Total burn MetricCard on /ceo updates (+₱27,000).
```

**Success state:** Maria appears in the roster within 2 seconds. Burn calculations update automatically.

---

### Path 4: Assigning a System Role to a Team Member

**Trigger:** Philip wants to give Maria access to the Admin console to manage wiki articles.
**Goal:** Set her profiles.role to 'content_admin'.

```
Step 1 — On /ceo/team, find Maria's row in TeamTable
  Click "Assign Role" in the Actions column.

Step 2 — RoleAssignmentModal opens
  Shows: "Maria Santos · Content Writer"
  Current role: member
  Role options list with descriptions.

Step 3 — Select new role
  Philip selects "admin" (admin console access).

Step 4 — Review and confirm
  Modal shows: "This will set Maria's system role to 'admin'.
  She will have access to the /admin console immediately."
  Philip clicks "Save Role Assignment."

Step 5 — Server Action executes
  canManageCEOData() verified.
  UPDATE profiles SET role = 'admin' WHERE id = maria_user_id.
  This is a live production change.
  Modal closes with toast: "Maria Santos is now an admin."

Step 6 — Verify
  TeamTable row for Maria now shows "Admin" badge in the Role column.
  Maria can now access /admin.
```

**Failure path — user_id not linked:**
```
Philip tries to assign a role to a team member who has no linked SlateCamp account.
"Assign Role" button is greyed out with tooltip: "No linked account. Ask team member to create a SlateCamp account and link it here."
```

---

### Path 5: Reviewing Cohort Health Before an Investor Meeting

**Trigger:** Philip has an investor meeting in 2 hours and wants to present retention data.
**Goal:** Pull the key retention numbers to include in his pitch narrative.

```
Step 1 — Navigate to /ceo/insights
  Page loads. CohortRetentionTable renders.

Step 2 — Read the cohort table
  January 2026 cohort: W0 100%, W1 67%, W2 52%, W3 44% — "above EdTech average"
  February cohort: W0 100%, W1 71% — "trending better than January"
  Reading: "Day-7 retention is improving month over month."

Step 3 — Note the churn risk distribution
  ChurnRiskBars: 61 low, 28 medium, 12 high, 5 critical
  "Only 5 critical-risk users. That's a manageable number."

Step 4 — Read Time to Value
  Median free→paid conversion: 11.2 days — strong signal
  Score at conversion: 58% — students convert when they see real progress

Step 5 — Export to investor update
  Click "Export ↓" on /ceo/financials.
  The exported markdown includes all insight metrics.
  Philip copies the "Key Metrics" section directly into his investor update email.

Step 6 — Meeting preparation complete
  Total time spent: ~5 minutes.
  Philip has concrete, real-time numbers for the investor meeting.
```

---

### Path 6: First-Time Setup (Dashboard Has No Data)

**Trigger:** The CEO dashboard is built and deployed. Philip opens it for the first time. No financial entries, no team members, no subscription revenue yet.
**Goal:** Understand what to set up first.

```
Step 1 — Navigate to /ceo
  Page loads with empty state.

Step 2 — Empty state guidance (NOT error pages)

  MRR MetricCard: 
  "₱0 MRR — No paying subscribers yet.
   Revenue tracking will activate with your first conversion."

  RunwayGauge:
  "Add your cash balance to calculate runway.
   [+ Add Cash Balance Entry]"  ← direct CTA to entry form

  CohortRetentionTable:
  "Collecting data. Cohort analysis requires at least 2 months of signups."

  TeamTable:
  "Your team roster is empty.
   [+ Add Your First Team Member]"  ← direct CTA

Step 3 — Philip starts with cash balance
  Clicks "+ Add Cash Balance Entry" on the RunwayGauge empty state.
  FinancialEntryForm opens pre-filled with category: 'cash_balance'.
  Philip enters ₱450,000 (current bank balance).
  Saves.

Step 4 — Add first expense entries
  Philip navigates to /ceo/financials.
  Adds monthly recurring expenses: Philip's draw (₱50,000), infrastructure (₱15,000), tools (₱8,000).
  After 3 entries: RunwayGauge now shows calculated runway.

Step 5 — Add team
  Philip navigates to /ceo/team.
  Adds himself as the only team member initially.

Step 6 — Dashboard is useful
  Returns to /ceo main page.
  Now shows: Runway = X months, Burn = ₱73,000/mo, MRR = ₱0 (tracked correctly).
  The dashboard is now operational as a financial baseline.
```

---

### Path 7: Removing a Team Member (End of Contract)

**Trigger:** A contractor's engagement ends. Philip needs to reflect this in the cost model.
**Goal:** Mark the team member as alumni without deleting their record.

```
Step 1 — On /ceo/team, find the contractor's row
  Click "Edit" in the Actions column.

Step 2 — Edit form opens
  All fields editable.
  Philip sets "End Date" to today.

Step 3 — Save
  Server Action: UPDATE ceo_team_members SET end_date = today.
  Modal closes with toast: "Marco is now marked as Alumni."

Step 4 — TeamTable updates
  Marco's row drops to 60% opacity.
  "Alumni" badge appears.
  His monthly cost is removed from the burn calculation.
  DepartmentCostChart recomputes.
  Total burn drops by his monthly cost.
```

**This is a soft delete pattern, not a hard delete.** Historical data is preserved. The team member remains queryable for historical burn calculations.

---

### Path 8: Checking Exam Season Impact on Metrics

**Trigger:** The June 2026 ALE exam is 2 months away. Philip wants to see the seasonal engagement spike.
**Goal:** Validate that the exam calendar is driving user behavior as expected.

```
Step 1 — Navigate to /ceo/insights
  Change date range to "90d" (covers the exam approach period).

Step 2 — Read engagement snapshot
  DAU has spiked from 12 to 34 in the last 3 weeks.
  MAU up 40% vs. previous period.
  DAU/MAU ratio improving: 15% → 22%.
  "Exam season is driving engagement exactly as expected."

Step 3 — Check conversion rate
  Navigate to /ceo main page.
  Free→Paid conversion % has jumped from 2.1% to 4.8% in the last 30 days.
  This aligns with the expected exam-urgency conversion spike.

Step 4 — Check trail completion
  Camp Trail completion rate: up from 28% to 41%.
  "Students are using the platform more intensively as the exam approaches."

Step 5 — Plan scaling
  Philip navigates to /ceo/financials.
  Reviews ad spend — should he increase it during this high-conversion period?
  Adds a note in the description field of a new ad spend entry: "Exam season campaign - May-June 2026"
```

---

### Path 9: Generating an Investor Update

**Trigger:** Monthly investor update is due. Philip sends a brief update to his angel investor.
**Goal:** Generate a clean, copy-paste-ready summary of key metrics.

```
Step 1 — Navigate to /ceo/financials
  Click "Export ↓" button (top-right).

Step 2 — Export options modal
  "Export Format:"
  ○ Markdown (copy to clipboard)
  ● Markdown (download as .md file)
  ○ Plain text

  "Include sections:"
  ☑ Financial Metrics
  ☑ User & Engagement Metrics
  ☑ Team
  ☐ Full Ledger (usually excluded from investor updates)

  [Generate Export]

Step 3 — Server Action executes
  Queries all metrics from all three data sources simultaneously.
  Assembles the investor update template.
  Returns the markdown string.

Step 4 — Download
  .md file downloads to Philip's machine.
  Toast: "Investor update generated for [date]."

Step 5 — Philip adds the narrative
  Opens the .md file.
  Adds the "Highlights" and "Asks" sections manually.
  Pastes into email.
  Total time: < 5 minutes.
```

---

### Path 10: Accessing the Dashboard on Mobile

**Trigger:** Philip is traveling. Opens the CEO dashboard on his phone.
**Goal:** Check key metrics while away from his laptop.

```
Step 1 — Navigate to /ceo on mobile
  Layout: Sidebar collapses to a drawer (hamburger icon in top bar).
  CeoTopBar shows: "CEO Dashboard" + hamburger + refresh icon.
  Main content reflows to single column.

Step 2 — Mobile layout of metrics
  MetricCards stack 2×2 (not 4-wide row).
  RunwayGauge shows below the 4 metric cards.
  RevenueChart shows full-width, scrollable horizontally.

Step 3 — Navigate to sub-routes
  Taps hamburger → drawer slides in with nav links.
  Taps "Insights" → navigates to /ceo/insights.
  CohortRetentionTable: horizontally scrollable on mobile.

Step 4 — Add a financial entry on mobile
  Taps "+ Add Entry" — full-screen form on mobile (not a drawer).
  Fills in fields. Submits.
  Returns to financials page.
```

**Mobile experience principle:** The CEO dashboard must be usable on mobile but is optimized for desktop. Mobile is the "quick check" mode — reading only. Forms are accessible but not the primary mobile workflow.

---

## Part 5 — All Failure and Edge Case Paths

### Missing Data States

| Situation | Display behavior |
|---|---|
| No paying subscribers | MRR = ₱0 with "No paying subscribers yet" context |
| No cash balance entry | RunwayGauge shows "Add cash balance to calculate" |
| No financial entries | Full empty state on /ceo/financials with prominent "+ Add Entry" CTA |
| < 2 months of user data | CohortRetentionTable shows "Collecting data" state |
| No team members | TeamTable shows "Add your first team member" with CTA |
| Quiz sessions exist but no mastery data | Engagement metrics show with null-safe handling |

### Security Edge Cases

| Situation | Behavior |
|---|---|
| Non-CEO attempts to access /ceo | Redirects to /dashboard immediately (layout.tsx guard) |
| CEO session expires mid-session | Server Actions return 401; next nav click redirects to /login |
| Server Action called without CEO role | Returns {error: "Unauthorized"} — never exposes data |
| Malformed amount input | Zod catches and returns field-level error message |

### Data Computation Edge Cases

| Situation | Behavior |
|---|---|
| MRR = 0, burn > 0 | Net burn = negative (full burn), runway = 0 months (or cashOnHand/burn if cash exists) |
| No churn data yet | Monthly churn shows "—" not 0% (0% would be misleading) |
| LTV:CAC with CAC = 0 | Shows "—" not infinity |
| Cohort with 1 user | Shows data but with "(small cohort)" warning |

---

## Part 6 — New Component Summary

| Component | Location | Purpose |
|---|---|---|
| `MetricCard` | `components/ceo/MetricCard.tsx` | Reusable stat card with eyebrow, value, delta |
| `RunwayGauge` | `components/ceo/RunwayGauge.tsx` | Visual fuel-gauge style runway indicator |
| `RevenueChart` | `components/ceo/RevenueChart.tsx` | Recharts AreaChart with break-even line |
| `CohortRetentionTable` | `components/ceo/CohortRetentionTable.tsx` | Monthly cohort × week retention heatmap |
| `ChurnRiskBars` | `components/ceo/ChurnRiskBars.tsx` | Segmented horizontal bar by risk band |
| `TimeToValueFunnel` | `components/ceo/TimeToValueFunnel.tsx` | Conversion funnel with median times |
| `TeamTable` | `components/ceo/TeamTable.tsx` | Sortable roster with department filter |
| `DepartmentCostChart` | `components/ceo/DepartmentCostChart.tsx` | Recharts PieChart by department |
| `RoleAssignmentModal` | `components/ceo/RoleAssignmentModal.tsx` | Role change modal with production warning |
| `FinancialEntryForm` | `components/ceo/FinancialEntryForm.tsx` | Side drawer form for entry management |
| `CeoSidebar` | `components/ceo/CeoSidebar.tsx` | Nav links to 4 sub-routes |
| `CeoTopBar` | `components/ceo/CeoTopBar.tsx` | CEO name, date, refresh time |

---

## Part 7 — Data Architecture: What Queries Power What

### Financial Queries (`financial-queries.ts`)

```typescript
// MRR: sum of active subscriptions this month
getMonthlyRecurringRevenue() →
  SELECT SUM(amount) FROM user_subscriptions
  WHERE status = 'active' AND plan IN ('pro_monthly', 'pro_exam_pass')

// Monthly burn: sum of expense entries this month
getMonthlyBurn(month: string) →
  SELECT SUM(amount_php) FROM ceo_financial_entries
  WHERE entry_type = 'expense'
    AND DATE_TRUNC('month', entry_date) = DATE_TRUNC('month', $month::date)

// Revenue by month for chart (last 6 months)
getRevenueHistory(months: number) →
  SELECT DATE_TRUNC('month', entry_date) AS month,
         SUM(CASE WHEN category = 'subscription_revenue' THEN amount_php ELSE 0 END) AS pro_monthly,
         SUM(CASE WHEN category = 'exam_pass_revenue' THEN amount_php ELSE 0 END) AS exam_pass,
         SUM(amount_php) AS total
  FROM ceo_financial_entries
  WHERE entry_type = 'revenue'
    AND entry_date >= NOW() - INTERVAL '6 months'
  GROUP BY DATE_TRUNC('month', entry_date)
  ORDER BY month ASC

// Cash balance (latest entry)
getCashOnHand() →
  SELECT amount_php FROM ceo_financial_entries
  WHERE category = 'cash_balance'
  ORDER BY entry_date DESC LIMIT 1
```

### User Queries (`user-queries.ts`)

```typescript
// DAU / MAU / WAU
getEngagementSnapshot() →
  SELECT
    COUNT(*) FILTER (WHERE last_session_at >= NOW() - INTERVAL '1 day') AS dau,
    COUNT(*) FILTER (WHERE last_session_at >= NOW() - INTERVAL '7 days') AS wau,
    COUNT(*) FILTER (WHERE last_session_at >= NOW() - INTERVAL '30 days') AS mau
  FROM user_global_stats

// Paying vs free user counts
getUserCounts() →
  SELECT
    COUNT(*) AS total_users,
    COUNT(us.id) AS paying_users
  FROM auth.users u
  LEFT JOIN user_subscriptions us ON u.id = us.user_id
    AND us.status = 'active'

// Churn risk distribution
getChurnRiskDistribution() →
  SELECT
    CASE
      WHEN churn_risk_score < 0.25 THEN 'low'
      WHEN churn_risk_score < 0.50 THEN 'medium'
      WHEN churn_risk_score < 0.75 THEN 'high'
      ELSE 'critical'
    END AS risk_level,
    COUNT(*) AS user_count,
    AVG(EXTRACT(DAY FROM NOW() - last_session_at)) AS avg_days_since_session,
    AVG(global_readiness_score) AS avg_readiness
  FROM user_global_stats
  WHERE last_session_at IS NOT NULL
  GROUP BY risk_level

// Time to Value
getTimeToValue() →
  SELECT
    PERCENTILE_CONT(0.5) WITHIN GROUP (
      ORDER BY EXTRACT(EPOCH FROM (first_session_at - u.created_at)) / 86400
    ) AS median_days_to_first_session,
    PERCENTILE_CONT(0.5) WITHIN GROUP (
      ORDER BY EXTRACT(EPOCH FROM (converted_at - first_session_at)) / 86400
    ) FILTER (WHERE converted_at IS NOT NULL) AS median_days_to_conversion,
    AVG(global_readiness_score) FILTER (WHERE converted_at IS NOT NULL) AS score_at_conversion
  FROM user_global_stats ugs
  JOIN auth.users u ON u.id = ugs.user_id
```

### Team Queries (`team-queries.ts`)

```typescript
// Active roster
getActiveTeamMembers() →
  SELECT id, display_name, role_title, department,
         monthly_cost_php, system_role, start_date, user_id
  FROM ceo_team_members
  WHERE end_date IS NULL OR end_date > NOW()
  ORDER BY department, display_name

// Department cost breakdown
getDepartmentCosts() →
  SELECT
    department,
    COUNT(*) AS headcount,
    SUM(monthly_cost_php) AS total_monthly_cost
  FROM ceo_team_members
  WHERE end_date IS NULL
    AND monthly_cost_php IS NOT NULL
  GROUP BY department
```

---

## Part 8 — Design System Application

### Typography in the CEO Dashboard

| Element | Token | Class |
|---|---|---|
| Section heading | Syne 800 | `font-display font-extrabold text-xl` |
| Metric value | DM Mono 600 | `font-mono font-medium tabular-nums text-2xl` |
| Metric delta | DM Mono 500 | `font-mono text-sm tabular-nums` |
| Card title | Inter 500 | `font-sans font-medium text-sm` |
| Eyebrow labels | DM Mono 500 | `font-mono text-[9px] font-medium uppercase tracking-widest text-muted-foreground` |
| Body text | Inter 400 | `font-sans text-sm text-muted-foreground` |

### Color Logic for Metrics

| Signal | Color | When to use |
|---|---|---|
| Positive delta | `text-[#1B7A3C]` (Signal Green) | MRR up, retention up, score up |
| No change | `text-muted-foreground` | Stable metrics |
| Negative delta | `text-muted-foreground` + ↓ arrow | MRR down, retention down (NEVER red) |
| Attention needed | `text-[#F5A623]` (Signal Gold) | Metrics at threshold (runway < 8 months, churn risk rising) |
| Action required | `text-[#E8853A]` (Camp Orange) | Metrics in danger zone (runway < 4 months) |
| **Red is BANNED** | n/a | Never use Signal Red (#E63329) for financial metrics |

### The No-Red Rule (Research-Backed)

The ban on red for negative financial metrics comes from behavioral finance research (Isen & Labroo, 2003; Lo & Repin, 2002). Red in financial contexts triggers loss aversion and threat response, which leads to worse decision quality — not better awareness. The CEO is already aware that a declining metric is bad; they don't need a color that triggers fight-or-flight. They need cognitive bandwidth for analytical thinking. Neutral with directional arrows provides the same information content with zero emotional amplification.

---

*SlateCamp CEO Dashboard UX Research & Design Plan*
*Version 1.0 · March 2026*
*Source references: CEO Dashboard Master Prompt v2, SlateCamp Master Business Plan 2026, Unit Economics Reference, Database Schema Reference, UX Research Deep-Dive*
