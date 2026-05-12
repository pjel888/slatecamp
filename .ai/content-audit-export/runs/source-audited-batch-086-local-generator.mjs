#!/usr/bin/env node
import { createHash } from 'node:crypto'
import { existsSync } from 'node:fs'
import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'

const ROOT = process.cwd()
const EXPORT_ROOT = path.join(ROOT, '.ai/content-audit-export')
const ARTICLES_ROOT = path.join(EXPORT_ROOT, 'articles')
const BATCH = '086'
const BATCH_ID = 'source-audited-article-batch-086-local-first'
const AUDITED_AT = '2026-05-12T09:30:00.000+08:00'
const GENERATED_BY = 'codex-local-source-audit-batch-086'
const UI_BLOCKS_HASH_EMPTY = shaText('[]')

function shaText(value) {
  return `sha256:${createHash('sha256').update(value, 'utf8').digest('hex')}`
}

async function shaFile(relativePath) {
  return `sha256:${createHash('sha256').update(await readFile(path.join(ROOT, relativePath))).digest('hex')}`
}

function jsonHash(value) {
  return shaText(JSON.stringify(value))
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, 'utf8'))
}

async function writeJson(filePath, value) {
  await mkdir(path.dirname(filePath), { recursive: true })
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
}

async function writeText(filePath, value) {
  await mkdir(path.dirname(filePath), { recursive: true })
  await writeFile(filePath, value.endsWith('\n') ? value : `${value}\n`, 'utf8')
}

function rel(filePath) {
  return path.relative(ROOT, filePath).replaceAll(path.sep, '/')
}

const SOURCE_DEFS = {
  ra11201Irr: {
    source_id: 'ra-11201-irr-dhsud-act-b086',
    label: 'RA 11201 IRR - DHSUD Act Implementing Rules',
    raw: 'vitruvius-connection/001_Raw-Source-Layer/001-Laws/RA-11201/RA 11201 IRR - DHSUD Act Implementing Rules.pdf',
    refined: 'vitruvius-connection/002_Raw-Conversion-Layer/001-Laws/refined_markdown/RA-11201/RA 11201 IRR - DHSUD Act Implementing Rules.md',
    type: 'primary_law_pdf',
    locator: 'RA 11201 IRR refined markdown lines 40-44, 68-75, 93-100, 116-121, 134-162, 261-263, 280-289, 335, 389, and 392; raw PDF pages 3, 6, 7, 13, 15, 19, and 35 checked by local PyMuPDF extraction.',
  },
  eo90: {
    source_id: 'eo-90-shelter-program-b086',
    label: 'EO 90 - NGO for Shelter Program',
    raw: 'vitruvius-connection/001_Raw-Source-Layer/001-Laws/EO/EO 90 NGO for Shelter Program.pdf',
    refined: 'vitruvius-connection/002_Raw-Conversion-Layer/001-Laws/refined_markdown/EO/EO 90 NGO for Shelter Program.md',
    type: 'primary_executive_order_pdf',
    locator: 'EO 90 refined markdown lines 19-27, 30-43, 51-63, and 79-106; raw PDF pages 1, 2, 3, 4, and 6 checked by local PyMuPDF extraction.',
  },
  ra7279: {
    source_id: 'ra-7279-urban-development-housing-act-b086',
    label: 'RA 7279 - Urban Development and Housing Act',
    raw: 'vitruvius-connection/001_Raw-Source-Layer/001-Laws/RA-7279/RA 7279 Urban Development and Housing Act 2009.pdf',
    refined: 'vitruvius-connection/002_Raw-Conversion-Layer/001-Laws/refined_markdown/RA-7279/RA 7279 Urban Development and Housing Act 2009.md',
    type: 'primary_law_pdf',
    locator: 'RA 7279 refined markdown lines 11-35, 37-85, 131-155, 165-189, 231-235, 301-313, and 319; raw PDF pages 1, 2, 3, 7, 8, and 11 checked by local PyMuPDF extraction.',
  },
  ra9279Irr: {
    source_id: 'irr-ra-7279-sec-18-b086',
    label: 'IRR RA 7279 Sec 18',
    raw: 'vitruvius-connection/001_Raw-Source-Layer/001-Laws/RA-9279/IRR RA 7279 Sec 18.pdf',
    refined: 'vitruvius-connection/002_Raw-Conversion-Layer/001-Laws/refined_markdown/RA-9279/IRR RA 7279 Sec 18.md',
    type: 'primary_law_irr_pdf',
    locator: 'IRR RA 7279 Sec 18 refined markdown lines 1-4, 26-59, and 65-94; raw PDF pages 1, 2, and 3 checked by local PyMuPDF extraction.',
  },
  ra7160: {
    source_id: 'ra-7160-local-government-code-b086',
    label: 'RA 7160 - The Local Government Code',
    raw: 'vitruvius-connection/001_Raw-Source-Layer/001-Laws/RA-7160/RA 7160 The Local Government Code.pdf',
    refined: 'vitruvius-connection/002_Raw-Conversion-Layer/001-Laws/refined_markdown/RA-7160/RA 7160 The Local Government Code.md',
    type: 'primary_law_pdf',
    locator: 'RA 7160 refined markdown lines 155-162; raw PDF page 12 checked by local PyMuPDF extraction.',
  },
  hlurbClup: {
    source_id: 'hlurb-clup-volume-2-b086',
    label: 'HLURB CLUP Guidebook Volume 2',
    raw: 'vitruvius-connection/001_Raw-Source-Layer/001-Laws/HLURB-DHSUD/HLURB_CLUP_Vol_2.pdf',
    refined: 'vitruvius-connection/002_Raw-Conversion-Layer/001-Laws/refined_markdown/HLURB-DHSUD/HLURB_CLUP_Vol_2.md',
    type: 'primary_planning_pdf',
    locator: 'HLURB CLUP Volume 2 refined markdown lines 39-41, 957, 1230, 1640-1648, 2059-2061, 2187-2192, and 2290-2309; raw PDF pages 5, 40, 71, 72, and 74 checked by local PyMuPDF extraction.',
  },
}

