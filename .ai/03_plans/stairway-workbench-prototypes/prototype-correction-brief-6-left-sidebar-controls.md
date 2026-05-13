# Stairway Workbench Correction Brief 6 — Left Sidebar Board-Vital Controls

Date: 2026-05-13

## Live page evidence

Browser inspection of `http://localhost:3000/dashboard/3d-lab/stairway-configurator` at 1440×820 after skipping orientation showed the current left panel has a 639px viewport but 3032px scroll height. It includes presets, project classification, stair type, turn controls, geometry, learning overlays, nosing, handrail detail, user safety, material, and egress calculator controls.

This confirms the current issue is not only visual size; the default left sidebar mixes at least four jobs:
1. learner input,
2. legal scenario classification,
3. detailed modeling/options,
4. study/preset/challenge navigation.

## Board-vital left controls to keep on first load

Recommended default left sidebar controls:

1. Riser height — direct PD 1096/BP 220/RA 9514 check; core board-exam value.
2. Tread depth — direct PD 1096/BP 220/RA 9514 check; pairs with riser for stair comfort.
3. Clear stair width — direct PD 1096/BP 220/BP 344/RA 9514 check; high exam value because required width changes by context.
4. Headroom clearance — direct PD 1096 check; board-vital and currently hidden too far down in the scroll.
5. Risers in flight / number of risers — needed because total vertical rise between landings is a PD 1096 and RA 9514 check. Label should teach the concept, not just say `Number of Risers`.
6. Handrail height — direct PD 1096 and BP 344 check; board-vital but should be visually subordinate after the main stair body dimensions.

## Read-only derived metrics to show, not control

Compact derived chips can teach without adding decision fatigue:
- `2R + T` comfort value;
- pitch angle;
- total vertical rise;
- total run.

These should update automatically and should not become extra sliders.

## Keep out of the default left sidebar

Move to law-card modals, lesson flows, or advanced/detail panels later:
- project type;
- accessible-route toggle;
- exit-stair toggle;
- occupant-load toggle;
- stair type / turn direction / risers before turn;
- preset/challenge buttons;
- nosing projection/radius/undercut/contrast strip;
- handrail diameter/wall clearance/profile;
- primary users;
- material;
- floor area / occupancy type / exits / sprinkler / evacuation simulation.

Reason: these are meaningful, but not first-load controls. They either define legal context, advanced detail, rendering/material behavior, or separate egress lessons.

## New primary prototype

`variant-i-compact-left-board-vital-controls.html`

This supersedes Variant H for the left sidebar only. The right sidebar pattern from Variant H remains acceptable for now.
