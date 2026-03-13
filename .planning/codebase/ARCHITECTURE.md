# Codebase Architecture

This document provides a high-level overview of the architecture of **SlateCamp** (Project Cerebro), a cognitive-first test prep platform.

## Core Design Patterns

### 1. Framework: Next.js (App Router)
The application is built on **Next.js 16** (using React 19) with the **App Router** architecture. 
- **Server-First Approach**: Leverages React Server Components (RSC) by default for data fetching and rendering, reducing client-side bundle size.
- **Client Components**: Used sparingly for interactive elements, 3D visualizations, and forms.
- **Server Actions**: Used as the primary mechanism for data mutations (e.g., updating notes, managing sessions), providing a type-safe and idiomatic way to handle forms and user interactions.

### 2. Styling: Tailwind CSS & shadcn/ui
- **Utility-First CSS**: Tailwind CSS is used for all styling, ensuring a consistent and performant design system.
- **Component Library**: shadcn/ui (built on Radix UI) provides the foundation for accessible and customizable UI components (found in `src/components/ui`).

### 3. Backend & Auth: Supabase
- **Authentication**: Managed by Supabase Auth with server-side session handling (`@supabase/ssr`).
- **Database**: PostgreSQL hosted on Supabase, interacted with via the Supabase client.
- **SSR Integration**: Custom middleware and server-side client setup (in `src/lib/supabase`) ensure seamless auth and data fetching during server rendering.

### 4. 3D Visualization: Three.js & React Three Fiber
- The platform includes advanced 3D components (e.g., `src/components/3d/Workspace.tsx`) using **Three.js**, **React Three Fiber (R3F)**, and **Drei**.

## State Management

### 1. Server-Side State
- Handled primarily by Next.js data fetching. Data is fetched in Server Components and passed down to Client Components.
- Mutations are handled via Server Actions, which trigger cache revalidation (e.g., `revalidatePath`, `revalidateTag`).

### 2. Client-Side State
- **React Hooks**: Standard `useState`, `useReducer`, and `useMemo` for component-level state.
- **React Context**: Used for cross-cutting concerns and global state:
    - `ActiveSessionContext`: Manages current user session state.
    - `TierContext`: Handles user subscription and feature access levels.
    - `BreadcrumbContext`: Manages dynamic breadcrumbs across the app.
    - `ExamProfileContext`: Stores user-specific exam configuration.

### 3. External State
- Supabase acts as the single source of truth for persistent data.

## Overall Application Flow

1. **Routing**: Handled by the Next.js App Router. Routes are defined in `src/app`.
2. **Middleware**: `middleware.ts` handles authentication checks and session refreshing using Supabase.
3. **Data Fetching**: 
    - Server Components fetch data directly from Supabase (or external APIs) during the request phase.
    - Data is passed as props to Client Components if interactivity is needed.
4. **Interactions**: 
    - Users interact with Client Components.
    - Forms and actions trigger **Server Actions** (`src/lib/actions`).
    - Actions perform database operations and revalidate the UI.
5. **Real-time/Interactivity**: Framer Motion and Three.js provide a high-fidelity, interactive experience for complex UI elements.
