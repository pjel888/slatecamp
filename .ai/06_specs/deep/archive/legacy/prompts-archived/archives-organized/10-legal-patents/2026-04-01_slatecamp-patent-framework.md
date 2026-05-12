# Patent Draft Framework: Behavioral Signal Capture and Cognitive State Inference System for Secure Digital Assessments

**Applicant:** SlateCamp (Philippines)
**Filing Jurisdiction:** Intellectual Property Office of the Philippines (IPOPHL)
**IPC Classification Target:** G06F 3/0488 (Touch input analysis), G06F 21/32 (Behavioral biometrics), G09B 7/02 (Educational testing)
**Date Prepared:** April 2026

---

## Field of the Invention

The present invention relates to computerized educational assessment systems and, more particularly, to computer-implemented methods and systems for capturing user interaction signals during digital assessments, extracting behavioral and cognitive features from said signals, inferring user cognitive and behavioral states through trained behavioral models, cryptographically binding assessment response data to behavioral interaction telemetry, and performing secure multi-factor validation of assessment submissions through a server-enforced state machine based on the inferred states, device identity, session integrity, temporal policies, and assessment context.

The invention addresses the technical problem of securely validating digital assessment submissions while simultaneously capturing and interpreting behavioral and cognitive signals at the moment of submission — without reliance on external surveillance mechanisms such as cameras, microphones, or browser lockdown systems — thereby providing a privacy-preserving alternative to existing proctoring systems.

---

## Core Technical Architecture

The invention is implemented in a client–server architecture comprising: a client assessment application executing on a user device; a network communication layer; and a backend validation and analytics server executing one or more behavioral signal processing, feature extraction, cognitive state inference, cryptographic binding verification, and submission validation modules.

### Client-Side Architecture

The client application is configured to:

(a) Present assessment items and an associated submission control element comprising an instrumented interaction region configured to emit high-frequency pointer or touch events during a deliberate confirmation interaction;

(b) Capture continuous interaction data associated with the deliberate confirmation interaction over the predefined interaction region, the interaction data comprising at minimum time-stamped positional coordinates, event types, and where available, touch contact area, estimated pressure, and device orientation data from accelerometer and gyroscope sensors;

(c) Upon initiation of the confirmation interaction, compute a cryptographic hash of the current assessment response data and bind said hash to the first interaction event, creating an immutable snapshot of the answer state at the moment of submission initiation (the "Cryptographic Answer-Gesture Binding" or "CAGE" mechanism);

(d) Package said interaction data together with the CAGE binding token, device fingerprint data, assessment state data including item completion status, and a server-issued session token into an assessment submission payload; and

(e) Transmit the assessment submission payload to the backend server over a network.

### Server-Side Architecture

The backend server is configured to:

(a) Receive the assessment submission payload;

(b) Verify the CAGE binding token by recomputing the hash of the received assessment response data and comparing it against the hash embedded in the binding token, rejecting submissions where the response data was modified after initiation of the confirmation interaction;

(c) Validate the session token against session control records and verify it has not been previously consumed, thereby mitigating replay attacks;

(d) Extract and normalize behavioral interaction signals from the interaction signal data;

(e) Compute behavioral and cognitive features via a feature extraction pipeline, including but not limited to: interaction path metrics, temporal rhythm metrics, velocity profile metrics, path deviation metrics, hesitation indicators, and interaction stability metrics;

(f) Execute one or more trained inference models to derive cognitive or behavioral state indicators such as decision confidence level, hesitancy index, cognitive load proxy, and anomalous behavior likelihood;

(g) Enforce an assessment submission state machine in which state transitions are permitted only when multi-factor conditions — including behavioral state indicators, CAGE verification, device identity verification, session token validity, temporal policy compliance, and assessment completeness attestation — are jointly satisfied;

(h) Accept, reject, or flag the assessment submission based on the validation outcome; and

(i) Optionally, transmit behavioral state indicators to an adaptive feedback module that modifies subsequent assessment content, adjusts scoring weights, or generates post-assessment behavioral reports.

### Implementation Embodiments

In preferred embodiments, the client application is implemented in a web framework comprising React and Next.js, where the interaction region is rendered as a component that captures high-frequency pointer or touch events via an event listener and streams normalized interaction signal data to the backend via an application programming interface. The backend is implemented as one or more services persisting interaction traces in a PostgreSQL database via Supabase, executing feature extraction pipelines, and evaluating machine-learned behavioral models. The state management layer utilizes Zustand for client-side assessment state and a server-side state machine for submission lifecycle management.

