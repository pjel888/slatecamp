# 10 — Testing & QA: Competitive Validation

## Testing Strategy

Validate that LI mode not only works correctly but demonstrably beats VizCode on quality, accuracy, and user experience.

## Competitive Validation Test Cases

### Accuracy & Source Trust

| Test | Method | Pass Criteria | VizCode Comparison |
|------|--------|---------------|-------------------|
| Every LI dimension matches source | Automated: compare config values against source card register | 100% match | VizCode: "Diagrams reflect interpretation" — no verification |
| Source cards show correct section/table | Manual: spot-check 10 random source cards | All correct | VizCode: No visible source citations on diagrams |
| Source verification status is accurate | Manual: verify "Source-verified" badges against actual source pack status | No false "verified" claims | VizCode: "Supplementary resource" disclaimer |
| Interpretation boundary is labeled | Manual: check every source card has boundary statement | All present | VizCode: Not present |

### 3D Spatial Accuracy

| Test | Method | Pass Criteria |
|------|--------|---------------|
| Geometry dimensions match source values | Automated: compare GeometryInstruction args against dimension register | 100% match |
| Layer positions are correct relative to each other | Manual: visual inspection of 3 scenes | No z-fighting; layers in correct spatial relationship |
| Human scale reference is accurate (1.7m) | Automated: check HumanSilhouette height | 1.7m ± 0.01m |
| Camera presets frame the model correctly | Manual: cycle through all presets per module | Model is visible and centered in each preset |

### Sub-Mode Behavior

| Test | Method | Pass Criteria |
|------|--------|---------------|
| Focus View: all layers toggle correctly | Automated: toggle each layer, verify mesh visibility | Toggle state matches scene state |
| Focus View: default visible layers match config | Automated: load module, check which meshes render | Matches `defaultVisible` config |
| Compare View: preset switching works | Automated: cycle through compare presets, verify layer states change | Each preset shows correct layers |
| Compare View: state label updates | Visual: verify preset label changes in sidebar | Label matches selected preset |
| Mistake Hunt: correct click identifies violation | Automated: click target element, verify success feedback | Success state triggered |
| Mistake Hunt: wrong click shows hint | Automated: click non-target element, verify hint shown | Hint text appears |
| Board Drill: question loads correctly | Automated: verify question text and options match quiz data | Question matches expected ID |
| Board Drill: correct answer shows success | Automated: select correct option, verify feedback | Green check + rationale |
| Board Drill: wrong answer triggers Repair Path | Automated: select wrong option, verify Repair link appears | Repair Path link present |
| Source View: source card renders with correct data | Automated: verify law, section, text fields | Matches source card data |

### Competitive UX Comparison

| Test | Method | Pass Criteria |
|------|--------|---------------|
| LI mode loads faster than VizCode page navigation | Manual: compare LI module load time vs VizCode page load time | LI ≤ VizCode load time |
| LI layer toggle is more responsive than VizCode page navigation | Manual: time from click to result | <100ms for layer toggle |
| LI 3D view provides spatial understanding not possible in VizCode 2D diagrams | Qualitative: user study or expert review | Users can answer spatial questions (e.g., "which component is behind which?") correctly |
| LI sub-mode switching is faster than VizCode mode navigation | Manual: time sub-mode tab switch | <200ms for sub-mode switch (no page navigation) |

### PI Regression

| Test | Method | Pass Criteria |
|------|--------|---------------|
| All PI modules render identically after LI addition | Automated: visual diff or manual comparison | Zero visual changes |
| All PI tests pass | Automated: run full test suite | 100% pass rate |
| PI module cards unchanged | Automated: snapshot test | Zero snapshot diffs |
| PI sidebar behavior unchanged | Manual: test collapse/expand | Identical behavior |

### Dashboard & Discovery

