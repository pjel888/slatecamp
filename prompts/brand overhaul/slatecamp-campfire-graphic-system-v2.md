# SlateCamp Campfire Graphic System v2
## Scalable Visual Language with Icon Integration, Texture & Production Patterns

*Supersedes v1. This is the definitive graphic system specification.*

---

## WHAT CHANGED FROM v1

| v1 | v2 |
|---|---|
| Custom primitives only (8 shapes) | Primitives + Phosphor Icons (7,000+ icons, 6 weights) |
| Flat fills only | Subtle gradients (linear, 2-stop max) + noise texture overlay |
| No icon system | Full icon integration with SlateCamp wrapper component |
| Compositions were ad-hoc | Compositions follow a grid-based placement system |
| No texture/grain | SVG noise filter for organic, human feel |
| Dark mode was afterthought | Dark mode is structural (CSS custom properties from the start) |
| Static only | Static + animated variants with CSS keyframes |

---

## PART 1: THE ICON SYSTEM

### 1.1 Why Phosphor Icons

After evaluating Lucide (too ubiquitous — every AI-generated UI uses it), Heroicons (too small — 316 icons), Tabler (good but no duotone), and Hugeicons (too many — decision paralysis):

**Phosphor Icons** is the choice because:
- **7,000+ icons** across every category SlateCamp needs
- **6 weight variants**: Thin, Light, Regular, Bold, Fill, Duotone
- SlateCamp uses **Regular** (1.5px stroke) for UI and **Duotone** for compositions/illustrations
- Fully customizable: `color`, `size`, `weight`, `mirrored` via React props
- Tree-shakable (only imported icons hit the bundle)
- MIT license, actively maintained, React-native package

### 1.2 Installation

```bash
npm install @phosphor-icons/react
```

### 1.3 The SlateCamp Icon Wrapper

Wrap Phosphor with a component that enforces Campfire defaults — consistent sizing, color, and stroke weight across the entire app.

```tsx
// src/components/graphics/icons/Icon.tsx
'use client'
import { type IconWeight, type Icon as PhosphorIcon } from '@phosphor-icons/react'

export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'

const sizeMap: Record<IconSize, number> = {
  xs: 14,
  sm: 18,
  md: 20,
  lg: 24,
  xl: 32,
  '2xl': 48,
}

interface SCIconProps {
  icon: PhosphorIcon
  size?: IconSize
  color?: string
  weight?: IconWeight     // thin | light | regular | bold | fill | duotone
  className?: string
  ariaLabel?: string      // if icon has semantic meaning (not decorative)
}

export function SCIcon({
  icon: IconComponent,
  size = 'md',
  color = 'currentColor',
  weight = 'regular',     // 1.5px stroke — SlateCamp default
  className,
  ariaLabel,
}: SCIconProps) {
  return (
    <IconComponent
      size={sizeMap[size]}
      color={color}
      weight={weight}
      className={className}
      aria-hidden={!ariaLabel}
      aria-label={ariaLabel}
    />
  )
}
```

### 1.4 Weight System — When to Use Which

| Weight | Stroke | Usage | Feel |
|---|---|---|---|
| **Regular** | 1.5px | All UI icons: nav, buttons, form fields, list markers | Professional, clear, balanced |
| **Duotone** | 1.5px + filled accent | Compositions, feature cards, empty states, illustrations | Rich, layered, premium |
| **Bold** | 2.5px | Emphasis moments: active nav, selected states, CTAs | Strong, confident |
| **Light** | 1px | Secondary/supporting: metadata, footnotes, subtle indicators | Delicate, receding |
| **Fill** | Solid | Active/selected toggles, completed states, filled indicators | Definitive, complete |
| **Thin** | 1px | Decorative only: background patterns, watermarks | Ethereal, barely there |

**The rule:** Regular is the default. Everything else is a deliberate departure.

### 1.5 SlateCamp Icon Vocabulary

Map every UI need to a specific Phosphor icon. This prevents the chaos of "everyone picks their own icon."

