# 07 — Competitive UX Comparison: VizCode vs LI Mode vs PI Mode

> **Note**: The LI layout mockups in this document were written pre-hotspot revision. The authoritative LI UX is now hotspot-centered (see doc 20). Sub-mode tabs and adaptive sidebars are replaced by hotspot dots on the 3D model. The competitive comparison data remains valid.

## Interaction Model Comparison

| Dimension | VizCode PH | SlateCamp PI Mode | SlateCamp LI Mode |
|-----------|-----------|-------------------|-------------------|
| **Primary metaphor** | Static 2D diagrams + text | Parametric engineering tool | Guided 3D learning experience |
| **Learner role** | Reader / quiz-taker | Engineer / explorer | Student / discoverer |
| **Interaction style** | Click to navigate pages, read, answer text quizzes | Adjust sliders, see live geometry changes | Toggle layers, switch sub-modes, inspect in 3D |
| **Dimensionality** | 2D (static images, GIFs) | 3D interactive (parametric geometry) | 3D interactive (layer-based geometry) |
| **Controls** | Navigation links, category sidebar, quiz buttons | Sliders, dropdowns, toggles, presets, compliance panels | Checkbox toggles, sub-mode tabs, camera controls |
| **Spatial understanding** | Implied through diagrams | Direct through parametric manipulation | Direct through layer exploration |

## Layout Comparison

### VizCode PH (Code Library / Review Modes)

```
┌──────────────────────────────────────────────────────┐
│ Header Nav: About | Review Modes | Code Library | ... │
├────────────┬─────────────────────────────────────────┤
│ Category   │                                         │
│ Sidebar    │         Content Area                    │
│ (left)     │   Text + Static Diagrams                │
│            │   Quiz questions (text only)            │
│            │                                         │
│            │                                         │
└────────────┴─────────────────────────────────────────┘
```

**Characteristics**: WordPress/Elementor shell. Desktop-first ("best viewed on Desktop/Laptop"). Static content. Left sidebar for category navigation. No 3D.

### SlateCamp PI Mode (Current)

```
┌──────────────────────────────────────────────────────────┐
│ ViewportHeader (title · code ref · progress · back)       │
├─────────────┬────────┬──────────────────┬──────┬─────────┤
│ Left Sidebar│ Handle │                  │Handle│ Right   │
│ Controls    │  20px  │   3D Viewport    │ 20px │ Sidebar │
│ ~320px      │        │   (R3F Canvas)   │      │ ~300px  │
│             │        │                  │      │         │
│ Params      │        │  SceneToolbar    │      │ Details │
│ Sliders     │        │  CameraBar       │      │ Complnc │
│ Presets     │        │  LayersPanel     │      │ Source  │
├─────────────┴────────┴──────────────────┴──────┴─────────┤
│ Status Bar                                                │
└──────────────────────────────────────────────────────────┘
```

**Characteristics**: Heavy interaction model. Dual sidebars. Parametric controls. Code compliance panels. Best for engineering exploration.

### SlateCamp LI Mode (Proposed)

```
┌──────────────────────────────────────────────────────────┐
│ ViewportHeader (title · code ref · back)                  │
├──────────────────────────────────────────────────────────┤
│ [🔍 Focus] [⚖ Compare] [🔎 Mistake] [📝 Drill] [📋 Source]│ ← Sub-mode tabs
├──────────────────────────┬───────────────────────────────┤
│                          │ Right Sidebar (280px)         │
│     3D Viewport          │ (adapts per sub-mode)         │
│     (R3F Canvas)         │                               │
│                          │ Focus: Layer toggles          │
│   SceneToolbar           │ Compare: State selector       │
│   CameraBar              │ Mistake: Score + hints        │
│   LayersPanel            │ Drill: Question panel         │
│                          │ Source: Law text              │
│                          │                               │
├──────────────────────────┴───────────────────────────────┤
│ Status Bar                                                │
└──────────────────────────────────────────────────────────┘
```

**Characteristics**: Lightweight interaction model. Single sidebar. Sub-mode tabs for different learning activities. Best for guided educational discovery.

## Sub-Mode-Specific UX

### Focus View UX

```
Right Sidebar:
┌─ Layers ────────────────────┐
│ [Show All] [Hide All]       │
├─────────────────────────────┤
│ Surface Elements            │
│ ☑ Ramp Surface              │
│   Non-slip finish, 1:12 max │
│   BP 344 §4.01              │
│ ☐ Tactile Warning           │
├─────────────────────────────┤
│ Safety Elements             │
│ ☑ Handrail                  │
│ ☐ Edge Curb                 │
│ ☑ Landing Platform          │
└─────────────────────────────┘

3D Viewport: Shows only checked layers. Hover reveals dimension labels.
```

### Compare View UX

