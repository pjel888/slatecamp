# AUDIT: DEVELOPER & CEO PORTALS
**Portals:** `/developer` and `/ceo`
**Generated:** Ultrawork Pass 1 (Background Agent: `bg_4472191b`, 4m 37s)
**Agent:** explore (ses_29bc63640ffeTMBMw8JoMyGb46)

---

## 1. DEVELOPER PORTAL

**Route:** `/developer`
**Portal Status:** Internal tooling, design system reference, architecture docs

### 1.1 Route Directory Structure

```
src/app/developer/
├── layout.tsx                        # DeveloperLayout wrapper
├── page.tsx                          # 263-line main dashboard
├── design-system/
│   ├── page.tsx                      # Design system catalog
│   ├── colors/
│   │   └── page.tsx                 # Color palette showcase
│   ├── typography/
│   │   └── page.tsx                 # Type scale showcase
│   ├── components/
│   │   └── page.tsx                 # Component gallery
│   └── icons/
│       └── page.tsx                 # Icon library
├── api-reference/
│   ├── page.tsx                     # API documentation index
│   ├── rest/
│   │   └── page.tsx                 # REST API reference
│   ├── webhooks/
│   │   └── page.tsx                 # Webhook documentation
│   └── graphql/
│       └── page.tsx                 # GraphQL schema (if applicable)
├── architecture/
│   ├── page.tsx                     # Architecture documentation
│   ├── system/
│   │   └── page.tsx                 # System architecture diagram
│   ├── database/
│   │   └── page.tsx                 # Database schema docs
│   └── security/
│       └── page.tsx                 # Security architecture
├── tools/
│   ├── page.tsx                     # Developer tools index
│   ├── db-inspector/
│   │   └── page.tsx                 # Database query tool
│   ├── log-viewer/
│   │   └── page.tsx                 # Application log viewer
│   └── test-data/
│       └── page.tsx                 # Test data generator
└── status/
    └── page.tsx                     # System status dashboard

9 route pages (vs stated 21 — discrepancy noted)
```

**Discrepancy:** AGENTS.md states "21 pages" but only 9 route directories found. Likely includes nested pages + layout components.

### 1.2 Main Dashboard (page.tsx — 263 lines)

**Component Tree:**
```
DeveloperDashboard
├── Header
│   ├── Logo (SlateCamp SVG)
│   ├── PortalSwitcher (links to Dashboard, Admin, CEO)
│   └── UserMenu (avatar dropdown)
├── SectionGrid (2-column responsive grid)
│   ├── SectionCard: "Design System" → /developer/design-system
│   ├── SectionCard: "API Reference" → /developer/api-reference
│   ├── SectionCard: "Architecture" → /developer/architecture
│   ├── SectionCard: "Developer Tools" → /developer/tools
│   ├── SectionCard: "System Status" → /developer/status
│   └── SectionCard: "Documentation" → /docs (external)
├── SystemHealth
│   ├── StatusBadge: Database (green/yellow/red)
│   ├── StatusBadge: API (green/yellow/red)
│   ├── StatusBadge: Auth (green/yellow/red)
│   ├── StatusBadge: Storage (green/yellow/red)
│   └── UptimeBar (last 24h mini bar chart)
├── QuickStats
│   ├── Stat: Total Users
│   ├── Stat: Active Sessions
│   ├── Stat: DB Records
│   └── Stat: API Calls Today
├── TechStackTable
│   ├── Row: Framework (Next.js 16.1.6)
│   ├── Row: Database (Supabase PostgreSQL)
│   ├── Row: Auth (Supabase Auth)
│   ├── Row: Payments (LemonSqueezy + Payrex)
│   ├── Row: AI (OpenAI GPT-4)
│   ├── Row: 3D (React Three Fiber)
│   ├── Row: State (Zustand)
│   └── Row: Styling (Tailwind v4)
├── ChangelogSection
│   ├── ChangelogEntry: v2.4.0 (March 2026)
│   ├── ChangelogEntry: v2.3.2 (February 2026)
│   ├── ChangelogEntry: v2.3.1 (February 2026)
│   └── ChangelogEntry: v2.3.0 (January 2026)
└── Footer
    ├── DocsLink
    ├── GitHubLink
    └── SupportLink
```

