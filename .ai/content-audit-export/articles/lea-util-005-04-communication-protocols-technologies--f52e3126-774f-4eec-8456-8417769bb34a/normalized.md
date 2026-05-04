## What You Need to Know for the LEA

## Learning Goal

Design security and access control systems — card readers, biometric readers, intercoms, door controllers, magnetic locks — and apply Philippine data privacy considerations (RA 10173) and industry standards for integrated building security infrastructure.
## Communication Protocols & Technologies

### Wiegand Protocol

[SLATECAMP_UI_BLOCK:ui_0001 component="ArticleMedia" status="preserved"]
Extracted summary:
- Props: id="media-lea-util-005-04-communication-protocols-", type="image", caption="Building Automation System Architecture — BACnet, Modbus, MQTT Protocol Layers", description="Three-tier BMS architecture diagram: Field level (sensors, actuators, VFDs) using Modbus RTU/RS-485 up to 1200m; Automation level (controllers, gateways) using BACnet/IP on building LAN; Management level (BMS server, dashboards, analytics) using MQTT for IoT data. Protocol data rates, topology, and typical Philippine building applications (HVAC control, lighting, metering, access control) shown per ASHRAE BACnet standards.", suggestedAsset="Diagram or reference image", status="placeholder"
- Text: (none detected)
[/SLATECAMP_UI_BLOCK]


Wiegand is a legacy, open-source protocol operating at DC levels (0–24V) over two signal wires, originally specified by HID for proximity card readers. The protocol transmits data as differential pulses: a logic "1" is a 20 µs pulse on the data line, while logic "0" is a 20 µs pulse on the clock line[1]. Maximum cable run without repeater is typically 500 feet (approximately 150 m) for twisted-pair Category 3 or better per HID specifications[2].

_Protocol structure_: 26-bit standard format (1 even parity bit, 8-bit facility code, 16-bit card data, 1 odd parity bit) transmits at 100 bits per second[3]. Proximity cards operating at 125 kHz (ISO/IEC 14223) are read passively; no power is required on the card.

_Integration constraint_: Wiegand readers cannot natively send door lock status or request-to-exit (REX) signals back to the controller. Auxiliary relay modules are needed for bidirectional communication, increasing panel dependency.

### Open Supervised Device Protocol (OSDP)

OSDP (IEC 60839-11-5) is a secured, bidirectional protocol developed by the Security Industry Association (SIA) specifically for access control devices[4]. It operates over RS-485 (half-duplex serial, up to 1200 m with Category 5 cable)[5] or IP networks and provides:

- Encrypted command/response between reader and controller
- Real-time door lock status, tamper learts, and power failure reporting
- Secure credential transmission (no open-text card number broadcast)
- Support for biometric enrollments and card-specific permissions[6]

_Data rate_: 9,600–115,200 bps. Typical polling interval is 200–500 ms per reader[7]. OSDP is adopted by major reader manufacturers (HID, Salto, Honeywell) and is increasingly mandated in enterprise deployments[8].

### TCP/IP-Based Access Control

Cloud and on-premises IP-based systems (e.g., Salto, Genetec, Lenel) transmit credential verification and lock commands over standard Ethernet. Benefits include:

- Centralized management across multiple buildings and sites
- Real-time event logging and audit trails
- Remote door unlock capability (with encrypted authentication)
- Scalability without distance limitations of serial protocols[9]

_Network infrastructure_: Access control typically shares building LAN on a dedicated VLAN (Virtual LAN) with QoS prioritization. Reader power-over-Ethernet (PoE) simplifies installation; 802.3af supplies 15.4W per port, sufficient for most readers with integrated electric strike locks[10].

_Security concern_: IP-based systems require strong cybersecurity controls—firewalls, intrusion detection, and regular patching—to prevent unauthorized door unlock commands[11].

## Credential Technologies

### Proximity Cards (125 kHz)

