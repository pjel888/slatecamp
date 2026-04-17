# SlateCamp — Testing Strategy & Acceptance Protocol
## What Gets Tested, How, and When
### 2026-03-26

---

## Purpose

The SRS disconnection bug — a critical defect where spaced repetition stopped functioning across all 7 testing modes — shipped to production undetected. This document exists to prevent that class of failure from recurring. It defines which features get automated tests, which get manual QA checklists, and what the "done" definition is before any feature moves from development to production.

---

## Testing Tiers

### Tier 1: Automated Tests (MANDATORY)

These features are too critical to rely on manual verification. A regression here silently degrades the product for every user.

| System | What to Test | Why |
|---|---|---|
| **Mastery pipeline** | `user_interactions` INSERT → `user_node_mastery` update (EMA) | Core learning loop. Silent failure = scores frozen. |
| **SRS wiring** | `saveTestingInteraction()` → `deriveQualityRating()` → `updateSrsSchedule()` | This exact bug already shipped once. |
| **IRT selection** | `selectNextQuestion()` returns question with P(correct) ≈ 0.75 | Already has tests — keep them passing. |
| **Readiness Score computation** | Overall score + sub-scores per subject | Feature 5 depends on this. Silent failure = empty sub_scores forever (again). |
| **RLS policies** | Each new table's policies (user can see own, cannot see others) | Security. Cannot be manually tested reliably at scale. |
| **Payment webhooks** | LemonSqueezy webhook → subscription status update | Revenue. Silent failure = paying users don't get Pro access. |
| **Auth guards** | Admin routes reject non-admin users | Security. Already has known bugs (admin routes missing auth). |

**Test framework:** Use whatever is already configured (likely Vitest or Jest). If no test framework exists, install Vitest (fastest, native ESM support, works with Next.js).

**Test file convention:**
```
src/lib/srs/__tests__/quality.test.ts
src/lib/srs/__tests__/update.test.ts
src/lib/srs/__tests__/irt.test.ts
src/lib/actions/__tests__/testing.test.ts
```

#### Example: SRS Wiring Test (Prevents the Exact Bug That Shipped)

```typescript
// src/lib/actions/__tests__/testing-srs-wiring.test.ts
import { describe, it, expect, vi } from 'vitest'

// This test verifies the WIRING — that saveTestingInteraction calls SRS functions.
// It does NOT test the SRS algorithm itself (that has its own tests).

describe('saveTestingInteraction SRS wiring', () => {
  it('calls deriveQualityRating after recording interaction', async () => {
    const mockDeriveQuality = vi.fn().mockReturnValue(4)
    const mockUpdateSchedule = vi.fn().mockResolvedValue(undefined)

    // Mock the SRS module
    vi.mock('@/lib/srs/quality', () => ({
      deriveQualityRating: mockDeriveQuality
    }))
    vi.mock('@/lib/srs/update', () => ({
      updateSrsSchedule: mockUpdateSchedule
    }))

    // Call saveTestingInteraction with a correct answer
    await saveTestingInteraction({
      userId: 'test-user',
      questionId: 'test-question',
      is_correct: true,
      time_spent_ms: 15000,
      confidence_level: 'high',
      lucky_guess_flag: false
    })

    // CRITICAL ASSERTION: SRS functions were called
    expect(mockDeriveQuality).toHaveBeenCalledOnce()
    expect(mockUpdateSchedule).toHaveBeenCalledWith(
      'test-user',
      'test-question',
      4 // quality rating
    )
  })

  it('does not crash session if SRS update fails', async () => {
    vi.mock('@/lib/srs/update', () => ({
      updateSrsSchedule: vi.fn().mockRejectedValue(new Error('SRS failed'))
    }))

    // Should NOT throw — SRS failure must be caught
    await expect(
      saveTestingInteraction({ /* ... */ })
    ).resolves.not.toThrow()
  })
})
```

#### Example: Sub-Scores Pipeline Test (Prevents Feature 5 Regression)

```typescript
// src/lib/__tests__/sub-scores-pipeline.test.ts
describe('readiness score sub-scores computation', () => {
  it('computes sub-scores for all 8 ALE subjects', async () => {
    // Set up: user with mastery data across multiple subjects
    // Call: the trigger function or its extracted logic
    // Assert: sub_scores JSONB contains all 8 keys
    // Assert: no key has value '{}'
    // Assert: grey nodes count as 0.0, not excluded
  })

  it('excludes cross-reference-only nodes', async () => {
    // Assert: nodes with is_cross_ref_only = true are NOT in the average
  })

  it('excludes deprecated nodes', async () => {
    // Assert: nodes with deprecated_at IS NOT NULL are NOT in the average
  })
})
```

