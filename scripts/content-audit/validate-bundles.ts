#!/usr/bin/env bun
import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import {
  ArticleMetadata,
  DiffReport,
  HASH_ALGORITHM,
  UiBlocksFile,
  discoverArticleDirs,
  findPlaceholders,
  normalizeUiBlockId,
  parseArgs,
  readSyncState,
  resolveExportRoot,
  sha256,
  writeJson,
} from './lib'

interface ArticleValidationReport {
  article_id: string | null
  slug: string | null
  folder: string
  valid: boolean
  blockers: string[]
  warnings: string[]
  files: Record<string, boolean>
  hashes: Record<string, string | null>
}

interface ValidationReport {
  generated_at: string
  input: string
  article_count: number
  valid: boolean
  blockers: string[]
  warnings: string[]
  articles: ArticleValidationReport[]
}

async function main() {
  const options = parseArgs()
  const root = resolveExportRoot(options.input)
  const articleDirs = discoverArticleDirs(root, options)
  const report: ValidationReport = {
    generated_at: new Date().toISOString(),
    input: root,
    article_count: articleDirs.length,
    valid: false,
    blockers: [],
    warnings: [],
    articles: [],
  }

  if (!existsSync(path.join(root, 'manifest.json'))) report.warnings.push('manifest.json is missing.')
  else await validateManifest(root, report)
  if (!existsSync(path.join(root, 'export-summary.json'))) report.warnings.push('export-summary.json is missing.')
  if (!existsSync(path.join(root, 'sync-state.json'))) report.blockers.push('sync-state.json is missing.')
  if (articleDirs.length === 0) report.blockers.push('No article bundles matched the requested filters.')

  const syncState = existsSync(path.join(root, 'sync-state.json')) ? await readSyncState(root) : null

  for (const articleDir of articleDirs) {
    const articleReport = await validateArticleBundle(root, articleDir, syncState)
    report.articles.push(articleReport)
    for (const blocker of articleReport.blockers) report.blockers.push(`${articleReport.folder}: ${blocker}`)
    for (const warning of articleReport.warnings) report.warnings.push(`${articleReport.folder}: ${warning}`)
  }

  report.article_count = report.articles.length
  report.valid = report.blockers.length === 0

  if (!options.dryRun) await writeJson(path.join(root, 'validation-report.json'), report)
  if (options.json || options.summary) console.log(JSON.stringify(report, null, 2))
  else {
    console.log(`${report.valid ? '✓' : '✗'} validate ${report.article_count} article bundle(s): blockers=${report.blockers.length} warnings=${report.warnings.length}`)
    for (const blocker of report.blockers.slice(0, 20)) console.error(`BLOCKER ${blocker}`)
    for (const warning of report.warnings.slice(0, 20)) console.warn(`WARN ${warning}`)
  }

  if (report.blockers.length > 0) process.exit(1)
}