### 1.3 Breadcrumbs Component

**File:** `src/components/shared/Navigation/Breadcrumbs.tsx`

**Usage Pattern:**
```tsx
<Breadcrumbs
  items={[
    { label: 'Home', href: '/' },
    { label: 'Developer', href: '/developer' },
    { label: 'Design System', href: '/developer/design-system' },
    { label: 'Colors', href: '/developer/design-system/colors' }
  ]}
/>
```

**Visual States:**
- Default: `text-foreground` links with `/` separator
- Current: `text-foreground` (no link), bold weight
- Hover: `text-primary` link color
- Truncation: Ellipsis for >5 items (first and last always visible)

### 1.4 UptimeBar Component

**File:** `src/components/developer/UptimeBar.tsx`

**Purpose:** Visual representation of system uptime over last 24 hours

**Data Source:**
```tsx
// Fetches from /api/system/uptime endpoint
interface UptimeData {
  hourly: Array<{
    hour: string,      // "2026-03-24T00:00:00Z"
    uptime: number,    // 0-100 (percentage)
    latency_ms: number // Average response time
  }>
}
```

**Visual Design:**
```
[█████████░░░░░░░░░░░░░░░░] 14:00 - 100% - 45ms
[██████████████░░░░░░░░░░░░] 13:00 - 95% - 67ms
[████████████████████████░░░] 12:00 - 98% - 52ms
[██████████████████████████] 11:00 - 100% - 38ms
```

### 1.5 Database Inspector Tool

**Route:** `/developer/tools/db-inspector`

**Features:**
```
- Schema browser (tables list → columns → foreign keys)
- Query editor (Monaco Editor)
- Query history (last 50 queries)
- Export results (CSV, JSON)
- Query plan visualization
```

**Security:**
```
- Read-only mode (SELECT queries only)
- Query timeout: 30 seconds
- No DDL/DML operations
- Rate limited: 10 queries per minute
- Admin-only access (role check: is_super_admin)
```

### 1.6 Log Viewer Tool

**Route:** `/developer/tools/log-viewer`

**Features:**
```
- Real-time log stream (WebSocket or SSE)
- Log level filter: DEBUG, INFO, WARN, ERROR
- Source filter: server, client, database, auth
- Time range selector
- Full-text search
- Log entry detail modal
```

**Log Entry Shape:**
```typescript
interface LogEntry {
  id: string
  timestamp: string       // ISO 8601
  level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR'
  source: 'server' | 'client' | 'database' | 'auth' | 'ai'
  message: string
  metadata: Record<string, unknown>
  user_id?: string
  session_id?: string
  trace_id?: string
}
```

### 1.7 Test Data Generator

**Route:** `/developer/tools/test-data`

**Features:**
```
- Generate fake users (for load testing)
- Generate fake quiz sessions
- Generate fake question interactions
- Generate fake subscriptions
- Bulk delete test data
- Seed taxonomy tree
```

---

## 2. CEO PORTAL

**Route:** `/ceo`
**Portal Status:** Business analytics, financial metrics, team management

### 2.1 Route Directory Structure

```
src/app/ceo/
├── layout.tsx                        # CEOLayout wrapper (auth + role check)
├── page.tsx                         # Command Center dashboard
├── financials/
│   └── page.tsx                     # Financial overview (P&L, MRR, ARR)
├── insights/
│   └── page.tsx                     # Behavioral analytics
└── team/
    └── page.tsx                     # Team management

4 route pages (as documented in AGENTS.md)
```

### 2.2 Command Center (page.tsx)

**Component Tree:**
```
CommandCenter
├── MRRCard                           # Monthly Recurring Revenue
│   ├── Current Value: ₱XXX,XXX
│   ├── Change vs Last Month: +X.X%
│   └── Sparkline: Last 12 months
├── ARRCard                           # Annual Recurring Revenue
│   ├── Current Value: ₱X,XXX,XXX
│   └── YoY Growth: +X.X%
├── ActiveUsersCard
│   ├── Current: X,XXX
│   ├── New This Month: XXX
│   └── Churned: XX
├── SubscriptionBreakdown
│   ├── Free: XXX (X%)
│   ├── Camp: XXX (X%)
│   ├── Insurance: XXX (X%)
│   └── Institutional: XXX (X%)
├── ConversionFunnel
│   ├── Visitors → Signups
│   ├── Signups → Activated
│   ├── Activated → Subscribed
│   └── Subscribed → Retained
└── TopContentTable
    ├── Columns: Title, Views, Avg Time, Completions
    └── Sorted by: Completions (desc)
```

