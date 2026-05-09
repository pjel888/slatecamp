# BP 344 Accessible Route Ramp — SME Source Review Checklist

Generated: 2026-05-08
Worktree: `/Users/philiplewis/slatecamp-worktrees/bp344-accessible-route-ramp`
Module slug: `bp344-accessible-route-ramp`

## Reviewer objective

Verify each encoded BP 344 source rule against the raw PDF before the 3D Lab module is allowed to show source-backed compliance labels.

Current release decision remains:

- PASS for dashboard QA preview only
- NO-GO for learner/public release

## Required reviewer inputs

1. Located raw BP 344 2024 IRR PDF:
   `/Users/philiplewis/slatecamp/vitruvius-connection/001_Raw-Source-Layer/001-Laws/BP-344/2024 Revised Implementing Rules and Regulations Batas Pambansa Blg. 344 _ National Council on Disability Affairs.pdf`
2. Verified SHA-256:
   `63ba8df9a0c5092aa28aae1e1afbbff4f82697768b4ce38230f960444a6a4953`
3. This checklist.
4. `bp344-accessible-route-ramp-source.ts`
5. `bp344-source-rules.json`
6. `release-gate-source-sme-review-packet.md`
7. `raw-pdf-text-verification.generated.md` and `.json`

## Approval rule

Only mark a source rule approved when all of these are verified:

- source_card_id is appropriate
- page_locator is correct
- section_locator is correct
- exact_quote matches the raw PDF
- normalized_rule preserves the legal/code meaning
- encoded value/formula interpretation is correct
- compliance_scope is correct (`ramp_core`, `ramp_core_special_case`, or `route_context`)

Route-context rules are intentionally contextual annotations, not pass/fail checks.

## Rules to review

### 1. bp344_ramp_clear_width_min

- Source card ID: `sc-bp344-ramp-slope-width-2024-p2`
- Page locator: `2`
- Section locator: `Appendix A, Minimum Requirements for Accessibility, A.1 Accessible Ramps`
- Compliance scope: `ramp_core`
- Classification: `code-mandated`
- Encoded value: `clear_width_min_mm=1200`
- Current human review status: `AI_EXTRACTED_LOCAL_RAW_SOURCE_PENDING_HUMAN_APPROVAL`
- Fail closed when source missing: `True`

Exact quote to verify:

> Accessible ramps shall have the following facilities and features: 1. Minimum clear width of 1200 mm 2. Gradient not steeper than 1:20. Steeper gradients may be allowed in special cases depending on the length to be covered. Maximum Slope Maximum Length Maximum Rise Interval for Landing 1:20 – – 15m 1:15 10.50m 700mm 10m

Normalized rule to approve/correct:

> Accessible ramp minimum clear width is 1200 mm.

Reviewer decision:

- [ ] APPROVE as encoded
- [ ] CORRECT page/section locator
- [ ] CORRECT exact quote
- [ ] CORRECT normalized rule
- [ ] CORRECT formula/value interpretation
- [ ] REJECT / remove from module scope

Reviewer notes:

- 
### 2. bp344_ramp_general_slope_max

- Source card ID: `sc-bp344-ramp-slope-width-2024-p2`
- Page locator: `2`
- Section locator: `Appendix A, Minimum Requirements for Accessibility, A.1 Accessible Ramps`
- Compliance scope: `ramp_core`
- Classification: `code-mandated`
- Encoded value: `max_general_slope_ratio=1:20`
- Current human review status: `AI_EXTRACTED_LOCAL_RAW_SOURCE_PENDING_HUMAN_APPROVAL`
- Fail closed when source missing: `True`

Exact quote to verify:

> Gradient not steeper than 1:20. Steeper gradients may be allowed in special cases depending on the length to be covered.

Normalized rule to approve/correct:

> General accessible ramp gradient must not be steeper than 1:20.

Reviewer decision:

- [ ] APPROVE as encoded
- [ ] CORRECT page/section locator
- [ ] CORRECT exact quote
- [ ] CORRECT normalized rule
- [ ] CORRECT formula/value interpretation
- [ ] REJECT / remove from module scope

Reviewer notes:

- 
### 3. bp344_ramp_special_slope_review

- Source card ID: `sc-bp344-ramp-slope-width-2024-p2`
- Page locator: `2`
- Section locator: `Appendix A, Minimum Requirements for Accessibility, A.1 Accessible Ramps`
- Compliance scope: `ramp_core_special_case`
- Classification: `code-mandated`
- Encoded value: `special_slope_ratio=1:15; special_max_length_m=10.50; special_max_rise_mm=700; landing_interval_m=10`
- Current human review status: `AI_EXTRACTED_LOCAL_RAW_SOURCE_PENDING_HUMAN_APPROVAL`
- Fail closed when source missing: `True`

