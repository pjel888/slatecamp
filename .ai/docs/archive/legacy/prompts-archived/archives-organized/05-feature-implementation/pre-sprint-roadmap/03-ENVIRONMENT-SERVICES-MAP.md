# SlateCamp — Environment, Secrets & Third-Party Services Map
## Complete Infrastructure Inventory · Pre-Implementation Baseline
### 2026-03-26

---

## Purpose

This document maps every third-party service, API key, environment variable, and external dependency required by SlateCamp — both what currently exists and what needs to be provisioned for planned features. Before starting any phase, check this document to confirm all required services are configured.

---

## How to Audit Current State

```bash
# 1. List all env vars referenced in codebase
grep -rn "process.env\." src/ --include="*.ts" --include="*.tsx" | \
  sed 's/.*process\.env\.\([A-Z_]*\).*/\1/' | sort -u

# 2. List all env vars in .env files
cat .env.local .env.example 2>/dev/null | grep -v "^#" | sort

# 3. Check Vercel environment variables
vercel env ls

# 4. List all npm packages (third-party dependencies)
cat package.json | jq '.dependencies, .devDependencies'
```

---

## Environment Variable Registry

### CURRENTLY CONFIGURED (Verified from codebase references)

| Variable | Service | Scope | Notes |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase | Client + Server | Public — safe in client code |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase | Client + Server | Public anon key — RLS enforces security |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase | **Server-only** | 🔴 **NEVER expose in client code or Server Components** |
| `SUPABASE_URL` | Supabase | Server-only | Server-side URL (may differ from public URL) |
| `STRIPE_SECRET_KEY` | Stripe | Server-only | Payment processing |
| `STRIPE_WEBHOOK_SECRET` | Stripe | Server-only | Webhook signature verification |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe | Client | Public Stripe key for Checkout |
| `PAYREX_SECRET_KEY` | PayRex | Server-only | Philippine payment gateway |
| `PAYREX_WEBHOOK_SECRET` | PayRex | Server-only | Webhook signature verification |
| `ANTHROPIC_API_KEY` | Anthropic Claude | Server-only | AI features (bounded RAG, citations) |

### LIKELY CONFIGURED (Verify in .env.local)

| Variable | Service | Scope | Notes |
|---|---|---|---|
| `NEXT_PUBLIC_APP_URL` | Vercel | Client + Server | Base URL for the app (needed for social sharing, OG images) |
| `NEXTAUTH_SECRET` | Next.js | Server-only | If using NextAuth (or may use Supabase Auth exclusively) |
| `NEXT_PUBLIC_GA_ID` | Google Analytics | Client | If analytics tracking is enabled |

### NEEDED BUT NOT YET PROVISIONED

| Variable | Service | Phase Needed | Decision Required |
|---|---|---|---|
| `RESEND_API_KEY` | Resend | Phase 1 (Contact form), Phase 3 (Re-engagement emails) | **Decision: Resend vs. SendGrid vs. Postmark?** See Email Provider Decision below |
| `RESEND_FROM_EMAIL` | Resend | Phase 1, 3 | e.g., `hello@slatecamp.com` |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Web Push | Phase 3 (Push notifications) | Generate VAPID key pair |
| `VAPID_PRIVATE_KEY` | Web Push | Phase 3 | Server-only |
| `VERCEL_OG_IMAGE_SECRET` | Vercel OG | Phase 4 (Score sharing), Feature 1f (Topnotcher image) | If using Vercel OG image generation |
| `SUPABASE_STORAGE_URL` | Supabase Storage | Phase 1 (Avatar upload) | May be derived from SUPABASE_URL |

---

## Third-Party Service Inventory

### CONFIGURED AND WORKING

#### Supabase
- **Purpose:** Database (PostgreSQL), Auth (GoTrue), Storage (avatars, model files), PostgREST API
- **Status:** ✅ Fully configured
- **Dashboard:** https://app.supabase.com/project/[project-id]
- **Local dev:** `supabase start` / `supabase stop`
- **Migrations:** `supabase db push` (CLI-based)
- **Type generation:** `npx supabase gen types typescript --local > src/types/database.ts`
- **Used by:** Everything

#### Stripe
- **Purpose:** International payment processing
- **Status:** ✅ Infrastructure working (webhook handlers, checkout route). **⚠️ UI buttons not wired**
- **Webhook endpoint:** `/api/webhooks/stripe` (verify path)
- **Products configured:** Verify that Pro tier product/price IDs exist in Stripe dashboard
- **Test mode:** Verify test mode keys are used in development

