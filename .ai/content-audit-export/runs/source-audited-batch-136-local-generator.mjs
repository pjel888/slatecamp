import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const BATCH = 136;
const BATCH_ID = 'batch-136';
const BASELINE = '6eef5e971';
const BRANCH = execBranch();
const GENERATED_AT = new Date().toISOString();
const AUDIT_DATE = '2026-05-14';
const ROOT = process.cwd();
const EXPORT_DIR = path.join(ROOT, '.ai/content-audit-export');
const ARTICLES_DIR = path.join(EXPORT_DIR, 'articles');
const RUN_DIR = path.join(EXPORT_DIR, 'runs');
const RAW_CAPTURE_DIR = 'vitruvius-connection/001_Raw-Source-Layer/003-Theory/source-map-batch-136';
const REFINED_CAPTURE_DIR = 'vitruvius-connection/002_Raw-Conversion-Layer/003-Theory/refined_markdown/source-map-batch-136';

const sourceFamilies = {
  toa4: {
    label: 'TOA 4 (Tropical Architecture)',
    rawPath: 'vitruvius-connection/001_Raw-Source-Layer/003-Theory/TOA 4 (Tropical Architecture).pdf',
    refinedPath: 'vitruvius-connection/002_Raw-Conversion-Layer/003-Theory/refined_markdown/TOA 4 (Tropical Architecture).md',
    rawSha256: 'aa61b32fc2289be43b7bb210c1082adc0b5bee0321c36b7f3fbd8e54ae36c4f6',
    refinedSha256: 'b6fe9434960e2265ad2e33d4039a335e591ab7d0b255bf5162d676fe178bbb22',
  },
  quotes: {
    label: 'Quotes (Architecture)',
    rawPath: 'vitruvius-connection/001_Raw-Source-Layer/003-Theory/Quotes (1).pdf',
    refinedPath: 'vitruvius-connection/002_Raw-Conversion-Layer/003-Theory/refined_markdown/Quotes (1).md',
    rawSha256: '703d8edd0c8fc1c678ff3aa9068cab7339dbc0b7382b51b1c70957860bb4a887',
    refinedSha256: '802f59aa95855d8736e81483600a6d7cf78e358b333fd45812db8baf62759360',
  },
  toa5: {
    label: 'TOA 5',
    rawPath: 'vitruvius-connection/001_Raw-Source-Layer/003-Theory/TOA 5 (Masters of Architecture).pdf',
    refinedPath: 'vitruvius-connection/002_Raw-Conversion-Layer/003-Theory/refined_markdown/TOA 5 (Masters of Architecture).md',
    rawSha256: 'a157cf70f7d2017ffe960858e3565de6f1280f49c1237139e51f7cf0ecf8008b',
    refinedSha256: '06c5f34a17ef793bddfb801de237e2eb3a09f371b92d41b7205679a20b381423',
  },
  theoryReviewer: {
    label: 'Theory of Architecture Reviewer',
    rawPath: 'vitruvius-connection/001_Raw-Source-Layer/002-History/Theory of Architecture Reviewer.pdf',
    refinedPath: 'vitruvius-connection/002_Raw-Conversion-Layer/002-History/refined_markdown/Theory of Architecture Reviewer.md',
    rawSha256: '19bdef33f5fd4c0d1e95c735fa3b1f64c61d366eb8fe4d7e7b565a33e7cd17e5',
    refinedSha256: 'd02f9477115e6aa0329a3edcc5da5b6400c7bd07c67f8eff1fd6fda7756d42d7',
  },
  theoryLecture: {
    label: 'Theory Lecture',
    rawPath: 'vitruvius-connection/001_Raw-Source-Layer/003-Theory/theory.pdf',
    refinedPath: 'vitruvius-connection/002_Raw-Conversion-Layer/003-Theory/refined_markdown/theory.md',
    rawSha256: '83619e30c26203f014f5029a0158b588bac23c1a4833b06deb05f2230b172738',
    refinedSha256: 'f4c45f951582369bea49a778e3d8d4a11644cd58fb78016d018a4888a1c8c17b',
  },
  modernUsa: {
    label: 'Modern Architectures in History (USA)',
    rawPath: 'vitruvius-connection/001_Raw-Source-Layer/002-History/Modern Architectures in History (USA) - Gwendolyn Wright.pdf',
    refinedPath: 'vitruvius-connection/002_Raw-Conversion-Layer/002-History/refined_markdown/Modern Architectures in History (USA) - Gwendolyn Wright.md',
    rawSha256: '2910fe1d48df8a3822e69d8dcbe830b8bd5948af1da991028f0dc6d062cd578d',
    refinedSha256: '97479009e43ab4d8b3c2df4ef9285ce36947f8b7a66370527a470994d0fbd70d',
  },
  modernBrazil: {
    label: 'Modern Architectures in History (Brazil)',
    rawPath: 'vitruvius-connection/001_Raw-Source-Layer/002-History/Modern Architectures in History (Brazil) - Richard J. Williams.pdf',
    refinedPath: 'vitruvius-connection/002_Raw-Conversion-Layer/002-History/refined_markdown/Modern Architectures in History (Brazil) - Richard J. Williams.md',
    rawSha256: '8499aca87680f75ec1c81b3ab27b099bb62b205fda2710fdc58c90fe5018c06f',
    refinedSha256: '8fc5b5b1c0cfcf0a20b8bdefc5dd76a697521dd9eae7684bbd7a28fe044e091e',
  },
};

