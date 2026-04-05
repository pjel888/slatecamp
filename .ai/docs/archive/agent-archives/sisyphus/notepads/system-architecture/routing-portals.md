# Routing and Portals

**Date:** 2026-04-05

SlateCamp uses Next.js App Router with product surfaces split across four primary portal roots.

## Dashboard

- Path root: `/dashboard`
- Current route count: 44 `page.tsx` files under `src/app/dashboard`
- Major areas: analytics, wiki, testing, notes, camp trails, settings, notifications, 3D lab

## Admin

- Path root: `/admin`
- Current route count: 33 `page.tsx` files under `src/app/admin`
- Major areas: knowledge/content, taxonomy, reviews, assets, pipeline, settings

## CEO

- Path root: `/ceo`
- Source location: `src/app/(protected)/ceo`
- Current route count: 4 `page.tsx` files
- Major areas: overview, financials, insights, team

## Developer

- Path root: `/developer`
- Current route count: 11 `page.tsx` files under `src/app/developer`
- Major areas: API reference, architecture, design system, prompts, status/tooling

## Middleware Notes

- Root [`middleware.ts`](C:/Users/Philip Lewis/Desktop/slatecamp/middleware.ts) does not contain a direct `DEV_FORCE_USER_ID` bypass branch.
- Auth/session handling is delegated to [`src/lib/supabase/middleware.ts`](C:/Users/Philip Lewis/Desktop/slatecamp/src/lib/supabase/middleware.ts).
- The middleware also forwards the current pathname through the `x-pathname` header for layout-level route awareness.