---

## Independent Claims

### Claim 1 — Computer-Implemented Method (Broadest)

A computer-implemented method for behavioral signal capture and cognitive state inference for secure validation of digital assessment submissions, comprising:

(a) presenting, by a client application executing on a user device during an active assessment session, one or more assessment items and a submission control configured to require a continuous confirmation interaction within a predefined interaction region prior to submission of responses;

(b) during said continuous confirmation interaction, capturing, by the client application via an event listener, interaction signal data comprising at least time-stamped positional data of a pointer or touch input along the interaction region, each interaction event comprising at minimum an event type, spatial coordinates, and a sub-millisecond timestamp;

(c) generating, by the client application, an assessment submission payload comprising: (i) the interaction signal data; (ii) assessment response data representing user-selected answers to the one or more assessment items; (iii) assessment state data comprising at least an identifier of the assessment instance and a completion status of required items; (iv) a device identifier associated with the user device; and (v) a session token cryptographically bound to a user identity and the assessment instance;

(d) transmitting, by the client application, the assessment submission payload to a backend server over a network;

(e) receiving, by the backend server, the assessment submission payload;

(f) extracting, by a behavioral signal processing module executing on the backend server, one or more behavioral features from the interaction signal data, the one or more behavioral features comprising at least: (i) an interaction path metric indicating a magnitude of displacement of the pointer or touch input within the interaction region; and (ii) a temporal metric indicating a duration of the continuous confirmation interaction;

(g) inputting, by a cognitive state inference module executing on the backend server, the one or more behavioral features into a trained behavioral model to generate one or more cognitive or behavioral state indicators associated with the assessment submission, the one or more cognitive or behavioral state indicators comprising at least a decision confidence indicator or an anomalous behavior likelihood indicator;

(h) validating, by a submission validation module executing on the backend server, the assessment submission based on: (i) the one or more cognitive or behavioral state indicators; (ii) verification of the device identifier against registered device records; (iii) verification of the session token against session control records; and (iv) verification of the assessment state data including the completion status of required items, wherein the validation comprises determining whether a set of multi-factor conditions is satisfied;

(i) when the set of multi-factor conditions is satisfied, transitioning, by a state machine enforced by the backend server, the assessment instance from an active state to a submitted state and recording the assessment response data as an accepted submission; and

(j) when the set of multi-factor conditions is not satisfied, maintaining the assessment instance in a non-submitted state and returning, to the client application, an indication of rejection or a request for further action.


### Claim 2 — System Claim

A behavioral signal capture and cognitive state inference system for secure validation of digital assessment submissions, comprising:

(a) a processor;

(b) a memory storing instructions that, when executed by the processor, cause the system to:

(i) instantiate an assessment interface on a client device incorporating an instrumented interaction layer configured to record user interaction events during a confirmation interaction, each interaction event comprising at minimum an event type, spatial coordinates, and a sub-millisecond timestamp;

(ii) receive a stream of timestamped interaction event data from the instrumented interaction layer;

(iii) process the stream through a feature extraction pipeline to produce a multi-dimensional behavioral feature representation encoding at least temporal rhythm features, spatial trajectory characteristics, and velocity profile metrics;

(iv) apply a trained behavioral inference model to the behavioral feature representation to determine a behavioral state classification indicative of at least one of: cognitive engagement level, response confidence, or assessment integrity;

(v) verify a cryptographic binding token that binds the assessment response data to the interaction event data, ensuring the response data was not modified after initiation of the confirmation interaction;

(vi) enforce a submission state machine requiring satisfaction of multi-factor conditions — comprising the behavioral state classification, device identity verification, session token validity, temporal policy compliance, and assessment completeness attestation — before transitioning an assessment instance from an active state to a submitted state; and

(vii) execute a response action corresponding to the validation outcome.


### Claim 3 — Cryptographic Answer-Gesture Binding (CAGE) Method

A method for cryptographic verification of assessment response integrity during a behavioral signal capture process, comprising:

(a) capturing, concurrent with a user's initiation of a confirmation interaction for submitting responses to one or more assessment items, a behavioral signal window comprising interaction events occurring within temporal proximity of the interaction initiation;

