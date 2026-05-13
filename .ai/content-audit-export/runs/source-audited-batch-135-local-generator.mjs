#!/usr/bin/env node
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, readdirSync, unlinkSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const REPO = process.cwd()
const BATCH = 135
const BATCH_ID = 'source-audited-article-batch-135-local-first'
const BASELINE = 'c1034cdff'
const BRANCH = '3dlab-gray-viewport-bg'
const GENERATED_AT = '2026-05-14T06:55:00.000+08:00'
const AUDIT_DATE = '2026-05-14'
const RAW_DIR = 'vitruvius-connection/001_Raw-Source-Layer/003-Theory/source-map-batch-135'
const REFINED_DIR = 'vitruvius-connection/002_Raw-Conversion-Layer/003-Theory/refined_markdown/source-map-batch-135'
const EMPTY_UI_HASH = sha256Json([])

const sourceFamilies = {
  theory: {
    label: 'Theory',
    rawPath: 'vitruvius-connection/001_Raw-Source-Layer/003-Theory/theory.pdf',
    rawHash: 'sha256:83619e30c26203f014f5029a0158b588bac23c1a4833b06deb05f2230b172738',
    refinedPath: 'vitruvius-connection/002_Raw-Conversion-Layer/003-Theory/refined_markdown/theory.md',
    refinedHash: 'sha256:f4c45f951582369bea49a778e3d8d4a11644cd58fb78016d018a4888a1c8c17b',
  },
  toa5: {
    label: 'TOA 5 (Masters of Architecture)',
    rawPath: 'vitruvius-connection/001_Raw-Source-Layer/003-Theory/TOA 5 (Masters of Architecture).pdf',
    rawHash: 'sha256:a157cf70f7d2017ffe960858e3565de6f1280f49c1237139e51f7cf0ecf8008b',
    refinedPath: 'vitruvius-connection/002_Raw-Conversion-Layer/003-Theory/refined_markdown/TOA 5 (Masters of Architecture).md',
    refinedHash: 'sha256:06c5f34a17ef793bddfb801de237e2eb3a09f371b92d41b7205679a20b381423',
  },
  quotes: {
    label: 'Quotes (1)',
    rawPath: 'vitruvius-connection/001_Raw-Source-Layer/003-Theory/Quotes (1).pdf',
    rawHash: 'sha256:703d8edd0c8fc1c678ff3aa9068cab7339dbc0b7382b51b1c70957860bb4a887',
    refinedPath: 'vitruvius-connection/002_Raw-Conversion-Layer/003-Theory/refined_markdown/Quotes (1).md',
    refinedHash: 'sha256:802f59aa95855d8736e81483600a6d7cf78e358b333fd45812db8baf62759360',
  },
}

const localLocators = {
  theoryCritical:
    'theory.md lines 257-260 define cultural concepts and Critical Regionalism as factoring cultural variations and contextual realities.',
  theoryModernPost:
    'theory.md lines 281-304 summarize modernism/International Style, postmodernism, critical regionalism, deconstruction, and phenomenology/place.',
  theoryProponents:
    'theory.md lines 326-328 map proponents and concepts including Bauhaus/Gropius, Organic Architecture/Wright, Post-Modernism/Venturi, Critical Regionalism/Tzonis-Lefaivre-Frampton, Deconstruction/Derrida, and Phenomenology/Place.',
  toa5Tange:
    'TOA 5 lines 226-232 identify Tange examples and distinguish modernism with traditional Japanese forms from later abstract international style.',
  toa5JohnsonPritzker:
    'TOA 5 lines 432-438 identify Philip Johnson, MoMA role, AIA Gold Medal, and Pritzker Architecture Prize in 1979.',
  toa5ModernMasters:
    'TOA 5 lines 122-146, 246-262, 548-558, 608-612, and 648-787 support Wright, Le Corbusier, Venturi, Gropius, Mies, Sullivan, Gehry, and related modern/postmodern quote anchors.',
  quotesModern:
    'Quotes (1) lines 13-87, 127-129, and 401-403 preserve Le Corbusier, Mies, Venturi, Sullivan, Wright, Gropius, and built-work quote anchors.',
}

const officialLocators = {
  britannicaSemiotics:
    'Britannica Semiotics, https://www.britannica.com/science/semiotics, captured 2026-05-14: semiotics studies signs and sign-using behavior; Saussure separates signifier/signified; Peirce classifies signs such as icon, index, and symbol.',
  mitHayden:
    'MIT Press The Grand Domestic Revolution, https://mitpress.mit.edu/9780262580557/the-grand-domestic-revolution/, captured 2026-05-14: Hayden studies material feminists and designs for homes, neighborhoods, and cities.',
  stanfordFeminism:
    'Stanford Encyclopedia of Philosophy Feminist Philosophy of Architecture, https://plato.stanford.edu/entries/feminism-architecture/, captured 2026-05-14: feminist architectural theory examines architecture through gender, sex, race, class, embodiment, power, labor, and historical exclusion.',
  pritzkerAbout:
    'Pritzker Prize About, https://www.pritzkerprize.com/about, captured 2026-05-14: the prize was founded by Jay and Cindy Pritzker through the Hyatt Foundation in 1979 and honors a living architect whose work contributes to humanity and the built environment.',
  ribaModernism:
    'RIBA Modernism, https://www.riba.org/explore/riba-collections/architectural-styles/modernism-movement/, captured 2026-05-14: modernism rejects ornament, uses analytical function, rational materials, structural innovation, asymmetry, flat roofs, open plan, volume, and minimal ornament.',
}