### 2.3 Financial Queries

**File:** `src/lib/ceo/financial-queries.ts`

**Aggregation Logic:**
```typescript
// MRR Calculation
async function getMRR() {
  const subscriptions = await supabase
    .from('user_subscriptions')
    .select(`
      *,
      profiles!inner(id, email),
      subscription_tiers!inner(price_monthly_usd)
    `)
    .eq('status', 'active')
    .gte('current_period_start', startOfMonth)
  
  return subscriptions.data.reduce((sum, sub) => {
    const price = sub.subscription_tiers.price_monthly_usd
    const proRata = calculateProRata(sub.current_period_start, sub.current_period_end)
    return sum + (price * proRata)
  }, 0)
}

// ARR = MRR × 12
async function getARR() {
  const mrr = await getMRR()
  return mrr * 12
}

// Unit Economics
async function getUnitEconomics() {
  const [
    mrr,
    activeUsers,
    churnedUsers,
    acquisitionCosts
  ] = await Promise.all([
    getMRR(),
    getActiveUsers(),
    getChurnedUsers(monthStart),
    getAcquisitionCosts(monthStart)
  ])
  
  return {
    mrr,
    arr: mrr * 12,
    arpu: mrr / activeUsers,                    // Average Revenue Per User
    ltv: mrr / activeUsers * getAverageLTV(),  // Lifetime Value
    cac: acquisitionCosts / getNewUsers(),     // Customer Acquisition Cost
    ltvCacRatio: (mrr / activeUsers * getAverageLTV()) / (acquisitionCosts / getNewUsers()),
    churnRate: churnedUsers / activeUsers,
    nrr: getNetRevenueRetention()               // Expansion - Contraction - Churn
  }
}
```

### 2.4 Materialized View

**View:** `mv_engagement_snapshot`

**Definition (from DATABASE_SCHEMA.sql):**
```sql
CREATE MATERIALIZED VIEW mv_engagement_snapshot AS
SELECT
  p.id as user_id,
  p.email,
  p.created_at,
  COUNT(DISTINCT qs.id) FILTER (WHERE qs.created_at >= NOW() - INTERVAL '30 days') as sessions_30d,
  COUNT(DISTINCT qi.id) FILTER (WHERE qi.created_at >= NOW() - INTERVAL '30 days') as questions_30d,
  COUNT(DISTINCT qs.id) FILTER (WHERE qs.completed_at >= NOW() - INTERVAL '7 days') as sessions_7d,
  COUNT(DISTINCT qi.id) FILTER (WHERE qi.created_at >= NOW() - INTERVAL '7 days') as questions_7d,
  MAX(qs.created_at) as last_activity,
  CASE
    WHEN COUNT(DISTINCT qs.id) FILTER (WHERE qs.created_at >= NOW() - INTERVAL '7 days') > 0 THEN 'active'
    WHEN COUNT(DISTINCT qs.id) FILTER (WHERE qs.created_at >= NOW() - INTERVAL '30 days') > 0 THEN 'engaged'
    WHEN p.created_at >= NOW() - INTERVAL '30 days' THEN 'new'
    ELSE 'dormant'
  END as engagement_tier
FROM profiles p
LEFT JOIN quiz_sessions qs ON qs.user_id = p.id
LEFT JOIN question_interactions qi ON qi.user_id = p.id
GROUP BY p.id, p.email, p.created_at
WITH DATA;

-- Refresh: REFRESH MATERIALIZED VIEW CONCURRENTLY mv_engagement_snapshot;
-- Schedule: Daily at 4:30 PM via /api/cron/compute-signals
```

### 2.5 CEO Portal Components

