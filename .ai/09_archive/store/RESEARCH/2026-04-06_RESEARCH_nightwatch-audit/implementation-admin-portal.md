# IMPLEMENTATION BLUEPRINT: ADMIN PORTAL
**Generated:** Nightwatch Loop

## 1. Target File Matrix

### Admin Files (Modify)
| File Path | Action | Notes |
|-----------|--------|-------|
| `src/app/admin/layout.tsx` | REWRITE | Server-side auth check |
| `src/lib/admin/roles.ts` | EXPAND | Add requireAdmin helper |
| `src/app/api/admin/*/route.ts` | EXPAND | Add role checks |
| `src/lib/actions/admin/content.ts` | EXPAND | Add idempotency keys |

### Database (Create)
| File Path | Action | Notes |
|-----------|--------|-------|
| `supabase/migrations/NEW_pipeline_state.sql` | CREATE | Add version column + state machine |

---

## 2. The Execution Steps (Micro-Granular)

### Step 1: Server-Side Auth in Admin Layout
- **File:** `src/app/admin/layout.tsx`
- **Action:** REWRITE to use server auth
- **Logic:** Replace localStorage check with supabase.auth.getUser()

### Step 2: Add requireAdmin Helper
- **File:** `src/lib/admin/roles.ts`
- **Action:** EXPAND
- **Logic:**
  ```typescript
  export async function requireAdmin() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')
    // Check user_roles table
  }
  ```

### Step 3: Add Idempotency to Admin Actions
- **File:** `src/lib/actions/admin/content.ts`
- **Action:** ADD idempotency keys
- **Logic:** Generate UUID on form mount, pass via header

### Step 4: Add Version Column for Optimistic Locking
- **File:** `supabase/migrations/NEW_pipeline_state.sql`
- **Action:** CREATE
- **SQL:** Add `version` column to questions, taxonomy_nodes

### Step 5: Implement Pipeline State Machine
- **File:** `src/lib/admin/pipeline.ts`
- **Action:** CREATE
- **Logic:** Typed state transitions (draft → review → published)

---

## 3. Testing

- Test admin access with non-admin user → should redirect
- Test double-click on save → should not create duplicates