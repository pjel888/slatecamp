#!/usr/bin/env bun
/**
 * generate-questions.ts
 *
 * Batch question generation script: reads markdown articles from "Missing Articles/",
 * generates 10 ALE-style MCQ questions per article based on content analysis,
 * and saves as JSON files in the same folder as each article.
 *
 * Run with: bun run scripts/generate-questions.ts
 *
 * Bun automatically loads .env.local from the project root.
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

// ─── Configuration ─────────────────────────────────────────────────────────────

const MISSING_ARTICLES_DIR = path.join(process.cwd(), 'Missing Articles')

/** Maps folder name to taxonomy node name. 'MULTI' = per-file keyword detection. */
const FOLDER_TO_NODE: Record<string, string | 'MULTI'> = {
  'Accessibility Standards (BP 344 - RA 9442)': 'Accessibility Standards (BP 344 / RA 9442)',
  'Anthropometrics & Human Dimensions': 'Anthropometrics & Human Dimensions',
  'Architecture of Africa, Australia & the Americas': 'MULTI',
  'Global Modernism & Contemporary': 'Modern & Contemporary Architecture',
  'National Building Code Application (PD 1096)': 'National Building Code Application (PD 1096)',
  'Philippine Architecture': 'Philippine Architecture',
  'Site Planning Considerations and Environmental Factors': 'Site Planning and Environmental Analysis',
}

/** Subject labels per folder for ALE context */
const FOLDER_TO_SUBJECT_LABEL: Record<string, string> = {
  'Accessibility Standards (BP 344 - RA 9442)': 'ALE-DSGN · Architectural Design and Site Planning',
  'Anthropometrics & Human Dimensions': 'ALE-DSGN · Architectural Design and Site Planning',
  'Architecture of Africa, Australia & the Americas': 'ALE-HIST · History of Architecture',
  'Global Modernism & Contemporary': 'ALE-HIST · History of Architecture',
  'National Building Code Application (PD 1096)': 'ALE-DSGN · Architectural Design and Site Planning',
  'Philippine Architecture': 'ALE-HIST · History of Architecture',
  'Site Planning Considerations and Environmental Factors': 'ALE-PLAN · Planning, Housing & Urban Design',
}

/** Difficulty distribution for generated questions */
const DIFFICULTY_LEVELS = [0.3, 0.4, 0.5, 0.6, 0.7, 0.8] // easy to hard

/** Bloom's taxonomy levels for question categorization */
const BLOOM_LEVELS = ['Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate']

// ─── Multi-Node Routing ───────────────────────────────────────────────────────

/**
 * Resolves which taxonomy node a file belongs to within the
 * "Architecture of Africa, Australia & the Americas" folder.
 */
function resolveMultiNode(fileName: string, contentPreview: string): string {
  const text = (fileName + ' ' + contentPreview).toLowerCase()

  if (/inca|pre.?columbian|mesoameric|indigenous.*americ|north.*americ|aztec|maya|andean/.test(text)) {
    return 'Pre-Columbian and Indigenous American Architecture'
  }
  if (/austral|new zealand|pacific|maori|aboriginal/.test(text)) {
    return 'Australian and New Zealand Architecture'
  }
  return 'African Architecture'
}

// ─── Question Type Definitions ───────────────────────────────────────────────

interface QuestionOption {
  id: string
  text: string
}

interface GeneratedQuestion {
  topic_id: string | null
  topic_name: string
  text: string
  options: QuestionOption[]
  correct_option_id: string
  rationale: {
    summary: string
    explanation: string
    common_misconceptions?: string[]
  }
  difficulty: number
  bloom_level: string
  application_context: string
  code_citation?: string
  explanation: string
}

interface ArticleQuestionsOutput {
  article_title: string
  article_slug: string
  subject_label: string
  topic_name: string
  questions: GeneratedQuestion[]
  metadata: {
    generated_at: string
    question_count: number
    source_file: string
  }
}

// ─── Question Generation Engine ────────────────────────────────────────────────

/**
 * Generates 10 ALE-style questions based on article content.
 * Analyzes content for: key facts, tables, mnemonics, traps, computations
 */
