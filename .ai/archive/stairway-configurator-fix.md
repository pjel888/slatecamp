Yes. I’ve read the configurator as a system, not just as isolated files.

My verdict: the overall design is strong, disciplined, and worth keeping. The biggest issue is not the architecture. It is rule drift, where computation, geometry, overlays, click targets, and egress logic can start telling slightly different stories about the same stair. In a compliance tool, that is the real danger.   

## Overall assessment

This is a well-structured v2 refactor. The core idea is sound:

* `stairway-computation.ts` is a pure computation engine with no Three.js, React, or store imports. That is exactly the right backbone for a compliance-driven configurator. 
* `stairway-egress.ts` is also pure and isolated, which is good separation of concerns. 
* `stairway-configurator.ts` acts as the adapter and scene assembly layer, routing from computed state to straight, L-shape, or U-shape geometry. 
* The “parallel law” model is the right legal and pedagogical model. The configurator explicitly says each law evaluates independently, conflicts are flagged, and values are not averaged or merged. That is a strong design decision for Philippine code conditions. 
* The type model is good. `ComputedStairState` is clearly intended as the single source of truth. 

So the foundation is good. This is not a bad codebase. This is a good codebase with some dangerous inconsistencies.

## What is strong

### 1. The computation architecture is correct

The engine computes classification flags, comfort, pitch, total rise/run, landing need, per-dimension compliance, color resolution, tolerance variation data, and international comparison deltas in one place before geometry is built. That is exactly how this should be structured. 

### 2. The legal logic model is intellectually correct

The `ComplianceResult` and `ConflictFlag` model is one of the best parts of the whole system. It acknowledges that one stair can pass one regime and fail another, and that conflicts themselves are meaningful information. That is the right way to teach code overlays.  

### 3. The teaching layer is thoughtful

The presets are not random. They are clearly pedagogical, with scenarios like “All Laws Happy” and “Everything Wrong.” That is useful for guided learning and challenge mode. 

### 4. The code is honest about uncertainty

The international constants file explicitly warns that the IBC, ADA, and IRC values are unverified and not for production compliance without SME review. That is the correct posture. 

## The main problems

## 1. The system has multiple sources of rule truth

This is the biggest structural risk.

The same rule logic appears in:

* computation compliance functions
* color resolvers
* scene-level `violations`
* geometry overlays
* click-target mapping
* egress logic

That means the system is exposed to drift. You can already see this happening.    

A compliance tool must not have five semi-independent interpretations of the same stair.

## 2. Handrail compliance is internally inconsistent

This is a real issue.

`computeHandrailCompliance()` treats BP 344 as a strict exact-value requirement:

`passes: handrailHeight === BP344_HANDRAIL_UPPER_HEIGHT_MM` 

But `resolveHandrailColor()` ignores BP 344 entirely and only colors PD 1096 handrail violations. So the computation engine can say the accessible handrail is noncompliant, while the geometry color layer does not visually reflect that violation at all.  

That is exactly the kind of mismatch that destroys trust in a code visualizer.

Also, the configurator draws BP 344 ghost rails at 900 mm and 700 mm for accessible routes, but the main handrail color logic still does not reflect BP 344 failure state.  

## 3. International comparison deltas are oversimplified and can mislead

`computeInternationalDeltas()` returns Philippine comparison values using constants, but for stair width it hardcodes either:

* `BP220_MIN_WIDTH_MM`, or
* `PD1096_MIN_WIDTH_RESIDENTIAL_MM`

It does not account for high-occupancy, commercial, BP 344 accessibility overlay, or RA 9514 exit overlay, even though those conditions are part of the main compliance logic elsewhere.  

So the international comparison panel can easily present the wrong “Philippine baseline” for the actual scenario. That is a conceptual bug, not just a UI issue. 

## 4. The U-shape intermediate landing placement appears wrong

In `stairway-geometry-u-shape.ts`, the landing width and center are computed, but the X position is set using `landingCenterX / 2`. 

Given:

* `totalLandingWidth = sW * 2 + gapBetweenFlights`
* `landingCenterX = (sW + gapBetweenFlights) / 2`

placing the landing at `landingCenterX / 2` appears to shift it left of the intended center. 

That looks like a genuine geometry bug.

## 5. The landing-depth logic looks conceptually backwards

Both the L-shape and U-shape builders compute landing depth as:

`Math.min(sW, LANDING_MIN_DEPTH_MM / 1000)`  

Because the constant is named `LANDING_MIN_DEPTH_MM`, using `Math.min` means the rendered landing depth will be capped by stair width instead of being enforced to at least the minimum. That may be intentional as a visual simplification, but if so the naming is misleading. If it is not intentional, then the geometry is under-representing the required landing depth.  

## 6. Click-to-inspect coverage is incomplete

The click target registry covers tread, riser, handrail, headroom plane, base/top landing, BP 344 rails/extensions, width gaps, and comparison geometry. 

But the geometry layer also creates IDs such as:

* `landing-intermediate`
* `handrail-cross-section`
* `children-rail-711-*`
* `nosing-detail-*`
* `evac-dot-*`    

Those do not appear in the click target registry, so parts of the experience likely cannot be inspected through the same interaction model. 

## 7. Determinism is inconsistent

Tolerance mode is deterministic. It uses a seeded PRNG (`mulberry32`) and a fixed default seed, which is good for teaching, testing, and reproducibility. 

