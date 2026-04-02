<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-02 | Updated: 2026-04-02 -->

# Camp Trails

## Purpose
Structured study paths (Camp Trails) implementation. Multi-day, topic-paced learning prescriptions calibrated to user's exam date and knowledge gaps. Hub displays active enrollments, recommendations, and trail library. Authenticated dashboard area.

## Key Files
| File | Description |
|------|-------------|
| `page.tsx` | Hub page listing active trails, recommendations, and full trail library |
| `[slug]/page.tsx` | Trail detail/overview page |
| `[slug]/today/page.tsx` | Today's lesson/daily study prescription page |
| `[slug]/day/[dayNumber]/complete/page.tsx` | Completion confirmation page after daily session |
| `loading.tsx`, `[slug]/loading.tsx`, etc. | Skeleton loaders |

## For AI Agents
### Working In This Directory
- **Auth required** — user must be logged in (check parent dashboard auth)
- **Hub pattern:** Index page orchestrates three zones: (1) active trail banner, (2) recommendation card, (3) trail library grid
- **Data flow on hub (page.tsx):** Promise.all fetches [trails, enrollments, recommendation] in parallel; filters active enrollments; maps trails to enrollment data
- **Single focus above fold:** Only ONE active trail or recommendation shown; prevents cognitive overload
- **Empty state:** Welcoming message when no trails available (no panic, suggests Camp Mode or Wiki as alternatives)
- **Daily experience:** `[slug]/today/page.tsx` shows "daily prescription"; completion flows to `/day/[dayNumber]/complete`
- **Enrollment states:** Track `status === 'active'` vs. completed/paused
- **URL structure:** `/dashboard/camptrails/[slug]` (slug is trail identifier), `/[slug]/today`, `/[slug]/day/[dayNumber]/complete`

## Dynamic Routes
- `[slug]` — Trail identifier/slug (friendly URL segment)
- `[dayNumber]` — Day number (integer or date-based identifier)

## Dependencies
### Internal
- `@/components/layouts/SharedPageLayout` — Dashboard layout wrapper
- `@/lib/queries/trails` — `getPublishedTrails()`, `getUserEnrollments()`, `recommendTrail()` server functions
- `@/types/app` — `CampTrail`, `TrailEnrollment` types
- `@/components/trails/{RecommendedTrailCard,ActiveTrailBanner,TrailLibrary}` — UI components
- `@phosphor-icons/react/dist/ssr` — Icons (MapTrifold, Compass)

<!-- MANUAL: -->
