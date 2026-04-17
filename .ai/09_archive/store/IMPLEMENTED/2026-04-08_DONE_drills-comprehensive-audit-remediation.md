# Drills Comprehensive Audit & Remediation Report
**Date:** 2026-04-08
**Status:** COMPLETE — All fixes applied and browser-verified

---

## Executive Summary

Three root causes were identified that collectively broke ALL quiz drill modes:

1. **`questions.metadata` column does not exist** — A non-existent column in the Supabase query caused `fetchQuestionsForClient` to fail silently, returning 0 questions. Every quiz session showed infinite skeleton loading.
2. **UI tier gating without dev bypass** — Simulation and Endurance cards in `ReviewHub` checked `userTier === 'free'` without a `NODE_ENV === 'development'` bypass, blocking access in dev mode.
3. **RLS-unsafe question fetching** — Session page used `createClient()` (subject to RLS) for question queries, but the `questions` table has an admin-only RLS policy.

---

## UX/UI Path Breakdown

### Intelligent Configurator (BEFORE fix)
| Step | Expected | Actual |
|------|----------|--------|
| 1. Visit `/dashboard/drills` | Page loads | Page loads OK |
| 2. Subjects populate Canvas | 9 subjects appear | 9 subjects appear OK |
| 3. Select subjects + configure | Topics highlight, sliders work | Works OK |
| 4. Slide to start session | Session created, navigate to quiz | Session created BUT quiz shows infinite skeleton |
| 5. Quiz renders first question | Question stem + 4 options + slider | **BROKEN**: Skeleton forever — 0 questions fetched |

### Full Exam Simulation (BEFORE fix)
| Step | Expected | Actual |
|------|----------|--------|
| 1. Scroll to Simulation card | "Start Simulation" button | **BROKEN**: "Pro Subscription Required" lock |
| 2. Click Start Simulation | Navigate to `/quiz/fullexam/setup` | BLOCKED by tier gate |
| 3-5. Same question fetch issue | Quiz renders | Would show infinite skeleton |

### Design Endurance (BEFORE fix)
| Step | Expected | Actual |
|------|----------|--------|
| 1. Scroll to Endurance card | "Start Endurance Training" button | **BROKEN**: "Pro Subscription Required" lock |
| 2. Click Start Endurance | Navigate to `/quiz/extended/setup` | BLOCKED by tier gate |
| 3-5. Same question fetch issue | Quiz renders | Would show infinite skeleton |

---

## Code Audit Findings

### Finding 1: Non-existent `metadata` column (CRITICAL)
- **File:** `src/lib/quiz/to-client-question.ts:99-104`
- **Query:** `.select('question_id, topic_id, text, options, difficulty, prompt_image_url, question_type, metadata')`
- **Error:** `column questions.metadata does not exist`
- **Impact:** Silent failure — `fetchQuestionsForClient` returned `[]` for every session
- **Actual columns available:** `hint_text` (direct column), no `metadata` JSON column
- **Contrast:** `startSession` in `start-session.ts` uses correct columns: `'question_id, topic_id, text, options, difficulty, prompt_image_url, question_type, rationale, explanation'`

### Finding 2: Tier gate without dev bypass
- **File:** `src/components/testing/hub/ReviewHub.tsx:465,502`
- **Code:** `userTier === 'free'` checked directly without `isDevEnvironment` bypass
- **Note:** `isDevEnvironment` was already defined (line 178) and used in `computeSimulationGate` but NOT in card tier checks

### Finding 3: RLS policy blocks question reads
- **Migration:** `supabase/migrations/004_add_user_roles.sql:54-60`
- **Policy:** `CREATE POLICY "Admins can manage questions" ON public.questions FOR ALL TO authenticated USING (public.has_admin_role())`
- **Impact:** Only admin-role users can read from `questions` table via authenticated client

---

## Network Audit Findings

### Question Fetch Path
```
Session Page → createClient() → supabase.from('questions').select(...).in('question_id', ids)
                                                                        ↓
                                                              RLS: has_admin_role() = false
                                                                        ↓
                                                              ERROR: column 'metadata' does not exist
                                                                        ↓
                                                              Returns { data: null, error: {...} }
                                                                        ↓
                                                              fetchQuestionsForClient returns []
```

Both the column error AND RLS would independently cause failure. The column error is hit first.

### Session Creation Path (works correctly)
```
HeroConfigurator → startSession() → createServiceClient() → questions query (correct columns)
                                                              ↓
                                                    Service client bypasses RLS
                                                              ↓
                                                    Questions selected → session created
```

---

## Remediation Applied

### Fix 1: `src/lib/quiz/to-client-question.ts`
- Removed `metadata` from SELECT columns
- Added `hint_text` as direct column
- Updated `QuestionForClientRow` interface
- Updated `toClientQuestion` to read `hint_text` directly
- Added `console.error` guard for future silent failures

### Fix 2: `src/components/testing/hub/ReviewHub.tsx`
- Added `effectiveTier` computed from `isDevEnvironment || userTier !== 'free'`
- Replaced `userTier === 'free'` with `effectiveTier === 'free'` in both Simulation and Endurance cards

### Fix 3: `src/app/quiz/[mode]/session/[sessionId]/page.tsx`
- Added `createServiceClient` import
- Changed question fetch to use `serviceClient` instead of `supabase`

### Fix 4: `src/lib/actions/quiz-v2/get-session-questions.ts`
- Added `createServiceClient` import
- Changed question fetch to use `serviceClient` for background pre-fetch

---

## Browser Verification Evidence

1. **Quiz session renders:** Question 1/50, stem visible, 4 options (A-D), confidence slider, slide-to-submit, footer nav
2. **Simulation card:** "Start Simulation" button (blue, filled) — no Pro lock
3. **Endurance card:** "Start Endurance Training" button (outlined) — no Pro lock
4. **curl verification:** RSC payload contains question data with stems and options

---

*Archived from active `.ai/plans/` on 2026-04-08*
