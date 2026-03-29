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

- **Typographic Ergonomics:** Line lengths capped at 65–75 characters; clean Inter sans-serif for all UI text
- **Theme:** Light mode primary (Surface Light `#F8F7F5` background). Dark mode supported via `next-themes`.
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

### Implementation Status (March 2026)

- [x] Wiki article renderer with MDX/Markdown support
- [x] Sticky ToC with active section highlighting
- [x] `WikiArticle`, `WikiRightSidebar`, `WikiExamTable`, `KeyValues`, `RevealBlock`, `SubjectSnapshot` components
- [x] `WikiQuizButton` and `WikiQuizModal` for inline quiz launch from Wiki
- [ ] Highlight-to-Action Toolkit (planned)
- [ ] Peek-View references (planned)

---

## PRD 2: Adaptive Testing & Quizzing Engine

**Objective:** Systematically transition users from passive reading to active recall by measuring competence against the master syllabus.

> **Full spec:** See `03 — PRDs-Testing & Specification Document.md` for the complete step-by-step implementation guide covering all modes, algorithms, and edge cases.

### UX/UI Specs

- **Syllabus Selector:** Subject-based cascading checkbox tree (Level 1: Subject → Level 2: Module → Level 3: Topic) with live item counter
- **Camp Mode:** Instant green/red feedback, expanded rationale blocks, no timer
- **Storm Mode:** Strict countdown, no feedback until submit, tab-switching doesn't pause
- **Arsenal:** Strike-through tool, Flag for Review pins, question grid navigator
- **Two-column layout:** Question/options column (left) + feedback panel (right) via `QuizShell`, `OptionsColumn`, `FeedbackPanel`, `QuizFooter`

### Educational Design

- **Algorithmic Remediation:** SME-written rationales for every option + "Teleport Link" to exact Wiki paragraph
- **Spaced Repetition:** Topics scored <50% silently flagged; future quizzes over-index weak nodes
- **Cognitive Stratification:** Level 1 (Recall) → Level 2 (Application)

### Architecture

- Full quiz payload delivered as single JSON array upfront (offline-capable)
- State auto-saves every 10 seconds (timer, answers, flags) to `quiz_sessions`
- Schema tables: `quiz_sessions`, `user_interactions`, `user_node_mastery`

### Implementation Status (March 2026)

- [x] `QuizShell`, `OptionsColumn`, `FeedbackPanel`, `QuizFooter` components (quiz-v2)
- [x] `SetupFlow`, `IntroSlide1`, `IntroSlide2` setup components
- [x] `ResultsDashboard`, `ResultsCTAs`, `ReviewCard`, `ReviewCardList`, `ReviewFilterBar` result components
- [x] `ReviewHub` (replaces old TestingHub) in `src/components/testing/hub/`
- [x] `SessionsTable` in `src/components/testing/hub/`
- [x] IRT 2-PL model in `src/lib/srs/irt.ts`
- [x] SM-2 spaced repetition in `src/lib/srs/sm2.ts`
- [x] All server actions: `start-session`, `submit-answer`, `end-session`, `get-review-data`

---

## PRD 2.1: Testing & Quizzing — Complete Feature Specification

**Codename:** The Diagnostic Core — Full Spec

**Status:** See `03 — PRDs-Testing & Specification Document.md`. That document is the canonical reference.

---

## PRD 3: Personal Notes & Workspace

**Objective:** Give students a structured space to capture, synthesize, and review knowledge — turning passive study into active recall.

### Core Features

- **Block-based editor** (TipTap) with support for Markdown, code, math (KaTeX), and images
- **Highlight-to-Capture** from Wiki articles — preserves `topic_id` linkage and source badge
- **Cloze Deletion** — highlight any word → convert to active recall flashcard
- **Source Badges** on every captured block — one-click return to origin Wiki paragraph or quiz rationale
- **Split-pane view** — notes alongside Wiki or Quiz without losing context

### Data Schema

- Table: `user_notes` — `note_id`, `user_id`, `title`, `content_blocks` (JSONB), `associated_topics` (UUID[] FK → taxonomy_tree)

---

## PRD 4: Interactive Media & 3D Lab

**Objective:** Spatial learning through interactive 3D models — "Learning by Breaking."

### Core Features

- **Parametric Sandbox:** GLTF/GLB models where exceeding building code limits turns geometry red with inline legal citation (e.g., "Violation: Rule 7, Sec 704")
- **Guided Tours:** Cinematic fly-throughs of building systems
- **Spatial Hotspots:** Clickable 3D annotations linked to taxonomy nodes → opens Wiki peek view
- **X-Ray / Cutaway modes:** Strips building layers to reveal MEPFS systems

### Performance Target

- 60 FPS on standard laptop (Intel UHD / M1 baseline)
- Lazy-loaded via React Suspense — does not block dashboard load

---

## PRD 5: AI Contextual Tutor

**Objective:** A Zero-Hallucination Socratic guide that never answers directly — only guides.

### Core Features

- **RAG Pipeline:** pgvector semantic search over `wiki_embeddings` → retrieves relevant context before generating
- **Double-Pass Auditor LLM:** Secondary LLM verifies every factual claim against retrieved context. Hallucination → "I don't know" fallback
- **Temperature 0.0:** Deterministic responses. No creative generation.
- **Citation Badges:** Every response includes `[Source: article_id]` parsed into clickable pills linking to exact Wiki paragraphs
- **Socratic Mode:** During active quiz, AI only asks guiding questions — never reveals the answer

---

## PRD 6: Analytics Dashboard

**Objective:** Mathematical proof of readiness — the Readiness Score and everything that feeds it.

### Core Features

- **Readiness Score™:** EMA-weighted, IRT-adjusted composite score across all taxonomy nodes
- **Taxonomy Heatmap™:** Color-coded mastery map (Green ≥85%, Amber 60–84%, Red <60%, Grey = unexplored)
- **Pacing Gauge:** Average time per item vs. board exam pace
- **Endurance Curve:** Accuracy-over-time plot revealing cognitive fatigue point
- **Node Inspector:** Click any heatmap node → historical accuracy, attempt count, "Fix It" one-click targeted quiz

### Key Components (March 2026)

- `PacingInsights`, `PacingQuadrant`, `ReadinessTrajectory`, `StaminaCurve`, `ChartCoachingAnnotation`
- `readiness-score-update` server action
- `mastery-actions` for EMA recalculation
- `user_global_stats` and `readiness_score_snapshots` tables for aggregated analytics
