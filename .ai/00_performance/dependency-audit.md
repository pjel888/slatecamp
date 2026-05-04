# Dependency Audit Report

**Date:** 2026-05-04
**Branch:** codebase-modernization-batch1-2
**Workspace:** /Users/philiplewis/slatecamp

---

## 1. @anthropic-ai/sdk — Status: UNUSED (4.9 MB)

### Verdict: SAFE TO REMOVE

### Evidence
- **Zero imports** anywhere in `src/`, `scripts/`, or `.ai/` (searched for `from "@anthropic-ai/sdk"`, `require("@anthropic-ai/sdk")`, and dynamic import patterns)
- All Anthropic API calls use raw `fetch()`:
  - `src/lib/ai/provider.ts` (line 160-243): `AnthropicProvider` class calls `fetch('https://api.anthropic.com/v1/messages', ...)` directly — no SDK import
  - `src/lib/actions/teach-back.ts` (line 181): `evaluateTeachBack()` calls `fetch('https://api.anthropic.com/v1/messages', ...)` directly — no SDK import
- The only source-code reference to the package name is in `src/lib/developer/tech-stack.ts` (line 39), which reads the version string from `package.json` for display purposes — this is a meta-reference, not an SDK import
- `next.config.ts` CSP allows `*.anthropic.com` in `connect-src` — this is an allowlist for the raw `fetch()` calls, not SDK usage
- Previously flagged in `.ai/00_performance/optimization-audit-report.md` (lines 56, 75) as "Potentially unused but needs verification"

### What to do
1. Remove `"@anthropic-ai/sdk": "^0.78.0"` from `package.json` dependencies
2. Update `src/lib/developer/tech-stack.ts` line 39 to use `openai` as the AI label, or replace with a generic AI label
3. Run `bun install` to update lockfile

---

## 2. openai — Status: UNUSED (13 MB)

### Verdict: SAFE TO REMOVE

### Evidence
- **Zero imports** anywhere in `src/` (searched for `from "openai"`, `require("openai")`)
- All OpenAI API calls use raw `fetch()`:
  - `src/lib/ai/provider.ts` (line 58-157): `OpenAIProvider` class calls `fetch('https://api.openai.com/v1/chat/completions', ...)` and `fetch('.../embeddings', ...)` directly — no SDK import
- The `openai` npm package (^6.35.0) is a heavy SDK that is never actually imported

### What to do
1. Remove `"openai": "^6.35.0"` from `package.json` dependencies
2. Run `bun install` to update lockfile

---

## 3. geist — Status: UNUSED (7.9 MB)

### Verdict: SAFE TO REMOVE

### Evidence
- **Zero imports** in `src/` — no `from 'geist'` or `next/font/google` loading of Geist fonts
- The application layout (`src/app/layout.tsx`) uses Google Fonts via `next/font/google`: Atkinson_Hyperlegible, Inter, Syne, DM_Mono, Sora — not Geist
- Other font loads use `Instrument_Serif` from Google Fonts — also not Geist
- The CSS variable `--font-geist-sans` is referenced once in `src/components/marketing/HeroHeadline.tsx` (line 7), but **nothing ever defines this CSS variable** — it is a dead reference that resolves to the fallback font

### What to do
1. Remove `"geist": "^1.7.0"` from `package.json` dependencies
2. Fix the dead CSS variable reference in `src/components/marketing/HeroHeadline.tsx` line 7: change `var(--font-geist-sans)` to `var(--font-sora)` or another active font variable
3. Run `bun install` to update lockfile

---

## 4. Total Waste

| Package | Size on Disk | Import Count | Action |
|---------|-------------|-------------|--------|
| `@anthropic-ai/sdk` | 4.9 MB | 0 | Remove |
| `openai` | 13 MB | 0 | Remove |
| `geist` | 7.9 MB | 0 | Remove |
| **Total** | **~25.8 MB** | | |

---

## 5. Heavy Dependencies Confirmed IN USE

These were audited and found to have legitimate imports — do NOT remove:

| Package | Import Files | Usage |
|---------|-------------|-------|
| `three` | 36 files | 3D lab, calculators, scenes |
| `@react-three/fiber` | 20+ files | React Three Fiber renderer |
| `@react-three/drei` | 15+ files | 3D helpers |
| `framer-motion` | 50+ files | Animation library |
| `recharts` | 10+ files | Analytics charts |
| `@tiptap/*` | 10+ files | Rich text editor |
| `@codemirror/*` | 2 files | Code editor in admin |
| `mermaid` | 1 file | Wiki diagram blocks |
| `payrex-node` | 1 file | Payment processing |
| `boneyard-js` | 0 src imports | CLI-only via package.json scripts — consider moving to devDependencies |
| `marked` | 1 file | Markdown parsing |
| `isomorphic-dompurify` | 2 files | HTML sanitization |
| `turndown` | 1 file | HTML-to-Markdown |
| `remark-gfm` | 2 files | GFM markdown |
| `papaparse` | 1 file | CSV parsing |
| `fuse.js` | 1 file | Fuzzy search |
| `cmdk` | 2 files | Command palette |
| `idb` | 1 file | Offline IndexedDB |
| `rough-notation` | 1 file | Marketing hero animation |
| `tunnel-rat` | 1 file | 3D portal rendering |
| `next-mdx-remote` | 2 files | MDX article rendering |
| `next-themes` | 5 files | Dark/light theme |
| `server-only` | 8 files | Server-only guards |
| `@phosphor-icons/react` | 50+ files | Icons |
| `lucide-react` | 21 files | Icons |
| `class-variance-authority` | 20 files | UI variants |
| `date-fns` | 3 files | Date formatting |
| `clsx`, `tailwind-merge` | 50+ files | Utility classes |
| `zustand` | 20+ files | State management |
| `zod` | 50+ files | Schema validation |

---

## 6. Notes

- **boneyard-js**: Used only as a CLI command (`boneyard-js build`) in package.json scripts. It has zero source imports. Consider moving from `dependencies` to `devDependencies` (saves ~11MB from production installs since it's a build-time tool).
- **tw-animate-css** and **@tailwindcss/typography**: Only used via CSS `@import`/`@plugin` directives in `globals.css` — this is normal for Tailwind plugins.
- The existing `.ai/00_performance/optimization-audit-report.md` already identified `@anthropic-ai/sdk` as suspect. This audit confirms it definitively.
