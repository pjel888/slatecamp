# Design System Overhaul: GitHub Primer × Apple HIG Hybrid

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the visual language of all SlateCamp `/dashboard` route components from flat/utilitarian to a premium GitHub Primer × Apple HIG hybrid — surface aesthetics only, no layout changes.

**Architecture:** Four cascading phases: (1) CSS token foundation, (2) Shadcn base components, (3) RichInfoPopover + shared UI, (4) all dashboard and analytics page components. Changes cascade from tokens down, ensuring consistency.

**Tech Stack:** Next.js App Router, Tailwind CSS v4 (CSS-first), Shadcn UI, Recharts, TypeScript

**Design Rules (non-negotiable):**
- `rounded-md` (6px) everywhere — never `rounded-sm` on cards/buttons/inputs
- `border-border` or `border-[#d0d7de]` — never hardcoded `border-zinc-200`
- `shadow-none` → gone. Cards at rest: borderless shadow. Overlays/popovers: `shadow-lg`
- Blue ONLY for: primary CTAs, active states, focus rings, links, chart accents
- Min text: `text-[11px]` for labels, `text-xs`/12px for small, `text-sm`/14px for body
- NO layout changes: no `grid-cols-*`, `col-span-*`, `gap-*`, `flex-*`, `h-[*]` changes

---

## Chunk 1: Foundation (globals.css + base UI components)

### Task 1: Update CSS Tokens in globals.css

**Files:**
- Modify: `src/app/globals.css`

**What changes:**
- `@theme inline`: override `--radius-md` to `0.375rem` (6px) and `--radius-lg` to `0.5rem` (8px) with explicit values
- `:root`: update `--border: #e5e5ea` → `#d0d7de` (GitHub border-default)
- `:root`: update `--muted: #f5f5f7` → `#f6f8fa` (GitHub bgColor-muted)
- `:root`: update `--radius: 0.75rem` → `0.5rem` (ensures rounded-lg = 8px, consistent with Apple HIG)
- `:root`: update `--card-border-color` to use `#d0d7de` for visible 1px borders
- `.dark`: update `--muted: #2c2c2e` → keep (dark mode muted is fine)

- [ ] **Step 1: Read globals.css** to confirm current values before editing
  ```bash
  # Verified: --radius: 0.75rem, --border: #e5e5ea, --muted: #f5f5f7
  ```

- [ ] **Step 2: Update `--radius` in `:root`**

  In `src/app/globals.css`, change:
  ```css
  --radius: 0.75rem;
  ```
  To:
  ```css
  --radius: 0.5rem;
  ```

- [ ] **Step 3: Update `--border` in `:root`**

  Change:
  ```css
  --border: #e5e5ea;
  ```
  To:
  ```css
  --border: #d0d7de;
  ```

- [ ] **Step 4: Update `--muted` in `:root`**

  Change:
  ```css
  --muted: #f5f5f7;
  ```
  To:
  ```css
  --muted: #f6f8fa;
  ```

- [ ] **Step 5: Update `--card-border-color` in `:root`**

  Change:
  ```css
  --card-border-color: rgba(0, 0, 0, 0.04);
  ```
  To:
  ```css
  --card-border-color: #d0d7de;
  ```

- [ ] **Step 6: Override radius variants in `@theme inline` for precise 6px/8px control**

  In the `@theme inline` block, change the radius calc lines:
  ```css
  --radius-sm: calc(var(--radius) * 0.6);
  --radius-md: calc(var(--radius) * 0.8);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) * 1.4);
  --radius-2xl: calc(var(--radius) * 1.8);
  --radius-3xl: calc(var(--radius) * 2.2);
  --radius-4xl: calc(var(--radius) * 2.6);
  ```
  To:
  ```css
  --radius-sm: 0.25rem;   /* 4px */
  --radius-md: 0.375rem;  /* 6px — GitHub Primer default */
  --radius-lg: 0.5rem;    /* 8px — large containers */
  --radius-xl: 0.75rem;   /* 12px — modals/overlays */
  --radius-2xl: 1rem;     /* 16px */
  --radius-3xl: 1.25rem;  /* 20px */
  --radius-4xl: 1.5rem;   /* 24px */
  ```

- [ ] **Step 7: Commit**
  ```bash
  git add src/app/globals.css
  git commit -m "design: update CSS tokens — radius 6px/8px, GitHub border #d0d7de, muted #f6f8fa"
  ```

---

### Task 2: Update card.tsx Base Component

**Files:**
- Modify: `src/components/ui/card.tsx`

**What changes:**
- `Card`: `rounded-sm` → `rounded-md`; `border-border/40` → `border-border`; add `shadow-[0_1px_0_rgba(31,35,40,0.04)]`
- `CardHeader`: `rounded-t-xl` → `rounded-t-md` (consistent radius)
- `CardFooter`: `rounded-b-xl` → `rounded-b-md`

- [ ] **Step 1: Update Card component**

  In `src/components/ui/card.tsx`, change the Card className:
  ```tsx
  // FROM:
  'group/card flex flex-col gap-4 overflow-hidden rounded-sm border border-border/40 bg-card py-4 text-sm text-card-foreground shadow-xs has-data-[slot=card-footer]:pb-0 has-[>img:first-child]:pt-0 data-[size=sm]:gap-3 data-[size=sm]:py-3 data-[size=sm]:has-data-[slot=card-footer]:pb-0 *:[img:first-child]:rounded-t-sm *:[img:last-child]:rounded-b-sm z-1'
  // TO:
  'group/card flex flex-col gap-4 overflow-hidden rounded-md border border-border bg-card py-4 text-sm text-card-foreground shadow-[0_1px_0_rgba(31,35,40,0.04)] has-data-[slot=card-footer]:pb-0 has-[>img:first-child]:pt-0 data-[size=sm]:gap-3 data-[size=sm]:py-3 data-[size=sm]:has-data-[slot=card-footer]:pb-0 *:[img:first-child]:rounded-t-md *:[img:last-child]:rounded-b-md z-1'
  ```

