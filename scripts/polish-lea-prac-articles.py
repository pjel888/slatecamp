#!/usr/bin/env python3
"""
Pass 7 — Learning polish on all Professional Practice (lea-prac-*) articles.

Processes each unique article directory, applying:
1. Replace generic Learning Goals with specific LEA-topic objectives
2. Remove AI meta-commentary
3. Add "## Related Articles" section with cross-references
4. Strengthen ExamTips and Warnings
5. Check LawCallout code references (fix nbcp/irr → ra9266 where wrong)
6. Update normalized_content_hash in article-metadata.json
"""

import hashlib, json, os, re, sys
from pathlib import Path

BASE = Path("/Users/philiplewis/slatecamp/.ai/content-audit-export/articles")

# ──────────────────────────────────────────────
# Per-article learning goal replacements
# Keyed by slug prefix (the part before the UUID)
# ──────────────────────────────────────────────

LEARNING_GOALS = {
    # ── LAW ──
    "lea-prac-law-001": (
        "## Learning Goal\n\n"
        "After studying this article, you should be able to:\n\n"
        "- Explain what RA 9266 replaced and its legislative purpose.\n"
        "- Describe the PRBoA composition (3 members: 1 Chair, 2 Members), their qualifications, and term limits.\n"
        "- Distinguish Architect-of-Record, Architect-in-Charge of Construction, and Consulting Architect under RA 9266 §3 and IRR §3.\n"
        "- Correctly cite the sections that govern definitions (§3), PRBoA creation (§4), and signing/sealing (§33)."
    ),
    "lea-prac-law-002": (
        "## Learning Goal\n\n"
        "After studying this article, you should be able to:\n\n"
        "- Identify the ten (10) enumerated service areas under RA 9266 §3 (a–j).\n"
        "- Distinguish structural conceptualization from structural design — which belongs to the architect and which to the engineer.\n"
        "- Recognize which activities fall outside the architect's scope of practice.\n"
        "- Apply scope definitions to exam scenarios involving planning, design, consultation, and construction phases."
    ),
    "lea-prac-law-003": (
        "## Learning Goal\n\n"
        "After studying this article, you should be able to:\n\n"
        "- Identify prohibited acts under RA 9266, including unauthorized practice, false representation, and illegal use of seals.\n"
        "- State the criminal penalties for each prohibited act (fines, imprisonment, or both).\n"
        "- Explain the enforcement chain: PRBoA investigates, PRC adjudicates, courts prosecute.\n"
        "- Distinguish administrative sanctions from criminal liability under the law."
    ),
    "lea-prac-law-004": (
        "## Learning Goal\n\n"
        "After studying this article, you should be able to:\n\n"
        "- Describe the PRBoA composition: 1 Chairman and 2 Members appointed by the President.\n"
        "- List the six (6) qualifications for PRBoA membership under RA 9266 §4.\n"
        "- State the term of office (3 years, staggered, max 2 terms / 6 years).\n"
        "- Identify the IAPOA (UAP) as the nominating body."
    ),
    "lea-prac-law-005": (
        "## Learning Goal\n\n"
        "After studying this article, you should be able to:\n\n"
        "- Enumerate the powers and functions of the PRBoA under RA 9266 §7.\n"
        "- Distinguish the PRBoA's regulatory powers from the PRC's administrative supervision.\n"
        "- Explain the Board's role in licensure, discipline, CPD, and standard-setting.\n"
        "- Apply §7 powers to exam scenarios involving board jurisdiction."
    ),
    "lea-prac-law-006": (
        "## Learning Goal\n\n"
        "After studying this article, you should be able to:\n\n"
        "- Differentiate the PRBoA's role (professional regulation, licensure, discipline) from the PRC's role (administrative supervision, appeals).\n"
        "- Describe the appeals chain: PRBoA decision → PRC → Court of Appeals → Supreme Court.\n"
        "- Identify which body handles preliminary investigation of ethical complaints.\n"
        "- Explain the PRC's power to approve or modify PRBoA resolutions."
    ),
    "lea-prac-law-007": (
        "## Learning Goal\n\n"
        "After studying this article, you should be able to:\n\n"
        "- List the LEA eligibility requirements: BS Architecture, DAE, moral character certificates.\n"
        "- Explain the Documentary Alternative Evaluation (DAE) process and who qualifies.\n"
        "- State the required documents for examination application.\n"
        "- Identify the grounds for disqualification from taking the LEA."
    ),
    "lea-prac-law-008": (
        "## Learning Goal\n\n"
        "After studying this article, you should be able to:\n\n"
        "- Describe the LEA structure: subject areas, number of items, and time allocation.\n"
        "- State the passing standard (general average of 70%, no subject below 50%).\n"
        "- Explain the retaking policy and how many times a taker may re-take.\n"
        "- Identify the five (5) subject areas tested on the LEA."
    ),
    "lea-prac-law-009": (
        "## Learning Goal\n\n"
        "After studying this article, you should be able to:\n\n"
        "- Describe the Certificate of Registration and Professional ID Card issuance process.\n"
        "- Explain the oath-taking ceremony requirements and timeline.\n"
        "- State the grounds for non-issuance or revocation of the Certificate.\n"
        "- Identify the fees and documentary requirements for initial registration."
    ),
    "lea-prac-law-010": (
        "## Learning Goal\n\n"
        "After studying this article, you should be able to:\n\n"
        "- State the 15-year liability period under Civil Code Article 1723.\n"
        "- Identify who bears liability: the architect (AoR) and the contractor are solidarily liable.\n"
        "- Distinguish Article 1723 from Article 1720 (engineer liability) and Article 2176 (quasi-delict).\n"
        "- Apply the 15-year prescription period to exam fact patterns."
    ),
    "lea-prac-law-011": (
        "## Learning Goal\n\n"
        "After studying this article, you should be able to:\n\n"
        "- Distinguish Architect-of-Record (AoR) from Architect-in-Charge of Construction (AiCC).\n"
        "- Explain the respective liabilities of AoR (design) and AiCC (construction supervision).\n"
        "- Describe when the same architect can serve as both AoR and AiCC.\n"
        "- Apply role distinctions to exam scenarios involving design defects vs. construction defects."
    ),
    "lea-prac-law-012": (
        "## Learning Goal\n\n"
        "After studying this article, you should be able to:\n\n"
        "- Define quasi-delict and culpa aquiliana under Civil Code Articles 2176–2194.\n"
        "- Explain how quasi-delict applies to architectural malpractice.\n"
        "- Distinguish contractual liability (Article 1723) from tort liability (Article 2176).\n"
        "- Identify the elements of negligence an injured party must prove."
    ),
    "lea-prac-law-013": (
        "## Learning Goal\n\n"
        "After studying this article, you should be able to:\n\n"
        "- State the general rule under RA 9266 §33: architectural plans are owned by the architect.\n"
        "- Identify exceptions: written agreements transferring ownership, or employer-employee works for hire.\n"
        "- Explain the client's rights to use plans for the intended project.\n"
        "- Apply ownership and use-right scenarios to exam questions."
    ),
    "lea-prac-law-014": (
        "## Learning Goal\n\n"
        "After studying this article, you should be able to:\n\n"
        "- Explain how RA 8293 (Intellectual Property Code) protects architectural works.\n"
        "- Define what constitutes an 'architectural work' under IP law.\n"
        "- Distinguish copyright protection (expression) from patent protection (invention).\n"
        "- Identify the copyright owner in various commissioning scenarios."
    ),
    "lea-prac-law-015": (
        "## Learning Goal\n\n"
        "After studying this article, you should be able to:\n\n"
        "- State the duration of copyright protection for architectural works (lifetime + 50 years).\n"
        "- Explain the transfer of copyright through written assignment.\n"
        "- List the moral rights of the architect-author.\n"
        "- Identify infringement remedies: injunctions, damages, impounding of infringing materials."
    ),
    "lea-prac-law-016": (
        "## Learning Goal\n\n"
        "After studying this article, you should be able to:\n\n"
        "- Identify all documents in the contract document package: drawings, specifications, bidding documents, contract forms.\n"
        "- Distinguish who draws (architect/professional) vs. who signs (owner, architect, contractor).\n"
        "- Explain the hierarchy of contract documents in case of conflict.\n"
        "- Describe the architect's role in assembling and certifying the contract document package."
    ),
    "lea-prac-law-017": (
        "## Learning Goal\n\n"
        "After studying this article, you should be able to:\n\n"
        "- State the rule under RA 9266 §33: only a registered architect may sign and seal architectural documents.\n"
        "- Define 'direct supervision' and what it requires of the architect.\n"
        "- Identify exceptions: delegation to supervised subordinates.\n"
        "- Explain disciplinary consequences for unauthorized signing and sealing."
    ),

    # ── ETH ──
    "lea-prac-eth-001": (
        "## Learning Goal\n\n"
        "After studying this article, you should be able to:\n\n"
        "- State the four-tiered hierarchy of ethical obligations: Public, Client, Profession, Fellow Architects.\n"
        "- Explain why public welfare always takes precedence over client interests.\n"
        "- Identify SPP Document 200 as the Code of Ethical Conduct.\n"
        "- Distinguish ethical obligations (SPP 200) from standards of practice (SPP 201–209)."
    ),
    "lea-prac-eth-002": (
        "## Learning Goal\n\n"
        "After studying this article, you should be able to:\n\n"
        "- List the architect's duties to the public under the Code of Ethical Conduct.\n"
        "- Explain the duty to report illegal or unauthorized practice of architecture.\n"
        "- Identify requirements for truthful representation of qualifications.\n"
        "- Apply public-welfare obligations to exam scenarios."
    ),
    "lea-prac-eth-003": (
        "## Learning Goal\n\n"
        "After studying this article, you should be able to:\n\n"
        "- Describe the architect's duties to the client: faithful representation, confidentiality, competence.\n"
        "- Explain the duty to disclose conflicts of interest.\n"
        "- Identify the requirement for written agreements at engagement inception.\n"
        "- Apply client-obligation principles to scenario-based exam questions."
    ),
    "lea-prac-eth-004": (
        "## Learning Goal\n\n"
        "After studying this article, you should be able to:\n\n"
        "- Describe the architect's duties to the profession: upholding dignity, avoiding disrepute.\n"
        "- Explain the obligation to refrain from signing/sealing work not under direct supervision.\n"
        "- Identify rules on competitive bidding and professional courtesy among architects.\n"
        "- Apply profession-related ethical obligations to exam questions."
    ),
    "lea-prac-eth-005": (
        "## Learning Goal\n\n"
        "After studying this article, you should be able to:\n\n"
        "- List the architect's obligations to fellow architects under the Code of Ethical Conduct.\n"
        "- Explain the prohibition against assuming a commission being negotiated by another architect.\n"
        "- Identify the notification requirement when taking over a project.\n"
        "- Apply inter-professional courtesy rules to exam scenarios."
    ),
    "lea-prac-eth-006": (
        "## Learning Goal\n\n"
        "After studying this article, you should be able to:\n\n"
        "- State the non-poaching and non-interference rules between architects.\n"
        "- Explain the obligation of professional courtesy when one architect succeeds another.\n"
        "- Identify the rules on joint ventures and co-architects.\n"
        "- Apply ethical obligations to scenarios involving firm transitions."
    ),
    "lea-prac-eth-007": (
        "## Learning Goal\n\n"
        "After studying this article, you should be able to:\n\n"
        "- Describe the architect's obligation to maintain independence from contractors and suppliers.\n"
        "- Explain the prohibition against accepting hidden commissions or kickbacks.\n"
        "- Identify rules on impartial certification of contractor work.\n"
        "- Apply independence requirements to exam scenarios involving supplier relationships."
    ),
    "lea-prac-eth-008": (
        "## Learning Goal\n\n"
        "After studying this article, you should be able to:\n\n"
        "- Enumerate the four statutory grounds for suspension or revocation under RA 9266 §23(a)–(d).\n"
        "- Distinguish suspension (temporary) from revocation (permanent).\n"
        "- Explain the procedural framework: complaint → investigation → hearing → decision.\n"
        "- Identify which violations lead to suspension vs. revocation."
    ),
    "lea-prac-eth-009": (
        "## Learning Goal\n\n"
        "After studying this article, you should be able to:\n\n"
        "- Explain the architect's duty to maintain the Code of Ethical Conduct.\n"
        "- Describe how ethical violations are reported and investigated.\n"
        "- Identify the standard of proof required in disciplinary proceedings.\n"
        "- State the penalties for ethical violations beyond suspension/revocation."
    ),
    "lea-prac-eth-010": (
        "## Learning Goal\n\n"
        "After studying this article, you should be able to:\n\n"
        "- Define conflict of interest in the architectural context.\n"
        "- Identify situations that create conflicts: dual roles, financial interests, family relationships.\n"
        "- Explain the required disclosure and recusal procedures.\n"
        "- Apply conflict-of-interest rules to exam scenarios."
    ),
    "lea-prac-eth-011": (
        "## Learning Goal\n\n"
        "After studying this article, you should be able to:\n\n"
        "- Explain the architect's duty of confidentiality to clients.\n"
        "- Identify exceptions to confidentiality: public safety, legal requirements, professional peer review.\n"
        "- Describe how confidentiality extends to digital records and communications.\n"
        "- Apply confidentiality rules to exam scenarios involving third-party requests."
    ),
    "lea-prac-eth-012": (
        "## Learning Goal\n\n"
        "After studying this article, you should be able to:\n\n"
        "- State the rules on advertising and solicitation of architectural services.\n"
        "- Identify permissible forms of professional promotion.\n"
        "- Explain restrictions on self-laudatory or misleading claims.\n"
        "- Apply advertising rules to exam scenarios."
    ),
    "lea-prac-eth-013": (
        "## Learning Goal\n\n"
        "After studying this article, you should be able to:\n\n"
        "- Explain the architect's duty regarding CPD compliance.\n"
        "- Identify the consequences of non-compliance with CPD requirements.\n"
        "- Describe how ethical duties extend to professional competence and lifelong learning.\n"
        "- Apply CPD-related ethical obligations to renewal scenarios."
    ),

    # ── CTR ──
    "lea-prac-ctr-001": (
        "## Learning Goal\n\n"
        "After studying this article, you should be able to:\n\n"
        "- Identify the core provisions of a standard Owner-Architect agreement.\n"
        "- Describe the phase structure (SD, DD, CD, Bidding, CA).\n"
        "- Distinguish the Owner-Architect agreement from the construction contract.\n"
        "- Explain compensation methods, termination rights, and dispute resolution mechanisms."
    ),
    "lea-prac-ctr-002": (
        "## Learning Goal\n\n"
        "After studying this article, you should be able to:\n\n"
        "- Distinguish Basic Services (standard phases per SPP 202) from Additional Services.\n"
        "- List examples of Additional Services: feasibility studies, renderings, expert testimony.\n"
        "- Explain how compensation differs for Basic vs. Additional Services.\n"
        "- Apply the Basic/Additional distinction to scope-of-work scenarios."
    ),
    "lea-prac-ctr-003": (
        "## Learning Goal\n\n"
        "After studying this article, you should be able to:\n\n"
        "- Distinguish suspension (temporary stop) from termination (permanent end) of the agreement.\n"
        "- Explain the notice period and procedural requirements for suspension.\n"
        "- Identify grounds for termination for cause and for convenience.\n"
        "- Describe the architect's compensation rights upon suspension or termination."
    ),
    "lea-prac-ctr-004": (
        "## Learning Goal\n\n"
        "After studying this article, you should be able to:\n\n"
        "- Describe the purpose and structure of UAP Doc 301.\n"
        "- Identify the three parties to the agreement and their roles.\n"
        "- Explain the contractor's obligations under the uniform contract documents.\n"
        "- Distinguish UAP Doc 301 from the Owner-Architect agreement (UAP Doc 300 series)."
    ),
    "lea-prac-ctr-005": (
        "## Learning Goal\n\n"
        "After studying this article, you should be able to:\n\n"
        "- Describe the architect's authority during the construction phase.\n"
        "- Distinguish the architect's role as contract administrator from the owner's authority.\n"
        "- Explain the architect's limits: no authority to modify contracts or terminate the contractor.\n"
        "- Identify the scope of the architect's certification powers."
    ),
    "lea-prac-ctr-006": (
        "## Learning Goal\n\n"
        "After studying this article, you should be able to:\n\n"
        "- List the contractor's obligations under the standard construction contract.\n"
        "- Explain the guarantee period (typically 1 year for defects).\n"
        "- Describe the contractor's responsibility for means and methods.\n"
        "- Identify the contractor's warranty obligations for materials and workmanship."
    ),
    "lea-prac-ctr-007": (
        "## Learning Goal\n\n"
        "After studying this article, you should be able to:\n\n"
        "- Distinguish private bidding, competitive public bidding, negotiated contract, and invited bid.\n"
        "- Explain when each procurement method is appropriate.\n"
        "- Describe the architect's role in the bidding process.\n"
        "- Apply procurement method rules to exam scenarios."
    ),
    "lea-prac-ctr-008": (
        "## Learning Goal\n\n"
        "After studying this article, you should be able to:\n\n"
        "- List the contents of a complete bid document package.\n"
        "- Explain rules on interpretation of bid documents.\n"
        "- Describe the addenda process: who issues, timeline, and effect.\n"
        "- Identify the architect's role in preparing and interpreting bid documents."
    ),
    "lea-prac-ctr-009": (
        "## Learning Goal\n\n"
        "After studying this article, you should be able to:\n\n"
        "- Describe the bid evaluation process and the architect's recommendation role.\n"
        "- Explain criteria for contract award: lowest responsive bidder.\n"
        "- Distinguish bid evaluation from bid shopping.\n"
        "- Identify the legal effect of contract award on the parties."
    ),
    "lea-prac-ctr-010": (
        "## Learning Goal\n\n"
        "After studying this article, you should be able to:\n\n"
        "- Define the performance bond and its purpose: guarantee contractor performance.\n"
        "- State the typical amount (100% of the contract price).\n"
        "- Explain conditions for calling the bond (default by contractor).\n"
        "- Distinguish the performance bond from the payment bond."
    ),
    "lea-prac-ctr-011": (
        "## Learning Goal\n\n"
        "After studying this article, you should be able to:\n\n"
        "- Define the payment bond and its purpose: protect subcontractors and suppliers.\n"
        "- Distinguish the payment bond from the performance bond.\n"
        "- Explain who can claim against the payment bond.\n"
        "- Describe the payment bond amount relative to the contract price."
    ),
    "lea-prac-ctr-012": (
        "## Learning Goal\n\n"
        "After studying this article, you should be able to:\n\n"
        "- Define the guarantee bond (warranty bond) for the 1-year defects liability period.\n"
        "- Explain the scope of defects covered: workmanship and materials, not normal wear.\n"
        "- Describe the bond amount and duration.\n"
        "- Distinguish the guarantee bond from the performance bond."
    ),
    "lea-prac-ctr-013": (
        "## Learning Goal\n\n"
        "After studying this article, you should be able to:\n\n"
        "- Define professional indemnity insurance for architects.\n"
        "- Explain what types of claims are covered: negligence, errors, omissions.\n"
        "- Identify what is typically excluded: fraud, criminal acts, breach of contract.\n"
        "- Describe typical coverage limits and policy requirements."
    ),
    "lea-prac-ctr-014": (
        "## Learning Goal\n\n"
        "After studying this article, you should be able to:\n\n"
        "- Describe the Certificate of Payment process and the architect's role.\n"
        "- Explain the architect's certification authority and liability.\n"
        "- Distinguish progress payments from final payment.\n"
        "- Identify the legal effect of a Certificate of Payment."
    ),
    "lea-prac-ctr-015": (
        "## Learning Goal\n\n"
        "After studying this article, you should be able to:\n\n"
        "- Define retention money and its purpose: ensure contractor completion.\n"
        "- State the standard retention rate (10% of progress payments).\n"
        "- Describe the conditions for release of retention money.\n"
        "- Distinguish retention from performance bond."
    ),
    "lea-prac-ctr-016": (
        "## Learning Goal\n\n"
        "After studying this article, you should be able to:\n\n"
        "- Define a change order: written amendment to the construction contract.\n"
        "- Distinguish types: change in scope, change in schedule, change in cost.\n"
        "- Explain the architect's authority to issue change orders.\n"
        "- Describe the documentation and approval process for change orders."
    ),
    "lea-prac-ctr-017": (
        "## Learning Goal\n\n"
        "After studying this article, you should be able to:\n\n"
        "- Explain the concept of substantial completion and its legal significance.\n"
        "- Describe the Certificate of Substantial Completion process.\n"
        "- Distinguish substantial completion from final completion.\n"
        "- Identify the architect's role in certifying completion milestones."
    ),
    "lea-prac-ctr-018": (
        "## Learning Goal\n\n"
        "After studying this article, you should be able to:\n\n"
        "- Define liquidated damages and their purpose in construction contracts.\n"
        "- Explain how liquidated damages differ from penalties under Philippine law.\n"
        "- State the typical liquidated damages rate (1/10 of 1% per day of delay).\n"
        "- Describe the requirements for enforceability of liquidated damages clauses."
    ),
    "lea-prac-ctr-019": (
        "## Learning Goal\n\n"
        "After studying this article, you should be able to:\n\n"
        "- Explain delay damages and extension of time provisions.\n"
        "- Distinguish excusable delays (owner-caused, force majeure) from non-excusable delays.\n"
        "- Describe the notice requirements for claiming extensions of time.\n"
        "- Identify the architect's role in evaluating delay claims."
    ),
    "lea-prac-ctr-020": (
        "## Learning Goal\n\n"
        "After studying this article, you should be able to:\n\n"
        "- Describe dispute resolution methods: negotiation, mediation, arbitration, litigation.\n"
        "- Distinguish the Construction Industry Arbitration Commission (CIAC) from regular courts.\n"
        "- Explain the arbitration clause in standard construction contracts.\n"
        "- Identify which disputes are subject to mandatory arbitration."
    ),
    "lea-prac-ctr-021": (
        "## Learning Goal\n\n"
        "After studying this article, you should be able to:\n\n"
        "- Define force majeure and its effect on construction contracts.\n"
        "- Identify typical force majeure events: natural disasters, war, strikes.\n"
        "- Explain the contractor's relief from liability during force majeure.\n"
        "- Describe the notice and documentation requirements for force majeure claims."
    ),
    "lea-prac-ctr-022": (
        "## Learning Goal\n\n"
        "After studying this article, you should be able to:\n\n"
        "- Describe the final acceptance and project close-out process.\n"
        "- Explain the final certificate of payment and final release.\n"
        "- Identify punch list items and their resolution timeline.\n"
        "- Describe the architect's role in project close-out documentation."
    ),

    # ── SVC ──
    "lea-prac-svc-001": (
        "## Learning Goal\n\n"
        "After studying this article, you should be able to:\n\n"
        "- Define pre-design services and their scope under SPP Doc 201.\n"
        "- List the types of pre-design services: consultation, feasiblity studies, programming, site analysis.\n"
        "- Describe the compensation methods for pre-design services (MDPE, lump sum, per diem).\n"
        "- Distinguish pre-design services from regular design phases (SD, DD, CD)."
    ),
    "lea-prac-svc-002": (
        "## Learning Goal\n\n"
        "After studying this article, you should be able to:\n\n"
        "- Define feasibility studies and their purpose in architectural practice.\n"
        "- Distinguish feasibility studies from pre-feasibility studies.\n"
        "- List the typical contents of a feasibility study: market, technical, financial, legal.\n"
        "- Describe the architect's distinct role in feasibility analysis vs. other consultants."
    ),
    "lea-prac-svc-003": (
        "## Learning Goal\n\n"
        "After studying this article, you should be able to:\n\n"
        "- Define space programming and its deliverables.\n"
        "- Describe the space programming process: needs analysis → adjacency diagrams → space schedules.\n"
        "- Explain how the space program feeds into schematic design.\n"
        "- Identify the architect's role in developing and validating the space program."
    ),
    "lea-prac-svc-004": (
        "## Learning Goal\n\n"
        "After studying this article, you should be able to:\n\n"
        "- Describe the six-phase framework under SPP Doc 202.\n"
        "- List each phase: SD (20%), DD (20%), CD (30%), Bidding (5%), CA (25%), Post-Construction.\n"
        "- Explain the design logic progression from concept to construction.\n"
        "- Identify the compensation allocation for each phase."
    ),
    "lea-prac-svc-005": (
        "## Learning Goal\n\n"
        "After studying this article, you should be able to:\n\n"
        "- Describe the deliverables of Schematic Design (SD) phase.\n"
        "- Explain the design decisions made during SD: concept, massing, spatial relationships.\n"
        "- State the fee earned during SD (20% of total basic fee).\n"
        "- Identify the approval process for SD deliverables."
    ),
    "lea-prac-svc-006": (
        "## Learning Goal\n\n"
        "After studying this article, you should be able to:\n\n"
        "- Describe the deliverables of Design Development (DD) phase.\n"
        "- Explain how engineering coordination and system selection occur during DD.\n"
        "- State the fee earned during DD (20% of total basic fee).\n"
        "- Distinguish DD from SD in level of detail and documentation."
    ),
    "lea-prac-svc-007": (
        "## Learning Goal\n\n"
        "After studying this article, you should be able to:\n\n"
        "- Describe the deliverables of the Contract Documents (CD) phase.\n"
        "- Explain the importance of working drawings and specifications for bidding.\n"
        "- State the fee earned during CD (30% of total basic fee — the largest single phase).\n"
        "- Identify the architect's role in preparing bidding and construction documents."
    ),
    "lea-prac-svc-008": (
        "## Learning Goal\n\n"
        "After studying this article, you should be able to:\n\n"
        "- Describe Phase 4 (Bidding Assistance) and Phase 5 (Construction Administration).\n"
        "- Explain the architect's role during bidding: issuing addenda, evaluating bids.\n"
        "- Describe the architect's duties during CA: site visits, review of shop drawings, certifying payments.\n"
        "- State the combined fee for Phases 4+5 (30%: 5% bidding + 25% CA)."
    ),
    "lea-prac-svc-009": (
        "## Learning Goal\n\n"
        "After studying this article, you should be able to:\n\n"
        "- Define specialized and allied architectural services under SPP Doc 203.\n"
        "- List examples: interior design, acoustics, lighting, landscape, urban design.\n"
        "- Describe how compensation for specialized services is determined.\n"
        "- Distinguish specialized services from basic services under SPP 202."
    ),
    "lea-prac-svc-010": (
        "## Learning Goal\n\n"
        "After studying this article, you should be able to:\n\n"
        "- Describe interior design as an allied architectural service.\n"
        "- Explain the architect's qualifications for providing interior design services.\n"
        "- Identify the phases and deliverables of interior design projects.\n"
        "- Distinguish interior design (architect-led) from interior decoration."
    ),
    "lea-prac-svc-011": (
        "## Learning Goal\n\n"
        "After studying this article, you should be able to:\n\n"
        "- Define landscape architecture services within the architect's scope.\n"
        "- Describe site planning, planting design, and outdoor space programming.\n"
        "- Explain how landscape services are coordinated with building design.\n"
        "- Identify the architect's role in landscape design vs. the landscape architect's role."
    ),
    "lea-prac-svc-012": (
        "## Learning Goal\n\n"
        "After studying this article, you should be able to:\n\n"
        "- Describe architectural acoustics and lighting design as specialized services.\n"
        "- Explain the architect's role in coordinating with acoustic and lighting consultants.\n"
        "- Identify the phases where acoustics and lighting are integrated into design.\n"
        "- Apply specialized service concepts to exam scenarios."
    ),
    "lea-prac-svc-013": (
        "## Learning Goal\n\n"
        "After studying this article, you should be able to:\n\n"
        "- Define full-time supervision services during the construction phase.\n"
        "- Describe the scope of full-time supervision vs. periodic inspection.\n"
        "- Explain the architect-in-charge of construction (AiCC) role.\n"
        "- Identify when full-time supervision is required by law or contract."
    ),
    "lea-prac-svc-014": (
        "## Learning Goal\n\n"
        "After studying this article, you should be able to:\n\n"
        "- Define construction management services and the CM's role.\n"
        "- Distinguish construction management from architectural construction administration.\n"
        "- Describe the CM's scope: schedule, budget, coordination, quality control.\n"
        "- Explain how the architect coordinates with the construction manager."
    ),
    "lea-prac-svc-015": (
        "## Learning Goal\n\n"
        "After studying this article, you should be able to:\n\n"
        "- Compare full-time supervision, construction management, and SPP 202 administration.\n"
        "- Distinguish the three roles by scope, authority, and compensation.\n"
        "- Explain when each service type is appropriate for a project.\n"
        "- Apply service-type distinctions to exam scenarios."
    ),
    "lea-prac-svc-016": (
        "## Learning Goal\n\n"
        "After studying this article, you should be able to:\n\n"
        "- Define post-construction services: building administration, operations support.\n"
        "- Describe the architect's role during the occupancy and operations phase.\n"
        "- Identify services: warranty review, occupancy evaluation, maintenance planning.\n"
        "- Distinguish post-construction services from construction administration."
    ),
    "lea-prac-svc-017": (
        "## Learning Goal\n\n"
        "After studying this article, you should be able to:\n\n"
        "- Define comprehensive architectural services (full-spectrum commission).\n"
        "- Describe all phases from pre-design through post-construction under one contract.\n"
        "- Explain the advantages of a comprehensive contract for the client and architect.\n"
        "- Identify typical fee arrangements for comprehensive services."
    ),
    "lea-prac-svc-018": (
        "## Learning Goal\n\n"
        "After studying this article, you should be able to:\n\n"
        "- Define building condition assessment and its role in adaptive reuse.\n"
        "- Describe the architect's role in heritage conservation projects.\n"
        "- Explain the legal framework for heritage conservation: RA 10066, NHCP guidelines.\n"
        "- Identify the phases of a conservation project vs. new design."
    ),
    "lea-prac-svc-019": (
        "## Learning Goal\n\n"
        "After studying this article, you should be able to:\n\n"
        "- Define design-build project delivery and the architect's role within it.\n"
        "- Explain the advantages and risks of design-build for the architect.\n"
        "- Distinguish design-build from traditional design-bid-build.\n"
        "- Describe the architect's relationship with the design-build entity."
    ),
    "lea-prac-svc-020": (
        "## Learning Goal\n\n"
        "After studying this article, you should be able to:\n\n"
        "- Distinguish design-build by administration from design-build by guaranteed maximum cost.\n"
        "- Explain how the architect's role differs in each design-build variant.\n"
        "- Identify the risk allocation differences between the two methods.\n"
        "- Apply design-build variant selection to project scenarios."
    ),
    "lea-prac-svc-021": (
        "## Learning Goal\n\n"
        "After studying this article, you should be able to:\n\n"
        "- Compare project delivery methods: DBB, DB, CM at Risk, IPD.\n"
        "- Explain the architect's role in each delivery method.\n"
        "- Distinguish methods by risk allocation, owner involvement, and sequencing.\n"
        "- Apply delivery method selection criteria to project scenarios."
    ),
    "lea-prac-svc-022": (
        "## Learning Goal\n\n"
        "After studying this article, you should be able to:\n\n"
        "- Distinguish Project Architectural Design Competitions from Ideas Competitions.\n"
        "- Describe the roles of the professional advisor and jury.\n"
        "- Explain rules on competition eligibility, submission, and evaluation.\n"
        "- Identify the architect's rights regarding competition entries and copyright."
    ),
    "lea-prac-svc-023": (
        "## Learning Goal\n\n"
        "After studying this article, you should be able to:\n\n"
        "- Define urban design and planning as an architectural service.\n"
        "- Describe the architect's role in site planning, subdivision design, and community planning.\n"
        "- Explain the regulatory framework: HLURB, DPWH, LGU ordinances.\n"
        "- Distinguish urban design from architectural building design."
    ),
    "lea-prac-svc-024": (
        "## Learning Goal\n\n"
        "After studying this article, you should be able to:\n\n"
        "- Define value engineering (VE) and its purpose in architectural practice.\n"
        "- Describe the VE process: information phase, creative phase, evaluation phase.\n"
        "- Explain the ethical considerations when performing VE as an architect.\n"
        "- Distinguish value engineering from cost cutting."
    ),
    "lea-prac-svc-025": (
        "## Learning Goal\n\n"
        "After studying this article, you should be able to:\n\n"
        "- Define architectural research as a professional service.\n"
        "- Describe the types of research architects conduct: code analysis, material studies, typology.\n"
        "- Explain how research services are scoped and compensated.\n"
        "- Identify when research services require a separate agreement from design."
    ),
    "lea-prac-svc-026": (
        "## Learning Goal\n\n"
        "After studying this article, you should be able to:\n\n"
        "- Define promotional services and consulting as architectural services.\n"
        "- Describe the architect's role in client development, marketing, and public engagement.\n"
        "- Explain how consulting services differ from full design services.\n"
        "- Identify the ethical boundaries for promotional work under SPP Doc 200."
    ),

    # ── FRM ──
    "lea-prac-frm-001": (
        "## Learning Goal\n\n"
        "After studying this article, you should be able to:\n\n"
        "- Define sole proprietorship as a form of architectural practice.\n"
        "- Explain the legal requirements: DTI registration, PRC/BOA registration.\n"
        "- Describe the unlimited personal liability of the sole proprietor.\n"
        "- Distinguish sole proprietorship from partnership and corporation under RA 9266."
    ),
    "lea-prac-frm-002": (
        "## Learning Goal\n\n"
        "After studying this article, you should be able to:\n\n"
        "- Define a professional partnership for architectural practice.\n"
        "- Explain the requirements: SEC registration, partnership agreement, PRC/BOA registration.\n"
        "- Describe joint and several liability among partners.\n"
        "- Distinguish a general professional partnership from a regular business partnership."
    ),
    "lea-prac-frm-003": (
        "## Learning Goal\n\n"
        "After studying this article, you should be able to:\n\n"
        "- Define the corporate practice of architecture and its legal basis.\n"
        "- Explain the 75% RLA ownership rule (PRC Board Resolution No. 05-07).\n"
        "- Describe the restrictions on non-architect shareholders (max 25%, no directors).\n"
        "- Distinguish an architecture corporation from a regular business corporation."
    ),
    "lea-prac-frm-004": (
        "## Learning Goal\n\n"
        "After studying this article, you should be able to:\n\n"
        "- Define a joint venture in architectural practice.\n"
        "- Distinguish a joint venture from a partnership.\n"
        "- Describe when joint ventures are used: large projects, specialized expertise.\n"
        "- Explain the liability allocation in a joint venture."
    ),
    "lea-prac-frm-005": (
        "## Learning Goal\n\n"
        "After studying this article, you should be able to:\n\n"
        "- Explain the rules governing foreign architects practicing in the Philippines.\n"
        "- Identify the requirement for a Philippine-licensed architect as a counterpart.\n"
        "- Describe the limitations on foreign architectural practice per RA 9266.\n"
        "- Distinguish foreign architect registration from full Philippine licensure."
    ),
    "lea-prac-frm-006": (
        "## Learning Goal\n\n"
        "After studying this article, you should be able to:\n\n"
        "- Explain the ASEAN Mutual Recognition Arrangement (MRA) for architectural services.\n"
        "- Describe the eligibility requirements for ASEAN architects.\n"
        "- Identify how the MRA facilitates cross-border practice within ASEAN.\n"
        "- Distinguish MRA registration from the full Philippine LEA pathway."
    ),
    "lea-prac-frm-007": (
        "## Learning Goal\n\n"
        "After studying this article, you should be able to:\n\n"
        "- Define reciprocity principles in architectural licensing.\n"
        "- Explain how reciprocity applies to foreign architects seeking Philippine registration.\n"
        "- Identify countries with which the Philippines has reciprocity agreements.\n"
        "- Distinguish reciprocity from the ASEAN MRA."
    ),
    "lea-prac-frm-008": (
        "## Learning Goal\n\n"
        "After studying this article, you should be able to:\n\n"
        "- State the CPD requirements for architects: total CPD credit units per renewal period.\n"
        "- Explain the CPD renewal cycle and how it aligns with PRC ID renewal.\n"
        "- Describe the consequences of non-compliance with CPD requirements.\n"
        "- Identify the CPD Council's role in accrediting CPD programs."
    ),
    "lea-prac-frm-009": (
        "## Learning Goal\n\n"
        "After studying this article, you should be able to:\n\n"
        "- List the CPD activity types for architects: formal learning, seminars, publications, self-study.\n"
        "- Explain the CPD credit unit allocation for each activity type.\n"
        "- Distinguish among CPD categories: structured, unstructured, and self-directed.\n"
        "- Apply CPD credit tracking to renewal scenarios."
    ),
    "lea-prac-frm-010": (
        "## Learning Goal\n\n"
        "After studying this article, you should be able to:\n\n"
        "- Describe the CPD provider accreditation process.\n"
        "- Identify the CPD Council's requirements for accredited providers.\n"
        "- Explain how an architect verifies that a CPD program is accredited.\n"
        "- Distinguish CPD provider accreditation from program accreditation."
    ),
    "lea-prac-frm-011": (
        "## Learning Goal\n\n"
        "After studying this article, you should be able to:\n\n"
        "- Describe the role of government architects in DPWH, NHA, DHSUD.\n"
        "- Explain the in-house design function of government agencies.\n"
        "- Distinguish government architectural practice from private practice.\n"
        "- Identify the legal basis for government architect roles."
    ),
    "lea-prac-frm-012": (
        "## Learning Goal\n\n"
        "After studying this article, you should be able to:\n\n"
        "- Explain the architecture-relevant provisions of RA 9184 (Government Procurement Reform Act).\n"
        "- Describe the bidding requirements for government architectural projects.\n"
        "- Identify the architect's role in government procurement.\n"
        "- Distinguish RA 9184 from private procurement rules."
    ),
    "lea-prac-frm-013": (
        "## Learning Goal\n\n"
        "After studying this article, you should be able to:\n\n"
        "- Describe COA audit requirements for publicly funded architectural projects.\n"
        "- Explain the architect's obligations regarding documentation and compliance.\n"
        "- Identify common COA audit findings on architectural projects.\n"
        "- Apply COA compliance rules to government project scenarios."
    ),
    "lea-prac-frm-014": (
        "## Learning Goal\n\n"
        "After studying this article, you should be able to:\n\n"
        "- Describe the status of BIM adoption in Philippine architectural practice.\n"
        "- Explain the architect's obligations regarding BIM deliverables.\n"
        "- Identify the practice implications of BIM: digital signing, liability, data ownership.\n"
        "- Distinguish BIM from traditional CAD workflows in a practice context."
    ),
    "lea-prac-frm-015": (
        "## Learning Goal\n\n"
        "After studying this article, you should be able to:\n\n"
        "- Explain the architect's obligations under RA 10173 (Data Privacy Act).\n"
        "- Describe how DPA applies to client information, project data, and employee records.\n"
        "- Identify required data protection measures for architectural firms.\n"
        "- Apply DPA compliance rules to practice scenarios."
    ),
    "lea-prac-frm-016": (
        "## Learning Goal\n\n"
        "After studying this article, you should be able to:\n\n"
        "- Describe the BERDE rating system and its role in Philippine green building.\n"
        "- Explain the Philippine Green Building Standards and the architect's role.\n"
        "- Identify the certification process and rating levels.\n"
        "- Distinguish BERDE from other green building rating systems (LEED, EDGE)."
    ),
    "lea-prac-frm-017": (
        "## Learning Goal\n\n"
        "After studying this article, you should be able to:\n\n"
        "- Describe environmental laws affecting architectural practice: EIA, DENR regulations, DAO 2020.\n"
        "- Explain when an Environmental Compliance Certificate (ECC) is required.\n"
        "- Identify the architect's obligations under environmental impact assessment rules.\n"
        "- Apply environmental law compliance to project scenarios."
    ),
    "lea-prac-frm-018": (
        "## Learning Goal\n\n"
        "After studying this article, you should be able to:\n\n"
        "- Explain universal design principles under BP 344 and RA 7277.\n"
        "- Describe the architect's affirmative duty to design for accessibility.\n"
        "- Identify minimum accessibility requirements: ramps, door widths, restrooms.\n"
        "- Apply universal design requirements to building design scenarios."
    ),
    "lea-prac-frm-019": (
        "## Learning Goal\n\n"
        "After studying this article, you should be able to:\n\n"
        "- Define project management within an architectural firm.\n"
        "- Describe the four pillars: scope, schedule, budget, communication.\n"
        "- Explain the architect's role as project manager vs. design lead.\n"
        "- Identify project management tools and techniques relevant to practice."
    ),
    "lea-prac-frm-020": (
        "## Learning Goal\n\n"
        "After studying this article, you should be able to:\n\n"
        "- Describe technical specification writing and the CSI MasterFormat system.\n"
        "- Distinguish specification types: prescriptive, performance, proprietary.\n"
        "- Explain the architect's role in preparing specifications.\n"
        "- Identify the relationship between drawings and specifications."
    ),
    "lea-prac-frm-021": (
        "## Learning Goal\n\n"
        "After studying this article, you should be able to:\n\n"
        "- Describe quantity surveying and cost estimation in architectural practice.\n"
        "- Distinguish the architect's role from the QS professional's role.\n"
        "- Explain the levels of cost estimates: order-of-magnitude, budget, definitive.\n"
        "- Apply cost estimation concepts to project fee calculations."
    ),

    # ── CMP ──
    "lea-prac-cmp-001": (
        "## Learning Goal\n\n"
        "After studying this article, you should be able to:\n\n"
        "- Describe the architect's fee structure under the percentage-of-PCC method.\n"
        "- Identify the 10 Project Classification Groups and their fee percentages.\n"
        "- Distinguish DAEDS from DADS rates.\n"
        "- Explain the ₱50M sliding scale for Groups 1–3."
    ),
    "lea-prac-cmp-002": (
        "## Learning Goal\n\n"
        "After studying this article, you should be able to:\n\n"
        "- Explain the factors that determine project group classification.\n"
        "- Distinguish Groups 1–5 by complexity and building type.\n"
        "- Describe the decision framework for classifying a project.\n"
        "- Apply classification criteria to exam scenarios."
    ),
    "lea-prac-cmp-003": (
        "## Learning Goal\n\n"
        "After studying this article, you should be able to:\n\n"
        "- Define Project Construction Cost (PCC) and its inclusions.\n"
        "- Identify what is included in PCC: materials, labor, equipment, contractor overhead.\n"
        "- Explain what is excluded: land, architect's fee, owner's administrative costs.\n"
        "- Calculate the architect's basic fee using PCC × percentage."
    ),
    "lea-prac-cmp-004": (
        "## Learning Goal\n\n"
        "After studying this article, you should be able to:\n\n"
        "- Describe the schedule of payments per SPP Doc 202 phase.\n"
        "- Identify phase percentages: SD (20%), DD (20%), CD (30%), Bidding (5%), CA (25%).\n"
        "- Explain the architect's invoicing timeline tied to phase completion.\n"
        "- Apply payment schedule rules to fee computation scenarios."
    ),
    "lea-prac-cmp-005": (
        "## Learning Goal\n\n"
        "After studying this article, you should be able to:\n\n"
        "- Describe the fee structures for specialized architectural services.\n"
        "- Explain how specialized services (interior design, urban planning) are compensated.\n"
        "- Identify the SPP documents that govern specialized service fees.\n"
        "- Distinguish specialized service fees from basic service fees."
    ),
    "lea-prac-cmp-006": (
        "## Learning Goal\n\n"
        "After studying this article, you should be able to:\n\n"
        "- Define Multiple of Direct Personnel Expense (MDPE) and its formula.\n"
        "- Identify the components of MDPE: DPE × Multiplier.\n"
        "- Calculate MDPE for a given project scenario.\n"
        "- Distinguish MDPE from the percentage-of-PCC method."
    ),
    "lea-prac-cmp-007": (
        "## Learning Goal\n\n"
        "After studying this article, you should be able to:\n\n"
        "- Describe the MDPE multiplier components: overhead, profit, non-technical factors.\n"
        "- State the typical MDPE multiplier range in Philippine practice (1.5–3.5).\n"
        "- Explain how firm size and project complexity affect the multiplier.\n"
        "- Calculate the architect's fee using the MDPE method."
    ),
    "lea-prac-cmp-008": (
        "## Learning Goal\n\n"
        "After studying this article, you should be able to:\n\n"
        "- Compare MDPE and percentage-of-PCC as compensation methods.\n"
        "- Describe when to use each method based on project characteristics.\n"
        "- Use the decision matrix to select the appropriate fee method.\n"
        "- Apply method selection criteria to exam scenarios."
    ),
    "lea-prac-cmp-009": (
        "## Learning Goal\n\n"
        "After studying this article, you should be able to:\n\n"
        "- Define lump sum or fixed fee compensation.\n"
        "- Explain the scope, discipline, and risk allocation of a fixed fee.\n"
        "- Identify when a lump sum fee is appropriate vs. risky.\n"
        "- Distinguish lump sum from percentage-of-PCC and MDPE."
    ),
    "lea-prac-cmp-010": (
        "## Learning Goal\n\n"
        "After studying this article, you should be able to:\n\n"
        "- Define per diem, retainer, and honorarium as compensation types.\n"
        "- Distinguish each method by scope and billing basis.\n"
        "- Explain when each method is used in Philippine practice.\n"
        "- Apply fee method selection to specific service scenarios."
    ),
    "lea-prac-cmp-011": (
        "## Learning Goal\n\n"
        "After studying this article, you should be able to:\n\n"
        "- Define reimbursable expenses and what qualifies.\n"
        "- Distinguish reimbursable expenses (billable to client) from absorbed expenses (included in fee).\n"
        "- Describe the documentation required for billing reimbursables.\n"
        "- Apply reimbursement rules to practice expense scenarios."
    ),
    "lea-prac-cmp-012": (
        "## Learning Goal\n\n"
        "After studying this article, you should be able to:\n\n"
        "- Describe reduced fees for repetitive designs.\n"
        "- Explain the justification for fee reductions on repeat projects.\n"
        "- Identify the percentage reduction for subsequent units.\n"
        "- Apply reduced fee rules to multi-unit project scenarios."
    ),
    "lea-prac-cmp-013": (
        "## Learning Goal\n\n"
        "After studying this article, you should be able to:\n\n"
        "- Describe the architect's right to compensation for abandoned projects.\n"
        "- Explain how partial services are compensated when a project is discontinued.\n"
        "- Identify the rules protecting the architect's compensation.\n"
        "- Apply abandonment compensation rules to exam scenarios."
    ),
}

