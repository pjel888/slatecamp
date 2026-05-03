## What You Need to Know for the LEA

Fire detection and alarm systems represent a critical layer of a building's communications infrastructure. While fire protection systems (covered in LEA-UTIL-004-04) address water suppression and passive safety, fire detection communicates hazard information across multiple building systems—from the alarm panel to occupants to emergency responders to automated building controls. This article examines fire detection through the communications lens: how detection signals propagate, how notifications are distributed, and how alarm information integrates with building management and emergency systems.

### Fire Alarm System Architecture

A fire alarm system functions as a real-time communications network. The core components form a signal pathway:

- _Initiating Devices_ (IDCs): detectors, manual pull stations, water flow switches. These are the "sensors" that generate alarm signals
- _Fire Alarm Control Panel_ (FACP): the central processing unit that receives signals, evaluates them against programming logic, and routes notifications
- _Notification Appliances_ (NACs): sirens, strobes, voice speakers that communicate the alarm state to building occupants
- _Signaling Line Circuits_ (SLCs): the communications pathways connecting detectors to the panel (in addressable systems)
- _Monitoring & Transmission Equipment_: devices that communicate alarm state to off-site central stations or the fire department

In the Philippine context, fire detection systems must comply with the Fire Code of the Philippines (RA 9514) and follow the signaling requirements of NFPA 72 National Fire Alarm Code for their circuit and protocol specifications.

<Callout type="info">The 220V/60Hz electrical standard in the Philippines affects fire alarm power supply sizing and standby battery calculations. Fire alarm systems must maintain minimum 24-hour standby plus 15-minute alarm duration per NFPA 72 Chapter 10 Section 10.6, requiring robust UPS and battery backup design.</Callout>

### Circuit Classes and Signaling Architecture

Fire alarm circuits are classified by their ability to survive a single fault (open, short, or loss of one device) while still communicating alarm information. This classification is fundamental to system reliability and is governed by NFPA 72.

**Class A Circuits** (_Survivable Loop Architecture_)

A Class A circuit forms a continuous loop from the FACP through all connected devices and back to the panel. The loop typically carries the signal in two directions simultaneously:

- Outgoing path: FACP → Device 1 → Device 2 → ... → Device N → Return to FACP
- Return path: Current flows the opposite direction around the loop

If any single point in the loop opens (a broken wire, disconnected device, or failed splice), the return path is still available. The system detects the fault but continues signaling alarm information. This configuration is used for critical circuits in high-reliability applications.

<WikiCalloutBox title="Loop Polarity in Class A SLC Circuits" variant="info">Class A SLC loops use bipolar signaling: the outgoing conductor and return conductor carry opposite polarity signals. If the outgoing wire opens, the loop detects this as a break; alarm signals continue through the return path. The control panel monitors the loop for opens and shorts and annunciates line trouble while maintaining alarm transmission capability. This is why Class A circuits cost more to install—extra copper, loop splitters, and diagnostic intelligence—but justify the cost in spaces where continuity is non-negotiable (stairwells, exits, occupancy centers).</WikiCalloutBox>

**Class B Circuits** (_Radial/Hub-and-Spoke_)

A Class B circuit radiates from the FACP to each connected device in a star pattern. There is no return loop; each device has a dedicated wire pair back to the panel. If one wire opens, only that device is lost from the network. However, a single open circuit disables all devices on that branch.

Class B circuits are used in lower-hazard occupancies or where the cost of loop infrastructure is not justified by the risk. They are simpler to troubleshoot (a break is localized) but offer lower fault tolerance.

**Class A vs. Class B in Philippine Buildings**

For high-occupancy buildings, hospitals, and critical infrastructure in the Philippines:
- _High-rise office towers_: typically use Class A for common areas, exits, and rooftops
- _Hotels and residential_: may use Class B in less critical areas (office suites, non-critical zones) combined with Class A in egress paths
- _Industrial facilities_: often use Class B with redundant panels or multiple system zones

The choice is driven by the Occupant Load and Life Safety category under RA 9514.

