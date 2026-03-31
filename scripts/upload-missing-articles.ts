#!/usr/bin/env bun
/**
 * upload-missing-articles.ts
 *
 * Batch upload script: reads markdown articles from "Missing Articles/",
 * transforms blockquote callouts to MDX components, and uploads to Supabase.
 *
 * Run with: bun run scripts/upload-missing-articles.ts
 *
 * Bun automatically loads .env.local from the project root.
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

// ─── Folder → Taxonomy Node Configuration ────────────────────────────────────

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

const FOLDER_TO_SUBJECT_LABEL: Record<string, string> = {
  'Accessibility Standards (BP 344 - RA 9442)': 'ALE-DSGN · Architectural Design and Site Planning',
  'Anthropometrics & Human Dimensions': 'ALE-DSGN · Architectural Design and Site Planning',
  'Architecture of Africa, Australia & the Americas': 'ALE-HIST · History of Architecture',
  'Global Modernism & Contemporary': 'ALE-HIST · History of Architecture',
  'National Building Code Application (PD 1096)': 'ALE-DSGN · Architectural Design and Site Planning',
  'Philippine Architecture': 'ALE-HIST · History of Architecture',
  'Site Planning Considerations and Environmental Factors': 'ALE-PLAN · Planning, Housing & Urban Design',
}

// ─── Multi-Node Routing ───────────────────────────────────────────────────────

/**
 * Resolves which taxonomy node a file belongs to within the
 * "Architecture of Africa, Australia & the Americas" folder.
 * Uses filename + first 500 chars of content for keyword detection.
 */
function resolveMultiNode(fileName: string, contentPreview: string): string {
  const text = (fileName + ' ' + contentPreview).toLowerCase()

  // Americas / Pre-Columbian
  if (/inca|pre.?columbian|mesoameric|indigenous.*americ|north.*americ|aztec|maya|andean/.test(text)) {
    return 'Pre-Columbian and Indigenous American Architecture'
  }
  // Australia / New Zealand / Pacific
  if (/austral|new zealand|pacific|maori|aboriginal/.test(text)) {
    return 'Australian and New Zealand Architecture'
  }
  // Default: Africa (covers "African", "Colonial" in African context, etc.)
  return 'African Architecture'
}

// ─── MDX Safety Escaping ──────────────────────────────────────────────────────

/**
 * Escapes content that would cause MDX compilation failures:
 * - Numeric measurement tags like <1800mm>, <450mm>, <1st>
 * - HTML comments
 */
function escapeMdx(content: string): string {
  // Strip HTML comments
  content = content.replace(/<!--[\s\S]*?-->/g, '')

  // Escape numeric/measurement angle-bracket tags
  // Matches: <digit + letters/symbols up to 30 chars>
  // e.g. <1800mm>, <450mm>, <100%>, <1st>, <2nd>, <3m>
  content = content.replace(/<(\d+[a-zA-Z/%°][^>\n]{0,30})>/g, '`$1`')

  return content
}

// ─── Blockquote → MDX Component Transformation ───────────────────────────────

type CalloutComponent =
  | { type: 'Note' }
  | { type: 'Warn' }
  | { type: 'Tip' }
  | { type: 'Example' }
  | { type: 'ExamTip'; title?: string }
  | { type: 'Callout'; variant: string; title?: string }
  | { type: 'LawCallout'; code: string; section?: string; title?: string }