```tsx
// src/components/graphics/icons/iconMap.ts
import {
  House, BookOpen, Cube, ChartLine, Notepad, GearSix,
  Lightning, Target, Brain, Timer, Flag, CheckCircle,
  XCircle, ArrowRight, ArrowLeft, CaretRight, CaretDown,
  MagnifyingGlass, Bell, User, SignOut, Question,
  Exam, Books, Ruler, Buildings, TreeStructure, Compass,
  Certificate, Star, TrendUp, TrendDown, Eye, EyeSlash,
  SpeakerHigh, SpeakerSlash, Sun, Moon, Funnel,
  Play, Pause, Stop, ArrowClockwise, Checks,
  FileText, Image, CubeTransparent, Lightbulb,
  Warning, Info, ShieldCheck, Lock, Sparkle,
  CalendarBlank, Clock, Fire, Heartbeat,
  ListChecks, GridFour, Rows, Stack,
} from '@phosphor-icons/react'

// Navigation
export const nav = {
  dashboard: House,
  wiki: BookOpen,
  lab3d: Cube,
  analytics: ChartLine,
  notes: Notepad,
  settings: GearSix,
  testing: Exam,
}

// Testing / Quiz
export const quiz = {
  start: Play,
  pause: Pause,
  submit: Checks,
  flag: Flag,
  next: ArrowRight,
  prev: ArrowLeft,
  correct: CheckCircle,
  incorrect: XCircle,
  timer: Timer,
  question: Question,
  explanation: Lightbulb,
  viewImage: Image,
  view3d: CubeTransparent,
}

// Analytics / Progress
export const progress = {
  readiness: Target,
  trendUp: TrendUp,
  trendDown: TrendDown,
  streak: Fire,
  heartbeat: Heartbeat,
  focusReview: Brain,
  extendedPractice: Lightning,
  fullSimulation: Certificate,
}

// Subjects (ALE)
export const subjects = {
  structural: Buildings,
  utilities: TreeStructure,
  laws: FileText,
  history: Compass,
  practice: Certificate,
  sitePlanning: Ruler,
}

// UI Actions
export const actions = {
  search: MagnifyingGlass,
  filter: Funnel,
  notification: Bell,
  user: User,
  signOut: SignOut,
  audioOn: SpeakerHigh,
  audioOff: SpeakerSlash,
  lightMode: Sun,
  darkMode: Moon,
  expand: CaretDown,
  navigate: CaretRight,
  refresh: ArrowClockwise,
  eye: Eye,
  eyeOff: EyeSlash,
}

// Status
export const status = {
  success: CheckCircle,
  warning: Warning,
  error: XCircle,
  info: Info,
  locked: Lock,
  verified: ShieldCheck,
  premium: Sparkle,
  star: Star,
}

// Content
export const content = {
  article: FileText,
  image: Image,
  model3d: CubeTransparent,
  note: Notepad,
  books: Books,
  calendar: CalendarBlank,
  clock: Clock,
  listView: ListChecks,
  gridView: GridFour,
  rowView: Rows,
  stackView: Stack,
}
```

### 1.6 Duotone Color Configuration

Phosphor's duotone weight renders the icon's primary strokes in `color` and fills secondary shapes with a lighter tint. For SlateCamp, configure the duotone secondary color via CSS:

```css
/* Phosphor duotone uses opacity on the secondary layer */
/* Control via the icon's color prop + this global override */
:root {
  --ph-duotone-opacity: 0.2;
}
```

In compositions and feature cards, use duotone icons with Campfire colors:

```tsx
// Duotone icon in a feature card
<SCIcon
  icon={Cube}
  size="2xl"
  weight="duotone"
  color="var(--gc-primary)"   // Slate Blue primary strokes
/>
// The secondary fill automatically gets 20% opacity
```

---

## PART 2: TEXTURE & GRAIN — THE HUMAN LAYER

The v1 system was too clean. The flat fills looked digital and sterile. v2 adds two texture techniques that make the graphics feel handmade and warm — without heavy assets.

### 2.1 SVG Noise Filter (The Grain)

A reusable SVG filter that adds organic grain to any element. Defined once, referenced everywhere.

