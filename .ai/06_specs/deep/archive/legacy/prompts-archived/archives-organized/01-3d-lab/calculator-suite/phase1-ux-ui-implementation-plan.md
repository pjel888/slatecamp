# Phase 1 Calculator Suite — UX & UI Implementation Plan

**Document type:** Developer-ready UX/UI specification — user journeys, component mapping, state management, responsive layout, freemium gates, sponsor integration
**Date:** April 2026
**Status:** Build-ready
**Prerequisite reading:** `3d-calculator-suite-final.md` (product spec), `phase1-3d-canvas-spec.md` (3D canvas architecture), `3d-calculator-business-strategy.md` (revenue + funnel)
**Design system authority:** SlateCamp Design System Engineering Guide (Rams Standard)

---

## 1. User Personas for the Calculator Suite

The Calculator Suite serves a different audience mix than the 3D Lab. Three primary personas, derived from the SlateCamp UX research framework, map to distinct calculator usage patterns.

### Persona A: The Practicing Architect / Junior Designer

- Age 25–35, employed at a small-to-mid firm or freelancing
- Needs quick material estimates for active projects
- Arrives via Google search ("tile calculator Philippines," "paint computation")
- Values: speed, accuracy, exportable output
- Freemium trigger: wants PDF BOQ export, L-shape rooms, saved projects
- Sponsor relevance: HIGH — actively purchasing materials

### Persona B: The ALE Candidate (The Anxious First-Taker / The Retaker)

- Age 22–30, reviewing for the Architecture Licensure Examination
- Arrives via SlateCamp marketing, Facebook architecture groups, or word of mouth
- Uses calculators to understand estimation logic tested in Area C (ADSP)
- Values: seeing the formula trail, understanding why waste differs by pattern
- Pro funnel trigger: "This calculation is tested in the ALE" CTA
- Sponsor relevance: LOW — not purchasing materials yet

### Persona C: The Homeowner / Contractor

- Age 30–55, planning a renovation or overseeing construction
- Arrives via Google search, hardware store co-marketing, or social share
- Values: simple input, trustworthy output, "how many to buy" answer
- Freemium trigger: likely satisfied with free rectangular mode
- Sponsor relevance: HIGHEST — immediate purchase intent

---

## 2. Entry Points & Navigation Architecture

### 2.1 URL Structure

```
/calculators                          → Suite landing page (index of all tools)
/calculators/flooring                 → Flooring / Tile Visualizer
/calculators/paint                    → Paint Visualizer
/calculators/drywall                  → Drywall Partition Estimator
```

### 2.2 Entry Point Map

| Entry point | Persona | First screen | Notes |
|---|---|---|---|
| Direct URL (SEO) | A, C | Tool page with inputs pre-focused | Primary acquisition channel |
| Suite index page | A, B | `/calculators` grid of tool cards | Internal navigation |
| SlateCamp dashboard sidebar | B | `/calculators` or specific tool | Logged-in students |
| Sponsor co-marketing link | C | Tool page with sponsor presets pre-loaded via URL params | `?sponsor=mariwasa&sku=60x60-porcelain` |
| ALE exam CTA (from 3D Lab, Wiki) | B | Tool page with educational framing | "Practice this computation" context |
| Social share / referral link | C | Tool page with pre-filled room dimensions | `?l=4000&w=3000` |

### 2.3 Suite Index Page Component

The `/calculators` page is a Server Component. It renders a responsive grid of tool cards. No client-side state required.

```
/calculators page layout:
┌─────────────────────────────────────────────────────┐
│ [Eyebrow] ESTIMATION TOOLS                          │
│ [H1] 3D Calculator Suite                            │
│ [Subtitle] Free material estimation with 3D preview │
├─────────────────────────────────────────────────────┤
│ ┌─────────┐ ┌─────────┐ ┌─────────┐                │
│ │ Flooring │ │  Paint  │ │ Drywall │                │
│ │  [thumb] │ │ [thumb] │ │ [thumb] │                │
│ │  Start → │ │ Start → │ │ Start → │                │
│ └─────────┘ └─────────┘ └─────────┘                │
│                                                     │
│ [Coming Soon row — Phase 2+ tools, muted]           │
│ ┌─────────┐ ┌─────────┐                             │
│ │ CHB Wall│ │Plaster  │                             │
│ │  (soon) │ │ (soon)  │                             │
│ └─────────┘ └─────────┘                             │
├─────────────────────────────────────────────────────┤
│ [ALE CTA banner]                                    │
│ "These calculations are tested in the ALE.          │
│  SlateCamp helps you master them." [Learn more →]   │
└─────────────────────────────────────────────────────┘
```

**Component mapping:**

| Element | Component | Variant | Notes |
|---|---|---|---|
| Page wrapper | Server Component page.tsx | — | No `'use client'` |
| Tool card | `<div>` with card anatomy | Left-border accent card (`border-l-primary`) | One primary CTA per card |
| Card eyebrow | `<p>` DM Mono | `font-mono text-[9px] uppercase tracking-widest text-muted-foreground` | "FLOORING", "PAINT", "DRYWALL" |
| Card title | `<h3>` Inter medium | `font-sans font-medium text-sm` | Tool name |
| Card subtitle | `<p>` Inter regular | `font-sans text-xs text-muted-foreground` | One-line value prop |
| Card CTA | Link styled as ghost button | `text-primary hover:underline font-sans text-xs` | "Start estimating →" |
| Coming Soon card | Default white card | `opacity-60` | No CTA, muted state |
| ALE CTA banner | Left-border accent card | `border-l-camp-orange` | Camp Orange accent for primary CTA |

---

## 3. Shared Calculator Layout — The Three-Panel System

Every Phase 1 calculator uses an identical three-panel layout. This is the most critical UX decision in the suite: consistency across tools builds trust and reduces cognitive load.

### 3.1 Desktop Layout (≥1024px)

