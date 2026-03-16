# Technical & Business Audit: SlateCamp (Slate Camp)

**Date:** March 16, 2026  
**Role:** Elite CTO / Technical Due Diligence Auditor  
**Status:** **[FINAL REPORT]**

---

## 1. Business Overview

**SlateCamp** (Slate Camp) is a high-fidelity, AI-integrated educational SaaS platform specifically engineered for high-stakes professional certification and board exam preparation (e.g., medical, legal, or specialized engineering).

- **Target Audience:** Professionals requiring deep domain mastery and spatial understanding of complex subjects.
- **Core Value Proposition:** Transitioning study from passive memorization to active mastery through a "Socratic" learning loop, spatial 3D visualization, and data-driven readiness scoring.
- **Revenue Model:** Tiered subscription (Free, Pro, Enterprise) managed via Stripe and Payrex, with built-in "Final Stretch" upsell triggers based on exam-date proximity.

---

## 2. The Tech Stack (Next.js 16 Architecture)

An exhaustive inventory of the frontend, backend, and infrastructure libraries.

| Layer               | Technologies                                                            |
| :------------------ | :---------------------------------------------------------------------- |
| **Framework**       | Next.js 16 (App Router), React 19 (Server Components, Actions)          |
| **Database**        | Supabase (PostgreSQL) with `pg_graphql`, `pgjwt`, and custom extensions |
| **Authentication**  | Supabase Auth with SSR support (`@supabase/ssr`)                        |
| **Styling**         | Tailwind CSS 4.0, `@tailwindcss/typography`, Framer Motion (Animations) |
| **3D Rendering**    | Three.js, `@react-three/fiber`, `@react-three/drei` (The "3D Lab")      |
| **Editor/Wiki**     | Tiptap (Headless Rich Text), `katex` (Math), `marked` (Markdown)        |
| **AI Integration**  | Anthropic SDK (Claude), RAG-enhanced Socratic Tutoring                  |
| **Payments**        | Stripe (Global), Payrex (Regional/Alternative)                          |
| **Data/Validation** | Zod (Schema), PapaParse (CSV Import), PDF-Parse                         |

---

## 3. Core Features & Functional Architecture

### **A. Testing Hub & Learning Science**

- **Adaptive Quiz Modes:** Includes `Camp` (standard), `Storm` (rapid fire), `Blindspot` (weak domains), `Proof Sim` (simulation), and `Endurance`.
- **Item Response Theory (IRT):** Dynamically selects questions based on user ability ($\theta$) and question discrimination ($a$) / difficulty ($b$).
- **Spaced Repetition (SRS):** A modified SM-2 algorithm that weighs response time and user confidence to schedule review intervals.

### **B. Spatial Knowledge & 3D Lab**

- **Interactive 3D Assets:** GLTF/GLB models with custom `spatial_hotspots` linked to the taxonomy tree.
- **Contextual Wiki:** A massive hierarchical Knowledge Wiki (6-level taxonomy) where articles are status-tracked (`draft`, `published`, `review`).

### **C. Management & Productivity**

- **Note Engine:** A folder-based note-taking system with Tiptap integration, allowing users to link notes to specific taxonomy nodes.
- **Admin Suite:** Robust tools for Taxonomy management, Question bank auditing, 3D asset status monitoring, and Audit logging for security compliance.

---

## 4. Proprietary IP & Algorithms

### **I. Adaptive Scoring Engine (IRT & Mastery)**

Located in `src/lib/srs/irt.ts`, the platform utilizes a **2-Parameter Logistic (2PL) Model**. It calculates the probability of a correct answer and updates the user's "Theta" (ability score) using an information-weighted delta function.

- **IP Goal:** Ensures users are always challenged at the "Goldilocks Zone" ($P \approx 0.75$) of learning.

### **II. Modified SM-2 (Response-Time Weighted SRS)**

Located in `src/lib/srs/sm2.ts`, the SRS engine doesn't just look at "Correct/Incorrect." It calculates "Quality" based on:

1.  **Correctness:** Binary pass/fail.
2.  **Latency:** Faster responses indicate higher "fluency" and result in longer intervals.
3.  **Confidence:** User-reported certainty ("Know" vs "Unsure") adjusts the Ease Factor ($EF$).

### **III. Socratic AI Tutor**

A prompt-engineered anti-hallucination pipeline (`src/lib/ai/prompts.ts`) that forces the AI to act as a Socratic guide.

- **Logic:** Reference RAG context (uploaded study materials) + student's "weak domains" + past performance to ask one guiding question at a time without revealing the answer.

---

## 5. UX/UI Design System: "The Cerebro Standard"

The design system is a rigorous blend of **Apple HIG** (Tactile/Glassmorphism) and **Dieter Rams** (Functional Minimalism).

- **Color Palette:** Apple-inspired neutrals (`Snow`, `Bone`, `Ash`, `Graphite`, `Charcoal`) with functional signal colors (`Signal Amber`, `Signal Green`, `Signal Red`).
- **Typography:** Strict sans-serif hierarchy using CSS variables for `--text-primary` through `--text-quaternary`.
- **Component Architecture:**
  - **Tactile Feedback:** Instant scale transforms ($0.98$) on all interactive elements for a "physical" click feel.
  - **Navigation:** Transition-aware links with `data-pending` states for zero-perceived-latency UI.
  - **Radii:** Soft, progressive rounding (`--radius-sm` to `--radius-4xl`) based on a $0.75$rem base.

---

## 6. Strategic Business Findings

1.  **Data Integrity:** The database uses strict RLS (Row Level Security) and triggers for `updated_at` consistency.
2.  **Scalability:** The use of Supabase + Next.js Server Actions allows for a thin client and heavy lifting on the server/database layer.
3.  **Moat:** The combination of a proprietary 6-level taxonomy linked across 3D models, Wiki articles, and IRT-based questions creates a massive barrier to entry for competitors.

---

**End of Audit Report.**  
_This document serves as the Source of Truth for future development cycles._
