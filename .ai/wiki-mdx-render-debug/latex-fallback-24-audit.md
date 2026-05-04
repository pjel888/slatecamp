# LaTeX Fallback 24 — Deep Audit

**Date:** 2026-05-04T04:38:51.725Z
**Total:** 23

## Category Breakdown

| Category | Count |
|----------|-------|
| bare-curly-braces | 15 |
| dollar-delimited-math | 4 |
| latex-frac-braces | 3 |
| latex-display-braces | 1 |

## Action Breakdown

| Action | Count |
|--------|-------|
| accept-safe-fallback | 8 |
| repair-to-primary-compile | 15 |

## Article Details

### lea-dsgn-007-07-core-concept
- **ArticleMedia:** 2
- **Category:** `latex-frac-braces`
- **Cause:** LaTeX \(...\) with { } braces causes acorn parse failure
- **Repairable:** false
- **Action:** `accept-safe-fallback`
- **Context:** `- Formula: \( TGFA = AMBF \times \text{number of floors} \)
  | - \( \text{Floors} = BHL \div 3.0 \text{ m} = 15.0 \div 3.0 = 5 \text{ floors} \)
  | `

### lea-dsgn-007-10-core-concept
- **ArticleMedia:** 2
- **Category:** `latex-frac-braces`
- **Cause:** LaTeX \(...\) with { } braces causes acorn parse failure
- **Repairable:** false
- **Action:** `accept-safe-fallback`
- **Context:** `- \( R + T \approx 430\text{–}450 \text{ mm} \)
  | - \( \text{Number of risers} = \dfrac{\text{Floor height}}{\text{Riser height}} \) (always round *`

### lea-dsgn-008-03-core-concept
- **ArticleMedia:** 2
- **Category:** `dollar-delimited-math`
- **Cause:** $...$ inline math contains braces that acorn tries to parse
- **Repairable:** false
- **Action:** `accept-safe-fallback`
- **Context:** `Sprinkler systems and fire detection change two critical egress parameters: sprinklers increase the allowable travel dis
  | * **System Components**: `

### lea-dsgn-012-02-core-concept
- **ArticleMedia:** 2
- **Category:** `dollar-delimited-math`
- **Cause:** $...$ inline math contains braces that acorn tries to parse
- **Repairable:** false
- **Action:** `accept-safe-fallback`
- **Context:** `- **TGFA (Total Gross Floor Area):** The sum of all floor areas. $TGFA = AMBF \times \text{number of floors}$.`

### lea-matl-006-02-core-concept
- **ArticleMedia:** 2
- **Category:** `dollar-delimited-math`
- **Cause:** $...$ inline math contains braces that acorn tries to parse
- **Repairable:** false
- **Action:** `accept-safe-fallback`
- **Context:** `NSCP 2015 requires design for basic wind speed $V = 20\text{--}50\text{ m/s}$ depending on the typhoon zone.
  | | Wind speed zones (PH) | $V = 20\tex`

### lea-prac-cmp-010-per-diem-retainer-and-honorarium-definitions-scope-and-philippine-application
- **ArticleMedia:** 1
- **Category:** `bare-curly-braces`
- **Cause:** Text contains bare { } curly braces (1 lines) that acorn tries to parse as JS expressions
- **Repairable:** true
- **Action:** `repair-to-primary-compile`
- **Context:** `- Props: items=[{"value": "5-12%", "label": "DAEDS Fee Range"}, {"value": "50M", "label": "PCC Bracket Threshold"}, {"va`

### lea-strc-007-03-core-concept
- **ArticleMedia:** 1
- **Category:** `dollar-delimited-math`
- **Cause:** $...$ inline math contains braces that acorn tries to parse
- **Repairable:** false
- **Action:** `accept-safe-fallback`
- **Context:** `Grade 60 ($f_y = 420\text{ MPa}$) is the standard reference for these tables.
  | (Based on $f_y = 420\text{ MPa}$, NSCP Table 9.5.1)
  | | **Support `

### lea-theo-004-03-core-concept
- **ArticleMedia:** 1
- **Category:** `bare-curly-braces`
- **Cause:** Text contains bare { } curly braces (1 lines) that acorn tries to parse as JS expressions
- **Repairable:** true
- **Action:** `repair-to-primary-compile`
- **Context:** `- Props: mistakes="{["Overdesigning insulation for embodied carbon penalty:. The inverse of mistake #5 from Article 2 ap`

### lea-theo-009-02-core-concept
- **ArticleMedia:** 1
- **Category:** `bare-curly-braces`
- **Cause:** Text contains bare { } curly braces (1 lines) that acorn tries to parse as JS expressions
- **Repairable:** true
- **Action:** `repair-to-primary-compile`
- **Context:** `Example: In a small medical clinic with spaces {Reception, Waiting, Exam 1, Exam 2, Treatment, Lab, Office, Storage, Mec`

### lea-util-001-09-core-concept
- **ArticleMedia:** 1
- **Category:** `bare-curly-braces`
- **Cause:** Text contains bare { } curly braces (1 lines) that acorn tries to parse as JS expressions
- **Repairable:** true
- **Action:** `repair-to-primary-compile`
- **Context:** `- Props: mistakes="{[\"Assuming roof runoff coefficient is the same for all materials; it varies by surface (tile 0.85,`

### lea-util-002-08-core-principles-standards
- **ArticleMedia:** 1
- **Category:** `bare-curly-braces`
- **Cause:** Text contains bare { } curly braces (13 lines) that acorn tries to parse as JS expressions
- **Repairable:** true
- **Action:** `repair-to-primary-compile`
- **Context:** `$$\text{RTT} = 2 \times [H + (S \times n)] / V + t_s + t_d + t_c$$
  | $$\text{RTT} = 2H/V + 2 \times S \times n \times (t_c + t_d) / V + t_s$$
  | $$`