function generateQuestionsFromContent(
  articleTitle: string,
  rawContent: string,
  folderName: string,
  fileName: string
): GeneratedQuestion[] {
  const questions: GeneratedQuestion[] = []
  
  // Extract key data points from content
  const extractedData = extractKeyData(rawContent)
  const tables = extractTables(rawContent)
  const mnemonics = extractMnemonics(rawContent)
  const trapAlerts = extractTrapAlerts(rawContent)
  const legalRefs = extractLegalReferences(rawContent)
  const dimensions = extractDimensions(rawContent)
  
  // Generate 10 questions covering different aspects
  const questionTypes = [
    'key_fact',
    'definition',
    'table_data',
    'mnemonic',
    'trap_alert',
    'legal_reference',
    'computation',
    'comparison',
    'application',
    'synthesis',
  ]
  
  for (let i = 0; i < 10; i++) {
    const questionType = questionTypes[i]
    const difficulty = DIFFICULTY_LEVELS[Math.floor(Math.random() * DIFFICULTY_LEVELS.length)]
    const bloomLevel = BLOOM_LEVELS[Math.floor(Math.random() * 3)] // Focus on lower-order skills
    
    let question: GeneratedQuestion | null = null
    
    switch (questionType) {
      case 'key_fact':
        question = generateKeyFactQuestion(articleTitle, extractedData, difficulty, bloomLevel, folderName)
        break
      case 'definition':
        question = generateDefinitionQuestion(articleTitle, rawContent, difficulty, bloomLevel, folderName)
        break
      case 'table_data':
        question = generateTableQuestion(articleTitle, tables, difficulty, bloomLevel, folderName)
        break
      case 'mnemonic':
        question = generateMnemonicQuestion(articleTitle, mnemonics, difficulty, bloomLevel, folderName)
        break
      case 'trap_alert':
        question = generateTrapAlertQuestion(articleTitle, trapAlerts, difficulty, bloomLevel, folderName)
        break
      case 'legal_reference':
        question = generateLegalReferenceQuestion(articleTitle, legalRefs, difficulty, bloomLevel, folderName)
        break
      case 'computation':
        question = generateComputationQuestion(articleTitle, dimensions, difficulty, bloomLevel, folderName)
        break
      case 'comparison':
        question = generateComparisonQuestion(articleTitle, tables, difficulty, bloomLevel, folderName)
        break
      case 'application':
        question = generateApplicationQuestion(articleTitle, rawContent, difficulty, bloomLevel, folderName)
        break
      case 'synthesis':
        question = generateSynthesisQuestion(articleTitle, rawContent, mnemonics, difficulty, bloomLevel, folderName)
        break
    }
    
    if (question) {
      questions.push(question)
    }
  }
  
  return questions
}

/**
 * Extract key facts from content - numbered items, bold terms, key values
 */
function extractKeyData(content: string): string[] {
  const facts: string[] = []
  
  // Extract bold terms
  const boldTerms = content.match(/\*\*([^*]+)\*\*/g) || []
  facts.push(...boldTerms.map(t => t.replace(/\*\*/g, '')))
  
  // Extract numbered items
  const numberedItems = content.match(/^\d+\.\s+(.+)/gm) || []
  facts.push(...numberedItems.map(item => item.replace(/^\d+\.\s+/, '')))
  
  // Extract bullet points
  const bullets = content.match(/^[-*]\s+(.+)/gm) || []
  facts.push(...bullets.map(b => b.replace(/^[-*]\s+/, '')))
  
  // Extract specific values with units
  const valuesWithUnits = content.match(/\d+\.?\d*\s*(mm|cm|m|°|%|hours?|hrs?|minutes?|min|feet|ft|×|x)/gi) || []
  facts.push(...valuesWithUnits)
  
  return [...new Set(facts)].slice(0, 50) // Deduplicate and limit
}

/**
 * Extract tables from markdown content
 */
function extractTables(content: string): { headers: string[], rows: string[][] }[] {
  const tables: { headers: string[], rows: string[][] }[] = []
  const tableRegex = /\|(.+)\|[\r\n]+\|[-:\s|]+\|[\r\n]+((?:\|.+\|[\r\n]*)+)/g
  let match
  
  while ((match = tableRegex.exec(content)) !== null) {
    const headerLine = match[1]
    const rowLines = match[2].trim().split('\n')
    
    const headers = headerLine.split('|').map(h => h.trim()).filter(h => h)
    const rows = rowLines.map(row => 
      row.split('|').map(cell => cell.trim()).filter(cell => cell)
    )
    
    tables.push({ headers, rows })
  }
  
  return tables
}

/**
 * Extract mnemonics from content
 */
