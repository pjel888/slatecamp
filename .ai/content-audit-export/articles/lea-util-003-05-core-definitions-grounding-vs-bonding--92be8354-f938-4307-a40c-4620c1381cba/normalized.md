## What You Need to Know for the LEA

## Learning Goal

Distinguish grounding from bonding — grounding connects the electrical system to the earth for safety, bonding creates an electrically conductive path between metallic parts — and apply PEC Article 2.50 and 2.70 requirements for both systems in building design.
## Core Definitions: Grounding vs. Bonding

_Grounding_ and _bonding_ are distinct functions with specific definitions in the PEC:

<ArticleMedia id="media-lea-util-003-05-core-definitions-groundi" type="image" caption="Grounding Electrode System — Ground Rod, Ufer Ground, Ground Plate, Bonding of Metal Pipes" alt="Building electrical grounding diagram showing: driven ground rod (2.4m min, 16mm dia, ≤25 ohms per PEC 2.50.56), concrete-encased Ufer ground (6m conductor in foundation footing), ground plate (0.186m² copper). Bonding conductors connect metal water piping, structural steel, gas piping to service ground. GFCI (5mA, 25ms response) and AFCI locations per PEC annotated." suggestedAsset="Diagram or reference image" status="placeholder" />


**Grounding** refers to the intentional connection of electrical systems or equipment to earth, creating a low-resistance path for fault current. The PEC defines this as the connection of conductive parts to the ground electrode system to establish zero reference potential (PEC Article 2.00 (Definitions)).

**Bonding** means the connection of conductive parts that are not normally part of the electrical circuit—such as metal enclosures, structural steel, water pipes, and gas piping—to ensure they are at the same electrical potential and to carry fault current safely. Bonding prevents dangerous voltage differences between conductive surfaces (PEC Article 2: Definitions and Article 2.50).

## Grounding Electrode System

[SLATECAMP_UI_BLOCK:ui_0003 component="KeyValues" status="preserved"]

[SLATECAMP_UI_BLOCK:ui_0002 component="ExamTip" status="preserved"]

[SLATECAMP_UI_BLOCK:ui_0001 component="Tip" status="preserved"]

The grounding electrode system provides the physical connection from the building electrical system to the earth. The PEC requires a grounding electrode system in all buildings and structures supplied by an electrical service (PEC Article 2.50.50).

### Ground Rod Specifications

Ground rods are the most common grounding electrode in Philippine construction. PEC requirements specify:

- _Minimum length:_ 2.4 m (8 feet) driven vertically into earth (PEC Article 2.50.56)
- _Minimum diameter:_ 16 mm (5/8 inch) for ferrous rod, 13 mm (1/2 inch) for copper or copper-clad rod (PEC Article 2.50.52(a)(5))
- _Material:_ Galvanized steel, copper, or copper-clad rod rated for the soil environment
- _Minimum quantity:_ Two electrodes spaced at least 1.8 m (6 feet) apart if the first electrode has a ground resistance exceeding 25 ohms (PEC Article 2.50.56(b)(1))

In tropical Philippine soil conditions with high moisture and mineral content (particularly in coastal areas), ground rods often achieve lower resistance values than in temperate zones. Sandy or volcanic soils require deeper installation or additional electrodes.

### Ground Plate Electrodes

Ground plates may be used where ground rods are impractical:

- _Minimum surface area:_ 0.186 m² (2 square feet) of copper plate (PEC Article 2.50.52(a)(6))
- _Material:_ Copper plate minimum 6 mm (1/4 inch) thick
- _Installation:_ Buried in earth at least 0.76 m (2.5 feet) below grade
- _Orientation:_ Plates may be horizontal or vertical depending on available space

### Concrete-Encased Electrode (Ufer Ground)

The concrete-encased electrode (also called Ufer ground) consists of copper conductor embedded in concrete foundation:

- _Configuration:_ Minimum 6 mm (1/4 inch) diameter copper conductor in the concrete foundation footing (PEC Article 2.50.52(a)(3))
- _Length requirement:_ Minimum 6 m (20 feet) of conductor
- _Installation:_ Embedded in concrete that is directly in contact with the earth
- _Advantage:_ Highly stable; concrete absorbs moisture and maintains consistent electrode resistance over time
- _Philippine preference:_ Commonly used in multi-story building foundations where concrete continuously contacts soil

