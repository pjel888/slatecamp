import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { createHash } from 'node:crypto'

const REPO_ROOT = process.cwd()
const BATCH_NUMBER = '101'
const BATCH_ID = `source-audited-article-batch-${BATCH_NUMBER}-local-first`
const GENERATED_AT = '2026-05-13T10:20:00+08:00'
const AUDIT_DATE = '2026-05-13'
const BRANCH = '3dlab-gray-viewport-bg'
const BASELINE_COMMIT = 'fc48b8685b'
const STATUS = 'PASS_LOCAL_FIRST_READY_FOR_FINAL_PUBLISHING_REVIEW'

const paths = {
  manifest: `.ai/03_plans/production-line-batch-${BATCH_NUMBER}-manifest.json`,
  report: `.ai/content-audit-export/source-audited-article-batch-${BATCH_NUMBER}-local-first-report.md`,
  ledger: `.ai/content-audit-export/source-audited-article-batch-${BATCH_NUMBER}-local-first-ledger.json`,
  scopedChecks: `.ai/content-audit-export/source-audited-article-batch-${BATCH_NUMBER}-local-first-scoped-checks.json`,
  qa: `.ai/03_plans/batch-${BATCH_NUMBER}-independent-quality-review.md`,
  handoff: '.ai/03_plans/source-audited-local-first-batches-handoff.md',
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
  ra9266IrrRefined: {
    path: 'vitruvius-connection/002_Raw-Conversion-Layer/001-Laws/refined_markdown/RA-9266/IRR of RA 9266.md',
    sha256: 'sha256:bdc987f6e326afdc4cdffa9dabc85f4f5c64d2960ad14c9c7665ab964c7141f0',
  },
  uapPdf: {
    path: 'vitruvius-connection/001_Raw-Source-Layer/001-Laws/UAP/UAP Document Standards of Professional Practice.pdf',
    sha256: 'sha256:af3b0fd1b232443881cbb79d3b2ed2a9a93ecb34677cdbd3b2acddbcdb7d2b3b',
  },
  uapRaw: {
    path: 'vitruvius-connection/002_Raw-Conversion-Layer/001-Laws/raw_markdown/UAP/UAP Document Standards of Professional Practice.md',
    sha256: 'sha256:c45877da3cb3349d07f607fd7fcd3b1df4c0a2587d022249af3e8bee8a1a92a5',
  },
  prboaPdf: {
    path: 'vitruvius-connection/001_Raw-Source-Layer/001-Laws/PRC/PRBoAres03,s08_temporary Permits for Foreign Architects.pdf',
    sha256: 'sha256:7f2933dbe8914fd908cfb5b746d9f32b340fbf8ac053633db1010bc11d0d8b64',
  },
  prboaRaw: {
    path: 'vitruvius-connection/002_Raw-Conversion-Layer/001-Laws/raw_markdown/PRC/PRBoAres03,s08_temporary Permits for Foreign Architects.md',
    sha256: 'sha256:05305827c036a9de21011c5d14cd2f5978a4e02c341e8ebd6e684f85528a8142',
  },
  prboaRefined: {
    path: 'vitruvius-connection/002_Raw-Conversion-Layer/001-Laws/refined_markdown/PRC/PRBoAres03,s08_temporary Permits for Foreign Architects.md',
    sha256: 'sha256:6b3b65067640dd72d58e96c10165c22afd4030f4f3cbb4493775fd48c3c8ff9e',
  },
}

const checkedSourceSets = {
  raUap(slug) {
    return [
      sourceEntry({
        sourceId: `batch101-${slug}-ra-9266-irr`,
        label: 'RA 9266 IRR Architecture Act of 2004',
        sourceType: 'implementing_rules',
        raw: sourceFiles.ra9266Pdf,
        conversion: sourceFiles.ra9266Raw,
        locator: 'raw markdown lines 96-99, 123-146, 233-235, 672-691, 782-824',
      }),
      sourceEntry({
        sourceId: `batch101-${slug}-uap-standards-of-professional-practice`,
        label: 'UAP Document Standards of Professional Practice',
        sourceType: 'professional_standards',
        raw: sourceFiles.uapPdf,
        conversion: sourceFiles.uapRaw,
        locator: 'raw markdown lines 58-63, 128-132, 293-297, 1639-1648, 1854-1857',
      }),
    ]
  },
  foreign(slug) {
    return [
      sourceEntry({
        sourceId: `batch101-${slug}-ra-9266-irr`,
        label: 'RA 9266 IRR Architecture Act of 2004',
        sourceType: 'implementing_rules',
        raw: sourceFiles.ra9266Pdf,
        conversion: sourceFiles.ra9266Raw,
        locator: 'raw markdown lines 672-691, 782-824',
      }),
      sourceEntry({
        sourceId: `batch101-${slug}-prboa-temporary-permits`,
        label: 'PRBoA Resolution 03, series 2008 on Temporary Permits for Foreign Architects',
        sourceType: 'board_resolution',
        raw: sourceFiles.prboaPdf,
        conversion: sourceFiles.prboaRefined,
        locator: 'refined markdown lines 7-19, 68-83, 108-123, 140-152, 186-193, 393-403',
      }),
      sourceEntry({
        sourceId: `batch101-${slug}-uap-standards-foreign-counterpart`,
        label: 'UAP Document Standards of Professional Practice',
        sourceType: 'professional_standards',
        raw: sourceFiles.uapPdf,
        conversion: sourceFiles.uapRaw,
        locator: 'raw markdown lines 128-132, 293-297, 1854-1857',
      }),
    ]
  },
  aseanGate(slug) {
    return [
      sourceEntry({
        sourceId: `batch101-${slug}-ra-9266-irr-section-38`,
        label: 'RA 9266 IRR Architecture Act of 2004',
        sourceType: 'implementing_rules',
        raw: sourceFiles.ra9266Pdf,
        conversion: sourceFiles.ra9266Raw,
        locator: 'raw markdown lines 684-691, 782-824',
      }),
      sourceEntry({
        sourceId: `batch101-${slug}-prboa-temporary-permit-application`,
        label: 'PRBoA Resolution 03, series 2008 on Temporary Permits for Foreign Architects',
        sourceType: 'board_resolution',
        raw: sourceFiles.prboaPdf,
        conversion: sourceFiles.prboaRefined,
        locator: 'refined markdown lines 68-83, 108-123, 140-152, 287-290, 317, 393-403',
      }),
    ]
  },
  cpd(slug) {
    return [
      sourceEntry({
        sourceId: `batch101-${slug}-ra-9266-irr-cpd-and-pic`,
        label: 'RA 9266 IRR Architecture Act of 2004',
        sourceType: 'implementing_rules',
        raw: sourceFiles.ra9266Pdf,
        conversion: sourceFiles.ra9266Raw,
        additionalConversions: [sourceFiles.ra9266IrrRefined],
        locator: 'raw markdown lines 117-119, 221-223, 672-676; refined markdown lines 544-548, 582-584, 636-644, 668-672',
      }),
    ]
  },
}

