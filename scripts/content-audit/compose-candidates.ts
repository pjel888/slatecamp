#!/usr/bin/env bun
import path from 'node:path'
import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import {
  ArticleMetadata,
  UiBlocksFile,
  composeCandidate,
  discoverArticleDirs,
  parseArgs,
  resolveExportRoot,
  updateArticleSyncState,
  writeJson,
  writeText,
} from './lib'

async function main() {
  const options = parseArgs()
  const root = resolveExportRoot(options.input)
  const articleDirs = discoverArticleDirs(root, options)
  let processed = 0

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
      metadata.candidate_content_hash = report.candidate_hash
      if (report.blockers.length && options.strict) throw new Error(report.blockers.join('; '))
      if (!options.dryRun) {
        await writeText(candidatePath, candidate)
        await writeJson(path.join(articleDir, 'compose-report.json'), report)
        await writeJson(metadataPath, metadata)
        await updateArticleSyncState(root, articleDir, metadata, {
          candidate_hash: report.candidate_hash,
          sync_status: report.safe_to_diff ? 'candidate_ready' : 'error',
        })
      }
      processed += 1
      console.log(`${options.dryRun ? 'DRY' : '✓'} compose ${uiBlocks.article_id}: ${report.candidate_matches_original ? 'matches original' : 'changed'}; blockers=${report.blockers.length}`)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      console.error(`✗ compose ${articleDir}: ${message}`)
      if (options.strict) throw error
    }
  }
  console.log(`Composed ${processed} candidate(s)`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