<WikiMistakeCard mistake="Assuming Class A and Class B refer to wire gauge or voltage rating" correction="Class A and Class B are circuit topology classifications in NFPA 72 that describe fault tolerance and signal propagation, not wire size. Both can use the same 14 AWG or 12 AWG copper, but Class A adds loop configuration, splice requirements, and panel diagnostics." />

### Signaling Protocols: Conventional vs. Addressable

**Conventional Systems**

In a conventional system, each IDC or group of detectors is wired to a zone terminal on the FACP. When a detector activates, the FACP receives a signal change on that zone input and displays "ZONE 3 ALARM" (for example). The system knows which zone is alarming but not which specific device within that zone.

Conventional systems use simple on/off signaling: an open circuit (trouble), a normal signal state, and an alarm signal state (typically a voltage change or current drop).

_Advantages_:
- Lower installed cost: fewer conductors to the panel
- Simple troubleshooting: an open circuit maps directly to a zone

_Disadvantages_:
- Poor granularity: "Zone 3" could cover 20 detectors in a floor; responders don't know which one activated
- Limited diagnostics: the system cannot poll each device for its status between alarms
- Fewer features: cannot typically support device-level testing, remote operation, or predictive maintenance

**Addressable Systems**

In an addressable system, each initiating device (detector, manual station, water flow switch) has a unique electronic address. The FACP polls each address periodically (typically every 2–4 seconds per NFPA 72 Chapter 23 Section 23.8.5), receiving status data: normal, alarm, trouble, or maintenance leart.

Addressable systems communicate over Signaling Line Circuits (SLCs). The most common protocol is the Notification Protocol (NP), a synchronous serial protocol, though modern systems increasingly use networked protocols (Ethernet, proprietary IP-based standards).

_Advantages_:
- High granularity: the panel displays "Detector 3B-West Hallway Alarm"
- Continuous diagnostics: each device reports status every few seconds; early warning of degradation
- Advanced features: zone reclassification, evacuation procedure changes, integration with voice systems
- Scalability: a single SLC can address hundreds of devices (depending on the protocol and load)

_Disadvantages_:
- Higher cost: more intelligence in devices and panel
- Complexity: network configuration, addressing, commissioning
- Vulnerability to programming errors: misconfigured addressable panels are the leading cause of non-functional fire alarm systems in the Philippines

<Note>Addressable detectors in the Philippines comply with NFPA 72 addressing requirements. A typical addressable loop supports 200–250 devices per SLC, depending on the panel manufacturer and protocol. Panel capacity is typically 4–8 SLCs, supporting 800–2000 addressable points per building. Water flow switches, duct detectors, and manual pull stations are each assigned unique addresses and respond to status polls independently of detector activation.</Note>

### Notification Appliance Circuits (NACs)

NACs are the communication path from the FACP to the devices that notify occupants: audible alarms (sirens, chimes), visible alarms (strobe lights), and voice messaging systems.

NACs are typically Class B (radial) circuits in smaller buildings but may be split into multiple Class B NACs or even Class A circuits in large buildings. Each NAC supplies power and signaling to connected appliances.

In the Philippines, audible alarm signals must meet RA 9514 sound pressure requirements:
- _Minimum 75 dB(A) in occupied spaces_ at distance of 3 meters per RA 9514 2019 Revised IRR Section 5.4.4
- _Minimum 85 dB(A) in mechanical equipment rooms_ per RA 9514 Section 5.4.4

Strobes (visual alarms) must comply with NFPA 72 Section 18.5.3, providing flash rates of 1–2 Hz in general areas and _1–2 Hz at exits and evacuation routes_. In the Philippines, strobes are mandatory in buildings over 24.5 meters height per RA 9514 Section 4.3.

