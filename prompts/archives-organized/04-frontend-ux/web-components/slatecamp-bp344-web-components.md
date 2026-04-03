# SlateCamp — Convert BP 344 Wiki Widgets to Web Components
## 6 React Components → 6 Custom Elements. One Global Loader. Zero MDX Pollution.

---

## THE PROBLEM

The file `doors-corridors-washrooms-bp344.mdx` has 6 React components exported inline at the top (353 lines of component code before the article content starts). This works but creates problems:
- Every component's state logic, SVG rendering, and compliance math lives inside the MDX file
- Any future MDX parser change or `{}` interaction breaks the entire article
- Components can't be reused across articles without copy-paste
- The MDX provider must be configured to handle inline exports

## THE SOLUTION

Convert all 6 components to **Web Components (Custom Elements)** using Shadow DOM. The article content replaces React JSX tags with HTML custom element tags. The component logic moves to standalone `.js` files in `public/widgets/`. MDX passes hyphenated tags through untouched — zero parsing risk.

## THE 6 COMPONENTS TO CONVERT

| # | React Component | Web Component Tag | What It Does | Lines |
|---|---|---|---|---|
| 1 | `ComparisonTable` | `<bp344-comparison-table>` | 20-row 2013↔2024 IRR comparison. Click row → detail expands. | ~67 |
| 2 | `DoorConfigurator` | `<bp344-door-configurator>` | 5 sliders (width, approach space, threshold, hardware height, closer force). SVG door diagram. Real-time compliance. | ~62 |
| 3 | `CorridorVisualizer` | `<bp344-corridor-visualizer>` | Radio toggle (single WC / two WC). Width slider. SVG corridor cross-section. | ~43 |
| 4 | `CubicleChecker` | `<bp344-cubicle-checker>` | 4 number inputs + swing toggle. SVG floor plan. WC + grab bar + turning space. | ~70 |
| 5 | `GrabBarExplainer` | `<bp344-grab-bar-explainer>` | Interactive grab bar dimension visualizer with L-type and flip-up display. | ~50 |
| 6 | `RecallDrill` | `<bp344-recall-drill>` | 40-question shuffled flashcard drill. Reveal → Next. ⟳ marks 2024 changes. | ~72 |

---

## TOOLS

- **File System** — Read the uploaded MDX file, existing layout, wiki renderer, and public directory.
- **grep** — Find MDX processing pipeline, Script tags, public directory structure.

---

## PHASE 1: Setup

### 1a. Verify infrastructure

```bash
# Check if the widgets directory and loader already exist from previous prompt
ls -la public/widgets/ 2>/dev/null
ls -la public/widgets/modules/ 2>/dev/null
cat public/widgets/slatecamp-widgets.js 2>/dev/null | head -20

# Check if Script tag is already in layout
grep -n "slatecamp-widgets\|widgets" src/app/layout.tsx | head -5

# Read the uploaded MDX file for exact component logic
cat /mnt/user-data/uploads/doors-corridors-washrooms-bp344.mdx | head -10
```

If the widgets infrastructure doesn't exist yet, create it:

```bash
mkdir -p public/widgets/modules
```

### 1b. Create or update the global loader

If `public/widgets/slatecamp-widgets.js` doesn't exist, create it. If it does, ADD the 6 new tags to the `WIDGET_MAP`:

```javascript
// Add to WIDGET_MAP in slatecamp-widgets.js:
'bp344-comparison-table': '/widgets/modules/bp344-comparison-table.js',
'bp344-door-configurator': '/widgets/modules/bp344-door-configurator.js',
'bp344-corridor-visualizer': '/widgets/modules/bp344-corridor-visualizer.js',
'bp344-cubicle-checker': '/widgets/modules/bp344-cubicle-checker.js',
'bp344-grab-bar-explainer': '/widgets/modules/bp344-grab-bar-explainer.js',
'bp344-recall-drill': '/widgets/modules/bp344-recall-drill.js',
```

### 1c. Ensure Script tag is in the root layout

```bash
grep -n "slatecamp-widgets" src/app/layout.tsx
```

If not found, add to the root layout inside `<body>` before closing tag:
```tsx
import Script from 'next/script'
// ...
<Script src="/widgets/slatecamp-widgets.js" strategy="afterInteractive" />
```