```
┌──────────────────────────────────────────────────────────────┐
│ [Breadcrumb] Calculators > Flooring / Tile Visualizer        │
├────────────┬──────────────────────┬─────────────────────────┤
│ INPUT      │ 3D PREVIEW           │ RESULTS                 │
│ PANEL      │                      │                         │
│            │                      │ [Net/Buy toggle]        │
│ [fields]   │    [R3F Canvas]      │                         │
│            │                      │ Gross area: 12.00 sq.m. │
│ [sponsor   │                      │ − Exclusions: 0.50      │
│  card]     │                      │ Net area: 11.50 sq.m.   │
│            │                      │ Waste (10%): +1.15      │
│            │                      │ ─────────────────────── │
│            │                      │ Buy: 128 tiles (3 boxes)│
│            │                      │                         │
│            │                      │ [Assumptions accordion] │
│            │                      │                         │
│            │                      │ [Export PDF] [Save]     │
│            │                      │ [ALE CTA]              │
├────────────┴──────────────────────┴─────────────────────────┤
│ [Estimation disclaimer]                                      │
└──────────────────────────────────────────────────────────────┘
```

**Grid definition:**

```tsx
// Desktop: 3-column grid
<div className="grid grid-cols-1 lg:grid-cols-[320px_1fr_340px] gap-0 min-h-[calc(100vh-64px)]">
  <InputPanel />
  <CanvasPanel />
  <ResultPanel />
</div>
```

### 3.2 Mobile Layout (<1024px)

On mobile, the three panels stack vertically. The 3D canvas is sandwiched between inputs and results, occupying full viewport width. The input panel collapses into an accordion to maximize canvas visibility after initial entry.

```
┌──────────────────────────┐
│ [Breadcrumb]             │
├──────────────────────────┤
│ INPUT PANEL (accordion)  │
│ [collapsed after entry]  │
├──────────────────────────┤
│ 3D PREVIEW               │
│ [full width, 56vw height]│
│ [touch: orbit/zoom/pan]  │
├──────────────────────────┤
│ RESULTS                  │
│ [full calculation trail]  │
│ [Assumptions accordion]  │
│ [Export] [Save] [ALE CTA]│
├──────────────────────────┤
│ [Disclaimer]             │
└──────────────────────────┘
```

**Mobile grid:**

```tsx
// Mobile: single column stack
<div className="flex flex-col min-h-screen">
  <InputPanelMobile />    {/* Collapsible accordion */}
  <CanvasPanel />          {/* aspect-[16/9] or min-h-[56vw] */}
  <ResultPanel />
</div>
```

### 3.3 Panel Specifications

#### Input Panel

```ts
interface InputPanelProps {
  toolType: 'flooring' | 'paint' | 'drywall'
  sponsorData: SponsorPreset | null
}
```

| Attribute | Desktop | Mobile |
|---|---|---|
| Width | 320px fixed | Full width |
| Background | `bg-card` (`#FFFFFF` light / dark mode card) | Same |
| Border | `border-r border-border` | `border-b border-border` |
| Padding | `p-4` (16px) | `px-4 py-3` |
| Scroll | Independent scroll (`overflow-y-auto`) | Collapsible accordion (Shadcn `<Accordion>`) |
| Position | Sticky left column | Top of stack, collapsed after first input |

**Input field standard (all tools):**

```tsx
// Every input field follows this structure
<div className="space-y-1.5">
  {/* Label — always above, never placeholder-only */}
  <label className="font-sans text-xs font-medium text-foreground">
    Room length
  </label>

  {/* Input — 48px min height for touch targets */}
  <div className="flex items-center gap-1">
    <Input
      type="number"
      className="h-10 font-mono text-sm tabular-nums"
      value={value}
      onChange={handleChange}
    />
    {/* Unit badge */}
    <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground shrink-0">
      mm
    </span>
  </div>

  {/* Sponsor default indicator (if value came from sponsor preset) */}
  {isSponsorDefault && (
    <p className="font-mono text-[8px] text-muted-foreground">
      Default from {sponsorName} • editable
    </p>
  )}
</div>
```

**Input group separator:**

```tsx
// Between logical groups (e.g., "Room Dimensions" vs "Tile Size")
<div className="py-3">
  <p className="font-mono text-[9px] font-medium uppercase tracking-widest text-muted-foreground">
    Tile configuration
  </p>
  <div className="mt-0.5 h-px bg-border" />
</div>
```

#### Canvas Panel

```ts
interface CanvasPanelProps {
  toolType: 'flooring' | 'paint' | 'drywall'
}
```

| Attribute | Desktop | Mobile |
|---|---|---|
| Width | Flexible (`1fr`) | Full viewport width |
| Height | `min-h-[500px]` fills available | `min-h-[56vw]` aspect-ratio driven |
| Background | `#F2F0EB` (cream) via Canvas `gl.setClearColor` | Same |
| Border | None | `border-y border-border` |
| Content | `<CalculatorCanvasShell>` from 3D canvas spec | Same |
| Interaction | Mouse orbit/zoom/pan | Touch orbit (1-finger), zoom (pinch), pan (2-finger) |

**Canvas empty state** (before any inputs are entered):

```tsx
// Show a ghost placeholder, not an empty canvas
<div className="flex flex-col items-center justify-center h-full text-center">
  <div className="w-12 h-12 rounded-lg bg-muted mb-3" />
  <p className="font-sans text-sm text-muted-foreground max-w-[200px] leading-relaxed">
    Enter room dimensions to see your 3D preview
  </p>
</div>
```

The empty state renders as a DOM overlay. The R3F Canvas mounts only after at least `roomLengthMm` and `roomWidthMm` (or `wallLengthMm` + `wallHeightMm` for drywall) have valid values. This prevents unnecessary GPU initialization.

**Conditional Canvas mount:**

```tsx
const hasDimensions = useToolStore((s) => s.roomLengthMm > 0 && s.roomWidthMm > 0)

return hasDimensions ? (
  <CalculatorCanvasShell>
    <ToolScene />
  </CalculatorCanvasShell>
) : (
  <CanvasEmptyState />
)
```

#### Result Panel

```ts
interface ResultPanelProps {
  toolType: 'flooring' | 'paint' | 'drywall'
  computed: FlooringComputed | PaintComputed | DrywallComputed
  resultMode: 'net' | 'buy'
  onResultModeChange: (mode: 'net' | 'buy') => void
}
```

| Attribute | Desktop | Mobile |
|---|---|---|
| Width | 340px fixed | Full width |
| Background | `bg-card` | Same |
| Border | `border-l border-border` | None (stacks below canvas) |
| Padding | `p-4` | `px-4 py-3` |
| Scroll | Independent scroll | Page scroll |

