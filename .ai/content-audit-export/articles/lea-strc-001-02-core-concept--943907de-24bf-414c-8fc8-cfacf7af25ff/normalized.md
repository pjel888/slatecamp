# Load as a Force System

## Board Exam Quick Check

For this batch, treat load questions as statics questions unless a captured code source is available. Identify the force, its direction, its point or distribution, and the body it acts on. Do not import uncaptured NSCP live-load values, seismic-zone values, or snow-load assumptions into this bundle.

## What You Need to Know for the LEA

A load is a force or system of forces applied to a body or structural member. In statics, a force is described by magnitude, direction, and point of application. When several forces act together, they can be represented by an equivalent resultant if the resultant has the same external effect on the body.

Loads may be concentrated at a point, or they may be distributed along a length or over an area. Hibbeler treats a common one-axis distributed load as an intensity function, such as w(x), with force per unit length. The equivalent resultant force is found from the area under the loading diagram, and its line of action passes through the centroid or geometric center of that diagram.

## Real World Scenario

A sign panel is subjected to wind pressure across its face. For a source-safe statics answer, the pressure is first converted into a resultant force, and that resultant is located through the centroid of the loaded area before equilibrium equations are written. The local source boundary supports that statics workflow; it does not support assigning an uncaptured Philippine code wind or seismic value here.

## Key Facts and Testable Items

| Exam cue | Source-safe answer |
| --- | --- |
| Force data | Magnitude, direction, and point of application. |
| Distributed load | Represent with an intensity such as w(x). |
| Resultant magnitude | Area under the loading diagram. |
| Resultant location | Centroid or geometric center of the loading diagram or loaded volume. |
| Batch 140 limit | No NSCP numerical load values unless a local refined NSCP conversion is captured. |

## Common Mistakes

- Quoting live-load or seismic-zone numbers when the local refined code source is missing.
- Treating a distributed load as if it always acts at a support.
- Ignoring the location of the resultant force when taking moments.
- Calling every load a dead or live load instead of reading the actual force condition in the stem.
