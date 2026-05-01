#!/usr/bin/env bun
import path from 'node:path'
import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import {
  ArticleMetadata,
  UiBlocksFile,
  buildDiffMarkdown,
  createExportId,
  diffCandidate,
  discoverArticleDirs,
  nowIso,
  parseArgs,
  resolveExportRoot,
  updateArticleSyncState,
  writeJson,
  writeRunLog,
  writeText,
} from './lib'

async function main() {
  const options = parseArgs()
  const root = resolveExportRoot(options.input)
  const runId = createExportId()
  const startedAt = nowIso()
  const articleDirs = discoverArticleDirs(root, options)
  const summaries = []
  let errorCount = 0

  for (const articleDir of articleDirs) {
    try {
      const metadata = JSON.parse(await readFile(path.join(articleDir, 'article-metadata.json'), 'utf-8')) as ArticleMetadata
      const originalPath = path.join(articleDir, 'original.md')
      const candidatePath = path.join(articleDir, 'candidate.md')
      const normalizedPath = path.join(articleDir, 'normalized.md')
      const uiBlocksPath = path.join(articleDir, 'ui-blocks.json')
      if (!existsSync(originalPath)) throw new Error('original.md missing')
      if (!existsSync(candidatePath)) throw new Error('candidate.md missing')
      const original = await readFile(originalPath, 'utf-8')
      const candidate = await readFile(candidatePath, 'utf-8')
      const normalized = existsSync(normalizedPath) ? await readFile(normalizedPath, 'utf-8') : null
      const uiBlocks = existsSync(uiBlocksPath) ? JSON.parse(await readFile(uiBlocksPath, 'utf-8')) as UiBlocksFile : null
      const report = diffCandidate({ metadata, original, normalized, candidate, uiBlocks })
      if (!options.dryRun) {
        await writeJson(path.join(articleDir, 'diff-report.json'), report)
        await writeText(path.join(articleDir, 'diff-report.md'), buildDiffMarkdown(report))
        await updateArticleSyncState(root, articleDir, metadata, {
          candidate_hash: report.candidate_hash,
          last_diff_at: report.generated_at,
          sync_status: report.safe_to_push ? 'candidate_ready' : 'error',
        })
      }
      summaries.push({ article_id: report.article_id, slug: report.slug, changed: report.changed, safe_to_push: report.safe_to_push, blockers: report.blockers })
      console.log(`${options.dryRun ? 'DRY' : '✓'} diff ${report.article_id}: changed=${report.changed} safe=${report.safe_to_push}`)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      errorCount += 1
      console.error(`✗ diff ${articleDir}: ${message}`)
      if (options.strict) throw error
    }
  }

  if (!options.dryRun) {
    await writeRunLog(root, runId, {
      command: 'content-audit:diff',
      started_at: startedAt,
      completed_at: nowIso(),
      processed: summaries.length,
      error_count: errorCount,
      status: errorCount > 0 ? 'completed_with_errors' : 'completed',
    })
  }
  if (options.json || options.summary) console.log(JSON.stringify(summaries, null, 2))
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