---

## 4. Complete User Journey — Flooring / Tile Visualizer

This is the most detailed user journey because Flooring ships first and establishes the UX pattern for Paint and Drywall.

### 4.1 Happy Path (Persona A — Practicing Architect)

**Step 1: Landing**

User arrives at `/calculators/flooring` via Google search.

| Screen element | Component | State | Rendering condition |
|---|---|---|---|
| Breadcrumb | `<nav>` with link style | Static | Always |
| Input panel | `<InputPanel toolType="flooring">` | Default values loaded | Always |
| Canvas panel | `<CanvasEmptyState>` | No Canvas mounted | `roomLengthMm === 0` |
| Result panel | `<ResultEmptyState>` | "Enter dimensions to see estimate" | `computed === null` |
| Sponsor card | `<SponsorCard>` | Loaded from sponsor preset or hidden | `sponsorData !== null` |

**Step 2: Room dimensions entry**

User enters room length (e.g., 4000mm) and width (e.g., 3000mm).

| Zustand mutation | UI reaction | 3D reaction |
|---|---|---|
| `setInput('roomLengthMm', 4000)` | Input field updates, unit badge visible | — (waiting for both dims) |
| `setInput('roomWidthMm', 3000)` | `recompute()` fires | Canvas mounts, `FloorPlane` renders at 4m × 3m |
| `inputVersion` increments | Result panel shows gross area: 12.00 sq.m. | `SceneInvalidator` calls `invalidate()` |

Component state changes:

| Component | Before | After |
|---|---|---|
| `<CanvasEmptyState>` | Visible | Unmounts |
| `<CalculatorCanvasShell>` | Not mounted | Mounts with `<FlooringScene>` |
| `<FloorPlane>` | — | Renders cream plane at room dims |
| `<TileGridInstanced>` | — | Renders default 60×60 tile grid |
| Result panel gross row | Empty state | "Gross area: 12.00 sq.m." |
| Result panel net row | Hidden | "Net area: 12.00 sq.m." (no exclusions) |
| Result panel buy row | Hidden | "128 tiles (3 boxes)" |

**Step 3: Tile size selection**

User selects a tile preset (e.g., 60×60) or enters custom dimensions.

| UI element | Component | Interaction |
|---|---|---|
| Tile preset buttons | Row of ghost buttons with DM Mono labels | `onClick` → `setInput('tileLengthMm', 600); setInput('tileWidthMm', 600)` |
| Custom size inputs | Two number inputs (length × width) | `onChange` → `setInput()` per field |
| Grout joint input | Number input with default 3mm | `onChange` → `setInput('groutJointMm', value)` |

```tsx
// Tile preset selector component
<div className="flex flex-wrap gap-1.5">
  {PH_TILE_PRESETS.map((preset) => (
    <button
      key={preset.label}
      onClick={() => {
        setInput('tileLengthMm', preset.lengthMm)
        setInput('tileWidthMm', preset.widthMm)
      }}
      className={cn(
        'px-2 py-1 rounded-md font-mono text-[10px] uppercase tracking-wider border transition-colors',
        isSelected
          ? 'bg-primary text-primary-foreground border-primary'
          : 'bg-transparent text-muted-foreground border-border hover:bg-muted'
      )}
    >
      {preset.label}
    </button>
  ))}
</div>
```

**Step 4: Pattern selection**

User selects a tile pattern. This updates waste percent and the 3D orientation arrow.

| Pattern | Default waste (auto-set) | 3D change | UI feedback |
|---|---|---|---|
| Straight | 8% | Grid aligned, arrow at 0° | Waste input auto-updates to 8% |
| Brick | 10% | Grid offset every other row, arrow at 0° | Waste input auto-updates to 10% |
| Diagonal | 12% | Grid aligned, arrow at 45° | Waste input auto-updates to 12% |
| Herringbone-lite | 15% | Grid aligned, arrow at 45° | Waste input auto-updates to 15% |

Pattern selector component:

```tsx
// Pattern selector — radio group visual, not actual <input type="radio">
<div className="grid grid-cols-2 gap-2">
  {PATTERNS.map((p) => (
    <button
      key={p.value}
      onClick={() => setInput('pattern', p.value)}
      className={cn(
        'flex flex-col items-center gap-1 p-2 rounded-lg border transition-colors',
        selected === p.value
          ? 'border-primary bg-primary/5'
          : 'border-border hover:bg-muted'
      )}
    >
      {/* Pattern icon — simple SVG, 32×32 */}
      <PatternIcon pattern={p.value} className="w-8 h-8" />
      <span className="font-mono text-[9px] uppercase tracking-widest">
        {p.label}
      </span>
    </button>
  ))}
</div>
```

**Step 5: Review results**

The result panel updates in real-time. User sees the full calculation trail.

Result panel structure (all tools share this anatomy):

```
┌─────────────────────────────────────────┐
│ [Net/Buy toggle — Shadcn Tabs]          │
├─────────────────────────────────────────┤
│ CALCULATION TRAIL                       │
│                                         │
│ Gross floor area           12.00 sq.m.  │
│ − Exclusions                0.00 sq.m.  │
│ ────────────────────────────────────    │
│ Net floor area             12.00 sq.m.  │
│                                         │
│ Tile module (603 × 603mm)  0.3636 sq.m. │
│ Raw tile count                    33.0  │
│ + Waste (8%)                      +2.6  │
│ + Spare (0%)                      +0.0  │
│ ────────────────────────────────────    │
│ Adjusted count                    35.6  │
│                                         │
│ [BUY QUANTITY — highlighted row]        │
│ ┌─────────────────────────────────────┐ │
│ │ Tiles to buy:              36 pcs   │ │
│ │ Boxes to buy:               3 boxes │ │
│ │ (@ 4.0 sq.m./box)                  │ │
│ └─────────────────────────────────────┘ │
├─────────────────────────────────────────┤
│ [▸ Assumptions] (accordion, collapsed)  │
│   • Pattern: Straight (grid)            │
│   • Waste factor: 8% (pattern default)  │
│   • Grout joint: 3mm                    │
│   • Box coverage: 4.0 sq.m.            │
│   • Diagonal/herringbone preview is     │
│     approximate; tiles rendered axis-   │
│     aligned with adjusted waste %.      │
├─────────────────────────────────────────┤
│ [Export PDF ⬇] [Save 💾] (premium)      │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ 💡 This calculation is tested in    │ │
│ │    the ALE (Building Technology).   │ │
│ │    [Master it with SlateCamp →]     │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### 4.2 Result Trail Component Mapping

```ts
interface ResultRowProps {
  label: string
  value: string | number
  unit: string
  isDeduction?: boolean        // prefixed with "−", muted color
  isAddition?: boolean         // prefixed with "+", muted color
  isSummary?: boolean          // bold, separator above
  isHighlighted?: boolean      // buy quantity — accent background
  onHover?: () => void         // triggers 3D surface highlight (paint tool)
  onHoverEnd?: () => void
}
```

Each result row renders as:

```tsx
<div
  className={cn(
    'flex items-baseline justify-between py-1',
    isSummary && 'pt-2 mt-2 border-t border-border font-medium',
    isHighlighted && 'bg-primary/5 -mx-4 px-4 py-2 rounded-lg',
  )}
  onMouseEnter={onHover}
  onMouseLeave={onHoverEnd}