Proximity cards (ISO/IEC 14223-1) operate at 125 kHz frequency and are read from 5–50 cm distance[12]. The card contains a read-only coil and chip; data is transmitted passively when the reader's field energizes the coil.

_Capacity_: 26–40-bit card number and facility code. No encryption; card number is broadcast unencrypted, making cloning possible with commodity readers[13].

_Application_: Entry-level office buildings, condominium lobbies, and parking access in the Philippines use proximity cards for cost-effectiveness (~₱50–120 per card)[14].

### Smart Cards (13.56 MHz, ISO/IEC 14443)

Smart cards (Type A and B) operate at 13.56 MHz and read from 1–10 cm distance[15]. The card contains a microprocessor and encrypted memory; credentials are verified on-card before transmission.

_Key advantage_: Mutual authentication between card and reader reduces cloning risk. Multi-application capability allows one card for access, employee ID, and cafeteria payment[16].

_Data rate_: 106–848 kbps. Encryption standard is 128-bit AES or 256-bit AES depending on issuer[17].

_Application_: Enterprise offices, hospitals, and high-security facilities in the Philippines mandate smart cards for staff and contractor badges.

### Mobile Credentials (BLE & NFC)

Bluetooth Low Energy (BLE) and Near-Field Communication (NFC) allow smartphones to store encrypted access credentials. BLE operates at 2.4 GHz with range of 10–100 m depending on transmit power (Class 2 typical)[18]; NFC operates at 13.56 MHz with 1–10 cm read range[19].

_Deployment_: Salto, HID Mobile Access, and Genetec Cardaxo enable mobile credentials on iOS and Android platforms. Users receive encrypted push notifications to unlock doors, reducing physical card dependency[20].

_Security model_: Tokens are revocable in real-time if phone is reported lost or employee is terminated.

_Limitation_: BLE readers require battery maintenance (2–5-year life), and some buildings' RF shielding (metal-reinforced facades, basement parking) degrades BLE signal[21].

## Biometric Systems

### Fingerprint Recognition

Fingerprint readers (optical or capacitive) enroll 8–10 finger templates and store them locally or in a centralized database. False rejection rate (FRR) is typically 2–5%; false acceptance rate (FAR) is typically 0.01–0.1% at industry-standard security levels[22].

_Integration_: Readers connect to controllers via OSDP or IP; biometric template does not leave the reader or server, only an enrollment ID is transmitted for access decision[23].

_Application_: High-security server rooms, research labs, and banks in the Philippines deploy fingerprint readers for staff access.

### Facial Recognition

Modern AI-driven facial recognition (e.g., NEC NeoFace, Daon, SenseTime) achieves ~99% accuracy under controlled lighting and frontal orientation[24]. Systems enroll a photo or video clip and compare live frames captured at entry.

_False acceptance rate (FAR)_: 0.08% at NIST FRVT benchmark (2023)[25]. False rejection rate: 0.5–2% depending on lighting and mask usage[26].

_Privacy concern_: Facial recognition systems require explicit consent under NIST Privacy Framework and Philippine Data Privacy Act of 2012[27]. Many enterprise deployments in the Philippines are limited to executive areas or data centers due to employee privacy concerns[28].

_Integration_: Facial recognition readers output a "match" signal and user ID to the access control panel; the panel then sends a lock release command based on access rights database[29].

### Iris Scanning

Iris recognition (e.g., Iris ID, Thleas) achieves FAR of 0.00008% and FRR of 0.2–2% due to uniqueness of iris patterns[30]. Enrollment distance is 25–35 cm and recognition is sub-second[31].

_Application_: Limited to ultra-high-security facilities (national labs, defense installations, executive VIP suites) in the Philippines due to cost (₱80,000–150,000 per reader) and user enrollment time[32].

_Throughput_: Iris readers process one person per 2–3 seconds, unsuitable for high-volume public entrances like mall lobbies[33].

## Access Control Architecture

### Controller & Reader Integration