The Ufer ground is reliable in Philippine construction because concrete footings remain moist due to tropical humidity and regular exposure to moisture, maintaining excellent contact resistance.

## Ground Resistance Requirements

Ground electrode resistance is measured in ohms and directly affects the effectiveness of the grounding system:

- _PEC maximum standard requirement:_ 25 ohms for a single electrode (PEC Article 2.50.56(a))
- _Two electrode requirement trigger:_ If first electrode exceeds 25 ohms, a second electrode must be installed (PEC Article 2.50.56(b)(1))
- _Sensitive equipment threshold:_ 5 ohms or less for equipment requiring high reliability (computer systems, medical equipment, communication facilities) (PEC Article 2.50.56(c))

Meralco (Manila Electric Company) grounding requirements for utility service connection typically require ground resistance ≤ 25 ohms measured at the utility meter point (Meralco Specification SR-2020).

Seasonal variation in Philippine soil moisture may cause ground resistance fluctuations of 5–15% throughout the year, requiring periodic measurement.

## Equipment Grounding Conductors

Equipment grounding conductors provide the return path for fault current from equipment enclosures to the service ground. Sizing is determined by the rating of the overcurrent device protecting the circuit:

| Overcurrent Device Rating | Copper Conductor Minimum | Aluminum Conductor Minimum |
| ------------------------- | ------------------------ | -------------------------- |
| 15 A                      | 2.08 mm² (14 AWG)        | 3.31 mm² (12 AWG)          |
| 20 A                      | 3.31 mm² (12 AWG)        | 5.26 mm² (10 AWG)          |
| 30 A                      | 5.26 mm² (10 AWG)        | 8.37 mm² (8 AWG)           |
| 40 A                      | 5.26 mm² (10 AWG)        | 8.37 mm² (8 AWG)           |
| 50 A                      | 8.37 mm² (8 AWG)         | 13.3 mm² (6 AWG)           |
| 100 A                     | 13.3 mm² (6 AWG)         | 21.2 mm² (4 AWG)           |

(PEC Article 2.50.122, Table 2.50.122(A))

Equipment grounding conductors must be run in the same conduit or cable as circuit conductors (PEC Article 3.00.3(b)(1)). In the Philippines, PEC-compliant green or bare copper conductors are standard; double insulation is acceptable for specific applications where approved.

## Ground Fault Circuit Interrupter (GFCI)

GFCIs detect leakage current (ground faults) and interrupt power within 25 milliseconds when fault current exceeds 5 mA, preventing electrocution (PEC Article 2.10.8).

### Required Locations

PEC mandates GFCI protection in the following locations:

- _Bathrooms:_ All outlets in bathrooms (PEC Article 2.10.8(a)(1))
- _Kitchen countertops:_ All outlets within 1.5 m (5 feet) of the sink (PEC Article 2.10.8(a)(6))
- _Laundry areas:_ All outlets in laundry rooms and similar wet areas (PEC Article 2.10.8(a)(7))
- _Outdoor outlets:_ All outdoor receptacles (PEC Article 2.10.8(a)(3))
- _Crawl spaces:_ Outlets in crawl spaces with limited headroom (PEC Article 2.10.8(a)(5))
- _Wet areas:_ Saunas, whirlpools, and areas with standing water or high humidity (PEC Article 2.10.8(a)(2) and (9))

In Philippine construction, GFCI protection is critical in tropical climates where high humidity is constant. The PEC recognizes this by requiring GFCI protection in all areas with moisture exposure.

### GFCI Specifications

- _Response time:_ Maximum 25 milliseconds for ground fault ≥ 5 mA
- _Test button:_ Equipped with TEST and RESET buttons for periodic verification
- _Leakage current threshold:_ Activates at 5 mA ± 1 mA (PEC Article 2.10.8(b)(2))
- _Maximum circuit impedance:_ GFCI devices must function reliably up to 2,000 ohms impedance

GFCI devices must be tested monthly using the TEST button. If the RESET button does not restore power, the device is defective and must be replaced.

## Arc Fault Circuit Interrupter (AFCI)