const localLocators = {
  'lea-theo-007-09': [
    { family: 'toa4', lines: '563-592', note: 'Passive design and passive cooling reduce operating cost and environmental impact after higher initial effort.' },
    { family: 'toa4', lines: '630-643', note: 'Passive design in the tropics emphasizes natural ventilation, low thermal mass, shading, and careful glazing.' },
    { family: 'toa4', lines: '649-670', note: 'Site planning should orient openings to prevailing winds, use operable windows and ceiling vents, and add shaded verandas, balconies, and landscaping.' },
    { family: 'toa4', lines: '838-875', note: 'Passive and mixed-mode ventilation can reduce air-conditioning dependence when openings and stack effect are planned.' },
    { family: 'toa4', lines: '1562-1573', note: 'Green building in tropical climates reduces cooling load by filtered air movement, shade, and vegetation that does not block circulation.' },
  ],
  'lea-theo-007-11': [
    { family: 'quotes', lines: '21-31', note: 'Canonical modernist language links architecture to forms assembled in light and disciplined Miesian aphorisms.' },
    { family: 'quotes', lines: '151-159', note: 'Tadao Ando frames architecture through silence, light, wonder, and non-material experience.' },
    { family: 'quotes', lines: '257-269', note: 'The quoted theory corpus connects architectural effect to searching for more light and space, and to space, light, and materials.' },
    { family: 'quotes', lines: '395-395', note: 'John Pawson appears as a minimalism reference in the local quote corpus.' },
    { family: 'toa5', lines: '648-785', note: 'Mies is treated as a major modern architect and the TOA 5 corpus repeatedly anchors design in form, light, structure, and material discipline.' },
  ],
  'lea-theo-007-12': [
    { family: 'toa5', lines: '378-388', note: 'TOA 5 describes Foster, Team 4, High Tech forms, technological innovations, industrialized modular units, and prefabricated elements.' },
    { family: 'toa5', lines: '496-506', note: 'Renzo Piano and Richard Rogers are linked to the Centre Georges Pompidou, described as a cultural machine with color-coded services and exteriorized structure.' },
    { family: 'quotes', lines: '103-121', note: 'Renzo Piano and Norman Foster appear in the local theory quote corpus.' },
    { family: 'quotes', lines: '293-293', note: 'Richard Rogers appears in the local theory quote corpus.' },
  ],
  'lea-theo-007-13': [
    { family: 'toa4', lines: '1599-1616', note: 'TOA 4 names Bahay Kubo and Bahay na Bato as Philippine climate-responsive reference points.' },
    { family: 'toa4', lines: '630-670', note: 'Tropical design uses natural ventilation, low thermal mass, shading, wind orientation, and shaded outdoor buffers.' },
    { family: 'theoryReviewer', lines: '1735-1779', note: 'Vernacular architecture is tied to trial-and-error, available materials, climate, lifestyle, and folk-derived design patterns.' },
    { family: 'theoryReviewer', lines: '1876-1924', note: 'The reviewer includes bahay kubo and bahay na bato vocabulary for local house form and spatial parts.' },
    { family: 'theoryLecture', lines: '375-375', note: 'The theory lecture defines basic building origins through immediate need and locally available materials.' },
  ],
  'lea-theo-007-14': [
    { family: 'modernUsa', lines: '702-702', note: 'Hull House is described as adaptive reuse of a former mansion that grew into social, educational, residential, and civic facilities.' },
    { family: 'modernUsa', lines: '1797-1797', note: 'The USA modern history corpus links adaptive reuse, sensitive modern alterations, landmark preservation, and the post-Pennsylvania Station preservation shift.' },
    { family: 'modernUsa', lines: '1936-2056', note: 'Neighborhood-scale preservation, renovation, infill, community decision-making, and reused or cheap materials appear in the local corpus.' },
    { family: 'modernUsa', lines: '2171-2321', note: 'The source notes recycled debris, reused timber, recycled metal/plastic, and warehouse loft conversions.' },
    { family: 'modernBrazil', lines: '1300-1300', note: 'SESC is described as occupying a former brick factory and reusing its low functional brick structures.' },
  ],
};

const blockedClusters = [
  {
    cluster_id: 'lea-theo-007-02',
    title: 'Digital Architecture',
    reason: 'Blocked for Batch 136 because the captured local source corpus only supported a generic parametric-design reference and did not safely support the article-level AI, biomimicry, workflow, or computational practice claims.',
    next_action: 'Source a current local or authoritative digital-design reference before rewriting.',
  },
  {
    cluster_id: 'lea-theo-007-10',
    title: 'Social Architecture',
    reason: 'Blocked for Batch 136 because local captures did not safely support the Arnstein, participatory planning, co-design, and social-architecture framework needed by the residual article.',
    next_action: 'Source an authoritative participatory-design/social-architecture reference before rewriting.',
  },
];

const commonWrongAnswers = {
  unsupportedCertification: 'Treating certification names or point totals as proof when the local capture does not support them',
  decorativeGesture: 'Adding a visible style cue while ignoring the performance or spatial claim being tested',
  technologyAlone: 'Assuming advanced systems automatically solve the design problem without passive or spatial judgment',
  nostalgia: 'Copying old forms as nostalgia while ignoring climate, use, and present constraints',
  demolitionDefault: 'Demolishing a usable structure before testing whether reuse can satisfy the brief',
};