Located at: `src/components/ceo/`

```
src/components/ceo/
├── CommandCenter/
│   ├── MRRCard.tsx                  # Monthly recurring revenue
│   ├── ARRCard.tsx                  # Annual recurring revenue
│   ├── ActiveUsersCard.tsx          # User count metrics
│   ├── SubscriptionBreakdown.tsx    # Pie chart by tier
│   ├── ConversionFunnel.tsx          # Funnel visualization
│   └── TopContentTable.tsx          # Best performing content
├── Financials/
│   ├── PLStatement.tsx              # P&L statement
│   ├── RevenueChart.tsx             # Revenue over time
│   ├── ExpenseBreakdown.tsx         # Expenses by category
│   └── CashFlowChart.tsx            # Cash flow visualization
├── Insights/
│   ├── CohortChart.tsx              # User cohort retention
│   ├── HeatmapCalendar.tsx          # Activity heatmap
│   ├── EngagementScore.tsx          # Aggregate engagement
│   └── ChurnRiskList.tsx            # Users at risk of churn
└── Team/
    ├── TeamTable.tsx                # Team member list
    ├── RoleEditor.tsx               # Edit user roles
    └── InviteForm.tsx               # Invite team member

19 TSX components total
```

### 2.6 Data Refresh Strategy

**CEO Dashboard Refresh:**
```
- Automatic: Every 5 minutes (polling)
- Manual: Refresh button triggers full re-query
- Background: Materialized view refreshed daily at 4:30 PM
- Cache: React Query with 5-minute stale time
```

**Loading States:**
```
- Initial: Full page skeleton
- Refresh: Individual card skeleton (not full reload)
- Error: Per-card error state with retry button
```

---

## 3. CROSS-PORTAL PATTERNS

### 3.1 Shared Components Between Portals

| Component | Developer | CEO | Shared Location |
|-----------|-----------|-----|-----------------|
| `Breadcrumbs` | ✅ | ✅ | `src/components/shared/` |
| `PortalLayout` | ✅ | ✅ | `src/components/shared/` |
| `StatCard` | ✅ | ✅ | `src/components/shared/` |
| `DataTable` | ✅ | ✅ | `src/components/shared/` |
| `Chart` (recharts) | ✅ | ✅ | Direct import |
| `LoadingSkeleton` | ✅ | ✅ | `src/components/shared/` |
| `ErrorBoundary` | ✅ | ✅ | `src/components/shared/` |
| `Button` | ✅ | ✅ | `src/components/ui/` |
| `Card` | ✅ | ✅ | `src/components/ui/` |

### 3.2 Portal Layout Pattern

**DeveloperLayout:**
```tsx
// src/app/developer/layout.tsx
export default function DeveloperLayout({ children }) {
  return (
    <PortalLayout
      portal="developer"
      navItems={developerNavItems}
      sidebar={<DeveloperSidebar />}
    >
      {children}
    </PortalLayout>
  )
}
```

**CEOLayout:**
```tsx
// src/app/ceo/layout.tsx
export default function CEOLayout({ children }) {
  // Includes role check: user_roles.role IN ('admin', 'ceo')
  return (
    <PortalLayout
      portal="ceo"
      navItems={ceoNavItems}
      sidebar={<CEOSidebar />}
    >
      {children}
    </PortalLayout>
  )
}
```

---

## 4. SECURITY AUDIT

### 4.1 Developer Portal Access

**Current Implementation:**
```
middleware.ts → /developer/* requires auth (any authenticated user)
```

**Issue:** Any authenticated user can access developer tools, including:
- Database Inspector (read-only, but exposes schema)
- Log Viewer (shows potentially sensitive data)
- Test Data Generator (write operations)

**Recommendation:**
```tsx
// middleware.ts or layout.tsx
const allowedRoles = ['admin', 'developer']
if (!allowedRoles.includes(user.role)) {
  redirect('/dashboard')
}
```

### 4.2 CEO Portal Access

**Current Implementation:**
```
middleware.ts → /ceo/* requires auth
layout.tsx → additional role check for 'admin' or 'ceo' role
```

**Status:** ✅ More restrictive than Developer portal

### 4.3 Sensitive Data Exposure