AFCIs detect dangerous arcing conditions and interrupt power within 250 milliseconds before arcing can ignite combustible materials (PEC Article 2.10.12).

### Required Locations

- _Bedroom circuits:_ All branch circuits supplying outlets in bedrooms (PEC Article 2.10.12(a)(1))
- _Living areas:_ Living rooms, family rooms, dining rooms, kitchens, hallways, laundries, and any other habitable spaces (PEC Article 2.10.12(a)(2))
- _Fire-rated areas:_ May be required in other areas where fire containment is critical (PEC Article 2.10.12(b))

### AFCI Specifications

- _Detection time:_ 250 milliseconds for series arcing
- _Current sensitivity:_ Detects arcing fault current between 20 A and 150 A
- _Nuisance trip prevention:_ Designed to avoid false trips from normal equipment operation
- _Combination AFCI-GFCI:_ Single devices providing both arc fault and ground fault protection are available

In the Philippines, AFCI protection in bedrooms is required by the PEC 2017 Part 1 (PEC Article 2.10.12(a)(1)). Verify current NBC adoption status with the National Building Code 2004 Revised IRR or latest amendments.

## Bonding Requirements

Bonding ensures all conductive surfaces are at the same potential, eliminating dangerous voltage differences. The PEC requires bonding of:

### Metal Water Piping Systems

All water piping must be bonded to the service ground:

- _Connection point:_ At the main service entrance or at the meter point before any water meter or shutoff valve (PEC Article 2.50.104(a)(1))
- _Bonding conductor:_ Sized per Table 2.50.122(A) based on main overcurrent device rating
- _Material:_ Copper, aluminum, or copper-clad steel; minimum 3.31 mm² (12 AWG) for most services

In the Philippines, bonding is critical in areas with salt-water splash (coastal properties) where galvanic corrosion accelerates piping degradation and increases fault risk.

### Structural Steel and Metal Frames

All structural steel members that might carry fault current must be bonded:

- _Connection:_ To the service ground electrode system or to the equipment grounding conductor
- _Clamps and connectors:_ High-strength mechanical clamps rated for the bonding conductor size (PEC Article 2.50.8)
- _Testing requirement:_ Continuity verified with ≤ 5 ohms resistance (PEC Article 2.50.94)

### Gas Piping and Fuel Lines

Gas piping may not be used as an equipment grounding conductor, but must be bonded to ensure it does not develop dangerous voltage:

- _Connection:_ Bonded to the service ground at the meter point (PEC Article 2.50.104(b))
- _Bonding size:_ Minimum 4 mm² (12 AWG) copper or equivalent
- _Gas company approval:_ Coordinate with gas utility to ensure bonding does not interfere with their isolation requirements

In the Philippines, Meralco and Manila Water service agreements require bonding verification before service activation.

## Electrical Safety Practices

### Lockout/Tagout (LOTO)

Lockout/tagout procedures prevent energization of equipment during maintenance or repair:

- _Procedure:_ De-energize the circuit, verify de-energization with a multimeter or voltage tester, lock the breaker in the OFF position, and attach a tag with the worker's name and date (PEC Article 1.10.7)
- _Verification tools:_ Non-contact voltage testers must be tested for proper function before and after each use
- _Multiple workers:_ Each worker applies their own lock if multiple people work on the same circuit
- _Tag content:_ Include identification of the person applying the lock and the date

### Working Clearances

The PEC mandates minimum clearances around electrical equipment to prevent accidental contact:

- _In front of equipment:_ Minimum 1 m (3 feet) of clear space for inspection and maintenance (PEC Article 1.10.26(a)(1))
- _Width of workspace:_ Minimum width equal to the width of the equipment or 75 cm (2.5 feet), whichever is greater (PEC Article 1.10.26(a)(2))
- _Height requirement:_ Minimum 2.1 m (7 feet) clear height above the equipment (PEC Article 1.10.26(a)(3))
- _Access routes:_ No obstructions that would prevent safe exit from the equipment area
- _Additional spaces:_ Service spaces may require additional clearance depending on equipment access requirements

In multi-story Philippine buildings, working clearances must be verified during design because typical floor-to-floor heights (3.0–3.6 m) sometimes conflict with equipment size and circuit routing.

## Lightning Protection Grounding