[SLATECAMP_UI_BLOCK:ui_0002 component="ArticleMedia" status="preserved"]
Extracted summary:
- Props: id="media-lea-util-005-04-communication-protocols-", type="image", caption="Access Control System — Card Reader, Controller, Electric Lock Integration", description="Network diagram of access control system components: credential readers (proximity, smart card, biometric) connected via OSDP (RS-485, up to 1200m) or IP/Ethernet to door controllers, which command electric locks (maglocks or electric strikes, 12/24VDC). Fire alarm integration showing hardwired relay for emergency door unlock per PD 1096. REX (request-to-exit) motion sensors, elevator floor access control, and visitor management system integration shown.", suggestedAsset="Diagram or reference image", status="placeholder"
- Text: (none detected)
[/SLATECAMP_UI_BLOCK]


A typical access control system consists of:

1. _Readers_: Capture credential (card swipe, biometric scan, or mobile tap)
2. _Controllers_: Receive reader input, query access rights database, send lock release command
3. _Electric locks_: Solenoid or motor locks (24V DC or 12V DC, 0.5–2A)[34] energized for 3–5 seconds by the controller
4. _Request-to-exit (REX) devices_: Motion sensors or push buttons that unlock doors from inside for egress[35]

_Electrical supply_: In the Philippines, a 220V AC to 24V DC power supply with UPS battery backup (4–8-hour runtime) is installed in the building's electrical room. Access control panels are UPS-backed to ensure egress functionality during power loss[36].

_Panel topology_:

- _Standalone panel_: Single controller managing up to 16–32 doors (e.g., Salto, HID Command Center)
- _Multi-door system_: Multiple controllers linked via RS-485 or IP network, managed by a central server
- _Cloud system_: All credential decisions made by cloud server; local readers cache credentials for offline failsafe[37]

### Request-to-Exit (REX)

REX devices allow occupants to exit without credential presentation, satisfying PD 1096 emergency egress requirements[38]. REX can be:

1. _Push button_: Green button inside secured area unlocks door for 3–5 seconds[39]
2. _Motion sensor_: Infrared motion detector triggers unlock if motion is detected 1–2 m from door (prevents tailgating)[40]
3. _Door contact switch_: Pressure release on door itself triggers exit unlock (e.g., panic bar on fire exit)[41]

_Fail-safe design_: On power loss or controller failure, REX must unlock doors immediately to allow evacuation (defined in PD 1096 Art. 1207)[42].

### Fire Alarm Integration

When fire alarm system triggers, all access control doors on the evacuation path must unlock automatically. This integration is hardwired or via networked signal:

- _Hardwired relay_: Fire alarm panel relay output is wired directly to access control door solenoid, bypassing the controller
- _Network signal_: Fire alarm panel sends NFPA 72 (National Fire Alarm Code) message to access control system commanding all doors to unlock[43]

_Timing requirement_: Door must unlock immediately on fire alarm per RA 9514 integration with PD 1096 egress paths.44].

### Elevator Access Control

High-rise buildings in the Philippines integrate access control with elevator systems to restrict floor access:

1. _Elevator reader_: Cardholder swipes inside elevator; reader transmits card number to main access control panel
2. _Floor mapping_: Panel queries access rights database and sends signal to elevator controller enabling only allowed floor buttons[45]
3. _Emergency override_: Fire alarm or manual override disables floor restrictions, allowing elevator to serve all floors during evacuation[46]

## Visitor Management & Temporary Credentials

Visitor management systems (e.g., Honeywell Authorized, Genetec Clearance, Salto Visitor) issue temporary credentials (printed badges, digital cards, or mobile passes) valid for a set date/time window. Data captured during check-in includes:

- Visitor name, ID type (passport, driver's license), contact
- Host employee name and department
- Date/time of visit and access areas permitted[47]

_Credential format_: Temporary cards are either

- Proximity cards printed on-site with temporary facility code and expiry
- QR codes printed on badges, scanned by QR-enabled readers[48]
- Mobile credentials pushed to visitor's phone via app[49]

__Audit requirement_: ISO 27001 recommends access logs retention; Philippine buildings follow BFP/PD 1096 inspection records as required.50].

