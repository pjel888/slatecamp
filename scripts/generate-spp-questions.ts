#!/usr/bin/env bun
/**
 * generate-spp-questions.ts
 *
 * Generates 110 hardcoded MCQ questions (10 per SPP document) and writes them
 * as JSON files to the `SPP Docs/` directory.
 *
 * Run with: bun run scripts/generate-spp-questions.ts
 */

import fs from "fs";
import path from "path";

// ─── Types ──────────────────────────────────────────────────────────────────────

interface QuestionOption {
  id: string;
  text: string;
}

interface QuestionRationale {
  a: string;
  b: string;
  c: string;
  d: string;
  correct: string;
  takeaway: string;
}

interface Question {
  topic_id: string;
  article_id: string;
  text: string;
  options: QuestionOption[];
  correct_option_id: string;
  rationale: QuestionRationale;
  difficulty: number;
  bloom_level: string;
  code_citation: string;
  question_type: string;
  is_assessment: boolean;
}

// ─── Constants ──────────────────────────────────────────────────────────────────

const TOPIC_ID = "1042b5a6-e01e-4e1c-b9e3-5c3b31042f64";
const SPP_DOCS_DIR = path.join(process.cwd(), "SPP Docs");

interface DocConfig {
  articleId: string;
  filename: string;
}

const DOCS: Record<string, DocConfig> = {
  uap_overview: {
    articleId: "f2c105fd-51fc-4b48-b53a-77242dbb91b0",
    filename:
      "UAP SPP Doc Standards of Professional Practice for Philippine Architects_questions.json",
  },
  spp201: {
    articleId: "16bb270e-6887-4bbe-a62e-eace6c4d3fdb",
    filename: "SPP Doc 201 - Pre-Design Services_questions.json",
  },
  spp202: {
    articleId: "24b0a3db-e6bc-45d0-a9a1-d83009112efb",
    filename: "SPP Doc 202 - Regular Design Services_questions.json",
  },
  spp203: {
    articleId: "9a800f21-b26e-4e3e-94c8-2f4127eccd42",
    filename: "SPP Doc 203 - Specialized Architectural Services_questions.json",
  },
  spp204a: {
    articleId: "c534d94f-967a-48bb-babf-419fa6d35ec7",
    filename: "SPP Doc 204-A - Fulltime Supervision Services_questions.json",
  },
  spp204b: {
    articleId: "f5ed9c09-3191-4cd4-b1b0-9e6364212c36",
    filename: "SPP Doc 204-B - Construction Management Services_questions.json",
  },
  spp205: {
    articleId: "875396fa-1704-47b7-abb5-29f49c75fc78",
    filename: "SPP Doc 205 - Post-Construction Services_questions.json",
  },
  spp206: {
    articleId: "f74f79a0-1477-481f-9050-fa43d82f18bd",
    filename:
      "SPP Doc 206 - Comprehensive Architectural Services_questions.json",
  },
  spp207: {
    articleId: "f76bad6c-4bdf-4d2c-bdfb-a3381c42e320",
    filename: "SPP Doc 207 - Design-Build Services_questions.json",
  },
  spp208: {
    articleId: "fba5f537-2da9-4fb3-b6eb-696d1937a92a",
    filename:
      "SPP Doc 208 - Architectural Design Competition (ADC)_questions.json",
  },
  spp209: {
    articleId: "f7861b5b-0833-4cd3-a634-0dfb9f53891c",
    filename:
      "SPP Doc 209 - Architectural Consulting Services (PACS)_questions.json",
  },
};

// ─── Helper ─────────────────────────────────────────────────────────────────────

function q(
  articleId: string,
  text: string,
  options: [string, string, string, string],
  correctId: string,
  rationale: QuestionRationale,
  difficulty: number,
  bloom: string,
  citation: string
): Question {
  return {
    topic_id: TOPIC_ID,
    article_id: articleId,
    text,
    options: [
      { id: "a", text: options[0] },
      { id: "b", text: options[1] },
      { id: "c", text: options[2] },
      { id: "d", text: options[3] },
    ],
    correct_option_id: correctId,
    rationale,
    difficulty,
    bloom_level: bloom,
    code_citation: citation,
    question_type: "mcq",
    is_assessment: false,
  };
}

// ─── UAP Overview Questions ─────────────────────────────────────────────────────

const uapOverviewQuestions: Question[] = [
  q(
    DOCS.uap_overview.articleId,
    "When did the 2010 UAP Standards of Professional Practice (SPP) take effect?",
    [
      "January 1, 2010",
      "March 9, 2011",
      "June 15, 2010",
      "December 31, 2011",
    ],
    "b",
    {
      a: "January 1, 2010 is incorrect. While the SPP was adopted in 2010, its effectivity date was tied to the PRC approval, not the calendar year start.",
      b: "March 9, 2011 is correct. The SPP took effect upon PRC-Board of Architecture Resolution approval on this date, as documented in the UAP SPP overview.",
      c: "June 15, 2010 is incorrect. This date has no significance in the SPP approval timeline.",
      d: "December 31, 2011 is incorrect. The SPP was already in effect well before the end of 2011.",
      correct:
        "The 2010 UAP Standards of Professional Practice took effect on March 9, 2011, upon approval by the PRC-Board of Architecture through a formal Resolution. This is the legal basis under R.A. 9266 (Architecture Act of 2004).",
      takeaway:
        "The SPP effective date is March 9, 2011 — not the year of adoption (2010).",
    },
    0.4,
    "remember",
    "SPP 200 / R.A. 9266"
  ),
  q(
    DOCS.uap_overview.articleId,
    "Which of the following is NOT one of the three recognized methods of architect selection under the SPP?",
    [
      "Direct Selection by Owner",
      "Comparative Selection (Shortlisting)",
      "Architectural Design Competition (ADC)",
      "Lowest Bidder Selection",
    ],
    "d",
    {
      a: "Direct Selection by Owner is incorrect as an answer because it IS one of the three recognized methods. The Owner directly engages an architect of their choice.",
      b: "Comparative Selection (Shortlisting) is incorrect as an answer because it IS one of the three recognized methods. Multiple architects are evaluated and compared.",
      c: "Architectural Design Competition (ADC) is incorrect as an answer because it IS one of the three recognized methods, governed by SPP 208.",
      d: "Lowest Bidder Selection is correct. The SPP explicitly does NOT recognize lowest-bid selection for architectural services, as professional services are not commodities subject to price-based bidding.",
      correct:
        "The three recognized methods of architect selection under SPP are: (1) Direct Selection, (2) Comparative Selection/Shortlisting, and (3) Architectural Design Competition. Lowest bidder selection is prohibited for professional architectural services.",
      takeaway:
        "Architectural services use Direct, Comparative, or ADC selection — never lowest-bid.",
    },
    0.5,
    "understand",
    "SPP 200"
  ),
  q(
    DOCS.uap_overview.articleId,
    "Under the SPP, what defines a Registered and Licensed Architect (RLA)?",
    [
      "Any graduate of an architecture program",
      "A natural person holding a valid PRC Certificate of Registration and Professional Identification Card",
      "Any member of the United Architects of the Philippines",
      "A person with a master's degree in architecture from a recognized institution",
    ],
    "b",
    {
      a: "A graduate of architecture alone does not qualify as an RLA. Graduation is a prerequisite but does not confer the legal right to practice.",
      b: "Correct. An RLA is specifically defined as a natural person (not a firm or corporation) who holds a valid Certificate of Registration and Professional Identification Card issued by the PRC.",
      c: "UAP membership, while professionally important, is not the legal basis for RLA status. PRC registration is the statutory requirement.",
      d: "A master's degree is not a requirement for RLA status. The requirement is passing the licensure examination and obtaining PRC registration.",
      correct:
        "An RLA is a natural person who holds a valid PRC Certificate of Registration and Professional Identification Card. This definition emphasizes that only natural persons (not juridical entities) can be architects, and PRC registration is the sole legal basis.",
      takeaway:
        "An RLA is a natural person with a valid PRC certificate — not a firm, not just a graduate.",
    },
    0.4,
    "remember",
    "R.A. 9266 / SPP 200"
  ),
  q(
    DOCS.uap_overview.articleId,
    "Annex 'A' of the 2010 SPP series replaces which previous UAP document?",
    [
      "UAP Doc. 201",
      "UAP Doc. 206",
      "UAP Doc. 208",
      "UAP Doc. 209",
    ],
    "c",
    {
      a: "UAP Doc. 201 is incorrect. The previous Doc. 201 was replaced by the new SPP Doc. 201, not by Annex A.",
      b: "UAP Doc. 206 is incorrect. Doc. 206 was replaced by the new SPP Doc. 206.",
      c: "Correct. Annex 'A' (Interior Design Fee Schedule) replaces the 1979 UAP Doc. 208, which previously covered interior design fees.",
      d: "UAP Doc. 209 is incorrect. The 1979 Doc. 209 was replaced by SPP Doc. 208 (Architectural Design Competition), not by Annex A.",
      correct:
        "Annex 'A' of the 2010 SPP, which covers the Interior Design Fee Schedule, replaces the 1979 UAP Doc. 208. This is a commonly tested distinction because the numbering shifted between the 1979 and 2010 series.",
      takeaway:
        "Annex A (Interior Design fees) replaces the old 1979 UAP Doc. 208.",
    },
    0.6,
    "remember",
    "SPP 200 / Annex A"
  ),
  q(
    DOCS.uap_overview.articleId,
    "What are the requirements for a foreign architect to practice in the Philippines under the SPP?",
    [
      "Only a valid license from their home country",
      "A Temporary/Special Permit (TSP), DoLE certification, and collaboration with a local RLA",
      "UAP membership and IAPOA endorsement",
      "A reciprocity agreement between the Philippines and the foreign country",
    ],
    "b",
    {
      a: "A home-country license alone is insufficient. Philippine law requires additional permits and local collaboration.",
      b: "Correct. Foreign architects must obtain a Temporary/Special Permit (TSP) from the PRC, Department of Labor and Employment (DoLE) certification, and must collaborate with a local RLA.",
      c: "UAP membership and IAPOA endorsement are not the statutory requirements. The legal framework is through PRC and DoLE.",
      d: "While reciprocity agreements may exist, the SPP specifies the three-condition framework (TSP + DoLE + local RLA) regardless of reciprocity.",
      correct:
        "Foreign architects must satisfy three conditions: (1) obtain a Temporary/Special Permit from PRC, (2) secure DoLE work certification, and (3) collaborate with a local Registered and Licensed Architect. This three-condition framework protects both professional standards and local practitioners.",
      takeaway:
        "Foreign architects need TSP + DoLE permit + local RLA collaboration.",
    },
    0.5,
    "understand",
    "SPP 200 / R.A. 9266"
  ),
  q(
    DOCS.uap_overview.articleId,
    "SPP Document 208 (Architectural Design Competition) replaces which 1979 UAP document?",
    [
      "UAP Doc. 207",
      "UAP Doc. 208",
      "UAP Doc. 209",
      "UAP Doc. 210",
    ],
    "c",
    {
      a: "UAP Doc. 207 is incorrect. The old Doc. 207 was replaced by SPP Doc. 206 (Comprehensive Architectural Services).",
      b: "UAP Doc. 208 is incorrect. The old Doc. 208 covered Interior Design fees and was replaced by Annex A, not SPP 208.",
      c: "Correct. SPP 208 (Architectural Design Competition) replaces the 1979 UAP Doc. 209. The numbering shifted in the 2010 revision.",
      d: "UAP Doc. 210 did not exist in the 1979 series.",
      correct:
        "SPP Doc. 208 (ADC) replaces the 1979 UAP Doc. 209. This is a tricky numbering shift: the old Doc. 208 (Interior Design) became Annex A, while the old Doc. 209 (ADC) became SPP 208.",
      takeaway:
        "SPP 208 (ADC) replaces old Doc. 209 — the numbering shifted when Interior Design moved to Annex A.",
    },
    0.7,
    "analyze",
    "SPP 200"
  ),
  q(
    DOCS.uap_overview.articleId,
    "What does the acronym IAPOA stand for in the context of Philippine architectural practice?",
    [
      "International Association of Professional Organizations of Architects",
      "Integrated Accredited Professional Organization of Architects",
      "Institute of Architectural Practitioners and Organizations Association",
      "International Architects and Planners Organization of Asia",
    ],
    "b",
    {
      a: "This is incorrect. IAPOA is a national, not international, organization.",
      b: "Correct. IAPOA stands for the Integrated Accredited Professional Organization of Architects, which is the UAP's formal designation under R.A. 9266.",
      c: "This is a fabricated name and does not match IAPOA's actual meaning.",
      d: "This is incorrect. IAPOA is specific to Philippine practice, not an Asia-wide body.",
      correct:
        "IAPOA stands for Integrated Accredited Professional Organization of Architects. Under R.A. 9266, the UAP serves as the IAPOA — the sole accredited professional organization for architects in the Philippines, responsible for professional standards and advocacy.",
      takeaway:
        "IAPOA = Integrated Accredited Professional Organization of Architects (i.e., the UAP).",
    },
    0.4,
    "remember",
    "R.A. 9266 / SPP 200"
  ),
  q(
    DOCS.uap_overview.articleId,
    "What does the acronym SPPCC stand for in the SPP framework?",
    [
      "Standards of Professional Practice Coordinating Committee",
      "Standards of Professional Practice Compliance Council",
      "Standards of Professional Practice Certification Commission",
      "Standards of Professional Practice Central Committee",
    ],
    "a",
    {
      a: "Correct. SPPCC stands for Standards of Professional Practice Coordinating Committee, the body that developed and maintains the SPP documents.",
      b: "Compliance Council is incorrect. The SPPCC coordinates the standards rather than enforcing compliance.",
      c: "Certification Commission is incorrect. Certification functions belong to the PRC-Board of Architecture, not the SPPCC.",
      d: "Central Committee is incorrect. The correct term is Coordinating Committee.",
      correct:
        "SPPCC stands for Standards of Professional Practice Coordinating Committee. This committee was responsible for drafting, reviewing, and coordinating all SPP documents in the 2010 series.",
      takeaway:
        "SPPCC = Standards of Professional Practice Coordinating Committee.",
    },
    0.4,
    "remember",
    "SPP 200"
  ),
  q(
    DOCS.uap_overview.articleId,
    "What registration requirements must an Architectural Firm satisfy to practice in the Philippines?",
    [
      "Registration with the Securities and Exchange Commission (SEC) only",
      "Registration with either DTI (sole proprietorship) or SEC (partnership/corporation), plus PRC firm registration",
      "Registration with the UAP and IAPOA only",
      "Registration with the Department of Trade and Industry (DTI) only",
    ],
    "b",
    {
      a: "SEC registration alone is insufficient. Sole proprietorships register with DTI, and all firms need PRC registration.",
      b: "Correct. Architectural firms must register with DTI (if sole proprietorship) or SEC (if partnership or corporation), and additionally secure PRC firm registration.",
      c: "UAP/IAPOA membership is professionally important but not the legal registration requirement for firms.",
      d: "DTI registration alone covers only sole proprietorships and omits the PRC requirement.",
      correct:
        "An Architectural Firm must register with DTI (for sole proprietorship) or SEC (for partnership/corporation), and must also obtain PRC firm registration. This dual registration ensures both business legitimacy and professional compliance.",
      takeaway:
        "Architectural firms need DTI or SEC registration PLUS PRC firm registration.",
    },
    0.5,
    "understand",
    "R.A. 9266 / SPP 200"
  ),
  q(
    DOCS.uap_overview.articleId,
    "How many SPP documents comprise the 2010 Standards of Professional Practice series, including Annex A?",
    [
      "9 documents",
      "10 documents",
      "10 documents plus Annex A (11 total)",
      "12 documents",
    ],
    "c",
    {
      a: "9 documents is incorrect. The series includes SPP 201 through 209 (9 numbered documents) plus Annex A.",
      b: "10 documents is incomplete. While there are 10 numbered items if you count SPP 200-209, the actual structure is SPP 201-209 plus Annex A.",
      c: "Correct. The 2010 SPP series consists of 10 numbered documents (SPP 201 through 209, with 204 split into 204-A and 204-B) plus Annex A (Interior Design Fee Schedule), for a total of 11.",
      d: "12 documents is incorrect. There are only 11 total components in the SPP series.",
      correct:
        "The 2010 SPP series comprises 10 numbered documents (SPP 201, 202, 203, 204-A, 204-B, 205, 206, 207, 208, 209) plus Annex A (Interior Design Fee Schedule), totaling 11 components.",
      takeaway:
        "The SPP series has 10 numbered documents + Annex A = 11 total.",
    },
    0.5,
    "remember",
    "SPP 200"
  ),
];

