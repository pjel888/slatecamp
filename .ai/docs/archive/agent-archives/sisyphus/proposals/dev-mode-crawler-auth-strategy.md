# SlateCamp Dev Mode & Crawler Auth Strategy

## A Comprehensive Guide for Solo Founders and Autonomous Agents

---

## Executive Summary

SlateCamp utilizes a unified **Impersonation Bypass Strategy** (`DEV_FORCE_USER_ID`) designed to serve two primary audiences:
1. **The Solo Technical Founder:** Instantly log into your local development environment using your real production data without constantly re-authenticating.
2. **Autonomous Crawler Agents (e.g., Boneyard, Playwright, Puppeteer):** Allow headless Chromium instances to freely navigate, audit, and interact with authenticated routes (`/dashboard`, `/quiz/*`) without needing complex login scripts or capturing OTPs.

Because this is a server-side impersonation bypass and not a true JWT session, it introduces specific architectural paradigms regarding Row Level Security (RLS) and Client vs. Server data fetching.

### The Value Proposition

| Problem | Solution |
|---------|----------|
| Slow iteration loops | Auto-authenticate as your specific UUID |
| Fake mock data | See your actual quiz sessions, mastery, and stats |
| Crawlers blocked by login walls | Agents instantly access `/dashboard` without credentials |
| Client vs. Server session mismatches | Enforces a strict "Server-Components First" fetching paradigm |

---

## Part 1: Setup for Solo Founders

### Step 1: Get Your Credentials
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard).
2. **Users:** Navigate to Authentication → Users and copy your specific `UUID`.
3. **API Keys:** Navigate to Project Settings → API and copy your `service_role` secret.

### Step 2: Configure `.env.local`
```bash
# Your standard public credentials
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# REQUIRED FOR BYPASS: The Service Role Key bypasses RLS for the forced user
SUPABASE_SERVICE_ROLE_KEY=your-secret-service-role-key

# THE TRIGGER: Force the app to impersonate this user locally
DEV_FORCE_USER_ID=12345678-1234-1234-1234-123456789abc

# Optional: Force a specific tier for testing UI gates (free, camp, institutional)
DEV_FORCE_TIER=institutional
```

### Step 3: Run the Server
Restart your server (`bun dev`). A persistent **Amber warning border** and a "DEV" badge will appear on your screen, indicating you are actively impersonating a user and interacting with real data.

---

## Part 2: Setup for Crawler Agents (Boneyard, Playwright, etc.)

Headless Chromium agents and automated auditing tools (like Boneyard) frequently struggle with magic links, OTPs, and complex OAuth flows. 

With this strategy, **no login script is required.**

### How Crawlers Interact
1. The crawler is pointed directly at `http://localhost:3000/dashboard`.
2. The Next.js Middleware detects `DEV_FORCE_USER_ID` and allows the request to pass through to the protected route instead of redirecting to `/login`.
3. Server Components fetch the impersonated user's data using the `SUPABASE_SERVICE_ROLE_KEY`.
4. The crawler receives a fully populated, authenticated HTML document.

### Crawler Configuration Example (Playwright)
```typescript
import { test, expect } from '@playwright/test';

test('Agent explores the dashboard', async ({ page }) => {
  // Note: DEV_FORCE_USER_ID must be set in the environment running the Next.js app
  
  // The agent navigates directly to a protected route
  await page.goto('http://localhost:3000/dashboard');
  
  // The agent is automatically authenticated
  await expect(page.locator('text=Your Sessions')).toBeVisible();
  
  // The agent can audit the DOM, click links, and run visual regressions
});
```

---

## Part 3: Architecture Deep Dive (How the Bypass Works)

This strategy stitches a session together using three distinct override layers:

### 1. Middleware Route Bypass (`middleware.ts` & `src/lib/supabase/middleware.ts`)
The middleware checks `process.env.DEV_FORCE_USER_ID` and verifies the request is originating on `localhost` (or `127.0.0.1`) in development mode. If true, it skips standard session validation and allows traffic to protected routes. Any attempt to visit `/login` is forcefully redirected to `/dashboard`.

### 2. User Metadata Injection (`src/lib/supabase/server.ts`)
When `getUserIfPresent()` is called, it intercepts the request. Using the `SUPABASE_SERVICE_ROLE_KEY`, it calls the Supabase Admin API (`auth.admin.getUserById`) to fetch the impersonated user's actual profile. This ensures avatars, names, and app_metadata correctly hydrate the UI.

### 3. RLS Bypass via Service Role Key (`src/lib/supabase/server.ts`)
Because the browser has no real JWT cookie, standard queries using the `anon` key would be blocked by Postgres Row Level Security (RLS). To fix this, `createServerClient()` and `createStaticClient()` dynamically swap the `anon` key for the `SUPABASE_SERVICE_ROLE_KEY` when the bypass is active. Server-side queries thus bypass RLS but remain scoped via strict `.eq('user_id', process.env.DEV_FORCE_USER_ID)` filters.

---

## Part 4: The 4 Golden Rules & "Gotchas"

Because this is an impersonation bypass, it does not behave exactly like a real JWT session. You **must** understand these architectural limitations to avoid "disappearing data" bugs.