(b) computing a response hash from the assessment response data representing the user's current answer selections using a one-way cryptographic hash function;

(c) computing a behavioral attestation value from the behavioral signal window by applying a one-way function to a subset of the captured interaction events;

(d) generating a binding token comprising at least: the response hash, the behavioral attestation value, a session-unique nonce issued by a remote server prior to the confirmation interaction, and a monotonically increasing sequence number;

(e) cryptographically signing the binding token using a key derived from the session context;

(f) transmitting the signed binding token together with the assessment response data and the interaction signal data to the remote server;

(g) at the remote server, verifying the binding token by: (i) recomputing the response hash from the received assessment response data and comparing it to the response hash in the binding token; (ii) validating the nonce against a record of issued nonces and confirming it has not been previously consumed; and (iii) verifying the cryptographic signature; and

(h) rejecting the assessment submission when any verification in step (g) fails, thereby preventing post-interaction tampering with assessment response data, replay of previously submitted payloads, and submission of fabricated interaction signal data.

---

## Dependent Claims

### Signal Capture Claims (Claims 4–8)

**Claim 4.** The computer-implemented method of claim 1, wherein the behavioral signal processing module further extracts, from the interaction signal data, a velocity profile feature computed from the interaction path metric and the temporal metric, and wherein the cognitive state inference module utilizes the velocity profile feature to distinguish between deliberate interactions and accidental or automated interactions, the anomalous behavior likelihood indicator being increased when the velocity profile exceeds or falls below predefined thresholds.

**Claim 5.** The computer-implemented method of claim 1, wherein the behavioral signal processing module further extracts at least one of: (i) a path deviation metric indicating deviation of the interaction trajectory from a predefined nominal trajectory; (ii) a dwell-time metric indicating time spent in one or more subregions of the interaction region; and (iii) an interaction reversal metric indicating direction changes during the continuous confirmation interaction, and wherein the cognitive state inference module utilizes said metrics to infer a hesitancy indicator corresponding to a level of user hesitancy or reconsideration.

**Claim 6.** The computer-implemented method of claim 1, wherein the interaction signal data further comprises touch contact area measurements and estimated pressure values derived from said contact area, and wherein the behavioral signal processing module computes a pressure profile feature indicating variation in applied force during the confirmation interaction, and the cognitive state inference module utilizes the pressure profile feature as a cognitive load proxy.

**Claim 7.** The computer-implemented method of claim 1, wherein the interaction signal data further comprises accelerometer and gyroscope sensor data captured from the user device concurrent with the confirmation interaction, and wherein the behavioral signal processing module correlates said sensor data with the touch input data to detect hand tremor, device tilt, or postural shifts indicative of user stress or distraction.

**Claim 8.** The computer-implemented method of claim 1, wherein the behavioral signal processing module computes a jerk metric — the rate of change of acceleration of the pointer or touch input along the interaction trajectory — as a feature indicative of motor control smoothness, and wherein the cognitive state inference module utilizes the jerk metric to distinguish practiced from unpracticed interaction patterns.


### Feature Extraction and Inference Claims (Claims 9–13)

**Claim 9.** The computer-implemented method of claim 1, wherein the behavioral signal processing module applies a sliding window analysis to the interaction signal data to detect behavioral micropatterns including micro-pauses, velocity bursts, and directional oscillations occurring at sub-gesture granularity.

**Claim 10.** The computer-implemented method of claim 1, wherein the behavioral model is a machine-learned model trained using labeled interaction signal data from prior assessment sessions, the labels comprising ground-truth annotations of deliberate versus non-deliberate confirmations and levels of decision confidence, and wherein the cognitive state inference module updates the behavioral model over time using newly collected interaction signal data and validation results.

**Claim 11.** The computer-implemented method of claim 1, wherein the cognitive state inference module classifies the decision confidence indicator into discrete confidence levels comprising at least high confidence, moderate confidence, low confidence, and guessing, based on a combination of the velocity profile feature, the path deviation metric, and the temporal metric.

**Claim 12.** The computer-implemented method of claim 1, wherein the cognitive state inference module performs multi-signal fusion by combining gesture-derived behavioral features with assessment-context features comprising at least time-on-task per assessment item, number of answer changes per item, and item difficulty level, to generate a composite behavioral state classification.

