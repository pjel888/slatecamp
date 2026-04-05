# SlateCamp — Wiki Web Components Implementation
## Interactive Widgets in MDX Articles via Custom Elements. Zero React Pollution.

---

## THE PROBLEM

Wiki articles (`wiki_articles.content`) are rendered as MDX. MDX compiles to JSX, so `{}` inside `<script>` tags breaks the parser — acorn chokes on any curly brace. No npm package fully solves this. `rehype-raw` only handles static HTML.

## THE SOLUTION

**Web Components (Custom Elements).** MDX sees a hyphenated tag like `<door-configurator-widget>` and treats it as valid HTML — passes it through untouched. The component is defined once in a global JS file, loaded via `_document.tsx` or the root layout. Content authors drop the tag into any article. Zero per-article code. Zero new React components.

---

## ARCHITECTURE

```
public/widgets/
├── slatecamp-widgets.js          ← Global registry. Loaded once. Defines ALL custom elements.
├── modules/
│   ├── bp344-door.js             ← BP 344 Door Width Configurator
│   ├── bp344-ramp.js             ← BP 344 Ramp Slope Calculator
│   ├── bp344-toilet.js           ← BP 344 Accessible Toilet Clearances
│   ├── pd1096-stairway.js        ← PD 1096 Stairway Dimensions
│   ├── pd1096-setback.js         ← PD 1096 Setback/AMBF Calculator
│   └── ra9514-travel.js          ← RA 9514 Travel Distance Visualizer
└── shared/
    ├── compliance-slider.js      ← Reusable slider with red/green compliance feedback
    ├── code-citation.js          ← Inline code reference block
    └── design-tokens.js          ← SlateCamp colors, fonts, shared CSS

src/app/layout.tsx                ← Add <Script> tag to load slatecamp-widgets.js
```

**In any MDX wiki article:**
```mdx
The minimum door clear width for accessible toilets under BP 344 is 900mm.

<bp344-door-widget></bp344-door-widget>

When the width drops below 900mm, wheelchair access becomes physically impossible.
```

That's it. The tag renders an interactive widget inline. No imports, no React, no `{}`.

---

## TOOLS

- **File System** — Read existing layout, wiki renderer, and public directory structure.
- **grep** — Find where wiki content renders, how MDX is processed, and where to inject the script tag.

---

## PHASE 1: Codebase Audit

```bash
# 1. Find the root layout (where the <Script> tag goes)
find src/app -name "layout.tsx" -maxdepth 1

# 2. Find how wiki articles render their content
grep -rn "wiki.*content\|article.*content\|dangerouslySet\|MDXRemote\|serialize\|compileMDX" src/ --include="*.tsx" --include="*.ts" | head -15

# 3. Check if MDX is used or if content is raw HTML
grep -rn "mdx\|MDX\|@next/mdx\|next-mdx-remote\|contentlayer" package.json src/ --include="*.ts" --include="*.tsx" --include="*.json" | head -10

# 4. Check public directory structure
ls -la public/ 2>/dev/null
find public/ -name "*.js" | head -5

# 5. Check if Next.js Script component is already imported anywhere
grep -rn "next/script\|<Script" src/app/ --include="*.tsx" | head -5

# 6. Find the wiki article page component
find src/app -path "*wiki*" -name "page.tsx" | head -5

# 7. Check existing custom element or web component usage
grep -rn "customElements\|HTMLElement\|connectedCallback\|web-component\|custom-element" src/ public/ --include="*.ts" --include="*.tsx" --include="*.js" | head -5
```

**Output:** How content renders (MDX vs raw HTML vs dangerouslySetInnerHTML), where to inject the global script, and whether any web component patterns already exist.

**STOP.** "Phase 1 Complete. Wiki renders via [method]. Reply 'Proceed.'"

---

## PHASE 2: Shared Infrastructure

### 2a. Design Tokens Module

Create: `public/widgets/shared/design-tokens.js`

