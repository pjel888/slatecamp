#!/usr/bin/env python3
"""
PASS 2-5 Processor for Professional Practice Law Articles - v2.

Processes articles by adding wiki UI components DIRECTLY to normalized.md
and updating ui-blocks.json accordingly.
"""

import json
import hashlib
import os
import re
import sys

BASE = "/Users/philiplewis/slatecamp/.ai/content-audit-export/articles"

# All 18 articles to process
ARTICLES = [
    ("lea-prac-law-002-scope-of-practice-what-architecture-covers-and-what-it-does-not--7e511a5d-edb1-4622-8f0f-29c1a631c145", "7e511a5d-edb1-4622-8f0f-29c1a631c145", "LEA-PRAC-LAW-002"),
    ("lea-prac-law-006-prc-vs-prboa-distinct-roles-authority-and-the-appeals-chain--3a66b00c-20a4-4577-8359-b956a93d7c50", "3a66b00c-20a4-4577-8359-b956a93d7c50", "LEA-PRAC-LAW-006"),
    ("lea-prac-law-007-lea-eligibility-requirements-academic-credentials-dae-and-moral-character--9527e4a9-f8f1-4554-999e-0d46cc49bcd1", "9527e4a9-f8f1-4554-999e-0d46cc49bcd1", "LEA-PRAC-LAW-007"),
    ("lea-prac-law-008-lea-structure-subjects-areas-passing-standard-and-retaking--63ba5964-80fc-472c-bc26-7d64f1507bed", "63ba5964-80fc-472c-bc26-7d64f1507bed", "LEA-PRAC-LAW-008"),
    ("lea-prac-law-009-certificate-of-registration-oath-taking-and-the-professional-id-card--9ce707aa-5e91-4f79-a5a6-8bcdf582fa57", "9ce707aa-5e91-4f79-a5a6-8bcdf582fa57", "LEA-PRAC-LAW-009"),
    ("lea-prac-law-010-civil-code-article-1723-the-15-year-liability-framework--6dc813a9-913d-47b5-9203-f59e8e909869", "6dc813a9-913d-47b5-9203-f59e8e909869", "LEA-PRAC-LAW-010"),
    ("lea-prac-law-011-architect-of-record-vs-architect-in-charge-of-construction-liability-and-accountabi--17b95df0-6bea-43c6-ab03-2b82a358caa6", "17b95df0-6bea-43c6-ab03-2b82a358caa6", "LEA-PRAC-LAW-011"),
    ("lea-prac-law-012-quasi-delict-and-tort-in-architectural-practice-civil-code-articles-2176-2194--82862aca-27a6-4121-ba3f-6d53160d2e3c", "82862aca-27a6-4121-ba3f-6d53160d2e3c", "LEA-PRAC-LAW-012"),
    ("lea-prac-law-013-ownership-of-architectural-plans-ra-9266-section-33-and-client-rights--76b6cfd5-d416-4c6d-8a90-76a2d2b91774", "76b6cfd5-d416-4c6d-8a90-76a2d2b91774", "LEA-PRAC-LAW-013"),
    ("lea-prac-law-014-intellectual-property-code-ra-8293-applied-to-architectural-works--6ec9b40c-a495-4a7a-8c51-bd0857fe69b4", "6ec9b40c-a495-4a7a-8c51-bd0857fe69b4", "LEA-PRAC-LAW-014"),
    ("lea-prac-law-015-copyright-duration-transfer-moral-rights-and-infringement-remedies--2e78ff36-673b-4de5-b01d-9cdc6bf31589", "2e78ff36-673b-4de5-b01d-9cdc6bf31589", "LEA-PRAC-LAW-015"),
    ("lea-prac-law-016-the-contract-document-package-who-draws-and-who-signs-each-component--f7691e1a-81f3-4a93-aef2-6ae6426100a2", "f7691e1a-81f3-4a93-aef2-6ae6426100a2", "LEA-PRAC-LAW-016"),
    ("lea-prac-law-017-the-signing-sealing-prohibition-direct-supervision-delegation-and-disciplinary-expo--16e972e5-378d-426c-9269-d716204c52de", "16e972e5-378d-426c-9269-d716204c52de", "LEA-PRAC-LAW-017"),
    ("lea-prac-frm-012-ra-9184-government-procurement-reform-act-architecture-relevant-provisions--8e546a58-36c2-4cd3-8340-2cb9d1189b13", "8e546a58-36c2-4cd3-8340-2cb9d1189b13", "LEA-PRAC-FRM-012"),
    ("lea-prac-frm-013-coa-audit-compliance-for-publicly-funded-architectural-projects--9c859ffb-8b3a-4feb-b484-6700d3867e5c", "9c859ffb-8b3a-4feb-b484-6700d3867e5c", "LEA-PRAC-FRM-013"),
    ("lea-prac-frm-015-data-privacy-act-ra-10173-the-architect-s-obligations-when-handling-client-informat--bd7ee04d-e6a5-4f77-a2a7-8a9dc6ddd5f4", "bd7ee04d-e6a5-4f77-a2a7-8a9dc6ddd5f4", "LEA-PRAC-FRM-015"),
    ("lea-prac-frm-016-berde-rating-system-philippine-green-building-standard-and-the-architect-s-role--9261cc17-24c1-49d2-a45a-158032f6fcd3", "9261cc17-24c1-49d2-a45a-158032f6fcd3", "LEA-PRAC-FRM-016"),
    ("lea-prac-frm-017-environmental-laws-affecting-architectural-practice-eia-denr-regulations-and-dao-20--e61e81a9-c0e3-4e60-ab5e-6b3fe3026004", "e61e81a9-c0e3-4e60-ab5e-6b3fe3026004", "LEA-PRAC-FRM-017"),
]