**Claim 13.** The computer-implemented method of claim 1, wherein the cognitive state inference module compares the behavioral feature representation of the current confirmation interaction against a stored individual behavioral profile for the user to generate an identity consistency score, and wherein the anomalous behavior likelihood indicator is increased when the identity consistency score falls below a predefined threshold.


### Submission Control Embodiment Claims (Claims 14–16)

**Claim 14.** The computer-implemented method of claim 1, wherein the submission control rendered by the client application is implemented as a continuous movement control that requires the pointer or touch input to traverse the interaction region from a start zone to a completion zone, and wherein the behavioral signal processing module determines the interaction path metric based on a normalized distance between the start zone and the completion zone, and determines an endpoint status indicating whether the completion zone was reached.

**Claim 15.** The computer-implemented method of claim 14, wherein the submission validation module rejects assessment submissions in which the endpoint status indicates that the completion zone was not reached or in which the temporal metric indicates that the continuous confirmation interaction duration is outside of an acceptable time range, thereby preventing acceptance of incomplete or accidental confirmation interactions.

**Claim 16.** The computer-implemented method of claim 1, wherein the submission control is configurable to accept alternative confirmation interaction modalities including but not limited to: a continuous lateral traversal, a multi-point touch-and-hold pattern, or a draw-a-shape interaction, each modality generating interaction signal data processable by the behavioral signal processing module.


### State Machine and Security Claims (Claims 17–21)

**Claim 17.** The computer-implemented method of claim 1, wherein the backend server enforces a submission state machine in which each assessment instance is constrained to transition only from an active state to an intermediate confirming state upon receipt of the assessment submission payload, and only from the confirming state to the submitted state when the multi-factor conditions are satisfied, the submission validation module recording a failed validation outcome as a transition from the confirming state back to the active state with updated validation metadata.

**Claim 18.** The computer-implemented method of claim 1, wherein the session token is a cryptographic token issued by the backend server at assessment initiation, the session token being single-use for assessment submission, and wherein the submission validation module maintains a record of previously consumed session tokens and rejects assessment submissions associated with a session token that is recorded as previously consumed, thereby mitigating replay attacks.

**Claim 19.** The computer-implemented method of claim 1, wherein the assessment state data further comprises a timestamp of assessment start, a timestamp of the continuous confirmation interaction initiation, and a timestamp of receipt of the assessment submission payload at the backend server, and wherein the submission validation module verifies that the timestamps satisfy a temporal policy, including at least that the submission occurs within a permitted time window for the assessment instance.

**Claim 20.** The computer-implemented method of claim 3, wherein the binding token incorporates a reference to an immediately preceding binding token for the assessment session, forming a hash chain such that the integrity of the entire sequence of answer selections and confirmation interactions within the session is verifiable through a single chain-head verification, and wherein tampering with any element in the chain is detectable by the remote server.

**Claim 21.** The computer-implemented method of claim 3, wherein the session-unique nonce has a configurable time-to-live and the remote server rejects binding tokens containing nonces that have expired, and wherein a new nonce is issued to the client application only after the remote server verifies the assessment instance is in an active state and the user session is authenticated.


### Adaptive Output Claims (Claims 22–25)

**Claim 22.** The computer-implemented method of claim 1, wherein the one or more cognitive or behavioral state indicators are further utilized by an adaptive feedback module to modify at least one of: (i) a scoring weight applied to the assessment response data; (ii) selection of subsequent assessment items based on inferred cognitive state; or (iii) generation of post-assessment feedback indicating user decision confidence or potential integrity issues.

**Claim 23.** The computer-implemented method of claim 1, wherein the cognitive state inference module generates a real-time disengagement detection signal when the behavioral features indicate sustained low cognitive engagement, and wherein the client application renders an intervention prompt in response to the disengagement detection signal.

**Claim 24.** The computer-implemented method of claim 1, wherein the backend server generates an aggregate session behavioral summary comprising per-item confidence indicators, overall session behavioral consistency metrics, and integrity flag counts, and stores said summary as metadata associated with the assessment submission record for subsequent review by an assessment administrator.

**Claim 25.** The computer-implemented method of claim 1, wherein the system builds population-level behavioral models characterizing gesture interaction patterns associated with genuine cognitive engagement for specific assessment item types, and wherein the cognitive state inference module compares individual user behavioral features against said population-level models rather than or in addition to individual baseline profiles.


