# Lighting Architecture Bridge - Lighting Room Simulator

Purpose: prevent future implementation from assuming the current generic parametric renderer can deliver the module's core behavior.

## Verdict

`ACCEPTED_FOR_V0_OPTION_A`

Accepted: 2026-05-15

The bridge is accepted for hidden QA implementation. v0 should use a module-specific `LightingRoomScene` mounted through the `useTemplateContent.tsx` special path with `disableLighting: true`. A generic shared renderer light-instruction extension is deferred until at least a second module needs dynamic lights.

The Lighting Room Simulator is not a normal config-only `ParametricSceneConfig` module. The existing `geometry()` contract returns mesh instructions. It does not return live `PointLight`, `SpotLight`, lighting helpers, or custom shader/material behavior. Because the module's teaching mechanism is live light, v0 needs a deliberate renderer path before coding.

## Current Architecture Evidence

| Evidence | Implication |
|---|---|
| `src/features/3d-lab/types/templates.ts` defines `GeometryInstruction` types such as `box`, `plane`, `cone`, `sphere`, and `instanced`. | Geometry instructions are mesh-oriented. |
| `src/features/3d-lab/templates/ParametricSceneRenderer.tsx` maps geometry instructions to `InstructionMesh` or `InstancedMesh`. | It cannot render `PointLight` / `SpotLight` from config today. |
| `src/features/3d-lab/components/rendering/StudioLighting.tsx` `clinical` preset uses ambient 0.7, key 1.0, fill 0.6. | `clinical` adds bright scene lights; it does not remove competing lights. |
| `CanvasWrapper` scene config supports `disableLighting`. | A module-specific scene can own lighting if the special path disables studio lighting. |
| `useTemplateContent.tsx` already has special paths for modules such as stairway, parking, wall configurator, and site development controls. | A lighting special path is consistent with current architecture. |

## Options

### Option A - Module-Specific `LightingRoomScene` (Recommended v0)

Build a dedicated scene component for this module and slot it through the special path.

Shape:

```tsx
canvasWrapper(
  <LightingRoomScene useStore={useStore} />,
  { disableLighting: true, showGround: false },
)
```

Responsibilities:
- subscribe to module params
- compute lighting state
- render room geometry
- render fixture body
- render `pointLight` / `spotLight`
- render optional beam cone
- render source-safe under-target visual treatment

Pros:
- Fastest route to correct behavior.
- No risky generic renderer changes.
- Keeps light behavior close to the module's learning model.
- Avoids changing the shared `GeometryInstruction` contract before the concept is proven.

Cons:
- Less reusable if many future modules need custom lights.
- Some geometry logic may live outside the config module.

Decision:
- Use Option A for v0 hidden QA.

### Option B - Typed `LightInstruction` Extension

Extend the 3D Lab type system and renderer with light instructions.

Example:

```typescript
type SceneInstruction = GeometryInstruction | LightInstruction

interface LightInstruction {
  id: string
  type: 'point-light' | 'spot-light'
  position: [number, number, number]
  intensity: number
  color: string
  angle?: number
  distance?: number
  decay?: number
}
```

Pros:
- Reusable for future lighting, daylight, fire/smoke visibility, and MEP modules.
- Keeps module scene data in config.

Cons:
- Broadens shared renderer surface.
- Requires more tests and blast-radius review.
- More than v0 needs unless multiple modules immediately need light instructions.

Decision:
- Defer until a second module needs dynamic lights.

### Option C - Fake Brightness With Materials Only

Change surface material colors and opacities without real Three.js lights.

Pros:
- Config-only.
- Easiest to test.

Cons:
- Undercuts the product promise.
- Beam angle and mounting height become artificial.
- Learners may not see a convincing light relationship.

Decision:
- Reject for v0.

## v0 Architecture Decision

Use Option A:

- `LightingRoomScene` owns live lights.
- `computeLightingState()` remains pure and shared by panels and scene.
- `lighting-room-simulator.ts` still owns stable params, presets, source ids, and non-light geometry constants.
- `useTemplateContent.tsx` special path uses `disableLighting: true`.
- Studio lighting is not used as the main light source.

## Scene Component Contract

Inputs:
- `useStore`
- optional debug flags from overlay store if already available

Derived state:
- `computeLightingState(params)`
- `kelvinToRgb(colorTemp)`
- `mapLumensToVisualIntensity(lumens)`
- `beamDiameterAtFloor`
- `source-safe target status`

Outputs:
- room group
- fixture group
- module light
- beam cone
- optional annotations

Do not:
- write to Supabase
- run source approval logic in the scene
- calculate legal compliance in JSX
- describe visual falloff as measured lux

## Light Calibration Rules

The calibration is visual, not legal:

- 4800 lm in a 4m x 4m office should look adequate.
- 1200 lm in the same room should look noticeably dimmer but not black.
- 12000 lm should look bright but not washed out.
- color temperature should be visible but subtle.
- beam cone should teach spread without hiding the room.

Implementation should expose constants in one place:

```typescript
const VISUAL_LIGHT_BASELINE = {
  baselineLumens: 4800,
  baselineIntensity: 3.0,
  minIntensity: 0.25,
  maxIntensity: 8.0,
}
```

Exact values can be tuned during visual QA.

## Source And Panel Interaction

The scene should not decide legal language. It receives display state from the computation/source guard:

| State | Scene behavior | Panel behavior |
|---|---|---|
| target met, source pending or located | normal brightness | "At target in teaching model", source status badge |
| below target, source pending or located | dim room, warning/review accent | "Below target in teaching model", fix card |
| below approved threshold | dim room, restrained destructive accent | approved non-compliance copy |
| custom room | neutral | no legal pass/fail |

## Acceptance Criteria

- [ ] `ParametricSceneRenderer` is not required to render live lights for v0.
- [ ] `CanvasWrapper` receives `disableLighting: true` for the lighting module if `LightingRoomScene` is used.
- [ ] `LightingRoomScene` imports only existing R3F/Three primitives already in the project.
- [ ] Computed values match panel values because both use the same pure computation function.
- [ ] Visual QA captures low, target, and high-lumen states.
- [ ] Documentation and code comments clearly call the light calibration "visual calibration."

## Future Upgrade Trigger

Create a typed `LightInstruction` extension only when:

- at least two modules need live lights, or
- a shared renderer-level lighting feature is necessary, or
- maintaining module-specific scenes becomes more expensive than a generic extension.