Lightning protection systems must be grounded to safely dissipate high-energy strikes. See unit LEA-UTIL-003-03 for detailed lightning protection design. Key grounding points:

- _Lightning rod grounding:_ Connection to dedicated ground electrode system rated for lightning current (PEC Article 2.50.60)
- _Separation requirement:_ Lightning grounding electrodes must be separated ≥ 1.8 m (6 feet) from service ground or bonded together (PEC Article 2.50.60(a))
- _Conductor sizing:_ Lightning protection conductors minimum 13.3 mm² (6 AWG) copper or 21.2 mm² (4 AWG) aluminum (PEC Article 2.50.60(c))

The Philippines experiences 12–15 lightning days per year in most regions (Philippine Atmospheric, Geophysical and Astronomical Services Administration), making lightning grounding critical in exposed building locations.

## Philippine-Specific Considerations

### Tropical Soil Conditions

Philippine soils vary widely by region:

- _Coastal areas:_ Salt-contaminated soil reduces grounding effectiveness; may require deeper electrodes or concrete-encased electrodes
- _Volcanic regions:_ Loamy, mineral-rich soil typically provides good grounding; 1–2 m depth often sufficient
- _Alluvial plains:_ High groundwater table and moisture provide excellent grounding; 1.5 m depth often adequate
- _Seasonal variation:_ Dry season (November–May) increases ground resistance; wet season (June–October) decreases it

Annual ground resistance testing is recommended in the Philippines to verify system reliability year-round (PEC Article 2.50.4).

### Meralco Service Connection Requirements

Manila Electric Company (Meralco) service specifications require:

- _Ground resistance:_ ≤ 25 ohms at service point (Meralco Specification SR-2020)
- _Testing method:_ Fall-of-potential method using a calibrated ground resistance tester (Meralco Service Order SR-2020)
- _Certification:_ Meralco technician must verify grounding before service activation
- _Annual verification:_ Large consumers may require annual testing and certification

Meralco connection applications must include documented ground resistance test results before service is energized.

### Voltage Standards

Philippine electrical systems operate at standard voltage levels:

- _Single-phase residential:_ 220 V / 60 Hz (not 110 V as in some countries)
- _Three-phase commercial/industrial:_ 380 V / 60 Hz (ΔY configuration 380/220 V)
- _Frequency:_ All Philippine systems operate at 60 Hz

These voltage standards affect equipment selection, GFCI/AFCI coordination, and arc energy calculations.

## Summary of Key Requirements

| Requirement                       | Specification                      | PEC Reference                       |
| --------------------------------- | ---------------------------------- | ----------------------------------- |
| Ground rod minimum length         | 2.4 m (8 feet)                     | Article 2.50.56                     |
| Ground rod minimum diameter       | 16 mm (5/8 inch)                   | Article 2.50.52(a)(5)               |
| Ground resistance maximum         | 25 ohms (single electrode)         | Article 2.50.56(a)                  |
| Ground resistance, dual electrode | 25 ohms (both electrodes combined) | Article 2.50.56(b)(1)               |
| Sensitive equipment target        | ≤ 5 ohms                           | Article 2.50.56(c)                  |
| GFCI response time                | 25 milliseconds (≥ 5 mA fault)     | Article 2.10.8(b)(2)                |
| GFCI required: kitchen sink       | Within 1.5 m (5 feet)              | Article 2.10.8(a)(6)                |
| AFCI required: bedrooms           | All branch circuits                | Article 2.10.12(a)(1)               |
| Minimum working clearance: depth  | 1 m (3 feet)                       | Article 1.10.26(a)(1)               |
| Minimum working clearance: height | 2.1 m (7 feet)                     | Article 1.10.26(a)(3)               |
| Equipment grounding: 20 A breaker | 3.31 mm² (12 AWG) copper           | Article 2.50.122, Table 2.50.122(A) |

## Related Articles

See also within Electrical Systems: **lea-util-003-02-core-concept**, **lea-util-003-03-core-concept**, **lea-util-003-04-core-concept**, **lea-util-003-06-core-concept**.

> **Overview:** See **overview-building-utilities-mepf** for the full curriculum structure and study strategy. See **mastery-building-utilities-mepf** for connections across topics.