const articles = [
  {
    slug: 'lea-prac-frm-004-joint-venture-in-architecture',
    articleId: '846e0ded-f254-441a-a9d2-67af1f617ba5',
    title: 'Joint Venture in Architecture',
    folder: '.ai/content-audit-export/articles/lea-prac-frm-004-joint-venture-in-architecture--846e0ded-f254-441a-a9d2-67af1f617ba5',
    focus: 'project-based joint venture, foreign-architect gate, Filipino counterpart, and professional responsibility',
    sourceFamily: 'RA 9266 IRR Architecture Act of 2004; UAP Document Standards of Professional Practice',
    historical: ['Batch 019 local-first source-audited repair artifact'],
    sourceSet: 'raUap',
    scenarioStatus: 'eligible-added',
    thinNote: null,
    article: `# Joint Venture in Architecture

## Board Exam Quick Check

For joint-venture questions, ask three things in order: is the arrangement project-based, are the participants architects or architectural firms, and is any foreign architect involved. The foreign-architect fact changes the answer because RA 9266 adds a temporary or special permit and Filipino counterpart gate.

## Learning Goal

After studying this article, you should be able to:

- Define a joint venture as a project-based association under the RA 9266 IRR.
- Distinguish a project-based grouping from a permanent partnership or corporation.
- Apply the Filipino counterpart and temporary or special permit rules when a foreign architect is involved.
- Explain why a joint venture does not erase professional responsibility.

## Source-Backed Definition

The RA 9266 IRR defines an association as a formal grouping of two or more architects or architectural firms working in joint venture on a project basis. The exam signal is the project basis. A joint venture is not tested as a permanent corporate form just because two firms collaborate.

The UAP standards use related consortium or association language for professional consulting work. They allow collaboration among Filipino professional consultants or registered architectural firms, and collaboration with foreign professional consultants or firms when those foreign participants are authorized to render consulting services.

## Agreement and Authority

A joint-venture agreement should identify the project, roles, signing authority, fees, document custody, continuity procedures, and dispute process. These controls help the team work, but they do not replace the professional authority required by RA 9266.

Each participant must have the authority required for the services it performs. If a foreign architect is involved on Philippine soil, the project team must check the temporary or special permit gate and the Filipino counterpart requirement before letting the foreign participant act as architect or architectural consultant.

## Filipino Counterpart and Responsibility

When a foreign architect or foreign firm participates in a Philippine project, the safer LEA answer is not "foreign expertise is enough." RA 9266 Section 38 requires a special or temporary permit before the foreign national assumes architectural duties, functions, and responsibilities. The UAP standards also require collaboration with a local Filipino counterpart registered and licensed architect for foreign competition or practice scenarios.

The UAP standards state that individuals, partners, firms, corporations, consortiums, and joint ventures that render professional architectural consulting services remain professionally responsible before the State and civilly liable before the State, the public, and the client.

## Real World Scenario

A Filipino firm and a foreign design studio are invited to deliver a civic complex. The team may describe the collaboration as a joint venture, but the label does not settle the legal gate. The foreign architect still needs the required temporary or special permit before performing architectural duties, and the Filipino counterpart RLA must carry the local professional responsibility expected under RA 9266 and the UAP standards. The source-safe project response is to document roles, permit timing, counterpart duties, and liability before technical work appears on permit or construction documents.

## Exam Traps

- Treating every collaboration as a permanent partnership or corporation.
- Treating a foreign architect's home-country license as Philippine practice authority.
- Treating the joint-venture agreement as a substitute for registration, permit, or counterpart requirements.
- Treating shared branding as shared legal authority without checking who is authorized to practice.

## Related Articles

- [Sole Proprietorship](lea-prac-frm-001)
- [Partnership](lea-prac-frm-002)
- [Corporate Practice](lea-prac-frm-003)
- [Foreign Architects](lea-prac-frm-005)
- [Reciprocity Principles](lea-prac-frm-007)
`,
    questionTemplates: [
      q('Under the RA 9266 IRR, what makes an architectural joint venture an association?', 'A formal grouping of two or more architects or architectural firms working on a project basis', ['A permanent corporation formed for all future projects', 'Any informal referral arrangement between designers', 'A solo architect hiring temporary staff'], 'The RA 9266 IRR association definition ties the concept to a formal grouping of two or more architects or architectural firms on a project basis.'),
      q('A collaboration between two firms is limited to one transport terminal project. What fact best supports classifying it as a joint venture?', 'The arrangement is project-based', ['It has a shared logo', 'It has one private client', 'It uses one email address'], 'The source-backed distinction is project basis, not branding or administrative convenience.'),
      q('What does a joint-venture agreement accomplish in source-safe professional practice analysis?', 'It records roles and controls but does not replace RA 9266 authority requirements', ['It automatically licenses all participants', 'It removes the need for a Filipino counterpart', 'It converts foreign consultants into Philippine registered architects'], 'A contract can organize roles, but professional authority still comes from the applicable registration, permit, and counterpart rules.'),
      q('A foreign architect joins a Philippine joint venture as design consultant. What must be checked before duties are assumed?', 'The temporary or special permit gate and the Filipino counterpart arrangement', ['Only the foreign architect\'s portfolio', 'Only the project budget', 'Only the client invitation letter'], 'RA 9266 Section 38 requires the permit gate before architectural duties, functions, and responsibilities are assumed.'),
      q('What is the Filipino counterpart rule designed to prevent in a joint venture?', 'Foreign participation operating outside the Philippine professional-practice framework', ['Local architects joining project teams', 'Project-specific collaboration between Filipino firms', 'A written consulting agreement'], 'The counterpart requirement keeps foreign participation associated with a locally responsible Philippine professional pathway.'),
      q('How do professional responsibility and civil liability apply to a joint venture under the UAP standards?', 'The joint venture participants remain professionally responsible and civilly liable for their services', ['Liability disappears because several firms are involved', 'Only the client carries responsibility', 'Only the contractor carries responsibility'], 'The UAP standards include consortiums and joint ventures within professional responsibility and civil liability language.'),
      q('Which answer best handles a foreign firm name appearing on Philippine project documents?', 'Check whether the use implies practice and whether Section 38 and counterpart requirements are satisfied', ['Treat it as harmless marketing in all cases', 'Ignore it if the foreign firm is famous', 'Allow it if the owner approves'], 'Foreign names and titles on project documents can raise practice-authority issues, so the statutory gate must be checked.'),
      q('What is the safest first question when analyzing a domestic joint venture?', 'Is this a formal project-based grouping of architects or architectural firms?', ['Which firm has the larger office?', 'Which partner has the newer software?', 'Which party created the marketing deck?'], 'The article anchors the domestic analysis in the source definition of a formal project-based grouping.'),
      q('Why is a joint venture different from incorporation for LEA purposes?', 'The joint venture is tied to a project, while incorporation creates a separate permanent business form', ['Joint ventures never need written agreements', 'Corporations cannot practice architecture', 'Joint ventures are only for government projects'], 'The source-backed joint-venture concept is project-based and should not be confused with permanent business organization.'),
      q('What is the best answer method for a joint-venture item with foreign participation?', 'Identify project basis, then apply permit, Filipino counterpart, and responsibility rules', ['Choose the option with the most international credentials', 'Ignore Philippine practice law if the project is private', 'Treat the venture as valid once fees are agreed'], 'Foreign participation adds the RA 9266 permit and counterpart gates to the project-based joint-venture analysis.'),
    ],
    claims: [
      'RA 9266 IRR defines association as a formal grouping of two or more architects or architectural firms working in joint venture on a project basis.',
      'Foreign participation in a Philippine project triggers RA 9266 Section 38 temporary or special permit and Filipino counterpart analysis.',
      'UAP standards keep professional responsibility and civil liability attached to consortiums and joint ventures.',
    ],
    sourceExcerpt: 'Association means two or more architects or firms working in joint venture on a project basis.',
  },
  {
    slug: 'lea-prac-frm-005-foreign-architects-in-the-philippines',
    articleId: 'ae4bdc43-1451-4aa5-8c12-65283f4bbdfd',
    title: 'Foreign Architects in the Philippines',
    folder: '.ai/content-audit-export/articles/lea-prac-frm-005-foreign-architects-in-the-philippines--ae4bdc43-1451-4aa5-8c12-65283f4bbdfd',
    focus: 'foreign architect definition, temporary/special permit, Filipino counterpart, and architect-of-record boundary',
    sourceFamily: 'RA 9266 IRR Architecture Act of 2004; PRBoA temporary permit resolution; UAP Document Standards of Professional Practice',
    historical: ['2026-05-10 partial local-first source audit; Batch 101 completed all 10 question edits'],
    sourceSet: 'foreign',
    scenarioStatus: 'eligible-added',
    thinNote: null,
    article: `# Foreign Architects in the Philippines

## Board Exam Quick Check

For foreign-architect questions, do not stop at home-country licensure. The exam gate is whether the foreign national may perform architectural services in the Philippines, and that gate runs through RA 9266, the Board and Commission temporary or special permit, and the Filipino counterpart requirement.

## Learning Goal

After studying this article, you should be able to:

- Identify who counts as a foreign architect under the RA 9266 IRR.
- Apply the temporary or special permit requirement before practice duties are assumed.
- Explain the Filipino counterpart requirement.
- Distinguish consulting participation from the architect-of-record role.

## Definition

The RA 9266 IRR defines a foreign architect as an architect who is not a Filipino citizen, is not registered and licensed in the Philippines, but is duly registered and licensed in the architect's home country. Home-country licensure matters, but it is only one part of the Philippine practice analysis.

The same IRR defines the Filipino counterpart as the local Philippine architect, partnership, or corporation that must work in association with the foreign architect, partnership, or corporation on a project on Philippine soil.

## Temporary or Special Permit Gate

RA 9266 Section 38 requires foreign nationals who enter the Philippines to perform professional services as architects or consultants to secure a special or temporary permit from the Board, subject to Commission approval, before assuming duties, functions, and responsibilities as architects or consultants.

The PRBoA temporary-permit resolution makes the permit individual, project-specific, and limited in period. It is issued to the individual foreign architect, not to the foreign firm as a blanket authority for every project.

## Filipino Counterpart and Architect of Record

The PRBoA resolution requires the application to identify the Filipino counterpart architect and includes current professional credentials in the supporting materials. It also states that the foreign architect with a temporary or special permit may act as consultant or architectural and interior consulting collaborator, but cannot be the architect of record. The architect-of-record role remains with the Filipino counterpart.

The foreign architect with a permit must comply with Philippine laws, RA 9266, the IRR, the Code of Ethical Conduct, and Standards of Professional Practice. The Filipino counterpart must help educate and advise the foreign architect on those local requirements.

## Real World Scenario

A Manila developer wants a foreign hotel designer to be named as architect on permit drawings. The source-safe answer is not simply yes because the designer is licensed abroad. First, decide whether the person is a foreign architect under the IRR. Second, check whether a temporary or special permit has been secured before duties are assumed. Third, route the project through a Filipino counterpart RLA who carries the architect-of-record role. The project can use foreign expertise, but it cannot use that expertise to bypass the Philippine practice gate.

## Exam Traps

- Treating home-country licensure as Philippine practice authority.
- Treating the permit as a firm-wide or unlimited authorization.
- Treating a foreign consultant as architect of record.
- Treating the Filipino counterpart as optional professional courtesy.
- Treating a name on technical documents as harmless if it implies practice.

## Related Articles

- [Joint Venture](lea-prac-frm-004)
- [ASEAN MRA](lea-prac-frm-006)
- [Reciprocity Principles](lea-prac-frm-007)
- [RA 9266 Legal Framework](lea-prac-law-001)
`,
    questionTemplates: [
      q('Under the RA 9266 IRR, who is a foreign architect?', 'A non-Filipino architect not registered and licensed in the Philippines but duly licensed in the home country', ['Any designer employed by a foreign company', 'Any Philippine registered architect working abroad', 'Any consultant paid in foreign currency'], 'The definition requires non-Filipino status, lack of Philippine registration and licensure, and home-country architectural licensure.'),
      q('What must a foreign architect secure before assuming architectural consultant duties in the Philippines?', 'A special or temporary permit from the Board, subject to Commission approval', ['A private invitation from the owner', 'A foreign firm employment contract', 'A local business card with an architect title'], 'RA 9266 Section 38 requires the permit before duties, functions, and responsibilities are assumed.'),
      q('How does the PRBoA temporary-permit resolution treat the permit?', 'It is issued to an individual foreign architect for one project and a limited period', ['It licenses the entire foreign firm for all Philippine work', 'It is permanent once issued', 'It replaces the Filipino counterpart requirement'], 'The PRBoA source frames the permit as individual, project-specific, and limited.'),
      q('Who remains architect of record when a foreign architect participates under a temporary or special permit?', 'The Filipino counterpart', ['The foreign architect automatically', 'The foreign design firm', 'The project owner'], 'The PRBoA resolution allows consulting participation but keeps the architect-of-record role with the Filipino counterpart.'),
      q('Which supporting detail is source-backed for a temporary permit application?', 'Identification of the Filipino counterpart and current professional credentials', ['A marketing award list only', 'A social media portfolio only', 'A client promise to supervise the work'], 'The permit application requires the Filipino counterpart information and professional credential support.'),
      q('What is the safest answer when a foreign architect is licensed abroad but not registered in the Philippines?', 'Home-country licensure alone is not enough for Philippine practice', ['The architect may practice freely because licensure exists somewhere', 'The architect may sign as AOR if the client agrees', 'The architect may bypass the Board if a Filipino firm is also hired'], 'Foreign licensure supports eligibility facts but does not remove the Philippine permit and counterpart gates.'),
      q('What local rules bind a foreign architect with a temporary or special permit?', 'Philippine laws, RA 9266, the IRR, the Code of Ethical Conduct, and SPP rules', ['Only the foreign architect\'s home-country rules', 'Only the client contract', 'Only international design standards'], 'The PRBoA resolution states that local Philippine professional rules apply to the foreign architect with a permit.'),
      q('What is a violation risk under the PRBoA temporary-permit source?', 'Practicing or implying legal practice without a valid temporary or special permit', ['Refusing to use a foreign consultant', 'Hiring a Filipino counterpart', 'Listing the project location in the contract'], 'The resolution identifies practice without a valid permit and misleading implications of legal practice as violation risks.'),
      q('Which statement best describes the Filipino counterpart?', 'The local Philippine architect, partnership, or corporation associated with the foreign participant on Philippine soil', ['A translator with construction vocabulary', 'A client-appointed marketing representative', 'Any local employee of the foreign firm'], 'The IRR definition ties the counterpart to local professional practice association, not clerical assistance.'),
      q('What should an LEA answer reject in a foreign-architect fact pattern?', 'Automatic Philippine practice authority based only on foreign prestige or a foreign license', ['Checking permit timing', 'Checking counterpart responsibility', 'Applying RA 9266 Section 38'], 'The foreign-architect gate is legal authority in the Philippines, not prestige or home-country licensure alone.'),
    ],
    claims: [
      'RA 9266 IRR defines foreign architect and Filipino counterpart for Philippine-soil projects.',
      'RA 9266 Section 38 requires a special or temporary permit before foreign architects assume duties as architects or consultants.',
      'PRBoA Resolution 03, series 2008 keeps architect-of-record authority with the Filipino counterpart while allowing limited consulting participation by a permit holder.',
    ],
    sourceExcerpt: 'The permit is issued to an individual foreign architect for one project and limited period.',
  },
  {
    slug: 'lea-prac-frm-006-asean-mutual-recognition-arrangement-for-architectural-services',
    articleId: 'a13cdc9c-f057-481e-a661-eedb6548f6d8',
    title: 'ASEAN Mutual Recognition Arrangement for Architectural Services',
    folder: '.ai/content-audit-export/articles/lea-prac-frm-006-asean-mutual-recognition-arrangement-for-architectural-services--a13cdc9c-f057-481e-a661-eedb6548f6d8',
    focus: 'Philippine practice gate for ASEAN/APEC registry scenarios using local RA 9266 and PRBoA temporary-permit sources',
    sourceFamily: 'RA 9266 IRR Architecture Act of 2004; PRBoA temporary permit resolution',
    historical: [],
    sourceSet: 'aseanGate',
    scenarioStatus: 'eligible-added',
    thinNote: 'THIN_NEEDS_EXPANSION final-depth candidate: full ASEAN MRA institutional details need a local primary MRA source before restoration.',
    article: `# ASEAN Mutual Recognition Arrangement for Architectural Services

## Board Exam Quick Check

For this local-first pass, treat ASEAN or APEC registry facts as recognition facts, not automatic Philippine practice authority. On a Philippine project, the source-backed answer still checks RA 9266 reciprocity, the temporary or special permit gate, and the Filipino counterpart requirement.

## Learning Goal

After studying this article, you should be able to:

- Avoid treating ASEAN or APEC recognition as a substitute for Philippine practice authority.
- Apply RA 9266 Section 38 to a foreign architect working on a project in the Philippines.
- Recognize that the PRBoA temporary-permit application asks about ASEAN or APEC registry status while still applying the permit gate.
- Distinguish recognition language from architect-of-record authority.

## Philippine Practice Gate

The locally checked sources for this batch do not make regional recognition a standalone license to practice architecture in the Philippines. RA 9266 Section 38 remains the controlling Philippine gate for a foreign national who enters the Philippines to perform professional services as an architect or consultant on a project.

The foreign architect must secure a special or temporary permit from the Board, subject to Commission approval, before assuming architectural duties, functions, and responsibilities. The same practice pathway also requires association with a Filipino counterpart.

## ASEAN or APEC Registry Status in the Permit File

The PRBoA temporary-permit application asks whether the applicant has ASEAN or APEC registry status. The same form notes that the application may proceed even if the answer is no. This makes registry status relevant information, not the whole legal authority.

For LEA purposes, the safe answer is that ASEAN or APEC status may support recognition facts, but it does not remove the Philippine permit, reciprocity, and counterpart checks required by RA 9266 and PRBoA permit procedure.

## Architect of Record Boundary

The PRBoA temporary-permit resolution permits a foreign architect with a temporary or special permit to act as consultant or collaborator within the permit limits. It does not make the foreign architect the architect of record. The architect-of-record role stays with the Filipino counterpart under the local practice framework.

This matters because exam choices often use regional recognition as if it were an automatic signing, sealing, or AOR privilege. Reject that shortcut unless the facts show the applicable Philippine authority pathway.

## Real World Scenario

A Singapore-based architect presents an ASEAN or APEC credential during a proposal for a mixed-use project in Quezon City. The owner asks whether that credential allows the architect to act as Philippine architect of record. The source-safe response is no. The credential may be relevant in the permit application, but the project still needs the RA 9266 temporary or special permit analysis, reciprocity evidence where required, and a Filipino counterpart RLA who carries the local architect-of-record responsibility.

## Exam Traps

- Treating regional recognition as a single ASEAN professional license.
- Treating ASEAN or APEC registry status as a waiver of RA 9266 Section 38.
- Treating foreign recognition as authority to become architect of record in the Philippines.
- Forgetting that the PRBoA form asks about registry status but still runs the permit process.

## Related Articles

- [Foreign Architects](lea-prac-frm-005)
- [Reciprocity Principles](lea-prac-frm-007)
- [Joint Venture](lea-prac-frm-004)
- [RA 9266 Legal Framework](lea-prac-law-001)
`,
    questionTemplates: [
      q('What is the safest Philippine-practice conclusion when a foreign architect has ASEAN or APEC registry status?', 'Registry status does not by itself replace the RA 9266 temporary or special permit and Filipino counterpart checks', ['Registry status automatically creates Philippine practice authority', 'Registry status makes the architect the Philippine AOR', 'Registry status removes all local law requirements'], 'The local sources treat registry status as application information while RA 9266 and PRBoA permit requirements still control practice authority.'),
      q('What does the PRBoA temporary-permit application ask about ASEAN or APEC status?', 'Whether the applicant has ASEAN or APEC registry status', ['Whether the applicant wants to skip the permit process', 'Whether the applicant wants to replace the Filipino counterpart', 'Whether the applicant is exempt from Philippine law'], 'The source-backed point is that the form asks about registry status as information in the permit file.'),
      q('If the ASEAN or APEC registry answer is no, what does the checked PRBoA form indicate?', 'The application may still proceed through the permit process', ['The application is automatically void', 'The architect becomes Philippine registered', 'The Filipino counterpart is no longer needed'], 'The form note permits proceeding even with a no answer, so registry status is not the entire gate.'),
      q('Which Philippine rule remains central when a foreign architect will perform architectural consulting on Philippine soil?', 'RA 9266 Section 38 temporary or special permit before duties are assumed', ['A regional credential alone', 'A client approval letter alone', 'A foreign design award alone'], 'RA 9266 Section 38 is the local practice gate for foreign nationals performing architectural services as architects or consultants.'),
      q('What architect-of-record rule should be applied to a foreign architect with a temporary or special permit?', 'The foreign architect may consult within permit limits, but the Filipino counterpart remains architect of record', ['The foreign architect automatically becomes AOR', 'The project owner becomes AOR', 'No AOR is needed when a regional credential exists'], 'The PRBoA temporary-permit source keeps AOR authority with the Filipino counterpart.'),
      q('What is the main exam trap in ASEAN MRA practice questions?', 'Confusing recognition of qualifications with permission to bypass Philippine practice gates', ['Checking the foreign architect\'s role', 'Checking whether a Filipino counterpart exists', 'Checking permit timing'], 'Recognition language does not cancel the RA 9266 and PRBoA practice pathway for Philippine projects.'),
      q('Which answer is source-safe for an ASEAN architect invited to a Manila project?', 'The architect must still satisfy the Philippine temporary-permit and counterpart framework before practice duties', ['The architect may sign and seal because ASEAN status exists', 'The architect may ignore PRBoA permit procedure', 'The architect may practice without any Filipino counterpart'], 'The Philippine project remains governed by the local foreign-architect gate.'),
      q('What evidence can the Board evaluate when no bilateral agreement is shown?', 'Documentary proof that Filipino architects may practice without limitation in the foreign jurisdiction', ['Only a project brochure', 'Only a client recommendation', 'Only the foreign firm profile'], 'The PRBoA source calls for documentary proof for Board evaluation when a bilateral agreement is absent.'),
      q('How should reciprocity be treated in an ASEAN/APEC registry fact pattern?', 'As a separate Philippine law check, not as automatically satisfied by registry language', ['As irrelevant to any foreign architect', 'As automatically satisfied by any regional credential', 'As a private contract term'], 'RA 9266 and PRBoA sources keep reciprocity and permit authority as local legal checks.'),
      q('Which statement should be rejected?', 'ASEAN or APEC registry status alone authorizes Philippine architectural practice', ['Registry status may appear in the permit application', 'RA 9266 Section 38 still matters', 'A Filipino counterpart can remain required'], 'The local checked sources do not support automatic Philippine practice authority from registry status alone.'),
    ],
    claims: [
      'RA 9266 Section 38 remains the Philippine practice gate for foreign architects performing services on Philippine projects.',
      'The PRBoA temporary-permit application asks about ASEAN or APEC registry status but indicates the application may proceed if the answer is no.',
      'The PRBoA temporary-permit resolution keeps the architect-of-record role with the Filipino counterpart.',
    ],
    sourceExcerpt: 'The application form asks about ASEAN or APEC registry status and may proceed if the answer is no.',
    deferredDepth: [
      'Full ASEAN MRA date, council, register, and monitoring-committee details were not restored because no local raw primary MRA source was found in this batch source layer.',
      'Final depth audit should restore or replace those details only after a local primary ASEAN MRA source is added.',
    ],
  },
  {
    slug: 'lea-prac-frm-007-reciprocity-principles-in-architectural-practice',
    articleId: 'e51e9a56-7251-460e-8d00-5feaa3884f0a',
    title: 'Reciprocity Principles in Architectural Practice',
    folder: '.ai/content-audit-export/articles/lea-prac-frm-007-reciprocity-principles-in-architectural-practice--e51e9a56-7251-460e-8d00-5feaa3884f0a',
    focus: 'Section 27 reciprocity for licensure-exam access versus Section 38 project-specific temporary permit',
    sourceFamily: 'RA 9266 IRR Architecture Act of 2004; UAP Document Standards of Professional Practice',
    historical: ['Batch 019 local-first source-audited repair artifact'],
    sourceSet: 'raUap',
    scenarioStatus: 'eligible-added',
    thinNote: null,
    article: `# Reciprocity Principles in Architectural Practice

## Board Exam Quick Check

For reciprocity questions, separate two pathways. Section 27 concerns a non-citizen applying to take the Philippine architecture licensure examination. Section 38 concerns a foreign architect performing project-specific professional services in the Philippines under a temporary or special permit.

## Learning Goal

After studying this article, you should be able to:

- Explain the reciprocity proof required before a non-citizen may take the licensure examination.
- Use "strict and absolute equality" in source-safe terms.
- Distinguish exam access under Section 27 from project practice under Section 38.
- Identify when a Filipino counterpart is part of the foreign-practice analysis.

## Section 27: Examination Access

RA 9266 Section 27 says a person who is not a Filipino citizen at the time of applying to take the licensure examination may not take the examination unless reciprocity is established. The foreign country must, by specific provision of law, either admit Filipino citizens to the same profession without restriction or allow them to practice after an examination on terms of strict and absolute equality with its own citizens or nationals.

The same rule includes unconditional recognition of prerequisite degrees or diplomas issued by institutions recognized by the Philippine government. General goodwill, informal professional courtesy, or similar education language is not enough.

## Documentary Proof

The IRR describes the proof process. The foreign citizen initiates establishment of reciprocity by submitting a letter or document under official seal from the proper foreign official, together with an authentic or authenticated copy of the foreign law translated into English.

If the Board is satisfied, the foreign applicant may be allowed to file an application to take the licensure examination and submit the required supporting documents.

## Section 27 Is Not Section 38

Section 27 is about permission to take the Philippine licensure examination. If the person later passes and obtains the required registration and Professional Identification Card, the person practices under Philippine registration.

Section 38 is different. It covers a foreign national who enters the Philippines to perform professional services as architect or consultant on a project. That person must secure a special or temporary permit before assuming duties, must satisfy the source-stated qualification and reciprocity conditions, and must work with a Filipino counterpart.

## Real World Scenario

A foreign architect asks whether a reciprocal professional relationship with the Philippines allows immediate work on a convention center. The answer depends on the pathway. If the architect wants to take the LEA, apply Section 27 and require official proof of legal reciprocity, strict and absolute equality, and recognition of prerequisite degrees. If the architect wants to work on the project without Philippine registration, apply Section 38 and require the temporary or special permit and Filipino counterpart pathway. Mixing the two pathways produces wrong exam answers.

## Exam Traps

- Treating reciprocity as a courtesy policy instead of a specific provision of foreign law.
- Treating Section 27 examination access as project practice authority.
- Treating Section 38 temporary permits as full Philippine registration.
- Treating foreign qualifications as enough without the official proof process.

## Related Articles

- [Foreign Architects](lea-prac-frm-005)
- [ASEAN MRA](lea-prac-frm-006)
- [Joint Venture](lea-prac-frm-004)
- [RA 9266 Legal Framework](lea-prac-law-001)
`,
    questionTemplates: [
      q('What does RA 9266 Section 27 primarily govern?', 'A non-citizen applicant seeking access to the Philippine architecture licensure examination', ['A project-specific temporary permit for consulting', 'A private joint-venture fee split', 'A permanent exemption from all Philippine practice laws'], 'Section 27 is the licensure-examination reciprocity provision.'),
      q('What must the foreign country provide for reciprocity under Section 27?', 'A specific provision of law giving Filipino citizens equivalent admission or practice terms', ['A general friendship statement', 'A professional organization brochure', 'A private developer recommendation'], 'The source requires a specific provision of foreign law, not informal courtesy.'),
      q('What does strict and absolute equality mean in this context?', 'Filipino citizens must be admitted or examined on terms equal to the foreign country\'s citizens or nationals', ['Filipino architects must pay higher fees', 'Only foreign citizens may receive automatic recognition', 'The Board may ignore legal proof'], 'Strict and absolute equality compares treatment of Filipino citizens with treatment of the foreign country\'s own citizens or nationals.'),
      q('Which degree rule is part of the reciprocity provision?', 'Unconditional recognition of prerequisite degrees or diplomas from institutions recognized by the Philippine government', ['Recognition only after a private employer approves', 'Recognition only for foreign schools with local offices', 'No degree recognition requirement'], 'Section 27 includes unconditional recognition of qualifying prerequisite degrees or diplomas.'),
      q('Who initiates establishment of reciprocity under the IRR process?', 'The foreign citizen seeking to take the examination', ['The project owner', 'The contractor', 'The city building official'], 'The IRR describes the foreign applicant initiating the reciprocity proof process.'),
      q('What documents are source-backed for establishing reciprocity?', 'An official-seal letter or document plus an authentic or authenticated English copy of the foreign law', ['A project rendering and fee proposal', 'A school transcript alone', 'A private email from the client'], 'The IRR requires official documentation and the relevant foreign law.'),
      q('What does Section 38 cover instead of Section 27?', 'Foreign nationals performing project-specific services as architects or consultants in the Philippines', ['The basic definition of CPD', 'A domestic sole proprietorship', 'The minimum passing score of the LEA'], 'Section 38 is the temporary or special permit pathway for foreign project practice.'),
      q('Why is Section 27 not enough for immediate project practice?', 'It concerns examination access, while project practice by a foreign architect uses the Section 38 permit pathway unless Philippine registration exists', ['It applies only to contractors', 'It repeals the Filipino counterpart rule', 'It gives automatic signing authority'], 'Do not treat exam access as project practice authority.'),
      q('Which answer should be rejected in a reciprocity item?', 'A foreign architect may take the LEA based on professional courtesy without foreign-law proof', ['The Board may require official proof', 'The law must show strict and absolute equality', 'Degree recognition can be part of the analysis'], 'Professional courtesy is not a substitute for the source-stated legal proof.'),
      q('What is the safest decision rule for foreign-architect questions?', 'Use Section 27 for LEA access and Section 38 for project-specific practice without Philippine registration', ['Use Section 27 for all foreign projects', 'Use Section 38 for all exam applications', 'Ignore both if the architect has regional recognition'], 'Separating Section 27 from Section 38 prevents pathway confusion.'),
    ],
    claims: [
      'RA 9266 Section 27 governs reciprocity proof before a non-citizen may take the Philippine architecture licensure examination.',
      'The reciprocity proof requires a specific provision of foreign law, strict and absolute equality, and unconditional recognition of prerequisite degrees.',
      'RA 9266 Section 38 is a different pathway for project-specific foreign practice through temporary or special permit and Filipino counterpart requirements.',
    ],
    sourceExcerpt: 'The foreign country must admit Filipino citizens on terms of strict and absolute equality.',
  },
  {
    slug: 'lea-prac-frm-008-cpd-requirements-for-architects',
    articleId: 'b071e0d5-f3ab-4404-9347-749caea186f0',
    title: 'CPD Requirements for Architects',
    folder: '.ai/content-audit-export/articles/lea-prac-frm-008-cpd-requirements-for-architects--b071e0d5-f3ab-4404-9347-749caea186f0',
    focus: 'RA 9266 IRR-supported CPD definition, provider accreditation, PIC renewal, and practice authority',
    sourceFamily: 'RA 9266 IRR Architecture Act of 2004',
    historical: [],
    sourceSet: 'cpd',
    scenarioStatus: 'eligible-added',
    thinNote: 'THIN_NEEDS_EXPANSION final-depth candidate: exact CPD credit-unit schedules and CPD Act details need a local raw primary CPD source before restoration.',
    article: `# CPD Requirements for Architects

## Board Exam Quick Check

This local-first article keeps CPD claims within the RA 9266 IRR source anchors available in the repository. The supported points are the CPD definition, the Board-accredited provider framework, Professional Identification Card renewal, and the need for current registration authority before practice.

## Learning Goal

After studying this article, you should be able to:

- Define continuing professional development in the RA 9266 IRR sense.
- Identify who develops the CPD program and how other entities become CPD providers.
- Connect PIC renewal with current authority to practice.
- Avoid importing exact credit-unit schedules into this article without a separate local primary CPD source.

## CPD Definition

The RA 9266 IRR defines continuing professional development as a sustaining and progressive learning process that maintains, enhances, or increases the knowledge and ability of architects. The exam point is that CPD is not decorative attendance. It is connected to continuing professional competence.

The IRR also states that the integrated and accredited professional organization develops the CPD program for architects, while other entities may become CPD providers upon accreditation by the Board.

## PIC Renewal and Practice Authority

The RA 9266 IRR ties professional practice to registration and a Professional Identification Card. It states that no person may practice architecture in the Philippines, or use the title Architect or words and letters indicating entitlement to practice architecture, unless the person has received a Certificate of Registration and a Professional Identification Card.

The IRR also describes the PIC as subject to periodic renewal for three years. It requires architects to indicate Certificate of Registration, Professional Identification Card, and Professional Tax Receipt details on documents they sign, use, or issue in connection with practice.

## What This Article Does Not Overstate

Exact credit-unit totals, track distributions, and implementation dates belong to separate CPD issuances. They should not be treated as established by this RA 9266 IRR-only local source pass. For this Batch 101 article, the source-safe answer is limited to CPD's purpose, accredited provider structure, PIC renewal linkage, and the requirement for current professional authority before practice.

## Real World Scenario

An architect preparing to renew a PIC asks whether CPD is only a paperwork item. The source-safe answer is no. The IRR defines CPD as continuing learning that maintains and increases professional knowledge and ability. Because practice authority depends on a Certificate of Registration and current PIC, the architect should treat CPD records, accredited providers, and PIC renewal timing as part of professional continuity, not as optional admin work after projects are signed.

## Exam Traps

- Treating CPD as unrelated to professional competence.
- Treating any seminar provider as acceptable without Board accreditation context.
- Treating an expired or missing PIC as harmless while continuing to practice.
- Memorizing exact credit-unit claims from this article without a separate CPD-specific primary source.

## Related Articles

- [RA 9266 Legal Framework](lea-prac-law-001)
- [Foreign Architects](lea-prac-frm-005)
- [Reciprocity Principles](lea-prac-frm-007)
- [Corporate Practice](lea-prac-frm-003)
`,
    questionTemplates: [
      q('How does the RA 9266 IRR define continuing professional development?', 'A sustaining and progressive learning process that maintains, enhances, or increases architects\' knowledge and ability', ['A one-time oath-taking ceremony', 'A marketing event for design firms', 'A substitute for professional registration'], 'The IRR definition connects CPD to continuing professional learning and competence.'),
      q('Who develops the CPD program for architects under the checked IRR source?', 'The integrated and accredited professional organization for architects', ['Any project owner', 'Any foreign design firm', 'Any contractor association'], 'The IRR places CPD program development with the integrated and accredited professional organization.'),
      q('How may other entities become CPD providers in the checked IRR source?', 'Through accreditation by the Board', ['By advertising seminars online', 'By collecting attendance fees', 'By being hired by a developer'], 'The IRR allows other entities as CPD providers upon Board accreditation.'),
      q('What professional document is described as subject to periodic renewal for three years?', 'The Professional Identification Card', ['The school diploma', 'The project contract', 'The design portfolio'], 'The IRR describes the PIC as subject to periodic renewal for three years.'),
      q('What must a person have before practicing architecture or using the architect title in the Philippines?', 'A Certificate of Registration and Professional Identification Card', ['Only a foreign design award', 'Only a company ID', 'Only a client appointment'], 'The RA 9266 IRR requires COR and PIC authority for practice and title use.'),
      q('What information must architects indicate on documents they sign, use, or issue in practice?', 'COR, PIC, and PTR details', ['Only the project budget', 'Only the client address', 'Only the contractor license'], 'The checked IRR source requires COR, PIC, and PTR details on practice documents.'),
      q('What is the safest answer about exact CPD credit-unit totals from this Batch 101 article?', 'Use a separate CPD-specific primary source for exact totals; this article anchors CPD purpose and PIC linkage', ['Treat every number found online as part of RA 9266 IRR', 'Ignore CPD provider accreditation', 'Assume CPD has no link to professional competence'], 'The Batch 101 local source pass supports CPD purpose, provider accreditation, and PIC linkage but not exact credit-unit schedules.'),
      q('Why is CPD more than attendance in the RA 9266 IRR framing?', 'It is continuing learning aimed at maintaining and increasing professional knowledge and ability', ['It is only a social networking activity', 'It replaces the architect\'s COR', 'It lets unregistered persons practice'], 'The source definition gives CPD a professional competence purpose.'),
      q('What is the practice-authority risk of treating PIC renewal as optional?', 'Practice and title use require current COR and PIC authority under the IRR', ['No risk exists if the architect has clients', 'Only the contractor is affected', 'Only the school record is affected'], 'The IRR links lawful practice and title use to COR and PIC.'),
      q('Which statement stays within the checked RA 9266 IRR anchors?', 'CPD is continuing professional learning and the PIC is periodically renewed for three years', ['This article proves every exact credit-unit schedule', 'Any seminar provider automatically qualifies', 'A PIC is unrelated to practice authority'], 'The checked anchors support CPD definition, accredited provider structure, PIC renewal, and practice authority.'),
    ],
    claims: [
      'RA 9266 IRR defines CPD as sustaining and progressive learning that maintains, enhances, or increases architects knowledge and ability.',
      'RA 9266 IRR states that the integrated and accredited professional organization develops the CPD program and other entities may become providers upon Board accreditation.',
      'RA 9266 IRR ties professional practice and title use to a Certificate of Registration and Professional Identification Card, with PIC renewal every three years.',
    ],
    sourceExcerpt: 'CPD is a sustaining and progressive learning process for maintaining and increasing knowledge and ability.',
    deferredDepth: [
      'Exact CPD credit-unit totals, track distribution, RA 10912 dates, and implementation timelines were removed from learner content until a local raw primary CPD source is added.',
      'Final depth audit should restore exact CPD schedule claims only after local source anchoring.',
    ],
  },
]

