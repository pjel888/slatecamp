# REQUIREMENTS: SlateCamp (The Core System)

## 🏗️ 1. SlateCamp Wiki (CMS & Source of Truth)
- **Markdown Powered:** SME content stored as Markdown (`wiki_articles`).
- **Taxonomy Mapped:** Every article linked to a specific syllabus node.
- **Sticky Navigation:** Auto-generated Table of Contents for long-form codes.

## 🧠 2. Advanced Quizzing (Adaptive Engine)
- **Camp Mode:** Learning-first with instant feedback and rationales.
- **Storm Mode:** Strict timed simulation with focus-loss auto-submit.
- **Algorithmically Driven:** IRT (difficulty) + EMA (mastery) + Spaced Repetition.

## 📐 3. The 3D Lab (Spatial Learning)
- **R3F Engine:** Parametric building code visualization.
- **X-Ray / Layer Stripping:** Visualise structural connections and MEP routing.
- **Data-Backed Assets:** 3D models stored with metadata mapping to syllabus nodes.

## 📈 4. Analytics & Readiness
- **Readiness Score™:** predictive percentage based on EMA performance.
- **Taxonomy Heatmap:** Visual mastery mapping across all subjects.
- **Pacing Metrics:** Tracking speed vs. board exam standard pace.

## 📝 5. Notes & Synthesis
- **Personal Workspace:** TipTap-powered knowledge ledger.
- **Capture Logic:** One-tap "Save to Notes" from Wiki or Quizzes.
- **Deep Linking:** Automatic back-links from notes to the source reference.

## 🛠️ 6. The Control Room (Admin Ops)
- **Role-Based Access:** Restricted dashboard for SMEs and Admins.
- **Content CRUD:** visual managers for Questions, Wiki Articles, and 3D Assets.
- **Bulk Operations:** CSV/JSON import/export for rapid question bank updates.
- **Audit Traceability:** History of all content changes by admin users.

## 🚀 7. Infrastructure & Scale
- **Database-Feature Contract:** Every feature must ship with schema and seed data.
- **Supabase Stack:** Auth, RLS, Storage, pgvector (AI RAG).
- **Dual Payments:** Stripe + PayRex (Philippine-local gateways).
- **Automated Lifecycle:** CLI-driven re-seeds and environment parity.
