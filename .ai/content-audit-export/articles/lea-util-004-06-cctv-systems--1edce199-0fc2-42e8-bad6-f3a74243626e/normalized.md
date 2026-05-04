## What You Need to Know for the LEA

## Learning Goal

Identify CCTV system components (cameras, DVR/NVR, monitors, cabling, storage), classification by camera type (fixed, PTZ, thermal, IP), resolution standards, and application for security monitoring in different building types per relevant Philippine standards.
## CCTV Systems

### Camera Types and Applications

[SLATECAMP_UI_BLOCK:ui_0001 component="ArticleMedia" status="preserved"]
Extracted summary:
- Props: id="media-lea-util-004-06-cctv-systems", type="image", caption="CCTV System Architecture — Cameras, DVR/NVR, Monitoring Station", description="Network diagram showing CCTV system components: dome cameras (indoor ceilings), bullet cameras (perimeter walls), PTZ cameras (lobbies/malls), connected via Category 6A cabling to NVR (network video recorder) with storage (4-8TB for 16 cameras, 30-day retention). Monitoring station shows video wall display and security console. Resolution standards (1MP entry, 2-4MP standard, 5MP+ license plate) annotated.", suggestedAsset="Diagram or reference image", status="placeholder"
- Text: (none detected)
[/SLATECAMP_UI_BLOCK]


**Dome cameras** are mounted flush against ceilings or walls and offer aesthetic integration with interior design. They are commonly specified for retail environments, office lobbies, and residential common areas in Philippine gated communities. The dome housing protects the camera optics from environmental exposure and provides a degree of operational discretion—observers cannot easily determine the camera's viewing direction.

**Bullet cameras** are cylindrical and typically mounted on external walls, gate structures, or poles. These are standard for perimeter surveillance, parking lots, and access points. Their design allows straightforward aiming and clear sightlines over outdoor areas, making them the preferred choice for boundary security in condominiums and commercial developments.

**PTZ (Pan-Tilt-Zoom) cameras** deliver operator-controlled movement and optical zoom capability. PTZ units are reserved for critical zones requiring dynamic coverage, such as mall concourses, office lobbies, or gated community main gates. A single PTZ camera can monitor a wider area than fixed cameras but requires security staff presence in the control room for active management.

[SLATECAMP_UI_BLOCK:ui_0002 component="ComparisonTable" status="preserved"]
Extracted summary:
- Props: title="Camera Type Selection Guide"
- Text: | Feature | Dome Camera | Bullet Camera | PTZ Camera | |---|---|---|---| | Mounting | Ceiling / flush wall | External wall / pole | Ceiling / wall / pole | | Aesthetics | High (discreet) | Moderate (visible) | Moderate (bulky) | | Environment | Indoor | Indoor / outdoor | Indoor / outdoor | | Coverage | Fixed zone | Fixed zone | Dynamic (operator-controlled) | | Cost | Moderate | Low–moderate | High | | Best for | Offices, retail, lobbies | Perimeter, parking lots | Malls, gates, large concourse
[/SLATECAMP_UI_BLOCK]

### Resolution Standards

Camera resolution is specified in megapixels (MP) and directly affects image clarity and the ability to identify individuals or license plates.

- **1 MP (1280 × 960)** is considered entry-level, suitable for access verification at controlled doors or indoor parking areas where individuals are expected to be closer to the camera.
- **2–4 MP** is standard for most applications in Philippine office buildings and retail centers, providing sufficient detail for facial recognition at distances up to 5 meters.
- **5 MP and above** is specified when license plate identification or wide-area coverage at significant distances is required. Mall perimeters and major access gates often incorporate 5–8 MP units.

The _National Building Code (PD 1096)_ does not prescribe specific megapixel requirements; instead, design engineers select resolution based on application-specific detection distances and local compliance expectations.

[SLATECAMP_UI_BLOCK:ui_0003 component="KeyValues" status="preserved"]
Extracted summary:
- Props: items="{[\n  {label: \"1 MP (1280 × 960)\", value: \"Entry-level; suitable for access verification at controlled doors and indoor parking where subjects are close to the camera.\"}", label=true, MP=true, value=true, Standard=true, for=true, most=true, Philippine=true, office=true, and=true, retail=true, applications=true
- Text: (none detected)
[/SLATECAMP_UI_BLOCK]