>
  <span className={cn(
    'font-sans text-xs',
    isDeduction && 'text-muted-foreground',
    isAddition && 'text-muted-foreground',
  )}>
    {isDeduction && '− '}{isAddition && '+ '}{label}
  </span>
  <span className="font-mono text-xs tabular-nums text-foreground">
    {typeof value === 'number' ? value.toFixed(2) : value} {unit}
  </span>
</div>
```

### 4.3 Result Mode Toggle

```tsx
// Shadcn Tabs component — not custom
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

<Tabs
  value={resultMode}
  onValueChange={(v) => onResultModeChange(v as 'net' | 'buy')}
>
  <TabsList className="w-full">
    <TabsTrigger value="net" className="flex-1 font-mono text-[10px] uppercase tracking-widest">
      Net quantity
    </TabsTrigger>
    <TabsTrigger value="buy" className="flex-1 font-mono text-[10px] uppercase tracking-widest">
      Buy quantity
    </TabsTrigger>
  </TabsList>
</Tabs>
```

**Behavioral difference:**

| Mode | What changes | What stays |
|---|---|---|
| Net | Buy quantity row hidden; summary shows adjusted count without rounding | Full trail visible |
| Buy | Buy quantity row highlighted with accent background; box count shown | Full trail visible |

### 4.4 Assumptions Accordion

```tsx
// Shadcn Accordion — single collapsible item
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

<Accordion type="single" collapsible>
  <AccordionItem value="assumptions">
    <AccordionTrigger className="font-mono text-[9px] font-medium uppercase tracking-widest text-muted-foreground py-2">
      Assumptions
    </AccordionTrigger>
    <AccordionContent>
      <ul className="space-y-1">
        {computed.assumptions.map((a, i) => (
          <li key={i} className="font-sans text-xs text-muted-foreground leading-relaxed">
            {a}
          </li>
        ))}
      </ul>
    </AccordionContent>
  </AccordionItem>
</Accordion>
```

---

## 5. Tool-Specific Input Panel Specifications

### 5.1 Flooring Input Panel — Field Sequence

Fields are ordered by cognitive flow: define the room → define the tile → define the pattern → adjust waste.

| # | Field group | Fields | Component type | Conditional |
|---|---|---|---|---|
| 1 | Room mode | `roomMode` toggle | Shadcn `<Tabs>` (rectangle / L-shape) | Always |
| 2 | Room dimensions | `roomLengthMm`, `roomWidthMm` | Number inputs with mm unit | If rectangle |
| 3 | Polygon points | `floorPolygonPoints` | Disabled input with "Premium" badge | If polygon (gated) |
| 4 | Exclusions | `exclusions` list | Repeater: add/remove exclusion rows | Always (max 2 free) |
| 5 | Separator | "TILE CONFIGURATION" | DM Mono eyebrow + divider | Always |
| 6 | Tile size presets | PH presets row | Button group (ghost variant) | Always |
| 7 | Custom tile size | `tileLengthMm`, `tileWidthMm` | Number inputs | Always |
| 8 | Grout joint | `groutJointMm` | Number input, default 3 | Always |
| 9 | Separator | "PATTERN & WASTE" | DM Mono eyebrow + divider | Always |
| 10 | Pattern selector | `pattern` | 2×2 button grid with SVG icons | Always |
| 11 | Waste % | `wastePercent` | Number input, auto-set by pattern, editable | Always |
| 12 | Spare % | `includeSparePercent` | Number input, default 0 | Always |
| 13 | Separator | "PROCUREMENT" | DM Mono eyebrow + divider | Always |
| 14 | Box coverage | `boxCoverageSqm` | Number input | Always |

### 5.2 Paint Input Panel — Field Sequence

| # | Field group | Fields | Component type | Conditional |
|---|---|---|---|---|
| 1 | Input mode | `inputMode` toggle | Shadcn `<Tabs>` (room / wall-by-wall) | Always |
| 2 | Room dimensions | `roomLengthMm`, `roomWidthMm`, `wallHeightMm` | Number inputs | If room mode |
| 3 | Wall segments | `wallSegments` repeater | Repeater: each wall length + height | If wall-by-wall (premium) |
| 4 | Openings | `openings` list | Repeater: type (door/window) + width + height | Always (max 2 free) |
| 5 | Ceiling | `includeCeiling` toggle | Shadcn `<Switch>` | Always |
| 6 | Separator | "PAINT PRODUCT" | DM Mono eyebrow + divider | Always |
| 7 | Substrate type | `substrateType` | Shadcn `<Select>` dropdown | Always |
| 8 | Topcoat coats | `coatsTopcoat` | Number input, stepper (1–3) | Always |
| 9 | Primer coats | `coatsPrimer` | Number input, stepper (0–2) | Always |
| 10 | Topcoat coverage | `topcoatCoverageSqmPerLiter` | Number input | Always |
| 11 | Primer coverage | `primerCoverageSqmPerLiter` | Number input | If `coatsPrimer > 0` |
| 12 | Color picker | `selectedColorHex` | Simplified swatch grid (sponsor palette or 12 defaults) | Always |
| 13 | Separator | "WASTE & CANS" | DM Mono eyebrow + divider | Always |
| 14 | Waste % | `wastePercent` | Number input, default 10% | Always |
| 15 | Can sizes | `canSizesAvailable` | Checkbox group (1L, 4L, 16L) | If sponsor provides |

**Color swatch component:**

```tsx
<div className="grid grid-cols-6 gap-1.5">
  {colors.map((hex) => (
    <button
      key={hex}
      onClick={() => setInput('selectedColorHex', hex)}
      className={cn(
        'w-8 h-8 rounded-md border-2 transition-all',
        selected === hex ? 'border-foreground scale-110' : 'border-transparent'
      )}
      style={{ backgroundColor: hex }}
      aria-label={`Select color ${hex}`}
    />
  ))}
