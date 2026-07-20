# Plan 008 — Add `optimizePackageImports` to next.config.ts

> Audit: 2026-07-20, commit `064e3a43a`. Category: performance (bundle weight). Severity: HIGH. Effort: S. Risk: low.
> **Status: ✅ APPLIED.** Vetted against live code: `next.config.ts` had no `experimental.optimizePackageImports`.

## Why this mattered

Next.js 13.5+ [Optimize Package Imports](https://nextjs.org/docs/app/api-reference/next-config-js/optimizePackageImports) automatically rewrites barrel `index.ts` imports into direct imports, saving ~200–800ms of first-load JS on barrel-heavy routes. The repo has many barrel files (`src/components/wiki/index.ts`, etc.) and consumers using them, plus icon libraries (`@phosphor-icons/react`, `lucide-react`). One-line config change, no behavioral risk.

## What was changed

In `next.config.ts`, extended the existing `experimental` block with `optimizePackageImports` listing: `@phosphor-icons/react`, `lucide-react`, `framer-motion`, `@radix-ui/react-toast`, `@radix-ui/react-tooltip`, `@radix-ui/react-slot`, `@base-ui/react`, `cmdk`, `date-fns`, `@tiptap/react`, `@tiptap/starter-kit`, `marked`, `remark-gfm`, `@tanstack/react-table`, `recharts`. Deliberately did NOT add `three`/`@react-three/*` — those are handled via `next/dynamic` (Plans 005, 006).

## Verification

- `bun run type-check` — exit 0.
- `bun run lint` — exit 0.
- `bun run build` — succeeds with no unknown-config-key warnings.

## Maintenance note

When adding a new barrel-heavy dependency, add it to the list and re-run `bun run build` to confirm it's installed and accepted.