But the evacuation overlay uses `Math.random()` directly inside geometry generation for dot spread. 

That means one educational overlay is reproducible and another is not. For a training tool, that is sloppy. The evacuation visualization should also be seeded.

## 8. Egress logic is useful, but not fully aligned with stair compliance logic

`computeEgressRequirements()` calculates width per exit using `providedExits`, not `effectiveRequiredExits`. 

That means if the user provides too few exits, the width-per-exit number is based on the wrong denominator from a code-planning perspective. It may still be mathematically intentional, but pedagogically it can confuse users.

More importantly, `stairCountsAsExit` only checks whether stair width is at least `RA9514_MIN_EXIT_WIDTH_MM`, which is 710 mm.  

But the stair compliance logic elsewhere uses `RA9514_MIN_WIDTH_MM` for exit-stair dimensional checking. 

So one part of the system can imply “this stair counts as an exit” while another part says “this exit stair is too narrow.” That is not necessarily legally impossible, but within this tool it needs very explicit wording or the user will think the tool contradicts itself.  

## 9. Some UI controls are ahead of implementation

The detail-view geometry is more advanced than a placeholder, but not all controls are genuinely wired through.

The nosing builder accepts `_riserUndercutDeg` and `_contrastStripWidthMm` as parameters in the file signature, but those underscore prefixes indicate they are currently unused. The detail UI exposes those sliders, yet the actual geometry appears driven primarily by nosing projection and radius. This is feature drift between UI and implementation. 

Similarly, the handrail detail view creates a circular profile from `handrailDiameter`, but the UI also exposes `handrailProfile` and `wallClearance`. In the inspected geometry path, the cross-section is always generated as a circle and the clearance/profile options are not reflected there. 

## 10. Tests are decent, but not nearly enough for this kind of tool

The existing tests cover:

* Blondel comfort
* pitch classification
* some preset validation
* egress basics
* stair type parsing for L-shape  

That is a respectable start.

But there are no visible tests here for:

* width overlay interactions across PD 1096, BP 344, and RA 9514
* handrail exactness behavior
* handrail color mismatch
* tolerance mode reproducibility and flagged indices
* click target coverage
* geometry builder correctness for L-shape and U-shape
* nosing builder geometry
* evacuation overlay determinism
* international comparison deltas
* intermediate landing placement in U-shape

For a compliance visualizer, that missing coverage is substantial. 

Also, one test name is misleading: it says `too-stretched (2R+T=650)` but the expected status is `comfortable`. The implementation treats values greater than 650 as too stretched, so the expectation is consistent with code, but the test label is wrong and can mislead future maintainers.  

## 11. Types and comments have drifted

`stairway-types.ts` says `stairType` is “Phase 1: always straight,” but the actual type union includes `straight`, `l-shape`, and `u-shape`, and the tests explicitly validate L-shape parsing.  

That is minor, but it is evidence of documentation drift.

## Best parts to preserve

Do not rewrite this from scratch.

Keep:

* the pure computation engine
* the per-law compliance model
* the conflict flag idea
* the adapter pattern from config to computed state to geometry
* the preset-based teaching workflow
* the explicit warning system for unverified international comparisons    

That is the right skeleton.

## Priority fixes, in order

1. **Create one canonical rule engine API**
   All colors, scene violations, annotations, click popovers, and comparison panels should derive from the computed compliance objects, not from duplicated threshold checks scattered across files.  

2. **Fix the handrail inconsistency**
   BP 344 handrail failure must be reflected visually, not just in the computation object. Also decide whether exact equality at 900 mm is truly the intended rule model for this tool.  

3. **Fix international comparison logic**
   The Philippine baseline shown there must reflect the actual active scenario, not just residential-or-BP220 simplification. 

4. **Fix U-shape landing placement**
   The `landingCenterX / 2` issue should be checked first. That looks like a real scene bug. 

5. **Clarify or correct landing minimum-depth behavior**
   Either rename it as a visual simplification, or enforce the minimum properly.  

6. **Expand click target coverage**
   Every meaningful geometry artifact should either be inspectable or intentionally excluded. Right now it looks mixed.   

7. **Make evacuation visualization deterministic**
   Use the same seeded approach used in tolerance mode.  

8. **Align egress wording with stair-width compliance wording**
   The tool should explain clearly when “counts as exit capacity element” differs from “passes exit stair geometry rules,” or unify the logic if that distinction is not intended.  

9. **Add geometry and interaction tests**
   Right now the riskiest code paths are the least tested. 

## Final judgment

This configurator is serious work. It is not toy code. The separation of computation from rendering is the right move, and the parallel-law model is genuinely good.  

But it is at the stage where polish is no longer the priority. Consistency is. The system now needs one round of hardening focused on legal logic alignment, geometry correctness, and test coverage. That is what will make it trustworthy.

Below is the ranked repair list. The two uploaded stairway-configurator.ts copies appear materially the same in the sections inspected, so the recommendations for that file apply to whichever one is canonical in the repo.

1. Critical: compliance truth is duplicated across engine and scene layer

computeStairState() already computes per-dimension compliance and resolved colors, but stairway-configurator.ts also hardcodes a separate violations array with its own checks. That means the engine can say one thing while the scene and popovers say another. This is the most dangerous defect in the whole module because it creates rule drift in a compliance product.

Files to patch

stairway-computation.ts
stairway-configurator.ts
stairway-types.ts

Exact patch recommendation

