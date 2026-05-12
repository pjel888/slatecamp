# SlateCamp Component Library — Complete Specification

> **Purpose:** This document defines every shared UI component SlateCamp needs, with full state matrices, size variants, style variants, accessibility requirements, and dark mode behavior. Give this to Claude Code alongside your codebase audit report to execute the refactoring.
>
> **Stack:** Shadcn UI (Radix primitives) + Tailwind CSS. All components live in `src/components/ui/` (primitives) or `src/components/shared/` (composed patterns). Every component is a Server Component unless it requires interactivity.

---

## Universal State Definitions

Every interactive component must handle these states. No exceptions.

| State | Description | Visual Signal |
|-------|-------------|---------------|
| **Default** | Resting state, no interaction | Base styling |
| **Hover** | Mouse over the element | Subtle background shift, cursor change |
| **Focus** | Keyboard-focused (Tab navigation) | `ring-2 ring-primary/20 ring-offset-2` focus ring — ALWAYS visible |
| **Active / Pressed** | Mouse down or Enter key held | Slight scale-down or darker background |
| **Disabled** | Cannot be interacted with | `opacity-50 cursor-not-allowed pointer-events-none` |
| **Loading** | Action in progress | Spinner replaces icon/text, `pointer-events-none` |
| **Error** | Validation failed or action errored | Red border or text, error message below |
| **Success** | Action completed successfully | Green signal, brief flash then return to default |

**Accessibility baseline for ALL components:**
- Keyboard navigable (Tab, Enter, Space, Escape, Arrow keys where appropriate)
- ARIA labels on all icon-only elements
- Minimum touch target: 44×44px
- Color is never the sole indicator — always paired with text, icon, or pattern
- Contrast ratio: 4.5:1 body text, 3:1 large text
- Focus ring always visible on keyboard focus, hidden on mouse click (`:focus-visible`)

**Dark mode:** Every component must work in both light and dark modes using Tailwind's semantic color tokens (`text-foreground`, `bg-background`, `bg-card`, `border-border`, `text-muted-foreground`). Never hardcode hex values for backgrounds or text — only for brand accent colors.

---

## 1. BUTTONS

### Variants

| Variant | Default | Hover | Active | Disabled | Use When |
|---------|---------|-------|--------|----------|----------|
| **Primary** | `bg-primary text-primary-foreground` | `bg-primary/90` | `bg-primary/80 scale-[0.98]` | `opacity-50` | One per view — the most important action |
| **Secondary** | `bg-transparent border border-border text-foreground` | `bg-muted` | `bg-muted/80 scale-[0.98]` | `opacity-50` | Supporting actions |
| **Ghost** | `bg-transparent text-foreground` | `bg-muted` | `bg-muted/80` | `opacity-50` | Tertiary, inline, toolbar |
| **Destructive** | `bg-destructive text-destructive-foreground` | `bg-destructive/90` | `bg-destructive/80 scale-[0.98]` | `opacity-50` | Irreversible actions only |
| **Link** | `text-primary underline-offset-4` | `underline` | `text-primary/80` | `opacity-50 no-underline` | Navigation, "View all" |
| **Success** | `bg-signal-green text-white` | `bg-signal-green/90` | `bg-signal-green/80 scale-[0.98]` | `opacity-50` | Confirm/apply actions in admin |

### Sizes

| Size | Padding | Font | Height | Icon Size |
|------|---------|------|--------|-----------|
| **xs** | `px-2 py-1` | `text-[11px]` | `h-7` | `w-3 h-3` |
| **sm** | `px-3 py-1.5` | `text-xs` | `h-8` | `w-3.5 h-3.5` |
| **md** (default) | `px-4 py-2` | `text-sm` | `h-9` | `w-4 h-4` |
| **lg** | `px-6 py-2.5` | `text-sm` | `h-10` | `w-4 h-4` |
| **xl** | `px-8 py-3` | `text-base` | `h-12` | `w-5 h-5` |

### Sub-variants

