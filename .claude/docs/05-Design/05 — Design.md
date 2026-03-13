# 05 — Design

SlateCamp Design System v6.0 — extracted from the Master Blueprint HTML. **Light mode is the primary experience.** Dark mode is supported as a secondary theme.

<aside>
📐

**Design Philosophy:** Apple HIG × Dieter Rams (Braun)

Every visual decision prioritizes **clarity over decoration**, **function over flair**, and **structure over style.** Transitions never exceed 150ms. Color is only used when it carries meaning.

</aside>

---

## ☀️ Theme Strategy

- **Light mode = primary.** The default experience ships in light mode — clean matte whites and aluminum grays from the Tailwind Zinc scale
- **Dark mode = supported.** Toggle via `next-themes ^0.4.6` with system preference detection
- Never use pure black (`#000000`) or pure white (`#FFFFFF`) for backgrounds — always use the token values below
- Text selection highlight uses the primary accent tint: `rgba(37, 99, 235, 0.15)`

---

## 🎨 Color Tokens

### Surface Palette (Light Mode)

| **Token** | **Hex** | **Tailwind** | **Usage** |
| --- | --- | --- | --- |
| `--surface-primary` | `#F4F4F5` | zinc-100 | Page background, sidebar background |
| `--surface-secondary` | `#FFFFFF` | white | Card background, alternating section bg |
| `--surface-tertiary` | `#FAFAFA` | zinc-50 | Chips, tags, subtle inset areas |
| `--surface-elevated` | `#FFFFFF` | white | Elevated cards, modals, popovers |
| `--surface-sunken` | `#E4E4E7` | zinc-200 | Table headers, scrollbar track, progress bar bg |
| `--surface-sidebar` | `#F4F4F5` | zinc-100 | Left navigation sidebar |
| `--surface-dark` | `#18181B` | zinc-900 | Dark sections (manifesto), feature number badges, footer |
| `--surface-dark-2` | `#27272A` | zinc-800 | Dark mode secondary surface |

### Ink Palette (Text Hierarchy)

| **Token** | **Hex** | **Tailwind** | **Usage** |
| --- | --- | --- | --- |
| `--ink-primary` | `#18181B` | zinc-900 | Headings, primary body text, strong emphasis |
| `--ink-secondary` | `#27272A` | zinc-800 | Body text, card descriptions, table cell text |
| `--ink-tertiary` | `#52525B` | zinc-600 | Section descriptions, secondary labels, nav links |
| `--ink-quaternary` | `#71717A` | zinc-500 | Eyebrow labels, mono captions, stat labels |
| `--ink-placeholder` | `#A1A1AA` | zinc-400 | Placeholder text, sidebar nav numbers, divider labels |
| `--ink-separator` | `#D4D4D8` | zinc-300 | Borders, chip outlines, step dot borders |
| `--ink-separator-light` | `#E4E4E7` | zinc-200 | Light dividers, section borders, table row borders |
| `--ink-inverse` | `#F4F4F5` | zinc-100 | Text on dark backgrounds |

### Functional Accent Colors

| **Role** | **Token** | **Hex** | **Tailwind** | **Usage** |
| --- | --- | --- | --- | --- |
| **Primary** | `--braun-orange` | `#2563EB` | blue-600 | CTAs, active states, eyebrow labels, links, primary accent |
| Primary Hover | `--braun-orange-hover` | `#1D4ED8` | blue-700 | Button hover, link hover |
| Primary Light | `--braun-orange-light` | `#EFF6FF` | blue-50 | Mentor callout background, active nav tint |
| Primary Tint | `--braun-orange-tint` | `rgba(37,99,235,0.08)` | — | Hover tint on nav, subtle highlight |
| Primary Tint 2 | `--braun-orange-tint-2` | `rgba(37,99,235,0.15)` | — | Text selection, inline highlight `.hl` |
| **Success** | `--braun-green` | `#16A34A` | green-600 | Mastered heatmap nodes, correct answers, pass status |
| Success Light | `--braun-green-light` | `#F0FDF4` | green-50 | Positive voice example background |
| **Error** | `--braun-red` | `#DC2626` | red-600 | Critical heatmap nodes, wrong answers, low scores |
| Error Light | `--braun-red-light` | `#FEF2F2` | red-50 | Error background tint |
| **Warning** | `--braun-amber` | `#D97706` | amber-600 | Developing heatmap nodes, mid-range scores |
| Warning Light | `--braun-amber-light` | `#FFFBEB` | amber-50 | Warning background tint |
| **Neutral** | `--braun-grey` | `#71717A` | zinc-500 | Unexplored heatmap nodes, disabled states |
| Neutral Light | `--braun-grey-light` | `#F4F4F5` | zinc-100 | Grey node tag background |