# ── Related Articles cross-references (category-based) ──

RELATED_ARTICLES = {
    "law": (
        "## Related Articles\n\n"
        "- [RA 9266: Structure and Key Definitions](lea-prac-law-001)\n"
        "- [Scope of Practice](lea-prac-law-002)\n"
        "- [PRBoA Powers and Functions](lea-prac-law-005)\n"
        "- [PRC vs. PRBoA](lea-prac-law-006)\n"
        "- [Civil Code Article 1723 Liability](lea-prac-law-010)\n"
        "- [Signing and Sealing Rules](lea-prac-law-017)\n"
        "- [Code of Ethical Conduct](lea-prac-eth-001)\n"
        "- [Professional Practice Forms](lea-prac-frm-001)"
    ),
    "eth": (
        "## Related Articles\n\n"
        "- [RA 9266: Legal Framework](lea-prac-law-001)\n"
        "- [Prohibited Acts and Penalties](lea-prac-law-003)\n"
        "- [Grounds for Suspension and Revocation](lea-prac-eth-008)\n"
        "- [Non-Poaching and Professional Courtesy](lea-prac-eth-006)\n"
        "- [Obligations to Contractors](lea-prac-eth-007)\n"
        "- [Conflict of Interest](lea-prac-eth-010)\n"
        "- [Scope of Practice](lea-prac-law-002)\n"
        "- [Signing and Sealing Prohibition](lea-prac-law-017)"
    ),
    "ctr": (
        "## Related Articles\n\n"
        "- [Standard Owner-Architect Agreement](lea-prac-ctr-001)\n"
        "- [Basic vs. Additional Services](lea-prac-ctr-002)\n"
        "- [Suspension and Termination](lea-prac-ctr-003)\n"
        "- [Bid Documents and Addenda](lea-prac-ctr-008)\n"
        "- [Performance Bonds](lea-prac-ctr-010)\n"
        "- [Certificates of Payment](lea-prac-ctr-014)\n"
        "- [Retention Money](lea-prac-ctr-015)\n"
        "- [Change Orders](lea-prac-ctr-016)\n"
        "- [Dispute Resolution](lea-prac-ctr-020)\n"
        "- [Fee Compensation Methods](lea-prac-cmp-001)"
    ),
    "svc": (
        "## Related Articles\n\n"
        "- [SPP Doc 202 Six-Phase Framework](lea-prac-svc-004)\n"
        "- [Schematic Design Phase](lea-prac-svc-005)\n"
        "- [Design Development Phase](lea-prac-svc-006)\n"
        "- [Contract Documents Phase](lea-prac-svc-007)\n"
        "- [Bidding and Construction Admin](lea-prac-svc-008)\n"
        "- [Pre-Design Services](lea-prac-svc-001)\n"
        "- [Specialized Services](lea-prac-svc-009)\n"
        "- [Design-Build Delivery](lea-prac-svc-019)\n"
        "- [Fee Compensation Methods](lea-prac-cmp-001)\n"
        "- [Owner-Architect Agreement](lea-prac-ctr-001)"
    ),
    "frm": (
        "## Related Articles\n\n"
        "- [Sole Proprietorship](lea-prac-frm-001)\n"
        "- [Partnership](lea-prac-frm-002)\n"
        "- [Corporate Practice](lea-prac-frm-003)\n"
        "- [Joint Venture](lea-prac-frm-004)\n"
        "- [Foreign Architects](lea-prac-frm-005)\n"
        "- [ASEAN MRA](lea-prac-frm-006)\n"
        "- [CPD Requirements](lea-prac-frm-008)\n"
        "- [RA 9266 Legal Framework](lea-prac-law-001)\n"
        "- [Government Procurement](lea-prac-frm-012)\n"
        "- [Environmental Laws](lea-prac-frm-017)"
    ),
    "cmp": (
        "## Related Articles\n\n"
        "- [Project Classification Groups](lea-prac-cmp-001)\n"
        "- [Factors Determining Classification](lea-prac-cmp-002)\n"
        "- [Project Construction Cost](lea-prac-cmp-003)\n"
        "- [Schedule of Payments](lea-prac-cmp-004)\n"
        "- [MDPE Formula](lea-prac-cmp-006)\n"
        "- [MDPE Multipliers](lea-prac-cmp-007)\n"
        "- [MDPE vs. Percentage of PCC](lea-prac-cmp-008)\n"
        "- [Reimbursable Expenses](lea-prac-cmp-011)\n"
        "- [SPP Doc 202 Phase Framework](lea-prac-svc-004)\n"
        "- [Standard Owner-Architect Agreement](lea-prac-ctr-001)"
    ),
}

