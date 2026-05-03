## What You Need to Know for the LEA

## Learning Goal

Identify when fire alarm systems are mandatory per RA 9514 (Fire Code of the Philippines) IRR based on building occupancy classification, height, occupant load, and floor area, and distinguish manual from automatic fire alarm system requirements.
## When Fire Alarm Systems Are Mandatory (RA 9514 IRR)

Fire alarm systems are **required** in the following occupancies and floor areas:

[SLATECAMP_UI_BLOCK:ui_0001 component="WikiCalloutBox" status="preserved"]
Extracted summary:
- Props: title="RA 9514 IRR Mandatory Installation Thresholds", variant="warning"
- Text: **Occupancy Group A (Assembly):** Buildings or structures with occupant load exceeding 500 persons, OR with a floor area exceeding 1,000 m² in any storey. **Occupancy Group B (Educational):** Buildings used for educational purposes with occupant load exceeding 500 persons, OR floor area exceeding 1,000 m² in any storey. **Occupancy Group E (Institutional):** All buildings and structures regardless of floor area. **Occupancy Group R (Residential):** All buildings four storeys and higher (mixed-us
[/SLATECAMP_UI_BLOCK]

Key regulatory references:
- **RA 9514 (Fire Code of the Philippines):** Fire alarm system requirements per Implementing Rules and Regulations
- **RA 9514 IRR:** Occupancy-based thresholds (specific table reference requires verification against official 2019 or latest IRR document)
- **NFPA 72:** Technical installation and maintenance standards referenced in RA 9514 IRR (specific edition year requires verification against current IRR document; may be 2019 or earlier edition depending on IRR adoption date)

[Remove this unresolved verification comment and replace with confirmed travel distance values from official RA 9514 IRR, or add a footnote stating: 'Travel distance thresholds per RA 9514 IRR Table 1006 require verification against current IRR edition; consult Fire Safety Engineer for project-specific compliance.']

---

## Fire Alarm System Types

### Type 1: Conventional (Zone-Based) Systems

**Configuration:** Devices are wired in _series_ within designated zones. Each zone is monitored individually at the **Fire Alarm Control Panel (FACP)**.

**Detection Logic:**
- Activation of ANY device in a zone triggers that zone's alarm signal
- The FACP displays the zone number, not the individual device
- Requires technician dispatch to physically locate the activated device

**Advantages:**
- Lower initial installation cost (fewer wires, simpler wiring)
- Suitable for small-to-medium buildings (up to 4–5 storeys with good geometry)
- Fewer circuit addresses required

**Disadvantages:**
- Cannot pinpoint device location without inspection
- Limited diagnostic capability
- Slower occupant and responder response in large buildings

**Philippine Application:** Permitted in buildings ≤1,000 m² per floor with simple, linear geometry (corridors, rectangular floor plates). Example: 3-storey office buildings with clear stairwell placement.

---

### Type 2: Addressable Systems

**Configuration:** Each detection and notification device has a _unique address_ on a single circuit loop. The FACP displays the exact device location when activated.

**Detection Logic:**
- Each device communicates its address and status continuously
- Device addresses are programmed into the FACP database with floor, zone, and location descriptions
- Activation displays the precise room or area

**Advantages:**
- Immediate pinpointing of fire location
- Reduced response time in large buildings
- Detailed diagnostics (device faults, battery status)
- More efficient design for complex geometries (open plans, irregular floors)

**Disadvantages:**
- Higher material cost (addressable devices, intelligent FACP)
- Requires skilled programming and commissioning
- More complex maintenance procedures

**Philippine Application:** Standard for buildings >4 storeys, hospitals, data centers, and mixed-use developments. NFPA 72 and RA 9514 IRR explicitly recommend addressable systems for buildings >21 metres height.

---

### Type 3: Analog-Addressable Systems

**Configuration:** Hybrid of conventional and addressable. Each device transmits _analog signal values_ (e.g., smoke density, temperature) rather than binary on/off status.

**Detection Logic:**
- FACP analyzes signal trends in real-time; alarm triggers when analog value exceeds threshold
- Multi-level sensitivity: warnings below alarm threshold, alarm above
- Early detection of slow-developing fires via trend analysis

**Advantages:**
- Earlier detection capability (trend analysis before threshold breach)
- Reduced nuisance alarms (devices adjust sensitivity based on air quality trends)
- Backward compatible with addressable circuit architecture

**Disadvantages:**
- Highest cost among the three types
- Requires advanced FACP and trained personnel
- Commissioning is time-intensive

**Philippine Application:** Used in critical facilities (hospitals ICUs, semiconductor fabs) and buildings with high false-alarm risk (kitchens, loading docks). Increasingly specified for premium high-rise residential in Metro Manila.

---

## Detection Devices

### Smoke Detectors

#### Ionization Smoke Detectors

**Principle:** Radioactive source (Americium-241) ionizes air in a chamber, creating a measurable current. Smoke particles reduce ionization, triggering alarm.

**Characteristics:**
- More responsive to _flaming fires_ (e.g., paper, wood, plastics)
- Less responsive to _smoldering fires_ (e.g., upholstered furniture, overheated wiring)
- Susceptible to nuisance alarms from cooking, dust

**Philippine Context:** Phasing out due to radioactive source management concerns and RA 9514 IRR preference for non-radioactive alternatives. Still permitted but not recommended for new installations.

---

#### Photoelectric Smoke Detectors

**Principle:** Light source (LED) and photocell in a darkened chamber. Smoke scatters light to the photocell, triggering alarm.

**Characteristics:**
- More responsive to _smoldering fires_ (smoke with larger particles)
- Equal or superior response to flaming fires
- Lower nuisance alarm rate in typical building environments

**Philippine Application:** Strongly preferred per RA 9514 IRR. Standard for all occupancies. No radioactive material management required under Philippine regulations.

---

#### Placement and Spacing (NFPA 72)

[SLATECAMP_UI_BLOCK:ui_0002 component="WikiExamTable" status="preserved"]
Extracted summary:
- Props: headers="{[\"Location Type\", \"Center-to-Center Distance\", \"Distance from Wall/Beam\", \"Notes\"]}", rows="{[[\"Ceiling (typical)\", \"9.1 m (30 ft)\", \"0.6–0.9 m (2–3 ft) from wall\", \"Most common; maximizes coverage\"], [\"Dead end corridor\", \"9.1 m (30 ft)\", \"Within 0.6 m (2 ft) from end\", \"Place near end, not in corridor center\"], [\"Under beams/ducts\", \"Reduce to 64% of base distance\", \"Consider obstruction zone\", \"Beam spacing critical in open plans\"], [\"Kitchen (non-cooking area)\", \"9.1 m (30 ft)\", \"Avoid cooking exhaust plumes\", \"Use heat detectors in cooking zones instead\"]]}"
- Text: (none detected)
[/SLATECAMP_UI_BLOCK]

**Offset Requirements:** Smoke detectors must be mounted on ceilings. Where ceiling height exceeds 12.2 m (40 ft) and wall obstructions are minimal, consider wall-mounted detectors 0.3–0.6 m (1–2 ft) below ceiling per NFPA 72 Section 17.7.3.

---

### Heat Detectors

**Use Case:** Spaces where smoke detectors cause nuisance alarms (kitchens, mechanical rooms) or where early response to rapid-rise temperature is critical.

#### Fixed-Temperature Heat Detectors

**Principle:** Bimetallic strip or eutectic salt element melts at set temperature (typically 57°C/135°F or 68°C/155°F per NFPA 72).

**Characteristics:**
- Simple, reliable, low cost
- Slower response than rate-of-rise detectors
- Suitable for slow-developing fires in high-ambient-temperature spaces

**Philippine Application:** Loading docks, boiler rooms, kitchens (non-cooking area). Temperature selection based on ambient conditions; 57°C used where ambient ≤ 21°C; 68°C where ambient rises seasonally.

---

#### Rate-of-Rise Heat Detectors

**Principle:** Responds to rapid _temperature increase_ (rate), not absolute temperature. Typical threshold: 8.3°C/min (15°F/min per NFPA 72).

**Characteristics:**
- Detects fast-developing fires earlier than fixed-temperature models
- Can include fixed-temperature element as backup (combination detector)
- More sensitive to steam, transient temperature swings

**Disadvantages:** Mechanical rate-of-rise designs susceptible to false alarms from HVAC surge. Solid-state electronics preferred in modern systems.

---

#### Heat Detector Spacing

[SLATECAMP_UI_BLOCK:ui_0003 component="WikiExamTable" status="unknown"]
Extracted summary:
- Props: headers="{[\"Detector Type\", \"Spacing Center-to-Center\", \"Notes\"]}", rows=true, Fixed-temperature=true, typical=true, m=true, ft=true, NFPA=true, Section=true, site-specific=true, per=true, thermal=true, capacity=true
- Text: 38°C ambient)", "6.1 m (20 ft) or less", "Reduce spacing; temperature rise rate is slower in hot ambient"]]} />
[/SLATECAMP_UI_BLOCK]