```svg
<!-- Define once in a hidden SVG at the root of the app (layout.tsx) -->
<svg width="0" height="0" style="position:absolute">
  <defs>
    <!-- Subtle grain texture -->
    <filter id="grain">
      <feTurbulence type="fractalNoise" baseFrequency="0.65"
                    numOctaves="3" stitchTiles="stitch" result="noise"/>
      <feColorMatrix type="saturate" values="0" in="noise" result="grayNoise"/>
      <feBlend in="SourceGraphic" in2="grayNoise" mode="multiply" result="grain"/>
      <feComponentTransfer in="grain">
        <feFuncA type="linear" slope="0.4"/>  <!-- 40% grain intensity -->
      </feComponentTransfer>
    </filter>

    <!-- Even subtler grain for backgrounds -->
    <filter id="grain-light">
      <feTurbulence type="fractalNoise" baseFrequency="0.8"
                    numOctaves="2" stitchTiles="stitch" result="noise"/>
      <feColorMatrix type="saturate" values="0" in="noise" result="grayNoise"/>
      <feBlend in="SourceGraphic" in2="grayNoise" mode="multiply" result="grain"/>
      <feComponentTransfer in="grain">
        <feFuncA type="linear" slope="0.15"/>  <!-- 15% — barely visible -->
      </feComponentTransfer>
    </filter>
  </defs>
</svg>
```

**Usage in compositions:**
```svg
<!-- Apply grain to an entire composition -->
<g filter="url(#grain)">
  <rect x="40" y="60" width="80" height="140" fill="#3B6B9C"/>
  <circle cx="320" cy="60" r="40" fill="#E8853A"/>
</g>
```

**Usage in CSS (for HTML elements):**
```css
.textured {
  filter: url(#grain-light);
}
```

**Performance note:** SVG filters are GPU-accelerated in modern browsers. The grain filter adds negligible rendering cost. However, avoid applying it to elements that animate frequently (e.g., progress bars mid-animation). Apply it to static or slow-changing elements only.

### 2.2 CSS Noise Overlay (Alternative for HTML elements)

For elements where SVG filters aren't practical, use a CSS pseudo-element with a tiny repeating noise PNG (base64-encoded, ~400 bytes):

```css
.noise-overlay {
  position: relative;
}
.noise-overlay::after {
  content: '';
  position: absolute;
  inset: 0;
  opacity: 0.03;
  mix-blend-mode: multiply;
  pointer-events: none;
  border-radius: inherit;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E");
  background-repeat: repeat;
}
```

### 2.3 When to Apply Texture

| Element | Texture | Intensity | Reason |
|---|---|---|---|
| Hero composition backgrounds | `#grain` SVG filter | 40% | Warm, handmade feel |
| Landing page section backgrounds | `.noise-overlay` CSS | 3% | Subtle life to flat surfaces |
| Feature card illustration areas | `#grain` SVG filter | 30% | Premium, tactile quality |
| Empty state compositions | `#grain` SVG filter | 25% | Softens geometric shapes |
| Dashboard cards | None | — | Clean, data-focused surfaces |
| Testing interface | None | — | Maximum clarity, zero distraction |
| Charts and data visualization | None | — | Precision required |
| Buttons, form inputs | None | — | Interactive elements stay crisp |

**The rule:** Texture goes on ILLUSTRATIVE surfaces (compositions, backgrounds, decorative elements). Never on FUNCTIONAL surfaces (buttons, inputs, data displays, text).

---

## PART 3: GRADIENTS — WARMTH WITH DEPTH

v1 forbade gradients. v2 permits them under strict rules because flat fills at large scale look digital, and gradients add the warmth that "confident companion" requires.

### 3.1 Gradient Rules

1. **Linear only.** No radial, no conic, no mesh.
2. **2 stops maximum.** No multi-stop fades.
3. **Same color family.** Both stops must be from the same hue — e.g., Slate Blue 600 → Slate Blue 800. Never cross-hue (blue → orange).
4. **Subtle shift.** Maximum 20% brightness difference between stops. These are tonal shifts, not dramatic fades.
5. **One gradient per composition.** A composition can have ONE gradient fill. Everything else stays flat.
6. **Never on text.** Gradient text is a dark pattern that hurts readability.
7. **Never on small elements.** Gradients are for surfaces ≥200px in any dimension.

### 3.2 The Gradient Library

