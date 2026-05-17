# Learner UX Blueprint - Lighting Room Simulator

Purpose: define the learner experience before implementation. This is the product/UX source of truth for how the Lighting Room Simulator should teach.

## Learners

| Learner | Need | Risk in this module | UX response |
|---|---|---|---|
| Anxious first-taker | "Tell me what matters for the exam." | Too many controls feel like engineering software. | Start with one guided insight and a clear next action. |
| Retaker | "Show me the mistake I keep making." | Shame if under-target states feel like failure. | Use corrective language and one prioritized fix. |
| Undergrad prepper | "Let me explore and understand." | Low urgency means shallow interaction. | Make sandbox exploration satisfying but tied to quick checks. |
| Working professional returner | "I have 10 minutes. Teach me efficiently." | Dense panel can waste time. | Keep key values visible, use presets, avoid quote walls. |

## Primary Learning Promise

"You will understand the relationship between lamp output, room area, power, and perceived brightness."

The module should make three exam-useful distinctions stick:

1. Lumens are light output; watts are power use.
2. Lux is light received over area; larger rooms need more lumens for the same target.
3. Same brightness can have very different energy cost depending on efficacy.

## 60-Second First-Run Journey

### Step 1 - Orientation

State shown:
- Standard Office preset
- room visibly lit
- key values: `300 lux target`, `4800 lm`, `48 W`, `100 lm/W`

Copy:
- "This room is using a simplified average-lux model: lumens divided by floor area."
- "Try changing watts or lamp type and watch what changes."

Do not show:
- raw source quotes
- every law family
- challenge mode
- RCR, CU, LLF

### Step 2 - First Insight

Interaction:
- learner selects "Same lumens: LED vs incandescent"

Expected perception:
- room brightness stays visually similar
- watts and LPD change dramatically

Microcopy:
- "Same lumens, same target light. Different watts, different energy cost."

### Step 3 - Second Insight

Interaction:
- learner changes room size from 4m x 4m to 6m x 6m

Expected perception:
- average lux drops
- right panel moves to review/below-target state

Microcopy:
- "The lamp did not get weaker. The same light is spread across more area."

### Step 4 - Corrective Action

Interaction:
- one suggested fix appears: "Increase lumens to target" or "Choose a higher-output LED preset"

Expected result:
- learner returns to target-met state

Microcopy:
- "Target met in the teaching model. Source approval decides whether this can be shown as legal compliance."

## Information Architecture

### Left Sidebar - Learning Controls

Order:

1. `Lighting information`
   - Target status
   - Average illuminance
   - Lumens needed for selected target
   - Current lumens
   - LPD
   - Efficacy
   - Room area
   - Beam coverage
   - Color temperature

2. `Light source`
   - Lamp type
   - Lumens
   - Wattage

3. `Fixture`
   - Beam angle
   - Color temperature
   - Mounting height

4. `Room`
   - Room type
   - Width
   - Depth

5. `Presets`
   - Standard Office
   - Drafting Studio
   - Same Lumens Comparison
   - Under Target Demo

Why computed values first:
- Learners need to know what changed before they decide what to adjust.
- This matches the stairway workbench pattern where board-vital information precedes controls.

### Right Sidebar - Checks And Source Status

Default view:
- status summary
- one prioritized fix
- compact check cards by family

Secondary detail:
- source status
- source quote or locator
- "why this matters for LEA"

Do not make the default right panel a source quote wall.

## Interaction Modes

### Guided Mode

Use for first-run and Camp Trail.

Sequence:
1. Same lumens comparison
2. Room size effect
3. Beam angle effect
4. Target correction

Rules:
- One active prompt at a time.
- No more than three controls emphasized at once.
- Feedback must include next action.

### Sandbox Mode

Use after orientation or for returning learners.

Rules:
- All controls available.
- Source status always visible.
- Suggested fix remains available when below target.

### Challenge Mode

Not v0 learner release unless source and formula gates pass.

Example:
- "Reach the office target while keeping LPD under the approved limit."

Scoring:
- target met
- LPD under limit
- source status approved
- no overclaiming

## UI Alignment With Stairway

Carry forward:
- fixed left/right sidebars
- dense inspector cards
- DM Mono only for values and technical references
- compact law/check cards
- 3D canvas as center learning surface
- camera toolbar and orientation affordances
- no page scroll on desktop

Adapt for lighting:
- center scene must be darker/brighter enough to show change
- right panel must distinguish `teaching target` from `legal compliance`
- first-run orientation should be shorter than the generic 3D orientation if the learner has already seen 3D Lab

## Microcopy Patterns

### Average lux popover

"Average lux is lumens divided by room area in this teaching model. Real lighting design also accounts for fixture layout, reflectance, losses, and measurement points."

### LPD popover

"Lighting power density is watts divided by floor area. It helps compare brightness against energy use."

### Efficacy popover

"Efficacy is lumens per watt. Higher efficacy means more light from the same power."

### Source-pending card

"Source pending. SlateCamp has not approved this threshold for legal pass/fail display yet."

### Under-target fix

"Below target in the teaching model. Increase lumens, reduce room area, or choose a higher-output preset."

### Same-lumens comparison

"Brightness stayed similar because lumens stayed the same. The LED uses far fewer watts."

## Mobile UX

Mobile order:
1. Scene
2. Key values strip
3. Bottom sheet tabs: Controls, Checks, Sources

Rules:
- Keep at least 55 percent of viewport height for the scene when the bottom sheet is collapsed.
- Collapsed strip shows average lux, target status, lumens, LPD.
- Source detail is never the default tab.
- Sliders need readable labels and visible values.
- Camera reset and preset controls remain reachable without opening source detail.

## Accessibility

- Do not rely on brightness or color alone; every state needs text.
- Red is only for approved functional non-compliance.
- Source pending uses text plus warning/review tone.
- Sliders must have labels, units, and keyboard support.
- Color temperature must show Kelvin and plain-language label: warm, neutral, cool.
- 3D-only information must be duplicated in panel text.

## Success Criteria

The learner should be able to answer these after using the module:

1. "If two lamps have the same lumens, why can one use less power?"
2. "Why does a larger room need more lumens for the same target lux?"
3. "What does LPD measure?"
4. "Why is this simulator a learning model, not a professional lighting calculation tool?"
5. "Which values are source-approved and which are still under review?"