- **Icon-only button:** Square aspect ratio, same height/width, `aria-label` required
- **Button with left icon:** Icon + gap-2 + text
- **Button with right icon:** Text + gap-2 + icon
- **Loading button:** Spinner replaces left icon (or appears before text), text stays visible, `pointer-events-none`
- **Full-width button:** `w-full` modifier

### Props Interface
```typescript
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'ghost' | 'destructive' | 'link' | 'success'
  size: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  loading?: boolean
  disabled?: boolean
  fullWidth?: boolean
  children: React.ReactNode
}
```

---

## 2. CLOSE / DISMISS BUTTON

A single component used everywhere something can be dismissed.

### Variants

| Variant | Appearance | Use When |
|---------|------------|----------|
| **Ghost** (default) | Transparent, X icon, hover shows muted bg | Modals, dialogs, sidebars, panels |
| **Subtle** | Muted background circle with X | Cards, banners, toasts |
| **Destructive** | Red background circle with X | Dismiss with warning connotation |

### Sizes

| Size | Dimensions | Icon Size |
|------|------------|-----------|
| **sm** | `w-6 h-6` | `w-3 h-3` |
| **md** (default) | `w-8 h-8` | `w-4 h-4` |
| **lg** | `w-10 h-10` | `w-5 h-5` |

### States

| State | Ghost | Subtle | Destructive |
|-------|-------|--------|-------------|
| Default | Transparent | `bg-muted/50` | `bg-destructive/10 text-destructive` |
| Hover | `bg-muted` | `bg-muted` | `bg-destructive/20` |
| Focus | `ring-2 ring-primary/20` | same | `ring-2 ring-destructive/20` |
| Active | `bg-muted/80` | `bg-muted/80` | `bg-destructive/30` |

### Required
- `aria-label="Close"` or `aria-label="Dismiss"` always
- Escape key handler on parent container

---

## 3. BADGES / PILLS / TAGS

Used everywhere: status indicators, mastery tiers, session modes, difficulty labels, taxonomy labels.

### Variants

| Variant | Background | Text | Border | Use When |
|---------|------------|------|--------|----------|
| **Default** | `bg-muted` | `text-muted-foreground` | none | Neutral labels |
| **Primary** | `bg-primary/10` | `text-primary` | none | Active/selected items |
| **Success** | `bg-emerald-50` | `text-emerald-700` | `border-emerald-200` | Published, clean, passing (≥70%) |
| **Warning** | `bg-amber-50` | `text-amber-700` | `border-amber-200` | Draft, unverified, in-progress |
| **Danger** | `bg-red-50` | `text-red-700` | `border-red-200` | Critical issues, errors (functional only) |
| **Info** | `bg-blue-50` | `text-blue-700` | `border-blue-200` | Informational |
| **Purple** | `bg-purple-50` | `text-purple-700` | `border-purple-200` | Camp Trail, progression |
| **Orange** | `bg-orange-50` | `text-orange-700` | `border-orange-200` | CTA accent, next action |
| **Outline** | `bg-transparent` | `text-foreground` | `border border-border` | Subtle, low emphasis |

### Sizes

| Size | Padding | Font | Use When |
|------|---------|------|----------|
| **xs** | `px-1.5 py-0.5` | `text-[9px] font-mono uppercase tracking-widest` | Eyebrow labels, admin UI |
| **sm** (default) | `px-2 py-0.5` | `text-[10px] font-medium` | Status badges, inline tags |
| **md** | `px-2.5 py-1` | `text-xs font-medium` | Prominent badges, filters |
| **lg** | `px-3 py-1` | `text-sm font-medium` | Feature labels, hero badges |

### Shape
- Default: `rounded` (slight round)
- Pill: `rounded-full`

### With icon
- Optional leading icon (`w-3 h-3` for sm, `w-3.5 h-3.5` for md)
- Optional dot indicator (colored circle before text)

### Dismissible
- Optional close X button (uses CloseButton component, size xs)

