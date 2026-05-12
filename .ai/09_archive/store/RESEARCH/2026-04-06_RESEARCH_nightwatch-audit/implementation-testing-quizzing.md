# IMPLEMENTATION BLUEPRINT: TESTING & QUIZZING ENGINE
**Generated:** Nightwatch Loop

## 1. Overlap Note

This audit has significant overlap with:
- **audit-database-layer.md** - Massive array exclusion (intelligent-routing.ts), N+1 breadcrumb
- **audit-auth-and-gating.md** - Hostile tier gating (throw new Error)
- **audit-state-management.md** - Timer hydration bug

**Cross-reference:** See implementation-database-layer.md, implementation-auth-and-gating.md, implementation-state-management.md for full details on those fixes.

---

## 2. Unique Items for Testing/Quiz

### New Files (Create)
| File Path | Action | Notes |
|-----------|--------|-------|
| `src/components/quiz/navigation-guard.tsx` | CREATE | beforeunload warning |
| `src/lib/quiz/irt-precision.ts` | CREATE | Adaptive theta learning rate |

---

## 3. The Execution Steps (Micro-Granular - Unique Items Only)

### Step 1: Add Navigation Guard
- **File:** `src/components/quiz/navigation-guard.tsx`
- **Action:** CREATE
- **Logic:**
  ```typescript
  // Show warning when leaving during active session
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (activeSession) {
        e.preventDefault()
        return 'Leave session? Progress will be lost.'
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [activeSession])
  ```

### Step 2: Add IRT Precision Tuning
- **File:** `src/lib/quiz/irt-precision.ts`
- **Action:** CREATE
- **Logic:**
  ```typescript
  // Adaptive learning rate based on session count
  export function getAdaptiveLearningRate(sessionCount: number): number {
    if (sessionCount < 5) return 0.3    // Higher for new users
    if (sessionCount < 20) return 0.15 // Medium for building
    return 0.08                         // Lower for experienced
  }
  ```

---

## 4. Testing

- Test navigation guard appears when leaving active quiz
- Verify IRT precision adjustments in edge cases
