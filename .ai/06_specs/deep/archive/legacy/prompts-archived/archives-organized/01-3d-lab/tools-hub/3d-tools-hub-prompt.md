# SlateCamp — 3D Interactive Tools Hub (Public Landing Page Feature)

## Context

You are building a new public-facing feature for SlateCamp's landing page: an **Interactive Tools Hub** — a collection of free, browser-based architectural calculation tools with 3D visualization. These tools serve two purposes:

1. **SEO & Lead Generation** — Free tools that architecture students and professionals search for, driving organic traffic to SlateCamp
2. **Brand Authority** — Demonstrating SlateCamp's 3D capability and technical credibility before users ever sign up

The tools live on the **public marketing site** (not behind auth). They are standalone utilities — not part of the dashboard.

## Critical: Read Before Writing Any Code

Before writing a single line of code, you MUST:

1. **Explore the existing repo structure** — Run `find` or `ls` on the project root to understand the routing paradigm (App Router vs Pages Router), existing component patterns, Tailwind config, and folder conventions. Match them exactly.
2. **Read the existing landing page code** — Find the current public-facing pages and understand how they're structured, what layout components they use, what nav/footer components exist. The new tools hub must feel like a native extension of the existing site, not a bolted-on addition.
3. **Check `src/app/globals.css`** — Identify existing design tokens (colors, fonts, spacing) and use them. Never hardcode hex values that already exist as tokens.
4. **Check `package.json`** — See what UI libraries are already installed (Shadcn, Framer Motion, etc.) and use them rather than adding new dependencies.

## What We're Building (Scope)

Three interactive tools, housed under a tools hub page:

### Tool 1: Floor Tiles Calculator
- **What it does:** User inputs room dimensions and tile size → 3D visualization shows the tiled floor with accurate count, cut tiles at edges, and waste percentage
- **ALE relevance:** Estimating (Rule 8) — tile quantity takeoff is a common exam topic and real-world skill
- **Inputs:** Room length (m), room width (m), tile size (dropdown: 300×300, 400×400, 600×600, custom), grout width (mm)
- **Future 3D:** React Three Fiber plane with tiled texture, camera orbit

### Tool 2: Wall Paint Calculator  
- **What it does:** User inputs wall dimensions and openings → calculates paintable area, number of cans needed, and estimated cost
- **ALE relevance:** Estimating — paint quantity takeoff, understanding coverage rates
- **Inputs:** Wall height (m), wall width (m), number of doors (standard 0.90×2.10m), number of windows (standard 1.20×1.20m), paint coats (1-3), paint coverage rate (m²/L)
- **Future 3D:** React Three Fiber wall with painted surface, doors/windows as cutouts

### Tool 3: Lot Plotter (TCT Technical Description)
- **What it does:** User inputs the metes-and-bounds technical description from a Transfer Certificate of Title (TCT) → plots the lot boundary as a 2D/3D polygon with labeled bearings and distances
- **ALE relevance:** Site Planning — reading technical descriptions is tested in Area A, and architects must interpret TCTs for every project
- **Inputs:** Dynamic list of survey lines, each with: bearing (N/S degrees minutes E/W), distance (m). User can add/remove lines. Starting point is assumed origin (0,0)
- **Future 3D:** React Three Fiber extruded lot polygon with dimension labels

## Architecture Decisions (Follow These)

### Routing
```
/tools                          → Hub index page (hero + tool cards grid)
/tools/floor-tiles-calculator   → Tool 1
/tools/wall-paint-calculator    → Tool 2  
/tools/lot-plotter              → Tool 3
```

Use the **existing router paradigm** in the repo. If App Router: create `app/(public)/tools/` route group (or whatever grouping the existing public pages use). If Pages Router: create `pages/tools/`.

### Layout Pattern
Each tool page uses a **split-panel layout**:
- **Desktop (lg+):** Side-by-side — left panel (inputs/controls, ~40% width), right panel (3D canvas area, ~60% width)
- **Mobile:** Stacked — inputs on top, 3D canvas below (sticky or collapsible)

### Component Hierarchy
```
src/components/tools/
├── ToolCard.tsx                    # Reusable card for the hub grid
├── ToolPageLayout.tsx              # Shared split-panel layout wrapper
├── ThreeDCanvasPlaceholder.tsx     # Polished placeholder for future R3F Canvas
├── floor-tiles/
│   └── FloorTilesForm.tsx          # Input form for floor tiles calculator
├── wall-paint/
│   └── WallPaintForm.tsx           # Input form for wall paint calculator
└── lot-plotter/
    └── LotPlotterForm.tsx          # Dynamic metes-and-bounds input form
```

### TypeScript Interfaces
Define strict interfaces for each tool's data model. These interfaces will eventually be consumed by the R3F components:

```typescript
// src/types/tools.ts

export interface FloorTilesInput {
  roomLength: number      // meters
  roomWidth: number       // meters  
  tileSize: number        // mm (side length, square tiles)
  groutWidth: number      // mm
}

export interface FloorTilesResult {
  totalArea: number       // m²
  wholeTiles: number
  cutTiles: number
  totalTiles: number
  wastePercentage: number
}

export interface WallPaintInput {
  wallHeight: number      // meters
  wallWidth: number       // meters
  doorCount: number
  windowCount: number
  coats: 1 | 2 | 3
  coverageRate: number    // m² per liter
}

export interface WallPaintResult {
  grossArea: number       // m²
  openingsArea: number    // m²
  netPaintableArea: number // m²
  litersNeeded: number
}

export interface SurveyLine {
  id: string
  bearing: {
    from: 'N' | 'S'
    degrees: number       // 0-90
    minutes: number       // 0-59
    to: 'E' | 'W'
  }
  distance: number        // meters
}

export interface LotPlotterInput {
  lines: SurveyLine[]
}

export interface LotPlotterResult {
  coordinates: { x: number; y: number }[]  // computed vertices
  totalArea: number       // m²
  perimeter: number       // m
  isClosed: boolean       // whether the polygon closes back to origin
}
```

### ThreeDCanvasPlaceholder Component
This is NOT an empty div. It must look intentional and premium:
- Light grid pattern background (like graph paper or a blueprint)
- Subtle animated gradient or pulsing dot pattern to feel "alive"
- Center text: "3D Preview" with a small icon (cube wireframe)
- Rounded corners, proper border treatment matching existing card styles
- Responsive: fills its container
- This component will later be swapped 1:1 with a real `<Canvas>` from R3F

### Hub Index Page Design
- **Hero section:** Headline emphasizing free tools for architecture students/professionals. Subtext mentioning ALE prep value. Match the existing landing page hero pattern.
- **Tool cards grid:** 3 cards, each with: icon/illustration, tool name, 1-line description, "Try it free →" CTA. Use the existing card/component patterns from the landing page.
- No auth required. No sign-up wall. These are fully public.

## UX Requirements

1. **Form Validation:** All numeric inputs must reject negative numbers, zero where inappropriate, and non-numeric input. Use `zod` if it's already in the project, otherwise use native HTML validation + controlled components.
2. **Responsive:** Mobile-first. Test mental model: a student on their phone during a site visit should be able to use the lot plotter.
3. **Loading/Empty States:** ThreeDCanvasPlaceholder handles the "no calculation yet" state. After calculation, it transitions to show results (for now, display computed results as an overlay on the placeholder).
4. **Breadcrumb Navigation:** Each tool page shows: Tools Hub → [Tool Name]. Clicking "Tools Hub" returns to the index.

## Design Constraints (SlateCamp Brand)

- **Typography:** Syne for headings (`font-display`), Inter for body (`font-sans`), DM Mono for numbers/labels (`font-mono`)
- **Colors:** Use existing design tokens. Primary actions in Cobalt Blue. No decorative color. Camp Orange only if there's a single dominant CTA.
- **Rams Standard:** Every element earns its place. No decorative illustrations, no unnecessary animations. The grid background on the 3D placeholder is functional (suggests measurement/precision), not decorative.
- **Cards:** Match the existing card border radius, shadow, and padding from the landing page

## Execution Instructions

Work in this order. After each step, verify the build compiles (`npm run build` or equivalent) with zero errors and zero TypeScript complaints:

1. **Explore** — Read the repo structure, landing page code, tailwind config, and component patterns. Report what you find before writing code.
2. **Types** — Create `src/types/tools.ts` with all interfaces
3. **Shared Components** — Build `ToolCard`, `ToolPageLayout`, `ThreeDCanvasPlaceholder`
4. **Routes + Hub Page** — Create the `/tools` route and hub index page with hero + card grid
5. **Tool Subpages** — Create each tool's page with its specific form, wired to the shared layout
6. **Validation + Polish** — Add form validation, responsive testing, error states
7. **Build Verification** — Run the build. Fix any errors. Run it again until clean.

## What NOT To Do

- **Do NOT implement R3F/Three.js rendering.** The 3D canvas is a placeholder only.
- **Do NOT add new npm dependencies** unless absolutely necessary and justified. Use what's already in the project.
- **Do NOT create a separate design system.** Use existing Shadcn components and Tailwind tokens.
- **Do NOT implement actual calculation logic yet.** The forms collect data and store it in state. The result types are defined but not computed. (Exception: if the math is trivial — like `area = length × width` — you can include it, but don't spend time on the lot plotter's bearing-to-coordinate conversion.)
- **Do NOT put these behind authentication.** These are public marketing pages.