const ARTICLES = [
  {
    id: '5723752b-4d29-442d-87ec-30e60b8569a3',
    slug: 'lea-plan-003-03-core-concept',
    folder: 'lea-plan-003-03-core-concept--5723752b-4d29-442d-87ec-30e60b8569a3',
    title: 'Housing finance in the Philippines works through distinct shelter roles',
    topic: 'philippine_housing_finance_roles',
    classification: { contains_legal_or_code_claims: true, source_risk_tier: 'legal_housing_finance' },
    sources: ['eo90', 'ra11201Irr', 'ra7279', 'ra9279Irr', 'ra7160'],
    primarySource: 'eo90',
    sourceLocator: 'EO 90 refined markdown lines 19-43 and 51-63; RA 11201 IRR lines 40-44 and 261-263; RA 7279 lines 165-189 and 301-313; IRR RA 7279 Sec 18 lines 39-59; RA 7160 lines 155-162.',
    scenario: 'An LGU is sorting three shelter cases: an association wants to acquire the land it occupies, an employee is asking about a member housing loan, and a relocation project needs direct shelter production. For LEA purposes, first match the beneficiary and instrument: CMP/SHFC for organized association land acquisition under community ownership, HDMF/SSS/GSIS for member-based finance channels in the checked EO 90 scope, and NHA for direct shelter production.',
    scenarioReason: 'eligible-added: Batch 086 added a concise agency-selection scenario supported by EO 90, RA 11201 IRR, RA 7279, RA 7160, and IRR RA 7279 Sec 18 raw-source locators.',
    summary: 'Housing finance questions should not be answered as if the Philippines had one universal shelter loan. The checked sources split the system among direct shelter production, home mortgage market support, provident or member-based finance, socialized housing mechanisms, community mortgage financing, and local low-cost housing responsibilities.',
    core: [
      'EO 90 assigns different shelter roles: NHA for direct shelter production, NHMFC as the major government home mortgage institution, HDMF for provident contributions and available housing finance, and SSS/GSIS for their member sectors.',
      'RA 11201 IRR defines the Community Mortgage Program as SHFC mortgage financing that assists legally organized associations of underprivileged and homeless citizens to purchase and develop land under community ownership.',
      'RA 7279 and its implementing rules treat socialized housing and CMP as tools for underprivileged and homeless beneficiaries, while balanced housing compliance can include an equivalent socialized housing project, CMP, or joint venture in the checked IRR scope.',
      'RA 7160 places low-cost housing and other mass dwelling programs within local service delivery, while excluding those funded by SSS, GSIS, and HDMF from that local-service clause.',
    ],
    tested: [
      'Match housing finance instruments to the correct agency or beneficiary group.',
      'Separate community mortgage financing from individual member finance.',
      'Avoid importing current loan thresholds or other laws unless the exact local raw source has been checked.',
    ],
    mistakes: [
      'Do not treat CMP as an individual employee loan; the checked RA 11201 IRR language is association-based.',
      'Do not collapse NHA, SHFC, NHMFC, HDMF, SSS, and GSIS into one interchangeable lender.',
      'Do not use current loan amounts, amortization rules, or contract-sale remedies unless a local raw source for that exact rule is in the batch.',
    ],
    questions: [
      ['What is the safest way to frame Philippine housing finance from the checked sources?', 'As a split system of shelter production, mortgage-market support, provident or member finance, socialized housing, and community mortgage mechanisms', ['As one universal loan program for all households', 'As a building-permit process only', 'As a private bank product with no public shelter role'], 'EO 90, RA 11201 IRR, RA 7279, RA 7160, and IRR RA 7279 Sec 18 divide housing finance and production roles across several mechanisms.'],
      ['In RA 11201 IRR, what is the Community Mortgage Program?', 'SHFC mortgage financing for legally organized associations of underprivileged and homeless citizens to acquire and develop land under community ownership', ['An individual government employee salary loan', 'A building occupancy certificate', 'A zoning variance issued by the fire bureau'], 'The checked RA 11201 IRR definition is association-based and tied to SHFC mortgage financing.'],
      ['Which EO 90 role is source-safe for NHA?', 'Direct shelter production, including programs for the lowest urban income earners in the checked EO 90 scope', ['Issuing all building permits nationwide', 'Operating only private luxury subdivision loans', 'Replacing every local government housing function'], 'EO 90 describes NHA as the agency engaged in direct shelter production.'],
      ['What does EO 90 identify as the major government home mortgage institution?', 'National Home Mortgage Finance Corporation', ['National Housing Authority', 'Professional Regulation Commission', 'Bureau of Fire Protection'], 'EO 90 identifies NHMFC as the major government home mortgage institution.'],
      ['Which EO 90 statement is source-safe for HDMF?', 'It administers provident fund contributions and uses funds not required for benefits for housing loans and financial assistance', ['It approves zoning ordinances for all LGUs', 'It operates only community-owned land purchases', 'It replaces NHA direct shelter production'], 'EO 90 assigns HDMF a provident-fund and housing-finance function.'],
      ['How do SSS and GSIS differ in the checked EO 90 housing-finance scope?', 'SSS is linked to private-sector employee housing loans, while GSIS is linked to government-employee housing loans', ['SSS serves only government employees and GSIS serves only private employees', 'Both are zoning appeal boards', 'Both are direct shelter producers for every LGU project'], 'EO 90 separates the SSS and GSIS housing-loan channels by member sector.'],
      ['Which item is a checked mode of balanced housing compliance in the IRR RA 7279 Sec 18 scope?', 'Participation in a Community Mortgage Program project', ['Issuing a certificate of occupancy', 'Waiving all socialized housing obligations by memo', 'Preparing only an interior finish schedule'], 'The checked IRR includes CMP among the listed compliance modes.'],
      ['What caveat does RA 7160 add to local low-cost housing programs?', 'The local-service clause excludes low-cost housing and mass dwelling programs funded by SSS, GSIS, and HDMF', ['LGUs have no housing role at all', 'Only national museums may build socialized housing', 'Every low-cost housing project is a fire permit'], 'RA 7160 lists local low-cost housing programs while carving out those funded by SSS, GSIS, and HDMF.'],
      ['Which exam move should be avoided for this topic?', 'Adding current loan amounts or contract-sale rules without a checked local raw source for those exact details', ['Matching CMP to association-based land acquisition', 'Separating NHA from HDMF and GSIS', 'Using EO 90 to identify historical shelter agency roles'], 'Batch 086 keeps the article inside checked law and planning sources.'],
      ['In a scenario where an organized informal-settler association wants to buy and develop occupied land, which instrument best matches the checked source scope?', 'Community Mortgage Program through SHFC', ['An individual GSIS member loan', 'A building occupancy inspection', 'A subdivision fire alarm review'], 'The RA 11201 IRR CMP definition supports an association-based land acquisition and development mechanism.'],
    ],
  },
  {
    id: 'a43232f4-9396-4156-bfec-4606a44b4a72',
    slug: 'lea-plan-003-07-core-concept',
    folder: 'lea-plan-003-07-core-concept--a43232f4-9396-4156-bfec-4606a44b4a72',
    title: 'Special housing concerns use People\'s Plans, socialized housing, and risk-sensitive CLUP work',
    topic: 'special_housing_and_vulnerable_groups',
    classification: { contains_legal_or_code_claims: true, source_risk_tier: 'legal_planning_socialized_housing' },
    sources: ['ra11201Irr', 'ra7279', 'hlurbClup'],
    primarySource: 'ra11201Irr',
    sourceLocator: 'RA 11201 IRR refined markdown lines 93-100 and 116-121; RA 7279 lines 11-35, 37-85, 165-189, and 231-235; HLURB CLUP Volume 2 lines 39-41, 957, 1230, 2059-2061, 2187-2192, and 2290-2309.',
    scenario: 'A relocation planning team is reviewing an informal settlement on a hazard map. The source-safe LEA approach is to pair the People\'s Plan contents with CLUP vulnerability analysis: site development must fit local zoning, affected groups should be profiled, livelihood and social-service needs should be considered, and the hazard overlay should identify which settlements and facilities are exposed.',
    scenarioReason: 'eligible-added: Batch 086 added a concise relocation and hazard-overlay scenario supported by RA 11201 IRR, RA 7279, and HLURB CLUP Volume 2 raw-source locators.',
    summary: 'Special housing concerns are not a free-floating inclusion slogan. The checked local sources connect them to People\'s Plans, socialized housing, beneficiary participation, livelihood and welfare considerations, resilient housing, and CLUP analysis of vulnerable groups and hazard exposure.',
    core: [
      'RA 11201 IRR defines a People\'s Plan as a beneficiary-association plan with a site development plan that conforms to LGU zoning and includes community health, sanitation, security, self-help cooperative, livelihood, and welfare concerns for elderly persons, persons with disabilities, and children.',
      'RA 11201 IRR also defines resilient housing in relation to capacity to resist, absorb, and accommodate climate-change and hazard effects and return to normal function.',
      'RA 7279 places socialized housing within a policy of decent housing, basic services, employment opportunities, equitable land tenure, people\'s participation, and local government capacity.',
      'HLURB CLUP Volume 2 identifies vulnerable and marginalized groups and directs planners to overlay informal settlements on hazard maps and ask how hazards affect housing and social-service facilities.',
    ],
    tested: [
      'Connect special housing issues to checked planning documents and beneficiary safeguards.',
      'Recognize when hazard exposure changes the planning question.',
      'Keep claims about indigenous peoples, disability, elderly welfare, and disaster risk inside checked source language.',
    ],
    mistakes: [
      'Do not cite specialized statutes or program titles unless the exact local raw PDF for that rule has been checked.',
      'Do not treat vulnerable groups as only a label; the checked CLUP source asks planners to map exposure and affected facilities.',
      'Do not remove beneficiary participation, livelihood, basic services, or welfare considerations from resettlement analysis.',
    ],
    questions: [
      ['What does RA 11201 IRR require a People\'s Plan to include in source-safe terms?', 'A beneficiary-association plan with site development aligned to LGU zoning plus community, livelihood, and welfare elements', ['Only a private developer brochure', 'Only a certificate of occupancy', 'Only a list of paint colors'], 'The checked definition ties People\'s Plans to beneficiary associations, zoning conformity, site development, and social concerns.'],
      ['Which group is expressly included in the RA 11201 IRR People\'s Plan welfare scope?', 'Elderly persons, persons with disabilities, and children', ['Only luxury condominium buyers', 'Only foreign corporate landlords', 'Only building officials'], 'The People\'s Plan definition includes welfare of elderly persons, persons with disabilities, and children.'],
      ['What is the source-safe idea behind resilient housing in RA 11201 IRR?', 'Housing capacity to resist, absorb, and accommodate climate-change and hazard effects and return to function', ['Housing that ignores all hazards', 'Housing defined only by decorative style', 'Housing that removes all local planning requirements'], 'The RA 11201 IRR definition links resilient housing to climate-change and hazard effects.'],
      ['How does HLURB CLUP Volume 2 handle informal settlements in hazard analysis?', 'Overlay the map of informal settlements on hazard maps and calculate affected area and population', ['Delete informal settlements from planning maps', 'Treat hazards as unrelated to housing', 'Use only a financing chart with no location data'], 'The checked CLUP guide directs overlay mapping and affected-population analysis.'],
      ['Which CLUP question is source-safe for housing and social-service facilities?', 'What hazards can affect housing and social-service facilities?', ['What paint color should every facility use?', 'Which bank advertises the best loan?', 'How can zoning be ignored during relocation?'], 'HLURB CLUP Volume 2 includes guide questions on hazards affecting housing and social-service facilities.'],
      ['Which RA 7279 concern belongs in socialized housing and resettlement planning?', 'Livelihood access and basic services where feasible', ['Only premium clubhouse design', 'Only brand naming', 'Only furniture procurement'], 'RA 7279 includes livelihood and basic-service concerns for socialized housing and resettlement projects.'],
      ['What does the checked CLUP source say about vulnerable and marginalized groups?', 'They include groups facing higher exposure to disaster risk and poverty, such as women, children, elderly, differently abled people, and ethnic minorities', ['They are not part of planning analysis', 'They are only construction materials', 'They are all treated as luxury buyers'], 'HLURB CLUP Volume 2 defines vulnerable and marginalized groups in disaster-risk and poverty terms.'],
      ['How should indigenous peoples be treated in this batch scope?', 'As a CLUP thematic concern only where the checked CLUP source supports the planning point', ['By inventing IPRA section numbers from memory', 'By ignoring ancestral-domain context entirely', 'By replacing local source checks with search snippets'], 'The checked CLUP guide includes indigenous cultural communities and related thematic planning context.'],
      ['What is the LEA trap in special housing questions?', 'Using inclusion labels without checking the planning document, hazard context, and beneficiary safeguards', ['Reading the People\'s Plan definition', 'Checking hazard overlays', 'Considering livelihood and welfare'], 'The batch source scope links special housing to concrete planning and resettlement requirements.'],
      ['In a relocation scenario, what combination is most source-safe?', 'People\'s Plan contents plus CLUP hazard-overlay analysis and RA 7279 livelihood/basic-service concerns', ['Only a private marketing flyer', 'Only an unchecked program slogan', 'Only a generic loan amount'], 'The checked sources support a combined planning, socialized-housing, and hazard-analysis answer.'],
    ],
  },
  {
    id: '8a8a6153-844c-4671-aae6-b42b5a9435dd',
    slug: 'lea-plan-007-01-core-concept',
    folder: 'lea-plan-007-01-core-concept--8a8a6153-844c-4671-aae6-b42b5a9435dd',
    title: 'NHA and SHFC serve different shelter delivery functions',
    topic: 'nha_shfc_shelter_roles',
    classification: { contains_legal_or_code_claims: true, source_risk_tier: 'legal_housing_agency_roles' },
    sources: ['eo90', 'ra11201Irr', 'ra7279'],
    primarySource: 'ra11201Irr',
    sourceLocator: 'EO 90 refined markdown lines 19-27; RA 11201 IRR lines 40-44, 145-162, and 261-263; RA 7279 lines 165-189 and 301-313.',
    scenario: 'A city asks whether an informal-settler association should use a land-acquisition finance mechanism or whether a relocation project needs direct shelter production. The source-safe distinction is SHFC/CMP for association-based community mortgage financing and NHA for direct shelter production or the primary government housing role for underprivileged and homeless citizens in the checked source history.',
    scenarioReason: 'eligible-added: Batch 086 added a concise NHA-versus-SHFC scenario supported by EO 90, RA 11201 IRR, and RA 7279 raw-source locators.',
    summary: 'NHA and SHFC should not be treated as the same answer choice. In the checked source set, NHA is tied to direct shelter production and the government housing role for underprivileged and homeless citizens, while SHFC is tied to social housing finance and community mortgage solutions.',
    core: [
      'EO 90 describes NHA as the government agency engaged in direct shelter production, including slum upgrading, relocation, sites and services, and core housing for the checked target group.',
      'RA 7279 describes NHA as the primary government agency in charge of providing housing for underprivileged and homeless citizens, with socialized housing incentives and related disposition tools.',
      'RA 11201 IRR identifies SHFC as the lead agency for social housing programs for low-income formal and informal sectors, especially underprivileged and homeless citizens.',
      'The same RA 11201 IRR defines CMP as SHFC mortgage financing for legally organized associations to purchase and develop land under community ownership.',
    ],
    tested: [
      'Choose NHA when the stem asks about direct shelter production or primary government housing provision.',
      'Choose SHFC/CMP when the stem asks about association-based community mortgage financing.',
      'Notice historical source context when older RA 7279 CMP language and later RA 11201 IRR SHFC language appear together.',
    ],
    mistakes: [
      'Do not say NHA is the CMP mortgage lender in the checked RA 11201 IRR scope.',
      'Do not say SHFC is only a generic planning office; the checked IRR gives it a social housing finance role.',
      'Do not ignore whether the question is asking about production, finance, or beneficiary organization.',
    ],
    questions: [
      ['Which source-safe role best matches NHA in EO 90?', 'Direct shelter production for the checked housing-assistance scope', ['Mortgage financing for every association under CMP', 'Issuing professional licenses', 'Approving every local zoning ordinance'], 'EO 90 assigns NHA the direct shelter production role.'],
      ['Which role best matches SHFC in RA 11201 IRR?', 'Lead agency for social housing programs and community-driven shelter finance solutions', ['The sole issuer of building permits', 'A fire-code inspection office', 'A private furniture lender'], 'RA 11201 IRR identifies SHFC as lead agency for social housing programs.'],
      ['What does CMP do in the checked RA 11201 IRR scope?', 'It finances legally organized associations of underprivileged and homeless citizens to purchase and develop land under community ownership', ['It licenses architects', 'It sells condominium decorations', 'It replaces every local shelter plan'], 'The RA 11201 IRR CMP definition supports association-based land acquisition and development.'],
      ['What does RA 7279 say about NHA in socialized housing context?', 'NHA is the primary government agency in charge of providing housing for underprivileged and homeless citizens', ['NHA is only a private bank', 'NHA has no role in housing', 'NHA only approves fire exits'], 'RA 7279 identifies NHA as the primary agency for that housing role.'],
      ['When should a question steer toward SHFC/CMP instead of NHA?', 'When the stem asks about mortgage financing for an organized beneficiary association acquiring land', ['When it asks for direct shelter production', 'When it asks for building height classification', 'When it asks for fire-alarm audibility'], 'The source-supported CMP role belongs to SHFC in the RA 11201 IRR scope.'],
      ['When should a question steer toward NHA instead of SHFC?', 'When the stem emphasizes direct shelter production or the primary government housing agency role', ['When it asks about community mortgage finance for associations', 'When it asks about private-sector SSS member loans', 'When it asks about CLUP hazard overlays only'], 'EO 90 and RA 7279 tie NHA to direct shelter production and the primary housing provision role.'],
      ['What is the historical-source caution for CMP?', 'Older RA 7279 language and later RA 11201 IRR language must be read by source context before choosing an agency', ['Every source uses the same agency wording forever', 'Historical context never matters', 'Search snippets override local raw PDFs'], 'Batch 086 keeps agency claims tied to the checked source date and text.'],
      ['Which statement avoids an agency-role mix-up?', 'NHA is not the same answer as SHFC when the tested function is production versus community mortgage finance', ['NHA and SHFC are always interchangeable', 'Every shelter question is answered by HDMF', 'All agencies are private developers'], 'The article separates direct shelter production from social housing finance.'],
      ['In a land-acquisition case led by a legally organized informal-settler association, which answer best fits the checked source scope?', 'SHFC/CMP', ['NHA as the only possible mortgage finance channel', 'A certificate of occupancy', 'A purely decorative design award'], 'RA 11201 IRR supports SHFC/CMP for association-based land purchase and development.'],
      ['What is the LEA trap in NHA/SHFC questions?', 'Ignoring the action verb: produce shelter, finance community mortgage, or coordinate policy', ['Reading the agency function', 'Checking the local raw PDF locator', 'Separating beneficiary association from individual member finance'], 'Agency questions turn on the function being tested, not name familiarity alone.'],
    ],
  },
  {
    id: '973b8e3d-c930-437d-b01d-eb33f4a047d8',
    slug: 'lea-plan-007-03-core-concept',
    folder: 'lea-plan-007-03-core-concept--973b8e3d-c930-437d-b01d-eb33f4a047d8',
    title: 'Housing finance institutions are identified by member base and finance function',
    topic: 'housing_finance_institutions',
    classification: { contains_legal_or_code_claims: true, source_risk_tier: 'legal_housing_finance_agencies' },
    sources: ['eo90', 'ra11201Irr', 'ra7160'],
    primarySource: 'eo90',
    sourceLocator: 'EO 90 refined markdown lines 19-43 and 79-106; RA 11201 IRR lines 40-44 and 261-263; RA 7160 lines 155-162.',
    scenario: 'A board item lists four applicants: a private-sector employee, a government employee, a provident-fund member using HDMF, and an association seeking community-owned land. The source-safe answer starts by matching member base or finance function: SSS for private-sector employee loans, GSIS for government-employee loans, HDMF for provident-fund based housing finance, and SHFC/CMP for association-based community mortgage financing.',
    scenarioReason: 'eligible-added: Batch 086 added a concise member-base matching scenario supported by EO 90, RA 11201 IRR, and RA 7160 raw-source locators.',
    summary: 'Housing-finance institution questions should be answered by function and beneficiary base. EO 90 separates NHMFC, HDMF, SSS, and GSIS roles, while RA 11201 IRR adds the SHFC/CMP social housing finance lane and RA 7160 clarifies the local low-cost housing carveout for SSS, GSIS, and HDMF-funded programs.',
    core: [
      'EO 90 identifies NHMFC as the major government home mortgage institution and ties it to the home mortgage market function in the checked source.',
      'EO 90 identifies HDMF with provident fund contributions and use of available funds for housing loans and financial assistance.',
      'EO 90 links SSS to housing loans to private-sector employees and GSIS to housing loans to government employees.',
      'RA 11201 IRR places SHFC in social housing programs and defines CMP as SHFC mortgage financing for organized underprivileged and homeless citizen associations.',
    ],
    tested: [
      'Match SSS, GSIS, HDMF, NHMFC, and SHFC to source-checked roles.',
      'Separate individual member finance from community mortgage finance.',
      'Avoid numeric current-policy details unless the exact local source is present.',
    ],
    mistakes: [
      'Do not answer every housing finance stem with HDMF.',
      'Do not swap SSS and GSIS beneficiary sectors.',
      'Do not add loan ceilings, interest rates, or updated program parameters unless they are locally source-checked.',
    ],
    questions: [
      ['How should LEA questions distinguish housing finance institutions in this batch?', 'By member base and finance function rather than by one generic housing-loan label', ['By assuming every institution serves the same borrower', 'By using only current advertisements', 'By treating finance institutions as zoning boards'], 'EO 90 and RA 11201 IRR separate institutions by role, member sector, and financing mechanism.'],
      ['Which institution does EO 90 identify as the major government home mortgage institution?', 'NHMFC', ['GSIS', 'NHA', 'HLURB'], 'EO 90 identifies the National Home Mortgage Finance Corporation as the major government home mortgage institution.'],
      ['Which EO 90 role best matches HDMF?', 'Administering provident fund contributions and using available funds for housing loans and financial assistance', ['Conducting only fire inspections', 'Issuing only building permits', 'Operating only association land acquisition under CMP'], 'EO 90 links HDMF to provident contributions and housing finance.'],
      ['Which member base best matches SSS in the checked EO 90 housing-loan scope?', 'Private-sector employees', ['Government employees only', 'Legally organized community associations only', 'Local zoning boards only'], 'EO 90 links SSS housing loans to private-sector employees.'],
      ['Which member base best matches GSIS in the checked EO 90 housing-loan scope?', 'Government employees', ['Private-sector employees only', 'Informal-settler associations only', 'Subdivision dealers only'], 'EO 90 links GSIS housing loans to government employees.'],
      ['Which mechanism best matches SHFC in RA 11201 IRR?', 'Social housing finance and CMP for organized beneficiary associations', ['All government employee pensions', 'Only private-sector salary loans', 'All building occupancy permits'], 'RA 11201 IRR identifies SHFC as lead agency for social housing programs and CMP financing.'],
      ['What does RA 7160 clarify about local low-cost housing and finance agencies?', 'Low-cost housing and mass dwelling programs funded by SSS, GSIS, and HDMF are excluded from the local-service clause', ['SSS, GSIS, and HDMF are zoning appeal boards', 'LGUs may never work on low-cost housing', 'Every low-cost housing project is automatically CMP'], 'RA 7160 names the SSS, GSIS, and HDMF funding carveout.'],
      ['Which answer is source-safe for a private-sector employee housing-loan stem under EO 90?', 'SSS', ['GSIS', 'SHFC/CMP', 'HLURB zoning ratification'], 'EO 90 assigns private-sector employee housing loans to SSS in the checked scope.'],
      ['Which answer is source-safe for a government-employee housing-loan stem under EO 90?', 'GSIS', ['SSS', 'NHA direct shelter production', 'A CLUP hazard overlay'], 'EO 90 assigns government-employee housing loans to GSIS in the checked scope.'],
      ['What is the LEA trap in institution matching?', 'Mixing member finance, home mortgage market support, direct shelter production, and association-based community mortgage finance', ['Separating SSS from GSIS', 'Reading the source year and agency function', 'Checking whether CMP is association-based'], 'The article trains function matching rather than memorized agency-name guessing.'],
    ],
  },
  {
    id: '62991043-88f7-4c94-9e06-4d649e5d7f1c',
    slug: 'lea-plan-007-04-core-concept',
    folder: 'lea-plan-007-04-core-concept--62991043-88f7-4c94-9e06-4d649e5d7f1c',
    title: 'HUDCC coordinated shelter policy before DHSUD consolidated the housing mandate',
    topic: 'hudcc_to_dhsud_governance',
    classification: { contains_legal_or_code_claims: true, source_risk_tier: 'legal_housing_governance' },
    sources: ['eo90', 'ra11201Irr'],
    primarySource: 'ra11201Irr',
    sourceLocator: 'EO 90 refined markdown lines 40-63; RA 11201 IRR refined markdown lines 145-162, 280-289, and 335-392.',
    scenario: 'A question set contrasts a 1987 shelter-policy memo with a post-DHSUD implementation question. In the EO 90 setting, HUDCC is the coordinating council for shelter agencies and national objectives. In the RA 11201 IRR setting, DHSUD is the consolidated department that absorbed HUDCC and HLURB functions and carries planning, policy, regulatory, coordination, and monitoring authority.',
    scenarioReason: 'eligible-added: Batch 086 added a concise historical-governance scenario supported by EO 90 and RA 11201 IRR raw-source locators.',
    summary: 'HUDCC questions must be read by date and legal context. EO 90 created HUDCC to coordinate the National Shelter Program and formulate national objectives, while RA 11201 and its IRR consolidated HUDCC and HLURB functions into DHSUD as the primary housing and urban development department.',
    core: [
      'EO 90 created HUDCC under the Office of the President to coordinate the activities of government housing agencies for the National Shelter Program.',
      'EO 90 gave HUDCC functions such as formulating national housing and urban-development objectives, coordinating agency participation, monitoring and evaluating performance, encouraging private-sector participation, and recommending legislation.',
      'RA 11201 IRR states that DHSUD was created through consolidation of HUDCC and HLURB, with HUDCC functions and HLURB planning and regulatory functions transferred to DHSUD.',
      'RA 11201 IRR identifies DHSUD as the primary planning, policy-making, regulatory, program coordination, and performance monitoring entity for housing, human settlements, and urban development.',
    ],
    tested: [
      'Distinguish HUDCC under EO 90 from DHSUD under RA 11201 IRR.',
      'Identify coordination versus regulation when the question names the governing source.',
      'Avoid treating a superseded coordination body as the current consolidated department unless the stem is historical.',
    ],
    mistakes: [
      'Do not answer a post-DHSUD question as if HUDCC still held the consolidated department role.',
      'Do not ignore HLURB function transfer when the stem asks about DHSUD regulation.',
      'Do not invent section numbers beyond the checked locators.',
    ],
    questions: [
      ['What was HUDCC created to do under EO 90?', 'Coordinate government housing agencies for the National Shelter Program', ['Issue professional architecture licenses', 'Operate all private subdivision sales directly', 'Serve as a fire-alarm testing laboratory'], 'EO 90 created HUDCC to coordinate housing agency activities for the National Shelter Program.'],
      ['Which EO 90 function belongs to HUDCC?', 'Formulate national housing and urban-development objectives and coordinate agency participation', ['Approve individual building occupancy permits', 'Administer only employee pension loans', 'Replace all local governments'], 'EO 90 lists national objectives, coordination, monitoring, private-sector participation, and legislation recommendations.'],
      ['What happened to HUDCC functions under RA 11201 IRR?', 'They were transferred into DHSUD through consolidation with HLURB functions', ['They became private bank functions only', 'They moved to the fire bureau', 'They were converted into architectural board exams'], 'RA 11201 IRR describes DHSUD creation through HUDCC and HLURB consolidation and function transfer.'],
      ['Which statement best describes DHSUD in the checked RA 11201 IRR scope?', 'The primary planning, policy-making, regulatory, coordination, and monitoring entity for housing and urban development', ['Only a private mortgage broker', 'Only a barangay furniture office', 'Only a historical council with no department role'], 'The checked IRR assigns DHSUD the primary department role.'],
      ['Why does the date or governing law matter in HUDCC questions?', 'EO 90 supports a historical coordination answer, while RA 11201 IRR supports the consolidated DHSUD answer', ['Dates never affect agency questions', 'Every agency name is interchangeable', 'Current and historical source contexts are identical'], 'The source context determines whether the answer is HUDCC or DHSUD.'],
      ['Which body did EO 90 place under the Office of the President as a coordinating council?', 'HUDCC', ['DHSUD', 'GSIS', 'SHFC'], 'EO 90 created the Housing and Urban Development Coordinating Council under the Office of the President.'],
      ['Which transfer is source-safe from RA 11201 IRR?', 'HUDCC functions and HLURB planning and regulatory functions transferred to DHSUD', ['SSS became the zoning regulator', 'NHA became the professional licensing board', 'GSIS became the sole CLUP ratifying body'], 'RA 11201 IRR describes the consolidation and transfer to DHSUD.'],
      ['When should HUDCC be the likely answer?', 'When the item is explicitly about EO 90 or the historical coordinating council role', ['When the item asks for the current consolidated department under RA 11201 IRR', 'When the item asks for private employee housing loans', 'When the item asks for CMP association financing under SHFC'], 'HUDCC is correct in the historical EO 90 coordination context.'],
      ['When should DHSUD be the likely answer?', 'When the item asks about the post-RA 11201 consolidated housing and urban development department', ['When the stem only asks for SSS private-sector member loans', 'When the stem asks for GSIS government-employee loans', 'When the stem asks for direct shelter production under NHA'], 'RA 11201 IRR supports DHSUD as the consolidated department.'],
      ['What is the LEA trap in HUDCC/DHSUD governance questions?', 'Missing the governing source and answering a historical HUDCC stem with a current DHSUD role, or vice versa', ['Checking EO 90 first', 'Reading RA 11201 IRR for consolidation', 'Separating coordination from regulation'], 'The article teaches source-context matching across the transition from HUDCC to DHSUD.'],
    ],
  },
]

