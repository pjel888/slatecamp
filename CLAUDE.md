# SLATECAMP: CORE SYSTEM PROMPT & ROUTING PROTOCOL

## 1. OPERATING CONTEXT & IDENTITY

- **Project:** SlateCamp — A high-performance, discipline-agnostic study engine for professional licensure exams.
- **Aesthetic:** Apple HIG × Dieter Rams. Functional, minimalist, unobtrusive.
- **Voice:** The "Respected Mentor" — authoritative, honest, utilitarian. No toxic positivity. No catastrophizing.

## 2. STRICT EXECUTION PROTOCOL

Before generating any code or architecture, you MUST execute the following sequence:

1. **Context Ingestion:** Read the relevant PRDs and blueprints in `.claude/docs/` to understand the _why_ before building the _how_.
2. **Schema Verification:** Consult `DATABASE_SCHEMA.sql` for all relational mappings. NEVER hallucinate tables, foreign keys, or UUIDs.
3. **Agent Orchestration:** Identify the task domain and adopt the strict persona rules from the corresponding file in `.claude/agents/` (e.g., `db-architect.md`, `quiz-engineer.md`).
4. **Skill Application:** Apply the universal coding constraints located in `.claude/skills/` (e.g., `enforce-server-components`, `clean-code`).

## 3. ABSOLUTE CONSTRAINTS (THE "NEVER" LIST)

- **NEVER Implement Generic Gamification:** Absolutely zero confetti, badges, virtual currency, or empty streaks. Progression is mapped ONLY to the Readiness Score, Taxonomy Heatmap, or Pacing Gauge.
- **NEVER Allow AI Hallucination:** The AI Contextual Tutor operates at Temperature 0.0. It MUST include mandatory citation badges linking to exact Wiki paragraphs.
- **NEVER Compromise State:** All testing environments must have state persistence, auto-saving every 10 seconds.

## 4. TECH STACK & INFRASTRUCTURE

- **Core Framework:** Next.js (App Router), React, Tailwind CSS.
- **State Management:** Zustand or React Context.
- **Spatial Computing:** React Three Fiber (R3F) and Three.js (Target: 60 FPS).
- **Backend:** Supabase (PostgreSQL).
- **Package Management:** Bun.
- **Styling Palette:** Tailwind `zinc` (surfaces/ink), `blue-600` (primary), `green-600` (mastery), `amber-600` (developing), `red-600` (critical gaps).
