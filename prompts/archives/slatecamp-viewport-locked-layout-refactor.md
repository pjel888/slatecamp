# SlateCamp — Viewport-Locked Responsive Layout Refactor
## Make the Dashboard Fit a 13" MacBook Without Scrolling

---

## ROLE

You are a Principal Next.js/Tailwind Architect specializing in dense SaaS dashboards that feel like native desktop apps. You understand the difference between a "scrolling webpage" and a "viewport-locked application" — and SlateCamp must be the latter. You also care about cognitive load: an educational platform where a student can see ALL their key metrics without scrolling reduces anxiety and increases return rate.

---

## THE PROBLEM

The SlateCamp dashboard was designed on a large monitor. On a standard 13" MacBook Pro (1440×900 logical, ~750px usable vertical after browser chrome + OS dock), critical content gets pushed below the fold:

**Current dashboard layout (audited live):**
```
┌──────────────────────────────────────────────────┐
│ SIDEBAR (72px wide, collapsed)   │ CONTENT AREA  │
│                                  │               │
│ Dashboard                        │ COBALT HERO   │ ← Y: 0-180px (greeting + name)
│ Wiki                             │ (1044×180px)  │
│ Testing                          │               │
│ Notes                            ├───────┬───────┤
│ 3D Lab                           │RESUME │RECENT │ ← Y: 180-430px
│ Analytics                        │CARD   │ACTIV. │
│ Settings                         │(693px)│(343px)│
│                                  ├───┬───┬───────┤
│                                  │6  │61 │ —     │ ← Y: 430-550px (stat cards 103px tall)
│                                  │top│qs │ score │
│                                  ├───┴───┴───────┤
│                                  │ STUDY ACTIVITY │ ← Y: 550-770px (heatmap 221px)
│                                  │ HEATMAP        │
│                                  ├───────────────┤
│                                  │               │
│                                  │  417px EMPTY  │ ← WASTED — 35% of page
│                                  │               │
│                                  └───────────────┘
```

**On a 13" MacBook (750px usable height):** The heatmap gets cut off. The stat cards are barely visible. A student opens SlateCamp and immediately has to scroll to see their own Readiness Score. That's broken.

**The fix:** Transition from "scrolling page" to "viewport-locked, internally-scrollable" architecture. The dashboard shell locks to `100vh`. Individual cards with overflow content (activity feed, heatmap) scroll internally. The student sees EVERYTHING at a glance.

---

## CONTEXT

- **Framework:** Next.js (App Router), Tailwind CSS, TypeScript
- **Sidebar:** 72px collapsed, 260px expanded. Sticky, full height.
- **Top header/banner:** Contains breadcrumb + mobile nav toggle. Height ~48-56px.
- **Page background:** `#F8F7F5` (Warm White)
- **Card style:** `bg-white border border-[#D4DAE3] rounded-lg` with `shadow` on some cards
- **Current padding:** Cards use `p-5` to `p-6` — too generous for a locked viewport

### Key file locations (verify these — structure may have shifted):
```
src/app/layout.tsx                    — Root layout (html/body)
src/app/dashboard/layout.tsx          — Dashboard shell (sidebar + content area)
src/app/dashboard/page.tsx            — Dashboard home page
src/components/layout/Sidebar.tsx     — Sidebar component (or similar)
src/components/layout/TopBar.tsx      — Top header/breadcrumb (or similar)
```

### Tools You MUST Use
- **File System** — Read every layout file before changing anything. Map the actual component tree.
- **Supabase MCP** — Not needed for this task. Layout only.

---

## THE VERTICAL PIXEL BUDGET (13" MacBook)

```
Total viewport height:             ~800px (1440×900 at @2x, minus dock)
Minus browser chrome (tabs + bar):  -60px
Minus OS dock (if visible):         -50px (varies)
═══════════════════════════════════════
USABLE HEIGHT:                      ~690-750px

Now subtract SlateCamp's own chrome:
Minus top header/banner:            -48px (breadcrumb bar)
Minus content padding (top+bottom): -16px (p-2 on content wrapper)
═══════════════════════════════════════
AVAILABLE FOR DASHBOARD CARDS:      ~626-686px

Current card stack needs:
  Cobalt hero:                       180px  ← TOO TALL for laptop
  Resume + Recent row:               227px  ← Could compress
  Stat cards row:                    103px  ← OK
  Heatmap:                           221px  ← Could compress
  ─────────────────────────────────
  TOTAL NEEDED:                      731px  ← EXCEEDS BUDGET BY 50-100px
```