</div>
```

### 5.3 Drywall Input Panel — Field Sequence

| # | Field group | Fields | Component type | Conditional |
|---|---|---|---|---|
| 1 | Wall dimensions | `wallLengthMm`, `wallHeightMm` | Number inputs | Always |
| 2 | Openings | `openings` repeater | Type (door/window/pass-through) + width + height + xOffset + yOffset | Always (max 2 free) |
| 3 | Separator | "FRAMING" | DM Mono eyebrow + divider | Always |
| 4 | Stud spacing | `studSpacingMm` | Shadcn `<Tabs>` (400 / 600) | Always |
| 5 | Corner stud allowance | `includeCornerStudAllowance` | Shadcn `<Switch>` | Always |
| 6 | Corner extra count | `cornerStudExtraCount` | Number input, stepper (0–4) | If corner allowance on |
| 7 | Opening framing | `includeOpeningFramingAllowance` | Shadcn `<Switch>` | Always |
| 8 | Extra studs per opening | `extraStudsPerOpening` | Number input, stepper (0–6) | If opening framing on |
| 9 | Separator | "BOARD" | DM Mono eyebrow + divider | Always |
| 10 | Board presets | PH board presets row | Button group | Always |
| 11 | Custom board size | `boardLengthMm`, `boardWidthMm` | Number inputs | Always |
| 12 | Board orientation | `boardOrientation` | Shadcn `<Tabs>` (vertical / horizontal) | Always |
| 13 | Sides boarded | `sidesBoarded` | Shadcn `<Tabs>` (one-side / two-side) | Always |
| 14 | Layers per side | `boardLayersPerSide` | Number input, stepper (1–2) | Always |
| 15 | Separator | "PROCUREMENT" | DM Mono eyebrow + divider | Always |
| 16 | Waste % | `wastePercent` | Number input, default 10% | Always |
| 17 | Track stock length | `trackStockLengthMm` | Number input, default 3000 | Always |

**Drywall-specific: View mode toggle** (above canvas, not in input panel):

```tsx
// DOM overlay positioned above the canvas
<div className="flex items-center gap-2 absolute top-3 right-3 z-10">
  <Tabs value={drywallViewMode} onValueChange={toggleDrywallView}>
    <TabsList className="h-7">
      <TabsTrigger value="frame" className="text-[10px] px-2 h-6 font-mono uppercase">
        Frame
      </TabsTrigger>
      <TabsTrigger value="boarded" className="text-[10px] px-2 h-6 font-mono uppercase">
        Boarded
      </TabsTrigger>
    </TabsList>
  </Tabs>
</div>
```

---

## 6. Sponsor Card Component

The sponsor card sits below the input fields, never inside the calculation trail. It must feel informational, not promotional.

```
┌─────────────────────────────────┐
│ POWERED BY                      │ ← DM Mono eyebrow
│ ┌────┐                          │
│ │logo│ Mariwasa Porcelain       │ ← Brand name, Inter medium
│ └────┘                          │
│ 60×60 Grand Palisade            │ ← Product name, Inter regular
│ Coverage: 4.0 sq.m./box         │ ← DM Mono stat
│                                 │
│ [View products →]               │ ← Link style, opens sponsor URL
└─────────────────────────────────┘
```

```ts
interface SponsorCardProps {
  brandName: string
  brandLogoUrl: string
  productName: string
  productSpecs: Record<string, string>   // key-value pairs shown as DM Mono stats
  externalUrl: string
  toolType: 'flooring' | 'paint' | 'drywall'
}
```

Component mapping:

| Element | Typography | Class |
|---|---|---|
| "POWERED BY" eyebrow | DM Mono | `font-mono text-[8px] uppercase tracking-widest text-muted-foreground` |
| Brand name | Inter medium | `font-sans font-medium text-sm` |
| Product name | Inter regular | `font-sans text-xs text-muted-foreground` |
| Spec values | DM Mono | `font-mono text-xs tabular-nums` |
| "View products →" | Inter regular | `text-primary hover:underline font-sans text-xs` |

Card variant: default white card with subtle border.

```tsx
<div className="bg-card border border-border rounded-xl p-3 mt-4">
```

---

## 7. Freemium Gate Implementation

### 7.1 Gate Triggers

| Feature | Free limit | Premium unlocks | Gate component |
|---|---|---|---|
| Room mode | Rectangle only | Polygon / L-shape | Disabled tab with lock icon + "Pro" badge |
| Openings count | Max 2 | Unlimited | "Add opening" button disabled after 2 with inline upgrade nudge |
| Wall-by-wall mode (paint) | Unavailable | Full access | Disabled tab with lock icon |
| Export to PDF | Unavailable | Full access | Button shows lock icon, opens email capture modal |
| Save project | Unavailable | Full access | Button shows lock icon, opens auth modal |
| Compare scenarios | Unavailable | Full access | Not rendered in V1 |

### 7.2 Gate UI Pattern — Inline Nudge (Not Modal)

Premium gates use an inline nudge, not a disruptive modal. The gate communicates value, not restriction.

```tsx
// Inline premium nudge — appears where the gated feature would be
<div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 border border-dashed border-border">
  <LockIcon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
  <p className="font-sans text-xs text-muted-foreground leading-relaxed">
    L-shape rooms available with{' '}
    <a href="/pro" className="text-primary hover:underline font-medium">
      SlateCamp Pro
    </a>
  </p>