```css
:root {
  /* Warm gradients — for hero backgrounds, celebration surfaces */
  --grad-warm-surface: linear-gradient(135deg, #F8F7F5 0%, #FEF5ED 100%);
  --grad-warm-glow: linear-gradient(180deg, rgba(232,133,58,0.06) 0%, rgba(232,133,58,0) 100%);

  /* Cool gradients — for testing surfaces, focus contexts */
  --grad-cool-surface: linear-gradient(135deg, #F5F7FA 0%, #EDF1F7 100%);
  --grad-cool-depth: linear-gradient(180deg, rgba(59,107,156,0.04) 0%, rgba(59,107,156,0) 100%);

  /* Brand gradients — for hero sections, landing page, premium moments */
  --grad-slate: linear-gradient(135deg, #3B6B9C 0%, #2F5A85 100%);
  --grad-campfire: linear-gradient(135deg, #E8853A 0%, #D4751A 100%);
  --grad-emerald: linear-gradient(135deg, #2D9F6F 0%, #248A5E 100%);

  /* Dark section gradients */
  --grad-dark: linear-gradient(180deg, #1A2332 0%, #141B24 100%);
}

@media (prefers-color-scheme: dark) {
  :root {
    --grad-warm-surface: linear-gradient(135deg, #1C2433 0%, #231F1A 100%);
    --grad-cool-surface: linear-gradient(135deg, #141B24 0%, #161D28 100%);
    --grad-warm-glow: linear-gradient(180deg, rgba(240,154,82,0.08) 0%, rgba(240,154,82,0) 100%);
    --grad-cool-depth: linear-gradient(180deg, rgba(91,141,190,0.06) 0%, rgba(91,141,190,0) 100%);
  }
}
```

### 3.3 Gradient Usage Map

| Surface | Gradient | Effect |
|---|---|---|
| Landing hero background | `--grad-warm-surface` + `noise-overlay` | Warm, textured, inviting |
| Testing interface background | `--grad-cool-surface` | Cool focus, barely perceptible |
| Primary CTA (large, landing only) | `--grad-slate` | Depth and premium feel on the big button |
| Premium pricing card header | `--grad-campfire` | Warmth signaling "this is the special one" |
| Social proof dark section | `--grad-dark` | Depth in the dark band |
| Readiness Score glow behind number | `--grad-warm-glow` or `--grad-cool-depth` | Subtle radial warmth depending on score color |
| Dashboard section backgrounds | `--grad-warm-surface` at 50% | Very subtle warmth lift |

---

## PART 4: COMPOSITIONS v2 — ICONS + SHAPES + TEXTURE

Compositions now combine three layers: geometric shapes (v1 primitives), Phosphor duotone icons, and grain texture. This creates richer, more meaningful illustrations.

### 4.1 Composition Architecture (3-Layer System)

Every composition is built from these layers, back to front:

```
Layer 1: GROUND    — Geometric shapes (rectangles, circles, triangles)
                     Low opacity (0.05-0.2), grain texture applied
                     Sets the spatial context

Layer 2: ICON      — 1-2 Phosphor duotone icons, large (48-96px)
                     Medium opacity (0.15-0.4)
                     Provides the semantic meaning

Layer 3: ACCENT    — Small geometric accents (dots, lines, arcs)
                     High opacity on accent color (0.5-0.9)
                     Creates the focal point and visual energy
```

### 4.2 Revised Compositions with Icons