<WikiCalloutBox title="NAC Load Calculations in 220V Philippine Buildings" variant="warning">Philippine fire alarm systems operate on a nominal 220V single-phase supply (some systems use 110V or 48V DC backup). NAC load calculations must account for peak demand: if the FACP supplies multiple NAC circuits and a Mass Notification System simultaneously, the total current demand can exceed the circuit capacity. A typical NAC branch in a 50-person occupancy space (say, one floor of an office building) draws 2–4 amps at alarm condition. A 16-amp FACP power supply can support 2–3 NAC circuits at full activation; beyond that, a dedicated UPS or power expansion module is required. This is a common failure point in Philippine installations where building additions increase alarm appliance load without upgrading the power supply.</WikiCalloutBox>

### Mass Notification Systems (MNS) and Voice Evacuation

A Mass Notification System integrates fire alarm signaling with voice announcement capability. When an alarm is triggered, the FACP can route the alarm signal to a voice synthesizer or recorded message player, which then outputs an evacuation message to the building's PA system (or dedicated speaker network).

In the Philippines, voice evacuation systems used for fire emergency notifications must comply with:
- NFPA 72 Section 24 (Emergency Voice/Alarm Communications) for signal routing and speaker selection
- RA 9514 Section 5.4.5 for intelligibility: message clarity sufficient for occupants to understand evacuation instructions in noise levels up to 80 dB(A)

**Integration Points**:

1. _FACP to Voice Control Panel_: The FACP sends an alarm signal to a voice processor. This may be a dedicated hardware device (e.g., a voice evacuation module) or integrated into an IP-based fire alarm control unit.

2. _Zone Selection Logic_: The voice system can be programmed to announce evacuation instructions to a specific zone (the alarming zone plus adjacent or designated egress zones) or to the entire building. Typical programming in the Philippines:
   - If alarm in floors 5–8: announce to floors 3–10 (the involved floor plus one above and below)
   - If alarm in lobby or core: announce to all floors
   - If low-level leart (smoke detection, pre-alarm): no voice annunciation; audible alarm only

3. _Message Sequencing_: The voice system queues messages:
   - "Attention. Fire alarm. Please proceed to the nearest exit."
   - "This is a test. Do not evacuate." (for non-alarm conditions)
   - "Return to your work areas. The fire alarm has been reset." (all-clear)

4. _Speaker Selection_: The FACP or voice processor enables only speakers in the targeted zones, reducing confusion and allowing targeted instructions ("Use the west stairwell" in a zone where the east stairwell is blocked).

<Example type="scenario">A hotel in Metro Manila has a fire detection alarm triggered on the 12th floor. The FACP identifies the detector address (12-F-201, west corridor). The voice processor is programmed to:
- Announce evacuation to floors 10–14 and the ground floor (evacuation assembly point)
- Hold all elevators at the ground floor and disable them per elevator recall logic
- Play a recorded message: "Attention. Building fire alarm. Please leave the building immediately using the stairs. Do not use the elevators."
- Repeat the message every 30 seconds until the alarm is reset

Meanwhile, a parallel communication to the local fire department is sent via the central station monitoring service. The FACP logs the event (address, time, duration) for post-incident review.</Example>

### Circuit Wiring and Fire-Rated Cable Requirements

Fire alarm wiring must remain functional even when other building systems are damaged by fire. This requires:

**Cable Rating**: Fire alarm circuits must use cables rated for a minimum of _2-hour fire rating per NFPA 72 Section 12.3.8_. In the Philippines, this is typically achieved with:
- _FPL-approved cable_ (Fire alarm Power Limited): insulation that resists flame and does not propagate smoke
- _Or wrapped in 1-inch diameter mineral-insulated cable_ (MI cable)

Common cable types in Philippine installations:
- _Shielded twisted pair (STP)_ for SLC circuits to reduce EMI in noisy environments
- _Unshielded twisted pair (UTP)_ for shorter NAC runs where EMI is not a concern
- _Stranded 14 AWG or 12 AWG copper_ conductors (NFPA 72 permits stranded or solid; stranded is preferred for flexibility during installation)

**Conduit Separation**: Fire alarm wiring must be separated from power wiring to prevent cross-contaminationNFPA 72 Section 12.3.2.5 requires minimum 2 inches (50 mm) horizontal separationn_ from building power conduit
- _Or enclosed in rigid metal conduit (RMC)_ if run in the same raceway as power wiring
- _No fire alarm cable in the same conduit as 220V power supply wiring_ for the FACP itself