In stairway-types.ts, add a small normalized UI-facing result type such as:
DimensionUiStatus { dimension, applies, passes, activeLaw, message, color, severity }.
In stairway-computation.ts, derive that status from each ComplianceResult instead of maintaining separate resolveRiserColor, resolveTreadColor, resolveWidthColor, and resolveHandrailColor rule branches. Keep a single law-priority order there.
In stairway-configurator.ts, stop expressing legal thresholds directly in the violations array. Either generate violations from computed statuses, or replace each check with a thin adapter that reads computeStairState(p).<dimension>Status. Do not keep duplicated threshold logic in the scene config.
2. Critical: handrail compliance and handrail color are inconsistent

computeHandrailCompliance() treats BP 344 as an exact 900 mm requirement when accessibility is active, and the scene-level rule in stairway-configurator.ts also checks !== 900. But resolveHandrailColor() only checks the PD 1096 800 to 900 mm range and ignores BP 344 entirely. Result: an accessible stair can fail handrail compliance without the primary handrail ever turning into a BP 344 violation color.

Files to patch

stairway-computation.ts
stairway-configurator.ts
stairway-computation.test.ts

Exact patch recommendation

Change resolveHandrailColor(handrailHeight, isBP220) to either:
resolveHandrailColor(handrailCompliance: ComplianceResult)
or at minimum
resolveHandrailColor(handrailHeight, isBP220, isAccessible).
If BP 344 is active and fails, return LAW_COLORS.BP_344. If PD 1096 fails and BP 344 is not the more specific active overlay, return LAW_COLORS.PD_1096. Use the same law priority as the rest of the app.
Add tests for:
accessible route + handrailHeight=860 should fail BP 344
accessible route + handrailHeight=860 should produce BP 344 handrail color
non-accessible + handrailHeight=950 should produce PD 1096 handrail color.
3. High: international comparison uses the wrong Philippine baseline for several scenarios

computeInternationalDeltas() only distinguishes BP 220 versus PD 1096 for width, and when not BP 220 it hardcodes PD1096_MIN_WIDTH_RESIDENTIAL_MM. That ignores high-occupancy, commercial, BP 344 accessible width, and RA 9514 exit width, even though those overlays are already part of the real computation path elsewhere. So the comparison panel can show the wrong Philippine benchmark for the active case.

Files to patch

stairway-computation.ts
stairway-types.ts

Exact patch recommendation

Change the function signature from:
computeInternationalDeltas(..., isBP220)
to something like:
computeInternationalDeltas({ isBP220, isAccessibleRoute, isExitStair, isHighOccupancy, isResidential, totalRise, handrailHeight, stairWidth, ... }).
For width, use computeStrictestMinWidth(...) so the Philippine comparison value is the actual active minimum, not a residential shortcut.
For vertical rise, use RA9514_MAX_VERTICAL_RISE_MM when isExitStair is true, not always PD 1096. For handrail, set phLaw contextually to BP 344 when accessibility is active.
4. High: U-shape intermediate landing is probably mis-centered

In stairway-geometry-u-shape.ts, the landing width is correctly computed as both flight widths plus the gap, and the midpoint is computed as landingCenterX, but the actual box is placed at landingCenterX / 2. That is almost certainly wrong geometry.

Files to patch

stairway-geometry-u-shape.ts
stairway-computation.test.ts or a new geometry test file

Exact patch recommendation

Replace:
position: [landingCenterX / 2, ...]
with:
position: [landingCenterX, ...].
Add a geometry test that asserts the intermediate landing center lies midway between flight 1 at x=0 and flight 2 at x=sW + gapBetweenFlights.
5. High: landing-depth logic is likely reversed in both turn geometries

Both buildLShapeGeometry() and buildUShapeGeometry() compute landing depth with Math.min(sW, LANDING_MIN_DEPTH_MM / 1000). Because the constant is explicitly named LANDING_MIN_DEPTH_MM, using Math.min makes the landing no deeper than the smaller of stair width and code minimum. If the intent is a code minimum, that is backwards. If the intent is only a visual placeholder, the name is misleading.

Files to patch

stairway-geometry-l-shape.ts
stairway-geometry-u-shape.ts
possibly stairway-computation.ts if you want landing requirement computed centrally

Exact patch recommendation

If this is a real minimum-depth rule, change both files to:
const landingDepth = Math.max(sW, LANDING_MIN_DEPTH_MM / 1000).
If it is only a visual simplification, rename it to landingDepthVisual and document that it is not a compliance dimension. Right now the current name reads like code logic, not display logic.
6. High: egress logic is duplicated and semantically inconsistent with stair compliance

The evacuation overlay in stairway-configurator.ts recomputes occupant load inline from a local literal map, while stairway-egress.ts already owns egress calculations. That is duplicate business logic. Also, computeEgressRequirements() calculates width using providedExits, not effectiveRequiredExits, and stairCountsAsExit uses RA9514_MIN_EXIT_WIDTH_MM, while stair-width compliance elsewhere uses a different constant, RA9514_MIN_WIDTH_MM. That may be intentional, but right now the tool does not explain the distinction.

Files to patch

stairway-configurator.ts
stairway-egress.ts
stairway-computation.ts

Exact patch recommendation

