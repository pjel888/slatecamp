# 06 — Next Design Decision Checklist Before Any Implementation

Date: 2026-05-08
Status: gate checklist

## Implementation remains frozen

Do not edit implementation files until Philip explicitly approves a direction.

## Required decisions before code

### 1. Hero visual mode

Choose one approved mode after visual exploration:

- full-bleed atmospheric field
- editorial/canvas hybrid with large typography
- interactive atlas/map field
- quiet architectural spatial environment

Reject:

- right-side 3D card
- dashboard mockup hero
- feature bento hero
- floating label-card cluster

### 2. Section rhythm

Choose the page rhythm before implementation.

The current generic feature-section sequence should not be assumed valid.

Decide:

- How many sections?
- Which sections are editorial vs product-specific?
- Where does actual product proof appear?
- Where do trust/legal boundaries appear?
- What visual motif carries from hero into the rest of the page?

### 3. Product proof policy

Decide how product UI may be shown.

Options:

- real screenshots only
- abstract diagrams only
- accurate product-surface recreations only
- no fake UI in first half of page

Recommended:

- no fake UI in hero
- no fake UI pretending to be a screenshot
- actual product primitives only after the atlas mood is established

### 4. 3D Lab truth policy

Before showing 3D Lab publicly, decide how to communicate access.

Known issue:

- 3D Lab is entitlement-gated.
- Visible shipped modules are limited.
- Registry size is not shipped product size.

Landing copy must not imply free full lab access unless product entitlement supports it.

### 5. Copy posture

Approve one copy posture:

- calm atlas
- field guide / Pokedex, mature not childish
- review-season support
- less panic / less pangangapa
- source-aware architecture resource

Reject:

- world-class public claim
- review center replacement
- study-method jargon
- pass prediction/guarantee

### 6. Reference benchmark selection

Pick 5 references as the taste benchmark before code.

Recommended primary set:

- Infinite Field — atmospheric world/field
- Matter — cinematic restraint
- Dirac — conceptual product physics
- Save.design — design-resource category clarity
- Paradiso Institute or Razorpay Sprint 26 — editorial system and section rhythm

Secondary:

- Lusion
- ARKITEKWEB
- Obys
- T11

### 7. Mock before build

Before implementation, produce:

- one hero art-direction board
- one section-rhythm diagram
- one mobile above-the-fold sketch
- one product-truth map

This can be HTML mockup or static design doc, but not production implementation.

## Red flags during future implementation

Stop immediately if any of these appear:

- "Let's just wrap it in a nice card"
- "Add some floating labels"
- "Show a dashboard preview in the hero"
- "Use a 3D module on the right"
- "Make a bento grid for features"
- "Call it world-class"
- "Say full lab is free after signup"
- "Use SRS/active recall in the headline"

## Review gate

Before final code review, verify:

- no carded hero visual
- no fake product claims
- no legal-risk copy
- no implementation of unapproved direction
- product surfaces shown match real app behavior
- 3D fallback and reduced motion planned
- mobile first viewport remains clear
- page feels like architecture knowledge atlas, not generic SaaS

## Next recommended non-code action

Create 2–3 visual direction boards based on the research pack, not named gimmick concepts.

Each direction board should contain:

- reference screenshots/links
- emotion target
- hero composition description
- section rhythm
- what it borrows from references
- why it is not cheesy
- product-truth constraints
- rejection risks

Only after Philip approves one board should implementation restart.