### Semantic presets (convenience wrappers)
```typescript
<StatusBadge status="published" />        // Success variant, "Published" text
<StatusBadge status="draft" />            // Warning variant, "Draft" text
<VerificationBadge status="clean" />      // Success + checkmark icon
<VerificationBadge status="has_issues" count={3} />  // Danger + alert icon + count
<VerificationBadge status="unverified" /> // Default, no icon
<DifficultyBadge level="Foundational" />  // Info variant
<DifficultyBadge level="Advanced" />      // Warning variant
<SessionModeBadge mode="camp" />          // Blue bg, "CAMP" text
<SessionModeBadge mode="storm" />         // Amber bg, "STORM" text
<MasteryBadge tier="building" />          // Amber text
<MasteryBadge tier="proficient" />        // Green text
```

---

## 4. CARDS

### Variants

| Variant | Styling | Use When |
|---------|---------|----------|
| **Default** | `bg-card border border-border rounded-xl p-4` | Standard content container |
| **Accent Left** | `border-l-[3px] border-l-{color} rounded-r-xl` | Action cards, issue cards |
| **Feature** | Solid bg color (`bg-[#0F1F5C]`, `bg-primary`, `bg-[#F2F0EB]`) | Discovery row, feature highlights |
| **Interactive** | Default + `hover:border-primary/50 cursor-pointer transition-colors` | Clickable cards (article list, question list) |
| **Selected** | `border-primary bg-primary/5` | Currently active/selected item |
| **Ghost** | `bg-transparent` with content only | Minimal container |

### Card Header Pattern (use inside every card)
```typescript
interface CardHeaderProps {
  eyebrow?: string      // DM Mono, 9px, uppercase, tracking-widest, muted
  title: string         // Inter, 14px, medium, foreground
  subtitle?: string     // Inter, 12px, regular, muted
  action?: React.ReactNode  // Right-aligned button or badge
}
```

### Card Sizes
| Size | Padding | Border Radius |
|------|---------|---------------|
| **sm** | `p-3` | `rounded-lg` |
| **md** (default) | `p-4` | `rounded-xl` |
| **lg** | `p-6` | `rounded-xl` |

### Card States (for Interactive variant)
| State | Visual |
|-------|--------|
| Default | `border-border` |
| Hover | `border-primary/50 shadow-sm` |
| Focus | `ring-2 ring-primary/20 ring-offset-2` |
| Selected | `border-primary bg-primary/5` |
| Disabled | `opacity-50 pointer-events-none` |
| Error | `border-destructive/50 bg-destructive/5` |

---

## 5. TAXONOMY PICKER (3-Level Nested Selector)

The most reused domain component. One implementation for everywhere.

### Usage Contexts
- Admin: question editor (select topic), article editor (link to taxonomy), taxonomy tree
- Student: quiz topic picker, wiki sidebar navigation, heatmap drill-down
- Shared: wherever a user or admin selects a taxonomy node

### Structure
```
Level 0: Subject (ALE-HIST, ALE-DSGN, ALE-PRAC...)
  Level 1: Subtopic (ALE-HIST-001, ALE-HIST-002...)
    Level 2: Leaf node (ALE-HIST-001-01, ALE-HIST-001-02...)
```

### Variants

| Variant | Appearance | Use When |
|---------|------------|----------|
| **Dropdown** | Click to open, shows tree in popover | Forms, filters, compact spaces |
| **Sidebar** | Always-visible expandable tree | Wiki sidebar, admin taxonomy page |
| **Inline** | Flat expandable tree, no popover | Admin panels, settings |

### Features
- Search/filter across all levels (matches node name or ale_id)
- Expand/collapse each level independently
- Single-select (returns node_id) or multi-select (returns node_id[])
- Show counts per node (article count, question count) — optional
- Show status badges per node — optional
- Show ale_id as monospace label next to name — optional
- Keyboard navigation: Arrow keys to traverse, Enter to select, Escape to close

### States
| State | Visual |
|-------|--------|
| Default (closed) | Shows selected node name or placeholder |
| Open | Popover/sidebar with tree rendered |
| Loading | Skeleton tree while fetching |
| Empty | "No taxonomy nodes found" message |
| Error | "Failed to load taxonomy" with retry |
| Node: default | Normal text |
| Node: hover | `bg-muted` highlight |
| Node: selected | `bg-primary/10 text-primary font-medium` |
| Node: expanded | Chevron rotated down, children visible |
| Node: collapsed | Chevron right, children hidden |
| Node: disabled | `opacity-50` (e.g., cross-ref-only nodes) |