In tight spaces (building cores, elevator shafts), the 2-inch clearance is often impossible; in these cases, both the fire alarm cable and power cable are enclosed in metal conduit to provide equivleant protection.

**Grounding and Bonding**: Fire alarm circuits operate at power-limited voltages (typically 24V DC for battery backup, 120V AC for main supply). Grounding must follow NFPA 72 Section 12.2.2:
- _Single point grounding at the FACP_: all equipment (panel, batteries, voice modules) bonds to a common ground
- _No daisy-chaining ground connections_ along the circuit: this can create ground loops and noise

<Warn>A common installation error in Philippine buildings: connecting fire alarm system ground to a different point than the building's main electrical ground. This creates a ground potential difference and causes false alarms or loss of signal on SLC circuits. Fire alarm grounding must connect at the FACP's main ground, which is bonded to the building's main service entrance per electrical code (PEC).</Warn>

### Central Station Monitoring and Emergency Communication

Fire alarm signals must be communicated to someone who can respond. NFPA 72 recognizes three monitoring methods:

1. _Central Station Monitoring_: A licensed monitoring service (e.g., a security company with NFPA 72 certification) receives alarm signals and dispatch signals to emergency responders. In the Philippines, central stations are regulated by the Bureau of Fire Protection (BFP) and must hold a permit.

2. _Proprietary Monitoring_: The building owner operates its own monitoring center (typically for large campuses or industrial sites). Rare in the Philippines for individual buildings; usually reserved for government facilities or large corporations with 24/7 security centers.

3. _Remote Station Monitoring_: The FACP is connected directly to the local fire department's dispatch center via a dedicated telephone line (rarely used in the Philippines due to infrastructure limitations; most rely on central stations instead).

**Transmission Protocol**: The alarm signal must be transmitted within specific timeframes per NFPA 72 Section 26.6.3of alarm at the FACP
- _Acknowledgment of receipt within 60 seconds_
- _Retransmission if no acknowledgment_ within 90 seconds

In the Philippines, this is typically achieved via:
- _SIA (Subscriber Interface Adapter)_ for analog telephone lines: converts alarm data to tones that dial the central station
- _Ethernet gateway_: sends alarm data to the central station via broadband (increasingly common in urban areas)
- _Radio transmission_: cell-based or private radio network (less common; reliability concerns)

<Note>A building's alarm signal may reach the fire department through multiple paths:
1. The FACP sends the alarm to a central monitoring station (via SIA or Ethernet).
2. The central station verifies the alarm by calling the building's hotline to speak with an occupant or security guard.
3. The central station dispatches the BFP (Bureau of Fire Protection) or Philippine National Police (PNP) if the alarm is confirmed.
The entire process typically takes 3–5 minutes from initial alarm to fire truck dispatch, depending on central station responsiveness and building security staffing.</Note>

### Integration with Building Management Systems (BMS) and Automated Controls

Modern buildings integrate fire alarm signals with HVAC, elevators, and access control systems to support rapid response:

**Elevator Recall**: When a fire alarm activates, the FACP sends a signal (hardwired or via BMS network) to the elevator controller, commanding all elevators to:
1. Stop at the nearest floor and open doors (to clear occupants)
2. Park all cars at the ground floor and disable them
3. Prevent new calls from landing on the system

This is required by RA 9514 Section 3.2.1 and the electrical code (PEC).

**HVAC Shutdown**: Smoke dampers in HVAC systems close automatically; the FACP may also signal the BMS to:
1. Shut down air handling units (to stop smoke spread)
2. Close outdoor air intakes (to prevent outside smoke entering)
3. Set pressurization systems to maintain positive pressure in exit corridors

**Access Control Door Release**: The FACP can command the building's access control system to:
1. Unlock all security doors to allow rapid egress
2. Unlock exterior doors to allow fire apparatus access
3. Log all door releases for post-incident investigation

