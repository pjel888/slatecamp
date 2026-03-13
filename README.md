SlateCamp
=========

SlateCamp is a high‑performance, discipline‑agnostic study engine for professional licensure exams. The product focuses on signal‑rich practice, mastery tracking, and calm, minimal UI rather than generic gamification.

### Core Principles

- **Aesthetic**: Apple Human Interface Guidelines × Dieter Rams — functional, minimalist, unobtrusive.
- **Progression**: Mapped to Readiness Score, Taxonomy Heatmap, and Pacing Gauge (no badges, streaks, or confetti).
- **Reliability**: Persistent state with frequent autosave during testing and practice flows.

### Tech Stack

- **Framework**: Next.js (App Router) with React
- **Styling**: Tailwind CSS with a zinc‑first neutral palette
- **State Management**: Zustand and/or React Context
- **Backend**: Supabase (PostgreSQL)
- **Package Manager**: Bun
- **Spatial/3D**: React Three Fiber (R3F) and Three.js where needed, targeting 60 FPS

### Getting Started

1. **Install dependencies**

   ```bash
   bun install
   ```

2. **Run the development server**

   ```bash
   bun dev
   ```

3. Open `http://localhost:3000` in your browser to view the app.

### Project Guidance & Conventions

- **System prompt & routing rules**: See `CLAUDE.md` for the core execution protocol, architectural constraints, and non‑negotiable rules that govern this repo.
- **Architecture, UX, and implementation docs**: Additional blueprints and PRDs live under `.claude/docs/`.
- **Agent behaviors & roles**: See `.claude/agents/` for specialized personas (architecture, DB, security, frontend, etc.).

Anyone contributing to SlateCamp should read `CLAUDE.md` first to understand the intent behind the implementation details.