// ─── SPP 201 Questions ──────────────────────────────────────────────────────────

const spp201Questions: Question[] = [
  q(
    DOCS.spp201.articleId,
    "What is the range of the Man-Day Professional Equivalent (MDPE) multiplier for pre-design services under SPP 201?",
    ["1.0 to 2.0", "1.5 to 2.5", "2.0 to 3.0", "2.5 to 3.5"],
    "b",
    {
      a: "1.0 to 2.0 is too low. The MDPE multiplier starts at 1.5 to account for professional overhead and expertise.",
      b: "Correct. The MDPE multiplier ranges from 1.5 to 2.5, applied to the daily professional rate to compute compensation for pre-design services.",
      c: "2.0 to 3.0 is incorrect. While the upper range could apply in specialized cases, the standard SPP 201 range is 1.5 to 2.5.",
      d: "2.5 to 3.5 is incorrect. This range exceeds the SPP 201 specification and may be confused with SPP 209 salary cost multipliers.",
      correct:
        "The MDPE multiplier for SPP 201 pre-design services ranges from 1.5 to 2.5. This multiplier is applied to the architect's daily professional rate to compute fair compensation that covers overhead, expertise, and profit.",
      takeaway: "MDPE multiplier for pre-design = 1.5 to 2.5.",
    },
    0.5,
    "remember",
    "SPP 201"
  ),
  q(
    DOCS.spp201.articleId,
    "What distinguishes a pre-feasibility study from a feasibility study under SPP 201?",
    [
      "Pre-feasibility uses primary data; feasibility uses secondary data",
      "Pre-feasibility uses secondary data; feasibility uses primary data",
      "Both use primary data but at different scales",
      "Pre-feasibility is conducted by the owner; feasibility by the architect",
    ],
    "b",
    {
      a: "This reverses the actual distinction. Pre-feasibility relies on existing (secondary) data for preliminary assessment.",
      b: "Correct. Pre-feasibility studies use secondary (existing, published) data for preliminary assessment, while feasibility studies use primary (original, field-gathered) data for detailed analysis.",
      c: "Both studies do not use the same data type. The data source is the key differentiator.",
      d: "Both studies are conducted by the architect or qualified professionals, not distinguished by who performs them.",
      correct:
        "Under SPP 201, a pre-feasibility study uses secondary data (existing publications, statistics, prior studies) for a preliminary assessment, while a feasibility study uses primary data (original surveys, field investigations, market research) for a comprehensive evaluation.",
      takeaway:
        "Pre-feasibility = secondary data; Feasibility = primary data.",
    },
    0.6,
    "understand",
    "SPP 201"
  ),
  q(
    DOCS.spp201.articleId,
    "How many distinct pre-design services are enumerated under SPP 201?",
    ["8", "10", "12", "15"],
    "c",
    {
      a: "8 is too few. SPP 201 lists a more comprehensive set of pre-design services.",
      b: "10 is incorrect, though close. The actual count is 12 distinct services.",
      c: "Correct. SPP 201 enumerates 12 distinct pre-design services, ranging from consultation and site evaluation to programming and design brief preparation.",
      d: "15 is too many. The 12 pre-design services are sometimes confused with specialized services under SPP 203.",
      correct:
        "SPP 201 lists exactly 12 pre-design services. These include consultation, site selection/analysis, feasibility studies, pre-feasibility studies, value management, architectural programming, design brief preparation, and others.",
      takeaway: "SPP 201 has exactly 12 pre-design services.",
    },
    0.4,
    "remember",
    "SPP 201"
  ),
  q(
    DOCS.spp201.articleId,
    "Which compensation method is NOT applicable to pre-design services under SPP 201?",
    [
      "Percentage of Project Construction Cost (% of PCC)",
      "Per Diem / Man-Day Professional Equivalent",
      "Lump Sum / Fixed Fee",
      "Salary Cost multiplied by a factor",
    ],
    "a",
    {
      a: "Correct. Percentage of PCC is NOT used for pre-design services because the project construction cost is not yet determined at the pre-design stage.",
      b: "Per Diem / MDPE is a valid compensation method for pre-design services and is commonly used.",
      c: "Lump Sum / Fixed Fee is a valid compensation method for pre-design services when scope is clearly defined.",
      d: "Salary Cost multiplied by a factor is a valid compensation method for pre-design services, particularly for extended engagements.",
      correct:
        "Percentage of Project Construction Cost (% of PCC) cannot be used for pre-design services because the PCC has not yet been established at the pre-design phase. Other methods like MDPE, lump sum, and salary cost factor are appropriate.",
      takeaway:
        "% of PCC is NOT used for pre-design — the PCC does not exist yet at that stage.",
    },
    0.6,
    "apply",
    "SPP 201"
  ),
  q(
    DOCS.spp201.articleId,
    "Under SPP 201, what is the distance threshold beyond which travel expenses become reimbursable?",
    ["50 km", "75 km", "100 km", "150 km"],
    "c",
    {
      a: "50 km is the threshold under SPP 202 for per diem travel, not the reimbursable distance under SPP 201.",
      b: "75 km is not specified in any SPP document as a reimbursable threshold.",
      c: "Correct. Under SPP 201, travel expenses become reimbursable when the project site exceeds 100 km from the architect's office.",
      d: "150 km is incorrect. The 100 km threshold is the standard for pre-design reimbursable travel.",
      correct:
        "SPP 201 establishes a 100 km threshold for reimbursable travel expenses. When the project site is more than 100 km from the architect's principal office, travel costs become separately reimbursable by the Owner.",
      takeaway:
        "Pre-design reimbursable travel threshold = 100 km (vs. 50 km for SPP 202 per diem).",
    },
    0.5,
    "remember",
    "SPP 201"
  ),
  q(
    DOCS.spp201.articleId,
    "What is the primary purpose of Design Brief Preparation under SPP 201?",
    [
      "To establish the architect's design concept",
      "To prepare the owner's program of requirements",
      "To enable the owner to bid out or commission architectural services",
      "To conduct a feasibility study of the project site",
    ],
    "c",
    {
      a: "Design concept development occurs during the design phases under SPP 202, not during Design Brief Preparation.",
      b: "The program of requirements is the output of Architectural Programming, a separate pre-design service.",
      c: "Correct. Design Brief Preparation creates a comprehensive document that enables the owner to bid out or commission architectural design services from qualified architects.",
      d: "Feasibility studies are a separate pre-design service, not the purpose of Design Brief Preparation.",
      correct:
        "Design Brief Preparation under SPP 201 produces a document that allows the owner to bid out or commission architectural services. It defines project parameters, constraints, and requirements so prospective architects can prepare informed proposals.",
      takeaway:
        "Design Brief Preparation = document for bidding out architectural services.",
    },
    0.5,
    "understand",
    "SPP 201"
  ),
  q(
    DOCS.spp201.articleId,
    "What is the goal of Value Management (VM) as a pre-design service under SPP 201?",
    [
      "To reduce project cost by eliminating non-essential features",
      "To achieve the owner's unimpaired program at minimum cost",
      "To maximize the architect's fee through value engineering",
      "To evaluate alternative construction materials for cost savings",
    ],
    "b",
    {
      a: "Eliminating features is cost-cutting, not value management. VM preserves the full program while optimizing cost.",
      b: "Correct. Value Management aims to achieve the owner's complete, unimpaired program at minimum cost — maintaining all functional requirements while finding the most economical solutions.",
      c: "Maximizing fees is not the goal of VM. It serves the owner's interest in cost optimization.",
      d: "Material evaluation may be part of VM but is not its defining goal. VM focuses on achieving the full program at minimum cost.",
      correct:
        "Value Management under SPP 201 aims to achieve the owner's unimpaired program at minimum cost. The key concept is that VM does not reduce scope or quality — it finds the most economical way to deliver the complete program.",
      takeaway:
        "Value Management = unimpaired program at minimum cost (not scope reduction).",
    },
    0.5,
    "understand",
    "SPP 201"
  ),
  q(
    DOCS.spp201.articleId,
    "Which of the following must be included in the architect's written proposal for pre-design services under SPP 201?",
    [
      "Scope, timeline, deliverables, and fee only",
      "Scope, methodology, timeline, and fee",
      "Scope, personnel qualifications, insurance, and fee",
      "Scope, methodology, deliverables, and compensation (4 items)",
    ],
    "d",
    {
      a: "This list is close but omits methodology and misidentifies the fourth item. The SPP specifies deliverables as a required component.",
      b: "This list includes methodology but omits deliverables, which is a required component.",
      c: "Personnel qualifications and insurance are not among the four required items for the written proposal.",
      d: "Correct. The four required items in a written proposal for pre-design services are: scope of work, methodology, deliverables, and compensation terms.",
      correct:
        "SPP 201 requires four items in the architect's written proposal for pre-design services: (1) scope of work, (2) methodology, (3) deliverables, and (4) compensation. This ensures clarity and mutual understanding before engagement.",
      takeaway:
        "Written proposal = 4 items: scope, methodology, deliverables, compensation.",
    },
    0.6,
    "remember",
    "SPP 201"
  ),
  q(
    DOCS.spp201.articleId,
    "What are the three ways an architect may deliver pre-design services under SPP 201?",
    [
      "As lead consultant, as sub-consultant, or as joint venture partner",
      "As sole provider, as part of a multidisciplinary team, or through a consulting firm",
      "Independently, as part of regular design services, or through a separate pre-design contract",
      "As principal architect, as consulting architect, or as design-build provider",
    ],
    "c",
    {
      a: "These describe contracting structures, not the three delivery modes specified in SPP 201.",
      b: "While related, this does not match the SPP 201 specification for pre-design delivery modes.",
      c: "Correct. Pre-design services may be delivered: (1) independently as standalone services, (2) as part of regular design services under SPP 202, or (3) through a separate pre-design contract.",
      d: "These describe architect roles, not delivery modes for pre-design services.",
      correct:
        "SPP 201 specifies three delivery modes for pre-design services: independently (standalone engagement), as part of regular design services (bundled with SPP 202), or through a separate pre-design contract (formal agreement before design engagement).",
      takeaway:
        "Three delivery modes: independently, within SPP 202, or via separate contract.",
    },
    0.5,
    "understand",
    "SPP 201"
  ),
  q(
    DOCS.spp201.articleId,
    "What is the primary output of Architectural Programming as a pre-design service under SPP 201?",
    [
      "A schematic design concept",
      "A project feasibility report",
      "A Program of Requirements (POR)",
      "A design brief for bidding",
    ],
    "c",
    {
      a: "Schematic design is part of SPP 202 Regular Design Services, not a pre-design output.",
      b: "A feasibility report is the output of a feasibility study, a separate pre-design service.",
      c: "Correct. Architectural Programming produces a Program of Requirements (POR) that defines the functional, spatial, and performance requirements of the project.",
      d: "A design brief for bidding is the output of Design Brief Preparation, a different pre-design service.",
      correct:
        "Architectural Programming under SPP 201 produces a Program of Requirements (POR). The POR systematically defines the project's functional needs, spatial requirements, adjacencies, and performance criteria — serving as the foundation for design.",
      takeaway:
        "Architectural Programming output = Program of Requirements (POR).",
    },
    0.4,
    "remember",
    "SPP 201"
  ),
];

// ─── SPP 202 Questions ──────────────────────────────────────────────────────────