These integrations are wired or networked (Ethernet) between the FACP and BMS. The BMS must acknowledge receipt of the command and report its status (e.g., "Elevator successfully recalled," "Smoke damper closed") back to the FACP for logging.

<Example type="scenario">A 15-story office building in Makati has a fire alarm on the 8th floor. The FACP:
1. Activates the NAC alarm (sirens and strobes on floors 7–10)
2. Routes voice evacuation to announce on floors 7–10
3. Sends elevator recall command; all 4 elevators return to lobby within 45 seconds
4. Signals BMS to shut HVAC AHUs and close smoke dampers
5. Unlocks all interior doors on all floors (access card readers disabled for egress)
6. Transmits alarm to central station: "Building ID 1234, Floor 8, Detector 8-F-201, Time 14:35"
7. Logs all events with 1-second timestamps for fire department review

The entire sequence is automatic and takes place in ~2 seconds. The FACP then holds the alarm state until a security officer or fire marshal manually resets it.</Example>

### Wiring Strategies in Dense Urban Buildings

Philippine high-rise buildings in Manila, Cebu, and other urban centers present unique wiring challenges:

**Vertical Distribution**: Fire alarm risers typically run in the building core (often the same shaft as electrical and data risers). The riser is divided into floor-level branches. Each floor typically has:
- One or two SLC circuits (addressing 100–150 devices each)
- One or two NAC circuits (addressing 10–20 alarm appliances each)
- Manual pull stations at each exit

The riser uses conduit (typically 1¼-inch or 1½-inch), and each floor's branch drops to the device locations. In earthquake-prone areas (the entire Philippines sits on the Pacific Ring of Fire), the riser is secured with flexible conduit couplings to allow building sway without breaking the conductor terminations.

**Horizontal Distribution**: Within each floor, circuits are routed through hollow metal studs (in partition walls), under raised floors (data center environments), or in overhead cable trays. Separation from power is maintained by using opposite sides of walls or enclosing fire alarm cable in metal conduit if run near electrical panel feeders.

**Sprinkler Water Flow Switches**: In buildings with wet or dry sprinkler systems, water flow switches are integrated into the fire alarm network. Each zone of the sprinkler system has a single water flow switch connected to the FACP as a dedicated initiating device (IDC). When water flows (indicating sprinkler activation), the switch sends an alarm signal to the FACP, which coordinates sprinkler activation with fire alarm notification. In the Philippines, the sprinkler system and fire alarm system must be coordinated per RA 9514 Section 2.3.2.

### Emergency Responder Communications

**Firefighter Telephone Systems**: High-rise buildings (over 30 meters per RA 9514) must provide dedicated telephone lines accessible to firefighters at:
- Each floor lobby
- Exit stairwell landings (typically every 5–10 floors)
- The building's fire command center (if present)

These phones are connected to the building's main telephone system and to the local fire department via the FACP's monitoring pathway. They provide a direct communication channel during the fire response and are typically housed in red phone boxes.

**Two-Way Radio Coverage**: Buildings over 24.5 meters (RA 9514 Section 4.2) must provide radio coverage for fire department communication. This is achieved via:
- Distributed antenna systems (DAS): copper cable with small antennas in each floor corridor to amplify firefighter radios
- Or, if DAS is not present, the FACP annunciator panel must be installed in the fire command center with a direct phone line to the fire department dispatch center

Radio wiring is separate from fire alarm wiring (different frequency, different grounding practices).

---

## Design Considerations and Best Practices

**1. Redundancy for Critical Facilities**

Buildings housing critical functions (hospitals, data centers, government offices) in the Philippines may require:
- Dual fire alarm panels (cross-connected) so that loss of one panel does not disable fire detection
- Separate SLC circuits for each floor (rather than looping multiple floors on one circuit)
- Automatic switchover: if the primary panel fails, the secondary automatically assumes control

This is not required by code but is a best practice in high-security or high-availability environments.

**2. Battery Backup Sizing**

