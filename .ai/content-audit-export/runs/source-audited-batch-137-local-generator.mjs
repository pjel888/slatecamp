#!/usr/bin/env node
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const BATCH = 137;
const BATCH_ID = 'batch-137';
const BASELINE = 'c94e1afe4';
const BRANCH = execBranch();
const GENERATED_AT = new Date().toISOString();
const AUDIT_DATE = '2026-05-14';
const ROOT = process.cwd();
const EXPORT_DIR = path.join(ROOT, '.ai/content-audit-export');
const ARTICLES_DIR = path.join(EXPORT_DIR, 'articles');
const RUN_DIR = path.join(EXPORT_DIR, 'runs');
const RAW_CAPTURE_DIR = 'vitruvius-connection/001_Raw-Source-Layer/003-Theory/source-map-batch-137';
const REFINED_CAPTURE_DIR = 'vitruvius-connection/002_Raw-Conversion-Layer/003-Theory/refined_markdown/source-map-batch-137';

const sourceFamilies = {
  filipinoArchitecture: {
    label: 'Filipino Architecture',
    rawPath: 'vitruvius-connection/001_Raw-Source-Layer/002-History/Filipino Architecture.pdf',
    refinedPath: 'vitruvius-connection/002_Raw-Conversion-Layer/002-History/refined_markdown/Filipino Architecture.md',
    rawSha256: '3d6f220218c46fe78e37d152d1c51504fd3c7d413cf14e71b39e93c7e1a5831d',
    refinedSha256: 'f60dacc37e4b6634875ed68c18a55288e455476697fc250905460bbe6ac25ce1',
  },
  toa4: {
    label: 'TOA 4 (Tropical Architecture)',
    rawPath: 'vitruvius-connection/001_Raw-Source-Layer/003-Theory/TOA 4 (Tropical Architecture).pdf',
    refinedPath: 'vitruvius-connection/002_Raw-Conversion-Layer/003-Theory/refined_markdown/TOA 4 (Tropical Architecture).md',
    rawSha256: 'aa61b32fc2289be43b7bb210c1082adc0b5bee0321c36b7f3fbd8e54ae36c4f6',
    refinedSha256: 'b6fe9434960e2265ad2e33d4039a335e591ab7d0b255bf5162d676fe178bbb22',
  },
  theoryReviewer: {
    label: 'Theory of Architecture Reviewer',
    rawPath: 'vitruvius-connection/001_Raw-Source-Layer/002-History/Theory of Architecture Reviewer.pdf',
    refinedPath: 'vitruvius-connection/002_Raw-Conversion-Layer/002-History/refined_markdown/Theory of Architecture Reviewer.md',
    rawSha256: '19bdef33f5fd4c0d1e95c735fa3b1f64c61d366eb8fe4d7e7b565a33e7cd17e5',
    refinedSha256: 'd02f9477115e6aa0329a3edcc5da5b6400c7bd07c67f8eff1fd6fda7756d42d7',
  },
  designProcess: {
    label: 'Design Process',
    rawPath: 'vitruvius-connection/001_Raw-Source-Layer/002-History/Design Process.pdf',
    refinedPath: 'vitruvius-connection/002_Raw-Conversion-Layer/002-History/refined_markdown/Design Process.md',
    rawSha256: '867f07de2d857d74d256a137571150773d5e14296d2e26ea013cd3a720816e35',
    refinedSha256: 'c2d312913532efffce902e059c49ea731ac09245fd7da29fbbd30fec52afcb80',
  },
  theoryLecture: {
    label: 'Theory Lecture',
    rawPath: 'vitruvius-connection/001_Raw-Source-Layer/003-Theory/theory.pdf',
    refinedPath: 'vitruvius-connection/002_Raw-Conversion-Layer/003-Theory/refined_markdown/theory.md',
    rawSha256: '83619e30c26203f014f5029a0158b588bac23c1a4833b06deb05f2230b172738',
    refinedSha256: 'f4c45f951582369bea49a778e3d8d4a11644cd58fb78016d018a4888a1c8c17b',
  },
  toa2: {
    label: 'TOA 2 (Elements + Principles)',
    rawPath: 'vitruvius-connection/001_Raw-Source-Layer/003-Theory/TOA 2 (Elements + Principles).pdf',
    refinedPath: 'vitruvius-connection/002_Raw-Conversion-Layer/003-Theory/refined_markdown/TOA 2 (Elements + Principles).md',
    rawSha256: '533f8bda6e07b9663fc568fa35290e49c36fc1f2e2b22a34884b3bf12f919201',
    refinedSha256: '282971993d7b6a6eddf6a05a4d80a20061adac2eec981f99655617a4ce028878',
  },
  toa3: {
    label: 'TOA 3 (Design Perception)',
    rawPath: 'vitruvius-connection/001_Raw-Source-Layer/003-Theory/TOA 3 (Design Perception).pdf',
    refinedPath: 'vitruvius-connection/002_Raw-Conversion-Layer/003-Theory/refined_markdown/TOA 3 (Design Perception).md',
    rawSha256: '807be9f1a301d579123d8fa3ec680011b1906d6a4edcb6dc061c9a57e5ea9534',
    refinedSha256: '49309b3dc5eea661ca7cad04cceb91897ac29fee6dd8e43cf6c3f60f163d404a',
  },
};

