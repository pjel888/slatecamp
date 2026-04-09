# IMPLEMENTATION BLUEPRINT: SHARED COMPONENTS
**Generated:** Nightwatch Loop

## 1. Target File Matrix

### UI Component Files (Modify)
| File Path | Action | Notes |
|-----------|--------|-------|
| `src/components/ui/sheet.tsx` | EXPAND | Add keyboard nav + aria-modal |
| `src/components/ui/tooltip.tsx` | EXPAND | Add keyboard nav + aria-describedby |
| `src/components/ui/skeleton.tsx` | EXPAND | Add aria-busy + dimensions match |
| `src/components/shared/mastery-chart.tsx` | EXPAND | Add role="status" + aria-live |
| `src/app/globals.css` | EXPAND | Add z-index registry |

### New Files (Create)
| File Path | Action | Notes |
|-----------|--------|-------|
| `src/lib/components/archive.tsx` | CREATE | Archive unused UI components |
| `src/lib/components/animation-utils.css` | CREATE | Centralize animation classes |

### Configuration Files (Modify)
| File Path | Action | Notes |
|-----------|--------|-------|
| `src/app/globals.css` | EXPAND | Add z-index tokens |

---

## 2. Dependency Prerequisites

1. **No database migrations required**
2. **No external NPM packages required** - use existing accessibility utilities
3. **Testing:** Run `bun run build` after changes to verify no bundle regressions

---

## 3. The Execution Steps (Micro-Granular)

### Step 1: Add ARIA to Sheet Component
- **File:** `src/components/ui/sheet.tsx`
- **Action:** ADD aria-modal + keyboard handling
- **Logic Required:**
  ```typescript
  // In SheetContent component:
  <DialogContent
    // Add accessibility
    aria-describedby={undefined} // if no description
    role="dialog"
    aria-modal="true"
    // Add keyboard handling
    onKeyDown={(e) => {
      if (e.key === 'Escape') {
        // close sheet
      }
      // Arrow key support for content navigation
    }}
  />
  ```

### Step 2: Add Keyboard Navigation to Tooltip
- **File:** `src/components/ui/tooltip.tsx`
- **Action:** ADD keyboard support
- **Logic Required:**
  ```typescript
  // In TooltipContent:
  <TooltipContent
    role="tooltip"
    aria-describedby={triggerId} // link to trigger
    onKeyDown={(e) => {
      if (e.key === 'Escape') {
        // close tooltip
      }
      // Arrow keys to navigate between multiple tooltips
    }}
  />
  ```

### Step 3: Add aria-busy to Skeleton
- **File:** `src/components/ui/skeleton.tsx`
- **Action:** ADD accessibility attributes
- **Logic Required:**
  ```typescript
  // Add to Skeleton component:
  <div
    role="status"
    aria-busy="true"
    aria-live="polite"
    className={cn('animate-pulse', className)}
  >
    <span className="sr-only">Loading...</span>
    {/* existing content */}
  </div>
  ```

### Step 4: Add Status Role to MasteryChart
- **File:** `src/components/shared/mastery-chart.tsx` (or similar)
- **Action:** ADD accessibility
- **Logic Required:**
  ```typescript
  // Wrap chart with:
  <div
    role="status"
    aria-live="polite"
    aria-atomic="true"
  >
    {/* Chart content */}
  </div>
  ```

### Step 5: Add Z-Index Registry to globals.css
- **File:** `src/app/globals.css`
- **Action:** ADD z-index tokens
- **Logic Required:**
  ```css
  /* Add to :root */
  --z-dropdown: 100;
  --z-sticky: 200;
  --z-fixed: 300;
  --z-modal-backdrop: 400;
  --z-modal: 500;
  --z-popover: 600;
  --z-tooltip: 700;
  --z-toast: 800;
  ```

### Step 6: Create Animation Utilities
- **File:** `src/lib/components/animation-utils.css`
- **Action:** CREATE central animation classes
- **Logic Required:**
  ```css
  /* animation-utils.css */
  .animate-fade-in {
    animation: fadeIn 150ms ease-out forwards;
  }
  
  .animate-slide-up {
    animation: slideUp 200ms ease-out forwards;
  }
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes slideUp {
    from { transform: translateY(10px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  
  /* Add to globals.css import */
  @import './animation-utils.css';
  ```

### Step 7: Fix Skeleton-Dashboard Layout Match
- **File:** `src/components/shared/skeletons.ts` or `PageSkeleton`
- **Action:** VERIFY skeleton dimensions match actual content
- **Logic Required:**
  - Measure actual dashboard cards, sections
  - Update skeleton widths/heights to match pixel-perfect
  - This prevents CLS (Cumulative Layout Shift)

### Step 8: Add Toast Queue Management
- **File:** `src/components/ui/toast.tsx` or toast wrapper
- **Action:** ADD dismiss all functionality
- **Logic Required:**
  ```typescript
  // Add to toast store/context:
  dismissAll: () => void
  
  // In Toaster component:
  <Button 
    variant="ghost" 
    size="sm" 
    onClick={() => toast.dismissAll()}
  >
    Dismiss all
  </Button>
  ```

### Step 9: Archive Unused Components
- **File:** Create `src/components/ui/archive/` directory
- **Action:** MOVE unused components to archive
- **Logic Required:**
  - Identify unused: InputOTP, Resizable, Menubar, Calendar (verify with grep)
  - Move to archive: `src/components/ui/archive/input-otp.tsx` etc.
  - Document in `ARCHIVE_README.md` why archived and how to restore

---

## 4. Testing & Validation Protocol

### Manual Verification
1. **Screen Reader Test:** Use NVDA/VoiceOver to navigate Sheet, Tooltip, Skeleton
2. **Keyboard Test:** Tab through all interactive components, verify Escape closes modals
3. **CLS Test:** Compare skeleton loading vs actual content - no layout shift

### Automated Checks
```bash
# Run accessibility audit
# (Would require axe-core or similar)

# Run build to verify no regressions
bun run build

# Check bundle size
du -sh .next
```

---

## 5. Rollback Strategy

### If Accessibility Changes Break
- **Revert specific file:** `git checkout HEAD~1 -- src/components/ui/sheet.tsx`
- **Test:** Verify sheet still works without ARIA additions

### If Z-Index Causes Overlay Issues
- **Revert globals.css:** Remove new z-index tokens
- **Debug:** Check which component's z-index conflicts

---

## 6. Implementation Notes

### Key Files Referenced
- `src/components/ui/sheet.tsx` - needs keyboard nav + aria
- `src/components/ui/tooltip.tsx` - needs keyboard nav
- `src/components/ui/skeleton.tsx` - needs aria-busy
- `src/components/shared/mastery-chart.tsx` - needs role="status"
- `src/app/globals.css` - add z-index registry

### Success Criteria
1. Screen readers can navigate Sheet, Tooltip, Skeleton components
2. Keyboard-only users can close Sheet and Tooltip with Escape
3. No CLS when Skeleton transitions to actual content
4. Toast queue has "Dismiss All" option
5. Unused UI components are archived (smaller bundle)