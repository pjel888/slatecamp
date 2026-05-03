## What You Need to Know for the LEA
Steel section shapes and connection geometry define load paths; slenderness limits control buckling risk and design viability in both compression and tension members.

## Core Concept
Structural steel members are manufactured in standardized section shapes to optimize strength-to-weight ratio. The major rolled shapes—W-sections (wide flange), S-sections (American standard), C-channels, L-angles, T-sections, and hollow structural sections (HSS)—each serve distinct roles in framing. W-sections dominate primary beams and columns because their wide flanges resist bending efficiently; S-sections see less use today; channels and angles work well as bracing, purlins, and secondary members; T-sections split off from wide flanges for gusset plates and special connections; built-up sections (welded or riveted plates) solve odd geometric needs. Connections transmit force between members through gusset plates (triangular or rectangular transition pieces), splice plates (overlap elements), stiffeners (vertical reinforcement), and fasteners. Slenderness (the ratio KL/r, where K is effective length factor, L is member length, and r is radius of gyration) limits member stability. The AISC Standard (owned by LEA-STRC-003-04) sets maximum KL/r values: compression members shall not exceed 200, and tension members (preferred practice) shall not exceed 300. These limits prevent excessive lateral deflection and ensure member reliability; oversized slenderness ratios indicate undersized cross-sections or overly long spans between lateral supports. A36 steel (Fu = 400 MPa, Fy = 248 MPa) remains common for structural work; reference stresses owned by LEA-STRC-005-03 provide design thresholds.

## Key Provisions

| Section Type | Primary Use | Typical Orientation | Why Used |
|---|---|---|---|
| W-section (wide flange) | Beams, columns, rigid frames | Flanges horizontal for bending | Maximum bending resistance; high section modulus |
| S-section (American standard) | Legacy beams, floor systems | Flanges horizontal | Older standard; less efficient than W-shapes |
| C-channel | Purlins, secondary beams, bracing | Web vertical or horizontal | Open section; lighter; handles modest loads |
| L-angle | Tie rods, bracing, gusset transition | Any orientation | Small cross-section; high slenderness acceptable in tension |
| T-section | Gusset plates, flanges, split beams | Web vertical or horizontal | Created by splitting W-shapes; economical for transition |
| HSS (hollow) | Columns, bracing, architectural | Any orientation | Closed section; high torsional rigidity; uniform properties |
| Built-up (welded or riveted) | Heavy columns, long spans, custom | Custom | Tailored geometry for oddly loaded members |

**Slenderness Limits (KL/r):**

| Member Type | Maximum KL/r | Rationlea |
|---|---|---|
| Compression (primary) | 200 | Avoids Euler buckling; ensures reliable compressive capacity |
| Tension (preferred) | 300 | Permits flexibility; controls vibration and serviceability |
| Tension (allowable) | No AISC limit specified | Rare; design judgment required |

**Connection Components:**

| Component | Function | Material |
|---|---|---|
| Gusset plate | Transition force from member to fasteners or welds | Steel (same grade or higher) |
| Splice plate | Joins two members end-to-end; transfers axial force | Steel; typically bolted |
| Stiffener | Prevents web crippling or local buckling near concentrated loads | Steel; welded to web/flange |
| Shear connector (stud) | Bonds concrete slab to steel beam | Headed stud; welded through slab |

## Philippine Practice Context
Philippine practice follows ASEP standards aligned with AISC and ISO guidelines. Local suppliers provide A36 and A500 Grade B (HSS); A325 bolts are standard for structural work. Tropical humidity and typhoon-driven deflection sensitivities make slenderness control and bolt pretensioning critical. Gusset plate design in truss nodes must account for stress concentration; undersized gussets are a common cause of fatigue failure in heavily trafficked highway bridges.

## How It's Tested

**Pattern 1 — Section Selection:**
"A secondary purlin must carry 50 kN across a 3 m span with side-sway braced. Select from C-section or L-angle. Which is more typical, and why?"
_Tests recognition that C-channels are standard for purlins; angles better for ties and bracing._

**Pattern 2 — Slenderness Verification:**
"A tie rod in a truss has KL/r = 320. Is this acceptable? What is the issue?"
_Tests threshold knowledge: 320 > 300 (preferred limit for tension). Candidate must recognize that 200 limit applies to compression; 300 is preferred for tension._

**Pattern 3 — Connection Geometry:**
"A bolted lap splice connects two L-angles in tension. Name the three components required and their function."
_Tests vocabulary: splice plates, gusset plate (if needed), and fasteners. Reinforces that splice geometry must match member shape._

<Tip>KL/r = 200 for compression; KL/r ≤ 300 (preferred) for tension. If a problem says slenderness is high, ask: is it a compression member (fail) or tension member (check 300 limit)?</Tip>

## Common Mistakes
<WikiMistakeList mistakes={["Confusing W-section flange width with height: W sections are identified as W(depth)×(unit weight); a W460×89 is 460 mm deep, not wide.","Applying the compression KL/r limit (200) to tension members: tension allows KL/r ≤ 300 (preferred); no AISC limit for tension > 300, but design judgment advised.","Treating gusset plates as load-carrying members: gusset plates are _transition_ geometry; they concentrate stress and require local analysis.","Ignoring section orientation: a C-channel is stronger with web vertical (I-like bending) than horizontal; always check intended use.","Assuming all built-up sections are more efficient: built-up sections are heavier and require field welding; use only when rolled shapes cannot fit."]} />