```
Right Sidebar:
┌─ Compare States ────────────┐
│ State:                      │
│ ○ Compliant Design          │
│ ● Non-Compliant (Steep)     │
│ ○ BP 220 Standard           │
│ ○ PD 957 Standard           │
├─────────────────────────────┤
│ Differences:                │
│ • Ramp slope: 1:12 → 1:8 ❌ │
│ • Landing length: 1.5m → 0.9m ❌ │
│ • Handrail: Present → Missing ❌ │
└─────────────────────────────┘

3D Viewport: Toggles between states. Highlights differing elements.
```

### Mistake Hunt UX

```
Right Sidebar:
┌─ Mistake Hunt ──────────────┐
│ Score: 3/5                  │
│                             │
│ 🔍 Find the code violation  │
│    in the 3D scene.         │
│                             │
│ ❌ Not the ramp surface     │
│    Hint: Check the handrail │
│                             │
│ Violations found:           │
│ ✅ Missing landing          │
│ ✅ Wrong slope              │
│ ⬜ Find the handrail issue  │
└─────────────────────────────┘

3D Viewport: Learner clicks elements. Violation glows red on find.
```

### Board Drill UX

```
Right Sidebar:
┌─ Board Drill ───────────────┐
│ Question 3/10               │
│                             │
│ Per BP 344, what is the     │
│ minimum clear width of an   │
│ accessible ramp?            │
│                             │
│ ○ 900mm                     │
│ ● 1200mm                    │
│ ○ 1500mm                    │
│ ○ 1000mm                    │
│                             │
│ ✅ Correct!                  │
│ BP 344 §4.02: Minimum clear │
│ width = 1200mm.             │
│ [View in 3D →]              │
│ [Next Question]             │
└─────────────────────────────┘

3D Viewport: Dimension line highlights the 1200mm width.
```

### Source View UX

```
Right Sidebar:
┌─ Source Card ───────────────┐
│ BP 344: Accessibility Law   │
│ Section 4: Ramps            │
│ §4.02 Clear Width           │
│                             │
│ "Ramps shall have a minimum │
│  clear width of 1.20 meters."│
│                             │
│ Source: BP 344 IRR (2009)   │
│ Status: ✅ Source-verified  │
│                             │
│ ⚠ SlateCamp interpretation: │
│ Clear width excludes        │
│ handrail projections.       │
│                             │
│ [📋 Report Issue]           │
│ [📖 Full Wiki Article]      │
└─────────────────────────────┘

3D Viewport: Relevant element highlighted with dimension.
```

## VizCode vs LI: Key UX Advantages

| UX Aspect | VizCode | LI Mode |
|-----------|---------|---------|
| **Spatial understanding** | Static 2D diagrams | Orbitable, zoomable 3D models |
| **Layer exploration** | Single image shows everything | Toggle layers to see construction |
| **Dimensional understanding** | Labeled dimensions on flat image | Dimensions visible in 3D space |
| **Violation detection** | Text-based quiz only | Click to find violations in 3D |
| **Comparison** | Side-by-side text/diagrams | Toggle states in same 3D scene |
| **Source trust** | "Diagrams reflect interpretation" | Every element cites verified source |
| **Mobile access** | "Best viewed on Desktop" | ViewportShell provides mobile layout |
| **Navigation** | Category sidebar → topic pages | Sub-mode tabs within module + Coverage View across modules |

## Visual Design

Both PI and LI share SlateCamp's design system (Tailwind v4, CSS variables, Plus Jakarta Sans, DM Mono for code refs).

LI-specific visual identity:
- **Mode badge**: "Learning" in emerald/green (distinct from PI's primary/blue "Parametric" badges)
- **Sub-mode tabs**: Compact, monospace labels with Phosphor icons
- **Layer toggles**: Clean checkbox list with color indicators
- **Source cards**: Structured card layout with law name, section, text, verification status

## Accessibility

| Requirement | VizCode | LI Mode |
|------------|---------|---------|
| Keyboard navigation | Unknown | Tab through toggles, Space to toggle |
| Screen reader | Unknown | aria-labels on toggles, source cards |
| WebGL fallback | N/A (no 3D) | Static 2D annotated diagram |
| Mobile responsive | Desktop-first warning | ViewportShell mobile bottom sheet |
| Color independence | Unknown | Checkbox state, not color-only |

## Responsive Behavior

LI inherits ViewportShell's mobile behavior:
- **Desktop (≥768px)**: CSS Grid: viewport + right sidebar
- **Mobile (<768px)**: Flex column: canvas + bottom sheet with "Layers" or sub-mode-specific tab
- **Tablet**: Same as desktop, sidebar collapsible

VizCode explicitly states "best viewed on Desktop/Laptop" — LI's responsive mobile support is a competitive advantage.