---

### Flame Detectors

**Principle:** Detect infrared or ultraviolet radiation emitted by flames. Used in large, open spaces or outdoors where smoke detectors are impractical.

**Types:**
- **Infrared (IR):** Senses heat radiation; responds in 4–8 seconds per NFPA 72
- **Ultraviolet (UV):** Senses high-energy UV; response time 1–2 seconds; higher false-alarm risk
- **Multi-spectrum (IR + UV):** Requires both IR and UV signals to alarm, reducing nuisance alarms

**Philippine Application:**
- Hangar fires, outdoor fuel tank areas, chemical storage (RA 9514 IRR Section 1006.3)
- Rarely used in typical office or residential buildings
- Cost 10–15 times higher than smoke detectors; specialist installation required

---

### Gas Detectors

**Principle:** Detect fire-related gases (carbon monoxide, carbon dioxide) or hazardous gases (hydrogen sulfide) before visible smoke/flame.

**Applications:**
- Server rooms, MRI facilities (where smoke detectors risk false alarms)
- Parking garages (early detection of vehicle fires)
- Hazardous gas storage (RA 9514 Occupancy Group F high-hazard)

**Limitations:** Gas detection not a primary life-safety tool in Philippine fire codes; supplementary to smoke/heat detection.

---

## Fire Alarm Control Panel (FACP)