const localLocators = {
  'lea-theo-008-04': [
    { family: 'filipinoArchitecture', lines: '40-59', note: 'Filipino architecture is framed as a mixture of racial and cultural influences shaped through pre-colonial, Spanish, and independence periods.' },
    { family: 'filipinoArchitecture', lines: '90-106', note: 'The local source describes a light, open, transparent, tropical character and names local professional schools and organizations.' },
    { family: 'toa4', lines: '1599-1620', note: 'Bahay kubo and bahay na bato are captured as Philippine climate-responsive reference forms with raised floors, high roofs, wide eaves, and ventilation.' },
    { family: 'theoryReviewer', lines: '142-145', note: 'Francisco Manosa is associated with native architectural forms and materials for a distinctively Filipino architecture.' },
    { family: 'filipinoArchitecture', lines: '930-1040', note: 'The source lists modern Philippine examples including churches, civic, institutional, commercial, and cultural buildings.' },
  ],
  'lea-theo-008-08': [
    { family: 'filipinoArchitecture', lines: '40-59', note: 'Philippine design identity is locally sourceable as layered historical influence rather than a single fixed style.' },
    { family: 'filipinoArchitecture', lines: '821-848', note: 'American-period planning, education, institutions, and professionalization appear as one layer in Philippine architectural identity.' },
    { family: 'filipinoArchitecture', lines: '930-1040', note: 'Modern Philippine examples support a spectrum of identity across civic, religious, institutional, and commercial work.' },
    { family: 'toa4', lines: '630-670', note: 'Tropical passive design supports climate response as an identity-relevant design layer: shade, ventilation, orientation, and protected openings.' },
    { family: 'toa4', lines: '1599-1620', note: 'Bahay kubo and bahay na bato offer local climate and form references that can inform contemporary translation.' },
    { family: 'theoryReviewer', lines: '1962-1964', note: 'The reviewer captures the principle that architecture must respond to local conditions.' },
  ],
  'lea-theo-009-01': [
    { family: 'designProcess', lines: '59-68', note: 'Programming is the problem-seeking phase that gathers, organizes, analyzes, interprets, and presents project information.' },
    { family: 'designProcess', lines: '74-87', note: 'Programming studies existing state and future state through setting, site, client, users, constraints, mission, goals, and performance.' },
    { family: 'designProcess', lines: '89-94', note: 'A program document can organize issue, fact, values, goals, performance, and concept statements.' },
    { family: 'designProcess', lines: '107-127', note: 'Issues, facts, values, goals, and performance requirements are defined as programming inputs.' },
    { family: 'designProcess', lines: '360-411', note: 'Concepts and translation guidelines emerge from analysis and prescribe performance or quality standards.' },
    { family: 'theoryLecture', lines: '99-132', note: 'The theory lecture says programming manages information affecting the design outcome and includes spaces, descriptions, interrelationships, matrix, and bubble diagram.' },
  ],
  'lea-theo-009-02': [
    { family: 'theoryLecture', lines: '129-132', note: 'The program can list spaces, descriptions, dimensions, a space interrelationship matrix, and a bubble diagram.' },
    { family: 'designProcess', lines: '200-214', note: 'Concepts organize relationships among form, material, texture, color, and adjacency; a concept statement may use a single diagram and a few words.' },
    { family: 'toa3', lines: '51-56', note: 'The local design-perception source defines basic space relationships: within, interlocking, adjacent, and linked by a common space.' },
    { family: 'toa3', lines: '60-104', note: 'Adjacent spaces remain individually defined and can respond to functional or symbolic requirements.' },
    { family: 'toa3', lines: '152-164', note: 'Centralized organization and circulation around a dominant central space support diagrammatic organization thinking.' },
  ],
  'lea-theo-009-03': [
    { family: 'designProcess', lines: '107-127', note: 'Facts, values, goals, and performance requirements give measurable direction to design decisions.' },
    { family: 'designProcess', lines: '399-411', note: 'Translation guidelines prescribe performance or quality standards from design parameters and performance requirements.' },
    { family: 'designProcess', lines: '430-450', note: 'The source gives sample translation guidelines for corridor width, doors, student spaces, home labs, movable partitions, and exhibit areas.' },
    { family: 'toa2', lines: '1865-1873', note: 'The Modulor is captured as a system based on mathematics and the human body.' },
    { family: 'toa2', lines: '2027-2029', note: 'Anthropometry and ergonomics coordinate design with physiological and psychological capacities and requirements.' },
    { family: 'theoryLecture', lines: '129-132', note: 'The program can include spaces, descriptions, dimensions, matrix, and bubble diagram.' },
  ],
};

const blockedClusters = [
  {
    cluster_id: 'lea-theo-008-02',
    title: 'Spatial Justice',
    reason: 'Blocked for Batch 137 because the checked local source layer did not safely support Edward Soja, spatial justice, displacement, participatory planning, co-design, or equity framework claims.',
    next_action: 'Source an authoritative spatial justice or participatory planning reference before rewriting.',
  },
  {
    cluster_id: 'lea-theo-008-03',
    title: 'Digital Architecture',
    reason: 'Blocked for Batch 137 because the checked local source layer did not safely support AI, BIM, VR, computational workflow, parametric practice, or fabrication claims.',
    next_action: 'Source a current authoritative digital architecture, BIM, or computational design reference before rewriting.',
  },
];

const commonWrongAnswers = {
  tokenMotif: 'Copying a visible motif while ignoring climate, use, materials, and local conditions',
  unsupportedGlobal: 'Making global-award, market, digital, or legal claims not captured in the local source artifacts',
  formFirst: 'Jumping to form before gathering facts, issues, values, goals, users, site constraints, and performance needs',
  planConfusion: 'Treating an abstract relationship diagram as a dimensioned construction plan',
  inventedStandard: 'Inventing exact area, code, or efficiency numbers without a captured source',
};