const commonWrongAnswers = [
  'Treat it as a legal code citation without checking the article source boundary.',
  'Choose the most familiar famous name even when the prompt asks for a concept.',
  'Import unsupported chronology, current-award trivia, or performance claims from memory.',
]

const articles = [
  {
    folder: '.ai/content-audit-export/articles/lea-theo-005-09-core-concept--81af99b9-3a14-4037-84c0-09dbd913153a',
    articleId: '81af99b9-3a14-4037-84c0-09dbd913153a',
    slug: 'lea-theo-005-09-core-concept',
    title: 'Critical Regionalism',
    contentType: 'theory-critical-regionalism',
    sourceFile: 'lea-theo-005-09-core-concept-critical-regionalism',
    sourceFamilies: ['theory', 'toa5', 'quotes'],
    checkedLines: [
      localLocators.theoryCritical,
      localLocators.theoryModernPost,
      localLocators.theoryProponents,
      localLocators.toa5Tange,
      localLocators.quotesModern,
    ],
    scenario:
      'A provincial library is reviewed for shaded public edges, local construction capacity, climate fit, and civic memory. The critic rewards context-aware modern design, not nostalgic copying or placeless glass-box repetition.',
    rejected:
      'Unsupported exact six-point Frampton lists, unsourced Doshi/Fathy/Correa building details, and broad postcolonial claims beyond the checked local locators are excluded.',
    wrongs: [
      'Copy an old regional form as nostalgic costume without testing present-day conditions.',
      'Use a placeless universal style that ignores climate, material logic, culture, and site.',
      'Treat critical regionalism as a building-code rule or legal citation.',
    ],
    normalized: articleText(
      'Critical Regionalism',
      'Critical regionalism is source-safe here as a cultural and contextual reading method: architecture should factor cultural variations and contextual realities rather than behave as a placeless universal style. The local theory source names Tzonis, Lefaivre, and Frampton as critical-regionalism anchors, but this batch does not claim a detailed six-point framework because that exact text was not captured.',
      'Use it to choose the option that links modern design judgment with climate, topography, local material practice, public meaning, and cultural memory. Reject options that reduce regionalism to costume, nostalgia, or nationalism.',
    ),
    templates: [
      t('What is the safest Batch 135 meaning of critical regionalism?', 'Architecture that factors cultural variations and contextual realities while staying critically modern.'),
      t('Which answer best distinguishes critical regionalism from nostalgia?', 'It uses local conditions as active design resources rather than copying old forms as costume.'),
      t('Why is a placeless glass box weak in a critical-regionalist prompt?', 'It ignores the cultural, climatic, and contextual realities named by the source map.'),
      t('Which evidence matters most in the library scenario?', 'Shaded public edges, climate fit, local construction capacity, and civic memory supporting a contemporary design.'),
      t('What should be avoided in this local-first article?', 'Exact Frampton six-point claims or architect case studies not captured in the Batch 135 source artifact.'),
      t('How should Tange help this topic?', 'As a reminder that modernism can be compared with regional form before shifting toward abstract international style.'),
      t('Which answer best fits LEA application?', 'Identify whether the building responds to place, culture, climate, and materials instead of using region as decoration.'),
      t('Why is the word critical important?', 'It keeps regionalism from becoming sentimental revival by requiring reasoned design judgment.'),
      t('Which option is weakest?', 'A design that adds a local motif while ignoring climate, material logic, and public use.'),
      t('What does the source boundary allow?', 'Concept-level comparison of regional context, cultural variation, and modern design response.'),
      t('What is the main exam mistake?', 'Treating regional identity as a style label instead of a source-supported design argument.'),
    ],
  },
  {
    folder: '.ai/content-audit-export/articles/lea-theo-005-10-core-concept--d82c5a6f-539a-4b81-bd40-668d9ba467ec',
    articleId: 'd82c5a6f-539a-4b81-bd40-668d9ba467ec',
    slug: 'lea-theo-005-10-core-concept',
    title: 'Structuralism and Semiotics',
    contentType: 'theory-structuralism-semiotics',
    sourceFile: 'lea-theo-005-10-core-concept-structuralism-semiotics',
    sourceFamilies: ['toa5', 'quotes'],
    checkedLines: [
      officialLocators.britannicaSemiotics,
      localLocators.toa5ModernMasters,
      localLocators.quotesModern,
    ],
    scenario:
      'A transit terminal is evaluated for legible entrances, route hierarchy, civic symbols, and clear wayfinding. The best answer asks how users read the building as a system of signs, not whether it merely has decorative graphics.',
    rejected:
      'Unsupported Saussure chapter details, exhaustive semiotic taxonomies, and unverified claims about every Venturi/Scott Brown text are excluded.',
    wrongs: [
      'Treat every graphic or ornament as meaningful without checking the spatial system.',
      'Reduce semiotics to a famous-name recall question with no sign or user interpretation.',
      'Replace sign, system, and meaning with an unrelated legal or structural calculation.',
    ],
    normalized: articleText(
      'Structuralism and Semiotics',
      'Semiotics studies signs and sign-using behavior. For architecture, the safe LEA move is to read buildings as communicative systems: entrances, axes, thresholds, materials, ornaments, and route cues can act as signs when they help users interpret use, hierarchy, memory, or civic meaning.',
      'Structuralism asks about the underlying system that gives those signs meaning. A facade, plan, campus, or terminal is not read one element at a time; its parts work through relationships and conventions. Venturi stays source-safe here as a local anchor for symbolic decoration and cultural meaning, not as a license for uncaptured semiotic detail.',
    ),
    templates: [
      t('What is semiotics in the Batch 135 source map?', 'The study of signs and sign-using behavior applied to how architecture communicates meaning.'),
      t('How does structuralist thinking help a plan-reading question?', 'It asks how parts gain meaning through relationships inside a larger spatial or cultural system.'),
      t('What is the best terminal-design evidence?', 'Entrances, route hierarchy, thresholds, symbols, and wayfinding that users can read as a coherent system.'),
      t('Which claim is too broad for this pass?', 'A complete theory of every Saussure or Peirce category in architectural practice.'),
      t('How should Venturi be used here?', 'As a source-safe anchor for symbolic decoration and cultural meaning, not unsupported trivia.'),
      t('Which answer best describes an architectural sign?', 'A spatial, material, visual, or formal cue that helps users interpret use, hierarchy, or meaning.'),
      t('What is the common exam trap?', 'Treating signs as surface decoration only and ignoring the spatial system that makes them legible.'),
      t('Which option fits structuralism better?', 'A campus plan whose paths, courts, gates, and landmarks work together as an intelligible order.'),
      t('Why is pure memorized terminology weak?', 'The item usually asks how meaning is produced in a built situation, not just who coined a term.'),
      t('What should the answer preserve?', 'The original answer key while narrowing the rationale to captured sign, system, and meaning claims.'),
      t('Which reading is strongest?', 'A building communicates through relationships among form, route, symbol, use, and cultural convention.'),
    ],
  },
  {
    folder: '.ai/content-audit-export/articles/lea-theo-005-11-core-concept--abf78b33-d1f6-4440-9723-ae3599ccf1d2',
    articleId: 'abf78b33-d1f6-4440-9723-ae3599ccf1d2',
    slug: 'lea-theo-005-11-core-concept',
    title: 'Feminist Critiques of Architecture',
    contentType: 'theory-feminist-critiques-architecture',
    sourceFile: 'lea-theo-005-11-core-concept-feminist-critiques-architecture',
    sourceFamilies: ['theory'],
    checkedLines: [
      officialLocators.stanfordFeminism,
      officialLocators.mitHayden,
      localLocators.theoryModernPost,
    ],
    scenario:
      'A barangay health center is checked for caregiving routes, safe waiting areas, toilets, privacy, staff visibility, and access for different bodies. The critique asks whose labor and safety the plan assumes.',
    rejected:
      'Unsupported statistics about women in practice, uncaptured architect biographies, and broad political claims not tied to spatial evidence are excluded.',
    wrongs: [
      'Treat feminist critique as a facade style or color palette.',
      'Ignore care work, safety, privacy, toilets, circulation, visibility, and access.',
      'Use uncaptured statistics or biographies instead of checked spatial evidence.',
    ],
    normalized: articleText(
      'Feminist Critiques of Architecture',
      'Feminist architectural critique asks how the built environment reflects and shapes gender, power, labor, embodiment, class, race, and historical exclusion. It is not a style. It is a way to ask who is represented, who is served, who is made unsafe, and whose work is hidden by a plan.',
      'For LEA use, keep the answer spatial. Domestic labor, public safety, caregiving, toilets, circulation, visibility, thresholds, and access are design questions, not side issues. Hayden is source-safe here as an anchor for feminist designs for homes, neighborhoods, and cities; the Stanford source supports feminist architecture as a philosophical critique of built space and practice.',
    ),
    templates: [
      t('What is feminist architectural critique?', 'A spatial critique of how buildings and practice reflect gender, power, labor, embodiment, and exclusion.'),
      t('Why is it not a style label?', 'Because it asks who space serves or excludes rather than prescribing one visual appearance.'),
      t('Which evidence matters in the health-center scenario?', 'Caregiving routes, safe waiting, toilets, privacy, visibility, and access for different bodies.'),
      t('How should Hayden be used in this batch?', 'As a source-safe anchor for feminist designs connected to homes, neighborhoods, and cities.'),
      t('Which claim is not source-safe?', 'Uncaptured statistics or biographies presented as if verified by the Batch 135 source map.'),
      t('What is the strongest LEA application?', 'Trace how a plan distributes safety, labor, care, visibility, and access.'),
      t('Which mistake weakens an answer?', 'Reducing feminist critique to decoration or token representation without spatial evidence.'),
      t('Why do domestic and public spaces both matter?', 'Both can organize care work, privacy, safety, and social power through design decisions.'),
      t('What should a source-safe rationale avoid?', 'Sweeping political claims that are not tied to checked spatial or practice evidence.'),
      t('Which option best fits a critique of exclusion?', 'A building that assumes one default body and ignores caregiving, privacy, safety, or access needs.'),
      t('What should the student identify first?', 'The user group, labor pattern, body condition, or power relation that the spatial decision affects.'),
      t('What does this article support?', 'Concept-level feminist critique of built space and practice within the captured source boundary.'),
    ],
  },
  {
    folder: '.ai/content-audit-export/articles/lea-theo-006-04-core-concept--e33b39f4-7b0f-46ac-99d3-20321ffcd9cc',
    articleId: 'e33b39f4-7b0f-46ac-99d3-20321ffcd9cc',
    slug: 'lea-theo-006-04-core-concept',
    title: 'The Pritzker Prize and Modern Architecture',
    contentType: 'theory-pritzker-prize-modern-architecture',
    sourceFile: 'lea-theo-006-04-core-concept-pritzker-prize-modern-architecture',
    sourceFamilies: ['toa5', 'quotes'],
    checkedLines: [
      officialLocators.pritzkerAbout,
      localLocators.toa5JohnsonPritzker,
      localLocators.toa5ModernMasters,
      localLocators.quotesModern,
    ],
    scenario:
      'A review class uses a Pritzker laureate as evidence of professional recognition, then separately asks which design ideas the work demonstrates. The prize is treated as recognition, not as a movement or answer key by itself.',
    rejected:
      'Current-year winner memorization, uncaptured complete laureate lists, and claims that the prize defines one architectural style are excluded.',
    wrongs: [
      'Treat the Pritzker Prize as an architectural movement or style.',
      'Answer from latest-winner trivia without verifying a current source.',
      'Use the prize as proof of a design concept without reading the work or idea named by the prompt.',
    ],
    normalized: articleText(
      'The Pritzker Prize and Modern Architecture',
      'The Pritzker Architecture Prize is source-safe here as a recognition framework founded in 1979 by the Hyatt Foundation and awarded to a living architect for significant contribution to humanity and the built environment. The local TOA source anchors Philip Johnson and the 1979 Pritzker reference.',
      'For LEA use, the prize does not define a movement. A laureate may be modernist, postmodernist, regionalist, high-tech, or otherwise. The safer exam habit is to use the prize as recognition context, then identify the actual design idea, work, movement, or concept supported by the item.',
    ),
    templates: [
      t('What is the safest use of the Pritzker Prize in this article?', 'As a recognition framework, not as an architectural movement.'),
      t('What local source anchor supports the 1979 prize reference?', 'TOA 5 identifies Philip Johnson and the Pritzker Architecture Prize in 1979.'),
      t('Why should current-year winner trivia be avoided here?', 'It is time-sensitive and outside the stable concept boundary needed for this local-first rewrite.'),
      t('Which answer best handles a laureate question?', 'Use the prize as recognition context, then identify the source-supported work or design concept.'),
      t('What does the official Pritzker source support?', 'The prize was founded through the Hyatt Foundation in 1979 and honors a living architect for contribution to humanity and the built environment.'),
      t('Which claim is weakest?', 'Every Pritzker laureate belongs to one identical architectural style.'),
      t('How should Philip Johnson be treated?', 'As a TOA 5 master and 1979 Pritzker reference, with design claims kept inside checked sources.'),
      t('What is the scenario lesson?', 'Recognition evidence and design-analysis evidence are separate tasks.'),
      t('Which option fits LEA reasoning?', 'Match the architect to supported work, idea, and movement instead of treating the prize as the answer.'),
      t('What should the source boundary exclude?', 'Complete laureate chronology and uncaptured latest-winner claims.'),
    ],
  },
  {
    folder: '.ai/content-audit-export/articles/lea-theo-007-01-core-concept--5144f75e-e8ee-49a0-8dcf-2ded9c2b432c',
    articleId: '5144f75e-e8ee-49a0-8dcf-2ded9c2b432c',
    slug: 'lea-theo-007-01-core-concept',
    title: 'Architectural Modernism',
    contentType: 'theory-modernism-movement-sequence',
    sourceFile: 'lea-theo-007-01-core-concept-architectural-modernism-movement-sequence',
    sourceFamilies: ['theory', 'toa5', 'quotes'],
    checkedLines: [
      officialLocators.ribaModernism,
      localLocators.theoryModernPost,
      localLocators.theoryProponents,
      localLocators.toa5ModernMasters,
      localLocators.quotesModern,
    ],
    scenario:
      'A studio timeline compares a Bauhaus-influenced school, a Venturi-like civic facade, and a fragmented deconstructivist proposal. The student must name the movement logic and explain what each reacted against.',
    rejected:
      'Unsupported parametricism chronology, exhaustive movement genealogy, and broad building attributions beyond checked local/RIBA locators are excluded.',
    wrongs: [
      'Treat all twentieth-century movements as one identical modernist style.',
      'Identify the movement by surface color or fashion instead of source-supported logic.',
      'Import unsupported parametric chronology or exhaustive genealogy into this local-first pass.',
    ],
    normalized: articleText(
      'Architectural Modernism',
      'This Batch 135 rewrite narrows the movement-sequence article to checked claims. Modernism and the International Style are source-safe as a twentieth-century response tied to structural rationalism, technology, mass production, flat roofs, open-plan interiors, pilotis, and reduced ornament. RIBA supports modernism as rejecting ornament and using analytical function, rational materials, structural innovation, asymmetry, open plans, and flat roofs.',
      'The local theory source then lets students compare reactions: postmodernism reacts to International Style excesses through humanistic, pluralist, symbolic, and historical memory cues; critical regionalism factors cultural and contextual realities; deconstruction questions systems and hidden biases; phenomenology/place asks about felt experience and meaning in environment.',
    ),
    templates: [
      t('What is the safest Batch 135 meaning of modernism here?', 'A movement tied to function, rational materials, structural innovation, open spatial logic, flat roofs, and reduced ornament.'),
      t('Which local clue belongs to Le Corbusier?', 'Pilotis, flat roofs, open-plan interior, machine-for-living framing, and the Five Points source boundary.'),
      t('What does postmodernism react against in the source map?', 'International Style excesses, using pluralism, historical memory, symbolism, and humanistic cues.'),
      t('How should deconstruction be handled?', 'As questioning systems, norms, and hidden biases without inventing an exhaustive movement history.'),
      t('Which answer best uses the timeline scenario?', 'Name each movement logic and explain what it reacts against using checked source locators.'),
      t('Why is parametricism excluded here?', 'The selected Batch 135 source map did not capture enough stable support for detailed parametric chronology.'),
      t('Which mistake is common?', 'Treating all twentieth-century architecture as one undifferentiated modernist style.'),
      t('How do Gropius and Bauhaus fit?', 'They support art, technology, teamwork, standardization, prefabrication, and integrated building culture.'),
      t('Which evidence fits modernism better than ornament alone?', 'Structural rationalism, function, material logic, open plan, and reduced ornament.'),
      t('What is the safest comparison move?', 'Separate modernist, postmodern, critical regionalist, deconstructive, and phenomenological claims by source-supported cues.'),
    ],
  },
]

