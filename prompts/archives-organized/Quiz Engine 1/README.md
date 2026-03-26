# SlateCamp Quiz Engine — Complete Documentation Set

> **7 documents.** Everything an AI or developer needs to build an award-winning quiz engine from scratch — no ambiguity, no guessing.

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

---

## Reading Order

**For a designer:** 01 → 02 → skip to 07 (accessibility section)

**For a frontend developer:** 06 → 01 → 03 → 07

**For a backend developer:** 03 → 05 → 04

**For an AI building the whole thing:** Read ALL in this order: 02 → 01 → 03 → 04 → 05 → 06 → 07

The recommended AI reading order starts with *why* (journey maps + psychology), then *what* (UI spec), then *how* (schema → content → mastery → components → testing).

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
└── 07-accessibility-testing.md            ← A11y + testing matrix
```

---

## Version

- **v1.0** — March 2026
- **Status:** Design specification (pre-implementation)
- **Platform:** SlateCamp (Philippine ALE exam prep)
- **Stack:** Next.js App Router · Supabase (PostgreSQL) · Zustand · Tailwind · Shadcn UI