const spp202Questions: Question[] = [
  q(
    DOCS.spp202.articleId,
    "How many phases comprise the Regular Design Services under SPP 202?",
    ["4 phases", "5 phases", "6 phases", "7 phases"],
    "c",
    {
      a: "4 phases is too few. SPP 202 has a more detailed phasing structure.",
      b: "5 phases is incorrect. SPP 202 specifies 6 distinct phases.",
      c: "Correct. SPP 202 defines 6 phases: (1) Schematic Design, (2) Design Development, (3) Contract Documents, (4) Bidding/Negotiation, (5) Construction, and (6) Post-Construction.",
      d: "7 phases is too many. The SPP 202 structure has exactly 6 phases.",
      correct:
        "Regular Design Services under SPP 202 consist of 6 phases: Schematic Design, Design Development, Contract Documents, Bidding/Negotiation, Construction Phase Services, and Post-Construction Phase Services.",
      takeaway:
        "SPP 202 has 6 phases: SD, DD, CD, Bidding, Construction, Post-Construction.",
    },
    0.4,
    "remember",
    "SPP 202"
  ),
  q(
    DOCS.spp202.articleId,
    "Under SPP 202, when the Contract Documents Phase represents 90% of the total work, how much of the design fee is the architect entitled to at that point?",
    ["75% of the total fee", "80% of the total fee", "85% of the total fee", "90% of the total fee"],
    "d",
    {
      a: "75% is incorrect. The fee entitlement corresponds proportionally to the work completed.",
      b: "80% is incorrect. SPP 202 ties fee entitlement to the percentage of work completed.",
      c: "85% is incorrect. The principle under SPP 202 is direct proportionality.",
      d: "Correct. When the Contract Documents phase represents 90% of the total architectural work, the architect is entitled to 90% of the total design fee at that milestone.",
      correct:
        "Under SPP 202, fee entitlement is proportional to work completed. Since the Contract Documents phase represents 90% of the total architectural work, the architect is entitled to 90% of the total design fee upon completion of this phase.",
      takeaway:
        "Contract Documents = 90% of work = 90% of fee entitlement.",
    },
    0.5,
    "understand",
    "SPP 202"
  ),
  q(
    DOCS.spp202.articleId,
    "What is the minimum design fee percentage for Group 4 (Residences) under SPP 202?",
    ["7% of PCC", "8% of PCC", "10% of PCC", "12% of PCC"],
    "c",
    {
      a: "7% applies to simpler building groups, not residences which require more detailed design.",
      b: "8% is incorrect for Group 4. Residences command a higher fee due to their design complexity and customization.",
      c: "Correct. Group 4 (Residences) has a minimum design fee of 10% of PCC, reflecting the intensive, personalized design attention residences require.",
      d: "12% is incorrect for Group 4. While some specialized buildings may reach this rate, residences are at 10%.",
      correct:
        "Group 4 (Residences) under SPP 202 carries a minimum design fee of 10% of PCC. Residences command a higher percentage than commercial buildings because of the individualized design, multiple custom details, and intensive client interaction required.",
      takeaway: "Group 4 (Residences) fee = 10% of PCC.",
    },
    0.5,
    "remember",
    "SPP 202"
  ),
  q(
    DOCS.spp202.articleId,
    "Under SPP 202, what is the fee rate for Group 9 (Alterations, Renovations, and Additions)?",
    [
      "Same rate as the applicable Group 1-5 category",
      "125% of the applicable Group 1-5 rate",
      "150% of the applicable Group 1-5 rate",
      "200% of the applicable Group 1-5 rate",
    ],
    "c",
    {
      a: "The same rate is insufficient because alterations involve additional complexity of working within existing structures.",
      b: "125% is incorrect. The premium for alteration work is higher than 25% above base rate.",
      c: "Correct. Group 9 (Alterations) fee is 150% of the applicable Group 1-5 rate, reflecting the added complexity of working within existing buildings.",
      d: "200% is too high. While alterations are complex, the SPP sets the premium at 150%, not double.",
      correct:
        "Group 9 (Alterations, Renovations, and Additions) carries a fee of 150% of the applicable Group 1-5 rate. The 50% premium recognizes the additional complexity of surveying existing conditions, working around occupied spaces, and integrating new work with old.",
      takeaway:
        "Group 9 (Alterations) = 150% of the applicable Group 1-5 rate.",
    },
    0.6,
    "apply",
    "SPP 202"
  ),
  q(
    DOCS.spp202.articleId,
    "What is the minimum fee percentage for Group 8 (Buildings Requiring Extensive Detail) under SPP 202?",
    ["10% of PCC", "12% of PCC", "15% of PCC", "18% of PCC"],
    "c",
    {
      a: "10% applies to Group 4 (Residences), not Group 8.",
      b: "12% is incorrect. Group 8 buildings requiring extensive detail have a higher fee rate.",
      c: "Correct. Group 8 (Buildings Requiring Extensive Detail) has a minimum fee of 15% of PCC, the highest standard group rate in SPP 202.",
      d: "18% exceeds the SPP 202 specification for Group 8. While negotiable, the minimum is 15%.",
      correct:
        "Group 8 (Buildings Requiring Extensive Detail) carries the highest standard group rate at 15% of PCC. This applies to buildings like museums, theaters, and laboratories that require exceptionally detailed and specialized architectural work.",
      takeaway:
        "Group 8 (Extensive Detail buildings) = 15% of PCC — highest group rate.",
    },
    0.5,
    "remember",
    "SPP 202"
  ),
  q(
    DOCS.spp202.articleId,
    "How many sets of construction drawings are required for a building permit application under SPP 202?",
    ["5 sets", "6 sets", "7 sets", "8 sets"],
    "c",
    {
      a: "5 sets is insufficient for a building permit application under SPP 202.",
      b: "6 sets is incorrect. SPP 202 specifies a higher number.",
      c: "Correct. SPP 202 requires 7 sets of construction drawings for a building permit application.",
      d: "8 sets exceeds the SPP 202 requirement for building permit drawings.",
      correct:
        "SPP 202 requires the architect to prepare 7 sets of construction drawings for building permit application. These sets are distributed among various reviewing agencies and the owner.",
      takeaway: "Building permit requires 7 sets of construction drawings.",
    },
    0.4,
    "remember",
    "SPP 202"
  ),
  q(
    DOCS.spp202.articleId,
    "Under SPP 202, is the architect required to provide continuous 8-hour on-site supervision during construction?",
    [
      "Yes, the architect must be present for 8 hours daily",
      "No, SPP 202 requires only periodic site visits, not continuous supervision",
      "Yes, but only during critical construction phases",
      "No, supervision is optional under SPP 202",
    ],
    "b",
    {
      a: "Continuous 8-hour supervision is NOT required under SPP 202. This is the scope of SPP 204-A (Fulltime Supervision).",
      b: "Correct. SPP 202 requires only periodic site visits during construction, not continuous 8-hour daily supervision. Full-time supervision is a separate service under SPP 204-A.",
      c: "Even during critical phases, SPP 202 does not mandate continuous presence. That level of supervision falls under SPP 204-A.",
      d: "Supervision is not optional — periodic visits ARE required under SPP 202. But continuous 8-hour supervision is not.",
      correct:
        "SPP 202 requires periodic site visits during construction, not continuous 8-hour supervision. Full-time construction supervision (daily 8-hour presence) is a separate, additional service covered under SPP 204-A and compensated separately.",
      takeaway:
        "SPP 202 = periodic visits only. Continuous 8-hour supervision = SPP 204-A (separate fee).",
    },
    0.6,
    "analyze",
    "SPP 202 / SPP 204-A"
  ),
  q(
    DOCS.spp202.articleId,
    "Under SPP 202, through whom must the Owner communicate instructions to the contractor?",
    [
      "Directly to the contractor",
      "Through the project manager",
      "Through the Architect",
      "Through the construction manager",
    ],
    "c",
    {
      a: "Direct owner-to-contractor communication bypasses the architect's authority and is not permitted under SPP 202.",
      b: "The project manager route applies under SPP 206 (CAS), not as the standard under SPP 202.",
      c: "Correct. Under SPP 202, all Owner instructions to the contractor must flow through the Architect, preserving the architect's authority over design intent and construction quality.",
      d: "The construction manager route applies under SPP 204-B, not as the standard under SPP 202.",
      correct:
        "SPP 202 establishes that all Owner orders and instructions to the contractor must flow through the Architect. This ensures the architect maintains authority over design intent, construction quality, and contract administration.",
      takeaway:
        "Owner orders to contractor must flow through the Architect under SPP 202.",
    },
    0.5,
    "understand",
    "SPP 202"
  ),
  q(
    DOCS.spp202.articleId,
    "Under SPP 202, what radial distance from the architect's office triggers per diem travel compensation?",
    ["25 km", "50 km", "75 km", "100 km"],
    "b",
    {
      a: "25 km is too short. The SPP 202 threshold allows for reasonable local travel without additional compensation.",
      b: "Correct. SPP 202 specifies that per diem travel compensation is triggered when the project site exceeds 50 km radial distance from the architect's principal office.",
      c: "75 km is incorrect. The threshold is lower at 50 km.",
      d: "100 km is the reimbursable travel threshold under SPP 201 for pre-design services, not the per diem trigger under SPP 202.",
      correct:
        "Under SPP 202, per diem travel compensation is triggered when the project site is beyond 50 km radial distance from the architect's principal office. This is distinct from the 100 km threshold in SPP 201 for reimbursable pre-design travel.",
      takeaway:
        "SPP 202 per diem travel threshold = 50 km (vs. SPP 201 reimbursable = 100 km).",
    },
    0.5,
    "remember",
    "SPP 202"
  ),
  q(
    DOCS.spp202.articleId,
    "Under SPP 202, what happens to the architect's fee if construction is suspended for more than 6 months?",
    [
      "The fee remains unchanged",
      "The fee is increased by 25%",
      "The fee is doubled for the remaining work",
      "The contract is automatically terminated",
    ],
    "c",
    {
      a: "Unchanged fees do not compensate the architect for the disruption and carrying costs of a prolonged suspension.",
      b: "A 25% increase is insufficient under SPP 202 for suspensions exceeding 6 months.",
      c: "Correct. Under SPP 202, if construction is suspended for more than 6 months, the architect's fee for the remaining work is doubled to compensate for the disruption, remobilization, and extended engagement period.",
      d: "Automatic termination is not specified. The contract continues but with adjusted compensation.",
      correct:
        "SPP 202 provides that when construction is suspended for more than 6 months, the architect's fee for the remaining work is doubled. This compensates for the disruption to the architect's practice, the need to remobilize, and the extended engagement period.",
      takeaway:
        "Construction suspension > 6 months = architect's remaining fee is doubled.",
    },
    0.6,
    "apply",
    "SPP 202"
  ),
];

// ─── SPP 203 Questions ──────────────────────────────────────────────────────────

const spp203Questions: Question[] = [
  q(
    DOCS.spp203.articleId,
    "How many specialized architectural services are enumerated under SPP 203?",
    ["15", "18", "23", "25"],
    "c",
    {
      a: "15 is too few. SPP 203 has a more extensive list of specialized services.",
      b: "18 is incorrect. The actual count is 23 distinct specialized services.",
      c: "Correct. SPP 203 enumerates 23 specialized architectural services, each separately compensated from regular design services.",
      d: "25 is incorrect. The precise count is 23 services.",
      correct:
        "SPP 203 lists exactly 23 specialized architectural services. These range from interior design and landscape architecture to forensic architecture and building environmental certification.",
      takeaway: "SPP 203 has exactly 23 specialized services.",
    },
    0.4,
    "remember",
    "SPP 203"
  ),
  q(
    DOCS.spp203.articleId,
    "Under SPP 203, a Consulting Architect providing specialized services may hold a Specialist Certificate from which bodies?",
    [
      "PRC and DTI",
      "PRBoA and IAPOA",
      "SEC and UAP",
      "DoLE and CHED",
    ],
    "b",
    {
      a: "PRC and DTI handle general registration and business registration, not specialist certification.",
      b: "Correct. A Consulting Architect may hold a Specialist Certificate issued by the Professional Regulatory Board of Architecture (PRBoA) and/or the IAPOA.",
      c: "SEC handles corporate registration and UAP is the professional organization, but neither issues specialist certificates.",
      d: "DoLE handles employment permits and CHED handles education — neither issues specialist architectural certificates.",
      correct:
        "Under SPP 203, a Consulting Architect providing specialized services may hold a Specialist Certificate from the PRBoA (Professional Regulatory Board of Architecture) and/or the IAPOA (Integrated Accredited Professional Organization of Architects).",
      takeaway:
        "Specialist Certificate sources: PRBoA and/or IAPOA.",
    },
    0.5,
    "understand",
    "SPP 203 / R.A. 9266"
  ),
  q(
    DOCS.spp203.articleId,
    "How is one man-month calculated under SPP 203?",
    [
      "20 days x 8 hours = 160 hours",
      "22 days x 8 hours = 176 hours",
      "25 days x 8 hours = 200 hours",
      "30 days x 8 hours = 240 hours",
    ],
    "b",
    {
      a: "160 hours (20 days) is incorrect. SPP 203 uses 22 working days per month.",
      b: "Correct. SPP 203 defines one man-month as 22 working days multiplied by 8 hours per day, equaling 176 hours.",
      c: "200 hours (25 days) exceeds the SPP 203 specification. Not all calendar days are working days.",
      d: "240 hours (30 days) is incorrect as it counts all calendar days, not working days.",
      correct:
        "Under SPP 203, one man-month is calculated as 22 working days multiplied by 8 hours per day, totaling 176 hours. This standard is used for computing salary-based compensation for specialized services.",
      takeaway: "One man-month = 22 days x 8 hours = 176 hours.",
    },
    0.4,
    "remember",
    "SPP 203"
  ),
  q(
    DOCS.spp203.articleId,
    "What does Forensic Architecture (SPP 203.13) primarily investigate?",
    [
      "Criminal activities in buildings",
      "Historical significance of architectural structures",
      "Causes of building deterioration, failure, or collapse",
      "Archaeological remains beneath building foundations",
    ],
    "c",
    {
      a: "Criminal investigation is not within the scope of Forensic Architecture. The term 'forensic' here relates to technical investigation, not criminal law.",
      b: "Historical significance assessment falls under heritage conservation, not forensic architecture.",
      c: "Correct. Forensic Architecture under SPP 203.13 investigates the causes of building deterioration, structural failure, or collapse through systematic technical analysis.",
      d: "Archaeological investigation is a separate discipline unrelated to forensic architecture.",
      correct:
        "Forensic Architecture (SPP 203.13) is a specialized service that investigates the causes of building deterioration, failure, or collapse. It involves systematic technical analysis to determine why a building has degraded or failed, often for insurance, litigation, or remediation purposes.",
      takeaway:
        "Forensic Architecture = investigating causes of building deterioration/failure.",
    },
    0.5,
    "understand",
    "SPP 203"
  ),
  q(
    DOCS.spp203.articleId,
    "What type of rating system does Building Environmental Certification under SPP 203 use?",
    [
      "A pass/fail inspection system",
      "A credit-based rating system",
      "A percentile ranking system",
      "A tiered licensing system",
    ],
    "b",
    {
      a: "Pass/fail is too binary for environmental certification, which evaluates multiple sustainability criteria.",
      b: "Correct. Building Environmental Certification uses a credit-based rating system where buildings earn credits across various sustainability categories to achieve certification levels.",
      c: "Percentile ranking compares buildings against each other, which is not how environmental certification works.",
      d: "Tiered licensing is a regulatory concept, not applicable to environmental certification.",
      correct:
        "Building Environmental Certification under SPP 203 uses a credit-based rating system (similar to LEED, BERDE, or Green Mark). Buildings earn credits across categories like energy efficiency, water conservation, materials, and indoor environmental quality.",
      takeaway:
        "Building Environmental Certification = credit-based rating system.",
    },
    0.5,
    "understand",
    "SPP 203"
  ),
  q(
    DOCS.spp203.articleId,
    "In how many manners may an architect provide specialized services under SPP 203?",
    [
      "One: as an independent consultant only",
      "Two: in dual capacity (designer + specialist) or as consulting architect only",
      "Three: independently, as sub-consultant, or as joint venture partner",
      "Four: as lead, sub-consultant, joint venture, or independent specialist",
    ],
    "b",
    {
      a: "Independent consulting is only one of the two recognized manners.",
      b: "Correct. SPP 203 recognizes two manners: (1) dual capacity, where the architect serves as both the regular designer and specialist, and (2) as consulting architect only, providing specialized expertise to another architect's project.",
      c: "Three manners is incorrect. SPP 203 specifies exactly two delivery manners.",
      d: "Four manners is incorrect and overcomplicates the SPP 203 framework.",
      correct:
        "SPP 203 specifies two manners of providing specialized services: (1) in dual capacity — the architect performs both regular design (SPP 202) and specialized services simultaneously, and (2) as consulting architect only — providing specialized expertise on another architect's project.",
      takeaway:
        "Two manners: dual capacity (designer + specialist) or consulting architect only.",
    },
    0.5,
    "understand",
    "SPP 203"
  ),
  q(
    DOCS.spp203.articleId,
    "Are SPP 203 specialized services included in the regular design fee under SPP 202?",
    [
      "Yes, they are bundled into the SPP 202 design fee",
      "No, they are always separately compensated from SPP 202",
      "Only if performed by the same architect",
      "Only for projects below a certain PCC threshold",
    ],
    "b",
    {
      a: "Bundling is incorrect. SPP 203 services require separate compensation regardless of the engagement structure.",
      b: "Correct. SPP 203 specialized services are always separately compensated from the SPP 202 regular design fee, even when performed by the same architect in dual capacity.",
      c: "Even when the same architect provides both, SPP 203 services are separately compensated.",
      d: "There is no PCC threshold exception. Separate compensation applies to all projects.",
      correct:
        "SPP 203 services are always separately compensated from SPP 202 design fees. This principle holds even when the same architect performs both regular and specialized services in dual capacity. The separate compensation reflects the distinct expertise and additional work involved.",
      takeaway:
        "SPP 203 services = always separately compensated from SPP 202 fees.",
    },
    0.6,
    "apply",
    "SPP 203"
  ),
  q(
    DOCS.spp203.articleId,
    "How many components are required in a Comprehensive Development Plan (CDP) under SPP 203?",
    [
      "3 components (Physical, Economic, Legal)",
      "4 components (Physical, Economic, Socio-Cultural, Transport)",
      "5 components (Physical, Economic, Socio-Cultural, Transport, Legal)",
      "6 components (Physical, Economic, Socio-Cultural, Transport, Legal, Environmental)",
    ],
    "c",
    {
      a: "3 components is insufficient. A CDP requires a more comprehensive analysis.",
      b: "4 components omits the Legal component, which is essential for land use and zoning compliance.",
      c: "Correct. A CDP under SPP 203 requires 5 components: Physical, Economic, Socio-Cultural, Transport/Infrastructure, and Legal/Institutional frameworks.",
      d: "6 components overspecifies. Environmental considerations are typically integrated within the Physical component.",
      correct:
        "A Comprehensive Development Plan under SPP 203 requires 5 components: (1) Physical/spatial planning, (2) Economic analysis, (3) Socio-Cultural assessment, (4) Transport/Infrastructure planning, and (5) Legal/Institutional framework compliance.",
      takeaway:
        "CDP = 5 components: Physical, Economic, Socio-Cultural, Transport, Legal.",
    },
    0.5,
    "remember",
    "SPP 203"
  ),
  q(
    DOCS.spp203.articleId,
    "Under which law is the Fire and Life Safety Assessment Report (FALAR) required, as referenced in SPP 203?",
    [
      "P.D. 1096 (National Building Code)",
      "R.A. 9266 (Architecture Act)",
      "R.A. 9514 (Fire Code of the Philippines)",
      "R.A. 9285 (ADR Act)",
    ],
    "c",
    {
      a: "P.D. 1096 is the National Building Code, which governs building construction but does not specifically mandate the FALAR.",
      b: "R.A. 9266 is the Architecture Act, which governs professional practice but does not create the FALAR requirement.",
      c: "Correct. The FALAR requirement is mandated under R.A. 9514, the Fire Code of the Philippines, which requires fire and life safety assessments for building occupancy and compliance.",
      d: "R.A. 9285 is the ADR (Alternative Dispute Resolution) Act, unrelated to fire safety.",
      correct:
        "The Fire and Life Safety Assessment Report (FALAR) is required under R.A. 9514 (Fire Code of the Philippines). This specialized service under SPP 203 involves comprehensive assessment of fire protection systems, egress, and life safety compliance.",
      takeaway: "FALAR is required under R.A. 9514 (Fire Code).",
    },
    0.6,
    "apply",
    "SPP 203 / R.A. 9514"
  ),
  q(
    DOCS.spp203.articleId,
    "Under which law does Dispute Avoidance/Resolution as a specialized service under SPP 203 operate?",
    [
      "R.A. 9266 (Architecture Act)",
      "R.A. 9184 (Government Procurement Reform Act)",
      "R.A. 9285 (Alternative Dispute Resolution Act)",
      "P.D. 1096 (National Building Code)",
    ],
    "c",
    {
      a: "R.A. 9266 governs the architecture profession but does not specifically govern dispute resolution procedures.",
      b: "R.A. 9184 governs government procurement, not general dispute resolution for architectural services.",
      c: "Correct. Dispute Avoidance/Resolution under SPP 203 operates under R.A. 9285, the Alternative Dispute Resolution (ADR) Act of 2004, which provides the legal framework for mediation, arbitration, and other ADR methods.",
      d: "P.D. 1096 is the National Building Code, unrelated to dispute resolution procedures.",
      correct:
        "Dispute Avoidance/Resolution as a specialized service operates under R.A. 9285, the ADR Act of 2004. This law provides the legal framework for alternative dispute resolution methods including mediation, conciliation, and arbitration in construction and architectural disputes.",
      takeaway: "Dispute Avoidance/Resolution = R.A. 9285 (ADR Act).",
    },
    0.5,
    "apply",
    "SPP 203 / R.A. 9285"
  ),
];