**The math is clear:** We need to recover ~100px. The cobalt hero (180px) and heatmap (221px) are the two biggest targets.

---

## THE ARCHITECTURE SHIFT

### FROM: Scrolling page
```
<body>
  <div class="flex">
    <Sidebar />
    <main>                          ← SCROLLS ENTIRE MAIN
      <TopBar />
      <div class="p-6">            ← Fat padding
        <HeroGreeting />            ← 180px tall
        <ResumeCard />              ← 227px
        <StatCards />               ← 103px
        <Heatmap />                 ← 221px
        <417px of nothing>
      </div>
    </main>
  </div>
</body>
```

### TO: Viewport-locked shell with internal scroll zones
```
<body class="h-screen overflow-hidden">
  <div class="flex h-screen">
    <Sidebar />                     ← Already h-screen sticky — OK
    <div class="flex-1 flex flex-col h-screen overflow-hidden">
      <TopBar />                    ← Fixed height, flex-shrink-0
      <main class="flex-1 overflow-y-auto p-2 lg:overflow-hidden">
        ← On MOBILE: main scrolls normally (long page is fine on phone)
        ← On LAPTOP+: main is overflow-hidden, cards fill the space
        <div class="flex flex-col h-full gap-2">
          <HeroGreeting />          ← COMPRESSED to 100-120px
          <div class="grid grid-cols-3 flex-1 gap-2 min-h-0">
            ← This grid fills ALL remaining space
            ← Cards inside use flex-1 + overflow-y-auto
            <ResumeCard />
            <StatCards />
            <Heatmap />             ← overflow-y-auto if content exceeds
          </div>
        </div>
      </main>
    </div>
  </div>
</body>
```

The critical CSS trick: `min-h-0` on flex children that need to shrink below their content height. Without this, flex items won't collapse and the layout breaks.

---

## SPECIFIC COMPRESSION TARGETS

| Element | Current | Target | How |
|---|---|---|---|
| Cobalt hero | 180px | 100-120px | Reduce padding. Tighten greeting text. Move motivational subtext to a single line. |
| Resume card | 227px tall | 160-180px | Tighten internal padding from p-5/p-6 to p-3/p-4. Reduce progress bar height. |
| Stat cards | 103px each | 80-90px | Reduce number size from 36px to 28-30px. Tighten padding to p-3. |
| Heatmap | 221px | 160-180px with internal scroll | Reduce header padding. If cells overflow, the heatmap card scrolls internally. |
| Content wrapper padding | p-6 or p-4 | p-2 | Recovering 16-32px of vertical space from wrapper padding alone. |
| Gaps between cards | gap-4 or gap-3 | gap-2 | Tighter vertical rhythm on laptop. Can expand to gap-3 on xl+. |

**Total recovered: ~130-170px** — more than enough to fit within the 686px budget.

---

## RESPONSIVE BREAKPOINT STRATEGY

| Breakpoint | Behavior |
|---|---|
| `< lg` (mobile/tablet) | Normal scrolling page. No viewport locking. Cards stack vertically. Full padding. |
| `lg` (1024px+) | Viewport-locked. `h-screen overflow-hidden` on shell. Compressed padding. Internal scroll zones. |
| `xl` (1280px+) | Slightly relaxed padding (p-4 instead of p-3). Gaps expand to gap-3. |
| `2xl` (1536px+) | Content area gets `max-w-7xl mx-auto`. Prevents cards from stretching to absurd widths. Padding relaxes to p-5. |

**The key insight:** Below `lg`, the page behaves like a normal website (scroll freely). At `lg` and above, it locks to the viewport like a desktop app. This is the best of both worlds.

---

## CUSTOM SCROLLBAR STYLING

Internal scroll zones (activity feed, heatmap overflow, notes list) need thin, unobtrusive scrollbars:

```css
/* In globals.css */
.scrollbar-thin {
  scrollbar-width: thin;
  scrollbar-color: #D4DAE3 transparent;
}
.scrollbar-thin::-webkit-scrollbar {
  width: 4px;
}
.scrollbar-thin::-webkit-scrollbar-track {
  background: transparent;
}
.scrollbar-thin::-webkit-scrollbar-thumb {
  background: #D4DAE3;
  border-radius: 2px;
}
.scrollbar-thin::-webkit-scrollbar-thumb:hover {
  background: #888888;
}
```