In stairway-configurator.ts, stop computing occupant load from an inline record. Import and use computeEgressRequirements() or extract a shared helper from stairway-egress.ts. One formula only.
In stairway-egress.ts, either:
rename stairCountsAsExit to something narrower like meetsMinimumExitElementWidth, or
align it with the same threshold model used in stair compliance.
Decide whether requiredWidthPerExit should be based on providedExits or effectiveRequiredExits. If the current behavior is pedagogical, label it explicitly. If not, compute both and expose the shortfall.
7. Medium: detail-mode controls are ahead of the implemented geometry

The UI exposes riserUndercut, contrastStripWidth, handrailProfile, and wallClearance. But buildNosingProfile() ignores undercut and contrast strip by prefixing them with underscores, and the handrail detail cross-section always draws a circular profile from handrailDiameter only. wallClearance is used in info violations, not in the displayed handrail section geometry. That is feature drift between UI and actual rendering.

Files to patch

stairway-configurator.ts
stairway-nosing.ts

Exact patch recommendation

In stairway-nosing.ts, actually use riserUndercutDeg to tilt or offset the underside return, and use contrastStripWidthMm to add a visible strip segment to the profile or a separate overlay element.
In stairway-configurator.ts, branch profilePoints for circular, oval, and rectangular-rounded instead of always generating a circle. Use wallClearance to offset the section from the wall reference.
If you do not want to implement that now, hide or disable the controls until they affect geometry. Do not ship controls that lie.
8. Medium: click-target coverage is incomplete

The click registry covers treads, risers, handrails, headroom, top and bottom landings, BP 344 rails/extensions, width gaps, and IBC ghosts. It does not cover landing-intermediate, nosing-detail-*, handrail-cross-section, children-rail-711-*, or evac-dot-*, even though those IDs are created in geometry. That creates inspectability holes in the UX.

Files to patch

stairway-click-targets.ts
stairway-configurator.ts
stairway-geometry-l-shape.ts
stairway-geometry-u-shape.ts

Exact patch recommendation
Add at least these patterns:

landing-intermediate → “Intermediate Landing”
nosing-detail-* → “Nosing Detail”
handrail-cross-section → “Handrail Section”
children-rail-711-* → “Child-height Rail”
evac-dot-* → either “Evacuation Occupant” or make them intentionally non-clickable and document that.
9. Medium: evacuation overlay is non-deterministic

Tolerance mode uses a seeded PRNG, which is good. The evacuation overlay uses Math.random() directly for dot spread. That means the same parameters can render different occupant patterns every time, which makes testing and teaching harder.

Files to patch

stairway-configurator.ts
optionally stairway-computation.ts if you want a shared deterministic RNG utility

Exact patch recommendation

Reuse the seeded RNG approach already present in stairway-computation.ts, or move it into a small shared utility.
Seed it from stable inputs such as floorArea, occupancyType, stairWidth, and numRisers, or add an explicit evacuationSeed param for replayability.
10. Medium: the test suite misses the riskiest paths, and one test name is misleading

The current tests cover Blondel, pitch, a few preset checks, and stair-type parsing. That is not enough for a rule-heavy visualization module. On top of that, one Blondel boundary test is named “too-stretched” while asserting comfortable, which matches the implementation but mislabels the rule boundary.

Files to patch

stairway-computation.test.ts
add stairway-geometry.test.ts
add stairway-click-targets.test.ts
add stairway-egress.test.ts

Exact patch recommendation
Add tests for:

BP 344 handrail failure also producing BP 344 visual status
computeInternationalDeltas() under accessible, exit, commercial, and high-occupancy conditions
U-shape landing center
L-shape and U-shape landing depth rule
click-target coverage for all generated special IDs
deterministic evacuation dots
semantic distinction between stairCountsAsExit and width compliance.
Also rename the Blondel boundary test title so it does not contradict its own expectation.
11. Low: type comments have drifted behind the implementation

StairTypeConfig already includes l-shape and u-shape, but the ComputedStairState comment still says “Phase 1: always straight.” That is minor, but it is stale documentation inside a codebase that is teaching-heavy.

Files to patch

stairway-types.ts

Exact patch recommendation

Update the comment to reflect the current stair-type union, or remove the phase language entirely.
Recommended order of execution

Do the work in this order:

stairway-computation.ts and stairway-types.ts
stairway-configurator.ts
stairway-geometry-u-shape.ts and stairway-geometry-l-shape.ts
stairway-egress.ts
stairway-click-targets.ts
stairway-nosing.ts
tests last, but in the same branch before merge.

The blunt truth is this: the codebase is good enough to save, but not yet trustworthy enough to present as a compliance authority without one hardening pass. The first pass should be about consistency, not cosmetics.

- we also need to fix some conflicting and overlapping geometries in the stairs too. is there a way to examine that and propose for solutions so this wont happen again

Yes.

And the screenshot plus the current geometry code already show that this is not just a visual quirk. There are real interpenetration patterns in the stair model, especially at the flight endpoints. The circled top and bottom conditions are consistent with how the straight stair places landings, treads, risers, and handrails today.

What is likely happening right now
1. The straight stair has landing-to-tread overlap at both ends

In the straight builder, the first tread is centered at z = 0, while the bottom landing is centered at z = tD / 2 with the same depth tD. That means the bottom landing overlaps the first tread by half a tread depth. At the top, the top landing is centered at -((n - 1) * tD + tD / 2), which likewise overlaps the last tread by half a tread depth. That aligns with the two circled zones in your screenshot.

2. The stair is being assembled from overlapping solids, not cleanly butted solids