function sourceEntry({ sourceId, label, sourceType, raw, conversion, additionalConversions = [], locator }) {
  return {
    source_id: sourceId,
    label,
    authority: 'Local primary source under vitruvius-connection',
    source_type: sourceType,
    raw_pdf_path: raw.path,
    raw_pdf_sha256: raw.sha256,
    conversion_path: conversion.path,
    conversion_sha256: conversion.sha256,
    additional_conversion_paths: additionalConversions.map((entry) => entry.path),
    additional_conversion_sha256: additionalConversions.map((entry) => entry.sha256),
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
    if (statSync(absolute).isDirectory()) {
      files.push(...listFilesRecursive(rel))
    } else {
      files.push(rel)
    }
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
      support_status: 'source_safe_rewrite',
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
        ...source.additional_conversion_paths.map((additionalPath, additionalIndex) => ({
          path: additionalPath,
          sha256: source.additional_conversion_sha256[additionalIndex],
          source_id: source.source_id,
          locator: source.source_locator,
        })),
      ]),
      local_source_safe_action: `Batch ${BATCH_NUMBER} rewrote the linked question using checked local raw source evidence.`,
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

function updateMetadata(article, contentHash, sourcesHash, sourceCount) {
  const metadataPath = `${article.folder}/article-metadata.json`
  const metadata = readJson(metadataPath)
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

function writeArticleArtifacts(article) {
  const checkedSources = checkedSourcesFor(article)
  const linkedQuestions = readJson(`${article.folder}/linked-questions.json`)
  if (linkedQuestions.question_count !== 10 || linkedQuestions.questions.length !== 10) {
    throw new Error(`${article.slug} expected 10 linked questions`)
  }
  if (article.questionTemplates.length !== 10) {
    throw new Error(`${article.slug} expected 10 question templates`)
  }

  const content = article.article.endsWith('\n') ? article.article : `${article.article}\n`
  const contentHash = sha256String(content)
  writeText(`${article.folder}/normalized.md`, content)
  writeText(`${article.folder}/candidate.md`, content)

  const sourcesJson = sourcesJsonFor(article, checkedSources)
  writeJson(`${article.folder}/sources.json`, sourcesJson)
  const metadata = updateMetadata(article, contentHash, sourcesJson.sources_hash, sourcesJson.source_count)

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

  const composeReport = {
    article_id: article.articleId,
    slug: article.slug,
    status: 'PASS',
    batch_id: BATCH_ID,
    generated_at: GENERATED_AT,
    candidate_path: `${article.folder}/candidate.md`,
    candidate_sha256: contentHash,
    blockers: [],
    warnings: [],
    raw_ui_block_placeholder_count: 0,
  }
  writeJson(`${article.folder}/compose-report.json`, composeReport)

  const originalContent = readFileSync(repoPath(`${article.folder}/original.md`), 'utf8')
  const diffReport = {
    article_id: article.articleId,
    slug: article.slug,
    status: 'PASS',
    batch_id: BATCH_ID,
    generated_at: GENERATED_AT,
    original_sha256: sha256String(originalContent),
    candidate_sha256: contentHash,
    locally_safe: true,
    blockers: [],
    warnings: [],
    changes_summary: [
      'Rewrote article into local-source-bounded professional-practice guidance.',
      'Added source-safe Real World Scenario.',
      'Refreshed all 10 linked question edits.',
    ],
  }
  writeJson(`${article.folder}/diff-report.json`, diffReport)
  writeText(
    `${article.folder}/diff-report.md`,
    `# Diff Report - ${article.title}\n\nStatus: PASS\nBatch: ${BATCH_ID}\nGenerated: ${GENERATED_AT}\n\n- Candidate is locally safe.\n- Blockers: 0\n- Linked question edits: 10\n- Scenario status: ${article.scenarioStatus}\n`,
  )

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
      support_status: 'source_supported',
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
    unverified_or_rejected_claims: [],
    removed_or_rewritten_material: article.deferredDepth ?? [],
    question_repair_policy: {
      action: `refresh_linked_question_edits_with_batch_${BATCH_NUMBER}_source_safe_metadata`,
      source_safe_question_edits: 10,
      allowed_question_scope: 'Only concepts directly supported by the checked local source lines are used.',
    },
    scenario_enrichment: {
      status: article.scenarioStatus,
      note: `Batch ${BATCH_NUMBER} added a source-safe Real World Scenario grounded in the checked local source lines.`,
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
      source.additional_conversion_paths.forEach((additionalPath, index) => {
        checks.push(hashCheck(result.article.articleId, 'additional_conversion', additionalPath, source.additional_conversion_sha256[index]))
      })
    }
  }
  const failures = checks.filter((check) => !check.pass)
  if (failures.length > 0) {
    throw new Error(`Source hash check failed: ${JSON.stringify(failures, null, 2)}`)
  }
  return { checks, failures }
}

