# MVP v0 Scope — Parking Lot Requirements

Purpose: narrow the first hidden QA implementation so it can be accurate, testable, and source-gated.

Current status: `DRAFT / SOURCE_PENDING`

## MVP v0 recommendation

Implement only a small source-ready workbench first:

1. Standard passenger parking stall geometry
   - perpendicular/diagonal if source-ready
   - parallel if source-ready
2. Accessible parking quantity table
   - total parking spaces → required accessible spaces
3. Accessible stall/access aisle geometry
   - only after BP 344 geometry conflict is resolved
4. One residential/housing parking count or off-site rule
   - include only if BP 220 or PD 957 locator is source-ready
5. Source-pending labels and fail-closed behavior
   - must exist from first hidden QA build

## Explicitly deferred from v0 unless source-ready early

- Truck/bus parking bays.
- Full angle-by-angle aisle width table.
- Fire-code garage requirements.
- LGU overlay selector.
- Imported vehicle GLB assets.
- Parking demand generation / ITE-style ratios.
- Multi-level parking garage structure.
- Automated professional compliance report.

## v0 learner/QA story

A reviewer opens the hidden module and can:
- adjust stall width/length and see which dimension fails,
- adjust total spaces and accessible spaces and see pending accessible-count results,
- inspect source status for each rule,
- see where the accessible route/access aisle is located,
- verify no source-pending rule uses final compliance language.

## v0 acceptance criteria

- All default inputs produce `CALCULATION OK` for source-pending rules or `COMPLIANT` only if the rule is already source-ready.
- A below-minimum width/length turns only affected geometry red.
- Accessible count shortage highlights count card and missing ghost stalls/access aisles, not the whole lot.
- Right panel shows exact source status per rule.
- UI clearly says `QA Preview` if surfaced in dashboard.
- Tests cover below, at, and above limit for every implemented numeric rule.

## v0 implementation stop line

If BP 344 accessible stall geometry remains unresolved, v0 must not implement accessible geometry pass/fail. It may show accessible count and route as source-pending review aids only.