### 🛑 Gotcha 1: Client-Side Fetching Will Fail (Enforce Server Components)
The `SUPABASE_SERVICE_ROLE_KEY` is **never** shipped to the browser. `createBrowserClient()` in `src/lib/supabase/client.ts` uses the `anon` key. Since you have no JWT cookie, **any data fetched via `supabase.from()` inside a Client Component will fail RLS and return empty arrays.**
* **The Rule:** SlateCamp enforces a strict "Server Components First" paradigm. Fetch all data on the server and pass it down as props. For client-side mutations, use **Server Actions**.

### 🛑 Gotcha 2: `auth.uid()` in Postgres is NULL
Because we query via the `service_role` key instead of a standard JWT, the `auth.uid()` function inside Postgres evaluates to `NULL`.
* **The Rule:** If you have Postgres triggers (e.g., audit logs) or RPC functions that rely on `auth.uid()`, they will fail or insert `NULL`. You must explicitly pass the `user_id` from the Server Action to your RPC functions rather than relying on the database to infer it.

### 🛑 Gotcha 3: Session Cookie Mismatches
If you previously logged in normally, your browser may still hold an old `sb-access-token` cookie for User A, but your `.env.local` is forcing User B. This can cause bizarre UI states where Server Components show User B's data, but Client Components show User A's data.
* **The Rule:** Always clear your browser cookies (or use an Incognito window / fresh Crawler Context) when switching or enabling `DEV_FORCE_USER_ID`.

### 🛑 Gotcha 4: Missing the Service Role Key
If you set `DEV_FORCE_USER_ID` but forget to add `SUPABASE_SERVICE_ROLE_KEY` to `.env.local`, the server will fall back to the `anon` key. RLS will block all queries, and your dashboard will be completely blank.

---

## Part 5: Changing Personas & Forcing Tiers

While `DEV_FORCE_USER_ID` dictates *who* you are authenticated as, you often need to test what the app looks like if that user were on a different subscription tier or possessed a different role (e.g., testing the paywall for Free users).

There are two supported ways to override your persona:

### Method 1: The UI DevToolbar (Recommended)
When you log in locally via the bypass, you will see a floating wrench icon in the bottom-right corner of the screen. Clicking this opens the **DevToolbar**.

Inside the toolbar, you can instantly switch between predefined personas. Clicking a preset writes an override to the `cerebro_dev_flags` cookie, which intercepts the tier calculation before rendering the UI.

**Available Presets:**
| Preset | Simulated Tier | Role | Description |
|--------|----------------|------|-------------|
| **ALE Reviewer** | `camp` | User | Target board exam candidate |
| **Architecture Student** | `free` | User | B2C free-tier learner |
| **UST Student** | `institutional`| User | B2B2C institutional member |
| **AECOM Employee** | `insurance` | User | B2B corporate member |
| **SME / Content Admin** | `institutional`| Admin | Content management access |
| **Super Admin** | `institutional`| Admin | Full platform root access |

*Note: You can also use the DevToolbar to manually toggle individual feature gates (e.g., forcing 3D Lab access on/off).*

### Method 2: Environment Variable
If you are running automated crawler tests, interacting with the UI DevToolbar is cumbersome. Instead, you can hardcode the simulated tier directly in your `.env.local` file:

```bash
# .env.local
DEV_FORCE_TIER=free  # Valid options: 'free', 'camp', 'insurance', 'institutional'
```

This ensures the crawler always receives the application rendered in the context of the forced tier.

---

## Security & Production Safety

This bypass is highly privileged. It is protected by multiple hardcoded fail-safes to ensure it cannot be exploited in production:

1. **Environment Check:** Must be `NODE_ENV === 'development'`. Fails instantly on Vercel.
2. **Network Origin Check:** Must originate from `localhost` or `127.0.0.1`.
3. **Environment Variable Check:** Requires explicit opt-in via `.env.local` (`DEV_FORCE_USER_ID`).
4. **Git Protection:** `.env.local` is strictly ignored in `.gitignore`. **NEVER commit your UUID or Service Role Key.**

### CVE-2025-29927 (Middleware Awareness)
Recent Next.js middleware bypass vulnerabilities emphasize the danger of relying solely on middleware for auth. SlateCamp's strategy is safe because the bypass does not grant unauthorized authorization—it merely swaps the rendering context locally, while Server Actions still strictly validate the injected User ID before mutating data.

---

## Troubleshooting Reference

| Symptom | Probable Cause | Solution |
|---------|---------------|----------|
| Dashboard is completely blank | Missing `SUPABASE_SERVICE_ROLE_KEY` | Add your service role key to `.env.local` and restart the server. |
| Redirect loop on `/login` | `NODE_ENV` not set to development | Ensure you are running `bun dev` locally. |
| Some stats load, but lists/tables are empty | Client-side fetching | You are using `createBrowserClient()` to fetch data. Move the fetch to a Server Component. |
| Profile picture is missing | Admin API fetch failed | Verify your service key has access to `auth.users`, or the impersonated user has no avatar. |
| Showing wrong user data | Stale browser cookie | Clear your browser cookies to resolve the conflict between the JWT and the forced ID. |