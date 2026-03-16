# SlateCamp Design System Overhaul — Master Execution Prompt
## GitHub Primer × Apple HIG × Educational Psychology Hybrid

---

## ROLE

You are simultaneously:

1. **Elite Design Systems Architect** — You have built and maintained design systems at scale. You understand that a design system is not a style guide — it is a CONTRACT between the codebase and the user's brain. Every CSS variable, every border radius, every color token must be intentional, consistent, and documented. You don't "make things look nice" — you engineer visual consistency at the token level so that 50 different components across 20 pages all feel like they belong to the same product.

2. **GitHub Primer Design System Expert** — You have studied GitHub's Primer system deeply. You understand its core philosophy: manage complexity through structure, not decoration. Primer uses crisp 1px borders (not heavy shadows) to create visual boundaries. It uses an extremely specific neutral color scale for backgrounds and borders. Its border radii are consistent (6px default). Its typography is clean and hierarchical without being flashy. Primer handles DENSE information (code, issues, PRs, file trees) without overwhelming the user — exactly what an EdTech analytics dashboard needs to do.

3. **Apple Human Interface Guidelines (HIG) Specialist** — You understand Apple's complementary approach: typographic warmth through weight contrast (ultralight titles vs. medium body), spatial hierarchy through generous padding and whitespace, subtle depth through layered translucency and shadow (not flat, not skeuomorphic — the "in between"), and color restraint with strategic accent use. Apple's approach prevents interfaces from feeling clinical or sterile — it adds WARMTH to structure.

4. **Educational UX Psychologist** — You are deeply versed in Cognitive Load Theory (Sweller), Visual Attention research (Ware, 2012), the Aesthetic-Usability Effect (Tractinsky et al., 2000), and Interface Fatigue research. You know that:
   - **Too flat/clinical** → "Hospital UI" → students feel surveilled, not supported → reduced engagement
   - **Too decorative/colorful** → visual noise → increased extraneous cognitive load → reduced learning
   - **The sweet spot** → structured enough to manage complexity, warm enough to feel inviting, quiet enough to let content breathe

---

## TASK

Conduct a comprehensive global design system overhaul for all SlateCamp pages and components within the `/dashboard` route group. Shift the visual language from the current flat/utilitarian aesthetic to a premium **GitHub Primer × Apple HIG hybrid** that is optimized for educational contexts.

**What this means concretely:**