<aside>
⚠️

**Functional color only.** Color is never decorative in SlateCamp. Every colored element maps to a semantic meaning: mastery state, score range, error state, or primary interaction. If a color doesn't carry data, it should be a shade of zinc.

</aside>

---

## 🔤 Typography

### Font Stacks

| **Token** | **Stack** | **Usage** |
| --- | --- | --- |
| `--font-display` | `'Inter', -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', sans-serif` | All UI text, headings, body, buttons |
| `--font-mono` | `'JetBrains Mono', 'SF Mono', 'Fira Code', monospace` | Eyebrow labels, code snippets, stat labels, captions, tags |

### Type Scale

| **Element** | **Size** | **Weight** | **Line Height** | **Letter Spacing** |
| --- | --- | --- | --- | --- |
| Cover H1 | `clamp(42px, 6vw, 72px)` | 800 | 1.02 | -0.04em |
| Section Title | `clamp(28px, 3.5vw, 42px)` | 800 | 1.08 | -0.03em |
| Mechanic Name | `clamp(26px, 3vw, 36px)` | 800 | 1.12 | -0.025em |
| Feature H3 | 18px | 700 | 1.25 | -0.01em |
| Card H3 | 17px | 700 | 1.25 | -0.01em |
| Section Desc | 15px | 400 | 1.7 | — |
| Prose Body | 15px | 400 | 1.8 | — |
| Card Body | 13.5px | 400 | 1.7 | — |
| Eyebrow / Label | 9–10px (mono) | 500–600 | — | 0.12–0.18em uppercase |
| Stat Value | 38–56px | 800 | 1 | -0.03em |

### Typography Rules

- Base font size: **16px** on `html`
- Body line-height: **1.7**
- Prose max-width: **640px** (65–75 characters)
- Content max-width: **860px**
- Rendering: `-webkit-font-smoothing: antialiased` + `-moz-osx-font-smoothing: grayscale`
- Math rendering via **KaTeX** (`katex ^0.16.37`)

---

## 📐 Shapes & Radii

Apple-style squircle radii for all interactive and container elements.

| **Token** | **Value** | **Usage** |
| --- | --- | --- |
| `--radius-xs` | 6px | Nav links, code badges, voice examples, small tags |
| `--radius-sm` | 10px | Brand mark, feature number badges, step dots |
| `--radius-md` | 14px | Cards, callouts, tables, modals, heatmap wrappers |
| `--radius-lg` | 20px | Large containers, hero sections |
| `--radius-xl` | 28px | Full-page modals, splash screens |
| Pill | 100px (full round) | Chips, tags, pill badges |

---

## 🌒 Elevation (Shadows)

Apple-style layered depth system. Always use double-layer shadows for realism.

| **Token** | **Value** | **Usage** |
| --- | --- | --- |
| `--shadow-sm` | `0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)` | Cards at rest, tables, phrase cards |
| `--shadow-md` | `0 4px 12px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)` | Card hover, phase card hover, popovers |
| `--shadow-lg` | `0 10px 30px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)` | Card active/hover state, dropdowns |
| `--shadow-xl` | `0 20px 50px rgba(0,0,0,0.1), 0 4px 12px rgba(0,0,0,0.05)` | Modals, dialogs, overlays |

---

## ⚡ Motion & Transitions

**Rams Standard: all UI transitions ≤ 150ms.** No gratuitous animation. Motion serves function only.

| **Token** | **Duration** | **Easing** | **Usage** |
| --- | --- | --- | --- |
| `--transition-fast` | 80ms | `cubic-bezier(0.25, 0.1, 0.25, 1)` | Micro-interactions: checkbox, toggle, focus ring |
| `--transition-standard` | 120ms | `cubic-bezier(0.25, 0.1, 0.25, 1)` | Nav hover, background color change, border color |
| `--transition-max` | 150ms | `cubic-bezier(0.25, 0.1, 0.25, 1)` | Card hover (shadow + border + transform), tooltip appear |

### Framer Motion (Complex Animations)

