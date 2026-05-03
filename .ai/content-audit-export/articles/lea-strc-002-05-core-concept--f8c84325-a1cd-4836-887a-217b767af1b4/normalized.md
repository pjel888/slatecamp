## What You Need to Know for the LEA
## Learning Goal
By the end of this article, you will be able to:

- Identify truss member types: top chord, bottom chord, verticals, and diagonals
- Distinguish Warren, Pratt, and Howe trusses by their diagonal patterns
- Apply the two zero-force member rules to identify unloaded members
- Explain why triangular geometry makes trusses structurally efficient

Trusses are skeletal structures composed of members arranged in triangular patterns to span long distances with minimal self-weight. Understanding truss member names, types, and the zero-force member concept is essential for structural analysis and LEA success.

## Core Concept

A **truss** is a structural system of straight members connected at joints (usually pinned connections) that form triangles. Trusses are efficient because triangles cannot change shape without changing member lengths, providing inherent rigidity and allowing members to carry primarily axial loads (tension or compression) rather than bending moments.

**Basic Truss Members:**

- **Top Chord**: The upper horizontal (or sloped) members forming the upper boundary of the truss.
- **Bottom Chord**: The lower horizontal (or sloped) members forming the lower boundary.
- **Verticals (or Vertical Members)**: Members oriented perpendicular (or nearly so) to the chords, connecting top and bottom chords.
- **Diagonals**: Members oriented at angles between the chords, typically in tension or compression depending on load direction and truss type.

**Truss Types by Geometry:**
- **Simple Truss**: Single triangular units, economical for short spans.
- **Warren Truss**: Diagonal members form a zigzag W pattern; efficient for distributed loads.
- **Pratt Truss**: Vertical members are in compression (short, efficient); diagonals slope inward from bottom, in tension (long, able to handle tension).
- **Howe Truss**: Diagonals slope outward; verticals carry tension (opposite of Pratt).

**The Zero-Force Member:**

A **zero-force member** is a member that carries no load (zero axial force) under a given loading condition. Zero-force members are identified using equilibrium equations at joints. They commonly occur when:
1. Only two members meet at a joint with no external load, and the members are not collinear—one member must have zero force.
2. Three members meet at a joint, two are collinear, and no external load acts at the joint—the third member has zero force.

Identifying zero-force members is critical for analysis simplification and for recognizing that some members may not be needed under certain load cases, although they may be needed under others.

## Key Provisions

| Truss Type | Chord Configuration | Typical Diagonal Pattern | Efficiency | Span Range |
|-----------|-------------------|-------------------------|-----------|-----------|
| **Simple Truss** | Parallel or triangular | Single triangle | Basic, economical | Short (< 10 m) |
| **Warren** | Parallel | Zigzag W pattern | Good load distribution | Medium (10–20 m) |
| **Pratt** | Parallel | Diagonals slope inward from bottom | Good under gravity loads | Medium–Long (15–40+ m) |
| **Howe** | Parallel | Diagonals slope outward | Adequate; less common than Pratt | Medium (15–25 m) |
| **Pitched (Roof)** | Sloped top, horizontal bottom | Varies (Pratt, Warren) | Efficient for roofs | Medium–Long |

**Zero-Force Member Rules:**
- If two members meet at a joint with no external load and are not collinear, one is zero-force.
- If three members meet at a joint, two are collinear, and no load acts, the third is zero-force.
- Zero-force members can still be designed and included for redundancy or other load cases.

## Philippine Practice Context

In the Philippines, roof trusses (Warren or Pratt types) are common in agricultural buildings, markets, and industrial structures. Long-span trusses are used in gymnasiums, warehouses, and bridge structures. Steel trusses are preferred for their strength-to-weight ratio and durability in tropical climates. Timber trusses are used in residential and light commercial roofs.

## How It's Tested

**Remember-level:** Name the members (chord, vertical, diagonal) and identify truss type (Pratt, Warren, Howe, simple).

**Understand-level:** Explain why triangular geometry makes trusses efficient and why members carry primarily axial loads.

**Apply-level:** Given a truss with specific loading, identify zero-force members using equilibrium equations.

[SLATECAMP_UI_BLOCK:ui_0001 component="Tip" status="preserved"]
Extracted summary:
- Props: (none)
- Text: **Memory aid:** "Chord connects, verticals connect, diagonals brace." Pratt has "inward diagonals" (think Pratt ≈ inward pointing). Zero-force: **two collinear, third bye-bye**; **two non-collinear, one zero**.
- **Exam relevance:** High — expect at least one question on this topic per LEA set.



[/SLATECAMP_UI_BLOCK]


## Related Articles

See also: **Space Frames** (lea-strc-002-06) for the 3D extension of trusses, **Supports** (lea-strc-001-03) for how truss end conditions affect analysis, and **Internal Forces** (lea-strc-001-05) for how truss members carry axial loads.

## Common Mistakes

[SLATECAMP_UI_BLOCK:ui_0003 component="Warn" status="preserved"]
Extracted summary:
- Props: (none)
- Text: These are frequently tested traps. Memorize them to avoid losing easy points on exam day.
[/SLATECAMP_UI_BLOCK]

[SLATECAMP_UI_BLOCK:ui_0002 component="WikiMistakeList" status="preserved"]
Extracted summary:
- Props: mistakes="{[\"Confusing chord (boundary member) with diagonal members—chords form the truss outline\",\"Assuming all members are necessary in all load cases; zero-force members are valid and should be recognized but may not always carry load\",\"Misidentifying Pratt vs Howe—Pratt: diagonals slope inward from bottom (compression); Howe: outward (tension in diagonals)\"]}"
- Text: (none detected)
[/SLATECAMP_UI_BLOCK]