```javascript
// SlateCamp Design Tokens — shared across all web component widgets
// Matches the design system exactly: Cobalt, Signal colors, Inter/DM Mono/Syne

export const TOKENS = {
  cobalt: '#1B3FC4',
  cobaltDark: '#1535A8',
  cobaltLight: '#EEF2FC',
  signalRed: '#E63329',
  signalRedLight: '#FDE8E7',
  signalGreen: '#1B7A3C',
  signalGreenLight: '#E6F4EC',
  campOrange: '#E8853A',
  cream: '#F2F0EB',
  warmWhite: '#F8F7F5',
  border: '#E8E4DC',
  ink: '#1A2332',
  inkMuted: '#666666',
}

export const SHARED_STYLES = `
  <style>
    :host {
      display: block;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      color: ${TOKENS.ink};
      line-height: 1.6;
      --cobalt: ${TOKENS.cobalt};
      --cobalt-dark: ${TOKENS.cobaltDark};
      --cobalt-light: ${TOKENS.cobaltLight};
      --red: ${TOKENS.signalRed};
      --red-light: ${TOKENS.signalRedLight};
      --green: ${TOKENS.signalGreen};
      --green-light: ${TOKENS.signalGreenLight};
      --orange: ${TOKENS.campOrange};
      --cream: ${TOKENS.cream};
      --warm-white: ${TOKENS.warmWhite};
      --border: ${TOKENS.border};
      --ink: ${TOKENS.ink};
      --ink-muted: ${TOKENS.inkMuted};
    }

    .widget-container {
      background: var(--warm-white);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 24px;
      margin: 24px 0;
    }

    .widget-eyebrow {
      font-family: 'DM Mono', monospace;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      color: var(--cobalt);
      margin-bottom: 8px;
    }

    .widget-title {
      font-family: 'Syne', sans-serif;
      font-weight: 700;
      font-size: 18px;
      color: var(--ink);
      margin-bottom: 4px;
    }

    .widget-description {
      font-size: 13px;
      color: var(--ink-muted);
      margin-bottom: 20px;
      line-height: 1.6;
    }

    .slider-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 0;
      border-bottom: 1px solid var(--border);
    }

    .slider-row:last-child { border-bottom: none; }

    .slider-label {
      font-size: 13px;
      color: var(--ink);
      font-weight: 500;
      min-width: 140px;
    }

    .slider-value {
      font-family: 'DM Mono', monospace;
      font-size: 14px;
      font-weight: 600;
      min-width: 80px;
      text-align: right;
    }

    .slider-value.compliant { color: var(--green); }
    .slider-value.non-compliant { color: var(--red); }

    input[type="range"] {
      flex: 1;
      margin: 0 16px;
      accent-color: var(--cobalt);
      height: 6px;
    }

    .violation-box {
      background: var(--red-light);
      border: 1px solid var(--red);
      border-radius: 8px;
      padding: 12px 16px;
      margin-top: 12px;
      font-size: 12px;
      color: #5A0E08;
      line-height: 1.5;
    }

    .compliant-box {
      background: var(--green-light);
      border: 1px solid var(--green);
      border-radius: 8px;
      padding: 12px 16px;
      margin-top: 12px;
      font-size: 12px;
      color: #0A3B1E;
      line-height: 1.5;
    }

    .code-ref {
      font-family: 'DM Mono', monospace;
      font-size: 11px;
      color: var(--cobalt);
      background: var(--cobalt-light);
      padding: 2px 8px;
      border-radius: 4px;
      display: inline-block;
      margin-top: 8px;
    }

    .human-scale-note {
      font-size: 11px;
      color: var(--ink-muted);
      margin-top: 8px;
      font-style: italic;
    }

    .quiz-prompt {
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid var(--border);
    }

    .quiz-prompt a {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      font-weight: 500;
      color: var(--cobalt);
      text-decoration: none;
    }

    .quiz-prompt a:hover { text-decoration: underline; }
  </style>
`
```

### 2b. Global Widget Registry

Create: `public/widgets/slatecamp-widgets.js`

```javascript
// ============================================================
// SlateCamp Widget Registry
// Loaded once in root layout. Registers all custom elements.
// ============================================================

// Import module scripts dynamically to keep this file lean
const WIDGET_BASE = '/widgets/modules'

const WIDGET_MAP = {
  'bp344-door-widget': `${WIDGET_BASE}/bp344-door.js`,
  'bp344-ramp-widget': `${WIDGET_BASE}/bp344-ramp.js`,
  'bp344-toilet-widget': `${WIDGET_BASE}/bp344-toilet.js`,
  'pd1096-stairway-widget': `${WIDGET_BASE}/pd1096-stairway.js`,
  'pd1096-setback-widget': `${WIDGET_BASE}/pd1096-setback.js`,
  'ra9514-travel-widget': `${WIDGET_BASE}/ra9514-travel.js`,
}

// Lazy-load: only load a widget's JS when it appears in the DOM
const observer = new MutationObserver((mutations) => {
  for (const [tagName, src] of Object.entries(WIDGET_MAP)) {
    if (document.querySelector(tagName) && !customElements.get(tagName)) {
      const script = document.createElement('script')
      script.type = 'module'
      script.src = src
      document.head.appendChild(script)
    }
  }
})

// Observe the entire document for new custom element tags
if (typeof window !== 'undefined') {
  // Initial check for any widgets already in the DOM
  document.addEventListener('DOMContentLoaded', () => {
    for (const [tagName, src] of Object.entries(WIDGET_MAP)) {
      if (document.querySelector(tagName) && !customElements.get(tagName)) {
        const script = document.createElement('script')
        script.type = 'module'
        script.src = src
        document.head.appendChild(script)
      }
    }
  })

  // Watch for dynamically added widgets (SPA navigation)
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  })
}
```

