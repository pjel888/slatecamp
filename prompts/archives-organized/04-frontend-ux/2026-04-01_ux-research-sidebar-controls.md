# PD 1096 Site Development Controls — Left Sidebar UX Research & Redesign

## Document Metadata

| Field | Value |
|---|---|
| Module | PD 1096 Rules VII & VIII — 3D Interactive Visualization |
| Scope | Left Sidebar Controls Column — UI Hierarchy & Component Redesign |
| Date | April 2026 |
| Status | Implementation Plan |
| Skill Stack | UX Designer · UX Researcher · 3D Interaction Designer · 3D Information Designer · 3D Visual Rendering · Architectural Diagram Modeler |

---

## 1. UX Research Foundation

### 1.1 Current State Audit

The left sidebar has been split into a functional two-column layout: Interactive Controls (left) and Information Readouts (right). The structural decision is sound. The internal hierarchy, however, has three UX problems:

**Problem 1: Inverted Data Entry Sequence**
Zoning Classification sits *below* Lot Parameters. This violates the principle of logical dependency flow. In PD 1096, the zoning classification (R-1, R-2, C-1, etc.) governs what PSO, ISA, USA, TOSL, BHL, and FLAR values apply from Table VIII.1. Users must select zoning *before* adjusting lot dimensions to see meaningful compliance feedback. The current layout trains users to skip the governing constraint.

**Problem 2: Preset/Violation Clutter**
The Presets section (5 buttons + Reset) and Violation Case Studies section (4 buttons) occupy excessive vertical space with undifferentiated pill-style buttons. Combined, they present 10 equally-weighted action targets. This produces three negative outcomes:
- **Decision paralysis**: 10 buttons of equal visual weight creates a "wall of options"
- **Category confusion**: Presets (configuration loaders) and Violation Case Studies (educational scenarios) serve fundamentally different purposes but look identical except for border color
- **Vertical waste**: ~180px of vertical space consumed before the user reaches the actual parametric controls

**Problem 3: Missing Cognitive Scaffolding**
There is no progressive disclosure. First-time users see every control simultaneously. The presets (which are shortcuts for experienced users) compete for attention with the primary controls (zoning + lot parameters) that every user needs.

### 1.2 User Mental Model Analysis

Based on the SlateCamp UX Researcher persona framework, the primary users of this module are:

**The Anxious First-Taker** (Persona 1): Needs a clear, guided entry point. They don't know what R-1 or C-1 means yet. They need to see Zoning Classification first, understand what it sets, then explore parameters. Presets are irrelevant to them initially.

**The Retaker** (Persona 2): Already has domain knowledge. They want to quickly load a scenario (preset or violation) and study the 3D compliance result. For them, presets are power-user shortcuts.

**Implication**: The UI must serve both — guided entry for beginners, fast shortcuts for returning users. This means: primary controls visible always, shortcuts available but visually subordinate.

### 1.3 Heuristic Violations Identified