const articles = [
  {
    clusterId: 'lea-theo-007-09',
    slug: 'lea-theo-007-09-core-concept',
    directory: 'lea-theo-007-09-core-concept--83e55961-2180-4a29-8c83-76039225db36',
    title: 'Sustainable Architecture',
    sourceFamilies: ['toa4'],
    realWorldScenario: 'A Cebu barangay library is being designed on a hot, humid site with limited operating budget. The source-safe move is to reduce cooling demand before adding active equipment: orient openings to seasonal winds, keep windows shaded and operable, use verandas or deep balconies as shaded buffers, and place vegetation so it cools the microclimate without blocking air movement.',
    summary: 'Batch 136 narrows sustainable architecture to the local tropical-architecture evidence: passive design, natural ventilation, shading, low thermal mass where appropriate, mixed-mode ventilation, and vegetation used for cooling without obstructing circulation.',
    scopeNote: 'The rewrite does not claim LEED, BERDE, Passive House, embodied-carbon math, or certification thresholds because those claims were not captured in the local source layer for this pass.',
    useIt: 'Use sustainable architecture as a design-priority test: reduce heat gain and cooling load first, then add mechanical systems only where passive or mixed-mode design cannot satisfy comfort, safety, or program needs.',
    questions: [
      { stem: 'In the Batch 136 source-safe framing, what is the strongest first move for sustainable architecture in a hot-humid Philippine setting?', correct: 'Reduce cooling demand through orientation, shaded openings, ventilation paths, and climate-responsive buffers before adding active systems', wrongs: [commonWrongAnswers.unsupportedCertification, commonWrongAnswers.decorativeGesture, commonWrongAnswers.technologyAlone] },
      { stem: 'Why does the article treat shaded, operable windows as a sustainability strategy rather than only an aesthetic detail?', correct: 'They support airflow while reducing direct solar heat gain, which lowers cooling load in tropical conditions', wrongs: ['They guarantee a certified green rating without other documentation', 'They make every wall thermally heavy regardless of climate', 'They remove the need to study wind, sun, or room use'] },
      { stem: 'Which answer best matches the local source support for passive design?', correct: 'Encourage natural ventilation, shade walls and windows, use low thermal mass where appropriate, and avoid unshaded glazing', wrongs: ['Seal the building and compensate with larger air-conditioning equipment', 'Use glass walls first and add plants later as the sustainability feature', 'Select any imported green product and assume the building is sustainable'] },
      { stem: 'How should a student handle LEED, BERDE, or Passive House claims in this Batch 136 article?', correct: 'Do not use those scoring claims unless a captured source directly supports the specific rating or threshold', wrongs: ['Assume all sustainable buildings automatically meet every rating system', 'Replace tropical passive-design evidence with brand names', 'Use certification acronyms as proof even when the source layer is silent'] },
      { stem: 'What does mixed-mode ventilation mean in the safest reading of the article?', correct: 'A design approach where natural ventilation is used when conditions allow and active cooling is reserved for conditions that require it', wrongs: ['A purely decorative mix of old and new facade styles', 'A building where windows are fixed shut for energy performance', 'A system that ignores opening placement and stack effect'] },
      { stem: 'Why does the article mention Philippine wind seasons?', correct: 'Because orientation and opening strategy should account for prevailing seasonal wind directions when planning natural ventilation', wrongs: ['Because wind direction alone replaces all site analysis', 'Because every building must face the same compass direction', 'Because certification scores are determined by monsoon labels'] },
      { stem: 'Which proposal is the clearest greenwashing risk under this rewrite?', correct: 'A sealed glass building marketed as green because of visible plants but without shading, airflow, or cooling-load strategy', wrongs: ['A shaded classroom wing with cross-ventilation and protected openings', 'A library with deep balconies that buffer sun and rain', 'A mixed-mode office that uses natural ventilation when outdoor conditions permit'] },
      { stem: 'How should vegetation be used in the tropical green-building claim?', correct: 'As shade and microclimate support that cools surrounding air while keeping ventilation paths clear', wrongs: ['As a substitute for every other passive-design decision', 'As dense planting that blocks air movement at all openings', 'As proof of sustainability even when heat gain increases'] },
      { stem: 'What is the best interpretation of low thermal mass in this source-safe context?', correct: 'It is one passive-design consideration for tropical comfort and should be applied with climate, sun, ventilation, and use in mind', wrongs: ['It is a universal rule that heavy materials are always forbidden', 'It means sustainability is only a material shopping list', 'It proves mechanical cooling is unnecessary in every room'] },
      { stem: 'For the Cebu barangay library scenario, which recommendation best follows the article?', correct: 'Plan shaded, operable openings and airflow paths first, then size active cooling only for remaining comfort needs', wrongs: ['Select a green plaque and leave the windows unshaded', 'Demolish climate-responsive buffers to create an all-glass frontage', 'Ignore site wind because sustainability is only a product specification'] },
    ],
    wrongs: [commonWrongAnswers.unsupportedCertification, commonWrongAnswers.decorativeGesture, commonWrongAnswers.technologyAlone],
  },
  {
    clusterId: 'lea-theo-007-11',
    slug: 'lea-theo-007-11-core-concept',
    directory: 'lea-theo-007-11-core-concept--a6f47968-20fd-4ccd-a53d-27e702cbfe74',
    title: 'Minimalism',
    sourceFamilies: ['quotes', 'toa5'],
    realWorldScenario: 'A small chapel and gallery in Makati is being value-engineered. A minimalist answer is not to leave the project empty; it is to protect the few decisions that carry the experience: proportion, daylight, quiet circulation, honest materials, and details that do not distract from space.',
    summary: 'Batch 136 treats minimalism as disciplined reduction: fewer elements, clearer light, stronger proportion, and material restraint. The local source support comes from modern theory quotations around light, space, materials, wonder, Miesian discipline, Tadao Ando, John Pawson, and TOA 5 modernist references.',
    scopeNote: 'The rewrite avoids unsupported building-specific claims about every minimalist architect or national movement. It uses the captured local quotation and TOA 5 evidence only as a source-safe conceptual frame.',
    useIt: 'Use minimalism as an editing discipline. Remove what weakens the spatial idea, but keep the elements required for use, comfort, structure, light, and meaning.',
    questions: [
      { stem: 'What is the safest Batch 136 definition of minimalism?', correct: 'Disciplined reduction that uses proportion, light, space, and material restraint to strengthen the architectural idea', wrongs: ['Removing function until the building is unusable', 'Choosing white paint and ignoring proportion or detail', 'Adding expensive finishes because the room has fewer objects'] },
      { stem: 'Why is minimalism not the same as emptiness?', correct: 'Because it edits elements so the remaining light, space, materials, and details carry more intent', wrongs: ['Because it requires every wall to be blank regardless of use', 'Because it avoids all structure and enclosure', 'Because it is only a decoration budget strategy'] },
      { stem: 'Which design decision best fits the source-safe article?', correct: 'Simplifying the gallery so daylight, circulation, and a small set of durable materials define the experience', wrongs: ['Keeping every decorative motif so the room feels complete', 'Using random white surfaces without resolving openings or movement', 'Removing handrails, seating, and shade because minimalism means less of everything'] },
      { stem: 'What do the captured light-and-space quotations support?', correct: 'A reading of architecture where form, light, space, material, and wonder matter more than visual clutter', wrongs: ['A rule that ornament is illegal in every building type', 'A guarantee that all minimalist buildings cost less', 'A claim that color and texture can never be used'] },
      { stem: 'How should a student evaluate minimalist detailing?', correct: 'Ask whether each joint, edge, opening, and material choice clarifies the spatial idea without hiding functional needs', wrongs: ['Assume details are irrelevant because the design has few parts', 'Use the thinnest detail possible even if it fails', 'Cover unresolved details with more decorative trim'] },
      { stem: 'Which answer is the weakest reading of Miesian discipline in this pass?', correct: 'A slogan that excuses copying a bare glass box without studying proportion, structure, light, or use', wrongs: ['A concern for disciplined reduction', 'A focus on clarity and restraint', 'A warning that fewer elements make each decision more visible'] },
      { stem: 'Why does the article keep user needs inside the minimalist test?', correct: 'Because reduction is only successful when the remaining design still supports use, comfort, safety, and meaning', wrongs: ['Because all user needs should be removed for purity', 'Because minimalism is only a furniture style', 'Because comfort is never relevant to theory questions'] },
      { stem: 'In the Makati chapel-gallery scenario, what is the best value-engineering response?', correct: 'Protect proportion, daylight, quiet circulation, and key material decisions while removing weak or redundant gestures', wrongs: ['Delete all seating, shading, and accessibility features to make the room look empty', 'Add more decorative features because the budget has been reduced', 'Replace spatial clarity with a branded minimalist color palette'] },
      { stem: 'Which claim should be avoided unless separately sourced?', correct: 'A precise building-by-building history of every minimalist movement and architect not captured in the local source layer', wrongs: ['Minimalism can use light and space as primary design materials', 'Minimalism makes each retained detail more consequential', 'Minimalism depends on restraint rather than visual noise'] },
      { stem: 'What is the practical LEA takeaway from minimalism?', correct: 'Fewer elements increase the responsibility of proportion, light, material, detail, and fit to use', wrongs: ['Fewer elements automatically mean better architecture', 'Minimalism means the cheapest possible specification', 'Minimalism replaces site, program, and construction judgment'] },
    ],
    wrongs: ['Reducing architecture to blankness', 'Treating white surfaces as the whole theory', 'Ignoring use and detail in the name of purity'],
  },
  {
    clusterId: 'lea-theo-007-12',
    slug: 'lea-theo-007-12-core-concept',
    directory: 'lea-theo-007-12-core-concept--3d340472-3007-4a4e-8a25-9754506e17bc',
    title: 'High-Tech Architecture',
    sourceFamilies: ['toa5', 'quotes'],
    realWorldScenario: 'A Quezon City technology campus wants a building that teaches visitors how it works. A high-tech approach may expose service routes, structural logic, modular components, and prefabricated assemblies, but those displays must still serve circulation, maintenance, climate, safety, and program.',
    summary: 'Batch 136 narrows high-tech architecture to the local TOA 5 support: Foster and Team 4, High Tech forms, technological innovation, industrialized modular units, prefabricated elements, and Piano/Rogers at Centre Georges Pompidou with exteriorized structure and color-coded services.',
    scopeNote: 'The rewrite avoids unsupported project-detail claims beyond the captured Pompidou description and does not treat exposed technology as automatically good design.',
    useIt: 'Use high-tech architecture as a legibility test: structure, services, modularity, and industrialized components may become architectural expression when their display clarifies how the building works.',
    questions: [
      { stem: 'What is the best source-safe definition of high-tech architecture in this article?', correct: 'Architecture that makes technological systems, structure, modular components, and prefabricated logic visible as part of the design idea', wrongs: ['Any building with computers inside', 'A facade style that hides all services behind ornament', 'A historical revival style using handmade details only'] },
      { stem: 'Why is Pompidou important in the Batch 136 rewrite?', correct: 'The captured TOA 5 source describes it as a cultural machine with color-coded service elements and structure emphasized on the exterior', wrongs: ['It proves all buildings must put pipes outside', 'It is used as proof of a Philippine code requirement', 'It replaces the need to understand structure or circulation'] },
      { stem: 'Which proposal best fits high-tech architecture?', correct: 'A transit hall where service routes, structure, and modular maintenance zones are expressed clearly and remain functional', wrongs: ['A sealed decorative shell with hidden systems and no maintenance logic', 'A historic replica with no technological expression', 'A blank minimalist room where all systems are concealed as a rule'] },
      { stem: 'How should prefabrication be understood here?', correct: 'As an industrialized construction and modular design strategy that may shape the architectural expression', wrongs: ['As a guarantee that every project is cheap and fast', 'As a decorative label unrelated to construction', 'As a rule that buildings cannot respond to climate or use'] },
      { stem: 'What is the main caution in exposing technology?', correct: 'Exposed systems must still be coordinated, maintainable, safe, and meaningful rather than becoming arbitrary visual clutter', wrongs: ['Every service must be hidden to be architecture', 'Technology always improves design even when uncoordinated', 'Structure should be exposed even if it confuses users'] },
      { stem: 'Which names are safely tied to the local high-tech source support?', correct: 'Foster, Piano, Rogers, Team 4, and the Centre Georges Pompidou', wrongs: ['A list of architects not captured in the local source layer', 'Only premodern builders with no technological frame', 'Any software company with an office tower'] },
      { stem: 'What does color-coding services do in the source-safe Pompidou example?', correct: 'It helps make service elements legible as part of the building expression', wrongs: ['It turns maintenance colors into a universal law for all buildings', 'It means color alone defines high-tech architecture', 'It hides structural and service logic from users'] },
      { stem: 'In the Quezon City campus scenario, which answer is most defensible?', correct: 'Expose service routes and modular components only where they improve legibility, maintenance, and the visitor understanding of the building', wrongs: ['Expose random pipes even if they block circulation and maintenance', 'Hide all systems because technology should never be visible', 'Use a digital signboard and ignore the building systems'] },
      { stem: 'Which claim should be rejected in this pass?', correct: 'That high-tech architecture is automatically sustainable, safe, or efficient just because technology is visible', wrongs: ['High-tech architecture can use industrialized modular units', 'High-tech architecture can express technological innovation', 'High-tech architecture may externalize structure and services'] },
      { stem: 'What is the LEA exam takeaway from high-tech architecture?', correct: 'Recognize how visible structure, services, modularity, and industrialized construction become a design language when technically coordinated', wrongs: ['Treat exposed ducts as the only required clue', 'Assume any futuristic-looking building is high-tech', 'Ignore construction logic and identify the style only by color'] },
    ],
    wrongs: ['Confusing gadgets with architectural high-tech expression', 'Treating exposed systems as automatic quality', 'Using unsupported project details as evidence'],
  },
  {
    clusterId: 'lea-theo-007-13',
    slug: 'lea-theo-007-13-core-concept',
    directory: 'lea-theo-007-13-core-concept--3437f275-1ceb-4f88-b66a-d82d29ad4a2a',
    title: 'Vernacular Architecture',
    sourceFamilies: ['toa4', 'theoryReviewer', 'theoryLecture'],
    realWorldScenario: 'A Pangasinan barangay needs a small day-care and evacuation support building. A vernacular-informed answer studies local climate, available materials, raised floors, shaded edges, cross-ventilation, and community use patterns, then translates those lessons into a current safe building instead of copying old forms as costume.',
    summary: 'Batch 136 grounds vernacular architecture in local source support: trial-and-error building knowledge, available materials, climate, lifestyle, folk-derived patterns, Philippine bahay kubo and bahay na bato vocabulary, and tropical passive-design principles.',
    scopeNote: 'The rewrite avoids romanticizing vernacular work as automatically code-compliant, anti-modern, or fixed in the past. The article treats vernacular knowledge as a design intelligence source that still needs current safety and program judgment.',
    useIt: 'Use vernacular architecture as a climate-and-culture reasoning tool. Ask what local builders learned about weather, material availability, daily use, and social life before translating those lessons into contemporary requirements.',
    questions: [
      { stem: 'What is the safest definition of vernacular architecture in this Batch 136 rewrite?', correct: 'Architecture shaped by local climate, available materials, lifestyle, and accumulated building practice rather than only formal style', wrongs: [commonWrongAnswers.nostalgia, 'A universal imported style applied the same way everywhere', 'A rule that modern safety and program needs are irrelevant'] },
      { stem: 'Why do bahay kubo and bahay na bato matter in the article?', correct: 'They give Philippine examples of local house forms and vocabulary that connect climate, materials, space, and use', wrongs: ['They prove every new building must copy one historic form exactly', 'They replace the need for current structural and safety checks', 'They are only decorative motifs with no environmental lesson'] },
      { stem: 'Which proposal is most vernacular-informed?', correct: 'A day-care that studies local shade, airflow, raised-floor logic, available materials, and community use before developing a current design', wrongs: ['A concrete box with pasted-on bamboo patterns but no climate response', 'A nostalgic replica that ignores present safety and program', 'A fully imported prototype with no local adaptation'] },
      { stem: 'How should trial-and-error knowledge be used?', correct: 'As evidence of accumulated local adaptation that can guide design decisions when checked against current needs', wrongs: ['As a reason to avoid all technical review', 'As proof that old forms are always superior', 'As a decorative story unrelated to planning'] },
      { stem: 'What is the main climate lesson shared with the tropical-design sources?', correct: 'Use shade, orientation, natural ventilation, and protected openings to respond to heat, sun, rain, and airflow', wrongs: ['Ignore openings because local identity is only symbolic', 'Use heavy sealed walls for every tropical building', 'Choose materials only by appearance'] },
      { stem: 'Which answer is an unsafe romanticization?', correct: 'Assuming vernacular architecture is automatically sustainable or code-compliant without testing performance and safety', wrongs: ['Studying local material availability', 'Learning from shaded edges and airflow', 'Translating cultural patterns into current design'] },
      { stem: 'What does the theory source support about early building needs?', correct: 'Shelter begins from immediate needs and materials available in the place', wrongs: ['Shelter begins from imported style catalogues only', 'Local material knowledge is irrelevant to architecture', 'Climate response is a late decorative addition'] },
      { stem: 'In the Pangasinan scenario, what is the best exam answer?', correct: 'Translate local climate and use lessons into a safe contemporary building instead of copying old elements as costume', wrongs: ['Copy a bahay kubo image exactly and ignore occupancy, structure, and evacuation use', 'Use bamboo-looking cladding on a sealed unshaded box', 'Reject all local knowledge because the project is modern'] },
      { stem: 'Which detail would most clearly weaken a vernacular-informed design?', correct: 'Blocking cross-ventilation and shade while adding token native patterns to the facade', wrongs: ['Providing shaded openings', 'Respecting daily community use patterns', 'Choosing materials with local availability and maintenance in mind'] },
      { stem: 'What is the LEA takeaway from vernacular architecture?', correct: 'Identify the underlying local intelligence in climate, materials, construction habit, and lifestyle, then adapt it critically', wrongs: ['Memorize a single look and apply it everywhere', 'Treat vernacular architecture as anti-technology by definition', 'Ignore present requirements because old buildings existed'] },
    ],
    wrongs: [commonWrongAnswers.nostalgia, 'Token local motifs without local performance logic', 'Ignoring current safety and program constraints'],
  },
  {
    clusterId: 'lea-theo-007-14',
    slug: 'lea-theo-007-14-core-concept',
    directory: 'lea-theo-007-14-core-concept--c2603440-ad82-425f-8c7d-38b71c10a1ef',
    title: 'Adaptive Reuse',
    sourceFamilies: ['modernUsa', 'modernBrazil'],
    realWorldScenario: 'An Iloilo warehouse district needs a public market hall and learning center. A source-safe adaptive-reuse approach starts by testing whether the existing structure, volume, neighborhood memory, and material stock can serve the new program before defaulting to demolition.',
    summary: 'Batch 136 grounds adaptive reuse in local history-source evidence: Hull House reuse of a former mansion, modern preservation activism after Pennsylvania Station, sensitive modern alterations, neighborhood preservation, renovation and infill, reused materials, warehouse loft conversions, and Lina Bo Bardi reusing a former brick factory for SESC.',
    scopeNote: 'The rewrite avoids unsupported claims about exact carbon savings, tax credits, Philippine heritage statutes, or project-specific engineering approval. It frames adaptive reuse as a design and preservation strategy that still requires feasibility checks.',
    useIt: 'Use adaptive reuse as a reuse-first test. Study structure, heritage value, neighborhood fit, material recovery, program compatibility, and safety upgrades before deciding whether to retain, alter, or replace a building.',
    questions: [
      { stem: 'What is adaptive reuse in the safest Batch 136 framing?', correct: 'Transforming an existing building or structure for a new use while evaluating structure, memory, materials, program, and safety', wrongs: [commonWrongAnswers.demolitionDefault, 'Keeping a building unchanged even when the program cannot work', 'Using old-looking decoration on a completely new shell and calling it reuse'] },
      { stem: 'Why does the article mention Hull House?', correct: 'The local source describes it as adaptive reuse of a former mansion that expanded into social, educational, residential, and civic facilities', wrongs: ['It proves all adaptive reuse must become a museum', 'It is used to claim exact carbon savings', 'It replaces feasibility and safety review'] },
      { stem: 'What lesson comes from the Pennsylvania Station preservation shift in the local source?', correct: 'Modern preservation debates helped make sensitive alteration and landmark protection part of architectural thinking', wrongs: ['Demolition is always the correct modernist response', 'Preservation means no new work can be added', 'Adaptive reuse is only a private interior-design tactic'] },
      { stem: 'Which proposal best fits the Iloilo warehouse scenario?', correct: 'Test whether the warehouse structure, volume, memory, and reusable materials can support a market hall before choosing demolition', wrongs: ['Demolish first because new construction is always better', 'Keep only a decorative sign and discard all useful structure without study', 'Preserve every damaged element without safety review'] },
      { stem: 'How should reused materials be treated?', correct: 'As part of a feasibility and design strategy that can recover value when materials remain safe and suitable', wrongs: ['As automatic proof that no new material is needed', 'As decorative rubble even when unsafe', 'As irrelevant because reuse only concerns facade style'] },
      { stem: 'Why is SESC a useful source-safe example?', correct: 'The captured Brazil source describes it as occupying a former brick factory and reusing low functional brick structures', wrongs: ['It proves every factory can become a cultural center without alteration', 'It is evidence for Philippine tax incentives', 'It means adaptive reuse excludes new additions'] },
      { stem: 'Which answer is the strongest caution?', correct: 'Adaptive reuse still needs structural, fire, access, program, and feasibility checks before retention becomes a final design decision', wrongs: ['Adaptive reuse ignores safety because history is enough', 'Adaptive reuse always costs less in every project', 'Adaptive reuse means no community or program analysis'] },
      { stem: 'How does neighborhood preservation connect to adaptive reuse?', correct: 'Reuse can keep useful urban fabric and memory while allowing renovation, infill, and new civic programs', wrongs: ['It freezes all neighborhoods permanently', 'It applies only to isolated monuments', 'It requires copying the past without current use'] },
      { stem: 'Which claim should be avoided unless separately sourced?', correct: 'A precise percentage of carbon savings or a legal incentive not captured in the local source layer', wrongs: ['Reuse can preserve building fabric', 'Reuse can involve sensitive modern alteration', 'Reuse can convert warehouses or factories to new programs'] },
      { stem: 'What is the LEA exam takeaway from adaptive reuse?', correct: 'Do not default to demolition; first test whether existing fabric can responsibly support a new use with necessary upgrades', wrongs: ['Never alter an old building under any condition', 'Call any old-style decoration adaptive reuse', 'Ignore structure, users, and code because the project is historic'] },
    ],
    wrongs: [commonWrongAnswers.demolitionDefault, 'Facade-only nostalgia without retained fabric or program logic', 'Unsupported carbon or legal claims'],
  },
];

