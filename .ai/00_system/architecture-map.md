# Architecture Map

**Last Updated:** 2026-04-16

## Top-level runtime layers
| Layer | Primary paths | Notes |
| --- | --- | --- |
| App/route surface | `src/app/` | Multi-portal App Router runtime |
| Shared component layer | `src/components/` | Portal, wiki, admin, analytics, quiz, graphics, shared UI |
| Feature modules | `src/features/` | Especially 3D Lab and wall configurator |
| Domain/service layer | `src/lib/` | Actions, queries, entitlements, readiness, wiki, payments, logging |
| Client state/hooks | `src/stores/`, `src/hooks/` | Quiz/session state plus interaction-heavy hooks |
| Data/schema layer | `DATABASE_SCHEMA.sql`, `supabase/migrations/` | Database truth and evolution history |
| Operational layer | `.ai/`, `AGENTS.md` | Repo intelligence and execution governance |

## Major application domains
- **Dashboard:** study flows, notes, analytics, wiki, 3D Lab, testing, pods, trails, results
- **Admin:** content, questions, taxonomy, reviews, assets, audit, pipeline, preview, settings
- **Developer:** docs, architecture, status, console, db, logs, test data
- **Protected/CEO:** analytics, financials, insights, team
- **Public/product marketing:** auth, about, contact, pricing, try, calculators, tools

## Architectural hotspots
- `src/lib/actions/` breadth makes mutation patterns hard to reason about globally
- `src/stores/useQuizStore.ts` is a high-importance client-state hub
- `src/features/3d-lab` and related hooks/stores are performance-sensitive client-heavy domains
- Admin content/question flows span route, component, action, and query layers extensively