### lea-util-007-02-smart-metering-infrastructure-ami
- **ArticleMedia:** 1
- **Category:** `bare-curly-braces`
- **Cause:** Text contains bare { } curly braces (1 lines) that acorn tries to parse as JS expressions
- **Repairable:** true
- **Action:** `repair-to-primary-compile`
- **Context:** `\text{BEI} = \frac{\text{Annual kWh}}{\text{Gross floor area (m²)}} = \text{kWh/m²/year}`

### accessible-seating-in-assembly-areas
- **ArticleMedia:** 3
- **Category:** `bare-curly-braces`
- **Cause:** Text contains bare { } curly braces (1 lines) that acorn tries to parse as JS expressions
- **Repairable:** true
- **Action:** `repair-to-primary-compile`
- **Context:** `$$750 \times 3\% = 22.5 → \textbf{Round up to 23 wheelchair spaces}$$`

### bp-344-ramp-slope-tiers
- **ArticleMedia:** 4
- **Category:** `latex-display-braces`
- **Cause:** LaTeX \[...\] with { } braces causes acorn parse failure
- **Repairable:** false
- **Action:** `accept-safe-fallback`
- **Context:** `\\text{Horizontal Run Length} = \\text{Rise} \\times \\text{Slope Ratio}
  | 700\\,\\text{mm rise} \\times 15 = 10{,}500\\,\\text{mm} = 10.50\\,\\text`

### overview-architectural-design
- **ArticleMedia:** 1
- **Category:** `bare-curly-braces`
- **Cause:** Text contains bare { } curly braces (1 lines) that acorn tries to parse as JS expressions
- **Repairable:** true
- **Action:** `repair-to-primary-compile`
- **Context:** `- Props: items="[{"label":"Total LEA Weight","value":"~40%"},{"label":"PRC Area","value":"Area C"},{"label":"Sole Subjec`

### overview-building-materials
- **ArticleMedia:** 1
- **Category:** `bare-curly-braces`
- **Cause:** Text contains bare { } curly braces (2 lines) that acorn tries to parse as JS expressions
- **Repairable:** true
- **Action:** `repair-to-primary-compile`
- **Context:** `- Props: items="[{"label":"PRC Area","value":"Area B"},{"label":"Weight","value":"30% of Area B"},{"label":"PRC Subject
  | - Props: headers="{["Mater`

### overview-building-utilities-mepf
- **ArticleMedia:** 1
- **Category:** `bare-curly-braces`
- **Cause:** Text contains bare { } curly braces (2 lines) that acorn tries to parse as JS expressions
- **Repairable:** true
- **Action:** `repair-to-primary-compile`
- **Context:** `- Props: items="[{"label":"PRC Area","value":"Area B"},{"label":"Weight","value":"35% of Area B"},{"label":"PRC Subject
  | - Props: headers="{["Syste`

### overview-history-of-architecture
- **ArticleMedia:** 1
- **Category:** `bare-curly-braces`
- **Cause:** Text contains bare { } curly braces (2 lines) that acorn tries to parse as JS expressions
- **Repairable:** true
- **Action:** `repair-to-primary-compile`
- **Context:** `- Props: items="[{"label":"PRC Area","value":"Area A"},{"label":"Weight within Area A","value":"35% (heaviest single sub
  | - Props: headers="{["Subt`

### overview-planning-housing-urban-design
- **ArticleMedia:** 1
- **Category:** `bare-curly-braces`
- **Cause:** Text contains bare { } curly braces (1 lines) that acorn tries to parse as JS expressions
- **Repairable:** true
- **Action:** `repair-to-primary-compile`
- **Context:** `- Props: items="[{"label":"PRC Area","value":"Area A"},{"label":"Weight within Area A","value":"20%"},{"label":"Key Laws`

### overview-professional-practice
- **ArticleMedia:** 1
- **Category:** `bare-curly-braces`
- **Cause:** Text contains bare { } curly braces (2 lines) that acorn tries to parse as JS expressions
- **Repairable:** true
- **Action:** `repair-to-primary-compile`
- **Context:** `- Props: items="[{"label":"PRC Area","value":"Area A"},{"label":"Weight within Area A","value":"20%"},{"label":"Primary
  | - Props: headers="{["SPP D`

### overview-structural-conceptualization
- **ArticleMedia:** 1
- **Category:** `bare-curly-braces`
- **Cause:** Text contains bare { } curly braces (1 lines) that acorn tries to parse as JS expressions
- **Repairable:** true
- **Action:** `repair-to-primary-compile`
- **Context:** `- Props: items="[{"label":"Weight in Area B","value":"35%"},{"label":"PRC Area","value":"Area B"},{"label":"LEA Share","`

### overview-theory-of-architecture
- **ArticleMedia:** 1
- **Category:** `bare-curly-braces`
- **Cause:** Text contains bare { } curly braces (2 lines) that acorn tries to parse as JS expressions
- **Repairable:** true
- **Action:** `repair-to-primary-compile`
- **Context:** `- Props: items="[{"label":"PRC Area","value":"Area A"},{"label":"Weight","value":"25% of Area A"},{"label":"PRC Subject
  | - Props: headers="{["Movem`

### wheelchair-maneuvering-and-parking-slots
- **ArticleMedia:** 2
- **Category:** `latex-frac-braces`
- **Cause:** LaTeX \(...\) with { } braces causes acorn parse failure
- **Repairable:** false
- **Action:** `accept-safe-fallback`
- **Context:** `Formula: \(\text{Run} = \text{Rise} \times \text{Slope Ratio}\).
  | Example: \(700 \times 15 = 10{,}500\) mm = **10.50 m** (matches the table).[file:`