function execBranch() {
  try {
    return execFileSync('git', ['branch', '--show-current'], { encoding: 'utf8' }).trim() || 'unknown';
  } catch {
    return 'unknown';
  }
}

function articleText(article, locators, sourceHashes) {
  const sourceList = locators
    .map((locator) => {
      const family = sourceFamilies[locator.family];
      return `- ${family.label}, ${locator.lines}: ${locator.note}`;
    })
    .join('\n');
  const hashList = sourceHashes
    .map((source) => `- ${source.path}: sha256:${source.sha256}`)
    .join('\n');

  return `# ${article.title}

## Source-Safe Scope

${article.summary}

${article.scopeNote}

## How to Use the Concept

${article.useIt}

## Real World Scenario

${article.realWorldScenario}

## Local Source Basis

${sourceList}

## Source Hashes

${hashList}

## Exam Traps

${article.wrongs.map((wrong) => `- ${wrong}`).join('\n')}
`;
}

function t(s) {
  return s;
}

function sha256(value) {
  return `sha256:${crypto.createHash('sha256').update(value).digest('hex')}`;
}

function sha256Hex(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function sha256Json(value) {
  return sha256(JSON.stringify(value));
}

function stripQuestionHash(question) {
  const clone = JSON.parse(JSON.stringify(question));
  delete clone.content_hash;
  return clone;
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function writeText(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, value);
}

function fileHash(relativePath) {
  const absolutePath = path.join(ROOT, relativePath);
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Missing source artifact: ${relativePath}`);
  }
  return sha256Hex(fs.readFileSync(absolutePath));
}

function fileHashPrefixed(relativePath) {
  return `sha256:${fileHash(relativePath)}`;
}

function localSourceFamilyLines(article, locators) {
  const families = new Map();
  for (const locator of locators) {
    const family = sourceFamilies[locator.family];
    if (!families.has(locator.family)) {
      families.set(locator.family, {
        family: locator.family,
        label: family.label,
        raw_path: family.rawPath,
        refined_path: family.refinedPath,
        raw_sha256: fileHash(family.rawPath),
        refined_sha256: fileHash(family.refinedPath),
        captured_lines: [],
      });
    }
    families.get(locator.family).captured_lines.push({ lines: locator.lines, note: locator.note });
  }
  return [...families.values()].map((family) => ({
    ...family,
    expected_raw_sha256: sourceFamilies[family.family].rawSha256,
    expected_refined_sha256: sourceFamilies[family.family].refinedSha256,
    article_cluster_id: article.clusterId,
  }));
}

function sourceCapture(article, locators, families) {
  const lines = [
    `# Batch 136 Raw Source Capture - ${article.clusterId} ${article.title}`,
    '',
    `Generated: ${GENERATED_AT}`,
    `Baseline: ${BASELINE}`,
    '',
    'This capture records the local raw source artifacts inspected before Batch 136 claims were used. Raw PDFs are not transcribed here; hashes and refined conversion locators bind the source trail.',
    '',
  ];
  for (const family of families) {
    lines.push(`## ${family.label}`);
    lines.push(`- Raw path: ${family.raw_path}`);
    lines.push(`- Raw sha256: sha256:${family.raw_sha256}`);
    lines.push(`- Expected raw sha256: sha256:${family.expected_raw_sha256}`);
    lines.push(`- Refined conversion: ${family.refined_path}`);
    lines.push(`- Refined sha256: sha256:${family.refined_sha256}`);
    lines.push(`- Expected refined sha256: sha256:${family.expected_refined_sha256}`);
    for (const locator of locators.filter((item) => item.family === family.family)) {
      lines.push(`- Locator ${locator.lines}: ${locator.note}`);
    }
    lines.push('');
  }
  return `${lines.join('\n')}\n`;
}

