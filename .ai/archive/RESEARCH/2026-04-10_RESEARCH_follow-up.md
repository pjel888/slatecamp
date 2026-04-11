Yes. This plan is strong. Much stronger than most implementation follow-up plans.

It has the right shape for a real engineering execution document:

* clear decision record
* bounded scope
* explicit edge cases
* phased rollout
* verification logic
* definition of done

That said, there are still several places where it can be tightened so the implementer has less room to drift or over-engineer. 

## What is already strong

### 1. The plan understands the actual bug class

The best part of this document is that it correctly identifies the real issue as a **state-model contradiction**, not just a toolbar bug. It understands that persistent selection state and one-shot commands cannot safely live in the same field if you want both sticky highlight and same-button replay. That is the right diagnosis. 

### 2. The scope guard is disciplined

It keeps the patch focused and explicitly rejects a full camera-system rewrite. That is good judgment. These kinds of follow-up patches go bad when people try to "clean everything up" while fixing a real regression cluster. 

### 3. Hidden edge cases are well thought through

The plan does a good job surfacing tricky cases that usually get missed until QA:

* same-button retriggering
* alias normalization
* reduced-motion parity
* manual orbit invalidation
* reset vs selected-view semantics
* latest-command-wins behavior

That section alone materially improves execution quality. 

### 4. Verification is serious

The manual QA list is strong and product-relevant. It is not just "click around and see." It checks semantics, interaction flow, and motion-mode parity. 

---

## What still needs improvement

## 1. The state contract is still too abstract

The plan says the implementation should converge on a shape equivalent to:

* `selectedPresetId`
* `cameraCommand`

That is directionally correct, but still a bit loose. If different implementers touch this, they could interpret the contract differently. 

### Improvement

Add one explicit canonical command payload shape in the plan.

For example, define something like:

```ts
type SelectedPresetId =
  | 'perspective'
  | 'top'
  | 'front'
  | 'left'
  | 'right'
  | 'rear'
  | 'iso-ne'
  | 'iso-nw'
  | 'iso-se'
  | 'iso-sw'
  | null

type CameraCommandType =
  | 'snap-to-preset'
  | 'reset'
  | 'zoom-to-fit'
  | 'zoom-in'
  | 'zoom-out'

interface CameraCommand {
  id: string
  type: CameraCommandType
  presetId?: SelectedPresetId
  source: 'toolbar' | 'shortcut' | 'context-menu' | 'command-palette'
  issuedAt: number
}
```

You do not need to force exact implementation, but you should force exact semantics.

Why this matters:
Without this, the implementer may create an under-specified transient object and you will be back in "state drift" territory later.

---

## 2. The invalidation rule for named-view highlight needs sharper wording

The plan currently says:

* manual orbit invalidates sticky preset highlighting
* panning alone should not invalidate sticky preset highlighting

That is good, but still not precise enough for implementation. 

### Improvement

Define the invalidation rule in operational terms:

* Clear selected preset only on meaningful rotation delta past threshold.
* Do not clear on pan.
* Do not clear on zoom.
* Do not clear on programmatic framing changes.
* Do not clear during animated snap until user input interrupts it.

Also specify whether minute incidental orbit noise from pointer jitter should count. Add a threshold rule.

Example:

* "Selected named-view highlight clears only when user-driven orbit rotation exceeds threshold X."
* "Threshold should prevent accidental clearing from tiny control noise."

This is important because orbit invalidation bugs are the sort that feel random to users.

---

## 3. Reset semantics need one more level of clarity

The plan says reset is a transient command whose resulting selected preset becomes `perspective`. Good. But it does not fully state whether reset also normalizes framing, target, zoom, and manual orbit flags in a canonical way. 

### Improvement

Explicitly state:

Reset must restore:

* canonical perspective projection
* canonical camera orientation
* canonical target
* canonical distance/framing
* cleared manual-orbit state
* resulting selected preset = `perspective`

Otherwise two developers may both satisfy "reset leads to perspective" while producing different actual camera states.

---

## 4. The plan should explicitly define source-of-truth ownership during snap

Right now it separates selection state from transient command state, which is correct. But it should explicitly say **who computes the resulting selected preset after a command finishes**. 

### Improvement

Add a rule such as:

* The snap bridge is the semantic boundary that resolves command outcome into:

  * final projection
  * final camera orientation
  * final selected preset
  * manual-orbit clearing
* UI components dispatch commands only
* UI components do not infer final selected preset themselves

This matters because if toolbar or shortcut layers start making their own assumptions, semantic drift returns.

---

## 5. Alias normalization should be centralized even more explicitly

