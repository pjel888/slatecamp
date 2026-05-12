# IMPLEMENTATION BLUEPRINT: DEVELOPER & CEO PORTALS
**Generated:** Nightwatch Loop

## 1. Target File Matrix

### Developer Portal (Modify)
| File Path | Action | Notes |
|-----------|--------|-------|
| `src/app/developer/layout.tsx` | EXPAND | Add super_admin role check |
| `src/app/developer/tools/db-inspector/page.tsx` | EXPAND | Add PII masking |
| `src/app/developer/tools/log-viewer/page.tsx` | EXPAND | Add log scrubbing |

### CEO Portal (Modify)
| File Path | Action | Notes |
|-----------|--------|-------|
| `src/app/ceo/layout.tsx` | VERIFY | Verify role check exists |
| `src/lib/queries/ceo/financial-queries.ts` | EXPAND | Add subscription snapshots |

### New Files (Create)
| File Path | Action | Notes |
|-----------|--------|-------|
| `supabase/migrations/NEW_subscription_snapshots.sql` | CREATE | Snapshot table |
| `src/lib/admin/db-mask.ts` | CREATE | PII masking utility |

---

## 2. The Execution Steps (Micro-Granular)

### Step 1: Add Super Admin Check to Developer Portal
- **File:** `src/app/developer/layout.tsx`
- **Action:** ADD role verification
- **Logic:**
  ```typescript
  // Verify user has super_admin or developer role
  const { data: role } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .in('role', ['super_admin', 'developer'])
    .maybeSingle()

  if (!role) redirect('/dashboard')
  ```

### Step 2: Add PII Masking to DB Inspector
- **File:** `src/lib/admin/db-mask.ts`
- **Action:** CREATE masking utility
- **Logic:**
  ```typescript
  // Mask email domains, phone numbers, addresses
  export function maskPII(results: any[]) {
    return results.map(row => ({
      ...row,
      email: row.email?.replace(/(.{2})(.*)(@.*)/, '$1***$3'),
      phone: row.phone?.replace(/\d(?=\d{4})/g, '*'),
    }))
  }
  ```

### Step 3: Add Log Scrubbing
- **File:** `src/app/developer/tools/log-viewer/page.tsx`
- **Action:** ADD scrubbing for secrets
- **Logic:**
  ```typescript
  // Remove sensitive data from logs
  const scrubLog = (log: LogEntry) => ({
    ...log,
    message: log.message.replace(/token=[\w-]+/g, 'token=***'),
    metadata: JSON.stringify(log.metadata).replace(
      /"(password|secret|key)":\s*"[^"]*"/g,
      '"$1": "***"'
    )
  })
  ```

### Step 4: Create Subscription Snapshots Table
- **File:** `supabase/migrations/NEW_subscription_snapshots.sql`
- **Action:** CREATE
- **SQL:**
  ```sql
  CREATE TABLE subscription_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id UUID REFERENCES user_subscriptions(id),
    price_usd DECIMAL(10,2) NOT NULL,
    price_php DECIMAL(10,2) NOT NULL,
    recorded_at TIMESTAMPTZ DEFAULT NOW()
  );

  CREATE INDEX idx_sub_snapshots_date ON subscription_snapshots(recorded_at);
  ```

### Step 5: Align CEO Dashboard Cache with MV Refresh
- **File:** `src/app/ceo/page.tsx`
- **Action:** ADD "Last updated" timestamp
- **Logic:**
  ```typescript
  // Show when data was last refreshed
  <div className="text-sm text-muted-foreground">
    Last updated: {lastRefreshed.toLocaleString()}
    <Button onClick={refreshData}>Refresh</Button>
  </div>
  ```

---

## 3. Testing

- Test DB Inspector with non-super_admin → should deny access
- Test PII masking on email field → should show `jo***@email.com`
- Verify CEO shows refresh timestamp
