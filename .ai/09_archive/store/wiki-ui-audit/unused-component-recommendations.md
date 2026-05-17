# Unused Wiki UI Components — Article Match Recommendations

**Date:** 2026-05-04
**Goal:** Get all 18 unused MDX components used in at least one article

---

## Component Usage Recommendations

### 1. FormulaBlock → `lea-dsgn-010-01-core-concept`
**Why:** Article already has an explicit formula: "Total Parking Slots = Σ(Use Type × Ratio) + Accessible Spaces" with a worked example showing step-by-step calculation.

**Current MDX** (conceptual):
```
**Total Parking Slots = Σ(Use Type × Ratio) + Accessible Spaces**
**Step 1:** Office: 800 m² ÷ 125 m²/slot = 6.4 → 7 slots
**Step 2:** Restaurant dining: 200 m² ÷ 30 m²/slot = 6.7 → 7 slots
```

**Proposed replacement:**
```mdx
<FormulaBlock
  label="Parking Calculation"
  steps={[
    { variable: "Slots", operator: "=", operands: ["Σ(Use Type × Ratio)", "Accessible Spaces"] },
    { variable: "Office", operator: "=", operands: ["800 m²", "125 m²/slot"], comment: "6.4 → 7 slots" },
    { variable: "Restaurant", operator: "=", operands: ["200 m²", "30 m²/slot"], comment: "6.7 → 7 slots" },
  ]}
/>
```

---

### 2. Tabs → `fire-resistive-construction-ratings`
**Why:** Article compares multiple construction types side-by-side. Currently has a comparison table and multiple media comparison diagrams. A tabbed interface would let readers switch between Type I/II/III/IV/V construction views.

**Proposed usage:** Wrap each construction-type section in a Tab:
```mdx
<Tabs defaultTab="type-I">
  <Tab label="Type I (3-4 hr)" value="type-I">
    ... existing Type I content ...
  </Tab>
  <Tab label="Type II (1-2 hr)" value="type-II">
    ... existing Type II content ...
  </Tab>
  ...
</Tabs>
```

---

### 3. RevealBlock → `lea-theo-002-01-core-concept`
**Why:** Article explicitly says "Test yourself by categorizing random elements during study sessions" — perfect for a self-test reveal pattern.

**Proposed usage:**
```mdx
<RevealBlock prompt="Can you categorize these elements?" label="Drag to reveal answers">
- **Rhythm** → Principle (repetition creating visual movement)
- **Texture** → Element (surface quality)
- **Proportion** → Principle (relationship between parts)
</RevealBlock>
```

---

### 4. Mermaid → `pd-1096-rule-viii-setbacks-and-easements`
**Why:** Article ALREADY has a text-based flowchart:
```
Step 1: Identify LOT TYPE (7 types)
         ↓
Step 2: Check ZONING CLASSIFICATION → Get PSO, FLAR, BHL
         ↓
Step 3: Deduct EASEMENTS
```
This is a perfect flowchart candidate.

**Proposed replacement:**
```mdx
<Mermaid chart={`
flowchart TD
    A["Step 1: Identify LOT TYPE<br/>(7 types — Figs. 8)"] --> B["Step 2: Check ZONING CLASSIFICATION<br/>→ Get PSO, FLAR, BHL from Table VIII.1"]
    B --> C["Step 3: Deduct EASEMENTS<br/>(PD 1067 Art. 51)"]
    C --> D["Step 4: Apply SETBACKS<br/>based on BHL & lot type"]
    D --> E["Step 5: Calculate BUILDABLE AREA"]
`} />
```

---

### 5. AlertBox → `lea-prac-frm-007-reciprocity-principles-in-architectural-practice`
**Why:** Article already uses both Warn AND Note callouts — showing multi-level alert needs. AlertBox adds the `danger` and `requirement` variants.

**Proposed usage:** Replace one Warn with AlertBox type="danger" for higher severity:
```mdx
<AlertBox type="danger">
Violating reciprocity rules can result in license revocation and legal liability under RA 9266.
</AlertBox>
```

---

### 6. CalloutBox → `lea-theo-005-02-core-concept`
**Why:** Article about architectural theory with frequently-tested content. Mentions "most tested" concepts.

**Proposed usage:**
```mdx
<CalloutBox type="most-tested">
The distinction between Le Corbusier's functionalism and Mies van der Rohe's minimalism appears in nearly every LEA exam cycle.
</CalloutBox>
```

---

### 7. AuthorityContent → `prefabricated-constructions`
**Why:** 194 legal citations — the most heavily-referenced article in the corpus. Currently no legal authority callout.

**Proposed usage:**
```mdx
<AuthorityContent>
Per PD 1096 Section 104 and the 2004 Revised IRR, prefabricated assemblies must meet fire-resistance ratings equivalent to Type I construction when used in buildings over 15 meters in height.
</AuthorityContent>
```

---

### 8. WikiArticleHero → ANY article without a hero
**Why:** 461+ articles lack a hero section. The WikiArticleHero provides subject tag, difficulty badge, read time, and title — giving the article a professional header.

**Proposed usage** (at top of any article):
```mdx
<WikiArticleHero
  subject="Building Laws"
  difficulty="Intermediate"
  readTime="8 min"
  title="Fire-Resistive Construction Ratings"
  leaTestsYou="Matching construction types to required fire ratings"
/>
```

---

### 9. WikiPartHeader → `accessible-seating-in-assembly-areas` (13 h2 sections)
**Why:** Longest article with 13 h2 sections. Needs visual part dividers.

**Proposed usage** (before major section groups):
```mdx
<WikiPartHeader partNumber={1} title="Code Requirements" subtitle="BP 344 vs PD 1096" />
```

---

### 10. InlineQuiz → `top-50-traps-2024-irr`
**Why:** Article about common exam traps — natural fit for quick-check quizzes after each trap.

**Proposed usage:**
```mdx
<InlineQuiz
  question="What is the minimum corridor width for a Group A occupancy with 120 occupants?"
  options={[
    { letter: "A", text: "1.10 meters" },
    { letter: "B", text: "1.20 meters", correct: true },
    { letter: "C", text: "1.50 meters" },
    { letter: "D", text: "2.00 meters" },
  ]}
  rationale="PD 1096 Table XII.1 requires 1.20m for occupant loads between 50-200 in Group A."
/>
```

---

### 11. WikiReference → Any article mentioning related articles
**Why:** Most articles already have "See also" or "Related Articles" sections with URLs. WikiReference adds hover tooltips + slide-out peek panels.

**Proposed usage:**
```mdx
For more on accessibility requirements, see <WikiReference slug="bp-344-ramp-slope-tiers">BP 344 Ramp Requirements</WikiReference>.
```

---

### 12-18. Infrastructure/Alias Components (automatic usage)
These don't need explicit article content — they activate automatically:
- **MistakeCard/MistakeList/Mistakes** — aliases for WikiMistakeCard/WikiMistakeList (already in use via those names)
- **Warning** — alias for Warn (just use `<Warning>` instead of `<Warn>`)
- **WikiPre** — automatic MDX pre handler (activates when ` ``` ` code blocks present)
- **GenericBlock** — automatic fallback (activates on unknown component names)
- **WrongAnswerBanner** — automatic via quiz flow (not authorable)
- **PrequestionGate** — automatic via learning path integration
- **TeachBackPrompt** — automatic via learning trail integration
- **EIPrompt/EIBlock** — automatic via EI prompt database
- **AccordionItem** — child of Accordion (already used in 8 articles but AccordionItem specifically unused)
