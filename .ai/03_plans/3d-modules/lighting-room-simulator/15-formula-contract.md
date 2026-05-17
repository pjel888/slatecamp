# Formula Contract - Lighting Room Simulator

Purpose: define the exact v0 calculations so implementation, tests, presets, panels, and learner copy do not drift.

## Model Layers

### 1. Teaching Model

Used for left-panel values, fix cards, and deterministic tests.

It is intentionally simple:
- average lux = lumens / room area
- LPD = watts / room area
- efficacy = lumens / watts
- beam footprint = geometry estimate from mounting height and beam angle

This model is allowed to teach relationships. It is not allowed to claim professional photometric precision.

### 2. Visual Model

Used for Three.js scene appearance.

It maps:
- lumens → visible intensity
- color temperature → light color
- beam angle → cone and spotlight angle
- under-target state → dim/warning visual treatment

This model is visual calibration, not measured lux.

### 3. Source Model

Used for right-panel source/legal language.

It decides:
- source pending vs located vs approved
- whether pass/fail legal language can render
- what law family owns each threshold

It must fail closed.

## Inputs

| Key | Unit | v0 range | Default | Notes |
|---|---:|---:|---:|---|
| `lampType` | - | incandescent / fluorescent / led | led | Sets default efficacy assumptions. |
| `wattage` | W | 5-200 | 48 | User-adjustable. |
| `lumens` | lm | 200-12000 | 4800 | Required range to support 750 lux in 16m2. |
| `beamAngle` | degrees | 15-120 | 90 | Affects visual footprint, not v0 average lux. |
| `colorTemp` | K | 2700-6500 | 4000 | Warm / neutral / cool labels. |
| `mountingHeight` | m | 2.1-3.6 | 2.7 | Affects beam footprint and visual falloff, not v0 average lux. |
| `roomType` | - | office / drafting / reading / corridor / custom | office | Determines selected target when not custom. |
| `roomWidth` | m | 2-8 | 4 | Room area input. |
| `roomDepth` | m | 2-8 | 4 | Room area input. |

## Formulas

### Room area

```text
roomArea = roomWidth * roomDepth
```

### Average illuminance

```text
averageLux = lumens / roomArea
```

### Lumens needed for target

```text
lumensNeeded = targetLux * roomArea
```

### Lighting power density

```text
lpd = wattage / roomArea
```

### Efficacy

```text
efficacy = lumens / wattage
```

### Beam diameter at floor

```text
beamDiameterAtFloor = 2 * mountingHeight * tan((beamAngle / 2) in radians)
```

### Suggested wattage from lumens

```text
wattage = lumens / efficacyByLampType
```

Default teaching efficacies:

| Lamp type | Default efficacy |
|---|---:|
| incandescent | 12 lm/W |
| fluorescent | 60 lm/W |
| led | 100 lm/W |

## Rounding

| Output | Rounding |
|---|---|
| `averageLux` | nearest whole lux |
| `lumensNeeded` | nearest 50 lm for suggestions |
| `lpd` | 1 decimal W/m2 |
| `efficacy` | nearest whole lm/W |
| `roomArea` | 1 decimal only when needed |
| `beamDiameterAtFloor` | 1 decimal m |

## v0 Targets

Targets are teaching defaults until source cards approve legal language.

| Room type | v0 target | Source status |
|---|---:|---|
| office | 300 lux | located, pending SME |
| drafting | 750 lux | located, pending SME |
| reading | 500 lux | located, pending SME |
| corridor | 150 lux | located, pending SME |
| custom | none | not applicable |

## Canonical Presets

| Preset ID | Area | Lumens | Watts | Expected average lux | Expected LPD | Expected efficacy |
|---|---:|---:|---:|---:|---:|---:|
| `office-standard` | 16m2 | 4800 | 48 | 300 | 3.0 | 100 |
| `drafting-studio` | 16m2 | 12000 | 120 | 750 | 7.5 | 100 |
| `old-incandescent` | 16m2 | 1200 | 100 | 75 | 6.3 | 12 |
| `corridor-minimum` | 12m2 | 1800 | 30 | 150 | 2.5 | 60 |
| `under-target-demo` | 16m2 | 480 | 40 | 30 | 2.5 | 12 |
| `same-lumens-led` | 16m2 | 1200 | 12 | 75 | 0.8 | 100 |
| `same-lumens-incandescent` | 16m2 | 1200 | 100 | 75 | 6.3 | 12 |

## Compliance And Source Guard

The calculation engine can compute "below selected target" even while source is pending. The UI must name this carefully:

Allowed:
- "Below selected target"
- "At target in teaching model"
- "Source pending"
- "Needs source approval for legal pass/fail"

Forbidden before source approval:
- "Compliant"
- "Violation"
- "Illegal"
- "Code failed"

## Test Requirements

Minimum future unit tests:

1. `4800 lm / 16m2 = 300 lux`
2. `12000 lm / 16m2 = 750 lux`
3. `1200 lm / 16m2 = 75 lux`
4. `1800 lm / 12m2 = 150 lux`
5. `48 W / 16m2 = 3.0 W/m2`
6. `1200 lm / 12 W = 100 lm/W`
7. Same lumens comparison has equal average lux and different LPD.
8. Beam diameter decreases when beam angle decreases.
9. Mounting height changes beam footprint but not v0 average lux.
10. `SOURCE_PENDING` and `LOCATED` both prevent legal pass/fail display.

## Display Copy Requirements

Every formula popover must identify the model:

- Average lux: "Simplified teaching model."
- Beam coverage: "Geometric estimate."
- LPD: "Energy-use comparison."
- Efficacy: "Typical lamp benchmark unless source-approved."

## Out Of Scope For v0

- CU / LLF
- RCR
- fixture count calculations
- uniformity ratio
- daylight contribution
- IES files
- measured lux heatmaps

These may appear in source research, but must not be active v0 controls or release blockers.
