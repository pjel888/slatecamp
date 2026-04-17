# Route Inventory

**Last Updated:** 2026-04-17

## Current route counts

- `124` `page.tsx` files
- `16` `layout.tsx` files
- `95` `loading.tsx` files
- `9` `error.tsx` files
- `12` route handlers

## Route groups by volume

| Group | Current shape |
| --- | --- |
| `dashboard` | largest learner-facing surface, including 3D Lab, analytics, area-c, camp trails, drills, notes, pods, testing, wiki, and upgrade flows |
| `admin` | largest internal tooling surface, including articles, content, questions, taxonomy, pipeline, reviews, assets, audit, search, and settings |
| `developer` | internal architecture, API reference, status, and tool surfaces |
| `(protected)/ceo` | business analytics, financials, insights, and team views |
| `quiz` | mode setup, live session, results, and review flows |
| `calculators` | material-specific calculators under a dedicated route group |
| `tools` | standalone utility calculators and plotter tools |

## Important surfaces

- `src/app/dashboard/*` — primary learner experience
- `src/app/admin/*` — content and governance tooling
- `src/app/developer/*` — internal docs, status, and developer tools
- `src/app/(protected)/ceo/*` — business analytics and team surfaces
- `src/app/quiz/*` — session setup, active sessions, results, and review
- `src/app/api/*` — AI, payments, cron, webhooks, admin flags, and auth callback

## Current API route handlers

- `api/admin/flags`
- `api/ai/embed`
- `api/ai/generate-questions`
- `api/ai/socratic`
- `api/ai/study-agent`
- `api/ai/tutor`
- `api/cron/blindspot-scan`
- `api/cron/compute-signals`
- `api/payments/checkout`
- `api/webhooks/lemonsqueezy`
- `api/webhooks/payrex`
- `auth/callback`

## Notes

- Dashboard and admin dominate route complexity.
- Route coverage is broad, but loading-file presence alone is not proof of good perceived performance.
- Developer and CEO surfaces are smaller than dashboard/admin, but still significant enough to require accurate docs and ownership.