---

### Tier 2: Integration Smoke Tests (Run Before Every Deploy)

These aren't full test suites — they're quick checks that the critical paths haven't broken.

```bash
# smoke-test.sh — run before every deploy
#!/bin/bash
set -e

echo "🔨 Building..."
bun run build

echo "🔍 Type checking..."
npx tsc --noEmit

echo "🧪 Running unit tests..."
bun test

echo "✅ All smoke tests passed"
```

Add to `package.json`:
```json
{
  "scripts": {
    "predeploy": "bash smoke-test.sh"
  }
}
```

---

### Tier 3: Manual QA Checklists (Per Feature)

For UI features where automated testing is expensive relative to the risk, use manual checklists. Each feature's checklist lives in this document.

#### QA Checklist Template

```
## Feature: [Name]
## Date tested: ___
## Tested by: ___

### Happy Path
- [ ] [Primary user action] → [Expected result]
- [ ] [Secondary action] → [Expected result]

### Edge Cases
- [ ] Empty state (no data) → [Shows empty state message, not error]
- [ ] Error state (network failure) → [Shows error message, not crash]
- [ ] Loading state → [Shows skeleton, not blank screen]
- [ ] Mobile viewport → [Responsive, no overflow]

### Security
- [ ] Unauthenticated user cannot access → [Redirects to /login]
- [ ] User cannot see other users' data → [Only own data visible]

### Forbidden Words (Retaker-Facing Features Only)
- [ ] Search entire UI for: fail, failed, failure, retry, retake, retaker, try again, what went wrong, better luck, don't give up
- [ ] None found → PASS
```

---

### Feature-Specific QA Checklists

#### Phase 1: SRS Wiring Fix (Roadmap §1.1)

```
## Feature: SRS Wiring into Testing Flow
## Acceptance Criteria:

- [ ] Complete a Camp Mode session → verify srs_schedules table has updated rows
- [ ] Complete a Storm Mode session → verify same
- [ ] Complete a Blindspot session → verify same
- [ ] Complete a Chill Mode session → verify same
- [ ] Complete a Focus Review session → verify same
- [ ] Complete a Custom session → verify same
- [ ] Complete a Simulation session → verify same
- [ ] SRS failure does not crash the session (test: temporarily break SRS function, run session)
- [ ] Verify via SQL:
      SELECT * FROM srs_schedules WHERE user_id = '{test_user}' ORDER BY updated_at DESC LIMIT 10;
      -- Should show recently updated rows matching answered questions
```

#### Phase 1: IRT Wiring (Roadmap §1.2)

```
## Feature: IRT Adaptive Question Selection

- [ ] New session questions cluster around student's ability level
- [ ] User theta updates after session completion
- [ ] Verify via SQL:
      SELECT theta FROM user_global_stats WHERE user_id = '{test_user}';
      -- Should be non-zero after completing sessions
- [ ] Questions are NOT ordered by simple mastery_weight ASC anymore
```

#### Feature 5: Subject Floor Alert

```
## Feature: Subject Floor Alert

### Pipeline (DB level)
- [ ] Complete a quiz session → check readiness_score_snapshots
      SELECT sub_scores FROM readiness_score_snapshots
      WHERE user_id = '{user}' ORDER BY created_at DESC LIMIT 1;
      -- sub_scores should NOT be '{}'
- [ ] Sub-scores contain all 8 ALE subject keys
- [ ] Grey (unstarted) nodes count as 0.0 in averages

### Alert UI
- [ ] User with a subject below 50% sees alert ABOVE readiness score card
- [ ] Alert is non-dismissible (no X button, no dismiss action)
- [ ] Alert text matches copy template exactly
- [ ] CTA routes to Subject Mode for the flagged subject
- [ ] Multiple subjects below 50% → each gets its own alert row
- [ ] User with all subjects above 50% → no alert visible
- [ ] Signal Red background, white text
- [ ] Threshold reads from disciplines.subject_floor_pct, not hardcoded

### Readiness Score Card Update
- [ ] Card shows per-subject breakdown table
- [ ] Subject below 50% highlighted in Signal Red
- [ ] Subject scores match sub_scores from latest snapshot
```

#### Feature 2: Retaker Onboarding

