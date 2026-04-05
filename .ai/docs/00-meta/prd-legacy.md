# SlateCamp PRD

**Last Updated:** 2026-04-06  
**Version:** 5.0  
**Source:** `README.md`, `src/app/*/AGENTS.md`

---

## What is SlateCamp?

SlateCamp is an ALE prep platform built for the Philippine Architecture Licensure Exam. The product combines adaptive quiz flows, an expert-linked wiki, analytics, admin tooling, and interactive 3D learning modules under a shared Next.js codebase.

## Portals

| Portal | Route | Purpose |
|--------|-------|---------|
| Dashboard | `/dashboard` | Student-facing study experience |
| Admin | `/admin` | Content, taxonomy, review, publishing workflows |
| CEO | `/ceo` | Internal business reporting |
| Developer | `/developer` | Engineering docs and tools |

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 16.1.6 (App Router), React 19.2.4 |
| Language | TypeScript 5.9.3 |
| Styling | Tailwind CSS 4 with Campfire design tokens |
| Database | Supabase SSR + PostgreSQL |
| Client State | Zustand |
| Server State | Server Components |
| 3D | React Three Fiber + Three.js |
| Package Manager | Bun |
| CI/CD | Vercel |
| Payments | Stripe + Payrex |

## Key Files

| File | Purpose |
|------|---------|
| `CLAUDE.md` | Absolute constraints, tech rules |
| `AGENTS.md` | Codebase overview, patterns |
| `DATABASE_SCHEMA.sql` | Authoritative relational schema |
| `package.json` | Dependencies, scripts, versions |
| `src/app/globals.css` | Design tokens, colors, radii, transitions |
| `src/app/*/AGENTS.md` | Portal-specific structure, routes, components |

## Key Domain Logic

| Domain | Location |
|--------|----------|
| Readiness scoring | `src/lib/readiness-score.ts` |
| SRS/IRT logic | `src/lib/srs/` |
| Quiz engine | `src/lib/quiz/` + `src/lib/actions/quiz-v2/` |
| 3D learning | `src/features/3d-lab/` + `src/app/dashboard/3d-lab/` |
| Calculators | `src/app/calculators/` |
| Wiki | `src/components/wiki/` + related actions |
| Testing modes | `src/lib/actions/testing.ts` |

## Absolute Constraints

- **Arrow functions only** — no `function` declarations
- **Server Components by default** — client at leaf nodes only
- **Design tokens from `globals.css`** — no hardcoded hex values
- **Supabase auth via middleware** — session refresh in `middleware.ts`
- **IRT 2PL model** — for all mastery/readiness calculations
- **No generic gamification** — no confetti, badges, virtual currency, empty streaks
- **Minimum text size:** 8px
- **Arrow functions only** — never use `function` declarations

## Development Commands

```bash
bun install
bun run dev          # Start dev server
bun run lint         # ESLint checks
bun run type-check   # TypeScript strict mode
bun test             # Run tests
bun run build        # Production build
```

## Database

- **Tables:** 51 total (50 with RLS)
- **RLS Policies:** 89+
- **Migrations:** 60
- **Package Manager:** Bun

---

*This file is the authoritative product/project definition. Update this before updating any documentation.*