| Heuristic | Violation | Severity |
|---|---|---|
| Match between system and real world (Nielsen #2) | Zoning Classification should precede parameters — this mirrors the real architectural workflow | High |
| Recognition over recall (Nielsen #6) | Presets are unlabeled action buttons — no preview of what they configure | Medium |
| Aesthetic and minimalist design (Nielsen #8) | 10 buttons of equal visual weight creates noise | High |
| Consistency and standards (Nielsen #4) | Presets and Violations use different border styles but same layout pattern — inconsistent semantics | Medium |
| Flexibility and efficiency of use (Nielsen #7) | No clear separation between novice path (controls) and expert path (presets) | Medium |

---

## 2. Information Architecture — Proposed Hierarchy

### 2.1 Component Rendering Order (Controls Column)

The proposed order follows the principle of **dependency-first, shortcuts-second**:

```
┌─────────────────────────────────────┐
│  ZONING CLASSIFICATION              │  ← Context setter (governs everything)
│  [Dropdown: R-1 Low-Density Res.]   │
├─────────────────────────────────────┤
│  LOT PARAMETERS                     │  ← Primary controls
│  Lot Width slider                   │
│  Lot Depth slider                   │
│  RROW Width slider                  │
├─────────────────────────────────────┤
│  QUICK SCENARIOS                    │  ← Consolidated presets + violations
│  ▸ Presets (collapsible)            │     Compact, power-user oriented
│  ▸ Violation Case Studies (coll.)   │     Educational, coach-tone
└─────────────────────────────────────┘
```

**Rationale**: Zoning at top because it determines Table VIII.1 values. Lot Parameters second because they're the primary manipulation controls. Quick Scenarios third because they're shortcuts, not the primary workflow.

### 2.2 Component Rendering Order (Information Column)

```
┌─────────────────────────────────────┐
│  LOT SUMMARY                        │  ← Reflects lot parameters
│  TLA, Frontage, Depth, RROW         │
├─────────────────────────────────────┤
│  TABLE VIII.1 REFERENCE             │  ← Reflects zoning classification
│  PSO, ISA, USA, TOSL, BHL, FLAR    │
└─────────────────────────────────────┘
```

No changes needed here — the information column already reads well.

---

## 3. Redesign Specifications

### 3.1 Zoning Classification — Elevated Position

**Before**: Below Lot Parameters, easy to miss.
**After**: Top of controls column, with a subtle section label.

Design spec:
- Section label: "ZONING CLASSIFICATION" in `font-mono text-[11px] tracking-widest text-muted-foreground uppercase`
- Dropdown: Full-width `<Select>` component from Shadcn
- On change: Table VIII.1 Reference card on the right updates immediately
- Visual cue: A subtle bottom border or 16px gap separates this from Lot Parameters
- Add a micro-label below the dropdown: "Sets Table VIII.1 development controls" in `text-xs text-muted-foreground`

### 3.2 Presets — From Button Scatter to Compact Select

**Current Pattern**: 5 pill buttons + Reset button arranged in a wrapping row. Each button is a full-width touch target competing for attention.

**Proposed Pattern: Collapsible Section with Segmented Chips**

The presets section collapses by default for new users. Returning users who have used presets before see it expanded (localStorage preference).

```
┌────────────────────────────────────────┐
│  ▸ PRESETS                      Reset  │  ← Collapsible header
│  ┌──────┬──────────┬──────────────┐    │
│  │ R-1  │  R-2     │  C-1         │    │  ← Compact chip row 1
│  │ Sub  │  Row     │  Comm        │    │
│  └──────┴──────────┴──────────────┘    │
│  ┌──────────────┬─────────────────┐    │
│  │ Narrow Lot   │  Max Height     │    │  ← Compact chip row 2
│  └──────────────┴─────────────────┘    │
└────────────────────────────────────────┘
```

Design spec:
- Chips: `h-8 px-3 rounded-md border border-border text-xs font-mono` — compact, monospaced for code-like feel
- Active chip: `bg-primary text-primary-foreground border-primary`
- Hover: `bg-muted/50`
- Reset: Ghost button aligned right in the section header
- Section header: Clickable row with chevron icon, `font-mono text-[11px] tracking-widest uppercase`
- **Collapsed default height**: Just the header row (~32px vs current ~90px)

### 3.3 Violation Case Studies — From Red Pills to Scenario Cards

**Current Pattern**: 4 red-outlined pill buttons. They look like error states rather than educational tools.

**Proposed Pattern: Collapsible Section with Warning-Toned Mini Cards**

Violations are educational scenarios that intentionally break code rules. The UI should signal "learning opportunity" not "error." Use amber/warm tones instead of red borders, and add micro-descriptions.

```
┌──────────────────────────────────────────────┐
│  ▸ VIOLATION CASE STUDIES               ⚠    │  ← Collapsible with warning icon
│  ┌────────────────────────────────────────┐   │
│  │ ⚠ Lot Encroachment                    │   │  ← Mini card
│  │   Building extends past setback line   │   │
│  ├────────────────────────────────────────┤   │
│  │ ⚠ BHL Violation                       │   │
│  │   Exceeds max building height limit    │   │
│  ├────────────────────────────────────────┤   │
│  │ ⚠ Setback Breach                      │   │
│  │   Footprint violates required setback  │   │
│  ├────────────────────────────────────────┤   │
│  │ ⚠ TGFA Overbuilt                      │   │
│  │   Total GFA exceeds FLAR allowance     │   │
│  └────────────────────────────────────────┘   │
└──────────────────────────────────────────────┘
```

Design spec:
- Section header: Same pattern as Presets — `font-mono text-[11px] tracking-widest uppercase`, collapsible
- Mini cards: `p-2 rounded-md border-l-2 border-l-amber-500 bg-amber-50/50 dark:bg-amber-950/20`
- Title: `text-xs font-medium` with `⚠` icon in amber
- Description: `text-[10px] text-muted-foreground leading-tight`
- On click: Loads the violation scenario into the 3D canvas
- Active state: `border-l-amber-600 bg-amber-100/70 dark:bg-amber-900/30`
- **Collapsed default height**: Just the header row
- **Cognitive benefit**: Descriptions help the Anxious First-Taker understand what each violation demonstrates before clicking

### 3.4 Spacing & Typography Audit

**Section gaps**: 24px between Zoning → Lot Parameters → Quick Scenarios (using Tailwind `space-y-6`)

**Section labels**: All section headers use `font-mono text-[11px] tracking-[0.1em] uppercase text-muted-foreground` — consistent monospaced hierarchy from the design system

**Slider labels**: `text-sm font-medium` for parameter names, `font-mono text-sm` for values — numeric values in monospace for alignment

**Card padding in information column**: `p-4` consistent padding, `space-y-2` between rows

**Overall column padding**: `p-4` on both columns with a `border-r border-border` on the controls column

---

## 4. Interaction Design Alignment (3D Lab Context)

### 4.1 How Sidebar Controls Map to 3D Canvas

The controls column drives the parametric 3D model via Zustand store updates:

| Control | Store Action | 3D Effect |
|---|---|---|
| Zoning Classification | `setZoning(zone)` | Updates Table VIII.1 values, recalculates compliance metrics |
| Lot Width slider | `setLotWidth(value)` | Rebuilds lot geometry, updates setback lines |
| Lot Depth slider | `setLotDepth(value)` | Rebuilds lot geometry, updates buildable envelope |
| RROW Width slider | `setRROW(value)` | Adjusts road right-of-way, recalculates front setback |
| Preset selection | `loadPreset(preset)` | Batch-updates all controls and rebuilds entire scene |
| Violation selection | `loadViolation(scenario)` | Loads intentionally non-compliant configuration |

### 4.2 On-Demand Rendering Consideration

Per the R3F performance constraint (`frameloop="demand"`), every store update must call `invalidate()` to trigger a re-render. The sidebar redesign does not change this — it only restructures the control order, not the state flow.

### 4.3 Information Panel Sync

When Zoning Classification changes, the Table VIII.1 Reference card must update synchronously. The reactive binding already exists via Zustand `useStore(state => state.zoning)`. No new wiring needed for the reorder.

---

## 5. Mayer's Coherence Check (3D Information Design)

The 3D Information Design principle states: every piece of information must earn its screen presence.

**Presets**: Pass — they reduce setup time for experienced users exploring comparative scenarios.

**Violation Case Studies**: Pass with enhancement — they serve Bloom's Taxonomy Level 4 (Analysis). Adding micro-descriptions improves their educational value by explaining *what* the violation demonstrates before the user clicks.

**Zoning Classification at top**: Pass — it provides Layer 0 (orientation) context. The student knows the governance framework before they manipulate any parameter.

---

## 6. Implementation Checklist

### Phase 1: Reorder (Low risk, high impact)
- [ ] Move `<ZoningClassification />` above `<LotParameters />`
- [ ] Add "Sets Table VIII.1 development controls" helper text below dropdown
- [ ] Verify Table VIII.1 Reference card updates on zoning change
- [ ] Test on mobile (controls column should stack vertically)

### Phase 2: Presets Redesign (Medium risk)
- [ ] Convert pill buttons to compact chips in a CSS grid
- [ ] Wrap in collapsible `<Collapsible>` component (Shadcn)
- [ ] Move Reset to section header row
- [ ] Add active state styling for selected preset
- [ ] Store collapse preference in localStorage

### Phase 3: Violation Case Studies Redesign (Medium risk)
- [ ] Convert red pills to amber-toned mini cards with descriptions
- [ ] Wrap in collapsible `<Collapsible>` component
- [ ] Write micro-description copy for each violation scenario
- [ ] Add active state styling for loaded violation
- [ ] Test that violations correctly trigger the compliance overlay in 3D

### Phase 4: Polish & Test
- [ ] Audit spacing: 24px section gaps, 16px card padding
- [ ] Verify monospaced typography on all section headers and numeric values
- [ ] Test mobile responsive behavior (single-column stack at < 768px)
- [ ] Run accessibility audit: focus order, ARIA labels, contrast ratios
- [ ] Test with screen reader (VoiceOver / TalkBack)

---

## 7. Design Rationale Summary

| Decision | Rationale |
|---|---|
| Zoning at top | Dependency-first: it governs Table VIII.1, so users need it set before parameters make sense |
| Presets as compact chips | Reduces vertical space by ~60%, signals "shortcut" not "primary control" |
| Violations as amber mini cards | Reframes from "error" to "learning scenario", adds educational context via descriptions |
| Collapsible sections | Progressive disclosure: novices see primary controls first, power users expand shortcuts |
| Monospaced section headers | Design system consistency — matches the architectural/technical tone of the 3D Lab |
| No structural changes to info column | Information readouts are already well-organized; changes are controls-only |

---

## 8. Violation Case Study Copy

| Scenario | Title | Description |
|---|---|---|
| 1 | Lot Encroachment | Building footprint extends past the required setback line |
| 2 | BHL Violation | Proposed height exceeds the maximum building height limit for this zone |
| 3 | Setback Breach | Building footprint violates the required front, side, or rear setback |
| 4 | TGFA Overbuilt | Total gross floor area exceeds the floor-area-ratio allowance |

---

*This document is a SlateCamp internal implementation plan. All recommendations are grounded in the SlateCamp Design System, UX Research Persona Framework, 3D Interaction Design Guide, and 3D Information Design Guide.*