function classifyFirstLine(line: string): CalloutComponent | null {
  const upper = line.toUpperCase()

  if (upper.includes('TRAP ALERT')) {
    return { type: 'Callout', variant: 'ale-watch', title: extractTitleFromLine(line) || 'Trap Alert' }
  }
  if (upper.includes('EXAM TIP')) {
    return { type: 'ExamTip', title: extractTitleFromLine(line) }
  }
  if (upper.includes('MNEMONIC') || upper.includes('MEMORY AID')) {
    return { type: 'Callout', variant: 'tip', title: 'Mnemonic' }
  }
  if (upper.includes('VERSION ALERT') || (upper.includes('UPDATED') && upper.includes('NOTE'))) {
    return { type: 'Callout', variant: 'version-alert', title: extractTitleFromLine(line) || 'Update' }
  }
  if (upper.includes('REASON FOR THE LAW') || upper.includes('WHY THIS RULE') || upper.includes('RATIONALE:')) {
    return { type: 'Callout', variant: 'authority', title: extractTitleFromLine(line) || 'Reason for the Law' }
  }
  if (/\bWARNING[:\s*]/.test(upper) || /\bWARN[:\s*]/.test(upper)) {
    return { type: 'Warn' }
  }
  if (/\bNOTE[:\s*]/.test(upper)) {
    return { type: 'Note' }
  }
  if (/\bTIP[:\s*]/.test(upper) || upper.includes('QUICK TIP')) {
    return { type: 'Tip' }
  }
  if (/\bEXAMPLE[:\s*]/.test(upper) || upper.includes('WORKED EXAMPLE')) {
    return { type: 'Example' }
  }

  // Law callouts
  if (upper.includes('BP 344') || upper.includes('BP344') || upper.includes('BATAS PAMBANSA 344')) {
    return { type: 'LawCallout', code: 'bp344', section: extractSection(line), title: extractTitleFromLine(line) }
  }
  if (upper.includes('PD 1096') || upper.includes('NBCP') || (upper.includes('NATIONAL BUILDING CODE') && !upper.includes('APPLICATION'))) {
    return { type: 'LawCallout', code: 'nbcp', title: extractTitleFromLine(line) }
  }
  if (upper.includes('RA 9514') || upper.includes('FIRE CODE OF THE PHILIPPINES')) {
    return { type: 'LawCallout', code: 'ra9514', title: extractTitleFromLine(line) }
  }
  if (/\bBP 220\b/.test(upper) || /\bBP220\b/.test(upper)) {
    return { type: 'LawCallout', code: 'bp220' }
  }
  if (/\bPD 957\b/.test(upper) || /\bPD957\b/.test(upper)) {
    return { type: 'LawCallout', code: 'pd957' }
  }
  if (/\bIRR\b/.test(upper) && !upper.includes('ERROR') && upper.startsWith('**IRR')) {
    return { type: 'LawCallout', code: 'irr' }
  }

  return null
}

function extractTitleFromLine(line: string): string | undefined {
  // Extract title after em-dash: "**TRAP ALERT — The Title:**"
  const dashMatch = line.match(/[—–]\s*([^*\n]{3,80})/)
  if (dashMatch) {
    return dashMatch[1].replace(/\*+/g, '').replace(/:+$/, '').trim()
  }
  return undefined
}

function extractSection(line: string): string | undefined {
  const match = line.match(/Sec(?:tion)?\.?\s*([\d.]+[a-z]?)/i)
  return match ? `Sec. ${match[1]}` : undefined
}

