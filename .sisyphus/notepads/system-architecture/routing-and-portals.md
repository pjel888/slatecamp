# Routing and Portals

**Date:** 2026-04-04

SlateCamp utilizes Next.js App Router to serve a unified monolithic codebase that behaves like four distinct applications.

## 1. Dashboard (`/dashboard`)
The core learning environment.
- **Audience:** Students and Learners (B2C, B2B2C, B2B).
- **Key Layouts:**
  - `Testing Hub` (`/dashboard/testing`): Acts as the launchpad for 7 different quiz session configurations (Camp, Storm, Endurance, Simulation, etc.).
  - `Wiki Browser` (`/dashboard/wiki`): Content rendering layer for structured MDX.
  - `Analytics` (`/dashboard/analytics`): Deep statistical breakdown of user mastery via 8 distinct chart boundary regions.
  - `3D Lab` (`/dashboard/3d-lab`): Parametric spatial environment for visualizing structural systems.

## 2. Admin (`/admin`)
The internal content management and operations portal.
- **Audience:** Content Admins, Super Admins, SME Reviewers.
- **Key Features:**
  - **Taxonomy Manager:** Draggable tree editor to curate the taxonomy hierarchy.
  - **Unified Editor:** Side-by-side editing of `wiki_articles` and their associated `questions`.
  - **SME Review Queue:** Content lifecycle pipeline for routing new questions to Subject Matter Experts for validation.

## 3. CEO (`/ceo`)
The business operations and observability dashboard.
- **Audience:** Executives, Founders.
- **Key Features:**
  - Revenue tracking (Stripe / PayRex integrations).
  - Cohort retention and churn risk tables.
  - Global user sign-up velocity.

## 4. Developer (`/developer`)
Internal documentation and tooling reference.
- **Audience:** Developers and Autonomous Crawler Agents.
- **Key Features:**
  - API reference for the Next.js Route Handlers.
  - Design system token catalog (Campfire Theme).
  - Architecture specifications.

## Global Middlewares
Routing between these portals is protected by `middleware.ts`.
- The middleware actively intercepts requests to enforce authentication checks.
- If `process.env.DEV_FORCE_USER_ID` is set during local development, the middleware safely short-circuits to allow immediate access to the requested portal.