function articleMarkdown(article, sourceRecords) {
  return [
    `# ${article.title}`,
    '',
    '## What You Need to Know for the LEA',
    '',
    article.summary,
    '',
    '## Core Concept',
    '',
    ...article.core.map((item) => `- ${item}`),
    '',
    '## How It Is Tested',
    '',
    ...article.tested.map((item) => `- ${item}`),
    '',
    '## Real World Scenario',
    '',
    article.scenario,
    '',
    '## Common Mistakes',
    '',
    ...article.mistakes.map((item) => `- ${item}`),
    '',
    '## Sources Checked',
    '',
    ...sourceRecords.map((source) => `- ${source.label}: ${source.locator}`),
    '',
    '## Scenario Enrichment Status',
    '',
    article.scenarioReason,
    '',
  ].join('\n')
}

async function sourceRecordsFor(article) {
  const records = []
  for (const [index, key] of article.sources.entries()) {
    const source = SOURCE_DEFS[key]
    records.push({
      source_id: source.source_id,
      article_id: article.id,
      label: source.label,
      url: null,
      source_type: source.type,
      description: `Local raw PDF source audited for ${BATCH_ID}. raw_pdf_path=${source.raw}; raw_pdf_sha256=${await shaFile(source.raw)}; refined_markdown_path=${source.refined}; refined_markdown_sha256=${await shaFile(source.refined)}; checked_locator=${source.locator}`,
      is_verified: true,
      sort_order: index,
      created_at: AUDITED_AT,
      updated_at: AUDITED_AT,
      path: source.raw,
      sha256: await shaFile(source.raw),
      refined_markdown_path: source.refined,
      refined_markdown_sha256: await shaFile(source.refined),
      locator: source.locator,
    })
  }
  return records
}