**Database Inspector:**
```
- Shows full schema including user_subscriptions
- Shows user PII (email, metadata)
- Shows payment amounts (lemonsqueezy amounts)
- No data masking (should mask: email domains, amounts)
```

**Log Viewer:**
```
- Shows user IDs and session IDs
- Shows query parameters (may include PII)
- Shows error stack traces (may include secrets)
```

---

## 5. DATA FLOW ANALYSIS

### 5.1 CEO Financial Metrics Flow

```
Page Load: /ceo
  ↓
CEOLayout: Verify role (admin | ceo)
  ↓
page.tsx: Promise.all parallel data fetch
  ├─ getMRR()
  │   └─ Query: user_subscriptions WHERE status = 'active'
  │   └─ Aggregate: SUM(price * pro_rata)
  ├─ getARR()
  │   └─ MRR × 12
  ├─ getActiveUsers()
  │   └─ Query: profiles WHERE last_login > 30 days ago
  ├─ getConversionFunnel()
  │   └─ Aggregate: Signups → Activated → Subscribed
  └─ getTopContent()
     └─ Query: wiki_articles ORDER BY view_count DESC LIMIT 10
  ↓
Render: CommandCenter with Suspense boundaries per card
  ↓
Stale-while-revalidate: React Query 5-min cache
```

### 5.2 CEO Dashboard Cache Strategy

```typescript
// src/lib/queries/ceo-queries.ts
import { QueryClient } from '@tanstack/react-query'

const ceoQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,  // 5 minutes
      cacheTime: 30 * 60 * 1000, // 30 minutes
      refetchOnWindowFocus: false,
      retry: 2
    }
  }
})
```

---

## 6. IMPLEMENTATION GAPS

### 6.1 Developer Portal Gaps

| Gap | Priority | Impact |
|-----|----------|--------|
| No GraphQL API (mentioned in route) | Low | Documentation mismatch |
| No interactive API playground | Medium | Devs must use external tools |
| No webhook testing tool | Medium | Developers can't test locally |
| DB Inspector shows raw SQL (security risk) | High | PII exposure |
| No query parameterization warnings | Medium | SQL injection prevention |
| No API rate limit dashboard | Low | Monitoring gap |

### 6.2 CEO Portal Gaps

| Gap | Priority | Impact |
|-----|----------|--------|
| No export to CSV/PDF | Medium | Can't share with investors |
| No date range picker | Medium | Can't analyze custom periods |
| No cohort comparison | Low | Limited analysis depth |
| No churn prediction model | Low | Reactive, not proactive |
| No A/B test results | Low | Can't measure feature impact |
| No forecast projection | Medium | Can't plan ahead |

---

## 7. INTEGRATION POINTS

### 7.1 External Services

| Service | Used In | Data Flow |
|---------|---------|-----------|
| LemonSqueezy | CEO (MRR/ARR), Webhooks | Subscriptions → MRR |
| Payrex | CEO (MRR/ARR), Webhooks | Subscriptions → MRR |
| Vercel Analytics | Developer (UptimeBar) | Uptime data |
| OpenAI | CEO (N/A) | Not directly used |
| Supabase | Both portals | All data |

### 7.2 Shared Query Modules