// ─── SPP 204-A Questions ────────────────────────────────────────────────────────

const spp204aQuestions: Question[] = [
  q(
    DOCS.spp204a.articleId,
    "Under SPP 204-A, who hires the Construction Supervision Group (CSG), and to whom is the CSG answerable?",
    [
      "Hired by the Architect, answerable to the Owner only",
      "Hired by the Owner, answerable to both the Owner and the Architect",
      "Hired by the Contractor, answerable to the Owner only",
      "Hired by the Owner, answerable to the Architect only",
    ],
    "b",
    {
      a: "The Architect does not hire the CSG. The employment relationship is between the Owner and the CSG.",
      b: "Correct. Under SPP 204-A, the CSG is hired by the Owner but is answerable to both the Owner and the Architect, establishing a dual accountability structure.",
      c: "The Contractor does not hire the CSG. This would create a conflict of interest in supervision.",
      d: "While the Owner hires the CSG, the CSG is answerable to both the Owner and the Architect, not just the Architect.",
      correct:
        "The CSG is hired by the Owner but maintains dual accountability to both the Owner and the Architect. This structure ensures the Owner's investment is protected while the Architect's design intent is faithfully executed during construction.",
      takeaway:
        "CSG: hired by Owner, answerable to both Owner AND Architect.",
    },
    0.5,
    "understand",
    "SPP 204-A"
  ),
  q(
    DOCS.spp204a.articleId,
    "What does Article 1723 of the Civil Code, as referenced in SPP 204-A, establish regarding architect liability?",
    [
      "5-year warranty period with individual liability",
      "10-year warranty period with joint liability",
      "15-year period with solidary liability among engineer, architect, and contractor",
      "20-year period with limited liability for architects only",
    ],
    "c",
    {
      a: "5 years with individual liability is incorrect. Article 1723 establishes a longer period and broader liability.",
      b: "10 years with joint liability is incorrect on both counts — the period is 15 years and the liability is solidary (joint and several).",
      c: "Correct. Article 1723 establishes a 15-year period of solidary (joint and several) liability among the engineer, architect, and contractor for structural defects.",
      d: "20 years is incorrect, and liability under Article 1723 extends to engineers and contractors, not just architects.",
      correct:
        "Article 1723 of the Civil Code establishes solidary (joint and several) liability among the engineer, architect, and contractor for a period of 15 years from project completion. This means each party can be held liable for the entire amount of damages for structural defects.",
      takeaway:
        "Article 1723: solidary liability, 15-year period, engineer + architect + contractor.",
    },
    0.6,
    "understand",
    "SPP 204-A / Civil Code Art. 1723"
  ),
  q(
    DOCS.spp204a.articleId,
    "What are the four scope areas of the Construction Supervision Group under SPP 204-A?",
    [
      "Design Review, Cost Estimation, Scheduling, Safety",
      "Quality Control, Evaluation, Daily Reports, Filing/Documentation",
      "Site Preparation, Material Testing, Labor Management, Handover",
      "Procurement, Logistics, Quality Assurance, Closeout",
    ],
    "b",
    {
      a: "Design review and cost estimation are not CSG scope areas. These fall under Design Development and Construction Management.",
      b: "Correct. The four CSG scope areas are: (1) Quality Control of construction work, (2) Evaluation of progress and performance, (3) Daily Reports on construction activities, and (4) Filing/Documentation of all records.",
      c: "Site preparation and labor management are contractor responsibilities, not CSG scope areas.",
      d: "Procurement and logistics are construction management functions under SPP 204-B, not CSG scope areas.",
      correct:
        "The CSG's four scope areas under SPP 204-A are: Quality Control (ensuring construction matches specifications), Evaluation (assessing progress and contractor performance), Daily Reports (documenting daily activities and issues), and Filing/Documentation (maintaining organized construction records).",
      takeaway:
        "CSG scope: Quality Control, Evaluation, Daily Reports, Filing.",
    },
    0.5,
    "remember",
    "SPP 204-A"
  ),
  q(
    DOCS.spp204a.articleId,
    "What minimum educational qualification is required for a CSG inspector under SPP 204-A?",
    [
      "A technical vocational diploma in construction",
      "A Bachelor of Science in Architecture (BS Arch) degree",
      "A master's degree in construction management",
      "Any engineering degree from a CHED-recognized school",
    ],
    "b",
    {
      a: "A vocational diploma is insufficient. SPP 204-A requires a professional degree.",
      b: "Correct. A CSG inspector must hold a Bachelor of Science in Architecture (BS Arch) degree, ensuring professional competence in architectural supervision.",
      c: "A master's degree is not required. The minimum is a BS Arch degree.",
      d: "An engineering degree does not substitute for the BS Arch requirement for CSG inspectors under SPP 204-A.",
      correct:
        "SPP 204-A requires CSG inspectors to hold a BS Architecture degree as a minimum qualification. This ensures inspectors have the architectural knowledge needed to verify that construction faithfully executes the architect's design intent.",
      takeaway: "CSG inspector minimum qualification = BS Arch degree.",
    },
    0.5,
    "remember",
    "SPP 204-A"
  ),
  q(
    DOCS.spp204a.articleId,
    "Under SPP 204-A, should the CSG assume the contractor's superintendent responsibility?",
    [
      "Yes, the CSG supervises all contractor personnel",
      "Yes, but only for quality-related matters",
      "No, the CSG shall NOT assume the contractor's superintendent responsibility",
      "No, unless the Owner specifically requests it in writing",
    ],
    "c",
    {
      a: "The CSG does not supervise contractor personnel. That is the superintendent's role.",
      b: "Even for quality matters, the CSG monitors and reports but does not assume the superintendent's management role.",
      c: "Correct. SPP 204-A explicitly states that the CSG shall NOT assume the contractor's superintendent responsibility. The CSG monitors and reports; the contractor's superintendent manages construction operations.",
      d: "There is no exception for Owner request. The prohibition is absolute under SPP 204-A.",
      correct:
        "SPP 204-A explicitly prohibits the CSG from assuming the contractor's superintendent responsibility. The CSG's role is to monitor, inspect, and report — not to manage or direct the contractor's workforce or operations.",
      takeaway:
        "CSG must NOT assume contractor's superintendent responsibility — monitor only.",
    },
    0.6,
    "understand",
    "SPP 204-A"
  ),
  q(
    DOCS.spp204a.articleId,
    "What is the key difference between SPP 202 construction phase services and SPP 204-A fulltime supervision?",
    [
      "SPP 202 requires weekly visits; SPP 204-A requires monthly visits",
      "SPP 202 requires periodic site visits; SPP 204-A requires daily 8-hour supervision",
      "SPP 202 covers structural inspection; SPP 204-A covers architectural inspection only",
      "SPP 202 is for private projects; SPP 204-A is for government projects only",
    ],
    "b",
    {
      a: "The frequency distinction is incorrect. SPP 202 is periodic (not specifically weekly) and SPP 204-A is daily.",
      b: "Correct. SPP 202 provides for periodic site visits during construction, while SPP 204-A mandates daily 8-hour continuous on-site supervision by the CSG.",
      c: "Both cover all aspects of architectural work, not divided by structural vs. architectural inspection.",
      d: "Both SPP 202 and 204-A apply to all project types, not distinguished by ownership.",
      correct:
        "The fundamental difference is intensity: SPP 202 requires periodic site visits (checking progress at intervals), while SPP 204-A mandates daily 8-hour continuous on-site supervision by qualified CSG inspectors. SPP 204-A is separately compensated.",
      takeaway:
        "SPP 202 = periodic visits; SPP 204-A = daily 8-hour continuous supervision.",
    },
    0.5,
    "analyze",
    "SPP 202 / SPP 204-A"
  ),
  q(
    DOCS.spp204a.articleId,
    "Under SPP 204-A, in how many arrangements can fulltime supervision services be provided?",
    [
      "One: through the CSG only",
      "Two: dual capacity (architect as supervisor) or consulting architect only",
      "Three: CSG, architect, or construction manager",
      "Four: CSG, architect, contractor's superintendent, or independent inspector",
    ],
    "b",
    {
      a: "CSG-only is just one of the two recognized arrangements.",
      b: "Correct. SPP 204-A recognizes two arrangements: (1) dual capacity, where the architect of record also provides fulltime supervision, and (2) consulting architect only, where a separate architect/firm provides supervision services.",
      c: "Three arrangements overspecifies. Construction management is covered under SPP 204-B.",
      d: "Four arrangements is incorrect and mixes roles from different SPP documents.",
      correct:
        "SPP 204-A provides for two arrangements: dual capacity (where the designing architect also supervises) and consulting architect only (where a separate professional provides supervision). Both require qualified CSG personnel.",
      takeaway:
        "Two arrangements: dual capacity or consulting architect only.",
    },
    0.5,
    "understand",
    "SPP 204-A"
  ),
  q(
    DOCS.spp204a.articleId,
    "What type of report must the CSG prepare daily under SPP 204-A?",
    [
      "Weekly Progress Report (WPR)",
      "Monthly Status Report (MSR)",
      "Daily Inspection Report (DIR)",
      "Construction Activity Log (CAL)",
    ],
    "c",
    {
      a: "Weekly reports are too infrequent for fulltime supervision. SPP 204-A requires daily reporting.",
      b: "Monthly reports are inadequate for the level of supervision SPP 204-A demands.",
      c: "Correct. The CSG must prepare Daily Inspection Reports (DIRs) documenting all construction activities, inspections, issues, and decisions for each working day.",
      d: "Construction Activity Log is not the term used in SPP 204-A. The specified document is the DIR.",
      correct:
        "SPP 204-A requires the CSG to prepare Daily Inspection Reports (DIRs) for every working day. DIRs document construction activities, inspection findings, material deliveries, weather conditions, workforce count, and any issues or directives.",
      takeaway:
        "CSG must prepare Daily Inspection Reports (DIRs) every working day.",
    },
    0.4,
    "remember",
    "SPP 204-A"
  ),
  q(
    DOCS.spp204a.articleId,
    "The modern CSG concept under SPP 204-A evolved from which traditional role?",
    [
      "Project Manager",
      "Site Engineer",
      "Clerk-of-Works",
      "Building Inspector",
    ],
    "c",
    {
      a: "Project Manager is a separate role covered under SPP 206, not the precursor to the CSG.",
      b: "Site Engineer is an engineering role, not the traditional architectural supervision role that evolved into the CSG.",
      c: "Correct. The CSG concept evolved from the traditional Clerk-of-Works role, modernizing and professionalizing on-site architectural supervision.",
      d: "Building Inspector is a government regulatory role, not the traditional predecessor of the CSG.",
      correct:
        "The Construction Supervision Group (CSG) under SPP 204-A evolved from the traditional Clerk-of-Works role. The modernization expanded the scope from a single clerk to a professional group, added formal qualifications, and structured the reporting framework.",
      takeaway:
        "CSG evolved from the traditional Clerk-of-Works role.",
    },
    0.4,
    "remember",
    "SPP 204-A"
  ),
  q(
    DOCS.spp204a.articleId,
    "How many compensation methods are available for fulltime supervision services under SPP 204-A?",
    ["3", "4", "5", "6"],
    "d",
    {
      a: "3 methods is too few. SPP 204-A provides more options for compensation flexibility.",
      b: "4 methods is incorrect. SPP 204-A specifies a more comprehensive set.",
      c: "5 methods is close but incomplete. The actual count is 6.",
      d: "Correct. SPP 204-A provides 6 compensation methods, giving flexibility to structure payment based on project characteristics and client preferences.",
      correct:
        "SPP 204-A provides 6 compensation methods for fulltime supervision services, offering flexibility to match compensation structure to project scale, duration, and complexity.",
      takeaway:
        "SPP 204-A has 6 compensation methods for fulltime supervision.",
    },
    0.5,
    "remember",
    "SPP 204-A"
  ),
];

// ─── SPP 204-B Questions ────────────────────────────────────────────────────────

