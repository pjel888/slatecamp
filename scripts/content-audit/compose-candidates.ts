#!/usr/bin/env bun
import path from 'node:path'
import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import {
  ArticleMetadata,
  UiBlocksFile,
  buildComposeErrorFile,
  composeCandidate,
  createExportId,
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
  let processed = 0
  let errorCount = 0

  for (const articleDir of articleDirs) {
    try {
      const normalizedPath = path.join(articleDir, 'normalized.md')
      const originalPath = path.join(articleDir, 'original.md')
      const uiBlocksPath = path.join(articleDir, 'ui-blocks.json')
      const candidatePath = path.join(articleDir, 'candidate.md')
      const metadataPath = path.join(articleDir, 'article-metadata.json')
      if (!existsSync(normalizedPath)) throw new Error('normalized.md missing')
      if (!existsSync(uiBlocksPath)) throw new Error('ui-blocks.json missing')
      if (existsSync(candidatePath) && !options.overwrite) {
        console.log(`↷ skip ${articleDir}: candidate.md exists; pass --overwrite`)
        continue
      }
      const normalized = await readFile(normalizedPath, 'utf-8')
      const original = existsSync(originalPath) ? await readFile(originalPath, 'utf-8') : null
      const uiBlocks = JSON.parse(await readFile(uiBlocksPath, 'utf-8')) as UiBlocksFile
      const metadata = JSON.parse(await readFile(metadataPath, 'utf-8')) as ArticleMetadata
      const { candidate, report } = composeCandidate({ normalized, uiBlocks, original })
      if (!options.dryRun) {
        await writeJson(path.join(articleDir, 'compose-report.json'), report)
        if (report.blockers.length > 0) {
          await writeJson(path.join(articleDir, 'compose-error.json'), buildComposeErrorFile({ articleId: uiBlocks.article_id, slug: uiBlocks.slug, report }))
        } else {
          metadata.candidate_content_hash = report.candidate_hash
          await writeText(candidatePath, candidate)
          await writeJson(metadataPath, metadata)
          await updateArticleSyncState(root, articleDir, metadata, {
            candidate_hash: report.candidate_hash,
            sync_status: 'candidate_ready',
          })
        }
      }
      if (report.blockers.length && options.strict) throw new Error(report.blockers.join('; '))
      processed += 1
      console.log(`${options.dryRun ? 'DRY' : '✓'} compose ${uiBlocks.article_id}: ${report.candidate_matches_original ? 'matches original' : 'changed'}; blockers=${report.blockers.length}`)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      errorCount += 1
      if (!options.dryRun) {
        try {
          const metadataPath = path.join(articleDir, 'article-metadata.json')
          const metadata = existsSync(metadataPath) ? JSON.parse(await readFile(metadataPath, 'utf-8')) as ArticleMetadata : null
          await writeJson(path.join(articleDir, 'compose-error.json'), buildComposeErrorFile({
            articleId: metadata?.article_id ?? null,
            slug: metadata?.slug ?? null,
            error,
          }))
        } catch {
          // Best-effort sidecar; keep the original compose error visible.
        }
      }
      console.error(`✗ compose ${articleDir}: ${message}`)
      if (options.strict) throw error
    }
  }
  if (!options.dryRun) {
    await writeRunLog(root, runId, {
      command: 'content-audit:compose',
      started_at: startedAt,
      completed_at: nowIso(),
      processed,
      error_count: errorCount,
      status: errorCount > 0 ? 'completed_with_errors' : 'completed',
    })
  }
  console.log(`Composed ${processed} candidate(s)`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