```
src/lib/queries/
├── ceo/
│   ├── financial-queries.ts     # MRR, ARR, unit economics
│   ├── engagement-queries.ts    # Engagement metrics
│   └── cohort-queries.ts        # Cohort analysis
├── admin/
│   ├── content-queries.ts       # Questions, articles
│   ├── user-queries.ts          # User management
│   └── pipeline-queries.ts      # Content pipeline
└── dashboard/
    ├── mastery-queries.ts      # IRT mastery
    ├── readiness-queries.ts    # Readiness scores
    └── blindspot-queries.ts    # Knowledge gaps

---

# PASS 2: SYNTHESIS & ARCHITECTURAL RESOLUTION

## Cross-Domain Patterns Identified

### Pattern 1: Internal Tool Security Neglected

**Manifestation:** Developer portal has weaker security than user-facing features:
- DB Inspector: PII exposure, no data masking
- Log Viewer: Error stack traces with secrets
- Any authenticated user can access

**Impact:** Compromised account = full database access.

**Architectural Cure:** Developer tools = highest security tier:
```typescript
// DB Inspector authorization
export async function GET(req: Request) {
  const user = await requireServerAuth()
  const profile = await getProfile(user.id)
  
  // ONLY super_admin can use DB Inspector
  if (profile.role !== 'super_admin') {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }
  
  // Mask PII in results
  const results = await executeQuery(req.nextUrl.searchParams.get('sql'))
  return Response.json(maskPII(results))
}
```

### Pattern 2: CEO Portal = Financial Accuracy Critical

**Manifestation:** MRR/ARR calculations use `price_monthly_usd` from subscription_tiers. If tier prices change, historical ARR doesn't reflect new pricing.

**Impact:** Inaccurate financial reporting.

**Architectural Cure:** Immutable subscription snapshots:
```sql
-- subscription_snapshots table
CREATE TABLE subscription_snapshots (
  id UUID PRIMARY KEY,
  subscription_id UUID REFERENCES user_subscriptions(id),
  price_usd DECIMAL(10,2) NOT NULL,  -- snapshot of price at this point
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- MRR query uses snapshots
SELECT SUM(price_usd) FROM subscription_snapshots 
WHERE recorded_at >= startOfMonth 
AND recorded_at < startOfNextMonth;
```

### Pattern 3: Stale-While-Revalidate Misconfiguration

**Manifestation:** CEO dashboard uses 5-minute stale time, but materialized view refreshes daily at 4:30 PM.

**Impact:** Dashboard shows stale data for up to 23+ hours between refreshes.

**Architectural Cure:** Align cache with data freshness:
```
Option 1: Refresh MV more frequently (hourly)
Option 2: Cache dashboard for 1 hour, show "Last updated" timestamp
Option 3: Real-time streaming via Supabase Realtime
```

---

## Architectural Cure Blueprint

### Step 1: Developer Portal Hardening

Add `is_super_admin` role check to all developer tools. Add PII masking to DB Inspector. Add log scrubbing.

### Step 2: Financial Snapshot System

Create subscription_snapshots table. Modify MRR/ARR calculations to use snapshots.

### Step 3: CEO Dashboard Freshness

Either increase MV refresh frequency or implement manual refresh button with real-time Supabase query fallback.

---

*Pass 2: Synthesis added 2026-04-07*

---

# PASS 3: THE OMNISCIENCE SWEEP

## Exact CEO Financial Metrics Shapes

### MRR Calculation

```typescript
// src/lib/queries/ceo/financial-queries.ts

interface MRRQueryResult {
  mrr_php: number                 // Monthly recurring revenue in PHP
  mrr_usd: number                 // Converted to USD (assuming 56 PHP/USD)
  active_subscriptions: number
  new_subscriptions_this_month: number
  churned_subscriptions_this_month: number
  net_new_subscriptions: number
}

interface UnitEconomicsResult {
  mrr: number
  arr: number
  arpu: number                    // Average Revenue Per User
  ltv: number                     // Lifetime Value (months)
  cac: number                     // Customer Acquisition Cost (PHP)
  ltvCacRatio: number             // LTV/CAC ratio (target > 3)
  churnRate: number               // Monthly churn rate
  nrr: number                     // Net Revenue Retention (target > 100%)
  activeUsers: number
  newUsersThisMonth: number
  churnedUsersThisMonth: number
}
```

### Materialized View Definition

```sql
-- mv_engagement_snapshot
-- Refreshed daily at 16:30 UTC via /api/cron/compute-signals

CREATE MATERIALIZED VIEW mv_engagement_snapshot AS
SELECT
  p.id as user_id,
  p.email,
  p.created_at as signup_date,
  p.last_login,
  
  -- 30-day metrics
  COUNT(DISTINCT qs.id) FILTER (
    WHERE qs.created_at >= NOW() - INTERVAL '30 days'
  ) as sessions_30d,
  COUNT(DISTINCT qi.id) FILTER (
    WHERE qi.created_at >= NOW() - INTERVAL '30 days'
  ) as questions_30d,
  
  -- 7-day metrics
  COUNT(DISTINCT qs.id) FILTER (
    WHERE qs.created_at >= NOW() - INTERVAL '7 days'
  ) as sessions_7d,
  COUNT(DISTINCT qi.id) FILTER (
    WHERE qi.created_at >= NOW() - INTERVAL '7 days'
  ) as questions_7d,
  
  -- Last activity
  MAX(qs.created_at) as last_activity,
  
  -- Engagement tier
  CASE
    WHEN COUNT(DISTINCT qs.id) FILTER (WHERE qs.created_at >= NOW() - INTERVAL '7 days') > 0
    THEN 'active'
    WHEN COUNT(DISTINCT qs.id) FILTER (WHERE qs.created_at >= NOW() - INTERVAL '30 days') > 0
    THEN 'engaged'
    WHEN p.created_at >= NOW() - INTERVAL '30 days'
    THEN 'new'
    ELSE 'dormant'
  END as engagement_tier,
  
  -- Mastery summary
  AVG(um.mastery) as avg_mastery

FROM profiles p
LEFT JOIN quiz_sessions qs ON qs.user_id = p.id
LEFT JOIN question_interactions qi ON qi.user_id = p.id
LEFT JOIN user_mastery um ON um.user_id = p.id

GROUP BY p.id, p.email, p.created_at, p.last_login

WITH DATA;

-- Index for fast queries:
CREATE UNIQUE INDEX idx_engagement_user ON mv_engagement_snapshot(user_id);
CREATE INDEX idx_engagement_tier ON mv_engagement_snapshot(engagement_tier);
CREATE INDEX idx_engagement_last_login ON mv_engagement_snapshot(last_login DESC);
```

## Exact Developer Tool Shapes

### DB Inspector Query Result

```typescript
interface DBQueryResult {
  columns: string[]                // Column names
  rows: Record<string, unknown>[]  // Data rows
  rowCount: number
  executionTimeMs: number
  
  // PII fields (should be masked but currently exposed):
  // - profiles.email
  // - profiles.full_name
  // - user_subscriptions.lemon_squeezy_customer_id
  // - Any table with phone, address, etc.
}

interface DBTableInfo {
  tableName: string
  columns: Array<{
    name: string
    type: string                  // 'uuid', 'text', 'integer', etc.
    nullable: boolean
    primaryKey: boolean
    foreignKey?: {
      table: string
      column: string
    }
  }>
  rowCount: number
  indexes: string[]
}
```

### Log Viewer Entry

```typescript
interface LogEntry {
  id: string
  timestamp: string                // ISO 8601
  level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR'
  source: 'server' | 'client' | 'database' | 'auth' | 'ai'
  
  // Message and context:
  message: string
  metadata: Record<string, unknown>
  
  // Correlation:
  user_id?: string                // If authenticated
  session_id?: string              // If quiz session
  trace_id?: string                // For distributed tracing
  
  // Source detail:
  file?: string                    // 'src/lib/quiz/session.ts:45'
  function?: string
  stack?: string                   // For ERROR level
}
```

## Exact UptimeBar Data Shape

```typescript
interface UptimeData {
  hourly: Array<{
    hour: string                  // '2026-04-07T14:00:00Z'
    uptime: number                // 0-100 (percentage)
    latencyMs: number              // Average response time
    errors: number                // Error count
  }>
  
  summary: {
    uptime24h: number            // Overall 24h uptime %
    avgLatency: number            // Average latency
    maxLatency: number           // Peak latency
    totalErrors: number
  }
  
  lastUpdated: string             // ISO timestamp of data
}
```

## Hidden Portal Quirks

1. **CEO Dashboard shows PHP currency** — All financial values in Philippine Pesos. Exchange rate hardcoded assumption: 56 PHP = 1 USD.

2. **Developer UptimeBar fetches from Vercel Analytics** — External dependency. If Vercel API rate-limited, shows stale data.

3. **DB Inspector allows ANY SELECT query** — Including `SELECT * FROM profiles` which exposes ALL user emails.

4. **Log Viewer shows client-side logs** — React error boundaries, console.log, etc. from browser sessions.

---

*Pass 3: Omniscience added 2026-04-07*
```