- [ ] **Step 2: Update CardHeader radius**

  Change `rounded-t-xl` → `rounded-t-md`:
  ```tsx
  // FROM:
  'group/card-header @container/card-header grid auto-rows-min items-start gap-1 rounded-t-xl px-4 ...'
  // TO:
  'group/card-header @container/card-header grid auto-rows-min items-start gap-1 rounded-t-md px-4 ...'
  ```

- [ ] **Step 3: Update CardFooter radius**

  Change `rounded-b-xl` → `rounded-b-md`:
  ```tsx
  // FROM:
  'flex items-center rounded-b-xl border-t bg-muted/50 p-4 ...'
  // TO:
  'flex items-center rounded-b-md border-t bg-muted/50 p-4 ...'
  ```

- [ ] **Step 4: Commit**
  ```bash
  git add src/components/ui/card.tsx
  git commit -m "design: card — rounded-md, visible border-border, ultra-subtle rest shadow"
  ```

---

### Task 3: Update button.tsx Base Component

**Files:**
- Modify: `src/components/ui/button.tsx`

**What changes:**
- Base variant: `rounded-sm` → `rounded-md`
- Primary variant hover: add `hover:bg-primary/90` for GitHub-style confidence
- Focus ring: already `ring-ring/50` — fine

- [ ] **Step 1: Update base button class**

  In `src/components/ui/button.tsx`, in the `cva` base string:
  ```tsx
  // FROM:
  "group/button inline-flex shrink-0 items-center justify-center rounded-sm border ..."
  // TO:
  "group/button inline-flex shrink-0 items-center justify-center rounded-md border ..."
  ```

- [ ] **Step 2: Commit**
  ```bash
  git add src/components/ui/button.tsx
  git commit -m "design: button — rounded-md base radius"
  ```

---

### Task 4: Update RichInfoPopover

**Files:**
- Modify: `src/components/dashboard/RichInfoPopover.tsx`

**What changes:**
- `PopoverContent`: `rounded-sm` → `rounded-md`; `border-zinc-200` → `border-border`; `shadow-xl` → `shadow-lg`

- [ ] **Step 1: Update PopoverContent styling**

  In `src/components/dashboard/RichInfoPopover.tsx`:
  ```tsx
  // FROM:
  <PopoverContent side="top" align="end" className="w-72 p-0 rounded-sm border-zinc-200 shadow-xl overflow-hidden">
  // TO:
  <PopoverContent side="top" align="end" className="w-72 p-0 rounded-md border-border shadow-lg overflow-hidden">
  ```

- [ ] **Step 2: Update media placeholder border**

  ```tsx
  // FROM:
  <div className="w-full h-32 bg-zinc-100 flex items-center justify-center border-b border-zinc-100">
  // TO:
  <div className="w-full h-32 bg-muted flex items-center justify-center border-b border-border">
  ```

- [ ] **Step 3: Commit**
  ```bash
  git add src/components/dashboard/RichInfoPopover.tsx
  git commit -m "design: RichInfoPopover — rounded-md, border-border, shadow-lg"
  ```

---

## Chunk 2: Dashboard Page Components

### Task 5: CompetenceSignalCard

**Files:**
- Modify: `src/components/dashboard/CompetenceSignalCard.tsx`

**What changes:**
- Card wrappers: `rounded-sm border-zinc-200` → `rounded-md border-border`
- Icon bg: `rounded-sm` → `rounded-md`
- Label text: `text-[10px]` → `text-xs`
- Skeleton: `rounded-sm` → `rounded-md`, `border-zinc-200` → `border-border`

- [ ] **Step 1: Update signal card wrapper**

  ```tsx
  // FROM (in map):
  className='bg-white rounded-sm border border-zinc-200 p-3 flex items-center gap-2.5'
  // TO:
  className='bg-white rounded-md border border-border p-3 flex items-center gap-2.5'
  ```

- [ ] **Step 2: Update icon background radius**

  ```tsx
  // FROM:
  <div className={`p-1.5 rounded-sm ${bg} shrink-0`}>
  // TO:
  <div className={`p-1.5 rounded-md ${bg} shrink-0`}>
  ```

- [ ] **Step 3: Update label text size**

  ```tsx
  // FROM:
  <p className='text-[10px] text-zinc-500 mt-0.5 leading-tight truncate'>{label}</p>
  // TO:
  <p className='text-xs text-zinc-500 mt-0.5 leading-tight truncate'>{label}</p>
  ```

- [ ] **Step 4: Update skeleton**

  ```tsx
  // FROM (skeleton wrapper):
  className='bg-white rounded-sm border border-zinc-200 p-3 flex items-center gap-2.5 animate-pulse'
  // TO:
  className='bg-white rounded-md border border-border p-3 flex items-center gap-2.5 animate-pulse'

  // FROM (skeleton icon):
  <div className='w-7 h-7 bg-zinc-100 rounded-sm shrink-0' />
  // TO:
  <div className='w-7 h-7 bg-zinc-100 rounded-md shrink-0' />
  ```

- [ ] **Step 5: Commit**
  ```bash
  git add src/components/dashboard/CompetenceSignalCard.tsx
  git commit -m "design: CompetenceSignalCard — rounded-md, border-border, text-xs labels"
  ```

---

### Task 6: DailyCatalystCard

**Files:**
- Modify: `src/components/dashboard/DailyCatalystCard.tsx`