Each tread is a full box, and each riser is another box placed at the tread edge with its own thickness. That means even the step assembly itself has small volume overlap between tread and riser boxes. That can be tolerated visually in some simple demos, but it is not a safe basis for a precision configurator.

3. The handrail is generated as one full sloped cylinder across the flight

The straight handrails are built from overall rise and run, using one cylinder per side over the full stair length. That makes endpoint collisions more likely at the first and last step zones because the rail is not being trimmed against a landing join, bracket zone, or a defined setback rule.

4. The same fragility exists in the turning stair builders

The L-shape and U-shape builders also use hand-built positional formulas for landings and step starts, and both still use Math.min(sW, LANDING_MIN_DEPTH_MM / 1000) for landing depth. The U-shape builder also places the intermediate landing at landingCenterX / 2, which is almost certainly wrong. So this is not just a straight-stair problem. It is a geometry-generation pattern problem.

Yes, there is a proper way to examine this

You need a geometry QA layer, not just eyeballing.

Recommended examination method
1. Add a geometry validator pass after every build

Create a new utility, for example:

stairway-geometry-validator.ts

It should take the final GeometryInstruction[] and convert each item into a collision proxy:

box → oriented box
cylinder → capsule or conservative oriented bounding box
extruded-profile → bounding box, then optional finer check later

Then run pair checks with rules:

allowed: face-touching adjacency
allowed with tiny epsilon: intentional construction joins
forbidden: measurable interpenetration
ignored: transparent ghost overlays and teaching overlays

This gives you a machine-readable overlap report instead of visual guessing.

2. Tag every geometry instruction by category

Add metadata such as:

category: 'structural' | 'handrail' | 'overlay' | 'debug'
allowTouchWith: string[]
forbidIntersectWith: string[]

Right now the instructions only carry IDs and visual properties. That is not enough for reliable QA. The click target system already relies on stable ID patterns, so you already have the start of a classification system. Build on that.

3. Add a debug view in the configurator

Add toggles for:

show bounding boxes
show overlap heatmap
show element IDs
isolate selected pair
explode geometry by category

That will let you inspect exactly which two elements are clashing.

4. Fail tests when forbidden overlaps appear

This should become part of automated tests, not just manual review. For each preset and for a grid of representative stair settings, build geometry and assert:

no structural-structural penetration over epsilon
no handrail-structural penetration over epsilon
only whitelisted overlay intersections are ignored
How to stop this from happening again

There are two levels of fix.

Level 1: patch the current builders

This is the practical near-term fix.

A. Fix straight stair endpoint joins in stairway-configurator.ts

The bottom and top landings should not be centered half a tread into the flight. They need to be positioned from explicit join planes, not guessed from tD / 2. Right now:

bottom landing center = tD / 2
top landing center = -((n - 1) * tD + tD / 2)

That is what causes the half-depth overlap with the first and last treads.

Patch direction:

define a proper landingDepth
define the first flight tread front/back planes
place the landing so it starts exactly at the flight join plane, not inside the adjacent tread volume

In blunt terms, stop positioning landings by center convenience. Position them by edge contracts.

B. Trim or rethink tread-riser assembly

At minimum, reduce overlap between tread and riser solids by making them butt at a shared face rather than occupy the same volume. Right now the box-on-box composition is convenient but sloppy.

Patch direction:

either move riser thickness fully outside tread volume
or generate one continuous stair body mesh and keep semantic tread/riser regions separate for interaction only
C. Rebuild handrails from explicit path endpoints

Do not keep generating straight-flight rails only from overall rise/run center formulas. That is too coarse for endpoint control.

Patch direction:

define first nosing point
define last nosing point
define any required setback or extension
build rail from path endpoints
clip against landing volumes or end at valid join points

That will eliminate the handrail passing through awkward edge conditions.

D. Fix turning geometry with the same join logic

For stairway-geometry-l-shape.ts and stairway-geometry-u-shape.ts, stop computing landings and flight starts independently with loosely related formulas. The U-shape landing center issue is already a warning sign.

Patch direction:

derive landing geometry from the end plane of flight 1 and the start plane of flight 2
never place a landing by an arbitrary midpoint formula unless it is derived from those actual boundaries
replace Math.min(...) landing depth logic with either a true code-driven minimum or a clearly named visual placeholder.
Level 2: change the modeling strategy

This is the better long-term fix.

Best permanent approach: build from a 2D stair section and extrude

Instead of building the stair from many overlapping boxes, define a stair profile as a clean 2D polyline:

landing
riser
tread
riser
tread
top landing

Then extrude that profile across stair width.

That gives you one clean structural stair body with no accidental internal overlaps.

After that, generate semantic helper geometry separately:

clickable tread regions
clickable riser regions
compliance overlays
handrails
debug markers

That separation is far cleaner than trying to make every box both structural and semantic.

Exact file-by-file recommendations
stairway-configurator.ts

Patch first.

Replace center-based landing placement in buildStraightGeometry() with edge-based placement.
Replace full-run handrail generation with endpoint/path-based generation.
Add optional debug overlay generation from validator results.
Stop inline random evac dots later, but that is secondary.
stairway-geometry-l-shape.ts
Replace landingDepth = Math.min(...) unless that is intentionally non-code visual behavior.
Build second flight from landing edge, not from loosely offset center assumptions.
stairway-geometry-u-shape.ts
Fix landingCenterX / 2 immediately.
Rebuild intermediate landing and flight 2 start from exact join planes.
Use the same validator against U-shape outputs.
stairway-types.ts

