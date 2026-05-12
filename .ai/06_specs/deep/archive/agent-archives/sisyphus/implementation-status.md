> OBSOLETE as of 2026-04-05. This file contains pre-reconciliation performance and inventory notes that no longer match the current source tree.

# SlateCamp Master Implementation Plan

> **Status:** Implementation Roadmap
> **Updated:** 2026-04-05
> **Purpose:** Unified implementation tasks, dead code audit, and execution roadmap

---

## 1. Document History

| Source Document | Status | Key Findings |
|----------------|--------|--------------|
| `component_organization_plan.md` | ✅ MERGED | Dead code, duplicates, boundary violations |
| `performance-audit/*` | ✅ MERGED | useSubjectTree, QuadrantOverlay, ScoreDisplay adoption |
| `QUIZ-TESTING-AUDIT.md` | ✅ MERGED | Quiz modes, UX flow, state management |

---

## 2. Dead Code Audit (60 Files Verified)

### 2.1 Dashboard Dead Components (9 files)
| File | Reason |
|------|--------|
| `dashboard/ResultsSummary.tsx` | Zero consumers |
| `dashboard/QuestionReviewList.tsx` | Only consumed by dead ResultsSummary |
| `dashboard/ResultsActions.tsx` | Only consumed by dead ResultsSummary |
| `dashboard/StatCards.tsx` | Only consumed by dead ResultsSummary |
| `dashboard/ScoreHero.tsx` | Only consumed by dead ResultsSummary |
| `dashboard/CustomSessionBuilder.tsx` | Zero consumers |
| `dashboard/LockedScoreWidget.tsx` | Zero consumers |
| `dashboard/OnboardingStateCard.tsx` | Zero consumers |
| `dashboard/QuickReviewModal.tsx` | Zero consumers |

### 2.2 Testing Dead Components (14 files)
**Hub (6 dead):**
- testing/hub/DoseBanner.tsx
- testing/hub/InProgressBanner.tsx
- testing/hub/SmartSuggestionCard.tsx
- testing/hub/WelcomeCard.tsx
- testing/hub/ZoneSection.tsx
- testing/hub/SRSection.tsx

**Session (8 dead):**
- testing/session/CampSessionBehavior.tsx ⚠️ AMBIGUOUS
- testing/session/ChillSessionBehavior.tsx
- testing/session/ErrorTaxonomyPrompt.tsx
- testing/session/FirstTimeTooltip.tsx
- testing/session/NavigatorOverlay.tsx
- testing/session/SessionShell.tsx
- testing/session/StormSessionBehavior.tsx
- testing/session/StormTimerBar.tsx

**Note:** Some testing/session components are re-exported in `testing/session/index.ts` but NOT used by quiz-v2 routes (they redirect to `/quiz/*`).

### 2.3 Analytics Dead Components (4-5 files)
| File | Why Dead |
|------|----------|
| analytics/ErrorPatternCard.tsx | Zero consumers |
| analytics/MemoryStrengthCard.tsx | Zero consumers |
| analytics/MemoryStrengthQuadrant.tsx | Only dead consumer |
| analytics/AnalyticsSummaryBar.tsx | Only dead consumer |
| analytics/SummarySection.tsx | Verify - may be dead |

### 2.4 Shared Dead Components (3 files)
- shared/QuickActionsBar.tsx - Zero consumers
- shared/StandardInfoPopover.tsx - Zero consumers
- shared/TodayActionCard.tsx - Zero consumers

---

## 3. Component Line Counts (Verified)

| Component | Lines | Status |
|-----------|-------|--------|
| SessionShell.tsx | 610 | UNCHANGED - monolithic |
| SessionsTable.tsx | 464 | UNCHANGED - bypasses data-table |
| ReviewHub.tsx | 338 | UNCHANGED |
| DebriefLayout.tsx | 324 | UNCHANGED |
| TimelineHeatmap.tsx | 267 | UNCHANGED - needs memoization |
| MemoryStrengthQuadrant.tsx | 291 | UNCHANGED - inline quadrant logic |
| QuickReviewModal.tsx | 360 | UNCHANGED |
| SubjectMasteryCard.tsx | 356 | UNCHANGED |
| SubjectDrillSelector.tsx | 310 | Reduced from 335 |
| SubjectPracticeSelector.tsx | 4 | ✅ FIXED - re-exports DrillSelector |
| HeroCommandBar.tsx | 308 | UNCHANGED - custom ring |
| QuadrantOverlay.tsx | 80 | ✅ NEW - created but not integrated |
| useSubjectTree.ts | 70 | ✅ NEW - created |

---

## 4. Implementation Tasks

### Task 1: Integrate QuadrantOverlay (HIGH PRIORITY)
**Status:** PENDING | **Priority:** High | **Est. LOC Reduction:** ~150 lines

