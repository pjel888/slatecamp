# 09 — Network and Caching

Generated: 2026-04-27T02:40:07.876Z

## Network baseline from Playwright resource timing
- Request count p50/p95: 26 / 33
- Transfer p50/p95: 3652.2 KiB / 8510.4 KiB

## Largest measured route transfers
| Route | Transfer p50 | Requests p50 | Cold p95 |
| --- | ---: | ---: | ---: |
| `/register` | 6864.3 KiB | 30 | 8341 ms |
| `/dashboard/analytics` | 6476.1 KiB | 33 | 55430 ms |
| `/dashboard/settings` | 5698.2 KiB | 26 | 7531 ms |
| `/dashboard/wiki` | 5474.0 KiB | 28 | 18602 ms |
| `/dashboard` | 5295.6 KiB | 31 | 6897 ms |
| `/dashboard/3d-lab` | 4859.7 KiB | 26 | 44219 ms |
| `/forgot-password` | 4101.9 KiB | 21 | 4751 ms |
| `/pricing` | 4055.2 KiB | 25 | 9524 ms |
| `/auth/reset-password` | 4053.9 KiB | 20 | 5062 ms |
| `/try` | 3685.0 KiB | 21 | 3923 ms |

## Slowest individual resource timings
| Route | Type | Duration | Transfer | Resource |
| --- | --- | ---: | ---: | --- |
| `/dashboard` | script | 5226 ms | 2657.2 KiB | `http://localhost:3217/_next/static/chunks/main-app.js?v=1777257076379` |
| `/dashboard` | script | 5056 ms | 1303.6 KiB | `http://localhost:3217/_next/static/chunks/app/dashboard/page.js` |
| `/dashboard/analytics` | script | 4863 ms | 2657.2 KiB | `http://localhost:3217/_next/static/chunks/main-app.js?v=1777257237795` |
| `/dashboard/analytics` | script | 4769 ms | 2356.8 KiB | `http://localhost:3217/_next/static/chunks/app/dashboard/analytics/page.js` |
| `/dashboard/analytics` | script | 4532 ms | 1303.6 KiB | `http://localhost:3217/_next/static/chunks/app/dashboard/page.js` |
| `/dashboard/analytics` | script | 4406 ms | 205.0 KiB | `http://localhost:3217/_next/static/chunks/app/dashboard/error.js` |
| `/dashboard/analytics` | script | 4360 ms | 128.5 KiB | `http://localhost:3217/_next/static/chunks/app/dashboard/analytics/error.js` |
| `/dashboard/analytics` | link | 4228 ms | 11.2 KiB | `http://localhost:3217/_next/static/media/bc08e10e1c60a660-s.p.woff2?v=1777257237795` |
| `/dashboard/analytics` | link | 4160 ms | 8.8 KiB | `http://localhost:3217/_next/static/media/b7ea2ab4a8ad1f81-s.p.woff2?v=1777257237795` |
| `/dashboard/analytics` | link | 4135 ms | 11.4 KiB | `http://localhost:3217/_next/static/media/9816a0e0ed309b6c-s.p.woff2?v=1777257237795` |
| `/dashboard/analytics` | link | 4095 ms | 34.0 KiB | `http://localhost:3217/_next/static/media/8a1d8947e5852e30-s.p.woff2?v=1777257237795` |
| `/dashboard/analytics` | link | 4055 ms | 9.6 KiB | `http://localhost:3217/_next/static/media/76fcc95954fbfc88-s.p.woff2?v=1777257237795` |
| `/dashboard/analytics` | link | 3997 ms | 9.6 KiB | `http://localhost:3217/_next/static/media/5d259b4d93dec8ad-s.p.woff2?v=1777257237795` |
| `/dashboard/analytics` | link | 3964 ms | 23.5 KiB | `http://localhost:3217/_next/static/media/56da557e531d1081-s.p.woff2?v=1777257237795` |
| `/dashboard/analytics` | link | 3935 ms | 24.9 KiB | `http://localhost:3217/_next/static/media/3dc379dc9b5dec12-s.p.woff2?v=1777257237795` |
| `/dashboard/analytics` | link | 3896 ms | 8.8 KiB | `http://localhost:3217/_next/static/media/0e96d314a90a6138-s.p.woff2?v=1777257237795` |
| `/dashboard/analytics` | script | 3778 ms | 520.5 KiB | `http://localhost:3217/_next/static/chunks/app/layout.js` |
| `/dashboard` | script | 3720 ms | 205.0 KiB | `http://localhost:3217/_next/static/chunks/app/dashboard/error.js` |
| `/dashboard` | script | 3639 ms | 347.1 KiB | `http://localhost:3217/_next/static/chunks/app/layout.js` |
| `/dashboard` | script | 3624 ms | 163.2 KiB | `http://localhost:3217/_next/static/chunks/app/dashboard/not-found.js` |

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
