# Codebase Concerns & Technical Debt

This document outlines known issues, missing features, architectural risks, and areas requiring refactoring or optimization in the SlateCamp (project-cerebro) codebase.

## 1. Missing Features & "TODO"s

- **Analytics Wiring**: The dashboard and analytics pages (`src/app/dashboard/page.tsx`, `src/app/dashboard/analytics/page.tsx`) contain `TODO` comments indicating that real analytics wiring (EMA, IRT, pacing, taxonomy, queues) is missing. The current implementation relies on mocked values.
- **Automated Testing**: There is a complete lack of automated unit, integration, or E2E tests. While a `testing` route exists, it is not used for automated verification. This represents a significant risk for regressions as the codebase grows.

## 2. Architectural Risks

- **Demo Mode Coupling**: The codebase contains significant logic and components dedicated to a "Demo Mode" (e.g., `src/lib/demo/`, `src/components/dev/demo-shell/`, `mock-supabase.ts`). While useful for showcase, this logic is deeply integrated into core functions like Supabase client creation, which could lead to maintenance overhead and potential leakage of demo logic into production paths.
- **Hardcoded Database IDs**: The `ensureProfileAndExamProfile` function in `src/lib/supabase/bootstrap.ts` uses a hardcoded UUID (`ALE_BOARD_EXAM_ID`). This makes the system brittle and dependent on specific database seeding, which may vary across development, staging, and production environments.
- **Manual Tree Construction**: Wiki categories are fetched as a flat list and then reconstructed into a tree in memory (`getWikiCategoryTree`). For large datasets, this could become a performance bottleneck.
- **Next.js Versioning**: `package.json` specifies `"next": "16.1.6"`. As of current standard releases (Next.js 15.x), this versioning is non-standard and may indicate a dependency on an unreleased or forked version, which could lead to compatibility or support issues.

## 3. Technical Debt & Refactoring

- **Large Components**: Several components have grown excessively large, making them difficult to maintain and test:
  - `src/components/wiki/WikiDevPanel.tsx` (~876 lines)
  - `src/components/marketing/HeroSection.tsx`
  - `src/components/marketing/BentoFeatureGrid.tsx`
- **Type Safety Hygiene**:
  - Frequent use of `as ...` casting for Supabase query results suggests that database types are not being fully generated or utilized.
  - Non-null assertions (`!`) are used for critical environment variables in `createClient` (`src/lib/supabase/server.ts`), which could lead to unhandled runtime crashes if the environment is misconfigured.
  - Use of `any` type in several shared components (`src/components/shared/ActionTransitionButton.tsx`, `src/components/shared/TierBadge.tsx`, `src/lib/wiki-markdown.ts`).
- **Linting & Code Quality Errors**:
  - `react/jsx-no-duplicate-props`: Found in `src/app/pricing/pricing-content.tsx`, `src/components/marketing/LogoMarquee.tsx`, and `src/components/marketing/TestimonialShowcase.tsx`. This can lead to unexpected UI behavior or bugs.
  - `react-hooks/exhaustive-deps`: Found in `src/components/notes/NoteEditorPage.tsx` and `src/components/notes/NotesShell.tsx`.
  - Unused variables and `require()` style imports in TypeScript files.
- **Error Handling**: Many Server Actions in `src/lib/actions` return empty arrays or `null` upon encountering errors without logging or throwing. This "silent failure" pattern can make debugging difficult in production environments.

## 4. Performance Bottlenecks

- **Recursive Tree Traversals**: Functions like `collectCategoryIds` in `src/lib/actions/wiki.ts` use recursion on trees built in memory. While fine for small datasets, these should be monitored for performance as the Wiki grows.
- **Heavy Client-Side Components**: Components using `@react-three/fiber` and complex Framer Motion animations (e.g., `src/components/3d/Workspace.tsx`) may impact performance on lower-end devices if not carefully optimized.

## 5. Security Considerations

- **Service Role Usage**: The `createAdminClient` utility provides access to the Supabase Service Role key. While currently only used in server-side contexts (Server Actions and API routes), its presence and usage must be strictly audited to prevent accidental exposure to the client-side.