### Props Interface
```typescript
interface TaxonomyPickerProps {
  variant: 'dropdown' | 'sidebar' | 'inline'
  mode: 'single' | 'multi'
  value?: string | string[]              // node_id(s)
  onChange: (value: string | string[]) => void
  disciplineId?: string                   // filter to one subject
  showCounts?: boolean                    // article/question counts
  showAleId?: boolean                     // show ALE-XXX-XXX labels
  showStatusBadges?: boolean              // show published/draft badges
  excludeCrossRef?: boolean               // hide cross-reference-only nodes
  placeholder?: string
  disabled?: boolean
  className?: string
}
```

---

## 6. SCORE / PERCENTAGE DISPLAY

Used for: readiness score, quiz results, mastery percentage, topic coverage, content health.

### Variants

| Variant | Appearance | Use When |
|---------|------------|----------|
| **Ring** | Circular SVG ring, percentage in center | Readiness score, quiz score reveal |
| **Bar** | Horizontal bar fill | Mastery bars, progress indicators |
| **Pill** | Rounded badge with percentage | Inline in tables, lists |
| **Number** | Large monospace number only | Dashboard stat cards |

### Color Logic (non-negotiable)
```
≥ 70% → Signal Green (#1B7A3C / emerald-700)
40–69% → Neutral (text-foreground, no color signal)
< 40%  → Neutral (text-muted-foreground + "Needs review" label)
NEVER red for low scores. Red is reserved for functional errors.
```

### Sizes
| Size | Ring Diameter | Bar Height | Font |
|------|--------------|------------|------|
| **sm** | 40px | `h-1` | `text-xs font-mono` |
| **md** | 64px | `h-1.5` | `text-sm font-mono` |
| **lg** | 96px | `h-2` | `text-lg font-mono` |
| **xl** | 128px | `h-3` | `text-2xl font-mono` |

### Animation
- Ring: animates from 0 to score on mount (`duration-1000 ease-out`)
- Bar: smooth width transition on value change (`transition-all duration-500`)
- Number: optional count-up animation

### Props Interface
```typescript
interface ScoreDisplayProps {
  value: number                  // 0-100
  variant: 'ring' | 'bar' | 'pill' | 'number'
  size: 'sm' | 'md' | 'lg' | 'xl'
  label?: string                 // "Readiness Score", "Mastery", etc.
  showPercentSign?: boolean      // default true
  animate?: boolean              // default true
}
```

---

## 7. SECTION HEADER

The eyebrow + title + subtitle pattern used on every card and page section.

### Props Interface
```typescript
interface SectionHeaderProps {
  eyebrow?: string               // DM Mono, uppercase, tracking-widest
  title: string                  // Syne or Inter depending on level
  subtitle?: string              // Inter, muted
  action?: React.ReactNode       // Right-aligned CTA or link
  level?: 'page' | 'section' | 'card'  // determines font sizes
}
```

### Levels

| Level | Eyebrow | Title | Subtitle |
|-------|---------|-------|----------|
| **page** | `font-mono text-[10px] uppercase tracking-widest text-muted-foreground` | `font-display font-extrabold text-xl` (Syne) | `font-sans text-sm text-muted-foreground` |
| **section** | `font-mono text-[9px] uppercase tracking-widest text-muted-foreground` | `font-sans font-medium text-base` (Inter) | `font-sans text-xs text-muted-foreground` |
| **card** | `font-mono text-[9px] uppercase tracking-widest text-muted-foreground mb-0.5` | `font-sans font-medium text-sm` (Inter) | `font-sans text-xs text-muted-foreground` |

---

## 8. EMPTY STATE

Shown whenever a component has no data to display.

### Props Interface
```typescript
interface EmptyStateProps {
  icon?: React.ReactNode          // Simple geometric, not illustrative
  message: string                 // Honest brand voice
  description?: string            // Additional context
  action?: {
    label: string
    href?: string
    onClick?: () => void
  }
}
```

