# Tech Stack

**Status:** Active  
**Version:** 1.0  
**Last Updated:** 2026-04-06  
**Source-of-Truth:** `package.json`

---

## Core Framework

| Package | Version | Purpose |
|---------|---------|---------|
| `next` | 16.1.6 | App Router, Server Components, Server Actions |
| `react` | 19.2.4 | Core rendering engine with RSC support |
| `react-dom` | 19.2.4 | React DOM renderer |
| `typescript` | 5.9.3 | Type safety |

---

## Styling & UI

| Package | Version | Purpose |
|---------|---------|---------|
| `tailwindcss` | 4.2.2 | CSS-first styling with Campfire design tokens |
| `@tailwindcss/typography` | 0.5.19 | Prose typography for wiki content |
| `tailwind-merge` | 3.5.0 | Utility for merging Tailwind classes |
| `class-variance-authority` | 0.7.1 | Component variant classes |
| `tw-animate-css` | 1.4.0 | CSS animation utilities |
| `shadcn` | 4.1.0 | UI component primitives |
| `@base-ui/react` | 1.3.0 | Unstyled accessible UI primitives |

---

## Database & Auth

| Package | Version | Purpose |
|---------|---------|---------|
| `@supabase/supabase-js` | 2.100.0 | PostgreSQL client and auth |
| `@supabase/ssr` | 0.9.0 | Next.js SSR Supabase helpers |

---

## State Management

| Package | Version | Purpose |
|---------|---------|---------|
| `zustand` | 5.0.12 | Lightweight state management |

---

## 3D & Spatial

| Package | Version | Purpose |
|---------|---------|---------|
| `three` | 0.183.2 | 3D rendering engine |
| `@react-three/fiber` | 9.5.0 | React renderer for Three.js |
| `@react-three/drei` | 10.7.7 | R3F helpers and utilities |
| `@use-gesture/react` | 10.3.1 | Touch/mouse gesture handling |

---

## Payments

| Package | Version | Purpose |
|---------|---------|---------|
| `stripe` | 20.4.1 | Payment processing |
| `@stripe/stripe-js` | 8.11.0 | Stripe.js browser SDK |
| `payrex-node` | 1.7.3 | Philippine payment gateway |

---

## Rich Text & Content

| Package | Version | Purpose |
|---------|---------|---------|
| `@tiptap/react` | 3.20.4 | Rich text editor core |
| `@tiptap/starter-kit` | 3.20.4 | Tiptap basic extensions |
| `@tiptap/extension-*` | 3.20.4 | 13 Tiptap extensions (image, highlight, underline, etc.) |
| `@codemirror/lang-markdown` | 6.5.0 | Markdown syntax highlighting |
| `@codemirror/view` | 6.40.0 | CodeMirror editor view |
| `@uiw/react-codemirror` | 4.25.9 | React CodeMirror wrapper |
| `marked` | 17.0.5 | Markdown parser |
| `remark-gfm` | 4.0.1 | GitHub-flavored Markdown |
| `next-mdx-remote` | 6.0.0 | MDX rendering |
| `turndown` | 7.2.2 | HTML to Markdown conversion |
| `dompurify` | 3.3.3 | HTML sanitization |
| `isomorphic-dompurify` | 3.7.1 | Server-safe DOMPurify |

---

## AI & Embeddings

| Package | Version | Purpose |
|---------|---------|---------|
| `@anthropic-ai/sdk` | 0.78.0 | AI contextual tutor |
| `openai` | 6.33.0 | OpenAI API client |

---

## Data & Utilities

| Package | Version | Purpose |
|---------|---------|---------|
| `date-fns` | 4.1.0 | Date manipulation |
| `zod` | 4.3.6 | Schema validation |
| `fuse.js` | 7.1.0 | Fuzzy search |
| `papaparse` | 5.5.3 | CSV parsing |
| `lucide-react` | 0.577.0 | Icon library |
| `@phosphor-icons/react` | 2.1.10 | Icon library |
| `cmdk` | 1.1.1 | Command menu |
| `sonner` | — | Toast notifications |
| `clsx` | 2.1.1 | Conditional class names |
| `rough-notation` | 0.5.1 | Hand-drawn SVG annotations |
| `mermaid` | 11.14.0 | Diagram rendering |
| `server-only` | 0.0.1 | Server-only module guard |
| `idb` | 8.0.3 | IndexedDB wrapper |
| `react-day-picker` | 9.14.0 | Date picker |
| `react-resizable-panels` | 4.7.5 | Resizable panel layout |
| `recharts` | 3.8.0 | Charts and data visualization |
| `framer-motion` | 12.38.0 | Animations |
| `next-themes` | 0.4.6 | Dark/light theme |
| `nextjs-toploader` | 3.9.17 | Navigation progress bar |
| `boneyard-js` | 1.6.0 | Storybook helper |

---

## Dev Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `storybook` | 8.6.14 | Component explorer and testing |
| `@storybook/addon-*` | 8.6.14 | Storybook addons |
| `@storybook/react-vite` | 8.6.14 | Vite builder for Storybook |
| `@storybook/test` | 8.6.15 | Storybook test runner |
| `@tailwindcss/postcss` | 4.2.2 | PostCSS plugin for Tailwind |
| `@types/*` | various | TypeScript type definitions |
| `eslint` | 9.39.4 | Linting |
| `eslint-config-next` | 16.1.6 | Next.js ESLint config |
| `bun-types` | 1.3.11 | Bun type definitions |
| `supabase` | 2.84.0 | Supabase CLI |

---

## Package Manager

**Bun** is the package manager. Never use npm, yarn, or pnpm.

```bash
bun install        # Install dependencies
bun add <package> # Add a dependency
bun remove <package> # Remove a dependency
bun run <script>   # Run scripts from package.json
bun test           # Run test suite
```

---

## TypeScript Configuration

**Note:** TypeScript is **not** in strict mode. Current `tsconfig.json` settings:
- `"strict": false`
- `"noImplicitAny": false`
- `"strictNullChecks": false`

This is a known configuration. Consider enabling strict mode for new code.

---

*Source: `package.json` (all version numbers verified)*
