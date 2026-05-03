## What You Need to Know for the LEA

Cable television, broadcasting, and wireless infrastructure form the backbone of modern building communications. Whether your building uses traditional CATV distribution, newer IPTV systems, or comprehensive Wi-Fi coverage, understanding the electrical and structural requirements is essential for safe, compliant installation and operation.

### CATV Distribution Systems

CATV (Cable Television) systems consist of several key components that must be installed according to National Building Code (NBC) and National Telecommunications Commission (NTC) standards.

#### System Architecture

A typical CATV distribution system includes:

- _Headend_: The central facility where signals are received (from terrestrial, satellite, or fiber sources), processed, combined, and modulated onto a single coaxial cable trunk. The headend typically operates at 220V/60Hz as per Philippine standard electrical supply and must include UPS backup for signal continuity.
- _Trunk lines_: Primary coaxial cables (typically RG-11, 75-ohm impedance) carrying the combined signal throughout the building. Trunk cables run from the headend to distribution amplifiers, with maximum spacing of 300 m between amplifiers to prevent signal degradation (based on TIA-542 cable performance specifications).
- _Distribution amplifiers_: Devices that boost signal strength at intervals along trunk lines. Modern amplifiers operate at 220V/60Hz with thermal management and must include output limiting to prevent overload. Signal loss in RG-11 cable at 500 MHz is approximately 0.6 dB per 30.5 m (100 ft), making amplification necessary for trunk lengths beyond 300 m.
- _Tap-offs_: Passive devices that split a small portion of the trunk signal to individual subscriber drops without disrupting the main line.
- _Drop cables_: RG-6 (75-ohm) or RG-11 coaxial cables connecting tap-offs to individual units, with maximum recommended length of 150 m per run.

#### Cable Specifications

RG-6 and RG-11 coaxial cables are the industry standard for CATV applications:

- _RG-11_: 0.405 inch (10.3 mm) outer diameter, lower signal loss (0.6 dB/100 ft at 500 MHz) than RG-6, used for trunk lines and long runs, shielding with braid and foil providing 90+ dB shielding effectiveness.
- _RG-6_: 0.242 inch (6.15 mm) outer diameter, higher signal loss (1.1 dB/100 ft at 500 MHz) than RG-11, suitable for in-home drops and service runs up to 150 m, cost-effective for subscriber lines.

Both cable types must comply with IEC 61196-1 (coaxial cable test methods) and be installed with proper grounding to prevent electrical hazards and signal interference.

### MATV and SMATV Systems

Master Antenna Television (MATV) systems use a single rooftop or external antenna to serve multiple units within a building.

- _MATV_: Antenna → Preamplifier → Distribution trunk → Tap-offs → Drop cables to units. Typically serves 30–500 users per antenna system. Passive distribution components (splitters, taps) are used with distribution amplifiers at strategic intervals. Suitable for terrestrial broadcast reception in areas with strong signal strength.
- _SMATV_ (Satellite MATV): Integrates satellite dish reception with MATV architecture. Satellite downconverters (LNBs) output L-band signals (950–2150 MHz) that are combined with terrestrial signals via diplexers before trunk distribution. SMATV enables satellite program delivery alongside broadcast TV to every unit in a building.

MATV and SMATV antennas must be installed according to PBC structural requirements and NTC licensing for reception facilities. Grounding of antenna masts to building earth electrodes is mandatory under Philippine Electrical Code (PEC) Article 810 (Radio and Television Equipment) and Article 820 (Community Antenna Television and Radio Distribution Systems).

### IPTV as Modern Replacement

Internet Protocol Television (IPTV) delivers video content via managed IP networks, replacing traditional CATV in many modern buildings.

