# ROADMAP: SlateCamp

A five-phase execution plan for the SlateCamp platform.

---

## 🏗️ Phase 1: Foundations (The Core Loop)

**Goal:** Establish the Wiki, taxonomy tree, and basic quizzing.

- [ ] **Syllabus Infrastructure:** Database setup, disciplines, and taxonomy hierarchy.
- [ ] **The Wiki CMS:** Markdown article renderer, sticky ToC, and Omnibar search.
- [ ] **Camp Mode Quizzing:** Basic question rendering, feedback, and rationales.
- [ ] **Auth & Onboarding:** Supabase Auth + profile setup for specific licensure exams.
- [ ] **Aesthetic:** Basic Apple HIG layout (Sidebar + Main Column).

---

## 🧠 Phase 2: Diagnostics & Synthesis (Readiness)

**Goal:** Introduce Storm Mode, Analytics, and Notes Workspace.

- [ ] **Storm Mode:** Timed exam environment, state persistence, and auto-save.
- [ ] **The Readiness Score:** EMA calculation engine and user interaction telemetry.
- [ ] **Analytics Dashboard:** Taxonomy Heatmap (Recharts) and Node Inspector.
- [ ] **Notes Workspace:** TipTap integration, capture blocks, and "Send to Camp."
- [ ] **Security:** Verify all RLS policies for user data isolation.

---

## 📐 Phase 3: Spatial & Data Infrastructure (The 3D Layer)

**Goal:** Launch the 3D Lab and establish a living, automated data foundation that scales with every feature we ship.

- [ ] **The 3D Lab:** R3F parametric sandbox and building code visualization.
- [ ] **X-Ray Slider:** Layer-stripping for structural models.
- [ ] **Performance:** Draco-compression optimization and streaming Suspense.
- [ ] **Schema Mapping:** Audit and document the full Supabase schema as a living `schema.sql` file — every table, constraint, RLS policy, and index explicitly declared.
- [ ] **Seed Data Pipeline:** Author a comprehensive seed dataset (questions, wiki articles, 3D model metadata, taxonomy nodes) stored as versioned JSON fixtures in the codebase.
- [ ] **Automated Seed/Teardown:** Supabase CLI script (`supabase db reset`) that wipes and re-seeds the database in one command — runnable locally and in CI.
- [ ] **Schema-Feature Contract:** Every new feature must ship with a corresponding schema migration and seed data update before it is considered done. No feature lands without its data layer.

---

## 🛠️ Phase 4: Admin & Content Operations (The Control Room)

**Goal:** Build an internal admin dashboard so the team can upload, manage, and quality-control all platform content without touching the codebase.

- [ ] **Admin Auth Layer:** Role-based access (admin vs. student) enforced at the RLS and middleware level.
- [ ] **Question Manager:** CRUD interface for uploading, editing, tagging, and retiring exam questions — with bulk CSV/JSON import and schema validation on upload.
- [ ] **Wiki Content Manager:** Rich-text editor (TipTap) for creating and publishing wiki articles, with discipline/taxonomy tagging and draft/published state.
- [ ] **3D Asset Manager:** Upload interface for 3D model files (.glb/.gltf), metadata tagging (system, layer, discipline), and preview renderer before publishing.
- [ ] **Taxonomy Editor:** Visual tree editor for managing the discipline → subject → topic hierarchy without SQL.
- [ ] **Audit Log:** Every admin content action (create, update, delete, publish) is logged with timestamp, actor, and diff — full traceability.
- [ ] **SME Review Queue:** Workflow for Subject Matter Experts to flag, review, and approve content before it goes live to students.

**Plans:** 5 plans

- [ ] 04-01-PLAN.md — Admin Foundation (user_roles, RLS, middleware)
- [ ] 04-02-PLAN.md — Question Manager (CRUD, bulk import)
- [ ] 04-03-PLAN.md — Wiki Content Manager (TipTap editor)
- [ ] 04-04-PLAN.md — Asset & Taxonomy Managers
- [ ] 04-05-PLAN.md — Audit & SME Workflow

---

## 🚀 Phase 5: Commercial & Scale (Growth)

**Goal:** Payments, institutional access, AI intelligence layer, and multi-discipline launch.

- [ ] **Dual Payments:** Stripe + PayRex (GCash/Maya) webhook integration.
- [ ] **Tier Gating:** Subscription middleware and premium feature locking.
- [ ] **Institutional Dashboard:** B2B analytics for university deans.
- [ ] **AI Tutor RAG:** Embedding pipeline for Wiki articles + pgvector search.
- [ ] **Zero-Hallucination:** Citation badges and double-pass auditor LLM.
- [ ] **Scale:** Launching Nursing (PNLE) and Law (Bar) exam verticals.
- [ ] **Immune System:** User feedback pipeline and SME review queue promotion to production workflow.