```tsx
// COMPOSITION: StructuralSystems — for the ALE subject
// Layer 1: building rectangles. Layer 2: Buildings icon. Layer 3: orange accent dot.
export function StructuralSystemsIllustration({ className }: { className?: string }) {
  return (
    <div className={cn("relative", className)}>
      <svg viewBox="0 0 160 120" className="w-full h-full" aria-hidden="true">
        <defs>
          <linearGradient id="ss-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--gc-primary)" stopOpacity="0.12"/>
            <stop offset="100%" stopColor="var(--gc-primary)" stopOpacity="0.04"/>
          </linearGradient>
        </defs>
        {/* Layer 1: Ground shapes */}
        <g filter="url(#grain)">
          <rect x="15" y="40" width="50" height="70" fill="var(--gc-primary)" opacity="0.15" rx="2"/>
          <rect x="75" y="20" width="60" height="90" fill="url(#ss-grad)" rx="2"/>
        </g>
        {/* Layer 3: Accent dots */}
        <circle cx="130" cy="30" r="8" fill="var(--gc-accent)" opacity="0.6"/>
        <circle cx="25" cy="30" r="4" fill="var(--gc-success)" opacity="0.4"/>
        {/* Window cutouts */}
        <rect x="25" y="55" width="12" height="10" rx="1" fill="var(--gc-cutout)" opacity="0.6"/>
        <rect x="25" y="75" width="12" height="10" rx="1" fill="var(--gc-cutout)" opacity="0.6"/>
        <rect x="88" y="35" width="10" height="10" rx="1" fill="var(--gc-accent)" opacity="0.2"/>
        <rect x="105" y="35" width="10" height="10" rx="1" fill="var(--gc-cutout)" opacity="0.5"/>
      </svg>
      {/* Layer 2: Phosphor icon overlay */}
      <div className="absolute inset-0 flex items-center justify-center opacity-20">
        <SCIcon icon={Buildings} size="2xl" weight="duotone" color="var(--gc-primary)"/>
      </div>
    </div>
  )
}
```

### 4.3 The Full Subject Illustration Set (v2)

| Subject | Ground Shapes | Phosphor Icon (duotone) | Accent |
|---|---|---|---|
| Structural Systems | 2 rectangles (buildings) | `Buildings` | Orange dot (sun) |
| Building Utilities | Concentric circles (pipe section) | `TreeStructure` | Horizontal lines (ducts) |
| Building Laws | Grid lines + highlighted cell | `FileText` | Emerald checkmark |
| History of Architecture | Arc (arch) + vertical lines (columns) | `Compass` | Orange triangle (keystone) |
| Professional Practice | Document rectangle + text lines | `Certificate` | Orange stamp circle |
| Site Planning | Ellipses (contours) + rotated rect | `Ruler` | Emerald north arrow |

### 4.4 Feature Illustrations (New)

For the landing page and feature cards, larger compositions with more visual weight:

| Feature | Ground | Icon | Accent | Texture |
|---|---|---|---|---|
| Quiz with images | Mock quiz card shape | `Image` + `Exam` | Orange highlight on "answer" | Grain 30% |
| 3D Viewer | Cube wireframe lines | `CubeTransparent` | Emerald rotation arc | Grain 25% |
| Readiness Score | Large circle (ring track) | `Target` | Gradient arc fill (dynamic color) | None (crisp) |
| Audio feedback | Sine wave path | `SpeakerHigh` | Orange pulse dots | Grain 20% |
| Explanations | Card shape + text lines | `Lightbulb` | Emerald citation badge | Grain 15% |
| Taxonomy heatmap | Grid of small rectangles | `GridFour` | Multi-color fills | None (data) |

---

## PART 5: BACKGROUND PATTERNS v2

### 5.1 Revised Patterns (with grain option)

```css
/* Pattern 1: Dot Grid — dashboard, general backgrounds */
.bg-pattern-dots {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48'%3E%3Ccircle cx='24' cy='24' r='1.5' fill='%233B6B9C' opacity='0.07'/%3E%3C/svg%3E");
}

/* Pattern 2: Cross Hatch — wiki, content backgrounds */
.bg-pattern-cross {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48'%3E%3Cpath d='M24 20v8M20 24h8' stroke='%233B6B9C' stroke-width='0.8' opacity='0.06' fill='none'/%3E%3C/svg%3E");
}

/* Pattern 3: Blueprint — plans, structural content */
.bg-pattern-blueprint {
  background-image:
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Crect width='80' height='80' fill='none' stroke='%233B6B9C' stroke-width='0.3' opacity='0.06'/%3E%3C/svg%3E"),
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16'%3E%3Crect width='16' height='16' fill='none' stroke='%233B6B9C' stroke-width='0.2' opacity='0.03'/%3E%3C/svg%3E");
}

/* Pattern 4: Scattered Shapes — NEW — playful but formal */
.bg-pattern-shapes {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Ccircle cx='20' cy='20' r='3' fill='%233B6B9C' opacity='0.05'/%3E%3Crect x='80' y='15' width='8' height='8' fill='%23E8853A' opacity='0.04' rx='1'/%3E%3Cpolygon points='55,95 50,105 60,105' fill='%232D9F6F' opacity='0.04'/%3E%3C/svg%3E");
}

/* Pattern 5: Diagonal Lines — testing, focus contexts */
.bg-pattern-diag {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Cpath d='M0 40L40 0' stroke='%233B6B9C' stroke-width='0.5' opacity='0.04' fill='none'/%3E%3C/svg%3E");
}
```