### Implementation Claims (Claims 26–28)

**Claim 26.** The computer-implemented method of claim 1, wherein the client application is implemented in a web application framework comprising React and Next.js, the continuous confirmation interaction being implemented as a component that captures high-frequency pointer or touch events and streams normalized interaction signal data to the backend server via an application programming interface, and wherein the backend server is implemented as one or more services comprising a PostgreSQL database layer for interaction trace persistence and a real-time feature extraction and inference pipeline.

**Claim 27.** The computer-implemented method of claim 1, wherein the behavioral signal processing module, the cognitive state inference module, and the submission validation module execute on a backend server accessible via a network, and wherein the client application operates on a mobile device with a touchscreen display, and the interaction signal data is captured from native touch events of the touchscreen.

**Claim 28.** The computer-implemented method of claim 1, wherein the client application transmits interaction signal data to the backend server in real time during the confirmation interaction via a streaming connection, enabling the behavioral signal processing module and the cognitive state inference module to begin feature extraction and inference before the confirmation interaction is complete.

---

## Prior Art & Inventive Step Strategy

### Prior Art Landscape — Five Patent Clusters

**Cluster 1: Behavioral Biometrics for Financial Fraud.** BioCatch holds 90+ filed and 70+ granted patents. Their foundational US8,938,787 B2 correlates touchscreen data with accelerometer data for "cognitive biometric signatures." US9,069,942 B2 introduces "invisible challenges" provoking measurable behavioral responses. US10,949,757 B2 detects users under duress via hesitation analysis. BehavioSec (now LexisNexis, US12,299,094 B2) covers context-aware behavioral scoring binned by data field, browser area, and task type. IBM's US7,389,917 B2 (now expired) describes adapting web content based on user mood inferred from behavioral biometrics. All operate in financial services or general identity verification — none address educational assessment or integrate cognitive state inference with assessment submission validation.

**Cluster 2: Educational Proctoring.** ProctorU's US11,205,349 B2 covers automated AI proctoring using cameras, microphones, and browser monitoring. Honorlock's US9,881,516 B1 patents honeypot question-seeding for cheating detection. ETS holds US11,630,896 B1 for keystroke dynamics fraud detection in essay assessments. Respondus patents weighted scoring for proctoring events. Every proctoring patent operates through external surveillance — cameras, microphones, screen recording, browser lockdown. None analyze behavioral characteristics of interactions within the assessment interface itself.

**Cluster 3: Gesture Authentication.** Apple's slide-to-unlock patent (expired), Microsoft's EP3100152A1 for gesture authentication, and "Touchalytics" continuous authentication research analyze gesture kinematics exclusively for the binary identity question. All target "is this the right user?" — none infer cognitive states, decision confidence, or assessment integrity from the same gesture data.

**Cluster 4: Adaptive Learning.** Knewton, ALEKS, and Pearson adapt assessments based on correctness, time-on-task, and error rates. Some record clickstream data but process it only as aggregate engagement metrics. No adaptive learning patent analyzes the behavioral kinematics of a specific interaction gesture.

**Cluster 5: Affective Computing.** "Motion as Emotion" research (2024) detected affect and cognitive load from VR gestures. Elsevier's US20210109607A1 (abandoned 2020) predicted user affect from "decision gestures" in general SaaS applications. Both are distinguishable — the former operates in VR, the latter was abandoned and used mouse-only input in non-educational contexts with no cryptographic binding or assessment state machine.


### Six White Spaces Confirming Novelty

**White Space 1 — Submission gesture as cognitive signal source.** No granted or pending patent uses a deliberate submission gesture to capture decision confidence signals in educational assessment. The closest art (Elsevier US20210109607A1) is abandoned and distinguishable on gesture type (mouse vs. touch), domain (SaaS vs. education), and technical implementation (no CAGE, no answer-state correlation, no adaptive educational response).

**White Space 2 — Cryptographic Answer-Gesture Binding (CAGE).** Zero prior art exists for cryptographically binding behavioral gesture telemetry to specific assessment answer states. Anti-replay nonce technology exists in financial transactions (Trusona US10,601,859), but no patent applies cryptographic binding to the combination of gesture behavioral data + assessment answer payload + temporal nonce + session state.