## Parking Access & Revenue Control Systems (PARCS)

Parking systems use integrated credential reading, parking space detection, and payment collection:

1. _Entry reader_: Card or proximity tag read; barrier arm raises if cardholder has valid parking rights
2. _Occupancy sensor_: Magnetic or ultrasonic sensor detects vacant spaces; LED or mobile app displays availability
3. _Exit reader_: Car scanned again; fee calculated (if pay-per-hour) or access validated against subscription[51]

_Communication_: Readers and sensors communicate to central PARCS server via OSDP, RS-485, or IP Ethernet. Typical bandwidth per parking lot is 1–2 Mbps[52].

_Integration_: Monthly access control and parking data are uploaded to BMS for energy and occupancy optimization[53].

## Cabling Infrastructure

### Structured Cabling for Access Control

Recommended cabling standards:

| Parameter | Specification | Source |
|-----------|---------------|--------|
| Reader/Lock cabling | Category 5e minimum (for PoE readers) or Category 3 (Wiegand, RS-485) | ISO/IEC 11801[51] |
| Maximum run (Wiegand) | 500 feet (~150 m) (twisted pair, no repeater) | HID Wiegand Protocol[2] |
| Maximum run (OSDP/RS-485) | 1,200 m at 9,600 bps | Belden/Siemon Cabling Guide[5] |
| Maximum run (IP/Ethernet) | 100 m per segment; Fiber optic for longer distances | ISO/IEC 11801 Amendment 2[54] |
| Power delivery (PoE) | 802.3af (15.4 W per port); 802.3at (30 W) for powered locks[10] | IEEE 802.3[10] |
| Fire rating | Non-plenum cable in conduit; plenum-rated cable above false ceiling | NEC Article 300, PD 1096[55] |

### Typical Cable Runs

In a 20-story Philippine office tower with 80 door readers:

- _Vertical backbone_: Single fiber-optic or bundle of Category 6 cables in cable tray on each floor, routed from access control room (typically basement or ground level)[56]
- _Horizontal runs_: Category 5e cables in conduit or cable tray from elevator lobby distribution panel to each door (typical 50–100 m run per floor)[57]
- _PoE injection_: Managed PoE switches in equipment room supply power and data to readers; UPS-backed supply ensures 4–8 hours offline operation[58]
- _Redundancy_: Dual pathways for critical access points (building entrance, executive floors) to prevent single-point failure[59]

_Conduit sizing_: Typical conduit is 1.5"–2" PVC or steel, housing 2–4 Category 5e cables and 2–4 power pairs (16 AWG)[60].

## IP-Based vs. Legacy Panel-Based Systems

| Aspect | Legacy Panel (Wiegand/RS-485) | IP-Based (TCP/IP) |
|--------|------|------|
| _Credential decision_ | Local panel processor (standalone) | Centralized server or cloud |
| _Real-time reporting_ | Periodic polling (1–10 s latency) | Event-driven (< 1 s latency) |
| _Scalability_ | Limited to 16–64 doors per controller | Thousands of doors across multiple sites |
| _Failsafe offline capability_ | Panel caches recent credentials locally | Server caches full database on readers; local cache allows offline operation[61] |
| _Cybersecurity risk_ | Proprietary protocols, less visible attack surface | Standard IP attack surface; requires rigorous network controls[62] |
| _Installation cost_ | Lower per-door cost; simple wiring | Higher upfront; complex network setup |
| _Operational cost_ | Higher ongoing; manual credential updates | Lower ongoing; automated provisioning, analytics[63] |

## Integration with Building Management Systems

Access control data feeds into the BMS for:

1. _Occupancy tracking_: Number of people in building/floor used for HVAC scheduling and energy optimization[64]
2. _Parking occupancy_: Feeds to variable message sign (VMS) to direct drivers to available spaces[65]
3. _Elevator scheduling_: BMS requests elevator system to pre-stage cars on high-traffic floors during shift change[66]
4. _Emergency dispatch_: Fire alarm system retrieves occupancy and access logs to assist firefighters in locating occupants[67]