The FACP is the _intelligence center_ of the fire alarm system.

### Functions

1. **Monitoring:** Continuously polls all devices; displays system status and faults
2. **Alarm Initiation:** Energizes notification circuits (horns, strobes, voice evacuation) and building interface (elevator recall, door release, HVAC shutdown)
3. **Record Keeping:** Logs all events with timestamps for audits and post-incident review
4. **Supervision:** Detects open circuits, short circuits, and device faults; notifies monitoring station

### Design Requirements (NFPA 72 + RA 9514 IRR)

[SLATECAMP_UI_BLOCK:ui_0004 component="WikiCalloutBox" status="preserved"]
Extracted summary:
- Props: title="FACP Mandatory Features for Philippine Buildings", variant="info"
- Text: **Power Supply:** Dual power input (utility AC 220V/60Hz + stored energy backup). Stored energy must support 24 hours of standby + 5 minutes full alarm operation per NFPA 72 Section 10.5.6. Typical: 24V DC batteries with charger, sized per device current draw. **Backup Battery Calculation:** - Standby current (all devices in normal mode): ~0.3–0.5 A typical per zone - Alarm current (all notification devices active): ~5–15 A typical (varies by occupancy size) - Example for 10-storey office: stand
[/SLATECAMP_UI_BLOCK]