### Rules
- Message pattern: `"[Honest observation]. [What to do next]."`
- Never: "No data found", "Empty", "Nothing here yet!"
- Always provide a next action when possible
- Icon is a simple geometric shape (rounded square, circle), never an illustration

---

## 9. LOADING SKELETON

Every data component needs a matching skeleton.

### Primitives
```typescript
<Skeleton className="h-4 w-32" />          // Text line
<Skeleton className="h-4 w-full" />        // Full-width text
<Skeleton className="h-10 w-10 rounded-full" />  // Avatar/icon
<Skeleton className="h-32 w-full rounded-xl" />   // Card
<Skeleton className="h-2 w-full rounded-full" />  // Progress bar
```

### Composed Skeletons (create for each major component)
- `CardSkeleton` — matches Card layout
- `TableRowSkeleton` — matches data table row
- `TaxonomyTreeSkeleton` — matches tree structure
- `ArticleListSkeleton` — matches article list
- `QuestionCardSkeleton` — matches question display
- `ScoreRingSkeleton` — matches score ring
- `StatCardSkeleton` — matches stat card

---

## 10. DATA TABLE

Used in admin for: questions list, articles list, audit log, user management.

### Features
- Sortable columns (click header to sort, shows arrow indicator)
- Filterable (search input + dropdown filters)
- Selectable rows (checkbox column, bulk actions bar)
- Pagination (page size selector, page navigation)
- Row click action (navigate or expand)
- Empty state when no results
- Loading state (skeleton rows)

### Column Types
- **Text** — plain text, truncatable
- **Badge** — renders a Badge component
- **Date** — relative time ("2 hours ago") or formatted date
- **Number** — right-aligned, monospace
- **Action** — icon buttons (edit, delete, view)

### States
| State | Visual |
|-------|--------|
| Row: default | White background |
| Row: hover | `bg-muted/50` |
| Row: selected | `bg-primary/5` checkbox checked |
| Row: expanded | Border highlight, detail panel below |
| Header: default | `bg-muted/30` with sort indicator |
| Header: sorted | Bold text + arrow icon |
| Table: loading | Skeleton rows |
| Table: empty | EmptyState component |
| Table: error | Error message with retry |

---

## 11. FORM INPUTS

### Text Input

| State | Border | Background | Label |
|-------|--------|------------|-------|
| Default | `border-border` | `bg-background` | `text-muted-foreground` |
| Hover | `border-border/80` | same | same |
| Focus | `border-primary ring-2 ring-primary/20` | same | `text-foreground` |
| Filled | `border-border` | same | `text-foreground` (label stays above) |
| Disabled | `border-border/50 bg-muted/30` | `opacity-50` | `text-muted-foreground` |
| Error | `border-destructive ring-2 ring-destructive/20` | same | `text-destructive` |
| Success | `border-signal-green` | same | `text-signal-green` |

### Sizes
| Size | Height | Font | Padding |
|------|--------|------|---------|
| **sm** | `h-8` | `text-xs` | `px-2.5` |
| **md** (default) | `h-9` | `text-sm` | `px-3` |
| **lg** | `h-10` | `text-sm` | `px-3.5` |

### Textarea
- Same state system as Text Input
- Resizable vertically (`resize-y`)
- Optional character count (`text-xs text-muted-foreground` bottom-right)
- Optional min/max height

### Select / Dropdown
- Same state system as Text Input
- Chevron indicator on right
- Uses Radix Select primitive for accessibility
- Searchable option (for long lists)

### Checkbox & Radio
| State | Visual |
|-------|--------|
| Unchecked | `border-border bg-background` |
| Unchecked hover | `border-primary/50` |
| Checked | `bg-primary border-primary` with checkmark/dot |
| Checked hover | `bg-primary/90` |
| Disabled | `opacity-50 cursor-not-allowed` |
| Focus | `ring-2 ring-primary/20` |
| Error | `border-destructive` |