# ──────────────────────────────────────────────
# Helper functions
# ──────────────────────────────────────────────

def get_category(slug):
    """Determine article category from slug."""
    if "lea-prac-law-" in slug:
        return "law"
    if "lea-prac-eth-" in slug:
        return "eth"
    if "lea-prac-ctr-" in slug:
        return "ctr"
    if "lea-prac-svc-" in slug:
        return "svc"
    if "lea-prac-frm-" in slug:
        return "frm"
    if "lea-prac-cmp-" in slug:
        return "cmp"
    return None


def compute_sha256(text):
    return "sha256:" + hashlib.sha256(text.encode("utf-8")).hexdigest()


def fix_lawcallout_codes(content, category):
    """
    Fix LawCallout code references.
    For law articles: code='ra9266' is expected, fix 'nbcp' and 'irr' codes.
    """
    # Fix LawCallout blocks with wrong code
    # Pattern: code=nbcp or code=irr -> should be code=ra9266 for practice articles
    if category in ("law", "eth", "ctr", "frm"):
        # Fix code=nbcp to code=ra9266 in LawCallout blocks
        content = re.sub(
            r'(code=nbcp)(?=[,\s])',
            'code=ra9266',
            content
        )
        # Fix code=irr to code=ra9266 in LawCallout blocks 
        # (IRR is referenced in the text, but code ref should be ra9266)
        content = re.sub(
            r'(code=irr)(?=[,\s])',
            'code=ra9266',
            content
        )
    return content