- **Page transitions:** Smooth cross-fade between routes
- **Quiz feedback:** Green pulse (correct), red shake (incorrect)
- **Heatmap updates:** Node color transitions on quiz submission (1s, `cubic-bezier(0.4, 0, 0.2, 1)`)
- **3D Lab:** Shader gradients via `@shadergradient/react`
- **Tooltip/Drawer:** Spring-based slide-in for Peek-View references
- **Onboarding:** Orchestrated entrance for first Readiness Score reveal

### Forbidden Motion

- No confetti, particle effects, or celebration animations
- No bouncing, wiggling, or attention-seeking motion
- No animation exceeding 150ms for standard UI interactions
- Heatmap bar fill (1s ease) is the only exception — it serves as data visualization

---

## 📐 Layout System

### Global Layout

- **Grid:** `sidebar (260px) | main (1fr)` — sidebar sticky, full viewport height
- **Content max-width:** 860px
- **Section padding:** `80px clamp(40px, 6vw, 100px)`
- **Alternating section backgrounds:** Even sections = `--surface-secondary`, Odd = `--surface-primary`

### Grid Patterns

| **Class** | **Columns** | **Gap** | **Usage** |
| --- | --- | --- | --- |
| `.grid-2` | 1fr 1fr | 16px | Two-card layouts (Mission/Vision, Market cards) |
| `.grid-3` | repeat(3, 1fr) | 14px | Phrase cards, Readiness Score cards, three-card rows |
| `.grid-4` | repeat(4, 1fr) | 1px (border-gap) | Stat cells with shared border grid |
| `.tc` (two-col) | 1fr 1fr | 48px | Prose two-column layouts (What We Witnessed / Discovered) |

### Responsive Breakpoint

- **≤ 1024px:** Sidebar collapses (hidden), all grids stack to single column, padding reduces to `56px 28px`
- **Print:** Sidebar hidden, layout becomes single block

---

## 🧱 Component Library

Built on **shadcn/ui** (`shadcn ^4.0.0`) + **Tailwind CSS v4** + **Base UI** (`@base-ui/react ^1.2.0`).

### Styling Stack

- **Tailwind CSS v4** with PostCSS (`@tailwindcss/postcss ^4.2.1`)
- **Class merging:** `tailwind-merge ^3.5.0` + `clsx ^2.1.1` → `cn()` utility
- **Variant management:** `class-variance-authority ^0.7.1` (CVA)
- **Animations:** `tw-animate-css ^1.4.0` + `framer-motion ^12.35.2`

### Core UI Components

| **Component** | **Library** | **Usage** |
| --- | --- | --- |
| Command Palette (Omnibar) | `cmdk ^1.1.1` | Global Cmd+K search across Wiki, Notes, Images |
| Rich Text Editor | TipTap (`@tiptap/react ^3.20.1`) | Notes workspace, Wiki authoring, cheat sheets |
| Date Picker | `react-day-picker ^9.14.0` | Study scheduling, date filters |
| Charts / Graphs | `recharts ^3.8.0` | Analytics dashboard, heatmap data, accuracy-over-time |
| Icons | `lucide-react ^0.577.0` | System-wide icon set |
| Page Loading | `nextjs-toploader ^3.9.17` | Route transition progress bar |
| Markdown Rendering | `react-markdown ^10.1.0`  • `remark-gfm`  • `remark-math`  • `rehype-katex` | Wiki content with GFM tables and math |
| Annotation Highlights | `rough-notation ^0.5.1` | Hand-drawn-style highlights for key concepts |

### Design System Patterns (from Blueprint CSS)

- **Cards** — Elevated interactive containers
    - Background: `--surface-elevated` (white)
    - Border: `1px solid --ink-separator-light`
    - Radius: `--radius-md` (14px)
    - Shadow: `--shadow-sm` at rest → `--shadow-lg` on hover
    - Hover: border turns `--braun-orange`, `translateY(-1px)`
    - Transition: `--transition-max` (150ms)
    - Internal structure: `.card-tag` (mono 9px uppercase label) → `h3` (17px 700) → `p` (13.5px)
- **Eyebrow Labels** — Section identifiers
    - Font: `--font-mono`, 10px, weight 500
    - Color: `--braun-orange` (primary accent)
    - Letter-spacing: 0.18em, uppercase
    - Preceded by a 14px accent bar (`::before`)
- **Pull Quotes** — Highlighted text blocks
    - Background: `--surface-elevated`
    - Left accent bar: 4px `--braun-orange`
    - Border: `1px solid --ink-separator-light`
    - Radius: `--radius-md`
    - Text: `clamp(16px, 1.6vw, 19px)`, weight 500, italic
    - Citation: mono 10px, uppercase, `--braun-orange`