const spp204bQuestions: Question[] = [
  q(
    DOCS.spp204b.articleId,
    "How do the responsibilities of a Construction Manager (CM) under SPP 204-B relate to those of the CSG under SPP 204-A?",
    [
      "CM responsibilities are a subset of CSG functions",
      "CM responsibilities are a superset of CSG (204-A) functions",
      "CM and CSG have completely separate, non-overlapping responsibilities",
      "CM replaces the CSG entirely on managed projects",
    ],
    "b",
    {
      a: "A subset would mean the CM does less than the CSG, which is incorrect. The CM does everything the CSG does and more.",
      b: "Correct. CM responsibilities are a superset of CSG functions — the CM performs all CSG duties plus additional management, coordination, cost control, and scheduling functions.",
      c: "There is significant overlap; the CM incorporates all CSG functions within its broader scope.",
      d: "The CM does not replace the CSG. The CM may hire or supervise a CSG as part of its team.",
      correct:
        "SPP 204-B positions Construction Management as a superset of CSG (SPP 204-A) functions. The CM performs all supervision duties plus additional management responsibilities including coordination, cost/time management, and comprehensive records management.",
      takeaway:
        "CM responsibilities = superset of CSG functions (does everything CSG does + more).",
    },
    0.6,
    "analyze",
    "SPP 204-A / SPP 204-B"
  ),
  q(
    DOCS.spp204b.articleId,
    "What are the four core functions of a Construction Manager under SPP 204-B?",
    [
      "Design, Procurement, Construction, Handover",
      "Coordination, Cost/Time Management, Quality Control, Records Management",
      "Planning, Scheduling, Budgeting, Risk Management",
      "Safety, Quality, Environment, Compliance",
    ],
    "b",
    {
      a: "Design is not a CM function. The CM manages construction, not design.",
      b: "Correct. The four core CM functions are: (1) Coordination of all project participants, (2) Cost and Time Management, (3) Quality Control of construction, and (4) Records Management and documentation.",
      c: "While related, this does not match the four core functions specified in SPP 204-B.",
      d: "Safety and environment are considerations within CM work but are not the four named core functions.",
      correct:
        "SPP 204-B defines four core CM functions: Coordination (managing relationships between all project participants), Cost/Time Management (budget and schedule control), Quality Control (ensuring construction quality), and Records Management (comprehensive documentation).",
      takeaway:
        "Four core CM functions: Coordination, Cost/Time, QC, Records.",
    },
    0.5,
    "remember",
    "SPP 204-B"
  ),
  q(
    DOCS.spp204b.articleId,
    "Under what conditions is the Construction Manager excluded from liability under SPP 204-B?",
    [
      "When the Owner fails to provide adequate funding",
      "When there are only 2 specific conditions: the CM was not consulted on the decision, or the CM's advice was overruled by the Owner",
      "When the contractor assumes full responsibility",
      "When force majeure events occur",
    ],
    "b",
    {
      a: "Funding issues alone do not trigger the CM's liability exclusion. The conditions are more specific.",
      b: "Correct. The CM is excluded from liability under 2 conditions: (1) when the CM was not consulted on a decision that led to the problem, or (2) when the CM's professional advice was given but overruled by the Owner.",
      c: "Contractor responsibility does not automatically exclude CM liability. The exclusion conditions are specific to the CM's role.",
      d: "Force majeure may affect contractual obligations but is not one of the two specific CM liability exclusion conditions.",
      correct:
        "SPP 204-B excludes the CM from liability under two specific conditions: (1) the CM was not consulted on the relevant decision, or (2) the CM provided professional advice that was overruled by the Owner. These protections ensure the CM is accountable only for matters within their control.",
      takeaway:
        "CM liability exclusion: not consulted, or advice was overruled by Owner.",
    },
    0.7,
    "analyze",
    "SPP 204-B"
  ),
  q(
    DOCS.spp204b.articleId,
    "Under SPP 204-B, may the Construction Manager impose methods that impair the Architect's design concept?",
    [
      "Yes, if it improves construction efficiency",
      "Yes, with the Owner's written approval",
      "No, the CM shall not impose methods that impair the Architect's design concept",
      "No, unless the Architect provides written consent",
    ],
    "c",
    {
      a: "Efficiency gains do not justify impairing the design concept. The architect's design integrity is protected.",
      b: "Even with Owner approval, the CM cannot impair the architect's design concept under SPP 204-B.",
      c: "Correct. SPP 204-B explicitly prohibits the CM from imposing construction methods or procedures that would impair the Architect's design concept, regardless of other considerations.",
      d: "The prohibition is absolute. Even architect consent does not change the SPP 204-B principle that design integrity must be maintained.",
      correct:
        "SPP 204-B establishes an absolute prohibition: the CM shall not impose construction methods or procedures that impair the Architect's design concept. This protects the architect's creative and professional authority over the design.",
      takeaway:
        "CM must NOT impose methods that impair the Architect's design concept — absolute prohibition.",
    },
    0.5,
    "understand",
    "SPP 204-B"
  ),
  q(
    DOCS.spp204b.articleId,
    "What qualifications must a Construction Manager possess under SPP 204-B?",
    [
      "Any engineering degree and 5 years of experience",
      "A state-regulated professional with managerial capability",
      "PRC-licensed architect with CM certification",
      "A contractor's license and project management diploma",
    ],
    "b",
    {
      a: "An engineering degree alone is not the qualification framework. SPP 204-B uses broader professional criteria.",
      b: "Correct. The CM must be a state-regulated professional (architect or engineer) with demonstrated managerial capability to handle the comprehensive management functions.",
      c: "While an architect can serve as CM, SPP 204-B does not require a specific CM certification.",
      d: "A contractor's license is for contracting, not construction management, which is a professional service.",
      correct:
        "SPP 204-B requires the CM to be a state-regulated professional (typically a licensed architect or engineer) with managerial capability. This dual requirement ensures both technical competence and management skill.",
      takeaway:
        "CM must be a state-regulated professional with managerial capability.",
    },
    0.5,
    "understand",
    "SPP 204-B"
  ),
  q(
    DOCS.spp204b.articleId,
    "Under SPP 204-B, what is the CM's relationship with the CSG?",
    [
      "The CM replaces the CSG entirely",
      "The CM may hire a CSG or supervise an owner-hired CSG",
      "The CM and CSG must be from different firms",
      "The CSG reports to the contractor, not the CM",
    ],
    "b",
    {
      a: "The CM does not replace the CSG. Both can coexist on a project.",
      b: "Correct. The CM may hire a CSG as part of the construction management team, or may supervise a CSG that was hired directly by the Owner.",
      c: "There is no requirement for separate firms. The CM may include CSG personnel within its organization.",
      d: "The CSG reports to the Owner and Architect (per SPP 204-A), and when a CM is engaged, the CSG may report to the CM.",
      correct:
        "Under SPP 204-B, the CM has flexibility in relating to the CSG: the CM may hire its own CSG team as part of the CM organization, or may supervise a CSG that was independently hired by the Owner under SPP 204-A.",
      takeaway:
        "CM may hire CSG or supervise owner-hired CSG.",
    },
    0.5,
    "understand",
    "SPP 204-B"
  ),
  q(
    DOCS.spp204b.articleId,
    "When a Project Manager also serves as Construction Manager, what fee range applies under SPP 206?",
    [
      "1-3% of PCC",
      "2-5% of PCC",
      "5-10% of PCC",
      "7-12% of PCC",
    ],
    "b",
    {
      a: "1-3% is below the SPP 206 fee range for combined PM/CM services.",
      b: "Correct. When the PM also serves as CM, the fee is 2-5% of PCC under SPP 206, recognizing the expanded scope of combined management services.",
      c: "5-10% exceeds the specified range. The PM/CM combined fee caps at 5% of PCC.",
      d: "7-12% is far too high. This exceeds even the design fee for many building groups.",
      correct:
        "When a Project Manager also serves as Construction Manager, SPP 206 specifies a fee of 2-5% of PCC. This combined fee covers both project management and construction management functions.",
      takeaway:
        "PM serving as CM = 2-5% of PCC under SPP 206.",
    },
    0.6,
    "apply",
    "SPP 204-B / SPP 206"
  ),
  q(
    DOCS.spp204b.articleId,
    "During which design phase should the CM begin pre-construction consultations under SPP 204-B?",
    [
      "Schematic Design phase",
      "Design Development phase",
      "Contract Documents phase",
      "Bidding/Negotiation phase",
    ],
    "b",
    {
      a: "Schematic Design is too early. The project is not sufficiently developed for meaningful CM input.",
      b: "Correct. CM pre-construction consultations should begin during the Design Development phase, when the design is sufficiently developed for constructability review and cost input.",
      c: "Contract Documents phase is too late for effective CM pre-construction input. By this point, major design decisions are finalized.",
      d: "Bidding/Negotiation is after design completion, far too late for pre-construction CM input.",
      correct:
        "SPP 204-B specifies that CM pre-construction consultations should begin during the Design Development phase. At this stage, the design is developed enough for the CM to provide meaningful input on constructability, cost implications, and scheduling.",
      takeaway:
        "CM pre-construction consultations begin during Design Development.",
    },
    0.5,
    "apply",
    "SPP 204-B"
  ),
  q(
    DOCS.spp204b.articleId,
    "Is the CM fee included in the architect's SPP 202 design fee?",
    [
      "Yes, CM is part of the regular design services",
      "No, CM services are separately compensated from the SPP 202 design fee",
      "Only if the architect also serves as CM",
      "Yes, but only for projects under 10 million PCC",
    ],
    "b",
    {
      a: "CM is not part of regular design services. It is a separate professional service.",
      b: "Correct. CM services under SPP 204-B are separately compensated from the SPP 202 design fee, regardless of whether the same architect performs both services.",
      c: "Even when the architect serves as CM, the services are separately compensated.",
      d: "There is no PCC threshold for bundling. Separate compensation applies to all projects.",
      correct:
        "Construction Management services under SPP 204-B are separately compensated from the architect's SPP 202 design fee. This principle of separate compensation applies regardless of project size or whether the same professional provides both design and CM services.",
      takeaway:
        "CM fee is always separate from SPP 202 design fee.",
    },
    0.5,
    "understand",
    "SPP 204-B / SPP 202"
  ),
  q(
    DOCS.spp204b.articleId,
    "To whom is the Construction Manager directly responsible under SPP 204-B?",
    [
      "To the Architect only",
      "To the Contractor only",
      "To the Owner on all construction aspects",
      "To the PRBoA for regulatory compliance",
    ],
    "b",
    {
      a: "While the CM coordinates with the Architect, the CM's primary responsibility is to the Owner.",
      b: "The CM has no direct responsibility to the Contractor. The Contractor is a separate party.",
      c: "Correct. The CM is directly responsible to the Owner on all construction aspects, serving as the Owner's representative in managing the construction process.",
      d: "PRBoA is the regulatory board, not the party to whom the CM is operationally responsible.",
      correct:
        "Under SPP 204-B, the Construction Manager is directly responsible to the Owner on all construction aspects. The CM serves as the Owner's representative in managing, coordinating, and controlling the construction process.",
      takeaway:
        "CM is directly responsible to the Owner on all construction aspects.",
    },
    0.4,
    "understand",
    "SPP 204-B"
  ),
];

// ─── SPP 205 Questions ──────────────────────────────────────────────────────────

const spp205Questions: Question[] = [
  q(
    DOCS.spp205.articleId,
    "What are the two major service clusters under SPP 205?",
    [
      "Building Design and Building Construction",
      "Building Administration and Post-Construction Evaluation",
      "Property Management and Facilities Engineering",
      "Maintenance Planning and Building Demolition",
    ],
    "b",
    {
      a: "Building Design and Construction are covered under SPP 202, not SPP 205.",
      b: "Correct. SPP 205 organizes post-construction services into two clusters: (1) Building Administration (ongoing management) and (2) Post-Construction Evaluation (assessment of completed work).",
      c: "While related, Property Management and Facilities Engineering are components within the clusters, not the cluster names themselves.",
      d: "Building Demolition is not covered under SPP 205.",
      correct:
        "SPP 205 organizes post-construction services into two clusters: Building Administration (ongoing building management, maintenance, and operations) and Post-Construction Evaluation (assessment of the completed building's performance and condition).",
      takeaway:
        "SPP 205 = two clusters: Building Administration + Post-Construction Evaluation.",
    },
    0.5,
    "remember",
    "SPP 205"
  ),
  q(
    DOCS.spp205.articleId,
    "What is the compensation range for Building Administration services under SPP 205?",
    [
      "2-4% of project construction cost",
      "4-6% of gross rentals (value/incentive-based)",
      "A flat monthly fee based on building area",
      "10% of the original SPP 202 design fee",
    ],
    "b",
    {
      a: "PCC-based compensation is for design services, not post-construction administration.",
      b: "Correct. Building Administration compensation is 4-6% of gross rentals, structured as a value/incentive-based fee tied to the building's revenue performance.",
      c: "While a flat fee may be negotiated, the SPP 205 standard is percentage of gross rentals.",
      d: "Tying to the design fee has no basis in SPP 205. Post-construction services have their own compensation structure.",
      correct:
        "SPP 205 establishes Building Administration compensation at 4-6% of gross rentals, using a value/incentive-based model. This ties the architect's compensation to the building's revenue performance, incentivizing effective administration.",
      takeaway:
        "Building Administration fee = 4-6% of gross rentals (incentive-based).",
    },
    0.6,
    "remember",
    "SPP 205"
  ),
  q(
    DOCS.spp205.articleId,
    "Under SPP 205, does Building Maintenance include security monitoring?",
    [
      "No, security is exclusively the Owner's responsibility",
      "No, security monitoring requires a separate SPP 203 engagement",
      "Yes, Building Maintenance includes security monitoring as part of comprehensive facility management",
      "Yes, but only for commercial buildings, not residential",
    ],
    "c",
    {
      a: "While the Owner has ultimate responsibility, the architect-administrator may include security monitoring in maintenance services.",
      b: "Security monitoring does not require a separate SPP 203 engagement when provided as part of SPP 205 Building Maintenance.",
      c: "Correct. Under SPP 205, Building Maintenance includes security monitoring as part of the comprehensive facility management services provided by the architect-administrator.",
      d: "The inclusion of security monitoring is not limited by building type. It applies to all Building Maintenance engagements.",
      correct:
        "SPP 205 includes security monitoring within the scope of Building Maintenance. As part of comprehensive facility management, the architect-administrator oversees security systems, access control, and safety monitoring alongside other maintenance functions.",
      takeaway:
        "Building Maintenance under SPP 205 includes security monitoring.",
    },
    0.5,
    "understand",
    "SPP 205"
  ),
  q(
    DOCS.spp205.articleId,
    "What is the primary goal of Business Development as a post-construction service under SPP 205?",
    [
      "To market the architect's services for future projects",
      "To maximize building occupancy and revenue",
      "To attract investors for building expansion",
      "To develop new construction projects on adjacent sites",
    ],
    "b",
    {
      a: "Marketing the architect's own services is not the purpose of Business Development under SPP 205.",
      b: "Correct. Business Development under SPP 205 aims to maximize building occupancy and revenue through tenant acquisition, retention strategies, and market positioning.",
      c: "Attracting investors for expansion is beyond the scope of SPP 205 Business Development.",
      d: "New construction development is outside SPP 205's post-construction scope.",
      correct:
        "Business Development under SPP 205 focuses on maximizing building occupancy and revenue. The architect-administrator works to attract and retain tenants, position the building competitively in the market, and optimize the building's income-generating potential.",
      takeaway:
        "SPP 205 Business Development = maximize building occupancy.",
    },
    0.5,
    "understand",
    "SPP 205"
  ),
  q(
    DOCS.spp205.articleId,
    "Under SPP 205, what triggers a Post-Construction Evaluation?",
    [
      "Automatic requirement at 5-year intervals",
      "Building permit renewal",
      "Owner's request",
      "Mandatory government inspection",
    ],
    "c",
    {
      a: "There is no automatic interval requirement. Evaluation is initiated by the Owner.",
      b: "Building permit renewal does not automatically trigger evaluation under SPP 205.",
      c: "Correct. Post-Construction Evaluation under SPP 205 is triggered upon the Owner's request, giving the Owner control over when to assess the building's performance.",
      d: "Government inspections are regulatory, not within the scope of SPP 205 Post-Construction Evaluation.",
      correct:
        "Post-Construction Evaluation under SPP 205 is initiated upon the Owner's request. This allows the Owner to commission an assessment of the building's performance, condition, and suitability whenever they deem it necessary.",
      takeaway:
        "Post-Construction Evaluation = triggered by Owner's request.",
    },
    0.4,
    "understand",
    "SPP 205"
  ),
  q(
    DOCS.spp205.articleId,
    "When forensic investigation is needed under SPP 205, which other SPP document is cross-referenced?",
    [
      "SPP 201 (Pre-Design Services)",
      "SPP 202 (Regular Design Services)",
      "SPP 203.13 (Forensic Architecture)",
      "SPP 204-A (Fulltime Supervision)",
    ],
    "c",
    {
      a: "SPP 201 covers pre-design services, not forensic investigation.",
      b: "SPP 202 covers regular design, not forensic investigation.",
      c: "Correct. SPP 205 cross-references SPP 203.13 (Forensic Architecture) for post-construction forensic investigations of building deterioration or failure.",
      d: "SPP 204-A covers construction supervision, not forensic investigation.",
      correct:
        "When post-construction forensic investigation is needed, SPP 205 cross-references SPP 203.13 (Forensic Architecture). This creates a link between post-construction evaluation and the specialized forensic investigation service.",
      takeaway:
        "Forensic investigation in SPP 205 cross-references SPP 203.13.",
    },
    0.5,
    "apply",
    "SPP 205 / SPP 203"
  ),
  q(
    DOCS.spp205.articleId,
    "Under SPP 205, what dual role may the architect serve in post-construction services?",
    [
      "Designer and Contractor",
      "Building Administrator and/or Property Manager",
      "Project Manager and Construction Manager",
      "Engineer and Architect simultaneously",
    ],
    "b",
    {
      a: "Architects do not serve as contractors. These are distinct professional roles.",
      b: "Correct. Under SPP 205, the architect may serve as Building Administrator and/or Property Manager, managing the building's operations, maintenance, and tenant relations.",
      c: "PM and CM are covered under SPP 206 and 204-B respectively, not SPP 205.",
      d: "Serving simultaneously as engineer and architect is not addressed by SPP 205.",
      correct:
        "SPP 205 allows the architect to serve in a dual role as Building Administrator and/or Property Manager. This recognizes the architect's comprehensive understanding of the building and ability to manage its ongoing operations.",
      takeaway:
        "Architect may serve as Building Administrator and/or Property Manager.",
    },
    0.4,
    "understand",
    "SPP 205"
  ),
  q(
    DOCS.spp205.articleId,
    "What does Grounds and Landscaping maintenance under SPP 205 specifically include?",
    [
      "Interior plant maintenance only",
      "Landscape design for new installations",
      "RROW (Right-of-Road-and-Other-Ways) maintenance",
      "Agricultural lot management",
    ],
    "c",
    {
      a: "Interior plants are a small component. The scope is broader, including exterior grounds.",
      b: "New landscape design is a design service under SPP 202 or 203, not maintenance under SPP 205.",
      c: "Correct. Grounds and Landscaping under SPP 205 includes RROW (Right-of-Road-and-Other-Ways) maintenance, covering the building's grounds, rights-of-way, and outdoor areas.",
      d: "Agricultural lot management is outside the scope of architectural post-construction services.",
      correct:
        "Grounds and Landscaping maintenance under SPP 205 specifically includes RROW (Right-of-Road-and-Other-Ways) maintenance. This covers upkeep of the building's grounds, surrounding landscape areas, rights-of-way, and exterior infrastructure.",
      takeaway:
        "Grounds & Landscaping = RROW maintenance.",
    },
    0.5,
    "remember",
    "SPP 205"
  ),
  q(
    DOCS.spp205.articleId,
    "What is the architect's role regarding Equipment Maintenance under SPP 205?",
    [
      "The architect directly maintains all building equipment",
      "The architect assists proper third parties in equipment maintenance",
      "The architect certifies equipment for insurance purposes only",
      "The architect has no role in equipment maintenance",
    ],
    "b",
    {
      a: "Direct maintenance is not the architect's role. Specialized technicians handle equipment.",
      b: "Correct. Under SPP 205, the architect assists proper third parties (specialized maintenance contractors and technicians) in equipment maintenance, coordinating and overseeing their work.",
      c: "Certification for insurance is not the primary equipment maintenance role under SPP 205.",
      d: "The architect does have a role — assisting and coordinating with maintenance specialists.",
      correct:
        "Under SPP 205, the architect's role in Equipment Maintenance is to assist proper third parties. The architect coordinates with specialized maintenance contractors and technicians, ensuring equipment is properly maintained without performing the technical work directly.",
      takeaway:
        "Equipment Maintenance: architect assists proper third parties.",
    },
    0.5,
    "understand",
    "SPP 205"
  ),
  q(
    DOCS.spp205.articleId,
    "What is SPP 205's position within the overall SPP document series?",
    [
      "It is the introductory document of the series",
      "It is a standalone document unrelated to other SPPs",
      "It is the final link in the SPP 201-205 service chain",
      "It replaces SPP 201 for renovation projects",
    ],
    "c",
    {
      a: "The introductory document is SPP 200 (Overview), not SPP 205.",
      b: "SPP 205 is not standalone — it is explicitly connected to SPP 201-204 as part of a service continuum.",
      c: "Correct. SPP 205 is the final link in the SPP 201-205 chain, completing the lifecycle of architectural services from pre-design through post-construction.",
      d: "SPP 205 does not replace any document. It complements the chain.",
      correct:
        "SPP 205 is the final link in the SPP 201-205 chain, completing the full lifecycle of architectural services: Pre-Design (201) > Regular Design (202) > Specialized Services (203) > Supervision (204-A/B) > Post-Construction (205).",
      takeaway:
        "SPP 205 = final link in the 201-205 service lifecycle chain.",
    },
    0.4,
    "understand",
    "SPP 205"
  ),
];