---

## Notification Appliances

### Audible Signals (Horns)

**Standard:** NFPA 72 Table 18.4.3 specifies minimum sound pressure levels (SPL) based on occupancy type.

[SLATECAMP_UI_BLOCK:ui_0005 component="WikiExamTable" status="preserved"]
Extracted summary:
- Props: headers="{[\"Occupancy Type\", \"Minimum SPL (dB)\", \"Hearing Distance (m)\", \"Philippine Application\"]}", rows="{[[\"Office, retail\", \"85 dB (ambient +15 dB)\", \"~15 m in open space\", \"Standard commercial floors; multiple horns on large floors\"], [\"Industrial, factory\", \"90 dB\", \"~25 m\", \"Manufacturing facilities; outdoor horns for yard areas\"], [\"Sleeping areas (residential)\", \"75 dB (ambient +15 dB)\", \"~8 m\", \"Bedrooms in apartment buildings; may require notification in unit\"], [\"Mechanical/utility rooms\", \"80–90 dB\", \"Localized\", \"Boiler rooms, electrical rooms; protects on-site personnel\"]]}"
- Text: (none detected)
[/SLATECAMP_UI_BLOCK]

**Spacing:** Horn placement ensures 85 dB SPL (or code-required level) is achieved in all occupiable areas. In large open spaces (>1,000 m² per floor), space horns 30–40 m apart.

---

### Visual Signals (Strobes)

**Standard:** NFPA 72 Section 18.6 requires visual notification in buildings with deaf or hard-of-hearing occupants (hospitals, residential care facilities) and all public assembly spaces >50 persons per occupancy load.

**Strobe Requirements:**
- **Flash Rate:** 1 flash per second (1 Hz) per NFPA 72; ranges 0.5–2 Hz in specific contexts
- **Candlepower:** Minimum 15 candlepower (cd) for general areas; up to 110 cd in larger spaces
- **Spacing:** Max. 12 m (40 ft) from furthest occupant in normal-lit spaces; reduce spacing in dimly lit areas

**Philippine Context:** Increasingly required in Metro Manila high-rise residential (RA 9514 Section 1006.3.4 requires notification in all dwelling units). Mixed-use buildings must provide strobes in common areas (lobbies, corridors, stairwells).

---

### Voice Evacuation Systems

**Requirement:** Buildings >21 metres (approximately 7 storeys) with occupant load >500 must include voice evacuation per RA 9514 Section 1006.3.3(c).

**Function:**
- FACP activates voice circuits and selectable loudspeakers by zone or floor
- Building management (or responding firefighters) provides live instructions via microphone or pre-recorded messages
- Typical message: "Attention. The fire alarm has been activated. Please proceed to the nearest stairwell exit. Do not use elevators."

**Advantages Over Standard Horns:**
- Overcomes "alarm fatigue" (occupants habituated to standard alarm tone)
- Allows specific, floor-targeted evacuation instructions
- Reduces panic by providing clear direction

**Technical Requirements:**
- Loudspeaker coverage: ≥85 dB SPL in all occupiable areas per NFPA 72 Section 18.4.3
- Battery backup for 30 minutes continuous operation (voice evacuation uses more power than horns)
- Integration with elevator announcement system (stairwell horns + loudspeakers for safety)

---

## Integration with Building Systems

### Elevator Recall

**Requirement:** On fire alarm activation, all passenger elevators must automatically return to the designated _recall level_ (typically ground floor or main lobby) and remain out of service.

**RA 9514 IRR Requirement:** Fire alarm system must directly interface with elevator control logic; no manual override permitted during alarm condition.

**Logic:**
1. Fire alarm activation → 24V signal sent to elevator controller
2. All elevators immediately cease responding to calls
3. Occupied elevators proceed to nearest floor, open doors, release passengers
4. Elevators return to recall level and remain idle until fire brigade manually resets system