### Storage Requirements

Video storage capacity depends on resolution, frame rate, compression codec, and retention policy.

A **2 MP camera** operating at 30 frames per second (fps) and using H.264 compression typically generates 0.5–1.0 GB per hour of footage. For a 30-day retention requirement across a system with 16 cameras:

$$\text{Storage} = 16 \text{ cameras} \times 1 \text{ GB/hour} \times 24 \text{ hours/day} \times 30 \text{ days} = 11.52 \text{ TB}$$

High-resolution systems (5 MP) may require 2–3 GB per camera per hour, scaling retention demands significantly. Network video recorders (NVRs) for medium-sized office buildings (50–100 cameras) typically incorporate 4–8 TB of redundant storage, with additional cloud backup or off-site archiving for critical facilities. Philippine shopping malls and office complexes commonly maintain 60–90 day retention periods to comply with tenant and regulatory expectations.

[SLATECAMP_UI_BLOCK:ui_0004 component="Note" status="preserved"]
Extracted summary:
- Props: (none)
- Text: **CCTV Storage Estimation** Storage (TB) = Cameras × GB/hr × 24 hrs × Retention Days ÷ 1000 Variables: - **Cameras**: Number of cameras in the system - **GB/hr**: Recording rate per camera (0.5–3 GB/hr depending on resolution) - **Retention Days**: Required retention period (30–90 days typical) Example: 16 cameras × 1 GB/hr × 24 hrs × 30 days = 11.52 TB
[/SLATECAMP_UI_BLOCK]

---

[SLATECAMP_UI_BLOCK:ui_0005 component="KeyValues" status="preserved"]
Extracted summary:
- Props: (none)
- Text: (none detected)
[/SLATECAMP_UI_BLOCK]

[SLATECAMP_UI_BLOCK:ui_0006 component="ExamTip" status="preserved"]
Extracted summary:
- Props: (none)
- Text: (none detected)
[/SLATECAMP_UI_BLOCK]

[SLATECAMP_UI_BLOCK:ui_0007 component="Tip" status="preserved"]
Extracted summary:
- Props: (none)
- Text: (none detected)
[/SLATECAMP_UI_BLOCK]

## Access Control Systems

### Card Reader Technologies

**Proximity (prox) card readers** detect radio-frequency signals from passive cards or fobs when within operational range (typically 10–15 cm). Proximity systems are cost-effective and widely deployed in Philippine office buildings and residential complexes. They do not require card contact and offer reasonable security for standard access points.

**Smart card readers** authenticate encrypted credentials stored on microchips embedded in the card. Smart cards provide higher security than proximity systems and are often mandated in financial institutions, government buildings, and premium residential communities. The card must be inserted or held directly against the reader terminal.

**Mobile credential systems** employ NFC (Near Field Communication) or Bluetooth to unlock doors via smartphones. Modern office buildings in Metro Manila increasingly integrate mobile access to reduce physical card issuance and improve audit trails.

### Biometric Technologies

**Fingerprint readers** scan unique ridge patterns and are suitable for controlled access to server rooms, secure storage, and management offices. Fingerprint enrollment and verification occur locally on the reader or through centralized software, with response times under 2 seconds. Philippine banks and large IT centers commonly integrate fingerprint readers at sensitive areas.

**Facial recognition systems** capture and match facial geometry. Advanced systems operate in real-time across entry points without requiring user action. Facial recognition is increasingly deployed in mall concourses, office lobbies, and gated community main gates. _RA 9514_ does not impose specific facial recognition restrictions; however, facility owners must establish clear policies on data retention and biometric privacy.

**Iris recognition** offers very high accuracy but requires direct alignment and is less user-friendly. It is reserved for ultra-secure applications such as vaults or classified areas within government or defense facilities.

### Keypads and PIN Entry

Numeric keypads allow users to enter PIN codes at access points. A 4-digit PIN provides 10,000 combinations; a 6-digit PIN offers 1 million combinations. Keypads are typically combined with card readers to create multi-factor authentication. They are cost-effective for emergency exit doors and supplementary access routes in office and retail environments.

### Electric Locks