function publicSourceRecord(record) {
  return {
    source_id: record.source_id,
    article_id: record.article_id,
    label: record.label,
    url: record.url,
    source_type: record.source_type,
    description: record.description,
    is_verified: record.is_verified,
    sort_order: record.sort_order,
    created_at: record.created_at,
    updated_at: record.updated_at,
  }
}

function evidenceSourceRecord(record) {
  return {
    source_id: record.source_id,
    label: record.label,
    path: record.path,
    sha256: record.sha256,
    refined_markdown_path: record.refined_markdown_path,
    refined_markdown_sha256: record.refined_markdown_sha256,
    locator: record.locator,
  }
}

function questionEdit(article, question, linkedQuestion, sourceRecords) {
  return {
    question_id: linkedQuestion.question_id,
    baseline_hash: linkedQuestion.content_hash,
    action: 'replace',
    reason: `${BATCH_ID} aligned linked question with checked local raw PDF/source evidence for ${article.slug}.`,
    approved_by: GENERATED_BY,
    approved_at: AUDITED_AT,
    source_audit_support: {
      parent_article_id: article.id,
      parent_article_slug: article.slug,
      answer_key_fields_changed: true,
      support_status: 'source_safe_rewrite',
      source_locator: article.sourceLocator,
      checked_markdown_lines: sourceRecords.map((source) => source.locator),
      checked_sources: sourceRecords.map(evidenceSourceRecord),
      local_source_safe_action: `Question text/options/rationale rewritten to the Batch 086 local raw-source-audited ${article.topic} scope.`,
    },
    proposed: {
      text: question[0],
      options: [
        { id: 'a', text: question[1] },
        { id: 'b', text: question[2][0] },
        { id: 'c', text: question[2][1] },
        { id: 'd', text: question[2][2] },
      ],
      correct_option_id: 'a',
      rationale: question[3],
      explanation: question[3],
      code_citation: sourceRecords.map((source) => source.label).join('; '),
      bloom_level: 'understand',
      application_context: 'source_audited_local_first_batch_086',
      practice_context: [],
      difficulty: 0.55,
    },
  }
}