**Safety rationale:** Prevents occupants from using elevators during evacuation (smoke inhalation, entrapment in dead floors, shaft damage from fire).

---

### HVAC Shutdown

**Requirement:** Fire alarm activation must trigger HVAC shutdown in most spaces to prevent smoke spread through ductwork.

**RA 9514 IRR Exception:** Mechanical smoke control systems (pressurized stairwells, smoke exhaust) may continue operating per the licensed Fire Safety Engineer's design.

**Typical Sequence:**
1. Fire alarm → solenoid valve releases HVAC damper actuators
2. All return air dampers close (prevent smoke recirculation)
3. Supply air dampers close or modulate to low flow (maintain slightly positive pressure in exit stairwells)
4. System remains in shutdown mode until manual reset by facilities or firefighters

**Philippine Buildings:** High-rise residential with mechanical pressurization of stairwells (common in Metro Manila) uses selective shutdown: fire floor return closes, supply continues to stairwell only.

---

### Door Holder and Lock Release

**Requirement:** Fire-rated doors equipped with magnetic or solenoid-operated door holders must release (unlock) on fire alarm per RA 9514 IRR Section 1006.3.5(a).

**Function:**
- Enables rapid egress through fire-rated doors without manual unlocking
- Critical for stairwell access doors, smoke barrier doors, and separated occupancy doors

**Safety Feature:** Doors revert to normal lock-and-latch operation immediately after power loss, preventing unauthorized access during normal operations.

**Example:** A 3-storey medical clinic with a fire-rated partition separating the pharmacy. Door holder releases on alarm → patients in main clinic can quickly move to alternate exit via pharmacy stairwell.

---

## Manual Pull Stations

**Purpose:** Allow any occupant to manually initiate alarm if automated detection fails (early fire detection, equipment malfunction).

### Placement Requirements (NFPA 72)

[SLATECAMP_UI_BLOCK:ui_0006 component="WikiCalloutBox" status="preserved"]
Extracted summary:
- Props: title="Manual Pull Station Design & Placement", variant="info"
- Text: **Location:** - Maximum 60 m (200 ft) travel distance from any occupiable space per NFPA 72 Section 17.14.2.2 - On each floor, typically located at primary exit (stairwell, main corridor) - Near exit doors to serve as occupant's "last action before evacuation" **Mounting Height:** 1.07–1.22 m (42–48 inches) from finished floor per NFPA 72 Section 17.15 (verify adoption in current RA 9514 IRR; consult Fire Safety Engineer for Philippine compliance confirmation) **Spacing on Large Floors:** - Offi
[/SLATECAMP_UI_BLOCK]

---

## Detector Placement: Practical Rules

### Ceiling Mounting Best Practices

[SLATECAMP_UI_BLOCK:ui_0007 component="Tip" status="preserved"]
Extracted summary:
- Props: (none)
- Text: In typical buildings with 2.7–3.0 m ceilings, ceiling-mounted detectors provide best coverage. When ceiling height exceeds 12.2 m (40 ft) and the space is open with minimal obstructions, wall-mounted detectors 0.3–0.6 m (1–2 ft) below the ceiling may be permitted; confirm with NFPA 72 Section 17.7.3 and the Fire Safety Engineer's design.
[/SLATECAMP_UI_BLOCK]

**Dead Spaces:** Areas behind suspended ceilings, above raised floors, or in attic spaces must have detectors if occupants access them. Confine detectors to underside of structural ceiling (not plenum side, which is unmanned) per NFPA 72 Section 17.7.1.1.

### Beam & Duct Obstruction

**Beam Pocket Rule (NFPA 72 Section 17.7.5.1):**
- If structural beams space >1.2 m (4 ft) apart and drop >10% of ceiling height, detectors must be placed in each beam pocket (space between beams)
- Reduces maximum center-to-center spacing from 9.1 m to ~5.8 m (64% of base) in affected pockets