**What changes:**
- Card wrapper: `rounded-sm border-blue-700` → `rounded-md border-blue-700` (this is a blue CTA card — keep blue border)
- Icon bg: `rounded-sm` → `rounded-md`
- CTA button: `rounded-sm` → `rounded-md`
- Small text: `text-[10px]` → `text-xs`
- Skeleton: `rounded-sm` → `rounded-md`

- [ ] **Step 1: Update card wrapper radius**

  ```tsx
  // FROM:
  <div className='bg-blue-600 rounded-sm border border-blue-700 p-5 flex flex-col gap-4 relative overflow-hidden group'>
  // TO:
  <div className='bg-blue-600 rounded-md border border-blue-700 p-5 flex flex-col gap-4 relative overflow-hidden group'>
  ```

- [ ] **Step 2: Update icon background radius**

  ```tsx
  // FROM:
  <div className='p-2 rounded-sm bg-blue-500/50 shrink-0 mt-0.5'>
  // TO:
  <div className='p-2 rounded-md bg-blue-500/50 shrink-0 mt-0.5'>
  ```

- [ ] **Step 3: Update label text size**

  ```tsx
  // FROM:
  <p className='text-blue-200 text-[10px] font-bold uppercase tracking-widest leading-none mb-1.5'>
  // TO:
  <p className='text-blue-200 text-xs font-bold uppercase tracking-widest leading-none mb-1.5'>
  ```

- [ ] **Step 4: Update progress bar text**

  ```tsx
  // FROM (both spans):
  <span className='text-[10px] font-medium text-blue-200'>
  <span className='text-[10px] font-bold text-blue-100'>
  // TO:
  <span className='text-xs font-medium text-blue-200'>
  <span className='text-xs font-bold text-blue-100'>
  ```

- [ ] **Step 5: Update CTA button radius**

  ```tsx
  // FROM:
  'flex items-center gap-2 bg-white text-blue-600 font-bold text-sm',
  'px-4 py-2 rounded-sm',
  // TO:
  'flex items-center gap-2 bg-white text-blue-600 font-bold text-sm',
  'px-4 py-2 rounded-md',
  ```

- [ ] **Step 6: Update skeleton radius**

  ```tsx
  // FROM:
  <div className='bg-blue-600/20 rounded-sm border border-blue-200 p-5 ...'>
  // all rounded-sm inside skeleton
  // TO: replace all rounded-sm with rounded-md
  ```

- [ ] **Step 7: Commit**
  ```bash
  git add src/components/dashboard/DailyCatalystCard.tsx
  git commit -m "design: DailyCatalystCard — rounded-md throughout, text-xs labels"
  ```

---

### Task 7: RecentActivityCard

**Files:**
- Modify: `src/components/dashboard/RecentActivityCard.tsx`