</div>
```

### 7.3 Export PDF Gate — Email Capture Flow

The PDF export button is the highest-value email capture point in the funnel.

**Flow:**

1. User clicks "Export PDF" button.
2. If not logged in: email capture modal renders.
3. Modal collects email only (no password, no full signup).
4. On submit: server action creates a lead record in Supabase, generates PDF, returns download link.
5. User receives PDF immediately + enters nurture email sequence.

```
┌────────────────────────────────────────┐
│ Export your estimate as PDF             │
│                                        │
│ Enter your email to receive your       │
│ formatted bill of quantities.          │
│                                        │
│ [email@example.com          ]          │
│                                        │
│ [Download PDF ⬇] ← Primary button     │
│                                        │
│ By continuing, you agree to receive    │
│ occasional product updates. Unsubscribe│
│ anytime.                               │
│                                        │
│ Already have SlateCamp Pro? [Log in]   │
└────────────────────────────────────────┘
```

Component: Shadcn `<Dialog>` (modal). Primary button is `bg-primary text-primary-foreground`. Email input follows the standard field pattern (label above, 48px height).

---

## 8. ALE Exam Funnel CTA

The ALE CTA appears at the bottom of the result panel in every calculator. It must not feel like an ad. It feels like a coach observing: "Hey — this is testable."

```tsx
<div className="border border-border border-l-[3px] border-l-camp-orange rounded-r-xl p-3 mt-4">
  <p className="font-mono text-[9px] font-medium uppercase tracking-widest text-camp-orange mb-1">
    ALE connection
  </p>
  <p className="font-sans text-xs text-foreground leading-relaxed mb-2">
    Material estimation is tested in the ALE — Building Technology & Utilities
    and the ADSP design scenarios.
  </p>
  <a
    href="/pro"
    className="font-sans text-xs text-primary hover:underline font-medium"
  >
    Master it with SlateCamp →
  </a>
</div>
```

Card variant: left-border accent card with Camp Orange accent.

---

## 9. Estimation Disclaimer

Renders at the page bottom, below all three panels. Always visible. Not dismissible.

```tsx
<div className="border-t border-border px-4 py-3 bg-muted/30">
  <p className="font-mono text-[9px] text-muted-foreground leading-relaxed max-w-prose">
    Preliminary estimation for budgeting purposes. Not a final bill of quantities
    or code-certified documentation. Actual material requirements may vary based on
    site conditions, material availability, and installation method.
  </p>
</div>
```

---

## 10. Hover-to-Highlight Interaction (Paint Tool)

The paint tool has a unique interaction: hovering a result row highlights the corresponding 3D surface. This bridges the DOM result panel and the R3F canvas via Zustand.

### 10.1 Data Flow

```
DOM Result Row (onMouseEnter)
  → usePaintStore.getState().setHoveredSurface('north')
    → Zustand store updates hoveredSurface
      → WallSurface component reads hoveredSurface via selector
        → Swaps material to wallPaintableHover (emissive highlight)
          → SceneInvalidator detects inputVersion change, calls invalidate()
            → Canvas renders one frame with highlight visible
```

### 10.2 Result Row Enhancement (Paint Only)

```tsx
// Paint result rows include hover handlers
<ResultRow
  label="North wall"
  value={computed.wallAreas[0].netSqm}
  unit="sq.m."
  onHover={() => store.setHoveredSurface('north')}
  onHoverEnd={() => store.setHoveredSurface(null)}
/>
```

On mobile: hover is not available. Tap on a result row toggles the highlight. Tap again (or tap another row) to clear.

---

## 11. Repeater Component — Openings & Exclusions

Multiple tools need a repeater pattern for openings (paint, drywall) and exclusions (flooring). One shared component.

```ts
interface RepeaterFieldProps<T> {
  items: T[]
  onAdd: () => void
  onRemove: (id: string) => void
  onChange: (id: string, field: keyof T, value: T[keyof T]) => void
  maxFree: number                // freemium gate — max items before lock
  renderItem: (item: T, index: number) => React.ReactNode
  addLabel: string               // "Add opening", "Add exclusion"
  emptyLabel: string             // "No openings added"
}
```

Visual structure per item:

```
┌────────────────────────────────────────┐
│ [Type dropdown]  [Width input] [Height]│
│                              [✕ remove]│
└────────────────────────────────────────┘
```

After hitting `maxFree`, the "Add" button renders the inline premium nudge described in Section 7.2.

---

## 12. Loading & Error States

### 12.1 Loading States

The calculator is entirely client-side computed (no server round-trip for estimation). Therefore, there are no loading spinners for calculation results. Results update synchronously in the Zustand store on every input change.

The only loading state is the initial page load:

| Component | Loading state | Component |
|---|---|---|
| Input panel | Skeleton: 6 gray bars at input field height | `<InputPanelSkeleton>` |
| Canvas | Cream background, no content | `<div className="bg-cream animate-pulse" />` |
| Result panel | Skeleton: 8 gray bars at result row height | `<ResultPanelSkeleton>` |
| Sponsor card | Skeleton: logo placeholder + 3 text lines | `<SponsorCardSkeleton>` |

### 12.2 Error States

| Error | Trigger | UI response |
|---|---|---|
| Invalid dimension (0 or negative) | User enters 0 or -1 | Input border turns `border-destructive`, message below: "Enter a positive value" |
| Exclusion larger than room | Exclusion area ≥ gross area | Toast notification: "Exclusion area exceeds room area" + exclusion row highlighted |
| Canvas WebGL failure | GPU not available or context lost | Canvas panel shows fallback: "3D preview unavailable on this device. Your calculation results are still accurate." with result panel still functional |
| Sponsor data fetch failure | API error | Sponsor card hidden; inputs use built-in defaults. No error surfaced to user. |

### 12.3 WebGL Fallback

```tsx
<Canvas
  onCreated={(state) => {
    state.gl.setClearColor('#F2F0EB')
  }}
  // If Canvas fails to mount, ErrorBoundary catches
>
  ...
</Canvas>

// Wrap in ErrorBoundary
<ErrorBoundary fallback={<CanvasWebGLFallback />}>
  <CalculatorCanvasShell>
    <ToolScene />
  </CalculatorCanvasShell>
