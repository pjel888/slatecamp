# System Overview

**Date:** 2026-04-04
**App:** SlateCamp
**Description:** A high-performance, discipline-agnostic study engine tailored for professional licensure exams. It avoids superficial gamification in favor of pedagogical rigor (IRT and Spaced Repetition) and a distinct "Campfire" aesthetic.

## 4-Portal Architecture
SlateCamp leverages Next.js 16 App Router to strictly isolate contexts:

1. **Dashboard Portal (`/dashboard`)**: The primary B2C/B2B2C student experience. Contains the Wiki, Analytics, 3D Lab, Camp Trails, and the Testing Hub (with 7 modes including Simulation, Endurance, and Camp).
2. **Admin Portal (`/admin`)**: The internal CMS for content generation. Includes unified article/question editors, taxonomy managers, and the SME (Subject Matter Expert) Review Queue.
3. **CEO Portal (`/ceo`)**: High-level business observability. Tracks financials (MRR/ARR via Stripe/PayRex), cohort retention, and churn predictions.
4. **Developer Portal (`/developer`)**: Internal catalog for design system tokens, feature flag management, and API documentation.

## The Pedagogical Engine
Located in `src/lib/srs/` and `src/lib/actions/testing.ts`.
- **IRT (Item Response Theory) 2PL Model:** Uses Newton-Raphson updates to adjust `theta` (student ability) against item difficulty and discrimination.
- **Anti-Inflation Readiness Score:** A composite 6-vector score factoring in streak decay, gray-node penalties, and Bloom's taxonomy ceilings.
- **Spaced Repetition (SM-2):** Adapts intervals based on correctness, time-to-answer, and user-reported confidence.
- **Blindspot Queue:** An algorithm that prioritizes the weakest taxonomy nodes and actively hunts for "gray" (untested) areas of the syllabus.

## Core Tech Stack
- **Framework:** Next.js 16.1.6 (App Router, Server Actions, RSC)
- **UI & Styling:** React 19, Tailwind CSS 4, shadcn/ui, Framer Motion
- **Spatial Learning:** React Three Fiber + Three.js (`frameloop="demand"`)
- **Backend & Auth:** Supabase (PostgreSQL, SSR Auth, RLS)
- **AI Tutor:** Anthropic SDK (Temperature 0.0, strictly cited Socratic tutoring)