Add metadata types for geometry QA:

geometry category
allowed-contact policies
overlap report structure
validator result object
New file: stairway-geometry-validator.ts

Add:

broadphase bounding-box pass
narrowphase pair checks
whitelist rules
penetration depth report
helper for test assertions
Tests

Add:

stairway-geometry-validator.test.ts
stairway-straight-joins.test.ts
stairway-turning-joins.test.ts

Each should build geometry from presets and assert zero forbidden overlap.

The practical standard I would enforce

Every generated stair should satisfy these rules:

Structural elements may touch, but not penetrate more than a tiny epsilon.
Handrails may not penetrate landings, treads, or risers.
Landings must join flights by shared boundaries, not shared volume.
Overlays can intersect structural geometry only if explicitly marked non-physical.
Any new geometry builder must pass validator tests before merge.

That is how you stop this from recurring.

My direct conclusion

Yes, this can be examined properly, and yes, there is a repeatable way to prevent it.

The root problem is that the current stair is being composed by local placement formulas per element. What you need is:

topology first
join contracts second
validation third
rendering last

That order is what keeps a configurator clean.

## Overview

Yes. The right move now is to formalize geometry generation so every stair is built from explicit join boundaries, then run a validator over the generated geometry before it is considered valid for rendering. The current builders place bottom and top landings with center-based formulas, and the straight stair handrail is generated as one full sloped cylinder from aggregate rise and run. That is exactly the kind of setup that produces the endpoint clashes visible in your screenshot. The same general pattern also exists in the L-shape and U-shape builders.    

The concrete fix is a 4-part system:

1. introduce a join-contract model
2. rebuild straight stair geometry from those contracts
3. add a geometry validator pass
4. make tests fail on forbidden overlaps

That is how this stops being a recurring bug and becomes a controlled system.

## Point 01: Exact formulas to replace in the straight stair builder

Right now the straight stair builder places the bottom landing at `z = tD / 2` with depth `tD`, while the first tread is centered at `z = 0` with the same depth. It places the top landing at `-((n - 1) * tD + tD / 2)`, which likewise overlaps the last tread. The handrail is then derived from `totalRise = n * rH` and `totalRun = (n - 1) * tD`, which overextends the rail into the stair endpoints instead of trimming it to the actual stair run.  

### Replace the current straight landing logic with edge-based join planes

Use this geometry contract:

```ts
const landingDepth = tD

const firstTreadCenterZ = 0
const lastTreadCenterZ = -((n - 1) * tD)

const bottomJoinZ = firstTreadCenterZ + tD / 2
const topJoinZ = lastTreadCenterZ - tD / 2

const bottomLandingCenterZ = bottomJoinZ + landingDepth / 2
const topLandingCenterZ = topJoinZ - landingDepth / 2
```

Then replace the landing placement with:

```ts
g.push({
  id: 'base-platform',
  type: 'box',
  position: [0, -TREAD_THICKNESS_M / 2, bottomLandingCenterZ],
  args: [sW, TREAD_THICKNESS_M, landingDepth],
  color: NEUTRAL_COLORS.LANDING,
})

g.push({
  id: 'top-landing',
  type: 'box',
  position: [0, topY - TREAD_THICKNESS_M / 2, topLandingCenterZ],
  args: [sW, TREAD_THICKNESS_M, landingDepth],
  color: NEUTRAL_COLORS.LANDING,
})
```

This makes the landing and flight share a boundary plane instead of sharing volume.

### Replace the current straight handrail logic with endpoint-derived rails

The current rail is centered from total rise and total run, which is too coarse. Build it from explicit endpoints instead:

```ts
const railRun = (n - 1) * tD
const railRise = (n - 1) * rH
const railAngle = Math.atan2(railRise, railRun)

const sideOffset = sW / 2 + STRINGER_THICKNESS_M / 2

const railStartBaseY = rH
const railEndBaseY = n * rH
const railStartBaseZ = 0
const railEndBaseZ = -((n - 1) * tD)

const railOffsetY = hrH * Math.cos(railAngle)
const railOffsetZ = hrH * Math.sin(railAngle)

for (const s of [-1, 1] as const) {
  const x = s * sideOffset

  const start: [number, number, number] = [
    x,
    railStartBaseY + railOffsetY,
    railStartBaseZ + railOffsetZ,
  ]

  const end: [number, number, number] = [
    x,
    railEndBaseY + railOffsetY,
    railEndBaseZ + railOffsetZ,
  ]

  const dx = end[0] - start[0]
  const dy = end[1] - start[1]
  const dz = end[2] - start[2]
  const len = Math.sqrt(dx * dx + dy * dy + dz * dz)

  g.push({
    id: `handrail-${s < 0 ? 'L' : 'R'}`,
    type: 'cylinder',
    position: [
      (start[0] + end[0]) / 2,
      (start[1] + end[1]) / 2,
      (start[2] + end[2]) / 2,
    ],
    rotation: [Math.PI / 2 + railAngle, 0, 0],
    args: [HANDRAIL_RADIUS_M, HANDRAIL_RADIUS_M, len, 8],
    color: hrColor,
  })
}
```

That change alone will eliminate most of the endpoint nonsense you are seeing in the straight stair. It replaces convenience math with actual start and end points. The need for this is directly supported by the current center-based straight builder and the screenshot showing conflicts at both ends.  