### 2c. Load in Root Layout

Find the root layout and add the script:

```bash
cat src/app/layout.tsx
```

Add the Script import and tag:

```typescript
import Script from 'next/script'

// Inside the <body> tag, before closing:
<Script src="/widgets/slatecamp-widgets.js" strategy="afterInteractive" />
```

**STOP.** "Phase 2 Complete. Infrastructure ready. Reply 'Proceed' for widget modules."

---

## PHASE 3: Widget Modules

### 3a. BP 344 — Door Width Configurator

Create: `public/widgets/modules/bp344-door.js`

```javascript
// BP 344 Accessible Door Width Configurator
// Code: BP 344 (2024 Revised IRR) Section 5.3

const SHARED_STYLES = `
  /* Paste or import shared styles — see design-tokens.js */
  /* For simplicity in a single file, inline the full shared CSS here */
`

class BP344DoorWidget extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this._doorWidth = 900  // mm, BP 344 minimum
    this._doorType = 'single_swing'
  }

  connectedCallback() {
    this.render()
  }

  get doorWidth() { return this._doorWidth }
  set doorWidth(val) {
    this._doorWidth = val
    this.render()
  }

  getCompliance() {
    const w = this._doorWidth
    const type = this._doorType

    // BP 344 (2024 IRR) requirements
    const minWidth = 900  // mm minimum clear width for accessible doors
    const isCompliant = w >= minWidth

    let consequence = ''
    if (w < 800) {
      consequence = 'A standard wheelchair (650mm wide) cannot pass through this opening. This is a critical accessibility violation.'
    } else if (w < 900) {
      consequence = 'A wheelchair can physically pass, but without the required 50mm clearance on each side for hand/arm protection. Non-compliant.'
    }

    return {
      isCompliant,
      minWidth,
      currentWidth: w,
      consequence,
      humanScale: w < 700
        ? 'A person with a walker cannot pass.'
        : w < 800
        ? 'A standard wheelchair barely fits — no clearance for hands.'
        : w < 900
        ? 'A wheelchair passes but below required clearance.'
        : 'Compliant — wheelchair passes with adequate clearance.'
    }
  }

  render() {
    const c = this.getCompliance()
    const pct = Math.min(100, Math.max(0, ((this._doorWidth - 500) / 700) * 100))

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          color: #1A2332;
        }
        .container {
          background: #F8F7F5;
          border: 1px solid #E8E4DC;
          border-radius: 12px;
          padding: 24px;
          margin: 24px 0;
        }
        .eyebrow {
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: #1B3FC4;
          margin-bottom: 8px;
        }
        .title {
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          font-size: 18px;
          margin-bottom: 4px;
        }
        .desc {
          font-size: 13px;
          color: #666;
          margin-bottom: 20px;
        }

        .visual {
          position: relative;
          height: 180px;
          background: #fff;
          border: 1px solid #E8E4DC;
          border-radius: 8px;
          margin-bottom: 16px;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .door-frame {
          position: relative;
          height: 140px;
          border: 3px solid ${c.isCompliant ? '#1B7A3C' : '#E63329'};
          border-bottom: none;
          border-radius: 4px 4px 0 0;
          transition: all 0.15s ease;
          display: flex;
          align-items: flex-end;
          justify-content: center;
        }

        .door-opening {
          height: 100%;
          background: ${c.isCompliant ? 'rgba(27, 122, 60, 0.08)' : 'rgba(230, 51, 41, 0.08)'};
          transition: all 0.15s ease;
        }

        .wheelchair {
          position: absolute;
          bottom: 8px;
          font-size: 28px;
          opacity: ${this._doorWidth >= 800 ? '1' : '0.3'};
          transition: opacity 0.15s;
        }

        .dim-label {
          position: absolute;
          bottom: -22px;
          font-family: 'DM Mono', monospace;
          font-size: 12px;
          font-weight: 600;
          color: ${c.isCompliant ? '#1B7A3C' : '#E63329'};
        }

        .person-ref {
          position: absolute;
          right: 20px;
          bottom: 0;
          width: 16px;
          height: 120px;
          background: rgba(0,0,0,0.06);
          border-radius: 8px 8px 0 0;
        }
        .person-label {
          position: absolute;
          right: 10px;
          top: 10px;
          font-family: 'DM Mono', monospace;
          font-size: 9px;
          color: #999;
        }

        .slider-section {
          padding: 16px 0;
        }
        .slider-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }
        .slider-label {
          font-size: 13px;
          font-weight: 500;
        }
        .slider-val {
          font-family: 'DM Mono', monospace;
          font-size: 14px;
          font-weight: 600;
          color: ${c.isCompliant ? '#1B7A3C' : '#E63329'};
        }
        input[type="range"] {
          width: 100%;
          accent-color: #1B3FC4;
          margin: 4px 0;
        }

        .feedback {
          padding: 12px 16px;
          border-radius: 8px;
          font-size: 12px;
          line-height: 1.6;
          margin-top: 12px;
        }
        .feedback.ok {
          background: #E6F4EC;
          border: 1px solid #1B7A3C;
          color: #0A3B1E;
        }
        .feedback.bad {
          background: #FDE8E7;
          border: 1px solid #E63329;
          color: #5A0E08;
        }
        .code-ref {
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          color: #1B3FC4;
          background: #EEF2FC;
          padding: 2px 8px;
          border-radius: 4px;
          display: inline-block;
          margin-top: 8px;
        }
        .human-note {
          font-size: 11px;
          color: #666;
          margin-top: 8px;
          font-style: italic;
        }
      </style>

      <div class="container">
        <div class="eyebrow">Interactive · BP 344</div>
        <div class="title">Accessible Door Clear Width</div>
        <div class="desc">Adjust the door width and observe compliance with BP 344 (2024 Revised IRR). The wheelchair icon shows whether the opening is passable.</div>

        <div class="visual">
          <div class="door-frame" style="width: ${Math.max(40, this._doorWidth / 10)}px;">
            <div class="door-opening" style="width: 100%;"></div>
            <span class="wheelchair">♿</span>
            <span class="dim-label">${this._doorWidth}mm</span>
          </div>
          <div class="person-ref"></div>
          <div class="person-label">1.7m</div>
        </div>

        <div class="slider-section">
          <div class="slider-header">
            <span class="slider-label">Door Clear Width</span>
            <span class="slider-val">${this._doorWidth}mm</span>
          </div>
          <input type="range" min="500" max="1200" step="10" value="${this._doorWidth}" />
        </div>

        <div class="feedback ${c.isCompliant ? 'ok' : 'bad'}">
          ${c.isCompliant
            ? '✓ Compliant — door clear width meets the minimum 900mm requirement for wheelchair accessibility.'
            : '✗ Non-compliant — minimum clear width is 900mm. Current: ' + this._doorWidth + 'mm. ' + c.consequence
          }
        </div>

        <span class="code-ref">BP 344 (2024 Revised IRR) · Section 5.3 — Accessible Door Requirements</span>
        <div class="human-note">${c.humanScale}</div>
      </div>
    `

    // Wire up slider
    const slider = this.shadowRoot.querySelector('input[type="range"]')
    slider?.addEventListener('input', (e) => {
      this._doorWidth = parseInt(e.target.value)
      this.render()
    })
  }
}

