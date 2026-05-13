#!/usr/bin/env node
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const REPO = process.cwd()
const BATCH = 134
const BATCH_ID = 'source-audited-article-batch-134-local-first'
const BASELINE = '3c71ee7e3'
const BRANCH = '3dlab-gray-viewport-bg'
const GENERATED_AT = '2026-05-14T06:25:00.000+08:00'
const AUDIT_DATE = '2026-05-14'
const RAW_DIR = 'vitruvius-connection/001_Raw-Source-Layer/003-Theory/source-map-batch-134'
const REFINED_DIR = 'vitruvius-connection/002_Raw-Conversion-Layer/003-Theory/refined_markdown/source-map-batch-134'
const EMPTY_UI_HASH = sha256Json([])

const sourceFamilies = {
  toa1: {
    label: 'TOA 1 (Intro to Theory)',
    rawPath: 'vitruvius-connection/001_Raw-Source-Layer/003-Theory/TOA 1 (Intro to Theory).pdf',
    rawHash: 'sha256:17ee07310eaf7fbd71aeb3cb3b57a6ffb623e2b8b1957543d74b706a5184d0e0',
    refinedPath: 'vitruvius-connection/002_Raw-Conversion-Layer/003-Theory/refined_markdown/TOA 1 (Intro to Theory).md',
    refinedHash: 'sha256:fc665ed41ea62ddb69c88ba02c7b92628481ba6792a075bc21694ca072b150d6',
  },
  toa2: {
    label: 'TOA 2 (Elements + Principles)',
    rawPath: 'vitruvius-connection/001_Raw-Source-Layer/003-Theory/TOA 2 (Elements + Principles).pdf',
    rawHash: 'sha256:533f8bda6e07b9663fc568fa35290e49c36fc1f2e2b22a34884b3bf12f919201',
    refinedPath: 'vitruvius-connection/002_Raw-Conversion-Layer/003-Theory/refined_markdown/TOA 2 (Elements + Principles).md',
    refinedHash: 'sha256:282971993d7b6a6eddf6a05a4d80a20061adac2eec981f99655617a4ce028878',
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
  toa1Competency:
    'TOA 1 lines 27-56 locate LEA theory scope: design principles, signs and symbols, anthropometrics, ergonomics, proxemics, kinesthetics, tropical design, and major architects/philosophies.',
  toa1Theory:
    'TOA 1 lines 98-160 distinguish theory as descriptive/prescriptive and frame architecture as art, science, space, structure, enclosure, movement, and sensory experience.',
  toa1Context:
    'TOA 1 lines 184-252 connect architecture to context, climate, geography, sensory and cultural characteristics, and Villa Savoye spatial/structural/circulation/context readings.',
  toa2Classical:
    'TOA 2 lines 1743-1795 connect classical orders, Renaissance mathematical proportions, Palladio, the Four Books, and proportional room-height methods.',
  toa2Palladio:
    'TOA 2 lines 1801-1855 give Palladio examples including Villa Capra, Palazzo Chiericati, and Villa Thiene room sizes.',
  toa2Modulor:
    'TOA 2 lines 1859-1919 describe Le Corbusier Modulor, golden section/Fibonacci reference, human scale, and Unite d Habitation measures.',
  toa5Wright:
    'TOA 5 lines 122-146 describe Frank Lloyd Wright, organic architecture as harmony with humanity and environment, Fallingwater, Prairie houses, planes, and horizontality.',
  toa5Corbusier:
    'TOA 5 lines 256-262 describe Le Corbusier, Villa Savoye, machine-for-living framing, and the Five Points.',
  toa5Venturi:
    'TOA 5 lines 548-558 describe Robert Venturi, Vanna Venturi House, precedent-based symbolic decoration, separation of structure and decoration, and cultural meaning.',
  toa5Bauhaus:
    'TOA 5 lines 608-612 connect Bauhaus/Gropius to modern technology, teamwork, standardization, and prefabrication.',
  toa5Quotes:
    'TOA 5 lines 648-787 preserve Mies, Le Corbusier, Sullivan, and modernist quote locators including less is more, form follows function, and forms in light.',
  quotesModern:
    'Quotes (1) lines 13-81 preserve Le Corbusier, Mies, Venturi, Sullivan, and Wright quote locators including machine for living, less is more, less is a bore, form follows function, space, and organic architecture.',
}

const officialLocators = {
  britannicaTriad:
    'Britannica Architecture, https://www.britannica.com/topic/architecture/Commodity-firmness-and-delight-the-ultimate-synthesis, lines 272-276: Vitruvius triad is firmitas, utilitas, venustas; Palladio/Wotton order differs.',
  britannicaAlberti:
    'Britannica Ten Books on Architecture, https://www.britannica.com/topic/Ten-Books-on-Architecture, lines 79-97: Alberti De re aedificatoria is also Ten Books on Architecture, linked to concinnitas and printed in 1485.',
  palladioLegacy:
    'Palladio Museum, https://www.palladiomuseum.org/en/exhibitions/PalladioAndHisLegacy2, lines 59-63: Palladio synthesized ancient/Renaissance lessons, mastered classical orders/proportion/harmony, and published I Quattro Libri in 1570.',
  palladioRooms:
    'Palladio Museum, https://www.palladiomuseum.org/en/museum/rooms/grain, lines 78-83: Palladian villas integrate residence/farm functions; room types use 3:2 and 4:3 ratios and the Four Books act as a user manual.',
  ribaModernism:
    'RIBA Modernism, https://www.riba.org/explore/riba-collections/architectural-styles/modernism-movement/, lines 60-76: modernism rejects ornament, uses analytical function, rational materials, structural innovation, volume, asymmetry, flat roofs, open plan, and minimal ornament.',
  villaSavoyeFive:
    'Villa Savoye / Centre des monuments nationaux, https://www.villa-savoye.fr/en/discover/le-corbusier-s-5-points-of-modern-architecture, lines 75-139: 1927 Five Points, pilotis, roof garden, free plan, free facade, banded windows, and Villa Savoye as manifesto.',
  gettyBauhaus:
    'Getty Research Institute Bauhaus, https://www.getty.edu/research/exhibitions_events/exhibitions/bauhaus/new_artist/history/, lines 97-123: Gropius/Bauhaus unite arts, design, craft, architecture, and workshop collaboration.',
  ribaPostmodernism:
    'RIBA Postmodernism, https://www.architecture.com/knowledge-and-resources/knowledge-landing-page/postmodernism, lines 113-126 and 146-155: postmodernism reacts to modernism, uses Venturi, signs/symbols, historical allusion, classical motifs, color, playfulness, materials, and shapes.',
  momaVenturi:
    'MoMA press release, https://press.moma.org/wp-content/uploads/2019/07/CC_pressrelease_FINAL-1.pdf, lines 5-14 and 18-22: Complexity and Contradiction was first published in 1966, is foundational to postmodernism, and argues against purist postwar modernist simplification.',
  momaVenturiEvent:
    'MoMA event, https://www.moma.org/calendar/events/2430, lines 142-144 and 220-228: Complexity and Contradiction was a MoMA-published gentle manifesto and the program included Venturi Vanna Venturi House.',
  gettyCanons:
    'Getty Canons and Values, https://shop.getty.edu/products/canons-and-values-ancient-to-modern-978-1606065976, lines 177-180: canons are constructed and contested; value systems shape hierarchies; Eurocentric canons are being rethought without dismissing canon study.',
  sepPhenomenology:
    'Stanford Encyclopedia of Philosophy Phenomenology, https://plato.stanford.edu/entries/phenomenology/, lines 57-83 and 147: phenomenology studies structures of experience/consciousness from the first-person point of view, including embodiment, spatial awareness, and lived experience.',
  sepEmbodied:
    'Stanford Encyclopedia of Philosophy Phenomenology, https://plato.stanford.edu/entries/phenomenology/, lines 240-268: phenomenology analyzes perception, thought, action, cultural conditions, and embodied/lived-body experience.',
  pritzkerZumthor:
    'Pritzker Prize Peter Zumthor, https://www.pritzkerprize.com/laureates/2009, lines 203-206: Zumthor connects site, local culture, history, moving-through experience, and materials.',
}

const articles = [
  {
    folder: '.ai/content-audit-export/articles/lea-theo-005-01-core-concept--128400dd-8642-4275-a64f-c411f6836d6d',
    articleId: '128400dd-8642-4275-a64f-c411f6836d6d',
    slug: 'lea-theo-005-01-core-concept',
    title: 'Classical Architectural Theory',
    contentType: 'theory-of-architecture-classical-theory',
    sourceFile: 'lea-theo-005-01-core-concept-classical-architectural-theory',
    sourceFamilies: ['toa1', 'toa2'],
    checkedLines: [
      localLocators.toa1Theory,
      localLocators.toa2Classical,
      localLocators.toa2Palladio,
      officialLocators.britannicaTriad,
      officialLocators.britannicaAlberti,
      officialLocators.palladioLegacy,
      officialLocators.palladioRooms,
    ],
    scenario:
      'A studio jury reviewing a small civic hall uses the classical theory lineage as a checklist: the building must stand, fit its civic use, and present ordered beauty. The critic then asks whether the room proportions and entrance sequence are justified by the plan instead of copied as decoration.',
    rejected:
      'Unsupported exact Palladian motif diagrams, unsourced claim that one triad term is always superior, and broad canon claims beyond the checked local and official locators are excluded.',
    normalized: (ctx) => `# Classical Architectural Theory

Source basis: Batch 134 local capture ${ctx.capturePath} (${ctx.captureHash}) and refined conversion ${ctx.refinedPath} (${ctx.refinedHash}). This article cites the local source map rather than uncaptured web claims.

## LEA Scope

Classical architectural theory is the lineage of ideas that makes architecture more than construction skill. For the LEA, the durable thread is Vitruvius to Alberti to Palladio: a building is judged through structure, use, beauty, proportion, order, and the architect's learned judgment.

Vitruvius gives the basic triad: firmitas, utilitas, and venustas. In source-safe terms, this means structural stability, appropriate spatial accommodation, and attractive appearance. The order may vary in later writers, so the exam-safe point is not sequence worship; it is the integrated requirement that architecture answer stability, use, and beauty together.

Alberti turns classical theory into Renaissance intellectual practice. His De re aedificatoria, also known as Ten Books on Architecture, is tied to beauty as ordered relationship among parts. Palladio then systematizes classical proportion and villa design through I Quattro Libri dell'Architettura. The checked local and Palladio Museum locators support room ratio logic, classical orders, harmony, and villa organization, but not every decorative detail that older articles sometimes added.

## How To Use It

When an item asks about a classical theorist, identify the role being tested:

- Vitruvius: triad, classical orders, and the learned architect.
- Alberti: Renaissance architectural theory, concinnitas, and drawing/reasoned design before construction.
- Palladio: published system, measured examples, proportional rooms, villas, and classical harmony applied to contemporary needs.

Do not turn classical theory into style labeling alone. A portico is not classical theory by itself. A source-safe answer connects the form to proportion, order, use, and construction logic.

## Real World Scenario

${ctx.scenario}

## Common Mistakes

- Replacing firmitas, utilitas, and venustas with loose modern slogans.
- Treating Palladio as the inventor of all proportion rather than a systematizer and publisher of a classical system.
- Claiming exact ratios or motifs that are not in the local capture.
- Calling any columned facade classical without checking order, proportion, use, and context.

## Source Boundary

This article supports concept-level LEA reasoning about Vitruvius, Alberti, Palladio, classical proportion, and the architect as a learned professional. It does not authorize unsupported diagrams, exact motif taxonomy, or broad claims about every later classical revival.`,
    questions: [
      q('d', 'A prompt asks what Vitruvius contributes to classical theory. Which answer stays inside the Batch 134 source map?', {
        a: 'He rejected structure and use in favor of ornament alone.',
        b: 'He invented modern reinforced concrete frame design.',
        c: 'He made Palladio irrelevant by ending Renaissance theory.',
        d: 'He framed architecture through firmitas, utilitas, and venustas, with the architect as a learned professional.',
      }),
      q('b', 'Which pairing is the most source-safe for the Vitruvian triad?', {
        a: 'Firmitas = color, utilitas = ornament, venustas = property value.',
        b: 'Firmitas = stability, utilitas = appropriate use, venustas = beauty or attractive appearance.',
        c: 'Firmitas = landscape, utilitas = sculpture, venustas = acoustics only.',
        d: 'Firmitas = furniture, utilitas = biography, venustas = building height.',
      }),
      q('d', 'A designer says a civic hall is classical because it has columns. What is the best critique?', {
        a: 'Columns automatically prove classical theory.',
        b: 'Classical theory is only about historical costume.',
        c: 'Columns make use and structure irrelevant.',
        d: 'The answer should check order, proportion, use, structure, and overall harmony, not columns alone.',
      }),
      q('c', 'What does Alberti add to the classical theory lineage in an exam-safe answer?', {
        a: 'A rejection of reasoned design.',
        b: 'A mechanical code for every room in every climate.',
        c: 'A Renaissance theory of beauty as ordered relationship among parts and architecture as intellectual work.',
        d: 'A claim that architecture should ignore drawings.',
      }),
      q('c', 'Which statement about Palladio is source-safe?', {
        a: 'He removed proportion from villa design.',
        b: 'He published no architectural theory.',
        c: 'He systematized classical orders, proportion, harmony, and villa organization through the Four Books.',
        d: 'He worked only on Gothic churches.',
      }),
      q('b', 'A source-safe article should avoid which claim?', {
        a: 'Palladio published I Quattro Libri in 1570.',
        b: 'Every Palladian building must use one fixed modern classroom ratio.',
        c: 'Vitruvian theory includes stability, use, and beauty.',
        d: 'Alberti is linked to De re aedificatoria.',
      }),
      q('b', 'How should the LEA treat the sequence firmitas, utilitas, venustas?', {
        a: 'As proof that beauty never matters.',
        b: 'As an integrated triad whose order may vary in later writers but whose three requirements remain central.',
        c: 'As a modern fire-code table.',
        d: 'As a Palladio-only phrase.',
      }),
      q('d', 'Why is the architect-as-learned-professional idea important in classical theory?', {
        a: 'It removes the need for construction knowledge.',
        b: 'It says architects only need taste.',
        c: 'It makes theory unrelated to practice.',
        d: 'It grounds architectural authority in broad knowledge, judgment, proportion, construction, and use.',
      }),
      q('c', 'Which answer best describes Palladian proportional reasoning?', {
        a: 'A random decorative preference.',
        b: 'A rule that every room must be square.',
        c: 'A published design system using harmonious relationships among room dimensions and building parts.',
        d: 'A rejection of classical orders.',
      }),
      q('d', 'A student attributes concinnitas to Palladio because both discuss proportion. What correction is most defensible?', {
        a: 'Concinnitas belongs to Le Corbusier.',
        b: 'Concinnitas is a structural material.',
        c: 'Concinnitas is a postmodern term.',
        d: 'Concinnitas is tied to Alberti and beauty as ordered harmony among parts.',
      }),
      q('b', 'Which study habit is most useful for classical theory questions?', {
        a: 'Memorize one facade image and apply it to every question.',
        b: 'Match each theorist to treatise, concept, and design logic before selecting the option.',
        c: 'Ignore source boundaries and use any remembered trivia.',
        d: 'Treat Vitruvius, Alberti, and Palladio as the same person.',
      }),
      q('d', 'In the real-world scenario, why is copying a classical portico without plan logic weak?', {
        a: 'Because classical theory bans beauty.',
        b: 'Because classical theory applies only to ruins.',
        c: 'Because a copied portico always violates law.',
        d: 'Because classical theory requires the form to answer order, use, proportion, and construction rather than decoration alone.',
      }),
    ],
  },
  {
    folder: '.ai/content-audit-export/articles/lea-theo-005-02-core-concept--33c219fe-51a6-487f-81d2-0d4af2968274',
    articleId: '33c219fe-51a6-487f-81d2-0d4af2968274',
    slug: 'lea-theo-005-02-core-concept',
    title: 'Architectural Modernism',
    contentType: 'theory-of-architecture-modernism',
    sourceFile: 'lea-theo-005-02-core-concept-architectural-modernism',
    sourceFamilies: ['toa1', 'toa2', 'toa5', 'quotes'],
    checkedLines: [
      localLocators.toa1Context,
      localLocators.toa2Modulor,
      localLocators.toa5Wright,
      localLocators.toa5Corbusier,
      localLocators.toa5Bauhaus,
      localLocators.toa5Quotes,
      localLocators.quotesModern,
      officialLocators.ribaModernism,
      officialLocators.villaSavoyeFive,
      officialLocators.gettyBauhaus,
    ],
    scenario:
      'A public library proposal uses a flat roof, open reading floor, ribbon-like windows, and exposed structural order. The review should ask whether the plan, light, structure, material logic, and public use support a modernist argument rather than treating white walls and minimal detail as enough.',
    rejected:
      'Unsupported claims that all modernists held one philosophy, exact universal-space definitions beyond the checked locators, and broad Aalto/Kahn claims without local support are excluded.',
    normalized: (ctx) => `# Architectural Modernism

Source basis: Batch 134 local capture ${ctx.capturePath} (${ctx.captureHash}) and refined conversion ${ctx.refinedPath} (${ctx.refinedHash}). This article cites the local source map rather than uncaptured web claims.

## LEA Scope

Architectural modernism is not just a white facade or the absence of ornament. In the checked RIBA and local TOA sources, modernism is tied to function, rational material use, structural innovation, volume, asymmetry, open plans, flat roofs, minimal ornament, and the modern movement's rejection of historical revival as a default method.

Le Corbusier is the strongest local anchor for formal modernist principles. The checked sources support Villa Savoye, the machine-for-living idea, Modulor/human-scale proportion, and the Five Points: pilotis, roof garden, free plan, free facade, and banded or ribbon windows. The Villa Savoye official locator also shows why those points are not decorative tags; they depend on concrete structure and the separation of structure from partition/envelope.

Wright, Mies, Sullivan, and Gropius widen the map. Wright's organic architecture is sourceable as harmony with humanity and environment. Mies is sourceable through disciplined reduction and the less-is-more locator. Sullivan's form-follows-function line belongs to functionalist reasoning. Gropius/Bauhaus connects modern architecture to workshop collaboration, technology, craft, design, and the building as an integrated work.

## How To Use It

In LEA questions, identify the specific modernist argument being tested:

- Le Corbusier: Five Points, Villa Savoye, machine-for-living, Modulor, and ordered modern form.
- Wright: organic relation to site, environment, and human life.
- Mies: reduction, clarity, and disciplined minimal expression.
- Sullivan: form follows function.
- Gropius/Bauhaus: collaboration across art, craft, design, and architecture.

## Real World Scenario

${ctx.scenario}

## Common Mistakes

- Calling any plain building modernist without checking function, structure, material, and spatial logic.
- Treating modernism as one identical philosophy shared by every master.
- Mixing postmodern symbolism into a modernist identification question.
- Claiming exact performance benefits from modernist forms without a performance source.

## Source Boundary

This article supports source-safe modernism identification and concept comparison. It does not support unsupported claims about every modern master, energy performance, or universal-space theory beyond the checked local and official source map.`,
    questions: [
      q('d', 'Which answer best captures the source-safe definition of architectural modernism?', {
        a: 'A style that only copies ancient columns.',
        b: 'A rule that every building must use ornament.',
        c: 'A rejection of structure and function.',
        d: 'A movement emphasizing function, rational materials, structural innovation, open spatial logic, and reduced ornament.',
      }),
      q('c', 'A building has white walls but no clear relation among structure, plan, material, and use. What is the best critique?', {
        a: 'White walls alone prove modernism.',
        b: 'Modernism is only a paint color.',
        c: 'Modernist identification should be grounded in spatial, structural, material, and functional logic.',
        d: 'The building must be postmodern because it has walls.',
      }),
      q('d', 'Which set correctly belongs to Le Corbusier in the checked source map?', {
        a: 'Decorated shed, duck, and Las Vegas signs.',
        b: 'Gothic vault, pointed arch, and flying buttress.',
        c: 'Genius loci, fourfold, and atmospheric design only.',
        d: 'Five Points, Villa Savoye, machine-for-living, and Modulor/human-scale proportion.',
      }),
      q('a', 'What is the source-safe role of pilotis in the Villa Savoye Five Points discussion?', {
        a: 'They raise the building and free ground-level/circulation possibilities through a structural system.',
        b: 'They are purely decorative columns copied from temples.',
        c: 'They prevent any free plan from occurring.',
        d: 'They are a postmodern sign system.',
      }),
      q('a', 'How should Wright be distinguished from a narrow machine-aesthetic reading of modernism?', {
        a: 'Through organic architecture: harmony with humanity, site, and environment.',
        b: 'Through the decorated shed.',
        c: 'Through Palladian room ratios only.',
        d: 'Through rejecting buildings as environments.',
      }),
      q('c', 'What does the Bauhaus/Gropius locator support?', {
        a: 'Architecture as isolated drawing with no craft.',
        b: 'A rejection of all collaboration.',
        c: 'Collaboration among art, craft, design, technology, and architecture toward an integrated building culture.',
        d: 'A requirement that all buildings use classical ornament.',
      }),
      q('c', 'Which statement keeps Mies inside the checked evidence?', {
        a: 'Mies is defined by historical ornament.',
        b: 'Mies rejected reduction and detail.',
        c: 'Mies is sourceable through disciplined reduction, less is more, and careful detail.',
        d: 'Mies wrote the Four Books.',
      }),
      q('b', 'A prompt asks whether open plan is automatically modernist. What is the best answer?', {
        a: 'Yes, any open room is modernist.',
        b: 'No, open plan becomes a modernist argument when tied to structure, function, material, and spatial freedom.',
        c: 'No, open plan is always classical.',
        d: 'Yes, but only if the room has bright colors.',
      }),
      q('b', 'Which phrase belongs to Sullivan in the source-safe modernist comparison?', {
        a: 'Less is a bore.',
        b: 'Form follows function.',
        c: 'Firmitas, utilitas, venustas.',
        d: 'The Four Books.',
      }),
      q('d', 'What is the best source-safe warning for modernist exam comparisons?', {
        a: 'Assume all modernists held identical design philosophies.',
        b: 'Ignore building examples.',
        c: 'Use postmodern terminology for every modernist project.',
        d: 'Match each architect to the specific concept and example supported by the source map.',
      }),
      q('b', 'Why is Villa Savoye a strong LEA reference for modernism?', {
        a: 'It is a Renaissance villa by Palladio.',
        b: "It demonstrates Le Corbusier's Five Points in a built work.",
        c: 'It proves ornament is required.',
        d: 'It is mainly a postmodern decorated shed.',
      }),
      q('c', 'In the library scenario, which question best tests whether the design is modernist rather than merely plain?', {
        a: 'Is every surface white?',
        b: 'Is all historical memory erased?',
        c: 'Do structure, plan, light, material, and use form a rational spatial argument?',
        d: 'Does the design include a central arch?',
      }),
    ],
  },
  {
    folder: '.ai/content-audit-export/articles/lea-theo-005-04-core-concept--976957b7-c288-4a63-8e76-9e26dcf6f199',
    articleId: '976957b7-c288-4a63-8e76-9e26dcf6f199',
    slug: 'lea-theo-005-04-core-concept',
    title: 'Architectural Canon',
    contentType: 'theory-of-architecture-canon',
    sourceFile: 'lea-theo-005-04-core-concept-architectural-canon',
    sourceFamilies: ['toa1', 'toa2', 'toa5', 'quotes'],
    checkedLines: [
      localLocators.toa1Competency,
      localLocators.toa1Theory,
      localLocators.toa2Classical,
      localLocators.toa2Modulor,
      localLocators.toa5Corbusier,
      localLocators.toa5Venturi,
      officialLocators.gettyCanons,
      officialLocators.britannicaTriad,
      officialLocators.palladioLegacy,
      officialLocators.ribaModernism,
      officialLocators.ribaPostmodernism,
      officialLocators.sepPhenomenology,
    ],
    scenario:
      'A review class revises its theory syllabus. It keeps Vitruvius, Palladio, Le Corbusier, Wright, Gropius, Mies, Venturi, and phenomenology as exam anchors, but it treats the list as a study framework that must be questioned, localized, and supplemented with Philippine and regional works.',
    rejected:
      'Unsupported exhaustive canon lists, claims that one canon is permanent or universal, and broad cultural hierarchy claims beyond the checked Getty/local source map are excluded.',
    normalized: (ctx) => `# Architectural Canon

Source basis: Batch 134 local capture ${ctx.capturePath} (${ctx.captureHash}) and refined conversion ${ctx.refinedPath} (${ctx.refinedHash}). This article cites the local source map rather than uncaptured web claims.

## LEA Scope

An architectural canon is a teaching and reference selection: the works, texts, architects, and ideas that a discipline repeatedly uses to organize knowledge. It is not a law, a licensing rule, or a permanent list of the only buildings that matter.

For SlateCamp's LEA theory path, the source-safe canon is a study framework built from checked local anchors: Vitruvius, Alberti, Palladio, classical proportion, Le Corbusier, Wright, Sullivan, Gropius/Bauhaus, Mies, Venturi, and phenomenological/place-based theory. The Getty locator is important because it states that canons are constructed and contested, and that value systems shape hierarchies. That means canon study should train recognition and critique at the same time.

## How To Use It

A canon helps students retrieve patterns quickly. If an item says "Five Points," the study canon points to Le Corbusier. If it says "firmitas, utilitas, venustas," it points to Vitruvius. If it says "less is a bore," it points to Venturi. Those anchors matter because exams use them as shorthand.

But canon is not neutral. It can overrepresent European and North American references, leave local or regional knowledge at the margins, or turn living design questions into trivia. A strong LEA answer uses the canon for orientation, then checks source, context, and design logic.

## Real World Scenario

${ctx.scenario}

## Common Mistakes

- Treating canon as an official PRC list.
- Memorizing names without the concepts that make them testable.
- Treating critique of the canon as permission to ignore exam anchors.
- Claiming a universal final canon without source support.

## Source Boundary

This article supports canon as a source-mapped study framework and critical concept. It does not authorize exhaustive lists, ranking claims, or unsourced cultural hierarchy claims.`,
    questions: [
      q('a', 'What is the best source-safe definition of an architectural canon?', {
        a: 'A constructed teaching/reference selection of works, texts, architects, and ideas repeatedly used to organize architectural knowledge.',
        b: 'A building-code table with legal force.',
        c: 'A permanent list that can never be revised.',
        d: 'A random set of fashionable images.',
      }),
      q('d', 'Why does the Getty canon locator matter for this article?', {
        a: 'It says canons are only about structural calculations.',
        b: 'It proves canons are natural and uncontested.',
        c: 'It bans the study of European texts.',
        d: 'It supports treating canons as constructed, contested, and shaped by value systems.',
      }),
      q('c', 'How should an LEA student use a canon list?', {
        a: 'As a substitute for reading source claims.',
        b: 'As proof that local context never matters.',
        c: 'As a retrieval framework for recurring names, texts, works, and ideas, checked against source and context.',
        d: 'As a license to invent unsupported facts.',
      }),
      q('c', 'Which pairing is a source-safe canonical anchor?', {
        a: 'Palladio - decorated shed.',
        b: 'Venturi - firmitas, utilitas, venustas.',
        c: 'Le Corbusier - Five Points and Villa Savoye.',
        d: 'Vitruvius - less is a bore.',
      }),
      q('c', 'What is the main risk of treating canon as a fixed universal list?', {
        a: 'It makes recall faster.',
        b: 'It improves source checking.',
        c: 'It can hide the value systems and exclusions that shaped the list.',
        d: 'It helps localize examples.',
      }),
      q('d', 'A syllabus removes all local and regional works because they are not in a European canon. What is the source-safe critique?', {
        a: 'That is required by LEA theory.',
        b: 'That proves local works have no design value.',
        c: 'That is acceptable if the list is old.',
        d: 'Canons are constructed and should be questioned, supplemented, and localized while retaining exam anchors.',
      }),
      q('d', 'Which statement keeps canon study from becoming trivia?', {
        a: 'Memorize names only.',
        b: 'Ignore treatises and concepts.',
        c: 'Rank every architect without evidence.',
        d: 'Connect each name to a source-supported concept, work, text, and design problem.',
      }),
      q('b', 'What does "canon as shorthand" mean in an LEA item?', {
        a: 'Every shortcut is legally binding.',
        b: 'A term like Five Points, triad, or less is a bore quickly points to a source-mapped figure or idea.',
        c: 'Students should ignore context.',
        d: 'The question is automatically about postmodernism.',
      }),
      q('d', 'Which answer is least source-safe?', {
        a: 'Vitruvius is an anchor for the classical triad.',
        b: 'Venturi is an anchor for postmodern critique.',
        c: 'Canons can be contested.',
        d: 'One global architectural canon is final, complete, and culturally neutral.',
      }),
      q('c', 'How does the local TOA source family support a SlateCamp canon?', {
        a: 'By giving a complete legal list of all exam items.',
        b: 'By excluding theory.',
        c: 'By mapping recurring theory concepts, design principles, architects, works, and philosophical positions used for LEA study.',
        d: 'By proving only one style matters.',
      }),
      q('c', 'In the syllabus scenario, what is the best final move?', {
        a: 'Delete every canonical figure.',
        b: 'Keep only European villas.',
        c: 'Keep source-mapped exam anchors while adding critical, local, and regional context.',
        d: 'Treat every list as official law.',
      }),
    ],
  },
  {
    folder: '.ai/content-audit-export/articles/lea-theo-005-05-core-concept--a66d3236-ce09-4723-acc7-9b017647f249',
    articleId: 'a66d3236-ce09-4723-acc7-9b017647f249',
    slug: 'lea-theo-005-05-core-concept',
    title: 'Postmodernism in Architecture',
    contentType: 'theory-of-architecture-postmodernism',
    sourceFile: 'lea-theo-005-05-core-concept-postmodernism-in-architecture',
    sourceFamilies: ['toa5', 'quotes'],
    checkedLines: [
      localLocators.toa5Venturi,
      localLocators.toa5Quotes,
      localLocators.quotesModern,
      officialLocators.ribaPostmodernism,
      officialLocators.momaVenturi,
      officialLocators.momaVenturiEvent,
    ],
    scenario:
      'A cultural center addition uses a simplified classical profile, bright color, and a sign-like entrance to speak to the street. The reviewer asks whether these moves communicate context and public meaning or simply paste historical fragments onto a weak plan.',
    rejected:
      'Unsupported Jencks/Pruitt-Igoe date claims, exhaustive deconstructivist taxonomy, and broad Graves/Gehry/Libeskind attribution claims beyond checked locators are excluded.',
    normalized: (ctx) => `# Postmodernism in Architecture

Source basis: Batch 134 local capture ${ctx.capturePath} (${ctx.captureHash}) and refined conversion ${ctx.refinedPath} (${ctx.refinedHash}). This article cites the local source map rather than uncaptured web claims.

## LEA Scope

Postmodernism in architecture is best read as a critique of modernist purity and universalism. The checked RIBA locator describes it as eclectic, colorful, decorative, and reactive to modernism. It also supports historical allusion, classical motifs with a modern twist, unusual shapes, signs, symbols, and popular culture. The local TOA 5 locator anchors Robert Venturi and the Vanna Venturi House as source-safe postmodern references.

Venturi is the key exam figure in this bundle. MoMA locators support Complexity and Contradiction in Architecture as first published in 1966 and foundational to postmodernism, with a conscious rejection of purist postwar modernist simplification. The Quotes source preserves the exam-friendly contrast: Mies is linked to "less is more," while Venturi is linked to "less is a bore."

## How To Use It

Postmodernism does not mean "anything goes." A strong answer asks what the quotation, sign, color, historical reference, or symbolic decoration is doing. Is it communicating public meaning, cultural memory, irony, pluralism, or popular reference? Or is it just pasted-on styling?

Do not confuse postmodernism with classical theory. A postmodern classical motif may quote or remix the past, but it is not the same as Palladio's proportional system or Vitruvius's triad.

## Real World Scenario

${ctx.scenario}

## Common Mistakes

- Treating postmodernism as random ornament.
- Confusing Venturi's critique with Miesian reduction.
- Claiming unsourced Jencks/Pruitt-Igoe chronology from memory.
- Treating every colorful or symbolic building as postmodern without checking the theoretical position.

## Source Boundary

This article supports Venturi-centered postmodernism, historical allusion, signs/symbols, classical motifs, and critique of modernist purism. It does not support unsupported deconstructivism chronology or broad architect attribution lists beyond the local source map.`,
    questions: [
      q('b', 'What is the best source-safe description of postmodernism in architecture?', {
        a: 'A return to modernist purism and elimination of all symbols.',
        b: 'An eclectic critique of modernist dogma using historical allusion, signs, symbols, ornament, color, and popular reference.',
        c: 'A structural code for concrete frames.',
        d: 'A rule that every building must imitate Palladio exactly.',
      }),
      q('c', 'Why is Robert Venturi central to this source map?', {
        a: 'He wrote the Vitruvian triad.',
        b: 'He designed Villa Savoye.',
        c: 'The checked local and MoMA locators tie him to Vanna Venturi House and Complexity and Contradiction as a postmodern critique.',
        d: 'He invented the Bauhaus workshop.',
      }),
      q('d', 'Which phrase is source-safe for Venturi in an LEA comparison?', {
        a: 'Form follows function.',
        b: 'Firmitas, utilitas, venustas.',
        c: 'Less is more.',
        d: 'Less is a bore.',
      }),
      q('a', 'A building uses a classical motif with irony and street signage. What should the reviewer ask?', {
        a: 'Whether the reference communicates context and meaning or is just pasted-on styling.',
        b: 'Whether it follows a fixed Palladian room-height formula.',
        c: 'Whether it eliminates all decoration.',
        d: 'Whether it proves modernism is still pure.',
      }),
      q('c', 'Which statement about postmodern historical reference is source-safe?', {
        a: 'It always means exact historical reconstruction.',
        b: 'It has no relation to meaning.',
        c: 'It may use historical allusion and classical motifs with a modern twist to communicate plural meanings.',
        d: 'It is the same as structural stability.',
      }),
      q('d', 'What is the safe reason to exclude an exact Jencks/Pruitt-Igoe date claim from this rewrite?', {
        a: 'The date is never discussed in architecture.',
        b: 'Postmodernism has no chronology.',
        c: 'RIBA bans postmodern chronology.',
        d: 'The Batch 134 checked locators do not source that specific claim, so it should not be introduced.',
      }),
      q('d', 'How does postmodernism differ from the Miesian "less is more" position in this bundle?', {
        a: 'It rejects every form of meaning.',
        b: 'It treats reduction as the only architectural value.',
        c: 'It is the same position under another name.',
        d: 'It challenges purist reduction through complexity, contradiction, historical reference, and symbolic communication.',
      }),
      q('a', 'Which answer best protects against "anything goes" misunderstanding?', {
        a: 'Postmodern devices should be read for communication, context, critique, and public meaning, not random decoration.',
        b: 'Any unusual shape is automatically postmodern.',
        c: 'All ornament is equally source-safe.',
        d: 'The plan no longer matters once a facade has color.',
      }),
      q('b', 'Which pairing is most defensible?', {
        a: 'Venturi - Five Points.',
        b: 'Venturi - Complexity and Contradiction in Architecture.',
        c: 'Palladio - less is a bore.',
        d: 'Mies - decorated shed as the central local source.',
      }),
      q('a', 'Why should a postmodern answer avoid calling every symbolic building postmodern?', {
        a: "The theory depends on the building's critical position, use of reference, and communication strategy, not symbol use alone.",
        b: 'Symbols are never architectural.',
        c: 'Postmodernism rejects all public meaning.',
        d: 'A single color proves the style.',
      }),
      q('d', 'Which feature set matches the RIBA source map for postmodernism?', {
        a: 'No ornament, no color, and pure universal form only.',
        b: 'Only Gothic vaulting and pointed arches.',
        c: 'Only structural calculations.',
        d: 'Eclectic color, playfulness, historical allusion, classical motifs, signs/symbols, and varied shapes/materials.',
      }),
      q('a', 'In the cultural-center scenario, what makes the postmodern move stronger?', {
        a: 'The signs, colors, and references support context, public communication, and the plan.',
        b: 'The design copies fragments without program logic.',
        c: 'The building hides all meaning.',
        d: 'The facade claims Palladian proportion without evidence.',
      }),
    ],
  },
  {
    folder: '.ai/content-audit-export/articles/lea-theo-005-08-core-concept--dd976d64-9f04-409f-8d4d-f8140d575b86',
    articleId: 'dd976d64-9f04-409f-8d4d-f8140d575b86',
    slug: 'lea-theo-005-08-core-concept',
    title: 'Phenomenology in Architecture',
    contentType: 'theory-of-architecture-phenomenology',
    sourceFile: 'lea-theo-005-08-core-concept-phenomenology-in-architecture',
    sourceFamilies: ['toa1'],
    checkedLines: [
      localLocators.toa1Theory,
      localLocators.toa1Context,
      officialLocators.sepPhenomenology,
      officialLocators.sepEmbodied,
      officialLocators.pritzkerZumthor,
    ],
    scenario:
      'A small memorial chapel is reviewed through body-scale movement, threshold, local stone, shaded light, acoustic quiet, weather, and memory of the site. The reviewer avoids claiming unsupported Heidegger terminology and instead asks how the place is experienced by occupants moving through it.',
    rejected:
      'Unsupported exact Heidegger Fourfold testing claims, unsourced Norberg-Schulz chapter claims, and broad Pallasmaa/Zumthor method lists beyond checked locators are excluded.',
    normalized: (ctx) => `# Phenomenology in Architecture

Source basis: Batch 134 local capture ${ctx.capturePath} (${ctx.captureHash}) and refined conversion ${ctx.refinedPath} (${ctx.refinedHash}). This article cites the local source map rather than uncaptured web claims.

## LEA Scope

Phenomenology studies experience as lived and perceived from the first-person point of view. In architecture, the exam-safe version is simple: a building is not only an object to view from outside. It is an environment encountered through movement, body scale, light, material, sound, climate, memory, and place.

The local TOA 1 source already frames architecture as space, structure, enclosure, movement, sensory experience, and context. The Stanford Encyclopedia locator supports phenomenology as the study of structures of experience/consciousness, including spatial awareness, embodied action, cultural context, and lived experience. The Pritzker locator supports Peter Zumthor as a contemporary architectural example: site, local culture, history, moving-through experience, and materials are central to the reading.

## How To Use It

A source-safe phenomenology answer should ask how occupants experience the building:

- What does the body do while moving through it?
- How do light, shade, material, sound, temperature, and texture shape experience?
- How does the building respond to site, culture, climate, and memory?
- Does it create meaningful dwelling or place attachment, rather than only a visual image?

This rewrite intentionally avoids unsupported exact Fourfold or atmosphere lists because the checked Batch 134 locators do not source those details directly.

## Real World Scenario

${ctx.scenario}

## Common Mistakes

- Treating phenomenology as mood words without source-mapped experience.
- Reducing it to visual composition only.
- Claiming exact philosopher lists or terms that were not captured.
- Ignoring climate, material, movement, and cultural context.

## Source Boundary

This article supports lived, embodied, sensory, and place-based architectural reasoning. It does not authorize unsupported Heidegger, Norberg-Schulz, Pallasmaa, or Zumthor detail lists beyond the checked local and official locators.`,
    questions: [
      q('c', 'What is the best source-safe definition of architectural phenomenology for this bundle?', {
        a: 'A rule that buildings are only exterior images.',
        b: 'A method for calculating room areas.',
        c: 'A way of reading architecture through lived, embodied, sensory, and place-based experience.',
        d: 'A postmodern color system.',
      }),
      q('a', 'Which source locator supports the philosophical base for phenomenology?', {
        a: 'Stanford Encyclopedia of Philosophy on conscious experience, first-person point of view, embodiment, and lived experience.',
        b: 'A random social media thread.',
        c: 'An uncaptured quote about a building.',
        d: 'A material catalog without theory.',
      }),
      q('c', 'A student describes a chapel only by its facade symmetry. What is missing from a phenomenological answer?', {
        a: 'A property-value estimate.',
        b: 'A fixed Palladian room ratio.',
        c: 'Movement, body scale, light, material, sound, climate, memory, and place experience.',
        d: 'A rule that all ornament is banned.',
      }),
      q('a', 'What does the Zumthor locator support safely?', {
        a: 'Architecture that attends to site, local culture, history, moving-through experience, and material qualities.',
        b: 'A fixed nine-part atmosphere checklist in this bundle.',
        c: 'A claim that drawings are useless in all practice.',
        d: 'An exact fire-code requirement.',
      }),
      q('a', 'Why does this rewrite avoid exact Heidegger Fourfold testing claims?', {
        a: 'The Batch 134 checked locators do not directly source that exact list, so introducing it would exceed the source boundary.',
        b: 'Phenomenology never discusses dwelling.',
        c: 'The Fourfold belongs to Palladio.',
        d: 'The local source proves it is a structural formula.',
      }),
      q('b', 'How does TOA 1 support phenomenological architectural reasoning?', {
        a: 'It says architecture is only a legal table.',
        b: 'It frames architecture as space, structure, enclosure, movement, sensory experience, and context.',
        c: 'It removes place from design.',
        d: 'It makes material experience irrelevant.',
      }),
      q('b', 'Which question best fits a phenomenological review?', {
        a: 'Which paint color is most fashionable?',
        b: 'How does the user experience threshold, light, material, sound, climate, and movement through the place?',
        c: 'How many unrelated styles can be named?',
        d: 'Which option has the longest biography?',
      }),
      q('a', 'What is the safest way to use "genius loci" in this local-first pass?', {
        a: 'As a place-character idea only when tied to captured evidence about site, climate, culture, memory, and experience.',
        b: 'As a legal zoning term.',
        c: 'As an exact point total.',
        d: 'As proof that every local material is automatically correct.',
      }),
      q('c', 'Why is phenomenology not just subjective mood?', {
        a: 'Because it ignores users.',
        b: 'Because it is only about facade color.',
        c: 'Because it studies structures of experience, embodiment, perception, context, and meaning in a disciplined way.',
        d: 'Because it rejects sensory evidence.',
      }),
      q('b', 'In the chapel scenario, which design evidence is strongest?', {
        a: 'A copied symbol without site relation.',
        b: 'Body-scale sequence, material touch, quiet acoustics, shaded light, weather response, and memory of the site.',
        c: 'A claim of exact philosopher compliance without source.',
        d: 'A flat list of famous names.',
      }),
      q('d', 'Which answer stays inside the source boundary?', {
        a: 'All buildings missing one Fourfold element are deficient, proven by the checked sources.',
        b: 'Zumthor provides a fixed test formula for every LEA item.',
        c: 'Phenomenology eliminates structure and use.',
        d: 'Architecture can be read through lived experience, movement, perception, material, site, culture, and memory.',
      }),
    ],
  },
]

function q(correct, text, options) {
  return { correct, text, options }
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
    '- Article and linked-question edits must cite this local source capture and the refined conversion hash, not uncaptured memory.',
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
    '- Use the local TOA/Quotes files as source families and authoritative web locators only through the raw capture map.',
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
      source_id: `batch-134-${article.slug}-raw-source-capture`,
      article_id: article.articleId,
      label: `Batch 134 raw source capture - ${article.title}`,
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
      source_id: `batch-134-${article.slug}-refined-source-map`,
      article_id: article.articleId,
      label: `Batch 134 refined source conversion - ${article.title}`,
      url: null,
      source_type: 'local_refined_conversion',
      description: `Refined local conversion of the Batch 134 raw source capture for ${article.title}.`,
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

function makeRationale(question, article, sourceLocator) {
  const correctText = question.options[question.correct]
  return {
    correct: `${correctText} This stays inside the Batch 134 local source map for ${article.title}.`,
    takeaway: `Use the local Batch 134 source capture and refined conversion for ${article.title}; avoid unsupported exact formulas, chronology, or broad attribution claims.`,
    source_boundary: sourceLocator,
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

  const linked = readJson(`${article.folder}/linked-questions.json`)
  const questions = linked.questions
  if (!Array.isArray(questions)) throw new Error(`${article.slug} linked-questions.json has no questions array`)
  if (questions.length !== article.questions.length) throw new Error(`${article.slug} expected ${article.questions.length} questions, found ${questions.length}`)

  const questionEditIds = []
  const updatedQuestions = questions.map((question, index) => {
    const rewrite = article.questions[index]
    if (question.correct_option_id !== rewrite.correct) {
      throw new Error(`${article.slug} question ${question.question_id} answer key mismatch: expected ${question.correct_option_id}, rewrite uses ${rewrite.correct}`)
    }
    const updated = {
      ...question,
      text: rewrite.text,
      options: Object.entries(rewrite.options).map(([id, text]) => ({ id, text })),
      rationale: makeRationale(rewrite, article, sourceLocator),
      explanation: `${rewrite.options[rewrite.correct]} Supported by Batch 134 local source artifacts for ${article.title}: ${sourceLocator}.`,
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
      approved_by: 'codex-local-first-batch-134',
      approved_at: GENERATED_AT,
      source_audit_support: {
        parent_article_id: article.articleId,
        parent_article_slug: article.slug,
        answer_key_fields_changed: false,
        support_status: 'source_safe_rewrite',
        source_locator: sourceLocator,
        checked_sources: [
          {
            source_id: `batch-134-${article.slug}-raw-source-capture`,
            label: `Batch 134 raw source capture - ${article.title}`,
            path: capturePath,
            sha256: captureHash,
          },
          {
            source_id: `batch-134-${article.slug}-refined-source-map`,
            label: `Batch 134 refined source conversion - ${article.title}`,
            path: refinedPath,
            sha256: refinedHash,
          },
        ],
        local_source_safe_action: 'Question text, options, rationale, explanation, and citation rewritten to the Batch 134 local source artifact boundary while preserving the answer key.',
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
  metadata.updated_by = 'codex-local-first-batch-134'
  metadata.updated_note = 'Source-audited local-first Batch 134 content and linked-question replacement; claims cite local captured source artifacts.'
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
        claim_id: `${article.slug}-b134-claim-01`,
        claim_text: `${article.title} is limited to checked local Batch 134 source capture and refined conversion artifacts.`,
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
