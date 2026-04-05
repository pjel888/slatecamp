# State: Memory

**Last Updated:** 2026-04-06  
**Purpose:** Accumulated verified facts across sessions — survives session resets

---

## Codebase Verified Facts

### Portal Architecture
- **4 portals confirmed:** Dashboard (`/dashboard`), Admin (`/admin`), CEO (`/ceo` via `(protected)/ceo`), Developer (`/developer`)
- CEO portal is nested under `src/app/(protected)/ceo/` — NOT a top-level route segment
- Each portal has its own `AGENTS.md` at `src/app/{portal}/AGENTS.md`

### Tech Stack
- Next.js **16.1.6** (NOT 15.x)
- React **19.2.4** (NOT 18.x)
- TypeScript **5.9.3**
- Tailwind CSS **4.2.2**
- Supabase: `@supabase/supabase-js` **2.100.0** + `@supabase/ssr` **0.9.0**
- Package manager: **Bun** (NOT npm/yarn/pnpm)
- 3D: `@react-three/fiber` **9.5.0** + `three` **0.183.2**
- Zustand: **5.0.12**

### Statistics (as of 2026-04-05)
- Total `.tsx` files: ~1044
- Pages (App Router): 137 across 4 portals
- Server action files: 116 (in `src/lib/actions/`)
- Zustand stores: 5 (in `src/stores/`)
- React Contexts: 10
- Database tables: 51 (50 with RLS)
- RLS policies: 89+
- Database migrations: 60
- Production dependencies: 56
- Dev dependencies: 8

### Design System (SlateCamp)
- **Primary:** Camp Cobalt `#1B3FC4` — `text-primary` / `bg-primary`
- **Accent:** Camp Orange `#E8853A` — sparingly for progress/warm CTAs
- **Success:** Emerald `#2D9F6F` — `text-success`
- **Error:** Warm Red `#D64545` — `text-destructive`
- **Warning:** Amber `#D4951A` — `text-warning`
- **Background:** Surface Light `#F8F7F5` — `bg-background`
- **Text:** Ink Primary `#1A2332` — `text-foreground`
- **Border:** `#D4DAE3` — `border-border`
- **Secondary text:** `#4A5568` — `text-text-secondary`
- **Muted text:** `#8896A7` — `text-muted-foreground`

### Routes Verified
- `/dashboard` — 33 pages
- `/admin` — 27 pages
- `/ceo` — 4 pages (nested under `(protected)`)
- `/developer` — 21 pages

### Empty / Deprecated Folders
- `.ai/docs/05-Design/` — empty
- `.ai/docs/XX-Archive/` — empty
- `.ai/docs/portal/proposals/` — empty
- `.ai/docs/portal/superpowers/plans/` — empty
- `.ai/docs/portal/superpowers/specs/` — empty
- `.ai/docs/portal/wiki-articles/.omc/` — state files, to be deleted

### SQL Import Scripts (to archive)
- `_batch*.sql`
- `_sql_*.sql`
- `_combined_insert.sql`
- `_insert.json`

### Preserved Files (renamed/moved)
- `SlateCamp Design System.md` → `archive/legacy/design-system.md`
- `COPY-CONTENT-SOURCE-OF-TRUTH.md` → `03-design/002-copy-guide.md`
- `RLS-POLICY-PATTERNS.md` → `05-reference/001-rls-patterns.md`
- `PLATFORM_OVERVIEW.md` → `archive/legacy/platform-overview.md`
- `portal/architecture/SLATECAMP-ARCHITECTURE.md` → `portal/architecture/001-architecture.md`

---

## Session History

### Session 2026-04-05: Initial Audit
- Audited `.ai/docs/` numbered folders — all found outdated vs live codebase
- Verified portal counts, routes, package versions against actual files
- Confirmed CEO portal nested under `(protected)/ceo`
- Confirmed Bun as package manager (not npm)
- Confirmed Next.js 16.1.6 (not 15.x)
- Identified 10 numbered folders + 2 empty folders + SQL imports + state files

### Session 2026-04-05: v4.0 Plan Created
- Created `docs-implementation-plan.md` v4.0 — full rewrite plan with 42 documents
- Identified source-to-document mapping for each planned doc
- Changed archive strategy from DELETE to ARCHIVE based on user preference

### Session 2026-04-06: v5.0 Upgrade — Model Workspace Protocol
- Upgraded plan to Model Workspace Protocol pattern
- Added `.ai/prd.md`, `.ai/state/memory.md`, `.ai/state/current-task.md`, `.ai/logs/changelog.md`
- Created task files under `.ai/tasks/`
- Created full directory structure

---

*Add verified facts here. Every entry must be traceable to a source file.*