**What changes:**
- Card wrappers: `rounded-sm border-zinc-200` → `rounded-md border-border`
- Activity item hover: `rounded-sm` → `rounded-md`
- Icon bg: `rounded-sm` → `rounded-md`
- Label text: `text-[10px]` → `text-xs`
- Link text: `text-[10px]` → `text-xs`; `text-[11px]` → `text-[11px]` (keep — it's the CTA link, already ok)
- Activity title: `text-[12px]` → `text-xs` (12px = text-xs, same value)
- Activity subtitle: `text-[10px]` → `text-xs`
- Skeleton: `rounded-sm` → `rounded-md`, `border-zinc-200` → `border-border`

- [ ] **Step 1: Update empty state card wrapper**

  ```tsx
  // FROM:
  <div className='bg-white rounded-sm border border-zinc-200 p-4 flex flex-col justify-between h-full'>
  // TO:
  <div className='bg-white rounded-md border border-border p-4 flex flex-col justify-between h-full'>
  ```

- [ ] **Step 2: Update main card wrapper**

  ```tsx
  // FROM:
  <div className='bg-white rounded-sm border border-zinc-200 p-4 flex flex-col h-full'>
  // TO:
  <div className='bg-white rounded-md border border-border p-4 flex flex-col h-full'>
  ```

- [ ] **Step 3: Update label text sizes**

  ```tsx
  // FROM (activity label in both wrappers):
  <p className='text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3'>
  // TO:
  <p className='text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3'>
  ```

- [ ] **Step 4: Update activity item hover and icon radius**

  ```tsx
  // FROM:
  className='flex items-start gap-2.5 group hover:bg-zinc-50 -mx-1 px-1 py-1 rounded-sm transition-colors'
  // ...
  <div className='p-1.5 bg-zinc-100 rounded-sm shrink-0 group-hover:bg-zinc-200 transition-colors mt-0.5'>
  // TO:
  className='flex items-start gap-2.5 group hover:bg-zinc-50 -mx-1 px-1 py-1 rounded-md transition-colors'
  // ...
  <div className='p-1.5 bg-zinc-100 rounded-md shrink-0 group-hover:bg-zinc-200 transition-colors mt-0.5'>
  ```

- [ ] **Step 5: Update activity text sizes**

  ```tsx
  // FROM:
  <p className='text-[12px] font-semibold text-zinc-900 leading-tight truncate'>
  <p className='text-[10px] text-zinc-500 mt-0.5 leading-tight'>
  // TO:
  <p className='text-xs font-semibold text-zinc-900 leading-tight truncate'>
  <p className='text-xs text-zinc-500 mt-0.5 leading-tight'>
  ```

- [ ] **Step 6: Update footer link text**

  ```tsx
  // FROM:
  className='text-[10px] font-bold text-zinc-400 hover:text-zinc-600 uppercase tracking-widest ...'
  // TO:
  className='text-xs font-bold text-zinc-400 hover:text-zinc-600 uppercase tracking-widest ...'
  ```

- [ ] **Step 7: Update skeleton**

  ```tsx
  // FROM:
  <div className='bg-white rounded-sm border border-zinc-200 p-4 flex flex-col h-full animate-pulse'>
  // icon placeholder: <div className='w-6 h-6 bg-zinc-100 rounded-sm shrink-0' />
  // TO:
  <div className='bg-white rounded-md border border-border p-4 flex flex-col h-full animate-pulse'>
  // icon placeholder: <div className='w-6 h-6 bg-zinc-100 rounded-md shrink-0' />
  ```

- [ ] **Step 8: Commit**
  ```bash
  git add src/components/dashboard/RecentActivityCard.tsx
  git commit -m "design: RecentActivityCard — rounded-md, border-border, text-xs labels"
  ```

---

### Task 8: DashboardPage — Heatmap wrapper

**Files:**
- Modify: `src/app/dashboard/page.tsx`

**What changes:**
- Heatmap wrapper div: `rounded-sm border border-zinc-200` → `rounded-md border border-border`

- [ ] **Step 1: Update heatmap section wrapper**

  ```tsx
  // FROM:
  <div className='w-full bg-white relative border border-zinc-200 rounded-sm p-2'>
  // TO:
  <div className='w-full bg-white relative border border-border rounded-md p-2'>
  ```

- [ ] **Step 2: Commit**
  ```bash
  git add src/app/dashboard/page.tsx
  git commit -m "design: dashboard page — heatmap wrapper rounded-md, border-border"
  ```

---

### Task 9: SubjectRadarChart

**Files:**
- Modify: `src/components/dashboard/SubjectRadarChart.tsx`

**What changes:**
- Card: `border-zinc-200` → `border-border`
- CardTitle: `text-[10px]` → `text-[11px]`
- Tooltip: `rounded-lg border-zinc-200 shadow-xl` → `rounded-md border-border shadow-lg`
- Tooltip text: `text-[10px]` → `text-xs`
- PolarGrid: `stroke='#e4e4e7'` → `stroke='#f4f4f5'` (lighter, Tufte)
- PolarAngleAxis: `fontSize: 9` → `fontSize: 11`
- Legend text: `text-[9px]` → `text-[11px]`; `text-[10px]` → `text-xs`

- [ ] **Step 1: Update Card borders**

  ```tsx
  // FROM (both Card usages):
  <Card className='border-zinc-200 bg-white shadow-none p-2 ...'>
  // TO:
  <Card className='border-border bg-white p-2 ...'>
  ```
  Note: removing `shadow-none` is fine since card.tsx now applies the ultra-subtle default shadow.

- [ ] **Step 2: Update CardTitle text size**

  ```tsx
  // FROM (both):
  <CardTitle className='text-[10px] font-bold tracking-wider text-zinc-500 uppercase'>
  // TO:
  <CardTitle className='text-[11px] font-bold tracking-wider text-zinc-500 uppercase'>
  ```

- [ ] **Step 3: Update CustomTooltip**

  ```tsx
  // FROM:
  <div className="rounded-lg border border-zinc-200 bg-white p-2 shadow-xl ring-1 ring-black/5">
    <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
    <p className="text-sm font-semibold text-zinc-900">
      {payload[0].value}% <span className="text-[10px] font-medium text-zinc-400">Mastery</span>
  // TO:
  <div className="rounded-md border border-border bg-white p-2 shadow-lg">
    <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
    <p className="text-sm font-semibold text-zinc-900">
      {payload[0].value}% <span className="text-xs font-medium text-zinc-400">Mastery</span>
  ```

- [ ] **Step 4: Update PolarGrid stroke**

  ```tsx
  // FROM:
  <PolarGrid stroke='#e4e4e7' strokeWidth={1} />
  // TO:
  <PolarGrid stroke='#f4f4f5' strokeWidth={1} />
  ```

- [ ] **Step 5: Update PolarAngleAxis font size**

  ```tsx
  // FROM:
  tick={{ fill: '#71717a', fontSize: 9, fontWeight: 500 }}
  // TO:
  tick={{ fill: '#656d76', fontSize: 11, fontWeight: 500 }}
  ```

- [ ] **Step 6: Update legend text sizes**

  ```tsx
  // FROM:
  <span className='truncate text-[9px] font-medium text-zinc-500 uppercase tracking-tight'>
  <span className='text-[10px] font-bold text-zinc-900'>
  // TO:
  <span className='truncate text-[11px] font-medium text-zinc-500 uppercase tracking-tight'>
  <span className='text-xs font-bold text-zinc-900'>
  ```

- [ ] **Step 7: Update empty state text sizes**

  ```tsx
  // FROM:
  <p className='text-[11px] font-medium text-zinc-500'>
  <p className='text-[10px] text-zinc-400'>
  // TO:
  <p className='text-sm font-medium text-zinc-500'>
  <p className='text-xs text-zinc-400'>
  ```

- [ ] **Step 8: Update legend border**

  ```tsx
  // FROM:
  <div className='mt-1 grid grid-cols-2 gap-1 border-t border-zinc-50 pt-2 px-2'>
  // TO:
  <div className='mt-1 grid grid-cols-2 gap-1 border-t border-border/40 pt-2 px-2'>
  ```

- [ ] **Step 9: Commit**
  ```bash
  git add src/components/dashboard/SubjectRadarChart.tsx
  git commit -m "design: SubjectRadarChart — border-border, rounded-md tooltip, font sizes up"
  ```

---

### Task 10: ActivityHeatmap

**Files:**
- Modify: `src/components/dashboard/ActivityHeatmap.tsx`

**What changes:**
- Year select: `rounded-sm border-zinc-200` → `rounded-md border-border`
- Separator colors: month/year separators use zinc-200/300 (fine — keep)
- Legend text: `text-[10px]` → `text-xs`
- HeatmapSectionSkeleton: `rounded-sm` → `rounded-md`

- [ ] **Step 1: Update year select radius and border**

  ```tsx
  // FROM:
  'appearance-none cursor-pointer rounded-sm border border-zinc-200',
  // TO:
  'appearance-none cursor-pointer rounded-md border border-border',
  ```

- [ ] **Step 2: Update legend text sizes**

  All `text-[10px]` in the legend → `text-xs`:
  ```tsx
  // FROM (all legend spans):
  <span className='text-[10px] text-zinc-400 select-none'>Less</span>
  <span className='text-[10px] text-zinc-400 select-none'>More</span>
  <span className='text-[10px] text-zinc-400 select-none'>Exam day</span>
  <span className='text-[10px] text-zinc-400 select-none'>Today</span>
  <span className='text-[10px] text-zinc-400 select-none'>Sign up day</span>
  <span className='text-[10px] text-zinc-300 select-none'>·</span>
  // TO: replace text-[10px] with text-xs throughout
  ```

- [ ] **Step 3: Update HeatmapSectionSkeleton in HeatmapSection.tsx**

  ```tsx
  // In src/components/dashboard/HeatmapSection.tsx
  // FROM:
  <div className='p-3 pb-2 animate-pulse'>
    ...
    <div className='h-[84px] bg-zinc-100 rounded' />
    <div className='w-3 h-3 bg-zinc-100 rounded-sm' />
  // TO: change rounded-sm → rounded-md in the skeleton cells
  ```

- [ ] **Step 4: Commit**
  ```bash
  git add src/components/dashboard/ActivityHeatmap.tsx src/components/dashboard/HeatmapSection.tsx
  git commit -m "design: ActivityHeatmap — rounded-md select, text-xs legend, skeleton fix"
  ```

---

## Chunk 3: Analytics Page Components

### Task 11: AnalyticsSummaryBar

**Files:**
- Modify: `src/components/analytics/AnalyticsSummaryBar.tsx`

**What changes:**
- Container: `rounded-sm bg-zinc-100 border-zinc-200` → `rounded-md bg-border/20 border-border`
- Metric container: `bg-white p-3` (fine, keep)
- Label text: `text-[9px]` → `text-[11px]`
- Unit text: `text-[9px]` → `text-[11px]`

- [ ] **Step 1: Update container**

  ```tsx
  // FROM:
  <div className="grid grid-cols-3 md:grid-cols-5 gap-px bg-zinc-100 rounded-sm overflow-hidden border border-zinc-200">
  // TO:
  <div className="grid grid-cols-3 md:grid-cols-5 gap-px bg-border/30 rounded-md overflow-hidden border border-border">
  ```

- [ ] **Step 2: Update label text sizes in Metric component**

  ```tsx
  // FROM:
  <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider leading-none">{label}</span>
  // value:
  <span className={cn('text-xl font-bold leading-none', ...)}>
  // unit:
  <span className="text-[9px] font-medium text-zinc-500 uppercase tracking-tight">{unit}</span>
  // TO:
  <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider leading-none">{label}</span>
  // value: keep text-xl
  <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-tight">{unit}</span>
  ```

- [ ] **Step 3: Commit**
  ```bash
  git add src/components/analytics/AnalyticsSummaryBar.tsx
  git commit -m "design: AnalyticsSummaryBar — rounded-md, border-border, text-[11px] labels"
  ```

---

### Task 12: ReadinessTrajectory

**Files:**
- Modify: `src/components/analytics/ReadinessTrajectory.tsx`

**What changes:**
- Card: `rounded-sm border-zinc-200 shadow-none` → `border-border` (rounded-md from card.tsx base, remove shadow-none)
- CardTitle: `text-[10px]` → `text-[11px]`
- Trend badge: `text-[9px]` → `text-[11px]`
- Target label: `text-[9px]` → `text-[11px]`
- Empty state text: `text-[10px]` → `text-xs`
- Tooltip: `fontSize: '10px'` → `fontSize: '11px'`, `borderRadius: '4px'` → `6px`, `border: '1px solid #e4e4e7'` → `'1px solid #d0d7de'`
- XAxis tick: `fontSize: 8` → `fontSize: 11`

- [ ] **Step 1: Update Card**

  ```tsx
  // FROM:
  <Card className="rounded-sm border-zinc-200 bg-white shadow-none p-2 relative">
  // TO:
  <Card className="border-border bg-white p-2 relative">
  ```

- [ ] **Step 2: Update CardTitle text**

  ```tsx
  // FROM:
  <CardTitle className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase">
  // TO:
  <CardTitle className="text-[11px] font-bold tracking-wider text-zinc-500 uppercase">
  ```

- [ ] **Step 3: Update trend badge text size**

  ```tsx
  // FROM:
  'flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase',
  // TO:
  'flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[11px] font-bold uppercase',
  ```

- [ ] **Step 4: Update target label**

  ```tsx
  // FROM:
  <div className="flex items-center gap-1 text-[9px] font-bold text-green-600 uppercase tracking-wider">
  // TO:
  <div className="flex items-center gap-1 text-[11px] font-bold text-green-600 uppercase tracking-wider">
  ```

- [ ] **Step 5: Update empty state text**

  ```tsx
  // FROM:
  <p className="text-[10px] text-zinc-400 text-center leading-snug max-w-[200px]">
  // TO:
  <p className="text-xs text-zinc-400 text-center leading-snug max-w-[200px]">
  ```

- [ ] **Step 6: Update chart axis and tooltip styles**

  ```tsx
  // XAxis tick:
  // FROM: tick={{ fontSize: 8, fill: '#aeaeb2' }}
  // TO:   tick={{ fontSize: 11, fill: '#656d76' }}

  // Tooltip contentStyle:
  // FROM: { borderRadius: '4px', border: '1px solid #e4e4e7', fontSize: '10px' }
  // TO:   { borderRadius: '6px', border: '1px solid #d0d7de', fontSize: '11px' }
  ```

- [ ] **Step 7: Commit**
  ```bash
  git add src/components/analytics/ReadinessTrajectory.tsx
  git commit -m "design: ReadinessTrajectory — border-border, text-[11px] labels, chart axis fix"
  ```

---

### Task 13: PacingQuadrant

**Files:**
- Modify: `src/components/analytics/PacingQuadrant.tsx`

**What changes:**
- Card: `rounded-sm border-zinc-200 shadow-none` → `border-border`
- CardTitle: `text-[10px]` → `text-[11px]`
- Quadrant labels: `text-[8px]` → `text-[11px]`
- CustomTooltip: `rounded border-zinc-200` → `rounded-md border-border`; `text-[10px]` → `text-xs`
- Legend text: `text-[8px]` → `text-[11px]`
- Axis tick: `fontSize: 8` → `fontSize: 11`; `fill: '#aeaeb2'` → `fill: '#656d76'`
- Axis labels: `fontSize: 8` → `fontSize: 11`; same fill

- [ ] **Step 1: Update Card**

  ```tsx
  // FROM (both Card usages):
  <Card className="rounded-sm border-zinc-200 bg-white shadow-none p-2 relative ...">
  // TO:
  <Card className="border-border bg-white p-2 relative ...">
  ```

- [ ] **Step 2: Update CardTitle text sizes**

  ```tsx
  // FROM (both):
  <CardTitle className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase">
  // TO:
  <CardTitle className="text-[11px] font-bold tracking-wider text-zinc-500 uppercase">
  ```

- [ ] **Step 3: Update quadrant labels**

  ```tsx
  // FROM (4 quadrant labels):
  <span className="text-[8px] font-bold text-green-600 uppercase tracking-wider">✓ Mastered</span>
  <span className="text-[8px] font-bold text-amber-600 uppercase tracking-wider">Rushing</span>
  <span className="text-[8px] font-bold text-blue-600 uppercase tracking-wider">Careful</span>
  <span className="text-[8px] font-bold text-red-500 uppercase tracking-wider">Overthinking</span>
  // TO: change text-[8px] → text-[11px] on all four
  ```

- [ ] **Step 4: Update CustomTooltip**

  ```tsx
  // FROM:
  <div className="rounded border border-zinc-200 bg-white p-2 shadow-lg text-[10px]">
    <p className="font-bold text-zinc-900 mb-1">{d.subject}</p>
    <p className="text-zinc-500">
  // TO:
  <div className="rounded-md border border-border bg-white p-2 shadow-lg text-xs">
    <p className="font-bold text-zinc-900 mb-1">{d.subject}</p>
    <p className="text-zinc-500">
  ```

- [ ] **Step 5: Update axis and legend**

  ```tsx
  // XAxis tick:
  // FROM: tick={{ fontSize: 8, fill: '#aeaeb2' }}
  // TO:   tick={{ fontSize: 11, fill: '#656d76' }}

  // YAxis tick:
  // FROM: tick={{ fontSize: 8, fill: '#aeaeb2' }}
  // TO:   tick={{ fontSize: 11, fill: '#656d76' }}

  // XAxis label:
  // FROM: { value: 'Avg Seconds / Question', ... fontSize: 8, fill: '#aeaeb2' }
  // TO:   { value: 'Avg Seconds / Question', ... fontSize: 11, fill: '#656d76' }

  // Legend dots:
  // FROM: <span className="text-[8px] text-zinc-500 truncate max-w-[120px]">
  // TO:   <span className="text-[11px] text-zinc-500 truncate max-w-[120px]">
  ```

- [ ] **Step 6: Update empty state**

  ```tsx
  // FROM:
  <p className="text-[11px] font-medium text-zinc-500">
  <p className="text-[10px] text-zinc-400">
  // TO:
  <p className="text-sm font-medium text-zinc-500">
  <p className="text-xs text-zinc-400">
  ```

- [ ] **Step 7: Commit**
  ```bash
  git add src/components/analytics/PacingQuadrant.tsx
  git commit -m "design: PacingQuadrant — border-border, text-[11px] labels, chart axes"
  ```

---

### Task 14: StaminaCurve

**Files:**
- Modify: `src/components/analytics/StaminaCurve.tsx`

**What changes:**
- Card: `rounded-sm border-zinc-200 shadow-none` → `border-border`
- CardTitle: `text-[10px]` → `text-[11px]`
- Empty state: `text-[10px]` → `text-xs`
- Tooltip: `borderRadius: '4px', border: '1px solid #e4e4e7', fontSize: '10px'` → `6px`, `#d0d7de`, `'11px'`
- Axis tick: `fontSize: 8` → `fontSize: 11`; `fill: '#aeaeb2'` → `fill: '#656d76'`

- [ ] **Step 1: Update Card**

  ```tsx
  // FROM:
  <Card className="rounded-sm border-zinc-200 bg-white shadow-none p-2 relative h-full">
  // TO:
  <Card className="border-border bg-white p-2 relative h-full">
  ```

- [ ] **Step 2: Update CardTitle**

  ```tsx
  // FROM:
  <CardTitle className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase">
  // TO:
  <CardTitle className="text-[11px] font-bold tracking-wider text-zinc-500 uppercase">
  ```

- [ ] **Step 3: Update empty state text**

  ```tsx
  // FROM:
  <p className="text-[10px] text-zinc-400 text-center leading-snug max-w-[180px]">
  // TO:
  <p className="text-xs text-zinc-400 text-center leading-snug max-w-[180px]">
  ```

- [ ] **Step 4: Update chart tooltip and axis**

  ```tsx
  // Tooltip:
  // FROM: contentStyle={{ borderRadius: '4px', border: '1px solid #e4e4e7', fontSize: '10px' }}
  // TO:   contentStyle={{ borderRadius: '6px', border: '1px solid #d0d7de', fontSize: '11px' }}

  // XAxis tick:
  // FROM: tick={{ fontSize: 8, fill: '#aeaeb2' }}
  // TO:   tick={{ fontSize: 11, fill: '#656d76' }}

  // YAxis tick:
  // FROM: tick={{ fontSize: 8, fill: '#aeaeb2' }}
  // TO:   tick={{ fontSize: 11, fill: '#656d76' }}
  ```

- [ ] **Step 5: Commit**
  ```bash
  git add src/components/analytics/StaminaCurve.tsx
  git commit -m "design: StaminaCurve — border-border, text-[11px] labels, chart axis"
  ```

---

### Task 15: MemoryHealthMap

**Files:**
- Modify: `src/components/analytics/MemoryHealthMap.tsx`

**What changes:**
- Card: `rounded-sm border-zinc-200 shadow-none` → `border-border`
- CardTitle: `text-[10px]` → `text-[11px]`
- Tag text: `text-[9px]` → `text-[11px]`
- Warning text: `text-[9px]` → `text-[11px]`
- Empty state: `text-[10px]` → `text-xs`

- [ ] **Step 1: Update Card**

  ```tsx
  // FROM:
  <Card className="rounded-sm border-zinc-200 bg-white shadow-none p-2 relative h-full">
  // TO:
  <Card className="border-border bg-white p-2 relative h-full">
  ```

- [ ] **Step 2: Update CardTitle**

  ```tsx
  // FROM:
  <CardTitle className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase">
  // TO:
  <CardTitle className="text-[11px] font-bold tracking-wider text-zinc-500 uppercase">
  ```

- [ ] **Step 3: Update tag text size**

  ```tsx
  // FROM:
  'flex items-center gap-1 px-1.5 py-0.5 rounded-full border text-[9px] font-medium cursor-default',
  // TO:
  'flex items-center gap-1 px-1.5 py-0.5 rounded-full border text-[11px] font-medium cursor-default',
  ```

- [ ] **Step 4: Update warning text**

  ```tsx
  // FROM:
  <div className="mt-2 text-[9px] text-red-600 font-medium">
  // TO:
  <div className="mt-2 text-[11px] text-red-600 font-medium">
  ```

- [ ] **Step 5: Update empty text**

  ```tsx
  // FROM:
  <p className="text-[10px] text-zinc-400 leading-snug">
  // TO:
  <p className="text-xs text-zinc-400 leading-snug">
  ```

- [ ] **Step 6: Commit**
  ```bash
  git add src/components/analytics/MemoryHealthMap.tsx
  git commit -m "design: MemoryHealthMap — border-border, text-[11px] labels throughout"
  ```

---

### Task 16: PacingInsights

**Files:**
- Modify: `src/components/analytics/PacingInsights.tsx`

**What changes:**
- Card: `rounded-sm border-zinc-200 shadow-none` → `border-border`
- CardTitle: `text-[10px]` → `text-[11px]`
- Subject text: `text-[10px]` → `text-xs`
- Badge: `text-[9px]` → `text-[11px]`; `rounded-full` ← keep
- Accuracy: `text-[9px]` → `text-[11px]`
- Progress description: `text-[9px]` → `text-[11px]`
- Tip box: `rounded-sm` → `rounded-md`; `text-[9px]` → `text-[11px]`
- Empty state: `text-[10px]` → `text-xs`
- Progress bar: `rounded-full` ← keep (pill shape correct here)

- [ ] **Step 1: Update Card**

  ```tsx
  // FROM:
  <Card className="rounded-sm border-zinc-200 bg-white shadow-none p-2 relative h-full">
  // TO:
  <Card className="border-border bg-white p-2 relative h-full">
  ```

- [ ] **Step 2: Update CardTitle**

  ```tsx
  // FROM:
  <CardTitle className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase flex items-center gap-1">
  // TO:
  <CardTitle className="text-[11px] font-bold tracking-wider text-zinc-500 uppercase flex items-center gap-1">
  ```

- [ ] **Step 3: Update all small text sizes**

  ```tsx
  // Subject label:
  // FROM: className="text-[10px] font-medium text-zinc-700 truncate max-w-[140px]"
  // TO:   className="text-xs font-medium text-zinc-700 truncate max-w-[140px]"

  // Ratio badge:
  // FROM: 'text-[9px] font-bold px-1.5 py-0.5 rounded-full', ...
  // TO:   'text-[11px] font-bold px-1.5 py-0.5 rounded-full', ...

  // Accuracy text:
  // FROM: <span className="text-[9px] text-zinc-400">
  // TO:   <span className="text-[11px] text-zinc-400">

  // Progress description:
  // FROM: <p className="text-[9px] text-zinc-400">
  // TO:   <p className="text-[11px] text-zinc-400">
  ```

- [ ] **Step 4: Update tip box**

  ```tsx
  // FROM:
  <div className="flex items-start gap-1.5 bg-amber-50 rounded-sm px-2 py-1.5 mt-1">
    <p className="text-[9px] text-amber-700 leading-snug">
  // TO:
  <div className="flex items-start gap-1.5 bg-amber-50 rounded-md px-2 py-1.5 mt-1">
    <p className="text-[11px] text-amber-700 leading-snug">
  ```

- [ ] **Step 5: Update empty state**

  ```tsx
  // FROM:
  <p className="text-[10px] text-zinc-400 leading-snug">
  // TO:
  <p className="text-xs text-zinc-400 leading-snug">
  ```

- [ ] **Step 6: Commit**
  ```bash
  git add src/components/analytics/PacingInsights.tsx
  git commit -m "design: PacingInsights — border-border, text-[11px] labels, rounded-md tip"
  ```

---

### Task 17: Analytics Page Header

**Files:**
- Modify: `src/app/dashboard/analytics/page.tsx`

**What changes:**
- `ChartSkeleton`: `rounded-sm border-zinc-100` → `rounded-md border-border/50`
- Header: `text-[20px]` → `text-xl`; `text-[11px]` → `text-xs`

- [ ] **Step 1: Update ChartSkeleton**

  ```tsx
  // FROM:
  <div className={`rounded-sm border border-zinc-100 bg-white ${height} animate-pulse`}>
  // TO:
  <div className={`rounded-md border border-border/50 bg-white ${height} animate-pulse`}>
  ```

- [ ] **Step 2: Update page header text**

  ```tsx
  // FROM:
  <h1 className="text-[20px] font-bold text-zinc-900 tracking-tight">Analytics</h1>
  <p className="text-[11px] text-zinc-500 mt-0.5">
  // TO:
  <h1 className="text-xl font-bold text-zinc-900 tracking-tight">Analytics</h1>
  <p className="text-xs text-zinc-500 mt-0.5">
  ```

- [ ] **Step 3: Commit**
  ```bash
  git add src/app/dashboard/analytics/page.tsx
  git commit -m "design: analytics page — rounded-md skeleton, standardized text scale"
  ```

---

### Task 18: ChartCoachingAnnotation

**Files:**
- Modify: `src/components/analytics/ChartCoachingAnnotation.tsx`

- [ ] **Step 1: Read the file first**

- [ ] **Step 2: Replace any `rounded-sm` with `rounded-md` and `border-zinc-*` with `border-border`**

- [ ] **Step 3: Increase any `text-[9px]` / `text-[10px]` to `text-[11px]` / `text-xs`**

- [ ] **Step 4: Commit**
  ```bash
  git add src/components/analytics/ChartCoachingAnnotation.tsx
  git commit -m "design: ChartCoachingAnnotation — rounded-md, text-[11px]"
  ```

---

## Chunk 4: Final Verification

### Task 19: Cross-Codebase Audit

Run searches to catch any missed instances.

- [ ] **Step 1: Find remaining `rounded-sm` in dashboard/analytics**

  ```bash
  grep -r "rounded-sm" src/components/dashboard/ src/components/analytics/ src/app/dashboard/
  ```
  Expected: zero results (or only in places that intentionally use sharp corners like heatmap cells which use `rounded-[2px]`).

- [ ] **Step 2: Find remaining `border-zinc-200` in dashboard/analytics**

  ```bash
  grep -r "border-zinc-200" src/components/dashboard/ src/components/analytics/ src/app/dashboard/
  ```
  Expected: zero results (all replaced with `border-border`).

- [ ] **Step 3: Find remaining tiny text in dashboard/analytics**

  ```bash
  grep -r "text-\[9px\]\|text-\[8px\]" src/components/dashboard/ src/components/analytics/
  ```
  Expected: zero results.

- [ ] **Step 4: Verify layout classes are untouched**

  ```bash
  git diff --stat HEAD~20 -- src/components/dashboard/ src/components/analytics/ src/app/dashboard/ | grep -v "^$"
  ```
  Review: ensure no `grid-cols-`, `col-span-`, `gap-`, `flex-1`, `h-[` were changed.

- [ ] **Step 5: Build check**

  ```bash
  cd D:/SlateCamp/slate-camp && bun run build
  ```
  Expected: successful build, no type errors.

- [ ] **Step 6: Final commit if any fixes needed**

  ```bash
  git add -A
  git commit -m "design: final audit fixes — design system overhaul complete"
  ```

---

## Summary: What Does NOT Change

These are explicitly preserved:
- All `grid-cols-*`, `col-span-*`, `gap-*` classes
- All `flex-1`, `items-stretch`, `h-[*]`, `w-[*]` layout classes
- `rounded-full` on pills, avatars, progress indicators
- `rounded-[2px]` on heatmap cells (micro-cells, intentionally sharp)
- Blue on DailyCatalystCard (it IS a primary CTA card — blue is semantic here)
- Score-based colors (green/amber/red for readiness/mastery scores)
- All quiz-specific styling (QuizRenderer, ModeIntroScreen)
- Dark mode variables (`.dark` block in globals.css)
- Animation classes and keyframes
- Chart data colors (green/amber/red/blue for data visualization)

## Token Reference

| Current | New | Where |
|---------|-----|-------|
| `rounded-sm` | `rounded-md` | All card/button/input/popover wrappers |
| `border-zinc-200` | `border-border` | All card/container borders |
| `shadow-xl` on cards | `shadow-lg` | Popovers/tooltips only |
| `shadow-none` explicit | Remove | card.tsx handles base shadow |
| `text-[9px]` | `text-[11px]` | All labels/metadata |
| `text-[10px]` | `text-xs` (12px) | Small secondary text |
| `text-[8px]` | `text-[11px]` | Chart labels |
| `fontSize: 8` in charts | `fontSize: 11` | Recharts axis ticks |
| `fill: '#aeaeb2'` in charts | `fill: '#656d76'` | Recharts axis text |
| `border: '1px solid #e4e4e7'` in tooltips | `'1px solid #d0d7de'` | Chart tooltips |
| `borderRadius: '4px'` in tooltips | `'6px'` | Chart tooltips |