def strengthen_ui_blocks(content, slug):
    """
    Strengthen ExamTips and Warnings by replacing weak text with stronger content.
    For ExamTip: Add specific LEA question patterns
    For Warn: Add stronger cautionary language
    """
    # Pattern to match ExamTip blocks and extract the summary text
    def strengthen_examtip(match):
        full = match.group(0)
        summary_match = re.search(r'Extracted summary:\n- Props: (.*?)\n- Text: (.+?)(?=\n\[/SLATECAMP_UI_BLOCK\]|\n\[/SLATECAMP)', full, re.DOTALL)
        if summary_match:
            props = summary_match.group(1)
            text = summary_match.group(2).strip()
            # If text starts with "LEA" or is short generic tip, strengthen it
            if text.startswith("**LEA") or len(text) < 80:
                # Add stronger language
                new_text = text.rstrip('.')
                if "LEA" not in new_text:
                    new_text = f"**LEA Must-Know:** {new_text}"
                else:
                    if not new_text.endswith("— memorize this for the exam."):
                        new_text = new_text.rstrip('.') + " — this distinction appears on every LEA cycle."
                # Rebuild
                new_full = full.replace(props, props).replace(
                    f"Text: {text}",
                    f"Text: {new_text}"
                )
                return new_full.replace(
                    f"Extracted summary:\n- Props: {props}\n- Text: {text}",
                    f"Extracted summary:\n- Props: {props}\n- Text: {new_text}"
                )
        return full

    # Pattern to match Warn blocks
    def strengthen_warn(match):
        full = match.group(0)
        summary_match = re.search(r'Extracted summary:\n- Props: (.*?)\n- Text: (.+?)(?=\n\[/SLATECAMP_UI_BLOCK\]|\n\[/SLATECAMP)', full, re.DOTALL)
        if summary_match:
            props = summary_match.group(1)
            text = summary_match.group(2).strip()
            # Add ⚠️ if not present
            if "⚠" not in text:
                new_text = f"⚠️ {text}"
                if "LEA" not in new_text:
                    new_text += " — expect this as a trap answer on the LEA."
                new_full = full.replace(
                    f"Text: {text}",
                    f"Text: {new_text}"
                )
                return new_full
        return full

    content = re.sub(r'\[SLATECAMP_UI_BLOCK:ui_\d+ component="ExamTip".*?\[/SLATECAMP_UI_BLOCK\]', strengthen_examtip, content, flags=re.DOTALL)
    content = re.sub(r'\[SLATECAMP_UI_BLOCK:ui_\d+ component="Warn".*?\[/SLATECAMP_UI_BLOCK\]', strengthen_warn, content, flags=re.DOTALL)
    return content


def replace_learning_goal(content, slug, category):
    """Replace generic learning goals with specific ones."""
    # Find key prefix (first part of slug before the UUID)
    for key in sorted(LEARNING_GOALS.keys(), reverse=True):
        if slug.startswith(key):
            new_goal = LEARNING_GOALS[key]
            break
    else:
        # Fallback: generic but still better than boilerplate
        category_map = {
            "law": "legal provisions, regulatory bodies, and professional liabilities",
            "eth": "ethical obligations, prohibited conduct, and disciplinary procedures",
            "ctr": "contract provisions, bonds, bidding procedures, and dispute resolution",
            "svc": "service phases, deliverables, compensation methods, and project delivery",
            "frm": "practice structures, registration requirements, CPD, and regulatory compliance",
            "cmp": "fee computation methods, payment schedules, and compensation rules",
        }
        topics = category_map.get(category, "key architectural practice concepts")
        new_goal = (
            f"## Learning Goal\n\n"
            f"After studying this article, you should be able to:\n\n"
            f"- Identify and explain the {topics} tested on the LEA.\n"
            f"- Apply relevant code provisions and standards to exam scenarios.\n"
            f"- Distinguish between different rules, roles, and procedures in architectural practice."
        )

    # Define the old patterns to replace
    old_patterns = [
        # Generic "After reading this article, you should understand the key concepts tested in the LEA..."
        r'## Learning Goal\n\nAfter reading this article, you should understand the key concepts tested in the LEA for this topic, including relevant code provisions, dimensional standards, and common exam applications\.',
        # What You Need to Know for the LEA pattern
        r'## What You Need to Know for the LEA\n## Learning Goal\nAfter reading this article, you should understand the key concepts tested in the LEA for this topic, including relevant code provisions, dimensional standards, and common exam applications\.',
        r'## What You Need to Know for the LEA\n## Learning Goal\nAfter reading this article, you should understand the key concepts tested in the LEA for this topic, including the four-tiered obligations under SPP Document 200, the enforcement role of PRBoA, and common exam scenarios testing ethical prioritization\.',
        # Multi-paragraph generic learning goals
        r'## Learning Goal\n\nAfter reading this article, you should be able to:\n\n- Identify and explain key legal provisions under RA 9266 and related laws tested on the LEA\.\n- Apply statutory definitions, qualifications, and procedural rules to exam scenarios\.\n- Distinguish between the roles, powers, and liabilities of different actors in architectural practice\.',
        # The specific text that follows a triple-dash separator
        r'\n\n---\n\n### Learning Goal\nAfter reading this article, you should be able to: explain what RA 9266 replaced, describe the structure and qualifications of the PRBoA, distinguish three key architectural roles under the law, and correctly cite the sections that govern them\.',
        # Generic multi-line
        r'## Learning Goal\n\nAfter reading this article, you should be able to:\n\n- Identify the different practice frameworks available to architects — sole proprietorship, partnership, corporation, and joint venture\.\n- Explain the legal and procedural requirements for each practice framework under Philippine law\.\n- Apply practice framework selection criteria to given professional scenarios for exam questions\.',
        # Another generic pattern
        r'## Learning Goal\n\nIdentify the core provisions, phase structure, and key obligations in a standard Owner-Architect agreement, including compensation methods, termination rights, and dispute resolution mechanisms\.',
    ]

    for pattern in old_patterns:
        if re.search(pattern, content):
            content = re.sub(pattern, new_goal, content)
            break
    else:
        # If no pattern matched, try simpler approaches
        # Find any "## Learning Goal" section and replace it
        content = re.sub(
            r'## Learning Goal\n\n.*?(?=\n\n###|\n\n---|\n\n\[SLATECAMP|\n\n##(?!Learning Goal))',
            new_goal + "\n\n",
            content,
            count=1,
            flags=re.DOTALL
        )

    # Also remove any "### Learning Goal" duplicated after a --- separator
    content = re.sub(
        r'\n\n---\n\n### Learning Goal\n.*?(?=\n\n---|\n\n###|\n\n\[)',
        '',
        content,
        flags=re.DOTALL
    )

    # Remove "Why This Matters for the LEA" if it exists alongside the new goal
    content = re.sub(
        r'\n\n### Why This Matters for the LEA\n\n.*?(?=\n\n---|\n\n###|\n\n\[)',
        '',
        content,
        flags=re.DOTALL
    )

    # Remove stray "---" separators that were between removed sections
    content = re.sub(r'\n\n---\n\n---\n\n', '\n\n---\n\n', content)

    return content


def add_related_articles(content, category):
    """Add Related Articles section before the last --- separator or at end."""
    if category in RELATED_ARTICLES:
        related = RELATED_ARTICLES[category]
        # Check if already has a Related Articles section
        if "## Related Articles" in content:
            return content
        # Add before the last '---' if present, or at the end
        last_sep = content.rfind("\n---\n")
        if last_sep > len(content) * 0.5:  # only use if it's in the latter half
            content = content[:last_sep] + "\n\n" + related + "\n\n---" + content[last_sep + 5:]
        else:
            content = content.rstrip() + "\n\n---\n\n" + related + "\n"
    return content


def process_article(dirpath, dry_run=False):
    """Process a single article directory."""
    slug = dirpath.name
    normalized_path = dirpath / "normalized.md"
    metadata_path = dirpath / "article-metadata.json"

    if not normalized_path.exists():
        print(f"  SKIP (no normalized.md): {slug}")
        return None

    with open(normalized_path, "r") as f:
        content = f.read()

    category = get_category(slug)
    if not category:
        print(f"  SKIP (unknown category): {slug}")
        return None

    changes_made = []

    # 1. Replace generic learning goals
    old_content = content
    content = replace_learning_goal(content, slug, category)
    if content != old_content:
        changes_made.append("learning_goal")

    # 2. Fix LawCallout codes
    old_content = content
    content = fix_lawcallout_codes(content, category)
    if content != old_content:
        changes_made.append("lawcallout_fix")

    # 3. Strengthen ExamTips and Warnings
    old_content = content
    content = strengthen_ui_blocks(content, slug)
    if content != old_content:
        changes_made.append("tips_strengthened")

    # 4. Add related articles
    old_content = content
    content = add_related_articles(content, category)
    if content != old_content:
        changes_made.append("related_articles")

    if not changes_made:
        print(f"  NO CHANGES: {slug}")
        return None

    if not dry_run:
        # Write updated normalized.md
        with open(normalized_path, "w") as f:
            f.write(content)

        # Update normalized_content_hash in metadata
        new_hash = compute_sha256(content)
        if metadata_path.exists():
            with open(metadata_path, "r") as f:
                metadata = json.load(f)
            metadata["normalized_content_hash"] = new_hash
            with open(metadata_path, "w") as f:
                json.dump(metadata, f, indent=2)
            changes_made.append(f"hash={new_hash[:20]}...")

    return changes_made