**Electromagnetic locks (maglocks)** are fail-safe devices that unlock upon power loss or signal interrupt, prioritizing life-safety evacuation. Maglocks may be used on emergency exits per _PD 1096 Rule VIII Sec 808_ provided they release automatically on power loss, fire alarm activation, or manual override and are also specified on secondary access doors in secure areas. A typical 600-pound-force maglock requires 12 VDC at 0.5 A.

**Electric strikes** replace traditional mechanical strike plates on swinging doors, allowing electronic control while maintaining a mechanical backup. Electric strikes are the standard for controlled access in office and residential settings.

**Motor-driven electronic door locks** (such as plug-in locks or mortise locks with electronic actuators) integrate encryption and are used on high-security applications. They maintain mechanical key override capability.

---

## Intrusion Detection Systems

### PIR Motion Sensors

Passive Infrared (PIR) motion sensors detect changes in thermal radiation caused by moving human bodies. They are standard interior volumetric detectors for after-hours protection in offices, retail spaces, and warehouse areas.

- **Conventional PIR sensors** have a detection range of 10–15 meters and a viewing angle of 90–120 degrees.
- **Pet-immune PIR sensors** utilize dual-element pyroelectric detectors to distinguish small animals from human intruders, reducing false alarms in facilities where animals are present.

PIR sensors require line-of-sight and are susceptible to false triggering from sunlight, HVAC drafts, and rapid temperature changes. Placement should be high on walls (1.8–2.2 meters) to avoid obstruction and optimize detection patterns.

### Door and Window Contact Sensors

Magnetic reed switches are installed on door frames and window sashes to detect opening events. Upon magnet separation, the switch closes the circuit, signaling the alarm control panel. Contact sensors are hardwired or wireless and are the primary perimeter detection method in gated communities, office buildings, and retail centers.

Contact sensors provide discrete alarm events (open or closed) but do not distinguish between authorized and unauthorized access.

### Glass Break Detectors

Acoustic glass break detectors respond to the high-frequency sound signature of breaking glass (typically 8–15 kHz). They must be installed within 1 meter of the glass pane and are common in retail storefronts, ground-floor offices, and high-value display areas.

Vibration-based glass break detectors respond to the mechanical shock of impact and are less prone to false alarms from high-frequency sounds in the environment.

---

## Security Lighting

Perimeter and parking area illumination is essential for intrusion deterrence and CCTV image quality.

### Minimum Illumination Standards

Industry practice establishes the following minimum security lighting levels:

- **Perimeter security zones (parking perimeter, building edges)**: 50 lux minimum, measured at ground level
- **Parking areas (general vehicle parking)**: 30 lux minimum
- **Building entrance and exit doors**: 100 lux minimum to ensure facial clarity for CCTV and guard verification
- **Emergency exit pathways**: 20 lux minimum (sufficient to navigate safely)

Lux is measured using a light meter perpendicular to the illuminated surface. In Philippine tropical climates, overhanging vegetation and high humidity can reduce effective illumination, requiring periodic maintenance and possibly higher wattage fixtures than temperate-climate equivalents.

### Fixture Types and Control

**High-mast lighting** (pole heights 12–20 meters) is deployed in large parking lots, grounds, and perimeter areas of office parks and shopping malls. High-mast fixtures deliver uniform illumination and reduce shadows.

**Wall-mounted floodlights** direct light from building edges across perimeter walkways and parking areas.

**Motion-activated lighting** reduces energy consumption during low-activity periods and enhances security by creating sudden illumination when motion is detected. Motion lights are controlled via microwave or PIR sensors and are common in residential compounds and secondary office entrances.

Lighting control is integrated with the Building Management System (BMS) to enable scheduling (e.g., 18:00–06:00 operation) and override capabilities during security events.

---

## Intercom and Video Intercom Systems

### Analog and IP Intercom

**Analog intercom systems** use dedicated cabling (typically 2–4 twisted pairs) to carry audio signals between stations. Analog systems are simple, cost-effective, and widely installed in older Philippine office buildings and condominium units. Range limitations and maintenance of cabling can be challenges in large complexes.

**IP intercoms** transmit audio and video over existing Ethernet infrastructure, reducing cabling requirements. IP intercoms integrate seamlessly with access control systems and BMS platforms. Modern office buildings and shopping malls predominantly specify IP-based intercom.

### Video Intercom at Entry Points

Video intercom systems at building main entrances, condominium unit doors, and secure areas allow visual verification of visitors before granting access. A high-resolution camera (2 MP minimum) captures the caller's image; a monitor or display in the guard booth or resident's unit enables two-way audio communication.