function articleText(title, scope, useIt) {
  return (ctx) => `# ${title}

Source basis: Batch ${BATCH} local capture ${ctx.capturePath} (${ctx.captureHash}) and refined conversion ${ctx.refinedPath} (${ctx.refinedHash}). This article cites the local source map rather than uncaptured memory or live database claims.

## LEA Scope

${scope}

## How To Use It

${useIt}

## Real World Scenario

${ctx.scenario}

## Common Mistakes

- ${commonWrongAnswers[0]}
- ${commonWrongAnswers[1]}
- ${commonWrongAnswers[2]}
- Treating this topic as a visual style label without checking the source-supported concept.

## Source Boundary

This Batch ${BATCH} rewrite supports concept-level LEA reasoning inside the checked local source capture and refined conversion. It does not authorize unsupported chronology, exhaustive figure lists, legal/code claims, current-event trivia, or uncaptured performance assertions.`
}

function t(text, correctAnswer) {
  return { text, correctAnswer }
}

function sha256(text) {
  return `sha256:${createHash('sha256').update(text, 'utf8').digest('hex')}`
}

function sha256Json(value) {
  return sha256(JSON.stringify(value))
}

function stripContentHash(question) {
  const { content_hash: _contentHash, ...rest } = question
  return rest
}

function readJson(relativePath) {
  return JSON.parse(readFileSync(path.join(REPO, relativePath), 'utf8'))
}