### 5.2 Pattern + Gradient + Grain Layering

The most premium surfaces combine all three:

```css
/* Premium hero background — gradient + pattern + grain */
.hero-premium {
  background: var(--grad-warm-surface);
}
.hero-premium::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,..."); /* dot pattern */
  opacity: 0.4;
}
.hero-premium::after {
  /* noise overlay from Part 2.2 */
}
```

Layer order (back to front): gradient base → pattern → grain overlay → content. This creates a surface that feels like textured paper — warm, organic, and premium.

---

## PART 6: THE COLOR STRIP v2 (Data-Driven)

Enhanced with rounded ends, gaps between segments, and animation.

```tsx
interface ColorStripProps {
  segments: { color: string; percent: number; label?: string }[]
  height?: number
  gap?: number       // gap between segments in px
  rounded?: boolean  // round the ends
  animated?: boolean // grow from 0 on mount
  className?: string
}

export function ColorStrip({
  segments,
  height = 6,
  gap = 1,
  rounded = true,
  animated = false,
  className,
}: ColorStripProps) {
  const totalGap = gap * (segments.length - 1)
  const r = rounded ? height / 2 : 0

  return (
    <svg
      viewBox={`0 0 200 ${height}`}
      preserveAspectRatio="none"
      className={cn("w-full block", className)}
      style={{ height: `${height}px` }}
      aria-hidden="true"
    >
      {segments.reduce((acc, seg, i) => {
        const availableWidth = 200 - totalGap
        const w = (seg.percent / 100) * availableWidth
        const x = acc.offset
        acc.elements.push(
          <rect
            key={i}
            x={x}
            width={Math.max(w, 0)}
            height={height}
            rx={i === 0 && rounded ? r : i === segments.length - 1 && rounded ? r : 0}
            fill={seg.color}
            style={animated ? {
              transform: 'scaleX(0)',
              transformOrigin: `${x}px center`,
              animation: `strip-grow 600ms ease-out ${i * 80}ms forwards`
            } : undefined}
          />
        )
        acc.offset = x + w + gap
        return acc
      }, { offset: 0, elements: [] as React.ReactNode[] }).elements}
    </svg>
  )
}
```

---

## PART 7: THE READINESS SCORE RING v2

Enhanced with grain texture on the ring track, gradient fill on the progress arc, and count-up animation.