From GitHub Primer, take:
- Crisp, subtle 1px borders as the primary method of visual separation (NOT shadows, NOT background contrast alone)
- Consistent border colors from a specific neutral scale (GitHub uses `#d0d7de` in light mode — we'll map this to our Tailwind scale)
- Uniform border radius (6px — GitHub's default `rounded-md`)
- Structured, data-dense-friendly layouts that handle complexity without visual chaos
- Functional color system: neutrals for structure, accent color (our blue) ONLY for interactive/focal elements
- Minimal shadow use — shadows only for elevated layers (popovers, modals, dropdowns), never for cards at rest

From Apple HIG, take:
- Typographic warmth: high contrast between heading weights (bold/semibold titles) and body text (regular/medium)
- Spatial generosity: slightly more internal padding than pure GitHub (which can feel cramped for learning)
- Subtle depth cues: very faint hover shadows or background shifts on interactive cards (not flat dead surfaces)
- Color temperature: slightly warmer neutrals than pure GitHub gray (GitHub can feel cold; we warm it up 5%)
- Transition smoothness: 150-200ms ease transitions on interactive state changes

For Educational Context, ensure:
- The interface reduces extraneous cognitive load (visual noise → 0)
- Brand blue (`blue-600` primary) is used STRICTLY for interactive focal points and current-state indicators — never decoratively
- No more than 2-3 colors on screen at any time outside of data visualizations
- Text is highly legible: minimum 14px body text, adequate line height (1.5-1.6 for body), high contrast ratios
- Cards and sections have consistent, predictable visual patterns — the student's brain should NEVER have to "learn" a new card style mid-page
- The interface feels professional and trustworthy (this is exam prep, not a toy)

**CRITICAL CONSTRAINT: LAYOUT PRESERVATION**
The existing CSS Grid architecture (`grid-cols-*`, `col-span-*`, `gap-*`, `flex-1`, `items-stretch`) has been carefully engineered. **DO NOT** change any layout-structural classes. This overhaul is STRICTLY about surface aesthetics: borders, border-radius, colors, backgrounds, shadows, typography, padding refinement, and hover/focus states. If you change a `grid-cols-10` to `grid-cols-12`, you have broken the contract.

---

## CONTEXT

### Technical Environment
- **Framework:** Next.js (App Router), React, TypeScript
- **Styling:** Tailwind CSS
- **Component Library:** Shadcn UI (Card, Button, Popover, etc.)
- **Charting:** Recharts
- **Icons:** Lucide React
- **Current State:** Flat, utilitarian design. `rounded-sm` borders, `border-zinc-200` colors, `shadow-none` on cards, `p-2` padding. Typography uses very small sizes (`text-[9px]`, `text-[10px]`, `text-[11px]`).

### Current Design System Patterns (What You're Replacing)
Based on the actual codebase:

| Element | Current Value | Issue |
|---------|-------------|-------|
| Card border radius | `rounded-sm` (2px) | Too sharp — feels utilitarian, not premium |
| Card border color | `border-zinc-200` | Decent but inconsistent — some cards omit borders |
| Card shadow | `shadow-none` everywhere | Too flat — no depth hierarchy at all |
| Card padding | `p-2` (8px) | Slightly cramped for educational content |
| Card background | `bg-white` | Fine but no muted/subtle variants for nested content |
| Button style | Mixed — some `variant='ghost'`, some `variant='outline'` | Inconsistent hierarchy |
| Primary CTA color | Blue (`bg-blue-600`) | Good — preserve this |
| Typography sizes | `text-[9px]` through `text-[16px]` arbitrary | Too small for comfortable reading; inconsistent scale |
| Typography weight | Heavy use of `font-bold` at small sizes | Overuse of bold reduces its effectiveness |
| Label style | `text-[9px] font-bold uppercase tracking-wider` | Distinctive but some labels are too small to read comfortably |
| Hover states | `hover:border-blue-200 hover:bg-blue-50/20` | Decent but inconsistent across components |
| Info popovers | Custom `RichInfoPopover` component | Needs design update to match new system |
| Charts | Custom Recharts configs | Grid/axis styling needs alignment with new system |

### Tools You MUST Use
- **File System Tools** — Read `tailwind.config.ts`, `globals.css`, and ALL Shadcn base components (`components/ui/card.tsx`, `button.tsx`, `popover.tsx`, etc.). Read the actual dashboard components to understand current class usage patterns. Map every unique design token currently in use.
- **Supabase MCP** — Not primary for this task, but verify if any component styling depends on data state (e.g., score-based color coding).
- **`.claude/docs`, `.claude/skills`, `.claude/agents`** — Check and use.

---

## THE DESIGN PSYCHOLOGY MANDATE

### 1. The Aesthetic-Usability Effect (Tractinsky et al., 2000; Kurosu & Kashimura, 1995)
Users perceive aesthetically pleasing interfaces as more usable, even when they're not. This is not vanity — it's a cognitive bias that directly impacts learning outcomes. A premium-feeling interface increases student trust, engagement, and willingness to persist through difficult content.

**Practical implication:** The upgrade from flat/utilitarian to GitHub+Apple hybrid isn't decorative — it's functional. Students will PERCEIVE the upgraded interface as easier to use, which reduces anxiety and increases study session duration.

### 2. Visual Hierarchy & Attention Management (Ware, 2012)
The human visual system processes spatial layout pre-attentively (before conscious thought). Clear visual hierarchy — established through borders, spacing, size, weight, and color — guides the eye without requiring cognitive effort.

**Practical implications:**
- Use BORDER to create structure (GitHub approach) — borders are pre-attentive separators
- Use TYPOGRAPHY WEIGHT to create hierarchy (Apple approach) — bold/regular contrast is pre-attentive
- Use COLOR sparingly and strategically — color is the strongest pre-attentive signal; overuse destroys its power
- Use WHITESPACE to group related content and separate unrelated content (Gestalt proximity principle)

### 3. Interface Fatigue During Extended Study Sessions (Baumeister, 2002)
Students spend 30-90 minutes per session on the platform. Visual monotony (everything looks the same) causes fatigue. Visual chaos (everything looks different) causes fatigue. The sweet spot is STRUCTURED VARIETY — consistent patterns with subtle variation.

**Practical implications:**
- Cards should have a consistent border/radius/shadow treatment BUT vary in internal content layout
- Use the off-white muted background (`bg-gray-50` or similar) for NESTED or secondary areas, creating subtle depth without shadows
- Hover states should provide gentle visual feedback (card "lifts" slightly) — breaks monotony without adding noise
- The overall palette should feel WARM — not hospital-white, not developer-gray

### 4. Color Restraint in Learning Environments (Plass et al., 2014)
Research on multimedia learning environments shows that warm, limited color palettes improve learning outcomes compared to cool or highly saturated palettes. Too much color competes with content for attention. Too little color makes the interface feel cold and uninviting.

**Practical implications:**
- **Neutral base:** Warm gray scale (not blue-gray, not pure gray — slightly warm)
- **Brand accent:** Blue-600 to blue-700 — used ONLY for: primary buttons, active navigation states, interactive focus rings, links, and selected/current indicators
- **Semantic accents (SPARINGLY):** Green for success/mastery, amber for attention/warning, no red except critical errors
- **Rule of thumb:** On any given screen, no more than 3 non-neutral colors should appear simultaneously (blue + at most 2 semantic colors)

### 5. Typography for Readability Under Cognitive Load (Dyson, 2004; Pelli et al., 2006)
Students reading under cognitive pressure (trying to understand exam content + navigate the interface) need MAXIMUM typographic clarity:
- Body text: minimum 14px, 1.5 line-height, medium contrast (not pure black on pure white — too harsh)
- Line length: 50-80 characters maximum for comfortable reading
- Labels: minimum 11px, uppercase tracking is fine but MUST be legible
- Headings: clear weight contrast (semibold or bold), not just size change

**Practical implications:**
- Increase the minimum text size from `text-[9px]` to `text-[11px]` for labels
- Increase body text from `text-[10px]`/`text-[11px]` to `text-[13px]`/`text-sm`
- Use `text-zinc-900` for primary text (not pure black), `text-zinc-500` for secondary (matching GitHub)
- Ensure all text meets WCAG AA contrast ratios against its background

---

## THE GITHUB PRIMER TOKEN MAP (Your North Star Reference)

These are the actual design values from GitHub's Primer system, translated to Tailwind equivalents. Use these as your foundation, adjusted for our blue brand color:

### Border System
| GitHub Primer Token | Value | Tailwind Equivalent | Usage |
|-------------------|-------|-------------------|-------|
| `borderColor-default` | `#d0d7de` | `border-gray-300` or custom `border-[#d0d7de]` | Default card/container borders |
| `borderColor-muted` | `#d8dee4` | `border-gray-200` | Subtle internal dividers |
| `borderColor-emphasis` | `#636c76` | `border-gray-500` | High-emphasis borders (rare) |
| `borderColor-accent` | Our blue-600 | `border-blue-600` | Active/selected state borders |
| Border width | `1px` | `border` (default) | Always 1px, never 2px+ except focus rings |
| Border radius | `6px` | `rounded-md` | Default for all containers. `rounded-lg` (8px) for larger containers/modals only |

### Background System
| GitHub Primer Token | Value | Tailwind Equivalent | Usage |
|-------------------|-------|-------------------|-------|
| `bgColor-default` | `#ffffff` | `bg-white` | Page-level and primary card backgrounds |
| `bgColor-muted` | `#f6f8fa` | `bg-gray-50` or custom `bg-[#f6f8fa]` | Nested areas, secondary surfaces, table headers |
| `bgColor-inset` | `#eff2f5` | `bg-gray-100` | Deeply nested areas, code blocks, input backgrounds |
| `bgColor-accent-muted` | Our blue tint | `bg-blue-50` | Subtle accent backgrounds (selected items, active tabs) |
| `bgColor-emphasis` | Our blue-600 | `bg-blue-600` | Primary buttons, emphasis badges |

### Typography System
| Element | GitHub Value | Tailwind Equivalent |
|---------|------------|-------------------|
| Body text | 14px, #1f2328, regular (400) | `text-sm text-gray-900 font-normal` |
| Secondary text | 12px, #656d76, regular | `text-xs text-gray-500 font-normal` |
| Labels/Metadata | 12px, #656d76, semibold, uppercase (optional) | `text-xs text-gray-500 font-semibold` |
| Card titles | 14px-16px, #1f2328, semibold (600) | `text-sm/text-base text-gray-900 font-semibold` |
| Page headings | 20px-24px, #1f2328, semibold | `text-xl/text-2xl text-gray-900 font-semibold` |

### Shadow System
| Level | GitHub Value | Tailwind Equivalent | Usage |
|-------|------------|-------------------|-------|
| Rest (cards) | `none` or `0 1px 0 rgba(31,35,40,0.04)` | `shadow-none` or `shadow-[0_1px_0_rgba(31,35,40,0.04)]` | Cards at rest — borderline invisible shadow |
| Hover (interactive cards) | `0 1px 3px rgba(31,35,40,0.12)` | `shadow-sm` | Interactive cards on hover |
| Elevated (popovers, dropdowns) | `0 8px 24px rgba(140,149,159,0.2)` | `shadow-lg` | Overlays, modals, popovers |
| Focus ring | `0 0 0 3px rgba(our-blue, 0.3)` | `ring-3 ring-blue-500/30` | Focus states on interactive elements |

### Spacing Adjustments (Apple HIG Warmth Layer)
| Element | Pure GitHub | Our Adjusted Value | Rationale |
|---------|-----------|-------------------|-----------|
| Card internal padding | 12px-16px | 16px (`p-4`) | Educational content needs breathing room |
| Card header padding | 8px-12px | 12px-16px (`px-4 py-3`) | Title area gets slightly more space |
| Grid gap | 8px | 8px (`gap-2`) — PRESERVE | Layout structure is correct |
| Section spacing | 16px | 24px (`space-y-6` between major sections) | Apple-style generous vertical rhythm |
| Metric card padding | 8px (`p-2`) | 12px (`p-3`) | Small cards still need readability |

---

## TOKEN CONSERVATION & EXECUTION CONSTRAINTS

**CRITICAL: You will run out of tokens if you are not disciplined.**

1. **No verbose preambles.** Audit files, then immediately present findings. No "I'm going to start by..."
2. **No full file rewrites.** Use surgical diffs — show only changed lines with ±3 lines of context. If changing `rounded-sm` to `rounded-md` across a file, show the pattern once and list all instances.
3. **Batch class changes.** If the same change applies to 10 components (e.g., `rounded-sm` → `rounded-md`), present it as a find-and-replace pattern, not 10 individual diffs.
4. **No layout changes.** If you find yourself editing `grid-cols-*`, `col-span-*`, `gap-*`, `flex-*`, or `items-stretch` — STOP. You are violating the constraint.
5. **Cascade from tokens down.** Change CSS variables first, then Shadcn base components, then page-level components. This order means each phase automatically cascades changes to downstream consumers.
6. **Reuse over reinvent.** If Shadcn already has a token or variant that matches, use it. Don't create custom classes when Tailwind has built-in equivalents.

---

## PHASED EXECUTION PLAN

Follow strictly. Each phase cascades into the next. **Do NOT skip. Do NOT change layout.**

---

### PHASE 1: Global Theme & Configuration Audit

**Objective:** Map every design token currently in use and produce the exact specification for the new token system.

**Step 1.1 — Read Configuration Files**
- Read `tailwind.config.ts` — Map all custom colors, border radii, shadows, fonts, spacing overrides
- Read `globals.css` or `app/globals.css` — Map all CSS variables (especially Shadcn's `--radius`, `--border`, `--background`, `--foreground`, `--primary`, `--muted`, etc.)
- Read any theme configuration files

**Step 1.2 — Read Shadcn Base Components**
- Read `components/ui/card.tsx` — Current border, radius, shadow, padding classes
- Read `components/ui/button.tsx` — Current variant styles, colors, sizes
- Read `components/ui/popover.tsx` — Current overlay styles
- Read any other `components/ui/` files that define base visual styles

**Step 1.3 — Read Dashboard Components**
- Read ALL components in the dashboard/analytics component directories
- Catalog every unique Tailwind class related to: borders, border-radius, shadows, backgrounds, text colors, text sizes, padding, hover states
- Identify inconsistencies (e.g., some cards use `rounded-sm`, others use `rounded-lg`)

**Step 1.4 — Check .claude/docs, .claude/skills, .claude/agents**

**Step 1.5 — Output: Design System Mapping**

```
## CURRENT TOKEN INVENTORY
| Token Category | Current Values in Use | Inconsistencies Found |
|---------------|---------------------|---------------------|
| Border radius | rounded-sm, rounded-lg, rounded-full | No standard default; mixed usage |
| Border color | border-zinc-200, border-zinc-50, border-blue-100 | Inconsistent; some cards borderless |
| Shadows | shadow-none, shadow-sm, shadow-xl, shadow-lg | No coherent elevation system |
| Backgrounds | bg-white, bg-zinc-50, bg-blue-50 | Inconsistent muted surfaces |
| Text sizes | text-[9px] through text-4xl | Arbitrary pixel sizes; no scale |
| Text colors | text-zinc-900, text-zinc-500, text-zinc-400 | Reasonable but inconsistent |
| Card padding | p-2 everywhere | Too cramped for educational content |
| Hover states | Mixed — some have, some don't | No consistent interactive pattern |

## PROPOSED TOKEN CHANGES
| Token | Current | New (GitHub+Apple Hybrid) | CSS Variable | Rationale |
|-------|---------|--------------------------|-------------|-----------|
| --radius | [current] | 6px (0.375rem) | --radius: 0.375rem | GitHub Primer default |
| --border | [current] | #d0d7de | --border: 208 20% 84% | GitHub border-default |
| --background | [current] | #ffffff | --background: 0 0% 100% | Preserve |
| --muted | [current] | #f6f8fa | --muted: 210 17% 98% | GitHub bgColor-muted |
| ... | ... | ... | ... | ... |

## FILES THAT NEED CHANGES
| File | Changes Required | Priority |
|------|-----------------|----------|
| globals.css | CSS variable updates | Phase 2 |
| tailwind.config.ts | Theme extensions | Phase 2 |
| components/ui/card.tsx | radius, border, shadow | Phase 3 |
| components/ui/button.tsx | radius, color states | Phase 3 |
| [dashboard components] | surface class updates | Phase 4 |
```

**STOP HERE.** Output the design system mapping and say:
> "Phase 1 Complete. I have a full inventory of current design tokens and a proposed mapping to the GitHub+Apple hybrid system. Reply 'Proceed' to execute the Global CSS and Tailwind config updates in Phase 2."

---

### PHASE 2: Foundational Theme Overhaul

**Objective:** Update the root CSS variables and Tailwind configuration. These are the FOUNDATION — everything downstream inherits from these.

**Step 2.1 — Update `globals.css`**
Modify the CSS variables in `:root` (and `.dark` if applicable) to reflect the new design system:
- `--radius` → `0.375rem` (6px — GitHub default)
- `--border` → GitHub's border-default color mapped to HSL
- `--muted` / `--muted-foreground` → GitHub's muted background and text colors
- `--primary` → Our blue-600, preserved
- `--ring` → Our blue-500/30 for focus rings
- Any additional variables needed for the shadow system

**Step 2.2 — Update `tailwind.config.ts`**
Add or modify:
- Custom color tokens if needed (e.g., `github-border`, `github-muted`)
- Border radius overrides if the default Tailwind `rounded-md` doesn't map to exactly 6px
- Box shadow presets matching the GitHub elevation system
- Typography scale adjustments if needed

**Step 2.3 — Typography Scale Definition**
Define the new type scale that replaces arbitrary pixel sizes:

| Use Case | Old | New | Tailwind Class |
|----------|-----|-----|---------------|
| Metadata labels | `text-[9px]` | 11px | `text-[11px]` or custom utility |
| Small labels | `text-[10px]` | 12px | `text-xs` |
| Body / descriptions | `text-[11px]` | 13-14px | `text-[13px]` or `text-sm` |
| Card titles | `text-[12px]` | 14px | `text-sm font-semibold` |
| Section headings | `text-[16px]` | 16-18px | `text-base`/`text-lg font-semibold` |
| Page title | various | 20-24px | `text-xl`/`text-2xl font-semibold` |
| Large metric numbers | `text-4xl` | Preserve or adjust | `text-3xl font-bold` |

**Step 2.4 — Output: Exact Code Diffs**
Provide the precise changes to `globals.css` and `tailwind.config.ts`.

**STOP HERE.** Output the code diffs and say:
> "Phase 2 Complete. The foundational theme tokens are updated. Reply 'Proceed' to refactor the base Shadcn UI components in Phase 3."

---

### PHASE 3: Base UI Component Refactor

**Objective:** Update the shared Shadcn components that ALL pages consume. Changes here cascade everywhere.

**Step 3.1 — `components/ui/card.tsx`**
Apply:
- `rounded-md` (6px) border radius — consistent with GitHub
- `border` with the new border color token
- Appropriate shadow treatment (none at rest, `shadow-sm` on hover for interactive cards)
- Internal padding update if the Card component defines default padding

**Step 3.2 — `components/ui/button.tsx`**
Apply:
- `rounded-md` (6px) border radius
- Primary variant: `bg-blue-600 hover:bg-blue-700 text-white` — clean, confident
- Outline variant: `border border-[--border] hover:bg-gray-50` — GitHub style
- Ghost variant: `hover:bg-gray-100` — subtle
- Focus ring: `focus-visible:ring-2 ring-blue-500/30 ring-offset-2`
- Size adjustments if current buttons are too small for comfortable tapping

**Step 3.3 — Other Shadcn Components**
Update any other base components used in the dashboard:
- `popover.tsx` — elevated shadow, proper radius
- `tooltip.tsx` — if used
- `input.tsx` — if used
- Any other `components/ui/` files identified in Phase 1

**Step 3.4 — `RichInfoPopover.tsx`**
Update to match new system: proper radius, shadow, typography, border.

**Step 3.5 — Output: Exact Code Diffs**
Provide precise diffs for each component.

**STOP HERE.** Output the diffs and say:
> "Phase 3 Complete. All base UI components are updated. Reply 'Proceed' to apply the design system to dashboard page components in Phase 4."

---

### PHASE 4: Dashboard & Analytics Page Surface Application

**Objective:** Apply the refined design system to all page-level and feature-specific components. SURFACE CHANGES ONLY — no layout changes.

**Step 4.1 — Systematic Class Replacement**
For EVERY dashboard and analytics component, apply these transformations:

| Find | Replace With | Notes |
|------|-------------|-------|
| `rounded-sm` | `rounded-md` | Consistent 6px radius |
| `shadow-none` (on cards) | Remove (card.tsx now handles it) | Or `shadow-[0_1px_0_rgba(31,35,40,0.04)]` for ultra-subtle |
| `shadow-xl`, `shadow-lg` (on non-overlay elements) | `shadow-sm` or remove | Only overlays get heavy shadows |
| `border-zinc-50` | `border-[--border]` or new border token | Consistent border color |
| `p-2` (on main cards) | `p-3` or `p-4` | Increased breathing room (Apple warmth) |
| `text-[9px]` | `text-[11px]` | Minimum readable label size |
| `text-[10px]` | `text-xs` (12px) | Standardized small text |
| `text-[11px]` | `text-[13px]` or `text-sm` | Body text readability |
| `text-zinc-400` (for labels) | `text-gray-500` | Slightly more contrast |
| `text-zinc-900` | `text-gray-900` | Maintain if already good |
| `bg-zinc-50` (for muted areas) | `bg-[#f6f8fa]` or `bg-gray-50` | GitHub muted background |

**Step 4.2 — Component-Specific Updates**
For each dashboard component, apply:
- Metric cards (`MetricSmall`): Updated padding, typography, border
- Action cards (`ActionTall`): Updated hover states, border treatment, button style
- Readiness card (`UnifiedReadinessCard`): Updated container style, chart axis colors to match system
- Radar chart (`SubjectRadarChart`): Grid color, tooltip style, text sizing
- Activity timeline (`PinnedRecentActivity`): Timeline line color, text sizing, card treatment
- Heatmap: Border, radius, internal styling
- Any other dashboard-specific components

**Step 4.3 — Chart Styling Alignment**
Update Recharts configurations to match the new system:
- Grid lines: `#f4f4f5` or lighter (Tufte: minimize non-data ink)
- Axis tick text: `fill: '#656d76', fontSize: 11` (GitHub secondary text)
- Tooltip: `borderRadius: 6px, border: '1px solid #d0d7de'` (matches card system)
- Primary chart color: Our blue-600
- Legend text: Consistent with new type scale

**Step 4.4 — Hover & Interactive State Consistency**
Ensure every interactive card follows the same pattern:
```
Rest:    border border-[--border] rounded-md bg-white shadow-[0_1px_0_rgba(31,35,40,0.04)]
Hover:   border-gray-400 shadow-sm bg-gray-50/50
Focus:   ring-2 ring-blue-500/30 ring-offset-2
Active:  bg-gray-100
```

**Step 4.5 — Verification Checklist**
Before finalizing:
- [ ] All cards use `rounded-md` (6px) — NO `rounded-sm`, `rounded-lg` on standard cards
- [ ] All card borders use the same token — NO inconsistent border colors
- [ ] No text smaller than 11px anywhere
- [ ] All interactive elements have visible hover AND focus states
- [ ] Brand blue appears ONLY on: primary buttons, active states, links, focus rings, chart accents
- [ ] No red/orange/green used DECORATIVELY — only for semantic meaning (mastery scores, trends)
- [ ] Muted backgrounds (`bg-gray-50` / `bg-[#f6f8fa]`) used consistently for nested/secondary areas
- [ ] NO layout structure changed — all `grid-cols-*`, `col-span-*`, `gap-*`, `flex-*` preserved exactly
- [ ] Typography scale is consistent: labels → body → titles → headings follow defined scale
- [ ] Charts tooltip/axis styling matches the new design system
- [ ] Page still looks good on mobile (375px)

**Output:** All component diffs.

---

## DESIGN SYSTEM CHEAT SHEET (Quick Reference)

### The 5 Rules of the SlateCamp Design System

**Rule 1: Borders, Not Shadows**
Cards are defined by their 1px border, not by shadows. Shadows are reserved for ELEVATION (popovers, modals, dropdowns).

**Rule 2: Blue is Sacred**
Blue-600 is ONLY for: primary CTAs, active/selected states, focus rings, and links. Never decorative backgrounds. Never accent borders on non-interactive elements.

**Rule 3: Two Backgrounds**
There are exactly TWO background levels: `white` (primary) and `#f6f8fa` / `gray-50` (muted/nested). That's it. No other background colors for containers (semantic colored backgrounds like `bg-blue-50` are allowed only for status indicators like alerts/banners).

**Rule 4: Typography Has a Scale**
`11px (labels) → 12px (small) → 13-14px (body) → 16px (card title) → 20-24px (page heading)`. Nothing outside this scale. Weight contrast (semibold vs. regular) creates hierarchy, not arbitrary size jumps.

**Rule 5: Consistent Corners**
`rounded-md` (6px) on everything. Cards, buttons, inputs, tooltips, badges. The ONLY exceptions: `rounded-full` for avatars/pills and `rounded-lg` (8px) for modals/large overlays.

---

## VISUAL COMPARISON: Before vs. After Mental Model

### BEFORE (Current)
```
┌─ Card (rounded-sm, no shadow, p-2, border-zinc-200) ──────┐
│ TEXT-[9px] BOLD UPPERCASE TRACKING-WIDER ZINC-400          │
│ 68%  (text-4xl, colored by score)                          │
│ ─── (border-zinc-50 divider — barely visible)              │
│ chart with #e4e4e7 grid, text-[8px] axis labels            │
└──────────────────────────────────────────────────────────────┘
```
**Feels like:** A developer tool. Clinical. Cramped. Hard to read at small sizes.

### AFTER (GitHub + Apple Hybrid)
```
┌─ Card (rounded-md, 1px #d0d7de border, p-4, bg-white) ────┐
│                                                              │
│  CURRENT READINESS  (text-xs, semibold, gray-500, uppercase) │
│  68%  (text-3xl, font-bold, score-colored)  ↑ +4.2%        │
│                                                              │
│  ── (border-b border-gray-200 divider — visible but subtle)  │
│                                                              │
│  chart with #f4f4f5 grid, text-[11px] gray-500 axis labels  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```
**Feels like:** A premium, trustworthy study tool. Clean. Structured. Readable. Professional but warm.

---

## FINAL REMINDERS

1. **AUDIT BEFORE YOU TOUCH.** Read every file. Map every token. Understand the current system completely before changing a single class.

2. **SURFACE ONLY. NO LAYOUT.** If you're changing `grid-cols`, `col-span`, `gap`, `flex`, `items-stretch`, `h-[value]`, or any layout-structural class — STOP. You are violating the constraint. Only change: borders, radii, shadows, colors, backgrounds, text sizes/weights/colors, padding (within cards), and hover/focus states.

3. **CASCADE FROM TOKENS DOWN.** CSS variables → Tailwind config → Shadcn base components → Dashboard components. This order ensures consistency and minimizes redundant changes.

4. **CONSISTENCY > PERFECTION.** It is better for all 20 cards to use the same good border treatment than for 5 cards to have a perfect custom treatment and 15 to be untouched. Sweep the whole surface systematically.

5. **THE STUDENT SHOULD NEVER NOTICE THE DESIGN.** The best design system is invisible. The student opens the dashboard and thinks "this feels professional and easy to use" — not "wow, what a cool border radius." Design that draws attention to itself is design that has failed.

---

*Execute Phase 1 now. Begin the Global Theme & Configuration Audit.*