## Point 02: Introduce a join-contract model

Right now each builder is doing local placement math. That is the real root problem. The builders need a common contract that defines where one piece is allowed to end and where the next piece must begin. The current files already use stable IDs and explicit stair-type models, so the codebase is ready for this kind of formalization.  

### Add this to `stairway-types.ts`

```ts
export type GeometryCategory =
  | 'structural'
  | 'handrail'
  | 'overlay'
  | 'debug'

export interface JoinPlane {
  axis: 'x' | 'z'
  value: number
  label: string
}

export interface RunContract {
  id: string
  category: 'flight' | 'landing'
  width: number
  depth: number
  elevationY: number
  startPlane: JoinPlane
  endPlane: JoinPlane
}

export interface JoinContractSet {
  bottomLanding: RunContract
  mainFlight: RunContract
  topLanding: RunContract
}

export interface GeometryPolicy {
  idPattern: string
  category: GeometryCategory
  allowTouch: boolean
  maxPenetrationM: number
  ignoreAgainst?: string[]
}

export interface PairOverlap {
  aId: string
  bId: string
  penetrationX: number
  penetrationY: number
  penetrationZ: number
  penetrationMax: number
  categoryA: GeometryCategory
  categoryB: GeometryCategory
  severity: 'info' | 'warn' | 'error'
}

export interface GeometryValidationReport {
  overlaps: PairOverlap[]
  hasErrors: boolean
}
```

### Then add a helper for straight stairs

Either in `stairway-computation.ts` or in a new `stairway-geometry-contracts.ts`:

```ts
export const buildStraightJoinContracts = (
  sW: number,
  tD: number,
  rH: number,
  n: number,
  landingDepth: number,
): JoinContractSet => {
  const firstTreadCenterZ = 0
  const lastTreadCenterZ = -((n - 1) * tD)

  const bottomJoinZ = firstTreadCenterZ + tD / 2
  const topJoinZ = lastTreadCenterZ - tD / 2

  return {
    bottomLanding: {
      id: 'bottom-landing',
      category: 'landing',
      width: sW,
      depth: landingDepth,
      elevationY: 0,
      startPlane: { axis: 'z', value: bottomJoinZ, label: 'joins-flight' },
      endPlane: { axis: 'z', value: bottomJoinZ + landingDepth, label: 'outer-edge' },
    },
    mainFlight: {
      id: 'main-flight',
      category: 'flight',
      width: sW,
      depth: (n - 1) * tD + tD,
      elevationY: 0,
      startPlane: { axis: 'z', value: bottomJoinZ, label: 'joins-bottom-landing' },
      endPlane: { axis: 'z', value: topJoinZ, label: 'joins-top-landing' },
    },
    topLanding: {
      id: 'top-landing',
      category: 'landing',
      width: sW,
      depth: landingDepth,
      elevationY: n * rH,
      startPlane: { axis: 'z', value: topJoinZ - landingDepth, label: 'outer-edge' },
      endPlane: { axis: 'z', value: topJoinZ, label: 'joins-flight' },
    },
  }
}
```

This gives every geometry builder a single legal boundary set to obey. No more guessed center placement.

## Point 03: Add a geometry validator API

The current builders generate `GeometryInstruction[]`, and the click-target registry already classifies pieces by ID pattern. That means you can add a validator without reworking the entire rendering engine.  

### Create `stairway-geometry-validator.ts`

Use this API:

```ts
import type { GeometryInstruction } from '@/features/3d-lab/types/templates'
import type {
  GeometryPolicy,
  GeometryValidationReport,
  PairOverlap,
} from './stairway-types'

export interface ValidationPrimitive {
  id: string
  type: GeometryInstruction['type']
  category: 'structural' | 'handrail' | 'overlay' | 'debug'
  center: [number, number, number]
  size: [number, number, number]
  rotation?: [number, number, number]
}

export const buildValidationPrimitives = (
  geometry: GeometryInstruction[],
  policies: GeometryPolicy[],
): ValidationPrimitive[] => {
  // Convert boxes to OBB or AABB proxies
  // Convert cylinders to capsule or conservative OBB proxies
  // Skip ghost overlays when policy says ignore
  return []
}

export const validateGeometry = (
  geometry: GeometryInstruction[],
  policies: GeometryPolicy[],
  epsilon = 0.001,
): GeometryValidationReport => {
  // 1. broadphase AABB pairing
  // 2. narrowphase overlap
  // 3. apply policy-based allow/ignore logic
  // 4. return explicit overlap report
  return { overlaps: [], hasErrors: false }
}
```

### Recommended default policy set

```ts
export const DEFAULT_GEOMETRY_POLICIES: GeometryPolicy[] = [
  {
    idPattern: 'tread-*',
    category: 'structural',
    allowTouch: true,
    maxPenetrationM: 0.001,
  },
  {
    idPattern: 'riser-*',
    category: 'structural',
    allowTouch: true,
    maxPenetrationM: 0.001,
  },
  {
    idPattern: 'base-platform',
    category: 'structural',
    allowTouch: true,
    maxPenetrationM: 0.001,
  },
  {
    idPattern: 'top-landing',
    category: 'structural',
    allowTouch: true,
    maxPenetrationM: 0.001,
  },
  {
    idPattern: 'landing-intermediate',
    category: 'structural',
    allowTouch: true,
    maxPenetrationM: 0.001,
  },
  {
    idPattern: 'handrail-*',
    category: 'handrail',
    allowTouch: false,
    maxPenetrationM: 0.0005,
  },
  {
    idPattern: 'bp344-rail-*',
    category: 'overlay',
    allowTouch: true,
    maxPenetrationM: 999,
  },
  {
    idPattern: 'width-gap-*',
    category: 'overlay',
    allowTouch: true,
    maxPenetrationM: 999,
  },
  {
    idPattern: 'headroom-plane',
    category: 'overlay',
    allowTouch: true,
    maxPenetrationM: 999,
  },
]
```

