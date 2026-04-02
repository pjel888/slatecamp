<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-02 | Updated: 2026-04-02 -->

# Assessment

## Purpose
Initial onboarding assessment quiz for new users. Determines baseline readiness across all ALE disciplines (via IRT 2-parameter model). Authenticated page with mandatory completion before dashboard access; redirects completed users to main dashboard.

## Key Files
| File | Description |
|------|-------------|
| `page.tsx` | Server component handling auth check, completion check, and quiz initialization |
| `loading.tsx` | Loading skeleton |

## For AI Agents
### Working In This Directory
- **Auth required** — redirects to `/auth/login` if user not authenticated
- **Mandatory onboarding:** Redirects to `/dashboard` if already completed (prevents re-taking)
- **Discipline selection:** Reads `current_discipline_id` from `user_global_stats` table; redirects to `/dashboard` if not set
- **Question fetching:** Calls `getAssessmentQuestions(disciplineId)` to fetch assessment questions; redirects if empty pool
- **Rendering:** Passes `questionIds` and `disciplineId` to `AssessmentQuiz` client component
- **Flow:** User → Check auth → Check completion → Check discipline → Load questions → Render AssessmentQuiz
- This is a **blocking page** — no skip; completion is required before accessing main study features
- After completion, update `user_global_stats.assessment_completed = true` (likely in AssessmentQuiz)

## Dependencies
### Internal
- `@/lib/supabase/server` — `createClient()`, `getUser()` for auth
- `@/lib/actions/assessment` — `hasCompletedAssessment()`, `getAssessmentQuestions(disciplineId)` server actions
- `@/components/assessment/AssessmentQuiz` — Quiz UI component
- `next/navigation` — `redirect()` function

<!-- MANUAL: -->
