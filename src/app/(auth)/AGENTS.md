<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-24 | Updated: 2026-03-24 -->

# (auth)

## Purpose

Authentication flow route group (Next.js route group: parenthesized name excludes from URL). Handles user signup, login, password recovery, and onboarding. All routes are public and unauthenticated. Uses Supabase Auth (Google OAuth + Email). Redirects authenticated users to `/dashboard`.

## Key Files

| File | Description |
|------|-------------|
| `error.tsx` | Auth route error boundary. |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `login/` | Login page. Google OAuth sign-in form. Redirects to `/dashboard` on success. Link to register if no account. |
| `register/` | Registration page. Google OAuth sign-up form. Creates new Supabase Auth user. Collects email consent. Links to login if account exists. |
| `forgot-password/` | Password recovery flow. Email-based password reset link. Supabase built-in recovery email. |
| `onboarding/` | Post-signup onboarding. Collects: discipline selection, reviewer type (first_taker/returning_reviewer/undergrad/dae), conditional fields (exam date, study window, struggled subjects, institution). Server Action writes to profiles + user_global_stats. Redirects to `/dashboard` on completion. |

## For AI Agents

### Working In This Directory

- All routes are **public and unauthenticated**.
- Routes are **grouped** via parentheses `(auth)` — the group name does NOT appear in the URL path.
  - URL: `/login`, `/register`, `/forgot-password`, `/onboarding` (not `/(auth)/login`, etc.)
- Pages are **Server Components** where possible (onboarding page fetches disciplines + taxonomy data server-side).
- Forms use `'use client'` for interactivity (LoginForm, RegisterForm, OnboardingForm).
- Server Actions handle mutations: Supabase auth, profile creation, onboarding completion.
- Redirects to `/dashboard` after success; unauthenticated users are already on these routes.

### Common Patterns

- **Google OAuth:** Both login and register use `supabase.auth.signInWithOAuth({ provider: 'google' })`. Callback redirect is set dynamically (login → `/dashboard`, register → `/onboarding`).
- **Supabase Auth:** User credentials are managed by Supabase Auth (email/password or Google). Profile data (discipline, reviewer_type, etc.) is stored in `profiles` table after signup.
- **Server Actions:** `selectDiscipline` (onboarding) is a `'use server'` function that:
  - Reads FormData (discipline, reviewer_type, exam_date, study_window, struggled_subjects, institution).
  - Updates `user_global_stats` (is_retaker, exam_attempt_number, target_exam_date, onboarding_completed_at).
  - Upserts `profiles` (reviewer_type, discipline_id, preferred_study_window, previous_exam_subjects_struggled, etc.).
  - Tracks analytics event.
  - Redirects to `/dashboard`.
- **UI Layout:** Centered card layout, consistent with Campfire design (Surface Light bg, Surface Card card bg, rounded-md borders).
- **Links:** Relative links between login/register/password-reset pages. Metadata titles set per page.

## Dependencies

### Internal

- `@/lib/supabase/server` — `createClient()`, `getUser()` (onboarding only, to check session after signup).
- `@/lib/supabase/bootstrap` — `bootstrapUser()` on onboarding page (auto-creates profiles if missing).
- `@/lib/constants/routes` — ROUTES constant (ROUTES.LOGIN, ROUTES.DASHBOARD).
- `@/lib/constants/site` — `siteConfig.name` for logo/branding.
- `@/components/auth/SignInWithGoogleButton` — Reusable OAuth button.
- `@/components/auth/LoginForm` — Client component, handles form submission.
- `@/components/auth/RegisterForm` — Client component, handles form submission.
- `@/components/auth/OnboardingForm` — Client component, discipline selector, reviewer type, conditional fields.
- `@/lib/analytics-server` — `trackServerEvent('onboarding_completed', ...)` on form submission.
- `@/types/app` — Discipline type.
- `next/navigation` — `redirect()` for post-auth redirect.
- `next/cache` — `revalidatePath()` after onboarding update.

<!-- MANUAL: Google OAuth callback URLs configured in Supabase Auth settings. Redirects are set dynamically in code (loginUrl vs registerUrl). -->