```
## Feature: Retaker-Specific Onboarding

### Branching
- [ ] "Is this your first time?" appears after account creation
- [ ] "Yes, first time" → existing onboarding (unchanged)
- [ ] "I've reviewed before" → retaker branch
- [ ] profiles.reviewer_type set to 'returning_reviewer'

### Retaker Branch Screens
- [ ] Welcome screen headline: "Welcome back. More data, better strategy."
- [ ] Previous gaps question is OPTIONAL (can skip)
- [ ] Selecting gap subjects → seeds user_node_mastery with Red state
- [ ] Target exam date step works identically to first-timer
- [ ] Proof Simulation offered on Day 1 (no 70% gate)

### Downstream Propagation
- [ ] Campfire retaker channel visible to returning reviewers
- [ ] Campfire retaker channel NOT visible to first-time users
- [ ] exam_attempt_number = 2 (or higher) in user_global_stats

### 🔴 FORBIDDEN WORDS CHECK
- [ ] Grep entire retaker branch code for forbidden words:
      grep -rni "fail\|retry\|retake\|retaker\|try again\|went wrong\|better luck\|don't give up" \
        src/components/onboarding/ src/app/onboarding/
      -- MUST return zero results
```

#### Feature 4: Personal Cram Card

```
## Feature: Cram Card Generator

### Algorithm
- [ ] Only recall/calculation questions qualify (not scenario/interpretation)
- [ ] Only high/medium exam_frequency nodes qualify
- [ ] Minimum 3 attempts per node before it qualifies
- [ ] Ordering: (1 - accuracy_rate) × frequency_weight
- [ ] Top 20 entries appear on card
- [ ] Card not available until ≥20 completed sessions

### Card Format
- [ ] A4 portrait, two columns, 10 entries per column
- [ ] Each entry: value, provision, hook text
- [ ] Black-and-white printable
- [ ] Header includes generation week
- [ ] Footer: "SlateCamp — Know you'll win."

### PDF Generation
- [ ] PDF downloads correctly
- [ ] PDF prints correctly on A4
- [ ] Regenerates weekly on anniversary day

### Pre-Threshold State
- [ ] User with <20 sessions sees: "Complete 20 study sessions to unlock..."
```

---

## Definition of Done

A feature is "done" and ready for production when ALL of the following are true:

### Code Quality
- [ ] `bun run build` → zero errors
- [ ] `npx tsc --noEmit` → zero errors
- [ ] No `console.log` statements in committed code
- [ ] No `any` types on exported functions
- [ ] No `@ts-ignore` without explanation comment
- [ ] All imports use `@/` absolute paths
- [ ] No unused imports

### Architecture
- [ ] No inline components in routing files (page.tsx, layout.tsx)
- [ ] No `'use client'` on components that don't need it
- [ ] No Supabase calls outside `src/lib/queries/` or `src/lib/actions/`
- [ ] No `select('*')` queries
- [ ] All queries scope to `user_id`

### UX
- [ ] New components have skeleton loading state
- [ ] New components have empty state with CTA
- [ ] Interactive elements have keyboard navigation
- [ ] Non-obvious metrics have tooltips
- [ ] Minimum touch target 44×44px on mobile
- [ ] Responsive on mobile viewport (375px width)

### Data
- [ ] All new tables have RLS enabled with appropriate policies
- [ ] All new FK columns have indexes
- [ ] Error handled and returned as `QueryResult<T>`
- [ ] No raw throws in query functions

### Tests
- [ ] Tier 1 features: automated tests written and passing
- [ ] Tier 3 features: manual QA checklist completed and signed off
- [ ] Smoke tests pass: `bun run build && npx tsc --noEmit && bun test`

### Feature Flag
- [ ] Feature wrapped in appropriate flag (if not Phase 1)
- [ ] Flag defaults to `false` in production
- [ ] Flag tested: feature visible when `true`, hidden when `false`

---

## Test Data Strategy

### Local Development
- Seed script creates a test user with representative data across all mastery states
- Minimum seed data: 1 user, 50 quiz sessions, 500 interactions, full taxonomy tree, 20 wiki articles

### Staging/Preview
- Use production data snapshot (anonymized) OR dedicated staging Supabase project
- Never test with production credentials in local development

### Production Verification
- Use a dedicated test account (not a real user)
- Test account flagged in profiles to be excluded from analytics aggregates
- After verification, clean up test data if it pollutes aggregates

---

## When to Skip Testing

**Never skip Tier 1 (automated tests) on mastery pipeline, SRS, IRT, or payment code.**

Acceptable shortcuts for time pressure:
- Tier 3 manual QA on cosmetic-only changes (color updates, copy changes)
- Skip mobile testing for admin-only features
- Skip empty state testing if the feature requires data to exist (e.g., simulation comparison)

Unacceptable shortcuts:
- Skipping SRS/IRT wiring verification (this is how the bug shipped)
- Skipping RLS policy testing on new tables (security)
- Skipping forbidden words check on retaker-facing features (cultural harm)

---

*Document version: 2026-03-26*
*Add feature-specific QA checklists as each phase begins.*

