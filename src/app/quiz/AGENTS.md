<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-02 | Updated: 2026-04-02 -->

# Quiz

## Purpose
Quiz/testing mode router and container. Redirects quiz index to testing hub; hosts nested routes for quiz setup, active sessions, results, and review across multiple testing modes (Camp, Storm, Chill, Blindspot). Full-screen focused experience with no dashboard sidebar.

## Key Files
| File | Description |
|------|-------------|
| `page.tsx` | Server component redirecting `/quiz` to `/testing` |
| `layout.tsx` | Minimal container (no sidebar, full focus) with surface-light background |
| `[mode]/setup/page.tsx` | Server component for quiz mode selection and configuration |
| `[mode]/setup/client.tsx` | Client component handling setup form interactivity |
| `[mode]/session/[sessionId]/page.tsx` | Live quiz session page (question, timer, answer tracking) |
| `[mode]/session/[sessionId]/results/page.tsx` | Results page showing session performance metrics |
| `[mode]/session/[sessionId]/review/page.tsx` | Question review page with explanations and misconceptions |
| `loading.tsx`, `[mode]/setup/loading.tsx`, etc. | Skeleton loaders for each page |

## For AI Agents
### Working In This Directory
- **Naming:** `[mode]` is the testing mode (camp, storm, chill, blindspot) — NOT user-selected tabs but pedagogically distinct test modes
- **Session flow:** Setup → Live Session → Results → Review (each has its own page + loading state)
- **Server-first:** All pages are Server Components; setup/client.tsx is the interactivity layer
- **No auth check here** — auth is enforced at the layout/parent level (check `src/app/(dashboard)` for context)
- **Redirect pattern:** Index redirects to `/testing` (testing hub lives elsewhere in app structure)
- **Loading states:** Must provide loading.tsx at each segment to prevent layout shift

## Dynamic Routes
- `[mode]` — Testing mode ID (camp, storm, chill, blindspot)
- `[sessionId]` — Unique session identifier (UUID format)

## Dependencies
### Internal
- `@/lib/constants/routes` — `ROUTES.TESTING` for redirect target
- `next/navigation` — `redirect()` function
- Testing/quiz state likely managed at parent level or via Zustand store (check components)

<!-- MANUAL: -->