</ErrorBoundary>
```

The fallback renders a static 2D SVG diagram of the room with dimensions labeled. The calculator remains fully functional without 3D — results are computed from Zustand, not from the canvas.

---

## 13. Responsive Breakpoint Behavior

| Breakpoint | Layout | Canvas behavior | Input panel | Result panel |
|---|---|---|---|---|
| <640px (phone) | Single column | Full width, 56vw height, touch controls | Collapsible accordion (auto-collapse after first input) | Below canvas, full width |
| 640–1023px (tablet) | Single column with wider padding | Full width, 400px height | Collapsible accordion | Below canvas |
| ≥1024px (desktop) | Three-column grid | Flexible center column, min 500px height | Fixed 320px sidebar, scrollable | Fixed 340px sidebar, scrollable |

### Mobile Input Accordion Behavior

On mobile, the input panel starts expanded. After the user enters the first two required fields (room dimensions), the accordion auto-collapses to maximize canvas visibility. User can re-expand at any time.

```tsx
const [inputsExpanded, setInputsExpanded] = useState(true)
const hasDimensions = useToolStore((s) => s.roomLengthMm > 0 && s.roomWidthMm > 0)

// Auto-collapse after dimensions entered
useEffect(() => {
  if (hasDimensions && inputsExpanded) {
    const timer = setTimeout(() => setInputsExpanded(false), 800)
    return () => clearTimeout(timer)
  }
}, [hasDimensions])
```

---

## 14. Accessibility Requirements

| Requirement | Implementation |
|---|---|
| Keyboard navigation | All inputs, toggles, and buttons are focusable via Tab. Pattern selector and tile presets use arrow keys within group. |
| Screen reader labels | Every input has an explicit `<label>` with `htmlFor`. Unit badges use `aria-label`. Result rows use `aria-live="polite"` for real-time updates. |
| Color contrast | All text meets WCAG AA (4.5:1 body, 3:1 large text). Tile cut highlighting uses both color AND position (edge location) — never color alone. |
| Touch targets | All interactive elements ≥44×44px on mobile (enforced by `h-10` minimum on inputs, `p-2` minimum on buttons). |
| Reduced motion | Canvas orbit damping respects `prefers-reduced-motion`. No decorative animations in the DOM. |
| Canvas accessibility | 3D canvas is `role="img"` with `aria-label` describing the current state (e.g., "3D preview of 4m × 3m room with 60×60mm tiles in straight pattern"). |

---

## 15. State Initialization & URL Parameter Support

### 15.1 Sponsor Preset Loading

```
/calculators/flooring?sponsor=mariwasa&sku=60x60-porcelain
```

On page load, the route handler reads URL params and looks up sponsor data from a static JSON file (V1) or Supabase table (V2). If found, sponsor defaults are applied to the Zustand store before the first render.

```tsx
// In the page Server Component
const sponsorSlug = searchParams.sponsor
const sponsorSku = searchParams.sku
const sponsorData = sponsorSlug ? await loadSponsorPreset(sponsorSlug, sponsorSku) : null

// Passed to the client component
<FlooringCalculator initialSponsorData={sponsorData} />
```

### 15.2 Shared Link Support

```
/calculators/flooring?l=4000&w=3000&tile=600x600&pattern=brick
```

Pre-fills room dimensions and tile configuration from URL params. The Zustand store initializes with these values if present.

### 15.3 Store Initialization Pattern

```tsx
// Inside the client component's mount effect
useEffect(() => {
  if (initialSponsorData) {
    store.setInput('tileLengthMm', initialSponsorData.tileSizeMm[0])
    store.setInput('tileWidthMm', initialSponsorData.tileSizeMm[1])
    store.setInput('boxCoverageSqm', initialSponsorData.boxCoverageSqm)
    store.setInput('wastePercent', initialSponsorData.recommendedWastePercent)
  }
  if (urlParams.l) store.setInput('roomLengthMm', Number(urlParams.l))
  if (urlParams.w) store.setInput('roomWidthMm', Number(urlParams.w))
  store.recompute()
}, []) // Once on mount only
```

---

## 16. File Structure — UI Components

```
src/
├── app/
│   └── calculators/
│       ├── page.tsx                          // Suite index (Server Component)
│       ├── layout.tsx                        // Shared calculator layout shell
│       ├── flooring/
│       │   └── page.tsx                      // Flooring tool page
│       ├── paint/
│       │   └── page.tsx                      // Paint tool page
│       └── drywall/
│           └── page.tsx                      // Drywall tool page
│
├── components/
│   └── calculators/
│       ├── shared/
│       │   ├── CalculatorLayout.tsx           // Three-panel grid wrapper
│       │   ├── InputPanel.tsx                 // Scrollable input container
│       │   ├── InputPanelMobile.tsx           // Accordion wrapper for mobile
│       │   ├── CanvasPanel.tsx                // Canvas mount wrapper + empty state
│       │   ├── CanvasEmptyState.tsx           // Pre-input ghost placeholder
│       │   ├── CanvasWebGLFallback.tsx        // GPU failure fallback
│       │   ├── ResultPanel.tsx                // Result container + mode toggle
│       │   ├── ResultRow.tsx                  // Single result line
│       │   ├── ResultTrail.tsx                // Full gross → net → buy trail
│       │   ├── AssumptionsAccordion.tsx        // Shadcn Accordion wrapper
│       │   ├── SponsorCard.tsx                // Sponsor branding below inputs
│       │   ├── SponsorCardSkeleton.tsx
│       │   ├── AleFunnelCta.tsx               // ALE exam connection card
│       │   ├── EstimationDisclaimer.tsx        // Footer disclaimer
│       │   ├── RepeaterField.tsx              // Generic add/remove list
│       │   ├── ExportPdfButton.tsx            // Gated export with email modal
│       │   ├── SaveProjectButton.tsx          // Gated save with auth modal
│       │   ├── PremiumNudge.tsx               // Inline lock + upgrade link
│       │   ├── UnitToggle.tsx                 // Metric / Imperial toggle
│       │   ├── InputGroupSeparator.tsx        // DM Mono eyebrow + divider
│       │   └── skeletons/
│       │       ├── InputPanelSkeleton.tsx
│       │       └── ResultPanelSkeleton.tsx
│       │
│       ├── flooring/
│       │   ├── FlooringCalculator.tsx         // 'use client' — orchestrator
│       │   ├── FlooringInputPanel.tsx         // Tool-specific input fields
│       │   ├── FlooringResultTrail.tsx        // Tool-specific result mapping
│       │   ├── TilePresetSelector.tsx         // PH tile size buttons
│       │   ├── PatternSelector.tsx            // 2×2 pattern grid
│       │   └── PatternIcon.tsx                // SVG icons per pattern
│       │
│       ├── paint/
│       │   ├── PaintCalculator.tsx            // 'use client' — orchestrator
│       │   ├── PaintInputPanel.tsx            // Tool-specific input fields
│       │   ├── PaintResultTrail.tsx           // Tool-specific result mapping
│       │   ├── ColorSwatchPicker.tsx          // Color grid
│       │   ├── SubstrateSelector.tsx          // Substrate dropdown
│       │   └── CoatStepper.tsx                // ±1 stepper for coat count
│       │
│       └── drywall/
│           ├── DrywallCalculator.tsx          // 'use client' — orchestrator
│           ├── DrywallInputPanel.tsx          // Tool-specific input fields
│           ├── DrywallResultTrail.tsx         // Tool-specific result mapping
│           ├── BoardPresetSelector.tsx        // PH board type buttons
│           ├── StudSpacingSelector.tsx        // 400/600 toggle
│           └── ViewModeToggle.tsx             // Frame / Boarded overlay toggle
│
├── lib/
│   ├── sponsor-presets/
│   │   ├── load-sponsor.ts                   // Sponsor data loader
│   │   └── presets/                           // Static JSON presets per sponsor
│   │       ├── mariwasa.json
│   │       ├── boysen.json
│   │       └── hardiflex.json
│   └── actions/
│       ├── export-pdf.ts                      // Server Action — generate PDF BOQ
│       └── capture-email.ts                   // Server Action — lead capture
│
└── types/
    └── calculators.ts                         // All calculator TypeScript interfaces