**Example:** Office with 3.0 m ceiling and 1.5 m × 4.0 m beams spaced 6.0 m o.c. in two perpendicular directions.
- Beam drop = 0.3 m (10% of 3.0 m) → one detector per pocket required
- In each 6.0 m × 6.0 m bay: place 1–2 detectors depending on final layout review

### Kitchen Exclusions

[SLATECAMP_UI_BLOCK:ui_0008 component="Warn" status="preserved"]
Extracted summary:
- Props: (none)
- Text: Do NOT place smoke detectors in cooking zones (directly above stoves, grills, hood intakes). Use heat detectors instead (fixed-temp 68°C or rate-of-rise) per NFPA 72 Section 17.6.2.8. Smoke detectors in kitchens create nuisance alarms from normal cooking operations, leading to staff habituation ("alarm fatigue") and disabled detectors in the long term.
[/SLATECAMP_UI_BLOCK]

**Alternative for Open Kitchens:** Place photoelectric smoke detectors 1.5–3.0 m away from cooking appliances at 9.1 m spacing; ensure air flow (HVAC makeup air) does not carry cooking smoke directly to detectors.

[Remove embedded comment and revise preceding paragraph to state:] 'Place photoelectric smoke detectors away from cooking appliances at spacing per NFPA 72 Section 17.6.2.8; ensure air flow (HVAC makeup air) does not carry cooking smoke directly to detectors. Specific distance (1.5–3.0 m) is engineer interpretation; confirm with project Fire Safety Engineer and HVAC designer.'

---

## System Testing and Maintenance (RA 9514)

### Commissioning

**Requirement:** Before occupancy, all devices must be tested by a licensed Fire Protection Engineer per RA 9514 IRR Section 1006.3.9.

**Tests:**
1. **Device Function:** Activate each manual pull station, smoke detector (using aerosol test), and heat detector (using thermal test)
2. **Notification Verification:** Confirm all horns sound at specified SPL; strobes flash at 1 Hz
3. **System Logic:** Test zone circuits, alarm circuits, trouble circuits; verify FACP responds within 10 seconds
4. **Monitoring Connection:** Confirm test signal reaches central station; verify alarm transmission latency &lt;60 seconds

### Periodic Testing (RA 9514 Section 1006.3.9)

[SLATECAMP_UI_BLOCK:ui_0009 component="WikiExamTable" status="preserved"]
Extracted summary:
- Props: headers="{[\"Component\", \"Test Frequency\", \"Method\", \"Documentation\"]}", rows="{[[\"Manual pull stations\", \"Quarterly (every 3 months)\", \"Mechanical activation; verify FACP response\", \"Logbook at FACP\"], [\"Smoke/heat detectors\", \"Annually + post-maintenance\", \"Aerosol (smoke) or thermal test (heat); verify alarm latency &lt;10 sec\", \"Test certificate from service provider\"], [\"Notification appliances (horns/strobes)\", \"Annually\", \"Audible/visual confirmation; SPL meter check (sampling basis)\", \"Test report signed by technician\"], [\"FACP battery backup\", \"Monthly visual + annual load test\", \"Verify voltage, charger operation; drain test for 30 min at full alarm load\", \"Battery test log\"], [\"Central station connection\", \"Quarterly test signal\", \"FACP transmits supervised test signal; station logs receipt\", \"Confirmation from monitoring station\"], [\"Voice evacuation system\", \"Annually\", \"Activate microphone; play pre-recorded message; verify coverage\", \"Test certificate\"]]}"
- Text: (none detected)
[/SLATECAMP_UI_BLOCK]

**Maintenance Records:** RA 9514 requires all testing and maintenance records retained for ≥3 years, accessible to fire authority inspectors.

---

## Common Design Errors and Corrections

