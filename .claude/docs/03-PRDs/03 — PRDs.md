# 03 — PRDs

Product Requirement Documents for SlateCamp's core features — the "Big Six."

---

## Feature Index

Each feature PRD covers: objective, UX/UI specs, educational design, software architecture, and data schemas.

| **#** | **Feature** | **Codename** | **Priority** |
| --- | --- | --- | --- |
| 1 | SlateCamp Wiki | Taxonomy-Mapped CMS | P0 — Foundation |
| 2 | Adaptive Testing & Quizzing Engine | The Diagnostic Core | P0 — Foundation |
| 3 | Personal Notes & Workspace | The Synthesis Ledger | P1 — Core |
| 4 | Interactive Media & 3D Lab | The Spatial Engine | P1 — Core (Marketing Spear) |
| 5 | AI Contextual Tutor | Bulletproof RAG Engine | P2 — Premium |
| 6 | Analytics Dashboard | The Performance Heatmap | P0 — Foundation |

---

## PRD 1: The SlateCamp Wiki

**Objective:** A universally adaptable, Markdown-based knowledge repository — the centralized source of truth for all licensure exam content.

### UX/UI Specs

- **Typographic Ergonomics:** Line lengths capped at 65–75 characters; clean sans-serif for UI (Inter), high-readability serif/sans for body
- **The Slate Visual System:** Dark mode native with deep slate grays (`#1E293B` to `#0F172A`); soft off-white light mode
- **Zen Mode:** Single toggle collapses nav and side elements, centering the text column
- **Sticky Wayfinding:** Dynamic breadcrumbs (top) + sticky ToC highlighting active section (right)

### Core Functionality

- **Highlight-to-Action Toolkit:** Floating popover on text selection → *Capture*, *Ask AI*, *Quiz Me*
- **Peek-View References:** Hover = tooltip summary; Click = slide-out drawer (zero context-switching)
- **Omnibar Search (Cmd+K):** Global typo-tolerant search via `cmdk` — results categorized by Wiki, Images, Notes

### Data Rules

- Every article maps to `topic_id` in the Master Syllabus Taxonomy
- No orphan pages — CMS prevents publishing without taxonomy assignment
- Schema: `article_id`, `topic_id` (FK → taxonomy), `title`, `content` (Markdown), `last_updated`, `author_id` (FK → SME)

---

## PRD 2: Adaptive Testing & Quizzing Engine

**Objective:** Systematically transition users from passive reading to active recall by measuring competence against the master syllabus.

### UX/UI Specs

- **Syllabus Selector:** Subject-based cascading checkbox tree (Level 1: Subject → Level 2: Module → Level 3: Topic) with live item counter
- **Camp Mode:** Instant green/red feedback, expanded rationale blocks, no timer
- **Storm Mode:** Strict countdown, no feedback until submit, tab-switching doesn't pause
- **Arsenal:** Strike-through tool, Flag for Review pins, question grid navigator

### Educational Design

- **Algorithmic Remediation:** SME-written rationales for every option + "Teleport Link" to exact Wiki paragraph
- **Spaced Repetition:** Topics scored <50% silently flagged; future quizzes over-index weak nodes
- **Cognitive Stratification:** Level 1 (Recall) → Level 2 (Application)

### Architecture

- Full quiz payload delivered as single JSON array upfront (offline-capable)
- State auto-saves every 10 seconds (timer, answers, flags)
- Schema: `question_id`, `subject_id`, `topic_id`, `question_text` (Markdown), `options` (JSON), `rationale` (Markdown), `difficulty_level`

---

## PRD 3: Personal Notes & Workspace

**Objective:** Replace fragmented note-taking with a centralized, dynamic workspace for instant capture and cross-subject synthesis.

### UX/UI Specs

- **1-Click Capture:** From Wiki ("Send to Camp"), Quiz (bookmark icon saves Q + answer + rationale), 3D Lab (snapshot button)
- **Block-Based Editor:** Built on **TipTap** (`@tiptap/react ^3.20.1`) with extensions for highlights, tasks, images, horizontal rules
- **Split-Pane Review:** Notes in right drawer alongside Wiki or Quiz
- **Custom Cheat Sheets:** Drag blocks across subjects

### Educational Design

- **Context Preservation:** Every block auto-generates a Source Badge (e.g., `From: Structural Design > Steel > Bolted Connections`)
- **Auto-Tagging:** Captured notes inherit `subject_id` and `topic_id` from source
- **Smart Resurfacing:** Engine flags saved notes when user struggles on related quiz topics
- **Cloze Deletion:** Highlight word → "Hide" → flashcard blank