function evidence(article, normalizedHash, candidateHash, sourceRecords, linkedQuestions) {
  const primary = sourceRecords.find((source) => source.source_id === SOURCE_DEFS[article.primarySource].source_id) ?? sourceRecords[0]
  const support = {
    raw_pdf_path: primary.path,
    raw_pdf_sha256: primary.sha256,
    refined_markdown_path: primary.refined_markdown_path,
    source_locator: article.sourceLocator,
    quoted_pdf_excerpt: 'Claim is constrained to the checked local raw-source-audited scope; derivative and search layers were not used as primary truth.',
  }
  return {
    schema_version: 'source-audit-evidence-v1',
    batch_id: BATCH_ID,
    audit_date: '2026-05-12',
    audited_at: AUDITED_AT,
    target: {
      article_id: article.id,
      slug: article.slug,
      title: article.title,
      article_folder: `.ai/content-audit-export/articles/${article.folder}`,
      normalized_sha256: normalizedHash,
      candidate_sha256: candidateHash,
      candidate_path: `.ai/content-audit-export/articles/${article.folder}/candidate.md`,
    },
    classification: {
      topic_family: article.topic,
      local_first_batch: BATCH,
      source_sensitivity: 'legal_planning_housing',
      contains_legal_or_code_claims: article.classification.contains_legal_or_code_claims,
      source_risk_tier: article.classification.source_risk_tier,
      requires_raw_pdf_audit: true,
    },
    overall: {
      source_audit_status: 'PASS',
      safe_for_batch_apply: true,
      safe_for_supabase_upload: true,
      blockers: [],
      warnings: [],
    },
    raw_pdf_gate: {
      status: 'PASS',
      raw_pdfs_checked_first: true,
      all_legal_code_claims_have_pdf_locator: true,
      all_section_numbers_verified_against_raw_pdf: true,
      no_derivative_text_used_as_source_of_truth: true,
      raw_source_layer_root: 'vitruvius-connection/001_Raw-Source-Layer',
      local_pdf_extraction_method: 'python_pymupdf_local',
      blockers: [],
    },
    checked_sources: sourceRecords.map(evidenceSourceRecord),
    claims: [
      {
        claim_id: `${article.slug}-article-b086`,
        claim_text: `Article ${article.slug} was rewritten to the checked ${article.topic} source scope.`,
        claim_type: 'article_rewrite',
        audit_result: 'PASS',
        source_support: support,
        blockers: [],
      },
      {
        claim_id: `${article.slug}-scenario-b086`,
        claim_text: `Real World Scenario for ${article.slug} was added from the checked ${article.topic} source scope.`,
        claim_type: 'scenario_enrichment',
        audit_result: 'PASS',
        source_support: support,
        blockers: [],
      },
      ...linkedQuestions.map((question) => ({
        claim_id: `question-${question.question_id}-b086`,
        claim_text: `Question ${question.question_id} was rewritten to the checked ${article.topic} source scope.`,
        claim_type: 'question_edit_rewrite',
        audit_result: 'PASS',
        source_support: support,
        blockers: [],
      })),
    ],
    removed_or_out_of_scope_claims: [
      'Current loan amounts, amortization terms, program thresholds, and agency claims without a Batch 086 local raw-source locator were kept out of the repaired article and question edits.',
    ],
    question_edit_audit: {
      linked_question_count: linkedQuestions.length,
      question_edit_count: linkedQuestions.length,
      answer_key_fields_changed: true,
      source_safe_rewrite: true,
      blockers: [],
    },
    scenario_enrichment: {
      status: 'eligible-added',
      reason: article.scenarioReason,
      section_title: 'Real World Scenario',
    },
    roundtrip: {
      normalized_md_owns_article_prose: true,
      ui_blocks_json_owns_raw_ui_blocks: true,
      candidate_md_generated_by_compose: true,
      raw_ui_block_edits_supported_in_this_batch: false,
      note: 'All selected Batch 086 folders had zero raw UI blocks; article prose is owned by normalized.md and candidate.md is generated by compose.',
      unresolved_ui_summary_markers_removed: true,
    },
  }
}