Philippine fire alarm systems must operate on 24V DC backup battery for a minimum of:
- 24 hours (standby, no alarm)
- Plus 15 minutes at full alarm load (all sirens, strobes, voice, SLC polling active)

Per NFPA 72 Chapter 10 Section 10.6, backup power calculation is:
_Total Amp-Hours = (Standby Load [Amps] × 24 [hours]) + (Alarm Load [Amps] × 0.25 [hours])_

Example: A mid-size office building in Quezon City has:
- Standby load: 0.5 A (FACP + SLC circuits + monitoring equipment)
- Alarm load: 2.0 A (all NAC appliances active)
- Required battery: (0.5 × 24) + (2.0 × 0.25) = 12 + 0.5 = 12.5 amp-hours
- Recommended: 12.5 × 1.25 (safety factor) = 15.6 amp-hours → specify 20 Ah battery

<Tip>Use the 1.25 safety factor to account for battery aging (capacity degrades ~5% per year) and temperature effects (220V tropical climates like the Philippines reduce effective capacity by ~10% in hot dry seasons). A 20 Ah battery provides adequate margin for a 3–5 year service life before replacement.</Tip>

**3. Testing and Maintenance**

Fire alarm systems in the Philippines are typically tested:
- Monthly: manual pull station activation and detector sensitivity check (smoke detector testing per NFPA 72 Section 17.7)
- Semi-annually: central station transmission and voice evacuation message clarity
- Annually: complete system walk-through with fire department participation

Testing logs must be maintained per RA 9514 Section 8.1.4 and provided to the Bureau of Fire Protection on demand.

**4. Integration with Emergency Operations Center (EOC)**

Large buildings may have a fire command center or emergency operations center. The FACP annunciator must be installed there with:
- Hardwired connection to the main panel (no wireless links, per NFPA 72)
- Status indicators for all SLC loops, NAC circuits, and monitoring path
- Manual override buttons for NAC silence and all-clear signaling
- Direct telephone line to central station and fire department (usually integrated into the building's PBX system)

---

## Common Installation Defects in Philippine Buildings

<WikiMistakeList mistakes={["Connecting fire alarm ground to a different point than main service entrance ground (causes ground loops and false alarms)", "Using non-approved cable (standard UTP instead of FPL-rated) in fire alarm riser—fails during fire and loses signal", "Running fire alarm SLC in the same conduit as 220V building power without adequate separation—EMI causes detector polling failures", "Oversizing NAC loads without upgrading FACP power supply—appliances operate at reduced output voltage and fail to generate adequate alarm signal", "Installing voice evacuation without floor-level zone programming—entire building receives the same message regardless of fire location, causing confusion", "Locating manual pull stations without clear signage or accessibility—occupants cannot find them during evacuation stress", "Failing to test water flow switches annually—switch corrosion or blocked orifice prevents sprinkler alarm transmission"]} />

---

## Philippine Regulatory References

- _RA 9514 (Fire Code of the Philippines)_: Sections 2.3 (fire detection and alarm systems), 4.2–4.3 (high-rise requirements), 5.4 (alarm signal requirements)
- _PEC (Philippine Electrical Code)_: Section 7.2 (fire alarm power supply and grounding)
- _NFPA 72 (National Fire Alarm Code)_: Sections 6 (initiating devices), 12 (circuits and equipment), 18 (notification appliances), 24 (voice emergency communications), 26 (emergency warning systems)
- _BFP (Bureau of Fire Protection) Inspection Standards_: Annual inspection and testing protocols for commercial occupancies

---

## Summary

Fire detection and alarm systems are communications networks that detect hazards and broadcast safety-critical information to occupants, responders, and building systems. In the Philippine context, system design must account for 220V/60Hz power, RA 9514 occupancy classifications, and NFPA 72 signaling standards. The choice between conventional and addressable architectures, Class A vs. Class B circuits, centralized or distributed voice evacuation, and single or redundant monitoring paths all depends on the building's risk profile and life safety obligations. Proper wiring, grounding, and integration with building management systems ensure that fire alarm signals reliably reach the people and systems that respond.