Exact quote to verify:

> Maximum Slope Maximum Length Maximum Rise Interval for Landing 1:20 – – 15m 1:15 10.50m 700mm 10m

Normalized rule to approve/correct:

> Special 1:15 slope row requires maximum length 10.50 m and maximum rise 700 mm; runtime status should be REVIEW_SPECIAL_CASE unless policy is human-approved.

Reviewer decision:

- [ ] APPROVE as encoded
- [ ] CORRECT page/section locator
- [ ] CORRECT exact quote
- [ ] CORRECT normalized rule
- [ ] CORRECT formula/value interpretation
- [ ] REJECT / remove from module scope

Reviewer notes:

- 
### 4. bp344_ramp_landing_length_min

- Source card ID: `sc-bp344-ramp-landing-handrail-edge-2024-p2`
- Page locator: `2`
- Section locator: `Appendix A, A.1 Accessible Ramps`
- Compliance scope: `ramp_core`
- Classification: `code-mandated`
- Encoded value: `intermediate_landing_length_min_mm=1800; terminal_level_area_min_mm=1800`
- Current human review status: `AI_EXTRACTED_LOCAL_RAW_SOURCE_PENDING_HUMAN_APPROVAL`
- Fail closed when source missing: `True`

Exact quote to verify:

> Accessible ramps with a total length longer than 10.50m shall be provided with intermediate landings with a minimum length of 1800 mm... Level area not less than 1800 mm at the upper end and lower end of any ramp.

Normalized rule to approve/correct:

> Intermediate landings and terminal level areas use minimum 1800 mm length/depth.

Reviewer decision:

- [ ] APPROVE as encoded
- [ ] CORRECT page/section locator
- [ ] CORRECT exact quote
- [ ] CORRECT normalized rule
- [ ] CORRECT formula/value interpretation
- [ ] REJECT / remove from module scope

Reviewer notes:

- 
### 5. bp344_ramp_handrail_heights

- Source card ID: `sc-bp344-ramp-landing-handrail-edge-2024-p2;sc-bp344-handrails-general-2024-p7`
- Page locator: `2;7`
- Section locator: `Appendix A, A.1 Accessible Ramps; Appendix A, A.5 Handrails and Grab Bars`
- Compliance scope: `ramp_core`
- Classification: `code-mandated`
- Encoded value: `handrail_low_mm=700; handrail_high_mm=900`
- Current human review status: `AI_EXTRACTED_LOCAL_RAW_SOURCE_PENDING_HUMAN_APPROVAL`
- Fail closed when source missing: `True`

Exact quote to verify:

> Handrails on both sides of the ramp at 700 mm and 900 mm from the finished floor of the ramp to the top of the handrails... Handrails shall be installed at 900 mm and 700 mm above ramps and stairs.

Normalized rule to approve/correct:

> Ramps require both-side handrails at 700 mm and 900 mm where applicable.

Reviewer decision:

- [ ] APPROVE as encoded
- [ ] CORRECT page/section locator
- [ ] CORRECT exact quote
- [ ] CORRECT normalized rule
- [ ] CORRECT formula/value interpretation
- [ ] REJECT / remove from module scope

Reviewer notes:

- 
### 6. bp344_ramp_handrail_trigger_and_grip

- Source card ID: `sc-bp344-handrails-general-2024-p7`
- Page locator: `7`
- Section locator: `Appendix A, A.5 Handrails and Grab Bars`
- Compliance scope: `ramp_core`
- Classification: `code-mandated`
- Encoded value: `handrail_rise_trigger_mm=170; protective_railing_min_mm=1100; grip_diameter_min_mm=30; grip_diameter_max_mm=40`
- Current human review status: `AI_EXTRACTED_LOCAL_RAW_SOURCE_PENDING_HUMAN_APPROVAL`
- Fail closed when source missing: `True`

Exact quote to verify:

> Handrails shall be required for accessible ramps for changes in grade higher than 170 mm... Railings for protection shall be installed at a height of 1100 mm minimum... Handrails and grab bars that require full grip shall have a round cross-section with a diameter of 1 3/16” (30 mm) to 1 37/64” (40 mm).

Normalized rule to approve/correct:

> Accessible ramps with grade change >170 mm require handrails; protective railing minimum 1100 mm; full-grip handrail/grab bar diameter 30–40 mm.

Reviewer decision:

- [ ] APPROVE as encoded
- [ ] CORRECT page/section locator
- [ ] CORRECT exact quote
- [ ] CORRECT normalized rule
- [ ] CORRECT formula/value interpretation
- [ ] REJECT / remove from module scope

Reviewer notes:

- 
### 7. bp344_ramp_raised_edge_min

