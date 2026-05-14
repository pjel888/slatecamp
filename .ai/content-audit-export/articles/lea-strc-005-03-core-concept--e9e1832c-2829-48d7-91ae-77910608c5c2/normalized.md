# Allowable Stress Design and Working-Stress Checks

## Board Exam Quick Check

Allowable Stress Design, also called a working-stress check in many board-exam contexts, compares a service-level computed stress with an allowable stress. The safe memory rule is simple: compute the actual stress caused by service loading, then check that it does not exceed the allowable stress for the material, member, and limit state.

## What You Need To Know

The allowable-stress method uses a safety margin by limiting the stress permitted in the member. A basic axial tension check can be read as computed tensile stress less than or equal to allowable tensile stress. A flexural check follows the same idea: compute maximum bending stress using the section properties, then compare it with the allowable stress.

For beams, bending stress is tied to the neutral axis. Fibers farther from the neutral axis carry larger bending stress, which is why section depth and section modulus are so important. A deeper or more efficient section can reduce stress and deflection for the same loading.

Do not treat allowable stress as a universal shortcut. A stress check may pass while another limit still governs. Deflection, vibration, buckling, local instability, connection behavior, and load-path continuity can still control design.

## Real World Scenario

An architect reviews an existing mezzanine beam for added storage. In an ASD-style check, the engineer does not compare service stress with a factored design resistance. The engineer computes the service stress from the added load, compares it with the allowable stress, and separately reviews deflection and stability.

## High-Yield Distinctions

| Topic | Exam-safe cue |
| --- | --- |
| ASD or working stress | Service-level computed stress compared with allowable stress. |
| Strength design | Factored demand compared with matching factored or reduced resistance. |
| Axial stress | Force divided by area for the member direction being checked. |
| Bending stress | Highest at the extreme fibers farthest from the neutral axis. |
| Section modulus | A section property used to relate bending moment to bending stress. |
| Stability and serviceability | Separate checks that can govern even when stress is acceptable. |

## Common Mistakes

- Dividing a code yield value by an unsupported fraction when the local source table is not provided.
- Mixing ASD demand with strength-design resistance.
- Forgetting that buckling can govern compression members before material stress reaches its limit.
- Treating a bending-stress pass as a deflection pass.