_Data transmission_: Access logs (timestamp, cardholder ID, door, result) are pushed to BMS via MQTT (message queue) or REST API every 5–15 minutes[68].

## Philippine Context & Compliance

### PD 1096 Requirements

PDPD 1096 (National Building Code) mandates compliance with fire safety egress requirements per RA 9514 (Fire Code) integration; doors on egress path unlock on fire alarm (Rule IV Sec 1007, 2004 IRR)1)[42]
- _Electrical safety_: Power supply for access control (220V AC to 24V DC) must have automatic transfer switch to UPS battery if mains fails[69]
- _Inspectorate compliance_: All access control systems must pass Bureau of Fire Safety (BFP) inspection; testing records retained[70]

### Philippine Condominium Access Control

Residential condominiums in Metro Manila and Cebu typically use:

- _Lobby level_: Proximity card readers at main entrance and parking level (~125 kHz); guard station with local panel
- _Unit-level_: Smart card or keypad at unit doors (optional); some use BLE mobile credentials via development's app[71]
- _Guest management_: Temporary cards printed at concierge valid for 24 hours; logged in building access database[72]

_Security breaches_: Industry reports indicate 60–80% of condominium access incidents involve cloned proximity cards or defeated REX sensors[73].

### Office Building Lobby Security

Philippine office towers (BGC, Makati CBD) employ:

- _Multi-reader strategy_: Proximity card reader at ground-floor public entrance; smart card or biometric reader at tenant floor elevators
- _Visitor management_: App-based check-in (e.g., via Guard, Salto Visitor) capturing visitor details; temporary QR code or mobile badge issued[74]
- _Integration_: Building BMS aggregates tenant access logs for monthly reporting; tenants billed for card issuance and reader maintenance[75]

### Mall Access Control

Philippine shopping malls (SMC, Ayala, Robinsons) typically restrict back-of-house (storage, offices, mechanical) areas with:

- _Service entrance readers_: Proximity or smart card readers limiting delivery driver access to loading dock during scheduled delivery windows[76]
- _Staff area readers_: Fingerprint or smart card readers at employee break rooms, counting rooms (cash handling)[77]
- _Emergency protocols_: All access doors unlock on fire alarm; manual override at security office allows isolation of fire-affected zones[78]

## Summary for System Designers

Security and access control systems integrate multiple communication protocols (Wiegand legacy, OSDP modern, IP-based cloud), credential technologies (proximity, smart card, biometric, mobile), and building systems (fire alarm, elevator, BMS). In the Philippines, compliance with PD 1096 emergency egress, 220V/60Hz electrical safety, and BFP inspection requirements is mandatory. Structured cabling following ISO/IEC 11801, OSDP protocol adoption for modern systems, and real-time fire/elevator integration ensure life safety and operational efficiency in residential, office, and commercial buildings.

---

[SLATECAMP_UI_BLOCK:ui_0003 component="KeyValues" status="preserved"]
Extracted summary:
- Props: (none)
- Text: (none detected)
[/SLATECAMP_UI_BLOCK]

[SLATECAMP_UI_BLOCK:ui_0004 component="ExamTip" status="preserved"]
Extracted summary:
- Props: (none)
- Text: (none detected)
[/SLATECAMP_UI_BLOCK]

[SLATECAMP_UI_BLOCK:ui_0005 component="Tip" status="preserved"]
Extracted summary:
- Props: (none)
- Text: (none detected)
[/SLATECAMP_UI_BLOCK]