- IPTV requires a high-capacity fiber optic or gigabit ethernet backbone to the headend/server facility.
- Content is encoded in MPEG-2 or MPEG-4 video codecs and transmitted as IP packets over dedicated or hybrid network infrastructure.
- Bandwidth allocation: Typically 4–6 Mbps per HD stream (based on ITU-R BT.1200 recommendations), requiring careful network provisioning for buildings with hundreds of simultaneous viewers.
- IPTV systems eliminate the need for coaxial trunk distribution but depend heavily on LAN infrastructure (see Structured Cabling Backbone section below).
- In the Philippines, major ISPs including Globe Telecom, PLDT, and Converge ICT provide IPTV services integrated with broadband delivery, often via fiber-to-the-building (FTTB) architectures.

### Wi-Fi Infrastructure

Wireless local area network (WLAN) infrastructure provides high-speed data connectivity throughout buildings and is now essential for modern operations.

#### Access Point Density and Coverage

Access point (AP) placement determines coverage quality and user capacity:

- _Office environments_: 1 AP per 90–140 m² (based on WiFi Alliance deployment guidelines for 802.11ax), with typical transmit power of 20 dBm (100 mW) and maximum range of 50–100 m in open space (reduced by walls and obstacles).
- _High-density environments_ (conference rooms, lobbies, educational facilities): 1 AP per 45–70 m², ensuring minimum data rates of 50 Mbps per user.
- AP placement must account for building materials (concrete and steel reduce range by 30–50%, as documented in IEEE 802.11 propagation models).
- Roaming between APs requires overlapping coverage of at least 20% to ensure seamless client transitions (per WiFi Alliance WPA3 roaming best practices).

#### Wi-Fi Standards and Frequencies

Current-generation Wi-Fi standards dominate modern deployments:

- _Wi-Fi 6 (802.11ax)_: Operates on 2.4 GHz (20/40 MHz channels) and 5 GHz (20/40/80/160 MHz channels), theoretical maximum data rate 9.6 Gbps (based on IEEE 802.11ax specification), improved efficiency in congested environments through OFDMA (Orthogonal Frequency Division Multiple Access) and MU-MIMO (Multi-User Multiple Input Multiple Output).
- _Wi-Fi 7 (802.11be)_: Emerging standard operating on 2.4 GHz, 5 GHz, and 6 GHz (additional 1200 MHz of spectrum), theoretical maximum data rate 46 Gbps, 320 MHz channel bandwidth, expected widespread deployment 2025–2027 per WiFi Alliance timeline.
- _Channel selection_: In the Philippines, NTC permits channels 1–13 on 2.4 GHz and channels 36–165 on 5 GHz per current NTC frequency allocation guidelines. Operators should verify current channel availability with NTC as allocations may change. 6 GHz availability is pending NTC approval but is expected by 2026.

#### Wi-Fi Controller and Management

Centralized Wi-Fi management requires:

- _Controller_: Software or appliance that provisions, monitors, and manages multiple APs across the building. Controllers authenticate users via WPA2/WPA3 protocols, enforce bandwidth policies, and provide roaming optimization. Typical controller placement is in the main IT room or Telecommunications Room (see below).
- _PoE switches_: Power over Ethernet (PoE) switches deliver both data and power to APs via Cat 6A ethernet cable, eliminating the need for separate power runs. PoE+ standard (IEEE 802.3at) provides up to 30 W per port, sufficient for most modern APs; PoE++ (IEEE 802.3bt) provides 60–100 W for emerging high-power devices.
- _Cable backbone_: Gigabit or 10 Gigabit ethernet from PoE switches to the controller and upstream network ensures low-latency, high-throughput connectivity for all APs.

### Structured Cabling Backbone

The backbone infrastructure supporting both wired and wireless systems must follow TIA-568 standards and Philippine Building Code requirements.

#### Fiber Optic and Copper Cabling