function escapeAttr(str: string): string {
  return str.replace(/"/g, '&quot;').replace(/\\/g, '\\\\')
}

function renderComponent(classification: CalloutComponent, body: string): string {
  // Ensure body has surrounding blank lines for MDX block parsing
  const inner = `\n\n${body}\n\n`

  switch (classification.type) {
    case 'Note':
      return `<Note>${inner}</Note>`
    case 'Warn':
      return `<Warn>${inner}</Warn>`
    case 'Tip':
      return `<Tip>${inner}</Tip>`
    case 'Example':
      return `<Example>${inner}</Example>`
    case 'ExamTip':
      return classification.title
        ? `<ExamTip title="${escapeAttr(classification.title)}">${inner}</ExamTip>`
        : `<ExamTip>${inner}</ExamTip>`
    case 'Callout': {
      const varAttr = ` variant="${classification.variant}"`
      const titleAttr = classification.title ? ` title="${escapeAttr(classification.title)}"` : ''
      return `<Callout${varAttr}${titleAttr}>${inner}</Callout>`
    }
    case 'LawCallout': {
      const codeAttr = ` code="${classification.code}"`
      const sectionAttr = classification.section ? ` section="${escapeAttr(classification.section)}"` : ''
      const titleAttr = classification.title ? ` title="${escapeAttr(classification.title)}"` : ''
      return `<LawCallout${codeAttr}${sectionAttr}${titleAttr}>${inner}</LawCallout>`
    }
  }
}

/**
 * Transforms markdown blockquote blocks into MDX wiki components.
 * Uses a line-by-line state machine to collect consecutive `>` lines
 * into blocks, then classifies and converts them.
 */
function transformBlockquotes(content: string): string {
  const lines = content.split('\n')
  const output: string[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    // Detect start of blockquote block
    if (line.startsWith('> ') || line === '>') {
      // Collect all consecutive blockquote lines
      const bqLines: string[] = []
      while (i < lines.length && (lines[i].startsWith('> ') || lines[i] === '>')) {
        bqLines.push(lines[i].startsWith('> ') ? lines[i].slice(2) : '')
        i++
      }

      const firstLine = bqLines[0] ?? ''
      const classification = classifyFirstLine(firstLine)

      if (classification) {
        // Extract body: skip the header line, collect the rest
        // If there's meaningful content on the header line after the keyword, include it
        const headerTextAfterKeyword = firstLine
          .replace(/^\*{0,2}(TRAP ALERT|EXAM TIP|MNEMONIC|MEMORY AID|VERSION ALERT|REASON FOR THE LAW|WHY THIS RULE|RATIONALE|WARNING|WARN|NOTE|TIP|QUICK TIP|EXAMPLE|WORKED EXAMPLE|BP 344|BP344|PD 1096|NBCP|RA 9514|FIRE CODE|BP 220|BP220|PD 957|PD957|IRR)[^—–:]*[—–:]?\s*/i, '')
          .replace(/\*+/g, '')
          .replace(/:+$/, '')
          .trim()

        const bodyLines = bqLines.slice(1)
        if (headerTextAfterKeyword && headerTextAfterKeyword.length > 3) {
          bodyLines.unshift(headerTextAfterKeyword)
        }

        const body = bodyLines.join('\n').trim()

        if (body.length > 0) {
          output.push(renderComponent(classification, body))
        } else {
          // No body — keep as original blockquote
          output.push(...bqLines.map(l => (l ? `> ${l}` : '>')))
        }
      } else {
        // Unclassified — keep as original blockquote
        output.push(...bqLines.map(l => (l ? `> ${l}` : '>')))
      }
    } else {
      output.push(line)
      i++
    }
  }

  return output.join('\n')
}

// ─── Metadata Extraction ─────────────────────────────────────────────────────

interface ArticleMetadata {
  title: string
  slug: string
  difficulty_label: 'Foundational' | 'Intermediate' | 'Advanced'
  ale_tests_you: string | null
  updated_note: string | null
  subject_label: string
  read_time: string
}

function extractMetadata(rawContent: string, fileName: string, folderName: string): ArticleMetadata {
  // Title: first H1
  const h1Match = rawContent.match(/^#\s+(.+)/m)
  const title = h1Match
    ? h1Match[1].replace(/\*+/g, '').replace(/_+/g, '').trim()
    : fileName.replace(/\.md$/, '')

  // Slug: kebab-case from filename
  const slug = fileName
    .replace(/\.md$/, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

  // Difficulty: scan for star ratings or text labels
  let difficulty_label: 'Foundational' | 'Intermediate' | 'Advanced' = 'Intermediate'
  if (rawContent.match(/★{4,5}/) || rawContent.match(/difficulty[:\s]*advanced/i)) {
    difficulty_label = 'Advanced'
  } else if (rawContent.match(/★★☆|★★[^★]/) || rawContent.match(/difficulty[:\s]*foundational/i)) {
    difficulty_label = 'Foundational'
  }
  // ★★★ with no 4th star → Intermediate (default already set)

  // ale_tests_you: first paragraph after the H1
  let ale_tests_you: string | null = null
  const contentAfterH1 = rawContent.replace(/^#[^\n]+\n+/, '')
  // Find first non-empty line that's not a heading, HR, or tag
  const firstParaLines: string[] = []
  for (const line of contentAfterH1.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#') || trimmed === '---' || trimmed.startsWith('_')) continue
    if (trimmed.startsWith('|') || trimmed.startsWith('>') || trimmed.startsWith('!')) break
    firstParaLines.push(trimmed)
    // Stop at end of paragraph
    if (firstParaLines.length > 0 && line === '') break
  }
  if (firstParaLines.length > 0) {
    const raw = firstParaLines.join(' ').replace(/\*+/g, '').replace(/_+/g, '').trim()
    ale_tests_you = raw.length > 200 ? raw.substring(0, 197) + '...' : raw || null
  }

  // updated_note: law + year reference
  let updated_note: string | null = null
  const lawYearMatch = rawContent.match(
    /(BP\s*344|PD\s*1096|RA\s*9514|RA\s*9266|RA\s*9442|BP\s*220|PD\s*957)\s*[-–—]?\s*(\d{4})\s*(IRR|Revised|Edition|Guidelines|Implementing)?/i
  )
  if (lawYearMatch) {
    const law = lawYearMatch[1].replace(/\s+/, ' ')
    const year = lawYearMatch[2]
    const qualifier = lawYearMatch[3] ? ` ${lawYearMatch[3]}` : ''
    updated_note = `${law} — ${year}${qualifier}`
  }

  // subject_label
  const subject_label = FOLDER_TO_SUBJECT_LABEL[folderName] ?? ''

  // read_time
  const wordCount = rawContent.split(/\s+/).filter(Boolean).length
  const minutes = Math.max(1, Math.round(wordCount / 200))
  const read_time = `~${minutes} min`

  return { title, slug, difficulty_label, ale_tests_you, updated_note, subject_label, read_time }
}

// ─── Slug Deduplication ───────────────────────────────────────────────────────

function deduplicateSlug(slug: string, existingSlugs: Set<string>): string {
  if (!existingSlugs.has(slug)) return slug
  let counter = 2
  while (existingSlugs.has(`${slug}-${counter}`)) counter++
  return `${slug}-${counter}`
}

// ─── Main ─────────────────────────────────────────────────────────────────────

interface UploadResult {
  file: string
  folder: string
  articleId?: string
  slug?: string
  nodeName?: string
  status: 'success' | 'skipped' | 'error'
  error?: string
}

async function main() {
  console.log('🚀 SlateCamp Article Upload Script')
  console.log('=====================================\n')

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
    console.error('❌ Failed to load taxonomy nodes:', nodesError.message)
    process.exit(1)
  }

  const nodeMap = new Map<string, string>()
  for (const node of nodes ?? []) {
    nodeMap.set((node.name as string).toLowerCase().trim(), node.node_id as string)
  }
  console.log(`   ✓ Loaded ${nodeMap.size} taxonomy nodes\n`)

  // 2. Fetch existing slugs to avoid collisions
  console.log('🔍 Fetching existing article slugs...')
  const { data: existingArticles } = await supabase.from('wiki_articles').select('slug')
  const existingSlugs = new Set<string>((existingArticles ?? []).map((a: any) => a.slug as string))
  console.log(`   ✓ ${existingSlugs.size} existing articles found\n`)

  // 3. Verify Missing Articles directory exists
  if (!fs.existsSync(MISSING_ARTICLES_DIR)) {
    console.error(`❌ "Missing Articles" directory not found at:\n   ${MISSING_ARTICLES_DIR}`)
    process.exit(1)
  }

  // 4. Process each folder
  const results: UploadResult[] = []

  const folders = fs
    .readdirSync(MISSING_ARTICLES_DIR)
    .filter(f => fs.statSync(path.join(MISSING_ARTICLES_DIR, f)).isDirectory())
    .sort()

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
      const result: UploadResult = { file: fileName, folder: folderName, status: 'error' }

      try {
        const rawContent = fs.readFileSync(filePath, 'utf-8')

        // Resolve taxonomy node
        let nodeName: string
        if (nodeTarget === 'MULTI') {
          nodeName = resolveMultiNode(fileName, rawContent.substring(0, 500))
        } else {
          nodeName = nodeTarget
        }

        const nodeId = nodeMap.get(nodeName.toLowerCase().trim())
        if (!nodeId) {
          throw new Error(`Taxonomy node not found: "${nodeName}"`)
        }

        // Transform content pipeline
        const escaped = escapeMdx(rawContent)
        const transformed = transformBlockquotes(escaped)

        // Extract metadata
        const meta = extractMetadata(rawContent, fileName, folderName)

        // Skip if already uploaded (idempotent re-runs)
        if (existingSlugs.has(meta.slug)) {
          result.status = 'skipped'
          result.slug = meta.slug
          console.log(`   ↷ ${fileName} (already uploaded, skipping)`)
          results.push(result)
          continue
        }

        // Deduplicate slug (handles edge cases beyond the base slug)
        const slug = deduplicateSlug(meta.slug, existingSlugs)
        existingSlugs.add(slug) // reserve for subsequent files in this run

        // Build insert payload (only include optional fields if non-null)
        const payload: Record<string, unknown> = {
          title: meta.title,
          slug,
          content: transformed,
          status: 'draft',
          subject_label: meta.subject_label,
          difficulty_label: meta.difficulty_label,
          read_time: meta.read_time,
        }
        if (meta.ale_tests_you) payload.ale_tests_you = meta.ale_tests_you
        if (meta.updated_note) payload.updated_note = meta.updated_note

        // Insert article
        const { data: newArticle, error: articleError } = await supabase
          .from('wiki_articles')
          .insert([payload])
          .select('article_id')
          .single()

        if (articleError) throw new Error(`DB insert: ${articleError.message}`)

        // Insert taxonomy mapping
        const { error: taxError } = await supabase
          .from('wiki_article_taxonomy')
          .insert({ article_id: newArticle.article_id, node_id: nodeId, is_primary: true })

        if (taxError) throw new Error(`Taxonomy link: ${taxError.message}`)

        result.status = 'success'
        result.articleId = newArticle.article_id as string
        result.slug = slug
        result.nodeName = nodeName
        console.log(`   ✓ ${fileName}`)
        console.log(`     → slug: ${slug}`)
        console.log(`     → node: ${nodeName}`)
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err)
        result.error = message
        console.error(`   ✗ ${fileName}: ${message}`)
      }

      results.push(result)
    }

    console.log()
  }

  // 5. Final summary report
  const succeeded = results.filter(r => r.status === 'success')
  const skipped = results.filter(r => r.status === 'skipped')
  const failed = results.filter(r => r.status === 'error')

  console.log('═══════════════════════════════════════════')
  console.log('📊 UPLOAD SUMMARY')
  console.log('═══════════════════════════════════════════')
  console.log(`✓ ${succeeded.length} articles uploaded successfully`)
  if (skipped.length > 0) console.log(`↷ ${skipped.length} articles skipped (already uploaded)`)

  if (failed.length > 0) {
    console.log(`✗ ${failed.length} failed:\n`)
    for (const f of failed) {
      console.log(`   [${f.folder}]`)
      console.log(`   File: ${f.file}`)
      console.log(`   Error: ${f.error}\n`)
    }
  }

  console.log()
  if (failed.length === 0) {
    console.log('🎉 All articles uploaded successfully!')
    console.log('   Next step: review in /admin/articles and publish when ready.')
  } else {
    console.log('⚠️  Some articles failed. Review errors above.')
    process.exit(1)
  }
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
