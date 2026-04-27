# 09 — Network and Caching

Generated: 2026-04-27T04:04:04.250Z

## Network baseline from Playwright resource timing
- Request count p50/p95: 30 / 46
- Transfer p50/p95: 3702.0 KiB / 7608.6 KiB

## Largest measured route transfers
| Route | Transfer p50 | Requests p50 | Cold p95 |
| --- | ---: | ---: | ---: |
| `/dashboard/analytics` | 8186.2 KiB | 28 | 43768 ms |
| `/dashboard` | 5335.1 KiB | 26 | 24815 ms |
| `/dashboard/settings` | 5085.8 KiB | 35 | 8190 ms |
| `/dashboard/3d-lab` | 5033.0 KiB | 29 | 38129 ms |
| `/dashboard/wiki` | 4941.8 KiB | 37 | 17989 ms |
| `/forgot-password` | 4208.0 KiB | 31 | 8007 ms |
| `/pricing` | 4137.6 KiB | 26 | 45727 ms |
| `/auth/reset-password` | 4131.2 KiB | 27 | 8537 ms |
| `/` | 4032.2 KiB | 36 | 3263 ms |
| `/try` | 3677.2 KiB | 30 | 8601 ms |

## Slowest individual resource timings
| Route | Type | Duration | Transfer | Resource |
| --- | --- | ---: | ---: | --- |
| `/dashboard/3d-lab` | script | 16711 ms | 2657.2 KiB | `http://localhost:3217/_next/static/chunks/main-app.js?v=1777262067576` |
| `/dashboard` | script | 15863 ms | 2657.2 KiB | `http://localhost:3217/_next/static/chunks/main-app.js?v=1777261619897` |
| `/dashboard/3d-lab` | script | 15748 ms | 2249.3 KiB | `http://localhost:3217/_next/static/chunks/app/dashboard/layout.js` |
| `/dashboard/analytics` | script | 11041 ms | 2657.2 KiB | `http://localhost:3217/_next/static/chunks/main-app.js?v=1777261892321` |
| `/dashboard` | script | 10314 ms | 2657.2 KiB | `http://localhost:3217/_next/static/chunks/main-app.js?v=1777261639490` |
| `/dashboard/analytics` | script | 9904 ms | 2356.8 KiB | `http://localhost:3217/_next/static/chunks/app/dashboard/analytics/page.js` |
| `/dashboard/analytics` | script | 9668 ms | 2657.2 KiB | `http://localhost:3217/_next/static/chunks/main-app.js?v=1777261974604` |
| `/dashboard` | script | 9246 ms | 2249.3 KiB | `http://localhost:3217/_next/static/chunks/app/dashboard/layout.js` |
| `/dashboard/analytics` | script | 9212 ms | 2356.8 KiB | `http://localhost:3217/_next/static/chunks/app/dashboard/analytics/page.js` |
| `/dashboard/analytics` | script | 8815 ms | 2657.2 KiB | `http://localhost:3217/_next/static/chunks/main-app.js?v=1777261873589` |
| `/dashboard/analytics` | script | 8079 ms | 2249.3 KiB | `http://localhost:3217/_next/static/chunks/app/dashboard/layout.js` |
| `/pricing` | script | 8004 ms | 2657.2 KiB | `http://localhost:3217/_next/static/chunks/main-app.js?v=1777261440892` |
| `/dashboard` | script | 7999 ms | 2657.2 KiB | `http://localhost:3217/_next/static/chunks/main-app.js?v=1777261688322` |
| `/dashboard` | script | 6921 ms | 1303.6 KiB | `http://localhost:3217/_next/static/chunks/app/dashboard/page.js` |
| `/dashboard/analytics` | script | 6680 ms | 2657.2 KiB | `http://localhost:3217/_next/static/chunks/main-app.js?v=1777261929868` |
| `/dashboard` | script | 6542 ms | 1303.6 KiB | `http://localhost:3217/_next/static/chunks/app/dashboard/page.js` |
| `/pricing` | script | 6473 ms | 1319.7 KiB | `http://localhost:3217/_next/static/chunks/app/pricing/page.js` |
| `/dashboard/analytics` | script | 6418 ms | 2657.2 KiB | `http://localhost:3217/_next/static/chunks/main-app.js?v=1777261938572` |
| `/dashboard/3d-lab` | script | 6396 ms | 2657.2 KiB | `http://localhost:3217/_next/static/chunks/main-app.js?v=1777262019501` |
| `/dashboard` | script | 6368 ms | 2657.2 KiB | `http://localhost:3217/_next/static/chunks/main-app.js?v=1777261602522` |

## Caching architecture evidence
- Next config defines global security headers and image remote patterns.
- Inventory found 69 files with cache/revalidation/browser-storage signals.
- Dashboard and taxonomy/wiki loaders include unstable_cache usage per static backend audit.
- Middleware updates Supabase session for non-static/image routes, affecting route TTFB.
- Supabase query scan found 160 possible broad reads.

## Cache risks
1. Some cached data may be requested again from client effects.
2. API route handlers do not expose explicit revalidate/runtime/maxDuration metadata in inventory.
3. External AI/payment/provider calls need explicit timeout and cache/non-cache decisions.
4. Production response headers should be measured separately from local dev.