The plan mentions normalizing `iso` to a canonical preset and routing all entry points through the same command surface. Good. But I would tighten this harder. 

### Improvement

State this plainly:

* No downstream camera executor may receive raw alias values like `iso`.
* All aliases must be normalized before entering the execution boundary.
* Internal execution should only ever see canonical preset IDs.

That line removes ambiguity.

---

## 6. The BHL fix section is a little too thin

The BHL section is serviceable, but compared with the camera work it feels under-specified. It says remove hardcoded `* 3` and ensure label output reflects active storey value plus current floor height, including computed and custom override states. Good, but it should define the expected truth source more clearly. 

### Improvement

Add:

* which store selectors are the authoritative source
* whether displayed meters are derived or persisted
* whether label rounding/formatting rules must remain unchanged
* whether warning thresholds use the same underlying value as display

Possible failure mode here:
You fix the displayed label but leave warning logic or override styling tied to stale math.

So add:

* "Display value, warnings, and override-state styling must all derive from the same current BHL calculation path."

That closes a likely inconsistency.

---

## 7. There is no explicit rollback rule if shared path regression appears

The plan calls out divergence between `DevControlsCanvas.tsx` and `SceneConfig.tsx`, but it does not clearly define what to do if fixing both broadens the blast radius. 

### Improvement

Add a decision gate:

* Preferred: normalize both paths if semantics are shared and low risk.
* If shared-path regression risk becomes non-trivial, land the fix first in the reviewed failing surface and document the shared-path follow-up explicitly.
* Do not half-apply semantic changes silently.

This helps keep the patch bounded if reality gets messy.

---

## 8. Missing explicit non-goals around visual polish

The plan says keep diff small and centered on semantics, not aesthetics. Good. But I would say it even more directly. 

### Improvement

Add a non-goal list:

* no toolbar redesign
* no label copy changes unless required for semantic clarity
* no camera animation tuning beyond correctness
* no iconography changes
* no control layout changes

That reduces temptation.

---

## 9. Automated regression guidance should be stronger

The plan recommends adding at least one focused automated regression if a lightweight test surface exists. That is good, but I would be firmer. 

### Improvement

Promote two tests to required if feasible without heavy infra:

1. same-button replay for named preset
2. alias normalization from `iso` to canonical preset

These are central to the chosen architecture. If you leave them optional, they are the first things likely to regress in a later cleanup.

---

## 10. The plan should define command supersession mechanics more concretely

It says latest command wins and in-flight animation is cancelled or superseded. Good. But how does that happen mechanically from the perspective of state? 

### Improvement

Add explicit rule:

* command resolution must ignore stale command IDs
* animation completion handlers must confirm they still match the latest active command before mutating final state

This is a classic source of stale highlight bugs after rapid input.

---

## 11. Missing observability or debug advice

For a state-semantics patch like this, one lightweight debug aid can save a lot of time. The plan currently has none. 

### Improvement

Add optional temporary dev logging or debug overlay during implementation:

* latest command id
* selected preset
* current projection mode
* manualOrbit state
* last invalidation source

Not for production, obviously. Just as execution guidance.

This is especially useful because camera bugs are often hard to reason about from code alone.

---

## 12. The Definition of Done is good, but one item is missing

The current DoD includes semantics, tests, typecheck, and QA. Good. 

### Improvement

Add:

* "No caller outside the normalization boundary dispatches ambiguous alias presets."

That makes the cleanup complete, not partial.

---

## My recommended additions to the plan

If I were tightening this document, I would add four short sections.

### A. Canonical State Contract

One short section with:

* preset ids
* command types
* replay token requirement
* invalidation rules
* source-of-truth ownership

### B. Command Outcome Semantics

One short section stating exact results of:

* `perspective`
* `iso`
* `reset`
* `zoom-to-fit`
* `zoom-in`
* `zoom-out`

### C. Invalidation Threshold Rules

One short section clarifying:

* what counts as real orbit
* what does not
* threshold behavior
* interruption behavior during animation

### D. Minimum Required Automated Regressions

Make two tests effectively mandatory if test surface exists.

---

## My overall verdict

This is already a strong plan. I would rate it around **8.5 to 9 out of 10** as an execution document. 

Why it is strong:

* correct diagnosis
* bounded scope
* smart edge-case coverage
* real verification discipline

Why it is not yet perfect:

* a few core semantics are still described conceptually rather than contractually
* some state ownership and invalidation rules need sharper wording
* BHL fix could be more exact
* automated regression expectations should be firmer

Bluntly, this plan is good enough to execute, but tightening the contract language would reduce the odds of an implementation that "mostly works" while still leaving subtle camera-state drift behind.