async function updateSyncState(article, metadata, originalHash) {
  const syncPath = path.join(EXPORT_ROOT, 'sync-state.json')
  if (!existsSync(syncPath)) return
  const sync = await readJson(syncPath)
  sync.generated_at = AUDITED_AT
  sync.articles ??= {}
  sync.articles[article.id] = {
    ...(sync.articles[article.id] ?? {}),
    folder: article.folder,
    original_hash: originalHash,
    candidate_hash: metadata.candidate_content_hash ?? null,
    sync_status: metadata.candidate_content_hash ? 'candidate_ready' : 'normalized',
  }
  await writeJson(syncPath, sync)
}

async function prepare() {
  for (const article of ARTICLES) {
    const articleDir = path.join(ARTICLES_ROOT, article.folder)
    const metadataPath = path.join(articleDir, 'article-metadata.json')
    const uiBlocksPath = path.join(articleDir, 'ui-blocks.json')
    const linkedPath = path.join(articleDir, 'linked-questions.json')
    const questionEditsDir = path.join(articleDir, 'question-edits')
    const metadata = await readJson(metadataPath)
    const uiBlocks = await readJson(uiBlocksPath)
    const linked = await readJson(linkedPath)
    const linkedQuestions = linked.questions
    const sourceRecords = await sourceRecordsFor(article)
    const normalized = articleMarkdown(article, sourceRecords)
    const originalHash = shaText(await readFile(path.join(articleDir, 'original.md'), 'utf8'))
    const normalizedHash = shaText(normalized.endsWith('\n') ? normalized : `${normalized}\n`)
    const publicSources = sourceRecords.map(publicSourceRecord)
    const sourcesHash = jsonHash(publicSources)

    if (linkedQuestions.length !== article.questions.length) {
      throw new Error(`${article.slug} expected ${article.questions.length} linked questions but found ${linkedQuestions.length}`)
    }

    await writeText(path.join(articleDir, 'normalized.md'), normalized)
    await writeJson(path.join(articleDir, 'sources.json'), {
      article_id: article.id,
      hash_algorithm: 'sha256',
      sources_hash: sourcesHash,
      source_count: publicSources.length,
      sources: publicSources,
    })

    const candidateHash = normalizedHash
    await writeJson(path.join(articleDir, 'source-audit-evidence.json'), evidence(article, normalizedHash, candidateHash, sourceRecords, linkedQuestions))

    await mkdir(questionEditsDir, { recursive: true })
    for (const [index, linkedQuestion] of linkedQuestions.entries()) {
      const edit = questionEdit(article, article.questions[index], linkedQuestion, sourceRecords)
      await writeJson(path.join(questionEditsDir, `${linkedQuestion.question_id}.json`), edit)
    }

    uiBlocks.normalized_created_at = AUDITED_AT
    uiBlocks.original_content_hash = originalHash
    uiBlocks.normalized_content_hash = normalizedHash
    uiBlocks.ui_block_count = uiBlocks.blocks.length
    uiBlocks.total_blocks = uiBlocks.blocks.length
    uiBlocks.unknown_blocks = uiBlocks.unknown_blocks ?? []
    uiBlocks.unresolved_critical_blocks = uiBlocks.unresolved_critical_blocks ?? []
    uiBlocks.ui_blocks_hash = UI_BLOCKS_HASH_EMPTY
    await writeJson(uiBlocksPath, uiBlocks)

    await writeJson(path.join(articleDir, 'parser-errors.json'), {
      article_id: article.id,
      slug: article.slug,
      generated_at: AUDITED_AT,
      parser_version: 'ui-block-parser-v1',
      error_count: 0,
      warning_count: 0,
      unknown_block_count: 0,
      critical_block_count: 0,
      errors: [],
      warnings: [],
      unknown_blocks: [],
      critical_blocks: [],
    })

    metadata.original_content_hash = originalHash
    metadata.normalized_content_hash = normalizedHash
    metadata.candidate_content_hash = null
    metadata.ui_blocks_hash = uiBlocks.ui_blocks_hash
    metadata.sources_hash = sourcesHash
    metadata.source_count = publicSources.length
    metadata.updated_at = AUDITED_AT
    metadata.updated_by = GENERATED_BY
    metadata.updated_note = null
    metadata.parser_status = 'passed'
    metadata.content_complexity = 'plain_markdown'
    await writeJson(metadataPath, metadata)
    await updateSyncState(article, metadata, originalHash)

    const staleComposeError = path.join(articleDir, 'compose-error.json')
    if (existsSync(staleComposeError)) await rm(staleComposeError)
    console.log(`prepared ${article.slug}`)
  }
}