[SLATECAMP_UI_BLOCK:ui_0010 component="WikiMistakeList" status="unknown"]
Extracted summary:
- Props: mistakes=true, Spacing=true, smoke=true, detectors=true, m=true, apart=true, to=true, reduce=true, cost=true, NFPA=true, specifies=true, maximum=true
- Text: 21 m; adding expensive retrofit later", "Omitting fire alarm zones in mechanical rooms, electrical rooms; fire protection engineer finds non-compliance pre-occupancy", "Running fire alarm wiring in same conduit as power wiring; causes EMI nuisance alarms in addressable systems", "Not sizing backup battery for 24-hour standby; battery depletes during extended power outage", "Using ionization detectors instead of photoelectric in commercial spaces; higher false-alarm rate per RA 9514 preference"]}
[/SLATECAMP_UI_BLOCK]

---

## Worked Example: 6-Storey Office Building, Metro Manila

**Building Parameters:**
- 6 storeys (height ~21 m)
- Each floor: 800 m² open-plan office + 200 m² core (toilets, mechanical, storage)
- Occupant load: ~200 per floor (1,200 total)
- Stairwell: 1 pressurized stairwell (fire-rated doors with door holders)
- Kitchen: Small break room on floor 3 (2 m × 3 m)

**RA 9514 Applicability:**
- Height >21 m → mandatory fire alarm
- Occupant load per floor (200) < 500 and floor area (1,000 m²) ≤ 1,000 m² → borderline for occupancy group; most conservative interpretation requires alarm (>1,000 m² total or >4 storeys)

**System Design:**

1. **Fire Alarm Type:** Addressable system (flexibility for future tenants, easy diagnostics)

2. **Detection:**
   - **Smoke detectors (photoelectric):** ~8 per floor (open office @ 9.1 m spacing)
   - **Heat detector (fixed-temp 68°C):** 1 per floor in break room (non-cooking area); 0 in stove zone
   - **Manual pull stations:** 2 per floor (stairwell entry, opposite end of open office)

3. **Notification:**
   - Horns: 2 per floor (opposite ends; design for 85 dB SPL minimum)
   - Strobes: 1 per floor in common corridor
   - Voice evacuation: 1 system for building (microphone at security desk, loudspeakers in corridor + stairwell)

4. **FACP:** Intelligent addressable panel (2-loop capacity, 256 addresses per loop) with 24V battery backup
   - Standby: ~2 A (6 floors × ~0.3 A)
   - Alarm: ~8 A (all devices active)
   - Battery: 50 Ah minimum (24 h × 2 A + 5 min × 8 A = 48 + 0.67 ≈ 49 Ah)

5. **System Integration:**
   - Fire alarm → elevator recall to ground floor
   - Fire alarm → HVAC return dampers close, stairwell supply remains pressurized
   - Fire alarm → all stairwell door holders release

6. **Monitoring:** Central station connection via hardwired trunk line (UL-listed, 24/7 staffed monitoring station in Metro Manila)

7. **Maintenance Schedule (RA 9514):**
   - Monthly: Manual pull station visual check, FACP battery voltage
   - Quarterly: Test signal to central station
   - Annually: Smoke detector aerosol test (4 detectors sampled), heat detector thermal test, horn/strobe verification, voice evacuation walkthrough
   - Post-incident: Full system reset and inspection by licensed Fire Protection Engineer

**Estimated Cost Breakdown (2026 Philippines pricing):**
- FACP + batteries: ₱150,000
- Addressable detectors (48 total @ ₱2,500): ₱120,000
- Manual pull stations (12 @ ₱3,000): ₱36,000
- Notification devices: ₱80,000
- Voice evacuation system: ₱200,000
- Wiring, conduit, installation labor: ₱300,000
- **Total: ~₱886,000 (approximately USD 15,600 at 2026 rates)**

---

## Key Regulatory References