**White Space 3 — Deliberate (not passive) interaction as primary behavioral signal.** The entire behavioral biometrics field operates through passive background monitoring. This invention inverts the paradigm: a required deliberate gesture simultaneously serves as submission confirmation, behavioral biometric capture, cognitive state probe, and integrity attestation. This functional multiplexing of a single user action is novel.

**White Space 4 — Educational integrity via internal interaction analysis.** All proctoring patents achieve integrity through external surveillance. This invention achieves integrity assurance through analysis of interaction data native to the assessment UI — a privacy-preserving alternative capturing only gesture telemetry, not video, audio, or screen content.

**White Space 5 — Assessment submission state machine + behavioral attestation.** No patent combines an answer-completeness verification state machine with behavioral biometric analysis of the submission action, device identity verification, and cryptographic answer binding in a unified multi-factor validation framework.

**White Space 6 — Population-level behavioral modeling for education.** BioCatch builds individual user profiles for identity verification. This invention builds population-level behavioral models characterizing genuine cognitive engagement for specific assessment task types — a fundamentally different modeling paradigm targeting educational analytics rather than binary identity.


### Inventive Step Argument

The present invention addresses the technical problem of securely validating digital assessment submissions while capturing and interpreting behavioral and cognitive signals at the moment of submission, providing a technical solution that reduces accidental or automated submissions, improves the reliability of assessment acceptance decisions, and generates machine-interpretable behavioral metrics usable for adaptive scoring and feedback.

Existing gesture-based authentication and behavioral analytics systems capture swipe patterns and timing for user-specific identity templates in financial or device-access contexts. Existing proctoring systems use camera-based monitoring, environment analysis, or static identity verification. Neither category discloses a system that:

(a) Treats a continuous confirmation interaction within a digital assessment environment as a structured behavioral signal for inferring cognitive states such as decision confidence and hesitancy;

(b) Integrates such cognitive or behavioral state indicators into a multi-factor validation process that simultaneously evaluates device identity, session token integrity, assessment completeness, CAGE binding verification, and temporal policies before transitioning an assessment instance through a server-enforced state machine;

(c) Cryptographically binds assessment answers at or before initiation of the confirmation interaction to prevent post-interaction tampering while leveraging the same interaction signal data for behavioral inference; and

(d) Builds population-level behavioral models for educational assessment integrity rather than individual identity profiles for access control.

By defining a pipeline in which confirmation interaction data is transformed into behavioral features, input into a trained behavioral model to produce cognitive state indicators, cryptographically bound to answer state data, and integrated into a multi-factor validation framework with a server-enforced submission state machine and single-use session tokens, the invention achieves a technical effect not rendered obvious by combining existing gesture authentication, proctoring, or adaptive learning solutions.


### IPOPHL Prosecution Strategy — Overcoming Section 22

IPOPHL examinations follow the EPO's COMVIK approach via the 2018 ICT/CII Examination Guidelines and 2022 Revised IRR (Rule 201(c)). Under this framework, non-technical features (educational assessment logic, scoring rules) are treated as constraints given to the skilled person, while only technical features count toward inventive step. Five arguments should be prepared for office actions:

**Argument 1 — Technical signal processing pipeline.** Sub-millisecond interaction event capture, multi-dimensional feature vector extraction, and trained ML model application constitute a "further technical effect" beyond standard computing operations per EPO Guidelines G-VII, 5.4.

**Argument 2 — Cryptographic integrity mechanism.** CAGE creates tamper-evident hash chains binding behavioral telemetry to assessment data states with server-issued nonce freshness — a concrete information security technique, not an abstract business rule.

**Argument 3 — Real-time adaptive system control.** The inference engine output modifies system behavior in real time (adjusting assessment content, triggering verification protocols). Per the 2018 ICT/CII Guidelines, technical features that "address a specific problem to a material extent" establish patentability.

**Argument 4 — Privacy-enhancing technical architecture.** The system achieves assessment integrity without cameras, microphones, or surveillance — solving the technical problem of integrity assurance under privacy constraints through a novel signal capture architecture.

**Argument 5 — Improvement to computer functionality.** The instrumented interaction layer transforms a standard UI element into a multi-purpose sensor, improving how the computing device captures and processes behavioral data — the type of improvement that survives eligibility challenges under EPO and comparable frameworks.


### Proactive Prior Art Distinction

The specification should proactively distinguish the following:

| Prior Art | Domain | This Invention Differs Because |
|-----------|--------|-------------------------------|
| BioCatch US8,938,787 B2 | Financial biometrics | BioCatch targets binary identity verification in banking; this targets cognitive state inference in education with CAGE binding |
| BioCatch US9,069,942 B2 | Invisible challenges | BioCatch deliberately perturbs the UI to provoke responses; this analyzes a required natural interaction without perturbation |
| Elsevier US20210109607A1 | SaaS affect prediction | Abandoned; mouse-only; no educational context; no cryptographic binding; no state machine |
| ProctorU US11,205,349 B2 | Camera-based proctoring | External surveillance approach; no in-interface behavioral analysis |
| Trusona US10,601,859 | Anti-replay authentication | General authentication nonce; not combined with behavioral gesture data or assessment answer binding |
| ETS US11,630,896 B1 | Essay fraud detection | Keystroke dynamics for essays; no gesture-based submission analysis or multi-factor state machine |

---

## Filing Strategy and GPPB Pathway

### IPOPHL Filing Requirements

- File electronically via IPOPHL's eInventionFile portal
- Required documents: specification with description, claims, abstract, and drawings (system architecture flowcharts, state machine diagrams, CAGE protocol sequence diagram, gesture telemetry feature visualization)
- Base filing fee: PHP 1,737.20 (small entity rate); excess claim fees apply beyond 5 claims
- Request substantive examination within 6 months of publication (publication occurs 18 months post-filing)
- Typical prosecution timeline: 2–5 years to grant
- Patent term: 20 years from filing date

### Specification Requirements per 2025 AI Guidelines

- Detailed description of behavioral model architecture, training parameters, training data characteristics, and relationship between input telemetry and output classifications
- At least one worked example with quantitative data (e.g., correlation between gesture velocity variance and self-reported answer confidence)
- CAGE protocol described with specific hash functions (SHA-256 or equivalent) and data structures
- Avoidance of vague terms ("AI module") — all components must be technically specified

### GPPB Resolution No. 04-2026 Activation

Once a patent application is filed with IPOPHL (filing receipt alone is sufficient — grant is not required), SlateCamp qualifies for direct government procurement under the STI pathway:

- **Eligible as:** Qualified Startup Business (duly registered, 1–5 years operation, MSME, commercializing IP rights)
- **IP proof required:** Proof of application with IPOPHL (filing receipt)
- **Target procuring entities:** PRC (administers ALE), CHED, DepEd, DICT, DOST, state universities and colleges
- **Procurement timeline:** As fast as 30 calendar days from submission to contract
- **Critical IP ownership clause:** Section 7.1 defaults IP ownership to the Procuring Entity for commissioned work — always negotiate explicit IP retention clauses before signing

### International Strategy

- File IPOPHL first to establish priority date
- Within 12 months, consider PCT filing for broader international protection
- Leverage ASEAN Patent Examination Cooperation (ASPEC) for regional coverage
- IPOPHL serves as International Searching Authority and International Preliminary Examining Authority under PCT

### Recommended Claim Count

Target 28–30 total claims (3 independent, 25–27 dependent). This provides:
- Broad method protection (Claim 1)
- System-level apparatus protection (Claim 2)
- CAGE-specific method protection (Claim 3 — strongest novel element, zero prior art)
- Granular dependent coverage across signal capture, feature extraction, inference, security, adaptive output, and implementation layers

---

## Summary of Inventive Contribution

The invention occupies a genuinely novel position at the intersection of five existing but previously uncombined technology domains: behavioral biometrics, educational assessment, cryptographic integrity, adaptive learning, and affective computing. The CAGE mechanism represents the strongest novel element with zero identifiable prior art. The deliberate-interaction paradigm — using a required gesture as the primary behavioral signal source rather than passive background monitoring — inverts the foundational assumption of the entire behavioral biometrics field. The multi-factor validation framework integrating behavioral state indicators, cryptographic answer binding, device identity, session tokens, temporal policies, and a server-enforced state machine has no counterpart in either the proctoring or the gesture authentication patent landscape. The deliberate avoidance of claiming any abstract UI aesthetic and the focus on the technical processing pipeline — signal capture, behavioral feature extraction, cognitive state inference, cryptographic binding, and stateful backend validation — aligns with IPOPHL's technical problem–technical solution framework and positions the application for favorable prosecution.