Video intercoms must be integrated with the access control system to trigger electric strikes or maglocks upon authorized visitor entry. Response time should be under 2 seconds to maintain user experience.

---

## Guard Tour Systems

A guard tour system creates a digital record of security personnel movement through the facility. The guard carries a mobile unit (portable reader or smartphone app) and scans fixed checkpoints or tags placed at critical locations (gates, exits, equipment areas, parking levels).

Each scan records the timestamp, location, and guard identity. This data demonstrates compliance with patrol schedules and provides evidence of facility monitoring. Philippine gated communities, office parks, and shopping malls routinely implement guard tour systems for operational security.

---

## Integration with Fire Alarm and Building Management Systems

Security systems must interoperate with fire alarm and broader building management infrastructure:

1. **Fire alarm integration**: Access control systems automatically unlock all electric strikes and maglocks upon activation of the fire alarm, ensuring unobstructed evacuation per _PD 1096_.
2. **BMS integration**: Lighting, HVAC, and security operations are coordinated through a central BMS platform. For example, detection of intrusion triggers security lighting and learts security operations center.
3. **Leart escalation**: Intrusion detection, door tampering, and access denial events are logged and escalated to the security operations center, with audio/visual feedback to building occupants if warranted.

Integration reduces response time during emergencies and improves overall facility resilience.

---

## Conduit and Cabling Infrastructure

### Conduit and Raceway Design

Security systems require dedicated conduit routing to prevent electromagnetic interference (EMI) and protect cables from physical damage.

- **Security camera cabling** (coaxial or UTP for IP cameras) runs in separate conduit from power lines, maintaining minimum 300 mm separation where parallel routing is unavoidable.
- **Access control card reader wiring** (typically 18–20 AWG twisted pair) is routed in electrical conduit to prevent signal degradation.
- **Door lock wiring** (12 VDC or 24 VDC low-voltage) must be isolated from 220V building circuits.

Per Philippine Electrical Code, security system conduits are typically rigid steel or PVC schedule 80 with minimum 25 mm diameter and spare capacity. Flexible conduit is permitted for final connections up to 1 meter.

### Cabling Standards

- **UTP Category 6A** is standard for IP cameras and IP intercoms operating over distances up to 100 meters at 1 Gigabit Ethernet speeds.
- **Shielded twisted pair (STP)** is specified where EMI from high-voltage switchgear or welding equipment is present.
- **Coaxial cable (RG-11 or RG-6)** is used for analog CCTV or where legacy systems are being integrated.

All cabling must be labeled at both ends per industry standards. Labels identify the system (CCTV, Access, Intrusion), termination point, and installation date.

---

## Security Operations Center (SOC) / Control Room Design

The security operations center is the nerve center of building security. It must be designed as a secure, dedicated space with redundant utilities and ergonomic operator stations.

### Location and Access

- **Placement**: SOC should be located near the main lobby or gatehouse, providing clear sightlines to primary circulation areas. It must be elevated above flooding risk (especially relevant in Philippine urban flood-prone areas).
- **Access control**: Entry is restricted to authorized security personnel and management. A reinforced door with multipoint locks and video intercom at the entry is standard.
- **Environmental conditions**: Room temperature is maintained at 18–25 °C (air-conditioned) to ensure equipment longevity and operator comfort during long shifts.

### Equipment and Display

- **Video display wall**: High-resolution monitor array (typically 4–9 screens in medium-sized facilities) displays CCTV feeds. Monitors must support 1920 × 1080 resolution minimum and be positioned at eye level (1.2–1.4 meters) for comfortable viewing.
- **Recorder appliances**: Network video recorders (NVRs) and digital video recorders (DVRs) house storage and are rack-mounted in a dedicated equipment cabinet.
- **Alarm control panel**: A hardwired intrusion detection panel displays alarm zones and provides manual override buttons for emergency access control unlocking.
- **Intercom station**: A hardwired or IP-based intercom master unit enables two-way communication with entry points and internal stations.
- **Guard desk workstation**: A desk-mounted computer with access control software allows security personnel to manage visitors, generate reports, and view audit logs.

### Redundancy and Backup Power