if (!customElements.get('bp344-door-widget')) {
  customElements.define('bp344-door-widget', BP344DoorWidget)
}
```

### 3b. PD 1096 — Stairway Dimensions Widget

Create: `public/widgets/modules/pd1096-stairway.js`

Same pattern. Key parameters:
- Riser height: 100–200mm (PD 1096 §7.2.4)
- Tread depth: 250–300mm
- Clear width: ≥1100mm for exit stairs
- Headroom: ≥2100mm
- Handrail height: 900–1100mm

Multiple sliders. Side-view SVG of stair cross-section that responds to slider values. Person silhouette at scale. Each dimension turns red/green independently.

### 3c. RA 9514 — Travel Distance Widget

Create: `public/widgets/modules/ra9514-travel.js`

Top-down SVG floor plan. Draggable exit door icon. Red zone radius from furthest point. Distance counter updates in real time. "45m maximum" threshold line.

### 3d. Template for Additional Widgets

Every widget follows the same skeleton:

```javascript
class [WidgetName] extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    // Initialize default parameter values
  }

  connectedCallback() {
    this.render()
  }

  getCompliance() {
    // Return { isCompliant, violations[], humanScale }
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>/* SlateCamp tokens + widget-specific styles */</style>
      <div class="container">
        <div class="eyebrow">Interactive · [Code Reference]</div>
        <div class="title">[Widget Title]</div>
        <div class="desc">[Context sentence]</div>

        <!-- Visual representation (SVG or HTML) -->
        <!-- Sliders for each parameter -->
        <!-- Compliance feedback box -->
        <!-- Code citation -->
        <!-- Human scale note -->
      </div>
    `
    // Wire up slider event listeners
  }
}

if (!customElements.get('[tag-name]')) {
  customElements.define('[tag-name]', [WidgetName])
}
```

**STOP.** "Phase 3 Complete. Widget modules built. Reply 'Proceed' for verification."

---

## PHASE 4: Verification

### Structural:
```bash
# All widget files exist
ls -la public/widgets/slatecamp-widgets.js
ls -la public/widgets/modules/

# Script tag in layout
grep -n "slatecamp-widgets" src/app/layout.tsx

# No React component imports needed for widgets
grep -rn "bp344\|pd1096\|ra9514" src/components/ --include="*.tsx" | head -5
# Should return 0 results — widgets live in public/, not components/
```

### Functional test:
1. Create a test wiki article (or use an existing one) with the tag: `<bp344-door-widget></bp344-door-widget>`
2. Navigate to the article page
3. The widget should render inline with the article content
4. Slider should be interactive — dragging changes the door width
5. Compliance feedback updates in real time (green → red transition at 900mm threshold)
6. Shadow DOM isolates widget styles from article styles
7. No console errors about unrecognized elements or missing scripts

### Mobile test:
- Widget renders correctly on mobile viewport (slider still usable)
- No horizontal overflow from the widget
- Text is readable at mobile font sizes

**STOP.** "Phase 4 Complete. Web components verified."

---

## CONTENT AUTHORING GUIDE

For SMEs and content authors — how to add a widget to any wiki article:

### Available Widgets

| Tag | What it does | Code Reference |
|---|---|---|
| `<bp344-door-widget>` | Door clear width configurator | BP 344 §5.3 |
| `<bp344-ramp-widget>` | Ramp slope calculator | BP 344 §5.2 |
| `<bp344-toilet-widget>` | Accessible toilet clearances | BP 344 §5.4 |
| `<pd1096-stairway-widget>` | Stairway dimensions | PD 1096 §7.2 |
| `<pd1096-setback-widget>` | Setback/AMBF calculator | PD 1096 §7.1 |
| `<ra9514-travel-widget>` | Travel distance floor plan | RA 9514 §8.3 |

### How to Use

Place the tag on its own line in the article content, between paragraphs:

```
The minimum door clear width for accessible toilets is 900mm.

<bp344-door-widget></bp344-door-widget>

When non-compliant, wheelchair users cannot safely enter the space.
```

Rules:
- Tag must be on its own line (not inline with text)
- Must use the closing tag (`</bp344-door-widget>`, not self-closing)
- No attributes needed — defaults are code-compliant values
- The widget handles all interactivity internally

### Adding a New Widget

1. Create `public/widgets/modules/[code]-[topic].js` following the template in Phase 3d
2. Add the tag → path mapping to `WIDGET_MAP` in `public/widgets/slatecamp-widgets.js`
3. The MutationObserver auto-loads it when the tag appears in the DOM
4. No React code changes needed. No build step. No imports.

---

## WHAT NOT TO DO

- **Don't use `<script>` tags in MDX content.** MDX will try to parse `{}` as JSX. This is the problem that led to Web Components in the first place.
- **Don't use self-closing tags** (`<bp344-door-widget />`). Some MDX parsers handle this, some don't. Always use explicit closing tags.
- **Don't import widget JS in React components.** Widgets are standalone — they load from `public/` and register themselves. The React app doesn't know or care about them.
- **Don't use React state or hooks inside web components.** Web components use vanilla JS. The Shadow DOM isolates them from React's reconciliation.
- **Don't put shared CSS in each widget file.** Use the `SHARED_STYLES` from `design-tokens.js` or inline the tokens at the top of each widget.
- **Don't use `customElements.define()` without the `if (!customElements.get())` guard.** Hot module reloading in dev will call define twice otherwise, which throws.
- **Don't animate compliance transitions beyond 150ms.** Rams Standard. Slider response must feel instant.
- **Don't add sounds, confetti, or celebration to compliance states.** Green = compliant. Red = non-compliant. That's it.

---

*Execute Phase 1 now. Audit the wiki rendering pipeline.*