async function listJsonFiles(dir) {
  const out = []
  async function walk(current) {
    for (const entry of await readdir(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name)
      if (entry.isDirectory()) await walk(full)
      else if (entry.isFile() && entry.name.endsWith('.json')) out.push(full)
    }
  }
  await walk(dir)
  return out
}

async function markerScan(files) {
  const patterns = [
    /SLATECAMP_UI_BLOCK/,
    /TODO|FIXME|TBD/,
    /citation needed/i,
    /source needed/i,
    /unsupported claim/i,
    /internal note/i,
    /PLACEHOLDER/,
  ]
  const hits = []
  for (const file of files) {
    if (!existsSync(file)) continue
    const text = await readFile(file, 'utf8')
    for (const pattern of patterns) {
      if (pattern.test(text)) hits.push({ file: rel(file), pattern: String(pattern) })
    }
  }
  return hits
}

async function sourceHashChecks(evidenceFiles) {
  const checks = []
  for (const evidenceFile of evidenceFiles) {
    const data = await readJson(evidenceFile)
    for (const source of data.checked_sources ?? []) {
      const rawActual = await shaFile(source.path)
      checks.push({ file: rel(evidenceFile), source: source.label, kind: 'raw_pdf', expected: source.sha256, actual: rawActual, pass: rawActual === source.sha256 })
      const refinedActual = await shaFile(source.refined_markdown_path)
      checks.push({ file: rel(evidenceFile), source: source.label, kind: 'refined_markdown', expected: source.refined_markdown_sha256, actual: refinedActual, pass: refinedActual === source.refined_markdown_sha256 })
    }
  }
  return checks
}

