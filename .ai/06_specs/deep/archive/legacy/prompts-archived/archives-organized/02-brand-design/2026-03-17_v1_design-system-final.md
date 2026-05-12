# SlateCamp Design System
## The Definitive Visual Language — Extracted from the Live Product

*Source of truth. Every design decision in the app references this document.*

---

## IDENTITY

**SlateCamp** is a Licensure Exam preparation platform for Philippine licensure exams. The design language communicates: precision, confidence, and warmth. It borrows from editorial design (bold typography, asymmetric layouts), data dashboards (clean grids, honest numbers), and architectural drawing (structured, spatial, geometric).

The visual personality is: **"A well-designed textbook that feels alive."** Academic seriousness meets modern editorial energy. Never corporate. Never gamified. Never generic SaaS.

---

## 1. COLOR SYSTEM

### 1.1 Primary Palette

| Token | Name | Hex | RGB | Usage |
|---|---|---|---|---|
| `--sc-cobalt` | **Cobalt Blue** | `#1B3FC4` | 27, 63, 196 | Primary buttons, links, active states, CTAs, nav highlights. THE brand color. |
| `--sc-cobalt-light` | Cobalt Light | `#EEF2FC` | 238, 242, 252 | Active item backgrounds, tag fills, hover tints, selected states |
| `--sc-cobalt-dark` | Cobalt Dark | `#1535A8` | 21, 53, 168 | Button hover, pressed states, gradient endpoints |

### 1.2 Accent Palette

| Token | Name | Hex | RGB | Usage |
|---|---|---|---|---|
| `--sc-gold` | **Signal Gold** | `#F5A623` | 245, 166, 35 | High-energy accent. Section backgrounds (Wiki), highlight moments, warm callouts. The "campfire" warmth. |
| `--sc-red` | **Signal Red** | `#E63329` | 230, 51, 41 | Readiness bars (low), incorrect answers, danger states, at-risk indicators. Never decorative — always carries data meaning. |
| `--sc-green` | **Signal Green** | `#1B7A3C` | 27, 122, 60 | Success, "Live" badges, correct answers, mastered states, passing readiness |
| `--sc-orange` | **Camp Orange** | `#E8853A` | 232, 133, 58 | Secondary warm accent. Progress indicators, developing states, gentle attention. |

### 1.3 Neutral Palette

| Token | Name | Hex | RGB | Usage |
|---|---|---|---|---|
| `--sc-cream` | **Cream** | `#F2F0EB` | 242, 240, 235 | Alternating section backgrounds, sidebar surfaces, subtle warmth layer |
| `--sc-cream-light` | Cream Light | `#FFFDF7` | 255, 253, 247 | Dashboard mockup backgrounds, elevated warm surfaces |
| `--sc-cream-warm` | Cream Warm | `#F8F7F5` | 248, 247, 245 | Page body background (via CSS variable) |
| `--sc-white` | White | `#FFFFFF` | 255, 255, 255 | Cards, modals, input backgrounds, popovers |
| `--sc-border` | Border | `#E8E4DC` | 232, 228, 220 | Card borders, dividers, input borders (warm-toned, not cold gray) |
| `--sc-border-light` | Border Light | `#D4DAE3` | 212, 218, 227 | Subtle dividers, secondary borders |

### 1.4 Ink (Text) Palette

| Token | Name | Hex | RGB | Usage |
|---|---|---|---|---|
| `--sc-ink` | **Ink** | `#1A2332` | 26, 35, 50 | Primary text, headings, body copy |
| `--sc-ink-dark` | Ink Dark | `#111111` | 17, 17, 17 | Dark section backgrounds, maximum contrast headlines |
| `--sc-ink-mid` | Ink Mid | `#555555` | 85, 85, 85 | Secondary body text, descriptions |
| `--sc-ink-light` | Ink Light | `#6B6B6B` | 107, 107, 107 | Tertiary text, labels, section eyebrows |
| `--sc-ink-muted` | Ink Muted | `#888888` | 136, 136, 136 | Timestamps, metadata, placeholder text |
| `--sc-ink-ghost` | Ink Ghost | `#9CA3AF` | 156, 163, 175 | Disabled text, ghost elements |

### 1.5 Color Roles

```
PRIMARY ACTION     →  Cobalt Blue #1B3FC4
SECONDARY ACTION   →  Cream #F2F0EB border + Ink text
DESTRUCTIVE        →  Signal Red #E63329
SUCCESS            →  Signal Green #1B7A3C
WARNING/PROGRESS   →  Camp Orange #E8853A / Signal Gold #F5A623
INFORMATION        →  Cobalt Light #EEF2FC

PAGE BACKGROUND    →  Cream Warm #F8F7F5
CARD SURFACE       →  White #FFFFFF
ALT SECTION BG     →  Cream #F2F0EB
DARK SECTION BG    →  Ink Dark #111111
ACCENT SECTION BG  →  Signal Gold #F5A623 (rare — Wiki section, max 1 per page)
```