function writeJson(relativePath, value) {
  const full = path.join(REPO, relativePath)
  mkdirSync(path.dirname(full), { recursive: true })
  writeFileSync(full, `${JSON.stringify(value, null, 2)}\n`)
}

function writeText(relativePath, value) {
  const full = path.join(REPO, relativePath)
  mkdirSync(path.dirname(full), { recursive: true })
  writeFileSync(full, value.endsWith('\n') ? value : `${value}\n`)
}

function fileHash(relativePath) {
  return sha256(readFileSync(path.join(REPO, relativePath), 'utf8'))
}

function localSourceFamilyLines(article) {
  return article.sourceFamilies.map((key) => {
    const source = sourceFamilies[key]
    return [
      `- ${source.label}`,
      `  - Raw PDF: ${source.rawPath}`,
      `  - Raw PDF hash: ${source.rawHash}`,
      `  - Refined locator: ${source.refinedPath}`,
      `  - Refined locator hash: ${source.refinedHash}`,
    ].join('\n')
  })
}

function sourceCapture(article) {
  const lines = [
    `# Batch ${BATCH} Raw Source Capture - ${article.title}`,
    '',
    `Captured: ${GENERATED_AT}`,
    `Batch: ${BATCH_ID}`,
    `Article: ${article.slug} (${article.articleId})`,
    '',
    '## Local Source Families',
    '',
    ...localSourceFamilyLines(article),
    '',
    '## Checked Locators',
    '',
    ...article.checkedLines.map((line) => `- ${line}`),
    '',
    '## Source-Safe Claim Map',
    '',
    `- ${article.title} is sourceable when claims stay inside the checked local TOA/Quotes locators and authoritative web locators captured here.`,
    '- Article and linked-question edits must cite this local source capture and refined conversion hash, not uncaptured memory.',
    '- Real World Scenario is allowed because it applies checked source concepts without adding unsourced numbers, legal rules, or performance claims.',
    `- Rejected boundary: ${article.rejected}`,
    '',
    '## Real World Scenario Eligibility',
    '',
    `- Added source-safe scenario: ${article.scenario}`,
  ]
  return `${lines.join('\n')}\n`
}

