# Audit: First-Time User Experience (FTUX) & Implementation Plan <!-- updated: 2026-04-10 -->

## 1. Document Control <!-- updated: 2026-04-10 -->
| Version | Date | Author | Status | Notes |
| :--- | :--- | :--- | :--- | :--- |
| 1.0 | 2026-04-10 | Gemini CLI | Draft | Initial UX/UI audit of first-time user experience. |

## 2. Executive Summary <!-- updated: 2026-04-10 -->
The current first-time user experience (FTUX) for SlateCamp is functionally fragmented. While an onboarding flow exists, it is disconnected from the registration process, leading to a "trust gap" where users are promised a "Readiness Score" but land on an empty dashboard with a score of 0 and no orientation. This audit identifies critical redirection failures and a lack of protective guards that prevent a cohesive onboarding journey.

## 3. Audit Goal and Business Context <!-- updated: 2026-04-10 -->
- **Goal:** Transform the current fragmented entry into a seamless, high-trust onboarding journey.
- **Business Context:** As a new platform, every user is currently a first-time user. High abandonment at the dashboard is expected if the initial value promise ("Know Your Score") is not met immediately after login.

## 4. Scope, Method, and Evidence Sources <!-- updated: 2026-04-10 -->
- **Scope:** Landing page → Registration → Auth Callback → Onboarding → Dashboard Arrival.
- **Method:** Codebase forensic audit and user journey mapping.
- **Evidence Sources:**
  - `src/app/(auth)/register/register-form.tsx` (Signup logic)
  - `src/app/auth/callback/route.ts` (Redirect logic)
  - `src/app/(auth)/onboarding/page.tsx` (Onboarding implementation)
  - `src/components/dashboard/DashboardLayoutContent.tsx` (Dashboard entry guard)
  - `src/app/dashboard/page.tsx` (Arrival experience)

## 5. First-Time User Success Definition <!-- updated: 2026-04-10 -->
Success is defined as a user completing the following steps in under 3 minutes:
1. Registering with Google.
2. Selecting their discipline and reviewer type.
3. Seeing their initial (even if calibrated to 0) score with a clear "How to improve" orientation.

## 6. Assumptions, Constraints, and Open Questions <!-- updated: 2026-04-10 -->
- **Assumption:** Users expect immediate access after Google login.
- **Constraint:** Must use Supabase Auth and existing data schema.
- **Open Question:** Should the initial score be a "0" or a "Pending Calibration" state until the first diagnostic quiz?

## 7. Route Inventory Relevant to First-Time Users <!-- updated: 2026-04-10 -->
| Route | Access | Purpose |
| :--- | :--- | :--- |
| `/` | Public | Value proposition and "Get Started" CTA. |
| `/register` | Public | Account creation. |
| `/login` | Public | Returning user entry. |
| `/auth/callback` | Public | Auth processing. |
| `/onboarding` | Protected | Profile calibration and data collection. |
| `/dashboard` | Protected | Main application hub. |

## 11. Authentication Flow Analysis <!-- updated: 2026-04-10 -->
- **Finding:** Registration and Login both share the same callback route (`/auth/callback`).
- **Issue:** The registration form does not specify a `next` parameter, causing it to default to `/dashboard` instead of the required `/onboarding`.

## 12. Login & Register Page Audit <!-- updated: 2026-04-10 -->
- **Finding:** The register page uses the headline "Continue to see your score."
- **Issue:** This copy is premature for a brand-new user who hasn't provided any data yet. It assumes a "score-first" entry which isn't yet implemented on the landing page.

## 15. Post-Login Transition Audit <!-- updated: 2026-04-10 -->
- **Critical Issue:** `/auth/callback` redirects users blindly to `/dashboard`.
- **Missing Logic:** No check exists to see if `onboarding_completed_at` is null.

## 16. Dashboard Landing Audit <!-- updated: 2026-04-10 -->
- **Observation:** `DashboardPage` renders all widgets (Heatmap, Mastery, Feed) even for new users.
- **Issue:** This creates a "Wall of Zeros" experience. There is no "Welcome" or "First Task" orientation.

## 18. Empty State Audit <!-- updated: 2026-04-10 -->
- **Finding:** Most dashboard components show skeletons or empty graphs.
- **Recommendation:** Implement "First Step" prompts inside empty components (e.g., "Answer your first question to see your heatmap").

## 32. Severity Matrix <!-- updated: 2026-04-10 -->
| Issue | Severity | Impact |
| :--- | :--- | :--- |
| Bypassing Onboarding | Critical | High - Data gaps in profile. |
| Wall of Zeros on Dashboard | High | Medium - Confuses new users. |
| Disconnected Login/Register Logic | Medium | Low - Functional but inconsistent. |

## 33. Prioritized Recommendations <!-- updated: 2026-04-10 -->

### Quick Wins (Tier 1) <!-- updated: 2026-04-10 -->
1. **Fix Register Redirect:** Update `RegisterForm` to pass `next=/onboarding` to the callback.
2. **Add Dashboard Guard:** Update `DashboardLayoutContent` to redirect to `/onboarding` if `onboarding_completed_at` is null.
3. **Update Register Copy:** Change headline to "Create your study path" to align with the onboarding flow.

### Short-Term (Tier 2) <!-- updated: 2026-04-10 -->
1. **Onboarding Calibrator:** Ensure the first step of onboarding actually feels like it's calculating something.
2. **Dashboard Empty States:** Replace 0-data skeletons with "Getting Started" interactive cards.

## 34. Quick Wins Under 1 Day <!-- updated: 2026-04-10 -->
- Update `src/app/(auth)/register/register-form.tsx` to include `next` param.
- Add `onboarding` check to `src/components/dashboard/DashboardLayoutContent.tsx`.

## 39. Acceptance Criteria for Improved FTUX <!-- updated: 2026-04-10 -->
1. User clicks "Get Started" on landing page.
2. User signs up via Google.
3. User is immediately redirected to `/onboarding`.
4. If user manually navigates to `/dashboard` without finishing onboarding, they are sent back to `/onboarding`.
5. Upon finishing onboarding, user lands on `/dashboard` and sees a welcome message.

## 43. Changelog <!-- updated: 2026-04-10 -->
- 2026-04-10: Initial FTUX audit and implementation plan created.