#### PayRex
- **Purpose:** Philippine payment gateway (GCash, Maya, bank transfer)
- **Status:** ✅ Infrastructure working. **⚠️ UI buttons not wired**
- **Webhook endpoint:** `/api/webhooks/payrex` (verify path)

#### Anthropic Claude API
- **Purpose:** AI-powered features (bounded RAG with citations)
- **Status:** ✅ Configured
- **Model used:** Verify which Claude model (claude-sonnet, claude-haiku, etc.)
- **Usage:** Bounded — never open-ended generation. Citations mandatory.

#### Vercel
- **Purpose:** Hosting, deployment, edge functions
- **Status:** ✅ Configured
- **Deployment:** Likely auto-deploy from main branch
- **Environment variables:** Set via Vercel dashboard or `vercel env`
- **Edge functions:** Verify if any exist vs. all serverless

### NOT YET CONFIGURED — DECISIONS NEEDED

#### Email Delivery Provider
- **Needed for:** Phase 1 (Contact form), Phase 3 (Re-engagement emails, notification digests), Phase 5 (Campfire notification emails)
- **Options:**

| Provider | Pros | Cons | Monthly Cost |
|---|---|---|---|
| **Resend** (Recommended) | Modern API, Next.js-native, React Email templates, generous free tier | Newer company | Free: 3,000 emails/mo, Pro: $20/mo for 50K |
| **SendGrid** | Battle-tested, extensive analytics | Complex setup, overkill for current scale | Free: 100/day |
| **Postmark** | Best deliverability reputation | No marketing email support | $15/mo for 10K |
| **Supabase Edge Function + SMTP** | No additional service | No templates, no analytics, manual SMTP config | Free (SMTP costs vary) |

**Recommendation:** Resend. Next.js integration is native, React Email lets you build templates as React components (matches the stack), and the free tier covers early-stage needs. The `@react-email/components` package works directly with it.

**Action item:** Choose provider and provision API key before Phase 1 Contact form work begins.

#### Web Push Notification Service
- **Needed for:** Phase 3 (Push notifications)
- **Requires:**
  1. VAPID key pair generation (`web-push` npm package)
  2. Service worker (`sw.js`) for push event handling
  3. `manifest.json` for PWA
  4. Supabase table for push subscriptions
- **Decision:** The roadmap specifies PWA + service worker. Verify Vercel supports service workers (it does for static files, but there are caveats with edge caching).

#### Image Generation for Social Sharing
- **Needed for:** Phase 4 (Score sharing cards), Feature 1f (Topnotcher social image)
- **Options:**

| Approach | Pros | Cons |
|---|---|---|
| **Vercel OG (`@vercel/og`)** | Native, fast, server-side, JSX-based | Limited styling, no complex layouts |
| **Canvas API (client-side)** | Full control, no server cost | Client-dependent, slower, can't pre-generate |
| **Puppeteer/Playwright** | Full HTML/CSS rendering | Heavy, slow, expensive at scale |
| **Satori** (underlying `@vercel/og`) | Same as Vercel OG but standalone | Same limitations |

**Recommendation:** `@vercel/og` for score cards (simple layout). Canvas API as fallback for topnotcher images if complex styling is needed.

---

## NPM Dependencies

### CURRENTLY INSTALLED (Referenced in codebase and skills)

| Package | Purpose | Category |
|---|---|---|
| `next` | Framework | Core |
| `react`, `react-dom` | UI library | Core |
| `@supabase/ssr` | Supabase server/client | Auth + DB |
| `@supabase/supabase-js` | Supabase JS client | Auth + DB |
| `stripe` | Stripe Node SDK | Payments |
| `zustand` | Client state management | State |
| `zod` | Schema validation | Validation |
| `tailwindcss` | Styling | CSS |
| `@tailwindcss/typography` | Prose styling (wiki articles) | CSS |
| `isomorphic-dompurify` | XSS sanitization | Security |
| `lucide-react` | Icon library (189 files) | UI |
| `phosphor-react` / `@phosphor-icons/react` | Icon library (135 files) | UI — **⚠️ consolidation needed** |
| `three` | Three.js 3D engine | 3D Lab |
| `@react-three/fiber` | React Three Fiber | 3D Lab |
| `@react-three/drei` | R3F helpers | 3D Lab |
| Various Shadcn components | UI components | UI |
| `recharts` or `chart.js` | Charts/analytics | Analytics |

