# SlateCamp Coding Conventions

This document outlines the coding standards, naming conventions, and architectural patterns established for the **SlateCamp** (SlateCamp) codebase.

---

## 🏗️ Tech Stack

- **Framework**: Next.js 15/16 (App Router), React 19
- **Runtime**: Bun (Package management, testing)
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS 4 + `shadcn/ui`
- **Database/Auth**: Supabase (PostgreSQL + RLS + Auth + Storage)
- **3D**: React Three Fiber + `@react-three/drei`
- **Payments**: Stripe + PayRex (GCash/Maya)

---

## 📏 Naming Conventions

### Files & Directories

- **Components**: PascalCase (e.g., `ActionQueues.tsx`, `ReadinessScore.tsx`)
- **App Routes**: kebab-case (e.g., `src/app/dashboard/3d-lab/`)
- **Lib/Hooks/Types**: kebab-case (e.g., `src/lib/utils/`, `src/hooks/use-local-storage.ts`, `src/types/app.ts`)
- **Tests**: `<module-name>.test.ts` or `<ComponentName>.test.tsx` (co-located with source)
- **E2E Specs**: `<feature-name>.spec.ts` (in `src/e2e/`)

### Code

- **Variables**: camelCase, reveal intent (e.g., `userCount`, `currentQuestionIndex`)
- **Functions**: camelCase, verb + noun (e.g., `getUserById()`, `calculateScore()`)
- **Booleans**: Question form (e.g., `isActive`, `hasPermission`, `canEdit`)
- **Constants**: SCREAMING_SNAKE (e.g., `MAX_RETRY_COUNT`, `AUTO_SAVE_INTERVAL`)
- **Interfaces/Types**: PascalCase (e.g., `interface UserProfile { ... }`)

---

## 🎨 Architecture & Patterns

### Next.js App Router

- **Server Components by default**: Only add `'use client'` for components requiring interactivity (`useState`, `useEffect`, etc.).
- **Data Fetching**: Prefer Server Components with `async/await` for initial data. No `useEffect` for data fetching.
- **Server Actions**: Use `'use server'` for ALL database mutations. Never expose Supabase writes client-side.
- **Optimization**: Use `useOptimistic` for high-frequency interactions (e.g., quiz answers).

### Styling — Apple HIG (Human Interface Guidelines)

- **Philosophy**: Clarity, Deference, and Depth. Focused on the content, with a premium, platform-native feel.
- **Visuals**:
  - **Clarity**: High-legibility typography (SF Pro inspired Inter), generous whitespace, and purposeful color usage.
  - **Deference**: UI should recede to highlight user content (Wiki, Notes, 3D models).
  - **Depth**: Subtle layers, translucency (where appropriate), and logical hierarchies to help users navigate complexity.
- **Palette**: `zinc` foundation with semantic Apple-inspired accents:
  - `blue-600`: System Blue (Primary, links, active)
  - `green-600`: System Green (Success, mastery)
  - `amber-600`: System Orange/Yellow (Warning, developing)
  - `red-600`: System Red (Error, critical gaps)
- **Constraints**: Use system fonts, appropriate corner radii (8px-12px), and smooth, purposeful animations (Framer Motion). Avoid "mechanical" rigidity; favor fluid, organic interactions.

### Clean Code (SRP, DRY, KISS, YAGNI)

- **Guard Clauses**: Use early returns to keep code flat (max 2 levels of nesting).
- **Function Size**: Small functions (max 20 lines, ideally 5-10).
- **Colocation**: Keep related code close.
- **State Management**: Zustand or React Context for client-side state.

---

## 💾 Database & Security

- **Single Source of Truth**: `DATABASE_SCHEMA.sql` at root.
- **RLS (Row-Level Security)**: Enabled on ALL tables. Check policies before shipping features.
- **Zero-Data-Loss**: Mandatory auto-save (every 10 seconds) for high-stakes sessions.

---

## ❌ Anti-Patterns

- Never use `any` type — fix the actual type issue.
- Never use `localStorage` for auth state (use `@supabase/ssr`).
- Never show analytics in Review Mode.
- Never use spinners for loading — use skeleton screens.
- Never use `console.log` in production — use proper error handling.