// ─── SPP 206 Questions ──────────────────────────────────────────────────────────

const spp206Questions: Question[] = [
  q(
    DOCS.spp206.articleId,
    "What is Comprehensive Architectural Services (CAS) under SPP 206?",
    [
      "A replacement for all individual SPP documents",
      "An umbrella of SPP 201-205 services under a Project Manager",
      "A specialized service for government projects only",
      "A new design methodology introduced in 2010",
    ],
    "b",
    {
      a: "CAS does not replace individual SPP documents. It integrates them under unified management.",
      b: "Correct. CAS is an umbrella that integrates SPP 201-205 services under the coordination of a Project Manager, providing comprehensive management across all project phases.",
      c: "CAS applies to all project types, not just government projects.",
      d: "CAS is not a design methodology but a management/coordination framework.",
      correct:
        "Comprehensive Architectural Services (CAS) under SPP 206 is an umbrella that integrates all services from SPP 201 through 205 under the coordination of a Project Manager. It adds a management layer without replacing the individual service documents.",
      takeaway:
        "CAS = umbrella of SPP 201-205 under a Project Manager.",
    },
    0.5,
    "understand",
    "SPP 206"
  ),
  q(
    DOCS.spp206.articleId,
    "What is the Project Manager's fee range under SPP 206?",
    [
      "1-3% of PCC",
      "2-5% of PCC",
      "5-8% of PCC",
      "7-10% of PCC",
    ],
    "b",
    {
      a: "1-3% is below the SPP 206 specification for PM fees.",
      b: "Correct. The Project Manager's fee under SPP 206 is 2-5% of PCC, separate from the SPP 202 design fee.",
      c: "5-8% exceeds the SPP 206 PM fee range.",
      d: "7-10% is far above the PM fee and may be confused with design fee rates.",
      correct:
        "SPP 206 specifies the PM fee at 2-5% of PCC, separate from the design fee. This compensates the PM for overall project coordination, cost control, scheduling, and management of the multidisciplinary team.",
      takeaway:
        "PM fee = 2-5% of PCC (separate from design fee).",
    },
    0.5,
    "remember",
    "SPP 206"
  ),
  q(
    DOCS.spp206.articleId,
    "Under SPP 206, is the Architect expected to perform all services personally?",
    [
      "Yes, the Architect must personally perform all services",
      "Yes, but may delegate non-critical tasks to staff",
      "No, the Architect is NOT expected to perform all services personally",
      "No, only if the project exceeds a certain PCC threshold",
    ],
    "c",
    {
      a: "Personal performance of all services is impractical for comprehensive projects. SPP 206 recognizes this.",
      b: "Delegation is not limited to non-critical tasks. The Architect coordinates a team of specialists.",
      c: "Correct. Under SPP 206, the Architect is explicitly NOT expected to perform all services personally. The CAS model recognizes that comprehensive projects require a multidisciplinary team.",
      d: "The principle applies regardless of PCC. It is inherent to the CAS framework.",
      correct:
        "SPP 206 explicitly states that the Architect is NOT expected to perform all services personally. The CAS model recognizes that comprehensive projects require diverse expertise, with the Architect serving as coordinator of a multidisciplinary team.",
      takeaway:
        "Architect is NOT expected to perform all CAS services personally.",
    },
    0.5,
    "understand",
    "SPP 206"
  ),
  q(
    DOCS.spp206.articleId,
    "What is the Project Manager's primary responsibility under SPP 206?",
    [
      "Design quality assurance",
      "Overall cost control",
      "Construction supervision",
      "Regulatory compliance",
    ],
    "b",
    {
      a: "Design quality is the designing architect's responsibility, not the PM's primary function.",
      b: "Correct. The PM's primary responsibility under SPP 206 is overall cost control — ensuring the project stays within budget across all phases.",
      c: "Construction supervision is covered under SPP 204-A/B. The PM coordinates but does not primarily supervise.",
      d: "Regulatory compliance is a component of project management but not the primary PM responsibility.",
      correct:
        "Under SPP 206, the Project Manager's primary responsibility is overall cost control. The PM monitors budgets, tracks expenditures, manages change orders, and ensures the project remains financially viable throughout all phases.",
      takeaway: "PM primary responsibility = overall cost control.",
    },
    0.5,
    "understand",
    "SPP 206"
  ),
  q(
    DOCS.spp206.articleId,
    "Does the PM's engagement under SPP 206 relieve designers and contractors of their individual duties?",
    [
      "Yes, the PM assumes overall responsibility for all parties",
      "Yes, but only during the construction phase",
      "No, the PM does not relieve designers or contractors of their duties",
      "No, except when the PM is also the designing architect",
    ],
    "c",
    {
      a: "The PM coordinates but does not assume individual parties' responsibilities.",
      b: "The PM does not relieve any party at any phase. Individual accountability is maintained.",
      c: "Correct. The PM does not relieve designers or contractors of their individual duties and responsibilities. Each party remains accountable for their own scope of work.",
      d: "There is no exception for dual-role situations. Individual duties remain.",
      correct:
        "SPP 206 makes clear that the PM's engagement does not relieve designers, contractors, or consultants of their individual duties and responsibilities. The PM coordinates and manages, but each party retains professional accountability for their work.",
      takeaway:
        "PM does NOT relieve designers/contractors of their duties.",
    },
    0.5,
    "understand",
    "SPP 206"
  ),
  q(
    DOCS.spp206.articleId,
    "What are the three dimensions of Architect primacy under SPP 206?",
    [
      "Designer, Builder, Owner's Representative",
      "Creator, Author, Coordinator",
      "Planner, Engineer, Administrator",
      "Consultant, Supervisor, Manager",
    ],
    "b",
    {
      a: "Builder is a contractor role, not a dimension of architect primacy.",
      b: "Correct. The three dimensions of Architect primacy are: Creator (originator of the design), Author (intellectual owner of the work), and Coordinator (integrator of all disciplines).",
      c: "Planner and Engineer are related roles but not the three dimensions specified in SPP 206.",
      d: "Consultant and Manager describe functions, not the primacy dimensions.",
      correct:
        "SPP 206 establishes three dimensions of Architect primacy: Creator (the originator and creative force behind the design), Author (the intellectual property holder and design authority), and Coordinator (the integrator who harmonizes all disciplines).",
      takeaway:
        "Three dimensions of Architect primacy: Creator, Author, Coordinator.",
    },
    0.5,
    "remember",
    "SPP 206"
  ),
  q(
    DOCS.spp206.articleId,
    "What is the OAEC Team Approach referenced in SPP 206?",
    [
      "A construction methodology for large projects",
      "A multidisciplinary collaboration framework including Owner, Architect, Engineer, and Contractor",
      "A quality assurance protocol for design review",
      "A government procurement method for public works",
    ],
    "b",
    {
      a: "OAEC is not a construction methodology but a collaborative team framework.",
      b: "Correct. The OAEC Team Approach is a multidisciplinary collaboration framework that includes the Owner, Architect, Engineer, and Contractor working together under the CAS umbrella.",
      c: "Quality assurance is a component but not the defining characteristic of the OAEC approach.",
      d: "OAEC is not a procurement method. It describes the collaborative relationship structure.",
      correct:
        "The OAEC Team Approach referenced in SPP 206 is a collaborative framework that brings together the Owner (O), Architect (A), Engineer (E), and Contractor (C) in a coordinated team structure under the CAS umbrella for comprehensive project delivery.",
      takeaway:
        "OAEC = Owner, Architect, Engineer, Contractor team collaboration.",
    },
    0.5,
    "understand",
    "SPP 206"
  ),
  q(
    DOCS.spp206.articleId,
    "During which design phase should the Project Manager ideally be engaged under SPP 206?",
    [
      "Pre-design phase (SPP 201)",
      "Design Development phase",
      "Contract Documents phase",
      "Construction phase",
    ],
    "b",
    {
      a: "Pre-design is too early. The PM engagement should begin when design activities are underway.",
      b: "Correct. The PM should ideally be engaged during the Design Development phase, allowing the PM to coordinate multidisciplinary inputs as the design takes detailed shape.",
      c: "Contract Documents phase is too late for effective PM integration into the project team.",
      d: "Construction phase is far too late. The PM needs to be involved well before construction begins.",
      correct:
        "SPP 206 recommends PM engagement during the Design Development phase. This timing allows the PM to influence project coordination, cost control, and scheduling as the design progresses from concept to detailed development.",
      takeaway:
        "PM engagement should begin during Design Development phase.",
    },
    0.5,
    "apply",
    "SPP 206"
  ),
  q(
    DOCS.spp206.articleId,
    "Does CAS under SPP 206 replace the individual services defined in SPP 201-205?",
    [
      "Yes, CAS is a standalone replacement for all individual SPP services",
      "Yes, but only for projects above a certain PCC threshold",
      "No, CAS adds a management layer but does not replace individual services",
      "No, CAS only applies to the construction phase",
    ],
    "c",
    {
      a: "CAS does not replace individual SPP documents. Each service retains its own scope and compensation.",
      b: "There is no PCC threshold. The relationship between CAS and individual SPPs is structural, not size-dependent.",
      c: "Correct. CAS adds a management and coordination layer over the individual SPP 201-205 services. Each individual service document retains its own scope, requirements, and compensation structure.",
      d: "CAS covers all project phases, not just construction.",
      correct:
        "CAS under SPP 206 adds a management layer — it does not replace individual SPP 201-205 services. Each service document retains its independent scope and compensation. CAS provides the coordination umbrella that integrates them into a comprehensive delivery framework.",
      takeaway:
        "CAS adds management layer — does NOT replace individual SPP services.",
    },
    0.5,
    "analyze",
    "SPP 206"
  ),
  q(
    DOCS.spp206.articleId,
    "How many professional types typically compose the multidisciplinary team under SPP 206 CAS?",
    ["5", "7", "10", "12"],
    "c",
    {
      a: "5 professionals is too few for a comprehensive multidisciplinary team.",
      b: "7 professionals is insufficient for the full CAS team composition.",
      c: "Correct. SPP 206 identifies 10 professional types in the multidisciplinary CAS team, reflecting the comprehensive nature of the services.",
      d: "12 professionals exceeds the SPP 206 specification.",
      correct:
        "SPP 206 identifies 10 professional types in the multidisciplinary CAS team. This typically includes the architect, structural engineer, mechanical engineer, electrical engineer, sanitary engineer, electronics engineer, interior designer, landscape architect, quantity surveyor, and project manager.",
      takeaway:
        "CAS multidisciplinary team = 10 professional types.",
    },
    0.5,
    "remember",
    "SPP 206"
  ),
];

// ─── SPP 207 Questions ──────────────────────────────────────────────────────────