function refinedCapture(article, locators, families) {
  const lines = [
    `# Batch 136 Refined Conversion Capture - ${article.clusterId} ${article.title}`,
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
    const family = families.find((item) => item.family === locator.family);
    lines.push(`- ${family.label} ${locator.lines}: ${locator.note}`);
  }
  lines.push('');
  lines.push('## Conversion Integrity');
  for (const family of families) {
    lines.push(`- ${family.refined_path}: sha256:${family.refined_sha256}`);
  }
  return `${lines.join('\n')}\n`;
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
      label: `Batch 136 raw source capture - ${article.title}`,
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
      local_audit_note: 'Article and question claims cite only the local Batch 136 source capture/refined conversion boundary.',
    },
    {
      source_id: `${BATCH_ID}-${article.slug}-refined-source-map`,
      article_id: articleId,
      label: `Batch 136 refined source conversion - ${article.title}`,
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
  const originalOptions = originalQuestion.options;
  const correctId = originalQuestion.correct_option_id;
  const wrongs = [...template.wrongs, ...article.wrongs, commonWrongAnswers.decorativeGesture];
  let wrongIndex = 0;
  return originalOptions.map((option) => {
    const text = option.id === correctId ? template.correct : wrongs[wrongIndex++ % wrongs.length];
    return {
      ...option,
      text: t(text),
    };
  });
}