**STOP.** "Phase 1 Complete. Infrastructure ready. Reply 'Proceed.'"

---

## PHASE 2: Convert All 6 Components

### SHARED DESIGN TOKENS

Every widget uses this same CSS. Define it once as a constant string at the top of each module file (or in a shared import):

```javascript
const SLATECAMP_WIDGET_CSS = `
  :host {
    display: block;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    color: #1A2332;
    line-height: 1.6;
  }
  .wc { background: #F8F7F5; border: 1px solid #d0cec7; border-radius: 10px; padding: 20px 24px; margin: 20px 0; }
  .eyebrow { font-family: 'DM Mono', monospace; font-size: 10px; text-transform: uppercase; letter-spacing: 0.08em; color: #1B3FC4; margin-bottom: 8px; }
  .desc { font-size: 13px; color: #444; margin: 0 0 14px; }
  .ok-box { border-radius: 8px; padding: 12px 14px; font-size: 12px; line-height: 1.8; margin-bottom: 12px; background: #e8f5ee; border: 1px solid #1B7A3C; color: #0f4a24; }
  .bad-box { border-radius: 8px; padding: 12px 14px; font-size: 12px; line-height: 1.8; margin-bottom: 12px; background: #fdf0ef; border: 1px solid #E63329; color: #5a1a16; }
  .detail-box { margin-top: 14px; padding: 12px 16px; background: #fff; border: 1.5px solid #1B3FC4; border-radius: 8px; font-size: 13px; color: #222; }
  input[type="number"] { width: 100px; padding: 7px 9px; border: 1.5px solid #ccc; border-radius: 6px; font-size: 13px; font-family: 'DM Mono', monospace; }
  input[type="range"] { flex: 1; accent-color: #1B3FC4; }
  .field-row { display: flex; gap: 14px; flex-wrap: wrap; margin-bottom: 12px; }
  .field-label { display: block; font-size: 11px; font-weight: 600; color: #555; margin-bottom: 4px; text-transform: uppercase; }
  .btn-primary { padding: 8px 20px; background: #1B3FC4; color: #fff; border: none; border-radius: 6px; font-size: 13px; cursor: pointer; font-family: inherit; }
  .btn-secondary { padding: 8px 20px; background: #fff; color: #1B3FC4; border: 1.5px solid #1B3FC4; border-radius: 6px; font-size: 13px; cursor: pointer; font-family: inherit; }
  .code-ref { font-family: 'DM Mono', monospace; font-size: 11px; color: #1B3FC4; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; }
  th { padding: 8px 10px; text-align: left; font-weight: 600; }
  td { padding: 8px 10px; border-bottom: 1px solid #e8e6e0; }
  tr { cursor: pointer; }
  tr:hover { background: rgba(27,63,196,0.04); }
`
```

### CONVERSION RULES (Apply to every component)

1. **Read the React component from the uploaded MDX file** — understand every `useState`, every conditional, every SVG element
2. **Replace `useState` with class properties** — `this._width = 900` instead of `const [width, setWidth] = useState(900)`
3. **Replace JSX with template literals** — `this.shadowRoot.innerHTML = \`...\``
4. **Replace event handlers** — Wire up `addEventListener` on elements AFTER `innerHTML` is set (at the bottom of `render()`)
5. **Replace conditional rendering** — Use ternary operators in template literals: `${condition ? '<div>yes</div>' : ''}`
6. **Replace `.map()` JSX arrays** — Use `.map().join('')` in template literals
7. **Use Shadow DOM** — `this.attachShadow({ mode: 'open' })` in constructor. All styles scoped.
8. **Guard against double-define** — `if (!customElements.get('tag-name')) customElements.define(...)`
9. **Keep ALL compliance logic EXACTLY as-is** — the code values, thresholds, and validation logic from the React components are correct and must not change

### COMPONENT 1: `<bp344-comparison-table>`

**Source:** Lines 3–68 of the MDX file. 20 rows of 2013↔2024 IRR data. Click a row to expand detail.

Create: `public/widgets/modules/bp344-comparison-table.js`

**Key conversion points:**
- `useState(null)` for `activeRow` → `this._activeRow = null`
- `data` array is static → define as class property or const
- `.map()` over data → `.map().join('')` in template literal
- Click handler on `<tr>` → `addEventListener('click')` on each row after render
- Conditional detail box → ternary in template literal

```javascript
class BP344ComparisonTable extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this._activeRow = null
    this._data = [
      // PASTE THE EXACT data ARRAY FROM THE MDX (lines 6-25)
      // All 20 rows with elem, old, n, src, detail fields
      { elem: 'Door — clear level space', old: '1,500 × 1,500 mm', n: '1,800 × 1,800 mm', src: 'C.2.6', detail: 'The turning circle grew...' },
      // ... all 20 rows exactly as in the MDX
    ]
  }

  connectedCallback() { this.render() }

  render() {
    const d = this._data
    const active = this._activeRow

    this.shadowRoot.innerHTML = `
      <style>${SLATECAMP_WIDGET_CSS}</style>
      <div class="wc">
        <div class="eyebrow">Interactive — 2024 vs 2013 Comparison</div>
        <p class="desc">Click any row to see what changed and why it matters for the ALE.</p>
        <div style="overflow-x:auto">
          <table>
            <thead>
              <tr style="background:#1B3FC4">
                <th style="color:#fff">Element</th>
                <th style="text-align:center;color:#fff">2013 IRR</th>
                <th style="text-align:center;color:#F5A623">2024 IRR ★</th>
                <th style="color:#fff">Source</th>
              </tr>
            </thead>
            <tbody>
              ${d.map((row, i) => {
                const changed = row.old !== row.n
                const isActive = active === i
                return `<tr data-idx="${i}" style="background:${isActive ? '#eef1fb' : 'transparent'}">
                  <td style="font-weight:500;color:#222">${row.elem}</td>
                  <td style="text-align:center;color:#888;font-family:'DM Mono',monospace;font-size:11px">${row.old}</td>
                  <td style="text-align:center;font-family:'DM Mono',monospace;font-size:11px;font-weight:600;color:${changed ? '#E63329' : '#1B7A3C'}">${row.n} ${changed ? '★' : '✓'}</td>
                  <td style="font-size:11px;color:#555">${row.src}</td>
                </tr>`
              }).join('')}
            </tbody>
          </table>
        </div>
        ${active !== null ? `
          <div class="detail-box">
            <strong style="color:#1B3FC4">${d[active].elem}</strong>
            — <span class="code-ref">${d[active].src}</span>
            <br><br>
            ${d[active].detail}
          </div>
        ` : ''}
      </div>
    `

    // Wire click handlers on rows
    this.shadowRoot.querySelectorAll('tr[data-idx]').forEach(tr => {
      tr.addEventListener('click', () => {
        const idx = parseInt(tr.dataset.idx)
        this._activeRow = this._activeRow === idx ? null : idx
        this.render()
      })
    })
  }
}

if (!customElements.get('bp344-comparison-table')) {
  customElements.define('bp344-comparison-table', BP344ComparisonTable)
}
```

### COMPONENT 2: `<bp344-door-configurator>`

**Source:** Lines 70–131. 5 parameters (width, approach space, threshold, hardware height, closer force). SVG door diagram.

Create: `public/widgets/modules/bp344-door-configurator.js`

**Key conversion points:**
- 5 `useState` calls → 5 class properties: `this._width=900, this._space=1800, this._thresh=0, this._hwH=900, this._force=2.0`
- Compliance logic (lines 77–88) → move to a `getIssues()` method that returns `{ issues, passes, ok }`
- SVG (lines 117–129) → template literal SVG. Convert React SVG attributes (`strokeWidth` → `stroke-width`, `strokeDasharray` → `stroke-dasharray`, `textAnchor` → `text-anchor`)
- Number inputs → `<input type="number">` with `addEventListener('input')`
- **CRITICAL: All compliance thresholds must match the MDX exactly** — width≥900, space≥1800, thresh≤12, hwH 800–1000, force≤2.0

### COMPONENT 3: `<bp344-corridor-visualizer>`

**Source:** Lines 134–176. Radio toggle (single/double WC), width slider, SVG.

Create: `public/widgets/modules/bp344-corridor-visualizer.js`

**Key conversion points:**
- `useState('single')` for mode → `this._mode = 'single'`
- `useState(1500)` for corridor width → `this._cw = 1500`
- Radio inputs → wire `addEventListener('change')` on each radio
- SVG corridor cross-section → template literal. Convert JSX SVG attrs.
- Req threshold changes with mode: single=1500, double=1800

### COMPONENT 4: `<bp344-cubicle-checker>`

**Source:** Lines 178–279 (approx). 4 number inputs + swing toggle. SVG floor plan with WC position, grab bars, turning space, door swing arc.

Create: `public/widgets/modules/bp344-cubicle-checker.js`

**Key conversion points:**
- 5 `useState` calls → `this._w=1800, this._d=1800, this._door=900, this._turn=1800, this._swing='out'`
- Complex SVG with multiple elements (WC rectangle, grab bar lines, turning circle, door arc) → template literal
- Select dropdown for swing direction → `<select>` with `addEventListener('change')`
- Compliance checks: w≥1800, d≥1800, door≥900, turn≥1800, swing==='out'

### COMPONENT 5: `<bp344-grab-bar-explainer>`

**Source:** ~Lines 230–280 (the truncated section). Interactive grab bar dimension display.

Create: `public/widgets/modules/bp344-grab-bar-explainer.js`

Read the exact component from the MDX file. Convert the same way. Key values:
- Height above seat: 300mm (exact, 2024)
- Diameter: 30–40mm (2024)
- Wall clearance: 50mm
- Outer face to wall: 100mm
- Face to WC centerline: 350mm

### COMPONENT 6: `<bp344-recall-drill>`

**Source:** Lines 280–353. 40-question flashcard drill with shuffle + reveal/next cycle.

Create: `public/widgets/modules/bp344-recall-drill.js`

**Key conversion points:**
- `items` array (40 objects with q, a, src) → class property, copy EXACTLY from MDX
- Fisher-Yates shuffle function → keep as-is (vanilla JS already)
- `useState(() => shuffle(items))` → `this._deck = this.shuffle([...this._items])`
- `useState(0)` for idx → `this._idx = 0`
- `useState(false)` for revealed → `this._revealed = false`
- Reveal button → Next button toggle → wire `addEventListener('click')` on each
- Counter display: `${this._idx + 1} / ${this._deck.length}`

---

## PHASE 3: Update the MDX Article Content

After all 6 web component files are created, update the MDX file:

### 3a. Remove the React component exports

Delete lines 1–353 (everything before `# Doors, Corridors & Washrooms — BP 344 / RA 9442`). The `import { useState } from 'react'` and all 6 `export const` blocks are gone.

### 3b. Replace JSX tags with custom element tags

Find and replace these 6 lines in the article body:

```
<ComparisonTable />  →  <bp344-comparison-table></bp344-comparison-table>
<DoorConfigurator /> →  <bp344-door-configurator></bp344-door-configurator>
<CorridorVisualizer /> → <bp344-corridor-visualizer></bp344-corridor-visualizer>
<CubicleChecker />   →  <bp344-cubicle-checker></bp344-cubicle-checker>
<GrabBarExplainer /> →  <bp344-grab-bar-explainer></bp344-grab-bar-explainer>
<RecallDrill />      →  <bp344-recall-drill></bp344-recall-drill>
```

**Always use explicit closing tags** — not self-closing. MDX handles `<bp344-door-configurator></bp344-door-configurator>` but some parsers choke on `<bp344-door-configurator />`.

### 3c. Save the cleaned MDX

The article is now pure content — no imports, no exports, no React code. The 6 custom element tags render the interactive widgets via the global loader.

**STOP.** "Phase 3 Complete. MDX cleaned. Reply 'Proceed' for verification."

---

## PHASE 4: Verification

### File structure:
```bash
# All 6 widget files exist
ls -la public/widgets/modules/bp344-*.js
# Should show 6 files

# Loader has all 6 entries
grep "bp344" public/widgets/slatecamp-widgets.js
# Should show 6 WIDGET_MAP entries

# MDX file has no React imports
head -5 [path-to-mdx-file]
# Should NOT start with 'import { useState }'

# MDX file uses custom element tags
grep "bp344-" [path-to-mdx-file]
# Should show 6 custom element tags
```

### Functional test for EACH widget:

| Widget | Test | Expected |
|---|---|---|
| `<bp344-comparison-table>` | Click row 1 (Door — clear level space) | Detail box expands below table showing "The turning circle grew..." |
| `<bp344-comparison-table>` | Click same row again | Detail box collapses |
| `<bp344-door-configurator>` | Set width to 800 | Red violation: "Clear width 800mm < 900mm minimum (C.2.1)" |
| `<bp344-door-configurator>` | Set threshold to 15 | Red violation: "Threshold 15mm exceeds 12mm maximum (C.3.1) — 2024 updated, was 19mm" |
| `<bp344-door-configurator>` | Set force to 3.0 | Red violation: "Door closer force 3.0kg exceeds 2.0kg maximum (C.2.4)" |
| `<bp344-door-configurator>` | All compliant values | Green: "✓ All parameters compliant" |
| `<bp344-corridor-visualizer>` | Select "Two wheelchairs", set width to 1600 | Red: "1600mm is below the 2024 IRR 1800mm minimum" |
| `<bp344-corridor-visualizer>` | Select "Single WC", set width to 1500 | Green: "1500mm meets the 2024 IRR 1500mm minimum" |
| `<bp344-cubicle-checker>` | Set width to 1700 | Red: "Width 1700mm < 1,800mm (C.6.3.a) — 2024: now square, was 1,700mm" |
| `<bp344-cubicle-checker>` | Set swing to "In" | Red: "Door swings inward — must swing outward (C.6.14)" |
| `<bp344-grab-bar-explainer>` | Interactive elements respond to input | Dimensions update visually |
| `<bp344-recall-drill>` | Click "Reveal" | Answer shows in green box |
| `<bp344-recall-drill>` | Click "Next →" | New question appears, counter increments |
| `<bp344-recall-drill>` | Reach end of deck | Deck reshuffles, counter resets to 1 |

### Cross-browser:
- [ ] Chrome desktop — all 6 widgets render and interact
- [ ] Safari — Shadow DOM works
- [ ] Mobile viewport — widgets don't overflow, inputs are usable
- [ ] No console errors about undefined custom elements

---

## CRITICAL: DO NOT CHANGE THE COMPLIANCE LOGIC

The React components contain EXACT BP 344 (2024 Revised IRR) dimensional values and compliance thresholds. These are legally sourced from the Official Gazette. When converting to web components:

- **DO NOT** change any threshold value (900mm doors, 1800mm approach space, 12mm threshold, 2.0kg closer force, etc.)
- **DO NOT** change any comparison table data (all 20 rows with old/new values and section references)
- **DO NOT** change any recall drill question or answer (all 40 items with exact values and sources)
- **DO NOT** change any violation message text — these are educational content, not UI chrome
- **DO** copy the compliance logic character-for-character from the React components

The web component conversion changes the DELIVERY MECHANISM (React → Custom Element), not the CONTENT or LOGIC.

---

## WHAT NOT TO DO

- **Don't leave React imports in the MDX file.** The whole point is zero React in the content file.
- **Don't use self-closing custom element tags.** Always `<tag></tag>`, never `<tag />`.
- **Don't skip any of the 6 components.** All 6 must be converted for the article to render correctly.
- **Don't use React hooks or JSX inside web components.** Pure vanilla JS. `this.shadowRoot.innerHTML` with template literals. `addEventListener` for interactivity.
- **Don't forget to convert JSX SVG attributes.** `strokeWidth` → `stroke-width`, `strokeDasharray` → `stroke-dasharray`, `textAnchor` → `text-anchor`, `fontSize` → `font-size`.
- **Don't put styles outside Shadow DOM.** All CSS goes inside `<style>` within `shadowRoot.innerHTML`. Widget styles must not leak into the article.
- **Don't render all 6 widgets eagerly.** The MutationObserver in `slatecamp-widgets.js` lazy-loads each widget's JS only when its tag appears in the DOM.

---

*Execute Phase 1 now. Verify infrastructure and read the MDX file.*