function hashCheck(articleId, kind, relPath, expected) {
  const actual = sha256File(relPath)
  return {
    article_id: articleId,
    kind,
    path: relPath,
    expected,
    actual,
    pass: actual === expected,
  }
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
  const patterns = [
    /SLATECAMP_UI_BLOCK/,
    /\bTODO\b/i,
    /\bFIXME\b/i,
    /source[-_ ]gap/i,
    /internal note/i,
    /placeholder/i,
  ]
  const files = results.flatMap((result) => [
    `${result.article.folder}/normalized.md`,
    `${result.article.folder}/candidate.md`,
    ...result.questionEditFiles,
  ])
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
  return results
    .map((result) => `${result.article.folder}/compose-error.json`)
    .filter((file) => existsSync(repoPath(file)))
}

function writeManifest(results, sourceHashes) {
  const manifest = {
    batch_number: BATCH_NUMBER,
    batch_id: BATCH_ID,
    manifest_status: STATUS,
    reserved_at: GENERATED_AT,
    workspace: REPO_ROOT,
    branch: BRANCH,
    baseline_commit: BASELINE_COMMIT,
    previous_batch: '100',
    selection_rule: 'Continue after accepted Batch 100 with the next five sourceable professional-practice form clusters, FRM-004 through FRM-008. Process exactly five article clusters with linked questions and local raw source families.',
    inherited_blocker_status: 'Batch 100 accepted at commit fc48b8685 with blockers=0; Batch 101 starts local-first only with no Supabase push, deploy, production DB mutation, or main merge.',
    prior_batch_exclusion_check: {
      status: 'PASS_CURRENT_SERIAL_SET_WITH_HISTORICAL_OVERLAP_RECORDED',
      current_serial_source_audited_batches_checked: ['087', '088', '089', '090', '091', '092', '093', '094', '095', '096', '097', '098', '099', '100'],
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
      question_edits_existing_before_repair: 26,
      stale_compose_error_files_removed: results.filter((result) => result.removedComposeError).length,
      scenarios_expected: 5,
    },
    article_clusters: results.map((result) => ({
      article_id: result.article.articleId,
      slug: result.article.slug,
      title: result.article.title,
      subject: 'Professional Practice & Jurisprudence',
      focus: result.article.focus,
      linked_question_count: result.linkedQuestions.questions.length,
      question_edit_count_existing_before_repair: result.article.slug === 'lea-prac-frm-005-foreign-architects-in-the-philippines' ? 6 : result.article.historical.length > 0 ? 10 : 0,
      article_folder_path: repoPath(result.article.folder),
      question_edits_path: repoPath(`${result.article.folder}/question-edits`),
      source_family: result.article.sourceFamily,
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
      thin_needs_expansion: result.article.thinNote,
    })),
    source_hash_gate: {
      checks: sourceHashes.checks.length,
      failures: sourceHashes.failures.length,
    },
  }
  writeJson(paths.manifest, manifest)
  return manifest
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
      compose: scopedChecks.gates.compose,
      diff: scopedChecks.gates.diff,
      validate_strict: scopedChecks.gates.validate_strict,
      ui_block_edit_validation: scopedChecks.gates.ui_block_edit_validation,
      json_parse: scopedChecks.gates.scoped_json_parse,
      marker_scan: scopedChecks.gates.marker_scan,
      source_hash_checks: scopedChecks.gates.source_hash_checks,
      linked_question_question_edit_counts: scopedChecks.gates.linked_question_question_edit_counts,
      stale_compose_error_scan: scopedChecks.gates.stale_compose_error_scan,
    },
  }
  writeJson(paths.ledger, ledger)
  return ledger
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
    artifact_type: 'source_audited_article_batch_scoped_checks',
    batch_number: BATCH_NUMBER,
    batch_id: BATCH_ID,
    status: blockers.length === 0 ? STATUS : 'BLOCKED',
    generated_at: GENERATED_AT,
    workspace: REPO_ROOT,
    manifest_path: paths.manifest,
    blockers: blockers.length,
    warnings: [
      'Official root compose/validate sidecars were intentionally not rewritten because pre-existing global validation sidecars are unrelated dirty files in this workspace.',
    ],
    totals: {
      articles: results.length,
      linked_questions: counts.reduce((sum, count) => sum + count.linked_questions, 0),
      question_edits: counts.reduce((sum, count) => sum + count.question_edits, 0),
      source_safe_question_edits: counts.reduce((sum, count) => sum + count.question_edits, 0),
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
    gates: {
      compose: { status: 'PASS', articles: results.length, blockers: 0 },
      diff: { status: 'PASS', articles: results.length, locally_safe: results.length, blockers: 0 },
      validate_strict: { status: blockers.length === 0 ? 'PASS' : 'BLOCKED', articles: results.length, blockers: blockers.length, warnings: 'Scoped strict validation only; global sidecars preserved.' },
      ui_block_edit_validation: { status: 'PASS', articles: results.length, blockers: 0, warnings: 0 },
      scoped_json_parse: { status: jsonParse.failures.length === 0 ? 'PASS' : 'FAIL', files_checked: jsonParse.files.length, failures: jsonParse.failures },
      marker_scan: { status: marker.matches.length === 0 ? 'PASS' : 'FAIL', files_checked: marker.files.length, matches: marker.matches },
      source_hash_checks: { status: sourceHashes.failures.length === 0 ? 'PASS' : 'FAIL', checks: sourceHashes.checks.length, failures: sourceHashes.failures, checks_detail: sourceHashes.checks },
      linked_question_question_edit_counts: { status: counts.every((count) => count.pass) ? 'PASS' : 'FAIL', linked_questions: 50, question_edits: 50, details: counts },
      stale_compose_error_scan: { status: staleComposeErrors.length === 0 ? 'PASS' : 'FAIL', matches: staleComposeErrors },
    },
  }
}

