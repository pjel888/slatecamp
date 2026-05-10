# SME Council Review Memo — Remaining Exemplar Risks

**Reviewer:** Senior Philippine LEA/ALE SME (acting per Philip's calibration request)
**Date:** 2026-05-09
**Scope:** Read-only review of 9 exemplar packs at `.ai/03_plans/2026-05-09-content-excellence-gold-standard-exemplars/`
**Status request:** Final calibration verdicts + direct-publication hold guidance

---

## 1. OCR / text-extraction approvals

All three previously `NOT_FOUND_BY_TEXT` claims are **APPROVED** as `FOUND_VERBATIM` / `SUPPORTED` for calibration based on the rendered-page evidence, with the corrections noted below.

| Claim | OCR verdict | Required wording / locator fix before promote |
|---|---|---|
| `npcp-c1` | **APPROVE** as FOUND_VERBATIM | Rewrite claim text. Source says: *"One fixture unit is equivalent to a rate of flow at 28.3 liters per minute (1 cu. ft./minute)."* The current ledger phrase *"28.3 liters per minute **or** 1 cubic foot per minute"* misstates the relationship — the parenthetical is an equivalence, not an alternative. Replace `or` with `(equivalent to)` or `(≈)`. Also add the section/item number from the rendered evidence (visible header marker "207.8 FIXTURE UNIT") so the locator reads *Section 207 — Definitions, Item 8 (Fixture Unit), PDF p.24*, not just *"Definitions / Fixture Unit"*. |
| `npcp-c2` | **APPROVE** as FOUND_VERBATIM | Claim is faithful to 311.4 sentence 1. Two enrichments required for exam value: (a) cite the named exceptions explicitly — *"except as provided in Sections 812, 813 and 814"* — because the exam trap is precisely those exceptions; (b) note the second prohibition in 311.4 that the current claim drops: *"single drainage and venting systems with unvented branch lines are prohibited."* Either include it or scope the claim to "Section 311.4, first sentence." |
| `vitruvius-c1` | **APPROVE** as FOUND_VERBATIM | Claim is correct (Order, Arrangement, Eurythmy, Symmetry, Propriety, Economy). **Mandatory fix before calibration:** declare the translation/edition in the source ledger and citation. Rendered text indicates the **Morris Hicky Morgan (Harvard, 1914) English translation**. Without an explicit edition declaration the claim is not safely citable as theory truth, because Vitruvian principle wording differs across translations. |

---

## 2. Per-pack verdicts

| # | Pack | Verdict | Direct-publication hold |
|---|---|---|---|
| 01 | bp344-accessible-ramp-geometry | **PASS_WITH_FIXES** | HOLD |
| 02 | ra9266-foreign-architect-temporary-permit | **PASS_FOR_CALIBRATION** | HOLD |
| 03 | ra9514-means-of-egress-width-and-count | **PASS_FOR_CALIBRATION** | HOLD |
| 04 | npcp-fixture-unit-and-venting | **PASS_WITH_FIXES** | HOLD |
| 05 | vitruvius-principles-and-departments | **PASS_WITH_FIXES** | HOLD |
| 06 | pd1096-tgfa-ambf-location-controls | **PASS_WITH_FIXES** | HOLD |
| 07 | bp220-parks-playgrounds-road-pavement | **PASS_FOR_CALIBRATION** | HOLD |
| 08 | pd957-license-to-sell-registration-gate | **PASS_FOR_CALIBRATION** | HOLD |
| 09 | uap-spp201-pre-design-and-service-boundaries | **PASS_WITH_FIXES** | HOLD |

**All packs remain `HOLD_FOR_DIRECT_PUBLICATION`.** LLM-acting SME review is acceptable for *calibration* of the roundtrip pipeline but is **not** sufficient for student-facing publication. A licensed-architect human SME must clear each pack before it leaves the calibration corpus.

---

## 3. Required fixes by pack

### 01 — BP 344 Accessible Ramp Geometry — PASS_WITH_FIXES
- **`bp344-ramp-c1` wording risk.** Claim says *"general gradient not steeper than 1:20."* BP 344 IRR Appendix A actually permits gradients up to **1:12** for accessible ramps, with 1:20 serving as the *preferred / minimum-difficulty* gradient and the slope/length matrix in Table A.1.1 governing longer runs. Reword as *"the preferred (general) gradient should not be steeper than 1:20; the absolute maximum is 1:12 per Table A.1.1"* — otherwise students will be miscalibrated on the most common BP 344 trap question.
- **`bp344-ramp-c2` row check.** Confirm against Table A.1.1 verbatim before calibration: the current ledger says *1:15 → 10.50 m max length, 700 mm max rise, 10 m landing interval*. The 700 mm rise math (10.50 m / 15) checks; the *10 m* landing interval should be re-verified — Appendix A Item 10 typically states *"every 10.50 m or every 700 mm rise, whichever is shorter,"* not a flat 10 m.
- **`bp344-ramp-c4` handrails.** The 900 mm / 700 mm dual-height pair is correct (adult/child). Citation should also state the **170 mm change-in-grade trigger** is *cumulative rise*, not a single step.
- Resolve `local_webpage_pdf_vs_official_download_pdf_hash_mismatch` before direct publication.

### 02 — RA 9266 Foreign Architect Temporary Permit — PASS_FOR_CALIBRATION
- Claim wording is faithful to RA 9266 IRR Section 38 (Coverage of Temporary/Special Permit). Acceptable for calibration because (a) hash matches the approved source pack, (b) content conflict is null, (c) `authority_host_unverified` is a *provenance* concern, not a truth concern.
- **Fix before direct publication:** verify the host of record (PRC vs. Lawphil vs. UAP archive) and re-stamp `authority_host_verified`. Until then, no student-facing serve.

### 03 — RA 9514 Means of Egress — PASS_FOR_CALIBRATION
- Section 10.2.5.2(F) → 915 mm general egress width: correct.
- Section 10.2.5.2(G) → 2 / 3 / 4 thresholds at ≤500, >500–1000, >1000: correct (this is the standard NFPA 101-aligned ladder adopted in the 2008 RA 9514 IRR).
- Section 10.2.5.11 → 10.7 lux illumination: correct (≈1 foot-candle).
- **Direct-publication blocker:** pack flag `OFFICIAL_BLOCKED_LOCAL_RAW_USED + prior source-pack integrity issue requires quarantine/rebuild`. This is a **provenance defect, not a content defect**. Quarantine + rebuild the source pack against an unblocked authoritative copy (BFP repository, Official Gazette, or Lawphil) before publishing.

### 04 — NPCP Fixture Unit and Venting — PASS_WITH_FIXES
- See OCR section above for `c1` and `c2` corrections.
- **Edition reconciliation is the gating issue.** "Revised National Plumbing Code of the Philippines" has multiple printings (1999 with errata; reprints by NAMPAP). The claim ledger must declare the edition year and printing of the local PDF (SHA `c4ec…3f5d`) before direct publication; calibration is fine.

### 05 — Vitruvius Principles and Departments — PASS_WITH_FIXES
- Approve `c1` per OCR section. Approve `c2` (three departments: building, dialling/time-pieces, mechanics) — verbatim in p.36.
- **Translation declaration is mandatory** in the source-ledger and in any student-facing surface. Use *"Vitruvius, The Ten Books on Architecture, trans. Morris Hicky Morgan, Harvard University Press, 1914,"* or whatever the SHA `e63f…e020` PDF actually is on its title page. Without this, theory claims are not citable to a specific text.
- Pedagogical note for calibration acceptance: LEA HOA category sometimes asks "six principles" using the Greek-derived list (Taxis/Order, Diathesis/Arrangement, Eurythmia, Symmetria, Decor/Propriety, Oikonomia/Economy). Citing Greek terms parenthetically (already partly visible in the rendered text) is recommended, not optional, for an exemplar pack.

### 06 — PD 1096 TGFA / AMBF / Location Controls — PASS_WITH_FIXES
- **Critical naming fix.** The claim ledger references `source-pack-pd-1096-rirr`, but the canonical source pack and the official 2004 issuance are titled **IRR**, not RIRR. PD 1096 (1977) has only one IRR (the 2004 IRR by DPWH); there is no "Revised IRR." Rename ledger reference to `source-pack-pd-1096-irr` to match the actual pack and to avoid teaching students a non-existent document name.
- **Section-number verification required.**
  - `pd1096-c1` — *"adjoins or has direct access to a public space, yard, or street"* is the language of **Section 704 (Location on Property)**. Verify whether the locator should read *Section 704 of the Code* and whether Rule VII of the IRR uses the same number; in the 2004 IRR the corresponding rule is Rule VII (Classification and General Requirements), and Section 704 of the Code is reproduced there.
  - `pd1096-c2` — *"eaves over required windows ≥ 750 mm from side and rear property lines"* is from Section **708 (Minimum Requirements for Group A Dwellings)** / Rule VIII (Light and Ventilation), **not** Rule VII Section 704. **This is a citation error and must be corrected before calibration sign-off.** A wrong section number on a dimensional claim is exactly the failure mode CONTENT_EXCELLENCE_GOAL §1 forbids.
  - `pd1096-c3` — AMTGFA controls live in **Rule VII Section 705 (Allowable Maximum Total Gross Floor Area / Site Occupancy / Setbacks)** of the 2004 IRR. Verify the 705 designation matches the local PDF and add the table reference (TGFA tables are in the IRR's Tables VII.1 / VII.2 family).
  - `pd1096-c4` — AMBF as a **footprint/PSO control** (not a firewall control directly) is the more accurate framing. AMBF interacts with firewalls because PSO can increase when a wall becomes a firewall, but AMBF itself is a footprint instrument. Reword to *"AMBF is a footprint/PSO control, distinct from TGFA/FLAR; firewalls modify the PSO ceiling under specific Rule VIII conditions."*
- Local-vs-official hash mismatch must be reconciled with the DPWH 2004 IRR PDF before direct publication.

### 07 — BP 220 Parks/Playgrounds/Road Pavement — PASS_FOR_CALIBRATION
- All four claims map cleanly to BP 220 Rule II (Standards and Requirements). The basic-needs descending order, the 3.5% bracket at ≤150 d.u./ha, the 100 m² floor on parks/playgrounds, and the asphalt-50 mm / concrete-150 mm @ 20.7 MPa (≈ 3000 psi) values are all consistent with the codified text.
- Optional enhancement (not blocking): `bp220-c2` should clarify that 3.5% applies **per the density bracket row**; brackets above 150 d.u./ha shift the percentage. Current wording is technically scoped correctly but a learner could over-generalize.

### 08 — PD 957 License to Sell — PASS_FOR_CALIBRATION
- **Verify Rule/Section numbering.** PD 957's License to Sell rests in **Section 5 of the Decree itself**. The HLURB-now-DHSUD IRR re-organizes this under various rules. The claim ledger uses *"Rule IV / Section 11"*; this needs to be cross-checked against the specific IRR edition in the local PDF (HLURB Board Res. No. 922-2010 or the 1990s IRR) so students cite the right instrument. Calibration acceptable; direct publication blocked until the IRR edition is declared.
- "Within two weeks from registration" — verify whether the source uses *"two weeks"* or *"fifteen (15) days"*; both phrasings appear in PD 957-related issuances and one is exam-precise.

### 09 — UAP SPP 201 + Document 401-402 — PASS_WITH_FIXES
- `uap-c1`, `uap-c2`, `uap-c3` are faithful to SPP 201 / SPP 202 boundaries and are exam-aligned.
- **`uap-c4` is the most concerning claim in the entire packet.** The claim states: *"Contract Documents Phase equals 85% of the work, with remaining 15% split between Article 1723 liability and construction-phase service."* This formulation is not how UAP allocates fees and risks teaching students an incorrect rule.
  - The standard UAP fee allocation across the six Regular Design phases (Project Definition / Schematic Design / Design Development / Contract Documents / Bidding & Negotiation / Construction Phase) sums to 100% across all phases, not to 85% at Contract Documents.
  - The "85%" figure most plausibly refers to **cumulative completion of the architect's regular design services through and including the Contract Documents Phase**, leaving **15% for Bidding/Negotiation + Construction Phase Services + Post-Construction Services**.
  - **Article 1723 of the Civil Code** is the **15-year structural liability** rule for engineers/architects/contractors and is **not** a fee-allocation bucket. Conflating the 15% post-CD service share with Article 1723 in the same sentence is a category error that an LEA examiner could specifically penalize.
  - **Required fix before calibration acceptance:** rewrite to two separate claims, e.g., *(a) "Through the Contract Documents Phase, the architect has completed approximately 85% of Regular Design Services per UAP allocation; the remaining 15% covers Bidding/Negotiation and Construction Phase Services."* and *(b) "Article 1723 of the Civil Code imposes a 15-year liability on architects, engineers, and contractors for total or partial collapse of the structure due to defects in plans, materials, or supervision — independent of fee allocation."* Cite the page locators separately. Until this is done, **do not promote `uap-c4` to SUPPORTED.**

---

## 4. Council disagreement-worthy concerns

1. **Direct-publication eligibility under LLM SME review.** I dissent from any reading that LLM SME approval (mine or another model's) clears direct publication. PRC-level accuracy claims — section numbers, dimensional values, professional-fee allocations, foreign-practice rules — must be cleared by a **licensed Philippine architect** before being served to a candidate paying for board-exam preparation. The CONTENT_EXCELLENCE_GOAL §1 standard ("trusted by a licensed architect staking their PRC registration on its accuracy") is not satisfied by an LLM signature. Recommend: **all 9 packs remain `HOLD_FOR_DIRECT_PUBLICATION` until human SME sign-off, regardless of calibration verdict.**
2. **Pack 06 (`pd1096-c2`) is a probable mis-cited section.** Eaves-to-property-line minimums live in PD 1096 / 2004 IRR's Light and Ventilation rule, not Rule VII Section 704. If the rendered PDF actually shows the value at Section 704 page 81, that is a strong signal the locator metadata is mis-tagged and the page number maps to a different rule in the local PDF — needs a fresh visual-page check before calibration acceptance, not after.
3. **Pack 09 (`uap-c4`) is the highest single-claim risk in the packet.** The 85/15 + Article 1723 framing is not just imprecise; it would actively miscalibrate students on two distinct UAP/Civil-Code topics. I would `BLOCK` this single claim pending rewrite even while approving the rest of pack 09.
4. **Pack 01 (`bp344-ramp-c1`) "general gradient 1:20" wording.** Defensible if the ledger is honest about *general/preferred*, but dangerous if a student internalizes 1:20 as the legal maximum. BP 344's *legal* maximum for accessible ramps is 1:12; the slope/length matrix governs everything between.
5. **Pack 03 (`ra9514`) source-pack rebuild is non-optional.** "Prior source-pack integrity issue requires quarantine/rebuild" is a publication blocker, not a paperwork item. I support calibration use *only* under explicit calibration-corpus quarantine flags so the artifacts cannot leak into student-facing surfaces by accident.

---

## 5. Net direction for Hermes

- Promote `npcp-c1`, `npcp-c2`, `vitruvius-c1` to `FOUND_VERBATIM` / `SUPPORTED` after applying the wording/locator/edition fixes in §1.
- Apply the per-pack fixes in §3 before stamping any pack `PASS_FOR_CALIBRATION` final.
- Keep all 9 packs at `HOLD_FOR_DIRECT_PUBLICATION` until human licensed-architect SME clearance, source-pack integrity rebuilds (RA 9514 especially), authority-host verification (RA 9266), edition declarations (NPCP, Vitruvius), and PD 1096 IRR naming + section reconciliation are complete.
- Treat `uap-c4` as the priority single-claim correction in the entire packet.
