# 09 — Network and Caching

Generated: 2026-04-27T02:16:56.448Z

## Network baseline from Playwright resource timing
- Request count p50/p95: 42 / 60
- Transfer p50/p95: 231.2 KiB / 629.6 KiB

## Largest measured route transfers
| Route | Transfer p50 | Requests p50 | Cold p95 |
| --- | ---: | ---: | ---: |
| `/pricing` | 326.8 KiB | 61 | 1402 ms |
| `/` | 325.4 KiB | 60 | 1545 ms |
| `/contact` | 301.0 KiB | 57 | 1382 ms |
| `/about` | 294.9 KiB | 57 | 1380 ms |
| `/auth/reset-password` | 270.7 KiB | 42 | 1363 ms |
| `/forgot-password` | 270.4 KiB | 42 | 1349 ms |
| `/register` | 265.5 KiB | 42 | 1357 ms |
| `/login` | 265.0 KiB | 42 | 1361 ms |
| `/dashboard` | 265.0 KiB | 42 | 1369 ms |
| `/dashboard/wiki` | 265.0 KiB | 42 | 1369 ms |

## Slowest individual resource timings
| Route | Type | Duration | Transfer | Resource |
| --- | --- | ---: | ---: | --- |
| `/` | fetch | 46 ms | 0.8 KiB | `http://localhost:3217/register?_rsc=1r34m` |
| `/` | fetch | 46 ms | 0.8 KiB | `http://localhost:3217/login?_rsc=1r34m` |
| `/` | script | 36 ms | 43.4 KiB | `http://localhost:3217/_next/static/chunks/0b-piy5eootl1.js` |
| `/register` | script | 35 ms | 53.2 KiB | `http://localhost:3217/_next/static/chunks/0_smmzknl9ine.js` |
| `/` | script | 33 ms | 6.6 KiB | `http://localhost:3217/_next/static/chunks/0gyz64yr6t~f3.js` |
| `/` | script | 33 ms | 22.8 KiB | `http://localhost:3217/_next/static/chunks/0zs448320-qgc.js` |
| `/` | script | 32 ms | 10.7 KiB | `http://localhost:3217/_next/static/chunks/09ns97h9o7ncy.js` |
| `/login` | script | 32 ms | 53.2 KiB | `http://localhost:3217/_next/static/chunks/0_smmzknl9ine.js` |
| `/` | script | 32 ms | 5.5 KiB | `http://localhost:3217/_next/static/chunks/12tu~j1xlxcyc.js` |
| `/dashboard` | script | 31 ms | 53.2 KiB | `http://localhost:3217/_next/static/chunks/0_smmzknl9ine.js` |
| `/` | script | 31 ms | 4.7 KiB | `http://localhost:3217/_next/static/chunks/0wz0w08kgtzob.js` |
| `/login` | script | 31 ms | 6.6 KiB | `http://localhost:3217/_next/static/chunks/0gyz64yr6t~f3.js` |
| `/login` | script | 31 ms | 9.8 KiB | `http://localhost:3217/_next/static/chunks/0id79jb2t3gzf.js` |
| `/register` | script | 31 ms | 9.8 KiB | `http://localhost:3217/_next/static/chunks/0id79jb2t3gzf.js` |
| `/login` | script | 31 ms | 3.1 KiB | `http://localhost:3217/_next/static/chunks/0t_z3k4nu4~rs.js` |
| `/register` | script | 30 ms | 3.1 KiB | `http://localhost:3217/_next/static/chunks/0t_z3k4nu4~rs.js` |
| `/register` | script | 30 ms | 6.6 KiB | `http://localhost:3217/_next/static/chunks/0gyz64yr6t~f3.js` |
| `/register` | script | 30 ms | 5.3 KiB | `http://localhost:3217/_next/static/chunks/0mqgzelv7i61s.js` |
| `/register` | script | 30 ms | 22.8 KiB | `http://localhost:3217/_next/static/chunks/0zs448320-qgc.js` |
| `/` | script | 29 ms | 11.3 KiB | `http://localhost:3217/_next/static/chunks/07a1a2kxrw2h~.js` |

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