```

---

## 17. Performance Contracts — DOM Side

| Metric | Target | Enforcement |
|---|---|---|
| Initial page load (LCP) | <2.5s on 4G | No client-side sponsor data fetch on critical path; preload via Server Component |
| Input-to-result latency | <16ms (synchronous Zustand recompute) | No async operations in computation pipeline |
| Input-to-3D-update latency | <33ms (one `invalidate()` frame) | `SceneInvalidator` pattern from canvas spec |
| DOM nodes in result panel | <100 nodes | Flat list of `<ResultRow>`, no nested structures |
| Re-renders per input change | ≤5 React components | Granular Zustand selectors; only the changed input field + affected result rows + SceneInvalidator |
| Bundle size for calculator page | <150KB JS (gzipped, excluding Three.js) | Three.js loaded async via dynamic import; calculator logic is pure TS |
| Canvas mount time | <500ms after dimensions entered | Canvas is dynamically imported; not in initial bundle |

### Dynamic Import Strategy

```tsx
// CanvasPanel.tsx — lazy load the entire 3D system
const CalculatorCanvasShell = dynamic(
  () => import('@/components/calculators/shared/CalculatorCanvasShell'),
  {
    ssr: false,
    loading: () => <CanvasLoadingPlaceholder />,
  }
)
```

Three.js and R3F are only loaded when the user enters valid dimensions. Users who bounce before entering dimensions never download the 3D bundle.

---

## 18. Implementation Checklist

### Shared Components (Build first)

- [ ] `CalculatorLayout` — three-panel grid with responsive breakpoints
- [ ] `InputPanel` / `InputPanelMobile` — scrollable container + accordion
- [ ] `CanvasPanel` — conditional Canvas mount + empty state + WebGL fallback
- [ ] `ResultPanel` — mode toggle + result trail container
- [ ] `ResultRow` — single calculation line with hover support
- [ ] `ResultTrail` — gross → deductions → net → waste → buy sequence
- [ ] `AssumptionsAccordion` — Shadcn Accordion with assumptions list
- [ ] `SponsorCard` — brand card below inputs
- [ ] `AleFunnelCta` — ALE connection card with Camp Orange accent
- [ ] `EstimationDisclaimer` — footer disclaimer
- [ ] `RepeaterField` — add/remove list for openings and exclusions
- [ ] `PremiumNudge` — inline lock + upgrade nudge
- [ ] `ExportPdfButton` — gated button + email capture modal
- [ ] `InputGroupSeparator` — DM Mono eyebrow + divider
- [ ] Skeleton components for all panels

### Flooring Tool

- [ ] `FlooringCalculator` orchestrator with Zustand store connection
- [ ] `FlooringInputPanel` with all 14 field groups in correct sequence
- [ ] `TilePresetSelector` with PH presets
- [ ] `PatternSelector` with SVG icons and auto-waste logic
- [ ] `FlooringResultTrail` mapping computed values to result rows
- [ ] Sponsor preset loading via URL params
- [ ] Freemium gates: polygon mode disabled, max 2 exclusions
- [ ] Mobile accordion auto-collapse after dimensions entered

### Paint Tool

- [ ] `PaintCalculator` orchestrator with Zustand store connection
- [ ] `PaintInputPanel` with all 15 field groups
- [ ] `ColorSwatchPicker` with sponsor palette support
- [ ] `SubstrateSelector` with PH coating system descriptions
- [ ] `CoatStepper` with ±1 increment
- [ ] `PaintResultTrail` with per-wall breakdown and hover highlighting
- [ ] Hover-to-highlight integration: result row → Zustand → 3D material swap
- [ ] Can count optimization display
- [ ] Freemium gates: wall-by-wall mode disabled, max 2 openings

### Drywall Tool

- [ ] `DrywallCalculator` orchestrator with Zustand store connection
- [ ] `DrywallInputPanel` with all 17 field groups
- [ ] `BoardPresetSelector` with PH board type presets
- [ ] `StudSpacingSelector` (400/600 toggle)
- [ ] `ViewModeToggle` overlay on canvas (frame / boarded)
- [ ] `DrywallResultTrail` with board count, stud count, and track breakdown
- [ ] Freemium gates: max 2 openings
- [ ] Result trail includes separate sections for boards, studs, and tracks

---

*This document is the UX/UI implementation specification for all Phase 1 Calculator Suite interfaces. It references and must remain consistent with `3d-calculator-suite-final.md` (product spec), `phase1-3d-canvas-spec.md` (3D canvas architecture), and `3d-calculator-business-strategy.md` (revenue model). All visual decisions conform to the SlateCamp Design System Engineering Guide (Rams Standard).*
