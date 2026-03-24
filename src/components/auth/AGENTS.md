<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-24 | Updated: 2026-03-24 -->

# auth

## Purpose

Authentication UI components for Supabase Auth integration. Handles user sign-in with Google OAuth, sign-out, and authentication state management.

## Key Files

| File | Description |
|------|-------------|
| `SignInWithGoogleButton.tsx` | Google OAuth sign-in button with loading state and customizable label |
| `SignOutButton.tsx` | Sign-out button that clears session and redirects to home |
| `GoogleIcon.tsx` | Google logo SVG icon component |

## For AI Agents

### Working In This Directory

- **OAuth Provider**: Google via Supabase Auth (OAuth 2.0)
- **Session Management**: Supabase client-side auth via `createClient()` from `@/lib/supabase/client`
- **Sign-in Flow**: `onClick` handler calls auth service (parent page manages routing post-login)
- **Sign-out Flow**: Clears session cookie and redirects to home (`/`)
- **Loading States**: Supports `isLoading` prop with custom label for UX feedback
- **Accessibility**: Uses `aria-busy` for loading state, proper button semantics
- **Styling**: Campfire design (Camp Cobalt primary, 44px min-height buttons)

### Dependencies
### Internal

- `@/lib/supabase/client` - Supabase client instantiation
- `@/components/graphics/icons/Icon.tsx` - Icon wrapper (SCIcon)
- `@/lib/utils` - `cn()` utility
- `@phosphor-icons/react` - Icons (SignOut)
- Supabase (`@supabase/supabase-js`) - Auth API

<!-- MANUAL: Verify Google OAuth credentials are configured in Supabase project settings. Test sign-in/sign-out flow in staging before production release. -->