- _Single-mode fiber (SMF)_: Core diameter 8–10 μm, supports long distances (40+ km) with minimal signal loss (0.2 dB/km at 1550 nm), used for inter-building links and main building backbones. Cost is 2–3× higher than multimode fiber per meter.
- _Multi-mode fiber (MMF)_: Core diameter 50 μm (OM3/OM4) or 62.5 μm (OM1/OM2), supports distances to 300 m (OM3 at 10 Gigabit Ethernet), suitable for intra-building distribution. Lower cost and ease of termination make MMF common in commercial buildings.
- _Cat 6A copper UTP_: Unshielded twisted pair, 500 MHz bandwidth, supports 10 Gigabit Ethernet over 100 m (compared to Cat 6 at 55 m maximum), maximum bend radius 1 inch (25.4 mm) to prevent signal degradation, suitable for telecommunications room to intermediate distribution frames (IDFs). Cost approximately PHP 50–80 per meter in the Philippines (Q1 2026 pricing).

#### Telecommunications Room (TR) Sizing

The TR is the primary distribution hub for all building communications systems and must meet TIA-569 space requirements:

- _Minimum floor area_: 0.9 m² for buildings up to 1000 m², increasing to 1.4 m² for buildings 1000–5000 m², and 1.8 m² for buildings over 5000 m².
- _Access_: TR must be accessible, with doors at least 0.9 m wide and ceilings at least 2.4 m high (per TIA-569-C standard).
- _Environmental control_: Temperature 16–35 °C, humidity 20–80% non-condensing, adequate ventilation to manage heat from distribution amplifiers and network equipment operating at 220V/60Hz AC power.
- _Grounding_: Main grounding electrode system per PEC Article 250 (Grounding and Bonding) and Article 820 (Community Antenna Television and Radio Distribution Systems) with a dedicated equipment grounding bus connected to the building main ground, minimum #6 AWG copper conductor.
- _Cable management_: Horizontal cable distribution from the TR to Intermediate Distribution Frames (IDFs) on each floor, with separate conduit runs for power and signal to prevent electromagnetic interference.

#### Distribution Strategy

- _Backbone cabling_: Multi-mode fiber from TR to each IDF (one per 1000 m² or per floor, whichever is greater), providing redundancy and future growth capacity.
- _Horizontal cabling_: Cat 6A from IDF to individual outlets (at least one per 10 m of perimeter space per TIA-568), supporting PoE for Wi-Fi APs and future 10 Gigabit endpoints.
- _CATV bridging_: In buildings with both CATV and structured cabling, IPTV gateway devices in the TR convert IP-delivered video to analog signals for legacy CATV tap-offs, or bypass CATV distribution entirely in favor of IPTV via the ethernet backbone.

### In-Building Wireless (IBW) and Distributed Antenna Systems (DAS)

Cellular coverage inside buildings is often poor because brick, concrete, and steel walls attenuate external cell signals by 10–40 dB (depending on frequency and material thickness). In-building wireless systems address this:

- _Distributed Antenna System (DAS)_: Consists of a master unit (connected to external cell signals or a private small cell) and remote antenna units distributed throughout the building via fiber optic cable. DAS covers all floors and interior spaces, providing indoor cellular coverage equivleant to or better than outdoor coverage.
- _Active DAS_: Antenna units are powered and amplify signals; typical spacing between antennas is 30–50 m for adequate coverage.
- _Passive DAS_: Antenna units are passive; typically used for smaller buildings with shorter cable runs (under 100 m) between master and antenna.
- _Frequency bands_: In the Philippines, cellular operators (Globe, Smart, Converge) use 700 MHz, 900 MHz, 1800 MHz, and 2600 MHz bands for LTE/5G services. DAS systems must support all bands in use by building tenants' carriers.
- _Integration with structured cabling_: DAS can share the same fiber backbone as IP networks if separate wavelength channels (CWDM—Coarse Wavelength Division Multiplexing) are allocated. Typical spacing: IP traffic on 1310 nm, DAS on 1550 nm. All installations must comply with NBC structural and electrical requirements.

### NTC Regulations and Broadcasting Infrastructure

The National Telecommunications Commission (NTC) regulates all telecommunications and broadcasting infrastructure in the Philippines.

#### Licensing and Permits