- **Mentor Callouts** — Contextual guidance blocks
    - Background: `--braun-orange-light` (blue-50)
    - Border: `1px solid --braun-orange-tint-2`
    - Left accent bar: 4px `--braun-orange`
    - Icon: 20px weight 800, `--braun-orange`
    - Text: 13.5px, `--ink-secondary`
- **Stat Cells** — Large metric displays
    - Value: 38–56px, weight 800, `--braun-orange`, letter-spacing -0.03em
    - Label: mono 9px, weight 500, `--ink-quaternary`, uppercase
    - Used in bordered grid layouts with 1px gap
- **Step Flows** — Sequential process visualization
    - Grid: `44px (indicator) | 1fr (content)`
    - Step dot: 28px circle, 2px `--ink-separator` border, mono 11px number
    - Connecting line: 1px `--ink-separator-light` (hidden on last step)
    - Title: 14px 700, `--ink-primary`
    - Description: 13px 400, `--ink-tertiary`, max-width 540px
- **Node Tags** — Heatmap status indicators
    - Inline-flex pill with 6px dot + mono 10px label
    - Red: `--braun-red` text on `--braun-red-tint` bg
    - Amber: `--braun-amber` text on `--braun-amber-tint` bg
    - Green: `--braun-green` text on `--braun-green-tint` bg
    - Grey: `--braun-grey` text on `--braun-grey-tint` bg
- **Phase Cards** — GTM phase blocks
    - Grid: `60px (badge) | 1fr`
    - Badge: 48px square, 2px `--ink-primary` border, `--radius-sm`
    - Hover: border → `--braun-orange`, shadow → `--shadow-md`
    - KPI block: `--surface-tertiary` bg, mono 10px, accent `--braun-orange`

---

## 📱 Layout Patterns

### Wiki Reading Mode

- Centered content column (max 65–75 char width / 640px)
- Sticky breadcrumbs (top)
- Sticky Table of Contents (right sidebar) — highlights active section on scroll
- **Zen Mode:** Collapses left nav + right sidebar, centering text column

### Quiz Interface

- **Camp Mode:** Single question card, green/red instant feedback, expandable rationale below
- **Storm Mode:** Question card + sticky timer bar (top), flag toggle (corner), question grid (bottom drawer)
- Strike-through on right-click/long-press for option elimination

### Dashboard

- Full-width taxonomy heatmap (macro view)
- Click-to-expand node inspector (side panel)
- Pacing gauge and progression charts (Recharts)

### 3D Lab

- Full-canvas 3D viewport (React Three Fiber)
- Floating control panel overlay (sliders, inputs)
- Contextual hotspot tooltips
- Bottom slider for X-Ray/Cutaway modifiers

---

## 🎛️ Scrollbar & Selection

```css
/* Scrollbar — thin, invisible track */
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--ink-separator); border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: var(--ink-quaternary); }

/* Text selection */
::selection { background: var(--braun-orange-tint-2); color: var(--ink-primary); }
```

---

## 🏗️ Dark Section Pattern

Some sections (e.g., Manifesto, Footer) use the inverted dark treatment within the light-mode page:

- Background: `--surface-dark` (`#18181B`)
- Eyebrow text: `rgba(255, 255, 255, 0.35)`
- Title: `#FFFFFF`
- Body text: `rgba(255, 255, 255, 0.75)`
- Accent emphasis (`<em>`): `--braun-orange`
- Pull quote: `#FFFFFF`, weight 700, left border `--braun-orange`
- Footer tagline: `rgba(255, 255, 255, 0.35)` italic
- Footer meta: `rgba(255, 255, 255, 0.2)` mono

---

## ✅ Design System Checklist

| **Rule** | **Standard** |
| --- | --- |
| Primary theme | Light mode (Tailwind Zinc whites + aluminum grays) |
| Dark mode | Supported via `next-themes`, not default |
| Pure black/white | Never used for backgrounds — always use tokens |
| Color usage | Functional only — every color carries semantic meaning |
| Max transition | 150ms for all standard UI interactions |
| Typography rendering | Antialiased on all platforms |
| Prose max-width | 640px (65–75 characters) |
| Gamification elements | Forbidden — no confetti, badges, streaks, or leaderboards |
| Decorative animation | Forbidden — motion must serve a functional purpose |
| Responsive breakpoint | 1024px — sidebar collapses, grids stack |