### Architecture

- TipTap block-based JSON schema (not plain HTML)
- Schema: `note_page_id`, `user_id`, `title`, `content_blocks` (JSON array), `associated_topics` (FK array → taxonomy)
- Optimistic UI on capture; async DB write via Supabase

---

## PRD 4: Interactive Media & 3D Lab

**Objective:** Translate abstract building codes into interactive spatial realities. Also the primary marketing weapon.

### UX/UI Specs

- **Parametric Sandbox:** Slider-driven control panel (lot width, depth, zoning). Real-time mesh feedback via React Three Fiber
- **Cinematic Camera:** Orbit/pan/zoom with physical constraints (never "break" the model). Uses `camera-controls ^3.1.2`
- **X-Ray & Cutaway:** Progressive layer stripping via slider
- **Guided Tours:** Camera flies along building systems with narrative cards

### Educational Design

- **Learning by Breaking:** Let students exceed code limits safely — red geometry + violation citation
- **Contextual Hotspots:** Click glowing elements → Rich Tooltip with exact building code from Wiki
- **In-Canvas Spatial Quizzing:** "Adjust setbacks to comply with R-1 zoning" — graded by physical adjustment

### Architecture

- **Engine:** React Three Fiber (`@react-three/fiber ^9.5.0`) + Three.js (`three ^0.183.2`) + Drei (`@react-three/drei ^10.7.7`)
- **Procedural Geometry:** `BoxGeometry` / `ExtrudeGeometry` for parametric models (no static files)
- **Static Assets:** Draco-compressed `.GLB` for fixed elements
- **Lazy Loading:** React Suspense — 3D engine only loads on navigation to Lab
- **Visual Effects:** Shader gradients via `@shadergradient/react ^2.4.20`

---

## PRD 5: AI Contextual Tutor

**Objective:** Hyper-localized, 24/7 Socratic guidance under a strict Zero-Hallucination Mandate.

### Architecture — Anti-Hallucination Pipeline

- **Closed-Loop Vector DB:** All Wiki content → vector embeddings (Supabase pgvector or dedicated vector store). No internet access.
- **Temperature = 0.0:** Maximum literalness
- **Double-Pass Verification:** Secondary Auditor LLM checks for hallucinated numbers/dates/codes
- **"I Don't Know" Protocol:** Hard constraint in system prompt — redirect to subject node if answer not found

### UX/UI Specs

- **Mandatory Citation Badges:** Every response ends with clickable `[Source: PD 1096 - Rule 7, Sec 704]`
- **Context-Aware Prompts:** Pre-filled based on location (e.g., after failing quiz: "Explain the flaw in my logic")
- **"Report Hallucination" Flag:** Freezes interaction, sends to SME queue

### Educational Design

- **Socratic Scaffolding:** During active tests, guides with questions instead of direct answers
- **Analogy Generation:** Translates technical jargon into physical real-world analogies

### Branding

- Named **"SlateCamp Reference Assistant"** — not "AI Oracle" or "Smart Bot"
- Onboarding modal: *"This AI only searches the SlateCamp database. Always verify with Source Badges."*

---

## PRD 6: Analytics Dashboard

**Objective:** Translate raw interactions into a visual, predictive Readiness Score.

### UX/UI Specs

- **Macro View — Taxonomy Heatmap:** Parent subjects as large blocks, child topics nested. Color: 🟢 >85%, 🟡 60–84%, 🔴 <59%, ⬜ Unexplored
- **Micro View — Node Inspector:** Click any node → historical accuracy, time-series graph, attempt count
- **Pacing Metric:** Average time per item gauge with board exam pace comparison
- **"Fix It" CTA:** Auto-generates targeted quiz from red nodes
- **Charts:** Built with **Recharts** (`recharts ^3.8.0`)

### Data Science

- **Exponential Moving Average (EMA):** Recent performance weighted heavier than historical
- **Item Response Theory (IRT):** Hard questions boost score more than easy ones
- **Lucky Guess Detector:** Flags fast correct answers on complex questions

### Database Schema

- `user_interactions`: `interaction_id`, `user_id`, `session_id`, `question_id`, `topic_id`, `selected_option_id`, `is_correct`, `time_spent_ms`, `timestamp`, `test_mode`
- `user_node_mastery`: `user_id`, `topic_id`, `total_attempts`, `total_correct`, `current_mastery_weight` (EMA float), `avg_time_ms`, `last_encountered`