const spp207Questions: Question[] = [
  q(
    DOCS.spp207.articleId,
    "What is the administration fee for Design-Build Services under DBS-A (SPP 207)?",
    ["5% of PCC", "7% of PCC", "10% of PCC", "12% of PCC"],
    "b",
    {
      a: "5% is below the SPP 207 DBS-A administration fee.",
      b: "Correct. The DBS-A administration fee is 7% of PCC, covering the architect's project administration role in the design-build delivery method.",
      c: "10% is the DBS-GMPCC fee, not the DBS-A administration fee.",
      d: "12% exceeds both DBS-A and DBS-GMPCC fee rates.",
      correct:
        "Under SPP 207, the DBS-A (Design-Build Services — Administration) fee is 7% of PCC. This covers the architect's administration of the design-build process, including design coordination, contractor oversight, and quality management.",
      takeaway: "DBS-A administration fee = 7% of PCC.",
    },
    0.5,
    "remember",
    "SPP 207"
  ),
  q(
    DOCS.spp207.articleId,
    "What is the fee for DBS-GMPCC (Guaranteed Maximum Project Construction Cost) under SPP 207?",
    ["5% of PCC", "7% of PCC", "10% of PCC", "15% of PCC"],
    "c",
    {
      a: "5% is too low for the GMPCC arrangement, which involves greater architect risk.",
      b: "7% is the DBS-A administration fee, not the DBS-GMPCC fee.",
      c: "Correct. DBS-GMPCC fee is 10% of PCC, reflecting the architect's increased risk and responsibility in guaranteeing the maximum construction cost.",
      d: "15% exceeds the SPP 207 GMPCC fee specification.",
      correct:
        "The DBS-GMPCC fee is 10% of PCC under SPP 207. This higher rate (compared to DBS-A's 7%) reflects the architect's greater financial risk in guaranteeing the maximum project construction cost to the Owner.",
      takeaway: "DBS-GMPCC fee = 10% of PCC.",
    },
    0.5,
    "remember",
    "SPP 207"
  ),
  q(
    DOCS.spp207.articleId,
    "How are GMPCC savings split between the Owner and Architect under SPP 207?",
    [
      "100% to the Owner",
      "70/30 in favor of the Owner",
      "50/50 between Owner and Architect",
      "60/40 in favor of the Architect",
    ],
    "c",
    {
      a: "Giving 100% to the Owner removes the architect's incentive to achieve savings.",
      b: "70/30 is not the SPP 207 split. The document specifies an equal division.",
      c: "Correct. GMPCC savings are split 50/50 between the Owner and the Architect, incentivizing the architect to find efficiencies while ensuring the Owner benefits equally.",
      d: "60/40 in favor of the Architect is incorrect. The split is equal.",
      correct:
        "Under SPP 207, when actual costs come in below the Guaranteed Maximum Project Construction Cost, the savings are split 50/50 between the Owner and the Architect. This equal split incentivizes the architect to achieve cost efficiencies.",
      takeaway: "GMPCC savings split = 50/50 (Owner and Architect).",
    },
    0.5,
    "remember",
    "SPP 207"
  ),
  q(
    DOCS.spp207.articleId,
    "Under SPP 207, what is the cost overrun tolerance, and how is the architect's liability capped?",
    [
      "5% tolerance; liability capped at design fee",
      "10% tolerance; liability capped at the administration fee",
      "15% tolerance; liability capped at 50% of the total fee",
      "No tolerance; architect bears full overrun cost",
    ],
    "b",
    {
      a: "5% tolerance is too restrictive, and liability is not capped at the full design fee.",
      b: "Correct. SPP 207 allows a 10% cost overrun tolerance, and the architect's liability for overruns is capped at the administration fee amount.",
      c: "15% tolerance exceeds the SPP 207 specification, and the liability cap is not 50% of total fee.",
      d: "Zero tolerance would make design-build commercially unviable. SPP 207 provides a reasonable margin.",
      correct:
        "SPP 207 establishes a 10% cost overrun tolerance for design-build services. If costs exceed the guaranteed amount by more than 10%, the architect's liability is capped at the administration fee, protecting the architect from unlimited financial exposure.",
      takeaway:
        "10% cost overrun tolerance; architect liability capped at admin fee.",
    },
    0.6,
    "apply",
    "SPP 207"
  ),
  q(
    DOCS.spp207.articleId,
    "Under SPP 207, does the Architect advance money for construction through the revolving fund?",
    [
      "Yes, the Architect funds construction from their own resources",
      "Yes, but only up to 20% of the PCC",
      "No, the Architect does NOT advance money — the revolving fund is Owner-funded",
      "No, financing is handled by a third-party lender",
    ],
    "c",
    {
      a: "The Architect does not use personal funds for construction. This would create unacceptable financial exposure.",
      b: "Even a limited advance is not required. The revolving fund mechanism keeps the Architect out of financing.",
      c: "Correct. Under SPP 207, the Architect does NOT advance money for construction. The revolving fund is funded by the Owner, and the Architect manages disbursements from it.",
      d: "Third-party lending is not the mechanism specified in SPP 207.",
      correct:
        "SPP 207 establishes a revolving fund mechanism where the Owner provides the construction funds. The Architect manages the fund and makes disbursements but does NOT advance their own money. This protects the architect from becoming a lender.",
      takeaway:
        "Architect does NOT advance money — revolving fund is Owner-funded.",
    },
    0.6,
    "understand",
    "SPP 207"
  ),
  q(
    DOCS.spp207.articleId,
    "How many construction administration tasks are defined under DBS-A in SPP 207?",
    ["5", "6", "8", "10"],
    "c",
    {
      a: "5 tasks is too few for comprehensive construction administration.",
      b: "6 tasks is incorrect. SPP 207 specifies a more comprehensive set.",
      c: "Correct. SPP 207 defines 8 construction administration tasks under DBS-A, covering all aspects of design-build project management.",
      d: "10 tasks exceeds the SPP 207 specification.",
      correct:
        "SPP 207 defines 8 construction administration tasks under DBS-A, encompassing the full range of administration duties in a design-build delivery model.",
      takeaway: "DBS-A has 8 construction administration tasks.",
    },
    0.4,
    "remember",
    "SPP 207"
  ),
  q(
    DOCS.spp207.articleId,
    "How does R.A. 4566 (Contractor's License Law) interface with SPP 207 design-build services?",
    [
      "It prohibits architects from offering design-build services",
      "It requires the architect to obtain a contractor's license",
      "It distinguishes professional architectural practice from construction contracting",
      "It has no relevance to SPP 207",
    ],
    "c",
    {
      a: "R.A. 4566 does not prohibit design-build. It creates a distinction between professional practice and contracting.",
      b: "The architect does not need a contractor's license. Design-build is a professional service, not contracting.",
      c: "Correct. R.A. 4566 distinguishes between professional architectural practice and construction contracting, clarifying that the architect's design-build role remains a professional service rather than a contracting business.",
      d: "R.A. 4566 is directly relevant as it defines the boundary between professional practice and contracting.",
      correct:
        "R.A. 4566 (Contractor's License Law) interfaces with SPP 207 by distinguishing professional architectural practice from construction contracting. The architect in design-build provides professional services, not contracting services, maintaining the distinction.",
      takeaway:
        "R.A. 4566 distinguishes architect's professional practice from contractor's business.",
    },
    0.6,
    "analyze",
    "SPP 207 / R.A. 4566"
  ),
  q(
    DOCS.spp207.articleId,
    "Under SPP 207, must the Architect retain a distinct professional identity as defined in SPP 200?",
    [
      "No, the architect becomes a contractor in design-build",
      "No, the design-build framework supersedes SPP 200",
      "Yes, the Architect must retain distinct professional identity per SPP 200",
      "Yes, but only when operating under DBS-GMPCC",
    ],
    "c",
    {
      a: "The architect never becomes a contractor. Professional identity must be maintained.",
      b: "SPP 207 does not supersede SPP 200. The foundational principles remain.",
      c: "Correct. Even in design-build, the Architect must retain their distinct professional identity as defined in SPP 200, maintaining the distinction between professional practice and contracting.",
      d: "The requirement applies to all design-build arrangements, not just GMPCC.",
      correct:
        "SPP 207 requires the Architect to retain distinct professional identity as defined in SPP 200, even when providing design-build services. This ensures the architect maintains professional standards, ethical obligations, and legal responsibilities regardless of delivery method.",
      takeaway:
        "Architect must retain professional identity in design-build — always per SPP 200.",
    },
    0.5,
    "understand",
    "SPP 207 / SPP 200"
  ),
  q(
    DOCS.spp207.articleId,
    "Under SPP 207, how is force majeure price escalation validated?",
    [
      "By the Owner's independent auditor",
      "By NEDA-certified price escalation data",
      "By mutual agreement between Architect and Contractor",
      "By PRC-Board of Architecture resolution",
    ],
    "b",
    {
      a: "An independent auditor is not the specified validation mechanism.",
      b: "Correct. Force majeure price escalation under SPP 207 must be validated through NEDA (National Economic and Development Authority)-certified price escalation data.",
      c: "Mutual agreement is insufficient without objective data backing.",
      d: "PRC-Board resolutions address professional practice, not price escalation.",
      correct:
        "SPP 207 requires force majeure price escalation to be validated through NEDA-certified data. This ensures that cost adjustments due to force majeure events (natural disasters, economic disruptions) are based on objective, government-verified economic data.",
      takeaway:
        "Force majeure price escalation validated by NEDA-certified data.",
    },
    0.6,
    "apply",
    "SPP 207"
  ),
  q(
    DOCS.spp207.articleId,
    "What dual professional responsibility does the Architect assume in design-build under SPP 207?",
    [
      "Design responsibility and financial liability",
      "Design responsibility and construction responsibility",
      "Creative responsibility and administrative responsibility",
      "Technical responsibility and legal responsibility",
    ],
    "b",
    {
      a: "Financial liability is capped, not a defining dual responsibility.",
      b: "Correct. In design-build, the Architect assumes dual professional responsibility for both design (as architect) and construction (as design-builder), covering the entire project delivery.",
      c: "Creative and administrative are aspects of design, not the dual responsibility framework.",
      d: "Technical and legal are too broad. The specific dual responsibility is design + construction.",
      correct:
        "Under SPP 207, the Architect assumes dual professional responsibility for both design AND construction. This is the fundamental characteristic of design-build: the single-point responsibility that encompasses both the creative/design and the physical construction aspects of the project.",
      takeaway:
        "Design-build = dual responsibility: design AND construction.",
    },
    0.5,
    "understand",
    "SPP 207"
  ),
];

// ─── SPP 208 Questions ──────────────────────────────────────────────────────────

const spp208Questions: Question[] = [
  q(
    DOCS.spp208.articleId,
    "What is the cardinal rule of an Architectural Design Competition (ADC) under SPP 208?",
    [
      "Transparency in judging criteria",
      "Equal prize distribution among finalists",
      "Anonymity of all competition entries",
      "Public exhibition of all entries before judging",
    ],
    "c",
    {
      a: "While transparency is important, it is not the cardinal rule of ADC under SPP 208.",
      b: "Prize distribution is governed by rules but is not the cardinal principle.",
      c: "Correct. Anonymity is the cardinal rule of ADC under SPP 208. All entries must be submitted anonymously to ensure fair and unbiased evaluation by the Jury.",
      d: "Public exhibition occurs after judging, not before, and is not the cardinal rule.",
      correct:
        "The cardinal rule of the ADC under SPP 208 is anonymity. All competition entries must be submitted anonymously, with no identifying information visible to the Jury. This ensures that designs are evaluated purely on their architectural merit, without bias from the entrant's identity or reputation.",
      takeaway: "ADC cardinal rule = anonymity of entries.",
    },
    0.4,
    "remember",
    "SPP 208"
  ),
  q(
    DOCS.spp208.articleId,
    "What is the maximum Jury size and composition requirement under SPP 208?",
    [
      "Maximum 5 members, all must be RLAs",
      "Maximum 7 members, odd number, majority must be RLAs",
      "Maximum 9 members, at least half must be RLAs",
      "Maximum 7 members, all must be RLAs",
    ],
    "b",
    {
      a: "5 members is below the maximum, and not all need to be RLAs — only a majority.",
      b: "Correct. The Jury has a maximum of 7 members, must be an odd number, and a majority must be Registered Licensed Architects (e.g., 4 out of 7).",
      c: "9 members exceeds the maximum. Also, a majority (not half) must be RLAs.",
      d: "Maximum 7 is correct, but not all members need to be RLAs — only a majority.",
      correct:
        "SPP 208 specifies the Jury: maximum 7 members, must be an odd number, and majority must be RLAs. For a 7-member Jury, at least 4 must be RLAs. The odd-number requirement prevents tie votes in deliberations.",
      takeaway:
        "Jury: max 7, odd number, majority RLAs (e.g., 4/7).",
    },
    0.5,
    "remember",
    "SPP 208"
  ),
  q(
    DOCS.spp208.articleId,
    "Under SPP 208, what is the first prize winner entitled to beyond the prize money?",
    [
      "Honorary UAP membership",
      "Automatic PRC registration upgrade",
      "Commission to design the actual project",
      "Publication rights for 5 years",
    ],
    "c",
    {
      a: "Honorary membership is not part of the ADC prize structure.",
      b: "PRC registration is a separate regulatory matter, not related to competition outcomes.",
      c: "Correct. The first prize winner is entitled to the commission to design the actual project, making the competition not just a recognition but a pathway to a real professional engagement.",
      d: "Publication rights are not part of the prize structure under SPP 208.",
      correct:
        "Under SPP 208, the first prize winner is entitled to the commission to design the actual project. This is a fundamental principle of the ADC — the competition serves as a method of architect selection, not merely an academic exercise.",
      takeaway:
        "First prize winner gets the commission to design the actual project.",
    },
    0.5,
    "understand",
    "SPP 208"
  ),
  q(
    DOCS.spp208.articleId,
    "What is the 12-month rule under SPP 208 regarding the first prize winner?",
    [
      "The winner must begin design within 12 months",
      "The Owner must exhibit entries for 12 months",
      "If no contract is signed within 12 months, the first prize is doubled",
      "The competition results expire after 12 months",
    ],
    "c",
    {
      a: "The 12-month rule protects the winner, not obligates them to start work.",
      b: "Exhibition is for 2 weeks minimum, not 12 months.",
      c: "Correct. If the Owner does not sign a contract with the first prize winner within 12 months, the first prize amount is doubled as compensation for the unrealized opportunity.",
      d: "Results do not expire. The 12-month rule concerns contract execution.",
      correct:
        "SPP 208's 12-month rule provides that if the Owner fails to sign a contract with the first prize winner within 12 months of the competition results, the first prize amount is doubled. This protects the winner from indefinite delay and compensates for lost opportunity.",
      takeaway:
        "No contract within 12 months = first prize doubled.",
    },
    0.6,
    "apply",
    "SPP 208"
  ),
  q(
    DOCS.spp208.articleId,
    "Under SPP 208, what approval must be obtained before an ADC can be announced?",
    [
      "PRC-Board of Architecture approval",
      "IAPOA (UAP) approval",
      "Local government unit endorsement",
      "CHED accreditation",
    ],
    "b",
    {
      a: "PRC-Board does not approve individual competitions. The IAPOA has this role.",
      b: "Correct. IAPOA (UAP) approval must be obtained before any ADC can be announced, ensuring the competition complies with professional standards and SPP 208 requirements.",
      c: "LGU endorsement is not required for ADC approval.",
      d: "CHED handles education accreditation, not competition approval.",
      correct:
        "SPP 208 requires IAPOA approval before any ADC announcement. The IAPOA (through the UAP) reviews the competition conditions, prize structure, Jury composition, and other terms to ensure compliance with professional standards.",
      takeaway:
        "IAPOA approval required before ADC announcement.",
    },
    0.5,
    "remember",
    "SPP 208"
  ),
  q(
    DOCS.spp208.articleId,
    "Does the Professional Advisor have a vote in Jury deliberations under SPP 208?",
    [
      "Yes, the Professional Advisor votes on all entries",
      "Yes, but only as a tiebreaker",
      "No, the Professional Advisor has no vote in Jury deliberations",
      "No, but the Professional Advisor can veto the Jury's decision",
    ],
    "c",
    {
      a: "The Professional Advisor does not vote. Their role is advisory, not decisional.",
      b: "Even as tiebreaker, the PA does not vote. The odd-number Jury requirement prevents ties.",
      c: "Correct. The Professional Advisor has no vote in Jury deliberations. The PA's role is to advise, facilitate, and ensure compliance with competition conditions, not to influence the outcome.",
      d: "The PA has neither a vote nor a veto. The Jury's decision is autonomous.",
      correct:
        "Under SPP 208, the Professional Advisor has no vote in Jury deliberations. The PA serves as a facilitator and compliance officer — ensuring competition conditions are met, advising on procedural matters, but never influencing the Jury's design evaluation.",
      takeaway:
        "Professional Advisor has NO vote in Jury deliberations.",
    },
    0.5,
    "understand",
    "SPP 208"
  ),
  q(
    DOCS.spp208.articleId,
    "In a two-stage ADC under SPP 208, what requirement applies to the Jury?",
    [
      "Different Juries for each stage",
      "The same Jury must serve for both stages",
      "The second stage Jury must have more members",
      "Stage two requires an international Jury member",
    ],
    "b",
    {
      a: "Different Juries would create inconsistency in evaluation criteria.",
      b: "Correct. In a two-stage ADC, the same Jury must serve for both stages, ensuring consistency in evaluation criteria and design assessment throughout the competition.",
      c: "Jury size remains the same for both stages.",
      d: "International membership is not required for either stage.",
      correct:
        "SPP 208 requires the same Jury to serve for both stages of a two-stage competition. This ensures continuity and consistency in design evaluation criteria, as the Jury's understanding deepens from the conceptual first stage through the detailed second stage.",
      takeaway: "Two-stage ADC = same Jury for both stages.",
    },
    0.5,
    "remember",
    "SPP 208"
  ),
  q(
    DOCS.spp208.articleId,
    "Under SPP 208, for how long must all ADC designs be exhibited, and at what cost to viewers?",
    [
      "1 week, with admission fee",
      "2 weeks minimum, free of charge",
      "1 month, free of charge",
      "2 weeks, with optional admission fee",
    ],
    "b",
    {
      a: "1 week is too short, and admission fees are not permitted.",
      b: "Correct. All ADC designs must be exhibited for a minimum of 2 weeks, free of charge, ensuring public access to the competition results.",
      c: "1 month exceeds the minimum requirement, though longer exhibition is not prohibited.",
      d: "2 weeks is correct for duration, but the exhibition must be free — no admission fee, optional or otherwise.",
      correct:
        "SPP 208 requires all ADC designs to be exhibited for a minimum of 2 weeks, free of charge. This public exhibition promotes transparency, educates the public, and gives the architectural community an opportunity to review the competition outcomes.",
      takeaway:
        "ADC exhibition: minimum 2 weeks, free of charge.",
    },
    0.4,
    "remember",
    "SPP 208"
  ),
  q(
    DOCS.spp208.articleId,
    "Under SPP 208, who retains copyright of the winning design, and how many times may it be executed?",
    [
      "Copyright transfers to Owner; unlimited executions",
      "Copyright retained by Author; one execution only for the winning design",
      "Copyright shared between Author and Owner; two executions allowed",
      "Copyright retained by Author; unlimited executions by Owner",
    ],
    "b",
    {
      a: "Copyright does not transfer to the Owner under SPP 208. It remains with the Author.",
      b: "Correct. Copyright is retained by the Author (architect), and the winning design may be executed only once. The Owner receives one-time construction rights, not ownership of the design.",
      c: "Copyright is not shared, and only one execution is permitted.",
      d: "While copyright stays with the Author, the Owner receives only one execution right, not unlimited.",
      correct:
        "Under SPP 208, copyright is retained by the Author (the architect who created the design). The winning design may be executed only once — the Owner receives the right to build the design one time. Additional uses require separate negotiation.",
      takeaway:
        "Copyright stays with Author; one execution only for the winner.",
    },
    0.6,
    "analyze",
    "SPP 208"
  ),
  q(
    DOCS.spp208.articleId,
    "What dispute resolution mechanism is mandatory in ADC conditions under SPP 208?",
    [
      "Court litigation only",
      "PRC-Board arbitration",
      "ADR (Alternative Dispute Resolution) under R.A. 9285",
      "UAP Ethics Committee hearing",
    ],
    "c",
    {
      a: "Court litigation is not the mandatory mechanism. ADR is required first.",
      b: "PRC-Board arbitration is not specified as the mandatory ADC dispute mechanism.",
      c: "Correct. ADR (Alternative Dispute Resolution) under R.A. 9285 is mandatory in ADC conditions, requiring disputes to be resolved through mediation or arbitration before litigation.",
      d: "UAP Ethics Committee may handle ethical complaints but is not the mandatory dispute resolution mechanism for ADC.",
      correct:
        "SPP 208 mandates ADR (Alternative Dispute Resolution) under R.A. 9285 in ADC conditions. All competition-related disputes must first go through ADR mechanisms (mediation, conciliation, or arbitration) before any court proceedings.",
      takeaway:
        "ADC disputes = mandatory ADR under R.A. 9285.",
    },
    0.5,
    "apply",
    "SPP 208 / R.A. 9285"
  ),
];