| Test | Method | Pass Criteria |
|------|--------|---------------|
| Mode filter chips appear when LI modules exist | Automated: render LabBrowser with LI modules | Chips visible |
| Filter "Learning" shows only LI modules | Automated: select filter, check card list | Only `mode: 'LI'` cards visible |
| Filter "All" shows both PI and LI | Automated: verify count matches total | All modules visible |
| LI card shows "Learning" badge | Automated/visual: check badge element | Badge rendered with correct label and color |
| PI card does NOT show "Learning" badge | Automated: check PI cards | No LI badge on PI cards |

### Accessibility

| Test | Method | Pass Criteria |
|------|--------|---------------|
| Layer toggles are keyboard-navigable | Manual: Tab through toggles | All reachable and operable |
| Screen reader announces toggle state | Manual: VoiceOver/NVDA | "Checked" / "Not checked" spoken |
| Sub-mode tabs are keyboard-navigable | Manual: Tab to tabs, Enter to select | All tabs reachable |
| WebGL fallback works | Automated: mock WebGL unavailable | Static fallback image shown |
| Color contrast on "Learning" badge | Automated: axe DevTools | ≥4.5:1 contrast ratio |

### Performance

| Test | Method | Pass Criteria |
|------|--------|---------------|
| LI viewport maintains 60fps | Automated: frame time measurement | ≥55fps average during orbit |
| Layer toggle latency | Automated: measure time from click to mesh change | <16ms (one frame) |
| Sub-mode switch latency | Automated: measure time from click to scene change | <200ms |
| LI bundle size impact | Automated: compare bundle before/after | <10KB gzipped increase (excluding first config) |
| No WebGL context leak | Automated: monitor WebGL context count | Exactly 1 context |

## QA Checklist (Competitive-Focused)

### Pre-Launch Competitive QA

- [ ] Visit VizCode PH. Navigate through Isolation, Comparative, and Game modes.
- [ ] For each VizCode mode, verify the equivalent LI sub-mode exists and is superior:
  - [ ] LI Focus View vs VizCode Isolation Mode — LI has 3D, togglable layers, source cards
  - [ ] LI Compare View vs VizCode Comparative Mode — LI has spatial comparison, dimension highlighting
  - [ ] LI Mistake Hunt vs VizCode Game Mode — LI has spatial violation detection
- [ ] Verify every LI module has source cards that VizCode's equivalent pages don't
- [ ] Verify LI is usable on mobile (VizCode explicitly says "best viewed on Desktop")
- [ ] Verify LI has clear trust signals (source verification, interpretation boundary) that VizCode lacks
- [ ] Verify LI sub-mode switching is faster than VizCode page navigation

### Content Accuracy QA

- [ ] For each LI module, verify every dimension against official source documents
- [ ] Verify source card text matches official code text (not VizCode's interpretive text)
- [ ] Verify "Source-verified" vs "Interpretive explanation" labels are correctly applied
- [ ] Verify no LI content was copied from VizCode (all SlateCamp original + official sources)

### Competitive Messaging QA

- [ ] Dashboard copy doesn't mention VizCode by name (professional positioning)
- [ ] "Learning" badge doesn't imply PI is not for learning (it is, just different)
- [ ] Upgrade/marketing copy focuses on SlateCamp strengths, not VizCode weaknesses
- [ ] Source View preview copy is clear about what's free vs paid

## Test Automation Strategy

### What to Automate

- All type-check tests (bun run type-check)
- All existing PI tests (must pass unchanged)
- LI component unit tests (layer toggles, scene renderer)
- LI config validation tests (schema conformance)
- Dashboard filter logic tests
- Sub-mode state transition tests

### What to Test Manually

- 3D visual accuracy (layer positions, colors, dimensions)
- Competitive UX comparison
- Accessibility (screen reader, keyboard)
- Mobile responsive behavior
- Visual regression in PI modules
- Source card accuracy

## Continuous Validation

After LI launch:
1. **Weekly**: Run full PI regression test suite
2. **Per module**: QA checklist for each new LI module
3. **Monthly**: Competitive review — check if VizCode added new features that LI needs to match
4. **Quarterly**: User research — do students find LI more effective than alternatives?