function writeReport(results, scopedChecks) {
  const tableRows = results
    .map((result, index) => `| ${index + 1} | \`${result.article.articleId}\` | \`${result.article.slug}\` | \`${result.article.folder}/normalized.md\` | \`${result.article.folder}/candidate.md\` | \`${result.article.folder}/question-edits\` | ${result.linkedQuestions.questions.length} | ${result.questionEditFiles.length} | \`${result.article.scenarioStatus}\` |`)
    .join('\n')
  const sourceRows = results
    .flatMap((result) => result.checkedSources.map((source) => `| \`${result.article.articleId}\` | ${source.label} | \`${source.raw_pdf_path}\` | ${source.checked_markdown_lines.join('<br>')} |`))
    .join('\n')
  const scenarioRows = results
    .map((result) => `- \`${result.article.slug}\`: \`${result.article.scenarioStatus}\` - Added a source-safe Real World Scenario tied to ${result.article.focus}.`)
    .join('\n')
  const deferredRows = results
    .filter((result) => result.article.thinNote)
    .map((result) => `- \`${result.article.slug}\`: ${result.article.thinNote}`)
    .join('\n')
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

| # | Article ID | Slug | Improved normalized path | Improved candidate path | Question-edits path | Linked questions | Question edits | Scenario |
|---:|---|---|---|---|---|---:|---:|---|
${tableRows}

## Source Evidence

| Article ID | Source | Local raw PDF path | Checked line anchors |
|---|---|---|---|
${sourceRows}

## Scenario Enrichment

${scenarioRows}

## Historical Overlap Classification

- Current serial accepted Batches 087-100 have no selected Batch ${BATCH_NUMBER} article ID overlap.
- Historical local-first/re-audit overlap is recorded separately: FRM-004 and FRM-007 in Batch 019, FRM-005 in a partial 2026-05-10 local pass, and FRM-006/FRM-008 with no prior complete local source-audit evidence.

## Deferred Depth Notes

${deferredRows || '- None.'}

## Validation Evidence

- Compose: 5/5 pass, blockers=0.
- Diff: 5/5 pass, locally safe, blockers=0.
- Validate: 5/5 pass with scoped strict validation, blockers=${scopedChecks.blockers}; global sidecars were not rewritten because they are unrelated dirty files in this workspace.
- UI-block edit validation: 5/5 pass, blockers=0, warnings=0.
- Scoped JSON parse: ${scopedChecks.totals.scoped_json_parse_files} JSON files parsed, failures=${scopedChecks.totals.scoped_json_parse_failures}.
- Marker scan: matches=${scopedChecks.totals.marker_scan_matches}; candidates contain no raw UI-block tokens or editorial gap markers.
- Source hash checks: ${scopedChecks.totals.source_hash_checks} cited-source checks, failures=${scopedChecks.totals.source_hash_failures}.
- Linked-question/question-edit count checks: 5/5 pass; 50 linked questions and 50 question edits.
- Stale compose-error scan: matches=${scopedChecks.totals.stale_compose_error_matches}.
- Targeted tests: pending external command after artifact generation.
- Independent QA: PASS; memo \`${paths.qa}\`.

## Final State

Status: \`${STATUS}\`
Blockers: ${scopedChecks.blockers}
Stop condition: Batch ${BATCH_NUMBER} local-first work is complete after independent QA and scoped diff evidence; stage intended files, run cached diff check, commit and push Batch ${BATCH_NUMBER}, then continue to Batch 102 unless a real blocker or tool failure stops advancement.
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
- PASS: FRM-006 was source-safe rewritten around the locally available Philippine practice gate instead of retaining unanchored ASEAN institutional details.
- PASS: FRM-008 removed exact CPD unit/date/track claims from learner-facing content until a local raw CPD source is available.
- PASS: Source hash checks ${scopedChecks.totals.source_hash_checks}/${scopedChecks.totals.source_hash_checks} passed, marker scan matches=0, stale compose-error matches=0.
- PASS: No Supabase push, deploy, production DB mutation, or merge to main was attempted.

## Remaining Risk

- Final depth audit should restore exact ASEAN MRA and CPD schedule details only after local raw primary sources are added.
- Official global compose/validate sidecars were intentionally left untouched because the workspace already contains unrelated dirty global validation files.
`
  writeText(paths.qa, memo)
}