### NEEDED FOR PLANNED FEATURES

| Package | Purpose | Phase |
|---|---|---|
| `@react-pdf/renderer` | Client-side PDF generation for Cram Card (Feature 4) | Feature 4 |
| `resend` | Email delivery SDK (if Resend chosen) | Phase 1, 3 |
| `@react-email/components` | React email templates | Phase 3 |
| `web-push` | VAPID key generation + push notification sending | Phase 3 |
| `@vercel/og` | Social share image generation | Phase 4 |
| `next-pwa` or manual SW | PWA/service worker setup | Phase 3 |
| `papaparse` | CSV export for analytics | Phase 2 |

---

## Supabase Storage Buckets

### CURRENTLY CONFIGURED (Verify)

| Bucket | Purpose | Access |
|---|---|---|
| `models` or `3d-models` | GLB/GLTF files for 3D Lab | Public read |
| `avatars` | User profile photos | Public read (Phase 1 adds upload) |
| `wiki-images` | Images embedded in wiki articles | Public read |

### NEEDED FOR PLANNED FEATURES

| Bucket | Purpose | Phase | Access |
|---|---|---|---|
| `share-cards` | Generated score sharing images | Phase 4 | Public read |
| `passer-images` | Topnotcher social images | Phase 5 | Public read |
| `institution-logos` | White-label logos | Phase 8 | Public read |

---

## DNS & Domain Configuration

| Domain | Purpose | Status |
|---|---|---|
| `slatecamp.com` | Production app | ✅ Configured on Vercel |
| `api.slatecamp.com` | API (if separate) | Verify — may not exist |
| `mail.slatecamp.com` | Email sending domain | **Needed for email provider** — requires DNS records (SPF, DKIM, DMARC) |

**Action item (Phase 1):** Set up email sending domain with chosen email provider. This requires DNS records and takes up to 48 hours for propagation.

---

## Rate Limiting

| Endpoint | Current Rate Limiting | Notes |
|---|---|---|
| API routes | None documented | **⚠️ Contact form needs rate limiting before Phase 1 ships** |
| Supabase API | Default Supabase rate limits | Sufficient for current scale |
| Stripe webhooks | Stripe handles retry logic | OK |

**Decision needed:** Implement rate limiting via middleware (recommended: `@upstash/ratelimit` with Vercel KV) or simple in-memory throttle for the contact form. The contact form is the most immediate need.

---

## Monitoring & Error Tracking

| Service | Purpose | Status |
|---|---|---|
| Vercel Analytics | Page views, web vitals | Likely configured — verify |
| Sentry or similar | Error tracking, crash reporting | **Unknown — verify. If not configured, add before Phase 1.** |
| Supabase Dashboard | DB monitoring, query performance | ✅ Built into Supabase |

**Recommendation:** If Sentry is not configured, add it before beginning implementation. The SRS and IRT wiring bugs shipped undetected — error tracking would have caught the missing function calls.

---

## Pre-Phase Checklists

### Before Phase 1 (Foundation Fixes)
- [ ] Email provider chosen and API key provisioned
- [ ] Email sending domain DNS records added (SPF, DKIM, DMARC)
- [ ] Error tracking (Sentry) configured if not already
- [ ] Verify `isomorphic-dompurify` is installed (needed for XSS fix)
- [ ] Verify Supabase Storage `avatars` bucket exists

### Before Phase 3 (Retention Engine)
- [ ] VAPID key pair generated for web push
- [ ] `web-push` npm package installed
- [ ] PWA manifest.json created
- [ ] Service worker strategy decided (next-pwa vs manual)
- [ ] Email templates designed (4 re-engagement emails)
- [ ] Email provider sending limits verified for expected volume

### Before Phase 4 (Growth Loop)
- [ ] `@vercel/og` installed and tested
- [ ] Social share card design finalized
- [ ] OG meta tags verified on existing pages

### Before Phase 5 (Campfire Community)
- [ ] Content moderation strategy decided (manual? automated? both?)
- [ ] Community guidelines written
- [ ] Notification email templates for Campfire activity

### Before Phase 8 (Commercialization)
- [ ] Institutional billing model decided (invoice vs. Stripe subscription)
- [ ] White-label CSS variable strategy confirmed
- [ ] 3D Lab standalone licensing terms finalized

---

*Document version: 2026-03-26 · Pre-implementation baseline*
*Update after each service provisioning or env variable addition.*