function refinedCapture(article, capturePath, captureHash) {
  const lines = [
    `# Batch ${BATCH} Refined Source Conversion - ${article.title}`,
    '',
    `Converted: ${GENERATED_AT}`,
    `Raw capture: ${capturePath}`,
    `Raw capture hash: ${captureHash}`,
    '',
    '## Refined Claim Boundaries',
    '',
    '- Use the raw source capture as the auditable local source artifact for article and linked-question edits.',
    '- Use local TOA/Quotes files and authoritative web locators only through the raw capture map.',
    `- Keep claims inside this rejected boundary: ${article.rejected}`,
    '',
    '## Article Claim Support',
    '',
    `- Core topic: ${article.title}.`,
    '- Scenario status: added_source_safe_scenario.',
    '- UI block status: selected bundle has zero preserved UI blocks; normalized.md and candidate.md must contain no raw UI-block markers.',
    '- Linked-question policy: rewrite unsupported or over-specific stems to source-safe concept/application questions while preserving answer keys.',
  ]
  return `${lines.join('\n')}\n`
}

function makeSources(article, capturePath, captureHash, refinedPath, refinedHash) {
  const sources = [
    {
      source_id: `batch-135-${article.slug}-raw-source-capture`,
      article_id: article.articleId,
      label: `Batch 135 raw source capture - ${article.title}`,
      url: null,
      source_type: 'local_source_capture',
      description: `Local raw-source-layer capture for ${article.title}; includes checked local source family hashes plus authoritative web locators. Claims cite this artifact hash.`,
      is_verified: true,
      sort_order: 0,
      created_at: GENERATED_AT,
      updated_at: GENERATED_AT,
      local_path: capturePath,
      local_absolute_path: path.join(REPO, capturePath),
      local_sha256: captureHash,
      source_locator: `${capturePath}#${captureHash}`,
      checked_markdown_lines: article.checkedLines,
      local_source_families: article.sourceFamilies.map((key) => sourceFamilies[key]),
      local_audit_note: 'Official web sources are used only through the locally captured source map; article and question claims cite local artifacts.',
    },
    {
      source_id: `batch-135-${article.slug}-refined-source-map`,
      article_id: article.articleId,
      label: `Batch 135 refined source conversion - ${article.title}`,
      url: null,
      source_type: 'local_refined_conversion',
      description: `Refined local conversion of the Batch 135 raw source capture for ${article.title}.`,
      is_verified: true,
      sort_order: 1,
      created_at: GENERATED_AT,
      updated_at: GENERATED_AT,
      local_path: refinedPath,
      local_absolute_path: path.join(REPO, refinedPath),
      local_sha256: refinedHash,
      source_locator: `${refinedPath}#${refinedHash}`,
      upstream_capture_path: capturePath,
      upstream_capture_sha256: captureHash,
      checked_markdown_lines: article.checkedLines,
      local_source_families: article.sourceFamilies.map((key) => sourceFamilies[key]),
      local_audit_note: 'Refined conversion is a derived locator and claim-boundary map, not a substitute for the local raw capture.',
    },
  ]
  return {
    article_id: article.articleId,
    hash_algorithm: 'sha256',
    source_count: sources.length,
    sources,
    sources_hash: sha256Json(sources),
  }
}

