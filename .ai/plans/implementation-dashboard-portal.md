# IMPLEMENTATION BLUEPRINT: DASHBOARD PORTAL
**Generated:** Nightwatch Loop

## 1. Target File Matrix

### Dashboard Page Files (Modify)
| File Path | Action | Notes |
|-----------|--------|-------|
| `src/app/dashboard/page.tsx` | REWRITE | Replace Promise.all with Suspense boundaries |
| `src/app/dashboard/layout.tsx` | MODIFY | Ensure all contexts mounted together |
| `src/components/dashboard/analytics-sync.tsx` | EXPAND | Add visibility API guard |

### New Files (Create)
| File Path | Action | Notes |
|-----------|--------|-------|
| `src/lib/actions/get-dashboard-data.ts` | CREATE | Unified dashboard data with Promise.allSettled |

---

## 2. The Execution Steps (Micro-Granular)

### Step 1: Replace Promise.all with Suspense Boundaries
- **File:** `src/app/dashboard/page.tsx`
- **Action:** REWRITE to use per-section Suspense
- **Logic Required:**
  ```typescript
  // BEFORE: Promise.all([getUser(), getDashboardData(), ...])
  // AFTER: Per-component Suspense
  
  <div className="grid">
    <Suspense fallback={<HeroSkeleton />}>
      <HeroSection />
    </Suspense>
    
    <Suspense fallback={<HeatmapSkeleton />}>
      <HeatmapSection />
    </Suspense>
    
    <Suspense fallback={<ActivitySkeleton />}>
      <ActivityFeed />
    </Suspense>
  </div>
  ```

### Step 2: Create Unified Dashboard Data Action
- **File:** `src/lib/actions/get-dashboard-data.ts`
- **Action:** CREATE with Promise.allSettled
- **Logic Required:**
  ```typescript
  export async function getDashboardData() {
    const results = await Promise.allSettled([
      getUser(),
      getDashboardStats(),
      getHeatmapData(),
      getActivityData(),
      getStreakData()
    ])
    
    // Transform results to handle failures gracefully
    return results.map(r => 
      r.status === 'fulfilled' ? r.value : null
    )
  }
  ```

### Step 3: Add Visibility API Guard to Analytics
- **File:** `src/components/dashboard/analytics-sync.tsx`
- **Action:** ADD visibility check
- **Logic Required:**
  ```typescript
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        trackEvent('dashboard_view')
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [])
  ```

### Step 4: Verify Context Shell in Dashboard Layout
- **File:** `src/app/dashboard/layout.tsx`
- **Action:** VERIFY all 5 contexts mounted together
- **Logic Required:**
  - Check TierProvider, DisciplineProvider, ActiveSessionProvider, NoteProvider, BreadcrumbProvider all present
  - If missing, add DashboardProviderShell wrapper

### Step 5: Dynamic Import for 3D Lab
- **File:** `src/app/dashboard/3d-lab/page.tsx`
- **Action:** ADD dynamic import
- **Logic Required:**
  ```typescript
  import dynamic from 'next/dynamic'
  
  const LabViewer = dynamic(() => import('@/components/3d-lab/LabViewer'), {
    ssr: false,
    loading: () => <LabSkeleton />
  })
  ```

---

## 3. Testing & Validation

- Run `bun run build` to verify bundle size reduction
- Test dashboard with disabled JS - Suspense should show skeletons