const articles = [
  {
    clusterId: 'lea-theo-008-04',
    slug: 'lea-theo-008-04-core-concept',
    directory: 'lea-theo-008-04-core-concept--ee50e412-f6d8-45f0-9016-55785c60773f',
    title: 'Filipino Architectural Identity',
    sourceFamilies: ['filipinoArchitecture', 'toa4', 'theoryReviewer'],
    realWorldScenario: 'A provincial civic center wants to feel Filipino without becoming a costume. A source-safe response studies local climate, community use, native material vocabulary, bahay kubo and bahay na bato lessons, and historical layers before translating them into a current civic program.',
    summary: 'Batch 137 grounds Filipino architectural identity in checked local sources: layered historical influence, tropical open character, bahay kubo and bahay na bato climate lessons, Manosa native forms and materials, and modern Philippine examples.',
    scopeNote: 'The rewrite excludes unsupported global award, export-market, digital, and universal identity claims. It uses only the captured Filipino Architecture, TOA 4, and Theory Reviewer boundaries.',
    useIt: 'Use Filipino identity as contextual translation: read climate, use, materials, local forms, and historical layers, then adapt them for the present project.',
    questions: [
      { stem: 'What is the safest Batch 137 reading of Filipino architectural identity?', correct: 'A layered design judgment that studies Philippine climate, local forms and materials, and historical influences before translating them into present programs', wrongs: [commonWrongAnswers.tokenMotif, commonWrongAnswers.unsupportedGlobal, 'A single fixed style that every Philippine building must copy exactly'] },
      { stem: 'Why does the bahay kubo matter in this article?', correct: 'It records climate-responsive lessons such as raised living, high roof form, wide overhangs, large openings, cross ventilation, and local materials', wrongs: ['It proves every new building must be a literal nipa hut', 'It removes the need for current safety and program checks', commonWrongAnswers.unsupportedGlobal] },
      { stem: 'How should Francisco Manosa and native materials be used in the source-safe boundary?', correct: 'As evidence that native forms and materials can inform distinct Filipino architecture when adapted critically to current needs', wrongs: ['As a license to paste bamboo texture on any facade', 'As proof that imported methods can never be used', 'As a global branding claim not present in the sources'] },
      { stem: 'Which claim is outside the Batch 137 source boundary?', correct: 'A statement that Filipino identity is proven by global product awards, export markets, or digital fabrication claims not captured locally', wrongs: ['Filipino architecture includes layered cultural influences', 'Tropical openness and lightness can be part of local character', 'Bahay na bato and bahay kubo can inform climate response'] },
      { stem: 'Which design move is tokenism rather than Filipino architectural identity?', correct: 'Adding native-looking cladding to a sealed hot building while ignoring orientation, ventilation, use, and local material logic', wrongs: ['Adapting wide eaves and shaded openings for a civic hall', 'Studying local community use before shaping shared space', 'Using local material vocabulary with current performance checks'] },
      { stem: 'In the provincial civic center scenario, what should the designer do first?', correct: 'Study climate response, community use, and local form or material lessons before deciding which identity cues belong in the design', wrongs: ['Choose a motif first and force the program to fit it', 'Claim international identity without a local source', 'Ignore bahay kubo and bahay na bato because the building is modern'] },
      { stem: 'How should colonial and modern examples inform identity?', correct: 'As historical layers and examples that help explain Philippine architectural development, not as one style all projects must copy', wrongs: ['As proof that identity has no local climate dimension', 'As a command to replicate one historic facade everywhere', 'As evidence for unsourced digital-architecture claims'] },
      { stem: 'Why is generic internationalism a weak answer here?', correct: 'It can erase local conditions, while the local sources support climate response, open tropical character, native material lessons, and layered history', wrongs: ['Because all global construction methods are forbidden', 'Because Filipino identity is only old ornament', 'Because modern Philippine examples should be ignored'] },
      { stem: 'What is the LEA takeaway from Filipino architectural identity?', correct: 'Identify the local intelligence behind climate, material, form, community use, and historical layer, then translate it carefully', wrongs: ['Memorize one decorative look and apply it to every project', 'Treat identity as a market slogan without source support', 'Avoid function because identity is only symbolic'] },
      { stem: 'Which statement best preserves the Batch 137 source boundary?', correct: 'Use the captured Filipino Architecture, TOA 4, and Theory Reviewer claims; avoid unsourced awards, global market, digital, and legal claims', wrongs: ['Use any famous Filipino design claim without checking the local artifact', 'Replace source locators with personal preference', 'Treat a single material as automatic identity'] },
    ],
    wrongs: [commonWrongAnswers.tokenMotif, commonWrongAnswers.unsupportedGlobal, 'Confusing identity with fixed nostalgia'],
  },
  {
    clusterId: 'lea-theo-008-08',
    slug: 'lea-theo-008-08-core-concept',
    directory: 'lea-theo-008-08-core-concept--cc009103-96bb-4852-85c9-9067a4359336',
    title: 'Philippine Design Identity Spectrum',
    sourceFamilies: ['filipinoArchitecture', 'toa4', 'theoryReviewer'],
    realWorldScenario: 'A small university cultural center must serve contemporary events while respecting place. A source-safe spectrum response can combine climate-responsive planning, local material lessons, institutional history, and modern Philippine precedent without pretending one motif defines the whole identity.',
    summary: 'Batch 137 frames Philippine design identity as a spectrum across climate response, native forms and materials, colonial and American-period layers, professional institutions, and modern examples.',
    scopeNote: 'The rewrite excludes unsupported Kenneth Cobonpue, TIME, export-market, global consumer, and digital-era claims because those were not captured in the local source layer.',
    useIt: 'Use the spectrum as a selection test: decide which local climate, material, historical, institutional, and modern layers are relevant to the project.',
    questions: [
      { stem: 'What does a spectrum of Philippine design identity mean in this Batch 137 rewrite?', correct: 'Identity can range across climate response, local forms and materials, colonial and modern layers, and current program needs rather than one fixed look', wrongs: [commonWrongAnswers.tokenMotif, commonWrongAnswers.unsupportedGlobal, 'A rule that every building must use the same historic facade'] },
      { stem: 'Why is climate response part of Philippine design identity here?', correct: 'The local sources support tropical design through orientation, shading, ventilation, protected openings, and local house-form lessons', wrongs: ['Because climate response is only a decorative theme', 'Because every project can ignore sun and wind if it has local patterns', 'Because identity is proven by a global product award'] },
      { stem: 'How do American-period and modern examples fit the spectrum?', correct: 'They are historical and institutional layers that help explain identity alongside local climate and material lessons', wrongs: ['They erase all pre-colonial and vernacular references', 'They force every project to copy one imported style', 'They support unsourced claims about export markets'] },
      { stem: 'Which answer is outside the local source boundary?', correct: 'A claim about global consumer awards, TIME recognition, or export-market strategy not captured in the checked artifacts', wrongs: ['Architecture must respond to local conditions', 'Bahay kubo and bahay na bato can inform contemporary translation', 'Modern Philippine examples show more than one design language'] },
      { stem: 'Which proposal best uses the spectrum for a cultural center?', correct: 'Select climate, material, spatial, and historical references that fit the program instead of pasting one local motif everywhere', wrongs: ['Choose a bamboo pattern first and ignore use', 'Claim identity through an unsourced global brand story', 'Copy one colonial facade because spectrum means one style'] },
      { stem: 'What does the local-conditions principle guard against?', correct: 'It prevents treating identity as generic international form or unsupported symbolism detached from site, climate, users, and culture', wrongs: ['It forbids contemporary construction', 'It requires every building to be a bahay kubo replica', 'It makes source checks unnecessary'] },
      { stem: 'Why should modern Philippine examples be handled carefully?', correct: 'They broaden the identity spectrum but should not be overextended into claims the local source does not make', wrongs: ['They prove all modern work has one visual formula', 'They eliminate climate and local material concerns', 'They justify digital claims without evidence'] },
      { stem: 'Which design move is strongest for the university scenario?', correct: 'Combine shaded public edges, climate-aware openings, relevant local material cues, and a contemporary event program', wrongs: ['Use air-conditioned sealed boxes with token local graphics only', 'Use a historical facade image with no program fit', 'Use global-market language instead of local source evidence'] },
      { stem: 'What is the exam-useful distinction between identity and style?', correct: 'Identity is a contextual set of climate, material, spatial, cultural, and historical decisions; style is only the visible language', wrongs: ['Identity is always one fixed ornament', 'Style automatically proves cultural fit', 'Climate has no role in design identity'] },
      { stem: 'What should a Batch 137 answer avoid?', correct: 'Unsupported claims about specific contemporary product designers, awards, global markets, digital methods, or legal status not in the local artifacts', wrongs: ['Source-backed statements about tropical response', 'Source-backed references to layered Philippine history', 'Source-backed references to local conditions'] },
    ],
    wrongs: [commonWrongAnswers.tokenMotif, commonWrongAnswers.unsupportedGlobal, 'Collapsing a spectrum into one style cue'],
  },
  {
    clusterId: 'lea-theo-009-01',
    slug: 'lea-theo-009-01-core-concept',
    directory: 'lea-theo-009-01-core-concept--f97941fb-6e33-4b9b-8c44-f51db68e40c7',
    title: 'Architectural Programming',
    sourceFamilies: ['designProcess', 'theoryLecture'],
    realWorldScenario: 'A city health office asks for a new clinic but has conflicting user needs, site limits, and budget constraints. A source-safe programming phase gathers and organizes facts, issues, values, goals, performance needs, spaces, descriptions, and relationships before schematic form-making.',
    summary: 'Batch 137 narrows architectural programming to checked local design-process sources: problem seeking, information management, existing and future state analysis, issue/fact/value/goal/performance/concept structure, spaces, descriptions, and relationship diagrams.',
    scopeNote: 'The rewrite excludes exact NAA/GBA ratios, efficiency factors, room-area formulas, and legal-contract overclaims unless separately captured.',
    useIt: 'Use programming to define the problem before design: gather facts, clarify values and goals, set performance requirements, and map spaces and relationships.',
    questions: [
      { stem: 'What is architectural programming in the source-safe Batch 137 article?', correct: 'The problem-seeking phase that gathers, organizes, analyzes, interprets, and presents project information before design decisions are fixed', wrongs: [commonWrongAnswers.formFirst, commonWrongAnswers.inventedStandard, 'A final decorative style chosen after construction'] },
      { stem: 'What is the existing-state and future-state distinction?', correct: 'Existing state studies current setting, site, users, client, and constraints; future state frames mission, goals, performance, and concepts', wrongs: ['Existing state is the final floor plan and future state is furniture color', 'Existing and future state are identical terms', 'Future state means ignoring site facts'] },
      { stem: 'Which set best matches the program document structure captured locally?', correct: 'Issues, facts, values, goals, performance requirements, and concepts', wrongs: ['Paint colors, brand slogans, furniture price lists, and contractor preference', 'Only building code section numbers', 'Only a bubble diagram with no supporting facts'] },
      { stem: 'What is a performance requirement in this source boundary?', correct: 'A design direction related to function or quality that can guide later translation into measurable design parameters', wrongs: ['A personal style preference with no project basis', 'A universal exact room size invented without source support', 'A reason to avoid user and site analysis'] },
      { stem: 'Which action is the clearest programming error?', correct: 'Jumping to building form before gathering facts, clarifying issues, values, goals, users, site constraints, and performance needs', wrongs: ['Interviewing users and documenting site constraints', 'Mapping space relationships before schematic design', 'Writing goals and performance requirements'] },
      { stem: 'In the clinic scenario, what should the architect do first?', correct: 'Organize client, user, site, constraint, space, relationship, and performance information before committing to a scheme', wrongs: ['Choose a facade image and retrofit all functions into it', 'Use a generic area formula not captured in the local source', 'Skip programming because the client named a building type'] },
      { stem: 'Why does programming include values as well as facts?', correct: 'Facts describe objective conditions, while values explain what the client or users consider important in the project', wrongs: ['Values replace facts completely', 'Facts and values are both decoration choices', 'Values are only legal citations'] },
      { stem: 'How do concepts fit into programming?', correct: 'They express important relationships and design directions that emerge from analyzed information, not arbitrary forms chosen before analysis', wrongs: ['They are random sketches unrelated to requirements', 'They are only structural calculations', 'They eliminate the need for space lists'] },
      { stem: 'What should a student avoid when answering area-planning questions from this article?', correct: 'Using exact NAA/GBA ratios, efficiency factors, or room sizes unless the specific numbers are captured by a checked source', wrongs: ['Explaining that programming organizes project information', 'Discussing spaces, descriptions, and relationships', 'Distinguishing goals from facts'] },
      { stem: 'What is the LEA takeaway from architectural programming?', correct: 'Define the problem and decision criteria before design by organizing facts, issues, values, goals, performance needs, spaces, and relationships', wrongs: ['Treat programming as optional paperwork after the design is complete', 'Replace programming with unsourced code numbers', 'Assume the first sketch is the program'] },
    ],
    wrongs: [commonWrongAnswers.formFirst, commonWrongAnswers.inventedStandard, 'Confusing programming with finished design'],
  },
  {
    clusterId: 'lea-theo-009-02',
    slug: 'lea-theo-009-02-core-concept',
    directory: 'lea-theo-009-02-core-concept--c158e63c-6120-4b2f-9784-c853ef25baa5',
    title: 'Bubble Diagrams and Adjacency Thinking',
    sourceFamilies: ['theoryLecture', 'designProcess', 'toa3'],
    realWorldScenario: 'A barangay learning center must link reading, tutoring, staff, storage, toilets, and outdoor waiting. A source-safe bubble diagram tests which spaces need adjacency, separation, or a common linking space before the design becomes a scaled plan.',
    summary: 'Batch 137 grounds bubble diagrams in checked local sources: program lists, space descriptions, interrelationship matrix, bubble diagram, adjacency, concept diagrams, and basic spatial relationships.',
    scopeNote: 'The rewrite excludes hospital-specific, acoustic, security, and code adjacency rules unless separately sourced. It treats bubble diagrams as abstract relationship tools, not dimensioned plans.',
    useIt: 'Use bubble diagrams to reason about relationships: adjacency, separation, hierarchy, linking spaces, and circulation before fixing dimensions.',
    questions: [
      { stem: 'What is a bubble diagram in this Batch 137 source-safe article?', correct: 'An abstract diagram that tests spatial relationships, adjacency, hierarchy, and links before producing a dimensioned plan', wrongs: [commonWrongAnswers.planConfusion, commonWrongAnswers.inventedStandard, 'A finished construction drawing with exact wall thicknesses'] },
      { stem: 'Why does the program mention both a matrix and a bubble diagram?', correct: 'The matrix can organize space interrelationships, while the bubble diagram visualizes those relationships for early design thinking', wrongs: ['The matrix replaces all design judgment', 'The bubble diagram is a legal permit drawing', 'Both are only graphic decoration'] },
      { stem: 'What does adjacency mean in the checked spatial-relationship source?', correct: 'Spaces can be placed next to each other while remaining individually defined and responsive to functional or symbolic requirements', wrongs: ['All rooms must merge into one undifferentiated space', 'Adjacent spaces are always separated by a highway-width corridor', 'Adjacency is only about color matching'] },
      { stem: 'Which relationship type is source-supported?', correct: 'Space within a space, interlocking spaces, adjacent spaces, and spaces linked by a common space', wrongs: ['Any hospital department rule not captured in the local source', 'A universal rule that all spaces must be centralized', 'An exact acoustic rating invented for every adjacency'] },
      { stem: 'In the barangay learning center scenario, what should the diagram test?', correct: 'Which spaces need closeness, separation, shared access, or a linking common space before dimensions are fixed', wrongs: ['Exact structural member sizes', 'A final furniture purchasing list', 'A facade style unrelated to space relationships'] },
      { stem: 'Which answer best distinguishes a bubble diagram from a floor plan?', correct: 'A bubble diagram shows relational intent; a floor plan fixes dimensions, walls, openings, and technical layout', wrongs: ['They are identical documents', 'A bubble diagram is more detailed than construction drawings', 'A floor plan never considers relationships'] },
      { stem: 'How can a common space function in early diagramming?', correct: 'It can link several spaces and help organize circulation or shared activity without yet fixing final dimensions', wrongs: ['It makes every room private and isolated', 'It supplies exact code-required widths without sourcing', 'It prevents hierarchy or circulation thinking'] },
      { stem: 'What is the main source-boundary caution for this article?', correct: 'Do not add hospital, acoustic, security, or code adjacency rules unless those exact claims are separately sourced', wrongs: ['Do not discuss adjacency at all', 'Do not use diagrams in programming', 'Do not distinguish spaces from one another'] },
      { stem: 'Which bubble-diagram answer is weakest?', correct: 'Treating the bubbles as final room sizes and construction documents before checking program relationships', wrongs: ['Using bubbles to compare closeness and separation', 'Using a matrix to support relationship decisions', 'Using a common space to link related rooms'] },
      { stem: 'What is the LEA takeaway from bubble diagrams?', correct: 'They are early reasoning tools for program relationships, adjacency, hierarchy, and circulation, not final measured plans', wrongs: ['They are decorative graphics with no programming value', 'They replace all later planning and technical coordination', 'They prove exact areas without a source'] },
    ],
    wrongs: [commonWrongAnswers.planConfusion, commonWrongAnswers.inventedStandard, 'Adding unsupported building-type-specific rules'],
  },
  {
    clusterId: 'lea-theo-009-03',
    slug: 'lea-theo-009-03-core-concept',
    directory: 'lea-theo-009-03-core-concept--249aff40-df16-413b-8b16-b78190fafeff',
    title: 'Space Standards and Performance Requirements',
    sourceFamilies: ['designProcess', 'toa2', 'theoryLecture'],
    realWorldScenario: 'A small college building needs classrooms, advising rooms, and exhibit areas. A source-safe standards pass translates program goals and performance requirements into dimensional and quality guidelines, then checks human use, ergonomics, and source-backed examples instead of inventing universal numbers.',
    summary: 'Batch 137 grounds space standards in checked local sources: facts, values, goals, performance requirements, translation guidelines, human-body proportion, anthropometry, ergonomics, and program spaces with descriptions, dimensions, matrix, and bubble diagram.',
    scopeNote: 'The rewrite excludes exact bedroom, library, classroom, NAA/GBA, efficiency, and code-minimum numbers not captured in the local source layer.',
    useIt: 'Use standards as evidence-based targets: translate goals and performance needs into dimensions or quality requirements, then verify with human use and sourced criteria.',
    questions: [
      { stem: 'What is the safest Batch 137 meaning of space standards?', correct: 'Evidence-based dimensional or quality criteria that translate program goals and performance requirements into design guidance', wrongs: [commonWrongAnswers.inventedStandard, commonWrongAnswers.formFirst, 'A decorative style manual with no relation to users or function'] },
      { stem: 'Why do performance requirements matter for space standards?', correct: 'They connect project goals and functions to measurable or checkable design criteria before detailed planning', wrongs: ['They replace all user and site facts', 'They are random numbers copied without context', 'They only describe facade appearance'] },
      { stem: 'How do anthropometry and ergonomics support standards?', correct: 'They coordinate design with human physiological and psychological capacities, requirements, and use patterns', wrongs: ['They are irrelevant to space planning', 'They prove every room has one universal size', 'They replace source checks for code numbers'] },
      { stem: 'What is the source-boundary rule for exact area numbers?', correct: 'Do not cite exact bedroom, library, classroom, efficiency, or code-minimum numbers unless the specific value is captured by a checked source', wrongs: ['Always invent a number if the question feels practical', 'Use one international formula for every Philippine project', 'Treat unsourced online memory as a source artifact'] },
      { stem: 'Which item is safely supported as a standards-related output?', correct: 'A translation guideline that turns design parameters and performance requirements into quality or dimensional targets', wrongs: ['A universal NAA/GBA ratio not captured locally', 'A legal citation not checked in the artifact', 'A final structural calculation from a bubble diagram'] },
      { stem: 'In the small college scenario, what should the standards pass do?', correct: 'Translate program goals into sourced dimensional and quality guidelines, then check human use, circulation, and relationships', wrongs: ['Start with a fixed area number from memory', 'Ignore ergonomics because standards are only aesthetics', 'Choose a facade style before understanding room needs'] },
      { stem: 'Why is the Modulor reference relevant but limited?', correct: 'It shows a human-body-based proportional system, but it does not authorize unsourced universal room standards for this batch', wrongs: ['It supplies every Philippine code dimension', 'It proves users do not matter', 'It replaces anthropometry and ergonomics'] },
      { stem: 'What is the difference between a standard and an arbitrary number?', correct: 'A standard is tied to performance, use, source evidence, and design parameters; an arbitrary number lacks that support', wrongs: ['There is no difference if the number looks precise', 'A standard is only a decorative preference', 'Any number from memory is source-safe'] },
      { stem: 'Which answer best protects LEA accuracy?', correct: 'Use source-backed performance and human-use reasoning, and flag exact values as unsupported when the local artifact does not contain them', wrongs: ['Hide uncertainty by stating exact values anyway', 'Ignore the difference between examples and universal standards', 'Treat all sample guidelines as mandatory for every project'] },
      { stem: 'What is the LEA takeaway from space standards?', correct: 'Standards should make project goals, human requirements, performance needs, and relationships measurable enough to guide design', wrongs: ['Standards are only memorized numbers without context', 'Standards eliminate programming and bubble diagrams', 'Standards are safest when invented late in design'] },
    ],
    wrongs: [commonWrongAnswers.inventedStandard, commonWrongAnswers.formFirst, 'Turning examples into universal rules'],
  },
];