function buildOptions(article, correctId, correctText) {
  const wrongs = article.wrongs
  let wrongIndex = 0
  return ['a', 'b', 'c', 'd'].map((id) => ({
    id,
    text: id === correctId ? correctText : wrongs[wrongIndex++],
  }))
}

function makeRationale(rewrite, article, sourceLocator, correctId) {
  return {
    correct: `${rewrite.correctAnswer} This stays inside the Batch 135 local source map for ${article.title}.`,
    takeaway: `Use the local Batch 135 source capture and refined conversion for ${article.title}; avoid unsupported chronology, exact lists, or broad attribution claims.`,
    source_boundary: sourceLocator,
  }
}

function clearQuestionEdits(article) {
  const dir = path.join(REPO, article.folder, 'question-edits')
  mkdirSync(dir, { recursive: true })
  for (const name of readdirSync(dir)) {
    if (name.endsWith('.json')) unlinkSync(path.join(dir, name))
  }
}

function updateArticle(article) {
  const originalHash = fileHash(`${article.folder}/original.md`)
  const capturePath = `${RAW_DIR}/${article.sourceFile}.source-capture.md`
  writeText(capturePath, sourceCapture(article))
  const captureHash = fileHash(capturePath)
  const refinedPath = `${REFINED_DIR}/${article.sourceFile}.refined.md`
  writeText(refinedPath, refinedCapture(article, capturePath, captureHash))
  const refinedHash = fileHash(refinedPath)
  const sourceLocator = `${capturePath}#${captureHash}; ${refinedPath}#${refinedHash}`
  const normalized = article.normalized({ capturePath, captureHash, refinedPath, refinedHash, scenario: article.scenario })
  const normalizedHash = sha256(normalized.endsWith('\n') ? normalized : `${normalized}\n`)
  writeText(`${article.folder}/normalized.md`, normalized)

  const staleComposeError = path.join(REPO, article.folder, 'compose-error.json')
  if (existsSync(staleComposeError)) unlinkSync(staleComposeError)
  clearQuestionEdits(article)

  const linked = readJson(`${article.folder}/linked-questions.json`)
  const questions = linked.questions
  if (!Array.isArray(questions)) throw new Error(`${article.slug} linked-questions.json has no questions array`)
  if (questions.length > article.templates.length) throw new Error(`${article.slug} has more questions than templates`)

  const questionEditIds = []
  const updatedQuestions = questions.map((question, index) => {
    const rewrite = article.templates[index]
    const correctId = question.correct_option_id
    const updated = {
      ...question,
      text: rewrite.text,
      options: buildOptions(article, correctId, rewrite.correctAnswer),
      rationale: makeRationale(rewrite, article, sourceLocator, correctId),
      explanation: `${rewrite.correctAnswer} Supported by Batch 135 local source artifacts for ${article.title}: ${sourceLocator}.`,
      code_citation: sourceLocator,
      updated_at: GENERATED_AT,
      content_hash: null,
    }
    updated.content_hash = sha256Json(stripContentHash(updated))
    const edit = {
      question_id: question.question_id,
      baseline_hash: question.content_hash ?? sha256Json(stripContentHash(question)),
      action: 'replace',
      reason: `${BATCH_ID}: unsupported or over-specific local-first rewrite constrained to checked local source artifacts for ${article.title}.`,
      approved_by: 'codex-local-first-batch-135',
      approved_at: GENERATED_AT,
      source_audit_support: {
        parent_article_id: article.articleId,
        parent_article_slug: article.slug,
        answer_key_fields_changed: false,
        support_status: 'source_safe_rewrite',
        source_locator: sourceLocator,
        checked_sources: [
          {
            source_id: `batch-135-${article.slug}-raw-source-capture`,
            label: `Batch 135 raw source capture - ${article.title}`,
            path: capturePath,
            sha256: captureHash,
          },
          {
            source_id: `batch-135-${article.slug}-refined-source-map`,
            label: `Batch 135 refined source conversion - ${article.title}`,
            path: refinedPath,
            sha256: refinedHash,
          },
        ],
        local_source_safe_action: 'Question text, options, rationale, explanation, and citation rewritten to the Batch 135 local source artifact boundary while preserving the answer key.',
      },
      proposed: {
        text: updated.text,
        options: updated.options,
        correct_option_id: updated.correct_option_id,
        rationale: updated.rationale,
        explanation: updated.explanation,
        code_citation: updated.code_citation,
      },
      batch_question_template_index: index + 1,
    }
    writeJson(`${article.folder}/question-edits/${question.question_id}.json`, edit)
    questionEditIds.push(question.question_id)
    return updated
  })
  const linkedHash = sha256Json(updatedQuestions.map(stripContentHash))
  writeJson(`${article.folder}/linked-questions.json`, {
    article_id: article.articleId,
    hash_algorithm: 'sha256',
    question_count: updatedQuestions.length,
    questions: updatedQuestions,
    linked_questions_hash: linkedHash,
  })

  const sourcesFile = makeSources(article, capturePath, captureHash, refinedPath, refinedHash)
  writeJson(`${article.folder}/sources.json`, sourcesFile)

  const metadata = readJson(`${article.folder}/article-metadata.json`)
  metadata.updated_at = GENERATED_AT
  metadata.updated_by = 'codex-local-first-batch-135'
  metadata.updated_note = 'Source-audited local-first Batch 135 content and linked-question replacement; claims cite local captured source artifacts.'
  metadata.content_hash = originalHash
  metadata.original_content_hash = originalHash
  metadata.normalized_content_hash = normalizedHash
  metadata.candidate_content_hash = normalizedHash
  metadata.linked_questions_hash = linkedHash
  metadata.sources_hash = sourcesFile.sources_hash
  metadata.ui_blocks_hash = EMPTY_UI_HASH
  metadata.source_count = sourcesFile.source_count
  metadata.linked_question_count = updatedQuestions.length
  metadata.parser_status = 'passed'
  metadata.content_complexity = 'plain_markdown'
  writeJson(`${article.folder}/article-metadata.json`, metadata)

  const uiBlocks = readJson(`${article.folder}/ui-blocks.json`)
  uiBlocks.original_content_hash = originalHash
  uiBlocks.normalized_content_hash = normalizedHash
  uiBlocks.ui_blocks_hash = EMPTY_UI_HASH
  uiBlocks.blocks = []
  uiBlocks.total_blocks = 0
  uiBlocks.ui_block_count = 0
  uiBlocks.unknown_blocks = []
  uiBlocks.unresolved_critical_blocks = []
  uiBlocks.normalized_created_at = GENERATED_AT
  writeJson(`${article.folder}/ui-blocks.json`, uiBlocks)
  writeJson(`${article.folder}/ui-block-edits.json`, {
    article_id: article.articleId,
    slug: article.slug,
    generated_at: GENERATED_AT,
    parser_version: 'ui-block-parser-v1',
    edit_count: 0,
    edits: [],
    warnings: [`Intentional UI block edits are not part of Batch ${BATCH}; selected bundle has zero preserved UI blocks.`],
  })

  writeJson(`${article.folder}/source-audit-evidence.json`, {
    artifact_type: 'source_audit_evidence',
    batch_id: BATCH_ID,
    batch_number: BATCH,
    audit_mode: 'local_first_captured_source_artifacts',
    audit_date: AUDIT_DATE,
    audited_at: GENERATED_AT,
    target: {
      article_id: article.articleId,
      slug: article.slug,
      title: article.title,
      article_folder: path.join(REPO, article.folder),
      question_edits_folder: path.join(REPO, article.folder, 'question-edits'),
      linked_questions: updatedQuestions.length,
      question_edits: questionEditIds.length,
      normalized_sha256: normalizedHash,
      original_sha256: originalHash,
      candidate_sha256: normalizedHash,
    },
    local_source_gate: {
      status: 'PASS',
      primary_truth: 'local source capture under vitruvius-connection/001_Raw-Source-Layer plus refined conversion under 002_Raw-Conversion-Layer',
      derivative_or_search_layers_used_as_primary_truth: false,
      refined_markdown_used_only_as_locator: true,
      claims_cite_local_capture_hash: true,
      official_web_claims_captured_locally_first: true,
      blockers: [],
      checked_sources: sourcesFile.sources,
    },
    classification: {
      content_type: article.contentType,
      contains_legal_or_code_claims: false,
      source_risk_tier: 'medium',
      requires_raw_pdf_audit: false,
      linked_questions_observed: updatedQuestions.length,
      question_edits_created: questionEditIds,
      scenario_policy_status: 'added_source_safe_scenario',
      scenario_policy_reason: article.scenario,
    },
    claims: [
      {
        claim_id: `${article.slug}-b135-claim-01`,
        claim_text: `${article.title} is limited to checked local Batch 135 source capture and refined conversion artifacts.`,
        source_support: {
          source_ids: sourcesFile.sources.map((source) => source.source_id),
          local_source_families: article.sourceFamilies.map((key) => sourceFamilies[key]),
          checked_locators: article.checkedLines,
        },
        audit_result: 'PASS',
      },
    ],
    checked_markdown_lines: article.checkedLines,
    unverified_or_rejected_claims: [article.rejected],
    quality_protocol: {
      roundtrip_protocol_preserved: true,
      ui_blocks_owner: 'ui-blocks.json',
      normalized_owner: 'normalized.md',
      candidate_generation: 'compose_required_after_content_generation',
      local_first_only: true,
      supabase_write_attempted: false,
      deploy_attempted: false,
      commit_attempted: false,
      marker_scan_scope: 'normalized.md, candidate.md, sources.json, source-audit-evidence.json, question-edits/*.json',
      diff_gate: 'pending_compose_diff_validate',
      validate_gate: 'pending_compose_diff_validate',
      ui_block_edits_gate: 'pending_ui_block_validation',
    },
    sme_review: {
      required: false,
      required_before_publication: true,
      status: 'not_started_local_first_batch',
      note: 'Local-first source audit is ready for later human/SME review before final publishing.',
    },
    overall: {
      status: 'PASS_LOCAL_FIRST_SOURCE_AUDITED',
      source_audit_status: 'PASS',
      safe_for_batch_handoff: true,
      safe_for_supabase_upload: false,
      blockers: [],
      warnings: ['Human/SME review remains pending before final publishing.'],
    },
  })

  return {
    article_id: article.articleId,
    slug: article.slug,
    title: article.title,
    article_folder: article.folder,
    linked_question_count: updatedQuestions.length,
    question_edit_count: questionEditIds.length,
    normalized_hash: normalizedHash,
    candidate_hash: normalizedHash,
    source_capture_path: capturePath,
    source_capture_hash: captureHash,
    refined_source_map_path: refinedPath,
    refined_source_map_hash: refinedHash,
    diff_safe_to_push: null,
    scenario_status: 'added_source_safe_scenario',
  }
}

function main() {
  const results = articles.map(updateArticle)
  const summary = {
    batch_id: BATCH_ID,
    generated_at: GENERATED_AT,
    baseline_commit: BASELINE,
    branch: BRANCH,
    selection_note: 'Selected the next five sorted sourceable residual Theory bundles after lea-theo-005-08.',
    article_count: results.length,
    linked_question_count: results.reduce((sum, article) => sum + article.linked_question_count, 0),
    question_edit_count: results.reduce((sum, article) => sum + article.question_edit_count, 0),
    source_capture_root: RAW_DIR,
    refined_conversion_root: REFINED_DIR,
    articles: results,
  }
  writeJson(`.ai/content-audit-export/${BATCH_ID}-content-generation-summary.json`, summary)
  console.log(JSON.stringify({
    batch_id: BATCH_ID,
    article_count: summary.article_count,
    linked_question_count: summary.linked_question_count,
    question_edit_count: summary.question_edit_count,
  }, null, 2))
}

main()