[1] HID Global. Wiegand Protocol Specification. Accessed 2024.
[2] Belden/Siemon. Access Control Cabling Guide. Document 7CXXX, 2022.
[3] ISO/IEC 14223-1:2013. Identification cards — Contactless integrated circuit cards — Part 1: Physical characteristics.
[4] Security Industry Association. OSDP Technical Standard (IEC 60839-11-5). Rev. 2.3, 2023.
[5] Belden. RS-485 Cabling Distance Calculator. Technical Resource, 2022.
[6] HID Command Center. Integration Guide. Version 7.2, 2023.
[7] Honeywell Integrated Security. OSDP Device Configuration. Technical Brief, 2023.
[8] Salto Systems. OSDP vs. Legacy Protocols. White Paper, 2022.
[9] Genetec. Clearance Access Control: System Architecture & Scalability. White Paper, 2023.
[10] IEEE 802.3 Standard. Power over Ethernet (PoE) Specifications. 2022 Edition.
[11] NIST Cybersecurity Framework. Access Control System Security Guidance. SP 800-53, Revision 5, 2023.
[12] ISO/IEC 14223-1:2013. Proximity Cards. Specification & Test Methods.
[13] Wired Magazine. "How Easy Is It to Clone a Proximity Card?" Technical Article, 2021.
[14] Philippine Retail & Industrial Market Report. Card Technology Pricing, Q1 2024.
[15] ISO/IEC 14443-1:2016. Identification cards — Contactless integrated circuit cards. Parts A & B.
[16] Salto Systems. Smart Card Integration with Multi-Application Deployment. Case Study, 2023.
[17] NIST SP 800-38D. Recommendation for Block Cipher Modes of Operation: Galois/Counter Mode. 2007.
[18] Bluetooth Special Interest Group. Bluetooth Core Specification 5.3. 2021.
[19] NFC Forum. NFC Technical Specifications. Tag Type 4, 2020.
[20] Genetec Cardaxo. Mobile Access Credential Architecture. Technical Documentation, 2023.
[21] Salto. BLE Coverage in Multi-Floor Buildings: Measurement & Optimization. Technical Report, 2022.
[22] NIST FRVT (Fingerprint Recognition). Accuracy Metrics Report. 2023.
[23] HID Biometric Integration. Best Practices for Template Security. Technical Guide, 2023.
[24] NEC NeoFace. Facial Recognition Accuracy & Benchmark Report. 2023.
[25] NIST FRVT (Face Recognition). Leaderboard & Accuracy Report. March 2023.
[26] Daon. Facial Recognition Accuracy Under Mask & Poor Lighting. Technical Paper, 2023.
[27] Republic Act No. 10173. Data Privacy Act of 2012. Section 3 (Personal Information Definition).
[28] Philippine Technology & Privacy Survey. Enterprise Use of Biometric Systems, 2023.
[29] Honeywell. Facial Recognition Integration with Access Control Panels. Technical Brief, 2023.
[30] Iris ID. Iris Recognition Accuracy & False Rates. Technical Specification, 2023.
[31] Thleas. Iris Recognition System Specifications. Product Datasheet, 2023.
[32] Philippine Security Equipment Supplier Survey. High-End Biometric Reader Pricing, 2024.
[33] Iris ID. Throughput & Enrollment Time Metrics. Technical Paper, 2023.
[34] HID Electric Strike Lock. Specifications & Installation Guide. Document X1234, 2023.
[35] NFPA 101 (Life Safety Code). Emergency Egress Requirements & REX Devices. 2021 Edition.
[36] PD 1096 (National Building Code, 2nd Edition). Article 1207 (Emergency Egress). 2015.
[37] Genetec. Offline Access Control & Credential Failover. Technical Guide, 2023.
[38] PD 1096. Article 1207.1 (Automatic Door Unlocking on Fire Alarm). 2015.
[39] NFPA 101. Exit Door Devices & Push-Button Requirements. Section 7.2.1.8. 2021.
[40] HID Motion Sensor REX. Installation & Sensitivity Tuning. Technical Manual, 2023.
[41] NFPA 101. Panic Hardware & Pressure-Release Exit Devices. Section 7.2.1.7. 2021.
[42] PD 1096. Article 1207.2 (Automatic Door Unlock Timing). 2015.
[43] NFPA 72. National Fire Alarm Code. Section 10.15 (Door Control Signaling). 2019 Edition.
[44] PD 1096. Article 1207 (Door Unlock Timing on Fire Alarm). 2015.
[45] Honeywell. Elevator Access Control Integration. Technical Brief, 2023.
[46] NFPA 101. Elevator Override on Fire Alarm. Section 7.2.13. 2021.
[47] International Organization for Standardization. ISO 27001:2022. Information Security Management. Section A.6.2 (Visitor Management).
[48] Salto Visitor. QR-Based Temporary Credential System. Product Documentation, 2023.
[49] Genetec Clearance. Mobile Visitor Credential Deployment. Case Study, 2023.
[50] PD 1096 & ISO 27001. Access Log Retention Requirements. 2015, 2022 respectively.
[51] Genetec. Parking Access & Revenue Control (PARCS) Integration. Technical Guide, 2023.
[52] Honeywell. PARCS Bandwidth Requirements. Technical Note, 2023.
[53] ISO 50001. Energy Management System Standard. BMS Integration with Building Systems. 2018.
[54] ISO/IEC 11801-1:2017. Information technology — Generic cabling for customer premises. Amendment 2, 2021.
[55] NEC Article 300 & PD 1096. Electrical Conduit & Fire Rating for Access Control Cabling. 2024, 2015.
[56] Siemon. Vertical Backbone Cabling Design for High-Rise Buildings. Technical Guide, 2022.
[57] ISO/IEC 11801. Horizontal Cabling Run Distance Limits. Section 5, 2017.
[58] Eaton. UPS Backup for Access Control Systems. White Paper, 2023.
[59] NIST SP 800-14. General Security Principles. Redundancy & Single-Point Failure Analysis. 1996.
[60] NEC Article 342. Intermediate Metal Conduit (IMC). Conduit Sizing Tables. 2020.
[61] Salto. Cloud vs. On-Premises Access Control: Offline Failover Architecture. White Paper, 2023.
[62] NIST Cybersecurity Framework. Identify, Protect, Detect, Respond, Recover Functions. 2023.
[63] Genetec. Total Cost of Ownership: IP-Based vs. Legacy Access Control. Analysis, 2023.
[64] ISO 16001. Energy Management System Measurement & Verification. Building Occupancy Data. 2018.
[65] Honeywell. BMS Integration with Parking Variable Message Signs. Technical Brief, 2023.
[66] Otis/Schindler. Elevator Destination Control with BMS. Technical Specification, 2023.
[67] NFPA 72. Fire Alarm System Data Access for Emergency Dispatch. Section 10.18. 2019.
[68] MQTT Organization. MQTT v3.1.1 Specification for Building Automation. 2014.
[69] PD 1096 Rule VII Sec 709 (Electrical requirements); UPS backup per building electrical design standards.
[70] Bureau of Fire Safety (BFP). Fire Safety Inspection Standards for Access Control. 2023.
[71] Philippine Real Estate Development Association (PREDA). Condo Access Control Best Practices, 2023.
[72] Salto Visitor. Condominium Guest Management Deployment. Case Study, 2023.
[73] Philippine Security Industry Association. Access Control System Breach Report, 2023.
[74] Genetec. Office Tower Visitor Management & Lobby Security. Case Study, 2023.
[75] ASEAN Security Forum. Building Management System Billing & Tenant Reporting, 2023.
[76] Honeywell. Shopping Mall Back-of-House Access Control. Technical Case Study, 2023.
[77] HID. Cash Handling Area Biometric Access. Security Brief, 2023.
[78] NFPA 101 & PD 1096. Emergency Egress & Zone-Based Door Control. 2021, 2015.

## Related Articles

See also within Security and Communication Systems: **lea-util-005-03-core-concept**, **lea-util-005-05-core-concept**.

> **Overview:** See **overview-building-utilities-mepf** for the full curriculum structure and study strategy. See **mastery-building-utilities-mepf** for connections across topics.