- Source card ID: `sc-bp344-ramp-landing-handrail-edge-2024-p2`
- Page locator: `2`
- Section locator: `Appendix A, A.1 Accessible Ramps`
- Compliance scope: `ramp_core`
- Classification: `code-mandated`
- Encoded value: `raised_edge_min_mm=100`
- Current human review status: `AI_EXTRACTED_LOCAL_RAW_SOURCE_PENDING_HUMAN_APPROVAL`
- Fail closed when source missing: `True`

Exact quote to verify:

> Raised edge on both sides of the ramp with a minimum height of 100 mm.

Normalized rule to approve/correct:

> Raised edges on both sides of ramp are minimum 100 mm high.

Reviewer decision:

- [ ] APPROVE as encoded
- [ ] CORRECT page/section locator
- [ ] CORRECT exact quote
- [ ] CORRECT normalized rule
- [ ] CORRECT formula/value interpretation
- [ ] REJECT / remove from module scope

Reviewer notes:

- 
### 8. bp344_ramp_tactile_warning

- Source card ID: `sc-bp344-ramp-tactile-traffic-2024-p3`
- Page locator: `3`
- Section locator: `Appendix A, A.1 Accessible Ramps`
- Compliance scope: `ramp_core`
- Classification: `code-mandated`
- Encoded value: `tactile_depth_mm=600; tactile_offset_from_head_foot_mm=300`
- Current human review status: `AI_EXTRACTED_LOCAL_RAW_SOURCE_PENDING_HUMAN_APPROVAL`
- Fail closed when source missing: `True`

Exact quote to verify:

> Ramps shall be provided with tactile warning strips at the head, foot, and landings. The warning tactile blocks shall have a depth of 600 mm and shall be installed: 1. 300 mm from the head and foot of the ramp and, 2. at the center of each landing.

Normalized rule to approve/correct:

> Ramp tactile warning blocks are 600 mm deep, 300 mm from head/foot, and centered at landings.

Reviewer decision:

- [ ] APPROVE as encoded
- [ ] CORRECT page/section locator
- [ ] CORRECT exact quote
- [ ] CORRECT normalized rule
- [ ] CORRECT formula/value interpretation
- [ ] REJECT / remove from module scope

Reviewer notes:

- 
### 9. bp344_ramp_vehicular_traffic_railing

- Source card ID: `sc-bp344-ramp-tactile-traffic-2024-p3`
- Page locator: `3`
- Section locator: `Appendix A, A.1 Accessible Ramps`
- Compliance scope: `ramp_core`
- Classification: `code-mandated`
- Encoded value: `traffic_rise_trigger_mm=200; lower_railing_distance_from_foot_mm=1800`
- Current human review status: `AI_EXTRACTED_LOCAL_RAW_SOURCE_PENDING_HUMAN_APPROVAL`
- Fail closed when source missing: `True`

Exact quote to verify:

> Any ramp with a rise greater than 200 mm and leads down towards an area where vehicular traffic is possible, shall have a railing across the full width of its lower end, not less than 1800 mm from the foot of the ramp.

Normalized rule to approve/correct:

> Vehicular-risk downward ramps with rise >200 mm need a lower-end railing at least 1800 mm from ramp foot.

Reviewer decision:

- [ ] APPROVE as encoded
- [ ] CORRECT page/section locator
- [ ] CORRECT exact quote
- [ ] CORRECT normalized rule
- [ ] CORRECT formula/value interpretation
- [ ] REJECT / remove from module scope

Reviewer notes:

- 
### 10. bp344_route_door_clear_width

- Source card ID: `sc-bp344-doors-clear-level-hardware-2024-p31-p33`
- Page locator: `31-32`
- Section locator: `Appendix C, C.2 Doors`
- Compliance scope: `route_context`
- Classification: `code-mandated`
- Encoded value: `door_clear_width_min_mm=900; double_leaf_clear_width_min_mm=1800`
- Current human review status: `AI_EXTRACTED_LOCAL_RAW_SOURCE_PENDING_HUMAN_APPROVAL`
- Fail closed when source missing: `True`

Exact quote to verify:

> All doors shall have a minimum clear width of 900 mm... For double-leaf doors, the minimum clear width shall be 1800 mm.

Normalized rule to approve/correct:

> Doors minimum clear width 900 mm; double-leaf doors minimum clear width 1800 mm.

Reviewer decision:

- [ ] APPROVE as encoded
- [ ] CORRECT page/section locator
- [ ] CORRECT exact quote
- [ ] CORRECT normalized rule
- [ ] CORRECT formula/value interpretation
- [ ] REJECT / remove from module scope

Reviewer notes:

- 
### 11. bp344_route_door_clear_level_space