function extractMnemonics(content: string): { mnemonic: string, meaning: string }[] {
  const mnemonics: { mnemonic: string, meaning: string }[] = []
  
  // Find mnemonic sections
  const mnemonicRegex = /\*\*"([^"]+)"\s*[–—]\s*\*\*(.+?)(?=\n\n|\n---|$)/g
  let match
  
  while ((match = mnemonicRegex.exec(content)) !== null) {
    mnemonics.push({
      mnemonic: match[1],
      meaning: match[2].trim()
    })
  }
  
  // Also find quoted mnemonics
  const quoteRegex = /"([A-Z]{2,})"[^"]*"([^"]+)"/g
  while ((match = quoteRegex.exec(content)) !== null) {
    mnemonics.push({
      mnemonic: match[1],
      meaning: match[2]
    })
  }
  
  return mnemonics
}

/**
 * Extract trap alerts from content
 */
function extractTrapAlerts(content: string): { statement: string, truth: string }[] {
  const traps: { statement: string, truth: string }[] = []
  
  const trapRegex = /\*\*TRAP[^:]*:?\s*\*\*(.+?)(?=\n\n>|>|\n---|\n\*\*|$)/g
  let match
  
  while ((match = trapRegex.exec(content)) !== null) {
    const trapText = match[1].trim()
    
    // Try to find the TRUTH section after the trap
    const truthMatch = content.substring(match.index + match[0].length).match(/TRUTH[:\s]+([\s\S]+?)(?=\n\n|\n---)/)
    
    traps.push({
      statement: trapText.replace(/^TRAP[^:]*:?\s*/i, ''),
      truth: truthMatch ? truthMatch[1].trim() : 'Review the article content for the correct information.'
    })
  }
  
  return traps
}

/**
 * Extract legal references (BP, PD, RA numbers)
 */
function extractLegalReferences(content: string): { law: string, section?: string, context: string }[] {
  const refs: { law: string, section?: string, context: string }[] = []
  
  // BP references
  const bpRegex = /(BP\s*344|BP\s*220|BP\s*\d+)([^,\n]*)?/gi
  let match
  while ((match = bpRegex.exec(content)) !== null) {
    refs.push({
      law: match[1].toUpperCase(),
      section: match[2]?.trim(),
      context: extractContextAround(content, match.index, 100)
    })
  }
  
  // PD references
  const pdRegex = /(PD\s*1096|PD\s*957|PD\s*\d+)([^,\n]*)?/gi
  while ((match = pdRegex.exec(content)) !== null) {
    refs.push({
      law: match[1].toUpperCase(),
      section: match[2]?.trim(),
      context: extractContextAround(content, match.index, 100)
    })
  }
  
  // RA references
  const raRegex = /(RA\s*\d+)([^,\n]*)?/gi
  while ((match = raRegex.exec(content)) !== null) {
    refs.push({
      law: match[1].toUpperCase(),
      section: match[2]?.trim(),
      context: extractContextAround(content, match.index, 100)
    })
  }
  
  return [...new Map(refs.map(r => [r.law, r])).values()] // Deduplicate by law
}

/**
 * Extract dimensions, measurements, and numerical values
 */
function extractDimensions(content: string): { value: string, unit: string, context: string }[] {
  const dims: { value: string, unit: string, context: string }[] = []
  
  // Metric measurements
  const metricRegex = /(\d+\.?\d*)\s*(mm|cm|m|km|ml|L)/gi
  let match
  while ((match = metricRegex.exec(content)) !== null) {
    dims.push({
      value: match[1],
      unit: match[2],
      context: extractContextAround(content, match.index, 80)
    })
  }
  
  // Imperial measurements
  const imperialRegex = /(\d+\.?\d*)\s*(ft|feet|"|in|inches?|yards?)/gi
  while ((match = imperialRegex.exec(content)) !== null) {
    dims.push({
      value: match[1],
      unit: match[2],
      context: extractContextAround(content, match.index, 80)
    })
  }
  
  // Percentages
  const percentRegex = /(\d+\.?\d*)\s*%/g
  while ((match = percentRegex.exec(content)) !== null) {
    dims.push({
      value: match[1],
      unit: '%',
      context: extractContextAround(content, match.index, 80)
    })
  }
  
  return [...new Map(dims.map(d => [`${d.value}${d.unit}`, d])).values()].slice(0, 30)
}

/**
 * Helper to extract context around a position in text
 */
function extractContextAround(content: string, position: number, radius: number): string {
  const start = Math.max(0, position - radius)
  const end = Math.min(content.length, position + radius)
  return content.substring(start, end).replace(/\n+/g, ' ').trim()
}

// ─── Question Generators ──────────────────────────────────────────────────────

function generateKeyFactQuestion(
  title: string,
  facts: string[],
  difficulty: number,
  bloomLevel: string,
  folderName: string
): GeneratedQuestion | null {
  if (facts.length < 4) return null
  
  const correctFact = facts[Math.floor(Math.random() * Math.min(facts.length, 10))]
  const otherFacts = facts.filter(f => f !== correctFact).slice(0, 9)
  
  // Create options
  const options: QuestionOption[] = [
    { id: 'A', text: correctFact.substring(0, 200) }
  ]
  
  // Add incorrect options
  const distractors = shuffleArray([
    `Incorrect: This contradicts ${folderName.split(' ')[0]} principles`,
    `Incorrect: This applies to a different architectural context`,
    `Incorrect: This is a common misconception in ${folderName.split(' ')[0]}`,
  ]).slice(0, 3)
  
  distractors.forEach((d, i) => {
    options.push({ id: String.fromCharCode(66 + i), text: d })
  })
  
  // Shuffle options
  const shuffledOptions = shuffleArray(options)
  const correctId = shuffledOptions.find(o => o.text === correctFact.substring(0, 200))?.id || 'A'
  
  return {
    topic_id: null,
    topic_name: FOLDER_TO_SUBJECT_LABEL[folderName] || folderName,
    text: `According to the article on "${title}", which of the following is a key concept or principle discussed?`,
    options: shuffledOptions,
    correct_option_id: correctId,
    rationale: {
      summary: correctFact.substring(0, 150),
      explanation: `The correct answer is derived from the key facts presented in the ${title} article within the ${folderName} subject area.`,
      common_misconceptions: [
        `Confusing this principle with concepts from other architectural periods or disciplines`,
        `Assuming this applies universally without considering the specific context`
      ]
    },
    difficulty,
    bloom_level: bloomLevel,
    application_context: folderName,
    explanation: `This question tests understanding of key concepts from ${title}.`
  }
}

function generateDefinitionQuestion(
  title: string,
  content: string,
  difficulty: number,
  bloomLevel: string,
  folderName: string
): GeneratedQuestion {
  // Extract definition-like patterns
  const definedTerms = content.match(/\*\*([^*]+)\*\*\s*(?:is|are|refers to|means|=\s*)([^.\n]+)/gi) || []
  
  const correctDef = definedTerms.length > 0 
    ? definedTerms[0].replace(/\*\*/g, '')
    : `The concept of ${title} is fundamental to ${folderName}`
  
  const term = title.split(' ')[0]
  
  return {
    topic_id: null,
    topic_name: FOLDER_TO_SUBJECT_LABEL[folderName] || folderName,
    text: `What is the correct definition or description of "${term}" as discussed in the ${title} article?`,
    options: [
      { id: 'A', text: correctDef.substring(0, 200) },
      { id: 'B', text: `A related but distinct concept often confused with ${term}` },
      { id: 'C', text: `An outdated interpretation that has been revised in current standards` },
      { id: 'D', text: `A misstatement commonly seen in exam answers` }
    ],
    correct_option_id: 'A',
    rationale: {
      summary: `Definition from ${title}`,
      explanation: `The article clearly defines ${term} within the context of ${folderName}.`,
      common_misconceptions: [
        `Confusing ${term} with similar-sounding terms from other subjects`,
        `Using outdated definitions from older code editions`
      ]
    },
    difficulty,
    bloom_level: 'Remember',
    application_context: folderName,
    explanation: `This question tests recall of key definitions from ${title}.`
  }
}

function generateTableQuestion(
  title: string,
  tables: { headers: string[], rows: string[][] }[],
  difficulty: number,
  bloomLevel: string,
  folderName: string
): GeneratedQuestion | null {
  if (tables.length === 0) {
    return {
      topic_id: null,
      topic_name: FOLDER_TO_SUBJECT_LABEL[folderName] || folderName,
      text: `Based on the data presented in "${title}", what is the correct relationship or value?`,
      options: [
        { id: 'A', text: `The standard/reference value as stated in the article` },
        { id: 'B', text: `A higher value that exceeds code requirements` },
        { id: 'C', text: `A lower value permitted under specific conditions` },
        { id: 'D', text: `A value that applies to a different category` }
      ],
      correct_option_id: 'A',
      rationale: {
        summary: 'Data recall from tables in article',
        explanation: `The table data in ${title} provides specific values that must be recalled for exam questions.`
      },
      difficulty,
      bloom_level: bloomLevel,
      application_context: folderName,
      explanation: `This question tests interpretation of tabular data from ${title}.`
    }
  }
  
  const table = tables[0]
  if (table.rows.length === 0) return null
  
  // Generate question from first table row
  const row = table.rows[0]
  const correctValue = row[row.length - 1]
  const category = row[0]
  
  return {
    topic_id: null,
    topic_name: FOLDER_TO_SUBJECT_LABEL[folderName] || folderName,
    text: `According to the table in "${title}", what is the specified value for "${category}"?`,
    options: [
      { id: 'A', text: correctValue },
      { id: 'B', text: `A similar but incorrect value (check the table carefully)` },
      { id: 'C', text: `A value from a different row in the same table` },
      { id: 'D', text: `The maximum permitted value (not the standard)` }
    ],
    correct_option_id: 'A',
    rationale: {
      summary: correctValue,
      explanation: `The table in ${title} specifies ${category} as ${correctValue}. This is a direct recall question from tabular data.`
    },
    difficulty,
    bloom_level: bloomLevel,
    application_context: folderName,
    code_citation: `PD 1096 / BP 344`,
    explanation: `This question requires reading and interpreting data from tables in ${title}.`
  }
}

function generateMnemonicQuestion(
  title: string,
  mnemonics: { mnemonic: string, meaning: string }[],
  difficulty: number,
  bloomLevel: string,
  folderName: string
): GeneratedQuestion | null {
  if (mnemonics.length === 0) {
    return {
      topic_id: null,
      topic_name: FOLDER_TO_SUBJECT_LABEL[folderName] || folderName,
      text: `What mnemonic device was presented in the "${title}" article to aid memory of ${folderName} concepts?`,
      options: [
        { id: 'A', text: `A systematic acronym for recalling key elements` },
        { id: 'B', text: `A rhyme or phrase for numerical sequences` },
        { id: 'C', text: `An association technique for architectural periods` },
        { id: 'D', text: `A visual diagram method` }
      ],
      correct_option_id: 'A',
      rationale: {
        summary: 'Mnemonic recall',
        explanation: `The article presents mnemonics as memory aids for ${folderName} concepts.`
      },
      difficulty,
      bloom_level: 'Understand',
      application_context: folderName,
      explanation: `This question tests understanding of mnemonic devices from ${title}.`
    }
  }
  
  const mn = mnemonics[0]
  
  return {
    topic_id: null,
    topic_name: FOLDER_TO_SUBJECT_LABEL[folderName] || folderName,
    text: `The mnemonic "${mn.mnemonic}" presented in "${title}" helps remember:`,
    options: shuffleArray([
      { id: 'A', text: mn.meaning.substring(0, 150) },
      { id: 'B', text: `A different concept from another subject area` },
      { id: 'C', text: `An outdated standard no longer in use` },
      { id: 'D', text: `A trap commonly tested on the ALE` }
    ]).map((o, i, arr) => {
      if (o.text === mn.meaning.substring(0, 150)) {
        return { ...o, id: 'A' }
      }
      return { ...o, id: String.fromCharCode(66 + arr.findIndex(a => a === o) - 1) }
    }).map((o, i, arr) => {
      if (o.id === 'A') return o
      return { ...o, id: String.fromCharCode(66 + i) }
    }),
    correct_option_id: 'A',
    rationale: {
      summary: mn.mnemonic,
      explanation: `The mnemonic "${mn.mnemonic}" was specifically designed to help remember ${mn.meaning}.`,
      common_misconceptions: [
        `Associating mnemonics with unrelated concepts`,
        `Confusing the meaning with the acronym letters`
      ]
    },
    difficulty,
    bloom_level: 'Understand',
    application_context: folderName,
    explanation: `This question tests understanding and application of mnemonic devices from ${title}.`
  }
}

function generateTrapAlertQuestion(
  title: string,
  traps: { statement: string, truth: string }[],
  difficulty: number,
  bloomLevel: string,
  folderName: string
): GeneratedQuestion | null {
  if (traps.length === 0) {
    return {
      topic_id: null,
      topic_name: FOLDER_TO_SUBJECT_LABEL[folderName] || folderName,
      text: `Which of the following is a common trap or misconception tested on the ALE regarding ${folderName}?`,
      options: [
        { id: 'A', text: `Confusing similar-sounding terms or standards` },
        { id: 'B', text: `Using outdated imperial measurements instead of metric` },
        { id: 'C', text: `Applying US standards as Philippine standards` },
        { id: 'D', text: `All of the above are common traps` }
      ],
      correct_option_id: 'D',
      rationale: {
        summary: 'Common trap recognition',
        explanation: `All of these are documented traps in ${folderName} that appear frequently on the ALE.`
      },
      difficulty: 0.8, // Harder question
      bloom_level: 'Analyze',
      application_context: folderName,
      explanation: `This question tests recognition of common traps from ${title}.`
    }
  }
  
  const trap = traps[0]
  
  return {
    topic_id: null,
    topic_name: FOLDER_TO_SUBJECT_LABEL[folderName] || folderName,
    text: `"${trap.statement.substring(0, 100)}..." — This statement is:`,
    options: [
      { id: 'A', text: `TRUE - This is correct according to the article` },
      { id: 'B', text: `FALSE - The correct information is: ${trap.truth.substring(0, 100)}` },
      { id: 'C', text: `PARTIALLY TRUE - It has some correct elements but is misleading` },
      { id: 'D', text: `DEPENDS - The answer varies based on specific conditions` }
    ],
    correct_option_id: 'B',
    rationale: {
      summary: 'Trap recognition',
      explanation: trap.truth,
      common_misconceptions: [
        trap.statement,
        `Taking statements out of context from the full article`
      ]
    },
    difficulty,
    bloom_level: 'Analyze',
    application_context: folderName,
    explanation: `This question tests recognition of common traps from ${title}. Trap alerts are explicitly designed to highlight common exam mistakes.`
  }
}

function generateLegalReferenceQuestion(
  title: string,
  legalRefs: { law: string, section?: string, context: string }[],
  difficulty: number,
  bloomLevel: string,
  folderName: string
): GeneratedQuestion | null {
  if (legalRefs.length === 0) {
    return {
      topic_id: null,
      topic_name: FOLDER_TO_SUBJECT_LABEL[folderName] || folderName,
      text: `Which Philippine law or code governs the principles discussed in "${title}"?`,
      options: [
        { id: 'A', text: `PD 1096 - National Building Code of the Philippines` },
        { id: 'B', text: `BP 344 - Accessibility Law of the Philippines` },
        { id: 'C', text: `RA 9266 - Architecture Act of the Philippines` },
        { id: 'D', text: `Various codes depending on the specific provision` }
      ],
      correct_option_id: 'D',
      rationale: {
        summary: 'Legal framework awareness',
        explanation: `${title} may reference multiple laws including PD 1096, BP 344, and other regulations.`
      },
      difficulty,
      bloom_level: 'Understand',
      application_context: folderName,
      code_citation: 'PD 1096 / BP 344',
      explanation: `This question tests awareness of the Philippine legal framework for ${folderName}.`
    }
  }
  
  const ref = legalRefs[0]
  
  return {
    topic_id: null,
    topic_name: FOLDER_TO_SUBJECT_LABEL[folderName] || folderName,
    text: `According to ${ref.law}${ref.section ? `, Section ${ref.section}` : ''} as discussed in "${title}":`,
    options: [
      { id: 'A', text: `The provision applies as stated in the article` },
      { id: 'B', text: `The provision was superseded by a more recent amendment` },
      { id: 'C', text: `The provision applies only to specific building types` },
      { id: 'D', text: `The provision is administered by a different agency` }
    ],
    correct_option_id: 'A',
    rationale: {
      summary: `${ref.law} reference`,
      explanation: `The article correctly cites ${ref.law}${ref.section ? ` Section ${ref.section}` : ''} within the context of ${folderName}.`,
      common_misconceptions: [
        `Confusing similar law numbers or section references`,
        `Applying provisions out of their intended context`
      ]
    },
    difficulty,
    bloom_level: bloomLevel,
    application_context: folderName,
    code_citation: ref.law,
    explanation: `This question tests knowledge of legal references from ${title}.`
  }
}

function generateComputationQuestion(
  title: string,
  dimensions: { value: string, unit: string, context: string }[],
  difficulty: number,
  bloomLevel: string,
  folderName: string
): GeneratedQuestion | null {
  if (dimensions.length === 0) {
    return {
      topic_id: null,
      topic_name: FOLDER_TO_SUBJECT_LABEL[folderName] || folderName,
      text: `A question involving numerical calculation related to "${title}" would require:`,
      options: [
        { id: 'A', text: `Direct application of a formula or table value` },
        { id: 'B', text: `Conversion between metric and imperial units` },
        { id: 'C', text: `Interpolation between table values` },
        { id: 'D', text: `All of the above calculation skills` }
      ],
      correct_option_id: 'D',
      rationale: {
        summary: 'Computation skills',
        explanation: `ALE questions involving ${title} may require any or all of these calculation approaches.`
      },
      difficulty,
      bloom_level: 'Apply',
      application_context: folderName,
      explanation: `This question tests readiness for computation-based questions from ${title}.`
    }
  }
  
  const dim = dimensions[0]
  
  return {
    topic_id: null,
    topic_name: FOLDER_TO_SUBJECT_LABEL[folderName] || folderName,
    text: `Based on the specifications in "${title}", if a project requires ${dim.value} ${dim.unit}, what is the correct interpretation?`,
    options: [
      { id: 'A', text: `${dim.value} ${dim.unit} is the minimum/standard requirement` },
      { id: 'B', text: `${dim.value} ${dim.unit} is the maximum permitted value` },
      { id: 'C', text: `${dim.value} ${dim.unit} applies only to specific conditions` },
      { id: 'D', text: `${dim.value} ${dim.unit} is an approximate value subject to interpretation` }
    ],
    correct_option_id: 'A',
    rationale: {
      summary: `${dim.value} ${dim.unit}`,
      explanation: `The article specifies ${dim.value} ${dim.unit} as the requirement. Context: ${dim.context.substring(0, 80)}...`
    },
    difficulty,
    bloom_level: 'Apply',
    application_context: folderName,
    explanation: `This question tests application of dimensional data from ${title}.`
  }
}

function generateComparisonQuestion(
  title: string,
  tables: { headers: string[], rows: string[][] }[],
  difficulty: number,
  bloomLevel: string,
  folderName: string
): GeneratedQuestion {
  return {
    topic_id: null,
    topic_name: FOLDER_TO_SUBJECT_LABEL[folderName] || folderName,
    text: `In the context of "${title}", what is the key distinction between different categories or time periods discussed?`,
    options: [
      { id: 'A', text: `The distinctions are based on specific measurable criteria outlined in the article` },
      { id: 'B', text: `The distinctions are primarily stylistic without regulatory significance` },
      { id: 'C', text: `The distinctions have been eliminated in recent code revisions` },
      { id: 'D', text: `The distinctions vary by region within the Philippines` }
    ],
    correct_option_id: 'A',
    rationale: {
      summary: 'Comparison and distinction',
      explanation: `The article in ${folderName} provides clear distinctions based on regulatory criteria.`
    },
    difficulty,
    bloom_level: 'Understand',
    application_context: folderName,
    explanation: `This question tests the ability to compare and distinguish between related concepts in ${title}.`
  }
}

function generateApplicationQuestion(
  title: string,
  content: string,
  difficulty: number,
  bloomLevel: string,
  folderName: string
): GeneratedQuestion {
  return {
    topic_id: null,
    topic_name: FOLDER_TO_SUBJECT_LABEL[folderName] || folderName,
    text: `In a design scenario involving ${folderName}, which approach would be most appropriate based on "${title}"?`,
    options: [
      { id: 'A', text: `Apply the standards as stated in the article` },
      { id: 'B', text: `Modify the standards based on project-specific constraints` },
      { id: 'C', text: `Consult additional references not mentioned in the article` },
      { id: 'D', text: `Defer to the authority having jurisdiction for interpretation` }
    ],
    correct_option_id: 'A',
    rationale: {
      summary: 'Application of standards',
      explanation: `The ${title} article provides the foundational standards for ${folderName} that should be applied as stated.`
    },
    difficulty,
    bloom_level: 'Apply',
    application_context: folderName,
    explanation: `This question tests practical application of concepts from ${title}.`
  }
}

function generateSynthesisQuestion(
  title: string,
  content: string,
  mnemonics: { mnemonic: string, meaning: string }[],
  difficulty: number,
  bloomLevel: string,
  folderName: string
): GeneratedQuestion {
  const mnemonicHint = mnemonics.length > 0 
    ? ` Remember: "${mnemonics[0].mnemonic}"`
    : ''
  
  return {
    topic_id: null,
    topic_name: FOLDER_TO_SUBJECT_LABEL[folderName] || folderName,
    text: `An architect must integrate principles from "${title}" into a comprehensive design. Which statement best summarizes the approach?${mnemonicHint}`,
    options: [
      { id: 'A', text: `Follow the established standards while considering project-specific context` },
      { id: 'B', text: `Prioritize aesthetic considerations over regulatory compliance` },
      { id: 'C', text: `Apply international standards regardless of Philippine context` },
      { id: 'D', text: `Minimize compliance requirements to reduce costs` }
    ],
    correct_option_id: 'A',
    rationale: {
      summary: 'Comprehensive integration',
      explanation: `Professional practice requires integrating ${folderName} standards with project context while maintaining compliance.`,
      common_misconceptions: [
        `Prioritizing one aspect over comprehensive consideration`,
        `Assuming standards are merely suggestions rather than requirements`
      ]
    },
    difficulty: Math.min(difficulty + 0.1, 0.9), // Slightly harder
    bloom_level: 'Evaluate',
    application_context: folderName,
    explanation: `This question tests synthesis of multiple concepts from ${title} into professional practice.`
  }
}

// ─── Utility Functions ────────────────────────────────────────────────────────

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

function extractTitle(rawContent: string, fileName: string): string {
  const h1Match = rawContent.match(/^#\s+(.+)/m)
  return h1Match
    ? h1Match[1].replace(/\*+/g, '').replace(/_+/g, '').trim()
    : fileName.replace(/\.md$/, '')
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

// ─── Main Execution ──────────────────────────────────────────────────────────

interface ProcessResult {
  file: string
  folder: string
  status: 'success' | 'skipped' | 'error'
  questionCount?: number
  error?: string
}

async function main() {
  console.log('🚀 SlateCamp Question Generation Script')
  console.log('========================================\n')

  // Validate environment
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Missing environment variables.')
    console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '✗ MISSING')
    console.error('   SUPABASE_SERVICE_ROLE_KEY:', serviceRoleKey ? '✓' : '✗ MISSING')
    console.error('\n   Ensure .env.local is present in the project root.')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  // 1. Build taxonomy node map from Supabase
  console.log('📖 Loading taxonomy nodes from Supabase...')
  const { data: nodes, error: nodesError } = await supabase
    .from('taxonomy_tree')
    .select('node_id, name')

  if (nodesError) {
    console.warn('⚠️  Failed to load taxonomy nodes:', nodesError.message)
    console.warn('   Questions will be generated without topic_id linkage.')
  }

  const nodeMap = new Map<string, string>()
  if (nodes) {
    for (const node of nodes) {
      nodeMap.set((node.name as string).toLowerCase().trim(), node.node_id as string)
    }
    console.log(`   ✓ Loaded ${nodeMap.size} taxonomy nodes\n`)
  }

  // 2. Verify Missing Articles directory exists
  if (!fs.existsSync(MISSING_ARTICLES_DIR)) {
    console.error(`❌ "Missing Articles" directory not found at:\n   ${MISSING_ARTICLES_DIR}`)
    process.exit(1)
  }

  // 3. Process each folder
  const results: ProcessResult[] = []

  const folders = fs
    .readdirSync(MISSING_ARTICLES_DIR)
    .filter(f => fs.statSync(path.join(MISSING_ARTICLES_DIR, f)).isDirectory())
    .sort()

  console.log(`📁 Found ${folders.length} folders to process\n`)

  for (const folderName of folders) {
    const folderPath = path.join(MISSING_ARTICLES_DIR, folderName)
    const nodeTarget = FOLDER_TO_NODE[folderName]

    if (!nodeTarget) {
      console.warn(`⚠️  No taxonomy mapping for folder: "${folderName}" — skipping`)
      continue
    }

    const files = fs
      .readdirSync(folderPath)
      .filter(f => f.endsWith('.md'))
      .sort()

    console.log(`📁 ${folderName} (${files.length} files)`)

    for (const fileName of files) {
      const filePath = path.join(folderPath, fileName)
      const result: ProcessResult = { file: fileName, folder: folderName, status: 'error' }

      try {
        const rawContent = fs.readFileSync(filePath, 'utf-8')

        // Check if questions file already exists
        const jsonFileName = fileName.replace(/\.md$/, '') + '_questions.json'
        const jsonFilePath = path.join(folderPath, jsonFileName)
        
        if (fs.existsSync(jsonFilePath)) {
          result.status = 'skipped'
          console.log(`   ↷ ${fileName} (questions already exist, skipping)`)
          results.push(result)
          continue
        }

        // Resolve taxonomy node
        let nodeName: string
        if (nodeTarget === 'MULTI') {
          nodeName = resolveMultiNode(fileName, rawContent.substring(0, 500))
        } else {
          nodeName = nodeTarget
        }

        const topicId = nodeMap.get(nodeName.toLowerCase().trim()) || null

        // Extract article title
        const articleTitle = extractTitle(rawContent, fileName)
        const articleSlug = slugify(articleTitle)

        // Generate questions
        const questions = generateQuestionsFromContent(
          articleTitle,
          rawContent,
          folderName,
          fileName
        )

        // Assign topic_id to all questions
        questions.forEach(q => {
          q.topic_id = topicId
          q.topic_name = nodeName
        })

        // Create output
        const output: ArticleQuestionsOutput = {
          article_title: articleTitle,
          article_slug: articleSlug,
          subject_label: FOLDER_TO_SUBJECT_LABEL[folderName] || folderName,
          topic_name: nodeName,
          questions,
          metadata: {
            generated_at: new Date().toISOString(),
            question_count: questions.length,
            source_file: fileName
          }
        }

        // Write JSON file
        fs.writeFileSync(jsonFilePath, JSON.stringify(output, null, 2), 'utf-8')

        result.status = 'success'
        result.questionCount = questions.length
        console.log(`   ✓ ${fileName}`)
        console.log(`     → ${questions.length} questions generated`)
        console.log(`     → topic: ${nodeName}`)
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err)
        result.error = message
        console.error(`   ✗ ${fileName}: ${message}`)
      }

      results.push(result)
    }

    console.log()
  }

  // 4. Final summary report
  const succeeded = results.filter(r => r.status === 'success')
  const skipped = results.filter(r => r.status === 'skipped')
  const failed = results.filter(r => r.status === 'error')
  const totalQuestions = succeeded.reduce((sum, r) => sum + (r.questionCount || 0), 0)

  console.log('═══════════════════════════════════════════')
  console.log('📊 GENERATION SUMMARY')
  console.log('═══════════════════════════════════════════')
  console.log(`✓ ${succeeded.length} files generated successfully`)
  console.log(`   Total questions: ${totalQuestions}`)
  if (skipped.length > 0) console.log(`↷ ${skipped.length} files skipped (already exist)`)
  if (failed.length > 0) console.log(`✗ ${failed.length} files failed`)

  if (failed.length > 0) {
    console.log('\nFailed files:\n')
    for (const f of failed) {
      console.log(`   [${f.folder}]`)
      console.log(`   File: ${f.file}`)
      console.log(`   Error: ${f.error}\n`)
    }
  }

  console.log()
  if (failed.length === 0) {
    console.log('🎉 All questions generated successfully!')
    console.log(`   ${totalQuestions} questions across ${succeeded.length} articles`)
  } else {
    console.log('⚠️  Some articles failed. Review errors above.')
    process.exit(1)
  }
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