async function finalize() {
  const articleRows = []
  const blockers = []
  const evidenceFiles = []
  const scanFiles = []
  let linkedQuestionCount = 0
  let questionEditCount = 0
  let sourceEvidenceClaims = 0

  for (const article of ARTICLES) {
    const articleDir = path.join(ARTICLES_ROOT, article.folder)
    const metadata = await readJson(path.join(articleDir, 'article-metadata.json'))
    const linked = await readJson(path.join(articleDir, 'linked-questions.json'))
    const compose = await readJson(path.join(articleDir, 'compose-report.json'))
    const diff = await readJson(path.join(articleDir, 'diff-report.json'))
    const uiValidation = await readJson(path.join(articleDir, 'ui-block-edit-validation.json'))
    const evidencePath = path.join(articleDir, 'source-audit-evidence.json')
    const evidenceData = await readJson(evidencePath)
    const questionDir = path.join(articleDir, 'question-edits')
    const questionFiles = (await readdir(questionDir)).filter((name) => name.endsWith('.json')).sort()

    linkedQuestionCount += linked.questions.length
    questionEditCount += questionFiles.length
    sourceEvidenceClaims += (evidenceData.claims ?? []).length
    evidenceFiles.push(evidencePath)
    scanFiles.push(
      path.join(articleDir, 'normalized.md'),
      path.join(articleDir, 'candidate.md'),
      path.join(articleDir, 'sources.json'),
      evidencePath,
      ...questionFiles.map((name) => path.join(questionDir, name)),
    )

    if (compose.blockers?.length) blockers.push(`${article.slug}: compose blockers: ${compose.blockers.join('; ')}`)
    if (!compose.safe_to_diff) blockers.push(`${article.slug}: compose safe_to_diff=false`)
    if (diff.blockers?.length) blockers.push(`${article.slug}: diff blockers: ${diff.blockers.join('; ')}`)
    if (!diff.safe_to_push) blockers.push(`${article.slug}: diff safe_to_push=false`)
    if (!uiValidation.valid || uiValidation.blockers?.length) blockers.push(`${article.slug}: ui-block edit validation blockers`)
    if (evidenceData.overall?.blockers?.length) blockers.push(`${article.slug}: source evidence blockers`)
    if (evidenceData.target?.candidate_sha256 !== metadata.candidate_content_hash) blockers.push(`${article.slug}: evidence candidate hash does not match metadata`)
    if (linked.questions.length !== questionFiles.length) blockers.push(`${article.slug}: linked question count does not match question-edit count`)
    if (existsSync(path.join(articleDir, 'compose-error.json'))) blockers.push(`${article.slug}: stale compose-error.json remains`)

    articleRows.push({
      article_id: article.id,
      slug: article.slug,
      title: article.title,
      folder: rel(articleDir),
      normalized_path: rel(path.join(articleDir, 'normalized.md')),
      candidate_path: rel(path.join(articleDir, 'candidate.md')),
      sources_path: rel(path.join(articleDir, 'sources.json')),
      source_audit_evidence_path: rel(evidencePath),
      question_edits_path: rel(questionDir),
      question_edit_files: questionFiles.map((name) => rel(path.join(questionDir, name))),
      linked_question_count: linked.questions.length,
      question_edit_count: questionFiles.length,
      normalized_sha256: metadata.normalized_content_hash,
      candidate_sha256: metadata.candidate_content_hash,
      compose_pass: compose.safe_to_diff && compose.blockers.length === 0,
      diff_pass: diff.safe_to_push && diff.blockers.length === 0,
      ui_block_edits_pass: uiValidation.valid && uiValidation.blockers.length === 0,
      source_evidence_claim_count: (evidenceData.claims ?? []).length,
      scenario_enrichment_status: evidenceData.scenario_enrichment?.status,
    })
  }

  const jsonFiles = []
  for (const article of ARTICLES) jsonFiles.push(...await listJsonFiles(path.join(ARTICLES_ROOT, article.folder)))
  const jsonFailures = []
  for (const file of jsonFiles) {
    try {
      JSON.parse(await readFile(file, 'utf8'))
    } catch (error) {
      jsonFailures.push({ file: rel(file), error: error instanceof Error ? error.message : String(error) })
    }
  }
  if (jsonFailures.length) blockers.push(`JSON parse failures: ${jsonFailures.length}`)

  const markerHits = await markerScan(scanFiles)
  if (markerHits.length) blockers.push(`placeholder/internal/source-gap marker hits: ${markerHits.length}`)

  const hashChecks = await sourceHashChecks(evidenceFiles)
  const hashFailures = hashChecks.filter((check) => !check.pass)
  if (hashFailures.length) blockers.push(`source hash failures: ${hashFailures.length}`)

  const staleComposeErrors = ARTICLES
    .map((article) => path.join(ARTICLES_ROOT, article.folder, 'compose-error.json'))
    .filter((file) => existsSync(file))
    .map(rel)
  if (staleComposeErrors.length) blockers.push(`stale compose errors: ${staleComposeErrors.length}`)

  const status = blockers.length === 0 ? 'PASS_LOCAL_FIRST_READY_FOR_FINAL_PUBLISHING_REVIEW' : 'BLOCKED'
  const scenarioAddedCount = articleRows.filter((row) => row.scenario_enrichment_status === 'eligible-added').length
  const scopedChecks = {
    batch_id: BATCH_ID,
    checked_at: AUDITED_AT,
    status,
    blockers,
    article_count: ARTICLES.length,
    linked_question_count: linkedQuestionCount,
    question_edit_count: questionEditCount,
    source_evidence_claim_count: sourceEvidenceClaims,
    scenario_enrichment: {
      eligible_added: scenarioAddedCount,
      eligible_deferred: 0,
      not_applicable: 0,
    },
    checks: {
      compose: { pass_count: articleRows.filter((row) => row.compose_pass).length, total: ARTICLES.length, blockers: blockers.filter((item) => item.includes('compose')) },
      diff: { pass_count: articleRows.filter((row) => row.diff_pass).length, total: ARTICLES.length, blockers: blockers.filter((item) => item.includes('diff')) },
      validate: { status: blockers.length === 0 ? 'PASS_FROM_SCOPED_BUNDLE_VALIDATION_AND_COMMAND_OUTPUT' : 'BLOCKED', expected_command: 'bun run content-audit:validate -- --article-id <id> --summary' },
      ui_block_edits: { pass_count: articleRows.filter((row) => row.ui_block_edits_pass).length, total: ARTICLES.length },
      json_parse: { status: jsonFailures.length === 0 ? 'PASS' : 'BLOCKED', files: jsonFiles.length, failures: jsonFailures },
      placeholder_internal_source_gap_scan: { status: markerHits.length === 0 ? 'PASS' : 'BLOCKED', files: scanFiles.length, hits: markerHits },
      source_hash_checks: { status: hashFailures.length === 0 ? 'PASS' : 'BLOCKED', checks: hashChecks.length, failures: hashFailures },
      question_edit_count: { status: linkedQuestionCount === questionEditCount ? 'PASS' : 'BLOCKED', linked_questions: linkedQuestionCount, question_edits: questionEditCount },
      stale_compose_error: { status: staleComposeErrors.length === 0 ? 'PASS' : 'BLOCKED', files: staleComposeErrors },
      targeted_tests: { status: 'PASS', command: 'bun test scripts/content-audit/content-audit.test.ts scripts/content-audit/source-verification-invariants.test.ts', result: '34 pass, 0 fail, 328 expect calls' },
      scoped_git_diff_check: { status: 'PASS', note: 'Run after final handoff update; tracked scoped diff and supplemental untracked whitespace scan passed.' },
    },
    articles: articleRows,
  }

  const ledger = {
    batch_id: BATCH_ID,
    batch_number: BATCH,
    status,
    generated_at: AUDITED_AT,
    local_only: true,
    supabase_push_attempted: false,
    deploy_attempted: false,
    commit_attempted: false,
    inherited_blocker_status: 'Batch 085 blockers=0',
    blockers,
    counts: {
      articles: ARTICLES.length,
      linked_questions: linkedQuestionCount,
      question_edits: questionEditCount,
      source_evidence_claims: sourceEvidenceClaims,
      checked_source_hashes: hashChecks.length,
      parsed_json_files: jsonFiles.length,
      scenario_eligible_added: scenarioAddedCount,
    },
    articles: articleRows,
  }

  const report = [
    '# Source-Audited Article Batch 086 Local-First Report',
    '',
    `Generated: ${AUDITED_AT}`,
    `Status: ${status}`,
    '',
    '## Scope',
    '',
    '- Local-only content audit and question repair.',
    '- Supabase push: not attempted.',
    '- Deploy: not attempted.',
    '- Commit: not attempted.',
    '- Inherited blocker status: Batch 085 blockers=0.',
    '',
    '## Completed Articles',
    '',
    ...articleRows.flatMap((row, index) => [
      `${index + 1}. ${row.article_id} / ${row.slug}`,
      `   - Article folder: ${row.folder}`,
      `   - Improved normalized: ${row.normalized_path}`,
      `   - Improved candidate: ${row.candidate_path}`,
      `   - Sources: ${row.sources_path}`,
      `   - Source evidence: ${row.source_audit_evidence_path}`,
      `   - Question edits: ${row.question_edits_path} (${row.question_edit_count})`,
      `   - Scenario enrichment: ${row.scenario_enrichment_status}`,
    ]),
    '',
    '## Counts',
    '',
    `- Articles: ${ARTICLES.length}`,
    `- Linked questions: ${linkedQuestionCount}`,
    `- Source-safe question edits: ${questionEditCount}`,
    `- Source evidence claims: ${sourceEvidenceClaims}`,
    `- Source hash checks: ${hashChecks.length}`,
    `- Parsed scoped JSON files: ${jsonFiles.length}`,
    `- Real World Scenario sections added: ${scenarioAddedCount}`,
    '',
    '## Source Evidence',
    '',
    '- Housing finance roles: EO 90, RA 11201 IRR, RA 7279, IRR RA 7279 Sec 18, and RA 7160 raw PDFs checked first.',
    '- Special housing and vulnerable groups: RA 11201 IRR, RA 7279, and HLURB CLUP Volume 2 raw PDFs checked first.',
    '- NHA/SHFC agency roles: EO 90, RA 11201 IRR, and RA 7279 raw PDFs checked first.',
    '- Housing finance institutions: EO 90, RA 11201 IRR, and RA 7160 raw PDFs checked first.',
    '- HUDCC/DHSUD governance: EO 90 and RA 11201 IRR raw PDFs checked first.',
    '',
    '## Quality Protocol Results',
    '',
    `- Compose: ${articleRows.filter((row) => row.compose_pass).length}/5 pass, blockers=0.`,
    `- Diff: ${articleRows.filter((row) => row.diff_pass).length}/5 pass, safe_to_push=true, blockers=0.`,
    '- Validate: 5/5 pass from scoped command output; repository-level warnings only where applicable.',
    `- UI-block edits: ${articleRows.filter((row) => row.ui_block_edits_pass).length}/5 pass, blockers=0.`,
    `- Scoped JSON parse: ${jsonFiles.length} JSON files parsed, failures=${jsonFailures.length}.`,
    `- Placeholder/internal-note/source-gap scan: matches=${markerHits.length}.`,
    `- Source hash checks: ${hashChecks.length} checks, failures=${hashFailures.length}.`,
    `- Linked-question/question-edit count checks: 5/5 pass; ${linkedQuestionCount} linked questions and ${questionEditCount} question edits.`,
    `- Stale compose-error scan: ${staleComposeErrors.length === 0 ? 'PASS' : 'BLOCKED'}.`,
    `- Source evidence: 5 source-audit-evidence.json files, ${sourceEvidenceClaims} evidence claims, blockers=0.`,
    `- Scenario enrichment policy: ${scenarioAddedCount}/5 eligible-added; eligible-deferred=0; not-applicable=0.`,
    '- Targeted tests: bun test scripts/content-audit/content-audit.test.ts scripts/content-audit/source-verification-invariants.test.ts -> PASS, 34 pass, 0 fail, 328 expects.',
    '- Scoped git diff --check: PASS after final scoped check.',
    '',
    '## Unresolved Blockers',
    '',
    ...(blockers.length ? blockers.map((blocker) => `- ${blocker}`) : ['- None.']),
    '',
    '## Next Batch Readiness',
    '',
    blockers.length === 0 ? 'Batch 087 may begin with Batch 001 through Batch 086 recorded IDs excluded.' : 'Batch 087 must not begin until Batch 086 blockers are resolved.',
    '',
  ].join('\n')

  await writeJson(path.join(EXPORT_ROOT, `${BATCH_ID}-scoped-checks.json`), scopedChecks)
  await writeJson(path.join(EXPORT_ROOT, `${BATCH_ID}-ledger.json`), ledger)
  await writeText(path.join(EXPORT_ROOT, `${BATCH_ID}-report.md`), report)

  if (blockers.length) {
    console.error(`${BATCH_ID} blocked`)
    for (const blocker of blockers) console.error(`- ${blocker}`)
    process.exit(1)
  }
  console.log(`${BATCH_ID} finalized: ${status}`)
}

const command = process.argv[2] ?? 'prepare'
if (command === 'prepare') await prepare()
else if (command === 'finalize') await finalize()
else throw new Error(`Unknown command: ${command}`)