- Source card ID: `sc-bp344-doors-clear-level-hardware-2024-p31-p33`
- Page locator: `32`
- Section locator: `Appendix C, C.2 Doors`
- Compliance scope: `route_context`
- Classification: `code-mandated`
- Encoded value: `door_clear_level_space_mm=1800x1800; corridor_exception_width_mm=1500`
- Current human review status: `AI_EXTRACTED_LOCAL_RAW_SOURCE_PENDING_HUMAN_APPROVAL`
- Fail closed when source missing: `True`

Exact quote to verify:

> A minimum clear level space of 1800 mm x 1800 mm shall be provided before and extending beyond a door; EXCEPTION: where a door shall open onto but not into a corridor, the required clear, level space on the corridor side of the door may be a minimum of 1500 mm corridor width.

Normalized rule to approve/correct:

> Door clear level space is 1800 mm x 1800 mm, with a corridor-side exception of 1500 mm corridor width.

Reviewer decision:

- [ ] APPROVE as encoded
- [ ] CORRECT page/section locator
- [ ] CORRECT exact quote
- [ ] CORRECT normalized rule
- [ ] CORRECT formula/value interpretation
- [ ] REJECT / remove from module scope

Reviewer notes:

- 
### 12. bp344_route_door_hardware_height

- Source card ID: `sc-bp344-doors-clear-level-hardware-2024-p31-p33`
- Page locator: `33`
- Section locator: `Appendix C, C.2 Doors`
- Compliance scope: `route_context`
- Classification: `code-mandated`
- Encoded value: `hardware_center_height_mm=900`
- Current human review status: `AI_EXTRACTED_LOCAL_RAW_SOURCE_PENDING_HUMAN_APPROVAL`
- Fail closed when source missing: `True`

Exact quote to verify:

> Door handles, pulls, latches and lever type locksets (doorknob) shall be at 900 mm (centered) above floor finish level.

Normalized rule to approve/correct:

> Door hardware is centered at 900 mm above finished floor level.

Reviewer decision:

- [ ] APPROVE as encoded
- [ ] CORRECT page/section locator
- [ ] CORRECT exact quote
- [ ] CORRECT normalized rule
- [ ] CORRECT formula/value interpretation
- [ ] REJECT / remove from module scope

Reviewer notes:

- 
### 13. bp344_route_corridor_clear_width

- Source card ID: `sc-bp344-corridors-turnabout-2024-p35`
- Page locator: `35`
- Section locator: `Appendix C, C.5 Corridors`
- Compliance scope: `route_context`
- Classification: `code-mandated`
- Encoded value: `corridor_clear_width_min_mm=1500`
- Current human review status: `AI_EXTRACTED_LOCAL_RAW_SOURCE_PENDING_HUMAN_APPROVAL`
- Fail closed when source missing: `True`

Exact quote to verify:

> Corridors shall have minimum clear width of 1500 mm to allow a wheelchair user and a person without disabilities to pass.

Normalized rule to approve/correct:

> Accessible corridors have minimum clear width of 1500 mm.

Reviewer decision:

- [ ] APPROVE as encoded
- [ ] CORRECT page/section locator
- [ ] CORRECT exact quote
- [ ] CORRECT normalized rule
- [ ] CORRECT formula/value interpretation
- [ ] REJECT / remove from module scope

Reviewer notes:

- 
### 14. bp344_route_turnabout_space

- Source card ID: `sc-bp344-corridors-turnabout-2024-p35`
- Page locator: `35`
- Section locator: `Appendix C, C.5 Corridors`
- Compliance scope: `route_context`
- Classification: `code-mandated`
- Encoded value: `turnabout_space_mm=1800x1800; turnabout_spacing_max_mm=12000; turnabout_dead_end_distance_mm=3500`
- Current human review status: `AI_EXTRACTED_LOCAL_RAW_SOURCE_PENDING_HUMAN_APPROVAL`
- Fail closed when source missing: `True`

Exact quote to verify:

> Turnabout spaces shall be provided for wheelchairs to turn around; these spaces shall have a minimum dimension of 1800 mm x 1800 mm and shall be spaced at a maximum of 12000 mm. Turnabout spaces shall also be provided at or within 3500 mm of every dead-end corridor.

Normalized rule to approve/correct:

> Wheelchair turnabout spaces are minimum 1800 mm x 1800 mm, spaced at maximum 12000 mm, and within 3500 mm of every dead-end corridor.

Reviewer decision:

- [ ] APPROVE as encoded
- [ ] CORRECT page/section locator
- [ ] CORRECT exact quote
- [ ] CORRECT normalized rule
- [ ] CORRECT formula/value interpretation
- [ ] REJECT / remove from module scope

Reviewer notes:

- 


## Final SME decision

- [ ] Approve all 14 rules for source-backed dashboard QA
- [ ] Approve selected rules only; list approved IDs below
- [ ] Require corrections before approval
- [ ] Reject this source packet

Approved source_rule_id values:

- 

Required corrections:

- 

Reviewer name / initials:

Date:
