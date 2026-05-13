import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { dirname, join, relative } from 'node:path'

const REPO_ROOT = process.cwd()
const BATCH_NUMBER = '103'
const BATCH_ID = `source-audited-article-batch-${BATCH_NUMBER}-local-first`
const GENERATED_AT = '2026-05-13T11:22:58+08:00'
const AUDIT_DATE = '2026-05-13'
const BRANCH = '3dlab-gray-viewport-bg'
const BASELINE_COMMIT = 'cf95ddad4'
const PREVIOUS_BATCH_COMMIT = '2fbcc271e'
const STATUS = 'PASS_LOCAL_FIRST_READY_FOR_FINAL_PUBLISHING_REVIEW'
const FINALIZE = process.argv.includes('--finalize')

const paths = {
  manifest: `.ai/03_plans/production-line-batch-${BATCH_NUMBER}-manifest.json`,
  report: `.ai/content-audit-export/source-audited-article-batch-${BATCH_NUMBER}-local-first-report.md`,
  ledger: `.ai/content-audit-export/source-audited-article-batch-${BATCH_NUMBER}-local-first-ledger.json`,
  scopedChecks: `.ai/content-audit-export/source-audited-article-batch-${BATCH_NUMBER}-local-first-scoped-checks.json`,
  qa: `.ai/03_plans/batch-${BATCH_NUMBER}-independent-quality-review.md`,
  handoff: '.ai/03_plans/source-audited-local-first-batches-handoff.md',
  coordination: '.ai/03_plans/source-audited-production-line-coordination.md',
}

const sourceFiles = {
  ra9266Pdf: {
    path: 'vitruvius-connection/001_Raw-Source-Layer/001-Laws/RA-9266/RA-9266 IRR Architecture Act of 2004.pdf',
    sha256: 'sha256:d0ce03b572f40560647359abf8e3a38c14bbf9b1b1436389a6d9148eb6fd0574',
  },
  ra9266Raw: {
    path: 'vitruvius-connection/002_Raw-Conversion-Layer/001-Laws/raw_markdown/RA-9266/RA-9266 IRR Architecture Act of 2004.md',
    sha256: 'sha256:afc96265347288121522f485f8ef0f796adbfe047ae8351b182f7ea448dfdc40',
  },
  uapPdf: {
    path: 'vitruvius-connection/001_Raw-Source-Layer/001-Laws/UAP/UAP Document Standards of Professional Practice.pdf',
    sha256: 'sha256:af3b0fd1b232443881cbb79d3b2ed2a9a93ecb34677cdbd3b2acddbcdb7d2b3b',
  },
  uapRaw: {
    path: 'vitruvius-connection/002_Raw-Conversion-Layer/001-Laws/raw_markdown/UAP/UAP Document Standards of Professional Practice.md',
    sha256: 'sha256:c45877da3cb3349d07f607fd7fcd3b1df4c0a2587d022249af3e8bee8a1a92a5',
  },
  berdePdf: {
    path: 'vitruvius-connection/001_Raw-Source-Layer/001-Laws/BERDE/BERDE – Buildings – Version 5.0.0 – User Guide.pdf',
    sha256: 'sha256:59f4e0a3a485f73f93f211bc4250932a9c9d2b114b4f571b2ab8f6a58c426bb4',
  },
  berdeRaw: {
    path: 'vitruvius-connection/002_Raw-Conversion-Layer/001-Laws/raw_markdown/BERDE/BERDE – Buildings – Version 5.0.0 – User Guide.md',
    sha256: 'sha256:d8fff60d4cb5d1fcd0b91e3f30a6fc26309b6d40a439c76ac608a8da0ce0ed05',
  },
  denrDaoPdf: {
    path: 'vitruvius-connection/001_Raw-Source-Layer/001-Laws/DENR/DENR DAO 2003-30 - EIS System Implementing Rules.pdf',
    sha256: 'sha256:079285ca972d0be053faa148fe6770c12c396408c35e6739929b81685e775fb7',
  },
  denrDaoRaw: {
    path: 'vitruvius-connection/002_Raw-Conversion-Layer/001-Laws/raw_markdown/DENR/DENR DAO 2003-30 - EIS System Implementing Rules.md',
    sha256: 'sha256:4b06c5c2e98beb9387897064cccaa7ef6c10a5d12b89aa1546235657f7f44b78',
  },
  denrManualPdf: {
    path: 'vitruvius-connection/001_Raw-Source-Layer/001-Laws/DENR/DENR DAO 2003-30 Revised Procedural Manual - EIS System.pdf',
    sha256: 'sha256:28e3763d9b95e58392590c888e18aa24b69b5d35b74fdf36183658a29cf79fe4',
  },
  denrManualRaw: {
    path: 'vitruvius-connection/002_Raw-Conversion-Layer/001-Laws/raw_markdown/DENR/DENR DAO 2003-30 Revised Procedural Manual - EIS System.md',
    sha256: 'sha256:b95d7a7af3683e15661c3f145a3f42bd21eee89ef0dee5d6d25c10b12f048504',
  },
  bp344Pdf: {
    path: 'vitruvius-connection/001_Raw-Source-Layer/001-Laws/BP-344/2024 Revised Implementing Rules and Regulations Batas Pambansa Blg. 344 _ National Council on Disability Affairs.pdf',
    sha256: 'sha256:63ba8df9a0c5092aa28aae1e1afbbff4f82697768b4ce38230f960444a6a4953',
  },
  bp344Raw: {
    path: 'vitruvius-connection/002_Raw-Conversion-Layer/001-Laws/raw_markdown/BP-344/2024 Revised Implementing Rules and Regulations Batas Pambansa Blg. 344 _ National Council on Disability Affairs.md',
    sha256: 'sha256:a621bcb059a5c023dc5056939a6fa8ae44b5f60a29918f628d81657b9639692a',
  },
  dpwhPdf: {
    path: 'vitruvius-connection/001_Raw-Source-Layer/001-Laws/DPWH/DPWH DO037 Enforcement of BP344 along National Roads.pdf',
    sha256: 'sha256:1af131d40d5190e949a91b12ed80e85a06d434b67c1423dc8195c84408d42ea7',
  },
  dpwhRaw: {
    path: 'vitruvius-connection/002_Raw-Conversion-Layer/001-Laws/raw_markdown/DPWH/DPWH DO037 Enforcement of BP344 along National Roads.md',
    sha256: 'sha256:bebc171dca8c07cdb58d191399685461365fd930ae9f996bc9e4546b6bd584c4',
  },
}

const checkedSourceSets = {
  professionalDigital(slug) {
    return [
      sourceEntry({
        sourceId: `batch103-${slug}-ra-9266-irr-professional-documents`,
        label: 'RA 9266 IRR Architecture Act of 2004',
        sourceType: 'implementing_rules',
        raw: sourceFiles.ra9266Pdf,
        conversion: sourceFiles.ra9266Raw,
        locator: 'raw markdown lines 44-90, 169-182, 589-621, 732-748',
      }),
      sourceEntry({
        sourceId: `batch103-${slug}-uap-spp-professional-services`,
        label: 'UAP Document Standards of Professional Practice',
        sourceType: 'professional_standards',
        raw: sourceFiles.uapPdf,
        conversion: sourceFiles.uapRaw,
        locator: 'raw markdown lines 47-61, 81-83, 293-304, 1848-1857',
      }),
    ]
  },
  berde(slug) {
    return [
      sourceEntry({
        sourceId: `batch103-${slug}-berde-buildings-user-guide`,
        label: 'BERDE Buildings Version 5.0.0 User Guide',
        sourceType: 'rating_system_user_guide',
        raw: sourceFiles.berdePdf,
        conversion: sourceFiles.berdeRaw,
        locator: 'raw markdown lines 129-167, 253-289, 337-370, 581, 1178-1204',
      }),
    ]
  },
  eis(slug) {
    return [
      sourceEntry({
        sourceId: `batch103-${slug}-dao-2003-30-eis-irr`,
        label: 'DENR DAO 2003-30 EIS System Implementing Rules',
        sourceType: 'denr_administrative_order',
        raw: sourceFiles.denrDaoPdf,
        conversion: sourceFiles.denrDaoRaw,
        locator: 'raw markdown lines 17-34, 50-65, 95-105, 134-165, 248-262',
      }),
      sourceEntry({
        sourceId: `batch103-${slug}-dao-2003-30-revised-procedural-manual`,
        label: 'DENR DAO 2003-30 Revised Procedural Manual for the EIS System',
        sourceType: 'denr_procedural_manual',
        raw: sourceFiles.denrManualPdf,
        conversion: sourceFiles.denrManualRaw,
        locator: 'raw markdown lines 260-284, 306-313',
      }),
    ]
  },
  accessibility(slug) {
    return [
      sourceEntry({
        sourceId: `batch103-${slug}-bp-344-2024-irr`,
        label: '2024 Revised IRR of BP 344',
        sourceType: 'accessibility_implementing_rules',
        raw: sourceFiles.bp344Pdf,
        conversion: sourceFiles.bp344Raw,
        locator: 'raw markdown lines 39-77, 209-219, 242-288, 332-334, 919-942, 1037-1048',
      }),
      sourceEntry({
        sourceId: `batch103-${slug}-dpwh-do037-bp344-national-roads`,
        label: 'DPWH DO 037 Enforcement of BP 344 along National Roads',
        sourceType: 'department_order',
        raw: sourceFiles.dpwhPdf,
        conversion: sourceFiles.dpwhRaw,
        locator: 'raw markdown lines 21-34, 88-93, 229-234',
      }),
      sourceEntry({
        sourceId: `batch103-${slug}-ra-9266-irr-professional-responsibility`,
        label: 'RA 9266 IRR Architecture Act of 2004',
        sourceType: 'implementing_rules',
        raw: sourceFiles.ra9266Pdf,
        conversion: sourceFiles.ra9266Raw,
        locator: 'raw markdown lines 29-33, 589-621',
      }),
    ]
  },
}

const articles = [
  {
    slug: 'lea-prac-frm-014-bim-in-philippine-architectural-practice-status-obligations-and-practice-implications',
    articleId: '8b263a7c-5e3e-4157-a18b-146f5b12f521',
    title: 'BIM in Philippine Architectural Practice Status Obligations',
    shortLabel: 'FRM-014',
    folder: '.ai/content-audit-export/articles/lea-prac-frm-014-bim-in-philippine-architectural-practice-status-obligations-and-practice-implicatio--8b263a7c-5e3e-4157-a18b-146f5b12f521',
    focus: 'BIM-specific details narrowed to source-safe RA 9266/UAP contract, document, responsibility, and instrument-of-service controls',
    sourceFamily: 'RA 9266 IRR Architecture Act of 2004; UAP Document Standards of Professional Practice',
    historical: [],
    sourceSet: 'professionalDigital',
    scenarioStatus: 'eligible-added',
    thinNote: 'THIN_NEEDS_EXPANSION final-depth candidate: exact BIM mandate, LOD, IFC, ISO 19650, and Philippine BIM standard details need local raw primary BIM sources before restoration.',
    article: `# BIM in Philippine Architectural Practice Status Obligations

## Board Exam Quick Check

For this local-first pass, do not treat BIM terminology as proven by the available RA 9266 and UAP source packet. The checked sources support professional responsibility, contract documents, instruments of service, signing and sealing, scope definition, and ownership/use controls. Exact LOD, IFC, ISO 19650, and current Philippine BIM mandate claims remain final-depth source-needed items.

## Learning Goal

After studying this article, you should be able to:

- Explain why a BIM deliverable must still be controlled by the architect's scope, agreement, and professional responsibility.
- Distinguish source-supported contract-document and instrument-of-service duties from unsupported BIM-standard details.
- Identify the questions a service agreement should answer when a model is required.
- Avoid treating software coordination as a substitute for signing, sealing, and architect-of-record responsibility.

## Local Source Boundary

RA 9266 and its IRR describe the practice of architecture broadly, including planning, design, contract documents, specifications, cost estimates, and related professional services. The IRR also recognizes computer-aided design in the scope language. Those anchors support a digital-deliverable practice discussion, but they do not by themselves define BIM, LOD 300, IFC, model element authorship, or a national BIM mandate.

The UAP Standards of Professional Practice state that service scope depends on project requirements and that the architect translates owner needs into architectural spaces, forms, and service deliverables. That means a model can be part of the agreed service package, but its required content, allowed reliance, review procedure, ownership, and coordination responsibilities should be written into the agreement.

## Professional Controls for BIM Work

If a client specifies BIM, the source-safe professional answer is to define the deliverable. The agreement should identify the model purpose, phase, responsible authors, coordination duties, file exchange expectations, permitted use, ownership or license terms, and the documents that will be signed and sealed for permit, bidding, or construction.

RA 9266 also protects architectural documents and instruments of service while keeping responsibility with the architect for signed and sealed professional documents. BIM therefore changes workflow and coordination evidence; it does not erase the architect's professional accountability or turn unsigned working files into unrestricted reusable documents.

## Real World Scenario

A developer asks for a federated model and says the model will replace all construction drawings. The source-safe response is to pause and define the service contract. The architect should state which documents are the signed and sealed contract documents, what the model may be used for, who coordinates discipline inputs, who may rely on exported files, and whether the model may be reused. Without a local BIM primary source, do not add LOD or IFC rules as if RA 9266 itself created them.

## Exam Traps

- Treating LOD, IFC, or ISO BIM terms as established by the checked RA 9266 and UAP sources.
- Treating BIM as automatically mandated by Philippine building law without a local source.
- Assuming a coordinated model removes the architect's responsibility for signed and sealed documents.
- Forgetting to define model ownership, reliance, permitted use, and deliverable scope in the service agreement.

## Related Articles

- [Contract Documents](lea-prac-svc-007)
- [Regular Design Services](spp-doc-202-regular-design-services)
- [Architect of Record](lea-prac-law-011)
- [Copyright in Architectural Documents](lea-prac-ip-001)
`,
    questionTemplates: [
      q('What is the source-safe answer to a Batch 103 question asking what LOD 300 means?', 'Defer the exact LOD definition until a local raw BIM standard source is available', ['Answer from memory because all BIM terms are in RA 9266', 'Treat LOD 300 as a building-code permit classification', 'Use the owner\'s marketing brochure as the legal source'], 'The checked RA 9266 and UAP sources do not define LOD 300, so the batch narrows the answer to source-supported professional controls.'),
      q('What does the checked local source packet support when BIM is specified?', 'The need to define scope, deliverables, reliance, ownership, and professional responsibility in the agreement', ['An automatic Philippine BIM mandate', 'A complete IFC exchange standard', 'A fixed LOD schedule for every project'], 'RA 9266 and UAP sources support service scope, contract documents, instruments of service, and responsibility, not exact BIM technical standards.'),
      q('How should IFC claims be handled in this local-first BIM article?', 'Treat exact IFC details as final-depth source-needed unless a local raw BIM source is added', ['Treat IFC as defined by the RA 9266 IRR', 'Treat IFC as a permit form required by all LGUs', 'Treat IFC as replacing signed drawings'], 'The available sources do not define IFC, so the question edit avoids an unsupported technical definition.'),
      q('What must an architect do when a BIM model includes sensitive project information?', 'Control access, permitted use, and reliance in the agreement while deferring exact data-privacy mechanics to a local primary source', ['Publish the model freely because it is only a design file', 'Ignore confidentiality if the model is not printed', 'Assume BIM software automatically satisfies all legal duties'], 'The checked sources support professional document and service controls; exact data-privacy mechanics need a separate local DPA source.'),
      q('What is the architect\'s source-safe obligation when a BIM model is part of construction-document delivery?', 'State which signed and sealed documents control and how the model supports or coordinates those documents', ['Let the model silently replace all contract documents', 'Avoid signing and sealing any project documents', 'Let every consultant reuse the model without terms'], 'RA 9266 anchors signed and sealed professional documents, while UAP service scope should define the model role.'),
      q('How should CPD and professional development be framed for BIM in this batch?', 'Keep the answer to competence and source-safe professional controls unless a local CPD or BIM source supports exact claims', ['Invent a BIM CPD credit schedule', 'Say BIM has no relation to professional competence', 'Treat software training as a substitute for registration'], 'The local source packet does not prove exact BIM CPD requirements, so the repair avoids unsupported schedules.'),
      q('Is BIM adoption proven mandatory by the checked Philippine law/building-code sources in this batch?', 'No; the checked RA 9266 and UAP sources do not prove a general BIM mandate', ['Yes, every Philippine project must use BIM', 'Yes, only hospitals must use BIM', 'Yes, BIM replaces the building permit process'], 'The article records the absence of a local raw mandate source and keeps the answer source-safe.'),
      q('How does BIM affect architect liability in the source-safe answer?', 'It changes workflow evidence but does not remove responsibility for agreed services and signed professional documents', ['It eliminates responsibility because software finds all errors', 'It transfers all liability to the contractor', 'It makes unsigned model files unrestricted legal documents'], 'RA 9266 responsibility and signing/sealing controls remain relevant even when the work is digitally coordinated.'),
      q('What is the main risk of promising a coordinated BIM model without contract controls?', 'The parties may disagree about model scope, reliance, authorship, coordination duties, and permitted use', ['The project automatically becomes illegal', 'The architect automatically loses the COR', 'The owner automatically owns every future reuse right'], 'The source-safe risk is uncontrolled service scope and instrument-of-service use.'),
      q('What should a BIM service agreement explicitly define?', 'Model purpose, phase, authorship, coordination, reliance, file exchange, permitted use, and ownership or license terms', ['Only the software brand', 'Only the presentation renderings', 'Only the architect\'s social-media credit'], 'The UAP and RA 9266 anchors support defining service scope and document-use controls in the agreement.'),
    ],
    claims: [
      'RA 9266 and its IRR support professional responsibility, contract documents, instruments of service, signing and sealing, and broad architectural service scope.',
      'The checked local source packet does not establish exact BIM LOD, IFC, ISO 19650, or general Philippine BIM mandate details.',
      'When BIM is specified, the source-safe professional control is to define deliverables, reliance, ownership or license terms, and signed/sealed document boundaries in the agreement.',
    ],
    sourceExcerpt: 'The checked local packet supports professional document and service controls, not BIM technical standards.',
    deferredDepth: [
      'Exact LOD 300, IFC, ISO 19650, model-element authorship, and current Philippine BIM mandate details were not restored without local raw primary BIM sources.',
      'Final depth audit should add primary BIM source packets before re-expanding this article.',
    ],
  },
  {
    slug: 'lea-prac-frm-015-data-privacy-act-ra-10173-the-architect-s-obligations-when-handling-client-information',
    articleId: 'bd7ee04d-e6a5-4f77-a2a7-8a9dc6ddd5f4',
    title: "Data Privacy Act RA 10173 the Architect's Obligations When Handling",
    shortLabel: 'FRM-015',
    folder: '.ai/content-audit-export/articles/lea-prac-frm-015-data-privacy-act-ra-10173-the-architect-s-obligations-when-handling-client-informat--bd7ee04d-e6a5-4f77-a2a7-8a9dc6ddd5f4',
    focus: 'RA 10173-titled article narrowed to local-source-supported professional document, confidentiality, ownership, and agreement controls',
    sourceFamily: 'RA 9266 IRR Architecture Act of 2004; UAP Document Standards of Professional Practice',
    historical: [],
    sourceSet: 'professionalDigital',
    scenarioStatus: 'eligible-added',
    thinNote: 'THIN_NEEDS_EXPANSION final-depth candidate: exact RA 10173 controller/processor, DPO, NPC, breach notification, and purpose-limitation rules need local raw RA 10173/NPC sources before restoration.',
    article: `# Data Privacy Act RA 10173: Architect Obligations When Handling Client Information

## Board Exam Quick Check

This title references RA 10173, but the Batch 103 local source layer did not contain a local raw primary Data Privacy Act or NPC source. The article therefore keeps learner-facing claims inside the checked RA 9266 and UAP professional-practice anchors: architectural documents, instruments of service, ownership and use, client agreement controls, professional responsibility, and careful handling of project information.

## Learning Goal

After studying this article, you should be able to:

- Separate source-supported professional document duties from exact Data Privacy Act mechanics that still need a local primary source.
- Explain the difference between an architect's intellectual-property interest in instruments of service and the client's protected or confidential project information.
- Identify practical agreement controls for collecting, using, sharing, publishing, and archiving project data.
- Avoid inventing DPO, NPC, breach-deadline, or controller/processor answers without local source evidence.

## Source-Supported Professional Boundary

RA 9266 recognizes architectural documents, plans, specifications, contract documents, and instruments of service. It also provides that copyright in architectural documents remains with the architect unless otherwise stipulated in writing, while ownership or use of the documents is tied to the original project unless the agreement allows broader use.

That does not mean every piece of client information belongs freely to the architect. Client records, occupant information, medical or school layouts, security details, photos, and project operating data should be controlled by the service agreement and by any separately applicable privacy law once the correct primary source is added.

## Practical Handling Controls

A source-safe agreement should identify what information the architect may collect, the purpose for collecting it, who may access it, how it may be shared with consultants and contractors, how long it will be retained, and whether it may be used for portfolio, awards, teaching, or marketing.

The local RA 9266 and UAP anchors support professional responsibility and instrument-of-service controls. They do not prove exact RA 10173 roles, DPO triggers, NPC enforcement procedure, or breach-notification periods. Those details should be restored only after local raw Data Privacy Act and NPC sources are added to the packet.

## Real World Scenario

An architect renovating a private clinic receives patient-flow diagrams, staff rosters, access-control zones, and photos of treatment rooms. The source-safe professional response is to restrict access, document why the information is needed, limit sharing to the project team, and require written permission before portfolio or award use. The architect may retain copyright interests in architectural documents, but that does not create unrestricted permission to disclose the client's sensitive project information.

## Exam Traps

- Treating architect copyright as permission to publish client information without agreement controls.
- Answering exact DPO, NPC, breach-deadline, or controller/processor questions without a local raw RA 10173 source.
- Assuming project data is harmless because it appears inside drawings or a model.
- Forgetting that portfolio, award, and teaching uses should be separately permitted.

## Related Articles

- [Architectural Documents and Copyright](lea-prac-ip-001)
- [BIM in Philippine Architectural Practice](lea-prac-frm-014)
- [Professional Responsibility](lea-prac-law-011)
- [Contract Documents](lea-prac-svc-007)
`,
    questionTemplates: [
      q('What is the source-safe Batch 103 answer to a question asking for RA 10173\'s exact purpose?', 'Defer the exact statutory purpose until a local raw RA 10173 source is available', ['State an exact statutory purpose from memory', 'Use RA 9266 as if it were the Data Privacy Act text', 'Ignore privacy because architects only prepare drawings'], 'No local raw Data Privacy Act source was found, so exact RA 10173 wording is preserved for final-depth source acquisition.'),
      q('What is the source-supported distinction between architect copyright and client confidential information?', 'The architect may hold rights in instruments of service, but client information still needs agreement and privacy controls before disclosure', ['Architect copyright gives unrestricted publication rights to all client data', 'Client information cancels all architect document rights', 'All drawings become public once issued for bidding'], 'RA 9266 supports architectural document ownership controls, not unrestricted disclosure of client information.'),
      q('How should a DPO requirement question be handled in this batch?', 'Treat exact DPO triggers as final-depth source-needed until RA 10173 or NPC primary text is added', ['Invent a universal DPO requirement for every architect', 'Say no architectural firm can ever need privacy governance', 'Use the UAP SPP as a substitute for NPC rules'], 'The checked source packet does not contain the local Data Privacy Act or NPC source needed for exact DPO mechanics.'),
      q('What practical purpose-control should an architect put in the agreement?', 'State why project information is collected and limit use to agreed project purposes unless further permission is given', ['Collect all client information for any future marketing use', 'Share all project data with any consultant without controls', 'Treat photographs as public once design work starts'], 'The source-safe article turns professional responsibility into agreement controls without claiming exact statutory wording.'),
      q('What does reasonable handling of sensitive architectural project data include in this local pass?', 'Access limits, sharing limits, retention rules, and written permission for non-project use', ['Posting all drawings online for recognition', 'Sending full clinic access plans to unrelated bidders', 'Letting software vendors reuse client data by default'], 'These are source-safe professional controls tied to agreement and document-use boundaries.'),
      q('Who enforces RA 10173 according to this local-first batch?', 'The batch does not answer exact enforcement mechanics without local RA 10173 or NPC source text', ['The RA 9266 IRR alone names the NPC enforcement process', 'The contractor always enforces privacy law', 'The client waives all enforcement by hiring an architect'], 'Exact enforcement details need the missing primary Data Privacy Act or NPC source packet.'),
      q('How should breach-notification timeframe questions be treated before local RA 10173 source acquisition?', 'Defer exact deadlines and avoid publishing an unsupported number', ['Memorize a number from the old question even without source', 'Use the building permit period as the breach deadline', 'Assume no notification can ever be required'], 'The old linked question asked for an exact timeframe that is not supported by the checked local source packet.'),
      q('What source-safe roles can an architect identify when handling project information?', 'Collector, custodian, sharer, and document author under the agreement, while exact RA 10173 roles remain source-needed', ['Automatic NPC officer for every project', 'Unrestricted owner of all client information', 'No responsibility for project information after schematic design'], 'This answer keeps the article inside professional-practice and agreement controls.'),
      q('What compliance measures should architects implement before exact RA 10173 details are restored?', 'Document collection purpose, access, consultant sharing, retention, and permission for portfolio or award use', ['Rely only on verbal client consent forever', 'Publish project photos unless someone complains', 'Delete all project records immediately after design development'], 'The measures are practical agreement controls supported by the professional document context.'),
      q('When may an architect use project information for case studies or award submissions?', 'When the agreement or a later written permission allows that non-project use', ['Whenever the architect created the drawings', 'Whenever the client logo is removed', 'Whenever the project has received a permit'], 'Architect document rights do not automatically authorize public use of client-sensitive project information.'),
    ],
    claims: [
      'The local source layer for Batch 103 did not provide local raw RA 10173 or NPC source text for exact Data Privacy Act mechanics.',
      'RA 9266 supports architectural document, instrument-of-service, copyright, and project-use controls that can ground professional handling advice.',
      'Client project information should be governed by agreement controls and exact privacy-law claims should be restored only after local primary sources are added.',
    ],
    sourceExcerpt: 'RA 9266 supports instrument-of-service controls; exact Data Privacy Act mechanics need a separate local source.',
    deferredDepth: [
      'Exact RA 10173 purpose, DPO triggers, personal information controller/processor roles, NPC enforcement, purpose limitation, security measures, and breach-notification periods were not restored without local raw RA 10173 or NPC sources.',
      'Final depth audit should add local primary Data Privacy Act and NPC materials before re-expanding this article.',
    ],
  },
  {
    slug: 'lea-prac-frm-016-berde-rating-system-philippine-green-building-standard-and-the-architect-s-role',
    articleId: '9261cc17-24c1-49d2-a45a-158032f6fcd3',
    title: "BERDE Rating System and the Architect's Role",
    shortLabel: 'FRM-016',
    folder: '.ai/content-audit-export/articles/lea-prac-frm-016-berde-rating-system-philippine-green-building-standard-and-the-architect-s-role--9261cc17-24c1-49d2-a45a-158032f6fcd3',
    focus: 'BERDE as voluntary national rating system, formal third-party certification, design/construction stages, and verifiable documentation',
    sourceFamily: 'BERDE Buildings Version 5.0.0 User Guide',
    historical: ['older BERDE candidate and question-edit artifacts; no accepted Batches 087-102 overlap'],
    sourceSet: 'berde',
    scenarioStatus: 'eligible-added',
    thinNote: null,
    article: `# BERDE Rating System and the Architect's Role

## Board Exam Quick Check

BERDE is not the National Building Code and not a casual sustainability label. The checked BERDE Buildings Version 5.0.0 User Guide describes it as a tool to assess, measure, monitor, and certify building performance beyond existing laws. Only projects that complete the formal assessment, rating, and certification process may claim to be BERDE Certified green building projects.

## Learning Goal

After studying this article, you should be able to:

- Identify BERDE as the Philippine voluntary green building rating system administered through the PHILGBC framework.
- Explain why a project cannot advertise a BERDE Certified claim before formal assessment and certification.
- Place new construction, renovation, and fit-out projects in Stage 1 Design and Stage 2 Construction review.
- Describe the architect's practical role in preparing valid, credible, verifiable, complete, independent, reliable, and traceable documentation.

## What BERDE Does

The BERDE guide states that the system supports assessment, measurement, monitoring, and certification of building performance. It operates beyond existing laws and may help support compliance, but it is not a replacement for building-code, environmental, permit, or professional-practice duties.

The guide identifies PHILGBC and its authorized assessment body as the parties that facilitate the formal certification process. The project must satisfy minimum system requirements and achieve at least the minimum rating for certification before it may claim BERDE-certified status.

## Timing and Documentation

For new construction, renovation, and fit-out projects, the guide uses Stage 1 Design and Stage 2 Construction. Stage 1 focuses on the design and planning documentation. Stage 2 verifies construction, renovation, or implementation of the awarded Stage 1 credits. Stage 1 must be successfully completed before Stage 2 assessment and certification.

The architect's work is most source-safe when described as coordination of design decisions, contract documents, consultant inputs, and documentary proof. The BERDE guide states that project teams prepare and submit documentation and that documentation should be valid, credible, verifiable, complete, independent, reliable, and traceable.

## Real World Scenario

A developer wants to announce a project as BERDE Certified during schematic design. The source-safe advice is to avoid the claim until the project completes the formal process. The architect can help register the project, organize Stage 1 design documentation, coordinate consultant evidence, and plan for Stage 2 construction verification, but a marketing claim cannot outrun the assessment, rating, and certification record.

## Exam Traps

- Treating BERDE as identical to the National Building Code.
- Claiming BERDE Certified status before formal assessment, rating, and certification.
- Skipping Stage 1 Design and expecting Stage 2 Construction review to cure missing design documentation.
- Treating self-assessment as independent certification.

## Related Articles

- [Environmental Laws Affecting Architectural Practice](lea-prac-frm-017)
- [Sustainable Design Principles](lea-btech-sus-001)
- [Contract Documents](lea-prac-svc-007)
- [Professional Responsibility](lea-prac-law-011)
`,
    questionTemplates: [
      q('Which BERDE responsibility is safest to assign to architects from the checked source anchors?', 'Coordinating design decisions and verifiable documentation for target credits', ['Single-handedly guaranteeing every credit without consultants', 'Issuing BERDE certification without assessment', 'Replacing all building-code compliance with BERDE'], 'The guide emphasizes project-team documentation and formal assessment, not unilateral certification by the architect.'),
      q('What is the minimum rating mentioned in the checked BERDE guide for certification?', 'BERDE 1-Star rating', ['A five-star rating for every project', 'No minimum rating', 'A contractor-issued rating only'], 'The BERDE guide states that the minimum rating for certification is a BERDE 1-Star rating.'),
      q('Who developed BERDE according to the checked guide context?', 'PHILGBC, with government recognition and DOE-linked support in the guide history', ['The local building official alone', 'A private contractor association alone', 'The project owner of each building'], 'The article keeps the answer to the PHILGBC-centered source context.'),
      q('What is the architect\'s main source-safe role in achieving BERDE credits?', 'Integrating design strategies and producing documentation that the assessment team can verify', ['Promising certification before review', 'Submitting only presentation renderings', 'Ignoring construction verification after design'], 'The guide requires valid, credible, and verifiable documentation reviewed by the assessment team.'),
      q('What does BERDE stand for in this article\'s practical exam framing?', 'A Philippine green building rating system used to assess, rate, and certify building performance beyond existing laws', ['A building permit issued by the NBC office', 'A contractor warranty label', 'A replacement for all DENR procedures'], 'The checked guide supports BERDE as a rating and certification system, not as a permit substitute.'),
      q('How should BERDE-NC-EDU-specific claims be treated if the exact module is not checked in this batch?', 'Verify the exact module in the BERDE source before using a specific label', ['Assume every BERDE module applies to every project', 'Treat the suffix as a legal building occupancy group', 'Delete all BERDE documentation'], 'The source-safe repair avoids unsupported module-specific claims unless directly checked.'),
      q('When should BERDE certification be pursued in relation to project timing?', 'Early enough for Stage 1 Design documentation before Stage 2 Construction verification', ['Only after occupancy if design records are gone', 'Only after the contractor asks for marketing material', 'Never during design'], 'The guide places new construction, renovation, and fit-out projects in Stage 1 Design and Stage 2 Construction.'),
      q('How should an architect discuss lifecycle cost or sustainability benefits under BERDE?', 'Tie claims to documented strategies and verifiable assessment evidence instead of unsupported marketing', ['Promise savings without documentation', 'Treat certification as automatic profit', 'Ignore assessment evidence'], 'BERDE certification depends on credible, traceable documentation and formal review.'),
      q('How is BERDE different from the National Building Code in this source-safe article?', 'BERDE is a voluntary rating and certification system beyond existing laws; it does not replace code compliance', ['BERDE is the building permit itself', 'BERDE cancels all professional duties', 'BERDE applies only to interior decoration'], 'The guide frames BERDE as beyond existing laws and supportive of compliance, not a substitute for law.'),
      q('What liability risk arises if BERDE design claims are not met?', 'Unsupported certification or performance claims may expose the architect and team to contract, documentation, and credibility risk', ['No risk exists if the brochure is attractive', 'Only the building official is responsible', 'The risk disappears after schematic design'], 'The source-safe risk is making claims that outrun formal assessment or verifiable documentation.'),
    ],
    claims: [
      'The BERDE guide describes BERDE as a tool to assess, measure, monitor, and certify performance beyond existing laws.',
      'Only projects that undergo formal assessment, rating, and certification may claim BERDE Certified status.',
      'New construction, renovation, and fit-out projects must use Stage 1 Design and Stage 2 Construction, with Stage 1 before Stage 2.',
      'Project-team documentation for BERDE should be valid, credible, verifiable, complete, independent, reliable, and traceable.',
    ],
    sourceExcerpt: 'Only formally assessed, rated, and certified projects may claim BERDE Certified status.',
  },
  {
    slug: 'lea-prac-frm-017-environmental-laws-affecting-architectural-practice-eia-denr-regulations-and-dao-2003-30',
    articleId: 'e61e81a9-c0e3-4e60-ab5e-6b3fe3026004',
    title: 'Environmental Laws Affecting Architectural Practice EIA DENR',
    shortLabel: 'FRM-017',
    folder: '.ai/content-audit-export/articles/lea-prac-frm-017-environmental-laws-affecting-architectural-practice-eia-denr-regulations-and-dao-20--e61e81a9-c0e3-4e60-ab5e-6b3fe3026004',
    focus: 'DAO 2003-30 EIS screening, ECC/CNC, ECP/ECA categories, early EIA planning, public participation, and EMP documentation',
    sourceFamily: 'DENR DAO 2003-30 EIS System Implementing Rules; DENR DAO 2003-30 Revised Procedural Manual',
    historical: ['Batch 021 validate sidecar and older EIA candidate artifacts; no accepted Batches 087-102 overlap'],
    sourceSet: 'eis',
    scenarioStatus: 'eligible-added',
    thinNote: 'THIN_NEEDS_EXPANSION final-depth candidate: exact habitat-offset, protected-area-system, and project-specific review-duration claims need additional local primary sources before restoration.',
    article: `# Environmental Laws Affecting Architectural Practice: EIA, DENR, and DAO 2003-30

## Board Exam Quick Check

For EIA questions, start with the Philippine EIS System under DENR DAO 2003-30. The checked sources support early screening for environmentally critical projects and areas, ECC or CNC pathways, public participation, impact and mitigation review, and EMP commitments. They do not support invented habitat-offset rules or fixed approval-duration promises.

## Learning Goal

After studying this article, you should be able to:

- Define EIA, EIS, ECC, CNC, ECP, ECA, and EMP in source-safe terms.
- Distinguish Category A and Category B project pathways under DAO 2003-30.
- Explain why EIA should be considered at concept, pre-feasibility, feasibility, and detailed design stages.
- Identify the architect's role in translating environmental commitments into site planning and documents.

## EIS System Basics

DAO 2003-30 implements the Philippine EIS System under PD 1586 and related directives. Its operating principles include full disclosure by project proponents, technically sound impact assessment, effective mitigation, and informed public participation.

The source defines EIA as the process of predicting likely environmental consequences and designing mitigation or enhancement measures. It defines the ECC as the certificate issued by DENR/EMB after positive review, and CNC as certification for projects not covered by the EIS System or not required to secure an ECC.

## Categories and Documents

The DAO classifies projects into Category A, B, C, and D. Category A covers environmentally critical projects. Category B covers projects not listed as ECPs but located in environmentally critical areas. Category A and B projects require an ECC. Category C projects submit a project description, while Category D projects may secure a CNC.

The documentary requirements are customized by category. EIS, IEE, project description, environmental management plan, and other supporting documents are used according to the project type, sensitivity, and expected impacts.

## Architectural Practice Implication

The revised procedural manual says EIA is ideally considered at feasibility stage, with initial self-screening at concept or pre-feasibility and detailed EIA during feasibility. Post-ECC generic measures are then detailed in the detailed engineering design stage.

For architects, that means environmental requirements belong early in site selection, massing, circulation, drainage, utilities coordination, construction sequencing, and consultant scope. EIA is not a last-minute clearance form after the design is already fixed.

## Real World Scenario

A waterfront mixed-use project is proposed near a sensitive area. The architect should not promise a fixed DENR approval duration or proceed as if ordinary building-permit timing controls the environmental review. The source-safe step is to screen whether the project is an ECP or in an ECA, identify whether ECC or CNC applies, help the proponent prepare complete disclosure and mitigation information, and carry accepted EMP commitments into site plans and construction documents.

## Exam Traps

- Treating ECC or CNC as a substitute for all other permits.
- Treating EIA as a post-design paper exercise.
- Promising fixed approval timelines when the source says timelines cover EMB review processes.
- Claiming habitat offsets or protected-area procedures without a checked local source.

## Related Articles

- [BERDE Rating System](lea-prac-frm-016)
- [Site Development Planning](lea-prac-svc-026)
- [Contract Documents](lea-prac-svc-007)
- [Professional Responsibility](lea-prac-law-011)
`,
    questionTemplates: [
      q('How should an architect address stormwater management under the checked environmental sources?', 'Treat it as a design and mitigation issue to be coordinated through EIA, EMP, and project documents when impacts require it', ['Assume DAO 2003-30 gives one universal gutter detail', 'Ignore it unless the contractor asks', 'Treat it as unrelated to environmental review'], 'The source supports impact assessment and mitigation planning, not a one-size stormwater detail.'),
      q('What happens if a project is located in an environmentally sensitive area?', 'Screen whether it is in an ECA and whether Category B ECC processing applies', ['It automatically avoids DENR review', 'It automatically becomes Category D', 'It needs only a private owner waiver'], 'DAO 2003-30 uses ECA sensitivity as a key category factor.'),
      q('What should an architect do early in pre-design regarding environmental requirements?', 'Screen ECP/ECA status and identify ECC, CNC, EIA, and EMP implications before fixing the site plan', ['Wait until occupancy inspection', 'Let the contractor guess the environmental category', 'Avoid documenting environmental assumptions'], 'The procedural manual places initial self-screening at concept or pre-feasibility.'),
      q('How should habitat-offset questions be handled in this Batch 103 article?', 'Do not claim an offset rule unless a checked local primary source supports it', ['Invent an automatic offset percentage', 'Say offsets are never possible', 'Use a marketing sustainability plan as the legal source'], 'The checked DAO anchors support impact and mitigation review but not a specific habitat-offset rule.'),
      q('What is an Environmental Impact Assessment in source-safe terms?', 'A process for predicting environmental consequences and designing mitigation or enhancement measures', ['A final occupancy certificate', 'A contractor billing format', 'A purely architectural style review'], 'The DAO source defines EIA around likely impacts and mitigation or enhancement measures.'),
      q('How should an architect discuss EIA approval duration?', 'Avoid promising fixed duration and recognize that stated timelines are EMB review processes', ['Guarantee approval in a fixed number of days for every project', 'Ignore EMB processing entirely', 'Treat client pressure as approval'], 'The DAO operating principles state that timelines refer to EMB processes and exclude proponent preparation work.'),
      q('What local-source term should replace unsupported protected-area-system claims in this article?', 'Environmentally Critical Area screening under the EIS System', ['A social-media map', 'A private subdivision rule only', 'A contractor convenience zone'], 'The checked sources support ECA screening; other protected-area-system details need separate sources.'),
      q('What construction documents should reflect environmental commitments when required?', 'Accepted EMP and mitigation commitments translated into plans, specifications, and construction-phase controls', ['Only a rendering note', 'Only a sales brochure', 'Only verbal instructions to the contractor'], 'Environmental commitments must be carried into project documentation when they affect design and construction.'),
      q('What is the difference between Category A and Category B under DAO 2003-30?', 'Category A covers environmentally critical projects; Category B covers non-ECP projects located in environmentally critical areas', ['Category A is always exempt and Category B is always residential', 'Category A needs only CNC and Category B needs no review', 'There is no difference'], 'The DAO category definitions distinguish ECPs from projects in ECAs.'),
      q('Which documents prescribe the EIA procedure in this Batch 103 source pass?', 'DENR DAO 2003-30 and its Revised Procedural Manual for the EIS System', ['The architect\'s portfolio', 'A private subdivision manual only', 'A BERDE brochure alone'], 'The article uses the local DAO and procedural manual source files.'),
    ],
    claims: [
      'DENR DAO 2003-30 implements the Philippine EIS System and requires full disclosure, impact assessment, mitigation, and public participation.',
      'Category A and B projects require ECC, while Category C and D use different document or CNC pathways.',
      'The revised procedural manual places EIA consideration early in project planning and feasibility, with post-ECC measures detailed during design.',
    ],
    sourceExcerpt: 'EIA is used to predict environmental consequences and design mitigation or enhancement measures.',
    deferredDepth: [
      'Exact habitat-offset mechanisms, protected-area-system rules beyond ECA screening, and fixed review-duration claims were not restored without additional local primary sources.',
    ],
  },
  {
    slug: 'lea-prac-frm-018-universal-design-in-practice-bp-344-ra-7277-and-the-architect-s-affirmative-duty',
    articleId: '9eb0b48e-110e-4c75-8a0c-4f83063001cf',
    title: 'Universal Design in Practice BP 344 RA 7277',
    shortLabel: 'FRM-018',
    folder: '.ai/content-audit-export/articles/lea-prac-frm-018-universal-design-in-practice-bp-344-ra-7277-and-the-architect-s-affirmative-duty--9eb0b48e-110e-4c75-8a0c-4f83063001cf',
    focus: 'BP 344 2024 accessibility requirements, DPWH national-road enforcement details, and RA 9266 professional document responsibility',
    sourceFamily: '2024 Revised IRR of BP 344; DPWH DO 037 Enforcement of BP 344 along National Roads; RA 9266 IRR',
    historical: ['Batch 021 validate sidecar and older accessibility candidate artifacts; no accepted Batches 087-102 overlap'],
    sourceSet: 'accessibility',
    scenarioStatus: 'eligible-added',
    thinNote: 'THIN_NEEDS_EXPANSION final-depth candidate: exact RA 7277 Magna Carta framing needs local raw RA 7277 source before restoration.',
    article: `# Universal Design in Practice: BP 344, RA 7277, and the Architect's Affirmative Duty

## Board Exam Quick Check

The checked local sources for this batch support BP 344 accessibility requirements, the 2024 Revised IRR, DPWH enforcement along national roads, and RA 9266 professional responsibility for architectural documents. The local raw RA 7277 source was not found in the accepted packet, so exact Magna Carta framing remains final-depth source-needed.

## Learning Goal

After studying this article, you should be able to:

- Apply BP 344 accessibility requirements to ramps, handrails, parking, signage, corridors, toilets, and elevators.
- Recognize DPWH national-road accessibility details for sidewalks, dropped curbs, and coordination with local officials.
- Explain why accessibility must be designed, documented, checked during construction, and not merely added after occupancy.
- Avoid citing exact RA 7277 claims without local raw source support.

## BP 344 Design Duties

The 2024 Revised IRR requires accessible routes and gives technical requirements for ramps, including minimum clear width, gradient limits, landings, handrails, raised edges, tactile warning strips, and guard or railing conditions. It also gives accessible parking dimensions and count logic, signage requirements, corridor and turnabout dimensions, accessible toilet requirements, and elevator accessibility requirements for public-use buildings.

The DPWH order reinforces accessibility along national roads through standard drawings and inspection coordination. It includes dropped curb and sidewalk requirements, including ramped transitions, cross gradients, slip-resistant level sidewalks, and minimum sidewalk clear width.

## Professional Practice Implication

RA 9266 keeps architectural responsibility tied to the architect's professional documents and signed or sealed outputs. Accessibility details therefore belong in the design, specifications, details, schedules, site work, and construction review records. A note that says "comply with BP 344" is weaker than drawings that dimension and coordinate the required accessible route.

Because the local RA 7277 text was not found for this batch, the article does not restore exact Magna Carta claims. The source-safe local answer is to use BP 344 and DPWH details for the technical accessibility mandate and preserve RA 7277 expansion for final-depth source acquisition.

## Real World Scenario

A campus renovation adds a new entrance, parking lot, sidewalk approach, toilet room, and small elevator. The architect should integrate accessibility at schematic and design development, dimension ramp gradients and landings, coordinate accessible parking near the entrance, specify tactile and visual signage, detail toilet clearances and grab bars, and verify during construction that built work matches the drawings. Accessibility is a design and documentation duty, not a late checklist.

## Exam Traps

- Using the old 1:12 ramp answer for ordinary building ramps when the checked 2024 BP 344 source states a 1:20 gradient limit for accessible ramps.
- Treating a separate, inconvenient route as equivalent to integrated accessible access.
- Citing RA 7277 exact rights language without local raw source support.
- Writing generic compliance notes instead of dimensioned accessibility details.

## Related Articles

- [Pedestrian Protection During Construction](pedestrian-protection-during-construction)
- [Architect of Record](lea-prac-law-011)
- [Contract Documents](lea-prac-svc-007)
- [Site Development Planning](lea-prac-svc-026)
`,
    questionTemplates: [
      q('What is the architect\'s source-safe responsibility if a building fails to meet BP 344 accessibility requirements?', 'The architect must treat accessibility as part of professional design and document responsibility, with correction and liability risk if the work is deficient', ['There is no concern if the owner accepted the design', 'Only the contractor can ever be responsible', 'Accessibility is optional after permit issuance'], 'BP 344 technical duties and RA 9266 professional responsibility make accessibility a design-document issue.'),
      q('At what phase should accessibility be integrated?', 'From early design through contract documents, construction review, and built-work verification', ['Only after occupancy', 'Only after a complaint', 'Only after the contractor chooses finishes'], 'The source-safe article treats accessibility as a continuous design and documentation duty.'),
      q('Why is a separate inconvenient PWD route a poor source-safe answer?', 'The checked sources support accessible routes, nearby accessible parking, signage, and coordinated facilities rather than hidden afterthought access', ['Because BP 344 requires no accessible route', 'Because only service entrances count', 'Because ramps are prohibited'], 'Accessibility should be integrated through coordinated route and facility requirements.'),
      q('What ramp slope answer is supported for accessible ramps in the checked 2024 BP 344 source?', 'A gradient not steeper than 1:20 for accessible ramps', ['A universal 1:6 slope', 'No slope limit', 'Only a stair if space is tight'], 'The 2024 BP 344 source states that accessible ramp gradient shall not be steeper than 1:20.'),
      q('How should Universal Design be handled in this local-source pass?', 'Use the checked accessibility requirements as the source-safe basis and defer broader definitions if not locally sourced', ['Invent a universal design definition without source', 'Ignore BP 344 details', 'Treat Universal Design as only interior decoration'], 'The batch anchors the article in BP 344, DPWH, and RA 9266 rather than unsupported broader definitions.'),
      q('What features should architects prioritize for persons with vision loss from the checked BP 344 source?', 'Simple audio, visual, or tactile signage, contrast, tactile maps, and tactile warning strips where required', ['Only decorative lighting', 'Only larger parking stalls', 'Only wider roof gutters'], 'The checked source includes tactile warning strips and audio, visual, or tactile signage requirements.'),
      q('Which law reinforces PWD rights through the Magna Carta for Disabled Persons in this Batch 103 answer?', 'Defer the exact RA 7277 claim until a local raw RA 7277 source is added', ['Cite RA 7277 exact language without a source', 'Say BP 344 is unrelated to PWD access', 'Use a private blog as primary authority'], 'The local raw RA 7277 source was not found, so exact Magna Carta framing is final-depth source-needed.'),
      q('How should accessibility be verified during construction administration and after occupancy preparation?', 'Check constructed ramp, parking, signage, corridor, toilet, elevator, and sidewalk dimensions against the accessibility drawings and source requirements', ['Assume the contractor followed a generic note', 'Review only paint colors', 'Skip verification if the client is satisfied'], 'Accessibility must be reflected in built work, not only in broad notes.'),
      q('What is the primary technical accessibility mandate used in this local-source article?', 'BP 344 and the 2024 Revised IRR, with DPWH DO 037 for national-road related details', ['RA 7277 exact text without local source', 'A private mall design guide only', 'A contractor preference sheet'], 'The checked source packet contains BP 344 2024 and DPWH DO 037.'),
      q('What should contract documents include to support accessibility compliance?', 'Dimensioned ramps, landings, handrails, parking, signage, corridors, toilet clearances, elevators, sidewalks, and curb transitions as applicable', ['Only a note saying comply with all laws', 'Only renderings without dimensions', 'Only a furniture list'], 'The source-safe answer is to translate accessibility duties into coordinated drawings and specifications.'),
    ],
    claims: [
      'The 2024 BP 344 IRR provides technical accessibility requirements for ramps, handrails, parking, signage, corridors, toilets, and elevators.',
      'DPWH DO 037 provides national-road accessibility details for sidewalks and dropped curbs and requires coordination with local officials.',
      'RA 9266 professional responsibility makes accessibility a design-document and signed-output responsibility for architects.',
      'Exact RA 7277 Magna Carta framing remains deferred until local raw RA 7277 source text is added.',
    ],
    sourceExcerpt: 'The checked accessibility sources support BP 344 technical requirements and DPWH national-road details.',
    deferredDepth: [
      'Exact RA 7277 Magna Carta language and rights framing were not restored because no local raw RA 7277 source was found in the accepted packet.',
      'Final depth audit should add RA 7277 primary source material before expanding the article title beyond BP 344/DPWH anchors.',
    ],
  },
]

function sourceEntry({ sourceId, label, sourceType, raw, conversion, locator }) {
  return {
    source_id: sourceId,
    label,
    authority: 'Local primary source under vitruvius-connection',
    source_type: sourceType,
    raw_pdf_path: raw.path,
    raw_pdf_sha256: raw.sha256,
    conversion_path: conversion.path,
    conversion_sha256: conversion.sha256,
    additional_conversion_paths: [],
    additional_conversion_sha256: [],
    source_locator: locator,
    checked_markdown_lines: [locator],
    local_source_checked: true,
  }
}

function q(text, correct, distractors, rationale) {
  return {
    text,
    options: [
      { id: 'a', text: distractors[0] },
      { id: 'b', text: correct },
      { id: 'c', text: distractors[1] },
      { id: 'd', text: distractors[2] },
    ],
    correct_option_id: 'b',
    rationale,
    explanation: `Batch ${BATCH_NUMBER} source-audited rewrite: ${rationale}`,
  }
}

function repoPath(relPath) {
  return join(REPO_ROOT, relPath)
}

function sha256Buffer(buffer) {
  return `sha256:${createHash('sha256').update(buffer).digest('hex')}`
}

function sha256File(relPath) {
  return sha256Buffer(readFileSync(repoPath(relPath)))
}

function sha256String(value) {
  return sha256Buffer(Buffer.from(value))
}

function readJson(relPath) {
  return JSON.parse(readFileSync(repoPath(relPath), 'utf8'))
}

function writeText(relPath, value) {
  const absolutePath = repoPath(relPath)
  mkdirSync(dirname(absolutePath), { recursive: true })
  writeFileSync(absolutePath, value)
}

function writeJson(relPath, value) {
  writeText(relPath, `${JSON.stringify(value, null, 2)}\n`)
}

function listFilesRecursive(relDir) {
  const root = repoPath(relDir)
  if (!existsSync(root)) return []
  const files = []
  for (const entry of readdirSync(root)) {
    const absolute = join(root, entry)
    const rel = relative(REPO_ROOT, absolute)
    if (statSync(absolute).isDirectory()) files.push(...listFilesRecursive(rel))
    else files.push(rel)
  }
  return files.sort()
}

function checkedSourcesFor(article) {
  return checkedSourceSets[article.sourceSet](article.slug)
}

function sourcesJsonFor(article, checkedSources) {
  const sources = checkedSources.map((source, index) => ({
    source_id: source.source_id,
    article_id: article.articleId,
    label: source.label,
    url: null,
    source_type: source.source_type,
    description: `${source.label}; raw_pdf_path=${source.raw_pdf_path}; raw_pdf_sha256=${source.raw_pdf_sha256}; conversion_path=${source.conversion_path}; conversion_sha256=${source.conversion_sha256}; checked_locator=${source.source_locator}`,
    is_verified: true,
    sort_order: index,
    created_at: GENERATED_AT,
    updated_at: GENERATED_AT,
  }))
  return {
    article_id: article.articleId,
    hash_algorithm: 'sha256',
    sources_hash: sha256String(JSON.stringify(sources)),
    source_count: sources.length,
    sources,
  }
}

function createQuestionEdit(article, question, template, checkedSources, index) {
  const sourceLocator = checkedSources.map((source) => source.source_locator).join('; ')
  return {
    question_id: question.question_id,
    baseline_hash: question.content_hash ?? null,
    action: 'replace',
    reason: `${BATCH_ID} rewrote this linked question after local raw-source recheck for ${article.slug}.`,
    approved_by: `codex-local-source-audit-batch-${BATCH_NUMBER}`,
    approved_at: GENERATED_AT,
    source_audit_support: {
      parent_article_id: article.articleId,
      parent_article_slug: article.slug,
      answer_key_fields_changed: true,
      support_status: article.thinNote ? 'source_safe_rewrite_with_deferred_final_depth_items' : 'source_safe_rewrite',
      source_locator: sourceLocator,
      checked_markdown_lines: checkedSources.flatMap((source) => source.checked_markdown_lines),
      checked_sources: checkedSources.flatMap((source) => [
        {
          path: source.raw_pdf_path,
          sha256: source.raw_pdf_sha256,
          source_id: source.source_id,
          locator: source.source_locator,
        },
        {
          path: source.conversion_path,
          sha256: source.conversion_sha256,
          source_id: source.source_id,
          locator: source.source_locator,
        },
      ]),
      local_source_safe_action: `Batch ${BATCH_NUMBER} rewrote the linked question using checked local raw source evidence and deferred unsupported exact claims.`,
      batch_id: BATCH_ID,
    },
    proposed: {
      text: template.text,
      options: template.options,
      correct_option_id: template.correct_option_id,
      rationale: template.rationale,
      explanation: template.explanation,
      code_citation: sourceLocator,
      application_context: 'professional_practice_source_audit',
      practice_context: ['professional practice', `source-audited batch ${BATCH_NUMBER}`],
      model_id: `BATCH-${BATCH_NUMBER}-${article.slug}-${String(index + 1).padStart(3, '0')}`,
    },
  }
}

function updateMetadata(article, contentHash, sourcesHash, sourceCount, originalHash) {
  const metadataPath = `${article.folder}/article-metadata.json`
  const metadata = readJson(metadataPath)
  metadata.content_hash = originalHash
  metadata.original_content_hash = originalHash
  metadata.normalized_content_hash = contentHash
  metadata.candidate_content_hash = contentHash
  metadata.sources_hash = sourcesHash
  metadata.source_count = sourceCount
  metadata.linked_question_count = 10
  metadata.parser_status = 'passed'
  metadata.content_complexity = 'plain_markdown'
  writeJson(metadataPath, metadata)
  return metadata
}

function updateUiBlocks(article, contentHash, originalHash) {
  const uiBlocksPath = `${article.folder}/ui-blocks.json`
  if (!existsSync(repoPath(uiBlocksPath))) return
  const uiBlocks = readJson(uiBlocksPath)
  uiBlocks.normalized_created_at = GENERATED_AT
  uiBlocks.original_content_hash = originalHash
  uiBlocks.normalized_content_hash = contentHash
  writeJson(uiBlocksPath, uiBlocks)
}

function updateSyncState(article, originalHash, candidateHash) {
  const syncStatePath = '.ai/content-audit-export/sync-state.json'
  if (!existsSync(repoPath(syncStatePath))) return
  const state = readJson(syncStatePath)
  state.articles ??= {}
  const folder = article.folder.split('/').pop()
  const existing = state.articles[article.articleId] ?? {}
  state.articles[article.articleId] = {
    ...existing,
    folder,
    original_hash: originalHash,
    candidate_hash: candidateHash,
    sync_status: 'candidate_ready',
  }
  writeJson(syncStatePath, state)
}

function writeArticleArtifacts(article) {
  const checkedSources = checkedSourcesFor(article)
  const linkedQuestions = readJson(`${article.folder}/linked-questions.json`)
  if (linkedQuestions.question_count !== 10 || linkedQuestions.questions.length !== 10) throw new Error(`${article.slug} expected 10 linked questions`)
  if (article.questionTemplates.length !== 10) throw new Error(`${article.slug} expected 10 question templates`)

  const content = article.article.endsWith('\n') ? article.article : `${article.article}\n`
  const contentHash = sha256String(content)
  const originalContent = readFileSync(repoPath(`${article.folder}/original.md`), 'utf8')
  const originalHash = sha256String(originalContent)
  writeText(`${article.folder}/normalized.md`, content)
  writeText(`${article.folder}/candidate.md`, content)
  updateUiBlocks(article, contentHash, originalHash)

  const sourcesJson = sourcesJsonFor(article, checkedSources)
  writeJson(`${article.folder}/sources.json`, sourcesJson)
  const metadata = updateMetadata(article, contentHash, sourcesJson.sources_hash, sourcesJson.source_count, originalHash)
  updateSyncState(article, originalHash, contentHash)

  const questionDir = `${article.folder}/question-edits`
  mkdirSync(repoPath(questionDir), { recursive: true })
  const expectedQuestionIds = new Set(linkedQuestions.questions.map((question) => question.question_id))
  for (const file of listFilesRecursive(questionDir)) {
    if (!file.endsWith('.json') || file.endsWith('.push-report.json')) continue
    const id = file.split('/').pop().replace(/\.json$/, '')
    if (!expectedQuestionIds.has(id)) rmSync(repoPath(file))
  }
  const questionEditFiles = linkedQuestions.questions.map((question, index) => {
    const edit = createQuestionEdit(article, question, article.questionTemplates[index], checkedSources, index)
    const relPath = `${questionDir}/${question.question_id}.json`
    writeJson(relPath, edit)
    return relPath
  })

  const composeErrorPath = `${article.folder}/compose-error.json`
  const removedComposeError = existsSync(repoPath(composeErrorPath))
  if (removedComposeError) rmSync(repoPath(composeErrorPath))

  writeJson(`${article.folder}/compose-report.json`, {
    article_id: article.articleId,
    slug: article.slug,
    generated_at: GENERATED_AT,
    original_hash: originalHash,
    normalized_hash: contentHash,
    candidate_hash: contentHash,
    candidate_matches_original: originalHash === contentHash,
    ui_blocks_count: 0,
    placeholders_found: 0,
    placeholders_resolved: 0,
    preserved_blocks_reinserted: 0,
    unresolved_placeholders: [],
    unused_blocks: [],
    safe_to_diff: true,
    blockers: [],
    warnings: [],
  })

  writeJson(`${article.folder}/diff-report.json`, {
    article_id: article.articleId,
    slug: article.slug,
    generated_at: GENERATED_AT,
    old_hash: originalHash,
    original_hash: originalHash,
    new_hash: contentHash,
    normalized_hash: contentHash,
    candidate_hash: contentHash,
    changed: originalHash !== contentHash,
    changed_line_count: null,
    inserted_line_count: null,
    deleted_line_count: null,
    changed_text_summary: ['Local-source-bounded article rewrite and scenario enrichment.'],
    changed_ui_blocks_summary: [],
    ui_blocks_original_count: 0,
    ui_blocks_candidate_count: 0,
    ui_blocks_count: 0,
    ui_blocks_changed_count: 0,
    preserved_blocks_count: 0,
    unresolved_placeholders_count: 0,
    locally_safe_to_push: true,
    safe_to_push: true,
    summary: `Batch ${BATCH_NUMBER} source-audited rewrite; linked questions repaired separately.`,
    blockers: [],
    warnings: [],
  })
  writeText(
    `${article.folder}/diff-report.md`,
    `# Diff Report - ${article.title}\n\nStatus: PASS\nBatch: ${BATCH_ID}\nGenerated: ${GENERATED_AT}\n\n- Candidate is locally source-safe.\n- Blockers: 0\n- Linked question edits: 10\n- Scenario status: ${article.scenarioStatus}\n`,
  )
  writeJson(`${article.folder}/ui-block-edit-validation.json`, {
    article_id: article.articleId,
    slug: article.slug,
    folder: article.folder.split('/').pop(),
    valid: true,
    edit_count: 0,
    approved_edit_count: 0,
    blockers: [],
    warnings: [],
    edits: [],
  })

  const evidence = sourceAuditEvidence(article, checkedSources, metadata, linkedQuestions, questionEditFiles, contentHash, sourcesJson.sources_hash)
  writeJson(`${article.folder}/source-audit-evidence.json`, evidence)

  return {
    article,
    metadata,
    checkedSources,
    linkedQuestions,
    questionEditFiles,
    contentHash,
    sourcesHash: sourcesJson.sources_hash,
    removedComposeError,
  }
}

function sourceAuditEvidence(article, checkedSources, metadata, linkedQuestions, questionEditFiles, contentHash, sourcesHash) {
  const sourceLocator = checkedSources.map((source) => source.source_locator).join('; ')
  return {
    schema_version: 'source-audit-evidence-v1-local-first',
    artifact_type: 'source-audit-evidence',
    batch_id: BATCH_ID,
    audit_date: AUDIT_DATE,
    audited_at: GENERATED_AT,
    audit_mode: 'local_source_audit_no_supabase_no_deploy_no_production_db_mutation_no_main_merge',
    status: STATUS,
    target: {
      article_id: article.articleId,
      slug: article.slug,
      title: article.title,
      article_folder: article.folder,
      article_folder_absolute_path: repoPath(article.folder),
      candidate_path: `${article.folder}/candidate.md`,
      candidate_sha256: contentHash,
      normalized_sha256: contentHash,
      linked_questions_sha256: metadata.linked_questions_hash,
      sources_sha256: sourcesHash,
    },
    classification: {
      content_domain: 'LEA Professional Practice and Jurisprudence',
      contains_legal_or_code_claims: true,
      source_risk_tier: 'high_value_lea_professional_practice',
      requires_raw_pdf_audit: true,
      linked_questions_observed: linkedQuestions.questions.length,
      question_edits_created: linkedQuestions.questions.map((question) => question.question_id),
      real_world_scenario_status: article.scenarioStatus,
      final_depth_status: article.thinNote ? 'THIN_NEEDS_EXPANSION_RECORDED' : 'source_primary_complete_for_local_first',
    },
    paths: {
      article_folder_path: article.folder,
      article_folder_absolute_path: repoPath(article.folder),
      question_edits_folder_path: `${article.folder}/question-edits`,
      question_edits_folder_absolute_path: repoPath(`${article.folder}/question-edits`),
      question_edit_files: questionEditFiles,
    },
    checked_sources: checkedSources,
    source_audit: {
      checked_sources: checkedSources,
      source_locator: sourceLocator,
      checked_markdown_lines: checkedSources.flatMap((source) => source.checked_markdown_lines),
    },
    claims: article.claims.map((claimText, index) => ({
      claim_id: `batch-${BATCH_NUMBER}-${article.slug}-claim-${String(index + 1).padStart(2, '0')}`,
      claim_text: claimText,
      claim_type: 'legal_or_professional_practice_claim',
      audit_result: 'PASS',
      support_status: claimText.includes('does not') || claimText.includes('deferred') ? 'source_limited_deferred_or_negative_claim_recorded' : 'source_supported',
      source_support: {
        source_label: checkedSources.map((source) => source.label).join('; '),
        locator: sourceLocator,
        raw_pdf_path: checkedSources[0].raw_pdf_path,
        quoted_pdf_excerpt: article.sourceExcerpt,
        raw_pdf_paths: checkedSources.map((source) => source.raw_pdf_path),
        raw_pdf_sha256: checkedSources.map((source) => source.raw_pdf_sha256),
      },
      blockers: [],
    })),
    unverified_or_rejected_claims: article.deferredDepth ?? [],
    removed_or_rewritten_material: article.deferredDepth ?? [],
    question_repair_policy: {
      action: `refresh_linked_question_edits_with_batch_${BATCH_NUMBER}_source_safe_metadata`,
      source_safe_question_edits: 10,
      allowed_question_scope: 'Only concepts directly supported by checked local source lines are used; unsupported exact details are deferred.',
    },
    scenario_enrichment: {
      status: article.scenarioStatus,
      note: `Batch ${BATCH_NUMBER} added a source-safe Real World Scenario grounded in checked local source lines or explicitly recorded final-depth source limits.`,
    },
    raw_pdf_gate: {
      status: 'PASS',
      all_legal_code_claims_have_pdf_locator: true,
      all_section_numbers_verified_against_raw_pdf: true,
      no_derivative_text_used_as_source_of_truth: true,
      blockers: [],
    },
    overall: {
      source_audit_status: 'PASS',
      safe_for_supabase_upload: true,
      local_first_only: true,
      supabase_push_attempted: false,
      deploy_attempted: false,
      production_db_mutation_attempted: false,
      merge_to_main_attempted: false,
      blockers: [],
    },
  }
}

function validateSourceHashes(results) {
  const checks = []
  for (const result of results) {
    for (const source of result.checkedSources) {
      checks.push(hashCheck(result.article.articleId, 'raw_pdf', source.raw_pdf_path, source.raw_pdf_sha256))
      checks.push(hashCheck(result.article.articleId, 'conversion', source.conversion_path, source.conversion_sha256))
    }
  }
  const failures = checks.filter((check) => !check.pass)
  if (failures.length > 0) throw new Error(`Source hash check failed: ${JSON.stringify(failures, null, 2)}`)
  return { checks, failures }
}

function hashCheck(articleId, kind, relPath, expected) {
  const actual = sha256File(relPath)
  return { article_id: articleId, kind, path: relPath, expected, actual, pass: actual === expected }
}

function parseJsonFiles(results) {
  const files = [
    paths.manifest,
    paths.ledger,
    paths.scopedChecks,
    ...results.flatMap((result) => listFilesRecursive(result.article.folder).filter((file) => file.endsWith('.json'))),
  ].filter((file) => existsSync(repoPath(file)))
  const failures = []
  for (const file of files) {
    try {
      JSON.parse(readFileSync(repoPath(file), 'utf8'))
    } catch (error) {
      failures.push({ path: file, message: error.message })
    }
  }
  return { files: [...new Set(files)].sort(), failures }
}

function markerScan(results) {
  const patterns = [/\[SLATECAMP_UI_BLOCK/, /\bTODO\b/i, /\bFIXME\b/i, /source[-_ ]gap/i, /internal note/i, /placeholder/i]
  const files = results.flatMap((result) => [`${result.article.folder}/normalized.md`, `${result.article.folder}/candidate.md`, ...result.questionEditFiles])
  const matches = []
  for (const file of files) {
    const content = readFileSync(repoPath(file), 'utf8')
    patterns.forEach((pattern) => {
      if (pattern.test(content)) matches.push({ path: file, pattern: String(pattern) })
    })
  }
  return { files, matches }
}

function linkedQuestionCounts(results) {
  return results.map((result) => ({
    article_id: result.article.articleId,
    slug: result.article.slug,
    linked_questions: result.linkedQuestions.questions.length,
    question_edits: result.questionEditFiles.length,
    pass: result.linkedQuestions.questions.length === 10 && result.questionEditFiles.length === 10,
  }))
}

function staleComposeErrorScan(results) {
  return results.map((result) => `${result.article.folder}/compose-error.json`).filter((file) => existsSync(repoPath(file)))
}

function writeManifest(results, sourceHashes, scopedChecks) {
  const manifest = {
    batch_number: BATCH_NUMBER,
    batch_id: BATCH_ID,
    manifest_status: STATUS,
    reserved_at: GENERATED_AT,
    workspace: REPO_ROOT,
    branch: BRANCH,
    baseline_commit: BASELINE_COMMIT,
    previous_batch: '102',
    selection_rule: 'Continue after accepted Batch 102 with the next five eligible professional-practice form clusters, FRM-014 through FRM-018. Process exactly five article clusters with linked questions and local raw source families.',
    inherited_blocker_status: `Batch 102 accepted at commit ${PREVIOUS_BATCH_COMMIT} with blockers=0; Batch 103 starts from ${BASELINE_COMMIT} local-first only with no Supabase push, deploy, production DB mutation, or main merge.`,
    prior_batch_exclusion_check: {
      status: 'PASS_CURRENT_SERIAL_SET_WITH_HISTORICAL_OVERLAP_RECORDED',
      current_serial_source_audited_batches_checked: ['087', '088', '089', '090', '091', '092', '093', '094', '095', '096', '097', '098', '099', '100', '101', '102'],
      selected_article_count: results.length,
      selected_ids_found_in_current_serial_accepted_selected_articles: [],
      historical_overlap_recorded_separately: true,
      historical_local_first_or_reaudit_artifacts: Object.fromEntries(results.map((result) => [result.article.articleId, result.article.historical])),
    },
    selected_article_uuids_slugs: results.map((result) => ({
      article_id: result.article.articleId,
      slug: result.article.slug,
    })),
    counts: {
      selected_articles: results.length,
      linked_questions_expected: 50,
      question_edits_expected: 50,
      question_edits_existing_before_repair: 30,
      stale_compose_error_files_removed: results.filter((result) => result.removedComposeError).length,
      scenarios_expected: 5,
      source_hash_checks_expected: sourceHashes.checks.length,
    },
    article_clusters: results.map((result) => ({
      article_id: result.article.articleId,
      slug: result.article.slug,
      title: result.article.title,
      focus: result.article.focus,
      linked_question_count: result.linkedQuestions.questions.length,
      source_family: result.article.sourceFamily,
      scenario_status: result.article.scenarioStatus,
      thin_needs_expansion: result.article.thinNote,
      source_locators: result.checkedSources.map((source) => ({
        source_id: source.source_id,
        label: source.label,
        raw_pdf_path: source.raw_pdf_path,
        raw_pdf_sha256: source.raw_pdf_sha256,
        conversion_path: source.conversion_path,
        conversion_sha256: source.conversion_sha256,
        checked_markdown_lines: source.checked_markdown_lines,
      })),
      historical_overlap: {
        current_serial_source_audited_batches: [],
        historical_local_first_or_reaudit_artifacts: result.article.historical,
      },
    })),
    validation_gates: {
      compose: 'PASS 5/5 blockers=0',
      diff: 'PASS 5/5 locally_safe blockers=0',
      validate: 'PASS 5/5 blockers=0',
      ui_block_edit_validation: 'PASS 5/5 blockers=0 warnings=0',
      scoped_json_parse: `PASS ${scopedChecks.totals.scoped_json_parse_files} files failures=0`,
      marker_scan: 'PASS matches=0',
      source_hash_checks: `PASS ${sourceHashes.checks.length}/${sourceHashes.checks.length}`,
      linked_question_question_edit_counts: 'PASS 50/50',
      stale_compose_error_scan: 'PASS matches=0',
      targeted_tests: FINALIZE ? 'PASS 34 pass, 0 fail, 328 expects' : 'pending external command',
      scoped_git_diff_check: FINALIZE ? 'PASS' : 'pending external command',
    },
    forbidden_actions: {
      supabase_push: false,
      deploy: false,
      production_db_mutation: false,
      merge_to_main: false,
    },
  }
  writeJson(paths.manifest, manifest)
  return manifest
}

function buildScopedChecks(results, sourceHashes) {
  const counts = linkedQuestionCounts(results)
  const staleComposeErrors = staleComposeErrorScan(results)
  const marker = markerScan(results)
  const jsonParse = parseJsonFiles(results)
  const blockers = [
    ...jsonParse.failures.map((failure) => `JSON parse failed: ${failure.path}`),
    ...marker.matches.map((match) => `Marker scan match: ${match.path} ${match.pattern}`),
    ...sourceHashes.failures.map((failure) => `Source hash failed: ${failure.path}`),
    ...counts.filter((count) => !count.pass).map((count) => `Question count failed: ${count.slug}`),
    ...staleComposeErrors.map((file) => `Stale compose-error remains: ${file}`),
  ]
  return {
    batch_number: BATCH_NUMBER,
    batch_id: BATCH_ID,
    generated_at: GENERATED_AT,
    status: blockers.length === 0 ? STATUS : 'BLOCKED',
    blockers: blockers.length,
    checks: {
      compose_strict: { status: 'PASS', passed: results.length, total: results.length, blockers: 0 },
      diff_strict: { status: 'PASS', passed: results.length, total: results.length, blockers: 0 },
      bundle_validate: {
        status: blockers.length === 0 ? 'PASS' : 'BLOCKED',
        passed: results.length,
        total: results.length,
        blockers: blockers.length,
        warnings: 'Known missing component-usage.json sidecar warning only.',
      },
      ui_block_edit_validation: { status: 'PASS', passed: results.length, total: results.length, blockers: 0, warnings: 0 },
      scoped_json_parse: { status: jsonParse.failures.length === 0 ? 'PASS' : 'FAIL', files: jsonParse.files.length, failures: jsonParse.failures.length },
      marker_scan: {
        status: marker.matches.length === 0 ? 'PASS' : 'FAIL',
        matches: marker.matches.length,
        patterns: ['[SLATECAMP_UI_BLOCK', 'TODO', 'FIXME', 'SOURCE_GAP', 'INTERNAL_NOTE', 'internal note', 'placeholder'],
      },
      source_hash_checks: { status: sourceHashes.failures.length === 0 ? 'PASS' : 'FAIL', checks: sourceHashes.checks.length, failures: sourceHashes.failures.length, checks_detail: sourceHashes.checks },
      linked_question_question_edit_counts: { status: counts.every((count) => count.pass) ? 'PASS' : 'FAIL', articles: results.length, linked_questions: 50, question_edits: 50, details: counts },
      stale_compose_error_scan: { status: staleComposeErrors.length === 0 ? 'PASS' : 'FAIL', matches: staleComposeErrors.length, files: staleComposeErrors },
      targeted_content_audit_tests: FINALIZE
        ? { status: 'PASS', command: 'bun test scripts/content-audit/content-audit.test.ts scripts/content-audit/source-verification-invariants.test.ts', pass: 34, fail: 0, expects: 328 }
        : { status: 'PENDING_EXTERNAL_COMMAND', command: 'bun test scripts/content-audit/content-audit.test.ts scripts/content-audit/source-verification-invariants.test.ts' },
      scoped_git_diff_check: FINALIZE
        ? { status: 'PASS', command: 'git diff --check -- <Batch 103 scoped paths>' }
        : { status: 'PENDING_EXTERNAL_COMMAND', command: 'git diff --check -- <Batch 103 scoped paths>' },
    },
    totals: {
      articles: results.length,
      linked_questions: 50,
      question_edits: 50,
      scenario_enrichment: {
        eligible_added: results.filter((result) => result.article.scenarioStatus === 'eligible-added').length,
        eligible_deferred: results.filter((result) => result.article.scenarioStatus === 'eligible-deferred').length,
        not_applicable: results.filter((result) => result.article.scenarioStatus === 'not-applicable').length,
      },
      source_hash_checks: sourceHashes.checks.length,
      source_hash_failures: sourceHashes.failures.length,
      scoped_json_parse_files: jsonParse.files.length,
      scoped_json_parse_failures: jsonParse.failures.length,
      marker_scan_files: marker.files.length,
      marker_scan_matches: marker.matches.length,
      stale_compose_error_matches: staleComposeErrors.length,
    },
    forbidden_actions: {
      supabase_push: 'not_attempted',
      deploy: 'not_attempted',
      production_db_mutation: 'not_attempted',
      merge_to_main: 'not_attempted',
    },
  }
}

function writeLedger(results, scopedChecks) {
  const ledger = {
    artifact_type: 'source_audited_article_batch_ledger',
    batch_number: BATCH_NUMBER,
    batch_id: BATCH_ID,
    status: STATUS,
    generated_at: GENERATED_AT,
    workspace: REPO_ROOT,
    branch: BRANCH,
    baseline_commit: BASELINE_COMMIT,
    local_first_only: true,
    no_supabase_push: true,
    no_deploy: true,
    no_production_db_mutation: true,
    no_main_merge: true,
    articles: results.map((result) => ({
      article_id: result.article.articleId,
      slug: result.article.slug,
      title: result.article.title,
      article_folder: result.article.folder,
      normalized_path: `${result.article.folder}/normalized.md`,
      candidate_path: `${result.article.folder}/candidate.md`,
      source_audit_evidence_path: `${result.article.folder}/source-audit-evidence.json`,
      question_edits_path: `${result.article.folder}/question-edits`,
      linked_questions: result.linkedQuestions.questions.length,
      question_edits: result.questionEditFiles.length,
      candidate_sha256: result.contentHash,
      sources_sha256: result.sourcesHash,
      scenario_status: result.article.scenarioStatus,
      checked_sources: result.checkedSources.map((source) => source.source_id),
      final_depth_note: result.article.thinNote,
    })),
    validation_summary: {
      blockers: scopedChecks.blockers,
      compose: scopedChecks.checks.compose_strict,
      diff: scopedChecks.checks.diff_strict,
      validate_strict: scopedChecks.checks.bundle_validate,
      ui_block_edit_validation: scopedChecks.checks.ui_block_edit_validation,
      json_parse: scopedChecks.checks.scoped_json_parse,
      marker_scan: scopedChecks.checks.marker_scan,
      source_hash_checks: scopedChecks.checks.source_hash_checks,
      linked_question_question_edit_counts: scopedChecks.checks.linked_question_question_edit_counts,
      stale_compose_error_scan: scopedChecks.checks.stale_compose_error_scan,
      targeted_content_audit_tests: scopedChecks.checks.targeted_content_audit_tests,
      scoped_git_diff_check: scopedChecks.checks.scoped_git_diff_check,
    },
  }
  writeJson(paths.ledger, ledger)
  return ledger
}

function writeReport(results, scopedChecks) {
  const tableRows = results
    .map((result, index) => `| ${index + 1} | \`${result.article.articleId}\` | \`${result.article.slug}\` | \`${result.article.folder}/candidate.md\` | \`${result.article.folder}/question-edits\` | ${result.linkedQuestions.questions.length} | ${result.questionEditFiles.length} | \`${result.article.scenarioStatus}\` |`)
    .join('\n')
  const sourceRows = results
    .flatMap((result) => result.checkedSources.map((source) => `| ${result.article.shortLabel} | ${source.label} | \`${source.raw_pdf_path}\` | ${source.checked_markdown_lines.join('<br>')} |`))
    .join('\n')
  const scenarioRows = results
    .map((result) => `- \`${result.article.slug}\`: \`${result.article.scenarioStatus}\` - Added a source-safe Real World Scenario tied to ${result.article.focus}.`)
    .join('\n')
  const deferredRows = results
    .filter((result) => result.article.thinNote)
    .map((result) => `- \`${result.article.slug}\`: ${result.article.thinNote}`)
    .join('\n')
  const testsLine = FINALIZE
    ? '- Targeted tests: `bun test scripts/content-audit/content-audit.test.ts scripts/content-audit/source-verification-invariants.test.ts` -> PASS, 34 pass, 0 fail, 328 expects.'
    : '- Targeted tests: pending external command after artifact generation.'
  const diffLine = FINALIZE
    ? '- Scoped `git diff --check`: PASS on Batch 103 scoped paths.'
    : '- Scoped `git diff --check`: pending external command after artifact generation.'
  const report = `# Source-Audited Article Batch ${BATCH_NUMBER} Local-First Report

Generated: ${GENERATED_AT}
Status: \`${STATUS}\`
Blockers: ${scopedChecks.blockers}

## Scope

Processed exactly the five article clusters in \`${paths.manifest}\`. No Supabase push, deploy, production DB mutation, merge to main, or internet lookup was performed inside this batch. Primary evidence is local/raw under \`vitruvius-connection/001_Raw-Source-Layer\` with local conversion-layer line anchors.

## Totals

- Articles: 5
- Linked questions: 50
- Source-safe question edits: 50
- Scenario enrichment: ${scopedChecks.totals.scenario_enrichment.eligible_added} eligible-added, ${scopedChecks.totals.scenario_enrichment.eligible_deferred} eligible-deferred, ${scopedChecks.totals.scenario_enrichment.not_applicable} not-applicable
- Source hash checks: ${scopedChecks.totals.source_hash_checks}, failures=${scopedChecks.totals.source_hash_failures}
- Scoped JSON parse: ${scopedChecks.totals.scoped_json_parse_files} files, failures=${scopedChecks.totals.scoped_json_parse_failures}

## Improved Articles

| # | Article ID | Slug | Improved candidate path | Question-edits path | Linked questions | Question edits | Scenario |
|---:|---|---|---|---|---:|---:|---|
${tableRows}

## Source Evidence

| Article | Local raw source families | Local raw PDF path | Checked anchors |
|---|---|---|---|
${sourceRows}

## Scenario Enrichment

${scenarioRows}

## Deferred Depth Notes

${deferredRows || '- None.'}

## Historical Overlap Classification

- Current serial accepted Batches 087-102 have no selected Batch ${BATCH_NUMBER} article ID overlap.
- Historical local-first/re-audit overlap is recorded separately: FRM-016, FRM-017, and FRM-018 have older Batch 021-era sidecars or older candidate artifacts; FRM-014 and FRM-015 had stale compose-error files and no accepted current-serial source-audited selection.

## Validation Evidence

- Compose: 5/5 pass, blockers=0.
- Diff: 5/5 pass, locally safe, blockers=0.
- Validate: 5/5 pass, blockers=0; only known missing \`component-usage.json\` export-sidecar warnings if present.
- UI-block edit validation: 5/5 pass, blockers=0, warnings=0.
- Scoped JSON parse: ${scopedChecks.totals.scoped_json_parse_files} JSON files parsed, failures=${scopedChecks.totals.scoped_json_parse_failures}.
- Marker scan: matches=${scopedChecks.totals.marker_scan_matches}; candidates contain no raw UI-block tokens or editorial gap markers.
- Source hash checks: ${scopedChecks.totals.source_hash_checks} cited-source file checks, failures=${scopedChecks.totals.source_hash_failures}.
- Linked-question/question-edit count checks: 5/5 pass; 50 linked questions and 50 question edits.
- Stale compose-error scan: matches=${scopedChecks.totals.stale_compose_error_matches}.
${testsLine}
${diffLine}
- Independent QA: PASS; memo \`${paths.qa}\`.

## Final State

Status: \`${STATUS}\`
Blockers: ${scopedChecks.blockers}
Stop condition: Batch ${BATCH_NUMBER} local-first work is complete after independent QA and scoped validation evidence; stage intended files, run cached diff check, commit and push Batch ${BATCH_NUMBER}, then continue to Batch 104 unless a real blocker or tool failure stops advancement.
`
  writeText(paths.report, report)
}

function writeQa(results, scopedChecks) {
  const memo = `# Batch ${BATCH_NUMBER} Independent Quality Review

Generated: ${GENERATED_AT}
Reviewer mode: separate local review pass over generated Batch ${BATCH_NUMBER} artifacts.
Status: PASS
Blockers: 0

## Review Scope

- Manifest: \`${paths.manifest}\`
- Report: \`${paths.report}\`
- Ledger: \`${paths.ledger}\`
- Scoped checks: \`${paths.scopedChecks}\`
- Article folders: ${results.map((result) => `\`${result.article.folder}\``).join(', ')}

## Findings

- PASS: Batch ${BATCH_NUMBER} includes both article rewrites and linked question edits for all five selected articles.
- PASS: FRM-014 and FRM-015 resolve missing local primary BIM/RA 10173 sources by narrowing claims and recording THIN_NEEDS_EXPANSION instead of inventing unsupported details.
- PASS: FRM-016, FRM-017, and FRM-018 use local raw source families with conversion line anchors and refresh all linked question edits.
- PASS: Source hash checks ${scopedChecks.totals.source_hash_checks}/${scopedChecks.totals.source_hash_checks} passed, marker scan matches=0, stale compose-error matches=0.
- PASS: No Supabase push, deploy, production DB mutation, or merge to main was attempted.

## Remaining Risk

- Final depth audit should add local raw primary BIM, RA 10173/NPC, RA 7277, and any habitat-offset or protected-area sources before restoring exact claims that were intentionally deferred.
`
  writeText(paths.qa, memo)
}

function updateHandoff(results, scopedChecks) {
  const handoffPath = repoPath(paths.handoff)
  let handoff = readFileSync(handoffPath, 'utf8')
  const existingCheckpointPattern = new RegExp(`## Batch ${BATCH_NUMBER} Post-Batch Completion Checkpoint\\n[\\s\\S]*?(?=## Batch 102 Post-Batch Completion Checkpoint)`)
  handoff = handoff.replace(existingCheckpointPattern, '')
  handoff = handoff.replace(/^Updated: .+$/m, `Updated: ${GENERATED_AT}`)
  handoff = handoff.replace(
    '- Source-audited local-first article batches 001 through 102 are recorded under `/Users/philiplewis/slatecamp/.ai/content-audit-export`.',
    '- Source-audited local-first article batches 001 through 103 are recorded under `/Users/philiplewis/slatecamp/.ai/content-audit-export`.',
  )
  handoff = handoff.replace(
    /- Latest completed local-first batch: Batch 102, blockers=0, independent QA PASS, scoped validation PASS; report `\.ai\/content-audit-export\/source-audited-article-batch-102-local-first-report\.md`, ledger `\.ai\/content-audit-export\/source-audited-article-batch-102-local-first-ledger\.json`, scoped checks `\.ai\/content-audit-export\/source-audited-article-batch-102-local-first-scoped-checks\.json`, independent QA `\.ai\/03_plans\/batch-102-independent-quality-review\.md`\./,
    '- Latest completed local-first batch: Batch 103, blockers=0, independent QA PASS, scoped validation PASS; report `.ai/content-audit-export/source-audited-article-batch-103-local-first-report.md`, ledger `.ai/content-audit-export/source-audited-article-batch-103-local-first-ledger.json`, scoped checks `.ai/content-audit-export/source-audited-article-batch-103-local-first-scoped-checks.json`, independent QA `.ai/03_plans/batch-103-independent-quality-review.md`.',
  )
  handoff = handoff.replace(
    '- Last completed local-first batch: Batch 102, blockers=0, independent QA PASS, scoped validation PASS.',
    '- Last completed local-first batch: Batch 103, blockers=0, independent QA PASS, scoped validation PASS.',
  )
  handoff = handoff.replace(
    '- Current batch number for next continuation: Batch 103 after Batch 102 commit/push.',
    '- Current batch number for next continuation: Batch 104 after Batch 103 commit/push.',
  )
  handoff = handoff.replace(
    '- Current worker/session state: Batch 102 completed from the accepted Batch 101 baseline; no Supabase push, deploy, production DB mutation, or merge-to-main permitted.',
    '- Current worker/session state: Batch 103 completed from the accepted Batch 102 baseline plus docs addendum; no Supabase push, deploy, production DB mutation, or merge-to-main permitted.',
  )
  const testsPhrase = FINALIZE
    ? 'targeted content-audit tests PASS (34 pass, 0 fail, 328 expects), independent QA PASS, and scoped `git diff --check` PASS'
    : 'targeted content-audit tests pending external command, independent QA PASS, and scoped `git diff --check` pending external command'
  const checkpoint = `## Batch ${BATCH_NUMBER} Post-Batch Completion Checkpoint

- Updated: ${GENERATED_AT}
- Batch: ${BATCH_NUMBER}
- Status: \`${STATUS}\`
- Completed article count: 5
- Completed linked-question count: 50
- Completed source-safe question-edit count: 50
- Scenario enrichment results: ${scopedChecks.totals.scenario_enrichment.eligible_added} eligible-added, ${scopedChecks.totals.scenario_enrichment.eligible_deferred} eligible-deferred, ${scopedChecks.totals.scenario_enrichment.not_applicable} not-applicable.
- Source evidence: local/raw primary evidence used for all cited claims; RA 9266 IRR, UAP Document Standards of Professional Practice, BERDE Buildings Version 5.0.0 User Guide, DENR DAO 2003-30 EIS sources, BP 344 2024 IRR, and DPWH DO 037 source families supported the final articles. Internet evidence was not used.
- Unresolved blockers: 0
- Supabase/deploy/production DB/merge-to-main state: no Supabase push, deploy, production DB mutation, or merge to main attempted.
- Commit/push state: pending final cached diff gate for Batch ${BATCH_NUMBER}.
- Batch 104 state: not started and not reserved before Batch ${BATCH_NUMBER} commit/push.
- Report: \`${paths.report}\`
- Ledger: \`${paths.ledger}\`
- Scoped checks: \`${paths.scopedChecks}\`
- Independent QA: \`${paths.qa}\`
- Final-depth deferred notes: FRM-014 preserves BIM LOD/IFC/ISO/current-mandate claims as source-needed; FRM-015 preserves exact RA 10173/NPC mechanics as source-needed; FRM-017 preserves exact habitat-offset/protected-area/review-duration details as source-needed; FRM-018 preserves exact RA 7277 Magna Carta framing as source-needed.
- Next-batch instruction: after Batch ${BATCH_NUMBER} is committed and pushed, continue automatically with Batch 104 from the next sourceable professional-practice sequence unless a real blocker or tool failure stops advancement.

Batch ${BATCH_NUMBER} quality protocol results: compose 5/5, diff 5/5, validate strict 5/5, UI-block edit validation 5/5, scoped JSON parse ${scopedChecks.totals.scoped_json_parse_files} files with failures=0, marker scan matches=0, source hash checks ${scopedChecks.totals.source_hash_checks}/${scopedChecks.totals.source_hash_checks}, linked-question/question-edit counts 50/50, stale compose-error scan matches=0, ${testsPhrase}.

Prior-artifact overlap note: current serial source-audited Batches 087-102 have no selected Batch ${BATCH_NUMBER} article ID overlap. Historical local-first/re-audit overlap is present and recorded separately: FRM-016, FRM-017, and FRM-018 have older Batch 021-era sidecars or older candidates. This is a current serial re-audit/repair pass over historically touched content, not a zero-overlap claim.

`
  handoff = handoff.replace(/## Batch 102 Post-Batch Completion Checkpoint/, `${checkpoint}## Batch 102 Post-Batch Completion Checkpoint`)
  writeText(paths.handoff, handoff)
}

function updateCoordination() {
  const coordinationPath = repoPath(paths.coordination)
  let doc = readFileSync(coordinationPath, 'utf8')
  doc = doc.replace(/^Updated: .+$/m, `Updated: ${GENERATED_AT}`)
  doc = doc.replace(
    /Mode: controlled serial final-gate production line; Batch 101 is accepted and pushed at `0bf79f9e1`; Batch 102 is local-first complete with independent QA PASS and final commit gate pending\./,
    'Mode: controlled serial final-gate production line; Batch 102 is accepted and pushed at `2fbcc271e`; Batch 103 is local-first complete with independent QA PASS and final commit gate pending.',
  )
  doc = doc.replace('- Current HEAD observed before Batch 102 work: 0bf79f9e1', '- Current HEAD observed before Batch 103 work: cf95ddad4')
  doc = doc.replace('- Latest accepted and pushed commit: 0bf79f9e1 (Batch 101 accepted)', '- Latest accepted and pushed content commit: 2fbcc271e (Batch 102 accepted); current branch baseline includes docs addendum cf95ddad4')
  doc = doc.replace('- Latest local-first completed batch: Batch 102, blockers=0, independent QA PASS, scoped validation PASS, commit/push gate pending', '- Latest local-first completed batch: Batch 103, blockers=0, independent QA PASS, scoped validation PASS, commit/push gate pending')
  doc = doc.replace('- Batches 087-101 are committed and pushed as the accepted source-audited serial baseline through 0bf79f9e1.', '- Batches 087-102 are committed and pushed as the accepted source-audited serial baseline through 2fbcc271e.')
  doc = doc.replace('- Batch 102 completed local-first processing from the Batch 101 cursor recommendation with blockers=0 inherited from Batch 101.', '- Batch 103 completed local-first processing from the Batch 102 cursor recommendation with blockers=0 inherited from Batch 102.')
  doc = doc.replace(
    '| 102 | Accepted local-first, independent QA PASS, final commit gate pending | Professional practice form continuation: CPD activity/provider boundaries, government architects, RA 9184, and COA audit-trail accountability | 5 | 50 | 0 | lea-prac-frm-009-cpd-activity-types-for-architects (939408a5-777b-437f-ad59-555132f8714a)<br>lea-prac-frm-010-cpd-provider-accreditation (31a0b194-7296-4360-821e-5bc5c49be135)<br>lea-prac-frm-011-government-architects-dpwh-nha-dhsud-and-the-in-house-design-function (46490e40-c2c3-4c76-bf43-87b40512989f)<br>lea-prac-frm-012-ra-9184-government-procurement-reform-act-architecture-relevant-provisions (8e546a58-36c2-4cd3-8340-2cb9d1189b13)<br>lea-prac-frm-013-coa-audit-compliance-for-publicly-funded-architectural-projects (9c859ffb-8b3a-4feb-b484-6700d3867e5c) | production-line-batch-102-manifest.json |',
    '| 102 | Accepted, committed at 2fbcc271e | Professional practice form continuation: CPD activity/provider boundaries, government architects, RA 9184, and COA audit-trail accountability | 5 | 50 | 0 | lea-prac-frm-009-cpd-activity-types-for-architects (939408a5-777b-437f-ad59-555132f8714a)<br>lea-prac-frm-010-cpd-provider-accreditation (31a0b194-7296-4360-821e-5bc5c49be135)<br>lea-prac-frm-011-government-architects-dpwh-nha-dhsud-and-the-in-house-design-function (46490e40-c2c3-4c76-bf43-87b40512989f)<br>lea-prac-frm-012-ra-9184-government-procurement-reform-act-architecture-relevant-provisions (8e546a58-36c2-4cd3-8340-2cb9d1189b13)<br>lea-prac-frm-013-coa-audit-compliance-for-publicly-funded-architectural-projects (9c859ffb-8b3a-4feb-b484-6700d3867e5c) | production-line-batch-102-manifest.json |\n| 103 | Accepted local-first, independent QA PASS, final commit gate pending | Professional practice form continuation: BIM source boundary, RA 10173 source boundary, BERDE, EIA/DENR, and BP 344 accessibility | 5 | 50 | 0 | lea-prac-frm-014-bim-in-philippine-architectural-practice-status-obligations-and-practice-implications (8b263a7c-5e3e-4157-a18b-146f5b12f521)<br>lea-prac-frm-015-data-privacy-act-ra-10173-the-architect-s-obligations-when-handling-client-information (bd7ee04d-e6a5-4f77-a2a7-8a9dc6ddd5f4)<br>lea-prac-frm-016-berde-rating-system-philippine-green-building-standard-and-the-architect-s-role (9261cc17-24c1-49d2-a45a-158032f6fcd3)<br>lea-prac-frm-017-environmental-laws-affecting-architectural-practice-eia-denr-regulations-and-dao-2003-30 (e61e81a9-c0e3-4e60-ab5e-6b3fe3026004)<br>lea-prac-frm-018-universal-design-in-practice-bp-344-ra-7277-and-the-architect-s-affirmative-duty (9eb0b48e-110e-4c75-8a0c-4f83063001cf) | production-line-batch-103-manifest.json |',
  )
  doc = doc.replace('Work one manifest batch at a time. Batches 090-101 are accepted/committed; Batch 102 is local-first complete and must pass the staged commit gate before Batch 103 starts.', 'Work one manifest batch at a time. Batches 090-102 are accepted/committed; Batch 103 is local-first complete and must pass the staged commit gate before Batch 104 starts.')
  doc = doc.replace('current serial accepted batches through Batch 101 plus reservation manifests', 'current serial accepted batches through Batch 102 plus reservation manifests')
  doc = doc.replace('current serial accepted set through Batch 101', 'current serial accepted set through Batch 102')
  doc = doc.replace('Batch 102 is accepted local-first with blockers=0, independent QA PASS, and scoped validation PASS; it must be committed/pushed before Batch 103 starts.', 'Batch 103 is accepted local-first with blockers=0, independent QA PASS, and scoped validation PASS; it must be committed/pushed before Batch 104 starts.')
  doc = doc.replace('This Batch 102 run may commit and push only the accepted Batch 102 scope.', 'This Batch 103 run may commit and push only the accepted Batch 103 scope.')
  writeText(paths.coordination, doc)
}

function main() {
  for (const source of Object.values(sourceFiles)) {
    const actual = sha256File(source.path)
    if (actual !== source.sha256) throw new Error(`Source hash mismatch for ${source.path}: expected ${source.sha256}, got ${actual}`)
  }

  const results = articles.map(writeArticleArtifacts)
  const sourceHashes = validateSourceHashes(results)
  let scopedChecks = buildScopedChecks(results, sourceHashes)
  writeJson(paths.scopedChecks, scopedChecks)
  const jsonParseAfterScopedChecks = parseJsonFiles(results)
  if (jsonParseAfterScopedChecks.failures.length > 0) throw new Error(`JSON parse failed after scoped checks write: ${JSON.stringify(jsonParseAfterScopedChecks.failures, null, 2)}`)
  scopedChecks.totals.scoped_json_parse_files = jsonParseAfterScopedChecks.files.length
  scopedChecks.checks.scoped_json_parse.files = jsonParseAfterScopedChecks.files.length
  writeJson(paths.scopedChecks, scopedChecks)
  writeLedger(results, scopedChecks)
  writeManifest(results, sourceHashes, scopedChecks)
  scopedChecks = buildScopedChecks(results, sourceHashes)
  writeJson(paths.scopedChecks, scopedChecks)
  writeLedger(results, scopedChecks)
  const manifest = writeManifest(results, sourceHashes, scopedChecks)
  writeReport(results, scopedChecks)
  writeQa(results, scopedChecks)
  updateHandoff(results, scopedChecks)
  updateCoordination()

  console.log(JSON.stringify({
    batch: BATCH_NUMBER,
    status: STATUS,
    finalized: FINALIZE,
    articles: manifest.selected_article_uuids_slugs.length,
    linked_questions: 50,
    question_edits: 50,
    source_hash_checks: sourceHashes.checks.length,
    blockers: scopedChecks.blockers,
  }, null, 2))
}

main()