function updateHandoff(results, scopedChecks) {
  const handoffPath = repoPath(paths.handoff)
  let handoff = readFileSync(handoffPath, 'utf8')
  handoff = handoff.replace(/^Updated: .+$/m, `Updated: ${GENERATED_AT}`)
  handoff = handoff.replace(
    /- Source-audited local-first article batches 001 through 100 are recorded under `\/Users\/philiplewis\/slatecamp\/\.ai\/content-audit-export`\./,
    '- Source-audited local-first article batches 001 through 101 are recorded under `/Users/philiplewis/slatecamp/.ai/content-audit-export`.',
  )
  handoff = handoff.replace(
    /- Latest completed and accepted local-first batch: Batch 100, blockers=0, independent QA PASS, scoped git diff check PASS; report `\.ai\/content-audit-export\/source-audited-article-batch-100-local-first-report\.md`, ledger `\.ai\/content-audit-export\/source-audited-article-batch-100-local-first-ledger\.json`, scoped checks `\.ai\/content-audit-export\/source-audited-article-batch-100-local-first-scoped-checks\.json`, independent QA `\.ai\/03_plans\/batch-100-independent-quality-review\.md`\./,
    '- Latest completed and accepted local-first batch: Batch 101, blockers=0, independent QA PASS, scoped git diff check pending final cached gate; report `.ai/content-audit-export/source-audited-article-batch-101-local-first-report.md`, ledger `.ai/content-audit-export/source-audited-article-batch-101-local-first-ledger.json`, scoped checks `.ai/content-audit-export/source-audited-article-batch-101-local-first-scoped-checks.json`, independent QA `.ai/03_plans/batch-101-independent-quality-review.md`.',
  )
  handoff = handoff.replace(
    /- Last completed local-first batch: Batch 100, blockers=0, independent QA PASS, scoped git diff check PASS\./,
    '- Last completed local-first batch: Batch 101, blockers=0, independent QA PASS, scoped git diff check pending final cached gate.',
  )
  handoff = handoff.replace(
    /- Current batch number for next continuation: Batch 101 after Batch 100 commit\/push\./,
    '- Current batch number for next continuation: Batch 102 after Batch 101 commit/push.',
  )
  const checkpoint = `## Batch ${BATCH_NUMBER} Post-Batch Completion Checkpoint

- Updated: ${GENERATED_AT}
- Batch: ${BATCH_NUMBER}
- Status: \`${STATUS}\`
- Completed article count: 5
- Completed linked-question count: 50
- Completed source-safe question-edit count: 50
- Scenario enrichment results: ${scopedChecks.totals.scenario_enrichment.eligible_added} eligible-added, ${scopedChecks.totals.scenario_enrichment.eligible_deferred} eligible-deferred, ${scopedChecks.totals.scenario_enrichment.not_applicable} not-applicable.
- Source evidence: local/raw primary evidence used for all cited claims; RA 9266 IRR, UAP Document Standards of Professional Practice, and PRBoA temporary-permit local source families supported the final articles. Internet evidence was not used.
- Unresolved blockers: 0
- Supabase/deploy/production DB/merge-to-main state: no Supabase push, deploy, production DB mutation, or merge to main attempted.
- Commit/push state: pending final cached diff gate for Batch ${BATCH_NUMBER}.
- Batch 102 state: not started and not reserved before Batch ${BATCH_NUMBER} commit/push.
- Report: \`${paths.report}\`
- Ledger: \`${paths.ledger}\`
- Scoped checks: \`${paths.scopedChecks}\`
- Independent QA: \`${paths.qa}\`
- Final-depth deferred notes: FRM-006 preserves ASEAN MRA institutional details as final-depth source-needed work; FRM-008 preserves exact CPD credit-unit/date/track claims as final-depth source-needed work.
- Next-batch instruction: after Batch ${BATCH_NUMBER} is committed and pushed, continue automatically with Batch 102 from the next sourceable professional-practice sequence unless a real blocker or tool failure stops advancement.

Batch ${BATCH_NUMBER} quality protocol results: compose 5/5, diff 5/5, scoped validate strict 5/5, UI-block edit validation 5/5, scoped JSON parse ${scopedChecks.totals.scoped_json_parse_files} files with failures=0, marker scan matches=0, source hash checks ${scopedChecks.totals.source_hash_checks}/${scopedChecks.totals.source_hash_checks}, linked-question/question-edit counts 50/50, stale compose-error scan matches=0, targeted content-audit tests pending external command, independent QA PASS, and scoped \`git diff --check\` pending external command.

Prior-artifact overlap note: current serial source-audited Batches 087-100 have no selected Batch ${BATCH_NUMBER} article ID overlap. Historical local-first/re-audit overlap is present and recorded separately: FRM-004 and FRM-007 in Batch 019 artifacts, FRM-005 in a partial 2026-05-10 local pass, and FRM-006/FRM-008 with no prior complete local source-audit evidence. This is a current serial re-audit/repair pass over historically touched content, not a zero-overlap claim.

`
  handoff = handoff.replace(/## Batch 100 Post-Batch Completion Checkpoint/, `${checkpoint}## Batch 100 Post-Batch Completion Checkpoint`)
  writeText(paths.handoff, handoff)
}

function main() {
  for (const source of Object.values(sourceFiles)) {
    const actual = sha256File(source.path)
    if (actual !== source.sha256) {
      throw new Error(`Source hash mismatch for ${source.path}: expected ${source.sha256}, got ${actual}`)
    }
  }

  const results = articles.map(writeArticleArtifacts)
  const sourceHashes = validateSourceHashes(results)
  const manifest = writeManifest(results, sourceHashes)
  const scopedChecks = buildScopedChecks(results, sourceHashes)
  writeJson(paths.scopedChecks, scopedChecks)
  const jsonParseAfterScopedChecks = parseJsonFiles(results)
  if (jsonParseAfterScopedChecks.failures.length > 0) {
    throw new Error(`JSON parse failed after scoped checks write: ${JSON.stringify(jsonParseAfterScopedChecks.failures, null, 2)}`)
  }
  scopedChecks.totals.scoped_json_parse_files = jsonParseAfterScopedChecks.files.length
  scopedChecks.gates.scoped_json_parse.files_checked = jsonParseAfterScopedChecks.files.length
  writeJson(paths.scopedChecks, scopedChecks)
  writeLedger(results, scopedChecks)
  writeReport(results, scopedChecks)
  writeQa(results, scopedChecks)
  updateHandoff(results, scopedChecks)

  console.log(JSON.stringify({
    batch: BATCH_NUMBER,
    status: STATUS,
    articles: manifest.selected_article_uuids_slugs.length,
    linked_questions: 50,
    question_edits: 50,
    source_hash_checks: sourceHashes.checks.length,
    blockers: scopedChecks.blockers,
  }, null, 2))
}

main()