- _Broadcasting facilities_ (CATV headends, satellite earth stations) require NTC authorization under Executive Order 205 and the Public Telecommunications Policy Act of 1992 (RA 7925).
- _MATV/SMATV reception antennas_ for private building use do not require individual NTC licensing, but CATV headend facilities that distribute signals to multiple subscribers require NTC authorization, permits, and licenses per NTC MC 4-08-88. Antenna installation must comply with NBC structural and electrical codes.
- _Cellular DAS systems_ require NTC coordination if they include RF transmission or amplification; however, passive distribution of external cell signals (via donor antennas) may be exempted from licensing.
- _Wi-Fi and private IP networks_ are unregulated by NTC but must comply with PBC and PEC requirements for electrical safety and structural integrity.

#### Safety and Electromagnetic Compliance

- _Antenna placement_: External antennas (broadcast, MATV, satellite) must maintain minimum RF exposure distances per ICNIRP guidelines (International Commission on Non-Ionizing Radiation Protection), as adopted by NTC. Typical safe distances: 2 m for 100 W transmitter at VHF, reduced for directional antennas.
- _Grounding and bonding_: All RF-carrying infrastructure must be grounded to the building earth electrode system (minimum 10-ohm resistance per PEC Article 810 and Article 820) to prevent shock hazards and lightning damage.
- _RF shielding_: In sensitive areas (medical equipment rooms, laboratories), Faraday cages or shielded cable may be required to limit external RF interference; shielding effectiveness should exceed 80 dB at relevant frequencies.

### Philippine ISP Infrastructure and Fiber Deployment

Major ISPs in the Philippines provide broadband and IPTV services via fiber-to-the-building (FTTB) and fiber-to-the-home (FTTH) architectures:

- _Globe Telecom_: Offers fiber broadband (Globe at Home Fiber) with speeds up to 1 Gbps in selected areas, typically deployed via Optical Network Terminals (ONTs) in the building's TR or IDF.
- _PLDT_: Rolls out PLDT Home Fibr with similar coverage and speeds, emphasizing fiber-to-the-business (FTTB) for commercial properties.
- _Converge ICT_: Focuses on FTTB/FTTH deployment in Metro Manila and expanding regions, offering 1–2.5 Gbps services.
- _Fiber termination_: External fiber from ISP enters the building at a demarcation point (demarc), typically the TR or a security vestibule. The ONT (Optical Network Terminal) converts optical signals to electrical signals (ethernet, sometimes coax for legacy IPTV), requiring 220V/60Hz AC power and space approximately 30 cm × 20 cm × 10 cm.

### Integration and Future Growth

A well-designed building communications system integrates all infrastructure—CATV/IPTV, Wi-Fi, structured cabling, DAS, and external fiber—within a single planned backbone:

- _Single-purpose fiber runs_ (separate for CATV, Wi-Fi backhaul, DAS, inter-building links) are replaced by _multi-service backbone_ using fiber-optic multiplexing (CWDM) to carry multiple service wavelengths on a single fiber pair.
- _Unified TR design_ with equipment racks for CATV headend, Wi-Fi controller, network switches, and ISP ONT reduces operational complexity and maintenance overhead.
- _Scalability_: Over-provisioned conduit systems (empty 1-inch PVC ducts between TR and IDF) allow future cable additions without re-routing, reducing long-term cost of change.
- _Documentation_: AS-BUILT drawings showing all cable routes, equipment locations, and grounding connections are essential for permit compliance and future work.

---

## Summary

Cable TV, broadcasting, and Wi-Fi infrastructure are no longer standalone systems in modern buildings. Integration with structured cabling, compliance with NTC regulations, and adherence to Philippine Building and Electrical Codes ensure safe, scalable, and future-proof communications networks. Proper planning of TR sizing, backbone capacity, access point density, and grounding systems during design phase prevents costly retrofits and operational failures. Buildings incorporating fiber-optic backbones, gigabit Wi-Fi, and coordinated cellular DAS systems deliver superior connectivity while maintaining NTC and PBC compliance.

<QuestionBank questionSetId="LEA-UTIL-005-05" totalQuestions={10} />
