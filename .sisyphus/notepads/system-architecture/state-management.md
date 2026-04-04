# State Management Patterns

**Date:** 2026-04-04

SlateCamp employs a strict bifurcation between Server State (Server Components) and complex Client State (Zustand). 

## 1. Server-First Fetching (React Server Components)
To maximize performance and align with the Dev Mode bypass strategy:
- All data fetching occurs in **Server Components** (`src/app/`, `src/components/dashboard/`).
- Data is passed down to client islands as props.
- Client-side `createBrowserClient()` fetching is heavily discouraged because it lacks access to the `service_role` key used in local development impersonation, causing RLS failures.

## 2. Server Actions for Mutations
All form submissions, quiz initializations, and database updates flow through **Server Actions** in `src/lib/actions/`.
- This ensures Postgres transactions and RLS validations are executed securely.
- Actions trigger `revalidatePath()` to seamlessly update the UI.

## 3. Client State via Zustand
Highly interactive, ephemeral state is managed by global **Zustand** stores (`src/stores/`). These are used exclusively where RSCs are insufficient:

- **`useQuizStore.ts`**: The most complex state machine in the app. Manages the active session timer, current question index, instantaneous feedback rendering, and Socratic AI tutor context.
- **`useLabStore.ts`**: Controls the React Three Fiber canvas. Handles camera position, active spatial layers (e.g., plumbing vs. structural), and parametric slider inputs.
- **`useDevStore.ts`**: Manages the local `DEV_FORCE_USER_ID` overrides. Specifically handles the `impersonateAs` logic for switching UI roles (e.g., Free Student vs. Super Admin) and saving overrides to `sessionStorage` and the `cerebro_dev_flags` cookie.

## 4. Feature Flags & Tier Resolution
Feature access (e.g., 3D Lab, AI Tutor) is driven by the user's `UserTier` (`free`, `camp`, `insurance`, `institutional`).
- Calculations run synchronously on the server in `src/lib/admin/feature-flags.ts`.
- In development, the effective tier can be forcefully overridden via `.env.local` (`DEV_FORCE_TIER`) or the UI DevToolbar.