// ─── SPP 209 Questions ──────────────────────────────────────────────────────────

const spp209Questions: Question[] = [
  q(
    DOCS.spp209.articleId,
    "What is the minimum Salary Cost multiplier for Professional Architectural Consulting Services (PACS) under SPP 209?",
    ["1.5", "2.0", "2.5", "3.0"],
    "d",
    {
      a: "1.5 is within the MDPE range for SPP 201 pre-design services, not the SPP 209 salary cost multiplier.",
      b: "2.0 is too low. The SPP 209 multiplier starts higher to account for the specialized expertise of consulting architects.",
      c: "2.5 is the upper end of the SPP 201 MDPE range, not the SPP 209 minimum.",
      d: "Correct. The minimum Salary Cost multiplier for PACS under SPP 209 is 3.0, reflecting the premium for specialized consulting expertise, overhead, and professional liability.",
      correct:
        "SPP 209 sets the minimum Salary Cost multiplier at 3.0 for PACS, significantly higher than the 1.5-2.5 MDPE range in SPP 201. This reflects the premium expertise, specialized knowledge, and elevated professional responsibility of consulting architects.",
      takeaway:
        "SPP 209 Salary Cost multiplier minimum = 3.0 (not 1.5-2.5 like SPP 201).",
    },
    0.6,
    "analyze",
    "SPP 209"
  ),
  q(
    DOCS.spp209.articleId,
    "What is the constitutional basis for prioritizing Filipino PCA (Professional Consulting Architect) services under SPP 209?",
    [
      "Article II, Section 9 (promotion of social justice)",
      "Article XII, Section 14 (preference for Filipino professionals)",
      "Article XIV, Section 1 (education protection)",
      "Article III, Section 1 (due process and equal protection)",
    ],
    "b",
    {
      a: "Article II, Section 9 addresses social justice broadly, not the specific preference for Filipino professionals.",
      b: "Correct. Article XII, Section 14 of the 1987 Constitution provides the basis for prioritizing Filipino professionals, including architects, in the practice of their professions.",
      c: "Article XIV, Section 1 addresses education, not professional practice priority.",
      d: "Article III, Section 1 addresses due process, not professional practice priority.",
      correct:
        "The Filipino PCA priority rule under SPP 209 is grounded in Article XII, Section 14 of the 1987 Philippine Constitution, which provides for the preferential treatment of Filipino professionals in the practice of their professions within the Philippines.",
      takeaway:
        "Filipino PCA priority = Art. XII, Sec. 14 of the Constitution.",
    },
    0.6,
    "remember",
    "SPP 209 / 1987 Constitution"
  ),
  q(
    DOCS.spp209.articleId,
    "What is a Non-Qualified Entity (NQE) under SPP 209, and what is its status?",
    [
      "A foreign firm with temporary registration — allowed to practice",
      "An unregistered entity attempting to provide consulting services — prohibited",
      "A newly graduated architect without experience — restricted",
      "A retired architect — allowed only advisory roles",
    ],
    "b",
    {
      a: "Foreign firms with TSP are not NQEs. An NQE is an entity without proper qualifications.",
      b: "Correct. An NQE is an unregistered entity attempting to provide professional consulting services. NQEs are prohibited under SPP 209, as only qualified, registered professionals may provide PACS.",
      c: "New graduates without experience are not NQEs. They may be registered but lack consulting qualifications.",
      d: "Retired architects are not NQEs. They may still hold valid registration.",
      correct:
        "Under SPP 209, a Non-Qualified Entity (NQE) is any organization or individual that lacks the proper professional qualifications and registration to provide architectural consulting services. NQEs are strictly prohibited from offering PACS, protecting the public and the profession.",
      takeaway:
        "NQE = unregistered entity providing consulting services — PROHIBITED.",
    },
    0.5,
    "understand",
    "SPP 209"
  ),
  q(
    DOCS.spp209.articleId,
    "What is the three-condition framework for foreign consultants providing PACS under SPP 209?",
    [
      "Visa, work permit, and insurance",
      "TSP (Temporary/Special Permit), DoLE certification, and collaboration with local RLA",
      "IAPOA membership, PRC registration, and UAP endorsement",
      "Licensure Exam waiver, SEC registration, and DTI permit",
    ],
    "b",
    {
      a: "Visa and insurance are general requirements, not the SPP 209 three-condition framework.",
      b: "Correct. Foreign consultants must satisfy three conditions: (1) TSP from PRC, (2) DoLE certification, and (3) collaboration with a local RLA — the same framework as the general foreign architect requirements.",
      c: "IAPOA membership and UAP endorsement are not the statutory requirements for foreign consultants.",
      d: "Licensure Exam waiver is not part of the framework. Foreign consultants do not take the Philippine Licensure Exam.",
      correct:
        "Foreign consultants must satisfy three conditions under SPP 209: (1) obtain a Temporary/Special Permit from PRC, (2) secure DoLE work certification, and (3) collaborate with a local Registered Licensed Architect. This framework mirrors the general foreign architect requirements.",
      takeaway:
        "Foreign consultant framework: TSP + DoLE + local RLA collaboration.",
    },
    0.5,
    "understand",
    "SPP 209 / R.A. 9266"
  ),
  q(
    DOCS.spp209.articleId,
    "How many compensation methods are available for PACS under SPP 209?",
    ["3", "4", "5", "6"],
    "c",
    {
      a: "3 methods is too few. SPP 209 provides more flexibility for consulting compensation.",
      b: "4 methods is incorrect. SPP 209 specifies 5 compensation methods.",
      c: "Correct. SPP 209 provides 5 compensation methods for PACS, giving flexibility to structure payment based on the nature and duration of consulting engagements.",
      d: "6 methods is for SPP 204-A fulltime supervision, not SPP 209 consulting.",
      correct:
        "SPP 209 offers 5 compensation methods for Professional Architectural Consulting Services, providing flexibility to match the fee structure to the specific nature, duration, and complexity of each consulting engagement.",
      takeaway: "SPP 209 has 5 compensation methods for PACS.",
    },
    0.4,
    "remember",
    "SPP 209"
  ),
  q(
    DOCS.spp209.articleId,
    "What is QBS (Qualifications-Based Selection) under SPP 209, and which law governs it?",
    [
      "A price-based bidding process under R.A. 9266",
      "A selection method based on professional qualifications under R.A. 9184 (Government Procurement Reform Act)",
      "A competitive design process under SPP 208",
      "A merit-based ranking under R.A. 9285 (ADR Act)",
    ],
    "b",
    {
      a: "QBS is the opposite of price-based bidding. It selects based on qualifications, not price.",
      b: "Correct. QBS is a selection method that evaluates consultants primarily on their professional qualifications, experience, and capability, governed by R.A. 9184 (Government Procurement Reform Act).",
      c: "QBS is distinct from ADC. It is a consultant selection method, not a design competition.",
      d: "R.A. 9285 governs dispute resolution, not procurement selection methods.",
      correct:
        "QBS (Qualifications-Based Selection) under SPP 209 selects consultants based on professional qualifications rather than lowest price. It is governed by R.A. 9184 (Government Procurement Reform Act), which recognizes that professional services should be procured based on competence, not cost alone.",
      takeaway:
        "QBS = selection by qualifications under R.A. 9184 (Procurement Act).",
    },
    0.6,
    "apply",
    "SPP 209 / R.A. 9184"
  ),
  q(
    DOCS.spp209.articleId,
    "How many PACS service types are listed under SPP 209?",
    ["10", "12", "16", "20"],
    "c",
    {
      a: "10 service types is too few for the comprehensive PACS listing.",
      b: "12 service types is incorrect. SPP 209 lists more.",
      c: "Correct. SPP 209 lists 16 PACS service types, covering a wide range of architectural consulting activities.",
      d: "20 service types exceeds the SPP 209 specification.",
      correct:
        "SPP 209 lists 16 PACS service types, covering a comprehensive range of architectural consulting activities from project management consulting to expert witness services.",
      takeaway: "SPP 209 lists 16 PACS service types.",
    },
    0.4,
    "remember",
    "SPP 209"
  ),
  q(
    DOCS.spp209.articleId,
    "What does LoI No. 1000 (1980) establish regarding consulting services, as referenced in SPP 209?",
    [
      "Standard fee rates for government projects",
      "Priority to APO (Accredited Professional Organization) members for consulting engagements",
      "Mandatory insurance requirements for consultants",
      "Registration requirements for foreign consultants",
    ],
    "b",
    {
      a: "Fee rates are covered by the SPP documents themselves, not LoI No. 1000.",
      b: "Correct. LoI No. 1000 (1980) establishes priority for members of APOs (Accredited Professional Organizations) in government consulting engagements, supporting the preference for organized professionals.",
      c: "Insurance requirements are not the subject of LoI No. 1000.",
      d: "Foreign consultant registration is governed by R.A. 9266 and PRC regulations, not LoI No. 1000.",
      correct:
        "LoI (Letter of Instruction) No. 1000 (1980) establishes priority for APO (Accredited Professional Organization) members in consulting engagements, particularly government projects. This supports the organized professional practice and the role of the IAPOA.",
      takeaway:
        "LoI No. 1000 = priority to APO members for consulting.",
    },
    0.6,
    "remember",
    "SPP 209"
  ),
  q(
    DOCS.spp209.articleId,
    "What organizational membership is required for a Professional Consulting Architect under SPP 209?",
    [
      "SEC registration only",
      "PRC registration and DTI permit",
      "IAPOA member in good standing",
      "UAP chapter membership only",
    ],
    "c",
    {
      a: "SEC registration is for business entities, not individual professional membership.",
      b: "PRC registration and DTI are licensing requirements, not the organizational membership specified in SPP 209.",
      c: "Correct. A PCA must be an IAPOA member in good standing, ensuring they are part of the organized profession and subject to professional standards.",
      d: "UAP chapter membership is local. The requirement is IAPOA membership, which is the national accredited organization level.",
      correct:
        "SPP 209 requires Professional Consulting Architects to be IAPOA members in good standing. This ensures they are part of the recognized professional organization, adhere to professional standards, and have access to the support and accountability structures of organized practice.",
      takeaway:
        "PCA must be IAPOA member in good standing.",
    },
    0.5,
    "remember",
    "SPP 209"
  ),
  q(
    DOCS.spp209.articleId,
    "What is SPP 209's position within the 2010 SPP series?",
    [
      "It is the introductory document of the series",
      "It is a mid-series specialized document",
      "It is the capstone/final document of the 2010 SPP series",
      "It is an annex appended to the series",
    ],
    "c",
    {
      a: "The introductory document is SPP 200 (Overview), not SPP 209.",
      b: "SPP 209 is not mid-series. It is the last numbered document.",
      c: "Correct. SPP 209 is the capstone/final document of the 2010 SPP series, addressing professional consulting at the highest level and completing the comprehensive framework of architectural services.",
      d: "The annex is Annex A (Interior Design Fee Schedule). SPP 209 is a full numbered document.",
      correct:
        "SPP 209 is the capstone and final document of the 2010 SPP series. As the last numbered document, it addresses the most advanced form of professional practice — consulting services — and completes the comprehensive SPP framework from pre-design (201) through consulting (209).",
      takeaway:
        "SPP 209 = capstone/final document of the 2010 SPP series.",
    },
    0.4,
    "understand",
    "SPP 209"
  ),
];

// ─── Main Execution ─────────────────────────────────────────────────────────────

const allDocQuestions: Record<string, Question[]> = {
  uap_overview: uapOverviewQuestions,
  spp201: spp201Questions,
  spp202: spp202Questions,
  spp203: spp203Questions,
  spp204a: spp204aQuestions,
  spp204b: spp204bQuestions,
  spp205: spp205Questions,
  spp206: spp206Questions,
  spp207: spp207Questions,
  spp208: spp208Questions,
  spp209: spp209Questions,
};

async function main() {
  // Ensure output directory exists
  if (!fs.existsSync(SPP_DOCS_DIR)) {
    fs.mkdirSync(SPP_DOCS_DIR, { recursive: true });
  }

  let totalQuestions = 0;
  const report: string[] = [];

  for (const [docKey, questions] of Object.entries(allDocQuestions)) {
    const config = DOCS[docKey];
    if (!config) {
      console.error(`No config found for doc key: ${docKey}`);
      continue;
    }

    const outputPath = path.join(SPP_DOCS_DIR, config.filename);
    fs.writeFileSync(outputPath, JSON.stringify(questions, null, 2), "utf-8");

    totalQuestions += questions.length;
    report.push(
      `  [OK] ${config.filename} — ${questions.length} questions (article_id: ${config.articleId})`
    );
  }

  console.log(`\n=== SPP Question Generation Report ===\n`);
  console.log(`Total documents: ${Object.keys(allDocQuestions).length}`);
  console.log(`Total questions: ${totalQuestions}`);
  console.log(`Output directory: ${SPP_DOCS_DIR}\n`);
  console.log(`Files written:`);
  report.forEach((line) => console.log(line));
  console.log(`\nAll topic_id values: ${TOPIC_ID}`);
  console.log(`\nDone.`);
}

main().catch(console.error);