def sha256_file(content: str) -> str:
    return hashlib.sha256(content.encode('utf-8')).hexdigest()


def read_file(path):
    try:
        with open(path, 'r', encoding='utf-8') as f:
            return f.read()
    except FileNotFoundError:
        return None


def write_file(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)


def process_article(dirname, article_id, lea_id):
    article_dir = os.path.join(BASE, dirname)
    print(f"\n{'='*60}")
    print(f"Processing: {lea_id} — {dirname[:60]}...")
    
    norm_path = os.path.join(article_dir, "normalized.md")
    ui_blocks_path = os.path.join(article_dir, "ui-blocks.json")
    
    normalized = read_file(norm_path)
    if normalized is None:
        print(f"  ERROR: normalized.md not found")
        return False
    
    ui_blocks_raw = read_file(ui_blocks_path)
    if ui_blocks_raw is None:
        ui_blocks = {
            "article_id": article_id,
            "slug": dirname.split("--")[0],
            "normalized_created_at": "2026-05-01T13:33:44.000Z",
            "parser_version": "ui-block-parser-v1",
            "original_content_hash": f"sha256:{sha256_file(normalized)}",
            "normalized_content_hash": f"sha256:{sha256_file(normalized)}",
            "ui_block_count": 0,
            "total_blocks": 0,
            "blocks": [],
            "unknown_blocks": [],
            "unresolved_critical_blocks": [],
            "ui_blocks_hash": "sha256:4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945"
        }
    else:
        ui_blocks = json.loads(ui_blocks_raw)
    
    existing_blocks = ui_blocks.get("blocks", [])
    next_id = 1
    for b in existing_blocks:
        bid = b.get("block_id", "")
        m = re.match(r'ui_(\d+)', bid)
        if m:
            next_id = max(next_id, int(m.group(1)) + 1)
    
    modified = False
    
    # ============================
    # FIX 1: Article-specific corrections
    # ============================
    
    # LEA-PRAC-LAW-015: Fix doubled text errors
    if lea_id == "LEA-PRAC-LAW-015":
        fixes = []
        if "RUnder RA 8293 as amended by RA 10372" in normalized:
            normalized = normalized.replace("RUnder RA 8293 as amended by RA 10372", "Under RA 8293 as amended by RA 10372")
            fixes.append("Fixed 'RUnder' -> 'Under'")
        if "Sec. 213.4).Sec. 213.4)" in normalized:
            normalized = normalized.replace("Sec. 213.4).Sec. 213.4)", "Sec. 213.4).")
            fixes.append("Fixed doubled citation")
        if "annelead" in normalized:
            normalized = normalized.replace("annelead", "annealed")
            fixes.append("Fixed typo 'annelead' -> 'annealed'")
        if fixes:
            modified = True
            print(f"  FIXES: {'; '.join(fixes)}")
    
    # LEA-PRAC-LAW-010: Fix JSX.Frontless -> AuthorityContent
    if lea_id == "LEA-PRAC-LAW-010":
        if 'component="JSX.Frontless"' in normalized:
            normalized = normalized.replace(
                'component="JSX.Frontless"',
                'component="AuthorityContent"'
            )
            # Also fix the raw in ui_blocks
            for block in existing_blocks:
                if block.get("component_name") == "JSX.Frontless":
                    block["component_name"] = "AuthorityContent"
                    block["raw"] = '<AuthorityContent courseId="LEA-PRAC-LAW-010" />'
            modified = True
            print(f"  FIX: Replaced JSX.Frontless with AuthorityContent")
    
    # LEA-PRAC-LAW-013, 014, 015: Add specific Learning Goals (replace generic)
    generic_goal = "After reading this article, you should understand the key concepts tested in the ALE for this topic, including relevant code provisions, dimensional standards, and common exam applications."
    
    specific_goals = {
        "LEA-PRAC-LAW-013": "After reading this article, you should be able to explain the architect's copyright ownership of plans and contract documents under RA 9266 Section 33, distinguish between the architect's ownership and the client's project-specific license, and identify the remedies available when plans are duplicated without consent.",
        "LEA-PRAC-LAW-014": "After reading this article, you should be able to describe how RA 8293 (IP Code) protects architectural works as copyrightable creations, distinguish between copyright protection for creative expression versus functional building elements, and explain the relationship between RA 9266 Section 33 and RA 8293.",
        "LEA-PRAC-LAW-015": "After reading this article, you should be able to calculate copyright duration for architectural works under RA 8293, distinguish between assignment and licensing of copyright, explain the inalienability of moral rights, and identify the civil and criminal remedies for copyright infringement.",
    }
    
    if lea_id in specific_goals:
        if generic_goal in normalized:
            normalized = normalized.replace(generic_goal, specific_goals[lea_id])
            modified = True
            print(f"  FIX: Replaced generic Learning Goal with specific goal")
    
    # ============================
    # FIX 2: Add 2-4 wiki UI components
    # ============================
    
    # Define components to add based on lea_id
    # Each entry: (component_name, jsx_opening, jsx_closing_or_props, children_text)
    # We'll use SLATECAMP_UI_BLOCK format for normalized.md for consistency
    
    comps_config = {
        "LEA-PRAC-LAW-002": [
            ("LawCallout", 'code="ra9266" title="RA 9266 Section 3 — Ten Categories of Architectural Scope"', "Legal Basis: RA 9266 (Architecture Act of 2004), Section 3, which enumerates ten (10) categories of architectural service from planning and design through emerging practices and specialized services."),
            ("Tip", None, "The IRR enumeration identifies 9 primary service categories (a through i), with a tenth catch-all provision (j). Memorize the sequence: Planning & Design, Consultation, Schematic through CA, Feasibility Studies, Documents/Estimates, Construction Management, Interior/Systems, Programming/Conservation, Coordinating Works, and Emerging Practices."),
            ("Warn", None, "Common exam trap: confusing 'structural conceptualization' (architect scope — conceiving structural elements and their arrangement) with 'structural design documents' (engineer scope — calculations and signed/sealed structural plans). Architects lead structural thinking; engineers own structural accountability."),
            ("ExamTip", None, "Section 3 of RA 9266 defines what architects MAY do broadly. But each engagement requires a written service agreement specifically defining what the architect WILL do for that client. Broad statutory scope + specific contractual scope = the two-tier boundary system tested on the LEA."),
        ],
        "LEA-PRAC-LAW-006": [
            ("ExamTip", None, "The three-tier appeal path is: Board (first instance) → Commission (appeal) → Court of Appeals (judicial review). The Commission reviews for legal error, abuse of discretion, or insufficient evidence — it does NOT retry the case. The Court applies the arbitrary-and-capricious standard."),
            ("Note", None, "The IAPOA (now UAP) is the Integrated and Accredited Professional Organization under RA 9266 Section 41, distinct from both the PRC and PRBoA. It nominates PRBoA members and provides CPD input but is a self-regulatory body, not a government agency."),
        ],
        "LEA-PRAC-LAW-007": [
            ("ExamTip", None, "The four LEA eligibility requirements (C-A-A-E): Citizenship (Filipino), Age (21+ at exam time), Academics (B.S. Arch from CHED-recognized school), Experience (DAE — minimum 2 years or 3,840 hours)."),
            ("Note", None, "The DAE requirement is reduced by 1 year for Master's degree holders in Architecture. The reduction applies only to Master's degrees from CHED-recognized institutions. A Master's in a non-architectural field does NOT qualify for the reduction."),
        ],
        "LEA-PRAC-LAW-008": [
            ("LawCallout", 'code="ra9266" title="RA 9266 Sections 16-17 — LEA Structure and Passing Standards"', "Legal Basis: RA 9266 (Architecture Act of 2004), Sections 16 (Examination Scope) and 17 (Rating and Re-examination). The LEA covers subject areas prescribed by the Board with PRC approval."),
            ("Warn", None, "CRITICAL: The 50% floor applies INDIVIDUALLY to each subject area, not as an average. A candidate scoring 80% in four subjects but 45% in one subject FAILS, even if the overall average exceeds 70%. Both conditions must be met: (1) General weighted average ≥ 70%, AND (2) No grade below 50% in any subject."),
            ("ExamTip", None, "Retake rule: No limit on retakes. Each retake requires a new application and full payment of examination fees. Candidates who fail may retake in the next scheduled examination."),
            ("Tip", None, "The six LEA subject areas under RA 9266 Section 16 cover: History & Theory, Materials & Methods, Structural Systems, Utilities, Design & Planning, and Professional Practice. Know the weight distribution for exam preparation."),
        ],
        "LEA-PRAC-LAW-009": [
            ("Warn", None, "Key distinction: Certificate of Registration = indefinite validity (one-time issuance after passing LEA and taking oath). Professional ID Card = renewed every 3 years. Failure to renew the PRC ID does NOT invalidate the Certificate of Registration."),
            ("ExamTip", None, "Sequence of events: Pass LEA → File Oath of Office before PRBoA → Receive Certificate of Registration → Apply for Professional ID Card (PRC ID). The Oath of Office is a legal prerequisite — without it, no registration is effective."),
            ("Tip", None, "The PRC ID contains: registrant's name, registration number, date of registration, expiration date, professional tax receipt (PTR) number, and the registrant's signature and photograph. Know that the PTR must be updated annually."),
        ],
        "LEA-PRAC-LAW-010": [
            ("ExamTip", None, "The TWO TIMELINES under Article 1723: (1) Collapse must occur within 15 years of building completion (exposure window). (2) Action must be filed within 10 years following the collapse (statute of limitations). Both conditions must be satisfied. If collapse occurs in year 12, the owner has until year 22 to sue."),
            ("Warn", None, "Acceptance of the building does NOT waive rights under Article 1723. The owner's acceptance of keys and occupancy does not extinguish the right to sue for defects — only an express written waiver can release claims. The law prevents IMPLIED waiver through acceptance alone."),
        ],
        "LEA-PRAC-LAW-011": [
            ("LawCallout", 'code="ra9266" title="RA 9266 Section 20(a) — Architect-of-Record Definition"', "Legal Basis: RA 9266 (Architecture Act of 2004), Section 20(a), which defines the Architect-of-Record (AoR) as the architect responsible for the total design, signing and sealing all architectural documents."),
            ("Warn", None, "The AoR CANNOT delegate design responsibility to the AiCC. Design is NON-DELEGABLE. However, SUPERVISORY TASKS can be delegated. This line between design modification (AoR territory) and field interpretation (AiCC territory) is frequently tested on the LEA."),
            ("ExamTip", None, "Liability comparison: Under Article 1723 — defective plans = AoR bears STRICT LIABILITY (even if contractor didn't follow specs). Defective construction = AiCC shares SOLIDARY LIABILITY with contractor. Know which liability attaches to which role."),
        ],
        "LEA-PRAC-LAW-012": [
            ("LawCallout", 'code="ra9266" title="Civil Code Articles 2176-2194 — Quasi-Delict Framework"', "Legal Basis: Civil Code of the Philippines, Articles 2176 (Quasi-Delict Definition), 2180 (Employer Liability), and 2194 (Solidary Liability). Quasi-delict covers negligence-based damages even without a contract."),
            ("Warn", None, "CRITICAL DISTINCTION: Article 1723 = STRUCTURAL COLLAPSE ONLY + requires CONTRACTUAL relationship. Article 2176 (Quasi-delict) = ANY NEGLIGENCE causing damage + applies even WITHOUT a contract. A third party injured by falling debris has a quasi-delict claim, not an Article 1723 claim."),
            ("ExamTip", None, "Prescriptive periods compared: Article 1723 = 10 years from collapse. Quasi-delict under Article 1146 = 4 years from the time the action accrues. Article 1144 (written contract) = 10 years. Know which period applies to each cause of action."),
            ("Tip", None, "Article 2194 establishes SOLIDARY liability when multiple parties contribute to a quasi-delict. If an architect and contractor both contribute to negligence causing injury, the injured party can sue either or both for the full amount of damages."),
        ],
        "LEA-PRAC-LAW-013": [
            ("Warn", None, "The architect's copyright ownership exists even if (a) the client paid for the design services, AND (b) the project was never constructed. Payment for services does NOT transfer copyright — only a written assignment agreement transfers ownership."),
            ("ExamTip", None, "Client = limited LICENSE HOLDER for the specific project only. Client CANNOT reuse plans on another property without the architect's written permission. Client CAN use plans for: construction, maintenance, and minor site-adaptive modifications of the commissioned building."),
            ("Tip", None, "All service agreements should incorporate Section 33's ownership clause as constructive notice to clients. Without such notice, clients may inadvertently violate the law by reproducing plans. Registration with IPOPHL strengthens evidentiary weight in disputes."),
        ],
        "LEA-PRAC-LAW-014": [
            ("Warn", None, "Function vs. Expression distinction: RA 8293 protects the ORIGINAL EXPRESSION (spatial arrangement, aesthetic proportions, facade design, unique structural concept). It does NOT protect FUNCTIONAL elements required by building code (stair dimensions, conduit sizing, minimum room areas)."),
            ("ExamTip", None, "Copyright attaches AUTOMATICALLY upon fixation — no registration needed. But registration with IPOPHL provides: (1) prima facie evidence of ownership, (2) ability to pursue administrative remedies, and (3) stronger position in infringement disputes."),
            ("Tip", None, "RA 9266 Section 33 + RA 8293 = dual protection. RA 9266: profession-specific, establishes copyright ownership as a professional obligation. RA 8293: substantive copyright framework including duration, moral rights, and remedies. Both work together."),
        ],
        "LEA-PRAC-LAW-015": [
            ("Warn", None, "MORAL RIGHTS are INALIENABLE — architects retain them even after assigning economic copyright. The right of attribution ensures proper credit; the right of integrity protects against distortion damaging professional reputation. These cannot be waived or transferred."),
            ("ExamTip", None, "Copyright duration calculation: Individual architect = life + 50 years (from death date, not completion date). Juridical person/firm = 50 years from publication. Applied art = 25 years from making. Know which term applies to each scenario."),
            ("Tip", None, "Transfer of copyright requires a WRITTEN agreement. Oral agreements or ambiguous language about 'designs' or 'plans' creates only a license to use for a specific project, not a transfer of ownership. Always use clear written transfer documentation."),
        ],
        "LEA-PRAC-LAW-016": [
            ("LawCallout", 'code="ra9266" title="RA 9266 Section 20(c) — Contract Document Package"', "Legal Basis: RA 9266 (Architecture Act of 2004), Section 20(c), defining the contract document package: architectural plans, specifications, bill of materials, cost estimates, general conditions, and bidding documents."),
            ("Warn", None, "The architect signs and seals ONLY architectural documents. Structural, electrical, mechanical, and plumbing documents are signed by the respective professional engineers. But the architect as AoR retains overall coordination responsibility for the entire package."),
            ("ExamTip", None, "Document responsibility breakdown: Architect = plans, specs, BOM, estimates, conditions, bidding docs (signs/seals all). Structural Eng = structural design/calculations. Electrical Eng = electrical systems. MEP Eng = mechanical/plumbing. Architects COORDINATE but don't sign engineering documents."),
        ],
        "LEA-PRAC-LAW-017": [
            ("LawCallout", 'code="ra9266" title="RA 9266 Sections 20-22 — Signing, Sealing, and Discipline"', "Legal Basis: RA 9266 (Architecture Act of 2004), Sections 20 (Signing and Sealing), 21 (Direct Supervision), and 22 (Disciplinary Actions). The prohibition against signing/sealing documents not prepared under direct supervision."),
            ("Warn", None, "CRITICAL: Section 22 RA 9266 makes it a DISCIPLINARY VIOLATION to sign/seal documents not prepared under your direct supervision. This is one of the most commonly tested violations. Penalties include suspension or revocation of the Certificate of Registration."),
            ("ExamTip", None, "Direct supervision = personal knowledge of AND control over design decisions. Delegation of drafting tasks is permitted, but the supervising architect must review and approve the work. 'Rubber stamping' plans without review is a violation."),
            ("Tip", None, "Disciplinary actions under Section 22: (1) Reprimand, (2) Suspension of Certificate of Registration (temporary), (3) Revocation of Certificate of Registration (permanent). The PRBoA conducts the investigation and the Commission may review on appeal."),
        ],
        "LEA-PRAC-FRM-012": [
            ("LawCallout", 'code="ra9266" title="RA 9184 — Government Procurement Reform Act"', "Legal Basis: RA 9184 (Government Procurement Reform Act), as amended by RA 12009 (2024). Governs procurement of consulting services including architectural design for all government entities, GOCCs, and LGUs."),
            ("Warn", None, "Prohibited activities: collusion, fraud, bribery, conflict of interest, and bid-rigging. Architects must NOT communicate with other bidding firms to arrange fees or coordinate responses. Violations can result in PERMANENT disqualification from government procurement."),
            ("ExamTip", None, "Three procurement methods: (1) Competitive Bidding — open to all qualified (standard for architecture); (2) Limited Bidding — restricted to pre-qualified list (when few have expertise); (3) Single Source Procurement — exceptional (emergencies, sole source)."),
        ],
        "LEA-PRAC-FRM-013": [
            ("LawCallout", 'code="ra9266" title="COA Audit — PD 1445 and COA Circulars"', "Legal Basis: Presidential Decree 1445 (Government Auditing Code of the Philippines). The Commission on Audit has exclusive authority to examine all government-funded projects including architectural consulting contracts."),
            ("Warn", None, "COA findings: Notice of Suspension (NS) — temporary hold; Notice of Disallowance (ND) — transaction disallowed, may require refund; Notice of Charge (NC) — personal liability. Architects must respond promptly and maintain complete documentation."),
            ("ExamTip", None, "Solidary liability: If an architect signs a certificate of completion for defective or incomplete work, and COA disallows payment, the architect may be held SOLIDARILY LIABLE with government officials who approved payment."),
            ("Tip", None, "Architects on government projects must maintain: signed contract and scope, technical reports, inspection records, billing with support docs, change orders with approvals, and certificate of acceptance from the client agency."),
        ],
        "LEA-PRAC-FRM-015": [
            ("LawCallout", 'code="ra9266" title="RA 10173 — Data Privacy Act"', "Legal Basis: RA 10173 (Data Privacy Act of 2012). Architects collecting/processing client personal data are 'personal information controllers' subject to NPC (National Privacy Commission) oversight."),
            ("Warn", None, "Penalties: Unauthorized processing of personal info = 1-3 years imprisonment + fine up to PHP 2M. Unauthorized processing of SENSITIVE personal info = 3-6 years + fine up to PHP 5M. Architects must take data privacy obligations seriously."),
            ("ExamTip", None, "Key principles: Consent (obtain explicit consent), Purpose Limitation (only collect what's needed for the project), Proportionality (reasonable necessity), Security (implement safeguards). Maintain a Data Privacy Manual and designate a DPO."),
            ("Tip", None, "The NPC may conduct compliance checks. Register your data processing systems with the NPC if you process personal data of 250+ individuals or process sensitive personal data. Data subjects have rights to access, correct, and delete their data."),
        ],
        "LEA-PRAC-FRM-016": [
            ("LawCallout", 'code="ra9266" title="BERDE — Philippine Green Building Rating System"', "Legal Basis: BERDE (Building for Ecologically Responsive Design Excellence), developed by PhilGBC. Referenced in the Philippine Green Building Code (PD 1096 reference standard)."),
            ("Warn", None, "BERDE is VOLUNTARY unless the LGU requires it. The Philippine Green Building Code (PD 1096 IRR) is MANDATORY minimum standard. Do not confuse voluntary certification with mandatory code compliance."),
            ("ExamTip", None, "BERDE certification levels and compliance thresholds: 1 Star (33%), 2 Stars (46%), 3 Stars (60%), 4 Stars (80%), 5 Stars (100%). Know these thresholds for exam questions."),
            ("Tip", None, "Architect's role in BERDE: Select appropriate certification level, integrate green strategies from schematic design, coordinate with BERDE-accredited professionals, document compliance for each credit category, and submit to PhilGBC."),
        ],
        "LEA-PRAC-FRM-017": [
            ("LawCallout", 'code="ra9266" title="Environmental Laws — EIA System and DENR DAO"', "Legal Basis: PD 1151 (Environmental Policy), PD 1152 (Environmental Code), DENR DAO 2003-30 (EIA System). Environmental Compliance Certificate (ECC) required for environmentally critical projects or projects in critical areas."),
            ("Warn", None, "ECC REQUIREMENT: Projects classified as Environmentally Critical (ECPs) or in Environmentally Critical Areas (ECAs) REQUIRE an ECC before construction. Construction without an ECC is an environmental law violation."),
            ("ExamTip", None, "EIA Process: (1) Project Screening → (2) Scoping → (3) EIA Study → (4) Review & Evaluation (DENR) → (5) Decision (ECC issued/denied). The architect coordinates with environmental specialists but does not prepare the EIA alone."),
            ("Tip", None, "Key environmental laws for architects: PD 1151 (Policy Statement), PD 1152 (Environmental Code), RA 8749 (Clean Air Act), RA 9275 (Clean Water Act), RA 9003 (Ecological Solid Waste Management), DENR DAO 2003-30 (EIA System)."),
        ],
    }
    
    comps = comps_config.get(lea_id, [])
    
    # Add components to normalized.md using SLATECAMP_UI_BLOCK format
    for comp_name, props_text, children_text in comps:
        block_id = f"ui_{next_id:04d}"
        next_id += 1
        
        # Create placeholder
        props_line = f"- Props: {props_text}" if props_text else "- Props: (none)"
        if children_text:
            children_escaped = children_text.replace('"', "'")
            children_line = f"- Text: {children_escaped}"
        else:
            children_line = "- Text: (none detected)"
        
        placeholder = (
            f"[SLATECAMP_UI_BLOCK:{block_id} component=\"{comp_name}\" status=\"preserved\"]\n"
            f"Extracted summary:\n"
            f"{props_line}\n"
            f"{children_line}\n"
            f"[/SLATECAMP_UI_BLOCK]"
        )
        
        # Add to normalized.md
        normalized += f"\n\n{placeholder}\n"
        
        # Create block entry for ui-blocks.json
        block_entry = {
            "block_id": block_id,
            "block_type": "mdx_component",
            "component_name": comp_name,
            "raw": f"<{comp_name} />",
            "raw_hash": f"sha256:{hashlib.sha256(f'<{comp_name} />'.encode()).hexdigest()}",
            "placeholder": placeholder,
            "placeholder_hash": f"sha256:{hashlib.sha256(placeholder.encode()).hexdigest()}",
            "props": {},
            "props_json": {},
            "props_text": props_text if props_text else None,
            "children_raw": children_text,
            "children_text": children_text,
            "start_offset": 0,
            "end_offset": 0,
            "line_start": 0,
            "line_end": 0,
            "parser_confidence": "high",
            "parse_status": "parsed",
            "warnings": [],
            "status": "preserved"
        }
        
        if props_text and props_text != "(none)":
            # Parse props
            props_dict = {}
            for prop_pair in props_text.split():
                if '=' in prop_pair:
                    key, val = prop_pair.split('=', 1)
                    val = val.strip('"').strip("'")
                    props_dict[key] = val
            block_entry["props"] = props_dict
            block_entry["props_json"] = props_dict
        
        existing_blocks.append(block_entry)
        modified = True
        print(f"  ADDED: {block_id} = {comp_name}")
    
    # ============================
    # Save updated files
    # ============================
    if modified:
        new_hash = sha256_file(normalized)
        write_file(norm_path, normalized)
        
        ui_blocks["normalized_content_hash"] = f"sha256:{new_hash}"
        ui_blocks["blocks"] = existing_blocks
        ui_blocks["ui_block_count"] = len(existing_blocks)
        ui_blocks["total_blocks"] = len(existing_blocks)
        
        blocks_json = json.dumps(existing_blocks, sort_keys=True)
        ui_blocks["ui_blocks_hash"] = f"sha256:{hashlib.sha256(blocks_json.encode()).hexdigest()}"
        
        write_file(ui_blocks_path, json.dumps(ui_blocks, indent=2) + "\n")
        print(f"  SAVED: normalized.md + ui-blocks.json ({len(existing_blocks)} blocks total)")
        return True
    else:
        # Ensure hash is correct even if no changes
        new_hash = sha256_file(normalized)
        current_hash = ui_blocks.get("normalized_content_hash", "").replace("sha256:", "")
        if current_hash != new_hash:
            ui_blocks["normalized_content_hash"] = f"sha256:{new_hash}"
            write_file(ui_blocks_path, json.dumps(ui_blocks, indent=2) + "\n")
            print(f"  HASH SYNCED: {current_hash[:12]} -> {new_hash[:12]}")
            return True
        print(f"  NO CHANGES NEEDED")
        return False


def main():
    batch_start = int(sys.argv[1]) if len(sys.argv) > 1 else 0
    batch_end = int(sys.argv[2]) if len(sys.argv) > 2 else len(ARTICLES)
    
    print(f"Processing articles {batch_start} to {batch_end} of {len(ARTICLES)}")
    
    changes = 0
    for i in range(batch_start, min(batch_end, len(ARTICLES))):
        dirname, article_id, lea_id = ARTICLES[i]
        if process_article(dirname, article_id, lea_id):
            changes += 1
    
    print(f"\n{'='*60}")
    print(f"COMPLETE: {changes} articles modified out of {batch_end - batch_start} in this batch")


if __name__ == "__main__":
    main()