function execBranch() {
  try {
    return execFileSync('git', ['branch', '--show-current'], { encoding: 'utf8' }).trim() || 'unknown';
  } catch {
    return 'unknown';
  }
}

function sha256(content) {
  return `sha256:${crypto.createHash('sha256').update(content, 'utf8').digest('hex')}`;
}

function sha256Json(value) {
  return sha256(JSON.stringify(value));
}

function fileHash(relativePath) {
  return crypto.createHash('sha256').update(fs.readFileSync(path.join(ROOT, relativePath))).digest('hex');
}

function fileHashPrefixed(relativePath) {
  return `sha256:${fileHash(relativePath)}`;
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeText(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content.endsWith('\n') ? content : `${content}\n`);
}

function writeJson(filePath, value) {
  writeText(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function t(text) {
  return String(text).replace(/\s+/g, ' ').trim();
}

function stripQuestionHash(question) {
  const clone = { ...question };
  delete clone.content_hash;
  return clone;
}

function localSourceFamilyLines(article, locators) {
  const keys = [...new Set(locators.map((locator) => locator.family))];
  const families = keys.map((key) => {
    const family = sourceFamilies[key];
    if (!family) throw new Error(`Unknown source family ${key} for ${article.clusterId}`);
    const actualRawSha256 = fileHash(family.rawPath);
    const actualRefinedSha256 = fileHash(family.refinedPath);
    if (actualRawSha256 !== family.rawSha256) throw new Error(`${family.rawPath} hash mismatch`);
    if (actualRefinedSha256 !== family.refinedSha256) throw new Error(`${family.refinedPath} hash mismatch`);
    return {
      family: key,
      label: family.label,
      raw_path: family.rawPath,
      raw_sha256: actualRawSha256,
      expected_raw_sha256: family.rawSha256,
      refined_path: family.refinedPath,
      refined_sha256: actualRefinedSha256,
      expected_refined_sha256: family.refinedSha256,
    };
  });
  return families;
}

function sourceCapture(article, locators, families) {
  const lines = [
    `# Batch ${BATCH} Raw Source Capture - ${article.clusterId} ${article.title}`,
    '',
    `Generated: ${GENERATED_AT}`,
    `Baseline: ${BASELINE}`,
    `Branch: ${BRANCH}`,
    '',
    '## Selection',
    '',
    `Selected after Batch 136 ended at lea-theo-007-14. Residual lea-theo-008-02 and lea-theo-008-03 were blocked for local-source gaps, so this sourceable cluster was processed.`,
    '',
    '## Local Source Families',
    '',
  ];
  for (const family of families) {
    lines.push(`- ${family.label}`);
    lines.push(`  - raw: ${family.raw_path} sha256:${family.raw_sha256}`);
    lines.push(`  - refined: ${family.refined_path} sha256:${family.refined_sha256}`);
  }
  lines.push('', '## Checked Local Locators', '');
  for (const locator of locators) {
    const family = sourceFamilies[locator.family];
    lines.push(`- ${family.label} lines ${locator.lines}: ${locator.note}`);
  }
  lines.push('', '## Claim Boundary', '');
  lines.push(`- Approved claim scope: ${article.summary}`);
  lines.push(`- Unsupported claims excluded: ${article.scopeNote}`);
  lines.push(`- Real World Scenario status: added source-safe scenario for ${article.clusterId}.`);
  return `${lines.join('\n')}\n`;
}

function refinedCapture(article, locators, families) {
  const lines = [
    `# Batch ${BATCH} Refined Conversion Capture - ${article.clusterId} ${article.title}`,
    '',
    `Generated: ${GENERATED_AT}`,
    '',
    '## Claim Boundaries',
    '',
    `- Approved claim scope: ${article.summary}`,
    `- Unsupported claims excluded: ${article.scopeNote}`,
    `- Real World Scenario status: added source-safe scenario for ${article.clusterId}.`,
    '',
    '## Refined Locators Used',
    '',
  ];
  for (const locator of locators) {
    const family = sourceFamilies[locator.family];
    lines.push(`- ${family.label} ${locator.lines}: ${locator.note}`);
  }
  lines.push('', '## Conversion Integrity');
  for (const family of families) {
    lines.push(`- ${family.refined_path}: sha256:${family.refined_sha256}`);
  }
  return `${lines.join('\n')}\n`;
}

function articleText(article, locators, sourceHashes) {
  const sourceLines = sourceHashes.map((item) => `- ${item.path} sha256:${item.sha256}`).join('\n');
  const locatorLines = locators.map((locator) => {
    const family = sourceFamilies[locator.family];
    return `- ${family.label} lines ${locator.lines}: ${locator.note}`;
  }).join('\n');
  return `# ${article.title}

## Source-Safe Scope

${article.summary}

This Batch ${BATCH} rewrite is intentionally narrower than the residual article when the residual claims exceeded the local source layer. ${article.scopeNote}

## Core Concept

${article.useIt}

Use the concept as an exam reasoning tool, not as a loose style label. The safest answer starts from the checked local source boundary, identifies the project information the source actually supports, and refuses unsupported exact values, awards, legal rules, global-market statements, or technology claims.

## Real World Scenario

${article.realWorldScenario}

## Exam Use

When a question asks for the best design move, choose the answer that keeps the source-backed relationship intact. When a question adds exact numbers, legal claims, global awards, or building-type rules, treat those additions as unsafe unless the local source artifact explicitly captures them.

## Local Source Boundary

Raw capture: ${RAW_CAPTURE_DIR}/${article.slug}.source-capture.md

Refined conversion: ${REFINED_CAPTURE_DIR}/${article.slug}.refined.md

Checked locators:

${locatorLines}

Source file hashes:

${sourceLines}
`;
}

function makeSources(article, locators, families, articleId, rawCapturePath, refinedCapturePath) {
  const rawCaptureHash = fileHashPrefixed(rawCapturePath);
  const refinedCaptureHash = fileHashPrefixed(refinedCapturePath);
  const checkedLines = locators.map((locator) => {
    const family = sourceFamilies[locator.family];
    return `${family.label} lines ${locator.lines}: ${locator.note}`;
  });
  const localSourceFamilies = families.map((family) => ({
    label: family.label,
    rawPath: family.raw_path,
    rawHash: `sha256:${family.raw_sha256}`,
    refinedPath: family.refined_path,
    refinedHash: `sha256:${family.refined_sha256}`,
  }));
  const sources = [
    {
      source_id: `${BATCH_ID}-${article.slug}-raw-source-capture`,
      article_id: articleId,
      label: `Batch ${BATCH} raw source capture - ${article.title}`,
      url: null,
      source_type: 'local_source_capture',
      description: `Local raw-source-layer capture for ${article.title}; includes checked local source family hashes and refined conversion locators.`,
      is_verified: true,
      sort_order: 0,
      created_at: GENERATED_AT,
      updated_at: GENERATED_AT,
      local_path: rawCapturePath,
      local_absolute_path: path.join(ROOT, rawCapturePath),
      local_sha256: rawCaptureHash,
      source_locator: `${rawCapturePath}#${rawCaptureHash}`,
      checked_markdown_lines: checkedLines,
      local_source_families: localSourceFamilies,
      local_audit_note: `Article and question claims cite only the local Batch ${BATCH} source capture/refined conversion boundary.`,
    },
    {
      source_id: `${BATCH_ID}-${article.slug}-refined-source-map`,
      article_id: articleId,
      label: `Batch ${BATCH} refined source conversion - ${article.title}`,
      url: null,
      source_type: 'local_refined_conversion',
      description: `Refined local conversion and claim-boundary map for ${article.title}.`,
      is_verified: true,
      sort_order: 1,
      created_at: GENERATED_AT,
      updated_at: GENERATED_AT,
      local_path: refinedCapturePath,
      local_absolute_path: path.join(ROOT, refinedCapturePath),
      local_sha256: refinedCaptureHash,
      source_locator: `${refinedCapturePath}#${refinedCaptureHash}`,
      upstream_capture_path: rawCapturePath,
      upstream_capture_sha256: rawCaptureHash,
      checked_markdown_lines: checkedLines,
      local_source_families: localSourceFamilies,
      local_audit_note: 'Refined conversion is a derived locator and claim-boundary map, not a substitute for the local raw capture.',
    },
  ];
  return {
    article_id: articleId,
    hash_algorithm: 'sha256',
    sources_hash: sha256Json(sources),
    source_count: sources.length,
    sources,
  };
}

function buildOptions(originalQuestion, template, article) {
  const correctId = originalQuestion.correct_option_id;
  const wrongs = [...template.wrongs, ...article.wrongs, commonWrongAnswers.unsupportedGlobal, commonWrongAnswers.inventedStandard];
  let wrongIndex = 0;
  return originalQuestion.options.map((option) => ({
    ...option,
    text: t(option.id === correctId ? template.correct : wrongs[wrongIndex++ % wrongs.length]),
  }));
}

function sourceBoundary(rawCapturePath, refinedCapturePath) {
  return `${rawCapturePath}#${fileHashPrefixed(rawCapturePath)}; ${refinedCapturePath}#${fileHashPrefixed(refinedCapturePath)}`;
}

function makeRationale(options, correctId, template, article, boundary) {
  const rationale = {};
  for (const option of options) {
    rationale[option.id] = option.id === correctId
      ? `${template.correct} This is the source-safe answer for ${article.title}.`
      : `${option.text} is not the best answer because it either overclaims, reverses the relationship, or leaves the Batch ${BATCH} source boundary for ${article.title}.`;
  }
  rationale.correct = `${template.correct} This stays inside the Batch ${BATCH} local source map for ${article.title}.`;
  rationale.takeaway = `Use the local Batch ${BATCH} source capture and refined conversion for ${article.title}; avoid unsupported exact numbers, legal claims, global awards, market claims, digital claims, or project-specific rules.`;
  rationale.source_boundary = boundary;
  return rationale;
}

function clearQuestionEdits(articleDir) {
  const editsDir = path.join(articleDir, 'question-edits');
  fs.mkdirSync(editsDir, { recursive: true });
  for (const entry of fs.readdirSync(editsDir)) {
    if (entry.endsWith('.json')) fs.unlinkSync(path.join(editsDir, entry));
  }
}

function updateArticle(article) {
  const articleDir = path.join(ARTICLES_DIR, article.directory);
  const locators = localLocators[article.clusterId];
  const families = localSourceFamilyLines(article, locators);
  const sourceHashes = families.flatMap((family) => [
    { path: family.raw_path, sha256: family.raw_sha256 },
    { path: family.refined_path, sha256: family.refined_sha256 },
  ]);
  const rawCapturePath = `${RAW_CAPTURE_DIR}/${article.slug}.source-capture.md`;
  const refinedCapturePath = `${REFINED_CAPTURE_DIR}/${article.slug}.refined.md`;

  writeText(path.join(ROOT, rawCapturePath), sourceCapture(article, locators, families));
  writeText(path.join(ROOT, refinedCapturePath), refinedCapture(article, locators, families));

  const metadataPath = path.join(articleDir, 'article-metadata.json');
  const metadata = readJson(metadataPath);
  const originalContent = fs.readFileSync(path.join(articleDir, 'original.md'), 'utf8');
  const originalHash = sha256(originalContent);
  const linkedBaseline = readJson(path.join(articleDir, 'linked-questions.json'));
  const originalQuestions = linkedBaseline.questions;
  if (!Array.isArray(originalQuestions) || originalQuestions.length !== 10) {
    throw new Error(`${article.clusterId} expected 10 linked questions, found ${originalQuestions?.length ?? 'unknown'}`);
  }
  if (article.questions.length !== originalQuestions.length) throw new Error(`${article.clusterId} template count mismatch`);

  const content = articleText(article, locators, sourceHashes);
  const normalizedHash = sha256(content);
  writeText(path.join(articleDir, 'normalized.md'), content);

  const composeErrorPath = path.join(articleDir, 'compose-error.json');
  if (fs.existsSync(composeErrorPath)) fs.unlinkSync(composeErrorPath);

  clearQuestionEdits(articleDir);
  const boundary = sourceBoundary(rawCapturePath, refinedCapturePath);
  const editedQuestions = originalQuestions.map((question, index) => {
    const template = article.questions[index];
    const options = buildOptions(question, template, article);
    const edited = {
      ...question,
      text: t(template.stem),
      options,
      rationale: makeRationale(options, question.correct_option_id, template, article, boundary),
      explanation: `${template.correct} Supported by Batch ${BATCH} local source artifacts for ${article.title}: ${boundary}.`,
      code_citation: boundary,
      source_verification_status: 'source_audited_local_first',
      source_reference: boundary,
      source_notes: article.summary,
      updated_at: GENERATED_AT,
    };
    edited.content_hash = sha256Json(stripQuestionHash(edited));
    writeJson(path.join(articleDir, 'question-edits', `${question.question_id}.json`), {
      question_id: question.question_id,
      baseline_hash: question.content_hash ?? sha256Json(stripQuestionHash(question)),
      action: 'replace',
      reason: `source-audited-article-batch-${BATCH}-local-first: unsupported or over-specific residual rewrite constrained to checked local source artifacts for ${article.title}.`,
      approved_by: `codex-local-first-${BATCH_ID}`,
      approved_at: GENERATED_AT,
      source_audit_support: {
        parent_article_id: metadata.article_id,
        parent_article_slug: article.slug,
        answer_key_fields_changed: false,
        support_status: 'source_safe_rewrite',
        source_locator: boundary,
        checked_sources: [
          {
            source_id: `${BATCH_ID}-${article.slug}-raw-source-capture`,
            label: `Batch ${BATCH} raw source capture - ${article.title}`,
            path: rawCapturePath,
            sha256: fileHashPrefixed(rawCapturePath),
          },
          {
            source_id: `${BATCH_ID}-${article.slug}-refined-source-map`,
            label: `Batch ${BATCH} refined source conversion - ${article.title}`,
            path: refinedCapturePath,
            sha256: fileHashPrefixed(refinedCapturePath),
          },
        ],
        local_source_safe_action: `Question text, options, rationale, explanation, and citation rewritten to the Batch ${BATCH} local source artifact boundary while preserving the answer key.`,
      },
      proposed: {
        text: edited.text,
        options: edited.options,
        correct_option_id: edited.correct_option_id,
        rationale: edited.rationale,
        explanation: edited.explanation,
        code_citation: edited.code_citation,
      },
      batch_question_template_index: index + 1,
    });
    return edited;
  });

  const linkedQuestionsPayload = {
    article_id: metadata.article_id,
    hash_algorithm: 'sha256',
    linked_questions_hash: sha256Json(editedQuestions),
    question_count: editedQuestions.length,
    questions: editedQuestions,
  };
  writeJson(path.join(articleDir, 'linked-questions.json'), linkedQuestionsPayload);

  const sourcesPayload = makeSources(article, locators, families, metadata.article_id, rawCapturePath, refinedCapturePath);
  writeJson(path.join(articleDir, 'sources.json'), sourcesPayload);

  const uiBlocksHash = sha256Json([]);
  writeJson(path.join(articleDir, 'ui-blocks.json'), {
    article_id: metadata.article_id,
    slug: article.slug,
    normalized_created_at: GENERATED_AT,
    parser_version: 'ui-block-parser-v1',
    original_content_hash: originalHash,
    normalized_content_hash: normalizedHash,
    ui_block_count: 0,
    total_blocks: 0,
    blocks: [],
    unknown_blocks: [],
    unresolved_critical_blocks: [],
    ui_blocks_hash: uiBlocksHash,
  });

  writeJson(path.join(articleDir, 'ui-block-edits.json'), {
    article_id: metadata.article_id,
    slug: article.slug,
    generated_at: GENERATED_AT,
    parser_version: 'ui-block-parser-v1',
    edit_count: 0,
    edits: [],
    warnings: [
      `Intentional UI block edits are not part of Batch ${BATCH}; selected bundle has zero preserved UI blocks.`,
    ],
  });

  const nextMetadata = {
    ...metadata,
    title: article.title,
    content_hash: originalHash,
    original_content_hash: originalHash,
    normalized_content_hash: normalizedHash,
    candidate_content_hash: null,
    ui_blocks_hash: uiBlocksHash,
    linked_questions_hash: linkedQuestionsPayload.linked_questions_hash,
    sources_hash: sourcesPayload.sources_hash,
    source_count: sourcesPayload.source_count,
    linked_question_count: editedQuestions.length,
    parser_status: 'passed',
    content_complexity: 'plain_markdown',
    source_verification_status: 'source_audited_local_first',
    source_verification_batch: BATCH_ID,
    source_audit_date: AUDIT_DATE,
    source_reference_count: sourcesPayload.source_count,
    real_world_scenario_status: 'added_source_safe',
    local_source_artifacts: families.map((family) => ({
      raw_path: family.raw_path,
      raw_sha256: `sha256:${family.raw_sha256}`,
      refined_path: family.refined_path,
      refined_sha256: `sha256:${family.refined_sha256}`,
    })),
    blocked_residuals_logged: blockedClusters.map((item) => item.cluster_id),
    updated_at: GENERATED_AT,
    updated_by: `codex-local-first-${BATCH_ID}`,
    updated_note: `Source-audited local-first Batch ${BATCH} content and linked-question replacement; claims cite local captured source artifacts.`,
  };
  writeJson(metadataPath, nextMetadata);

  writeJson(path.join(articleDir, 'source-audit-evidence.json'), {
    batch: BATCH_ID,
    batch_number: BATCH,
    cluster_id: article.clusterId,
    article_id: metadata.article_id,
    slug: article.slug,
    title: article.title,
    generated_at: GENERATED_AT,
    baseline: BASELINE,
    branch: BRANCH,
    locators,
    source_families: families,
    source_capture_path: rawCapturePath,
    source_capture_hash: fileHashPrefixed(rawCapturePath),
    refined_source_map_path: refinedCapturePath,
    refined_source_map_hash: fileHashPrefixed(refinedCapturePath),
    real_world_scenario: article.realWorldScenario,
    excluded_claims: article.scopeNote,
    question_edit_count: editedQuestions.length,
    preserving_correct_option_ids: editedQuestions.map((question) => ({
      question_id: question.question_id,
      correct_option_id: question.correct_option_id,
    })),
  });

  return {
    cluster_id: article.clusterId,
    article_id: metadata.article_id,
    slug: article.slug,
    article_folder: `.ai/content-audit-export/articles/${article.directory}`,
    directory: article.directory,
    title: article.title,
    question_count: editedQuestions.length,
    local_source_artifacts: families.map((family) => ({
      label: family.label,
      raw_path: family.raw_path,
      raw_sha256: `sha256:${family.raw_sha256}`,
      expected_raw_sha256: `sha256:${family.expected_raw_sha256}`,
      refined_path: family.refined_path,
      refined_sha256: `sha256:${family.refined_sha256}`,
      expected_refined_sha256: `sha256:${family.expected_refined_sha256}`,
    })),
    source_capture_path: rawCapturePath,
    source_capture_hash: fileHashPrefixed(rawCapturePath),
    refined_source_map_path: refinedCapturePath,
    refined_source_map_hash: fileHashPrefixed(refinedCapturePath),
    normalized_path: `.ai/content-audit-export/articles/${article.directory}/normalized.md`,
    linked_questions_path: `.ai/content-audit-export/articles/${article.directory}/linked-questions.json`,
    candidate_path: `.ai/content-audit-export/articles/${article.directory}/candidate.md`,
    normalized_hash: normalizedHash,
    linked_questions_hash: linkedQuestionsPayload.linked_questions_hash,
    sources_hash: sourcesPayload.sources_hash,
    source_safe_real_world_scenario: true,
  };
}

function main() {
  const summaries = articles.map(updateArticle);
  const summary = {
    batch: BATCH,
    batch_id: BATCH_ID,
    baseline: BASELINE,
    branch: BRANCH,
    generated_at: GENERATED_AT,
    raw_capture_dir: RAW_CAPTURE_DIR,
    refined_capture_dir: REFINED_CAPTURE_DIR,
    selected_clusters: summaries.map((summary) => summary.cluster_id),
    blocked_clusters: blockedClusters,
    selection_note: 'Selected the next sourceable residual Theory clusters after Batch 136 stopped at lea-theo-007-14. lea-theo-008-02 and lea-theo-008-03 were blocked for local-source gaps; selected lea-theo-008-04, 008-08, 009-01, 009-02, and 009-03.',
    articles: summaries,
  };
  writeJson(path.join(RUN_DIR, `source-audited-batch-${BATCH}-local-generation-summary.json`), summary);
  writeJson(path.join(EXPORT_DIR, `source-audited-article-batch-${BATCH}-local-first-content-generation-summary.json`), summary);
  console.log(`Batch ${BATCH} generated ${summaries.length} source-audited article bundles.`);
}

main();
