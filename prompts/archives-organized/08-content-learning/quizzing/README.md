# SlateCamp Quiz Engine — Complete Documentation Set

> **9 documents.** Everything an AI or developer needs to build an award-winning quiz engine from scratch — no ambiguity, no guessing.

---

## Document Index

| # | Document | Format | Purpose | Key Contents |
|---|---|---|---|---|
| 01 | **UX/UI Specification** | HTML | What the user SEES | Two-column layout law, wireframes, component specs, config object, per-mode UI behaviors, accessibility visual specs |
| 02 | **User Journey Maps & Decision Webs** | HTML | What the user FEELS and DECIDES | 7-phase journey (47 steps), 4 persona behavioral profiles, 4 decision webs (23 branch points), 30 functional requirements, success metrics |
| 03 | **Data Schema & API Contract** | Markdown | Where data LIVES and how it MOVES | Database tables (new + extended), TypeScript interfaces, 7 Server Actions with input/output types, Zustand store shape, data flow diagram, question selection SQL, offline sync architecture |
| 04 | **Question Content & Taxonomy** | Markdown | What CONTENT fills the shell | Question object structure, full ALE taxonomy tree (3 areas, 30+ topics), difficulty calibration (5-level scale), adaptive algorithm, rationale quality standards, content QA checklist |
| 05 | **Mastery Engine & Scoring** | Markdown | How the BRAIN works | EMA mastery formula, Readiness Score computation, heatmap color logic, Blindspot Protocol algorithm, session scoring, confidence calibration, stamina analysis |
| 06 | **Component Architecture & State** | Markdown | How the CODE is structured | React component tree, Server/Client boundaries, Zustand store (full interface), interaction flows (code-level), two-column CSS implementation, data fetching patterns, offline IndexedDB, performance/bundle splitting |
| 07 | **Accessibility & Testing** | Markdown | How to make it RIGHT for everyone | Full semantic HTML templates, ARIA patterns, keyboard navigation map (every shortcut), screen reader test scripts, color contrast audit, touch target audit, testing matrix (per-mode × per-test), device testing matrix, pre-ship accessibility gate |
| 08 | **Frame-by-Frame Storyboard** | Markdown | What the AI RENDERS at every moment | 25 numbered frames (F-001→F-020), ASCII wireframes, complete element inventories per frame, transition tables ("user taps X → go to frame Y"), mode config matrix, per-mode entry variations, edge case frames |
| 08b | **Storyboard Addendum** | Markdown | Three PRODUCT DECISIONS that override Doc 08 | **Swipe-to-submit** as default (full gesture spec, haptics, confirmation strip, first-time tooltip), **auto-submit on completion** (no opt-out, no confirmation modal), **question history stats** (Pro users, review mode only). Includes exact frame modifications, implementation pseudocode, and updated universal flow summary. |

---

## Reading Order

**For a designer:** 01 → 02 → 08 → 08b → 07

**For a frontend developer:** 08 → 08b → 06 → 01 → 03 → 07

**For a backend developer:** 03 → 05 → 04

**For an AI building the whole thing:** Read ALL in this order: 02 → 08 → 08b → 01 → 03 → 04 → 05 → 06 → 07

Start with *why* (journey maps), then *what happens frame-by-frame* (storyboard + addendum), then *what it looks like* (UI spec), then *how it's built* (schema → content → mastery → components → testing).

**CRITICAL:** Always read 08b AFTER 08. The addendum overrides several frames in the storyboard.

---

## File Locations

```
slatecamp-quiz-engine-docs/
├── README.md                              ← This file
├── 01-quiz-engine-ux-ui-spec.html         ← UX/UI layouts + wireframes
├── 02-journey-maps-decision-webs.html     ← User behavior + requirements
├── 03-data-schema-api-contract.md         ← Database + API + state
├── 04-question-content-taxonomy.md        ← Content structure + ALE taxonomy
├── 05-mastery-engine-scoring.md           ← Algorithms + formulas
├── 06-component-architecture-state.md     ← React components + Zustand
├── 07-accessibility-testing.md            ← A11y + testing matrix
├── 08-frame-by-frame-storyboard.md        ← Every screen, every button, every transition
└── 08b-storyboard-addendum.md             ← Swipe-to-submit, auto-submit, question history
```

---

## Version

- **v1.1** — March 2026 (added Doc 08, 08b)
- **Status:** Design specification (pre-implementation)
- **Platform:** SlateCamp (Philippine ALE exam prep)
- **Stack:** Next.js App Router · Supabase (PostgreSQL) · Zustand · Tailwind · Shadcn UI