| Standard | Title | Philippine Adoption | Key Sections |
|----------|-------|-------------------|--------------|
| **RA 9514** | Fire Code of the Philippines | Mandatory, enforced by Bureau of Fire Protection (BFP) | Section 1006.3 (Fire Alarm Systems) |
| **RA 9514 IRR** | Implementing Rules & Regulations | Detailed thresholds and technical requirements | Table 1006.3.2 (Mandatory by occupancy/floor area); Section 1006.3.5 (Monitoring); 1006.3.9 (Testing) |
| **NFPA 72 (2022)** | National Fire Alarm and Signaling Code | Referenced normatively in RA 9514 IRR | Sections 10 (FACP), 17 (Detection & Signaling), 18 (Notification) |
| **NFPA 1 (2024)** | Fire Code | General fire protection framework; RA 9514 aligns with NFPA structure | Fire protection system hierarchy |
| **PD 1096** | National Building Code of the Philippines; RA 9514 aligns with IBC 2015 framework | Baseline code; RA 9514 provides fire-specific requirements | General egress, occupancy classification |

---

## Summary Checklist for Builders and Engineers

[SLATECAMP_UI_BLOCK:ui_0011 component="Callout" status="preserved"]
Extracted summary:
- Props: (none)
- Text: **Before System Design:** - ☐ Confirm building height, floor area, occupancy per RA 9514 Table 1006.3.2 - ☐ Engage licensed Fire Safety Engineer early (design development phase) - ☐ Determine if addressable or conventional system per fire code and floor geometry **During Design:** - ☐ Specify photoelectric smoke detectors (not ionization) per RA 9514 preference - ☐ Space detectors at 9.1 m maximum center-to-center (NFPA 72) - ☐ Include heat detector in kitchen break room; exclude smoke detector 
[/SLATECAMP_UI_BLOCK]

---

## Glossary

- **Addressable System:** Fire alarm system in which each device has unique address; FACP identifies exact device location upon activation
- **Analog-Addressable System:** Hybrid system; devices transmit analog signal values (smoke density, temperature) enabling trend analysis and early detection
- **Central Station:** 24/7 staffed monitoring facility (UL-listed in Philippines) that receives and logs fire alarm signals from buildings
- **Conventional System:** Zone-based fire alarm; activation indicates zone, not specific device
- **FACP (Fire Alarm Control Panel):** Intelligent "brain" of system; monitors devices, controls notification, interfaces with building systems
- **Ionization Detector:** Smoke detector using radioactive source; responds well to flaming fires
- **Photoelectric Detector:** Smoke detector using LED + photocell; responds well to smoldering fires; preferred per RA 9514
- **Rate-of-Rise Detector:** Heat detector responding to rapid temperature increase (°C/minute)
- **Strobe:** Visual notification appliance; flashes light (typically 1 Hz per NFPA 72)
- **Supervision:** System monitoring for open circuits, shorts, device faults; logged at FACP and central station

## Related Articles

See also within Fire Protection Systems: **lea-util-004-05-core-concept**, **lea-util-004-06-core-concept**, **lea-util-004-07-core-concept**, **lea-util-004-08-core-concept**.

> **Overview:** See **overview-building-utilities-mepf** for the full curriculum structure and study strategy. See **mastery-building-utilities-mepf** for connections across topics.


[SLATECAMP_UI_BLOCK:ui_e001 component="ExamTip" status="preserved"]
Extracted summary:
- Props: (none)
- Text: **ALE Exam Tip — Identify when fire alarm systems are mandatory per RA 9514 (:** Building Utilities carries the heaviest weight in Area B. Focus on code-specific values (PEC ampacities, Revised Plumbing Code fixture units, NFPA spacing requirements) and regulatory triggers (when is a fire alarm mandatory? when is seismic bracing required?). Practice load computations and system sizing problems which appear regularly on the exam.
[/SLATECAMP_UI_BLOCK]