Apply `scrollbar-thin` to every `overflow-y-auto` container in the dashboard.

---

## PHASED EXECUTION

### PHASE 1: Audit & Blueprint (Read-Only)

Read these files (adjust paths if structure differs):
```
src/app/layout.tsx
src/app/dashboard/layout.tsx
src/app/dashboard/page.tsx
src/components/layout/Sidebar.tsx  (or wherever the sidebar lives)
```

Map the actual component tree. Identify:
- Where is `overflow` currently set?
- Which wrapper controls the main content scroll?
- What are the actual padding values (p-4? p-6? py-8?)?
- What is the sidebar's height model (h-screen? h-full? sticky?)?
- Is there a top bar component? What's its height?

Output a **Vertical Pixel Budget** with real numbers from the code.

**STOP.** "Phase 1 Complete. Here is the blueprint. Reply 'Proceed' to execute root shell locking."

### PHASE 2: Root Shell Locking

Apply the viewport-locked architecture to the root layout wrappers:
- `body` or root div gets `h-screen overflow-hidden` (at `lg:` and above)
- Content area gets `flex-1 flex flex-col overflow-hidden` (at `lg:`)
- Mobile remains `overflow-y-auto` (normal scrolling)
- Add `min-h-0` to all flex children that need to shrink

**DO NOT** touch individual cards or page content in this phase. Only the shell.

**STOP.** "Phase 2 Complete. Shell is viewport-locked. Reply 'Proceed' for card compression."

### PHASE 3: Card Density & Internal Scroll

Now refactor the dashboard page content:
- Compress the cobalt hero (180px → 100-120px)
- Tighten all card padding (p-5/p-6 → p-3/p-4)
- Reduce gaps (gap-4 → gap-2)
- Make the heatmap card internally scrollable (flex-col + flex-1 + overflow-y-auto)
- Make the recent activity card internally scrollable
- Apply `.scrollbar-thin` to all overflow-y-auto containers
- Compress stat card number sizes (36px → 28-30px) — but keep them Inter with tabular-nums (NOT Syne — numbers are data, per design system)

**STOP.** "Phase 3 Complete. Reply 'Proceed' for big-screen polish."

### PHASE 4: Big-Screen & Responsive Polish

- Add `max-w-7xl mx-auto` to the content area at `2xl:` breakpoint
- Relax padding at `xl:` (p-3 → p-4) and `2xl:` (→ p-5)
- Expand gaps at `xl:` (gap-2 → gap-3)
- Verify the layout at these viewport sizes:
  - `1280×800` (13" MacBook — THE critical test)
  - `1440×900` (15" MacBook)
  - `1920×1080` (external monitor)
  - `2560×1440` (27" monitor)
  - `375×812` (iPhone — should scroll normally)
- Verify no card content is clipped without a scrollbar
- Verify the heatmap and activity feed scroll smoothly internally

**STOP.** "Phase 4 Complete. Viewport-locked layout shipped."

---

## VERIFICATION CHECKLIST

After all phases, confirm:
- [ ] On 1280×800: entire dashboard visible without ANY window scrolling
- [ ] On 1280×800: cobalt hero, resume card, stats, AND heatmap all visible
- [ ] On mobile: page scrolls normally (no viewport lock)
- [ ] Heatmap card scrolls internally if content overflows
- [ ] Recent activity card scrolls internally
- [ ] Custom thin scrollbars appear on internal scroll zones
- [ ] No card content is clipped without a visible scrollbar
- [ ] `min-h-0` is on all flex children to prevent overflow
- [ ] On 2560px+ screens: content doesn't stretch past max-w-7xl
- [ ] Sidebar still works (collapse/expand) without breaking the locked layout

---

## WHAT NOT TO DO

- **Don't remove the cobalt hero entirely.** Compress it, don't delete it. The personalized greeting matters.
- **Don't lock the viewport on mobile.** Small screens MUST scroll. The lock is `lg:` and above only.
- **Don't make ALL cards internally scrollable.** Only cards with DYNAMIC content (activity feed, heatmap). Stat cards don't scroll — they just compress.
- **Don't change card content or functionality.** This is a LAYOUT refactor. Data stays. Components stay. Only spacing, overflow, and flex behavior change.
- **Don't forget `min-h-0`.** This is the #1 cause of viewport-locked layouts failing. Every flex child between the shell and the scroll zone needs it.

---

*Execute Phase 1 now. Read the layout files and present the real pixel budget.*
