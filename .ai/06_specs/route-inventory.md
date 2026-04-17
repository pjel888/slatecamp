# Route Inventory

**Last Updated:** 2026-04-16

## Route groups by volume
| Group | Approx pages |
| --- | ---: |
| `dashboard` | 46 |
| `admin` | 38 |
| `developer` | 11 |
| `(protected)/ceo` | 5 |
| `quiz` | 5 |
| `calculators` | 5 |
| `tools` | 4 |
| auth/public/supporting routes | remainder |

## Important surfaces
- `src/app/dashboard/*` — primary learner experience
- `src/app/admin/*` — content and governance tooling
- `src/app/developer/*` — internal docs/status/dev tools
- `src/app/(protected)/ceo/*` — business analytics and team surfaces
- `src/app/quiz/*` — session setup, active sessions, results, review
- `src/app/api/*` — AI, payments, cron, webhooks, admin flags, auth callback

## Notes
- Dashboard and admin dominate route complexity.
- 96 loading states across 125 pages is good coverage, but not proof of good perceived performance.
- Developer and CEO surfaces are smaller but still material enough to need current docs.
