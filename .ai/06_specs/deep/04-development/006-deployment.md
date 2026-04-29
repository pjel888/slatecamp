# Deployment

**Status:** Active  
**Version:** 1.0  
**Last Updated:** 2026-04-06  
**Source-of-Truth:** `vercel.json`, `CLAUDE.md`

---

## Platform

SlateCamp deploys to **Vercel**.

---

## Build Command

```bash
bun run build
```

This runs `next build` to create the production build.

### Build Status (as of 2026-04-05)

**Currently failing.** The build fails after compile and type-check steps complete successfully:

```
ENOENT: no such file or directory, open '.next/required-server-files.json'
```

This is a known issue — the build pipeline does not complete the required-server-files step.

---

## Environment Variables on Vercel

Configure these in Vercel dashboard → Project → Environment Variables:

| Variable | Required | Notes |
|---------|---------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Server-only operations |
| `NEXT_PUBLIC_APP_URL` | ✅ | Production URL |
| `CRON_SECRET` | ✅ | Cron job authorization |
| `NEXT_PUBLIC_DEMO_MODE` | Optional | Enable demo mode |
| `ALLOW_DEV_PORTAL_BYPASS` | Optional | Developer portal bypass |
| `OPENAI_API_KEY` | Optional | AI tutor |
| `LEMONSQUEEZY_API_KEY` | Optional | Payments |
| `PAYREX_API_KEY` | Optional | Philippine payments |

---

## Cron Jobs

Configured in `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/focus-review-scan",
      "schedule": "0 16 * * *"
    },
    {
      "path": "/api/cron/compute-signals",
      "schedule": "30 16 * * *"
    }
  ]
}
```

### Blindspot Scan

- **Path:** `/api/cron/focus-review-scan`
- **Schedule:** Daily at 4:00 PM UTC
- **Purpose:** Refresh the blindspot queue — identifies 3 weakest mastered nodes + unexplored grey nodes
- **Auth:** `Authorization: Bearer ${CRON_SECRET}`

### Compute Signals

- **Path:** `/api/cron/compute-signals`
- **Schedule:** Daily at 4:30 PM UTC
- **Purpose:** Recalculate competence signals for all users
- **Auth:** `Authorization: Bearer ${CRON_SECRET}`

---

## Deployment Steps

```bash
# Install Vercel CLI (if not installed)
npm install -g vercel

# Login to Vercel
vercel login

# Deploy preview
vercel

# Deploy to production
vercel --prod
```

Or connect the GitHub repository to Vercel for automatic deployments on push to `main`.

---

## Server Actions Configuration

`next.config.ts` includes:
- Server actions with 4MB body limit
- Image remote patterns for external images

---

## Vercel Configuration

| Setting | Value |
|---------|-------|
| Framework | Next.js |
| Build Command | `bun run build` |
| Output Directory | `.next` |
| Install Command | `bun install` |
| Runtime | Node.js |
| Regions | Auto (Vercel default) |

---

## Troubleshooting

### Build Fails: `.next/required-server-files.json`

This is a known issue with the current build pipeline. The build fails after compile/type-check succeed. Investigate:
1. Is `bun run build` completing locally?
2. Check `.next/` directory after build
3. Verify `next.config.ts` configuration

### Cron Jobs Not Running

1. Verify `CRON_SECRET` is set in Vercel environment variables
2. Check cron endpoint returns `200` with valid auth header
3. Review Vercel Cron Jobs dashboard for execution history

---

*Source: `vercel.json`, `CLAUDE.md`, `next.config.ts`*



## 2026-04-29 audit note

This document may include historical product/reference language. Current codebase route truth for cron jobs is `/api/cron/focus-review-scan` and `/api/cron/compute-signals` from `src/app/api/cron/**/route.ts` and `vercel.json`.