### Toggle / Switch
| State | Off | On |
|-------|-----|-----|
| Default | `bg-muted` | `bg-primary` |
| Hover | `bg-muted/80` | `bg-primary/90` |
| Disabled | `opacity-50` both | same |
| Focus | `ring-2 ring-primary/20` | same |

---

## 12. TOAST / NOTIFICATION

### Variants

| Variant | Icon | Color | Use When |
|---------|------|-------|----------|
| **Success** | Checkmark | Green left border | Action completed |
| **Error** | Alert circle | Red left border | Action failed |
| **Warning** | Alert triangle | Amber left border | Needs attention |
| **Info** | Info circle | Blue left border | Neutral information |

### Behavior
- Appears bottom-right (or top-right for admin)
- Auto-dismisses after 5 seconds (errors stay until dismissed)
- Stackable (max 3 visible, older ones pushed up)
- Dismissible via close button
- Action button option ("Undo", "View", "Retry")

---

## 13. MODAL / DIALOG

### Sizes
| Size | Width | Use When |
|------|-------|----------|
| **sm** | `max-w-sm` (384px) | Confirmations, simple forms |
| **md** | `max-w-md` (448px) | Standard dialogs |
| **lg** | `max-w-lg` (512px) | Complex forms |
| **xl** | `max-w-xl` (576px) | Previews, detailed views |
| **full** | `max-w-3xl` (768px) | Editor modals |

### Anatomy
- Overlay: `bg-black/50 backdrop-blur-sm`
- Container: `bg-card border border-border rounded-xl shadow-lg`
- Header: Title + optional subtitle + close button
- Body: Scrollable content area
- Footer: Action buttons (primary right, secondary left)

### States
- Opening: fade-in overlay + scale-up dialog (`duration-200`)
- Closing: reverse animation
- Loading: body replaced with skeleton or spinner

### Confirmation Dialog (preset)
```typescript
<ConfirmDialog
  title="Delete 3 questions?"
  description="This action cannot be undone."
  confirmLabel="Delete"
  confirmVariant="destructive"
  cancelLabel="Cancel"
  onConfirm={handleDelete}
  onCancel={handleCancel}
/>
```

---

## 14. TOOLTIP

### Sizes
| Size | Max Width | Font |
|------|-----------|------|
| **sm** | `max-w-[200px]` | `text-xs` |
| **md** (default) | `max-w-[300px]` | `text-xs` |

### Appearance
- `bg-foreground text-background rounded-md px-3 py-1.5 shadow-md`
- Arrow pointing to trigger element
- Delay: 300ms before showing, 0ms before hiding

### Rule: Every icon-only button and every non-obvious metric must have a tooltip.

---

## 15. QUESTION CARD

Domain-specific component for displaying quiz questions.

### Variants

| Variant | Use When |
|---------|----------|
| **Quiz** | Active quiz session — shows choices, answer selection |
| **Review** | After quiz — shows correct/incorrect, rationale |
| **Preview** | Admin preview — shows all metadata |
| **Compact** | Question list — truncated stem, key info only |

### States (Quiz variant)
| State | Visual |
|-------|--------|
| Unanswered | All choices neutral |
| Hovering choice | Choice has `bg-muted/50` |
| Selected (not submitted) | Choice has `bg-primary/10 border-primary` |
| Submitted — correct | Selected choice `bg-emerald-50 border-emerald-500`, other choices dimmed |
| Submitted — incorrect | Selected choice `bg-red-50 border-red-300`, correct choice `bg-emerald-50 border-emerald-500` |
| Rationale revealed | Expandable section below choices |

### Choice States
| State | Background | Border | Text |
|-------|------------|--------|------|
| Default | `bg-card` | `border-border` | `text-foreground` |
| Hover | `bg-muted/50` | `border-border` | `text-foreground` |
| Selected | `bg-primary/10` | `border-primary` | `text-foreground font-medium` |
| Correct (revealed) | `bg-emerald-50` | `border-emerald-500` | `text-emerald-900` |
| Incorrect (revealed) | `bg-red-50` | `border-red-300` | `text-red-900` |
| Disabled | `opacity-50` | `border-border/50` | `text-muted-foreground` |