That policy structure works well with your existing ID naming approach. 

## Point 04: How to wire the validator into the configurator

The cleanest way is to run validation after geometry generation in development and test environments.

### In `stairway-configurator.ts`

After:

```ts
const geometry = (p: StairParams): GeometryInstruction[] => {
  const state = computeStairState(p)
  return buildGeometryFromState(state, p)
}
```

change to:

```ts
const geometry = (p: StairParams): GeometryInstruction[] => {
  const state = computeStairState(p)
  const g = buildGeometryFromState(state, p)

  if (process.env.NODE_ENV !== 'production') {
    const report = validateGeometry(g, DEFAULT_GEOMETRY_POLICIES)
    if (report.hasErrors) {
      console.warn('Stair geometry validation errors', report)
    }
  }

  return g
}
```

That gives you immediate QA during development without blocking production initially. The reason this fits naturally is that your architecture already routes through `computeStairState()` and then through a builder function.  

## Point 05: Debug tooling you should add now

The screenshot proves manual visual review is useful, but manual review alone is weak. Add four debug toggles:

* show join planes
* show validation boxes
* isolate overlap pair
* explode by category

Your current interface already has toggles for compare mode, history, tolerance, detail views, and evacuation, so a debug layer is consistent with how the configurator is already structured. 

### Suggested new params in `stairway-configurator.ts`

```ts
{
  key: 'showGeometryDebug',
  label: 'Show Geometry Debug',
  type: 'toggle',
  default: false,
  group: 'Learning Overlays',
},
{
  key: 'showJoinPlanes',
  label: 'Show Join Planes',
  type: 'toggle',
  default: false,
  group: 'Learning Overlays',
},
{
  key: 'showOverlapBoxes',
  label: 'Show Overlap Boxes',
  type: 'toggle',
  default: false,
  group: 'Learning Overlays',
},
```

Then generate debug `GeometryInstruction`s from the validator report when enabled.

## Point 06: Apply the same contract model to L-shape and U-shape

Both turn builders are doing the same class of work by hand, including center-based landing placement, and both use `Math.min(sW, LANDING_MIN_DEPTH_MM / 1000)` for landing depth. The U-shape builder also places the landing at `landingCenterX / 2`, which should be corrected immediately.  

### Immediate fixes

For `stairway-geometry-u-shape.ts`, replace:

```ts
position: [landingCenterX / 2, landingY - TREAD_THICKNESS_M / 2, landingZ]
```

with:

```ts
position: [landingCenterX, landingY - TREAD_THICKNESS_M / 2, landingZ]
```

For both `stairway-geometry-l-shape.ts` and `stairway-geometry-u-shape.ts`, stop using landing placement formulas that do not come from actual flight end planes. The builder should derive:

* flight 1 end plane
* landing start and end planes
* flight 2 start plane

and then place geometry from those boundaries, not from approximate center arithmetic. The need for that is directly shown in both turning builders.  

## Point 07: Test plan that prevents recurrence

The current codebase has computation tests, but geometry needs its own hard tests now. The stair-type abstraction is already explicit in `stairway-types.ts`, which makes this straightforward to test builder by builder. 

### Add these test files

1. `stairway-geometry-validator.test.ts`

   * builds straight, L-shape, and U-shape stairs
   * asserts zero forbidden overlaps

2. `stairway-straight-joins.test.ts`

   * asserts bottom landing touches first tread but does not penetrate
   * asserts top landing touches last tread but does not penetrate
   * asserts handrails do not penetrate landings or steps

3. `stairway-turning-joins.test.ts`

   * asserts intermediate landing is centered and non-overlapping
   * asserts flight 2 starts exactly at landing boundary

### Example assertion style

```ts
const g = buildGeometryFromState(state, params)
const report = validateGeometry(g, DEFAULT_GEOMETRY_POLICIES)

expect(report.hasErrors).toBe(false)
expect(report.overlaps).toEqual([])
```

That is the standard you need. If a new geometry formula breaks join cleanliness, the branch fails immediately.

## Point 08: Recommended implementation order

### Phase 1

Patch straight stair joins and straight handrail endpoints in `stairway-configurator.ts`. This gives immediate visual relief where the screenshot is already showing defects.  

### Phase 2

Create `stairway-geometry-validator.ts` and the new types in `stairway-types.ts`. Wire validator warnings into development mode. 

### Phase 3

Fix U-shape landing center and migrate both turn builders onto join contracts.  

### Phase 4

Add geometry tests and make them required for merge.

## Final recommendation

Do not keep treating geometry as a collection of independently placed boxes and cylinders. Treat it as a contract-driven assembly:

* define boundaries first
* place solids from those boundaries
* validate all pairs
* render only after validation

That is the correct path for a configurator that wants to be trusted.

The next move should be to implement Point 01 and Point 02 first, because those two will solve the visible straight-stair clash and give the rest of the system a real foundation.