- **UPS (Uninterruptible Power Supply)**: All SOC equipment is connected to a UPS rated for minimum 2 hours of operation at full load, ensuring continuity during power loss.
- **Backup Internet**: Dual Internet service providers or cellular backup connection ensures network connectivity for cloud-based access control and remote monitoring.
- **Backup recorder**: Many facilities specify a redundant NVR or cloud recording service so that video loss from primary equipment failure does not result in data loss.

[SLATECAMP_UI_BLOCK:ui_0008 component="Tip" status="preserved"]
Extracted summary:
- Props: (none)
- Text: **SOC Design Essentials for the LEA** When designing a Security Operations Center, remember the **3-2-1 rule**: at least **3** SOC placement criteria (visibility, flood safety, restricted access), **2** redundant systems (UPS + backup Internet), and **1** dedicated equipment cabinet for NVR/DVR appliances. The UPS rating must cover **2 hours** of full-load operation minimum.
[/SLATECAMP_UI_BLOCK]

---

## Philippine Context and Compliance

### Regulatory Framework

_RA 9514 (Fire Code of the Philippines)_ establishes fire safety requirements for building security integration, mandating emergency access control unlocking on fire alarm activation and documented incident procedures. For facilities using contracted security services, security personnel must be trained and comply with _RA 11053 (Security Services Industry Act)_. Building owners remain ultimately responsible for security system design and effectiveness.

_PD 1096 (National Building Code)_ specifies emergency egress, fire-rated construction, and electrical safety. These requirements directly constrain security system design; for example, all emergency exits must unlock upon fire alarm activation, and all electrical installations must be compatible with the 220 V / 60 Hz Philippine standard.

### Gated Communities

Gated communities in the Philippines typically employ:
- Perimeter fencing with CCTV coverage at gates and common areas
- Access control at main gates (card readers or manual guard verification)
- Intercom systems at unit entry points
- Guard tour systems with checkpoints throughout the subdivision
- Panic buttons in common areas (gyms, pools) connected to the guard house

---

## Best Practices for Philippine Buildings

1. **Tropical environmental considerations**: All external cameras and conduit must be rated for salt spray and UV exposure, particularly in coastal areas. Stainless steel mounting hardware is preferred over standard steel.
2. **Power stability**: Philippine power grids may experience voltage fluctuations. All security equipment should be connected through voltage regulators or UPS units to prevent damage and false alarms.
3. **Network security**: IP-based systems (cameras, intercoms, access control) must operate on isolated VLANs or dedicated networks, separate from general building IT infrastructure, to prevent unauthorized access or system compromise.
4. **Documentation and training**: All system designs must be submitted to the local Building Official per _PD 1096_. Facility staff and contracted security must receive documented training on system operations, emergency procedures, and maintenance protocols.
5. **Regular maintenance**: CCTV cameras, door contacts, and conduit are subject to corrosion and insect infiltration in tropical climates. Monthly inspections and preventive maintenance schedules are essential.

[SLATECAMP_UI_BLOCK:ui_0009 component="Note" status="preserved"]
Extracted summary:
- Props: (none)
- Text: **Security System Best Practices Checklist** - [ ] All external cameras and conduit rated for salt spray and UV exposure - [ ] Security equipment connected through voltage regulators or UPS units - [ ] IP-based systems isolated on dedicated VLANs, separate from general IT - [ ] System designs submitted to local Building Official per PD 1096 - [ ] Staff and contracted security trained on operations and emergency procedures - [ ] Monthly inspections for corrosion and insect infiltration scheduled
[/SLATECAMP_UI_BLOCK]

---

## Summary

A comprehensive security system integrates CCTV, access control, intrusion detection, security lighting, intercom, and control room operations into a unified, codified infrastructure. In Philippine buildings, compliance with _RA 9514_ and _PD 1096_ is non-negotiable. Careful design of electrical infrastructure (220V/60Hz), cabling and conduit routing, and SOC facilities ensures reliable, responsive security operations that protect occupants and assets while maintaining code compliance and operational resilience.

## Related Articles

See also within Fire Protection Systems: **lea-util-004-04-core-concept**, **lea-util-004-05-core-concept**, **lea-util-004-07-core-concept**, **lea-util-004-08-core-concept**.

> **Overview:** See **overview-building-utilities-mepf** for the full curriculum structure and study strategy. See **mastery-building-utilities-mepf** for connections across topics.

