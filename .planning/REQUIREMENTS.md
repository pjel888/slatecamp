# REQUIREMENTS: SlateCamp (The Big Six)

## 🏗️ 1. SlateCamp Wiki (CMS & Source of Truth)

- **Markdown Powered:** SME content stored as Markdown (`wiki_articles`).
- **Omnibar Search:** Global Cmd+K search via `cmdk` package.
- **Wayfinding:** Sticky ToC with scroll-tracking highlight.
- **Zero-Switching:** Peek-View hover for internal references.
- **Aesthetic:** Apple HIG — clean typography, generous whitespace, high legibility.

## 🧠 2. Adaptive Quiz Engine (Diagnostics)

- **Dual Modes:** 
  - `Camp Mode`: Instant feedback, rationales, untimed.
  - `Storm Mode`: Strict timer, no feedback until submit, no tab-switching.
- **IRT Weighting:** Difficulty parameters (b-parameter) for weighted scoring.
- **State Persistence:** 10-second auto-save to `quiz_sessions`.
- **Offline Resilience:** JSON payload delivered upfront for low-connectivity environments.
- **Lucky Guess Detection:** Flagging correct answers with <P10 response times.

## 📝 3. Personal Notes (The Synthesis Ledger)

- **Block Editor:** TipTap integration (`@tiptap/react`).
- **Source Badges:** "Send to Camp" from Wiki/Quiz; automatic taxonomy inheritance.
- **Split-Pane View:** Dynamic sidebar for note-taking alongside content.
- **Resurfacing:** flagging unreviewed notes (`viewed_at = NULL`).

## 📐 4. Interactive 3D Lab (Spatial Engine)

- **Parametric Sandbox:** R3F (`@react-three/fiber`) parametric modelers.
- **Zoning Engine:** Slider-driven feedback on lot setbacks and building codes.
- **X-Ray / Cutaway:** Layer-stripping via slider for structural visualization.
- **Performance:** Draco-compressed GLB assets; 60 FPS target.

## 🤖 5. AI Contextual Tutor (Zero-Hallucination RAG)

- **Closed-Loop RAG:** Embedding corpus restricted strictly to SlateCamp Wiki.
- **Citation Badges:** Every response MUST link to a Wiki paragraph.
- **Strict Temperature:** LLM set to 0.0 for maximum literalness.
- **Double-Pass Audit:** Auditor LLM check for halluncinated numbers/dates.

## 📊 6. Analytics Dashboard (Readiness Score)

- **Taxonomy Heatmap:** Color-coded status (🟢 >85%, 🟡 60-84%, 🔴 <59%).
- **Readiness Score:** EMA (Exponential Moving Average) based global readiness.
- **Pressure Gap:** Analytics on Camp vs. Storm mode delta.
- **Node Inspector:** Time-series tracking for individual syllabus nodes.

---

## 🔐 Technical Requirements

- **Supabase Backend:** PostgreSQL, Auth, RLS, Storage, pgvector.
- **Performance:** <1.5s LCP on 3G/4G connections.
- **Multi-Tenant Isolation:** RLS policies on ALL user-specific tables.
- **Universal Scale:** Horizontal scaling via the `disciplines` table.
