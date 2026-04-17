# Drills Performance Remediation Plan

**Source Audit:** `2026-04-08-drills-ux-performance-audit.md`
**Status:** COMPLETE
**Executed:** 2026-04-08

---

## All Completed Fixes

### Priority 1: SlideToSubmit Gesture Reliability (Section 1)
- [x] **1.2** `pointer: { capture: true }` on useDrag — root cause of "nothing happens"
- [x] **1.1** Reduced `touch-none` nesting 3→2 layers
- [x] **1.3** ResizeObserver + drag guard for `trackWidth=0`
- [x] **1.4** `onPointerCancel` on GestureCaptureZone

### Priority 2: submitAnswer Hot Path (Section 7)
- [x] **7.1** Parallelized auth+client and session+question fetch

### Priority 3: Quiz Store Persist (Section 2)
- [x] **2.1** Removed `questions` from `partialize`

### Priority 4: Session Creation (Section 3)
- [x] **3.3** `.limit(1000)` on recentInteractions
- [x] **3.5** Parallelized breadcrumb map + session insert

### Priority 5: Modal A11y & UX (Section 5)
- [x] **5.2** `window.location.href` → `router.push()`
- [x] **5.3** `rounded-xl` → `rounded-md` on card
- [x] **5.4** Raw div modal → `<Dialog>` (focus trap, Escape, ARIA)
- [x] **5.6** Inline style → `className="bg-background"`
- [x] **5.7** Stale useMemo dep removed

### Priority 6: Shell UX Polish (Section 4)
- [x] **4.1** Mode label + count in loading skeleton
- [x] **4.2** Null guard for `currentQuestion`, removed `!` assertions

### Priority 7: Routing Optimization (Section 6)
- [x] **6.3/6.1** Proportional `perChunkLimit`, removed internal shuffle

---

## Identity-Lock Verification
All SlideToSubmit visual properties preserved per `identity_preservation_lock.md`.

## Deferred (Needs Architecture Discussion)
- 3.1 — Sequential taxonomy tree traversal (recursive CTE RPC)
- 3.2 — Taxonomy caching layer
- 3.4 — Duplicate interaction fetch
- 6.2 — JS-side filtering above 100 interactions
- 6.4 — `any` types in routing