### 1.6 Color Rules

1. **Cobalt Blue is the only CTA color.** No other color appears on primary buttons.
2. **Signal Gold is a section color, not a button color.** It fills backgrounds for warmth (like the Wiki section) but never goes on buttons or interactive elements.
3. **Signal Red is data-only.** It appears on readiness bars, heatmap cells, and error states. NEVER decorative.
4. **Signal Green is earned.** It only appears to confirm something positive: correct answer, live status, passing readiness.
5. **Cream (#F2F0EB) is the alternating section color.** It creates rhythm between white and warm sections. The page "breathes."
6. **Dark sections (#111111) are rare.** Maximum one per page (the 3D Lab section). They create dramatic contrast.
7. **The Gold section (#F5A623) is the signature move.** Maximum one per page. It's the moment people remember.

---

## 2. TYPOGRAPHY

### 2.1 Font Stack

| Token | Font Family | Source | Role |
|---|---|---|---|
| `--font-display` | **Syne** | Google Fonts | Section headings, feature titles, big statements, expressive type. Weight 700-800. The "personality" font — bold, geometric, slightly funky. |
| `--font-hero` | **Geist Sans** | Next.js built-in | Hero H1 only. Weight 700. Tight tracking. Used for the single biggest headline on a page. |
| `--font-body` | **Inter** | System / Google | Body text, UI text, descriptions, paragraphs, buttons, inputs. Weight 400-600. The "workhorse." |
| `--font-mono` | **DM Mono** | Google Fonts | Category labels, eyebrows, technical identifiers, code references, metadata. Weight 400-500. Always uppercase with wide tracking for labels. |
| `--font-serif` | **Instrument Serif** | Google Fonts | Decorative quotes and editorial moments only. Italic. Extremely rare — one or two uses per page max. |

### 2.2 Type Scale

| Level | Font | Size | Weight | Tracking | Line Height | Usage |
|---|---|---|---|---|---|---|
| Hero | Geist Sans | 72-90px | 700 | -3% | 0.92 | Page hero headlines (one per page) |
| Display | Syne | 34px | 800 | -1.5% | 1.15 | Section headings (H2) |
| Title | Syne | 22-28px | 800 | -1% | 1.2 | Feature titles, subsection headings (H3) |
| Subtitle | Syne | 19px | 700 | normal | 1.4 | Feature subtitles, pull quotes |
| Stat | Syne | 56-72px | 800 | -2% | 1.0 | Big numbers ("1 in 3", "42%") |
| Body Large | Inter | 16-17px | 400 | normal | 1.65 | Lead paragraphs, descriptions |
| Body | Inter | 14-15px | 400 | normal | 1.6 | Standard body text |
| Body Small | Inter | 13px | 400-500 | normal | 1.5 | Card body, secondary text |
| Caption | Inter | 12px | 500 | normal | 1.4 | Small labels, timestamps |
| Eyebrow | DM Mono | 11px | 400-500 | 0.2em | 1.5 | Section eyebrows (uppercase), tag text |
| Micro Label | DM Mono | 9-10px | 400 | 0.15em | 1.4 | Feature card category labels (uppercase) |
| Quote | Instrument Serif | 12px | 400 italic | normal | 1.5 | Footer tagline, rare decorative quotes |

### 2.3 Typography Rules

1. **Syne is for headings and statements ONLY.** Never for body text, buttons, or UI. It's the "voice" of SlateCamp — when Syne appears, the platform is SPEAKING.
2. **Inter is for everything functional.** Buttons, inputs, descriptions, paragraphs, navigation, labels (non-eyebrow). When the user is READING or INTERACTING, they see Inter.
3. **DM Mono at 9-11px uppercase is the eyebrow/label system.** It signals "category" or "metadata." Always uppercase, always tracked. It creates the editorial "magazine" feel.
4. **Geist Sans is sacred to the hero.** One H1 per page. 72-90px. Tight tracking. This is the "main event" typography. If more than one element uses Geist at hero scale, the hierarchy is broken.
5. **Instrument Serif is the whisper.** One or two uses per page maximum. Always italic. It's the quiet, human moment in an otherwise structured page — like a handwritten note in the margin.
6. **Minimum readable size: 11px** for DM Mono labels. **9px is permitted ONLY for the scrolling feature card labels** (they're tiny by design — the motion carries legibility).
7. **Stat numbers (Syne 56-72px) are for data that shocks.** "1 in 3" or "42%" — these are designed to make people stop scrolling. Use sparingly (max 2-3 per page).

---

## 3. SPACING & LAYOUT

### 3.1 Spacing Scale

| Token | Value | Usage |
|---|---|---|
| `--space-1` | 4px | Micro gaps, inline spacing |
| `--space-2` | 8px | Tight padding, icon gaps, tag padding |
| `--space-3` | 12px | Default gap between related elements |
| `--space-4` | 16px | Card padding, list gaps |
| `--space-5` | 20px | Generous card padding |
| `--space-6` | 24px | Section internal gaps |
| `--space-8` | 32px | Between card groups |
| `--space-10` | 40px | Section top/bottom padding (small) |
| `--space-16` | 64px | Section top/bottom padding (standard) |
| `--space-20` | 80px | Section top/bottom padding (generous) |

### 3.2 Container

```
Max width:       1200px (content), 1400px (full bleed with padding)
Horizontal pad:  24px (mobile), 40px (tablet), 64px (desktop)
```

### 3.3 Section Rhythm

Landing page sections alternate between background colors to create visual rhythm:

```
Hero        →  transparent / warm cream overlay
Trust bar   →  cream #F2F0EB (80% opacity)
Features    →  transparent (white)
Questions   →  cream #F2F0EB
3D Lab      →  dark #111111
Analytics   →  cream #F2F0EB
Wiki        →  gold #F5A623  ← SIGNATURE MOMENT
How it works →  transparent
Comparison  →  transparent
Testimonials →  transparent
Final CTA   →  transparent
Footer      →  cream #F2F0EB (dark text)
```

---

## 4. BORDER RADIUS

| Token | Value | Usage |
|---|---|---|
| `--radius-sm` | 4px | Small tags, micro badges |
| `--radius-md` | 6px | Buttons, input fields, small cards |
| `--radius-lg` | 8px | Standard cards, containers |
| `--radius-xl` | 10-12px | Feature cards, modals, elevated containers |
| `--radius-full` | 9999px | Pills, badges, avatar circles |

### Radius Rules
1. **Buttons: 6px** (`rounded-md`). Always. No pill buttons except tags.
2. **Cards: 8-12px** depending on elevation. Higher elevation = larger radius.
3. **Tags/pills: full** (9999px).
4. **Inputs: 6px** matching buttons.
5. **No rounded-2xl or rounded-3xl** anywhere in the product.

---

## 5. SHADOWS & ELEVATION

| Token | Value | Usage |
|---|---|---|
| `--shadow-none` | none | Default resting state |
| `--shadow-xs` | `0 1px 2px rgba(0,0,0,0.04)` | Subtle card edges |
| `--shadow-sm` | `0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)` | Card hover |
| `--shadow-md` | `0 4px 12px rgba(0,0,0,0.08)` | Dropdowns, popovers |
| `--shadow-lg` | `0 10px 30px rgba(0,0,0,0.1)` | Modals, floating panels |
| `--shadow-xl` | `0 20px 50px rgba(0,0,0,0.12)` | Hero product preview (landing page only) |

### Shadow Rules
1. **No shadow at rest.** Cards, buttons, containers are flat until hovered or elevated.
2. **Shadow-sm on hover.** Interactive cards gain subtle depth on mouseover.
3. **Shadow-xl is for the landing page product showcase only.** It creates the "premium demo" effect.
4. **Dark sections don't use shadows.** Against dark backgrounds, use border-white/10 instead.

---

## 6. TRANSITIONS & ANIMATION

| Property | Duration | Easing | Usage |
|---|---|---|---|
| Color/background | 150ms | ease-out | Button hover, link hover, active states |
| Transform (scale) | 150ms | ease-out | Card hover lift, button press |
| Opacity | 200ms | ease-out | Fade in/out, section reveals |
| Width/height | 200ms | ease-out | Sidebar collapse, panel expand |
| All (complex) | 300ms | ease-out | Maximum for any transition |

### Animation Rules
1. **Maximum 300ms.** Nothing in SlateCamp animates longer than 300ms.
2. **No bounce, spring, or overshoot.** This is a professional tool. Animations are crisp and immediate.
3. **ease-out for enter, ease-in for exit.** Elements arrive confidently and leave quickly.
4. **Scroll-triggered entrances: 400ms ease-out.** Sections fade up 12px as they enter the viewport.
5. **`prefers-reduced-motion` disables everything.** All animations wrapped in media query check.

---

## 7. COMPONENT PATTERNS

### 7.1 Buttons

```
PRIMARY:
  bg: Cobalt #1B3FC4
  text: White
  radius: 6px
  padding: 10px 20px (standard), 14px 28px (large/CTA)
  font: Inter, 14-15px, weight 500
  hover: Cobalt Dark #1535A8

SECONDARY (Ghost):
  bg: transparent
  border: 1px solid #E8E4DC
  text: Ink #1A2332
  hover: bg cream #F2F0EB

GHOST TEXT:
  bg: transparent
  text: Cobalt #1B3FC4
  hover: Cobalt Light bg #EEF2FC

DANGER:
  bg: transparent
  border: 1px solid #E63329
  text: #E63329
```

### 7.2 Cards

```
STANDARD CARD:
  bg: White
  border: 1px solid #E8E4DC
  radius: 8-12px
  padding: 16-24px
  shadow: none (resting), shadow-sm (hover)

DARK CARD (on dark bg):
  bg: white/5
  border: 1px solid white/10
  radius: 8-12px

GOLD CARD (on gold bg):
  bg: white/90
  radius: 8-12px
  border: none
```

### 7.3 Tags / Pills

```
CATEGORY TAG:
  font: DM Mono, 9-10px, uppercase, tracked
  bg: varies by context
  padding: 4px 10px
  radius: full

COBALT TAG:     bg: #EEF2FC, text: #1B3FC4
STATUS LIVE:    bg: green/10, text: #1B7A3C
STATUS DANGER:  bg: red/10, text: #E63329
NEUTRAL TAG:    bg: #F2F0EB, text: #555555
```

### 7.4 Readiness Score Display

```
RING:
  Track: #E8E4DC (border color)
  Arc: Dynamic color based on score
    ≥ 70%: Signal Green #1B7A3C
    40-69%: Camp Orange #E8853A
    < 40%: Signal Red #E63329
  Stroke width: 8-10px, round cap

NUMBER:
  Font: Syne, 48-56px, weight 800
  Color: matches arc color
  Animation: count-up from 0 on first view (800ms ease-out)
```

### 7.5 Section Eyebrow Pattern

```
Every section starts with:
  1. Eyebrow: DM Mono, 11px, uppercase, tracked 0.2em, color Ink Light (#6B6B6B)
     Format: "[ Category Name ]" or "Category Name"
  2. Heading: Syne, 22-34px, weight 800, color Ink (#1A2332)
  3. Description: Inter, 15-16px, weight 400, color Ink Mid (#555555)

This triad (eyebrow → heading → body) is the fundamental content block.
```

### 7.6 The Gold Section Pattern

The signature SlateCamp moment. One per page maximum.

```
Background: Signal Gold #F5A623
Text: Ink Dark #111111 (maximum contrast on gold)
Cards inside: bg white/90, no border
Heading: Syne, weight 800
Body: Inter, weight 400
Effect: Feels like the page suddenly "warms up" — creates the most
        memorable visual moment and is the screenshot students share.
```

### 7.7 The Dark Section Pattern

Maximum drama. One per page maximum.

```
Background: Ink Dark #111111
Text: White #FFFFFF
Secondary text: white/60
Cards inside: bg white/5, border white/10
Heading: Syne, weight 800, white
Tags: bg white/10, text white/80
Effect: Creates cinematic contrast. Used for the 3D Lab section
        where the dark background makes the green model pop.
```

---

## 8. ICONOGRAPHY

### Icon Library: Phosphor Icons
- **Package:** `@phosphor-icons/react`
- **Default weight:** Regular (1.5px stroke)
- **Emphasis weight:** Bold (active states, selected items)
- **Illustration weight:** Duotone (compositions, feature cards, empty states)
- **Size system:** xs(14), sm(18), md(20), lg(24), xl(32), 2xl(48)

### Icon Color Rules
- Default: `currentColor` (inherits parent text color)
- Active: `#1B3FC4` (Cobalt)
- Success: `#1B7A3C`
- Danger: `#E63329`
- Muted: `#888888`
- On dark backgrounds: `#FFFFFF` or `white/60`

---

## 9. DARK MODE (FUTURE)

Not a launch priority, but the system inverts cleanly:

| Token | Light | Dark |
|---|---|---|
| Page bg | #F8F7F5 | #111111 |
| Card bg | #FFFFFF | #1A1A1A |
| Ink | #1A2332 | #E8E4DC |
| Ink Mid | #555555 | #9CA3AF |
| Cobalt | #1B3FC4 | #4B6FE0 (lighter) |
| Border | #E8E4DC | #2A2A2A |
| Cream | #F2F0EB | #1A1A1A |

---

## 10. THE FIVE DESIGN RULES

These are non-negotiable. Every design decision checks against them.

### Rule 1: Syne speaks. Inter works.
If the element is SAYING something (heading, statement, big number) → Syne.
If the element is DOING something (button, input, body text, nav) → Inter.
If the element is LABELING something (category, metadata, eyebrow) → DM Mono.
If the element is WHISPERING something (rare editorial quote) → Instrument Serif.
Mixing these roles breaks the hierarchy.

### Rule 2: One gold section. One dark section. Per page.
The gold section (#F5A623) is the visual climax — the moment the page "catches fire." Using it twice dilutes it. The dark section (#111111) is the dramatic pause. Using it twice is exhausting. Cream (#F2F0EB) can repeat freely — it's the neutral rhythm.

### Rule 3: Cobalt is for DOING. Red/Green are for KNOWING.
Cobalt Blue buttons make things happen (start quiz, sign up, navigate). Red and Green communicate status (readiness score, correct/incorrect, at-risk/passing). Don't put red/green on buttons. Don't put cobalt on status indicators.

### Rule 4: DM Mono uppercase = editorial signal.
When DM Mono appears in uppercase with wide tracking, it says: "this is a CATEGORY, not a sentence." It's the design equivalent of a magazine section header. Use it consistently for: section eyebrows, feature card labels, metadata tags, status indicators. Never for body text.

### Rule 5: The page breathes.
Sections alternate between white → cream → dark → gold. No two adjacent sections have the same background. The rhythm of warm/cool/dark/bright creates visual breathing room that prevents scroll fatigue.

---

## 11. CSS VARIABLE REFERENCE (Copy to globals.css)

```css
:root {
  /* Primary */
  --sc-cobalt: #1B3FC4;
  --sc-cobalt-light: #EEF2FC;
  --sc-cobalt-dark: #1535A8;

  /* Accents */
  --sc-gold: #F5A623;
  --sc-red: #E63329;
  --sc-green: #1B7A3C;
  --sc-orange: #E8853A;

  /* Neutrals */
  --sc-cream: #F2F0EB;
  --sc-cream-light: #FFFDF7;
  --sc-cream-warm: #F8F7F5;
  --sc-white: #FFFFFF;
  --sc-border: #E8E4DC;
  --sc-border-light: #D4DAE3;

  /* Ink */
  --sc-ink: #1A2332;
  --sc-ink-dark: #111111;
  --sc-ink-mid: #555555;
  --sc-ink-light: #6B6B6B;
  --sc-ink-muted: #888888;
  --sc-ink-ghost: #9CA3AF;

  /* Fonts */
  --font-display: 'Syne', sans-serif;
  --font-hero: '__GeistSans', sans-serif;
  --font-body: 'Inter', sans-serif;
  --font-mono: 'DM Mono', monospace;
  --font-serif: 'Instrument Serif', serif;

  /* Gradients */
  --grad-slate: linear-gradient(135deg, #1B3FC4 0%, #1535A8 100%);
  --grad-warm: linear-gradient(135deg, #F8F7F5 0%, #FEF5ED 100%);
  --grad-dark: linear-gradient(180deg, #1A2332 0%, #111111 100%);

  /* Radii */
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
  --radius-xl: 12px;
  --radius-full: 9999px;
}
```

---

## 12. APPLYING THIS SYSTEM TO THE DASHBOARD

The landing page IS the design direction. The dashboard and all internal pages must adopt the same language:

| Element | Dashboard Implementation |
|---|---|
| Active sidebar item | `bg-[#EEF2FC] text-[#1B3FC4] font-medium` (Cobalt Light bg + Cobalt text) |
| Sidebar default | `text-[#555555] hover:bg-[#EEF2FC]/50 hover:text-[#1B3FC4]` |
| Page background | `bg-[#F8F7F5]` (Cream Warm) |
| Cards | `bg-white border border-[#E8E4DC] rounded-lg` (8px radius) |
| Primary buttons | `bg-[#1B3FC4] text-white rounded-md` (6px) |
| Section headers | Syne, 22px, weight 800 |
| Body text | Inter, 14px, weight 400 |
| Eyebrow labels | DM Mono, 11px, uppercase, tracking 0.2em |
| Readiness Score | Syne, 48px, dynamic color (green/orange/red) |
| Heatmap mastered | `bg-[#1B7A3C]` |
| Heatmap developing | `bg-[#E8853A]` |
| Heatmap critical | `bg-[#E63329]` |
| Heatmap unexplored | `bg-[#E8E4DC]` |

---

*This document is the single source of truth for all SlateCamp visual decisions. When in doubt, reference the landing page — it is the gold standard.*