```tsx
'use client'
import { useEffect, useRef, useState } from 'react'

interface ReadinessRingProps {
  score: number
  size?: number
  strokeWidth?: number
  animated?: boolean
  className?: string
}

function getScoreColor(score: number) {
  if (score >= 70) return { main: '#2D9F6F', grad: '#248A5E', glow: 'rgba(45,159,111,0.08)' }
  if (score >= 40) return { main: '#E8853A', grad: '#D4751A', glow: 'rgba(232,133,58,0.08)' }
  return { main: '#D64545', grad: '#B83A3A', glow: 'rgba(214,69,69,0.08)' }
}

export function ReadinessRing({
  score,
  size = 160,
  strokeWidth = 10,
  animated = true,
  className,
}: ReadinessRingProps) {
  const [displayScore, setDisplayScore] = useState(animated ? 0 : score)
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - displayScore / 100)
  const colors = getScoreColor(score)
  const gradId = `ring-grad-${score}`

  useEffect(() => {
    if (!animated) return
    const duration = 800
    const start = performance.now()
    const tick = (now: number) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3) // ease-out cubic
      setDisplayScore(Math.round(eased * score))
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [score, animated])

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={size} height={size} aria-hidden="true">
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={colors.main}/>
            <stop offset="100%" stopColor={colors.grad}/>
          </linearGradient>
        </defs>
        {/* Background glow */}
        <circle cx={size/2} cy={size/2} r={radius * 0.65}
                fill={colors.glow}/>
        {/* Track ring (with grain) */}
        <circle cx={size/2} cy={size/2} r={radius}
                fill="none" stroke="var(--gc-border, #D4DAE3)"
                strokeWidth={strokeWidth}
                filter="url(#grain-light)"/>
        {/* Progress arc (gradient) */}
        <circle cx={size/2} cy={size/2} r={radius}
                fill="none" stroke={`url(#${gradId})`}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                transform={`rotate(-90 ${size/2} ${size/2})`}
                style={{ transition: 'stroke-dashoffset 800ms ease-out' }}/>
      </svg>
      {/* Score number (HTML for crisp rendering) */}
      <span className="absolute text-5xl font-extrabold"
            style={{ color: colors.main }}>
        {displayScore}
      </span>
    </div>
  )
}
```

---

## PART 8: ANIMATION SYSTEM

### 8.1 Composition Entrance Animations

```css
/* Fade up — default entrance for all compositions */
@keyframes comp-enter {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Scale in — for ring/circle compositions */
@keyframes comp-scale {
  from { opacity: 0; transform: scale(0.92); }
  to { opacity: 1; transform: scale(1); }
}

/* Strip grow — for ColorStrip segments */
@keyframes strip-grow {
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
}

/* Stagger children — apply to parent container */
.stagger-children > * {
  opacity: 0;
  animation: comp-enter 400ms ease-out forwards;
}
.stagger-children > *:nth-child(1) { animation-delay: 0ms; }
.stagger-children > *:nth-child(2) { animation-delay: 80ms; }
.stagger-children > *:nth-child(3) { animation-delay: 160ms; }
.stagger-children > *:nth-child(4) { animation-delay: 240ms; }
.stagger-children > *:nth-child(5) { animation-delay: 320ms; }
.stagger-children > *:nth-child(6) { animation-delay: 400ms; }

/* Disable all for reduced motion */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### 8.2 Micro-Animations for Icons

```css
/* Hover lift for interactive icon buttons */
.icon-interactive {
  transition: transform 150ms ease-out, color 150ms ease-out;
}
.icon-interactive:hover {
  transform: translateY(-1px);
}

/* Pulse for notification badges */
@keyframes icon-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.15); }
}
.icon-pulse {
  animation: icon-pulse 2s ease-in-out infinite;
}
```

---

## PART 9: FILE STRUCTURE & IMPLEMENTATION PLAN

### 9.1 Directory Structure

```
src/components/graphics/
├── icons/
│   ├── Icon.tsx              # SCIcon wrapper component
│   ├── iconMap.ts            # Complete icon vocabulary
│   └── index.ts              # Barrel export
├── compositions/
│   ├── Skyline.tsx
│   ├── Summit.tsx
│   ├── FocusRing.tsx
│   ├── BlueprintGrid.tsx
│   ├── Campfire.tsx
│   └── index.ts
├── subjects/
│   ├── StructuralSystems.tsx
│   ├── BuildingUtilities.tsx
│   ├── BuildingLaws.tsx
│   ├── HistoryOfArchitecture.tsx
│   ├── ProfessionalPractice.tsx
│   ├── SitePlanning.tsx
│   └── index.ts
├── ui/
│   ├── ColorStrip.tsx
│   ├── ReadinessRing.tsx
│   ├── EmptyState.tsx
│   ├── LoadingSkeleton.tsx
│   ├── NoiseFilter.tsx       # Hidden SVG with filter defs
│   └── index.ts
├── patterns/
│   └── patterns.css          # All .bg-pattern-* classes
├── tokens.ts                 # Color tokens, gradient tokens
├── gradients.css             # All --grad-* custom properties
└── index.ts                  # Master barrel export
```

### 9.2 Implementation Phases

**PHASE 1: Foundation (Day 1)**
1. Install Phosphor: `npm install @phosphor-icons/react`
2. Create `tokens.ts` with all color/gradient tokens
3. Create `Icon.tsx` wrapper + `iconMap.ts` vocabulary
4. Create `NoiseFilter.tsx` (hidden SVG with grain filters)
5. Add `gradients.css` and `patterns.css` to global imports
6. Verify Phosphor icons render correctly with Campfire colors

**PHASE 2: Compositions (Day 2)**
1. Build all 5 composition components (Skyline, Summit, FocusRing, BlueprintGrid, Campfire)
2. Build all 6 subject illustrations with the 3-layer system (ground + icon + accent)
3. Add grain filter to compositions
4. Test dark mode for all compositions

**PHASE 3: UI Components (Day 3)**
1. Build ColorStrip v2 with gap/rounded/animated options
2. Build ReadinessRing v2 with gradient arc and count-up
3. Build EmptyState component (composition + message + CTA)
4. Build LoadingSkeleton with pulse animation
5. Add animation CSS (comp-enter, comp-scale, strip-grow, stagger)

**PHASE 4: Integration (Day 4-5)**
1. Replace all Lucide/Heroicon imports with SCIcon + Phosphor
2. Deploy compositions to: dashboard hero, empty states, landing page, quiz start, auth pages
3. Deploy background patterns to: dashboard, wiki, analytics, settings
4. Deploy ColorStrip to: card accents, progress indicators, heatmap legend
5. Deploy ReadinessRing v2 to: dashboard, analytics, session summary

**PHASE 5: Polish (Day 6)**
1. Add noise overlay to landing page hero and feature card backgrounds
2. Add gradients to landing hero, pricing premium card, dark sections
3. Verify all animations respect `prefers-reduced-motion`
4. Performance audit (no composition > 1KB, no filter causing jank)
5. Visual audit: every page uses the graphic system, no orphaned old icons

---

## PART 10: NON-NEGOTIABLE RULES

1. **Phosphor Regular (1.5px) is the default weight.** Duotone is for compositions only. Bold for emphasis. Everything else is deliberate.
2. **Every icon in the app comes from `iconMap.ts`.** No ad-hoc Phosphor imports. If you need a new icon, add it to the map first.
3. **Grain goes on illustrations, never on UI.** Buttons, inputs, data displays, and text stay crisp.
4. **Gradients are 2-stop, same-family, subtle.** Never cross-hue. Never dramatic. Never on text.
5. **Maximum 3 colors per composition** (plus background). Dominant blue, accent orange, semantic third.
6. **One gradient per composition.** Everything else stays flat.
7. **Compositions are abstract geometry + icon.** Never literal illustrations of buildings, people, or objects.
8. **All animations ≤400ms.** All easing: ease-out. All respect `prefers-reduced-motion`.
9. **Dark mode is structural.** All colors via CSS custom properties. Test in dark mode before merging.
10. **The SCIcon wrapper is mandatory.** Direct `<PhosphorIcon />` usage is not allowed — all icons go through the wrapper for consistency.

---

## APPENDIX: Quick Icon Reference

Most frequently needed icons in the SlateCamp product:

| Context | Icon | Weight | Import |
|---|---|---|---|
| Dashboard nav | `House` | Regular | `nav.dashboard` |
| Start quiz | `Play` | Bold | `quiz.start` |
| Correct answer | `CheckCircle` | Fill | `quiz.correct` |
| Wrong answer | `XCircle` | Regular | `quiz.incorrect` |
| Flag question | `Flag` | Regular → Bold (when flagged) | `quiz.flag` |
| View explanation | `Lightbulb` | Duotone | `quiz.explanation` |
| View in 3D | `CubeTransparent` | Duotone | `quiz.view3d` |
| Readiness Score | `Target` | Duotone | `progress.readiness` |
| Trend up | `TrendUp` | Bold | `progress.trendUp` |
| Focus Review | `Brain` | Regular | `progress.focusReview` |
| Search | `MagnifyingGlass` | Regular | `actions.search` |
| Audio on/off | `SpeakerHigh`/`SpeakerSlash` | Regular | `actions.audioOn`/`Off` |
| Premium badge | `Sparkle` | Fill | `status.premium` |
| Locked content | `Lock` | Regular | `status.locked` |

---

*Feed this alongside `slatecamp-campfire-complete-prompt.md` and `slatecamp-landing-page-implementation.md` to Claude Code. This document governs all visual and graphic decisions.*