async function validateArticleBundle(root: string, articleDir: string, syncState: Awaited<ReturnType<typeof readSyncState>> | null): Promise<ArticleValidationReport> {
  const folder = path.relative(path.join(root, 'articles'), articleDir) || path.basename(articleDir)
  const files = {
    metadata: existsSync(path.join(articleDir, 'article-metadata.json')),
    original: existsSync(path.join(articleDir, 'original.md')),
    normalized: existsSync(path.join(articleDir, 'normalized.md')),
    uiBlocks: existsSync(path.join(articleDir, 'ui-blocks.json')),
    parserErrors: existsSync(path.join(articleDir, 'parser-errors.json')),
    uiBlockEdits: existsSync(path.join(articleDir, 'ui-block-edits.json')),
    linkedQuestions: existsSync(path.join(articleDir, 'linked-questions.json')),
    sources: existsSync(path.join(articleDir, 'sources.json')),
    taxonomy: existsSync(path.join(articleDir, 'taxonomy.json')),
    componentUsage: existsSync(path.join(articleDir, 'component-usage.json')),
    candidate: existsSync(path.join(articleDir, 'candidate.md')),
    diffReport: existsSync(path.join(articleDir, 'diff-report.json')),
    diffReportMarkdown: existsSync(path.join(articleDir, 'diff-report.md')),
    pushReport: existsSync(path.join(articleDir, 'push-report.json')),
    pushResult: existsSync(path.join(articleDir, 'push-result.json')),
  }
  const blockers: string[] = []
  const warnings: string[] = []
  const hashes: Record<string, string | null> = {
    original: null,
    normalized: null,
    candidate: null,
    ui_blocks: null,
  }

  if (!files.metadata) blockers.push('article-metadata.json is missing.')
  if (!files.original) blockers.push('original.md is missing.')
  if (!files.linkedQuestions) blockers.push('linked-questions.json is missing.')
  if (!files.sources) blockers.push('sources.json is missing.')
  if (!files.taxonomy) blockers.push('taxonomy.json is missing.')
  if (blockers.length > 0) {
    return { article_id: null, slug: null, folder, valid: false, blockers, warnings, files, hashes }
  }

  const metadata = JSON.parse(await readFile(path.join(articleDir, 'article-metadata.json'), 'utf-8')) as ArticleMetadata
  if (metadata.hash_algorithm !== HASH_ALGORITHM) warnings.push(`article-metadata.json hash_algorithm is ${metadata.hash_algorithm ?? 'missing'}; expected ${HASH_ALGORITHM}.`)
  const original = await readFile(path.join(articleDir, 'original.md'), 'utf-8')
  hashes.original = sha256(original)
  if (hashes.original !== metadata.original_content_hash && hashes.original !== metadata.content_hash) {
    blockers.push('original.md hash does not match article metadata content hash.')
  }
  const linkedQuestions = JSON.parse(await readFile(path.join(articleDir, 'linked-questions.json'), 'utf-8')) as { linked_questions_hash?: string }
  const sources = JSON.parse(await readFile(path.join(articleDir, 'sources.json'), 'utf-8')) as { sources_hash?: string }
  if (!metadata.linked_questions_hash) warnings.push('article-metadata.json is missing linked_questions_hash.')
  if (!metadata.sources_hash) warnings.push('article-metadata.json is missing sources_hash.')
  if (metadata.linked_questions_hash && linkedQuestions.linked_questions_hash && metadata.linked_questions_hash !== linkedQuestions.linked_questions_hash) {
    blockers.push('linked-questions.json hash does not match article metadata linked_questions_hash.')
  }
  if (metadata.sources_hash && sources.sources_hash && metadata.sources_hash !== sources.sources_hash) {
    blockers.push('sources.json hash does not match article metadata sources_hash.')
  }

  const syncEntry = syncState?.articles[metadata.article_id]
  if (!syncEntry) warnings.push('sync-state.json has no entry for this article.')
  else {
    if (syncEntry.folder !== folder) warnings.push(`sync-state folder points to ${syncEntry.folder}.`)
    if (syncEntry.original_hash !== hashes.original) blockers.push('sync-state original_hash does not match original.md.')
  }

  if (files.normalized) {
    const normalized = await readFile(path.join(articleDir, 'normalized.md'), 'utf-8')
    hashes.normalized = sha256(normalized)
    if (!files.uiBlocks) blockers.push('normalized.md exists but ui-blocks.json is missing.')
    if (files.uiBlocks) {
      const uiBlocks = JSON.parse(await readFile(path.join(articleDir, 'ui-blocks.json'), 'utf-8')) as UiBlocksFile
      hashes.ui_blocks = uiBlocks.ui_blocks_hash
      if (uiBlocks.original_content_hash !== hashes.original) blockers.push('ui-blocks.json original_content_hash does not match original.md.')
      if (uiBlocks.normalized_content_hash !== hashes.normalized) blockers.push('ui-blocks.json normalized_content_hash does not match normalized.md.')
      const placeholders = findPlaceholders(normalized)
      const blockIds = new Set(uiBlocks.blocks.flatMap((block) => [block.block_id, normalizeUiBlockId(block.block_id)]))
      for (const placeholder of placeholders) {
        if (!blockIds.has(placeholder.blockId) && !blockIds.has(normalizeUiBlockId(placeholder.blockId))) blockers.push(`normalized.md has unresolved placeholder ${placeholder.blockId}.`)
      }
      for (const block of uiBlocks.blocks) {
        if (!normalized.includes(block.placeholder)) warnings.push(`normalized.md no longer contains placeholder for ${block.block_id}; candidate must be recomposed before push.`)
      }
      if ((uiBlocks.unknown_blocks.length > 0 || uiBlocks.unresolved_critical_blocks.length > 0) && !files.parserErrors) {
        blockers.push('parser-errors.json is missing for a bundle with parser warnings/errors.')
      }
      if (!files.uiBlockEdits) warnings.push('ui-block-edits.json has not been generated for this article yet.')
    }
  } else if (files.uiBlocks) {
    blockers.push('ui-blocks.json exists but normalized.md is missing.')
  }

  if (files.candidate) {
    const candidate = await readFile(path.join(articleDir, 'candidate.md'), 'utf-8')
    hashes.candidate = sha256(candidate)
    if (candidate.includes('[SLATECAMP_UI_BLOCK:')) blockers.push('candidate.md contains unresolved UI block placeholders.')
    if (files.uiBlocks) {
      const uiBlocks = JSON.parse(await readFile(path.join(articleDir, 'ui-blocks.json'), 'utf-8')) as UiBlocksFile
      const missingBlocks = uiBlocks.blocks.filter((block) => !candidate.includes(block.raw))
      if (missingBlocks.length > 0) blockers.push(`candidate.md is missing ${missingBlocks.length} preserved UI block(s).`)
    }
    if (files.diffReport) {
      const diffReport = JSON.parse(await readFile(path.join(articleDir, 'diff-report.json'), 'utf-8')) as DiffReport
      if (diffReport.candidate_hash !== hashes.candidate) blockers.push('diff-report.json candidate_hash does not match candidate.md.')
      if (!files.diffReportMarkdown) warnings.push('diff-report.md has not been generated for this article yet.')
    } else {
      warnings.push('candidate.md exists but diff-report.json is missing.')
    }
  }

  if (files.diffReport && !files.candidate) blockers.push('diff-report.json exists but candidate.md is missing.')
  if (files.pushReport && !files.pushResult) warnings.push('push-result.json alias is missing for an existing push-report.json.')
  if (!files.componentUsage) warnings.push('component-usage.json has not been generated for this article yet.')

  return {
    article_id: metadata.article_id,
    slug: metadata.slug,
    folder,
    valid: blockers.length === 0,
    blockers,
    warnings,
    files,
    hashes,
  }
}

async function validateManifest(root: string, report: ValidationReport) {
  const manifest = JSON.parse(await readFile(path.join(root, 'manifest.json'), 'utf-8')) as Record<string, unknown>
  for (const key of ['export_version', 'export_run_id', 'generated_at', 'hash_algorithm', 'articles']) {
    if (!(key in manifest)) report.blockers.push(`manifest.json is missing ${key}.`)
  }
  if (manifest.hash_algorithm !== HASH_ALGORITHM) report.blockers.push(`manifest.json hash_algorithm is ${String(manifest.hash_algorithm)}; expected ${HASH_ALGORITHM}.`)
  if (!Array.isArray(manifest.articles)) report.blockers.push('manifest.json articles must be an array.')
  if (Array.isArray(manifest.articles)) {
    for (const article of manifest.articles as Array<Record<string, unknown>>) {
      const label = String(article.article_id ?? article.slug ?? 'unknown article')
      if (!article.folder) report.blockers.push(`manifest.json article ${label} is missing folder.`)
      if (article.linked_question_count == null) report.blockers.push(`manifest.json article ${label} is missing linked_question_count.`)
    }
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