**Files to Modify:**
- `src/components/analytics/MemoryStrengthQuadrant.tsx` (291 LOC)
- `src/components/analytics/PacingAccuracy.tsx` (205 LOC)
- `src/components/analytics/DifficultyMasteryScatter.tsx` (202 LOC)

**Problem:** `QuadrantOverlay.tsx` exists (85 LOC) but NOT integrated. Three scatter charts have duplicate inline `Dot` and `Tooltip` logic.

**Solution:**
1. Import `QuadrantOverlay` from `@/components/analytics/QuadrantOverlay`
2. Remove duplicate dot/tooltip components
3. Pass appropriate quadrant labels

---

### Task 2: Move useSubjectTree to Hooks Folder
**Status:** PENDING | **Priority:** Medium | **Est. Effort:** 2 files

**Files to Modify:**
- Move: `src/components/dashboard/useSubjectTree.ts` → `src/hooks/useSubjectTree.ts`
- Update: `src/components/dashboard/SubjectDrillSelector.tsx` (import path)

**Problem:** useSubjectTree exists in components/dashboard instead of standard hooks location.

---

### Task 3: Extract HeroCommandBar Readiness Ring
**Status:** PENDING | **Priority:** Medium | **Est. LOC Reduction:** ~110 lines

**Files to Modify:**
- `src/components/dashboard/HeroCommandBar.tsx` (lines 60-170)
- `src/components/shared/score-display.tsx` (267 LOC - already exists!)

**⚠️ CRITICAL: Color Scheme Mismatch**
- **HeroCommandBar:** red <40%, amber <70%, green ≥70%
- **ScoreDisplay:** gray <40%, gray <70%, emerald ≥70% (NEVER red)

**Decision Required:**
- Option A: Create `ReadinessRing` with dark-mode colors
- Option B: Update HeroCommandBar to match ScoreDisplay colors
- Option C: Extend ScoreDisplay with dark-mode variant

---

### Task 4: ScoreDisplay Adoption
**Status:** PENDING | **Priority:** Medium | **Est. LOC Reduction:** ~200+ lines

**Problem:**
- ScoreDisplay exists (267 LOC) with ring, bar, pill, number variants
- Only **6 files** import ScoreDisplay
- **90+ places** manually implement score displays

**Solution:** Replace manual implementations with ScoreDisplay component

---

### Task 5: SessionsTable Should Use DataTable
**Status:** PENDING | **Priority:** Medium

**Files:**
- `src/components/testing/hub/SessionsTable.tsx` (464 LOC)
- `src/components/shared/data-table.tsx` (already exists!)

**Problem:** SessionsTable manually implements filtering, sorting, pagination instead of using existing data-table component.

---

### Task 6: TimelineHeatmap Rendering Optimization
**Status:** PENDING | **Priority:** Medium

**File:**
- `src/components/analytics/TimelineHeatmap.tsx` (267 LOC)

**Problem:** Recomputes `visibleWeeks`, clones rows, rebuilds `cells` array on every render. For 50+ weeks, this allocates thousands of new objects per prop change.

**Solution:** Wrap computation in useMemo with proper dependencies, add React.memo to cell components.

---

## 5. Summary Checklist

| Task | Status | Files | Action |
|------|--------|-------|--------|
| 1. QuadrantOverlay Integration | ⬜ Pending | 4 analytics charts | Import & integrate |
| 2. useSubjectTree Move | ⬜ Pending | 2 files | Move & update imports |
| 3. HeroCommandBar Ring | ⬜ Pending | 1-2 files | Extract to shared component |
| 4. ScoreDisplay Adoption | ⬜ Pending | 90+ files | Replace manual implementations |
| 5. SessionsTable data-table | ⬜ Pending | 1 file | Use existing data-table |
| 6. TimelineHeatmap memo | ⬜ Pending | 1 file | Add useMemo |

---

## 6. Execution Dependencies

- **Tasks 1-3:** Independent, can run in parallel
- **Task 4:** Depends on Task 3 (need shared component first)
- **Tasks 5-6:** Independent

**Recommended Order:**
1. Execute Tasks 1, 2, 3 in parallel
2. Then execute Task 4 (depends on Task 3's shared component)
3. Then execute Tasks 5, 6 in parallel

---

## 7. Verification Commands

```bash
# Type check
bun run type-check

# Lint
bun run lint

# Build
bun run build

# Count manual score displays
grep -r "tabular-nums" src/ --include="*.tsx" | wc -l

# Verify no SubjectDrillSelector imports
grep -r "SubjectDrillSelector" src/ --include="*.tsx" | grep -v "re-export"
```

---

## 8. Recent Audit Closures

### Data Layer and Caching Audit

**Status:** IMPLEMENTED

**Completed on:** 2026-04-05

**Closed items:**
- Quiz background hydration path fixed and verified.
- Dashboard secondary waterfall removed by promoting dependent reads to shared promises.
- Dashboard cache tag invalidation verified for quiz mutations.

---

*See MASTER-ARCHITECTURE.md for architecture details and MASTER-STATUS.md for current project status.*