---

## 16. LEGAL CITATION BADGE

Inline badge for referencing Philippine laws in articles, questions, and rationales.

### Color Map
| Code | Background | Text |
|------|------------|------|
| PD 1096 (NBCP) | `bg-blue-50` | `text-blue-800` |
| RA 9514 (Fire Code) | `bg-red-50` | `text-red-800` |
| BP 344 (Accessibility) | `bg-purple-50` | `text-purple-800` |
| RA 9266 (Architecture Act) | `bg-emerald-50` | `text-emerald-800` |
| NSCP | `bg-amber-50` | `text-amber-800` |
| BP 220 | `bg-cyan-50` | `text-cyan-800` |
| PD 957 | `bg-orange-50` | `text-orange-800` |

### Appearance
`font-mono text-[10px] font-medium px-1.5 py-0.5 rounded`

Optional: clickable → navigates to the corresponding Laws & Codes wiki section.

---

## 17. BREADCRUMB

### Appearance
- Items separated by `/` or chevron icon
- Last item is current page (not clickable, `text-foreground font-medium`)
- Previous items are links (`text-muted-foreground hover:text-foreground`)
- Truncate middle items on mobile with `...`

---

## 18. TABS

### Variants
| Variant | Appearance | Use When |
|---------|------------|----------|
| **Underline** | Bottom border on active tab | Page-level navigation (admin tabs) |
| **Pill** | Filled background on active tab | In-card filtering |
| **Segmented** | Button group with active highlight | Binary/ternary toggles |

### States
| State | Inactive | Active |
|-------|----------|--------|
| Default | `text-muted-foreground` | `text-primary border-b-2 border-primary` (underline) or `bg-primary/10 text-primary` (pill) |
| Hover | `text-foreground` | same as active |
| Focus | `ring-2 ring-primary/20` | same |
| Disabled | `opacity-50` | N/A |

---

## 19. SEARCH INPUT

A specialized text input for search functionality.

### Features
- Search icon (magnifying glass) on the left
- Clear button (X) on the right when input has value
- Optional keyboard shortcut hint (`⌘K` badge)
- Debounced onChange (300ms default)

### States
Same as Text Input states, plus:
- **Searching** — spinner replaces search icon
- **No results** — input stays, content area shows empty state

---

## 20. STAT CARD

Used on dashboards to display a single metric.

### Anatomy
```
[EYEBROW — DM Mono uppercase]
LARGE NUMBER (DM Mono, tabular-nums)
Optional: trend indicator (↑ green / ↓ amber / → neutral)
Optional: subtitle/context
```

### Props
```typescript
interface StatCardProps {
  eyebrow: string
  value: number | string
  trend?: { direction: 'up' | 'down' | 'flat'; label: string }
  color?: string          // accent color for the number
  href?: string           // make card clickable
}
```

---

## Implementation Plan for Claude Code

When you have the codebase audit report, give Claude Code this instruction:

```
Read COMPONENT-LIBRARY-SPEC.md and the codebase audit report. For each component in the spec:

1. Search the entire codebase for existing implementations of this pattern
2. List every file that implements its own version (e.g., every file with a close/X button)
3. Create the canonical component in src/components/ui/ (primitives) or src/components/shared/ (composed)
4. Implement ALL states, variants, sizes, and accessibility requirements from the spec
5. Add dark mode support using semantic Tailwind tokens
6. Replace every ad-hoc implementation across the codebase with the new shared component
7. Ensure no visual regression — the new component should look identical (or better) than what it replaces

Work through components in this priority order:
1. Button (most used)
2. Badge/Pill (most inconsistent)
3. CloseButton (most duplicated)
4. Card (foundation for everything)
5. SectionHeader (typography consistency)
6. TaxonomyPicker (most complex shared component)
7. ScoreDisplay (domain-specific)
8. QuestionCard (domain-specific)
9. DataTable (admin-specific)
10. Everything else

After all components are built, update the design system gallery page at /dashboard/developer/design-system to showcase every component with every variant and state.

Run bun run build after completing each component to catch errors early.
```
