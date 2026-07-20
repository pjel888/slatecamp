# Plan 006 — Dynamic-import DoorHinge3D + three.js in wiki tree

> Audit: 2026-07-20, commit `064e3a43a`. Category: performance (bundle weight). Severity: HIGH. Effort: S. Risk: low.
> **Status: ✅ APPLIED.** Vetted against live code: `src/components/wiki/blocks/DoorHinge3D.tsx:1-6` static imports of `@react-three/fiber`, `@react-three/drei`, `three`; registered in `src/components/wiki/article/WikiArticle.tsx:223`.

## Why this mattered

`DoorHinge3D` statically imported R3F + drei + three.js (~150–300 KB+ minified), was a `'use client'` component, and was registered in the `WikiArticle.tsx` components map — so every wiki article shipped the full R3F/three.js runtime even when no article used the hinge block. The 3D Lab itself already does dynamic import correctly; this was a wiki-tree regression.

## What was changed

In `src/components/wiki/article/WikiArticle.tsx`:
- Removed `import { DoorHinge3D } from '../blocks/DoorHinge3D'`.
- Added `const DoorHinge3D = dynamic(() => import('../blocks/DoorHinge3D').then(m => ({ default: m.DoorHinge3D })), { loading: () => <skeleton/> })`.
- Did NOT pass `ssr: false` (Server Component — see Plan 005).
- The `DoorHinge3D,` entry in the components map is unchanged.

## Verification

- `bun run type-check` — exit 0.
- `bun run lint` — exit 0.
- `bun run build` — succeeds; three.js + R3F + drei split into separate chunks.