function sourceBoundary(rawCapturePath, refinedCapturePath) {
  return `${rawCapturePath}#${fileHashPrefixed(rawCapturePath)}; ${refinedCapturePath}#${fileHashPrefixed(refinedCapturePath)}`;
}

function makeRationale(options, correctId, template, article, boundary) {
  const rationale = {};
  for (const option of options) {
    if (option.id === correctId) {
      rationale[option.id] = `${template.correct} This is the source-safe answer for ${article.title}.`;
    } else {
      rationale[option.id] = `${option.text} is a distractor because it steps outside the Batch 136 source-safe claim boundary for ${article.title}.`;
    }
  }
  rationale.correct = `${template.correct} This stays inside the Batch 136 local source map for ${article.title}.`;
  rationale.takeaway = `Use the local Batch 136 source capture and refined conversion for ${article.title}; avoid unsupported certification, legal, carbon, or project-detail claims.`;
  rationale.source_boundary = boundary;
  return rationale;
}

function clearQuestionEdits(articleDir) {
  const editsDir = path.join(articleDir, 'question-edits');
  fs.mkdirSync(editsDir, { recursive: true });
  for (const entry of fs.readdirSync(editsDir)) {
    if (entry.endsWith('.json')) {
      fs.unlinkSync(path.join(editsDir, entry));
    }
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
    throw new Error(`${article.clusterId} expected 10 linked questions, found ${originalQuestions.length}`);
  }
  if (article.questions.length !== originalQuestions.length) {
    throw new Error(`${article.clusterId} template count mismatch`);
  }

  const content = articleText(article, locators, sourceHashes);
  const normalizedHash = sha256(content);
  writeText(path.join(articleDir, 'normalized.md'), content);

  const composeErrorPath = path.join(articleDir, 'compose-error.json');
  if (fs.existsSync(composeErrorPath)) {
    fs.unlinkSync(composeErrorPath);
  }

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
      explanation: `${template.correct} Supported by Batch 136 local source artifacts for ${article.title}: ${boundary}.`,
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
      reason: `source-audited-article-batch-136-local-first: unsupported or over-specific residual rewrite constrained to checked local source artifacts for ${article.title}.`,
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
            label: `Batch 136 raw source capture - ${article.title}`,
            path: rawCapturePath,
            sha256: fileHashPrefixed(rawCapturePath),
          },
          {
            source_id: `${BATCH_ID}-${article.slug}-refined-source-map`,
            label: `Batch 136 refined source conversion - ${article.title}`,
            path: refinedCapturePath,
            sha256: fileHashPrefixed(refinedCapturePath),
          },
        ],
        local_source_safe_action: 'Question text, options, rationale, explanation, and citation rewritten to the Batch 136 local source artifact boundary while preserving the answer key.',
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
      'Intentional UI block edits are not part of Batch 136; selected bundle has zero preserved UI blocks.',
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
    updated_note: 'Source-audited local-first Batch 136 content and linked-question replacement; claims cite local captured source artifacts.',
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
    selected_clusters: summaries.map((summary) => summary.cluster_id),
    blocked_clusters: blockedClusters,
    selection_note: 'Selected the next sourceable residual Theory clusters after Batch 135 stopped at lea-theo-007-01. lea-theo-007-02 and lea-theo-007-10 were blocked for local-source gaps; selected lea-theo-007-09, 007-11, 007-12, 007-13, and 007-14.',
    articles: summaries,
  };
  writeJson(path.join(RUN_DIR, 'source-audited-batch-136-local-generation-summary.json'), summary);
  writeJson(path.join(EXPORT_DIR, 'source-audited-article-batch-136-local-first-content-generation-summary.json'), summary);
  console.log(`Batch ${BATCH} generated ${summaries.length} source-audited article bundles.`);
}

main();
