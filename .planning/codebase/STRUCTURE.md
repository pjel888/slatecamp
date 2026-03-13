# Directory Structure

This document outlines the directory layout and key file responsibilities in **SlateCamp**.

## Root Directory
- `.claude/`, `.cursor/`: Tool-specific configurations.
- `.planning/`: Project planning, architecture, and task-tracking files.
- `public/`: Static assets (images, icons, fonts).
- `scripts/`: Custom utility and development scripts (e.g., `dev.js`).
- `src/`: Core source code.
- `middleware.ts`: Next.js middleware for auth and redirection logic.
- `next.config.ts`: Next.js framework configuration.
- `tailwind.config.ts`: Tailwind CSS theme and utility settings.
- `package.json`: Project metadata, scripts, and dependency list.

## Source Directory (`src/`)

### `app/` (Next.js App Router)
The routing layer of the application.
- `(auth)/`: Grouped authentication-related routes (login, register, forgot-password).
- `api/`: Backend API routes for admin, AI services, payments, and webhooks.
- `dashboard/`: Main application interface for authenticated users (analytics, notes, 3D lab, wiki).
- `pricing/`: Public pricing and plan comparison pages.
- `layout.tsx`: Root layout with global providers and font configuration.
- `page.tsx`: Landing page (marketing) entry point.

### `components/` (UI Components)
Organized by feature or domain.
- `3d/`: Three.js and React Three Fiber components for 3D visualizations.
- `auth/`: Reusable components for login/register flows.
- `dashboard/`: UI elements specific to the user dashboard (gauges, heatmaps, score cards).
- `dev/`: Development-only tools and debug overlays.
- `layouts/`: Shared page structures (e.g., `SharedPageLayout`).
- `marketing/`: Components for the landing and public marketing pages.
- `ui/`: Atomic UI components (buttons, inputs, etc.) based on shadcn/ui.
- `shared/`: Utility components used across the app (navigation, theme provider).

### `lib/` (Core Logic & Utilities)
The engine of the application.
- `actions/`: **Server Actions** for mutations (auth, payments, wiki management).
- `ai/`: AI-specific logic and integrations (LLM prompt engineering, response parsing).
- `constants/`: Global constants (site metadata, pricing configuration, routing maps).
- `context/`: React Context providers for global application state.
- `hooks/`: Custom React hooks for client-side functionality.
- `payments/`: Stripe and Payrex integration logic.
- `supabase/`: Server and client-side Supabase configuration and middleware utilities.
- `utils/`: Common helper functions (formatting, validation, style merging).

### `types/` (TypeScript Definitions)
- `app.ts`: Global application types.
- `payrex-node.d.ts`: External library type definitions.
- Domain-specific interfaces and types.

## Key Files & Responsibilities
- `src/lib/supabase/middleware.ts`: Critical for maintaining session state across SSR requests.
- `src/lib/actions/onboarding.ts`: Handles the complex user onboarding flow and initial data seeding.
- `src/components/3d/Workspace.tsx`: Entry point for the platform's advanced 3D features.
- `src/app/globals.css`: Root styling, Tailwind imports, and custom CSS variables.