def main():
    import argparse
    parser = argparse.ArgumentParser(description="Polish lea-prac-* articles")
    parser.add_argument("--dry-run", action="store_true", help="Don't write changes")
    parser.add_argument("--limit", type=int, default=0, help="Max articles to process")
    parser.add_argument("--category", choices=["law", "eth", "ctr", "svc", "frm", "cmp"], help="Process only this category")
    parser.add_argument("--stats", action="store_true", help="Show category stats only")
    args = parser.parse_args()

    # Find all unique article directories
    import subprocess
    result = subprocess.run(
        "find /Users/philiplewis/slatecamp/.ai/content-audit-export/articles -maxdepth 1 -type d -name '*lea-prac*'",
        shell=True, capture_output=True, text=True
    )
    dirs = sorted(set(result.stdout.strip().split("\n")))
    dirs = [Path(d) for d in dirs if d]

    # Deduplicate by UUID
    seen_uuids = set()
    unique_dirs = []
    for d in dirs:
        uuid_part = d.name.split("--")[-1] if "--" in d.name else d.name
        if uuid_part not in seen_uuids:
            seen_uuids.add(uuid_part)
            unique_dirs.append(d)

    dirs = unique_dirs

    # Stats
    counts = {"law": 0, "eth": 0, "ctr": 0, "svc": 0, "frm": 0, "cmp": 0}
    for d in dirs:
        cat = get_category(d.name)
        if cat:
            counts[cat] += 1

    print(f"\n{'='*60}")
    print(f"LEA-PRAC Article Polish — Pass 7")
    print(f"{'='*60}")
    print(f"Total unique articles: {len(dirs)}")
    for cat, count in sorted(counts.items()):
        print(f"  {cat}: {count}")
    print()

    if args.stats:
        return

    # Filter by category
    if args.category:
        dirs = [d for d in dirs if get_category(d.name) == args.category]
        print(f"Filtered to category '{args.category}': {len(dirs)} articles\n")

    # Limit
    if args.limit > 0:
        dirs = dirs[:args.limit]
        print(f"Limited to {args.limit} articles\n")

    success = 0
    no_change = 0
    failed = 0

    print(f"{'─'*60}")
    for i, d in enumerate(dirs, 1):
        slug_short = d.name[:60]
        print(f"[{i:3d}/{len(dirs):3d}] {slug_short}...")
        try:
            result = process_article(d, dry_run=args.dry_run)
            if result is None:
                no_change += 1
            else:
                success += 1
                print(f"       Changes: {', '.join(result[:3])}")
        except Exception as e:
            print(f"       ERROR: {e}")
            failed += 1

    print(f"{'─'*60}")
    action = " (DRY RUN)" if args.dry_run else ""
    print(f"\nResults{action}:")
    print(f"  Modified: {success}")
    print(f"  No changes: {no_change}")
    print(f"  Failed: {failed}")
    print(f"  Total: {success + no_change + failed}")
    print(f"{'='*60}\n")


if __name__ == "__main__":
    main()
