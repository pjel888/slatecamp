# GEMINI.md - Slatecamp Engineering & Architecture

This document serves as the primary context for Gemini CLI when operating within the Slatecamp repository.

## 1. Core Mission & Brand
- **Mission:** High-performance ALE prep for Philippine Architecture Licensure Exam.
- **Brand:** **Slatecamp** (formerly Campfire). Warm, research-backed, inviting but professional.
- **Design System:** **Slatecamp Design System**. Built on shadcn/ui + Tailwind CSS 4.
- **Tone:** Growth-framed, pedagogical, deterministic (zero-temperature AI).

## 2. Technical Stack (Panopticon V8)
- **Framework:** Next.js 16.1.6 (App Router), React 19.
- **Database:** Supabase (PostgreSQL 17).
- **Payments:** **LemonSqueezy** (Main), PayRex (Philippines Local).
- **State:** Zustand (Client State), React Context (Domain State).
- **3D:** Three.js + @react-three/fiber (3D Lab modules).
- **Science:** IRT 2PL mastery model, SM-2 Spaced Repetition.

## 3. Architecture Blueprints (Reference `.ai/plans/`)
- **Admin Portal:** Content pipeline (Draft → SME Review → Published).
- **API Routes:** All write actions must have `requireAdmin` or role-based gating.
- **Auth:** `TierContext` drives UI gating; server actions must verify subscription tiers.
- **Database:** 72-table schema. RLS is mandatory for all user-data tables.
- **Testing Engine:** `intelligent-routing.ts` selects questions based on IRT/SRS.

## 4. Critical Constraints & Mandates
- **No Confetti:** Strictly forbidden. No generic gamification.
- **Zero Temperature:** AI tutoring (`/api/ai/tutor`) must use `temperature: 0.0`.
- **Vanilla CSS Patterns:** Prefer semantic Tailwind classes over complex utility soup.
- **Idempotency:** All payment webhooks and critical content mutations must support `X-Idempotency-Key`.
- **Hydration Safety:** Avoid `localStorage` for security-critical state (use Server Session).

## 5. Development Workflow
- **Research:** Check `.ai/docs/` for specific domain deep-dives.
- **Verification:** Run `bun run lint` and `bun run type-check` after changes.
- **Schema:** Update `DATABASE_SCHEMA.sql` and create a migration in `supabase/migrations/` for any DDL changes.

---
*Last Updated: 2026-04-07 (Pass 4 Refactor)*

<!-- code-review-graph MCP tools -->
## MCP Tools: code-review-graph

**IMPORTANT: This project has a knowledge graph. ALWAYS use the
code-review-graph MCP tools BEFORE using Grep/Glob/Read to explore
the codebase.** The graph is faster, cheaper (fewer tokens), and gives
you structural context (callers, dependents, test coverage) that file
scanning cannot.

### When to use graph tools FIRST

- **Exploring code**: `semantic_search_nodes` or `query_graph` instead of Grep
- **Understanding impact**: `get_impact_radius` instead of manually tracing imports
- **Code review**: `detect_changes` + `get_review_context` instead of reading entire files
- **Finding relationships**: `query_graph` with callers_of/callees_of/imports_of/tests_for
- **Architecture questions**: `get_architecture_overview` + `list_communities`

Fall back to Grep/Glob/Read **only** when the graph doesn't cover what you need.

### Key Tools

| Tool | Use when |
|------|----------|
| `detect_changes` | Reviewing code changes — gives risk-scored analysis |
| `get_review_context` | Need source snippets for review — token-efficient |
| `get_impact_radius` | Understanding blast radius of a change |
| `get_affected_flows` | Finding which execution paths are impacted |
| `query_graph` | Tracing callers, callees, imports, tests, dependencies |
| `semantic_search_nodes` | Finding functions/classes by name or keyword |
| `get_architecture_overview` | Understanding high-level codebase structure |
| `refactor_tool` | Planning renames, finding dead code |

### Workflow

1. The graph auto-updates on file changes (via hooks).
2. Use `detect_changes` for code review.
3. Use `get_affected_flows` to understand impact.
4. Use `query_graph` pattern="tests_for" to check coverage.
